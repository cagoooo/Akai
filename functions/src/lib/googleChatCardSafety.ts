/** 只跳脫卡片組裝時的動態資料，保留呼叫端明確建立的 <b>／<pre> 樣式。 */
export function escapeChatCardText(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]!);
}

/** 連結欄位不使用 HTML 編碼；僅接受網頁協定且拒絕含帳密的網址。 */
export function safeChatCardUrl(value: unknown, fallback: string): string {
  try {
    const url = new URL(String(value ?? ''));
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return fallback;
    return url.href;
  } catch {
    return fallback;
  }
}

/**
 * 把瀏覽器回報的頁面網址換成正式站網址。
 * 本機預覽（localhost:9437 等）或其他網域觸發的事件，按鈕若照原網址會開到打不開的頁面，
 * 所以只保留路徑、接到正式站底下（2026-11-16 部落格閱讀通知「開啟文章」開到 localhost）。
 */
export function toPublicSiteUrl(value: unknown, siteBase: string): string {
  const base = new URL(siteBase.endsWith('/') ? siteBase : `${siteBase}/`);
  try {
    const url = new URL(String(value ?? ''));
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return base.href;
    if (url.origin === base.origin) return url.href;
    const basePath = base.pathname.replace(/\/$/, '');
    const path = url.pathname.startsWith(`${basePath}/`) ? url.pathname.slice(basePath.length) : url.pathname;
    return new URL(`${basePath}${path}${url.search}${url.hash}`, base.origin).href;
  } catch {
    return base.href;
  }
}

/** 部落格 slug 只接受英數與連字號，組出正式站文章網址；不合格回傳 null。 */
export function publicBlogUrl(slug: unknown, siteBase: string): string | null {
  const value = String(slug ?? '').trim();
  if (!/^[A-Za-z0-9][A-Za-z0-9-]{0,150}$/.test(value)) return null;
  return `${siteBase.replace(/\/$/, '')}/blog/${value}/`;
}

/** 純文字通知禁止使用者文字插入 <users/all> 等 Chat 連結／提及指令。 */
export function literalChatText(value: unknown): string {
  return String(value ?? '').replace(/</g, '‹').replace(/>/g, '›');
}

/** 保留可判讀的失敗代碼，不把 Axios 請求設定、Webhook 網址或回應內容寫進日誌。 */
export function notificationFailureDetails(error: unknown): { code: string; httpStatus?: number } {
  const failure = error as { code?: unknown; response?: { status?: unknown } } | undefined;
  const codes = ['ECONNABORTED', 'ETIMEDOUT', 'ECONNRESET', 'ENOTFOUND', 'ERR_BAD_REQUEST', 'ERR_BAD_RESPONSE'];
  const code = typeof failure?.code === 'string' && codes.includes(failure.code) ? failure.code : 'CHAT_SEND_FAILED';
  const status = failure?.response?.status;
  return { code, ...(typeof status === 'number' && Number.isInteger(status) && status >= 100 && status <= 599
    ? { httpStatus: status } : {}) };
}
