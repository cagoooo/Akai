export interface VisitorStats {
  totalVisits: number;
  dailyVisits: Record<string, number>;
  lastVisitAt: string | null;
}

export interface ToolUsageStat {
  toolId: number;
  totalClicks: number;
}
