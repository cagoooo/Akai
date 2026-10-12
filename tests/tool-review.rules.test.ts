import { readFileSync } from 'node:fs';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  arrayRemove,
  arrayUnion,
  deleteDoc,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

// 獨立測試專案，避免其他規則／聚合測試的 clearFirestore 互相影響。
const PROJECT_ID = 'akai-review-rules-test';
type Identity = 'unauth' | 'anon' | 'google' | 'admin';
const identities: Identity[] = ['unauth', 'anon', 'google', 'admin'];
const authenticated: Identity[] = ['anon', 'google', 'admin'];
let env: RulesTestEnvironment;

function uid(identity: Identity): string {
  return `${identity}-user`;
}

function database(identity: Identity) {
  if (identity === 'unauth') return env.unauthenticatedContext().firestore();
  return env.authenticatedContext(uid(identity), {
    ...(identity === 'admin' ? { admin: true } : {}),
    firebase: { sign_in_provider: identity === 'anon' ? 'anonymous' : 'google.com' },
  }).firestore();
}

function review(userId: string, changes: Record<string, unknown> = {}) {
  return {
    toolId: 1,
    toolTitle: '測試工具',
    userId,
    userName: '測試訪客',
    userPhoto: null,
    rating: 4,
    comment: '合法的使用心得',
    likes: 0,
    likedBy: [],
    createdAt: new Date('2026-10-12T00:00:00.000Z'),
    ...changes,
  };
}

function newReview(identity: Identity, changes: Record<string, unknown> = {}) {
  return review(uid(identity), { createdAt: serverTimestamp(), ...changes });
}

async function seed(id: string, changes: Record<string, unknown> = {}) {
  await env.withSecurityRulesDisabled((context) =>
    setDoc(doc(context.firestore(), 'toolReviews', id), review('author-user', changes)),
  );
}

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  });
});

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await Promise.all([
      setDoc(doc(db, 'toolReviews', 'existing'), review('author-user')),
      setDoc(doc(db, 'toolRatings', 'tool_1'), {
        toolId: 1, averageRating: 4, totalReviews: 1,
        ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 0 },
      }),
      ...authenticated.map((identity) =>
        setDoc(doc(db, 'toolReviews', `own-${identity}`), review(uid(identity))),
      ),
    ]);
  });
});

afterAll(async () => {
  await env?.cleanup();
});

describe('評論新增的欄位與作者驗證', () => {
  it.each(authenticated)('%s 可新增本人評論（匿名身分不變更）', async (identity) => {
    await assertSucceeds(setDoc(doc(database(identity), 'toolReviews', 'new'), newReview(identity)));
  });

  it('未認證不可建立評論', async () => {
    await assertFails(setDoc(doc(database('unauth'), 'toolReviews', 'new'), newReview('unauth')));
  });

  it.each(authenticated)('%s 不可偽造其他作者', async (identity) => {
    await assertFails(setDoc(doc(database(identity), 'toolReviews', 'forged'),
      newReview(identity, { userId: 'someone-else' })));
  });

  it.each([
    ['額外欄位', { admin: true }],
    ['工具零', { toolId: 0 }],
    ['工具超界', { toolId: 100001 }],
    ['工具小數', { toolId: 1.5 }],
    ['工具字串', { toolId: '1' }],
    ['評分零', { rating: 0 }],
    ['評分超界', { rating: 6 }],
    ['評分小數', { rating: 3.5 }],
    ['評分字串', { rating: '4' }],
    ['空心得', { comment: '' }],
    ['空白心得', { comment: ' \n\t ' }],
    ['心得過長', { comment: '文'.repeat(501) }],
    ['作者名過長', { userName: '名'.repeat(81) }],
    ['作者名空白', { userName: '' }],
    ['工具名過長', { toolTitle: '題'.repeat(201) }],
    ['工具名空字串', { toolTitle: '' }],
    ['相片錯誤型別', { userPhoto: 123 }],
    ['相片過長', { userPhoto: 'u'.repeat(501) }],
    ['預灌點讚', { likes: 999 }],
    ['預填名單', { likedBy: ['google-user'] }],
    ['偽造建立時間', { createdAt: new Date(0) }],
    ['預填編輯欄位', { edited: true }],
  ] as [string, Record<string, unknown>][])('拒絕%s', async (_label, changes) => {
    await assertFails(setDoc(doc(database('google'), 'toolReviews', 'invalid'),
      newReview('google', changes)));
  });

  it('必要欄位不可省略', async () => {
    const data = newReview('google');
    const { userId: _userId, ...missingOwner } = data;
    await assertFails(setDoc(doc(database('google'), 'toolReviews', 'invalid'), missingOwner));
  });

  it('允許邊界長度、換行心得與可選照片／標題欄位', async () => {
    const db = database('google');
    await assertSucceeds(setDoc(doc(db, 'toolReviews', 'bounded'), newReview('google', {
      toolId: 100000, rating: 5, comment: `首行\n${'文'.repeat(497)}`,
      userName: '名'.repeat(80), toolTitle: '題'.repeat(200), userPhoto: 'u'.repeat(500),
    })));
    const { userPhoto: _photo, toolTitle: _title, ...withoutOptional } = newReview('google');
    await assertSucceeds(setDoc(doc(db, 'toolReviews', 'optional'), withoutOptional));
  });
});

describe('作者編輯與刪除', () => {
  it.each(authenticated)('%s 可編輯舊評論並新增編輯時間／標記', async (identity) => {
    await assertSucceeds(updateDoc(doc(database(identity), 'toolReviews', `own-${identity}`), {
      comment: '編輯後心得', rating: 5, updatedAt: serverTimestamp(), edited: true,
    }));
  });

  it.each([
    ['改作者', { userId: 'other' }], ['改工具', { toolId: 2 }],
    ['改標題', { toolTitle: '另一工具' }], ['改作者姓名', { userName: '另一作者' }],
    ['改照片', { userPhoto: 'https://example.test/photo' }],
    ['改建立時間', { createdAt: new Date(0) }], ['額外欄位', { extra: true }],
    ['越界評分', { rating: 6 }], ['過長心得', { comment: '文'.repeat(501) }],
    ['偽造編輯時間', { updatedAt: new Date(0) }], ['錯誤編輯標記', { edited: 'true' }],
    ['未編輯標記', { edited: false }], ['夾帶點讚', { likes: 999 }],
  ] as [string, Record<string, unknown>][])('作者也不可%s', async (_label, changes) => {
    await assertFails(updateDoc(doc(database('google'), 'toolReviews', 'own-google'), {
      comment: '合法編輯', updatedAt: serverTimestamp(), edited: true, ...changes,
    }));
  });

  it('作者編輯必須提供伺服器時間與編輯標記', async () => {
    await assertFails(updateDoc(doc(database('google'), 'toolReviews', 'own-google'), { comment: '缺編輯時間' }));
  });

  it.each(identities)('%s 不可編輯／刪除其他人的評論，管理員沒有額外旁路', async (identity) => {
    const ref = doc(database(identity), 'toolReviews', 'existing');
    await assertFails(updateDoc(ref, { comment: '冒名編輯', updatedAt: serverTimestamp(), edited: true }));
    await assertFails(deleteDoc(ref));
  });

  it.each(authenticated)('%s 可刪除本人評論', async (identity) => {
    await assertSucceeds(deleteDoc(doc(database(identity), 'toolReviews', `own-${identity}`)));
  });
});

describe('本人點讚與取消，保留舊計數偏差', () => {
  it.each(authenticated)('%s 可點讚一次及取消，重複操作拒絕', async (identity) => {
    const ref = doc(database(identity), 'toolReviews', 'existing');
    await assertSucceeds(updateDoc(ref, { likes: increment(1), likedBy: arrayUnion(uid(identity)) }));
    await assertFails(updateDoc(ref, { likes: increment(1), likedBy: arrayUnion(uid(identity)) }));
    await assertSucceeds(updateDoc(ref, { likes: increment(-1), likedBy: arrayRemove(uid(identity)) }));
    await assertFails(updateDoc(ref, { likes: increment(-1), likedBy: arrayRemove(uid(identity)) }));
  });

  it('未認證不能點讚', async () => {
    await assertFails(updateDoc(doc(database('unauth'), 'toolReviews', 'existing'), {
      likes: 1, likedBy: ['unauth-user'],
    }));
  });

  it.each([
    ['增加 999 票', { likes: 999, likedBy: ['google-user'] }],
    ['冒用他人 UID', { likes: 1, likedBy: ['other-user'] }],
    ['一次新增兩人', { likes: 1, likedBy: ['google-user', 'other-user'] }],
    ['重複 UID', { likes: 1, likedBy: ['google-user', 'google-user'] }],
    ['點讚夾帶編輯', { likes: 1, likedBy: ['google-user'], comment: '冒名修改' }],
    ['非整數票數', { likes: 1.5, likedBy: ['google-user'] }],
    ['只加票', { likes: 1 }], ['只改名單', { likedBy: ['google-user'] }],
  ] as [string, Record<string, unknown>][])('拒絕%s', async (_label, changes) => {
    await assertFails(updateDoc(doc(database('google'), 'toolReviews', 'existing'), changes));
  });

  it('不可替換或刪除他人 UID，也不可改負數票', async () => {
    await seed('liked', { likes: 1, likedBy: ['other-user'] });
    const ref = doc(database('google'), 'toolReviews', 'liked');
    await assertFails(updateDoc(ref, { likes: 2, likedBy: ['google-user'] }));
    await assertFails(updateDoc(ref, { likes: 0, likedBy: [] }));
    await assertFails(updateDoc(ref, { likes: -1, likedBy: [] }));
  });

  it('舊票數與名單不同步時仍可合法加減一票，不重算既有偏差', async () => {
    await seed('legacy', { likes: 7, likedBy: ['other-user'] });
    const ref = doc(database('google'), 'toolReviews', 'legacy');
    await assertSucceeds(updateDoc(ref, { likes: 8, likedBy: ['other-user', 'google-user'] }));
    await assertSucceeds(updateDoc(ref, { likes: 7, likedBy: ['other-user'] }));
  });

  it('取消舊名單中本人但計數為零的點讚，不可產生負數', async () => {
    await seed('legacy-zero', { likes: 0, likedBy: ['google-user'] });
    await assertFails(updateDoc(doc(database('google'), 'toolReviews', 'legacy-zero'), {
      likes: -1, likedBy: [],
    }));
  });

  it('合法本人點讚才建立舊文件缺漏欄位，不進行批次補寫', async () => {
    await env.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      const { likes: _likes, likedBy: _likedBy, ...withoutBoth } = review('author-user');
      await setDoc(doc(db, 'toolReviews', 'missing-both'), withoutBoth);
      await setDoc(doc(db, 'toolReviews', 'missing-count'), { ...withoutBoth, likedBy: [] });
      await setDoc(doc(db, 'toolReviews', 'missing-list'), { ...withoutBoth, likes: 7 });
    });
    for (const [id, count] of [['missing-both', 1], ['missing-count', 1], ['missing-list', 8]] as const) {
      await assertSucceeds(updateDoc(doc(database('google'), 'toolReviews', id), {
        likes: count, likedBy: ['google-user'],
      }));
    }
  });

  it('非數字或重複舊名單不可覆寫', async () => {
    await env.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, 'toolReviews', 'wrong-type'), review('author-user', { likes: '0' }));
      await setDoc(doc(db, 'toolReviews', 'duplicate'), review('author-user', { likes: 2, likedBy: ['other', 'other'] }));
    });
    for (const id of ['wrong-type', 'duplicate']) {
      await assertFails(updateDoc(doc(database('google'), 'toolReviews', id), { likes: 1, likedBy: ['google-user'] }));
    }
  });
});

describe('公開讀取與禁止前端寫入評分統計', () => {
  it.each(identities)('%s 可讀評論與統計，不能直接新增／修改／刪除統計', async (identity) => {
    const db = database(identity);
    await assertSucceeds(getDoc(doc(db, 'toolReviews', 'existing')));
    await assertSucceeds(getDoc(doc(db, 'toolRatings', 'tool_1')));
    await assertFails(setDoc(doc(db, 'toolRatings', 'tool_2'), { toolId: 2, totalReviews: 999 }));
    await assertFails(updateDoc(doc(db, 'toolRatings', 'tool_1'), { totalReviews: 999 }));
    await assertFails(deleteDoc(doc(db, 'toolRatings', 'tool_1')));
  });
});
