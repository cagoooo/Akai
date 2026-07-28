/**
 * 訪客里程碑 SSOT（P0-4，2026-07-28）
 *
 * 過去 `BulletinVisitorCounter` 與 `VisitorCounter` 各自維護一份 MILESTONES 且內容不同
 * （前者有 2000／100000，後者沒有），同一個網站會算出不同的「下個里程碑」。這裡統一。
 *
 * 級距設計：讓「下一個里程碑」永遠在看得到的距離內。
 * 舊版 10000 → 50000 是一次跳 5 倍，訪客會在「11% → 12%」這種幾乎不動的區間卡好幾個月，
 * 進度條又會變回「看起來沒在動」——正是 v3.6.99 要解決的體感問題。
 * 因此在 10000 之後補上 20000／30000，讓每一段大致落在可預期的成長區間。
 */
export const VISITOR_MILESTONES: readonly number[] = [
  100, 500, 1000, 2000, 5000, 10000, 20000, 30000, 50000, 100000,
];

const LAST_MILESTONE = VISITOR_MILESTONES[VISITOR_MILESTONES.length - 1];

export interface MilestoneProgress {
  /** 下一個要衝的里程碑（已達成最後一關時等於最後一關） */
  nextMilestone: number;
  /** 已達成的上一個里程碑（尚未達成任何一關時為 0） */
  prevMilestone: number;
  /** 對 nextMilestone 的絕對比例 0–100（不是上一關到下一關的區間比例） */
  progress: number;
  /** 顯示用整數百分比：沒真的達標就不會顯示 100 */
  progressLabel: number;
  /** 還差幾人 */
  remaining: number;
  /** 已達成最後一個里程碑 */
  achievedAll: boolean;
  /** 已達成的里程碑在軌道上的位置（0–100）；沒有或已達成全部時為 null */
  prevMarkerPercent: number | null;
}

/**
 * 算出訪客數對應的里程碑進度。
 *
 * ⚠️ 用「對下個里程碑的絕對比例」而不是「上一關到下一關的區間比例」：
 * 舊版 5,448 人朝 10,000 邁進只顯示 8%（因為算的是 448/5000），
 * 但進度條兩端標的是 5,000 與 10,000，訪客讀到的是「快到一半了」，兩者對不起來。
 */
export function getMilestoneProgress(totalVisits: number): MilestoneProgress {
  const visits = Number.isFinite(totalVisits) && totalVisits > 0 ? totalVisits : 0;
  const achievedAll = visits >= LAST_MILESTONE;
  const nextMilestone = VISITOR_MILESTONES.find((m) => m > visits) ?? LAST_MILESTONE;
  const prevMilestone = [...VISITOR_MILESTONES].reverse().find((m) => m <= visits) ?? 0;

  const progress = achievedAll ? 100 : Math.min(100, Math.max(0, (visits / nextMilestone) * 100));

  return {
    nextMilestone,
    prevMilestone,
    progress,
    progressLabel: achievedAll ? 100 : Math.min(99, Math.round(progress)),
    remaining: Math.max(0, nextMilestone - visits),
    achievedAll,
    prevMarkerPercent:
      !achievedAll && prevMilestone > 0 ? (prevMilestone / nextMilestone) * 100 : null,
  };
}

/**
 * 依最近的成長速度估算還要多久達成下一個里程碑。
 * 把「還差 4,552 人」這種靜態數字變成「大約 2 個月」這種有盼頭的敘事。
 *
 * @param remaining 還差幾人
 * @param visitsPerDay 最近的每日平均訪客數
 * @returns 可直接顯示的字串；資料不足以估算時回傳 null
 */
export function estimateTimeToMilestone(remaining: number, visitsPerDay: number): string | null {
  if (remaining <= 0) return null;
  if (!Number.isFinite(visitsPerDay) || visitsPerDay <= 0) return null;

  const days = Math.ceil(remaining / visitsPerDay);
  if (days <= 1) return '快到了';
  if (days < 14) return `約 ${days} 天`;
  if (days < 60) return `約 ${Math.round(days / 7)} 週`;
  if (days < 365) return `約 ${Math.round(days / 30)} 個月`;
  return '還要一陣子';
}
