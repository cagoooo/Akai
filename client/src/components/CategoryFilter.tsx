import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// 分類顯示名稱與圖示
const categoryLabels: Record<string, { label: string; emoji: string }> = {
    all: { label: '全部', emoji: '📚' },
    games: { label: '遊戲', emoji: '🎮' },
    utilities: { label: '工具', emoji: '🛠️' },
    teaching: { label: '教學', emoji: '📚' },
    language: { label: '語言', emoji: '🗣️' },
    communication: { label: '溝通', emoji: '💬' },
    reading: { label: '閱讀', emoji: '📖' },
    interactive: { label: '互動', emoji: '✨' },
};

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
                className="gap-1"
            >
                <span>{categoryLabels.all.emoji}</span>
                <span>{categoryLabels.all.label}</span>
                <Badge variant="secondary" className="ml-1 text-xs">
                    {totalCount}
                </Badge>
            </Button>

            {/* 我的收藏按鈕 */}
            {onToggleFavorites && (
                <Button
                    variant={showFavorites ? "default" : "outline"}
                    size="sm"
                    onClick={onToggleFavorites}
                    className={`gap-1 ${showFavorites ? 'bg-red-500 hover:bg-red-600' : ''}`}
                >
                    <span>❤️</span>
                    <span>收藏</span>
                    {favoritesCount > 0 && (
                        <Badge variant="secondary" className="ml-1 text-xs">
                            {favoritesCount}
                        </Badge>
                    )}
                </Button>
            )}

            {/* 各分類按鈕 */}
            {categories.map((category) => {
                const info = categoryLabels[category] || { label: category, emoji: '📌' };
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
                        className="gap-1"
                    >
                        <span>{info.emoji}</span>
                        <span>{info.label}</span>
                        <Badge variant="secondary" className="ml-1 text-xs">
                            {count}
                        </Badge>
                    </Button>
                );
            })}
        </div>
    );
}
