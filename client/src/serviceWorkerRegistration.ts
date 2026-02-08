
// 檢查瀏覽器是否支持 Service Worker
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    if (import.meta.env.DEV) {
      // 開發環境下註銷 Service Worker，避免快取干擾
      console.log('開發環境: 註銷 Service Worker');
      unregisterServiceWorker();
      return;
    }

    window.addEventListener('load', () => {
      const swPath = import.meta.env.BASE_URL + 'sw.js';
      navigator.serviceWorker.register(swPath)
        .then((registration) => {
          console.log('ServiceWorker 註冊成功:', registration.scope);
        })
        .catch((error) => {
          console.error('ServiceWorker 註冊失敗:', error);
        });
    });
  }
}

export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
