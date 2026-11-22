import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isBrowserStorageAvailable, resetBrowserStorageProbeForTests } from '../browserStorage';

describe('瀏覽器能不能用本機儲存（JAVASCRIPT-REACT-31）', () => {
  // 測試環境（jsdom）本身沒有 IndexedDB，放一個假的代表「瀏覽器有提供」
  beforeEach(() => vi.stubGlobal('indexedDB', {}));
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    resetBrowserStorageProbeForTests();
  });

  it('一般瀏覽器：可以用', () => {
    expect(isBrowserStorageAvailable()).toBe(true);
  });

  it('Safari「阻擋所有 Cookie」：碰 localStorage 就丟 SecurityError → 不能用', () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    });
    expect(isBrowserStorageAvailable()).toBe(false);
  });

  it('寫入被拒（舊版 Safari 私密瀏覽的 QuotaExceededError）→ 不能用', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('The quota has been exceeded.', 'QuotaExceededError');
    });
    expect(isBrowserStorageAvailable()).toBe(false);
  });

  it('沒有 IndexedDB → 不能用', () => {
    vi.stubGlobal('indexedDB', undefined);
    expect(isBrowserStorageAvailable()).toBe(false);
  });

  it('index.html 備援已把 localStorage 換成記憶體替身（旗標）→ 視為不能用', () => {
    (window as { __akaiStorageBlocked?: boolean }).__akaiStorageBlocked = true;
    try {
      expect(isBrowserStorageAvailable()).toBe(false);
    } finally {
      delete (window as { __akaiStorageBlocked?: boolean }).__akaiStorageBlocked;
    }
  });

  it('同一頁只探測一次', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    isBrowserStorageAvailable();
    isBrowserStorageAvailable();
    expect(setItem).toHaveBeenCalledTimes(1);
  });
});
