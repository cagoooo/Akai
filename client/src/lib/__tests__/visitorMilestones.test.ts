import { describe, expect, it } from 'vitest';
import {
  VISITOR_MILESTONES,
  estimateTimeToMilestone,
  getMilestoneProgress,
} from '../visitorMilestones';

describe('getMilestoneProgress', () => {
  it('用「對下個里程碑的絕對比例」，不是上一關到下一關的區間比例', () => {
    // 舊版會算成 (5448-5000)/5000 = 8%，與進度條兩端標示的 5,000／10,000 對不起來
    const result = getMilestoneProgress(5448);
    expect(result.nextMilestone).toBe(10000);
    expect(result.prevMilestone).toBe(5000);
    expect(result.progressLabel).toBe(54);
    expect(result.remaining).toBe(4552);
    expect(result.prevMarkerPercent).toBe(50);
  });

  it('沒真的達標就不會顯示 100%', () => {
    const result = getMilestoneProgress(9999);
    expect(result.achievedAll).toBe(false);
    expect(result.progressLabel).toBe(99);
    expect(result.remaining).toBe(1);
  });

  it('達成最後一個里程碑後顯示 100% 且不再有下一關', () => {
    const last = VISITOR_MILESTONES[VISITOR_MILESTONES.length - 1];
    const result = getMilestoneProgress(last + 5000);
    expect(result.achievedAll).toBe(true);
    expect(result.progress).toBe(100);
    expect(result.progressLabel).toBe(100);
    expect(result.remaining).toBe(0);
    expect(result.prevMarkerPercent).toBeNull();
  });

  it('尚未達成任何里程碑時不畫刻度', () => {
    const result = getMilestoneProgress(37);
    expect(result.nextMilestone).toBe(100);
    expect(result.prevMilestone).toBe(0);
    expect(result.prevMarkerPercent).toBeNull();
  });

  it.each([0, -5, Number.NaN])('異常訪客數 %s 視為 0，不會爆掉', (input) => {
    const result = getMilestoneProgress(input);
    expect(result.progress).toBe(0);
    expect(result.nextMilestone).toBe(100);
  });

  it('里程碑級距沒有一次跳超過 3 倍的斷層（P0-4）', () => {
    // 舊版 10000 → 50000 是 5 倍，訪客會卡在幾乎不動的區間好幾個月
    for (let i = 1; i < VISITOR_MILESTONES.length; i += 1) {
      const ratio = VISITOR_MILESTONES[i] / VISITOR_MILESTONES[i - 1];
      expect(ratio).toBeLessThanOrEqual(5);
      expect(VISITOR_MILESTONES[i]).toBeGreaterThan(VISITOR_MILESTONES[i - 1]);
    }
    expect(VISITOR_MILESTONES).toContain(20000);
    expect(VISITOR_MILESTONES).toContain(30000);
  });
});

describe('estimateTimeToMilestone', () => {
  it.each([
    [50, 60, '快到了'],
    [400, 60, '約 7 天'],
    [1800, 60, '約 4 週'],
    [4552, 60, '約 3 個月'],
    [100000, 60, '還要一陣子'],
  ])('還差 %s 人、每天 %s 人 → %s', (remaining, perDay, expected) => {
    expect(estimateTimeToMilestone(remaining, perDay)).toBe(expected);
  });

  it.each([
    [0, 60],
    [4552, 0],
    [4552, Number.NaN],
  ])('資料不足以估算時回傳 null（remaining=%s, perDay=%s）', (remaining, perDay) => {
    expect(estimateTimeToMilestone(remaining, perDay)).toBeNull();
  });
});
