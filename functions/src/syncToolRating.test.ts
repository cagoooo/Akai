import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  db: { marker: '隔離測試資料庫' },
  getFirestore: vi.fn(),
  syncToolRatingChange: vi.fn(),
}));

vi.mock('firebase-admin/firestore', () => ({ getFirestore: mocks.getFirestore }));
vi.mock('./lib/toolRatingAggregation', () => ({ syncToolRatingChange: mocks.syncToolRatingChange }));
vi.mock('firebase-functions/v2/firestore', () => ({
  onDocumentWritten: (options: unknown, handler: unknown) => ({ options, handler }),
}));

import { akai_syncToolRating } from './syncToolRating';

const trigger = akai_syncToolRating as unknown as {
  options: Record<string, unknown>;
  handler: (event: { data?: unknown }) => Promise<void>;
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getFirestore.mockReturnValue(mocks.db);
  mocks.syncToolRatingChange.mockResolvedValue(undefined);
});

describe('工具評分 trigger 接線', () => {
  it('監聽所有評論變動、使用既有區域且失敗重試', () => {
    expect(trigger.options).toEqual({ document: 'toolReviews/{reviewId}', region: 'asia-east1', retry: true,
      maxInstances: 3, concurrency: 1, timeoutSeconds: 60 });
  });

  it('新增與刪除都傳遞正確的缺少文件狀態', async () => {
    const review = { toolId: 2, rating: 4 };
    await trigger.handler({ data: {
      before: { exists: false, data: () => undefined },
      after: { exists: true, data: () => review },
    } });
    expect(mocks.syncToolRatingChange).toHaveBeenLastCalledWith(mocks.db, undefined, review);
    await trigger.handler({ data: {
      before: { exists: true, data: () => review },
      after: { exists: false, data: () => undefined },
    } });
    expect(mocks.syncToolRatingChange).toHaveBeenLastCalledWith(mocks.db, review, undefined);
  });

  it('缺少事件略過，但聚合失敗必須傳回平台重試', async () => {
    await trigger.handler({});
    expect(mocks.getFirestore).not.toHaveBeenCalled();
    mocks.syncToolRatingChange.mockRejectedValueOnce(new Error('交易失敗'));
    await expect(trigger.handler({ data: {
      before: { exists: false }, after: { exists: true, data: () => ({ toolId: 2, rating: 4 }) },
    } })).rejects.toThrow('交易失敗');
  });
});
