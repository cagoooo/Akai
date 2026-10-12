import { describe, expect, it } from 'vitest';
import { createLineShareUrl } from '../blogShare';

describe('文章 LINE 分享目的地與參數邊界', () => {
  it('將惡意文字保留為參數，不改變 HTTPS 目的地或增添參數', () => {
    const page = 'https://cagoooo.github.io/Akai/blog/test?x=%22%3E%3Cscript%3E';
    const title = '文章 &url=javascript:alert(1) "</a><script>攻擊</script>';
    const result = new URL(createLineShareUrl(page, title));
    expect(result.origin + result.pathname).toBe('https://social-plugins.line.me/lineit/share');
    expect([...result.searchParams.keys()]).toEqual(['url', 'text']);
    expect(result.searchParams.get('url')).toBe(page);
    expect(result.searchParams.get('text')).toBe(title);
  });

  it.each(['javascript:alert(1)', 'data:text/html,test', 'file:///tmp/test', 'https://user:password@example.com/', 'not a URL'])('拒絕不適合公開分享的網址 %s', page => {
    expect(createLineShareUrl(page, '測試')).toBe('#');
  });

  it('支援本機 HTTP、限制標題大小並處理不完整 Unicode', () => {
    const local = new URL(createLineShareUrl('http://localhost:5000/blog/test', '甲'.repeat(501)));
    expect(local.searchParams.get('text')).toHaveLength(500);
    expect(local.searchParams.get('url')).toBe('http://localhost:5000/blog/test');
    expect(() => createLineShareUrl('https://example.com/', '\ud800')).not.toThrow();
  });
});
