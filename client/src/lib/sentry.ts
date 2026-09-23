/**
 * Sentry 錯誤監控初始化
 *
 * 為什麼：v3.6.4 「設備只有 1 筆」這種隱性 bug，console.warn 沒人看到。
 *        Sentry 自動收集所有錯誤、效能與 console.warn 流量，類似錯誤暴增時告警。
 *
 * 設定：
 *   - DSN 從 VITE_SENTRY_DSN 讀（沒設就完全 noop，不影響本地開發）
 *   - 生產環境才啟用（dev mode 不送，避免測試誤觸）
 *   - tracesSampleRate 0.1（10% 抽樣）+ replaysSessionSampleRate 0.05（5% 錄影）
 *   - 自動捕捉 unhandledrejection、未捕獲 error、console.error/warn
 *
 * 延後載入（2026-09-23）：@sentry/react（含 replay）約佔主 bundle 一半，
 *   改成頁面 load 後閒置時才動態 import；沒設 DSN 時完全不下載。
 *   載入前發生的錯誤先暫存在 pending，Sentry 就緒後補送，不會漏掉進站頭幾秒的錯誤。
 *
 * 用法：
 *   import { initSentry, captureException, addBreadcrumb } from '@/lib/sentry';
 *   initSentry();   // 在 main.tsx 最早呼叫
 *   captureException(err);
 */

type SentryModule = typeof import('@sentry/react');

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
  // 其中有刻意製造失敗的測試，不能讓它們進正式 Sentry、吃掉錄影額度
  if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname)) {
    console.info('[Sentry] 本機網址，跳過初始化');
    return;
  }

  scheduled = true;
  window.addEventListener('error', onEarlyError);

  const load = async () => {
    try {
      const Sentry = await import('@sentry/react');
      Sentry.init({
        dsn,
        release: `akai@${release}`,
        environment: 'production',

        // 整合：browser tracing + session replay + console capture
        integrations: [
          Sentry.browserTracingIntegration(),
          Sentry.replayIntegration({
            maskAllText: false,
            blockAllMedia: false,
          }),
          Sentry.captureConsoleIntegration({
            levels: ['error', 'warn'], // 把 console.warn 也送過去 — 抓隱性 bug 的關鍵
          }),
        ],

        // 抽樣率（控制成本）
        tracesSampleRate: 0.1, // 10% 效能追蹤
        replaysSessionSampleRate: 0.05, // 5% 一般 session 錄影
        replaysOnErrorSampleRate: 1.0, // 出錯時 100% 錄影（事後可重播）；延後載入後才開始錄

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
          return event;
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
