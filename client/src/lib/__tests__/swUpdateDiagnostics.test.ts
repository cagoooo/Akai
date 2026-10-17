import { afterEach, describe, expect, it, vi } from 'vitest';
import { isServiceWorkerScriptFetchFailure, reportServiceWorkerUpdateFailure } from '../swUpdateDiagnostics';

const SCOPE = "('https://cagoooo.github.io/Akai/') with script ('https://cagoooo.github.io/Akai/sw.js')";
const swError = (reason: string) => new TypeError(`Failed to update a ServiceWorker for scope ${SCOPE}: ${reason}`);
const response = (ok: boolean) => ({ ok } as Response);

describe('Service Worker 更新檢查失敗的回報', () => {
  afterEach(() => vi.restoreAllMocks());

  it('只辨識「抓不到 sw.js」類的失敗，腳本本身有問題的照常視為真錯誤', () => {
    // 2026-10-12 告警：高雄的 Chrome 單次更新檢查回 Not found，之後伺服器正常
    expect(isServiceWorkerScriptFetchFailure(swError('Not found'))).toBe(true);
    expect(isServiceWorkerScriptFetchFailure(swError('A bad HTTP response code (503) was received when fetching the script.'))).toBe(true);
    expect(isServiceWorkerScriptFetchFailure(swError('An unknown error occurred when fetching the script.'))).toBe(true);

    expect(isServiceWorkerScriptFetchFailure(swError('ServiceWorker script evaluation failed'))).toBe(false);
    expect(isServiceWorkerScriptFetchFailure(swError('The script has an unsupported MIME type (\'text/html\').'))).toBe(false);
    expect(isServiceWorkerScriptFetchFailure(new TypeError('Failed to fetch'))).toBe(false);
    expect(isServiceWorkerScriptFetchFailure(new Error('offline'))).toBe(false);
    expect(isServiceWorkerScriptFetchFailure('Not found')).toBe(false);
  });

  it('Safari／iOS 抓不到 sw.js 的 SecurityError 也先探測伺服器（2026-10-17 JAVASCRIPT-REACT-16）', async () => {
    const webkit = new DOMException('Script https://cagoooo.github.io/Akai/sw.js load failed', 'SecurityError');
    expect(isServiceWorkerScriptFetchFailure(webkit)).toBe(true);
    expect(isServiceWorkerScriptFetchFailure(new DOMException('Script https://evil.example/other.js load failed', 'SecurityError'))).toBe(false);
    expect(isServiceWorkerScriptFetchFailure(new DOMException('The operation is insecure.', 'SecurityError'))).toBe(false);

    const report = vi.fn();
    vi.spyOn(console, 'info').mockImplementation(() => {});
    await reportServiceWorkerUpdateFailure(webkit, { fetchImpl: vi.fn().mockResolvedValue(response(true)), report });
    expect(report).not.toHaveBeenCalled();
    await reportServiceWorkerUpdateFailure(webkit, { fetchImpl: vi.fn().mockResolvedValue(response(false)), report });
    expect(report).toHaveBeenCalledWith('[PWA] 更新檢查失敗：', webkit, 'warn');
  });

  it('伺服器上的 sw.js 正常：視為暫時失敗，不回報', async () => {
    const report = vi.fn();
    const fetchImpl = vi.fn().mockResolvedValue(response(true));
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});

    await reportServiceWorkerUpdateFailure(swError('Not found'), { swUrl: '/Akai/sw.js', fetchImpl, report });

    expect(fetchImpl).toHaveBeenCalledWith('/Akai/sw.js', { method: 'HEAD', cache: 'no-store' });
    expect(report).not.toHaveBeenCalled();
    expect(info).toHaveBeenCalledTimes(1);
  });

  it('連不上伺服器：是訪客的網路問題，不回報', async () => {
    const report = vi.fn();
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    vi.spyOn(console, 'info').mockImplementation(() => {});

    await reportServiceWorkerUpdateFailure(swError('An unknown error occurred when fetching the script.'), { fetchImpl, report });

    expect(report).not.toHaveBeenCalled();
  });

  it('伺服器確實回 404 或 5xx：sw.js 可能真的不見了，照常回報', async () => {
    const error = swError('Not found');
    const report = vi.fn();
    const fetchImpl = vi.fn().mockResolvedValue(response(false));

    await reportServiceWorkerUpdateFailure(error, { fetchImpl, report });

    expect(report).toHaveBeenCalledWith('[PWA] 更新檢查失敗：', error, 'warn');
  });

  it('其他錯誤不探測、直接照常回報', async () => {
    const report = vi.fn();
    const fetchImpl = vi.fn();
    const error = swError('ServiceWorker script evaluation failed');

    await reportServiceWorkerUpdateFailure(error, { fetchImpl, report });

    expect(fetchImpl).not.toHaveBeenCalled();
    expect(report).toHaveBeenCalledWith('[PWA] 更新檢查失敗：', error, 'warn');
  });

  it('Safari 註冊裡沒有 worker（newestWorker is null）：不探測、不回報', async () => {
    // 2026-10-13 告警：iPhone Safari 的 registration.update() 丟 InvalidStateError
    const report = vi.fn();
    const fetchImpl = vi.fn();
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});

    await reportServiceWorkerUpdateFailure(new DOMException('newestWorker is null', 'InvalidStateError'), { fetchImpl, report });

    expect(fetchImpl).not.toHaveBeenCalled();
    expect(report).not.toHaveBeenCalled();
    expect(info).toHaveBeenCalledTimes(1);
  });
});
