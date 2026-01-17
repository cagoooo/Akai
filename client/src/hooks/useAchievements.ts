import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from '@/hooks/use-toast';
import {
    achievementDefinitions,
    defaultUserStats,
    calculateProgress,
    checkAchievementUnlocked,
    type AchievementDefinition,
    type UserStats,
    type EarnedAchievement,
} from '@/lib/achievements';
import type { ToolCategory } from '@/lib/data';

const STATS_KEY = 'akai-user-stats';
const EARNED_KEY = 'akai-earned-achievements';

export function useAchievements() {
    const [stats, setStats] = useState<UserStats>(defaultUserStats);
    const [earnedAchievements, setEarnedAchievements] = useState<EarnedAchievement[]>([]);
    const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);

    // 初始化：從 LocalStorage 載入
    useEffect(() => {
        try {
            const savedStats = localStorage.getItem(STATS_KEY);
            if (savedStats) {
                setStats(JSON.parse(savedStats));
            }

            const savedEarned = localStorage.getItem(EARNED_KEY);
            if (savedEarned) {
                setEarnedAchievements(JSON.parse(savedEarned));
            }

            // 更新連續登入
            updateLoginStreak();
        } catch (e) {
            console.error('Failed to load achievements:', e);
        }
    }, []);

    // 儲存統計數據
    const saveStats = useCallback((newStats: UserStats) => {
        try {
            localStorage.setItem(STATS_KEY, JSON.stringify(newStats));
        } catch (e) {
            console.error('Failed to save stats:', e);
        }
    }, []);

    // 儲存已解鎖成就
    const saveEarned = useCallback((newEarned: EarnedAchievement[]) => {
        try {
            localStorage.setItem(EARNED_KEY, JSON.stringify(newEarned));
        } catch (e) {
            console.error('Failed to save earned achievements:', e);
        }
    }, []);

    // 更新連續登入天數
    const updateLoginStreak = useCallback(() => {
        const today = new Date().toISOString().split('T')[0];

        setStats(prev => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            let newStreak = prev.loginStreak;

            if (prev.lastLoginDate === today) {
                // 今天已登入，不更新
                return prev;
            } else if (prev.lastLoginDate === yesterdayStr) {
                // 昨天有登入，連續 +1
                newStreak = prev.loginStreak + 1;
            } else {
                // 中斷了，重設為 1
                newStreak = 1;
            }

            const newStats = {
                ...prev,
                loginStreak: newStreak,
                lastLoginDate: today,
            };
            saveStats(newStats);
            return newStats;
        });
    }, [saveStats]);

    // 檢查並解鎖成就
    const checkAndUnlockAchievements = useCallback((currentStats: UserStats) => {
        const newlyEarned: EarnedAchievement[] = [];

        achievementDefinitions.forEach(achievement => {
            // 跳過已解鎖的
            if (earnedAchievements.some(e => e.id === achievement.id)) {
                return;
            }

            if (checkAchievementUnlocked(achievement, currentStats)) {
                const earned: EarnedAchievement = {
                    id: achievement.id,
                    earnedAt: new Date().toISOString(),
                };
                newlyEarned.push(earned);

                // 顯示解鎖通知
                toast({
                    title: `🎉 成就解鎖！`,
                    description: `${achievement.icon} ${achievement.name} (+${achievement.points} 點)`,
                    duration: 5000,
                });
            }
        });

        if (newlyEarned.length > 0) {
            const updatedEarned = [...earnedAchievements, ...newlyEarned];
            setEarnedAchievements(updatedEarned);
            saveEarned(updatedEarned);
            setNewlyUnlocked(newlyEarned.map(e => e.id));

            // 計算新增點數
            const newPoints = newlyEarned.reduce((sum, e) => {
                const def = achievementDefinitions.find(a => a.id === e.id);
                return sum + (def?.points || 0);
            }, 0);

            // 更新總點數
            if (newPoints > 0) {
                setStats(prev => {
                    const updatedStats = {
                        ...prev,
                        totalPoints: prev.totalPoints + newPoints,
                    };
                    saveStats(updatedStats);
                    return updatedStats;
                });
            }

            // 3 秒後清除新解鎖標記
            setTimeout(() => setNewlyUnlocked([]), 3000);
        }
    }, [earnedAchievements, saveEarned, saveStats]);

    // 追蹤工具使用
    const trackToolUsage = useCallback((toolId: number, category: ToolCategory) => {
        const hour = new Date().getHours();

        setStats(prev => {
            const newStats = { ...prev };

            // 更新已瀏覽工具列表
            if (!newStats.uniqueToolsVisited.includes(toolId)) {
                newStats.uniqueToolsVisited = [...newStats.uniqueToolsVisited, toolId];
            }

            // 更新分類使用次數
            newStats.categoryUsage = {
                ...newStats.categoryUsage,
                [category]: (newStats.categoryUsage[category] || 0) + 1,
            };

            // 更新時段使用
            if (hour >= 6 && hour < 8) {
                newStats.earlyMorningUsage += 1;
            } else if (hour >= 22 && hour < 24) {
                newStats.lateNightUsage += 1;
            }

            saveStats(newStats);

            // 檢查成就解鎖 (延遲執行避免 React 狀態問題)
            setTimeout(() => checkAndUnlockAchievements(newStats), 100);

            return newStats;
        });
    }, [saveStats, checkAndUnlockAchievements]);

    // 更新收藏數量
    const updateFavoritesCount = useCallback((count: number) => {
        setStats(prev => {
            const newStats = { ...prev, favoritesCount: count };
            saveStats(newStats);
            setTimeout(() => checkAndUnlockAchievements(newStats), 100);
            return newStats;
        });
    }, [saveStats, checkAndUnlockAchievements]);

    // 更新評論數量
    const updateReviewsCount = useCallback((count: number) => {
        setStats(prev => {
            const newStats = { ...prev, reviewsCount: count };
            saveStats(newStats);
            setTimeout(() => checkAndUnlockAchievements(newStats), 100);
            return newStats;
        });
    }, [saveStats, checkAndUnlockAchievements]);

    // 增加評論數
    const incrementReviewsCount = useCallback(() => {
        setStats(prev => {
            const newStats = { ...prev, reviewsCount: prev.reviewsCount + 1 };
            saveStats(newStats);
            setTimeout(() => checkAndUnlockAchievements(newStats), 100);
            return newStats;
        });
    }, [saveStats, checkAndUnlockAchievements]);

    // 計算所有成就的狀態
    const achievementsWithStatus = useMemo(() => {
        return achievementDefinitions.map(achievement => ({
            ...achievement,
            earned: earnedAchievements.some(e => e.id === achievement.id),
            progress: calculateProgress(achievement, stats),
            justUnlocked: newlyUnlocked.includes(achievement.id),
        }));
    }, [stats, earnedAchievements, newlyUnlocked]);

    // 計算統計數據
    const totalEarned = earnedAchievements.length;
    const totalAchievements = achievementDefinitions.length;
    const totalPoints = stats.totalPoints;

    return {
        achievements: achievementsWithStatus,
        stats,
        totalEarned,
        totalAchievements,
        totalPoints,
        trackToolUsage,
        updateFavoritesCount,
        updateReviewsCount,
        incrementReviewsCount,
        isAchievementEarned: (id: string) => earnedAchievements.some(e => e.id === id),
    };
}
