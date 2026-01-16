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
    signIn: () => Promise<void>;
    logout: () => Promise<void>;
    isAvailable: boolean;
}

export function useAuth(): UseAuthReturn {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 檢查 Auth 是否可用
        if (!isAuthAvailable()) {
            setLoading(false);
            return;
        }

        // 訂閱認證狀態變化
        const unsubscribe = subscribeToAuthState((authUser) => {
            setUser(authUser);
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
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        user,
        loading,
        isAuthenticated: !!user,
        signIn,
        logout,
        isAvailable: isAuthAvailable(),
    };
}
