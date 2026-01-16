# 更新日誌

此文件記錄專案的所有重要變更。

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
