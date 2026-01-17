import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Sparkles } from "lucide-react";
import { forwardRef } from "react";

interface SearchBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    resultCount: number;
    totalCount: number;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
    function SearchBar(
        {
            searchQuery,
            onSearchChange,
            resultCount,
            totalCount,
        },
        ref
    ) {
        return (
            <div className="space-y-2">
                <div className="relative group">
                    {/* 搜尋圖標 */}
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                        <Search className="h-5 w-5 text-orange-500" />
                    </div>

                    {/* 輸入框 */}
                    <Input
                        ref={ref}
                        type="text"
                        placeholder="搜尋工具名稱或描述..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-11 pr-10 h-12 text-base font-medium bg-white border-2 border-orange-200 rounded-xl shadow-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-200 placeholder:text-gray-400 transition-all duration-200"
                    />

                    {/* 清除按鈕 */}
                    {searchQuery && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-orange-500 hover:bg-orange-100 rounded-lg"
                            onClick={() => onSearchChange('')}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* 搜尋結果提示 */}
                {searchQuery && (
                    <div className="flex items-center gap-2 px-1">
                        <Sparkles className="w-4 h-4 text-orange-500" />
                        <p className="text-sm text-gray-600">
                            找到 <span className="font-bold text-orange-600">{resultCount}</span> 個工具
                            {resultCount < totalCount && (
                                <span className="text-gray-400 ml-1">（共 {totalCount} 個）</span>
                            )}
                        </p>
                    </div>
                )}
            </div>
        );
    }
);
