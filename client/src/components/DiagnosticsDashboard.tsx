import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { DataSourceIndicator, SystemStatusIndicator } from "./DataSourceIndicator";
import { AlertTriangleIcon, InfoIcon } from "lucide-react";

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

// 擴展接口來處理 API 返回的額外屬性
interface ApiResponse<T> extends Array<T> {
  _cached?: boolean;
  _databaseType?: string;
  _warning?: string;
  data?: T[];
  message?: string;
}

export function DiagnosticsDashboard() {
  const [activeTab, setActiveTab] = useState("logs");

  const { data: errorLogs, isLoading: isLoadingLogs } = useQuery<ApiResponse<ErrorLog>>({
    queryKey: ["/api/diagnostics/error-logs"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: metrics, isLoading: isLoadingMetrics } = useQuery<ApiResponse<SystemMetric>>({
    queryKey: ["/api/diagnostics/metrics"],
    refetchInterval: 5000,
  });

  if (isLoadingLogs || isLoadingMetrics) {
    return <LoadingScreen message="載入診斷訊息中..." />;
  }

  const getLogLevelVariant = (level: string): "destructive" | "secondary" | "outline" => {
    switch (level.toLowerCase()) {
      case "error":
        return "destructive";
      case "warn":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>系統診斷面板</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 系統狀態指示器 */}
        <div className="mb-4">
          <SystemStatusIndicator 
            status={errorLogs?._cached ? "cached" : "connected"} 
            className="inline-block mr-2"
          />
          
          {/* 當前數據庫類型指示器 */}
          <div className="inline-flex items-center p-2 rounded bg-gray-50 text-gray-600 text-sm">
            <InfoIcon className="w-4 h-4 mr-1" />
            <span>數據存儲模式: {errorLogs?._databaseType || "未知"}</span>
          </div>
          
          {/* 如有警告則顯示 */}
          {errorLogs?._warning && (
            <div className="mt-2 p-2 rounded bg-yellow-50 text-yellow-600 text-sm flex items-center">
              <AlertTriangleIcon className="w-4 h-4 mr-1" />
              <span>{errorLogs._warning}</span>
            </div>
          )}
        </div>

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
                        <Badge variant={getLogLevelVariant(log.level)}>
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
            
            {/* 數據來源指示器 */}
            <DataSourceIndicator data={errorLogs} />
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
              
              {/* 指標數據來源指示器 */}
              <DataSourceIndicator data={metrics} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        <p>資料更新頻率: 每5秒 | 最後更新時間: {new Date().toLocaleTimeString()}</p>
      </CardFooter>
    </Card>
  );
}