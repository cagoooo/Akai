import type { AudienceProfile } from './audienceProfile';

export const AUDIENCE_PROFILE_KEY = 'akai_audience_profile_v1';
export const AUDIENCE_DISMISSED_KEY = 'akai_audience_wizard_dismissed_v1';

export type StoredAudienceProfile = AudienceProfile & { version: 1; completedAt: string };

export function saveAudienceProfile(profile: AudienceProfile): StoredAudienceProfile {
  const stored: StoredAudienceProfile = { ...profile, version: 1, completedAt: new Date().toISOString() };
  try { localStorage.setItem(AUDIENCE_PROFILE_KEY, JSON.stringify(stored)); } catch { /* private mode / quota */ }
  return stored;
}

export function readAudienceProfile(): StoredAudienceProfile | null {
  try {
    const raw = localStorage.getItem(AUDIENCE_PROFILE_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object' || (value as { version?: unknown }).version !== 1) return null;
    const profile = value as Record<string, unknown>;
    if (typeof profile.completedAt !== 'string' || Number.isNaN(Date.parse(profile.completedAt))) return null;
    if (profile.audience === 'student') {
      // P1-2：學生可選填 schoolLevel（國小／國中），但不得有 teacherRole / department
      if (profile.teacherRole !== undefined || profile.department !== undefined) return null;
      if (profile.schoolLevel !== undefined && !isSchoolLevel(profile.schoolLevel)) return null;
      return profile as unknown as StoredAudienceProfile;
    }
    if (profile.audience !== 'teacher' || !isSchoolLevel(profile.schoolLevel) || !isTeacherRole(profile.teacherRole)) return null;
    if (profile.teacherRole === 'admin') {
      return isDepartment(profile.department) ? profile as unknown as StoredAudienceProfile : null;
    }
    return profile.department === undefined ? profile as unknown as StoredAudienceProfile : null;
  } catch { return null; }
}

function isSchoolLevel(value: unknown): value is AudienceProfile['schoolLevel'] {
  return value === 'elementary' || value === 'junior' || value === 'senior';
}

function isTeacherRole(value: unknown): value is AudienceProfile['teacherRole'] {
  return value === 'homeroom' || value === 'subject' || value === 'admin';
}

function isDepartment(value: unknown): value is NonNullable<AudienceProfile['department']> {
  return value === 'academic' || value === 'student-affairs' || value === 'general-affairs' || value === 'counseling' || value === 'other';
}

export function dismissAudienceWizardForSession(): void {
  try { sessionStorage.setItem(AUDIENCE_DISMISSED_KEY, '1'); } catch { /* storage unavailable */ }
}

/** Deep links should preserve their user's explicit intent instead of opening an overlay. */
export function shouldAutoOpenAudienceWizard(params: URLSearchParams): boolean {
  if (readAudienceProfile()) return false;
  if (['q', 'category', 'tag', 'favorites', 'wish'].some((key) => params.has(key))) return false;
  try { return sessionStorage.getItem(AUDIENCE_DISMISSED_KEY) !== '1'; } catch { return true; }
}
