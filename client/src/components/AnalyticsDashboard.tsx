import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, PieChart } from "@/components/ui/charts";
import { Button } from "@/components/ui/button";
import {
  Calendar, Download, Activity, Users, TrendingUp,
  MousePointer, Eye, Clock, BarChart2, PieChart as PieChartIcon
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { VisitorStats, ToolUsageStat } from "@/types/analytics";
import { useToast } from "@/hooks/use-toast"; 

export function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const heatmapRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // 獲取訪問統計
  const { data: visitorStats, error: visitorError } = useQuery<VisitorStats>({
    queryKey: ['visitorStats'],
    queryFn: async () => {
      const res = await fetch('/api/stats/visitors');
      if (!res.ok) throw new Error('Failed to fetch visitor stats');
      return res.json();
    },
    refetchInterval: 30000, // 每30秒刷新一次
    retry: 3,
    onError: (error) => {
      console.error('訪問統計獲取失敗:', error);
      toast({
        title: "錯誤",
        description: "無法獲取訪問統計數據，請稍後再試",
        variant: "destructive",
      });
    }
  });

  // 獲取工具使用統計
  const { data: toolStats, error: toolError } = useQuery<ToolUsageStat[]>({
    queryKey: ['toolStats'],
    queryFn: async () => {
      const res = await fetch('/api/tools/stats');
      if (!res.ok) throw new Error('Failed to fetch tool stats');
      return res.json();
    },
    refetchInterval: 60000, // 每分鐘刷新一次
    retry: 3,
    onError: (error) => {
      console.error('工具統計獲取失敗:', error);
      toast({
        title: "錯誤",
        description: "無法獲取工具使用統計，請稍後再試",
        variant: "destructive",
      });
    }
  });

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

  // 準備圖表數據
  const prepareVisitorChartData = () => {
    if (!visitorStats?.dailyVisits) return { labels: [], datasets: [] };

    const dailyVisits = visitorStats.dailyVisits as Record<string, number>;
    const sortedDates = Object.keys(dailyVisits).sort();

    return {
      labels: sortedDates.slice(-30), // 取最近30天
      datasets: [
        {
          label: '每日訪問量',
          data: sortedDates.slice(-30).map(date => dailyVisits[date] || 0),
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
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">網站分析儀表板</h1>
          <p className="text-muted-foreground">監控網站流量和用戶活動的視覺化儀表板</p>
        </div>
        <Button className="shrink-0">
          <Download className="mr-2 h-4 w-4" />
          下載報告
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">總訪問量</p>
              <h3 className="text-2xl font-bold">{visitorStats?.totalVisits || 0}</h3>
              <p className="text-sm text-green-600">+5.2% 比上週</p>
            </div>
            <Users className="h-10 w-10 text-blue-500 bg-blue-100 p-2 rounded-full" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">本週流量</p>
              <h3 className="text-2xl font-bold">1,204</h3>
              <p className="text-sm text-red-600">-1.8% 比上週</p>
            </div>
            <TrendingUp className="h-10 w-10 text-orange-500 bg-orange-100 p-2 rounded-full" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">平均停留時間</p>
              <h3 className="text-2xl font-bold">3m 24s</h3>
              <p className="text-sm text-green-600">+12% 比上週</p>
            </div>
            <Clock className="h-10 w-10 text-green-500 bg-green-100 p-2 rounded-full" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">跳出率</p>
              <h3 className="text-2xl font-bold">28.5%</h3>
              <p className="text-sm text-green-600">-3.2% 比上週</p>
            </div>
            <MousePointer className="h-10 w-10 text-purple-500 bg-purple-100 p-2 rounded-full" />
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 sm:grid-cols-5 mb-4">
          <TabsTrigger value="overview">
            <Activity className="h-4 w-4 mr-2" />
            總覽
          </TabsTrigger>
          <TabsTrigger value="visitors">
            <Eye className="h-4 w-4 mr-2" />
            訪問者
          </TabsTrigger>
          <TabsTrigger value="tools">
            <BarChart2 className="h-4 w-4 mr-2" />
            工具使用
          </TabsTrigger>
          <TabsTrigger value="heatmap">
            <PieChartIcon className="h-4 w-4 mr-2" />
            熱力圖
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <Calendar className="h-4 w-4 mr-2" />
            日曆視圖
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>訪問者趨勢</CardTitle>
              <CardDescription>過去30天的每日訪問量</CardDescription>
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
                <CardDescription>用戶來源渠道分析</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={{
                    labels: ['直接訪問', '搜索引擎', '社交媒體', '郵件推廣', '外部連結'],
                    datasets: [{
                      label: '訪問來源',
                      data: [350, 620, 210, 80, 140],
                      backgroundColor: [
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)'
                      ]
                    }]
                  }}
                  height={250}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { display: false }
                    }
                  }}
                />
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
                <div>
                  <h3 className="text-lg font-medium mb-2">地理分布</h3>
                  <div className="h-[300px] bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                    互動式地理分布地圖
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">設備分析</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <h4 className="text-muted-foreground">桌面</h4>
                        <p className="text-3xl font-bold my-2">58%</p>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '58%' }}></div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <h4 className="text-muted-foreground">行動裝置</h4>
                        <p className="text-3xl font-bold my-2">36%</p>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '36%' }}></div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <h4 className="text-muted-foreground">平板</h4>
                        <p className="text-3xl font-bold my-2">6%</p>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '6%' }}></div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
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
                    onClick: async (event, elements) => {
                      if (elements && elements.length > 0) {
                        const index = elements[0].index;
                        const toolId = toolStats[index].toolId;

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
              <CardTitle>用戶行為熱力圖</CardTitle>
              <CardDescription>顯示用戶在頁面上的點擊與互動熱點</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                ref={heatmapRef}
                className="h-[500px] bg-muted rounded-md relative overflow-hidden"
              >
                <div className="absolute inset-0 opacity-20 bg-repeat" style={{
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M0 0h10v10H0zm10 10h10v10H10z\'/%3E%3C/g%3E%3C/svg%3E")',
                  backgroundSize: '20px 20px'
                }}></div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-white/90 dark:bg-black/80 p-4 rounded-lg text-center shadow-lg">
                    <p className="font-medium mb-2">模擬的頁面佈局</p>
                    <p className="text-sm text-muted-foreground">使用者互動熱點將顯示在此區域</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>日曆視圖</CardTitle>
              <CardDescription>按日期查看訪問數據</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 31 }, (_, i) => (
                  <div
                    key={i}
                    className="aspect-square border rounded-md flex flex-col items-center justify-center hover:bg-accent transition-colors cursor-pointer relative overflow-hidden"
                  >
                    <span className="text-sm font-medium">{i + 1}</span>
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-blue-500"
                      style={{
                        height: `${Math.floor(Math.random() * 100)}%`,
                        opacity: 0.3
                      }}
                    ></div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 opacity-30 rounded-sm"></div>
                  <span className="text-sm text-muted-foreground">訪問量強度</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">上個月</Button>
                  <Button variant="outline" size="sm">下個月</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}