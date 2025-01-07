import React from 'react';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export class TourGuide extends React.Component {
  private driverObj: any;

  constructor(props: any) {
    super(props);
    this.driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      nextBtnText: "下一步",
      prevBtnText: "上一步",
      doneBtnText: "完成",
      overlayColor: "rgba(0, 0, 0, 0.7)",
      onHighlightStarted: (element) => {
        if (element) {
          const rect = element.getBoundingClientRect();
          const offset = rect.top + window.scrollY - 100;
          window.scrollTo({
            top: offset,
            behavior: 'smooth'
          });
        }
      },
      onDestroyed: () => {
        console.log("Tour guide completed");
      },
      steps: [
        {
          element: '[data-tour="teacher-intro"]',
          popover: {
            title: "教師介紹 👨‍🏫",
            description: "這裡介紹阿凱老師的個人資訊和專業背景，您可以了解更多關於老師的教育理念和成就。",
            side: "bottom",
            align: 'start',
          }
        },
        {
          element: '[data-tour="tools-grid"]',
          popover: {
            title: "教育工具集 🛠️",
            description: "這裡展示了各種創新的教育工具，每個工具都經過精心設計，點擊工具卡片即可開始使用！",
            side: "left",
            align: 'start',
          }
        },
        {
          element: '[data-tour="tool-rankings"]',
          popover: {
            title: "工具排行榜 🏆",
            description: "即時顯示最受歡迎的教育工具排名，幫助您快速找到最適合的教學資源。",
            side: "left",
            align: 'start',
          }
        },
        {
          element: '[data-tour="emoji-storytelling"]',
          popover: {
            title: "表情符號故事創作 📖",
            description: "使用生動有趣的表情符號來創作故事，激發學生的創造力和表達能力！",
            side: "left",
            align: 'start',
          }
        },
        {
          element: '[data-tour="mood-tracker"]',
          popover: {
            title: "心情追蹤器 😊",
            description: "追蹤並分析使用各種工具時的心情變化，幫助優化學習體驗。",
            side: "left",
            align: 'start',
          }
        },
        {
          element: '[data-tour="progress-dashboard"]',
          popover: {
            title: "學習進度儀表板 📊",
            description: "視覺化呈現學習進度和成效，讓您清楚掌握每個階段的學習情況。",
            side: "left",
            align: 'start',
          }
        },
        {
          element: '[data-tour="achievements"]',
          popover: {
            title: "成就系統 🌟",
            description: "完成特定目標即可解鎖成就徽章，激勵持續學習的動力！",
            side: "left",
            align: 'start',
          }
        },
        {
          element: '[data-tour="diagnostics"]',
          popover: {
            title: "系統診斷面板 🔍",
            description: "監控系統運行狀態和使用數據，確保最佳的使用體驗。",
            side: "left",
            align: 'start',
          }
        },
        {
          element: '[data-tour="theme-toggle"]',
          popover: {
            title: "主題切換 🎨",
            description: "可以切換淺色/深色主題，讓您在不同光線環境下都能舒適使用。",
            side: "bottom",
            align: 'start',
          }
        }
      ],
    });
  }

  componentDidMount() {
    console.log("TourGuide component mounted");
  }

  componentWillUnmount() {
    if (this.driverObj) {
      this.driverObj.destroy();
    }
  }

  startTour = () => {
    try {
      console.log("Starting tour guide");
      if (this.driverObj) {
        this.driverObj.drive();
      } else {
        console.error("Driver object not initialized");
      }
    } catch (error) {
      console.error("Error starting tour:", error);
    }
  };

  render() {
    return null;
  }
}