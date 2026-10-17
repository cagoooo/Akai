import { afterEach, describe, expect, it, vi } from 'vitest';

const invoke = vi.fn();
vi.mock('@/lib/publicAnalyticsService', () => ({ invokePublicAnalytics: (...args: unknown[]) => invoke(...args) }));
import { incrementServerStat } from '../visitorTracker';

const firebaseError = (code: string, message: string) => Object.assign(new Error(message), { name: 'FirebaseError', code });

describe('訪客裝置／來源／地區統計寫入失敗的回報', () => {
  afterEach(() => { vi.restoreAllMocks(); invoke.mockReset(); });

  it('請求沒送完（functions/internal 小寫 internal，2026-10-15 JAVASCRIPT-REACT-H）：不送告警', async () => {
    invoke.mockRejectedValue(firebaseError('functions/internal', 'internal'));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});

    await incrementServerStat('device', 'desktop');

    expect(warn).not.toHaveBeenCalled();
    expect(info).toHaveBeenCalledTimes(1);
  });

  it('後端真的回錯（大寫 INTERNAL、權限不足）照常回報', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    for (const err of [firebaseError('functions/internal', 'INTERNAL'), firebaseError('functions/permission-denied', 'denied')]) {
      invoke.mockRejectedValueOnce(err);
      await incrementServerStat('device', 'desktop');
    }
    expect(warn).toHaveBeenCalledTimes(2);
  });
});
