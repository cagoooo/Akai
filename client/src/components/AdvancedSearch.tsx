/**
 * 進階搜尋區塊
 * 整合搜尋歷史、排序選項和標籤快選
 */

import { useState, forwardRef, useEffect, useRef } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { Search, X, Sparkles, Clock, Trash2, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { useSortOptions, type SortOption, sortOptions } from '@/hooks/useSortOptions';
import { TagQuickSelect } from './TagQuickSelect';
import { cn } from '@/lib/utils';

interface AdvancedSearchProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    resultCount: number;
    totalCount: number;
    selectedTags: string[];
    onTagSelect: (tag: string) => void;
    onClearTags: () => void;
    currentSort: SortOption;
    onSortChange: (sort: SortOption) => void;
}

export const AdvancedSearch = forwardRef<HTMLInputElement, AdvancedSearchProps>(
    function AdvancedSearch(
        {
            searchQuery,
            onSearchChange,
            resultCount,
            totalCount,
            selectedTags,
            onTagSelect,
            onClearTags,
            currentSort,
            onSortChange,
        },
        ref
    ) {
        const [isFocused, setIsFocused] = useState(false);
        const { history, addToHistory, removeFromHistory, clearHistory, hasHistory } = useSearchHistory();
        const containerRef = useRef<HTMLDivElement>(null);

        // 點擊外部關閉
        useEffect(() => {
            const handleClickOutside = (e: MouseEvent) => {
                if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                    setIsFocused(false);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);

        // 搜尋提交
        const handleSubmit = () => {
            if (searchQuery.trim()) {
                addToHistory(searchQuery.trim());
            }
        };

        // Enter 鍵提交
        const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === 'Enter') {
                handleSubmit();
                setIsFocused(false);
            }
            if (e.key === 'Escape') {
                setIsFocused(false);
            }
        };

        // 選擇歷史記錄
        const handleHistorySelect = (query: string) => {
            onSearchChange(query);
            setIsFocused(false);
        };

        return (
            <div className="space-y-4">
                {/* 搜尋框區塊 */}
                <div ref={containerRef} className="relative">
                    <div className="relative group">
                        {/* 搜尋圖標 */}
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                            <Search className="h-5 w-5 text-orange-500" />
                        </div>

                        {/* 輸入框 */}
                        <Input
                            ref={ref}
                            type="text"
                            placeholder="搜尋工具名稱、描述或標籤..."
                            aria-label="搜尋教育工具"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onKeyDown={handleKeyDown}
                            className="pl-11 pr-10 h-12 text-base font-medium bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 border-orange-200 dark:border-orange-800 rounded-xl shadow-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 dark:focus:ring-orange-500/30 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all duration-300"
                        />

                        {/* 清除按鈕 */}
                        {searchQuery && (
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label="清除搜尋文字"
                                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-orange-500 hover:bg-orange-100 rounded-lg"
                                onClick={() => onSearchChange('')}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {/* 搜尋歷史下拉 */}
                    <AnimatePresence>
                        {isFocused && hasHistory && !searchQuery && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
                            >
                                <div className="p-2">
                                    <div className="flex items-center justify-between px-2 py-1.5 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            搜尋歷史
                                        </span>
                                        <button
                                            onClick={clearHistory}
                                            aria-label="清除所有搜尋歷史"
                                            className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                            清除
                                        </button>
                                    </div>
                                    <div className="space-y-0.5">
                                        {history.slice(0, 5).map((query) => (
                                            <div
                                                key={query}
                                                className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-gray-50 group cursor-pointer"
                                                onClick={() => handleHistorySelect(query)}
                                            >
                                                <span className="text-sm text-gray-700">{query}</span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeFromHistory(query);
                                                    }}
                                                    aria-label={`刪除歷史記錄: ${query}`}
                                                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 搜尋結果與排序 */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    {/* 搜尋結果提示 */}
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-orange-500" />
                        <p className="text-sm text-gray-700">
                            {searchQuery || selectedTags.length > 0 ? (
                                <>
                                    找到 <span className="font-bold text-orange-800">{resultCount}</span> 個工具
                                    {resultCount < totalCount && (
                                        <span className="text-gray-700 ml-1">（共 {totalCount} 個）</span>
                                    )}
                                </>
                            ) : (
                                <span className="text-gray-700">共 {totalCount} 個工具</span>
                            )}
                        </p>
                    </div>

                    {/* 排序選項 (彈性雙排，視窗寬度足夠才單排) */}
                    <div className="w-full 2xl:w-auto bg-gray-200 rounded-xl p-1 shrink-0">
                        <div className="grid grid-cols-2 2xl:flex 2xl:items-center gap-1.5 w-full">
                            <div className="hidden 2xl:flex items-center justify-center pl-2 shrink-0">
                                <ArrowUpDown className="w-5 h-5 text-gray-700" />
                            </div>
                            {sortOptions.map((opt) => (
                                <button
                                    key={opt.option}
                                    onClick={() => {
                                        onSortChange(opt.option);
                                        // 自動跳轉到工具卡片區域
                                        setTimeout(() => {
                                            const toolsGrid = document.querySelector('[data-tour="tools-grid"]');
                                            if (toolsGrid) {
                                                toolsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                            }
                                        }, 100);
                                    }}
                                    aria-label={`改為排序方式: ${opt.label}`}
                                    className={cn(
                                        "px-2 sm:px-4 py-2 text-sm sm:text-base font-medium rounded-lg transition-all duration-300 flex items-center justify-center whitespace-nowrap",
                                        currentSort === opt.option
                                            ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/30"
                                            : "text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-white/50 dark:hover:bg-gray-800/50"
                                    )}
                                >
                                    <span className={cn("mr-1 sm:mr-1.5", currentSort === opt.option ? "text-white" : "")}>{opt.icon}</span>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 標籤快選 - 暫時隱藏以簡化版面
                <TagQuickSelect
                    selectedTags={selectedTags}
                    onTagSelect={onTagSelect}
                    onClearTags={onClearTags}
                />
                */}
            </div>
        );
    }
);
