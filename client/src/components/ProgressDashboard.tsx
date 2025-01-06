import { useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { LoadingScreen } from "./LoadingScreen";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

interface ChartData {
  toolUsage: {
    name: string;
    count: number;
  }[];
  moodTrends: {
    date: string;
    happy: number;
    confused: number;
    satisfied: number;
    challenged: number;
    tired: number;
  }[];
  achievements: {
    category: string;
    completed: number;
    total: number;
  }[];
  learningProgress: {
    date: string;
    progress: number;
  }[];
}

export function ProgressDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: chartData, isLoading } = useQuery<ChartData>({
    queryKey: ["/api/progress-stats"],
    queryFn: async () => {
      // Simulate API delay for now
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        toolUsage: [
          { name: "翻譯工具", count: 45 },
          { name: "課程編輯器", count: 32 },
          { name: "討論區", count: 28 },
          { name: "任務追蹤", count: 20 },
          { name: "學習筆記", count: 15 },
        ],
        moodTrends: [
          {
            date: "2024-01-01",
            happy: 5,
            confused: 2,
            satisfied: 4,
            challenged: 3,
            tired: 1,
          },
          // Add more dates...
        ],
        achievements: [
          { category: "工具使用", completed: 8, total: 10 },
          { category: "學習進度", completed: 5, total: 8 },
          { category: "社群參與", completed: 3, total: 5 },
          { category: "創新應用", completed: 2, total: 4 },
        ],
        learningProgress: [
          { date: "2024-01-01", progress: 10 },
          { date: "2024-01-02", progress: 25 },
          { date: "2024-01-03", progress: 45 },
          { date: "2024-01-04", progress: 60 },
          { date: "2024-01-05", progress: 85 },
        ],
      };
    },
  });

  if (isLoading) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>學習進度分析</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">總覽</TabsTrigger>
            <TabsTrigger value="tools">工具使用</TabsTrigger>
            <TabsTrigger value="moods">學習心情</TabsTrigger>
            <TabsTrigger value="achievements">成就完成</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="aspect-[2/1] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData?.learningProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => format(new Date(date), "MM/dd")}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(date) => format(new Date(date), "yyyy/MM/dd")}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="progress"
                    name="學習進度"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="tools">
            <div className="aspect-[2/1] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData?.toolUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="count"
                    name="使用次數"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="moods">
            <div className="aspect-[2/1] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData?.moodTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => format(new Date(date), "MM/dd")}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(date) => format(new Date(date), "yyyy/MM/dd")}
                  />
                  <Legend />
                  {Object.keys(chartData?.moodTrends[0] || {})
                    .filter((key) => key !== "date")
                    .map((mood, index) => (
                      <Line
                        key={mood}
                        type="monotone"
                        dataKey={mood}
                        stroke={COLORS[index % COLORS.length]}
                        strokeWidth={2}
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
                    data={chartData?.achievements}
                    dataKey="completed"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {chartData?.achievements.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}