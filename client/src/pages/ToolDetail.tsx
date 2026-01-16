/**
 * 工具詳情頁面
 * 顯示單一教育工具的完整資訊
 */

import { useParams, Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Heart,
    ExternalLink,
    Copy,
    Share2,
    Sparkles,
    Clock,
    ChevronRight,
} from 'lucide-react';

import { tools, type EducationalTool, type ToolCategory } from '@/lib/data';
import { iconRegistry, type IconName } from '@/lib/iconRegistry';
import { categoryInfo, getCategoryColorClass } from '@/lib/categoryConstants';
import { getToolStats, trackToolUsage } from '@/lib/firestoreService';
import { useFavorites } from '@/hooks/useFavorites';
import { useRecentTools } from '@/hooks/useRecentTools';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ReviewList } from '@/components/ReviewList';

// 相關推薦元件
function RelatedTools({ currentTool }: { currentTool: EducationalTool }) {
    const relatedTools = tools
        .filter(t => t.category === currentTool.category && t.id !== currentTool.id)
        .slice(0, 3);

    if (relatedTools.length === 0) return null;

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    💡 相關推薦
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {relatedTools.map((tool) => {
                        const IconComponent = iconRegistry[tool.icon as IconName];
                        return (
                            <Link key={tool.id} href={`/tool/${tool.id}`}>
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="p-3 rounded-lg border hover:border-primary/50 hover:bg-accent/50 transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        {IconComponent && <IconComponent className="w-5 h-5 text-primary" />}
                                        <span className="font-medium text-sm truncate">{tool.title}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {tool.description}
                                    </p>
                                </motion.div>
                            </Link>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

// 404 頁面
function NotFound() {
    const [, navigate] = useLocation();

    return (
        <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="text-4xl font-bold mb-4">找不到工具</h1>
            <p className="text-muted-foreground mb-6">
                您要查看的工具不存在或已被移除
            </p>
            <Button onClick={() => navigate('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回首頁
            </Button>
        </div>
    );
}

// 載入骨架
function ToolDetailSkeleton() {
    return (
        <div className="container mx-auto px-4 py-6 space-y-6">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-64 w-full rounded-lg" />
            <div className="space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        </div>
    );
}

export function ToolDetail() {
    const params = useParams<{ id: string }>();
    const toolId = parseInt(params.id || '0');
    const [, navigate] = useLocation();
    const { toast } = useToast();

    // 查找工具
    const tool = tools.find(t => t.id === toolId);

    // 整合現有 hooks
    const { isFavorite, toggleFavorite } = useFavorites();
    const { addToRecent } = useRecentTools();

    // 取得統計資料
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['toolStats', toolId],
        queryFn: () => getToolStats(toolId),
        enabled: !!tool,
    });

    // 404 處理
    if (!tool) {
        return <NotFound />;
    }

    const IconComponent = iconRegistry[tool.icon as IconName];
    const isFav = isFavorite(toolId);

    // 處理「立即使用」按鈕
    const handleUseTool = async () => {
        try {
            // 追蹤使用
            await trackToolUsage(tool.id);
            addToRecent(tool.id);

            // 開啟新視窗
            window.open(tool.url, '_blank', 'noopener,noreferrer');

            toast({
                title: '已開啟工具',
                description: tool.title,
            });
        } catch (error) {
            console.error('開啟工具失敗:', error);
            window.open(tool.url, '_blank');
        }
    };

    // 複製連結
    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(tool.url);
            toast({
                title: '已複製連結',
                description: '工具連結已複製到剪貼簿',
            });
        } catch (error) {
            console.error('複製失敗:', error);
        }
    };

    // 分享
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: tool.title,
                    text: tool.description,
                    url: tool.url,
                });
            } catch (error) {
                // 使用者取消分享
            }
        } else {
            handleCopyLink();
        }
    };

    return (
        <>
            {/* SEO */}
            <Helmet>
                <title>{tool.title} - 阿凱老師教育工具</title>
                <meta name="description" content={tool.description} />
                <meta property="og:title" content={`${tool.title} - 阿凱老師教育工具`} />
                <meta property="og:description" content={tool.description} />
                {tool.previewUrl && <meta property="og:image" content={tool.previewUrl} />}
            </Helmet>

            <div className="container mx-auto px-4 py-6 space-y-6">
                {/* 返回按鈕與收藏 */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/')}
                        className="gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        返回首頁
                    </Button>

                    <Button
                        variant={isFav ? 'default' : 'outline'}
                        onClick={() => toggleFavorite(toolId)}
                        className="gap-2"
                    >
                        <Heart className={cn('w-4 h-4', isFav && 'fill-current')} />
                        {isFav ? '已收藏' : '收藏'}
                    </Button>
                </div>

                {/* 預覽圖 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative aspect-video bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl overflow-hidden border"
                >
                    {tool.previewUrl ? (
                        <img
                            src={`${import.meta.env.BASE_URL}${tool.previewUrl?.startsWith('/') ? tool.previewUrl.slice(1) : tool.previewUrl}`}
                            alt={tool.title}
                            className="w-full h-full object-contain p-8"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            {IconComponent && (
                                <IconComponent className="w-24 h-24 text-primary/30" />
                            )}
                        </div>
                    )}
                </motion.div>

                {/* 工具資訊 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                    {IconComponent && (
                                        <div className="p-3 rounded-lg bg-primary/10">
                                            <IconComponent className="w-6 h-6 text-primary" />
                                        </div>
                                    )}
                                    <div>
                                        <h1 className="text-2xl font-bold">{tool.title}</h1>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge className={getCategoryColorClass(tool.category)}>
                                                {categoryInfo[tool.category].emoji} {categoryInfo[tool.category].label}
                                            </Badge>
                                            {stats && (
                                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Sparkles className="w-4 h-4" />
                                                    {stats.totalClicks.toLocaleString()} 次使用
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-muted-foreground mb-6">
                                {tool.detailedDescription || tool.description}
                            </p>

                            {/* 行動按鈕 */}
                            <div className="flex flex-wrap gap-3">
                                <Button onClick={handleUseTool} size="lg" className="gap-2">
                                    <ExternalLink className="w-4 h-4" />
                                    立即使用
                                </Button>
                                <Button variant="outline" onClick={handleCopyLink} className="gap-2">
                                    <Copy className="w-4 h-4" />
                                    複製連結
                                </Button>
                                <Button variant="outline" onClick={handleShare} className="gap-2">
                                    <Share2 className="w-4 h-4" />
                                    分享
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* 使用統計 */}
                {(stats || statsLoading) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    📊 使用統計
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {statsLoading ? (
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-48" />
                                        <Skeleton className="h-4 w-40" />
                                    </div>
                                ) : stats ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-primary" />
                                            <div>
                                                <div className="text-2xl font-bold">
                                                    {stats.totalClicks.toLocaleString()}
                                                </div>
                                                <div className="text-sm text-muted-foreground">累計使用次數</div>
                                            </div>
                                        </div>
                                        {stats.lastUsedAt && (
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-5 h-5 text-muted-foreground" />
                                                <div>
                                                    <div className="text-lg font-medium">
                                                        {new Date(stats.lastUsedAt.toDate()).toLocaleDateString()}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">最後使用</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">尚無使用統計</p>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* 評論區塊 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                >
                    <ReviewList toolId={tool.id} />
                </motion.div>

                {/* 相關推薦 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <RelatedTools currentTool={tool} />
                </motion.div>

                {/* 麵包屑導航 */}
                <div className="text-sm text-muted-foreground flex items-center gap-1 pt-4 border-t flex-wrap">
                    <Link href="/" className="hover:text-primary">🏠 首頁</Link>
                    <ChevronRight className="w-4 h-4" />
                    <span>{categoryInfo[tool.category].emoji} {categoryInfo[tool.category].label}</span>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-foreground">{tool.title}</span>
                </div>
            </div>
        </>
    );
}

export default ToolDetail;
