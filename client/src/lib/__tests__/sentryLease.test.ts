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

  it('60 秒內第三陣交接才回報錯誤，同一頁只回報一筆', () => {
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
    expect(third?.extra?.leaseHandoffsInLastMinute).toBe(3);
    expect(third?.message).not.toContain('2026-10-05');
    time = 30_000;
    expect(classify(event())).toBeNull();
    time = 34_000;
    expect(classify(event())).toBeNull();
  });

  it('時間窗過後重新計算：60 秒內只有兩陣不回報', () => {
    let time = 0;
    const classify = createFirestoreLeaseClassifier(() => time);
    expect(classify(event())).toBeNull();
    time = 30_000;
    expect(classify(event())).toBeNull();
    time = 70_000;
    expect(classify(event())).toBeNull();
    time = 85_000;
    expect(classify(event())?.level).toBe('error');
  });

  it('同一瞬間冒出的一串只算一次交接（2026-11-25 JAVASCRIPT-REACT-4 回歸：iPhone 切回分頁 0.17 秒內 8 筆）', () => {
    const times = [650, 676, 702, 730, 753, 767, 788, 804];
    let time = 0;
    const classify = createFirestoreLeaseClassifier(() => time);
    for (const t of times) {
      time = t;
      expect(classify(event())).toBeNull();
    }
    time = 818;
    expect(classify({ ...event(), message: message.replace('Apply remote event', 'Backfill Indexes') })).toBeNull();
    // 一陣裡的訊息彼此相隔不到 2 秒，就算拖得比較長也還是同一陣
    for (let t = 2_000; t <= 9_000; t += 1_500) {
      time = t;
      expect(classify(event())).toBeNull();
    }
  });

  it('真的兩個分頁來回搶（約每 4 秒一陣）照樣回報', () => {
    let time = 0;
    const classify = createFirestoreLeaseClassifier(() => time);
    expect(classify(event())).toBeNull();
    time = 4_000;
    expect(classify(event())).toBeNull();
    time = 8_000;
    expect(classify(event())?.extra?.leaseHandoffsInLastMinute).toBe(3);
  });

  it('Apply remote event、Backfill Indexes 與 Collect garbage 共用門檻', () => {
    let time = 0;
    const classify = createFirestoreLeaseClassifier(() => time);
    const backfill = () => ({ ...event(), message: message.replace('Apply remote event', 'Backfill Indexes') });
    const collectGarbage = () => ({ ...event(), message: message.replace('Apply remote event', 'Collect garbage') });
    expect(classify(collectGarbage())).toBeNull();
    time = 5_000;
    expect(classify(event())).toBeNull();
    time = 10_000;
    const frequentHandoff = classify(backfill());
    expect(frequentHandoff?.level).toBe('error');
    expect(frequentHandoff?.fingerprint).toEqual(['firestore-primary-lease', 'backfill-indexes']);
    expect(frequentHandoff?.message).toBe("Firestore multi-tab primary lease changed during 'Backfill Indexes'.");
  });

  it('Release target 一律不送進 Sentry，也不計入交接門檻', () => {
    let time = 0;
    const classify = createFirestoreLeaseClassifier(() => time);
    const release = () => ({ ...event(), message: message.replace('Apply remote event', 'Release target') });
    for (let i = 0; i < 5; i++) {
      time = i * 5_000;
      expect(classify(release())).toBeNull();
    }
    time = 30_000;
    expect(classify(event())).toBeNull();
    time = 35_000;
    expect(classify(event())).toBeNull();
    time = 40_000;
    expect(classify(event())?.level).toBe('error');
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

  it('1 分鐘以內的時鐘誤差略過', () => {
    expect(isFirestoreTabClockJitter({ logger: 'console', level: 'error', message: future('1791979845730', '1791979845729') })).toBe(true);
    expect(isFirestoreTabClockJitter({ logger: 'console', level: 'error', message: future('1791979846729', '1791979845729') })).toBe(true);
    // 2026-11-19 JAVASCRIPT-REACT-2N 原文：Mac Safari 差 2 秒
    expect(isFirestoreTabClockJitter({ logger: 'console', level: 'error', message: '[2026-11-19T03:23:26.219Z]  @firebase/firestore: Firestore (12.8.0): Detected an update time that is in the future: 1795058608207 > 1795058606218' })).toBe(true);
    // 2026-10-22 差約 25 秒，也只是時鐘漂移
    expect(isFirestoreTabClockJitter({ logger: 'console', level: 'error', message: future('1792634259672', '1792634234986') })).toBe(true);
    expect(isFirestoreTabClockJitter({ logger: 'console', level: 'error', message: future('1791979905729', '1791979845729') })).toBe(true);
  });

  it('差距超過 1 分鐘、未處理例外、其他記錄來源或其他訊息照常回報', () => {
    const inputs = [
      { logger: 'console', level: 'error' as const, message: future('1791979905730', '1791979845729') },
      { logger: 'console', level: 'error' as const, message: future('1791979845729', '1791979845729') },
      { logger: 'console', level: 'error' as const, message: future('1791979845730', '1791979845729'), exception: { values: [{ type: 'FirebaseError', value: 'x' }] } },
      { logger: undefined, level: 'error' as const, message: future('1791979845730', '1791979845729') },
      { logger: 'console', level: 'error' as const, message: `${future('1791979845730', '1791979845729')} IndexedDB failed` },
      { logger: 'console', level: 'error' as const, message: '@firebase/firestore: Missing or insufficient permissions.' },
    ];
    for (const input of inputs) expect(isFirestoreTabClockJitter(input)).toBe(false);
  });

  it('差距超過 1 分鐘時同一頁只回報第一筆、降為 warning 並附差距秒數', () => {
    // 2026-10-22 JAVASCRIPT-REACT-13 原文：差約 458 秒，同一頁連續記錄
    const classify = createFirestoreClockSkewClassifier();
    const first = classify({ logger: 'console', level: 'error', message: future('1792640570278', '1792640111647') });
    expect(first?.fingerprint).toEqual(['firestore-future-update-time']);
    expect(first?.level).toBe('warning');
    expect(first?.extra?.clockAheadSeconds).toBe(459);
    expect(classify({ logger: 'console', level: 'error', message: future('1792640574278', '1792640115647') })).toBeNull();
    // 1 分鐘以內一律略過（例如 2N 的 2 秒）
    expect(createFirestoreClockSkewClassifier()({ logger: 'console', level: 'error', message: future('1795058608207', '1795058606218') })).toBeNull();
    expect(classify({ logger: 'console', level: 'error', message: future('1791979845730', '1791979845729') })).toBeNull();
  });

  it('其他訊息不受影響', () => {
    const classify = createFirestoreClockSkewClassifier();
    classify({ logger: 'console', level: 'error', message: future('1792640570278', '1792640111647') });
    const other = { logger: 'console', level: 'error' as const, message: '@firebase/firestore: Missing or insufficient permissions.' };
    expect(classify(other)).toBe(other);
  });
});
