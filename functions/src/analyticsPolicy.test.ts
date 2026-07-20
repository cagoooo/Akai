import { describe, expect, it } from 'vitest';
import {
  analyticsRateLimitBuckets,
  appCheckDecision,
  nextRateLimitState,
  validateEventId,
} from './analyticsPolicy';

describe('公開分析安全政策', () => {
  it('同一 IP 即使輪替匿名 UID 仍會共用 IP 限流桶', () => {
    const first = analyticsRateLimitBuckets('anon-a', '203.0.113.10', false);
    const rotated = analyticsRateLimitBuckets('anon-b', '203.0.113.10', false);

    expect(first).toHaveLength(2);
    expect(first[0]).not.toEqual(rotated[0]);
    expect(first[1]).toEqual(rotated[1]);
    expect(first[1]).toMatchObject({ scope: 'ip', useExpandedLimit: true });
  });

  it('App Check monitor 階段會標記缺漏，enforce 階段會拒絕', () => {
    expect(appCheckDecision(false, false)).toBe('monitor-missing');
    expect(appCheckDecision(false, true)).toBe('reject');
    expect(appCheckDecision(true, true)).toBe('allow');
  });

  it('跨 instance 共用的限流狀態到達上限後拒絕，視窗到期後重置', () => {
    const now = Date.UTC(2026, 6, 21);
    let state = null;
    let decision = nextRateLimitState(state, now, 'visitorCount', false);
    state = decision.state;
    expect(decision.allowed).toBe(true);

    for (let i = 1; i < 20; i += 1) {
      decision = nextRateLimitState(state, now + i, 'visitorCount', false);
      state = decision.state;
    }
    expect(decision.allowed).toBe(true);
    expect(nextRateLimitState(state, now + 20, 'visitorCount', false).allowed).toBe(false);
    expect(nextRateLimitState(state, now + 3_600_000, 'visitorCount', false)).toMatchObject({
      allowed: true,
      state: { count: 1 },
    });
  });

  it('只接受長度受限的不可執行 event id，並允許舊版暫時省略', () => {
    expect(validateEventId('018fa8d0-7b2a-7000-8000-0123456789ab')).toBe(
      '018fa8d0-7b2a-7000-8000-0123456789ab',
    );
    expect(validateEventId(undefined)).toBeNull();
    expect(() => validateEventId('short')).toThrow('invalid event id');
    expect(() => validateEventId('<script>alert(1)</script>')).toThrow('invalid event id');
  });
});
