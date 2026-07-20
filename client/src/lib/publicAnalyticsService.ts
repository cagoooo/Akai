/** 公開分析事件統一走受控 callable，client 不直接寫統計集合。 */
export async function invokePublicAnalytics(payload: Record<string, unknown>): Promise<void> {
  const { ensureSignedIn } = await import('@/lib/authService');
  const user = await ensureSignedIn();
  if (!user) throw new Error('Firebase 認證尚未就緒');

  const [{ getFunctions, httpsCallable }, firebaseModule] = await Promise.all([
    import('firebase/functions'),
    import('@/lib/firebase'),
  ]);
  const firebaseApp = firebaseModule.default;
  if (!firebaseApp) throw new Error('Firebase 尚未初始化');
  const functions = getFunctions(firebaseApp, 'asia-east1');
  const callable = httpsCallable<Record<string, unknown>, { ok: boolean }>(
    functions,
    'recordPublicAnalytics',
  );
  const eventId =
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}_analytics`;
  await callable({ ...payload, eventId });
}
