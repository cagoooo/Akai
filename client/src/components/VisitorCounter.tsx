import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UserCheck, Award, Star, Trophy, Crown, Diamond, Rocket, Sparkles } from "lucide-react";
import { motion, animate, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface StatsResponse {
  totalVisits: number;
  dailyVisits: Record<string, number>;
  lastVisitAt?: string;
}

interface Milestone {
  value: number;
  icon: typeof Award; // Changed back to typeof Award
  title: string;
  description: string;
}

const MILESTONES: Milestone[] = [
  {
    value: 100,
    icon: Star,
    title: "新星誕生！",
    description: "網站訪問突破 100 次，您的教育旅程正要開始！"
  },
  {
    value: 500,
    icon: Trophy,
    title: "教育先鋒！",
    description: "500 次訪問達成，您正在影響更多的學習者！"
  },
  {
    value: 1000,
    icon: Crown,
    title: "知識之王！",
    description: "突破 1,000 次訪問，您的影響力正在成長！"
  },
  {
    value: 2000,
    icon: Diamond,
    title: "教育瑰寶！",
    description: "2,000 次訪問里程碑，您的貢獻閃耀非凡！"
  },
  {
    value: 5000,
    icon: Rocket,
    title: "教育火箭！",
    description: "驚人的 5,000 次訪問，您的影響力正在飛速提升！"
  },
  {
    value: 10000,
    icon: Sparkles,
    title: "教育傳奇！",
    description: "難以置信！10,000 次訪問，您已成為教育界的傳奇！"
  }
];

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
    [0, 100, 500, 1000, 2000, 5000, 10000],
    ["#60A5FA", "#34D399", "#FBBF24", "#F87171", "#8B5CF6", "#EC4899", "#14B8A6"]
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

function MilestoneProgress({ currentVisits }: { currentVisits: number }) {
  // 找到下一個里程碑
  const nextMilestone = MILESTONES.find(m => m.value > currentVisits) || MILESTONES[MILESTONES.length - 1];
  const prevMilestone = MILESTONES.find(m => m.value <= currentVisits) || MILESTONES[0];

  // 計算進度
  const progress = ((currentVisits - prevMilestone.value) / (nextMilestone.value - prevMilestone.value)) * 100;

  const NextIcon = nextMilestone.icon;

  return (
    <div className="mt-4 space-y-2">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>目前：{currentVisits}</span>
        <div className="flex items-center gap-1">
          <NextIcon className="h-4 w-4" />
          <span>下一個里程碑：{nextMilestone.value}</span>
        </div>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
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
      stats.totalVisits >= m.value && m.value > lastMilestoneRef.current
    );

    if (milestone) {
      lastMilestoneRef.current = milestone.value;

      const Icon = milestone.icon;

      // 顯示里程碑達成通知
      toast({
        title: (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-yellow-400" />
            <span>{milestone.title}</span>
          </div>
        ),
        description: milestone.description,
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

        {/* 新增里程碑進度條 */}
        <MilestoneProgress currentVisits={totalVisits} />
      </CardContent>
    </Card>
  );
}