import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { LoadingScreen } from "./LoadingScreen";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Clock, Award, Zap, Target } from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

interface ChartData {
  toolUsage: {
    name: string;
    count: number;
  }[];
  moodTrends: {
    date: string;
    開心: number;
    困惑: number;
    滿意: number;
    挑戰: number;
    疲憊: number;
  }[];
  achievements: {
    category: string;
    completed: number;
    total: number;
  }[];
}

const chartVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function ProgressDashboard() {
  const { toast } = useToast();
  const lastMilestoneRef = useRef<number>(0);
  const [activeTab, setActiveTab] = useState("tools");
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);
  const [achievementProgress, setAchievementProgress] = useState(0);

  const { data: chartData, isLoading } = useQuery<ChartData>({
    queryKey: ["/api/progress-stats"],
    refetchInterval: 30000, // 每30秒更新一次數據
  });

  useEffect(() => {
    if (chartData) {
      const totalAchievements = chartData.achievements.reduce((acc, curr) => acc + curr.total, 0);
      const completedAchievements = chartData.achievements.reduce((acc, curr) => acc + curr.completed, 0);
      const progress = Math.round((completedAchievements / totalAchievements) * 100);

      if (progress !== achievementProgress) {
        setAchievementProgress(progress);

        if (progress >= 50 && lastMilestoneRef.current < 50) {
          lastMilestoneRef.current = 50;
          toast({
            title: "🎉 達成里程碑！",
            description: "您已完成一半的成就！繼續保持！",
            duration: 5000,
          });
        } else if (progress >= 75 && lastMilestoneRef.current < 75) {
          lastMilestoneRef.current = 75;
          toast({
            title: "🌟 即將完成！",
            description: "只剩下最後一些成就了！",
            duration: 5000,
          });
        } else if (progress === 100 && lastMilestoneRef.current < 100) {
          lastMilestoneRef.current = 100;
          toast({
            title: "🏆 恭喜完成！",
            description: "您已解鎖所有成就！太厲害了！",
            duration: 5000,
          });
        }
      }
    }
  }, [chartData, achievementProgress, toast]);

  if (isLoading || !chartData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>學習進度分析</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingScreen message="分析學習數據中..." />
        </CardContent>
      </Card>
    );
  }

  // 計算工具使用趨勢
  const totalToolUses = chartData.toolUsage.reduce((acc, curr) => acc + curr.count, 0);
  const mostUsedTool = chartData.toolUsage.reduce((acc, curr) => curr.count > acc.count ? curr : acc);

  // 計算心情趨勢
  const latestMood = chartData.moodTrends[chartData.moodTrends.length - 1];
  const dominantMood = Object.entries(latestMood || {})
    .filter(([key]) => key !== 'date')
    .reduce((acc, curr) => curr[1] > (acc?.[1] || 0) ? curr : acc)?.[0];

  // 預測完成時間
  const completedAchievements = chartData.achievements.reduce((acc, curr) => acc + curr.completed, 0);
  const totalAchievements = chartData.achievements.reduce((acc, curr) => acc + curr.total, 0);
  const completionRate = completedAchievements / totalAchievements;
  const estimatedDaysToComplete = Math.ceil((1 - completionRate) * 30); // 基於當前進度預測剩餘天數

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
        <CardTitle className="text-xl font-bold text-primary">學習進度分析</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 space-y-4">
          <div>
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>總體成就進度</span>
              <span>{achievementProgress}%</span>
            </div>
            <Progress 
              value={achievementProgress} 
              className="h-2 bg-primary/20"
              indicatorClassName="bg-gradient-to-r from-primary via-primary/80 to-primary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/20 rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">預計完成時間</p>
              </div>
              <p className="text-2xl font-bold text-primary">{estimatedDaysToComplete} 天</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">工具使用總次數</p>
              </div>
              <p className="text-2xl font-bold text-primary">{totalToolUses}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">最常使用的工具</p>
              </div>
              <p className="text-2xl font-bold text-primary">{mostUsedTool.name}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">當前主要心情</p>
              </div>
              <p className="text-2xl font-bold text-primary">{dominantMood || '尚無數據'}</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-muted/50">
            <TabsTrigger 
              value="tools"
              className={cn(
                "transition-all duration-300",
                activeTab === "tools" && "bg-primary text-primary-foreground"
              )}
            >
              工具使用
            </TabsTrigger>
            <TabsTrigger 
              value="moods"
              className={cn(
                "transition-all duration-300",
                activeTab === "moods" && "bg-primary text-primary-foreground"
              )}
            >
              學習心情
            </TabsTrigger>
            <TabsTrigger 
              value="achievements"
              className={cn(
                "transition-all duration-300",
                activeTab === "achievements" && "bg-primary text-primary-foreground"
              )}
            >
              成就完成
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={chartVariants}
              transition={{ duration: 0.5 }}
            >
              <TabsContent value="tools" className="relative">
                <div className="aspect-[2/1] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={chartData.toolUsage}
                      onMouseMove={(state: any) => {
                        if (state?.activeLabel) {
                          setHoveredBar(state.activeLabel);
                        }
                      }}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#888" opacity={0.2} />
                      <XAxis dataKey="name" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="count"
                        name="使用次數"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                      >
                        {chartData.toolUsage.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={hoveredBar === entry.name ? "hsl(var(--primary))" : "hsl(var(--primary)/0.7)"}
                            className="transition-colors duration-300"
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-0 left-0 w-full p-2 text-xs text-muted-foreground text-center"
                >
                  點擊工具名稱可查看詳細使用情況
                </motion.div>
              </TabsContent>

              <TabsContent value="moods">
                <div className="aspect-[2/1] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.moodTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#888" opacity={0.2} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => format(new Date(date), "MM/dd")}
                        stroke="#888"
                      />
                      <YAxis stroke="#888" />
                      <Tooltip
                        labelFormatter={(date) => format(new Date(date), "yyyy/MM/dd")}
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                      />
                      <Legend />
                      {Object.keys(chartData.moodTrends[0] || {})
                        .filter((key) => key !== "date")
                        .map((mood, index) => (
                          <Line
                            key={mood}
                            type="monotone"
                            dataKey={mood}
                            name={mood}
                            stroke={COLORS[index % COLORS.length]}
                            strokeWidth={2}
                            dot={{ strokeWidth: 2 }}
                            activeDot={{ r: 8, className: "animate-pulse" }}
                          />
                        ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="achievements">
                <div className="aspect-[2/1] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData.achievements}
                        dataKey="completed"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, value, percent }) =>
                          `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                        }
                        labelLine={{ strokeWidth: 2 }}
                      >
                        {chartData.achievements.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            className="transition-opacity duration-300 hover:opacity-80"
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                      />
                      <Legend 
                        formatter={(value) => (
                          <span className="text-sm font-medium">{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </CardContent>
    </Card>
  );
}