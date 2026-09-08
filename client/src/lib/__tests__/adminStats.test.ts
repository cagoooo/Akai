import { describe, expect, it } from 'vitest';
import { aggregateToolStats, inclusiveCalendarDays } from '../adminStats';

describe('管理端統計口徑', () => {
  it('含完整末日的今天與跨月範圍不多算一天', () => {
    expect(inclusiveCalendarDays(new Date(2026, 8, 8), new Date(2026, 8, 8, 23, 59, 59))).toBe(1);
    expect(inclusiveCalendarDays(new Date(2026, 7, 10), new Date(2026, 8, 8, 23, 59, 59))).toBe(30);
    expect(inclusiveCalendarDays(new Date(2026, 2, 7), new Date(2026, 2, 9, 23, 59, 59))).toBe(3);
  });
  it('新版無 toolId 欄位仍可讀取，且合併舊文件的累計與每日數字', () => {
    const result = aggregateToolStats([
      { id: '81', data: { totalClicks: 5, dailyClicks: { '2026-09-08': 3 } } },
      { id: 'tool_81', data: { toolId: 81, totalClicks: 2, dailyClicks: { '2026-09-08': 2 } } },
      { id: '14', data: { totalClicks: 21 } },
    ]);
    expect(result.stats).toEqual([{ toolId: 81, totalClicks: 7 }, { toolId: 14, totalClicks: 21 }]);
    expect(result.daily.get(81)).toEqual({ '2026-09-08': 5 });
    expect(result.daily.has(14)).toBe(false);
  });
  it('無效編號及非有限數字不進入圖表', () => {
    expect(aggregateToolStats([
      { id: 'bad', data: { totalClicks: 2 } },
      { id: '81', data: { totalClicks: Infinity } },
      { id: '0', data: { totalClicks: 2 } },
    ]).stats).toEqual([]);
  });
});
