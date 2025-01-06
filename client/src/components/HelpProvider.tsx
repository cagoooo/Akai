import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { driver, type Driver } from "driver.js";
import "driver.js/dist/driver.css";

interface HelpContextType {
  showHelp: boolean;
  toggleHelp: () => void;
  startTour: () => void;
}

const HelpContext = createContext<HelpContextType>({
  showHelp: false,
  toggleHelp: () => {},
  startTour: () => {},
});

interface HelpProviderProps {
  children: ReactNode;
}

export function HelpProvider({ children }: HelpProviderProps) {
  const [showHelp, setShowHelp] = useState(false);
  const [driverObj, setDriverObj] = useState<Driver | null>(null);

  useEffect(() => {
    try {
      const driverInstance = driver({
        showProgress: true,
        animate: true,
        allowClose: true,
        smoothScroll: true,
        stagePadding: 4,
        overlayColor: 'rgba(0, 0, 0, 0.4)',
        steps: [
          {
            element: '[data-tour="teacher-intro"]',
            popover: {
              title: '認識阿凱老師',
              description: '在這裡您可以了解阿凱老師的專業背景、教學理念和獲得的成就。點擊個人簡介可以前往了解更多。',
              side: "bottom",
              align: 'start'
            }
          },
          {
            element: '[data-tour="tools-grid"]',
            popover: {
              title: '探索教育工具',
              description: '這裡展示了所有可用的教育工具。每個工具卡片都包含詳細信息，點擊卡片可以查看更多內容並開始使用工具。',
              side: "bottom",
              align: 'start'
            }
          },
          {
            element: '[data-tour="mood-tracker"]',
            popover: {
              title: '心情追蹤',
              description: '記錄您使用工具時的心情和感受，幫助我們優化教學體驗。',
              side: "left",
              align: 'center'
            }
          },
          {
            element: '[data-tour="progress-dashboard"]',
            popover: {
              title: '學習進度分析',
              description: '查看您的學習數據統計和成就進度，了解自己的學習軌跡。',
              side: "left",
              align: 'start'
            }
          },
          {
            element: '[data-tour="achievements"]',
            popover: {
              title: '學習成就',
              description: '完成各種學習任務來獲得成就徽章，追蹤您的學習里程碑。',
              side: "right",
              align: 'start'
            }
          },
          {
            element: '[data-customization="icon-settings"]',
            popover: {
              title: '個人化設定',
              description: '自定義工具圖標和介面風格，打造專屬的學習環境。',
              side: "right",
              align: 'start'
            }
          }
        ]
      });
      setDriverObj(driverInstance);

      // Check if this is the user's first visit
      const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
      if (!hasSeenTutorial) {
        // Delay the tutorial slightly to ensure the page has fully loaded
        const timeoutId = setTimeout(() => {
          driverInstance.drive();
          localStorage.setItem('hasSeenTutorial', 'true');
        }, 1000);

        return () => clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error('Failed to initialize tour guide:', error);
    }
  }, []);

  const toggleHelp = () => setShowHelp(!showHelp);
  const startTour = () => {
    if (driverObj) {
      driverObj.drive();
    }
  };

  return (
    <HelpContext.Provider value={{ showHelp, toggleHelp, startTour }}>
      {children}
    </HelpContext.Provider>
  );
}

export const useHelp = () => useContext(HelpContext);