export interface EducationalTool {
  id: number;
  title: string;
  description: string;
  url: string;
  icon: string;
  category: 'communication' | 'teaching' | 'language' | 'reading' | 'utilities' | 'games';
}

export const tools: EducationalTool[] = [
  {
    id: 1,
    title: "線上即時客服",
    description: "提供即時的線上教育支援和諮詢服務，協助解決學習過程中的問題",
    url: "https://chat.smes.tyc.edu.tw/",
    icon: "message-circle",
    category: "communication"
  },
  {
    id: 2,
    title: "激發教案靈感",
    description: "為教師提供創新的教學設計靈感，幫助開發有趣且有效的課程內容",
    url: "https://lesson.smes.tyc.edu.tw/",
    icon: "lightbulb",
    category: "teaching"
  },
  {
    id: 3,
    title: "漢語閱讀新解",
    description: "創新的中文閱讀學習平台，幫助學生更好地理解和掌握漢語文字",
    url: "https://words.smes.tyc.edu.tw/",
    icon: "book-open",
    category: "language"
  },
  {
    id: 4, 
    title: "PIRLS閱讀理解生成",
    description: "專業的閱讀理解評估工具，幫助提升學生的閱讀能力",
    url: "https://pirls.smes.tyc.edu.tw/",
    icon: "book",
    category: "reading"
  },
  {
    id: 5,
    title: "QRCode批次產生器",
    description: "便捷的QR碼批量生成工具，適用於教育資源的快速分享",
    url: "https://qrcode.smes.tyc.edu.tw/",
    icon: "qr-code",
    category: "utilities"
  },
  {
    id: 6,
    title: "蜂類配對消消樂",
    description: "寓教於樂的教育遊戲，通過趣味性的方式學習蜂類知識",
    url: "https://bee.smes.tyc.edu.tw/",
    icon: "gamepad-2",
    category: "games"
  }
];

export const teacherInfo = {
  name: "阿凱老師",
  title: "教育科技創新者",
  description: "致力於開發實用的教育工具，結合科技與教育，為師生創造更好的教學與學習體驗。",
  achievements: [
    "開發多項教育輔助工具",
    "推動教育科技創新",
    "致力於改善教學品質"
  ]
};
