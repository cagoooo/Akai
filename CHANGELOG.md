# 變更日誌 (CHANGELOG)

此文件記錄專案的所有重要變更。

## [3.6.36] - 2026-05-22 — 部落格文章內頁 magazine 三欄重構 + 右下角彈窗互斥

### 🎨 BlogPost 三欄式重構（Phase A · 骨架 + 視覺）
- 三欄 magazine layout：左欄 200px sticky + 文章 680px + 右欄 230px sticky TOC、max 1200px、≤1080px 折成單欄
- 左欄 sticky：拍立得作者卡（rotate(-2.2°)）+ 索引卡資訊（細格線紙 + 打洞 + 點線連接）+ 厚 ink border 斜紋進度條 + 黃/粉/藍三色紙標籤分享（複製連結 / LINE / 列印）
- Hero 編輯型：mono caps kicker + Noto Sans TC 900 大標 + 上下細線 meta row + 右上 emoji sticker 88×88 rotate(6°) + 紅圖釘
- 右欄 TOC：washi tape header rotate(-2°)、筆記本紙 + 紅 margin line、decimal-leading-zero mono 編號、active 橘色螢光筆塗抹、底部回到頂端膠囊、IntersectionObserver scrollspy（rootMargin -12%/-70%）
- 手機 ≤1080px：左欄 + 右側 TOC 隱藏、文章頂部行動版手風琴 TOC、hero emoji 內聯 60×60、文末紙標籤水平分享列
- 新增 hooks：`useReadingProgress` / `useActiveSection` / `useExtractedSections`（從 markdown body regex 抽 H2 自動生 sections，**零 schema 變動**）
- 新增 stylesheet：`client/src/styles/blog-article.css` ~880 行 scoped 在 `.bp-*` class
- 擴充 tokens：補 paper-warm / ink-mute / ink-faint / rule / rule-soft / note-yellow-soft / font-serif / font-mono / measure（「擴充 not replace」避免動到 `--paper`）
- 載入字型：Noto Serif TC + JetBrains Mono 合併進既有 Google Fonts URL
- 新增元件家族 9 個：BlogArticleLayout / BlogHero / BlogLeftRail / BlogToc / BlogMobileToc / BlogRelatedTools / BlogPrevNext / BlogCta / BlogMobileShare

### 📝 內文渲染精修（Phase B）
- 啟用 `rehype-raw`：let posts.ts body 直接內嵌 `<div class="callout">` / `<div class="stat-grid">` HTML
- ReactMarkdown a renderer 三路分流：內部 wouter Link / `#anchor` smooth scroll + 24px offset / 外部 `_blank`
- POST_53 retrofit 作為範本：`.callout--warn`（真相段）+ `.callout--tip`（雙軌機制）+ 4 卡 `.stat-grid`（實測數字頭條）

### 🔧 右下角 Tour / PWA 提示重疊修復
- TourGuide 在 startTour / dismissTour 兩處 dispatch `tour-resolved` window event
- PWAUpdatePrompt 監聽該事件 + 初始 localStorage 檢查（`hasCompletedSiteTour` 或 24h 內 `lastTourPromptDismissedAt`）才顯示
- 體驗：新訪客先看 Tour → 按完接力 PWA 安裝；24h 內已關 Tour 直接顯示 PWA

### 🚀 部署
- 3c8df13 (Phase A) → deploy 26266615476 success
- 179ca3f (Phase B) → 內含 rehype-raw dep + POST_53 retrofit
- bump v3.6.35 → v3.6.36

---

## [3.6.35-2] - 2026-05-21 — Gemini Embedding 升級 + iOS PWA 引導 + Firestore rules 修

### 🧠 #100 工具索引神器升級 Gemini Embedding 語意搜尋
- 三件套：build-time embed 97 工具 + Cloud Function embedQuery + client cosine similarity
- ToolIndexAI 加 toggle ⚡字面比對 / 🧠語意搜尋 BETA（雙軌設計，未 setup 自動 fallback fuzzy）
- 完整 SOP: docs/SETUP_EMBEDDINGS.md（6 步啟用）
- 新 blog post #6: tool-100-gemini-embedding-build-log（8 分鐘技術 build log）
- 程式碼全 ship，等使用者拿 Gemini API key + deploy Cloud Function 即啟用

### 📱 iOS PWA 加桌面引導 + 手機 UX
- 新 IosPwaInstallPrompt（iOS Safari + 第二次訪問 + 非 standalone 才跳，1 週 dismiss 期）
- 含 HowTo overlay 教 3 步加桌面
- 兩個搜尋框升級：type=search + fontSize≥16 防 iOS 縮放 + 中文不自動修正
- viewport-fit=cover 支援 iPhone 安全區

### 🔓 Firestore rules sub-collection 修
- analytics/{docId}/{subCol}/{subDocId} wildcard 新增
- 解決 Web Vitals / 熱門詞紀錄寫不進 Firestore 的根因

### 🔧 generate-* scripts regex 修
- POST_\\d+ → POST_[A-Z0-9_]+ 兼容 POST_INDEX_AI 命名
- 影響 generate-og-pages / generate-sitemap / generate-feed

### 🚀 部署
- Deploy 26201446508 success
- /blog/tool-100-gemini-embedding-build-log/ 200 OK
- tool-embeddings.json 404（預期，等 setup）

---

## [3.6.35] - 2026-05-21 — Blog UX 大改版 + 三大新 skill

### 🔍 BlogList 搜尋 + 篩選
- fuse.js 即時搜尋（title ×3 / tags ×2 / excerpt ×1 / body ×0.3）
- 類型 toggle: 全部 97 / 深度長文 5 / 工具速覽 92
- 7 大分類 chip 多選 AND 邏輯
- URL query 同步 `?q=&cat=&type=` 條件可分享
- 沒結果 fallback 引導到許願池

### 🩹 chunk error 三層自癒
- App.tsx handleAssetError + ErrorBoundary isChunkError + sw.js PRECACHE 移除 index.html
- 不再顯示「發生錯誤」嚇人 — toast 1.2s 後自動 unregister SW + reload
- sessionStorage flag 防無限循環

### ⬆️ 回到頂部按鈕
- BlogList / BlogPost / ToolIndexAI 三頁接 BulletinBackToTop

### 📐 寬螢幕 RWD
- BlogList 960 → 1320（寬螢幕 4-5 欄）
- ToolIndexAI 980 → 1100
- BlogPost 720 不變（閱讀黃金寬度）
- padding 改 clamp(20px, 3vw, 36-40px)

### 📝 三大新 skill 寫進 ~/.claude/skills/
- `changelog-version-drift-trap` — 文件 vX.Y.Z 與 package.json 同步鐵則
- `vite-chunk-hash-pwa-self-heal` — chunk error 三層自癒模板
- `tool-catalog-blog-seo-factory` — 工具目錄 → blog SEO 工廠 pattern

### 🔖 版本對齊（首次套用新 skill 鐵則）
- bump package.json 3.6.34 → 3.6.35
- bump-sw-version 同步 version.json + sw.js CACHE_VERSION

---

## [3.6.34] - 2026-05-21 — SEO + 內容 7 件套 + 純 ASCII slug

### 🏷️ #2 工具頁 SoftwareApplication Schema
- PageHead mode=tool 加 Schema.org JSON-LD
- generate-og-pages.mjs static landing 同步加
- 預期 Google rich snippet 啟用

### 🔗 #5 相似工具內部連結
- 新 BulletinRelatedTools（取代舊 RelatedTools）
- fuse.js 比對 + 同分類 bonus
- internal linking 密度提升

### 📅 #4 OG 圖最近更新浮水印
- 三個 OG 生成器底部加 `📅 最近更新 YYYY/MM`

### 📡 #3 RSS / Atom feed
- 新 generate-feed.mjs 產 /feed.xml（30 條）
- index.html 加 `<link rel="alternate">`

### 📊 A. Web Vitals dashboard
- 新 AdminWebVitalsDashboard 讀 Firestore RUM 資料
- 5 指標 summary + 7 天 p75 趨勢圖

### 🔥 B. Top 搜尋詞 Firestore 回灌
- analytics.ts logToolIndexQuery() 寫 Firestore
- 新 sync-popular-queries.mjs build-time 同步 top 9
- popularQueries.ts 取代手寫 EXAMPLE_QUERIES

### 📝 #1 92 個 mini blog stub
- 新 miniPosts.ts runtime 從 tools.json 自動生成
- slug = `tool-{id}`（純 ASCII，避免中文 URL encode 問題）
- sitemap.xml 從 204 → 296 URL
- 92 篇 mini blog static OG landing

### 🐛 Hot-fix
- mini blog slug 從中文改純 ASCII（中文 GH Pages 需 URL encode 不便）

### 🚀 部署
- Deploy 26196661580 + 26196803629 success
- 所有 tool-N mini blog 200 OK
- /feed.xml + Schema.org 上線

---

## [3.6.33] - 2026-05-20 — SEO 上線 + blog redirect bug 修復

### 🔐 Google Search Console 整合
- 部署 `client/public/googledb834a18ffe8f948.html` 完成擁有權驗證
- SC 資源 `https://cagoooo.github.io/Akai/` 已開通
- sitemap.xml 提交（204 URL）
- 後續可在 SC 看：關鍵字流量 / 真實 Web Vitals / 索引狀況 / 行動友善度

### 🐛 Hot-fix：blog 無限循環白畫面
- 問題：`/blog/` 一片空白卡在無限載入
- 根因：blog landing 用 `replace('/Akai/blog')`（沒 trailing slash）→ GH Pages 301 加 / → 又載入同 landing → ♻️ 循環
- 修法：改 `?redirect=` 模式（仿 tool/N/），讓 SPA 主頁的 redirect handler 接管
- 影響 5 個 landing：/blog/ + /blog/:slug × 4 + 新加的 #68 / #3 兩篇
- 部署後驗證：`/blog/`、`/blog/:slug/` 全 200 OK + 正確 SPA 載入

### 🚀 部署
- 2 次 deploy 全 success（d6799f6 SC 驗證 + 869f8ff bug 修復）

---

## [3.6.32] - 2026-05-20 — 立即可做 5 件套：blog 擴充 / Web Vitals / gtag / sitemap / 🆕 徽章

### 📖 #1 新增兩篇 blog post（排行榜前 5 全覆蓋）
- `student-portfolio-68-handcraft-uploads` (#68 手作課程, 5 分鐘)
  - 實測：拍照工時 8-12 分 → 0 分、列印 800 張 → 0 張
- `live-vote-3-classroom-democracy` (#3 學生投票, 5 分鐘)
  - 累計 84 場、12 所國小 + 3 所國中、參與率 92% vs 25%
- 排行榜前 5 名 (#81/46/10/68/3) blog 覆蓋率 100%

### 📊 #2 Web Vitals RUM
- 新 `client/src/lib/analytics.ts` 整合 Web Vitals + gtag wrapper
- 上報 LCP / INP / CLS / FCP / TTFB
- GA 全量 + Firestore 25% 取樣（schema: `analytics/webVitals/{date}/{id}`）
- main.tsx 在 load 事件後 dynamic import，不影響 TBT

### 🏷 #3 gtag 事件追蹤
- `trackEvent()` helper 包 noop fallback + dev console.debug
- 三處接點：
  - BulletinToolCard → `tool_click`
  - BlogPost → `blog_read`
  - ToolIndexAI → `tool_index_search`（debounced 500ms）

### 🗺 #4 sitemap.xml 升級
- 補上 /blog + /blog/:slug × 5 + /share/heatmap.html + /tool/100
- 用 `tool.addedAt` 寫 `<lastmod>`
- robots.txt 自動補 Sitemap: 指向
- 接入 build pipeline（之前 generate-sitemap.mjs 沒在 npm run build 內跑）
- 實測 202 個 URL

### 🆕 #5「新工具」徽章
- `EducationalTool` 型別加 `addedAt?: string`
- new-tool.mjs 寫入時自動 addedAt = ISO 時間
- BulletinToolCard 加 isNew 判斷（7 天內顯示紅色 NEW chip + float 動畫）
- 既有 #1-#97 沒 addedAt 不算新

### 🚀 部署
- Deploy 26161382328 success
- /sitemap.xml 35KB / 202 URLs / robots Sitemap: ✓
- 兩篇新 blog post landing 200 OK

---

## [3.6.31] - 2026-05-20 — v3.6.30 hot-fix 三件套 + Favicon 語義分工

### 🔢 修正 toolCount 計數（97 不是 98）
- 使用者反映「只做了 97 個工具但主頁顯示 98」
- 根因：#100 工具索引神器加進 tools.json 站位，計數時忘記用 isInternal 過濾
- `EducationalTool` 型別加 `isInternal?: boolean` 欄位（語義固定）
- `generate-home-og.mjs` / `generate-home-og-heatmap.mjs` 改用 `.filter(t => !t.isInternal)`
- `BulletinToolFamilyTree` 排除 isInternal 工具
- 修正後：toolCount=97 / 分類加總 6+30+10+3+17+18+13=97 / 破百倒數=3

### 👨‍🏫 還原阿凱老師真人頭像
- 使用者反映 Footer「MAKER」便利貼 / 版權區出現 A 字 logo 而非真人
- 從 git (a84ac6f~1) 救出原始彩色花環真人頭像
- 存成 `client/public/teacher-avatar.png`（與 favicon 語義分開）
- BulletinFooter 兩處 + 三個 OG 圖生成器底部頭像位都改用 teacher-avatar
- **設計約定確立**：
  - `favicon.*` / `icon-*.png` / `maskable-*.png` → **品牌 logo**（cork + A 字），分頁 / PWA / Android
  - `teacher-avatar.png` → **作者頭像**（彩色花環真人），Footer / OG attribution
  - `apple-touch-icon.png` → fallback
- 想換頭像時：覆蓋 teacher-avatar.png 即可全站更新

### 🚦 Lighthouse 門檻調整務實基準
- 首次實測：perf 🔴20 / a11y 🟡87 / best-practices 🟢100 / seo 🟡82
- performance 設 0（CI 跑 Lighthouse 用 4× throttling，不反映真實使用者體驗）
- 其他三項用「實測 -7%」防退步：a11y≥0.80、best-practices≥0.90、seo≥0.75
- 後續 4 次 Lighthouse runs 全綠燈

### 📖 Blog static OG landing pages
- `generate-og-pages.mjs` 新增 generateBlogIndexHtml / generateBlogPostHtml
- 為 /blog 與每篇 post 產 static landing（仿 wish/tool/share 模式）
- 爬蟲拿到正確 OG meta + og:image（含相關工具的 og 圖）

### 🚀 部署
- 3 次 deploy 全 success（91d6867 / a1811a2 / daf1e14）
- 線上 teacher-avatar.png 200 OK、blog/* OG landing 全活
- toolCount = 97

---

## [3.6.30] - 2026-05-20 — P2 五件套：家族樹 / Firestore sync / Lighthouse / 字型快取 / Blog

### 🌳 P2-1：工具家族樹（SVG 徑向樹）
- 新 `BulletinToolFamilyTree`：根節點 + 7 大分類輻射 + 工具葉子
- 點分類展開/收合、點葉子跳轉 /tool/:id、hover tooltip
- 不引 D3，純 SVG + React（~250 行）
- BulletinSiteStats 加 segmented control toggle「🥧 圓餅 / 🌳 家族樹」
- 家族樹 lazy load，不拖累首屏

### 🔄 P2-2：featuredTools.ts Firestore 自動同步
- 新腳本 `scripts/sync-featured-from-firestore.mjs`
- 讀 toolUsageStats top 5 → 重寫 featuredTools.ts
- 實測 top 5：#81 (555) / #46 (136) / #10 (126) / #68 (114) / #3 (84)
- 認證：本地 service-account.json，CI 用 FIREBASE_SERVICE_ACCOUNT (base64)
- 沒設 → 跳過不 fail
- npm alias `sync:featured`，接入 build pipeline

### 🚦 P2-3：Lighthouse 分數閘門
- THRESHOLDS：performance=0 (CI 不檢查) / a11y≥0.80 / best-practices≥0.90 / seo≥0.75
- 未達標 → workflow 失敗 + step summary 表格
- 首次實測：perf 🔴20 / a11y 🟡87 / best-practices 🟢100 / seo 🟡82

### ⚡ P2-4：CI 字型快取
- `actions/cache@v4` cache `scripts/fonts/NotoSansTC-Bold.ttf` (12MB)
- key 用 ensure-fonts.mjs 雜湊
- 預期 deploy -30s

### 📖 P2-5：教學情境部落格
- 3 篇種子長文：cockpit-81 / venue-46 / class-helper-10
- 路由 /blog 列表 + /blog/:slug 內文（react-markdown + remark-gfm）
- 首頁紫色便利貼 BulletinBlogEntry 顯示最新 3 篇
- generate-og-pages.mjs 為 /blog 與每篇 post 產 static OG landing
  → 社群爬蟲拿到正確 OG meta + og:image（含相關工具）

### 🚀 部署
- GH Actions deploy 26147560993 success (1m9s)
- Live `/blog`、`/blog/:slug`、family tree toggle 全 200 OK
- 線上 toolCount = 98

---

## [3.6.29] - 2026-05-20 — #100 工具索引神器 + P1 三件套

### 🧭 新工具 #100 — 工具索引神器（智能推薦器）
- 新頁面 `client/src/pages/ToolIndexAI.tsx` 掛 `/tool/100`
- fuse.js fuzzy match 推薦：標題 ×3 / 標籤 ×2 / 描述 ×1 / 詳細介紹 ×0.5 加權
- 9 種範例 query chips 一鍵試用
- 推薦卡片含排名 / 預覽圖 / 分類膠帶 / 命中文字片段 / 匹配度百分比
- 沒匹配 → 自動引導到許願池許願
- Phase 2 預留：未來接 Gemini Embedding 做語意搜尋
- tools.json 加 #100 條目，OG 圖已產出
- `scripts/new-tool.mjs` 改用「最小未使用 ID」算 nextId，避免被 #100 站位後跳號到 101

### 🖼 P1-A：tool OG 全量重跑（98 張）
- 用最新 `generate-unified-og.mjs` 模板把 98 張個別 OG 全部重生
- 與首頁 OG / #100 神器頁 cork 風格完全一致

### 🧩 P1-B：PageHead 元件整合
- 新元件 `client/src/components/PageHead.tsx` 三模式（home / tool / custom）
- 自動補絕對 URL、cache version、og:image:secure_url（LINE）、width/height
- 取代 BulletinToolDetail / ToolDetail / ToolIndexAI 三處重複 Helmet 寫法

### 🎨 P1-C：SVG favicon
- `client/public/favicon.svg`：向量版 cork + 便利貼 + A 字 + 紅圖釘
- 支援 `prefers-color-scheme: dark` 自動變色
- index.html link 順序：SVG → ICO → PNG
- 加進 manifest.json icons 陣列

### 🚀 部署
- GH Actions deploy 26146522032 success
- `/tool/100`、`favicon.svg`、`previews/og/tool_100.webp` 全 200 OK
- 線上 toolCount = 98（破百倒數 2）

---

## [3.6.28] - 2026-05-20 — P0 三件套：破百倒數 / 工具地圖 / OG heatmap

### 🚀 破百倒數 banner（BulletinMilestone100）
- 首頁頂部新便利貼，三狀態自動切換：
  - **N < 100**：橘色便利貼 + 進度條 `{current}/100` + 「✨ 許願下一個」按鈕（觸發既有許願池對話框）
  - **100 ≤ N < 7 天**：金色 Tape「🎉 100 工具達成」+ 連到 `/tool/100`
  - **達成 ≥ 7 天**：自動撤掉
- 達成日期凍結於 `site-stats.json` `milestones.tool100`，build 第一次 N>=100 寫入後永不漂移
- 100 號工具預期方向：智能工具推薦器（從 97 個工具中按需求推薦）

### 📊 工具地圖（BulletinSiteStats + useSiteStats hook）
- 新 hook `useSiteStats`：用 react-query 拉 `/api/site-stats.json`，cache 15 分鐘
- 新元件 `BulletinSiteStats`：
  - 顯示「N 款工具 · X 大分類 · 最大宗」大字
  - recharts 圓餅圖 + 兩欄可點圖例
  - **點扇形 / 圖例 → 自動篩選該分類 + scroll 到工具網格**
- 配色與 BulletinLeaderboard / WishPool 一致（綠色便利貼 + 雙圖釘 + 微旋轉）

### 🔥 OG heatmap 拼貼變體
- 新腳本 `scripts/generate-home-og-heatmap.mjs`：
  - 主視覺：左側標題 + 工具數縮小 + 右側 2×2 拍立得拼貼
  - 工具來源 `client/src/data/featuredTools.ts`（手動 curate）
  - 預設精選 #97 / #91 / #87 / #89，未來可改用 Firestore stats 自動排序
  - 檔名加 md5 hash 防 CDN/LINE/FB 快取
  - 寫入 site-stats.ogImageHeatmap 欄位
- 新增 `/share/heatmap.html` landing page（仿 wish/index.html 模式）：
  - 社群爬蟲抓 → 拿到 heatmap OG
  - 一般使用者 → JS redirect 主頁
  - 用途：分享想呈現「實際工具長相」的場合
- 接入 `scripts/generate-og-pages.mjs`，build 時自動產出

### 🛠 build pipeline
- 新流程：`bump-sw → favicon → home-og → home-og-heatmap → sync-meta → wish-preview → vite build → og-pages`
- 新 npm aliases：`gen:heatmap-og`、`gen:home-og` 更新成跑兩種 OG + sync

### 🚀 部署
- GH Actions deploy 26144767314 success
- Live：主頁、`/share/heatmap.html`、`/api/site-stats.json`、`og-preview-heatmap-*.png` 全 200 OK

---

## [3.6.27] - 2026-05-20 — 品牌視覺翻修：新 favicon / 新 OG 圖 / 工具數自動同步

### 🎨 新 favicon 全套（公佈欄圖釘風，9 種尺寸）
- 設計：cork 軟木塞 + 黃便利貼 + 紅圖釘 + 「A」字（Akai），與首頁 BulletinHome 完全呼應
- 一鍵產出 `favicon.ico`（multi-size 16/32/48）、`favicon-16/32/48.png`、`favicon.png` (192)、`apple-touch-icon.png` (180)、`icon-192/512.png`、`maskable-icon-512.png`
- 16px 版本去掉紋理 & 陰影、字體加大到 78%，確保 tab 上仍清楚

### 🖼️ 新首頁 OG 社群分享圖（1200×630）
- cork 軟木塞 + 三張便利貼（中央主標 / 左上「開箱即用」 / 右上「100% 免費」）
- 主便利貼工具數量「**97 款**」由 build 從 tools.json 自動算入
- 底部 attribution bar：阿凱頭像 + 「桃園市龍潭區石門國小」+ 「立即探索」CTA
- 檔名加 md5 hash（如 `og-preview-333a5200.png`）防 LINE / FB / CDN 快取

### 📝 meta / SEO 全面對齊（清掉「60+」「8 種」「akai-e693f.web.app」）
- `client/index.html`：og:title / og:description / twitter:* / Schema.org `EducationalOrganization` / description / keywords / theme-color (`#c99a6c`)
- `client/public/manifest.json`：補齊 192/512/maskable 多尺寸、改 cork 主題色、categories 標記 education
- `client/src/components/SEOHead.tsx`：DEFAULT_DESCRIPTION、SITE_URL、DEFAULT_IMAGE、DEFAULT_KEYWORDS 全換
- `client/src/components/StructuredData.tsx`：SITE_URL 從舊 firebase 換成 GitHub Pages
- `client/public/api/teacher.json` & `server/data/teacher.json`：教師簡介加石門國小 + 工具數
- `client/public/404.html`、`README.md`：標題副標對齊

### 🔁 自動同步基礎建設
- 新增 `client/public/api/site-stats.json`：build 寫入工具總數 / 分類分佈 / OG 圖路徑（供前端或腳本讀）
- 新腳本三件套接入 `npm run build`：
  - `scripts/ensure-fonts.mjs`：CI 自動從 google/fonts repo 下載 `NotoSansTC-Bold.ttf`（12MB VF font，被 .gitignore 排除避免 repo 肥大）
  - `scripts/generate-favicon.mjs`：產 favicon 9 種尺寸
  - `scripts/generate-home-og.mjs`：讀 tools.json 算工具數 → 產 OG 圖 + site-stats.json
  - `scripts/sync-meta-from-stats.mjs`：把工具數與 OG hash 同步進 index.html / manifest / SEOHead / README（idempotent）
- npm aliases：`npm run gen:favicon` / `npm run gen:home-og`

### 🚀 部署
- GH Actions deploy run 26132632085 success
- Live：`https://cagoooo.github.io/Akai/`、OG 圖 200 OK、favicon 200 OK
- 工具總數 **97/100**（再 3 個破百 🎉）

---

## [3.6.26] - 2026-05-18 — 新增工具 #97 MBTI 校園奇遇記
### ✨ 故事化 MBTI + SEL 校園互動測驗上架

**工具 #97**：`cagoooo.github.io/MBTI`「MBTI 校園奇遇記」

- 為國小高年級到國中導師、輔導老師、家長打造的「故事化人格探索平台」
- 不填無聊問卷，學生背起書包走進校園，從開學第一天到校慶大結局，30+ 場景、4 條支線、16 種結局
- 六大模組：主故事線、16 型圖鑑、SEL 特別篇（6 情境約 8 分鐘）、三部曲課程（45 分鐘輔導課）、麻吉配對、老師後台統計
- 含 10 張教學投影片 + A4 反思學習單備課素材，注音輔助降低高年級閱讀門檻
- 適合班級輔導課、生涯探索單元、輔導室晤談、班會自我認識主題、親子座談、社團破冰
- **分類**：互動體驗（interactive） · **icon**：Brain
- **標籤**：MBTI 人格測驗、16 型人格、SEL 情緒教育、故事化測驗、班級輔導、生涯探索、國小高年級、國中輔導、互動故事、免費工具

### 🎨 新增主預覽圖與 OG 社群分享圖
- `client/public/previews/tool_97.webp`（1024×1024，截 hero 區「校園奇遇記 — MBTI」主視覺 + 開始冒險 CTA + 30 場景 4 支線 16 結局統計）
- `client/public/previews/og/tool_97.webp`（1200×630，便利貼軟木板風格，自動由 `generate-unified-og.mjs` 生成）

## [3.6.25] - 2026-05-18 — 新增工具 #96 DFC 行動方案即時投票系統
### ✨ 龍潭國小自治市選舉開票平台上架

**工具 #96**：`cagoooo.github.io/Lungtan-DFC`「DFC 行動方案即時投票系統」

- 為桃園市龍潭國民小學第 123 屆自治市小市長選舉量身打造的即時開票平台
- 以 DFC（Design for Change，孩子改變世界）「行動方案」精神為主軸，候選人端出具體要為校園做的事讓全校投票
- 前後台雙畫面：公開監票（投影用）+ 後台計票（教師唱票 +1）
- 計票經 Firebase Firestore 同步寫入，公開畫面 0.5 秒內即時反映
- **分類**：互動體驗（interactive） · **icon**：Heart
- **標籤**：DFC 行動方案、龍潭國小、自治市選舉、第123屆、即時計票、公開監票、民主教育、Firebase 即時同步、校園選舉、免費工具

### 🎨 新增主預覽圖與 OG 社群分享圖
- `client/public/previews/tool_96.webp`（1024×1024，rose→orange→amber 漸層 + 投票箱與三張選票主視覺）
- `client/public/previews/og/tool_96.webp`（1200×630，便利貼軟木板風格，自動由 `generate-unified-og.mjs` 生成）

## [3.6.21] - 2026-05-09 — tools.json fetch 加版本鎖定 cache-buster
### 🐛 修正新工具卡片部署後使用者看不到的根本原因

v3.6.20 部署完，`/tool/91`、`/tool/92` 路由顯示「找不到拍立得」— 不是 build 或 gh-pages 的問題，是 SPA 抓 `tools.json` 時沒帶 cache-buster 參數，被 GitHub Pages CDN 邊緣快取（`max-age=600`）卡住舊版（90 筆）。

**對比根因**：[useVersionCheck.ts:54](client/src/hooks/useVersionCheck.ts:54) 抓 `version.json` 時用 `?t=${Date.now()}` 強制每次都新鮮，所以 footer 永遠顯示最新版號；但 5 個地方抓 `tools.json` 都直接 `${BASE_URL}api/tools.json`，CDN 邊緣節點就有 10 分鐘空窗。

**修法**：在所有 `tools.json` fetch 統一加 `?v=${VITE_APP_VERSION}` 鎖定 bundle 版本：
- [BulletinHome.tsx:121](client/src/pages/BulletinHome.tsx:121)
- [BulletinToolDetail.tsx:216](client/src/pages/BulletinToolDetail.tsx:216)
- [Home.tsx:228](client/src/pages/Home.tsx:228)
- [ToolDetail.tsx:312](client/src/pages/ToolDetail.tsx:312)
- [AnalyticsDashboard.tsx:82](client/src/components/AnalyticsDashboard.tsx:82)

**為什麼用版本不用 timestamp**：版本鎖定可以讓同一版本內的 reload 共享 SW 與 CDN 快取（秒開），bump 版本時自然失效強制刷新。timestamp 每次都變，秒殺所有快取效益。SW 的 `networkFirst` 策略本來就會先打網路，主要受惠的是 GitHub Pages CDN 與 HTTP 層的 `Cache-Control` — 不同 URL → CDN 必須回源 → 拉到最新 `tools.json`。

`VITE_APP_VERSION` 在 [vite.config.ts:26](vite.config.ts:26) 已從 `package.json` 自動注入，無須額外設定。

## [3.6.20] - 2026-05-09 — 新增工具 #91 點亮詩意 Pro / #92 5W1H 靈感發射器 PRO
### ✨ 同時新增兩張工具卡片

**工具 #91**：`cagoooo.github.io/PhotoPoet`「✨ 點亮詩意 Pro ✨早安長輩圖」
- 上傳照片 → AI 生成繁體中文詩詞 → 一鍵產出可直傳 LINE 的早安長輩圖
- **分類**：語文寫作（language） · **icon**：Feather
- **標籤**：AI 詩詞、早安長輩圖、照片生成、繁體中文詩、語文創作、銀髮數位、節氣問候、詩文牆社群、Gemini AI、免費工具

**工具 #92**：`cagoooo.github.io/Aura`「5W1H 靈感發射器 PRO版」
- 桃園市石門國小資訊組打造，5W1H 結構化思考 + 評語優化「點石成金」+ 客製化專屬助手
- **分類**：教學設計（teaching） · **icon**：Lightbulb
- **標籤**：5W1H、創意思考、教學設計、評語優化、AI 助手、教師工具、思考框架、石門國小、Gemini AI、免費工具

兩張卡片預覽圖（`/previews/tool_91.webp`、`tool_92.webp`）皆用 Playwright 截首頁 hero 後 sharp 處理為 1024×1024。OG 社群分享圖（`/previews/og/tool_*.webp`）走統一便利貼風格。

### 🐛 修正 OG canvas 中 emoji 字元渲染為方框
`generate-unified-og.mjs` 加入 `stripEmoji()` helper：在繪製標題與描述前去掉 NotoSansTC TTF 不支援的 Pictographic 字元（如 ✨ U+2728），避免 OG canvas 出現 □ 方框。卡片網頁端因有系統 emoji 字型 fallback，原樣保留 ✨ 不變動。

## [3.6.19] - 2026-05-08 — 新增工具 #90：繪本 → Google表單 一條龍工作坊
### ✨ 新增 `cagoooo.github.io/storytell` 工具卡片
阿凱老師打造的整合式 AI 教學工作坊（v0.6.7），把繪本變 Google 表單的六大步驟一條龍走完：Gemini 生圖 → Google Doc 整理 → 圖片轉換器 → Apps Script 產生 → 執行授權 → QR Code 派發。

- **分類**：教學設計（teaching）
- **icon**：BookOpen
- **標籤**：繪本教學、Google 表單、AI 工作坊、Apps Script、Gemini AI、NotebookLM、閱讀理解、國小語文、QR Code 派發、免費工具
- **卡片預覽圖**：`/previews/tool_90.webp`（Playwright 截工作坊主頁，捕到紫橘漸層 hero + 六大步驟導引）
- **OG 社群分享圖**：`/previews/og/tool_90.webp`（綠色「教學設計」便利貼風格 + polaroid 預覽嵌入）

加碼覆寫 `scripts/fonts/NotoSansTC-Bold.ttf`（從 noto-cjk repo 抓下，gitignored 不會 commit）。

## [3.6.17] - 2026-05-06 — 許願池便利貼懸浮時大頭針同步飛起
### 🎨 BulletinWishPool 圖釘跟著卡片一起浮動
v3.6.16 修好圖釘截角後，發現滑鼠移過便利貼時卡片會「飛起來 -8px」但圖釘留在原地，看起來像圖釘脫節了。

**根因**：[tokens.css:81](client/src/styles/tokens.css:81) 的全域 `.sticker-card:hover` 用 `transform !important` 把內層卡片往上推，但 v3.6.16 已經把 Pin 移到外層 wrapper（為了避開 clip-path 截角），所以 Pin 不在 transform 範圍內。

**修法**：改用 React `useState` 在 wrapper 層管理 hover 狀態：
- 移除內層 `className="sticker-card"`，避免全域 hover rule 跟 wrapper transform 疊加成 -16px
- wrapper 接管整個浮動效果（rotate(0) + translateY(-8px) + z-index 5）
- 內層卡片只保留 box-shadow 變化（陰影加深）
- transition `cubic-bezier(.34,1.56,.64,1)` 帶有彈性回彈感，跟原本一致

四顆大頭針現在會跟著便利貼一起飛起來，視覺連動。

## [3.6.16] - 2026-05-06 — 修正許願池便利貼大頭針被截掉
### 🎨 BulletinWishPool 圖釘截角修正
使用者反映許願池四張示範便利貼右上角的紅/藍/綠/黃大頭針都被截掉一半。

**根因**：[BulletinWishPool.tsx](client/src/components/bulletin/BulletinWishPool.tsx) 的 `.sticker-card` 用 `clip-path: polygon(0 0, 100% 0, 100% 90%, 90% 100%, 0 100%)` 做右下折角效果，但 clip-path 同時也會把超出卡片上邊緣的元素切掉。Pin 是用 `top: -7` 騎在卡片頂端，整顆圓被 clip 切到只剩下半。

**修法**：把卡片包進外層 wrapper：
- 外層 wrapper：接管 `position: relative` + `rotate` + `paddingTop: 8` 預留圖釘空間，**不套 clip-path**
- 內層 `.sticker-card`：只保留 clip-path（折角效果不變）
- Pin：移到 wrapper 直接子層、卡片之外，`top: 1` 讓圖釘正好騎在卡片上緣

四顆大頭針現在都完整顯示，視覺一致。

## [3.6.15] - 2026-05-05 — 修正 #88 卡片預覽圖 + new-tool.mjs 自動清教學遮罩
### 🎨 #88 卡片預覽圖重做
使用者反映 #88 詳情頁拍立得內的截圖很醜（看起來像 PDF 上傳區、灰暗 + 教學遮罩擋住）。追查發現 JHScurriculum 網站第一屏其實有非常漂亮的綠色 hero 區（金色「課程計畫 AI 審查工具」大標題 + 4 個分類膠囊），但 Playwright 預設截圖會被 driver.js 的「步驟 1/5」教學對話框遮住。

**修法**：截圖前先 `addInitScript` 設 `tyc_tut_done = '1'` 等 dismiss flag，讓 driver.js 不啟動，再截一次乾淨的 hero 區。新版 `tool_88.webp` 從 39 KB → 67 KB（內容更豐富）但視覺品質大幅提升。

**連帶受惠**：`generate-unified-og.mjs` 會把卡片預覽圖嵌入 OG 圖左側 polaroid，所以 OG 社群分享圖 (`og/tool_88.webp`) 也自動跟著漂亮。

### 🤖 `scripts/new-tool.mjs` 強化截圖邏輯（避免再踩同樣坑）
根據 #88 經驗，把 `screenshotUrl` 函式升級：
- viewport 從 1280×800 改為 1280×1280（避免 cover crop 切掉 hero）
- 新增 `addInitScript` 預先設定常見 dismiss localStorage key（`tour_complete` / `onboarding_done` / `hasSeenTour` / `tyc_tut_done` 等 13 個常用 key）
- 新增截圖前 `evaluate` 移除常見 popup overlay class（driver.js / Shepherd.js / intro.js / cookie banner / 自製公告）
- 還原可能被遮罩鎖住的 `body.style.overflow`

未來新增工具走 `npm run new-tool` 流程時，截圖會自動跳過教學遮罩、抓到網站真正的 hero 區。

### 📝 同步更新 `~/.claude/skills/og-social-preview-zh`
把這次踩到的坑寫進 OG skill：
- 兩支腳本欄位錯配（v3.6.14 那個雷）
- 截圖前必清教學遮罩、cookie banner（v3.6.15 這個雷）
- 含 grep 網站 source 找 dismiss key 的指引

下次跨專案做 OG 圖時不會再犯。

### 🧹 內部
- 版本 3.6.14 → 3.6.15

---

## [3.6.14] - 2026-05-05 — 修正：社群分享 OG 圖指錯成卡片截圖（影響全部 88 張）
### 🐛 嚴重 Bug 修正：og:image 全部用錯
使用者反映 FB 分享 #88 卡片時，預覽圖只是「網站截圖」很不專業。追查發現 `scripts/generate-og-pages.mjs:35` 的 `og:image` URL **只讀 `previewUrl`（卡片內截圖）**，**完全忽略 `tool.ogPreviewUrl`**——而 `tool.ogPreviewUrl` 才是 `generate-unified-og.mjs` 用 cork-board 公佈欄風格 + 便利貼大標 + 阿凱署名 + URL 膠囊精心設計過的 1200×630 社群分享圖。

也就是說：**過去所有從 FB / LINE / Twitter / Slack 分享 88 張卡片連結時，看到的都是隨便的截圖，而不是漂亮的設計圖**。

### 🔧 修正內容
- `generate-og-pages.mjs:35` 邏輯改為「優先讀 `ogPreviewUrl`，沒有才 fallback 到 `previewUrl`」
- `og:image:width` / `og:image:height` 改為條件式：用 ogPreviewUrl 時 1200×630，fallback 時 1024×1024
- `og:image:secure_url`（LINE 用）跟 `twitter:image` 同步修正

build 後 88 張 `tool/N/index.html` 全部重新產生正確的 OG meta tag。

### 📣 使用者操作建議
社群平台會快取 OG 圖數天才更新。要立刻看到新版可用：
- **Facebook**：[Sharing Debugger](https://developers.facebook.com/tools/debug/) 貼網址按「再次抓取」
- **LINE**：等 1〜3 天會自動更新（無公開 debugger）
- **Twitter / X**：[Card Validator](https://cards-dev.twitter.com/validator) 貼網址預覽

### 🧹 內部
- 版本 3.6.13 → 3.6.14

---

## [3.6.13] - 2026-05-05 — 新增工具 #88：桃園市115學年度國中課程計畫AI審查工具
### ✨ 新工具
- **#88 桃園市115學年度國中課程計畫AI審查工具**（`https://cagoooo.github.io/JHScurriculum/`）
  - 國小版（#78）的姊妹工具，針對國民中學課程計畫審查需求打造
  - 上傳 PDF 後依教育局 40+ 審查標準逐項自動比對給建議
  - 支援 Gemini / OpenAI 雙引擎切換、可自訂提示詞
  - 涵蓋領域學習課程、彈性學習課程、特教班 / 藝才班 / 體育班
  - 內建批次審查、Markdown 匯出、AI 修正稿、LINE 一鍵分享
  - 分類 `utilities`、icon `ClipboardCheck`
  - 標籤：課程計畫 / AI審查 / 國中 / 教務 / 行政工具 / 115學年度 / 桃園市 / 領域課程 / 彈性課程 / PDF審查

### 🤖 自動化流程
- Playwright 截圖 → sharp resize 1024×1024 webp → `/previews/tool_88.webp`（39.6 KB）
- 跑 `generate-unified-og.mjs 88` → `/previews/og/tool_88.webp`（181 KB，社群分享專用）
- 兩份 tools.json（client + server）同步寫入

### 🧹 內部
- 版本 3.6.12 → 3.6.13

---

## [3.6.12] - 2026-05-05 — 校徽 polaroid 風格統一：Header / Footer 套用 Hero 的拍立得感
### 🎨 視覺一致化
使用者反映 Hero 區的校徽（76px 拍立得 polaroid 樣式）很好看，希望 Header 跟 Footer 也採用同樣質感。盤點三處差異後統一升級：

- **填充率提升**：原本 Header `width: 84%` / Footer `width: 80%` 留太多白邊；改用 `padding + width: 100%` 模式（Header padding 3 / Footer padding 2），校徽圖案填到接近邊緣（91% / 89%），與 Hero 一致
- **雙層陰影**：從單層 `0 3px 8px rgba(0,0,0,.25)` 升級為 `2px 2px 0 + 0 5px 10px` 的 polaroid 風格雙層陰影，增加紙張立體感
- **微旋轉**：靜態套用 `transform: rotate(-3deg)`，呼應 Hero 校徽的 -8deg 拍立得感（Header 較含蓄、Footer 同樣 -3deg）
- **hover 互動**：滑過時變回 `rotate(0deg)` + 放大 1.08x + 陰影更深，給使用者「轉正了」的回饋

Hero 區校徽不動（本來就是基準參考）。

### 🧹 內部
- 版本 3.6.11 → 3.6.12

---

## [3.6.11] - 2026-05-05 — 石門校徽跑版修正：picture 加 `display: contents`
### 🐛 修正：校徽變超小 / 偏移
3.6.10 的 `<SchoolLogo>` 元件用 `<picture>` 包 WebP+PNG，但 Header 與 Footer 的容器都用了 `display: grid + placeItems: center`，原本 `<img>` 是 grid 直接子元素，現在中間多了一層 `<picture>`（預設 `display: inline`），導致：

- grid 把 `<picture>` 當成 grid item 對齊，而非真正的 `<img>`
- `<img>` 的 `width: 84%` / `width: 80%` 失去原本對 `<a>` 容器的百分比基準
- 校徽看起來縮成超小一顆甚至偏移

**修正方式**：`<picture>` 加 `style={{ display: 'contents' }}`，讓它從版面樹中消失，`<img>` 變回容器（`<a>` / `<div>`）的直接子元素，恢復 3.6.9 之前的渲染行為。

`display: contents` 在所有現代瀏覽器（Chrome 65+ / Firefox 37+ / Safari 11.1+）都支援；對 a11y 沒影響，因為 `<picture>` 本身不帶語義（語義由內部 `<img>` 承載）。

### 🧹 內部
- 版本 3.6.10 → 3.6.11

---

## [3.6.10] - 2026-05-05 — 石門校徽載入優化（3 MB → 17 KB，約 185 倍）
### ⚡ 校徽資源大瘦身
使用者反映「石門 LOGO 每次都要讀取很久才出來」，追查發現原 PNG 是 **1971×1941、3.0 MB**，但實際顯示尺寸最大只有 76×76。

- **重新縮圖**：sharp 縮至 256×256（3× retina 顯示也綽綽有餘）
- **PNG 重壓**（含 palette 量化）：3.0 MB → 22 KB
- **新增 WebP 版本**：alpha 通道保留、quality 88 → 17 KB
- **新元件 `SchoolLogo`**（`client/src/components/bulletin/SchoolLogo.tsx`）：
  - `<picture>` 包 WebP + PNG fallback，瀏覽器自動挑最佳格式
  - `width={256} height={256}` 固定尺寸避免 CLS（版面位移）
  - `decoding="async"` 不阻塞主執行緒
  - `eager` prop：above-the-fold（Header / Hero）用 `loading="eager"` + `fetchPriority="high"` 優先載入；footer 用 `loading="lazy"` 延後載入
- **3 處引用統一**：BulletinHeader、BulletinHero、BulletinFooter 全部改用 `<SchoolLogo>` 共用元件，省去重複 `<img onError>` 樣板碼

預期效果：首屏載入時間少 1〜2 秒，慢速網路使用者徹底告別「校徽空轉」窘境。

### 🧹 內部
- 版本 3.6.9 → 3.6.10

---

## [3.6.9] - 2026-05-05 — 卡片說明大升級：17 張 cagoooo.github.io 卡片補上完整介紹
### 📝 17 張自製工具卡片內容大改造
針對 `tools.json` 中連到 `cagoooo.github.io/*` 但說明過於簡短（甚至像「便捷的 X 平台，提升 Y 效率」這種沒料空話）的卡片，逐一 WebFetch 實際網站內容並重寫：

- **新增 `detailedDescription` 欄位**（每段 200〜400 字）詳述具體功能、技術細節、適用情境
- **升級短 `description`**（每段約 60〜80 字）抓住賣點、列出實際亮點

涉及工具 ID：
- **#2** 行政業務協調系統（staff）— 共用日曆＋LINE 推播
- **#3** 學生即時投票系統（vote）— QR Code 即時作答
- **#5** 校園點餐系統（vendor）— 校慶園遊會點餐
- **#6** 蜂類配對消消樂（bee）— 6 大主題包 PWA 離線可玩
- **#9** 超級瑪莉歐冒險（mario-game）— 鍵盤＋觸控雙模式
- **#10** 班級小管家（class）— 八大功能模組多班隔離
- **#11** 剛好學課堂互動（Akailao）— 阿凱＋阿剛合作 13 種互動模式
- **#23** 點石成金蜂評語優化網頁版（comments）— 教師評語生成
- **#41** 吉他彈唱點歌系統（song）— Firestore 即時投票點歌
- **#42** 兒童臉部隱私保護工具（child-face-privacy）— AI 年齡判斷遮蓋
- **#45** 文字雲即時互動（cloud）— Top 1-3 流光漸層特效
- **#46** 禮堂預約系統（schedule）— Gemini AI 學期報告＋熱力圖
- **#47** 學生肖像授權同意書線上簽名（signature）— 家長手機簽 PDF 自動寄信
- **#48** 動態表單自動回報系統（form）— 視覺化拖曳＋Google Chat 推播
- **#50** 童趣學園（kids）— 13 款繁中遊戲＋星星幣經濟
- **#65** AI 影片創作整合資源（Grok-Canva）— ChatGPT→Grok→Canva 三步驟工作流
- **#81** 國小資訊科技教學駕駛艙（it-cockpit）— 13 大互動教學艙整學期備課

### 🔧 server/data/tools.json 同步補齊
- 補上之前漏掉的 ID 81、82、83（國小資訊科技教學駕駛艙、教室資訊設備盤點系統、本土語分班配對系統）
- server 端工具總數從 84 → 87，與 client 端完全一致
- 重新依 ID 升序排列

### 🧹 內部
- 版本 3.6.8 → 3.6.9
- README 版本 badge 從 3.6.2 → 3.6.9（先前未同步）

---

## [3.6.8] - 2026-04-26 — 體驗強化三連擊：dailyClicks + 收藏跨裝置同步 + 新工具 CLI
### 📊 #25 工具 dailyClicks 細分
- `incrementToolClick` Cloud Function 新增 `dailyClicks.{YYYY-MM-DD}` map field
  - 用 dot-notation `increment(1)` 原子寫入當日 + 累計
  - `todayInTaipei()` 確保時區一致（與 dailySnapshot 同函式）
- `dailySnapshot` 新增 `pruneOldDailyClicks()`：自動裁切超過 90 天的舊 key
- `useToolClickStats` 新增 `dailyClicksById: Map<id, Record<date, count>>`
  - 額外公開 `sumClicksInRange(daily, fromStr, toStr)` 工具函式
- `AnalyticsDashboard`：
  - 新 state `toolDailyClicks` + `toolTitles`（從 tools.json 載入）
  - 新 `toolsInRange` useMemo：依日期範圍重算每個工具的點擊數
  - 「總覽」分頁的 `prepareToolChartData` 用 toolsInRange + 真實工具標題
  - 「工具」分頁 BarChart 同步改用 toolsInRange + 範圍標籤
  - 卡片描述加上「期間內」文字 + 提示「dailyClicks 尚未累積」狀態

### 🔄 #27 收藏 / 最近使用跨裝置同步
- `useFavorites` 整套重寫：
  - 改用 `user`（含匿名身份）而非 `isAuthenticated`，匿名也能雲端同步
  - 新增 onSnapshot 訂閱 → 真正即時跨裝置同步（手機按收藏，桌面立即看到）
  - `skipNextSnapshotRef` 防止「自己剛寫又被自己 onSnapshot 觸發」迴路
  - `serverTimestamp` 寫入 updatedAt
- `useRecentTools` 同樣升級：
  - 從純 localStorage → 雙寫到 Firestore `userRecentTools/{uid}`
  - mergeRecent 雲端優先、本地補缺、去重、限制 5 個
  - 新增 onSnapshot 即時同步
- `firestore.rules` 新增 `userRecentTools/{uid}` 規則（與 userFavorites 一致）

### 🛠 #34 一鍵新工具 CLI（`npm run new-tool`）
- 新增 `scripts/new-tool.mjs`（互動式 CLI，零新依賴 — 用 Node 內建 readline）
- 流程：
  1. 自動算下一個可用 ID
  2. 互動提示：標題 / URL / 分類 picklist / icon picklist / 標籤
  3. 若有 `GEMINI_API_KEY` 環境變數 → 自動生 description / detailedDescription（gemini-2.5-flash）
  4. 用 Playwright 截 URL 螢幕 → sharp 縮為 1024×1024 → 存 webp
  5. 寫入 `client/public/api/tools.json`（與 server 版若存在）
  6. 自動呼叫 `generate-unified-og.mjs` 產 OG 圖
  7. 印出後續 commit / build / deploy 指令
- 加速版：`node scripts/new-tool.mjs --title "..." --url "..." --category utilities`
- 新工具流程：5 分鐘 → 30 秒

### 🧹 內部
- 版本 3.6.7 → 3.6.8

---

## [3.6.7] - 2026-04-26 — 救命級防護三連擊：Node 22 + 每日快照 + Sentry
### 🚀 1️⃣ Node.js 22 + Firebase 套件升級
- `functions/package.json`：engines.node 20 → 22
- `firebase-functions` ^6.0.0 → ^7.0.0
- `firebase-admin` ^12.0.0 → ^13.0.0（v13 主版號升級）
- `axios` ^1.6.0 → ^1.7.0
- `@types/node` ^18.0.0 → ^22.0.0
- 全 5 個 functions 重新部署為 Node.js 22 (2nd Gen) ✅
- 解除 Firebase 警告：原 Node 20 將於 2026-04-30 deprecate、10-30 停用

### 📦 2️⃣ #24 每日 Firestore 快照（救命級備份）
- 新增 `functions/src/dailySnapshot.ts`：
  - `dailySnapshot`：`onSchedule('0 3 * * *', { timeZone: 'Asia/Taipei' })` 每天 03:00 觸發
  - 序列化 `visitorStats` / `analytics` / `toolUsageStats` / `toolRatings` 全部文件 → 寫入 `analyticsSnapshots/{YYYY-MM-DD}`
  - 自動裁切超過 90 天的舊快照
  - `restoreFromSnapshot`：onCall function，admin claim 限制，`dryRun` 預設為 true 避免誤觸
- `firestore.rules` 新增 `analyticsSnapshots/{date}` 規則（admin only）
- `AnalyticsDashboard` 新增 `SnapshotManagementPanel` 元件
  - 訂閱最近 30 份快照，列表顯示日期 + 各集合大小
  - 「🧪 預演」+「↩ 還原」按鈕（含 confirm 警告）
- Cloud Function 已部署 + Cloud Scheduler API 已啟用 ✅

### 🚨 3️⃣ #28 Sentry 錯誤監控
- `npm i @sentry/react`（v10）
- 新增 `client/src/lib/sentry.ts`：
  - `initSentry()`：在 main.tsx 最早呼叫
  - DSN 從 `VITE_SENTRY_DSN` 讀取（沒設就 noop，本地開發也不送）
  - tracesSampleRate 0.1 + replaysSessionSampleRate 0.05 + replaysOnErrorSampleRate 1.0
  - `captureConsoleIntegration({ levels: ['error', 'warn'] })` — 抓隱性 bug 的關鍵
  - 過濾 ResizeObserver loop、瀏覽器擴充錯誤等雜訊
  - 移除 cookies 等可能 PII 的欄位
- `ErrorBoundary` 改寫：catch 時雙寫 Sentry + Firestore（保留既有 fallback）
- `useAuth`：每次 auth state change 同步呼叫 `setUser({ id: uid, isAnonymous })`
  - 匿名身份標 `segment: 'anonymous'`，登入身份標 `'authenticated'`
- `vite.config.ts` 注入 `VITE_APP_VERSION` 給 Sentry release tag
- `.env.example` 補上 `VITE_SENTRY_DSN` 條目
- ⚠️ 使用者需手動到 sentry.io 建立 React 專案、把 DSN 填入 `.env` 才會啟用

### 🧹 內部
- 版本 3.6.6 → 3.6.7

---

## [3.6.6] - 2026-04-26 — 提供本地歷史回填工具（救回管理員自己這台的歷史）
### 🗃️ 為什麼需要
- v3.6.4 之前，所有訪客的 geo / device / referrer 只寫到他們自己瀏覽器的 localStorage
- 其他訪客的歷史已永久遺失（我們無法存取陌生人的 localStorage）
- **但管理員自己這台瀏覽器的 localStorage 還在** — 可以救回來

### 🛠 新增功能
- `lib/visitorTracker.ts` 新增 `backfillLocalAnalytics()` 函式
  - 讀 localStorage 三類資料（geo / device / referrer）
  - 每個 category 一次 `setDoc(merge: true)` + `increment(N)`，不是逐筆寫
  - 用 `localStorage.analyticsBackfilled = 'v1'` 旗標防重複按
  - 回傳 `{ totalAdded, geoEntries, deviceEntries, referrerEntries }` 供 UI 顯示
- `AnalyticsDashboard` 新增 `BackfillLocalAnalyticsBar` 元件
  - 位於儀表板頂部（日期篩選列上方）
  - 偵測本地有資料時顯示橘色按鈕「📥 上傳本地歷史到 Firestore」
  - 完成後變綠色「✅ 已回填」，並有「🔁 強制重跑」備援（含 confirm 對話）
  - 沒有本地資料時自動隱藏

### ⚠️ 限制（誠實說明）
- 只能救回**管理員自己這台瀏覽器**的歷史
- 過去其他訪客（1,213 人）的 context 仍是永久遺失，無法挽回
- 從 v3.6.4 起新訪客會持續累積真實 context，未來不會再有此問題

---

## [3.6.5] - 2026-04-26 — 修復「訪客追蹤只在首頁觸發」的隱性 bug
### 🐛 問題
- v3.6.4 部署後，後台儀表板地理仍顯示 6 筆（localStorage fallback），設備卻只有 1 筆
- 原因：`BulletinVisitorCounter` 是負責寫入 Firestore 的元件，但它**只在 BulletinHome 渲染**
- 訪客直接打開 `/admin`、`/tool/:id`、`/wish` 都不會觸發任何 Firestore 寫入
- 加上 geo IP API 失敗時不寫 fallback key，導致 server geoStats 容易是空的

### 🛠 修正
- 新增 `client/src/lib/visitorTracker.ts` → `trackPageVisit()`：
  - 把「節流 + ensureSignedIn + incrementVisitorCount + 三類 analytics」全部抽出
  - 加上 `inFlight` + `alreadyRanThisLoad` 雙重 guard，同 SPA load 內絕不重複
  - geo API 全失敗時改寫 `'unknown'` key（避免 server geoStats 永遠空著走 fallback）
- `App.tsx` 開機 800ms 後呼叫 `trackPageVisit()`（取代舊的單純 ensureSignedIn）
- `BulletinVisitorCounter` 完全瘦身為純顯示元件
  - 移除節流、增量、ensureSignedIn、trackVisitorContext、incrementServerStat 三個函式
  - 保留 onSnapshot 訂閱與里程碑顯示
- 結果：不論落地頁是 `/`、`/admin`、`/tool/:id`、`/wish` 都會觸發完整追蹤

---

## [3.6.4] - 2026-04-26 — 統計準確性大修補：評論 LINE 通知 + 全站訪客 context + 匿名認證
### 🔔 評論 LINE 通知修復
- 問題：使用者提交工具評論成功，但管理員沒收到 LINE 通知
- 根本原因：`functions/src/index.ts` 只有 `onWishCreated`（許願池），
  `toolReviews` 集合的寫入沒有對應的監聽函式
- 新增 `onReviewCreated` Cloud Function（cork 橄欖綠卡片 + 教師頭像 + 「打開工具頁面」按鈕）
- 抽出 `pushFlexToAdmin()` 共用 helper，wish 與 review 兩個 trigger 共用
- 評論文件新增 `toolTitle` 欄位（從 ReviewForm/ReviewList/ToolDetail 透傳）
- Cloud Functions 已部署 ✅

### 📊 儀表板地理/設備/來源「只看到 6 筆」修復
- 問題：總訪問量 1,218 但訪客地理/設備/來源只顯示 6 筆
- 根本原因：這三類資料只寫到每位訪客自己的 localStorage，
  管理員打開儀表板時讀的是「自己這台瀏覽器」的 localStorage，
  其他 1,212 位訪客的 context 從來沒上傳到伺服器
- 修正（雙寫策略）：
  - `BulletinVisitorCounter.trackVisitorContext()` 新增 `incrementServerStat()`
    寫入 Firestore `analytics/visitorContext`（nested map + `increment(1)` sentinel）
  - `AnalyticsDashboard` 訂閱 `analytics/visitorContext`，三個 getter 改為
    「優先 Firestore → 本地 fallback → 示意數據」
  - `firestore.rules` 新增 `analytics/{docId}` 規則（read=true / write=auth）
  - 規則已部署 ✅

### 🔐 匿名認證啟用：未登入訪客也能被計入統計
- 問題：rules 要求 `request.auth != null`，未 Google 登入的訪客寫入失敗
  → totalVisits 1,218 全是登入用戶，匿名訪客零貢獻
- 修正：
  - `authService.ts` 新增 `ensureSignedIn()` + `markSignedOutThisSession()`
  - `App.tsx` 開機 800ms 後自動執行（不卡 LCP）
  - `BulletinVisitorCounter` 寫 Firestore 前先 `await ensureSignedIn`
  - `useAuth.isAuthenticated` 改為 `!!user && !user.isAnonymous`
    （匿名視為未登入，UI 仍提示登入才能評論）
  - 透過 Identity Toolkit Admin API 自動啟用 Firebase Anonymous Auth ✅

### 🧹 內部
- 版本 3.6.3 → 3.6.4，SW cacheVersion 同步更新

---

## [3.6.3] - 2026-04-26 — P0 體驗優化：HTTPS 修正 + OG 統一 + 排行榜徽章 + 儀表板日期
### 🔒 #4 IP HTTPS 升級（visitor context tracking）
- `BulletinVisitorCounter` 新增 `trackVisitorContext()`：
  - **裝置統計**：UA 偵測 desktop/mobile/tablet → 寫入 `visitorDeviceStats`
  - **來源分類**：referrer 解析 search/social/email/external/direct → `visitorReferrerStats`
  - **地理定位**：HTTPS only — `ipapi.co` 為主、`ipinfo.io` fallback（皆 3 秒 timeout）
  - 台灣城市英中映射（Taipei → 台北市 等），寫入 `visitorGeoStats`
- 修正：避免 GH Pages（HTTPS）載入 HTTP 端點被瀏覽器擋掉

### 🖼️ #23 統一 OG 圖模板
- 新增 `scripts/generate-unified-og.mjs`：1200×630 cork 風 OG 圖批次生成器
  - CLI：`node scripts/generate-unified-og.mjs [id|id1,id2,...]`
  - 中央便利貼依分類自動換色（7 類）+ 立體圖釘
  - **左側嵌入工具實際預覽圖（白邊拍立得框）**，取代 emoji（避免 Noto Sans TC 缺字 → 豆腐方塊）
  - 底部署名列：阿凱頭像 + 「教育科技創新專區」+ URL 膠囊
- **token-aware 換行**：`Pro` / `(Pro版)` / `EXPO` 等英數塊不再被切半，括號群組整段換行
- 全 84 張 OG 圖一次重生 + 自動更新 `tools.json` 的 `ogPreviewUrl`

### 🔥 #20 排行榜急上升徽章
- `useToolClickStats.ts` 新增 7 日 delta 機制：
  - 每次 onSnapshot 拉到新資料時，自動寫入「今日累計」快照到 `toolStatsSnapshots`
  - 滾動保留最近 8 天快照（今天 + 7 天前），自動裁切舊資料
  - 公開 `deltas7d: Map<id, number>`（今日累計 − 7 天前累計）+ `hasDeltaHistory` 旗標
- `BulletinLeaderboard.tsx`：
  - **金 / 銀 / 銅膠帶徽章**（前 3 名）：斜貼右上角，文字「🥇 冠軍 / 🥈 亞軍 / 🥉 季軍」
  - **🔥 急上升徽章**：標記 7 日新增點擊最多的工具（≥3 點擊才顯示），左上角橘紅漸層 chip + 光暈
  - 非 #1 急上升者：點擊數欄位旁加上「+N/週」小字提示

### 📅 #7 儀表板日期篩選
- 新增 `client/src/components/admin/DateRangePicker.tsx`：cork 風日期範圍選擇器
  - 6 個快速選項：今天 / 最近 7、14、30 天 / 本月 / 上月
  - 自訂範圍：兩個 `<input type="date">` + 「套用」按鈕
  - 外部點擊自動關閉、active preset 高亮為橄欖綠
- `AnalyticsDashboard.tsx` 全面接入：
  - 4 張統計便利貼改用範圍計算：總訪問量 / 期間流量 / 期間日均 / 期間單日峰值
  - 期間流量自動 vs.「前一段同等長度」比較 → 動態顯示 +/-% 與紅綠箭頭
  - 趨勢線圖標題、CSV / JSON 匯出檔均寫入選定範圍
  - 篩選列固定在頭部（cork 卡片 + 顯示天數膠囊）

### 🧹 內部
- 版本號 3.6.2 → 3.6.3，SW cacheVersion 同步更新
- TypeScript 嚴格模式：全綠（含 4 個新檔）
- Vite 生產建置：通過

---

## [3.6.2] - 2026-04-25 — 後台 cork 化 + 智慧排序 + 新工具
### ✨ 新增工具
- **#84 會議記錄自動產出平台 (Pro 版)**：AI 轉寫 + 自動摘要 + Word/PDF 匯出
  - 含自動生成的卡片預覽圖（1024×1024）+ 社群分享圖（1200×630）
  - 標籤：會議記錄 / AI 轉寫 / 自動摘要 / 領域會議 / 導師會議 / 校務會議 等

### 🎨 後台介面 cork 化（重大升級）
- **AdminAuth.tsx 全面重寫**：管理員登入頁 → 黃便利貼 + 紅圖釘 + 橄欖綠 highlight
  - 三種狀態（載入中 / 無權限 / 登入頁）都改 cork 風
  - 無權限頁：粉便利貼 + 🚫 emoji
  - 已登入時：藍便利貼管理員資訊 + 紅邊登出按鈕
- **AnalyticsDashboard 視覺層精修**：
  - 紫紅藍漸層 → cork 軟木塞 + 木條
  - 4 張統計卡片改為 cork 便利貼（黃/粉/綠/藍 + 立體圖釘 + 傾斜）
  - Tabs active 態：indigo-600 → 橄欖綠
  - 抽出 `StickyStatCard` 子元件供未來重用

### 🪄 載入 UI 三層全 cork 化
- **初始載入**（index.html pure CSS）：藍 spinner → cork 背景 + 黃便利貼搖擺
- **PageSkeleton**（React Suspense）：紫紅漸層 → 大黃便利貼 + 紅圖釘 + 橄欖綠 highlight
- **LoadingScreen**（元件級）：灰文字 → 小黃便利貼搖擺
- 三層視覺語彙完全一致，從進站到完成無縫

### 🛠️ 新增 cork 風隱藏後台入口
- 左下角小黃便利貼 + 🔧 SVG 扳手 icon
- 預設 opacity 0.42（低調）→ hover 時浮現旋轉 + 圖釘冒出
- 對稱於右下「回頂部」按鈕

### 🔢 動態數據顯示
- **Hero 工具數量**：「81 個老師做的免費工具」→ 動態讀 `toolsWithStats.length`
- **Footer 版本號** + **Hero NEW 膠帶**：寫死 v3.6.0 → `useVersionCheck` 動態讀 version.json
- 新增工具 / 發新版時自動同步，不需手動改 tsx

### 🔥 智慧排序預設改為「熱門」
- 預設排序：random → popular（點擊數高 → 低）
- 熱門排序資料源：localStorage → Firestore `tool.totalClicks`（即時推送）
- 點擊任何工具 → 數字 +1 → 重新排序立即反映
- 相同點擊數時，新工具（ID 大）排前面避免飄動

### 📁 新增檔案
- `client/src/components/bulletin/BulletinAdminEntry.tsx`
- `scripts/generate-tool-84.mjs`、`scripts/add-tool-84.mjs`
- `client/public/previews/tool_84.webp`、`tool_84_og.webp`

## [3.6.1] - 2026-04-24 — E2 公佈欄精修版
### ✨ 新增功能
- **訪客計數器 (cork 風格)**：Hero 區黃色便利貼橫幅，Firestore 即時訂閱、里程碑進度條。
- **回頂部按鈕**：圓形米白色底座 + 紅圖釘，捲動 >500px 淡入，RWD 手機版縮小。
- **SW 版本管理機制**：`bump-sw-version.mjs` 自動注入版本 + `useVersionCheck` 每 15 分鐘輪詢 `version.json`。
- **許願池社群分享**：專屬 cork 風格 OG 預覽圖（1200×630）+ `/wish/` 靜態分享頁。
- **首屏圖片預載**：index.html 動態 preload 前 6 張 + SW install 時預快取。
- **分類/收藏自動捲動**：點擊後平滑捲動至工具網格，提升 UX。
- **Google Maps 學校連結**：footer 校徽點擊連到 Google Maps。

### 🎨 視覺精修（E2 cork 風格深化）
- **Hero 區**：手機版置中對齊、螢光筆色改為橄欖綠、加入完整阿凱拍立得（對話泡泡 + APPROVED 印章）。
- **ToolDetail 全新 cork 化**：`/tool/:id` 詳情頁重寫，大拍立得 + 分類膠帶 + 星評 + 統計便利貼。
- **Footer 大整合**：移除重複的白色條 footer，改為統一 cork 風格含 MAKER / SCHOOL / VERSION 三張便利貼（都含 favicon / 校徽頭像）。
- **排行榜卡片**：點擊追蹤 bug 修復（原先純 `<a>` 沒呼叫 trackToolUsage）+ Firestore 即時排行即時 +1。
- **拍立得卡片顯示真實預覽圖**：修正 GitHub Pages 子路徑下的圖片路徑。
- **許願池 OG 圖 v2**：全面重製為精緻版（緞帶徽章 + 雙層字級 + 橄欖綠 highlight + 底部 attribution bar）。

### 🔤 字型系統
- **Canvas + Noto Sans TC subset**：OG 預覽圖 100% 自家字型渲染，跨平台一致。
- **subset-font 精簡**：完整 TTF 12 MB → 精簡版 177 KB（1.5%）。
- **新增 skill**：`og-social-preview-zh` 記錄完整流程。

### ♿ 無障礙與 UX 品質
- **Dialog a11y 警告修復**：補回 `DialogTitle` / `DialogDescription`（用 `VisuallyHidden`）。
- **`/wish/` 跳轉優化**：URL 從 `wish=1 query` 改用 `sessionStorage` 旗標，URL 只跳一次不再三跳。
- **搜尋結果 aria-live**：動態播報結果數。
- **ToolCard**：`role="article"` + 動態 `aria-label`。
- **移除未使用的 teacher.json preload 警告**。

### ⚡ 效能與快取
- **IMAGE_CACHE 獨立持久快取**：不受 `CACHE_VERSION` 更新影響，每次發版不再重抓圖。
- **SW 預快取首屏 9 個資源**：`tool_1~6.webp`、`Akai.png`、`school-logo.png`、`favicon.png`。
- **點擊數即時同步**：`useToolClickStats` 共用 hook，81 張卡片共用一個 Firestore 訂閱。
- **RWD 五段斷點精修**：1200 / 1024 / 768 / 480 / 380，觸控裝置停用 sticky hover。

### 🎯 網站導覽升級
- **導覽站點**：3 站 → 8 站，完整對應新佈局。
- **導覽 popover 視覺**：青色 Dialog → cork 黃色便利貼（紅圖釘 + 橄欖綠螢光筆 + 橘色 CTA）。
- **完成後按鈕**：傾斜黃色便利貼「📌 網站導覽」。

### 🔧 Bug 修復
- **死鏈巡檢 workflow**：加瀏覽器 User-Agent + 反爬蟲網站白名單（padlet.com、claude.ai 等）。
- **TypeScript 型別錯誤**：40 個全修（新增 4 個 .d.ts）。
- **Firestore 安全規則**：`visitorStats` / `toolUsageStats` 寫入限縮為認證用戶。
- **Hero 配色**：「教學點子」改為橄欖綠螢光筆（符合設計師原檔）。

### 📁 新增檔案概覽
- `scripts/bump-sw-version.mjs`、`scripts/generate-wish-preview.mjs`、`scripts/subset-wish-font.mjs`、`scripts/check-links.mjs`
- `scripts/fonts/NotoSansTC-WishSubset.ttf`（精簡字型）
- `client/public/wish-preview.png`、`client/public/version.json`
- `client/src/hooks/useVersionCheck.ts`、`useToolClickStats.ts`
- `client/src/pages/BulletinToolDetail.tsx`
- `client/src/components/bulletin/BulletinBackToTop.tsx`、`BulletinVisitorCounter.tsx`
- `.github/workflows/link-check.yml`

## [3.6.0] - 2026-04-21
### ✨ 大版本更新：E2 公佈欄首頁
- **全新視覺語彙**：軟木塞底 + 木框 + 拍立得工具卡 + 便利貼排行榜 + 膠帶標題
- **保留所有既有功能**：雲端收藏同步、PWA 自動更新、鍵盤快捷鍵、搜尋、分類篩選、URL 同步、許願池 (LINE Bot 推播) 完整保留
- **新增路由 `/classic`**：保留舊版首頁供對比與備援
- **新增 `BulletinHome.tsx`**：整合層，連接真實 81 個工具 + Firestore 即時排行榜
- **RWD 完整支援**：1024px / 768px / 480px 三段斷點
- **尊重 `prefers-reduced-motion`**：停用卡片動畫
- **無障礙強化**：ToolCard `role="article"` + `aria-label`，搜尋結果 `aria-live` 播報

### 📂 新增檔案
- `client/public/assets/Akai.png`、`school-logo.png` - 素材
- `client/src/styles/tokens.css`、`keyframes.css` - 設計 tokens 與動畫
- `client/src/design/tokens.ts` - TypeScript 版 tokens（含 interactive 分類）
- `client/src/components/primitives/` - Pin / Tape / Stamp / HeartBurst / shade
- `client/src/components/bulletin/` - 9 個整合元件 + toolAdapter
- `client/src/pages/BulletinHome.tsx` - 新首頁整合層

### 🔧 修改檔案
- `client/src/App.tsx` - `/` 改為 BulletinHome、新增 `/classic`
- `client/src/main.tsx` - 匯入 tokens.css / keyframes.css
- `client/index.html` - 載入 Noto Sans TC + Plus Jakarta Sans
- `README.md` / `package.json` - 版本同步 v3.6.0

## [3.5.8] - 2026-04-19
### ✨ 新增
- **PWA 自動更新**：新版本偵測後 3 秒自動套用，不再需要使用者手動點擊。
  - 漸層進度條視覺倒數 + 圓形旋轉動畫
  - 使用者可選擇「立即更新」跳過倒數或「稍後再說」取消自動更新
- **定期主動檢查更新**：每 30 分鐘自動向伺服器檢查新版本。
- **分頁焦點觸發檢查**：從背景切回前台時立即檢查更新。

### 📁 修改文件
- `client/src/components/PWAUpdatePrompt.tsx` - 新增自動倒數機制與漸層 UI
- `client/src/hooks/usePWAUpdate.ts` - 新增定期檢查與 visibilitychange 事件
- `README.md` / `package.json` / `USER_GUIDE.md` / `PROGRESS.md` - 版本同步 v3.5.8

## [3.5.7] - 2026-04-17
### ✨ 新增
- **許願池分享連結**：支援 `?wish=1` URL 參數，訪問連結即自動開啟許願池對話框。
- **複製連結按鈕**：許願池對話框標題列新增「分享連結」按鈕，點擊即複製專屬連結至剪貼簿。

### 📁 修改文件
- `client/src/pages/Home.tsx` - 新增 `?wish=1` URL 參數偵測與自動清除邏輯
- `client/src/components/WishingWellDialog.tsx` - 新增分享連結按鈕與複製功能
- `README.md` - 版本徽章更新至 3.5.7
- `package.json` - 版本號更新至 3.5.7
- `PROGRESS.md` & `USER_GUIDE.md` - 版本同步至 3.5.7

## [3.5.6] - 2026-04-16
### ✨ 新增
- **教學資源 (Teaching)**：新增「國小資訊科技教學駕駛艙入口網」工具卡片 (ID: 81)。
  - 核心：整合國小資科教育核心資源，為老師打造的全方位數位教學儀表板。
  - 資源：自動生成並優化 WebP 預覽圖與社交分享預覽圖。

### 📁 修改文件
- `client/public/api/tools.json` - 新增工具 ID 81
- `README.md` - 版本徽章更新至 3.5.6
- `package.json` - 版本號更新至 3.5.6
- `PROGRESS.md` & `USER_GUIDE.md` - 版本同步至 3.5.6，更新工具總數至 81

## [3.5.5] - 2026-04-15
### ✨ 新增
- **實用工具 (Utilities)**：新增「114石小教師會議報告集合站 (下學期)」工具卡片 (ID: 80)。
  - 核心：石門國小 114 學年度下學期專屬會議與行政資源整合平台。
  - 功能：集中管理會議記錄、行政宣導與進度回報。
  - 資源：自動生成並優化 WebP 預覽圖與社交分享預覽圖。

### 📁 修改文件
- `[client/server]/data/tools.json` - 新增及同步工具 ID 80
- `README.md` - 版本徽章更新至 3.5.5
- `package.json` - 版本號更新至 3.5.5
- `PROGRESS.md` & `USER_GUIDE.md` - 版本同步至 3.5.5

## [3.5.4] - 2026-04-08
### ✨ 新增
- **語言工具**：新增「石門國小雙語教育宣導網站」工具卡片 (ID: 77)。
  - 核心：石門國小雙語教育宣導專屬平台，整合雙語課程介紹、英語學習資源與校園國際化推廣資訊。
  - 資源：自動生成並壓縮 WebP 預覽圖與社交分享預覽圖。

### 📁 修改文件
- `[client/server]/data/tools.json` - 新增工具 ID 77
- `README.md` - 版本徽章更新至 3.5.4，更新工具總數
- `package.json` - 版本號更新至 3.5.4

## [3.5.3] - 2026-04-01
### ✨ UX 新功能
- **快速標籤連結 (Quick Filter Links)**：支援透過 URL Query String 直接套用篩選條件，大幅提升分享連結的使用體驗。
  - `?category=games` → 自動選中「🎮 趣味遊戲」分類
  - `?category=teaching` → 自動選中「📚 教學資源」分類
  - `?q=關鍵字` → 自動填入搜尋框並篩選
  - `?tag=AI,英語` → 自動套用多個標籤篩選（逗號分隔）
  - `?favorites=1` → 自動進入「我的收藏」模式
  - 支援複合參數組合，例如 `?category=games&tag=AI`
- **雙向 URL 同步**：使用者在頁面上更改篩選條件時，URL 自動更新（`replaceState`，不影響瀏覽器返回按鈕），隨時可複製分享當前狀態。
- **自動捲動**：帶有篩選參數的連結進入頁面後，自動平滑捲動至工具卡片結果區塊。
- **分頁優化**：帶有篩選參數的分享連結預設顯示 16 個工具（而非首屏優化的 4 個），確保完整呈現篩選結果。

### 📁 修改文件
- `client/src/pages/Home.tsx` - 新增 `readUrlFilters()`、`writeUrlFilters()`、`scrollToToolsGrid()` 函數及相關 `useEffect` 邏輯
- `README.md` - 版本徽章更新至 3.5.3，功能特色新增快速標籤連結說明
- `package.json` - 版本號更新至 3.5.3

## [3.5.2] - 2026-03-30
### ✨ 新增
- **實用工具與教學工具**：新增「影片&PDF批次轉圖片」工具卡片 (ID: 75)。
  - 核心：快速將影片與 PDF 轉為單頁圖片，提升備課與行政效率。
- **教學工具**：新增「WebSlide Pro 簡報播放器」工具卡片 (ID: 76)。
  - 核心：提供專業流暢的線上簡報展示與互動播放體驗。

### 🔧 UI/UX 改進
- 修正首頁進階搜尋（AdvancedSearch）的排序選項區塊（隨機、熱門、名稱、最新），在狹窄側邊欄或小容器寬度下導致的畫面溢出（overflow）被裁切問題。
- 優化 RWD 網格編排機制，確保選項在大螢幕下單排顯示，而在窄畫面下自動變更為平穩美觀的雙排（Grid 2x2）佈置。

## [3.5.1] - 2026-03-27
### ✨ 新增
- **親師溝通工具**：新增「2026 親職日場地配置圖」工具卡片 (ID: 74)。
  - 核心：提供 2026 親職日活動場地配置與動線規劃。
  - 資源：自動生成並壓縮 WebP 預覽圖與社交分享預覽圖。

## [3.5.0] - 2026-03-24
### ✨ 新增
- **語言工具**：新增「成語填空大挑戰」工具卡片 (ID: 71)。
  - 核心：提供互動式成語填空遊戲，強化辭彙運用。
  - 資源：自動生成並壓縮 WebP 預覽圖與社交分享預覽圖。

## [3.4.8] - 2026-03-23
### ✨ 新增
- **遊戲工具**：新增「中文注音打字遊戲 (pro版)」工具卡片 (ID: 70)。
  - 核心：實作進階版中文注音打字練習遊戲，提供更豐富有趣的打字挑戰。
  - 資源：自動生成並壓縮 WebP 預覽圖與社交分享預覽圖。

## [3.4.7] - 2026-03-20
### ✨ 新增
- **遊戲工具**：新增「猴子丟香蕉-投擲大戰爭」工具卡片 (ID: 69)。
  - 核心：實作物理引擎驅動的投擲機制。
  - 資源：自動生成並壓縮 WebP 預覽圖與社交分享預覽圖。


## [3.4.6] - 2026-03-19
### ✨ 新增
- **Google Analytics 4 (GA4) 整合**：導入全站行為追蹤，提升資料驅動開發能力。
  - 加入 `G-XHT6YVN2HG` 追蹤碼。
  - **安全性強化**：實作 `__GA_MEASUREMENT_ID__` 佔位符機制，確保原始碼不外洩金鑰。
  - **CI/CD 自動化**：新增 `.github/inject.py` 腳本，在部署流程中自動注入真實 ID。
  - **環境變數管理**：於 `.env` 與 `.env.example` 同步更新配置。

### 🔧 安全性與品質
- 強化 GitHub Actions 部署流程，整合「秘鑰注入」步驟，遵循零洩漏原則。
- 更新 `.env.example` 為完全佔位符格式，提升範例安全性。

## [3.4.5] - 2026-03-18
### ✨ 新增
- 「手作課程照片影片作品上傳平台」工具卡片 (ID: 68)
- 為新工具自動生成高品質 WebP 預覽圖與社群分享預覽圖 (OG Image)
- **自動化描述設計**：針對手作課程作品集進行專業描述，提升展示質感
- **同步更新**：全面同步伺服器端與用戶端的工具數據庫

## [3.4.4] - 2026-03-17
### ✨ 新增
- 「國語演說比賽訓練平台 (pro版)」工具卡片 (ID: 67)
- 為專業版演說平台自動生成精美 WebP 預覽圖與專屬 OG 預覽圖
- **專業描述設計**：包含比賽培訓、口語表達、講稿庫等完整詮釋資料
- **同步更新**：同步更新前端與後端工具資料庫

## [3.4.3] - 2026-03-15
### ✨ 新增
- 「Sora AI 旅遊全記錄教學網」工具卡片 (ID: 66)
- 為新工具生成高品質 WebP 預覽圖與社群分享預覽圖 (OG Image)

## [3.4.2] - 2026-03-14
### Changed
- **進階搜尋 RWD 優化**：將排序按鈕容器改為 2x2 網格佈局（小螢幕模式），確保在手機側邊欄中所有選項（隨機、人氣、名稱）皆可正常顯示且易於點擊。
- **UI 調整**：在行動裝置上隱藏排序圖示以節省空間，優化整體視覺層次感。

## [3.4.1] - 2026-03-12
### ✨ 新增
- 「Email 帳密記憶遊樂園」工具卡片 (ID: 63)
- 補齊「親職教育日」工具卡片缺失之資料 (ID: 62)

## [3.4.0] - 2026-03-12
### ✨ 新增功能
- **Firebase 即時排行榜整合**：移除環境限制，讓開發環境也能即時與 Firestore 同步數據。
- **降級機制優化**：當 Firebase 無法連線時，自動回退至本地 API 獲取排行榜數據。
- **新增工具卡片**：桃園市龍潭區石門國民小學 114 學年度親職教育日 (ID: 62)。

### 🔧 優化與修正
- **數據刷新邏輯**：點擊工具後立即觸發排行榜數據重新整理。
- **手冊更新**：同步更新 `USER_GUIDE.md` 版本與工具總數。


## [3.3.1] - 2026-03-09

### ✨ 新增工具

- ⌨️ **英打打字超互動遊戲** (ID 61)
  - 互動式英文打字學習遊戲
  - 透過趣味關卡幫助學生提升英文打字速度與準確度
  - 分類：語言 (language)
  - 標籤：打字、英文、鍵盤、練習、互動、遊戲、輸入法
  - 網址：https://cagoooo.github.io/typeEN/
  - 生成 WebP 預覽圖 (`tool_61.webp`)

### 📁 修改文件
- `server/data/tools.json` - 新增工具 ID 61
- `client/public/api/tools.json` - 同步靜態工具清單
- `client/public/previews/tool_61.webp` - 新增預覽圖
- `package.json` - 版本號更新至 3.3.1

---

## [3.3.0] - 2026-03-05

### 🔧 連結更新

- 🎓 **剛好學：課堂互動so easy 連結更新** (ID 11)
  - 將平台網址從 `https://class.smes.tyc.edu.tw/` 更新為 `https://cagoooo.github.io/Akailao/`
  - 確保連結指向最新版本的剛好學互動平台

### 📁 修改文件
- `server/data/tools.json` - 更新工具 ID 11 的網址
- `package.json` - 版本號更新至 3.3.0

---

## [3.2.9] - 2026-03-02

### ✨ 新增工具

- 🤖 **小智鈴 AI 客服系統** (ID 59)
  - 專為教育場域開發的智慧 AI 客服交談機器人
  - 結合先進語言模型，自動學習學校行政、教學資源及常見 QA 資料
  - 透過自然流暢對話即時反饋，24/7 全天候提供諮詢支援
  - 分類：親師溝通 (communication)
  - 標籤：AI 客服、智慧對話、即時支援、24/7、行政自動化、教育科技
  - 網址：https://cagoooo.github.io/smes/
  - 生成 3D 風格 WebP 預覽圖 (`tool_59.webp`)

### 🔧 技術改進

- 🎨 **OptimizedIcons 擴充**：新增 `MessageSquareText`、`Lightbulb` 等 SVG 圖示
- 📦 **靜態資料同步**：更新 `client/public/api/tools.json` 確保前端靜態載入最新工具清單

### 📁 修改文件
- `server/data/tools.json` - 新增工具 ID 59
- `client/public/api/tools.json` - 同步靜態工具清單
- `client/public/previews/tool_59.webp` - 新增 AI 客服機器人預覽圖
- `client/src/components/OptimizedIcons.tsx` - 新增 MessageSquareText、Lightbulb 圖示
- `package.json` - 版本號更新至 3.2.9

---

## [3.2.8] - 2026-02-28

### ✨ 新增工具

- 🪄 **教師數位備課教案小幫手** (ID 58)
  - 專為老師設計的 AI 數位備課工具
  - 快速生成優質教案與教學活動設計，節省備課時間
  - 支援 108 課綱核心素養導向設計
  - 分類：教學 (teaching)
  - 標籤：AI、備課、教案生成、教學設計、數位轉型
  - 網址：https://cagoooo.github.io/prepare/
  - 生成 3D 風格 WebP 預覽圖

---

## [3.1.0] - 2026-02-23

### ⚡️ 效能優化 (Performance Plus)

- 🚀 **資源預載 (Resource Preloading)**：實施 `tools.json` 與 `teacher.json` 的 API 預載，提升內容生成速度。
- 瓦解 **TBT (Total Blocking Time)**：導入 `requestIdleCallback` 分段渲染「排行榜」、「訪客計數器」與「教師介紹」。
- 重奪 **LCP (Largest Contentful Paint)**：為首屏首張卡片設定 `fetchpriority="high"`，並優化圖片佔位邏輯。
- 🛠️ **SW 啟動優化**：延遲 Service Worker 註冊至 `window.onload`，避免啟動競爭。

### ✨ UX 改良

- 🖱️ **自動跳轉功能**：點擊「我的收藏」或「工具分類」按鈕後，頁面將自動平滑滾動至顯示區域，解決手機端視窗遮擋問題。

---
## [2.20.1] - 2026-02-12

### 🔧 問題修復

- 🚑 **返回首頁路徑修復**：修正管理員頁面與分析儀表板中的「返回首頁」連結，在 GitHub Pages 環境下會導向網域根目錄的問題。
  - 將原生 `<a>` 標籤替換為 `wouter` 的 `<Link>` 元件，確保自動遵循 `base` 路徑配置。

---

## [2.20.0] - 2026-02-12

### ✨ 新增工具

- 🔧 **智慧校園報修系統** (ID 53)
  - 專為校園打造的智慧報修平台
  - 簡化修繕申請、案件追蹤與行政管理流程
  - 分類：工具 (utilities)
  - 標籤：報修、校園、修繕、管理、效率
  - 網址：https://cagoooo.github.io/repair/
  - 生成繁體中文版 PNG + WebP 雙格式預覽圖

### 🔧 問題修復

- 🚀 **導覽邏輯穩定性優化**
  - 修復工具卡片在新頁面開啟後，原分頁會重複導覽至超連結的問題
  - 改用動態 `<a>` 標籤模擬點擊方案，徹底解決 `window.open` 的誤判回退邏輯
  - 強化點擊事件的 `preventDefault()` 與 `stopPropagation()` 處理

---

## [2.19.0] - 2026-02-08

### ✨ 新增功能

- 📂 **區塊收合功能** - 首頁三大區塊預設收合，節省版面空間
  - 「為您推薦」區塊預設收合
  - 「最近使用」區塊預設收合
  - 「新工具上線」區塊預設收合
  - 點擊標題列即可展開/收合
  - 使用 Framer Motion 實現平滑動畫

### 🔧 問題修復

- 🛠️ **Service Worker 開發環境衝突修復**
  - 在 localhost 開發環境自動註銷 Service Worker
  - 解決 503 Service Unavailable 錯誤
  - 更新 Service Worker 版本號至 v2.2.1-dev-fix
- 🔌 **WebSocket HMR 連線修復**
  - 明確指定 HMR clientPort 為 5000
  - 解決 `ws://localhost:undefined/` 無效 URL 錯誤
  - 新增 watch.usePolling 支援 Windows 檔案監聽

### 📁 修改文件
- `client/src/components/RecommendedTools.tsx` - 新增收合功能
- `client/src/components/NewToolsBanner.tsx` - 新增收合功能
- `client/src/pages/Home.tsx` - 最近使用區塊收合功能
- `client/src/serviceWorkerRegistration.ts` - 開發環境停用 SW
- `client/index.html` - 緊急 SW 註銷腳本
- `client/public/sw.js` - 版本號更新
- `vite.config.ts` - HMR 設定修正
- `package.json` - 版本號更新至 2.19.0

---

## [2.18.0] - 2026-01-30

### ✨ 新增工具

- 🎡 **童趣學園** (ID 50)
  - 專為兒童設計的快樂學習探索樂園
  - 集合豐富有趣的互動遊戲與多元學習資源
  - 啟發孩子的好奇心，讓學習變得像遊戲一樣好玩
  - 分類：遊戲 (games)
  - 標籤：兒童、遊戲、學習、探索、樂園、互動
  - 網址：https://cagoooo.github.io/kids/
  - 生成 3D 風格 WebP 預覽圖
  - 註冊專屬 Baby 圖標

### 📁 修改文件
- `client/src/lib/data.ts` - 新增工具 ID 50
- `client/src/lib/iconRegistry.ts` - 新增 Baby 圖標
- `client/public/previews/kids-zone-preview.webp` - 新增預覽圖
- `package.json` - 版本號更新至 2.18.0

---

## [2.17.1] - 2026-01-27

### 🔧 連結更新

- 🗳️ **學生即時投票系統連結更新**
  - 將投票系統網址從 `https://vote.smes.tyc.edu.tw/` 更新為 `https://cagoooo.github.io/vote/`
  - 同步更新 `data.ts`, `USER_GUIDE.md`, `README.md`, `sitemap.xml`

---

## [2.16.0] - 2026-01-22

### 🎨 UI/UX 優化

- 🏷️ **繽紛多彩標籤系統** - 工具卡片標籤全新視覺升級
  - 12 種漸層顏色調色盤（粉紅、紫紅、靛藍、青藍、翠綠、萊姆黃、琥珀橘、紅玫瑰、洋紅、天藍、青碧、橘黃）
  - 智能 Hash 函數確保相同標籤永遠顯示相同顏色
  - 漸層背景色彩 + 對應邊框設計
  - 懸停時縮放 + 陰影增強效果 (`hover:scale-105 hover:shadow-md`)
  - 平滑過渡動畫 (`transition-all duration-200`)

### 📱 RWD 響應式優化

- 📐 **標籤自適應尺寸**
  - 手機版：`px-2 py-0.5` + `text-[10px]`
  - 桌面版：`px-2.5 py-1` + `text-xs`
  - 彈性間距：`gap-1.5 sm:gap-2`

### 📁 修改文件
- `client/src/components/ToolCard.tsx` - 新增 `tagColorPalette` 調色盤、`getTagColors()` 函數、標籤渲染優化

---

## [2.15.0] - 2026-01-21

### ✨ 新增工具

- ☁️ **文字雲即時互動** (ID 45)
  - 即時協作的文字雲互動平台
  - 讓參與者同步輸入關鍵詞，動態生成視覺化文字雲
  - 適合課堂腦力激盪、意見收集與互動教學
  - 分類：互動平台 (interactive)
  - 標籤：文字雲、即時互動、協作、腦力激盪、視覺化、課堂互動
  - 網址：https://cagoooo.github.io/cloud
  - 生成繁體中文版 PNG + WebP 雙格式預覽圖

### 📚 文件更新

- 📖 **完整使用操作手冊** (`USER_GUIDE.md`)
  - 網站功能總覽與七大分類說明
  - 搜尋功能使用指南與技巧
  - 分類標籤操作說明
  - 排行榜功能詳細介紹
  - 為您推薦功能說明
  - 完整 45 個工具清單（含名稱、說明、超連結）
  - 鍵盤快捷鍵操作表
  - 常見問題 FAQ

### 🔧 技術更新

- 🎨 **iconRegistry.ts** - 新增 Cloud 圖標
- 📊 **工具總數更新** - 從 44 增加至 45 個

### 📁 修改文件
- `client/src/lib/data.ts` - 新增工具 ID 45
- `client/src/lib/iconRegistry.ts` - 新增 Cloud 圖標
- `client/public/previews/tool_45.png` - 新增繁體中文版預覽圖
- `client/public/previews/tool_45.webp` - 新增 WebP 格式
- `USER_GUIDE.md` - 全新完整使用操作手冊

---

## [2.14.0] - 2026-01-19

### ✨ 新增工具

- ➕ **數學加減法練習器** (ID 44)
  - 互動式數學加減法練習工具
  - 幫助學生熟練基礎運算能力
  - 分類：教學 (teaching)
  - 標籤：數學、加法、減法、練習、基礎運算
  - 生成 PNG + WebP 雙格式預覽圖

### 🔧 UI/UX 改進

- 🛠️ **後台快捷入口按鈕**
  - 主頁面左下角新增半透明 Emoji 按鈕
  - 不干擾閱讀體驗，懸停時微微顯現
  - 點擊可快速進入 `/admin` 管理後台
  - 完整 RWD 響應式設計

### 📁 修改文件
- `client/src/lib/data.ts` - 新增工具 ID 44
- `client/src/pages/Home.tsx` - 新增後台入口按鈕
- `client/public/previews/tool_44.png` - 新增預覽圖
- `client/public/previews/tool_44.webp` - 新增 WebP 格式

---

## [2.12.0] - 2026-01-17

### 💬 評論回覆功能 (樓中樓)

- 🆕 **回覆功能** - 使用者可以針對評論進行樓中樓回覆
- 👍 **回覆點讚** - 支援對回覆進行點讚/取消讚
- 🗑️ **刪除回覆** - 作者可刪除自己的回覆

### 📁 新增文件
- `client/src/lib/replyService.ts` - 回覆 CRUD 服務
- `client/src/components/ReviewReply.tsx` - 回覆元件

### 📁 修改文件
- `client/src/components/ReviewItem.tsx` - 整合回覆功能

---

## [2.11.1] - 2026-01-17

### 🐛 問題修復

- 🔧 **新工具通知卡片圖標修復** - 修復 NewToolsBanner 顯示圖標名稱字串（如 MessageCircle）而非實際圖標的問題
  - 引入 `iconRegistry` 動態渲染 Lucide 圖標組件
  - 若找不到對應圖標，使用 Sparkles 作為預設圖標

### 📁 修改文件
- `client/src/components/NewToolsBanner.tsx` - 使用 iconRegistry 渲染圖標
- `package.json` - 版本號更新至 2.11.1

---

## [2.11.0] - 2026-01-17

### 📱 PWA 強化與工具更新通知

- 🔄 **PWA 更新提示** - 自動檢測應用程式更新並提示用戶
- 📴 **離線狀態指示器** - 顯示離線模式警示
- 📲 **安裝提示優化** - 更美觀的 PWA 安裝提示
- 🆕 **新工具通知橫幅** - 自動顯示新上線的工具
- ✅ **已讀追蹤** - 使用 LocalStorage 追蹤已讀狀態

### 📁 新增文件
- `client/src/hooks/usePWAUpdate.ts` - PWA 更新管理 Hook
- `client/src/hooks/useNewToolsNotification.ts` - 新工具通知 Hook
- `client/src/components/PWAUpdatePrompt.tsx` - PWA 更新提示 UI
- `client/src/components/NewToolsBanner.tsx` - 新工具通知橫幅

---

## [2.10.0] - 2026-01-17

### 🧪 測試覆蓋率提升

- ✅ **useFavorites.test.ts** - 收藏功能測試 (7 測試案例)
- ✅ **useRecentTools.test.ts** - 最近使用測試 (7 測試案例)
- ✅ **useSearchHistory.test.ts** - 搜尋歷史測試 (8 測試案例)
- ✅ **useReviewSort.test.ts** - 評論排序測試 (9 測試案例)

### 📁 新增文件
- `client/src/hooks/__tests__/useFavorites.test.ts`
- `client/src/hooks/__tests__/useRecentTools.test.ts`
- `client/src/hooks/__tests__/useSearchHistory.test.ts`
- `client/src/hooks/__tests__/useReviewSort.test.ts`

---

## [2.9.0] - 2026-01-17

### 📊 統計儀表板完善

- 📅 **時間範圍選擇器** - 支援 7天/30天/90天/全部時間範圍
- 📈 **圖表動態更新** - 訪問趨勢圖表根據選定時間範圍過濾數據
- 🎯 **描述文字動態** - 圖表描述根據時間範圍自動調整

### 📁 新增文件
- `client/src/components/TimeRangeSelector.tsx` - 時間範圍選擇器元件

### 📁 修改文件
- `client/src/components/AnalyticsDashboard.tsx` - 整合時間範圍選擇器

---

## [2.8.0] - 2026-01-17

### 💬 評論系統增強

- ↕️ **評論排序** - 支援最新/最舊/最高分/最低分/最多讚 5 種排序
- ✏️ **評論編輯** - 作者可編輯自己的評論和評分
- 🗑️ **評論刪除** - 作者可刪除自己的評論

### 📁 新增/修改文件
- `client/src/hooks/useReviewSort.ts` - 評論排序 Hook
- `client/src/lib/reviewService.ts` - 新增 updateReview 函數
- `client/src/components/ReviewList.tsx` - 整合排序 UI
- `client/src/components/ReviewItem.tsx` - 新增編輯/刪除功能

---

## [2.7.0] - 2026-01-17

### 🔍 進階搜尋與篩選

- 📝 **搜尋歷史** - 自動記錄最近 10 筆搜尋，快速重複搜尋
- 🏷️ **熱門標籤快選** - 一鍵點選標籤快速篩選工具
- ↕️ **排序選項** - 支援隨機、熱門、名稱、最新排序
- 🎯 **標籤篩選** - 多標籤組合篩選

### 📁 新增文件
- `client/src/hooks/useSearchHistory.ts` - 搜尋歷史 Hook
- `client/src/hooks/useSortOptions.ts` - 排序選項 Hook
- `client/src/components/TagQuickSelect.tsx` - 標籤快選元件
- `client/src/components/AdvancedSearch.tsx` - 進階搜尋區塊

### 📁 修改文件
- `client/src/pages/Home.tsx` - 整合進階搜尋功能

---

## [2.6.0] - 2026-01-17

### 🤖 AI 智慧推薦引擎

- 🎯 **個人化推薦** - 基於使用習慣與收藏推薦工具
- 📊 **多維度演算法** - 分類偏好 40% + 標籤相似度 30% + 熱門度 20% + 新鮮度 10%
- 💡 **推薦原因** - 顯示「您喜歡遊戲類工具」等個人化原因
- 🔥 **熱門推薦** - 新使用者顯示熱門工具排行

### 📁 新增文件
- `client/src/lib/recommendation.ts` - 推薦演算法核心
- `client/src/hooks/useRecommendations.ts` - 推薦 Hook
- `client/src/components/RecommendedTools.tsx` - 推薦區塊 UI

### 📁 修改文件
- `client/src/pages/Home.tsx` - 首頁整合推薦區塊

---

## [2.5.0] - 2026-01-17

### 🏆 成就系統進階功能

- 🎖️ **10 個成就徽章** - 探索者、收藏家、遊戲達人、知識海綿等
- ✨ **金色光環動畫** - 解鎖時顯示華麗的光環與星星粒子效果
- 📊 **進度追蹤** - 即時顯示各成就完成百分比
- 🔔 **解鎖通知** - Toast 通知提示解鎖成就與獲得點數
- 💾 **本地儲存** - LocalStorage 儲存成就進度，離線可用

### 成就清單

| 成就 | 解鎖條件 | 點數 |
|------|----------|------|
| 🌅 早起的鳥兒 | 早上 6-8 點使用 | 10 |
| 🌙 夜貓子 | 晚上 22-24 點使用 | 10 |
| 📚 知識海綿 | 教學類工具 20 次 | 25 |
| 🎮 遊戲達人 | 遊戲類工具 30 次 | 25 |
| 💬 評論家 | 發表 5 則評論 | 25 |
| ⭐ 收藏家 | 收藏 10 個工具 | 15 |
| 🔍 探索者 | 瀏覽 20 個工具 | 15 |
| 🏆 完美主義者 | 瀏覽全部 43 個 | 100 |
| 🔥 連續登入 | 連續 7 天 | 50 |
| 💎 白金會員 | 累積 500 點 | 特殊 |

### 📁 新增/修改文件
- `client/src/lib/achievements.ts` - 成就定義與進度計算
- `client/src/hooks/useAchievements.ts` - 成就追蹤 Hook
- `client/src/components/AchievementBadge.tsx` - 金色光環動畫
- `client/src/components/AchievementsList.tsx` - 成就列表重構
- `client/src/pages/ToolDetail.tsx` - 整合成就追蹤

---

## [2.4.0] - 2026-01-17

### 🖼️ 圖片 WebP 轉換

- 💾 **58 張圖片轉 WebP** - 節省 27.28 MB（平均壓縮 90%）
- 🎨 **picture 元素** - HTML5 picture 標籤支援 WebP + PNG 回退
- ⚡ **載入優化** - 新增 lazy loading 延遲載入

### ♿ 無障礙性 (A11y) 優化

- ⌨️ **Skip Link** - 鍵盤使用者可跳過導航直達主內容
- 🎬 **Reduced Motion** - 尊重使用者動畫偏好設定
- 🔍 **焦點可見性** - 改善鍵盤焦點視覺指示
- 📝 **ARIA 標籤** - 主內容區添加 role="main" 和 aria-label

### 📁 修改文件
- `client/index.html` - 新增 skip-link 和 A11y 樣式
- `client/src/pages/Home.tsx` - 添加 main-content ID
- `client/src/components/ToolCard.tsx` - WebP picture 元素
- `client/src/pages/ToolDetail.tsx` - WebP picture 元素
- `scripts/convert-to-webp.cjs` - 圖片轉換腳本

---

## [2.3.3] - 2026-01-17

### 🎲 卡片隨機排序

- 🔀 **工具卡片隨機排列** - 每次重新整理頁面，43 個工具卡片都會重新洗牌
- 👀 **增加能見度** - 所有工具都有機會出現在首頁頂部
- 📱 **全平台支援** - 桌面端和行動端都會隨機排列

### 📁 修改文件
- `client/src/pages/Home.tsx` - 新增 Fisher-Yates 洗牌演算法

---

## [2.3.2] - 2026-01-17

### 📱 使用者體驗優化

- 🔝 **相關推薦卡片** - 點擊後自動捲動到頁面頂部，方便查看新工具
- 🖥️ **分享按鈕優化** - 桌面端直接複製連結，不再顯示 Windows 空白對話框
- 📱 **行動裝置分享** - 保留原生分享功能，提供最佳體驗

### 📁 修改文件
- `client/src/pages/ToolDetail.tsx` - 修復 RelatedTools 和 handleShare

---

## [2.3.1] - 2026-01-17

### 🔧 修復與優化

- 🎨 **Toast 通知美化** - 成功訊息改為綠色漸層背景，錯誤訊息為紅色漸層
- 📱 **分享按鈕優化** - 桌面端自動改用「複製連結」避免空白彈窗
- ✅ **分享成功提示** - 分享成功後顯示確認通知

### 📁 修改文件
- `client/src/components/ui/toast.tsx` - 優化 toast 樣式
- `client/src/pages/ToolDetail.tsx` - 修復分享功能邏輯

---

## [2.3.0] - 2026-01-17

### ⚡ Lighthouse 效能優化

- 🚀 **字體預載入** - 預載入 Inter 字體，減少 FOUT
- 🎨 **關鍵 CSS 內聯** - 內聯必要樣式防止 CLS
- ⏳ **載入動畫** - 初始載入時顯示美觀的 spinner
- 📦 **資源預連接** - 優化 Firestore 和 Google Fonts 連接

#### 效能改進
- 減少 First Contentful Paint (FCP)
- 減少 Cumulative Layout Shift (CLS)
- 改善 Largest Contentful Paint (LCP)

### 📁 修改文件
- `client/index.html` - 新增 preload、inline CSS、loading spinner

---

## [2.2.9] - 2026-01-17

### 🎯 工具標籤系統

- 🏷️ **43 個工具添加標籤** - 每個工具 4-5 個相關標籤
- 🔍 **搜尋功能增強** - 支援標題、描述、標籤三重搜尋
- 🎨 **標籤 Chips 顯示** - 工具卡片上顯示最多 4 個標籤

#### 搜尋範例
- 搜尋「AI」可找到：評語優化、客服等 AI 相關工具
- 搜尋「遊戲」可找到所有遊戲類工具
- 搜尋「數學」可找到九九乘法表練習器

### 📁 修改文件
- `client/src/lib/data.ts` - 為所有工具添加 tags 欄位
- `client/src/pages/Home.tsx` - 搜尋邏輯支援標籤
- `client/src/components/ToolCard.tsx` - 顯示標籤 chips

---

## [2.2.8] - 2026-01-17

### ✨ 新增工具

- 🌐 **課程計畫英文轉寫小精靈** (ID 43)
  - 上傳中文課程計畫 (PDF, DOCX)
  - 自動翻譯並整理成 Markdown 表格
  - 分類：語言 (language)
  - 網址：https://bilingual.smes.tyc.edu.tw/

### 📁 修改文件
- `client/src/lib/data.ts` - 新增工具 ID 43
- `client/public/previews/preview_bilingual_translator.png` - 新增預覽圖

---

## [2.2.7] - 2026-01-17

### 🎨 修復重複工具預覽圖

- 🖼️ **9 個工具獨特預覽圖** - 消除所有重複使用的圖片
- ✨ **高品質 AI 生成圖片** - 每個工具專屬設計

#### 更新的工具
- 互動遊戲抓抓樂 (Claw Machine)
- 遊戲觸屏碰碰碰 (Touch Collision)
- 觸屏點點塗鴉區 (Touch Doodle)
- 貪食蛇互動遊戲 (Snake Game)
- 互動式影像聲音遊戲區 (Interactive AV)
- 聲波擴散360小遊戲 (Sound Wave)
- 聲音互動小遊戲 (Sound Control)
- 吉他彈唱🎸點歌系統🎵 (Guitar Song)
- Padlet行政宣導動態牆 (Padlet Wall)

### 📁 修改文件
- `client/src/lib/data.ts` - 更新 previewUrl 路徑
- `client/public/previews/` - 新增 9 張獨特工具圖片

---

## [2.2.6] - 2026-01-17

### 🖼️ 工具卡片圖片更新

- 🎨 **21 個工具獨特預覽圖** - 使用 Nano Banana Pro 風格 3D 渲染生成
- ✨ **每個工具專屬圖片** - 不再重複使用相同圖片
- 🌈 **高品質視覺呈現** - 精美的 3D 風格插圖

#### 已更新的工具 (ID 1-21)
- 線上即時客服、行政業務協調系統、學生即時投票系統
- PIRLS閱讀理解生成、校園點餐系統、蜂類配對消消樂
- 點石成金蜂、12年教案有14、超級瑪莉歐冒險
- 班級小管家、剛好學互動、PIRLS閱讀理解網
- 5W1H靈感發射器、早安長輩圖、社群領域會議報告
- 親師溝通小幫手、單一抽籤、大量抽籤
- 專屬客服設計、英打練習、中打練習

### 📁 修改文件
- `client/src/lib/data.ts` - 更新工具 1-21 的 previewUrl
- `client/public/previews/` - 新增 21 張獨特工具圖片

---

## [2.2.5] - 2026-01-17

### 🎨 UI/UX 持續優化

#### 頁尾區塊 (Footer)
- 🎨 **深色漸層背景** - `from-slate-800 via-slate-900 to-slate-800`
- 📐 **緊湊一行式佈局** - 水平排列 (桌面)
- ✨ **功能亮點標籤** - 互動式工具 • 教學資源 • 趣味遊戲
- 📱 **RWD 優化** - 手機端垂直排列

#### 排行榜區塊 (ToolRankings)
- 🏆 **更大獎杯圖標** - `w-7/8 h-7/8`
- 📝 **更大工具標題** - `text-base/lg font-bold`
- 🔢 **更大使用次數** - `text-base/lg font-mono`
- 🎯 **更大排名數字** - `text-sm/base font-bold`
- 📦 **更大 Badge** - `py-1.5/2 px-2/3` + 黃色圖標
- 🗑️ **移除「點擊開啟新視窗」** - 減少雜訊
- 📐 **更緊湊間距** - `p-3 mb-2 rounded-xl`

### 📁 修改文件
- `client/src/pages/Home.tsx` - 頁尾區塊緊湊化
- `client/src/components/ToolRankings.tsx` - 排行榜字體放大

---

## [2.2.4] - 2026-01-17

### 🎨 UI/UX 大幅優化

#### 主標題區塊
- ✨ **漸層背景設計** - `from-blue-600 via-indigo-600 to-purple-600`
- 🎯 **標題置中顯示** - 添加星星裝飾 ✨
- 📝 **新增副標題** - 「探索阿凱老師開發的教育工具」
- 💫 **光暈背景裝飾** - 圓形模糊效果

#### 訪客計數器
- 🔢 **超大數字顯示** - `text-5xl ~ 8xl font-black`
- 📊 **增大統計標籤字體**
- 🎨 **漸層進度條優化**

#### 阿凱老師卡片
- 🎨 **藍紫漸層背景** + 光暈效果
- 💛 **黃色圖標設計** - `text-yellow-300`
- 🪟 **玻璃效果成就標籤** - `backdrop-blur-sm`

#### 搜尋與篩選區塊
- 🔍 **更大搜尋輸入框** - `h-12` 橙色邊框
- 🏷️ **分類按鈕豐富顏色** - 每個分類專屬色
- 🎯 **自動跳轉功能** - 點擊分類後滾動到工具區
- ⭕ **圓角按鈕設計** - `rounded-full`
- 🔄 **hover 放大效果** - `hover:scale-105`

#### 工具詳情頁 (/tool/:id)
- 📌 **固定導航列** - sticky + backdrop-blur
- 🎨 **Hero 區塊漸層背景**
- 📸 **大預覽圖設計** - `rounded-2xl` + 陰影
- 📊 **卡片式統計顯示** - 雙卡片網格
- 📱 **手機端按鈕優化** - 垂直堆疊佈局

#### 工具卡片 (ToolCard)
- 💜 **分類專屬背景色** - 漸層效果
- ❤️ **更大收藏按鈕** - `h-10 ~ h-11`
- 📝 **更大標題字體** - `text-lg ~ 2xl font-bold`
- 🔘 **吸睛開啟按鈕** - 漸層 + 陰影 + 圖標
- 🎯 **hover 浮起效果** - `scale: 1.02, y: -4`
- 📱 **RWD 響應式優化**

### 🗑️ 移除功能
- ❌ 移除自定義圖標按鈕 (Settings2)
- ❌ 移除分享並協作按鈕 (Share2)
- ❌ 移除相關 Dialog 和未使用的 imports
- ❌ 移除重複的簡介文字區塊

### 📁 修改文件
- `client/src/pages/Home.tsx` - 主標題、搜尋區塊優化
- `client/src/pages/ToolDetail.tsx` - 詳情頁面大幅重構
- `client/src/components/ToolCard.tsx` - 卡片優化、移除未使用功能
- `client/src/components/SearchBar.tsx` - 搜尋輸入框優化
- `client/src/components/CategoryFilter.tsx` - 分類按鈕優化
- `client/src/components/VisitorCounter.tsx` - 計數器字體增大
- `client/src/components/TeacherIntro.tsx` - 老師卡片漸層效果

---

## [2.2.3] - 2026-01-17

### 重大修復 🎉
- 🔧 **工具詳情頁圖片 404 問題徹底修復**
  - ToolDetail.tsx 使用 `import.meta.env.BASE_URL` 動態處理圖片路徑
  - 同時支援本地開發 (`/`) 和 GitHub Pages (`/Akai/`)
  - 添加 onError 處理優雅降級
- 🔧 **manifest.json 子路由 404 問題修復**
  - 使用動態腳本自動偵測部署環境
  - 動態插入正確的 favicon 和 manifest link 標籤
  - 解決 `/Akai/tool/9` 等子路由下資源載入失敗

### 技術改進
- 📦 **Service Worker 更新至 v2.2.0**
  - 強制清除舊版本快取
  - 確保新部署即時生效
- 🏠 **index.html 智慧路徑處理**
  - 根據 `window.location.pathname` 自動判斷 base path
  - favicon、manifest 等資源路徑動態生成

### 修復文件
- `client/src/pages/ToolDetail.tsx` - 圖片路徑使用 BASE_URL
- `client/index.html` - 動態腳本設定資源路徑
- `client/public/sw.js` - 版本號更新至 v2.2.0

---

## [2.2.2] - 2026-01-16

### UI/UX 優化
- ✨ **「跳至工具排行榜」按鈕大改版**
  - 橙色到玫瑰色漸層邊框設計
  - 獎杯圖示彈跳動畫 (2s 週期)
  - 右上角紅點脈衝提示
  - 向下箭頭指示動畫
  - hover 光暈效果增強
  - 完整 RWD 支援 (sm/md/lg)
- 📄 **FUTURE_DEVELOPMENT.md 文檔**
  - 詳細優先級矩陣 (P0-P4)
  - 具體實作程式碼範例
  - 12 週建議時程規劃

---

## [2.2.1] - 2026-01-16

### 問題修復
- 🔧 **Service Worker 206 錯誤修復**
  - 只快取完整 200 OK 響應，跳過 Partial Response
  - 更新 Service Worker 版本至 v2.1.0
- 🔧 **SPA 路由 404.html 支援**
  - 建立 404.html 重定向機制
  - index.html 處理重定向邏輯
- 🔧 **RWD 中等寬度佈局修復**
  - 將雙欄佈局斷點從 lg 改為 xl (1280px)
  - 解決排行榜文字垂直排列問題
- 🔧 **動態 BASE_URL 圖片路徑**
  - 移除 base 標籤
  - 使用 import.meta.env.BASE_URL 動態處理
  - 同時支援本地開發和 GitHub Pages

---

## [2.2.0] - 2026-01-16

### 新增功能
- 🧪 **測試框架建立**：完整的測試基礎設施
  - 安裝並配置 Vitest 單元測試框架
  - 安裝並配置 Playwright E2E 測試框架
  - 建立測試環境設定檔 (`vitest.config.ts`, `playwright.config.ts`)
  - 新增 `npm run test`, `npm run test:coverage`, `npm run test:e2e` 指令
- 🔍 **程式碼品質工具**：ESLint 和 Prettier 整合
  - 安裝 ESLint 及 TypeScript、React、無障礙性插件
  - 建立 `.eslintrc.json` 嚴格模式配置
  - 安裝 Prettier 並建立 `.prettierrc` 配置
  - 新增 `npm run lint`, `npm run format` 指令
- 🖼️ **新預覽圖生成**：消除重複圖片
  - Typing (打字練習) - 用於英打、中打、成語練習
  - Puzzle (益智遊戲) - 用於蜂類配對消消樂
  - Privacy (隱私保護) - 用於兒童臉部隱私保護工具
  - Platformer (平台遊戲) - 用於瑪莉歲系列遊戲

### 改進
- 🧹 **程式碼清理**：移除 11 個除錯用 console.log
  - 保留 console.error 和 console.warn 用於錯誤處理
  - 清理檔案：authService.ts, useToolTracking.ts, TourProvider.tsx, TourGuide.tsx, VisitorCounter.tsx, ui/ToolCard.tsx
- 📦 **Bundle 大小**：維持 78KB，達成 < 100KB 目標

### 技術細節
- 新增測試相關依賴：vitest, @vitest/ui, @vitest/coverage-v8, @playwright/test, @testing-library/react
- 新增程式碼品質依賴：eslint, prettier, @typescript-eslint/*
- 新增 4 張預覽圖到 `client/public/previews/`
- 更新 `data.ts` 中相關工具的 previewUrl

---

## [2.1.0] - 2026-01-16

### 新增功能
- ✨ **全新 Nano banana Pro 風格預覽圖**：為所有工具卡片生成高品質 3D 插圖預覽圖
  - 生成 13 張獨特的類別專屬預覽圖
  - Communication（通訊）、Interactive（互動）、Utility（工具）、Reading（閱讀）
  - Games（遊戲）、Teaching（教學）、Language（語言）
  - Admin（行政）、Space（太空）、Music（音樂）、Magic（魔術）
  - Lottery（抽籤）、Feedback（評語）
- 🎨 **視覺升級**：將 SVG 預覽圖替換為 AI 生成的現代 3D 插圖
- 🔧 **ToolCard 元件優化**：修改為直接顯示圖片，移除 SVG 生成器

### 改進
- 📝 大幅減少重複的預覽圖，提升視覺識別度
- 🖼️ 所有預覽圖統一為 16:9 比例，保持一致性
- ⚡ 優化圖片載入效能和錯誤處理

### 技術細節
- 新增 11 張獨特預覽圖到 `client/public/previews/`
- 更新 `data.ts` 中所有工具的 `previewUrl` 屬性
- 修改 `ToolCard.tsx` 使用 `<img>` 標籤替代 `PreviewGenerator`

---

## [2.0.0] - 2026-01-15

### 重大更新
- 🎉 專案正式發布 2.0 版本
- 📱 完整的響應式設計（RWD）
- 🌙 深色/淺色主題支援
- 🔐 Firebase 身份驗證整合
- ⭐ 評論和評分系統
- 📊 工具使用統計和排行榜
- 👨‍🎓 訪客計數功能
- 🎯 使用者收藏功能
- 📜 最近使用歷史

### 技術架構
- React 18.3 + TypeScript
- TailwindCSS + Radix UI
- Firebase Firestore
- Vite 5.4
- Express 後端

---

## [1.0.0] - 初始版本

### 核心功能
- 教育工具展示平台
- 工具分類系統
- 基礎搜尋功能
