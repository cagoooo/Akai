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
): AudienceRecommendation[] {
  const selected: AudienceRecommendation[] = [];
  const selectedIds = new Set<number>();

  for (const [slot, target] of BASE_SLOT_TARGETS) {
    if (selected.length >= limit) break;
    for (const recommendation of ranked) {
      if (recommendation.slot !== slot || selectedIds.has(recommendation.tool.id)) continue;
      selected.push(recommendation);
      selectedIds.add(recommendation.tool.id);
      if (selected.length >= limit || selected.filter((item) => item.slot === slot).length >= target) break;
    }
  }

  if (selected.length < limit) {
    const discovery = ranked.find((recommendation) => !selectedIds.has(recommendation.tool.id));
    if (discovery) {
      selected.push({ ...discovery, slot: 'discovery' });
      selectedIds.add(discovery.tool.id);
    }
  }

  for (const recommendation of ranked) {
    if (selected.length >= limit) break;
    if (selectedIds.has(recommendation.tool.id)) continue;
    selected.push(recommendation);
    selectedIds.add(recommendation.tool.id);
  }

  return selected;
}

export function recommendTools(
  tools: EducationalTool[],
  profile: AudienceProfile,
  limit = 6,
): AudienceRecommendation[] {
  if (!Number.isInteger(limit) || limit <= 0) return [];

  const ranked = tools
    .flatMap((tool) => {
      if (tool.isInternal || !tool.audienceFit || !isEligible(tool.audienceFit, profile)) return [];
      return [rankTool(tool, tool.audienceFit, profile)];
    })
    .sort((left, right) => right.score - left.score || left.tool.id - right.tool.id);

  return composeRecommendationSlots(ranked, limit);
}
