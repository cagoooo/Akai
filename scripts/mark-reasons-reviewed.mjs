#!/usr/bin/env node
/**
 * 標記推薦理由已複查（2026-07-28）
 *
 * `audienceFit.reasonsReviewedAt` 過去只存在於型別裡，**沒有任何流程會寫它** ——
 * 於是「距上次複查幾天」永遠只能從 addedAt 起算，數字只會單向長大，
 * 複查完也沒辦法歸零，等於這個欄位是死的。
 *
 * 這支腳本就是那個入口：改完某條理由後蓋個章。
 *
 * 用法：
 *   node scripts/mark-reasons-reviewed.mjs 9 28 30        # 標記這幾個工具
 *   node scripts/mark-reasons-reviewed.mjs 9 --date 2026-07-01
 *   npm run reasons:reviewed -- 9 28 30
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TARGETS = [
  resolve(ROOT, 'server', 'data', 'tools.json'),
  resolve(ROOT, 'client', 'public', 'api', 'tools.json'),
];

const args = process.argv.slice(2);
const ids = [];
let stampISO = new Date().toISOString();

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === '--date') {
    const value = args[i + 1];
    if (!value || Number.isNaN(Date.parse(value))) {
      console.error('--date 需要一個合法日期，例如 --date 2026-07-01');
      process.exit(1);
    }
    stampISO = new Date(value).toISOString();
    i += 1;
    continue;
  }
  const id = Number.parseInt(arg, 10);
  if (!Number.isInteger(id) || id <= 0) {
    console.error(`不認得的參數：${arg}（要傳工具 id，例如 9 28 30）`);
    process.exit(1);
  }
  ids.push(id);
}

if (ids.length === 0) {
  console.error('請至少指定一個工具 id，例如：npm run reasons:reviewed -- 9 28 30');
  process.exit(1);
}

let missing = null;
let stamped = 0;

for (const path of TARGETS) {
  const tools = JSON.parse(readFileSync(path, 'utf8'));
  const notFound = ids.filter((id) => !tools.some((tool) => tool.id === id));
  // server/data/tools.json 依設計不含 #100（client-only 工具），所以只有兩份都缺才算錯
  missing = missing === null ? notFound : missing.filter((id) => notFound.includes(id));

  const next = tools.map((tool) => {
    if (!ids.includes(tool.id)) return tool;
    if (!tool.audienceFit) {
      console.warn(`  #${tool.id} 沒有 audienceFit，略過`);
      return tool;
    }
    stamped += 1;
    return { ...tool, audienceFit: { ...tool.audienceFit, reasonsReviewedAt: stampISO } };
  });
  writeFileSync(path, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
}

if (missing && missing.length > 0) {
  console.error(`找不到這些工具 id：${missing.join(', ')}`);
  process.exit(1);
}

console.log(`✅ 已標記 ${ids.length} 個工具的推薦理由為「${stampISO.slice(0, 10)} 複查過」（兩份 tools.json 共寫入 ${stamped} 筆）`);
console.log('   下次跑 npm run validate:audience 或看 Admin →「推薦理由體檢」，天數就會從今天重算。');
