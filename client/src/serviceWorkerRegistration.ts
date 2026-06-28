
// 檢查瀏覽器是否支持 Service Worker
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    if (import.meta.env.DEV) {
      // 開發環境下註銷 Service Worker，避免快取干擾
      console.log('開發環境: 註銷 Service Worker');
      unregisterServiceWorker();
      return;
    }

    // 🚀 [作用域污染自癒]：自動清除註冊在根目錄 `/` 且控制了本專案的 Service Worker，避免被其舊快取劫持
    const expectedScope = new URL(import.meta.env.BASE_URL, window.location.origin).href;
    if (navigator.serviceWorker.getRegistrations) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((reg) => {
          if (reg.scope && reg.scope !== expectedScope && expectedScope.startsWith(reg.scope)) {
            console.warn(`[SW] 偵測到可能發生衝突的大範圍 Service Worker: ${reg.scope}，正在強制註銷以解決網頁劫持...`);
            reg.unregister().then((success) => {
              if (success) {
                console.log(`[SW] 已成功註銷衝突的 Service Worker: ${reg.scope}`);
                window.location.reload();
              }
            });
          }
        });
      });
    }

    window.addEventListener('load', () => {
      const swPath = import.meta.env.BASE_URL + 'sw.js';
      navigator.serviceWorker.register(swPath, { updateViaCache: 'none' })
        .then((reg) => {
          console.log('ServiceWorker 註冊成功:', reg.scope);

          const _watchWorker = (worker: ServiceWorker) => {
            worker.addEventListener('statechange', () => {
              // 當新 SW 安裝完成且有舊的 controller 時，代表是更新而非首裝
              if (worker.state === 'installed' && navigator.serviceWorker.controller) {
                _showSwUpdateToast(worker);
              }
            });
          };

          // 初始檢查：如果有已經在 waiting 狀態的新 SW (重整頁面後)
          if (reg.waiting) {
            // 🚀 [最強自動更新]：網頁剛載入時若有 waiting 的新版，不彈 Toast 直接自動啟用並重整
            console.log('[SW] 偵測到 waiting 中的新版本，自動啟用並重新整理網頁...');
            let _reloaded = false;
            navigator.serviceWorker.addEventListener('controllerchange', () => {
              if (!_reloaded) {
                _reloaded = true;
                window.location.reload();
              }
            });
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
            return;
          }

          // 監聽正在安裝的新 SW
          if (reg.installing) {
            _watchWorker(reg.installing);
          }

          reg.addEventListener('updatefound', () => {
            if (reg.installing) {
              _watchWorker(reg.installing);
            }
          });

          // 備份機制：接收來自 sw.js activate 時的 postMessage
          navigator.serviceWorker.addEventListener('message', (e) => {
            if (e.data?.type === 'SW_ACTIVATED' && navigator.serviceWorker.controller) {
              _showSwUpdateToast(null);
            }
          });
        })
        .catch((error) => {
          console.error('ServiceWorker 註冊失敗:', error);
        });
    });
  }
}

function _showSwUpdateToast(waitingWorker: ServiceWorker | null) {
  if (document.getElementById('sw-update-toast')) return;

  const toast = document.createElement('div');
  toast.id = 'sw-update-toast';
  
  // 現代化精緻玻璃摩砂 (Glassmorphism) 設計樣式
  toast.style.position = 'fixed';
  toast.style.bottom = '24px';
  toast.style.right = '24px';
  toast.style.backgroundColor = 'rgba(23, 23, 23, 0.85)';
  toast.style.backdropFilter = 'blur(8px)';
  toast.style.color = '#ffffff';
  toast.style.padding = '14px 20px';
  toast.style.borderRadius = '12px';
  toast.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)';
  toast.style.zIndex = '99999';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.gap = '14px';
  toast.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  toast.style.border = '1px solid rgba(255, 255, 255, 0.15)';
  toast.style.animation = 'swSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards';

  if (!document.getElementById('sw-toast-style')) {
    const style = document.createElement('style');
    style.id = 'sw-toast-style';
    style.innerHTML = `
      @keyframes swSlideIn {
        from { transform: translateY(100px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
  
  toast.innerHTML = `
    <span style="font-weight: 500; font-size: 14px; display: flex; align-items: center; gap: 6px;">
      ✨ 網站內容已更新
    </span>
    <button id="sw-reload-btn" style="
      background-color: #eab308;
      color: #0c0a09;
      border: none;
      padding: 6px 14px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s;
    ">立即重整</button>
    <button class="sw-dismiss-btn" aria-label="關閉" style="
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.4);
      cursor: pointer;
      font-size: 14px;
      padding: 4px;
      line-height: 1;
      transition: color 0.2s;
    ">✕</button>
  `;
  document.body.appendChild(toast);

  const reloadBtn = document.getElementById('sw-reload-btn');
  const dismissBtn = toast.querySelector('.sw-dismiss-btn') as HTMLElement;

  if (reloadBtn) {
    reloadBtn.addEventListener('mouseenter', () => {
      reloadBtn.style.backgroundColor = '#ca8a04';
      reloadBtn.style.transform = 'scale(1.03)';
    });
    reloadBtn.addEventListener('mouseleave', () => {
      reloadBtn.style.backgroundColor = '#eab308';
      reloadBtn.style.transform = 'scale(1)';
    });
    reloadBtn.addEventListener('click', () => {
      toast.remove();
      if (waitingWorker) {
        let _reloaded = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!_reloaded) {
            _reloaded = true;
            window.location.reload();
          }
        });
        waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      } else {
        window.location.reload();
      }
    });
  }

  if (dismissBtn) {
    dismissBtn.addEventListener('mouseenter', () => {
      dismissBtn.style.color = 'rgba(255, 255, 255, 0.8)';
    });
    dismissBtn.addEventListener('mouseleave', () => {
      dismissBtn.style.color = 'rgba(255, 255, 255, 0.4)';
    });
    dismissBtn.addEventListener('click', () => toast.remove());
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

