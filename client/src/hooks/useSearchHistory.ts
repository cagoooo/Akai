/**
 * 搜尋歷史 Hook
 * 管理使用者的搜尋歷史記錄
 */

import { useState, useEffect, useCallback } from 'react';

const SEARCH_HISTORY_KEY = 'akai-search-history';
const MAX_HISTORY = 10;

export function useSearchHistory() {
    const [history, setHistory] = useState<string[]>([]);

    // 初始化：從 LocalStorage 載入
    useEffect(() => {
        try {
            const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
            if (saved) {
                setHistory(JSON.parse(saved));
            }
        } catch (e) {
            console.error('Failed to load search history:', e);
        }
    }, []);

    // 儲存到 LocalStorage
    const saveHistory = useCallback((newHistory: string[]) => {
        try {
            localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
        } catch (e) {
            console.error('Failed to save search history:', e);
        }
    }, []);

    // 新增搜尋記錄
    const addToHistory = useCallback((query: string) => {
        const trimmed = query.trim();
        if (!trimmed || trimmed.length < 2) return;

        setHistory(prev => {
            // 移除重複項目並置頂
            const filtered = prev.filter(h => h.toLowerCase() !== trimmed.toLowerCase());
            const updated = [trimmed, ...filtered].slice(0, MAX_HISTORY);
            saveHistory(updated);
            return updated;
        });
    }, [saveHistory]);

    // 移除單一記錄
    const removeFromHistory = useCallback((query: string) => {
        setHistory(prev => {
            const updated = prev.filter(h => h !== query);
            saveHistory(updated);
            return updated;
        });
    }, [saveHistory]);

    // 清除所有歷史
    const clearHistory = useCallback(() => {
        setHistory([]);
        localStorage.removeItem(SEARCH_HISTORY_KEY);
    }, []);

    return {
        history,
        addToHistory,
        removeFromHistory,
        clearHistory,
        hasHistory: history.length > 0,
    };
}
