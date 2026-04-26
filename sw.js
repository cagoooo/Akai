/**
 * Service Worker v2.0.0
 * 
 * 快取策略：
 * - Cache First: 靜態資源 (JS/CSS/字體)
 * - Network First: HTML/API
 * - Stale While Revalidate: 圖片
 */

const CACHE_VERSION = 'v3.6.5-49dcf0e-202604261658';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const ASSETS_ARCHIVE = 'assets-archive-v1';
// 🖼️ 圖片專用持久快取（不綁 CACHE_VERSION，避免每次發版都重抓所有預覽圖）
// 命名規則：images-persistent-vN → 當圖片壓縮策略有大改時才手動 bump N
const IMAGE_CACHE = 'images-persistent-v1';
const MAX_ARCHIVED_ASSETS = 150; // 最多保留 150 個歷史 Chunk 組件
const MAX_IMAGE_CACHE_ENTRIES = 400; // 圖片快取最多 400 張（81 工具 × 預覽 + 校徽/favicon/icon 等）

// 獲取 base path (支援 GitHub Pages)
const BASE_PATH = self.location.pathname.replace('sw.js', '');

// 預快取資源 - 使用相對於 base path 的路徑
const PRECACHE_ASSETS = [
  BASE_PATH,
  `${BASE_PATH}index.html`,
  `${BASE_PATH}manifest.json`,
  `${BASE_PATH}api/tools.json`,
  `${BASE_PATH}api/teacher.json`,
];

// 🚀 首屏圖片預快取（存入 IMAGE_CACHE 持久快取，不受 CACHE_VERSION 更新影響）
// 覆蓋前 6 張工具預覽圖，讓回訪使用者即使離線也能看到首屏內容
const PRECACHE_IMAGES = [
  `${BASE_PATH}previews/tool_1.webp`,
  `${BASE_PATH}previews/tool_2.webp`,
  `${BASE_PATH}previews/tool_3.webp`,
  `${BASE_PATH}previews/tool_4.webp`,
  `${BASE_PATH}previews/tool_5.webp`,
  `${BASE_PATH}previews/tool_6.webp`,
  // Hero 區的阿凱拍立得 + 校徽
  `${BASE_PATH}assets/Akai.png`,
  `${BASE_PATH}assets/school-logo.png`,
  // favicon（MAKER 便利貼用）
  `${BASE_PATH}favicon.png`,
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
  // 需要跳過的請求（完全不經 SW，直接交給瀏覽器 + network）
  skip: [
    /firestore\.googleapis\.com/,
    /firebase/,
    /googleapis\.com/,
    /chrome-extension/,
    /\/version\.json$/, // version.json 必須永遠走網路，否則無法偵測新版
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
    Promise.all([
      // 1. 預快取核心資源到 STATIC_CACHE
      caches.open(STATIC_CACHE).then((cache) =>
        Promise.allSettled(
          PRECACHE_ASSETS.map((url) =>
            cache.add(url).catch((err) => {
              console.warn(`[SW] 無法預快取靜態資源: ${url}`, err);
            })
          )
        )
      ),
      // 2. 🚀 預快取首屏圖片到 IMAGE_CACHE（持久、版本無關）
      // 用 Promise.allSettled 讓單張失敗不影響其他，而且整體不等太久（最多 5 秒）
      Promise.race([
        caches.open(IMAGE_CACHE).then((cache) =>
          Promise.allSettled(
            PRECACHE_IMAGES.map((url) =>
              cache.add(url).catch((err) => {
                console.warn(`[SW] 無法預快取首屏圖: ${url}`, err);
              })
            )
          )
        ),
        new Promise((resolve) => setTimeout(resolve, 5000)),
      ]),
    ])
      .then(() => {
        console.log('[SW] 預快取完成（靜態 + 首屏圖）');
        return self.skipWaiting();
      })
  );
});

// ==================== 激活事件 ====================
self.addEventListener('activate', (event) => {
  console.log('[SW] 激活中...', CACHE_VERSION);

  event.waitUntil(
    caches.keys().then(async (keyList) => {
      const archiveCache = await caches.open(ASSETS_ARCHIVE);

      await Promise.all(
        keyList.map(async (key) => {
          // 保留當前版本的 STATIC/DYNAMIC、ASSETS_ARCHIVE（歷史 JS chunk）、IMAGE_CACHE（持久圖片快取）
          if (
            key !== STATIC_CACHE &&
            key !== DYNAMIC_CACHE &&
            key !== ASSETS_ARCHIVE &&
            key !== IMAGE_CACHE
          ) {
            console.log('[SW] 處理舊快取:', key);

            // 若為舊的 static 快取，將當中的 /assets/ (含 Hash) 檔案備份至 ARCHIVE
            if (key.startsWith('static-') || key.startsWith('dynamic-')) {
              try {
                const oldCache = await caches.open(key);
                const oldRequests = await oldCache.keys();
                // 找出 .js / .css / .woff 等靜態資源
                const assetsToArchive = oldRequests.filter(req =>
                  req.url.includes('/assets/') &&
                  (req.url.endsWith('.js') || req.url.endsWith('.css') || req.url.endsWith('.woff2'))
                );

                // 將資源存入 Archive
                for (const req of assetsToArchive) {
                  const response = await oldCache.match(req);
                  if (response) {
                    await archiveCache.put(req, response);
                  }
                }
                console.log(`[SW] 已備份 ${assetsToArchive.length} 個舊資源至 Archive`);
              } catch (e) {
                console.warn('[SW] 備份舊快取資源失敗:', e);
              }
            }

            console.log('[SW] 刪除舊快取:', key);
            return caches.delete(key);
          }
        })
      );

      // 清理 Archive 中過多的舊資源，避免無限制增長
      const archiveRequests = await archiveCache.keys();
      if (archiveRequests.length > MAX_ARCHIVED_ASSETS) {
        const keysToDelete = archiveRequests.slice(0, archiveRequests.length - MAX_ARCHIVED_ASSETS);
        await Promise.all(keysToDelete.map(req => archiveCache.delete(req)));
        console.log(`[SW] 清理了 ${keysToDelete.length} 個過期的歷史資產`);
      }
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
    } else {
      // 🚀 [緊急修復] 自癒機制：如果資源 (尤其是 .js) 發生 404，代表可能伺服器已更新但本地 index.html 還是舊的
      if (networkResponse.status === 404) {
        if (request.url.endsWith('.js') || request.url.includes('/assets/')) {
          console.warn('[SW] 偵測到關鍵資產 404，正在清理 index.html 快取以強制自癒...', request.url);
          caches.open(STATIC_CACHE).then(cache => {
            cache.delete(`${BASE_PATH}index.html`);
            cache.delete(BASE_PATH); // 也刪除根路徑的快取
          });
        }
      }
    }
    return networkResponse;
  } catch (error) {
    console.warn('[SW] Cache First 失敗:', request.url, error);

    // 如果是 JS 加載失敗，嘗試清理 index 快取
    if (request.url.endsWith('.js')) {
      caches.open(STATIC_CACHE).then(cache => {
        cache.delete(`${BASE_PATH}index.html`);
        cache.delete(BASE_PATH); // 也刪除根路徑的快取
      });
    }

    return new Response('離線中或資源遺失', { status: 503 });
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
 * Stale While Revalidate 策略（圖片專用持久快取）
 * - 圖片類請求全部寫入 IMAGE_CACHE，避免 CACHE_VERSION 更新時被清掉
 * - 立即返回快取（秒開），背景靜默更新
 * - 超過 MAX_IMAGE_CACHE_ENTRIES 時 LRU 式清掉最舊的
 */
async function staleWhileRevalidate(request) {
  // 判斷是否為圖片類型（含 /previews/）→ 使用持久 IMAGE_CACHE
  const isImage =
    /\.(png|jpg|jpeg|gif|webp|svg|ico)(\?.*)?$/i.test(request.url) ||
    request.url.includes('/previews/');

  const cacheName = isImage ? IMAGE_CACHE : DYNAMIC_CACHE;
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  // 在背景更新快取
  const fetchPromise = fetch(request)
    .then(async (networkResponse) => {
      if (networkResponse.ok && networkResponse.status === 200) {
        await cache.put(request, networkResponse.clone());
        // 只對 IMAGE_CACHE 做 LRU 清理（避免無限膨脹）
        if (isImage) {
          trimCache(cacheName, MAX_IMAGE_CACHE_ENTRIES).catch(() => { });
        }
      }
      return networkResponse;
    })
    .catch((error) => {
      console.warn('[SW] 背景更新失敗:', request.url, error);
      return null;
    });

  // 如果有快取就立即返回（秒開），否則等待網路
  return cached || fetchPromise;
}

/**
 * LRU 式快取修剪：超過上限時刪除最舊的 key
 * （Cache Storage API 沒有原生 LRU，這是近似實作：以插入順序當 LRU）
 */
async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    const toDelete = keys.slice(0, keys.length - maxEntries);
    await Promise.all(toDelete.map((req) => cache.delete(req)));
    console.log(`[SW] IMAGE_CACHE 已清理 ${toDelete.length} 個舊圖片`);
  }
}

// ==================== 訊息處理 ====================
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting' || event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data === 'getVersion') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});
