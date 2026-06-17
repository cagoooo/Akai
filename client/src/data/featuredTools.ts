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
  9, // [主推] 超級瑪莉歐冒險
  14, // [主推] 點亮詩意~『早安長輩圖產生器』
  110, // [fallback] 智慧自動化照片成果轉影片產生器
  109, // [fallback] 數位內容與教學軟體需求調查填報
  108, // [fallback] 資安特攻隊：釣魚郵件偵蒐
  107, // [fallback] 學生教育雲帳號更新工具
  106, // [fallback] 石門國小 第103屆畢業典禮｜啟程・感恩・祝福
  105, // [fallback] 臺灣主權 AI 訓練語料庫 × 石門國小 — 把國家級本土語料變成校園教材
];

/** 自動產生：2026-06-17T04:46:18.435Z */
