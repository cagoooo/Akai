import { afterEach, describe, expect, it, vi } from 'vitest';
import { secureRandom } from '../secureRandom';

afterEach(() => { vi.restoreAllMocks(); });

describe('特效與抽樣系統亂數', () => {
  it('使用 getRandomValues，不呼叫弱亂數', () => {
    const weakRandom = vi.spyOn(Math, 'random');
    const system = vi.spyOn(globalThis.crypto, 'getRandomValues');
    for (let i = 0; i < 200; i += 1) {
      const value = secureRandom();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
    expect(system).toHaveBeenCalledTimes(200);
    expect(weakRandom).not.toHaveBeenCalled();
  });

  it('最大與最小系統亂數仍落在 0（含）到 1（不含）', () => {
    const fill = (value: number) => vi.spyOn(globalThis.crypto, 'getRandomValues')
      .mockImplementationOnce(<T extends ArrayBufferView | null>(array: T) => { (array as unknown as Uint32Array)[0] = value; return array; });
    fill(0);
    expect(secureRandom()).toBe(0);
    fill(0xffffffff);
    expect(secureRandom()).toBeLessThan(1);
  });
});
