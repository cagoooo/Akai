import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { HelpCircle } from "lucide-react";

export function TourGuide() {
  const createDriver = useCallback(() => {
    return driver({
      showProgress: true,
      animate: true,
      steps: [
        {
          element: '[data-tour="teacher-intro"]',
          popover: {
            title: "歡迎來到教育科技創新專區 👋",
            description: "這裡是阿凱老師的教育科技創新天地！讓我們一起來探索這個充滿創意的空間吧！",
            nextBtnText: "下一步",
          }
        },
        {
          element: '[data-tour="tools-grid"]',
          popover: {
            title: "教育工具集 🛠️",
            description: "這裡展示了各種創新的教育工具，每個工具都有其獨特的功能和特色。點擊工具卡片可以直接體驗！",
            nextBtnText: "下一步",
            prevBtnText: "上一步"
          }
        },
        {
          element: '[data-tour="tool-rankings"]',
          popover: {
            title: "工具排行榜 🏆",
            description: "查看最受歡迎的教育工具排名，了解其他教育者正在使用的熱門工具！",
            nextBtnText: "下一步",
            prevBtnText: "上一步"
          }
        },
        {
          element: '[data-tour="emoji-storytelling"]',
          popover: {
            title: "表情符號故事創作 📖",
            description: "運用有趣的表情符號來創作故事，讓教學更生動有趣！",
            nextBtnText: "下一步",
            prevBtnText: "上一步"
          }
        },
        {
          element: '[data-tour="mood-tracker"]',
          popover: {
            title: "心情追蹤器 😊",
            description: "記錄和分析使用工具時的心情變化，協助優化學習體驗。",
            nextBtnText: "下一步",
            prevBtnText: "上一步"
          }
        },
        {
          element: '[data-tour="progress-dashboard"]',
          popover: {
            title: "學習進度儀表板 📊",
            description: "追蹤您的學習進度和成就，一目了然地掌握學習歷程。",
            nextBtnText: "下一步",
            prevBtnText: "上一步"
          }
        },
        {
          element: '[data-tour="achievements"]',
          popover: {
            title: "成就系統 🌟",
            description: "解鎖各種學習成就，讓學習過程更有成就感和動力！",
            nextBtnText: "下一步",
            prevBtnText: "上一步"
          }
        },
        {
          element: '[data-tour="diagnostics"]',
          popover: {
            title: "系統診斷面板 🔍",
            description: "查看系統運行狀況和使用統計，確保最佳使用體驗。",
            nextBtnText: "完成",
            prevBtnText: "上一步"
          }
        }
      ],
      onReset: () => {
        console.log("教學導覽完成！");
      },
    });
  }, []);

  const startTour = useCallback(() => {
    const driverObj = createDriver();
    driverObj.drive();
  }, [createDriver]);

  return (
    <Button 
      onClick={startTour}
      variant="outline"
      className="gap-2"
      aria-label="開始網站導覽"
    >
      <HelpCircle className="h-4 w-4" />
      導覽教學
    </Button>
  );
}