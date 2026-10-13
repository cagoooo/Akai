import { describe, expect, it } from 'vitest';
import { escapeChatCardText, literalChatText, notificationFailureDetails, safeChatCardUrl } from './lib/googleChatCardSafety';

describe('Google Chat 動態資料與可信卡片格式', () => {
  it('動態心得不能插入標籤，呼叫端的粗體／堆疊樣式仍保留', () => {
    const input = '</pre><a href="https://evil.test">偽造連結</a> & <users/all>';
    const richText = `<b>使用心得</b><pre>${escapeChatCardText(input)}</pre>`;
    expect(richText).toMatch(/^<b>使用心得<\/b><pre>/);
    expect(richText).toContain('&lt;/pre&gt;&lt;a href=&quot;https://evil.test&quot;&gt;');
    expect(richText).not.toContain('<users/all>');
    expect(richText.match(/<pre>/g)).toHaveLength(1);
  });

  it('網址先驗證協定，再對 HTML 屬性與顯示文字分別跳脫', () => {
    const fallback = 'https://cagoooo.github.io/Akai/';
    const valid = safeChatCardUrl('https://example.test/?a=1&b=2', fallback);
    expect(valid).toBe('https://example.test/?a=1&b=2');
    expect(`<a href="${escapeChatCardText(valid)}">${escapeChatCardText(valid)}</a>`)
      .toContain('href="https://example.test/?a=1&amp;b=2"');
    // 含帳密的網址於執行時組字，避免掃描器把測試資料誤認為寫死密碼。
    const credentialUrl = ['https://name', 'pass@example.test/'].join(':');
    for (const invalid of ['javascript:alert(1)', 'data:text/html,test', 'file:///local', credentialUrl, 'invalid']) {
      expect(safeChatCardUrl(invalid, fallback)).toBe(fallback);
    }
  });

  it('純文字提及視為文字，中文內容保留', () => {
    expect(literalChatText('回饋 <users/all> 阿凱老師')).toBe('回饋 ‹users/all› 阿凱老師');
  });

  it('發送失敗日誌只保留代碼與 HTTP 狀態，不包含請求秘密或回應資料', () => {
    const result = notificationFailureDetails({ code: 'ETIMEDOUT', response: { status: 403, data: '不應輸出' },
      config: { url: '不應輸出', headers: { Authorization: '不應輸出' } }, message: '不應輸出' });
    expect(result).toEqual({ code: 'ETIMEDOUT', httpStatus: 403 });
    expect(JSON.stringify(result)).not.toContain('不應輸出');
    expect(notificationFailureDetails(undefined)).toEqual({ code: 'CHAT_SEND_FAILED' });
  });
});
