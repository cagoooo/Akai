import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Share2, Users, Settings2, Twitter as TwitterIcon, Facebook as FacebookIcon, Linkedin as LinkedinIcon, MessageCircle } from "lucide-react";
import { useState } from "react";
import * as Icons from "lucide-react";
import type { EducationalTool } from "@/lib/data";
import type { LucideIcon } from 'lucide-react';
import { generateShareUrls } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PreviewGenerator } from "@/components/PreviewGenerator";
import { IconCustomizer, type IconCustomization } from "@/components/IconCustomizer";
import { CustomizationTutorialProvider } from "./CustomizationTutorial";
import { motion, AnimatePresence } from "framer-motion";

// Enhanced category colors with hover states
const categoryColors = {
  communication: {
    badge: "bg-blue-100 text-blue-800",
    hover: "from-blue-50/50 to-blue-100/50",
    border: "group-hover:border-blue-200",
  },
  teaching: {
    badge: "bg-green-100 text-green-800",
    hover: "from-green-50/50 to-green-100/50",
    border: "group-hover:border-green-200",
  },
  language: {
    badge: "bg-purple-100 text-purple-800",
    hover: "from-purple-50/50 to-purple-100/50",
    border: "group-hover:border-purple-200",
  },
  reading: {
    badge: "bg-yellow-100 text-yellow-800",
    hover: "from-yellow-50/50 to-yellow-100/50",
    border: "group-hover:border-yellow-200",
  },
  utilities: {
    badge: "bg-gray-100 text-gray-800",
    hover: "from-gray-50/50 to-gray-100/50",
    border: "group-hover:border-gray-200",
  },
  games: {
    badge: "bg-pink-100 text-pink-800",
    hover: "from-pink-50/50 to-pink-100/50",
    border: "group-hover:border-pink-200",
  },
} as const;

interface ToolCardProps {
  tool: EducationalTool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [customization, setCustomization] = useState<IconCustomization | undefined>();
  const Icon = Icons[tool.icon as keyof typeof Icons] as LucideIcon;

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsShareOpen(true);
  };

  const handleCustomize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCustomizeOpen(true);
  };

  return (
    <TooltipProvider>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Card
          className={`group hover:shadow-lg transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary overflow-hidden border-2 ${categoryColors[tool.category].border}`}
          onClick={() => setIsOpen(true)}
          tabIndex={0}
          role="button"
          aria-label={`開啟 ${tool.title} 工具詳細資訊`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsOpen(true);
            }
          }}
        >
          <motion.div
            className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100 bg-gradient-to-br pointer-events-none"
            initial={false}
            style={{
              background: `linear-gradient(to bottom right, var(--${tool.category}-gradient))`,
            }}
          />
          <CardContent className="p-6 relative">
            <motion.div
              className="flex items-start justify-between mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors"
                    whileHover={{ rotate: [0, -10, 10, -5, 5, 0] }}
                    transition={{ duration: 0.5 }}
                    role="img"
                    aria-label={`${tool.title} 圖標`}
                  >
                    {Icon && <Icon className="w-6 h-6 text-primary" />}
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tool.title}</p>
                </TooltipContent>
              </Tooltip>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
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
                      className="h-8 w-8"
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
                      className={`${categoryColors[tool.category].badge} border-0`}
                    >
                      <span className="sr-only">工具類別：</span>
                      {tool.category}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>工具類別：{tool.category}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </motion.div>

            <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors mb-2 relative">
              {tool.title}
            </CardTitle>

            <CardDescription className="text-sm text-muted-foreground min-h-[3rem] mb-4 relative">
              {tool.description}
            </CardDescription>

            {tool.previewUrl && (
              <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden mb-4">
                <motion.div
                  className="w-full h-full relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <PreviewGenerator tool={tool} customization={customization} />
                </motion.div>
              </AspectRatio>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-2">
                    {Icon && <Icon className="w-6 h-6 text-primary" aria-hidden="true" />}
                    <DialogTitle>{tool.title}</DialogTitle>
                  </div>
                  <DialogDescription>{tool.description}</DialogDescription>
                </DialogHeader>

                {tool.previewUrl && (
                  <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden my-4">
                    <motion.div
                      className="w-full h-full"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <PreviewGenerator tool={tool} customization={customization} />
                    </motion.div>
                  </AspectRatio>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handleShare} aria-label={`分享 ${tool.title}`}>
                    <Share2 className="w-4 h-4 mr-2" aria-hidden="true" />
                    分享
                  </Button>
                  <Button
                    onClick={() => window.open(tool.url, '_blank')}
                    aria-label={`在新分頁中開啟 ${tool.title}`}
                  >
                    立即使用
                    <Icons.ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
                  </Button>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
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
                <motion.div
                  className="flex flex-wrap gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  role="group"
                  aria-label="社群媒體分享按鈕"
                >
                  {[
                    { name: 'Twitter', icon: TwitterIcon, color: 'text-[#1DA1F2]' },
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
                        onClick={() => window.open(generateShareUrls({ url: tool.url, title: tool.title, description: tool.description })[platform.name.toLowerCase()], '_blank')}
                        aria-label={`分享到 ${platform.name}`}
                      >
                        <platform.icon className={`w-4 h-4 mr-2 ${platform.color}`} aria-hidden="true" />
                        {platform.name}
                      </Button>
                    </motion.div>
                  ))}
                </motion.div>
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