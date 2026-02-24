/**
 * 排序選項 Hook
 * 管理工具列表的排序方式
 */

import { useState, useCallback } from 'react';
import type { EducationalTool } from '@/lib/data';

export type SortOption = 'popular' | 'newest' | 'name' | 'random';

interface SortConfig {
    option: SortOption;
    label: string;
    icon: string;
}

export const sortOptions: SortConfig[] = [
    { option: 'random', label: '隨機', icon: '🎲' },
    { option: 'popular', label: '熱門', icon: '🔥' },
    { option: 'name', label: '名稱', icon: '🔤' },
    { option: 'newest', label: '最新', icon: '✨' },
];

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

// Fisher-Yates 洗牌演算法
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// 會話級別的隨機種子，確保在頁面不重整的情況下，隨機排序結果是穩定的
const sessionSeed = Math.random();

export function useSortOptions() {
    const [currentSort, setCurrentSort] = useState<SortOption>('random');

    // 排序工具列表
    const sortTools = useCallback((tools: EducationalTool[]): EducationalTool[] => {
        const toolsCopy = [...tools];

        switch (currentSort) {
            case 'popular': {
                const stats = getToolStats();
                return toolsCopy.sort((a, b) => (stats[b.id] || 0) - (stats[a.id] || 0));
            }
            case 'name':
                return toolsCopy.sort((a, b) => a.title.localeCompare(b.title, 'zh-TW'));
            case 'newest':
                // 假設 ID 越大越新
                return toolsCopy.sort((a, b) => b.id - a.id);
            case 'random':
            default:
                // 🚀 [穩定性優化] 改成基於 ID 與 SessionSeed 的穩定隨機權重
                // 這樣在同一個會話中，即使組件重新渲染，順序也會保持一致
                return toolsCopy.sort((a, b) => {
                    const weightA = Math.sin(a.id * 878.5 + sessionSeed) * 10000;
                    const weightB = Math.sin(b.id * 878.5 + sessionSeed) * 10000;
                    return (weightA - Math.floor(weightA)) - (weightB - Math.floor(weightB));
                });
        }
    }, [currentSort]);

    return {
        currentSort,
        setCurrentSort,
        sortTools,
        sortOptions,
    };
}
