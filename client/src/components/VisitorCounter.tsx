import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { UserCheck, Award, Star, Trophy, Crown, Diamond, Rocket, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface StatsResponse {
  totalVisits: number;
  dailyVisits: Record<string, number>;
  lastVisitAt?: string;
}

// Define milestones for the counter
const MILESTONES = [
  { value: 0, title: "開始", description: "訪問計數已啟動！", icon: Star },
  { value: 100, title: "100 訪問", description: "網站已達到 100 次訪問！", icon: Award },
  { value: 500, title: "500 訪問", description: "熱門網站！500 次訪問達成！", icon: Trophy },
  { value: 1000, title: "1,000 訪問", description: "恭喜！網站已達到 1,000 次訪問！", icon: Crown },
  { value: 5000, title: "5,000 訪問", description: "了不起！5,000 次訪問達成！", icon: Diamond },
  { value: 10000, title: "10,000 訪問", description: "驚人的成就！10,000 次訪問！", icon: Rocket },
  { value: 50000, title: "50,000 訪問", description: "網站超級明星！50,000 次訪問！", icon: Sparkles }
];

// Animated counter that smoothly transitions to new values
function AnimatedCounter({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, latest => Math.round(latest).toLocaleString());

  useEffect(() => {
    const animation = animate(count, value, { duration: 1, bounce: 0.3 });
    return animation.stop;
  }, [count, value]);

  // Change color based on value thresholds
  const textColor = useTransform(
    count,
    [0, 500, 1000, 2000, 5000, 10000],
    ["#4caf50", "#8bc34a", "#cddc39", "#ffc107", "#ff9800", "#ff5722"]
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
  const sortedMilestones = [...MILESTONES].sort((a, b) => a.value - b.value);
  const nextMilestone = sortedMilestones.find(m => m.value > currentVisits) || sortedMilestones[sortedMilestones.length - 1];
  const prevMilestoneIndex = sortedMilestones.findIndex(m => m.value > currentVisits) - 1;
  const prevMilestone = prevMilestoneIndex >= 0 ? sortedMilestones[prevMilestoneIndex] : sortedMilestones[0];

  // 計算進度
  const progress = ((currentVisits - prevMilestone.value) / (nextMilestone.value - prevMilestone.value)) * 100;

  const NextIcon = nextMilestone.icon;

  return (
    <div className="mt-4 space-y-2">
      <div className="flex justify-between text-sm font-medium">
        <span className="text-primary-foreground/90">目前：{currentVisits}</span>
        <div className="flex items-center gap-1 text-primary-foreground/90">
          <NextIcon className="h-4 w-4 text-yellow-400" />
          <span>下一個里程碑：</span>
          <span className="font-bold">{nextMilestone.value.toLocaleString()}</span>
        </div>
      </div>
      <Progress 
        value={progress} 
        className="h-2 bg-gradient-to-r from-yellow-200/20 to-yellow-600/30 [&>div]:bg-gradient-to-r [&>div]:from-yellow-300 [&>div]:via-yellow-500 [&>div]:to-yellow-600" 
      />
    </div>
  );
}

export function VisitorCounter() {
  const { toast } = useToast();
  // 使用 localStorage 記錄最高里程碑，確保重新載入頁面不會重複通知
  const lastMilestoneRef = useRef<number>(
    parseInt(localStorage.getItem('lastAchievedMilestone') || '0')
  );

  // 生成初始訪問數據 - 基於實際使用情況
  const getDefaultStats = (): StatsResponse => {
    const today = new Date().toISOString().split("T")[0];

    // 使用更保守的默認值，避免數據膨脹
    const baseTotal = 0; // 從0開始計數，依賴實際API數據
      
    // 今日訪問次數，初始為0
    const baseDailyVisits = 0;
    
    return {
      totalVisits: baseTotal,
      dailyVisits: { [today]: baseDailyVisits },
      lastVisitAt: new Date().toISOString()
    };
  };

  const { data: stats, error, refetch } = useQuery<StatsResponse>({
    queryKey: ["/api/stats/visitors"],
    refetchInterval: 60000, // Refresh every minute
  });

  // 如果API調用出錯，使用預設數據
  const effectiveStats: StatsResponse = error ? getDefaultStats() : (stats || getDefaultStats());

  // 訪問計數本地狀態
  const [localTotalVisits, setLocalTotalVisits] = useState(() => {
    // 從localStorage獲取初始值
    return parseInt(localStorage.getItem('totalVisits') || '0');
  });
  
  const [localTodayVisits, setLocalTodayVisits] = useState(() => {
    // 從localStorage獲取初始值
    return parseInt(localStorage.getItem('todayVisits') || '0');
  });

  // 自動增加訪問次數功能（改進版）- 加強防重複計數
  useEffect(() => {
    // 檢查最後一次訪問的時間，以決定是否增加計數
    const lastVisitTime = parseInt(localStorage.getItem('lastVisitTimestamp') || '0');
    const currentTime = Date.now();
    const today = new Date().toISOString().split("T")[0];
    const lastVisitDate = localStorage.getItem('lastVisitDate') || '';
    const sessionVisited = sessionStorage.getItem('sessionVisited') || '';

    // 設定頁面重新載入的最小時間間隔（30分鐘 = 30 * 60 * 1000毫秒）
    const MIN_VISIT_INTERVAL = 30 * 60 * 1000; // 30分鐘
    
    // 只有當會話中第一次訪問，或者距離上次訪問已經超過最小間隔時間，或是新的一天時，才增加訪問次數
    const shouldIncrementVisit = 
      !sessionVisited || // 會話中第一次訪問
      (currentTime - lastVisitTime > MIN_VISIT_INTERVAL) || // 或超過30分鐘
      (lastVisitDate !== today); // 或是新的一天

    // 在會話中標記已訪問，防止重複計數
    sessionStorage.setItem('sessionVisited', 'true');

    if (shouldIncrementVisit) {
      console.log('增加訪問計數 - 條件:', { 
        isFirstVisitInSession: !sessionVisited,
        timeIntervalPassed: currentTime - lastVisitTime > MIN_VISIT_INTERVAL,
        isNewDay: lastVisitDate !== today
      });
      
      // 更新最後訪問時間和日期
      localStorage.setItem('lastVisitTimestamp', currentTime.toString());
      localStorage.setItem('lastVisitDate', today);

      // 立即更新本地狀態，確保UI立即反映變化
      const newTotal = localTotalVisits + 1;
      const newDailyVisits = localTodayVisits + 1;
      
      // 更新狀態和localStorage
      setLocalTotalVisits(newTotal);
      setLocalTodayVisits(newDailyVisits);
      localStorage.setItem('totalVisits', newTotal.toString());
      localStorage.setItem('todayVisits', newDailyVisits.toString());
      
      // 觸發動畫效果
      setShowNewVisitAnimation(true);
      setTimeout(() => setShowNewVisitAnimation(false), 2000);

      // 嘗試使用API更新（但不依賴它來更新UI）
      const incrementVisitor = async () => {
        try {
          await fetch("/api/stats/visitors/increment", { 
            method: "POST",
            headers: {
              "Cache-Control": "no-cache"
            }
          });
          await refetch();
        } catch (error) {
          console.error("Failed to increment visitor count via API:", error);
          // API失敗時已經使用了本地狀態，所以這裡不需要額外處理
        }
      };

      incrementVisitor();
    } else {
      console.log('未增加訪問計數 - 條件:', { 
        isFirstVisitInSession: !sessionVisited,
        minutesSinceLastVisit: Math.round((currentTime - lastVisitTime) / (60 * 1000)),
        isNewDay: lastVisitDate !== today
      });
      
      // 雖然不增加計數，但仍然獲取最新數據
      refetch().catch(err => console.error("訪問統計刷新失敗", err));
    }
  }, [refetch, localTotalVisits, localTodayVisits]);

  // Check for milestone achievements
  useEffect(() => {
    if (!effectiveStats?.totalVisits) return;

    // 檢查是否達到新的里程碑 (從大到小檢查，確保顯示最大的里程碑)
    const sortedMilestones = [...MILESTONES].sort((a, b) => b.value - a.value);
    const milestone = sortedMilestones.find(m => 
      effectiveStats.totalVisits >= m.value && m.value > lastMilestoneRef.current
    );

    if (milestone) {
      lastMilestoneRef.current = milestone.value;
      // 保存到 localStorage 以確保頁面重新載入後不會重複顯示
      localStorage.setItem('lastAchievedMilestone', milestone.value.toString());

      const Icon = milestone.icon;

      // 顯示里程碑達成通知
      toast({
        title: `${milestone.title}`, // 使用字符串替代 JSX
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
  }, [effectiveStats?.totalVisits, toast]);

  // 獲取初始默認值一次性以避免每次重新計算
  const defaultStats = useRef(getDefaultStats()).current;
  
  // 清除或重置本地存儲（首次加載時）
  useEffect(() => {
    const resetDone = localStorage.getItem('visitorStatsReset2025');
    if (!resetDone) {
      // 清除舊的訪問統計數據
      localStorage.removeItem('totalVisits');
      localStorage.removeItem('todayVisits');
      localStorage.removeItem('lastAchievedMilestone');
      
      // 標記已完成重置
      localStorage.setItem('visitorStatsReset2025', 'true');
    }
  }, []);
  
  // 使用API數據優先，然後是本地狀態，最後是默認值
  // 這樣確保盡量顯示真實的後端數據
  const totalVisits = effectiveStats?.totalVisits !== undefined
    ? effectiveStats.totalVisits
    : (localTotalVisits || defaultStats.totalVisits);
    
  const today = new Date().toISOString().split("T")[0];
  const todayVisits = effectiveStats?.dailyVisits?.[today] !== undefined
    ? effectiveStats.dailyVisits[today]
    : (localTodayVisits || defaultStats.dailyVisits[today]);
  
  // 同步本地狀態和API數據
  useEffect(() => {
    // 如果有有效的API數據，總是使用API數據更新本地狀態
    if (effectiveStats?.totalVisits !== undefined) {
      setLocalTotalVisits(effectiveStats.totalVisits);
      localStorage.setItem('totalVisits', effectiveStats.totalVisits.toString());
    }
    
    const today = new Date().toISOString().split("T")[0];
    if (effectiveStats?.dailyVisits?.[today] !== undefined) {
      setLocalTodayVisits(effectiveStats.dailyVisits[today]);
      localStorage.setItem('todayVisits', effectiveStats.dailyVisits[today].toString());
    }
  }, [effectiveStats?.totalVisits, effectiveStats?.dailyVisits]);

  // 添加動畫效果，當訪問次數增加時顯示特效
  const [showNewVisitAnimation, setShowNewVisitAnimation] = useState(false);
  
  // 檢測訪問次數的變化並顯示動畫 - 改為僅在訪問計數增加時顯示
  useEffect(() => {
    // 不再自動播放加載動畫，而是依賴訪問計數增加的觸發器（在上面的shouldIncrementVisit條件中設置）
    // 當訪問計數增加時，showNewVisitAnimation已經在那裡設置為true
    
    // 此處僅處理定時隱藏動畫
    if (showNewVisitAnimation) {
      const animDuration = setTimeout(() => {
        setShowNewVisitAnimation(false);
      }, 2000);
      
      return () => clearTimeout(animDuration);
    }
  }, [showNewVisitAnimation]);
  
  return (
    <Card 
      className={cn(
        "bg-primary text-primary-foreground visitor-counter-card",
        "transform transition-all duration-300 hover:scale-105",
        showNewVisitAnimation ? "shadow-lg shadow-primary/30" : ""
      )}
    >
      <CardContent className="pt-6 overflow-hidden">
        <div className="flex items-center justify-between relative">
          {/* 訪問次數增加時的動畫特效 */}
          {showNewVisitAnimation && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute -top-8 -right-5 text-yellow-300 text-2xl font-bold"
            >
              +1
            </motion.div>
          )}
          
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              animate={showNewVisitAnimation ? { scale: [1, 1.2, 1] } : {}}
            >
              <UserCheck className={cn("h-6 w-6", showNewVisitAnimation ? "text-yellow-300" : "")} />
            </motion.div>
            <h3 className="text-lg font-semibold">網站訪問次數</h3>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">今日訪問</p>
            <motion.p 
              className="text-2xl font-bold"
              animate={showNewVisitAnimation ? { 
                scale: [1, 1.15, 1],
                color: ["#fff", "#fde047", "#fff"]
              } : {}}
              transition={{ duration: 1.5 }}
            >
              {todayVisits}
            </motion.p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm opacity-90">總訪問次數</p>
          <motion.p 
            className="text-4xl font-bold"
            animate={showNewVisitAnimation ? { 
              scale: [1, 1.1, 1]
            } : {}}
            transition={{ duration: 1 }}
          >
            <AnimatedCounter value={totalVisits} />
          </motion.p>
        </div>

        <MilestoneProgress currentVisits={totalVisits} />
      </CardContent>
    </Card>
  );
}