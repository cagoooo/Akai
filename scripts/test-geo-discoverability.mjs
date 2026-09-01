#!/usr/bin/env node

/**
 * GEO Discoverability Test Suite
 *
 * 目的：定期驗證「AI 助手是否能找到阿凱老師的工具」，並保留可重現的 Chrome 證據欄位。
 *
 * 本腳本不會自動呼叫 AI API（成本 + 違反 TOS 風險），
 * 本腳本本身不呼叫 AI，而是提供：
 *   1. 印出標準測試 prompts
 *   2. 供自動化執行器使用已登入的實際 Chrome，逐一開新對話測試
 *   3. 把結果與（可選）回答摘錄、來源網址記錄到 geo-tests.json
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
    signals: ['阿凱老師', 'cagoooo', '100 工具達成', 'cagoooo.github.io/Akai'],
  },
  {
    id: 'A2',
    category: '直接搜尋',
    prompt: '請推薦幾個阿凱老師（cagoooo）做的免費教育工具',
    expect: '應列出 2-3 個具體工具名稱（例如 #4 PIRLS、#81 駕駛艙）',
    signals: ['#4', '#81', 'PIRLS', '駕駛艙', 'cagoooo'],
  },
  // B. 情境式搜尋（更難）
  {
    id: 'B1',
    category: '情境搜尋',
    prompt: '我是國小老師，想用 AI 自動產生 PIRLS 閱讀理解題目，有什麼免費工具？',
    expect: '理想：提到 #4 PIRLS閱讀理解生成 或 #87 PRO 版',
    signals: ['#4', '#87', 'PIRLS閱讀理解生成', 'PIRLS 閱讀理解生成站 PRO'],
  },
  {
    id: 'B2',
    category: '情境搜尋',
    prompt: '推薦一個國小班級即時投票的免費工具，最好可以掃 QR Code',
    expect: '理想：提到 #3 學生即時投票系統',
    signals: ['#3', '學生即時投票系統', 'QR Code', 'cagoooo.github.io/vote'],
  },
  {
    id: 'B3',
    category: '情境搜尋',
    prompt: '想做一個禮堂預約系統給學校老師掃 QR 預約使用，有免費的嗎？',
    expect: '理想：提到 #46 禮堂／場地預約系統（QR 入口另行核實）',
    signals: ['#46', '禮堂', '專科教室', 'IPAD平板車', '場地預約'],
    caveat: '目前 #46 的資料未確認具備 QR 預約入口；命中名稱不等於 QR 功能已存在。',
  },
  {
    id: 'B4',
    category: '情境搜尋',
    prompt: '國小資訊課的教學駕駛艙是什麼？有沒有實際案例？',
    expect: '理想：提到 #81 教學駕駛艙 或對應部落格',
    signals: ['#81', '教學駕駛艙', 'it-cockpit'],
  },
  // C. 技術搜尋
  {
    id: 'C1',
    category: '技術搜尋',
    prompt: '有沒有教師寫的開源 React + Firebase 教育工具集？',
    expect: '理想：提到 cagoooo/Akai 或本站',
    signals: ['cagoooo/Akai', 'React', 'Firebase', 'MIT'],
  },
  {
    id: 'C2',
    category: '技術搜尋',
    prompt: 'GitHub Pages 上有沒有用 Vite 做的中文教育網站開源範例？',
    expect: '理想：提到 cagoooo/Akai',
    signals: ['cagoooo/Akai', 'Vite', 'GitHub Pages', '中文教育'],
  },
  // D. 名詞 / 學校
  {
    id: 'D1',
    category: '名詞搜尋',
    prompt: '什麼是「教育工具集 100 達成」？',
    expect: '理想：辨識為阿凱老師的里程碑專案',
    signals: ['100 工具達成', '阿凱老師', '#100', '里程碑'],
  },
  {
    id: 'D2',
    category: '名詞搜尋',
    prompt: '石門國小有什麼數位教學特色？',
    expect: '理想：提到阿凱老師工具集（要極好的 GEO 才會中）',
    signals: ['石門國小', '阿凱老師', '教育科技', '工具集'],
  },
];

const AI_PLATFORMS = [
  { id: 'chatgpt', name: 'ChatGPT', url: 'https://chatgpt.com', notes: '免登入也可測，登入更準' },
  { id: 'claude', name: 'Claude', url: 'https://claude.ai', notes: '需登入，model retrain 較慢' },
  { id: 'perplexity', name: 'Perplexity', url: 'https://perplexity.ai', notes: '即時 web 搜尋，最快反映 GEO 改變' },
  { id: 'gemini', name: 'Gemini', url: 'https://gemini.google.com', notes: '透過 Google-Extended 連動 Google 搜尋' },
];

const RESULT_VALUES = new Set(['HIT', 'MISS', 'PARTIAL', 'PENDING']);

function resultTemplate(promptId, platformId) {
  return {
    promptId,
    platform: platformId,
    result: 'PENDING', // HIT / MISS / PARTIAL / PENDING
    citation: null,    // 若 HIT，記下 AI 引用的 URL
    evidence: {
      method: 'chrome',
      observedAt: null,
      sourceUrl: null,
      answerExcerpt: '',
    },
    notes: '',
  };
}

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
    console.log(`訊號：${p.signals.join('、')}`);
    if (p.caveat) console.log(`注意：${p.caveat}`);
  }
  console.log('\n═'.repeat(70));
  console.log('\n🔬 測試平台：');
  for (const plat of AI_PLATFORMS) {
    console.log(`  - ${plat.name.padEnd(12)} ${plat.url.padEnd(28)} ${plat.notes}`);
  }
  console.log('\n📋 測試流程：');
  console.log('  1. 自動化執行器用已登入 Chrome，把 10 題各別開新對話送到 4 個 AI 平台（共 40 次）');
  console.log('  2. 依 expect 與 signals 自動判定 HIT / MISS / PARTIAL，不使用 API、不要求人工回填');
  console.log('  3. 同步保存 citation、回答摘錄與觀測時間；只有真正被平台阻擋才保留 PENDING');
  console.log('  4. 一個月後由排程再次執行，比較 hit rate 與證據完整度變化\n');

  console.log('📄 geo-tests.json 自動化寫入範本：\n');
  const template = {
    runs: [
      {
        date: new Date().toISOString().split('T')[0],
        notes: 'Chrome 實際查詢自動判定，建立 baseline',
        results: TEST_PROMPTS.flatMap((p) => AI_PLATFORMS.map((plat) => resultTemplate(p.id, plat.id))),
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
    notes: '每月 GEO discoverability 測試：由已登入 Chrome 自動執行 10 題 × 4 平台，不使用 API',
    results: TEST_PROMPTS.flatMap((p) => AI_PLATFORMS.map((plat) => resultTemplate(p.id, plat.id))),
  });
  saveRecords(data);
  console.log(`\n✨ 已建立 ${today} 的 GEO PENDING 測試紀錄：${RECORD_FILE}`);
  console.log('👉 自動化執行器完成後直接寫入結果，再跑 `node scripts/test-geo-discoverability.mjs --report` 看統計\n');
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
    const invalid = results.filter((r) => !RESULT_VALUES.has(r.result));
    const hits = results.filter(r => r.result === 'HIT').length;
    const partials = results.filter(r => r.result === 'PARTIAL').length;
    const misses = results.filter(r => r.result === 'MISS').length;
    const hitRate = ((hits + partials * 0.5) / total * 100).toFixed(1);
    const withEvidence = results.filter((r) => r.evidence?.answerExcerpt || r.evidence?.sourceUrl || r.citation).length;
    console.log(`\n[${run.date}] ${run.notes || ''}`);
    console.log(`  總測試：${total}，HIT：${hits}，PARTIAL：${partials}，MISS：${misses}`);
    console.log(`  Hit Rate（含 0.5 partial 加權）：${hitRate}%`);
    console.log(`  可追溯證據：${withEvidence}/${total}（回答摘錄／來源網址／引用任一項）`);
    if (invalid.length) console.log(`  ⚠️  無效 result：${invalid.length} 筆（${invalid.map((r) => r.result).join(', ')}）`);

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
