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