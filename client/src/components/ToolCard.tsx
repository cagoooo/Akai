import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Share2, Users, Settings2, Facebook as FacebookIcon, Linkedin as LinkedinIcon, MessageCircle, BarChart, Copy } from "lucide-react";
import { useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Icons from "lucide-react";
import type { EducationalTool } from "@/lib/data";
import type { LucideIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PreviewGenerator } from "@/components/PreviewGenerator";
import { IconCustomizer, type IconCustomization } from "@/components/IconCustomizer";
import { CustomizationTutorialProvider } from "./CustomizationTutorial";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { SocialPreviewImage } from "./SocialPreviewImage";
import { generateShareUrls } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useToolTracking } from "@/hooks/useToolTracking";

// Enhanced category colors with hover states and transitions
const categoryColors = {
  communication: {
    badge: "bg-blue-100 text-blue-800",
    hover: "from-blue-50/50 to-blue-100/50",
    border: "group-hover:border-blue-200",
    icon: "group-hover:text-blue-600",
    gradient: "var(--communication-gradient)",
  },
  teaching: {
    badge: "bg-green-100 text-green-800",
    hover: "from-green-50/50 to-green-100/50",
    border: "group-hover:border-green-200",
    icon: "group-hover:text-green-600",
    gradient: "var(--teaching-gradient)",
  },
  language: {
    badge: "bg-purple-100 text-purple-800",
    hover: "from-purple-50/50 to-purple-100/50",
    border: "group-hover:border-purple-200",
    icon: "group-hover:text-purple-600",
    gradient: "var(--language-gradient)",
  },
  reading: {
    badge: "bg-yellow-100 text-yellow-800",
    hover: "from-yellow-50/50 to-yellow-100/50",
    border: "group-hover:border-yellow-200",
    icon: "group-hover:text-yellow-600",
    gradient: "var(--reading-gradient)",
  },
  utilities: {
    badge: "bg-gray-100 text-gray-800",
    hover: "from-gray-50/50 to-gray-100/50",
    border: "group-hover:border-gray-200",
    icon: "group-hover:text-gray-600",
    gradient: "var(--utilities-gradient)",
  },
  games: {
    badge: "bg-pink-100 text-pink-800",
    hover: "from-pink-50/50 to-pink-100/50",
    border: "group-hover:border-pink-200",
    icon: "group-hover:text-pink-600",
    gradient: "var(--games-gradient)",
  },
  interactive: {
    badge: "bg-cyan-100 text-cyan-800",
    hover: "from-cyan-50/50 to-cyan-100/50",
    border: "group-hover:border-cyan-200",
    icon: "group-hover:text-cyan-600",
    gradient: "var(--interactive-gradient)",
  },
} as const;

interface ToolCardProps {
  tool: EducationalTool;
  isLoading?: boolean;
}

export function ToolCard({ tool, isLoading = false }: ToolCardProps) {
  const queryClient = useQueryClient();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [customization, setCustomization] = useState<IconCustomization | undefined>();
  const [isPreviewLoading, setIsPreviewLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string>();
  const Icon = Icons[tool.icon as keyof typeof Icons] as LucideIcon;
  const { toast } = useToast();

  // Get usage statistics for this tool
  const { data: usageStats } = useQuery({
    queryKey: ['/api/tools/stats'],
    select: (data) => data.find((stat: any) => stat.toolId === tool.id),
  });

  // 使用共用的工具追蹤鉤子
  const { trackToolUsage } = useToolTracking();

  // 使用 mutation 作為後備機制
  const trackUsage = useMutation({
    mutationFn: async () => {
      console.log('工具卡片點擊:', tool.id);
      return await trackToolUsage(tool.id);
    },
    onSuccess: (data) => {
      console.log('工具卡片點擊成功:', tool.id, data);
      // 成功後確保數據被刷新，但使用 active 模式避免過多請求
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

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsShareOpen(true);
  };

  const handleCustomize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCustomizeOpen(true);
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(tool.url);
      toast({
        title: "複製成功",
        description: "已將連結複製到剪貼簿",
      });
    } catch (error) {
      toast({
        title: "複製失敗",
        description: "無法複製連結，請手動複製",
        variant: "destructive",
      });
    }
  };

  const getShareUrls = useCallback((previewUrl?: string) => {
    // 直接使用 tool.url，不需要添加 baseUrl
    const url = tool.url;
    const text = `Check out ${tool.title} - ${tool.description}`;

    return generateShareUrls({
      url,
      title: tool.title,
      text,
      description: tool.description,
      image: previewUrl
    });
  }, [tool]);

  return (
    <TooltipProvider>
      <motion.article
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        itemScope
        itemType="https://schema.org/EducationalApplication"
      >
        <meta itemProp="name" content={tool.title} />
        <meta itemProp="description" content={tool.description} />
        <meta itemProp="applicationCategory" content={tool.category} />
        <meta itemProp="url" content={tool.url} />

        <Card
          className={`group hover:shadow-lg transition-all duration-500 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary overflow-hidden border-2 ${categoryColors[tool.category].border} hover:bg-gradient-to-br`}
          onClick={() => {
            // 立即開啟工具連結
            window.open(tool.url, '_blank', 'noopener,noreferrer');

            // 同時在後台記錄工具使用
            trackUsage.mutate(undefined, {
              onSuccess: () => {
                console.log('工具使用已記錄');
              }
            });
          }}
          tabIndex={isLoading ? -1 : 0}
          role={isLoading ? "presentation" : "button"}
          aria-label={isLoading ? undefined : `開啟 ${tool.title} 工具詳細資訊`}
        >
          <CardContent className="p-6 relative">
            <header className="flex items-start justify-between mb-4">
              {isLoading ? (
                <Skeleton className="w-10 h-10 rounded-lg" />
              ) : (
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div
                        className={`p-2 rounded-lg bg-primary/10 transition-all duration-300 ${categoryColors[tool.category].icon}`}
                        whileHover={{ rotate: [0, -10, 10, -5, 5, 0] }}
                        transition={{ duration: 0.5 }}
                        role="img"
                        aria-label={`${tool.title} 圖標`}
                      >
                        {Icon && <Icon className="w-6 h-6 transition-colors duration-300" aria-hidden="true" />}
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{tool.title}</p>
                    </TooltipContent>
                  </Tooltip>
                  {usageStats && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1 px-2 py-1"
                      title="使用次數"
                    >
                      <BarChart className="w-3 h-3" aria-hidden="true" />
                      <span>{usageStats.totalClicks} 次使用</span>
                    </Badge>
                  )}
                </div>
              )}
              <div className="flex gap-2">
                {isLoading ? (
                  <>
                    <Skeleton className="w-8 h-8 rounded" />
                    <Skeleton className="w-8 h-8 rounded" />
                    <Skeleton className="w-20 h-8 rounded" />
                  </>
                ) : (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 transition-colors duration-300 ${categoryColors[tool.category].icon}`}
                          onClick={handleCustomize}
                          data-customization="icon-settings"
                          aria-label={`自定義 ${tool.title} 圖標`}
                        >
                          <Settings2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>自定義圖標</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 transition-colors duration-300 ${categoryColors[tool.category].icon}`}
                          onClick={handleShare}
                          data-tour="share-button"
                          aria-label={`分享 ${tool.title}`}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>分享並協作</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="secondary"
                          className={`${categoryColors[tool.category].badge} border-0 transition-colors duration-300`}
                        >
                          <span className="sr-only">工具類別：</span>
                          {tool.category}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>工具類別：{tool.category}</p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}
              </div>
            </header>

            <main>
              {isLoading ? (
                <>
                  <Skeleton className="w-3/4 h-7 mb-2" />
                  <Skeleton className="w-full h-4 mb-2" />
                  <Skeleton className="w-5/6 h-4 mb-4" />
                </>
              ) : (
                <>
                  <CardTitle className={`text-xl font-bold transition-colors duration-300 ${categoryColors[tool.category].icon} mb-2 relative`} itemProp="name">
                    {tool.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground min-h-[3rem] mb-4 relative transition-colors duration-300 group-hover:text-foreground/80" itemProp="description">
                    {tool.description}
                  </CardDescription>
                </>
              )}

              {tool.previewUrl && (
                <figure className="mb-4">
                  <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden">
                    {isLoading ? (
                      <Skeleton className="w-full h-full" />
                    ) : (
                      <motion.div
                        className="w-full h-full relative"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      >
                        <PreviewGenerator
                          tool={tool}
                          customization={customization}
                          onLoad={() => setIsPreviewLoading(false)}
                        />
                      </motion.div>
                    )}
                  </AspectRatio>
                  <figcaption className="sr-only">{tool.title} 預覽圖</figcaption>
                </figure>
              )}
            </main>
          </CardContent>
        </Card>
      </motion.article>

      <AnimatePresence>
        {/* Dialog removed */}
      </AnimatePresence>

      <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
        <DialogContent className="sm:max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <DialogHeader>
              <DialogTitle>分享 {tool.title}</DialogTitle>
              <DialogDescription>
                透過社群媒體分享或邀請協作者
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="social" className="w-full">
              <TabsList className="grid w-full grid-cols-2" aria-label="分享選項">
                <TabsTrigger value="social">社群分享</TabsTrigger>
                <TabsTrigger value="collaborate">邀請協作</TabsTrigger>
              </TabsList>

              <TabsContent value="social" className="mt-4">
                <SocialPreviewImage
                  tool={tool}
                  onGenerate={setPreviewImage}
                />

                <motion.div
                  className="flex flex-wrap gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  role="group"
                  aria-label="社群媒體分享按鈕"
                >
                  {[
                    { name: 'Copy', icon: Copy, color: 'text-gray-600', onClick: handleCopyLink },
                    { name: 'Facebook', icon: FacebookIcon, color: 'text-[#4267B2]' },
                    { name: 'LinkedIn', icon: LinkedinIcon, color: 'text-[#0077B5]' },
                    { name: 'LINE', icon: MessageCircle, color: 'text-[#00B900]' },
                  ].map((platform) => (
                    <motion.div
                      key={platform.name}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        className="flex-1 min-w-[120px]"
                        onClick={(e) => {
                          if (platform.onClick) {
                            platform.onClick(e);
                          } else {
                            window.open(getShareUrls(previewImage)[platform.name.toLowerCase()], '_blank');
                          }
                        }}
                        aria-label={platform.name === 'Copy' ? '複製連結' : `分享到 ${platform.name}`}
                      >
                        <platform.icon className={`w-4 h-4 mr-2 ${platform.color}`} aria-hidden="true" />
                        {platform.name === 'Copy' ? '複製連結' : platform.name}
                      </Button>
                    </motion.div>
                  ))}
                </motion.div>

                {previewImage && (
                  <div className="mt-4 p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">預覽圖片</p>
                    <img
                      src={previewImage}
                      alt={`${tool.title} 分享預覽`}
                      className="w-full h-auto rounded-md"
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="collaborate" className="mt-4">
                <motion.div
                  className="grid gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="grid flex-1 gap-2">
                    <label className="text-sm font-medium leading-none" id="collaborator-label">
                      協作者
                    </label>
                    <Button
                      variant="outline"
                      className="justify-start"
                      aria-labelledby="collaborator-label"
                    >
                      <Users className="mr-2 h-4 w-4" aria-hidden="true" />
                      <span>選擇協作者</span>
                    </Button>
                  </div>
                  <Button className="w-full">邀請協作</Button>
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCustomizeOpen} onOpenChange={setIsCustomizeOpen}>
        <DialogContent className="max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <DialogHeader>
              <DialogTitle>自定義圖標 - {tool.title}</DialogTitle>
              <DialogDescription>
                調整圖標的顏色、大小和樣式
              </DialogDescription>
            </DialogHeader>

            <CustomizationTutorialProvider>
              <IconCustomizer
                tool={tool}
                onCustomizationChange={setCustomization}
              />
            </CustomizationTutorialProvider>
          </motion.div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}