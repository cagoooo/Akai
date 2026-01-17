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
    Star,
    Users,
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

// 相關推薦元件 - 優化版
function RelatedTools({ currentTool }: { currentTool: EducationalTool }) {
    const relatedTools = tools
        .filter(t => t.category === currentTool.category && t.id !== currentTool.id)
        .slice(0, 4);

    if (relatedTools.length === 0) return null;

    return (
        <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-yellow-100">💡</span>
                相關推薦
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {relatedTools.map((tool) => {
                    const IconComponent = iconRegistry[tool.icon as IconName];
                    const catInfo = categoryInfo[tool.category];
                    return (
                        <Link
                            key={tool.id}
                            href={`/tool/${tool.id}`}
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        >
                            <motion.div
                                whileHover={{ scale: 1.03, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className="p-3 sm:p-4 rounded-xl border-2 border-gray-100 bg-white hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer h-full"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={cn("p-1.5 rounded-lg", getCategoryColorClass(tool.category))}>
                                        {IconComponent && <IconComponent className="w-4 h-4" />}
                                    </div>
                                </div>
                                <h3 className="font-semibold text-sm mb-1 line-clamp-2">{tool.title}</h3>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                    {tool.description}
                                </p>
                            </motion.div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}

// 404 頁面 - 優化版
function NotFound() {
    const [, navigate] = useLocation();

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h1 className="text-3xl sm:text-4xl font-black mb-3 text-gray-800">找不到工具</h1>
            <p className="text-muted-foreground mb-6 max-w-md">
                您要查看的工具不存在或已被移除，請返回首頁探索其他精彩工具！
            </p>
            <Button onClick={() => navigate('/')} size="lg" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                返回首頁
            </Button>
        </div>
    );
}

// 載入骨架 - 優化版
function ToolDetailSkeleton() {
    return (
        <div className="container mx-auto px-4 py-6 space-y-6">
            <div className="flex justify-between">
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-24" />
            </div>
            <Skeleton className="h-48 sm:h-64 w-full rounded-2xl" />
            <div className="space-y-4">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-3">
                    <Skeleton className="h-12 w-32" />
                    <Skeleton className="h-12 w-28" />
                </div>
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
    const catInfo = categoryInfo[tool.category];

    // 處理「立即使用」按鈕
    const handleUseTool = async () => {
        try {
            await trackToolUsage(tool.id);
            addToRecent(tool.id);
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

    // 分享 - 只在行動裝置使用原生分享
    const handleShare = async () => {
        const shareData = {
            title: tool.title,
            text: tool.description,
            url: tool.url,
        };

        // 檢測是否為行動裝置 (觸控 + 小螢幕)
        const isMobile = 'ontouchstart' in window && window.innerWidth < 768;

        // 只在行動裝置且支援分享 API 時使用原生分享
        if (isMobile && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
                toast({
                    title: '分享成功',
                    description: '已分享工具連結',
                });
            } catch (error: any) {
                // 使用者取消分享不需處理
                if (error.name !== 'AbortError') {
                    handleCopyLink();
                }
            }
        } else {
            // 桌面端直接複製連結，不彈出任何對話框
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

            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
                {/* 頂部導航列 - 固定在頂部 */}
                <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
                    <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/')}
                            className="gap-2 text-sm sm:text-base"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">返回首頁</span>
                            <span className="sm:hidden">返回</span>
                        </Button>

                        <Button
                            variant={isFav ? 'default' : 'outline'}
                            onClick={() => toggleFavorite(toolId)}
                            className={cn(
                                "gap-2",
                                isFav && "bg-red-500 hover:bg-red-600"
                            )}
                        >
                            <Heart className={cn('w-4 h-4', isFav && 'fill-current')} />
                            <span className="hidden sm:inline">{isFav ? '已收藏' : '收藏'}</span>
                        </Button>
                    </div>
                </header>

                <main className="container mx-auto px-4 py-4 sm:py-6 space-y-6">
                    {/* Hero 區塊 - 預覽圖與工具資訊 */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative"
                    >
                        {/* 背景漸層 */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-50/50 to-blue-50/30 rounded-2xl sm:rounded-3xl -z-10" />

                        <div className="p-4 sm:p-6 md:p-8">
                            {/* 分類標籤 */}
                            <div className="flex items-center gap-2 mb-4">
                                <Badge className={cn(getCategoryColorClass(tool.category), "text-sm px-3 py-1")}>
                                    {catInfo.emoji} {catInfo.label}
                                </Badge>
                                {stats && (
                                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Sparkles className="w-4 h-4 text-yellow-500" />
                                        {stats.totalClicks.toLocaleString()} 次使用
                                    </span>
                                )}
                            </div>

                            {/* 工具名稱 */}
                            <div className="flex items-start gap-3 sm:gap-4 mb-4">
                                {IconComponent && (
                                    <div className={cn(
                                        "p-3 sm:p-4 rounded-xl sm:rounded-2xl",
                                        "bg-gradient-to-br from-primary/20 to-primary/10",
                                        "shadow-lg shadow-primary/10"
                                    )}>
                                        <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-2">
                                        {tool.title}
                                    </h1>
                                    <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
                                        {tool.detailedDescription || tool.description}
                                    </p>
                                </div>
                            </div>

                            {/* 預覽圖 */}
                            {tool.previewUrl && (
                                <div className="relative aspect-video bg-white rounded-xl sm:rounded-2xl overflow-hidden border-2 border-gray-100 shadow-xl mb-6">
                                    <picture>
                                        <source
                                            srcSet={`${import.meta.env.BASE_URL}${tool.previewUrl?.replace('.png', '.webp').replace(/^\//, '')}`}
                                            type="image/webp"
                                        />
                                        <img
                                            src={`${import.meta.env.BASE_URL}${tool.previewUrl?.startsWith('/') ? tool.previewUrl.slice(1) : tool.previewUrl}`}
                                            alt={tool.title}
                                            className="w-full h-full object-contain p-4 sm:p-6"
                                            loading="lazy"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    </picture>
                                </div>
                            )}

                            {/* 行動按鈕 - 手機端優化 */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    onClick={handleUseTool}
                                    size="lg"
                                    className="gap-2 text-base sm:text-lg py-6 sm:py-4 flex-1 sm:flex-none bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 shadow-lg shadow-primary/25"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                    立即使用
                                </Button>
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={handleCopyLink}
                                        size="lg"
                                        className="gap-2 flex-1 sm:flex-none"
                                    >
                                        <Copy className="w-4 h-4" />
                                        <span className="hidden sm:inline">複製連結</span>
                                        <span className="sm:hidden">複製</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleShare}
                                        size="lg"
                                        className="gap-2 flex-1 sm:flex-none"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        <span className="hidden sm:inline">分享</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* 使用統計 - 卡片式設計 */}
                    {(stats || statsLoading) && (
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="grid grid-cols-2 gap-3 sm:gap-4"
                        >
                            <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
                                <CardContent className="p-4 sm:p-6">
                                    {statsLoading ? (
                                        <Skeleton className="h-12 w-full" />
                                    ) : (
                                        <div className="text-center">
                                            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 mx-auto mb-2" />
                                            <div className="text-2xl sm:text-3xl font-black text-blue-600">
                                                {stats?.totalClicks?.toLocaleString() || 0}
                                            </div>
                                            <div className="text-xs sm:text-sm text-muted-foreground">累計使用次數</div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-green-50 to-white border-green-100">
                                <CardContent className="p-4 sm:p-6">
                                    {statsLoading ? (
                                        <Skeleton className="h-12 w-full" />
                                    ) : (
                                        <div className="text-center">
                                            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 mx-auto mb-2" />
                                            <div className="text-lg sm:text-xl font-bold text-green-600">
                                                {stats?.lastUsedAt
                                                    ? new Date(stats.lastUsedAt.toDate()).toLocaleDateString()
                                                    : '尚無紀錄'
                                                }
                                            </div>
                                            <div className="text-xs sm:text-sm text-muted-foreground">最後使用日期</div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.section>
                    )}

                    {/* 評論區塊 */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                    >
                        <ReviewList toolId={tool.id} />
                    </motion.section>

                    {/* 相關推薦 */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                    >
                        <RelatedTools currentTool={tool} />
                    </motion.section>

                    {/* 麵包屑導航 */}
                    <nav className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 pt-6 border-t flex-wrap">
                        <Link href="/" className="hover:text-primary transition-colors">🏠 首頁</Link>
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{catInfo.emoji} {catInfo.label}</span>
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-foreground font-medium">{tool.title}</span>
                    </nav>
                </main>
            </div>
        </>
    );
}

export default ToolDetail;
