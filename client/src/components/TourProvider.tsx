import { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { TourGuide, tourEvents } from './TourGuide';

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

  // 開始導覽
  const startTour = useCallback(() => {
    console.log("Starting tour from provider");
    setIsActive(true);
    // 使用全局事件機制觸發導覽開始
    tourEvents.startTour();
  }, []);

  // 重置導覽狀態（用於測試或允許用戶重新體驗）
  const resetTour = useCallback(() => {
    try {
      setHasCompletedTour(false);
      // 使用全局事件機制觸發導覽重置
      tourEvents.resetTour();
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
      <TourGuide onComplete={handleTourComplete} />
    </TourContext.Provider>
  );
}