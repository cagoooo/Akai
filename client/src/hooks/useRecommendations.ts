/**
 * 智慧推薦 Hook
 * 整合使用者行為數據，產生個人化推薦
 */

import { useMemo } from 'react';
import { tools, type EducationalTool } from '@/lib/data';
import { useFavorites } from './useFavorites';
import { useRecentTools } from './useRecentTools';
import { useAchievements } from './useAchievements';
import {
    generateRecommendations,
    getDefaultRecommendations,
    type UserBehavior,
    type RecommendedTool,
} from '@/lib/recommendation';

// 從 LocalStorage 取得工具使用統計
function getToolStats(): Record<number, number> {
    try {
        const stats = localStorage.getItem('localToolsStats');
        if (stats) {
            const parsed = JSON.parse(stats);
            const result: Record<number, number> = {};
            for (const item of parsed) {
                result[item.toolId] = item.totalClicks || 0;
            }
            return result;
        }
    } catch (e) {
        console.error('Failed to load tool stats:', e);
    }
    return {};
}

export function useRecommendations(toolsList: EducationalTool[] = [], limit: number = 6) {
    const { favorites } = useFavorites();
    const { recentIds } = useRecentTools();
    const { stats } = useAchievements();

    const finalTools = useMemo(() => toolsList.length > 0 ? toolsList : tools, [toolsList]);


    // 計算推薦
    const recommendations = useMemo<RecommendedTool[]>(() => {
        const toolStats = getToolStats();

        // 建立使用者行為資料
        const behavior: UserBehavior = {
            recentTools: recentIds,
            favorites: favorites,
            categoryUsage: stats.categoryUsage,
            visitedTools: stats.uniqueToolsVisited,
        };

        // 檢查是否有足夠的行為數據
        const hasEnoughData =
            recentIds.length > 0 ||
            favorites.length > 0 ||
            Object.keys(stats.categoryUsage).length > 0;

        if (hasEnoughData) {
            return generateRecommendations(finalTools, behavior, toolStats, limit);
        } else {
            // 新使用者：回傳熱門工具
            return getDefaultRecommendations(finalTools, toolStats, limit);
        }
    }, [finalTools, favorites, recentIds, stats.categoryUsage, stats.uniqueToolsVisited, limit]);

    // 是否為個人化推薦
    const isPersonalized = useMemo(() => {
        return recentIds.length > 0 ||
            favorites.length > 0 ||
            Object.keys(stats.categoryUsage).length > 0;
    }, [recentIds, favorites, stats.categoryUsage]);

    return {
        recommendations,
        isPersonalized,
        hasRecommendations: recommendations.length > 0,
    };
}
