/**
 * Firebase Authentication 服務
 * 處理用戶登入/登出和認證狀態
 */

import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User,
    Auth
} from 'firebase/auth';
import { auth, isAuthAvailable } from './firebase';

const googleProvider = new GoogleAuthProvider();

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
        console.log('Google 登入成功:', result.user.displayName);
        return result.user;
    } catch (error: any) {
        if (error.code === 'auth/cancelled-popup-request') {
            console.log('登入視窗已關閉');
        } else if (error.code === 'auth/popup-closed-by-user') {
            console.log('使用者關閉登入視窗');
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
        console.log('已登出');
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
