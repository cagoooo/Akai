#!/usr/bin/env node

/**
 * 產出 /geo/ — 給搜尋引擎、AI 助手與教師使用的情境導覽頁。
 *
 * 與 llms.txt 的差異：llms.txt 是機器索引純文字；本頁是可被一般搜尋引擎
 * 索引的靜態 HTML，提供清楚的自然語言需求、站內摘要頁與實際工具網址關係。
 * 所有工具名稱與網址均從 tools.json 讀取，數量與更新日期從 site-stats.json 讀取。
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SITE = 'https://cagoooo.github.io/Akai';
const AUTHOR_URL = 'https://www.smes.tyc.edu.tw/modules/tadnews/page.php?ncsn=11&nsn=16#a5';
const tools = JSON.parse(readFileSync(resolve(ROOT, 'client/public/api/tools.json'), 'utf-8'));
const stats = JSON.parse(readFileSync(resolve(ROOT, 'client/public/api/site-stats.json'), 'utf-8'));
const outputDir = resolve(ROOT, 'client/public/geo');
const outputPath = resolve(outputDir, 'index.html');

const toolById = new Map(tools.map((tool) => [tool.id, tool]));
const displayCount = stats.displayCount || `${Math.floor(tools.length / 10) * 10}+`;
const updatedAt = stats.generatedAt || new Date().toISOString();

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function plain(value) {
  return String(value ?? '')
    .replace(/[`*_>#\[\]()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(value, max = 180) {
  const text = plain(value);
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function getTool(id) {
  const tool = toolById.get(id);
  if (!tool) throw new Error(`tools.json 找不到必要工具 #${id}`);
  return tool;
}

function detailUrl(id) {
  return `${SITE}/tool/${id}/`;
}

function actualUrl(tool) {
  return tool.url?.startsWith('/') ? `${SITE}${tool.url}` : tool.url;
}

const intents = [
  {
    query: '想讓國小學生掃 QR Code 即時投票',
    ids: [3],
    note: '課堂中建立題目，學生掃描 QR Code 即時作答與看結果。',
  },
  {
    query: '想用 AI 產生 PIRLS 閱讀理解題目',
    ids: [4, 87],
    note: '依 PIRLS 四層次產生閱讀理解提問、答案說明與評量素材。',
  },
  {
    query: '想做學校禮堂、專科教室或 IPAD 平板車的場地預約',
    ids: [46],
    note: '將校園多個場地與平板車集中調度，支援節次、衝突分析與通知。',
  },
  {
    query: '想找國小資訊科技課的教學駕駛艙',
    ids: [81],
    note: '從三至六年級資訊科技課程入口，整合教材、互動關卡與評量。',
  },
  {
    query: '想找教師撰寫的開源 React + Firebase 教育工具集',
    ids: [],
    note: '前往 GitHub 查看完整原始碼、建置流程與可自由 fork 的 MIT 專案。',
    external: { label: 'cagoooo/Akai GitHub Repository', url: 'https://github.com/cagoooo/Akai' },
  },
  {
    query: '想找 GitHub Pages 上的 Vite 中文教育網站開源範例',
    ids: [81],
    note: '本專案使用 React、TypeScript、Vite 建置，並以 GitHub Pages 發布。',
    external: { label: '查看 GitHub 原始碼', url: 'https://github.com/cagoooo/Akai' },
  },
];

const cards = intents.map((intent) => {
  const items = intent.ids.map((id) => {
    const tool = getTool(id);
    return {
      id,
      title: tool.title,
      detailUrl: detailUrl(id),
      actualUrl: actualUrl(tool),
      description: truncate(tool.description),
    };
  });
  return { ...intent, items };
});

const itemList = cards.flatMap((card) =>
  card.items.length
    ? card.items.map((item) => ({
        '@type': 'ListItem',
        position: 0,
        name: item.title,
        url: item.detailUrl,
      }))
    : [{ '@type': 'ListItem', position: 0, name: card.external?.label, url: card.external?.url }],
);
itemList.forEach((item, index) => {
  item.position = index + 1;
});

const schema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': `${SITE}/geo/#webpage`,
  name: '阿凱老師教育工具情境索引',
  description: `用自然語言尋找阿凱老師的 ${tools.length} 款（${displayCount}）免費國小教育工具。`,
  url: `${SITE}/geo/`,
  dateModified: updatedAt,
  inLanguage: 'zh-TW',
  isPartOf: { '@id': `${SITE}/#website` },
  about: { '@id': `${SITE}/#organization` },
  author: {
    '@type': 'Person',
    '@id': `${SITE}/#akai`,
    name: '黃凱揚（阿凱老師）',
    sameAs: [AUTHOR_URL, 'https://github.com/cagoooo'],
  },
  mainEntity: {
    '@type': 'ItemList',
    name: '教師情境快速索引',
    numberOfItems: itemList.length,
    itemListElement: itemList,
  },
};

const jsonLd = JSON.stringify(schema).replace(/</g, '\\u003c');
const cardHtml = cards
  .map((card) => {
    const links = card.items
      .map(
        (item) => `
          <li>
            <a href="${escapeHtml(item.detailUrl)}">#${item.id} ${escapeHtml(item.title)}</a>
            <span class="actual">實際工具：<a href="${escapeHtml(item.actualUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.actualUrl)}</a></span>
            <p>${escapeHtml(item.description)}</p>
          </li>`,
      )
      .join('');
    const external = card.external
      ? `<p class="external"><a href="${escapeHtml(card.external.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(card.external.label)} ↗</a></p>`
      : '';
    return `
      <article class="intent-card">
        <h2>${escapeHtml(card.query)}</h2>
        <p class="note">${escapeHtml(card.note)}</p>
        ${links ? `<ul>${links}\n        </ul>` : ''}
        ${external}
      </article>`;
  })
  .join('');

const html = `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>教師情境索引｜阿凱老師 ${escapeHtml(displayCount)} 國小教育工具</title>
  <meta name="description" content="用自然語言尋找阿凱老師的 ${escapeHtml(tools.length)} 款免費國小教育工具：QR Code 即時投票、PIRLS AI 閱讀理解、學校場地預約、資訊科技教學駕駛艙與開源 GitHub 專案。">
  <meta name="author" content="黃凱揚（阿凱老師）">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${SITE}/geo/">
  <link rel="alternate" href="${SITE}/geo/" hreflang="zh-TW">
  <script type="application/ld+json">${jsonLd}</script>
  <style>
    :root { color-scheme: light; font-family: system-ui, -apple-system, "Noto Sans TC", sans-serif; color: #2b2418; background: #f5eddf; }
    body { margin: 0; line-height: 1.7; }
    main { max-width: 960px; margin: 0 auto; padding: 48px 20px 32px; }
    h1 { margin: 0 0 12px; font-size: clamp(28px, 5vw, 46px); line-height: 1.2; }
    .lead { max-width: 760px; margin: 0 0 28px; font-size: 17px; }
    .meta { display: flex; flex-wrap: wrap; gap: 8px 18px; margin: 0 0 28px; color: #67553e; font-size: 14px; }
    .intent-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
    .intent-card { background: #fffaf1; border: 1px solid #d4c2a6; border-radius: 12px; padding: 20px; box-shadow: 3px 3px 0 #d9c7ad; }
    h2 { margin: 0 0 8px; font-size: 20px; line-height: 1.35; }
    .note { margin: 0 0 12px; color: #5f4c35; }
    ul { margin: 0; padding-left: 22px; }
    li { margin: 8px 0; }
    a { color: #8b4a24; font-weight: 700; text-underline-offset: 3px; }
    .actual { display: block; color: #766047; font-size: 13px; overflow-wrap: anywhere; }
    li p { margin: 2px 0 0; color: #67553e; font-size: 14px; }
    .external { margin: 8px 0 0; }
    .sources { margin-top: 30px; padding: 18px 20px; background: #e8f0e7; border-radius: 12px; }
    footer { max-width: 960px; margin: 0 auto; padding: 0 20px 40px; color: #766047; font-size: 14px; }
    @media (max-width: 600px) { main { padding-top: 32px; } .intent-card { padding: 16px; } }
  </style>
</head>
<body>
  <main>
    <p class="meta"><span>桃園市龍潭區石門國民小學</span><span>作者：黃凱揚（阿凱老師）</span><span>${escapeHtml(tools.length)} 款（${escapeHtml(displayCount)}）</span><span>MIT 開源／免費</span></p>
    <h1>教師情境索引</h1>
    <p class="lead">不知道工具名稱也沒關係，從你要解決的教學或校務情境開始。這一頁把自然語言需求連到阿凱老師的站內工具摘要頁、實際使用網址與 GitHub 原始碼，讓教師與 AI 助手都能快速找到可驗證的來源。</p>
    <section class="intent-grid" aria-label="教師情境與對應工具">
${cardHtml}
    </section>
    <section class="sources" aria-labelledby="source-title">
      <h2 id="source-title">機器可讀的完整來源</h2>
      <p><a href="${SITE}/llms.txt">llms.txt 索引版</a>（工具標題、情境與網址） · <a href="${SITE}/llms-full.txt">llms-full.txt 完整版</a>（詳細描述與文章） · <a href="${SITE}/sitemap.xml">sitemap.xml</a>（所有可索引頁面） · <a href="https://github.com/cagoooo/Akai" target="_blank" rel="noopener noreferrer">GitHub 原始碼</a></p>
    </section>
  </main>
  <footer>Made with <span aria-label="愛心">❤️</span> by <a href="${AUTHOR_URL}" target="_blank" rel="noopener noreferrer">阿凱老師</a> · <a href="${SITE}/">回到科技教育創新專區</a></footer>
</body>
</html>
`;

mkdirSync(outputDir, { recursive: true });
// Remove indentation-only lines from interpolated optional sections so the
// generated page passes repository whitespace checks without changing layout.
writeFileSync(outputPath, `${html.replace(/[ \t]+\n/g, '\n').trim()}\n`, 'utf-8');
console.log(`✅ 已生成 ${outputPath}`);
console.log(
  `   - ${tools.length} 款工具、${cards.length} 個教師情境、${itemList.length} 個結構化項目`,
);
console.log(`   - 最後更新：${updatedAt}`);
