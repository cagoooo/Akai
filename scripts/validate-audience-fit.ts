import { readFileSync } from 'node:fs';
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

function loadTools(): EducationalTool[] {
  return JSON.parse(readFileSync(SOURCE, 'utf8')) as EducationalTool[];
}

function run(): void {
  const tools = loadTools();
  const externalTools = tools.filter((tool) => !tool.isInternal);
  const metadataErrors = externalTools.flatMap((tool) =>
    validateAudienceFit(tool.audienceFit).map(
      (message) => `#${tool.id} ${tool.title}: ${message}`,
    ),
  );

  if (metadataErrors.length > 0) {
    console.error(metadataErrors.join('\n'));
    console.error(
      `audienceFit 驗證失敗：${externalTools.length} 個外部工具中共有 ${metadataErrors.length} 個錯誤；已略過 segment 覆蓋檢查。`,
    );
    process.exitCode = 1;
    return;
  }

  const segmentCounts = REQUIRED_PROFILES.map((profile) => ({
    key: buildAudienceSegmentKey(profile),
    count: recommendTools(externalTools, profile, RECOMMENDATION_LIMIT).length,
  }));
  const coverageErrors = segmentCounts
    .filter(({ count }) => count < RECOMMENDATION_LIMIT)
    .map(({ key, count }) => `${key} 僅 ${count} 個推薦（至少需要 ${RECOMMENDATION_LIMIT} 個）`);

  if (coverageErrors.length > 0) {
    console.error(coverageErrors.join('\n'));
    console.error(
      `audienceFit 覆蓋驗證失敗：${REQUIRED_PROFILES.length} 個 profiles 中有 ${coverageErrors.length} 個不足 ${RECOMMENDATION_LIMIT} 項推薦。`,
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    `audienceFit 驗證成功：${externalTools.length} 個外部工具，${REQUIRED_PROFILES.length} 個 profiles。`,
  );
  for (const { key, count } of segmentCounts) {
    console.log(`${key}: ${count}`);
  }
}

run();
