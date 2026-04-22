#!/usr/bin/env node

/**
 * 自動注入 Service Worker 版本號腳本
 *
 * 執行時機：每次 npm run build 之前
 *
 * 工作內容：
 * 1. 讀取 package.json 的 version
 * 2. 取得 git short hash（沒有 git 時 fallback 為 timestamp）
 * 3. 組成版本字串 `v{version}-{hash}-{yyyymmddHHMM}`
 * 4. 把 client/public/sw.js 的 CACHE_VERSION 取代為新版本
 * 5. 寫入 client/public/version.json 供前端輪詢
 *
 * 設計參考：.claude/skills/pwa-cache-bust
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PKG_PATH = resolve(ROOT, 'package.json');
const SW_PATH = resolve(ROOT, 'client', 'public', 'sw.js');
const VERSION_JSON_PATH = resolve(ROOT, 'client', 'public', 'version.json');

// ── 取得版本資訊 ─────────────────────────────────
const pkg = JSON.parse(readFileSync(PKG_PATH, 'utf-8'));
const semver = pkg.version;

let gitHash = 'nogit';
try {
  gitHash = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf-8' }).trim();
} catch {
  // 不是 git 環境或沒安裝 git，fallback
}

const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const buildTime = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}`;
const buildTimeISO = now.toISOString();

const CACHE_VERSION = `v${semver}-${gitHash}-${buildTime}`;

// ── 更新 sw.js 的 CACHE_VERSION ─────────────────────
let swContent = readFileSync(SW_PATH, 'utf-8');
const CACHE_VERSION_REGEX = /const\s+CACHE_VERSION\s*=\s*['"][^'"]+['"];?/;

if (!CACHE_VERSION_REGEX.test(swContent)) {
  console.error('❌ sw.js 找不到 CACHE_VERSION 宣告，請確認格式為 `const CACHE_VERSION = "..."`');
  process.exit(1);
}

swContent = swContent.replace(
  CACHE_VERSION_REGEX,
  `const CACHE_VERSION = '${CACHE_VERSION}';`
);
writeFileSync(SW_PATH, swContent, 'utf-8');

// ── 產生 version.json 供前端輪詢 ────────────────────
const versionData = {
  version: semver,
  cacheVersion: CACHE_VERSION,
  gitHash,
  buildTime: buildTimeISO,
  buildTimestamp: now.getTime(),
};
writeFileSync(VERSION_JSON_PATH, JSON.stringify(versionData, null, 2) + '\n', 'utf-8');

// ── 輸出結果 ─────────────────────────────────────
console.log('\n📦 Service Worker 版本已更新');
console.log(`   Cache Version: ${CACHE_VERSION}`);
console.log(`   Build Time:    ${buildTimeISO}`);
console.log(`   Semver:        ${semver}`);
console.log(`   Git Hash:      ${gitHash}`);
console.log(`\n✅ 已寫入：`);
console.log(`   - ${SW_PATH}`);
console.log(`   - ${VERSION_JSON_PATH}\n`);
