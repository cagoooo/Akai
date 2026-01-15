import { trackToolUsage as firestoreTrackToolUsage } from '@/lib/firestoreService';
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
  const trackToolUsage = async (toolId: number) => {
    try {
      console.log('透過 Firestore 追蹤工具使用:', toolId);

      // 使用 Firestore 追蹤
      const result = await firestoreTrackToolUsage(toolId);

      console.log('Firestore 工具使用追蹤成功:', toolId, result);

      // 更新本地快取
      updateLocalToolStats(toolId, result.totalClicks);

      return {
        message: "使用統計已更新",
        totalClicks: result.totalClicks,
        toolId: toolId
      };
    } catch (error) {
      console.error('Firestore 追蹤失敗，使用本地備份:', error);

      // Firestore 失敗時使用本地備份
      const localClicks = updateLocalToolStats(toolId);

      return {
        message: "使用統計已在本地更新",
        totalClicks: localClicks,
        toolId: toolId
      };
    }
  };

  return { trackToolUsage };
}