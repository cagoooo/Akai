import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Share2, Users, HelpCircle } from "lucide-react";
import { useState } from "react";
import * as Icons from "lucide-react";
import type { EducationalTool } from "@/lib/data";
import type { LucideIcon } from 'lucide-react';

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

  return (
    <TooltipProvider>
      <Card 
        className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <Tooltip>
              <TooltipTrigger>
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
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
              <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${tool.previewUrl})` }} />
            </AspectRatio>
          )}
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              {Icon && <Icon className="w-6 h-6 text-primary" />}
              <DialogTitle>{tool.title}</DialogTitle>
            </div>
            <DialogDescription>{tool.description}</DialogDescription>
          </DialogHeader>

          {tool.previewUrl && (
            <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden my-4">
              <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${tool.previewUrl})` }} />
            </AspectRatio>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              分享
            </Button>
            <Button onClick={() => window.open(tool.url, '_blank')}>
              立即使用
              <Icons.ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>分享 {tool.title}</DialogTitle>
            <DialogDescription>
              邀請其他使用者一起協作
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                協作者
              </label>
              <Button variant="outline" className="justify-start">
                <Users className="mr-2 h-4 w-4" />
                <span>選擇協作者</span>
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button className="flex-1" onClick={() => setIsShareOpen(false)}>
              完成
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}