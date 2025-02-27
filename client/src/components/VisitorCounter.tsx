import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UserCheck } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface VisitorStats {
  totalVisits: number;
  dailyVisits: Record<string, number>;
}

export function VisitorCounter() {
  const { toast } = useToast();
  const counterRef = useRef<HTMLDivElement>(null);
  const previousTotalRef = useRef<number | null>(null);
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const hasIncrementedRef = useRef<boolean>(false);

  useEffect(() => {
    // Function to fetch visitor stats
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/visitors');
        const data = await response.json();
        setStats(data);

        // Animation effect when counter changes
        if (previousTotalRef.current !== null && 
            data.totalVisits > previousTotalRef.current && 
            counterRef.current) {
          counterRef.current.animate([
            { transform: 'scale(1.2)', boxShadow: '0 0 30px rgba(59, 130, 246, 0.5)' },
            { transform: 'scale(1)', boxShadow: '0 0 0 rgba(59, 130, 246, 0)' }
          ], {
            duration: 1000,
            easing: 'ease-in-out'
          });
        }

        previousTotalRef.current = data.totalVisits;
      } catch (error) {
        console.error("Failed to fetch visitor stats:", error);
        toast({
          title: "錯誤",
          description: "無法獲取訪問統計數據",
          variant: "destructive"
        });
      }
    };

    // Increment visitor count on initial page load (only once per session)
    const incrementVisitor = async () => {
      if (hasIncrementedRef.current) return;

      try {
        const response = await fetch('/api/visitors/increment', {
          method: 'POST',
        });

        if (response.ok) {
          hasIncrementedRef.current = true;
          // After incrementing, fetch the updated stats
          fetchStats();
        }
      } catch (error) {
        console.error("Failed to increment visitor count:", error);
      }
    };

    // Initial fetch and increment
    fetchStats();
    incrementVisitor();

    // Set up periodic refetch of stats (every 30 seconds)
    const intervalId = setInterval(fetchStats, 30000);

    return () => clearInterval(intervalId);
  }, [toast]);

  const totalVisits = stats?.totalVisits || 0;
  const todayVisits = stats?.dailyVisits?.[
    new Date().toISOString().split("T")[0]
  ] || 0;

  return (
    <Card 
      className={cn(
        "bg-primary text-primary-foreground visitor-counter-card",
        "transform transition-all duration-300 hover:scale-105"
      )}
    >
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <UserCheck className="h-6 w-6" />
            </motion.div>
            <h3 className="text-lg font-semibold">網站訪問次數</h3>
          </div>
          <div ref={counterRef} className="text-2xl font-bold">{totalVisits}</div>
        </div>
        <div className="mt-2 text-sm opacity-90">
          今日訪問：{todayVisits}
        </div>
      </CardContent>
    </Card>
  );
}
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartBarIcon } from "lucide-react";

// 檢查是否是新工作階段的函數
const isNewSession = () => {
  const lastVisit = sessionStorage.getItem('lastVisitTimestamp');
  const currentTime = new Date().getTime();
  
  // 如果沒有上次訪問記錄，或者距離上次訪問超過30分鐘，視為新工作階段
  if (!lastVisit || (currentTime - parseInt(lastVisit)) > 30 * 60 * 1000) {
    sessionStorage.setItem('lastVisitTimestamp', currentTime.toString());
    return true;
  }
  
  // 更新上次訪問時間
  sessionStorage.setItem('lastVisitTimestamp', currentTime.toString());
  return false;
};

export function VisitorCounter() {
  const queryClient = useQueryClient();
  const [hasIncremented, setHasIncremented] = useState(false);

  // 獲取訪客統計數據
  const { data, isLoading } = useQuery({
    queryKey: ['visitorStats'],
    queryFn: async () => {
      const res = await fetch('/api/stats/visitors');
      if (!res.ok) throw new Error('獲取訪客統計失敗');
      return res.json();
    },
    refetchInterval: 60000 // 每分鐘刷新一次
  });

  // 增加訪客計數的mutation
  const incrementMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/stats/visitors/increment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error('無法更新訪客計數');
      return res.json();
    },
    onSuccess: (data) => {
      // 成功後更新快取的數據
      queryClient.setQueryData(['visitorStats'], data);
    }
  });

  // 在組件掛載時檢查是否需要增加計數
  useEffect(() => {
    // 防止重複計數：僅當還未計數且是新工作階段時才計數
    if (!hasIncremented && isNewSession()) {
      incrementMutation.mutate();
      setHasIncremented(true);
    }
  }, [hasIncremented, incrementMutation]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <ChartBarIcon className="h-4 w-4" />
          網站訪問統計
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-6 w-full" />
        ) : (
          <div className="text-2xl font-bold">
            {data?.totalVisits || 0} 次訪問
          </div>
        )}
      </CardContent>
    </Card>
  );
}
