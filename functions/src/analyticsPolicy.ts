export const ANALYTICS_KINDS = [
  'visitorCount',
  'visitorContext',
  'recommendation',
  'toolIndexQuery',
  'webVital',
] as const;

export type AnalyticsKind = (typeof ANALYTICS_KINDS)[number];

export interface RateLimitPolicy {
  limit: number;
  windowMs: number;
}

export interface RateLimitState {
  count: number;
  windowStartedAtMs: number;
}

export interface RateLimitBucket {
  scope: 'uid' | 'ip';
  identityValue: string;
  useExpandedLimit: boolean;
}

const HOUR_MS = 60 * 60 * 1000;

// 匿名訪客正常使用量保留充足餘裕，但阻止腳本持續灌入聚合數字。
export const RATE_LIMITS: Record<AnalyticsKind, RateLimitPolicy> = {
  visitorCount: { limit: 20, windowMs: HOUR_MS },
  visitorContext: { limit: 80, windowMs: HOUR_MS },
  recommendation: { limit: 600, windowMs: HOUR_MS },
  toolIndexQuery: { limit: 120, windowMs: HOUR_MS },
  webVital: { limit: 120, windowMs: HOUR_MS },
};

export function isAnalyticsKind(value: string): value is AnalyticsKind {
  return (ANALYTICS_KINDS as readonly string[]).includes(value);
}

export function analyticsRateLimitBuckets(
  uid: string,
  ip: string,
  isAdmin: boolean,
): RateLimitBucket[] {
  return [
    { scope: 'uid', identityValue: uid, useExpandedLimit: isAdmin },
    // 共用出口 IP 採較寬額度，但仍獨立限制匿名 UID 輪替攻擊。
    { scope: 'ip', identityValue: ip, useExpandedLimit: true },
  ];
}

export function validateEventId(value: unknown): string | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') throw new Error('invalid event id');
  const eventId = value.trim();
  if (!/^[A-Za-z0-9_-]{16,128}$/.test(eventId)) throw new Error('invalid event id');
  return eventId;
}

export function nextRateLimitState(
  current: RateLimitState | null,
  nowMs: number,
  kind: AnalyticsKind,
  isAdmin: boolean,
): { allowed: boolean; state: RateLimitState; policy: RateLimitPolicy } {
  const base = RATE_LIMITS[kind];
  const policy = { ...base, limit: isAdmin ? base.limit * 10 : base.limit };
  const expired = !current || nowMs - current.windowStartedAtMs >= policy.windowMs;
  const state = expired
    ? { count: 1, windowStartedAtMs: nowMs }
    : { count: current.count + 1, windowStartedAtMs: current.windowStartedAtMs };
  return { allowed: state.count <= policy.limit, state, policy };
}

export function appCheckDecision(
  hasValidToken: boolean,
  enforce: boolean,
): 'allow' | 'monitor-missing' | 'reject' {
  if (hasValidToken) return 'allow';
  return enforce ? 'reject' : 'monitor-missing';
}
