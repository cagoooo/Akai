import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';

export function useToolTracking() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const trackToolUsage = async (toolId: number) => {
    try {
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

      // 立即更新工具統計和排行榜數據
      // 1. 獲取當前統計數據
      const currentStats = queryClient.getQueryData<any[]>(['/api/tools/stats']) || [];
      const currentRankings = queryClient.getQueryData<any[]>(['/api/tools/rankings']) || [];

      // 2. 更新統計數據
      const updatedStats = currentStats.map(stat => {
        if (stat.toolId === toolId) {
          return { ...stat, totalClicks: stat.totalClicks + 1 };
        }
        return stat;
      });

      // 3. 更新排行榜數據
      const updatedRankings = currentRankings.map(ranking => {
        if (ranking.toolId === toolId) {
          return { ...ranking, totalClicks: ranking.totalClicks + 1 };
        }
        return ranking;
      });

      // 4. 設置更新後的數據
      queryClient.setQueryData(['/api/tools/stats'], updatedStats);
      queryClient.setQueryData(['/api/tools/rankings'], updatedRankings);

      // 如果回傳成就訊息，顯示通知
      if (data.achievement) {
        toast({
          title: "恭喜解鎖成就！",
          description: `獲得「${data.achievement}」成就`,
          variant: "default",
        });
      }

      return data;
    } catch (error) {
      console.error('工具使用記錄失敗:', error);
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