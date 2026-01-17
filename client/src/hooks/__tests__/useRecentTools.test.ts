/**
 * useRecentTools Hook 單元測試
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRecentTools } from '../useRecentTools';

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

describe('useRecentTools', () => {
    beforeEach(() => {
        localStorageMock.clear();
    });

    it('should initialize with empty recent tools', () => {
        const { result } = renderHook(() => useRecentTools());
        expect(result.current.recentIds).toEqual([]);
        expect(result.current.hasRecent).toBe(false);
    });

    it('should add a tool to recent', () => {
        const { result } = renderHook(() => useRecentTools());

        act(() => {
            result.current.addToRecent(1);
        });

        expect(result.current.recentIds).toContain(1);
        expect(result.current.hasRecent).toBe(true);
    });

    it('should move existing tool to the front', () => {
        const { result } = renderHook(() => useRecentTools());

        act(() => {
            result.current.addToRecent(1);
            result.current.addToRecent(2);
            result.current.addToRecent(3);
        });

        // 3 should be at the front
        expect(result.current.recentIds[0]).toBe(3);

        act(() => {
            result.current.addToRecent(1);
        });

        // Now 1 should be at the front
        expect(result.current.recentIds[0]).toBe(1);
    });

    it('should limit recent tools to MAX_RECENT (5)', () => {
        const { result } = renderHook(() => useRecentTools());

        act(() => {
            for (let i = 1; i <= 10; i++) {
                result.current.addToRecent(i);
            }
        });

        // Should only contain the last 5
        expect(result.current.recentIds).toHaveLength(5);
        expect(result.current.recentIds[0]).toBe(10); // Most recent
        expect(result.current.recentIds[4]).toBe(6);  // Oldest in list
    });

    it('should clear recent tools', () => {
        const { result } = renderHook(() => useRecentTools());

        act(() => {
            result.current.addToRecent(1);
            result.current.addToRecent(2);
        });

        expect(result.current.hasRecent).toBe(true);

        act(() => {
            result.current.clearRecent();
        });

        expect(result.current.recentIds).toEqual([]);
        expect(result.current.hasRecent).toBe(false);
    });

    it('should persist to localStorage', () => {
        const { result } = renderHook(() => useRecentTools());

        act(() => {
            result.current.addToRecent(1);
        });

        const stored = JSON.parse(localStorageMock.getItem('akai-recent-tools') || '[]');
        expect(stored).toContain(1);
    });

    it('should load from localStorage on init', () => {
        localStorageMock.setItem('akai-recent-tools', JSON.stringify([3, 2, 1]));

        const { result } = renderHook(() => useRecentTools());

        expect(result.current.recentIds).toEqual([3, 2, 1]);
        expect(result.current.hasRecent).toBe(true);
    });
});
