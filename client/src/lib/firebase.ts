// Firebase 初始化設定
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  enableIndexedDbPersistence,
  Firestore
} from 'firebase/firestore';

// 從環境變數讀取 Firebase 設定
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

// 檢查是否有有效的 Firebase 設定
const hasValidConfig = firebaseConfig.apiKey && firebaseConfig.projectId;

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

if (hasValidConfig) {
  try {
    // 初始化 Firebase
    app = initializeApp(firebaseConfig);

    // 初始化 Firestore
    db = getFirestore(app);

    // 啟用 IndexedDB 持久化快取
    enableIndexedDbPersistence(db).then(() => {
      console.log('Firestore 離線快取已啟用');
    }).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Firestore 持久化無法啟用：多個分頁開啟中');
      } else if (err.code === 'unimplemented') {
        console.warn('Firestore 持久化無法啟用：瀏覽器不支援');
      }
    });

    console.log('Firebase 初始化成功');
  } catch (error) {
    console.error('Firebase 初始化失敗:', error);
  }
} else {
  console.warn('Firebase 設定未完成，使用本地模式。請確認環境變數已設定。');
}

// 導出 - 可能為 null 如果設定無效
export { db };
export default app;

// 輔助函式：檢查 Firebase 是否可用
export function isFirebaseAvailable(): boolean {
  return db !== null;
}
