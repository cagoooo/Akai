# 更新日誌

此文件記錄專案的所有重要變更。

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
