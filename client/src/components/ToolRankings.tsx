import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Trophy, Medal, Crown, Star, Sparkles } from "lucide-react";
import { tools } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from 'react';

interface ToolRanking {
  toolId: number;
  totalClicks: number;
  lastUsedAt: string;
  categoryClicks: Record<string, number>;
}

// 擴充表情符號庫,增加更多有趣的動態表情
const rankEmojis = [
  ["👑", "✨", "🌟"], ["🏆", "💫", "⭐"], ["🌟", "⭐", "✨"], 
  ["✨", "💫", "🌈"], ["🎯", "🌈", "💫"], ["🔥", "💎", "⚡"],
  ["💫", "⚡", "🌙"], ["⭐", "🌙", "✨"]
];

// 排名動畫變體
const rankAnimationVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8, 
    y: 20,
    rotate: -10
  },
  visible: (custom: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 25,
      delay: custom * 0.1,
      duration: 0.6
    }
  }),
  hover: {
    scale: 1.05,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  },
  rankUp: {
    scale: [1, 1.2, 0.9, 1.1, 1],
    rotate: [0, 10, -10, 5, 0],
    transition: {
      duration: 0.8,
      ease: "easeInOut"
    }
  },
  rankDown: {
    scale: [1, 0.9, 1.1, 0.95, 1],
    rotate: [0, -5, 5, -3, 0],
    transition: {
      duration: 0.8,
      ease: "easeInOut"
    }
  }
};

const RankingIcon = ({ rank, previousRank }: { rank: number; previousRank?: number }) => {
  const icons = {
    1: <Trophy className="w-6 h-6 text-yellow-500" />,
    2: <Medal className="w-6 h-6 text-gray-400" />,
    3: <Medal className="w-6 h-6 text-amber-600" />
  };

  const [emoji1, emoji2, emoji3] = rankEmojis[rank - 1] || ["🎯", "✨", "🌈"];
  const isTopRank = rank <= 3;
  const rankChanged = previousRank !== undefined && previousRank !== rank;
  const rankImproved = previousRank !== undefined && rank < previousRank;

  return (
    <motion.div
      whileHover={{ scale: 1.2, rotate: [0, -10, 10, -5, 5, 0] }}
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
          repeatDelay: rank === 1 ? 1 : 2
        }}
      >
        {icons[rank as keyof typeof icons] || (
          <span className="w-6 h-6 inline-flex items-center justify-center font-bold text-muted-foreground">
            {emoji1}
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ 
                opacity: [0.5, 1, 0.5],
                scale: [0.8, 1.2, 0.8],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="absolute -right-1 -top-1 text-xs"
            >
              {emoji2}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ 
                opacity: [0.3, 0.8, 0.3],
                scale: [0.6, 1, 0.6],
                rotate: [0, -180, -360]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                repeatType: "reverse",
                delay: 0.5
              }}
              className="absolute right-0 bottom-0 text-xs"
            >
              {emoji3}
            </motion.span>
          </span>
        )}
      </motion.div>
      {rank === 1 && (
        <motion.div
          className="absolute -inset-2 z-0"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0.2, 0.5, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          style={{
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, transparent 70%)'
          }}
        />
      )}
      {rankImproved && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: [0, 1, 0], 
            y: [-10, -20, -30],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 1 }}
          className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-sm"
        >
          {rank === 1 ? "🏅" : "⬆️"}
        </motion.div>
      )}
    </motion.div>
  );
};

export function ToolRankings() {
  const [previousRankings, setPreviousRankings] = useState<Record<number, number>>({});
  const { data: rankings, isLoading } = useQuery<ToolRanking[]>({
    queryKey: ['/api/tools/rankings'],
    refetchInterval: 2000,
    onSuccess: (data) => {
      // 更新先前排名
      const newRankings: Record<number, number> = {};
      data.forEach((ranking, index) => {
        newRankings[ranking.toolId] = index + 1;
      });
      setPreviousRankings(newRankings);
    }
  });

  if (isLoading) {
    return (
      <Card className="relative overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <BarChart className="w-5 h-5" />
            </motion.div>
            工具使用排行榜
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{
            x: ["0%", "100%"],
            opacity: [0, 0.5, 0]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, -5, 5, -3, 3, 0]
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 2
            }}
          >
            <BarChart className="w-5 h-5" />
          </motion.div>
          <motion.span
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
          >
            工具使用排行榜
          </motion.span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="sync">
          {rankings?.map((ranking, index) => {
            const tool = tools.find(t => t.id === ranking.toolId);
            if (!tool) return null;

            const isTop = index < 3;
            const previousRank = previousRankings[ranking.toolId];

            return (
              <motion.div 
                key={ranking.toolId}
                layout
                variants={rankAnimationVariants}
                initial="hidden"
                animate="visible"
                exit={{ 
                  opacity: 0, 
                  scale: 0.8,
                  y: 20,
                  transition: { duration: 0.3 }
                }}
                custom={index}
                whileHover="hover"
                className={`
                  flex items-center space-x-4 p-3 rounded-lg 
                  transition-all duration-300
                  ${isTop ? 'bg-gradient-to-r from-primary/5 to-primary/10' : 'hover:bg-muted/50'}
                  mb-2 relative overflow-hidden
                  ${previousRank && previousRank > index + 1 ? 'border-l-4 border-green-400' : ''}
                  ${previousRank && previousRank < index + 1 ? 'border-l-4 border-orange-400' : ''}
                `}
              >
                {isTop && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5"
                    animate={{
                      x: ["0%", "100%"],
                      opacity: [0, 0.5, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                )}
                <motion.div 
                  className="flex-shrink-0 z-10"
                  layoutId={`rank-${ranking.toolId}`}
                >
                  <RankingIcon rank={index + 1} previousRank={previousRank} />
                </motion.div>
                <motion.div 
                  className="flex-1 min-w-0 z-10"
                  layoutId={`content-${ranking.toolId}`}
                >
                  <motion.div 
                    className="text-sm font-medium text-foreground truncate flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {tool.title}
                    {previousRank && previousRank > index + 1 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-xs text-green-500"
                      >
                        ↑ {previousRank - (index + 1)}
                      </motion.span>
                    )}
                    {previousRank && previousRank < index + 1 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-xs text-orange-500"
                      >
                        ↓ {index + 1 - previousRank}
                      </motion.span>
                    )}
                  </motion.div>
                  <motion.p 
                    className="text-sm text-muted-foreground truncate"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.1 }}
                  >
                    最後使用：{new Date(ranking.lastUsedAt).toLocaleDateString()}
                  </motion.p>
                </motion.div>
                <motion.div
                  layoutId={`badge-${ranking.toolId}`}
                  className="flex-shrink-0 z-10"
                >
                  <Badge 
                    variant={isTop ? "secondary" : "outline"}
                    className={`
                      ${isTop ? 'animate-pulse' : ''}
                      flex items-center gap-1
                      ${isTop ? 'bg-gradient-to-r from-primary/20 to-primary/30' : ''}
                    `}
                  >
                    <motion.span
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: isTop ? [0, 360] : 0
                      }}
                      transition={{ 
                        duration: isTop ? 2 : 0.5,
                        repeat: Infinity,
                        repeatDelay: isTop ? 1 : 3
                      }}
                    >
                      {rankEmojis[index][0]}
                    </motion.span>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                    >
                      {ranking.totalClicks} 次使用
                    </motion.span>
                    {isTop && (
                      <motion.span
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotate: [0, -360]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 1
                        }}
                      >
                        {rankEmojis[index][1]}
                      </motion.span>
                    )}
                  </Badge>
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}