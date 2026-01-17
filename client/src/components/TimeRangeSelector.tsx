/**
 * 時間範圍選擇器元件
 * 用於統計儀表板的時間篩選
 */

import { cn } from '@/lib/utils';
import { Calendar, Clock } from 'lucide-react';

export type TimeRange = '7d' | '30d' | '90d' | 'all';

interface TimeRangeOption {
    value: TimeRange;
    label: string;
    days?: number;
}

export const timeRangeOptions: TimeRangeOption[] = [
    { value: '7d', label: '7 天', days: 7 },
    { value: '30d', label: '30 天', days: 30 },
    { value: '90d', label: '90 天', days: 90 },
    { value: 'all', label: '全部' },
];

interface TimeRangeSelectorProps {
    value: TimeRange;
    onChange: (value: TimeRange) => void;
    className?: string;
}

export function TimeRangeSelector({
    value,
    onChange,
    className,
}: TimeRangeSelectorProps) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">時間範圍</span>
            </div>
            <div className="flex items-center bg-muted rounded-lg p-0.5">
                {timeRangeOptions.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => onChange(option.value)}
                        className={cn(
                            "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                            value === option.value
                                ? "bg-white text-primary shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

/**
 * 根據時間範圍過濾數據
 */
export function filterDataByTimeRange<T extends { date: string }>(
    data: T[],
    range: TimeRange
): T[] {
    if (range === 'all') return data;

    const days = timeRangeOptions.find(o => o.value === range)?.days || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return data.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= cutoffDate;
    });
}

/**
 * 根據時間範圍過濾日期鍵值對數據
 */
export function filterDailyDataByTimeRange(
    dailyData: Record<string, number>,
    range: TimeRange
): Record<string, number> {
    if (range === 'all') return dailyData;

    const days = timeRangeOptions.find(o => o.value === range)?.days || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const filtered: Record<string, number> = {};
    for (const [date, value] of Object.entries(dailyData)) {
        const itemDate = new Date(date);
        if (itemDate >= cutoffDate) {
            filtered[date] = value;
        }
    }

    return filtered;
}
