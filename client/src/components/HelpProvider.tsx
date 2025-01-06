import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { driver } from "driver.js";
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
  const [driverObj, setDriverObj] = useState<any>(null);

  useEffect(() => {
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
            description: '在這裡您可以了解阿凱老師的專業背景、教學理念和獲得的成就。點擊名字可以前往他的個人網頁了解更多。',
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
          element: '[data-tour="customize-bg"]',
          popover: {
            title: '自定義背景',
            description: '您可以根據個人喜好調整頁面背景的漸層效果，創造獨特的視覺體驗。',
            side: "left",
            align: 'center'
          }
        },
        {
          element: '[data-tour="share-button"]',
          popover: {
            title: '分享與協作',
            description: '輕鬆地與其他教師分享工具和資源，建立教育資源共享網絡。',
            side: "left",
            align: 'start'
          }
        },
        {
          element: '[data-customization="icon-settings"]',
          popover: {
            title: '工具自定義',
            description: '您可以自定義每個工具的圖標樣式，包括顏色、大小和特效，打造專屬的視覺風格。',
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
      setTimeout(() => {
        driverInstance.drive();
        localStorage.setItem('hasSeenTutorial', 'true');
      }, 1000);
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