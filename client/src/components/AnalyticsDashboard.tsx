import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, PieChart } from "@/components/ui/charts";
import { Button } from "@/components/ui/button";
import {
  Calendar, Download, Activity, Users, TrendingUp,
  MousePointer, Eye, Clock, BarChart2, PieChart as PieChartIcon,
  Home, ArrowLeft
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import type { VisitorStats, ToolUsageStat } from "@/types/analytics";
import { WishingWellAdmin } from "@/components/admin/WishingWellAdmin";

// 檢測是否為靜態部署環境
const isStaticDeployment = () => {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.includes('github.io') ||
    window.location.hostname.includes('netlify.app') ||
    window.location.hostname.includes('vercel.app');
};

export function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const heatmapRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // 即時連線狀態
  const [isRealtime, setIsRealtime] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 從 LocalStorage 獲取工具統計
  const getLocalToolStats = () => {
    try {
      const stats = localStorage.getItem('localToolsStats');
      if (stats) {
        return JSON.parse(stats);
      }
    } catch (e) {
      console.error('Failed to load local tool stats:', e);
    }
    return [];
  };

  // 訪問統計狀態
  const [visitorStats, setVisitorStats] = useState<VisitorStats>({
    totalVisits: 0,
    dailyVisits: {},
    lastVisitAt: null
  });

  // 工具統計狀態
  const [toolStats, setToolStats] = useState<ToolUsageStat[]>([]);

  // 使用 Firebase onSnapshot 即時監聽
  useEffect(() => {
    let unsubscribeVisitor: (() => void) | undefined;
    let unsubscribeTool: (() => void) | undefined;

    const initRealtimeListeners = async () => {
      try {
        const { db, isFirebaseAvailable } = await import('@/lib/firebase');
        const { doc, collection, onSnapshot, orderBy, query } = await import('firebase/firestore');

        if (!isFirebaseAvailable() || !db) {
          console.log('Firebase 不可用，使用本地數據');
          // 回退到本地數據
          setVisitorStats({
            totalVisits: parseInt(localStorage.getItem('localVisitorCount') || '0'),
            dailyVisits: {},
            lastVisitAt: null
          });
          setToolStats(getLocalToolStats());
          return;
        }

        unsubscribeVisitor = onSnapshot(
          doc(db, 'visitorStats', 'global'),
          (snapshot) => {
            if (snapshot.exists()) {
              setVisitorStats(snapshot.data() as VisitorStats);
              setLastUpdated(new Date());
              setIsRealtime(true);
              console.log('📊 儀表板數據已由 Firebase 即時推送');
            }
          },
          (error) => {
            console.error('儀表板監聽失敗:', error);
            setIsRealtime(false);
          }
        );

        // 即時監聽工具統計
        unsubscribeTool = onSnapshot(
          query(collection(db, 'toolUsageStats'), orderBy('totalClicks', 'desc')),
          (snapshot) => {
            const stats: ToolUsageStat[] = [];
            snapshot.forEach((doc) => {
              const data = doc.data();
              stats.push({
                toolId: data.toolId,
                totalClicks: data.totalClicks
              });
            });
            setToolStats(stats);
            setLastUpdated(new Date());
            console.log('🔧 工具統計已即時更新');
          },
          (error) => {
            console.error('工具統計監聽失敗:', error);
            // 回退到本地數據
            const localStats = getLocalToolStats();
            setToolStats(localStats.map((stat: any) => ({
              toolId: stat.toolId,
              totalClicks: stat.totalClicks || 0
            })).filter((stat: any) => stat.totalClicks > 0));
          }
        );

        console.log('🔴 Firebase 即時監聽已啟動');
      } catch (error) {
        console.error('初始化即時監聽失敗:', error);
        setIsRealtime(false);
        // 使用本地數據
        setVisitorStats({
          totalVisits: parseInt(localStorage.getItem('localVisitorCount') || '0'),
          dailyVisits: {},
          lastVisitAt: null
        });
        setToolStats(getLocalToolStats());
      }
    };

    initRealtimeListeners();

    // 清理函數
    return () => {
      if (unsubscribeVisitor) unsubscribeVisitor();
      if (unsubscribeTool) unsubscribeTool();
      console.log('🔴 Firebase 即時監聽已停止');
    };
  }, []);

  // 渲染熱力圖
  useEffect(() => {
    if (heatmapRef.current && visitorStats && activeTab === "heatmap") {
      import('heatmap.js').then((heatmapjs) => {
        const heatmapInstance = heatmapjs.default.create({
          container: heatmapRef.current!,
          radius: 50,
          maxOpacity: 0.6,
        });

        // 模擬數據
        const points = [];
        for (let i = 0; i < 200; i++) {
          points.push({
            x: Math.floor(Math.random() * heatmapRef.current!.offsetWidth),
            y: Math.floor(Math.random() * heatmapRef.current!.offsetHeight),
            value: Math.random()
          });
        }

        heatmapInstance.setData({
          max: 1,
          data: points
        });
      }).catch(console.error);
    }
  }, [heatmapRef, activeTab, visitorStats]);

  // 準備圖表數據 (最近 30 天)
  const prepareVisitorChartData = () => {
    if (!visitorStats?.dailyVisits) return { labels: [], datasets: [] };

    const dailyVisits = visitorStats.dailyVisits as Record<string, number>;
    const sortedDates = Object.keys(dailyVisits).sort();
    // 顯示最近 30 天
    const displayDates = sortedDates.slice(-30);

    return {
      labels: displayDates,
      datasets: [
        {
          label: '每日訪問量',
          data: displayDates.map(date => dailyVisits[date] || 0),
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.5)',
          tension: 0.3
        }
      ]
    };
  };

  const prepareToolChartData = () => {
    if (!toolStats) return { labels: [], datasets: [] };

    return {
      labels: toolStats.slice(0, 10).map(stat => `工具 ${stat.toolId}`),
      datasets: [
        {
          label: '使用次數',
          data: toolStats.slice(0, 10).map(stat => stat.totalClicks),
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(199, 199, 199, 0.7)',
            'rgba(83, 102, 255, 0.7)',
            'rgba(255, 99, 255, 0.7)',
            'rgba(255, 23, 68, 0.7)',
          ]
        }
      ]
    };
  };

  const visitorChartData = prepareVisitorChartData();
  const toolChartData = prepareToolChartData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* 頂部導覽列 */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-6">
          {/* 手機端：緊湊佈局 */}
          <div className="flex items-center justify-between gap-2">
            {/* 返回首頁 */}
            <Link href="/">
              <a className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors shrink-0">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">返回首頁</span>
              </a>
            </Link>

            {/* 標題 */}
            <div className="flex-1 min-w-0 mx-2 sm:mx-4">
              <h1 className="text-base sm:text-2xl md:text-3xl font-bold flex items-center gap-1 sm:gap-2 truncate">
                <span className="hidden sm:inline">📊</span>
                <span className="truncate">分析儀表板</span>
                {/* 即時連線狀態指示器 */}
                {isRealtime && (
                  <span className="flex items-center gap-1 text-[10px] sm:text-sm font-normal bg-green-500/20 px-1.5 sm:px-2 py-0.5 rounded-full shrink-0">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-green-200 hidden sm:inline">即時</span>
                  </span>
                )}
              </h1>
              {lastUpdated && (
                <p className="text-white/60 text-[10px] sm:text-sm mt-0.5 truncate hidden sm:block">
                  最後更新: {lastUpdated.toLocaleTimeString('zh-TW')}
                </p>
              )}
            </div>

            {/* 導出按鈕 */}
            <div className="relative group shrink-0">
              <Button
                size="sm"
                className="bg-white/20 hover:bg-white/30 border-0 px-2 sm:px-3"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">下載</span>
              </Button>
              <div className="absolute right-0 top-full mt-1 w-44 sm:w-48 bg-white rounded-lg shadow-xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <button
                  className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg flex items-center gap-2"
                  onClick={() => {
                    // CSV 匯出
                    import('@/lib/data').then(({ tools }) => {
                      const now = new Date();
                      const dateStr = now.toISOString().split('T')[0];
                      const timeStr = now.toTimeString().split(' ')[0];

                      const categoryLabels: Record<string, string> = {
                        communication: '溝通互動', teaching: '教學輔助', language: '語言學習',
                        reading: '閱讀素養', utilities: '實用工具', games: '趣味遊戲', interactive: '互動體驗',
                      };

                      const categoryStats: Record<string, number> = {};
                      toolStats?.forEach(stat => {
                        const tool = tools.find(t => t.id === stat.toolId);
                        if (tool) categoryStats[tool.category] = (categoryStats[tool.category] || 0) + stat.totalClicks;
                      });

                      const totalClicks = toolStats?.reduce((sum, stat) => sum + stat.totalClicks, 0) || 0;
                      const dailyVisits = visitorStats?.dailyVisits as Record<string, number> || {};
                      const sortedDates = Object.keys(dailyVisits).sort();

                      const reportData = [
                        ['教育科技創新專區 - 網站分析報告'], [''],
                        ['報告日期', dateStr], ['報告時間', timeStr],
                        ['時間範圍', '最近 30 天'], [''],
                        ['總訪問量', visitorStats?.totalVisits || 0],
                        ['工具使用次數', totalClicks], ['工具總數', tools.length], [''],
                        ['分類', '使用次數', '佔比'],
                        ...Object.entries(categoryStats).sort((a, b) => b[1] - a[1])
                          .map(([cat, count]) => [categoryLabels[cat] || cat, count, `${((count / totalClicks) * 100).toFixed(1)}%`]),
                        [''],
                        ['排名', '工具名稱', '分類', '使用次數'],
                        ...(toolStats?.slice(0, 20).map((stat, i) => {
                          const tool = tools.find(t => t.id === stat.toolId);
                          return [i + 1, tool?.title || stat.toolId, categoryLabels[tool?.category || ''] || '', stat.totalClicks];
                        }) || []),
                        [''],
                        ['日期', '訪問次數'],
                        ...sortedDates.slice(-30).map(date => [date, dailyVisits[date] || 0]),
                      ];

                      const csvContent = reportData.map(row => row.join(',')).join('\n');
                      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
                      const link = document.createElement('a');
                      link.href = URL.createObjectURL(blob);
                      link.download = `分析報告_${dateStr}.csv`;
                      link.click();
                    });
                  }}
                >
                  <span className="text-green-600">📊</span> CSV 格式
                </button>
                <button
                  className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  onClick={() => {
                    // Excel (TSV) 匯出 - 可用 Excel 直接開啟
                    import('@/lib/data').then(({ tools }) => {
                      const now = new Date();
                      const dateStr = now.toISOString().split('T')[0];

                      const categoryLabels: Record<string, string> = {
                        communication: '溝通互動', teaching: '教學輔助', language: '語言學習',
                        reading: '閱讀素養', utilities: '實用工具', games: '趣味遊戲', interactive: '互動體驗',
                      };

                      const totalClicks = toolStats?.reduce((sum, stat) => sum + stat.totalClicks, 0) || 0;

                      // Excel 友好格式 (Tab 分隔)
                      const rows = [
                        ['ID', '工具名稱', '分類', '使用次數', '佔比', '標籤'],
                        ...tools.map(tool => {
                          const stat = toolStats?.find(s => s.toolId === tool.id);
                          const clicks = stat?.totalClicks || 0;
                          return [
                            tool.id,
                            tool.title,
                            categoryLabels[tool.category] || tool.category,
                            clicks,
                            totalClicks > 0 ? `${((clicks / totalClicks) * 100).toFixed(1)}%` : '0%',
                            tool.tags?.join(', ') || ''
                          ];
                        })
                      ];

                      const tsvContent = rows.map(row => row.join('\t')).join('\n');
                      const blob = new Blob(['\uFEFF' + tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
                      const link = document.createElement('a');
                      link.href = URL.createObjectURL(blob);
                      link.download = `工具統計_${dateStr}.xls`;
                      link.click();
                    });
                  }}
                >
                  <span className="text-blue-600">📑</span> Excel 格式
                </button>
                <button
                  className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg flex items-center gap-2 border-t"
                  onClick={() => {
                    // JSON 匯出 - 完整數據
                    const now = new Date();
                    const dateStr = now.toISOString().split('T')[0];

                    const exportData = {
                      generatedAt: now.toISOString(),
                      timeRange: '30d',
                      visitorStats,
                      toolStats,
                      deviceStats: JSON.parse(localStorage.getItem('visitorDeviceStats') || '{}'),
                      geoStats: JSON.parse(localStorage.getItem('visitorGeoStats') || '{}'),
                      clickData: JSON.parse(localStorage.getItem('clickHeatmapData') || '[]'),
                    };

                    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `完整數據_${dateStr}.json`;
                    link.click();
                  }}
                >
                  <span className="text-purple-600">📦</span> JSON 原始數據
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* 統計卡片 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow border-0">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-muted-foreground text-xs sm:text-sm">總訪問量</p>
                <h3 className="text-xl sm:text-2xl font-bold truncate">{visitorStats?.totalVisits || 0}</h3>
                <p className="text-xs sm:text-sm text-green-600">+5.2% 比上週</p>
              </div>
              <Users className="h-10 w-10 sm:h-12 sm:w-12 text-blue-500 bg-blue-100 p-2 sm:p-2.5 rounded-full shrink-0" />
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow border-0">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-muted-foreground text-xs sm:text-sm">本週流量</p>
                <h3 className="text-xl sm:text-2xl font-bold">1,204</h3>
                <p className="text-xs sm:text-sm text-red-600">-1.8% 比上週</p>
              </div>
              <TrendingUp className="h-10 w-10 sm:h-12 sm:w-12 text-orange-500 bg-orange-100 p-2 sm:p-2.5 rounded-full shrink-0" />
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow border-0">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-muted-foreground text-xs sm:text-sm">平均停留</p>
                <h3 className="text-xl sm:text-2xl font-bold">3m 24s</h3>
                <p className="text-xs sm:text-sm text-green-600">+12% 比上週</p>
              </div>
              <Clock className="h-10 w-10 sm:h-12 sm:w-12 text-green-500 bg-green-100 p-2 sm:p-2.5 rounded-full shrink-0" />
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow border-0">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-muted-foreground text-xs sm:text-sm">跳出率</p>
                <h3 className="text-xl sm:text-2xl font-bold">28.5%</h3>
                <p className="text-xs sm:text-sm text-green-600">-3.2% 比上週</p>
              </div>
              <MousePointer className="h-10 w-10 sm:h-12 sm:w-12 text-purple-500 bg-purple-100 p-2 sm:p-2.5 rounded-full shrink-0" />
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 sm:grid-cols-6 mb-4 bg-white/80 p-0.5 sm:p-1 rounded-lg w-full h-auto">
            <TabsTrigger value="overview" className="text-[10px] sm:text-sm px-1 sm:px-3 py-1.5 sm:py-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2">
              <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="leading-tight">總覽</span>
            </TabsTrigger>
            <TabsTrigger value="visitors" className="text-[10px] sm:text-sm px-1 sm:px-3 py-1.5 sm:py-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2">
              <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="leading-tight">訪問</span>
            </TabsTrigger>
            <TabsTrigger value="tools" className="text-[10px] sm:text-sm px-1 sm:px-3 py-1.5 sm:py-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2">
              <BarChart2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="leading-tight">工具</span>
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="text-[10px] sm:text-sm px-1 sm:px-3 py-1.5 sm:py-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2">
              <PieChartIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="leading-tight">熱力</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="text-[10px] sm:text-sm px-1 sm:px-3 py-1.5 sm:py-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2">
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="leading-tight">日曆</span>
            </TabsTrigger>
            <TabsTrigger value="wishes" className="text-[10px] sm:text-sm px-1 sm:px-3 py-1.5 sm:py-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2">
              <span className="text-sm">✨</span>
              <span className="leading-tight">許願池</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>訪問者趨勢</CardTitle>
                <CardDescription>
                  最近 30 天的每日訪問量
                </CardDescription>
              </CardHeader>
              <CardContent>
                {visitorChartData.labels.length > 0 && (
                  <LineChart
                    data={visitorChartData}
                    height={300}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { position: 'top' },
                        tooltip: { mode: 'index' }
                      },
                      scales: {
                        y: { beginAtZero: true }
                      }
                    }}
                  />
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>工具使用分布</CardTitle>
                  <CardDescription>最常使用的工具統計</CardDescription>
                </CardHeader>
                <CardContent>
                  {toolChartData.labels.length > 0 && (
                    <PieChart
                      data={toolChartData}
                      height={250}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { position: 'right' }
                        }
                      }}
                    />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>訪問來源</CardTitle>
                  <CardDescription>用戶來源渠道分析（真實數據）</CardDescription>
                </CardHeader>
                <CardContent>
                  {(() => {
                    // 從 LocalStorage 讀取真實的 referrer 追蹤數據
                    const getReferrerData = () => {
                      try {
                        const data = localStorage.getItem('visitorReferrerStats');
                        if (data) return JSON.parse(data);
                      } catch (e) { }
                      return { direct: 0, search: 0, social: 0, email: 0, external: 0 };
                    };

                    const stats = getReferrerData();
                    const total = Object.values(stats).reduce((a: number, b: any) => a + (b as number), 0);

                    const sources = [
                      { key: 'direct', label: '直接訪問', count: stats.direct || 0, color: 'bg-blue-500' },
                      { key: 'search', label: '搜索引擎', count: stats.search || 0, color: 'bg-red-400' },
                      { key: 'social', label: '社交媒體', count: stats.social || 0, color: 'bg-yellow-400' },
                      { key: 'email', label: '郵件推廣', count: stats.email || 0, color: 'bg-teal-400' },
                      { key: 'external', label: '外部連結', count: stats.external || 0, color: 'bg-purple-400' },
                    ];

                    const maxCount = Math.max(...sources.map(s => s.count), 1);

                    return (
                      <div className="space-y-3">
                        {total === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>尚無訪問來源數據</p>
                            <p className="text-sm mt-1">當有訪客進入時，將開始追蹤來源</p>
                          </div>
                        ) : (
                          <>
                            {sources.map(source => {
                              const percent = total > 0 ? ((source.count / total) * 100).toFixed(1) : '0';
                              const barWidth = maxCount > 0 ? (source.count / maxCount) * 100 : 0;
                              return (
                                <div key={source.key} className="flex items-center gap-3">
                                  <span className="w-20 text-sm font-medium truncate">{source.label}</span>
                                  <div className="flex-1 h-8 bg-muted rounded-md overflow-hidden">
                                    <div
                                      className={`h-full ${source.color} transition-all duration-500 flex items-center justify-end pr-2`}
                                      style={{ width: `${barWidth}%` }}
                                    >
                                      {source.count > 0 && (
                                        <span className="text-xs text-white font-medium">{source.count}</span>
                                      )}
                                    </div>
                                  </div>
                                  <span className="w-12 text-right text-sm text-muted-foreground">{percent}%</span>
                                </div>
                              );
                            })}
                            <div className="flex justify-between items-center pt-2 border-t mt-3">
                              <span className="text-sm text-muted-foreground">總訪問來源</span>
                              <span className="text-lg font-bold text-indigo-600">{total}</span>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="visitors">
            <Card>
              <CardHeader>
                <CardTitle>訪問者詳細分析</CardTitle>
                <CardDescription>使用者行為與瀏覽模式</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {/* 地理分布 - 使用台灣縣市 */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">🗺️ 訪問者地理分布</h3>
                    {(() => {
                      // 從 LocalStorage 獲取地理數據
                      const getGeoData = () => {
                        try {
                          const data = localStorage.getItem('visitorGeoStats');
                          if (data) return JSON.parse(data);
                        } catch (e) { }
                        // 預設數據 (初次載入時模擬台灣主要城市)
                        return {
                          '台北市': 45,
                          '新北市': 32,
                          '台中市': 28,
                          '高雄市': 22,
                          '桃園市': 18,
                          '台南市': 15,
                          '新竹市': 12,
                          '其他': 20
                        };
                      };

                      const geoData = getGeoData();
                      const total = Object.values(geoData).reduce((a: number, b: any) => a + b, 0);
                      const sortedData = Object.entries(geoData)
                        .sort((a: any, b: any) => b[1] - a[1])
                        .slice(0, 8);
                      const maxValue = Math.max(...sortedData.map((d: any) => d[1]));

                      const colors = [
                        'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500',
                        'bg-green-500', 'bg-teal-500', 'bg-orange-500', 'bg-slate-400'
                      ];

                      return (
                        <div className="space-y-3">
                          {sortedData.map(([city, count]: [string, any], index) => {
                            const percent = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                            const barWidth = maxValue > 0 ? (count / maxValue) * 100 : 0;
                            return (
                              <div key={city} className="flex items-center gap-3">
                                <span className="w-16 text-sm font-medium truncate">{city}</span>
                                <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${colors[index]} transition-all duration-500 flex items-center justify-end pr-2`}
                                    style={{ width: `${barWidth}%` }}
                                  >
                                    <span className="text-xs text-white font-medium">{count}</span>
                                  </div>
                                </div>
                                <span className="w-12 text-right text-sm text-muted-foreground">{percent}%</span>
                              </div>
                            );
                          })}
                          <div className="flex justify-between items-center pt-2 border-t mt-4">
                            <span className="text-sm text-muted-foreground">總訪問數</span>
                            <span className="text-lg font-bold text-indigo-600">{total}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* 設備分析 - 使用真實的 UA 追蹤 */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">📱 設備分析</h3>
                    {(() => {
                      // 從 LocalStorage 獲取設備數據
                      const getDeviceData = () => {
                        try {
                          const data = localStorage.getItem('visitorDeviceStats');
                          if (data) return JSON.parse(data);
                        } catch (e) { }
                        // 偵測當前設備並更新
                        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                        const isTablet = /iPad|Android/i.test(navigator.userAgent) && !/Mobile/i.test(navigator.userAgent);

                        const defaultData = { desktop: 0, mobile: 0, tablet: 0 };
                        if (isTablet) defaultData.tablet = 1;
                        else if (isMobile) defaultData.mobile = 1;
                        else defaultData.desktop = 1;

                        localStorage.setItem('visitorDeviceStats', JSON.stringify(defaultData));
                        return defaultData;
                      };

                      const deviceData = getDeviceData();
                      const total = deviceData.desktop + deviceData.mobile + deviceData.tablet || 1;

                      const devices = [
                        {
                          name: '桌面',
                          count: deviceData.desktop,
                          percent: ((deviceData.desktop / total) * 100).toFixed(0),
                          color: 'bg-blue-600',
                          icon: '🖥️'
                        },
                        {
                          name: '行動裝置',
                          count: deviceData.mobile,
                          percent: ((deviceData.mobile / total) * 100).toFixed(0),
                          color: 'bg-green-600',
                          icon: '📱'
                        },
                        {
                          name: '平板',
                          count: deviceData.tablet,
                          percent: ((deviceData.tablet / total) * 100).toFixed(0),
                          color: 'bg-purple-600',
                          icon: '📟'
                        }
                      ];

                      return (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {devices.map(device => (
                            <Card key={device.name}>
                              <CardContent className="p-4 text-center">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                  <span className="text-xl">{device.icon}</span>
                                  <h4 className="text-muted-foreground">{device.name}</h4>
                                </div>
                                <p className="text-3xl font-bold my-2">{device.percent}%</p>
                                <div className="w-full bg-muted rounded-full h-2.5">
                                  <div
                                    className={`${device.color} h-2.5 rounded-full transition-all duration-500`}
                                    style={{ width: `${device.percent}%` }}
                                  ></div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">{device.count} 次訪問</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wishes">
            <Card>
              <CardHeader>
                <CardTitle>老師們的許願池</CardTitle>
                <CardDescription>查閱並管理使用者提出的新工具建議與星等回饋</CardDescription>
              </CardHeader>
              <CardContent>
                <WishingWellAdmin />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools">
            <Card>
              <CardHeader>
                <CardTitle>工具使用統計</CardTitle>
                <CardDescription>最受歡迎工具及使用頻率</CardDescription>
              </CardHeader>
              <CardContent>
                {toolStats && toolStats.length > 0 ? (
                  <BarChart
                    data={{
                      labels: toolStats.map(stat => `工具 ${stat.toolId}`),
                      datasets: [{
                        label: '使用次數',
                        data: toolStats.map(stat => stat.totalClicks),
                        backgroundColor: 'rgba(99, 102, 241, 0.7)',
                        borderColor: 'rgb(99, 102, 241)',
                        borderWidth: 1
                      }]
                    }}
                    height={400}
                    options={{
                      onClick: async (_event, elements) => {
                        if (elements && elements.length > 0) {
                          const index = elements[0].index;
                          const toolId = toolStats?.[index]?.toolId;
                          if (toolId) {
                            try {
                              const trackingModule = await import('@/hooks/useToolTracking');
                              const { useToolTracking } = trackingModule;
                              const { trackToolUsage } = useToolTracking();

                              await trackToolUsage(toolId);

                              // 立即強制更新統計數據，使用正確的查詢鍵
                              queryClient.invalidateQueries({
                                queryKey: ['/api/tools/stats'],
                                refetchType: 'all'
                              });
                              queryClient.invalidateQueries({
                                queryKey: ['/api/tools/rankings'],
                                refetchType: 'all'
                              });

                              // 確保所有相關查詢都會刷新
                              queryClient.refetchQueries({
                                predicate: (query) =>
                                  query.queryKey[0] === '/api/tools' ||
                                  String(query.queryKey[0]).includes('tools'),
                                type: 'all'
                              });

                              console.log('工具使用已追蹤並更新統計:', toolId);
                            } catch (error) {
                              console.error('工具使用追蹤失敗:', error);
                            }
                          }
                        }
                      },
                      responsive: true,
                      plugins: {
                        legend: { display: false }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: '點擊次數'
                          }
                        },
                        x: {
                          title: {
                            display: true,
                            text: '工具名稱'
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                    暫無工具使用數據
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="heatmap">
            <Card>
              <CardHeader>
                <CardTitle>🔥 用戶行為熱力圖</CardTitle>
                <CardDescription>顯示用戶在頁面上的點擊與互動熱點（基於真實點擊數據）</CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  // 動態獲取點擊數據
                  const getClickData = () => {
                    try {
                      const data = localStorage.getItem('clickHeatmapData');
                      if (data) return JSON.parse(data);
                    } catch (e) { }
                    return [];
                  };

                  const clickData = getClickData();
                  const totalClicks = clickData.length;

                  // 聚合點擊到 10x10 網格
                  const gridSize = 10;
                  const grid: Record<string, number> = {};
                  clickData.forEach((click: { x: number; y: number }) => {
                    const gridX = Math.floor(click.x / gridSize);
                    const gridY = Math.floor(click.y / gridSize);
                    const key = `${gridX}-${gridY}`;
                    grid[key] = (grid[key] || 0) + 1;
                  });

                  const maxValue = Math.max(...Object.values(grid), 1);

                  // 計算點擊時段分布
                  const hourlyClicks: Record<number, number> = {};
                  clickData.forEach((click: { timestamp: number }) => {
                    const hour = new Date(click.timestamp).getHours();
                    hourlyClicks[hour] = (hourlyClicks[hour] || 0) + 1;
                  });

                  return (
                    <div className="space-y-6">
                      {/* 統計摘要 */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-lg text-center">
                          <p className="text-sm text-muted-foreground">總點擊次數</p>
                          <p className="text-2xl font-bold text-orange-600">{totalClicks}</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg text-center">
                          <p className="text-sm text-muted-foreground">熱點區域</p>
                          <p className="text-2xl font-bold text-blue-600">{Object.keys(grid).length}</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-lg text-center">
                          <p className="text-sm text-muted-foreground">最熱區域點擊</p>
                          <p className="text-2xl font-bold text-green-600">{maxValue}</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg text-center">
                          <p className="text-sm text-muted-foreground">平均每區域</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {Object.keys(grid).length > 0 ? (totalClicks / Object.keys(grid).length).toFixed(1) : 0}
                          </p>
                        </div>
                      </div>

                      {/* 熱力圖網格 */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">頁面熱力分布</h4>
                        <div
                          className="relative bg-slate-100 rounded-lg overflow-hidden"
                          style={{ aspectRatio: '16/9' }}
                        >
                          {/* 網格背景 */}
                          <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
                            {Array.from({ length: 100 }).map((_, i) => {
                              const gridX = i % 10;
                              const gridY = Math.floor(i / 10);
                              const key = `${gridX}-${gridY}`;
                              const value = grid[key] || 0;
                              const intensity = maxValue > 0 ? value / maxValue : 0;

                              // 顏色從藍色到紅色
                              const hue = (1 - intensity) * 240; // 240 = 藍, 0 = 紅

                              return (
                                <div
                                  key={i}
                                  className="border border-white/20 transition-all hover:scale-105"
                                  style={{
                                    backgroundColor: value > 0 ? `hsla(${hue}, 80%, 50%, ${0.3 + intensity * 0.7})` : 'transparent'
                                  }}
                                  title={`區域 (${gridX}, ${gridY}): ${value} 次點擊`}
                                />
                              );
                            })}
                          </div>

                          {/* 中心提示 */}
                          {totalClicks === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-white/90 p-4 rounded-lg text-center shadow-lg">
                                <p className="font-medium mb-2">尚無點擊數據</p>
                                <p className="text-sm text-muted-foreground">在網站上點擊互動後，這裡會顯示熱力圖</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 圖例 */}
                        <div className="flex items-center justify-center gap-2 mt-3">
                          <span className="text-xs text-muted-foreground">冷</span>
                          <div className="flex h-3 w-32 rounded overflow-hidden">
                            <div className="flex-1 bg-blue-500"></div>
                            <div className="flex-1 bg-cyan-500"></div>
                            <div className="flex-1 bg-green-500"></div>
                            <div className="flex-1 bg-yellow-500"></div>
                            <div className="flex-1 bg-orange-500"></div>
                            <div className="flex-1 bg-red-500"></div>
                          </div>
                          <span className="text-xs text-muted-foreground">熱</span>
                        </div>
                      </div>

                      {/* 點擊時段分布 */}
                      {totalClicks > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">點擊時段分布（24小時）</h4>
                          <div className="flex items-end gap-1 h-24">
                            {Array.from({ length: 24 }).map((_, hour) => {
                              const count = hourlyClicks[hour] || 0;
                              const maxHourly = Math.max(...Object.values(hourlyClicks), 1);
                              const height = (count / maxHourly) * 100;

                              return (
                                <div
                                  key={hour}
                                  className="flex-1 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t transition-all hover:from-indigo-600 hover:to-purple-600"
                                  style={{ height: `${height}%`, minHeight: count > 0 ? '4px' : '0' }}
                                  title={`${hour}:00 - ${hour + 1}:00: ${count} 次點擊`}
                                />
                              );
                            })}
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>0時</span>
                            <span>6時</span>
                            <span>12時</span>
                            <span>18時</span>
                            <span>24時</span>
                          </div>
                        </div>
                      )}

                      {/* 清除按鈕 */}
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            localStorage.removeItem('clickHeatmapData');
                            window.location.reload();
                          }}
                        >
                          清除點擊數據
                        </Button>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg sm:text-xl">📅 日曆視圖</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">按日期查看訪問數據</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                {(() => {
                  // 獲取訪問數據
                  const dailyVisits = visitorStats?.dailyVisits as Record<string, number> || {};
                  const today = new Date();

                  // 週視圖：顯示最近7天
                  const weekDays: { date: string; dayName: string; day: number; month: string; visits: number; isToday: boolean }[] = [];
                  for (let i = 6; i >= 0; i--) {
                    const date = new Date(today);
                    date.setDate(date.getDate() - i);
                    const dateStr = date.toISOString().split('T')[0];
                    const dayNames = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
                    weekDays.push({
                      date: dateStr,
                      dayName: dayNames[date.getDay()],
                      day: date.getDate(),
                      month: `${date.getMonth() + 1}月`,
                      visits: dailyVisits[dateStr] || 0,
                      isToday: i === 0
                    });
                  }

                  // 月視圖：顯示最近30天
                  const monthDays: { date: string; day: number; visits: number; isToday: boolean }[] = [];
                  for (let i = 29; i >= 0; i--) {
                    const date = new Date(today);
                    date.setDate(date.getDate() - i);
                    const dateStr = date.toISOString().split('T')[0];
                    monthDays.push({
                      date: dateStr,
                      day: date.getDate(),
                      visits: dailyVisits[dateStr] || 0,
                      isToday: i === 0
                    });
                  }

                  const maxWeekVisits = Math.max(...weekDays.map(d => d.visits), 1);
                  const maxMonthVisits = Math.max(...monthDays.map(d => d.visits), 1);
                  const totalVisits = Object.values(dailyVisits).reduce((a, b) => a + b, 0);
                  const weekTotal = weekDays.reduce((a, b) => a + b.visits, 0);
                  const weekAvg = (weekTotal / 7).toFixed(1);

                  return (
                    <div className="space-y-6">
                      {/* 週視圖 - 大卡片顯示，適合手機 */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold flex items-center gap-2">
                            <span className="text-indigo-600">📊</span> 本週詳細數據
                          </h4>
                          <div className="text-xs text-muted-foreground">
                            平均: <span className="font-medium text-indigo-600">{weekAvg}</span>/天
                          </div>
                        </div>

                        {/* 週視圖卡片 - RWD 響應式 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2 sm:gap-3">
                          {weekDays.map((item, i) => {
                            const heightPercent = maxWeekVisits > 0 ? (item.visits / maxWeekVisits) * 100 : 0;
                            return (
                              <div
                                key={i}
                                className={`relative overflow-hidden rounded-xl border transition-all hover:shadow-md ${item.isToday
                                  ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-300 ring-2 ring-indigo-200'
                                  : 'bg-white hover:bg-gray-50'
                                  }`}
                              >
                                {/* 手機版：水平佈局 */}
                                <div className="sm:hidden flex items-center justify-between p-3">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center ${item.isToday ? 'bg-indigo-600 text-white' : 'bg-gray-100'
                                      }`}>
                                      <span className="text-[10px] opacity-80">{item.month}</span>
                                      <span className="text-lg font-bold leading-none">{item.day}</span>
                                    </div>
                                    <div>
                                      <div className={`text-sm font-medium ${item.isToday ? 'text-indigo-600' : ''}`}>
                                        {item.dayName} {item.isToday && <span className="text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full ml-1">今天</span>}
                                      </div>
                                      <div className="text-xs text-muted-foreground">{item.date}</div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className={`text-2xl font-bold ${item.visits > 0 ? 'text-indigo-600' : 'text-gray-300'}`}>
                                      {item.visits}
                                    </div>
                                    <div className="text-xs text-muted-foreground">次訪問</div>
                                  </div>
                                </div>

                                {/* 桌面版：垂直佈局 */}
                                <div className="hidden sm:block p-3 text-center">
                                  <div className={`text-xs mb-1 ${item.isToday ? 'text-indigo-600 font-semibold' : 'text-muted-foreground'}`}>
                                    {item.dayName}
                                  </div>
                                  <div className={`text-lg font-bold ${item.isToday ? 'text-indigo-600' : ''}`}>
                                    {item.day}
                                  </div>
                                  <div className="text-[10px] text-muted-foreground mb-2">{item.month}</div>

                                  {/* 訪問量柱狀圖 */}
                                  <div className="h-16 flex items-end justify-center">
                                    <div
                                      className={`w-8 rounded-t transition-all ${item.visits > 0
                                        ? 'bg-gradient-to-t from-indigo-500 to-purple-400'
                                        : 'bg-gray-200'
                                        }`}
                                      style={{ height: `${Math.max(heightPercent, 8)}%` }}
                                    />
                                  </div>

                                  <div className={`text-sm font-bold mt-2 ${item.visits > 0 ? 'text-indigo-600' : 'text-gray-300'}`}>
                                    {item.visits}
                                  </div>

                                  {item.isToday && (
                                    <span className="inline-block text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full mt-1">
                                      今天
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* 月視圖 - 緊湊網格 */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold flex items-center gap-2">
                            <span className="text-purple-600">🗓️</span> 月度熱力圖
                          </h4>
                          <div className="text-xs text-muted-foreground">
                            總計: <span className="font-medium text-purple-600">{totalVisits}</span> 次
                          </div>
                        </div>

                        {/* 星期標題 */}
                        <div className="grid grid-cols-7 gap-1 mb-1">
                          {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                            <div key={day} className="text-center text-[10px] sm:text-xs text-muted-foreground font-medium py-1">
                              {day}
                            </div>
                          ))}
                        </div>

                        {/* 月視圖格子 - 響應式大小 */}
                        <div className="grid grid-cols-7 gap-1">
                          {monthDays.map((item, i) => {
                            const intensity = maxMonthVisits > 0 ? item.visits / maxMonthVisits : 0;
                            const bgColor = item.visits > 0
                              ? `rgba(99, 102, 241, ${0.2 + intensity * 0.6})`
                              : 'transparent';

                            return (
                              <div
                                key={i}
                                className={`aspect-square border rounded flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 ${item.isToday ? 'ring-2 ring-purple-400 border-purple-300' : 'hover:border-indigo-300'
                                  }`}
                                style={{ backgroundColor: bgColor }}
                                title={`${item.date}: ${item.visits} 次訪問`}
                              >
                                <span className={`text-[10px] sm:text-xs font-medium ${item.isToday ? 'text-purple-600' : ''}`}>
                                  {item.day}
                                </span>
                                {item.visits > 0 && (
                                  <span className="text-[8px] sm:text-[10px] text-indigo-600 font-medium">
                                    {item.visits}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* 圖例 */}
                      <div className="flex flex-wrap justify-between items-center gap-2 pt-2 border-t">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded bg-indigo-500/20"></div>
                            <span className="text-[10px] sm:text-xs text-muted-foreground">低</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded bg-indigo-500/50"></div>
                            <span className="text-[10px] sm:text-xs text-muted-foreground">中</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded bg-indigo-500"></div>
                            <span className="text-[10px] sm:text-xs text-muted-foreground">高</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-purple-400 ring-2 ring-purple-200"></span>
                          <span className="text-[10px] sm:text-xs text-muted-foreground">今天</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div >
  );
}