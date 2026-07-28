import { runWhenUpdateAllowed } from '@/lib/pwaUpdateHold';

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

  // 陷阱 #18：頁面重整後若新 SW 已在 waiting 狀態，直接靜默自動套用，
  // 避免使用者永遠看不到更新提示而卡在舊版（來源：2026-06-28 Akai 實戰）
  // 但若此刻有「不能被打斷」的流程（如族群對象引導精靈）持有更新暫緩票，
  // 就等它結束後再套用，避免訪客選到一半被重整（2026-07-28）
  if (registration.waiting && navigator.serviceWorker.controller) {
    const waitingWorker = registration.waiting;
    runWhenUpdateAllowed(() => {
      console.log('[SW] 偵測到 waiting worker，自動靜默套用新版…');
      let _reloaded = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!_reloaded) { _reloaded = true; window.location.reload(); }
      });
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    });
    return; // 直接觸發自動更新，不再走 announceUpdate 路線
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

  // 陷阱 #13（線 B）：監聽 SW activate 後廣播的 SW_ACTIVATED postMessage，
  // 作為 updatefound 事件的備援通道，確保即使 updatefound 被錯過也能收到更新通知。
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'SW_ACTIVATED' && navigator.serviceWorker.controller) {
      console.log('[SW] 收到 SW_ACTIVATED 訊號，廣播更新事件');
      // SW_ACTIVATED 表示新版 SW 已接管，直接發出 update 通知（無需 postMessage SKIP_WAITING）
      window.dispatchEvent(new CustomEvent(PWA_UPDATE_AVAILABLE_EVENT, {
        detail: { scope: expectedScope, fromActivation: true },
      }));
    }
  });

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
