import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const Icon = Icons[tool.icon as keyof typeof Icons];
  
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            {Icon && <Icon className="w-6 h-6 text-primary" />}
          </div>
          <Badge 
            variant="secondary" 
            className={`${categoryColors[tool.category]} border-0`}
          >
            {tool.category}
          </Badge>
        </div>
        <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
          {tool.title}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground min-h-[60px]">
          {tool.description}
        </CardDescription>
        <Button 
          className="w-full mt-4"
          onClick={() => window.open(tool.url, '_blank')}
        >
          立即使用
          <Icons.ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardHeader>
    </Card>
  );
}
