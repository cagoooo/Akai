export const PWA_UPDATE_AVAILABLE_EVENT = 'akai:pwa-update-available';

function announceUpdate(registration: ServiceWorkerRegistration) {
  window.dispatchEvent(new CustomEvent(PWA_UPDATE_AVAILABLE_EVENT, {
    detail: { scope: registration.scope },
  }));
}

/**
 * 監看單一註冊的更新生命週期。
 * 新版必須留在 waiting，交由 React 更新提示決定何時 SKIP_WAITING。
 */
export function watchServiceWorkerRegistration(registration: ServiceWorkerRegistration) {
  const watchWorker = (worker: ServiceWorker) => {
    const announceWhenInstalled = () => {
      if (worker.state === 'installed' && navigator.serviceWorker.controller) {
        announceUpdate(registration);
      }
    };

    announceWhenInstalled();
    worker.addEventListener('statechange', announceWhenInstalled);
  };

  if (registration.waiting && navigator.serviceWorker.controller) {
    announceUpdate(registration);
  }

  if (registration.installing) {
    watchWorker(registration.installing);
  }

  registration.addEventListener('updatefound', () => {
    if (registration.installing) {
      watchWorker(registration.installing);
    }
  });
}

// main.tsx 已在 window.load 後呼叫；此處不可再包第二層 load listener，否則不會註冊。
export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  if (import.meta.env.DEV) {
    console.log('開發環境：註銷 Service Worker');
    unregisterServiceWorker();
    return;
  }

  // 清除註冊在更大 scope、可能劫持本專案的舊 Service Worker。
  const expectedScope = new URL(import.meta.env.BASE_URL, window.location.origin).href;
  if (navigator.serviceWorker.getRegistrations) {
    void navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        if (
          registration.scope &&
          registration.scope !== expectedScope &&
          expectedScope.startsWith(registration.scope)
        ) {
          console.warn(`[SW] 偵測到衝突的 Service Worker scope：${registration.scope}，正在註銷`);
          void registration.unregister().then((success) => {
            if (success) window.location.reload();
          });
        }
      });
    });
  }

  const swPath = `${import.meta.env.BASE_URL}sw.js`;
  void navigator.serviceWorker.register(swPath, { updateViaCache: 'none' })
    .then((registration) => {
      console.log('Service Worker 註冊成功：', registration.scope);
      watchServiceWorkerRegistration(registration);
    })
    .catch((error) => {
      console.error('Service Worker 註冊失敗：', error);
    });
}

export function unregisterServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  void navigator.serviceWorker.ready
    .then((registration) => registration.unregister())
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error);
    });
}
