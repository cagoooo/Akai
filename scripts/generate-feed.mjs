#!/usr/bin/env node

/**
 * 產 RSS / Atom feed（client/public/feed.xml）
 *
 * 內容：最新 25 個工具 + 5 篇 blog post，按日期倒序
 * 用途：教師 / 教育圈訂閱者用 RSS reader（如 Feedly / Inoreader）追蹤新內容
 *
 * 接入：
 *   - package.json build pipeline
 *   - client/index.html 加 <link rel="alternate" type="application/rss+xml">
 *
 * 規格：RSS 2.0（最廣為支援，比 Atom 普及）
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SITE_URL = 'https://cagoooo.github.io/Akai';
const OUT = resolve(ROOT, 'client', 'public', 'feed.xml');
const TOOLS_JSON = resolve(ROOT, 'client', 'public', 'api', 'tools.json');
const POSTS_TS = resolve(ROOT, 'client', 'src', 'blog', 'posts.ts');

const escapeXml = (str) =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const allTools = JSON.parse(readFileSync(TOOLS_JSON, 'utf-8'));
// 排除 isInternal 工具（#100 索引神器）
const tools = allTools.filter((t) => !t.isInternal);

// 解析 blog posts（用 regex 簡單抓 — 避免 import TS 在 Node ESM）
function extractPosts() {
  const src = readFileSync(POSTS_TS, 'utf-8');
  const posts = [];
  const blockRegex = /const\s+POST_[A-Z0-9_]+:\s*BlogPost\s*=\s*\{([\s\S]*?)\n\};/g;
  let m;
  while ((m = blockRegex.exec(src)) !== null) {
    const body = m[1];
    const slug = body.match(/slug:\s*'([^']+)'/)?.[1];
    const title = body.match(/title:\s*\n?\s*'([^']+)'/)?.[1];
    const excerpt = body.match(/excerpt:\s*\n?\s*'([^']+)'/)?.[1];
    const publishedAt = body.match(/publishedAt:\s*'([^']+)'/)?.[1];
    const coverEmoji = body.match(/coverEmoji:\s*'([^']+)'/)?.[1] || '📖';
    if (slug && title) posts.push({ slug, title, excerpt: excerpt || '', publishedAt: publishedAt || '', coverEmoji });
  }
  return posts;
}

const posts = extractPosts();

// 組合所有條目（工具 + blog），按 addedAt / publishedAt 倒序
const allItems = [
  ...tools.map((t) => ({
    kind: 'tool',
    title: `🆕 新工具：${t.title}`,
    link: `${SITE_URL}/tool/${t.id}`,
    description: t.description,
    pubDate: t.addedAt || `2024-01-01T00:00:00Z`, // 沒 addedAt 給很舊的日期排到尾巴
    guid: `${SITE_URL}/tool/${t.id}`,
    categories: t.tags || [],
  })),
  ...posts.map((p) => ({
    kind: 'blog',
    title: `📖 教學情境：${p.title}`,
    link: `${SITE_URL}/blog/${p.slug}`,
    description: p.excerpt,
    pubDate: p.publishedAt || `2024-01-01T00:00:00Z`,
    guid: `${SITE_URL}/blog/${p.slug}`,
    categories: ['blog', '教學情境'],
  })),
];

// 按日期倒序
allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

// 取前 30 個（RSS reader 大多顯示 25-50 條）
const items = allItems.slice(0, 30);

// 用最新一條的日期當 channel lastBuildDate
const latestDate = items[0]?.pubDate ? new Date(items[0].pubDate).toUTCString() : new Date().toUTCString();
const buildDate = new Date().toUTCString();

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>科技教育創新專區 · 阿凱老師</title>
    <link>${SITE_URL}/</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>阿凱老師（桃園市石門國小）親手打造的 ${tools.length}+ 款國小教育科技工具與教學情境長文。課堂互動、AI 教案、閱讀評量、教育遊戲一站搞定。</description>
    <language>zh-TW</language>
    <copyright>阿凱老師 · CC BY-SA 4.0</copyright>
    <pubDate>${latestDate}</pubDate>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <generator>scripts/generate-feed.mjs · v1</generator>
    <ttl>180</ttl>
    <image>
      <url>${SITE_URL}/icon-512.png</url>
      <title>阿凱老師 · 教育工具集</title>
      <link>${SITE_URL}/</link>
      <width>144</width>
      <height>144</height>
    </image>
${items
  .map(
    (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <guid isPermaLink="true">${escapeXml(item.guid)}</guid>
      <pubDate>${new Date(item.pubDate).toUTCString()}</pubDate>
      <description>${escapeXml(item.description)}</description>
${(item.categories || []).slice(0, 5).map((c) => `      <category>${escapeXml(c)}</category>`).join('\n')}
    </item>`
  )
  .join('\n')}
  </channel>
</rss>
`;

writeFileSync(OUT, rss, 'utf-8');
console.log(`✅ RSS feed 已產出：${OUT}`);
console.log(`📊 條目數：${items.length}（${tools.length} 工具 + ${posts.length} blog）`);
console.log(`📅 最新條目：${items[0]?.title.slice(0, 40)}...`);
