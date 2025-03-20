import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToolTracking } from "@/hooks/useToolTracking";
import { useToast } from "@/components/ui/use-toast";
import { tools } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";

interface Ranking {
  toolId: number;
  totalClicks: number;
  lastUsedAt: string;
}

export function ToolRankings() {
  const [isMuted, setIsMuted] = useState(false);
  const queryClient = useQueryClient();
  const { trackToolUsage } = useToolTracking();
  const { toast } = useToast();

  const { data: rankings = [], isLoading, error } = useQuery<Ranking[]>({
    queryKey: ['/api/tools/rankings'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/tools/rankings');
        if (!res.ok) return tools.map(tool => ({
          toolId: tool.id,
          totalClicks: 0,
          lastUsedAt: new Date().toISOString()
        }));
        return res.json();
      } catch (error) {
        console.error('排行榜數據獲取失敗:', error);
        return tools.map(tool => ({
          toolId: tool.id,
          totalClicks: 0,
          lastUsedAt: new Date().toISOString()
        }));
      }
    },
    retry: false,
    refetchOnWindowFocus: false
  });

  const handleItemClick = async (tool: typeof tools[number]) => {
    try {
      const result = await trackToolUsage(tool.id);

      if (result.totalClicks) {
        const updatedRankings = rankings.map((ranking: Ranking) =>
          ranking.toolId === tool.id
            ? { ...ranking, totalClicks: result.totalClicks }
            : ranking
        );
        queryClient.setQueryData(['/api/tools/rankings'], updatedRankings);
      }

      window.open(tool.url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('工具使用追蹤失敗:', error);
      window.open(tool.url, '_blank', 'noopener,noreferrer');
    }
  };

  if (isLoading) {
    return (
      <Card>
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
          <Button variant="ghost" size="icon" onClick={() => setIsMuted(!isMuted)}>
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="sync">
          {(rankings.length > 0 ? rankings : tools).map((item, index) => {
            const tool = tools.find(t => t.id === (item as Ranking).toolId) || item;
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
                    {((item as Ranking).totalClicks || 0)} 次使用
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