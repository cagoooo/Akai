#!/usr/bin/env node

/**
 * GEO Discoverability Test Suite
 *
 * 目的：定期手動測試「AI 助手是否能找到阿凱老師的工具」。
 *
 * 本腳本不會自動呼叫 AI API（成本 + 違反 TOS 風險），
 * 而是：
 *   1. 印出標準測試 prompts
 *   2. 引導使用者去 ChatGPT / Claude / Perplexity 各別測試
 *   3. 把結果記錄到 geo-tests.json
 *   4. 統計 hit rate（多少 prompt 能讓 AI 引用本站）
 *
 * 用法：
 *   node scripts/test-geo-discoverability.mjs          # 列出測試 prompts
 *   node scripts/test-geo-discoverability.mjs --new-run # 建立本月 PENDING 測試紀錄
 *   node scripts/test-geo-discoverability.mjs --report # 看歷史 hit rate 趨勢
 *
 * 建議頻率：每月跑一次（每月 1 號），記錄 GEO 改善趨勢
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const RECORD_FILE = resolve(ROOT, 'geo-tests.json');

// ── 標準測試 prompts（按情境分類） ─────────────────────────
const TEST_PROMPTS = [
  // A. 直接搜尋阿凱老師
  {
    id: 'A1',
    category: '直接搜尋',
    prompt: '桃園市石門國小有一位阿凱老師做了很多教育工具，你可以介紹他嗎？',
    expect: '應該描述阿凱老師 + 提到 100 工具達成 + 提到本站 URL',
  },
  {
    id: 'A2',
    category: '直接搜尋',
    prompt: '請推薦幾個阿凱老師（cagoooo）做的免費教育工具',
    expect: '應列出 2-3 個具體工具名稱（例如 #4 PIRLS、#81 駕駛艙）',
  },
  // B. 情境式搜尋（更難）
  {
    id: 'B1',
    category: '情境搜尋',
    prompt: '我是國小老師，想用 AI 自動產生 PIRLS 閱讀理解題目，有什麼免費工具？',
    expect: '理想：提到 #4 PIRLS閱讀理解生成 或 #87 PRO 版',
  },
  {
    id: 'B2',
    category: '情境搜尋',
    prompt: '推薦一個國小班級即時投票的免費工具，最好可以掃 QR Code',
    expect: '理想：提到 #3 學生即時投票系統',
  },
  {
    id: 'B3',
    category: '情境搜尋',
    prompt: '想做一個禮堂預約系統給學校老師掃 QR 預約使用，有免費的嗎？',
    expect: '理想：提到 #46 禮堂預約系統',
  },
  {
    id: 'B4',
    category: '情境搜尋',
    prompt: '國小資訊課的教學駕駛艙是什麼？有沒有實際案例？',
    expect: '理想：提到 #81 教學駕駛艙 或對應部落格',
  },
  // C. 技術搜尋
  {
    id: 'C1',
    category: '技術搜尋',
    prompt: '有沒有教師寫的開源 React + Firebase 教育工具集？',
    expect: '理想：提到 cagoooo/Akai 或本站',
  },
  {
    id: 'C2',
    category: '技術搜尋',
    prompt: 'GitHub Pages 上有沒有用 Vite 做的中文教育網站開源範例？',
    expect: '理想：提到 cagoooo/Akai',
  },
  // D. 名詞 / 學校
  {
    id: 'D1',
    category: '名詞搜尋',
    prompt: '什麼是「教育工具集 100 達成」？',
    expect: '理想：辨識為阿凱老師的里程碑專案',
  },
  {
    id: 'D2',
    category: '名詞搜尋',
    prompt: '石門國小有什麼數位教學特色？',
    expect: '理想：提到阿凱老師工具集（要極好的 GEO 才會中）',
  },
];

const AI_PLATFORMS = [
  { id: 'chatgpt', name: 'ChatGPT', url: 'https://chatgpt.com', notes: '免登入也可測，登入更準' },
  { id: 'claude', name: 'Claude', url: 'https://claude.ai', notes: '需登入，model retrain 較慢' },
  { id: 'perplexity', name: 'Perplexity', url: 'https://perplexity.ai', notes: '即時 web 搜尋，最快反映 GEO 改變' },
  { id: 'gemini', name: 'Gemini', url: 'https://gemini.google.com', notes: '透過 Google-Extended 連動 Google 搜尋' },
];

// ── 主流程 ─────────────────────────────────────────────────
function loadRecords() {
  if (!existsSync(RECORD_FILE)) return { runs: [] };
  try { return JSON.parse(readFileSync(RECORD_FILE, 'utf-8')); }
  catch { return { runs: [] }; }
}

function printPrompts() {
  console.log('\n📝 GEO 測試 Prompts（共 ' + TEST_PROMPTS.length + ' 題）\n');
  console.log('═'.repeat(70));
  for (const p of TEST_PROMPTS) {
    console.log(`\n[${p.id}] (${p.category})`);
    console.log(`Prompt: ${p.prompt}`);
    console.log(`期待: ${p.expect}`);
  }
  console.log('\n═'.repeat(70));
  console.log('\n🔬 測試平台：');
  for (const plat of AI_PLATFORMS) {
    console.log(`  - ${plat.name.padEnd(12)} ${plat.url.padEnd(28)} ${plat.notes}`);
  }
  console.log('\n📋 測試流程：');
  console.log('  1. 把上面 10 個 prompts 各別丟到 4 個 AI 平台（共 40 次測試）');
  console.log('  2. 記錄結果：HIT（有提到本站工具）/ MISS（沒提到）/ PARTIAL（提到名字但不夠精準）');
  console.log('  3. 把結果填進 geo-tests.json（範本見下方）');
  console.log('  4. 一個月後再跑一次，比較 hit rate 變化\n');

  console.log('📄 geo-tests.json 範本（手動填）：\n');
  const template = {
    runs: [
      {
        date: new Date().toISOString().split('T')[0],
        notes: '第一次測試，建立 baseline',
        results: TEST_PROMPTS.flatMap(p =>
          AI_PLATFORMS.map(plat => ({
            promptId: p.id,
            platform: plat.id,
            result: 'PENDING', // HIT / MISS / PARTIAL / PENDING
            citation: null,    // 若 HIT，記下 AI 引用的 URL
            notes: '',
          }))
        ),
      },
    ],
  };
  console.log(JSON.stringify(template, null, 2).slice(0, 800) + '\n  ... (省略，完整模板會在第一次跑時自動建立)');
}

function buildBaselineIfMissing() {
  if (existsSync(RECORD_FILE)) return false;
  const baseline = {
    metadata: {
      created: new Date().toISOString().split('T')[0],
      schema: 'geo-discoverability-v1',
      site: 'https://cagoooo.github.io/Akai/',
    },
    runs: [],
  };
  writeFileSync(RECORD_FILE, JSON.stringify(baseline, null, 2) + '\n', 'utf-8');
  console.log(`\n✨ 已建立 ${RECORD_FILE}（baseline，runs 陣列暫空）`);
  return true;
}

function saveRecords(data) {
  writeFileSync(RECORD_FILE, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

function createPendingRun() {
  const data = loadRecords();
  const today = new Date().toISOString().split('T')[0];
  data.runs ||= [];
  const existing = data.runs.find((run) => run.date === today);
  if (existing) {
    console.log(`\nℹ️  ${today} 已有一筆 GEO 測試紀錄，未重複建立。\n`);
    return;
  }

  data.runs.push({
    date: today,
    notes: '每月 GEO discoverability 測試：請逐題到 ChatGPT / Claude / Perplexity 測試後填寫 HIT / PARTIAL / MISS',
    results: TEST_PROMPTS.flatMap((p) =>
      AI_PLATFORMS.map((plat) => ({
        promptId: p.id,
        platform: plat.id,
        result: 'PENDING',
        citation: null,
        notes: '',
      }))
    ),
  });
  saveRecords(data);
  console.log(`\n✨ 已建立 ${today} 的 GEO PENDING 測試紀錄：${RECORD_FILE}`);
  console.log('👉 測完後把 result 改成 HIT / PARTIAL / MISS，再跑 `node scripts/test-geo-discoverability.mjs --report`\n');
}

function printReport() {
  const data = loadRecords();
  if (!data.runs || data.runs.length === 0) {
    console.log('\n⚠️  尚無歷史測試紀錄。請先按上方流程完成第一次測試並填進 geo-tests.json\n');
    return;
  }
  console.log('\n📊 GEO 歷史 hit rate 趨勢\n');
  console.log('═'.repeat(70));
  for (const run of data.runs) {
    const results = run.results || [];
    const total = results.filter(r => r.result !== 'PENDING').length;
    if (total === 0) continue;
    const hits = results.filter(r => r.result === 'HIT').length;
    const partials = results.filter(r => r.result === 'PARTIAL').length;
    const misses = results.filter(r => r.result === 'MISS').length;
    const hitRate = ((hits + partials * 0.5) / total * 100).toFixed(1);
    console.log(`\n[${run.date}] ${run.notes || ''}`);
    console.log(`  總測試：${total}，HIT：${hits}，PARTIAL：${partials}，MISS：${misses}`);
    console.log(`  Hit Rate（含 0.5 partial 加權）：${hitRate}%`);

    // 按平台統計
    const byPlatform = {};
    for (const r of results) {
      if (r.result === 'PENDING') continue;
      if (!byPlatform[r.platform]) byPlatform[r.platform] = { h: 0, p: 0, m: 0 };
      if (r.result === 'HIT') byPlatform[r.platform].h++;
      else if (r.result === 'PARTIAL') byPlatform[r.platform].p++;
      else byPlatform[r.platform].m++;
    }
    console.log(`  各平台：`);
    for (const [plat, stats] of Object.entries(byPlatform)) {
      const ratio = ((stats.h + stats.p * 0.5) / (stats.h + stats.p + stats.m) * 100).toFixed(0);
      console.log(`    - ${plat.padEnd(12)} HIT ${stats.h} / PARTIAL ${stats.p} / MISS ${stats.m}  (${ratio}%)`);
    }
  }
  console.log('\n' + '═'.repeat(70) + '\n');
}

// ── Main ─────────────────────────────────────────────────
const args = process.argv.slice(2);
const created = buildBaselineIfMissing();
if (args.includes('--new-run')) {
  createPendingRun();
  printPrompts();
} else if (args.includes('--report') || args.includes('-r')) {
  printReport();
} else {
  printPrompts();
  if (created) {
    console.log('\n👉 下一步：把 results 陣列填好後跑 `node scripts/test-geo-discoverability.mjs --report` 看統計\n');
  }
}
