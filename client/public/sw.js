/**
 * Service Worker v2.0.0
 * 
 * 快取策略：
 * - Cache First: 靜態資源 (JS/CSS/字體)
 * - Network First: HTML/API
 * - Stale While Revalidate: 圖片
 */

const CACHE_VERSION = 'v2.2.0';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;

// 獲取 base path (支援 GitHub Pages)
const BASE_PATH = self.location.pathname.replace('sw.js', '');

// 預快取資源 - 使用相對於 base path 的路徑
const PRECACHE_ASSETS = [
  BASE_PATH,
  `${BASE_PATH}index.html`,
  `${BASE_PATH}manifest.json`,
];

// 快取策略判斷
const CACHE_STRATEGIES = {
  // Cache First: 靜態資源
  cacheFirst: [
    /\.js$/,
    /\.css$/,
    /\.woff2?$/,
    /\.ttf$/,
    /\.eot$/,
    /\/assets\//,
  ],
  // Stale While Revalidate: 圖片
  staleWhileRevalidate: [
    /\.png$/,
    /\.jpg$/,
    /\.jpeg$/,
    /\.svg$/,
    /\.gif$/,
    /\.webp$/,
    /\.ico$/,
    /\/previews\//,
  ],
  // 需要跳過的請求
  skip: [
    /\/api\//,
    /firestore\.googleapis\.com/,
    /firebase/,
    /googleapis\.com/,
    /chrome-extension/,
  ],
};

/**
 * 判斷 URL 是否匹配任一模式
 */
function matchesPattern(url, patterns) {
  return patterns.some(pattern => pattern.test(url));
}

/**
 * 判斷請求的快取策略
 */
function getCacheStrategy(url) {
  if (matchesPattern(url, CACHE_STRATEGIES.skip)) {
    return 'skip';
  }
  if (matchesPattern(url, CACHE_STRATEGIES.cacheFirst)) {
    return 'cacheFirst';
  }
  if (matchesPattern(url, CACHE_STRATEGIES.staleWhileRevalidate)) {
    return 'staleWhileRevalidate';
  }
  return 'networkFirst';
}

// ==================== 安裝事件 ====================
self.addEventListener('install', (event) => {
  console.log('[SW] 安裝中...', CACHE_VERSION);

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        // 使用 Promise.allSettled 避免單一失敗導致全部失敗
        return Promise.allSettled(
          PRECACHE_ASSETS.map(url =>
            cache.add(url).catch(err => {
              console.warn(`[SW] 無法預快取: ${url}`, err);
            })
          )
        );
      })
      .then(() => {
        console.log('[SW] 預快取完成');
        return self.skipWaiting();
      })
  );
});

// ==================== 激活事件 ====================
self.addEventListener('activate', (event) => {
  console.log('[SW] 激活中...', CACHE_VERSION);

  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          // 刪除舊版本的快取
          if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE) {
            console.log('[SW] 刪除舊快取:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      console.log('[SW] 激活完成');
      return self.clients.claim();
    })
  );
});

// ==================== 獲取事件 ====================
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // 僅處理 GET 請求
  if (request.method !== 'GET') return;

  // 檢查 URL scheme
  const url = new URL(request.url);
  if (!['http:', 'https:'].includes(url.protocol)) return;

  const strategy = getCacheStrategy(request.url);

  // 跳過不需要快取的請求
  if (strategy === 'skip') return;

  switch (strategy) {
    case 'cacheFirst':
      event.respondWith(cacheFirst(request));
      break;
    case 'staleWhileRevalidate':
      event.respondWith(staleWhileRevalidate(request));
      break;
    case 'networkFirst':
    default:
      event.respondWith(networkFirst(request));
      break;
  }
});

// ==================== 快取策略實作 ====================

/**
 * Cache First 策略
 * 優先使用快取，快取沒有時才請求網路
 */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const networkResponse = await fetch(request);
    // 只快取完整的成功響應 (status 200)，跳過 206 Partial Response
    if (networkResponse.ok && networkResponse.status === 200) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn('[SW] Cache First 失敗:', request.url, error);
    return new Response('離線中', { status: 503, statusText: 'Service Unavailable' });
  }
}

/**
 * Network First 策略
 * 優先請求網路，失敗時使用快取
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    // 只快取完整的成功響應 (status 200)，跳過 206 Partial Response
    if (networkResponse.ok && networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] 網路請求失敗，嘗試快取:', request.url);
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    // 如果是 HTML 請求，返回離線頁面
    if (request.headers.get('Accept')?.includes('text/html')) {
      const offlineCache = await caches.match(`${BASE_PATH}index.html`);
      if (offlineCache) {
        return offlineCache;
      }
    }
    return new Response('離線中', { status: 503, statusText: 'Service Unavailable' });
  }
}

/**
 * Stale While Revalidate 策略
 * 立即返回快取，同時在背景更新快取
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);

  // 在背景更新快取
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      // 只快取完整的成功響應 (status 200)，跳過 206 Partial Response
      if (networkResponse.ok && networkResponse.status === 200) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch((error) => {
      console.warn('[SW] 背景更新失敗:', request.url, error);
      return null;
    });

  // 如果有快取就立即返回，否則等待網路
  return cached || fetchPromise;
}

// ==================== 訊息處理 ====================
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }

  if (event.data === 'getVersion') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});
