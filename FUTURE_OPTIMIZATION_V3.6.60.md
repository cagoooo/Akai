# 阿凱老師教育工具集 · 未來優化與開發建議 v3.6.60+

> **產出日期**：2026-05-26
> **當前版本**：v3.6.60（100 工具達成 + 影片 v3 + GEO 強化）
> **撰寫脈絡**：v3.6.59-60 完成影片 v3 + RWD + SEO + GEO 後的後續路線圖
> **適用對象**：阿凱老師自己參考、AI 助手接手時的脈絡

---

## 🎯 戰略方向（這份文件的三大主軸）

```
P0 GEO / SEO 持續最大化  ── 已開始的事做到底
P1 影片 / 內容生態        ── 100 工具達成後的新一波
P2 工具質感 + 後台 + DX   ── 從 100 個工具走向「精緻平台」
```

---

# 🟥 P0 · GEO / SEO 持續最大化（短期 1-2 個月內）

v3.6.60 已做的 noindex + llms.txt + AI 爬蟲白名單只是 **起點**。完整 GEO 戰略還有很大空間。

---

## P0-1 · 監測 llms.txt 是否被 AI 助手實際讀取

**為什麼**：llms.txt 剛上線，需要驗證 ChatGPT/Claude/Perplexity 是否真的拿來用。

**做法**：
1. **每月測試**：在 ChatGPT / Claude / Perplexity 各問同一組問題，看是否回答時引用阿凱老師工具：
   - 「桃園國小老師有自己做教育工具的嗎？」
   - 「PIRLS 閱讀理解怎麼用 AI 工具備課？」
   - 「免費的 LINE Bot 教案有哪些？」
   - 「國小資訊課可以用哪些工具？」
2. **觀察 Cloudflare / GitHub Pages 流量日誌**：看 User-Agent 是否包含 `ClaudeBot`、`GPTBot`、`PerplexityBot`
3. **建立 `scripts/test-geo-discoverability.mjs`**：自動化每月測試 + 記錄結果到 `geo-tests.json`

**預期結果**：
- ChatGPT / Perplexity 通常更新較快（1-3 個月內可見效）
- Claude 較慢（model retrain 週期）
- Gemini 透過 Google-Extended 連動 Google 搜尋，速度居中

---

## P0-2 · 增加 `llms-full.txt`（全文版）

**為什麼**：目前 `llms.txt` 只列工具與文章 **標題 + 簡述**。AI 拿到後若想知道細節還要再爬個別頁面。

**做法**：
- 新增 `llms-full.txt`：把每篇部落格的完整內文 + 每個工具的 `detailedDescription` 全部 inline 進去
- 預估檔案大小：300-500 KB（部落格 100+ 篇 × 平均 8000 字 + 工具細節）
- 在 `llms.txt` 頂部加 reference：`完整內容詳見 [llms-full.txt](./llms-full.txt)`

**注意**：
- 不要每篇都塞完整 markdown，會超過 LLM context window 限制
- 應該按重要性排序，最熱門的工具與最深度的文章在前面

---

## P0-3 · Schema.org 結構化資料擴充

**為什麼**：除了 SoftwareApplication（已有），還能加 Person、EducationalOrganization、Article、VideoObject 等，幫 Google / AI 建立更完整的知識圖譜。

**做法**：
1. **首頁加 `Person` schema**（阿凱老師個人檔案）：
   ```json
   {
     "@type": "Person",
     "name": "阿凱老師",
     "jobTitle": "資訊組長 / 導師",
     "worksFor": { "@type": "EducationalOrganization", "name": "桃園市龍潭區石門國民小學" },
     "url": "https://cagoooo.github.io/Akai/",
     "sameAs": ["https://github.com/cagoooo"]
   }
   ```
2. **`share/100.html` 加 `VideoObject` schema**：
   ```json
   {
     "@type": "VideoObject",
     "name": "阿凱老師 100 工具達成宣傳影片",
     "duration": "PT5M32S",
     "contentUrl": "https://cagoooo.github.io/Akai/share/akai-promo-v3.mp4",
     "thumbnailUrl": "...",
     "uploadDate": "2026-05-25"
   }
   ```
3. **部落格文章已有 `BlogPosting`** ✅（v3.6.57 上線）

**預期效果**：Google 搜尋結果可能出現「影片預覽縮圖」、「作者個人卡片」等富片段。

---

## P0-4 · 內部連結圖譜優化（連結內聚度）

**為什麼**：100 個工具如果只在首頁列出，Google PageRank 散得很開。應該讓「熱門工具」獲得更多內部連結。

**做法**：
1. **每篇部落格底部「相關工具」推薦**（已有，可加強）
2. **工具詳細頁加「常一起使用」區塊**：基於部落格交叉提及 + 點擊熱圖
3. **「九大經典工具」hub page**：新建 `/featured` 頁面集中介紹明星工具，每個都連結到 detail + blog
4. **Footer 加「最新工具」與「最熱門工具」雙欄連結**（每次 build 自動更新）

---

## P0-5 · 部落格 SEO 細節加強

**為什麼**：101 篇部落格是 SEO 主力，但有改善空間。

**檢查清單**：
- [ ] 每篇文章的 `<h1>` 唯一且包含主關鍵字
- [ ] 圖片 `alt` 屬性都有（特別是 cover 圖）
- [ ] 文章長度建議 ≥ 1500 字（深度文有助 SEO）
- [ ] 加 `Reading time` 給使用者預期
- [ ] 加 FAQ schema（用 `Q&A` 結構，命中 Google 答案框）
- [ ] 內部連結每篇 ≥ 3 個（連到工具 + 其他文章）

**工具建議**：
- 用 [Ahrefs Webmaster Tools](https://ahrefs.com/webmaster-tools)（免費）追蹤每篇文章的關鍵字排名
- 用 [PageSpeed Insights](https://pagespeed.web.dev/) 確認 mobile Core Web Vitals 95+

---

# 🟧 P1 · 影片 / 內容生態（中期 2-4 個月）

100 工具達成後，「內容形式」要多元化才不會單調。

---

## P1-1 · 系列短影片（每工具 30-60 秒）

**為什麼**：5:32 宣傳影片太長，社群分享門檻高。每個工具一支 30 秒短影片更適合 IG Reels / YouTube Shorts / TikTok。

**做法**：
1. **複用 Remotion + Edge TTS 流程**（已熟）
2. **建立 `akai-tool-shorts/` 專案**：
   - 範本：開頭 logo (3s) → 工具名稱 + emoji (3s) → 30 秒實機操作畫面 + 旁白 → 結尾 CTA (3s)
   - 旁白稿：每工具一個 `narration-shorts/N.txt`
   - 自動 batch render：`npx remotion render --props='{"toolId": 5}'` 跑 100 次
3. **發布平台**：
   - YouTube Shorts（垂直 9:16）
   - 教師社團 FB / LINE（橫式 16:9）
   - 自家網站每個工具詳細頁可選擇嵌入

**估時**：每支 1 小時準備（旁白 + 操作畫面），100 支 = 100 小時。可以**只先做 9 大經典工具** = 9 小時。

---

## P1-2 · NotebookLM 自動轉教學 podcast

**為什麼**：你已經會用 NotebookLM（看你的駕駛艙）。可以把每篇部落格上傳 → NotebookLM 自動生成 8-12 分鐘的中文 podcast → 嵌入到部落格頁面。

**做法**：
1. 寫 script 自動上傳 markdown 到 NotebookLM（已有 `notebooklm-mcp`）
2. 等候生成完成（5-10 分鐘）
3. 下載 mp3，命名 `blog/{slug}/podcast.mp3`
4. 部落格頁面頂部加 `<audio>` 播放器
5. 也產出 `transcript.txt` 用於 SEO

**價值**：聽覺學習者多了管道；長文閱讀率提升 30-50%。

---

## P1-3 · 教師研習實體教材包

**為什麼**：100 工具的「展示型網站」之外，教師其實需要「**可帶走的研習素材**」。

**包裝**：
- `/share/workshop-kit-2026/` 子頁
- 包含：
  - 60 分鐘研習簡報 PPTX（Google Slides 連結）
  - 教師手冊 PDF（25 頁，含 9 大經典工具的「3 分鐘上手」步驟）
  - QR Code 海報（讓研習現場掃進工具）
  - 教案範本 docx（5 個示範教案，搭配不同工具）
- CC BY 4.0 授權，鼓勵其他學校改用

**配套**：
- 主頁加「📥 下載研習教材包」按鈕（已有便利貼設計風格可延用）
- 寄信給各縣市教師研習中心，推薦本資源

---

## P1-4 · 「工具家族圖譜」可視化

**為什麼**：100 個工具有許多家族關聯（如「客服三件套 #1/#19/#59」、「聲音三部曲 #33/#37/#38」、「行政協調 #2/#15/#49」）。目前散在 `detailedDescription` 內，沒有專屬視覺化頁面。

**做法**：
1. 從 `tools.json` 的 `detailedDescription` 自動解析 `[/tool/X]` 連結，建構工具關聯圖
2. 用 [react-force-graph](https://github.com/vasturiano/react-force-graph) 或 [D3.js](https://d3js.org/) 畫力導向圖
3. 點任一節點 → 跳到該工具詳細頁
4. 加路徑：「想做客服 → 點集合 → 看到三件套差異」

**已有基礎**：`BulletinToolFamilyTree.tsx` 是樹狀視覺化，圖譜版可作為其延伸。

---

## P1-5 · 部落格分類與標籤系統

**為什麼**：101 篇文章已多，目前部落格首頁是時間線。需要按主題分類（如「AI 應用」、「班級經營」、「行政自動化」、「閱讀理解」）。

**做法**：
1. `posts.ts` 加 `categories: string[]` 欄位（每篇 1-3 個分類）
2. `/blog?category=ai-tools` 等 URL 支援篩選
3. 側邊欄加「熱門標籤雲」（從現有 tags 統計）
4. 每篇文章底部「相同分類的其他文章」推薦

---

# 🟨 P2 · 工具質感 + 後台 + DX（中長期 4-8 個月）

從「100 個工具的展示專區」進化成「精緻平台」。

---

## P2-1 · 個人化首頁（記住使用者偏好）

**為什麼**：100 個工具排在一起雖然氣勢，但對特定老師（如國語老師）來說大部分用不到。

**做法**：
1. 首次造訪彈出問卷：「你教什麼？」→ 國語 / 數學 / 自然 / 社會 / 英語 / 資訊 / 美術 / 行政
2. 將偏好存 `localStorage`
3. 首頁的工具排序按「**你的科目相關**」優先
4. 進階：用 Firebase Auth 跨裝置同步（已有許願池/收藏的基礎）
5. 提供「顯示全部」開關，不強制

**也可以延伸**：學年偏好（低中高年級）、特殊需求（PIRLS / 親師會 / 班級經營）等。

---

## P2-2 · 教師作品集功能（讓其他老師可秀自己的成果）

**為什麼**：阿凱老師現在是「**唯一作者**」的展示站。可以開放讓其他老師也提交自己的工具或部落格分享。

**做法**：
1. 加 `/teachers/` 頁面，列出貢獻者
2. 用 GitHub PR 流程：老師 fork repo → 加自己的工具到 `community-tools.json` → 發 PR
3. 阿凱老師審核 → 合併 → 自動部署
4. 貢獻者頁面顯示：學校 + 教學科目 + 貢獻工具列表
5. 標明「Akai 認證」與「社群貢獻」兩類

**價值**：把這個專案從「個人專區」進化成「**教師開源生態**」，影響力倍增。

---

## P2-3 · 後台 Analytics Dashboard 強化

**為什麼**：目前已有訪客計數、工具點擊統計，但缺少「策略性」的分析。

**新增儀表板**：
1. **GEO 監測**：AI 爬蟲訪問次數 / 來源（從 Cloudflare logs）
2. **內容效益**：每篇部落格的「閱讀完成率」、「平均停留時間」、「跳出率」
3. **工具熱力圖**：哪些工具點擊但沒實際開啟（preview 點擊 vs URL 點擊）
4. **許願池 AI 分群**：用 Gemini 把所有許願自動分類（功能需求 / bug 回報 / 感謝 / 不明）
5. **轉換漏斗**：首頁 → 工具詳細 → 實際開啟工具的轉化率

**技術**：
- 繼續用 Firestore + Cloud Functions
- 圖表用 `recharts`（已有）
- Admin 頁面用 Google Auth 限管理員

---

## P2-4 · PWA 進階功能：離線可用 + 安裝

**為什麼**：你已有 SW + 圖片快取，但還沒讓使用者「安裝到桌面」。

**做法**：
1. `manifest.json` 加完整 PWA 圖示組合（已部分有）
2. 加「📲 安裝到桌面」提示便利貼（首次造訪 + 第 3 次造訪時彈）
3. 增加離線頁面：使用者離線時顯示「上次同步的 100 工具清單 + 9 大經典工具直連」
4. iOS 加 splash screen（蘋果裝置）

**好處**：對校內推廣很重要——老師可以把網站「裝」進手機螢幕，像 App 一樣用。

---

## P2-5 · 國際化準備（i18n）

**為什麼**：目前全站繁體中文。如果未來想推到香港 / 馬來西亞 / 新加坡華語區，需要 i18n 結構。

**做法**：
1. 用 `react-i18next` 抽出所有 hardcoded 中文
2. 翻譯成繁中（主）/ 簡中 / 英文三版
3. 工具的 title/description 也要翻譯（最辛苦的部分）
4. URL 加 lang prefix：`/zh-tw/`、`/zh-cn/`、`/en/`
5. `<html lang>` 切換、`hreflang` 標籤

**策略性思考**：先別急——應該先打入「日本 / 韓國 K-12」可能更有市場（他們也愛 AI 教育工具）。先做英文版開拓國際曝光。

---

## P2-6 · 開發者體驗（DX）改善

**為什麼**：阿凱一人開發，DX 自動化越多越省時間。

**TODO**：
- [ ] `npm run new-tool` 已有，可再加：自動 fetch GitHub repo description → 預填 detailedDescription
- [ ] `npm run new-post` 新建部落格範本（含 cover emoji 選擇器、相關工具關聯 wizard）
- [ ] `pre-commit hook`：跑 `npm run check` + 確認 commit message 含 emoji prefix（依現有風格）
- [ ] Storybook：為 BulletinXxx 系列 component 加 Storybook，方便除錯 + 給其他人 fork 時參考
- [ ] E2E 測試：用 Playwright 跑「首頁載入 → 點工具 → 開啟成功」基本路徑

---

# 🟦 P3 · 戰略性大事（長期 6-12 個月）

---

## P3-1 · 商業化路徑（Premium 教師工具）

**為什麼**：100 工具全部免費太可惜，可以加少數「Pro」級別工具收費，補貼 Firebase / domain 費用。

**做法**：
1. 維持 99% 工具免費
2. 推出 1-3 個「Pro」工具：
   - 「全校班級管理 Pro」（多老師共用 + Firebase）
   - 「AI 評語產生器 Pro」（GPT-4 / Claude API，每月 100 次）
   - 「教學影片自動產生」（Remotion + Edge TTS，老師輸入腳本→ 10 分鐘自動產出）
3. 訂閱模式：個人老師 NT$99/月，學校授權 NT$2999/月（10 位老師）
4. 用 Stripe 或綠界整合付款

**反思**：你的初衷是「**永久免費 + MIT 開源**」。Premium 路線會違背初衷。可以改用「**贊助制（Patreon / Ko-fi）**」，鼓勵但不強迫。

---

## P3-2 · 教師專業認證學程

**為什麼**：100 工具達成後，下一個里程碑可以是「**教 1000 個老師會用阿凱工具**」。

**做法**：
1. 設計「阿凱教師 Lv.1 認證」線上課程（用站內工具自學）
2. 修完 9 大經典工具 + 5 個情境練習 = 通過認證
3. 發數位徽章（用 Open Badges 標準）
4. 認證老師可在自己學校做研習，認證徽章可放履歷
5. 「Lv.2 進階」加自動化（如部落格、許願池進階用法）
6. 「Lv.3 大師」可貢獻 community-tools

---

## P3-3 · 串接縣市教育網平台

**為什麼**：桃園市教育局有 [親子天下](https://tyc.edu.tw)、[教育雲](https://cloud.edu.tw) 等平台。你可以推動「**阿凱工具集**」進入官方資源庫。

**步驟**：
1. 寫一份正式企劃書給桃園市資訊教育中心 / 國教輔導團
2. 強調：MIT 開源 / 100 工具達成 / 真實教學數據
3. 爭取被列入「**桃園市教師數位教學資源**」官方推薦清單
4. 進階：跟教育部「教師e學院」談合作，做為認證課程
5. 同步輸出到「教育雲」、「PaGamO」、「均一」等平台的資源庫

**期待價值**：被官方背書後使用者數可能 10 倍成長。

---

# 📋 立即可動手的 5 個小優化（一週內）

| # | 任務 | 預估時間 | 影響 |
|---|---|---|---|
| 1 | 寫 `scripts/test-geo-discoverability.mjs` 自動測試 GEO | 30 分鐘 | 監測 GEO 效果 |
| 2 | 首頁加 `Person` schema | 15 分鐘 | SEO + 富片段 |
| 3 | `share/100.html` 加 `VideoObject` schema | 15 分鐘 | 影片在 Google 搜尋有縮圖 |
| 4 | 為 9 大經典工具寫 30 秒短影片旁白稿（純文字） | 1 小時 | P1-1 的準備 |
| 5 | 註冊 Ahrefs Webmaster Tools + 加驗證碼 | 10 分鐘 | 開始追蹤關鍵字排名 |

---

# 🎓 結語

**v3.6.60 的價值**：把「100 工具達成」這個成就 **轉換成可被搜尋、被 AI 引用、被分享** 的數位資產。

**下一個里程碑建議**：
- **短期（1 個月）**：監測 GEO，看 AI 助手是否開始引用 → 調整 llms.txt
- **中期（3 個月）**：完成 9 大經典工具短影片 + 寄資源包給 3 個學校試用
- **長期（半年）**：教師認證學程上線 / 正式爭取進桃園市官方推薦清單

---

> **製作**：阿凱老師 × Claude Sonnet 4.6
> **參考路徑**：本文件路徑 `H:\Akai\FUTURE_OPTIMIZATION_V3.6.60.md`
> **配套**：`PROGRESS.md`（已完成）、`FUTURE_DEVELOPMENT.md`（舊版策略總覽）、`FUTURE_ROADMAP_DETAILED.md`（細項清單）
