/**
 * 熱門標籤快速選擇元件
 * 顯示熱門標籤供快速篩選
 */

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, ChevronDown, ChevronUp, X } from 'lucide-react';
import { tools } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TagQuickSelectProps {
    selectedTags: string[];
    onTagSelect: (tag: string) => void;
    onClearTags: () => void;
    className?: string;
}

export function TagQuickSelect({
    selectedTags,
    onTagSelect,
    onClearTags,
    className,
}: TagQuickSelectProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // 計算所有標籤及其出現次數
    const tagStats = useMemo(() => {
        const counts: Record<string, number> = {};
        tools.forEach(tool => {
            tool.tags?.forEach(tag => {
                counts[tag] = (counts[tag] || 0) + 1;
            });
        });

        // 按出現次數排序
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .map(([tag, count]) => ({ tag, count }));
    }, []);

    // 顯示的標籤數量
    const displayTags = isExpanded ? tagStats : tagStats.slice(0, 12);

    return (
        <div className={cn("space-y-2", className)}>
            {/* 標題列 */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Tag className="w-4 h-4" />
                    <span>熱門標籤</span>
                    {selectedTags.length > 0 && (
                        <span className="px-1.5 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
                            {selectedTags.length}
                        </span>
                    )}
                </div>
                {selectedTags.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearTags}
                        className="h-6 text-xs text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-3 h-3 mr-1" />
                        清除
                    </Button>
                )}
            </div>

            {/* 標籤列表 */}
            <div className="flex flex-wrap gap-1.5">
                {displayTags.map(({ tag, count }, index) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                        <motion.button
                            key={tag}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.02 }}
                            onClick={() => onTagSelect(tag)}
                            className={cn(
                                "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                                "border hover:shadow-sm",
                                isSelected
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
                            )}
                        >
                            <span>{tag}</span>
                            <span
                                className={cn(
                                    "text-[10px] opacity-60",
                                    isSelected && "opacity-80"
                                )}
                            >
                                ({count})
                            </span>
                        </motion.button>
                    );
                })}
            </div>

            {/* 展開/收合按鈕 */}
            {tagStats.length > 12 && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full h-7 text-xs text-muted-foreground hover:text-foreground"
                >
                    {isExpanded ? (
                        <>
                            <ChevronUp className="w-3 h-3 mr-1" />
                            收合標籤
                        </>
                    ) : (
                        <>
                            <ChevronDown className="w-3 h-3 mr-1" />
                            顯示更多 ({tagStats.length - 12} 個)
                        </>
                    )}
                </Button>
            )}
        </div>
    );
}
