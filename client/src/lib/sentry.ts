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
 * 用法：
 *   import { initSentry, captureException, addBreadcrumb } from '@/lib/sentry';
 *   initSentry();   // 在 main.tsx 最早呼叫
 *   captureException(err);
 */

import * as Sentry from '@sentry/react';

let initialized = false;

export function initSentry() {
  if (initialized) return;
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

  try {
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
      replaysOnErrorSampleRate: 1.0, // 出錯時 100% 錄影（事後可重播）

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

    initialized = true;
    console.info(`[Sentry] ✅ 初始化成功（release: akai@${release}）`);
  } catch (err) {
    console.warn('[Sentry] 初始化失敗:', err);
  }
}

/** 手動回報例外（適合 try/catch 區塊） */
export function captureException(err: unknown, context?: Record<string, any>) {
  if (!initialized) return;
  Sentry.captureException(err, context ? { extra: context } : undefined);
}

/** 留下行為麵包屑（追蹤路徑用） */
export function addBreadcrumb(message: string, category = 'app', data?: Record<string, any>) {
  if (!initialized) return;
  Sentry.addBreadcrumb({ message, category, data, level: 'info' });
}

/** 標記目前使用者（匿名身份也可以用 uid 識別） */
export function setUser(user: { id?: string; isAnonymous?: boolean } | null) {
  if (!initialized) return;
  if (!user) {
    Sentry.setUser(null);
  } else {
    Sentry.setUser({
      id: user.id,
      // 不要送 email/name 進 Sentry，保持匿名
      segment: user.isAnonymous ? 'anonymous' : 'authenticated',
    });
  }
}

/** 給 ErrorBoundary 用的 fallback wrapper */
export const SentryErrorBoundary = Sentry.ErrorBoundary;
