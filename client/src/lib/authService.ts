/**
 * Firebase Authentication 服務
 * 處理用戶登入/登出和認證狀態
 */

import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    signInAnonymously,
    User,
    Auth
} from 'firebase/auth';
import { auth, isAuthAvailable } from './firebase';

const googleProvider = new GoogleAuthProvider();

const SIGNED_OUT_FLAG = 'akai_signed_out_this_session';

/**
 * 確保有 Firebase 身份（未登入者自動匿名登入）
 *
 * 為什麼需要：
 *   Firestore rules 對 visitorStats / analytics / toolUsageStats 都要求
 *   `request.auth != null`。沒有匿名身份的訪客寫入會被擋下，
 *   導致統計只反映 Google 登入用戶。
 *
 * 行為：
 * - 已登入（Google 或匿名）→ 直接 resolve
 * - 否則先等 Firebase 還原既有 session，仍空 → signInAnonymously
 * - 本 session 內主動 signOut 過 → 略過，尊重使用者「我要登出」的意圖
 */
export async function ensureSignedIn(): Promise<User | null> {
    if (!isAuthAvailable() || !auth) return null;
    if (auth.currentUser) return auth.currentUser;

    // 等 onAuthStateChanged 第一次回呼，讓 Firebase 從 IndexedDB 還原 session
    await new Promise<void>((resolve) => {
        const unsub = onAuthStateChanged(auth as Auth, () => {
            unsub();
            resolve();
        });
        // safety timeout，避免某些情境永不 callback
        setTimeout(() => {
            try { unsub(); } catch { /* ignore */ }
            resolve();
        }, 1500);
    });

    if (auth.currentUser) return auth.currentUser;

    try {
        if (sessionStorage.getItem(SIGNED_OUT_FLAG) === '1') return null;
    } catch { /* ignore */ }

    try {
        const result = await signInAnonymously(auth as Auth);
        return result.user;
    } catch (err) {
        console.warn('[ensureSignedIn] 匿名登入失敗:', err);
        return null;
    }
}

/** 主動登出時呼叫，記住「使用者本次 session 不要再被自動匿名登入」 */
export function markSignedOutThisSession() {
    try { sessionStorage.setItem(SIGNED_OUT_FLAG, '1'); } catch { /* ignore */ }
}

/**
 * 使用 Google 帳號登入
 */
export async function signInWithGoogle(): Promise<User | null> {
    if (!isAuthAvailable() || !auth) {
        console.warn('Firebase Auth 不可用');
        return null;
    }

    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error: any) {
        if (error.code === 'auth/cancelled-popup-request') {
            // 登入視窗已關閉
        } else if (error.code === 'auth/popup-closed-by-user') {
            // 使用者關閉登入視窗
        } else {
            console.error('Google 登入失敗:', error);
        }
        return null;
    }
}

/**
 * 登出
 */
export async function signOut(): Promise<void> {
    if (!isAuthAvailable() || !auth) {
        return;
    }

    try {
        await firebaseSignOut(auth);
    } catch (error) {
        console.error('登出失敗:', error);
    }
}

/**
 * 監聽認證狀態變化
 */
export function subscribeToAuthState(
    callback: (user: User | null) => void
): () => void {
    if (!isAuthAvailable() || !auth) {
        callback(null);
        return () => { };
    }

    return onAuthStateChanged(auth, callback);
}

/**
 * 取得當前用戶
 */
export function getCurrentUser(): User | null {
    if (!isAuthAvailable() || !auth) {
        return null;
    }
    return auth.currentUser;
}
