import type { ToolUsageStat } from '@/types/analytics';

/** 本機儲存可被修改；只接受有限、非負且不超過安全整數範圍的數值。 */
export function safeCount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value)
    && value >= 0 && value <= Number.MAX_SAFE_INTEGER ? value : 0;
}

export function safePercentage(value: unknown, total: unknown): number {
  const denominator = safeCount(total);
  if (!denominator) return 0;
  return Math.min(100, Math.max(0, (safeCount(value) / denominator) * 100));
}

export function safeCountRecord(value: unknown): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value)
    .filter(([key]) => !['__proto__', 'constructor', 'prototype'].includes(key))
    .map(([key, count]) => [key, safeCount(count)]));
}

/** 同時處理 JSON 損毀與瀏覽器禁止讀取儲存空間。 */
export function readDashboardStorage(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

export function safeToolStats(value: unknown): ToolUsageStat[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry: unknown) => {
    if (!entry || typeof entry !== 'object') return [];
    const { toolId, totalClicks } = entry as Record<string, unknown>;
    if (typeof toolId !== 'number' || !Number.isSafeInteger(toolId) || toolId <= 0) return [];
    return [{ toolId, totalClicks: safeCount(totalClicks) }];
  });
}

export function safeClickData(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.slice(-500).flatMap((entry: unknown) => {
    if (!entry || typeof entry !== 'object') return [];
    const { x, y, timestamp, page } = entry as Record<string, unknown>;
    if (typeof x !== 'number' || !Number.isFinite(x) || x < 0 || x > 100
      || typeof y !== 'number' || !Number.isFinite(y) || y < 0 || y > 100
      || typeof timestamp !== 'number' || safeCount(timestamp) !== timestamp
      || typeof page !== 'string') return [];
    return [{ x, y, timestamp, page: page.slice(0, 2000) }];
  });
}
