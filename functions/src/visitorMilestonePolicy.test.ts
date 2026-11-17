import { describe, expect, it } from 'vitest';
import { crossedMilestones } from './lib/visitorMilestonePolicy';

describe('訪客里程碑通知', () => {
  it('從 9,999 變 10,000 時通知一次', () => {
    expect(crossedMilestones(9999, 10000, {})).toEqual([10000]);
  });
  it('還沒到或早就過了都不通知', () => {
    expect(crossedMilestones(9074, 9075, {})).toEqual([]);
    expect(crossedMilestones(10000, 10001, {})).toEqual([]);
  });
  it('已記錄過達成時間就不重發（觸發器重試、重複事件）', () => {
    expect(crossedMilestones(9999, 10000, { '10000': { seconds: 1 } })).toEqual([]);
  });
  it('數字倒退或資料異常不通知；一次跨多關全部列出', () => {
    expect(crossedMilestones(10000, 0, {})).toEqual([]);
    expect(crossedMilestones(undefined, 10000, {})).toEqual([]);
    expect(crossedMilestones(9000, 21000, undefined)).toEqual([10000, 20000]);
  });
});
