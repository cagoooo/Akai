import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Trophy, Medal } from "lucide-react";
import { tools } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

interface ToolRanking {
  toolId: number;
  totalClicks: number;
  lastUsedAt: string;
  categoryClicks: Record<string, number>;
}

const RankingIcon = ({ rank }: { rank: number }) => {
  switch (rank) {
    case 1:
      return <Trophy className="w-5 h-5 text-yellow-500" />;
    case 2:
      return <Medal className="w-5 h-5 text-gray-400" />;
    case 3:
      return <Medal className="w-5 h-5 text-amber-600" />;
    default:
      return <span className="w-5 h-5 inline-flex items-center justify-center font-bold text-muted-foreground">{rank}</span>;
  }
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
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 5 }}
          >
            <BarChart className="w-5 h-5" />
          </motion.div>
          工具使用排行榜
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="popLayout">
          {rankings?.map((ranking, index) => {
            const tool = tools.find(t => t.id === ranking.toolId);
            if (!tool) return null;

            return (
              <motion.div 
                key={ranking.toolId}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: {
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                  }
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center space-x-4 p-2 rounded-lg hover:bg-muted/50 transition-colors mb-2"
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
                  <p className="text-sm font-medium text-foreground truncate">
                    {tool.title}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    最後使用：{new Date(ranking.lastUsedAt).toLocaleDateString()}
                  </p>
                </motion.div>
                <motion.div
                  layoutId={`badge-${ranking.toolId}`}
                  className="flex-shrink-0"
                >
                  <Badge 
                    variant="secondary" 
                    className="animate-pulse"
                  >
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