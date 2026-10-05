import { afterEach, describe, expect, it, vi } from 'vitest';
import { createAppCheckReadiness } from '../appCheckReadiness';

afterEach(() => vi.useRealTimers());
describe('App Check 就緒條件', () => {
  it('首次互動前不啟動驗證，初始化共享但每次會確認有效 token', async () => {
    let engage!: () => void;
    const interaction = new Promise<void>(resolve => { engage = resolve; });
    const token = vi.fn().mockResolvedValue('valid-token');
    const bootstrap = vi.fn().mockResolvedValue(token);
    const ready = createAppCheckReadiness(bootstrap, interaction);
    const first = ready();
    expect(bootstrap).not.toHaveBeenCalled();
    engage();
    expect(await first).toBe(true);
    expect(await ready()).toBe(true);
    expect(bootstrap).toHaveBeenCalledTimes(1);
    expect(token).toHaveBeenCalledTimes(2);
    token.mockRejectedValue(new Error('expired token'));
    expect(await ready()).toBe(false);
  });
  it('初始化失敗或空 token 都不能當成已通過', async () => {
    const failed = createAppCheckReadiness(async () => { throw new Error('blocked'); }, Promise.resolve());
    expect(await failed()).toBe(false);
    const empty = createAppCheckReadiness(async () => async () => '', Promise.resolve());
    expect(await empty()).toBe(false);
  });
  it('等待逾時回傳未就緒，成功時清除 timeout', async () => {
    vi.useFakeTimers();
    const ready = createAppCheckReadiness(async () => async () => new Promise<string>(() => {}), Promise.resolve());
    const result = ready(100);
    await vi.advanceTimersByTimeAsync(100);
    expect(await result).toBe(false);
    const immediate = createAppCheckReadiness(async () => async () => 'valid', Promise.resolve());
    expect(await immediate()).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });
});
