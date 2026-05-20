#!/usr/bin/env node

/**
 * 從 Firestore `analytics/toolIndexQueries/queries` 同步熱門搜尋詞到
 * client/src/data/popularQueries.ts。
 *
 * 流程：
 *   1. 讀 Firestore 所有 queries 文件
 *   2. 按 count 降序排序，過濾 count >= 2 的（避免單次測試詞）
 *   3. 取 top 9 寫入 popularQueries.ts
 *   4. 不足 9 個保留現有 fallback
 *
 * 認證：與 sync-featured-from-firestore.mjs 同邏輯（service-account.json / env）
 * 無認證 → 跳過不 fail（保留現有 popularQueries.ts）
 *
 * 用法：
 *   node scripts/sync-popular-queries.mjs           # 本地
 *   FIREBASE_SERVICE_ACCOUNT=$(base64 -i ...) node  # CI
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import admin from 'firebase-admin';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SERVICE_ACCOUNT_PATH = resolve(ROOT, 'service-account.json');
const OUTFILE = resolve(ROOT, 'client', 'src', 'data', 'popularQueries.ts');

const TARGET_COUNT = 9;
const MIN_COUNT_THRESHOLD = 2; // count < 2 視為偶發測試，不採用

// Fallback：如果 Firestore 沒夠多資料，用這幾個經典範例補位
const FALLBACK_QUERIES = [
  '我下週要上水的三態',
  '想做閱讀理解練習',
  '課堂破冰活動',
  '打分數工具',
  '學生票選 / 投票',
  'AI 教案產生器',
  '注音練習',
  '班級輔導 / 自我認識',
  '會議記錄',
];

function loadCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf-8');
      const json = JSON.parse(decoded);
      console.log(`🔑 用 env FIREBASE_SERVICE_ACCOUNT（${json.project_id}）`);
      return admin.credential.cert(json);
    } catch (err) {
      console.error(`❌ env 解碼失敗：${err.message}`);
      return null;
    }
  }
  if (existsSync(SERVICE_ACCOUNT_PATH)) {
    const json = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf-8'));
    console.log(`🔑 用本地 service-account.json（${json.project_id}）`);
    return admin.credential.cert(json);
  }
  return null;
}

function writeQueriesFile(queries) {
  const lines = queries.map((q, idx) => {
    const tag = idx < TARGET_COUNT ? '熱門' : 'fallback';
    return `  '${q.replace(/'/g, "\\'")}', // [${tag}]`;
  });

  const content = `/**
 * Popular Queries — ToolIndexAI 預設範例 query chips
 *
 * ✨ 此檔由 \`scripts/sync-popular-queries.mjs\` 自動同步：
 *    讀 Firestore analytics/toolIndexQueries/queries 取 count top ${TARGET_COUNT} → 寫進這檔
 *    沒 Firestore 認證（或統計太少）時保留 fallback
 *
 * ⚠️ 不要手動編輯 — 下次 sync 會覆蓋。
 */

export const POPULAR_QUERIES: string[] = [
${lines.join('\n')}
];

/** 自動產生：${new Date().toISOString()} */
`;
  writeFileSync(OUTFILE, content, 'utf-8');
}

async function main() {
  const cred = loadCredential();
  if (!cred) {
    console.warn('⚠️  無認證 — 跳過 sync（保留現有 popularQueries.ts）');
    process.exit(0);
  }

  if (!admin.apps.length) admin.initializeApp({ credential: cred });

  console.log('📡 讀 Firestore analytics/toolIndexQueries/queries...');
  const snap = await admin.firestore().collection('analytics/toolIndexQueries/queries').get();
  const queries = [];
  snap.forEach((doc) => {
    const data = doc.data();
    if (data.query && (data.count || 0) >= MIN_COUNT_THRESHOLD) {
      queries.push({ query: data.query, count: data.count });
    }
  });

  console.log(`   共 ${queries.length} 個 count ≥ ${MIN_COUNT_THRESHOLD} 的有效 query\n`);

  queries.sort((a, b) => b.count - a.count);
  const topQueries = queries.slice(0, TARGET_COUNT).map((q) => q.query);

  console.log('🏆 Top queries:');
  queries.slice(0, TARGET_COUNT).forEach((q, i) => {
    console.log(`   ${i + 1}. "${q.query}" (${q.count}x)`);
  });

  // 不足 N 個用 fallback 補
  const finalList = [...topQueries];
  for (const fb of FALLBACK_QUERIES) {
    if (finalList.length >= TARGET_COUNT) break;
    if (!finalList.includes(fb)) finalList.push(fb);
  }

  // 對比現有 popularQueries.ts
  let current = [];
  if (existsSync(OUTFILE)) {
    const src = readFileSync(OUTFILE, 'utf-8');
    const match = src.match(/POPULAR_QUERIES:\s*string\[\]\s*=\s*\[([\s\S]*?)\]/);
    if (match) {
      current = match[1]
        .split('\n')
        .map((l) => l.replace(/\/\/.*$/, '').trim().replace(/^['"]|['"],?$/g, ''))
        .filter(Boolean);
    }
  }
  const same = finalList.slice(0, TARGET_COUNT).every((q, i) => q === current[i]);
  if (same) {
    console.log('\n✅ popularQueries.ts 已是最新');
    process.exit(0);
  }

  console.log('\n📝 變更：');
  console.log(`   舊：[${current.slice(0, TARGET_COUNT).map((q) => `"${q}"`).join(', ')}]`);
  console.log(`   新：[${finalList.slice(0, TARGET_COUNT).map((q) => `"${q}"`).join(', ')}]`);

  writeQueriesFile(finalList);
  console.log(`\n✨ 已寫入 ${OUTFILE}`);
}

main().catch((err) => {
  console.error('❌ sync failed:', err);
  process.exit(0); // 不 fail CI
});
