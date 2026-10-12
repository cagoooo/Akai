import { describe, expect, it } from 'vitest';
import {
  affectedRatingToolIds,
  aggregateToolRatings,
  isCurrentRatingAggregate,
  validRatingToolId,
} from './lib/toolRatingPolicy';

describe('工具評分聚合政策', () => {
  it('工具 ID 僅接受數值整數與合法邊界', () => {
    expect(validRatingToolId(1)).toBe(true);
    expect(validRatingToolId(100000)).toBe(true);
    for (const invalid of [0, -1, 100001, 1.5, '1', NaN, Infinity, null]) {
      expect(validRatingToolId(invalid)).toBe(false);
    }
  });

  it('新增、刪除、改分與跨工具移動都涵蓋受影響工具', () => {
    expect(affectedRatingToolIds(undefined, { toolId: 2, rating: 3 })).toEqual([2]);
    expect(affectedRatingToolIds({ toolId: 2, rating: 3 }, undefined)).toEqual([2]);
    expect(affectedRatingToolIds({ toolId: 2, rating: 3 }, { toolId: 2, rating: 5 })).toEqual([2]);
    expect(affectedRatingToolIds({ toolId: 9, rating: 3 }, { toolId: 2, rating: 3 })).toEqual([2, 9]);
  });

  it('likes／comment-only 與同分數跳過，不將兩種無效分數當有效變更', () => {
    expect(affectedRatingToolIds({ toolId: 2, rating: 3 }, { toolId: 2, rating: 3 })).toEqual([]);
    expect(affectedRatingToolIds({ toolId: 2, rating: 'bad' }, { toolId: 2, rating: 0 })).toEqual([]);
    expect(affectedRatingToolIds(undefined, undefined)).toEqual([]);
    expect(affectedRatingToolIds({ toolId: 0, rating: 3 }, { toolId: '2', rating: 5 })).toEqual([]);
  });

  it('合法與無效分數間轉換仍更新原工具', () => {
    expect(affectedRatingToolIds({ toolId: 2, rating: 5 }, { toolId: 2, rating: '5' })).toEqual([2]);
    expect(affectedRatingToolIds({ toolId: 2, rating: 0 }, { toolId: 2, rating: 5 })).toEqual([2]);
  });

  it('只計算相同工具的整數星等，平均保留一位小數', () => {
    const result = aggregateToolRatings(2, [
      { toolId: 2, rating: 2 }, { toolId: 2, rating: 4 }, { toolId: 2, rating: 5 },
      { toolId: 3, rating: 1 }, { toolId: '2', rating: 1 },
      ...[0, 6, 2.5, '5', NaN, Infinity, undefined].map(rating => ({ toolId: 2, rating })),
    ]);
    expect(result).toEqual({ toolId: 2, averageRating: 3.7, totalReviews: 3,
      ratingCounts: { 1: 0, 2: 1, 3: 0, 4: 1, 5: 1 } });
  });

  it('無有效評論時輸出零分與完整星等，無效工具直接拒絕', () => {
    expect(aggregateToolRatings(2, [])).toEqual({ toolId: 2, averageRating: 0, totalReviews: 0,
      ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
    expect(() => aggregateToolRatings(0, [])).toThrow('工具 ID');
  });

  it('重送可略過相同統計，但殘留星等／錯分／缺欄位需要修正', () => {
    const expected = aggregateToolRatings(2, [{ toolId: 2, rating: 5 }]);
    expect(isCurrentRatingAggregate({ ...expected, legacyLabel: '保留' }, expected)).toBe(true);
    expect(isCurrentRatingAggregate({ ...expected, averageRating: 1 }, expected)).toBe(false);
    expect(isCurrentRatingAggregate({ ...expected, ratingCounts: { ...expected.ratingCounts, 6: 99 } }, expected)).toBe(false);
    expect(isCurrentRatingAggregate({ ...expected, ratingCounts: {} }, expected)).toBe(false);
    expect(isCurrentRatingAggregate(undefined, expected)).toBe(false);
  });
});
