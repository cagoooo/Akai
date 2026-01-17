// 成就系統定義
// Achievement System Definitions

export interface AchievementDefinition {
    id: string;
    name: string;
    description: string;
    icon: string;       // Emoji 圖示
    category: 'time' | 'usage' | 'social' | 'collection' | 'special';
    points: number;
    condition: {
        type: 'time_range' | 'category_usage' | 'unique_tools' | 'favorites' | 'reviews' | 'streak' | 'total_points';
        target: number;
        category?: string;   // 針對 category_usage 使用
        startHour?: number;  // 針對 time_range 使用
        endHour?: number;    // 針對 time_range 使用
    };
}

export interface UserStats {
    uniqueToolsVisited: number[];      // 已瀏覽的工具 ID 列表
    categoryUsage: Record<string, number>;  // 各分類使用次數
    favoritesCount: number;
    reviewsCount: number;
    loginStreak: number;               // 連續登入天數
    lastLoginDate: string;             // 最後登入日期 (YYYY-MM-DD)
    totalPoints: number;               // 累積點數
    earlyMorningUsage: number;         // 早上 6-8 點使用次數
    lateNightUsage: number;            // 晚上 22-24 點使用次數
}

export interface EarnedAchievement {
    id: string;
    earnedAt: string;  // ISO 日期
}

// 10 個成就定義
export const achievementDefinitions: AchievementDefinition[] = [
    {
        id: 'early_bird',
        name: '早起的鳥兒',
        description: '在早上 6-8 點使用工具',
        icon: '🌅',
        category: 'time',
        points: 10,
        condition: {
            type: 'time_range',
            target: 1,
            startHour: 6,
            endHour: 8,
        },
    },
    {
        id: 'night_owl',
        name: '夜貓子',
        description: '在晚上 22-24 點使用工具',
        icon: '🌙',
        category: 'time',
        points: 10,
        condition: {
            type: 'time_range',
            target: 1,
            startHour: 22,
            endHour: 24,
        },
    },
    {
        id: 'knowledge_sponge',
        name: '知識海綿',
        description: '使用教學類工具 20 次',
        icon: '📚',
        category: 'usage',
        points: 25,
        condition: {
            type: 'category_usage',
            target: 20,
            category: 'teaching',
        },
    },
    {
        id: 'game_master',
        name: '遊戲達人',
        description: '使用遊戲類工具 30 次',
        icon: '🎮',
        category: 'usage',
        points: 25,
        condition: {
            type: 'category_usage',
            target: 30,
            category: 'games',
        },
    },
    {
        id: 'reviewer',
        name: '評論家',
        description: '發表 5 則評論',
        icon: '💬',
        category: 'social',
        points: 25,
        condition: {
            type: 'reviews',
            target: 5,
        },
    },
    {
        id: 'collector',
        name: '收藏家',
        description: '收藏超過 10 個工具',
        icon: '⭐',
        category: 'collection',
        points: 15,
        condition: {
            type: 'favorites',
            target: 10,
        },
    },
    {
        id: 'explorer',
        name: '探索者',
        description: '瀏覽超過 20 個不同的工具',
        icon: '🔍',
        category: 'collection',
        points: 15,
        condition: {
            type: 'unique_tools',
            target: 20,
        },
    },
    {
        id: 'perfectionist',
        name: '完美主義者',
        description: '瀏覽全部 43 個工具',
        icon: '🏆',
        category: 'collection',
        points: 100,
        condition: {
            type: 'unique_tools',
            target: 43,
        },
    },
    {
        id: 'streak_master',
        name: '連續登入',
        description: '連續 7 天使用平台',
        icon: '🔥',
        category: 'time',
        points: 50,
        condition: {
            type: 'streak',
            target: 7,
        },
    },
    {
        id: 'platinum_member',
        name: '白金會員',
        description: '累積 500 點成就點數',
        icon: '💎',
        category: 'special',
        points: 0,  // 特殊成就，不額外加分
        condition: {
            type: 'total_points',
            target: 500,
        },
    },
];

// 預設使用者統計
export const defaultUserStats: UserStats = {
    uniqueToolsVisited: [],
    categoryUsage: {},
    favoritesCount: 0,
    reviewsCount: 0,
    loginStreak: 0,
    lastLoginDate: '',
    totalPoints: 0,
    earlyMorningUsage: 0,
    lateNightUsage: 0,
};

// 計算成就進度百分比
export function calculateProgress(
    achievement: AchievementDefinition,
    stats: UserStats
): number {
    const { condition } = achievement;
    let current = 0;
    const target = condition.target;

    switch (condition.type) {
        case 'time_range':
            if (condition.startHour === 6) {
                current = stats.earlyMorningUsage;
            } else if (condition.startHour === 22) {
                current = stats.lateNightUsage;
            }
            break;
        case 'category_usage':
            current = stats.categoryUsage[condition.category || ''] || 0;
            break;
        case 'unique_tools':
            current = stats.uniqueToolsVisited.length;
            break;
        case 'favorites':
            current = stats.favoritesCount;
            break;
        case 'reviews':
            current = stats.reviewsCount;
            break;
        case 'streak':
            current = stats.loginStreak;
            break;
        case 'total_points':
            current = stats.totalPoints;
            break;
    }

    return Math.min(100, Math.round((current / target) * 100));
}

// 檢查成就是否解鎖
export function checkAchievementUnlocked(
    achievement: AchievementDefinition,
    stats: UserStats
): boolean {
    return calculateProgress(achievement, stats) >= 100;
}
