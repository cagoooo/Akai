import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToolTracking } from '../useToolTracking';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString();
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
    });

    it('should initialize with empty history', () => {
        const { result } = renderHook(() => useToolTracking());
        expect(result.current.recentTools).toEqual([]);
    });

    it('should track tool visit', () => {
        const { result } = renderHook(() => useToolTracking());

        act(() => {
            result.current.trackToolVisit('tool-1', 'Tool 1');
        });

        expect(result.current.recentTools).toHaveLength(1);
        expect(result.current.recentTools[0]).toMatchObject({
            id: 'tool-1',
            name: 'Tool 1',
        });
    });

    it('should limit recent tools to 10', () => {
        const { result } = renderHook(() => useToolTracking());

        act(() => {
            for (let i = 0; i < 15; i++) {
                result.current.trackToolVisit(`tool-${i}`, `Tool ${i}`);
            }
        });

        expect(result.current.recentTools).toHaveLength(10);
    });

    it('should persist to localStorage', () => {
        const { result } = renderHook(() => useToolTracking());

        act(() => {
            result.current.trackToolVisit('tool-1', 'Tool 1');
        });

        const stored = JSON.parse(localStorageMock.getItem('recentTools') || '[]');
        expect(stored).toHaveLength(1);
    });
});
