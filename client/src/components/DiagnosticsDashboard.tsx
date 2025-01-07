import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { LoadingScreen } from "./LoadingScreen";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ErrorLog {
  id: number;
  level: string;
  message: string;
  stack?: string;
  metadata?: Record<string, any>;
  userId?: number;
  createdAt: string;
  user?: {
    username: string;
  };
}

interface SystemMetric {
  id: number;
  name: string;
  value: string;
  unit: string;
  timestamp: string;
}

export function DiagnosticsDashboard() {
  const [activeTab, setActiveTab] = useState("logs");

  const { data: errorLogs, isLoading: isLoadingLogs } = useQuery<ErrorLog[]>({
    queryKey: ["/api/diagnostics/error-logs"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: metrics, isLoading: isLoadingMetrics } = useQuery<SystemMetric[]>({
    queryKey: ["/api/diagnostics/metrics"],
    refetchInterval: 5000,
  });

  if (isLoadingLogs || isLoadingMetrics) {
    return <LoadingScreen message="載入診斷資訊中..." />;
  }

  const getLogLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "error":
        return "destructive";
      case "warn":
        return "warning";
      case "info":
        return "info";
      default:
        return "secondary";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>系統診斷面板</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="logs">錯誤日誌</TabsTrigger>
            <TabsTrigger value="metrics">系統指標</TabsTrigger>
          </TabsList>

          <TabsContent value="logs" className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>時間</TableHead>
                    <TableHead>等級</TableHead>
                    <TableHead>訊息</TableHead>
                    <TableHead>使用者</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {errorLogs?.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss")}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getLogLevelColor(log.level)}>
                          {log.level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{log.message}</p>
                          {log.stack && (
                            <pre className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap">
                              {log.stack}
                            </pre>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{log.user?.username || "系統"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="metrics">
            <div className="space-y-4">
              <div className="aspect-[2/1]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(timestamp) =>
                        format(new Date(timestamp), "HH:mm:ss")
                      }
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(timestamp) =>
                        format(new Date(timestamp), "yyyy-MM-dd HH:mm:ss")
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="數值"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>時間</TableHead>
                      <TableHead>指標名稱</TableHead>
                      <TableHead>數值</TableHead>
                      <TableHead>單位</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metrics?.map((metric) => (
                      <TableRow key={metric.id}>
                        <TableCell>
                          {format(
                            new Date(metric.timestamp),
                            "yyyy-MM-dd HH:mm:ss"
                          )}
                        </TableCell>
                        <TableCell>{metric.name}</TableCell>
                        <TableCell>{metric.value}</TableCell>
                        <TableCell>{metric.unit}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
