import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AchievementBadge } from "./AchievementBadge";
import { useAchievements } from "@/hooks/useAchievements";
import { m as motion } from 'framer-motion';
import { Trophy, Star, Flame } from "lucide-react";

export function AchievementsList() {
  const { achievements, totalEarned, totalAchievements, totalPoints } = useAchievements();

  // 分離已解鎖與未解鎖成就
  const earnedAchievements = achievements.filter(a => a.earned);
  const lockedAchievements = achievements.filter(a => !a.earned);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span>學習成就</span>
          </div>
          <div className="flex items-center gap-3 text-sm font-normal">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-muted-foreground">
                {totalEarned}/{totalAchievements}
              </span>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 rounded-full">
              <Flame className="w-4 h-4 text-amber-500" />
              <span className="font-semibold text-amber-600">
                {totalPoints} 點
              </span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <ScrollArea className="h-[320px] pr-4">
          {/* 已解鎖成就 */}
          {earnedAchievements.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1">
                <span className="text-green-500">✓</span> 已解鎖
              </h4>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {earnedAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <AchievementBadge
                      achievement={achievement}
                      showProgress={false}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* 未解鎖成就 */}
          {lockedAchievements.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1">
                <span className="text-muted-foreground">🔒</span> 待解鎖
              </h4>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {lockedAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <AchievementBadge
                      achievement={achievement}
                      showProgress={true}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* 全部解鎖時的慶祝訊息 */}
          {earnedAchievements.length === totalAchievements && totalAchievements > 0 && (
            <motion.div
              className="mt-4 p-4 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-lg text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <span className="text-2xl">🎉</span>
              <p className="text-sm font-medium mt-1">
                恭喜！您已解鎖所有成就！
              </p>
            </motion.div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}