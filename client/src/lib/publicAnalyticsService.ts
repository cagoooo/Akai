/** 公開分析事件統一走受控 callable，client 不直接寫統計集合。 */
import { createSecureRandomId } from './randomId';
import { userInteractionReady } from './userInteraction';

export async function invokePublicAnalytics(payload: Record<string, unknown>): Promise<boolean> {
  await userInteractionReady;
  const firebaseModule = await import('@/lib/firebase');
  if (!await firebaseModule.waitForAppCheck()) return false;
  const { ensureSignedIn, isSignedOutThisSession } = await import('@/lib/authService');
  const user = await ensureSignedIn();
  // 訪客主動登出後本次不再自動匿名登入，統計照設計略過，不當成錯誤回報
  // （2026-11-03 JAVASCRIPT-REACT-1F：登出後切頁，裝置／來源／地區統計各報一次「認證尚未就緒」）
  if (!user && isSignedOutThisSession()) return false;
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
