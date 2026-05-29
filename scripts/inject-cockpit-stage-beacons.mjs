#!/usr/bin/env node
/**
 * inject-cockpit-stage-beacons.mjs
 *
 * 一次性掃描 it-cockpit 內 28 個 stage 資料夾，為每個 stage 的 index.html
 * 注入帶 stageId 的 beacon snippet，讓 Akai 排行榜後台能看到
 * 「#81 駕駛艙 的 micro:bit 單元被點 12 次、Canva AI 被點 3 次」這類細粒度。
 *
 * 設計考量：
 *   - idempotent：已含 beaconToolClick 字串的 stage 自動 skip
 *   - 不破壞既有 head 結構，只在 </head> 之前插 <script>
 *   - sessionStorage key 含 stageId 區隔（同分頁切 stage 都會各算一次）
 *   - 各 stage 共用同一個 akai_beacon_sid，後台可串聯同學生的瀏覽路徑
 *
 * 使用方式：
 *   node scripts/inject-cockpit-stage-beacons.mjs
 *
 * 跑完後在 it-cockpit/ 內 git diff 檢視，OK 再 commit + push。
 */
import fs from 'node:fs';
import path from 'node:path';

const COCKPIT_DIR = process.env.COCKPIT_DIR || 'H:/it-cockpit';
const TOOL_ID = 81;
const BEACON_MARKER = 'beaconToolClick';
const EXCLUDE_DIRS = new Set(['assets', 'node_modules', '.git', '.github', '.vscode']);

function buildSnippet(stageId) {
  return `<script>
  // ─────────────────────────────────────────────────────────────
  // Akai 排行榜流量歸因 beacon (cagoooo/Akai · toolId ${TOOL_ID} stage="${stageId}")
  // 進站時送一次像素 beacon 給 Akai Cloud Function 累計 totalClicks
  //   + stageBreakdown.${stageId} +1（v3.6.70 細粒度單元熱度）
  // 同分頁 sessionStorage 去重；同學生切換 stage 各算一次
  // ─────────────────────────────────────────────────────────────
  (function () {
    try {
      var TOOL_ID = ${TOOL_ID};
      var STAGE_ID = '${stageId}';
      var SENT_KEY = 'akai_beacon_' + TOOL_ID + '_' + STAGE_ID + '_sent';
      if (sessionStorage.getItem(SENT_KEY)) return;
      var SID_KEY = 'akai_beacon_sid';
      var sid = sessionStorage.getItem(SID_KEY);
      if (!sid) {
        sid = 'cockpit-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
        sessionStorage.setItem(SID_KEY, sid);
      }
      var device = window.innerWidth < 768 ? 'mobile' : (window.innerWidth < 1024 ? 'tablet' : 'desktop');
      var url = 'https://asia-east1-akai-e693f.cloudfunctions.net/beaconToolClick'
        + '?toolId=' + TOOL_ID
        + '&stageId=' + STAGE_ID
        + '&referrer=' + encodeURIComponent(document.referrer || '')
        + '&device=' + device
        + '&sessionId=' + encodeURIComponent(sid);
      new Image().src = url;
      sessionStorage.setItem(SENT_KEY, '1');
    } catch (e) {}
  })();
</script>
`;
}

const stages = fs.readdirSync(COCKPIT_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('.') && !EXCLUDE_DIRS.has(d.name))
  .map((d) => d.name);

const results = { ok: [], skip: [], warn: [] };

for (const stage of stages) {
  const file = path.join(COCKPIT_DIR, stage, 'index.html');
  if (!fs.existsSync(file)) {
    results.warn.push({ stage, reason: 'no index.html' });
    continue;
  }
  const content = fs.readFileSync(file, 'utf-8');
  if (content.includes(BEACON_MARKER)) {
    results.skip.push(stage);
    continue;
  }
  if (!content.includes('</head>')) {
    results.warn.push({ stage, reason: 'no </head>' });
    continue;
  }
  const patched = content.replace('</head>', buildSnippet(stage) + '</head>');
  fs.writeFileSync(file, patched);
  results.ok.push(stage);
}

console.log(`\n📊 INJECT COCKPIT STAGE BEACONS 完成`);
console.log(`   ✅ OK   : ${results.ok.length} stages`);
if (results.ok.length > 0) console.log(`           ${results.ok.join(', ')}`);
console.log(`   ⏭️  SKIP (已含 beacon): ${results.skip.length} stages`);
if (results.skip.length > 0) console.log(`           ${results.skip.join(', ')}`);
console.log(`   ⚠️  WARN : ${results.warn.length}`);
if (results.warn.length > 0) console.log(`           ${JSON.stringify(results.warn)}`);
console.log(`\n下一步：cd ${COCKPIT_DIR} && git diff (review) → git commit + push\n`);
