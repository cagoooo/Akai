/**
 * sentryClient —— 只匯出 sentry.ts 實際用到的 Sentry API，供動態 import。
 *
 * 直接 `import('@sentry/react')` 會拿到整個命名空間，打包工具無法 tree-shake，
 * replay（rrweb）與 tracing 即使沒啟用也會被打包進去（實測 chunk 470KB）。
 * 經由這支具名匯出，未使用的整合才會被剔除。
 */
export { init, captureConsoleIntegration, captureException, addBreadcrumb, setUser } from '@sentry/react';
