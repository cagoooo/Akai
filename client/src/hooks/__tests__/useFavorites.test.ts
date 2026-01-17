/**
 * useFavorites Hook 單元測試
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFavorites } from '../useFavorites';

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

describe('useFavorites', () => {
    beforeEach(() => {
        localStorageMock.clear();
    });

    it('should initialize with empty favorites', () => {
        const { result } = renderHook(() => useFavorites());
        expect(result.current.favorites).toEqual([]);
        expect(result.current.favoritesCount).toBe(0);
    });

    it('should add a tool to favorites', () => {
        const { result } = renderHook(() => useFavorites());

        act(() => {
            result.current.toggleFavorite(1);
        });

        expect(result.current.favorites).toContain(1);
        expect(result.current.favoritesCount).toBe(1);
        expect(result.current.isFavorite(1)).toBe(true);
    });

    it('should remove a tool from favorites when toggled again', () => {
        const { result } = renderHook(() => useFavorites());

        act(() => {
            result.current.toggleFavorite(1);
        });

        expect(result.current.isFavorite(1)).toBe(true);

        act(() => {
            result.current.toggleFavorite(1);
        });

        expect(result.current.favorites).not.toContain(1);
        expect(result.current.isFavorite(1)).toBe(false);
    });

    it('should handle multiple favorites', () => {
        const { result } = renderHook(() => useFavorites());

        act(() => {
            result.current.toggleFavorite(1);
            result.current.toggleFavorite(2);
            result.current.toggleFavorite(3);
        });

        expect(result.current.favorites).toHaveLength(3);
        expect(result.current.isFavorite(1)).toBe(true);
        expect(result.current.isFavorite(2)).toBe(true);
        expect(result.current.isFavorite(3)).toBe(true);
    });

    it('should persist favorites to localStorage', () => {
        const { result } = renderHook(() => useFavorites());

        act(() => {
            result.current.toggleFavorite(1);
        });

        const stored = JSON.parse(localStorageMock.getItem('akai-favorites') || '[]');
        expect(stored).toContain(1);
    });

    it('should load favorites from localStorage on init', () => {
        localStorageMock.setItem('akai-favorites', JSON.stringify([1, 2, 3]));

        const { result } = renderHook(() => useFavorites());

        expect(result.current.favorites).toEqual([1, 2, 3]);
        expect(result.current.favoritesCount).toBe(3);
    });

    it('should return correct isFavorite status', () => {
        const { result } = renderHook(() => useFavorites());

        act(() => {
            result.current.toggleFavorite(5);
        });

        expect(result.current.isFavorite(5)).toBe(true);
        expect(result.current.isFavorite(999)).toBe(false);
    });
});
