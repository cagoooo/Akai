import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { tools } from '@/lib/data';

// 本地存儲鍵 - 用於保存工具使用統計
const LOCAL_TOOLS_STATS_KEY = 'localToolsStats';
const LOCAL_TOOLS_RANKINGS_KEY = 'localToolsRankings';

// 獲取本地工具統計數據
function getLocalToolStats() {
  try {
    const savedStats = localStorage.getItem(LOCAL_TOOLS_STATS_KEY);
    if (savedStats) {
      return JSON.parse(savedStats);
    }
  } catch (e) {
    console.error('無法讀取本地工具統計:', e);
  }
  
  // 如果沒有保存的數據或發生錯誤，返回初始值
  return tools.map(tool => ({
    toolId: tool.id,
    totalClicks: 0,
    lastUsedAt: new Date().toISOString()
  }));
}

// 更新本地工具統計
function updateLocalToolStats(toolId: number) {
  try {
    const stats = getLocalToolStats();
    const toolStat = stats.find((s: any) => s.toolId === toolId);
    
    if (toolStat) {
      toolStat.totalClicks += 1;
      toolStat.lastUsedAt = new Date().toISOString();
    } else {
      stats.push({
        toolId,
        totalClicks: 1,
        lastUsedAt: new Date().toISOString()
      });
    }
    
    localStorage.setItem(LOCAL_TOOLS_STATS_KEY, JSON.stringify(stats));
    
    // 更新排行榜
    const rankings = [...stats].sort((a, b) => b.totalClicks - a.totalClicks).slice(0, 8);
    localStorage.setItem(LOCAL_TOOLS_RANKINGS_KEY, JSON.stringify(rankings));
    
    return toolStat ? toolStat.totalClicks : 1;
  } catch (e) {
    console.error('無法更新本地工具統計:', e);
    return 1;
  }
}

export function useToolTracking() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const trackToolUsage = async (toolId: number) => {
    try {
      // 更新本地統計
      const localTotalClicks = updateLocalToolStats(toolId);
      
      // 嘗試發送API請求
      try {
        const response = await fetch(`/api/tools/${toolId}/track`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
  
        if (response.ok) {
          const data = await response.json();
          console.log('工具使用API已記錄:', toolId, data);
          
          // 如果回傳成就訊息，顯示通知
          if (data.achievement) {
            toast({
              title: "新成就獲得！",
              description: `恭喜獲得「${data.achievement}」成就！`,
              duration: 5000,
            });
          }
        } else {
          console.warn('API返回非200狀態碼，使用本地數據:', response.status);
          
          // 使用本地數據覆蓋API查詢緩存
          queryClient.setQueryData(['/api/tools/stats'], getLocalToolStats());
          
          const rankings = getLocalToolStats()
            .sort((a: any, b: any) => b.totalClicks - a.totalClicks)
            .slice(0, 8);
          queryClient.setQueryData(['/api/tools/rankings'], rankings);
        }
      } catch (apiError) {
        console.error('API請求失敗，使用本地數據:', apiError);
        
        // 使用本地數據覆蓋API查詢緩存
        queryClient.setQueryData(['/api/tools/stats'], getLocalToolStats());
        
        const rankings = getLocalToolStats()
          .sort((a: any, b: any) => b.totalClicks - a.totalClicks)
          .slice(0, 8);
        queryClient.setQueryData(['/api/tools/rankings'], rankings);
      }

      // 通知React Query刷新相關查詢
      await Promise.all([
        queryClient.invalidateQueries({ 
          queryKey: ['/api/tools/stats'],
          refetchType: 'all',
        }),
        queryClient.invalidateQueries({ 
          queryKey: ['/api/tools/rankings'],
          refetchType: 'all',
        })
      ]);

      console.log('工具使用統計查詢已刷新');

      return {
        message: "使用統計已更新",
        totalClicks: localTotalClicks,
        toolId: toolId
      };
    } catch (error) {
      console.error('記錄工具使用時發生錯誤:', error);
      // 即使發生錯誤，也不顯示錯誤通知，以免干擾用戶體驗
      return {
        message: "使用統計已在本地更新",
        totalClicks: 1,
        toolId: toolId
      };
    }
  };

  return { trackToolUsage };
}