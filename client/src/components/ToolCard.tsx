import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { QRCodeSVG } from 'qrcode.react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Link } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { OptimizedIcon } from "@/components/OptimizedIcons";
import { categoryInfo, getCategoryColorClass } from "@/lib/categoryConstants";
import type { EducationalTool, ToolCategory } from "@/lib/data";

// 擴展 EducationalTool 類型，添加可能從後端返回的屬性
interface EnhancedTool extends EducationalTool {
  totalClicks?: number;
}
import { m as motion } from 'framer-motion';
import { Skeleton } from "@/components/ui/skeleton";
import { useToolTracking } from "@/hooks/useToolTracking";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { isInAppBrowser } from "@/lib/browserDetection";
import { useInView } from "react-intersection-observer";

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

// 為標籤建立繽紛多彩的顏色調色盤
const tagColorPalette = [
  { bg: "bg-gradient-to-r from-pink-100 to-rose-100", text: "text-pink-700", border: "border-pink-200", hover: "hover:from-pink-200 hover:to-rose-200" },
  { bg: "bg-gradient-to-r from-purple-100 to-violet-100", text: "text-purple-700", border: "border-purple-200", hover: "hover:from-purple-200 hover:to-violet-200" },
  { bg: "bg-gradient-to-r from-indigo-100 to-blue-100", text: "text-indigo-700", border: "border-indigo-200", hover: "hover:from-indigo-200 hover:to-blue-200" },
  { bg: "bg-gradient-to-r from-cyan-100 to-teal-100", text: "text-cyan-700", border: "border-cyan-200", hover: "hover:from-cyan-200 hover:to-teal-200" },
  { bg: "bg-gradient-to-r from-emerald-100 to-green-100", text: "text-emerald-700", border: "border-emerald-200", hover: "hover:from-emerald-200 hover:to-green-200" },
  { bg: "bg-gradient-to-r from-lime-100 to-yellow-100", text: "text-lime-700", border: "border-lime-200", hover: "hover:from-lime-200 hover:to-yellow-200" },
  { bg: "bg-gradient-to-r from-amber-100 to-orange-100", text: "text-amber-700", border: "border-amber-200", hover: "hover:from-amber-200 hover:to-orange-200" },
  { bg: "bg-gradient-to-r from-red-100 to-rose-100", text: "text-red-700", border: "border-red-200", hover: "hover:from-red-200 hover:to-rose-200" },
  { bg: "bg-gradient-to-r from-fuchsia-100 to-pink-100", text: "text-fuchsia-700", border: "border-fuchsia-200", hover: "hover:from-fuchsia-200 hover:to-pink-200" },
  { bg: "bg-gradient-to-r from-sky-100 to-blue-100", text: "text-sky-700", border: "border-sky-200", hover: "hover:from-sky-200 hover:to-blue-200" },
  { bg: "bg-gradient-to-r from-teal-100 to-emerald-100", text: "text-teal-700", border: "border-teal-200", hover: "hover:from-teal-200 hover:to-emerald-200" },
  { bg: "bg-gradient-to-r from-orange-100 to-amber-100", text: "text-orange-700", border: "border-orange-200", hover: "hover:from-orange-200 hover:to-amber-200" },
] as const;

// 根據標籤名稱取得一致的顏色索引
const getTagColorIndex = (tag: string): number => {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    const char = tag.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) % tagColorPalette.length;
};

// 取得標籤顏色樣式
const getTagColors = (tag: string) => {
  const index = getTagColorIndex(tag);
  return tagColorPalette[index];
};

interface ToolCardProps {
  tool: EducationalTool;
  isLoading?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (toolId: number) => void;
  onToolClick?: (toolId: number) => void;
  priority?: boolean;
}

export function ToolCard({ tool: initialTool, isLoading = false, isFavorite = false, onToggleFavorite, onToolClick, priority = false }: ToolCardProps) {
  const queryClient = useQueryClient();
  const [tool, setTool] = useState<EnhancedTool>(initialTool);
  const { toast } = useToast();
  const catInfo = categoryInfo[tool.category as ToolCategory];
  const colors = categoryColors[tool.category as keyof typeof categoryColors];

  // Intersection observer for image lazy loading
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px 0px', // 提前 200px 開始加載
    skip: priority || isLoading, // 如果是優先加載或正在加載骨架，則跳過
  });

  // Determine if we should show the image
  const shouldShowImage = priority || inView;

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


  // 改進點擊處理部分 - 採用隱藏 <a> 標籤模擬點擊以避免 window.open 被阻擋或誤判
  const handleClick = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // 先追蹤使用記錄（非同步）
    trackToolUsage(tool.id)
      .then(result => {
        if (result?.totalClicks) {
          setTool(prevTool => ({
            ...prevTool,
            totalClicks: result.totalClicks
          }));
        }
      })
      .catch(error => console.error('工具使用追蹤失敗:', error));

    try {
      // LINE 等內建瀏覽器會阻擋新視窗，改用直接跳轉
      if (isInAppBrowser()) {
        window.location.href = tool.url;
      } else {
        // 使用 <a> 標籤模擬點擊是開新分頁最穩定的做法
        const link = document.createElement('a');
        link.href = tool.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('開啟工具失敗:', error);
      // 極端情況下的回退
      window.location.href = tool.url;
    }
  };


  return (
    <motion.article
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
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
        <CardContent className="p-4 sm:p-5 min-h-[460px] h-full flex flex-col">
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
                {tool.icon && <OptimizedIcon name={tool.icon} className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />}
              </motion.div>
            )}

            <div className="flex items-center gap-1.5 sm:gap-2">
              {isLoading ? (
                <>
                  <Skeleton className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl" />
                  <Skeleton className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl" />
                  <Skeleton className="w-12 h-8 rounded-lg" />
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
                          <OptimizedIcon
                            name="Heart"
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
                          <OptimizedIcon name="Info" className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>查看詳情</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* 複製連結按鈕 */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl hover:bg-primary/10 hover:border-primary/30"
                        onClickCapture={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          navigator.clipboard.writeText(tool.url);
                          toast({ title: "✅ 複製成功", description: "工具網址已經複製到剪貼簿！" });
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        aria-label="複製連結"
                      >
                        <OptimizedIcon name="Link2" className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>複製連結</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* QRCode 彈窗 */}
                  <Dialog>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl hover:bg-primary/10 hover:border-primary/30"
                              onClickCapture={(e) => {
                                // 使用 onClickCapture 強制在捕獲階段就攔截事件，防止任何冒泡到外層 Card
                                e.stopPropagation();
                                e.preventDefault();
                              }}
                              aria-label="顯示 QRCode"
                            >
                              <OptimizedIcon name="QrCode" className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                            </Button>
                          </DialogTrigger>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>投影 QRCode</p>
                      </TooltipContent>
                    </Tooltip>

                    <DialogContent aria-describedby={`dialog-desc-${tool.id}`} onClick={(e) => e.stopPropagation()} className="sm:max-w-md flex flex-col items-center justify-center p-8 border-2 border-indigo-100/50 shadow-xl rounded-3xl">
                      <DialogHeader className="w-full text-center mb-2">
                        <DialogTitle className="text-2xl font-bold text-indigo-950">{tool.title}</DialogTitle>
                        <DialogDescription id={`dialog-desc-${tool.id}`} className="sr-only">
                          供學生掃描以進入 {tool.title} 工具的 QRCode 條碼
                        </DialogDescription>
                      </DialogHeader>
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-50 flex items-center justify-center">
                        <QRCodeSVG value={tool.url} size={256} level="H" includeMargin={true} />
                      </div>
                      <p className="text-sm font-medium text-indigo-900/60 mt-4 text-center">
                        請學生開啟載具相機掃描此條碼即可進入
                      </p>
                    </DialogContent>
                  </Dialog>

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
                <Skeleton className="w-3/4 h-8 sm:h-10 mb-2 mt-1" />
                <Skeleton className="w-full h-12 sm:h-16 mb-4" />
              </>
            ) : (
              <>
                {/* 工具標題 - 鎖定高度以防 CLS */}
                <CardTitle
                  className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem] flex items-center"
                  itemProp="name"
                >
                  {tool.title}
                </CardTitle>

                {/* 工具描述 - 鎖定高度以防 CLS */}
                <CardDescription
                  className="text-sm sm:text-base text-gray-600 mb-3 line-clamp-2 sm:line-clamp-3 min-h-[4rem]"
                  itemProp="description"
                >
                  {tool.description}
                </CardDescription>

                {/* 繽紛多彩標籤顯示 */}
                {tool.tags && tool.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
                    {tool.tags.slice(0, 4).map((tag, index) => {
                      const tagColors = getTagColors(tag);
                      return (
                        <span
                          key={index}
                          className={cn(
                            "inline-flex items-center",
                            "px-2 py-0.5 sm:px-2.5 sm:py-1",
                            "text-[10px] sm:text-xs font-semibold",
                            "rounded-full border shadow-sm",
                            "transition-all duration-200 ease-in-out",
                            "hover:scale-105 hover:shadow-md",
                            tagColors.bg,
                            tagColors.text,
                            tagColors.border,
                            tagColors.hover
                          )}
                        >
                          <span className="opacity-70 mr-0.5">#</span>{tag}
                        </span>
                      );
                    })}
                    {tool.tags.length > 4 && (
                      <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full bg-gradient-to-r from-gray-100 to-slate-100 text-gray-500 border border-gray-200">
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
                    <div ref={ref} className="w-full h-full relative group-hover:scale-105 transition-transform duration-300">
                      {shouldShowImage && (
                        <picture>
                          <source
                            srcSet={`${import.meta.env.BASE_URL}previews/${tool.previewUrl?.split('/').pop()?.replace('.png', '.webp')}`}
                            type="image/webp"
                          />
                          <img
                            src={`${import.meta.env.BASE_URL}previews/${tool.previewUrl?.split('/').pop()}`}
                            alt={`${tool.title} 預覽圖`}
                            className="w-full h-full object-cover"
                            loading={priority ? "eager" : "lazy"}
                            {...(priority ? { fetchpriority: "high" } : {})}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </picture>
                      )}
                      {!shouldShowImage && <Skeleton className="w-full h-full" />}
                    </div>
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
                  <OptimizedIcon name="ExternalLink" className="h-5 w-5 sm:h-6 sm:w-6" />
                  開啟使用
                </Button>

                {/* 使用次數 */}
                {(usageStats || tool.totalClicks) && (
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground bg-gray-100 px-3 py-2 rounded-lg">
                    <OptimizedIcon name="BarChart" className="w-4 h-4" />
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
  );
}