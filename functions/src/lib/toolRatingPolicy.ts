export type ReviewRatingFields = { toolId?: unknown; rating?: unknown; [field: string]: unknown };
export type RatingCounts = Record<1 | 2 | 3 | 4 | 5, number>;

export interface ToolRatingAggregate {
  toolId: number;
  averageRating: number;
  totalReviews: number;
  ratingCounts: RatingCounts;
}

export function validRatingToolId(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 100000;
}

function validRating(value: unknown): value is 1 | 2 | 3 | 4 | 5 {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 5;
}

/** 事件只決定哪些工具需更新；實際分數一律從當下評論重新計算。 */
export function affectedRatingToolIds(
  before: ReviewRatingFields | undefined,
  after: ReviewRatingFields | undefined,
): number[] {
  if (before && after && before.toolId === after.toolId) {
    const previous = validRating(before.rating) ? before.rating : null;
    const current = validRating(after.rating) ? after.rating : null;
    if (previous === current) return [];
  }
  return [...new Set([before?.toolId, after?.toolId].filter(validRatingToolId))]
    .sort((a, b) => a - b);
}

export function aggregateToolRatings(
  toolId: number,
  reviews: Iterable<ReviewRatingFields>,
): ToolRatingAggregate {
  if (!validRatingToolId(toolId)) throw new Error('工具 ID 必須為 1 到 100000 的整數');
  const ratingCounts: RatingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalReviews = 0;
  let totalScore = 0;
  for (const review of reviews) {
    if (review.toolId !== toolId || !validRating(review.rating)) continue;
    ratingCounts[review.rating] += 1;
    totalReviews += 1;
    totalScore += review.rating;
  }
  return {
    toolId,
    averageRating: totalReviews ? Math.round((totalScore / totalReviews) * 10) / 10 : 0,
    totalReviews,
    ratingCounts,
  };
}

/** 重送且統計相同時不重寫；不接受舊 map 中多出的星等。 */
export function isCurrentRatingAggregate(
  current: Record<string, unknown> | undefined,
  expected: ToolRatingAggregate,
): boolean {
  if (!current || current.toolId !== expected.toolId ||
      current.averageRating !== expected.averageRating || current.totalReviews !== expected.totalReviews) {
    return false;
  }
  const counts = current.ratingCounts;
  if (!counts || typeof counts !== 'object' || Array.isArray(counts)) return false;
  if (Object.keys(counts).length !== 5) return false;
  return Object.entries(expected.ratingCounts).every(([star, count]) =>
    (counts as Record<string, unknown>)[star] === count);
}
