/**
 * 單則評論卡片
 * 顯示評論內容、評分、點讚、編輯、刪除、回覆功能
 */

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { likeReview, unlikeReview, deleteReview, updateReview, type Review } from '@/lib/reviewService';
import { StarRating } from './StarRating';
import { ReviewReply } from './ReviewReply';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ThumbsUp, User, MoreHorizontal, Pencil, Trash2, X, Check, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

interface ReviewItemProps {
    review: Review;
    toolId: number;
    onReviewUpdated?: () => void;
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

export function ReviewItem({ review, toolId, onReviewUpdated }: ReviewItemProps) {
    const { user, isAuthenticated } = useAuth();
    const queryClient = useQueryClient();
    const [liking, setLiking] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(review.comment);
    const [editRating, setEditRating] = useState<number>(review.rating);
    const [saving, setSaving] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showReplies, setShowReplies] = useState(false);

    const hasLiked = user && review.likedBy?.includes(user.uid);
    const isOwner = user && review.userId === user.uid;

    const handleLike = async () => {
        if (!user || liking) return;

        setLiking(true);
        try {
            if (hasLiked) {
                await unlikeReview(review.id, user.uid);
            } else {
                await likeReview(review.id, user.uid);
            }
            queryClient.invalidateQueries({ queryKey: ['reviews', toolId] });
        } finally {
            setLiking(false);
        }
    };

    const handleEdit = () => {
        setEditContent(review.comment);
        setEditRating(review.rating);
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditContent(review.comment);
        setEditRating(review.rating);
    };

    const handleSaveEdit = async () => {
        if (!editContent.trim() || saving) return;

        setSaving(true);
        try {
            await updateReview(review.id, {
                comment: editContent.trim(),
                rating: editRating,
            });
            toast({
                title: '更新成功',
                description: '您的評論已更新',
            });
            setIsEditing(false);
            queryClient.invalidateQueries({ queryKey: ['reviews', toolId] });
            onReviewUpdated?.();
        } catch (error) {
            toast({
                title: '更新失敗',
                description: '請稍後再試',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (deleting) return;

        setDeleting(true);
        try {
            await deleteReview(review.id);
            toast({
                title: '刪除成功',
                description: '您的評論已刪除',
            });
            queryClient.invalidateQueries({ queryKey: ['reviews', toolId] });
            queryClient.invalidateQueries({ queryKey: ['toolRating', toolId] });
            onReviewUpdated?.();
        } catch (error) {
            toast({
                title: '刪除失敗',
                description: '請稍後再試',
                variant: 'destructive',
            });
        } finally {
            setDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    return (
        <>
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
                                    {isEditing ? (
                                        <StarRating
                                            rating={editRating}
                                            onChange={setEditRating}
                                            size="sm"
                                        />
                                    ) : (
                                        <StarRating rating={review.rating} readonly size="sm" />
                                    )}
                                    <span className="text-xs text-muted-foreground">
                                        {formatTimeAgo(review.createdAt)}
                                        {review.edited && ' (已編輯)'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 編輯選單 */}
                        {isOwner && !isEditing && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={handleEdit}>
                                        <Pencil className="w-4 h-4 mr-2" />
                                        編輯
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => setShowDeleteDialog(true)}
                                        className="text-red-600"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        刪除
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                    {/* 評論內容 */}
                    {isEditing ? (
                        <div className="space-y-3">
                            <Textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="min-h-[80px]"
                            />
                            <div className="flex gap-2 justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCancelEdit}
                                    disabled={saving}
                                >
                                    <X className="w-4 h-4 mr-1" />
                                    取消
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSaveEdit}
                                    disabled={saving || !editContent.trim()}
                                >
                                    <Check className="w-4 h-4 mr-1" />
                                    儲存
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-foreground/90 mb-3 whitespace-pre-wrap">
                            {review.comment}
                        </p>
                    )}

                    {/* 點讚與回覆按鈕 */}
                    {!isEditing && (
                        <div className="flex items-center gap-1">
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
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowReplies(!showReplies)}
                                className={cn(
                                    'gap-1.5 h-8 px-2',
                                    showReplies && 'text-primary'
                                )}
                            >
                                <MessageCircle className="w-4 h-4" />
                                <span>回覆</span>
                            </Button>
                        </div>
                    )}

                    {/* 回覆區塊 */}
                    <ReviewReply reviewId={review.id} isExpanded={showReplies} />
                </CardContent>
            </Card>

            {/* 刪除確認對話框 */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>確定要刪除這則評論嗎？</AlertDialogTitle>
                        <AlertDialogDescription>
                            此操作無法復原，您的評論將被永久刪除。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>取消</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {deleting ? '刪除中...' : '刪除'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
