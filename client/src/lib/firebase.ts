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
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';

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
      initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
        isTokenAutoRefreshEnabled: true,
      });
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

// 輔助函式：檢查 Firebase 是否可用
export function isFirebaseAvailable(): boolean {
  return db !== null;
}

// 輔助函式：檢查 Auth 是否可用
export function isAuthAvailable(): boolean {
  return auth !== null;
}
