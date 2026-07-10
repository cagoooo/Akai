import type { AudienceFit } from './audienceProfile';

export type { AudienceFit } from './audienceProfile';

export type ToolCategory = 'communication' | 'teaching' | 'language' | 'reading' | 'utilities' | 'games' | 'interactive';

export interface EducationalTool {
  id: number;
  title: string;
  description: string;
  detailedDescription?: string;  // 詳細說明
  url: string;
  icon: string;
  category: ToolCategory;
  audienceFit?: AudienceFit;
  previewUrl?: string;
  ogPreviewUrl?: string;         // 1200×630 社群分享 OG 圖（由 generate-unified-og.mjs 產出）
  tags?: string[];               // 標籤
  totalClicks?: number;          // 來自 API 的統計數據
  /**
   * 是否為「站內專屬工具」（如 #100 工具索引神器）。
   * - true → 不計入工具總數、不參與 featuredTools 推薦、家族樹不顯示
   * - false / 未設 → 一般外部工具
   */
  isInternal?: boolean;
  /**
   * 工具加入日期（ISO 8601），由 new-tool.mjs 自動寫入。
   * 用於前端「🆕 7 天內新增」徽章判斷。
   * 既有 #1-#97 沒填這個欄位（無法回填真實日期），預設視為「非新工具」。
   */
  addedAt?: string;
  /**
   * 若此工具已有更完整的進階版本，填該工具 id。
   * 用於卡片 / 詳情頁顯示「已推出 Pro 版」升級提示，連到該工具。
   */
  upgradeToId?: number;
  /**
   * 若此工具本身就是某個舊版工具的進階（Pro）版，填舊版工具 id。
   * 用於卡片 / 詳情頁顯示「PRO 升級版」徽章。
   */
  upgradeFromId?: number;
}

export interface TeacherMood {
  emoji: string;
  description: string;
}

export interface TeacherInfo {
  name: string;
  title: string;
  description: string;
  achievements: string[];
  moods: TeacherMood[];
}

// 預設空的工具清單，用於 SSR 或初始狀態
export const tools: EducationalTool[] = [];

export const teacherInfo: TeacherInfo = {
  name: "載入中...",
  title: "阿凱老師",
  description: "",
  achievements: [],
  moods: []
};
