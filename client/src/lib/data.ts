export type ToolCategory = 'communication' | 'teaching' | 'language' | 'reading' | 'utilities' | 'games' | 'interactive';

export interface EducationalTool {
  id: number;
  title: string;
  description: string;
  detailedDescription?: string;  // 詳細說明
  url: string;
  icon: string;
  category: ToolCategory;
  previewUrl?: string;
  tags?: string[];               // 標籤
}

export const tools: EducationalTool[] = [
  {
    id: 1,
    title: "線上即時客服",
    description: "提供即時的線上教育支援和諮詢服務，協助解決學習過程中的問題",
    url: "https://doc.smes.tyc.edu.tw/shared/A4uyH5OdHI",
    icon: "MessageCircle",
    category: "communication",
    previewUrl: "previews/preview_communication_v2.png"
  },
  {
    id: 2,
    title: "行政業務協調系統",
    description: "便捷的行政業務協調平台，提升校園行政工作效率",
    url: "https://cagoooo.github.io/staff/",
    icon: "ClipboardList",
    category: "utilities",
    previewUrl: "previews/preview_admin_v2.png"
  },
  {
    id: 3,
    title: "學生即時投票系統",
    description: "即時收集學生意見的投票平台，提升課堂互動性與參與度",
    url: "https://vote.smes.tyc.edu.tw/",
    icon: "Vote",
    category: "interactive",
    previewUrl: "previews/preview_teaching_v2.png"
  },
  {
    id: 4,
    title: "PIRLS閱讀理解生成",
    description: "專業的閱讀理解評估工具，幫助提升學生的閱讀能力",
    url: "https://pirlss.smes.tyc.edu.tw/",
    icon: "Book",
    category: "reading",
    previewUrl: "previews/preview_reading_v2.png"
  },
  {
    id: 5,
    title: "校園點餐系統",
    description: "便捷的校園點餐平台，讓師生輕鬆訂購午餐",
    url: "https://cagoooo.github.io/vendor/",
    icon: "Utensils",
    category: "utilities",
    previewUrl: "previews/preview_utility_v2.png"
  },
  {
    id: 6,
    title: "蜂類配對消消樂",
    description: "寓教於樂的教育遊戲，通過趣味性的方式學習蜂類知識",
    url: "https://cagoooo.github.io/bee/",
    icon: "Gamepad2",
    category: "games",
    previewUrl: "previews/preview_puzzle_v2.png"
  },
  {
    id: 7,
    title: "點「石」成金🐝(評語優化)",
    description: "創新的學生評語優化工具，協助教師撰寫更正向、積極且個人化的學生評語",
    url: "https://line.me/R/ti/p/@733oiboa?oat_content=url&ts=05120012",
    icon: "MessageSquare",
    category: "teaching",
    previewUrl: "previews/preview_feedback_v2.png"
  },
  {
    id: 8,
    title: "12年教案有14",
    description: "豐富的教案資源分享平台，提供多元化的教學素材和靈感",
    url: "https://lin.ee/pCqnVhT",
    icon: "Files",
    category: "teaching",
    previewUrl: "previews/preview_teaching_v2.png"
  },
  {
    id: 9,
    title: "超級瑪莉歐冒險",
    description: "經典遊戲風格的教育遊戲，結合趣味與學習的互動體驗",
    url: "https://cagoooo.github.io/mario-game/",
    icon: "Gamepad2",
    category: "games",
    previewUrl: "previews/preview_platformer_v2.png"
  },
  {
    id: 10,
    title: "班級小管家",
    description: "便捷的班級管理工具，協助教師輕鬆管理班級事務",
    url: "https://cagoooo.github.io/class/",
    icon: "Users",
    category: "utilities",
    previewUrl: "previews/preview_admin_v2.png"
  },
  {
    id: 11,
    title: "剛好學：課堂互動so easy",
    description: "即時課堂互動平台，讓教學更加生動有趣",
    url: "https://class.smes.tyc.edu.tw/",
    icon: "GraduationCap",
    category: "teaching",
    previewUrl: "previews/preview_teaching_v2.png"
  },
  {
    id: 12,
    title: "PIRLS閱讀理解網",
    description: "完整的 PIRLS 閱讀理解資源平台",
    url: "https://read.smes.tyc.edu.tw/smes/PIRLS/",
    icon: "BookOpen",
    category: "reading",
    previewUrl: "previews/preview_reading_v2.png"
  },
  {
    id: 13,
    title: "5W1H 靈感發射器 🚀",
    description: "創意思維激發工具，協助發想教學內容",
    url: "https://5w1h.smes.tyc.edu.tw/",
    icon: "Rocket",
    category: "teaching",
    previewUrl: "previews/preview_teaching_v2.png"
  },
  {
    id: 14,
    title: "點亮詩意~『早安長輩圖產生器』",
    description: "輕鬆製作溫馨的早安問候圖片",
    url: "https://poet.smes.tyc.edu.tw/",
    icon: "Image",
    category: "utilities",
    previewUrl: "previews/preview_utility_v2.png"
  },
  {
    id: 15,
    title: "社群領域會議報告產出平台",
    description: "快速產生會議報告的協作工具",
    url: "https://report.smes.tyc.edu.tw/",
    icon: "FileText",
    category: "utilities",
    previewUrl: "previews/preview_admin_v2.png"
  },
  {
    id: 16,
    title: "親師溝通小幫手",
    description: "促進親師溝通的便捷平台",
    url: "https://talk.smes.tyc.edu.tw/",
    icon: "MessageSquare",
    category: "communication",
    previewUrl: "previews/preview_communication_v2.png"
  },
  {
    id: 17,
    title: "單一抽籤系統",
    description: "簡單快速的單一抽籤工具",
    url: "https://www.smes.tyc.edu.tw/smes_html/gogogo.html",
    icon: "Ticket",
    category: "utilities",
    previewUrl: "previews/preview_lottery_v2.png"
  },
  {
    id: 18,
    title: "大量抽籤系統",
    description: "支援大量抽籤的進階工具",
    url: "https://www.smes.tyc.edu.tw/smes_html/random.html",
    icon: "Shuffle",
    category: "utilities",
    previewUrl: "previews/preview_lottery_v2.png"
  },
  {
    id: 19,
    title: "設計自己的專屬客服",
    description: "自訂專屬的智能客服系統",
    url: "https://doc.smes.tyc.edu.tw/",
    icon: "Bot",
    category: "utilities",
    previewUrl: "previews/preview_communication_v2.png"
  },
  {
    id: 20,
    title: "英打練習",
    description: "英文打字練習工具，提升打字速度與準確度",
    url: "https://www.smes.tyc.edu.tw/smes_html/typeEN.html",
    icon: "Keyboard",
    category: "language",
    previewUrl: "previews/preview_typing_v2.png"
  },
  {
    id: 21,
    title: "中打練習",
    description: "中文打字練習工具，提升中文輸入能力",
    url: "https://www.smes.tyc.edu.tw/smes_html/typeCC.html",
    icon: "Keyboard",
    category: "language",
    previewUrl: "previews/preview_typing_v2.png"
  },
  {
    id: 22,
    title: "成語中打練習",
    description: "透過成語練習中文打字，邊打邊學成語",
    url: "https://www.smes.tyc.edu.tw/smes_html/typeTC.html",
    icon: "Languages",
    category: "language",
    previewUrl: "previews/preview_typing_v2.png"
  },
  {
    id: 23,
    title: "點石成金蜂🐝 評語優化網頁版",
    description: "網頁版學生評語優化工具，輕鬆產出正向評語",
    url: "https://cagoooo.github.io/comments/",
    icon: "Sparkles",
    category: "teaching",
    previewUrl: "previews/preview_feedback_v2.png"
  },
  {
    id: 24,
    title: "教師午會記錄報告站",
    description: "教師午會紀錄與報告分享平台",
    url: "https://sites.google.com/mail2.smes.tyc.edu.tw/114teacher/",
    icon: "ClipboardCheck",
    category: "utilities",
    previewUrl: "previews/preview_admin_v2.png"
  },
  {
    id: 25,
    title: "國語演說培訓班",
    description: "國語演說練習與培訓工具",
    url: "https://sites.google.com/mail2.smes.tyc.edu.tw/swissknife/%E5%9C%8B%E8%AA%9E%E6%BC%94%E8%AA%AA%E7%B7%B4%E7%BF%92%E5%B0%8F%E5%B7%A5%E5%85%B7?authuser=0",
    icon: "Mic",
    category: "language",
    previewUrl: "previews/preview_language_v2.png"
  },
  {
    id: 26,
    title: "九九乘法表練習器",
    description: "互動式九九乘法表練習工具",
    url: "https://sites.google.com/mail2.smes.tyc.edu.tw/swissknife/%E4%B9%9D%E4%B9%9D%E4%B9%98%E6%B3%95%E8%A1%A8%E7%B7%B4%E7%BF%92%E5%99%A8?authuser=0",
    icon: "Calculator",
    category: "teaching",
    previewUrl: "previews/preview_teaching_v2.png"
  },
  {
    id: 27,
    title: "⬅️好用小工具(許願池)",
    description: "各種好用的教學小工具集合與許願池",
    url: "https://sites.google.com/mail2.smes.tyc.edu.tw/swissknife/",
    icon: "Wrench",
    category: "utilities",
    previewUrl: "previews/preview_utility_v2.png"
  },
  {
    id: 28,
    title: "瑪莉歐風格平台跳躍遊戲",
    description: "經典瑪莉歐風格的平台跳躍遊戲",
    url: "https://www.smes.tyc.edu.tw/smes_html/mariojump.html",
    icon: "Gamepad2",
    category: "games",
    previewUrl: "previews/preview_platformer_v2.png"
  },
  {
    id: 29,
    title: "太陽系探索者",
    description: "3D 太陽系探索互動學習工具",
    url: "https://www.smes.tyc.edu.tw/smes_html/3d-space.html",
    icon: "Globe",
    category: "teaching",
    previewUrl: "previews/preview_space_v2.png"
  },
  {
    id: 30,
    title: "小遊戲大集合",
    description: "多款趣味小遊戲合集",
    url: "https://www.smes.tyc.edu.tw/smes_html/little_games/",
    icon: "Dice5",
    category: "games",
    previewUrl: "previews/preview_game_v2.png"
  },
  {
    id: 31,
    title: "互動遊戲抓抓樂",
    description: "趣味夾娃娃機互動遊戲",
    url: "https://www.smes.tyc.edu.tw/claw-machine-game.html",
    icon: "Gift",
    category: "games",
    previewUrl: "previews/preview_game_v2.png"
  },
  {
    id: 32,
    title: "遊戲觸屏碰碰碰",
    description: "觸屏互動碰撞遊戲",
    url: "https://www.smes.tyc.edu.tw/smes_html/touch.html",
    icon: "Hand",
    category: "games",
    previewUrl: "previews/preview_game_v2.png"
  },
  {
    id: 33,
    title: "讓聲音具現化吧！",
    description: "聲音視覺化互動體驗",
    url: "https://www.smes.tyc.edu.tw/smes_html/sound.html",
    icon: "AudioWaveform",
    category: "games",
    previewUrl: "previews/preview_music_v2.png"
  },
  {
    id: 34,
    title: "互動式影像聲音遊戲區",
    description: "結合影像與聲音的互動遊戲",
    url: "https://www.smes.tyc.edu.tw/smes_html/go.html",
    icon: "Play",
    category: "games",
    previewUrl: "previews/preview_music_v2.png"
  },
  {
    id: 35,
    title: "觸屏點點塗鴉區",
    description: "觸屏塗鴉創作工具",
    url: "https://www.smes.tyc.edu.tw/modules/tadnews/page.php?ncsn=14&nsn=2856",
    icon: "Palette",
    category: "games",
    previewUrl: "previews/preview_game_v2.png"
  },
  {
    id: 36,
    title: "貪食蛇互動遊戲",
    description: "經典貪食蛇遊戲",
    url: "https://www.smes.tyc.edu.tw/smes_html/snake_game.html",
    icon: "Gamepad2",
    category: "games",
    previewUrl: "previews/preview_game_v2.png"
  },
  {
    id: 37,
    title: "聲波擴散360小遊戲",
    description: "聲波視覺化互動遊戲",
    url: "https://www.smes.tyc.edu.tw/modules/tadnews/page.php?ncsn=14&nsn=2863",
    icon: "Waves",
    category: "games",
    previewUrl: "previews/preview_music_v2.png"
  },
  {
    id: 38,
    title: "聲音互動小遊戲",
    description: "透過聲音控制的互動遊戲",
    url: "https://www.smes.tyc.edu.tw/modules/tadnews/page.php?ncsn=14&nsn=2859",
    icon: "Volume2",
    category: "games",
    previewUrl: "previews/preview_music_v2.png"
  },
  {
    id: 39,
    title: "孔明神算：心靈感應預言魔術",
    description: "神奇的心靈感應預言魔術遊戲",
    url: "https://claude.ai/public/artifacts/982f7b1c-8302-4112-a05f-342ad24bd421",
    icon: "Wand2",
    category: "games",
    previewUrl: "previews/preview_magic_v2.png"
  },
  {
    id: 40,
    title: "Padlet行政宣導動態牆",
    description: "即時更新的行政宣導公告牆，方便資訊傳達",
    url: "https://padlet.com/2104340/padlet-rl3l5wi9wmebku2k",
    icon: "LayoutDashboard",
    category: "utilities",
    previewUrl: "previews/preview_admin_v2.png"
  },
  {
    id: 41,
    title: "吉他彈唱🎸點歌系統🎵",
    description: "互動式吉他彈唱點歌平台，輕鬆點選喜愛的歌曲",
    url: "https://cagoooo.github.io/song/",
    icon: "Music",
    category: "interactive",
    previewUrl: "previews/preview_music_v2.png"
  },
  {
    id: 42,
    title: "兒童臉部隱私保護工具",
    description: "保護兒童照片隱私，自動模糊處理臉部",
    url: "https://cagoooo.github.io/child-face-privacy/",
    icon: "ShieldCheck",
    category: "utilities",
    previewUrl: "previews/preview_privacy_v2.png"
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