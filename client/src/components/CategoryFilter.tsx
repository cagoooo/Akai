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

// 分類顏色配置
const categoryColorMap: Record<string, { bg: string; text: string; border: string; activeBg: string }> = {
    all: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', activeBg: 'bg-blue-600' },
    games: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', activeBg: 'bg-purple-600' },
    utility: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', activeBg: 'bg-green-600' },
    teaching: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', activeBg: 'bg-orange-600' },
    language: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', activeBg: 'bg-pink-600' },
    communication: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', activeBg: 'bg-cyan-600' },
    interactive: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', activeBg: 'bg-yellow-600' },
    reading: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', activeBg: 'bg-indigo-600' },
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

    return (
        <div className="flex flex-wrap gap-2 sm:gap-2.5">
            {/* 全部按鈕 */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => handleCategoryClick(null)}
                className={cn(
                    "gap-1.5 sm:gap-2 text-sm sm:text-base font-semibold border-2 rounded-full transition-all duration-200 hover:scale-105 px-3 py-1.5 sm:px-4 sm:py-2",
                    selectedCategory === null && !showFavorites
                        ? `${allColors.activeBg} text-white border-transparent shadow-md`
                        : `${allColors.bg} ${allColors.text} ${allColors.border} hover:${allColors.activeBg} hover:text-white`
                )}
            >
                <span>{allInfo.emoji}</span>
                <span>{allInfo.label}</span>
                <Badge
                    variant="secondary"
                    className={cn(
                        "ml-1 text-xs sm:text-sm px-2 font-bold",
                        selectedCategory === null && !showFavorites ? "bg-white/20 text-white" : "bg-blue-100 text-blue-700"
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
                    onClick={onToggleFavorites}
                    className={cn(
                        "gap-1.5 sm:gap-2 text-sm sm:text-base font-semibold border-2 rounded-full transition-all duration-200 hover:scale-105 px-3 py-1.5 sm:px-4 sm:py-2",
                        showFavorites
                            ? "bg-red-500 text-white border-transparent shadow-md"
                            : "bg-red-50 text-red-600 border-red-200 hover:bg-red-500 hover:text-white"
                    )}
                >
                    <span>❤️</span>
                    <span>我的收藏</span>
                    {favoritesCount > 0 && (
                        <Badge
                            variant="secondary"
                            className={cn(
                                "ml-1 text-xs sm:text-sm px-2 font-bold",
                                showFavorites ? "bg-white/20 text-white" : "bg-red-100 text-red-600"
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
                        className={cn(
                            "gap-1.5 sm:gap-2 text-sm sm:text-base font-semibold border-2 rounded-full transition-all duration-200 hover:scale-105 px-3 py-1.5 sm:px-4 sm:py-2",
                            isActive
                                ? `${colors.activeBg} text-white border-transparent shadow-md`
                                : `${colors.bg} ${colors.text} ${colors.border}`
                        )}
                    >
                        <span>{info.emoji}</span>
                        <span>{info.label}</span>
                        <Badge
                            variant="secondary"
                            className={cn(
                                "ml-1 text-xs sm:text-sm px-2 font-bold",
                                isActive ? "bg-white/20 text-white" : `${colors.bg} ${colors.text}`
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
