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
  10, // [主推] 班級小管家
  46, // [主推] 禮堂&專科教室&IPAD平板車預約系統
  9, // [主推] 超級瑪莉歐冒險
  14, // [主推] 點亮詩意~『早安長輩圖產生器』
  124, // [fallback] 從 AI 教學與研究助理到 AI Agent
  123, // [fallback] 校網無障礙 AA 遷移操作平台
  122, // [fallback] 兒童英語單字大冒險
  121, // [fallback] 仙人掌大逃亡：奔跑吧小墨龍
  120, // [fallback] 3D 星際雷霆：隕石防禦與太空探索解題大冒險
  119, // [fallback] SDGs永續行動遊戲－地球守護隊：能量大作戰
];

/** 自動產生：2026-09-01T11:41:01.747Z */
