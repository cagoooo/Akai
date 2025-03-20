// 定義訪問統計類型
export interface VisitorStats {
  totalVisits: number;
  dailyVisits: Record<string, number>;
}

// 定義工具使用統計類型
export interface ToolUsageStat {
  toolId: number;
  totalClicks: number;
  lastUsedAt: string;
  categoryClicks: Record<string, number>;
}

// 定義API響應類型
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

// 定義工具追蹤響應類型
export interface ToolTrackingResponse {
  toolId: number;
  totalClicks: number;
  achievement?: string | null;
  message?: string;
}
