import { createContext, useContext, useState, ReactNode } from "react";
import { TourProvider } from "@reactour/tour";

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

const steps = [
  {
    selector: '[data-tour="teacher-intro"]',
    content: '認識阿凱老師，一位致力於教育創新的專業教師。',
  },
  {
    selector: '[data-tour="tools-grid"]',
    content: '瀏覽所有可用的教育工具。點擊任何工具卡片以獲取更多信息。',
  },
  {
    selector: '[data-tour="share-button"]',
    content: '使用分享功能與其他教師協作。',
  },
];

function HelpContent({ children }: { children: ReactNode }) {
  const [showHelp, setShowHelp] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const toggleHelp = () => setShowHelp(!showHelp);
  const startTour = () => setIsOpen(true);

  return (
    <HelpContext.Provider value={{ showHelp, toggleHelp, startTour }}>
      {children}
    </HelpContext.Provider>
  );
}

export function HelpProvider({ children }: { children: ReactNode }) {
  return (
    <TourProvider 
      steps={steps} 
      styles={{
        popover: (base) => ({
          ...base,
          '--tw-bg-opacity': '1',
          backgroundColor: 'hsl(var(--background))',
          '--tw-border-opacity': '1',
          borderColor: 'hsl(var(--border))',
          color: 'hsl(var(--foreground))',
          padding: '1rem',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        }),
      }}
    >
      <HelpContent>{children}</HelpContent>
    </TourProvider>
  );
}

export const useHelp = () => useContext(HelpContext);