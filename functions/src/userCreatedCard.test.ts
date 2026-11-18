import { describe, expect, it } from 'vitest';
import { buildUserCreatedNotification, describeAccountType, describeProviders, PLATFORM } from './lib/userCreatedCard';

const now = new Date('2026-11-18T04:32:38Z');

describe('新使用者註冊通知：看得出是哪個平台、怎麼登入', () => {
  // 2026-11-18 實際通知：同一個 Chat 空間有好幾個系統，卡片看不出是哪個平台註冊的
  const user = {
    uid: 'DkrYcbavNlg9qji7O8UcEG4N8wA2',
    email: 'student@gmail.com',
    displayName: '193G036 測試學生',
    creationTime: 'Wed, 18 Nov 2026 04:32:38 GMT',
    providerIds: ['google.com'],
  };

  it('摘要文字與卡片標題都帶平台名稱，摘要附登入方式', () => {
    const { summaryText, card } = buildUserCreatedNotification(user, now);
    expect(summaryText).toBe('👤 【阿凱老師教育工具集】新使用者註冊：student@gmail.com（Google 帳號）');
    expect(card.card.header.title).toContain(PLATFORM.name);
    expect(card.cardId).toBe('register-DkrYcbavNlg9qji7O8UcEG4N8wA2');
  });

  it('卡片列出註冊平台、登入方式、帳號類型與台北時間', () => {
    const text = JSON.stringify(buildUserCreatedNotification(user, now).card);
    expect(text).toContain('註冊平台');
    expect(text).toContain('cagoooo.github.io/Akai/');
    expect(text).toContain('akai-e693f');
    expect(text).toContain('帳號類型：個人 Gmail');
    expect(text).toContain('2026/11/18');
    expect(text).toContain('https://cagoooo.github.io/Akai/');
  });

  it('使用者自己填的名稱會被跳脫，不能變成卡片格式', () => {
    const text = JSON.stringify(buildUserCreatedNotification({ ...user, displayName: '<b>假</b>' }, now).card);
    expect(text).toContain('&lt;b&gt;假&lt;/b&gt;');
    expect(text).not.toContain('<b>假</b>');
  });

  it('沒有 email、名稱或時間時用預設文字，不會出錯', () => {
    const { summaryText, card } = buildUserCreatedNotification({ uid: 'u1', creationTime: 'not-a-date' }, now);
    expect(summaryText).toContain('（無電子郵件）（未知）');
    expect(JSON.stringify(card)).toContain('未設定名稱');
    expect(JSON.stringify(card)).toContain('2026/11/18');
  });
});

describe('登入方式與帳號類型', () => {
  it('認得常見登入方式，重複的只列一次，不認得的照原樣', () => {
    expect(describeProviders(['google.com'])).toBe('Google 帳號');
    expect(describeProviders(['google.com', 'password', 'google.com'])).toBe('Google 帳號、電子郵件＋密碼');
    expect(describeProviders(['oidc.example'])).toBe('oidc.example');
    expect(describeProviders([])).toBe('未知');
  });

  it('依 email 網域分辨石門學校帳號、其他教育帳號、個人 Gmail', () => {
    expect(describeAccountType('t@mail2.smes.tyc.edu.tw')).toBe('石門國小學校帳號');
    expect(describeAccountType('t@abc.tyc.edu.tw')).toBe('學校／教育帳號（abc.tyc.edu.tw）');
    expect(describeAccountType('x@GMAIL.com')).toBe('個人 Gmail');
    expect(describeAccountType('x@outlook.com')).toBe('其他（outlook.com）');
    expect(describeAccountType(null)).toBe('沒有電子郵件');
  });
});
