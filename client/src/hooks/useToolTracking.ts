
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';

export function useToolTracking() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const trackToolUsage = async (toolId: number) => {
    try {
      // 記錄工具使用
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

      // 獲取當前統計數據
      const currentStats = queryClient.getQueryData<any[]>(['/api/tools/stats']) || [];
      const currentRankings = queryClient.getQueryData<any[]>(['/api/tools/rankings']) || [];

      // 更新統計數據
      const updatedStats = currentStats.map(stat => {
        if (stat.toolId === toolId) {
          return { ...stat, totalClicks: stat.totalClicks + 1 };
        }
        return stat;
      });

      // 更新排行榜數據
      const updatedRankings = currentRankings.map(ranking => {
        if (ranking.toolId === toolId) {
          return { ...ranking, totalClicks: ranking.totalClicks + 1 };
        }
        return ranking;
      });

      // 設置更新後的數據
      queryClient.setQueryData(['/api/tools/stats'], updatedStats);
      queryClient.setQueryData(['/api/tools/rankings'], updatedRankings);

      // 如果伺服器回傳了成就訊息
      if (data.achievement) {
        toast({
          title: `🎉 獲得成就：${data.achievement}`,
          description: "繼續使用工具解鎖更多成就！",
        });
      }

      return data;
    } catch (error) {
      console.error('工具使用記錄失敗:', error);
      toast({
        title: "工具使用記錄失敗",
        description: error instanceof Error ? error.message : "未知錯誤",
        variant: "destructive",
      });
      throw error;
    }
  };

  return { trackToolUsage };
}
