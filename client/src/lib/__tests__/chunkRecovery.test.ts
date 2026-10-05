import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createChunkRecoveryGate,
  installStaleChunkRecovery,
  isAppAssetUrl,
  isChunkLoadError,
  removeLegacyHealParam,
} from '../chunkRecovery';

function createMemoryStorage() {
  const entries = new Map<string, string>();
  return {
    get length() {
      return entries.size;
    },
    key: (index: number) => [...entries.keys()][index] ?? null,
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => entries.set(key, value),
  };
}

describe('動態模組載入失敗復原', () => {
  it('同一頁只啟動一次重載，重複事件共用防迴圈狀態', () => {
    const gate = createChunkRecoveryGate(createMemoryStorage(), 'release-a');
    const reason = 'Failed to fetch dynamically imported module: https://example.test/assets/old-chunk.js';

    expect(gate(reason)).toBe(true);
    expect(gate(reason)).toBe(false);
    expect(gate('https://example.test/assets/another-chunk.js')).toBe(false);
  });

  it('重新載入後可重試另一個模組，同一模組不重複，且每個版本最多兩次', () => {
    const storage = createMemoryStorage();
    const firstPage = createChunkRecoveryGate(storage, 'release-a');
    expect(firstPage('https://example.test/assets/chunk-a.js')).toBe(true);

    const secondPage = createChunkRecoveryGate(storage, 'release-a');
    expect(secondPage('https://example.test/assets/chunk-a.js')).toBe(false);
    expect(secondPage('https://example.test/assets/chunk-b.js')).toBe(true);

    const thirdPage = createChunkRecoveryGate(storage, 'release-a');
    expect(thirdPage('https://example.test/assets/chunk-c.js')).toBe(false);
    expect(createChunkRecoveryGate(storage, 'release-b')('https://example.test/assets/chunk-c.js')).toBe(true);
  });

  it('同一個雜湊資源的查詢參數變化不會耗掉第二次重試額度', () => {
    const storage = createMemoryStorage();
    expect(createChunkRecoveryGate(storage, 'release-a')('https://example.test/assets/chunk.js?first=1')).toBe(true);
    expect(createChunkRecoveryGate(storage, 'release-a')('https://example.test/assets/chunk.js?first=2')).toBe(false);
  });

  it('Vite CSS 預載的相對路徑與資源錯誤的完整網址視為同一模組', () => {
    const storage = createMemoryStorage();
    expect(createChunkRecoveryGate(storage, 'release-a')('Unable to preload CSS for /Akai/assets/Blog-abc123.css')).toBe(true);
    expect(createChunkRecoveryGate(storage, 'release-a')('https://cagoooo.github.io/Akai/assets/Blog-abc123.css')).toBe(false);
  });
});

describe('chunk 錯誤判斷集中在同一處', () => {
  it('涵蓋各瀏覽器與 Vite 的動態模組失敗訊息', () => {
    const messages = [
      'Failed to fetch dynamically imported module: https://cagoooo.github.io/Akai/assets/ReviewList-CLSmCqYZ.js',
      'error loading dynamically imported module: https://cagoooo.github.io/Akai/assets/ReviewList-CLSmCqYZ.js',
      'Importing a module script failed.',
      'Unable to preload CSS for /Akai/assets/index-abc123.css',
      'ChunkLoadError: Loading chunk 42 failed.',
      'Loading CSS chunk vendors-main failed.',
    ];
    for (const message of messages) expect(isChunkLoadError(message)).toBe(true);
  });

  it('一般錯誤不會被誤判成 chunk 失敗', () => {
    const messages = [
      "Cannot read properties of undefined (reading 'map')",
      'Failed to fetch',
      'Loading data failed',
      '',
      null,
      undefined,
    ];
    for (const message of messages) expect(isChunkLoadError(message)).toBe(false);
  });

  it('只把本站 assets 底下的 JS / CSS 視為可自癒資源', () => {
    const origin = 'https://cagoooo.github.io';
    expect(isAppAssetUrl(`${origin}/Akai/assets/index-abc123.js`, origin)).toBe(true);
    expect(isAppAssetUrl(`${origin}/Akai/assets/Blog-abc123.css?v=1`, origin)).toBe(true);
    expect(isAppAssetUrl(`${origin}/Akai/assets/worker-abc123.mjs`, origin)).toBe(true);
    expect(isAppAssetUrl(`${origin}/Akai/assets/logo-abc123.png`, origin)).toBe(false);
    expect(isAppAssetUrl(`${origin}/Akai/sw.js`, origin)).toBe(false);
    expect(isAppAssetUrl('https://cdn.example.com/assets/widget.js', origin)).toBe(false);
    expect(isAppAssetUrl('not a url', origin)).toBe(false);
  });
});

describe('main.tsx 最早期的 stale chunk 監聽', () => {
  const origin = 'https://cagoooo.github.io';
  const cleanups: Array<() => void> = [];

  function rejection(reason: unknown) {
    const event = new Event('unhandledrejection', { cancelable: true });
    Object.defineProperty(event, 'reason', { value: reason });
    return event;
  }

  function failResource(tagName: 'script' | 'link' | 'img', url: string) {
    const element = document.createElement(tagName);
    if (element instanceof HTMLLinkElement) {
      element.rel = 'stylesheet';
      element.href = url;
    } else {
      (element as HTMLScriptElement | HTMLImageElement).src = url;
    }
    document.head.append(element);
    element.dispatchEvent(new Event('error'));
    element.remove();
  }

  function install(gate: (reason: string) => boolean) {
    const reload = vi.fn();
    cleanups.push(installStaleChunkRecovery({ origin, beginRecovery: gate, reload }));
    return reload;
  }

  beforeEach(() => {
    sessionStorage.clear();
    vi.spyOn(console, 'info').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn');
    vi.spyOn(console, 'error');
  });

  afterEach(() => {
    cleanups.splice(0).forEach((cleanup) => cleanup());
    vi.restoreAllMocks();
  });

  it('與 App / ErrorBoundary 共用額度：同一頁的多個失敗只重載一次', () => {
    const gate = createChunkRecoveryGate(createMemoryStorage(), 'release-a');
    const reload = install(gate);

    const event = rejection(new TypeError(`Failed to fetch dynamically imported module: ${origin}/Akai/assets/Tool-a1.js`));
    window.dispatchEvent(event);
    failResource('link', `${origin}/Akai/assets/Tool-b2.css`);
    window.dispatchEvent(rejection(new TypeError('Importing a module script failed.')));

    expect(event.defaultPrevented).toBe(true);
    expect(reload).toHaveBeenCalledTimes(1);
    // App 的全域監聽與 ErrorBoundary 在同一頁接到後續錯誤時不再各自重載
    expect(gate(`${origin}/Akai/assets/Tool-c3.js`)).toBe(false);
  });

  it('重載後同一模組仍失敗不再重載，換另一模組可再試一次', () => {
    const storage = createMemoryStorage();
    const firstReload = install(createChunkRecoveryGate(storage, 'release-a'));
    failResource('script', `${origin}/Akai/assets/Tool-a1.js`);
    expect(firstReload).toHaveBeenCalledTimes(1);

    const secondReload = install(createChunkRecoveryGate(storage, 'release-a'));
    window.dispatchEvent(rejection(new TypeError(`error loading dynamically imported module: ${origin}/Akai/assets/Tool-a1.js`)));
    expect(secondReload).not.toHaveBeenCalled();
    failResource('link', `${origin}/Akai/assets/Tool-b2.css`);
    expect(secondReload).toHaveBeenCalledTimes(1);
  });

  it('第三方或非程式資源載入失敗、一般 Promise 錯誤都不會觸發重載', () => {
    const gate = vi.fn(() => true);
    const reload = install(gate);

    failResource('script', 'https://cdn.example.com/assets/widget.js');
    failResource('img', `${origin}/Akai/assets/logo-abc123.png`);
    failResource('script', `${origin}/Akai/sw.js`);
    const event = rejection(new TypeError("Cannot read properties of undefined (reading 'map')"));
    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
    expect(gate).not.toHaveBeenCalled();
    expect(reload).not.toHaveBeenCalled();
  });

  it('自癒紀錄只用 console.info，不觸發 Sentry 的 warn / error 告警', () => {
    install(createChunkRecoveryGate(createMemoryStorage(), 'release-a'));
    window.dispatchEvent(rejection(new TypeError(`Failed to fetch dynamically imported module: ${origin}/Akai/assets/Tool-a1.js`)));
    window.dispatchEvent(rejection(new TypeError(`Failed to fetch dynamically imported module: ${origin}/Akai/assets/Tool-a1.js`)));

    expect(console.info).toHaveBeenCalledTimes(1);
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });

  it('預設接上 App / ErrorBoundary 使用的同一個 tryBeginChunkRecovery', async () => {
    vi.resetModules();
    const fresh = await import('../chunkRecovery');
    const reload = vi.fn();
    cleanups.push(fresh.installStaleChunkRecovery({ reload }));

    window.dispatchEvent(rejection(new TypeError(`Failed to fetch dynamically imported module: ${window.location.origin}/assets/Tool-a1.js`)));

    expect(reload).toHaveBeenCalledTimes(1);
    expect(fresh.tryBeginChunkRecovery('Importing a module script failed.')).toBe(false);
  });
});

describe('舊版自癒留下的 _heal 參數', () => {
  afterEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('移除 _heal，保留其他查詢參數與錨點', () => {
    window.history.replaceState(null, '', '/Akai/?_heal=1791240286508&redirect=%2Ftool%2F5#reviews');
    removeLegacyHealParam();
    expect(window.location.pathname).toBe('/Akai/');
    expect(window.location.search).toBe('?redirect=%2Ftool%2F5');
    expect(window.location.hash).toBe('#reviews');
  });

  it('沒有 _heal 時不改寫歷史紀錄', () => {
    window.history.replaceState(null, '', '/Akai/?redirect=%2Ftool%2F5');
    const replaceState = vi.spyOn(window.history, 'replaceState');
    removeLegacyHealParam();
    expect(replaceState).not.toHaveBeenCalled();
    replaceState.mockRestore();
  });
});
