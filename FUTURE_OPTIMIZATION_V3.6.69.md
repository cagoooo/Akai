# 阿凱老師教育工具集 · 未來優化路線圖 v3.6.69+

> **產出日期**：2026-05-29 12:00
> **當前版本**：v3.6.69（**排行榜雙寫 doc 漂移總修復 + cockpit 流量歸因 beacon**）
> **撰寫脈絡**：今日從「排行榜 UIUX 還能改良嗎」這個輕量問題出發，意外揪出史上最大 stale-data bug（v3.6.49 起學生點擊全部消失到 stale collection、UI 永遠讀錯邊），順手把 cockpit 直訪流量歸因也補上。修完留下完整 5 層防線 + migration 跑通 + 2,437 click 救回。
> **與前一份的關係**：v3.6.63 路線圖聚焦 podcast→video，v3.6.69 處理「資料正確性 + 流量歸因」基礎建設層 — 跑通後排行榜才能成為真實的「教學熱度儀表板」

---

## 🎯 戰略地圖更新

```
v3.6.60                  v3.6.63              v3.6.68              v3.6.69              v3.6.70+
GEO/SEO 護城河            Kiki & Gordon         演講提問 Ops          排行榜真實化          流量歸因擴張
+ llms.txt + Schema     podcast→video      admin 後台 + UX     雙寫 doc 漂移修復       beacon snippet
                         pipeline           三修                + 5 層防線              覆蓋 top 10 工具
                                                                + 2,437 click 救回      + 流量 dashboard
                                                                                        + LINE 異常告警
                                                                                          ↓
                                                                                        Akai 變
                                                                                        "教學工具
                                                                                        流量分析平台"
```

---

## 🚀 P0 立即可做（這週 / 1-3 個 session 完成）

### P0-1 · beacon snippet 擴散到 top 10 工具

**為什麼**：v3.6.69 已驗證 cockpit beacon 機制可用，但目前只 #1 駕駛艙有。其他高熱度工具（#2 禮堂預約 +60/週、#3 早安長輩圖、#4 班級小管家 +16/週、#5 手作課程 +20/週）學生直接打 URL 進入仍不計數。**真實流量很可能比現在顯示的還高 2-5 倍**。

**做法**：
複製 `it-cockpit/index.html` `<head>` 那段 IIFE 到下列 repo，把 `toolId=81` 改成對應 id：

| 排名 | toolId | repo | URL |
|---|---|---|---|
| #2 | 46 | `cagoooo/schedule` | https://cagoooo.github.io/schedule/ |
| #3 | 14 | poet.smes.tyc.edu.tw | （Firebase Hosting，加在 index.html） |
| #4 | 10 | `cagoooo/class` | https://cagoooo.github.io/class/ |
| #5 | 68 | `cagoooo/files` | https://cagoooo.github.io/files/ |
| #6 | 3 | （查 tools.json） | — |
| #7 | 9 | — | — |
| #8 | 53 | — | — |
| #9 | 2 | — | — |
| #10 | 88 | `cagoooo/jhs-curriculum` | — |

**估時**：30 分鐘（每個工具 3 分鐘 × 10）

**收益**：所有主力工具的真實學生用量浮上水面，未來排行榜能反映「**真實教學現場熱度**」而非「**從 Akai 入站熱度**」。

**進階**：寫個 `scripts/inject-beacon.mjs` 自動掃 `tools.json` 找 `cagoooo/*` repo，本地 clone 後 patch index.html 並推回 — 一鍵覆蓋所有 GitHub Pages 工具。

---

### P0-2 · Analytics Dashboard 加 schema 漂移健檢

**為什麼**：v3.6.69 加了 5 層防線，但「過去發生時你完全不知道」這個 root cause 沒解決。未來如果有人不小心又改 schema、admin SDK bypass rules、或某個新功能寫到別處，可能再次悄悄漂移數週才被發現。需要主動健檢。

**做法**：
在 `client/src/components/AnalyticsDashboard.tsx`（已有 admin 路由）加一個區塊：

```tsx
<HealthCheckCard>
  <h3>🛡️ Schema 健檢</h3>
  <ul>
    <li>toolUsageStats docId 全部純數字：✅ 100/100</li>
    <li>toolUsageStats 含必要 fields (totalClicks, dailyClicks)：✅ 100/100</li>
    <li>tool_* 漂移殘留：✅ 0</li>
    <li>totalClicks 為負值：✅ 0</li>
    <li>未認證寫入嘗試（last 24h）：✅ rules 擋掉 N 次</li>
  </ul>
  <button onClick={refreshCheck}>🔄 重新檢查</button>
</HealthCheckCard>
```

對應 Cloud Function `healthCheckToolUsageStats`（admin only callable）：
- 掃 toolUsageStats collection 所有 doc
- 驗證 docId、fields、values
- 回傳異常清單

**估時**：1.5 hr

**收益**：未來任何漂移上線 5 分鐘內被發現，不再有「等使用者抱怨才挖根因」的窘境。

---

### P0-3 · LINE 異常告警串接

**為什麼**：已有 LINE 推播管道（[[line-messaging-firebase]] / `pushFlexToAdmin`），但只用在「許願池 / 評論」事件。資料正確性告警更重要。

**做法**：
新增 `onDocumentWritten('toolUsageStats/{docId}')` trigger：

```ts
export const monitorToolStatsSchema = onDocumentWritten(
  'toolUsageStats/{docId}',
  async (event) => {
    const docId = event.params.docId;
    const data = event.data?.after?.data();
    if (!data) return; // delete event

    const issues: string[] = [];
    if (!/^[1-9][0-9]{0,2}$/.test(docId)) {
      issues.push(`docId 不符合純數字格式：${docId}`);
    }
    if (typeof data.totalClicks !== 'number' || data.totalClicks < 0) {
      issues.push(`totalClicks 異常：${data.totalClicks}`);
    }
    if (issues.length === 0) return;

    await pushFlexToAdmin(
      `⚠️ toolUsageStats schema 漂移告警`,
      buildFlexCard(docId, issues),
      `schema-alert:${docId}:${Date.now()}`
    );
  }
);
```

**估時**：45 分鐘
**估月費**：~0 元（onDocumentWritten 觸發次數低、free tier 內）

**收益**：第二道警報網。Rules 擋了 99%，剩下 1% 走 admin SDK 的異常會即時推播給你的 LINE。

---

## 🎨 P1 中期排程（這 1-2 週 / 3-7 個 session）

### P1-1 · 排行榜熱度等級徽章（🔥 三段）

**為什麼**：目前只有 #1 有「🔥 急上升」徽章。但 #2 禮堂預約 +60/週、#5 手作課程 +20/週 都明顯「現役火苗」，視覺上完全沒呈現熱度梯度。

**做法**：
`BulletinLeaderboard.tsx` 把單一徽章改成三段：

```tsx
// 根據 risingDelta 給不同火等級
const fireLevel = (delta: number): 0 | 1 | 2 | 3 => {
  if (delta >= 80) return 3;  // 🔥🔥🔥 爆紅
  if (delta >= 30) return 2;  // 🔥🔥 急上升
  if (delta >= 10) return 1;  // 🔥 上升中
  return 0;
};

// 對應 badge 顏色：紅 / 橘 / 黃
const fireColors = ['', '#fbbf24', '#fb923c', '#dc2626'];
```

**估時**：30 分鐘

**收益**：使用者一眼看出 top 5 哪些是「持續火爆」、哪些是「冷掉了」。

---

### P1-2 · #4 #5 視覺孤兒救援（淡膠帶 + 名次徽章）

**為什麼**：v3.6.69 修完後 #1-#3 有金/銀/銅膠帶，但 #4 #5 沒任何視覺辨識。看起來像「附帶上榜」而不是「也很厲害」。

**做法**：
- #4 加「鋁」色淡膠帶 (`#a8b5c2`)、文字「🏅 第 4」
- #5 加「銅紅」色淡膠帶 (`#b87333`)、文字「🏅 第 5」
- 兩者透明度 0.85 比金銀銅膠帶稍淡，視覺分層感

**估時**：20 分鐘

**收益**：5 張卡都有完整身份感，排行榜更像「榮譽榜」而非「Top 3 + 兩個次要工具」。

---

### P1-3 · 排行榜 row hover 提示「點我直接使用」

**為什麼**：用 inspect 確認過 `cursor: pointer` 有設、整 row 是 `<a>`，但**沒有任何視覺提示**告訴使用者「可以點」。新訪客很可能以為這只是顯示用列表。

**做法**：
- desktop hover：右側淡出「使用 →」icon（fontawesome arrow-right + 8px gap 動畫）
- 沿用 sticker-card spring lift -8px 效果
- 觸控裝置：保持現狀（hover 已被 `@media (hover: none)` 禁用）

**估時**：25 分鐘
**收益**：CTR 提升（自家工具測量），同時不破壞既有設計語彙。

---

### P1-4 · 流量來源 dashboard（已有資料、缺 UI）

**為什麼**：`toolClickEvents` 每筆都記 `referrer` (line/facebook/google/youtube/internal/direct...)、`device` (mobile/tablet/desktop)、`country` — 但目前只 `getToolFlowAnalysis` callable 能查，沒 UI 呈現。資料躺在 Firestore 沒人看。

**做法**：
`AnalyticsDashboard.tsx` 加流量來源 tab：

```
┌─────────────────────────────────────────────┐
│  🔍 流量來源分析 - #81 駕駛艙 (過去 7 天)    │
├─────────────────────────────────────────────┤
│  Referrer 分布:                              │
│    🌐 cockpit beacon ████████████████ 64%   │
│    📱 LINE 連結       ████████ 18%          │
│    🔍 Google 搜尋     ████ 9%               │
│    ⌨️  直接訪問        ███ 6%                │
│    📺 YouTube         █ 3%                  │
│  Device:                                     │
│    📱 mobile 78% · 💻 desktop 22%            │
│  時段分布 (Asia/Taipei):                     │
│    8-10 │ ██████████ 上課                   │
│    13-15│ ████████  下午                    │
│    20-22│ ███ 老師備課                       │
└─────────────────────────────────────────────┘
```

**估時**：2.5 hr（含 recharts 視覺化）
**收益**：能回答「禮堂預約系統暴衝 +60/週，是學生在用還是老師在用？是 LINE 連結還是 google 搜尋？」這類過去無解的問題。

---

### P1-5 · cockpit 內部 stage 細粒度 beacon

**為什麼**：目前 cockpit beacon 只在「進入 cockpit」時觸發一次（toolId=81）。但 cockpit 內有 25 個獨立駕駛艙，每個都是獨立教學單元。**哪個駕駛艙最熱門？學生最常看哪一艙？完全沒資料**。

**做法**：
- 在 cockpit 內每個 stage / unit 載入時，beacon 一個「子 id」或「event」
- 設計新的 Firestore collection `cockpitStageStats/{stageKey}`，或擴充 `toolUsageStats/81` 加 `stageBreakdown: {micro-bit-stage1: 12, ...}`
- cockpit 各 stage HTML 加 beacon snippet（toolId=81 + stageId=micro-bit-s1）

**估時**：2 hr（含後端 schema + cockpit 25 個 stage 注入）
**收益**：從「整個駕駛艙熱度」進化到「個別教學單元熱度」，可指引未來內容投入優先序。

---

## 🌐 P2 中長期願景（這個月 / 1-3 個月）

### P2-1 · Akai 真正變成「教學流量平台」

**為什麼**：v3.6.69 把「真實資料」這條地基打好後，下一步是讓阿凱老師（以及未來如果開放給其他老師）能基於這份資料做教學決策：
- 哪些工具被學生長期持續使用？
- 哪些是「上一次課就沒人碰」的曇花一現？
- 同一個課程下哪些工具被頻繁「**一起使用**」？（co-occurrence）
- 學生有沒有可預期的「學習路徑」？（先用 A → 隔天用 B → 一週後用 C）

**做法（系列）**：
1. 在 toolClickEvents 加 `sessionId` 串聯（已有！）
2. 寫 batch script 算 co-occurrence matrix
3. 寫 Sankey 圖 UI 呈現「學生最常從 A 工具流到 B 工具」
4. Anti-pattern detect：找出「被點 1 次就再也沒回來」的工具，主動跟阿凱老師說「這個值得重新設計」

**估時**：兩週（一個小型 data product）
**收益**：Akai 從「工具集 + 排行榜」進化為「教學決策儀表板」— 阿凱老師可以根據「學生用什麼」反推「下學期重點工具」+ 「哪些工具其實該下架」。

---

### P2-2 · 跨工具學習成就系統升級

**為什麼**：已有 `achievements` / `userAchievements` collection，但目前用得很初級。雙寫漂移修好後，**真實使用次數**現在可信，可以基於它設計更豐富的成就：

- 🏆「資訊科技課全勤」：cockpit + class + jhs-curriculum 都用過
- 🌟「PIRLS 探險家」：PIRLS Pro 累積 20+ 工具次
- 🔥「教學熱度王」：單週點某工具 > 50 次（給活躍老師）
- 🎨「跨領域大師」：7 大類別各用過至少一個工具

**做法**：
- 在 `useAchievements.ts` 加跨工具邏輯
- 用 toolClickEvents 的 sessionId 累計
- 排行榜旁加「我的成就牆」入口

**估時**：1 週
**收益**：增加學生 / 老師回訪動機，從「用一次就走」變「想集滿成就」。

---

### P2-3 · cockpit 跟其他大站雙向資料對齊

**為什麼**：cockpit 內部有 NotebookLM 簡報 + YouTube 嵌入 + Canvas 互動，這些**內容互動**比「載入次數」更有意義。但 cockpit 是純 HTML 無 backend，無法把這些 event 寫回 Akai Firestore。

**做法**：
- 在 cockpit 引入 lightweight beacon library（自己寫一個 30 行 ES module）
- 暴露 `window.akaiTrack(event, data)` 給 cockpit 各 stage 用
- 各 stage 在「完成評量」「看完影片」「進到下一關」時呼叫 `akaiTrack`
- 後端 `beaconToolClick` 升級為 `beaconEvent`，分流到 `toolEvents/${kind}` collection

**估時**：3-5 天
**收益**：cockpit 內部互動完整可分析。可知道「micro:bit 駕駛艙的學生有 80% 完成評量、Canva 駕駛艙只有 30%」這類教學品質訊號。

---

### P2-4 · 部分工具支援「使用者帶 query string 來標識身份」

**為什麼**：目前所有 beacon 都是匿名 sessionId。但有些情境老師想知道「**6 年 5 班學生用了幾次**」、「**這場研習的 30 位老師有多少打開**」。

**做法**：
- 標準化 URL 參數：`?from=class-6-5` / `?from=2026-aifed-talk`
- beacon 把 query string 內的 `from` 一併送
- Firestore `toolClickEvents` 新增 `cohort` 欄位
- 後台 dashboard 可依 cohort 切片

**估時**：1 天
**收益**：研習效果評估（多少老師當場用了一次、會後一週還繼續用）、班級教學記錄。

---

### P2-5 · Firestore 資料定期 export 到 BigQuery（長期趨勢分析）

**為什麼**：Firestore 適合 realtime，但跑「**過去 6 個月 #81 是否真的每個月成長**」這種 query 非常慢且貴。BigQuery 適合長期分析。

**做法**：
- Firebase Console 啟用「Export Firestore to BigQuery」extension
- 寫定期 SQL view 算「每月熱門工具」「每月成長率」「stickiness（DAU/MAU）」
- 接 Looker Studio 做免費 dashboard

**估時**：半天（extension 設定）
**收益**：歷史趨勢可視化、決策時的證據鏈、未來 AIFED 演講可以拿真實圖表展示「兩年實驗筆記」。

---

## 🛠️ 技術債清單（順手就改）

- [ ] `useToolClickStats` `loadFromCache` 用的 `localToolsRankings` localStorage key 跟 `useToolTracking` 內某段重複定義，可以抽 const 共用
- [ ] `migrateToolStatsMerge` callable function 用一次就不再需要，可考慮一個月後 deprecate（保留 code 但移除 export，文檔記錄歷史）
- [ ] Firestore Rules 的 toolUsageStats `^[1-9][0-9]{0,2}$` 上限是 999，但 incrementToolClick 內是 1-200。語意應對齊（兩處都改成 200 或都改成 999）
- [ ] cockpit beacon 的 sessionId 命名 `cockpit-${ts}-${random}` 跟 Akai 站的 `getOrCreateSessionId()` 命名不一致，可考慮統一前綴讓後台分析更直覺
- [ ] PROGRESS.md 已 3000 行，可考慮把 v3.6.0-v3.6.50 archive 到 PROGRESS-archive.md 避免每次 grep 都全文掃描
- [ ] CHANGELOG.md 停在 v3.6.59 沒在 commit 流程內，可考慮取消（依賴 git log + PROGRESS.md 即可）

---

## 🎯 推薦執行順序

如果按「每個 session 1 件」推進：

| Session | 動作 | 估時 |
|---|---|---|
| 1 | P0-1 beacon 複製到 #2 #4 #5 三個 GitHub Pages 工具 | 30 min |
| 2 | P0-1 補 #3 早安長輩圖（Firebase Hosting 較特殊） | 30 min |
| 3 | P1-1 排行榜熱度等級徽章 🔥🔥🔥 | 30 min |
| 4 | P1-2 #4 #5 視覺孤兒救援 | 20 min |
| 5 | P1-3 row hover「使用 →」hint | 25 min |
| 6 | P0-2 + P0-3 Schema 健檢 + LINE 告警 | 2 hr |
| 7 | P1-4 流量來源 dashboard | 2.5 hr |
| 8+ | P2 系列依興趣選 | — |

P0-1 三條合起來 ~ 2 hr 就能讓所有 top 5 工具流量歸因到位，**對教學決策的 ROI 最高，建議優先**。

---

## 🧭 設計原則沿用

接續以前路線圖累積的設計原則：

- **cork + 便利貼 + 拍立得視覺語彙**（[[feedback_ui_design_language.md]]）
- **影片必加 BGM**（[[feedback_video_bgm_pipeline.md]]）
- **新內容必補主頁入口**（[[feedback_new_content_homepage_entry.md]]）
- **新增工具走全 pipeline**（[[akai-new-tool-full-pipeline]]）
- **🆕 寫入路徑變更務必同步更新讀取路徑**（v3.6.69 真實事故結論，已寫進相關 skill）
