/**
 * 新工具通知橫幅元件
 * 顯示新上線的工具並提供快速導航
 */

import { useNewToolsNotification } from '@/hooks/useNewToolsNotification';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Sparkles, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'wouter';

export function NewToolsBanner() {
    const { newTools, hasNewTools, markAllAsRead, dismissTool } = useNewToolsNotification();
    const [isExpanded, setIsExpanded] = useState(false);

    if (!hasNewTools) return null;

    const displayTools = isExpanded ? newTools : newTools.slice(0, 2);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6"
            >
                <Card className="border-green-500/30 bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-teal-500/5 overflow-hidden">
                    <CardContent className="p-4">
                        {/* 標題列 */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-green-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-green-700 dark:text-green-400">
                                        🎉 新工具上線！
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        {newTools.length} 個新工具等您探索
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={markAllAsRead}
                                className="text-xs"
                            >
                                全部標為已讀
                            </Button>
                        </div>

                        {/* 新工具列表 */}
                        <div className="space-y-2">
                            {displayTools.map((tool, index) => (
                                <motion.div
                                    key={tool.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center gap-3 p-2 rounded-lg bg-background/50 hover:bg-background/80 transition-colors group"
                                >
                                    <div className="text-2xl">{tool.icon}</div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-sm truncate">{tool.title}</h4>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {tool.description}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Link href={`/tool/${tool.id}`}>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                查看 <ArrowRight className="w-3 h-3 ml-1" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => dismissTool(tool.id)}
                                        >
                                            <X className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* 展開/收合按鈕 */}
                        {newTools.length > 2 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="w-full mt-2 text-xs"
                            >
                                {isExpanded ? (
                                    <>
                                        <ChevronUp className="w-3 h-3 mr-1" />
                                        收合
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="w-3 h-3 mr-1" />
                                        顯示全部 {newTools.length} 個
                                    </>
                                )}
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </AnimatePresence>
    );
}
