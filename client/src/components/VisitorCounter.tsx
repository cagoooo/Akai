import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { UserCheck, Award, Star, Trophy, Crown, Diamond, Rocket, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { getVisitorStats, incrementVisitorCount, type VisitorStats } from "@/lib/firestoreService";

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
    <div className="mt-2 sm:mt-3 space-y-1.5">
      <div className="flex items-center justify-between text-[10px] sm:text-xs font-medium">
        <span className="text-primary-foreground/90 font-bold">目前：{currentVisits.toLocaleString()}</span>
        <div className="flex items-center gap-1 text-primary-foreground/90">
          <NextIcon className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 flex-shrink-0" />
          <span>下一個里程碑：</span>
          <span className="font-black text-yellow-300">{nextMilestone.value.toLocaleString()}</span>
        </div>
      </div>
      <Progress
        value={progress}
        className="h-2 sm:h-2.5 bg-white/20 [&>div]:bg-gradient-to-r [&>div]:from-yellow-300 [&>div]:via-yellow-400 [&>div]:to-orange-500 [&>div]:shadow-sm [&>div]:shadow-yellow-500/50"
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

  // 訪問計數狀態
  const [stats, setStats] = useState<VisitorStats>({
    totalVisits: 0,
    dailyVisits: {},
    lastVisitAt: null
  });
  const [loading, setLoading] = useState(true);
  const [showNewVisitAnimation, setShowNewVisitAnimation] = useState(false);

  // 載入訪客統計並監聽即時更新
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initStats = async () => {
      try {
        const { db, isFirebaseAvailable } = await import('@/lib/firebase');
        const { doc, onSnapshot } = await import('firebase/firestore');

        // 1. 先處理計數逻辑 (與原本一致，避免重複計算)
        const sessionVisited = sessionStorage.getItem('sessionVisited');
        const lastVisitTime = parseInt(localStorage.getItem('lastVisitTimestamp') || '0');
        const today = new Date().toISOString().split("T")[0];
        const lastVisitDate = localStorage.getItem('lastVisitDate') || '';
        const currentTime = Date.now();
        const MIN_VISIT_INTERVAL = 30 * 60 * 1000;

        const shouldIncrement = !sessionVisited || (currentTime - lastVisitTime > MIN_VISIT_INTERVAL) || (lastVisitDate !== today);
        sessionStorage.setItem('sessionVisited', 'true');

        if (shouldIncrement) {
          localStorage.setItem('lastVisitTimestamp', currentTime.toString());
          localStorage.setItem('lastVisitDate', today);
          await incrementVisitorCount();
        }

        // 2. 啟動 Firebase 即時監聽
        if (isFirebaseAvailable() && db) {
          unsubscribe = onSnapshot(
            doc(db, 'visitorStats', 'global'),
            (snapshot) => {
              if (snapshot.exists()) {
                const newStats = snapshot.data() as VisitorStats;
                // 如果是第一次載入或是數值有變動才更新展示
                setStats(prev => {
                  if (prev.totalVisits !== newStats.totalVisits) {
                    setShowNewVisitAnimation(true);
                    setTimeout(() => setShowNewVisitAnimation(false), 2000);
                  }
                  return newStats;
                });
                console.log('📈 訪客計數已實時更新');
              }
            }
          );
        } else {
          // Fallback to one-time fetch if Firebase not ready
          const currentStats = await getVisitorStats();
          setStats(currentStats);
        }

        // 3. 異步執行 IP 定位追蹤 (僅在應增加計數時執行一次)
        if (shouldIncrement) {
          trackContext();
        }

      } catch (error) {
        console.error('訪客計數初始化失敗:', error);
        setStats(prev => ({ ...prev, totalVisits: parseInt(localStorage.getItem('totalVisits') || '0') }));
      } finally {
        setLoading(false);
      }
    };

    // 分離追蹤邏輯以保持程式碼整潔
    const trackContext = async () => {
      try {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isTablet = /iPad|Android/i.test(navigator.userAgent) && !/Mobile/i.test(navigator.userAgent);

        const deviceStats = JSON.parse(localStorage.getItem('visitorDeviceStats') || '{"desktop":0,"mobile":0,"tablet":0}');
        if (isTablet) deviceStats.tablet = (deviceStats.tablet || 0) + 1;
        else if (isMobile) deviceStats.mobile = (deviceStats.mobile || 0) + 1;
        else deviceStats.desktop = (deviceStats.desktop || 0) + 1;
        localStorage.setItem('visitorDeviceStats', JSON.stringify(deviceStats));

        // 安全 HTTPS IP 地理定位
        try {
          const geoResponse = await fetch('https://ipinfo.io/json');
          if (geoResponse.ok) {
            const geoData = await geoResponse.json();
            const geoStats = JSON.parse(localStorage.getItem('visitorGeoStats') || '{}');
            let location = geoData.city || geoData.region || geoData.country || '其他';

            // 台灣地區中文轉換
            const taiwanCityMap: Record<string, string> = {
              'Taipei': '台北市', 'New Taipei': '新北市', 'Taichung': '台中市',
              'Kaohsiung': '高雄市', 'Taoyuan': '桃園市', 'Tainan': '台南市',
              'TW': '台灣', 'Taiwan': '台灣'
            };
            if (taiwanCityMap[location]) location = taiwanCityMap[location];

            geoStats[location] = (geoStats[location] || 0) + 1;
            localStorage.setItem('visitorGeoStats', JSON.stringify(geoStats));
            console.log('📍 IP 地理定位成功 (HTTPS):', location);
          }
        } catch (e) { console.warn('IP 定位失敗:', e); }

        // 追蹤來源 (Referrer)
        const referrer = document.referrer;
        if (referrer) {
          const referrerStats = JSON.parse(localStorage.getItem('visitorReferrerStats') || '{"direct":0,"search":0,"social":0,"email":0,"external":0}');
          const hostname = new URL(referrer).hostname.toLowerCase();
          let source = 'external';
          if (['google', 'bing', 'yahoo', 'baidu'].some(s => hostname.includes(s))) source = 'search';
          else if (['facebook', 'twitter', 'instagram', 'line.me'].some(s => hostname.includes(s))) source = 'social';
          else if (hostname === window.location.hostname) source = 'direct';
          referrerStats[source] = (referrerStats[source] || 0) + 1;
          localStorage.setItem('visitorReferrerStats', JSON.stringify(referrerStats));
        }
      } catch (e) { console.error('Context track error:', e); }
    };

    initStats();
    return () => unsubscribe?.();
  }, []);

  // 同步本地快取
  useEffect(() => {
    if (stats.totalVisits > 0) {
      localStorage.setItem('totalVisits', stats.totalVisits.toString());
    }
  }, [stats.totalVisits]);

  // Check for milestone achievements
  useEffect(() => {
    if (!stats?.totalVisits) return;

    // 檢查是否達到新的里程碑 (從大到小檢查，確保顯示最大的里程碑)
    const sortedMilestones = [...MILESTONES].sort((a, b) => b.value - a.value);
    const milestone = sortedMilestones.find(m =>
      stats.totalVisits >= m.value && m.value > lastMilestoneRef.current
    );

    if (milestone) {
      lastMilestoneRef.current = milestone.value;
      // 保存到 localStorage 以確保頁面重新載入後不會重複顯示
      localStorage.setItem('lastAchievedMilestone', milestone.value.toString());

      // 顯示里程碑達成通知
      toast({
        title: `${milestone.title}`,
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

  const today = new Date().toISOString().split("T")[0];
  const totalVisits = stats.totalVisits || 0;
  const todayVisits = stats.dailyVisits?.[today] || 0;

  return (
    <Card
      className={cn(
        "bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 text-primary-foreground visitor-counter-card",
        "transform transition-all duration-300 hover:scale-[1.02]",
        "shadow-lg shadow-blue-500/20",
        showNewVisitAnimation ? "shadow-xl shadow-primary/40" : ""
      )}
    >
      <CardContent className="py-3 sm:py-4 px-4 sm:px-6">
        {/* 頂部標題和今日訪問 - 一行顯示 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              animate={showNewVisitAnimation ? { scale: [1, 1.2, 1] } : {}}
            >
              <UserCheck className={cn("h-6 w-6 sm:h-7 sm:w-7", showNewVisitAnimation ? "text-yellow-300" : "")} />
            </motion.div>
            <h3 className="text-base sm:text-lg font-bold">網站訪問次數</h3>
          </div>

          <div className="text-right">
            <span className="text-xs sm:text-sm opacity-80">今日訪問</span>
            <motion.span
              className="ml-2 text-xl sm:text-2xl md:text-3xl font-black"
              animate={showNewVisitAnimation ? {
                scale: [1, 1.15, 1],
                color: ["#fff", "#fde047", "#fff"]
              } : {}}
              transition={{ duration: 1.5 }}
            >
              {todayVisits}
            </motion.span>
          </div>
        </div>

        {/* 中間大數字 - 增強視覺效果 */}
        <div className="my-3 sm:my-4 text-center">
          <p className="text-xs sm:text-sm opacity-80 mb-1">總訪問次數</p>
          <motion.div
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight"
            animate={showNewVisitAnimation ? {
              scale: [1, 1.1, 1]
            } : {}}
            transition={{ duration: 1 }}
          >
            <AnimatedCounter value={totalVisits} />
          </motion.div>
        </div>

        {/* 進度條 - 緊湊設計 */}
        <MilestoneProgress currentVisits={totalVisits} />

        {/* 訪問次數增加時的動畫特效 */}
        {showNewVisitAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute top-2 right-4 text-yellow-300 text-xl font-black"
          >
            +1
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}