#!/usr/bin/env node

/**
 * 同步 meta 描述、作者實體文字與 OG 圖檔名到所有相關檔案
 *
 * 來源：client/public/api/site-stats.json（由 generate-home-og.mjs 產生）
 *
 * 目標檔案：
 *   1. client/index.html        — og:image / twitter:image / 描述中的工具與文章數字 / JSON-LD 實體描述
 *   2. client/public/manifest.json — description
 *   3. client/src/components/SEOHead.tsx — DEFAULT_DESCRIPTION / DEFAULT_IMAGE
 *
 * 規則：
 *   - 顯示數量使用向下取最近 10 倍數的範圍（例如 124 → 120+），並同步保留精確數量供 JSON-LD 實體辨識。
 *   - 里程碑「第 100 款」保留為歷史事實，不與目前工具總數混用。
 *
 * 用法：
 *   node scripts/sync-meta-from-stats.mjs
 *
 * 通常在 build 流程中由 npm script 自動執行：
 *   generate-home-og.mjs → sync-meta-from-stats.mjs → vite build
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const STATS_JSON = resolve(ROOT, 'client', 'public', 'api', 'site-stats.json');
const POSTS_TS = resolve(ROOT, 'client', 'src', 'blog', 'posts.ts');

if (!existsSync(STATS_JSON)) {
  console.error(`❌ 找不到 ${STATS_JSON}，請先執行 generate-home-og.mjs`);
  process.exit(1);
}

const stats = JSON.parse(readFileSync(STATS_JSON, 'utf-8'));
const { toolCount } = stats;

function countBlogPosts() {
  if (!existsSync(POSTS_TS)) return 0;
  const source = readFileSync(POSTS_TS, 'utf-8');
  return [...source.matchAll(/const\s+POST_[A-Z0-9_]+:\s*BlogPost\s*=\s*\{/g)].length;
}

// 顯示用：97 → 「90+」、103 → 「100+」、110 → 「110+」
const bucket = Math.floor(toolCount / 10) * 10;
const displayCount = `${bucket}+`;
const blogPostCount = countBlogPosts();
const ogImageAbsolute = stats.ogImageAbsolute;

const organizationDescription = `桃園市龍潭區石門國民小學阿凱老師打造的教育工具專區，目前收錄 ${toolCount} 款（${displayCount}）國小教育科技工具，涵蓋課堂互動、AI 教案、閱讀評量、語文寫作、教育遊戲、行政自動化、親師溝通。所有工具皆為 MIT 開源、永久免費、無需註冊。`;
const personDescription = `桃園市龍潭區石門國民小學資訊組長，自 2024 年起獨立開發 ${toolCount} 款（${displayCount}）MIT 開源的國小教育工具${blogPostCount ? `，並撰寫 ${blogPostCount} 篇教學情境深度長文` : ''}。技術棧：React 18 + TypeScript + Vite + Tailwind + Firebase + Edge TTS + Remotion。`;
const websiteDescription = `${toolCount} 款（${displayCount}）國小教育工具 · ${blogPostCount || '100+'} 篇教學情境長文 · MIT 開源永久免費`;

console.log(`📊 工具數：${toolCount} → 顯示「${displayCount}」`);
console.log(`📝 部落格文章：${blogPostCount || '未讀取'} 篇`);
console.log(`🖼  OG 圖：${stats.ogImage}\n`);

let changedTotal = 0;

function syncFile(path, replacers) {
  const abs = resolve(ROOT, path);
  if (!existsSync(abs)) {
    console.warn(`  ⚠️  跳過（檔案不存在）：${path}`);
    return;
  }
  const before = readFileSync(abs, 'utf-8');
  let after = before;
  for (const { pattern, replacement } of replacers) {
    after = after.replace(pattern, replacement);
  }
  if (after !== before) {
    writeFileSync(abs, after, 'utf-8');
    const diff = after.length - before.length;
    console.log(`  ✅ ${path} (${diff >= 0 ? '+' : ''}${diff} bytes)`);
    changedTotal++;
  } else {
    console.log(`  ⏭  ${path}（無變動）`);
  }
}

// 1) index.html — 工具數字 + og:image / twitter:image
syncFile('client/index.html', [
  // og:image / twitter:image 路徑：把舊的 og-preview*.png 換成新的
  {
    pattern: /https:\/\/cagoooo\.github\.io\/Akai\/og-preview(?:-[a-f0-9]+)?\.png/g,
    replacement: ogImageAbsolute,
  },
  // 工具數量字串：「N+ 款」「N+ 教育工具」「N 款國小教育工具」
  {
    pattern: /\d+\+ 款國小教育工具/g,
    replacement: `${displayCount} 款國小教育工具`,
  },
  {
    pattern: /\d+\+ 款教育/g,
    replacement: `${displayCount} 款教育`,
  },
  // 靜態 JSON-LD 的 Organization / Person / WebSite 描述，避免首頁 meta 與結構化資料各說各話
  {
    pattern: /"description": "桃園市龍潭區石門國民小學[^\"]+"/,
    replacement: `"description": ${JSON.stringify(organizationDescription)}`,
  },
  {
    pattern: /"description": "桃園市龍潭區石門國民小學資訊組長[^\"]+"/,
    replacement: `"description": ${JSON.stringify(personDescription)}`,
  },
  {
    pattern: /"description": "(?:\d+ 款|目前 \d+ 款)[^\"]*國小教育工具[^\"]*"/,
    replacement: `"description": ${JSON.stringify(websiteDescription)}`,
  },
]);

// 2) manifest.json
syncFile('client/public/manifest.json', [
  { pattern: /\d+\+ 款國小教育/g, replacement: `${displayCount} 款國小教育` },
  { pattern: /\d+\+ 款教育/g, replacement: `${displayCount} 款教育` },
]);

// 3) SEOHead.tsx
syncFile('client/src/components/SEOHead.tsx', [
  // DEFAULT_IMAGE 結尾的 og-preview*.png
  {
    pattern: /og-preview(?:-[a-f0-9]+)?\.png/g,
    replacement: stats.ogImage.replace(/^\//, ''),
  },
  { pattern: /\d+\+ 款國小教育/g, replacement: `${displayCount} 款國小教育` },
  { pattern: /\d+\+ 款教育/g, replacement: `${displayCount} 款教育` },
]);

// 4) README.md（badge + 副標）
syncFile('README.md', [
  {
    pattern: /!\[Tools\]\(https:\/\/img\.shields\.io\/badge\/tools-\d+(?:%2B|\+)-orange\.svg\)/,
    replacement: `![Tools](https://img.shields.io/badge/tools-${bucket}%2B-orange.svg)`,
  },
  { pattern: /\d+\+ 款國小教育/g, replacement: `${displayCount} 款國小教育` },
  {
    pattern: /!\[Version\]\(https:\/\/img\.shields\.io\/badge\/version-[^\)]+\.svg\)/,
    replacement: (() => {
      try {
        const packageJson = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf-8'));
        return `![Version](https://img.shields.io/badge/version-${packageJson.version}-brightgreen.svg)`;
      } catch {
        return '![Version](https://img.shields.io/badge/version-unknown-brightgreen.svg)';
      }
    })(),
  },
]);

// 5) teacher.json（公開 + server）
for (const p of ['client/public/api/teacher.json', 'server/data/teacher.json']) {
  syncFile(p, [
    { pattern: /\d+\+ 款國小教育/g, replacement: `${displayCount} 款國小教育` },
  ]);
}

console.log(`\n✨ 完成（${changedTotal} 個檔案有變動）`);
