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

export function ProgressDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: chartData, isLoading } = useQuery<ChartData>({
    queryKey: ["/api/progress-stats"],
    refetchInterval: 30000, // 每30秒更新一次數據
  });

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>學習進度分析</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tools">工具使用</TabsTrigger>
            <TabsTrigger value="moods">學習心情</TabsTrigger>
            <TabsTrigger value="achievements">成就完成</TabsTrigger>
          </TabsList>

          <TabsContent value="tools">
            <div className="aspect-[2/1] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.toolUsage}>
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
                <LineChart data={chartData.moodTrends}>
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
                  >
                    {chartData.achievements.map((_, index) => (
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