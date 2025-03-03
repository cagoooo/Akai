
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';

export function useToolTracking() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const trackToolUsage = async (toolId: number) => {
    try {
      // 獲取最新的工具統計數據，使用緩存中的數據但強制標記為過期
      const fetchLatestData = async () => {
        // 先獲取當前數據用於立即更新UI
        const currentStats = queryClient.getQueryData<any[]>(['/api/tools/stats']) || [];
        const currentRankings = queryClient.getQueryData<any[]>(['/api/tools/rankings']) || [];

        // 更新統計數據 - 注意這裡要防止同一工具多次點擊時可能只增加一次的問題
        const updatedStats = currentStats.map(stat => {
          if (stat.toolId === toolId) {
            // 使用函數更新，確保每次都基於最新狀態
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

        // 設置更新後的數據 - 在API請求前先更新UI
        queryClient.setQueryData(['/api/tools/stats'], updatedStats);
        queryClient.setQueryData(['/api/tools/rankings'], updatedRankings);
      };

      // 執行立即更新
      await fetchLatestData();

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

      // API請求成功後，再次確保數據是最新的
      // 強制刷新查詢，但保留我們剛剛設置的數據，使用獲取新數據的方式更新
      queryClient.invalidateQueries({ queryKey: ['/api/tools/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tools/rankings'] });

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
    }
  };

  return { trackToolUsage };
}
