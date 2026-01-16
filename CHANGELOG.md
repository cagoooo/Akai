# 更新日誌

此文件記錄專案的所有重要變更。

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
