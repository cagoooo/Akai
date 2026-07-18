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
  signOut: vi.fn(),
}));

import { ensureSignedIn } from '@/lib/authService';

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

  it('本次 session 主動登出後尊重登出意圖', async () => {
    sessionStorage.setItem('akai_signed_out_this_session', '1');

    await expect(ensureSignedIn()).resolves.toBeNull();
    expect(mocks.signInAnonymously).not.toHaveBeenCalled();
  });
});
