/** 分享目的地固定，頁面網址與標題只能作為查詢參數。 */
export function createLineShareUrl(pageUrl: string, title: string): string {
  try {
    const page = new URL(pageUrl);
    if (!['https:', 'http:'].includes(page.protocol) || page.username || page.password) return '#';
    const share = new URL('https://social-plugins.line.me/lineit/share');
    share.searchParams.set('url', page.href);
    share.searchParams.set('text', title.slice(0, 500));
    return share.href;
  } catch {
    return '#';
  }
}
