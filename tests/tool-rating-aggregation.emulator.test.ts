import { createRequire } from 'node:module';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { recomputeToolRating, syncToolRatingChange } from '../functions/src/lib/toolRatingAggregation';

// 與 Functions 使用同一份 Admin SDK，避免不同套件副本的 FieldValue 類別不相容。
const requireFunctions = createRequire(new URL('../functions/package.json', import.meta.url));
const adminApp = requireFunctions('firebase-admin/app') as typeof import('firebase-admin/app');
type Database = Parameters<typeof recomputeToolRating>[0];
const adminFirestore = requireFunctions('firebase-admin/firestore') as {
  getFirestore: (app: ReturnType<typeof adminApp.initializeApp>) => Database;
};
const PROJECT_ID = 'akai-rating-aggregation-test';
let app: ReturnType<typeof adminApp.initializeApp>;
let db: Database;

beforeAll(() => {
  const host = process.env.FIRESTORE_EMULATOR_HOST || '';
  if (!/^(?:127\.0\.0\.1|localhost|\[::1\]):\d+$/.test(host)) {
    throw new Error('評分整合測試僅允許本機 Firestore emulator，禁止連正式資料庫');
  }
  app = adminApp.initializeApp({ projectId: PROJECT_ID }, PROJECT_ID);
  db = adminFirestore.getFirestore(app);
  db.settings({ host, ssl: false });
});

beforeEach(async () => {
  // 專案名稱與其他 rules suite 不同；只清除此隔離 emulator 專案。
  await db.recursiveDelete(db.collection('toolReviews'));
  await db.recursiveDelete(db.collection('toolRatings'));
});

afterAll(async () => {
  if (db) await db.terminate();
  if (app) await adminApp.deleteApp(app);
});

async function rating(toolId: number) {
  return (await db.doc(`toolRatings/tool_${toolId}`).get()).data();
}

describe('評分聚合：實際 Firestore emulator 交易', () => {
  it('並行新增從目前評論統計，保留舊欄位並替換損壞的星等 map', async () => {
    await db.doc('toolRatings/tool_1').set({
      toolId: 1, totalReviews: 999, averageRating: 1,
      ratingCounts: { 1: 999, 6: 99 }, legacyLabel: '保留舊欄位',
    });
    await Promise.all([2, 4, 5].map(async (score, index) => {
      const review = { toolId: 1, rating: score, comment: '隔離測試' };
      await db.doc(`toolReviews/create-${index}`).set(review);
      await syncToolRatingChange(db, undefined, review);
    }));
    expect(await rating(1)).toMatchObject({
      toolId: 1, averageRating: 3.7, totalReviews: 3, legacyLabel: '保留舊欄位',
      ratingCounts: { 1: 0, 2: 1, 3: 0, 4: 1, 5: 1 },
    });
    expect(Object.keys((await rating(1))!.ratingCounts).sort()).toEqual(['1', '2', '3', '4', '5']);
  });

  it('並行改分與刪除能收斂，刪除最後一筆歸零', async () => {
    const first = { toolId: 1, rating: 1 };
    const second = { toolId: 1, rating: 4 };
    await db.doc('toolReviews/edit').set(first);
    await db.doc('toolReviews/delete').set(second);
    await recomputeToolRating(db, 1);
    const edited = { toolId: 1, rating: 5 };
    await Promise.all([
      (async () => {
        await db.doc('toolReviews/edit').update({ rating: 5 });
        await syncToolRatingChange(db, first, edited);
      })(),
      (async () => {
        await db.doc('toolReviews/delete').delete();
        await syncToolRatingChange(db, second, undefined);
      })(),
    ]);
    expect(await rating(1)).toMatchObject({ averageRating: 5, totalReviews: 1 });
    await db.doc('toolReviews/edit').delete();
    await syncToolRatingChange(db, edited, undefined);
    expect(await rating(1)).toMatchObject({ averageRating: 0, totalReviews: 0,
      ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
  });

  it('舊新增／改分／刪除事件倒序及重送，不能復活已刪評論或重複加分', async () => {
    const first = { toolId: 1, rating: 1 };
    const edited = { toolId: 1, rating: 5 };
    await db.doc('toolReviews/old').set(first);
    await db.doc('toolReviews/old').update({ rating: 5 });
    await db.doc('toolReviews/old').delete();
    await db.doc('toolReviews/current').set({ toolId: 1, rating: 3 });
    await Promise.all([
      syncToolRatingChange(db, edited, undefined),
      syncToolRatingChange(db, first, edited),
      syncToolRatingChange(db, undefined, first),
    ]);
    expect(await rating(1)).toMatchObject({ averageRating: 3, totalReviews: 1,
      ratingCounts: { 1: 0, 2: 0, 3: 1, 4: 0, 5: 0 } });
    const previousTimestamp = (await rating(1))!.updatedAt;
    await syncToolRatingChange(db, undefined, first);
    expect((await rating(1))!.updatedAt.isEqual(previousTimestamp)).toBe(true);
  });

  it('移動工具只重算兩個相關工具，舊移動事件重送也使用目前狀態', async () => {
    const original = { toolId: 1, rating: 4 };
    const moved = { toolId: 2, rating: 4 };
    await db.doc('toolReviews/moved').set(original);
    await db.doc('toolReviews/stay').set({ toolId: 1, rating: 2 });
    await recomputeToolRating(db, 1);
    await db.doc('toolRatings/tool_3').set({ marker: '不相關工具' });
    await db.doc('toolReviews/moved').update({ toolId: 2 });
    await syncToolRatingChange(db, original, moved);
    expect(await rating(1)).toMatchObject({ averageRating: 2, totalReviews: 1 });
    expect(await rating(2)).toMatchObject({ averageRating: 4, totalReviews: 1 });
    await db.doc('toolReviews/moved').update({ rating: 5 });
    await syncToolRatingChange(db, moved, { toolId: 2, rating: 5 });
    await syncToolRatingChange(db, original, moved);
    expect(await rating(2)).toMatchObject({ averageRating: 5, totalReviews: 1 });
    expect(await rating(3)).toEqual({ marker: '不相關工具' });
  });

  it('無效舊資料不計分，rating失效會扣除；非法工具不建立聚合', async () => {
    await Promise.all([0, 6, 2.5, '5'].map((score, index) =>
      db.doc(`toolReviews/invalid-${index}`).set({ toolId: 1, rating: score })));
    const valid = { toolId: 1, rating: 5 };
    await db.doc('toolReviews/valid').set(valid);
    await syncToolRatingChange(db, undefined, valid);
    expect(await rating(1)).toMatchObject({ averageRating: 5, totalReviews: 1 });
    await db.doc('toolReviews/valid').update({ rating: '5' });
    await syncToolRatingChange(db, valid, { toolId: 1, rating: '5' });
    expect(await rating(1)).toMatchObject({ averageRating: 0, totalReviews: 0 });
    await syncToolRatingChange(db, undefined, { toolId: 100001, rating: 5 });
    expect((await db.doc('toolRatings/tool_100001').get()).exists).toBe(false);
    await expect(recomputeToolRating(db, 0)).rejects.toThrow('工具 ID');
  });

  it('likes 與 comment-only 事件不改聚合，也不自行修復無關歷史統計', async () => {
    const original = { toolId: 1, rating: 4, comment: '原評論', likes: 0 };
    await db.doc('toolReviews/unchanged-score').set(original);
    await db.doc('toolRatings/tool_1').set({ marker: '不應因點讚重寫', totalReviews: 999 });
    await db.doc('toolReviews/unchanged-score').update({ comment: '更新評論', likes: 1 });
    await syncToolRatingChange(db, original, { ...original, comment: '更新評論', likes: 1 });
    expect(await rating(1)).toEqual({ marker: '不應因點讚重寫', totalReviews: 999 });
    expect((await db.doc('toolReviews/unchanged-score').get()).data()?.comment).toBe('更新評論');
  });
});
