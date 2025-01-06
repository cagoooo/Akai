import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Share2, Users, HelpCircle, Twitter, Facebook, Linkedin, MessageCircle } from "lucide-react";
import { useState } from "react";
import * as Icons from "lucide-react";
import type { EducationalTool } from "@/lib/data";
import type { LucideIcon } from 'lucide-react';
import { generateShareUrls } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const categoryColors = {
  communication: "bg-blue-100 text-blue-800",
  teaching: "bg-green-100 text-green-800",
  language: "bg-purple-100 text-purple-800",
  reading: "bg-yellow-100 text-yellow-800",
  utilities: "bg-gray-100 text-gray-800",
  games: "bg-pink-100 text-pink-800",
} as const;

interface ToolCardProps {
  tool: EducationalTool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const Icon = Icons[tool.icon as keyof typeof Icons] as LucideIcon;

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsShareOpen(true);
  };

  const shareUrls = generateShareUrls({
    url: tool.url,
    title: tool.title,
    description: tool.description,
  });

  const socialPlatforms = [
    { name: 'Twitter', icon: Twitter, url: shareUrls.twitter, color: 'text-[#1DA1F2]' },
    { name: 'Facebook', icon: Facebook, url: shareUrls.facebook, color: 'text-[#4267B2]' },
    { name: 'LinkedIn', icon: Linkedin, url: shareUrls.linkedin, color: 'text-[#0077B5]' },
    { name: 'LINE', icon: MessageCircle, url: shareUrls.line, color: 'text-[#00B900]' },
  ];

  return (
    <TooltipProvider>
      <Card 
        className="group hover:shadow-lg transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors"
                  role="img"
                  aria-label={`${tool.title} 圖標`}
                >
                  {Icon && <Icon className="w-6 h-6 text-primary" />}
                </div>
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
                    className={`${categoryColors[tool.category]} border-0`}
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
          </div>

          <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors mb-2">
            {tool.title}
          </CardTitle>

          <CardDescription className="text-sm text-muted-foreground min-h-[3rem] mb-4">
            {tool.description}
          </CardDescription>

          {tool.previewUrl && (
            <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden mb-4">
              <div 
                className="w-full h-full bg-cover bg-center" 
                style={{ backgroundImage: `url(${tool.previewUrl})` }}
                role="img"
                aria-label={`${tool.title} 工具預覽圖`}
              />
            </AspectRatio>
          )}
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              {Icon && <Icon className="w-6 h-6 text-primary" aria-hidden="true" />}
              <DialogTitle>{tool.title}</DialogTitle>
            </div>
            <DialogDescription>{tool.description}</DialogDescription>
          </DialogHeader>

          {tool.previewUrl && (
            <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden my-4">
              <div 
                className="w-full h-full bg-cover bg-center" 
                style={{ backgroundImage: `url(${tool.previewUrl})` }}
                role="img"
                aria-label={`${tool.title} 工具詳細預覽圖`}
              />
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
        </DialogContent>
      </Dialog>

      <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
        <DialogContent className="sm:max-w-md">
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
              <div className="flex flex-wrap gap-4" role="group" aria-label="社群媒體分享按鈕">
                {socialPlatforms.map((platform) => (
                  <Button
                    key={platform.name}
                    variant="outline"
                    className="flex-1 min-w-[120px]"
                    onClick={() => window.open(platform.url, '_blank')}
                    aria-label={`分享到 ${platform.name}`}
                  >
                    <platform.icon className={`w-4 h-4 mr-2 ${platform.color}`} aria-hidden="true" />
                    {platform.name}
                  </Button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="collaborate" className="mt-4">
              <div className="grid gap-4">
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
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}