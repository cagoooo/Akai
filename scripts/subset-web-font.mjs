#!/usr/bin/env node

/**
 * 產生網站自用的 Noto Sans TC 子集（Akai Sans TC）
 *
 * 為什麼：Google Fonts 依「全體中文常用度」切片，首頁 1,100 多個字要下載 30 多包、~1.7MB，
 *        每到一包整頁重排一次。改成只含本站用字的單一 woff2，一次到位。
 *
 * 產出兩個檔，都以字型名稱 'Noto Sans TC' 宣告、unicode-range 互不重疊：
 *   - akai-sans-tc.woff2      主檔：client/src（不含文章內文）＋ tools.json ＋ index.html 的用字，首頁預載
 *   - akai-sans-tc-ext.woff2  擴充：只有部落格文章內文才用到的字，瀏覽器遇到才下載
 * 全站十幾處寫死的 'Noto Sans TC' 都不用改。Noto Sans TC 不再向 Google 下載
 * （實測 Google 片段的 unicode-range 還涵蓋 🥇⭐✨ 等 emoji 卻沒有字形，白抓 8 包）。
 * 子集以外的字（使用者留言的罕見字等）由系統中文字型顯示。新增工具或文章後重跑本腳本。
 *
 * 來源字型：Windows 11 內建 C:\Windows\Fonts\NotoSansTC-VF.ttf（SIL OFL 1.1，可子集再散布），
 *          或以環境變數 FONT_SRC 指定。CI 不跑本腳本，產物直接 commit。
 *
 *   npm run subset-web-font
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';
// subset-font 自帶的 harfbuzz，用來查來源字型實際收錄哪些字
import harfbuzz from 'harfbuzzjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FONT_SRC = process.env.FONT_SRC || 'C:/Windows/Fonts/NotoSansTC-VF.ttf';
const FONT_DIR = resolve(ROOT, 'client/public/fonts');
const INDEX_HTML = resolve(ROOT, 'client/index.html');
const MARK_START = '<!-- akai-sans-tc:start（scripts/subset-web-font.mjs 產生，勿手改） -->';
const MARK_END = '<!-- akai-sans-tc:end -->';
const POSTS = resolve(ROOT, 'client/src/blog/posts.ts');
const SKIP = [/[\\/]blog[\\/]posts\.ts$/, /__tests__/, /\.test\.tsx?$/];

if (!existsSync(FONT_SRC)) {
  console.error(`找不到來源字型：${FONT_SRC}（可用 FONT_SRC 指定 Noto Sans TC 可變字型路徑）`);
  process.exit(1);
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?|css|json)$/.test(name) && !SKIP.some((re) => re.test(p))) out.push(p);
  }
  return out;
}

const files = [
  ...walk(resolve(ROOT, 'client/src')),
  resolve(ROOT, 'client/public/api/tools.json'),
  resolve(ROOT, 'client/index.html'),
];

const collect = (paths, set) => {
  for (const f of paths) {
    for (const c of readFileSync(f, 'utf-8')) {
      // 所有非 ASCII 字元都收（含 ♡⬅＋ 等符號）；來源字型沒有字形的，下面用 harfbuzz 濾掉
      if (c.codePointAt(0) > 0x7e) set.add(c);
    }
  }
  return set;
};

const chars = new Set(
  // 基本拉丁、全形標點與常用符號，確保中英混排字形一致
  ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~' +
    '，。、：；！？「」『』（）【】《》〈〉…—～·‧・○●◎★☆→←↑↓',
);
collect(files, chars);
const extChars = collect([POSTS], new Set());
for (const c of chars) extChars.delete(c);

const src = readFileSync(FONT_SRC);
const hb = await harfbuzz;
const face = hb.createFace(hb.createBlob(src), 0);
const inFont = new Set(face.collectUnicodes());
face.destroy();
// unicode-range 只能宣告真的有字形的碼位，否則瀏覽器不會再向 Google 那份補字
for (const set of [chars, extChars]) for (const c of [...set]) if (!inFont.has(c.codePointAt(0))) set.delete(c);
const hex = (n) => n.toString(16);
const version = Date.now().toString(36);
async function build(set, file) {
  const out = await subsetFont(src, [...set].join(''), {
    targetFormat: 'woff2',
    variationAxes: { wght: { min: 400, max: 900 } },
  });
  writeFileSync(resolve(FONT_DIR, file), out);
  // unicode-range 只列有字形的碼位，瀏覽器才會精準決定要不要下載這個檔
  const ranges = [];
  for (const cp of [...set].map((c) => c.codePointAt(0)).sort((a, b) => a - b)) {
    const last = ranges.at(-1);
    if (last && cp === last[1] + 1) last[1] = cp;
    else ranges.push([cp, cp]);
  }
  const unicodeRange = ranges.map(([a, b]) => (a === b ? `U+${hex(a)}` : `U+${hex(a)}-${hex(b)}`)).join(',');
  console.log(`${file}：${set.size} 字、${(out.length / 1024).toFixed(1)} KB、${ranges.length} 段 unicode-range`);
  return `@font-face{font-family:'Noto Sans TC';font-style:normal;font-weight:400 900;font-display:swap;src:url(%BASE_URL%fonts/${file}?v=${version}) format('woff2');unicode-range:${unicodeRange}}`;
}
const core = await build(chars, 'akai-sans-tc.woff2');
const ext = await build(extChars, 'akai-sans-tc-ext.woff2');
const block = `${MARK_START}
  <link rel="preload" href="%BASE_URL%fonts/akai-sans-tc.woff2?v=${version}" as="font" type="font/woff2" crossorigin />
  <style>${core}${ext}</style>
  ${MARK_END}`;
const html = readFileSync(INDEX_HTML, 'utf-8');
const i = html.indexOf(MARK_START);
const j = html.indexOf(MARK_END);
if (i < 0 || j < 0) {
  console.error('index.html 找不到 akai-sans-tc 標記，請先在 Google Fonts 連結之後放入起訖標記');
  process.exit(1);
}
writeFileSync(INDEX_HTML, html.slice(0, i) + block + html.slice(j + MARK_END.length));

console.log(`掃描 ${files.length + 1} 個檔案，index.html 已更新 @font-face`);
