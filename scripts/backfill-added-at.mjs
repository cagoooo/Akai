#!/usr/bin/env node
/**
 * 回填 tools.json 缺少的 addedAt（2026-07-28）
 *
 * 背景：121 個外部工具裡只有 24 個有 addedAt。這個欄位不只推薦理由體檢的
 * 「太久沒複查」在用，推薦引擎的 freshness 加分（45 天窗）與卡片的
 * 「🆕 上架 N 天」徽章也吃它 —— 缺欄位的工具等於永遠拿不到這些判斷。
 *
 * 做法：用 git 的 pickaxe（-S）找出「"id": N,」這個字串第一次出現在
 * server/data/tools.json 的那個 commit，取其 author date 當上架日。
 *
 * 限制（會誠實標記）：tools.json 最早的 commit 是 2026-02-23，
 * 在那一版就已經存在的工具，真實上架日只能確定「不晚於」那天。
 *
 * 用法：
 *   node scripts/backfill-added-at.mjs           # dry-run，只列出會寫什麼
 *   node scripts/backfill-added-at.mjs --write   # 實際寫入兩份 tools.json
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TOOLS_SERVER = resolve(ROOT, 'server', 'data', 'tools.json');
const TOOLS_CLIENT = resolve(ROOT, 'client', 'public', 'api', 'tools.json');
const TRACKED_PATH = 'server/data/tools.json';

const WRITE = process.argv.includes('--write');

/** tools.json 進版控的第一天；在這版就存在的工具只能說「不晚於」這天 */
let earliestCommitISO = null;

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
}

function getEarliestCommitISO() {
  if (earliestCommitISO === null) {
    earliestCommitISO = git(['log', '--reverse', '--format=%aI', '--', TRACKED_PATH])
      .split('\n')[0]
      .trim();
  }
  return earliestCommitISO;
}

/**
 * 找出這個工具 id 第一次出現在 tools.json 的 commit 日期。
 *
 * 用 `"id": N,` 當 pickaxe 字串：結尾的逗號讓 5 不會誤中 50；
 * 開頭的引號讓它不會誤中 `"upgradeFromId": N,`（那裡 id 前面沒有引號）。
 * 縮排從 4 空白改成 2 空白過，但這個字串本身不含縮排，所以兩種格式都比對得到。
 */
function findFirstSeenISO(id) {
  const out = git([
    'log',
    '--reverse',
    '--format=%aI',
    `-S"id": ${id},`,
    '--',
    TRACKED_PATH,
  ]);
  const first = out.split('\n').find((line) => line.trim().length > 0);
  return first ? first.trim() : null;
}

const serverTools = JSON.parse(readFileSync(TOOLS_SERVER, 'utf8'));
const missing = serverTools.filter((tool) => !tool.isInternal && typeof tool.addedAt !== 'string');

console.log(`外部工具缺 addedAt 的有 ${missing.length} 個，開始從 git 歷史推導…\n`);

const resolved = new Map();
const unresolved = [];
let atEarliest = 0;

for (const tool of missing) {
  const iso = findFirstSeenISO(tool.id);
  if (!iso) {
    unresolved.push(tool);
    continue;
  }
  if (iso === getEarliestCommitISO()) atEarliest += 1;
  resolved.set(tool.id, iso);
}

const sorted = [...resolved.entries()].sort((a, b) => a[0] - b[0]);
for (const [id, iso] of sorted) {
  const tool = serverTools.find((t) => t.id === id);
  const note = iso === getEarliestCommitISO() ? '  ← 首版就存在，實際只能確定「不晚於」此日' : '';
  console.log(`  #${String(id).padEnd(4)} ${iso.slice(0, 10)}  ${tool.title.slice(0, 26)}${note}`);
}

console.log(`\n推導成功 ${resolved.size} 個，其中 ${atEarliest} 個落在首版 commit（${getEarliestCommitISO().slice(0, 10)}）。`);
if (unresolved.length > 0) {
  console.warn(`推導失敗 ${unresolved.length} 個：${unresolved.map((t) => `#${t.id}`).join(', ')}`);
}

if (!WRITE) {
  console.log('\n（dry-run，未寫入。確認無誤後加 --write）');
  process.exit(0);
}

function applyTo(path) {
  const tools = JSON.parse(readFileSync(path, 'utf8'));
  let count = 0;
  const next = tools.map((tool) => {
    const iso = resolved.get(tool.id);
    if (!iso || typeof tool.addedAt === 'string') return tool;
    count += 1;
    // 依既有慣例把 addedAt 放在最後一個欄位，維持 diff 可讀
    return { ...tool, addedAt: iso };
  });
  writeFileSync(path, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  console.log(`${path}：寫入 ${count} 個 addedAt`);
}

applyTo(TOOLS_SERVER);
applyTo(TOOLS_CLIENT);
console.log('\n✅ 完成。記得跑 npm run build 讓 sitemap／feed 一起更新。');
