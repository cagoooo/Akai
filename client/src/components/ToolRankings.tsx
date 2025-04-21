import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Trophy, Medal, Crown, Star, Sparkles, Volume2, VolumeX } from "lucide-react";
import { tools } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from 'react';
import { soundManager } from "@/lib/soundManager";
import { Button } from "@/components/ui/button";
import { RankingTutorial } from "./RankingTutorial";
import { useLocation } from "wouter";
import { useToolTracking } from "@/hooks/useToolTracking";

interface ToolRanking {
  toolId: number;
  totalClicks: number;
  lastUsedAt: string;
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
  },
  change: (isUp: boolean) => ({
    backgroundColor: isUp ? ["#4ade80", "transparent"] : ["#ef4444", "transparent"],
    transition: { duration: 1.5 }
  })
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
  const { trackToolUsage } = useToolTracking();
  
  // 保存前一次的排名數據用於比較
  const [prevRankings, setPrevRankings] = useState<Record<number, number>>({});

  // 從本地存儲中獲取排行榜數據
  const getLocalRankings = (): ToolRanking[] => {
    try {
      const localData = localStorage.getItem('localToolsRankings');
      if (localData) {
        const parsed = JSON.parse(localData);
        
        // 確保解析得到的是陣列
        if (Array.isArray(parsed)) {
          console.log('從本地讀取的排行榜數據:', parsed);
          return parsed;
        } else if (parsed && 'data' in parsed && Array.isArray(parsed.data)) {
          console.log('從本地讀取的排行榜數據(data屬性):', parsed.data);
          return parsed.data;
        }
      }
    } catch (e) {
      console.error('無法讀取本地排行榜數據:', e);
    }
    return [];
  };
  
  // 同步排行榜數據到本地存儲
  const updateLocalRankings = (data: any[]) => {
    try {
      console.log('更新本地排行榜數據:', data);
      localStorage.setItem('localToolsRankings', JSON.stringify(data));
    } catch (e) {
      console.error('無法更新本地排行榜數據:', e);
    }
  };

  const { data: rankings = [], isLoading, error, refetch } = useQuery<ToolRanking[]>({
    queryKey: ['/api/tools/rankings'],
    retry: 3,
    refetchOnWindowFocus: true, // 視窗獲得焦點時刷新
    refetchInterval: 5000, // 每5秒自動刷新一次
    staleTime: 2000, // 數據2秒後就視為過時
    // 如果API請求失敗，使用本地存儲的數據
    initialData: getLocalRankings()
  });
  
  // 強制每次顯示時都刷新一次排行榜
  useEffect(() => {
    // 立即刷新一次
    refetch();
    
    // 設置定期刷新
    const refreshTimer = setInterval(() => {
      refetch();
    }, 5000); // 每5秒刷新一次
    
    return () => clearInterval(refreshTimer);
  }, [refetch]);

  // 生成排名變動數據
  const rankingsWithChange = useMemo<RankingWithChange[]>(() => {
    // 將數據帶入變更前先檢查結構
    console.log('Current rankings data:', rankings);
    
    // 確保正確處理可能的API響應格式 (有些API回傳 {data: []} 格式)
    let rankingsData = rankings;
    if (rankingsData && 'data' in rankingsData && Array.isArray(rankingsData.data)) {
      rankingsData = rankingsData.data;
    }
    
    const result = rankingsData.map((ranking, index) => {
      const prevIndex = prevRankings[ranking.toolId] !== undefined ? prevRankings[ranking.toolId] : index;
      const change = prevIndex - index; // 正數表示上升，負數表示下降
      return { ...ranking, change, prevIndex };
    });
    
    return result;
  }, [rankings, prevRankings]);
  
  // 使用 useEffect 來更新前一次的排名，避免無限循環
  useEffect(() => {
    if (rankings.length > 0) {
      // 處理可能的API響應格式
      let rankingsData = rankings;
      if (rankingsData && 'data' in rankingsData && Array.isArray(rankingsData.data)) {
        rankingsData = rankingsData.data;
      }
      
      // 更新前一次排名
      const newPrevRankings: Record<number, number> = {};
      rankingsData.forEach((r, i) => {
        newPrevRankings[r.toolId] = i;
      });
      setPrevRankings(newPrevRankings);
      
      // 更新本地存儲
      updateLocalRankings(rankingsData);
      
      // 打印排行榜數據
      console.log('排行榜數據已更新:', rankingsData);
    }
  }, [rankings]);

  const toggleMute = () => {
    const newMutedState = !isMuted;
    soundManager.setMute(newMutedState);
    setIsMuted(newMutedState);
  };

  const handleItemClick = (tool: typeof tools[number]) => {
    try {
      console.log('排行榜點擊工具:', tool.id, tool.url);
      
      // 首先確保打開新視窗，不等待 API 調用完成
      const newWindow = window.open(tool.url, '_blank', 'noopener,noreferrer');
      
      // 確保新視窗被打開
      if (newWindow) {
        newWindow.opener = null; // 安全考量，斷開與原窗口的連接
      } else {
        console.warn('無法打開新視窗，可能是被瀏覽器阻止了');
      }
      
      // 然後再異步追蹤工具使用（不阻塞用戶體驗）
      trackToolUsage(tool.id)
        .then(() => console.log('排行榜工具使用已追蹤:', tool.id))
        .catch(err => console.error('排行榜工具使用追蹤失敗:', err));
        
    } catch (error) {
      console.error('處理工具點擊時發生錯誤:', error);
      
      // 即使發生錯誤，也嘗試打開 URL
      try {
        window.open(tool.url, '_blank');
      } catch (e) {
        console.error('二次嘗試打開 URL 失敗:', e);
      }
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
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="m18 15-6-6-6 6"/>
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
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6"/>
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

  // Error state - 嘗試使用本地存儲的數據
  if (error) {
    console.error('Rankings error:', error);
    
    // 從本地存儲讀取數據
    let localRankings = getLocalRankings();
    
    // 如果本地也沒有數據，才生成默認數據
    if (!localRankings || localRankings.length === 0) {
      const defaultRankings = tools
        .slice(0, 8)
        .map((tool, index) => ({
          toolId: tool.id,
          totalClicks: Math.max(1, 20 - index * 2), // 起始點擊數較合理
          lastUsedAt: new Date().toISOString(),
          categoryClicks: {
            communication: 0,
            teaching: 0,
            language: 0,
            reading: 0,
            utilities: 0,
            games: 0
          }
        }));
      
      // 保存到本地存儲
      try {
        localStorage.setItem('localToolsRankings', JSON.stringify(defaultRankings));
      } catch (e) {
        console.error('無法保存預設排行榜到本地存儲:', e);
      }
      
      localRankings = defaultRankings;
    }
    
    // 排序確保展示正確的排行
    const defaultRankings = [...localRankings].sort((a, b) => b.totalClicks - a.totalClicks);
      
    // 使用默認數據渲染
    return (
      <Card className="overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-50 pointer-events-none z-0"></div>
        <CardHeader className="relative z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart className="w-5 h-5" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 font-bold">
                工具使用排行榜
              </span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <RankingTutorial />
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="h-8 w-8 p-0"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="relative z-10">
          <AnimatePresence mode="popLayout">
            {defaultRankings.map((ranking, index) => {
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
                  className={`
                    flex items-center space-x-4 p-4 rounded-lg 
                    transition-all duration-300 cursor-pointer
                    bg-gradient-to-r 
                    ${rankColor}
                    mb-4 relative overflow-hidden
                    hover:shadow-lg hover:translate-x-1
                    perspective-500 transform-gpu backdrop-blur-sm
                  `}
                >
                  <div className="flex-shrink-0 w-10 flex justify-center">
                    {index === 0 && (
                      <motion.div initial={{ scale: 0.8 }} animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, repeatDelay: 5 }}>
                        <Trophy className="w-6 h-6 text-yellow-500 drop-shadow-md" />
                      </motion.div>
                    )}
                    {index === 1 && <Medal className="w-6 h-6 text-slate-400 drop-shadow-sm" />}
                    {index === 2 && <Crown className="w-6 h-6 text-amber-400 drop-shadow-sm" />}
                    {index > 2 && (
                      <div className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center text-xs font-semibold">
                        {index + 1}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-foreground truncate flex items-center">
                        {tool.title}
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="14" 
                          height="14" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="ml-2 text-primary/70 transform -rotate-45"
                          aria-hidden="true"
                        >
                          <path d="M7 17l9.2-9.2M17 17V7H7"/>
                        </svg>
                      </p>
                    </div>
                    
                    <p className="text-sm text-muted-foreground truncate flex items-center">
                      <span className="mr-1">最後使用：</span>
                      <time dateTime={ranking.lastUsedAt}>
                        {new Date(ranking.lastUsedAt).toLocaleDateString()}
                      </time>
                    </p>
                    <span className="text-xs text-primary/70 italic mt-1 block font-light">點擊開啟新視窗</span>
                  </div>

                  <Badge variant={isTop ? "secondary" : "outline"} className="ml-2 shadow-sm">
                    <Sparkles className="w-4 h-4 mr-1" />
                    <span className="font-mono">{ranking.totalClicks}</span>
                    <span className="ml-1 text-xs">次使用</span>
                  </Badge>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-50 pointer-events-none z-0"></div>
      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2" id="rankings-title">
            <BarChart className="w-5 h-5" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 font-bold">
              工具使用排行榜
            </span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <RankingTutorial />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="h-8 w-8 p-0"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <AnimatePresence mode="popLayout">
          {rankingsWithChange.map((ranking, index) => {
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
                  flex items-center space-x-4 p-4 rounded-lg 
                  transition-all duration-300 cursor-pointer
                  bg-gradient-to-r 
                  ${rankColor}
                  mb-4 relative overflow-hidden
                  hover:shadow-lg hover:translate-x-1
                  perspective-500 transform-gpu backdrop-blur-sm
                `}
              >
                <div className="flex-shrink-0 w-10 flex justify-center">
                  {index === 0 && (
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, repeatDelay: 5 }}>
                      <Trophy className="w-6 h-6 text-yellow-500 drop-shadow-md" />
                    </motion.div>
                  )}
                  {index === 1 && <Medal className="w-6 h-6 text-slate-400 drop-shadow-sm" />}
                  {index === 2 && <Crown className="w-6 h-6 text-amber-400 drop-shadow-sm" />}
                  {index > 2 && (
                    <div className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center text-xs font-semibold">
                      {index + 1}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-foreground truncate flex items-center">
                      {tool.title}
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="14" 
                        height="14" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="ml-2 text-primary/70 transform -rotate-45"
                        aria-hidden="true"
                      >
                        <path d="M7 17l9.2-9.2M17 17V7H7"/>
                      </svg>
                    </p>
                    <div id={index === 0 ? "ranking-changes" : undefined}>
                      {getRankChangeIndicator(ranking.change)}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground truncate flex items-center">
                    <span className="mr-1">最後使用：</span>
                    <time dateTime={ranking.lastUsedAt}>
                      {new Date(ranking.lastUsedAt).toLocaleDateString()}
                    </time>
                  </p>
                  <span className="text-xs text-primary/70 italic mt-1 block font-light">點擊開啟新視窗</span>
                </div>

                <Badge variant={isTop ? "secondary" : "outline"} className="ml-2 shadow-sm" id={index === 0 ? "usage-stats" : undefined}>
                  <Sparkles className="w-4 h-4 mr-1" />
                  <span className="font-mono">{ranking.totalClicks}</span>
                  <span className="ml-1 text-xs">次使用</span>
                </Badge>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}