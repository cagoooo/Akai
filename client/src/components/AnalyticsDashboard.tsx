import { lazy, Suspense, useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, PieChart } from "@/components/ui/charts";
import { Button } from "@/components/ui/button";
import {
  Calendar, Download, Activity, Users, TrendingUp,
  MousePointer, Eye, Clock, BarChart2, PieChart as PieChartIcon,
  Home, ArrowLeft, Target
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import type { VisitorStats, ToolUsageStat } from "@/types/analytics";
import { WishingWellAdmin } from "@/components/admin/WishingWellAdmin";
import { ToolFlowAnalysisPanel } from "@/components/admin/ToolFlowAnalysisPanel";
import { HealthCheckPanel } from "@/components/admin/HealthCheckPanel";
import { RecommendationStatsPanel } from "@/components/admin/RecommendationStatsPanel";
import { StickyStatCard } from "@/components/admin/StickyStatCard";
import {
  BackfillLocalAnalyticsBar,
  SnapshotManagementPanel,
} from "@/components/admin/AnalyticsInfrastructurePanels";
import {
  DateRangePicker,
  presetToRange,
  filterDailyVisits,
  toDateStr,
  type DateRange,
} from "@/components/admin/DateRangePicker";

const AnalyticsBehaviorTabs = lazy(() =>
  import("@/components/admin/AnalyticsBehaviorTabs").then((module) => ({
    default: module.AnalyticsBehaviorTabs,
  }))
);

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
  // 工具每日點擊細分（v3.6.8+ 連動日期 picker）
  const [toolDailyClicks, setToolDailyClicks] = useState<Map<number, Record<string, number>>>(
    () => new Map()
  );
  // 工具標題快取（從 tools.json 載入，給圖表 label 用）
  const [toolTitles, setToolTitles] = useState<Map<number, string>>(() => new Map());

  // 全站累計的 訪客 context（地理 / 裝置 / 來源），來自 Firestore analytics/visitorContext
  const [serverContext, setServerContext] = useState<{
    geoStats?: Record<string, number>;
    deviceStats?: Record<string, number>;
    referrerStats?: Record<string, number>;
  }>({});

  // 載入工具標題（給圖表 label 用）
  useEffect(() => {
    const baseUrl = (import.meta as any).env?.BASE_URL || '/';
    fetch(`${baseUrl}api/tools.json?v=${(import.meta as any).env?.VITE_APP_VERSION || ''}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((tools: any[]) => {
        if (!Array.isArray(tools)) return;
        const m = new Map<number, string>();
        tools.forEach((t) => {
          if (typeof t?.id === 'number' && typeof t?.title === 'string') {
            m.set(t.id, t.title);
          }
        });
        setToolTitles(m);
      })
      .catch(() => { /* 失敗就 fallback「工具 #ID」 */ });
  }, []);

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

        // 即時監聽工具統計（含 dailyClicks）
        unsubscribeTool = onSnapshot(
          query(collection(db, 'toolUsageStats'), orderBy('totalClicks', 'desc')),
          (snapshot) => {
            const stats: ToolUsageStat[] = [];
            const daily = new Map<number, Record<string, number>>();
            snapshot.forEach((doc) => {
              const data = doc.data();
              stats.push({
                toolId: data.toolId,
                totalClicks: data.totalClicks
              });
              if (data.dailyClicks && typeof data.dailyClicks === 'object') {
                const valid: Record<string, number> = {};
                for (const [k, v] of Object.entries(data.dailyClicks)) {
                  if (/^\d{4}-\d{2}-\d{2}$/.test(k) && typeof v === 'number' && v > 0) {
                    valid[k] = v;
                  }
                }
                if (Object.keys(valid).length > 0) daily.set(data.toolId, valid);
              }
            });
            setToolStats(stats);
            setToolDailyClicks(daily);
            setLastUpdated(new Date());
            console.log('🔧 工具統計已即時更新（含 dailyClicks）');
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

  /**
   * 取得工具在當前日期範圍內的點擊數（v3.6.8+）
   * - 優先用 dailyClicks 細分（範圍篩選）
   * - 落空就用 totalClicks 全期值（與舊行為一致）
   */
  const getToolClicksInRange = (toolId: number, totalClicks: number): number => {
    const daily = toolDailyClicks.get(toolId);
    if (!daily) return totalClicks; // 沒 dailyClicks 就用全期累計
    const fromStr = toDateStr(dateRange.from);
    const toStr = toDateStr(dateRange.to);
    let sum = 0;
    for (const [date, n] of Object.entries(daily)) {
      if (date >= fromStr && date <= toStr) sum += n;
    }
    return sum;
  };

  /** 範圍內排序好的工具陣列（前 N 名熱門，依範圍內點擊數排序） */
  const toolsInRange = useMemo(() => {
    if (!toolStats) return [];
    const enriched = toolStats.map((s) => ({
      toolId: s.toolId,
      totalClicks: s.totalClicks,
      rangeClicks: getToolClicksInRange(s.toolId, s.totalClicks),
      title: toolTitles.get(s.toolId) || `工具 #${s.toolId}`,
    }));
    return enriched
      .filter((s) => s.rangeClicks > 0)
      .sort((a, b) => b.rangeClicks - a.rangeClicks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolStats, toolDailyClicks, toolTitles, dateRange]);

  const prepareToolChartData = () => {
    if (toolsInRange.length === 0) return { labels: [], datasets: [] };
    const top10 = toolsInRange.slice(0, 10);
    return {
      labels: top10.map((s) => s.title.length > 14 ? s.title.slice(0, 14) + '…' : s.title),
      datasets: [
        {
          label: `使用次數（${dateRange.label}）`,
          data: top10.map((s) => s.rangeClicks),
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
                      const dateStr = toDateStr(now);
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
                      const dateStr = toDateStr(now);

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
                    const dateStr = toDateStr(now);

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

        {/* 🛡️ Schema 健檢（v3.6.70：手動觸發 healthCheckToolUsageStats callable） */}
        <HealthCheckPanel />

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
            className="grid grid-cols-3 sm:grid-cols-7 mb-4 w-full h-auto gap-1.5 sm:gap-2"
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
              { value: 'reco', icon: <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4" />, label: '推薦' },
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
                      // 優先用 Firestore 全站累計，本地只做舊資料 fallback；無資料就明確顯示空狀態
                      const getGeoData = () => {
                        const sv = serverContext.geoStats || {};
                        const hasServer = Object.keys(sv).length > 0;
                        if (hasServer) return sv;
                        try {
                          const data = localStorage.getItem('visitorGeoStats');
                          if (data) return JSON.parse(data);
                        } catch (e) { }
                        return {};
                      };

                      const geoData = getGeoData();
                      const total = Object.values(geoData).reduce((a: number, b: any) => a + b, 0);
                      const sortedData = Object.entries(geoData)
                        .sort((a: any, b: any) => b[1] - a[1])
                        .slice(0, 8);
                      const maxValue = Math.max(...sortedData.map((d: any) => d[1]), 1);

                      const colors = [
                        'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500',
                        'bg-green-500', 'bg-teal-500', 'bg-orange-500', 'bg-slate-400'
                      ];

                      return (
                        <div className="space-y-3">
                          {total === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                              <p>尚無可用的地理分布資料</p>
                              <p className="text-sm mt-1">收到真實訪客地理資料後才會顯示，不使用示意數字。</p>
                            </div>
                          )}
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

          <TabsContent value="reco">
            <RecommendationStatsPanel />
          </TabsContent>

          <TabsContent value="tools">
            <Card>
              <CardHeader>
                <CardTitle>工具使用統計</CardTitle>
                <CardDescription>
                  {dateRange.label} 內最受歡迎的工具
                  {toolDailyClicks.size === 0 && (
                    <span style={{ color: '#7a8c3a', marginLeft: 8, fontSize: 11 }}>
                      （dailyClicks 尚未累積，先以全期數據顯示。新點擊會開始累積每日細分。）
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {toolsInRange.length > 0 ? (
                  <BarChart
                    data={{
                      labels: toolsInRange.map((s) =>
                        s.title.length > 16 ? s.title.slice(0, 16) + '…' : s.title
                      ),
                      datasets: [{
                        label: `使用次數（${dateRange.label}）`,
                        data: toolsInRange.map((s) => s.rangeClicks),
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
                          const toolId = toolsInRange[index]?.toolId;
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

            {/* 🆕 v3.6.49 流量解析面板（細粒度 toolClickEvents 切片） */}
            <ToolFlowAnalysisPanel toolTitles={toolTitles} />
          </TabsContent>

          {(activeTab === 'heatmap' || activeTab === 'calendar') && (
            <Suspense fallback={<div className="py-16 text-center text-muted-foreground">載入行為分析中…</div>}>
              <AnalyticsBehaviorTabs visitorStats={visitorStats} />
            </Suspense>
          )}
        </Tabs>
      </main>
    </div >
  );
}
