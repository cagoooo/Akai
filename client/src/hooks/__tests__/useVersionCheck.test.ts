import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getBundledVersionInfo, useVersionCheck } from '../useVersionCheck';

describe('useVersionCheck', () => {
  afterEach(() => vi.restoreAllMocks());

  it('以目前 bundle 版本為基準，線上時間戳較新時立即標記更新', async () => {
    const bundled = getBundledVersionInfo();
    expect(bundled).not.toBeNull();

    const latest = {
      ...bundled!,
      cacheVersion: `${bundled!.cacheVersion}-new`,
      buildTimestamp: bundled!.buildTimestamp + 1_000,
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(latest),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { result, unmount } = renderHook(() => useVersionCheck({ intervalMs: 60_000 }));

    await waitFor(() => expect(result.current.hasNewVersion).toBe(true));
    expect(result.current.localVersion?.cacheVersion).toBe(bundled!.cacheVersion);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('version.json?t='),
      { cache: 'no-store' },
    );
    unmount();
  });

  it('網路暫時中斷（iOS Load failed）只記 info，不送 warn 告警', async () => {
    // 2026-10-13 告警：iPhone Chrome 單次抓 version.json 失敗
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('Load failed'));
    vi.stubGlobal('fetch', fetchMock);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});

    const { unmount } = renderHook(() => useVersionCheck({ intervalMs: 60_000 }));

    await waitFor(() => expect(info).toHaveBeenCalledWith('[useVersionCheck] 暫時連不上網路，稍後自動重試'));
    expect(warn).not.toHaveBeenCalledWith('[useVersionCheck] 無法取得 version.json:', expect.anything());
    unmount();
  });
});
