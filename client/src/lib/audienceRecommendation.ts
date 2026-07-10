import type { AudienceFit, AudienceProfile } from './audienceProfile';
import type { EducationalTool } from './data';

export type RecommendationSlot = 'universal' | 'role' | 'stage' | 'discovery';

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

const BASE_SLOT_TARGETS: ReadonlyArray<readonly [Exclude<RecommendationSlot, 'discovery'>, number]> = [
  ['universal', 2],
  ['role', 2],
  ['stage', 1],
];

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
  if (departmentReason) return { reason: departmentReason, isPrecise: true };

  const roleReason = readReason(fit, profile.teacherRole);
  if (roleReason) return { reason: roleReason, isPrecise: true };

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

function rankTool(tool: EducationalTool, fit: AudienceFit, profile: AudienceProfile): AudienceRecommendation {
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
      + (reason.isPrecise ? 10 : 0),
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

  if (selected.length < limit) {
    const discovery = ranked.find((recommendation) => !isSelected(recommendation));
    if (discovery) {
      select({ ...discovery, slot: 'discovery' });
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

  const ranked = tools
    .flatMap((tool) => {
      if (tool.isInternal || !tool.audienceFit || !isEligible(tool.audienceFit, profile)) return [];
      return [rankTool(tool, tool.audienceFit, profile)];
    })
    .sort((left, right) => right.score - left.score || left.tool.id - right.tool.id);

  return composeRecommendationSlots(dedupeRankedFamilies(ranked, familyIds), limit, familyIds);
}
