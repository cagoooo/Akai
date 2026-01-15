// 服務工作線程版本
const CACHE_VERSION = 'v1.0.1';
const CACHE_NAME = `site-static-${CACHE_VERSION}`;

// 獲取 base path (支援 GitHub Pages)
const BASE_PATH = self.location.pathname.replace('sw.js', '');

// 需要緩存的資源 - 使用相對於 base path 的路徑
const ASSETS_TO_CACHE = [
  BASE_PATH,
  `${BASE_PATH}index.html`
];

// 安裝事件 - 預緩存關鍵資源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // 使用 cache.add 而非 addAll，避免單一失敗導致全部失敗
        return Promise.allSettled(
          ASSETS_TO_CACHE.map(url =>
            cache.add(url).catch(err => {
              console.warn(`無法快取: ${url}`, err);
            })
          )
        );
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// 激活事件 - 清理舊緩存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// 獲取事件 - 實現網絡優先策略
self.addEventListener('fetch', (event) => {
  // 僅處理 GET 請求
  if (event.request.method !== 'GET') return;

  // 跳過 API 請求
  if (event.request.url.includes('/api/')) return;

  // 跳過 Firebase 請求
  if (event.request.url.includes('firestore.googleapis.com')) return;
  if (event.request.url.includes('firebase')) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // 如果網絡請求成功，更新緩存
        if (networkResponse.ok) {
          const clonedResponse = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clonedResponse);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // 如果網絡請求失敗，嘗試從緩存中獲取
        return caches.match(event.request);
      })
  );
});
