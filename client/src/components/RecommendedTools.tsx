/**
 * 智慧推薦區塊元件
 * 顯示個人化推薦工具
 */

import { useState } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Heart, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { useRecommendations } from '@/hooks/useRecommendations';
import { useFavorites } from '@/hooks/useFavorites';
import { ToolCard } from './ToolCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RecommendedToolsProps {
    tools?: any[]; // 使用 EducationalTool[] 但為了避免循環引用或複雜性，這裡可以用 any[] 或從 Prop 傳入
    onToolClick?: (toolId: number) => void;
    className?: string;
}

export function RecommendedTools({ tools: toolsProp, onToolClick, className }: RecommendedToolsProps) {
    const { recommendations, isPersonalized, hasRecommendations } = useRecommendations(toolsProp || [], 3);
    const { isFavorite, toggleFavorite } = useFavorites();
    const [isCollapsed, setIsCollapsed] = useState(true);

    if (!hasRecommendations) {
        return null;
    }

    return (
        <section
            className={cn(
                "p-4 sm:p-5 rounded-2xl",
                "bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50",
                "border border-purple-100",
                className
            )}
        >
            {/* 標題區 */}
            <div
                className="flex items-center justify-between mb-4 cursor-pointer select-none"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <div className="flex items-center gap-2">
                    <motion.div
                        className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/25"
                        animate={{
                            scale: [1, 1.05, 1],
                            rotate: [0, 5, -5, 0],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        {isPersonalized ? (
                            <Sparkles className="w-5 h-5 text-white" />
                        ) : (
                            <TrendingUp className="w-5 h-5 text-white" />
                        )}
                    </motion.div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                            {isPersonalized ? '🎯 為您推薦' : '🔥 熱門工具'}
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            {isPersonalized
                                ? '根據您的使用習慣，智慧推薦以下工具'
                                : '探索平台上最受歡迎的教育工具'}
                        </p>
                    </div>
                </div>

                {/* 個人化標籤與收合按鈕 */}
                <div className="flex items-center gap-2">
                    {isPersonalized && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 text-xs font-medium text-purple-700"
                        >
                            <Lightbulb className="w-3 h-3" />
                            AI 推薦
                        </motion.div>
                    )}
                    <Button variant="ghost" size="sm" className="p-0 h-8 w-8 hover:bg-purple-100/50 rounded-full">
                        {isCollapsed ? <ChevronDown className="w-5 h-5 text-purple-600" /> : <ChevronUp className="w-5 h-5 text-purple-600" />}
                    </Button>
                </div>
            </div>

            <AnimatePresence>
                {!isCollapsed && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        {/* 推薦卡片網格 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pb-1">
                            {recommendations.slice(0, 3).map((tool, index) => (
                                <motion.div
                                    key={tool.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="relative"
                                >
                                    {/* 推薦原因標籤 */}
                                    <div className="absolute -top-2 left-3 z-10">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white shadow-sm border text-[10px] font-medium text-purple-600">
                                            {tool.reason === '熱門工具' && <TrendingUp className="w-3 h-3" />}
                                            {tool.reason.includes('收藏') && <Heart className="w-3 h-3" />}
                                            {tool.reason.includes('興趣') && <Sparkles className="w-3 h-3" />}
                                            {tool.reason.includes('喜歡') && <Sparkles className="w-3 h-3" />}
                                            {tool.reason}
                                        </span>
                                    </div>

                                    <ToolCard
                                        tool={tool}
                                        isLoading={false}
                                        isFavorite={isFavorite(tool.id)}
                                        onToggleFavorite={toggleFavorite}
                                        onToolClick={onToolClick}
                                    />
                                </motion.div>
                            ))}
                        </div>

                        {/* 個人化提示 */}
                        {!isPersonalized && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="mt-4 text-center"
                            >
                                <p className="text-sm text-muted-foreground">
                                    💡 開始使用工具後，我們會根據您的偏好提供更精準的推薦
                                </p>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
