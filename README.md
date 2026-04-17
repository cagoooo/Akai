# 教育科技創新專區 - 阿凱老師

![Version](https://img.shields.io/badge/version-3.5.7-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue.svg)
![React](https://img.shields.io/badge/React-18.3-61dafb.svg)

> 致力於開發實用的教育工具，結合科技與教育，為師生創造更好的教學與學習體驗。

## 📚 目錄

- [專案簡介](#-專案簡介)
- [技術棧](#-技術棧)
- [專案結構](#-專案結構)
- [功能特色](#-功能特色)
- [環境需求](#-環境需求)
- [安裝與設定](#-安裝與設定)
- [開發指南](#-開發指南)
- [資料庫設定](#-資料庫設定)
- [部署指南](#-部署指南)
- [API 文件](#-api-文件)

---

## 🎯 專案簡介

「教育科技創新專區」是一個整合多種教育工具的平台，由阿凱老師開發維護。平台提供多種實用的教育資源，包括：

| 工具名稱 | 說明 | 連結 |
|---------|------|------|
| 🗨️ 線上即時客服 | 提供即時的線上教育支援和諮詢服務 | chat.smes.tyc.edu.tw |
| 💡 激發教案靈感 | 為教師提供創新的教學設計靈感 | lesson.smes.tyc.edu.tw |
| 🗳️ 學生即時投票系統 | 即時收集學生意見的投票平台 | cagoooo.github.io/vote/ |
| 📖 PIRLS閱讀理解生成 | 專業的閱讀理解評估工具 | pirls.smes.tyc.edu.tw |
| 📱 QRCode批次產生器 | 便捷的QR碼批量生成工具 | qrcode.smes.tyc.edu.tw |
| 🎮 蜂類配對消消樂 | 寓教於樂的教育遊戲 | bee.smes.tyc.edu.tw |
| ✍️ 點「石」成金 (評語優化) | 學生評語優化工具 | LINE Bot |
| 📊 國小期中考成績篩選工具 | 協助教師快速分析與篩選期中考成績 | cagoooo.github.io/filter/ |
| 🗺️ 2026 親職日場地配置圖 | 提供親職日完整場地配置與動線規劃 | sites.google.com/mail2.smes.tyc.edu.tw/academic/2026%E8%A6%AA%E8%81%B7%E6%97%A5%E5%A0%B4%E5%9C%B0%E9%85%8D%E7%BD%AE |

---

## 🛠️ 技術棧

### 前端技術

| 技術 | 版本 | 說明 |
|------|------|------|
| **React** | 18.3.1 | 前端框架 |
| **TypeScript** | 5.6.3 | 類型安全 |
| **Vite** | 5.4.9 | 快速建置工具 |
| **TailwindCSS** | 3.4.14 | CSS 框架 |
| **Radix UI** | Latest | 無障礙元件庫 |
| **Framer Motion** | 11.18.2 | 動畫效果 |
| **TanStack Query** | 5.60.5 | 資料獲取 |
| **Recharts** | 2.15.1 | 圖表視覺化 |
| **wouter** | 3.3.5 | 路由管理 |

### 後端技術

| 技術 | 版本 | 說明 |
|------|------|------|
| **Express** | 4.21.2 | Web 框架 |
| **Drizzle ORM** | 0.38.4 | ORM 資料庫操作 |
| **PostgreSQL** | - | 主要雲端資料庫（Neon） |
| **SQLite** | better-sqlite3 | 本地備用資料庫 |
| **WebSocket** | ws 8.18.0 | 即時通訊 |
| **Passport** | 0.7.0 | 身份驗證 |

---

## 📁 專案結構

```
H:\Akai\
├── client/                    # 前端程式碼
│   ├── index.html            # HTML 入口點
│   ├── public/               # 靜態資源
│   └── src/
│       ├── App.tsx           # 應用程式入口
│       ├── main.tsx          # React 掛載點
│       ├── index.css         # 全局樣式
│       ├── components/       # React 元件
│       │   ├── ui/           # 基礎 UI 元件 (50+ 個)
│       │   ├── ToolCard.tsx  # 工具卡片
│       │   ├── ToolRankings.tsx    # 工具排行榜
│       │   ├── VisitorCounter.tsx  # 訪客計數器
│       │   ├── ThemeToggle.tsx     # 主題切換
│       │   └── ...           # 其他功能元件
│       ├── pages/            # 頁面元件
│       │   ├── Home.tsx      # 首頁
│       │   └── amp/          # AMP 頁面
│       ├── lib/              # 工具函式庫
│       │   ├── data.ts       # 工具資料定義
│       │   ├── utils.ts      # 通用工具函式
│       │   └── api-client.ts # API 客戶端
│       ├── hooks/            # 自定義 React Hooks
│       └── utils/            # 工具函式
│
├── server/                    # 後端程式碼
│   ├── index.ts              # 伺服器入口點
│   ├── routes.ts             # API 路由定義
│   ├── vite.ts               # Vite 開發伺服器整合
│   ├── amp.ts                # AMP 頁面處理
│   ├── cache.ts              # 快取管理
│   └── logger.ts             # 日誌記錄
│
├── db/                        # 資料庫層
│   ├── index.ts              # 資料庫連接管理
│   ├── schema.ts             # PostgreSQL 資料表定義
│   ├── sqlite-schema.ts      # SQLite 資料表定義
│   └── adapter.ts            # 資料庫適配器
│
├── sqlite/                    # SQLite 資料庫檔案
├── logs/                      # 日誌檔案
├── cache/                     # 快取檔案
│
├── package.json              # 專案依賴配置
├── tsconfig.json             # TypeScript 配置
├── vite.config.ts            # Vite 建置配置
├── tailwind.config.ts        # TailwindCSS 配置
├── drizzle.config.ts         # Drizzle ORM 配置
├── postcss.config.js         # PostCSS 配置
├── theme.json                # 主題配置
│
├── .replit                   # Replit 平台配置
└── replit.nix                # Nix 套件配置
```

---

## ✨ 功能特色

### 🎨 前端功能

- **響應式設計** - 完美支援桌面、平板、手機等多種裝置
- **深色模式** - 支援明暗主題自動/手動切換
- **無障礙設計** - 使用 Radix UI 確保 WCAG 2.1 無障礙標準
- **動畫效果** - 使用 Framer Motion 實現流暢過渡動畫
- **工具排行榜** - 即時顯示最受歡迎的教育工具
- **訪客統計** - 即時追蹤網站訪問量
- **導覽教學** - 內建互動式網站導覽功能 (Driver.js)
- **SEO 優化** - 完整的 meta 標籤與 Schema.org 結構化數據
- **PWA 支援** - 可安裝至手機桌面
- **🔗 快速標籤連結** - URL 參數驅動篩選（`?category=games`、`?tag=AI`、`?q=關鍵字`），分享連結自動套用並捲動至結果

### ⚙️ 後端功能

- **雙資料庫支援** - 自動在 PostgreSQL (雲端) 和 SQLite (本地) 間切換
- **健康檢查端點** - 內建 `/health` 端點監控系統狀態
- **錯誤日誌** - 完整的錯誤記錄與追蹤
- **內存快取** - 降級服務確保高可用性
- **AMP 頁面** - 支援 Google AMP 加速行動頁面

### 📊 資料追蹤

- 訪客統計（總訪問次數、每日訪問量）
- 工具使用統計（點擊次數、分類統計）
- 使用者成就系統
- 系統效能指標

---

## 💻 環境需求

- **Node.js** >= 20.x
- **npm** >= 9.x 或 **pnpm**
- **PostgreSQL** 16.x（選用，用於雲端部署）
- **Git**

---

## 🚀 安裝與設定

### 1. 複製專案

```bash
git clone <repository-url>
cd Akai
```

### 2. 安裝依賴

```bash
npm install
```

### 3. 環境變數設定

建立 `.env` 檔案（選用，本地開發可使用 SQLite）：

```env
# 資料庫設定（選用，不設定則使用 SQLite）
DATABASE_URL=postgresql://username:password@host:5432/database

# 強制使用本地 SQLite 資料庫
USE_LOCAL_DB=true

# 伺服器埠號（預設 5000）
PORT=5000

# 執行環境
NODE_ENV=development
```

### 4. 資料庫初始化

若使用 PostgreSQL：

```bash
npm run db:push
```

若使用 SQLite，資料表會在首次啟動時自動建立。

### 5. 啟動開發伺服器

```bash
npm run dev
```

伺服器將在 `http://localhost:5000` 啟動。

---

## 📖 開發指南

### 可用指令

| 指令 | 說明 |
|------|------|
| `npm run dev` | 啟動開發伺服器（含熱重載） |
| `npm run build` | 建置生產版本 |
| `npm run start` | 啟動生產伺服器 |
| `npm run check` | TypeScript 類型檢查 |
| `npm run db:push` | 推送資料庫架構變更 |

### 開發流程

1. **前端開發** - 修改 `client/src/` 下的檔案，Vite 會自動熱更新
2. **後端開發** - 修改 `server/` 下的檔案，tsx 會自動重啟伺服器
3. **資料庫變更** - 修改 `db/schema.ts` 後執行 `npm run db:push`

### 新增工具

編輯 `client/src/lib/data.ts`，在 `tools` 陣列中新增工具定義：

```typescript
{
  id: 9, // 遞增的唯一 ID
  title: "新工具名稱",
  description: "工具描述",
  url: "https://tool-url.com/",
  icon: "IconName", // Lucide React 圖示名稱
  category: "teaching", // 分類
  previewUrl: "/previews/preview.svg" // 預覽圖
}
```

---

## 🗄️ 資料庫設定

### PostgreSQL（Neon 雲端）

專案設計為使用 [Neon](https://neon.tech/) 無伺服器 PostgreSQL：

1. 註冊 Neon 帳號並建立資料庫
2. 取得連線字串並設定 `DATABASE_URL`
3. 執行 `npm run db:push` 建立資料表

### SQLite（本地開發）

適合本地開發或離線使用：

- 設定 `USE_LOCAL_DB=true` 或在 Replit 環境自動啟用
- 資料庫檔案儲存於 `sqlite/app.db`
- 資料表會自動建立

### 資料表結構

| 資料表 | 說明 |
|--------|------|
| `users` | 使用者帳號 |
| `visitor_stats` | 訪客統計 |
| `tool_usage_stats` | 工具使用統計 |
| `error_logs` | 錯誤日誌 |
| `achievements` | 成就定義 |
| `user_achievements` | 使用者獲得的成就 |
| `shared_resources` | 共享資源 |
| `mood_entries` | 心情記錄 |
| `seo_analysis_reports` | SEO 分析報告 |
| `keyword_rankings` | 關鍵字排名 |

---

## 🌐 部署指南

### Replit 部署（目前使用）

專案已配置 Replit 部署設定：

1. 匯入專案至 Replit
2. 環境變數會自動偵測
3. 點擊 Run 按鈕即可部署
4. 使用 Cloud Run 進行生產部署

### GitHub Pages 部署（僅前端靜態）

> ⚠️ **注意**：GitHub Pages 僅支援靜態網站，無法執行後端 API。

若只需部署前端展示頁面：

1. 修改 `vite.config.ts` 設定 base 路徑：
   ```typescript
   base: '/<repository-name>/'
   ```

2. 建置靜態檔案：
   ```bash
   npm run build
   ```

3. 將 `dist/public` 資料夾部署至 GitHub Pages

4. 需另外部署後端 API（見下方建議）

### Vercel / Render / Railway 部署（推薦）

這些平台支援完整的全端部署：

1. 連結 GitHub 儲存庫
2. 設定環境變數 `DATABASE_URL`
3. 設定建置指令：`npm run build`
4. 設定啟動指令：`npm run start`

### Docker 部署

建立 `Dockerfile`：

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000
CMD ["npm", "run", "start"]
```

---

## 📡 API 文件

### 訪客統計

| 端點 | 方法 | 說明 |
|------|------|------|
| `/api/stats/visitors` | GET | 取得訪客統計 |
| `/api/stats/visitors/increment` | POST | 增加訪客計數 |

### 工具統計

| 端點 | 方法 | 說明 |
|------|------|------|
| `/api/tools/rankings` | GET | 取得工具排行榜 |
| `/api/tools/stats` | GET | 取得所有工具統計 |
| `/api/tools/:toolId/track` | POST | 追蹤工具使用 |

### 系統診斷

| 端點 | 方法 | 說明 |
|------|------|------|
| `/health` | GET | 系統健康檢查 |
| `/api/diagnostics/system-info` | GET | 系統資訊 |
| `/api/diagnostics/db-health` | GET | 資料庫健康檢查 |

### 成就系統

| 端點 | 方法 | 說明 |
|------|------|------|
| `/api/tour/complete` | POST | 完成導覽獲得成就 |

---

## 📄 授權條款

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案。

---

## 👨‍🏫 作者

**阿凱老師** - 教育科技創新者

- 🏫 桃園市石門國小
- 🌐 [smes.tyc.edu.tw](https://smes.tyc.edu.tw)

---

## 🙏 致謝

感謝所有使用這些教育工具的老師和學生！

如有任何問題或建議，歡迎聯繫或提出 Issue。
