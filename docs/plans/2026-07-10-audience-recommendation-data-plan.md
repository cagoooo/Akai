# 客群資料、推薦引擎與新工具自動納入 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers-subagent-driven` (recommended) or inline execution to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 讓每張工具卡以 `audienceFit` 描述適用客群，完成既有工具廣度審查，並由純函式推薦引擎動態選出六項結果。

**Architecture:** `server/data/tools.json` 維持工具資料 SSOT，`sync-tools-json.mjs` 產生 client 副本。TypeScript 型別、驗證器與推薦器放在小型純函式模組；`new-tool.mjs` 在寫入前收集並驗證 `audienceFit`，不再維護固定推薦 ID 名單。

**Tech Stack:** TypeScript、Vitest、tsx、Node.js 22、JSON、現有 tools sync pipeline。

---

## File structure

- Modify `client/src/lib/data.ts`: 客群型別與 `EducationalTool.audienceFit`。
- Create `client/src/lib/audienceProfile.ts`: profile 型別、列舉與 segment key。
- Create `client/src/lib/audienceValidation.ts`: schema 與完整性驗證。
- Create `client/src/lib/audienceRecommendation.ts`: eligibility、評分、組成與理由。
- Create `client/src/lib/__tests__/audienceValidation.test.ts`。
- Create `client/src/lib/__tests__/audienceRecommendation.test.ts`。
- Create `scripts/validate-audience-fit.ts`: 驗證 SSOT 與 client 同步結果。
- Modify `scripts/new-tool.mjs`: 互動式建立客群中繼資料。
- Modify `server/data/tools.json`: 既有 115 個外部工具客群回填。
- Modify `client/public/api/tools.json`: 由 sync 腳本產生；#100 保持 internal。
- Modify `package.json`: 新增 `validate:audience` 並接入 `predev`／`prebuild`。

### Task 1: 定義 profile、audienceFit 與驗證契約

**Files:**
- Modify: `client/src/lib/data.ts`
- Create: `client/src/lib/audienceProfile.ts`
- Create: `client/src/lib/audienceValidation.ts`
- Test: `client/src/lib/__tests__/audienceValidation.test.ts`

- [ ] **Step 1: 寫失敗測試，鎖定省略代表不限與矛盾資料拒絕規則**

```ts
import { describe, expect, it } from 'vitest';
import { validateAudienceFit } from '@/lib/audienceValidation';

describe('validateAudienceFit', () => {
  it('接受跨學段、跨職務的老師工具', () => {
    expect(validateAudienceFit({
      audiences: ['teacher'],
      painPoints: ['meeting-notes'],
      priority: 90,
      reasons: { teacher: '所有老師都能快速整理會議內容。' },
    })).toEqual([]);
  });

  it('拒絕學生專用工具卻填 teacherRoles', () => {
    expect(validateAudienceFit({
      audiences: ['student'], teacherRoles: ['homeroom'],
      painPoints: ['practice'], priority: 60,
      reasons: { student: '適合自主練習。' },
    })).toContain('非老師工具不可設定 teacherRoles');
  });

  it('拒絕沒有痛點、理由或超出範圍的優先度', () => {
    const errors = validateAudienceFit({ audiences: ['teacher'], painPoints: [], priority: 101, reasons: {} });
    expect(errors).toEqual(expect.arrayContaining(['painPoints 至少需要一項', 'priority 必須介於 0 到 100', '至少需要一則可用推薦理由']));
  });
});
```

- [ ] **Step 2: 執行測試並確認紅燈**

Run: `npm test -- --run client/src/lib/__tests__/audienceValidation.test.ts`

Expected: FAIL，原因為 `@/lib/audienceValidation` 尚不存在。

- [ ] **Step 3: 建立完整型別與驗證器**

```ts
export const AUDIENCE_TYPES = ['teacher', 'student'] as const;
export const SCHOOL_LEVELS = ['elementary', 'junior', 'senior'] as const;
export const TEACHER_ROLES = ['homeroom', 'subject', 'admin'] as const;
export const DEPARTMENTS = ['academic', 'student-affairs', 'general-affairs', 'counseling', 'other'] as const;

export type AudienceType = typeof AUDIENCE_TYPES[number];
export type SchoolLevel = typeof SCHOOL_LEVELS[number];
export type TeacherRole = typeof TEACHER_ROLES[number];
export type Department = typeof DEPARTMENTS[number];

export interface AudienceProfile {
  audience: AudienceType;
  schoolLevel?: SchoolLevel;
  teacherRole?: TeacherRole;
  department?: Department;
}

export function buildAudienceSegmentKey(profile: AudienceProfile): string {
  return [profile.audience, profile.schoolLevel, profile.teacherRole, profile.department]
    .filter(Boolean).join('_');
}
```

在 `data.ts` 定義 `AudienceFit`，並於 `EducationalTool` 新增 `audienceFit?: AudienceFit`；#100 `isInternal` 可省略，其餘外部工具由 validator 強制必填。

- [ ] **Step 4: 執行測試與型別檢查**

Run: `npm test -- --run client/src/lib/__tests__/audienceValidation.test.ts && npm run check`

Expected: 3 tests PASS；TypeScript exit 0。

- [ ] **Step 5: 提交型別契約**

```powershell
git add client/src/lib/data.ts client/src/lib/audienceProfile.ts client/src/lib/audienceValidation.ts client/src/lib/__tests__/audienceValidation.test.ts
git commit -m "feat: define audience recommendation schema"
```

### Task 2: 建立資料驅動的六席推薦引擎

**Files:**
- Create: `client/src/lib/audienceRecommendation.ts`
- Test: `client/src/lib/__tests__/audienceRecommendation.test.ts`

- [ ] **Step 1: 寫失敗測試，鎖定跨客群、職務加權與結果組成**

```ts
const makeTool = (id: number, audienceFit: AudienceFit, tags: string[] = []): EducationalTool => ({
  id, title: `工具 ${id}`, description: '測試工具', detailedDescription: '測試用途',
  url: `https://example.com/${id}`, icon: 'Sparkles', category: 'utilities', tags, audienceFit,
});
const meetingTool = makeTool(84, {
  audiences: ['teacher'], painPoints: ['meeting-notes'], priority: 90,
  reasons: { teacher: '快速整理會議內容。', admin: '行政會議可直接摘要匯出。' },
});
const fillers = Array.from({ length: 8 }, (_, index) => makeTool(index + 120, {
  audiences: ['teacher'], painPoints: [`need-${index}`], priority: 50 - index,
  reasons: { teacher: `老師推薦理由 ${index}` },
}));

it.each(['homeroom', 'subject', 'admin'] as const)('會議工具涵蓋 %s', (teacherRole) => {
  const profile = { audience: 'teacher' as const, schoolLevel: 'elementary' as const, teacherRole };
  expect(recommendTools([meetingTool, ...fillers], profile, 6).map((x) => x.tool.id)).toContain(84);
});

it('行政教務精準工具高於一般探索工具且結果不重複', () => {
  const academicTool = makeTool(78, {
    audiences: ['teacher'], teacherRoles: ['admin'], departments: ['academic'],
    painPoints: ['curriculum-review'], priority: 88, reasons: { academic: '加速課程計畫審查。' },
  });
  const result = recommendTools([meetingTool, academicTool, ...fillers], {
    audience: 'teacher', schoolLevel: 'junior', teacherRole: 'admin', department: 'academic',
  }, 6);
  expect(result).toHaveLength(6);
  expect(new Set(result.map((x) => x.tool.id)).size).toBe(6);
  expect(result.findIndex((x) => x.tool.id === 78)).toBeLessThan(result.findIndex((x) => x.slot === 'discovery'));
});
```

- [ ] **Step 2: 執行測試並確認紅燈**

Run: `npm test -- --run client/src/lib/__tests__/audienceRecommendation.test.ts`

Expected: FAIL，原因為 `recommendTools` 尚不存在。

- [ ] **Step 3: 實作 eligibility、score、reason 與六席組成**

```ts
export type RecommendationSlot = 'universal' | 'role' | 'stage' | 'discovery';
export interface AudienceRecommendation { tool: EducationalTool; reason: string; score: number; slot: RecommendationSlot }

export function recommendTools(tools: EducationalTool[], profile: AudienceProfile, limit = 6): AudienceRecommendation[] {
  const ranked = tools
    .filter((tool) => !tool.isInternal && tool.audienceFit && isEligible(tool.audienceFit, profile))
    .map((tool) => scoreTool(tool, profile))
    .sort((a, b) => b.score - a.score || a.tool.id - b.tool.id);
  return composeRecommendationSlots(ranked, limit);
}
```

`scoreTool()` 使用固定權重：base priority、職務 +30、處室 +25、學段 +15、精準理由 +10；`composeRecommendationSlots()` 依序取 2 universal、2 role、1 stage、1 discovery，再以最高分補空位。

- [ ] **Step 4: 執行推薦測試**

Run: `npm test -- --run client/src/lib/__tests__/audienceRecommendation.test.ts`

Expected: 所有測試 PASS；每個結果有非空白繁體中文 reason。

- [ ] **Step 5: 提交推薦引擎**

```powershell
git add client/src/lib/audienceRecommendation.ts client/src/lib/__tests__/audienceRecommendation.test.ts
git commit -m "feat: add audience recommendation engine"
```

### Task 3: 建立全工具驗證命令

**Files:**
- Create: `scripts/validate-audience-fit.ts`
- Modify: `package.json`

- [ ] **Step 1: 寫 CLI，輸出缺資料工具 ID 與每個 segment 覆蓋量**

```ts
const externalTools = tools.filter((tool) => !tool.isInternal);
const invalid = externalTools.flatMap((tool) =>
  validateAudienceFit(tool.audienceFit).map((message) => `#${tool.id} ${tool.title}: ${message}`)
);
if (invalid.length) {
  console.error(invalid.join('\n'));
  process.exit(1);
}
for (const profile of REQUIRED_PROFILES) {
  const count = recommendTools(externalTools, profile, 6).length;
  if (count < 6) throw new Error(`${buildAudienceSegmentKey(profile)} 僅 ${count} 個推薦`);
}
```

- [ ] **Step 2: 新增 package script**

```json
"validate:audience": "tsx scripts/validate-audience-fit.ts",
"predev": "npm run validate:audience && node scripts/sync-tools-json.mjs",
"prebuild": "npm run validate:audience && node scripts/sync-tools-json.mjs"
```

- [ ] **Step 3: 執行並確認目前因未回填而失敗**

Run: `npm run validate:audience`

Expected: FAIL，列出 #1～#116 中缺少 `audienceFit` 的外部工具；#100 不列入。

- [ ] **Step 4: 提交 validator，不提交 JSON 回填**

```powershell
git add scripts/validate-audience-fit.ts package.json
git commit -m "test: require audience metadata for tools"
```

### Task 4: 回填 communication、reading、language、teaching

**Files:**
- Modify: `server/data/tools.json`

- [ ] **Step 1: 逐一審查並回填 communication IDs**

IDs: `1,16,59,62,74,89`。#89 必須涵蓋全部老師職務；活動限定工具依真實使用情境限制。

- [ ] **Step 2: 逐一審查並回填 reading 與 language IDs**

Reading: `4,12,87`。Language: `20,21,22,25,43,55,61,67,70,71,77,79,91`。練習型工具檢查學生與老師雙客群；教師生產力工具檢查跨學段。

- [ ] **Step 3: 逐一審查並回填 teaching IDs**

IDs: `7,8,11,13,23,26,29,44,49,54,58,64,65,66,76,81,90,92,99,103,105`。#58、#76、#99 檢查所有老師職務；#49 檢查教務行政。

- [ ] **Step 4: 執行 JSON 解析、同步與 validator，確認只剩其他分類缺資料**

```powershell
node -e "JSON.parse(require('fs').readFileSync('server/data/tools.json','utf8')); console.log('JSON OK')"
npm run sync-tools-json
npm run validate:audience
```

Expected: JSON 與 sync 成功；validator 只列出 games、interactive、utilities 工具。

- [ ] **Step 5: 提交第一批回填**

```powershell
git add server/data/tools.json client/public/api/tools.json
git commit -m "data: classify teaching and language audiences"
```

### Task 5: 回填 games 與 interactive

**Files:**
- Modify: `server/data/tools.json`

- [ ] **Step 1: 回填 games IDs**

IDs: `6,9,28,30,31,32,33,34,35,36,37,38,39,50,56,69,85,101,102,112,115`。一般遊戲預設學生；可用於班級獎勵或課堂活動者同時標記老師，推薦理由不可把娛樂用途寫成教學成效。

- [ ] **Step 2: 回填 interactive IDs**

IDs: `3,41,45,52,60,63,93,94,96,97,106,108,111`。#45、#97、#108 檢查教師與學生雙客群；活動站依內容限制。

- [ ] **Step 3: 同步並檢查剩餘缺資料只包含 utilities**

Run: `npm run sync-tools-json; npm run validate:audience`

Expected: validator 只列出 utilities IDs。

- [ ] **Step 4: 提交遊戲與互動回填**

```powershell
git add server/data/tools.json client/public/api/tools.json
git commit -m "data: classify game and interactive audiences"
```

### Task 6: 回填 utilities 並完成廣度審查

**Files:**
- Modify: `server/data/tools.json`

- [ ] **Step 1: 回填 utilities 第一批**

IDs: `2,5,10,14,15,17,18,19,24,27,40,42,46,47,48,51,53,57,68,72`。

- [ ] **Step 2: 回填 utilities 第二批**

IDs: `73,75,78,80,82,83,84,86,88,95,98,104,107,109,110,113,114,116`。#84 必須省略 schoolLevels 與 teacherRoles，並提供 teacher、homeroom、subject、admin 理由；#75、#110、#116 檢查跨職務價值。

- [ ] **Step 3: 執行完整驗證並檢查所有 segment 至少六項**

Run: `npm run sync-tools-json; npm run validate:audience`

Expected: exit 0；輸出所有必需 segment 的推薦數皆 ≥ 6。

- [ ] **Step 4: 執行推薦與 schema 測試**

Run: `npm test -- --run client/src/lib/__tests__/audienceValidation.test.ts client/src/lib/__tests__/audienceRecommendation.test.ts`

Expected: PASS。

- [ ] **Step 5: 提交 utilities 回填**

```powershell
git add server/data/tools.json client/public/api/tools.json
git commit -m "data: complete audience coverage for all tools"
```

### Task 7: 讓 new-tool 流程建立並驗證 audienceFit

**Files:**
- Modify: `scripts/new-tool.mjs`
- Test: `client/src/lib/__tests__/audienceValidation.test.ts`

- [ ] **Step 1: 新增測試，驗證新工具範例能跨客群**

```ts
it('接受老師與學生雙客群的新工具', () => {
  expect(validateAudienceFit({
    audiences: ['teacher', 'student'],
    schoolLevels: ['elementary'],
    painPoints: ['practice', 'classroom-activity'], priority: 72,
    reasons: { teacher: '可作為課堂練習活動。', student: '可自主闖關練習。' },
  })).toEqual([]);
});
```

- [ ] **Step 2: 在 CLI 加入多選 helper 與客群問題**

```js
const askMultiChoice = async (question, choices) => {
  const raw = await ask(`${question}（輸入逗號分隔編號）`);
  const indexes = [...new Set(raw.split(/[,，]/).map((v) => Number(v.trim()) - 1))];
  return indexes.filter((i) => i >= 0 && i < choices.length).map((i) => choices[i].key);
};
```

依序詢問 audiences、schoolLevels、teacherRoles、departments、painPoints、priority 與理由；非互動參數支援 `--audiences teacher,student` 等同名 flags。

- [ ] **Step 3: 寫入前驗證，失敗時不改 JSON**

```js
const audienceErrors = validateAudienceFitInput(audienceFit);
if (audienceErrors.length > 0) {
  console.error(audienceErrors.map((x) => `  ❌ ${x}`).join('\n'));
  exit(1);
}
```

- [ ] **Step 4: 跑 dry-run 驗證非互動範例**

在建立 readline 前新增 `--help` 分支，列出 `--audiences`、`--school-levels`、`--teacher-roles`、`--departments`、`--pain-points`、`--priority` 與 reason flags 後直接 exit 0。

Run: `node scripts/new-tool.mjs --help`

Expected: 說明列出所有 audience flags；不得修改 tools.json。

- [ ] **Step 5: 執行測試、validator 與 build**

Run: `npm test -- --run client/src/lib/__tests__/audienceValidation.test.ts && npm run validate:audience && npm run check`

Expected: 全部 PASS。

- [ ] **Step 6: 提交 new-tool 自動納入流程**

```powershell
git add scripts/new-tool.mjs client/src/lib/__tests__/audienceValidation.test.ts
git commit -m "feat: classify audiences during tool creation"
```

### Task 8: 第一階段整合驗證

**Files:**
- Verify only

- [ ] **Step 1: 執行完整資料與單元測試**

```powershell
npm run validate:audience
npm test -- --run client/src/lib/__tests__/audienceValidation.test.ts client/src/lib/__tests__/audienceRecommendation.test.ts
npm run check
```

Expected: 全部 exit 0。

- [ ] **Step 2: 執行 build，確認 prebuild 會先驗證**

Run: `npm run build`

Expected: `validate:audience`、sync、Vite 與 server bundle 全部成功。

- [ ] **Step 3: 檢查 SSOT 同步差異**

Run: `npm run sync-tools-json; git diff --exit-code -- client/public/api/tools.json`

Expected: exit 0，代表 client 副本已同步。

- [ ] **Step 4: 若驗證產生版本檔，僅提交本階段必要產物**

```powershell
git status --short
git add package.json server/data/tools.json client/public/api/tools.json client/src/lib scripts/new-tool.mjs scripts/validate-audience-fit.ts
git commit -m "feat: complete audience recommendation data foundation"
```

若沒有新差異，略過空 commit。
