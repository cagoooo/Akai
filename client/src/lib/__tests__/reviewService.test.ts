import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from 'firebase/auth';
import { addReview, deleteReview, getReviews, likeReview, unlikeReview, updateReview, subscribeToolRating } from '../reviewService';

const mocks = vi.hoisted(() => ({
  auth: { currentUser: { uid: 'me' } as { uid: string } | null },
  available: true,
  addDoc: vi.fn(), getDoc: vi.fn(), getDocs: vi.fn(), runTransaction: vi.fn(),
  doc: vi.fn(), onSnapshot: vi.fn(), updateDoc: vi.fn(), setDoc: vi.fn(), deleteDoc: vi.fn(),
}));

vi.mock('../firebase', () => ({ db: {}, auth: mocks.auth, isFirebaseAvailable: () => mocks.available }));
vi.mock('firebase/firestore', () => ({
  collection: (_db: unknown, name: string) => ({ path: name }),
  doc: mocks.doc, onSnapshot: mocks.onSnapshot, addDoc: mocks.addDoc, getDoc: mocks.getDoc, getDocs: mocks.getDocs,
  runTransaction: mocks.runTransaction, updateDoc: mocks.updateDoc, setDoc: mocks.setDoc, deleteDoc: mocks.deleteDoc,
  query: (...args: unknown[]) => args, where: (...args: unknown[]) => args,
  orderBy: (...args: unknown[]) => args, limit: (count: number) => count,
  serverTimestamp: () => 'SERVER_TIME',
}));

const user = { uid: 'me', displayName: '阿凱老師', photoURL: null } as User;
let current: Record<string, unknown>;
let exists: boolean;
let updates: Array<{ path: string; data: Record<string, unknown> }>;
let deletions: string[];

function transaction(commit = true) {
  return {
    get: vi.fn(async () => ({ exists: () => exists, data: () => ({ ...current }) })),
    update: vi.fn((ref: { path: string }, data: Record<string, unknown>) => {
      updates.push({ path: ref.path, data });
      if (commit) current = { ...current, ...data };
    }),
    delete: vi.fn((ref: { path: string }) => deletions.push(ref.path)),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.currentUser = { uid: 'me' };
  mocks.available = true;
  current = { userId: 'me', likes: 0, likedBy: [], comment: '舊評論', rating: 4 };
  exists = true;
  updates = [];
  deletions = [];
  mocks.doc.mockImplementation((_db: unknown, name: string, id: string) => ({ path: `${name}/${id}` }));
  mocks.addDoc.mockResolvedValue({ id: 'original-review-id' });
  mocks.runTransaction.mockImplementation(async (_db, callback) => callback(transaction()));
});

describe('評論寫入與後端評分分工', () => {
  it('評論保存立即回原docid，不讀寫或等待評分統計', async () => {
    mocks.getDoc.mockRejectedValue(new Error('統計尚未完成'));
    expect(await addReview(81, user, 5, '  使用心得  ', '工具名稱')).toBe('original-review-id');
    expect(mocks.addDoc).toHaveBeenCalledWith({ path: 'toolReviews' }, expect.objectContaining({
      toolId: 81, userId: 'me', rating: 5, comment: '使用心得', likes: 0, likedBy: [], userPhoto: null,
    }));
    expect(mocks.getDoc).not.toHaveBeenCalled();
    expect(mocks.setDoc).not.toHaveBeenCalled();
    expect(mocks.updateDoc).not.toHaveBeenCalled();
    expect(mocks.runTransaction).not.toHaveBeenCalled();
  });

  it('拒絕非法星等、工具編號、空白及超長評論，不能默默轉換星等', async () => {
    for (const rating of [0, 6, 2.5, NaN, Infinity]) expect(await addReview(1, user, rating, '評論')).toBeNull();
    for (const toolId of [0, 100001, 1.5, NaN]) expect(await addReview(toolId, user, 5, '評論')).toBeNull();
    for (const comment of ['   ', '字'.repeat(501)]) expect(await addReview(1, user, 5, comment)).toBeNull();
    expect(mocks.addDoc).not.toHaveBeenCalled();
  });

  it('不能替他人新增評論；安全截短顯示名稱與工具名稱，超長照片回null', async () => {
    expect(await addReview(1, { ...user, uid: 'other' } as User, 5, '評論')).toBeNull();
    expect(await addReview(1, { ...user, displayName: '名'.repeat(81), photoURL: 'p'.repeat(501) } as User,
      5, '字'.repeat(500), '標'.repeat(201))).toBe('original-review-id');
    expect(mocks.addDoc.mock.calls[0][1]).toMatchObject({ userName: '名'.repeat(80), toolTitle: '標'.repeat(200), userPhoto: null });
  });

  it('讀取評論始終使用Firestore真正docid，不採用資料內偽造id', async () => {
    mocks.getDocs.mockResolvedValue({ forEach: (callback: (doc: unknown) => void) => callback({
      id: 'original-id', data: () => ({ id: 'forged-id', toolId: 1 }),
    }) });
    expect((await getReviews(1))[0].id).toBe('original-id');
  });
});

describe('交易處理本人點讚與舊資料', () => {
  it('重複like或unlike成功但不重複計數／寫入', async () => {
    expect(await likeReview('old-id', 'me')).toBe(true);
    expect(await likeReview('old-id', 'me')).toBe(true);
    expect(current).toMatchObject({ likes: 1, likedBy: ['me'] });
    expect(updates).toHaveLength(1);
    expect(await unlikeReview('old-id', 'me')).toBe(true);
    expect(await unlikeReview('old-id', 'me')).toBe(true);
    expect(current).toMatchObject({ likes: 0, likedBy: [] });
    expect(updates).toHaveLength(2);
    expect(updates.every(({ path }) => path === 'toolReviews/old-id')).toBe(true);
  });

  it('拒絕他人UID或無登入身分，不啟動交易', async () => {
    expect(await likeReview('old-id', 'other')).toBe(false);
    mocks.auth.currentUser = null;
    expect(await unlikeReview('old-id', 'me')).toBe(false);
    expect(mocks.runTransaction).not.toHaveBeenCalled();
  });

  it('交易重試重新讀取並保留其他使用者新加入的點讚', async () => {
    mocks.runTransaction.mockImplementation(async (_db, callback) => {
      await callback(transaction(false));
      current = { ...current, likes: 1, likedBy: ['other'] };
      return callback(transaction());
    });
    expect(await likeReview('old-id', 'me')).toBe(true);
    expect(current).toMatchObject({ likes: 2, likedBy: ['other', 'me'] });
  });

  it('交易重試時本人已加入名單，最後一次不再寫入', async () => {
    mocks.runTransaction.mockImplementation(async (_db, callback) => {
      await callback(transaction(false));
      current = { ...current, likes: 1, likedBy: ['me'] };
      return callback(transaction());
    });
    expect(await likeReview('old-id', 'me')).toBe(true);
    expect(updates).toHaveLength(1); // 只有未提交的第一次嘗試，重試零寫入。
    expect(current).toMatchObject({ likes: 1, likedBy: ['me'] });
  });

  it('只在合法本人like補缺欄，舊likes與名單偏移保留', async () => {
    current = { userId: 'me', comment: '舊資料' };
    expect(await likeReview('legacy-id', 'me')).toBe(true);
    expect(current).toEqual({ userId: 'me', comment: '舊資料', likes: 1, likedBy: ['me'] });
    current = { likes: 9, likedBy: ['other'] };
    expect(await likeReview('legacy-id', 'me')).toBe(true);
    expect(current.likes).toBe(10);
    expect(await unlikeReview('legacy-id', 'me')).toBe(true);
    expect(current.likes).toBe(9);
  });

  it('錯誤型別、重複名單、負數及會產生負數的舊資料不自動覆寫', async () => {
    for (const data of [{ likes: '2', likedBy: [] }, { likes: 1, likedBy: null },
      { likes: 1, likedBy: ['other', 'other'] }, { likes: -1, likedBy: [] }]) {
      current = data;
      expect(await likeReview('legacy-id', 'me')).toBe(false);
    }
    current = { likes: 0, likedBy: ['me'] };
    expect(await unlikeReview('legacy-id', 'me')).toBe(false);
    expect(updates).toHaveLength(0);
  });

  it('不存在的評論或讀取後登出時不寫入', async () => {
    exists = false;
    expect(await likeReview('missing-id', 'me')).toBe(false);
    exists = true;
    mocks.runTransaction.mockImplementation(async (_db, callback) => {
      const tx = transaction();
      tx.get.mockImplementation(async () => { mocks.auth.currentUser = null; return { exists: () => true, data: () => current }; });
      return callback(tx);
    });
    expect(await likeReview('old-id', 'me')).toBe(false);
    expect(updates).toHaveLength(0);
  });
});

describe('原docid與評論擁有者', () => {
  it('非作者不能修改／刪除，作者更新只改指定欄位', async () => {
    current.userId = 'other';
    expect(await updateReview('original-id', { rating: 3 })).toBe(false);
    expect(await deleteReview('original-id')).toBe(false);
    expect(updates).toHaveLength(0);
    expect(deletions).toHaveLength(0);
    current.userId = 'me';
    expect(await updateReview('original-id', { comment: '  更新心得  ', rating: 3 })).toBe(true);
    expect(updates).toEqual([{ path: 'toolReviews/original-id', data: {
      comment: '更新心得', rating: 3, updatedAt: 'SERVER_TIME', edited: true,
    } }]);
    expect(current).toMatchObject({ likes: 0, likedBy: [], userId: 'me' });
    expect(await deleteReview('original-id')).toBe(true);
    expect(deletions).toEqual(['toolReviews/original-id']);
  });

  it('更新不接受超長文字、非法星等或空更新，保留原內容', async () => {
    expect(await updateReview('old-id', { comment: '字'.repeat(501) })).toBe(false);
    expect(await updateReview('old-id', { rating: 4.5 })).toBe(false);
    expect(await updateReview('old-id', {})).toBe(false);
    expect(mocks.runTransaction).not.toHaveBeenCalled();
    expect(current).toMatchObject({ comment: '舊評論', rating: 4 });
  });
});

describe('後端計票即時訂閱', () => {
  it('讀取精準統計文件，後端callback更新資料，解除訂閱且不直寫統計', () => {
    const unsubscribe = vi.fn();
    mocks.onSnapshot.mockReturnValue(unsubscribe);
    const received = vi.fn();
    const stop = subscribeToolRating(81, received);
    expect(mocks.onSnapshot.mock.calls[0][0]).toEqual({ path: 'toolRatings/tool_81' });
    const next = mocks.onSnapshot.mock.calls[0][1];
    const rating = { toolId: 81, totalReviews: 2, averageRating: 4.5 };
    next({ exists: () => true, data: () => rating });
    expect(received).toHaveBeenCalledWith(rating);
    stop();
    expect(unsubscribe).toHaveBeenCalledOnce();
    expect(mocks.updateDoc).not.toHaveBeenCalled();
    expect(mocks.setDoc).not.toHaveBeenCalled();
    expect(mocks.runTransaction).not.toHaveBeenCalled();
  });

  it('訂閱錯誤只回報同步中斷，不輸出null或零分取代舊資料', () => {
    mocks.onSnapshot.mockReturnValue(vi.fn());
    const received = vi.fn();
    const failed = vi.fn();
    subscribeToolRating(81, received, failed);
    mocks.onSnapshot.mock.calls[0][2](new Error('permission-denied'));
    expect(failed).toHaveBeenCalledOnce();
    expect(received).not.toHaveBeenCalled();
  });

  it('無效工具編號與無法啟動訂閱時安全回退', () => {
    const failed = vi.fn();
    const stop = subscribeToolRating(0, vi.fn(), failed);
    expect(mocks.onSnapshot).not.toHaveBeenCalled();
    expect(failed).toHaveBeenCalledOnce();
    expect(() => stop()).not.toThrow();
    mocks.onSnapshot.mockImplementationOnce(() => { throw new Error('unavailable'); });
    expect(() => subscribeToolRating(81, vi.fn(), failed)()).not.toThrow();
    expect(failed).toHaveBeenCalledTimes(2);
  });
});
