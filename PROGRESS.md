# 阿凱老師教育工具集 - 開發進度與歷史紀錄

## 🎯 當前版本狀態
- **當前版本**: `v3.5.7`
- **最後更新狀態**: 部署 3.5.7 版本，新增許願池專屬分享連結功能。


## 📌 完成功能總覽

### `v3.5.7` (最新)
- **許願池分享連結**：新增 `?wish=1` URL 參數支援，開啟網址即自動彈出許願池對話框。
- **複製連結按鈕**：許願池對話框內新增「分享連結」按鈕，一鍵複製專屬連結方便分享。

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

> **最後審核日期**：2026-04-17  
> **審核基準**：根據 v3.5.7 完整程式碼庫分析，交叉比對已完成功能後重新整理。

### ✅ 已完成項目（從舊版建議中移除）

下列為過去列在「未來建議」中、但截至 v3.5.7 已經完成的項目，不再列入待辦：

| 舊建議項目 | 完成版本 | 對應實作 |
|------------|----------|----------|
| 工具人氣與評價系統 | v3.2.1+ | `ToolRankings.tsx`、`ReviewForm.tsx`、`StarRating.tsx`、Firestore `toolUsageStats` |
| 個人化近期使用紀錄 | v3.0.0+ | `useRecentTools.ts` Hook、`RecommendedTools.tsx` 為您推薦區塊 |
| 卡片快捷動作 (QRCode/複製連結) | v3.2.1 | `ToolCard.tsx` 已有 QRCode 投影按鈕 + 複製連結按鈕 |
| 管理員權限與數據後台 | v3.0.0+ | `AdminAuth.tsx` Firebase Custom Claims + `AnalyticsDashboard.tsx` 完整圖表 |
| 圖片自動壓縮與轉檔 (WebP) | v3.2.1 | `compress-images.mjs` 腳本 + `npm run optimize:images` 指令 |
| 進階複合搜尋與標籤過濾 | v3.5.3 | `AdvancedSearch.tsx` 多標籤篩選 + URL Query String 雙向同步 |
| 許願池分享連結 | v3.5.7 | `?wish=1` URL 參數 + 對話框內「分享連結」按鈕 |

---

### 🔴 P0：高優先 — 立即可動手（1～2 週）

#### 1. 收藏雲端同步 (Cloud Favorites Sync)
- **現況**：收藏功能仰賴 `useFavorites.ts` 寫入 LocalStorage，換瀏覽器或清快取即遺失。
- **做法**：已有 Firebase Auth (`useAuth.ts`) 與 Google 登入；只需在登入後將 LocalStorage 的 favorites 陣列寫入 Firestore `userFavorites/{uid}` 集合，並在每次 mount 時雙向合併。
- **注意**：未登入使用者仍維持 LocalStorage 運作，登入後自動合併不覆蓋。
- **預期效益**：解決老師們最常反映的「換電腦收藏不見」痛點，提升黏著度。
- **難度**：⭐⭐ 中等 ｜ **工時**：2～3 天

#### 2. 死鏈自動巡檢系統 (Link Health Monitor)
- **現況**：81 個外部工具 URL 全靠人工確認，一旦工具下架或搬遷，使用者點擊會撲空。
- **做法**：建立 GitHub Actions 排程 (weekly cron)，以 Node.js 腳本讀取 `tools.json` 逐一 HEAD 請求，將 4xx/5xx/timeout 結果寫成 Issue 或推送 LINE Messaging API 通知。
- **加分項**：在 `/admin` 儀表板新增「連結健康」區塊，紅/黃/綠燈顯示各工具可用性。
- **預期效益**：零人工維護工具可用率，平台可信度大幅提升。
- **難度**：⭐⭐ 中等 ｜ **工時**：1～2 天

#### 3. TypeScript 型別健全化 (Type Safety Cleanup)
- **現況**：`tsc --noEmit` 有 6+ 個錯誤，包括 `@/types/analytics` 模組缺失、`heatmap.js` 無型別宣告、`AnalyticsDashboard.tsx` 隱式 any 等。
- **做法**：
  - 建立 `client/src/types/analytics.d.ts` 定義 `VisitorStats`、`ToolUsageStat` 介面。
  - 新增 `client/src/types/heatmap.d.ts`（`declare module 'heatmap.js'`）。
  - 修正 `DiagnosticsDashboard.tsx` 的 `systemInfo` 型別定義。
- **預期效益**：CI 類型檢查通過，避免潛在 runtime 錯誤，開發體驗更順暢。
- **難度**：⭐ 簡單 ｜ **工時**：半天

---

### 🟡 P1：中優先 — 體驗顯著升級（2～4 週）

#### 4. 深色模式 (Dark Mode)
- **現況**：全站統一淺色模式 (v3.5.6 已清洗)，但教師在投影或夜間使用有視覺疲勞。
- **做法**：Tailwind 已支援 `dark:` 前綴；在 `<html>` 加 `class="dark"` 切換。需處理：
  - 卡片 (`ToolCard.tsx`) 背景、邊框、文字顏色
  - 對話框 (`Dialog`) 背景半透明度
  - 漸層按鈕在深色下的對比度
  - 使用 `localStorage` 記住偏好 + `prefers-color-scheme` 跟隨系統
- **預期效益**：降低教師在暗環境使用的視覺負擔，提升專業感。
- **難度**：⭐⭐⭐ 較難（全站 50+ 組件需逐一調色）｜ **工時**：4～5 天

#### 5. 萬能指令面板 (Command Palette / CMD+K)
- **現況**：已有 `KeyboardShortcutsDialog.tsx` 與 `useKeyboardShortcuts.ts`，但 `Ctrl+K` 只觸發搜尋聚焦。
- **做法**：建立 `CommandPalette.tsx` 組件，支援：
  - `搜尋工具名稱` → 直接跳轉
  - `wish:` 前綴 → 開啟許願池並預填內容
  - `goto: 管理後台` → 路由導航
  - `tag: AI工具` → 套用篩選
  - 模糊匹配 + 鍵盤上下選取 + Enter 確認
- **技術**：可用 `cmdk` 套件（<5KB gzip）或基於現有 Radix `Command` 組件。
- **預期效益**：進階使用者（資訊組長等）效率翻倍，提升平台專業度。
- **難度**：⭐⭐ 中等 ｜ **工時**：2～3 天

#### 6. 許願池語意分析與優先級標記 (Wish Semantic Analysis)
- **現況**：`WishingWellAdmin.tsx` 只能依時間序列讀取，管理者需逐條人工判斷。
- **做法**：
  - 在 Cloud Functions 的 `onWishCreated` 觸發器中，呼叫 Gemini API 對 `content` 做三分類：「🔧 功能需求」、「🐛 問題回報」、「💖 鼓勵感謝」。
  - 自動寫入 Firestore `wishingWell/{id}.aiLabel` 欄位。
  - 管理後台支援按標籤篩選 + 優先級排序。
- **預期效益**：管理者 10 秒掌握全局，不再遺漏緊急回報。
- **難度**：⭐⭐ 中等 ｜ **工時**：2 天

#### 7. 工具使用時長追蹤 (Dwell Time Analytics)
- **現況**：`useToolTracking.ts` 只記錄點擊次數，無法區分「點了一下就關」和「深度使用 10 分鐘」。
- **做法**：
  - 在 `ToolDetail.tsx` mount 時記錄 `startTime`，unmount 或 `visibilitychange` 時計算停留秒數。
  - 寫入 Firestore `toolUsageStats/{toolId}.totalDwellSeconds` 累計。
  - 儀表板新增「平均使用時長 Top 10」圖表。
- **預期效益**：區分真正好用的工具 vs. 只是好奇點進去的工具，數據更有參考價值。
- **難度**：⭐⭐ 中等 ｜ **工時**：2 天

---

### 🟢 P2：低優先 — 長期價值投資（1～2 個月）

#### 8. AI 語意搜尋與 RAG 推薦 (Semantic Search)
- **現況**：`SearchBar.tsx` 採純文字 `includes()` 比對 title + description，無法理解語意。
- **做法**：
  - 用 Gemini Embedding API 將 81 個工具的 `detailedDescription` 預先向量化，存為靜態 JSON。
  - 使用者搜尋時，將查詢轉為向量，在前端做餘弦相似度排序（81 筆資料量可前端計算）。
  - 搜尋結果附加「AI 推薦理由」氣泡。
- **搜尋範例**：輸入「我想讓學生分組比賽」→ 推薦遊戲類 + 互動類工具，即使 title 中沒有「比賽」二字。
- **預期效益**：搜尋命中率從關鍵字匹配提升至語意理解層級。
- **難度**：⭐⭐⭐ 較難 ｜ **工時**：1 週

#### 9. AI 智慧教案生成助手 (Lesson Plan Generator)
- **現況**：教師需自行從 81 個工具中挑選搭配，缺乏引導。
- **做法**：
  - 建立 `LessonPlanWizard.tsx` 精靈介面：第一步選年級+科目，第二步輸入教學目標。
  - 後端呼叫 Gemini，根據工具庫自動組合「教學一條龍」方案（例：注音 → 拼圖 → 小測驗 → 許願池回饋收集）。
  - 輸出可列印的 PDF 或可分享的連結。
- **預期效益**：大幅降低教師備課壓力，提升平台從「工具集」到「教學助手」的定位。
- **難度**：⭐⭐⭐⭐ 困難 ｜ **工時**：1～2 週

#### 10. 教師共創平台 (Teacher-Generated Content)
- **現況**：所有工具由阿凱老師一人維護新增。
- **做法**：
  - 新增「推薦工具」表單（類似許願池但欄位更結構化：工具名稱、URL、分類、適用年級、使用心得）。
  - 審核流程：教師提交 → Firestore `pendingTools` → 管理員審核 → 合併至 `tools.json`。
  - 獲得採納的教師獲得虛擬勳章（整合現有 `AchievementBadge.tsx`）。
- **預期效益**：從單人維護轉型為社群共建，工具庫成長速度倍增。
- **難度**：⭐⭐⭐ 較難 ｜ **工時**：1 週

#### 11. 工具聯動分析 (Cross-Tool Usage Patterns)
- **現況**：`AnalyticsDashboard.tsx` 只看單一工具的點擊量，無法看出工具間的關聯。
- **做法**：
  - 在 `useToolTracking.ts` 記錄每次 session 內點擊的工具序列。
  - 後台新增「常見組合」桑基圖 (Sankey Diagram)，顯示老師們最常連續使用的工具配對。
  - 在 `ToolDetail.tsx` 底部新增「使用這個工具的老師也常用...」推薦區塊。
- **預期效益**：揭示隱藏的教學流程模式，為教案生成提供數據支撐。
- **難度**：⭐⭐⭐ 較難 ｜ **工時**：4～5 天

---

### 🔵 P3：探索性 — 平台演進方向（2～3 個月）

#### 12. 多語系支援 (i18n)
- **現況**：`LanguageSelector.tsx` 已有 UI 框架但尚未實作實際翻譯邏輯。
- **做法**：導入 `react-i18next`，優先支援英文 (en) 與日文 (ja)，讓台灣教育工具也能走向國際。
- **難度**：⭐⭐⭐ 較難 ｜ **工時**：1～2 週

#### 13. 離線教案模式 (Offline Teaching Mode)
- **現況**：PWA 已有 Service Worker 快取，但僅快取靜態資源；工具本身皆為外部連結，離線時無法使用。
- **做法**：
  - 精選 5～10 個純前端工具（如注音練習、拼圖等），允許 Service Worker 預快取其完整 HTML/JS。
  - 離線時卡片標示「可離線使用 ✈️」徽章，其餘標示「需要網路」。
- **預期效益**：偏鄉或網路不穩教室也能使用核心教學工具。
- **難度**：⭐⭐⭐⭐ 困難 ｜ **工時**：1～2 週

#### 14. 進階無障礙合規 (WCAG 2.1 AA)
- **現況**：`AccessibilityMenu.tsx` 提供字體大小、高對比、減少動態等選項，但部分組件缺少 ARIA 標籤。
- **做法**：
  - 全站跑 axe-core 自動掃描，修復所有 Critical/Serious 等級問題。
  - 確保所有浮動按鈕（許願池、快捷鍵、回到頂部）都有 `aria-label`。
  - 確保 Tab 鍵可完整走訪所有互動元素。
- **預期效益**：達到教育部數位無障礙標準，服務特殊需求教師。
- **難度**：⭐⭐ 中等 ｜ **工時**：3～4 天

#### 15. 數據備份與災難恢復 (Data Backup)
- **現況**：Firestore 資料（訪客統計、評論、許願池）無定期備份機制。
- **做法**：
  - 利用 Firebase Extensions 或 Cloud Functions 排程，每日自動匯出 Firestore 至 Cloud Storage。
  - 管理後台新增「手動備份」與「還原」按鈕。
- **預期效益**：防止誤刪或資料庫異常導致數據全失。
- **難度**：⭐⭐ 中等 ｜ **工時**：2 天

---

### 🔧 技術債務待處理 (Tech Debt)

| 問題 | 優先級 | 說明 | 對應檔案 |
|------|--------|------|----------|
| TypeScript 型別錯誤 | 🔴 高 | `@/types/analytics` 模組缺失，6+ 個 `tsc` 編譯錯誤 | `AnalyticsDashboard.tsx`、`DiagnosticsDashboard.tsx` |
| heatmap.js 型別宣告 | 🟡 中 | 缺少 `.d.ts` 宣告檔，IDE 無法提供智慧提示 | `AnalyticsDashboard.tsx:149` |
| Firestore 規則過度開放 | 🟡 中 | `visitorStats` 和 `toolUsageStats` 為 `read/write: true`，可能被惡意灌水 | `firestore.rules` |
| IP 地理定位 HTTPS 不支援 | 🟡 中 | `ip-api.com` 僅支援 HTTP，應改用 `ipinfo.io` (50k/月免費) | `VisitorCounter.tsx` |
| 儀表板假數據殘留 | 🟢 低 | 部分統計卡片（本週流量等）使用硬編碼假數據 | `AnalyticsDashboard.tsx` |
| `FUTURE_DEVELOPMENT.md` 內容過時 | 🟢 低 | 仍停留在 v2.25.0 描述，多項建議已完成但未標記 | `FUTURE_DEVELOPMENT.md` |

---

### 📅 建議開發時程表

```
第 1 週 ─── P0 快速收穫
  ├─ Day 1     : #3 TypeScript 型別健全化（半天即可完成）
  ├─ Day 1-2   : #2 死鏈自動巡檢 GitHub Actions
  └─ Day 3-5   : #1 收藏雲端同步（Firebase Auth 已就緒）

第 2-3 週 ── P1 體驗升級
  ├─ Day 6-7   : #5 萬能指令面板 (CMD+K)
  ├─ Day 8-9   : #6 許願池 AI 語意分析
  ├─ Day 10-11 : #7 工具使用時長追蹤
  └─ Day 12-16 : #4 深色模式（全站組件調色）

第 4-6 週 ── P2 AI 深度整合
  ├─ Week 4    : #8 AI 語意搜尋
  ├─ Week 5    : #9 AI 教案生成助手
  └─ Week 6    : #10 教師共創平台 + #11 工具聯動分析

第 7-10 週 ─ P3 平台演進
  ├─ Week 7-8  : #12 多語系 + #13 離線教案模式
  └─ Week 9-10 : #14 無障礙合規 + #15 數據備份
```

---
