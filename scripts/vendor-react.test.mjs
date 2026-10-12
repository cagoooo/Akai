import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const publicRoot = new URL('../client/public/akai-talk-2026/', import.meta.url);
const html = readFileSync(new URL('index.html', publicRoot), 'utf8');

test('演講頁的 React 相依程式由同站提供並核對完整性與授權', () => {
  assert.doesNotMatch(html, /<script[^>]+src=["']https:\/\/unpkg\.com\/react(?:-dom)?@/);
  for (const name of ['react', 'react-dom']) {
    const filename = `vendor/${name}-18.3.1.production.min.js`;
    const source = readFileSync(new URL(filename, publicRoot));
    const expected = createHash('sha384').update(source).digest('base64');
    const tag = html.match(new RegExp(`<script[^>]+src="${filename.replaceAll('.', '\\.') }"[^>]*>`))?.[0];
    assert.ok(tag, `缺少 ${name} 同站引用`);
    assert.ok(tag.includes(`integrity="sha384-${expected}"`), `${name} 指紋不一致`);
    assert.match(source.toString('utf8'), /@license React|React v18\.3\.1/);
    assert.match(readFileSync(new URL(`vendor/LICENSE.${name}`, publicRoot), 'utf8'), /MIT License/);
  }
});
