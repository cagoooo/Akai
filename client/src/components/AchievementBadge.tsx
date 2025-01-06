import { type Achievement } from "@/lib/types";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AchievementBadgeProps {
  achievement: Achievement;
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
  const Icon = Icons[achievement.icon as keyof typeof Icons];

  const badgeVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    hover: { scale: 1.1, transition: { duration: 0.2 } },
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className={cn(
              "relative flex items-center justify-center",
              "w-16 h-16 rounded-full",
              earned
                ? "bg-gradient-to-br from-primary to-primary/60"
                : "bg-muted",
              className
            )}
            initial="initial"
            animate="animate"
            whileHover="hover"
            variants={badgeVariants}
          >
            {Icon && (
              <Icon
                className={cn(
                  "w-8 h-8",
                  earned ? "text-primary-foreground" : "text-muted-foreground/60"
                )}
              />
            )}
            {showProgress && !earned && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs font-medium text-muted-foreground">
                {achievement.progress}%
              </div>
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="top" align="center">
          <div className="text-center">
            <h3 className="font-semibold">{achievement.name}</h3>
            <p className="text-sm text-muted-foreground">
              {achievement.description}
            </p>
            {showProgress && !earned && (
              <p className="text-xs mt-1">
                進度: {achievement.progress}%
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
