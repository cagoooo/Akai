import { SCHOOL_LEVELS } from './audienceProfile';
import type { AudienceProfile, SchoolLevel } from './audienceProfile';

export const AUDIENCE_PROFILE_KEY = 'akai_audience_profile_v1';
export const AUDIENCE_DISMISSED_KEY = 'akai_audience_wizard_dismissed_v1';
/** 回訪重問：稍後再說時把下次重問時間往後推（localStorage，跨 session 有效） */
export const AUDIENCE_SNOOZE_KEY = 'akai_audience_wizard_snooze_v1';

const DAY_MS = 24 * 60 * 60 * 1000;
/** 選過族群後幾天，回訪時再請他選一次（每次重選都會帶出新的推薦） */
export const AUDIENCE_REFRESH_DAYS = 7;
/** 回訪重問被「稍後再說」關掉後，隔幾天才會再問（避免每次進站都被攔） */
export const AUDIENCE_SNOOZE_DAYS = 3;

export type StoredAudienceProfile = AudienceProfile & { version: 1; completedAt: string };

export function saveAudienceProfile(profile: AudienceProfile): StoredAudienceProfile {
  const stored: StoredAudienceProfile = { ...profile, version: 1, completedAt: new Date().toISOString() };
  try {
    localStorage.setItem(AUDIENCE_PROFILE_KEY, JSON.stringify(stored));
    // 重新選完 → 重新計時，並清掉之前的「稍後再說」延後
    localStorage.removeItem(AUDIENCE_SNOOZE_KEY);
  } catch { /* private mode / quota */ }
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
      // P1-2：學生可選填 schoolLevel，但不得有 teacherRole / department
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

function isSchoolLevel(value: unknown): value is SchoolLevel {
  return (SCHOOL_LEVELS as readonly unknown[]).includes(value);
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

/**
 * 回訪重問被關掉 → 除了本次 session，再延後 AUDIENCE_SNOOZE_DAYS 天才會重問。
 * 首次引導（還沒有 profile）不呼叫這個，維持原本「只擋這次 session」的行為。
 */
export function snoozeAudienceRePrompt(now: Date = new Date()): void {
  dismissAudienceWizardForSession();
  try {
    localStorage.setItem(AUDIENCE_SNOOZE_KEY, new Date(now.getTime() + AUDIENCE_SNOOZE_DAYS * DAY_MS).toISOString());
  } catch { /* storage unavailable */ }
}

/** 上次選族群距今是否已超過 AUDIENCE_REFRESH_DAYS 天（→ 值得再問一次拿新推薦） */
export function isAudienceProfileStale(
  stored: Pick<StoredAudienceProfile, 'completedAt'>,
  now: Date = new Date(),
): boolean {
  const completedAt = Date.parse(stored.completedAt);
  if (Number.isNaN(completedAt)) return false;
  return now.getTime() - completedAt >= AUDIENCE_REFRESH_DAYS * DAY_MS;
}

function isSnoozed(now: Date): boolean {
  try {
    const raw = localStorage.getItem(AUDIENCE_SNOOZE_KEY);
    if (!raw) return false;
    const until = Date.parse(raw);
    return !Number.isNaN(until) && now.getTime() < until;
  } catch { return false; }
}

/**
 * Deep links should preserve their user's explicit intent instead of opening an overlay.
 *
 * v3.6.99：已經選過族群的訪客，隔 AUDIENCE_REFRESH_DAYS 天回訪時會再問一次。
 * 每一次重選都會重跑推薦引擎（工具持續在長、熱門度與 freshness 也在動），
 * 所以「再點一次」對訪客的價值是拿到一批沒看過的新工具。
 */
export function shouldAutoOpenAudienceWizard(params: URLSearchParams, now: Date = new Date()): boolean {
  if (['q', 'category', 'tag', 'favorites', 'wish'].some((key) => params.has(key))) return false;
  try { if (sessionStorage.getItem(AUDIENCE_DISMISSED_KEY) === '1') return false; } catch { /* storage unavailable */ }

  const stored = readAudienceProfile();
  if (!stored) return true;
  if (!isAudienceProfileStale(stored, now)) return false;
  return !isSnoozed(now);
}

/** 這次自動開啟是「回訪重問」而不是「首次引導」（決定精靈文案與關閉行為） */
export function isAudienceRePrompt(now: Date = new Date()): boolean {
  const stored = readAudienceProfile();
  return stored !== null && isAudienceProfileStale(stored, now);
}
