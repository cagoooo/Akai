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
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { LoadingScreen } from "./LoadingScreen";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronUpIcon, ChevronDownIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SeoReport {
  id: number;
  timestamp: string;
  overallScore: number;
  pageLoadTime: number;
  mobileScore: number;
  seoScore: number;
  bestPracticesScore: number;
  accessibilityScore: number;
  details: {
    title: string;
    description: string;
    issues: string[];
  };
}

interface KeywordRanking {
  id: number;
  keyword: string;
  position: number;
  previousPosition: number;
  url: string;
  lastChecked: string;
  searchVolume?: number;
  difficulty?: number;
}

interface TrendDataPoint {
  timestamp: string;
  '整體分數': number;
  '行動裝置': number;
  'SEO': number;
  '最佳實踐': number;
  '無障礙性': number;
}

export function SeoAnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isOpen, setIsOpen] = useState(true);
  const { toast } = useToast();

  const { data: reports = [], isLoading: isLoadingReports, error: reportsError } = useQuery<SeoReport[]>({
    queryKey: ["/api/seo/reports"],
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 3,
    onError: () => {
      toast({
        variant: "destructive",
        title: "載入失敗",
        description: "無法載入 SEO 報告，請稍後再試",
      });
    },
  });

  const { data: keywords = [], isLoading: isLoadingKeywords, error: keywordsError } = useQuery<KeywordRanking[]>({
    queryKey: ["/api/seo/keywords"],
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 3,
    onError: () => {
      toast({
        variant: "destructive",
        title: "載入失敗",
        description: "無法載入關鍵字排名，請稍後再試",
      });
    },
  });

  if (isLoadingReports || isLoadingKeywords) {
    return <LoadingScreen message="載入 SEO 分析報告中..." />;
  }

  if (reportsError || keywordsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>SEO 分析報告</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive">
            資料載入失敗，請稍後再試
          </div>
        </CardContent>
      </Card>
    );
  }

  const latestReport = reports[0];

  // 準備趨勢數據
  const trendData: TrendDataPoint[] = reports.map(report => ({
    timestamp: format(new Date(report.timestamp), "MM/dd"),
    '整體分數': report.overallScore,
    '行動裝置': report.mobileScore,
    'SEO': report.seoScore,
    '最佳實踐': report.bestPracticesScore,
    '無障礙性': report.accessibilityScore,
  })).reverse();

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between px-6 pt-6">
          <div className="flex items-center gap-2">
            <CardTitle>SEO 分析報告</CardTitle>
            <span className="text-xs text-muted-foreground">
              (每30秒自動更新)
            </span>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {isOpen ? (
                <ChevronUpIcon className="h-4 w-4" />
              ) : (
                <ChevronDownIcon className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="overview">總覽</TabsTrigger>
                <TabsTrigger value="keywords">關鍵字排名</TabsTrigger>
                <TabsTrigger value="trends">趨勢分析</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {latestReport ? (
                  <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">整體分數</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{latestReport.overallScore}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">載入時間</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{latestReport.pageLoadTime}ms</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">行動裝置分數</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{latestReport.mobileScore}</div>
                        </CardContent>
                      </Card>
                    </div>

                    {latestReport.details.issues.length > 0 && (
                      <Card className="mt-4">
                        <CardHeader>
                          <CardTitle className="text-sm font-medium">待改進項目</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="list-disc pl-4 space-y-2">
                            {latestReport.details.issues.map((issue, index) => (
                              <li key={index} className="text-sm text-muted-foreground">
                                {issue}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : (
                  <div className="text-center text-muted-foreground">
                    尚無 SEO 分析報告
                  </div>
                )}
              </TabsContent>

              <TabsContent value="keywords">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>關鍵字</TableHead>
                        <TableHead>目前排名</TableHead>
                        <TableHead>變動</TableHead>
                        <TableHead>搜尋量</TableHead>
                        <TableHead>難度</TableHead>
                        <TableHead>最後更新</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {keywords.map((keyword) => (
                        <TableRow key={keyword.id}>
                          <TableCell>{keyword.keyword}</TableCell>
                          <TableCell>{keyword.position}</TableCell>
                          <TableCell>
                            {keyword.previousPosition && (
                              <Badge variant={keyword.position < keyword.previousPosition ? "default" : "destructive"}>
                                {keyword.position < keyword.previousPosition ? "↑" : "↓"}
                                {Math.abs(keyword.position - keyword.previousPosition)}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{keyword.searchVolume || "N/A"}</TableCell>
                          <TableCell>{keyword.difficulty || "N/A"}</TableCell>
                          <TableCell>
                            {format(new Date(keyword.lastChecked), "yyyy-MM-dd HH:mm")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="trends">
                <div className="aspect-[2/1]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="整體分數"
                        stroke="#3b82f6"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="行動裝置"
                        stroke="#10b981"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="SEO"
                        stroke="#f59e0b"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="最佳實踐"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="無障礙性"
                        stroke="#ef4444"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}