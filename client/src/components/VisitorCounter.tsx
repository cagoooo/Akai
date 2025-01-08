import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UserCheck, Award } from "lucide-react";
import { motion, animate, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface StatsResponse {
  totalVisits: number;
  dailyVisits: Record<string, number>;
  lastVisitAt?: string;
}

const MILESTONES = [100, 500, 1000, 5000, 10000];

function AnimatedNumber({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const animation = animate(count, value, {
      duration: 1.5,
      ease: "easeOut"
    });
    return animation.stop;
  }, [value]);

  // 根據數值大小改變顏色
  const textColor = useTransform(
    count,
    [0, 100, 500, 1000],
    ["#60A5FA", "#34D399", "#FBBF24", "#F87171"]
  );

  return (
    <motion.span
      style={{ color: textColor }}
      whileHover={{ scale: 1.1 }}
      className="font-bold"
    >
      {rounded}
    </motion.span>
  );
}

export function VisitorCounter() {
  const { toast } = useToast();
  const lastMilestoneRef = useRef<number>(0);

  const { data: stats, refetch } = useQuery<StatsResponse>({
    queryKey: ["/api/stats/visitors"],
    refetchInterval: 60000,
  });

  useEffect(() => {
    fetch("/api/stats/visitors/increment", { method: "POST" })
      .then(() => refetch())
      .catch(console.error);
  }, [refetch]);

  useEffect(() => {
    if (!stats?.totalVisits) return;

    // 檢查是否達到新的里程碑
    const milestone = MILESTONES.find(m => 
      stats.totalVisits >= m && m > lastMilestoneRef.current
    );

    if (milestone) {
      lastMilestoneRef.current = milestone;

      // 顯示里程碑達成通知
      toast({
        title: (
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-400" />
            <span>里程碑達成！</span>
          </div>
        ),
        description: `恭喜！網站訪問次數已突破 ${milestone} 次！`,
        duration: 5000,
      });

      // 播放成就解鎖動畫
      const card = document.querySelector('.visitor-counter-card');
      if (card) {
        card.animate([
          { transform: 'scale(1)', boxShadow: '0 0 0 rgba(59, 130, 246, 0)' },
          { transform: 'scale(1.05)', boxShadow: '0 0 30px rgba(59, 130, 246, 0.5)' },
          { transform: 'scale(1)', boxShadow: '0 0 0 rgba(59, 130, 246, 0)' }
        ], {
          duration: 1000,
          easing: 'ease-in-out'
        });
      }
    }
  }, [stats?.totalVisits, toast]);

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
          <div className="text-2xl">
            <AnimatedNumber value={totalVisits} />
          </div>
        </div>
        <div className="mt-2 text-sm opacity-90 flex items-center justify-between">
          <span>今日訪問：</span>
          <AnimatedNumber value={todayVisits} />
        </div>
      </CardContent>
    </Card>
  );
}