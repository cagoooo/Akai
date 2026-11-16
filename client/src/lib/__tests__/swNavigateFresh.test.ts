import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

/**
 * 2026-11-16：連兩次部署後，按「立即更新」一直拿到瀏覽器快取的舊 HTML，更新提示反覆出現。
 * 鎖住 Service Worker 開頁面時一律帶 no-cache 向伺服器確認，且 301 交回瀏覽器處理。
 */
function loadSw(fetchImpl: (req: Request) => Promise<Response>) {
  const source = readFileSync(path.resolve(__dirname, '../../../public/sw.js'), 'utf8');
  const cacheStore = { put: vi.fn(), match: vi.fn(async () => undefined), delete: vi.fn(), keys: vi.fn(async () => []) };
  const sandbox: Record<string, unknown> = {
    self: { addEventListener: vi.fn(), location: { origin: 'https://cagoooo.github.io', pathname: '/Akai/sw.js', href: 'https://cagoooo.github.io/Akai/sw.js' }, registration: { scope: 'https://cagoooo.github.io/Akai/' }, clients: { claim: vi.fn() }, skipWaiting: vi.fn() },
    caches: { open: vi.fn(async () => cacheStore), match: vi.fn(async () => undefined), keys: vi.fn(async () => []), delete: vi.fn() },
    fetch: vi.fn(fetchImpl),
    Request, Response, Headers, URL, console, setTimeout, clearTimeout, Promise,
  };
  vm.createContext(sandbox);
  vm.runInContext(`${source}\n;globalThis.__navigate = navigateWithFallback;`, sandbox);
  return { navigate: sandbox.__navigate as (r: Request) => Promise<Response>, fetch: sandbox.fetch as ReturnType<typeof vi.fn> };
}

describe('Service Worker 開頁面一律向伺服器確認新版', () => {
  it('送出的請求帶 no-cache 與 manual redirect，網址不變', async () => {
    const { navigate, fetch } = loadSw(async () => new Response('<html>新版</html>', { status: 200 }));
    const res = await navigate(new Request('https://cagoooo.github.io/Akai/?redirect=%2FAkai%2Ftool%2F46%2F'));
    expect(await res.text()).toBe('<html>新版</html>');
    const sent = fetch.mock.calls[0][0] as Request;
    expect(sent.url).toBe('https://cagoooo.github.io/Akai/?redirect=%2FAkai%2Ftool%2F46%2F');
    expect(sent.cache).toBe('no-cache');
    expect(sent.redirect).toBe('manual');
  });
});
