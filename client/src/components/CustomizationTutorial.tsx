import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

interface CustomizationTutorialContextType {
  startTutorial: () => void;
  hasSeenTutorial: boolean;
  setHasSeenTutorial: (seen: boolean) => void;
}

const CustomizationTutorialContext = createContext<CustomizationTutorialContextType>({
  startTutorial: () => {},
  hasSeenTutorial: false,
  setHasSeenTutorial: () => {},
});

interface CustomizationTutorialProviderProps {
  children: ReactNode;
}

export function CustomizationTutorialProvider({ children }: CustomizationTutorialProviderProps) {
  const [hasSeenTutorial, setHasSeenTutorial] = useState(() => {
    const seen = localStorage.getItem("hasSeenCustomizationTutorial");
    return seen === "true";
  });
  const [driverObj, setDriverObj] = useState<any>(null);

  useEffect(() => {
    const driverInstance = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      smoothScroll: true,
      steps: [
        {
          element: '[data-customization="size-control"]',
          popover: {
            title: '調整圖標大小',
            description: '使用滑桿來放大或縮小圖標和裝飾元素的尺寸。',
            side: "bottom",
            align: 'start'
          }
        },
        {
          element: '[data-customization="primary-color"]',
          popover: {
            title: '主要顏色',
            description: '選擇圖標的主要顏色，這將影響圖標的主體部分。',
            side: "bottom",
            align: 'start'
          }
        },
        {
          element: '[data-customization="secondary-color"]',
          popover: {
            title: '次要顏色',
            description: '選擇圖標的次要顏色，這將創建漸層效果。',
            side: "bottom",
            align: 'start'
          }
        },
        {
          element: '[data-customization="opacity-control"]',
          popover: {
            title: '背景不透明度',
            description: '調整圖標背景的透明度，創建更細緻的視覺效果。',
            side: "top",
            align: 'start'
          }
        },
        {
          element: '[data-customization="preview"]',
          popover: {
            title: '即時預覽',
            description: '在這裡可以看到所有調整的即時效果。',
            side: "bottom",
            align: 'center'
          }
        }
      ]
    });
    setDriverObj(driverInstance);
  }, []);

  const startTutorial = () => {
    if (driverObj) {
      driverObj.drive();
      setHasSeenTutorial(true);
      localStorage.setItem("hasSeenCustomizationTutorial", "true");
    }
  };

  return (
    <CustomizationTutorialContext.Provider 
      value={{ 
        startTutorial, 
        hasSeenTutorial, 
        setHasSeenTutorial 
      }}
    >
      {children}
    </CustomizationTutorialContext.Provider>
  );
}

export const useCustomizationTutorial = () => useContext(CustomizationTutorialContext);
