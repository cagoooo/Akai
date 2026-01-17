/**
 * useAchievements Hook 單元測試
 * 測試成就系統追蹤與解鎖功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAchievements } from '../useAchievements';

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
    toast: vi.fn(),
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

describe('useAchievements', () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
    });

    it('should initialize with default stats', () => {
        const { result } = renderHook(() => useAchievements());

        expect(result.current.stats).toBeDefined();
        expect(result.current.totalEarned).toBe(0);
        expect(result.current.totalPoints).toBe(0);
    });

    it('should provide achievements array', () => {
        const { result } = renderHook(() => useAchievements());

        expect(result.current.achievements).toBeDefined();
        expect(Array.isArray(result.current.achievements)).toBe(true);
        expect(result.current.achievements.length).toBeGreaterThan(0);
    });

    it('should track tool usage', () => {
        const { result } = renderHook(() => useAchievements());

        act(() => {
            result.current.trackToolUsage(1, 'games');
        });

        expect(result.current.stats.uniqueToolsVisited).toContain(1);
        expect(result.current.stats.categoryUsage.games).toBe(1);
    });

    it('should not duplicate tool visits', () => {
        const { result } = renderHook(() => useAchievements());

        act(() => {
            result.current.trackToolUsage(1, 'games');
            result.current.trackToolUsage(1, 'games');
            result.current.trackToolUsage(1, 'games');
        });

        expect(result.current.stats.uniqueToolsVisited.filter((id: number) => id === 1).length).toBe(1);
    });

    it('should increment category usage', () => {
        const { result } = renderHook(() => useAchievements());

        act(() => {
            result.current.trackToolUsage(1, 'games');
            result.current.trackToolUsage(2, 'games');
            result.current.trackToolUsage(3, 'teaching');
        });

        expect(result.current.stats.categoryUsage.games).toBe(2);
        expect(result.current.stats.categoryUsage.teaching).toBe(1);
    });

    it('should update favorites count', () => {
        const { result } = renderHook(() => useAchievements());

        act(() => {
            result.current.updateFavoritesCount(5);
        });

        expect(result.current.stats.favoritesCount).toBe(5);
    });

    it('should increment reviews count', () => {
        const { result } = renderHook(() => useAchievements());

        act(() => {
            result.current.incrementReviewsCount();
            result.current.incrementReviewsCount();
        });

        expect(result.current.stats.reviewsCount).toBe(2);
    });

    it('should check if achievement is earned', () => {
        const { result } = renderHook(() => useAchievements());

        expect(result.current.isAchievementEarned('explorer')).toBe(false);
    });

    it('should persist stats to localStorage', () => {
        const { result } = renderHook(() => useAchievements());

        act(() => {
            result.current.trackToolUsage(1, 'games');
        });

        const saved = localStorageMock.getItem('akai-user-stats');
        expect(saved).not.toBeNull();
        const parsed = JSON.parse(saved!);
        expect(parsed.uniqueToolsVisited).toContain(1);
    });

    it('should load stats from localStorage on init', () => {
        const initialStats = {
            uniqueToolsVisited: [1, 2, 3],
            favoritesCount: 5,
            reviewsCount: 3,
            categoryUsage: { games: 10 },
            loginStreak: 1,
            lastLoginDate: new Date().toISOString().split('T')[0],
            totalPoints: 50,
            earlyMorningUsage: 0,
            lateNightUsage: 0,
        };
        localStorageMock.setItem('akai-user-stats', JSON.stringify(initialStats));

        const { result } = renderHook(() => useAchievements());

        expect(result.current.stats.uniqueToolsVisited).toEqual([1, 2, 3]);
        expect(result.current.stats.favoritesCount).toBe(5);
    });
});
