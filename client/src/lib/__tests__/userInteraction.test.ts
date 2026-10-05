import { afterEach, expect, it, vi } from 'vitest';
afterEach(() => vi.restoreAllMocks());

it('未操作不啟動第三方工作，鍵盤操作可啟動且解除事件監聽', async () => {
  vi.resetModules();
  const remove = vi.spyOn(window, 'removeEventListener');
  const { userInteractionReady } = await import('../userInteraction');
  const work = vi.fn();
  void userInteractionReady.then(work);
  await Promise.resolve();
  expect(work).not.toHaveBeenCalled();
  window.dispatchEvent(new Event('keydown'));
  await userInteractionReady;
  expect(work).toHaveBeenCalledTimes(1);
  expect(remove.mock.calls.filter(([name]) => ['pointerdown', 'keydown', 'touchstart', 'wheel'].includes(name))).toHaveLength(4);
  window.dispatchEvent(new Event('pointerdown'));
  await Promise.resolve();
  expect(work).toHaveBeenCalledTimes(1);
});
