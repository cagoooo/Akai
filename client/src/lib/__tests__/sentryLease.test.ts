import { describe, expect, it } from 'vitest';
import { createFirestoreClockSkewClassifier, createFirestoreLeaseClassifier, isFirestoreTabClockJitter } from '../sentry';

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
    const collectGarbage = () => ({ ...event(), message: message.replace('Apply remote event', 'Collect garbage') });
    expect(classify(event())).toBeNull();
    time = 10_000;
    expect(classify(event())).toBeNull();
    time = 20_000;
    const third = classify(collectGarbage());
    expect(third?.level).toBe('error');
    expect(third?.fingerprint).toEqual(['firestore-primary-lease', 'collect-garbage']);
    expect(third?.extra?.leaseOccurrencesInLastMinute).toBe(3);
    expect(third?.message).not.toContain('2026-10-05');
    time = 30_000;
    expect(classify(event())?.level).toBe('error');
    time = 80_000;
    expect(classify(event())).toBeNull();
  });

  it('Apply remote event、Backfill Indexes 與 Collect garbage 共用門檻', () => {
    const classify = createFirestoreLeaseClassifier(() => 0);
    const backfill = () => ({ ...event(), message: message.replace('Apply remote event', 'Backfill Indexes') });
    const collectGarbage = () => ({ ...event(), message: message.replace('Apply remote event', 'Collect garbage') });
    expect(classify(collectGarbage())).toBeNull();
    expect(classify(event())).toBeNull();
    const frequentHandoff = classify(backfill());
    expect(frequentHandoff?.level).toBe('error');
    expect(frequentHandoff?.fingerprint).toEqual(['firestore-primary-lease', 'backfill-indexes']);
    expect(frequentHandoff?.message).toBe("Firestore multi-tab primary lease changed during 'Backfill Indexes'.");
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

describe('Firestore 多分頁時鐘誤差不送進 Sentry', () => {
  // 2026-10-14 JAVASCRIPT-REACT-13 原文：分頁之間只差 1 毫秒
  const future = (ahead: string, now: string) =>
    `[2026-10-14T12:10:45.729Z]  @firebase/firestore: Firestore (12.8.0): Detected an update time that is in the future: ${ahead} > ${now}`;

  it('1 秒以內的分頁時鐘誤差略過', () => {
    expect(isFirestoreTabClockJitter({ logger: 'console', level: 'error', message: future('1791979845730', '1791979845729') })).toBe(true);
    expect(isFirestoreTabClockJitter({ logger: 'console', level: 'error', message: future('1791979846729', '1791979845729') })).toBe(true);
  });

  it('差距超過 1 秒、未處理例外、其他記錄來源或其他訊息照常回報', () => {
    const inputs = [
      { logger: 'console', level: 'error' as const, message: future('1791979846730', '1791979845729') },
      { logger: 'console', level: 'error' as const, message: future('1791979845729', '1791979845729') },
      { logger: 'console', level: 'error' as const, message: future('1791979845730', '1791979845729'), exception: { values: [{ type: 'FirebaseError', value: 'x' }] } },
      { logger: undefined, level: 'error' as const, message: future('1791979845730', '1791979845729') },
      { logger: 'console', level: 'error' as const, message: `${future('1791979845730', '1791979845729')} IndexedDB failed` },
      { logger: 'console', level: 'error' as const, message: '@firebase/firestore: Missing or insufficient permissions.' },
    ];
    for (const input of inputs) expect(isFirestoreTabClockJitter(input)).toBe(false);
  });

  it('差距超過 1 秒時同一頁只回報第一筆並附差距秒數', () => {
    // 2026-10-22 原文：差約 25 秒，同一頁連續記錄
    const classify = createFirestoreClockSkewClassifier();
    const first = classify({ logger: 'console', level: 'error', message: future('1792634259672', '1792634234986') });
    expect(first?.fingerprint).toEqual(['firestore-future-update-time']);
    expect(first?.extra?.clockAheadSeconds).toBe(25);
    expect(classify({ logger: 'console', level: 'error', message: future('1792634261785', '1792634237101') })).toBeNull();
    expect(classify({ logger: 'console', level: 'error', message: future('1791979845730', '1791979845729') })).toBeNull();
  });

  it('其他訊息不受影響', () => {
    const classify = createFirestoreClockSkewClassifier();
    classify({ logger: 'console', level: 'error', message: future('1792634259672', '1792634234986') });
    const other = { logger: 'console', level: 'error' as const, message: '@firebase/firestore: Missing or insufficient permissions.' };
    expect(classify(other)).toBe(other);
  });
});
