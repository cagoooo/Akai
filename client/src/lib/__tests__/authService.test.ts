import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  auth: { currentUser: null as any },
  isAuthAvailable: vi.fn(() => true),
  onAuthStateChanged: vi.fn(),
  signInAnonymously: vi.fn(),
}));

vi.mock('@/lib/firebase', () => ({
  auth: mocks.auth,
  isAuthAvailable: mocks.isAuthAvailable,
}));

vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: class GoogleAuthProvider {},
  onAuthStateChanged: mocks.onAuthStateChanged,
  signInAnonymously: mocks.signInAnonymously,
  signInWithPopup: vi.fn(),
  browserPopupRedirectResolver: {},
  signOut: vi.fn(),
}));

import { signInWithPopup } from 'firebase/auth';
import { ensureSignedIn, getLastAnonymousSignInError, signInWithGoogle } from '@/lib/authService';

describe('ensureSignedIn 匿名認證', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    mocks.auth.currentUser = null;
    mocks.isAuthAvailable.mockReturnValue(true);
    mocks.onAuthStateChanged.mockImplementation((_auth, callback) => {
      queueMicrotask(() => callback(mocks.auth.currentUser));
      return vi.fn();
    });
    mocks.signInAnonymously.mockResolvedValue({
      user: { uid: 'anonymous-user', isAnonymous: true },
    });
  });

  it('沒有既有 session 時會建立匿名身分', async () => {
    const user = await ensureSignedIn();

    expect(mocks.signInAnonymously).toHaveBeenCalledTimes(1);
    expect(user).toMatchObject({ uid: 'anonymous-user', isAnonymous: true });
  });

  it('已有 Firebase 身分時不重複匿名登入', async () => {
    mocks.auth.currentUser = { uid: 'google-user', isAnonymous: false };

    await expect(ensureSignedIn()).resolves.toBe(mocks.auth.currentUser);
    expect(mocks.signInAnonymously).not.toHaveBeenCalled();
  });

  it('同時呼叫多次只建立一個匿名帳號並共用同一個 user', async () => {
    const [a, b] = await Promise.all([ensureSignedIn(), ensureSignedIn()]);

    expect(mocks.signInAnonymously).toHaveBeenCalledTimes(1);
    expect(a).toBe(b);
    expect(a).toMatchObject({ uid: 'anonymous-user' });
  });

  it('前一次匿名登入失敗後，下一次呼叫可重新嘗試', async () => {
    mocks.signInAnonymously.mockRejectedValueOnce(new Error('network'));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await expect(ensureSignedIn()).resolves.toBeNull();
    await expect(ensureSignedIn()).resolves.toMatchObject({ uid: 'anonymous-user' });
    expect(mocks.signInAnonymously).toHaveBeenCalledTimes(2);
    warn.mockRestore();
  });

  it('記住最近一次匿名登入失敗的原因，之後成功就清掉（JAVASCRIPT-REACT-1F）', async () => {
    const networkError = Object.assign(new Error('Firebase: Error (auth/network-request-failed).'), { code: 'auth/network-request-failed' });
    mocks.signInAnonymously.mockRejectedValueOnce(networkError);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await expect(ensureSignedIn()).resolves.toBeNull();
    expect(getLastAnonymousSignInError()).toBe(networkError);
    await ensureSignedIn();
    expect(getLastAnonymousSignInError()).toBeNull();
    warn.mockRestore();
  });

  it('本次 session 主動登出後尊重登出意圖', async () => {
    sessionStorage.setItem('akai_signed_out_this_session', '1');

    await expect(ensureSignedIn()).resolves.toBeNull();
    expect(mocks.signInAnonymously).not.toHaveBeenCalled();
  });
});

describe('signInWithGoogle 遇到 App 內建瀏覽器', () => {
  const originalUA = navigator.userAgent;
  const setUA = (ua: string) => Object.defineProperty(navigator, 'userAgent', { value: ua, configurable: true });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isAuthAvailable.mockReturnValue(true);
    vi.mocked(signInWithPopup).mockResolvedValue({ user: { uid: 'google-user' } } as any);
  });

  it.each([
    ['LINE', 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/129.0 Mobile Safari/537.36 Line/14.0.0'],
    ['iPhone 臉書', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/480.0]'],
  ])('%s：先提醒改用瀏覽器開啟，不開 Google 登入視窗（避免 403 disallowed_useragent）', async (_name, ua) => {
    setUA(ua);
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    try {
      await expect(signInWithGoogle()).resolves.toBeNull();
      expect(signInWithPopup).not.toHaveBeenCalled();
      expect(alert).toHaveBeenCalledTimes(1);
      expect(String(alert.mock.calls[0][0])).toContain('用預設瀏覽器開啟');
    } finally {
      alert.mockRestore();
      setUA(originalUA);
    }
  });

  it('一般瀏覽器照常開 Google 登入視窗', async () => {
    setUA('Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36');
    try {
      await expect(signInWithGoogle()).resolves.toMatchObject({ uid: 'google-user' });
      expect(signInWithPopup).toHaveBeenCalledTimes(1);
    } finally {
      setUA(originalUA);
    }
  });
});
