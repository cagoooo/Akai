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
        const checkInterval = window.setInterval(checkForUpdate, 30 * 60 * 1000);
        const handleVisibilityChange = () => {
            if (!document.hidden) checkForUpdate();
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            cancelled = true;
            window.removeEventListener(PWA_UPDATE_AVAILABLE_EVENT, markUpdateAvailable);
            window.clearInterval(checkInterval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
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
        if (!('serviceWorker' in navigator)) {
            window.location.reload();
            return;
        }

        const registration = registrationRef.current ?? await navigator.serviceWorker.getRegistration();
        if (!registration) {
            window.location.reload();
            return;
        }
        registrationRef.current = registration;

        const activateWorker = (worker: ServiceWorker) => {
            reloadAfterActivationRef.current = true;
            worker.postMessage({ type: 'SKIP_WAITING' });
        };

        if (registration.waiting) {
            activateWorker(registration.waiting);
            return;
        }

        try {
            await registration.update();
        } catch (error) {
            console.warn('[PWA] 套用更新前的檢查失敗：', error);
        }

        if (registration.waiting) {
            activateWorker(registration.waiting);
            return;
        }

        if (registration.installing) {
            const installingWorker = registration.installing;
            const activateWhenInstalled = () => {
                if (installingWorker.state !== 'installed') return;
                installingWorker.removeEventListener('statechange', activateWhenInstalled);
                activateWorker(installingWorker);
            };
            installingWorker.addEventListener('statechange', activateWhenInstalled);
            activateWhenInstalled();
            return;
        }

        // version.json 已更新但瀏覽器尚未產生 waiting worker 時，以一般 reload 取得最新 HTML。
        window.location.reload();
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
        setState((previous) => ({ ...previous, isUpdateAvailable: false }));
    }, []);

    return {
        ...state,
        updateApp,
        installApp,
        dismissUpdate,
    };
}
