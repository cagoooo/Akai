import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Trophy, Medal, Crown, Star, Sparkles } from "lucide-react";
import { tools } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

interface ToolRanking {
  toolId: number;
  totalClicks: number;
  lastUsedAt: string;
  categoryClicks: Record<string, number>;
}

// 擴充表情符號庫,增加更多有趣的動態表情
const rankEmojis = ["👑✨", "🏆💫", "🌟⭐", "✨💫", "🎯🌈", "🔥💎", "💫⚡", "⭐🌙"];

// 排名動畫變體
const rankAnimationVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30,
      delay: custom * 0.1,
      duration: 0.5
    }
  }),
  hover: {
    scale: 1.05,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
};

const RankingIcon = ({ rank }: { rank: number }) => {
  const icons = {
    1: <Trophy className="w-6 h-6 text-yellow-500" />,
    2: <Medal className="w-6 h-6 text-gray-400" />,
    3: <Medal className="w-6 h-6 text-amber-600" />
  };

  const emoji = rankEmojis[rank - 1] || "🎯✨";
  const isTopRank = rank <= 3;

  return (
    <motion.div
      whileHover={{ scale: 1.2, rotate: [0, -10, 10, -5, 5, 0] }}
      transition={{ duration: 0.5 }}
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
            {emoji.split('')[0]}
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
              {emoji.split('')[1]}
            </motion.span>
          </span>
        )}
      </motion.div>
      {rank === 1 && (
        <>
          <motion.div
            className="absolute -top-1 -right-1"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <Sparkles className="w-3 h-3 text-yellow-400" />
          </motion.div>
          <motion.div
            className="absolute -bottom-1 -left-1"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.8, 0.3],
              rotate: [360, 180, 0]
            }}
            transition={{
              duration: 2,
              delay: 0.5,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <Star className="w-2 h-2 text-yellow-300" />
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

export function ToolRankings() {
  const { data: rankings, isLoading } = useQuery<ToolRanking[]>({
    queryKey: ['/api/tools/rankings'],
    refetchInterval: 2000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="w-5 h-5" />
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
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
          >
            工具使用排行榜
          </motion.span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="popLayout">
          {rankings?.map((ranking, index) => {
            const tool = tools.find(t => t.id === ranking.toolId);
            if (!tool) return null;

            const isTop = index < 3;

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
                  transition: { duration: 0.3 }
                }}
                custom={index}
                whileHover="hover"
                className={`
                  flex items-center space-x-4 p-3 rounded-lg 
                  transition-colors duration-300
                  ${isTop ? 'bg-gradient-to-r from-primary/5 to-primary/10' : 'hover:bg-muted/50'}
                  mb-2 relative overflow-hidden
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
                  <RankingIcon rank={index + 1} />
                </motion.div>
                <motion.div 
                  className="flex-1 min-w-0 z-10"
                  layoutId={`content-${ranking.toolId}`}
                >
                  <motion.p 
                    className="text-sm font-medium text-foreground truncate"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {tool.title}
                  </motion.p>
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
                      {rankEmojis[index]?.split('')[0] || "🎯"}
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
                        {rankEmojis[index]?.split('')[1] || "✨"}
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