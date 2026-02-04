/**
 * 圖標註冊表
 * 明確匯入使用到的 Lucide 圖標，避免 bundle 包含未使用的圖標
 * 
 * 使用方式：
 * import { iconRegistry, type IconName } from '@/lib/iconRegistry';
 * const IconComponent = iconRegistry[iconName as IconName];
 */

import {
    // === 工具卡片使用的圖標 (from data.ts) ===
    MessageCircle,      // 線上即時客服、親師溝通小幫手
    ClipboardList,      // 行政業務協調系統
    Vote,               // 學生即時投票系統
    Book,               // PIRLS閱讀理解生成
    Utensils,           // 校園點餐系統
    Gamepad2,           // 遊戲類工具 (蜂類配對、瑪莉歐等)
    MessageSquare,      // 點石成金評語優化
    Files,              // 12年教案有14
    Users,              // 班級小管家
    GraduationCap,      // 剛好學：課堂互動so easy
    BookOpen,           // PIRLS閱讀理解網
    Rocket,             // 5W1H 靈感發射器
    Image,              // 點亮詩意~早安長輩圖產生器
    FileText,           // 社群領域會議報告產出平台
    Ticket,             // 單一抽籤系統
    Shuffle,            // 大量抽籤系統
    Bot,                // 設計自己的專屬客服
    Keyboard,           // 英打練習、中打練習
    Languages,          // 成語中打練習
    Sparkles,           // 點石成金蜂評語優化網頁版
    ClipboardCheck,     // 教師午會記錄報告站
    Mic,                // 國語演說培訓班
    Calculator,         // 九九乘法表練習器
    Wrench,             // 好用小工具(許願池)
    Globe,              // 太陽系探索者
    Dice5,              // 小遊戲大集合
    Gift,               // 互動遊戲抓抓樂
    Hand,               // 遊戲觸屏碰碰碰
    AudioWaveform,      // 讓聲音具現化吧！
    Play,               // 互動式影像聲音遊戲區
    Palette,            // 觸屏點點塗鴉區
    Waves,              // 聲波擴散360小遊戲
    Volume2,            // 聲音互動小遊戲
    Wand2,              // 孔明神算：心靈感應預言魔術
    LayoutDashboard,    // Padlet行政宣導動態牆
    Music,              // 吉他彈唱🎸點歌系統🎵
    ShieldCheck,        // 兒童臉部隱私保護工具
    Cloud,              // 文字雲即時互動
    FileInput,          // 動態表單自動回報系統
    FolderOpen,         // 教務處寶藏庫
    Baby,               // 童趣學園
    Calendar,           // 自動排課系統
    Library,            // 創價・教育 EXPO 線上選課

    // === ToolCard.tsx 額外使用的圖標 ===
    Share2,
    Settings2,
    Facebook,
    Linkedin,
    BarChart,
    Copy,
    Heart,

    // === 其他元件使用的圖標 ===
    Trophy,             // ToolRankings, Home
    Medal,              // ToolRankings
    Crown,              // ToolRankings, VisitorCounter
    VolumeX,            // ToolRankings
    Clock,              // Home
    X,                  // 多處使用
    Search,             // SearchBar
    ArrowUp,            // ScrollToTop
    HelpCircle,         // TourGuide, RankingTutorial
    Info,               // TourGuide
    Lightbulb,          // TourGuide, RankingTutorial
    ChevronLeft,        // TriviaDialog, 分頁
    ChevronRight,       // TriviaDialog, 分頁
    Moon,               // ThemeToggle
    Sun,                // ThemeToggle
    Laptop,             // ThemeToggle
    Newspaper,          // TeacherIntro
    UserCheck,          // VisitorCounter
    Award,              // VisitorCounter, ProgressDashboard
    Star,               // VisitorCounter
    Diamond,            // VisitorCounter
    AlertTriangle,      // ErrorBoundary, DiagnosticsDashboard
    RefreshCw,          // ErrorBoundary
    Plus,               // EmojiStoryTelling
    Zap,                // ProgressDashboard, AccessibilityMenu
    Target,             // ProgressDashboard
    ChevronDown,        // 多處使用
    ChevronUp,          // SeoAnalyticsDashboard
    Accessibility,      // AccessibilityMenu
    Type,               // AccessibilityMenu
    Contrast,           // AccessibilityMenu
    Move,               // AccessibilityMenu
    AlertCircle,        // AchievementsList
    InfoIcon,           // DiagnosticsDashboard, DataSourceIndicator
    DatabaseIcon,       // DataSourceIndicator
    ServerOffIcon,      // DataSourceIndicator
    ArchiveIcon,        // DataSourceIndicator
    GripVertical,       // ui/resizable
    PanelLeft,          // ui/sidebar
    Circle,             // ui/radio-group, menubar
    MoreHorizontal,     // ui/pagination, breadcrumb
    Check,              // ui/checkbox, select, dropdown-menu
    Dot,                // ui/input-otp
    ArrowLeft,          // ui/carousel
    ArrowRight,         // ui/carousel
    Loader2,            // ui/charts
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

/**
 * 圖標註冊表物件
 * 包含所有專案中使用到的 Lucide 圖標
 */
export const iconRegistry: Record<string, LucideIcon> = {
    // 工具卡片圖標
    MessageCircle,
    ClipboardList,
    Vote,
    Book,
    Utensils,
    Gamepad2,
    MessageSquare,
    Files,
    Users,
    GraduationCap,
    BookOpen,
    Rocket,
    Image,
    FileText,
    Ticket,
    Shuffle,
    Bot,
    Keyboard,
    Languages,
    Sparkles,
    ClipboardCheck,
    Mic,
    Calculator,
    Wrench,
    Globe,
    Dice5,
    Gift,
    Hand,
    AudioWaveform,
    Play,
    Palette,
    Waves,
    Volume2,
    Wand2,
    LayoutDashboard,
    Music,
    ShieldCheck,
    Cloud,
    FileInput,
    FolderOpen,
    Baby,
    Calendar,
    Library,

    // 其他圖標
    Share2,
    Settings2,
    Facebook,
    Linkedin,
    BarChart,
    Copy,
    Heart,
    Trophy,
    Medal,
    Crown,
    VolumeX,
    Clock,
    X,
    Search,
    ArrowUp,
    HelpCircle,
    Info,
    Lightbulb,
    ChevronLeft,
    ChevronRight,
    Moon,
    Sun,
    Laptop,
    Newspaper,
    UserCheck,
    Award,
    Star,
    Diamond,
    AlertTriangle,
    RefreshCw,
    Plus,
    Zap,
    Target,
    ChevronDown,
    ChevronUp,
    Accessibility,
    Type,
    Contrast,
    Move,
    AlertCircle,
    InfoIcon,
    DatabaseIcon,
    ServerOffIcon,
    ArchiveIcon,
    GripVertical,
    PanelLeft,
    Circle,
    MoreHorizontal,
    Check,
    Dot,
    ArrowLeft,
    ArrowRight,
    Loader2,
};

/**
 * 圖標名稱類型
 * 用於類型安全的圖標存取
 */
export type IconName = keyof typeof iconRegistry;

/**
 * 根據名稱取得圖標元件
 * @param name 圖標名稱
 * @returns 圖標元件，若找不到則返回 undefined
 */
export function getIcon(name: string): LucideIcon | undefined {
    return iconRegistry[name];
}
