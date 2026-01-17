/**
 * 評論回覆元件
 * 顯示回覆列表、回覆輸入表單與互動功能
 */

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import {
    getReplies,
    addReply,
    deleteReply,
    likeReply,
    unlikeReply,
    type ReviewReply as ReplyType
} from '@/lib/replyService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
import { ThumbsUp, User, Trash2, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface ReviewReplyProps {
    reviewId: string;
    isExpanded: boolean;
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

    if (diffDay > 0) return `${diffDay} 天前`;
    if (diffHour > 0) return `${diffHour} 小時前`;
    if (diffMin > 0) return `${diffMin} 分鐘前`;
    return '剛剛';
}

/**
 * 單則回覆項目
 */
function ReplyItem({
    reply,
    reviewId
}: {
    reply: ReplyType;
    reviewId: string;
}) {
    const { user, isAuthenticated } = useAuth();
    const queryClient = useQueryClient();
    const [liking, setLiking] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const hasLiked = user && reply.likedBy?.includes(user.uid);
    const isOwner = user && reply.userId === user.uid;

    const handleLike = async () => {
        if (!user || liking) return;

        setLiking(true);
        try {
            if (hasLiked) {
                await unlikeReply(reply.id, user.uid);
            } else {
                await likeReply(reply.id, user.uid);
            }
            queryClient.invalidateQueries({ queryKey: ['replies', reviewId] });
        } finally {
            setLiking(false);
        }
    };

    const handleDelete = async () => {
        if (deleting) return;

        setDeleting(true);
        try {
            await deleteReply(reply.id);
            toast({
                title: '回覆已刪除',
            });
            queryClient.invalidateQueries({ queryKey: ['replies', reviewId] });
        } catch {
            toast({
                title: '刪除失敗',
                variant: 'destructive',
            });
        } finally {
            setDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    return (
        <>
            <div className="flex gap-2 py-2 pl-4 border-l-2 border-muted">
                <Avatar className="w-7 h-7 shrink-0">
                    <AvatarImage src={reply.userPhotoURL || undefined} alt={reply.userName} />
                    <AvatarFallback>
                        <User className="w-3.5 h-3.5" />
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs">
                        <span className="font-medium">{reply.userName}</span>
                        <span className="text-muted-foreground">
                            {formatTimeAgo(reply.createdAt)}
                        </span>
                    </div>
                    <p className="text-sm text-foreground/90 mt-0.5 whitespace-pre-wrap">
                        {reply.content}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLike}
                            disabled={!isAuthenticated || liking}
                            className={cn(
                                'h-6 px-1.5 text-xs gap-1',
                                hasLiked && 'text-primary'
                            )}
                        >
                            <ThumbsUp
                                className={cn(
                                    'w-3 h-3',
                                    hasLiked && 'fill-current'
                                )}
                            />
                            <span>{reply.likes || 0}</span>
                        </Button>
                        {isOwner && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowDeleteDialog(true)}
                                className="h-6 px-1.5 text-xs text-muted-foreground hover:text-red-600"
                            >
                                <Trash2 className="w-3 h-3" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* 刪除確認對話框 */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>確定要刪除這則回覆嗎？</AlertDialogTitle>
                        <AlertDialogDescription>
                            此操作無法復原。
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

/**
 * 回覆輸入表單
 */
function ReplyForm({
    reviewId,
    onSuccess
}: {
    reviewId: string;
    onSuccess?: () => void;
}) {
    const { user, isAuthenticated } = useAuth();
    const queryClient = useQueryClient();
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!user || !content.trim() || submitting) return;

        setSubmitting(true);
        try {
            const replyId = await addReply(reviewId, user, content);
            if (replyId) {
                toast({
                    title: '回覆成功',
                });
                setContent('');
                queryClient.invalidateQueries({ queryKey: ['replies', reviewId] });
                onSuccess?.();
            }
        } catch {
            toast({
                title: '回覆失敗',
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="text-xs text-muted-foreground text-center py-2">
                請先登入才能回覆
            </div>
        );
    }

    return (
        <div className="flex gap-2 mt-2">
            <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="寫下你的回覆..."
                className="min-h-[60px] text-sm resize-none"
                maxLength={500}
            />
            <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!content.trim() || submitting}
                className="h-auto px-3"
            >
                {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Send className="w-4 h-4" />
                )}
            </Button>
        </div>
    );
}

/**
 * 評論回覆區塊
 */
export function ReviewReply({ reviewId, isExpanded }: ReviewReplyProps) {
    const { data: replies, isLoading } = useQuery({
        queryKey: ['replies', reviewId],
        queryFn: () => getReplies(reviewId),
        enabled: isExpanded,
    });

    if (!isExpanded) return null;

    return (
        <div className="mt-3 pt-3 border-t border-muted/50">
            {/* 回覆列表 */}
            {isLoading ? (
                <div className="text-xs text-muted-foreground text-center py-2">
                    載入中...
                </div>
            ) : replies && replies.length > 0 ? (
                <div className="space-y-1">
                    {replies.map((reply) => (
                        <ReplyItem
                            key={reply.id}
                            reply={reply}
                            reviewId={reviewId}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-xs text-muted-foreground text-center py-1">
                    還沒有回覆
                </div>
            )}

            {/* 回覆輸入表單 */}
            <ReplyForm reviewId={reviewId} />
        </div>
    );
}

export default ReviewReply;
