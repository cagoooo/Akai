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
    const profile = value as StoredAudienceProfile;
    return (profile.audience === 'teacher' || profile.audience === 'student') ? profile : null;
  } catch { return null; }
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
