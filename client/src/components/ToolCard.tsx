import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
import * as Icons from "lucide-react";
import type { EducationalTool } from "@/lib/data";

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
  const IconComponent = Icons[tool.icon as keyof typeof Icons];

  return (
    <>
      <Card 
        className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              {IconComponent && <IconComponent className="w-6 h-6 text-primary" />}
            </div>
            <Badge 
              variant="secondary" 
              className={`${categoryColors[tool.category]} border-0`}
            >
              {tool.category}
            </Badge>
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
              {IconComponent && <IconComponent className="w-6 h-6 text-primary" />}
              <DialogTitle>{tool.title}</DialogTitle>
            </div>
            <DialogDescription>{tool.description}</DialogDescription>
          </DialogHeader>

          {tool.previewUrl && (
            <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden my-4">
              <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${tool.previewUrl})` }} />
            </AspectRatio>
          )}

          <div className="flex justify-end">
            <Button onClick={() => window.open(tool.url, '_blank')}>
              立即使用
              <Icons.ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}