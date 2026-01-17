/**
 * useSearchHistory Hook 單元測試
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSearchHistory } from '../useSearchHistory';

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

describe('useSearchHistory', () => {
    beforeEach(() => {
        localStorageMock.clear();
    });

    it('should initialize with empty history', () => {
        const { result } = renderHook(() => useSearchHistory());
        expect(result.current.history).toEqual([]);
        expect(result.current.hasHistory).toBe(false);
    });

    it('should add query to history', () => {
        const { result } = renderHook(() => useSearchHistory());

        act(() => {
            result.current.addToHistory('React');
        });

        expect(result.current.history).toContain('React');
        expect(result.current.hasHistory).toBe(true);
    });

    it('should not add empty or short queries', () => {
        const { result } = renderHook(() => useSearchHistory());

        act(() => {
            result.current.addToHistory('');
            result.current.addToHistory(' ');
            result.current.addToHistory('a');
        });

        expect(result.current.history).toEqual([]);
    });

    it('should move duplicate to front', () => {
        const { result } = renderHook(() => useSearchHistory());

        act(() => {
            result.current.addToHistory('React');
            result.current.addToHistory('Vue');
            result.current.addToHistory('Angular');
        });

        expect(result.current.history[0]).toBe('Angular');

        act(() => {
            result.current.addToHistory('React');
        });

        expect(result.current.history[0]).toBe('React');
        expect(result.current.history).toHaveLength(3);
    });

    it('should limit history to 10 items', () => {
        const { result } = renderHook(() => useSearchHistory());

        act(() => {
            for (let i = 0; i < 15; i++) {
                result.current.addToHistory(`Query ${i}`);
            }
        });

        expect(result.current.history).toHaveLength(10);
    });

    it('should remove specific query from history', () => {
        const { result } = renderHook(() => useSearchHistory());

        act(() => {
            result.current.addToHistory('React');
            result.current.addToHistory('Vue');
        });

        act(() => {
            result.current.removeFromHistory('React');
        });

        expect(result.current.history).not.toContain('React');
        expect(result.current.history).toContain('Vue');
    });

    it('should clear all history', () => {
        const { result } = renderHook(() => useSearchHistory());

        act(() => {
            result.current.addToHistory('React');
            result.current.addToHistory('Vue');
        });

        act(() => {
            result.current.clearHistory();
        });

        expect(result.current.history).toEqual([]);
        expect(result.current.hasHistory).toBe(false);
    });

    it('should persist to localStorage', () => {
        const { result } = renderHook(() => useSearchHistory());

        act(() => {
            result.current.addToHistory('React');
        });

        const stored = JSON.parse(localStorageMock.getItem('akai-search-history') || '[]');
        expect(stored).toContain('React');
    });
});
