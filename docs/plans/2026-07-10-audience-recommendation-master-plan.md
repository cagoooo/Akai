# 首次訪客客群推薦系統 Implementation Plan Index

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers-subagent-driven` (recommended) or inline execution to implement these plans task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 依核准規格完成資料驅動推薦、手機優先歡迎精靈與匿名 Admin 分析，並讓未來新工具自動進入適合客群。

**Architecture:** 工作拆成三個可獨立驗證的階段。第一階段先建立 `audienceFit` 單一資料來源與純函式推薦引擎；第二階段只依賴第一階段提供的介面完成首頁 UX；第三階段在不阻塞 UX 的前提下加入匿名後端加總與 Admin 分析。

**Tech Stack:** React 18、TypeScript、Vitest、Testing Library、Playwright、Firebase Auth／Functions v2／Firestore、Vite、Tailwind 與既有 E2 公佈欄 primitives。

---

## 執行順序

1. [客群資料、推薦引擎與新工具自動納入](./2026-07-10-audience-recommendation-data-plan.md)
2. [手機優先首次訪客歡迎精靈](./2026-07-10-audience-onboarding-ui-plan.md)
3. [匿名客群分析與 Admin 儀表板](./2026-07-10-audience-analytics-admin-plan.md)

不得平行執行第二、三階段與第一階段，因為兩者都依賴第一階段定義的 `AudienceProfile`、`AudienceFit`、`AudienceRecommendation` 與 `buildAudienceSegmentKey()`。

## 每階段共同規則

- 開始前執行 `git status --short`，保留既有 GEO 與其他使用者修改。
- 每個 task 只 stage 計畫列出的檔案。
- 每次 commit 前使用 `superpowers-verify-before-done`，執行 task 指定測試。
- Firebase／GCP 操作固定使用 `--account=ipad@mail2.smes.tyc.edu.tw --project=akai-e693f`。
- 任何輸出學校名稱只能使用「石門國小」或「桃園市龍潭區石門國民小學」。
- 三個階段全部通過後才執行最終 `npm run check`、`npm test -- --run`、`npm run build` 與完整 Playwright。

## 最終整合驗收

```powershell
npm run validate:audience
npm run check
npm test -- --run
npm --prefix functions test
npm --prefix functions run build
npm run build
npm run test:e2e -- --project="Mobile Chrome" e2e/audience-onboarding.spec.ts
npm run test:e2e -- --project=chromium e2e/audience-onboarding.spec.ts
rg -n "新明" . -g '!node_modules' -g '!dist' -g '!.git'
```

預期：所有命令 exit 0；最後一個 `rg` 只能命中「禁止誤寫」的規範文字，不得命中對外頁面文案、footer 或工具內容。
