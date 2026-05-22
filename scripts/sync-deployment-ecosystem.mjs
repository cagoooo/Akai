#!/usr/bin/env node
/**
 * sync-deployment-ecosystem.mjs (v1.0, 2026-05-22)
 *
 * 把 BulletinDeploymentEcosystem.tsx 內 5 個平台 count + 「看全部 N 篇手寫教學心得」
 * 從 hardcode 自動 sync 到 tools.json + posts.ts 的真實數字，避免新增工具後
 * 首頁部署生態系區塊漂移。
 *
 * 同步邏輯：
 *   - 讀 client/public/api/tools.json → 用 getToolPlatform 規則分類 → 算 5 平台 count
 *   - 讀 client/src/blog/posts.ts → 數 `^const POST_` 行數 = 手寫長文總數
 *   - regex 寫進 client/src/components/bulletin/BulletinDeploymentEcosystem.tsx
 *
 * 用法：
 *   node scripts/sync-deployment-ecosystem.mjs        # 同步
 *   node scripts/sync-deployment-ecosystem.mjs --dry  # 只報告差異不寫入
 *
 * 整合：已加進 npm run build pipeline（在 vite build 之前），每次 build 自動同步。
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TOOLS_JSON = resolve(ROOT, 'client', 'public', 'api', 'tools.json');
const POSTS_TS = resolve(ROOT, 'client', 'src', 'blog', 'posts.ts');
const TARGET_TSX = resolve(
  ROOT,
  'client',
  'src',
  'components',
  'bulletin',
  'BulletinDeploymentEcosystem.tsx'
);

const isDry = process.argv.includes('--dry');

// 與 BlogList.tsx getToolPlatform 規則保持同步。改這裡時請同步改 BlogList.tsx
function getToolPlatform(url) {
  const u = url || '';
  // 索引神器 #100 / 內部路徑 → 網站本身就在 GitHub Pages
  if (u.startsWith('/Akai/') || (u.startsWith('/') && !u.includes('://'))) return 'github';
  if (u.includes('github.io')) return 'github';
  if (u.includes('sites.google.com')) return 'gsites';
  if (/^https?:\/\/www\.smes\.tyc\.edu\.tw/.test(u)) return 'xoops';
  if (/^https?:\/\/[a-z0-9-]+\.smes\.tyc\.edu\.tw/.test(u)) return 'firebase';
  return 'thirdparty';
}

// PLATFORMS array 內 name → key 對應（用 name match 而非順序，更穩）
const NAME_TO_KEY = {
  'GitHub Pages': 'github',
  'Google Sites Embedded': 'gsites',
  'XOOPS 校網 VM': 'xoops',
  'Firebase Hosting': 'firebase',
  '第三方平台': 'thirdparty',
};

function main() {
  // ── 1. 算各平台 count ──
  const tools = JSON.parse(readFileSync(TOOLS_JSON, 'utf-8'));
  const counts = { github: 0, gsites: 0, xoops: 0, firebase: 0, thirdparty: 0 };
  for (const tool of tools) {
    const p = getToolPlatform(tool.url);
    counts[p]++;
  }
  const total = Object.values(counts).reduce((s, n) => s + n, 0);

  // ── 2. 算手寫長文總數（grep ^const POST_ 行數） ──
  const postsTs = readFileSync(POSTS_TS, 'utf-8');
  const postsCount = (postsTs.match(/^const POST_/gm) || []).length;

  console.log('📊 部署生態系真實數字：');
  console.log(`   GitHub Pages:          ${counts.github}`);
  console.log(`   Google Sites Embedded: ${counts.gsites}`);
  console.log(`   XOOPS 校網 VM:         ${counts.xoops}`);
  console.log(`   Firebase Hosting:      ${counts.firebase}`);
  console.log(`   第三方平台:            ${counts.thirdparty}`);
  console.log(`   ─────────────────────────`);
  console.log(`   合計:                  ${total} 件公開工具`);
  console.log(`   手寫長文:              ${postsCount} 篇`);

  // ── 3. 讀 BulletinDeploymentEcosystem.tsx ──
  let tsx = readFileSync(TARGET_TSX, 'utf-8');
  const before = tsx;
  const changes = [];

  // 對每個平台：找 name: '<名稱>' 區塊內的 count: NN,，改成真實數字
  for (const [name, key] of Object.entries(NAME_TO_KEY)) {
    const target = counts[key];
    // 匹配「name: '<name>'」後最多 200 字內的「count: <number>,」（一個 PLATFORMS entry 範圍內）
    const pattern = new RegExp(
      `(name:\\s*'${name.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}',[\\s\\S]{0,200}?count:\\s*)(\\d+)(,)`,
      'm'
    );
    const m = tsx.match(pattern);
    if (!m) {
      console.warn(`⚠️ 找不到平台「${name}」的 count 欄位，跳過`);
      continue;
    }
    const current = parseInt(m[2], 10);
    if (current !== target) {
      changes.push(`   ${name}: ${current} → ${target}`);
      tsx = tsx.replace(pattern, `$1${target}$3`);
    }
  }

  // 「看全部 NN 篇手寫教學心得 →」regex
  const postsPattern = /看全部\s*(\d+)\s*篇手寫教學心得/;
  const pm = tsx.match(postsPattern);
  if (pm) {
    const current = parseInt(pm[1], 10);
    if (current !== postsCount) {
      changes.push(`   手寫長文連結: ${current} → ${postsCount} 篇`);
      tsx = tsx.replace(postsPattern, `看全部 ${postsCount} 篇手寫教學心得`);
    }
  } else {
    console.warn('⚠️ 找不到「看全部 N 篇手寫教學心得」連結');
  }

  // ── 4. 寫入（或 dry-run 預覽） ──
  if (changes.length === 0) {
    console.log('\n✅ 部署生態系數字已是最新，無需改動');
    return;
  }

  console.log(`\n🔧 ${isDry ? '[DRY] 將要' : ''}更新 ${changes.length} 處：`);
  changes.forEach((c) => console.log(c));

  if (!isDry) {
    if (tsx !== before) {
      writeFileSync(TARGET_TSX, tsx, 'utf-8');
      console.log(`\n✅ 已寫入 ${TARGET_TSX}`);
    }
  } else {
    console.log('\n(--dry 模式，未寫入)');
  }
}

main();
