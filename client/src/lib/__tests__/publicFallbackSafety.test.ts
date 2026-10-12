import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

const indexHtml = readFileSync(resolve(process.cwd(), 'client/index.html'), 'utf8');
const linkSetter = indexHtml.match(/var setSafeExternalLink = function \(value\) \{[\s\S]*?\n\s*\};/)?.[0];

describe('正式 HTML 備援連結', () => {
  it.each([
    ['https://example.com/tool?next=javascript:alert(1)', 'https://example.com/tool?next=javascript:alert(1)'],
    ['http://localhost:5000/', 'http://localhost:5000/'],
    ['http://127.0.0.1:5000/', 'http://127.0.0.1:5000/'],
    ['http://[::1]:5000/', 'http://[::1]:5000/'],
    ['javascript:alert(1)', 'https://cagoooo.github.io/Akai/'],
    ['data:text/html,<script>alert(1)</script>', 'https://cagoooo.github.io/Akai/'],
    ['http://example.com/', 'https://cagoooo.github.io/Akai/'],
    ['http://localhost.evil.example/', 'https://cagoooo.github.io/Akai/'],
    ['https://[invalid', 'https://cagoooo.github.io/Akai/'],
  ])('對 %s 產生安全備援目的地', (value, expected) => {
    expect(linkSetter).toBeDefined();
    const link = { href: '' };
    runInNewContext(`${linkSetter}\nsetSafeExternalLink(value);`, {
      URL, value, externalLink: link, window: { location: { href: 'https://cagoooo.github.io/Akai/' } },
    });
    expect(link.href).toBe(expected);
  });

  it('安裝失敗頁面不顯示底層錯誤文字', async () => {
    const html = readFileSync(resolve(process.cwd(), 'client/public/install-service-worker.html'), 'utf8');
    const script = html.match(/<script[^>]*>([\s\S]*?)<\/script>/)?.[1];
    const status = { textContent: '' };
    runInNewContext(script!, {
      navigator: { serviceWorker: { register: () => Promise.reject(new Error('private diagnostic token')) } },
      document: { querySelector: () => status },
    });
    await Promise.resolve();
    await Promise.resolve();
    expect(status.textContent).toBe('服務工作器安裝失敗，請稍後重試。');
  });
});
