import { describe, expect, it } from 'vitest';
import { buildAudienceFunnel, sumFunnelDaily } from '../audienceFunnel';

describe('buildAudienceFunnel', () => {
  const funnel = {
    opened: 100,
    audienceSelected: 80,
    schoolLevelSelected: 70,
    teacherRoleSelected: 60,
    departmentSelected: 12,
    painPointsConfirmed: 30,
    resultsShown: 28,
  };

  it('依流程順序算出留存與流失', () => {
    const result = buildAudienceFunnel(funnel);
    expect(result.steps.map((s) => s.key)).toEqual([
      'opened',
      'audienceSelected',
      'schoolLevelSelected',
      'painPointsConfirmed',
      'resultsShown',
    ]);
    expect(result.steps[1].dropped).toBe(20);
    expect(result.steps[1].dropRate).toBeCloseTo(20);
    expect(result.steps[4].retention).toBeCloseTo(28);
    expect(result.completionRate).toBeCloseTo(28);
  });

  it('指出流失最嚴重的一步（這裡是痛點步驟掉了 40 人）', () => {
    const result = buildAudienceFunnel(funnel);
    const biggest = result.steps.find((s) => s.isBiggestDrop);
    expect(biggest?.key).toBe('painPointsConfirmed');
  });

  it('分支步驟不進主漏斗，改以上游為分母', () => {
    const result = buildAudienceFunnel(funnel);
    expect(result.steps.some((s) => s.key === 'teacherRoleSelected')).toBe(false);
    const role = result.branches.find((b) => b.key === 'teacherRoleSelected');
    expect(role?.shareOfParent).toBeCloseTo((60 / 70) * 100);
    const department = result.branches.find((b) => b.key === 'departmentSelected');
    expect(department?.shareOfParent).toBeCloseTo((12 / 60) * 100);
  });

  it('免填資料快速預覽獨立統計，不影響個人化主線完成率', () => {
    const result = buildAudienceFunnel({
      opened: 100,
      audienceSelected: 40,
      schoolLevelSelected: 35,
      painPointsConfirmed: 30,
      resultsShown: 28,
      quickPreviewStarted: 45,
      quickPreviewResultsShown: 42,
    });
    expect(result.completionRate).toBeCloseTo(28);
    expect(
      result.branches.find((branch) => branch.key === 'quickPreviewStarted')?.shareOfParent,
    ).toBeCloseTo(45);
    expect(
      result.branches.find((branch) => branch.key === 'quickPreviewResultsShown')?.shareOfParent,
    ).toBeCloseTo((42 / 45) * 100);
  });

  it('後段步驟數字反而較大時（寫入時間差）強制單調遞減，不會出現越走越多人', () => {
    const result = buildAudienceFunnel({
      opened: 50,
      audienceSelected: 40,
      schoolLevelSelected: 45,
      painPointsConfirmed: 20,
      resultsShown: 18,
    });
    const counts = result.steps.map((s) => s.count);
    expect(counts).toEqual([50, 40, 40, 20, 18]);
  });

  it('樣本太少就不指認最大流失（不拿 3 個人的資料改流程）', () => {
    const result = buildAudienceFunnel({
      opened: 5,
      audienceSelected: 1,
      schoolLevelSelected: 1,
      painPointsConfirmed: 1,
      resultsShown: 1,
    });
    expect(result.hasEnoughSample).toBe(false);
    expect(result.steps.some((s) => s.isBiggestDrop)).toBe(false);
  });

  it('完全沒有資料也不會除以零', () => {
    const result = buildAudienceFunnel(undefined);
    expect(result.completionRate).toBe(0);
    expect(result.steps.every((s) => s.retention === 0)).toBe(true);
  });
});

describe('sumFunnelDaily', () => {
  const now = new Date('2026-07-28T10:00:00+08:00');

  it('只加總區間內的日期', () => {
    const daily = {
      '2026-07-28': { opened: 3, resultsShown: 1 },
      '2026-07-27': { opened: 2 },
      '2026-07-01': { opened: 99 },
    };
    expect(sumFunnelDaily(daily, 7, now)).toEqual({ opened: 5, resultsShown: 1 });
  });

  it('區間內沒有任何資料時回傳 null，讓呼叫端改用累積值並提示', () => {
    expect(sumFunnelDaily({ '2026-01-01': { opened: 9 } }, 7, now)).toBeNull();
    expect(sumFunnelDaily(undefined, 7, now)).toBeNull();
  });

  it('days=null 代表用累積值，不走每日加總', () => {
    expect(sumFunnelDaily({ '2026-07-28': { opened: 3 } }, null, now)).toBeNull();
  });
});
