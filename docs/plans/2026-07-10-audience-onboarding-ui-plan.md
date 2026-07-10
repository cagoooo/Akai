# 手機優先首次訪客歡迎精靈 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers-subagent-driven` (recommended) or inline execution to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 E2 公佈欄首頁加入只於首次一般造訪顯示的全螢幕身分精靈，完成後顯示六項推薦並可定位首頁拍立得卡片。

**Architecture:** 精靈使用 reducer 狀態機與版本化 storage，視覺元件只接收 profile／recommendations props。`BulletinHome` 負責開啟優先順序、工具資料及定位 callback；既有搜尋、分類、收藏與許願池保持不變。

**Tech Stack:** React 18、TypeScript、Testing Library、Vitest、Playwright、Framer Motion、既有 `Pin`／`Tape`／tokens.css。

---

## File structure

- Create `client/src/lib/audienceProfileStorage.ts`。
- Create `client/src/lib/__tests__/audienceProfileStorage.test.ts`。
- Create `client/src/components/audience/audienceWizardReducer.ts`。
- Create `client/src/components/audience/__tests__/audienceWizardReducer.test.ts`。
- Create `client/src/components/audience/AudienceOnboardingWizard.tsx`。
- Create `client/src/components/audience/AudienceRecommendationResults.tsx`。
- Create `client/src/components/audience/AudienceProfileBadge.tsx`。
- Create `client/src/components/audience/__tests__/AudienceOnboardingWizard.test.tsx`。
- Modify `client/src/pages/BulletinHome.tsx`。
- Modify `client/src/components/bulletin/BulletinToolGrid.tsx`。
- Modify `client/src/components/bulletin/BulletinToolCard.tsx`。
- Modify `client/src/styles/tokens.css`。
- Create `e2e/audience-onboarding.spec.ts`。

### Task 1: 版本化儲存與自動顯示判斷

**Files:**
- Create: `client/src/lib/audienceProfileStorage.ts`
- Test: `client/src/lib/__tests__/audienceProfileStorage.test.ts`

- [ ] **Step 1: 寫失敗測試**

```ts
it('只讀取 version 1 的合法完成資料', () => {
  localStorage.setItem('akai_audience_profile_v1', JSON.stringify({
    version: 1, audience: 'teacher', schoolLevel: 'elementary', teacherRole: 'homeroom', completedAt: '2026-07-10T00:00:00.000Z',
  }));
  expect(readAudienceProfile()?.teacherRole).toBe('homeroom');
});

it('稍後再說只抑制本次 session', () => {
  dismissAudienceWizardForSession();
  expect(shouldAutoOpenAudienceWizard(new URLSearchParams())).toBe(false);
  sessionStorage.clear();
  expect(shouldAutoOpenAudienceWizard(new URLSearchParams())).toBe(true);
});

it.each(['q=考卷', 'category=games', 'favorites=1', 'wish=1'])('意圖網址 %s 不自動開啟', (query) => {
  expect(shouldAutoOpenAudienceWizard(new URLSearchParams(query))).toBe(false);
});
```

- [ ] **Step 2: 執行測試確認紅燈**

Run: `npm test -- --run client/src/lib/__tests__/audienceProfileStorage.test.ts`

Expected: FAIL，module 不存在。

- [ ] **Step 3: 實作 storage API 與 try/catch 降級**

```ts
export const AUDIENCE_PROFILE_KEY = 'akai_audience_profile_v1';
export const AUDIENCE_DISMISSED_KEY = 'akai_audience_wizard_dismissed_v1';
export function saveAudienceProfile(profile: AudienceProfile): StoredAudienceProfile;
export function readAudienceProfile(): StoredAudienceProfile | null;
export function dismissAudienceWizardForSession(): void;
export function shouldAutoOpenAudienceWizard(params: URLSearchParams): boolean;
```

`shouldAutoOpenAudienceWizard` 依序檢查合法 profile、session dismiss、`q/category/tag/favorites/wish`。

- [ ] **Step 4: 執行測試**

Run: `npm test -- --run client/src/lib/__tests__/audienceProfileStorage.test.ts`

Expected: PASS。

- [ ] **Step 5: 提交 storage**

```powershell
git add client/src/lib/audienceProfileStorage.ts client/src/lib/__tests__/audienceProfileStorage.test.ts
git commit -m "feat: persist audience onboarding profile"
```

### Task 2: 問答 reducer 狀態機

**Files:**
- Create: `client/src/components/audience/audienceWizardReducer.ts`
- Test: `client/src/components/audience/__tests__/audienceWizardReducer.test.ts`

- [ ] **Step 1: 寫完整路徑失敗測試**

```ts
it('國小行政教務路徑依序到結果', () => {
  let state = initialAudienceWizardState;
  state = reduce(state, { type: 'SELECT_AUDIENCE', value: 'teacher' });
  expect(state.step).toBe('school-level');
  state = reduce(state, { type: 'SELECT_SCHOOL_LEVEL', value: 'elementary' });
  state = reduce(state, { type: 'SELECT_TEACHER_ROLE', value: 'admin' });
  expect(state.step).toBe('department');
  state = reduce(state, { type: 'SELECT_DEPARTMENT', value: 'academic' });
  expect(state.step).toBe('results');
  expect(toAudienceProfile(state)).toEqual({ audience: 'teacher', schoolLevel: 'elementary', teacherRole: 'admin', department: 'academic' });
});

it('學生直接到結果且返回後清除後續欄位', () => {
  const result = reduce(initialAudienceWizardState, { type: 'SELECT_AUDIENCE', value: 'student' });
  expect(result.step).toBe('results');
  expect(reduce(result, { type: 'BACK' }).profile).toEqual({});
});
```

- [ ] **Step 2: 執行測試確認紅燈**

Run: `npm test -- --run client/src/components/audience/__tests__/audienceWizardReducer.test.ts`

Expected: FAIL。

- [ ] **Step 3: 實作 reducer、step progress 與 BACK 規則**

```ts
export type AudienceWizardStep = 'audience' | 'school-level' | 'teacher-role' | 'department' | 'results';
export type AudienceWizardAction =
  | { type: 'SELECT_AUDIENCE'; value: AudienceType }
  | { type: 'SELECT_SCHOOL_LEVEL'; value: SchoolLevel }
  | { type: 'SELECT_TEACHER_ROLE'; value: TeacherRole }
  | { type: 'SELECT_DEPARTMENT'; value: Department }
  | { type: 'BACK' }
  | { type: 'RESET' };
```

BACK 必須清除離開步驟之後的欄位，避免 teacher → student 仍殘留 role。

- [ ] **Step 4: 執行 reducer 測試**

Run: `npm test -- --run client/src/components/audience/__tests__/audienceWizardReducer.test.ts`

Expected: PASS。

- [ ] **Step 5: 提交 reducer**

```powershell
git add client/src/components/audience/audienceWizardReducer.ts client/src/components/audience/__tests__/audienceWizardReducer.test.ts
git commit -m "feat: add audience wizard state machine"
```

### Task 3: 建立公佈欄風全螢幕精靈

**Files:**
- Create: `client/src/components/audience/AudienceOnboardingWizard.tsx`
- Create: `client/src/components/audience/AudienceRecommendationResults.tsx`
- Test: `client/src/components/audience/__tests__/AudienceOnboardingWizard.test.tsx`

- [ ] **Step 1: 寫互動與無障礙失敗測試**

```tsx
const user = userEvent.setup();
const onComplete = vi.fn();
const onDismiss = vi.fn();
const onLocateTool = vi.fn();
const tools = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1, title: `工具 ${index + 1}`, description: '適合導師使用',
  url: `https://example.com/${index + 1}`, icon: 'Sparkles', category: 'utilities' as const,
  audienceFit: { audiences: ['teacher'] as const, teacherRoles: ['homeroom'] as const,
    painPoints: [`need-${index}`], priority: 80 - index,
    reasons: { homeroom: `導師推薦理由 ${index + 1}` } },
}));
render(<AudienceOnboardingWizard open tools={tools} onComplete={onComplete} onDismiss={onDismiss} onLocateTool={onLocateTool} />);
expect(screen.getByRole('dialog', { name: '找到適合我的教育工具' })).toHaveAttribute('aria-modal', 'true');
await user.click(screen.getByRole('button', { name: '我是老師' }));
await user.click(screen.getByRole('button', { name: '國小' }));
await user.click(screen.getByRole('button', { name: '班級導師' }));
expect(screen.getByRole('heading', { name: /為國小班級導師精選/ })).toBeVisible();
expect(screen.getAllByRole('button', { name: /立即使用/ })).toHaveLength(6);
```

- [ ] **Step 2: 執行測試確認紅燈**

Run: `npm test -- --run client/src/components/audience/__tests__/AudienceOnboardingWizard.test.tsx`

Expected: FAIL。

- [ ] **Step 3: 實作 dialog shell、選項拍立得與結果元件**

使用既有 `Pin`、`Tape`、`tokens.note`、`tokens.olive`；dialog root 加 `className="audience-wizard"`、`role="dialog"`、`aria-modal="true"`。選項按鈕只 dispatch 一次選擇，結果以 `recommendTools(tools, profile, 6)` 產生。

- [ ] **Step 4: 實作焦點鎖定與還原**

開啟時保存 `document.activeElement`，focus 第一個選項；Tab／Shift+Tab 循環於 dialog；關閉時 focus 回觸發按鈕；Escape 等同「稍後再說」，結果頁 Escape 也只關閉不清 profile。

- [ ] **Step 5: 執行元件測試**

Run: `npm test -- --run client/src/components/audience/__tests__/AudienceOnboardingWizard.test.tsx`

Expected: PASS，且沒有 React act warning。

- [ ] **Step 6: 提交精靈元件**

```powershell
git add client/src/components/audience
git commit -m "feat: build cork audience onboarding wizard"
```

### Task 4: 建立首頁身分便利貼與工具定位能力

**Files:**
- Create: `client/src/components/audience/AudienceProfileBadge.tsx`
- Modify: `client/src/components/bulletin/BulletinToolGrid.tsx`
- Modify: `client/src/components/bulletin/BulletinToolCard.tsx`

- [ ] **Step 1: 在工具 article 加穩定 selector 與 focus 能力**

```tsx
<article
  data-tool-id={tool.id}
  data-testid="tool-card"
  tabIndex={-1}
  className={cn('sticker-card bulletin-tool-card', highlighted && 'audience-tool-highlight')}
>
```

將 `highlightedToolId?: number` 由 grid 傳給 card。

- [ ] **Step 2: 建立身分 badge**

`AudienceProfileBadge` 顯示 `📌 我的身分：國小班級導師`；button aria-label 為「重新選擇身分」，點擊只呼叫 `onReselect`。

- [ ] **Step 3: 在 grid 加 highlight props 測試或既有 card 測試**

```tsx
render(<BulletinToolCard tool={mockTool} highlighted />);
expect(screen.getByTestId('tool-card')).toHaveClass('audience-tool-highlight');
expect(screen.getByTestId('tool-card')).toHaveAttribute('data-tool-id', '1');
```

- [ ] **Step 4: 執行卡片測試**

Run: `npm test -- --run client/src/components/__tests__/ToolCard.test.tsx client/src/components/audience/__tests__/AudienceOnboardingWizard.test.tsx`

Expected: PASS。

- [ ] **Step 5: 提交定位基礎**

```powershell
git add client/src/components/audience/AudienceProfileBadge.tsx client/src/components/bulletin/BulletinToolGrid.tsx client/src/components/bulletin/BulletinToolCard.tsx client/src/components/__tests__/ToolCard.test.tsx
git commit -m "feat: locate recommended bulletin cards"
```

### Task 5: 整合 BulletinHome 與 overlay 優先順序

**Files:**
- Modify: `client/src/pages/BulletinHome.tsx`

- [ ] **Step 1: 加入 profile、wizard、highlight state**

```ts
const [audienceProfile, setAudienceProfile] = useState(() => readAudienceProfile());
const [showAudienceWizard, setShowAudienceWizard] = useState(() =>
  shouldAutoOpenAudienceWizard(new URLSearchParams(window.location.search))
);
const [highlightedToolId, setHighlightedToolId] = useState<number | null>(null);
```

- [ ] **Step 2: 確保許願池優先於精靈**

現有 wish effect 一旦開啟 `showWishingWellFromShortcut`，同步 `setShowAudienceWizard(false)`；關閉許願池不在同一 session 自動補開精靈。

- [ ] **Step 3: 實作完成與重新選擇**

完成 callback 先 `saveAudienceProfile(profile)`、更新 state、關閉；badge `onReselect` dispatch reset 並打開，不刪除舊資料直到新 profile 完成。

- [ ] **Step 4: 實作在首頁查看**

```ts
const locateRecommendedTool = useCallback((toolId: number) => {
  setSearchQuery(''); setSelectedCategory(null); setShowFavorites(false);
  setShowAudienceWizard(false); setHighlightedToolId(toolId);
  requestAnimationFrame(() => setTimeout(() => {
    const card = document.querySelector<HTMLElement>(`[data-tool-id="${toolId}"]`);
    card?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
    card?.focus({ preventScroll: true });
    window.setTimeout(() => setHighlightedToolId(null), 2400);
  }, 120));
}, []);
```

- [ ] **Step 5: 將 badge 放在 Hero 後、QuickNav 前，wizard 放在 BulletinBoard 末端**

確保 wizard DOM 只在 `open` 時存在，且不影響首頁 LCP 標題結構。

- [ ] **Step 6: 執行型別與元件測試**

Run: `npm run check && npm test -- --run client/src/components/audience`

Expected: PASS。

- [ ] **Step 7: 提交首頁整合**

```powershell
git add client/src/pages/BulletinHome.tsx
git commit -m "feat: integrate audience onboarding on home"
```

### Task 6: 完成手機優先 RWD 與 reduced motion

**Files:**
- Modify: `client/src/styles/tokens.css`

- [ ] **Step 1: 新增 desktop shell 樣式**

```css
.audience-wizard { position: fixed; inset: 0; z-index: 1200; min-height: 100dvh; background: rgba(45,31,18,.58); }
.audience-wizard__paper { width: min(920px, calc(100% - 40px)); max-height: calc(100dvh - 40px); overflow: auto; overscroll-behavior: contain; }
.audience-tool-highlight { animation: audience-card-focus 1.2s ease-in-out 2; outline: 4px solid var(--pin-yellow); outline-offset: 5px; }
```

- [ ] **Step 2: 新增 480px 手機規則與安全區**

```css
@media (max-width: 480px) {
  .audience-wizard { padding: max(10px, env(safe-area-inset-top)) 10px max(10px, env(safe-area-inset-bottom)); }
  .audience-wizard__paper { width: 100%; min-height: calc(100dvh - max(20px, env(safe-area-inset-top)) - max(20px, env(safe-area-inset-bottom))); transform: none !important; }
  .audience-wizard__choices, .audience-wizard__recommendations { grid-template-columns: 1fr !important; }
  .audience-wizard button { min-height: 44px; font-size: 14px; }
  .audience-wizard__polaroid { transform: none !important; }
}
```

- [ ] **Step 3: 新增 reduced motion**

```css
@media (prefers-reduced-motion: reduce) {
  .audience-wizard *, .audience-tool-highlight { animation: none !important; transition-duration: .01ms !important; scroll-behavior: auto !important; }
}
```

- [ ] **Step 4: 執行 build 確認 CSS 無錯**

Run: `npm run build`

Expected: Vite build 成功。

- [ ] **Step 5: 提交 RWD**

```powershell
git add client/src/styles/tokens.css
git commit -m "style: optimize audience wizard for mobile"
```

### Task 7: Playwright 首次造訪與定位驗收

**Files:**
- Create: `e2e/audience-onboarding.spec.ts`

- [ ] **Step 1: 寫首次訪客、回訪、稍後再說與定位測試**

```ts
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.goto('/');
});

test('學生完成後回訪不再顯示', async ({ page }) => {
  await page.getByRole('button', { name: '我是學生或小朋友' }).click();
  await expect(page.getByRole('heading', { name: /為學生或小朋友精選/ })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: '重新選擇身分' })).toBeVisible();
});

test('在首頁查看會定位並 focus 工具卡', async ({ page }) => {
  await completeHomeroomFlow(page);
  const first = page.getByRole('button', { name: /在首頁查看/ }).first();
  const toolId = await first.getAttribute('data-tool-id');
  await first.click();
  await expect(page.locator(`[data-tool-id="${toolId}"]`)).toBeFocused();
});
```

- [ ] **Step 2: 加入 375×667 與 390×844 無溢出測試**

```ts
for (const viewport of [{ width: 375, height: 667 }, { width: 390, height: 844 }]) {
  test(`手機 ${viewport.width}x${viewport.height} 無水平溢出`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect(page.getByRole('button', { name: '稍後再說' })).toBeInViewport();
  });
}
```

- [ ] **Step 3: 執行 Mobile Chrome**

Run: `npm run test:e2e -- --project="Mobile Chrome" e2e/audience-onboarding.spec.ts`

Expected: PASS。

- [ ] **Step 4: 執行 desktop chromium**

Run: `npm run test:e2e -- --project=chromium e2e/audience-onboarding.spec.ts`

Expected: PASS。

- [ ] **Step 5: 提交 E2E**

```powershell
git add e2e/audience-onboarding.spec.ts
git commit -m "test: cover audience onboarding journeys"
```

### Task 8: 第二階段整合驗證

**Files:**
- Verify only

- [ ] **Step 1: 執行相關單元測試與型別檢查**

Run: `npm test -- --run client/src/lib/__tests__/audienceProfileStorage.test.ts client/src/components/audience && npm run check`

Expected: PASS。

- [ ] **Step 2: 執行兩種 viewport E2E 與 build**

Run: `npm run test:e2e -- --project="Mobile Chrome" e2e/audience-onboarding.spec.ts; npm run test:e2e -- --project=chromium e2e/audience-onboarding.spec.ts; npm run build`

Expected: 全部 exit 0。

- [ ] **Step 3: 確認沒有意外修改其他首頁功能**

Run: `npm run test:e2e -- --project=chromium e2e/home.spec.ts`

Expected: 既有首頁測試 PASS。

- [ ] **Step 4: 提交必要產物或略過空 commit**

只 stage 本計畫列出的檔案與 build 慣例產物；不得 stage 既有 GEO 修改。
