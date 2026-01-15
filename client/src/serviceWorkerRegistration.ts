
// 檢查瀏覽器是否支持 Service Worker
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // 使用相對路徑，支援不同的 base path (Firebase vs GitHub Pages)
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
