# 匿名客群分析與 Admin 儀表板 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers-subagent-driven` (recommended) or inline execution to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 以欄位白名單 callable 將精靈漏斗、匿名客群分布與推薦 CTR 原子加總，並在 Admin 以日期範圍查看。

**Architecture:** Client analytics adapter 同時送 GA 與 Firebase callable，但任何失敗都吞掉且不阻塞 UX。Cloud Function 驗證 enum 後只寫 `audienceAnalytics/overview` 與 `audienceAnalyticsDaily/{YYYY-MM-DD}` 聚合文件，不保存 sessionId、IP 或逐筆事件；Admin 只讀加總資料。

**Tech Stack:** Firebase Functions v2、Firestore Admin SDK、Anonymous Auth、React、Vitest、Node test、既有 AnalyticsDashboard 與 DateRangePicker。

---

## File structure

- Create `functions/src/audienceAnalyticsCore.ts`: payload 型別、白名單、segment 與 increment path builder。
- Create `functions/src/audienceAnalyticsCore.test.ts`。
- Create `functions/src/recordAudienceEvent.ts`: callable 與 Firestore 寫入。
- Modify `functions/src/index.ts`: export callable。
- Modify `functions/package.json`: Node test script。
- Create `client/src/lib/audienceAnalytics.ts`: 非阻塞 client adapter。
- Create `client/src/lib/__tests__/audienceAnalytics.test.ts`。
- Modify `client/src/components/audience/AudienceOnboardingWizard.tsx`。
- Modify `client/src/pages/BulletinHome.tsx`。
- Modify `firestore.rules`。
- Modify `functions/src/dailySnapshot.ts`。
- Create `client/src/components/admin/AudienceAnalyticsPanel.tsx`。
- Create `client/src/components/admin/__tests__/AudienceAnalyticsPanel.test.tsx`。
- Modify `client/src/components/AnalyticsDashboard.tsx`。

### Task 1: 建立後端 payload 白名單與增量路徑

**Files:**
- Create: `functions/src/audienceAnalyticsCore.ts`
- Create: `functions/src/audienceAnalyticsCore.test.ts`
- Modify: `functions/package.json`

- [ ] **Step 1: 寫 Node test，拒絕自由文字與非法 enum**

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseAudienceEvent } from './audienceAnalyticsCore';

test('accepts a valid complete event', () => {
  const event = parseAudienceEvent({
    name: 'audience_wizard_complete', audience: 'teacher', schoolLevel: 'elementary', teacherRole: 'admin', department: 'academic',
  });
  assert.equal(event.segment, 'teacher_elementary_admin_academic');
});

test('rejects unknown fields and invalid tool id', () => {
  assert.throws(() => parseAudienceEvent({ name: 'audience_recommendation_click', toolId: 999, freeText: 'secret' }), /invalid payload/);
});
```

- [ ] **Step 2: 新增 functions test script 並確認紅燈**

```json
"test": "npm run build && node --test lib/audienceAnalyticsCore.test.js"
```

Run: `npm --prefix functions test`

Expected: FAIL，core module 不存在。

- [ ] **Step 3: 實作 parser 與 increment path builder**

允許事件：`impression/start/step/skip/complete/profile_change/recommendation_impression/recommendation_click/recommendation_locate` 對應核准 spec 的完整名稱。只允許 `name,audience,schoolLevel,teacherRole,department,stepKey,toolId`；toolId 1～200，stepKey 只允許 `audience/school-level/teacher-role/department/results`。

```ts
export function buildAudienceIncrementPaths(event: ParsedAudienceEvent): string[] {
  const paths = [`funnel.${event.name}`];
  if (event.audience) paths.push(`audiences.${event.audience}`);
  if (event.schoolLevel) paths.push(`schoolLevels.${event.schoolLevel}`);
  if (event.teacherRole) paths.push(`teacherRoles.${event.teacherRole}`);
  if (event.department) paths.push(`departments.${event.department}`);
  if (event.segment) paths.push(`segments.${event.segment}`);
  const metric = metricFor(event.name);
  if (event.toolId && metric) paths.push(`tools.${event.toolId}.${metric}`);
  if (event.toolId && event.segment && metric) paths.push(`segmentTools.${event.segment}__${event.toolId}.${metric}`);
  return paths;
}
```

- [ ] **Step 4: 執行 functions test**

Run: `npm --prefix functions test`

Expected: PASS。

- [ ] **Step 5: 提交 core**

```powershell
git add functions/src/audienceAnalyticsCore.ts functions/src/audienceAnalyticsCore.test.ts functions/package.json
git commit -m "test: validate anonymous audience events"
```

### Task 2: 建立 recordAudienceEvent callable

**Files:**
- Create: `functions/src/recordAudienceEvent.ts`
- Modify: `functions/src/index.ts`

- [ ] **Step 1: 實作 auth、parser 與兩份原子加總**

```ts
function nestedIncrementData(paths: string[]): Record<string, unknown> {
  const root: Record<string, unknown> = {};
  for (const path of paths) {
    const parts = path.split('.');
    let cursor = root;
    for (const part of parts.slice(0, -1)) {
      cursor = (cursor[part] ??= {}) as Record<string, unknown>;
    }
    cursor[parts.at(-1)!] = admin.firestore.FieldValue.increment(1);
  }
  return root;
}

export const recordAudienceEvent = onCall({ region: 'asia-east1', memory: '256MiB', maxInstances: 10 }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Authentication required.');
  const event = parseAudienceEvent(request.data);
  const dateKey = todayInTaipei();
  const increments = nestedIncrementData(buildAudienceIncrementPaths(event));
  const batch = admin.firestore().batch();
  batch.set(admin.firestore().doc('audienceAnalytics/overview'), { ...increments, lastUpdatedAt: FieldValue.serverTimestamp() }, { merge: true });
  batch.set(admin.firestore().doc(`audienceAnalyticsDaily/${dateKey}`), { ...increments, dateKey, lastUpdatedAt: FieldValue.serverTimestamp() }, { merge: true });
  await batch.commit();
  return { success: true };
});
```

`nestedIncrementData()` 必須把 dotted path 轉成巢狀 object，避免 `set()` 把 `funnel.complete` 當成含點字面欄位；`FieldValue.increment(1)` 在欄位不存在時以 0 起算，因此 batch 可同時處理新建與更新。

- [ ] **Step 2: export function**

在 `functions/src/index.ts` 加：

```ts
export { recordAudienceEvent } from './recordAudienceEvent';
```

- [ ] **Step 3: 編譯與測試**

Run: `npm --prefix functions test`

Expected: PASS 且 tsc 無 unused／implicit return 錯誤。

- [ ] **Step 4: 提交 callable**

```powershell
git add functions/src/recordAudienceEvent.ts functions/src/index.ts
git commit -m "feat: aggregate anonymous audience analytics"
```

### Task 3: 鎖定 Firestore 規則並納入快照

**Files:**
- Modify: `firestore.rules`
- Modify: `functions/src/dailySnapshot.ts`

- [ ] **Step 1: 新增 admin-only read、client no-write 規則**

```text
match /audienceAnalytics/{docId} {
  allow read: if request.auth != null && request.auth.token.admin == true;
  allow write: if false;
}
match /audienceAnalyticsDaily/{date} {
  allow read: if request.auth != null && request.auth.token.admin == true;
  allow write: if false;
}
```

Cloud Function 使用 Admin SDK，不受規則限制。

- [ ] **Step 2: 將兩集合加入 dailySnapshot**

快照 `data` 與 `sizes` 新增 `audienceAnalytics`、`audienceAnalyticsDaily`；restore collection loop 同步加入兩者，避免還原後客群統計遺失。

- [ ] **Step 3: 編譯 functions**

Run: `npm --prefix functions run build`

Expected: exit 0。

- [ ] **Step 4: 部署 rules 前 dry run／編譯檢查**

Run: `firebase deploy --only firestore:rules --project=akai-e693f --account=ipad@mail2.smes.tyc.edu.tw --debug`

Expected: rules compile 與 deploy 成功；若 CLI 不接受 `--account`，先以 `firebase login:list` 確認 active account，再用支援的帳號選擇方式，不可切到個人專案。

- [ ] **Step 5: 提交 rules 與 snapshot**

```powershell
git add firestore.rules functions/src/dailySnapshot.ts
git commit -m "chore: protect and back up audience analytics"
```

### Task 4: 建立前端非阻塞 analytics adapter

**Files:**
- Create: `client/src/lib/audienceAnalytics.ts`
- Test: `client/src/lib/__tests__/audienceAnalytics.test.ts`

- [ ] **Step 1: 寫失敗測試，確認 GA 即時、Firebase 失敗不 throw**

```ts
it('tracks GA and resolves when callable rejects', async () => {
  callable.mockRejectedValue(new Error('offline'));
  await expect(trackAudienceEvent({ name: 'audience_wizard_impression' })).resolves.toBeUndefined();
  expect(trackEvent).toHaveBeenCalledWith('audience_wizard_impression', {});
});
```

- [ ] **Step 2: 執行測試確認紅燈**

Run: `npm test -- --run client/src/lib/__tests__/audienceAnalytics.test.ts`

Expected: FAIL。

- [ ] **Step 3: 實作 adapter**

```ts
export async function trackAudienceEvent(event: AudienceAnalyticsEvent): Promise<void> {
  const { name, ...params } = event;
  trackEvent(name, params);
  try {
    await ensureSignedIn();
    if (!isFirebaseAvailable()) return;
    const callable = httpsCallable(getFunctions(undefined, 'asia-east1'), 'recordAudienceEvent');
    await callable(event);
  } catch (error) {
    if (import.meta.env.DEV) console.debug('[audience analytics] deferred', error);
  }
}
```

UI 呼叫時使用 `void trackAudienceEvent(event)`，不得 await 後才導頁。

- [ ] **Step 4: 執行測試**

Run: `npm test -- --run client/src/lib/__tests__/audienceAnalytics.test.ts`

Expected: PASS。

- [ ] **Step 5: 提交 adapter**

```powershell
git add client/src/lib/audienceAnalytics.ts client/src/lib/__tests__/audienceAnalytics.test.ts
git commit -m "feat: report audience events without blocking UX"
```

### Task 5: 接上精靈漏斗與推薦事件

**Files:**
- Modify: `client/src/components/audience/AudienceOnboardingWizard.tsx`
- Modify: `client/src/components/audience/AudienceRecommendationResults.tsx`
- Modify: `client/src/pages/BulletinHome.tsx`

- [ ] **Step 1: 開啟時送 impression，第一次選擇送 start**

用 `useRef(false)` 防 StrictMode 重複；impression 每次實際開啟一次，start 每輪精靈一次。

- [ ] **Step 2: 每步送 step，稍後再說送 skip**

只送列舉 stepKey，不送顯示文案；skip 可包含當前 stepKey，但不送未完成 profile 的自由組合。

- [ ] **Step 3: 完成與重新選擇事件**

首次儲存送 complete；已有 profile 再完成送 profile_change；兩者附合法 profile 維度。

- [ ] **Step 4: 結果曝光、立即使用與定位**

每個顯示工具送 recommendation_impression；立即使用送 recommendation_click；在首頁查看送 recommendation_locate。事件包含 toolId 與 segment，不含 URL、title 或 sessionId。

- [ ] **Step 5: 執行 UI 與 analytics 測試**

Run: `npm test -- --run client/src/lib/__tests__/audienceAnalytics.test.ts client/src/components/audience`

Expected: PASS。

- [ ] **Step 6: 提交事件整合**

```powershell
git add client/src/components/audience client/src/pages/BulletinHome.tsx
git commit -m "feat: track audience onboarding funnel"
```

### Task 6: 建立 Admin 客群資料讀取與呈現

**Files:**
- Create: `client/src/components/admin/AudienceAnalyticsPanel.tsx`
- Create: `client/src/components/admin/__tests__/AudienceAnalyticsPanel.test.tsx`
- Modify: `client/src/components/AnalyticsDashboard.tsx`

- [ ] **Step 1: 寫 panel 失敗測試**

```tsx
const fixtureOverview = {
  funnel: { audience_wizard_impression: 10, audience_wizard_complete: 5 },
  audiences: { teacher: 4, student: 1 },
  segments: { teacher_elementary_homeroom: 3 },
  tools: { 84: { impressions: 4, clicks: 2, locates: 1 } },
};
const fixtureDaily = [{ dateKey: '2026-07-10', ...fixtureOverview }];
const range = { from: new Date('2026-07-10'), to: new Date('2026-07-10'), label: '今天' };
const titles = new Map([[84, '會議記錄自動產出平台']]);
render(<AudienceAnalyticsPanel overview={fixtureOverview} daily={fixtureDaily} dateRange={range} toolTitles={titles} />);
expect(screen.getByText('精靈完成率')).toBeVisible();
expect(screen.getByText('老師')).toBeVisible();
expect(screen.getByText('國小班級導師')).toBeVisible();
expect(screen.getByText('會議記錄自動產出平台')).toBeVisible();
expect(screen.getByText('50.0%')).toBeVisible();
```

- [ ] **Step 2: 執行測試確認紅燈**

Run: `npm test -- --run client/src/components/admin/__tests__/AudienceAnalyticsPanel.test.tsx`

Expected: FAIL。

- [ ] **Step 3: 實作純 props panel**

Panel 顯示：曝光／開始／完成／略過／完成率；audience、schoolLevel、teacherRole、department 長條；segment 排名；tool 與 segment-tool CTR 表。CTR 分母 0 顯示 `—`，不可顯示 NaN。

- [ ] **Step 4: 在 AnalyticsDashboard 訂閱 overview 與日期文件**

overview 用 `onSnapshot(doc(db,'audienceAnalytics','overview'))`；日期範圍用 `query(collection(db,'audienceAnalyticsDaily'), where('__name__','>=',from), where('__name__','<=',to))`，dateRange 改變時重新查詢。

- [ ] **Step 5: 新增第七個「客群」tab 並調整 RWD grid**

`TabsList` 改成 `grid-cols-3 sm:grid-cols-4 lg:grid-cols-7`；tab label `客群`，內容 render panel。既有六個 tab 不改 value。

- [ ] **Step 6: 執行 panel、Dashboard 型別與 build**

Run: `npm test -- --run client/src/components/admin/__tests__/AudienceAnalyticsPanel.test.tsx && npm run check && npm run build`

Expected: PASS。

- [ ] **Step 7: 提交 Admin panel**

```powershell
git add client/src/components/admin/AudienceAnalyticsPanel.tsx client/src/components/admin/__tests__/AudienceAnalyticsPanel.test.tsx client/src/components/AnalyticsDashboard.tsx
git commit -m "feat: add audience analytics admin tab"
```

### Task 7: Functions 部署與實際資料 smoke test

**Files:**
- Verify deployment

- [ ] **Step 1: 最終 functions build/test**

Run: `npm --prefix functions test`

Expected: PASS。

- [ ] **Step 2: 部署 callable**

Run: `firebase deploy --only functions:recordAudienceEvent --project=akai-e693f --account=ipad@mail2.smes.tyc.edu.tw`

Expected: deploy 成功，region `asia-east1`。

- [ ] **Step 3: 以本機首頁完成一次測試 profile**

用瀏覽器 DevTools Network 確認 callable 200；Firestore `audienceAnalytics/overview` 與今日 `audienceAnalyticsDaily/YYYY-MM-DD` 的 complete 計數各 +1。

- [ ] **Step 4: 登入 `/admin` 檢查客群 tab**

確認測試資料出現、日期切換有效、一般非 admin 帳號無法讀取集合。

- [ ] **Step 5: 提交部署後必要產物並 push**

```powershell
git status --short
git push origin main
```

只 push 已提交 commit，不 stage 無關檔案。

### Task 8: 全功能最終驗證

**Files:**
- Verify only

- [ ] **Step 1: 執行完整自動測試**

```powershell
npm run validate:audience
npm run check
npm test -- --run
npm --prefix functions test
npm run build
```

Expected: 全部 exit 0。

- [ ] **Step 2: 執行手機與桌機 E2E**

```powershell
npm run test:e2e -- --project="Mobile Chrome" e2e/audience-onboarding.spec.ts
npm run test:e2e -- --project=chromium e2e/audience-onboarding.spec.ts e2e/home.spec.ts
```

Expected: PASS。

- [ ] **Step 3: 執行敏感資料與學校名稱掃描**

```powershell
rg -n "email|schoolName|freeText|sessionId|ipAddress" functions/src/recordAudienceEvent.ts client/src/lib/audienceAnalytics.ts
rg -n "新明" client server functions -g '!node_modules' -g '!dist'
```

Expected: 第一個命令不得顯示 payload 寫入上述個資欄位；第二個不得命中對外內容。

- [ ] **Step 4: 檢查工作樹與最後 commit**

Run: `git status --short; git log -8 --oneline`

Expected: 只剩使用者原本的 GEO 等未提交修改；本功能所有檔案均已提交。
