// Firebase 初始化設定
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

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

export default app;
