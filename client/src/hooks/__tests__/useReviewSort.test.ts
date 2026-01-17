/**
 * useReviewSort Hook 單元測試
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReviewSort } from '../useReviewSort';
import type { Review } from '@/lib/reviewService';

// Mock reviews data
const mockReviews: Review[] = [
    {
        id: '1',
        toolId: 1,
        userId: 'user1',
        userName: 'User 1',
        rating: 5,
        comment: 'Great tool!',
        likes: 10,
        likedBy: [],
        createdAt: { toDate: () => new Date('2024-01-15') } as any,
    },
    {
        id: '2',
        toolId: 1,
        userId: 'user2',
        userName: 'User 2',
        rating: 3,
        comment: 'Okay tool',
        likes: 5,
        likedBy: [],
        createdAt: { toDate: () => new Date('2024-01-10') } as any,
    },
    {
        id: '3',
        toolId: 1,
        userId: 'user3',
        userName: 'User 3',
        rating: 4,
        comment: 'Good tool',
        likes: 15,
        likedBy: [],
        createdAt: { toDate: () => new Date('2024-01-20') } as any,
    },
];

describe('useReviewSort', () => {
    it('should initialize with newest as default sort', () => {
        const { result } = renderHook(() => useReviewSort());
        expect(result.current.sortOption).toBe('newest');
    });

    it('should change sort option', () => {
        const { result } = renderHook(() => useReviewSort());

        act(() => {
            result.current.setSortOption('highest');
        });

        expect(result.current.sortOption).toBe('highest');
    });

    it('should sort by newest', () => {
        const { result } = renderHook(() => useReviewSort());

        const sorted = result.current.sortReviews(mockReviews);

        // Review 3 (Jan 20) should be first
        expect(sorted[0].id).toBe('3');
    });

    it('should sort by oldest', () => {
        const { result } = renderHook(() => useReviewSort());

        act(() => {
            result.current.setSortOption('oldest');
        });

        const sorted = result.current.sortReviews(mockReviews);

        // Review 2 (Jan 10) should be first
        expect(sorted[0].id).toBe('2');
    });

    it('should sort by highest rating', () => {
        const { result } = renderHook(() => useReviewSort());

        act(() => {
            result.current.setSortOption('highest');
        });

        const sorted = result.current.sortReviews(mockReviews);

        // Review 1 (rating 5) should be first
        expect(sorted[0].id).toBe('1');
        expect(sorted[0].rating).toBe(5);
    });

    it('should sort by lowest rating', () => {
        const { result } = renderHook(() => useReviewSort());

        act(() => {
            result.current.setSortOption('lowest');
        });

        const sorted = result.current.sortReviews(mockReviews);

        // Review 2 (rating 3) should be first
        expect(sorted[0].id).toBe('2');
        expect(sorted[0].rating).toBe(3);
    });

    it('should sort by most liked', () => {
        const { result } = renderHook(() => useReviewSort());

        act(() => {
            result.current.setSortOption('mostLiked');
        });

        const sorted = result.current.sortReviews(mockReviews);

        // Review 3 (15 likes) should be first
        expect(sorted[0].id).toBe('3');
        expect(sorted[0].likes).toBe(15);
    });

    it('should handle empty array', () => {
        const { result } = renderHook(() => useReviewSort());

        const sorted = result.current.sortReviews([]);

        expect(sorted).toEqual([]);
    });

    it('should provide sort options', () => {
        const { result } = renderHook(() => useReviewSort());

        expect(result.current.sortOptions).toHaveLength(5);
        expect(result.current.sortOptions.map(o => o.value)).toContain('newest');
        expect(result.current.sortOptions.map(o => o.value)).toContain('highest');
    });
});
