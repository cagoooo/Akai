import { useState, useEffect, useRef, useMemo } from "react";
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
import {
  DateRangePicker,
  presetToRange,
  filterDailyVisits,
  toDateStr,
  type DateRange,
} from "@/components/admin/DateRangePicker";

// 檢測是否為靜態部署環境
const isStaticDeployment = () => {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.includes('github.io') ||
    window.location.hostname.includes('netlify.app') ||
    window.location.hostname.includes('vercel.app');
};

export function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  // 日期範圍篩選（預設「最近 30 天」）
  const [dateRange, setDateRange] = useState<DateRange>(() => presetToRange('last30'));

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

  // 全站累計的 訪客 context（地理 / 裝置 / 來源），來自 Firestore analytics/visitorContext
  const [serverContext, setServerContext] = useState<{
    geoStats?: Record<string, number>;
    deviceStats?: Record<string, number>;
    referrerStats?: Record<string, number>;
  }>({});

  // 訂閱 analytics/visitorContext（全站累計訪客 context）
  useEffect(() => {
    let unsub: (() => void) | undefined;
    let cancelled = false;
    (async () => {
      try {
        const { db, isFirebaseAvailable } = await import('@/lib/firebase');
        if (!isFirebaseAvailable() || !db) return;
        const { doc, onSnapshot } = await import('firebase/firestore');
        unsub = onSnapshot(doc(db, 'analytics', 'visitorContext'), (snap) => {
          if (cancelled) return;
          if (snap.exists()) {
            const d = snap.data() as any;
            setServerContext({
              geoStats: d.geoStats || {},
              deviceStats: d.deviceStats || {},
              referrerStats: d.referrerStats || {},
            });
          }
        });
      } catch (err) {
        console.warn('[AnalyticsDashboard] visitorContext 訂閱失敗:', err);
      }
    })();
    return () => {
      cancelled = true;
      if (unsub) unsub();
    };
  }, []);

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

  // 準備圖表數據（依日期範圍篩選）— 範圍內每日填滿（沒資料補 0），便於趨勢線連續
  const prepareVisitorChartData = () => {
    const dailyVisits = (visitorStats?.dailyVisits as Record<string, number>) || {};
    const labels: string[] = [];
    const data: number[] = [];
    const cur = new Date(dateRange.from);
    cur.setHours(0, 0, 0, 0);
    const end = new Date(dateRange.to);
    end.setHours(0, 0, 0, 0);
    while (cur <= end) {
      const ds = toDateStr(cur);
      labels.push(ds);
      data.push(dailyVisits[ds] || 0);
      cur.setDate(cur.getDate() + 1);
    }
    return {
      labels,
      datasets: [
        {
          label: `每日訪問量（${dateRange.label}）`,
          data,
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.5)',
          tension: 0.3,
        },
      ],
    };
  };

  // 範圍內統計摘要：總訪問、平均、峰值
  const rangeStats = useMemo(() => {
    const dailyVisits = (visitorStats?.dailyVisits as Record<string, number>) || {};
    const entries = filterDailyVisits(dailyVisits, dateRange);
    const total = entries.reduce((sum, [, n]) => sum + n, 0);
    const days = Math.max(
      1,
      Math.round((dateRange.to.getTime() - dateRange.from.getTime()) / 86400000) + 1
    );
    const avg = total / days;
    const peak = entries.reduce((m, [, n]) => Math.max(m, n), 0);
    // 與「上一段同等長度的範圍」比較
    const prevTo = new Date(dateRange.from);
    prevTo.setDate(prevTo.getDate() - 1);
    const prevFrom = new Date(prevTo);
    prevFrom.setDate(prevFrom.getDate() - (days - 1));
    const prevRange: DateRange = {
      preset: 'custom',
      from: prevFrom,
      to: prevTo,
      label: '前一段',
    };
    const prevTotal = filterDailyVisits(dailyVisits, prevRange).reduce(
      (sum, [, n]) => sum + n,
      0
    );
    const deltaPct =
      prevTotal === 0 ? (total > 0 ? 100 : 0) : ((total - prevTotal) / prevTotal) * 100;
    return { total, avg, peak, days, prevTotal, deltaPct };
  }, [visitorStats?.dailyVisits, dateRange]);

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
    <div className="cork-bg min-h-screen" style={{ fontFamily: "'Noto Sans TC', sans-serif", paddingTop: 18 }}>
      {/* 上方木條（cork 風格） */}
      <div
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, height: 18, zIndex: 30, pointerEvents: 'none',
          background: 'repeating-linear-gradient(90deg, #7c4f2a, #7c4f2a 40px, #6b4220 40px, #6b4220 42px, #8a5a32 42px, #8a5a32 90px, #6b4220 90px, #6b4220 92px)',
          boxShadow: 'inset 0 -2px 4px rgba(0,0,0,.3), 0 2px 6px rgba(0,0,0,.2)',
        }}
      />

      {/* 頂部導覽列 — cork 深色紙板風 */}
      <header style={{ background: 'rgba(26,15,5,.88)', color: '#fff', borderBottom: '3px solid #1a1a1a' }}>
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-6">
          {/* 手機端：緊湊佈局 */}
          <div className="flex items-center justify-between gap-2">
            {/* 返回首頁 — cork 白底按鈕 */}
            <Link
              href="/"
              className="flex items-center gap-1 px-3 py-2 shrink-0"
              style={{
                background: '#fefdfa',
                color: '#1a1a1a',
                border: '2px solid #1a1a1a',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 800,
                boxShadow: '2px 2px 0 rgba(0,0,0,.35)',
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">返回首頁</span>
            </Link>

            {/* 標題 — cork 膠帶風 */}
            <div className="flex-1 min-w-0 mx-2 sm:mx-4">
              <h1 className="text-base sm:text-2xl md:text-3xl font-bold flex items-center gap-2 truncate" style={{ letterSpacing: '0.03em' }}>
                <span style={{ fontSize: '1.2em' }}>📊</span>
                <span className="truncate" style={{
                  background: 'linear-gradient(transparent 55%, #ea8a3e 55%, #ea8a3e 88%, transparent 88%)',
                  padding: '0 4px',
                }}>
                  分析儀表板
                </span>
                {isRealtime && (
                  <span
                    className="flex items-center gap-1 text-[10px] sm:text-xs font-bold shrink-0"
                    style={{
                      background: '#d4f4c7',
                      color: '#1a1a1a',
                      padding: '3px 8px',
                      borderRadius: 3,
                      border: '1.5px solid #1a1a1a',
                      boxShadow: '1px 1px 0 rgba(0,0,0,.25)',
                      transform: 'rotate(-2deg)',
                    }}
                  >
                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></span>
                    即時
                  </span>
                )}
              </h1>
              {lastUpdated && (
                <p className="text-white/60 text-[10px] sm:text-sm mt-1 truncate hidden sm:block">
                  最後更新: {lastUpdated.toLocaleTimeString('zh-TW')}
                </p>
              )}
            </div>

            {/* 導出按鈕 — cork 橘色 */}
            <div className="relative group shrink-0">
              <Button
                size="sm"
                style={{
                  background: '#ea8a3e',
                  color: '#fff',
                  border: '2px solid #1a1a1a',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 800,
                  boxShadow: '2px 2px 0 rgba(0,0,0,.35)',
                  padding: '6px 12px',
                }}
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

                      // 依選擇的日期範圍篩選每日訪問
                      const rangeFromStr = toDateStr(dateRange.from);
                      const rangeToStr = toDateStr(dateRange.to);
                      const inRangeDates = sortedDates.filter(
                        (d) => d >= rangeFromStr && d <= rangeToStr
                      );
                      const rangeTotal = inRangeDates.reduce(
                        (sum, d) => sum + (dailyVisits[d] || 0),
                        0
                      );

                      const reportData = [
                        ['教育科技創新專區 - 網站分析報告'], [''],
                        ['報告日期', dateStr], ['報告時間', timeStr],
                        ['時間範圍', dateRange.label], ['範圍起', rangeFromStr], ['範圍迄', rangeToStr], [''],
                        ['總訪問量（全期累計）', visitorStats?.totalVisits || 0],
                        [`期間訪問量（${dateRange.label}）`, rangeTotal],
                        ['工具使用次數（全期累計）', totalClicks], ['工具總數', tools.length], [''],
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
                        [`日期（${dateRange.label}）`, '訪問次數'],
                        ...inRangeDates.map(date => [date, dailyVisits[date] || 0]),
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
                      timeRange: {
                        label: dateRange.label,
                        preset: dateRange.preset,
                        from: toDateStr(dateRange.from),
                        to: toDateStr(dateRange.to),
                        days: rangeStats.days,
                      },
                      rangeStats,
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

      <main className="container mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-4 sm:space-y-6">
        {/* 一次性回填本地歷史到 Firestore */}
        <BackfillLocalAnalyticsBar />

        {/* 日期範圍篩選列 */}
        <div
          className="flex flex-wrap items-center justify-between gap-3"
          style={{
            background: 'rgba(255,255,255,.7)',
            border: '2px solid #1a1a1a',
            borderRadius: 10,
            padding: '10px 14px',
            boxShadow: '3px 3px 0 rgba(0,0,0,.18)',
          }}
        >
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 13, fontWeight: 800, color: '#1a1a1a' }}>📅 顯示範圍</span>
            <span
              style={{
                fontSize: 11,
                color: '#7a8c3a',
                background: '#f5f0d4',
                padding: '2px 8px',
                borderRadius: 10,
                border: '1.5px solid #7a8c3a',
                fontWeight: 700,
              }}
            >
              {rangeStats.days} 天
            </span>
          </div>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>

        {/* 📦 每日快照備份管理（admin 才看得到） */}
        <SnapshotManagementPanel />

        {/* 統計便利貼 — cork 風四色（已連動日期範圍） */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          <StickyStatCard
            color="#fff27a"
            tilt={-1.8}
            pinColor="#dc2626"
            label="總訪問量（全期）"
            value={(visitorStats?.totalVisits || 0).toLocaleString()}
            icon={<Users className="h-6 w-6 sm:h-7 sm:w-7" />}
            delta={`累計到今天`}
            deltaColor="#4a3a20"
          />
          <StickyStatCard
            color="#ffd4d9"
            tilt={1.2}
            pinColor="#2563eb"
            label={`期間流量（${dateRange.label}）`}
            value={rangeStats.total.toLocaleString()}
            icon={<TrendingUp className="h-6 w-6 sm:h-7 sm:w-7" />}
            delta={`${rangeStats.deltaPct >= 0 ? '+' : ''}${rangeStats.deltaPct.toFixed(1)}% 比前一段`}
            deltaColor={rangeStats.deltaPct >= 0 ? '#16a34a' : '#dc2626'}
          />
          <StickyStatCard
            color="#d4f4c7"
            tilt={-1.4}
            pinColor="#eab308"
            label="期間日均"
            value={rangeStats.avg.toFixed(1)}
            icon={<Clock className="h-6 w-6 sm:h-7 sm:w-7" />}
            delta={`共 ${rangeStats.days} 天`}
            deltaColor="#4a3a20"
          />
          <StickyStatCard
            color="#c8e6ff"
            tilt={1.6}
            pinColor="#c026d3"
            label="期間單日峰值"
            value={rangeStats.peak.toLocaleString()}
            icon={<MousePointer className="h-6 w-6 sm:h-7 sm:w-7" />}
            delta="範圍內單日最多訪問"
            deltaColor="#4a3a20"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList
            className="grid grid-cols-3 sm:grid-cols-6 mb-4 w-full h-auto gap-1.5 sm:gap-2"
            style={{
              background: 'rgba(255,255,255,.55)',
              padding: 6,
              border: '2px solid #1a1a1a',
              borderRadius: 10,
              boxShadow: '3px 3px 0 rgba(0,0,0,.18)',
            }}
          >
            {[
              { value: 'overview', icon: <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4" />, label: '總覽' },
              { value: 'visitors', icon: <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />, label: '訪問' },
              { value: 'tools', icon: <BarChart2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />, label: '工具' },
              { value: 'heatmap', icon: <PieChartIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />, label: '熱力' },
              { value: 'calendar', icon: <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />, label: '日曆' },
              { value: 'wishes', icon: <span className="text-sm">✨</span>, label: '許願池' },
            ].map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-[11px] sm:text-sm px-2 sm:px-3 py-2 flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 font-bold text-slate-700 rounded-lg border-2 border-transparent transition-all data-[state=active]:bg-[#7a8c3a] data-[state=active]:text-white data-[state=active]:border-[#1a1a1a] data-[state=active]:shadow-[3px_3px_0_rgba(0,0,0,0.3)]"
                style={{ fontFamily: "'Noto Sans TC', sans-serif" }}
              >
                {tab.icon}
                <span className="leading-tight">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>訪問者趨勢</CardTitle>
                <CardDescription>
                  {dateRange.label} 的每日訪問量（共 {rangeStats.days} 天，總計 {rangeStats.total.toLocaleString()} 次）
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
                    // 優先用 Firestore 全站累計，本地 fallback
                    const getReferrerData = () => {
                      const sv = serverContext.referrerStats || {};
                      const hasServer = Object.values(sv).some((v) => (v as number) > 0);
                      if (hasServer) return { direct: 0, search: 0, social: 0, email: 0, external: 0, ...sv };
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
                      // 優先用 Firestore 全站累計，本地 fallback，再退回示意數據
                      const getGeoData = () => {
                        const sv = serverContext.geoStats || {};
                        const hasServer = Object.keys(sv).length > 0;
                        if (hasServer) return sv;
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
                      // 優先用 Firestore 全站累計，本地 fallback
                      const getDeviceData = () => {
                        const sv = serverContext.deviceStats || {};
                        const hasServer = Object.values(sv).some((v) => (v as number) > 0);
                        if (hasServer) return { desktop: 0, mobile: 0, tablet: 0, ...sv };
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
                      onClick: async (_event: unknown, elements: Array<{ index: number }>) => {
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

// ── cork 風格統計便利貼（後台儀表板 4 張卡用） ───────────────
interface StickyStatCardProps {
  color: string;        // 便利貼底色
  tilt: number;         // 傾斜角度
  pinColor: string;     // 圖釘顏色
  label: string;        // 標題（如「總訪問量」）
  value: string;        // 主數字
  icon: React.ReactNode;
  delta: string;        // 比較文字
  deltaColor: string;   // 比較文字顏色
}

function StickyStatCard({ color, tilt, pinColor, label, value, icon, delta, deltaColor }: StickyStatCardProps) {
  return (
    <div
      className="sticker-card"
      style={{
        position: 'relative',
        background: color,
        padding: '16px 18px 14px',
        borderRadius: 6,
        border: '2px solid #1a1a1a',
        boxShadow: '3px 3px 0 rgba(0,0,0,.22), 0 10px 20px -6px rgba(0,0,0,.22)',
        transform: `rotate(${tilt}deg)`,
        fontFamily: "'Noto Sans TC', sans-serif",
      }}
    >
      {/* 頂部立體圖釘 */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: -8,
          left: '50%',
          marginLeft: -8,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: `radial-gradient(circle at 30% 30%, #ffffff, ${pinColor} 55%, #000000)`,
          boxShadow: '0 2px 4px rgba(0,0,0,.35), inset -1px -1px 2px rgba(0,0,0,.3)',
          zIndex: 2,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '30%',
            left: '30%',
            width: '22%',
            height: '22%',
            borderRadius: '50%',
            background: 'rgba(255,255,255,.8)',
          }}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-bold mb-1" style={{ color: '#4a3a20', letterSpacing: '0.03em' }}>
            {label}
          </p>
          <h3 className="text-2xl sm:text-3xl font-black truncate" style={{ color: '#1a1a1a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {value}
          </h3>
          <p className="text-xs sm:text-sm mt-1 font-bold" style={{ color: deltaColor }}>
            {delta}
          </p>
        </div>
        {/* icon 框 */}
        <div
          className="shrink-0 grid place-items-center"
          style={{
            width: 48,
            height: 48,
            background: 'rgba(255,255,255,.7)',
            border: '2px solid #1a1a1a',
            borderRadius: '50%',
            color: '#1a1a1a',
            boxShadow: '2px 2px 0 rgba(0,0,0,.2)',
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 一次性回填本地歷史 → Firestore
// 為了補救 v3.6.4 之前 context 只寫 localStorage 的歷史資料
// ────────────────────────────────────────────────────────────
function BackfillLocalAnalyticsBar() {
  const [done, setDone] = useState<boolean>(() => localStorage.getItem('analyticsBackfilled') === 'v1');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // 統計本地有多少筆可上傳
  const localPreview = useMemo(() => {
    const sumMap = (key: string) => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}') as Record<string, number>;
        return Object.values(data).reduce((s, v) => s + (typeof v === 'number' ? v : 0), 0);
      } catch { return 0; }
    };
    return {
      device: sumMap('visitorDeviceStats'),
      referrer: sumMap('visitorReferrerStats'),
      geo: sumMap('visitorGeoStats'),
    };
  }, []);

  const totalLocal = localPreview.device + localPreview.referrer + localPreview.geo;

  const handleBackfill = async (force = false) => {
    if (running) return;
    setRunning(true);
    setResult(null);
    try {
      const { backfillLocalAnalytics } = await import('@/lib/visitorTracker');
      const r = await backfillLocalAnalytics({ force });
      if (!r.ok) {
        setResult(`⚠️ ${r.reason}`);
      } else {
        setResult(
          `✅ 已上傳 ${r.totalAdded} 筆（geo ${r.geoEntries} / device ${r.deviceEntries} / referrer ${r.referrerEntries}）— 重整後台即可看到`
        );
        setDone(true);
      }
    } catch (err) {
      setResult(`❌ 失敗：${(err as Error).message || String(err)}`);
    } finally {
      setRunning(false);
    }
  };

  // 沒有任何本地資料時不顯示
  if (totalLocal === 0 && !result) return null;

  return (
    <div
      style={{
        background: done ? 'rgba(212,244,199,0.7)' : 'rgba(255,242,122,0.55)',
        border: '2px dashed #1a1a1a',
        borderRadius: 10,
        padding: '10px 14px',
        boxShadow: '2px 2px 0 rgba(0,0,0,.15)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 12,
        fontFamily: "'Noto Sans TC', sans-serif",
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 800, color: '#1a1a1a' }}>
        {done ? '✅ 本地歷史已回填' : '🗃️ 偵測到本地歷史尚未上傳'}
      </span>
      {!done && (
        <span style={{ fontSize: 11, color: '#4a3a20' }}>
          這台瀏覽器 localStorage 還有 <b>{totalLocal}</b> 筆 context（geo {localPreview.geo} / device {localPreview.device} / referrer {localPreview.referrer}）。
          按下方按鈕一次性合併到 Firestore，後台就能反映回來。
          <br />
          <span style={{ color: '#7a8c3a', fontSize: 10 }}>
            ⚠️ 註：v3.6.4 之前其他訪客的 context 沒寫過 server，這次只能救「你這台瀏覽器」累積的部分。
          </span>
        </span>
      )}
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
        {!done && (
          <button
            onClick={() => handleBackfill(false)}
            disabled={running}
            style={{
              background: '#ea8a3e',
              color: '#fff',
              border: '2px solid #1a1a1a',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 800,
              cursor: running ? 'wait' : 'pointer',
              boxShadow: '2px 2px 0 rgba(0,0,0,.25)',
            }}
          >
            {running ? '上傳中…' : '📥 上傳本地歷史到 Firestore'}
          </button>
        )}
        {done && (
          <button
            onClick={() => {
              if (confirm('確定要強制再跑一次回填嗎？這會把本地數字「再加一次」到 Firestore，可能造成重複計算。')) {
                handleBackfill(true);
              }
            }}
            disabled={running}
            style={{
              background: '#fff',
              color: '#1a1a1a',
              border: '1.5px dashed #1a1a1a',
              borderRadius: 8,
              padding: '4px 10px',
              fontSize: 11,
              fontWeight: 700,
              cursor: running ? 'wait' : 'pointer',
            }}
          >
            🔁 強制重跑
          </button>
        )}
      </div>
      {result && (
        <div style={{ width: '100%', fontSize: 11, color: '#4a3a20', marginTop: 4 }}>
          {result}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 📦 每日快照備份管理面板（admin 才看得到）
// 由 dailySnapshot Cloud Function 每天 03:00 自動建立
// ────────────────────────────────────────────────────────────
function SnapshotManagementPanel() {
  const [snapshots, setSnapshots] = useState<Array<{
    id: string;
    sizes: Record<string, number>;
    capturedAt: string | null;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // 訂閱 analyticsSnapshots 集合（admin 才有讀取權限）
  useEffect(() => {
    let unsub: (() => void) | undefined;
    let cancelled = false;
    (async () => {
      try {
        const { db, isFirebaseAvailable } = await import('@/lib/firebase');
        if (!isFirebaseAvailable() || !db) {
          setLoading(false);
          return;
        }
        const { collection, onSnapshot, query, orderBy, limit } = await import('firebase/firestore');
        unsub = onSnapshot(
          query(collection(db, 'analyticsSnapshots'), orderBy('__name__', 'desc'), limit(30)),
          (snap) => {
            if (cancelled) return;
            const arr: typeof snapshots = [];
            snap.forEach((doc) => {
              const d = doc.data() as any;
              arr.push({
                id: doc.id,
                sizes: d.sizes || {},
                capturedAt: d.capturedAt?.toDate?.()?.toLocaleString('zh-TW') || null,
              });
            });
            setSnapshots(arr);
            setLoading(false);
          },
          (err) => {
            console.warn('[SnapshotPanel] 讀取失敗（可能你不是 admin）:', err);
            setLoading(false);
          }
        );
      } catch (err) {
        console.warn('[SnapshotPanel] 初始化失敗:', err);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      if (unsub) unsub();
    };
  }, []);

  const handleRestore = async (date: string, dryRun: boolean) => {
    if (restoring) return;
    if (!dryRun && !confirm(
      `⚠️ 確定要從 ${date} 快照還原嗎？\n\n` +
      `這會「覆寫」目前的 visitorStats / analytics / toolUsageStats / toolRatings。\n` +
      `目前資料會被取代成 ${date} 那天的版本。\n\n` +
      `若只是要預演，請按取消，改按「🧪 預演」。`
    )) {
      return;
    }
    setRestoring(true);
    setMessage(null);
    try {
      const { httpsCallable, getFunctions } = await import('firebase/functions');
      const firebaseApp = (await import('@/lib/firebase')).default;
      if (!firebaseApp) throw new Error('Firebase app 未初始化');
      const functions = getFunctions(firebaseApp);
      const fn = httpsCallable(functions, 'restoreFromSnapshot');
      const res: any = await fn({ date, dryRun });
      setMessage(`${dryRun ? '🧪 預演' : '✅ 還原'}成功：${res.data?.message || ''}`);
    } catch (err: any) {
      setMessage(`❌ 失敗：${err.message || String(err)}`);
    } finally {
      setRestoring(false);
    }
  };

  // 不是 admin 時不顯示（snapshots 永遠空陣列、且 loading 完）
  if (!loading && snapshots.length === 0 && !message) return null;

  return (
    <div
      style={{
        background: 'rgba(255,255,255,.85)',
        border: '2px solid #1a1a1a',
        borderRadius: 10,
        padding: '14px 16px',
        boxShadow: '3px 3px 0 rgba(0,0,0,.18)',
        fontFamily: "'Noto Sans TC', sans-serif",
      }}
    >
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 14, fontWeight: 800 }}>📦 每日快照備份</span>
          <span style={{
            fontSize: 11,
            color: '#7a8c3a',
            background: '#f5f0d4',
            padding: '2px 8px',
            borderRadius: 10,
            border: '1.5px solid #7a8c3a',
            fontWeight: 700,
          }}>
            {snapshots.length} 份（最多保留 90 天）
          </span>
        </div>
        <span style={{ fontSize: 11, color: '#666' }}>
          每天 03:00 自動備份｜誤刪可一鍵還原
        </span>
      </div>

      {loading ? (
        <div style={{ fontSize: 12, color: '#666' }}>載入中…</div>
      ) : snapshots.length === 0 ? (
        <div style={{ fontSize: 12, color: '#666' }}>
          暫無快照（部署後第一份會在隔天 03:00 建立）
        </div>
      ) : (
        <div style={{ maxHeight: 200, overflowY: 'auto' }}>
          <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px dashed #1a1a1a' }}>
                <th style={{ textAlign: 'left', padding: '4px 6px' }}>日期</th>
                <th style={{ textAlign: 'right', padding: '4px 6px' }}>visitor</th>
                <th style={{ textAlign: 'right', padding: '4px 6px' }}>analytics</th>
                <th style={{ textAlign: 'right', padding: '4px 6px' }}>tools</th>
                <th style={{ textAlign: 'right', padding: '4px 6px' }}>ratings</th>
                <th style={{ textAlign: 'center', padding: '4px 6px' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {snapshots.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px dotted #ccc' }}>
                  <td style={{ padding: '4px 6px', fontWeight: 700 }}>{s.id}</td>
                  <td style={{ padding: '4px 6px', textAlign: 'right' }}>{s.sizes.visitorStats ?? '-'}</td>
                  <td style={{ padding: '4px 6px', textAlign: 'right' }}>{s.sizes.analytics ?? '-'}</td>
                  <td style={{ padding: '4px 6px', textAlign: 'right' }}>{s.sizes.toolUsageStats ?? '-'}</td>
                  <td style={{ padding: '4px 6px', textAlign: 'right' }}>{s.sizes.toolRatings ?? '-'}</td>
                  <td style={{ padding: '4px 6px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleRestore(s.id, true)}
                      disabled={restoring}
                      style={{
                        padding: '2px 6px',
                        fontSize: 10,
                        marginRight: 4,
                        border: '1px solid #1a1a1a',
                        borderRadius: 4,
                        background: '#fff',
                        cursor: restoring ? 'wait' : 'pointer',
                      }}
                    >
                      🧪 預演
                    </button>
                    <button
                      onClick={() => handleRestore(s.id, false)}
                      disabled={restoring}
                      style={{
                        padding: '2px 6px',
                        fontSize: 10,
                        border: '1px solid #c7302a',
                        borderRadius: 4,
                        background: '#fff',
                        color: '#c7302a',
                        fontWeight: 700,
                        cursor: restoring ? 'wait' : 'pointer',
                      }}
                    >
                      ↩ 還原
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {message && (
        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            padding: '6px 10px',
            background: message.startsWith('❌') ? '#ffe4e4' : '#d4f4c7',
            border: '1px solid #1a1a1a',
            borderRadius: 6,
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}