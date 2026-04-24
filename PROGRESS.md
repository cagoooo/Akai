# 阿凱老師教育工具集 - 開發進度與歷史紀錄

## 🎯 當前版本狀態
- **當前版本**: `v3.6.1`
- **最後更新狀態**: E2 公佈欄精修版，完成首屏圖片預載、網站導覽升級、cork 風格 ToolDetail、訪客計數器等 20+ 項優化。


## 📌 完成功能總覽

### `v3.6.1` (最新 · E2 精修版)

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

#### 4. 📊 IP 地理定位 HTTPS 升級
- **現況**：`VisitorCounter.tsx` 仍用 `ip-api.com`（僅 HTTP），HTTPS 站點會被瀏覽器 block。
- **做法**：改用 `ipinfo.io`（50k/月免費）或 `ipdata.co`（1.5k/天），皆支援 HTTPS。
- **對應檔案**：`VisitorCounter.tsx`、`BulletinVisitorCounter.tsx`
- **預期效益**：訪客地理分布資料完整率提升
- **難度**：⭐ 簡單 ｜ **工時**：半天

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

#### 7. 📅 儀表板日期範圍篩選
- **現況**：`AnalyticsDashboard.tsx` 只顯示全時間統計，無法看特定區間趨勢。
- **做法**：
  - 新增 DateRangePicker（`react-day-picker` 已安裝）
  - 依 `timestamp` 欄位篩選 Firestore 查詢
  - 快捷選項：「最近 7 天」「本月」「上個月」「自訂範圍」
- **對應檔案**：`AnalyticsDashboard.tsx`
- **預期效益**：管理者可追蹤短期趨勢（新工具上線後流量變化）
- **難度**：⭐⭐ 中等 ｜ **工時**：2 天

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
| IP 定位 HTTPS 不支援 | 🔴 高 | ip-api.com 僅 HTTP（→ P0 #4） | `VisitorCounter.tsx` |
| 儀表板假數據殘留 | 🟡 中 | `getLocalToolStats()` 讀取從未寫入的 key | `AnalyticsDashboard.tsx` |
| 字型 subset 手動重跑 | 🟢 低 | OG 圖文字改時需手動 `npm run subset-wish-font` | `subset-wish-font.mjs` |
| FUTURE_DEVELOPMENT.md 過時 | 🟢 低 | 仍停在 v2.25.0 | `FUTURE_DEVELOPMENT.md` |

---

### 📅 建議開發時程表（v3.6.1 之後）

```
第 1-2 週 ── P0 短期完成
  ├─ Day 1     : #4 IP 定位 HTTPS 升級（半天）
  ├─ Day 1-2   : #3 方案 A 精準懶加載
  ├─ Day 3-5   : #2 CMD+K 指令面板
  └─ Day 6-9   : #1 深色模式（全站 cork 風格調色）

第 3-4 週 ── P1 內容與分析
  ├─ Day 10-11 : #5 許願池 AI 語意分析
  ├─ Day 12-13 : #6 使用時長 + #7 日期範圍篩選
  ├─ Day 14-16 : #9 每工具專屬 OG 圖
  └─ Day 17-22 : #8 AI 語意搜尋（Embedding API）

第 5-7 週 ── P2 中期投資
  ├─ Week 5    : #10 AI 教案生成助手
  ├─ Week 6    : #11 教師共創平台 + #12 工具聯動分析
  └─ Week 7    : #13 工具收藏集

第 8-12 週 ── P3 平台演進
  ├─ Week 8-9  : #14 多語系 + #15 離線教案
  ├─ Week 10   : #16 數據備份 + #17 E2E 測試 CI
  └─ Week 11-12: #18 評論審核機制
```

---

### 🎯 下一步建議（按 CP 值排序）

**🟢 立即就做**（低成本高回報）
- #4 IP HTTPS 升級（半天搞定，立即解決訪客資料不完整）
- #7 儀表板日期範圍篩選（2 天，管理後台馬上升級）

**🟡 短期內做**（1-2 週可見成效）
- #1 深色模式（最多使用者受益，cork 夜間版會超好看）
- #2 CMD+K 指令面板（進階使用者愛用）
- #3 真·懶加載（首次訪問體感大幅提升）

**🔵 中期重點**（需要規劃但影響大）
- #5 許願池 AI 分析（減少管理時間）
- #8 AI 語意搜尋（搜尋品質躍升）
- #13 工具收藏集（全新社群玩法）

---
