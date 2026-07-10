import type { AudienceFit, AudienceProfile } from './audienceProfile';
import type { EducationalTool } from './data';

export type RecommendationSlot = 'universal' | 'role' | 'stage' | 'popular' | 'discovery';

export interface AudienceRecommendation {
  tool: EducationalTool;
  reason: string;
  score: number;
  slot: RecommendationSlot;
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

// 人氣加分權重（v3.6.x）：把排行榜的真實點擊數（tool.totalClicks）納入排序，
// 讓熱門工具（如馬力歐遊戲、班級小管家）不會只因手工 priority 偏低就永遠沉底。
// 以「該工具點擊 ÷ 合格工具中的最高點擊」做 sqrt 正規化 → 曲線前段陡、後段緩，
// 讓中段熱度的工具也吃得到明顯加成，最熱門者最多 +POPULARITY_WEIGHT。
// 權重刻意略低於一個職務配對（+30）：個人化仍險勝純人氣，熱門工具的「保證露出」
// 交給下方的「熱門保底席」，不必靠加分硬壓過職務配對。
const POPULARITY_WEIGHT = 28;

function getToolClicks(tool: EducationalTool): number {
  const clicks = tool.totalClicks;
  return typeof clicks === 'number' && Number.isFinite(clicks) && clicks > 0 ? clicks : 0;
}

function popularityBonus(tool: EducationalTool, maxClicks: number): number {
  if (maxClicks <= 0) return 0;
  return Math.round(POPULARITY_WEIGHT * Math.sqrt(getToolClicks(tool) / maxClicks));
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
  if (profile.audience === 'student') return true;

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

  return {
    tool,
    reason: reason.reason,
    score: fit.priority
      + (roleMatch ? 30 : 0)
      + (departmentMatch ? 25 : 0)
      + (stageMatch ? 15 : 0)
      + (reason.isPrecise ? 10 : 0)
      + popularityBonus(tool, maxClicks),
    slot: classifySlot(fit, profile),
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

  // 熱門保底席：從尚未入選的合格工具中，挑點擊數最高者（排行榜常勝軍），
  // 確保熱門工具至少露出一個，即使它的手工 priority 偏低。
  // 若沒有任何工具帶點擊資料（如單元測試情境），退回原本的 discovery（取剩餘最高分）。
  if (selected.length < limit) {
    let popular: AudienceRecommendation | undefined;
    let popularClicks = 0;
    for (const recommendation of ranked) {
      if (isSelected(recommendation)) continue;
      const clicks = getToolClicks(recommendation.tool);
      if (clicks > popularClicks) {
        popularClicks = clicks;
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
): AudienceRecommendation[] {
  if (!Number.isInteger(limit) || limit <= 0) return [];

  const familyIds = buildToolFamilyIds(tools);

  const eligible = tools.filter(
    (tool) => !tool.isInternal && tool.audienceFit && isEligible(tool.audienceFit, profile),
  );
  const maxClicks = eligible.reduce((max, tool) => Math.max(max, getToolClicks(tool)), 0);

  const ranked = eligible
    .map((tool) => rankTool(tool, tool.audienceFit!, profile, maxClicks))
    .sort((left, right) => right.score - left.score || left.tool.id - right.tool.id);

  return composeRecommendationSlots(dedupeRankedFamilies(ranked, familyIds), limit, familyIds);
}
