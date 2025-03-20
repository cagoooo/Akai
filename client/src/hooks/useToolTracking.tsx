import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from '@tanstack/react-query';
import type { ToolTrackingResponse } from "@/types/analytics";

export function useToolTracking() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const trackToolUsage = async (toolId: number): Promise<ToolTrackingResponse> => {
    try {
      const response = await fetch(`/api/tools/${toolId}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // 如果服務器返回錯誤，返回一個本地模擬的響應
      if (!response.ok) {
        return {
          toolId,
          totalClicks: 1, // 本地增加點擊次數
          achievement: null,
          message: "本地更新"
        };
      }

      const data = await response.json();
      console.log('工具使用已記錄', data);

      // 立即更新兩個關鍵查詢的緩存
      await Promise.all([
        queryClient.invalidateQueries({ 
          queryKey: ['/api/tools/stats']
        }),
        queryClient.invalidateQueries({ 
          queryKey: ['/api/tools/rankings']
        })
      ]);

      // 強制重新獲取最新數據
      await Promise.all([
        queryClient.refetchQueries({
          queryKey: ['/api/tools/stats'],
          exact: true
        }),
        queryClient.refetchQueries({
          queryKey: ['/api/tools/rankings'],
          exact: true
        })
      ]);

      return {
        toolId,
        totalClicks: data.totalClicks || 1,
        achievement: data.achievement,
        message: data.message
      };

    } catch (error) {
      console.error('記錄工具使用時發生錯誤:', error);
      // 在錯誤情況下返回本地響應，確保UI可以繼續運作
      return {
        toolId,
        totalClicks: 1,
        achievement: null,
        message: "本地更新"
      };
    }
  };

  return { trackToolUsage };
}