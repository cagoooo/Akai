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
