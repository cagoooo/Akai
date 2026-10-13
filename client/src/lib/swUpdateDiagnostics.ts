import { safeDiagnostic } from '@/lib/safeDiagnostic';

/**
 * Chrome 在「更新檢查抓不到 sw.js」時丟的訊息：404、5xx、或不明的網路錯誤。
 * 腳本執行失敗、MIME 錯誤等代表程式本身有問題的訊息不在此列，照常回報。
 */
const SW_SCRIPT_FETCH_FAILURE = new RegExp(
  '^Failed to update a ServiceWorker for scope .+: (?:Not found'
  + '|A bad HTTP response code \\(\\d{3}\\) was received when fetching the script\\.'
  + '|An unknown error occurred when fetching the script\\.)$',
  's',
);

export function isServiceWorkerScriptFetchFailure(error: unknown): boolean {
  return error instanceof Error && SW_SCRIPT_FETCH_FAILURE.test(error.message);
}

interface ReportOptions {
  swUrl?: string;
  fetchImpl?: typeof fetch;
  report?: typeof safeDiagnostic;
}

/**
 * 背景更新檢查失敗時的回報：先確認伺服器上的 sw.js 是否真的有問題。
 * 訪客網路中斷、換版瞬間或 CDN 暫時失靈都會讓單次檢查抓不到 sw.js，3 分鐘後的下一次檢查會自己恢復，不需要告警；
 * 只有伺服器明確回應非 2xx（可能真的少了 sw.js）才回報。
 * SW 只攔截 GET，HEAD 探測直接走網路，不會被 Service Worker 自己的快取蓋過。
 */
export async function reportServiceWorkerUpdateFailure(error: unknown, options: ReportOptions = {}): Promise<void> {
  const {
    swUrl = `${import.meta.env.BASE_URL}sw.js`,
    fetchImpl = (input, init) => fetch(input, init),
    report = safeDiagnostic,
  } = options;

  if (isServiceWorkerScriptFetchFailure(error)) {
    try {
      const response = await fetchImpl(swUrl, { method: 'HEAD', cache: 'no-store' });
      if (response.ok) {
        console.info('[PWA] 更新檢查暫時抓不到 sw.js，重新確認伺服器正常，下次檢查會自動重試');
        return;
      }
    } catch {
      // 連伺服器都連不上＝訪客的網路問題，不是網站的錯
      console.info('[PWA] 更新檢查失敗：目前連不上伺服器，稍後自動重試');
      return;
    }
  }

  report('[PWA] 更新檢查失敗：', error, 'warn');
}
