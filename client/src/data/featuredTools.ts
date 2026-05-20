/**
 * Featured Tools — 用於 OG heatmap 與首頁焦點推薦
 *
 * 由 maintainer 手動 curate；未來可改為從 Firestore toolUsageStats 自動取 top 4。
 * 順序代表展示優先級（左上→右上→左下→右下）。
 *
 * 更新時機：
 *   - 新增工具且確認熱門時可換上來
 *   - 至少保證 4 個 ID 都存在於 client/public/api/tools.json
 *   - 若有 1 個 ID 不存在，build script 會自動 fallback 到列表中下一個有效 ID
 */
export const FEATURED_TOOL_IDS: number[] = [
  97, // MBTI 校園奇遇記（互動體驗）
  91, // 點亮詩意 Pro 早安長輩圖（語文寫作）
  87, // PIRLS 閱讀理解生成站 PRO（語文閱讀）
  89, // 教師回覆小幫手 Pro（實用工具）
  94, // 封面串故事 · 音樂影片分鏡產生器（fallback）
  96, // DFC 行動方案即時投票系統（fallback）
];
