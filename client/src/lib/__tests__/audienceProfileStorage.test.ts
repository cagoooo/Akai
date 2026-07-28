import { beforeEach, describe, expect, it } from 'vitest';
import {
  AUDIENCE_PROFILE_KEY,
  AUDIENCE_REFRESH_DAYS,
  AUDIENCE_SNOOZE_KEY,
  dismissAudienceWizardForSession,
  isAudienceProfileStale,
  isAudienceRePrompt,
  readAudienceProfile,
  saveAudienceProfile,
  shouldAutoOpenAudienceWizard,
  snoozeAudienceRePrompt,
} from '../audienceProfileStorage';

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = new Date('2026-08-01T09:00:00.000Z');
const daysAgo = (n: number) => new Date(NOW.getTime() - n * DAY_MS).toISOString();

function storeProfile(completedAt: string) {
  localStorage.setItem(
    AUDIENCE_PROFILE_KEY,
    JSON.stringify({ version: 1, audience: 'teacher', schoolLevel: 'elementary', teacherRole: 'homeroom', completedAt }),
  );
}

describe('audienceProfileStorage', () => {
  beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });
  it('讀取 version 1 的既有身分資料', () => {
    localStorage.setItem(AUDIENCE_PROFILE_KEY, JSON.stringify({ version: 1, audience: 'teacher', schoolLevel: 'elementary', teacherRole: 'homeroom', completedAt: '2026-07-10T00:00:00.000Z' }));
    expect(readAudienceProfile()?.teacherRole).toBe('homeroom');
  });
  it('讀取學生帶學段的身分資料（P1-2）', () => {
    localStorage.setItem(AUDIENCE_PROFILE_KEY, JSON.stringify({ version: 1, audience: 'student', schoolLevel: 'junior', completedAt: '2026-07-11T00:00:00.000Z' }));
    expect(readAudienceProfile()).toMatchObject({ audience: 'student', schoolLevel: 'junior' });
  });
  it('讀取學生未選學段的身分資料（仍合法）', () => {
    localStorage.setItem(AUDIENCE_PROFILE_KEY, JSON.stringify({ version: 1, audience: 'student', completedAt: '2026-07-11T00:00:00.000Z' }));
    expect(readAudienceProfile()).toMatchObject({ audience: 'student' });
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
  it.each([
    { version: 1, audience: 'teacher', completedAt: '2026-07-10T00:00:00.000Z' },
    { version: 1, audience: 'teacher', schoolLevel: 'elementary', teacherRole: 'admin', completedAt: 'not-a-date' },
    { version: 1, audience: 'teacher', schoolLevel: 'elementary', teacherRole: 'admin', completedAt: '2026-07-10T00:00:00.000Z' },
    { version: 1, audience: 'student', schoolLevel: 'elementary', teacherRole: 'homeroom', completedAt: '2026-07-10T00:00:00.000Z' }, // 學生不得有 teacherRole
    { version: 1, audience: 'student', schoolLevel: 'senior', department: 'academic', completedAt: '2026-07-10T00:00:00.000Z' }, // 學生不得有 department
  ])('rejects malformed stored profiles', (invalid) => {
    localStorage.setItem(AUDIENCE_PROFILE_KEY, JSON.stringify(invalid));
    expect(readAudienceProfile()).toBeNull();
  });

  describe('回訪重問（隔幾天再請訪客選一次族群）', () => {
    it(`剛選完 ${AUDIENCE_REFRESH_DAYS} 天內回訪不會被重複打擾`, () => {
      storeProfile(daysAgo(AUDIENCE_REFRESH_DAYS - 1));
      expect(isAudienceProfileStale({ completedAt: daysAgo(AUDIENCE_REFRESH_DAYS - 1) }, NOW)).toBe(false);
      expect(shouldAutoOpenAudienceWizard(new URLSearchParams(), NOW)).toBe(false);
    });

    it(`超過 ${AUDIENCE_REFRESH_DAYS} 天回訪會再問一次`, () => {
      storeProfile(daysAgo(AUDIENCE_REFRESH_DAYS));
      expect(isAudienceProfileStale({ completedAt: daysAgo(AUDIENCE_REFRESH_DAYS) }, NOW)).toBe(true);
      expect(shouldAutoOpenAudienceWizard(new URLSearchParams(), NOW)).toBe(true);
      expect(isAudienceRePrompt(NOW)).toBe(true);
    });

    it('回訪重問期間仍尊重深連結', () => {
      storeProfile(daysAgo(30));
      expect(shouldAutoOpenAudienceWizard(new URLSearchParams('q=英語'), NOW)).toBe(false);
    });

    it('重問被「這次先跳過」關掉 → 隔幾天才會再問', () => {
      storeProfile(daysAgo(30));
      snoozeAudienceRePrompt(NOW);
      sessionStorage.clear(); // 模擬換一次新的瀏覽 session
      expect(shouldAutoOpenAudienceWizard(new URLSearchParams(), NOW)).toBe(false);
      const afterSnooze = new Date(NOW.getTime() + 4 * DAY_MS);
      expect(shouldAutoOpenAudienceWizard(new URLSearchParams(), afterSnooze)).toBe(true);
    });

    it('重新選完會重置計時並清掉延後', () => {
      storeProfile(daysAgo(30));
      snoozeAudienceRePrompt(NOW);
      saveAudienceProfile({ audience: 'teacher', schoolLevel: 'elementary', teacherRole: 'subject' });
      sessionStorage.clear();
      expect(localStorage.getItem(AUDIENCE_SNOOZE_KEY)).toBeNull();
      // completedAt 是「現在」→ 以現在為基準判斷，不該再被視為過期
      expect(shouldAutoOpenAudienceWizard(new URLSearchParams(), new Date())).toBe(false);
      expect(isAudienceRePrompt(new Date())).toBe(false);
    });

    it('首次引導（沒有舊 profile）不受延後影響，行為不變', () => {
      expect(shouldAutoOpenAudienceWizard(new URLSearchParams(), NOW)).toBe(true);
      expect(isAudienceRePrompt(NOW)).toBe(false);
      dismissAudienceWizardForSession();
      expect(shouldAutoOpenAudienceWizard(new URLSearchParams(), NOW)).toBe(false);
      expect(localStorage.getItem(AUDIENCE_SNOOZE_KEY)).toBeNull();
    });
  });
});
