import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resetFavoritesStoreForTests, useFavorites } from '../useFavorites';

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
        resetFavoritesStoreForTests();
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
        await waitFor(() => expect(warning).toHaveBeenCalledOnce(), { timeout: 3000 });
        expect(state.getDoc).toHaveBeenCalledTimes(2);
        expect(result.current.favorites).toEqual([10]); expect(state.setDoc).not.toHaveBeenCalled();
        expect(state.onSnapshot).not.toHaveBeenCalled(); warning.mockRestore();
    });

    it('剛換新身分、另一分頁尚未同步而被拒時，重讀成功就不回報', async () => {
        const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
        state.getDoc
            .mockRejectedValueOnce(Object.assign(new Error('denied'), { code: 'permission-denied' }))
            .mockResolvedValueOnce({ exists: () => true, data: () => ({ toolIds: [7] }) });
        const { result } = renderHook(() => useFavorites());
        await waitFor(() => expect(state.onSnapshot).toHaveBeenCalledOnce(), { timeout: 3000 });
        expect(state.getDoc).toHaveBeenCalledTimes(2);
        expect(result.current.favorites).toEqual([7]); expect(warning).not.toHaveBeenCalled();
        warning.mockRestore();
    });
});

describe('整頁共用一份收藏（JAVASCRIPT-REACT-2S：每張卡片各讀一次）', () => {
    beforeEach(() => {
        vi.clearAllMocks(); localStorage.clear();
        resetFavoritesStoreForTests();
        state.user = state.currentUser = { uid: 'visitor' }; state.listeners = [];
        state.getDoc.mockResolvedValue({ exists: () => true, data: () => ({ toolIds: [3] }) });
        state.setDoc.mockResolvedValue(undefined);
        state.onSnapshot.mockImplementation((ref, next, error) => {
            state.listeners.push({ uid: ref.uid, next, error }); return state.unsubscribe;
        });
    });

    it('20 張卡片同時掛上：雲端只讀一次、只訂閱一次，大家看到同一份收藏', async () => {
        const cards = Array.from({ length: 20 }, () => renderHook(() => useFavorites()));
        await waitFor(() => expect(state.onSnapshot).toHaveBeenCalledOnce());
        expect(state.getDoc).toHaveBeenCalledOnce();
        for (const card of cards) expect(card.result.current.favorites).toEqual([3]);
    });

    it('一張卡片按收藏，其他卡片立刻跟著更新', async () => {
        const a = renderHook(() => useFavorites());
        const b = renderHook(() => useFavorites());
        await waitFor(() => expect(state.onSnapshot).toHaveBeenCalledOnce());
        act(() => a.result.current.toggleFavorite(9));
        expect(b.result.current.isFavorite(9)).toBe(true);
        await waitFor(() => expect(state.setDoc).toHaveBeenLastCalledWith({ uid: 'visitor' }, { toolIds: [3, 9], updatedAt: 'server-time' }, { merge: true }));
        expect(state.setDoc).toHaveBeenCalledOnce();
    });

    it('還有卡片在畫面上就不停止訂閱，最後一張卸載才停止；換頁重新掛上不再重讀', async () => {
        const a = renderHook(() => useFavorites());
        const b = renderHook(() => useFavorites());
        await waitFor(() => expect(state.onSnapshot).toHaveBeenCalledOnce());
        a.unmount();
        expect(state.unsubscribe).not.toHaveBeenCalled();
        b.unmount();
        expect(state.unsubscribe).toHaveBeenCalledOnce();
        renderHook(() => useFavorites());
        await waitFor(() => expect(state.onSnapshot).toHaveBeenCalledTimes(2));
        expect(state.getDoc).toHaveBeenCalledOnce();
    });

    it('讀取失敗時整頁只回報一次', async () => {
        const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
        state.getDoc.mockRejectedValue(Object.assign(new Error('unavailable'), { code: 'unavailable' }));
        Array.from({ length: 20 }, () => renderHook(() => useFavorites()));
        await waitFor(() => expect(warning).toHaveBeenCalledOnce());
        expect(state.getDoc).toHaveBeenCalledOnce();
        warning.mockRestore();
    });
});
