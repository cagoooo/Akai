import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// 支援新的成就系統格式
interface AchievementBadgeProps {
  achievement: {
    id: string;
    name: string;
    description: string;
    icon: string;        // Emoji 圖示
    points: number;
    progress?: number;
    earned?: boolean;
    justUnlocked?: boolean;
  };
  earned?: boolean;
  showProgress?: boolean;
  className?: string;
}

export function AchievementBadge({
  achievement,
  earned = false,
  showProgress = false,
  className,
}: AchievementBadgeProps) {
  const isEarned = achievement.earned ?? earned;
  const justUnlocked = achievement.justUnlocked ?? false;

  // 基本動畫變體
  const badgeVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    hover: { scale: 1.1, transition: { duration: 0.2 } },
  };

  // 解鎖動畫變體
  const unlockVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: {
      scale: [0, 1.3, 1],
      rotate: [-180, 0],
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  // 金色光環動畫
  const glowAnimation = justUnlocked
    ? {
      boxShadow: [
        "0 0 0 0 rgba(255, 215, 0, 0)",
        "0 0 30px 10px rgba(255, 215, 0, 0.6)",
        "0 0 20px 5px rgba(255, 215, 0, 0.3)",
        "0 0 10px 2px rgba(255, 215, 0, 0.1)",
      ],
      transition: {
        duration: 1.5,
        repeat: 2,
        ease: "easeInOut",
      },
    }
    : {};

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className={cn(
              "relative flex items-center justify-center cursor-pointer",
              "w-16 h-16 rounded-full",
              isEarned
                ? "bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500"
                : "bg-muted/50 border-2 border-dashed border-muted-foreground/30",
              justUnlocked && "ring-4 ring-yellow-400/50",
              className
            )}
            initial={justUnlocked ? "initial" : "initial"}
            animate={justUnlocked ? { ...unlockVariants.animate, ...glowAnimation } : "animate"}
            whileHover="hover"
            variants={justUnlocked ? unlockVariants : badgeVariants}
          >
            {/* Emoji 圖示 */}
            <span
              className={cn(
                "text-3xl select-none",
                !isEarned && "grayscale opacity-40"
              )}
              role="img"
              aria-label={achievement.name}
            >
              {achievement.icon}
            </span>

            {/* 進度指示器 */}
            {showProgress && !isEarned && achievement.progress !== undefined && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                <span className="text-xs font-medium text-muted-foreground bg-background px-1.5 py-0.5 rounded-full border">
                  {achievement.progress}%
                </span>
              </div>
            )}

            {/* 已解鎖標記 */}
            {isEarned && (
              <motion.div
                className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                <span className="text-white text-xs">✓</span>
              </motion.div>
            )}

            {/* 星星粒子效果 (解鎖時) */}
            {justUnlocked && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.span
                    key={i}
                    className="absolute text-yellow-400 text-sm"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0.5],
                      x: [0, (Math.random() - 0.5) * 60],
                      y: [0, (Math.random() - 0.5) * 60],
                    }}
                    transition={{
                      duration: 1,
                      delay: 0.2 + i * 0.1,
                      ease: "easeOut",
                    }}
                  >
                    ✨
                  </motion.span>
                ))}
              </>
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="top" align="center" className="max-w-[200px]">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-lg">{achievement.icon}</span>
              <h3 className="font-semibold">{achievement.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {achievement.description}
            </p>
            {achievement.points > 0 && (
              <p className="text-xs mt-1 text-amber-500 font-medium">
                +{achievement.points} 點
              </p>
            )}
            {showProgress && !isEarned && achievement.progress !== undefined && (
              <div className="mt-2">
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${achievement.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-xs mt-1 text-muted-foreground">
                  進度: {achievement.progress}%
                </p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
