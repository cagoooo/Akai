import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Trophy } from "lucide-react";

export function RankingTutorial() {
  const createDriver = useCallback(() => {
    return driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      stagePadding: 5,
      popoverClass: "ranking-tutorial-popover",
      nextBtnText: "下一步",
      prevBtnText: "上一步",
      doneBtnText: "完成",
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
            description: "第一名的工具會有特殊的金色光暈效果和動態表情符號，代表它是最受歡迎的教學利器！🌟",
            nextBtnText: "下一步",
            prevBtnText: "上一步",
          }
        },
        {
          element: "#ranking-changes",
          popover: {
            title: "排名變化提示 📈",
            description: "即時觀察工具的使用趨勢！上升時會顯示 🔥，下降時會顯示 📉，讓排名變化一目了然！",
            nextBtnText: "下一步",
            prevBtnText: "上一步",
          }
        },
        {
          element: "#usage-stats",
          popover: {
            title: "使用統計資訊 📊",
            description: "這裡顯示了工具的使用次數和最近使用時間 ⏰，幫助您了解各工具的受歡迎程度！",
            nextBtnText: "下一步",
            prevBtnText: "上一步",
          }
        },
        {
          element: "#interaction-area",
          popover: {
            title: "互動區域 🎯",
            description: "點擊工具卡片可以直接前往使用！每次使用都會影響排名，努力讓您的最愛登上榜首吧！ ⭐",
            prevBtnText: "上一步",
            doneBtnText: "完成",
          }
        }
      ],
    });
  }, []);

  useEffect(() => {
    return () => {
      const driverObj = createDriver();
      driverObj.destroy();
    };
  }, [createDriver]);

  const startTutorial = useCallback(() => {
    console.log("Starting ranking tutorial");
    const driverObj = createDriver();
    driverObj.drive();
  }, [createDriver]);

  return (
    <Button 
      onClick={startTutorial}
      variant="outline"
      size="sm"
      className="gap-2 w-full"
      id="ranking-tutorial-btn"
    >
      <Trophy className="w-4 h-4" />
      排行榜功能教學
    </Button>
  );
}