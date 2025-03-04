
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from '@tanstack/react-query';

export function useToolTracking() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      
      // 確保刷新所有工具相關查詢，不僅僅是單個查詢
      await queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === '/api/tools/stats' || 
          query.queryKey[0] === '/api/tools/rankings' ||
          String(query.queryKey[0]).includes('tools'),
        refetchType: 'all'
      });
      
      // 強制立即重新獲取數據以確保 UI 立即更新
      await queryClient.refetchQueries({
        queryKey: ['/api/tools/stats'],
        type: 'all',
        exact: false
      });
      
      await queryClient.refetchQueries({
        queryKey: ['/api/tools/rankings'],
        type: 'all',
        exact: false
      });
      
      // 如果伺服器回傳了成就訊息
      if (data.achievement) {
        toast({
          title: "新成就獲得！",
          description: `恭喜獲得「${data.achievement}」成就！`,
          duration: 5000,
        });
      }
      
      return {
        totalClicks: data.totalClicks || 1, // 確保回傳點擊數
        message: data.message,
        achievement: data.achievement
      };
    } catch (error) {
      console.error('記錄工具使用時發生錯誤:', error);
      toast({
        title: "錯誤",
        description: "無法記錄工具使用統計",
        variant: "destructive",
      });
      throw error;
    }
  };

  return { trackToolUsage };
}
