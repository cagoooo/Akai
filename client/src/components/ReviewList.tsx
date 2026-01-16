/**
 * 評論列表元件
 * 顯示工具的所有評論
 */

import { useQuery } from '@tanstack/react-query';
import { getReviews, getToolRating } from '@/lib/reviewService';
import { ReviewItem } from './ReviewItem';
import { ReviewForm } from './ReviewForm';
import { StarRating } from './StarRating';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare } from 'lucide-react';

interface ReviewListProps {
    toolId: number;
}

export function ReviewList({ toolId }: ReviewListProps) {
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

    return (
        <div className="space-y-6">
            {/* 評分總覽 */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
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
                ) : reviews && reviews.length > 0 ? (
                    // 評論列表
                    reviews.map((review) => (
                        <ReviewItem key={review.id} review={review} toolId={toolId} />
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
