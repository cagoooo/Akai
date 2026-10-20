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
  10, // [主推] 班級小管家
  81, // [主推] 國小資訊科技教學駕駛艙入口網
  46, // [主推] 禮堂&專科教室&IPAD平板車預約系統
  9, // [主推] 超級瑪莉歐冒險
  14, // [主推] 點亮詩意~『早安長輩圖產生器』
  132, // [fallback] 輔導紀錄小幫手
  131, // [fallback] iWIN 兒少上網問卷結果閱讀站
  130, // [fallback] 石門國小 115 學年度運動會資訊站
  129, // [fallback] 115石小教師會議報告集合站 (上學期)
  128, // [fallback] 石門・校園漫遊
  127, // [fallback] 桃園市AI素養爭霸賽
];

/** 自動產生：2026-10-20T08:35:25.199Z */
