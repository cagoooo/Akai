import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useEffect, useCallback, useState } from "react";
import { Button } from "./ui/button";
import { Trophy, HelpCircle, Lightbulb, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { soundManager } from "@/lib/soundManager";

// 自定義CSS，提升教學界面的視覺效果
import "./tutorial.css";

export function RankingTutorial() {
  const [hasSeenTutorial, setHasSeenTutorial] = useState(() => {
    try {
      return localStorage.getItem("hasSeenRankingTutorial") === "true";
    } catch (e) {
      return false;
    }
  });

  const createDriver = useCallback(() => {
    return driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      stagePadding: 8,
      smoothScroll: true,
      popoverClass: "ranking-tutorial-popover",
      overlayColor: "rgba(0, 0, 0, 0.6)",
      nextBtnText: "下一步",
      prevBtnText: "上一步",
      doneBtnText: "完成",
      onHighlightStarted: (element) => {
        try {
          // 播放提示音效
          soundManager.playSound("notification");
        } catch (e) {
          console.error("無法播放音效:", e);
        }
      },
      onDeselected: (element) => {
        // 移除任何高亮特效
      },
      onDestroyed: () => {
        // 完成教學後記錄到本地存儲
        try {
          localStorage.setItem("hasSeenRankingTutorial", "true");
          setHasSeenTutorial(true);
        } catch (e) {
          console.error("無法儲存教學狀態:", e);
        }
      },
      steps: [
        {
          element: "#rankings-title",
          popover: {
            title: "歡迎來到工具排行榜 🏆",
            description: "這裡展示了最受歡迎的教育工具！讓我們一起來看看有哪些特色功能吧！✨",
            nextBtnText: "下一步",
          }
        },
        {
          element: "#top-tool",
          popover: {
            title: "冠軍工具 👑",
            description: "第一名的工具會有特殊的金色光暈效果和動態呼吸動畫，代表它是最受歡迎的教學利器！",
            nextBtnText: "下一步",
            prevBtnText: "上一步",
          }
        },
        {
          element: "#ranking-changes",
          popover: {
            title: "排名變化指示器 📈",
            description: "即時觀察工具使用趨勢！上升時會顯示綠色向上箭頭，下降時會顯示紅色向下箭頭，讓排名變動一目了然！",
            nextBtnText: "下一步",
            prevBtnText: "上一步",
          }
        },
        {
          element: "#usage-stats",
          popover: {
            title: "使用統計資訊 📊",
            description: "這裡顯示了工具的使用次數和最近使用時間，幫助您了解各工具的受歡迎程度和活躍度！",
            nextBtnText: "下一步",
            prevBtnText: "上一步",
          }
        },
        {
          element: "#interaction-area",
          popover: {
            title: "互動區域 🎯",
            description: "點擊工具卡片可以在新視窗中直接開啟工具！每次使用都會影響排名，努力讓您喜愛的工具登上榜首吧！",
            prevBtnText: "上一步",
            doneBtnText: "完成",
          }
        }
      ],
    });
  }, []);

  useEffect(() => {
    // 自動顯示教學（僅首次訪問）
    if (!hasSeenTutorial) {
      const timer = setTimeout(() => {
        startTutorial();
      }, 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      const driverObj = createDriver();
      driverObj.destroy();
    };
  }, [createDriver, hasSeenTutorial]);

  const startTutorial = useCallback(() => {
    console.log("Starting ranking tutorial");
    const driverObj = createDriver();
    driverObj.drive();
  }, [createDriver]);

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button 
        onClick={startTutorial}
        variant={hasSeenTutorial ? "default" : "secondary"}
        size="sm"
        className={cn(
          "gap-2 font-medium relative overflow-hidden border-2", 
          hasSeenTutorial 
            ? "bg-primary text-white hover:bg-primary/90 border-primary/80" 
            : "bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-amber-600 hover:from-yellow-600 hover:to-amber-600"
        )}
        id="ranking-tutorial-btn"
      >
        {!hasSeenTutorial && (
          <motion.span 
            className="absolute inset-0 bg-white"
            animate={{ 
              opacity: [0, 0.2, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 1.5
            }}
          />
        )}
        {hasSeenTutorial ? (
          <HelpCircle className="w-4 h-4 text-white" />
        ) : (
          <motion.div
            animate={{ rotate: [0, 15, 0, -15, 0] }}
            transition={{ repeat: Infinity, duration: 2, repeatDelay: 0.5 }}
          >
            <Lightbulb className="w-4 h-4 text-white fill-yellow-200" />
          </motion.div>
        )}
        <span className="font-bold">{hasSeenTutorial ? "排行榜教學" : "查看功能介紹"}</span>
        {!hasSeenTutorial && (
          <Sparkles className="w-3 h-3 text-yellow-200" />
        )}
      </Button>
    </motion.div>
  );
}