import React from 'react';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import "./tour-guide.css"; // 導入我們自定義的樣式
import { soundManager } from "@/lib/soundManager";
import { motion } from "framer-motion";
import { Trophy, Info, Lightbulb, HelpCircle, Sparkles } from "lucide-react";
import { Button } from "./ui/button";

interface TourGuideProps {
  onComplete?: () => void;
}

interface TourGuideState {
  hasCompletedTour: boolean;
  isVisible: boolean;
}

export class TourGuide extends React.Component<TourGuideProps, TourGuideState> {
  private driverObj: any = null;
  private notificationSound: HTMLAudioElement | null = null;
  private readonly localStorageKey = "hasCompletedSiteTour";

  constructor(props: TourGuideProps) {
    super(props);
    this.state = {
      hasCompletedTour: this.getHasCompletedTour(),
      isVisible: false
    };
    this.initializeDriver();
    this.initializeAudio();
  }

  private getHasCompletedTour(): boolean {
    try {
      return localStorage.getItem(this.localStorageKey) === "true";
    } catch (e) {
      return false;
    }
  }

  private setHasCompletedTour(completed: boolean): void {
    try {
      localStorage.setItem(this.localStorageKey, completed ? "true" : "false");
      this.setState({ hasCompletedTour: completed });
    } catch (e) {
      console.error("無法儲存導覽完成狀態:", e);
    }
  }

  private initializeAudio() {
    try {
      this.notificationSound = new Audio("/sounds/notification.mp3");
    } catch (e) {
      console.error("無法初始化音效:", e);
    }
  }

  private playSound() {
    try {
      soundManager.playSound("notification");
    } catch (e) {
      if (this.notificationSound) {
        this.notificationSound.play().catch(err => console.error("播放音效失敗:", err));
      }
    }
  }

  private initializeDriver() {
    this.driverObj = driver({
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
        this.playSound();
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
        console.log("Site tour completed");
        // 記錄完成狀態
        this.setHasCompletedTour(true);
        
        try {
          const response = await fetch('/api/tour/complete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          const data = await response.json();

          // 顯示成就通知
          if (window.toast) {
            window.toast({
              title: "🎉 網站導覽完成！",
              description: data.message || "感謝您完成網站導覽，已解鎖「探索者」成就！",
              duration: 5000,
            });
          }
          
          if (this.props.onComplete) {
            this.props.onComplete();
          }
        } catch (error) {
          console.error("記錄導覽完成時發生錯誤:", error);
          // 即使API請求失敗，也應該更新本地狀態
          this.setHasCompletedTour(true);
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
          element: '[data-tour="emoji-storytelling"]',
          popover: {
            title: "表情符號故事創作 📖",
            description: "這是一個創新的表情符號故事創作工具！您可以輕鬆添加各種表情符號並編寫故事文字，激發學生的創造力和表達能力。完成後還可以分享您的作品！",
            side: "left",
            align: 'start',
          }
        },
        {
          element: '[data-tour="mood-tracker"]',
          popover: {
            title: "心情追蹤器 😊",
            description: "使用這個工具記錄和分析各種活動時的心情變化。選擇符合當前感受的表情，並添加簡短描述。系統會自動生成心情趨勢分析，幫助優化學習體驗。",
            side: "left",
            align: 'start',
          }
        },
        {
          element: '[data-tour="progress-dashboard"]',
          popover: {
            title: "學習進度儀表板 📊",
            description: "這個儀表板使用視覺化圖表呈現您的學習進度和成效。您可以看到工具使用頻率、心情變化趨勢，以及已完成的成就比例，全方位掌握學習情況。",
            side: "left",
            align: 'start',
          }
        },
        {
          element: '[data-tour="achievements"]',
          popover: {
            title: "成就系統 🌟",
            description: "完成特定目標即可解鎖成就徽章！成就分為工具使用、學習進度、社交互動和創新應用四大類。每解鎖一個成就，您都會收到通知並獲得相應徽章。",
            side: "left",
            align: 'start',
          }
        },
        {
          element: '[data-tour="diagnostics"]',
          popover: {
            title: "系統診斷面板 🔍",
            description: "這個面板用於監控系統運行狀態和使用數據，包括錯誤日誌、系統指標和性能分析。管理員可以通過這裡快速診斷並解決潛在問題。",
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
            description: "感謝您完成網站導覽！現在您已經了解了平台的主要功能，可以開始探索和使用各種教育工具了。如果之後需要再次查看導覽，可以點擊「重新導覽」按鈕。祝您使用愉快！",
            doneBtnText: "開始使用",
          }
        }
      ],
    });
  }

  componentDidMount() {
    console.log("TourGuide component mounted");
    
    // 初次載入且尚未完成導覽時，設置延遲後顯示組件
    if (!this.state.hasCompletedTour) {
      setTimeout(() => {
        this.setState({ isVisible: true });
      }, 2000);
    }
  }

  componentWillUnmount() {
    if (this.driverObj) {
      this.driverObj.destroy();
      this.driverObj = null;
    }
  }

  startTour = () => {
    try {
      console.log("Starting site tour");
      if (!this.driverObj) {
        this.initializeDriver();
      }
      this.driverObj.drive();
      this.setState({ isVisible: false });
    } catch (error) {
      console.error("Error starting tour:", error);
    }
  };

  dismissTour = () => {
    this.setState({ isVisible: false });
  };

  resetTour = () => {
    this.setHasCompletedTour(false);
    this.setState({ isVisible: true });
  };

  render() {
    const { hasCompletedTour, isVisible } = this.state;

    // 渲染開始導覽按鈕
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
                onClick={this.startTour}
                className="bg-cyan-600 hover:bg-cyan-700 gap-2"
              >
                <Lightbulb size={16} />
                開始導覽
              </Button>
              <Button 
                variant="outline" 
                onClick={this.dismissTour}
                className="border-cyan-600 text-cyan-600 hover:bg-cyan-50"
              >
                稍後再說
              </Button>
            </div>
          </motion.div>
        )}
        
        {/* 固定位置的導覽按鈕 */}
        <motion.div
          className="fixed-tour-button"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            zIndex: 50,
            display: hasCompletedTour ? 'block' : 'none'
          }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={this.startTour}
              variant="default"
              size="sm"
              className="bg-cyan-600 hover:bg-cyan-700 gap-2 shadow-lg"
            >
              <HelpCircle size={16} />
              <span>網站導覽</span>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }
}

// Add toast to window for access in onDestroyed callback
declare global {
  interface Window {
    toast?: (props: { title: string; description: string; duration?: number }) => void;
  }
}