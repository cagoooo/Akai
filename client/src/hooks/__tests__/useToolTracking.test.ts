/**
 * useToolTracking Hook 單元測試
 * 測試工具使用追蹤功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useToolTracking } from '../useToolTracking';

// Mock firestoreService
vi.mock('@/lib/firestoreService', () => ({
    trackToolUsage: vi.fn().mockResolvedValue({ totalClicks: 1 }),
}));

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString();
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

describe('useToolTracking', () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
    });

    it('should provide trackToolUsage function', () => {
        const { result } = renderHook(() => useToolTracking());
        expect(result.current.trackToolUsage).toBeDefined();
        expect(typeof result.current.trackToolUsage).toBe('function');
    });

    it('should track tool usage and return result', async () => {
        const { result } = renderHook(() => useToolTracking());

        let trackResult: any;
        await act(async () => {
            trackResult = await result.current.trackToolUsage(1);
        });

        expect(trackResult).toBeDefined();
        expect(trackResult.toolId).toBe(1);
        expect(trackResult.message).toBeDefined();
    });

    it('should update local storage on track', async () => {
        const { result } = renderHook(() => useToolTracking());

        await act(async () => {
            await result.current.trackToolUsage(1);
        });

        const stored = localStorageMock.getItem('localToolsStats');
        expect(stored).not.toBeNull();
    });

    it('should handle multiple tool tracking', async () => {
        const { result } = renderHook(() => useToolTracking());

        await act(async () => {
            await result.current.trackToolUsage(1);
            await result.current.trackToolUsage(2);
            await result.current.trackToolUsage(3);
        });

        const stored = localStorageMock.getItem('localToolsStats');
        expect(stored).not.toBeNull();
    });

});

