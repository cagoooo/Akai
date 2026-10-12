/** Google Chat 卡片的 HTML 欄位只能把外部資料當成文字。 */
export function escapeChatCardText(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]!);
}

/** Chat 純文字有自己的提及語法，不能讓外部資料插入 <users/all>。 */
export function literalChatText(value: unknown): string {
  return String(value ?? '').replace(/</g, '‹').replace(/>/g, '›');
}
