import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UserCheck } from "lucide-react";
import { motion, animate, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatsResponse {
  totalVisits: number;
  dailyVisits: Record<string, number>;
  lastVisitAt?: string;
}

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
  const { data: stats, refetch } = useQuery<StatsResponse>({
    queryKey: ["/api/stats/visitors"],
    refetchInterval: 60000,
  });

  useEffect(() => {
    fetch("/api/stats/visitors/increment", { method: "POST" })
      .then(() => refetch())
      .catch(console.error);
  }, [refetch]);

  const totalVisits = stats?.totalVisits || 0;
  const todayVisits = stats?.dailyVisits?.[
    new Date().toISOString().split("T")[0]
  ] || 0;

  return (
    <Card className={cn(
      "bg-primary text-primary-foreground",
      "transform transition-all duration-300 hover:scale-105"
    )}>
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