import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const html = readFileSync(resolve(process.cwd(), 'client/index.html'), 'utf8');
const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1])
  .find(content => content.includes('var createLink = function'));
if (!script) throw new Error('找不到實際預載初始化程式');

function preloadLinks(pathname: string) {
  const document = new DOMParser().parseFromString('<html><head></head><body></body></html>', 'text/html');
  const window = { location: { hostname: 'cagoooo.github.io', pathname } };
  new Function('window', 'document', 'navigator', script as string)(window, document, {});
  return [...document.querySelectorAll('link[rel="preload"]')].map(link => link.getAttribute('href'));
}

describe('實際首頁預載程式的路徑邊界', () => {
  it('保留首頁、工具詳情與工具索引的合法預載', () => {
    expect(preloadLinks('/Akai/')).toEqual(['/Akai/api/tools-lite.json?v=__AKAI_APP_VERSION__']);
    expect(preloadLinks('/Akai/tool/130/')).toEqual(['/Akai/api/tools/130.json?v=__AKAI_APP_VERSION__']);
    expect(preloadLinks('/Akai/tool/100')).toEqual(['/Akai/api/tools.json?v=__AKAI_APP_VERSION__']);
    expect(preloadLinks('/tool/10')).toEqual(['/api/tools/10.json?v=__AKAI_APP_VERSION__']);
  });

  it.each(['javascript:alert(1)', '../evil', '1?redirect=//evil.example', '1%2f..%2fevil', '9'.repeat(1000)])('拒絕由導覽路徑改變資源目的地：%s', value => {
    expect(preloadLinks('/Akai/tool/' + value)).toEqual([]);
  });
});
