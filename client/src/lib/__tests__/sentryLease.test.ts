import { describe, expect, it } from 'vitest';
import { createFirestoreLeaseClassifier } from '../sentry';

const message = "[2026-10-05T07:06:46.011Z]  @firebase/firestore: Firestore (12.8.0): Failed to obtain primary lease for action 'Apply remote event'.";
const event = () => ({ logger: 'console', level: 'error' as const, message });

describe('Firestore 多分頁交接告警過濾', () => {
  it('正常交接不送進 Sentry', () => {
    const classify = createFirestoreLeaseClassifier();
    const result = classify(event());
    expect(result).toBeNull();
  });

  it('60 秒內第三次交接才回報錯誤；時間窗過後重新忽略', () => {
    let time = 0;
    const classify = createFirestoreLeaseClassifier(() => time);
    expect(classify(event())).toBeNull();
    time = 10_000;
    expect(classify(event())).toBeNull();
    time = 20_000;
    const third = classify(event());
    expect(third?.level).toBe('error');
    expect(third?.fingerprint).toEqual(['firestore-primary-lease', 'apply-remote-event']);
    expect(third?.extra?.leaseOccurrencesInLastMinute).toBe(3);
    expect(third?.message).not.toContain('2026-10-05');
    time = 30_000;
    expect(classify(event())?.level).toBe('error');
    time = 80_000;
    expect(classify(event())).toBeNull();
  });

  it('Apply remote event 與 Backfill Indexes 共用同一個異常頻率門檻', () => {
    const classify = createFirestoreLeaseClassifier(() => 0);
    const backfill = () => ({ ...event(), message: message.replace('Apply remote event', 'Backfill Indexes') });
    expect(classify(event())).toBeNull();
    expect(classify(backfill())).toBeNull();
    expect(classify(backfill())?.message).toBe("Firestore multi-tab primary lease changed during 'Backfill Indexes'.");
  });

  it('不降級未處理例外、其他操作、其他 SDK 或真實同步錯誤', () => {
    const classify = createFirestoreLeaseClassifier();
    const inputs = [
      { ...event(), exception: { values: [{ type: 'FirebaseError', value: message }] } },
      { ...event(), logger: undefined },
      { ...event(), message: message.replace('Apply remote event', 'Commit write') },
      { ...event(), message: message.replace('@firebase/firestore', '@other/library') },
      { ...event(), message: '@firebase/firestore: Missing or insufficient permissions.' },
      { ...event(), message: '@firebase/firestore: INTERNAL ASSERTION FAILED' },
      { ...event(), message: `${message} IndexedDB failed` },
    ];
    for (const input of inputs) {
      expect(classify(input)).toBe(input);
      expect(input.level).toBe('error');
      expect(input.message).not.toBe("Firestore multi-tab primary lease changed during 'Apply remote event'.");
    }
    expect(classify(event())).toBeNull();
  });
});
