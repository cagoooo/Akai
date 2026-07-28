/**
 * 錯誤回報守門 — 決定「這顆錯誤該不該寫進 Firestore errorLogs」。
 *
 * 背景（2026-07-28）：在本機跑 `npm run dev` / vite preview 驗證時，
 * Vite HMR 的 WebSocket 斷線會丟出 `WebSocket closed without opened`，
 * 被全域 unhandledrejection 攔到後照樣寫進正式的 errorLogs，
 * 再由 Cloud Function 推 Google Chat 告警 → 開發噪音污染正式告警管線。
 *
 * Sentry 早就有擋本機（見 lib/sentry.ts 的 isDev 判斷），
 * Firestore 這條備援通道漏了同一道守門，這裡補上。
 */

/** 本機開發環境的 hostname（含 vite dev、vite preview、本地 build 預覽） */
function isLocalHost(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    hostname === '::1' ||
    hostname === '0.0.0.0' ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.localhost')
  );
}

/**
 * 是否該把錯誤送進正式的 Firestore errorLogs。
 *
 * 回傳 false 的情境：
 * - Vite dev 模式（import.meta.env.DEV）
 * - 從 localhost / 127.0.0.1 / *.local 開啟（本地 build 預覽也擋掉）
 *
 * 這只擋「寫進正式告警管線」，console.error 仍然照印，本機除錯不受影響。
 */
export function shouldReportErrorToFirestore(): boolean {
  if (typeof window === 'undefined') return false;
  if (import.meta.env.DEV) return false;
  return !isLocalHost(window.location.hostname);
}
