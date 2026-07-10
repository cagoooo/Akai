import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  DEPARTMENTS,
  SCHOOL_LEVELS,
  buildAudienceSegmentKey,
  type AudienceProfile,
} from '../client/src/lib/audienceProfile';
import { recommendTools } from '../client/src/lib/audienceRecommendation';
import type { EducationalTool } from '../client/src/lib/data';
import { validateAudienceFit } from '../client/src/lib/audienceValidation';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = resolve(ROOT, 'server', 'data', 'tools.json');
const RECOMMENDATION_LIMIT = 6;

/**
 * 已存在、尚待分批回填 audienceFit 的外部工具。每批回填完成時，必須同步移除對應 ID，
 * 以避免 progressive 模式意外放行新工具。
 */
export const LEGACY_MISSING_AUDIENCE_IDS: ReadonlySet<number> = new Set([
  3, 41, 45, 52, 60, 63, 80, 93, 94, 96, 97, 106, 108, 111,
]);

export const REQUIRED_PROFILES: readonly AudienceProfile[] = [
  { audience: 'student' },
  ...SCHOOL_LEVELS.flatMap((schoolLevel) => [
    { audience: 'teacher' as const, schoolLevel, teacherRole: 'homeroom' as const },
    { audience: 'teacher' as const, schoolLevel, teacherRole: 'subject' as const },
  ]),
  ...SCHOOL_LEVELS.flatMap((schoolLevel) =>
    DEPARTMENTS.map((department) => ({
      audience: 'teacher' as const,
      schoolLevel,
      teacherRole: 'admin' as const,
      department,
    })),
  ),
];

interface Options {
  strict: boolean;
  toolsFile: string;
}

function parseOptions(args: readonly string[]): Options {
  let strict = false;
  let toolsFile = SOURCE;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--strict') {
      strict = true;
      continue;
    }
    if (arg === '--tools-file') {
      const suppliedPath = args[index + 1];
      if (!suppliedPath || suppliedPath.startsWith('--')) {
        throw new Error('--tools-file 必須提供 JSON 檔案路徑。');
      }
      toolsFile = resolve(process.cwd(), suppliedPath);
      index += 1;
      continue;
    }
    throw new Error(`不支援的參數：${arg}`);
  }

  if (!existsSync(toolsFile) || !statSync(toolsFile).isFile()) {
    throw new Error(`找不到 tools JSON 檔案：${toolsFile}`);
  }
  return { strict, toolsFile };
}

function loadTools(toolsFile: string): EducationalTool[] {
  try {
    const data: unknown = JSON.parse(readFileSync(toolsFile, 'utf8'));
    if (!Array.isArray(data)) {
      throw new Error('根節點不是工具陣列。');
    }
    return data as EducationalTool[];
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`無法讀取 tools JSON：${toolsFile}（${message}）`);
  }
}

function formatTool(tool: EducationalTool): string {
  return `#${tool.id} ${tool.title}`;
}

function hasAudienceFit(tool: EducationalTool): boolean {
  return Object.prototype.hasOwnProperty.call(tool, 'audienceFit');
}

function run(): void {
  const options = parseOptions(process.argv.slice(2));
  const tools = loadTools(options.toolsFile);
  const externalTools = tools.filter((tool) => !tool.isInternal);
  const missingAudienceFit = externalTools.filter((tool) => !hasAudienceFit(tool));
  const legacyMissing = missingAudienceFit.filter((tool) => LEGACY_MISSING_AUDIENCE_IDS.has(tool.id));
  const newMissing = missingAudienceFit.filter((tool) => !LEGACY_MISSING_AUDIENCE_IDS.has(tool.id));
  const metadataErrors = externalTools
    .filter(hasAudienceFit)
    .flatMap((tool) => validateAudienceFit(tool.audienceFit).map(
      (message) => `${formatTool(tool)}: ${message}`,
    ));
  const staleBaseline = externalTools.filter((tool) =>
    LEGACY_MISSING_AUDIENCE_IDS.has(tool.id)
    && hasAudienceFit(tool)
    && validateAudienceFit(tool.audienceFit).length === 0,
  );

  if (metadataErrors.length > 0) {
    console.error(metadataErrors.join('\n'));
  }
  if (staleBaseline.length > 0) {
    for (const tool of staleBaseline) {
      console.error(
        `${formatTool(tool)}: 已有合法 audienceFit，請從 LEGACY_MISSING_AUDIENCE_IDS 移除。`,
      );
    }
  }
  if (newMissing.length > 0) {
    for (const tool of newMissing) {
      console.error(`${formatTool(tool)}: 新工具不可缺少 audienceFit`);
    }
  }
  if (options.strict && legacyMissing.length > 0) {
    for (const tool of legacyMissing) {
      console.error(`${formatTool(tool)}: legacy 工具不可缺少 audienceFit（--strict）`);
    }
  }

  const hasBlockingMetadataError = metadataErrors.length > 0
    || staleBaseline.length > 0
    || newMissing.length > 0
    || (options.strict && legacyMissing.length > 0);
  if (hasBlockingMetadataError) {
    process.exitCode = 1;
    return;
  }

  if (legacyMissing.length > 0) {
    for (const tool of legacyMissing) {
      console.warn(`${formatTool(tool)}: legacy 工具尚缺 audienceFit（暫時允許）`);
    }
    console.warn(
      `已略過 ${legacyMissing.length} 個 legacy 工具；待全部回填後才會檢查 ${REQUIRED_PROFILES.length} 個 profile 的推薦覆蓋。`,
    );
    return;
  }

  const segmentCounts = REQUIRED_PROFILES.map((profile) => ({
    key: buildAudienceSegmentKey(profile),
    count: recommendTools(externalTools, profile, RECOMMENDATION_LIMIT).length,
  }));
  const coverageErrors = segmentCounts
    .filter(({ count }) => count < RECOMMENDATION_LIMIT)
    .map(({ key, count }) => `${key} 僅有 ${count} 個推薦結果，低於 ${RECOMMENDATION_LIMIT} 個。`);

  if (coverageErrors.length > 0) {
    console.error(coverageErrors.join('\n'));
    console.error(
      `audienceFit 覆蓋檢查失敗：${REQUIRED_PROFILES.length} 個 profile 中有 ${coverageErrors.length} 個不足 ${RECOMMENDATION_LIMIT} 個推薦結果。`,
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    `audienceFit 驗證通過：${externalTools.length} 個外部工具、${REQUIRED_PROFILES.length} 個 profile。`,
  );
  for (const { key, count } of segmentCounts) {
    console.log(`${key}: ${count}`);
  }
}

try {
  run();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`audienceFit 驗證失敗：${message}`);
  process.exitCode = 1;
}
