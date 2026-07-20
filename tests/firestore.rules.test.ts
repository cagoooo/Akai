import { readFileSync } from 'node:fs';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestContext,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

const PROJECT_ID = 'akai-rules-test';
let env: RulesTestEnvironment;

type Identity = 'unauth' | 'anon' | 'google' | 'admin';
type Permission = 'allow' | 'deny';

const identities: Identity[] = ['unauth', 'anon', 'google', 'admin'];

function context(identity: Identity): RulesTestContext {
  switch (identity) {
    case 'unauth':
      return env.unauthenticatedContext();
    case 'anon':
      return env.authenticatedContext('anon-user', {
        firebase: { sign_in_provider: 'anonymous' },
      });
    case 'google':
      return env.authenticatedContext('google-user', {
        email: 'teacher@example.test',
        firebase: { sign_in_provider: 'google.com' },
      });
    case 'admin':
      return env.authenticatedContext('admin-user', {
        admin: true,
        firebase: { sign_in_provider: 'google.com' },
      });
  }
}

async function expectPermission(
  permission: Permission,
  operation: Promise<unknown>,
): Promise<void> {
  if (permission === 'allow') await assertSucceeds(operation);
  else await assertFails(operation);
}

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  });
});

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (adminContext) => {
    const db = adminContext.firestore();
    await Promise.all([
      setDoc(doc(db, 'analytics', 'recoStats'), { totalClicks: 10 }),
      setDoc(doc(db, 'analytics', 'webVitals', '2026-07-21', 'metric'), { name: 'LCP' }),
      setDoc(doc(db, 'analyticsSnapshots', '2026-07-20'), { createdAt: new Date() }),
      setDoc(doc(db, 'healthCheckRuns', 'existing'), { status: 'ok' }),
      setDoc(doc(db, 'alertSilence', 'existing'), { until: new Date() }),
      setDoc(doc(db, 'toolClickEvents', 'existing'), { toolId: 1 }),
      setDoc(doc(db, 'engagementEvents', 'existing'), { type: 'tool_click' }),
      setDoc(doc(db, 'errorLogs', 'existing'), { level: 'error', message: 'secret' }),
      setDoc(doc(db, 'wishingWell', 'existing'), {
        userId: 'visitor',
        userName: '訪客',
        type: 'suggestion',
        content: '改善建議',
        status: 'pending',
        createdAt: new Date(),
      }),
      setDoc(doc(db, 'visitorStats', 'global'), { totalVisits: 10 }),
      setDoc(doc(db, 'toolUsageStats', '1'), { totalClicks: 20 }),
      setDoc(doc(db, '_analyticsRateLimits', 'existing'), { count: 1 }),
      setDoc(doc(db, '_analyticsEventClaims', 'existing'), { status: 'done' }),
    ]);
  });
});

afterAll(async () => {
  await env.cleanup();
});

describe('公開寫入 schema', () => {
  it.each(identities)('%s 只能建立 pending 且符合白名單的許願', async (identity) => {
    const db = context(identity).firestore();
    await assertSucceeds(
      setDoc(doc(db, 'wishingWell', `valid-${identity}`), {
        userId: identity,
        userName: '測試訪客',
        type: 'suggestion',
        content: '希望增加此功能',
        status: 'pending',
        createdAt: serverTimestamp(),
      }),
    );
    await assertFails(
      setDoc(doc(db, 'wishingWell', `forged-${identity}`), {
        userId: identity,
        userName: '測試訪客',
        type: 'suggestion',
        content: 'x',
        status: 'processed',
        createdAt: serverTimestamp(),
        admin: true,
      }),
    );
  });

  it.each(['anon', 'google', 'admin'] as Identity[])(
    '%s 可建立合規錯誤日誌但不可夾帶額外欄位',
    async (identity) => {
      const db = context(identity).firestore();
      const valid = {
        level: 'error',
        message: '載入失敗',
        stack: 'stack',
        url: 'https://example.test/',
        timestamp: '2026-07-21T00:00:00.000Z',
      };
      await assertSucceeds(setDoc(doc(db, 'errorLogs', `valid-${identity}`), valid));
      await assertFails(
        setDoc(doc(db, 'errorLogs', `forged-${identity}`), { ...valid, admin: true }),
      );
    },
  );

  it('未登入者不可建立錯誤日誌', async () => {
    const db = context('unauth').firestore();
    await assertFails(setDoc(doc(db, 'errorLogs', 'unauth'), { level: 'error', message: 'x' }));
  });
});

describe('敏感集合 CRUD 權限矩陣', () => {
  const serverOnly = [
    ['analytics', 'recoStats', 'analytics', 'new'],
    ['analytics/webVitals/2026-07-21', 'metric', 'analytics/webVitals/2026-07-21', 'new'],
    ['healthCheckRuns', 'existing', 'healthCheckRuns', 'new'],
    ['alertSilence', 'existing', 'alertSilence', 'new'],
    ['toolClickEvents', 'existing', 'toolClickEvents', 'new'],
    ['_analyticsRateLimits', 'existing', '_analyticsRateLimits', 'new'],
    ['_analyticsEventClaims', 'existing', '_analyticsEventClaims', 'new'],
  ] as const;

  it.each(serverOnly)(
    '%s：僅 Admin 可讀，任何 client 身分皆不可寫',
    async (existingCollection, existingId, createCollection, createId) => {
      for (const identity of identities) {
        const db = context(identity).firestore();
        const readPermission: Permission = identity === 'admin' ? 'allow' : 'deny';
        await expectPermission(readPermission, getDoc(doc(db, existingCollection, existingId)));
        await expectPermission(
          'deny',
          setDoc(doc(db, createCollection, `${createId}-${identity}`), { value: 1 }),
        );
        await expectPermission(
          'deny',
          updateDoc(doc(db, existingCollection, existingId), { value: 2 }),
        );
        await expectPermission('deny', deleteDoc(doc(db, existingCollection, existingId)));
      }
    },
  );

  it.each(identities)('analyticsSnapshots：%s 權限符合 Admin-only CRUD', async (identity) => {
    const db = context(identity).firestore();
    const permission: Permission = identity === 'admin' ? 'allow' : 'deny';
    await expectPermission(permission, getDoc(doc(db, 'analyticsSnapshots', '2026-07-20')));
    await expectPermission(
      permission,
      setDoc(doc(db, 'analyticsSnapshots', `new-${identity}`), { value: 1 }),
    );
    await expectPermission(
      permission,
      updateDoc(doc(db, 'analyticsSnapshots', '2026-07-20'), { value: 2 }),
    );
    await expectPermission(permission, deleteDoc(doc(db, 'analyticsSnapshots', '2026-07-20')));
  });

  it.each(identities)('wishingWell：%s 只有 Admin 可讀／更新／刪除', async (identity) => {
    const db = context(identity).firestore();
    const permission: Permission = identity === 'admin' ? 'allow' : 'deny';
    await expectPermission(permission, getDoc(doc(db, 'wishingWell', 'existing')));
    await expectPermission(
      permission,
      updateDoc(doc(db, 'wishingWell', 'existing'), { status: 'processed' }),
    );
    await expectPermission(permission, deleteDoc(doc(db, 'wishingWell', 'existing')));
  });

  it.each(identities)('errorLogs：%s 只有 Admin 可讀／更新／刪除', async (identity) => {
    const db = context(identity).firestore();
    const permission: Permission = identity === 'admin' ? 'allow' : 'deny';
    await expectPermission(permission, getDoc(doc(db, 'errorLogs', 'existing')));
    await expectPermission(
      permission,
      updateDoc(doc(db, 'errorLogs', 'existing'), { message: 'updated' }),
    );
    await expectPermission(permission, deleteDoc(doc(db, 'errorLogs', 'existing')));
  });

  it.each(identities)('engagementEvents：%s 建立與管理權限正確', async (identity) => {
    const db = context(identity).firestore();
    const canCreate: Permission = identity === 'unauth' ? 'deny' : 'allow';
    const canManage: Permission = identity === 'admin' ? 'allow' : 'deny';
    await expectPermission(
      canCreate,
      setDoc(doc(db, 'engagementEvents', `new-${identity}`), { type: 'tool_click' }),
    );
    await expectPermission(canManage, getDoc(doc(db, 'engagementEvents', 'existing')));
    await expectPermission(
      canManage,
      updateDoc(doc(db, 'engagementEvents', 'existing'), { type: 'blog_read' }),
    );
    await expectPermission(canManage, deleteDoc(doc(db, 'engagementEvents', 'existing')));
  });
});

describe('公開統計唯讀', () => {
  it.each(identities)('%s 可讀公開統計但不可直接竄改', async (identity) => {
    const db = context(identity).firestore();
    await assertSucceeds(getDoc(doc(db, 'visitorStats', 'global')));
    await assertSucceeds(getDoc(doc(db, 'toolUsageStats', '1')));
    await assertFails(updateDoc(doc(db, 'visitorStats', 'global'), { totalVisits: 999999 }));
    await assertFails(updateDoc(doc(db, 'toolUsageStats', '1'), { totalClicks: 999999 }));
  });
});
