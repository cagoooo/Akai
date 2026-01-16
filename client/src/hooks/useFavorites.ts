import { useState, useEffect, useCallback } from 'react';

const FAVORITES_KEY = 'akai-favorites';

export function useFavorites() {
    const [favorites, setFavorites] = useState<number[]>([]);

    // 初始化時從 LocalStorage 讀取
    useEffect(() => {
        try {
            const stored = localStorage.getItem(FAVORITES_KEY);
            if (stored) {
                setFavorites(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Failed to load favorites:', e);
        }
    }, []);

    // 儲存到 LocalStorage
    const saveFavorites = useCallback((newFavorites: number[]) => {
        try {
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
        } catch (e) {
            console.error('Failed to save favorites:', e);
        }
    }, []);

    // 切換收藏狀態
    const toggleFavorite = useCallback((toolId: number) => {
        setFavorites(prev => {
            const newFavorites = prev.includes(toolId)
                ? prev.filter(id => id !== toolId)
                : [...prev, toolId];
            saveFavorites(newFavorites);
            return newFavorites;
        });
    }, [saveFavorites]);

    // 檢查是否已收藏
    const isFavorite = useCallback((toolId: number) => {
        return favorites.includes(toolId);
    }, [favorites]);

    return {
        favorites,
        toggleFavorite,
        isFavorite,
        favoritesCount: favorites.length,
    };
}
