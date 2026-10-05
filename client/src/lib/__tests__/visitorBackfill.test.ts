import { expect, it, vi } from 'vitest';
vi.mock('@/lib/firebase', () => ({ waitForAppCheck: vi.fn().mockResolvedValue(false) }));
import { backfillLocalAnalytics } from '../visitorTracker';
it('未通過驗證的回填不宣稱成功、不寫完成旗標', async () => {
  localStorage.clear();
  localStorage.setItem('visitorDeviceStats', JSON.stringify({ desktop: 3 }));
  expect(await backfillLocalAnalytics()).toMatchObject({ ok: false, totalAdded: 0 });
  expect(localStorage.getItem('analyticsBackfilled')).toBeNull();
});
