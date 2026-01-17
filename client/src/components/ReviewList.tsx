/**
 * 評論列表元件
 * 顯示工具的所有評論，支援排序
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getReviews, getToolRating } from '@/lib/reviewService';
import { ReviewItem } from './ReviewItem';
import { ReviewForm } from './ReviewForm';
import { StarRating } from './StarRating';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, ArrowUpDown } from 'lucide-react';
import { useReviewSort, reviewSortOptions } from '@/hooks/useReviewSort';
import { cn } from '@/lib/utils';

interface ReviewListProps {
    toolId: number;
}

export function ReviewList({ toolId }: ReviewListProps) {
    // 排序 Hook
    const { sortOption, setSortOption, sortReviews } = useReviewSort();

    // 取得評論列表
    const {
        data: reviews,
        isLoading: reviewsLoading,
        refetch: refetchReviews,
    } = useQuery({
        queryKey: ['reviews', toolId],
        queryFn: () => getReviews(toolId),
    });

    // 取得評分統計
    const { data: rating, isLoading: ratingLoading } = useQuery({
        queryKey: ['toolRating', toolId],
        queryFn: () => getToolRating(toolId),
    });

    // 排序後的評論
    const sortedReviews = useMemo(() => {
        return reviews ? sortReviews(reviews) : [];
    }, [reviews, sortReviews]);

    return (
        <div className="space-y-6">
            {/* 評分總覽 */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between flex-wrap gap-3">
                        <span className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            評論與評分
                        </span>
                        {rating && (
                            <div className="flex items-center gap-2 text-base font-normal">
                                <StarRating rating={rating.averageRating} readonly size="sm" showValue />
                                <span className="text-muted-foreground">
                                    ({rating.totalReviews} 則評論)
                                </span>
                            </div>
                        )}
                        {ratingLoading && (
                            <Skeleton className="h-5 w-32" />
                        )}
                    </CardTitle>
                </CardHeader>
            </Card>

            {/* 評論表單 */}
            <ReviewForm toolId={toolId} onReviewSubmitted={refetchReviews} />

            {/* 排序選項 */}
            {reviews && reviews.length > 1 && (
                <div className="flex items-center justify-between bg-muted/30 rounded-lg p-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ArrowUpDown className="w-4 h-4" />
                        <span>排序方式</span>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                        {reviewSortOptions.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setSortOption(opt.value)}
                                className={cn(
                                    "px-2.5 py-1 text-xs font-medium rounded-md transition-all",
                                    sortOption === opt.value
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-white hover:bg-gray-100 text-gray-600"
                                )}
                            >
                                <span className="mr-1">{opt.icon}</span>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* 評論列表 */}
            <div className="space-y-4">
                {reviewsLoading ? (
                    // 載入中骨架
                    <>
                        {[1, 2, 3].map((i) => (
                            <Card key={i}>
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="w-10 h-10 rounded-full" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-3 w-32" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                </CardContent>
                            </Card>
                        ))}
                    </>
                ) : sortedReviews && sortedReviews.length > 0 ? (
                    // 評論列表
                    sortedReviews.map((review) => (
                        <ReviewItem
                            key={review.id}
                            review={review}
                            toolId={toolId}
                            onReviewUpdated={refetchReviews}
                        />
                    ))
                ) : (
                    // 無評論
                    <Card className="bg-muted/50">
                        <CardContent className="py-8 text-center text-muted-foreground">
                            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>還沒有評論</p>
                            <p className="text-sm">成為第一個評論的人吧！</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
