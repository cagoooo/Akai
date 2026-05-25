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
  14, // [主推] 點亮詩意~『早安長輩圖產生器』
  46, // [主推] 禮堂預約系統
  10, // [主推] 班級小管家
  68, // [主推] 手作課程照片影片作品上傳平台
  99, // [fallback] 考試卷生圖 Studio — AI 黑白線稿插圖生成
  98, // [fallback] 教室小幫手 — 老師的每日課堂工具
  97, // [fallback] MBTI 校園奇遇記
  96, // [fallback] DFC 行動方案即時投票系統
  95, // [fallback] 桃園市115年語文競賽龍潭區複賽資訊站
  94, // [fallback] 封面串故事 · 音樂影片分鏡產生器
];

/** 自動產生：2026-05-25T00:23:08.759Z */
