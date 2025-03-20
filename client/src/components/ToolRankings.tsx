import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Trophy, Medal, Crown, Star, Sparkles, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { soundManager } from "@/lib/soundManager";
import { useToolTracking } from "@/hooks/useToolTracking";
import { useToast } from "@/hooks/use-toast"; // 修正導入路徑
import { tools } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";

// 擴充表情符號庫,增加更多有趣的動態表情
const rankEmojis = [
  ["👑", "✨", "🌟", "💫", "⭐"],
  ["🏆", "💫", "⭐", "✨", "🌠"],
  ["🥇", "🌟", "⭐", "✨", "💫"],
  ["🎯", "🌈", "💫", "✨", "⚡"],
  ["🔥", "💎", "⚡", "💫", "🌙"],
  ["⚡", "🌙", "✨", "💫", "⭐"],
  ["💫", "⭐", "✨", "🌟", "🌠"],
  ["🌟", "💫", "✨", "⭐", "🎯"]
];

// 改進排名動畫變體
const rankAnimationVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 20,
    rotate: -10,
    filter: "blur(4px)"
  },
  visible: (custom: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    rotate: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 25,
      delay: custom * 0.1,
      duration: 0.8
    }
  }),
  hover: {
    scale: 1.05,
    rotate: [0, -2, 2, -1, 1, 0],
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  },
  rankUp: {
    scale: [1, 1.3, 0.9, 1.2, 1],
    rotate: [0, 15, -15, 8, -8, 0],
    filter: ["blur(0px)", "blur(2px)", "blur(0px)"],
    transition: {
      duration: 1,
      ease: "easeInOut"
    }
  },
  rankDown: {
    scale: [1, 0.8, 1.1, 0.9, 1],
    rotate: [0, -8, 8, -4, 4, 0],
    filter: ["blur(0px)", "blur(1px)", "blur(0px)"],
    transition: {
      duration: 0.8,
      ease: "easeInOut"
    }
  }
};

// 修改 RankingIcon 組件,增加動畫效果
const RankingIcon = ({ rank, previousRank }: { rank: number; previousRank?: number }) => {
  const icons = {
    1: <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />,
    2: <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />,
    3: <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />,
  };

  const emojis = rankEmojis[rank - 1] || ["🎯", "✨", "🌈", "💫", "⚡"];
  const isTopRank = rank <= 3;
  const rankChanged = previousRank !== undefined && previousRank !== rank;
  const rankImproved = previousRank !== undefined && rank < previousRank;

  return (
    <motion.div
      whileHover={{
        scale: 1.2,
        rotate: [0, -10, 10, -5, 5, 0],
        transition: {
          duration: 0.5,
          ease: "easeInOut"
        }
      }}
      animate={rankChanged ? (rankImproved ? "rankUp" : "rankDown") : undefined}
      variants={rankAnimationVariants}
      className="relative"
    >
      <motion.div
        initial={false}
        animate={{
          scale: [1, 1.2, 1],
          rotate: isTopRank ? [0, -5, 5, -3, 3, 0] : 0,
          y: isTopRank ? [0, -5, 0] : 0
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatDelay: rank === 1 ? 0.5 : 1
        }}
      >
        {icons[rank as keyof typeof icons] || (
          <span className="w-6 h-6 inline-flex items-center justify-center font-bold text-muted-foreground">
            {emojis[0]}
            {emojis.slice(1).map((emoji, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.2, 0.8],
                  rotate: [0, 180 * (index % 2 ? -1 : 1), 0]
                }}
                transition={{
                  duration: 2 + index * 0.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: index * 0.3
                }}
                className={`absolute text-xs
                  ${index === 1 ? "-right-1 -top-1" : ""}
                  ${index === 2 ? "right-0 bottom-0" : ""}
                  ${index === 3 ? "-left-1 top-1" : ""}
                  ${index === 4 ? "left-0 -bottom-1" : ""}
                `}
              >
                {emoji}
              </motion.span>
            ))}
          </span>
        )}
      </motion.div>
      {rank === 1 && (
        <motion.div
          className="absolute -inset-2 z-0"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.2, 0.6, 0.2],
            scale: [0.8, 1.2, 0.8],
            background: [
              'radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, transparent 70%)',
              'radial-gradient(circle, rgba(255, 215, 0, 0.25) 0%, transparent 70%)',
              'radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, transparent 70%)'
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      )}
      {rankImproved && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: [0, 1, 0],
            y: [-10, -20, -30],
            scale: [1, 1.3, 1],
            rotate: [0, -10, 10, -5, 5, 0]
          }}
          transition={{ duration: 1.2 }}
          className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-sm"
        >
          {rank === 1 ? "🏅" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : ""}
        </motion.div>
      )}
      <div
        className="flex flex-col items-center p-2"
        onClick={(e) => e.stopPropagation()}
      >
      </div>
    </motion.div>
  );
};

interface ToolRanking {
  toolId: number;
  totalClicks: number;
  lastUsedAt: string;
  categoryClicks: Record<string, number>;
}

const rankColors = {
  0: "from-yellow-50/80 via-yellow-100/50 to-yellow-200/30 dark:from-yellow-500/20 dark:to-yellow-600/20 border-yellow-200/50",
  1: "from-gray-50/80 via-gray-100/50 to-gray-200/30 dark:from-gray-500/20 dark:to-gray-600/20 border-gray-200/50",
  2: "from-amber-50/80 via-amber-100/50 to-amber-200/30 dark:from-amber-500/20 dark:to-amber-600/20 border-amber-200/50",
  default: "from-slate-50/50 via-white to-slate-50/50 hover:from-slate-100/50 hover:to-slate-100/50"
};

export function ToolRankings() {
  const [previousRankings, setPreviousRankings] = useState<Record<number, number>>({});
  const [isMuted, setIsMuted] = useState(soundManager.isSoundMuted());
  const queryClient = useQueryClient();
  const { trackToolUsage } = useToolTracking();
  const { toast } = useToast();

  const { data: rankings = [], isLoading, error, refetch } = useQuery<ToolRanking[]>({
    queryKey: ['/api/tools/rankings'],
    refetchOnWindowFocus: false,
    staleTime: 0,
    retry: 3,
    placeholderData: [],
    onError: (error) => {
      console.error('排行榜數據獲取失敗:', error);
      toast({
        title: "提示",
        description: "暫時無法獲取即時排行榜數據，顯示本地數據",
        variant: "default",
      });
    },
    onSuccess: (newRankings) => {
      const newRankingPositions: Record<number, number> = {};
      newRankings.forEach((ranking, index) => {
        const currentRank = index + 1;
        const previousRank = previousRankings[ranking.toolId];

        if (previousRank && currentRank !== previousRank) {
          soundManager.playSound(currentRank < previousRank ? 'rankUp' : 'rankDown');
        }

        newRankingPositions[ranking.toolId] = currentRank;
      });
      setPreviousRankings(newRankingPositions);
    }
  });

  const toggleMute = () => {
    const newMutedState = !isMuted;
    soundManager.setMute(newMutedState);
    setIsMuted(newMutedState);
  };

  const handleItemClick = async (tool: typeof tools[number]) => {
    try {
      const result = await trackToolUsage(tool.id);
      console.log('排行榜工具使用已追蹤:', tool.id, result);

      if (result.totalClicks) {
        const updatedRankings = rankings.map(ranking =>
          ranking.toolId === tool.id
            ? { ...ranking, totalClicks: result.totalClicks }
            : ranking
        );
        queryClient.setQueryData(['/api/tools/rankings'], updatedRankings);
      }

      window.open(tool.url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('處理工具點擊時發生錯誤:', error);
      toast({
        title: "提示",
        description: "已記錄工具使用",
        variant: "default",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>工具使用排行榜</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            工具使用排行榜
            {error && <span className="text-sm text-muted-foreground">(本地數據)</span>}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={toggleMute}>
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="sync">
          {(rankings.length > 0 ? rankings : tools).map((item, index) => {
            const tool = tools.find(t => t.id === (item as any).toolId) || item;
            return (
              <motion.div
                key={tool.id}
                className="mb-2 p-3 rounded-lg hover:bg-accent cursor-pointer"
                onClick={() => handleItemClick(tool)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">{index + 1}</span>
                  <span>{tool.title}</span>
                  <Badge variant="secondary">
                    {((item as any).totalClicks || 0)} 次使用
                  </Badge>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}