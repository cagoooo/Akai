import { useState, useEffect, useCallback } from 'react';

const RECENT_KEY = 'akai-recent-tools';
const MAX_RECENT = 5;

export function useRecentTools() {
    const [recentIds, setRecentIds] = useState<number[]>([]);

    // 初始化時從 LocalStorage 讀取
    useEffect(() => {
        try {
            const stored = localStorage.getItem(RECENT_KEY);
            if (stored) {
                setRecentIds(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Failed to load recent tools:', e);
        }
    }, []);

    // 儲存到 LocalStorage
    const saveRecent = useCallback((newRecent: number[]) => {
        try {
            localStorage.setItem(RECENT_KEY, JSON.stringify(newRecent));
        } catch (e) {
            console.error('Failed to save recent tools:', e);
        }
    }, []);

    // 新增到最近使用
    const addToRecent = useCallback((toolId: number) => {
        setRecentIds(prev => {
            // 移除已存在的，加到最前面
            const filtered = prev.filter(id => id !== toolId);
            const newRecent = [toolId, ...filtered].slice(0, MAX_RECENT);
            saveRecent(newRecent);
            return newRecent;
        });
    }, [saveRecent]);

    // 清除歷史
    const clearRecent = useCallback(() => {
        setRecentIds([]);
        try {
            localStorage.removeItem(RECENT_KEY);
        } catch (e) {
            console.error('Failed to clear recent tools:', e);
        }
    }, []);

    return {
        recentIds,
        addToRecent,
        clearRecent,
        hasRecent: recentIds.length > 0,
    };
}
