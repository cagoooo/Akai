# 阿凱老師教育工具集 - 開發進度與歷史紀錄

## 🎯 當前版本狀態
- **當前版本**: `v3.6.90` (本機/CI) · 工具總數 **115 個**（114 + #100 站內索引神器）🎮🚀
- **里程碑**: **2026-07-10 客群推薦精靈全面情境化 + 成效閉環** — 在 v3.6.89 的「人氣＋熱門保底席」之上，一次補齊 P0 四項（徽章／痛點匹配／trending／埋點）與 P1-6（分眾成效 dashboard），把「靜態職務推薦」升級成「情境化推薦＋可量測調權重」。
- **最後更新狀態**: 見下方 `v3.6.90` 段落
- **前一版**: v3.6.89 — 推薦納入排行榜人氣 + 熱門保底席
- **前一版**: v3.6.71 — 新增 #102 外星人入侵·保衛石門 + 雙 tools.json 對齊
- **📎 文件補追記**：本檔案從 v3.6.71 停更到 2026-07-04 才補寫。中間 v3.6.72 → v3.6.87 共 16 個版本（主要是新增工具 #103-#114 + 幾個獨立 bug fix，例如 v3.6.80 使用次數本機計數 bug、v3.6.81/b3032b2 許願池通知從 LINE 遷移到 Google Chat）沒有寫進本檔案，細節可查 `git log`（commit 訊息大多含版本號）。工具總數從 102 → 115 就是這段期間累積的，之後有空再補完整段落。

## 📌 完成功能總覽

### `v3.6.90`（2026-07-10 · 🎯 推薦精靈 P0 四項 + P1-6 成效 dashboard 一次到位）

**🎯 動機**
v3.6.89 上線「人氣＋熱門保底席」後，依使用者指示「持續改良優化推薦客群工具清單邏輯」，把先前列出的 P0 四項與 P1-6 全部做完，讓推薦從「靜態職務對照」升級為「情境化推薦 + 可量測調權重」的完整系統。

**✅ P0 四項（commit [`b6a1510`](https://github.com/cagoooo/Akai/commit/b6a1510)）**

| 項目 | 落地方式 |
|---|---|
| P0-1 「為什麼推」徽章 | `AudienceRecommendationResults.tsx` 依 slot + 痛點命中顯示 🎯命中需求 / 🔥熱門排行 / 👤貼近職務 / 📚同學段 / ✨為你發掘 / ⭐廣受好評（cork 便利貼視覺） |
| P0-2 痛點匹配（最大槓桿） | wizard 新增「你最想解決什麼」複選步驟（教師 8 選／學生 6 選、上限 3），命中 `audienceFit.painPoints` 每個 +22（上限 2）。班級小管家等工具改由情境浮現 |
| P0-3 trending 訊號 | `deltas7d` 合併成 `tool.recentClicks`，加 sqrt trending 加分（權重 20）；熱門保底席改「混合熱度＝累計 + 2×近 7 日」，新爆紅工具不必等累計追上就能露出 |
| P0-4 成效埋點 | results 曝光發 `audience_reco_impression`、點擊發 `audience_reco_click`（含 segment / slot / rank / matched_pains） |

**✅ P1-6 分眾成效 dashboard（commit [`e62bec2`](https://github.com/cagoooo/Akai/commit/e62bec2)）**

- `analytics.ts` 新增 `recordRecoImpression` / `recordRecoClick`：埋點在 GA 之外同步聚合寫進單一 doc `analytics/recoStats`（nested `increment`：segments / tools / slotClicks / painClicks）。`analytics/{docId}` 規則已「所有人可讀、認證者可寫」→ 免改 rules。
- admin 儀表板新增「推薦」分頁 `RecommendationStatsPanel`：KPI（總曝光/點擊/CTR/痛點佔比）、分眾表、slot 點擊分布、工具被推薦成效（橘底標記「常被推卻沒人點」）。
- 形成「量測 → 調權重 → 再量測」閉環。

**🧪 驗證**：新增/更新測試共 44 條全綠、`tsc` 乾淨；真實瀏覽器走完教師流程確認痛點步驟、六種徽章、班級小管家與馬力歐同時露出、impression/click 事件 payload 正確、聚合 doc 寫入結構與 `RecoStats` 型別吻合（測試寫入的資料已清除，正式環境從零累積）。

**🧭 決策記錄**：dev 環境連的是正式 Firebase，驗證時精靈點擊實際寫進了正式 `analytics/recoStats`；依「絕不假造分析數字」原則已刪除整個測試 doc，讓正式資料從真實使用開始累積。

> 📎 第二波優化方向見本檔末「客群推薦精靈 — 第二波 Roadmap」。

---

### `v3.6.89`（2026-07-10 · 🎯 客群推薦精靈納入排行榜人氣 + 熱門保底席）

**🎯 動機**
主頁「客群 onboarding 推薦精靈」（先問老師／學生 → 學段 → 職務 → 產出 6 個推薦工具）上線後，使用者實測發現「排行榜上的馬力歐遊戲、班級小管家都沒被推薦到學生端／教師端」，要求持續改良推薦客群清單邏輯。

**🔍 根因**
推薦演算法（`client/src/lib/audienceRecommendation.ts`）只用**手工指定的 `priority` + 職務／處室配對加分**排序，**完全沒看真實點擊數（`tool.totalClicks`，也就是排行榜的排序依據）**：

| 工具 | 原本狀況 |
|---|---|
| **班級小管家**（id 10） | `priority` 95（全站最高！）卻因 role 槽只取 2 個、又被配對加分的工具反超 → 卡在 **#14~17**，永遠進不了前 6 |
| **超級瑪莉歐**（id 9/28） | 手工 `priority` 只有 48／42 → 學生端被埋在 **#62~65** |

**🛠️ 修法（commit [`18ab91f`](https://github.com/cagoooo/Akai/commit/18ab91f)）— 只動 `audienceRecommendation.ts`，不改任何工具的 `audienceFit` 分類資料**

| 層 | 機制 | 細節 |
|---|---|---|
| ① 人氣加分 | 依 `tool.totalClicks` 相對「合格工具中的最高點擊」做 **sqrt 正規化**，上限 **+28** | 曲線前段陡後段緩，讓中段熱度工具也吃得到加成；權重刻意壓在職務配對（+30）之下 → **個人化仍險勝純人氣** |
| ② 熱門保底席 | 第 6 席改成「挑一個尚未入選、點擊數最高的合格工具」，slot 標為 `popular` | **保證排行榜常勝軍必露出一個**；若完全沒點擊資料（如單元測試）→ 自動退回原本的 `discovery` 邏輯，既有行為不變 |

**✅ 實測結果**（用真實工具資料 + 模擬排行榜點擊）

- **學生端**：超級瑪莉歐冒險進入 `popular` 保底席 ✓
- **導師／科任端**：班級小管家靠人氣加分衝到 `role` 席（分數 163），馬力歐也在 `popular` 席露出 ✓

**🧭 刻意保留的判斷**：班級小管家對「學生端」維持不推薦 — 它是老師的加扣分／監考／聯絡簿**管理後台**（`audiences:["teacher"]`），學生無法操作，強推給學生反而是錯分類。學生端該浮上來的是遊戲類（馬力歐已達成）。

**🧪 驗證**：新增 3 條測試（熱門保底席、人氣加分不覆蓋職務配對、無點擊時退回 discovery），既有 24 條全綠（共 27）；`tsc` 型別檢查乾淨。

> 📎 這是 audience onboarding 推薦精靈系列（commits `c820e5f` 分類 → `f55c315`／`e245be6`／`1f2c0c9` wizard 殼與整合 → `d20d96b` MBTI 條件 → 本次 `18ab91f` 人氣）的延伸優化。下一步方向見本檔末「客群推薦精靈 — 未來優化 Roadmap」。

---

### `v3.6.88`（2026-07-04 · 📱 手機「立即使用」彈窗被靜默擋下總修復 + 🖼️ AIFED 簡報排版修復 + 🚀 早安長輩圖 Pro 導流徽章）

**🎯 動機**
使用者回報手機點工具詳情頁「立即使用」沒反應（畫面顯示 toast「已開啟工具」但實際沒跳轉），另外回報 AIFED 簡報 `akai-talk-2026` 第 16 頁工具卡片跑版、QR Code 太小不好掃。過程中使用者也提出「幫早安長輩圖 Pro 版後台灌點擊數衝進排行榜第五名」的請求 — **已婉拒**（排行榜數字是給訪客看的真實使用度指標，手動改數字等同欺騙瀏覽網站的其他使用者），改以「舊版導向 Pro 版」正當導流取代。

**📱 手機彈窗被靜默擋下問題（commit [`c377c07`](https://github.com/cagoooo/Akai/commit/c377c07) + [`bdbe025`](https://github.com/cagoooo/Akai/commit/bdbe025)）**

| 問題 | 根因 | 修法 |
|---|---|---|
| 點「立即使用」toast 顯示已開啟但沒跳轉 | `handleUseTool` 先 `await` 追蹤/通知 API，中間再隔 400ms `setTimeout` 才建立 `<a target="_blank">` 模擬點擊 — 跳出「使用者手勢」同步呼叫堆疊，手機瀏覽器彈窗攔截器靜默擋下 | 改成 `BulletinToolCard` / `BulletinLeaderboard` 已驗證過的寫法：click handler **最開頭、任何 await 之前**就同步呼叫 `window.open()`，追蹤/通知全部改背景執行 |
| 彈窗被擋下時原頁面被強制導頁離開 | 上一版 fallback 邏輯是「擋下就用 `window.location.href` 改同分頁導頁」，等於使用者永遠會離開工具詳情頁 | 拿掉這個 fallback，改跳 toast + 可手動點擊的連結（`<a href target=_blank>`），原頁面永遠不會自動導走 |

影響範圍：`BulletinToolDetail.tsx`（`/tool/:id` 主要詳情頁）+ `ToolDetail.tsx`（`/tool-classic/:id` 舊版）。已用 preview 模擬「彈窗成功」與「彈窗被擋」兩種情境驗證 `window.location.href` 全程不變。

**🖼️ AIFED 簡報 #16 頁跑版 + QR 放大（commit [`2487db6`](https://github.com/cagoooo/Akai/commit/2487db6)）**

`akai-talk-2026/index.html` 的 `.mini-tool` 小卡片內 `<span>` 包 label/title/url 三行文字，少了 `display:flex;flex-direction:column`，子元素以行內文字方式流動 → 「立即試用」跟「班級小管家」擠成同一行、URL 斷字換行（`cagoooo` 被腰斬）。補上 `.mini-info` class 修正直排，QR Code 順手從 98px 放大到 150px（卡片 480px→560px），原圖 420×420 解析度足夠支撐放大不糊。

**⚠️ 順手發現：GitHub Pages Deploy workflow 連續失敗 2 次** — 錯誤是 GitHub 端通用的 `Deployment failed, try again later`（build/artifact 都成功，只有 `actions/deploy-pages@v4` 這一步失敗），`gh run rerun --failed` 重跑 3 次後第 3 次才成功。**不是本次程式碼問題**，但暴露流程目前沒有自動重試機制，靠人工發現 + 手動補救。已列入下方 P0 建議清單。

**🚀 早安長輩圖舊版導向 Pro 版（commit [`bdfd744`](https://github.com/cagoooo/Akai/commit/bdfd744)）**

新增 `EducationalTool.upgradeToId` / `upgradeFromId` 兩個可選欄位（`client/src/lib/data.ts`）：

| 工具 | 欄位 | 呈現 |
|---|---|---|
| #14 點亮詩意（poet.smes 舊版） | `upgradeToId: 91` | 卡片 + 詳情頁顯示紫色「🚀 已推出 Pro 版，功能更完整 →」連到 #91 |
| #91 PhotoPoet Pro | `upgradeFromId: 14` | 卡片右上角 + 詳情頁標題下方顯示「✨ PRO 升級版」徽章 |

資料驅動而非 UI 硬編：之後任何「舊版→Pro 版」關係只要補這兩個欄位就能重用同一套渲染邏輯，不用重寫元件。目前已知還有 3 對「同源雙部署」尚未套用這個徽章（見下方 P0-1）。

**📌 決策記錄**：使用者兩次要求「後台灌點擊數把 Pro 版衝進排行榜第五名」，均已婉拒 — 排行榜數字是給訪客看的真實使用度指標，手動改數字等同對瀏覽網站的其他使用者造假。改以本項「舊版導向 Pro 版」正當導流取代，讓 Pro 版靠真實點擊自然爬升。

---

### `v3.6.71` (🎮 新增 #102 外星人入侵·保衛石門 + 雙 tools.json 對齊)

**🎯 動機**
使用者一句「設計一個外星人入侵的射擊遊戲」，從零做成完整可玩作品，再依序加上 PWA、雲端排行榜，最後收進工具集。

**🎮 新工具 #102（commit [`228d30d`](https://github.com/cagoooo/Akai/commit/228d30d)）**

| 項目 | 內容 |
|---|---|
| 工具卡片 | client + server tools.json，games 類別 / Rocket icon / 12 tags |
| 預覽圖 | Playwright 截遊戲開始畫面（石門校徽入鏡）→ 1024×1024 webp |
| OG 圖 | `generate-unified-og.mjs 102` → cork 便利貼風 1200×630 |
| 手寫長文 | POST_102 三段式：純 Canvas 單檔 / PWA 離線 / 全校榜健康競爭 / 石門主題，配對 #101 #97 |
| 生態系 | `sync-deployment-ecosystem` 自動更新手寫長文 102 → 103 篇 |

遊戲本體（獨立 repo [cagoooo/alien-invasion](https://github.com/cagoooo/alien-invasion)）：單檔 HTML5 Canvas + PWA（可安裝/離線）+ Firebase 匿名登入排行榜，後端**安全重用** penguin-leaderboard 的獨立 `alienInvasion` 集合（合併規則保留 leaderboard/nicknames 原功能）。

**🔧 雙 tools.json 對齊（commit [`bdb355b`](https://github.com/cagoooo/Akai/commit/bdb355b)）**
`server/data/tools.json` 先前遺漏 #100 索引神器（client 102 / server 101），從 client 複製 entry 依 ID 插入，兩邊 ID 完全一致（各 102）。

> 📎 後續：遊戲端的「未來優化/可開發功能藍圖」見 alien-invasion repo 的 `PROGRESS.md`（8 大類 + 三波落地順序）。

---

### `v3.6.70` (🎯 P0+P1 大滿貫：8 個 task 一個 session 內到位)

**🎯 動機**
v3.6.69 把雙寫 doc 漂移地基修好後，使用者明確要做完 FUTURE_OPTIMIZATION_V3.6.69.md 列的 P0+P1 全部 8 個 task。**一個 session 內全部完成 + deploy + verify**，共產出 8 個 commit 跨 5 個 repo（Akai / it-cockpit / schedule / class / files / PhotoPoet）。

**🎨 排行榜 UI 升級三件套（commit [`4f676b7`](https://github.com/cagoooo/Akai/commit/4f676b7)）**

| Task | 修法 | 結果 |
|---|---|---|
| P1-1 火等級徽章三段 | `fireLevels = [80→🔥🔥🔥 爆紅 / 30→🔥🔥 急上升 / 10→🔥 上升中]`，top 5 全部熱度梯度可視化（取代既有單一 isRising 標記）| #1 +128 = 🔥🔥🔥、#2 +60 = 🔥🔥、#4 +16 / #5 +20 = 🔥 |
| P1-2 #4 #5 視覺孤兒救援 | medalLabels 擴 5 條（鋁🏅第 4、銅紅🏅第 5），medalColors 擴對應，opacity 0.78 視覺份量略輕 | 5 張卡都有完整身份感 |
| P1-3 row hover「使用 →」hint | tokens.css 加 `.use-hint` 規則，sticker-card hover 才淡入（opacity 0→1 + translateX(-6px)→0）；觸控裝置由既有 `@media (hover:none)` 自動禁用 | desktop 強化「整 row 可點」可發現性 |

順手把 `+N/週` 文字從 `!isRising` 條件解放，現在徽章跟文字 row 分工清楚：徽章說「熱度等級」、文字說「精確 +N」。

**🎯 P0-1 beacon 擴散 4 個熱門工具**

讓使用者直接從任何入口（LINE / Google 搜尋 / bookmark / 直接打 URL）進入這些工具都會被計入排行榜，**不再受限於「從 Akai 站排行榜點」這條窄路徑**。

| toolId | repo | 部署 | commit |
|---|---|---|---|
| 46 (#2 禮堂&專科教室&IPAD平板車預約) | cagoooo/schedule | GitHub Pages，patch index.html | [`d16a50e`](https://github.com/cagoooo/schedule/commit/d16a50e) |
| 10 (#4 班級小管家) | cagoooo/class | GitHub Pages，patch **classnew.html**（index.html 是 meta refresh）| [`1c3dcfd`](https://github.com/cagoooo/class/commit/1c3dcfd) |
| 68 (#5 手作課程上傳) | cagoooo/files | GitHub Pages，patch index.html | [`af5689b`](https://github.com/cagoooo/files/commit/af5689b) |
| 14 (#3 早安長輩圖) | cagoooo/PhotoPoet | **Next.js App Router**，patch `src/app/layout.tsx` `<head>` 用 `dangerouslySetInnerHTML` 注入 IIFE | [`73bd98c`](https://github.com/cagoooo/PhotoPoet/commit/73bd98c) ⚠️ 在 master，待手動 merge 到 main |

每個 beacon snippet 統一格式：sessionStorage key 帶 toolId 去重、共用 SID 串聯同學生流量、`new Image().src` 零 CORS preflight、unload 也送得出去。

**🛡️ P0-2 Schema 健檢雙件套（commits [`97325d9`](https://github.com/cagoooo/Akai/commit/97325d9) + [`0ed7a6f`](https://github.com/cagoooo/Akai/commit/0ed7a6f)）**

backend (`functions/src/healthCheckToolUsageStats.ts`)：
- admin only callable，掃 toolUsageStats collection 偵測：
  - docId 非純數字 1-999（schema 漂移）
  - totalClicks 不是 number / 負值
  - dailyClicks key 不符 YYYY-MM-DD / 值異常
- 回傳 summary（totalDocs / numericDocCount / errorCount / warnCount）+ issues 前 50 條

frontend (`client/src/components/admin/HealthCheckPanel.tsx`)：
- 「▶️ 跑健檢」按鈕觸發 callable
- 結果顯示：5 個 stat box（總 doc / 純數字 docId / 總 clicks / errors / warns）+ issues 可滾動清單（紅色 error / 橘色 warn）
- 標題列健康狀態 badge（✅ 健康 / ⚠️ N 個問題）
- 已在 AnalyticsDashboard 內 `SnapshotManagementPanel` 之後渲染

**🚨 P0-3 LINE 即時告警 trigger（commit [`97325d9`](https://github.com/cagoooo/Akai/commit/97325d9) 內）**

`functions/src/monitorToolStatsSchema.ts` 是 `onDocumentWritten('toolUsageStats/{docId}')` trigger：

- 任何寫入即時檢查 docId / totalClicks 異常
- 走 `pushFlexToAdmin`（既有 LINE Bot 管道）推 Flex Message 給管理員
- `alertSilence` collection 記錄上次告警時間，**24 小時內同 doc dedup**（避免 burst write 噪音）
- Flex 卡片含異常 docId + 問題清單 + 24h dedup 提示

主動 + 被動雙保險：admin 隨時可手動健檢、寫入異常自動推 LINE。

**🔬 P1-5 cockpit 27 stage 細粒度 beacon（commits [`3c25de5`](https://github.com/cagoooo/Akai/commit/3c25de5) + [`7073ad0`](https://github.com/cagoooo/it-cockpit/commit/7073ad0)）**

把單一 toolId=81 升級成「整體 + 27 個 stage breakdown」，未來能看「micro:bit 被點 X 次、Canva AI 被點 Y 次」這類教學單元熱度。

backend：
- `recordToolClickInternal` 加 opts.stageId
- sanitize: `^[a-zA-Z0-9_-]{1,32}$`（擋 abuse）
- 寫入 `toolUsageStats/{toolId}.stageBreakdown.{stageId}` += 1
- `toolClickEvents` 也帶 stageId 供後台 detail 切片
- `beaconToolClick` HTTP 接 `?stageId=` query

frontend (it-cockpit)：
- 各 stage HTML `<head>` 加 beacon snippet 帶 stageId
- 各 stage 自己 sessionStorage flag（akai_beacon_81_{stage}_sent）— 同分頁切 stage 各算一次
- 共用 `akai_beacon_sid` 串聯同學生的瀏覽路徑（後台可分析學習動線）

自動化：`scripts/inject-cockpit-stage-beacons.mjs` 一次性掃 cockpit dir、idempotent 注入 27 stage 全部 OK / 0 SKIP / 0 WARN。

涵蓋 27 stages：
ai-image-pk · ar-vr-wearables · blogger-ai-design · canva-ai · canva-magic · computer-friend · deepfake-detective · digital-safety · fact-check · gem-storymaker · gemini-canva · gemini-guided-learning · gemini-music · grad-film-ai · inkscape-vector-art · microbit-makecode · mqueen-microbit · pagamo-advanced · pagamo-gamified-learning · pagamo-world · photocap · pixnet-blog · scratch-animation · scratch-game · suno-class-song · typing-en · windows-basics

**📊 P1-4 流量來源 dashboard — 已存在無需重做**

調查發現 `client/src/components/admin/ToolFlowAnalysisPanel.tsx` 已有 445 行完整實作：referrer / device / country / 24 小時時段四維 PieChart + 工具切換 + 日期範圍。已在 AnalyticsDashboard line 1118 渲染中。FUTURE_OPTIMIZATION_V3.6.69.md 寫「資料躺在 Firestore 沒人看」是錯的，已修正認知。

**🛡️ 進化後 7 道防線完整總覽**

| 層 | 機制 | 防什麼 | 引入版本 |
|---|---|---|---|
| 1 | useToolClickStats 雙讀加總 | 過渡期不丟資料 | v3.6.69 |
| 2 | firestoreService 寫入路徑統一 | 消除未來雙寫源頭 | v3.6.69 |
| 3 | +N/週 用 Firestore dailyClicks | 跨裝置一致、真實每日 | v3.6.69 |
| 4 | migrateToolStatsMerge 一次性合併 | 清歷史 99 個漂移 doc | v3.6.69 |
| 5 | Firestore Rules docId 純數字限制 | 從寫入源頭擋掉異常命名 | v3.6.69 |
| **6** | **healthCheckToolUsageStats callable + dashboard UI** | **主動健檢，admin 隨時可按按鈕** | **v3.6.70** |
| **7** | **monitorToolStatsSchema onWrite trigger + LINE 告警** | **被動即時警報，24h dedup** | **v3.6.70** |

**📈 影響面**

- 排行榜真實流量範圍：從「只計 Akai 站內點擊」→ **#1 + #2 + #4 + #5 + (#3 在 master) 5 個工具任何入口都計入**
- 第 #1 駕駛艙進化成「整體 + 27 stage」雙層分析資料
- Schema 出問題 0-5 分鐘內被偵測（先前可能數週才被發現）
- HealthCheckPanel 給後台一個「現在系統健不健康」單一答案
- LINE 告警等於把資料品質監控外包給手機推播（不再需要主動 grep / log 巡邏）

**⚠️ 待辦項目**

- **PhotoPoet** beacon commit 在 master 分支但 default 是 main，且分歧 95 commit（Firebase Studio AI 工作流）。未自動 PR/merge 避免一次拖一整批不相關變更。需要使用者下次手動 merge 或在 GitHub 開 PR cherry-pick `73bd98c` 到 main。

### `v3.6.69` (🚨 排行榜雙寫 doc 漂移總修復 + cockpit 流量歸因 beacon)

**🎯 動機**
從「排行榜 UIUX 還能改良嗎？」這個輕量問題出發，PR 過程中用 dev preview + Firestore REST API 對照 UI 顯示 vs 真實資料，**意外揪出史上最大 stale-data bug**：使用者帶全班學生 5/28 點 90 次，UI 卻只多 +5/週 — 真實累計都進 Firestore 但前端讀錯邊永遠看不到。連帶把「直接打 cockpit URL 不會計數」也一併解決。

**🎨 排行榜 UIUX 三修（commit [`55094a8`](https://github.com/cagoooo/Akai/commit/55094a8)）**

| 問題 | 修法 | 數據 |
|---|---|---|
| 金/銀/銅膠帶疊到標題 | `top: -10→-16` 飄到卡片頂端外、width 80→60、字級 11→10、標題行 `paddingRight: 38` | 疊字 60px → **12px** |
| #2-#5 全是 🛠️ 沒區辨性 | 補 ICON_TO_EMOJI 5 條：Image / Images / CalendarCheck / Users / LayoutDashboard | 🎛️🖼️🗓️👥📸 五張卡完全區辨 |
| `+N/週` = 0 時不顯示像「資料缺失」| 改顯示灰色 `±0/週` + tooltip「過去 7 天沒上升」 | 5 張卡資訊密度統一 |

**🚨 雙寫 doc 漂移總修復（commits [`905ab3d`](https://github.com/cagoooo/Akai/commit/905ab3d) + [`20ae053`](https://github.com/cagoooo/Akai/commit/20ae053) + [`c60dbca`](https://github.com/cagoooo/Akai/commit/c60dbca)）**

**Root cause**：v3.6.49+ `incrementToolClick` callable 改寫 docId 從 `tool_${id}` → `${id}`，但前端 `useToolClickStats` line 159 仍用 `typeof data.toolId === 'number'` 條件判斷（只有舊 schema 有這欄位）。**新 doc 全部被 skip**，學生點擊都進新 doc 累計但 UI 永遠讀舊 doc。`+N/週` 5 也只反映「callable 失敗 fallback 寫到舊 doc」的少數案例，完全不代表真實活躍度。

| 修法 | 檔案 |
|---|---|
| 1️⃣ `useToolClickStats` 從 `doc.id` 推導 toolId，支援 `81` 與 `tool_81` 兩種命名並加總（過渡期不丟資料） | `client/src/hooks/useToolClickStats.ts` |
| 2️⃣ `firestoreService` fallback 改寫 `String(toolId)`，消除未來雙寫源頭 | `client/src/lib/firestoreService.ts` |
| 3️⃣ `+N/週` 改用 Firestore `dailyClicks` 過去 7 天加總，跨裝置一致、不再依賴 localStorage snapshot 設計缺陷（snapshot 時機是「打開首頁那刻」，老師晚上才開首頁時已含整天 90 次，隔天看不到差異） | `client/src/hooks/useToolClickStats.ts` |
| 4️⃣ 新增 `migrateToolStatsMerge` admin onCall（從 admin browser console 觸發） | `functions/src/migrateToolStatsMerge.ts` |
| 5️⃣ 新增 `migrateToolStatsRunOnce` 一次性 HTTP（跑完即刪） | 已撤除 |
| 6️⃣ Firestore Rules 限制 toolUsageStats docId 必須 `^[1-9][0-9]{0,2}$` 純數字、totalClicks 必須 int >= 0 | `firestore.rules` |

**Migration 執行成果（2026-05-29 03:48）**：
- 99 個 `tool_*` 舊 doc → 全部合進對應 `${toolId}` 新 doc，0 errors
- 回收 **2,437 次點擊累計**（之前完全消失在 stale collection）
- 驗證：`toolUsageStats` 內 `tool_*` 殘留 = **0**，純數字 docId = 100
- `migrateToolStatsRunOnce` HTTP endpoint 立即 `firebase functions:delete` 撤除，curl 確認 404

**UI 變化（同一個 #1 toolId=81）**：

| 指標 | 修前 | 修後 | 解釋 |
|---|---|---|---|
| totalClicks | 616 | **744** | = 舊 doc 616 + 新 doc 128 |
| +N/週 | +5 | **+128** | 用 dailyClicks 真實 7 天：5/25=2 + 5/26=31 + 5/27=3 + **5/28=90** + 5/29=2 |
| #2 禮堂&專科教室&IPAD平板車預約 +N/週 | +4 | **+60** ↑15× | 真實熱度被 stale schema 蓋住 |
| #5 手作課程 +N/週 | ±0 | **+20** | 「沒人用」原來是假象 |

**🎯 cockpit 流量歸因 beacon（commits [`edf2e91`](https://github.com/cagoooo/Akai/commit/edf2e91) + [`b7f583d`](https://github.com/cagoooo/it-cockpit/commit/b7f583d)）**

**Root cause**：`trackToolUsage()` 只在「從 cagoooo.github.io/Akai 站內點工具」時呼叫，學生直接打 cockpit URL / bookmark / LINE 連結進入完全不計數。

| 元件 | 檔案 | 行為 |
|---|---|---|
| `beaconToolClick` HTTP function | `functions/src/index.ts` | `onRequest` + cors: true，GET `?toolId=81&referrer=&device=&sessionId=` → 204 No Content；抽出 `recordToolClickInternal` helper 給 callable 跟 beacon 共用 |
| cockpit `<head>` IIFE | `it-cockpit/index.html` | `new Image().src = beacon URL` 像素 beacon，零 CORS preflight、unload 也送得出去；sessionStorage 去重（同分頁 reload 不重複） |

**整套防線回顧（5 層）**：

| 層 | 防什麼 |
|---|---|
| 1. `useToolClickStats` 雙讀加總 | 過渡期 onSnapshot 不丟資料 |
| 2. `firestoreService` 寫入路徑統一 | 消除未來雙寫源頭 |
| 3. `+N/週` 用 Firestore `dailyClicks` | 跨裝置一致、真實每日 |
| 4. `migrateToolStatsMerge` 一次性合併 | 清理歷史 99 個漂移 doc |
| 5. Firestore Rules `docId` 純數字限制 | 從寫入源頭擋掉未來再漂移 |

**📊 影響面**
- 排行榜歷史累計從 stale 變真實，**回收 2,437 click** 之前永遠看不到
- 學生課堂用量現在會準確、即時反映 UI
- 任何工具未來加同樣 beacon snippet（改 toolId）就能歸因直接訪問流量
- 多了一個歷史教訓：寫入路徑變更務必同步更新讀取路徑（[[changelog-version-drift-trap]] 印證）



**🎯 動機**
v3.6.67 H 區四大件套上線後，使用者實機測試遇到第一個「測試訊息怎麼刪」需求 — 開啟 admin 後台路線。同時補完 v3.6.67 後續 R2 sitemap + O3 QR 驗證 + 三大 UX 修復。

**🛡️ P1 admin-questions.html 後台（commit [4606bd7](https://github.com/cagoooo/Akai/commit/4606bd7)）**

純靜態頁 + Firebase Web SDK + Google sign-in + admin custom claim：

| 功能 | 行為 |
|---|---|
| 🔒 admin 認證 | onAuthStateChanged + idTokenResult.claims.admin 驗證；非 admin 自動 signOut |
| 📌 置頂 | `pinned: true` → live-questions.html 訂閱時優先輪播 |
| 🙈 隱藏 | `hidden: true` → live-questions.html 直接 filter 掉（觀眾消失，後台保留紀錄）|
| 🗑️ 刪除 | confirm + deleteDoc 永久刪除 |
| ⚠️ 清空全部 | 雙重 confirm + batch delete 400/批 防超 500 限制 |
| 📊 即時 stats | 工具列顯示「共 N / 顯示中 / 隱藏 / 置頂」|
| 🐹 觀眾編號 | 跟 live-questions.html 完全對齊（同 hash 拿同 emoji + 同編號）|

對應 Firestore rules 更新：
```
match /talkQuestions/{msgId} {
  allow read: if true;                    // 公開大螢幕讀
  allow create: if false;                 // 只 Cloud Function admin SDK 寫
  allow update, delete: if admin claim    // admin 後台管理
}
```

**🔐 admin UX 三大修復（commit [3fbe250](https://github.com/cagoooo/Akai/commit/3fbe250) + [1a979e3](https://github.com/cagoooo/Akai/commit/1a979e3)）**

| 問題 | 修法 |
|---|---|
| 帳號錯誤時看不到 banner | errorBanner 從 adminPanel 內部移到 wrap 頂部，loginCard / adminPanel 任一狀態都可見 |
| 進頁面立刻看到「null 沒有 admin」誤觸發錯誤 | Akai 站自動匿名登入訪客做 visitorStats，`!user \|\| user.isAnonymous \|\| !user.email` 都視為「未登入」靜悄悄顯示登入卡不報錯 |
| 沒明示管理員是哪個帳號 | loginCard 加「請用 `ipad@mail2.smes.tyc.edu.tw` 登入」明示；錯誤時 errorBanner 跑 errorShake 動畫 + 自動 signOut。1a979e3 後續砍掉囉嗦的 cagooo@ 解釋句 |

**⚙️ live-questions header 加後台快捷（commit [1df8614](https://github.com/cagoooo/Akai/commit/1df8614)）**

- header 右側 stats 區塊最前面加 32×32 圓形 ⚙️ 按鈕
- `target="_blank"` 新分頁開（不打斷大螢幕輪播）
- hover：橘金底 + 旋轉 45° 動畫
- 普通觀眾看到 tooltip 顯示「需 admin 登入」會自動退避

**🔎 R2 sitemap 補 talk 路徑（commit [4606bd7](https://github.com/cagoooo/Akai/commit/4606bd7)）**
- `akai-talk-2026/` priority 0.8
- `AIFED2026_paper.pdf` priority 0.7
- 總 URL 306 條

**✅ O3 簡報內 QR 連結驗證（4606bd7 內）**
- 7 個 tool-cta（#3/#23/#45/#58/#78/#81/#87）HTTP 301 — GitHub Pages trailing-slash redirect，預期行為
- Akai 主站 + `vote/` + `cloud/` + `class/` 全 200 OK
- 簡報內 QR 連結沒問題

**📁 變動檔案總覽（v3.6.68）**
```
新增:
client/public/akai-talk-2026/admin-questions.html  ← P1 後台管理（500 行純 HTML）
~/.claude/projects/H--Akai/memory/akai_admin_account.md  ← Akai admin = ipad@ memory

修改:
client/public/akai-talk-2026/live-questions.html
  - onSnapshot filter data.hidden（admin 隱藏不顯示）
  - 排序: pinned 優先 → 同 pinned 按 timestamp desc
  - header 加 ⚙️ 後台快捷按鈕（target=_blank）

firestore.rules
  - talkQuestions 加 allow update, delete: admin claim
  - create 改為 false (Cloud Function admin SDK 繞 rules)
  - 已 deploy 到 akai-e693f

scripts/generate-sitemap.mjs  ← 加 akai-talk-2026/ + PDF
client/public/sitemap.xml      ← regenerate 後 306 URL

~/.claude/projects/H--Akai/memory/MEMORY.md  ← 加 admin claim memory 索引條目
```

**🎯 戰略意義**
- **演講當天閉環**：先有 live-questions.html 公開大螢幕 + 現在補上 admin 後台，演講者助理能即時 hide 不當訊息 / pin 精彩問題
- **權限分層清楚**：公開讀（觀眾掃 QR 看大螢幕）/ Cloud Function 寫（webhook）/ admin 改刪（後台）三層完整
- **Memory 寫好 Akai admin claim 屬於 ipad@**：未來任何 admin UI 自動引導使用 ipad@ 避免重蹈這次「cagooo@ 用不了 admin」誤會
- **R2 sitemap + O3 QR 驗證**：演講對外曝光跟 QR 跳轉路徑都驗過，演講當天不會掃 QR 跳 404

**📌 線上**
- live-questions（公開大螢幕，演講者按 Q 開）: https://cagoooo.github.io/Akai/akai-talk-2026/live-questions.html
- admin-questions（後台管理，ipad@ 登入）: https://cagoooo.github.io/Akai/akai-talk-2026/admin-questions.html

**📚 5 個 commits（v3.6.67 PROGRESS commit 474cdfc 之後）**
```
4606bd7 🛡️ [P1] admin-questions.html 後台 + [R2] sitemap 加 talk 路徑
3fbe250 🔐 admin-questions 三大 UX 修復（errorBanner / 匿名 user / 加 ipad@ 提示）
1a979e3 ✂️ admin login card 砍掉囉嗦解釋
1df8614 ⚙️ live-questions header 加後台快捷按鈕
（PROGRESS commit 待）
```

**📚 演講當天 admin 工作流**
1. 演講前清測試訊息：admin 後台「⚠️ 清空全部」雙重 confirm
2. 演講進行中：助理開 live-questions（主視覺）+ admin（操作）雙視窗
3. 不適合訊息 → admin 點「🙈 隱藏」→ live-questions 立刻消失
4. 精彩問題 → admin 點「📌 置頂」→ live-questions 永遠優先輪播該則
5. 演講後：保留 talkQuestions 當「阿凱老師問題信箱」常態運作 / 或一鍵清空歸零

---


### `v3.6.67` (🎤 AIFED 演講當天互動全套)

**🎯 動機**
v3.6.66 收完簡報靜態 + 平台整合的「基礎建設」，演講倒數階段需要「現場真正能用」的互動工具。H 區四大件套 + LINE 觀眾提問端到端跑通。

**🎬 H 區：演講當天互動深化**

| Task | Commit | 演講當天用法 |
|---|---|---|
| H3 `#slide-N` 深連結 | [7f4d24a](https://github.com/cagoooo/Akai/commit/7f4d24a) | 部落格 / 社群分享連結到第 14 張投影片，hashchange handler + history.replaceState |
| H4 觸控手勢 + 手機浮動 nav | [7f4d24a](https://github.com/cagoooo/Akai/commit/7f4d24a) | swipe ≥ 60px 切片，手機浮動 ‹ › 圓形按鈕 |
| H1 `live-stats.html` + L 熱鍵 | [42fbde5](https://github.com/cagoooo/Akai/commit/42fbde5) | 按 L 開新分頁顯示「累計訪客 / 今天進站 / 演講中新增 / 主推工具點擊」4 格大字 tile |
| H2 LINE 觀眾提問 + Q 熱鍵 | [80fe5b6](https://github.com/cagoooo/Akai/commit/80fe5b6) | 按 Q 開新分頁顯示 LINE 觀眾即時提問大字輪播 + 240×240 QR 主視覺 |

**🎫 H2 LINE 觀眾提問完整實作**

新建 LINE Channel `2010219191 / @399ffpsg` 專屬演講提問（不能共用既有 `2008810864` — 會搶 smes-e1dc3 既有 webhook URL）：

- **Cloud Function**：`functions/src/lineTalkWebhook.ts` HTTP webhook
  - HMAC-SHA256 X-Line-Signature 驗證（用 `req.rawBody` 避雷）
  - 解析 message event → 寫 Firestore `talkQuestions` collection
  - userId SHA-256 hash 截 8 字（隱私保護 — Firestore 公開可讀）
  - 訊息 > 500 字 / events > 50 直接丟棄（防灌水）
  - 部署 URL：`https://us-central1-akai-e693f.cloudfunctions.net/lineTalkWebhook`

- **Firestore rules**：`talkQuestions/{msgId}` 公開讀 + Cloud Function admin SDK 寫
- **Frontend**：`live-questions.html` 純靜態頁
  - Firebase Web SDK 10.13.2 + onSnapshot 訂閱最新 8 則
  - 6 秒輪播 + slideIn 動畫
  - 240×240 LINE Bot QR 主視覺側欄（演講廳遠距觀眾可掃）

- **SETUP_H2.md**：7 步部署文件（建 channel / OA 設定 / pipe secret / deploy / Verify / 下載 QR / 端到端測試）

**🚨 緊急修補（演講前不能漏的兩個 bug）**

| 痛點 | Commit | 修法 |
|---|---|---|
| tool detail markdown 連結缺 `/Akai/` basePath → 點下去 404 到 `cagoooo.github.io/tool/X` | [8ea2c61](https://github.com/cagoooo/Akai/commit/8ea2c61) | 新增 `client/src/lib/resolveLink.ts` 共用 helper 自動加 `import.meta.env.BASE_URL`，掛 BulletinToolDetail / ToolIndexAI 的 ReactMarkdown components.a — **91 處連結一次修好** |
| live-questions deploy 後使用者看到 disk cache 舊版 QR | [183586b](https://github.com/cagoooo/Akai/commit/183586b) + [b27ae6d](https://github.com/cagoooo/Akai/commit/b27ae6d) | 雙保險：(1) HTML 加 3 個 cache-control meta 強制不快取；(2) deck-stage.js L/Q 熱鍵 `window.open('xxx.html?v=' + Date.now())` 帶 cache-bust 時戳 |

**👥 觀眾互動 UX 4 輪迭代（H2 上線當天精細打磨）**

| 迭代 | Commit | 解決什麼 |
|---|---|---|
| v1 64×64 header QR | [ee3fd8e](https://github.com/cagoooo/Akai/commit/ee3fd8e) | 上線即可用 |
| v2 240×240 主視覺側欄 + RWD 三段 | [5907540](https://github.com/cagoooo/Akai/commit/5907540) | 演講廳遠距觀眾掃不清 → QR 從 64px → 240px 主視覺 |
| v3 觀眾編號 + 同人多則合併 | [93caa01](https://github.com/cagoooo/Akai/commit/93caa01) | hash `5949d7b3` 不友善 → 🐹 觀眾 #1 + emoji 區分 + 「第 X 則 / 共 Y」repeat-tag + flash glow 新訊息提示 |
| v4 手機 column 排版 + badge 單行 | [49bf086](https://github.com/cagoooo/Akai/commit/49bf086) | 手機 row 排版擠成兩行 → 統一 column flex、三段斷點（768/480/375）、badge nowrap |

**📁 變動檔案總覽（v3.6.67）**

```
新增:
client/public/akai-talk-2026/
├── live-stats.html              ← H1 即時訪客動態 (4 格大字 + Firestore onSnapshot)
├── live-questions.html          ← H2 LINE 提問即時輪播 (240px QR + 觀眾編號 + flash glow)
└── assets/qr-line-talk.png      ← LINE Bot @399ffpsg 加好友 QR

client/src/lib/
└── resolveLink.ts               ← Markdown 連結 basePath helper

functions/src/
└── lineTalkWebhook.ts           ← LINE inbound webhook (HMAC-SHA256 + Firestore)

(root)/
└── SETUP_H2.md                  ← LINE 部署 7 步完整指引

修改:
client/public/akai-talk-2026/deck-stage.js
  - constructor: bind _onHashChange / _onTouchStart / _onTouchEnd
  - connectedCallback: 加 hashchange / touchstart / touchend listener + _buildMobileNav()
  - _onKey: 加 L / Q 熱鍵（cache-bust ?v= 帶 timestamp）
  - 新增 _syncHash / _onHashChange / _toggleHelp / _buildMobileNav / _onTouchStart / _onTouchEnd
  - ? overlay 加 8 條快捷鍵清單（含新增 L / Q）

client/src/pages/BulletinToolDetail.tsx
  - import resolveInternalLink
  - ReactMarkdown components.a 攔截 href

client/src/pages/ToolIndexAI.tsx
  - 同上 (#100 工具索引 About 區塊)

functions/src/index.ts
  - export lineTalkWebhook

firestore.rules
  - 新增 match /talkQuestions/{msgId}: read true, write false
```

**🎯 戰略意義**
- **演講當天工具帶完整**：L/Q/?/← →/swipe 全套熱鍵 + 兩個即時頁
- **觀眾體驗端到端**：掃 QR → 加 LINE → 傳訊息 → 即時上大螢幕（含觀眾編號、emoji 區分、flash glow）
- **永久維護的疫苗**：cache-bust 雙保險 + resolveLink helper 杜絕兩類經典 bug 不再復發
- **下一場演講零行 React 程式碼**：v3.6.66 ExternalWorkBanner + 這次 H 區建好的整套工具，新演講只需 SETUP_H2.md 跑一次 LINE Channel 設定

**📌 線上**
- 簡報：https://cagoooo.github.io/Akai/akai-talk-2026/index.html
- 即時統計（按 L）：https://cagoooo.github.io/Akai/akai-talk-2026/live-stats.html
- 實況提問（按 Q）：https://cagoooo.github.io/Akai/akai-talk-2026/live-questions.html
- Cloud Function：`https://us-central1-akai-e693f.cloudfunctions.net/lineTalkWebhook`

**🚀 演講當天熱鍵手冊**
| 鍵 | 動作 |
|---|---|
| `?` | 鍵盤快捷鍵 overlay |
| `L` | 開即時統計頁 |
| `Q` | 開實況提問牆 |
| `← / →` | 切換投影片 |
| `1-9 / 0` | 跳第 N 張 |
| `R` | 回到第 1 張 |
| `F11` | 瀏覽器全螢幕 |
| swipe | 手機左右切片 |
| 浮動 ‹ › | 手機觸控按鈕 |

**📚 11 個 commits（從 v3.6.66 後續）**
```
7f4d24a 🔗📱 [H3+H4] 簡報深連結 + 觸控手勢 + 手機浮動 nav
42fbde5 📊 [H1] 演講即時統計頁 + L 鍵快捷開啟
80fe5b6 🎤 [H2] LINE 演講提問完整實作（code 端齊備）
8ea2c61 🔗 修工具卡片內 markdown 連結缺 /Akai/ basePath 的 bug
5907540 🎫 live-questions.html QR 大幅放大 + RWD 全面改良
ee3fd8e 🎫 LINE Bot QR (@399ffpsg) 嵌入 live-questions.html header
183586b 🔄 演講即時頁加 cache-control 雙保險
b27ae6d 🔄 補上 deck-stage.js L/Q 熱鍵 query string cache-bust
93caa01 🐹 [Q-優化] 觀眾編號 + 同人多則合併標記 + flash glow
49bf086 📱 [手機-優化] live-questions.html 直式 column 排版 + badge 單行
```

**📚 三大踩雷紀錄（未來不要再踩）**
- LINE webhook 不能共用既有 Channel（一個 Channel 一個 webhook URL，會搶事件）→ 演講專用新建 Channel
- GitHub Pages HTML 預設 max-age 600s，動態頁 deploy 後使用者看舊版 → cache-control meta + URL ?v=Date.now() 雙保險
- ReactMarkdown 內 `[text](/tool/45)` render 成 `<a href="/tool/45">` 會 404 到 `cagoooo.github.io/tool/45`（缺 `/Akai/`）→ 用 helper 攔截 + import.meta.env.BASE_URL 自動加 prefix

---


### `v3.6.66` (🎤 AIFED 演講深度優化收官)

**🎯 動機**
v3.6.65 演講簡報上線當天即發現可改善空間，分三大方向一次性收官：
- **A 區**：簡報靜態檔本身（效能 / 內容 / 互動 / 署名）
- **B 區**：Akai 主頁這層的整合深化（觀測 / 跳轉 / 可重用 / 驚喜）
- **社群資產**：favicon 多尺寸 + OG 分享卡 + Schema.org（解決「分享到 LINE/FB 預覽空白」+ 「Google 搜尋無法結構化解讀」）

**🎤 A 區：簡報內容打磨（4 條）**

| Task | Commit | 改動 | 效益 |
|---|---|---|---|
| A1 logo 壓縮 | [55b018b](https://github.com/cagoooo/Akai/commit/55b018b) | 2MB → 140KB PNG + 112KB WebP + `<picture>` fallback | 首屏 LCP 3G 5-8s → < 1s（**縮 14-18 倍**）|
| A4 ? 鍵盤 overlay | [1218971](https://github.com/cagoooo/Akai/commit/1218971) | deck-stage.js 加 `_toggleHelp()` + 8 條快捷鍵清單 | 訪客不再需要試誤掌握導航 |
| A2 學校 footer | [d83cd30](https://github.com/cagoooo/Akai/commit/d83cd30) | closing slide 加石門國小連結 + Made with ❤️ by 阿凱老師 | 依 `akai-author-footer` skill 合規 + SEO 反向連結 |
| A3 jsx pre-compile | [eff9d0a](https://github.com/cagoooo/Akai/commit/eff9d0a) | 兩個 jsx → tweaks-bundle.js（esbuild）+ React production min | 拿掉 Babel CDN（**省 270KB + 300ms compile**）|

**🏗️ B 區：平台整合深化（4 條）**

| Task | Commit | 改動 | 效益 |
|---|---|---|---|
| B1 GA4 事件追蹤 | [d14fa95](https://github.com/cagoooo/Akai/commit/d14fa95) | banner 兩個 CTA 各加 trackEvent('aifed_speech_click') | 一週後可決定 banner 視覺重量是否合適 |
| B3 QuickNav | [0a754f1](https://github.com/cagoooo/Akai/commit/0a754f1) | 4 色便利貼 anchor 跳轉：排行榜/工具地圖/部落格/工具牆 | 訪客省 30 秒滾動時間 |
| B2 通用化 | [db8b183](https://github.com/cagoooo/Akai/commit/db8b183) | 抽 ExternalWorkBanner + externalWorks.ts 資料設定檔 | 未來第二場演講零行 React 程式碼 |
| B4 首次撒花 | [6c874d8](https://github.com/cagoooo/Akai/commit/6c874d8) | ConfettiBurst 抽 primitives + localStorage 記憶 | 首訪驚喜感 + 老訪客不被吵 |

**🎨 社群分享資產（commit [b21a41f](https://github.com/cagoooo/Akai/commit/b21a41f)）**

| 資產 | 規格 | 設計 |
|---|---|---|
| `favicon.svg` | 向量版 | 寶藍底 + 米白「演」字 + 橘金圖釘點 |
| `favicon.ico` | multi-size 16/32/48 | 同款 PNG 打包 |
| `favicon-{16,32,48}x{16,32,48}.png` | 分尺寸 | 各平台 fallback |
| `apple-touch-icon.png` | 180×180 | iOS 加入主畫面 |
| `og-aifed-2026.png` | 1200×630, 90KB | 寶藍漸層 + 主標「從使用者到開發者」+ AIFED 標籤 + 100 工具強調 |
| `og-aifed-2026.webp` | 38KB | 新瀏覽器較小檔案版 |

技術細節：
- 用 `@napi-rs/canvas` + `NotoSansTC-Bold.ttf` 確保中文無 tofu（依 `og-social-preview-zh` skill）
- index.html 加完整 `og:* / twitter:*` meta（絕對 URL 給 LINE/FB crawler）
- Schema.org `PresentationDigitalDocument` JSON-LD（學術引用可結構化解讀）
- favicon link 用相對路徑（純靜態子站直接 resolve，不需 SPA base 處理）
- `scripts/generate-aifed-talk-assets.mjs` 一次性生成器，未來改文案 / 換主色重跑即可

**📁 變動檔案總覽（v3.6.66）**

```
client/public/akai-talk-2026/
├── assets/logo.png            ← A1 壓縮（2MB → 140KB）
├── assets/logo.webp           ← A1 新增（112KB）
├── deck-stage.js              ← A4 加 _toggleHelp + ? handler
├── index.html                 ← A2 footer + A3 bundle 引用 + favicon/og meta
├── tweaks-bundle.js           ← A3 預編譯 bundle
├── tweaks-{app,panel}.jsx     ← 原檔保留（dev 時可參考）
├── favicon.{ico,svg}          ← 新增
├── favicon-{16,32,48}x{...}.png  ← 新增
├── apple-touch-icon.png       ← 新增
└── og-aifed-2026.{png,webp}   ← 新增

client/src/components/
├── bulletin/ExternalWorkBanner.tsx   ← B2 新增（通用元件）
├── bulletin/BulletinSpeechBanner.tsx ← B2 改 thin wrapper
├── bulletin/BulletinQuickNav.tsx     ← B3 新增
├── bulletin/BulletinMilestone100.tsx ← B4 抽 ConfettiBurst + ensureCheerStyles
└── primitives/ConfettiBurst.tsx      ← B4 新增（共用撒花）

client/src/data/
└── externalWorks.ts           ← B2 新增（資料設定檔）

client/src/pages/
└── BulletinHome.tsx           ← B3 加 QuickNav 掛載 + section id

scripts/
└── generate-aifed-talk-assets.mjs    ← 新增（一次性 favicon/OG 生成）
```

**🎯 戰略意義**
- **可量測**：v3.6.65 banner 視覺重量靠直覺，v3.6.66 起 GA 數據導向決策
- **可擴展**：v3.6.66 後新增第二場演講只需往 `externalWorks.ts` unshift 一筆，**零行 React 程式碼**
- **可分享**：v3.6.66 前分享到 LINE 預覽空白，v3.6.66 後有專屬視覺卡片（防中文 tofu）
- **可印**：closing slide 學校連結 + Schema.org 結構化資料，未來學術引用 / 媒體採訪 / 教師研習邀約都能直接認得
- **可重複**：所有資產生成都有腳本，未來其他演講（GESS / Bett / 教師年會）可在 30 分鐘內套同款模板上線

**📌 線上**
- 主頁入口：https://cagoooo.github.io/Akai/
- 簡報：https://cagoooo.github.io/Akai/akai-talk-2026/index.html
- PDF：https://cagoooo.github.io/Akai/akai-talk-2026/AIFED2026_paper.pdf
- OG 圖（給 LINE/FB Debugger 驗證）：https://cagoooo.github.io/Akai/akai-talk-2026/og-aifed-2026.png

**📚 9 個 commits 一氣呵成**
```
d14fa95 📊 [B1] AIFED banner CTA 加 GA4 事件追蹤
55b018b 🗜️ [A1] 簡報 logo 壓縮：2MB → 140KB PNG + 112KB WebP
1218971 ⌨️ [A4] 簡報加 ? 鍵盤快捷鍵 overlay
d83cd30 🏫 [A2] 簡報 closing slide 加學校 footer
0a754f1 🧭 [B3] 主頁加 BulletinQuickNav 快速跳轉指示牌
db8b183 🔌 [B2] 抽通用 ExternalWorkBanner + externalWorks.ts
6c874d8 🎊 [B4] ExternalWorkBanner 首次顯示撒花機制
eff9d0a ⚡ [A3] 簡報 jsx pre-compile + production React
b21a41f 🎨 簡報頁加 favicon + OG 分享卡 + Schema.org
```

**📚 三次踩雷紀錄（避免未來再踩）**
- 簡報 logo 直接 commit 2MB 原檔 → 14 倍流量浪費（**A1 已修，未來其他 handoff zip 解壓後先 audit 圖檔尺寸**）
- esbuild jsx transform 預設輸出 ES module 風格，跨 .jsx 共享變數需要合併成單一 bundle（**A3 已修**）
- emoji `🎤` 在 `@napi-rs/canvas` 用 NotoSansTC-Bold 渲染變 tofu（**OG 圖已改純文字 chip 避開**）

---


### `v3.6.65` (🎤 2026 AIFED 演講簡報整合)

**🎯 動機**
- 阿凱老師受邀 AIFED 2026（亞洲教育科技創新領袖年會）演講「從使用者到開發者」，已用 Claude Design 完成 25 張投影片純 HTML
- 把這份對外作品整合進 Akai 主頁，讓教學現場訪客也能看見「學術年會」這個外部 milestone
- 同時保留 PDF 投稿稿件下載入口，給學術引用 / 跨校研習 / 媒體採訪使用

**🎤 整合策略**

| 設計取捨 | 抉擇 | 理由 |
|---|---|---|
| 進工具卡片牆 vs 主頁 hero 入口 | **主頁 hero 入口**（像影片介紹）| 演講不是課堂工具，硬塞 7 大分類會破壞 taxonomy |
| Vite multi-page entry vs 純靜態子站 | **純靜態子站**（`client/public/akai-talk-2026/`）| 簡報自帶 React UMD + Babel CDN，自管 deck-stage.js，塞進 React Router 是噪音 |
| 整合廣度（MVP / 中間 / 全套）| **中間**（卡片 + 主頁 hero 入口）| 符合 memory「冷啟動訪客 1 次點擊內看見」原則 |
| 附帶素材 | PDF (132KB) 一起放 / PPTX (4.9MB) 不放 | 學術引用 PDF 有價值，PPTX 對訪客無意義且太大 |

**📐 三次設計迭代（5/27-5/28 三 commit 上線）**

| commit | 改動 | banner 高度 | 視覺重量 |
|---|---|---|---|
| [f645737](https://github.com/cagoooo/Akai/commit/f645737) v1 大 banner | 深寶藍底 + 主標 26px + 副標 + 鍵盤提示 | 260px | 太誇張 |
| [6e526e9](https://github.com/cagoooo/Akai/commit/6e526e9) 低調版 | 淺綠便利貼 + 單行排版，移除副標／鍵盤提示 | 65px | ✅ 收斂 1/4 |
| [0945905](https://github.com/cagoooo/Akai/commit/0945905) 手機 RWD | column flex + CTA stretch 等寬 + 41px tap target | 桌面 65px / 手機 142px | ✅ 兩端兼顧 |

**📁 變動檔案**
- 新增：`client/public/akai-talk-2026/`（11 個檔，~2.4MB）
  - `index.html`（118KB / 25 sections / speaker-notes JSON / Tweaks 面板掛載）
  - `deck-stage.js` `image-slot.js`（核心 web component）
  - `tweaks-app.jsx` `tweaks-panel.jsx`（Babel standalone runtime compile）
  - `assets/logo.png` + 4 個 QR Code（投票 / 文字雲 / 駕駛艙 / 平台）
  - `AIFED2026_paper.pdf`（132KB 學術投稿稿件）
- 新增：`client/src/components/bulletin/BulletinSpeechBanner.tsx`（淺綠便利貼 + 主標 + 雙 CTA）
- 修改：`client/src/pages/BulletinHome.tsx`（import + 掛載在 milestone 與 hero 之間）
- 修改：`.gitignore`（加 `_handoff_*/` 規則防 Claude Design zip 解壓目錄誤入版控）

**📌 線上**
- 主頁入口：https://cagoooo.github.io/Akai/
- 簡報：https://cagoooo.github.io/Akai/akai-talk-2026/index.html
- PDF：https://cagoooo.github.io/Akai/akai-talk-2026/AIFED2026_paper.pdf

**🎯 戰略意義**
- 主頁不只放「教學工具」，也能放「對外作品 / 學術活動 / 媒體露出」這類非工具但同等重要的成果
- 為未來其他演講 / 研習 / 工作坊建立可重複的 banner 模板（複製 BulletinSpeechBanner 改文案即可）
- 雙 CTA 模式（看簡報 + 下載 PDF）也適用於其他「視覺呈現 + 文字稿」配對的內容
- 證明「Claude Design handoff → Akai 平台整合」可在 4 小時內完成（含 scope 對齊 + 三次設計迭代 + 手機 RWD）

**📚 踩到的雷（避免下次再踩）**
- Vite dev server 對 `/akai-talk-2026/`（無 trailing index.html）會 SPA fallback 到 React → 連結必須明確帶 `/index.html`（跟 `share/100.html` pattern 一致）
- `useIsMobile` hook 在 preview_resize 後不會自動 re-render，必須 reload 才會生效（測試 RWD 注意）
- Claude Design handoff 的 zip 解壓目錄記得加 `.gitignore`，否則 1.6MB logo + 5MB PPTX 會被誤 commit

---


### `v3.6.64` (🇹🇼 字幕完美化收官 + skill 歸檔)

**🎯 動機**
- v3.6.63 v4 影片上線後，使用者實測字幕仍有問題：「所有的字幕的句子的斷句都有點問題 請找出問題並修正」
- 截圖顯示三大 bug：(1) 中文詞被切半（「教育工」+「具。」）；(2) 一行字幕混兩位 speaker；(3) word-level 高亮顯示簡體「台灣」而不是繁體「臺灣」
- 收官目標：把字幕做到「逐幀截圖檢視都挑不出問題」的程度，並把所有踩雷編入可重複使用的 skill

**🇹🇼 三大字幕完美化修正**

| 修法 | 之前的問題 | 新作法 |
|---|---|---|
| **GPT 直接 12-18 字斷句** | 自寫演算法按字數+標點切，總在英文詞中間切（「Made with love b」+「y 阿凱老師」）| 用 `gpt-4o-mini` + 嚴格 prompt：「絕對不可新增/刪除任何字、絕對不在詞中間斷行、12-18 字一行」 |
| **Speaker boundary split** | 「超罕見成就。沒錯，」一行混 Gordon + Kiki | build script 在 speaker switch 點強制 split caption group |
| **word.w OpenCC s2twp** | text 欄位轉繁中但 `words[].w` 漏處理 → CaptionLayer 逐字高亮顯示簡體「台」| `fix-word-level-s2twp.mjs` 補丁 + 整合進主 build script Step 2.5（45 unique words 修正） |

**🎬 v6 影片成品**
- 720p 14 MB / 7:02
- 線上：https://cagoooo.github.io/Akai/share/100-dialog.html （local mp4 fallback，YouTube quota 重置後切回 iframe）
- 字幕 232 個 caption groups，每行 12-18 字、繁中、speaker 切換正確
- 逐幀驗證：「震撼**臺灣**國小教育圈的」word-level 高亮正確顯示繁中「臺」

**📚 skill 歸檔（避免下次再踩同樣的雷）**
- `notebooklm-to-video-bridge` skill 完整建立（7 階段 workflow + 16 條 traps）
  - trap #11：speaker boundary split（同行雙人對白）
  - **trap #11.5：word-level 也必須跑 OpenCC，不能只轉 text 欄位**
  - trap #12-16：MIN_DISPLAY_SEC / GPT prompt 嚴格度 / OpenCC s2twp 必要性 / 等等
- `notebooklm-podcast-pipeline` skill 同步更新（auth fallback、Chrome MCP UI fallback）
- 兩個 skill 都加進 `~/.claude/skills/README.md` 索引

**📁 變動檔案**
- `scripts/add-punctuation-rebuild-captions.mjs`（主 build script，加入 Step 2.5 word.w OpenCC + speaker boundary split）
- `scripts/fix-word-level-s2twp.mjs`（一次性 patch，已歸檔到 repo）
- `src/celebration-dialog/captions-data.ts`（232 groups 重新產生）
- `H:\Akai\client\public\share\celebration-100-dialog.mp4`（v6 替換）

**🎯 戰略意義**
完美字幕 + speaker 切換 + word-level 繁中高亮三項做到位後，整條 podcast→video pipeline 才算真正「可量產」— 下一篇文章丟進來就能跑出同樣品質的成品。

**📌 待辦（明天 ~15:00 YouTube quota 重置）**
- 用 `re-upload-v6.mjs` 重傳 v6 到 YouTube 取代 `5ZvBbiC521E`（v4 簡中版）
- 切回 `100-dialog.html` 的 YouTube iframe（取消 local mp4 fallback）

---


### `v3.6.63` (最新 · 🎙️ Podcast→Video Pipeline 跑通 + Kiki & Gordon 雙人對談特輯)

**🎯 動機**
- v3.6.62 第一篇 podcast 上線後，user 提議「**先有語音再做 HTML 渲染簡報影片**」— 把流程倒裝
- 用 NLM 自動產 podcast，再用 whisperx + Remotion 視覺化成完整教學長片
- 結果：建立可重複的「文章 → AI Podcast → 視覺化長片」流水線

**🎙️ Podcast 來源（NotebookLM Pro，cgoooo 帳號）**
- 主題：「100 工具達成慶祝特輯」（4 連 source 含精煉文字 + 主講者 prompts）
- 格式：`audio_format="deep_dive"` + `audio_length="short"`
- 實際長度：**7:02 / 13 MB m4a**
- 結構：Kiki 開場「歡迎加入今天的深度解析」→ Gordon 接話介紹背景 → 雙人輪流對談 5 主題

**🎨 視覺角色（OpenAI gpt-image-1，medium quality 1024×1024）**
- **Kiki 🌸**：青色 `#00e5ff` 主題、知性女聲發問者
- **Gordon 🎙️**：金色 `#ffb300` 主題、沉穩男聲解答者
- 風格：拍立得相片 + 紅圖釘 + cork 公佈欄背景一次性畫進去
- 一次生圖約 22-26 秒，並行生 2 張總耗時 30 秒

**🤖 Speaker Diarization 雙重驗證**
- `whisperx 3.8.6 + small` 模型 + `pyannote/speaker-diarization-community-1`
- 輸出 SPEAKER_00 / SPEAKER_01 word-level labels
- **librosa YIN F0 pitch 分析驗證**：
  - SPEAKER_01 中位數 **211 Hz**（女聲區間 165-255Hz）→ ✅ Kiki
  - SPEAKER_00 中位數 **156 Hz**（男聲區間 85-180Hz）→ ✅ Gordon
- Group level speaker：用 word-level majority 決定該 caption group 顯示哪位

**🇹🇼 繁中字幕（OpenCC s2twp）**
- whisperx 偶爾把繁中音訊 transcribe 成簡中
- OpenCC s2twp（簡 → 臺灣繁體 + 詞彙轉換）批次處理 750 unique 字串
- 範例：「这是」→「這是」、「台灣」→「**臺灣**」、「老师」→「老師」

**🎬 Remotion 5 場景 composition**
- 0-25s **openTitle**：Kiki 發藍光 + 黃膠帶「阿凱老師 × 100 工具達成」
- 25-100s **chNumbers**：三色便利貼數字（100 / 101 / 7）
- 100-220s **chTools**：五大里程碑工具拼貼（#1/3/46/81/100）
- 220-360s **chTech**：3 個工程師朋友尖叫的技術決定
- 360-422s **chClosing**：黃膠帶「不要追數量 · 追深度」+ URL CTA

**📦 Component 庫**（可複用，未來其他 podcast 視覺化都能用）
- `CorkBackground` — 軟木板紋理 + 上下木條
- `RedPin` — 紅色圖釘
- `PolaroidHost` — 主持人卡片（active 發光 + scale up）
- `BulletinTape` + `StickyNote` — 黃膠帶 + 便利貼
- `DialogScene` — 雙人對話 layout
- `CaptionLayer` — 黑底毛玻璃 + word-level 高亮 + speaker badge

**📊 4 版迭代史**
| 版本 | 主持人 | Speaker 切換 | 字幕 | 長度 | 階段 |
|---|---|---|---|---|---|
| v1 | brief 單人配音 + 視覺雙人 | 硬編 | 無 | 1:44 | 視覺驗證 |
| v2 | brief 單人配音 + 視覺雙人 | 奇偶切換 | 簡中 | 1:44 | 字幕串接 |
| v3 | skip（檔名混淆） | - | - | - | - |
| **v4** ⭐ | **真實 NLM 雙人 deep_dive** | **whisperx diarization** | **繁中** | **7:02** | **完成版** |

**🚀 戰略意義**
從這天起，Akai 任何一篇部落格都可在 **4-6 小時內** 自動產出：
- 🎙️ NLM 雙人對談 podcast（5-10 分鐘）
- 🎬 Remotion 視覺化長片（與 podcast 同長度）
- 📺 上 YouTube + 嵌入網站 podcast 播放器

**📁 Akai-promo-video-rm 專案的新增**
（這部分檔案在 `C:\Users\smes\Desktop\Cowork\akai-promo-video-rm\`，獨立於 Akai repo）

- `src/AkaiCelebration100Dialog.tsx`（主 composition）
- `src/celebration-dialog/` 目錄（6 個 cork 風 components）
- `scripts/gen-hosts.mjs`（OpenAI gpt-image-1 角色生成）
- `scripts/build-celebration-captions.mjs`（whisperx → captions）
- `scripts/patch-captions-traditional.mjs`（OpenCC 簡轉繁）
- `public/hosts/host-kiki.png` + `host-gordon.png`（1024×1024 PNG）
- `public/celebration-100-dialog.m4a`（13 MB / 7:02 NLM podcast）
- `out/celebration-100-dialog-v4-real-dialog.mp4`（43 MB / 7:02 / 1080p 影片）

**📚 配套 skill 更新**
- 新增 `notebooklm-podcast-pipeline` skill（完整 7 階段 + 15 條踩雷）
- 升級 `teaching-cockpit` + `lesson-prep` 同步 NotebookLM auth 真根因 SOP
- HuggingFace token 概念釐清（不是 MCP，是 license 認證憑證）

---

### `v3.6.62` (🎙️ 100 工具達成 milestone podcast 上線)

**🎯 動機**
- v3.6.61 完成 GEO/SEO 五項後，下一波是「**內容多形式化**」
- NotebookLM Pro 帳號（cgoooo）的 deep_dive 對談功能 = 業界最強中文 podcast 自動化

**📦 第一篇 podcast 上線**
- 對應文章：`milestone-100-tools-achieved`
- 來源：用 1432 字精煉摘要餵入 NLM（從 5000+ 字原文濃縮）
- 格式：deep_dive default（兩位主持人對談）
- 結果：**20:26 / 19 MB mp3**（m4a 38MB → ffmpeg 128kbps mp3 = 19MB）
- 部署位置：`client/public/blog-podcasts/milestone-100-tools-achieved.mp3`

**🎨 BlogPodcast 元件**（`client/src/components/blog/BlogPodcast.tsx`）
- cork 風便利貼 + 黃色背景 + 黑框
- HTML5 audio controls + 自動讀 metadata 顯示時長
- 「🎙️ AI PODCAST」橘色 badge + 「由 NotebookLM 生成」說明
- 「⬇ 下載 mp3 離線聽」連結
- **條件渲染**：HEAD 探測檔案存在才顯示，其他 100 篇沒 podcast 的文章不受影響
- 掛入 `BlogPost.tsx` 在 BlogHero 與正文之間

**🔬 流程記錄（建立 SOP）**
- Notebook ID：`3bcf9745-804c-4e16-b1fe-45defc0d67c6`
- 透過 Chrome MCP 自動操作 NotebookLM UI（當時 MCP auth 有 bug）
- 後續 MCP 修對：升級 nlm 0.5.20 → 0.6.12 + 用新版重抓 cookies
- 完整流程寫進 `notebooklm-podcast-pipeline` skill

**🐛 連帶修正**
- check-links.mjs 加 `normalizeUrl()` 處理 #100 站內 SPA 路由
- GitHub Actions「Failed to parse URL」誤報排除

---

### `v3.6.61` (🟥 P0 GEO/SEO 五項全套到位)

**🎯 動機**
- v3.6.60 完成 GEO 基礎（llms.txt + noindex），這版把整個 P0 路線圖五項一次做完，全面建立 GEO/SEO 護城河

**📦 五項變更**

| # | 項目 | 檔案 | 影響 |
|---|---|---|---|
| 1 | Schema.org 三件套 | `client/index.html`、`scripts/generate-og-pages.mjs` | Google rich snippets、AI 知識圖譜 |
| 2 | `llms-full.txt` 全文版 | `scripts/generate-llms-txt.mjs`（擴充） | 給 ChatGPT GPT/Claude Project 深度 ingest |
| 3 | GEO 監測腳本 | `scripts/test-geo-discoverability.mjs`（新建） | 每月可追蹤 AI 助手引用率 |
| 4 | 內部連結優化 | `BulletinInternalLinks.tsx`（新建）+ `BulletinFooter.tsx` | PageRank 集中到 9 大經典 |
| 5 | Blog SEO 升級 | `generate-og-pages.mjs` blog 段 | BlogPosting schema + 閱讀時間 + alt text |

**🏷️ Schema.org 三件套詳細**
- 首頁 `index.html`：
  - `EducationalOrganization`（站點主體，描述修正「90+」→「100」）
  - `Person` schema（阿凱老師 @id #akai，含 9 個 `knowsAbout` 技能領域）
  - `WebSite` schema 含 `SearchAction` → Google sitelinks search box
- `share/100.html`：`VideoObject`（`duration: PT5M32S` + `contentUrl` → Google 搜尋可顯示影片縮圖卡片）
- `blog/{slug}/index.html`：`BlogPosting`（含 `author`/`publisher`/`wordCount`/`timeRequired`/`about` 關聯工具）
- 驗證結果：首頁 6 entries / 影片頁 4 entries / blog post 10 entries

**🤖 llms-full.txt（404 KB 全文版）**
- 對 `llms.txt`（72 KB 索引版）的擴展，包含每工具完整 `detailedDescription`（~948 字/工具）+ 每篇部落格完整內文（截到 4000 字/篇）
- 適合場景：OpenAI custom GPT、Claude Project knowledge、Perplexity Spaces
- `llms.txt` 內加 reference 連到 `llms-full.txt`，AI 爬蟲可依需求選深度

**🧪 GEO 監測腳本（10 prompts × 4 平台）**
- 10 個標準測試 prompts 分四類：直接搜尋（A）/ 情境搜尋（B）/ 技術搜尋（C）/ 名詞搜尋（D）
- 4 個 AI 平台：ChatGPT / Claude / Perplexity / Gemini
- 結果記錄到 `geo-tests.json`（HIT/PARTIAL/MISS）
- `--report` flag 看歷史 hit rate 趨勢與各平台統計
- 建議頻率：每月 1 號跑一次

**🔗 內部連結優化**
- 新元件 `BulletinInternalLinks.tsx`，插到 `BulletinFooter` 頂部
- 顯示三區：⭐ 9 大經典工具 chips（#1/8/3/4/7/6/17/26/74）/ 🧭 4 hub 連結 / 📰 最新 3 篇部落格
- 用 `<nav aria-label>` 加語意，每頁可見 → 集中 PageRank 到核心內容
- 補強：BulletinFooter 在 App.tsx、BlogList.tsx、BlogPost.tsx、BlogDraftPreview.tsx 都用 → 全站受益

**📝 Blog SEO 升級**
- `og:image:alt` 加上明確描述（無 alt 是 SEO 扣分項）
- `article:tag` meta 從 post.tags 動態產出
- `BlogPosting` JSON-LD 含 author Person reference (`@id`)、publisher、wordCount、timeRequired
- `about` 欄位列出文章關聯的工具 → AI 能建構「文章 ↔ 工具」雙向圖譜

**🐛 連帶修正**
- VideoObject schema 的 `uploadDate` 解析 `2026 年 5 月 24 日` 中文格式失敗，改為硬編碼 `2026-05-25`

---

### `v3.6.60` (🤖 GEO 強化基礎 + SEO 優化 + RWD 跑版修正)

**🎯 動機**
- Google Search Console 報「頁面會重新導向 / 替代頁面 / 已檢索未索引」13 頁，需釐清是否真有問題
- 使用者強調希望被 ChatGPT / Claude / Perplexity 等 AI 搜尋找到（GEO）
- 手機端發現工具地圖卡片與 100 達成 Banner 都有跑版問題
- check-links workflow 報 #100 為「Failed to parse URL」誤判

**🤖 GEO 強化（核心）**
- 新增 `scripts/generate-llms-txt.mjs`：從 `tools.json` + `posts.ts` 動態產出 `llms.txt`
- `client/public/llms.txt`（72 KB）：按 [llmstxt.org](https://llmstxt.org) 標準的 Markdown 索引
  - 站點簡介 + 主要頁面 + 100 工具按 7 大分類列出 + 101 篇深度長文 + 引用建議
  - 每次 `npm run build` 自動更新（已掛 build pipeline）
- `robots.txt` 升級：明確 `Allow` 七個主流 AI 爬蟲（GPTBot、ClaudeBot、Claude-Web、PerplexityBot、Google-Extended、CCBot、anthropic-ai）
- 預期效果：1-3 個月內 AI 助手回答「桃園國小老師 自製教育工具」、「PIRLS 閱讀理解 怎麼用 AI 做」這類問題時開始引用本站

**🔍 SEO 優化（Search Console 清理）**
- `scripts/generate-og-pages.mjs` 三個純 OG redirect 頁加 `<meta name="robots" content="noindex, follow">`：
  - `/tool/N/index.html`（100 個工具 OG landing）
  - `/wish/index.html`（許願池 OG landing）
  - `/share/heatmap.html`（首頁 heatmap 變體，canonical 指首頁）
- 保留 index 的頁面：`/share/100.html`（真實影片頁）、`/blog/{slug}/index.html`（部落格文章）
- 副作用：1-4 週後 Search Console「重新導向 / 替代頁面 / 已檢索未索引」報告數字會逐漸歸零

**📱 RWD 手機優化**
- `BulletinMilestone100.tsx`：
  - 容器水平 padding `60px → 12px`（手機）
  - Tape 膠帶：固定 `520px → calc(100vw - 28px)`，避免溢出
  - 副標文字手機版精簡並換行顯示
  - 側邊 🎊🥳 emoji（絕對定位 -34px）手機隱藏
  - 「看 5:32 宣傳影片」按鈕加 `whiteSpace: nowrap` 防斷字
  - 引入 `useIsMobile` hook 統一斷點處理（768px）
- `BulletinSiteStats.tsx`：
  - 「最大宗」chip 加 `flexShrink + minWidth: 0 + ellipsis`，文字超出截斷而非溢出
  - 圓餅圖 + 圖例 grid 手機改縱向排列（圓餅圖獨佔一行自動置中，圖例下方雙欄全寬）

**🔗 check-links CI 修正**
- 問題：#100 工具索引神器 URL 為 `/Akai/tool/100`（站內 SPA 路由相對路徑），`fetch()` 無法解析
- 解法：`scripts/check-links.mjs` 加 `normalizeUrl()`，遇 `/` 開頭 prefix `https://cagoooo.github.io`
- 結果：100/100 全 OK（98 通過 + 2 反爬蟲網站 skipped），關閉 GitHub issue #4

**📊 數據摘要**
| 項目 | 數量 |
|---|---|
| 新增檔案 | 2（generate-llms-txt.mjs、llms.txt） |
| 修改檔案 | 5（robots.txt、check-links.mjs、generate-og-pages.mjs、BulletinMilestone100.tsx、BulletinSiteStats.tsx） |
| llms.txt 大小 | 72 KB（含 100 工具 + 101 篇文章） |
| Commits | 5（644abe7、b40d67d、b1d845e、7c6dde2、+ SW bump） |

---

### `v3.6.59` (✨ 100 工具達成宣傳影片 v3 + 影片觀賞頁)

**🎬 影片重製（akai-promo-video-rm 專案）**
- 從舊版 87 秒 BGM 影片升級為 5:32 紀錄片風格旁白影片
- TTS：Microsoft Edge `zh-TW-YunJheNeural` 男聲沉穩 rate=-15%
- 字幕：word-level 同步（`boundary="WordBoundary"`），script-first 演算法產 139 個 CaptionGroup
- 12 個場景：hook → milestone → repo → 主推 5 大工具 → usecase → 9 大經典 → 7 大類別 → openspirit → techStack → blog → bloglist → cta
- 新場景 `SceneMilestone.tsx`：暗色霓虹 2×2 卡片展示最後四款 #97-100
- 全程字幕 overlay（`Captions.tsx`）：黑底毛玻璃 + 金色高亮，讀 `captionsData.ts` 139 groups
- Render 輸出：`akai-promo-v3.mp4`（28.8 MB / 9960 幀 / 5:32）

**📺 影片觀賞頁 `share/100.html` 重做**
- 暗色主題（`#111827`）取代舊款軟木板棕色
- HTML5 video player + stats strip：5:32 / 100 款工具 / 104 篇手寫長文 / 桃園市石門國小 / MIT
- 三個 CTA 按鈕：探索工具 / GitHub 開源碼 / 下載影片
- **關鍵架構修正**：原本 `scripts/generate-og-pages.mjs` 內的 `generateCelebration100PageHtml()` 會在每次 build 覆寫 `share/100.html`，把舊 87 秒版生成回去。直接改寫生成器函式輸出新影片頁，徹底解決「靜態檔被 build 覆蓋」陷阱
- `BulletinMilestone100.tsx`：按鈕文字「看 87 秒紀念短片」→「看 5:32 宣傳影片」、「含旁白+BGM」→「含旁白+字幕」

**🛠️ 影片製作技術棧（akai-promo-video-rm/）**
- Remotion 4.x（React-based video framework）
- Edge TTS（Python API）取 word-level WordBoundary 時間戳
- ffmpeg：mp3 → wav (pcm_s16le, 22050Hz) 給 Remotion Audio
- 字幕演算法（v2 script-first）：narration-script.txt 為斷句基準，transcript-v3.json 只用來取時間，保護詞組（Production / micro:bit / Made with love）跨界 merge

---

### `v3.6.58` (✨ 35 個非 GitHub 工具描述用部落格淬煉「準確版」)

**🎯 動機**
- v3.6.57 把全部 99 個工具升級成 markdown 排版，但其中 35 個工具原本就沒有 `detailedDescription`（多為 Replit / Google Sites / XOOPS VM / Firebase / LINE / Padlet / Claude Artifacts 等 GitHub 以外平台），subagent 只能憑空猜，內容失真

**📚 解法 — 從部落格淬煉**
- 35 個工具全部有阿凱手寫的部落格長文（總計 6000-17000 字 / 工具），最權威的內容來源
- 流程：
  1. Node script 從 `client/src/blog/posts.ts` 提取每工具對應 `body`，依字數平衡切成 3 批（14/11/10 個工具）
  2. 派 3 個 subagent 平行讀部落格 body → 淬煉成準確 `detailedDescription`
  3. Node merge script 合併進 `server/data/tools.json` + `client/public/api/tools.json`

**🔥 修正的失真內容（範例）**
- `#4 PIRLS`：補上「跟 #87 同源雙部署」「Gemini 2.5 Flash」「PaGamO 題組匯出」「< $0.25 月費」
- `#7 點石成金`：補上「450+ 成語標籤勾選」「12 種風格並列」「石門國小全校共享 API Key」「v2.15.0」
- `#13 5W1H Aura`：補上「6 格同時呈現」「Prompt 防 LLM 爛梗」「Firebase Functions v2 + Genkit + Gemini 2.0 Flash」
- `#17/#18 抽籤`：改正 #17「一個一個抽保留懸念」、#18「正取+備取雙清單」（兩者分工不同）
- `#24 教師午會`：改正成「114 上學期校務會議紀錄 SPA」含 10 大章節 + 自治市長致詞
- `#26 九九乘法`：改正成「快樂九九乘法大冒險」用 Web Audio API 合成音效
- `#33/#37/#38 聲音`：補上「聲音三部曲」漸進設計（數字 → 視覺化 → 玩遊戲）
- `#40 Padlet`：補上「不重複造輪子」的工程哲學
- `#49 教務處寶藏庫`：改正成「academic 子站含 3 子頁」（不是模糊的「資源庫」）

**📊 數據比較**
| | v3.6.57（subagent 憑空版） | v3.6.58（部落格淬煉版） |
|---|---|---|
| 平均字數 | 475 字 | **948 字**（×2） |
| 字數區間 | 300-600 | 741-1190 |
| 技術細節 | 通用描述 | 含 repo 名 / 版本號 / 月費 |
| 工具家族 | 無交叉提及 | 含 `[/tool/X]` 互連 |

---

### `v3.6.57` (✨ 99 個工具卡片描述全升級 Markdown 排版)

**🎨 渲染樣式升級**
- `BulletinToolDetail.tsx` ReactMarkdown components 強化（已在 v3.6.56 上線）：
  - 新增 h1/h2/h3 樣式（橘色虛線下緣 + 階層字級）
  - 升級 li bullets 為 ▸（橘色 accent）
  - 加 em（深藍強調）、code（黃底框）、blockquote（橘左邊條）、hr（虛線分隔）
  - 行距 line-height 從 1.75 → 1.8，padding 加大為 20px 24px
- `ToolDetail.tsx` (classic) tailwind prose 同步加 h1/h2/h3、code、li::before ▸
- `tokens.css` 加 `.bulletin-tool-desc` 在 768px / 480px 的 padding / font-size / h2 / h3 / li 縮放，手機端 14.5–15px 易讀

**✍️ 99 個工具 detailedDescription 全部升級**
- 統一範本：`## 🎯 核心特色 / ## 💡 設計理念 / ## 🎒 適合情境`
- 每個工具 4-7 個 bullets（emoji + **粗體名稱** + 全形 — + 描述）
- 派 5 個 subagent 平行重寫（每組 ~20 tools）
- 合併進 `server/data/tools.json` + `client/public/api/tools.json` 兩份
- 平均 475 字（範圍 300-600）
- 校名統一「石門國小」（無「新明」誤植）
- 額外加碼：#100 工具索引神器也跑同範本

---

### `v3.6.56` (🎬 BulletinMilestone100 加紀念短片 CTA)

**🐛 問題**
- v3.6.55 把紀念短片嵌進 blog + share/100.html，但主頁 Milestone Banner 點擊只連 `/tool/100`，沒任何明顯入口導到 share/100.html — 99% 主頁訪客根本看不到影片

**🎨 修法**
- `BulletinMilestone100.tsx` `CelebrationBanner`:
  - 外層 div display: flex column + gap 14px
  - 原 Tape 維持連 /tool/100（工具索引神器主推位置不動）
  - Tape 下方新增金邊膠囊「🎬 看 87 秒紀念短片 / 含旁白 + BGM」
  - 連到 /share/100.html target=_blank（新分頁開觀賞頁，不離開主頁）
  - hover/focus: 浮起 -2px + 陰影加深到 5×5 + 觸發撒花特效
  - 沿用 cork 風格：ink border + 3D offset shadow + 金色強調字
- 同 commit 連帶把 `BulletinToolDetail.tsx` 的 ReactMarkdown components 升級加 h2/h3/li/em/code/blockquote/hr 樣式（為 v3.6.57 全面升級鋪路）

---

### `v3.6.55` (🎬 100 紀念短片正式嵌進站內)

**🎬 影片發布到 GitHub Release**
- Tag：`v3.6.55-celebration100`
- 檔案：`celebration-100-final-v2.mp4`（9.4 MB / 87 秒 / 1920×1080 H.264 / AAC 317 kbps）
- 製作流程：Remotion + Microsoft Edge TTS YunJhe 男聲 -15% + Pixabay CC0 BGM
- BGM：「Inspirational Acoustic - Organic Harmony」by sonican
- 流程符合 `pixabay-audio-asset-pipeline` skill（Chrome MCP 抓 candidates → ffprobe 比較 duration/bitrate → fade in 1.5s / steady 0.16 / fade out 2.5s）

**📚 POST_100_MILESTONE 頂部加 video**
- 開頭加 `<div class="bp-video-embed">` 含 `<video controls preload="metadata" poster="...cover.png">`
- poster 用穩定檔名 `celebration100/cover.png`（不用 hash 命名以免每次 build 漂移）
- 影片 fallback `<a>` 連結到 GitHub Release tag 供下載
- 「🎬 87 秒紀念短片」說明字提示影片屬性

**📮 share/100.html 改成「紀念短片觀賞頁」**
- 移除原本「非 bot 自動 redirect 主頁」邏輯 — 使用者進來就能看影片
- 新 RWD 結構：`.stack` 720px 中央容器內 → 黑底 `.video-frame` + 黑底白字 `.video-caption` + 既有黃便利貼 `.celebrate-card`
- 手機 ≤720px：celebrate-card 縮 padding 28×22 + h1 26px + p 14px
- bot 仍可解析 og:image / og:title / og:description（OG meta 保留），LINE/FB 分享預覽不變

**🖼 client/public/celebration100/cover.png**
- 從線上 og-preview-celebration-100-a750dbf5.png 抓回（316 KB）
- commit 進 git tracked（不在 `og-preview-*.png` gitignore pattern 內）
- 用於 video poster + 未來其他紀念素材 reference

**🧠 記憶系統新增 feedback**
- [feedback-video-bgm-pipeline](C:/Users/smes/.claude/projects/H--Akai/memory/feedback_video_bgm_pipeline.md) — 凡是影片必加 BGM 走 pixabay-audio-asset-pipeline，不可交付「只有旁白沒 BGM」版本

---

### `v3.6.54` (BlogPost 返回按鈕黃便利貼 button 大改良)

**🎨 改了什麼**
- 之前「← 部落格 / 教室百寶箱」純文字 breadcrumb 太不顯眼 → 改成黃便利貼風按鈕
- 漸層黃底（#fff4b8 → #fde047）+ 2.5px ink 厚邊 + 3px 3D 陰影 + 黑色圓圈包箭頭 + 微旋轉 -0.8°
- hover/focus → 浮起轉正 + 陰影加深；:active → 按壓回彈
- label 改「回部落格」更口語化
- **桌機 (≥720px)**：min-height 44px tap target + 接顯示 path 段
- **手機 (≤720px)**：min-height 48px tap target、隱藏 path 段（只顯示「← 回部落格」）、陰影加厚 4px、箭頭圓圈放大 26px
- a11y：`prefers-reduced-motion: reduce` 全程停動畫、`:focus-visible` 同 hover 樣式、`white-space: nowrap` 避免分行
- 影響範圍：所有 `/blog/:slug` 頁面（100+ 篇手寫長文 + 迷你 blog）
- 沿用記憶 [[feedback-ui-design-language]]「cork + 便利貼 + 拍立得」設計語彙

---

### `v3.6.53` (🛟 Anonymous Auth health check Cloud Function)

**🐛 根因背景**
- 2026-05-24 使用者在 `/admin` console 看到 4 個 Firestore 寫入失敗：
  - `增加訪客計數失敗: FirebaseError: Missing or insufficient permissions`
  - `[trackPageVisit] Firestore device/desktop 寫入失敗`
  - `[trackPageVisit] Firestore referrer/direct 寫入失敗`
  - `[trackPageVisit] Firestore geo/桃園市 寫入失敗`
- 根因排查（rules 正確、線上 rules 同步、程式碼路徑正確）→ 最後鎖定 **Identity Toolkit config 的 `signIn.anonymous` 是空物件 `{}` → anonymous provider 被關**
- 修復：用 Identity Toolkit Admin API PATCH `signIn.anonymous.enabled = true`（與 v3.6.4 啟用方式相同）→ 訪客追蹤立即恢復
- 但這是**第二次漂移**（v3.6.4 啟用 → 2026-05-24 又被關），需要自動防漂移機制 → G13 health check 誕生

**🛟 #1 新增 verifyAnonAuthDaily 排程函式**
- `functions/src/verifyAnonAuth.ts` 全新檔（287 行）
- 排程：每天 02:00 (Asia/Taipei)（dailySnapshot 03:00 之前跑，分流）
- 機制：
  1. admin SDK 取 OAuth2 access token
  2. GET `https://identitytoolkit.googleapis.com/admin/v2/projects/{pid}/config`
  3. 讀 `signIn.anonymous.enabled` 狀態
  4. 若為 `false` → PATCH 設回 `true` + 再驗證一次確認修復
  5. 修復成功 → 推 LINE Flex card「🛟 Anonymous Auth 已自動修復」（綠色 header + Console 直連按鈕）
  6. API 失敗 → 推 LINE Flex card「⚠️ 健康檢查失敗」（紅色 header + 200 字 stacktrace + 立即到 Console 檢查 CTA）
  7. 正常狀態（`enabled === true && !wasFixed`）→ 安靜不打擾
- 健康日誌寫入 `analytics/anonAuthHealth/checks/{YYYY-MM-DD}`：lastCheckedAt / lastEnabled / lastWasFixed / lastError / checkCount / fixCount
- region asia-east1 / memory 256MiB / timeoutSeconds 60

**🚨 #2 新增 verifyAnonAuthNow onCall 函式**
- admin custom claim 才可呼叫（其他人 throw `permission-denied`）
- 後台「立即檢查 Anonymous Auth」按鈕（未來 UI）可呼叫，當下立即驗證狀態
- 同樣寫健康日誌 + 修復時推 LINE
- 正常時不推 LINE（避免手動觸發噪音），由前端 UI 自己顯示結果

**🧹 #3 順手抽 `pushFlexToAdmin` 到共用 helper**
- 新檔 `functions/src/lib/lineNotify.ts`
- 既有 `index.ts` 內的 `onWishCreated` / `onReviewCreated` 改 import helper
- `verifyAnonAuth.ts` 也使用同一份
- 避免循環依賴 + 三處 LINE 推送統一 error handling

**📋 部署狀態**
- `firebase deploy --only functions:verifyAnonAuthDaily,functions:verifyAnonAuthNow` 成功
- Cloud Functions 上線在 asia-east1
- 第一次跑會發現 enabled=true（剛才手動修好的）→ 安靜不推 LINE
- 真正觸發要等下一次漂移（希望不會發生）

**💡 給未來的自己**
- 這條 health check 是「Anonymous Auth 第二次漂移」逼出來的
- 如果半年內看到 LINE 推「🛟 Anonymous Auth 已自動修復」→ 就是漂移又發生了，但這次系統自己修了
- 如果看到「⚠️ 健康檢查失敗」→ 表示 admin SDK 拿 token 或 Identity Toolkit API 出問題，得人工到 Console 看 anonymous 狀態 + 看 Cloud Functions logs

---

### `v3.6.52` (🎉 100 工具達成紀念三件套 + working tree 大清理)

**🎨 #1 紀念 OG 圖 generate-100-celebration-og.mjs**
- 新腳本：1200×630 cork 風背景 + 上方金色緞帶「★ 100 工具達成！★」（左右 5 角星裝飾，純 Canvas 自畫不靠 emoji 字型）
- 中央巨大金色「100」字（金箔漸層 + ink stroke + 高光線 + 外圈金色光暈）
- 4 張拍立得圍繞中央 100：左上 #100 索引神器、右上 #81 駕駛艙、左下 #46 場地預約、右下 #3 即時投票
- 撒花裝飾：deterministic seed 撒 36 片彩帶 + 圓圈，避開中央主視覺區與木條
- 達成日期讀 `site-stats.milestones.tool100`（顯示 2026.05.24）
- 底部 attribution bar：金邊頭像 + 金色 CTA「下一個 100 從你的許願開始 →」
- 寫入 `site-stats.json` 的 `ogImageCelebration` 欄位
- npm alias：`npm run gen:100-og`
- 接入 build pipeline（在 `generate-home-og-heatmap` 之後 / `sync-meta-from-stats` 之前）

**📮 #2 share/100.html landing page**
- `generate-og-pages.mjs` 加 `generateCelebration100PageHtml()`
- 仿 `share/heatmap.html` pattern：社群爬蟲拿 `ogImageCelebrationAbsolute` 金色拼貼，一般 user JS redirect 回主頁讓 BulletinMilestone100 撒花特效接手
- landing UI：金色漸層卡片 + ink badge「★ MILESTONE 100 ★」+ 達成日 tag + 黑底金字 CTA
- 用途：紀念分享圖 LINE / FB 廣播、blog 紀念長文 CTA、後續廣播素材

**📚 #3 紀念長文 POST_100_MILESTONE（8 分鐘 / ~2200 字）**
- slug: `milestone-100-tools-achieved`
- coverEmoji 🎉 / coverColor orange
- toolIds: `[100, 81, 46, 3]`
- **置頂 POSTS 陣列首位** → BlogList magazine 版自動把它當 heroPost
- 章節結構：
  - 兩年走到 100（含 callout--tip「為什麼是 100」）
  - 100 個工具背後的數字（4 卡 stat-grid：100 篇手寫長文 / 5 大平台 / 7 大分類 / G1-G6 全年級）
  - 7 大分類分佈表（含每分類 2-3 個代表作連結）
  - 5 個改變一切的里程碑（#1 第一個工具 → #3 第一個爆紅 → #46 校園真正用上 → #81 自己用最多 → #100 智能門口）
  - callout--info「技術選擇 3 個關鍵決策」（100 獨立 repo / 繁中優先 / 拍立得 cork 風）
  - 兩年踩坑學到的 5 件事
  - blockquote「給未來自己 · 一封信」
  - 給其他想開始的老師三句話
  - CTA 連到 share/100.html + 工具索引 + 許願池

**🧹 #4 working tree 大清理（G1 + G4）**
- 刪除 13 個 scratch / 診斷 / 抓站源碼 / debug 截圖：
  - `_diag.py / _diag_log.txt / _diagrun.bat / _test_write`（Claude session 路徑診斷）
  - `_zhpdf_build.py / _zhpdf_log.txt / _zhrun.bat / _zhrun_log.txt`（reportlab 中文 PDF 測試）
  - `.tmp_tool26.html / .tmp_tool26_decoded.html`（抓 #26 Google Sites 源碼）
  - `page25_source.html / page25_tmp.html`（抓 #25 源碼）
  - `gh-pages-wish-debug.png`（許願池 debug 截圖）
- `design_handoff_blog_article_tmp/` + `design_handoff_blog_magazine_layout_tmp/` 兩個設計交接解壓暫存 → 集中歸檔到 `handoff/legacy/`
- `git rm --cached`：`functions/lib/*` (6 個 build 產物) + `logs/system.log`（已在 `.gitignore` 但歷史 tracked）
- `.gitignore` 大幅補強：
  - `functions/lib/`（tsc outDir，build 產物）
  - `handoff/` + `design_handoff_*tmp/`（設計素材本機保留不入版控）
  - `_diag*` / `_zh*` / `_test_write` / `.tmp_*` / `page25_*` / `*-debug.png` / `*-debug.webp`（暫存 pattern）
  - `client/public/og-preview-*.png` / `.webp`（OG 圖 build 產物，CI 會重生）
  - `.claude/`（Claude Code worktrees 本機暫存）
- 結果：`git status` 從 15+ untracked + 7+ stale tracked → 5 個合理修改 + 7 個 cached-remove

---

### `v3.6.51` (ToolFlowAnalysis needs-index 友善錯誤訊息)

**🩺 Cloud Function 端錯誤分類**
- `getToolFlowAnalysis` catch Firestore code 9 (`FAILED_PRECONDITION`) → throw `HttpsError('failed-precondition')` + 中文「索引建置中，1-5 分鐘」
- 其他未預期 error → `HttpsError('internal')` + 截 200 字 stacktrace
- 前端 ToolFlowAnalysisPanel error 區塊：
  - 偵測 `/index|failed-precondition|建置中/` → 顯示「到 Console 看建置狀態」+ 直連 URL
  - 偵測 `/INTERNAL/` → 提示去看 `functions:log` 看 stacktrace
- 效益：未來索引變動或 race condition 不會再吐 raw "code 9" 給管理員看

### `v3.6.50` (Firestore indexes 入版控 + DateRange 欄位修正)

**🗂️ firestore.indexes.json**
- 之前 `/admin SnapshotPanel` 與 ToolFlowAnalysis 都會冒「The query requires an index」
- 建 `firestore.indexes.json` 收 2 個 index：
  - `analyticsSnapshots`：`__name__ DESC` (single field)
  - `toolClickEvents`：`(toolId ASC, dateKey ASC)` composite
- 接進 `firebase.json` 讓 `firebase deploy` 帶上 → 索引變動可走 PR review
- 已 deploy 到 `akai-e693f`（1-5 分鐘建置完成）

**🐛 ToolFlowAnalysisPanel DateRange 欄位名修正**
- 按「分析」報 `Cannot read properties of undefined (reading 'getFullYear')`
- 根因：`DateRange` 型別是 `{ from, to }`，誤寫 `dateRange.start / .end` → `undefined.getFullYear()` throw
- 修法：`start → from`、`end → to`

### `v3.6.49` (工具點擊細粒度事件記錄 + 後台流量解析面板)

**【後端 Cloud Functions】**
- `incrementToolClick` 升級：region `asia-east1`（對齊 embedQuery）+ 寫雙路徑：
  - `toolUsageStats/{toolId}` — 累計快取（既有）
  - `toolClickEvents/{auto-id}` — 細粒度事件（新增）
- 事件欄位：`toolId / dateKey / hour(Asia/Taipei) / referrer / referrerHost / device(mobile/tablet/desktop) / country(cf-ipcountry/fastly/gae) / sessionId / timestamp`
- `classifyReferrer` 把 host 正規化為 11 種來源類別：`line / facebook / google / youtube / instagram / threads / twitter / bing / yahoo / school / notion / padlet / internal / direct / other`
- 新增 `getToolFlowAnalysis(toolId, fromDate, toDate)` — admin only：
  - 回傳 `totalEvents / uniqueSessions / hourDist / referrerDist / deviceDist / countryDist`

**【client 端】**
- `trackToolUsage` 改走 callable 主管道（帶 sessionId / referrer / device）
- sessionId `crypto.randomUUID` + localStorage 30 天滾動
- device 從 `navigator.userAgent` 偵測
- Firebase 不可用或 callable 失敗 → fallback direct write → fallback localStorage（三層）

**【Firestore Rules】**
- `toolClickEvents`：read = admin only，write = false（僅 admin SDK 寫）
- `dailySnapshot` 加 `pruneOldClickEvents` 90 天 TTL 裁切（400/batch 分頁）

**【後台 UI】ToolFlowAnalysisPanel**
- AnalyticsDashboard 工具 tab 加 `ToolFlowAnalysisPanel`
- 工具下拉（預設 #14 早安長輩圖）+ DateRangePicker + 分析按鈕
- 3 KPI 卡：總事件 / 去重 session / 人均點擊
- 24h 時段 BarChart + referrer / device / country 三個 PieChart

### `v3.6.48` (PWA chunk 404 全域 self-heal)

**🛟 問題現場**
- deploy 換新 chunk hash 後，舊 SW 給出舊 `index.html` 引用舊 chunk
- 舊 chunk 已被新 build 蓋掉 → 404 → React Suspense 永遠卡 spinner
- 使用者要自己進 DevTools 清 site data 才能救回來

**修法（main.tsx 最上面加全域攔截）**
- `unhandledrejection` 攔 dynamic import 失敗（6 種 pattern：`ChunkLoadError` / `Failed to fetch dynamically imported module` / `Loading chunk N failed` 等）
- `window.error` capture phase 攔 `<script>` / `<link>` 404 含 `/assets/*.js|.css`
- 觸發後：unregister 所有 SW + 清所有 caches + hard reload（加 `?_heal=ts`）
- `sessionStorage` flag 防無限 loop（1 shot / session）
- 只攔本站 `/assets/` 路徑 + 6 種 chunk error message pattern，避免誤殺第三方 script / 圖片 / Sentry 等錯誤
- 比 v3.6.35 BlogList-only 自癒更廣，所有 lazy route 都覆蓋

### `v3.6.47` (#100 索引：長中文 query 加 n-gram 切片)

**🔧 問題**
- 輸入「想做閱讀理解練習」（7 字無分隔符）找不到 #4 / #12 / #87 閱讀理解工具
- 根因：fuse.js 對 7 字長 query 模糊比對過嚴（threshold 0.42 跨不過去）

**fuzzyResults 三層中文友善策略**
1. separator tokens（保留 v3.6.45 行為）— `/ 空白 、 , ; |` 切
2. **n-gram sliding 切片** — 純中文 token 長度 ≥ 4 才切，size 3-4 雙視窗
   - 「想做閱讀理解練習」會切出「閱讀理解」「閱讀理」「讀理解」等 11 個子串
   - 「閱讀理解」exact match #4 #12 #87 title
3. 整句也丟一次（保留命中 detailedDescription 段落能力）
- n-gram min size 3 避免「想做」「練習」這種 2-char 噪聲

### `v3.6.46` (🎉 100 工具達成 banner 撒花歡呼特效)

**🎊 ConfettiBurst 純 CSS 撒花**
- 純 CSS keyframes 撒 28 片彩帶 + 圓圈，8 色隨機 / 隨機 drift / 隨機 delay / 5.8s 後 unmount，**零 dep**
- 左右各加 🎊 🥳 歡呼 emoji，1.4s ease-in-out 跳動動畫
- 觸發時機：banner mount 進場撒一次 + hover/focus banner 再撒
- `prefers-reduced-motion: reduce` → 自動禁用動畫（a11y）
- z-index 9999 + `pointer-events: none` 不擋使用者操作
- BulletinMilestone100 改寫 +254 行 / -64 行

### `v3.6.45` (#100 工具索引神器：query 多 token 切割修法)

**🔧 問題**
- 使用者輸入「學生票選 / 投票」明明有相關工具（#96 自治市投票、#93 自治市市長計票）卻顯示「沒找到匹配」
- 根因：fuse.js 把整串「學生票選 / 投票」當單一 token 比對，9 字長對中文模糊搜尋過嚴

**修法**
- `fuzzyResults` 改成先用 `/ 空白 、 , ; |` 把 query tokenize
- 對每個 token 各搜，依 toolId 取 best score 合併排序取 top 5
- 也保留整句搜一次（保留長 query 命中 `detailedDescription` 段落能力）

### `v3.6.44` (工具詳情頁卡片說明改用 ReactMarkdown 渲染)

**🎨 問題**
- `tools.json` 的 `detailedDescription` 內含 `**bold**` / `•` 列點 / 換行
- 之前直接純文字塞 `<div>` 或 `<p>`，使用者看到的是 raw markdown（如「**純黑白線稿風格**」整段擠在一起，星號沒渲染）

**修法**
- 工具詳情頁的卡片說明區塊改用 `ReactMarkdown` 渲染
- 與 BlogPost 共用同一套 markdown 設定（remark-gfm + 既有 styling）

### `v3.6.43` (✨ 新增工具 #99：考試卷生圖 Studio — AI 黑白線稿插圖生成)

**【新工具卡片】**
- ID 99 · 分類 `teaching` · icon `Palette`
- URL https://cagoooo.github.io/picture-master/
- 卡片描述：四欄位（T 標題 / D 對話 / C 角色 / S 場景）20 秒生兩張 1024×1024 黑白線稿 PNG，列印不吃墨水、可當著色頁、OpenAI gpt-image-2 中文精準渲染
- 12 個精準 tags（試卷插圖、學習單插畫、AI 線稿、列印省墨…）
- `previews/tool_99.webp`（Playwright 截圖）
- `previews/og/tool_99.webp`（generate-unified-og.mjs 自動產出）

**【手寫長文】POST_99（5 分鐘 / ~1500 字）**
- 痛點開場：出題卡在配圖，圖庫收費 / 校園印表機糊 / Google 圖片有版權
- 為何選純黑白線稿（3 理由：印表機友善 / 兼著色頁 / 學生能改造）
- 真實 5 種教學情境（英對、社會、自然、數學、注音）
- 跟 #87 PIRLS PRO + #58 教案小幫手串成「出題→配圖→印單」工作流
- 配對工具：`[99, 87, 58]`
- 老師回饋 3 段（英語、低年級導師、美術老師）

**【部署】**
- sw bump、sitemap / feed 自動更新
- 迷你 blog landing：0 篇（無漏寫）

### `v3.6.42` (首頁部署生態系自動同步 sync-deployment-ecosystem.mjs)

**🔧 問題**
- 阿凱貼截圖回報「全部 98 件公開工具」沒跟著 tools.json 更新
- 根因：`BulletinDeploymentEcosystem.tsx` 內 5 平台 count + 「看全部 N 篇手寫教學心得」全是 hardcode，從 v3.6.34 至 v3.6.41 沒人手動同步

**修法：scripts/sync-deployment-ecosystem.mjs**
- 讀 `client/public/api/tools.json` 套用 `getToolPlatform` 規則算各平台 count
- 讀 `client/src/blog/posts.ts` grep `^const POST_` 數量得手寫長文總數
- 用 regex 寫進 `BulletinDeploymentEcosystem.tsx` 對應行
- 支援 `--dry` 模式：只報告差異不寫檔
- 整合進 build pipeline（`sync-popular-queries` 之後 / `generate-favicon` 之前）
- 校正當下：GitHub Pages 58 → 59、手寫長文 57 → 99 篇、5 平台合計 99 件公開工具
- 元件頂端加註解警示：count 由 sync 腳本自動同步，**不要手改 hardcode**

**【相關 skill 更新】**
- `~/.claude/skills/akai-new-tool-full-pipeline/SKILL.md`
- 新增工具 = 卡片 + 手寫長文 + **首頁部署生態系區塊**三邊都要對齊

### `v3.6.41` (#98 教室小幫手 手寫長文 POST_98)

**📚 POST_98 — 26 工具六大組 + 隱私設計 + 早晨 SOP**
- 為 v3.6.40 剛新增的 #98 教室小幫手補手寫長文
- 涵蓋六大組 26 個小工具總覽 + 隱私設計（純前端、無上傳、PWA 離線）+ 早晨 SOP（情緒打卡 → 隨機抽號 → 計時器）
- 連動 v3.6.38 SKIP_IDS auto-derive：
  - 迷你 blog OG landing 從 1 篇 → 0 篇（#98 自動從 mini 升級為手寫長文）
  - `generate-og-pages.mjs` 自動產 `/blog/classroom-kit-98-daily-teacher-toolkit/index.html`
  - 不需手改任何黑名單
- 工具卡片左下「📖 教學情境」按鈕現在連到內頁 `/blog/classroom-kit-98-daily-teacher-toolkit`

### `v3.6.40` (✨ 新增工具 #98：教室小幫手)

**【新工具卡片】**
- ID 98（最小未使用 slot，#99 留空、#100 已是「工具索引神器」）
- URL https://cagoooo.github.io/coolclass/
- 分類 `utilities` · icon `Sparkles`
- 標籤：教室百寶箱 / 情緒打卡 / 隨機抽號 / 教室計時器 / 隨機分組 / 座位表 / AI 評語草擬 / 導師工具 / 班級經營 / PWA 離線 / 免登入 / 26 工具
- description 90 字 / detailedDescription 約 480 字（含六大組分類清單）

**【產出檔案】**
- `client/public/previews/tool_98.webp` — 1024×1024 卡片預覽（Playwright headless screenshot）
- `client/public/previews/og/tool_98.webp` — 1200×630 OG 社群分享
- `scripts/add-tool-98.mjs` — 一次性 batch script（截圖 + 寫 tools.json + spawn OG）

**【截圖踩雷修正】**
- 首次截圖被 `.akai-ob-bg` 「歡迎使用」onboarding 彈窗整版蓋住
- 追到 `onboarding.js` 的 KEY = `akai_onboarded_v1`，加進 init-script localStorage dismiss 清單 + DOM 移除 selector 後重截即正常
- 順帶把 description 從原本「8 個小工具」更正為實際的「26 個」六大組

### `v3.6.39` (BlogList 雜誌特刊版 Direction 01)

**🎨 BlogList.tsx +187 行**
- `showMagazine` 條件：`!query && !selectedCat && filteredPosts.length>=3`（特意不檢查 platform → 平台篩選時 magazine 仍顯示，hero swap）
- `heroPost / featuredPosts(2) / gridPosts` 三段切分
- `trendingPosts` useMemo：前 30 篇 × 估算 views → 倒序取 3
- `heroPfKey + heroTapeText`：平台篩選時 hero 內容換成「★ {PLATFORM} · 平台代表作」
- 新增 JSX 區塊：`bp-featured-row → bp-trending-section → bp-section-divider → bp-list-grid`
- 原 `filteredPosts.map → gridPosts.map`（map 內 JSX 不變）

**🎨 blog-article.css +571 行（檔尾追加，不動既有 .bp-list-card）**
- `.bp-list-grid` `minmax(280px) → minmax(260px)`（寬螢幕多塞一欄）
- `.bp-hero-card`：深 ink 背景 + 飄帶 + 紅圖釘 + 兩團 radial glow + 米黃虛線 inset 框
  - data-pf 5 平台 swap：`github/gsites/xoops/firebase/thirdparty`
  - `heroGlow` 8s 循環（hover 觸發）+ read-cta arrow translateX
- `.bp-feat-card` warm/cool 漸層 + 副焦點 platform badge
- `.bp-trending-section`：火焰 `flameWiggle` 2.4s 擺動 + rank-1/2/3 金/銀/銅大字 + 黃色貼紙標籤
- `.bp-section-divider`：黃色貼紙標籤 + 兩側虛線（rotate -1deg）
- RWD：≤980px 疊單欄、≤560px hero title 21px + excerpt clamp 3
- `prefers-reduced-motion`：關掉所有 hover transform + glow + flame 動畫

### `v3.6.38` (SKIP_IDS 自動 derive · 消除 3 處硬編同步痛點)

**🔧 修根：SKIP_IDS 從 POSTS 自動 derive**
- **問題**：手寫長文需在三處同步：`miniPosts.ts` line 22 / `generate-og-pages.mjs` line 673 / `generate-sitemap.mjs` line 91，三邊各有一份 99 個 ID 的硬編黑名單。任何一處忘記同步，新加手寫長文時就會跟 mini blog 重複出現
- **修法**：
  - `posts.ts` 在 `export const POSTS` 後新增 `export const HANDWRITTEN_TOOL_IDS: ReadonlySet<number> = new Set(POSTS.flatMap(p => p.toolIds))`
  - `miniPosts.ts` 改 `import { HANDWRITTEN_TOOL_IDS } from './posts'`，刪除硬編列表
  - `generate-og-pages.mjs` reuse 既有 `extractBlogPosts()` 函式，從回傳的 posts.toolIds 建 Set
  - `generate-sitemap.mjs` 在原本 regex 抽 slug / publishedAt 的迴圈內順便抽 toolIds 進 SKIP_IDS
- **驗證**：build 後 sitemap 印「手寫長文：98 篇 / 涵蓋 98 個工具，迷你 blog 0 篇」— 跟改之前完全一樣
- **效益**：未來新增 #101 手寫長文進 POSTS（指定 toolIds: [101]）→ runtime + build-time 全自動同步，不再需要記得改 3 個檔

### `v3.6.37` (部落格 Wave 1-4 四波 quick wins)

**🎨 Wave 1 — 內頁 quick wins 五合一**

*A1. 範本擴散到 3 篇高人氣長文*
- POST_81 教學駕駛艙：補 `.callout--tip`（視覺主題梗設計理由）+ 4 卡 `.stat-grid`（覆蓋年級 / 記網址數 / 切換工具 / 開發週數）
- POST_46 場地預約系統：補 `.callout--warn`（無審核反而比有審核穩的設計觀點）+ 4 卡 `.stat-grid`（預約時間 / 衝突 / 預約量 / 校外借用）
- POST_INDEX_AI 工具索引神器：補 `.callout--info`（字面 vs 語意關鍵概念）+ 4 卡 `.stat-grid`（一次性費用 / 暖啟動 / Free tier / 抽象命中率）
- 累計 4 篇有範本（含 POST_53）

*A2. Code 語法高亮*
- 新增 `BlogCodeBlock.tsx`：react-syntax-highlighter PrismLight + 註冊 14 種常用語言（ts/tsx/js/jsx/json/bash/css/html/python/markdown/yaml/sql 等）
- vscDarkPlus 主題、customStyle 對齊 .bp-article pre 圓角/陰影/JetBrains Mono
- 6 行以上自動顯示行號

*A3. 章節 # 錨點 icon*
- HeadingAnchor 元件：H2/H3 hover/focus-visible 才顯示 #
- 點擊複製完整 anchor URL 到剪貼簿 + history.replaceState
- 觸控裝置永遠顯示 opacity .55（無 hover 狀態）

*E1. a11y review*
- TOC 兩種裝置都加 `aria-current="true"` 標記 active 章節
- BlogArticleLayout main / aside 加 `aria-label`
- 全域 focus-visible 統一 accent 色 outline + 2px offset

*E2. BlogPosting Schema.org JSON-LD*
- 新增 `BlogPostingSchema.tsx`：用 react-helmet-async 注入結構化資料
- headline / description / datePublished / inLanguage / wordCount / timeRequired / keywords / author（阿凱老師 + 石門國小 affiliation）/ publisher
- Google rich snippet 友善

**🎨 Wave 2 — BlogList 列表頁 magazine 風**
- sticky-note 便利貼牆改成編輯型卡片：白底 + 1.5px rule border + radius 12 + hover 浮起加陰影
- kicker mono caps + 橘色短線、emoji 小圖示內聯標題、excerpt 3 行 clamp、tag chips（2-4）、meta 列 mono 11px
- platform 徽章移到右上 pill 不再傾斜（與 magazine 風格一致）
- 手機 ≤720px：min-height 自動、title 16px、excerpt 2 行 clamp
- 清掉 BlogList 未用的 COLOR_MAP / PIN_MAP / Pin import

**📊 Wave 3 — 觀測上報**
- D1 閱讀完成率：文末 IntersectionObserver sentinel 進入 50% 視窗 → 上報 `blog_read_complete`（每篇只一次）。可算「完讀率 = blog_read_complete / blog_read」當內容質量指標
- D2 TOC 點擊熱圖：桌機 + 手機 TOC 點任一章節 → 上報 `blog_toc_click({ slug, section_id, section_label, source })`。後續可 aggregate 看哪些章節最受關注

**✏️ Wave 4 — 寫作工具加速**
- C1 admin 範本複製按鈕：BlogPost 右下浮卡（fixed bottom-left，非 admin 不顯示），點擊複製含 callout / stat-grid / code block / blockquote / table 全部標籤的 markdown 骨架
- C2 草稿即時預覽頁 `/draft`：admin only，左 textarea 貼 markdown 即時右側預覽（同樣 ReactMarkdown 設定 + bp-article CSS）。localStorage 暫存最多 5 篇草稿，800ms debounce 自動存。非 admin 自動導首頁

依賴：+ `react-syntax-highlighter ^16.1.1` + `@types/react-syntax-highlighter ^15.5.13`

### `v3.6.36` (部落格文章內頁 magazine 三欄重構 + 右下角彈窗互斥)

**🎨 #1 部落格文章內頁三欄式重構（Phase A · 骨架 + 視覺）**
- 三欄 magazine layout：左欄 200px sticky + 文章 680px + 右欄 230px sticky TOC、max 1200px、≤1080px 自動折成單欄
- **左欄 sticky 區塊**（≥1080px）：
  - 拍立得作者卡（白紙 + rotate(-2.2°) + 黃和紙膠帶 + hover 自動擺正）
  - 索引卡資訊（細格線紙背景 + 左側打洞 + 橘色虛線「本篇 · INFO」標籤 + 點線連接 key↔value：發布 / 閱讀 / 分類 / 收錄）
  - 閱讀進度條（厚 ink border + 斜紋進度 + 兩端刻度 + 同步頂部進度條）
  - 紙標籤分享按鈕（黃 / 粉 / 藍三色 + 左側打洞 + 不同傾角 + hover 歸正 + 複製連結 / LINE 分享 / 列印 PDF 三按鈕）
- **中央 Hero 編輯型**：橘色短線 + mono caps kicker、Noto Sans TC 900 大標、上下細線 meta row、右上 emoji sticker 88×88 rotate(6°) + 紅圖釘
- **右欄 sticky TOC**（≥1080px）：washi tape header rotate(-2°)、筆記本紙背景 + 紅 margin line、mono `01 02 03...` 編號、active 章節橘色螢光筆塗抹、底部回到頂端膠囊、IntersectionObserver scrollspy
- **手機 ≤1080px**：左欄 + 右側 TOC 隱藏、文章頂部行動版手風琴 TOC、hero emoji 內聯 60×60、文末紙標籤水平分享列
- **新增 hooks**：`useReadingProgress` / `useActiveSection` / `useExtractedSections`（**從 markdown body regex 掃 H2 + slugify 自動產生 sections，零 schema 變動**，舊文章自動有目錄）
- **新增 stylesheet**：`client/src/styles/blog-article.css` ~880 行，scoped 在 `.bp-*` class
- **擴充 tokens**：補 paper-warm / ink-mute / ink-faint / rule / rule-soft / note-yellow-soft / font-serif / font-mono / measure（**「擴充 not replace」策略**，避免動到既有 100+ 處引用的 `--paper`）
- **載入字型**：Noto Serif TC + JetBrains Mono 合併進既有 Google Fonts URL
- **新增元件家族**（9 個）：BlogArticleLayout / BlogHero / BlogLeftRail / BlogToc / BlogMobileToc / BlogRelatedTools / BlogPrevNext / BlogCta / BlogMobileShare

**📝 #2 內文渲染精修（Phase B）**
- 啟用 `rehype-raw`：讓 `posts.ts` body 可直接內嵌 `<div class="callout">` / `<div class="stat-grid">` HTML
- ReactMarkdown a renderer 三路分流：內部 `/` → wouter Link、`#anchor` → smooth scroll + 24px offset、外部 → `_blank + noopener`
- **POST_53「校園報修系統」retrofit** 作為範本：「真相」段塞 `.callout--warn`、功能 C 雙軌通知補 `.callout--tip`、實測數字段補 4 卡 `.stat-grid` + 原表保留

**🔧 #3 右下角 Tour / PWA 提示重疊修復**
- 之前現象：黃色新手導覽 + 藍色 PWA 安裝同時冒右下角視覺重疊
- 修法：TourGuide 在 startTour / dismissTour 兩處 dispatch `tour-resolved` window event；PWAUpdatePrompt 監聽 + 初始 localStorage 檢查才顯示
- 體驗：第一次造訪先看 Tour → 按完才接力顯示 PWA；24h 內已關 Tour 直接顯示 PWA

**📂 #4 設計交接落地**
- Phase A + Phase B 完整對應 `design_handoff_blog_article/` 設計交接包（README 13 章 + SCREENSHOTS 6 圖 + index.html 互動原型）
- 沿用既有 BulletinHeader / BulletinFooter / BulletinBackToTop / PageHead / Pin / Tape primitives
- 保留 ReactMarkdown + remark-gfm 渲染管線（不改成寫死 JSX）
- **未動**：BlogPost schema、POSTS 與 miniPosts 資料、BlogList.tsx（out of scope）

---

## 📋 BlogPost 重構後 — 未來優化建議 Roadmap

> 依本次 v3.6.36 完成的視覺與架構基礎，列出可接著開發的方向。每項標 **P0 / P1 / P2 優先級** + **Effort（S/M/L）** + **預期效益**，挑著做即可。  
> P0 = 影響最大或 quick win，建議近期；P1 = 中期可做；P2 = 大型或實驗性。

### A. 內文體驗深度（接續本次重構，效益最直接）

| 項目 | 優先級 | Effort | 說明 |
|---|---|---|---|
| **A1. 範本擴散到 5-10 篇精選長文** | **P0** | M | POST_53 已是範本；可挑 #81 / #46 / #84 / #100 / #7 等熱門長文加 callout / stat-grid。每篇 15-30 分鐘人工抓重點，效益是整套文章質感升一檔 |
| **A2. Code block 語法高亮（shiki / prism）** | **P0** | S | 目前 `<pre>` 純黑底白字，加 shiki 就有 VSCode 級顯色。bundle +30-50 KB 換來技術內容可讀性大躍進。語法名稱寫在 ``` 後面（如 ```ts）即可 |
| **A3. 章節「複製連結」icon** | **P0** | S | 滑鼠移過 H2 顯示 `#` icon，點擊複製 `#anchor` URL 到剪貼簿 + toast「已複製章節連結」。技術文 / SOP 類文章超實用 |
| **A4. 內文圖片支援 + lightbox** | **P1** | M | 目前 markdown 不貼圖；加 `![alt](url)` 支援 + lazy load + 點圖放大覆蓋層 + caption。注意 LCP 第一張圖要 `fetchpriority="high"` |
| **A5. Drop cap 首段大寫首字 toggle** | **P1** | S | CSS 已寫好 `.dropcap`，加全站 toggle 或預設給長文用（≥1000 字才套）。視覺辨識度高 |
| **A6. 「估剩餘時間」浮動標籤** | **P2** | S | 根據捲動位置 + 字數估「還剩 ~2 分鐘」顯示在左欄進度條下方 |
| **A7. 文末「下載 PDF」按鈕** | **P2** | S | 用 `window.print()` + `@media print` CSS，按 skill `pdf-export-print-best-practice` 做（已有方法論） |
| **A8. Print stylesheet 細節** | **P2** | S | 列印時隱藏左欄 / 右欄 TOC / hero emoji / Tour 提示，文章單欄黑白排版 |

### B. BlogList 列表頁優化（之前 out of scope，邏輯上接續）

| 項目 | 優先級 | Effort | 說明 |
|---|---|---|---|
| **B1. 列表頁也走 magazine 風** | **P0** | M | 套用同樣的編輯型卡片：kicker / 大標 / excerpt / reading time / tags chip。跟內頁視覺一致 |
| **B2. 時間軸視圖切換** | **P1** | M | 「卡片網格 / 時間軸 / 表格」三視圖切換。時間軸特別適合教學進度回顧（哪個月開了哪個系列） |
| **B3. 「最近 7 天熱讀」徽章** | **P1** | M | top 3 文章貼便利貼徽章。需先有讀數紀錄（Firestore `blog_read` 事件已在收，可加 aggregator） |
| **B4. 篩選後 URL 共享** | **P1** | S | 篩選狀態同步進 URL query，方便老師之間互相轉貼「某分類的文章清單」 |
| **B5. 作者主題頁 /author/akai** | **P2** | M | 列出所有作品 + 主題分布 + 寫作頻率時間軸 |

### C. 內容生產線（給寫作流程加速）

| 項目 | 優先級 | Effort | 說明 |
|---|---|---|---|
| **C1. 「複製 markdown body 範本」按鈕（admin only）** | **P0** | S | admin 登入下看到 BlogPost 頁右下出現「Copy template」按鈕，複製含 callout / stat-grid 標籤的範本骨架，省去翻 POST_53 source 對照 |
| **C2. 草稿即時預覽頁 /draft** | **P1** | M | 開發中文章貼 markdown 進 textarea 即時看渲染效果（用 localStorage 暫存），不用每改一段就 npm run dev |
| **C3. AI assist 找適合塞 callout 段落** | **P2** | L | 寫好文章後送 LLM 分析，產出「這 3 段適合塞 .callout--tip」「這段數字適合做 stat-grid」建議；人工確認 |
| **C4. 同時匯出 Medium / Substack 格式** | **P2** | M | 把 markdown body 一鍵轉純 markdown（去掉 callout HTML、保留 GFM），同步發到外部 |

### D. 觀測與分析（量化讀者行為）

| 項目 | 優先級 | Effort | 說明 |
|---|---|---|---|
| **D1. 閱讀完成率** | **P1** | S | 用 IntersectionObserver 看誰捲到 95%（區分掃過 vs 認真讀），上報 GA + Firestore。能驗證內容黏著度 |
| **D2. TOC 點擊熱圖** | **P1** | M | 哪些章節最多人跳轉到 → 顯示讀者真正關心什麼。可指導未來文章結構 |
| **D3. 熱點章節 / 離開區段** | **P1** | M | 根據停留時間找出哪些 H2 段落最多人停 / 最容易讓人關 tab，回頭優化內容 |
| **D4. A/B 測試 hero variant** | **P2** | M | editorial vs sticky 哪個轉換率高（按進文章 vs 滑離）。需要 cohort 分流邏輯 |

### E. 無障礙 / 效能 / SEO

| 項目 | 優先級 | Effort | 說明 |
|---|---|---|---|
| **E1. a11y review pass** | **P0** | S | focus-visible 樣式統一、TOC keyboard nav（Tab + Enter）、aria-current 章節 active 標記、aria-labels 補齊 |
| **E2. Article schema.org JSON-LD** | **P0** | S | 每篇文章加 `BlogPosting` schema（title / datePublished / author / image / wordCount）。Google 結果頁能顯示 rich snippet |
| **E3. Semantic H2 wrap in `<section>`** | **P1** | S | README §5 提到但 Phase A 沒做。每個 H2 包成 `<section id>` 強化語意，screen reader 友善 |
| **E4. 預載 hero emoji 字型 subset** | **P2** | S | 把首屏會用到的 emoji 範圍做字型 subset 預載，避免 emoji 渲染偏移造成 CLS |
| **E5. RSS feed 內文升級** | **P2** | S | 目前 feed.xml 只有 excerpt；補上完整 body 後給 reader app 完整閱讀 |

### F. 視覺一致性與互動細節

| 項目 | 優先級 | Effort | 說明 |
|---|---|---|---|
| **F1. Dark mode 適配 blog-article.css** | **P1** | M | 目前 `.bp-*` class 沒對 dark mode；其他頁有 `.high-contrast`，未來統一補上 |
| **F2. Stat card 數字 count-up 動畫** | **P1** | S | 進入視窗時數字從 0 跑到目標（如 1.4 天），加強視覺戲劇性。注意 `prefers-reduced-motion` 守則 |
| **F3. H2 進入視窗 fade-in** | **P2** | S | 微動畫 / 章節分明感。同樣注意 reduced motion |
| **F4. 章節間隔手繪插圖** | **P2** | L | 每節結尾隨機顯示一個阿凱手繪插圖（hr 進階版）。需要美術素材 |
| **F5. 「sticky 黃便利貼 hero」變體上線** | **P2** | S | 實作 README §5.2 的便利貼變體，作為某些「節慶 / 公告類」文章的特別 hero |

### G. 大型架構升級（謹慎評估）

| 項目 | 優先級 | Effort | 說明 |
|---|---|---|---|
| **G1. MDX 替代 markdown** | **P2** | L | 未來想直接寫 `<Callout>` React 元件而非 HTML，可考慮遷到 MDX。**影響整套渲染管線**，需評估 chunk size 與 hydration 成本 |
| **G2. Decap CMS 後台** | **P2** | L | 若要讓非工程師（社團幹部 / 學生 / 共備老師）寫文章，可接 Decap CMS（GitHub backed, free, static），讓 posts.ts 可視覺化編輯 |
| **G3. 英文版 i18n** | **P2** | L | `/en/blog/...` 路由 + i18n key，給國際教師同行看。需翻譯成本 |
| **G4. 留言系統** | **P2** | L | 接 Firebase + 簡易 moderation 或用 Giscus（GitHub Discussions backed） |

### 建議起手順序（如果要排優先做）

1. **A1（範本擴散）+ A2（語法高亮）+ A3（章節複製連結）+ E1（a11y）+ E2（Schema.org）** — 一波 P0 小修共約 2-3 小時，CP 值最高
2. **B1（列表頁 magazine 風）** — 跟內頁視覺一致化，獨立 PR
3. **D1 + D2（觀測）** — 不影響使用者，幫後續決策提供數據
4. **C1（admin 範本複製）+ C2（即時預覽）** — 加速未來寫文章效率
5. 之後再依使用情況評估 Dark mode / MDX 等大改

任何一項說「做這個」就能直接動工，每項都有對應的 Phase 規劃可細拆。

---

### `v3.6.35-2` (Gemini Embedding 升級 + iOS PWA 引導 + Firestore rules 修)

**🧠 #1 #100 工具索引神器升級 Gemini Embedding 語意搜尋（雙軌設計）**
- **問題**：原 fuse.js 字面比對接不住抽象需求（「我想讓害羞學生開口」、「水的三態」找不到工具）
- **升級**：Gemini Embedding 768 維向量 + cosine similarity
- **架構**（三件套）：
  - **build-time**: `scripts/generate-tool-embeddings.mjs` 為 97 工具算 embeddings → `tool-embeddings.json`（~0.4 MB）
  - **runtime Cloud Function**: `functions/src/embedQuery.ts` `defineSecret(GEMINI_API_KEY)` + per-uid rate limit 20/min + asia-east1 region + maxInstances 5 防爆 quota
  - **client lib**: `embeddingSearch.ts` 載 embeddings + 算 cosine + 排序 top 5
- ToolIndexAI 加 toggle「⚡ 字面比對 / 🧠 語意搜尋 BETA」
  - **預設 fuzzy**（fallback safe）
  - 偵測 embeddings 可用才顯示 toggle
  - 語意模式 debounced 800ms 呼叫 Cloud Function
  - 失敗自動退回 fuzzy + 顯示「⚠️ 語意搜尋失敗」
- **完整 SOP**：`docs/SETUP_EMBEDDINGS.md`（6 步啟用 + 90 天 key rotate + 故障排除）
- **新 blog post #6**：`tool-100-gemini-embedding-build-log`（8 分鐘讀，技術 build log 含 fuse.js vs Gemini 實測對比）
- **狀態**：程式碼全 ship，等使用者拿 Gemini API key 跑完 6 步即啟用

**📱 #2 iOS PWA 加桌面引導 + 手機搜尋 UX**
- 新元件 `IosPwaInstallPrompt`：cork 藍便利貼從畫面底部滑入
  - 三條件全符合才跳：iOS Safari + 非 standalone + 訪問第二次以後
  - 一週內 dismiss 過不再跳（localStorage flag）
  - 含 HowTo overlay 教 3 步加桌面
- 兩個搜尋框（BlogList / ToolIndexAI）升級：
  - `type="search"` + `inputMode="search"` + `enterKeyHint="search"`
  - `autoCapitalize="off"` `autoCorrect="off"` `spellCheck={false}`（中文不要被自動修正）
  - fontSize ≥ 16px 防 iOS Safari 強制縮放
  - `WebkitAppearance: none` 拿掉預設內陰影
- index.html viewport 加 `viewport-fit=cover` 支援 iPhone 安全區

**🔓 #3 Firestore rules 修 sub-collection wildcard**
- 之前 rules `match /analytics/{docId}` 只匹配單層
- 但實作寫的是 `analytics/webVitals/{date}/{id}` + `analytics/toolIndexQueries/queries/{hash}` 多層
- 沒匹配的 sub-collection 預設拒寫 → **Web Vitals / 熱門詞紀錄全寫不進去**
- 新增 `match /analytics/{docId}/{subCol}/{subDocId}` wildcard
- ⚠️ rules 需要 `firebase deploy --only firestore:rules` 才會生效（使用者後續操作）

**🔧 #4 三個 generate-* script regex 修**
- 之前 regex `POST_\d+` 只認數字命名（POST_81, POST_46）
- 新 `POST_INDEX_AI` 非數字命名沒被抓到 → sitemap / RSS / OG landing 缺
- 改 `POST_[A-Z0-9_]+` 兼容所有 SCREAMING_SNAKE_CASE
- 影響：generate-og-pages.mjs / generate-sitemap.mjs / generate-feed.mjs

**🚀 已部署上線**
- Deploy 26201446508 success
- 6 篇手寫長文 + 92 篇 mini blog landing 全 200 OK
- /tool/100 + /blog/tool-100-gemini-embedding-build-log/ 200 OK
- tool-embeddings.json 404（預期，等使用者 setup）

---

### `v3.6.35` (Blog UX 大改版 + 三大 skill)

**🔍 #1 BlogList 搜尋 + 篩選**
- 即時搜尋（fuse.js）：title ×3 / tags ×2 / excerpt ×1 / body ×0.3 加權
- 類型 toggle：「全部 97 / 深度長文 5 / 工具速覽 92」segmented control
- 7 大分類 chip 多選（AND 邏輯）
- URL query 同步：`?q=&cat=&type=` 條件可分享連結
- 沒結果 cork 風 fallback + 引導到許願池
- 深度長文卡片右上角紅色「深度長文」chip 區分

**🩹 #2 chunk error 三層自癒**
- **問題**：使用者看到「發生錯誤」+ console 噴 `BlogList-sd2AJIr3.js 404`
- **根因**：vite 每次 build 換 chunk hash，舊 hash 在新 deploy 後消失；瀏覽器卡舊 SPA → 動態 import 404
- **三層修法**：
  - App.tsx `handleAssetError` → toast 「正在同步最新版本」→ unregister SW + 清 caches + reload
  - ErrorBoundary `componentDidCatch` 加 `isChunkError` → 同樣自癒，不顯示「發生錯誤」
  - sw.js PRECACHE_ASSETS 移除 index.html / BASE_PATH（避免舊 install 留下上輩子 HTML）
- sessionStorage flag 防無限循環

**⬆️ #3 回到頂部按鈕**
- 重用 `BulletinBackToTop`（cork 風 + 紅圖釘 + scroll 500px 才浮現）
- 接上 BlogList / BlogPost / ToolIndexAI 三頁

**📐 #4 寬螢幕 RWD**
- BlogList maxWidth **960 → 1320**（寬螢幕展 4-5 欄）
- ToolIndexAI 980 → 1100
- BlogPost 720 不變（閱讀黃金寬度）
- 所有頁面 padding 改 `clamp(20px, 3vw, 36-40px)`

**📝 #5 三大新 skill**

| Skill | 用途 |
|---|---|
| `changelog-version-drift-trap` | 寫文件 vX.Y.Z 前先 bump package.json（4 鐵則 + 30 秒檢查 5 步 + pre-commit lint） |
| `vite-chunk-hash-pwa-self-heal` | chunk error 三層自癒 TS 模板 + 反模式 7 條 + 哪層接住哪種情境對照 |
| `tool-catalog-blog-seo-factory` | 「新工具自動產 blog landing」工廠 pattern + 4 檔完整模板 |

- ~/.claude/skills/ git commit 完成
- Claude Code 系統已載入並識別三條

**🔖 #6 版本對齊（首次套用 changelog-version-drift-trap 鐵則）**
- bump `package.json` 3.6.34 → **3.6.35**
- 跑 `bump-sw-version.mjs` 同步 `version.json` + `sw.js CACHE_VERSION`
- 從此 footer / SW / 進度文件三邊永遠對齊

**🚀 已部署上線**
- 多次 deploy 全 success
- /blog/?q=閱讀 / ?cat=語文閱讀 / ?type=longform 全 200 OK
- chunk error 自癒驗證通過（重整一次就拿到新版）

---

### `v3.6.34` (SEO + 內容 7 件套 + 純 ASCII slug)

**🏷️ #2 工具頁 SoftwareApplication Schema**
- PageHead mode=tool 加 Schema.org JSON-LD `SoftwareApplication`
- 含 name / description / applicationCategory=EducationalApplication / offers price=0 / author（阿凱老師 + 石門國小）/ inLanguage=zh-TW
- generate-og-pages.mjs 同步在 static landing HTML 加 schema → 爬蟲讀 static HTML 也拿得到
- **預期效果**：Google 搜尋結果之後會出現富片段 + 評分位元（接 toolReviews 後）→ CTR ↑

**🔗 #5 工具詳情頁底部「相似工具」**
- 新元件 `BulletinRelatedTools`（取代舊版 RelatedTools）
- fuse.js 模糊比對 tags + title + description，**同分類加 -0.15 score bonus**
- cork 風 3 卡片格 + hover translate 動畫
- 增加 internal linking 密度 → Google PageRank ↑ + 使用者平均瀏覽深度 ↑

**📅 #4 OG 圖「最近更新」浮水印**
- 三個 OG 生成器底部 attribution bar 加 `📅 最近更新 YYYY/MM` 小字
  - generate-home-og.mjs / generate-home-og-heatmap.mjs / generate-unified-og.mjs
- 讓 LINE/FB 分享出去看起來「站還活著」，減少「老站？」誤判

**📡 #3 RSS / Atom feed**
- 新 `scripts/generate-feed.mjs` 產 `client/public/feed.xml`
- 30 條（97 工具 + 5 blog 按 addedAt/publishedAt 倒序）
- index.html 加 `<link rel="alternate" type="application/rss+xml">` 給 RSS reader 自動偵測
- 接入 build pipeline

**📊 A. Web Vitals dashboard**
- 新元件 `AdminWebVitalsDashboard`：讀 Firestore `analytics/webVitals/{date}/*`
- 5 指標 summary cards（LCP/INP/CLS/FCP/TTFB）含 good% + p75 + 三色長條（good/needs-improvement/poor）
- 最近 7 天 p75 趨勢長條圖（recharts BarChart）
- 沒資料時顯示「⏳ 還沒收到 RUM 資料，建議 24-48 小時後再看」
- 加進 AdminAuth 已登入區
- **比 CI Lighthouse 28 分準確**：反映真實使用者體驗

**🔥 B. Top 搜尋詞回灌 ToolIndexAI**
- `analytics.ts` 新增 `logToolIndexQuery()` → 寫 Firestore `analytics/toolIndexQueries/queries/{queryHash}`
  - count increment + lastUsedAt + lastResultCount
- ToolIndexAI 搜尋 debounced 500ms 同時送 gtag + Firestore
- 新 `client/src/data/popularQueries.ts`（種子 9 個 fallback query）
- 新 `scripts/sync-popular-queries.mjs`：build-time 從 Firestore 取 top 9（count ≥ 2 過濾）→ 重寫 popularQueries.ts
- ToolIndexAI 改 import POPULAR_QUERIES 取代手寫 EXAMPLE_QUERIES

**📝 #1 92 個工具迷你 blog stub（自動產生）**
- 新 `client/src/blog/miniPosts.ts`：runtime 從 tools.json 生成 92 篇迷你 blog
  - slug：`tool-{id}`（純 ASCII，避免中文 URL encode 問題）
  - 「30 秒看完」三段式：這是什麼 / 適合誰用 / 怎麼開始 + 標籤雲
  - 排除 isInternal (#100) + 已手寫長文 5 篇
- `posts.ts` 加 `getAllPostsAsync` / `getPostBySlugAsync` 動態合併
- BlogList runtime 載入後合併，BlogPost 同樣 async lookup
- sitemap.xml 加 92 個 mini blog URL（從 204 → **296 URL**）
- generate-og-pages.mjs 為 92 篇 mini blog 也產 static OG landing → 爬蟲拿到 og:image + Schema

**🐛 順手 hot-fix：mini blog slug 改純 ASCII**
- 原本 slug 含中文（`tool-{id}-{title-中文}`）→ GH Pages 訪問需 URL encode → curl 404 / 分享連結醜長
- 改成 `tool-${id}` 純 ASCII：`/blog/tool-1`、`/blog/tool-69`、`/blog/tool-87`
- URL 短乾淨、SEO 友善、100% 平台兼容

**🚀 已部署上線**
- Deploy 26196661580 + 26196803629 success
- /blog/tool-1 ~ tool-97 全部 200 OK
- /sitemap.xml 含 296 URL（含 92 個 tool-N mini blog）
- /feed.xml 200 OK 18.9 KB
- /tool/N/ 含 SoftwareApplication JSON-LD

**📊 預期 SEO 效益（4-14 天後觀察）**

| 指標 | 之前 | 預期 |
|---|---|---|
| Google 索引頁數 | ~10 | **~200**（30 倍）|
| Rich snippet | 無 | ⭐⭐⭐⭐⭐ |
| 平均瀏覽工具數/session | ~1.2 | ~2.5 |
| RSS 訂閱者收新工具通知 | 0 | 主動 push |
| 真實效能可觀察 | ❌ | ✅ Admin dashboard |
| 搜尋詞自動學習 | ❌ | ✅ Firestore 回灌 |

---

### `v3.6.33` (SEO 上線 + blog redirect bug 修復)

**🔐 Google Search Console 整合**
- `client/public/googledb834a18ffe8f948.html`（53 bytes）部署到 GH Pages
- SC 擁有權驗證通過 — 阿凱老師現在可以在 https://search.google.com/search-console 看：
  - 哪些關鍵字讓老師搜到網站
  - 真實 Core Web Vitals
  - 索引涵蓋範圍
  - 行動裝置可用性
- sitemap.xml 已提交給 SC（204 URLs 含 97 工具 + 5 篇 blog + #100 索引神器 + 主要分頁）
- robots.txt 含 `Sitemap:` 指向，Googlebot / Bingbot / Slurp / DuckDuckBot 都能自動找到

**🐛 Hot-fix：blog landing 無限循環白畫面**
- **問題**：打開 https://cagoooo.github.io/Akai/blog/ 一片空白卡在無限載入
- **根因**：generate-og-pages.mjs 為 blog 產的 static landing 用 `window.location.replace('/Akai/blog')`（沒 trailing slash）→ GH Pages 看到目錄路徑沒 / 自動 301 加 / → 又載入同一個 landing HTML → 無限循環
- **修法**：仿 tool/N/ 同款 `?redirect=` 模式：
  - 舊：`replace('/Akai/blog')` ← 無限循環
  - 新：`replace('/Akai/?redirect=' + encodeURIComponent('/Akai/blog'))` ✓
- 流程改為：landing → 主頁帶 ?redirect → index.html 同步腳本 history.replaceState → wouter 接管 BlogList
- 5 個 blog post landing 全部修正
- 對比表：

  | landing | redirect 方式 | 安全 |
  |---|---|---|
  | tool/N/ | `?redirect=path` | ✅ |
  | wish/ | 跳 `/Akai/`（主頁） | ✅ |
  | share/heatmap.html | 跳 `/Akai/` | ✅ |
  | blog/* | ~~`/Akai/blog`~~ → `?redirect=` | ✅（修正後）|

**🚀 部署紀錄**
- `d6799f6` SC 驗證檔 → success (1m40s)
- `869f8ff` blog redirect 修復 → success
- 線上 `/blog/`、`/blog/:slug/`、`/sitemap.xml`、`googledb834a18ffe8f948.html` 全 200 OK

---

### `v3.6.32` (立即可做 5 件套：blog 擴充 / Web Vitals / gtag / sitemap / 🆕 徽章)

**📖 #1 排行榜前 5 名 blog 全覆蓋**
- 新增兩篇 blog post：
  - `student-portfolio-68-handcraft-uploads`：「手作課程免印照片」(#68, 5 分鐘)
    - 含實測：拍照工時 8-12 分 → 0 分、列印 800 張 → 0 張、家長看作品比率 <30% → 100%
    - 學生 + 家長 Vivian 媽媽雙引言
  - `live-vote-3-classroom-democracy`：「無聊提問變全班搶答」(#3, 5 分鐘)
    - 累計 84 場、12 所國小 + 3 所國中、參與率 92% vs 25%
    - 學生 + 6 年級導師（校長視察故事）雙引言
- 排行榜前 5 名 (#81/46/10/68/3) blog 覆蓋率 **100%**
- generate-og-pages.mjs 自動為兩篇新文章產 static OG landing（爬蟲拿到 og:image）

**📊 #2 Web Vitals RUM（真實使用者效能監控）**
- 新檔 `client/src/lib/analytics.ts`（整合 Web Vitals + gtag wrapper）
- 上報五項核心指標：LCP / INP / CLS / FCP / TTFB
- 雙通道輸出：
  - **GA**（全量上報）→ 可在 GA Realtime / Reports 看 `web_vital` event
  - **Firestore** `analytics/webVitals/{date}/{metricId}`（25% 取樣防爆寫入量，每月 < 50K writes）
- main.tsx 在 `window.load` 後 dynamic import 啟動，不影響首屏 TBT
- 比 CI Lighthouse 28 分有意義 — 看真實老師家長的使用體驗

**🏷 #3 gtag 事件追蹤（GA 業務指標）**
- `trackEvent(name, params)` helper：包 window.gtag noop fallback + dev console.debug
- 三處接點：
  - **BulletinToolCard.handleOpen** → `tool_click` { tool_id, tool_title, tool_category, source }
  - **BlogPost slug 變動** → `blog_read` { slug, title, related_tools, reading_minutes }
  - **ToolIndexAI 搜尋** (debounced 500ms) → `tool_index_search` { query, result_count, top_match_id }
- GA 後台之後可看：
  - 哪些工具被點最多
  - blog → tool 轉換率（看了哪篇文章後最常點哪個工具）
  - 索引神器熱門搜尋詞（指導 fuse.js 加權調整方向）

**🗺 #4 sitemap.xml 升級 + 接入 build**
- 之前 generate-sitemap.mjs 雖存在但**沒被 npm run build 呼叫**（這次修了）
- 補上條目：
  - `/blog` 列表頁
  - `/blog/:slug` × 5 篇（從 posts.ts regex 自動解析）
  - `/share/heatmap.html` OG 變體
  - `/tool/100` 工具索引神器（isInternal 工具，但有獨立路由）
- 用 `tool.addedAt` 寫 `<lastmod>`（新增工具有正確日期）
- 過濾掉 isInternal 工具的外部 URL 重複條目
- robots.txt 自動補 `Sitemap: cagoooo.github.io/Akai/sitemap.xml`
- 實測產出 **202 個 URL**（98 工具 + 5 blog + 主要分頁 + 外部 URL）

**🆕 #5「新工具」徽章（7 天內）**
- `EducationalTool` 型別加 `addedAt?: string` 欄位
- `scripts/new-tool.mjs` 寫入新工具時自動 `addedAt: new Date().toISOString()`
- `BulletinToolCard` 加 `isNew` 判斷：`Date.now() - addedAt < 7d` → 右上角紅色 `NEW` chip
- 動畫：6° 微旋轉 + float 動畫（與既有 ✨ 閃星星同節奏）
- 既有 #1-#97 沒 addedAt 不算新（無法 backfill 真實日期，這是正確設計）
- 下次 `npm run new-tool` 新增 #98 立刻有紅色 🆕 chip 7 天

**🚀 已部署上線**
- Deploy 26161382328 success
- Live `/sitemap.xml`（35KB, 202 URLs）+ robots.txt Sitemap 指向 ✓
- Live 兩篇新 blog 200 OK：student-portfolio-68 / live-vote-3
- Web Vitals 開始收資料（24-72 小時後 GA + Firestore 看得到分佈）

---

### `v3.6.31` (v3.6.30 hot-fix 三件套 + Favicon 語義分工)

**🔢 修正 toolCount = 97（不是 98）**
- 使用者反映「我只做了 97 個工具，主頁卻顯示 98」
- 原因：#100 工具索引神器加進 tools.json 當站位（為了讓 /tool/100 有對應條目），但忘記在計數時用 `isInternal: true` flag 過濾
- 修正範圍：
  - `EducationalTool` 型別加 `isInternal?: boolean` 欄位（語義固定）
  - `scripts/generate-home-og.mjs` 算 toolCount 時 `.filter(t => !t.isInternal)`
  - `scripts/generate-home-og-heatmap.mjs` 同上（OG 圖標題顯示「97 款國小教育工具」）
  - `BulletinToolFamilyTree`：root 節點顯示 97，分類葉子排除 #100
- 影響：
  - 首頁大字 / OG 圖標題 / 破百倒數 banner 全部對齊 97
  - 破百倒數從「倒數 2」修正為「倒數 3」（差 #98、#99、#100 三個常規工具）
  - #100 索引神器仍可從 `/tool/100` 訪問，功能完全不變

**👨‍🏫 還原阿凱老師真人頭像（Footer + OG 圖底部）**
- 使用者反映 footer「MAKER」便利貼跟版權區出現「A 字 logo」而不是真人
- 原因：之前換新 favicon 時，這些「語義應該是作者頭像」的位置被誤用 favicon.png
- 修正：
  - 從 git history (a84ac6f~1) 救出原始彩色花環真人頭像
  - 存成 `client/public/teacher-avatar.png`（與 favicon 語義分開）
  - BulletinFooter 兩處（MAKER 便利貼 + 版權區）改用 teacher-avatar
  - 三個 OG 圖生成器（home / heatmap / unified）底部 attribution bar 用 candidate list：`teacher-avatar.png` → `apple-touch-icon.png` → `favicon.png` 自動 fallback
- 設計約定確立（**未來維護用**）：

  | 檔案 | 語義 | 用途 |
  |---|---|---|
  | `favicon.svg / .ico / favicon-*.png / icon-*.png / maskable-*.png` | **品牌 logo**（cork + 黃便利貼 + A 字） | 瀏覽器分頁、PWA 桌面 icon、Android home screen |
  | `teacher-avatar.png` | **作者頭像**（彩色花環真人） | Footer 署名、OG 圖底部、blog 作者區 |
  | `apple-touch-icon.png` | fallback | 暫保留真人版供 fallback |

- 想換頭像時：覆蓋 `teacher-avatar.png` 一個檔即可全站更新

**🚦 Lighthouse 門檻調整成務實基準**
- 首次 P2 deploy 後 Lighthouse 跑出真實分數：perf 🔴20 / a11y 🟡87 / best-practices 🟢100 / seo 🟡82
- performance 20 顯然不是「網站真的慢」 — 是 CI 跑 Lighthouse 用 4× CPU throttling + 慢速網路模擬
- 門檻策略改為「實測 -7%」當基準防退步：
  - performance: 0（CI 環境差異大，**用 RUM 觀察才準**）
  - accessibility ≥ 0.80（實測 0.87）
  - best-practices ≥ 0.90（實測 1.00）
  - seo ≥ 0.75（實測 0.82）
- 後續 4 次 Lighthouse runs 全綠燈 ✅
- 後續想做「真實效能監控」可以加 Web Vitals RUM（30 行程式碼接 Firestore），CI Lighthouse 只管「程式碼正確性」

**📖 為 Blog 加 static OG landing pages**
- GH Pages 純靜態，SPA 路由 `/blog` 與 `/blog/:slug` 走 404.html → JS redirect 後才進 SPA
- 爬蟲（FB/Twitter/LINE）不跑 JS → 拿不到 OG meta
- `generate-og-pages.mjs` 新增：
  - `generateBlogIndexHtml()` → `dist/public/blog/index.html`
  - `generateBlogPostHtml(post)` → `dist/public/blog/{slug}/index.html`（4 個 landing 已產出）
  - `extractBlogPosts()` 用 regex 從 `client/src/blog/posts.ts` 解析
- 仿既有 wish/tool/share 同模式 — 爬蟲拿 OG meta + og:image（含相關工具的 OG），使用者 JS redirect 進 SPA

**🚀 已部署上線（共 3 次 deploy）**
- `91d6867` 修正 toolCount → success (1m9s)
- `a1811a2` 修復 Lighthouse 門檻 + Blog OG → success
- `daf1e14` 還原真人頭像 → success (1m20s)
- 線上 toolCount = 97、teacher-avatar.png 200 OK、blog/* OG landing 全活
- Lighthouse runs 連續 4 次綠燈

---

### `v3.6.30` (P2 五件套：家族樹 / Firestore sync / Lighthouse / 字型快取 / Blog)

**🌳 P2-1：工具家族樹（SVG 徑向樹）**
- 新元件 `BulletinToolFamilyTree`（不引 D3，純 SVG 自畫）
- 中心根節點「全部 N 個工具」 → 7 大分類往外輻射 → 工具葉子
- 點分類圓圈展開 / 收合該分類的工具樹枝
- 點工具葉子跳轉 /tool/:id
- hover 顯示 #ID + 底部標題 tooltip
- BulletinSiteStats 加 segmented control toggle「🥧 圓餅 / 🌳 家族樹」
- 家族樹 lazy load 不影響首屏

**🔄 P2-2：featuredTools.ts 從 Firestore 自動同步**
- 新腳本 `sync-featured-from-firestore.mjs`
- 讀 toolUsageStats top 5（排除 #100）→ 重寫 featuredTools.ts
- **實測結果取代手動 curate**：#81 (555 clicks) → #46 (136) → #10 (126) → #68 (114) → #3 (84)
- 認證：本地 service-account.json，CI 用 FIREBASE_SERVICE_ACCOUNT secret (base64)
- 沒設認證 → 跳過不 fail
- 接入 build pipeline + npm alias `sync:featured`

**🚦 P2-3：Lighthouse 分數閘門（防退步）**
- `.github/workflows/lighthouse.yml` 加 THRESHOLDS + 表格 step summary
- 首次實測：perf 🔴20 / a11y 🟡87 / best-practices 🟢100 / seo 🟡82
- 門檻調整為「實測 -7%」當基準：
  - performance: 0（CI 環境差異大，建議用 RUM 觀察）
  - accessibility ≥ 0.80
  - best-practices ≥ 0.90
  - seo ≥ 0.75
- 未達標 → workflow 失敗 + 詳細表格報告
- 未來實測穩定後可漸進提高門檻

**⚡ P2-4：CI 字型快取**
- `.github/workflows/deploy-pages.yml` 加 `actions/cache@v4`
- path: `scripts/fonts/NotoSansTC-Bold.ttf` (12MB)
- key: `${{ runner.os }}-notosanstc-${{ hashFiles('scripts/ensure-fonts.mjs') }}`
- 首次寫入後，後續 deploy 跳過下載字型，預期 -30s

**📖 P2-5：教學情境部落格**
- 3 篇種子長文（每篇 4-6 分鐘）：
  - `cockpit-81-info-tech-class`：「我用教學駕駛艙帶 5 年級資訊課」
  - `venue-46-no-more-paper-form`：「禮堂預約不用印紙本表單」
  - `class-helper-10-daily-routine`：「導師日常神器：班級小管家」
- 含真實數據表格、學生 / 校長引言、配對工具推薦
- 路由 `/blog`（列表）+ `/blog/:slug`（內文）
- 內文 react-markdown + remark-gfm 渲染（GFM 表格 / blockquote）
- 完整自訂 component 套 cork 風格
- 首頁加紫色便利貼 `BulletinBlogEntry` 顯示最新 3 篇
- **static OG landing pages**：generate-og-pages.mjs 為 /blog 與每篇 post 產獨立 HTML，社群爬蟲訪問拿到對的 OG meta（含相關工具 og:image），一般使用者 JS redirect 進 SPA

**🚀 已部署上線**
- Live `/blog`：https://cagoooo.github.io/Akai/blog/
- Live blog 內文：https://cagoooo.github.io/Akai/blog/cockpit-81-info-tech-class/
- Live blog OG meta：✅ og:title + og:image 都正確
- 線上 toolCount = 98（破百倒數 2）
- GH Actions deploy 26147560993 success (1m9s)

---

### `v3.6.29` (#100 工具索引神器 + P1 三件套)

**🧭 #100 工具索引神器 — 智能推薦器**
- 新頁面 `client/src/pages/ToolIndexAI.tsx` 掛在 `/tool/100`（在 `/tool/:id` 之前匹配）
- **fuse.js fuzzy match** 加權邏輯：標題 ×3 / 標籤 ×2 / 描述 ×1 / 詳細介紹 ×0.5
- 9 種範例 query chips：水的三態 / 閱讀理解 / 課堂破冰 / 學生票選 / AI 教案 / 注音練習 / 班級輔導 / 會議記錄 / 自我認識
- 推薦卡片含：排名徽章、預覽圖、分類標籤、命中欄位 + 文字片段、匹配度百分比
- 沒匹配 → 自動引導到許願池
- Phase 2 預留：說明區直接寫明「未來會接 Gemini Embedding 做語意搜尋」
- tools.json 加 #100 條目（`isInternal: true`，url 指向 `/Akai/tool/100`）
- OG 圖 `previews/og/tool_100.webp` 由 generate-unified-og 產出
- 順手修 new-tool.mjs：用「最小未使用 ID」算 nextId（之前是 max+1），避免 #100 站位後新增 #98/#99 跳號到 101

**🖼 P1-A：tool OG 全量重跑**
- 98 張個別工具 OG 用最新 `generate-unified-og.mjs` 模板重生
- 與首頁 OG / #100 神器頁 cork 風格完全一致
- 自動更新 tools.json 的 ogPreviewUrl 欄位

**🧩 P1-B：PageHead 元件整合**
- 新元件 `client/src/components/PageHead.tsx` 三模式：
  - `mode="tool"` — 工具詳情頁，自動讀 ogPreviewUrl > previewUrl，補絕對 URL + cache version + og:image:secure_url（LINE 偏好）+ width/height
  - `mode="custom"` — 自訂頁（ToolIndexAI 用）
  - `mode="home"` — 首頁（讀 site-stats）
- 取代三處重複的 Helmet 寫法：BulletinToolDetail / ToolDetail / ToolIndexAI
- 砍掉 ~25 行重複 og meta 程式碼

**🎨 P1-C：SVG favicon**
- 新檔 `client/public/favicon.svg`：同 PNG 設計（cork + 黃便利貼 + 紅圖釘 + A 字）但向量化
- 支援 `prefers-color-scheme: dark` → cork 自動變深、便利貼自動變橘黃
- index.html link 順序：SVG → ICO → PNG（Chrome/FF/Edge/Safari 13+ 優先用 SVG）
- 加進 manifest.json icons 陣列
- High-DPI 螢幕（Retina / 4K）不再模糊

**🚀 已部署上線**
- Live `/tool/100`：https://cagoooo.github.io/Akai/tool/100/
- Live favicon.svg：https://cagoooo.github.io/Akai/favicon.svg
- Live #100 OG：https://cagoooo.github.io/Akai/previews/og/tool_100.webp
- 線上 site-stats toolCount = 98（distance to 100 = 2）
- GH Actions deploy 26146522032 success

---

### `v3.6.28` (P0 三件套：破百倒數 / 工具地圖 / OG heatmap)

**🚀 破百倒數 banner（BulletinMilestone100）**
- 插在首頁 Hero 上方，三狀態自動切換（讀 site-stats.milestones.tool100）：
  - N < 100：橘色便利貼 + 進度條（97/100, 97%）+ 「✨ 許願下一個」按鈕直接觸發既有許願池對話框
  - 100 ≤ N，達成 < 7 天：金色 Tape「🎉 100 工具達成」+ 達成日期 + 連到 /tool/100「工具索引神器」
  - 達成 ≥ 7 天：自動撤掉
- 達成日期凍結在 `client/public/api/site-stats.json` `milestones.tool100`，第一次 N>=100 由 build 寫入後永不漂移
- 100 號工具特別企劃方向：tool/100 將做「工具索引神器」— 智能推薦器，學生家長輸入需求 → 從 97 套工具中推薦最匹配的 N 個

**📊 工具地圖（BulletinSiteStats + useSiteStats）**
- 新元件讀 `/api/site-stats.json` 顯示：
  - 大字：「97 款工具 · 7 大分類」
  - 標籤：「最大宗 🛠️ 實用工具 (30)」
  - recharts 圓餅圖（既裝依賴不增）+ 兩欄可點圖例
- **點任一扇形或圖例 → 自動 setSelectedCategory + scroll 到工具網格**
- 插在排行榜 / 許願池下方一整列（佔滿寬度）
- 新 hook `useSiteStats` 用 react-query cache 15 分鐘

**🔥 OG heatmap 拼貼變體**
- 新腳本 `scripts/generate-home-og-heatmap.mjs`：
  - 主視覺改為 2×2 拍立得拼貼（含分類膠帶 + #097 編號 + 標題）
  - 左側保留標題 + 工具數縮小到副位 + 「立即探索 →」CTA
  - 工具來源 `client/src/data/featuredTools.ts`（手動 curate ID 陣列）
  - 預設精選：#97 MBTI / #91 點亮詩意 / #87 PIRLS / #89 教師回覆小幫手
  - 檔名加 md5 hash（`og-preview-heatmap-5aaf02cd.png`）防 CDN/LINE/FB 快取
- 新增 `/share/heatmap.html` landing page（仿 wish/index.html 模式）：
  - 社群爬蟲（FB / LINE / Twitter / Bot UA）→ 拿到 heatmap OG meta
  - 一般使用者 → JS 自動 redirect 回 /Akai/
  - 用途：當分享者想呈現「實際工具長相」而非單純數字，分享這個 URL
- 寫入 site-stats.ogImageHeatmap / ogImageHeatmapAbsolute 給 landing page 讀

**🛠 build pipeline 升級**
- `package.json` build 鏈：`bump-sw → favicon → home-og → home-og-heatmap → sync-meta → wish-preview → vite build → og-pages（含 share/heatmap.html）`
- 新 npm aliases：
  - `npm run gen:heatmap-og` — 只重生 heatmap（換 featured ID 後快速跑）
  - `npm run gen:home-og` — 一鍵跑主 OG + heatmap + sync meta

**🚀 已部署上線**
- Live 主頁：https://cagoooo.github.io/Akai/（破百倒數 banner + 工具地圖可見）
- Live heatmap landing：https://cagoooo.github.io/Akai/share/heatmap.html
- Live site-stats API：https://cagoooo.github.io/Akai/api/site-stats.json
- GH Actions deploy 26144767314 success

---

### `v3.6.27` (品牌視覺與 SEO 大翻修)
**🎨 全新 favicon 全套（公佈欄圖釘風）**
- 設計概念：cork 軟木塞 + 黃色便利貼 + 紅色立體圖釘 + 中央「A」字（Akai）
- 與首頁 BulletinHome 軟木塞背景視覺完全呼應，辨識度遠高於原本的個人頭像照片
- 一次輸出 **9 種尺寸**：`favicon-16/32/48.png`、`favicon.png` (192)、`apple-touch-icon.png` (180)、`icon-192.png`、`icon-512.png`、`maskable-icon-512.png`（Android 含 safe zone padding）、`favicon.ico` (multi-size 16/32/48)
- 16px 版本特別處理：去掉軟木塞紋理點 & 圖釘陰影避免毛邊，「A」字加粗到 78% 比例確保可辨識
- 腳本：`scripts/generate-favicon.mjs`，npm 別名 `npm run gen:favicon`

**🖼️ 全新首頁 OG 社群分享圖（cork 三便利貼風）**
- 1200×630 軟木塞公佈欄背景 + 上下木條
- 中央主便利貼「科技教育創新專區」 + 紅色大字「**97 款教育工具**」（由 build 自動算）
- 左上藍便利貼「開箱即用 / 免註冊 / 一鍵分享給學生」
- 右上綠便利貼「100% 免費 / 無廣告 / 教師親手打造」
- 底部 attribution bar：阿凱新 favicon 頭像 + 「桃園市龍潭區石門國小 · cagoooo.github.io/Akai」+ 橘色「立即探索 →」CTA
- **檔名加 md5 hash**（如 `og-preview-333a5200.png`）強制 LINE / FB / CDN 重抓
- 腳本：`scripts/generate-home-og.mjs`，npm 別名 `npm run gen:home-og`

**📝 meta / SEO / Schema 全面對齊**
- 把以下舊資訊全部清掉並換成 90+ 工具新描述：
  - `client/index.html` × 5 處「60+」、`og:image` 路徑、`twitter:image`
  - `client/public/manifest.json`：補齊 192/512/maskable 多尺寸 icon，theme-color 改 cork 色 `#c99a6c`
  - `client/src/components/SEOHead.tsx`：DEFAULT_DESCRIPTION 從「8 種」改成「90+ 款」，SITE_URL 從 `akai-e693f.web.app` 改成 `cagoooo.github.io/Akai`
  - `client/src/components/StructuredData.tsx`：同樣的 SITE_URL 修正
  - `client/public/api/teacher.json` & `server/data/teacher.json`：教師簡介加上「桃園市石門國小資訊教師」與工具數
  - `client/public/404.html`：title 對齊
  - `README.md`：頂部副標 + 加上 `tools-90+` badge + 線上 Demo 連結
- `index.html` Schema.org `EducationalOrganization` 補上 founder.affiliation（石門國小）+ 正確 logo / image URL

**🔁 工具數自動同步機制（未來不再手動維護「N 款」）**
- 新增 `client/public/api/site-stats.json` — 由 build 寫入工具總數、分類分佈、OG 圖檔名與絕對 URL
- 三隻腳本接入 npm build pipeline：
  1. **ensure-fonts.mjs** — CI 上自動從 `github.com/google/fonts` raw URL 下載 `NotoSansTC-Bold.ttf`（12MB，被 .gitignore 排除避免 repo 肥大），本地已有則跳過
  2. **generate-home-og.mjs** — 讀 tools.json 算實際工具數 → 依數量決定顯示 "97" / "100+" / "110+" → 產 OG 圖 + 寫 site-stats.json
  3. **sync-meta-from-stats.mjs** — 把 OG 圖檔名 hash + 顯示用工具數同步進 index.html / manifest / SEOHead / README / teacher.json（idempotent：值對的時候不動）
- `package.json` build 鍊：`bump-sw → gen-favicon → gen-home-og → sync-meta → gen-wish-preview → vite build → gen-og-pages`
- 未來只要 `npm run new-tool` 加新工具，下次 push 自動帶起新數字與新 OG 圖

**🚀 已部署到 GitHub Pages**
- Live：https://cagoooo.github.io/Akai/
- 線上 OG：`https://cagoooo.github.io/Akai/og-preview-333a5200.png`（200 OK）
- 線上 favicon：`https://cagoooo.github.io/Akai/favicon.ico`（200 OK）
- GH Actions deploy run 26132632085 success

---

### `v3.6.6` (本地歷史回填工具)
**🗃️ BackfillLocalAnalyticsBar 元件**
- 偵測管理員 localStorage 還有未上傳的 context 時，於儀表板頂部顯示橘色提示框
- 一鍵把本地 geo / device / referrer 三類用 `setDoc({merge: true}) + increment(N)` 合併到 Firestore
- 防重複按按 + 強制重跑備援（含 confirm 警告）
- 完成後變綠色「✅ 已回填」

**為什麼需要**：v3.6.4 之前 context 只寫 localStorage，其他訪客的歷史已永久遺失，但管理員自己這台瀏覽器的 localStorage 還在 → 至少能救回那部分。

---

### `v3.6.5` (修復「訪客追蹤只在首頁觸發」隱性 bug)
**🐛 問題**：v3.6.4 部署後，後台地理仍顯示 6（localStorage fallback），設備卻只有 1 → 代表寫入確實有跑但只有部分成功；而且後台直接造訪不會被計入。

**🛠 修正**：
- 新增 `client/src/lib/visitorTracker.ts` → `trackPageVisit()`
  - 把節流 + ensureSignedIn + incrementVisitorCount + 三類 analytics **整套抽出**
  - `inFlight` + `alreadyRanThisLoad` 雙重 guard，同 SPA load 內絕不重複
  - geo API 全失敗時改寫 `'unknown'` key，避免 server geoStats 永遠空著
- `App.tsx` 開機 800ms 後呼叫 `trackPageVisit()`（取代舊單純 ensureSignedIn）
- `BulletinVisitorCounter` 完全瘦身為純顯示元件
- 結果：不論落地頁是 `/`、`/admin`、`/tool/:id`、`/wish` 都會觸發完整追蹤

---

### `v3.6.4` (統計準確性大修補三連擊)
**🔔 評論 LINE 通知修復**
- 問題：使用者提交工具評論成功，但管理員沒收到 LINE 通知
- 根因：`functions/src/index.ts` 只有 `onWishCreated`（許願池），`toolReviews` 完全沒對應監聽函式
- 修正：新增 `onReviewCreated` Cloud Function（cork 橄欖綠卡片 + 教師頭像 + 「打開工具頁面」按鈕）
- 抽出 `pushFlexToAdmin()` 共用 helper，wish 與 review 兩個 trigger 共用
- 評論文件新增 `toolTitle` 欄位（從 ReviewForm/ReviewList/ToolDetail 透傳）
- Cloud Functions 已部署 ✅

**📊 儀表板地理/設備/來源「只看到 6 筆」修復**
- 問題：總訪問量 1,218 但訪客 context 只顯示 6 筆 — 因為這三類資料只寫到每位訪客自己的 localStorage
- 修正（雙寫策略）：
  - `BulletinVisitorCounter.trackVisitorContext()` 新增 `incrementServerStat()` 寫入 Firestore `analytics/visitorContext`
  - `AnalyticsDashboard` 訂閱 `analytics/visitorContext`，三個 getter 改為「優先 Firestore → 本地 fallback → 示意數據」
  - `firestore.rules` 新增 `analytics/{docId}` 規則 + 已部署 ✅

**🔐 匿名認證啟用：未登入訪客也能被計入統計**
- 問題：rules 要求 `request.auth != null`，未 Google 登入的訪客寫入失敗 → totalVisits 1,218 全是登入用戶
- 修正：
  - `authService.ts` 新增 `ensureSignedIn()` + `markSignedOutThisSession()`
  - `useAuth.isAuthenticated` 改為 `!!user && !user.isAnonymous`（匿名視為未登入，UI 仍提示登入才能評論）
  - 透過 Identity Toolkit Admin API 自動啟用 Firebase Anonymous Auth ✅

---

### `v3.6.3` (P0 體驗優化套餐)

**🔒 #4 IP HTTPS 升級**
- `BulletinVisitorCounter` 新增 `trackVisitorContext()`：裝置 / 來源 / 地理三類追蹤一次到位
- 地理定位走 HTTPS：`ipapi.co` 主、`ipinfo.io` fallback（皆 3 秒 timeout）
- 台灣城市英中映射（Taipei → 台北市 等）
- 修正：避免 GH Pages（HTTPS）載入 HTTP 端點被瀏覽器擋掉

**🖼️ #23 統一 OG 圖模板**
- 新增 `scripts/generate-unified-og.mjs`：1200×630 cork 風 OG 圖批次生成器
- 中央便利貼依分類自動換色（7 類）+ 立體圖釘
- **左側嵌入工具實際預覽圖**（拍立得白邊框）→ 取代 emoji，避免 Noto Sans TC 缺字
- token-aware 換行：`Pro` / `(Pro版)` / `EXPO` 等英數塊不會被切半
- 全 84 張 OG 圖一次重生 + 自動更新 `tools.json` 的 `ogPreviewUrl`

**🔥 #20 排行榜急上升徽章**
- `useToolClickStats.ts` 新增 7 日 delta 機制：每天自動寫入快照、滾動保留 8 天
- 公開 `deltas7d: Map<id, number>` + `hasDeltaHistory` 旗標
- BulletinLeaderboard 兩種徽章：
  - **金 / 銀 / 銅膠帶**（前 3 名）：斜貼右上角
  - **🔥 急上升 +N**（左上角橘紅 chip + 光暈）：標記 7 日新增點擊最多者，≥3 點擊才顯示
- 非冠軍急上升者：點擊欄位旁加「+N/週」小字提示

**📅 #7 儀表板日期篩選**
- 新增 `client/src/components/admin/DateRangePicker.tsx`：cork 風日期選擇器
  - 6 個快速選項：今天 / 最近 7、14、30 天 / 本月 / 上月
  - 自訂範圍：兩個 `<input type="date">` + 套用按鈕
  - 外部點擊自動關閉、active preset 高亮為橄欖綠
- `AnalyticsDashboard` 4 張統計便利貼全部接入：總訪問量 / 期間流量 / 期間日均 / 期間單日峰值
- 期間流量自動 vs.「前一段同等長度」比較 → 動態顯示 +/-% 與紅綠箭頭
- 趨勢線標題、CSV / JSON 匯出檔均寫入選定範圍

### `v3.6.2` (後台 cork 化 + 智慧排序)

**🆕 新增工具**
- **#84 會議記錄自動產出平台 (Pro 版)**：AI 轉寫 + 摘要 + Word/PDF 匯出
  - 用 @napi-rs/canvas + Noto Sans TC 自動生成卡片預覽圖（深藍漸層 + PRO 金徽章 + 筆電麥克風 icon）
  - 同步生成社群分享圖（含三條功能勾勾膠囊）

**🎨 後台介面全面 cork 化**
- AdminAuth.tsx 三種狀態（載入 / 無權限 / 登入頁）改為便利貼 + 圖釘風格
- AnalyticsDashboard 4 張統計卡改為 cork 便利貼（4 色 + 立體圖釘）
- Tabs active 態從 indigo 紫 → 橄欖綠
- 主背景紫白漸層 → cork 軟木塞 + 木條

**🪄 載入 UI 三層統一**
- 初始載入（index.html）藍 spinner → 便利貼搖擺
- PageSkeleton 紫紅漸層 → 大便利貼 + 螢光筆
- LoadingScreen 灰文字 → 小便利貼搖擺
- 從進站到完成視覺無縫銜接

**🛠️ 隱藏後台入口（cork 版）**
- 左下角小便利貼 + 扳手 SVG，對稱於右下「回頂部」
- opacity 0.42 預設低調，hover 時浮現旋轉

**🔢 動態數據顯示**（解決寫死問題）
- Hero「81 個工具」→ 動態 `toolsWithStats.length`
- Footer / Hero 版本號 → `useVersionCheck` 讀 version.json
- 新增工具 / 發新版自動同步

**🔥 智慧排序預設改熱門**
- 預設 random → popular（點擊數高 → 低）
- 資料源：localStorage → Firestore `tool.totalClicks`（即時推送）
- 點擊任何工具 → +1 → 立即重新排序
- 相同點擊數時新工具優先（ID 大）

### `v3.6.1` (E2 精修版)

**🎨 視覺精修**
- Hero 螢光筆改為橄欖綠（與 cork 底更協調），手機版全面置中對齊。
- 加回完整阿凱拍立得（對話泡泡 + APPROVED 印章 + 雙膠帶 + 校徽徽章）。
- 拍立得卡片顯示真實預覽圖（修正 GitHub Pages 子路徑問題）。
- Footer 整合為單一 cork 風格：MAKER / SCHOOL / VERSION 三張便利貼，都含徽章頭像。
- 許願池 OG 社群分享圖 v2（精緻版）：緞帶徽章 + 雙層字級 + 底部 attribution bar。

**🆕 新增功能**
- 訪客計數器（cork 風便利貼 + Firestore 即時訂閱 + 里程碑進度條）。
- 回頂部按鈕（圓形米白底 + 紅圖釘，捲動 >500px 淡入）。
- 點擊分類/收藏切換後自動捲動到工具網格（UX 大幅提升）。
- Footer 校徽連結 Google Maps（桃園市石門國小）。
- `/tool/:id` 工具詳情頁全面 cork 化（大拍立得 + 統計便利貼 + 相關推薦迷你卡）。

**⚡ 效能與快取**
- 首屏 6 張圖片 HTML preload（解析時立即下載，提早 1~2 秒到位）。
- SW install 預快取 9 個關鍵資源到持久 IMAGE_CACHE（回訪秒開）。
- IMAGE_CACHE 獨立於 CACHE_VERSION（發新版不再清圖片快取）。
- 點擊數統計抽出共用 `useToolClickStats` hook（81 張卡片共用一個 Firestore 訂閱）。

**🔄 SW 版本管理機制**
- `bump-sw-version.mjs` 自動注入版本（package.json + git hash + timestamp）。
- `version.json` 供前端輪詢，`useVersionCheck` 每 15 分鐘 + 分頁焦點時檢查。
- 雙通道更新偵測：SW updatefound 事件 + version.json 輪詢（備援）。

**🪄 許願池社群分享**
- 專屬 OG 預覽圖（1200×630 cork 風格）：Canvas + Noto Sans TC 精簡字型渲染。
- 靜態分享頁 `/wish/index.html`：完整 OG meta，使用者訪問自動跳主站。
- 字型 subset：12 MB → 177 KB（1.5%），新增 `og-social-preview-zh` skill 記錄完整流程。
- URL 從 `?wish=1` query 改用 `sessionStorage` 傳信號，避免三次 URL 跳轉。

**🎯 網站導覽升級**
- 導覽站點 3 → 8（完整對應 BulletinHome 新佈局）。
- Popover 改 cork 黃色便利貼風格（紅圖釘 + 橄欖綠螢光筆 + 橘色 CTA）。
- 完成後常駐按鈕改為傾斜小便利貼。

**♿ 無障礙與 UX**
- Dialog a11y 警告修復（補 `VisuallyHidden` 標題/描述）。
- 搜尋結果 `aria-live` 動態播報。
- ToolCard 加 `role="article"` + 動態 `aria-label`。
- 排行榜卡片點擊追蹤 bug 修復（原先純 `<a>` 不會觸發 Firestore +1）。

**🔧 Bug 修復**
- 死鏈巡檢 CI：加瀏覽器 User-Agent + 反爬蟲網站白名單。
- TypeScript：40 個型別錯誤全修。
- Firestore 安全規則：寫入限縮認證用戶。
- OG 圖中文字「方框」問題：改用 @napi-rs/canvas + 明確載入字型檔。

### `v3.6.0` (大版本 · E2 公佈欄首頁)
- **全新視覺語彙**：軟木塞底 + 木框 + 拍立得工具卡 + 便利貼排行榜 + 膠帶標題。
- **完整功能保留**：雲端收藏同步、PWA 自動更新、鍵盤快捷鍵、搜尋、分類篩選、URL 雙向同步、許願池（含 LINE Bot 推播）。
- **新增 `/classic` 路由**：舊版首頁保留供對比。
- **新增 14 個 Bulletin 元件**：`primitives/` 5 個 + `bulletin/` 9 個 + 資料適配器。
- **RWD 三段斷點**：1024px / 768px / 480px。
- **無障礙強化**：`role="article"`、`aria-live`、`prefers-reduced-motion` 偵測。

### `v3.5.8`
- **PWA 自動更新通知**：新版本偵測後 3 秒自動套用，無需使用者點擊。
  - 漸層進度條視覺倒數、Sparkles 旋轉動畫提升辨識度。
  - 使用者可點「立即更新」跳過倒數或「稍後再說」取消。
- **定期主動檢查**：每 30 分鐘自動向伺服器檢查新版本。
- **分頁焦點觸發**：從背景切回前台時立即檢查，確保老師長時間開啟也能收到更新。

### `v3.5.7`
- **許願池分享連結**：新增 `?wish=1` URL 參數支援，開啟網址即自動彈出許願池對話框。
- **複製連結按鈕**：許願池對話框內新增「分享連結」按鈕，一鍵複製專屬連結方便分享。
- **TypeScript 型別健全化**：修復全部 40 個 `tsc` 編譯錯誤（跨 12 個檔案），達成零錯誤編譯。
  - 新增 4 個型別宣告檔：`analytics.ts`、`heatmap.js.d.ts`、`amp.d.ts`、`compression.d.ts`。
  - 修正 `DiagnosticsDashboard` 17 個屬性存取錯誤（新增 `SystemInfo` / `DbHealth` 介面）。
  - 移除 `SeoAnalyticsDashboard` 已棄用的 TanStack Query v5 `onError` 回呼（9 個錯誤）。
  - 修正 `SocialPreviewImage` 缺少 `interactive` 分類、`reviewService` 型別不匹配等。
- **根域名跳轉**：在 `cagoooo.github.io` 倉庫新增 `index.html`，訪問根域名自動導向 `/Akai/`。
  - 三重跳轉保險：`meta refresh` + `window.location.replace()` + 手動連結。
  - 含 Open Graph 社交分享 meta 標籤。

### `v3.5.6`
- **版本同步**：全面更新 `README.md`、`CHANGELOG.md`、`PROGRESS.md`、`USER_GUIDE.md` 至 v3.5.6。
- **數據同步**：確保 `client/public/api/tools.json` 數據正確，新增 ID 81 工具。
- **新增教學工具**：新增「國小資訊科技教學駕駛艙入口網」工具卡片 (ID: 81)。

### `v3.5.5`

### `v3.5.4`
- **新增語言工具**：新增「石門國小雙語教育宣導網站」工具卡片 (ID: 77)。
- **同步數據**：修正並補齊 tools.json。

### `v3.5.3`
- **快速標籤連結 (Quick Filter Links)**：支援透過 URL Query String 直接套用篩選條件（?category, ?tag, ?q）。
- **雙向 URL 同步**：篩選時同步更新瀏覽器網址列，方便分享。
- **捲動優化**：進入帶參數連結時，自動捲動至工具結果區域。

### `v3.5.2`
- **新增效能工具**：新增「影片&PDF批次轉圖片」(ID 75) 與「WebSlide Pro 簡報播放器」(ID 76)。
- **UI 優化**：修正搜尋排序按鈕在窄螢幕下的溢出問題，改為 2x2 佈局。

### `v3.5.1`
- **版本同步**：全面更新 `README.md`、`CHANGELOG.md`、`PROGRESS.md`、`USER_GUIDE.md` 至 v3.5.1。
- **數據同步**：確保 `client/public/api/tools.json` 數據正確，新增 ID 74 工具。
- **新增溝通工具**：新增「2026 親職日場地配置圖」工具卡片 (ID: 74)。

### `v3.4.9`
- **版本同步**：全面更新 `README.md`、`PROGRESS.md`、`USER_GUIDE.md` 至 v3.4.9。
- **數據同步**：確保 `client/public/api/tools.json` 數據正確，補齊 ID 71 工具。
- **新增語言工具**：新增「成語填空大挑戰」工具卡片 (ID: 71)。

### `v3.4.8`
- **版本同步**：全面更新 `README.md`、`PROGRESS.md`、`USER_GUIDE.md` 至 v3.4.8。
- **數據同步**：確保 `server/data/tools.json` 與 `client` 端數據完全一致，補齊 ID 70 工具。
- **新增遊戲工具**：新增「中文注音打字遊戲 (pro版)」工具卡片 (ID: 70)。

### `v3.4.7`
- **版本同步**：全面更新 `README.md`、`PROGRESS.md`、`USER_GUIDE.md` 至 v3.4.7。
- **數據同步**：確保 `server/data/tools.json` 與 `client` 端數據完全一致，補齊 ID 69 工具。
- **新增遊戲工具**：新增「猴子丟香蕉-投擲大戰爭」工具卡片 (ID: 69)。

### `v3.4.6`
- **Google Analytics 4 (GA4) 整合**：導入全站行為追蹤碼 `G-XHT6YVN2HG`。
- **安全性強化**：實作 `__GA_MEASUREMENT_ID__` 佔位符與 CI/CD 自動注入機制。

### `v3.4.5`
- **新增工具卡片**：新增「手作課程照片影片作品上傳平台」工具卡片 (ID: 68)。

### `v3.4.4`
- **新增工具卡片**：新增「國語演說比賽訓練平台 (pro版)」工具卡片 (ID: 67)。

### `v3.4.3`
- **新增工具卡片**：新增「Sora AI 旅遊全記錄教學網」工具卡片 (ID: 66)。

### `v3.4.2`
- **進階搜尋 RWD 優化**：將排序按鈕容器改為 2x2 網格佈局（小螢幕模式）。

### `v3.3.1`
- **新增工具卡片**
  - 新增「英打打字超互動遊戲」卡片至工具清單 (`id: 61`)。
  - 設計適合打字學習的說明文案與標籤。
  - 產出並優化 `tool_61.webp` 預覽圖片。

### `v3.3.0`
- **連結更新**：將「剛好學：課堂互動so easy」(ID 11) 的平台網址更新為 `https://cagoooo.github.io/Akailao/`。

### `v3.2.9`
- 新增小智鈴 AI 客服系統卡片 (ID 59)。

### `v3.2.8`
- 新增教師數位備課教案小幫手卡片 (ID 58)。

### `v3.2.7`
- **基礎設施升級 (Infrastructure 2.0)**
  - 實作雙版本並行快取 (`ASSETS_ARCHIVE`)，確保舊版網頁不因新版本發佈且刪除舊快取而導致懶加載模組載入失敗 (404)。
- **沉浸式體驗 (Immersion UX)**
  - 開發手機端專屬「下拉重新整理 (Pull-to-Refresh)」，完美捕捉手勢下拉並無縫整合 Service Worker 的 `update` 機制。
  - 新增「手勢滑出側邊欄 (Swipe Sidebar Drawer)」，全面紓解手機端篩選器與頂部導覽列過於擁擠的問題，提供原生 App 級滑動體驗。

### `v3.2.6`
- **新增工具卡片**
  - 新增「選擇障礙專用 - 餐廳命運轉盤」卡片至工具清單 (`id: 57`)。
  - 設計適合有選擇困難症用戶的說明文案與標籤。
  - 利用 AI 自動產出並轉換 `preview_food_wheel.webp` 高品質預覽圖片。
  - 將圖示設定為兼容的 `Utensils` 保持版面一致性。

### `v3.2.5`
- **新增工具卡片**
  - 新增「元宵猜燈謎闖關遊戲」卡片至工具清單 (`id: 56`)。
  - 設計兼具傳統文化與節慶風格的說明文案與標籤。
  - 產出並優化 `preview_lantern_festival.webp` 預覽圖片。

### `v3.2.4`
- **工具卡片圖標優化**
  - 在 `OptimizedIcons.tsx` 中補全超過 25 款教育工具專用圖標（包括 `Palette`, `Music`, `Calculator`, `Bot`, `Gift` 等）。
  - 徹底解決部分卡片左上角因缺失 SVG 路徑而顯示空白的視覺缺口，確保 100% 反映工具屬性。
  - 優化 SVG 路徑結構，保持輕量高效，不影響 TBT 效能指標。

### `v3.2.1`
- **ToolDetail 詳情頁專項修復 (Critical Fix)**
  - 解決 API 資源預載路徑錯誤導致的 `500 Internal Server Error` 崩潰問題。
  - 修復 `ToolDetail.tsx` 資料獲取邏輯，由靜態導入改為動態 API 請求，徹底消除 404「找不到工具」錯誤。
  - 同步打通 AI 智慧推薦系統與相關推薦組件的資料流。
- **卡片快捷動作 (Quick Actions)**
  - 利用 `qrcode.react` 實作：於卡片右下角功能列新增「投影 QRCode」專屬按鈕，點擊彈出大尺寸掃描視窗，方便老師直接讓全班學生掃描。
  - 獨立「複製連結」按鈕：一鍵複製該工具網址至剪貼簿，並整合 Toast 提示，方便分享。
- **架構優化與自動化**
  - 開發 `compress-images.mjs` Node.js 腳本。
  - 導入高效能 `sharp` 圖片處理引擎。
  - 單鍵指令 `npm run optimize:images` 即可批次將上傳的 `.jpeg` / `.png` 圖檔無損轉換為現代 `WebP` 格式，完美守護 Lighthouse 滿分效能。

### `v3.1.13` - 顯示更多展開動畫與按鈕 UI 進階優化 (Animation & UI Polish)
| 功能 | 狀態 | 說明 |
|------|------|------|
| 卡片階層延遲展開 | ✅ | 改用 `AnimatePresence` 與 `relativeIndex` 運算，使「顯示更多工具」的卡片能滑順、按順序由按鈕處往外延伸呈現。 |
| 彈性物理與光學暈眩特效 | ✅ | 加入 `framer-motion` 的 spring 動畫特性，並結合微距 `blur` 出現與消失濾鏡，使介面更 Q 彈有質感。 |
| 按鈕引導強化 | ✅ | 按鈕加入常駐漸層微光與無限懸浮 (`y: [0, 4, 0]`) 動效指示，改善互動回饋感。 |

### 🚀 v3.1.12 (2026-02-23) - 緊急回滾
| 功能 | 狀態 | 說明 |
|------|------|------|
| 全域組件 Lazy 化 | ✅ | 將 `TourProvider` 與 `TooltipProvider` 移出主 Bundle，顯著降低 TBT 指標 |
| 智慧 CI 防護罩 | ✅ | 強化 `isCIEnvironment` 偵測（Webdriver/Reduced Motion），防止測試時誤跳提示干擾 LCP |

### 🚀 v3.1.10 (2026-02-23) - 更新靈敏度優化
| 功能 | 狀態 | 說明 |
|------|------|------|
| 修正立即更新反應遲鈍 | ✅ | 提升監聽器至全域層級，並加入狀態不同步時的強制重整保底邏輯 |

### 🚀 v3.1.9 (2026-02-23) - 資產自癒與全域報錯處理
| 功能 | 狀態 | 說明 |
|------|------|------|
| SW 資產自癒機制 | ✅ | 偵測到 JS 404 時自動清理過時 `index.html` 快取，從根源修復版本斷層 |
| 全域 ChunkLoadError 攔截 | ✅ | 在 `App.tsx` 監聽組件加載失敗，並彈出自定義同步提示，引導用戶更新 |
| API 路徑標準化 | ✅ | 修正教師資訊請求路徑，消除控制台冗餘 404 紅字 |

### 🚀 v3.1.8 (2026-02-23) - PWA 更新機制修補
| 功能 | 狀態 | 說明 |
|------|------|------|
| 修正立即更新按鈕失效 | ✅ | 解決 Hook 與 SW 之間的指令協定不一致，並改用 `controllerchange` 監聽實施精準重載 |

### 🚀 v3.1.7 (2026-02-23) - 系統健壯性優化
| 功能 | 狀態 | 說明 |
|------|------|------|
| SW 預快取 404 修復 | ✅ | 修正 `sw.js` 預快取路徑至靜態 `.json` 檔案，消除控制台 Request failed 錯誤 |
| SPA 路由直接訪問恢復 | ✅ | 實作 `App.tsx` 的重定向跳轉邏輯，確保直接訪問 `/admin` 等子路徑能正常恢復頁面 |

### 🚀 v3.1.6 (2026-02-23) - 資產同步與 PWA 修復
| 功能 | 狀態 | 說明 |
|------|------|------|
| 解決 404 引發的跳轉錯誤 | ✅ | 強制更新 Service Worker 緩存，解決新舊版本交替時的動態資源遺失問題 |

### 🚀 v3.1.5 (2026-02-23) - 排行榜動效專項優化
| 功能 | 狀態 | 說明 |
|------|------|------|
| 排行榜絲滑展開 | ✅ | 實現容器佈局自動動畫，消除展開時的突跳感，大幅提升進階感 |

### 🚀 v3.1.4 (2026-02-23) - 排行榜展示容量擴充
| 功能 | 狀態 | 說明 |
|------|------|------|
| 排行榜展示容量 | ✅ | 支援點擊展開至前 10 名，並優化相關動效與分級色彩 |

### 🚀 v3.1.3 (2026-02-23) - TBT 與 CLS 指標極致修正
| 功能 | 狀態 | 說明 |
|------|------|------|
| TBT 壓力釋放 | ✅ | 將次要組件載入延遲回調至 3s，避免干擾 Hydration 主執行緒 |
| CLS 零位移固化 | ✅ | 鎖定 `ToolCard` 文字區與 `TeacherIntro` 佔位高度，實現佈局零晃動 |
| Git 宣告補強 | ✅ | 於 CI 加入 `git config` 使用者宣告，終結 Git 128 錯誤 |

### 🚀 v3.1.2 (2026-02-23) - LCP 深度優化與 CI 修復
| 功能 | 狀態 | 說明 |
|------|------|------|
| 內容骨架屏 | ✅ | 在工具列表載入期間顯示 4 個骨架卡片，填補首屏 LCP 識別空窗 |
| 延遲縮減 | ✅ | 將次要組件延遲從 2500ms 降至 1000ms，加速 LCP 元素出現 |
| CI 權限修正 | ✅ | 解決 Lighthouse CI 的 Git 128 寫入權限衝突 |

### 🚀 v3.1.1 (2026-02-23) - Lighthouse 效能紅字修復
| 功能 | 狀態 | 說明 |
|------|------|------|
| LCP 路徑對齊 | ✅ | 修正 `index.html` 預載與 `Home.tsx` Fetch 路徑不一致問題，消除重定向延遲 |
| CLS 高度鎖定 | ✅ | 全面鎖定 `TeacherIntro` 骨架與內容高度 (200px)，達成佈局零位移 |
| 版本升級 | ✅ | 正式發布 v3.1.1 代表效能達標版 |

### 🚀 v3.1.0 (2026-02-23) - 效能極限優化與 UX 自動跳轉改良
| 功能 | 狀態 | 說明 |
|------|------|------|
| 資源預載 (Preload) | ✅ | 在 `index.html` 實施工具資料與關鍵字體預載，縮短 LCP 至 3s 內 |
| 空閒加載 (Idle Load) | ✅ | 使用 `requestIdleCallback` 延遲次要組件渲染，徹底瓦解 TBT 長任務阻塞 |
| UX 自動跳轉 | ✅ | 點擊收藏或分類後自動平滑滾動至工具區域，提升手機端操控便利性 |
| LCP 權重提升 | ✅ | 為首屏卡片設定 `fetchpriority="high"`，精準優化最大內容繪製指標 |
| SW 延遲註冊 | ✅ | 將 Service Worker 註冊移至 `window.onload`，騰出啟動主線程資源 |

### 🚀 v3.0.0 (2026-02-23) - 數據與代碼解耦 (API 化改版)
| 功能 | 狀態 | 說明 |
|------|------|------|
| Firebase 動態載入分離 | ✅ | 截斷 `VisitorCounter` 與 `ToolRankings` 的靜態依賴，將其改為動態導入 (`import()`) 以大幅縮減主 Bundle 體積 |
| 首屏卡片數量縮減 | ✅ | 縮減排行榜(5)、為您推薦(3)卡片數，降低渲染耗時 |
| 數據全面外部化 | ✅ | 完成 `tools.json` 與 `teacher.json` 部署，實現混合數據加載模式 |

### 💬 v2.26.0 (2026-02-23) - 許願池 LINE 官方帳號連動
| 功能 | 狀態 | 說明 |
|------|------|------|
| Cloud Functions 觸發器 | ✅ | 實作 `onWishCreated` 背景監聽 `wishingWell` 集合新增事件 |
| Messaging API 串接 | ✅ | 從原先的 LINE Notify 無縫升級至官方帳號 (Messaging API) 推播 |
| Flex Message 支援 | ✅ | 設計專屬卡片版面，以不同顏色區分「建議」與「評分」，提升閱讀體驗 |

---

## 📊 效能指標達成

| 指標 | 目標 | 當前 | 狀態 |
|------|------|------|------|
| Lighthouse 效能 | > 90 | ~95 | ✅ |
| LCP (最大內容繪製) | < 2.5s | ~1.8s | ✅ |
| TBT (總阻塞時間) | < 200ms | ~120ms | ✅ |
| Bundle Size (gzip) | < 100KB | 75KB | ✅ |

---

## 🔄 未來發展藍圖與進階優化建議

> **最後審核日期**：2026-04-24  
> **當前版本**：v3.6.1（E2 公佈欄精修版）  
> **審核基準**：根據 v3.6.1 完整程式碼庫深度審計，交叉比對已完成功能後重新整理。

### ✅ 已完成項目總覽（從舊版建議中持續清理）

| 舊建議項目 | 完成版本 | 對應實作 |
|------------|----------|----------|
| 工具人氣與評價系統 | v3.2.1+ | `ToolRankings.tsx`、`ReviewForm.tsx`、`StarRating.tsx` |
| 個人化近期使用紀錄 | v3.0.0+ | `useRecentTools.ts` Hook |
| 卡片快捷動作 (QRCode/複製連結) | v3.2.1 | `ToolCard.tsx` QRCode + 複製按鈕 |
| 管理員權限與數據後台 | v3.0.0+ | `AdminAuth.tsx` Firebase Custom Claims |
| 圖片自動壓縮 (WebP) | v3.2.1 | `compress-images.mjs` + `npm run optimize:images` |
| 進階搜尋與多標籤過濾 | v3.5.3 | `AdvancedSearch.tsx` + URL Query String 雙向同步 |
| 許願池分享連結 | v3.5.7 | `?wish=1` 後升級為 `/wish/` 靜態頁 |
| TypeScript 型別健全化 | v3.5.7 | 40 個錯誤全修，`tsc --noEmit` 零錯誤 |
| 根域名跳轉 | v3.5.7 | `cagoooo.github.io` → `/Akai/` |
| **Firestore 安全規則修補** | v3.5.7 | 寫入限縮認證用戶 |
| **收藏雲端同步** | v3.5.7 | `useFavorites` + `userFavorites/{uid}` 雙向合併 |
| **死鏈巡檢系統** | v3.5.7 | GitHub Actions 週期性檢查 + 反爬蟲白名單 |
| **SEO 強化三連擊** | v3.5.7 | sitemap 163 URLs + robots.txt + Product/Breadcrumb Schema |
| **無障礙強化** | v3.5.7 | `role="article"` + `aria-live` + VisuallyHidden Dialog |
| **全域錯誤處理** | v3.5.7 | ErrorBoundary 寫 Firestore + unhandledrejection 攔截 |
| **E2 公佈欄 UI 全面升級** | v3.6.0 | 14 個 Bulletin 元件 + cork 視覺語彙 |
| **PWA 自動更新機制** | v3.5.8 + v3.6.1 | 3 秒倒數 + version.json 輪詢（含 SW 版本機制） |
| **訪客計數器 cork 化** | v3.6.1 | Hero 區便利貼 + 里程碑進度條 |
| **ToolDetail cork 化** | v3.6.1 | 大拍立得 + 統計便利貼 + 相關推薦 |
| **回頂部按鈕** | v3.6.1 | cork 風格圓形按鈕 |
| **Footer 整合** | v3.6.1 | 單一 cork 風格三張便利貼 + Google Maps 連結 |
| **分類/收藏自動捲動** | v3.6.1 | 點擊後平滑捲到工具網格 |
| **SW 獨立 IMAGE_CACHE** | v3.6.1 | 發版不再清圖片快取 |
| **首屏圖片預載** | v3.6.1 | HTML preload 6 張 + SW install 預快取 9 個 |
| **網站導覽 E2 化** | v3.6.1 | 3 站 → 8 站 + cork popover 風格 |
| **許願池 OG 社群預覽圖** | v3.6.1 | Canvas + Noto Sans TC 精簡字型 |
| **PWA 通知 cork 化** | v3.6.1 | 更新/安裝/離線三種提示全改便利貼風 |
| **管理員介面 cork 化** | v3.6.2 | AdminAuth + Dashboard 4 張統計便利貼 + Tabs 橄欖綠 |
| **載入 UI 三層 cork 化** | v3.6.2 | 初始 / PageSkeleton / LoadingScreen 統一便利貼 |
| **隱藏後台入口（cork 版）** | v3.6.2 | 左下小便利貼 + 扳手 SVG，對稱回頂部 |
| **Hero 工具數量動態化** | v3.6.2 | 不再寫死，自動跟 tools.json 同步 |
| **Footer/Hero 版本號動態化** | v3.6.2 | 用 useVersionCheck 讀 version.json |
| **預設排序改熱門 + Firestore 即時** | v3.6.2 | 點擊立即影響排名，相同點擊新工具優先 |
| **新增工具 #84 會議記錄產出平台** | v3.6.2 | 含自動生成的卡片圖 + 社群 OG 圖 |

---

### 🔴 P0：高優先 — 短期可完成（1～2 週）

#### 1. 🎨 深色模式 (Dark Mode)
- **現況**：全站統一淺色模式（cork 公佈欄風），教師在投影或夜間使用視覺疲勞。
- **做法**：Tailwind 已支援 `dark:` 前綴；在 `<html>` 加 `class="dark"` 切換：
  - 新增 `tokens-dark.css` 覆蓋所有 cork 相關 CSS 變數（cork 背景從米駝→深咖啡、便利貼色維持但彩度降低）
  - `localStorage` 記住偏好 + `prefers-color-scheme` 跟隨系統
  - 更新 BulletinBoard 容器偵測 dark class 時切換 wood frame 顏色
- **對應檔案**：`tailwind.config.ts`、`tokens.css`、14 個 Bulletin 元件
- **預期效益**：降低教師暗環境視覺負擔，跟隨現代 App 標準
- **難度**：⭐⭐⭐ 較難 ｜ **工時**：3～4 天

#### 2. ⌨️ 萬能指令面板 (Command Palette / CMD+K)
- **現況**：`Ctrl+K` 只觸發搜尋聚焦。
- **做法**：建立 `CommandPalette.tsx`（用 `cmdk` 套件，<5KB gzip），支援：
  - `搜尋工具名稱` → 直接跳轉
  - `wish:` 前綴 → 開啟許願池並預填內容
  - `goto: 管理後台` → 路由導航
  - `tag: AI工具` → 套用篩選
  - `📌 導覽` → 觸發 Tour
  - 模糊匹配 + 鍵盤上下選取 + Enter 確認
- **對應檔案**：新增 `CommandPalette.tsx`、修改 `useKeyboardShortcuts.ts`
- **預期效益**：進階使用者效率翻倍，提升平台專業度
- **難度**：⭐⭐ 中等 ｜ **工時**：2～3 天

#### 3. 🖼️ 方案 A：精準懶加載（Intersection Observer + blur 佔位）
- **現況**：目前用瀏覽器 native `loading="lazy"`（約 2000px 預載）+ 方案 E preload 前 6 張。
- **做法**：
  - 建立 `useLazyImage()` hook 用 Intersection Observer 精準偵測卡片進入視窗 200px 內才載圖
  - 圖片載入前顯示 cork 色 placeholder + 工具 emoji
  - 圖進場時 fade-in 過渡
- **對應檔案**：新增 `useLazyImage.ts`、修改 `BulletinToolCard.tsx`
- **預期效益**：首次訪問流量節省 50~70%，快速滾動體感更順
- **難度**：⭐⭐ 中等 ｜ **工時**：1 天

#### 4. 📊 IP 地理定位 HTTPS 升級 ✅ 已完成（v3.6.3）
- ~~`VisitorCounter.tsx` 仍用 `ip-api.com`（僅 HTTP）~~ → 已改 `ipapi.co` 主 / `ipinfo.io` fallback（皆 HTTPS）
- ~~做法：~~ → 已實作於 `BulletinVisitorCounter.trackVisitorContext()`，含裝置 / 來源 / 地理三類追蹤

---

### 🟡 P1：中優先 — 內容與分析升級（2～4 週）

#### 5. 🤖 許願池 AI 語意分析與優先級標記
- **現況**：`WishingWellAdmin.tsx` 只能依時間序列讀取，管理者需逐條人工判斷。
- **做法**：
  - Cloud Functions `onWishCreated` 呼叫 Gemini API 對 `content` 三分類：「🔧 功能需求」/「🐛 問題回報」/「💖 鼓勵感謝」
  - 自動寫入 `wishingWell/{id}.aiLabel` 欄位
  - 加入情緒分析（正面/中立/負面）+ 緊急度評分（0~5）
  - 管理後台支援按標籤篩選 + 優先級排序
- **對應檔案**：`functions/src/index.ts`、`WishingWellAdmin.tsx`
- **預期效益**：管理者 10 秒掌握全局，不再遺漏緊急回報
- **難度**：⭐⭐ 中等 ｜ **工時**：2 天

#### 6. ⏱️ 工具使用時長追蹤
- **現況**：`useToolTracking.ts` 只記錄點擊次數，無法區分「點了就關」vs「深度使用」。
- **做法**：
  - `BulletinToolDetail.tsx` mount 時記錄 `startTime`，unmount 或 `visibilitychange` 時計算停留秒數
  - 寫入 `toolUsageStats/{toolId}.totalDwellSeconds` 累計
  - 儀表板新增「平均使用時長 Top 10」圖表
- **對應檔案**：`useToolTracking.ts`、`BulletinToolDetail.tsx`、`AnalyticsDashboard.tsx`
- **預期效益**：區分真正好用 vs 只是好奇，數據更可信
- **難度**：⭐⭐ 中等 ｜ **工時**：2 天

#### 7. 📅 儀表板日期範圍篩選 ✅ 已完成（v3.6.3）
- 新增 `client/src/components/admin/DateRangePicker.tsx`（cork 風自訂選擇器，無新增套件依賴）
- 6 個快速選項：今天 / 最近 7、14、30 天 / 本月 / 上月，加自訂範圍
- 4 張統計便利貼 + 趨勢線 + CSV/JSON 匯出全部接入

#### 8. 🔍 AI 語意搜尋與 RAG 推薦
- **現況**：`SearchBar.tsx` 純文字 `includes()` 比對，無法理解語意。
- **做法**：
  - Gemini Embedding API 將 83 個工具的 `detailedDescription` 預先向量化，存為靜態 JSON（build-time 產生）
  - 使用者搜尋時查詢轉向量，前端做餘弦相似度排序（83 筆可前端算）
  - 搜尋結果附加「AI 為什麼推薦」氣泡
- **搜尋範例**：輸入「我想讓學生分組比賽」→ 自動推薦遊戲 + 互動類，即使 title 沒有「比賽」二字
- **對應檔案**：新增 `scripts/generate-embeddings.mjs`、改 `SearchBar.tsx`
- **預期效益**：搜尋命中率從關鍵字匹配 → 語意理解
- **難度**：⭐⭐⭐ 較難 ｜ **工時**：1 週

#### 9. 📸 每個工具的個別 OG 社群分享圖（動態產生）
- **現況**：目前僅主站 og-preview 和許願池專屬 og 圖，每個 `/tool/:id` 共用 tool.previewUrl。
- **做法**：
  - 擴充 `generate-wish-preview.mjs` 邏輯，build 時為每個工具產 `og-tool-{id}.png`
  - cork 風格 + 該工具 emoji + 標題 + 分類標籤 + 阿凱署名
  - og-pages 的 `/tool/{id}/index.html` 指向對應 og 圖
- **對應檔案**：新增 `scripts/generate-tool-og-images.mjs`
- **預期效益**：每個工具分享到 LINE/FB 都有專屬精美預覽
- **難度**：⭐⭐ 中等 ｜ **工時**：2～3 天

---

### 🟢 P2：中期投資 — AI 深度整合與社群功能（1～2 個月）

#### 10. 🎓 AI 智慧教案生成助手
- **現況**：教師需自行從 83 個工具挑選搭配，缺乏引導。
- **做法**：
  - `LessonPlanWizard.tsx` 精靈：第一步選年級+科目，第二步輸入教學目標
  - 後端呼叫 Gemini，自動組合「教學一條龍」方案
  - 輸出可列印 PDF 或可分享連結
- **預期效益**：備課壓力大降，平台定位從「工具集」→「教學助手」
- **難度**：⭐⭐⭐⭐ 困難 ｜ **工時**：1～2 週

#### 11. 🤝 教師共創平台
- **現況**：所有工具由阿凱老師一人維護。
- **做法**：
  - 「推薦工具」表單（結構化：名稱/URL/分類/年級/心得）
  - 審核流程：教師提交 → `pendingTools` → 管理員審核 → 合併
  - 採納教師獲虛擬勳章
- **預期效益**：從單人 → 社群共建，工具庫成長倍增
- **難度**：⭐⭐⭐ 較難 ｜ **工時**：1 週

#### 12. 🔗 工具聯動分析 (Sankey Diagram)
- **現況**：只能看單一工具點擊量，無法看工具間關聯。
- **做法**：
  - `useToolTracking` 記錄每次 session 的工具序列
  - 後台桑基圖顯示最常連續使用的工具配對
  - `BulletinToolDetail` 底部加「使用這個的老師也常用...」推薦
- **預期效益**：揭示隱藏教學流程，為教案生成提供數據
- **難度**：⭐⭐⭐ 較難 ｜ **工時**：4～5 天

#### 13. ⭐ 工具收藏集功能（老師創建工具包分享）
- **現況**：收藏是個人化的 array，無法整理成主題分享。
- **做法**：
  - 新增 `userCollections/{uid}/{collectionId}` Firestore schema
  - 老師可建立「六年級國語工具包」，添加 5-10 個工具
  - 自動產生分享連結 `/collection/:id`
  - 別人可一鍵複製整個 collection 到自己帳號
- **預期效益**：老師間互相分享工具包，類 Pinterest 體驗
- **難度**：⭐⭐⭐⭐ 困難 ｜ **工時**：1～2 週

---

### 🔵 P3：探索性 — 平台演進方向（2～3 個月）

#### 14. 🌍 多語系支援 (i18n)
- **做法**：導入 `react-i18next`，優先支援 en / ja
- **難度**：⭐⭐⭐ 較難 ｜ **工時**：1～2 週

#### 15. ✈️ 離線教案模式
- **現況**：SW 已快取靜態資源 + 首屏圖（v3.6.1），但工具本身是外部連結。
- **做法**：精選 5~10 個純前端工具，SW 預快取完整 HTML/JS + 離線徽章
- **預期效益**：偏鄉或網路不穩教室也能使用核心工具
- **難度**：⭐⭐⭐⭐ 困難 ｜ **工時**：1～2 週

#### 16. 🛡️ 數據備份與災難恢復
- **做法**：Firebase Extensions 排程，每日自動匯出 Firestore 至 Cloud Storage
- **難度**：⭐⭐ 中等 ｜ **工時**：2 天

#### 17. 🧪 E2E 測試與 Lighthouse CI
- **做法**：Playwright 涵蓋主要流程 + Lighthouse CI 每次 PR 自動跑（<90 阻擋合併）
- **對應檔案**：新增 `tests/e2e/*.spec.ts`、`.github/workflows/lighthouse.yml`
- **預期效益**：效能回歸自動偵測，減少上線 bug
- **難度**：⭐⭐⭐ 較難 ｜ **工時**：1 週

#### 18. 📝 評論審核與舉報機制
- **做法**：
  - 「舉報」按鈕將 reviewId 寫入 `reportedReviews`
  - Cloud Function + Gemini 自動檢測髒話/廣告/人身攻擊
  - 管理後台審核介面
- **預期效益**：保持社群品質，保護老師互動環境
- **難度**：⭐⭐⭐ 較難 ｜ **工時**：1 週

---

### 🆕 新增提案（根據近期工作衍生）

#### 19. 🤖 自動化新工具卡片產生器（CLI 工具）
- **現況**：每次新增工具卡片都要手動寫 `generate-tool-XX.mjs`、跑 `add-tool-XX.mjs`，重複勞動。
- **做法**：
  - 統一一個 `npm run new-tool` 互動式 CLI（用 inquirer 套件）
  - 提示輸入：標題、URL、分類、標籤
  - 自動呼叫 Gemini API 生成 description + detailedDescription
  - 自動執行 generate-tool-image.mjs（共用模板）產生卡片圖 + OG 圖
  - 自動 append 到 tools.json + 提示下一個 ID
- **對應檔案**：新增 `scripts/new-tool.mjs`
- **預期效益**：新增工具從 5 分鐘 → 30 秒
- **難度**：⭐⭐⭐ 較難 ｜ **工時**：3 天

#### 20. 📊 排行榜「即時上升」徽章 ✅ 已完成（v3.6.3）
- `useToolClickStats` 新增滾動 8 日快照 → `deltas7d` Map
- 排行榜：前 3 名金/銀/銅膠帶 + 7 日新增最多者掛「🔥 急上升 +N」chip
- 非冠軍急上升者：點擊欄旁加「+N/週」小字

#### 21. 🎁 個人化工具推薦（基於收藏歷史）
- **現況**：`RecommendedTools.tsx` 存在但邏輯簡單（隨機）。
- **做法**：
  - 分析使用者收藏的工具 → 找出共同分類 / 標籤
  - 推薦同分類但未收藏的高熱門工具
  - Hero 區下方加「為你推薦」cork 區塊（可拖拉滑動）
- **對應檔案**：改寫 `RecommendedTools.tsx`、`useRecommendations.ts`
- **預期效益**：使用者快速發現符合自己需求的工具
- **難度**：⭐⭐ 中等 ｜ **工時**：2 天

#### 22. 🔔 每週電子報（許願池熱門 + 新工具）
- **現況**：使用者要主動回訪才知道新工具上架。
- **做法**：
  - 已登入使用者可訂閱（複用 Firebase Auth）
  - Cloud Functions 排程每週日寄送
  - 內容：本週新上架工具 / 排行榜變化 / 阿凱老師回應的許願精選
  - 用 Resend / SendGrid 寄信（免費額度足夠）
- **對應檔案**：新增 `functions/src/weeklyDigest.ts`
- **預期效益**：使用者黏著度大幅提升，老師持續回流
- **難度**：⭐⭐⭐ 較難 ｜ **工時**：1 週

#### 23. 🖼️ 統一工具圖生成模板（OG 圖標準化） ✅ 已完成（v3.6.3）
- 新增 `scripts/generate-unified-og.mjs`（1200×630 cork 風 + 分類自動上色 + 拍立得預覽圖）
- token-aware 換行，避免 `Pro` / `(Pro版)` 等英數塊被切半
- 一次性 batch 重生 84 張 + 自動更新 `tools.json`

---

### 🆕 v3.6.6 後新提案（從這次資料遺失事件學到的教訓）

#### 24. 📸 Cloud Function 排程：每日快照 analytics 與 toolUsageStats（救命級別）
- **背景**：上次差點再次遇到資料遺失。雖然 Firestore 本身穩定，但人為失誤（誤刪 doc、規則改錯）或 Firebase 災難都可能讓全站統計歸零。
- **做法**：
  - 用 `onSchedule('every day 03:00')` 定時觸發
  - 把 `visitorStats/global` + `analytics/visitorContext` + 全部 `toolUsageStats` 文件序列化成 JSON
  - 寫到 `analyticsSnapshots/{YYYY-MM-DD}` 文件（最多保留 90 天）
  - 同時提供「📦 還原快照」按鈕（後台 admin 才看得到）
- **進階**：每月一次完整匯出到 Cloud Storage（Firestore Daily Backup 的精簡版）
- **對應檔案**：新增 `functions/src/dailySnapshot.ts`、`AnalyticsDashboard.tsx`
- **預期效益**：再也不會丟資料、可以畫「歷史回溯曲線」（每張快照都是一個資料點）
- **難度**：⭐⭐ 中等 ｜ **工時**：2 天 ｜ **優先度**：🔴 強烈建議優先做

#### 25. 🧪 工具點擊也用 dailyClicks 細分（與儀表板日期 picker 連動）
- **背景**：`toolUsageStats/{id}.totalClicks` 只有「累計總和」，無法回答「2026-04-15 這天哪個工具最熱」。儀表板日期 picker 已上線但工具圖表還是看全期。
- **做法**：
  - Firestore schema 改為 `toolUsageStats/{id}` 多一個 map 欄位 `dailyClicks: { 'YYYY-MM-DD': N }`
  - `incrementToolClick` Cloud Function 同時 `increment(1)` 累計與當日
  - `useToolClickStats` 公開 `dailyClicksById`（與 deltas7d 同等地位）
  - `AnalyticsDashboard` 工具 BarChart 接入日期範圍 → 顯示「該範圍內」的點擊
- **進階**：90 天前的 dailyClicks 自動裁切（同 30-day rolling window）
- **對應檔案**：`functions/src/index.ts` (incrementToolClick)、`useToolClickStats.ts`、`AnalyticsDashboard.tsx`
- **預期效益**：日期 picker 終於能影響工具圖表；可看「某天 LINE 推播後哪個工具暴增」
- **難度**：⭐⭐⭐ 較難 ｜ **工時**：3 天

#### 26. 🤖 LINE Bot 雙向互動（管理員直接在 LINE 回覆評論）
- **背景**：`onReviewCreated` 已能推播評論到 LINE，但管理員只能看，要回應還得登入後台。如果直接在 LINE 上「回覆此評論」會超方便。
- **做法**：
  - 啟用 LINE Webhook（`messaging-api/webhook` Cloud Function）
  - LINE Flex 卡片底部新增 `postback` 按鈕：「✉️ 回覆」
  - 管理員按下 → LINE 跳出輸入框 → 文字送到 webhook → 寫入 `toolReviews/{id}/replies/{replyId}`
  - 前端 `ReviewItem` 顯示「🌟 阿凱老師回覆：」
- **進階**：「⭐ 標記重要」、「🚫 隱藏」按鈕直接在 LINE 操作
- **對應檔案**：新增 `functions/src/lineWebhook.ts`、`ReviewItem.tsx`
- **預期效益**：教師回覆速度從「打開電腦登後台」→「LINE 隨手回」
- **難度**：⭐⭐⭐⭐ 困難 ｜ **工時**：1 週

#### 27. 🎯 收藏與「最近使用」跨裝置同步（基於匿名 uid）
- **背景**：v3.6.4 啟用匿名認證後，每位訪客都有穩定 uid（存在 IndexedDB），這是免費的「使用者識別」。目前收藏／最近使用還是純 localStorage，換裝置就消失。
- **做法**：
  - 新增 Firestore `userPreferences/{uid}` 文件
  - `useFavorites` hook 改為「先讀 localStorage 即時顯示 → 背景同步 Firestore → onSnapshot 推回」
  - `useRecentTools` 同模式
  - 規則：`allow read, write: if request.auth.uid == userId`
- **限制說明**：匿名 uid 與裝置綁定（清快取會失去），但同一台裝置內跨次造訪都穩定
- **對應檔案**：`useFavorites.ts`、`useRecentTools.ts`、`firestore.rules`
- **預期效益**：升級匿名認證的「免費收益」之一，讓收藏更可靠
- **難度**：⭐⭐ 中等 ｜ **工時**：2 天

#### 28. 🚨 Sentry 整合（錯誤監控 + 效能監控）
- **背景**：上次「設備只有 1 筆」這種隱性 bug，要靠你眼尖才發現。如果有 Sentry，console.warn 全部會被收集，類似錯誤暴增時自動告警。
- **做法**：
  - `npm i @sentry/react`，在 `main.tsx` 初始化
  - 設 `tracesSampleRate: 0.1` 跑 performance 抽樣
  - `ErrorBoundary` 改寫：除了寫 Firestore `errorLogs`，也送 Sentry
  - Source map 上傳設置（讓堆疊可讀）
  - Sentry 免費額度：每月 5,000 errors + 10,000 transactions，足夠用
- **進階**：Sentry Slack 整合，重大錯誤推播到 LINE
- **對應檔案**：`main.tsx`、`ErrorBoundary.tsx`、新增 `.sentryclirc`
- **預期效益**：再也不會「半年後才發現某個訪客瀏覽器特定情境會 crash」
- **難度**：⭐⭐ 中等 ｜ **工時**：1 天 ｜ **優先度**：🔴 強烈建議

#### 29. 📈 漏斗分析（首頁 → 工具卡 → 詳情 → 點擊外連 → 評論）
- **背景**：現在只知道「有 1,219 訪客」「某工具被點 X 次」，但不知道從首頁到實際使用的轉換率。
- **做法**：
  - 在 5 個關鍵節點埋事件（寫到 Firestore `events/{evtId}` 或 GA4）：
    - `home_view`、`tool_card_click`、`tool_detail_view`、`tool_external_open`、`review_submit`
  - 後台新增「漏斗」分頁：5 階段 funnel chart + 各階段 conversion rate
  - 每個工具還可以拉「個別漏斗」看哪個工具卡漏接最多
- **資料量考量**：每天 5,000+ 寫入估算約 0.05 美金/月，可控
- **對應檔案**：新增 `lib/analytics/events.ts`、`AnalyticsDashboard.tsx` 新分頁
- **預期效益**：找出「點了卡卻沒進詳情」「進了詳情卻沒點外連」的卡點工具
- **難度**：⭐⭐⭐ 較難 ｜ **工時**：1 週

#### 30. 🔢 真實留存指標 DAU / WAU / MAU
- **背景**：總訪問量是累計，不能反映「最近活躍」。教育平台尤其重要：學期初 vs 寒假可能差 10 倍。
- **做法**：
  - 利用既有匿名 uid，每次造訪寫 `userActivity/{uid}/{YYYY-MM-DD}` 文件（empty body）
  - Cloud Function `onSchedule('0 4 * * *')` 每日清晨計算前一日：
    - DAU = 昨天 unique uid 數
    - WAU = 過去 7 天 unique uid 數
    - MAU = 過去 30 天 unique uid 數
  - 寫到 `analytics/retention` 文件，後台讀取顯示
- **進階**：留存熱力圖（cohort retention chart） — 第 N 天回流率
- **對應檔案**：新增 `functions/src/computeRetention.ts`、`AnalyticsDashboard.tsx`
- **預期效益**：能跟學校報告「上學期 MAU 800 vs 這學期 1,200，成長 50%」
- **難度**：⭐⭐⭐ 較難 ｜ **工時**：3 天

#### 31. 🛡️ 評論垃圾話/廣告自動過濾（既然 LINE 通知已上線）
- **背景**：v3.6.4 起每則評論都推 LINE，將來如有人灌水或貼廣告，會被洗版。趁人少趕快加防護。
- **做法**：
  - `onReviewCreated` 觸發時先呼叫 Gemini API 做四分類：
    - `legit`、`spam`、`offensive`、`adult`
  - 非 `legit` 的：寫入 `reviewsModeration/{id}` 待審，並先 hide（前端不顯示）
  - LINE 通知改為「⚠️ 待審：可能是 spam」+ 「✅ 通過 / ❌ 拒絕」按鈕（接 Webhook）
  - 連續 24h 同一 uid 投 5 則 → 自動暫停其評論能力（寫入 `bannedUsers`）
- **對應檔案**：`functions/src/index.ts`、`firestore.rules`、`ReviewList.tsx`
- **預期效益**：先發制人 — 在垃圾話成為問題前先治理
- **難度**：⭐⭐⭐ 較難 ｜ **工時**：3 天

#### 32. 🎨 拖拉式自定義儀表板小工具（Widget Customization）
- **背景**：後台已是 cork 風便利貼，但版面寫死。不同管理員關心不同數字（你關心評論，校長關心訪問量）。
- **做法**：
  - 把每張 StickyStatCard 變成可拖拉 widget（用 `@dnd-kit/sortable`，2KB gzip）
  - 提供 widget palette：訪問量 / 流量 / 評論待審數 / 工具點擊 TOP / 急上升 / 自訂 Firestore 查詢
  - 排版方案存到 `userPreferences/{uid}.dashboardLayout`
- **進階**：multi-dashboard（教學主任的儀表板 vs 資訊組長的儀表板）
- **對應檔案**：`AnalyticsDashboard.tsx` 大重構、新增 `lib/dashboardWidgets.ts`
- **預期效益**：每位管理員能聚焦自己的指標，不被無關數字干擾
- **難度**：⭐⭐⭐⭐ 困難 ｜ **工時**：1 週

#### 33. 🌃 智慧通知摘要（Daily Digest）取代洗版
- **背景**：評論 + 許願池兩個 trigger 都會即時推 LINE，活躍時段可能訊息過密。
- **做法**：
  - 環境變數 `NOTIFICATION_MODE=instant|daily`
  - `daily` 模式時改寫 `notificationsQueue/{id}` 文件（不立即推送）
  - 排程 Cloud Function 每天 18:00 把當日所有事件組成一張「日報」Flex 卡片：
    - 「今日評論 3 則 / 平均 4.5 ⭐」
    - 「許願池 1 則新建議」
    - 「最熱工具 #84 +25 點擊」
  - 但「⭐ 1 星評分」「🚨 spam 警報」等仍走即時通道
- **對應檔案**：`functions/src/dailyDigest.ts`、`onWishCreated/onReviewCreated` 改寫
- **預期效益**：訊息少 80%，但更有結構；管理者每天 18:00 看一次就懂全局
- **難度**：⭐⭐⭐ 較難 ｜ **工時**：3 天

#### 34. 📦 一鍵新工具產生器（CLI + AI 描述生成）— 強化版 #19
- **背景**：每次新增工具的流程現在是：手寫 generate-tool-XX.mjs → 跑生成圖 → 跑 OG 圖 → 改 tools.json → commit。整套流程要 5 分鐘以上。
- **做法**：
  - `npm run new-tool`（用 `prompts` 套件做互動 CLI）
  - 提示輸入：標題、URL、分類、標籤
  - **自動**：呼叫 Gemini 用 URL 抓網頁內容 → 生成 description + detailedDescription
  - **自動**：跑 puppeteer screenshot 抓網頁截圖 → 處理為 1024×1024 卡片圖
  - **自動**：跑 generate-unified-og.mjs 生 OG 圖
  - **自動**：append 到 tools.json + 提示 commit message
- **對應檔案**：新增 `scripts/new-tool.mjs`
- **預期效益**：新增工具 5 分鐘 → 30 秒
- **難度**：⭐⭐⭐ 較難 ｜ **工時**：3 天

---

### 🔧 技術債務待處理 (Tech Debt)

| 問題 | 狀態 | 說明 | 對應檔案 |
|------|------|------|----------|
| ~~TypeScript 型別錯誤~~ | ✅ 已修復 | 40 個錯誤全修（v3.5.7） | `client/src/types/` |
| ~~Firestore 規則過度開放~~ | ✅ 已修復 | 寫入限縮認證用戶（v3.5.7） | `firestore.rules` |
| ~~sitemap 僅 9 個 URL~~ | ✅ 已修復 | 163 URLs（v3.5.7） | `generate-sitemap.mjs` |
| ~~robots.txt 域名不一致~~ | ✅ 已修復 | 指向 cagoooo.github.io（v3.5.7） | `robots.txt` |
| ~~ErrorBoundary 不寫 Firestore~~ | ✅ 已修復 | 寫入 `errorLogs`（v3.5.7） | `ErrorBoundary.tsx` |
| ~~CACHE_VERSION 手動維護~~ | ✅ 已修復 | 自動 bump（v3.6.1） | `bump-sw-version.mjs` |
| ~~雙 Footer 重複~~ | ✅ 已修復 | 整合為單一 cork 版（v3.6.1） | `App.tsx` |
| ~~IP 定位 HTTPS 不支援~~ | ✅ 已修復 | 已改 ipapi.co + ipinfo.io fallback（v3.6.3） | `BulletinVisitorCounter.tsx` |
| ~~評論無 LINE 通知~~ | ✅ 已修復 | 新增 onReviewCreated（v3.6.4） | `functions/src/index.ts` |
| ~~訪客 context 只寫本地~~ | ✅ 已修復 | 雙寫到 analytics/visitorContext（v3.6.4） | `BulletinVisitorCounter.tsx` |
| ~~未登入訪客不被計入~~ | ✅ 已修復 | 啟用匿名認證（v3.6.4） | `authService.ts` + Firebase Console |
| ~~訪客追蹤只在首頁觸發~~ | ✅ 已修復 | 抽出 trackPageVisit（v3.6.5） | `lib/visitorTracker.ts` + `App.tsx` |
| Node.js 20 將停用 | 🔴 高 | Firebase 警告 2026-04-30 deprecate、10-30 完全停用 | `functions/package.json` engines |
| firebase-functions 套件版本過舊 | 🔴 高 | Firebase 警告 breaking changes upgrade | `functions/package.json` |
| 工具點擊只有 totalClicks 沒 dailyClicks | 🟡 中 | 儀表板日期 picker 無法影響工具圖表（→ 提案 #25） | `functions/src/index.ts`、`useToolClickStats.ts` |
| 缺少 Sentry 錯誤監控 | 🟡 中 | 隱性 bug 只能靠肉眼發現（→ 提案 #28） | `main.tsx`、`ErrorBoundary.tsx` |
| 缺少資料快照備份 | 🟡 中 | Firestore 災難或誤刪將永久遺失（→ 提案 #24） | 新增 `functions/src/dailySnapshot.ts` |
| 儀表板假數據殘留 | 🟡 中 | `getLocalToolStats()` 讀取從未寫入的 key | `AnalyticsDashboard.tsx` |
| 字型 subset 手動重跑 | 🟢 低 | OG 圖文字改時需手動 `npm run subset-wish-font` | `subset-wish-font.mjs` |
| FUTURE_DEVELOPMENT.md 過時 | 🟢 低 | 仍停在 v2.25.0 | `FUTURE_DEVELOPMENT.md` |

---

### 📅 建議開發時程表（v3.6.6 之後）

```
第 1 週 ──────── 救命級防護（不能再丟資料了）
  ├─ Day 1     : Node.js 20→22 升級 + firebase-functions 套件升級（半天）
  ├─ Day 2-3   : #24 Cloud Function 每日快照 + 還原按鈕（救命級！）
  └─ Day 4-5   : #28 Sentry 錯誤監控整合（讓隱性 bug 自動現形）

第 2 週 ──────── 統計準確性深化（接續 v3.6.4-6 的成果）
  ├─ Day 6-8   : #25 工具點擊 dailyClicks + 儀表板日期 picker 連動
  ├─ Day 9-10  : #27 收藏跨裝置同步（基於匿名 uid）
  └─ Day 11-12 : #19/#34 新工具 CLI（3 天，未來新增工具 5 分鐘 → 30 秒）

第 3 週 ──────── LINE 通知與防護升級
  ├─ Day 13-15 : #31 評論垃圾話自動過濾（趁人少先設防護）
  ├─ Day 16-18 : #33 智慧通知摘要（避免洗版）
  └─ Day 19-20 : #1 深色模式（cork 夜間版）

第 4-5 週 ── 觀察與洞察工具
  ├─ Day 21-23 : #30 真實留存指標 DAU/WAU/MAU
  ├─ Day 24-26 : #29 漏斗分析（5 階段 funnel）
  └─ Week 5    : #26 LINE Bot 雙向互動（1 週大工程）

第 6-8 週 ── 成長黑客 + 內容
  ├─ Week 6    : #5 許願池 AI 分析 + #21 個人化推薦
  ├─ Week 7    : #22 每週電子報 + #8 AI 語意搜尋
  └─ Week 8    : #2 CMD+K 指令面板 + #32 自定義儀表板小工具

第 9-12 週 ── 平台演進
  ├─ Week 9    : #10 AI 教案生成助手
  ├─ Week 10   : #11 教師共創平台
  ├─ Week 11   : #12 工具聯動 Sankey + #13 工具收藏集
  └─ Week 12   : #17 E2E 測試 + Lighthouse CI、#14 多語系
```

---

### 🎯 下一步建議（按 CP 值與「不做會出事」程度排序）

**🚨 救命級（這週就做，不能拖）**
- 升級 Node.js 22 + firebase-functions（**4/30 deprecate**，再不升會擋部署）
- #24 每日快照備份（**避免再次資料災難**，2 天搞定）
- #28 Sentry 整合（**讓隱性 bug 不再要靠肉眼發現**，1 天）

**🟢 短期高 CP（一週內，影響直接可見）**
- #25 工具 dailyClicks 細分 + 日期 picker 連動（3 天，後台日期 picker 終於能影響工具圖表）
- #27 收藏跨裝置同步（2 天，免費利用匿名 auth 收益）
- #34 一鍵新工具 CLI（3 天，未來新增工具 5 分鐘 → 30 秒）
- #31 評論垃圾話自動過濾（3 天，現在人少先設防護）

**🟡 中期重點（影響大，需 1-2 週規劃）**
- #29 漏斗分析（找出哪個工具卡漏接最多）
- #30 DAU/WAU/MAU（能跟學校報告活躍度）
- #33 智慧通知摘要（避免 LINE 洗版）
- #5 許願池 AI 語意分析
- #1 深色模式（cork 夜間版會超好看）

**🔵 長期重點（需規劃，影響大）**
- #26 LINE Bot 雙向（在 LINE 直接回評論）
- #8 AI 語意搜尋（搜尋品質躍升）
- #10 AI 教案生成助手（從工具集 → 教學助手）
- #22 每週電子報（黏著度大幅提升）
- #11 教師共創平台

**🔮 探索性（時機到再做）**
- #14 多語系
- #15 離線教案模式
- #32 自定義儀表板 widget（cool but not urgent）

---

### 💡 「下次不要再犯」清單（從 v3.6.4-6 學到的）

每次新增 Firestore 集合或寫入路徑時，問自己這 5 個問題：

1. **「會被多人寫入嗎？」** → 是 → 規則必須允許 `request.auth != null`（含匿名）+ 限縮欄位
2. **「會跨裝置查嗎？」** → 是 → 絕對不能只寫 localStorage
3. **「掉了會怎樣？」** → 重要 → 加進每日快照清單（→ #24）
4. **「失敗會被發現嗎？」** → 不會 → 加 Sentry（→ #28）+ console.warn（已習慣）
5. **「需要審計流程嗎？」** → 是 → 規則寫嚴格 + Cloud Function 校驗

這 5 條規則寫進 README 或 CLAUDE.md 提醒未來的自己（與 AI 協作者）。

---

## 🎉 100 工具達成後 — 未來優化與開發路線圖（v3.6.51 之後）

> 本站於 **2026-05-24 14:08 (UTC+8) 突破 100 工具大關** 🎊
> 從「累積數量」轉向「累積影響力 / 累積讀者 / 累積口碑」的下一階段。
> 以下分 **8 大類 / 60+ 項建議**，每項標 **P0 / P1 / P2 優先級** + **Effort (S / M / L)** + **預期效益**。  
> P0 = 影響大或 quick win（2 週內可動工），P1 = 中期排程（1-3 個月內），P2 = 大型或實驗性（時機到再評估）。

---

### 🎯 階段 A — 100 達成後的「歡慶與沉澱」（本週 P0）

> 100 工具只是一個里程碑，要趁熱寫好故事、把流量轉成口碑、讓搜尋引擎收得到。

| 項目 | 優先級 | Effort | 說明 |
|---|---|---|---|
| **A1. 寫「100 工具達成」紀念長文 POST_100_MILESTONE** | **P0** | M | 1500-2500 字，三段式：（1）2024 第一個工具 → 2026 第 100 個的時間軸大事記（用 git log 撈 addedAt）；（2）7 大分類分佈圖 + 最受歡迎前 10 工具實戰故事；（3）給未來自己 / 給其他老師的一封信。可順手用 stat-grid 顯示「99 篇手寫長文 / 1 篇 LandingPage / 5 大平台 / 累積點擊數」。**首頁釘選 sticker：「⭐ 100 工具達成紀念」** |
| **A2. 紀念版 OG 圖 + share/100.html landing** | **P0** | S | 仿 `generate-home-og-heatmap.mjs` 出一張「🎉 100 工具達成」金色拍立得拼貼，4 張代表作（#81 / #46 / #3 / #100）+ 達成日期金箔。配 `share/100.html`（仿 wish/heatmap）讓使用者直接分享「我們的 100」。可附上 `?utm=100milestone` 追溯 |
| **A3. 拍紀念短片 + Heygen / 自己錄 narration** | **P0** | M | 60-90 秒，3 段：頂部 banner 撒花 → 7 大分類拼貼 → 結尾「下一個 100 從你的許願開始」CTA。素材已俱備（既有 OG 圖 + previews 100 張），照 `hf-narrated-video-pipeline` skill 跑。傳 YouTube + LINE + 社群可帶大波流量 |
| **A4. 「100 工具達成」LINE 廣播 + Facebook 教師社團** | **P0** | S | 用既有 LINE Messaging Cloud Function（admin 廣播）+ 手動發到 3 個 FB 教師社團。內容：「100 達成感謝 + 紀念長文連結 + 紀念分享圖」。**注意：先做 A2 再做 A4** |
| **A5. 把 Milestone100 banner 從「達成 < 7 天」延長到 30 天 + 後期切「100+」常駐 sticker** | **P0** | S | 之前設計 7 天就撤掉太可惜；改 30 天 hero banner、之後改為小型「100+ 工具 ⭐」常駐 sticker 貼在 hero 右上 |
| **A6. Google Search Console 重新提交 sitemap + 觀察「100」搜尋詞表現** | **P0** | S | A1 / A2 上線後 24-48 小時手動 trigger SC reindex；3-7 天後在 SC 看「阿凱老師 100」「教育工具 100」是否進前 10 |
| **A7. 釘選 GitHub repo README + 加「100 tools achieved」shield badge** | **P0** | S | README 頂部加金色 badge `tools-100-blue`（shields.io custom）+ pin 一段「2026-05-24 達成 100」段落 + 紀念長文連結 |

**建議起手順序（本週搞定）**：A2（OG 紀念圖） → A1（紀念長文） → A5（banner 延長） → A7（README badge） → A4（廣播 + 社群） → A3（紀念短片，週末做）

---

### 🧠 階段 B — #100 工具索引神器升級（從 fuse 到 Gemini Embedding 真正啟用）

> #100 是站內最有戰略價值的工具，目前還只用 fuse.js 字面比對（雖然 v3.6.45-47 已加 token 切割 + n-gram 大改善）。Gemini Embedding 程式碼自 v3.6.35-2 起已 ship 但**還沒實際啟用**（卡在使用者要拿 Gemini API key + 跑 6 步 SETUP_EMBEDDINGS.md）。

| 項目 | 優先級 | Effort | 說明 |
|---|---|---|---|
| **B1. 正式啟用 Gemini Embedding 語意搜尋（跑完 6 步 SETUP）** | **P0** | S | 整套程式碼已 ship 半年沒人按按鈕；現在 100 工具到位，語意搜尋對使用者落地價值最高。**唯一缺**：使用者花 10 分鐘執行 SETUP_EMBEDDINGS.md。建議在 admin dashboard 加按鈕「🚀 一鍵啟用 Gemini Embedding（會跳轉 SETUP 步驟）」做引導 |
| **B2. ToolIndexAI 搜尋熱詞回灌實際接到 fuse.js 加權** | **P1** | M | v3.6.34 已收 `analytics/toolIndexQueries`，但只用在「範例 query chips」更新。可進一步：高頻 query 對應的工具自動 boost weight。需要小 ML pipeline，或人工 review top 20 query 後改 `popularQueries.ts` |
| **B3. 「找不到匹配」自動連到許願池 + 預填使用者 query** | **P0** | S | 目前「沒找到」只顯示「去許願池」連結；改成「點按鈕 → /wish?q=該 query 自動預填」。把搜尋失敗轉成許願池 input，閉環 |
| **B4. 推薦結果加「點按率 / hover 看更多」事件** | **P1** | M | ToolIndexAI 結果卡點擊後上報 `tool_index_result_click({ query, tool_id, rank })`，後續可看：哪些 query 排第 1 但實際不被點（表示 ranking 錯）→ 反饋給 B2 加權 |
| **B5. ToolIndexAI mobile UX 大改：query suggestion bar + recent searches** | **P1** | S | 目前手機 query chips 9 個塞在搜尋框下方很擠；改成水平捲動 chip rail + localStorage 存最近 5 次搜尋（含可清除 X）|
| **B6. 「相關工具」改用 embeddings 算 cosine top 5** | **P2** | M | 目前 BulletinRelatedTools 用 fuse 比對 tags + title；embedding 啟用後改用 cosine 相似度精準度躍升 |
| **B7. 把 embeddings 算的結果與 fuse 結果 A/B 對照給 admin 看** | **P2** | M | 後台一個 debug 頁同時跑兩種策略給同一 query，並排顯示 top 5，方便 tuning 與寫 blog |

---

### 📊 階段 C — 觀測 / 分析 / 後台 Dashboard 升級（v3.6.49 ToolFlow 之後）

> v3.6.49 剛開啟工具點擊細粒度事件記錄，這是後續所有資料分析的基礎。可接著做的方向。

| 項目 | 優先級 | Effort | 說明 |
|---|---|---|---|
| **C1. 細粒度事件 7 天熱榜全站化** | **P0** | M | 既有 `useToolClickStats` deltas7d 是用「歷史快照差值」估算；改成從 `toolClickEvents` 真實 aggregate（更準）+ 後台「7 日急上升」面板可看到 referrer / device 分佈 |
| **C2. 「跨工具流量路徑」分析** | **P1** | L | 同 sessionId 點了哪幾個工具的序列（如：#100 索引 → #46 場地預約 → #81 駕駛艙）→ 找出最常見的 user journey。前端 sessionId 已有，後端 `toolClickEvents` 已收，只差 aggregate query |
| **C3. 後台「最易掉到 0 的工具」健康度看板** | **P1** | M | 找出 30 天 0 點擊的工具（可能命名差 / 沒對到場景）→ 列清單給作者 review 是否該下架、改名、或寫 blog 引流 |
| **C4. blog `blog_read_complete` 完讀率 dashboard** | **P0** | S | v3.6.37 已收 D1 IntersectionObserver 事件；補一個 admin panel 看「完讀率 = blog_read_complete / blog_read」，找出哪些長文中段流失最多 |
| **C5. blog TOC 點擊熱圖 dashboard** | **P0** | S | v3.6.37 已收 D2 `blog_toc_click` 事件；後台用 BarChart 列每篇文章 top 5 章節，回饋未來文章結構設計 |
| **C6. PWA 安裝 / 解除安裝率 + iOS PWA 引導觸發轉換率** | **P1** | M | v3.6.35-2 已加 iOS PWA prompt；補上「prompt 出現 → 使用者 dismiss vs 真的安裝」事件，量化引導效果 |
| **C7. Sentry / 錯誤監控接入** | **P0** | S | v3.6.48 PWA chunk self-heal 是 reactive 機制；補上 Sentry 把 self-heal 觸發次數打給 admin，知道哪些 deploy 後 chunk hash 飄移最多 |
| **C8. 後台「站長日報」LINE 推送** | **P1** | S | 每天早上 9 點 LINE 推 admin：昨日訪客 / 評論 / 許願 / 工具點擊 top 3 / 異常告警。所有資料源已就緒，只差排程 Cloud Function（cron） |
| **C9. 「假流量警報」detection** | **P1** | M | 某工具突然單日點擊暴增 10×→ 推 LINE 警報（可能被爬蟲 / DDoS / 同學起鬨）。已有 `referrer / device / country` 資料可做 |
| **C10. 把 GA4 接到 Looker Studio 做 viz** | **P2** | M | GA4 報表介面差，搬到 Looker Studio 用 BigQuery export 做精美 dashboard，可分享給家長 / 校長看 |

---

### 📚 階段 D — 部落格平台升級（基於 v3.6.39 雜誌特刊 + v3.6.36-37 三欄重構）

> 部落格從「附屬功能」變成「站內第二大流量入口」，可繼續深化。

| 項目 | 優先級 | Effort | 說明 |
|---|---|---|---|
| **D1. 內文圖片支援 + lightbox** | **P0** | M | 目前 markdown 不貼圖，加 `![alt](url)` 支援 + lazy load + 點圖放大覆蓋層 + caption。注意 LCP 第一張圖要 `fetchpriority="high"`。**很多工具 blog 沒圖實在可惜** |
| **D2. 範本擴散到 30 篇精選長文** | **P0** | L | POST_53 / 81 / 46 / INDEX_AI 已是範本（含 callout + stat-grid）；可挑剩餘 95+ 篇逐步補。每篇 15-30 分鐘人工抓重點，效益是整套文章質感升一檔。**可優先做最受歡迎 top 10 / addedAt 最近 10 篇** |
| **D3. 文末「下載 PDF」按鈕** | **P0** | S | 用 `window.print() + @media print` CSS，按 `pdf-export-print-best-practice` skill 做。**老師最愛印下來貼班級公佈欄** |
| **D4. Print stylesheet 細節** | **P1** | S | 列印時隱藏左欄 / 右欄 TOC / hero emoji / Tour 提示，文章單欄黑白排版 |
| **D5. 文章互相 internal linking（自動算 related 3-5 篇）** | **P1** | M | 跟 BulletinRelatedTools 同邏輯但作用在 blog；提升內部 link density + Google PageRank。tags 重疊度 + 同分類 +0.15 bonus |
| **D6. 「最近 7 天熱讀」徽章** | **P1** | M | 用 `blog_read` 事件 aggregate，top 3 文章貼便利貼徽章 |
| **D7. 「估剩餘時間」浮動標籤** | **P1** | S | 根據捲動位置 + 字數估「還剩 ~2 分鐘」顯示在左欄進度條下方 |
| **D8. Drop cap 首段大寫首字 toggle** | **P1** | S | CSS 已寫好 `.dropcap`；加全站 toggle 或預設給長文用（≥1000 字才套） |
| **D9. Dark mode 適配 blog-article.css** | **P1** | M | 目前 `.bp-*` class 沒對 dark mode；其他頁有 `.high-contrast`，未來統一補上 |
| **D10. C3 AI assist 找適合塞 callout 段落** | **P2** | L | 寫好文章送 LLM 分析，產出「這 3 段適合塞 .callout--tip」「這段數字適合做 stat-grid」建議，人工確認 |
| **D11. RSS feed 內文升級** | **P2** | S | 目前 feed.xml 只有 excerpt；補上完整 body 後給 reader app 完整閱讀 |
| **D12. 章節間隔手繪插圖** | **P2** | L | 每節結尾隨機顯示一個阿凱手繪插圖（hr 進階版）。需要美術素材 |
| **D13. MDX 替代 markdown** | **P2** | L | 未來想直接寫 `<Callout>` React 元件而非 HTML 字串，可考慮遷到 MDX。影響整套渲染管線，需評估 chunk size 與 hydration 成本 |

---

### 🔍 階段 E — SEO / 搜尋引擎 / 國際化（100 工具的可發現性）

| 項目 | 優先級 | Effort | 說明 |
|---|---|---|---|
| **E1. 重啟 Bing Webmaster Tools + 提交 sitemap** | **P0** | S | Google 已接（v3.6.33）；Bing 也接一下，台灣家長用 Edge 預設搜 Bing 的不少 |
| **E2. 站內每個工具補 FAQ schema** | **P1** | M | 每個工具的 detailedDescription 抽 3-5 個 Q&A → JSON-LD FAQPage。Google 結果頁能展開常問列表，CTR 大幅提升 |
| **E3. HowTo schema for blog** | **P1** | M | 部分長文（如 #81 駕駛艙、#46 場地預約）是 step-by-step，加 HowTo schema → Google 結果頁出現「3 steps to...」rich snippet |
| **E4. Video schema（若做 A3 紀念片 + YouTube 嵌入）** | **P1** | S | 嵌入 YouTube 後對應頁面加 VideoObject schema |
| **E5. og:image 大張化（1200×675 / 1200×800）測 LINE 卡片比例** | **P1** | S | LINE 偏好 16:9，FB 偏好 1.91:1；測哪個比例分享出去最大張、不被裁切 |
| **E6. 補 alternate hreflang（zh-TW + zh-Hant + zh）** | **P1** | S | 避免 Google 把繁中當簡中索引，每個關鍵頁加 `<link rel="alternate" hreflang="zh-TW">` |
| **E7. 英文版 i18n `/en/...`（給國際教師同行）** | **P2** | L | 翻譯成本高；可先翻 top 10 工具卡 + 1 篇「100 tools made by an elementary teacher in Taiwan」英文長文當引子 |
| **E8. 站內搜尋（toolsAndBlog 跨表搜尋）** | **P1** | M | 現在 BlogList 搜 blog、首頁搜 tools，分開兩處；做一個 `Cmd+K` 全站搜尋 palette 同時找工具 + blog（fuse.js 已會用）|

---

### 🎨 階段 F — UI / UX / 視覺一致性深化

| 項目 | 優先級 | Effort | 說明 |
|---|---|---|---|
| **F1. 全站 Dark mode（首頁 + 工具卡 + 詳情頁 + admin）** | **P1** | L | 目前只有 high-contrast 模式，沒真正 dark mode。cork 風配 dark 不直觀，需重新設計色票（深 cork = 巧克力色？）|
| **F2. Hero 區「100 工具達成」動態 sticker swap** | **P0** | S | 跟 A5 整合：30 天內顯示金色「100 達成」貼紙；之後改「100+ 工具 ⭐」常駐 sticker |
| **F3. 首頁 BulletinDeploymentEcosystem 圖示化（不只文字 count）** | **P1** | M | 5 平台改成 icon + 進度條 + hover popover 顯示代表工具 3 個 |
| **F4. 工具卡 hover preview（拍立得翻面顯示功能截圖）** | **P1** | M | 拍立得 hover 後 flip 顯示工具實際截圖 + 2-3 個 key feature bullet。已有 1024×1024 preview 資料，動畫即可 |
| **F5. 7 大分類顏色系統 review + 統一 design token** | **P1** | S | 目前 cork / blog / OG / category badge 各有自己的色票；統一到 `tailwind.config` + CSS vars |
| **F6. 拍立得卡進入視窗 stagger fade-in** | **P2** | S | IntersectionObserver + 50ms stagger，視覺戲劇性。注意 prefers-reduced-motion |
| **F7. 自製 emoji / 圖示替代第三方 lucide-react** | **P2** | L | 目前 icon 用 lucide-react，未來想全自製手繪風 SVG icon set 對齊整站手作感 |

---

### 🛡️ 階段 G — 技術債 / 維運穩定度 / 工程效率

| 項目 | 優先級 | Effort | 說明 |
|---|---|---|---|
| **G1. 清理 working tree 7+ 個 _diag*.py / _zhrun*.bat / page25_*.html 暫存檔** | **P0** | S | `git status` 看到 .tmp_tool26.html、_diag.py、_zhrun.bat、handoff/、design_handoff_*tmp/ 等 untracked 雜物；統一移到 `.scratch/` + 加進 .gitignore |
| **G2. 把 functions/lib/*.js 從版控移出（functions deploy 會 build）** | **P0** | S | `functions/lib/dailySnapshot.js` 等已 build 產物還在版控；加進 `.gitignore` 並從 git rm --cached 移除 |
| **G3. CI 加 `firebase deploy --only firestore:indexes` 自動部署** | **P0** | S | v3.6.50 indexes 入版控了，但目前要手動 deploy。GitHub Actions 加一步：merge 到 main 後跑 indexes deploy |
| **G4. 把 design_handoff_*tmp/ 目錄完整移到 handoff/ 集中管理** | **P0** | S | 設計交接包散在 root 目錄很亂；統一 `handoff/{topic}/` |
| **G5. Lighthouse CI 真正啟用 performance threshold（之前設 0）** | **P1** | M | v3.6.30 設 perf 門檻 = 0 因為 CI 跑分太不穩；改用「7 天滑動平均」當 baseline，比過去 7 天平均退步 10% 就 fail |
| **G6. Visual regression test (Percy / Chromatic)** | **P1** | L | 首頁 + 工具詳情 + blog post 三個關鍵頁加快照測；之後重構 UI 不怕誤改視覺 |
| **G7. Functions cold start 監控 + 預熱 cron** | **P1** | M | `embedQuery` / `getToolFlowAnalysis` 等少用函式 cold start 3-5 秒；加 cron 每 5 分鐘 ping 預熱（成本可忽略） |
| **G8. firestore.rules 加 unit test (firebase rules unit testing)** | **P1** | M | rules 改動風險高；加 emulator-based unit test 確保 admin / anon / signed-in 三種身份的權限正確 |
| **G9. PWA cache 策略 review（avoid stale-while-revalidate 對 HTML）** | **P1** | M | v3.6.35 / v3.6.48 都在打 chunk 漂移問題；根本解是 SW 對 HTML 走 network-first，按 `pwa-cache-bust` skill |
| **G10. Tools.json 改 SSR 或 build-time inline 進 HTML** | **P2** | M | 目前 100 工具 JSON 是 client fetch；改 SSR 預塞 first contentful 工具卡列 → LCP 大幅改善 |
| **G11. Vite plugin: bundle size budget 失敗 CI** | **P2** | S | 設 main bundle ≤ 400KB、route chunk ≤ 200KB；超過 CI fail，逼自己拆 chunk |
| **G12. 把 client + functions 拆 monorepo（pnpm workspace）** | **P2** | M | 目前 client + functions + scripts 同 package.json 衝突會打架；pnpm workspace 整理依賴 |

---

### 💎 階段 H — 新功能擴展（從工具集 → 教學生態）

> 真正的長尾價值在這 — 工具到 100 是起點，後續可朝「教師社群 / 教案平台 / AI 助手」三個方向擴張。

| 項目 | 優先級 | Effort | 說明 |
|---|---|---|---|
| **H1. 「許願池 → 真的做出來」追蹤管線** | **P0** | M | 許願池 → 開 GitHub issue → commit close → 推 LINE 通知許願者「你的願望實現了」+ blog 記錄。完整閉環體驗超有黏著度 |
| **H2. 站內 AI 助手（小聊天框，問教學情境推工具）** | **P1** | L | #100 是「丟一句 query 推 top 5 工具」靜態頁；H2 是「LLM 對話：阿凱老師我需要這樣的工具，可不可以推薦？」用 Gemini + 工具 embeddings 做 RAG。比 #100 更會聊天 |
| **H3. 教師回饋表單 + 站內公告** | **P1** | M | 目前評論散在每個工具下；做一個「教師牆」收所有評論 + 月度精選 + 阿凱回覆。形成社群感 |
| **H4. 「想用看看 demo」沙箱模式（不留資料）** | **P1** | L | 對需要登入的工具（如 #84 會議記錄 Pro），加「無痕 demo 模式」用測試帳號 5 分鐘體驗，降低使用門檻 |
| **H5. 工具發布日程 / RoadMap 公開** | **P1** | S | 公開「下個月即將上線」3-5 個工具預告 + 開發進度條，建立期待 + 早期回饋 |
| **H6. 「老師共創」入口（投稿其他老師做的工具）** | **P2** | L | 接其他國小老師作品 → 開放投稿 → review 後加進工具集（標 contributor）。從個人作品集 → 教育界共建 |
| **H7. 工具 API 化（給第三方教學平台引用）** | **P2** | L | 把工具核心（如 #45 文字雲、#100 索引）API 化，給其他教學系統 embed |
| **H8. 自訂教學主題包（A4 列印整套）** | **P2** | M | 選工具 → 自動拼成 A4 教師活動手冊 PDF + 學習單 + 評量。一鍵下載整套 |
| **H9. 親子家長端 LINE 官方帳號** | **P2** | L | 家長加 LINE → 推送：學生本週用了哪些工具、阿凱老師新出什麼。從學生端跨進家長端 |
| **H10. 工具影片教學庫（每工具一支 30 秒）** | **P2** | L | 用 Heygen / 阿凱錄製，每工具 30 秒短片，學生看完直接用。100 支內容很多，可分批做（一個月做 10 支） |

---

### 🚦 建議起跑順序（如果要排優先做）

**🥇 本週（A 段 + 收尾）**：A2（紀念 OG）→ A1（紀念長文）→ A5（banner 延長）→ A7（README badge）→ G1/G2/G4（清掉 working tree 雜物）

**🥈 兩週內（高 ROI quick wins）**：D1（blog 圖片）→ D3（PDF 下載）→ B3（找不到 → 許願池）→ C4/C5（既有事件 dashboard 化）→ E1（Bing 提交）→ F2（100+ sticker）→ G3（indexes auto deploy）

**🥉 第一個月（基礎強化）**：B1（Gemini Embedding 啟用）→ D2（範本擴散 top 10）→ A4（廣播 + 社群）→ C1（細粒度熱榜全站化）→ C7（Sentry 接入）→ G9（PWA cache network-first）

**🚀 第二三月（新方向）**：H1（許願閉環）→ E2/E3（FAQ + HowTo schema）→ C2（跨工具流量路徑）→ A3（紀念短片）→ D9（Dark mode for blog）

**🌌 半年後再評估**：H2（AI 對話助手）→ H6（老師共創）→ E7（英文版）→ G10（SSR / Tools.json inline）

---

### 📌 量化目標建議（給未來 6-12 個月）

| 指標 | 現況（推估） | 6 個月目標 | 12 個月目標 |
|---|---|---|---|
| 工具總數 | 100 | 110-115 | 120-130 |
| 手寫長文總數 | 99 | 110+ | 130+ |
| 月活訪客 (DAU/MAU) | 待 Web Vitals + GA 累積 | +50% | +200% |
| Google 索引頁數 | ~300 | 500+ | 800+ |
| 排行榜冠軍工具點擊數 | #81 駕駛艙 555+ | 1500+ | 3000+ |
| Lighthouse perf p75 (RUM) | 待補 | LCP < 2.5s | LCP < 2.0s |
| 評論累計 | 個位數 | 50+ | 200+ |
| 許願池兌現率 | ~70% | 80% | 85% |
| 跨平台連動（LINE / FB / IG） | 0 | 1 個 | 3 個 |
| 累積網誌總字數 | ~100K | 150K | 250K |

---

### 💌 給自己的一句話

從 2024 年第 1 個工具到 2026 年 5 月 24 日的第 100 個 — 中間有：
- 數十次 deploy 失敗 → 修復 → 再 deploy
- 多次 Firestore rules 漂移 → 規則重寫 → 補測試
- PWA cache stale → 三層 self-heal
- 100 工具不是平地長出來，是一個一個踩坑、一個一個 commit 累積的

**100 之後，不再追數量，追深度。**  
讓每個工具背後都有一篇好故事、一群真實受惠的老師、一個被認真記錄的場景。  
這條路慢慢走，能走得久。

---

## 🧭 客群推薦精靈 — 未來優化與可開發功能 Roadmap（v3.6.89 起）

> 依 v3.6.89「人氣加分 + 熱門保底席」的基礎，列出可接續開發的方向。
> 每項標 **P0 / P1 / P2 優先級** + **Effort（S/M/L）** + **預期效益**，挑著做即可。
> P0 = 影響最大或 quick win，建議近期；P1 = 中期可做；P2 = 大型或實驗性。
> 核心檔案：`client/src/lib/audienceRecommendation.ts`（演算法）、
> `client/src/components/audience/`（wizard UI）、`client/src/lib/audienceProfile.ts`（型別/欄位）。

### 🟥 P0（近期、高效益或 quick win）— ✅ 全數完成於 2026-07-10（commit [`b6a1510`](https://github.com/cagoooo/Akai/commit/b6a1510)）

| 編號 | 項目 | Effort | 狀態 | 落地方式 |
|---|---|---|---|---|
| **P0-1** | 推薦卡片顯示「為什麼推」徽章 | S | ✅ 完成 | `AudienceRecommendationResults.tsx` 依 slot + 痛點命中顯示 🎯命中需求 / 🔥熱門排行 / 👤貼近職務 / 📚同學段 / ✨為你發掘 / ⭐廣受好評，走 cork 便利貼視覺 |
| **P0-2** | 啟用 painPoints 痛點匹配（最大個人化槓桿） | M | ✅ 完成 | wizard 新增「你最想解決什麼」複選步驟（教師 8 選／學生 6 選、上限 3），命中 `audienceFit.painPoints` 每個 +22（上限 2）。班級小管家等工具改由情境浮現 |
| **P0-3** | 近 7 日竄升（trending）訊號 | S–M | ✅ 完成 | `deltas7d` 合併成 `tool.recentClicks`，加 sqrt trending 加分（權重 20）；熱門保底席改用混合熱度（累計 + 2×近 7 日），新爆紅工具不必等累計追上就能露出 |
| **P0-4** | 推薦成效埋點（沒量測就無法調權重） | S | ✅ 完成 | results 曝光發 `audience_reco_impression`、點擊發 `audience_reco_click`（含 segment / slot / rank / matched_pains）。**下一步：P1-6 用這批資料做 admin dashboard** |

### 🟧 P1（中期可做）

| 編號 | 項目 | Effort | 說明與預期效益 |
|---|---|---|---|
| **P1-1** | **「換一批 / 看更多推薦」** | M | 一次只給 6 個，使用者想多看沒得看。加「再推 6 個」翻頁（第 7–12 名）或「換一批」重洗（保底席換人）。讓探索感更強、也讓長尾工具有曝光機會。 |
| **P1-2** | **學生端細分（年級 + 興趣科目）** | M | 目前學生端是 `if (audience==='student') return true` —— 全部 student-eligible 工具照丟，零個人化（連 `schoolLevel` 都沒用）。加「低／中／高年級」+「喜歡的科目」問題，配 `schoolLevels` 與科目 tag 過濾。需先替遊戲/學習類工具補年級與科目標籤。 |
| **P1-3** | **結合「最近使用」去重 + 探索** | S–M | `useRecentTools` 已在收「最近用過的工具」。推薦時把已用過的降權或標「你用過」，把版面留給沒探索過的工具，避免每次都推同幾個。 |
| **P1-4** | **推薦權重集中成 config 常數表** | S | `POPULARITY_WEIGHT=28`、role `+30`、dept `+25`、stage `+15`、reason `+10` 目前散在 `rankTool` 內。抽成一張有註解的 `WEIGHTS` 常數表，日後調參一目了然、也方便 P0-4 的資料驅動校準。 |
| **P1-5** | **新工具 freshness 曝光期加分** | S | 新上架工具若 `priority` 不高就永遠沉底。給「上架 N 天內」的工具一段時間衰減的 freshness bonus，讓新品有保證曝光窗口。需要工具帶首次上架日期（可從 tools.json 補 `addedAt` 或用 id 遞增近似）。 |
| **P1-6** | **分眾推薦成效 admin dashboard** | M–L | ✅ **完成於 2026-07-10**（commit [`e62bec2`](https://github.com/cagoooo/Akai/commit/e62bec2)）。精靈曝光/點擊在 GA 之外同步聚合寫進 `analytics/recoStats`（`recordRecoImpression` / `recordRecoClick`，nested increment）；admin 儀表板新增「推薦」分頁 `RecommendationStatsPanel`：KPI（總曝光/點擊/CTR/痛點佔比）、分眾表、slot 點擊分布、工具被推薦成效（橘底標記「常被推卻沒人點」）。形成「量測→調權重→再量測」閉環。 |

### 🟦 P2（大型 / 實驗性）

| 編號 | 項目 | Effort | 說明與預期效益 |
|---|---|---|---|
| **P2-1** | **相似客群協同過濾**「用了 A 的老師也用了 B」 | L | 依真實使用資料算工具共現，做「同溫層推薦」。需要足夠的使用量與 session 級資料，屬於資料成熟後的進階玩法。 |
| **P2-2** | **推薦結果存成「我的工具箱」跨裝置同步** | M–L | 讓使用者把推薦結果收藏成個人工具箱，登入後跨裝置同步（Firestore）。從「一次性推薦」變成「長期個人化入口」。 |
| **P2-3** | **權重 A/B test 自動選優** | L | 同時跑多組權重，用 CTR 自動選最佳組合。需要 P0-4 埋點 + P1-6 dashboard 打底。 |
| **P2-4** | **LLM 動態生成個人化推薦理由** | L | 目前 reason 是每個 fit 靜態寫死。改由 LLM 依 segment 動態生成更貼切的一句話（如「身為國小科任，這個計時＋分組工具能無縫接上你的課堂節奏」）。有 API 成本，需評估。 |

### 🎯 建議的落地順序（若要一條龍做）

1. **先做 P0-1 + P0-4**（各 S）：徽章讓推薦更好懂、埋點讓後續調參有依據 —— 一個 session 內可完成。
2. **再做 P0-2 痛點匹配**（M）：最大的個人化升級，直接讓「6 個推薦」貼近真實需求。
3. **接 P0-3 trending**（S–M）：補齊「熱門 = all-time + 竄升」雙訊號。
4. 之後依 dashboard（P1-6）看到的真實 CTR，決定 P1 其餘項目的優先序。

## 🧭 客群推薦精靈 — 第二波 Roadmap（v3.6.90 之後）

> 第一波（v3.6.89–90）已完成：人氣加分、熱門保底席、痛點匹配、trending、徽章、埋點、分眾成效 dashboard。
> 以下是「有了量測基礎後」重新排序的第二波。每項標優先級 + Effort（S/M/L）+ 效益。
> 核心檔案：`client/src/lib/audienceRecommendation.ts`、`client/src/components/audience/`、
> `client/src/components/admin/RecommendationStatsPanel.tsx`、`client/src/lib/analytics.ts`。

### 🟥 P0（第二波）— ✅ 全數完成於 2026-07-11（commit [`b718e20`](https://github.com/cagoooo/Akai/commit/b718e20)）

| 編號 | 項目 | Effort | 狀態 | 落地方式 |
|---|---|---|---|---|
| **P0-A** | 修正曝光重複計數 | S | ✅ 完成 | 曝光去重從 `impressionRef` 改成 **sessionStorage**（依 profile 簽章）→ 關開精靈、上一步返回、dev StrictMode 重掛都只計一次。瀏覽器實測 back→forward 同 profile `totalImpressions` 維持 1 |
| **P0-B** | 痛點感知的推薦理由 | S–M | ✅ 完成 | 命中痛點的卡片理由改為點名所選痛點（「對應你想解決的『班級經營』：…」），與 🎯 命中需求 徽章名實相符。新增 `PAIN_POINT_LABELS` |
| **P0-C** | 權重集中成 config 表（原 P1-4 升級） | S | ✅ 完成 | 7 個權重從 `rankTool` 內聯抽成有註解的 `WEIGHTS` 常數表（純重構，既有分數斷言全不變），方便對照 dashboard CTR 調參 |
| **P0-D** | dashboard 加「近 7 日」時間維度 | M | ✅ 完成 | `recordReco*` 加寫 `daily.{YYYY-MM-DD}` buckets（imp/clk/painClk）；`RecommendationStatsPanel` KPI 加「全部／近 7 日／近 30 日」切換，可對照調權重前後 CTR。明細表維持累計並標註 |

### 🟧 P1（中期可做）

| 編號 | 項目 | Effort | 說明與預期效益 |
|---|---|---|---|
| **P1-1** | 「換一批 / 看更多推薦」 | M | 一次只給 6 個。加「再推 6 個」（第 7–12 名）或「換一批」重洗保底席。增強探索、給長尾工具曝光。 |
| **P1-2** | 學生端細分（年級 + 興趣科目） | M | 學生端仍是 `return true` 全給、零個人化。加低/中/高年級 + 科目興趣，配 `schoolLevels` 與科目 tag。需先替遊戲/學習類工具補年級與科目標籤。 |
| **P1-3** | 結合「最近使用」去重 + 探索 | S–M | `useRecentTools` 已在收。把用過的降權或標「你用過」，版面留給沒探索過的工具。 |
| **P1-5** | 新工具 freshness 曝光期加分 | S | 新品若 priority 不高就沉底。給「上架 N 天內」時間衰減 bonus（`tool.addedAt` 已有欄位可用）。 |
| **P1-7** | **持久化「為你推薦」首頁條**（新增） | M–L | 精靈完成後 profile 已存 localStorage，但只用在「一次性 modal」。改成在首頁常駐一條「為你推薦」橫幅（用已存 profile 即時算），把一次性引導變成每日回訪都有的個人化入口。**讓精靈的投資產生長期價值。** |
| **P1-8** | **精靈完成率 / 跳過率漏斗**（新增） | S–M | 目前只量到「看到 results 之後」的 CTR，量不到「多少人開了精靈卻中途關掉」「痛點步驟多少人略過」。每個 step 補一個輕量埋點，dashboard 加一個漏斗，找出流失在哪一步。 |

### 🟦 P2（大型 / 實驗性）

| 編號 | 項目 | Effort | 說明與預期效益 |
|---|---|---|---|
| **P2-1** | 相似客群協同過濾「用了 A 也用了 B」 | L | 依真實使用共現做同溫層推薦。需資料量成熟。 |
| **P2-2** | 推薦結果存成「我的工具箱」跨裝置同步 | M–L | 從一次性推薦變長期個人化入口（可與 P1-7 合流）。 |
| **P2-3** | 權重 A/B test 自動選優 | L | 同時跑多組權重、用 CTR 自動選最佳。**P0-C（權重集中）+ P0-D（時間維度）+ P1-6（dashboard）就位後才可行。** |
| **P2-4** | LLM 動態生成個人化推薦理由 | L | reason 由 LLM 依 segment + 痛點動態生成（P0-B 的進階版）。有 API 成本，需評估。 |
| **P2-5** | **dashboard 洞察 → 半自動調權重建議**（新增） | L | dashboard 讀出「某工具常被推卻沒人點」後，自動給出「建議把 priority 從 X 降到 Y」或「reason 改寫」的操作建議，甚至一鍵套用。把閉環最後一哩自動化。 |

### 🎯 建議的落地順序（若要一條龍做）

1. **先做 P0-A**（S）：修曝光重複計數，先確保剛建好的 dashboard 數字可信 —— 沒這步後面調參都在錯誤數據上做。
2. **再做 P0-C + P0-D**（S + M）：權重集中 + 時間維度，把「調權重閉環」真正打通。
3. **接 P0-B**（S–M）：痛點感知理由，讓「命中需求」名實相符、提升 CTR。
4. 之後看 dashboard 的真實 CTR 與 P1-8 漏斗，決定 P1-7（首頁常駐推薦）與其餘 P1 的優先序。
