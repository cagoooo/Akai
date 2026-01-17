/**
 * AI 智慧推薦引擎
 * 基於使用者行為計算工具推薦分數
 */

import type { EducationalTool, ToolCategory } from './data';

// 使用者行為資料介面
export interface UserBehavior {
    recentTools: number[];                      // 最近使用的工具 ID
    favorites: number[];                        // 收藏的工具 ID
    categoryUsage: Record<string, number>;      // 各分類使用次數
    visitedTools: number[];                     // 已瀏覽過的工具 ID
}

// 推薦結果
export interface RecommendedTool extends EducationalTool {
    score: number;
    reason: string;  // 推薦原因
}

/**
 * 計算分類偏好權重
 * 將使用次數正規化為 0-1 之間的權重
 */
export function calculateCategoryPreference(
    categoryUsage: Record<string, number>
): Record<string, number> {
    const total = Object.values(categoryUsage).reduce((sum, count) => sum + count, 0);
    if (total === 0) return {};

    const preference: Record<string, number> = {};
    for (const [category, count] of Object.entries(categoryUsage)) {
        preference[category] = count / total;
    }
    return preference;
}

/**
 * 計算標籤相似度
 * 計算工具標籤與使用者偏好標籤的重疊程度
 */
export function calculateTagSimilarity(
    toolTags: string[] | undefined,
    userTags: string[]
): number {
    if (!toolTags || toolTags.length === 0 || userTags.length === 0) {
        return 0;
    }

    const toolTagSet = new Set(toolTags.map(t => t.toLowerCase()));
    const overlap = userTags.filter(tag => toolTagSet.has(tag.toLowerCase())).length;

    // Jaccard 相似度
    const union = new Set([...toolTags.map(t => t.toLowerCase()), ...userTags.map(t => t.toLowerCase())]);
    return overlap / union.size;
}

/**
 * 正規化熱門度分數
 * 使用 log 縮放避免極端值
 */
export function normalizePopularity(usageCount: number, maxUsage: number): number {
    if (maxUsage === 0) return 0;
    // 使用 log 縮放，加 1 避免 log(0)
    return Math.log(usageCount + 1) / Math.log(maxUsage + 1);
}

/**
 * 從使用者行為中提取偏好標籤
 */
export function extractUserPreferredTags(
    tools: EducationalTool[],
    behavior: UserBehavior
): string[] {
    const tagCounts: Record<string, number> = {};

    // 從最近使用和收藏的工具中提取標籤
    const relevantToolIds = Array.from(new Set([...behavior.recentTools, ...behavior.favorites]));

    for (const toolId of relevantToolIds) {
        const tool = tools.find(t => t.id === toolId);
        if (tool?.tags) {
            for (const tag of tool.tags) {
                tagCounts[tag.toLowerCase()] = (tagCounts[tag.toLowerCase()] || 0) + 1;
            }
        }
    }

    // 取出現次數最高的前 10 個標籤
    return Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([tag]) => tag);
}

/**
 * 計算單一工具的推薦分數
 */
export function calculateRecommendationScore(
    tool: EducationalTool,
    behavior: UserBehavior,
    tools: EducationalTool[],
    toolStats: Record<number, number> = {}  // toolId -> usageCount
): { score: number; reason: string } {
    // 如果已經在最近使用中，降低推薦優先級
    const recentPenalty = behavior.recentTools.includes(tool.id) ? 0.3 : 0;

    // 計算分類偏好
    const categoryPreference = calculateCategoryPreference(behavior.categoryUsage);
    const categoryScore = categoryPreference[tool.category] || 0;

    // 計算標籤相似度
    const userTags = extractUserPreferredTags(tools, behavior);
    const tagScore = calculateTagSimilarity(tool.tags, userTags);

    // 計算熱門度
    const maxUsage = Math.max(...Object.values(toolStats), 1);
    const popularityScore = normalizePopularity(toolStats[tool.id] || 0, maxUsage);

    // 是否為收藏類別中的工具（但尚未收藏）
    const isFavoriteCategory = behavior.favorites.some(favId => {
        const favTool = tools.find(t => t.id === favId);
        return favTool?.category === tool.category;
    });
    const favoriteCategoryBonus = isFavoriteCategory && !behavior.favorites.includes(tool.id) ? 0.1 : 0;

    // 計算綜合分數
    const score =
        categoryScore * 0.4 +           // 分類偏好 40%
        tagScore * 0.3 +                // 標籤相似度 30%
        popularityScore * 0.2 +         // 熱門度 20%
        favoriteCategoryBonus * 0.1 -   // 收藏類別加分 10%
        recentPenalty;                  // 最近使用扣分

    // 決定推薦原因
    let reason = '熱門工具';
    if (categoryScore > 0.3) {
        const categoryNames: Record<string, string> = {
            games: '趣味遊戲',
            utilities: '實用工具',
            teaching: '教學資源',
            language: '語言學習',
            communication: '親師溝通',
            reading: '閱讀理解',
            interactive: '即時互動',
        };
        reason = `您喜歡${categoryNames[tool.category] || tool.category}類工具`;
    } else if (tagScore > 0.2) {
        reason = '與您的興趣相關';
    } else if (isFavoriteCategory) {
        reason = '來自您收藏的類別';
    }

    return { score: Math.max(0, score), reason };
}

/**
 * 產生推薦工具清單
 */
export function generateRecommendations(
    tools: EducationalTool[],
    behavior: UserBehavior,
    toolStats: Record<number, number> = {},
    limit: number = 6
): RecommendedTool[] {
    // 過濾掉已經在最近使用清單中的工具
    const candidateTools = tools.filter(tool =>
        !behavior.recentTools.slice(0, 3).includes(tool.id)  // 排除最近使用的前 3 個
    );

    // 計算每個工具的推薦分數
    const scoredTools = candidateTools.map(tool => {
        const { score, reason } = calculateRecommendationScore(tool, behavior, tools, toolStats);
        return { ...tool, score, reason };
    });

    // 按分數排序並取前 N 個
    return scoredTools
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}

/**
 * 針對新使用者的預設推薦（無行為數據時）
 */
export function getDefaultRecommendations(
    tools: EducationalTool[],
    toolStats: Record<number, number> = {},
    limit: number = 6
): RecommendedTool[] {
    // 依熱門度排序
    const scoredTools = tools.map(tool => ({
        ...tool,
        score: toolStats[tool.id] || 0,
        reason: '熱門工具',
    }));

    return scoredTools
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}
