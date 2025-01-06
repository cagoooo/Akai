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
      steps: [
        {
          element: '[data-tour="teacher-intro"]',
          popover: {
            title: '教師介紹',
            description: '認識阿凱老師，一位致力於教育創新的專業教師。',
            side: "bottom",
            align: 'start'
          }
        },
        {
          element: '[data-tour="tools-grid"]',
          popover: {
            title: '教育工具',
            description: '瀏覽所有可用的教育工具。點擊任何工具卡片以獲取更多信息。',
            side: "bottom",
            align: 'start'
          }
        },
        {
          element: '[data-tour="share-button"]',
          popover: {
            title: '分享功能',
            description: '使用分享功能與其他教師協作。',
            side: "left",
            align: 'start'
          }
        }
      ]
    });
    setDriverObj(driverInstance);
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