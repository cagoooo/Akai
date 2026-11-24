#!/usr/bin/env node

/**
 * 產生網站自用的 Noto Sans TC 子集（Akai Sans TC）
 *
 * 為什麼：Google Fonts 依「全體中文常用度」切片，首頁 1,100 多個字要下載 30 多包、~1.7MB，
 *        每到一包整頁重排一次。改成只含本站用字的單一 woff2，一次到位。
 *
 * 產出四個檔，都以字型名稱 'Noto Sans TC' 宣告、unicode-range 互不重疊（依「哪些頁面用到」分片，
 * 頁面只會下載自己用得到的那幾片，字表來自 scripts/fonts/first-screen-chars.txt 與全站用字頻率）：
 *   - akai-sans-tc.woff2      第一片：符號與英數＋首頁第一個畫面用字＋全站頻率最高的字，每頁預載
 *   - akai-sans-tc-2.woff2    第二片：首頁其餘（工具牆等）用字
 *   - akai-sans-tc-3.woff2    第三片：部落格列表用字＋其餘頻率較高的字（工具詳細頁、文章常用字）
 *   - akai-sans-tc-ext.woff2  第四片：剩下的罕見字，瀏覽器遇到才下載
 * 全站十幾處寫死的 'Noto Sans TC' 都不用改。Noto Sans TC 不再向 Google 下載
 * （實測 Google 片段的 unicode-range 還涵蓋 🥇⭐✨ 等 emoji 卻沒有字形，白抓 8 包）。
 * 子集以外的字（使用者留言的罕見字等）由系統中文字型顯示。新增工具或文章後重跑本腳本。
 *
 * 來源字型：Windows 11 內建 C:\Windows\Fonts\NotoSansTC-VF.ttf（SIL OFL 1.1，可子集再散布），
 *          或以環境變數 FONT_SRC 指定。CI 不跑本腳本，產物直接 commit。
 *
 *   npm run subset-web-font
 */

import { readFileSync, writeFileSync, readdirSync, lstatSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';
// subset-font 自帶的 harfbuzz，用來查來源字型實際收錄哪些字
import harfbuzz from 'harfbuzzjs';
import { containedRealPath, selectedFontPath } from './lib/path-safety.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FONT_SRC = selectedFontPath(process.env.FONT_SRC || 'C:/Windows/Fonts/NotoSansTC-VF.ttf');
const FONT_DIR = resolve(ROOT, 'client/public/fonts');
const INDEX_HTML = resolve(ROOT, 'client/index.html');
const MARK_START = '<!-- akai-sans-tc:start（scripts/subset-web-font.mjs 產生，勿手改） -->';
const MARK_END = '<!-- akai-sans-tc:end -->';
const POSTS = resolve(ROOT, 'client/src/blog/posts.ts');
// 文章內文（posts.ts 與由它產生的 blog/bodies/*）歸擴充檔
const SKIP = [/[\\/]blog[\\/]posts\.ts$/, /[\\/]blog[\\/]bodies[\\/]/, /__tests__/, /\.test\.tsx?$/];

if (!existsSync(FONT_SRC)) {
  console.error(`找不到來源字型：${FONT_SRC}（可用 FONT_SRC 指定 Noto Sans TC 可變字型路徑）`);
  process.exit(1);
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const stat = lstatSync(p);
    if (stat.isSymbolicLink()) continue; // 不追蹤來源目錄外連結或循環。
    if (stat.isDirectory()) walk(containedRealPath(ROOT, p), out);
    else if (/\.(tsx?|css|json)$/.test(name) && !SKIP.some((re) => re.test(p))) out.push(p);
  }
  return out;
}

const files = [
  ...walk(resolve(ROOT, 'client/src')),
  resolve(ROOT, 'client/public/api/tools.json'),
  resolve(ROOT, 'client/index.html'),
];

// 每個檔案（或每個工具、每篇文章）算一份文件，統計每個字出現在幾份文件裡（頻率）
const docFreq = new Map();
const addDoc = (text) => {
  const seen = new Set();
  for (const c of text) if (c.codePointAt(0) > 0x7e) seen.add(c);
  for (const c of seen) docFreq.set(c, (docFreq.get(c) || 0) + 1);
  return seen;
};
const collect = (paths, set) => {
  for (const f of paths) {
    for (const c of addDoc(readFileSync(containedRealPath(ROOT, f), 'utf-8'))) set.add(c);
  }
  return set;
};

const chars = new Set(
  // 基本拉丁、全形標點與常用符號，確保中英混排字形一致
  ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~' +
    '，。、：；！？「」『』（）【】《》〈〉…—～·‧・○●◎★☆→←↑↓',
);
collect(files, chars);
const postChars = collect([POSTS], new Set());
// 文章內文：每篇各算一份文件
const BODIES = resolve(ROOT, 'client/src/blog/bodies');
if (existsSync(BODIES)) {
  for (const name of readdirSync(BODIES)) {
    for (const c of addDoc(readFileSync(join(BODIES, name), 'utf-8'))) postChars.add(c);
  }
}
for (const c of postChars) chars.add(c);
// 實際頁面顯示過的字（scripts/capture-first-screen-chars.cjs 擷取）
const SEED_FILE = resolve(ROOT, 'scripts/fonts/first-screen-chars.txt');
// 檔案每行「頁面名:字」：home = 首頁第一個畫面、homeAll = 首頁捲到底、blog = 部落格列表
const seed = { home: new Set(), homeAll: new Set(), blog: new Set() };
if (existsSync(SEED_FILE)) {
  for (const line of readFileSync(SEED_FILE, 'utf-8').split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i > 0 && seed[line.slice(0, i)]) for (const c of line.slice(i + 1)) if (c.codePointAt(0) > 0x7e) seed[line.slice(0, i)].add(c);
  }
}
// 工具資料：每個工具各算一份文件
try {
  const tools = JSON.parse(readFileSync(resolve(ROOT, 'client/public/api/tools.json'), 'utf-8'));
  for (const t of Array.isArray(tools) ? tools : tools.tools || []) {
    addDoc(JSON.stringify(t));
    // 首頁工具牆會顯示的名稱與簡介，歸第二片（捲動才出現，不必擋在第一片）
    for (const field of ['title', 'description']) for (const c of String(t[field] || '')) if (c.codePointAt(0) > 0x7e) seed.homeAll.add(c);
  }
} catch { /* tools.json 讀不到就只用頻率 */ }
const src = readFileSync(FONT_SRC);
const hb = await harfbuzz;
const face = hb.createFace(hb.createBlob(src), 0);
const inFont = new Set(face.collectUnicodes());
face.destroy();
// unicode-range 只能宣告真的有字形的碼位，否則瀏覽器不會再向 Google 那份補字
for (const c of [...chars]) if (!inFont.has(c.codePointAt(0))) chars.delete(c);
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
// 分四片（依「哪些頁面會用到」切，頁面只下載自己需要的片）：
//   第一片 = 英數符號 + 首頁第一個畫面用字 + 全站頻率最高的字（每頁預載，最小）
//   第二片 = 首頁其餘（工具牆等）用字
//   第三片 = 部落格列表用字 + 其餘頻率較高的字（工具詳細頁、文章常用字）
//   第四片 = 罕見字（多半只有文章內文用到）
const TIER1_TOP = 100; // 第一片再補「全站頻率最高的前 N 字」
const TIER3_SIZE = 800; // 第三片字數上限（部落格列表用字超過時以用字為準）
const isIdeograph = (c) => { const n = c.codePointAt(0); return n >= 0x4e00 && n <= 0x9fff; };
const ranked = [...chars].filter((c) => c.codePointAt(0) > 0x7e).sort((a, b) => (docFreq.get(b) || 0) - (docFreq.get(a) || 0) || a.codePointAt(0) - b.codePointAt(0));
const tier1 = new Set([...chars].filter((c) => c.codePointAt(0) <= 0x7e || !isIdeograph(c)));
for (const c of ranked) if (isIdeograph(c) && seed.home.has(c)) tier1.add(c);
for (const c of ranked.filter(isIdeograph).slice(0, TIER1_TOP)) tier1.add(c);
const tier2 = new Set(ranked.filter((c) => !tier1.has(c) && seed.homeAll.has(c)));
const rest = ranked.filter((c) => !tier1.has(c) && !tier2.has(c));
const tier3 = new Set(rest.filter((c) => seed.blog.has(c)));
for (const c of rest) if (tier3.size < TIER3_SIZE) tier3.add(c);
const tier4 = new Set(rest.filter((c) => !tier3.has(c)));
const part1 = await build(tier1, 'akai-sans-tc.woff2');
const part2 = await build(tier2, 'akai-sans-tc-2.woff2');
const part3 = await build(tier3, 'akai-sans-tc-3.woff2');
const part4 = await build(tier4, 'akai-sans-tc-ext.woff2');
// 第一片每頁都用得到，提早預載，字型比文字先到就不會換字
const preload = `<link rel="preload" href="%BASE_URL%fonts/akai-sans-tc.woff2?v=${version}" as="font" type="font/woff2" crossorigin />`;
const block = `${MARK_START}
  ${preload}
  <style>${part1}${part2}${part3}${part4}</style>
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
