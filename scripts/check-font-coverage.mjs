#!/usr/bin/env node
/**
 * 檢查：全站用字（程式、工具資料、文章）只要來源字型有字形，都必須落在某一片字型的 unicode-range 內，
 * 而且三片之間不重疊。改字型分片之後執行：node scripts/check-font-coverage.mjs
 */
import { readFileSync, readdirSync, lstatSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import harfbuzz from 'harfbuzzjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FONT_SRC = process.env.FONT_SRC || 'C:/Windows/Fonts/NotoSansTC-VF.ttf';
const html = readFileSync(resolve(ROOT, process.env.INDEX_HTML || 'client/index.html'), 'utf-8');
const a = html.indexOf('<!-- akai-sans-tc:start');
const b = html.indexOf('<!-- akai-sans-tc:end');
const block = html.slice(a, b);
const faces = [...block.matchAll(/src:url\([^)]*?fonts\/([\w-]+\.woff2)[^)]*\)[^}]*?unicode-range:([^}]*)\}/g)];
const owner = new Map();
let overlap = 0;
for (const [, file, ranges] of faces) {
  let n = 0;
  for (const r of ranges.split(',')) {
    const [lo, hi = lo] = r.trim().slice(2).split('-').map((x) => parseInt(x, 16));
    for (let cp = lo; cp <= hi; cp++) { if (owner.has(cp)) overlap++; owner.set(cp, file); n++; }
  }
  console.log(`${file}：${n} 個碼位`);
}
console.log(`片數 ${faces.length}，重疊碼位 ${overlap}`);

const walk = (d, o = []) => {
  for (const n of readdirSync(d)) {
    const p = join(d, n); const s = lstatSync(p);
    if (s.isSymbolicLink()) continue;
    if (s.isDirectory()) { if (n !== 'node_modules' && n !== '__tests__') walk(p, o); } else if (/\.(tsx?|css|json|html|txt|md)$/.test(n)) o.push(p);
  }
  return o;
};
const files = [
  ...walk(resolve(ROOT, 'client/src')),
  resolve(ROOT, 'client/public/api/tools.json'),
  resolve(ROOT, 'client/index.html'),
  ...(existsSync(resolve(ROOT, 'client/public/geo/index.html')) ? [resolve(ROOT, 'client/public/geo/index.html')] : []),
  resolve(ROOT, 'scripts/fonts/first-screen-chars.txt'),
];
const used = new Set();
for (const f of files) for (const c of readFileSync(f, 'utf-8')) if (c.codePointAt(0) > 0x7e) used.add(c.codePointAt(0));
const hb = await harfbuzz;
const face = hb.createFace(hb.createBlob(readFileSync(FONT_SRC)), 0);
const inFont = new Set(face.collectUnicodes());
face.destroy();
const missing = [...used].filter((cp) => inFont.has(cp) && !owner.has(cp));
console.log(`掃描 ${files.length} 個檔案，用到 ${used.size} 種非 ASCII 字，其中字型有字形且未被任何分片涵蓋：${missing.length}`);
if (missing.length) { console.log(missing.slice(0, 50).map((c) => String.fromCodePoint(c)).join('')); process.exit(1); }
console.log('OK：沒有缺字');
