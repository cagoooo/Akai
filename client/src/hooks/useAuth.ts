/**
 * 認證狀態 Hook
 * 提供用戶登入狀態和登入/登出功能
 */

import { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import {
    signInWithGoogle,
    signOut,
    subscribeToAuthState,
    getCurrentUser
} from '@/lib/authService';
import { isAuthAvailable } from '@/lib/firebase';

interface UseAuthReturn {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    signIn: () => Promise<void>;
    logout: () => Promise<void>;
    isAvailable: boolean;
}

export function useAuth(): UseAuthReturn {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 檢查 Auth 是否可用
        if (!isAuthAvailable()) {
            setLoading(false);
            return;
        }

        // 訂閱認證狀態變化
        const unsubscribe = subscribeToAuthState(async (authUser) => {
            setUser(authUser);
            if (authUser) {
                try {
                    const idTokenResult = await authUser.getIdTokenResult();
                    setIsAdmin(!!idTokenResult.claims.admin);
                } catch (e) {
                    console.error("Error getting token result", e);
                    setIsAdmin(false);
                }
            } else {
                setIsAdmin(false);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signIn = useCallback(async () => {
        setLoading(true);
        try {
            await signInWithGoogle();
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        setLoading(true);
        try {
            await signOut();
            setIsAdmin(false);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin,
        signIn,
        logout,
        isAvailable: isAuthAvailable(),
    };
}
