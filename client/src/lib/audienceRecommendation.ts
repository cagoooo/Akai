import type { AudienceFit, AudienceProfile, PainPoint } from './audienceProfile';
import { PAIN_POINT_LABELS } from './audienceProfile';
import type { EducationalTool } from './data';

export type RecommendationSlot = 'universal' | 'role' | 'stage' | 'popular' | 'discovery';

export interface AudienceRecommendation {
  tool: EducationalTool;
  reason: string;
  score: number;
  slot: RecommendationSlot;
  /** 此工具命中使用者所選痛點的數量（用於推薦卡片「🎯 命中需求」徽章） */
  matchedPainPoints: number;
}

type ReasonResolution = {
  reason: string;
  isPrecise: boolean;
};

const BASE_SLOT_TARGETS: ReadonlyArray<readonly [Exclude<RecommendationSlot, 'popular' | 'discovery'>, number]> = [
  ['universal', 2],
  ['role', 2],
  ['stage', 1],
];

/**
 * 推薦排序權重總表（P0-C：集中管理，方便對照 dashboard CTR 調參）
 *
 * 分數組成：priority（手工基準分）
 *   + 個人化配對（roleMatch / departmentMatch / stageMatch）
 *   + 精準理由 preciseReason
 *   + 痛點命中 painPointPerMatch ×（最多 painPointMaxMatches 個）
 *   + 人氣 popularity（all-time 點擊 sqrt 正規化）
 *   + trending（近 7 日點擊 sqrt 正規化）
 *
 * 調參原則：
 *   - 個人化配對（role 30）刻意 ≥ 純人氣（popularity 28）→ 個人化仍險勝人氣，
 *     熱門工具的「保證露出」交給熱門保底席，不靠加分硬壓過配對。
 *   - 痛點是最強情境訊號：命中 2 個（44）可勝過一個職務配對。
 *   - trending（20）略低於 all-time 人氣（28）→ 穩定訊號優先。
 *   ⚠️ 動這張表會改變推薦排序與單元測試的預期分數，改完務必跑 audienceRecommendation.test.ts。
 */
export const WEIGHTS = {
  roleMatch: 30,
  departmentMatch: 25,
  stageMatch: 15,
  preciseReason: 10,
  painPointPerMatch: 22,
  painPointMaxMatches: 2,
  popularity: 28,
  trending: 20,
  /** 熱門保底席混合熱度：近期點擊乘此倍率再加 all-time，讓剛爆紅的新工具也能競爭保底席 */
  hotnessTrendMultiplier: 2,
  /** 新工具 freshness（P1-5）：上架 freshnessDays 天內線性衰減加分，讓新品有曝光窗口 */
  freshness: 18,
  freshnessDays: 45,
  /** 最近使用去重（P1-3）：使用者近期用過的工具降權，把版面留給沒探索過的 */
  recentlyUsedPenalty: 24,
} as const;

const DAY_MS = 24 * 60 * 60 * 1000;

/** 新工具 freshness 加分：上架 freshnessDays 天內線性衰減；無 addedAt 或已過期 → 0 */
function freshnessBonus(tool: EducationalTool, now: number): number {
  const addedAt = tool.addedAt;
  if (typeof addedAt !== 'string') return 0;
  const ts = Date.parse(addedAt);
  if (Number.isNaN(ts)) return 0;
  const ageDays = (now - ts) / DAY_MS;
  if (ageDays < 0 || ageDays >= WEIGHTS.freshnessDays) return 0;
  return Math.round(WEIGHTS.freshness * (1 - ageDays / WEIGHTS.freshnessDays));
}

function getToolClicks(tool: EducationalTool): number {
  const clicks = tool.totalClicks;
  return typeof clicks === 'number' && Number.isFinite(clicks) && clicks > 0 ? clicks : 0;
}

function getToolRecentClicks(tool: EducationalTool): number {
  const clicks = tool.recentClicks;
  return typeof clicks === 'number' && Number.isFinite(clicks) && clicks > 0 ? clicks : 0;
}

/** 熱門保底席用的混合熱度：兼顧 all-time 累積與近期竄升 */
function getToolHotness(tool: EducationalTool): number {
  return getToolClicks(tool) + WEIGHTS.hotnessTrendMultiplier * getToolRecentClicks(tool);
}

function popularityBonus(tool: EducationalTool, maxClicks: number): number {
  if (maxClicks <= 0) return 0;
  return Math.round(WEIGHTS.popularity * Math.sqrt(getToolClicks(tool) / maxClicks));
}

function trendingBonus(tool: EducationalTool, maxRecentClicks: number): number {
  if (maxRecentClicks <= 0) return 0;
  return Math.round(WEIGHTS.trending * Math.sqrt(getToolRecentClicks(tool) / maxRecentClicks));
}

/** 回傳工具 painPoints 與使用者所選痛點的交集（保序：依 fit.painPoints 順序） */
function getMatchedPainPoints(fit: AudienceFit, profile: AudienceProfile): PainPoint[] {
  const chosen = profile.painPoints;
  if (!chosen || chosen.length === 0 || !fit.painPoints || fit.painPoints.length === 0) return [];
  const chosenSet = new Set(chosen);
  return fit.painPoints.filter((pain) => chosenSet.has(pain));
}

/**
 * 痛點感知的推薦理由（P0-B）：命中痛點時，讓理由點名使用者選的痛點，
 * 讓「🎯 命中你的需求」徽章名實相符。最多點名 2 個痛點，後接原本的理由。
 */
function painPointReason(matched: PainPoint[], baseReason: string): string {
  const labels = matched.slice(0, 2).map((p) => PAIN_POINT_LABELS[p]).filter(Boolean);
  if (labels.length === 0) return baseReason;
  return `對應你想解決的「${labels.join('、')}」：${baseReason}`;
}

function isValidToolId(id: unknown): id is number {
  return typeof id === 'number' && Number.isInteger(id) && id > 0;
}

function buildToolFamilyIds(tools: readonly EducationalTool[]): Map<number, number> {
  const parent = new Map<number, number>();

  for (const tool of tools) {
    if (isValidToolId(tool.id)) parent.set(tool.id, tool.id);
  }

  const find = (id: number): number => {
    const currentParent = parent.get(id);
    if (currentParent === undefined || currentParent === id) return id;
    const root = find(currentParent);
    parent.set(id, root);
    return root;
  };

  const union = (left: number, right: number): void => {
    if (!parent.has(left) || !parent.has(right)) return;
    const leftRoot = find(left);
    const rightRoot = find(right);
    if (leftRoot === rightRoot) return;
    parent.set(Math.max(leftRoot, rightRoot), Math.min(leftRoot, rightRoot));
  };

  for (const tool of tools) {
    for (const linkedId of [tool.upgradeFromId, tool.upgradeToId]) {
      if (isValidToolId(linkedId)) union(tool.id, linkedId);
    }
  }

  const familyIds = new Map<number, number>();
  parent.forEach((_, id) => familyIds.set(id, find(id)));
  return familyIds;
}

function getToolFamilyId(tool: EducationalTool, familyIds: ReadonlyMap<number, number>): number {
  return familyIds.get(tool.id) ?? tool.id;
}

function dedupeRankedFamilies(
  ranked: AudienceRecommendation[],
  toolFamilyIds: ReadonlyMap<number, number>,
): AudienceRecommendation[] {
  const familyIds = new Set<number>();
  return ranked.filter((recommendation) => {
    const familyId = getToolFamilyId(recommendation.tool, toolFamilyIds);
    if (familyIds.has(familyId)) return false;
    familyIds.add(familyId);
    return true;
  });
}

function includesProfileValue<T extends string>(
  restrictions: readonly T[] | undefined,
  profileValue: T | undefined,
): boolean {
  return restrictions === undefined || (profileValue !== undefined && restrictions.includes(profileValue));
}

function isEligible(fit: AudienceFit, profile: AudienceProfile): boolean {
  if (!fit.audiences.includes(profile.audience)) return false;
  if (profile.audience === 'student') {
    // P1-2：學生若選了學段（國小／國中）則據此過濾；沒選（含舊 profile）→ 不過濾，維持相容
    if (profile.schoolLevel === undefined) return true;
    return includesProfileValue(fit.schoolLevels, profile.schoolLevel);
  }

  if (!includesProfileValue(fit.schoolLevels, profile.schoolLevel)) return false;
  if (!includesProfileValue(fit.teacherRoles, profile.teacherRole)) return false;

  if (fit.departments !== undefined) {
    return profile.teacherRole === 'admin'
      && profile.department !== undefined
      && fit.departments.includes(profile.department);
  }

  return true;
}

function readReason(fit: AudienceFit, key: keyof AudienceFit['reasons'] | undefined): string | undefined {
  if (key === undefined) return undefined;
  const reason = fit.reasons[key]?.trim();
  return reason || undefined;
}

function resolveReason(fit: AudienceFit, profile: AudienceProfile): ReasonResolution {
  if (profile.audience === 'student') {
    return {
      reason: readReason(fit, 'student') ?? '這項工具符合你的使用情境。',
      isPrecise: false,
    };
  }

  const departmentReason = readReason(fit, profile.department);
  if (departmentReason) {
    const isDepartmentScoped = fit.departments?.includes(profile.department!)
      && (fit.teacherRoles === undefined || fit.teacherRoles.includes('admin'));
    return { reason: departmentReason, isPrecise: Boolean(isDepartmentScoped) };
  }

  const roleReason = readReason(fit, profile.teacherRole);
  if (roleReason) {
    const isRoleScoped = profile.teacherRole !== undefined
      && fit.teacherRoles?.includes(profile.teacherRole);
    return { reason: roleReason, isPrecise: Boolean(isRoleScoped) };
  }

  return {
    reason: readReason(fit, 'teacher') ?? '這項工具符合你的教學或行政情境。',
    isPrecise: false,
  };
}

function classifySlot(fit: AudienceFit, profile: AudienceProfile): RecommendationSlot {
  if (profile.audience === 'student') return 'universal';

  const hasDepartmentMatch = fit.departments !== undefined
    && profile.department !== undefined
    && fit.departments.includes(profile.department);
  const hasRoleMatch = fit.teacherRoles !== undefined
    && profile.teacherRole !== undefined
    && fit.teacherRoles.includes(profile.teacherRole);
  if (hasDepartmentMatch || hasRoleMatch) return 'role';

  const hasStageMatch = fit.schoolLevels !== undefined
    && profile.schoolLevel !== undefined
    && fit.schoolLevels.includes(profile.schoolLevel);
  if (hasStageMatch) return 'stage';

  return 'universal';
}

function rankTool(
  tool: EducationalTool,
  fit: AudienceFit,
  profile: AudienceProfile,
  maxClicks: number,
  maxRecentClicks: number,
  now: number,
  recentlyUsedIds: ReadonlySet<number> | undefined,
): AudienceRecommendation {
  const isTeacherProfile = profile.audience === 'teacher';
  const roleMatch = isTeacherProfile
    && fit.teacherRoles !== undefined
    && profile.teacherRole !== undefined
    && fit.teacherRoles.includes(profile.teacherRole);
  const departmentMatch = isTeacherProfile
    && fit.departments !== undefined
    && profile.department !== undefined
    && fit.departments.includes(profile.department);
  const stageMatch = isTeacherProfile
    && fit.schoolLevels !== undefined
    && profile.schoolLevel !== undefined
    && fit.schoolLevels.includes(profile.schoolLevel);
  const reason = resolveReason(fit, profile);
  const matched = getMatchedPainPoints(fit, profile);
  const matchedPainPoints = matched.length;
  const painPointScore = Math.min(matchedPainPoints, WEIGHTS.painPointMaxMatches) * WEIGHTS.painPointPerMatch;
  // P0-B：命中痛點時，理由改為點名使用者所選痛點；否則沿用原本的職務/處室理由
  const finalReason = matchedPainPoints > 0 ? painPointReason(matched, reason.reason) : reason.reason;
  const recentlyUsedPenalty = recentlyUsedIds?.has(tool.id) ? WEIGHTS.recentlyUsedPenalty : 0;

  return {
    tool,
    reason: finalReason,
    score: fit.priority
      + (roleMatch ? WEIGHTS.roleMatch : 0)
      + (departmentMatch ? WEIGHTS.departmentMatch : 0)
      + (stageMatch ? WEIGHTS.stageMatch : 0)
      + (reason.isPrecise ? WEIGHTS.preciseReason : 0)
      + painPointScore
      + popularityBonus(tool, maxClicks)
      + trendingBonus(tool, maxRecentClicks)
      + freshnessBonus(tool, now)
      - recentlyUsedPenalty,
    slot: classifySlot(fit, profile),
    matchedPainPoints,
  };
}

function composeRecommendationSlots(
  ranked: AudienceRecommendation[],
  limit: number,
  familyIds: ReadonlyMap<number, number>,
): AudienceRecommendation[] {
  const selected: AudienceRecommendation[] = [];
  const selectedIds = new Set<number>();
  const selectedFamilyIds = new Set<number>();

  const isSelected = (recommendation: AudienceRecommendation): boolean => (
    selectedIds.has(recommendation.tool.id)
    || selectedFamilyIds.has(getToolFamilyId(recommendation.tool, familyIds))
  );

  const select = (recommendation: AudienceRecommendation): void => {
    selected.push(recommendation);
    selectedIds.add(recommendation.tool.id);
    selectedFamilyIds.add(getToolFamilyId(recommendation.tool, familyIds));
  };

  for (const [slot, target] of BASE_SLOT_TARGETS) {
    if (selected.length >= limit) break;
    for (const recommendation of ranked) {
      if (recommendation.slot !== slot || isSelected(recommendation)) continue;
      select(recommendation);
      if (selected.length >= limit || selected.filter((item) => item.slot === slot).length >= target) break;
    }
  }

  // 熱門保底席：從尚未入選的合格工具中，挑「混合熱度」最高者。
  // 熱度 = all-time 累積點擊 + 近 7 日竄升點擊 × 倍率，兼顧排行榜常勝軍與這週爆紅新品（P0-3），
  // 確保熱門工具至少露出一個，即使它的手工 priority 偏低。
  // 若沒有任何工具帶點擊資料（如單元測試情境），退回原本的 discovery（取剩餘最高分）。
  if (selected.length < limit) {
    let popular: AudienceRecommendation | undefined;
    let popularHotness = 0;
    for (const recommendation of ranked) {
      if (isSelected(recommendation)) continue;
      const hotness = getToolHotness(recommendation.tool);
      if (hotness > popularHotness) {
        popularHotness = hotness;
        popular = recommendation;
      }
    }

    if (popular) {
      select({ ...popular, slot: 'popular' });
    } else {
      const discovery = ranked.find((recommendation) => !isSelected(recommendation));
      if (discovery) {
        select({ ...discovery, slot: 'discovery' });
      }
    }
  }

  for (const recommendation of ranked) {
    if (selected.length >= limit) break;
    if (isSelected(recommendation)) continue;
    select(recommendation);
  }

  return selected;
}

export function recommendTools(
  tools: EducationalTool[],
  profile: AudienceProfile,
  limit = 6,
  /**
   * 「換一批」用：已看過的工具 id。會連同同家族的工具一併排除，
   * 讓下一波推薦是全新的清單（不重覆、也不出現已看過工具的 Pro/舊版兄弟）。
   */
  excludeIds?: ReadonlySet<number>,
  /** 最近使用去重（P1-3）：近期用過的工具會被降權（不排除），把版面留給沒探索過的 */
  recentlyUsedIds?: ReadonlySet<number>,
): AudienceRecommendation[] {
  if (!Number.isInteger(limit) || limit <= 0) return [];
  const now = Date.now();

  const familyIds = buildToolFamilyIds(tools);

  // 把「已看過的工具」換算成「已看過的家族」，避免下一波冒出同家族兄弟
  const excludedFamilies = excludeIds && excludeIds.size > 0
    ? new Set(Array.from(excludeIds, (id) => familyIds.get(id) ?? id))
    : null;

  const eligible = tools.filter(
    (tool) => !tool.isInternal && tool.audienceFit && isEligible(tool.audienceFit, profile)
      && !(excludedFamilies && excludedFamilies.has(familyIds.get(tool.id) ?? tool.id)),
  );
  const maxClicks = eligible.reduce((max, tool) => Math.max(max, getToolClicks(tool)), 0);
  const maxRecentClicks = eligible.reduce((max, tool) => Math.max(max, getToolRecentClicks(tool)), 0);

  const ranked = eligible
    .map((tool) => rankTool(tool, tool.audienceFit!, profile, maxClicks, maxRecentClicks, now, recentlyUsedIds))
    .sort((left, right) => right.score - left.score || left.tool.id - right.tool.id);

  return composeRecommendationSlots(dedupeRankedFamilies(ranked, familyIds), limit, familyIds);
}
