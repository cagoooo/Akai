/** 以日曆日期計算，避免把當天 23:59:59 四捨五入成多一天。 */
export function inclusiveCalendarDays(from: Date, to: Date): number {
  const day = (date: Date) => Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.max(1, Math.round((day(to) - day(from)) / 86400000) + 1);
}

/** 相容 callable 的數字文件 ID 與舊版 tool_N；雙文件過渡期按工具合併。 */
export function aggregateToolStats(docs: Array<{ id: string; data: Record<string, unknown> }>) {
  const totals = new Map<number, number>();
  const daily = new Map<number, Record<string, number>>();
  for (const { id, data } of docs) {
    const match = id.match(/^(?:tool_)?(\d+)$/);
    const toolId = typeof data.toolId === 'number' ? data.toolId : match ? Number(match[1]) : NaN;
    if (!Number.isSafeInteger(toolId) || toolId <= 0 || typeof data.totalClicks !== 'number'
      || !Number.isFinite(data.totalClicks) || data.totalClicks < 0) continue;
    totals.set(toolId, (totals.get(toolId) || 0) + data.totalClicks);
    if (data.dailyClicks && typeof data.dailyClicks === 'object') {
      const days = daily.get(toolId) || {};
      for (const [date, clicks] of Object.entries(data.dailyClicks)) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(date) && typeof clicks === 'number' && Number.isFinite(clicks) && clicks > 0) {
          days[date] = (days[date] || 0) + clicks;
        }
      }
      if (Object.keys(days).length) daily.set(toolId, days);
    }
  }
  return { stats: Array.from(totals, ([toolId, totalClicks]) => ({ toolId, totalClicks })), daily };
}
