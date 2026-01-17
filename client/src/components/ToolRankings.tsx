import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Trophy, Medal, Crown, Sparkles, Volume2, VolumeX } from "lucide-react";
import { tools } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from 'react';
import { soundManager } from "@/lib/soundManager";
import { Button } from "@/components/ui/button";
import { RankingTutorial } from "./RankingTutorial";
import { getToolRankings, trackToolUsage, type ToolStats } from "@/lib/firestoreService";

interface ToolRanking {
  toolId: number;
  totalClicks: number;
  lastUsedAt: string | null;
  categoryClicks: Record<string, number>;
}

// 定義擴展的類型
type RankingWithChange = ToolRanking & {
  change: number;
  prevIndex: number;
};

// 排名動畫變體 - 增強動態感
const rankAnimationVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 40,
    rotateX: -10
  },
  visible: (custom: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    rotateX: 0,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 20,
      delay: custom * 0.15,
      duration: 0.6
    }
  }),
  hover: {
    scale: 1.03,
    y: -5,
    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 8
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: -20,
    transition: {
      duration: 0.3
    }
  }
};

// 更加豐富多彩的排名顏色
const rankColors: Record<string | number, string> = {
  0: "from-yellow-400/30 via-amber-300/40 to-yellow-200/50 dark:from-yellow-500/40 dark:via-amber-400/30 dark:to-yellow-300/20 border-l-4 border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.2)]",
  1: "from-slate-300/30 via-gray-200/40 to-slate-100/50 dark:from-slate-600/40 dark:via-gray-500/30 dark:to-slate-400/20 border-l-4 border-slate-400 shadow-[0_0_15px_rgba(148,163,184,0.2)]",
  2: "from-amber-400/30 via-orange-300/40 to-amber-200/50 dark:from-amber-600/40 dark:via-orange-500/30 dark:to-amber-400/20 border-l-4 border-amber-500 shadow-[0_0_15px_rgba(217,119,6,0.2)]",
  3: "from-blue-400/20 via-blue-300/30 to-blue-200/40 dark:from-blue-600/30 dark:via-blue-500/20 dark:to-blue-400/10 border-l-4 border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.1)]",
  4: "from-green-400/20 via-green-300/30 to-green-200/40 dark:from-green-600/30 dark:via-green-500/20 dark:to-green-400/10 border-l-4 border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.1)]",
  5: "from-indigo-400/20 via-indigo-300/30 to-indigo-200/40 dark:from-indigo-600/30 dark:via-indigo-500/20 dark:to-indigo-400/10 border-l-4 border-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.1)]",
  6: "from-purple-400/20 via-purple-300/30 to-purple-200/40 dark:from-purple-600/30 dark:via-purple-500/20 dark:to-purple-400/10 border-l-4 border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.1)]",
  7: "from-pink-400/20 via-pink-300/30 to-pink-200/40 dark:from-pink-600/30 dark:via-pink-500/20 dark:to-pink-400/10 border-l-4 border-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.1)]",
  default: "from-slate-200/20 via-white to-slate-100/30 hover:from-slate-200/30 hover:to-slate-100/40 border-l-4 border-slate-200"
};

export function ToolRankings() {
  const [isMuted, setIsMuted] = useState(soundManager.isSoundMuted());
  const [rankings, setRankings] = useState<ToolRanking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 保存前一次的排名數據用於比較
  const [prevRankings, setPrevRankings] = useState<Record<number, number>>({});

  // 從 Firestore 載入排行榜數據
  const loadRankings = async () => {
    try {
      const firestoreRankings = await getToolRankings(10);

      // 轉換 Firestore 資料格式
      const formattedRankings: ToolRanking[] = firestoreRankings.map(stat => ({
        toolId: stat.toolId,
        totalClicks: stat.totalClicks,
        lastUsedAt: stat.lastUsedAt?.toDate?.()?.toISOString() || null,
        categoryClicks: stat.categoryClicks || {}
      }));

      // 如果 Firestore 沒有資料，使用本地快取或預設值
      if (formattedRankings.length === 0) {
        const localData = localStorage.getItem('localToolsRankings');
        if (localData) {
          setRankings(JSON.parse(localData));
        } else {
          // 使用預設資料
          const defaultRankings = tools.slice(0, 10).map((tool, index) => ({
            toolId: tool.id,
            totalClicks: Math.max(1, 20 - index * 2),
            lastUsedAt: new Date().toISOString(),
            categoryClicks: {}
          }));
          setRankings(defaultRankings);
        }
      } else {
        setRankings(formattedRankings);
        // 更新本地快取
        localStorage.setItem('localToolsRankings', JSON.stringify(formattedRankings));
      }

      setError(null);
    } catch (err) {
      console.error('載入排行榜失敗:', err);
      setError(err as Error);

      // 使用本地快取
      const localData = localStorage.getItem('localToolsRankings');
      if (localData) {
        setRankings(JSON.parse(localData));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 初始載入與定期刷新
  useEffect(() => {
    loadRankings();

    // 每 10 秒刷新一次
    const refreshTimer = setInterval(loadRankings, 10000);

    return () => clearInterval(refreshTimer);
  }, []);

  // 生成排名變動數據
  const rankingsWithChange = useMemo<RankingWithChange[]>(() => {
    return rankings.map((ranking, index) => {
      const prevIndex = prevRankings[ranking.toolId] !== undefined ? prevRankings[ranking.toolId] : index;
      const change = prevIndex - index;
      return { ...ranking, change, prevIndex };
    });
  }, [rankings, prevRankings]);

  // 更新前一次的排名
  useEffect(() => {
    if (rankings.length > 0) {
      const newPrevRankings: Record<number, number> = {};
      rankings.forEach((r, i) => {
        newPrevRankings[r.toolId] = i;
      });
      setPrevRankings(newPrevRankings);
    }
  }, [rankings]);

  const toggleMute = () => {
    const newMutedState = !isMuted;
    soundManager.setMute(newMutedState);
    setIsMuted(newMutedState);
  };

  const handleItemClick = async (tool: typeof tools[number]) => {
    try {
      console.log('排行榜點擊工具:', tool.id, tool.url);

      // 首先確保打開新視窗
      const newWindow = window.open(tool.url, '_blank', 'noopener,noreferrer');

      if (newWindow) {
        newWindow.opener = null;
      }

      // 使用 Firestore 追蹤工具使用
      try {
        await trackToolUsage(tool.id);
        console.log('工具使用已透過 Firestore 追蹤:', tool.id);
        // 刷新排行榜
        await loadRankings();
      } catch (err) {
        console.error('Firestore 追蹤失敗:', err);
      }

    } catch (error) {
      console.error('處理工具點擊時發生錯誤:', error);
      window.open(tool.url, '_blank');
    }
  };

  // 為排名項目添加變動指示
  const getRankChangeIndicator = (change: number) => {
    if (change > 0) {
      return (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center text-green-500 ml-2 font-medium text-xs"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m18 15-6-6-6 6" />
          </svg>
          <span>{change}</span>
        </motion.div>
      );
    } else if (change < 0) {
      return (
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center text-red-500 ml-2 font-medium text-xs"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
          <span>{Math.abs(change)}</span>
        </motion.div>
      );
    }
    return null;
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="space-y-2">
          <CardTitle className="flex items-center gap-2">
            <BarChart className="w-5 h-5" />
            工具使用排行榜
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-3 w-[150px]" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // 渲染排行榜
  const renderRankings = (rankingsData: RankingWithChange[]) => (
    <AnimatePresence mode="popLayout">
      {rankingsData.map((ranking, index) => {
        const tool = tools.find(t => t.id === ranking.toolId);
        if (!tool) return null;

        const isTop = index < 3;
        const rankColor = rankColors[index] || rankColors.default;

        return (
          <motion.div
            key={ranking.toolId}
            layout
            layoutId={`ranking-${ranking.toolId}`}
            variants={rankAnimationVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            custom={index}
            whileHover="hover"
            onClick={() => handleItemClick(tool)}
            id={index === 0 ? "top-tool" : (index < 5 ? "interaction-area" : undefined)}
            className={`
              flex items-center gap-3 p-3 rounded-xl 
              transition-all duration-300 cursor-pointer
              bg-gradient-to-r 
              ${rankColor}
              mb-2 relative overflow-hidden
              hover:shadow-lg hover:translate-x-1
              transform-gpu
            `}
          >
            <div className="flex-shrink-0 w-8 sm:w-10 flex justify-center">
              {index === 0 && (
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, repeatDelay: 5 }}>
                  <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-500 drop-shadow-md" />
                </motion.div>
              )}
              {index === 1 && <Medal className="w-6 h-6 sm:w-7 sm:h-7 text-slate-400 drop-shadow-sm" />}
              {index === 2 && <Crown className="w-6 h-6 sm:w-7 sm:h-7 text-amber-500 drop-shadow-sm" />}
              {index > 2 && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm sm:text-base font-bold text-slate-600">
                  {index + 1}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <p className="text-base sm:text-lg font-bold text-gray-900 truncate flex items-center">
                  {tool.title}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1.5 text-primary/70 transform -rotate-45" aria-hidden="true">
                    <path d="M7 17l9.2-9.2M17 17V7H7" />
                  </svg>
                </p>
                <div id={index === 0 ? "ranking-changes" : undefined}>
                  {getRankChangeIndicator(ranking.change)}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                最後使用：
                <time dateTime={ranking.lastUsedAt || undefined} className="font-medium">
                  {ranking.lastUsedAt
                    ? new Date(ranking.lastUsedAt).toLocaleDateString()
                    : '最近更新'}
                </time>
              </p>
            </div>

            <Badge variant={isTop ? "secondary" : "outline"} className="ml-auto px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-bold shadow-sm" id={index === 0 ? "usage-stats" : undefined}>
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-yellow-500" />
              <span className="font-mono text-base sm:text-lg">{ranking.totalClicks}</span>
              <span className="ml-0.5 text-xs">次</span>
            </Badge>
          </motion.div>
        );
      })}
    </AnimatePresence>
  );

  return (
    <Card className="overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-50 pointer-events-none z-0"></div>
      <CardHeader className="relative z-10 p-3 sm:p-4">
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl whitespace-nowrap" id="rankings-title">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <BarChart className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
            </div>
            <span className="font-black text-gray-900">
              工具使用排行榜
            </span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <RankingTutorial />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="h-7 w-7 sm:h-8 sm:w-8 p-0"
            >
              {isMuted ? <VolumeX className="h-3 w-3 sm:h-4 sm:w-4" /> : <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 p-2 sm:p-4">
        {renderRankings(rankingsWithChange)}
      </CardContent>
    </Card>
  );
}