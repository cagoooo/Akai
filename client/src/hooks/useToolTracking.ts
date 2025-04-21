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
function updateLocalToolStats(toolId: number, serverTotalClicks?: number) {
  try {
    const stats = getLocalToolStats();
    const toolStat = stats.find((s: any) => s.toolId === toolId);
    
    // 如果提供了服務器數據，使用它，否則本地加1
    if (toolStat) {
      if (serverTotalClicks !== undefined) {
        toolStat.totalClicks = serverTotalClicks;
      } else {
        toolStat.totalClicks += 1;
      }
      toolStat.lastUsedAt = new Date().toISOString();
    } else {
      stats.push({
        toolId,
        totalClicks: serverTotalClicks !== undefined ? serverTotalClicks : 1,
        lastUsedAt: new Date().toISOString()
      });
    }
    
    localStorage.setItem(LOCAL_TOOLS_STATS_KEY, JSON.stringify(stats));
    
    // 更新排行榜 - 排序後存儲
    const rankings = [...stats]
      .sort((a, b) => b.totalClicks - a.totalClicks)
      .slice(0, 8);
    localStorage.setItem(LOCAL_TOOLS_RANKINGS_KEY, JSON.stringify(rankings));
    
    return toolStat ? toolStat.totalClicks : (serverTotalClicks !== undefined ? serverTotalClicks : 1);
  } catch (e) {
    console.error('無法更新本地工具統計:', e);
    return serverTotalClicks !== undefined ? serverTotalClicks : 1;
  }
}

export function useToolTracking() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const trackToolUsage = async (toolId: number) => {
    try {
      // 先記錄當前API數據，以便後續同步本地數據
      const currentStats = queryClient.getQueryData<any[]>(['/api/tools/stats']) || [];
      const currentRankings = queryClient.getQueryData<any[]>(['/api/tools/rankings']) || [];
      
      // 嘗試發送API請求
      let apiSuccess = false;
      let serverTotalClicks = 0;
      
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
          apiSuccess = true;
          serverTotalClicks = data.totalClicks || 0;
          
          // 如果回傳成就訊息，顯示通知
          if (data.achievement) {
            toast({
              title: "新成就獲得！",
              description: `恭喜獲得「${data.achievement}」成就！`,
              duration: 5000,
            });
          }
        } else {
          console.warn('API返回非200狀態碼:', response.status);
        }
      } catch (apiError) {
        console.error('API請求失敗:', apiError);
      }
      
      // 根據API成功與否更新本地數據
      let localTotalClicks = 0;
      
      if (apiSuccess) {
        // API成功：使用服務器返回的數據更新本地存儲
        localTotalClicks = updateLocalToolStats(toolId, serverTotalClicks);
        
        // 直接從服務器獲取最新的排行榜數據
        try {
          // 立即獲取最新排行榜
          const rankingsResponse = await fetch('/api/tools/rankings');
          if (rankingsResponse.ok) {
            const latestRankings = await rankingsResponse.json();
            // 更新排行榜查詢緩存
            queryClient.setQueryData(['/api/tools/rankings'], latestRankings);
          }
        } catch (err) {
          console.error('獲取最新排行榜失敗:', err);
        }
      } else {
        // API失敗：仍然更新本地數據，但不依賴服務器返回值
        localTotalClicks = updateLocalToolStats(toolId);
        
        // 此時需要使用本地數據覆蓋API查詢緩存
        const localStats = getLocalToolStats();
        queryClient.setQueryData(['/api/tools/stats'], localStats);
        
        const rankings = [...localStats]
          .sort((a: any, b: any) => b.totalClicks - a.totalClicks)
          .slice(0, 8);
        queryClient.setQueryData(['/api/tools/rankings'], rankings);
      }

      // 無論成功或失敗，都通知React Query刷新相關查詢
      await Promise.all([
        queryClient.invalidateQueries({ 
          queryKey: ['/api/tools/stats'],
          refetchType: 'active', // 只刷新活動查詢
        }),
        queryClient.invalidateQueries({ 
          queryKey: ['/api/tools/rankings'],
          refetchType: 'active', // 只刷新活動查詢
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