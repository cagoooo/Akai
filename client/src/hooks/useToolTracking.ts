
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';

export function useToolTracking() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const trackToolUsage = async (toolId: number) => {
    try {
      // 立即更新UI: 先更新本地緩存數據
      const updateLocalCache = () => {
        // 獲取當前統計數據
        const currentStats = queryClient.getQueryData<any[]>(['/api/tools/stats']) || [];
        const currentRankings = queryClient.getQueryData<any[]>(['/api/tools/rankings']) || [];

        // 更新統計數據
        const updatedStats = currentStats.map(stat => {
          if (stat.toolId === toolId) {
            return { 
              ...stat, 
              totalClicks: (stat.totalClicks || 0) + 1 
            };
          }
          return stat;
        });

        // 更新排行榜數據
        const updatedRankings = currentRankings.map(ranking => {
          if (ranking.toolId === toolId) {
            return { 
              ...ranking, 
              totalClicks: (ranking.totalClicks || 0) + 1 
            };
          }
          return ranking;
        });

        // 立即更新本地緩存數據，不等待API響應
        queryClient.setQueryData(['/api/tools/stats'], updatedStats);
        queryClient.setQueryData(['/api/tools/rankings'], updatedRankings);
      };

      // 先更新本地數據
      updateLocalCache();

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
      console.log('工具使用已記錄:', toolId, data);

      // 成功後，確保從服務器獲取最新數據，但不立即刷新UI
      // 使用 { refetchInterval: false } 避免過度重新獲取數據
      queryClient.invalidateQueries({ 
        queryKey: ['/api/tools/stats'],
        refetchType: 'active'
      });
      
      queryClient.invalidateQueries({ 
        queryKey: ['/api/tools/rankings'],
        refetchType: 'active'
      });

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
      });
      throw error;
    }
  };

  return { trackToolUsage };
}
