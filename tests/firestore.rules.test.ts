import { readFileSync } from 'node:fs';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

const PROJECT_ID = 'akai-rules-test';
let env: RulesTestEnvironment;

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
    await setDoc(doc(db, 'analytics', 'recoStats'), { totalClicks: 10 });
    await setDoc(doc(db, 'wishingWell', 'existing'), {
      userId: 'visitor', userName: '訪客', type: 'suggestion', content: '既有許願',
      status: 'pending', createdAt: new Date(),
    });
    await setDoc(doc(db, 'errorLogs', 'existing'), { level: 'error', message: 'secret' });
    await setDoc(doc(db, 'toolUsageStats', '1'), { totalClicks: 20 });
  });
});

afterAll(async () => {
  await env.cleanup();
});

function anonDb() {
  return env.authenticatedContext('anon-user', {
    firebase: { sign_in_provider: 'anonymous' },
  }).firestore();
}

function adminDb() {
  return env.authenticatedContext('admin-user', { admin: true }).firestore();
}

describe('Firestore Admin 權限邊界', () => {
  it('公開訪客只能建立符合白名單的許願', async () => {
    const publicDb = env.unauthenticatedContext().firestore();
    await assertSucceeds(setDoc(doc(publicDb, 'wishingWell', 'valid'), {
      userId: 'anonymous', userName: '熱心老師', type: 'suggestion', content: '希望新增教學工具',
      status: 'pending', createdAt: serverTimestamp(),
    }));
    await assertFails(setDoc(doc(publicDb, 'wishingWell', 'invalid'), {
      userId: 'anonymous', userName: '攻擊者', type: 'suggestion', content: 'x',
      status: 'processed', createdAt: serverTimestamp(), admin: true,
    }));
  });

  it('匿名身分不能讀、改、刪許願，Admin 可以', async () => {
    await assertFails(getDoc(doc(anonDb(), 'wishingWell', 'existing')));
    await assertFails(updateDoc(doc(anonDb(), 'wishingWell', 'existing'), { status: 'processed' }));
    await assertFails(deleteDoc(doc(anonDb(), 'wishingWell', 'existing')));
    await assertSucceeds(getDoc(doc(adminDb(), 'wishingWell', 'existing')));
    await assertSucceeds(updateDoc(doc(adminDb(), 'wishingWell', 'existing'), { status: 'processed' }));
  });

  it('分析資料只有 Admin 可讀，所有 client 都不可直寫', async () => {
    await assertFails(getDoc(doc(anonDb(), 'analytics', 'recoStats')));
    await assertSucceeds(getDoc(doc(adminDb(), 'analytics', 'recoStats')));
    await assertFails(setDoc(doc(anonDb(), 'analytics', 'recoStats'), { totalClicks: 999999 }));
    await assertFails(setDoc(doc(adminDb(), 'analytics', 'recoStats'), { totalClicks: 999999 }));
  });

  it('錯誤日誌可依 schema 建立，但只有 Admin 能讀與管理', async () => {
    await assertSucceeds(setDoc(doc(anonDb(), 'errorLogs', 'new'), {
      level: 'error', message: '畫面載入失敗', stack: 'stack',
      url: 'https://example.test/', timestamp: '2026-07-19T00:00:00.000Z',
    }));
    await assertFails(getDoc(doc(anonDb(), 'errorLogs', 'existing')));
    await assertFails(deleteDoc(doc(anonDb(), 'errorLogs', 'existing')));
    await assertSucceeds(getDoc(doc(adminDb(), 'errorLogs', 'existing')));
  });

  it('工具與訪客統計不允許 client 直接竄改', async () => {
    await assertFails(updateDoc(doc(anonDb(), 'toolUsageStats', '1'), { totalClicks: 999999 }));
    await assertFails(setDoc(doc(anonDb(), 'visitorStats', 'global'), { totalVisits: 999999 }));
  });
});
