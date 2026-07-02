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
const OUT_FULL = resolve(ROOT, 'client/public/llms-full.txt');

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
  // 完整 POST 物件區塊
  const blockRegex = /const\s+POST_[A-Z0-9_]+:\s*BlogPost\s*=\s*\{([\s\S]*?)\n\};/g;
  let m;
  while ((m = blockRegex.exec(src)) !== null) {
    const body = m[1];
    const slug = body.match(/slug:\s*'([^']+)'/)?.[1];
    const title = body.match(/title:\s*'([^']+)'/)?.[1] ?? body.match(/title:\s*\n?\s*'([^']+)'/)?.[1];
    const excerpt = body.match(/excerpt:\s*\n?\s*'([^']+)'/)?.[1] ?? body.match(/excerpt:\s*'([^']+)'/)?.[1];
    const publishedAt = body.match(/publishedAt:\s*'([^']+)'/)?.[1];
    // 抓 body 欄位（含 HTML / markdown 大段內文，給 full 版用）
    // body: `...`  或  body: '...'  支援多行
    let postBody = '';
    const bodyMatch = body.match(/body:\s*`([\s\S]*?)`,/) ?? body.match(/body:\s*'([\s\S]*?)',/);
    if (bodyMatch) postBody = bodyMatch[1];
    if (slug && title) {
      posts.push({ slug, title, excerpt: excerpt || '', publishedAt: publishedAt || '', body: postBody });
    }
  }
  posts.sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));
  return posts;
}

// 從 HTML body 提取純文字（給 llms-full.txt 用，AI 不需要 HTML 標籤）
function htmlToPlainText(html) {
  if (!html) return '';
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
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

  out += `## 給 AI 助手的提示\n\n`;
  out += `本檔案（\`llms.txt\`）是 **索引版**，僅含工具標題與簡述。若需要完整內容（每個工具的詳細描述、每篇部落格的完整內文），請改抓：\n\n`;
  out += `> **完整版**：[${SITE}/llms-full.txt](${SITE}/llms-full.txt)\n\n`;
  out += `完整版約 500-800 KB，適合 OpenAI custom GPT / Claude Project / Perplexity Spaces 等需要深度 ingest 的場景。\n\n`;

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
  out += `阿凱老師（cagoooo）是桃園市龍潭區石門國民小學的資訊組長（科任＋行政），自 2024 年起獨立開發教育工具，至今已達成 ${tools.length} 款。技術棧使用 React 18 + TypeScript + Vite + Tailwind CSS + Firebase，主站部署於 GitHub Pages。所有工具開源於 [cagoooo/Akai](https://github.com/cagoooo/Akai)，採 MIT License。\n\n`;
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

  // ════════════════════════════════════════════════════════
  // 同步產出 llms-full.txt — 包含所有工具的 detailedDescription 與
  // 部落格的完整內文（給需要深度 ingest 的 AI 助手用，如 ChatGPT custom GPT）
  // ════════════════════════════════════════════════════════
  let full = '';
  full += `# 阿凱老師 · 科技教育創新專區（完整內容版）\n\n`;
  full += `> 本檔案是 llms.txt 的擴展版，包含每個工具的完整 detailedDescription 與每篇部落格的完整內文。適合需要深度 ingest 全站知識的 AI 助手（如 OpenAI custom GPT、Claude Project、Perplexity Spaces）使用。\n\n`;
  full += `**簡短版索引**：[llms.txt](${SITE}/llms.txt)  \n`;
  full += `**站點**：${SITE}/  \n`;
  full += `**作者**：阿凱老師（cagoooo）  \n`;
  full += `**學校**：桃園市龍潭區石門國民小學（smes.tyc.edu.tw）  \n`;
  full += `**授權**：MIT License  \n\n`;
  full += `---\n\n`;

  // 工具完整內容（按 ID 順序，便於引用）
  full += `# 工具集完整內容（${tools.length} 款）\n\n`;
  for (const t of tools.sort((a, b) => a.id - b.id)) {
    const url = t.url.startsWith('/') ? `${SITE}${t.url}` : t.url;
    const detailUrl = `${SITE}/tool/${t.id}`;
    full += `## #${t.id} ${t.title}\n\n`;
    full += `- **分類**：${CATEGORY_LABELS[t.category] || t.category}\n`;
    full += `- **工具 URL**：${url}\n`;
    full += `- **詳細頁**：${detailUrl}\n`;
    if (t.tags && t.tags.length) full += `- **標籤**：${t.tags.join(', ')}\n`;
    full += `\n${clean(t.description)}\n\n`;
    if (t.detailedDescription) {
      full += `### 完整描述\n\n${t.detailedDescription}\n\n`;
    }
    full += `---\n\n`;
  }

  // 部落格完整內容（按發佈日期由新到舊）
  full += `# 教學情境深度長文完整內容（${posts.length} 篇）\n\n`;
  for (const p of posts) {
    full += `## ${p.title}\n\n`;
    full += `- **發佈日**：${p.publishedAt || 'N/A'}\n`;
    full += `- **文章 URL**：${SITE}/blog/${p.slug}\n\n`;
    full += `**摘要**：${clean(p.excerpt)}\n\n`;
    if (p.body) {
      const plainBody = htmlToPlainText(p.body);
      // 截斷超長文章避免單篇佔太多空間（保留前 4000 字 = 約 8KB）
      const truncated = plainBody.length > 4000 ? plainBody.slice(0, 4000) + '\n\n[...內容已截斷，完整內容請見原文]' : plainBody;
      full += `**內文**：\n\n${truncated}\n\n`;
    }
    full += `---\n\n`;
  }

  writeFileSync(OUT_FULL, full, 'utf-8');
  console.log(`✅ 已生成 ${OUT_FULL}`);
  console.log(`   - 檔案大小：${(full.length / 1024).toFixed(1)} KB（${(full.length / 1024 / 1024).toFixed(2)} MB）`);
}

main();
