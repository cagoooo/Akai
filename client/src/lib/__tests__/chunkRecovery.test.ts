import { describe, expect, it } from 'vitest';
import { createChunkRecoveryGate } from '../chunkRecovery';

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
});
