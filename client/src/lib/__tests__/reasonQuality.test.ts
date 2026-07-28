import { describe, expect, it } from 'vitest';
import { analyzeReasonQuality, listLeastRecentlyReviewed, type ToolReasonInput } from '../reasonQuality';

const NOW = new Date('2026-07-28T00:00:00.000Z');

const makeTool = (overrides: Partial<ToolReasonInput> = {}): ToolReasonInput => ({
  id: 1,
  title: '英語單字大冒險',
  tags: ['英語單字', '聽力測驗'],
  addedAt: '2026-07-01T00:00:00.000Z',
  audienceFit: {
    painPoints: ['language-learning'],
    reasons: { teacher: '拍一張課本單字頁，AI 就自動整理出單字與 KK 音標，省下建題庫的時間。' },
  },
  ...overrides,
});

describe('analyzeReasonQuality', () => {
  it('寫得具體又切題的理由不會被標記', () => {
    expect(analyzeReasonQuality([makeTool()], undefined, { now: NOW })).toEqual([]);
  });

  it('太短的理由標記為 vague', () => {
    const issues = analyzeReasonQuality(
      [makeTool({ audienceFit: { painPoints: ['language-learning'], reasons: { teacher: '單字工具很實用。' } } })],
      undefined,
      { now: NOW },
    );
    expect(issues[0].kinds).toContain('vague');
    expect(issues[0].detail).toContain('太短');
  });

  it('整句空話標記為 vague', () => {
    const issues = analyzeReasonQuality(
      [makeTool({ audienceFit: { painPoints: ['language-learning'], reasons: { teacher: '這個單字工具功能豐富，非常好用。' } } })],
      undefined,
      { now: NOW },
    );
    expect(issues[0].kinds).toContain('vague');
  });

  it('完全沒提到標籤或痛點概念的理由標記為 off-topic', () => {
    const issues = analyzeReasonQuality(
      [makeTool({
        audienceFit: {
          painPoints: ['language-learning'],
          reasons: { teacher: '介面設計得相當漂亮，載入速度也很快，整體體驗流暢。' },
        },
      })],
      undefined,
      { now: NOW },
    );
    expect(issues[0].kinds).toContain('off-topic');
  });

  it('標籤用 2 字片段比對，避免複合詞誤判（試卷排版 → 排版）', () => {
    const issues = analyzeReasonQuality(
      [makeTool({
        title: '考卷格式自動校正系統',
        tags: ['試卷排版', '列印前檢查'],
        audienceFit: {
          painPoints: ['teacher-workload'],
          reasons: { subject: '任課教師可快速檢查題號、選項與答案區的排版是否跑掉。' },
        },
      })],
      undefined,
      { now: NOW },
    );
    expect(issues).toEqual([]);
  });

  // 「太久沒複查」刻意不是問題訊號：一條寫得好的理由不會因為時間過去就變爛，
  // 而且全站工具會在同一天集體過期，把真正該改的洗掉。
  it('再老的工具，只要理由寫得好就不會被列為問題', () => {
    const issues = analyzeReasonQuality(
      [makeTool({ addedAt: '2020-01-01T00:00:00.000Z' })],
      undefined,
      { now: NOW },
    );
    expect(issues).toEqual([]);
  });

  it('有問題的理由會附上「距上次複查幾天」當排序情境', () => {
    const issues = analyzeReasonQuality(
      [makeTool({
        addedAt: '2026-07-01T00:00:00.000Z',
        audienceFit: { painPoints: ['language-learning'], reasons: { teacher: '很不錯。' } },
      })],
      undefined,
      { now: NOW },
    );
    expect(issues[0].daysSinceReview).toBe(27);
    expect(issues[0].neverReviewed).toBe(true);
  });

  it('有 reasonsReviewedAt 就以複查日為準，不看上架日', () => {
    const issues = analyzeReasonQuality(
      [makeTool({
        addedAt: '2024-01-01T00:00:00.000Z',
        audienceFit: {
          painPoints: ['language-learning'],
          reasonsReviewedAt: '2026-07-21T00:00:00.000Z',
          reasons: { teacher: '很不錯。' },
        },
      })],
      undefined,
      { now: NOW },
    );
    expect(issues[0].daysSinceReview).toBe(7);
    expect(issues[0].neverReviewed).toBe(false);
  });

  it('同樣多問題時，最久沒複查的排前面', () => {
    const older = makeTool({ id: 1, addedAt: '2026-01-01T00:00:00.000Z',
      audienceFit: { painPoints: ['language-learning'], reasons: { teacher: '很不錯。' } } });
    const newer = makeTool({ id: 2, addedAt: '2026-07-20T00:00:00.000Z',
      audienceFit: { painPoints: ['language-learning'], reasons: { teacher: '很不錯。' } } });
    const issues = analyzeReasonQuality([newer, older], undefined, { now: NOW });
    expect(issues.map((i) => i.toolId)).toEqual([1, 2]);
  });

  it('曝光足夠但 CTR 不到全站平均一半 → low-ctr', () => {
    const tools = [makeTool({ id: 1 }), makeTool({ id: 2 })];
    const stats = {
      '1': { imp: 100, clk: 2 },   // CTR 2%
      '2': { imp: 100, clk: 20 },  // CTR 20% → 全站平均 11%
    };
    const issues = analyzeReasonQuality(tools, stats, { now: NOW });
    expect(issues.map((i) => i.toolId)).toEqual([1]);
    expect(issues[0].kinds).toContain('low-ctr');
    expect(issues[0].detail).toContain('CTR 2.0%');
  });

  it('曝光不足時不判 low-ctr，避免小樣本誤判', () => {
    const stats = { '1': { imp: 5, clk: 0 }, '2': { imp: 500, clk: 100 } };
    const issues = analyzeReasonQuality([makeTool({ id: 1 }), makeTool({ id: 2 })], stats, { now: NOW });
    expect(issues).toEqual([]);
  });

  it('問題最多的排在最前面', () => {
    const twoIssues = makeTool({
      id: 9,
      audienceFit: {
        painPoints: ['language-learning'],
        reasons: { teacher: '很不錯。' }, // 太短 ＋ 沒對到題
      },
    });
    const oneIssue = makeTool({
      id: 8,
      audienceFit: {
        painPoints: ['language-learning'],
        reasons: { teacher: '介面設計得相當漂亮，載入速度也很快，整體體驗流暢。' }, // 只有沒對到題
      },
    });
    const issues = analyzeReasonQuality([oneIssue, twoIssues], undefined, { now: NOW });
    expect(issues[0].toolId).toBe(9);
    expect(issues[0].kinds.length).toBeGreaterThan(issues[1].kinds.length);
  });

  it('空白理由略過不判', () => {
    const issues = analyzeReasonQuality(
      [makeTool({ audienceFit: { painPoints: ['language-learning'], reasons: { teacher: '   ' } } })],
      undefined,
      { now: NOW },
    );
    expect(issues).toEqual([]);
  });
});

describe('listLeastRecentlyReviewed', () => {
  it('依「距上次複查」由久到近排序，並標出從未複查者', () => {
    const tools = [
      makeTool({ id: 1, addedAt: '2026-07-20T00:00:00.000Z' }),
      makeTool({ id: 2, addedAt: '2026-01-01T00:00:00.000Z' }),
      makeTool({
        id: 3,
        addedAt: '2020-01-01T00:00:00.000Z',
        audienceFit: {
          painPoints: ['language-learning'],
          reasonsReviewedAt: '2026-07-27T00:00:00.000Z',
          reasons: { teacher: '拍一張課本單字頁，AI 就自動整理出單字與 KK 音標。' },
        },
      }),
    ];
    const result = listLeastRecentlyReviewed(tools, 10, NOW);
    expect(result.map((r) => r.toolId)).toEqual([2, 1, 3]);
    expect(result[0].neverReviewed).toBe(true);
    expect(result[2].neverReviewed).toBe(false); // #3 有蓋章，天數最短
    expect(result[2].daysSinceReview).toBe(1);
  });

  it('沒有任何日期可判斷的工具不列入', () => {
    const noDate = makeTool({ id: 7, addedAt: undefined });
    expect(listLeastRecentlyReviewed([noDate], 10, NOW)).toEqual([]);
  });

  it('尊重 limit', () => {
    const many = Array.from({ length: 30 }, (_, i) => makeTool({ id: i + 1 }));
    expect(listLeastRecentlyReviewed(many, 5, NOW)).toHaveLength(5);
  });
});
