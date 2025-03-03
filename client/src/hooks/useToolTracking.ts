import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';

export function useToolTracking() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const trackToolUsage = async (toolId: number) => {
    try {
      // 立即更新UI: 強制使用函數式更新確保每次都是基於最新狀態
      const updateCachedData = (queryKey: string, toolId: number) => {
        return queryClient.setQueryData<any[]>([queryKey], (oldData) => {
          if (!oldData) return oldData;

          return oldData.map(item => {
            if (item.toolId === toolId) {
              return { ...item, totalClicks: (item.totalClicks || 0) + 1 };
            }
            return item;
          });
        });
      };

      // 同時更新兩個查詢的數據
      updateCachedData('/api/tools/stats', toolId);
      updateCachedData('/api/tools/rankings', toolId);

      console.log(`工具使用前端已更新，ID: ${toolId}`);

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

      // 成功後，使用最小延遲刷新查詢確保數據一致性
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/tools/stats'] });
        queryClient.invalidateQueries({ queryKey: ['/api/tools/rankings'] });
        console.log('工具使用統計查詢已刷新');
      }, 100);

      // 如果回傳成就訊息，顯示通知
      if (data.achievement) {
        toast({
          title: "新成就獲得！",
          description: `恭喜獲得「${data.achievement}」成就！`,
          duration: 5000,
        });
      }

      return data;urn data;
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