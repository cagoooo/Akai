import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useFavorites } from '../useFavorites';

const state = vi.hoisted(() => ({
    user: { uid: 'visitor' } as { uid: string } | null,
    currentUser: { uid: 'visitor' } as { uid: string } | null,
    getDoc: vi.fn(), setDoc: vi.fn(), onSnapshot: vi.fn(), unsubscribe: vi.fn(),
    listeners: [] as Array<{ uid: string; next: (snap: unknown) => void; error: (err: unknown) => void }>,
}));
vi.mock('../useAuth', () => ({ useAuth: () => ({ user: state.user }) }));
vi.mock('@/lib/firebase', () => ({ db: {}, isFirebaseAvailable: () => true }));
vi.mock('@/lib/authService', () => ({ getCurrentUser: () => state.currentUser }));
vi.mock('firebase/firestore', () => ({
    doc: (_db: unknown, _collection: string, uid: string) => ({ uid }),
    getDoc: state.getDoc, setDoc: state.setDoc, serverTimestamp: () => 'server-time',
    onSnapshot: state.onSnapshot,
}));
const empty = { exists: () => false };

describe('收藏訂閱的身分交接', () => {
    beforeEach(() => {
        vi.clearAllMocks(); localStorage.clear();
        state.user = state.currentUser = { uid: 'visitor' }; state.listeners = [];
        state.getDoc.mockResolvedValue(empty); state.setDoc.mockResolvedValue(undefined);
        state.onSnapshot.mockImplementation((ref, next, error) => {
            state.listeners.push({ uid: ref.uid, next, error }); return state.unsubscribe;
        });
    });

    it('合法匿名身分仍可合併並同步自己的收藏', async () => {
        localStorage.setItem('akai-favorites', '[10]');
        const { result } = renderHook(() => useFavorites());
        await waitFor(() => expect(state.onSnapshot).toHaveBeenCalledOnce());
        expect(state.setDoc).toHaveBeenCalledWith({ uid: 'visitor' }, { toolIds: [10], updatedAt: 'server-time' }, { merge: true });
        expect(result.current.favorites).toEqual([10]);
    });

    it('卸載後才完成讀取時不建立殘留訂閱或寫入', async () => {
        let resolveRead!: (value: typeof empty) => void;
        state.getDoc.mockReturnValue(new Promise(resolve => { resolveRead = resolve; }));
        const { unmount } = renderHook(() => useFavorites());
        await waitFor(() => expect(state.getDoc).toHaveBeenCalledOnce());
        unmount(); await act(async () => { resolveRead(empty); });
        expect(state.onSnapshot).not.toHaveBeenCalled(); expect(state.setDoc).not.toHaveBeenCalled();
    });

    it('登入切換後忽略舊訂閱的晚到錯誤，新身分仍建立訂閱', async () => {
        const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const { rerender } = renderHook(() => useFavorites());
        await waitFor(() => expect(state.listeners).toHaveLength(1));
        const old = state.listeners[0];
        state.currentUser = { uid: 'google' };
        act(() => old.error(Object.assign(new Error('Missing or insufficient permissions.'), { code: 'permission-denied' })));
        expect(warning).not.toHaveBeenCalled();
        state.user = state.currentUser; rerender();
        await waitFor(() => expect(state.listeners).toHaveLength(2));
        expect(state.unsubscribe).toHaveBeenCalled(); expect(state.listeners[1].uid).toBe('google');
        warning.mockRestore();
    });

    it('目前身分真正被拒絕時仍回報告警', async () => {
        const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
        renderHook(() => useFavorites());
        await waitFor(() => expect(state.listeners).toHaveLength(1));
        const err = Object.assign(new Error('Missing or insufficient permissions.'), { code: 'permission-denied' });
        act(() => state.listeners[0].error(err));
        expect(warning).toHaveBeenCalledWith('[useFavorites] onSnapshot 失敗:', err);
        warning.mockRestore();
    });

    it('讀取被拒絕時保留本機收藏，不把雲端當空清單覆寫', async () => {
        const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
        localStorage.setItem('akai-favorites', '[10]');
        state.getDoc.mockRejectedValue(Object.assign(new Error('denied'), { code: 'permission-denied' }));
        const { result } = renderHook(() => useFavorites());
        await waitFor(() => expect(warning).toHaveBeenCalledOnce());
        expect(result.current.favorites).toEqual([10]); expect(state.setDoc).not.toHaveBeenCalled();
        expect(state.onSnapshot).not.toHaveBeenCalled(); warning.mockRestore();
    });
});
