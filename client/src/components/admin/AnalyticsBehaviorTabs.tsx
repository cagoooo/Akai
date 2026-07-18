import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { toDateStr } from "@/components/admin/DateRangePicker";
import type { VisitorStats } from "@/types/analytics";

interface AnalyticsBehaviorTabsProps {
  visitorStats: VisitorStats;
}

export function AnalyticsBehaviorTabs({ visitorStats }: AnalyticsBehaviorTabsProps) {
  return (
    <>
          <TabsContent value="heatmap">
            <Card>
              <CardHeader>
                <CardTitle>🔥 用戶行為熱力圖</CardTitle>
                <CardDescription>僅顯示這台 Admin 瀏覽器所記錄的本機點擊，不代表全站訪客。</CardDescription>
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
                    const dateStr = toDateStr(date);
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
                    const dateStr = toDateStr(date);
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
    </>
  );
}
