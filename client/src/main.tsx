import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from './App';
import "./index.css";
import "./styles/tokens.css";
import "./styles/keyframes.css";
import "./styles/blog-article.css";
import { registerServiceWorker } from "./serviceWorkerRegistration"; // Added import
import { initSentry, captureException } from "./lib/sentry";

// ── 🛟 PWA chunk 404 自動 self-heal ─────────────────────────────────
// 場景：deploy 換新 chunk hash 後，使用者的舊 SW 給出舊 index.html 引用舊 chunk
//       → 舊 chunk 已被新 build 蓋掉 → 404 → React Suspense 永遠卡 spinner
// 策略：偵測 chunk 載入失敗 → unregister SW + 清所有 cache + reload（1 shot per session）
const SELF_HEAL_FLAG = 'akai-self-heal-attempted-v1';
const CHUNK_404_PATTERNS = [
  /Failed to fetch dynamically imported module/i,
  /Loading chunk \d+ failed/i,
  /error loading dynamically imported module/i,
  /Importing a module script failed/i,
  /Unable to preload CSS/i,
  /ChunkLoadError/i,
];

function looksLikeChunkError(text: string): boolean {
  if (!text) return false;
  return CHUNK_404_PATTERNS.some((re) => re.test(text));
}

async function selfHealStaleCache(reason: string) {
  // 防無限 loop：sessionStorage 每個 tab 獨立，只允許 1 次 / session
  try {
    if (sessionStorage.getItem(SELF_HEAL_FLAG)) {
      console.warn('[self-heal] already attempted this session, skipping to avoid loop. reason:', reason);
      return;
    }
    sessionStorage.setItem(SELF_HEAL_FLAG, String(Date.now()));
  } catch {
    // sessionStorage 不可用就直接跳過（不冒險無限 reload）
    return;
  }
  console.warn('[self-heal] 🛟 偵測到 stale chunk，清 cache + 重新整理。reason:', reason);
  try {
    // 1. unregister 所有 SW
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
  } catch (e) {
    console.warn('[self-heal] unregister SW 失敗', e);
  }
  try {
    // 2. 清所有 cache
    if ('caches' in self) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } catch (e) {
    console.warn('[self-heal] 清 cache 失敗', e);
  }
  // 3. hard reload（query string bust 確保不從 disk cache 拿）
  const url = new URL(window.location.href);
  url.searchParams.set('_heal', String(Date.now()));
  window.location.replace(url.toString());
}

// 攔截 dynamic import 的 promise reject
window.addEventListener('unhandledrejection', (event) => {
  const msg = event.reason?.message || String(event.reason || '');
  if (looksLikeChunkError(msg)) {
    event.preventDefault();
    void selfHealStaleCache(`unhandledrejection: ${msg.slice(0, 200)}`);
  }
});

// 攔截 <script>/<link> 標籤本身 404（capture phase 才抓得到資源錯誤）
window.addEventListener(
  'error',
  (event) => {
    const target = event.target as HTMLElement | null;
    if (!target || target === (window as unknown as HTMLElement)) return;
    const src =
      (target as HTMLScriptElement).src ||
      (target as HTMLLinkElement).href ||
      '';
    if (!src) return;
    // 只處理本站的 assets/*.js / *.css
    if (!src.includes('/assets/') || !/\.(js|css|mjs)(\?|$)/.test(src)) return;
    void selfHealStaleCache(`resource 404: ${src.slice(-80)}`);
  },
  true // capture
);

// 最早初始化 Sentry（必須在 createRoot 前）
initSentry();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// 全域非同步錯誤攔截（Sentry 已自動接 + Firestore 記錄保留作為備援）
window.addEventListener('unhandledrejection', async (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    captureException(event.reason, { source: 'unhandledrejection' });
    try {
        const { db, isFirebaseAvailable } = await import('./lib/firebase');
        if (!isFirebaseAvailable() || !db) return;
        const { ensureSignedIn } = await import('./lib/authService');
        if (!await ensureSignedIn()) return;
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
  // 真實使用者效能監控（RUM）— 上報 LCP / INP / CLS / FCP / TTFB
  // 同時送 GA (全量) + Firestore (25% 取樣)，不影響首屏 TBT
  import('./lib/analytics').then((m) => m.initWebVitals()).catch(() => { /* noop */ });
});
