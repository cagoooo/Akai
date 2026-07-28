import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useUserIdle } from '../useUserIdle';

describe('useUserIdle', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    it('停手超過門檻才算閒置', () => {
        const { result } = renderHook(() => useUserIdle(20_000));
        expect(result.current).toBe(false);

        act(() => { vi.advanceTimersByTime(19_000); });
        expect(result.current).toBe(false);

        act(() => { vi.advanceTimersByTime(1_500); });
        expect(result.current).toBe(true);
    });

    it('使用者一有動作就重新計時（正在操作時不會被判定為閒置）', () => {
        const { result } = renderHook(() => useUserIdle(20_000));

        act(() => { vi.advanceTimersByTime(21_000); });
        expect(result.current).toBe(true);

        act(() => { window.dispatchEvent(new Event('keydown')); });
        expect(result.current).toBe(false);

        act(() => { vi.advanceTimersByTime(19_000); });
        expect(result.current).toBe(false);
    });

    it('分頁切到背景立刻視為閒置（人不在畫面前，正是最無感的更新時機）', () => {
        const { result } = renderHook(() => useUserIdle(20_000));
        const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);

        act(() => { document.dispatchEvent(new Event('visibilitychange')); });
        expect(result.current).toBe(true);

        hidden.mockReturnValue(false);
        act(() => { document.dispatchEvent(new Event('visibilitychange')); });
        expect(result.current).toBe(false);
    });
});
