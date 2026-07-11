import { describe, expect, it } from 'vitest';

import type { AudienceFit, AudienceProfile } from '../audienceProfile';
import type { EducationalTool } from '../data';
import { recommendTools } from '../audienceRecommendation';

const makeFit = (overrides: Partial<AudienceFit> = {}): AudienceFit => ({
  audiences: ['teacher'],
  painPoints: ['resource-discovery'],
  priority: 50,
  reasons: { teacher: '這項工具適合老師使用。' },
  ...overrides,
});

const makeTool = (
  id: number,
  audienceFit: AudienceFit | undefined = makeFit(),
  overrides: Partial<EducationalTool> = {},
): EducationalTool => ({
  id,
  title: `工具 ${id}`,
  description: '測試工具',
  url: `https://example.com/${id}`,
  icon: 'Sparkles',
  category: 'utilities',
  audienceFit,
  ...overrides,
});

const meetingTool = makeTool(84, makeFit({
  priority: 90,
  reasons: {
    teacher: '快速整理會議內容。',
    admin: '行政會議可直接摘要匯出。',
  },
}));

const universalFillers = Array.from({ length: 8 }, (_, index) => makeTool(
  index + 120,
  makeFit({
    painPoints: ['resource-discovery'],
    priority: 50 - index,
    reasons: { teacher: `老師推薦理由 ${index}` },
  }),
));

describe('recommendTools', () => {
  it.each(['homeroom', 'subject', 'admin'] as const)('#84 會議工具可推薦給 %s', (teacherRole) => {
    const profile: AudienceProfile = {
      audience: 'teacher',
      schoolLevel: 'elementary',
      teacherRole,
    };

    expect(recommendTools([meetingTool, ...universalFillers], profile).map(({ tool }) => tool.id))
      .toContain(84);
  });

  it('將 junior admin academic 的 #78 精準工具排在 discovery 前', () => {
    const academicTool = makeTool(78, makeFit({
      teacherRoles: ['admin'],
      departments: ['academic'],
      priority: 88,
      reasons: { academic: '加速課程計畫審查。' },
    }));
    const discoveryTool = makeTool(79, makeFit({
      schoolLevels: ['junior'],
      priority: 20,
      reasons: { teacher: '提供另一種教學選擇。' },
    }));
    const result = recommendTools(
      [meetingTool, academicTool, discoveryTool, ...universalFillers],
      { audience: 'teacher', schoolLevel: 'junior', teacherRole: 'admin', department: 'academic' },
    );

    expect(result).toHaveLength(6);
    expect(result.findIndex(({ tool }) => tool.id === 78))
      .toBeLessThan(result.findIndex(({ slot }) => slot === 'discovery'));
    expect(result.find(({ tool }) => tool.id === 78)).toMatchObject({
      reason: '加速課程計畫審查。',
      score: 153,
      slot: 'role',
    });
  });

  it('固定回傳 6 筆、ID 不重複，且每個 reason trim 後非空', () => {
    const duplicate = makeTool(120, makeFit({ priority: 99 }));
    const result = recommendTools([duplicate, ...universalFillers], {
      audience: 'teacher',
      schoolLevel: 'elementary',
      teacherRole: 'homeroom',
    });

    expect(result).toHaveLength(6);
    expect(new Set(result.map(({ tool }) => tool.id)).size).toBe(6);
    expect(result.every(({ reason }) => reason.trim().length > 0)).toBe(true);
  });

  it('排除 internal、缺 audienceFit 與 audience 不符的工具', () => {
    const valid = makeTool(1);
    const internal = makeTool(2, makeFit(), { isInternal: true });
    const missingFit: EducationalTool = { ...makeTool(3), audienceFit: undefined };
    const studentOnly = makeTool(4, makeFit({
      audiences: ['student'],
      reasons: { student: '適合學生。' },
    }));

    expect(recommendTools([valid, internal, missingFit, studentOnly], {
      audience: 'teacher',
      schoolLevel: 'elementary',
      teacherRole: 'subject',
    }, 10).map(({ tool }) => tool.id)).toEqual([1]);
  });

  it('學生 profile 忽略 mixed tool 的老師學段、職務與處室限制', () => {
    const mixed = makeTool(5, makeFit({
      audiences: ['teacher', 'student'],
      schoolLevels: ['senior'],
      teacherRoles: ['admin'],
      departments: ['academic'],
      reasons: { teacher: '適合教師。', student: '適合學生自主練習。' },
    }));

    expect(recommendTools([mixed], {
      audience: 'student',
      schoolLevel: 'senior',
      teacherRole: 'admin',
      department: 'academic',
    })).toEqual([
      expect.objectContaining({
        tool: mixed,
        reason: '適合學生自主練習。',
        score: 50,
        slot: 'universal',
      }),
    ]);
  });

  it('學生理由缺失時使用中性 fallback，不退回教師理由', () => {
    const mixed = makeTool(6, makeFit({
      audiences: ['teacher', 'student'],
      reasons: {
        teacher: '這是僅供教師的推薦理由。',
        student: '   ',
        admin: '這是行政人員理由。',
        academic: '這是教務處理由。',
      },
    }));

    const [result] = recommendTools([mixed], {
      audience: 'student',
      schoolLevel: 'senior',
      teacherRole: 'admin',
      department: 'academic',
    });

    expect(result.reason).toBe('這項工具符合你的使用情境。');
    expect(result.reason).not.toContain('教師');
    expect(result.reason).not.toContain('行政');
    expect(result.reason).not.toContain('教務處');
  });

  it('正確套用教師學段、職務與行政處室限制', () => {
    const stage = makeTool(10, makeFit({ schoolLevels: ['junior'] }));
    const role = makeTool(11, makeFit({ teacherRoles: ['subject'] }));
    const department = makeTool(12, makeFit({
      teacherRoles: ['admin'],
      departments: ['academic'],
      reasons: { teacher: '適合教師。' },
    }));

    expect(recommendTools([stage, role, department], {
      audience: 'teacher', schoolLevel: 'elementary', teacherRole: 'subject',
    }, 10).map(({ tool }) => tool.id)).toEqual([11]);
    expect(recommendTools([department], {
      audience: 'teacher', schoolLevel: 'junior', teacherRole: 'subject', department: 'academic',
    })).toEqual([]);
    expect(recommendTools([department], {
      audience: 'teacher', schoolLevel: 'junior', teacherRole: 'admin', department: 'counseling',
    })).toEqual([]);
    expect(recommendTools([department], {
      audience: 'teacher', schoolLevel: 'junior', teacherRole: 'admin', department: 'academic',
    })[0]).toMatchObject({ score: 105, slot: 'role', reason: '適合教師。' });
  });

  it('理由依處室、職務、audience 優先序解析，並可退回 teacher', () => {
    const exact = makeTool(20, makeFit({
      teacherRoles: ['admin'],
      departments: ['academic'],
      reasons: {
        teacher: '通用教師理由。',
        admin: '行政職務理由。',
        academic: '教務處精準理由。',
      },
    }));
    const fallback = makeTool(21, makeFit({
      teacherRoles: ['admin'],
      departments: ['academic'],
      reasons: { teacher: '  通用教師理由。  ', academic: '   ' },
    }));
    const profile: AudienceProfile = {
      audience: 'teacher', schoolLevel: 'junior', teacherRole: 'admin', department: 'academic',
    };

    const result = recommendTools([exact, fallback], profile, 2);
    expect(result.find(({ tool }) => tool.id === 20)).toMatchObject({
      reason: '教務處精準理由。', score: 115,
    });
    expect(result.find(({ tool }) => tool.id === 21)).toMatchObject({
      reason: '通用教師理由。', score: 105,
    });
  });

  it('only awards the precise reason bonus when the role is explicitly scoped', () => {
    const universal = makeTool(22, makeFit({
      priority: 70,
      reasons: { teacher: '通用教師理由', homeroom: '導師專用文案' },
    }));
    const scoped = makeTool(23, makeFit({
      priority: 70,
      teacherRoles: ['homeroom'],
      reasons: { teacher: '通用教師理由', homeroom: '導師專用文案' },
    }));
    const profile: AudienceProfile = {
      audience: 'teacher', schoolLevel: 'elementary', teacherRole: 'homeroom',
    };

    expect(recommendTools([universal], profile)[0]).toMatchObject({
      reason: '導師專用文案', score: 70, slot: 'universal',
    });
    expect(recommendTools([scoped], profile)[0]).toMatchObject({
      reason: '導師專用文案', score: 110, slot: 'role',
    });
  });

  it('依 2 universal、2 role、1 stage、1 discovery 取席，bucket 不足時以全體排名補滿', () => {
    const tools = [
      makeTool(1, makeFit({ priority: 90 })),
      makeTool(2, makeFit({ priority: 80 })),
      makeTool(3, makeFit({ priority: 70 })),
      makeTool(4, makeFit({ teacherRoles: ['subject'], priority: 60 })),
      makeTool(5, makeFit({ teacherRoles: ['subject'], priority: 50 })),
      makeTool(6, makeFit({ schoolLevels: ['junior'], priority: 40 })),
    ];
    const result = recommendTools(tools, {
      audience: 'teacher', schoolLevel: 'junior', teacherRole: 'subject',
    });

    expect(result.map(({ tool }) => tool.id)).toEqual([1, 2, 4, 5, 6, 3]);
    expect(result.map(({ slot }) => slot)).toEqual([
      'universal', 'universal', 'role', 'role', 'stage', 'discovery',
    ]);
  });

  it('熱門保底席：即使 priority 偏低，排行榜最熱門的合格工具仍會露出', () => {
    // 模擬「馬力歐遊戲」情境：priority 低但點擊數全站最高
    const popularGame = makeTool(9, makeFit({
      audiences: ['teacher', 'student'],
      priority: 42,
      reasons: { teacher: '課間獎勵遊戲。', student: '挑戰關卡累積分數。' },
    }), { totalClicks: 5000 });
    const higherPriority = Array.from({ length: 6 }, (_, index) => makeTool(
      200 + index,
      makeFit({ priority: 95 - index }),
      { totalClicks: 10 },
    ));

    const result = recommendTools([popularGame, ...higherPriority], {
      audience: 'teacher', schoolLevel: 'elementary', teacherRole: 'homeroom',
    });

    expect(result.map(({ tool }) => tool.id)).toContain(9);
    expect(result.find(({ tool }) => tool.id === 9)?.slot).toBe('popular');
  });

  it('人氣加分讓同 priority 的熱門工具分數更高，但個人化職務配對仍勝過純人氣', () => {
    const studentFit = (priority: number) => makeFit({
      audiences: ['teacher', 'student'], priority,
      reasons: { teacher: '老師理由。', student: '學生理由。' },
    });
    const hot = makeTool(1, studentFit(60), { totalClicks: 4000 });
    const cold = makeTool(2, studentFit(60), { totalClicks: 0 });

    const result = recommendTools([hot, cold], { audience: 'student' }, 2);
    const hotScore = result.find(({ tool }) => tool.id === 1)!.score;
    const coldScore = result.find(({ tool }) => tool.id === 2)!.score;
    expect(hotScore).toBeGreaterThan(coldScore); // 人氣有加成

    // 職務配對（+30）仍應勝過純人氣加分（≤28）：同 priority 下，
    // 有職務配對但零點擊的工具分數，應高於零配對但全站最熱門的工具。
    const scopedCold = makeTool(3, makeFit({
      teacherRoles: ['subject'], priority: 60,
    }), { totalClicks: 0 });
    const scopedResult = recommendTools([hot, scopedCold], {
      audience: 'teacher', schoolLevel: 'elementary', teacherRole: 'subject',
    }, 2);
    const hotTeacherScore = scopedResult.find(({ tool }) => tool.id === 1)!.score;
    const scopedScore = scopedResult.find(({ tool }) => tool.id === 3)!.score;
    expect(scopedScore).toBeGreaterThan(hotTeacherScore);
  });

  it('痛點命中：勾選的痛點命中越多分數越高，並標記 matchedPainPoints', () => {
    const twoMatch = makeTool(1, makeFit({
      priority: 50, painPoints: ['classroom-management', 'assessment'],
    }));
    const oneMatch = makeTool(2, makeFit({
      priority: 50, painPoints: ['assessment', 'administration'],
    }));
    const noMatch = makeTool(3, makeFit({
      priority: 50, painPoints: ['media-production'],
    }));
    const result = recommendTools([twoMatch, oneMatch, noMatch], {
      audience: 'teacher', schoolLevel: 'elementary', teacherRole: 'subject',
      painPoints: ['classroom-management', 'assessment'],
    }, 3);

    const byId = new Map(result.map((r) => [r.tool.id, r]));
    expect(byId.get(1)!.matchedPainPoints).toBe(2);
    expect(byId.get(2)!.matchedPainPoints).toBe(1);
    expect(byId.get(3)!.matchedPainPoints).toBe(0);
    expect(byId.get(1)!.score).toBeGreaterThan(byId.get(2)!.score);
    expect(byId.get(2)!.score).toBeGreaterThan(byId.get(3)!.score);
    // P0-B：命中痛點的理由要點名使用者所選痛點；未命中者維持原理由
    expect(byId.get(1)!.reason).toContain('班級經營');
    expect(byId.get(1)!.reason).toContain('出題與評量');
    expect(byId.get(2)!.reason).toContain('出題與評量');
    expect(byId.get(3)!.reason).not.toContain('對應你想解決');
  });

  it('沒勾選痛點時不影響分數（既有行為），matchedPainPoints 為 0', () => {
    const tool = makeTool(1, makeFit({ priority: 70, painPoints: ['assessment'] }));
    const [result] = recommendTools([tool], { audience: 'teacher' }, 1);
    expect(result.score).toBe(70);
    expect(result.matchedPainPoints).toBe(0);
  });

  it('trending 加分：同 priority、同累計點擊下，近 7 日竄升的工具分數更高', () => {
    const studentFit = makeFit({ audiences: ['teacher', 'student'], priority: 50, reasons: { student: 'x' } });
    const surging = makeTool(1, studentFit, { totalClicks: 100, recentClicks: 100 });
    const flat = makeTool(2, studentFit, { totalClicks: 100, recentClicks: 0 });
    const result = recommendTools([surging, flat], { audience: 'student' }, 2);
    const byId = new Map(result.map((r) => [r.tool.id, r]));
    expect(byId.get(1)!.score).toBeGreaterThan(byId.get(2)!.score);
  });

  it('熱門保底席混合熱度：累計點擊相同時，近 7 日竄升者搶下 popular 席', () => {
    const studentFit = makeFit({ audiences: ['teacher', 'student'], priority: 30, reasons: { student: 'x' } });
    const surging = makeTool(9, studentFit, { totalClicks: 100, recentClicks: 100 });
    const flat = makeTool(10, studentFit, { totalClicks: 100, recentClicks: 0 });
    // 高 priority fillers 佔滿前面的 universal 名額，把保底席留給熱度競爭
    const fillers = Array.from({ length: 6 }, (_, i) => makeTool(
      200 + i, makeFit({ audiences: ['teacher', 'student'], priority: 95 - i, reasons: { student: 'x' } }),
      { totalClicks: 0, recentClicks: 0 },
    ));
    const result = recommendTools([surging, flat, ...fillers], { audience: 'student' }, 6);
    const popular = result.find((r) => r.slot === 'popular');
    expect(popular?.tool.id).toBe(9);
  });

  it('沒有任何點擊資料時，第六席退回 discovery（維持既有行為）', () => {
    const tools = Array.from({ length: 8 }, (_, index) => makeTool(
      100 + index,
      makeFit({ priority: 90 - index }),
    ));
    const result = recommendTools(tools, { audience: 'teacher' });
    expect(result.some(({ slot }) => slot === 'popular')).toBe(false);
    expect(result.some(({ slot }) => slot === 'discovery')).toBe(true);
  });

  it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])('非正整數 limit %s 回傳空陣列', (limit) => {
    expect(recommendTools([meetingTool], { audience: 'teacher' }, limit)).toEqual([]);
  });

  it('同分時依 tool.id 升序', () => {
    expect(recommendTools([makeTool(2), makeTool(1)], { audience: 'teacher' }, 2)
      .map(({ tool }) => tool.id)).toEqual([1, 2]);
  });

  it('同一家族只保留高分 Pro，並以其他家族補滿六席', () => {
    const base = makeTool(4, makeFit({ priority: 70 }), { upgradeToId: 87 });
    const pro = makeTool(87, makeFit({ priority: 90 }), { upgradeFromId: 4 });
    const otherFamilies = Array.from({ length: 6 }, (_, index) => makeTool(
      200 + index,
      makeFit({ priority: 60 - index }),
    ));

    const result = recommendTools([base, pro, ...otherFamilies], { audience: 'teacher' }, 6);
    const ids = result.map(({ tool }) => tool.id);
    const familyIds = result.map(({ tool }) => tool.upgradeFromId ?? tool.id);

    expect(ids).toContain(87);
    expect(ids).not.toContain(4);
    expect(result).toHaveLength(6);
    expect(new Set(ids).size).toBe(6);
    expect(new Set(familyIds).size).toBe(6);
  });

  it('沒有 upgrade metadata 的不同工具不會被誤判為同一家族', () => {
    const standaloneTools = Array.from({ length: 6 }, (_, index) => makeTool(
      300 + index,
      makeFit({ priority: 80 - index }),
    ));

    expect(recommendTools(standaloneTools, { audience: 'teacher' }, 6)
      .map(({ tool }) => tool.id)).toEqual([300, 301, 302, 303, 304, 305]);
  });

  it('treats a base-only upgradeToId as the same family as its pro tool', () => {
    const base = makeTool(4, makeFit({ priority: 70 }), { upgradeToId: 87 });
    const pro = makeTool(87, makeFit({ priority: 90 }));

    expect(recommendTools([base, pro], { audience: 'teacher' }, 2)
      .map(({ tool }) => tool.id)).toEqual([87]);
  });

  it('treats a pro-only upgradeFromId as the same family as its base tool', () => {
    const base = makeTool(4, makeFit({ priority: 70 }));
    const pro = makeTool(87, makeFit({ priority: 90 }), { upgradeFromId: 4 });

    expect(recommendTools([base, pro], { audience: 'teacher' }, 2)
      .map(({ tool }) => tool.id)).toEqual([87]);
  });

  it('deduplicates every generation in an upgrade chain', () => {
    const base = makeTool(4, makeFit({ priority: 70 }), { upgradeToId: 87 });
    const pro = makeTool(87, makeFit({ priority: 80 }), { upgradeFromId: 4, upgradeToId: 120 });
    const latest = makeTool(120, makeFit({ priority: 90 }), { upgradeFromId: 87 });

    expect(recommendTools([base, pro, latest], { audience: 'teacher' }, 3)
      .map(({ tool }) => tool.id)).toEqual([120]);
  });

  it('does not merge existing tools through an upgrade link to a missing tool', () => {
    const first = makeTool(4, makeFit({ priority: 90 }), { upgradeToId: 999 });
    const second = makeTool(87, makeFit({ priority: 80 }), { upgradeToId: 999 });

    expect(recommendTools([first, second], { audience: 'teacher' }, 2)
      .map(({ tool }) => tool.id)).toEqual([4, 87]);
  });
});
