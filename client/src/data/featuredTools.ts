/**
 * Featured Tools — 用於 OG heatmap 與首頁焦點推薦
 *
 * ✨ 此檔由 `scripts/sync-featured-from-firestore.mjs` 自動同步：
 *    讀 Firestore toolUsageStats 取 totalClicks top 5 → 寫入主推位；
 *    不足或 fallback 用 tools.json 最後新增的工具補。
 *
 * ⚠️ 不要手動編輯 — 下次 sync 會覆蓋。
 *    需要強推某工具：在 sync 腳本加 forcedIds，或直接調整 Firestore stats。
 *
 * 更新時機：
 *   - 本地：`npm run sync:featured`
 *   - CI：deploy workflow 在有 FIREBASE_SERVICE_ACCOUNT secret 時自動跑
 *
 * 順序代表展示優先級（左上→右上→左下→右下，前 4 進 OG heatmap）。
 */
export const FEATURED_TOOL_IDS: number[] = [
  81, // [主推] 國小資訊科技教學駕駛艙入口網
  46, // [主推] 禮堂預約系統
  10, // [主推] 班級小管家
  14, // [主推] 點亮詩意~『早安長輩圖產生器』
  68, // [主推] 手作課程照片影片作品上傳平台
  104, // [fallback] 台灣官方資料庫 Twinkle-Hub — 把台灣官方資料接進 AI 助教
  103, // [fallback] AI Agent 的 Web 技能雙引擎 — Playwright × Webwright 一頁讀懂
  102, // [fallback] 外星人入侵·保衛石門 — 復古太空射擊 × 全校排行榜
  101, // [fallback] 3D 迷宮冒險遊戲 — 第一人稱光球收集 × 全班排行榜
  99, // [fallback] 考試卷生圖 Studio — AI 黑白線稿插圖生成
  98, // [fallback] 教室小幫手 — 老師的每日課堂工具
];

/** 自動產生：2026-06-04T06:23:15.447Z */
