export interface EducationalTool {
  id: number;
  title: string;
  description: string;
  url: string;
  icon: string;
  category: 'communication' | 'teaching' | 'language' | 'reading' | 'utilities' | 'games';
  previewUrl?: string;
}

export const tools: EducationalTool[] = [
  {
    id: 1,
    title: "線上即時客服",
    description: "提供即時的線上教育支援和諮詢服務，協助解決學習過程中的問題",
    url: "https://doc.smes.tyc.edu.tw/shared/A4uyH5OdHI",
    icon: "MessageCircle",
    category: "communication",
    previewUrl: "/previews/chat-preview.svg"
  },
  {
    id: 2,
    title: "行政業務協調系統",
    description: "便捷的行政業務協調平台，提升校園行政工作效率",
    url: "https://cagoooo.github.io/staff/",
    icon: "ClipboardList",
    category: "utilities",
    previewUrl: "/previews/staff-preview.svg"
  },
  {
    id: 3,
    title: "學生即時投票系統",
    description: "即時收集學生意見的投票平台，提升課堂互動性與參與度",
    url: "https://vote.smes.tyc.edu.tw/",
    icon: "Vote",
    category: "interactive",
    previewUrl: "/previews/reading-preview.svg"
  },
  {
    id: 4,
    title: "PIRLS閱讀理解生成",
    description: "專業的閱讀理解評估工具，幫助提升學生的閱讀能力",
    url: "https://pirlss.smes.tyc.edu.tw/",
    icon: "Book",
    category: "reading",
    previewUrl: "/previews/pirls-preview.svg"
  },
  {
    id: 5,
    title: "校園點餐系統",
    description: "便捷的校園點餐平台，讓師生輕鬆訂購午餐",
    url: "https://cagoooo.github.io/vendor/",
    icon: "Utensils",
    category: "utilities",
    previewUrl: "/previews/vendor-preview.svg"
  },
  {
    id: 6,
    title: "蜂類配對消消樂",
    description: "寓教於樂的教育遊戲，通過趣味性的方式學習蜂類知識",
    url: "https://cagoooo.github.io/bee/",
    icon: "Gamepad2",
    category: "games",
    previewUrl: "/previews/bee-preview.svg"
  },
  {
    id: 7,
    title: "點「石」成金🐝(評語優化)",
    description: "創新的學生評語優化工具，協助教師撰寫更正向、積極且個人化的學生評語",
    url: "https://line.me/R/ti/p/@733oiboa?oat_content=url&ts=05120012",
    icon: "MessageSquare",
    category: "teaching",
    previewUrl: "/previews/stone-preview.svg"
  },
  {
    id: 8,
    title: "12年教案有14",
    description: "豐富的教案資源分享平台，提供多元化的教學素材和靈感",
    url: "https://lin.ee/pCqnVhT",
    icon: "Files",
    category: "teaching",
    previewUrl: "/previews/teaching-preview.svg"
  },
  {
    id: 9,
    title: "超級瑪莉歐冒險",
    description: "經典遊戲風格的教育遊戲，結合趣味與學習的互動體驗",
    url: "https://cagoooo.github.io/mario-game/",
    icon: "Gamepad2",
    category: "games",
    previewUrl: "/previews/mario-preview.svg"
  },
  {
    id: 10,
    title: "班級小管家",
    description: "便捷的班級管理工具，協助教師輕鬆管理班級事務",
    url: "https://cagoooo.github.io/class/",
    icon: "Users",
    category: "utilities",
    previewUrl: "/previews/class-preview.svg"
  },
  {
    id: 11,
    title: "剛好學：課堂互動so easy",
    description: "即時課堂互動平台，讓教學更加生動有趣",
    url: "https://class.smes.tyc.edu.tw/",
    icon: "GraduationCap",
    category: "teaching",
    previewUrl: "/previews/interactive-preview.svg"
  },
  {
    id: 12,
    title: "PIRLS閱讀理解網",
    description: "完整的 PIRLS 閱讀理解資源平台",
    url: "https://read.smes.tyc.edu.tw/smes/PIRLS/",
    icon: "BookOpen",
    category: "reading",
    previewUrl: "/previews/pirls-web-preview.svg"
  },
  {
    id: 13,
    title: "5W1H 靈感發射器 🚀",
    description: "創意思維激發工具，協助發想教學內容",
    url: "https://5w1h.smes.tyc.edu.tw/",
    icon: "Rocket",
    category: "teaching",
    previewUrl: "/previews/5w1h-preview.svg"
  },
  {
    id: 14,
    title: "點亮詩意~『早安長輩圖產生器』",
    description: "輕鬆製作溫馨的早安問候圖片",
    url: "https://poet.smes.tyc.edu.tw/",
    icon: "Image",
    category: "utilities",
    previewUrl: "/previews/poet-preview.svg"
  },
  {
    id: 15,
    title: "社群領域會議報告產出平台",
    description: "快速產生會議報告的協作工具",
    url: "https://report.smes.tyc.edu.tw/",
    icon: "FileText",
    category: "utilities",
    previewUrl: "/previews/report-preview.svg"
  },
  {
    id: 16,
    title: "親師溝通小幫手",
    description: "促進親師溝通的便捷平台",
    url: "https://talk.smes.tyc.edu.tw/",
    icon: "MessageSquare",
    category: "communication",
    previewUrl: "/previews/talk-preview.svg"
  },
  {
    id: 17,
    title: "單一抽籤系統",
    description: "簡單快速的單一抽籤工具",
    url: "https://www.smes.tyc.edu.tw/smes_html/gogogo.html",
    icon: "Ticket",
    category: "utilities",
    previewUrl: "/previews/single-draw-preview.svg"
  },
  {
    id: 18,
    title: "大量抽籤系統",
    description: "支援大量抽籤的進階工具",
    url: "https://www.smes.tyc.edu.tw/smes_html/random.html",
    icon: "Shuffle",
    category: "utilities",
    previewUrl: "/previews/batch-draw-preview.svg"
  },
  {
    id: 19,
    title: "設計自己的專屬客服",
    description: "自訂專屬的智能客服系統",
    url: "https://doc.smes.tyc.edu.tw/",
    icon: "Bot",
    category: "utilities",
    previewUrl: "/previews/bot-preview.svg"
  },
  {
    id: 20,
    title: "英打練習",
    description: "英文打字練習工具，提升打字速度與準確度",
    url: "https://www.smes.tyc.edu.tw/smes_html/typeEN.html",
    icon: "Keyboard",
    category: "language",
    previewUrl: "/previews/type-en-preview.svg"
  },
  {
    id: 21,
    title: "中打練習",
    description: "中文打字練習工具，提升中文輸入能力",
    url: "https://www.smes.tyc.edu.tw/smes_html/typeCC.html",
    icon: "Keyboard",
    category: "language",
    previewUrl: "/previews/type-ch-preview.svg"
  },
  {
    id: 22,
    title: "成語中打練習",
    description: "透過成語練習中文打字，邊打邊學成語",
    url: "https://www.smes.tyc.edu.tw/smes_html/typeTC.html",
    icon: "Languages",
    category: "language",
    previewUrl: "/previews/type-idiom-preview.svg"
  }
];

// 教師表情動態系統
interface TeacherMood {
  emoji: string;
  description: string;
}

const teacherMoods: TeacherMood[] = [
  { emoji: '👨‍🏫', description: '認真教學中' },
  { emoji: '🧑‍🏫', description: '專注備課中' },
  { emoji: '👨‍🎓', description: '持續學習中' },
  { emoji: '💡', description: '靈感迸發中' },
  { emoji: '📚', description: '研究教材中' },
  { emoji: '✏️', description: '編寫教案中' }
];

export const teacherInfo = {
  name: "阿凱老師",
  title: `${teacherMoods[0].emoji} 教育科技創新者`,  // 使用第一個表情符號作為默認值
  description: "致力於開發實用的教育工具，結合科技與教育，為師生創造更好的教學與學習體驗。",
  achievements: [
    "開發多項教育輔助工具",
    "推動教育科技創新",
    "致力於改善教學品質"
  ],
  moods: teacherMoods  // 加入所有表情符號供動態使用
};