/**
 * externalWorks.ts — 對外作品 / 演講 / 媒體露出資料設定檔
 *
 * 主頁 BulletinSpeechBanner 使用 EXTERNAL_WORKS[0] 渲染（取最新一筆）。
 * 未來新增演講 / 研習 / 投稿 / 媒體採訪只要往這個陣列 unshift 即可。
 *
 * 資料順序：陣列開頭為最新作品（新加的 push 到 [0]）。
 *
 * 設計參考：
 *   - 視覺對齊 BulletinMilestone100 倒數 banner（淺色便利貼風格）
 *   - 跟 milestone celebration banner CTA chip 同尺度
 *   - 桌面 65px / 手機 142px column flex stretch
 */
import { tokens } from '@/design/tokens';

export interface ExternalWorkCta {
  emoji: string;
  text: string;
  href: string;
  /** GA 事件 `cta` 欄位識別碼 (e.g. 'slides' / 'pdf' / 'video') */
  trackingId: string;
  /** 點擊後是否新分頁開啟。預設 true */
  external?: boolean;
}

export interface ExternalWork {
  /** 唯一識別 — 用於 GA 事件 / localStorage 撒花記錄 */
  id: string;
  /** 開頭 emoji（顯示在標題前）*/
  emoji: string;
  /** 主標 — 演講題目 / 作品名 */
  title: string;
  /** 側邊小標籤 — 場合 / 媒體 / 主辦單位（顯示在主標旁的深色 chip）*/
  label: string;
  /** 副標 / 一句話介紹 — 桌面版可選顯示 */
  subtitle?: string;
  /** 日期字串（用於資料管理參考，不直接渲染）*/
  date?: string;
  /** 主 CTA — 必填 */
  primaryCta: ExternalWorkCta;
  /** 次 CTA — 選填（PDF / video / repo 等附帶資料）*/
  secondaryCta?: ExternalWorkCta;
  /** 色彩覆寫（預設用石門寶藍 + 淺綠便利貼）*/
  colors?: {
    bg?: string;     // 便利貼底色（淺色）
    accent?: string; // 主 CTA 背景（深色）
    label?: string;  // label chip 背景（深色）
  };
}

const NAVY_DEEP = '#143526';

export const EXTERNAL_WORKS: ExternalWork[] = [
  {
    id: 'aifed-2026',
    emoji: '🎤',
    title: '從使用者到開發者',
    label: '2026 AIFED',
    subtitle: '一位國小教師如何用 AI 協作親手做出 100+ 款教育工具的完整心路歷程',
    date: '2026-06',
    primaryCta: {
      emoji: '📊',
      text: '看簡報',
      href: 'akai-talk-2026/index.html',
      trackingId: 'slides',
    },
    secondaryCta: {
      emoji: '📄',
      text: 'PDF',
      href: 'akai-talk-2026/AIFED2026_paper.pdf',
      trackingId: 'pdf',
    },
    colors: {
      bg: tokens.note.green,
      accent: NAVY_DEEP,
      label: NAVY_DEEP,
    },
  },
  // 未來新增演講 / 研習 / 媒體採訪往這裡 unshift（陣列開頭）
];
