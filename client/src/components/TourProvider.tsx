import { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { TourGuide } from './TourGuide';

interface TourContextType {
  startTour: () => void;
  isActive: boolean;
}

const TourContext = createContext<TourContextType>({
  startTour: () => {},
  isActive: false,
});

export const useTour = () => useContext(TourContext);

interface TourProviderProps {
  children: ReactNode;
}

export function TourProvider({ children }: TourProviderProps) {
  const [isActive, setIsActive] = useState(false);

  const startTour = useCallback(() => {
    setIsActive(true);
  }, []);

  return (
    <TourContext.Provider value={{ startTour, isActive }}>
      {children}
    </TourContext.Provider>
  );
}
