import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadPost } from '../postLoader';

const tool = {
  id: 5,
  title: '測試工具',
  description: '簡短說明',
  detailedDescription: '長介紹第一行\n長介紹第二行',
  category: 'utilities',
  tags: ['標籤甲', '標籤乙'],
  url: 'https://example.test/',
  icon: 'Box',
  addedAt: '2026-01-01',
};
const fetchedUrls = (fetchMock: ReturnType<typeof vi.fn>) => fetchMock.mock.calls.map((call) => String(call[0]));

afterEach(() => vi.unstubAllGlobals());

describe('迷你文章（tool-{id}）載入', () => {
  it('只取單張工具檔，不下載整份完整目錄', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(tool)));
    vi.stubGlobal('fetch', fetchMock);

    const post = await loadPost('tool-5');

    expect(post?.slug).toBe('tool-5');
    expect(post?.body).toContain('長介紹第二行'); // 正文仍含長介紹
    const urls = fetchedUrls(fetchMock);
    expect(urls).toHaveLength(1);
    expect(urls[0]).toContain('/api/tools/5.json');
    expect(urls.some((url) => /\/api\/tools\.json/.test(url))).toBe(false);
  });

  it('舊部署沒有單張檔時，退回完整目錄', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response('', { status: 404 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([tool])));
    vi.stubGlobal('fetch', fetchMock);

    const post = await loadPost('tool-5');

    expect(post?.slug).toBe('tool-5');
    expect(fetchedUrls(fetchMock)[1]).toContain('/api/tools.json');
  });

  it('不存在的工具、伺服器錯誤、舊格式網址都回傳找不到', async () => {
    const missing = vi.fn()
      .mockResolvedValueOnce(new Response('', { status: 404 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([tool])));
    vi.stubGlobal('fetch', missing);
    expect(await loadPost('tool-999')).toBeUndefined();

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 503 })));
    expect(await loadPost('tool-5')).toBeUndefined();

    // 舊格式 tool-{id}-標題：產生的迷你文章 slug 為 tool-5，兩者不符就不顯示
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(tool))));
    expect(await loadPost('tool-5-舊標題')).toBeUndefined();

    // 不是 tool-{id} 格式的網址不會發出任何請求
    const untouched = vi.fn();
    vi.stubGlobal('fetch', untouched);
    expect(await loadPost('not-a-real-post')).toBeUndefined();
    expect(untouched).not.toHaveBeenCalled();
  });
});
