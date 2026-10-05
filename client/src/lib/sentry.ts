/**
 * Sentry 錯誤監控初始化
 *
 * 為什麼：v3.6.4 「設備只有 1 筆」這種隱性 bug，console.warn 沒人看到。
 *        Sentry 自動收集所有錯誤、效能與 console.warn 流量，類似錯誤暴增時告警。
 *
 * 設定：
 *   - DSN 從 VITE_SENTRY_DSN 讀（沒設就完全 noop，不影響本地開發）
 *   - 生產環境才啟用（dev mode 不送，避免測試誤觸）
 *   - 只做錯誤回報（2026-09-23 起不錄影回放、不做效能追蹤）
 *   - 自動捕捉 unhandledrejection、未捕獲 error、console.error/warn
 *
 * 延後載入（2026-09-23）：@sentry/react 若靜態 import 會佔主 bundle 一半，
 *   改成頁面 load 後閒置時才動態 import；沒設 DSN 時完全不下載。
 *   載入前發生的錯誤先暫存在 pending，Sentry 就緒後補送，不會漏掉進站頭幾秒的錯誤。
 *
 * 用法：
 *   import { initSentry, captureException, addBreadcrumb } from '@/lib/sentry';
 *   initSentry();   // 在 main.tsx 最早呼叫
 *   captureException(err);
 */

type SentryModule = typeof import('./sentryClient');
type SentryEvent = import('@sentry/react').ErrorEvent;

/** SDK 已接手的多分頁交接訊息；不匹配權限、IndexedDB 或未處理例外。 */
export function createFirestoreLeaseClassifier(now = () => Date.now()) {
  const occurrences: number[] = [];
  const leaseMessage = /^(?:\[[^\]\r\n]+\]\s+)?@firebase\/firestore:\s+Firestore \(\d+\.\d+\.\d+\): Failed to obtain primary lease for action '(Apply remote event|Backfill Indexes|Collect garbage)'\.$/;
  return (event: SentryEvent): SentryEvent | null => {
    const leaseMatch = event.message?.match(leaseMessage);
    if (event.logger !== 'console' || event.exception?.values?.length || !leaseMatch) return event;
    const action = leaseMatch[1];
    const timestamp = now();
    while (occurrences.length && timestamp - occurrences[0] >= 60_000) occurrences.shift();
    occurrences.push(timestamp);
    // SDK 已接手的正常交接不送進 Sentry；同一頁 60 秒內三次以上才回報為 error。
    if (occurrences.length < 3) return null;
    event.level = 'error';
    event.message = `Firestore multi-tab primary lease changed during '${action}'.`;
    event.fingerprint = ['firestore-primary-lease', action.toLowerCase().replaceAll(' ', '-')];
    event.tags = { ...event.tags, firestoreLease: 'handoff' };
    event.extra = { ...event.extra, leaseOccurrencesInLastMinute: occurrences.length };
    return event;
  };
}

/**
 * 前端會自行復原、或只是訪客網路中斷的事件：不是站方 bug，送進 Sentry 只會觸發告警。
 * - 部署換 chunk hash 後舊分頁載入動態模組 404：main.tsx / App.tsx / ErrorBoundary 會自動重新載入
 * - 裝置離線、休眠或頁面重新載入時中斷連線：Firebase SDK 會自動重連
 * 權限不足、索引錯誤等其他 Firebase 錯誤不在此列，照常回報。
 */
const RECOVERABLE_CLIENT_NOISE: readonly RegExp[] = [
  /Failed to fetch dynamically imported module/i,
  /error loading dynamically imported module/i,
  /Importing a module script failed/i,
  /Unable to preload CSS/i,
  /ChunkLoadError|Loading chunk \d+ failed/i,
  /\(auth\/network-request-failed\)/,
  /@firebase\/firestore:\s+Firestore \(\d+\.\d+\.\d+\): Could not reach Cloud Firestore backend\./,
  /@firebase\/firestore:\s+Firestore \(\d+\.\d+\.\d+\): WebChannelConnection RPC '\w+' stream 0x[0-9a-f]+ transport errored\./,
];

export function isRecoverableClientNoise(event: SentryEvent): boolean {
  const texts = [
    event.message,
    ...(event.exception?.values ?? []).map((value) => `${value.type ?? ''}: ${value.value ?? ''}`),
  ];
  return texts.some((text) => !!text && RECOVERABLE_CLIENT_NOISE.some((pattern) => pattern.test(text)));
}

let sentry: SentryModule | null = null;
let scheduled = false;
const pending: Array<(s: SentryModule) => void> = [];

function whenReady(fn: (s: SentryModule) => void) {
  if (sentry) fn(sentry);
  else if (scheduled && pending.length < 50) pending.push(fn);
}

// Sentry 載入前的全域錯誤：先記下來，就緒後補送（之後由 Sentry 自己的 handler 接手）
function onEarlyError(event: ErrorEvent) {
  const err = event.error ?? event.message;
  whenReady((s) => s.captureException(err, { extra: { source: 'early-window-error' } }));
}

export function initSentry() {
  if (scheduled) return;
  if (typeof window === 'undefined') return;

  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  const isDev = import.meta.env.DEV;
  const release = (import.meta.env.VITE_APP_VERSION as string | undefined) || 'unknown';

  // 沒 DSN 或本地開發就不啟用（保險）
  if (!dsn) {
    console.info('[Sentry] DSN 未設定，跳過初始化（VITE_SENTRY_DSN 環境變數）');
    return;
  }
  if (isDev) {
    console.info('[Sentry] 本地開發模式，跳過初始化');
    return;
  }
  // CI 的 E2E（vite preview）與本機量測跑的是帶 DSN 的正式建置，
  // 其中有刻意製造失敗的測試，不能讓它們進正式 Sentry、吃掉事件額度
  if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname)) {
    console.info('[Sentry] 本機網址，跳過初始化');
    return;
  }

  scheduled = true;
  window.addEventListener('error', onEarlyError);

  const load = async () => {
    try {
      const Sentry = await import('./sentryClient');
      const classifyFirestoreLease = createFirestoreLeaseClassifier();
      Sentry.init({
        dsn,
        release: `akai@${release}`,
        environment: 'production',

        // 只做錯誤回報：2026-09-23 拿掉 session replay 與 browser tracing
        // （錄影器持續記錄 DOM 變動、效能追蹤也吃 CPU，正式站啟用後長任務約翻倍）
        integrations: [
          Sentry.captureConsoleIntegration({
            levels: ['error', 'warn'], // 把 console.warn 也送過去 — 抓隱性 bug 的關鍵
          }),
        ],

        // 攔截一些不重要的雜訊
        ignoreErrors: [
          'ResizeObserver loop limit exceeded',
          'Non-Error promise rejection captured',
          // 第三方腳本錯誤、瀏覽器擴充
          /extension\//i,
          /^chrome-extension:\/\//,
          /^moz-extension:\/\//,
        ],

        // 過濾 referrer 含敏感資訊
        beforeSend(event) {
          // 移除可能含 PII 的欄位
          if (event.request?.cookies) delete event.request.cookies;
          if (isRecoverableClientNoise(event)) return null;
          return classifyFirestoreLease(event);
        },
      });

      sentry = Sentry;
      window.removeEventListener('error', onEarlyError);
      pending.splice(0).forEach((fn) => fn(Sentry));
      console.info(`[Sentry] ✅ 初始化成功（release: akai@${release}）`);
    } catch (err) {
      scheduled = false;
      pending.length = 0;
      window.removeEventListener('error', onEarlyError);
      console.warn('[Sentry] 初始化失敗:', err);
    }
  };

  // 等頁面 load 完、主執行緒閒下來才載入（最多再等 5 秒）
  const idle = () => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(() => void load(), { timeout: 5000 });
    else setTimeout(() => void load(), 2000);
  };
  if (document.readyState === 'complete') idle();
  else window.addEventListener('load', idle, { once: true });
}

/** 手動回報例外（適合 try/catch 區塊） */
export function captureException(err: unknown, context?: Record<string, any>) {
  whenReady((s) => s.captureException(err, context ? { extra: context } : undefined));
}

/** 留下行為麵包屑（追蹤路徑用） */
export function addBreadcrumb(message: string, category = 'app', data?: Record<string, any>) {
  whenReady((s) => s.addBreadcrumb({ message, category, data, level: 'info' }));
}

/** 標記目前使用者（匿名身份也可以用 uid 識別） */
export function setUser(user: { id?: string; isAnonymous?: boolean } | null) {
  whenReady((s) => {
    if (!user) {
      s.setUser(null);
    } else {
      s.setUser({
        id: user.id,
        // 不要送 email/name 進 Sentry，保持匿名
        segment: user.isAnonymous ? 'anonymous' : 'authenticated',
      });
    }
  });
}
