import { describe, expect, it } from 'vitest';
import { createFirestoreLeaseClassifier } from '../sentry';

const message = "[2026-10-05T07:06:46.011Z]  @firebase/firestore: Firestore (12.8.0): Failed to obtain primary lease for action 'Apply remote event'.";
const event = () => ({ logger: 'console', level: 'error' as const, message });

describe('Firestore 多分頁交接告警分級', () => {
  it('單次內部訊息保留為警告，移除時間戳造成的重複分組', () => {
    const classify = createFirestoreLeaseClassifier();
    const result = classify(event());
    expect(result.level).toBe('warning');
    expect(result.fingerprint).toEqual(['firestore-primary-lease', 'apply-remote-event']);
    expect(result.extra?.leaseOccurrencesInLastMinute).toBe(1);
    expect(result.message).not.toContain('2026-10-05');
  });

  it('60 秒內反覆發生升級錯誤；時間窗過後恢復警告', () => {
    let time = 0;
    const classify = createFirestoreLeaseClassifier(() => time);
    expect(classify(event()).level).toBe('warning');
    time = 10_000;
    expect(classify(event()).level).toBe('warning');
    time = 20_000;
    expect(classify(event()).level).toBe('error');
    time = 80_000;
    expect(classify(event()).level).toBe('warning');
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
    expect(classify(event()).extra?.leaseOccurrencesInLastMinute).toBe(1);
  });
});
