import { useToast } from "@/components/ui/use-toast";
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

      if (!response.ok) {
        toast({
          title: "提示",
          description: "已在本地記錄工具使用",
          variant: "default",
        });

        return {
          toolId,
          totalClicks: 1,
          achievement: null,
          message: "本地更新"
        };
      }

      const data = await response.json();
      console.log('工具使用已記錄', data);

      // 只在成功時嘗試更新查詢
      try {
        await queryClient.invalidateQueries({ 
          queryKey: ['/api/tools/stats']
        });
        await queryClient.invalidateQueries({ 
          queryKey: ['/api/tools/rankings']
        });
      } catch (error) {
        console.error('查詢更新失敗，但不影響功能:', error);
      }

      return {
        toolId,
        totalClicks: data.totalClicks || 1,
        achievement: data.achievement,
        message: data.message
      };

    } catch (error) {
      console.error('記錄工具使用時發生錯誤:', error);
      toast({
        title: "提示",
        description: "已在本地記錄工具使用",
        variant: "default",
      });

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