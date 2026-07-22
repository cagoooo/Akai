#!/usr/bin/env node

/**
 * 從 Firestore `toolUsageStats` 集合自動同步 client/src/data/featuredTools.ts
 *
 * 邏輯：
 *   1. 讀 toolUsageStats → 排除 #100（不推薦自己）→ 按 totalClicks 排序取 top 5
 *   2. 補齊：若不足 5 個（早期工具還沒被點過），用 client/public/api/tools.json
 *      最後新增的工具（id 倒序）補位
 *   3. 改寫 client/src/data/featuredTools.ts 的 FEATURED_TOOL_IDS 陣列
 *   4. 若沒變 → 不寫入（idempotent）；有變 → 印 diff
 *
 * 認證：
 *   1. 本地：直接讀 service-account.json（gitignored）
 *   2. CI：讀 FIREBASE_SERVICE_ACCOUNT env（base64 編碼的 JSON）
 *   3. 都沒有 → 退出代碼 0 + warning（讓 CI 不會因此 fail）
 *
 * 用法：
 *   node scripts/sync-featured-from-firestore.mjs        # 本地跑
 *   FIREBASE_SERVICE_ACCOUNT=$(base64 -i ...) node ...   # CI 跑
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SERVICE_ACCOUNT_PATH = resolve(ROOT, 'service-account.json');
const FEATURED_FILE = resolve(ROOT, 'client', 'src', 'data', 'featuredTools.ts');
const TOOLS_JSON = resolve(ROOT, 'client', 'public', 'api', 'tools.json');

const TARGET_COUNT = 5; // 主要取 5 個，多餘 ID 留在檔案內當 fallback
const EXCLUDE_IDS = new Set([100]); // 索引神器不推薦自己

function loadCredential() {
  // 1) CI: env var FIREBASE_SERVICE_ACCOUNT（base64-encoded JSON）
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf-8');
      const json = JSON.parse(decoded);
      console.log(`🔑 用 env var FIREBASE_SERVICE_ACCOUNT 認證（project: ${json.project_id}）`);
      return cert(json);
    } catch (err) {
      console.error(`❌ FIREBASE_SERVICE_ACCOUNT env 解碼失敗：${err.message}`);
      return null;
    }
  }
  // 2) 本地: service-account.json
  if (existsSync(SERVICE_ACCOUNT_PATH)) {
    const json = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf-8'));
    console.log(`🔑 用本地 service-account.json 認證（project: ${json.project_id}）`);
    return cert(json);
  }
  return null;
}

function readCurrentFeaturedIds() {
  if (!existsSync(FEATURED_FILE)) return [];
  const src = readFileSync(FEATURED_FILE, 'utf-8');
  const match = src.match(/FEATURED_TOOL_IDS:\s*number\[\]\s*=\s*\[([\s\S]*?)\]/);
  if (!match) return [];
  return match[1]
    .split('\n')
    .map((line) => line.replace(/\/\/.*$/, '').trim())
    .join(',')
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter(Number.isFinite);
}

function writeFeaturedIds(topIds, fallbackIds, toolsMap) {
  // 組合：top 5（含註解工具名）+ fallback 後備
  const allIds = [...topIds, ...fallbackIds.filter((id) => !topIds.includes(id))];
  const lines = allIds.map((id, idx) => {
    const tool = toolsMap.get(id);
    const note = tool ? `${tool.title}` : '未知工具';
    const tag = idx < TARGET_COUNT ? '主推' : 'fallback';
    return `  ${id}, // [${tag}] ${note}`;
  });

  const content = `/**
 * Featured Tools — 用於 OG heatmap 與首頁焦點推薦
 *
 * ✨ 此檔由 \`scripts/sync-featured-from-firestore.mjs\` 自動同步：
 *    讀 Firestore toolUsageStats 取 totalClicks top 5 → 寫入主推位；
 *    不足或 fallback 用 tools.json 最後新增的工具補。
 *
 * ⚠️ 不要手動編輯 — 下次 sync 會覆蓋。
 *    需要強推某工具：在 sync 腳本加 forcedIds，或直接調整 Firestore stats。
 *
 * 更新時機：
 *   - 本地：\`npm run sync:featured\`
 *   - CI：deploy workflow 在有 FIREBASE_SERVICE_ACCOUNT secret 時自動跑
 *
 * 順序代表展示優先級（左上→右上→左下→右下，前 4 進 OG heatmap）。
 */
export const FEATURED_TOOL_IDS: number[] = [
${lines.join('\n')}
];

/** 自動產生：${new Date().toISOString()} */
`;
  writeFileSync(FEATURED_FILE, content, 'utf-8');
}

async function main() {
  const cred = loadCredential();
  if (!cred) {
    console.warn('⚠️  沒設 FIREBASE_SERVICE_ACCOUNT 也沒 service-account.json — 跳過 sync（保留現有 featuredTools.ts）');
    process.exit(0); // 不 fail CI
  }

  if (!getApps().length) {
    initializeApp({ credential: cred });
  }

  // 1) 讀所有工具當查找表
  const tools = JSON.parse(readFileSync(TOOLS_JSON, 'utf-8'));
  const toolsMap = new Map(tools.map((t) => [t.id, t]));

  // 2) 讀 Firestore toolUsageStats
  console.log('📡 讀取 Firestore toolUsageStats...');
  const snapshot = await getFirestore().collection('toolUsageStats').get();
  const stats = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    const id = parseInt(doc.id, 10) || data.toolId;
    if (!id || EXCLUDE_IDS.has(id)) return;
    if (!toolsMap.has(id)) return; // 工具已不存在於 tools.json
    stats.push({ id, totalClicks: data.totalClicks || 0 });
  });

  console.log(`   共 ${stats.length} 筆有效工具點擊統計\n`);

  // 3) 排序取 top 5
  stats.sort((a, b) => b.totalClicks - a.totalClicks);
  const topIds = stats.slice(0, TARGET_COUNT).map((s) => s.id);

  console.log('🏆 Top 5 by totalClicks:');
  stats.slice(0, TARGET_COUNT).forEach((s, i) => {
    const t = toolsMap.get(s.id);
    console.log(`   ${i + 1}. #${s.id} ${t?.title || '?'} (${s.totalClicks} clicks)`);
  });

  // 4) 不足 5 個 → 補：用 tools.json 最後新增的工具（id 倒序，排除已 picked 與 EXCLUDE）
  if (topIds.length < TARGET_COUNT) {
    const need = TARGET_COUNT - topIds.length;
    const candidates = tools
      .map((t) => t.id)
      .filter((id) => !topIds.includes(id) && !EXCLUDE_IDS.has(id))
      .sort((a, b) => b - a)
      .slice(0, need);
    topIds.push(...candidates);
    console.log(`\n   不足 ${TARGET_COUNT}，補：${candidates.join(', ')}`);
  }

  // 5) fallback 後備：tools.json 最近 10 個（排除已選與 EXCLUDE）
  const fallbackIds = tools
    .map((t) => t.id)
    .filter((id) => !topIds.includes(id) && !EXCLUDE_IDS.has(id))
    .sort((a, b) => b - a)
    .slice(0, 6);

  // 6) 與現有比對
  const current = readCurrentFeaturedIds();
  const same = topIds.length === current.slice(0, TARGET_COUNT).length &&
               topIds.every((id, i) => id === current[i]);
  if (same) {
    console.log('\n✅ featuredTools.ts 已是最新，無需更新');
    process.exit(0);
  }

  console.log('\n📝 變更：');
  console.log(`   舊：[${current.slice(0, TARGET_COUNT).join(', ')}]`);
  console.log(`   新：[${topIds.join(', ')}]`);

  writeFeaturedIds(topIds, fallbackIds, toolsMap);
  console.log(`\n✨ 已寫入 ${FEATURED_FILE}`);
}

main().catch((err) => {
  console.error('❌ sync 失敗：', err);
  // 在 CI 上不 fail（避免一個外部依賴失敗就擋整個 deploy）
  process.exit(0);
});
