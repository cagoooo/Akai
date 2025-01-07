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

const rankEmojis = ["👑", "🏆", "🌟", "✨", "🎯"];

const RankingIcon = ({ rank }: { rank: number }) => {
  const icons = {
    1: <Trophy className="w-6 h-6 text-yellow-500" />,
    2: <Medal className="w-6 h-6 text-gray-400" />,
    3: <Medal className="w-6 h-6 text-amber-600" />
  };

  const emoji = rankEmojis[rank - 1] || "🎯";

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
          rotate: rank === 1 ? [0, -5, 5, -3, 3, 0] : 0
        }}
        transition={{ 
          duration: 1,
          repeat: rank === 1 ? Infinity : 0,
          repeatDelay: 2
        }}
      >
        {icons[rank] || (
          <span className="w-6 h-6 inline-flex items-center justify-center font-bold text-muted-foreground">
            {emoji}
          </span>
        )}
      </motion.div>
      {rank === 1 && (
        <motion.div
          className="absolute -top-1 -right-1"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          <Sparkles className="w-3 h-3 text-yellow-400" />
        </motion.div>
      )}
    </motion.div>
  );
};

export function ToolRankings() {
  const { data: rankings, isLoading } = useQuery<ToolRanking[]>({
    queryKey: ['/api/tools/rankings'],
    refetchInterval: 2000, // Poll every 2 seconds for updates
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
              duration: 1,
              repeat: Infinity,
              repeatDelay: 3
            }}
          >
            <BarChart className="w-5 h-5" />
          </motion.div>
          <motion.span
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
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
            const delay = index * 0.1;

            return (
              <motion.div 
                key={ranking.toolId}
                layout
                initial={{ opacity: 0, x: -20, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  y: 0,
                  transition: {
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                    delay
                  }
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.8,
                  transition: { duration: 0.2 }
                }}
                whileHover={{ 
                  scale: 1.02,
                  backgroundColor: "rgba(var(--primary-rgb), 0.05)",
                }}
                className={`
                  flex items-center space-x-4 p-3 rounded-lg 
                  transition-colors duration-200 mb-2
                  ${isTop ? 'bg-primary/5' : 'hover:bg-muted/50'}
                `}
              >
                <motion.div 
                  className="flex-shrink-0"
                  layoutId={`rank-${ranking.toolId}`}
                >
                  <RankingIcon rank={index + 1} />
                </motion.div>
                <motion.div 
                  className="flex-1 min-w-0"
                  layoutId={`content-${ranking.toolId}`}
                >
                  <motion.p 
                    className="text-sm font-medium text-foreground truncate"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: delay + 0.2 }}
                  >
                    {tool.title}
                  </motion.p>
                  <motion.p 
                    className="text-sm text-muted-foreground truncate"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: delay + 0.3 }}
                  >
                    最後使用：{new Date(ranking.lastUsedAt).toLocaleDateString()}
                  </motion.p>
                </motion.div>
                <motion.div
                  layoutId={`badge-${ranking.toolId}`}
                  className="flex-shrink-0"
                >
                  <Badge 
                    variant={isTop ? "secondary" : "outline"}
                    className={`
                      ${isTop ? 'animate-pulse' : ''}
                      flex items-center gap-1
                    `}
                  >
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ 
                        duration: 0.5,
                        repeat: Infinity,
                        repeatDelay: 3
                      }}
                    >
                      {rankEmojis[index] || "🎯"}
                    </motion.span>
                    {ranking.totalClicks} 次使用
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