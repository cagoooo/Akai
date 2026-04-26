/**
 * 工具詳情頁面 v2.1
 * 顯示單一教育工具的完整資訊 - 升級版 UI/UX
 * 已優化 LINE 內建瀏覽器相容性
 */

import { useParams, Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { m as motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';
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
    TrendingUp,
    Zap,
    Award,
} from 'lucide-react';

import { tools, type EducationalTool, type ToolCategory } from '@/lib/data';
import { iconRegistry, type IconName } from '@/lib/iconRegistry';
import { categoryInfo, getCategoryColorClass } from '@/lib/categoryConstants';
import { getToolStats, trackToolUsage } from '@/lib/firestoreService';
import { useFavorites } from '@/hooks/useFavorites';
import { useRecentTools } from '@/hooks/useRecentTools';
import { useAchievements } from '@/hooks/useAchievements';
import { shouldReduceMotion, isInAppBrowser, getAnimationConfig } from '@/lib/browserDetection';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ReviewList } from '@/components/ReviewList';

// 分類專屬配色 - 大膽漸層
const categoryGradients: Record<ToolCategory, { bg: string; text: string; border: string; glow: string }> = {
    communication: {
        bg: 'from-blue-500 via-cyan-500 to-teal-400',
        text: 'from-blue-600 to-cyan-500',
        border: 'border-blue-200',
        glow: 'shadow-blue-500/30',
    },
    teaching: {
        bg: 'from-emerald-500 via-green-500 to-lime-400',
        text: 'from-emerald-600 to-green-500',
        border: 'border-emerald-200',
        glow: 'shadow-emerald-500/30',
    },
    language: {
        bg: 'from-violet-500 via-purple-500 to-fuchsia-400',
        text: 'from-violet-600 to-purple-500',
        border: 'border-violet-200',
        glow: 'shadow-violet-500/30',
    },
    reading: {
        bg: 'from-amber-500 via-yellow-500 to-orange-400',
        text: 'from-amber-600 to-yellow-500',
        border: 'border-amber-200',
        glow: 'shadow-amber-500/30',
    },
    utilities: {
        bg: 'from-slate-500 via-gray-500 to-zinc-400',
        text: 'from-slate-600 to-gray-500',
        border: 'border-slate-200',
        glow: 'shadow-slate-500/30',
    },
    games: {
        bg: 'from-pink-500 via-rose-500 to-red-400',
        text: 'from-pink-600 to-rose-500',
        border: 'border-pink-200',
        glow: 'shadow-pink-500/30',
    },
    interactive: {
        bg: 'from-cyan-500 via-sky-500 to-blue-400',
        text: 'from-cyan-600 to-sky-500',
        border: 'border-cyan-200',
        glow: 'shadow-cyan-500/30',
    },
};

// 動畫配置 - 根據瀏覽器環境動態調整
const getContainerVariants = (reduceMotion: boolean) => ({
    hidden: { opacity: reduceMotion ? 1 : 0 },
    visible: {
        opacity: 1,
        transition: reduceMotion ? { duration: 0 } : { staggerChildren: 0.1, delayChildren: 0.1 }
    }
});

const getItemVariants = (reduceMotion: boolean) => ({
    hidden: { opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 100, damping: 15 }
    }
});

const getFloatAnimation = (reduceMotion: boolean) => reduceMotion ? {} : {
    y: [0, -8, 0],
    transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut'
    }
};

// 相關推薦元件 - 升級版 (支援 LINE 瀏覽器)
function RelatedTools({ currentTool, tools: toolsList }: { currentTool: EducationalTool; tools: EducationalTool[] }) {
    const relatedTools = (toolsList || [])
        .filter(t => t.category === currentTool.category && t.id !== currentTool.id)
        .slice(0, 4);

    // 動態動畫配置
    const reduceMotion = shouldReduceMotion();
    const itemVariants = getItemVariants(reduceMotion);
    const floatAnimation = getFloatAnimation(reduceMotion);

    if (relatedTools.length === 0) return null;

    const gradient = categoryGradients[currentTool.category as ToolCategory];

    return (
        <motion.section
            variants={itemVariants}
            className="space-y-6"
        >
            <div className="flex items-center gap-3">
                <motion.div
                    animate={floatAnimation}
                    className={cn(
                        "p-2.5 rounded-xl bg-gradient-to-br",
                        gradient.bg
                    )}
                >
                    <Sparkles className="w-5 h-5 text-white" />
                </motion.div>
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    探索更多相關工具
                </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {relatedTools.map((tool, index) => {
                    const IconComponent = iconRegistry[tool.icon as IconName];
                    const catInfo = categoryInfo[tool.category];
                    const toolGradient = categoryGradients[tool.category as ToolCategory];

                    return (
                        <Link
                            key={tool.id}
                            href={`/tool/${tool.id}`}
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        >
                            <motion.div
                                initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={reduceMotion ? { duration: 0 } : { delay: index * 0.1 }}
                                whileHover={reduceMotion ? {} : { scale: 1.03, y: -4 }}
                                whileTap={reduceMotion ? {} : { scale: 0.98 }}
                                className={cn(
                                    "group relative p-5 rounded-2xl bg-white",
                                    "border-2 hover:border-transparent",
                                    "shadow-sm hover:shadow-xl transition-all duration-300",
                                    "cursor-pointer h-full overflow-hidden",
                                    toolGradient.border
                                )}
                            >
                                {/* 懸浮背景 */}
                                <div className={cn(
                                    "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300",
                                    "bg-gradient-to-br",
                                    toolGradient.bg
                                )} />

                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-3">
                                        <motion.div
                                            whileHover={reduceMotion ? {} : { rotate: 360 }}
                                            transition={reduceMotion ? { duration: 0 } : { duration: 0.5 }}
                                            className={cn(
                                                "p-2.5 rounded-xl bg-gradient-to-br",
                                                toolGradient.bg
                                            )}
                                        >
                                            {IconComponent && <IconComponent className="w-5 h-5 text-white" />}
                                        </motion.div>
                                        <span className="text-xl">{catInfo.emoji}</span>
                                    </div>

                                    <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-gray-900">
                                        {tool.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {tool.description}
                                    </p>
                                </div>
                            </motion.div>
                        </Link>
                    );
                })}
            </div>
        </motion.section>
    );
}

// 404 頁面 - 升級版 (支援 LINE 瀏覽器)
function NotFound() {
    const [, navigate] = useLocation();
    const reduceMotion = shouldReduceMotion();
    const floatAnimation = getFloatAnimation(reduceMotion);

    return (
        <motion.div
            initial={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={reduceMotion ? { duration: 0 } : undefined}
            className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center"
        >
            <motion.div
                animate={floatAnimation}
                className="text-8xl mb-6"
            >
                🔍
            </motion.div>
            <h1 className="text-4xl sm:text-5xl font-black mb-4 bg-gradient-to-r from-gray-800 to-gray-500 bg-clip-text text-transparent">
                找不到工具
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-md">
                您要查看的工具不存在或已被移除，請返回首頁探索其他精彩工具！
            </p>
            <motion.div
                whileHover={reduceMotion ? {} : { scale: 1.05 }}
                whileTap={reduceMotion ? {} : { scale: 0.95 }}
            >
                <Button
                    onClick={() => navigate('/')}
                    size="lg"
                    className="gap-2 px-8 py-6 text-lg rounded-2xl bg-gradient-to-r from-primary to-indigo-600 shadow-xl shadow-primary/30"
                >
                    <ArrowLeft className="w-5 h-5" />
                    返回首頁
                </Button>
            </motion.div>
        </motion.div>
    );
}

// 載入骨架 - 升級版
function ToolDetailSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <div className="container mx-auto px-4 py-8 space-y-8">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-12 w-32 rounded-xl" />
                    <Skeleton className="h-12 w-28 rounded-xl" />
                </div>
                <Skeleton className="h-[400px] w-full rounded-3xl" />
                <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-32 rounded-2xl" />
                    <Skeleton className="h-32 rounded-2xl" />
                </div>
            </div>
        </div>
    );
}

// 統計數字動畫元件
function AnimatedNumber({ value }: { value: number }) {
    return (
        <motion.span
            key={value}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="tabular-nums"
        >
            {value.toLocaleString()}
        </motion.span>
    );
}

export function ToolDetail() {
    const params = useParams<{ id: string }>();
    const toolId = parseInt(params.id || '0');
    const [, navigate] = useLocation();
    const { toast } = useToast();

    // 檢測是否應該減少動畫 (LINE 內建瀏覽器或使用者偏好)
    const reduceMotion = useMemo(() => shouldReduceMotion(), []);
    const inAppBrowser = useMemo(() => isInAppBrowser(), []);

    // 動態動畫配置
    const containerVariants = useMemo(() => getContainerVariants(reduceMotion), [reduceMotion]);
    const itemVariants = useMemo(() => getItemVariants(reduceMotion), [reduceMotion]);
    const floatAnimation = useMemo(() => getFloatAnimation(reduceMotion), [reduceMotion]);
    const animConfig = useMemo(() => getAnimationConfig(), []);

    // 從 API 獲取工具數據
    const { data: allTools, isLoading: toolsLoading } = useQuery({
        queryKey: ['/api/tools'],
        queryFn: async () => {
            const staticUrl = `${import.meta.env.BASE_URL}api/tools.json`;
            try {
                const staticResponse = await fetch(staticUrl);
                if (staticResponse.ok) return await staticResponse.json() as EducationalTool[];

                const response = await fetch('/api/tools');
                if (response.ok) return await response.json() as EducationalTool[];

                throw new Error('無法獲取工具數據');
            } catch (err) {
                console.error('數據獲取失敗:', err);
                throw err;
            }
        },
        staleTime: 300000,
    });

    // 查找工具
    const tool = useMemo(() => {
        if (!allTools) return null;
        return allTools.find(t => t.id === toolId);
    }, [allTools, toolId]);

    // 整合現有 hooks
    const { isFavorite, toggleFavorite, favoritesCount } = useFavorites();
    const { addToRecent } = useRecentTools();
    const { trackToolUsage: trackAchievement, updateFavoritesCount } = useAchievements();

    // 取得統計資料
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['toolStats', toolId],
        queryFn: () => getToolStats(toolId),
        enabled: !!tool,
    });

    // 載入狀態處理
    if (toolsLoading) {
        return <ToolDetailSkeleton />;
    }

    // 404 處理
    if (!tool) {
        return <NotFound />;
    }

    const IconComponent = iconRegistry[tool.icon as IconName];
    const isFav = isFavorite(toolId);
    const catInfo = categoryInfo[tool.category];
    const gradient = categoryGradients[tool.category as ToolCategory];

    // 處理「立即使用」按鈕 - 採用 <a> 模擬點擊以確保行為穩定
    const handleUseTool = () => {
        // 非同步追蹤使用記錄
        trackToolUsage(tool.id).catch(console.error);
        addToRecent(tool.id);
        trackAchievement(tool.id, tool.category);

        if (inAppBrowser) {
            // LINE 等內建瀏覽器：直接跳轉
            window.location.href = tool.url;
        } else {
            try {
                // 使用 <a> 標籤模擬點擊是開新分頁最穩定的做法，能有效避免彈窗阻擋誤判
                const link = document.createElement('a');
                link.href = tool.url;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                toast({
                    title: '已開啟工具',
                    description: tool.title,
                });
            } catch (error) {
                console.error('開啟工具失敗:', error);
                // 如果模擬點擊失敗，回退到原視窗跳轉
                window.location.href = tool.url;
            }
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
        const shareData = {
            title: tool.title,
            text: tool.description,
            url: tool.url,
        };

        const isMobile = 'ontouchstart' in window && window.innerWidth < 768;

        if (isMobile && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
                toast({
                    title: '分享成功',
                    description: '已分享工具連結',
                });
            } catch (error: any) {
                if (error.name !== 'AbortError') {
                    handleCopyLink();
                }
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

            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
                {/* 頂部裝飾漸層 */}
                <div className={cn(
                    "absolute top-0 left-0 right-0 h-80 opacity-30 -z-10",
                    "bg-gradient-to-br",
                    gradient.bg
                )} />
                <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-b from-transparent to-white -z-10" />

                {/* 頂部導航列 */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-gray-200/50"
                >
                    <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
                        <motion.div whileHover={{ x: -4 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                variant="ghost"
                                onClick={() => navigate('/')}
                                className="gap-2 text-sm sm:text-base font-medium hover:bg-gray-100 rounded-xl"
                            >
                                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline">返回首頁</span>
                                <span className="sm:hidden">返回</span>
                            </Button>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                variant={isFav ? 'default' : 'outline'}
                                onClick={() => toggleFavorite(toolId)}
                                className={cn(
                                    "gap-2 rounded-xl px-4 sm:px-6 transition-all duration-300",
                                    isFav
                                        ? "bg-gradient-to-r from-red-500 to-pink-500 border-0 shadow-lg shadow-red-500/30"
                                        : "hover:border-red-200 hover:text-red-500"
                                )}
                            >
                                <motion.div
                                    animate={isFav ? { scale: [1, 1.3, 1] } : {}}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Heart className={cn('w-4 h-4 sm:w-5 sm:h-5', isFav && 'fill-current')} />
                                </motion.div>
                                <span className="hidden sm:inline font-medium">{isFav ? '已收藏' : '收藏'}</span>
                            </Button>
                        </motion.div>
                    </div>
                </motion.header>

                <motion.main
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="container mx-auto px-4 py-6 sm:py-10 space-y-8 sm:space-y-12"
                >
                    {/* Hero 區塊 */}
                    <motion.section variants={itemVariants} className="relative">
                        {/* 背景卡片 */}
                        <div className={cn(
                            "absolute inset-0 rounded-3xl sm:rounded-[2rem] -z-10",
                            "bg-white shadow-2xl",
                            gradient.border,
                            gradient.glow
                        )} />

                        <div className="p-5 sm:p-8 lg:p-10">
                            {/* 分類區 */}
                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className={cn(
                                        "inline-flex items-center gap-2 px-4 py-2 rounded-full",
                                        "bg-gradient-to-r text-white font-semibold shadow-lg",
                                        gradient.bg,
                                        gradient.glow
                                    )}
                                >
                                    <span className="text-lg">{catInfo.emoji}</span>
                                    <span>{catInfo.label}</span>
                                </motion.div>

                                {stats && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200"
                                    >
                                        <TrendingUp className="w-4 h-4 text-amber-500" />
                                        <span className="text-sm font-semibold text-amber-700">
                                            {stats.totalClicks.toLocaleString()} 次使用
                                        </span>
                                    </motion.div>
                                )}
                            </div>

                            {/* 工具標題區 */}
                            <div className="flex flex-col lg:flex-row lg:items-start gap-5 lg:gap-8 mb-8">
                                {/* 圖標 */}
                                {IconComponent && (
                                    <motion.div
                                        animate={floatAnimation}
                                        className={cn(
                                            "flex-shrink-0 p-4 sm:p-5 rounded-2xl sm:rounded-3xl",
                                            "bg-gradient-to-br shadow-2xl",
                                            gradient.bg,
                                            gradient.glow
                                        )}
                                    >
                                        <IconComponent className="w-10 h-10 sm:w-14 sm:h-14 text-white" />
                                    </motion.div>
                                )}

                                {/* 標題和描述 */}
                                <div className="flex-1 min-w-0">
                                    <h1 className={cn(
                                        "text-3xl sm:text-4xl lg:text-5xl font-black mb-4",
                                        "bg-gradient-to-r bg-clip-text text-transparent",
                                        gradient.text
                                    )}>
                                        {tool.title}
                                    </h1>
                                    <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-3xl">
                                        {tool.detailedDescription || tool.description}
                                    </p>
                                </div>
                            </div>

                            {/* 預覽圖 */}
                            {tool.previewUrl && (
                                <motion.div
                                    whileHover={{ scale: 1.01 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                    className={cn(
                                        "relative aspect-video rounded-2xl sm:rounded-3xl overflow-hidden mb-8",
                                        "bg-gradient-to-br from-gray-50 to-gray-100",
                                        "border-2 shadow-xl",
                                        gradient.border
                                    )}
                                >
                                    <picture>
                                        <source
                                            srcSet={`${import.meta.env.BASE_URL}${tool.previewUrl?.replace('.png', '.webp').replace(/^\//, '')}`}
                                            type="image/webp"
                                        />
                                        <img
                                            src={`${import.meta.env.BASE_URL}${tool.previewUrl?.startsWith('/') ? tool.previewUrl.slice(1) : tool.previewUrl}`}
                                            alt={tool.title}
                                            className="w-full h-full object-contain p-4 sm:p-8"
                                            loading="lazy"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    </picture>
                                </motion.div>
                            )}

                            {/* 行動按鈕區 */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* 主要 CTA */}
                                <motion.div
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex-1 sm:flex-none"
                                >
                                    <Button
                                        onClick={handleUseTool}
                                        size="lg"
                                        className={cn(
                                            "w-full sm:w-auto gap-3 text-lg py-7 px-8 rounded-2xl font-bold",
                                            "bg-gradient-to-r shadow-2xl",
                                            "hover:shadow-3xl transition-all duration-300",
                                            gradient.bg,
                                            gradient.glow
                                        )}
                                    >
                                        <motion.div
                                            animate={{ rotate: [0, 10, -10, 0] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            <Zap className="w-6 h-6" />
                                        </motion.div>
                                        立即使用
                                    </Button>
                                </motion.div>

                                {/* 次要按鈕 */}
                                <div className="flex gap-3">
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 sm:flex-none">
                                        <Button
                                            variant="outline"
                                            onClick={handleCopyLink}
                                            size="lg"
                                            className="w-full sm:w-auto gap-2 py-7 px-6 rounded-2xl font-semibold border-2 hover:bg-gray-50"
                                        >
                                            <Copy className="w-5 h-5" />
                                            <span className="hidden sm:inline">複製連結</span>
                                            <span className="sm:hidden">複製</span>
                                        </Button>
                                    </motion.div>

                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1 sm:flex-none">
                                        <Button
                                            variant="outline"
                                            onClick={handleShare}
                                            size="lg"
                                            className="w-full sm:w-auto gap-2 py-7 px-6 rounded-2xl font-semibold border-2 hover:bg-gray-50"
                                        >
                                            <Share2 className="w-5 h-5" />
                                            <span className="hidden sm:inline">分享</span>
                                        </Button>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* 使用統計區 */}
                    {(stats || statsLoading) && (
                        <motion.section variants={itemVariants} className="grid grid-cols-2 gap-4 sm:gap-6">
                            {/* 累計使用次數 */}
                            <motion.div
                                whileHover={{ scale: 1.02, y: -4 }}
                                className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white border-2 border-blue-100 shadow-lg p-5 sm:p-8"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-transparent rounded-bl-full opacity-50" />

                                {statsLoading ? (
                                    <Skeleton className="h-20 w-full" />
                                ) : (
                                    <div className="relative z-10 text-center">
                                        <motion.div
                                            animate={floatAnimation}
                                            className="inline-flex p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30 mb-4"
                                        >
                                            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                        </motion.div>
                                        <div className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                                            <AnimatedNumber value={stats?.totalClicks || 0} />
                                        </div>
                                        <div className="text-sm sm:text-base text-muted-foreground mt-2 font-medium">累計使用次數</div>
                                    </div>
                                )}
                            </motion.div>

                            {/* 最後使用時間 */}
                            <motion.div
                                whileHover={{ scale: 1.02, y: -4 }}
                                className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white border-2 border-emerald-100 shadow-lg p-5 sm:p-8"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100 to-transparent rounded-bl-full opacity-50" />

                                {statsLoading ? (
                                    <Skeleton className="h-20 w-full" />
                                ) : (
                                    <div className="relative z-10 text-center">
                                        <motion.div
                                            animate={floatAnimation}
                                            className="inline-flex p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 shadow-lg shadow-emerald-500/30 mb-4"
                                        >
                                            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                        </motion.div>
                                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-600">
                                            {stats?.lastUsedAt
                                                ? new Date(stats.lastUsedAt.toDate()).toLocaleDateString('zh-TW')
                                                : '尚無紀錄'}
                                        </div>
                                        <div className="text-sm sm:text-base text-muted-foreground mt-2 font-medium">最後使用日期</div>
                                    </div>
                                )}
                            </motion.div>
                        </motion.section>
                    )}

                    {/* 評論區塊 */}
                    <motion.section variants={itemVariants}>
                        <ReviewList toolId={tool.id} toolTitle={tool.title} />
                    </motion.section>

                    {/* 相關推薦 */}
                    <RelatedTools currentTool={tool} tools={allTools || []} />

                    {/* 麵包屑導航 */}
                    <motion.nav
                        variants={itemVariants}
                        className="flex flex-wrap items-center gap-2 px-4 py-4 rounded-2xl bg-gray-50 text-sm sm:text-base"
                    >
                        <Link href="/" className="hover:text-primary transition-colors font-medium flex items-center gap-1">
                            🏠 <span className="hidden sm:inline">首頁</span>
                        </Link>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span className="text-muted-foreground">{catInfo.emoji} {catInfo.label}</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span className={cn(
                            "font-semibold bg-gradient-to-r bg-clip-text text-transparent",
                            gradient.text
                        )}>
                            {tool.title}
                        </span>
                    </motion.nav>
                </motion.main>
            </div>
        </>
    );
}

export default ToolDetail;
