import { afterEach, describe, expect, it, vi } from 'vitest';
import { HOME_CATALOGUE_QUERY_KEY, fetchHomeCatalogue } from '../toolCatalogue';
import type { EducationalTool } from '../data';

const tool = { id: 128, title: '石門・校園漫遊' } as EducationalTool;
const json = (body: unknown, init?: ResponseInit) => new Response(JSON.stringify(body), init);
afterEach(() => vi.unstubAllGlobals());

describe('首頁工具清單載入', () => {
  it('優先讀輕量清單，一次請求就夠', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json([tool]));
    vi.stubGlobal('fetch', fetchMock);
    expect(await fetchHomeCatalogue()).toEqual([tool]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain('api/tools-lite.json?v=');
  });

  it('輕量清單不存在時退回完整清單', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response('', { status: 404 }))
      .mockResolvedValueOnce(json([tool]));
    vi.stubGlobal('fetch', fetchMock);
    expect(await fetchHomeCatalogue()).toEqual([tool]);
    expect(fetchMock.mock.calls[1][0]).toContain('api/tools.json?v=');
  });

  it('主機回 index.html（SPA 退路）時視為沒有這個檔案', async () => {
    const html = () => new Response('<html></html>', { headers: { 'content-type': 'text/html' } });
    const fetchMock = vi.fn().mockResolvedValueOnce(html()).mockResolvedValueOnce(json([tool]));
    vi.stubGlobal('fetch', fetchMock);
    expect(await fetchHomeCatalogue()).toEqual([tool]);
    expect(fetchMock.mock.calls[1][0]).toContain('api/tools.json?v=');
  });

  it('前兩個來源連線失敗時，最後退回伺服器 API', async () => {
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(new Response('', { status: 503 }))
      .mockResolvedValueOnce(json([tool]));
    vi.stubGlobal('fetch', fetchMock);
    expect(await fetchHomeCatalogue()).toEqual([tool]);
    expect(fetchMock.mock.calls[2][0]).toBe('/api/tools');
  });

  it('所有來源都失敗時丟出「無法獲取工具數據」', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 503 }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(fetchHomeCatalogue()).rejects.toThrow('無法獲取工具數據');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('快取鍵與完整清單分開，避免其他頁面拿到少一欄的資料', () => {
    expect(HOME_CATALOGUE_QUERY_KEY).not.toEqual(['/api/tools']);
    expect(HOME_CATALOGUE_QUERY_KEY[0]).toBe('/api/tools');
  });
});
