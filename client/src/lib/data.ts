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
  totalClicks?: number;          // 來自 API 的統計數據
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