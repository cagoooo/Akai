import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { categoryInfo } from "@/lib/categoryConstants";
import type { ToolCategory } from "@/lib/data";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
    categories: string[];
    selectedCategory: string | null;
    onCategoryChange: (category: string | null) => void;
    categoryCounts: Record<string, number>;
    showFavorites?: boolean;
    onToggleFavorites?: () => void;
    favoritesCount?: number;
}

// 分類顏色配置 (增強 Vibrant & Neon 風格)
const categoryColorMap: Record<string, { bg: string; text: string; border: string; activeClasses: string }> = {
    all: { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800', activeClasses: 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/40 text-white border-transparent' },
    games: { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800', activeClasses: 'bg-gradient-to-r from-purple-500 to-fuchsia-600 shadow-lg shadow-purple-500/40 text-white border-transparent' },
    utility: { bg: 'bg-green-50 dark:bg-green-950/30', text: 'text-green-700 dark:text-green-400', border: 'border-green-200 dark:border-green-800', activeClasses: 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg shadow-green-500/40 text-white border-transparent' },
    teaching: { bg: 'bg-orange-50 dark:bg-orange-950/30', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800', activeClasses: 'bg-gradient-to-r from-orange-500 to-amber-600 shadow-lg shadow-orange-500/40 text-white border-transparent' },
    language: { bg: 'bg-pink-50 dark:bg-pink-950/30', text: 'text-pink-700 dark:text-pink-400', border: 'border-pink-200 dark:border-pink-800', activeClasses: 'bg-gradient-to-r from-pink-500 to-rose-600 shadow-lg shadow-pink-500/40 text-white border-transparent' },
    communication: { bg: 'bg-cyan-50 dark:bg-cyan-950/30', text: 'text-cyan-700 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-800', activeClasses: 'bg-gradient-to-r from-cyan-500 to-teal-600 shadow-lg shadow-cyan-500/40 text-white border-transparent' },
    interactive: { bg: 'bg-yellow-50 dark:bg-yellow-950/30', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800', activeClasses: 'bg-gradient-to-r from-yellow-400 to-amber-500 shadow-lg shadow-yellow-500/40 text-white border-transparent' },
    reading: { bg: 'bg-indigo-50 dark:bg-indigo-950/30', text: 'text-indigo-700 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800', activeClasses: 'bg-gradient-to-r from-indigo-500 to-blue-600 shadow-lg shadow-indigo-500/40 text-white border-transparent' },
};

export function CategoryFilter({
    categories,
    selectedCategory,
    onCategoryChange,
    categoryCounts,
    showFavorites = false,
    onToggleFavorites,
    favoritesCount = 0,
}: CategoryFilterProps) {
    const totalCount = Object.values(categoryCounts).reduce((a, b) => a + b, 0);
    const allInfo = categoryInfo.all;
    const allColors = categoryColorMap.all;

    const handleCategoryClick = (category: string | null) => {
        onCategoryChange(category);
        if (showFavorites && onToggleFavorites) onToggleFavorites();

        // 自動跳轉到工具卡片區域
        setTimeout(() => {
            const toolsGrid = document.querySelector('[data-tour="tools-grid"]');
            if (toolsGrid) {
                toolsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    const handleFavoritesClick = () => {
        if (onToggleFavorites) {
            onToggleFavorites();
            // 自動跳轉到工具卡片區域
            setTimeout(() => {
                const toolsGrid = document.querySelector('[data-tour="tools-grid"]');
                if (toolsGrid) {
                    toolsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    };

    return (
        <div className="flex flex-wrap gap-2 sm:gap-2.5">
            {/* 全部按鈕 */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => handleCategoryClick(null)}
                aria-label="顯示全部工具"
                className={cn(
                    "gap-1.5 sm:gap-2 text-sm sm:text-base font-semibold border-2 rounded-full transition-all duration-300 hover:scale-105 px-3 py-1.5 sm:px-4 sm:py-2",
                    selectedCategory === null && !showFavorites
                        ? allColors.activeClasses
                        : `${allColors.bg} ${allColors.text} ${allColors.border} hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md`
                )}
            >
                <span>{allInfo.emoji}</span>
                <span>{allInfo.label}</span>
                <Badge
                    variant="secondary"
                    className={cn(
                        "ml-1 text-xs sm:text-sm px-2 font-bold transition-colors",
                        selectedCategory === null && !showFavorites ? "bg-white/20 text-white" : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                    )}
                >
                    {totalCount}
                </Badge>
            </Button>

            {/* 我的收藏按鈕 */}
            {onToggleFavorites && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFavoritesClick}
                    aria-label="顯示我的收藏工具"
                    className={cn(
                        "gap-1.5 sm:gap-2 text-sm sm:text-base font-semibold border-2 rounded-full transition-all duration-200 hover:scale-105 px-3 py-1.5 sm:px-4 sm:py-2",
                        showFavorites
                            ? "bg-red-600 text-white border-transparent shadow-md"
                            : "bg-red-50 text-red-700 border-red-200 hover:bg-red-600 hover:text-white"
                    )}
                >
                    <span>❤️</span>
                    <span>我的收藏</span>
                    {favoritesCount > 0 && (
                        <Badge
                            variant="secondary"
                            className={cn(
                                "ml-1 text-xs sm:text-sm px-2 font-bold",
                                showFavorites ? "bg-white/20 text-white" : "bg-red-100 text-red-700"
                            )}
                        >
                            {favoritesCount}
                        </Badge>
                    )}
                </Button>
            )}

            {/* 各分類按鈕 */}
            {categories.map((category) => {
                const info = categoryInfo[category as ToolCategory] || {
                    label: category,
                    emoji: '📌',
                };
                const count = categoryCounts[category] || 0;
                const colors = categoryColorMap[category] || categoryColorMap.all;
                const isActive = selectedCategory === category && !showFavorites;

                return (
                    <Button
                        key={category}
                        variant="outline"
                        size="sm"
                        onClick={() => handleCategoryClick(category)}
                        aria-label={`篩選分類: ${info.label}`}
                        className={cn(
                            "gap-1.5 sm:gap-2 text-sm sm:text-base font-semibold border-2 rounded-full transition-all duration-300 hover:scale-105 px-3 py-1.5 sm:px-4 sm:py-2",
                            isActive
                                ? colors.activeClasses
                                : `${colors.bg} ${colors.text} ${colors.border} hover:border-${colors.text.split('-')[1]}-400 dark:hover:border-${colors.text.split('-')[1]}-500 hover:shadow-md`
                        )}
                    >
                        <span>{info.emoji}</span>
                        <span>{info.label}</span>
                        <Badge
                            variant="secondary"
                            className={cn(
                                "ml-1 text-xs sm:text-sm px-2 font-bold transition-colors",
                                isActive ? "bg-white/20 text-white" : `${colors.bg.replace('/30', '')} ${colors.text} dark:bg-${colors.text.split('-')[1]}-900/50`
                            )}
                        >
                            {count}
                        </Badge>
                    </Button>
                );
            })}
        </div>
    );
}
