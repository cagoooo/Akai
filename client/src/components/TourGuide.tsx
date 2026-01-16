import React, { useState, useEffect } from 'react';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import "./tour-guide.css"; // 導入我們自定義的樣式
import { soundManager } from "@/lib/soundManager";
import { motion } from "framer-motion";
import { Info, Lightbulb, HelpCircle } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

// 建立全局事件發射器，用於外部觸發導覽開始
export const tourEvents = {
  startTour: () => {
    window.dispatchEvent(new CustomEvent('start-site-tour'));
  },
  resetTour: () => {
    window.dispatchEvent(new CustomEvent('reset-site-tour'));
  }
};

interface TourGuideProps {
  onComplete?: () => void;
}

export function TourGuide({ onComplete }: TourGuideProps) {
  const [hasCompletedTour, setHasCompletedTour] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [driverObj, setDriverObj] = useState<any>(null);
  const { toast } = useToast();
  const localStorageKey = "hasCompletedSiteTour";

  // 檢查是否已完成導覽
  const getHasCompletedTour = () => {
    try {
      return localStorage.getItem(localStorageKey) === "true";
    } catch (e) {
      return false;
    }
  };

  // 設置導覽完成狀態
  const setTourCompleted = (completed: boolean) => {
    try {
      localStorage.setItem(localStorageKey, completed ? "true" : "false");
      setHasCompletedTour(completed);
    } catch (e) {
      console.error("無法儲存導覽完成狀態:", e);
    }
  };

  // 播放音效
  const playSound = () => {
    try {
      soundManager.playSound("notification");
    } catch (e) {
      console.error("播放音效失敗:", e);
    }
  };

  // 初始化導覽驅動程序
  const initializeDriver = () => {
    const tourDriver = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      nextBtnText: "下一步",
      prevBtnText: "上一步",
      doneBtnText: "完成導覽",
      overlayColor: "rgba(0, 0, 0, 0.75)",
      stagePadding: 10,
      popoverClass: "site-tour-popover",
      disableActiveInteraction: false, // 允許點擊高亮元素
      onHighlightStarted: (element) => {
        playSound();
        if (element) {
          // 平滑滾動到元素位置，並留出上方空間
          const rect = element.getBoundingClientRect();
          const offset = rect.top + window.scrollY - 120;
          window.scrollTo({
            top: offset,
            behavior: 'smooth'
          });

          // 添加高亮動畫效果
          element.classList.add('highlight-pulse');
        }
      },
      onDeselected: (element) => {
        if (element) {
          element.classList.remove('highlight-pulse');
        }
      },
      onDestroyed: async () => {
        // 記錄完成狀態
        setTourCompleted(true);

        // 顯示成就通知（純本地處理，不需要 API）
        toast({
          title: "🎉 網站導覽完成！",
          description: "感謝您完成網站導覽，已解鎖「探索者」成就！",
          duration: 5000,
        });

        if (onComplete) {
          onComplete();
        }
      },
      steps: [
        {
          element: '[data-tour="teacher-intro"]',
          popover: {
            title: "教師介紹 👨‍🏫",
            description: "這裡介紹阿凱老師的個人資訊和專業背景，幫助您更深入了解老師的教育理念和專業優勢。點擊頭像可查看詳細介紹。",
            side: "bottom",
            align: 'start',
          }
        },
        {
          element: '[data-tour="tools-grid"]',
          popover: {
            title: "教育工具集 🛠️",
            description: "這是我們精心設計的教育工具集合，涵蓋溝通、閱讀、語言等多種類型。每個工具卡片上都有詳細說明和使用方式。點擊任一卡片即可開始使用！",
            side: "left",
            align: 'start',
          }
        },
        {
          element: '[data-tour="tool-rankings"]',
          popover: {
            title: "工具排行榜 🏆",
            description: "即時顯示最受歡迎的教育工具排名！第一名的工具會有特殊標記，您可以看到每個工具的使用次數和排名變化。這裡還有專門的排行榜教學功能。",
            side: "left",
            align: 'start',
          }
        },
        {
          element: '[data-tour="theme-toggle"]',
          popover: {
            title: "主題切換 🎨",
            description: "點擊這裡可以在淺色/深色主題之間切換，讓您在不同光線環境下都能舒適使用平台。系統也會自動適應您設備的顯示模式偏好。",
            side: "bottom",
            align: 'start',
          }
        },
        {
          popover: {
            title: "🎉 恭喜完成導覽！",
            description: "感謝您完成網站導覽！現在您已經了解了平台的主要功能，可以開始探索和使用各種教育工具了。如果之後需要再次查看導覽，可以點擊「網站導覽」按鈕。祝您使用愉快！",
            doneBtnText: "開始使用",
          }
        }
      ],
    });

    setDriverObj(tourDriver);
    return tourDriver;
  };

  // 開始導覽
  const startTour = () => {
    try {
      let tourInstance = driverObj;
      if (!tourInstance) {
        tourInstance = initializeDriver();
      }
      tourInstance.drive();
      setIsVisible(false);
    } catch (error) {
      console.error("啟動導覽失敗:", error);
      toast({
        title: "導覽啟動失敗",
        description: "無法啟動網站導覽，請稍後再試",
        variant: "destructive"
      });
    }
  };

  // 關閉導覽提示
  const dismissTour = () => {
    setIsVisible(false);
  };

  // 重置導覽狀態
  const resetTour = () => {
    setTourCompleted(false);
    setIsVisible(true);
  };

  // 元件掛載時
  useEffect(() => {
    // 檢查導覽完成狀態
    const tourCompleted = getHasCompletedTour();
    setHasCompletedTour(tourCompleted);

    // 初始化驅動程序
    const driver = initializeDriver();

    // 初次載入且尚未完成導覽時，延遲顯示提示
    if (!tourCompleted) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }

    // 監聽全局事件以啟動導覽
    const handleStartTour = () => {
      startTour();
    };

    // 監聽全局事件以重置導覽
    const handleResetTour = () => {
      resetTour();
    };

    window.addEventListener('start-site-tour', handleStartTour);
    window.addEventListener('reset-site-tour', handleResetTour);

    // 清理函數
    return () => {
      if (driver) {
        driver.destroy();
      }
      window.removeEventListener('start-site-tour', handleStartTour);
      window.removeEventListener('reset-site-tour', handleResetTour);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="tour-guide-container">
      {/* 導覽提示彈窗 */}
      {isVisible && !hasCompletedTour && (
        <motion.div
          className="tour-prompt"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000,
            backgroundColor: 'white',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
            width: '280px',
            border: '2px solid #0891b2',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '12px',
            gap: '8px',
            borderBottom: '1px solid rgba(8, 145, 178, 0.2)',
            paddingBottom: '8px'
          }}>
            <Info size={24} color="#0891b2" />
            <h3 style={{
              margin: 0,
              color: '#0891b2',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              歡迎使用教育平台！
            </h3>
          </div>
          <p style={{
            margin: '0 0 16px 0',
            fontSize: '14px',
            color: '#333',
            lineHeight: 1.5
          }}>
            想要了解平台的主要功能嗎？跟隨我們的導覽，快速掌握所有重要特性！
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              onClick={startTour}
              className="bg-cyan-600 hover:bg-cyan-700 gap-2"
            >
              <Lightbulb size={16} />
              開始導覽
            </Button>
            <Button
              variant="outline"
              onClick={dismissTour}
              className="border-cyan-600 text-cyan-600 hover:bg-cyan-50"
            >
              稍後再說
            </Button>
          </div>
        </motion.div>
      )}

      {/* 固定位置的導覽按鈕 */}
      {hasCompletedTour && (
        <motion.div
          className="fixed-tour-button"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            zIndex: 50
          }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={startTour}
              variant="default"
              size="sm"
              className="bg-cyan-600 hover:bg-cyan-700 gap-2 shadow-lg"
            >
              <HelpCircle size={16} />
              <span>網站導覽</span>
            </Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}