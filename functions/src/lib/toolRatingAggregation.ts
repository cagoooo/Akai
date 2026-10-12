import { FieldValue, type Firestore } from 'firebase-admin/firestore';
import {
  affectedRatingToolIds,
  aggregateToolRatings,
  isCurrentRatingAggregate,
  validRatingToolId,
  type ReviewRatingFields,
  type ToolRatingAggregate,
} from './toolRatingPolicy';

/**
 * 每工具的聚合文件先讀為共同交易閘門，再查目前評論。
 * 不以事件快照加減，避免重送、亂序或並行覆蓋；也不改評論或觸發通知。
 * 每次讀取限該工具評論。大量評論時應另評估成本，不能改成截斷查詢造成錯分。
 */
export async function recomputeToolRating(db: Firestore, toolId: number): Promise<ToolRatingAggregate> {
  if (!validRatingToolId(toolId)) throw new Error('工具 ID 必須為 1 到 100000 的整數');
  const ratingRef = db.collection('toolRatings').doc(`tool_${toolId}`);
  const reviewsQuery = db.collection('toolReviews').where('toolId', '==', toolId);
  return db.runTransaction(async transaction => {
    const current = await transaction.get(ratingRef);
    const reviews = await transaction.get(reviewsQuery);
    const aggregate = aggregateToolRatings(toolId, reviews.docs.map(review => review.data()));
    if (isCurrentRatingAggregate(current.data(), aggregate)) return aggregate;
    const data = { ...aggregate, updatedAt: FieldValue.serverTimestamp() };
    // update 將 ratingCounts 整個 map 替換，同時保留其餘既有欄位。
    if (current.exists) transaction.update(ratingRef, data);
    else transaction.set(ratingRef, data);
    return aggregate;
  });
}

export async function syncToolRatingChange(
  db: Firestore,
  before: ReviewRatingFields | undefined,
  after: ReviewRatingFields | undefined,
): Promise<void> {
  for (const toolId of affectedRatingToolIds(before, after)) {
    await recomputeToolRating(db, toolId);
  }
}
