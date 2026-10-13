#!/usr/bin/env node

/**
 * 產生網站自用的 Noto Serif TC 子集（Akai Serif TC）
 *
 * 為什麼：部落格文章的引言區塊（blockquote）、左側作者拍立得、首頁「最新上架」對話框標題用襯線字型。
 *        原本向 Google Fonts 要 Noto Serif TC，Google 依「全體中文常用度」切成十幾包，
 *        一篇有引言的文章就下載 11 包、約 900KB，而且每到一包整段文字重排一次（CLS）。
 *        改成只含本站用字的自架 woff2，也不再依賴 Google。
 *
 * 產出兩個檔，都以字型名稱 'Noto Serif TC' 宣告、unicode-range 互不重疊（字重範圍同原本 Google 的 500–900）：
 *   - akai-serif-tc.woff2     引言：posts.ts 內所有引言（以 `>` 開頭的行）的用字，約 400KB，只有文章頁用得到
 *   - akai-serif-tc-ui.woff2  介面：寫死使用襯線字型的幾個字（UI_TEXT），約 20KB；
 *                             首頁自動彈出「最新上架」對話框時只需要它，不必下載整份引言字型
 * 全站的 `var(--font-serif)` 與 'Noto Serif TC' 樣式都不用改。
 * 子集以外的字會依字型堆疊退回 'Source Han Serif TC' / 'Songti TC' / serif（系統襯線體）。
 * 新增文章引言或襯線介面文字後，重跑本腳本。
 *
 * 來源字型：Windows 11 內建 C:\Windows\Fonts\NotoSerifTC-VF.ttf（SIL OFL 1.1，可子集再散布），
 *          或以環境變數 SERIF_FONT_SRC 指定。CI 不跑本腳本，產物直接 commit。
 *
 *   npm run subset-serif-font
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';
import harfbuzz from 'harfbuzzjs';
import { containedRealPath, selectedFontPath } from './lib/path-safety.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FONT_SRC = selectedFontPath(process.env.SERIF_FONT_SRC || 'C:/Windows/Fonts/NotoSerifTC-VF.ttf');
const FONT_DIR = resolve(ROOT, 'client/public/fonts');
const INDEX_HTML = resolve(ROOT, 'client/index.html');
const POSTS = resolve(ROOT, 'client/src/blog/posts.ts');
const QUOTE_FILE = 'akai-serif-tc.woff2';
const UI_FILE = 'akai-serif-tc-ui.woff2';
const MARK_START = '<!-- akai-serif-tc:start（scripts/subset-serif-font.mjs 產生，勿手改） -->';
const MARK_END = '<!-- akai-serif-tc:end -->';

// 寫死使用襯線字型的介面文字（其餘襯線文字都來自文章引言）：
//   首頁「最新上架」對話框的標題、左側作者拍立得的預設字首。
const UI_TEXT = ['新上架，來翻翻看。', '凱'];

if (!existsSync(FONT_SRC)) {
  console.error(`找不到來源字型：${FONT_SRC}（可用 SERIF_FONT_SRC 指定 Noto Serif TC 可變字型路徑）`);
  process.exit(1);
}

// 介面檔：UI_TEXT 的每個字（含全形標點）
const uiChars = new Set(UI_TEXT.join(''));

// 引言檔：基本拉丁、全形標點與常用符號（確保中英混排字形一致，含引言裝飾用的彎引號）＋引言用字；扣掉介面檔已有的字
const quoteChars = new Set(
  ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~' +
    '，。、：；！？「」『』（）【】《》〈〉…—～·‧・○●◎★☆→←↑↓“”‘’',
);
const posts = readFileSync(containedRealPath(ROOT, POSTS), 'utf-8');
const quoteLines = posts.split('\n').filter((line) => /^>\s/.test(line));
for (const line of quoteLines) for (const c of line) if (c.codePointAt(0) > 0x7e) quoteChars.add(c);
for (const c of uiChars) quoteChars.delete(c);

const src = readFileSync(FONT_SRC);
const hb = await harfbuzz;
const face = hb.createFace(hb.createBlob(src), 0);
const inFont = new Set(face.collectUnicodes());
face.destroy();
// unicode-range 只能宣告真的有字形的碼位，否則瀏覽器不會再依字型堆疊退回系統字型
for (const set of [uiChars, quoteChars]) for (const c of [...set]) if (!inFont.has(c.codePointAt(0))) set.delete(c);

const hex = (n) => n.toString(16);
const version = Date.now().toString(36);
async function build(set, file) {
  const out = await subsetFont(src, [...set].join(''), {
    targetFormat: 'woff2',
    // 與原本 Google Fonts 請求的 wght@500..900 相同，外觀不變
    variationAxes: { wght: { min: 500, max: 900 } },
  });
  writeFileSync(resolve(FONT_DIR, file), out);
  const ranges = [];
  for (const cp of [...set].map((c) => c.codePointAt(0)).sort((a, b) => a - b)) {
    const last = ranges.at(-1);
    if (last && cp === last[1] + 1) last[1] = cp;
    else ranges.push([cp, cp]);
  }
  const unicodeRange = ranges.map(([a, b]) => (a === b ? `U+${hex(a)}` : `U+${hex(a)}-${hex(b)}`)).join(',');
  console.log(`${file}：${set.size} 字、${(out.length / 1024).toFixed(1)} KB、${ranges.length} 段 unicode-range`);
  return `@font-face{font-family:'Noto Serif TC';font-style:normal;font-weight:500 900;font-display:swap;src:url(%BASE_URL%fonts/${file}?v=${version}) format('woff2');unicode-range:${unicodeRange}}`;
}
const ui = await build(uiChars, UI_FILE);
const quote = await build(quoteChars, QUOTE_FILE);
const block = `${MARK_START}
  <style>${ui}${quote}</style>
  ${MARK_END}`;

let html = readFileSync(INDEX_HTML, 'utf-8');
const i = html.indexOf(MARK_START);
const j = html.indexOf(MARK_END);
if (i >= 0 && j >= 0) {
  html = html.slice(0, i) + block + html.slice(j + MARK_END.length);
} else {
  // 第一次：接在 akai-sans-tc 區塊之後
  const sansEnd = '<!-- akai-sans-tc:end -->';
  const k = html.indexOf(sansEnd);
  if (k < 0) {
    console.error('index.html 找不到 akai-sans-tc 結束標記，無法決定插入位置');
    process.exit(1);
  }
  const at = k + sansEnd.length;
  html = `${html.slice(0, at)}\n  ${block}${html.slice(at)}`;
}
writeFileSync(INDEX_HTML, html);

console.log(`引言 ${quoteLines.length} 行；index.html 已更新 Noto Serif TC 的 @font-face`);
console.log('（Google Fonts 連結裡的 Noto Serif TC 須拿掉，否則仍會向 Google 下載）');
