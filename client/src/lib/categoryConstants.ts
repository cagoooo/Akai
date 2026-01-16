/**
 * 分類常數定義
 * 集中管理所有分類的中文名稱、Emoji 和顏色
 */

import type { ToolCategory } from './data';

export interface CategoryInfo {
    label: string;
    emoji: string;
    color: string;      // Badge 顏色
    darkColor: string;  // 深色模式顏色
}

/**
 * 分類資訊對照表
 * 使用可愛的 Emoji 和繁體中文
 */
export const categoryInfo: Record<ToolCategory | 'all', CategoryInfo> = {
    all: {
        label: '全部工具',
        emoji: '🌟',
        color: 'bg-primary/10 text-primary',
        darkColor: 'dark:bg-primary/20 dark:text-primary',
    },
    games: {
        label: '趣味遊戲',
        emoji: '🎮',
        color: 'bg-pink-100 text-pink-800',
        darkColor: 'dark:bg-pink-900 dark:text-pink-200',
    },
    utilities: {
        label: '實用工具',
        emoji: '🛠️',
        color: 'bg-slate-100 text-slate-800',
        darkColor: 'dark:bg-slate-800 dark:text-slate-200',
    },
    teaching: {
        label: '教學資源',
        emoji: '📚',
        color: 'bg-purple-100 text-purple-800',
        darkColor: 'dark:bg-purple-900 dark:text-purple-200',
    },
    language: {
        label: '語言學習',
        emoji: '🗣️',
        color: 'bg-green-100 text-green-800',
        darkColor: 'dark:bg-green-900 dark:text-green-200',
    },
    communication: {
        label: '親師溝通',
        emoji: '💬',
        color: 'bg-blue-100 text-blue-800',
        darkColor: 'dark:bg-blue-900 dark:text-blue-200',
    },
    reading: {
        label: '閱讀理解',
        emoji: '📖',
        color: 'bg-orange-100 text-orange-800',
        darkColor: 'dark:bg-orange-900 dark:text-orange-200',
    },
    interactive: {
        label: '即時互動',
        emoji: '✨',
        color: 'bg-cyan-100 text-cyan-800',
        darkColor: 'dark:bg-cyan-900 dark:text-cyan-200',
    },
};

/**
 * 取得分類完整標籤 (Emoji + 名稱)
 */
export function getCategoryLabel(category: ToolCategory | 'all'): string {
    const info = categoryInfo[category];
    return `${info.emoji} ${info.label}`;
}

/**
 * 取得分類顏色樣式
 */
export function getCategoryColorClass(category: ToolCategory | 'all'): string {
    const info = categoryInfo[category];
    return `${info.color} ${info.darkColor}`;
}
