import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as randomId from '../randomId';
const mocks = vi.hoisted(() => ({ ready: vi.fn(), auth: vi.fn(), signedOut: vi.fn(() => false), callable: vi.fn(), httpsCallable: vi.fn() }));
vi.mock('../userInteraction', () => ({ userInteractionReady: Promise.resolve() }));
vi.mock('@/lib/firebase', () => ({ default: {}, waitForAppCheck: mocks.ready }));
vi.mock('@/lib/authService', () => ({ ensureSignedIn: mocks.auth, isSignedOutThisSession: mocks.signedOut }));
vi.mock('firebase/functions', () => ({ getFunctions: vi.fn(() => ({})), httpsCallable: mocks.httpsCallable }));
import { invokePublicAnalytics } from '../publicAnalyticsService';
afterEach(() => vi.restoreAllMocks());

describe('統計送出前的驗證', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.ready.mockResolvedValue(true);
    mocks.auth.mockResolvedValue({ uid: 'test' });
    mocks.callable.mockResolvedValue({ data: { ok: true } });
    mocks.httpsCallable.mockReturnValue(mocks.callable);
  });
  it('驗證未通過就不傳送 callable 或建立統計身份', async () => {
    mocks.ready.mockResolvedValue(false);
    expect(await invokePublicAnalytics({ kind: 'visitorCount' })).toBe(false);
    expect(mocks.auth).not.toHaveBeenCalled();
    expect(mocks.httpsCallable).not.toHaveBeenCalled();
  });
  it('有效 token 與身份齊備才送事件，保留去重識別', async () => {
    expect(await invokePublicAnalytics({ kind: 'visitorCount' })).toBe(true);
    expect(mocks.callable).toHaveBeenCalledWith(expect.objectContaining({ kind: 'visitorCount', eventId: expect.any(String) }));
  });
  it('沒有身份仍拒絕送出，不放寬後端認證', async () => {
    mocks.auth.mockResolvedValue(null);
    await expect(invokePublicAnalytics({ kind: 'visitorCount' })).rejects.toThrow('認證尚未就緒');
    expect(mocks.callable).not.toHaveBeenCalled();
  });
  it('訪客本次主動登出時略過統計、不當成錯誤', async () => {
    mocks.auth.mockResolvedValue(null);
    mocks.signedOut.mockReturnValueOnce(true);
    expect(await invokePublicAnalytics({ kind: 'visitorCount' })).toBe(false);
    expect(mocks.callable).not.toHaveBeenCalled();
  });
  it('無系統亂數時明確停止送出，不使用可預測去重ID', async () => {
    vi.spyOn(randomId, 'createSecureRandomId').mockReturnValue(null);
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(await invokePublicAnalytics({ kind: 'visitorCount' })).toBe(false);
    expect(mocks.callable).not.toHaveBeenCalled();
    expect(warning).toHaveBeenCalledWith('無法產生安全事件識別碼，本次雲端統計未送出。');
  });
});
