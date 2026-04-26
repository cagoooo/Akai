/**
 * 評論表單元件
 * 提供星級評分和文字評論輸入
 */

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { addReview, hasUserReviewed } from '@/lib/reviewService';
import { StarRating } from './StarRating';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LogIn, Send, AlertCircle } from 'lucide-react';

interface ReviewFormProps {
    toolId: number;
    /** 工具標題（會寫入評論文件，供 Cloud Function 推播 LINE 通知時使用） */
    toolTitle?: string;
    onReviewSubmitted?: () => void;
}

export function ReviewForm({ toolId, toolTitle, onReviewSubmitted }: ReviewFormProps) {
    const { user, isAuthenticated, signIn, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // 檢查是否已評論
    const { data: hasReviewed, isLoading: checkingReview } = useQuery({
        queryKey: ['hasReviewed', toolId, user?.uid],
        queryFn: () => hasUserReviewed(toolId, user!.uid),
        enabled: !!user,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast({
                title: '請先登入',
                description: '登入後即可發表評論',
                variant: 'destructive',
            });
            return;
        }

        if (rating === 0) {
            toast({
                title: '請選擇評分',
                description: '請點擊星星給予評分',
                variant: 'destructive',
            });
            return;
        }

        if (!comment.trim()) {
            toast({
                title: '請輸入評論',
                description: '請填寫您的使用心得',
                variant: 'destructive',
            });
            return;
        }

        setSubmitting(true);
        try {
            const reviewId = await addReview(toolId, user, rating, comment, toolTitle);

            if (reviewId) {
                toast({
                    title: '評論已發表 🎉',
                    description: '感謝您的回饋！',
                });

                // 重設表單
                setRating(0);
                setComment('');

                // 刷新評論列表
                queryClient.invalidateQueries({ queryKey: ['reviews', toolId] });
                queryClient.invalidateQueries({ queryKey: ['toolRating', toolId] });
                queryClient.invalidateQueries({ queryKey: ['hasReviewed', toolId, user.uid] });

                onReviewSubmitted?.();
            } else {
                throw new Error('評論發表失敗');
            }
        } catch (error) {
            toast({
                title: '發表失敗',
                description: '請稍後再試',
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    // 未登入狀態
    if (!isAuthenticated) {
        return (
            <Card className="bg-muted/50">
                <CardContent className="py-6 text-center">
                    <p className="text-muted-foreground mb-4">
                        登入後即可發表評論
                    </p>
                    <Button onClick={signIn} disabled={authLoading} className="gap-2">
                        <LogIn className="w-4 h-4" />
                        使用 Google 登入
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // 已評論過
    if (hasReviewed && !checkingReview) {
        return (
            <Card className="bg-green-50 dark:bg-green-950/20">
                <CardContent className="py-4 flex items-center gap-2 text-green-700 dark:text-green-400">
                    <AlertCircle className="w-5 h-5" />
                    <span>您已經評論過此工具</span>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">✍️ 撰寫評論</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* 評分 */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">
                            您的評分
                        </label>
                        <StarRating
                            rating={rating}
                            onChange={setRating}
                            size="lg"
                        />
                    </div>

                    {/* 評論內容 */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">
                            您的評論
                        </label>
                        <Textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="請分享您的使用心得..."
                            rows={3}
                            maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground mt-1 text-right">
                            {comment.length}/500
                        </p>
                    </div>

                    {/* 送出按鈕 */}
                    <Button
                        type="submit"
                        disabled={submitting || rating === 0 || !comment.trim()}
                        className="gap-2"
                    >
                        {submitting ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                        送出評論
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
