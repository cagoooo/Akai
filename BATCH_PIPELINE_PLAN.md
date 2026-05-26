# 9 大經典工具 Podcast→Video 批次計畫

> **建立日期**：2026-05-26（v3.6.64 收官後啟動）
> **依賴 skill**：`notebooklm-to-video-bridge`（已 frozen）+ `notebooklm-podcast-pipeline`
> **單片成本**：約 3 小時工作 + USD $0.10（gpt-image-1 + gpt-4o-mini）
> **總預算**：9 支 × 3 小時 = 27 小時 / 9 支 × $0.10 = $0.90

---

## 🎯 戰略目標

把 v3.6.63 跑通的「Podcast → Video」pipeline 量產化，建立 **Akai YouTube 教學頻道初期內容庫**（10 支 7 分鐘長片）。

| 階段 | 目標 |
|---|---|
| EP1（已完成）| 100 工具達成 v6 — pipeline 驗證 |
| EP2-EP10（本計畫）| 9 大經典工具 — 量產測試 |
| 之後 | 任意部落格自動觸發 podcast → video |

---

## 📋 9 大經典工具清單 + 排期

依「**對外吸引力 × 阿凱老師個人成就感**」雙軸排序：

| EP | 工具 # | 工具名 | Podcast 主題 | 建議錄製日 | YouTube 預期觀看 |
|---|---|---|---|---|---|
| **EP2** | **#1** | **線上即時客服** | 「AI 24/7 教學支援：我怎麼把 LINE Bot 做成全校客服」 | **2026-05-28**（先行測試）| 高（家長都關心的痛點）|
| EP3 | #3 | 學生即時投票 | 「課堂參與率從 25% → 92%：投票工具是怎麼做到的」 | 2026-05-31 | 高（數據強）|
| EP4 | #4 | PIRLS 閱讀理解 | 「AI 自動產 PIRLS 題組：教育部都該知道的省時神器」 | 2026-06-04 | 中高（教師專業向）|
| EP5 | #46 | AI 評語產生器 | 「AI 評語 12 種風格 + 50000 字：學期末再也不痛苦」 | 2026-06-07 | 高（時節性熱搜）|
| EP6 | #81 | 教學駕駛艙 | 「25 個駕駛艙、84 個 commits、5 週：Akai 內部最強案例」 | 2026-06-11 | 中（同行向）|
| EP7 | #68 | 班級經營（蜂類）| 「遊戲化生物學習：把分組學習做成 25 人混血戰場」 | 2026-06-14 | 中 |
| EP8 | #10 | 場地配置編輯器 | 「親職日 350 人座位 30 分鐘排好：行政人員 SOP」 | 2026-06-18 | 中（行政向）|
| EP9 | #15 | 抽籤系統 | 「老師抽人、學生分組、加分扣分一鍵搞定」 | 2026-06-21 | 中低 |
| EP10 | #19 | 九九乘法（音效版）| 「Web Audio 程序合成 10 種音效：怎麼讓孩子愛上練習」 | 2026-06-25 | 中（技術 + 教學雙重）|

**節奏建議**：每 3-4 天 1 支，4 週做完 9 支。

---

## 🔧 每支影片 3 小時拆解

| 階段 | 子任務 | 耗時 | 工具 |
|---|---|---|---|
| **1. 精煉 source**（30 min）| 讀部落格、寫 1500-2500 字濃縮 + 主持人指令 | 30 min | Claude / 手寫 |
| **2. NLM 生 podcast**（60 min）| `studio_create + deep_dive + short` + 等 + download .m4a | 60 min | `notebooklm-mcp` |
| **3. 字幕 pipeline**（45 min）| whisperx + pyannote + librosa pitch + OpenCC + GPT 斷句 | 45 min | `add-punctuation-rebuild-captions.mjs` |
| **4. Remotion render**（30 min）| 跑 5 場景 composition + 720p 壓縮 + 替換到 Akai | 30 min | Remotion + ffmpeg |
| **5. 上架**（15 min）| YouTube + 100-dialog 系列頁 + commit + push | 15 min | `tomorrow-re-upload-v6.ps1` template |

---

## 📦 量產輔助工具（待寫）

### Tool 1：`refine-blog-for-podcast.mjs`（P1-3）
- 讀 `client/src/blog/posts.ts` 指定 slug
- 用 Claude / Gemini API 自動精煉成 NLM-ready source pack
- 結構：開場 30s / 數字段 / 故事段 / 結論段 + 主持人指令

### Tool 2：`batch-render-episode.ps1`
- 通用化 `tomorrow-re-upload-v6.ps1`：吃 episode 編號 + 影片路徑 + 標題 + 描述
- 跑完 YouTube 上傳 → ID → 生成 `share/EP{N}-{slug}.html` → build → commit → push

### Tool 3：`generate-og-pages.mjs` 增加 episode page generator
- 通用 `generateEpisodePageHtml({epNumber, slug, ytId, duration, title, summary})`
- 自動產 VideoObject + actor (Kiki, Gordon) schema

### Tool 4：`episodes-index.html`（episode 總覽頁）
- 在 `share/episodes.html` 列出全部 EP 卡片
- 每張卡含縮圖 + 標題 + 時長 + 工具 # + YouTube 連結
- 連回 Akai 主站 + 該工具的 blog post

---

## 🎨 Kiki & Gordon 一致性原則

**永遠維持的設定**（每支影片都該重申）：
- Kiki 🌸 — 青色 `#00e5ff`，知性發問者（25 歲、高雄某國小英語老師、podcast 風格活潑）
- Gordon 🎙️ — 金色 `#ffb300`，沉穩解答者（32 歲、桃園某國中資訊老師、技術背景轉教育、podcast 風格沉穩）

**每支開場固定**：
> Kiki：「歡迎回到阿凱老師的 AI 教學頻道，我是 Kiki，今天我要跟 Gordon 一起深入解析...」
> Gordon：「對 Kiki，今天的主題是...」

**每支結尾固定**：
> Kiki + Gordon 合：「不要追數量，追深度。我們下次見！」

---

## 🚨 已知踩雷（依 `notebooklm-to-video-bridge` skill）

每支影片開工前 mandatory 檢查：
1. ✅ NLM auth 有效（`nlm login` 7 天 cookie 過期）
2. ✅ HuggingFace 3 個 license 都已 accept（pyannote）
3. ✅ OpenAI API key 在 `~/.openai.env`
4. ✅ Python venv 有 `whisperx 3.8.6 + pyannote + librosa`
5. ✅ YouTube `youtube_token.pickle` 未過期 + quota 沒爆（10000 units/day）
6. ✅ `add-punctuation-rebuild-captions.mjs` Step 2.5（word.w OpenCC）已整合
7. ✅ Remotion composition 已加當集標題 / 章節時段

---

## 📊 預期成果指標

| 指標 | EP1 | EP2-EP10 目標 |
|---|---|---|
| YouTube 平均觀看 | TBD | EP1 × 80% 起跳 |
| Akai 部落格 referral | TBD | EP10 累積 +1500 PV |
| Schema VideoObject 上 Google Knowledge | EP1 已注入 | 9 支全注入 |
| 教師同行轉發次數 | TBD | EP10 累積 50+ |

**最終目標**：建立「Akai 教師 YouTube 頻道」基本盤，30+ 訂閱、10 支高品質教育長片，作為 Akai 平台的影音延伸。

---

## 🔗 相關 skill / 檔案

- `notebooklm-to-video-bridge`（7 階段 SOP + 16 條 traps）
- `notebooklm-podcast-pipeline`（podcast 端 7 階段）
- `H:\Akai\PROGRESS.md` v3.6.64
- `H:\Akai\FUTURE_OPTIMIZATION_V3.6.63.md`（更大 P1/P2/P3 路線圖）
- `C:\Users\smes\Desktop\Cowork\akai-promo-video-rm\scripts\tomorrow-re-upload-v6.ps1`（template）
