/**
 * PWA 更新管理 Hook
 * 檢測 Service Worker 更新並提示用戶
 */

import { useState, useEffect, useCallback } from 'react';

interface PWAUpdateState {
    isUpdateAvailable: boolean;
    isOffline: boolean;
    isInstallable: boolean;
    installPrompt: any;
}

export function usePWAUpdate() {
    const [state, setState] = useState<PWAUpdateState>({
        isUpdateAvailable: false,
        isOffline: !navigator.onLine,
        isInstallable: false,
        installPrompt: null,
    });

    // 監聽離線/上線狀態
    useEffect(() => {
        const handleOnline = () => setState(prev => ({ ...prev, isOffline: false }));
        const handleOffline = () => setState(prev => ({ ...prev, isOffline: true }));

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // 監聽 Service Worker 更新
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                setState(prev => ({ ...prev, isUpdateAvailable: true }));
                            }
                        });
                    }
                });
            });

            // 檢查是否有等待中的更新
            navigator.serviceWorker.getRegistration().then(registration => {
                if (registration?.waiting) {
                    setState(prev => ({ ...prev, isUpdateAvailable: true }));
                }
            });
        }
    }, []);

    // 監聽安裝提示
    useEffect(() => {
        const handleBeforeInstall = (e: Event) => {
            e.preventDefault();
            setState(prev => ({
                ...prev,
                isInstallable: true,
                installPrompt: e,
            }));
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
        };
    }, []);

    // 執行更新
    const updateApp = useCallback(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration().then(registration => {
                if (registration?.waiting) {
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                }
            });
        }
    }, []);

    // 安裝 PWA
    const installApp = useCallback(async () => {
        if (state.installPrompt) {
            const result = await state.installPrompt.prompt();
            setState(prev => ({
                ...prev,
                isInstallable: false,
                installPrompt: null,
            }));
            return result.outcome === 'accepted';
        }
        return false;
    }, [state.installPrompt]);

    // 關閉更新提示
    const dismissUpdate = useCallback(() => {
        setState(prev => ({ ...prev, isUpdateAvailable: false }));
    }, []);

    return {
        ...state,
        updateApp,
        installApp,
        dismissUpdate,
    };
}
