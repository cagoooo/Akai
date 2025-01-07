import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UserCheck } from "lucide-react";

const SESSION_KEY = 'visitor_session';
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

export function VisitorCounter() {
  const { data: stats, refetch } = useQuery({
    queryKey: ["/api/stats/visitors"],
    refetchInterval: 60000, // 每分鐘自動更新一次
  });

  useEffect(() => {
    const checkAndUpdateVisit = async () => {
      const lastVisit = localStorage.getItem(SESSION_KEY);
      const currentTime = Date.now();

      if (!lastVisit || currentTime - parseInt(lastVisit) > SESSION_DURATION) {
        try {
          await fetch("/api/stats/visitors/increment", { method: "POST" });
          localStorage.setItem(SESSION_KEY, currentTime.toString());
          refetch();
        } catch (error) {
          console.error("Failed to increment visitor count:", error);
        }
      }
    };

    checkAndUpdateVisit();
  }, [refetch]);

  return (
    <Card className="bg-primary text-primary-foreground">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="h-6 w-6" />
            <h3 className="text-lg font-semibold">網站訪問次數</h3>
          </div>
          <div className="text-2xl font-bold">
            {stats?.totalVisits?.toLocaleString() ?? "0"}
          </div>
        </div>
        <div className="mt-2 text-sm opacity-90">
          今日訪問：
          {(stats?.dailyVisits as Record<string, number>)?.[
            new Date().toISOString().split("T")[0]
          ]?.toLocaleString() ?? "0"}
        </div>
      </CardContent>
    </Card>
  );
}