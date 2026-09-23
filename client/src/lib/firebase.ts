// Firebase 初始化設定
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore,
} from 'firebase/firestore';
import {
  initializeAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  Auth,
} from 'firebase/auth';

// 從環境變數讀取 Firebase 設定
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// 檢查是否有有效的 Firebase 設定
const hasValidConfig = firebaseConfig.apiKey && firebaseConfig.projectId;
const appCheckSiteKey = import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY || '';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

// App Check 就緒訊號：初始化完成且拿到第一個 token 才 resolve；
// 沒有金鑰 / 本機 / 初始化失敗時直接 resolve，呼叫端不會被卡住
let markAppCheckReady: () => void = () => {};
const appCheckReady = new Promise<void>((resolve) => {
  markAppCheckReady = resolve;
});
let appCheckScheduled = false;

if (hasValidConfig) {
  try {
    // 初始化 Firebase
    app = initializeApp(firebaseConfig);

    // App Check 先送出 token 供後端觀測；確認合法流量覆蓋率後才啟用強制阻擋。
    // reCAPTCHA Enterprise 金鑰只允許 cagoooo.github.io；本機 / CI E2E（localhost）取 token 必失敗並不斷重試，直接略過
    const isLocalhost = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname);
    if (appCheckSiteKey && isLocalhost) {
      console.info('Firebase App Check：本機網址略過（金鑰僅允許正式網域）');
    } else if (appCheckSiteKey) {
      // 延後初始化（2026-09-23）：reCAPTCHA Enterprise 腳本 ~345KB（gzip）會在首屏搶頻寬與 CPU，
      // 改到頁面 load 後閒置才動態載入。Firestore / Functions 之後的請求會自動帶上 token；
      // 在此之前送出的請求沒有 token；需要 token 的統計 callable 會先 await waitForAppCheck()。
      appCheckScheduled = true;
      const firebaseApp = app;
      const startAppCheck = () => {
        import('firebase/app-check')
          .then(async ({ initializeAppCheck, ReCaptchaEnterpriseProvider, getToken }) => {
            const appCheck = initializeAppCheck(firebaseApp, {
              provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
              isTokenAutoRefreshEnabled: true,
            });
            // 等第一個 token 真的換到，之後的 callable 才保證帶得上
            await getToken(appCheck).catch((err) => console.warn('Firebase App Check 取得 token 失敗:', err));
          })
          .catch((err) => console.warn('Firebase App Check 初始化失敗:', err))
          .finally(() => markAppCheckReady());
      };
      const scheduleAppCheck = () => {
        const w = window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number };
        if (w.requestIdleCallback) w.requestIdleCallback(startAppCheck, { timeout: 3000 });
        else setTimeout(startAppCheck, 1500);
      };
      if (document.readyState === 'complete') scheduleAppCheck();
      else window.addEventListener('load', scheduleAppCheck, { once: true });
    } else {
      console.warn('Firebase App Check 尚未設定 site key，目前僅能進行後端缺漏觀測。');
    }

    // 使用新的 API 初始化 Firestore，包含持久化快取
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });

    // 初始化 Authentication
    // 不用 getAuth()：它預設掛上 browserPopupRedirectResolver，每頁都會載入 ~93KB 的
    // __/auth/iframe.js。一般訪客只需要匿名登入，彈窗 resolver 改在 signInWithGoogle 才帶入。
    // persistence 與 getAuth() 預設相同。
    auth = initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence, browserSessionPersistence],
    });

    console.log('Firebase 初始化成功（含離線快取）');
  } catch (error) {
    console.error('Firebase 初始化失敗:', error);
  }
} else {
  console.warn('Firebase 設定未完成，使用本地模式。請確認環境變數已設定。');
}

// 導出 - 可能為 null 如果設定無效
export { db, auth };
export default app;

if (!appCheckScheduled) markAppCheckReady();

/**
 * 等 App Check 就緒（延後初始化，約在頁面 load 後閒置時）再送需要 token 的請求。
 * 最多等 maxWaitMs：reCAPTCHA 被廣告攔截 / 校園防火牆擋掉時，統計仍會送出（monitor 模式照收），不會永遠卡住。
 */
export function waitForAppCheck(maxWaitMs = 10_000): Promise<void> {
  return Promise.race([appCheckReady, new Promise<void>((resolve) => setTimeout(resolve, maxWaitMs))]);
}

// 輔助函式：檢查 Firebase 是否可用
export function isFirebaseAvailable(): boolean {
  return db !== null;
}

// 輔助函式：檢查 Auth 是否可用
export function isAuthAvailable(): boolean {
  return auth !== null;
}
