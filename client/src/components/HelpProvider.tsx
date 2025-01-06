import { createContext, useContext, useState, type ReactNode } from "react";
import { Tour, type Step } from "@reactour/tour";

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

const steps: Step[] = [
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

interface HelpProviderProps {
  children: ReactNode;
}

export function HelpProvider({ children }: HelpProviderProps) {
  const [showHelp, setShowHelp] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);

  const toggleHelp = () => setShowHelp(!showHelp);
  const startTour = () => setIsTourOpen(true);

  return (
    <>
      <Tour
        steps={steps}
        isOpen={isTourOpen}
        onRequestClose={() => setIsTourOpen(false)}
        accentColor="hsl(var(--primary))"
        rounded={8}
        showNavigation={false}
        showBadge={false}
        showButtons={false}
        className="shadow-lg border border-border bg-background text-foreground"
      />
      <HelpContext.Provider value={{ showHelp, toggleHelp, startTour }}>
        {children}
      </HelpContext.Provider>
    </>
  );
}

export const useHelp = () => useContext(HelpContext);