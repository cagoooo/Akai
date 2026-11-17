/**
 * 訪客里程碑通知政策（2026-11-17：9,074 人時預先準備破萬）。
 *
 * 只通知「值得慶祝」的大關卡；100～5,000 早已達成，不補發。
 * 級距需與前端 client/src/lib/visitorMilestones.ts 的 VISITOR_MILESTONES 對齊。
 */
export const NOTIFY_VISITOR_MILESTONES: readonly number[] = [10000, 20000, 30000, 50000, 100000];

/**
 * 這次更新跨過了哪些里程碑（before < m ≤ after），且還沒記錄過達成時間。
 * 計數一次只會 +1，但為了重算或手動修正等情況，仍支援一次跨過多關。
 */
export function crossedMilestones(
  before: unknown,
  after: unknown,
  alreadyReached: Record<string, unknown> | undefined,
): number[] {
  const prev = Number(before);
  const next = Number(after);
  if (!Number.isFinite(prev) || !Number.isFinite(next) || next <= prev) return [];
  return NOTIFY_VISITOR_MILESTONES.filter(
    (milestone) => prev < milestone && next >= milestone && !alreadyReached?.[String(milestone)],
  );
}
