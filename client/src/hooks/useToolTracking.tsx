
import { useToast } from "@/components/ui/use-toast";

export function useToolTracking() {
  const { toast } = useToast();

  const trackToolUsage = async (toolId: number) => {
    try {
      const response = await fetch(`/api/tools/${toolId}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('無法記錄工具使用');
      }
      
      const data = await response.json();
      console.log('工具使用已記錄', data);
      
      // 如果伺服器回傳了成就訊息
      if (data.achievement) {
        toast({
          title: "新成就獲得！",
          description: `恭喜獲得「${data.achievement}」成就！`,
          duration: 5000,
        });
      }
      
      return data;
    } catch (error) {
      console.error('記錄工具使用時發生錯誤:', error);
      toast({
        title: "錯誤",
        description: "記錄工具使用時發生錯誤",
        variant: "destructive",
        duration: 3000,
      });
      return null;
    }
  };

  return { trackToolUsage };
}
