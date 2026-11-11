import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRecentTools } from '../useRecentTools';

const state = vi.hoisted(() => ({
    user: { uid: 'visitor' } as { uid: string } | null,
    getDoc: vi.fn(), setDoc: vi.fn(), onSnapshot: vi.fn(), unsubscribe: vi.fn(),
}));
vi.mock('../useAuth', () => ({ useAuth: () => ({ user: state.user }) }));
vi.mock('@/lib/firebase', () => ({ db: {}, isFirebaseAvailable: () => true }));
vi.mock('firebase/firestore', () => ({
    doc: (_db: unknown, _collection: string, uid: string) => ({ uid }),
    getDoc: state.getDoc, setDoc: state.setDoc, serverTimestamp: () => 'server-time',
    onSnapshot: state.onSnapshot,
}));
const denied = () => Object.assign(new Error('Missing or insufficient permissions.'), { code: 'permission-denied' });

describe('最近使用工具：身分剛交接時讀取被拒（JAVASCRIPT-REACT-X）', () => {
    beforeEach(() => {
        vi.clearAllMocks(); localStorage.clear();
        state.user = { uid: 'visitor' };
        state.setDoc.mockResolvedValue(undefined);
        state.onSnapshot.mockReturnValue(state.unsubscribe);
    });

    it('第一次被拒、等身分同步後重讀成功，就不回報告警', async () => {
        const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
        state.getDoc
            .mockRejectedValueOnce(denied())
            .mockResolvedValueOnce({ exists: () => true, data: () => ({ toolIds: [46, 10] }) });
        const { result } = renderHook(() => useRecentTools());
        await waitFor(() => expect(state.onSnapshot).toHaveBeenCalledOnce(), { timeout: 3000 });
        expect(state.getDoc).toHaveBeenCalledTimes(2);
        expect(result.current.recentIds).toEqual([46, 10]);
        expect(warning).not.toHaveBeenCalled();
        warning.mockRestore();
    });

    it('重讀仍被拒才回報，並保留本機紀錄', async () => {
        const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
        localStorage.setItem('akai-recent-tools', '[3]');
        state.getDoc.mockRejectedValue(denied());
        const { result } = renderHook(() => useRecentTools());
        await waitFor(() => expect(warning).toHaveBeenCalledWith('[useRecentTools] Firestore load 失敗:', expect.anything()), { timeout: 3000 });
        expect(state.getDoc).toHaveBeenCalledTimes(2);
        expect(result.current.recentIds).toEqual([3]);
        warning.mockRestore();
    });

    it('卸載後才被拒，不重讀也不回報', async () => {
        const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
        let rejectRead!: (err: unknown) => void;
        state.getDoc.mockReturnValueOnce(new Promise((_, reject) => { rejectRead = reject; }));
        const { unmount } = renderHook(() => useRecentTools());
        await waitFor(() => expect(state.getDoc).toHaveBeenCalledOnce());
        unmount();
        rejectRead(denied());
        await new Promise((resolve) => setTimeout(resolve, 50));
        expect(state.getDoc).toHaveBeenCalledOnce();
        expect(warning).not.toHaveBeenCalled();
        warning.mockRestore();
    });
});
