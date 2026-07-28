/**
 * 工具上架流水線守門（P1-6，2026-07-28）
 *
 * 背景：#122 上架時，`audienceFit.departments` 陷阱是靠人工實測 6 個 profile 才抓到的；
 * 同一天 #80 補資料時又踩一次，這次沒人測，直接上線。「靠人記得」已被證明會失敗。
 *
 * 這支腳本把「新增工具時必須做到的事」變成 build 會擋下來的硬條件：
 *   1. 卡片主圖 previewUrl 與社群圖 ogPreviewUrl 都有填，而且檔案真的存在
 *   2. 每個工具都有合法的 addedAt
 *   3. 每個工具都有對應的手寫長文 POST_N（toolIds[0] === 工具 id），或列入豁免清單
 *   4. 全 repo 不得把學校名寫成「新明」（正確是石門國小／桃園市龍潭區石門國民小學）
 *
 * 「能不能被推薦引擎撈到」由 validate-audience-fit.ts 負責，兩支都掛在 prebuild。
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { POSTS } from '../client/src/blog/posts';
import type { EducationalTool } from '../client/src/lib/data';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TOOLS_SERVER = resolve(ROOT, 'server', 'data', 'tools.json');
const PUBLIC_DIR = resolve(ROOT, 'client', 'public');

/**
 * 允許沒有手寫長文的工具。加進來之前請先確認「這個工具真的不需要長文」，
 * 而不是「這次先跳過」—— 迷你 blog stub 不算數。
 */
const BLOG_EXEMPT_IDS: ReadonlySet<number> = new Set<number>();

/** 掃「新明」時要看的目錄（跳過 node_modules、dist、快取等） */
const SCHOOL_NAME_SCAN_DIRS = ['client/src', 'client/public', 'server', 'scripts', 'functions/src'];
const SCHOOL_NAME_SCAN_EXTS = ['.ts', '.tsx', '.js', '.mjs', '.cjs', '.json', '.md', '.html', '.txt', '.xml'];
const SCHOOL_NAME_SKIP_DIRS = new Set(['node_modules', 'dist', '.git', 'cache', 'previews', 'assets']);
/** 這支守門腳本自己就寫滿了「新明」當作反例，掃描時要跳過自己 */
const SCHOOL_NAME_SKIP_FILES = new Set(['validate-tool-pipeline.ts']);

/**
 * 「新明」的合法出現：都是刻意寫來提醒「不要寫成新明」的對照文字。
 * 只要該行含有這些字樣就放行；其餘一律視為誤植。
 */
const SCHOOL_NAME_ALLOW_MARKERS = ['不是新明', '誤寫成', '≠ 新明', '≠新明', '已修正'];

const errors: string[] = [];

function loadTools(): EducationalTool[] {
  const data: unknown = JSON.parse(readFileSync(TOOLS_SERVER, 'utf8'));
  if (!Array.isArray(data)) throw new Error('server/data/tools.json 根節點不是陣列');
  return data as EducationalTool[];
}

function checkPreviewAssets(tools: readonly EducationalTool[]): void {
  for (const tool of tools) {
    if (tool.isInternal) continue;
    for (const [field, value] of [
      ['previewUrl', tool.previewUrl],
      ['ogPreviewUrl', tool.ogPreviewUrl],
    ] as const) {
      if (typeof value !== 'string' || value.trim() === '') {
        errors.push(`#${tool.id} ${tool.title}: 缺少 ${field}`);
        continue;
      }
      if (value.startsWith('http')) continue; // 外部圖不檢查檔案
      const assetPath = resolve(PUBLIC_DIR, value.replace(/^\//, ''));
      if (!existsSync(assetPath)) {
        errors.push(`#${tool.id} ${tool.title}: ${field} 指向的檔案不存在 → ${value}`);
      }
    }
  }
}

/**
 * addedAt 是好幾個功能的共同輸入：推薦引擎的 freshness 加分（45 天窗）、
 * 卡片的「🆕 上架 N 天」徽章、推薦理由體檢的「距上次複查幾天」。
 * 缺這個欄位不會報錯，只會讓那些功能對該工具靜默失效 —— 2026-07-28 回填了 97 個，
 * 這道守門是為了不讓洞再被打開。
 */
function checkAddedAt(tools: readonly EducationalTool[]): void {
  for (const tool of tools) {
    if (tool.isInternal) continue;
    const addedAt = tool.addedAt;
    if (typeof addedAt !== 'string' || Number.isNaN(Date.parse(addedAt))) {
      errors.push(
        `#${tool.id} ${tool.title}: 缺少合法的 addedAt（freshness 加分、🆕 徽章、理由複查天數都靠它）`,
      );
    }
  }
}

function checkHandwrittenBlog(tools: readonly EducationalTool[]): void {
  const primaryToolIds = new Set(
    POSTS.map((post) => post.toolIds[0]).filter((id): id is number => typeof id === 'number'),
  );
  for (const tool of tools) {
    if (tool.isInternal || BLOG_EXEMPT_IDS.has(tool.id)) continue;
    if (!primaryToolIds.has(tool.id)) {
      errors.push(
        `#${tool.id} ${tool.title}: 沒有手寫長文（需要一篇 toolIds[0] === ${tool.id} 的 POST_${tool.id}；迷你 blog stub 不算）`,
      );
    }
  }
}

function* walkFiles(dir: string): Generator<string> {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    if (SCHOOL_NAME_SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    let stats;
    try {
      stats = statSync(full);
    } catch {
      continue;
    }
    if (stats.isDirectory()) {
      yield* walkFiles(full);
      continue;
    }
    if (SCHOOL_NAME_SKIP_FILES.has(entry)) continue;
    if (SCHOOL_NAME_SCAN_EXTS.some((ext) => entry.endsWith(ext))) yield full;
  }
}

function checkSchoolName(): void {
  for (const dir of SCHOOL_NAME_SCAN_DIRS) {
    for (const file of walkFiles(resolve(ROOT, dir))) {
      let content: string;
      try {
        content = readFileSync(file, 'utf8');
      } catch {
        continue;
      }
      if (!content.includes('新明')) continue;
      content.split('\n').forEach((line, index) => {
        if (!line.includes('新明')) return;
        if (SCHOOL_NAME_ALLOW_MARKERS.some((marker) => line.includes(marker))) return;
        errors.push(
          `${file.slice(ROOT.length + 1)}:${index + 1}: 出現「新明」——學校名應為「石門國小」或「桃園市龍潭區石門國民小學」`,
        );
      });
    }
  }
}

function run(): void {
  const tools = loadTools();
  checkPreviewAssets(tools);
  checkAddedAt(tools);
  checkHandwrittenBlog(tools);
  checkSchoolName();

  if (errors.length > 0) {
    console.error(errors.join('\n'));
    console.error(`\n工具上架守門失敗：${errors.length} 個問題。`);
    process.exitCode = 1;
    return;
  }

  const external = tools.filter((tool) => !tool.isInternal);
  console.log(
    `工具上架守門通過：${external.length} 個外部工具的預覽圖／社群圖／addedAt／手寫長文齊全，學校名稱無誤植。`,
  );
}

try {
  run();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`工具上架守門執行失敗：${message}`);
  process.exitCode = 1;
}
