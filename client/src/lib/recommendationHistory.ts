/**
 * 推薦歷史（P1-2，2026-07-28）
 *
 * 回訪重問的價值主張是「拿到一批你還沒看過的工具」，但訪客沒辦法一眼看出哪些是新的。
 * 這裡記住上一次推薦給他的工具 id，下一次就能在卡片上標「👀 上次沒看到」，
 * 讓「再點一次」的回報看得見，而不是要訪客自己記得上次看過什麼。
 */
export const RECOMMENDATION_HISTORY_KEY = 'akai_reco_history_v1';

/** 最多記住幾個 id（換一批會累積，避免無限長大） */
const MAX_HISTORY = 60;

/** 上架幾天內算「新工具」（與推薦引擎的 freshness 視窗一致） */
export const FRESH_TOOL_DAYS = 45;

const DAY_MS = 24 * 60 * 60 * 1000;

export function readRecommendationHistory(): ReadonlySet<number> {
  try {
    const raw = localStorage.getItem(RECOMMENDATION_HISTORY_KEY);
    if (!raw) return new Set();
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return new Set();
    return new Set(value.filter((id): id is number => typeof id === 'number' && Number.isInteger(id)));
  } catch {
    return new Set();
  }
}

/** 把這次推薦到的工具併進歷史（保留最近 MAX_HISTORY 個） */
export function rememberRecommendedTools(toolIds: readonly number[]): void {
  if (toolIds.length === 0) return;
  try {
    const merged = Array.from(readRecommendationHistory()).concat(toolIds);
    // 後面的比較新 → 從尾端取，並去重
    const deduped = Array.from(new Set(merged.reverse())).slice(0, MAX_HISTORY).reverse();
    localStorage.setItem(RECOMMENDATION_HISTORY_KEY, JSON.stringify(deduped));
  } catch { /* private mode / quota */ }
}

/** 上架 FRESH_TOOL_DAYS 天內 → 回傳天數；否則 null */
export function freshDays(addedAt: string | undefined, now: Date = new Date()): number | null {
  if (typeof addedAt !== 'string') return null;
  const ts = Date.parse(addedAt);
  if (Number.isNaN(ts)) return null;
  const days = Math.floor((now.getTime() - ts) / DAY_MS);
  if (days < 0 || days >= FRESH_TOOL_DAYS) return null;
  return days;
}

export interface NoveltyBadge {
  label: string;
  kind: 'fresh' | 'unseen';
}

/**
 * 「為什麼這次給你看這個」的新鮮度徽章。
 * 與既有的「為什麼推」徽章（🎯 命中你的需求 / 🔥 熱門排行）並存，兩者回答不同問題。
 */
export function noveltyBadgeFor(
  tool: { id: number; addedAt?: string },
  history: ReadonlySet<number>,
  now: Date = new Date(),
): NoveltyBadge | null {
  const days = freshDays(tool.addedAt, now);
  if (days !== null) {
    return { label: days <= 1 ? '🆕 剛上架' : `🆕 上架 ${days} 天`, kind: 'fresh' };
  }
  // 沒有歷史（第一次用）就不標，否則整排都是「上次沒看到」等於沒資訊
  if (history.size > 0 && !history.has(tool.id)) {
    return { label: '👀 上次沒看到', kind: 'unseen' };
  }
  return null;
}
