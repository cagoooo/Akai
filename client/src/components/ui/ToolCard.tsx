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

  const handleClick = () => {
    console.log('工具卡片點擊 ID:', id);
    
    // 使用全局工具追蹤功能，並確保數據同步
    trackToolUsage(id)
      .then(data => {
        console.log('工具使用已追蹤:', id, data);
        
        // 檢查是否有點擊數據，確保正確顯示伺服器回傳的累計點擊數
        if (data && !data.error && data.totalClicks) {
          console.log(`工具 ${id} 累計點擊數: ${data.totalClicks}`);
          
          // 立即更新所有相關查詢以確保 UI 顯示正確的累計點擊數
          queryClient.invalidateQueries({ 
            queryKey: ['/api/tools/stats'],
            refetchType: 'all'
          });
          
          queryClient.invalidateQueries({ 
            queryKey: ['/api/tools/rankings'],
            refetchType: 'all'
          });
        }
        
        // 執行原有的點擊事件
        if (onClick) {
          onClick();
        }
      })
      .catch(err => console.error('工具使用追蹤失敗:', err));使用追蹤錯誤:', err));ror('工具追蹤失敗:', err));
    
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