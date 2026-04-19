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

    // 🚀 全域監聽 Service Worker 控制權變更，確保能在更新後立刻自動重載
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            const handleControllerChange = () => {
                console.log('🚀 [PWA] Controller changed, reloading page...');
                window.location.reload();
            };
            navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
            return () => {
                navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
            };
        }
    }, []);

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

    // 監聽 Service Worker 更新 + 定期主動檢查新版本
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            let registrationRef: ServiceWorkerRegistration | null = null;

            navigator.serviceWorker.ready.then(registration => {
                registrationRef = registration;

                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                console.log('🚀 [PWA] New version installed and waiting.');
                                setState(prev => ({ ...prev, isUpdateAvailable: true }));
                            }
                        });
                    }
                });
            });

            // 檢查是否有等待中的更新
            navigator.serviceWorker.getRegistration().then(registration => {
                if (registration?.waiting) {
                    console.log('🚀 [PWA] Found waiting worker on load.');
                    setState(prev => ({ ...prev, isUpdateAvailable: true }));
                }
            });

            // 🔄 每 30 分鐘主動檢查一次新版本（長時間開著分頁的老師也能收到更新）
            const checkInterval = setInterval(() => {
                if (registrationRef && !document.hidden) {
                    console.log('🔄 [PWA] Periodic update check...');
                    registrationRef.update().catch(err => {
                        console.warn('[PWA] Update check failed:', err);
                    });
                }
            }, 30 * 60 * 1000); // 30 分鐘

            // 📱 分頁重新取得焦點時也檢查（從背景切回前台）
            const handleVisibilityChange = () => {
                if (!document.hidden && registrationRef) {
                    console.log('🔄 [PWA] Tab visible, checking for updates...');
                    registrationRef.update().catch(() => { });
                }
            };
            document.addEventListener('visibilitychange', handleVisibilityChange);

            return () => {
                clearInterval(checkInterval);
                document.removeEventListener('visibilitychange', handleVisibilityChange);
            };
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
        console.log('🚀 [PWA] User clicked update button.');
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration().then(registration => {
                if (registration?.waiting) {
                    console.log('🚀 [PWA] Sending SKIP_WAITING to worker...');
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                } else {
                    // 🛡️ 保底機制：如果提示已出現但找不到 waiting worker，代表可能已在激活中或狀態同步延遲
                    console.warn('⚠️ [PWA] No waiting worker found, triggering fallback reload.');
                    window.location.reload();
                }
            });
        } else {
            window.location.reload();
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
