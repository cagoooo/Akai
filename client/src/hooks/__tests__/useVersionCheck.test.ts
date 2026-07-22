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
});
