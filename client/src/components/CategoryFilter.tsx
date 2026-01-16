import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { categoryInfo, getCategoryColorClass } from "@/lib/categoryConstants";
import type { ToolCategory } from "@/lib/data";

interface CategoryFilterProps {
    categories: string[];
    selectedCategory: string | null;
    onCategoryChange: (category: string | null) => void;
    categoryCounts: Record<string, number>;
    showFavorites?: boolean;
    onToggleFavorites?: () => void;
    favoritesCount?: number;
}

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

    return (
        <div className="flex flex-wrap gap-2">
            {/* 全部按鈕 */}
            <Button
                variant={selectedCategory === null && !showFavorites ? "default" : "outline"}
                size="sm"
                onClick={() => {
                    onCategoryChange(null);
                    if (showFavorites && onToggleFavorites) onToggleFavorites();
                }}
                className="gap-1.5 text-sm"
            >
                <span>{allInfo.emoji}</span>
                <span>{allInfo.label}</span>
                <Badge variant="secondary" className="ml-1 text-xs px-1.5">
                    {totalCount}
                </Badge>
            </Button>

            {/* 我的收藏按鈕 */}
            {onToggleFavorites && (
                <Button
                    variant={showFavorites ? "default" : "outline"}
                    size="sm"
                    onClick={onToggleFavorites}
                    className={`gap-1.5 text-sm ${showFavorites ? 'bg-red-500 hover:bg-red-600' : ''}`}
                >
                    <span>❤️</span>
                    <span>我的收藏</span>
                    {favoritesCount > 0 && (
                        <Badge variant="secondary" className="ml-1 text-xs px-1.5">
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
                    color: 'bg-gray-100 text-gray-800',
                    darkColor: 'dark:bg-gray-800 dark:text-gray-200'
                };
                const count = categoryCounts[category] || 0;

                return (
                    <Button
                        key={category}
                        variant={selectedCategory === category && !showFavorites ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                            onCategoryChange(category);
                            if (showFavorites && onToggleFavorites) onToggleFavorites();
                        }}
                        className="gap-1.5 text-sm"
                    >
                        <span>{info.emoji}</span>
                        <span>{info.label}</span>
                        <Badge variant="secondary" className="ml-1 text-xs px-1.5">
                            {count}
                        </Badge>
                    </Button>
                );
            })}
        </div>
    );
}
