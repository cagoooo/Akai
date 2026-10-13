import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  PWA_UPDATE_AVAILABLE_EVENT,
  shouldAnnounceServiceWorkerActivation,
  watchServiceWorkerRegistration,
} from './serviceWorkerRegistration';

class FakeWorker extends EventTarget {
  state: ServiceWorkerState = 'installing';
  postMessage = vi.fn();
}

class FakeRegistration extends EventTarget {
  scope = 'https://example.test/Akai/';
  waiting: ServiceWorker | null = null;
  installing: ServiceWorker | null = null;
}

describe('Service Worker 更新通知', () => {
  const originalServiceWorker = Object.getOwnPropertyDescriptor(navigator, 'serviceWorker');

  afterEach(() => {
    if (originalServiceWorker) {
      Object.defineProperty(navigator, 'serviceWorker', originalServiceWorker);
    }
    vi.restoreAllMocks();
  });

  it('發現 waiting worker 時自動靜默套用 SKIP_WAITING（陷阱 #18）', () => {
    // 測試新行為：有 waiting worker 時，自動送出 SKIP_WAITING，不等使用者手動確認。
    // 這能解決使用者重整後看不到更新通知而卡在舊版的問題（pwa-cache-bust SKILL 陷阱 #18）。
    const worker = new FakeWorker();
    worker.state = 'installed';
    const registration = new FakeRegistration();
    registration.waiting = worker as unknown as ServiceWorker;

    const mockAddEventListener = vi.fn();
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        controller: {},
        addEventListener: mockAddEventListener,
      },
    });

    // 不需要監聽 PWA_UPDATE_AVAILABLE_EVENT，新行為是直接 SKIP_WAITING 不通知
    watchServiceWorkerRegistration(registration as unknown as ServiceWorkerRegistration);

    // 應呼叫 SKIP_WAITING 讓 SW 立即激活
    expect(worker.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
    // 應監聽 controllerchange 準備 reload（防無限 reload 旗標）
    expect(mockAddEventListener).toHaveBeenCalledWith('controllerchange', expect.any(Function));
  });

  it('安裝中的 worker 進入 installed 後才通知 UI', () => {
    const worker = new FakeWorker();
    const registration = new FakeRegistration();
    registration.installing = worker as unknown as ServiceWorker;
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { controller: {} },
    });
    const onUpdate = vi.fn();
    window.addEventListener(PWA_UPDATE_AVAILABLE_EVENT, onUpdate, { once: true });

    watchServiceWorkerRegistration(registration as unknown as ServiceWorkerRegistration);
    expect(onUpdate).not.toHaveBeenCalled();

    worker.state = 'installed';
    worker.dispatchEvent(new Event('statechange'));
    expect(onUpdate).toHaveBeenCalledOnce();
  });

  describe('SW_ACTIVATED 啟用訊號：只有「已被控制的分頁」才算有新版', () => {
    const controller = {} as ServiceWorker;

    it('分頁載入時就已被 SW 控制：啟用訊號代表更新', () => {
      expect(shouldAnnounceServiceWorkerActivation({ type: 'SW_ACTIVATED' }, true, controller)).toBe(true);
    });

    it('全新訪客第一次造訪（載入時沒有 SW 控制）：SW 剛裝好接管分頁，不算更新，否則閒置約 29 秒後會被無故重整', () => {
      // 此時 controller 已因 clients.claim() 變成非空，但分頁載入時沒有，所以不能當更新
      expect(shouldAnnounceServiceWorkerActivation({ type: 'SW_ACTIVATED' }, false, controller)).toBe(false);
    });

    it('沒有控制中的 SW、或不是啟用訊號、或資料格式不對：都不通知', () => {
      expect(shouldAnnounceServiceWorkerActivation({ type: 'SW_ACTIVATED' }, true, null)).toBe(false);
      expect(shouldAnnounceServiceWorkerActivation({ type: 'OTHER' }, true, controller)).toBe(false);
      expect(shouldAnnounceServiceWorkerActivation(null, true, controller)).toBe(false);
      expect(shouldAnnounceServiceWorkerActivation('SW_ACTIVATED', true, controller)).toBe(false);
    });
  });

  it('sw.js 安裝階段不會自行 skipWaiting', () => {
    const source = readFileSync(resolve(process.cwd(), 'client/public/sw.js'), 'utf8');
    const registrationSource = readFileSync(
      resolve(process.cwd(), 'client/src/serviceWorkerRegistration.ts'),
      'utf8',
    );
    const installBlock = source.slice(
      source.indexOf("self.addEventListener('install'"),
      source.indexOf("self.addEventListener('activate'"),
    );

    expect(installBlock).not.toContain('self.skipWaiting()');
    expect(source).toContain("event.data?.type === 'SKIP_WAITING'");
    expect(registrationSource).not.toContain("window.addEventListener('load'");
  });
});
