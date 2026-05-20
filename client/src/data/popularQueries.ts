/**
 * Popular Queries — ToolIndexAI 預設範例 query chips
 *
 * ✨ 此檔由 `scripts/sync-popular-queries.mjs` 自動同步：
 *    讀 Firestore analytics/toolIndexQueries/queries 取 count top 9 → 寫進這檔
 *    沒 Firestore 認證（或統計太少）時保留下面手動 curate 的 fallback
 *
 * ⚠️ 不要手動編輯 — 下次 sync 會覆蓋。
 *    需要強推某 query：在 sync 腳本加 forcedQueries，或直接調整 Firestore 計數。
 */

export const POPULAR_QUERIES: string[] = [
  '我下週要上水的三態',
  '想做閱讀理解練習',
  '課堂破冰活動',
  '打分數工具',
  '學生票選 / 投票',
  'AI 教案產生器',
  '注音練習',
  '班級輔導 / 自我認識',
  '會議記錄',
];

/** 自動產生：(尚未從 Firestore sync 過) */
