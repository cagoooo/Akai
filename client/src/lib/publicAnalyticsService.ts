/** 公開分析事件統一走受控 callable，client 不直接寫統計集合。 */
import { createSecureRandomId } from './randomId';
import { userInteractionReady } from './userInteraction';

export async function invokePublicAnalytics(payload: Record<string, unknown>): Promise<boolean> {
  await userInteractionReady;
  const firebaseModule = await import('@/lib/firebase');
  if (!await firebaseModule.waitForAppCheck()) return false;
  const { ensureSignedIn } = await import('@/lib/authService');
  const user = await ensureSignedIn();
  if (!user) throw new Error('Firebase 認證尚未就緒');

  const { getFunctions, httpsCallable } = await import('firebase/functions');
  const firebaseApp = firebaseModule.default;
  if (!firebaseApp) throw new Error('Firebase 尚未初始化');
  const functions = getFunctions(firebaseApp, 'asia-east1');
  const callable = httpsCallable<Record<string, unknown>, { ok: boolean }>(
    functions,
    'recordPublicAnalytics',
  );
  const eventId = createSecureRandomId();
  if (!eventId) {
    console.warn('無法產生安全事件識別碼，本次雲端統計未送出。');
    return false;
  }
  await callable({ ...payload, eventId });
  return true;
}
