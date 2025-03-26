import { createContext, useContext, ReactNode, useState, useRef, useCallback } from 'react';
import { TourGuide } from './TourGuide';

interface TourContextType {
  startTour: () => void;
  resetTour: () => void;
  isActive: boolean;
  hasCompletedTour: boolean;
}

const TourContext = createContext<TourContextType>({
  startTour: () => {},
  resetTour: () => {},
  isActive: false,
  hasCompletedTour: false
});

export const useTour = () => useContext(TourContext);

interface TourProviderProps {
  children: ReactNode;
}

export function TourProvider({ children }: TourProviderProps) {
  const [isActive, setIsActive] = useState(false);
  const [hasCompletedTour, setHasCompletedTour] = useState(() => {
    try {
      return localStorage.getItem("hasCompletedSiteTour") === "true";
    } catch (e) {
      return false;
    }
  });
  
  // 創建一個普通的參考，而不是指定類型
  const tourGuideRef = useRef<any>(null);

  // 開始導覽
  const startTour = useCallback(() => {
    console.log("Starting tour from provider");
    setIsActive(true);
    // 不使用ref方法，直接訪問Tour Guide實例方法
    const tourGuideElement = document.querySelector('.tour-guide-container');
    if (tourGuideElement) {
      // 發布自定義事件
      const startEvent = new CustomEvent('start-tour');
      tourGuideElement.dispatchEvent(startEvent);
    } else {
      console.error("Tour guide element not found");
    }
  }, []);

  // 重置導覽狀態（用於測試或允許用戶重新體驗）
  const resetTour = useCallback(() => {
    try {
      localStorage.setItem("hasCompletedSiteTour", "false");
      setHasCompletedTour(false);
      if (tourGuideRef.current) {
        tourGuideRef.current.resetTour();
      }
    } catch (e) {
      console.error("無法重置導覽狀態", e);
    }
  }, []);

  // 當導覽完成時的回調
  const handleTourComplete = useCallback(() => {
    setIsActive(false);
    setHasCompletedTour(true);
  }, []);

  return (
    <TourContext.Provider value={{ 
      startTour, 
      resetTour, 
      isActive, 
      hasCompletedTour 
    }}>
      {children}
      <TourGuide 
        ref={tourGuideRef} 
        onComplete={handleTourComplete}
      />
    </TourContext.Provider>
  );
}