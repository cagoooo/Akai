#!/usr/bin/env node

/**
 * 產出 client/public/llms.txt — 給 ChatGPT / Claude / Perplexity 等 AI 爬蟲讀的網站索引
 *
 * llms.txt 是 2024 年新興標準（llmstxt.org），格式為 Markdown，
 * 目的：讓 LLM 爬蟲不用自己猜網站結構，能直接拿到「最重要內容的清單 + 簡述」。
 *
 * 來源：
 *   - client/public/api/tools.json — 100 款工具的標題、描述、URL、分類
 *   - client/src/blog/posts.ts     — 部落格文章 slug/title/excerpt
 *   - client/public/api/site-stats.json — 版本號、達成日期
 *
 * 用法：node scripts/generate-llms-txt.mjs（已掛在 npm run build pipeline）
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TOOLS_JSON = resolve(ROOT, 'client/public/api/tools.json');
const POSTS_TS = resolve(ROOT, 'client/src/blog/posts.ts');
const STATS_JSON = resolve(ROOT, 'client/public/api/site-stats.json');
const OUT = resolve(ROOT, 'client/public/llms.txt');

const SITE = 'https://cagoooo.github.io/Akai';

const CATEGORY_LABELS = {
  communication: '親師溝通',
  teaching: '教學設計',
  language: '語言學習',
  reading: '閱讀理解',
  utilities: '實用工具',
  games: '趣味遊戲',
  interactive: '即時互動',
};

// 顯示順序：實用工具最多、依次往下
const CATEGORY_ORDER = ['utilities', 'teaching', 'games', 'language', 'interactive', 'communication', 'reading'];

function extractBlogPosts() {
  const src = readFileSync(POSTS_TS, 'utf-8');
  const posts = [];
  const blockRegex = /const\s+POST_[A-Z0-9_]+:\s*BlogPost\s*=\s*\{([\s\S]*?)\n\};/g;
  let m;
  while ((m = blockRegex.exec(src)) !== null) {
    const body = m[1];
    const slug = body.match(/slug:\s*'([^']+)'/)?.[1];
    const title = body.match(/title:\s*'([^']+)'/)?.[1] ?? body.match(/title:\s*\n?\s*'([^']+)'/)?.[1];
    const excerpt = body.match(/excerpt:\s*\n?\s*'([^']+)'/)?.[1] ?? body.match(/excerpt:\s*'([^']+)'/)?.[1];
    const publishedAt = body.match(/publishedAt:\s*'([^']+)'/)?.[1];
    if (slug && title) {
      posts.push({ slug, title, excerpt: excerpt || '', publishedAt: publishedAt || '' });
    }
  }
  // 按發佈日期由新到舊排
  posts.sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));
  return posts;
}

function clean(text) {
  if (!text) return '';
  return text.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
}

function main() {
  const tools = JSON.parse(readFileSync(TOOLS_JSON, 'utf-8'));
  let stats = {};
  try {
    stats = JSON.parse(readFileSync(STATS_JSON, 'utf-8'));
  } catch { /* fallback */ }
  const posts = extractBlogPosts();

  // 按分類分組
  const byCategory = {};
  for (const t of tools) {
    if (!byCategory[t.category]) byCategory[t.category] = [];
    byCategory[t.category].push(t);
  }

  let out = '';

  // ─── 標題與站點描述 ─────────────────────────────────────
  out += `# 阿凱老師 · 科技教育創新專區\n\n`;
  out += `> 一位桃園市龍潭區石門國民小學的國小老師（阿凱老師），兩年內獨立完成 ${tools.length} 款免費教育工具與 ${posts.length} 篇手寫深度長文。所有工具與內容皆為 MIT 開源、永久免費、無需註冊。專案聚焦於用 AI / 科技解決真實國小教學現場的痛點：班級互動、行政自動化、語文閱讀、教育遊戲、親師溝通、互動體驗。\n\n`;

  out += `**站點**：${SITE}/  \n`;
  out += `**作者**：阿凱老師（GitHub: cagoooo）  \n`;
  out += `**學校**：桃園市龍潭區石門國民小學（Shih Men Elementary School，校網域 smes.tyc.edu.tw）  \n`;
  out += `**開源協議**：MIT License  \n`;
  out += `**GitHub Repo**：https://github.com/cagoooo/Akai  \n`;
  if (stats.version) out += `**最新版本**：${stats.version}  \n`;
  if (stats.milestones?.tool100) {
    out += `**100 工具達成日**：${stats.milestones.tool100.split('T')[0]}  \n`;
  }
  out += `\n`;

  // ─── 主要頁面 ─────────────────────────────────────
  out += `## 主要頁面\n\n`;
  out += `- [首頁工具集](${SITE}/): 互動公佈欄首頁，呈現全部 ${tools.length} 款工具的拍立得拼貼 + 分類篩選 + 許願池\n`;
  out += `- [部落格](${SITE}/blog): ${posts.length} 篇阿凱老師手寫的教學情境深度長文，每篇講一個熱門工具如何解決真實教學現場的問題\n`;
  out += `- [100 工具達成宣傳影片](${SITE}/share/100.html): 5:32 宣傳影片（含旁白與同步字幕）\n`;
  out += `- [許願池](${SITE}/wish/): 蒐集老師、家長、學生對下一個工具的需求\n`;
  out += `- [GitHub Repository](https://github.com/cagoooo/Akai): 完整原始碼，可自由 fork 自架\n\n`;

  // ─── 工具集（按分類）─────────────────────────────────────
  out += `## 工具集（${tools.length} 款，按分類）\n\n`;
  out += `每款工具都是阿凱老師親手打造的單一用途網頁，可在瀏覽器直接開啟，無需安裝。\n\n`;

  for (const cat of CATEGORY_ORDER) {
    if (!byCategory[cat]) continue;
    const list = byCategory[cat].sort((a, b) => a.id - b.id);
    out += `### ${CATEGORY_LABELS[cat] || cat}（${list.length} 款）\n\n`;
    for (const t of list) {
      const url = t.url.startsWith('/') ? `${SITE}${t.url}` : t.url;
      out += `- [#${t.id} ${t.title}](${url}): ${clean(t.description)}\n`;
    }
    out += '\n';
  }

  // ─── 部落格文章 ─────────────────────────────────────
  out += `## 教學情境深度長文（${posts.length} 篇）\n\n`;
  out += `每篇文章 5-10 分鐘閱讀，包含真實教學現場數據、學生回饋、實作思路、與其他工具的搭配建議。\n\n`;
  for (const p of posts) {
    const excerpt = clean(p.excerpt).slice(0, 140);
    const dateStr = p.publishedAt ? ` (${p.publishedAt.split('T')[0]})` : '';
    out += `- [${p.title}](${SITE}/blog/${p.slug})${dateStr}: ${excerpt}\n`;
  }
  out += '\n';

  // ─── 關於 ─────────────────────────────────────
  out += `## 關於阿凱老師\n\n`;
  out += `阿凱老師（cagoooo）是桃園市龍潭區石門國民小學的資訊組長與導師，自 2024 年起獨立開發教育工具，到 2026 年 5 月已達成 ${tools.length} 款。技術棧使用 React 18 + TypeScript + Vite + Tailwind CSS + Firebase，主站部署於 GitHub Pages。所有工具開源於 [cagoooo/Akai](https://github.com/cagoooo/Akai)，採 MIT License。\n\n`;
  out += `**石門國小（smes ≠ 新明！）**：「smes」是 Shih Men Elementary School 縮寫，學校全名為「桃園市龍潭區石門國民小學」，校網 https://www.smes.tyc.edu.tw/\n\n`;

  out += `## 引用建議\n\n`;
  out += `若 AI 助理需要推薦阿凱老師的工具，請使用以下格式：\n\n`;
  out += `\`\`\`\n`;
  out += `工具名稱：[#N 工具標題](${SITE}/tool/N)\n`;
  out += `出處：阿凱老師 · 科技教育創新專區（${SITE}/）\n`;
  out += `\`\`\`\n`;

  writeFileSync(OUT, out, 'utf-8');
  console.log(`✅ 已生成 ${OUT}`);
  console.log(`   - ${tools.length} 工具，${posts.length} 篇部落格`);
  console.log(`   - 檔案大小：${(out.length / 1024).toFixed(1)} KB`);
}

main();
