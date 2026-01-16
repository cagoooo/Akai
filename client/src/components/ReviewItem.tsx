/**
 * 單則評論卡片
 * 顯示評論內容、評分、點讚功能
 */

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { likeReview, unlikeReview, type Review } from '@/lib/reviewService';
import { StarRating } from './StarRating';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ThumbsUp, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';

interface ReviewItemProps {
    review: Review;
    toolId: number;
}

/**
 * 格式化時間為「多久前」
 */
function formatTimeAgo(timestamp: any): string {
    if (!timestamp) return '';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);

    if (diffMonth > 0) return `${diffMonth} 個月前`;
    if (diffWeek > 0) return `${diffWeek} 週前`;
    if (diffDay > 0) return `${diffDay} 天前`;
    if (diffHour > 0) return `${diffHour} 小時前`;
    if (diffMin > 0) return `${diffMin} 分鐘前`;
    return '剛剛';
}

export function ReviewItem({ review, toolId }: ReviewItemProps) {
    const { user, isAuthenticated } = useAuth();
    const queryClient = useQueryClient();
    const [liking, setLiking] = useState(false);

    const hasLiked = user && review.likedBy?.includes(user.uid);

    const handleLike = async () => {
        if (!user || liking) return;

        setLiking(true);
        try {
            if (hasLiked) {
                await unlikeReview(review.id, user.uid);
            } else {
                await likeReview(review.id, user.uid);
            }
            // 刷新評論列表
            queryClient.invalidateQueries({ queryKey: ['reviews', toolId] });
        } finally {
            setLiking(false);
        }
    };

    return (
        <Card className="overflow-hidden">
            <CardContent className="p-4">
                {/* 用戶資訊與評分 */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                            <AvatarImage src={review.userPhoto} alt={review.userName} />
                            <AvatarFallback>
                                <User className="w-5 h-5" />
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-medium">{review.userName}</div>
                            <div className="flex items-center gap-2">
                                <StarRating rating={review.rating} readonly size="sm" />
                                <span className="text-xs text-muted-foreground">
                                    {formatTimeAgo(review.createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 評論內容 */}
                <p className="text-sm text-foreground/90 mb-3 whitespace-pre-wrap">
                    {review.comment}
                </p>

                {/* 點讚按鈕 */}
                <div className="flex items-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLike}
                        disabled={!isAuthenticated || liking}
                        className={cn(
                            'gap-1.5 h-8 px-2',
                            hasLiked && 'text-primary'
                        )}
                    >
                        <ThumbsUp
                            className={cn(
                                'w-4 h-4',
                                hasLiked && 'fill-current'
                            )}
                        />
                        <span>{review.likes || 0}</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
