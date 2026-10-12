import { beforeEach, describe, expect, it, vi } from 'vitest';

const notify = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
vi.mock('./lib/googleChatNotify', () => ({ pushToGoogleChat: notify }));
vi.mock('./lib/githubIssueNotify', () => ({ createGithubErrorIssue: vi.fn().mockResolvedValue(undefined) }));
vi.mock('firebase-functions/params', () => ({ defineSecret: () => ({ value: () => 'offline-notification-test' }) }));
vi.mock('firebase-functions/v2/firestore', () => ({ onDocumentCreated: (_options: unknown, handler: unknown) => handler }));
vi.mock('firebase-functions/v1', () => ({
  region: () => ({ runWith: () => ({ auth: { user: () => ({ onCreate: (handler: unknown) => handler }) } }) }),
}));
vi.mock('firebase-admin/firestore', () => ({
  getFirestore: () => ({
    collection: () => ({ doc: () => ({}) }),
    runTransaction: async (callback: (transaction: unknown) => unknown) => callback({
      get: async () => ({ exists: false }), set: () => undefined,
    }),
  }),
}));

import { onEngagementEventCreated, onErrorLogCreated, onReviewCreated, onUserCreated, onWishCreated } from './googleChatTriggers';

type Handler = (event: unknown) => Promise<void>;
const attack = '</pre><a href="javascript:alert(1)">假按鈕</a> & <users/all>';
function event(data: Record<string, unknown>) {
  return { params: { docId: 'offline-review', eventId: 'offline-event' }, data: { data: () => data } };
}
function cardPayload() {
  expect(notify).toHaveBeenCalledTimes(1);
  return JSON.stringify(notify.mock.calls[0][2]);
}

beforeEach(() => notify.mockClear());

describe('實際通知 handler 的離線卡片組裝，不發送通知', () => {
  it('評論保留可信粗體，作者／標題／心得只呈現文字', async () => {
    await (onReviewCreated as unknown as Handler)(event({ toolId: 1, rating: 4, toolTitle: attack, userName: attack, comment: attack }));
    const payload = cardPayload();
    expect(payload).toContain('<b>&lt;/pre&gt;');
    expect(payload).toContain('&quot;javascript:alert(1)&quot;');
    expect(payload).not.toContain('<a href=');
    expect(payload).not.toContain('<users/all>');
  });

  it('許願內容不能注入卡片標籤', async () => {
    await (onWishCreated as unknown as Handler)(event({ userName: attack, content: attack, type: 'suggestion', rating: 5 }));
    expect(cardPayload()).toContain('<b>&lt;/pre&gt;');
    expect(cardPayload()).not.toContain('<users/all>');
  });

  it('錯誤堆疊保留可信 pre 與 font 樣式，惡意網址不能成為 href', async () => {
    await (onErrorLogCreated as unknown as Handler)(event({ message: attack, stack: attack, componentStack: attack,
      url: 'javascript:alert(1)', userAgent: attack, level: 'error', metadata: { appVersion: attack } }));
    const payload = cardPayload();
    expect(payload).toContain('<pre>&lt;/pre&gt;');
    expect(payload).toContain('https://cagoooo.github.io/Akai');
    expect(payload).not.toContain('<users/all>');
    expect(payload).not.toContain('href=\\"javascript:');
  });

  it('註冊卡片顯示名稱不能形成標籤', async () => {
    await (onUserCreated as unknown as Handler)({ uid: 'offline-user', email: 'teacher@example.test', displayName: attack,
      providerData: [{}], metadata: { creationTime: '2026-10-12T00:00:00.000Z' } });
    expect(cardPayload()).toContain('&lt;/pre&gt;');
    expect(cardPayload()).not.toContain('<users/all>');
  });

  it.each(['tool_click', 'blog_read'])('%s 卡片不重複 HTML 編碼，非法連結退回站內入口', async type => {
    await (onEngagementEventCreated as unknown as Handler)(event({ type, toolId: 1, toolTitle: attack, title: attack,
      toolCategory: attack, source: 'home', slug: 'offline', targetUrl: 'javascript:alert(1)', pageUrl: 'data:text/html,invalid' }));
    const payload = cardPayload();
    expect(payload).toContain('&lt;/pre&gt;');
    expect(payload).not.toContain('&amp;lt;');
    expect(payload).not.toContain('<users/all>');
    expect(payload).not.toContain('"url":"javascript:');
    expect(payload).not.toContain('"url":"data:');
  });
});
