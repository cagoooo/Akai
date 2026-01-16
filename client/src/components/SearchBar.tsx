import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface SearchBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    resultCount: number;
    totalCount: number;
}

export function SearchBar({
    searchQuery,
    onSearchChange,
    resultCount,
    totalCount,
}: SearchBarProps) {
    return (
        <div className="relative">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="搜尋工具名稱或描述..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10 pr-10"
                />
                {searchQuery && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => onSearchChange('')}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
            {searchQuery && (
                <p className="text-sm text-muted-foreground mt-2">
                    找到 <span className="font-semibold text-primary">{resultCount}</span> 個工具
                    {resultCount < totalCount && (
                        <span className="text-xs ml-1">（共 {totalCount} 個）</span>
                    )}
                </p>
            )}
        </div>
    );
}
