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