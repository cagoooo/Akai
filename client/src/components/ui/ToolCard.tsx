
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";

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

  const handleClick = () => {
    // 記錄工具使用
    fetch(`/api/tools/${id}/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('無法記錄工具使用');
      }
      return response.json();
    })
    .then(data => {
      console.log('工具使用已記錄', data);
      // 如果伺服器回傳了成就訊息
      if (data.achievement) {
        toast({
          title: "新成就獲得！",
          description: `恭喜獲得「${data.achievement}」成就！`,
          duration: 5000,
        });
      }
    })
    .catch(error => {
      console.error('記錄工具使用時發生錯誤:', error);
    });

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
