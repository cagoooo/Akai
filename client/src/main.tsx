import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from './App';
import "./index.css";
import "./styles/tokens.css";
import "./styles/keyframes.css";
import { registerServiceWorker } from "./serviceWorkerRegistration"; // Added import

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// 全域非同步錯誤攔截
window.addEventListener('unhandledrejection', async (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    try {
        const { db, isFirebaseAvailable } = await import('./lib/firebase');
        if (!isFirebaseAvailable() || !db) return;
        const { collection, addDoc } = await import('firebase/firestore');
        await addDoc(collection(db, 'errorLogs'), {
            message: event.reason?.message || String(event.reason),
            stack: event.reason?.stack?.substring(0, 2000),
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            level: 'unhandledrejection',
        });
    } catch { /* silently fail */ }
});

// 延遲 Service Worker 註冊，確保不影響首屏 TBT
window.addEventListener('load', () => {
  registerServiceWorker();
});