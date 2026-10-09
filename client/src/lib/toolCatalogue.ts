import type { EducationalTool } from './data';

/**
 * 首頁專用的快取鍵。刻意與全站共用的 ['/api/tools']（完整清單）分開：
 * 輕量清單沒有 detailedDescription，若共用同一個鍵，部落格、#100 搜尋等頁面
 * 會從快取拿到「少一欄」的資料而不自知。
 */
export const HOME_CATALOGUE_QUERY_KEY = ['/api/tools', 'lite'] as const;

/**
 * 載入首頁的工具清單：優先讀輕量版（沒有 detailedDescription，壓縮後約為完整版的 1/4），
 * 找不到時退回完整版，再退回伺服器 API（開發環境）。
 * 長介紹由單張工具頁的 api/tools/<id>.json 提供，不要拿首頁清單當完整資料用。
 */
export async function fetchHomeCatalogue(): Promise<EducationalTool[]> {
  const base = import.meta.env.BASE_URL;
  const version = import.meta.env.VITE_APP_VERSION;
  const sources = [
    `${base}api/tools-lite.json?v=${version}`,
    `${base}api/tools.json?v=${version}`,
    '/api/tools',
  ];
  for (const url of sources) {
    try {
      const response = await fetch(url);
      // 主機把不存在的檔案改回 index.html（SPA 退路）時，狀態碼是 200 但內容不是 JSON
      if (response.ok && !response.headers.get('content-type')?.includes('text/html')) {
        return (await response.json()) as EducationalTool[];
      }
    } catch {
      // 這個來源連不上或內容壞掉，換下一個
    }
  }
  throw new Error('無法獲取工具數據');
}
