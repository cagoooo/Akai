import { createContext, useContext, ReactNode, useState, useRef } from 'react';
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
  const tourGuideRef = useRef<TourGuide>(null);

  const startTour = () => {
    console.log("Starting tour from provider");
    setIsActive(true);
    if (tourGuideRef.current) {
      tourGuideRef.current.startTour();
    } else {
      console.error("Tour guide reference not found");
    }
  };

  return (
    <TourContext.Provider value={{ startTour, isActive }}>
      {children}
      <TourGuide ref={tourGuideRef} />
    </TourContext.Provider>
  );
}