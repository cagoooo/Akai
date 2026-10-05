// Firebase 初始化設定
import { initializeApp, FirebaseApp } from 'firebase/app';
import { createAppCheckReadiness } from './appCheckReadiness';
import { userInteractionReady } from './userInteraction';
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

// 沒有合法驗證時回傳 false，不能把「初始化結束」當成「驗證通過」。
let checkAppCheckReadiness: (maxWaitMs?: number) => Promise<boolean> = async () => false;

if (hasValidConfig) {
  try {
    // 初始化 Firebase
    app = initializeApp(firebaseConfig);

    // 後端已 enforceAppCheck；不變更風險門檻或使用 debug token。
    // reCAPTCHA Enterprise 金鑰只允許 cagoooo.github.io；本機 / CI E2E（localhost）取 token 必失敗並不斷重試，直接略過
    const isLocalhost = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname);
    if (appCheckSiteKey && isLocalhost) {
      console.info('Firebase App Check：本機網址略過（金鑰僅允許正式網域）');
    } else if (appCheckSiteKey) {
      const firebaseApp = app;
      checkAppCheckReadiness = createAppCheckReadiness(async () => {
        const { initializeAppCheck, ReCaptchaEnterpriseProvider, getToken } = await import('firebase/app-check');
        const appCheck = initializeAppCheck(firebaseApp, {
          provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
          isTokenAutoRefreshEnabled: true,
        });
        return async () => (await getToken(appCheck)).token;
      }, userInteractionReady);
    } else {
      console.warn('Firebase App Check 尚未設定 site key，不會傳送受保護的統計。');
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

/**
 * 首次操作後才初始化驗證；取得有效 token 才回傳 true。
 * 驗證失敗或操作後等待逾時回傳 false，呼叫端不得送受保護請求。
 */
export function waitForAppCheck(maxWaitMs = 10_000): Promise<boolean> {
  return checkAppCheckReadiness(maxWaitMs);
}

// 輔助函式：檢查 Firebase 是否可用
export function isFirebaseAvailable(): boolean {
  return db !== null;
}

// 輔助函式：檢查 Auth 是否可用
export function isAuthAvailable(): boolean {
  return auth !== null;
}
