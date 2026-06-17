#!/usr/bin/env node
/**
 * sync-tools-json.mjs — 把 server/data/tools.json 同步到 client/public/api/tools.json
 *
 * 規則：
 *   - server/data/tools.json = 單一來源（Single Source of Truth），id 1-99
 *   - client/public/api/tools.json = 衍生檔，內容 = server 全部 + #100 工具索引神器
 *   - #100 是「特殊工具」（路由 /tool/100 走 ToolIndexAI 元件），只存在 client 端
 *
 * 自動觸發：package.json 的 predev / prebuild
 * 手動觸發：npm run sync-tools-json
 *
 * 若 #100 在 client 中缺失，會 fail-loud 提示要手動補回
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SOURCE = resolve(ROOT, 'server', 'data', 'tools.json');
const TARGET = resolve(ROOT, 'client', 'public', 'api', 'tools.json');

const HIGHLIGHT = (s) => `\x1b[36m${s}\x1b[0m`;
const ERROR = (s) => `\x1b[31m${s}\x1b[0m`;
const OK = (s) => `\x1b[32m${s}\x1b[0m`;

function run() {
  if (!existsSync(SOURCE)) {
    console.error(ERROR(`❌ 找不到 source: ${SOURCE}`));
    process.exit(1);
  }
  if (!existsSync(TARGET)) {
    console.error(ERROR(`❌ 找不到 target: ${TARGET}`));
    process.exit(1);
  }

  const source = JSON.parse(readFileSync(SOURCE, 'utf-8'));
  const target = JSON.parse(readFileSync(TARGET, 'utf-8'));

  // 從 target 取出 #100 entry（必須保留）
  const tool100 = target.find((t) => t.id === 100);
  if (!tool100) {
    console.error(
      ERROR(
        `❌ client/public/api/tools.json 沒有 #100 工具索引神器 entry！\n` +
          `   請先手動補回 #100 entry 再執行 sync。`,
      ),
    );
    process.exit(1);
  }

  // 檢查 source 確實沒有 #100（避免重複）
  if (source.some((t) => t.id === 100)) {
    console.error(
      ERROR(
        `❌ server/data/tools.json 不應該有 #100 entry（#100 只能存在 client 端）！\n` +
          `   請從 server 移除 #100。`,
      ),
    );
    process.exit(1);
  }

  // 組裝：source 全部 + #100
  const merged = [...source, tool100];

  // 比對是否需要實際寫入
  const currentTarget = JSON.stringify(target, null, 2);
  const newTarget = JSON.stringify(merged, null, 2) + '\n';

  if (currentTarget + '\n' !== newTarget) {
    // 找出哪些 tool 差異了（debug 用）
    const diffIds = [];
    for (const s of source) {
      const t = target.find((x) => x.id === s.id);
      if (!t || JSON.stringify(t) !== JSON.stringify(s)) {
        diffIds.push(s.id);
      }
    }

    writeFileSync(TARGET, newTarget, 'utf-8');
    console.log(OK(`✅ sync 完成：server (${source.length}) → client (${merged.length}，含 #100)`));
    if (diffIds.length > 0) {
      console.log(
        HIGHLIGHT(
          `   📝 異動工具 id：${diffIds.length > 20 ? diffIds.slice(0, 20).join(',') + '...' : diffIds.join(',')}`,
        ),
      );
    }
  } else {
    console.log(OK(`✅ tools.json 已同步，無需更新（${source.length} + #100 = ${merged.length}）`));
  }

  // 自動生成 client/src/lib/toolUrlMap.ts
  const mapEntries = {};
  for (const t of merged) {
    if (t.id && t.url && typeof t.url === 'string' && t.url.startsWith('http')) {
      mapEntries[t.url] = t.id;
    }
  }

  const mapFilePath = resolve(ROOT, 'client', 'src', 'lib', 'toolUrlMap.ts');
  const mapFileContent = `// 由 scripts/sync-tools-json.mjs 自動產生，請勿手動修改
export const TOOL_URL_MAP: Record<string, number> = ${JSON.stringify(mapEntries, null, 2)};
`;

  let currentMapContent = '';
  if (existsSync(mapFilePath)) {
    currentMapContent = readFileSync(mapFilePath, 'utf-8');
  }

  if (currentMapContent !== mapFileContent) {
    writeFileSync(mapFilePath, mapFileContent, 'utf-8');
    console.log(OK(`✅ 已自動更新 toolUrlMap.ts，共 ${Object.keys(mapEntries).length} 筆對應`));
  }
}

run();
