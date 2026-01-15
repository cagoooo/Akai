// Firebase 初始化設定
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  enableIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDWwk3dCFmEM9_5x07fvmBMZ6LApstxkw0",
  authDomain: "akai-e693f.firebaseapp.com",
  projectId: "akai-e693f",
  storageBucket: "akai-e693f.firebasestorage.app",
  messagingSenderId: "1056659479431",
  appId: "1:1056659479431:web:d166da50e1aef3888f5122"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 初始化 Firestore
export const db = getFirestore(app);

// 啟用 IndexedDB 持久化快取
// 這允許離線存取已載入的資料
enableIndexedDbPersistence(db, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED
}).then(() => {
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
