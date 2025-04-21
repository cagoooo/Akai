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
      
      // 立即獲取最新數據和排行榜，確保顯示最新結果
      try {
        // 同時發送兩個請求獲取最新數據
        const [statsResponse, rankingsResponse] = await Promise.all([
          fetch('/api/tools/stats'),
          fetch('/api/tools/rankings')
        ]);
        
        if (statsResponse.ok && rankingsResponse.ok) {
          const [latestStats, latestRankings] = await Promise.all([
            statsResponse.json(),
            rankingsResponse.json()
          ]);
          
          // 更新查詢緩存
          queryClient.setQueryData(['/api/tools/stats'], latestStats);
          queryClient.setQueryData(['/api/tools/rankings'], latestRankings);
          
          console.log('工具統計和排行榜數據已同步更新');
          
          // 如果API成功但本地存儲不是最新，更新本地存儲
          if (apiSuccess) {
            // 不影響顯示，只備份到本地
            try {
              localStorage.setItem(LOCAL_TOOLS_STATS_KEY, JSON.stringify(latestStats));
              localStorage.setItem(LOCAL_TOOLS_RANKINGS_KEY, JSON.stringify(latestRankings));
            } catch (e) {
              console.error('本地存儲備份失敗:', e);
            }
          }
          
          // 直接返回，不需要進一步刷新
          return {
            message: "使用統計已更新",
            totalClicks: serverTotalClicks,
            toolId: toolId
          };
        }
      } catch (fetchError) {
        console.error('同步獲取最新數據失敗:', fetchError);
      }
      
      // 如果同步請求失敗，則嘗試直接刷新查詢
      await Promise.all([
        queryClient.invalidateQueries({ 
          queryKey: ['/api/tools/stats'],
        }),
        queryClient.invalidateQueries({ 
          queryKey: ['/api/tools/rankings'],
        })
      ]);

      console.log('工具使用統計查詢已刷新');

      return {
        message: "使用統計已更新",
        totalClicks: serverTotalClicks || 1,
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