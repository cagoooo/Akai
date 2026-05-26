# 阿凱老師教育工具集 · 未來優化路線圖 v3.6.63+

> **產出日期**：2026-05-26 18:00
> **當前版本**：v3.6.63（**Podcast → Video Pipeline 已建立**）
> **撰寫脈絡**：今日 8 小時建立 NotebookLM AI 內容工廠，從 GEO/SEO 強化 → 第一篇 podcast → 視覺化長片 v4 完成
> **與 v3.6.60 路線圖的關係**：本文件接續 v3.6.60，把「已驗證的 podcast→video pipeline」當成新起點繼續推進

---

## 🎯 戰略地圖更新

```
v3.6.60                  v3.6.62              v3.6.63              v3.6.64+
GEO/SEO 護城河            milestone-100         Kiki & Gordon         批量 Podcast Factory
+ llms.txt + Schema    20:26 podcast 上線     7:02 雙人對談影片      ↓
                                                                    每篇部落格 → 雙片
                                                                    （audio + video）
                                                                       ↓
                                                                    Akai 變
                                                                    "教師 Spotify + YouTube
                                                                    + Blog 三合一平台"
```

---

## 🚀 P0 立即可做（這週 / 1-3 個 session 完成）

### P0-1 · 把 v4 影片整合到 Akai 網站

**為什麼**：v4 影片 7 分鐘已 render 完成（43 MB），但目前**只在 akai-promo-video-rm 本地**，使用者看不到。

**做法**：
1. ffmpeg 壓縮 mp4 從 43 MB → ~15 MB（CRF 28, 720p）：
   ```bash
   ffmpeg -i celebration-100-dialog-v4-real-dialog.mp4 \
     -c:v libx264 -crf 28 -preset slow -vf scale=1280:720 \
     -c:a aac -b:a 96k -movflags +faststart \
     celebration-100-dialog-720p.mp4
   ```
2. 放到 `H:\Akai\client\public\share\celebration-100-dialog.mp4`
3. 建 `H:\Akai\client\public\share\100-dialog.html`：影片觀賞頁
   - cork 公佈欄主題，沿用 share/100.html design tokens
   - 嵌入 YouTube iframe（先用 YT，本地 mp4 太重）
4. `share/100.html` 加按鈕「📺 看 7 分鐘深度對談版」連到 `100-dialog.html`
5. `BulletinMilestone100.tsx` 加 CTA 入口

**估時**：30 分鐘

---

### P0-2 · 上 YouTube + 描述優化

**為什麼**：7 分鐘是黃金 YouTube 長度（短於 10 分鐘但有完整內容），SEO + GEO 雙重加分。

**做法**：
1. 用既有 `youtube_upload.py` 上傳 v4 mp4
2. 標題：「**🎉 100 工具達成深度解析｜阿凱老師 × Kiki & Gordon NotebookLM 對談特輯**」
3. 描述（依 `youtube_update_descriptions.py` 規格）：
   - 第一行：駕駛艙網址
   - 5 個段落（背景、特色、學習成果、技術製作、CTA）
   - 駕駛艙網址出現 ≥ 5 次
   - 15 個 hashtag（含 `#NotebookLM` `#AI對談` `#阿凱老師` `#100工具達成` `#教育科技`）
4. 設 `privacy=public`（教育公益內容應公開）
5. 自動產 thumbnail：取 cover frame + 標題覆蓋

**估時**：15 分鐘

---

### P0-3 · 加 Schema.org VideoObject + PodcastEpisode

**為什麼**：v3.6.61 加了一波 schema，但這支新影片還沒。**雙重內容**（podcast + video）值得有專屬 schema。

**做法**：
1. `share/100-dialog.html` 注入 `VideoObject` schema：
   ```json
   {
     "@type": "VideoObject",
     "name": "100 工具達成 · Kiki & Gordon 對談特輯",
     "duration": "PT7M02S",
     "contentUrl": "https://cagoooo.github.io/Akai/share/celebration-100-dialog.mp4",
     "embedUrl": "https://www.youtube.com/embed/<YT_ID>",
     "uploadDate": "2026-05-26",
     "actor": [
       { "@type": "Person", "name": "Kiki" },
       { "@type": "Person", "name": "Gordon" }
     ]
   }
   ```
2. `milestone-100` 部落格頁面 BlogPodcast 元件加 `PodcastEpisode` schema：
   ```json
   {
     "@type": "PodcastEpisode",
     "name": "阿凱老師的百個教學工具",
     "duration": "PT20M26S",
     "associatedMedia": { "@type": "MediaObject", "contentUrl": "..." }
   }
   ```
3. Google Rich Results Test 驗證

**估時**：30 分鐘

---

### P0-4 · 寫 `notebooklm-to-video-bridge` skill

**為什麼**：今天 v4 流程完全驗證，但分散在 chat history 內。寫成 skill 才能未來任何 session 直接呼叫。

**Skill 內容**：
- 7 階段 SOP（auth check → podcast 生成 → 下載 → whisperx + diarize → librosa pitch 驗證 → caption build → Remotion render）
- 雙人主持人角色系統（Kiki & Gordon 設定 + gpt-image-1 prompt 模板）
- 13 條踩雷清單（含今天踩到的：m4a vs mp3 副檔名、whisperx cp950 編碼、pyannote license、簡中字幕、speaker map 配錯風險）
- 跨工具整合圖（`notebooklm-podcast-pipeline` + `hf-narrated-video-pipeline` + `remotion-best-practices`）

**估時**：1 小時

---

## 🟧 P1 中期擴張（2-4 週）

### P1-1 · 9 大經典工具批量 Podcast + Video

**目標**：複製 milestone-100 的成功模式，為 9 大經典工具各做 1 對「**podcast + video**」雙片。

**目標清單**（READE 已定 9 大經典）：
| # | 工具 | 預期 podcast 主題 |
|---|---|---|
| 1 | 線上即時客服 | AI 24/7 教學支援 |
| 8 | 12 年教案有 14（LINE Bot）| LINE Bot 教案資源 |
| 3 | 學生即時投票 | 課堂參與率從 25% → 92% |
| 4 | PIRLS 閱讀理解 | AI 自動產 PIRLS 題組 |
| 7 | 點石成金（評語）| AI 評語 12 種風格 |
| 6 | 蜂類配對 | 遊戲化生物學習 |
| 17 | 抽籤系統 | 班級隨機決策工具 |
| 26 | 九九乘法 | Web Audio 合成音效 |
| 74 | 親職日場地配置 | 行政自動化 |

**做法**：用 `notebooklm-to-video-bridge` skill 跑 9 次，每次：
- 1 小時準備（精煉部落格、設章節）
- 1 小時 NLM 生 podcast + 等
- 1 小時 whisperx + Remotion render
- = 約 3 小時/支，9 支 ≈ **27 小時實際工作**（散在 2-4 週）

**節奏建議**：每週 2-3 支，分 4 週做完。

**價值**：建立完整的「**Akai YouTube 教學頻道**」初期內容庫（10 支 7 分鐘長片）。

---

### P1-2 · Kiki & Gordon Brand Identity 設計

**為什麼**：兩位虛擬主持人會是未來 100+ 支影片的固定 CP，值得正式品牌化。

**做法**：
1. 設計兩位主持人的「**人設背景**」：
   - Kiki：高雄某國小英語老師、25 歲、熱愛新教學科技、podcast 風格活潑
   - Gordon：桃園某國中資訊老師、32 歲、技術背景轉教育、podcast 風格沉穩
   - 用故事讓觀眾記住、產生情感連結
2. 視覺資產：
   - 多套表情變化（驚訝、思考、笑、認真）— gpt-image-1 batch 生 6-8 張
   - 半身 / 全身 / 大頭 多種構圖（供不同情境用）
   - YouTube channel banner + avatar
3. 聲音識別：每次 podcast 開頭固定 jingle（5 秒）→ 觀眾聽到就知道是 Akai 系列

**估時**：1 週（含設計 + AI 生圖 + 整合）

---

### P1-3 · NotebookLM Custom Source Pack（精煉版部落格庫）

**為什麼**：今天 milestone-100 podcast 用了「**精煉摘要**」餵 NLM 才有好效果。每次手動精煉 too tedious — 建立批量精煉的 SOP。

**做法**：
1. 寫 `scripts/refine-blog-for-podcast.mjs`：
   - 讀 `client/src/blog/posts.ts` 內某篇 body
   - 用 Claude API 或 Gemini API 自動精煉成 1500-2500 字
   - 結構：開場 / 數字 / 故事 / 結論
   - 寫出 `tmp-podcast-sources/{slug}.md`
2. 設計 prompt 模板：「為兩位主持人 Kiki + Gordon 改寫成對談式 podcast 草稿，保留所有數字與故事...」
3. 跑 9 大經典批次精煉，產出 podcast-ready sources

**估時**：1-2 天

---

### P1-4 · 從「**單支影片**」進化為「**Episode Series**」

**為什麼**：把每支影片定位為「**第 N 集**」，有系列感觀眾會追。

**設計**：
- **EP1: 100 工具達成（已完成）** — 今天的 v4 影片
- **EP2: 客服三件套深度剖析** — #1 / #19 / #59
- **EP3: 聲音三部曲** — #33 / #37 / #38
- **EP4: 行政自動化大全** — #46 / #15 / #2
- **EP5: PIRLS × AI 完整 SOP** — #4 / #87
- ...

每集格式：
- 開場 30 秒：Kiki + Gordon 介紹本集主題
- 主體 5-7 分鐘：深度解析
- 結尾 30 秒：CTA + 預告下集

**運營**：每兩週 1 集，建立觀眾期待感。

---

## 🟨 P2 長期戰略（2-6 個月）

### P2-1 · 雙語版（中 + 英）打入國際市場

**為什麼**：NLM 支援 `language="en"`，**同一份精煉 source + 不同語言**就能生英文版。

**實作**：
- `scripts/duplicate-podcast-en.mjs`：把 milestone-100 source 自動翻譯成英文 + 觸發 NLM en 版
- 視覺資產不變（Kiki/Gordon 在英文 podcast 內也 work）
- 字幕雙語切換（Remotion conditional render）
- YouTube 分頻：「阿凱老師 中文頻道」+「Akai Teacher English Channel」

**目標市場**：香港 / 新加坡 / 馬來西亞華語區、東南亞英語區 K-12 教師、國際教育科技研究者

---

### P2-2 · Podcast Apps（Spotify / Apple Podcasts）正式上架

**做法**：
1. 為所有 episode 產 RSS feed：`client/public/podcast-feed.xml`
2. 上架平台：
   - [Spotify for Podcasters](https://podcasters.spotify.com)（免費）
   - [Apple Podcasts Connect](https://podcastsconnect.apple.com)（免費）
3. 阿凱老師正式成為「**有 podcast 頻道的教育創作者**」

**估時**：上架 1 小時，但建立內容庫要時間（5+ 集起步較有說服力）。

---

### P2-3 · 「Kiki & Gordon」AI 助理（語音版客服）

**狂想**：把兩位主持人的角色 + 知識（從 100 工具 + 100 篇文章）做成 **語音版 AI 助理**。

**做法**：
- ElevenLabs / OpenAI TTS clone Kiki + Gordon 兩個聲音
- Akai 網站加「🎙️ 跟 Kiki & Gordon 對話」按鈕
- 使用者問「我想用 AI 教 PIRLS」→ Kiki 開場引導 + Gordon 推薦 #4
- 後端用 GPT-4 / Claude 處理 conversation

**估時**：2 個月（含 voice cloning license + 後端架構）

---

### P2-4 · 教師認證學程「**Kiki & Gordon 教學頻道導覽**」

**設計**：
- 完成觀看 9 大經典工具影片（每支 7 分鐘 × 9 = 63 分鐘）
- 通過短測驗（5 題）→ 拿「**Akai 教師 Lv.1 認證徽章**」
- 徽章可放履歷、貼學校網站
- 完成 30 篇深度文章閱讀 → Lv.2 認證
- 提交自製教學設計 → Lv.3 認證

**配套**：每張徽章符合 [Open Badges 2.0](https://openbadges.org/) 標準

---

## 💡 P3 創新方向（明年）

### P3-1 · 「**互動 Podcast**」— 觀眾可以「**插話**」

**狂想**：在 podcast 播放器加「**🤚 我有問題**」按鈕，使用者點下去可問問題，Kiki/Gordon AI 即時回應（或加進「**下集 Q&A**」段落）。

### P3-2 · Twitch / YouTube Live「Kiki & Gordon 直播實作」

**狂想**：每月 1 次直播，阿凱老師上線跟 Kiki/Gordon 一起聊新工具開發、回答觀眾即時問題。

### P3-3 · 把 video 流程拿來做「**家長版**」「**校長版**」podcast

**狂想**：同一篇文章可以為不同受眾各生一支 podcast（NLM `focus_prompt` 改變）：
- 家長版：強調對孩子的好處
- 校長版：強調行政效益與成本
- 教師版：強調操作步驟

---

## 📋 立即可動手的 5 個短任務（< 1 小時）

| # | 任務 | 時間 | 影響 |
|---|---|---|---|
| 1 | ffmpeg 壓 v4 影片 43MB → 15MB | 5 分鐘 | 適合部署 |
| 2 | 建立 share/100-dialog.html 影片觀賞頁 | 15 分鐘 | 上線 v4 影片 |
| 3 | 上傳 v4 到 YouTube + 寫描述 | 15 分鐘 | YouTube 頻道+1 集 |
| 4 | BulletinMilestone100 加「看 7 分鐘對談版」CTA | 10 分鐘 | 入口可見 |
| 5 | 寫 `notebooklm-to-video-bridge` skill 大綱 | 30 分鐘 | 流程系統化 |

---

## 🎓 我的下次起點建議

**最高優先**：P0-1 + P0-2 + P0-4 連做（**約 2 小時**）

```
ffmpeg 壓影片
  ↓
建 share/100-dialog.html + BulletinMilestone100 CTA
  ↓
上傳 YouTube + 寫描述
  ↓
build + commit + push 部署
  ↓
寫 notebooklm-to-video-bridge skill 收尾
```

完成這 4 件事後，**v4 影片正式上線**，整個 podcast→video pipeline 從「實驗 POC」變「**production 上架**」。

下次見面打開頭只要說：

> **「開始整合 v4 影片上 Akai 網站 + YouTube」**

我會自動接續這 2 小時的工作流程。

---

## 🌙 今日里程碑（8 小時超豐盛）

```
9 個 Akai commits：
  GEO/SEO 護城河五件套
  + Schema.org Person/WebSite/VideoObject/BlogPosting
  + llms-full.txt 全文版
  + GEO 監測 script
  + 內部連結優化
  + 第一篇 podcast (milestone-100) BlogPodcast 元件
  + check-links 修正

5 個 skill repo commits：
  notebooklm-podcast-pipeline 新建（含真根因 + HF token 釐清）
  teaching-cockpit + lesson-prep 同步真根因
  
9 個 akai-promo-video-rm commits：
  Kiki + Gordon 角色生成
  cork 公佈欄 components 庫
  AkaiCelebration100Dialog 5 場景 composition
  whisperx + diarization + pitch 雙重驗證
  OpenCC s2twp 繁中字幕
  v1 → v2 → v4 三次迭代 render
```

**戰略意義**：Akai 從「100 工具達成的展示網站」進化為「**有自動內容工廠 + Kiki & Gordon 主持人 CP 的教育媒體品牌**」起步點。

下一個 100 不再只是工具，是 **podcast + video + 教師認證學程** 的完整生態系。

---

> **製作**：阿凱老師 × Claude Sonnet 4.6 / 4.7
> **配套**：[v3.6.60 路線圖](FUTURE_OPTIMIZATION_V3.6.60.md)（GEO/SEO + P1 P2 大方向）
> **本文件**：v3.6.63 新建（podcast→video pipeline 已驗證後的下一波）
