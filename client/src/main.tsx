import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from './App';
import "./index.css";
import "./styles/tokens.css";
import "./styles/keyframes.css";
import "./styles/loading-progress.css";
import "./styles/sticky-search.css";
import "./styles/blog-article.css";
import { registerServiceWorker } from "./serviceWorkerRegistration"; // Added import
import { initSentry, captureException } from "./lib/sentry";
import { shouldReportErrorToFirestore } from './lib/errorReporting';
import { installStaleChunkRecovery, isChunkLoadError, removeLegacyHealParam } from './lib/chunkRecovery';

// ── 🛟 PWA chunk 404 自動 self-heal ─────────────────────────────────
// 場景：deploy 換新 chunk hash 後，舊分頁/舊 HTML 仍引用已被新 build 蓋掉的 chunk → 404
// 策略：與 App / ErrorBoundary 共用 chunkRecovery 額度（每頁一次、每版兩次），
//       保留 SW 與快取直接重新載入；HTML 走 Network First，重載即取得新版入口
installStaleChunkRecovery();
removeLegacyHealParam();

// 最早初始化 Sentry（必須在 createRoot 前）
initSentry();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// 全域非同步錯誤攔截（Sentry 已自動接 + Firestore 記錄保留作為備援）
window.addEventListener('unhandledrejection', async (event) => {
    // chunk 載入失敗已由上方 self-heal 接手（不是 bug），不再記成錯誤、寫進 errorLogs
    if (isChunkLoadError(event.reason?.message || String(event.reason || ''))) return;
    console.error('Unhandled promise rejection:', event.reason);
    captureException(event.reason, { source: 'unhandledrejection' });
    // 本機開發（含 vite HMR 的 WebSocket 斷線）不寫進正式 errorLogs，
    // 否則會誤觸 Google Chat 告警。console.error 上面已經印過了。
    if (!shouldReportErrorToFirestore()) return;
    try {
        const { db, isFirebaseAvailable } = await import('./lib/firebase');
        if (!isFirebaseAvailable() || !db) return;
        const { ensureSignedIn } = await import('./lib/authService');
        if (!await ensureSignedIn()) return;
        const { collection, addDoc } = await import('firebase/firestore');
        await addDoc(collection(db, 'errorLogs'), {
            message: event.reason?.message || String(event.reason),
            name: event.reason?.name ?? null, // event.reason 不一定是 Error 物件，Firestore 不接受 undefined
            stack: event.reason?.stack?.substring(0, 2000),
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            level: 'unhandledrejection',
            // P1-4：告警卡片要顯示「這是哪一版壞的」；走既有的 metadata 欄位，不必動 firestore.rules
            metadata: { appVersion: import.meta.env.VITE_APP_VERSION ?? 'unknown' },
        });
    } catch { /* silently fail */ }
});

// 延遲 Service Worker 註冊，確保不影響首屏 TBT
window.addEventListener('load', () => {
  registerServiceWorker();
  // 真實使用者效能監控（RUM）— 上報 LCP / INP / CLS / FCP / TTFB
  // 同時送 GA (全量) + Firestore (25% 取樣)，不影響首屏 TBT
  import('./lib/analytics').then((m) => m.initWebVitals()).catch(() => { /* noop */ });
});
