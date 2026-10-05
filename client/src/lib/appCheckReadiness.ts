/** 初始化共享；每次請求仍驗證目前 token（SDK 會重用未過期快取）。 */
export function createAppCheckReadiness(
  bootstrap: () => Promise<() => Promise<string>>,
  engagement: Promise<void>,
) {
  let initialization: ReturnType<typeof bootstrap> | null = null;
  let reportedFailure = false;
  return async (maxWaitMs = 10000): Promise<boolean> => {
    await engagement;
    initialization ??= Promise.resolve().then(bootstrap);
    let timer: ReturnType<typeof setTimeout> | undefined;
    const tokenReady = initialization.then(getToken => getToken()).then(token => Boolean(token)).catch(() => {
      if (!reportedFailure) {
        reportedFailure = true;
        console.info('[App Check] 尚未取得有效驗證，暫不傳送受保護的統計。');
      }
      return false;
    });
    try {
      return await Promise.race([tokenReady, new Promise<boolean>(resolve => {
        timer = setTimeout(() => resolve(false), maxWaitMs);
      })]);
    } finally {
      if (timer !== undefined) clearTimeout(timer);
    }
  };
}
