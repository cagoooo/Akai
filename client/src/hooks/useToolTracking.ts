import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';

export function useToolTracking() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const trackToolUsage = async (toolId: number) => {
    try {
      // 發送API請求
      const response = await fetch(`/api/tools/${toolId}/track`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("無法記錄工具使用");
      }

      const data = await response.json();
      console.log('工具使用API已記錄:', toolId, data);

      // 請求成功後，直接從服務器刷新數據
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['/api/tools/stats'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/tools/rankings'] })
      ]);

      console.log('工具使用統計查詢已刷新');

      // 如果回傳成就訊息，顯示通知
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
      throw error;
    }
  };

  return { trackToolUsage };
}