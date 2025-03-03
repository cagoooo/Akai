import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { useToolTracking } from "@/hooks/useToolTracking";

interface ToolCardProps {
  id: number;
  name: string;
  description: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export function ToolCard({ id, name, description, icon, onClick }: ToolCardProps) {
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const queryClient = useQueryClient();
  const { trackToolUsage } = useToolTracking();

  const handleClick = async () => {
    await trackToolUsage(id);

    // 手動更新 React Query 緩存以確保即時反映在 UI 上
    queryClient.invalidateQueries({ queryKey: ['/api/tools/rankings'] });
    queryClient.invalidateQueries({ queryKey: ['/api/tools/stats'] });

    // 執行原有的點擊事件
    if (onClick) {
      onClick();
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="h-full overflow-hidden transition-shadow duration-300 cursor-pointer hover:shadow-md"
        onClick={handleClick}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {icon && <span className="text-xl">{icon}</span>}
            {name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm" className="ml-auto">
            使用工具 &rarr;
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}