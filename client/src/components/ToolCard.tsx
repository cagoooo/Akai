import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BarChart, Heart, Info, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { iconRegistry, type IconName } from "@/lib/iconRegistry";
import { categoryInfo, getCategoryColorClass } from "@/lib/categoryConstants";
import type { EducationalTool, ToolCategory } from "@/lib/data";
import type { LucideIcon } from 'lucide-react';

// 擴展 EducationalTool 類型，添加可能從後端返回的屬性
interface EnhancedTool extends EducationalTool {
  totalClicks?: number;
}
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useToolTracking } from "@/hooks/useToolTracking";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Enhanced category colors with hover states and transitions
const categoryColors = {
  communication: {
    badge: "bg-blue-100 text-blue-800",
    hover: "from-blue-50/50 to-blue-100/50",
    border: "group-hover:border-blue-200",
    icon: "group-hover:text-blue-600",
    gradient: "var(--communication-gradient)",
    bg: "bg-gradient-to-br from-blue-50 to-blue-100/50",
  },
  teaching: {
    badge: "bg-green-100 text-green-800",
    hover: "from-green-50/50 to-green-100/50",
    border: "group-hover:border-green-200",
    icon: "group-hover:text-green-600",
    gradient: "var(--teaching-gradient)",
    bg: "bg-gradient-to-br from-green-50 to-green-100/50",
  },
  language: {
    badge: "bg-purple-100 text-purple-800",
    hover: "from-purple-50/50 to-purple-100/50",
    border: "group-hover:border-purple-200",
    icon: "group-hover:text-purple-600",
    gradient: "var(--language-gradient)",
    bg: "bg-gradient-to-br from-purple-50 to-purple-100/50",
  },
  reading: {
    badge: "bg-yellow-100 text-yellow-800",
    hover: "from-yellow-50/50 to-yellow-100/50",
    border: "group-hover:border-yellow-200",
    icon: "group-hover:text-yellow-600",
    gradient: "var(--reading-gradient)",
    bg: "bg-gradient-to-br from-yellow-50 to-yellow-100/50",
  },
  utility: {
    badge: "bg-gray-100 text-gray-800",
    hover: "from-gray-50/50 to-gray-100/50",
    border: "group-hover:border-gray-200",
    icon: "group-hover:text-gray-600",
    gradient: "var(--utility-gradient)",
    bg: "bg-gradient-to-br from-gray-50 to-gray-100/50",
  },
  games: {
    badge: "bg-pink-100 text-pink-800",
    hover: "from-pink-50/50 to-pink-100/50",
    border: "group-hover:border-pink-200",
    icon: "group-hover:text-pink-600",
    gradient: "var(--games-gradient)",
    bg: "bg-gradient-to-br from-pink-50 to-pink-100/50",
  },
  interactive: {
    badge: "bg-cyan-100 text-cyan-800",
    hover: "from-cyan-50/50 to-cyan-100/50",
    border: "group-hover:border-cyan-200",
    icon: "group-hover:text-cyan-600",
    gradient: "var(--interactive-gradient)",
    bg: "bg-gradient-to-br from-cyan-50 to-cyan-100/50",
  },
} as const;

interface ToolCardProps {
  tool: EducationalTool;
  isLoading?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (toolId: number) => void;
  onToolClick?: (toolId: number) => void;
}

export function ToolCard({ tool: initialTool, isLoading = false, isFavorite = false, onToggleFavorite, onToolClick }: ToolCardProps) {
  const queryClient = useQueryClient();
  const [tool, setTool] = useState<EnhancedTool>(initialTool);
  const Icon = iconRegistry[tool.icon as IconName] as LucideIcon;
  const { toast } = useToast();
  const catInfo = categoryInfo[tool.category as ToolCategory];
  const colors = categoryColors[tool.category as keyof typeof categoryColors];

  // Get usage statistics for this tool
  const { data: usageStats } = useQuery({
    queryKey: ['/api/tools/stats'],
    select: (data: unknown) => {
      if (Array.isArray(data)) {
        return data.find((stat: any) => stat.toolId === tool.id);
      }
      return undefined;
    },
  });

  // 使用共用的工具追蹤鉤子
  const { trackToolUsage } = useToolTracking();

  // 使用 mutation 作為後備機制
  const trackUsage = useMutation({
    mutationFn: async () => {
      return await trackToolUsage(tool.id);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['/api/tools/stats'],
        refetchType: 'active'
      });
      queryClient.invalidateQueries({
        queryKey: ['/api/tools/rankings'],
        refetchType: 'active'
      });
    },
    onError: (error) => {
      console.error('工具卡片點擊錯誤:', tool.id, error);
    }
  });


  // 改進點擊處理部分 - 確保點擊後一定會開啟新視窗
  const handleClick = () => {
    try {
      const newWindow = window.open(tool.url, '_blank', 'noopener,noreferrer');
      if (newWindow) {
        newWindow.opener = null;
      }

      trackToolUsage(tool.id)
        .then(result => {
          if (result?.totalClicks) {
            setTool(prevTool => ({
              ...prevTool,
              totalClicks: result.totalClicks
            }));
          }
        })
        .catch(error => {
          console.error('工具使用追蹤失敗:', error);
        });
    } catch (error) {
      console.error('開啟工具失敗:', error);
      toast({
        title: "開啟工具失敗",
        description: "無法開啟工具連結，請嘗試使用複製連結按鈕",
        variant: "destructive",
      });
    }
  };


  return (
    <TooltipProvider>
      <motion.article
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        itemScope
        itemType="https://schema.org/EducationalApplication"
        className="h-full"
      >
        <meta itemProp="name" content={tool.title} />
        <meta itemProp="description" content={tool.description} />
        <meta itemProp="applicationCategory" content={tool.category} />
        <meta itemProp="url" content={tool.url} />

        <Card
          className={cn(
            "group h-full hover:shadow-xl transition-all duration-300 cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            "overflow-hidden border-2 rounded-2xl",
            "hover:border-primary/30",
            colors?.bg || "bg-white"
          )}
          onClick={handleClick}
          tabIndex={isLoading ? -1 : 0}
          role={isLoading ? "presentation" : "button"}
          aria-label={isLoading ? undefined : `開啟 ${tool.title} 工具詳細資訊`}
        >
          <CardContent className="p-4 sm:p-5 h-full flex flex-col">
            {/* 頂部：圖標 + 收藏 + 詳情 + 分類 */}
            <header className="flex items-start justify-between gap-2 mb-3">
              {isLoading ? (
                <Skeleton className="w-12 h-12 rounded-xl" />
              ) : (
                <motion.div
                  className={cn(
                    "p-2.5 sm:p-3 rounded-xl",
                    "bg-white/80 shadow-sm",
                    "transition-all duration-300"
                  )}
                  whileHover={{ rotate: [0, -10, 10, -5, 5, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  {Icon && <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />}
                </motion.div>
              )}

              <div className="flex items-center gap-1.5 sm:gap-2">
                {isLoading ? (
                  <>
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <Skeleton className="w-10 h-10 rounded-lg" />
                  </>
                ) : (
                  <>
                    {/* 收藏按鈕 - 更大更好點 */}
                    {onToggleFavorite && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={isFavorite ? "default" : "outline"}
                            size="icon"
                            className={cn(
                              "h-10 w-10 sm:h-11 sm:w-11 rounded-xl transition-all",
                              isFavorite
                                ? "bg-red-500 hover:bg-red-600 border-red-500"
                                : "hover:bg-red-50 hover:border-red-200"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleFavorite(tool.id);
                            }}
                            aria-label={isFavorite ? "取消收藏" : "加入收藏"}
                          >
                            <Heart
                              className={cn(
                                "h-5 w-5 sm:h-6 sm:w-6 transition-colors",
                                isFavorite ? 'fill-white text-white' : 'text-red-400'
                              )}
                            />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isFavorite ? '取消收藏' : '加入收藏'}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}

                    {/* 詳情按鈕 */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href={`/tool/${tool.id}`}>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl hover:bg-primary/10 hover:border-primary/30"
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`查看 ${tool.title} 詳情`}
                          >
                            <Info className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>查看詳情</p>
                      </TooltipContent>
                    </Tooltip>

                    {/* 分類標籤 */}
                    <Badge
                      variant="secondary"
                      className={cn(
                        getCategoryColorClass(tool.category as ToolCategory),
                        "border-0 px-2.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg"
                      )}
                    >
                      {catInfo?.emoji} <span className="hidden sm:inline ml-1">{catInfo?.label}</span>
                    </Badge>
                  </>
                )}
              </div>
            </header>

            {/* 主要內容區 */}
            <main className="flex-1 flex flex-col">
              {isLoading ? (
                <>
                  <Skeleton className="w-3/4 h-8 mb-2" />
                  <Skeleton className="w-full h-4 mb-2" />
                  <Skeleton className="w-5/6 h-4 mb-4" />
                </>
              ) : (
                <>
                  {/* 工具標題 - 更大更清楚 */}
                  <CardTitle
                    className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 line-clamp-2"
                    itemProp="name"
                  >
                    {tool.title}
                  </CardTitle>

                  {/* 工具描述 - 更清楚 */}
                  <CardDescription
                    className="text-sm sm:text-base text-gray-600 mb-3 line-clamp-2 sm:line-clamp-3 flex-1"
                    itemProp="description"
                  >
                    {tool.description}
                  </CardDescription>

                  {/* 標籤顯示 */}
                  {tool.tags && tool.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {tool.tags.slice(0, 4).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                          #{tag}
                        </span>
                      ))}
                      {tool.tags.length > 4 && (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-gray-50 text-gray-400">
                          +{tool.tags.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* 預覽圖 */}
              {tool.previewUrl && (
                <figure className="mb-4">
                  <AspectRatio ratio={16 / 9} className="bg-white rounded-xl overflow-hidden border shadow-sm">
                    {isLoading ? (
                      <Skeleton className="w-full h-full" />
                    ) : (
                      <motion.div
                        className="w-full h-full relative"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      >
                        <img
                          src={`${import.meta.env.BASE_URL}${tool.previewUrl?.startsWith('/') ? tool.previewUrl.slice(1) : tool.previewUrl}`}
                          alt={`${tool.title} 預覽圖`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </motion.div>
                    )}
                  </AspectRatio>
                </figure>
              )}

              {/* 底部：開啟按鈕 + 使用次數 */}
              {!isLoading && (
                <div className="flex items-center justify-between gap-3 mt-auto pt-3 border-t border-gray-100">
                  {/* 開啟新視窗按鈕 - 更大更吸睛 */}
                  <Button
                    variant="default"
                    size="lg"
                    className={cn(
                      "flex-1 gap-2 text-sm sm:text-base font-semibold py-5 sm:py-6 rounded-xl",
                      "bg-gradient-to-r from-primary to-indigo-600",
                      "hover:from-primary/90 hover:to-indigo-600/90",
                      "shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30",
                      "transition-all duration-300"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClick();
                    }}
                  >
                    <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
                    開啟使用
                  </Button>

                  {/* 使用次數 */}
                  {(usageStats || tool.totalClicks) && (
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground bg-gray-100 px-3 py-2 rounded-lg">
                      <BarChart className="w-4 h-4" />
                      <span className="font-medium">{tool.totalClicks || usageStats?.totalClicks || 0}</span>
                      <span className="hidden sm:inline">次</span>
                    </div>
                  )}
                </div>
              )}
            </main>
          </CardContent>
        </Card>
      </motion.article>
    </TooltipProvider>
  );
}