/**
 * 評論排序 Hook
 * 管理評論的排序方式
 */

import { useState, useCallback, useMemo } from 'react';
import type { Review } from '@/lib/reviewService';

export type ReviewSortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'mostLiked';

interface SortConfig {
    value: ReviewSortOption;
    label: string;
    icon: string;
}

export const reviewSortOptions: SortConfig[] = [
    { value: 'newest', label: '最新', icon: '🕒' },
    { value: 'oldest', label: '最舊', icon: '📅' },
    { value: 'highest', label: '最高分', icon: '⭐' },
    { value: 'lowest', label: '最低分', icon: '📊' },
    { value: 'mostLiked', label: '最多讚', icon: '👍' },
];

export function useReviewSort() {
    const [sortOption, setSortOption] = useState<ReviewSortOption>('newest');

    // 排序評論
    const sortReviews = useCallback((reviews: Review[]): Review[] => {
        if (!reviews || reviews.length === 0) return reviews;

        const sorted = [...reviews];

        switch (sortOption) {
            case 'newest':
                return sorted.sort((a, b) => {
                    const dateA = (a.createdAt as any)?.toDate?.() || new Date(a.createdAt as any);
                    const dateB = (b.createdAt as any)?.toDate?.() || new Date(b.createdAt as any);
                    return dateB.getTime() - dateA.getTime();
                });
            case 'oldest':
                return sorted.sort((a, b) => {
                    const dateA = (a.createdAt as any)?.toDate?.() || new Date(a.createdAt as any);
                    const dateB = (b.createdAt as any)?.toDate?.() || new Date(b.createdAt as any);
                    return dateA.getTime() - dateB.getTime();
                });
            case 'highest':
                return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            case 'lowest':
                return sorted.sort((a, b) => (a.rating || 0) - (b.rating || 0));
            case 'mostLiked':
                return sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
            default:
                return sorted;
        }
    }, [sortOption]);

    return {
        sortOption,
        setSortOption,
        sortReviews,
        sortOptions: reviewSortOptions,
    };
}
