import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

test('三個OG產生器使用SHA256快取名並相容舊八碼及新十六碼清理規則，不執行產圖', () => {
  for (const name of ['generate-home-og', 'generate-home-og-heatmap', 'generate-100-celebration-og']) {
    const source = readFileSync(new URL(`../${name}.mjs`, import.meta.url), 'utf8');
    const expression = source.match(/const hash = ([^;\n]+);/)?.[1];
    assert.ok(expression);
    assert.match(expression, /createHash\('sha256'\)/);
    const hash = runInNewContext(expression, { createHash, pngBuffer: Buffer.from('安全快取測試') });
    assert.match(hash, /^[a-f0-9]{16}$/);
    assert.equal(hash, runInNewContext(expression, { createHash, pngBuffer: Buffer.from('安全快取測試') }));
    assert.notEqual(hash, runInNewContext(expression, { createHash, pngBuffer: Buffer.from('不同內容') }));
    const cleanup = source.match(/if \((\/\^og-preview[^\n]+?\/)\.test\(f\)/)?.[1];
    assert.ok(cleanup);
    const pattern = runInNewContext(cleanup);
    const prefix = name === 'generate-home-og' ? 'og-preview-'
      : name === 'generate-home-og-heatmap' ? 'og-preview-heatmap-' : 'og-preview-celebration-100-';
    assert.equal(pattern.test(`${prefix}12345678.png`), true);
    assert.equal(pattern.test(`${prefix}${hash}.png`), true);
    assert.equal(pattern.test(`${prefix}../../../private.png`), false);
    assert.equal(pattern.test(`${prefix}123456789.png`), false);
  }
});

test('版本腳本只傳固定Git argv，不開shell，也不執行版本產生', () => {
  const source = readFileSync(new URL('../bump-sw-version.mjs', import.meta.url), 'utf8');
  const expression = source.match(/gitHash = (execFileSync[^;\n]+);/)?.[1];
  assert.ok(expression);
  const calls = [];
  const value = runInNewContext(expression, {
    ROOT: '/controlled-project',
    execFileSync: (command, args, options) => { calls.push({ command, args: Array.from(args), options }); return 'abcdef1\n'; },
  });
  assert.equal(value, 'abcdef1');
  assert.deepEqual(calls[0].args, ['rev-parse', '--short', 'HEAD']);
  assert.equal(calls[0].command, 'git');
  assert.equal(calls[0].options.shell, false);
});
