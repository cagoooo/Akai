import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  ensureSignedIn: vi.fn(),
  addDoc: vi.fn(),
}));
vi.mock('@/lib/firebase', () => ({ db: {} }));
vi.mock('@/lib/authService', () => ({ ensureSignedIn: mocks.ensureSignedIn }));
vi.mock('firebase/firestore', () => ({
  addDoc: mocks.addDoc,
  collection: () => ({}),
  serverTimestamp: () => 'server-time',
}));
vi.mock('@/lib/publicAnalyticsService', () => ({ invokePublicAnalytics: vi.fn() }));

import { notifyEngagementAfterHomeEntry } from '../analytics';

describe('互動通知寫入前要有登入身分（JAVASCRIPT-REACT-X）', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    mocks.addDoc.mockResolvedValue({ id: 'evt' });
  });

  it('匿名登入沒成功：不寫入、不報錯', async () => {
    mocks.ensureSignedIn.mockResolvedValue(null);
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    await notifyEngagementAfterHomeEntry({ type: 'blog_read', slug: 'typing-70-zhuyin-pro' } as never);
    expect(mocks.addDoc).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it('有身分：照常寫入', async () => {
    mocks.ensureSignedIn.mockResolvedValue({ uid: 'visitor' });
    await notifyEngagementAfterHomeEntry({ type: 'blog_read', slug: 'typing-70-zhuyin-pro' } as never);
    expect(mocks.addDoc).toHaveBeenCalledOnce();
  });

  it('有身分但被規則擋下（真的設定錯）：照常回報', async () => {
    mocks.ensureSignedIn.mockResolvedValue({ uid: 'visitor' });
    const denied = Object.assign(new Error('Missing or insufficient permissions.'), { code: 'permission-denied' });
    mocks.addDoc.mockRejectedValue(denied);
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    await notifyEngagementAfterHomeEntry({ type: 'blog_read', slug: 'another-post' } as never);
    expect(error).toHaveBeenCalledWith('[engagement notify] 寫入失敗:', denied);
  });
});
