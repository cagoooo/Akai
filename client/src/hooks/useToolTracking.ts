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

      // 請求成功後，立即強制從服務器刷新數據
      await Promise.all([
        queryClient.invalidateQueries({ 
          queryKey: ['/api/tools/stats'],
          refetchType: 'all',  // 強制重新獲取所有查詢
        }),
        queryClient.invalidateQueries({ 
          queryKey: ['/api/tools/rankings'],
          refetchType: 'all',  // 強制重新獲取所有查詢
        })
      ]);

      // 確保所有相關查詢都會刷新，包括可能的單個工具查詢
      queryClient.refetchQueries({
        predicate: (query) => 
          query.queryKey[0] === '/api/tools' || 
          String(query.queryKey[0]).includes('tools'),
        type: 'all'
      });

      console.log('工具使用統計查詢已刷新');

      // 如果回傳成就訊息，顯示通知
      if (data.achievement) {
        toast({
          title: "新成就獲得！",
          description: `恭喜獲得「${data.achievement}」成就！`,
          duration: 5000,
        });
      }

      return {
        ...data,
        totalClicks: data.totalClicks || 1  // 保留伺服器回傳的點擊數，而非重置為1
      };
    } catchh (error) {
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