#!/usr/bin/env node

/**
 * 同步 meta 描述與 OG 圖檔名到所有相關檔案
 *
 * 來源：client/public/api/site-stats.json（由 generate-home-og.mjs 產生）
 *
 * 目標檔案：
 *   1. client/index.html        — og:image / twitter:image / 描述中的數字
 *   2. client/public/manifest.json — description
 *   3. client/src/components/SEOHead.tsx — DEFAULT_DESCRIPTION / DEFAULT_IMAGE
 *
 * 規則：
 *   - 工具數 < 100 → 「90+」（向下取最近 10 倍數，例如 97 → 90+，103 → 100+）
 *   - 不直接寫死「97 款」避免每新增工具都要動 index.html；用「90+」一段範圍更穩
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

if (!existsSync(STATS_JSON)) {
  console.error(`❌ 找不到 ${STATS_JSON}，請先執行 generate-home-og.mjs`);
  process.exit(1);
}

const stats = JSON.parse(readFileSync(STATS_JSON, 'utf-8'));
const { toolCount } = stats;

// 顯示用：97 → 「90+」、103 → 「100+」、110 → 「110+」
const bucket = Math.floor(toolCount / 10) * 10;
const displayCount = `${bucket}+`;
const ogImageAbsolute = stats.ogImageAbsolute;

console.log(`📊 工具數：${toolCount} → 顯示「${displayCount}」`);
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
    pattern: /!\[Tools\]\(https:\/\/img\.shields\.io\/badge\/tools-\d+%2B-orange\.svg\)/,
    replacement: `![Tools](https://img.shields.io/badge/tools-${bucket}%2B-orange.svg)`,
  },
  { pattern: /\d+\+ 款國小教育/g, replacement: `${displayCount} 款國小教育` },
]);

// 5) teacher.json（公開 + server）
for (const p of ['client/public/api/teacher.json', 'server/data/teacher.json']) {
  syncFile(p, [
    { pattern: /\d+\+ 款國小教育/g, replacement: `${displayCount} 款國小教育` },
  ]);
}

console.log(`\n✨ 完成（${changedTotal} 個檔案有變動）`);
