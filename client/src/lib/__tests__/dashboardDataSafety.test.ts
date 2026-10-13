import { afterEach, describe, expect, it, vi } from 'vitest';
import { readDashboardStorage, safeClickData, safeCount, safeCountRecord, safePercentage, safeToolStats } from '../dashboardDataSafety';

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('儀表板不可信統計資料', () => {
  it('拒絕腳本字串、非數字、負數與超出範圍數值，保留合法統計', () => {
    for (const value of ['0; background:url(javascript:alert(1))', '12', null, {}, -1, NaN, Infinity, 1e100]) {
      expect(safeCount(value)).toBe(0);
    }
    expect(safeCount(123)).toBe(123);
    expect(safeCountRecord({ Taipei: 12, negative: -4, script: '<img onerror=alert(1)>', nested: {} }))
      .toEqual({ Taipei: 12, negative: 0, script: 0, nested: 0 });
  });

  it('不接受陣列或原型污染欄位作為統計字典', () => {
    expect(safeCountRecord(null)).toEqual({});
    expect(safeCountRecord([12])).toEqual({});
    expect(safeCountRecord(JSON.parse('{"__proto__":{"polluted":true},"constructor":2,"prototype":3,"valid":4}')))
      .toEqual({ valid: 4 });
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  it('百分比固定在 0 到 100，不把 NaN 或 Infinity 傳入樣式', () => {
    expect(safePercentage(25, 100)).toBe(25);
    expect(safePercentage(200, 100)).toBe(100);
    expect(safePercentage(10, 0)).toBe(0);
    expect(safePercentage(-3, 10)).toBe(0);
    expect(safePercentage('1; color:red', 10)).toBe(0);
    expect(safePercentage(10, Infinity)).toBe(0);
    expect(safePercentage(Number.MAX_SAFE_INTEGER, Number.MIN_VALUE)).toBe(100);
  });

  it('損毀 JSON 與禁止讀取儲存空間時安全回退', () => {
    localStorage.setItem('stats', '{bad json');
    expect(readDashboardStorage('stats')).toBeNull();
    localStorage.setItem('stats', '{"Taipei":12}');
    expect(readDashboardStorage('stats')).toEqual({ Taipei: 12 });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(readDashboardStorage('stats')).toBeNull();
  });

  it('工具統計結構不符時不執行陣列方法，也不帶入物件計數', () => {
    expect(safeToolStats({ toolId: 1 })).toEqual([]);
    expect(safeToolStats([null, { toolId: '1', totalClicks: 9 }, { toolId: -2, totalClicks: 5 },
      { toolId: 3, totalClicks: {} }, { toolId: 4, totalClicks: 12, unexpected: 'secret' }]))
      .toEqual([{ toolId: 3, totalClicks: 0 }, { toolId: 4, totalClicks: 12 }]);
  });

  it('匯出熱力圖只保留合法座標與欄位，最多 500 筆', () => {
    const good = { x: 10, y: 20, timestamp: 123, page: '/', extra: 'discard' };
    expect(safeClickData([good, { ...good, x: -1 }, { ...good, y: Infinity },
      { ...good, timestamp: -1 }, { ...good, page: {} }]))
      .toEqual([{ x: 10, y: 20, timestamp: 123, page: '/' }]);
    expect(safeClickData({})).toEqual([]);
    expect(safeClickData(Array.from({ length: 501 }, () => good))).toHaveLength(500);
  });
});
