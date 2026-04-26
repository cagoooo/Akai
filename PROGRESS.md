# 阿凱老師教育工具集 - 開發進度與歷史紀錄

## 🎯 當前版本狀態
- **當前版本**: `v3.6.6`
- **最後更新狀態**: 一週連發 4 版，徹底修好統計準確性 — 加上評論 LINE 通知、匿名認證、全站訪客追蹤、本地歷史回填工具。

## 📌 完成功能總覽

### `v3.6.6` (最新 · 本地歷史回填工具)
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
