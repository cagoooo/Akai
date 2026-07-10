import { beforeEach, describe, expect, it } from 'vitest';
import { AUDIENCE_PROFILE_KEY, dismissAudienceWizardForSession, readAudienceProfile, shouldAutoOpenAudienceWizard } from '../audienceProfileStorage';

describe('audienceProfileStorage', () => {
  beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });
  it('讀取 version 1 的既有身分資料', () => {
    localStorage.setItem(AUDIENCE_PROFILE_KEY, JSON.stringify({ version: 1, audience: 'teacher', schoolLevel: 'elementary', teacherRole: 'homeroom', completedAt: '2026-07-10T00:00:00.000Z' }));
    expect(readAudienceProfile()?.teacherRole).toBe('homeroom');
  });
  it('本次瀏覽稍後再說不會再次自動開啟', () => {
    dismissAudienceWizardForSession();
    expect(shouldAutoOpenAudienceWizard(new URLSearchParams())).toBe(false);
    sessionStorage.clear();
    expect(shouldAutoOpenAudienceWizard(new URLSearchParams())).toBe(true);
  });
  it.each(['q=搜尋', 'category=games', 'favorites=1', 'wish=1'])('保留深連結 %s', (query) => {
    expect(shouldAutoOpenAudienceWizard(new URLSearchParams(query))).toBe(false);
  });
});
