// Firebase 初始化設定
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  enableIndexedDbPersistence
} from 'firebase/firestore';

// 從環境變數讀取 Firebase 設定
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// 驗證環境變數是否存在
if (!firebaseConfig.apiKey) {
  console.error('Firebase API Key 未設定。請確認 .env 檔案已建立並包含 VITE_FIREBASE_API_KEY');
}

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 初始化 Firestore
export const db = getFirestore(app);

// 啟用 IndexedDB 持久化快取
// 這允許離線存取已載入的資料
enableIndexedDbPersistence(db).then(() => {
  console.log('Firestore 離線快取已啟用');
}).catch((err) => {
  if (err.code === 'failed-precondition') {
    // 多個分頁開啟時只有一個可以啟用持久化
    console.warn('Firestore 持久化無法啟用：多個分頁開啟中');
  } else if (err.code === 'unimplemented') {
    // 瀏覽器不支援 IndexedDB
    console.warn('Firestore 持久化無法啟用：瀏覽器不支援');
  }
});

export default app;
