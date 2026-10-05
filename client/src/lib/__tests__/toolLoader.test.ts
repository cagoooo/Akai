import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadTool } from '../toolLoader';
import type { EducationalTool } from '../data';

const tool = { id: 128, title: '石門・校園漫遊' } as EducationalTool;
afterEach(() => vi.unstubAllGlobals());
describe('single-tool loading', () => {
  it('reuses the home catalogue without requesting any data', async () => {
    const fetchMock = vi.fn(); vi.stubGlobal('fetch', fetchMock);
    expect(await loadTool(128, [tool])).toBe(tool);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('loads only one record for a direct entry', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(tool)));
    vi.stubGlobal('fetch', fetchMock);
    expect(await loadTool(128)).toEqual(tool);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain('/api/tools/128.json?v=');
  });
  it('falls back for deployments missing single-tool files', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response('', {status:404})).mockResolvedValueOnce(new Response(JSON.stringify([tool])));
    vi.stubGlobal('fetch', fetchMock);
    expect(await loadTool(128)).toEqual(tool);
    expect(fetchMock.mock.calls[1][0]).toContain('/api/tools.json?v=');
  });
  it('preserves a server failure for the retry interface', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('', {status:503}));
    vi.stubGlobal('fetch', fetchMock);
    await expect(loadTool(128)).rejects.toThrow('無法獲取工具數據');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it('handles SPA HTML fallbacks for a missing tool file', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response('<html></html>', {headers:{'content-type':'text/html'}})).mockResolvedValueOnce(new Response(JSON.stringify([tool])));
    vi.stubGlobal('fetch', fetchMock);
    expect(await loadTool(999)).toBeNull();
  });
  it('returns missing records as not found', async () => {
    expect(await loadTool(999, [tool])).toBeNull();
  });
});
