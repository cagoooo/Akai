import { useCallback, useEffect, useRef, useState } from 'react';
import { PWA_UPDATE_AVAILABLE_EVENT } from '@/serviceWorkerRegistration';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAUpdateState {
    isUpdateAvailable: boolean;
    isOffline: boolean;
    isInstallable: boolean;
    installPrompt: BeforeInstallPromptEvent | null;
}

export function usePWAUpdate() {
    const [state, setState] = useState<PWAUpdateState>({
        isUpdateAvailable: false,
        isOffline: !navigator.onLine,
        isInstallable: false,
        installPrompt: null,
    });
    const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
    const reloadAfterActivationRef = useRef(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateError, setUpdateError] = useState<string | null>(null);
    const updateAttemptRef = useRef<symbol | null>(null);
    const updateCleanupRef = useRef<(() => void) | null>(null);

    useEffect(() => () => {
        updateAttemptRef.current = null;
        updateCleanupRef.current?.();
    }, []);

    // 只有使用者確認或倒數結束送出 SKIP_WAITING 後，controllerchange 才能重新整理。
    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;

        const handleControllerChange = () => {
            if (!reloadAfterActivationRef.current) return;
            reloadAfterActivationRef.current = false;
            window.location.reload();
        };

        navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
        return () => navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    }, []);

    useEffect(() => {
        const handleOnline = () => setState((previous) => ({ ...previous, isOffline: false }));
        const handleOffline = () => setState((previous) => ({ ...previous, isOffline: true }));

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // serviceWorkerRegistration 統一發出更新事件；初始 waiting 檢查可補上 lazy component 載入前的事件。
    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;

        const markUpdateAvailable = () => {
            setState((previous) => ({ ...previous, isUpdateAvailable: true }));
        };
        window.addEventListener(PWA_UPDATE_AVAILABLE_EVENT, markUpdateAvailable);

        void navigator.serviceWorker.getRegistration().then((registration) => {
            if (!registration) return;
            registrationRef.current = registration;
            if (registration.waiting) markUpdateAvailable();
        });

        let cancelled = false;
        void navigator.serviceWorker.ready.then((registration) => {
            if (!cancelled) registrationRef.current = registration;
        });

        const checkForUpdate = () => {
            if (!document.hidden) {
                void registrationRef.current?.update().catch((error) => {
                    console.warn('[PWA] 更新檢查失敗：', error);
                });
            }
        };
        const checkInterval = window.setInterval(checkForUpdate, 3 * 60 * 1000);
        const handleVisibilityChange = () => {
            if (!document.hidden) checkForUpdate();
        };
        const handleFocus = () => {
            if (!document.hidden) checkForUpdate();
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            cancelled = true;
            window.removeEventListener(PWA_UPDATE_AVAILABLE_EVENT, markUpdateAvailable);
            window.clearInterval(checkInterval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    useEffect(() => {
        const handleBeforeInstall = (event: Event) => {
            event.preventDefault();
            setState((previous) => ({
                ...previous,
                isInstallable: true,
                installPrompt: event as BeforeInstallPromptEvent,
            }));
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    }, []);

    const updateApp = useCallback(async () => {
        if (updateAttemptRef.current) return;
        const attempt = Symbol('update');
        updateAttemptRef.current = attempt;
        setIsUpdating(true);
        setUpdateError(null);
        let removeWorkerListener = () => {};
        const fail = () => {
            if (updateAttemptRef.current !== attempt) return;
            updateCleanupRef.current?.();
            updateAttemptRef.current = null;
            reloadAfterActivationRef.current = false;
            setIsUpdating(false);
            setUpdateError('更新尚未完成，請確認網路連線後重試。');
        };
        const timeout = window.setTimeout(fail, 45000);
        updateCleanupRef.current = () => {
            window.clearTimeout(timeout);
            removeWorkerListener();
        };
        // 先繪出更新狀態，再執行可能立刻重新載入的操作。
        if (!document.hidden) {
            await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
        }
        if (updateAttemptRef.current !== attempt) return;
        try {
            if (!('serviceWorker' in navigator)) {
                window.location.reload();
                return;
            }

            const registration = registrationRef.current ?? await navigator.serviceWorker.getRegistration();
            if (updateAttemptRef.current !== attempt) return;
            if (!registration) {
                window.location.reload();
                return;
            }
            registrationRef.current = registration;

            const activateWorker = (worker: ServiceWorker) => {
                if (updateAttemptRef.current !== attempt) return;
                reloadAfterActivationRef.current = true;
                worker.postMessage({ type: 'SKIP_WAITING' });
            };

            if (registration.waiting) {
                activateWorker(registration.waiting);
                return;
            }

            await registration.update();
            if (updateAttemptRef.current !== attempt) return;

            if (registration.waiting) {
                activateWorker(registration.waiting);
                return;
            }

            if (registration.installing) {
                const installingWorker = registration.installing;
                const activateWhenInstalled = () => {
                    if (installingWorker.state === 'redundant') {
                        fail();
                        return;
                    }
                    if (installingWorker.state !== 'installed') return;
                    installingWorker.removeEventListener('statechange', activateWhenInstalled);
                    activateWorker(installingWorker);
                };
                installingWorker.addEventListener('statechange', activateWhenInstalled);
                removeWorkerListener = () => installingWorker.removeEventListener('statechange', activateWhenInstalled);
                activateWhenInstalled();
                return;
            }

            // version.json 已更新但瀏覽器尚未產生 waiting worker 時，以一般 reload 取得最新 HTML。
            window.location.reload();
        } catch (error) {
            console.warn('[PWA] 套用更新失敗：', error);
            fail();
        }
    }, []);

    const installApp = useCallback(async () => {
        if (!state.installPrompt) return false;

        const result = await state.installPrompt.prompt();
        setState((previous) => ({
            ...previous,
            isInstallable: false,
            installPrompt: null,
        }));
        return result.outcome === 'accepted';
    }, [state.installPrompt]);

    const dismissUpdate = useCallback(() => {
        setUpdateError(null);
        setState((previous) => ({ ...previous, isUpdateAvailable: false }));
    }, []);

    return {
        ...state,
        isUpdating,
        updateError,
        updateApp,
        installApp,
        dismissUpdate,
    };
}
