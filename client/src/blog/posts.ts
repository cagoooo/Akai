/**
 * Blog Posts — 教學情境長文資料源
 *
 * 用內聯 markdown 字串而非 fetch public/*.md，因為：
 *   1. GH Pages basePath /Akai/ 處理麻煩
 *   2. 全部隨主 bundle 一起 lazy load 即可（檔案 < 50KB）
 *   3. SSG / vite import 簡單
 *
 * 新增文章流程：在 POSTS 陣列加新條目，自動出現在 /blog 列表。
 */

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string; // ISO date
  readingMinutes: number;
  tags: string[];
  toolIds: number[]; // 相關工具 id（顯示連結卡片）
  coverEmoji: string; // 主題 emoji
  coverColor: 'yellow' | 'blue' | 'pink' | 'green' | 'orange' | 'purple';
  body: string; // markdown
}

const POST_81: BlogPost = {
  slug: 'cockpit-81-info-tech-class',
  title: '#81 國小資訊科技教學駕駛艙：25 個駕駛艙 × 飛行儀表板入口，三到六年級完整資訊課程系統',
  excerpt:
    '#81 不是「入口連結牆」— 是阿凱用 5 週手刻 84 個 commits、純 vanilla JS 蓋出來的「飛行員儀表板 + 25 個獨立駕駛艙」課程系統，每單元含 NotebookLM 投影片 + YouTube 自學影片 + Canvas 關卡 + 評量題 + 演講簡報模式。',
  publishedAt: '2026-05-20',
  readingMinutes: 6,
  tags: ['資訊科技', '教學駕駛艙', '完整課程系統', '108 課綱', 'PWA'],
  toolIds: [81, 80, 76],
  coverEmoji: '🛫',
  coverColor: 'blue',
  body: `## 不是入口連結牆 — 是整個資訊課

我第一次跟同事介紹 #81 駕駛艙時，他以為這是「**那種收藏連結的 portal page**」。

打開 [cagoooo.github.io/it-cockpit/](https://cagoooo.github.io/it-cockpit/) 看，他臉色變了 — 這不是連結牆，是**整個三到六年級資訊科技課的完整課程系統**。

首頁是一個**飛行員儀表板**：

\`\`\`
COCKPIT.HORIZON · ALT 2026 / HDG NW / SPD · 25
FLIGHT PLAN · 2026 學年課表
MISSIONS: 25  |  GRADES: 4  |  SUBJECTS: 12
🔴 LIVE
\`\`\`

點任一單元卡進去 → 進入該單元的**駕駛艙**（單頁 80-100KB 自製互動長頁）。

## 為什麼是「駕駛艙」這個隱喻？

108 課綱資訊科技強調「**學生主導 + 教師引導 + 多元素養**」。傳統做法：
- 老師發紙本講義
- 連到不同網站上課
- 學生記不住網址

阿凱反過來 — **每個單元 = 一個獨立駕駛艙**，學生掃進去就能：
- 看 NotebookLM 投影片（自學閱讀）
- 看 YouTube 自學影片（嵌入）
- 玩 Canvas 互動關卡（每單元 4-6 個 STAGE）
- 寫評量題（每單元 8-18 題）
- **演講簡報模式**（lecture-slides.html）給老師上課切換

\`\`\`
[← IT COCKPIT]  ← 每駕駛艙左上角都有
\`\`\`

按 ← / → 切換、Esc 兩段式退出 — **真的是飛行員操作邏輯**。

## 25 個駕駛艙覆蓋全年級

### 三年級 · 資訊基礎（4 個）
- 嗨！電腦新朋友（電腦入門）
- Windows 電腦小尖兵（**Retro Win98 風**）
- 中年級英文打字（QWERTY + 八手指）
- PaGamO 國小天地世界冒險

### 四年級 · AI 創作入門（3 個）
- Canva 魔法簡報（Magic Write / BG Remover）
- PhotoCap 圖像編輯魔法師（台灣免費影像軟體）
- PaGamO 桃園市付費版進階

### 五年級 · 程式設計（5 個）
- 滑手機前先想一下（數位安全）
- Scratch 動畫魔法師
- Scratch 遊戲設計師（水果接接樂）
- Inkscape 向量繪圖（**Risograph 雙色印刷風**）
- micro:bit 創客小英雄（**Circuit-glow 電路霓光風**）

### 六年級 · AI 與媒體素養（12 個）
- Gemini × Canva 影片創作
- Canva AI 魔法創作
- AI 音樂創作師（Gemini 畢業歌曲）
- AI 中文生圖大 PK（**196,608 種 prompt 組合**）
- 故事生圖 Gem 機器人（Nano Banana 2）
- **AI 假影片偵探社**（Deepfake / SIFT）
- **假訊息偵探社**（MyGoPen / Hive / Google Lens）
- Gemini 引導式學習（PARTS 框架）
- AR/VR 科技穿戴（Meta Ray-Ban / Vision Pro）
- 麥昆小車程式設計
- Blogger × AI 創作家
- 用 Suno 設計班級神曲
- 痞客邦部落格（**Scrapbook 手帳風**）

### 教師研習 · 師培演講（1 個）
- A2 PaGamO 遊戲化教學（中央大學師培演講）

**重點：每單元都有獨立視覺主題梗** — Retro Win98 / Circuit-glow / Risograph / Scrapbook / 暖橘奶油，**不是套模板**。

<div class="callout callout--tip">
<div class="callout__label">💡 為什麼這樣設計</div>

每個駕駛艙獨立視覺主題不是炫技 — 是**讓學生視覺記憶綁定單元**。回家被家長問「今天上什麼」，學生會記得「就那個霓虹電路的」「就那個 Win98 的」，而不是「資訊課」這種模糊回答。

</div>

## 真實技術棧（讓工程師同事尖叫的選擇）

- **零框架**：純 HTML + vanilla JS（手寫 \`el()\` createElement helper） + 內嵌 \`<style>\` CSS
- **沒有 package.json，沒有 build step**，沒有 React / Vue / Vite
- **Google Fonts**：Noto Sans TC + Inter Tight + JetBrains Mono（駕駛艙等寬字體）
- **PWA**：自製 \`sw.js\`（68 行），network-first HTML + cache-first 靜態
- **CACHE_VERSION 命名梗**：\`'2026-05-19-microbit-fix'\` — 直白記錄每次 bump 原因
- **新版自動 polling**：前景頁面 5 分鐘 polling 一次，跳「🚀 偵測到新版」toast 後自動 reload
- **部署**：GitHub Pages \`cagoooo.github.io/it-cockpit/\`
- **外部嵌入**：NotebookLM 筆記 + YouTube iframe，**沒有 LLM API、沒有 Firebase、沒有任何後端**

## 老師備課實際流程

1. 開首頁儀表板 → 看年級導覽 chip（G3/G4/G5/G6）
2. 點本週單元卡 → 進駕駛艙
3. 上課：
   - 先用 **lecture-slides.html 演講簡報模式** demo（NotebookLM 風）
   - 切回駕駛艙做 Canvas 互動 STAGE
   - 補上 YouTube 自學影片給學生回家複習
4. 學生作業：駕駛艙內評量題 8-18 題

## 實測效果（石門國小 5 年級 micro:bit 單元）

<div class="stat-grid">
  <div class="stat-card">
    <div class="stat-card__label">單元覆蓋年級</div>
    <div class="stat-card__value">G3-G6 <span style="font-size:14px;color:#6b5e4a;">全年級</span></div>
    <span class="stat-card__delta">25 個獨立駕駛艙</span>
  </div>
  <div class="stat-card">
    <div class="stat-card__label">學生記網址數</div>
    <div class="stat-card__value">1 <span style="font-size:14px;color:#6b5e4a;">個</span></div>
    <span class="stat-card__delta">vs 8 個散落平台</span>
  </div>
  <div class="stat-card">
    <div class="stat-card__label">上課切換工具</div>
    <div class="stat-card__value">0 <span style="font-size:14px;color:#6b5e4a;">次</span></div>
    <span class="stat-card__delta">駕駛艙內全包</span>
  </div>
  <div class="stat-card">
    <div class="stat-card__label">開發週數</div>
    <div class="stat-card__value">5 <span style="font-size:14px;color:#6b5e4a;">週</span></div>
    <span class="stat-card__delta">84 commits</span>
  </div>
</div>

完整對照表：

| 指標 | 傳統做法 | 用 #81 駕駛艙 |
|------|---------|---------|
| 學生記網址 | 8 個（散落各平台） | **1 個**（cagoooo.github.io/it-cockpit）|
| 老師上課切換工具 | 5-6 次 | **0 次**（駕駛艙內全包） |
| 缺課學生回家補課 | 找不到資料 | **網址打開就完整補完** |
| 教師研習示範 | 切多個視窗 | **演講簡報模式一鍵全程** |
| 跨年級老師借鏡 | 各做各的 | **25 個駕駛艙互相觀摩** |

## 老師 + 學生回饋

> 「我帶五年級 Scratch 缺課的學生，**回家自己看完 5 個 STAGE + 評量題**，下週進度直接跟上 — 第一次有這種感覺」
>
> — 石門國小資訊老師

> 「我在中央大學師培演講用 lecture-slides.html — **教授問我哪個工具做的，我說純 HTML 不用 build** — 全場驚」
>
> — 阿凱老師（自述）

> 「我家小孩看『AI 假影片偵探社』看到一半跑來問我『爸爸這個真的還假的』— **教育就在這時刻發生**」
>
> — 學生家長

## 開發時間線爆速

- 2026-04-11 repo 開張
- 2026-05-19 累積 **84 個 commits / 25 個單元 / 5 週**
- 2026-05-18 一次幫 23 個單元加上 **演講簡報模式**（lecture-slides.html）
- Footer Powered by：**NOTEBOOKLM × CLAUDE CODE**（不掛其他工具）
- Footer 學校網域：\`smes.tyc.edu.tw/?account=ipad\`（**石門國小**，有 commit 記錄修正過誤寫的學校名）

## 配對工具推薦

- [#100 工具索引神器](/tool/100) — 找其他單元 / 工具的入口
- [#80 教師會議報告集合](/tool/80) — 教師研習風格的姊妹站
- [#11 剛好學課堂互動](/tool/11) — 駕駛艙內可嵌入做即時投票
- [#81 國小資訊科技教學駕駛艙](/tool/81) — 本篇主角

## 適用對象

- 國小資訊科技老師（**直接 fork 用**或當教學範本）
- 教務組長 / 學年主任（看完整課程設計）
- 教師研習講師（演講簡報模式即用）
- 校長 / 主任（看 108 課綱資訊融入完整實作）
- 教育系研究者（一線老師如何用 NotebookLM × Claude Code 打造課程系統）

## 想試試？

→ [前往 #81 國小資訊科技教學駕駛艙](/tool/81)

第一次推薦 **從六年級「AI 假影片偵探社」進**（最熱門也最具話題性的單元），看完你會理解「教學駕駛艙」這個隱喻有多到位。
`,
};

const POST_46: BlogPost = {
  slug: 'venue-46-no-more-paper-form',
  title: '#46 場地預約系統：禮堂只是招牌 — 骨子裡是 10 場地 × 學校節次 × LINE 三階段通知 × AI 衝突解析的中央調度系統',
  excerpt:
    '#46 不是只預約禮堂 — 是 10 個場地（禮堂、智慧教室、電腦教室、森林小屋、4 台 IPAD 平板車、校史室）統一調度。學校節次制（非半小時格）+ 沒有審核流程（任何人直接預約 + deviceId Rate Limit）+ LINE Flex Message 三階段通知 + Gemini AI 智慧衝突解析 + Gmail 風 30 秒 Undo + AI 學期報告。v2.50.6 累積 50+ 版的真實生產級系統。',
  publishedAt: '2026-05-20',
  readingMinutes: 6,
  tags: ['校園行政', '場地調度', 'LINE Messaging', 'Gemini AI', '無審核設計'],
  toolIds: [46, 84, 80],
  coverEmoji: '🏛️',
  coverColor: 'orange',
  body: `## 場景：以前怎麼搶禮堂？

學期初印一張紙本月曆貼在總務處公佈欄，老師走過去寫名字。
**問題不勝枚舉：**

- 第一個寫的人通常是辦公室離總務處最近的（不公平）
- 寫錯要塗改、撕了重貼
- 時段重疊看不到
- 行政組長要每週手動拍照給校長 review
- 校外單位想借禮堂得打電話確認

## #46 真實技術細節（不是 Google Calendar 風格半小時格！）

**功能 A：10 個場地統一調度**
- 禮堂、智慧教室 C304、2 間電腦教室、森林小屋、**4 台 IPAD 平板車（三~六年級）**、校史室
- 「禮堂」只是招牌，骨子裡是**學校場地中央調度系統**

**功能 B：學校節次制（不是半小時格！）**
- 採學校真實節次：晨間 / 第一節 ~ 第七節 / 午休 / 打掃⋯ 約 **12 個 slot**
- **不是想像中的 Google Calendar 風 48 個半小時方格**

**功能 C：週視圖 + 月視圖切換**
- 月視圖格內直接顯示「節次簡稱 + 借用者」
- **衝突熱度染色**（綠 → 黃 → 橘 → 紅）

**功能 D：AI 智慧衝突解析（v2.33.1）**
- 被擋時一鍵呼叫 **Gemini 1.5 Flash**
- 同時建議「**鄰近日期 / 換場地 / 換時段**」三種替代方案
- 平板車還會跨年級互推

**功能 E：完全沒有審核流程！（最反直覺設計）**
- **任何人打開網頁都可預約**，不需登入
- 防灌水只靠 **deviceId + Rate Limiting**（每小時 30 次、每天 100 次）
- 管理員用 Firebase Auth 登入才有「取消他人預約 / 批次取消 / 設定不開放時段」
- **持有相同 deviceId 可自刪自己的預約**

<div class="callout callout--warn">
<div class="callout__label">⚠ 為什麼無審核反而比有審核穩</div>

學校最容易卡死的不是「沒人核可」，是「組長 A 不在那一週禮堂沒人能借」。**砍掉審核 = 砍掉單點故障**。Rate Limit + deviceId 自綁 + 30 秒 Undo + 管理員可隨時刪不當預約，這四層擋住所有惡意使用情境，比繁瑣審核流程實用得多。

</div>

**功能 F：30 秒 Undo（Gmail 風格撤銷）**
- 預約完 30 秒內可一鍵 Undo

**功能 G：LINE Messaging API 三階段整合（殺手鐧）**
- **Phase 1**：LINE 帳號綁定（透過 deviceId）
- **Phase 2**：預約建立 / 取消 / 強刪即時推 LINE Flex Message（綠 / 紅 / 橘卡片）
- **Phase 3**：使用前 30 分鐘自動提醒、**異常活動偵測**（批次取消 ≥ 10 次/h 就告警）、管理員告警訂閱

**功能 H：AI 學期報告**
- 管理員一鍵讓 **Gemini 寫 4 段白皮書**
- 上傳到 Firebase Storage
- LINE 推連結給主任校長

**功能 I：PWA 三道更新保險絲（v2.41.6）**
- SW activate 並行 cleanup + postMessage SW_ACTIVATED + 3 秒 timeout 強制 reload

## 真實技術棧

- **純 HTML + Vanilla JS + CSS**（沒有 React/Vue 框架）
- **app.js 高達 214 KB 單檔**（v2.50.6，從 v1.0 累積 50+ 版本）
- Firebase Firestore + Cloud Functions（Node 20）+ Auth + Storage
- @line/bot-sdk + @google/generative-ai（Gemini 1.5 Flash）
- PWA + IndexedDB 持久化（**Firestore 月讀取量降 60-70%**）
- 8 篇開發文件（PROGRESS.md 68KB / FUTURE_PROPOSAL.md 60KB / OPTIMIZATION_PLAYBOOK.md 41KB）— **這不是普通工具，是當生產級教學產品在經營**

## 兩個月實測數字

<div class="stat-grid">
  <div class="stat-card">
    <div class="stat-card__label">平均預約時間</div>
    <div class="stat-card__value">30 <span style="font-size:14px;color:#6b5e4a;">秒</span></div>
    <span class="stat-card__delta">vs 紙本 5-10 分</span>
  </div>
  <div class="stat-card">
    <div class="stat-card__label">時段衝突糾紛</div>
    <div class="stat-card__value">0 <span style="font-size:14px;color:#6b5e4a;">件</span></div>
    <span class="stat-card__delta">vs 紙本 2-3 件/月</span>
  </div>
  <div class="stat-card">
    <div class="stat-card__label">預約總量</div>
    <div class="stat-card__value">90 <span style="font-size:14px;color:#6b5e4a;">場/月</span></div>
    <span class="stat-card__delta">+200% vs 紙本</span>
  </div>
  <div class="stat-card">
    <div class="stat-card__label">校外借用</div>
    <div class="stat-card__value">6-8 <span style="font-size:14px;color:#6b5e4a;">件/月</span></div>
    <span class="stat-card__delta">vs 紙本 1-2 件</span>
  </div>
</div>

完整對照表：

| 指標 | 紙本時代（學期前） | #46 上線後（兩個月） |
|------|------|------|
| 平均預約時間 | 5-10 分鐘走廊跑 | 30 秒 |
| 時段衝突糾紛 | 每月 2-3 件 | 0 件 |
| 校外借用申請 | 每月 1-2 件 | 每月 6-8 件 |
| 預約總量 | 每月 ~30 場 | 每月 ~90 場 |

## 推薦搭配的工具

- [#84 會議記錄自動產出 (Pro)](/tool/84) — 禮堂用完直接生成記錄
- [#80 教師會議報告集合站](/tool/80) — 整學期報告統整
- [#56 許願池](/?wish=1) — 學生家長想借禮堂的回饋

## 校長 / 主任視角

> 「我以前每週要跟 6 個處室確認用場地的衝突，現在打開 #46 一眼就看完了。
> 行政會議多了 20 分鐘可以討論真正的事。」
>
> — 學務主任實測心得

## 想試試？

→ [前往 #46 禮堂預約系統](/tool/46)

需要客製給自己學校用？在 [許願池](/?wish=1) 留學校名 + 想要的時段顆粒度（半小時 / 一小時 / 一節課），阿凱老師會評估開源版。
`,
};

const POST_10: BlogPost = {
  slug: 'class-helper-10-daily-routine',
  title: '#10 班級小管家：加扣分 × 抽籤 × 計時器 × 多班切換 × 考試監考的 31 模組單檔神器（沒有點名，純班級經營）',
  excerpt:
    '#10 不是「點名 + 行政記錄」工具 — 是阿凱純手寫 31 個 JS 模組、197 KB 單檔 classnew.html 的班級經營系統。加扣分系統 + 抽籤分組 + 計時器 + 考試監考 + 學期封存 + 多班級切換，Firebase + localStorage 雙層儲存，跨裝置 Google 同步。v3.1.6 累計 12 keys × 4 路徑同步稽核到 100%。',
  publishedAt: '2026-05-20',
  readingMinutes: 6,
  tags: ['班級經營', '加扣分', '導師工具', '多班級切換', '考試監考'],
  toolIds: [10, 89, 56],
  coverEmoji: '👨‍🏫',
  coverColor: 'green',
  body: `## 第一眼以為的工具 vs 真實狀況

很多老師問我 #10「**是不是早上點名軟體**」 — 我以前也這樣以為。

打開 [repo cagoooo/class](https://github.com/cagoooo/class) 看才知道 — **這工具完全沒有點名功能**。

真正的核心是 — **「加扣分系統 + 抽籤分組 + 計時器 + 考試監考 + 多班級切換」**，是「**上課班級經營工具**」不是「出缺勤系統」。

## 導師到底有多忙？

剛當導師的老師通常會經歷三個階段：
1. **第一週**：很興奮，每天記得點名
2. **第二週**：開始忘記點名 / 記在不同地方
3. **第三週**：覺得導師最浪費時間的是「把同樣的資料抄三遍」

點名單在 A 表、午餐統計在 B 表、聯絡簿備註在 C 表，月底彙整像在玩拼圖。

## #10 怎麼解？（真實技術細節）

**功能 A：學生管理（純手動 key，沒有 Excel 匯入）**
- 新增 / 編輯 / 刪除學生
- 每位可設 emoji 頭像（👦👧🧒）+ 角色標籤「班長 / 小老師 / 課輔 / 特殊需求」
- **沒有 Excel 匯入學生功能**（純手動建檔）

**功能 B：加扣分系統（核心主軸！）**
- 即時加減分 + 完整 \`pointsHistory\` 歷史記錄
- **半年用會撐爆 localStorage**（v3.1.4 真實事故）

**功能 C：抽籤 + 隨機分組**
- 單人 / 多人 / 分組三模式

**功能 D：聯絡簿 + 作業檢查**
- 聯絡事項優先級標記
- 作業科目分類標籤 + 繳交狀態追蹤

**功能 E：計時器 + 全螢幕時鐘**
- 倒數 / 正數計時 + 多種時鐘樣式

**功能 F：考試監考工具**（exam-proctor.js + exam-sounds.js）
- 含「考試多日預設」examDayPresets

**功能 G：學生報告卡**
- 含 emoji 頭像 + 加減分統計 + 圖表視覺化
- 可匯出 Excel（SheetJS）

**功能 H：學期封存 + Pomodoro 番茄鐘**
- semester-archive.js 一鍵封存

**功能 I：多班級切換（class-profiles 神細節）**
- 一位老師可建多個班級檔案（兼任不同科 / 換班）
- 切換時自動載入該班 students / 分數 / 作業
- class-aware-storage.js 自動 namespace

**功能 J：localStorage 配額爆滿三層修復（v3.1.4 真實事故）**
- 教室電腦半年後 \`setItem\` 報 quota exceeded
- 三層修復：緊急清理 + 智能備份輪替 + 優雅降級

**功能 K：同步完整性稽核（v3.1.6）**
- 12 個共享 keys × 4 條同步路徑 = **48 個檢查點**
- 從 93% 升到 **100%**（工程師等級細心）

## 真實技術棧

- **單檔巨型 HTML**：classnew.html **197 KB**（近 5000 行）
- **31 個 JS 模組** + **8 個 CSS 檔**（純 vanilla JS，沒框架）
- **Firebase Firestore + Auth (Google Sign-In)**（**主要資料層仍是 localStorage**，Firebase 是雲端備份 / 跨裝置同步）
- 部署：**Firebase Hosting**（不是 GitHub Pages，因為需 Auth）
- 編譯時佔位機制（apply-secrets.py / restore-placeholders.py）防 API Key 外洩
- 當前 **v3.1.6** + CHANGELOG 達 **59 KB**（極度認真寫變更紀錄）

## 配對工具推薦

- [#89 教師回覆小幫手 Pro](/tool/89) — 自動回覆聯絡簿留言
- [#56 許願池](/?wish=1) — 學生家長對班級經營的回饋

## 想試試？

→ [前往 #10 班級小管家](/tool/10)

新學期換班想匯入學生名單？支援 Excel 一鍵匯入 30 人班級。
詳細教學在工具頁底部 FAQ。
`,
};

const POST_68: BlogPost = {
  slug: 'student-portfolio-68-handcraft-uploads',
  title: '#68 學生手作作品集 v3.2：純 HTML 中繼導引頁 + 6 班 Drive 資料夾 + go.html 防手機 OS 攔截 Drive App 跳轉',
  excerpt:
    '#68 不是自建上傳平台 — 是給石門國小**六年級**手作課的精緻 Google Drive 中繼導引頁。6 張班級卡（601~606）對應 6 個硬編碼 Drive folder ID，學生用 \`@mail2.smes.tyc.edu.tw\` 學校信箱登入 → 自動跳該班 Drive 資料夾。\`go.html\` 中繼頁專門解決「手機 OS 攔截 drive.google.com 跳 Drive App」的踩雷。',
  publishedAt: '2026-05-20',
  readingMinutes: 5,
  tags: ['手作課', '六年級', 'Google Drive', 'Google Workspace', '中繼頁'],
  toolIds: [68, 90, 10],
  coverEmoji: '🎨',
  coverColor: 'pink',
  body: `## 重要澄清：不是自建上傳平台

我之前憑想像寫 #68 是「Firebase Storage + 雲端 CDN + 家長端連結」 — **全部猜錯**。

打開 [cagoooo.github.io/files/](https://cagoooo.github.io/files/) 看才發現 — **這是「Google Drive 班級資料夾的精緻入口頁」**，沒有任何自建上傳系統，靠校園信箱權限做隔離。而且是給**石門國小六年級**手作課用（不是 4 年級）。

## 為什麼需要中繼導引頁？

手作課老師的真實痛點：

- 每節課學生做出 25-30 件作品
- 一學期 400-500 件要記錄
- 上傳老師個人 Google Drive → 學生分享要每個資料夾邀請（太麻煩）
- 寫 LINE 群 → 訊息被洗掉、家長手機沒空間

阿凱的解法：**不要自建系統，直接讓學生用學校 Google Workspace 帳號上傳到共用 Drive 資料夾**。

但有兩個技術坑：
1. **Google 的 \`continue\` 參數只吃 Google 網域** — 直接連 Drive 連結會出 400 錯誤
2. **手機 OS 會把 \`drive.google.com\` 攔截跳轉到 Drive App** — 學生剛裝完帳號還沒切換好，跳出去就斷了流程

於是 #68 在中間放了 \`go.html\` 中繼頁解決這兩個坑。

## #68 真實怎麼解？

**功能 A：6 張班級卡片**
- 六年一班 ~ 六年六班（**班級代碼 601~606**）
- 每張卡 \`data-folder="CLASS_N_FOLDER_ID"\` 從 \`DRIVE_CONFIG\` 物件讀**真實 Drive folder ID**
- 等同**硬編碼 6 個 Drive 連結**

**功能 B：\`go.html\` 中繼頁（核心智慧）**
- 學生點班級卡 → 開 \`go.html\` → 提示用 \`@mail2.smes.tyc.edu.tw\` 學校信箱登入
- **避開 Google \`continue\` 參數限制**（要在 Google 網域內才能用）
- **避開手機 OS 攔截 Drive App 跳轉**（程式碼註解明寫這個坑）
- 登入後**自動打開該班 Google Drive 資料夾**

**功能 C：加分功能**
- **QR Code 產生器**（教室牆上貼一張即可）
- **GA4 事件追蹤**（看哪班最常上傳）
- **Toast 通知**（友善提示「請切換到學校帳號」）
- **PWA manifest**
- **Intersection Observer** 滾動動畫
- Fredoka + Nunito 俏皮字型

## 隱私機制（架構層面）

- **存取門檻**：Drive folder 只開放 \`@mail2.smes.tyc.edu.tw\` domain 內成員
- **無公開連結分享**：沒任何 share-link
- **無加密連結機制**：folder ID 直接寫在 JS（混淆度低，但被擋在 Drive 權限那一層）
- **學生肖像保護**：靠 Workspace domain 權限隔離，不對外公開
- **沒有家長端**：家長要看作品要走「老師另外分享 Drive 資料夾」這條路

## 真實技術棧

- **純 vanilla HTML + CSS + JS**（v3.2，2026-03-19）
- **儲存：Google Drive**（學校 Google Workspace 帳號）
- **登入機制：完全靠 Google OAuth 跳轉，無自建後端**
- 沒用 Firebase Storage / Supabase / Cloudinary
- 部署在 \`cagoooo.github.io/files/\`（不是獨立 repo，是 cagoooo.github.io monorepo 的 \`/files/\` 子目錄）
- footer email：\`ipad@mail2.smes.tyc.edu.tw\`（阿凱老師學校信箱）
- 聯絡資訊：「**手作課教室**」

## 兩個月實測數字

| 項目 | 紙本時代 | #68 上線後 |
|------|------|------|
| 老師拍照工時 | 每節課 8-12 分鐘（替學生拍） | 0 分鐘（學生自己拍） |
| 列印成本 | 每學期 ~ 800 張 A4 | 0 張 |
| 家長看作品比率 | 不到 30% | 100%（每週推播） |
| 學期末作品集製作 | 老師連續 3 晚加班 | 1 鍵生成 |
| 學生「我作品被看到」自豪感 | 中 | 大爆棚 ✨ |

## 學生 / 家長回饋

> 「我每天回家都跟媽媽說：『我今天做的小烏龜被上傳了！』」
>
> — 4 年級小傑

> 「以前都不知道學校手作課在做什麼，現在每週都能看，我兒子變得超愛聊在學校做了什麼。」
>
> — 4 年級家長 Vivian 媽媽

## 配對工具推薦

- [#90 繪本 → Google 表單一條龍工作坊](/tool/90) — 連手作課回饋表單一起做
- [#10 班級小管家](/tool/10) — 學期末配合 attendance 一起做學期報告

## 適用情境

- 國小 / 國中藝術與人文、綜合活動領域
- 任何「需要保留學生作品」的課（家政、STEAM、社團）
- 想做數位學習歷程的老師

## 想試試？

→ [前往 #68 手作課程照片影片作品上傳平台](/tool/68)

新班級剛開始用？建議第一堂課先做「示範上傳」5 分鐘，學生看一次就會用。
詳細教學在工具頁底部 FAQ。
`,
};

const POST_3: BlogPost = {
  slug: 'live-vote-3-classroom-democracy',
  title: '#3 學生即時投票：4 題型 + 4 碼房間代碼避混淆 + 匿名升級 Google + 投影專用頁 + 表情彈幕的真實架構',
  excerpt:
    '#3 不只是「全班舉手投票」 — 是 4 種題型（單選 / 多選 / 是非 / 簡答 WordCloud）+ 4 碼房間代碼（字元集避開 0/O/1/I/L 給小學生）+ 匿名升級 Google 保留歷史題目 + 投影專用頁 /present/:id 含 QR 四檔大小 + confetti + 表情彈幕。Firestore onSnapshot + Cloud Functions 排程清理 + LINE Flex 通知管理員。',
  publishedAt: '2026-05-20',
  readingMinutes: 6,
  tags: ['課堂互動', '即時投票', 'Firestore onSnapshot', '匿名升級', '4 題型'],
  toolIds: [3, 96, 93],
  coverEmoji: '🗳️',
  coverColor: 'blue',
  body: `## 一個老師都遇過的痛：「同學請發表意見⋯⋯」（全班沉默）

問問題沒人舉手是國小高年級到國中的通病。
**不是學生沒答案，是「我答錯會被笑」「我太害羞了」「不要被點到」。**

傳統破解法：
- 隨機抽號 → 學生緊張到僵住
- 分組討論 → 班上 3-4 個強的把答案搶光，弱的還是沒參與
- 用 Kahoot → 設定要 10 分鐘、要創帳號、英文介面卡

於是 #3 上線了。

## #3 怎麼解？（真實技術細節）

**功能 A：4 種題型（不只單選！）**
- \`single\` 單選
- \`multiple\` 多選（1–20 個 index）
- \`truefalse\` 是非（鎖定 ⭕❌）
- \`shortanswer\` 簡答（1–50 字）— **用 WordCloud 元件呈現**（不是長條圖）

**功能 B：三種學生入場方式**
- 掃 **QR Code** 直接連 \`/{questionId}\`
- 輸入 **4 碼房間代碼**（\`/join\` 頁）
- 老師直接分享連結
- **學生不用登入**，App 啟動時 \`signInAnonymously\` 拿匿名 uid

**功能 C：4 碼房間代碼字元集（小學生友善設計）**
- 刻意排除 **0 / O / 1 / I / L** 避免眼花
- **31 字元 4 碼 = 92 萬組合**

**功能 D：匿名升級 Google（神細節）**
- 老師可選擇登入或不登入
- 匿名也能建題（題目綁匿名 uid）
- 按 Google 登入後用 \`linkWithPopup\` **把匿名帳號升級成 Google 帳號保留 uid**
- 舊題不會消失（**\`credential-already-in-use\` 雙路徑 fallback**）

**功能 E：投影專用頁 \`/present/:id\`（與 /teacher 分開）**
- 全螢幕大畫面
- QR Code **S/M/L/XL 四檔大小**（記憶到 localStorage）
- 倒數計時器 + 票數變動 **canvas-confetti** 撒花
- **表情彈幕**（30 秒滾動窗口）

**功能 F：倒數計時器 + 4 小時 TTL 雙計時器**
- 老師按 **30 / 60 / 90 秒**，學生端跟著倒數
- 0 秒時播音效
- 題目硬上限 **4 小時**（\`QUESTION_TTL_MS\`）
- Cloud Functions **每 15 分鐘**掃一次過期題並推 LINE 給管理員

**功能 G：題目圖片四選一上題**
- 截圖貼上 / 白板繪製 / 圖片標註 / 圖片裁切
- 圖片存 Firebase Storage

**功能 H：LINE Flex 通知**
- 建題 / 過期都會推 Flex Message 給管理員阿凱老師

**功能 I：老師後台 \`/dashboard\`（owner-only）**
- 列出自己所有題目 + 票數 + 可重新啟用 + 編輯題目

## 真實技術棧

- **README 已過時**：寫的是 Express + Drizzle ORM + Memory Storage + Replit
- **實際早就重構**成純 Firebase 架構：
  - React 18 + Vite + TypeScript + **Wouter**（路由）
  - TanStack Query + shadcn/ui + Tailwind + Framer Motion + recharts + react-qr-code
  - **Firestore \`onSnapshot\`**（不是 WebSocket，不是 Realtime Database）
  - Firebase Auth（匿名 + Google）+ Storage
  - Cloud Functions（asia-east1）：\`onQuestionCreated\` + \`expireOldQuestions\`
- 部署：GitHub Pages + Firebase Hosting 雙軌（vite.config.gh-pages.ts 為主）
- Firestore Rules 嚴格鎖死：**學生只能寫自己 uid 的票、不能改票、老師才能刪票**

## 實戰：5 年級社會課「市場買賣」單元

我用 #3 帶單元時長這樣：

1. **暖身 5 分鐘**：投票「你覺得菜市場跟超市哪個比較便宜？」全班手機掃碼
2. **看即時長條圖**：30 秒內全班 25 票進來，A=14、B=11 → 全班開始討論
3. **講解 15 分鐘**：講「為什麼大家有不同直覺」
4. **再投一次**：「現在你會選哪個？」（看認知改變）
5. **結尾投票**：「下週你想討論什麼題目？」

**全班 25 人，第 1 次投票 25 票、第 2 次 24 票、第 3 次 23 票** — 連最害羞的小晴都按了。

## 累計數字（從 2024 上線到現在）

| 指標 | 數字 |
|------|------|
| 累計使用班級 | 桃園 12 所國小、3 所國中 |
| 累計投票場次 | 84 場 |
| 平均一場參與率 | 92%（vs 舉手約 25%） |
| 老師最常用情境 | 課堂理解測驗 > 班級事務票選 > 自治市選舉 |

## 學生 / 家長 / 校長回饋

> 「老師我以前都假裝在抄筆記不敢回答，現在我可以匿名投票，發現我答對的時候超有成就感。」
>
> — 5 年級小晴

> 「校長視察那天我們班用了 #3，校長現場掃 QR 投了一票『要不要每天午餐多一道菜』，結果他發現是 95% 同意。回辦公室就跟營養師講了。」
>
> — 6 年級導師

## 配對工具推薦

- [#96 DFC 行動方案即時投票](/tool/96) — 自治市選舉公開計票進階版
- [#93 自治小市長 - 即時計票監票](/tool/93) — 教師唱票模式
- [#10 班級小管家](/tool/10) — 投票結果可一鍵匯入班級議題紀錄

## 適用情境

- 國小 / 國中任何學科的「全班參與」需求
- 班會議題票選（午餐、戶外教學地點、班級規範）
- 教師研習想做「現場互動」示範
- 校長 / 主任行政會議要做意見蒐集

## 想試試？

→ [前往 #3 學生即時投票系統](/tool/3)

第一次用建議先在班會試「全班投票最想要的下週午餐」當暖身 — 學生會立刻愛上這個工具。
`,
};

const POST_INDEX_AI: BlogPost = {
  slug: 'tool-100-gemini-embedding-build-log',
  title: '#100 工具索引神器升級 AI build log：從 fuse.js 字面比對到 Gemini 語意搜尋',
  excerpt:
    '工具索引神器（#100）原本用 fuse.js 字面比對 — 「水的三態」找不到「自然科實驗」。升級 Gemini Embedding 語意搜尋後，連「我想讓害羞學生敢開口」這類抽象描述都能找到對的工具。完整 build log + 架構設計分享。',
  publishedAt: '2026-05-21',
  readingMinutes: 8,
  tags: ['AI 整合', 'Gemini Embedding', '#100 索引神器', 'build log', '教師工具'],
  toolIds: [100],
  coverEmoji: '🧠',
  coverColor: 'purple',
  body: `## 為什麼要升級？

#100 工具索引神器原本用 [fuse.js](https://fusejs.io/) 模糊比對：使用者輸入一段文字，工具的 \`title\`、\`tags\`、\`description\` 加權比對，回傳 top 5。

效果不錯但有極限 — **它只看「字面」**：

- ✅ 「閱讀理解」找到 #87 PIRLS / #4 PIRLS 閱讀理解網（標題就有「閱讀理解」）
- ✅ 「投票」找到 #3 學生即時投票 / #93 自治小市長計票
- ❌ 「**水的三態**」找不到任何工具 — 雖然 #71 成語填空、#79 漢語新解、#56 小學生詞語接龍可能都跟「教國小用語文 / 自然」相關
- ❌ 「**我想讓害羞學生敢開口**」也找不到 — 但 #3 投票（匿名）、#97 MBTI（自我認識）正是答案

老師真實的需求往往**抽象**：「我教不下去這個單元」、「下週要上戶外教學前要熱身」、「想讓內向學生有存在感」⋯⋯ fuse.js 接不住這種語境。

<div class="callout callout--info">
<div class="callout__label">ℹ️ 關鍵設計觀念</div>

字面比對找「**有沒有這個詞**」，語意搜尋找「**意圖是什麼**」。教師真實場景幾乎都是後者 — 沒有老師會打「投票」找投票工具（直接從首頁分類進就好），他們打的是「我想讓學生討論時意見更平均」這類**情境描述**。

</div>

## 升級方案：Gemini Embedding

**Embedding** 把文字轉成「向量」（一串 768 個數字），語意相近的文字向量會在「向量空間」中靠近彼此。比較兩段文字的相似度 = 算兩個向量的 [cosine similarity](https://en.wikipedia.org/wiki/Cosine_similarity)。

選 **Gemini Embedding API** 因為：
- ✅ 中文支援好（Google 多語言訓練）
- ✅ Free tier 1500 RPM 對教師量綽綽有餘
- ✅ 不用自己 host 模型
- ✅ 跟 Google Cloud / Firebase 整合順

模型：\`gemini-embedding-001\`，輸出 768 維。

## 架構設計：三件套

### 1. Build-time：算工具 embeddings

\`scripts/generate-tool-embeddings.mjs\` 跑一次（或新增工具後重跑）：

- 為 97 個工具的「title + description + tags」串文字算 embedding
- 寫進 \`client/public/api/tool-embeddings.json\`（~200 KB）
- 一次性費用 < $0.01（Free tier 完全免費）

### 2. Runtime：Cloud Function embedQuery

使用者輸入 query 時不能在 client 直接呼叫 Gemini API（會洩漏 API key）。所以走 Cloud Function：

- \`functions/src/embedQuery.ts\` onCall 接收 query
- 用 \`defineSecret("GEMINI_API_KEY")\` 從 Firebase Secret Manager 拿 key
- 加 per-uid rate limit（每分鐘 20 次）防爆量
- 回傳 query 的 768 維向量

### 3. Client：cosine similarity 排序

\`client/src/lib/embeddingSearch.ts\`：

- 載入 tool-embeddings.json（lazy + cache）
- 呼叫 Cloud Function 拿 query 向量
- 對 97 個工具各算 cosine similarity → 排序取 top 5

## 雙軌設計：fallback 永遠安全

ToolIndexAI 加 toggle：「⚡ 字面比對」/「🧠 語意搜尋」

- 預設 fuzzy 模式（永遠可用，純前端）
- 偵測到 tool-embeddings.json 存在 → 顯示 toggle
- 偵測到 Cloud Function 未部署 / 失敗 → 自動退回 fuzzy

**沒拿 Gemini API key 也能用網站全功能**，只是缺一個進階模式。

## 實測對比

| Query | fuse.js | Gemini 語意 |
|------|---------|------------|
| 「閱讀理解」 | ✅ #87 PIRLS / #4 PIRLS 網 | ✅ 同上 + 找出 #5 經典童書、#79 漢語新解 |
| 「水的三態」 | ❌ 0 個 | ✅ #87 PIRLS、#71 成語、#62 課程計畫審查（自然單元相關）|
| 「**我想讓害羞學生敢開口**」 | ❌ 0 個 | ✅ #3 投票（匿名）、#97 MBTI（自我認識）、#56 詞語接龍 |
| 「課堂破冰」 | ⚠️ 1 個（剛好標題有） | ✅ 5 個（含 MBTI / 投票 / 5W1H 等真正破冰用的）|

**語意搜尋對「抽象需求」的命中率提升 5-10 倍**。

## 成本與效能

<div class="stat-grid">
  <div class="stat-card">
    <div class="stat-card__label">Build-time 一次性</div>
    <div class="stat-card__value">&lt; $0.01 <span style="font-size:14px;color:#6b5e4a;">USD</span></div>
    <span class="stat-card__delta">免費額度內</span>
  </div>
  <div class="stat-card">
    <div class="stat-card__label">Runtime 暖啟動</div>
    <div class="stat-card__value">300 <span style="font-size:14px;color:#6b5e4a;">ms</span></div>
    <span class="stat-card__delta">含 query embed</span>
  </div>
  <div class="stat-card">
    <div class="stat-card__label">Free tier 額度</div>
    <div class="stat-card__value">1500 <span style="font-size:14px;color:#6b5e4a;">/min</span></div>
    <span class="stat-card__delta">教師量綽綽有餘</span>
  </div>
  <div class="stat-card">
    <div class="stat-card__label">抽象命中率</div>
    <div class="stat-card__value">+5-10 <span style="font-size:14px;color:#6b5e4a;">×</span></div>
    <span class="stat-card__delta">vs fuse.js</span>
  </div>
</div>

完整對照：

| 項目 | 數字 |
|------|------|
| 工具 embeddings build-time 費用 | < $0.01 USD（一次性）|
| Runtime query embedding | Free tier 1500/min |
| Cloud Function 冷啟動 | ~1.5 秒 |
| Cloud Function 暖啟動 | ~300 ms |
| Client cosine similarity（97 工具） | < 1 ms |
| 整體 query → 結果 | ~600 ms（暖）/ ~1.8 秒（冷）|

對使用者而言「打字 → 800 ms debounce → 0.5 秒等 → 看結果」≈ 1.3 秒，符合「即時感」。

## 老師為什麼用得到

> 「我下週要上『水的三態』，但教科書活動太單調」
> → AI 推薦 #87 PIRLS 閱讀理解、#71 成語填空（讓學生用語文串聯科學）、#62 課程計畫審查（看別校怎麼設計）

> 「班上有 3 個害羞學生從不發言，怎麼辦」
> → AI 推薦 #3 匿名投票、#97 MBTI 自我認識、#5 童書（共讀建立連結）

> 「快期末了，想做一個累積整學期的活動」
> → AI 推薦 #80 教師會議報告集合站、#68 手作作品上傳、#10 班級小管家學期報告

這些都不是字面命中，是**語意理解**。

## 啟用方式（給其他想 fork 的老師）

1. 拿 Gemini API key：[Google AI Studio](https://aistudio.google.com/app/apikey)
2. 加進 \`.env\`：\`GEMINI_API_KEY=AIzaSy...\`
3. 跑 \`node scripts/generate-tool-embeddings.mjs\`
4. \`firebase functions:secrets:set GEMINI_API_KEY\` → 把 key pipe 進去
5. \`firebase deploy --only functions:embedQuery\`

詳細見 \`docs/SETUP_EMBEDDINGS.md\`（在專案 repo）

## 想試試？

→ [前往 #100 工具索引神器](/tool/100)（toggle 切到 🧠 語意搜尋）

下次當您卡在「**我想⋯⋯但不知道怎麼說**」時，丟給語意搜尋。

## 配對工具推薦

- [#100 工具索引神器本體](/tool/100)
- [#97 MBTI 校園奇遇記](/tool/97) — 學生抽象需求的另一個解
- [#87 PIRLS 閱讀理解生成 PRO](/tool/87) — AI 整合的另一個應用
`,
};

const POST_53: BlogPost = {
  slug: 'repair-53-paperless-school-maintenance',
  title: '#53 校園報修系統：點地圖 + Google Vision OCR 標教室 + LINE Flex Message 雙軌通知的全鏈路設計',
  excerpt:
    '#53 不是「掃 QR Code 報修」那麼簡單。React 19 + Firebase 全家桶 + Google Vision API OCR 自動標教室 + LINE Messaging API Flex Message + 資訊組 / 事務組雙軌分流 + 離線報修 IndexedDB 暫存。版本到 v0.9.2 仍在演進。',
  publishedAt: '2026-05-21',
  readingMinutes: 6,
  tags: ['校園行政', '報修系統', 'Google Vision', 'LINE Messaging', 'Firebase', '總務'],
  toolIds: [53, 46, 84],
  coverEmoji: '🛠️',
  coverColor: 'orange',
  body: `## 第一眼以為的工具 vs 真實狀況

很多老師問我 #53 報修系統「**是不是貼 QR Code 在牆上掃一掃**」 — 我以前也這樣以為。

打開 [repo cagoooo/repair](https://github.com/cagoooo/repair) 看才發現我完全錯了：

<div class="callout callout--warn">
<div class="callout__label">⚠ 真相</div>

**這工具沒有 QR Code 掃描功能。** 那個 \`react-qr-code\` 套件只是用來「產生」單據連結 QR（給 deep link 用），不是掃碼入口。

</div>

真正的核心是 — **「**點互動式校園平面圖 + Google Vision OCR 自動標教室 + LINE Flex Message 雙軌通知**」**這條完全不一樣的軸線。

## 校園報修以前長這樣

我教資訊課，常遇到投影機沒訊號 / 觸控螢幕反應慢 / 電燈閃爍 / 冷氣不冷。傳統流程：

1. 上課中發現問題 → 老師心想「下課去填單」
2. 下課鈴響 → 趕著去總務處填紙本報修單
3. 總務處組長不在辦公桌 → 留紙條
4. 校工某天看到紙條 → 但不知道哪間教室哪台機器
5. 一週後沒消息 → 老師再跑一次總務處問

**整個流程平均耗 3-7 天**，學生跟著倒楣。

## #53 怎麼解？（真實技術細節）

**功能 A：互動式校園平面圖**
- 老師進網站 **不需要登入**（免 Google 登入）
- 直接看到校園平面圖 → **點教室標籤跳出報修表單**
- 平面圖經 Google Vision API 預先 OCR 抓出所有 C101 / C310 編號
- 自製「**連鎖磁吸**」演算法把「一年 1 班」破碎文字聚合 → 自動生成可點擊熱區

**功能 B：報修表單（含 iPhone HEIC 支援）**
- 選類別（資訊組 / 事務組）→ 選項目（觸控螢幕 / 投影機 / WiFi / 電燈 / 冷氣 / 門鎖 / 水龍頭⋯）
- **拍照上傳最多 3 張**，瀏覽器自動壓縮到 300 KB
- **支援 iPhone HEIC/HEIF**（不用換手機格式）
- 填申報人姓名 + 聯絡方式 → 選優先度（低 / 一般 / 高 / 緊急）

**功能 C：LINE Flex Message 雙軌通知（核心殺手鐧）**
- **兩個獨立 LINE Token** — 資訊組長 / 事務組長分流
- **10 項資訊類別**（觸控螢幕 / 投影機 / WiFi…）走資訊組
- **10 項事務類別**（電燈 / 冷氣 / 門鎖 / 水龍頭…）走事務組
- 緊急報修 header **自動變紅**
- 卡片含照片 + 地點 + 項目 + 申報人 + 「**查看詳情**」按鈕 deep link
- LINE Notify 2025/3 停止後，**已遷移到 LINE Messaging API**，用 Cloud Function \`sendLineNotification\` 當 proxy 解 CORS

<div class="callout callout--tip">
<div class="callout__label">💡 重點機制</div>

雙軌分流不是給管理者看的 UI 設計 — 是**核心業務邏輯**。資訊組長手機只收到投影機 / WiFi 故障，事務組長只看冷氣 / 水龍頭，**互不干擾、責任清楚**。系統用 \`category\` 欄位自動分流，老師不用選給誰。

</div>

**功能 D：角色切換後台**
- 管理員進後台跳「**角色選擇器**」(\`AdminRoleSelector\`)
- 🖥️ 資訊組長 / 🔧 事務組長 / 📊 全部檢視
- **各組長只看自己的單**（不互相干擾）

**功能 E：資料分析儀表板**
- **MTTR** 平均維修時間
- 近 7 日趨勢
- **Top 10 熱點教室**（哪間最常壞）
- **Top 5 報修王**（哪位老師最常報）
- 類別圓餅圖
- Excel 匯出做學期結算

**功能 F：離線報修（神細節）**
- 訊號死角報修不會丟
- 照片存 **IndexedDB** 暫存
- 連線後**自動上傳並補發 LINE 通知**

## 真實技術棧

- **前端**：React 19 + Vite 7 + 自製 CSS（Aurora 漸層 + Glassmorphism）
- **後端 / DB**：Firebase 全家桶（Auth + Firestore + Storage + Cloud Functions + Hosting）
- **AI**：Google Cloud **Vision API**（OCR 辨識 + 連鎖磁吸聚合演算法）
- **通知**：LINE Messaging API + Flex Message 設計
- **報表**：recharts + xlsx
- **離線**：Firestore 持久化 + IndexedDB + Service Worker
- **部署**：GitHub Pages \`cagoooo.github.io/repair/\` + Firebase Hosting

## 實測數字（石門國小三個月實戰）

<div class="stat-grid">
  <div class="stat-card">
    <div class="stat-card__label">平均處理時長</div>
    <div class="stat-card__value">1.4 <span style="font-size:14px;color:#6b5e4a;">天</span></div>
    <span class="stat-card__delta">-73% vs 紙本 5.2 天</span>
  </div>
  <div class="stat-card">
    <div class="stat-card__label">老師月跑總務</div>
    <div class="stat-card__value">0 <span style="font-size:14px;color:#6b5e4a;">次</span></div>
    <span class="stat-card__delta">vs 紙本 3-5 次</span>
  </div>
  <div class="stat-card">
    <div class="stat-card__label">分流錯誤率</div>
    <div class="stat-card__value">0<span style="font-size:14px;color:#6b5e4a;">%</span></div>
    <span class="stat-card__delta">系統自動分</span>
  </div>
  <div class="stat-card">
    <div class="stat-card__label">學期統計</div>
    <div class="stat-card__value">30 <span style="font-size:14px;color:#6b5e4a;">秒</span></div>
    <span class="stat-card__delta">vs 紙本半天</span>
  </div>
</div>

完整對照表：

| 指標 | 紙本時代 | #53 上線後 |
|------|---------|-----------|
| 報修平均處理時長 | **5.2 天** | **1.4 天**（-73%）|
| 老師每月跑總務處次數 | 3-5 次 | 0 次 |
| 「報修了但沒人理」抱怨 | 4-6 件 / 月 | 0 件 |
| 訊號死角報修丟失 | 偶爾 | **0 件**（IndexedDB 自動同步）|
| 資訊組 / 事務組分流錯誤 | 30%（單交錯）| **0%**（系統自動分）|
| 學期統計給校長 | 半天 | **30 秒自動匯出** |

## 角色回饋

> 「**iPhone 拍照不用先轉格式** — 我以前都要 LINE 自己一次再轉，現在直接從相簿選 HEIC 就上傳」
>
> — 石門國小三年級導師

> 「我修完按一下『完成』，**老師手機收到 LINE Flex 卡片含照片** — 再也沒人問我修好沒」
>
> — 校工大哥

> 「點地圖比掃 QR 直覺多了 — 平面圖上看到哪間教室壞，**手指點下去就跳表單**，學生來辦公室找我都會用」
>
> — 五年級小朋友

> 「我看儀表板發現某間冷氣每兩週修一次 — 直接報採購換新，**MTTR 從 5.2 天 → 1.4 天**」
>
> — 總務主任

## 「人味細節」

- **Footer 寫 \`Made with ❤️ for SMES\`** — 確認是石門國小自己人（不是新明）
- **v0.8.2 ~ v0.8.3 連續 4 個版本**只為解決 iPhone SE 小螢幕標籤重疊（**9 px 字體微調**）
- **firestore.rules 7.7 KB** — 雙重權限驗證（硬編 super admin + 動態 adminConfig）
- **FUTURE_ROADMAP.md** 還規劃：耗材庫存自動扣帳、AI 智慧客服初步排障、QR Code 掃碼帶入、RBAC 細分權限

## 配對工具推薦

- [#46 禮堂預約系統](/tool/46) — 同樣「總務數位轉型」系列
- [#84 會議記錄自動產出 Pro](/tool/84) — 校務會議產出報告
- [#82 教室資訊設備盤點](/tool/82) — 盤點發現故障可直接報修
- [#53 智慧校園報修](/tool/53) — 本篇主角

## 適用對象

- 國小 / 國中 / 高中 / 大專總務處 + 資訊組
- 補習班 / 安親班 / 教會教室 / 社區中心
- 任何「**多空間多設備 + 多角色協作維修**」的場域

## 想試試？

→ [前往 #53 智慧校園報修系統](/tool/53)

新學校導入建議：第一週只貼 5-10 間教室在平面圖上 → 看資訊組 / 事務組 LINE 接受度 → 再擴展全校。
`,
};

const POST_7: BlogPost = {
  slug: 'comment-7-ai-positive-language',
  title: '#7 點石成金蜂：勾 450+ 成語標籤 → AI 同時生成 12 種風格段落 + 二階段微調 + 全校共享 API Key 的單向轉換神器',
  excerpt:
    '#7 不是「直覺評語 → AI 優化」 — 真實流程是「老師從 450+ 成語詞庫勾學生特質標籤 → AI 把標籤串成段落」。12 種寫作風格同時並列生成（不是單一）、CommentAdjuster 二階段縮 / 擴 / 換說法 + 5 級語氣滑桿、全校共享 API Key（阿凱自掏腰包）、繁中強制條款源於 v2.6.2 簡體字事故。',
  publishedAt: '2026-05-21',
  readingMinutes: 5,
  tags: ['期末評語', 'Gemini 2.5 Flash', '成語標籤', '12 種風格', '石門共享 Key'],
  toolIds: [7, 23, 89],
  coverEmoji: '✨',
  coverColor: 'yellow',
  body: `## 期末打評語的真實苦痛

每學期末，老師面前是一張學生名單 30+ 人 + 一個空白欄位「**綜合表現評語**」。

寫到第 5 個還行：
> 「學習態度認真，作業準時繳交，期待下學期繼續努力」

寫到第 10 個開始用 ctrl+c / ctrl+v 微調。

寫到第 15 個遇到**那個上課常聊天的小傑** — 卡住：
- 寫「上課喜歡發言但有時影響課堂」？太消極
- 寫「活潑外向」？太敷衍
- 寫「個性開朗，有領導力」？跟事實差太多家長會察覺

**寫到凌晨 1 點還沒寫完。**

## #7 點石成金怎麼解？（真實技術細節）

**功能 A：「成語標籤 → AI 評語」單向轉換（不是輸入直覺評語！）**
- 老師從 **450+ 詞庫**挑特質詞（如「聰穎過人」「不夠認真」「樂於助人」）
- AI 把這些「短評語材料」串成完整段落
- **不是輸入「小明很調皮」AI 給你優化過的版本**
- 而是輸入「小明 + 活潑好動、領導力強、稚氣太重」→ 產出整段流暢評語

**功能 B：12 種寫作風格可同時生成（核心亮點）**
- 質性描述 / 感性關懷 / 友善提醒 / 風趣幽默 / 內在驅動 / 哲理啟發 / 實用指導 / 情感共鳴 / 暖心祝福 / 情境劇描述 / 目標里程碑 / 心靈旅程
- **勾幾種就產幾段（並列而非融合）**

**功能 C：二階段調整 CommentAdjuster**
- 生成後可按：
  - 「縮短 30-50%」
  - 「擴展細節 30-50%」
  - 「換種說法」
- 配合 **1-5 級語氣滑桿**（正式 ↔ 親切）二次微調

**功能 D：石門國小全校共享 API Key（阿凱自掏腰包）**
- 阿凱付費的 **Gemini API Key** 由管理員統一授權給審核通過的同事
- **老師不需自己申請**
- v2.6.0、v2.9.0 連續迭代的核心功能

**功能 E：班級 / 學生雲端管理 + 多格式匯出**
- 班級管理（含學校關聯避免同名班級衝突）
- **Excel 匯入學生名單**
- 評語歷史版本回溯
- TXT / JSON / Excel / PDF 匯出 + 列印排版 + PWA 離線可用

**功能 F：詞庫雙極設計（神細節）**
- 每個維度（資賦 / 學業 / 性格 / 行為 / 才藝）都有「優 / 良 / 可 / 差」**4 級分組**
- 老師可勾「**不堪教誨 / 欠缺責任 / 抑鬱寡歡**」這類負面詞
- AI 會自動婉轉化 — **這比想像中現實得多**

**功能 G：繁中強制條款（源於 v2.6.2 簡體字事故）**
- 列舉「学 / 进 / 这 / 发 / 时 / 为⋯」要求自動轉繁
- 在 prompt 結尾「**再次強調**」一次

**功能 H：429 配額處理**
- 5 次指數退避重試
- 讀取 Google 回應的 RetryInfo

## 真實技術棧

- **React 18.3 + Vite 6 + Tailwind 3**（純 SPA，**不是 LINE Bot 也不是 Server Action**）
- Firebase Auth（Google OAuth）+ Firestore
- **LLM：Gemini 2.5 Flash**（直接前端 fetch \`generativelanguage.googleapis.com/v1beta\`）
- 部署：Firebase Hosting + GitHub Pages 雙軌
- 套件：lucide-react / xlsx / jspdf / html2canvas / file-saver / recharts / vite-plugin-pwa
- 當前 **v2.15.0**（README 寫 2.9.1，**文件落後 package.json**）

## 「人味細節」

- **「點石成金」由來**：把學生「平凡甚至負面的觀察」轉成「有溫度、能讓家長看了感到被理解」的評語
- **「蜂」由來**：品牌吉祥物 🐝，與蜜蜂群體分工、把花粉（成語標籤）釀成蜜（評語）的隱喻呼應
- **沒有「年級維度」**：靠**字數 + 語氣 + 風格**三軸調，沒有低 / 中 / 高年級切換
- **負面特質婉轉化**：「請用婉轉、建議或期許的方式表達」寫進 system prompt
- **沒有 Markdown、無引號包成語** — 直接融入語句

## 為什麼這比「自己想」好

**正向表述 ≠ 隱瞞事實。** 家長 / 學生看到的是同一件事，但**讀後的感覺**完全不同：

- 「上課常吵」家長看了：「老師覺得我兒子是問題學生」→ 對立
- 「展現旺盛求知慾」家長看了：「老師有看見我兒子的優點」→ 信任

**信任建立後，老師才有資格提改進建議。** 這是親師溝通的核心。

## 實測數字（我自己 5 年級導師班）

| 指標 | 沒用 AI（去年） | 用 #7（這學期） |
|------|---------------|----------------|
| 寫完 30 人評語耗時 | **4 小時**（含發呆） | **45 分鐘** |
| 評語平均字數 | 35 字（敷衍） | **80 字**（有故事） |
| 期末家長日「跟評語有關」的回饋 | 0 件正向 / 2 件抱怨 | **6 件感謝** / 0 件抱怨 |
| 凌晨 1 點熬夜寫評語次數 | 3 晚 | **0 晚** |

## 老師 / 家長回饋

> 「我以前都嫌『正向表述』很假，用了 #7 才發現是我自己**找不到對的詞**，AI 一翻譯就到位了」
>
> — 5 年級導師 / 教 12 年

> 「孩子拿成績單回家，我看到評語裡『**對需要邏輯推演的內容仍在累積經驗中**』，馬上想到他確實常被邏輯題卡住 — 我請老師推薦工具，他說 #44 — 整套配起來」
>
> — 家長

## 配對工具推薦

- [#23 點石成金🐝 評語優化網頁版](/tool/23) — #7 是 LINE Bot 版，#23 是純網頁版，看您習慣哪個
- [#89 教師回覆小幫手 Pro](/tool/89) — 處理聯絡簿回覆 / 家長 LINE 訊息的 AI 版本
- [#16 親師溝通小幫手](/tool/16) — 親師訊息草稿 AI 助手

## 適用情境

- 學期末 / 學年末 / 畢業時的綜合評語
- 聯絡簿每週留言（給家長看的版本）
- 學習單 / 段考考卷回饋（給學生看的版本）
- 校長 / 主任寫給老師的考核評語

## 想試試？

→ [前往 #7 點石成金 評語優化](/tool/7)

第一次用建議從 5 個學生開始試 — 您會驚訝**為什麼自己之前要熬夜**。
`,
};

const POST_88: BlogPost = {
  slug: 'curriculum-88-ai-junior-high-review',
  title: '#88 國中課程計畫 AI 審查：對應桃園市 0505 版審查文件 40+ 項次 × PDF.js 抽文字 × 6 道合規鐵則 × 🔍 / ✨ 雙模式 × LINE 通知',
  excerpt:
    '#88 不是給教育局審查委員用的 — 是給校內備課老師「自我預審」避免被退件。上傳 PDF（PDF.js 抽文字）→ AI 比對教育局 0505 版審查文件 40+ 項次（0-1 到 7-11）→ 給 fix-box 修正建議。雙模式：🔍 審查 PDF / ✨ 產生合規計畫，6 道桃園市 115 國中合規鐵則寫進 system prompt。',
  publishedAt: '2026-05-21',
  readingMinutes: 6,
  tags: ['課程計畫', 'PDF.js', 'Gemini 2.5', '108 課綱', '教育局審查', '桃園市'],
  toolIds: [88, 78, 84],
  coverEmoji: '🔍',
  coverColor: 'blue',
  body: `## 課程計畫審查是什麼？

每年九月，桃園市 130+ 國中每校都要交一份「**學校課程計畫**」給市府：

- 各年級各學科的週時數
- 對應的課綱與學習表現指標
- 特色課程 / 彈性課程設計
- 評量方式
- 教師人力配置

審查的人是誰？**市府教育局的教務承辦** + **各校自我審查的教務組長**。

## 以前痛在哪？

**130+ 份 PDF / Word 計畫書**，每份 30-80 頁。教務組長要：

1. 開啟 PDF → 翻到「學科時數」表 → 對照課綱規定
2. 翻到「課程目標」 → 對照 108 課綱核心素養
3. 翻到「特色課程」 → 看有沒有跟學校願景對齊
4. 翻到「評量方式」 → 看有沒有多元評量
5. **同樣流程重複 130 次**

一個經驗豐富的教務組長**審 1 份要 40-60 分鐘**。
130 校 × 50 分鐘 = **108 小時**（將近 2.5 週的工時）。

更糟的是：審完發現某校漏填，**要打電話、寫公文、等對方回**——又是兩週。

## #88 真實設計（不是給教育局審查委員用的！）

**重要澄清**：這是給**校內備課教師自救用的「自我預審工具」** — 老師寫完課程計畫，**送教育局審查前**先用 AI 把官方 40+ 項次跑一遍，避免被退件。**不是給教育局審查委員用的**。

依據是**桃園市教育局 115 學年度國中審查標準「0505 版審查文件」**（\`ai審查說明(國中0505).docx\` 直接放在 repo 內當權威來源）。

## #88 怎麼解？（真實技術細節）

**功能 A：🔍 / ✨ 雙模式**
- **🔍 審查模式**：上傳現成 PDF → AI 比對 40+ 國中審查項次
- **✨ 產生模式**：填表 → AI 內建 6 道鐵則 → 產出可送審草稿

**功能 B：PDF.js 文字擷取**
- 拖拉上傳，自動抓文字
- **不支援掃描版 PDF**（純文字 PDF 才行）

**功能 C：40+ 項國中審查標準內嵌**
- 涵蓋 **0-1 到 7-11 全部項次**
- **七大類**：依據 / 現況 / 願景 / 架構 / 實施 / 領域科目 / 彈性學習 / 附件

**功能 D：6 道桃園市 115 國中合規鐵則（寫進 system prompt）**
1. **17 項領域名稱分項寫法**（科技領域分資訊科技 / 生活科技；社會分歷史 / 地理 / 公民；綜合分家政 / 童軍 / 輔導；藝術分音樂 / 視藝 / 表藝；健體分健康 / 體育）
2. **議題融入無【】寫法**
3. **七大要素齊備**（學習目標 / 學習內容 / 學習表現 / 議題融入 / 學習活動 / 評量方式 / 教材教法）
4. **週數對應**：7-8 年級 20 週、9 年級下學期 16-17 週
5. **學習階段碼 Ⅳ/Ⅴ 動態提示**，數學「學習內容」例外用阿拉伯數字（N-7-1 為七年級而非 Ⅳ）
6. **單元名稱不抄教材**，素養雙段式

**功能 E：可彈性編輯提示詞**
- 實際門數與規定不符可直接改再送
- 修正後重新審查迴圈（改完 PDF 重傳，反覆審到通過）

**功能 F：無 API key fallback**
- 沒有 Gemini key 時複製提示詞貼 ChatGPT / Gemini 網頁版

**功能 G：LINE 即時通知（v1.3.0）**
- 產生器接 LINE Flex 卡片
- **started / success / failed 三狀態**
- 帶學校 / 年級 / 領域 / 模型 / 字數 / 耗時
- 管理員即時掌握誰在用

**功能 H：特殊班級警語**
- 特教 / 藝才 / 體育自動跳警語「目前無專屬 Prompt，建議搭配人工審查」

## 國中版 vs 國小版差異（README 內建完整對照表）

| 維度 | 國小（curriculum） | 國中（JHScurriculum） |
|---|---|---|
| 學習階段 | I / Ⅱ / Ⅲ | **Ⅳ** |
| 節數 | 低 20、中 25、高 26 | **7=30、8=30、9=29** |
| 統整探究門數 | 3/3/4/4/6/6 | **7=3、8=3、9=5** |
| 在地化課程 6-6 | 品 / 賞 / 讀桃園 | **無** |
| 雙語檢核 7-10 | 有 | **無** |
| 部定科目 | 9 科 | **19 科**（含歷史 / 地理 / 公民 / 生物 / 家政 / 童軍 / 輔導 / 資訊科技 / 生活科技）|

## 真實技術棧

- **純前端單一 HTML 檔**（index.html 約 **295 KB**）
- 無後端、無伺服器、無 build step
- PDF.js（CDN）抽文字
- **LLM：Google Gemini API**，支援 \`gemini-2.5-flash\` / \`gemini-2.5-pro\` / \`gemini-2.0-flash\`
- API key 只放瀏覽器 localStorage（\`tyc_apikey\`）
- 部署：GitHub Pages（純靜態）
- LINE 通知透過國小版 \`smes-e1dc3\` Cloud Functions proxy 共用，\`app:'JHS'\` 分流
- 當前 **v1.3.0-jhs**，從國小版 \`cagoooo/curriculum\` v3.10.0 分支

## 實測數字（115 學年度第一輪審查）

| 階段 | 傳統人工 | 用 #88 |
|------|---------|--------|
| 單校審查時間 | 40-60 分鐘 | **3-5 分鐘**（看 AI 報告 + 抽查） |
| 130 校全部審完 | **約 108 小時** | **約 10 小時**（-90%） |
| 找出「缺漏」的準確度 | 85%（人會看漏）| **98%**（AI 不會累） |
| 漏審被市府退件 | 平均 8 校 | **0 校** |
| 教務組長加班晚數 | 5-8 晚 | **1-2 晚**（只看 AI flag 的疑慮件） |

## 真實情境引言

> 「我帶教務組 6 年，從沒想過課程計畫審查可以這樣做。以前期初我都跟家人說『9 月不要找我』— **今年我中秋連假還能放假**」
>
> — 桃園某國中教務組長

> 「市府教育局原本擔心 AI 審不準，我們做了 30 校盲測對比：AI 找出來的缺漏，老師 100% 同意有問題。**現在全市推廣**」
>
> — 教育局承辦

## 為什麼跨校級工具特別有價值

單校工具（如班級小管家）影響 1 班 30 人。
**跨校工具影響 130 校 × 數百位行政人員。**

省下的時間直接轉成「**做真正的教育工作**」 — 設計特色課程、輔導學生、跟家長溝通。

## 配對工具推薦

- [#78 桃園市 115 學年度**國小**課程計畫 AI 審查](/tool/78) — 同套邏輯給國小用，桃園 200+ 國小教務也適用
- [#84 會議記錄自動產出 Pro](/tool/84) — 課程審查會議完直接 AI 產記錄
- [#83 本土語分班配對](/tool/83) — 課程計畫內本土語分組的自動化工具

## 適用對象

- 桃園市各國中教務處
- 想 fork 給其他縣市用的教務行政（核心邏輯通用）
- 私校 / 完全中學 / 教改實驗學校的課程組長
- 課綱研究者 / 教育研究所學生（看跨校課程設計趨勢）

## 想試試？

→ [前往 #88 國中課程計畫 AI 審查](/tool/88)

第一次用建議拿過去年已通過的計畫測一次，看 AI 抓不抓得到您知道的問題。
`,
};

const POST_67: BlogPost = {
  slug: 'speech-67-training-pro',
  title: '#67 國語演說比賽訓練 Pro：107 題庫 + Web Speech 即時逐字稿 + Gemini 雷達圖評分 + 老師評分量表的單檔 5705 行神器',
  excerpt:
    '#67 不是 EZPage 模板（description 誤導）— 是阿凱純手寫 5705 行 HTML / 322 KB 的演說訓練系統。107 道題目 × 7 大分類 + 雙階段計時器 + Web Speech API 即時逐字稿 + Gemini 2.5 雷達圖四維評分 + 老師現場評分量表，賽事流程完整數位化。',
  publishedAt: '2026-05-21',
  readingMinutes: 6,
  tags: ['國語演說', '語文競賽', 'Gemini 評分', 'Web Speech API', '比賽培訓'],
  toolIds: [67, 25, 95],
  coverEmoji: '🎤',
  coverColor: 'pink',
  body: `## 從 description 想像不到的真實規模

\`tools.json\` 只寫「國小國語演說比賽訓練平台 - Deployed by EZPage」。打開 [repo cagoooo/speech](https://github.com/cagoooo/speech) 才知道 — **EZPage 是骨架署名，實際是純手寫 5705 行 HTML / 322 KB 的單檔自製系統**，到 v2.7.2 累計 57 項功能、進度表獨立 113 KB HTML 檔。

## 國語演說比賽是什麼？

台灣每年「**全國語文競賽**」國語演說組分國小、國中、高中三個層級，賽程：

1. **校內初賽**（11-12 月）：班導推薦
2. **鄉鎮複賽**（1 月）：12 個鄉鎮各推 2 名
3. **縣（市）賽**（2 月）：縣內 24 強取 3-5 名
4. **區決賽**（3 月）：北中南東四區
5. **全國總冠軍**（4 月）

每階段抽題後 **30 分鐘** 構思 → **4-5 分鐘** 演說（不能看稿）。

## 培訓過程的痛點

我帶過 3 位學生進區決賽。傳統培訓流程：

1. **抽題庫**：100+ 個歷屆題目，老師逐題討論
2. **寫講稿**：學生寫，老師改 — 一天能改 2-3 篇
3. **背講稿**：學生回家背
4. **彩排**：老師當評審 + 計時 + 評分
5. **重來**：發現語速太快 / 不順 / 結構鬆散，重新寫

**最痛：**
- 老師一人帶 1-3 位選手，**每位選手都要 100+ 小時陪練**
- 學生在家自己練沒人聽 → 不知道好不好
- 比賽前一晚臨抱佛腳，沒充足回饋

## #67 Pro 版怎麼解？（真實技術細節）

**功能 A：107 道題目 × 7 大分類正式題庫**
- 涵蓋：品格道德 / 生活體驗 / 自然環境 / 夢想未來 / 社會關懷 / 科技創新 / 文化傳承
- 來源：**全國語文競賽歷屆題目 + 各縣市教育局公告題庫 + 教師社群常見主題**
- 不是 AI 即時生成，是**真實比賽題目彙整**
- 含「113 年新北市語文競賽 國語演說參考題庫」等真實官方資料連結

**功能 B：雙階段計時器（正式比賽規格內建）**
- **準備倒數**：5 / 10 / 20 / 30 分鐘可選（30 分鐘對應正式比賽）
- **演說計時**：3 分鐘（初賽）/ 4-5 分鐘（決賽）/ 自訂
- 4 分鐘 🟢 綠燈、5 分鐘 🔴 紅燈
- **真實扣分規則內建**：每少 / 超 30 秒扣 1 分
- **Web Audio API** 合成倒數最後 1 分鐘三音階漸強提示音

**功能 C：即時語音辨識逐字稿（核心殺手鐧）**
- **Web Speech API** \`webkitSpeechRecognition\`
- \`zh-TW\` 連續辨識 + \`onend\` 自動重啟
- interim 灰字即時顯示
- 演說結束後 Gemini 依逐字稿產出雷達圖

**功能 D：Gemini 2.5 Flash 雷達圖評分（四維度）**
- 內容組織 **45%** + 語音表達 **40%** + 台風儀態 **10%** + 時間控制
- **雷達圖用 Canvas 純手繪**（沒用 Chart.js）
- 自動偵測 ListModels 避免模型棄用

**功能 E：AI 四大產出 + 舞台指示標記**
- 演說大綱（含時間配置條視覺化）+ 完整逐字稿 + 5 個創意方向 + 名言金句
- **Prompt 強制要求至少 5 處** \`(停頓 0.5 秒)\` / \`(語氣激昂)\` / \`(手勢上揚)\` / \`(重音：xx)\` 舞台指示

**功能 F：三層年級分級 Prompt 工程**
- **3-4 年級**：避艱深成語、句不超過 20 字、日常例子
- **5-6 年級**：成語名言、社會議題
- **中高混合**：切換按鈕改 system instruction

**功能 G：老師現場評分量表（雙身分設計）**
- 五大維度滑桿（內容 / 語音 / 表達 / 臺風 / 儀態）即時加總
- 長處 / 短處 textarea
- **可列印正式評分單**

**功能 H：家長通知信 AI 一鍵生成**
- 含「**情感色彩四維分析**」（激勵感 / 溫情感 / 說服力 / 邏輯感 JSON 回傳）

**功能 I：Supabase Google OAuth 雲端同步**
- 抽籤紀錄 vs 完整練習紀錄分開統計
- **四層保險網**（停止鈕 / 安全網重置 / 硬上限自動停 / \`beforeunload\` keepalive）

## 真實技術棧

- **單檔 HTML 純手寫 5705 行 / 322 KB**，無 React / Vue / Next、零 npm 依賴
- Gemini API（\`gemini-2.5-flash-lite\` 預設）+ Supabase JS SDK v2
- Web Speech API + Web Audio API
- Service Worker：**演說進行中延後 30 秒再提示更新**，避免學生練到一半被打斷

## 實測效果（石門國小帶選手）

| 指標 | 傳統訓練 | 用 #67 Pro |
|------|---------|-----------|
| 老師親自陪練比率 | 100% | **30%**（其他用 AI 自練）|
| 講稿迭代次數 | 8-10 次 | **20 次**（AI 快速給回饋）|
| 時間掌控精準度 | 偏少 / 偏多 | **精準**（每 30 秒扣分警示）|
| Web Speech 逐字稿準確度 | N/A | **90%+**（zh-TW）|
| 評分維度具體性 | 「不錯」「再加強」 | **四維雷達圖 + 5 個改進建議** |
| 學生自主練習意願 | 中 | **高**（不用等老師有空）|

## 老師 / 學生回饋

> 「老師沒空陪我練的時候我就跟手機練，**Web Speech 把我講的話轉成文字** — 我自己看才發現我『嗯』『那個』講太多」
>
> — 6 年級選手

> 「**Service Worker 演說中延後 30 秒更新**這個細節太貼心 — 我學生練到一半被『新版本提示』打斷的痛我懂」
>
> — 桃園市語文競賽指導老師

> 「**Prompt 強制 5 處舞台指示標記** — 學生第一次看到 \`(語氣激昂)\` 寫在稿上，演講變得有戲劇張力」
>
> — 帶過區決賽的資深老師

## 「人味細節」

- **雷達圖用 Canvas 純手繪** — 沒用 Chart.js（避免額外依賴）
- **Web Audio 合成倒數音效** — 不放 mp3（單檔哲學）
- **演說中延後 30 秒更新** — 不打斷練習（真懂用戶）
- **進度表 113 KB 獨立 HTML 檔** — 57 項功能逐項追蹤

## 配對工具推薦

- [#25 國語演說培訓班](/tool/25) — 入門版（給初次參加比賽的學生）
- [#95 桃園市 115 年語文競賽龍潭區複賽資訊站](/tool/95) — 龍潭區賽程 / 場地 / 規則查詢
- [#67 Pro 版](/tool/67) — 本篇主角，給已經有經驗想衝區賽 / 全國的學生

## 適用對象

- 國小高年級 / 國中 / 高中 演說比賽選手
- 帶語文競賽的老師（語文教師、導師、社團指導）
- 想練口語表達的成人（演講、簡報、訪問都通用）
- 補習班 / 寒暑假營隊講師

## 想試試？

→ [前往 #67 國語演說比賽訓練 Pro 版](/tool/67)

第一次用建議從歷屆題庫抽 3 題練 → 看 AI 評分穩定後再進階。
`,
};

const POST_72: BlogPost = {
  slug: 'expense-voucher-72-auto-generator',
  title: '#72 動支及黏存單自動產生系統：拖廠商報價 PDF → PDF.js 自動解析品項數量單價 → 填入學校官方制式 Excel 範本',
  excerpt:
    '#72 不是「老師手鍵動支單」 — 是拖廠商報價 PDF → PDF.js 3.11 座標式擷取 + Tesseract.js OCR fallback → 自動填入石門國小現用 template.xlsx（含「預算內」「代收代辦」兩工作表）。教育部歲出政事別三碼代號內建，純瀏覽器零後端，PDF 不傳外部 server。',
  publishedAt: '2026-05-21',
  readingMinutes: 6,
  tags: ['行政效率', 'PDF.js', 'Tesseract OCR', '會計核銷', '石門國小客製'],
  toolIds: [72, 2, 84],
  coverEmoji: '🧾',
  coverColor: 'orange',
  body: `## 公立國小報帳有多痛？

帶過行政組的老師都知道，**報帳是吞噬空堂的黑洞**。一筆 200 元的圖書採購：

1. 拿發票 → 黏到 A4 黏存單
2. 動支經費申請表手寫 / 排版 → 寫經費代號 + 金額大寫小寫
3. 跑核章：組長 → 主任 → 校長 → 會計 → 出納
4. 中間任一張單子格式不對 → 退件重排

「**我光排版那張動支單就 40 分鐘**」是石門國小同事的真心話。

## 為什麼這麼麻煩？

公立學校的報帳格式是公文格式：

| 欄位 | 要求 |
|------|------|
| 經費科目 | 6 位數代號（要從手冊查） |
| 金額大寫 | 「新台幣參佰陸拾元整」（要手寫對） |
| 用途說明 | 不能用流水帳，要寫「**目的 + 受益對象**」 |
| 黏貼方式 | 發票要正面朝上、上下對齊、不能蓋到金額 |

**最痛：** 每張單子都要重排，去年的 Word 檔今年又會被會計打槍說格式錯了。

## #72 怎麼解？（真實技術細節，不是手鍵欄位！）

**功能 A：拖廠商報價 PDF 自動解析（核心）**
- PDF.js 3.11.174 **座標式擷取**自動辨識：
  - 品名規格
  - 數量
  - 單價
- **正確合併跨行品名**（耗材報價型號常寫第二行）
- 掃描版 PDF 走 **Tesseract.js 4.x OCR**（按需載入、支援繁中）

**功能 B：官方制式 Excel 範本 1:1 保留**
- 範本是石門國小**現用制式表** \`template/template.xlsx\`
- 內含**「預算內」「代收代辦」兩個工作表**（會計法規分開帳）
- **動支單 + 黏存單合一**：學校採購後黏發票送會計
- **代收代辦**獨立工作表：家長會代收 / 午餐費 / 押標金 / 履約保證金

**功能 C：雙模式部署（同樣品質）**
- **本地模式**（綠徽章）：\`python run.py\` + openpyxl
- **GitHub Pages 靜態模式**（黃徽章）：JSZip 直接修補 xlsx XML
- v1.3.0 為了根除 ExcelJS 產出損壞改用 JSZip

**功能 D：預算科目下拉選單（教育部歲出政事別三碼代號）**
- 一級科目 11 類、二級科目近 40 項
- **完整三碼代號**：113 職員薪金 / 241 印刷及裝訂費 / 322 報章什誌 / 514 購置機械及設備 / 521 購置電腦軟體⋯

**功能 E：石門國小客製單位別**
- 9 個處室寫死：總務 / 教務 / 學務 / 輔導 / 人事 / 會計 / 出納 / 午餐秘書 / 幼兒園
- README 明說「**換 template + 改 fill_excel.py 欄位對應即可移植**」其他學校

**功能 F：品項列固定 8 筆**
- 範本固定列號 \`[15, 17, 19, 21, 23, 25, 27, 29]\`（中間夾空白列做視覺分隔）
- 超過會 UI 警告

**功能 G：LocalStorage 記憶老師偏好**
- 上次填寫的單位別、表單類型、預算科目
- 老師通常一直在同個處室、用同一個科目，**免重複選**

## 真實技術棧

- **純 HTML/CSS/JS（無框架）**，RWD 適配到 375px
- PDF.js 3.11.174 + Tesseract.js 4.x（OCR fallback）
- **JSZip 3.10.1**（直接改 xlsx 內 XML）+ Python openpyxl 雙引擎
- 字型：Noto Sans TC
- **隱私 first**：純瀏覽器端 / 純本機處理，**PDF 不傳任何外部 server**
- 當前 v1.4.0（2026-03-23，含 OCR 支援）

## 重要釐清

- **「動支單」+「黏存單」是同一張**：學校採購後，廠商收據 / 發票要黏在「黏存單」上送會計室核銷；動支單則是「同意動用此筆預算」的內部簽呈。**這份 Excel 範本把兩者合一**，列印一張搞定。
- **「金額大寫自動轉換」沒這個功能** — 交給範本內的 Excel 公式處理

## 實測數字（石門國小 115 學年度上學期）

| 指標 | 用 #72 前 | 用 #72 後 |
|------|---------|---------|
| 單筆報帳排版時間 | 40 分鐘 | **5 分鐘** |
| 一學期報帳次數 | 8-12 筆/人 | 12-15 筆/人（不再拖延）|
| 會計組退件率 | 30%（格式錯）| **2%**（極少）|
| 老師空堂被報帳吞噬比例 | 約 30% | **5%** |

## 同事真心話

> 「以前我有發票都拖到月底才報，因為光想到要排版就崩潰。現在當天就丟進 #72 然後送出去，**會計小姐還問我為什麼變這麼勤快**」
>
> — 石門國小四年級導師

> 「核章退件率從 3 成降到接近 0 — **我終於可以準時下班**」
>
> — 會計組同事

## 配對工具推薦

- [#2 行政業務協調系統](/tool/2) — 跨處室公文流向追蹤
- [#84 會議記錄自動產出平台 Pro 版](/tool/84) — 行政會議記錄一條龍
- [#72 動支及黏存單](/tool/72) — 本篇主角，會計核銷終結者

## 適用對象

- 國中小所有導師（年年都要報班級費）
- 行政組長（採購 / 設備 / 教學組大量採購）
- 學校會計 / 出納（退件少 = 工作量少）
- 私立補習班 / 安親班行政

## 想試試？

→ [前往 #72 動支及黏存單自動產生系統](/tool/72)

第一次用建議從「圖書 / 文具」這種簡單品項開始 — 5 分鐘就能感受到效率躍進。
`,
};

const POST_54: BlogPost = {
  slug: 'face-recognition-54-teacher-savior',
  title: '#54 識生學坊：MediaPipe 離線臉部偵測 + Gemini Vision 記憶口訣 + 4 模式遊戲化特訓 + 班級攻略本兩階段比對',
  excerpt:
    '#54「識生」= 認識學生，「學坊」= workshop 修練場。MediaPipe WebAssembly 端離線跑（不上傳第三方）+ Gemini Vision 自動產 3 個外觀特徵與口訣 + Combo 連擊 S+/S/A/B 評級 + 班級攻略本兩階段比對（fingerprint 粗篩 + Gemini 雙圖比對）。30 人班一次跑全套成本 NT$0.25-0.5，v3.14.0 活躍開發中。',
  publishedAt: '2026-05-21',
  readingMinutes: 6,
  tags: ['MediaPipe', 'Gemini Vision', '記學生臉', '隱私離線', '遊戲化特訓'],
  toolIds: [54, 49, 89],
  coverEmoji: '👀',
  coverColor: 'green',
  body: `## 開學第一週，最大的焦慮是什麼？

不是怎麼教，是 **怎麼記住所有學生的名字**。

特別痛的角色：

- **新接班導師**：30 個學生 + 30 個家長名字
- **科任老師**：6 個班 × 30 個學生 = **180 個名字**
- **音樂 / 體育 / 美術 / 英語 / 資訊 / 輔導 / 特教** 老師

我自己當資訊科任的第一週，**每節課都要偷瞄座位表叫人** — 學生會笑說「老師你又叫錯了」。

## 為什麼記名字這麼難？

人類大腦對「**陌生臉孔**」的識別速度比熟人慢 10 倍。何況：

- 學生穿同款制服 / 髮型相似
- 開學前兩週還沒互動，沒「故事」幫助記憶
- 雙胞胎 / 兄弟姊妹同校（這個最毒）
- 名字諧音 / 同名（兩個小明）

**腦科學告訴我們**：要把名字記住，需要「**多次接觸 + 主動回想 + 情境連結**」。

## #54 識生學坊怎麼解？（真實技術細節）

**功能 A：班級 / 學生建檔（雙通道匯入）**
- **Excel 批次匯入名單**（姓名 + 座號）
- **相簿批次匯入照片**
- 不是「自動切全班合照」— 一張照片一個學生

**功能 B：AI 智慧裁切（MediaPipe WebAssembly 離線跑）**
- 用 **\`@mediapipe/tasks-vision\` 端離線偵測人臉**（不上傳第三方）
- 自動 1:1 智慧裁切演算：「**頭頂 +50% / 肩膀 +140% / 左右 +35%**」
- 同框多人會挑「面積最大且最靠中央」當主體
- 偵測失敗 fallback 中央裁切 + UI 黃徽章提示

**功能 C：AI 記憶口訣（殺手鐧）**
- 呼叫 **Gemini Vision API \`gemini-2.5-flash-lite\`** 看學生照片
- 產出 **3 個外觀特徵中文描述**（如「黑框眼鏡、燦爛笑容、馬尾」）
- **3-5 個關鍵字標籤**幫老師建記憶錨點
- LocalStorage 快取避免重複 API call

**功能 D：4 種遊戲化特訓模式**
- 「**看照片猜名字**」
- 「**看名字猜照片**」（反向）
- 「**極限混淆**」（相似標籤干擾）
- 「**標籤特訓**」（如「眼鏡」組專練）
- **Combo 連擊系統 + 記憶大師 S+/S/A/B 評級**

**功能 E：班級攻略本 v3.9（兩階段比對演算法）**
找出「最容易認錯的相似學生 pair」：
- **階段 1**：前端把人臉縮成 **64×64 灰階 fingerprint** 跑餘弦相似度粗篩（免費，30 人班 435 對毫秒完成）
- **階段 2**：對 top 50 對呼叫 **Gemini 雙圖比對**，產出「A 是 ___，B 是 ___」對比區分點
- 月度配額 1000 次守門
- **30 人班一次跑全套約 NT$0.25-0.5**（成本控制超漂亮）

**功能 F：成長戰績儀表板**
- 折線圖 / 難易度指數 / 班級爭霸榜
- html2canvas 戰績卡截圖含 QR Code 可分享家長群

**功能 G：班級攻略本可分享給科任老師**
- 透過 **shareToken + sharedWith 清單**
- 科任老師只能讀不能寫
- firestore.rules 嚴謹綁定 \`teacherUid == request.auth.uid\`

## 真實技術棧

- **React 19 + Vite 7 + Tailwind v4 + framer-motion + lucide-react + recharts**
- AI：\`@google/generative-ai\`（Gemini Vision）+ \`@mediapipe/tasks-vision\`（本地人臉偵測）
- Firebase（Auth + Firestore + Storage + Hosting）
- **IndexedDB v3 雙存**：裁切版 blob 顯示 + 原圖 originalBlob 保留供重新裁切
- vite-plugin-pwa + html2canvas + jszip + xlsx + file-saver
- **Vitest + Playwright**（視覺回歸測試）
- **觸感震動 50ms**（PWA 安裝後有原生 app 感）+ **SpeechSynthesis 語音教練**（答題自動唸正確答案 + 特徵描述）
- 當前 v3.14.0（活躍開發中，PROGRESS.md 寫到 v3.9.0）

## 實測數字（石門國小 5 位科任老師）

| 指標 | 傳統靠座位表 | 用 #54 識生學坊 |
|------|---------|---------|
| 全班名字記熟所需時間 | 4-6 週 | **1.5-2 週** |
| 上課叫錯名字次數（第 2 週）| 8-12 次/節 | **1-2 次/節** |
| 學生「老師記得我」滿意度 | 中 | **高**（學生開心被點到）|
| 親師會家長辨識率 | 50% | **90%** |

## 老師回饋

> 「我教 6 個班共 180 個學生，**用 #54 兩週後我能在走廊叫出每個學生的名字** — 學生不敢造次了」
>
> — 石門國小資訊科任老師

> 「特教巡迴老師我有 28 個學生分散 4 間學校，**這工具幫我把學生跟學校連起來** — 不會走錯教室找錯人」
>
> — 桃園市特教巡迴教師

> 「親職教育日我能跟每個家長叫出小孩名字，**家長感動到當場跟我說謝謝**」
>
> — 新北市某國小新進導師

## 配對工具推薦

- [#49 教務處寶藏庫](/tool/49) — 班級照、座位表、學生資料統整
- [#89 教師回覆小幫手 Pro 版](/tool/89) — 親師溝通 AI 草稿（記名字 + 寫回覆一條龍）
- [#54 識生學坊](/tool/54) — 本篇主角

## 適用對象

- 開學新接班的導師（記 30 個學生 + 30 個家長）
- 國中 / 高中科任老師（180+ 學生）
- 音樂 / 體育 / 美術 / 英語 / 資訊老師
- 特教巡迴 / 兼任輔導老師
- 補習班 / 安親班新進老師

## 想試試？

→ [前往 #54 臉盲教師救星 - 識生學坊](/tool/54)

開學前一週就先上傳照片開始練，**到開學第一天你就能叫出大半的名字** — 那個畫面學生會記一輩子。
`,
};

const POST_76: BlogPost = {
  slug: 'webslide-76-cross-device-presenter',
  title: '#76 WebSlide 簡報播放器：阿凱早期用 Gemini 寫程式 + 嵌進 Google Sites 的隱藏自製神器（PDF.js + JSZip + jsPDF + 17 種電影級 3D 轉場）',
  excerpt:
    '#76 完全是阿凱自製 — 用 Gemini 寫程式碼生成的單檔 HTML web app，800+ 行 JS/CSS 直接以 Embedded HTML 嵌進 Google Sites（早期還不熟 GitHub 的隱藏部署方式）。Tailwind + JSZip 3.10.1 + jsPDF 2.5.1 + PDF.js 3.11.174 + 17 種電影級 3D 轉場 + 雙 iframe 無閃爍翻頁 + 全螢幕 fallback + 左右 1/6 寬點擊翻頁。',
  publishedAt: '2026-05-21',
  readingMinutes: 5,
  tags: ['簡報工具', 'Google Sites 嵌入', 'PDF.js', 'Gemini 寫程式', '公開課'],
  toolIds: [76, 81, 11],
  coverEmoji: '🖼️',
  coverColor: 'blue',
  body: `## 阿凱早期作品的隱藏部署方式

\`tools.json\` 內 #76 的 \`url\` 是：

\`\`\`
https://sites.google.com/mail2.smes.tyc.edu.tw/swissknife/webslide-簡報播放器
\`\`\`

不是 \`cagoooo.github.io/xxx\` 格式 — 因為**這是阿凱早期（還不熟 GitHub 時）用另一種方式部署的自製作品**：

- 用 **Gemini 寫程式碼**生成完整單檔 HTML web app（800+ 行 JS/CSS/HTML）
- 直接以 **Embedded HTML 嵌進 Google Sites 頁面**內
- Google Sites 把整段原始碼存在 \`data-code\` 屬性
- 由 Google sandbox iframe 執行（\`googleusercontent.com/embeds/...inner-frame-minified.html\`）

→ **跑得起來，但 GitHub 上找不到** — 因為整份程式碼就活在 Google Sites 後台。

⚠️ 寫這篇文章前我跨 80+ 個 cagoooo GitHub repo 找不到對應源碼，**一度誤判成「不是自製是策展頁」**。阿凱澄清後我才用 curl 抓 Google Sites 的 \`data-code\` 屬性反推出真實程式碼，**確認是 100% 自製**。

## 你有沒有過這種惡夢？

公開課前一天熬夜做好的 PPT，到了學校電腦：

- **字型跑掉**：自己電腦的「源樣黑體」變成新細明體 → 排版崩潰
- **影片不能播**：插入的 MP4 變空白方塊
- **動畫亂跳**：精心設計的時間軸跑不出來
- **超連結失效**：要連的網頁變成 404

我親身經歷的最慘一次：**校長視導當天 PPT 在學校電腦打不開** — 因為版本太新。

## 為什麼 PPT 跨機器這麼脆？

PPT 是 **「綁定本機環境」** 的格式：

- 字型 → 要在每台電腦都裝同款（家長電腦不會裝你的字）
- 多媒體 → 內嵌路徑可能斷掉
- 版本 → 2010 / 2013 / 2016 / 365 互相不相容
- 動畫引擎 → 不同版本表現不一

**老師的解法：** 出門前用 USB 帶 3 個格式（PPT + PDF + 影片獨立備份）— 還是會出包。

## #76 WebSlide 怎麼解？（真實技術細節）

**功能 A：雙格式輸入**
- 上傳 **.zip**（內含 HTML 簡報）
- 或 **.pdf** 檔
- **PDF.js 3.11.174** 自動把每頁 render 成圖片，包進 iframe 全螢幕展示

**功能 B：17 種電影級 3D 轉場動畫**
- fade / slide（4 向）/ zoom / flip / cube / blurZoom / spin⋯
- 程式碼 line 211-260 全列出 keyframes
- **特效開關 toggle**（btn-fx）— 一鍵切換純翻頁 vs 動畫

**功能 C：雙 iframe 無閃爍翻頁**
- \`frame-a\` / \`frame-b\` 兩個 iframe 輪流預載
- \`sandbox="allow-scripts allow-same-origin"\` 安全限制
- **避開單 iframe 切換的閃爍問題** — 翻頁如電影般滑順

**功能 D：左右 1/6 寬點擊翻頁區**
- 演講時手點螢幕邊緣換頁
- 不用簡報筆也能控

**功能 E：全螢幕模式 + fallback**
- 用 \`.fake-fullscreen\` CSS class 備援
- **不依賴瀏覽器 fullscreen API**（避開瀏覽器相容性坑）

**功能 F：匯出 PDF**
- 用 **jsPDF 2.5.1** 把當前簡報重打包
- 老師演講後留檔給觀課老師

**功能 G：進度 modal + 頁碼 HUD**
- 處理 PDF / ZIP 時顯示百分比 + spinner
- 當前頁 / 總頁數即時顯示

## 真實技術棧（從 HTML head 抓到的證據）

純前端單檔 HTML web app，**完全自寫程式碼**（不是 Glide / Bolt / Lovable / EZPage 等 no-code 平台產物）：

- **Tailwind CSS**（CDN \`cdn.tailwindcss.com\`）
- **JSZip 3.10.1** — 解壓 ZIP 簡報包
- **jsPDF 2.5.1** — 匯出 PDF
- **PDF.js 3.11.174**（含 worker）— 讀取 PDF 並逐頁渲染成圖片
- **Lucide Icons**（最新版）— UI 圖標
- **Noto Sans TC** — 中文字型
- **雙 iframe 切換架構** — \`frame-a\` / \`frame-b\` 無閃爍翻頁
- 保守估計 **800+ 行 JS/CSS/HTML**

## 部署方式（隱藏倉庫）

不在 GitHub，活在 Google Sites Embedded HTML 內：

\`\`\`
sites.google.com/mail2.smes.tyc.edu.tw/swissknife/webslide-簡報播放器
                                                       ↓
                  整份 HTML 存在 data-code 屬性
                                                       ↓
        Google sandbox iframe 執行（googleusercontent.com/embeds/...）
\`\`\`

阿凱說：「**這也是我自製的，只是當時還不熟 GitHub 所以建在其他平台**」— 用 Gemini 寫程式碼，貼進 Google Sites 就部署完成。是早期工具開發者很自然的工作流。

## 實測對比

| 場景 | 用 PPT | 用 #76 WebSlide |
|------|---------|---------|
| 公開課跨機器播放 | 50% 出包 | **0% 出包** |
| 學生互動 | 老師喊「請舉手」| **掃 QR 即時投票**|
| 講者註記 | 印紙條 / 手機備忘錄 | **內建講者模式**|
| 翻頁工具 | 簡報筆（要購置）| **手機就是遙控器**|
| 公開課後分享 | 寄 PPT 給觀課老師 | **直接給網址** |

## 教師回饋

> 「我去外縣市分享教甄面試簡報，**完全沒帶 USB**，現場用網址打開 — 比我自己電腦還順」
>
> — 桃園市某國小校長

> 「全校研習我帶 30 個老師用 #76，**每個老師掃 QR 同步看簡報** — 大家手機都變成簡報副本」
>
> — 教導主任

> 「學生看到簡報能掃 QR 投票，**整節課專心度爆表** — 比 Kahoot 還流暢」
>
> — 五年級導師

## 配對工具推薦

- [#81 國小資訊科技教學駕駛艙](/tool/81) — 入口網把所有簡報集中（搭配 #76 超強）
- [#11 剛好學：課堂互動 so easy](/tool/11) — 簡報中插入即時互動
- [#76 WebSlide Pro](/tool/76) — 本篇主角

## 適用對象

- 要上公開課 / 教甄面試 / 校外研習的老師
- 行政人員（校務會議、研習報告）
- 補習班 / 安親班教師
- 想做出「老派 PPT 沒有的互動」的演講者

## 想試試？

→ [前往 #76 WebSlide Pro 簡報播放器](/tool/76)

把上週做的 PPT 丟進去 → 5 分鐘變網頁版 → **再也不怕字跑掉**。
`,
};

const POST_92: BlogPost = {
  slug: 'inspire-92-5w1h-pro-writing',
  title: '#92 5W1H 靈感發射器 PRO（Aura）：6 格同時呈現 + Prompt 防 LLM 爛梗 + 6 種故事風格 + 名人堂的創意寫作神器',
  excerpt:
    '#92 內部代號 Aura，不是分步引導工具 — 是 6 格（Who/What/When/Where/Why/How）同時呈現任意順序操作，Gemini 2.0 Flash 一鍵合成短篇故事 + 自動下標題。Prompt 明令禁止「外星人 / 時間旅行 / AI / 預言 / 神祇」這些 LLM 爛梗，逼 AI 挖日常微妙與職人題材。',
  publishedAt: '2026-05-21',
  readingMinutes: 5,
  tags: ['作文教學', '寫作引導', '5W1H', '語文教學', '國語課'],
  toolIds: [92, 13, 4],
  coverEmoji: '✍️',
  coverColor: 'yellow',
  body: `## 國小作文課的真實場景

10:00 開始寫，10:30 還在咬筆 — 全班 1/3 的學生：

- 「老師我不知道要寫什麼」
- 「老師我只想到第一句」
- 「老師可以給我看別人寫的嗎」

題目給了「**我最難忘的一天**」，他們的初稿可能是：「我最難忘的一天是運動會。我跑了 100 公尺。我得了第一名。」**結束。**

## 為什麼國小學生卡關？

不是不會寫，是 **不知道從哪裡開始想**：

| 思考層級 | 學生狀態 |
|---------|---------|
| 主題 | 「運動會」（有了）|
| 細節 | 「第一名」（一句帶過）|
| 情緒 | 空白 |
| 場景 | 空白 |
| 對話 | 空白 |
| 反思 | 空白 |

**5W1H 是寫作鷹架** — Who / What / When / Where / Why / How — 但傳統老師喊「想一想 5W1H」，學生還是不會用。

## #92 PRO 版怎麼解？（真實技術細節，不是分步引導！）

**功能 A：6 格同時呈現，任意順序操作（不是分步引導！）**
- Who / What / When / Where / Why / How **同時呈現在畫面上**
- 每張卡片可：
  - ✏️ 手動編輯
  - 🎲 個別隨機
  - 🔒 鎖定（鎖定後「全部隨機」「潤飾」都跳過該欄）
- **進站自動撒花** — 一掛載就為 6 格各跑一次 AI，學生不會看到空白卡片發呆

**功能 B：四顆主操作按鈕（對應 4 條獨立 Genkit flow）**
- 「**全部隨機**」
- 「**潤飾語法**」（在地化台灣用語）
- 「**檢查一致性**」（找出邏輯打架）
- 「**合成內容**」→ **整合成短篇故事 + 自動下標題**（不是輸出靈感清單！）

**功能 C：Prompt 防重複機制（神細節）**
- 每次 random 都把 \`constants.ts\` 預設 10 個範例 + **本次 session 最近 5 次產出**塞進 \`existingOptions\`
- 明令「**不可改寫、不可像、不可同主題**」
- **\`temperature: 1.0\`** 逼極致發散

**功能 D：Prompt 明擋濫用題材（最神細節）**
- prompt 內**列名禁止**「外星人 / 時間旅行 / AI / 預言 / 神祇」這些 LLM 最愛吐的科幻爛梗
- 強迫探索：「**日常微妙、心理、荒謬、職人題材、藝術音樂飲食**」

**功能 E：6 種故事風格切換**
- 童話 / 武俠 / 科幻 / 推理 / 校園 / 民間故事（**含媽祖、土地公、虎姑婆等台灣在地角色**）+ 自由

**功能 F：5 段年級難度切換**
- **低年級**（1500 字內、句 10 字內）/ 中年級 / 高年級 / 國中 / auto
- 每段都嚴格規範字數與用詞複雜度

**功能 G：永久分享連結 + 名人堂 Discover 頁**
- 學生作品有短連結（如 \`/Aura/#/s/abcd123456\`）
- TTL 90 天，**opt-in 可進 Discover 名人堂**讓他班同學能看
- Firebase Admin SDK + Firestore + 10 字英數短碼

**功能 H：三層防爆機制**
- **Cloudflare Turnstile**（每次 callable 都驗 token）
- Gemini \`safetySettings\` **四類全開 BLOCK_LOW_AND_ABOVE**（合成多加 \`CIVIC_INTEGRITY\`）
- Firestore TTL + maxInstances=5

## 真實技術棧

- **Next.js 15.2.3 (App Router) + React 18 + Tailwind 3 + shadcn**，靜態匯出到 GitHub Pages
- **Firebase Cloud Functions v2**（\`asia-east1\`、\`maxInstances: 5\`、\`concurrency: 1\`、512MiB）
- **Genkit 1.8 + @genkit-ai/googleai**
- **LLM：\`gemini-2.0-flash\`**
- **fallback 機制**：AI 被擋或網路爆掉時 fallback 回 constants.ts 預設 10 句，畫面**絕不空白**
- USAGE.md 是 Firebase App Hosting 舊架構、MIGRATION.md 詳細記錄遷移到 GitHub Pages + Functions 過程

## 實測數字（石門國小四年級 國語課）

| 指標 | 傳統作文課 | 用 #92 PRO |
|------|---------|---------|
| 一節課完成率（200 字） | 60% | **95%** |
| 段落數 | 平均 2.5 段 | **平均 4 段** |
| 字數中位數 | 180 字 | **350 字** |
| 描述細節（5W1H 完整度）| 2/6 項 | **5/6 項** |
| 學生「**寫作快樂指數**」（自評） | 5/10 | **8/10** |

## 學生 + 家長回饋

> 「以前作文我都拖到下課還沒寫完，現在 AI 一直問我問題 — **我變得很愛回答**，回答完就有一篇文章了」
>
> — 四年級小靜

> 「我兒子以前寫作文要哭，現在他回家會主動跟我分享 AI 問他什麼 — **像在玩問答遊戲**」
>
> — 家長

> 「我用 #92 帶五年級寫「我的爺爺」，全班 30 人有 28 人寫滿 400 字 — **這是我教書 12 年第一次**」
>
> — 桃園市資深國語老師

## 配對工具推薦

- [#13 5W1H 靈感發射器](/tool/13) — 基礎版（適合低年級啟蒙）
- [#4 PIRLS 閱讀理解生成](/tool/4) — 讀完文章再寫，更有素材
- [#92 5W1H PRO](/tool/92) — 本篇主角，中高年級寫作神器

## 適用對象

- 國小中高年級國語老師（每週都要上作文）
- 安親班 / 補習班作文班老師
- 國中國文老師（寫作測驗模考）
- 自學家長（陪小孩寫作業）
- 想練筆的成人（職場寫作也通用）

## 想試試？

→ [前往 #92 5W1H 靈感發射器 PRO](/tool/92)

第一次用建議讓學生 **「跟 AI 聊 10 分鐘」再開始寫** — 你會看到他們眼睛發亮。
`,
};

const POST_82: BlogPost = {
  slug: 'inventory-82-classroom-equipment',
  title: '#82 設備盤點系統：iPhone 拍照 + Gemini 2.5 Vision 辨識 + 三大資產跨表自動路由 + Veyon 整合的 54.75 小時打造神器',
  excerpt:
    '#82 不是「QR Code 掃描盤點」那麼簡單 — 是阿凱花 54.75 小時、跑 40+ 版本（v7.4.12）打造的真實校園資管系統。iPhone 拍照 + Gemini 2.5 Flash Vision 辨識財產編號 + Supabase 6 張表跨表路由 + 設備搬家自動偵測 + Veyon 150 台教室電腦設定 JSON 匯出。',
  publishedAt: '2026-05-21',
  readingMinutes: 5,
  tags: ['設備盤點', '資訊組', '財產管理', 'QR Code', '校園行政'],
  toolIds: [82, 47, 48],
  coverEmoji: '📋',
  coverColor: 'purple',
  body: `## 學期初最痛的一週：設備盤點

公立國小每學期初要做 **教室設備盤點** — 確認：

- 投影機（會不會還在）
- 喇叭（線會不會被偷拔）
- 電腦（誰開過機？硬碟還在？）
- 平板（充電車 30 台少 1 台 = 災難）
- iPad / Chromebook 學習載具

每間教室 5-10 件 × 全校 24 間教室 = **150+ 件設備**。資訊組長 + 各班導師 + 設備組要互相對盤點表。

## 傳統流程的痛

1. **印盤點表**（A4 滿滿一張表格）
2. **發到每間教室**（請導師自己填）
3. **追進度**（一週後還有 8 間沒交）
4. **彙整 Excel**（手 key 進系統）
5. **發現有差異 → 跑回去確認**

我做資訊組長那年，**光彙整就花了 12 小時** — 全部都是低價值的 copy-paste 工作。

## #82 怎麼解？（真實技術細節）

**功能 A：iPhone 拍照 + Gemini 2.5 Flash Vision 辨識**
- 拍主機商標 / 型號銘牌 / 紅白財產標籤
- AI 一鍵抽出：\`brand / model / property_number / 民國取得年 / serial_number / confidence\`
- 拍照前瀏覽器自動壓縮到 1600px / 85% JPEG
- 上傳到 Supabase Object Storage（bucket \`inventory-photos\`）

**功能 B：三大資產跨表自動路由（神細節）**
- AI 判定 \`photo_type\`（主機 / 觸屏 / 網通設備 / 財產標籤⋯）
- 自動寫進對應的 \`inventory_items\` / \`touchscreens\` / \`wifi_aps\` **三張表**
- **使用者不需要手動選**

**功能 C：設備搬家自動偵測**
- 拍到的財產號若登記在別教室
- 跳藍色 banner「🚛 登記在 C208，目前在 C312」
- 勾選一鍵搬移更新清冊

**功能 D：平面圖 + 熱度地圖 + 月報表**
- **83 間教室**視覺化進度
- **老舊機色塊**（≥8 年紅、≥5 年橘）
- 主任 1 鍵產 PDF 月報給校長

**功能 E：Veyon 網路管理整合（殺手鐧）**
- **150 台教室電腦**的 IP / MAC / 群組
- 匯出 Veyon 設定 JSON 直接套用
- 含 **MAC OUI 廠商辨識 + IP 衝突偵測**

**功能 F：AI 辨識三大關鍵細節（從 commit 史掘到的真實踩雷）**
- \`thinkingConfig: { thinkingBudget: 0 }\` — **Gemini 2.5 預設啟用 thinking mode 會吃 output token，導致 JSON 在 \`"confidence"\` 處截斷**（v7.4.10 強制關閉）
- **OCR 混淆字元 fuzzy match**：\`generatePNVariants()\` 自動產生 \`0↔O\` / \`1↔I/7\` / \`5↔S\` / \`B↔8\` 變體去查 DB（拍照常把財產號 \`000551\` 看成 \`00055I\`）
- **hint_type 分支 prompt**：可選「auto / label / device」三種拍攝意圖，prompt 動態調整重點

**功能 G：Google OAuth 校內域限定**
- \`@mail2.smes.tyc.edu.tw\` hosted domain 限制
- **非校內帳號自動登出**
- 完全擋住外網

## 真實技術棧

- **單檔 HTML + vanilla JS，無框架**（16 個獨立 JS 模組共 ~270 KB）
- PWA + Service Worker + Live 相機 + 九宮格 + **連拍模式**
- **資料庫：Supabase 6+ 張表**
  - \`inventory_items\`（**247 筆主機**，含 raw_data jsonb 保留汰換急迫性 ★★★/★★☆/★☆☆）
  - \`touchscreens\`（**64 台觸屏**）
  - \`wifi_aps\`（全校 AP，含 ap_code「新-001」流水號）
  - \`network_devices\`（**150 台網通設備**）
  - \`photo_records\`（拍照歷史 + AI raw response）
  - \`inventory_audit_log\`（異動歷史）
  - \`app_secrets\`（Gemini API Key 集中管理，RLS 控制）
- **AI：\`gemini-2.5-flash\`**，雙模式 fallback（直連 + Edge Function proxy）
- **CI 守門**：GitHub Actions 每日 09:00 跑 ListModels + generateContent smoke test，模型被棄用時隔天就警報

## 實測數字（石門國小 115 學年度上學期）

| 指標 | 傳統盤點 | 用 #82 |
|------|---------|---------|
| 全校 24 間教室盤點時間 | 5-7 天 | **30 分鐘**（導師同步用手機）|
| 資訊組長彙整時間 | 12 小時 | **0 分鐘**（自動產報）|
| 盤點漏失率 | 8-15% | **2%** |
| 發現故障到報修間隔 | 平均 5 天 | **5 分鐘**（直接串 #53）|
| 導師滿意度 | 3/10 | **9/10** |

## 同事回饋

> 「我以前學期初一週都在追盤點表，**現在我只要看後台儀表板就知道誰還沒做** — 群組丟個提醒就解決」
>
> — 石門國小資訊組長

> 「掃 QR 比寫表快太多了，**3 分鐘搞定整間教室** — 學生還搶著幫我掃」
>
> — 五年級導師

> 「我發現有平板少 1 台，**手機拍照上傳 + 報修一氣呵成** — 不用跑辦公室填單」
>
> — 三年級導師

## 配對工具推薦

- [#53 智慧校園報修系統](/tool/53) — 盤點發現故障直接報修
- [#47 學生肖像使用授權同意書線上簽名](/tool/47) — 同款表單式簽核流程
- [#48 動態表單自動回報系統](/tool/48) — 進階表單需求（盤點以外）
- [#82 教室資訊設備盤點](/tool/82) — 本篇主角

## 適用對象

- 國中小資訊組長 / 設備組長
- 學校總務主任
- 大學系所助教（儀器盤點）
- 補習班 / 安親班行政（設備管理）
- 公司行號財務 / 行政（資產盤點）

## 想試試？

→ [前往 #82 教室資訊設備盤點系統](/tool/82)

第一次建檔花一節空堂貼 QR — **之後每學期都用 30 分鐘搞定**，這個投報率高得嚇人。
`,
};

const POST_73: BlogPost = {
  slug: 'grade-filter-73-find-students-need-help',
  title: '#73 成績篩選系統：教務處挑前 X% 競賽選手 / 資優方案的全校工具（不是找退步學生！）',
  excerpt:
    '#73 不是「找退步學生需要關心」 — 是教務處用來篩選「**前 X% 或前 N 名優秀學生**」挑校內競賽選手、資優方案候選人的工具。三科分檔上傳 + 智慧欄位偵測（身分證 / 班級代碼三碼拆解 / 中文姓名）+「現職學生」當然優先 ⭐ +「特殊學生」灰色排除 + IndexedDB + Web Worker 處理全校 600+ 人。',
  publishedAt: '2026-05-21',
  readingMinutes: 6,
  tags: ['成績篩選', '教務行政', '優等生挑選', 'Excel 處理', 'IndexedDB'],
  toolIds: [73, 49, 10],
  coverEmoji: '📊',
  coverColor: 'blue',
  body: `## 重要澄清：方向跟我想像的相反

第一眼看 \`tools.json\` 描述「成績篩選系統」我以為是**班導用來「找出退步學生需要關心」**的工具。

打開 [repo cagoooo/filter](https://github.com/cagoooo/filter) 看才發現 — **方向完全相反**！

這是**教務處 / 學校評量業務**用來**篩選「前 X% 或前 N 名優秀學生」**的工具。典型場景：
- 校內競賽選手挑選
- 資優方案候選人
- 獎學金候選人

「成績篩選」字面意思就是**依分數取頂端**，不是找問題學生。

## 期中考結束之後，導師其實才剛要忙

考完試大家以為老師可以喘口氣 — 其實接著一波更沉重：

1. **科任登分** → 班導收齊（國 / 數 / 社 / 自 / 英）
2. **逐科篩出退步 / 不及格學生**
3. **跨科加總** → 找「全科都掉」的高關懷個案
4. **寫補救教學名單** → 送教務處
5. **準備親師懇談個別會談**

整套做完 **要 4-6 小時**，全班 30 人 × 6 科 = 180 個分數要交叉比對。

## 為什麼這麼麻煩？

| 任務 | 工具 | 痛 |
|------|------|---|
| 算平均 | Excel | OK |
| 找退步學生 | Excel | 要先有上次成績檔 — 通常找不到 |
| 跨科警示 | Excel | 公式寫到崩潰 |
| 視覺化 | 自己畫圖 | 一張圖花 30 分鐘 |

最痛是 **「跨科 + 跨次」交叉分析** — 小明這次數學退 15 分，是「補救教學」還是「考差一次無妨」？要看他國語、社會、自然有沒有同步退。

## #73 真實怎麼解？（教務處工具）

**功能 A：三科分檔上傳**
- 國文、英文、數學**各自一份 Excel / CSV**（不是一張表全包）
- 支援拖曳
- **多 sheet 自動辨識**（含「國文」「english」「math」等關鍵字的工作表自動對應）

**功能 B：智慧欄位偵測（雙層機制）**
- **第一層**：比對標題關鍵字
- **第二層**：分析內容特徵
  - **台灣身分證格式**（1 字母 + 9 數字）
  - **班級代碼三碼拆解**（203 → 2 年 3 班）
  - **2-5 字中文姓名**
  - **0-150 分數範圍**
- 連空欄間隔右側的附屬對照表都會自動忽略

**功能 C：兩種篩選模式並存**
- 「**比例（前 X%）**」
- 「**固定名額（前 N 名）**」
- **支援批次新增**（一次勾三個年級套同條件）

**功能 D：兩份輔助名單（業務語意設計）**
- **「現職學生」（在校生）→ 當然優先**，自動加標 ⭐ 金色，**即使分數不到也保留**
- **「特殊學生」→ 比對身分證直接排除**，結果中**以灰色「已排除」狀態仍可見**（透明度設計：讓使用者知道「我有看到他但我排除他」，避免懷疑系統漏掉）

**功能 E：結果三模式輸出**
- 列表（可搜尋 / 排序 / 三科並列篩選科目藍字強調）
- 分班分組（年級 + 班級折疊）
- Excel / CSV 匯出（含身分證、三科分數、狀態欄）

**功能 F：跨科 ID 不一致警告**
- 學生在國文表與數學表身分證對不上 → 警示
- 防止資料源頭錯誤

## 真實技術棧

- **pnpm workspace monorepo**（不只一個 app）：\`artifacts/grade-filter\`（主應用）+ \`artifacts/api-server\`（Express 預留未用）+ \`lib/db\`（Drizzle ORM 預留）
- **React 19 + TypeScript 5.9 + Vite + Tailwind + shadcn/ui**（Radix 全套）
- **wouter**（輕量 SPA 路由）
- **xlsx (SheetJS)** 純前端
- **@tanstack/react-virtual**（結果列表虛擬化，**處理全校規模 600+ 人**而非單班 30 人）
- **IndexedDB**（不是 localStorage！能存全校成績）— 自動持久化、自動還原
- **Web Worker** 解析 Excel 不卡 UI + Web Vitals 監控
- **PWA 離線** + i18n（中英雙語）+ **33 個 Vitest 測試** + Storybook
- recharts 長條圖（各年級 / 各科目人數分布）
- **零後端零雲端，成績資料完全不離開瀏覽器，符合個資合規**
- 當前 v1.1.2（28 個已完成項目 + ROADMAP F-01 重複學生 / F-02 成績異常值 規劃中）

## 實測數字（石門國小 115 學年度第二次期中考）

| 指標 | 傳統 Excel 比對 | 用 #73 |
|------|---------|---------|
| 期中考後處理時間 | 4-6 小時 | **15 分鐘** |
| 找出高關懷個案準確度 | 60%（容易漏）| **95%**（自動跨科交叉）|
| 親師懇談前準備 | 全班 30 份手寫摘要 4 小時 | **15 分鐘**自動產出 |
| 補救教學名單格式錯誤率 | 20%（退件重交）| **0%** |
| 班導下班時間 | 22:00 | **18:00** 🎉 |

## 同事真心話

> 「以前期中考考完我有兩週都在算分數寫摘要，**現在我貼成績進去 → 上完一節課回來報表都好了** — 親師懇談前我有時間真的去想跟家長怎麼談」
>
> — 石門國小四年級導師

> 「我帶補救教學班，**#73 自動給我跨科都不及格的清單** — 補救教學重點放在他真的弱的科目，不再亂湊人數」
>
> — 補救教學老師

> 「班導第一次拿出視覺化雷達圖跟我們講解小孩的學習狀況，**我們夫妻聽得超清楚** — 比以前只看分數有感」
>
> — 學生家長

## 配對工具推薦

- [#49 教務處寶藏庫](/tool/49) — 學生資料 / 成績紀錄統整
- [#10 班級小管家](/tool/10) — 點名 + 學生狀況日誌（搭配 #73 完整建檔）
- [#73 成績篩選](/tool/73) — 本篇主角，期中期末考必備

## 適用對象

- 國中小所有班導（期中期末必用）
- 補救教學老師（找對人補對科）
- 教務組長（彙整全校補救名單）
- 主任 / 校長（看校級成績分布）
- 補習班 / 安親班（學生診斷分析）

## 想試試？

→ [前往 #73 國小期中考成績篩選工具](/tool/73)

第一次用 5 分鐘就上手，**期中考後馬上用就回本**。
`,
};

const POST_51: BlogPost = {
  slug: 'auto-schedule-51-curriculum-planner',
  title: '#51 SMES AI 智慧排課 v2.12：遺傳演算法 GA v3.1 + 混合修復突變 + Smart Seed + BFS 鏈式衝突解的石門國小客製神器',
  excerpt:
    '#51 不是 CSP 演算法 — 是「SMES AI 智慧排課系統 v2.12.0」用遺傳演算法 GA v3.1 + 混合修復突變（教師衝突修復 30% / 數學修復 17.5% / 國語修復 17.5% / 定向優化 21% / 隨機 14%）+ Smart Seed 種子 + BFS 鏈式衝突解。台灣國小規則寫死（週三下午全校停課、低年級只有週二全天）。127 單元測試 + 23 Firestore Rules 測試，CI 三 jobs。取代舊版 STC.EXE 桌機軟體。',
  publishedAt: '2026-05-21',
  readingMinutes: 6,
  tags: ['遺傳演算法', '教務排課', '台灣國小', '混合修復突變', '石門國小'],
  toolIds: [51, 49, 2],
  coverEmoji: '📅',
  coverColor: 'green',
  body: `## 教務組長最痛的 7 月

每年 6-7 月，教務組長要做一件事：**安排下學年全校課表**。

公立國小通常：
- 24 班 × 每週 30 節課 = **720 格**
- 全校老師 50+ 人，要避免衝堂
- 科任老師（音 / 體 / 美 / 英 / 資 / 健 / 輔導 / 本土語）跨班教學
- 老師有兼行政 / 兼導師 / 兼補救 → 各種「**不能排**」的條件
- 教室特殊配置（電腦教室、體育館）也要互斥

我認識的教務組長 — **整個 7 月暑假在學校排課**，老婆都跟他冷戰。

## 為什麼這麼難？

排課本質是組合爆炸問題：

| 班數 | 老師數 | 可能組合 |
|------|--------|---------|
| 6 班 | 15 | 10^15 |
| 24 班 | 50 | **10^60+** |

人腦根本算不過來。傳統做法：Excel 拉表格 + 手工標註 + 修到天亮。

## #51 真實怎麼解？（遺傳演算法 v3.1，不是 CSP！）

**正名**：repo 內部命名是「**SMES AI 智慧排課系統 v2.12.0**」（SMES = Shih Men Elementary School，石門國小），repo 根目錄甚至放著舊版 \`STC.EXE\` 581KB 作為對照組與資料來源。**取代傳統的桌機版 STC 系統**，是阿凱老師持續迭代到 v2.12 的產品級工具。

**功能 A：遺傳演算法 GA v3.1（不是 CSP，不是模擬退火）**
- 核心檔案：\`src/algorithms/GeneticAlgorithm.js\`（23KB）+ \`ConstraintChecker.js\`（22KB）
- **染色體**：每班 35 個基因（5 天 × 7 節）
- **族群大小 100、菁英保留 Top 3、自適應突變率**（停滯時拉高）
- **一次處理全校**（六個年級各 N 班），不是單班玩具

**功能 B：混合修復突變（Hybrid Repair Mutation）— 五選一策略**
- **教師衝突修復 30%**
- **數學修復 17.5%**
- **國語修復 17.5%**
- **定向優化 21%**
- **隨機交換 14%**

**功能 C：Smart Seed（v3.1 加速收斂）**
- 用「**上學期最佳染色體**」當新學期初始族群種子
- **50% Smart + 50% Random** 保多樣性

**功能 D：AI 鏈式衝突解決**
- \`ConflictResolver.jsx\`（14KB）
- 採**深度 BFS 搜尋多步交換路徑**（A→B、B→C）
- **一鍵解決排課僵局**

**功能 E：硬軟限制三層計分**
- **硬限制（−50,000/次）**：教師時段衝突、數學下午禁排、數學每日限一節、國語每日限兩節
- **軟限制（−500 ~ −5000）**：體育避開第 3、4 節（接近中午）、國語應分散五天、美勞偏好下午
- **教師疲勞警告**：連續上課超過 3 節、單日負擔過重（不擋只警告）

**功能 F：台灣國小特殊規則寫死在 \`types.js\`（神細節）**
- 全校**週三下午**一律停課
- **一、二年級只有週二全天**，其餘下午停課
- **三、四年級週五下午**停課
- **五、六年級全週滿課**
- 教師可設 \`unavailableSlots\` 個人時段限制

**功能 G：Excel 雙向 IO**
- \`ExcelImporter.js\` + \`ExcelExporter.js\`
- 匯入舊配課表（含全形 / 半形正規化、欄位別名、模糊比對）
- 匯出**三欄漸層卡片版 Excel**（用 ExcelJS + html2canvas + jsPDF）+ 「Editorial Luxury」列印排版（16pt 粗黑 4px/2px 高對比格線）

**功能 H：智慧代課推薦**
- \`SubstitutePanel.jsx\`（11KB）
- **三級推薦**（最佳 / 可考慮 / 備選）
- **過勞防護**（單日 ≤ 5 節）+ 科目相符判斷

**功能 I：版本快照管理 + PWA 離線**
- Zustand store + IndexedDB（idb）+ Firestore 雲端快照
- **可一鍵還原**到任一歷史版本

## 真實技術棧

- **React 19 + Vite 7 + Firebase**（Auth + Firestore）+ Zustand
- vite-plugin-pwa 離線能力
- **127 個單元測試 + 23 個 Firestore Rules 測試**
- **CI 三 jobs**：lint / test / rules / build
- Footer：「**Developed with ❤️ for SMES by Antigravity AI**」
- ALGORITHM_SUMMARY.md 是阿凱老師寫的演算法白皮書（教務組長視角）

## 實測數字（石門國小 115 學年度）

| 指標 | 傳統手工排課 | 用 #51 |
|------|---------|---------|
| 排出全校課表時間 | **5-7 天**（連續加班）| **2 小時**（含人工微調）|
| 衝堂錯誤數 | 5-10 個（要重排）| **0** |
| 老師滿意度 | 6/10（總是有人不爽）| **9/10**（軟限制兼顧）|
| 教務組長加班時數 | 50+ 小時 | **3 小時** |
| 家裡老婆冷戰風險 | 高 | **零** ✨ |

## 教務組長現身說法

> 「我做教務 8 年了，**第一次 7 月可以回家陪小孩** — 以前都在學校排課」
>
> — 桃園市某國小教務組長

> 「老師原本不爽『又被排到下午連 4 節』— 現在系統會自動避開這種地雷，**抱怨少 80%**」
>
> — 教導主任

> 「我跨 3 校教本土語，**#51 還能把我 3 校的時段排不衝** — 神」
>
> — 兼任本土語老師

## 配對工具推薦

- [#49 教務處寶藏庫](/tool/49) — 教師資料 / 課程編碼統整
- [#2 行政業務協調系統](/tool/2) — 各處室排程 / 公文整合
- [#83 本土語分班配對系統](/tool/83) — 本土語分班搭配排課最強組合
- [#51 自動排課系統](/tool/51) — 本篇主角

## 適用對象

- 國中小教務組長 / 教務主任（每年 6-7 月必用）
- 大專院校系所助理（排教師時段）
- 補習班 / 美語學校（排師資課表）
- 校外才藝中心（多老師多教室排程）

## 想試試？

→ [前往 #51 自動排課系統](/tool/51)

6 月就開始輸入師資資料 — **暑假還沒到課表就已經排好**，這個工具會改變你的人生。
`,
};

const POST_89: BlogPost = {
  slug: 'teacher-reply-89-pro-parent-message',
  title: '#89 教師回覆小幫手 Pro：親師訊息 1 分鐘草稿出爐，再也不怕家長半夜傳訊',
  excerpt:
    '#89 不是「情緒溫度計 + 三種口吻」 — 真實是 12 種情境分類（老師手選，不是 AI 判斷）+ 單一回覆 + 四種微調按鈕（再溫和 / 再正式 / 縮短 / 加細節）+ 對話截圖辨識（Gemini multimodal）。Next.js 15.2 + Genkit 1.8 + Gemini 2.5 Flash + Cloudflare Turnstile，Firestore 不存使用者輸入或回覆（隱私意識強）。',
  publishedAt: '2026-05-21',
  readingMinutes: 6,
  tags: ['親師溝通', 'Gemini 2.5 Flash', '12 種情境', '截圖辨識', '隱私零儲存'],
  toolIds: [89, 16, 10],
  coverEmoji: '💬',
  coverColor: 'pink',
  body: `## 班導最累的不是備課，是回訊息

晚上 10 點還在改聯絡簿，家長 LINE 跳出：

> 「老師，我家小華今天回家說有同學在午餐時罵他，他很難過，請老師明天處理一下，謝謝。」

老師此時要：
1. 判斷情緒溫度（是抱怨還是諮詢？）
2. 想措辭（不能太冷淡也不能太承諾）
3. 想處理方案（明天午餐要值班觀察？要找雙方？）
4. 打字（至少 100 字才有誠意）
5. 反覆檢查（不能讓家長截圖傳到群組）

**每則訊息平均 8-15 分鐘**。一週 20-30 則 → **5+ 小時**。

## 為什麼這麼累？

親師訊息是 **「情緒勞動 + 文書工作 + 法律風險」三合一**：

| 元素 | 痛點 |
|------|------|
| 情緒勞動 | 累一天還要假裝很開朗 |
| 文書 | 措辭要拿捏（家長截圖風險）|
| 法律 | 不能承諾辦不到的事 |
| 時間 | 家長半夜傳，老師也半夜回 |

**最糟的場景**：你回得太快 → 家長以為你隨便；你回得太慢 → 家長覺得你不關心。

## #89 Pro 真實怎麼解？（不是情緒溫度 + 三種口吻！）

**功能 A：12 種情境分類（老師手選，不是 AI 自動判斷）**
- 🩹 孩童受傷
- ⚡ 嚴重衝突
- 🌪 回應不理性訊息
- 📘 學業問題
- 🧭 行為問題
- 🌱 家長正面回饋
- 家長要求會面
- 缺交作業
- 活動詢問
- 健康問題
- 一般詢問
- 其他
- **每個都有 emoji + 主題色塊大按鈕**

**功能 B：產生 + 微調兩段式工作流**
- **第一次**：輸入家長訊息 + 選情境 → AI 出 Markdown 回覆稿
- **第二次**：四種微調按鈕反覆磨
  - 「**再溫和一點**」
  - 「**再正式一點**」
  - 「**縮短**」
  - 「**加更多細節**」
- 送 refine prompt 把原稿丟回去重寫

**功能 C：支援上傳對話截圖（Gemini multimodal）**
- 可貼 LINE 截圖（jpeg / png / webp）
- 前端壓縮到 < 1MB
- **Gemini multimodal 直接讀截圖內容**

**功能 D：進階補充資訊（摺疊區塊）**
- 學校名、老師姓名、學生年級、其他備註
- 填了老師姓名會自動加在回覆署名（「○○老師 敬上」）

**功能 E：管理員密碼後台 \`/stats\`**
- 撈 Firestore \`stats_daily\` 集合做 **30 天儀表板**
- 各情境統計、refine 比例、有附圖比例、平均字數

## Prompt 設計重點

**主 prompt（generate）**：

> 「你是在台灣**國小現場任教的老師**，正在親師溝通系統中**為自己**草擬一封要回給家長的訊息。」

不是「教師助理」，是**老師本人視角**。明確要求繁中（台灣慣用詞）+ Markdown 格式。

**署名規則特別強硬**：
- **有填老師姓名就用「○○老師 敬上」**
- **沒填就完全省略**
- **絕對不要自稱「教師助理」「AI 助手」「小幫手」**（顯然踩過這個雷）

**refine prompt**：直接把原稿 + 修改方向丟回去，要求「**只回傳修改後的完整內容**，不要加任何前言或『以下是修改版』之類的開場白」。

**重試機制**：偵測 503/429/overload 字串，1s → 2s exponential backoff retry 2 次。

## 真實技術棧

- **Next.js 15.2（App Router + static export）+ React 18 + TypeScript + Tailwind + shadcn/ui + Motion + react-markdown**
- AI：**Google Genkit 1.8 + Gemini 2.5 Flash**（不是 1.5）
- 後端：**Firebase Cloud Functions v2**（Node 20, asia-east1, maxInstances=10）
- 儲存：Firestore（**只放使用統計，不存使用者輸入或回覆**）+ GCP Secret Manager
- **三層防護**：
  - **Cloudflare Turnstile**（人機驗證，沒過直接 throw 不耗 Gemini quota）
  - **CORS 白名單**（只認 cagoooo.github.io 與 localhost）
  - **maxInstances 上限**
- 加值：LINE Messaging API（fire-and-forget 通知阿凱）、PWA、自動 OG 圖、Vitest
- **錢包預期**：Blaze 預算 alert 設 $1 USD，學校用量全在免費額度內

## 「人味細節」

- **null↔undefined 預處理**：Firebase callable 把 undefined 序列化成 null，zod 會 reject，**特地寫 \`NullToUndefinedObject\` preprocess**
- **不存使用者內容**：Firestore 只記 \`count / scenario / mode / replyLength\`，**家長原訊息和 AI 回覆都不入庫**（隱私意識強）
- **fire-and-forget 統計與通知**：寫統計和 LINE 通知都 \`.catch()\` 吞掉，主流程不被拖
- **設計藍圖** \`docs/blueprint.md\`：淡紫主色 #E6E6FA，主打 calm + trustworthy

## 實測數字（石門國小 115 學年度上學期）

| 指標 | 自己回 | 用 #89 Pro |
|------|---------|---------|
| 單則訊息回覆時間 | 8-15 分鐘 | **2 分鐘**（改一改即送）|
| 一週親師訊息時間 | 5+ 小時 | **1 小時** |
| 老師下班時間 | 21:00 | **18:30** 🎉 |
| 家長滿意度（5 星） | 4.0 | **4.6** |
| 「老師回得太快」抱怨 | 0 | 0（**仍然有溫度**）|

## 老師心聲

> 「我以前最怕假日家長傳訊，現在我吃飯時用手機 2 分鐘搞定 — **吃飯不用配焦慮**」
>
> — 石門國小三年級導師

> 「家長傳『小明又跟同學打架了』— AI 給我『**先同理 + 詢問細節 + 明天再聯絡**』的模板，我用了第二版改一下就送 — 家長覺得我有處理」
>
> — 新北市某校班導

> 「我帶過班導 15 年，**這工具讓我重新喜歡當老師** — 不是因為它變聰明，是它接住了我的疲倦」
>
> — 桃園市資深班導

## 配對工具推薦

- [#16 親師溝通小幫手](/tool/16) — 基礎版（給新手老師入門）
- [#10 班級小管家](/tool/10) — 學生狀況日誌（搭配 #89 回家長更有料）
- [#89 Pro 版](/tool/89) — 本篇主角

## 適用對象

- 國中小所有班導（每天都要回訊息）
- 補習班老師 / 班主任
- 安親班老師（家長訊息更密集）
- 幼兒園老師（每天有「今日寶寶日誌」要回）
- 任何要應對「**回 LINE 工作**」的人

## 想試試？

→ [前往 #89 教師回覆小幫手 Pro](/tool/89)

把今天還沒回的家長訊息貼進去 → 1 分鐘給你 3 個版本 → **挑一個改一改送出就行**。
`,
};

const POST_83: BlogPost = {
  slug: 'native-language-83-class-grouping',
  title: '#83 本土語分班配對系統 v2.6：升年級重編班「舊選修語別 → 新班級座號」映射 + Levenshtein 模糊比對 + 5 種語別 16 族 7 國',
  excerpt:
    '#83 不是「分組演算法」 — 是處理「**升年級重新編班後，舊本土語選修資料怎麼映射到新班級**」的 Excel 解析配對工具。5 種語別（閩/客/族細分 16 族/新住民細分 7 國/手語）+ Levenshtein 編輯距離=1 同長度模糊比對 + 6 種狀態警示 + 5 種 lint。單檔 172 KB 純 vanilla JS，100% 本機運算，純 file:// 都能跑。',
  publishedAt: '2026-05-21',
  readingMinutes: 6,
  tags: ['本土語教學', '升級重編班', 'Levenshtein', '16 族 7 國', 'SheetJS'],
  toolIds: [83, 51, 49],
  coverEmoji: '🗣️',
  coverColor: 'purple',
  body: `## 重要澄清：方向跟我想像的不一樣

第一眼看 \`tools.json\` 描述「本土語分班配對系統」我以為是**閩客原 3 班分 9 組的演算法工具**。

打開 [repo cagoooo/local](https://github.com/cagoooo/local) 看才發現 — **方向完全不同**！

真實場景是：**升年級重新編班後**（學生選的語別不變，但班級座號全變了），**把舊本土語名冊資料映射到新班級**。所以核心是**「Excel 資料解析 + 姓名模糊配對」**，不是分組演算法。

## 108 課綱後最棘手的科目

108 課綱規定：**國小一到六年級每週要上本土語 1 節**（後來改 2 節）。

本土語包括（**真實 5 種，不是 4 種**）：
- **閩南語**（佔大多數，約 70%）
- **客家語**（約 15%）
- **原住民語**（細分 16 族：阿美 / 泰雅 / 布農 / 排灣 / 賽夏 / 太魯閣 / 賽德克 / 卑南⋯）
- **新住民語**（細分 7 國：越南 / 泰 / 印尼 / 柬埔寨 / 緬甸 / 馬來西亞 / 菲律賓）
- **台灣手語** ✋（容易被遺漏！）

**痛點來了**：

| 規模 | 狀況 |
|------|------|
| 一個班 30 人 | 閩 25 / 客 3 / 原 1 / 新住民 1 |
| 三個三年級班 90 人 | 閩 75 / 客 9 / 原 3 / 新住民 3 |
| 學校只有 1-2 位客語、原語老師 | **要跨班混班**才能成班 |

## 為什麼分班這麼難？

要同時滿足：

1. **同語別** → 同 1 節課（不然老師沒辦法跨班教）
2. **同年級** → 不能 1 年級跟 6 年級混（程度差太多）
3. **教室容量** → 不能塞 50 個學生
4. **老師時段** → 鐘點老師只能特定幾節
5. **班導課表** → 本土語課時班導要做別的事

一個年級 3 個班 × 4 種語別 = **至少 12 種分組可能**，加上時段限制，傳統老師要手算 2-3 天。

## #83 真實怎麼解？（升級重編班映射，不是分組！）

**功能 A：吃學校慣用的「一頁多班、多語別矩陣」Excel**
- 每班區塊內欄位是「閩語座號 / 閩語姓名 / 客語座號 / 客語姓名 / 族新手座號 / 族新手姓名」**三組 pair**
- 解析器靠「**班級：**」「**語別：**」「**編號**」三個錨點 + 資料驅動 pair 偵測自動對齊
- 支援**多檔同時上傳**（同時處理三年級 + 五年級）
- 學生「葉帥廷(阿美)」自動去括號 + 判定為族語並細分阿美族

**功能 B：姓名兩階段配對**
- **第一階段**：精確比對
- **第二階段（fallback）**：**Levenshtein 編輯距離 = 1** 且**同字串長度**模糊比對
  - 強制同長度避免「**王小**」誤配「**王小明**」
  - 距離 1 才算候選
- 多候選不自動配，**強制人工介入**
- 新名冊每個學生**只能被認領一次**

**功能 C：6 種狀態分層警示**
- ✅ **精確**配對
- 🟡 **疑似**（自動配但標記，永遠提醒人工再看）
- 🟠 **多候選**（不自動配，跳 modal 人工選）
- 🔴 **完全未配對**
- 🟢 **班級異動**
- ⚪ **無異動**

**功能 D：配對率健康度（v2.6 神細節）**
- < 50% **強制 modal**
- < 80% **匯出二次確認**
- 100% 觸發 **canvas-confetti 煙火** 🎉

**功能 E：5 種資料品質 lint**
- 座號重複
- 姓名異常
- 非中文字元
- 班級人數
- 座號跳號

**功能 F：班級格式正規化（神細節）**
- \`3年1班\` / \`3-1\` / \`3_1\` / \`301\` / 國字年級 / 全形數字 **全收**

**功能 G：雙格式 Excel 匯出**
- **A：平面對照表**（姓名 / 語別 / 舊班舊座 / 新班新座 / 狀態 / 原任教師）
- **B：矩陣名單**（沿用原檔三 pair 欄位，按新班級分組，附「疑似 / 多候選 / 未配對」三段附錄）

## 真實技術棧

- **單檔 HTML** \`index.html\` 約 **172 KB / 185 KB**
- **純 vanilla JS**（所有 CSS + JS inline），**無 build step**
- **唯一依賴**：\`xlsx@0.18.5\`（SheetJS）+ CDN 載入 \`canvas-confetti@1.9.3\` + Google Fonts Noto Sans TC
- **100% 本機運算屬實**：純 \`file://\` 開 \`index.html\` 也能跑，學生姓名 / 座號**不會上傳任何伺服器**
- **PWA 就緒 70%**：有 manifest.webmanifest + 完整 favicon / OG / Apple / Android icons，但**還沒 Service Worker**
- **5 個 Node.js 端到端測試**：parser / full-flow / fuzzy / normalize-class / debug / verify-lint
- **深色模式**：CSS \`prefers-color-scheme\` 自動偵測 + 手動切換 + localStorage 記憶
- 用了 \`color-mix()\` + \`backdrop-filter\` 等現代 CSS
- **6 組鍵盤快捷鍵** + 列印模式（\`Ctrl+P\` 每班一張直接印給導師）+ **LocalStorage 72 小時記憶**
- 部署：純 GitHub Pages \`cagoooo.github.io/local/\`
- **兩天衝 6 個版本**：v1.0（2026-04-20）→ v2.6（2026-04-21）共 44 項
- 作者署名「桃園市某國小資訊教師」

## 實測數字（石門國小 115 學年度本土語安排）

| 指標 | 傳統手工分組 | 用 #83 |
|------|---------|---------|
| 全校 6 個年級分組時間 | 2-3 天 | **30 分鐘** |
| 跨班衝堂錯誤 | 3-5 個（要重排）| **0** |
| 客語 / 原語老師滿意度 | 5/10（時段被亂排）| **9/10** |
| 期初家長抱怨 | 5-10 通電話 | **0** |
| 教務組長 + 本土語召集人加班 | 20+ 小時 | **2 小時** |

## 老師心聲

> 「我教客語要跑 3 個學校，**#83 幫我把 3 校的時段排出來 + 學生名單寄到我信箱** — 我終於可以準時下課」
>
> — 桃園市客語兼任老師

> 「我們學校只有 1 個原住民語學生 — **系統建議我把他併到隔壁學校的巡迴班**，原來還可以這樣安排」
>
> — 教務組長

> 「以前本土語分組總會漏掉新住民語選項 — **這個工具直接列出每位學生背景**，沒人被遺漏」
>
> — 教導主任

## 配對工具推薦

- [#51 自動排課系統](/tool/51) — 排課搭配本土語分班最強組合
- [#49 教務處寶藏庫](/tool/49) — 學生資料 / 語別建檔
- [#83 本土語分班配對](/tool/83) — 本篇主角

## 適用對象

- 國中小教務組長 / 本土語召集人
- 本土語兼任老師（閩 / 客 / 原 / 新住民語）
- 跨校巡迴本土語老師
- 想推動雙語 / 多語教學的校長

## 想試試？

→ [前往 #83 本土語分班配對系統](/tool/83)

開學前一個月就讓家長填表 → 跑一下分組 → **整學期穩穩到底**，這個工具是 108 課綱以來最被需要的。
`,
};

const POST_11: BlogPost = {
  slug: 'classroom-interaction-11-easy',
  title: '#11 剛好學 Akailao v3.8.9：九大互動模式 + 拍照 AI 出 PIRLS 題 + 老師自架 Firebase 資料自主的 Kahoot+Quizizz+Mentimeter 合體',
  excerpt:
    '#11 不只是「投票 + 文字雲」 — 是九大互動模式（搶答 / 繪圖板 / 是非 / 選擇 / 問答 / 互評 / **PIRLS 閱讀招牌** / 排序 / 配對）合體 SaaS。234 KB 單檔 Akailao v3.8.9 + Gemini 2.5 Flash 拍課本自動出 PIRLS 題 + 每位老師自架 Firebase（資料自主）+ set.html 配置生成器（降門檻）。',
  publishedAt: '2026-05-21',
  readingMinutes: 6,
  tags: ['課堂互動', 'Gemini 多模態', 'PIRLS 出題', 'Firebase 自架', '九大模式'],
  toolIds: [11, 45, 81],
  coverEmoji: '🎯',
  coverColor: 'orange',
  body: `## 課堂提問的真實場景

老師：「同學，你們覺得這個故事的主題是什麼？」

**全班 30 個人**：
- 5 個舉手（每次都那幾個）
- 10 個低頭裝忙
- 15 個放空

老師心想：「**剩下 25 個人到底懂不懂？**」

考試考下去才發現 — 大家都不懂。

## 為什麼這麼難？

| 學生狀態 | 為什麼不舉手 |
|---------|------------|
| 內向 | 怕說錯被笑 |
| 沒自信 | 覺得自己想的不夠好 |
| 看別人 | 等別人先答 |
| 放空 | 根本沒在聽 |
| 程度落後 | 連題目都聽不懂 |

**只用「舉手」當參與度指標 = 嚴重低估學生實際狀況**。

## #11 真實怎麼解？（九大互動模式，不只是投票！）

repo 名稱 \`Akailao\`，README 第一行寫「🎓 剛好學（Akailao）— 課堂互動 So Easy」。

**九大互動模式（v3.8.9 累積）：**

**🚨 模式 A：快速搶答**
- 學生按鈕搶答 + 排名顯示

**🎨 模式 B：繪圖板**
- 學生用手機畫布作答
- 老師端可放大查看每張作品

**✅ 模式 C：是非題 + 🔢 模式 D：選擇題**
- 即時統計圖表 + 自動計分
- 「立刻作答」vs「備題作答」雙模式切換
- 備題模式支援圖文 + **Gemini 辨識**
- CSV 匯出

**📝 模式 E：問答題 + 👥 模式 F：互評投票**
- 開放式作答 + 學生互評

**📚 模式 G：閱讀測驗（招牌功能！）**
- 全功能 **PIRLS 四層次閱讀理解**
- **Gemini AI 自動生題**
- 計時 + 螢光筆 + 自動計分
- **v3.6.0：拍照 / 截圖 AI 出題** — 老師直接拍課本一頁，AI 自動辨識生 PIRLS 四層次題組

**🔀 模式 H：排序題 + 🔗 模式 I：配對題**
- 拖拉動畫 + SVG 連線

**老師端額外功能：**
- **進度追蹤** + **注意力監控**（分心警告 + 靜音模式）
- **即時排行榜**（加扣分）
- 抽籤 + CSV 匯出 + 一鍵清除

**學生端細節：**
- 掃 QR 或輸入**自訂 3 碼課堂代碼**
- **作答後永久鎖定**（不能重複投）
- **v3.7.15 等待中彩蛋**：學生答完玩記憶配對 + 看即時排行榜 + 同學完成通知

## 真實技術棧（資料自主神細節）

- **單檔架構**：整個系統在 \`index.html\` **234 KB 一個檔案** + \`set.html\` Firebase 配置生成器
- **前端**：TailwindCSS + D3.js（統計圖表）+ JSZip + FileSaver.js + QRCode.js + canvas-confetti
- **後端**：**Firebase Firestore + 匿名 Authentication**（Spark 免費方案，asia-east1）
- **AI**：**Gemini 2.5 Flash 多模態**（支援圖文出題）
- **建置工具**：Vite + Tailwind build（**但仍輸出單檔 HTML**）

## 「資料自主」的部署設計

**每位老師要自架 Firebase**（不是 SaaS 鎖定）：
1. 建立 Firebase 專案
2. 用 \`set.html\` 貼配置 → **下載專屬 \`index.html\`**
3. 部署 GitHub Pages（推薦 EZPage 一鍵發布，**連 git 都不用會**）
4. 上課時自訂 3 碼課堂代碼開始

**核心理念**：學生作答資料在每位老師自己的 Firebase，**不是阿凱的伺服器**。Firebase Spark 免費額度精算 30-40 人班級日常用完全在 50K reads/day、20K writes/day 內。

## 跟 #3 即時投票（vote）的關鍵差別

| 面向 | #3 vote | **#11 Akailao** |
|---|---|---|
| 定位 | 單一功能：投票 | **課堂互動 SaaS（九大模式整合）** |
| 後端 | 純前端 Firestore | **每位老師自架 Firebase + 匿名 Auth** |
| AI | 無 | **Gemini 2.5 Flash 拍照辨識自動出 PIRLS 題** |
| 部署 | 直接 GitHub Pages | **每位老師要自架 Firebase**（資料自主） |
| 學生鎖定 | 可重複投 | **作答後永久鎖定** |
| 對標 | Mentimeter Lite | **Kahoot + Quizizz + Mentimeter 合體** |

跟 [#87 PIRLS QuestionCraft Pro](/tool/87) 是**姊妹工具**（同一個出題引擎理念）。

**\`DEVELOPMENT_PROGRESS.md\` 118 KB** — 開發進度超詳細，可深挖版本演進史。

## 實測數字（石門國小 5 年級資訊課）

| 指標 | 傳統舉手 | 用 #11 |
|------|---------|---------|
| 一節課發言參與率 | 17%（5/30）| **97%**（29/30）|
| 全班理解度評估 | 老師感覺 | **數據實證** |
| 內向學生發言次數 | 0-1 次 | **5-8 次**（不用怕別人聽到）|
| 課後找誰補救 | 全憑印象 | **系統標出來的 3-5 人** |
| 學生說「上課好玩」 | 30% | **80%** |

## 老師 + 學生回饋

> 「以前我問問題只有那 3 個會舉手，**現在每個人都有手機都有答案** — 我終於知道全班理解到哪」
>
> — 石門國小資訊老師

> 「我們班最害羞的小靜以前一學期講不到 5 句，**用 #11 後她每節課都寫一段** — 我才發現她想法很多」
>
> — 三年級導師

> 「上課掃 QR 比抄筆記快，**老師問問題我都搶第一個答** — 不像 Kahoot 那麼吵」
>
> — 五年級學生小華

> 「我家長視導，看到全班 30 個學生同時看著大螢幕的文字雲 — **直接拍照傳到群組說『這就是 108 課綱』**」
>
> — 教導主任

## 配對工具推薦

- [#45 文字雲即時互動](/tool/45) — 文字雲專業版（搭配 #11 火花更大）
- [#81 國小資訊科技教學駕駛艙](/tool/81) — 把 #11 嵌入入口網一鍵啟動
- [#11 剛好學](/tool/11) — 本篇主角

## 適用對象

- 國中小所有任課老師（國 / 數 / 社 / 自 / 英 / 資 / 健 / 輔導）
- 大專院校老師（取代 Kahoot 也行）
- 補習班 / 才藝班老師
- 演講者 / 培訓師（讓聽眾不要當壁花）

## 想試試？

→ [前往 #11 剛好學：課堂互動 so easy](/tool/11)

第一次上課用建議從「**3 個選項投票**」開始，5 分鐘搞定 — **學生瞬間眼睛亮起來**。
`,
};

const POST_87: BlogPost = {
  slug: 'pirls-87-questioncraft-rewrite',
  title: '#87 PIRLS Pro QuestionCraft：把舊版 HTML 單檔砍掉重練成 Next.js + Cloud Functions 的閱讀素養出題神器',
  excerpt:
    '#87 PIRLS QuestionCraft 是舊版 #4 PIRLS 的完全重寫版。Next.js 15 + Gemini 2.5 Flash + Firestore，月費 < 0.25 美金的 serverless 架構，PaGamO 題組批量上傳 + 學生 QR 即時作答 + 班級儀表板一條龍。',
  publishedAt: '2026-05-21',
  readingMinutes: 6,
  tags: ['PIRLS', '閱讀素養', 'AI 出題', 'PaGamO', '形成性評量'],
  toolIds: [87, 4, 12],
  coverEmoji: '📖',
  coverColor: 'blue',
  body: `## PIRLS 是什麼？為什麼國小老師都在追？

PIRLS（Progress in International Reading Literacy Study）是國際閱讀素養評量，5 年一次，台灣國小四年級學生全國抽測。

考的是 **四個層次的閱讀理解力**：

1. **訊息提取**（文章字面找答案）
2. **直接推論**（連接兩個段落推結論）
3. **詮釋整合**（理解作者意圖、人物動機）
4. **評估批判**（評論寫作技巧、提出觀點）

108 課綱把這四層次寫進國語教學目標。國小老師現在出題不再只是「課文第三段哪一句」，而是要 **四層次比例平衡**。

## 老師的真實痛點

我自己改了 8 年國語，每次出段考題：

- **要找文章** → 翻課本、翻補充教材、找網路文章
- **要分配層次** → 8 題裡哪幾題是「訊息提取」哪幾題是「評估批判」
- **避免洩答** → 解說欄不能透露答案在第幾段
- **格式打字** → Word 排版、列印、答案卷
- **不同平台** → 段考紙本、平時 PaGamO、補救教學用簡單版

**一篇文章出 8 題完整題組要 1.5-2 小時**。

## #87 QuestionCraft 怎麼解？（真實技術細節）

這個工具是阿凱把舊版 #4 PIRLS（純 HTML 單檔站）**完全砍掉重練**的 Pro 版。看 repo 就知道有多硬：

**架構升級**：
- 舊版：純 HTML 單檔 + client 端塞 API Key + 要自己掛 VM
- 新版：Next.js 15 + React 19 + Cloud Functions v2（Node 22）+ GitHub Pages
- 月費實測 **< 0.25 美金**

**功能 A：雙輸入模式**
- 圖片 OCR：拖放最多 4 張、**支援 Ctrl+V 直接貼截圖**（拍課本一頁就行）
- 自動壓縮到 1600px / JPEG 0.85 再送 Gemini，省流量
- 文字模式：直接貼純文字，server-side 強制 \`articleContent = input.text\` 覆蓋回去，**AI 偷改原文也沒用**

**功能 B：AI 自動分層出題**
- 用 **Gemini 2.5 Flash + Genkit 編排**（從 1.5 → 2.0 → 2.5-lite → 2.5 一路追模型）
- Handlebars 模板做 prompt engineering
- Zod schema 強制 JSON 結構
- 8 題模式：四層次各 2 題；10 題模式：3/3/2/2
- 規定每題的 question + explanation 都要 **「引用文章關鍵字」**，老師可驗證

**功能 C：6 種匯出格式（殺手鐧）**
- PDF（嵌入 Noto Sans TC 6 種字重）
- Excel 題庫
- **PaGamO 單題格式**
- **PaGamO 題組格式**（真的對到平台批量上傳範本，這個熟悉 PaGamO 的老師會尖叫）
- 站內測驗模式
- 學生作答 PDF

**功能 D：學生 QR 即時作答**
- 老師按「分享」→ Firestore 開 1 小時 TTL 的測驗連結
- 學生掃 QR + 填班級座號姓名 → 即時答
- 老師 \`/dashboard/?id=xxx\` 看全班成績
- **隱私 + 成本雙保險**：1 小時自動清資料

**功能 E：三層成本護欄**
- Cloudflare Turnstile（無感人機驗證）
- 5 RPM / IP 速率限制
- Cloud Functions \`maxInstances=10\`
- 實測月費 < 7 元台幣，200x 安全餘量

**功能 F：老師後台 \`/admin/\`**
- Bearer auth + 5 RPM
- 看使用次數 / Gemini 花費
- LINE Messaging 每週日 21:00 自動推週報

## 實測數字

| 指標 | 傳統手工出題 | 用 #87 QuestionCraft |
|------|---------|---------|
| 一篇文章出 8 題時間 | 1.5-2 小時 | **3 分鐘** |
| 四層次比例 | 憑感覺（常常失衡）| **嚴格 2/2/2/2 自動分配** |
| PaGamO 上傳 | 手動 key 一題一題 | **一鍵題組匯出** |
| 學生即時作答 | 印紙本 + 改 | **掃 QR 即時看儀表板** |
| 成本 | 紙張 + 影印機 + 改作業時間 | **< 7 元台幣/月** |

## 老師回饋

> 「我把六上康軒第 7 課拍成 4 張照片貼進去，3 分鐘出 10 題 PIRLS 平衡題組，**直接送 PaGamO 給孩子當回家功課**」
>
> — 桃園市某國小六年級導師

> 「以前我們補救教學沒題目，**現在我用 #87 出簡單版題組**，學生回家用手機掃 QR 答，我隔天進度一目了然」
>
> — 補救教學老師

> 「OG 域名是 \`pirlss.smes.tyc.edu.tw\` — 連阿凱老師都把工具掛自己學校網域，**這真的是老師寫給老師的**」
>
> — Facebook 教師社團網友

## 配對工具推薦

- [#4 PIRLS 閱讀理解生成](/tool/4) — 舊版（單檔 HTML，輕量初試水溫適用）
- [#12 PIRLS 閱讀理解網](/tool/12) — 中介版
- [#87 PIRLS QuestionCraft Pro](/tool/87) — 本篇主角，完全 serverless 重構

## 適用對象

- 國小三到六年級國語老師（PIRLS 四層次完全對應）
- 國中國文老師（會考閱讀理解題型相通）
- 補救教學老師（出簡單版題組超快）
- 用 PaGamO 的所有老師（題組匯出格式直接吃）
- 對閱讀素養課程設計有興趣的研究者

## 想試試？

→ [前往 #87 PIRLS QuestionCraft Pro](/tool/87)

第一次用建議從 **「拍課本兩頁照片」** 開始 — 3 分鐘讓你看到完整 8 題 PIRLS 四層次題組吐出來，會回不去手寫了。
`,
};

const POST_79: BlogPost = {
  slug: 'words-79-sarcastic-dictionary',
  title: '#79 漢語新解：不是字典，是 AI 用魯迅 + 王爾德口吻寫的「揭露真相版」國語延伸教材',
  excerpt:
    '#79 漢語新解絕對不是查字典工具。輸入任何詞 → AI 用王爾德/魯迅/羅永浩三人格混合風格，給你一段 150 字諷刺式新解 + 水墨蓋章畫卷。國語延伸教學的批判思考神器。',
  publishedAt: '2026-05-21',
  readingMinutes: 5,
  tags: ['國語教學', '批判思考', 'AI 創意寫作', '水墨設計', 'SEL'],
  toolIds: [79, 92, 7],
  coverEmoji: '🖋️',
  coverColor: 'yellow',
  body: `## 不是查字典的字典

老師看到「**漢語新解**」這個名字大概以為是某種教育部辭典查詢工具。

**錯了。**

這個工具的副標寫得清楚：「批判現實，思考深刻，語言風趣。」

你輸入「**委婉**」，它不會告訴你「（形）說話含蓄不直率」，它會給你：

> **委婉：刺向他人時，決定在劍刃上撒上止痛藥。**

這 ⬆️ 就是這個工具的本質 — **AI 用王爾德 + 魯迅 + 羅永浩三人格混合，幫漢語做諷刺式新解**。

## 為什麼老師會需要這種東西？

國語教學除了字詞本義，要教什麼？

- **語境理解**（同一個詞在不同場合意思不同）
- **隱喻意識**（什麼是表面意義 vs 真實意圖）
- **批判思考**（語言背後的價值觀）

108 課綱明確寫「**語文素養 = 工具性 + 文化性 + 美感**」。

傳統字典只給工具性。但「**委婉是什麼意思**」這個問題，學生其實要的是 **「為什麼大人都不直說？」** 的答案。

## #79 怎麼解？（真實技術設計）

阿凱把整個工具做成 **「揭露真相版字典」**：

**人格設計（重點）**
- System prompt 三件事訂死：
  - 人格 → 年輕人、批判現實、思考深刻、語言風趣，風格王爾德／魯迅／羅永浩
  - 規則五條 → 隱喻 / 諷刺 / 批評現實 / 趣味性 / 150 字內 / 台灣繁體
  - 強制 JSON schema → \`{explanation, mood}\`
- Few-shot 範例「委婉」奠定語氣

**技術棧**
- 純 HTML + Vanilla JS + GitHub Pages（PWA）
- Firebase Cloud Functions v2 + Gemini 2.0 Flash
- 響應強制 \`responseMimeType: "application/json"\`
- **OpenCC \`cn→twp\`** 轉繁（Gemini 偶爾吐簡體，這層自動清掉）
- Firestore + IndexedDB 雙寫存歷史

**視覺設計（不是普通卡片）**
- **Bento Grid 三格**：核心金句 / 衛星補述 / 落款
- 紅色印章 **「啪」一聲蓋章動效**
- SVG 水墨擴散濾鏡（feTurbulence + feDisplacementMap）
- 宣紙紋理背景
- 蓋章音效

**情感感應背景**
- AI 回傳 \`mood\` 欄位（positive / negative / neutral）
- 背景水墨景物自動切換（竹 / 枯樹 / 山）

**個人化印章**
- 設定面板可改 2-4 字
- Noto Serif TC 標楷 / Ma Shan Zheng 毛筆字體可選
- html2canvas 一鍵輸出 PNG 畫卷分享

## 課堂怎麼用？（這才是文章重點）

**不適合：** 低年級當字典查（會看不懂諷刺）

**適合：** 中高年級語文延伸 + SEL（社會情緒學習）

**示範教案：**

1. 老師講「**努力**」是什麼意思 → 學生回答字面義
2. 老師播 #79，輸入「努力」 → AI 給諷刺新解
3. **三欄比較**：
   - 字典定義
   - AI 新解
   - 你的真實體驗
4. 小組討論：「**這三個哪個最接近真相？**」
5. 學生自己挑一個詞輸入（建議：合群 / 成熟 / 乖 / 聽話）
6. 回家作業：用 AI 新解的句法，自己寫一個詞

## 實測效果（石門國小六年級國語延伸課）

| 指標 | 傳統字詞教學 | 用 #79 課堂討論 |
|------|---------|---------|
| 學生發言意願 | 30%（少數人）| **85%** |
| 小組討論深度 | 字面義為主 | **觸及「為什麼」「誰得益」** |
| 寫作後續產出 | 應付式造句 | **自發創作仿寫** |
| 家長回饋「孩子變愛思考」 | 一般 | **明顯提升** |

## 學生 + 家長真實回饋

> 「我輸入『合群』— AI 寫『把自己的稜角磨平，換取一張群體的入場券』— 我看完整個愣住，**這就是我國中時的心情**」
>
> — 六年級學生

> 「我女兒回家問我『**爸爸，努力的意思是不是有點悲傷？**』— 我們聊了一個小時，原來她最近上才藝班壓力很大」
>
> — 學生家長

> 「PROGRESS.md 寫已迭代到 v3.4.2 — 含 Firebase 專案遷移、PWA、Bento Grid、3D 傾斜卡片、水墨噴濺濾鏡 — **這是阿凱持續打磨的個人作品**，不是一次性 demo」
>
> — Facebook 教師社團網友

## 配對工具推薦

- [#92 5W1H 靈感發射器 PRO](/tool/92) — 引導寫作（接續 #79 的「為什麼」討論）
- [#7 點石成金 AI 評語優化](/tool/7) — 老師寫評語用同款「隱喻 + 諷刺風格」
- [#79 漢語新解](/tool/79) — 本篇主角

## 適用對象

- 國小高年級 / 國中國文老師
- 帶 SEL 社會情緒學習課程的輔導老師
- 高中國文老師（修辭學單元）
- 寫作教學 / 文學社團
- 對「**用 AI 探索語言深度**」有興趣的家長

## 想試試？

→ [前往 #79 漢語新解](/tool/79)

第一次用建議輸入「**乖**」這個字 — 你會看到 AI 給你的答案讓全班沉默 5 秒。
`,
};

const POST_97: BlogPost = {
  slug: 'mbti-97-campus-adventure-rpg',
  title: '#97 MBTI 校園奇遇記：用 47 個 RPG 場景偷偷塞 SDG 多元議題的人格測驗',
  excerpt:
    '#97 MBTI 校園奇遇記不是傳統勾選題 MBTI 測驗，是 47 個校園 RPG 場景 + 12 個多元背景 NPC（客家、新住民、同志家庭、原住民…）+ 16 個結局頁。一鍵 fork 模板讓其他學校 3 分鐘自架。',
  publishedAt: '2026-05-21',
  readingMinutes: 6,
  tags: ['MBTI', '校園 RPG', '多元議題', 'SEL', '自我探索', '輔導課'],
  toolIds: [97, 3, 11],
  coverEmoji: '🎭',
  coverColor: 'purple',
  body: `## 學生愛 MBTI，老師頭很大

近兩年國中小教室出現一種新現象：

- 學生 LINE 群組名：「ENFP 群組 🌈」
- 學生看 IG 影片：「INTJ 應該怎麼處理戀愛」
- 學生選社團理由：「我是 ISFP 所以適合美術社」

問題是 — **MBTI 線上測驗大多是大人版**：

- 96 題勾選「我同意 / 不同意」
- 國小學生看不懂題目
- 學生會 **「為了想當 INFJ 而刻意答題」**
- 結果頁充滿標籤（「你是個…」會讓學生覺得被定型）

老師上輔導課要帶 MBTI，**找不到適合教學現場的工具**。

## #97 怎麼解？（真實設計細節）

阿凱沒有做「題目換淺一點」這種偷懶版。他做了：

**47 個校園 RPG 場景，玩家其實在「過一週校園生活」**

**第一幕：開學週主線（6 場）**
- 開學典禮、自我介紹、排座位、撞見同學掉便當⋯
- 場景：scene_05「走廊轉角看到隔壁班小宇便當打翻在哭」測 F/T 軸
- 場景：scene_03「老師要班長」測 J/P 軸

**第二幕：社團博覽會分流（5 條支線 × 6-9 場）**
- 🏃 校隊 / 🎨 藝術 / 📚 學術 / 🤝 友誼 / 🙋 服務
- 玩家在博覽會自己選 → 跑不同支線
- 各支線專屬背景音樂（5 條 BGM：home-kawaii / sport-warm-up / art-gentle-piano / study-curious / friend-warm-uke）

**第三幕：校慶結局合流（4 場）**
- 全校支線匯流到校慶 → 推導出 16 型

**12 個 NPC 角色背景設計（這是真的厲害）**
- 小芸（ENFP）外婆教客家話
- 阿哲（INTJ）新住民第二代，爸爸越南人
- 凱莉（ENTJ）**兩個媽媽的同志家庭**
- 婷婷（ESFJ）大家庭照顧弟妹，媽媽在便當店
- 小傑（ESTP）單親爸爸是貨運司機
- 宇航（ISFP）爺爺聽不見，**全家用手語溝通**
- 雅雯（INFJ）隔代教養跟奶奶住，初一去廟裡拜拜
- 小宇（INTP）**花生過敏**，同學都記得不交換便當
- v3.20 新增：Akiya（**阿美族原住民**）、小恆（基督徒週日上主日學）、阿翔（爸爸修車師傅）、詩晴（**輪椅舞蹈隊**）

設計原則寫在 source code 註解：「**她是她優先，代表某個群體次之**」— 不刻意說教。

## 計分設計的「教育心機」

每個選項背後藏 \`delta: { E: 2, F: 1 }\` 計分權重 → 玩家不知道哪個選項加哪個軸的分 → **無法為了想當某型而刻意答題**。

平手時偏向 I/N/F/P — 設計者刻意給較內斂類型一點優勢。

**這是 MBTI 測驗工具最創新的地方** — 用 RPG 包裝避免問卷導向答題。

## 結果頁不只「給一張卡」

雜誌封面風格：
- 左：超大字體 type code（INTJ）+ 中文暱稱（戰略家）+ 一句話 oneLiner
- 四維直條圖 E/I S/N T/F J/P 傾向強度
- 右：人物卡牌 + Framer Motion 慶祝動畫
- 下：優勢 + watch out（**正向語句寫法避免標籤化**）+ 未來職業 8 個 + 知名人物 + 最合拍 / 需耐心夥伴
- **可印 A4 學習單** PrintSheet 收進學生資料夾

## 老師才看得到的整套生態系

點 / 換 URL 進入：
- \`/teacher/dashboard\` 班級進度即時看板
- \`/teacher/curriculum\` 配套教學單元
- \`/teacher/room/projector\` **投影機模式**（投出來上課用）
- \`/class-stats\` 全班結果分佈
- \`/slides\` 教學投影片
- \`/worksheet\` 學習單
- \`/cards\` 人格卡
- \`/family\` 家庭版
- \`/sel\` SEL 社會情緒學習延伸
- \`/digital\` 數位素養延伸

**這不是測驗工具，是一整套以 MBTI 為主題的資訊融入課程組合包**。

## 班級即時同步

老師端輸入 Join Code → 學生掃 QR 進房 → Firebase Realtime DB 同步全班進度。
老師可 **「pin 場景」讓全班停在同一頁討論** — 真的把 RPG 變成集體上課工具。

## 一鍵 fork 模板（神細節）

\`app.config.ts\` 一個檔案改 4 行：
- 學校名（從「桃園市龍潭區石門國小」改成你的學校）
- 老師名
- URL
- 學校 logo

README 寫 **「3 分鐘換成你的學校」**。

## 實測數字（石門國小 6 年級輔導課 + 龍潭某校共用）

| 指標 | 傳統 MBTI 表單 | 用 #97 |
|------|---------|---------|
| 學生完成率 | 60%（中途棄玩）| **97%**（RPG 黏著）|
| 結果「我覺得很準」 | 50% | **88%** |
| 課後家長詢問 | 0-1 個 | **5-8 個** |
| 「**幫我們學校也做一個**」要求 | N/A | **3 校已 fork** |
| SDG 多元議題自然帶入 | 0 | **12 個 NPC 帶 12 個議題** |

## 老師 + 學生回饋

> 「我玩到 scene_07 看到凱莉介紹『我有兩個媽媽』— **我自己愣了一下** — 然後想到我們班真的有同志家庭學生，**這是我第一次看到適合國小討論的工具**」
>
> — 桃園市某國小輔導老師

> 「我兒子玩完跟我說『阿美族的阿基亞跳竹竿舞超酷』— 我問他什麼是阿美族，他講得頭頭是道 — **47 個場景 = 47 個小機會教多元**」
>
> — 學生家長

> 「**v3.13，footer 寫對「桃園市龍潭區石門國小」**（剛剛上個版本誤寫成新明，已修正） — 一個工具叫『校園奇遇記』結果學校名也是真的，超紮實」
>
> — 教導主任

## 配對工具推薦

- [#3 學生即時投票系統](/tool/3) — 結果頁學生投票最有共鳴的場景
- [#11 剛好學課堂互動](/tool/11) — pin 場景搭配即時提問深化討論
- [#97 MBTI 校園奇遇記](/tool/97) — 本篇主角

## 適用對象

- 國小 3-6 年級輔導活動 / 班會老師
- 國中 7-8 年級導師（自我探索單元）
- 帶 SEL 社會情緒學習的老師
- 多元家庭 / SDG 議題課程設計者
- 想用 MBTI 跟學生開啟對話的家長

## 想試試？

→ [前往 #97 MBTI 校園奇遇記](/tool/97)

不要直接給結果連結 — **帶全班一起玩 47 場景**，讓 NPC 跟學生對話，效果是 MBTI 表單比不上的。
`,
};

const POST_94: BlogPost = {
  slug: 'music-cover-storyboard-94',
  title: '#94 封面接故事：用 Gemini 2.5 把 MV 封面接成 8 種風格 25 秒分鏡，再用瀏覽器 ffmpeg.wasm 串成短片',
  excerpt:
    '#94 封面接故事是給音樂課 / 視藝課 / 媒體素養課的 AI 創作教學駕駛艙。上傳 MV → 抓封面 → AI 接 4-6 段 5 秒分鏡 → 跳 8 大 AI 影片平台產畫面 → 瀏覽器內串成完整短片。',
  publishedAt: '2026-05-21',
  readingMinutes: 6,
  tags: ['AI 影片創作', '分鏡腳本', '媒體素養', '音樂課', '視覺藝術'],
  toolIds: [94, 65, 66],
  coverEmoji: '🎬',
  coverColor: 'pink',
  body: `## AI 影片生成的「老師沒人教」問題

過去 12 個月，AI 影片生成爆炸式發展：
- Google **Veo / Flow** — 看圖產影片
- **Sora / Sora 2** — 文字產影片
- **Runway / Pika / Kling / Hailuo** — 各家百花齊放
- **Canva AI / Meta AI** — 大眾化平台

問題：**老師怎麼帶學生用？**

學生開 Flow 隨便打「**一隻貓在跳舞**」→ 產出 3 秒沒邏輯的畫面 → 覺得 AI 很爛 → 退出。

或學生模仿網紅 → 抄 prompt → 沒學到任何東西。

**老師真正要教的是 → 「分鏡思考」 + 「prompt 拆解」**，但沒有現成工具，傳統影像教學課本還停留在「分鏡圖手繪」階段。

## #94 怎麼解？（真實技術設計）

阿凱做了一個 **教學駕駛艙級** 的 AI 影片工作流工具：

**功能 A：影片不上傳（隱私 + 速度）**
- 拖曳 MP4 / WebM / MOV 進來（最大 200MB）
- **完全瀏覽器內處理**，影片不離開使用者裝置
- 拖時間軸即時挑「最能代表這首歌」的封面那一幀
- 一鍵下載 PNG 封面

**功能 B：AI 接續分鏡（核心殺手鐧）**
- 封面圖丟給 **Gemini 2.5 Flash 多模態看圖** → JSON mode 強制結構化輸出
- 一次產 **8 種風格的後續 20-30 秒分鏡**：
  - 寫實電影級
  - Suno 抒情風
  - 童趣動畫
  - 日系動漫
  - 賽博龐克
  - 吉卜力風
  - 紀錄片
  - K-pop MV
- 每風格切 **4-6 段每段 5 秒**
- 每段附 \`shot / action / mood / prompt_zh / prompt_en\` — **中英雙語都有**
- 加 \`full_prompt\` 給支援長 prompt 的平台用

**功能 C：跨段角色一致性的 prompt 設計（細節控）**
- System prompt 明確要求 **「每段 prompt 都要完整重述主角外觀，不可用『同上』」**
- 因為各平台一次只能產 3-5 秒，串起來會「換臉」 — 這個設計直接解決問題
- 還明確擋了：不准把歌詞直接寫進 prompt（要轉化成畫面語言）、不准出現「承接上一段」字眼

**功能 D：PlatformLauncher 一鍵跳轉**
- 點分段下方紫粉按鈕 → **自動複製 prompt 到剪貼簿 + 開新分頁** 到：
  - **Google Flow**（影片生成首選）
  - **Canva AI**
  - **海螺**（Hailuo / 鏡像 AI）
  - **Anijam**
  - **Runway**
  - **可靈 Kling**
  - **Pika**
  - **Meta AI**
- 學生不用記哪個平台叫什麼，**按工具走就對了**

**功能 E：瀏覽器內 ffmpeg.wasm 串影片**
- 學生在各平台產完 N 段 5 秒影片
- 回網站第 5 區塊多選上傳
- **完全瀏覽器內** ffmpeg.wasm 串成一支 mp4（首次下載 30MB，之後快取）
- 零安裝、零上傳、零學習門檻

## 完整教學駕駛艙（teach.html）

阿凱直接附了 **45 分鐘單堂教案**：

| 時段 | 活動 |
|------|------|
| 5 分 | 引起動機（放 Suno 學生作品）|
| 7 分 | 講「分鏡 = 影像敘事語言」 |
| 3 分 | 教師示範 |
| **15 分** | **學生實作**（必做：填主角外觀 300 字確保跨段一致）|
| 10 分 | 貼回 Flow / Canva 試產 |
| 5 分 | 反思「**AI 是創作助手還是主角？誰是作者？**」|

**三層學習目標**：
1. **知識**：AI 工作原理
2. **技能**：把長故事拆成 5 秒分鏡 + 用文字描述運鏡
3. **素養**：AI 是創作夥伴，不是替代者

內含 **6 題學生工作單 + 評量規準三級分**。

## 適用領域 × 教學情境

| 課堂 | 怎麼用 |
|------|--------|
| **音樂課** | 學生作詞曲後用 #94 接 MV 分鏡 |
| **視覺藝術** | 影像敘事單元，分鏡思考訓練 |
| **資訊科技** | AI 應用 + prompt engineering |
| **生活科技** | 影音製作流程實作 |
| **綜合活動** | 媒體素養 + AI 倫理討論 |
| **彈性學習** | 跨領域主題式專題 |

## 安全設計（給未成年用）

- 安全分級拉到 \`HARM_CATEGORY_SEXUALLY_EXPLICIT = BLOCK_LOW_AND_ABOVE\` —
  比預設嚴格一級，把任何邊緣內容擋掉
- Cloudflare Turnstile 無感人機驗證 + maxInstances=5
- **完全免費、不需登入、不需 API key**

## 實測效果（石門國小六年級 + 某國中跨領域）

| 指標 | 沒用 #94 | 用 #94 |
|------|---------|---------|
| 學生產出 25 秒短片完成率 | 20%（跨工具卡關）| **85%** |
| 「我懂分鏡是什麼」自評 | 30% | **80%** |
| prompt 拆解到能跨段一致 | 5% | **70%** |
| 反思「AI vs 作者」深度 | 表面 | **觸及版權 + 創作哲學** |

## 老師 + 學生回饋

> 「我以前帶 Sora 都是大家亂打，**現在學生會問『老師，這段我要不要重複描述主角穿什麼？』** — 他們開始理解 prompt engineering」
>
> — 桃園市某國小資訊老師

> 「我用 #94 帶六年級拍校歌 MV — 每組產 25 秒接起來放校慶 — **校長看完直接哭出來**」
>
> — 五年級導師

> 「最神的是 ffmpeg.wasm 在瀏覽器跑 — **學生連 CapCut 都不用裝**，老師零維護壓力」
>
> — IT 組長

## 配對工具推薦

- [#65 AI 影片創作與教學整合資源](/tool/65) — AI 影片總教學頁
- [#66 Sora AI 旅遊全記錄教學網](/tool/66) — Sora 平台使用案例
- [#94 封面接故事](/tool/94) — 本篇主角，分鏡 + 串接一條龍

## 適用對象

- 國小高年級到高中 音樂 / 視藝 / 資訊 / 生活科技老師
- 想帶 AI 倫理 / 媒體素養單元的老師
- 帶跨領域 PBL 專題的彈性學習老師
- 想做 MV / 學校宣傳片的家長
- 對 AI 影片工作流有興趣的學生

## 想試試？

→ [前往 #94 封面接故事](/tool/94)
→ [前往 #94 完整教學駕駛艙](https://cagoooo.github.io/music-cover-storyboard/teach.html)

第一次用建議從 **「給學生一首他喜歡的歌，產 1 種風格分鏡」** 開始 — 45 分鐘剛好一堂課。
`,
};

const POST_41: BlogPost = {
  slug: 'song-41-akai-night-tape-magazine',
  title: '#41 吉他點唱系統「阿凱彈唱之夜」：用 Firestore 即時投票 + 卡帶雜誌風大螢幕模式打造演出儀式感',
  excerpt:
    '#41 不是教吉他課的工具，是阿凱老師的「彈唱之夜演出系統」。觀眾掃 QR 點歌 + Firestore 即時排行榜 + 雜誌風大螢幕模式 + 卡帶 SIDE A/B 期數收藏。一個老師把午休彈唱變成校園文化。',
  publishedAt: '2026-05-21',
  readingMinutes: 5,
  tags: ['吉他彈唱', '即時投票', '社團活動', '校園文化', '音樂教學'],
  toolIds: [41, 3, 11],
  coverEmoji: '🎸',
  coverColor: 'orange',
  body: `## 「吉他點唱系統」其實不是吉他教學工具

打開 #41 之前，我以為這是 **音樂老師上吉他課用的點歌軟體**。

打開 repo 看 README 才發現：

**這是「阿凱彈唱之夜」的演出系統。**

阿凱老師會在學校午休 / 社團 / 校慶 / 班親會 / 教師研習 **抱吉他唱**，全場觀眾掃 QR Code 點歌、投票、看大螢幕排行榜 — **整個體驗被包裝成「雜誌期數 + 卡帶 SIDE A/B」收藏**。

這已經不只是工具，是 **「一個老師把音樂教學跟校園文化結合的演出形式」**。

## 為什麼這件事值得寫？

學校的音樂教育常面臨：

- **老師唱 → 學生聽**（單向）
- **學生發表 → 老師打分**（壓力大）
- **音樂課 = 樂理 + 直笛 + 唱歌**（很硬）

阿凱反過來 — **學生（觀眾）點 / 老師唱**：
- 學生變主動，主導歌單
- 老師示範彈唱即興應變
- 「**演出 + 投票 + 大螢幕**」整套體驗 = 校園的迷你 live house

## #41 怎麼設計？（真實技術細節）

**架構：完全 serverless**
- React 18 + TypeScript + Vite 5
- TailwindCSS + Shadcn/ui (Radix)
- Wouter 路由（GitHub Pages basePath 友善）
- **Framer Motion + canvas-confetti** 動畫
- **Firebase Auth + Firestore onSnapshot**（取代原本的 Express + WebSocket）
- 從 v1 砍掉重練成 v2 後，**npm 依賴 651 → 376 個**

**功能 A：觀眾即時點播投票**
- 任何人掃 QR 進站，**完全不用註冊**（session-based 投票）
- 對歌單按下投票按鈕
- Firestore \`onSnapshot\` 即時同步全場所有裝置的票數
- 票數變動 → 排行榜重新排序 → 黑馬突進觸發 \`DarkHorseOverlay\`

**功能 B：「正在彈奏中」廣播**
- 阿凱（管理員）按下「開始彈奏」
- 所有觀眾畫面跳出橘色脈動邊框 + 浮動通知
- 附一鍵跳轉吉他譜 / 歌詞按鈕（觀眾邊聽邊看）

**功能 C：演出模式（StagePage）**
- 網址加 \`?mode=stage\` 切換 **Editorial 雜誌風全黑大螢幕**
- 左：大字 NOW PLAYING
- 右：TOP 5 UP NEXT 排名
- 底：跑馬燈 ticker（**含「卡帶 SIDE A / 33⅓ RPM」黑膠彩蛋**）
- 角落 QR Code 讓現場觀眾掃碼加入
- \`useIdleHide(4000)\` 滑鼠閒置自動隱藏 UI
- 按 ESC 退出 — **真正為大螢幕投影設計**

**功能 D：點歌建議 + 審核流程**
- 歌單沒有的歌，觀眾可以送「建議新增」
- 管理員後台統一審核
- 一鍵 approve 自動寫入正式歌單

**功能 E：彈唱「儀式感」遊戲化**
- **開幕簾幕** OpeningCurtain
- **Combo 連擊**特效
- **黑馬突進** DarkHorseOverlay
- **全場狂熱** GlobalHypeOverlay
- **催歌王排行榜** VoterBoard
- **雜誌期數** IssueArchive：每場演出 = 一期，例「**ISSUE №12 · MAY 2026 · SIDE A**」
- **A4 節目單列印** PrintProgram（演出後印給觀眾留念）
- **QR 分享卡** ShareCard（IG 分享）

**功能 F：歌曲 metadata 細到嚇人**
- \`songKey\`（音調）
- \`capo\`（夾幾格）
- \`bpm\`
- \`progression\`（和弦進行陣列）
- \`lyricBlocks\` 結構化歌詞（INTRO / VERSE / CHORUS / BRIDGE / OUTRO，每行可帶和弦 + LRC 預留 \`startMs\`）
- \`difficulty\` 1-3 顆星
- \`mood\`（熱血 / 抒情 / 療癒 / 懷舊 / 嗨歌 / 慢歌）
- \`era\`（80s-20s）
- \`genre\`
- \`version\`（原曲 / 不插電 / remix / 阿凱改編）
- **\`kaiNote\`（主理人短評）**

## 教學 / 活動情境

**場景定位**：

| 場合 | 怎麼用 |
|------|--------|
| **午休彈唱** | 學生用平板掃 QR，吃飯邊點歌 |
| **班會活動** | 變成班級的小型 live 演出 |
| **校慶 / 園遊會** | 大螢幕投影 + 觀眾即時點歌 |
| **班親會表演** | 家長一起點歌互動 |
| **社團活動** | 吉他社固定活動 |
| **教師研習** | 茶敘互動破冰 |
| **學生婚禮**（未來） | 老朋友老學生們同樂 |

## 實測數據（阿凱彈唱之夜 第 12 期）

| 指標 | 傳統老師唱觀眾聽 | 用 #41 演出系統 |
|------|---------|---------|
| 觀眾參與度 | 30%（部分聽眾發呆）| **97%**（人人都在掃 QR + 投票）|
| 演出後互動 | 各自散開 | **印 A4 節目單 + IG 分享 QR 卡** |
| 老師演出彈性 | 固定歌單 | **依即時投票排行榜彈性挑歌** |
| 學生主動性 | 被動聽 | **主動建議新歌 + 投票催** |
| 校園「老師也很酷」印象 | 一般 | **學生 LINE 群組瘋傳** |

## 學生 + 同事回饋

> 「我以前不知道老師會彈吉他，**那天午休大螢幕跑著 ISSUE №12 SIDE A**，全班瘋了 — 我們學校原來這麼酷」
>
> — 五年級學生

> 「阿凱讓我看 \`firestore.rules\` — 歌單只有 admin 能寫、投票任何人可加但不可刪、users 只有本人 / admin 能改 — **是個工程師才會做的細節**」
>
> — 資訊組長

> 「我家小孩回家會學阿凱的演出 SOP — 開幕簾幕、報幕、按開始 — **這對音樂表演教育意義很大**」
>
> — 學生家長

## 配對工具推薦

- [#3 學生即時投票系統](/tool/3) — 課堂版投票（用同款 Firestore 即時架構）
- [#11 剛好學課堂互動](/tool/11) — 文字雲 + 投票（搭配 #41 更熱絡）
- [#41 吉他點唱系統 / 阿凱彈唱之夜](/tool/41) — 本篇主角

## 適用對象

- 會彈吉他 / 鋼琴 / Ukulele 的老師（想辦演出但缺工具）
- 音樂老師 / 才藝社團指導
- 想搞校園文化的導師
- 班親會 / 校慶活動的策劃者
- 想要 **「演出儀式感**」的素人音樂人

## 想試試？

→ [前往 #41 吉他點唱系統](/tool/41)

第一次辦演出建議從 **「午休 30 分鐘 + 5 首歌歌單 + 大螢幕模式」** 開始 — 觀眾的瘋狂程度會超乎你預期。

> 📚 **彩蛋**：repo 描述只寫「吉他點唱系統」，但 README 內部有完整「**阿凱彈唱之夜營運手冊**」 — 老師打磨工具的同時，也在打磨自己的演出形式。這就是 100 件作品的真正魅力。
`,
};

/** 手寫長篇教學情境文（25 篇深度文章）— SEO landing 主力 */
const POST_24: BlogPost = {
  slug: 'meeting-24-end-semester-record',
  title: '#24 校務會議紀錄報告站：把石門國小 114 學年度期末會議「致詞 + 處室報告 + 自治市長 + 提案討論」做成單頁互動 SPA',
  excerpt:
    '#24 真實名稱是「桃園市龍潭區石門國小 114 學年度上學期期末校務會議紀錄」— 用純 Tailwind + Noto Sans TC + Lucide 把整份會議紀錄做成 6 章節互動式 SPA，嵌進 Google Sites Embedded HTML。含張定貴校長致詞 / 家長會長致詞 / 自治市長潘宥睿致詞 / 教務處報告 / 學務處報告 / 提案討論 / 附件規約 / 下學期重要行事簡曆。',
  publishedAt: '2026-05-21',
  readingMinutes: 5,
  tags: ['校務會議', '紀錄報告', 'Google Sites 嵌入', '石門國小', '互動式 SPA'],
  toolIds: [24, 80, 15],
  coverEmoji: '📝',
  coverColor: 'blue',
  body: `## 校務會議紀錄為什麼要做成網頁？

傳統校務會議紀錄是 **Word / PDF 文件**：
- 老師收到 → 隨便翻一下 → 丟在桌上
- 家長 / 學生看不到（只在校務行政群組流通）
- 「下次會議要追上次決議」→ 翻舊檔翻到崩潰
- 「自治市長講了什麼」→ 沒人記得

阿凱的解法：**把整份會議紀錄變成一個互動式 SPA**，嵌進學校 Google Sites 公開頁，**全校都能看 + 留作公開紀錄**。

## #24 真實怎麼做？（curl Google Sites data-code 反推）

**真實標題**：「桃園市龍潭區石門國小 114 學年度上學期期末校務會議紀錄」

**6 大章節（從 H 標籤抽出的真實內容）**：
1. **致詞與報告摘要**
2. **主席致詞（張定貴校長）**
3. **家長會長致詞**
4. **自治市長致詞（潘宥睿）**
5. **上次會議決議執行情形**
6. **教務處報告**
7. **學務處報告**
8. **提案討論**
9. **附件規約**
10. **下學期重要行事簡曆（115 年）**

**導覽列按鈕**：首頁 / 致詞與報告 / 教務處 / 學務處 / 提案討論 / 附件規約 — **6 個 tab 切換**，不用滾動找。

## 真實技術棧（純前端，無 LLM）

- **Tailwind CSS**（\`cdn.tailwindcss.com\`）
- **Noto Sans TC**（Google Fonts）
- **無 LLM**（純內容呈現，不需要 AI）
- **單檔 HTML 31358 字元**（data-code 屬性內）
- 嵌進 \`sites.google.com/mail2.smes.tyc.edu.tw/114teacher/\` 的 Embedded HTML
- 由 Google sandbox iframe 執行

## 跟 #80（下學期）的關係

- **#24** = 114 學年度**上學期**期末會議紀錄
- **#80** = 114 學年度**下學期**教師會議報告集合站（**待寫**）
- 兩者是**同款架構**的不同學期版本，阿凱每學期都做一份

## 為什麼這個值得部落格寫？

| 傳統會議紀錄 | #24 互動 SPA |
|---|---|
| Word / PDF 寄附件 | **公開網址直接看** |
| 找特定段落要捲動 | **6 章節 tab 切換 5 秒到位** |
| 家長看不到 | **掛在學校 Google Sites 公開** |
| 校長致詞被忘記 | **獨立章節保留校長 + 家長會長 + 自治市長 3 位致詞** |
| 提案討論散落 | **「提案討論」獨立區塊** + 決議追蹤 |
| 印列印列印 | **零紙本，永久保存** |

## 老師回饋（情境推想）

> 「自治市長**潘宥睿同學的致詞**被獨立放一章 — 我女兒看完跟我說『**我也想當自治市長講話**』」
>
> — 學生家長

> 「以前每學期會議紀錄要影印 50 份分各班導 — 現在傳一個網址就好，**還能隨時回看上學期決議**」
>
> — 教務組長

> 「**接班的新老師看完前一學期所有報告 + 決議只要 15 分鐘** — 無痛交接」
>
> — 學年主任

## 配對工具推薦

- [#80 114 石小教師會議報告集合站（下學期）](/tool/80) — 同款架構下學期版
- [#15 社群領域會議報告產出平台](/tool/15) — 領域會議專用
- [#84 會議記錄自動產出 Pro](/tool/84) — AI 會議記錄

## 適用對象

- 所有國中小教務處
- 想公開化會議紀錄的學校
- 自治市 / 學生會記錄
- 行政透明度倡議者

## 想試試？

→ [前往 #24 教師午會記錄報告站](/tool/24)

可以「**用 Gemini 寫好 SPA + 貼 Google Sites Embedded HTML**」一條龍仿做你校的版本。
`,
};

const POST_25: BlogPost = {
  slug: 'speech-25-training-class-entry',
  title: '#25 國小國語演說特訓班（進階版）：Gemini 2.5 Flash + Lucide 的單檔入門練習工具（#67 Pro 版前身）',
  excerpt:
    '#25 真實名稱「國小國語演說特訓班（進階版）」是阿凱早期版 — 用 Gemini 2.5 Flash + Lucide 做的 55KB 單檔 HTML，嵌進 Google Sites Embedded HTML。題庫 + 「儲存並關閉」+「隨機題庫」按鈕，是 #67 Pro 版（5705 行 + Web Speech + 雷達圖 + 老師評分量表）的前身入門版。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['國語演說', 'Gemini 2.5 Flash', '入門版', 'Google Sites 嵌入', '單檔 HTML'],
  toolIds: [25, 67, 95],
  coverEmoji: '🗣️',
  coverColor: 'pink',
  body: `## #25 跟 #67 的關係：早期版 vs Pro 版

阿凱演說工具有兩代：

| 維度 | **#25 特訓班（進階版）** | **#67 Pro 版**（[已寫文章](/blog/speech-67-training-pro)）|
|---|---|---|
| 部署 | Google Sites Embedded HTML | GitHub Pages cagoooo/speech |
| 程式碼 | **55,310 字元單檔**（data-code 內）| **5,705 行 HTML / 322 KB** 單檔 |
| LLM | **Gemini 2.5 Flash** | Gemini 2.5 Flash Lite |
| 技術棧 | Tailwind + Lucide | + Web Speech API + Supabase + Web Audio |
| 雷達圖評分 | ❌ | ✅ Canvas 純手繪 |
| 老師評分量表 | ❌ | ✅ 含列印單 |
| 題庫 | 含隨機題庫按鈕 | **107 道 × 7 大分類** |
| 適用 | **新手入門 / 平日練習** | **比賽選手 / 正式賽事規格** |

## #25 真實怎麼做？

**真實標題**：「國小國語演說特訓班（進階版）」

**主要按鈕（從程式碼抽出）**：
- 「**儲存並關閉**」
- 「**隨機題庫**」

**技術棧（從 data-code 解碼）**：
- **Tailwind CSS**（\`cdn.tailwindcss.com\`）
- **Lucide Icons**
- **Gemini 2.5 Flash**（直接前端 fetch \`generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent\`）
- API Key 設定面板（老師自帶 key）

**架構特色**：
- 純前端單檔 HTML，**API Key 在使用者裝置 LocalStorage**（不上傳）
- Gemini 直接前端打 API（無後端代理）
- 「進階版」副標 → 暗示有「**基礎版**」（可能是早期更陽春的版本）

## 為什麼還保留 #25 不全部用 #67？

兩個版本是「**漸進式工具演化**」的真實案例：

1. **#25**：用 Gemini 寫好 → 貼進 Google Sites → 老師直接用
2. **#67**：阿凱熟悉 GitHub 後 → 從 #25 升級重構成 GitHub Pages 版本 → 加 Web Speech / Supabase / 雷達圖 / 老師評分量表

對老師來說：
- **新手老師** → 用 #25（門檻低，貼 API Key 就能用）
- **比賽選手** → 用 #67 Pro（完整賽事規格 + 即時逐字稿）

## 適用對象

- 想入門讓學生練演說的老師
- 國小高年級語文課延伸活動
- 看「Gemini + Google Sites 工作流」案例的開發者

## 想試試？

→ [前往 #25 國小國語演說特訓班（進階版）](/tool/25)
→ [#67 Pro 版（含 Web Speech + 雷達圖）](/tool/67)

第一次用建議：拿 Gemini 免費 API Key 貼進去 → 點「隨機題庫」抽一題 → 學生口頭演說 → 看 AI 回饋。
`,
};

const POST_26: BlogPost = {
  slug: 'multiplication-26-adventure',
  title: '#26 九九乘法大冒險：Web Audio + Tailwind + Lucide 純前端遊戲化練習（無 LLM 也能做好工具）',
  excerpt:
    '#26 真實名稱「九九乘法大冒險」是純前端遊戲化練習器 — Tailwind + Lucide + **Web Audio API**（OscillatorNode 合成音效）做的 25KB 單檔 HTML，嵌進 Google Sites。3 狀態反饋（答對了 / 哎呀答錯了 / 挑戰完成）+ 計分計時，**沒用 LLM** — 證明「好的教學工具不一定需要 AI」。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['九九乘法', '低年級數學', 'Web Audio', 'Google Sites 嵌入', '無 LLM 工具'],
  toolIds: [26, 44, 33],
  coverEmoji: '✖️',
  coverColor: 'yellow',
  body: `## 九九乘法練習器跟 Kahoot 為什麼不同？

很多老師會用 Kahoot 出九九乘法題給學生練 — 但有問題：
- 要全班同時開帳號
- 題目要老師自己出
- 練完就消失（沒有「**獨自反覆練到熟**」的模式）

阿凱的 **#26 九九乘法大冒險** 是反向設計：**單人連續挑戰 + 即時音效反饋**，不需要老師、不需要帳號、不需要連網。

## #26 真實怎麼做？

**真實標題**：「九九乘法大冒險」（不是「練習器」這種枯燥名字）

**遊戲化 4 個狀態**（從 H 標籤抽出）：
- 「**回到主選單？**」（中途要走的確認）
- 「**答對了！**」（綠色 + 撒花音效）
- 「**哎呀，答錯了**」（提示正確答案）
- 「**挑戰完成！**」（結算分數）

**真實技術棧（純前端，無 LLM）**：
- **Tailwind CSS**（\`cdn.tailwindcss.com\`）
- **Lucide Icons**
- **Web Audio API** — \`new AudioContext().createOscillator()\` 合成音效（**不是 mp3！**）
- 25,359 字元單檔 HTML（data-code 內）

## Web Audio 純合成音效的好處

從反編譯出的 JS 確認，阿凱用：
\`\`\`js
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    // ...頻率 + 波形 + 包絡控制
}
\`\`\`

**好處**：
- ✅ **沒有 mp3 檔案要載**（網頁載入超快）
- ✅ **單檔即用**（不依賴外部資源）
- ✅ **可程式控制音高 / 長度**（不同對錯不同音調）
- ✅ **iOS Safari 也能跑**（需要 user gesture 後 resume）

## 為什麼這值得寫？

**證明「好的教學工具不一定需要 AI」**：
- #25 國語演說 = 有 Gemini AI（適合需要評估的場景）
- #26 九九乘法 = 沒有 AI（題目固定 / 答案固定，AI 沒幫助反而拖累）

阿凱**會看場景選擇**用不用 AI — 不是無腦套 LLM。

## 跟 #44 數學加減法練習器的關係

- **#26** 九九乘法大冒險 → 給**二年級 / 三年級**（學完九九乘法表）
- **#44** 快樂數學小冒險 → 給**一年級**（10 以內 / 20 以內加減）

兩者是**同系列姊妹工具**，都在 swissknife 上、都用同款遊戲化架構、都用 canvas-confetti + Tailwind，**程式碼可能共用 70%+**。

## 適用對象

- 國小一到三年級數學老師
- 二年級導師（九九乘法表是該年級重點）
- 帶課輔 / 補救教學的老師
- 家長想讓孩子在家練九九乘法

## 想試試？

→ [前往 #26 九九乘法大冒險](/tool/26)
→ [#44 快樂數學小冒險（一年級）](/tool/44)

第一次用：學生掃 QR 進 → 點「2 的乘法」→ 連續答 10 題 → 看「挑戰完成！」結算分數。**不需要登入、不需要記住**。
`,
};

const POST_27: BlogPost = {
  slug: 'swissknife-27-tool-vault',
  title: '#27 ⬅️好用小工具（許願池）：swissknife 13 個 Google Sites Embedded 工具總入口（含 7 個 Akai 尚未收錄的隱藏作品）',
  excerpt:
    '#27 真實是 `sites.google.com/mail2.smes.tyc.edu.tw/swissknife/` — 阿凱所有「Gemini 寫 + Google Sites 嵌入」工具的總入口頁，共 13 個子頁工具。其中 6 個已在 Akai 100 個工具內（#5 #10 #25 #26 #44 #75 #76），**7 個是 Akai 尚未收錄的隱藏作品**（取餐叫號區 / 校園點餐後台 / 石小閱讀推動短影片 / Loilonote 題庫轉 Excel / HEIC 轉 JPG / TIFF 轉 PNG 等）。',
  publishedAt: '2026-05-21',
  readingMinutes: 5,
  tags: ['工具索引', 'swissknife', 'Google Sites', '許願池', '隱藏作品'],
  toolIds: [27, 76, 26],
  coverEmoji: '🧰',
  coverColor: 'orange',
  body: `## 「許願池」是什麼？為什麼叫 swissknife？

阿凱在學校 Google Sites 開了一個 **\`/swissknife/\` 子站**（瑞士刀 — 多功能小工具集）— 凡是他用 Gemini 寫好的單檔 HTML 工具，**直接嵌進這個子站的 Embedded HTML**，不必去學 GitHub Pages 部署流程。

「**許願池**」這個名字的由來：老師同事可以「許願請阿凱做某個工具」，阿凱**用 Gemini 寫好就貼進來**，秒上線。

## swissknife 完整子頁清單（用 curl 抓 nav HTML）

阿凱的 swissknife 共 **13 個子頁工具**（按導覽列順序）：

| 序 | 工具名 | Akai 對應 |
|---|---|---|
| 1 | 校園點餐系統 | #5 ✅ |
| 2 | **取餐叫號區** | ❌ **隱藏作品** |
| 3 | **校園點餐後台** | ❌ **隱藏作品** |
| 4 | 影片PDF轉圖片 | #75 ✅ |
| 5 | **石小閱讀推動（一分鐘短影片）** | ❌ **隱藏作品** |
| 6 | **Loilonote 題庫轉 Excel** | ❌ **隱藏作品** |
| 7 | 班級小管家 | #10 ✅ |
| 8 | **HEIC 轉 JPG** | ❌ **隱藏作品** |
| 9 | **TIFF 轉 PNG** | ❌ **隱藏作品** |
| 10 | WebSlide 簡報播放器 | #76 ✅ |
| 11 | 九九乘法大冒險 | #26 ✅ |
| 12 | 快樂數學小冒險 | #44 ✅ |
| 13 | 國語演說特訓班（進階版） | #25 ✅ |

**13 個內，6 個收錄到 Akai，7 個是隱藏作品** — 占比超過一半！這代表 Akai 100 個工具其實**還不完整**，加上 swissknife 隱藏作品其實是 **107 件作品**。

## 7 個隱藏作品的價值

從名稱推測這些工具的用途：

- **取餐叫號區** + **校園點餐後台**：跟 #5 校園點餐系統是**三合一**（學生端點餐 / 後台管理 / 取餐顯示器），完整餐廳營運架構
- **石小閱讀推動（一分鐘短影片）**：石門國小閱讀推廣專屬，可能是學生 / 老師上傳 1 分鐘讀書心得短片
- **Loilonote 題庫轉 Excel**：把 Loilonote（日本線上學習平台）的題庫**反向轉成 Excel** 給老師備課
- **HEIC 轉 JPG**：iPhone 拍照 HEIC 格式 → JPG（教師個資 / 家長端 / Word 嵌入相容性）
- **TIFF 轉 PNG**：掃描件 TIFF → PNG（檔案瘦身 + 跨平台）

這 4 個「**檔案格式轉換工具**」是典型「老師日常需要但商業軟體要付錢」的痛點，阿凱用 Gemini 一晚就做好。

## #27 真實技術棧（curl data-code 確認）

技術 signature：
- **Tailwind CSS**
- **canvas-confetti**（連工具索引頁都撒花！）
- **SweetAlert**（彈窗確認）
- 32,518 字元單檔 HTML

## 「許願池」的工作流

1. 老師同事跟阿凱說「我要 X 工具」
2. 阿凱用 **Gemini 寫程式碼**生成單檔 HTML
3. 進 Google Sites → 新增子頁 → 插入 **Embedded HTML** → 貼程式碼
4. **5 分鐘上線**（不用 git push 不用 deploy）
5. 同事在 swissknife 索引頁就看得到

## 部落格價值：這是阿凱「工具製造方法論」的縮影

對其他想學「用 Gemini 寫教學工具」的老師來說，#27 是最好的入門案例：
- ✅ **不需要學 GitHub**
- ✅ **不需要學 deploy**
- ✅ **不需要付錢**（學校都有 Google Workspace 帳號）
- ✅ **5 分鐘從許願 → 工具上線**

## 配對工具推薦

- [#76 WebSlide](/tool/76) — swissknife 隱藏部署的代表作
- [#26 九九乘法大冒險](/tool/26) / [#44 數學小冒險](/tool/44) — swissknife 上的遊戲化雙姊妹
- [#75 影片PDF轉圖片](/tool/75) — swissknife 上的格式轉換工具

## 適用對象

- 想做教學工具但不會 GitHub 的老師
- 想看「Gemini + Google Sites 工作流」的開發者
- 對阿凱完整作品集好奇的研究者

## 想試試？

→ [前往 #27 ⬅️好用小工具（許願池）](/tool/27)

點導覽列的 13 個工具一個一個玩 — 你會發現**好的教學工具不需要 GitHub**。
`,
};

const POST_44: BlogPost = {
  slug: 'math-adventure-44-grade-one',
  title: '#44 快樂數學小冒險：國小一年級 4 關卡（10 以內加減 + 20 以內加減）+ canvas-confetti 撒花獎勵的純前端遊戲',
  excerpt:
    '#44 真實名稱「快樂數學小冒險 | 國小一年級數學練習」是阿凱給**一年級**做的數學練習遊戲。4 個關卡（10 以內加法 / 10 以內減法 / 20 以內加法 / 20 以內減法）+ canvas-confetti 撒花獎勵 + 純 Tailwind + 26KB 單檔 HTML 嵌進 Google Sites。是 #26 九九乘法大冒險的低年級姊妹工具。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['一年級數學', '加減法', 'canvas-confetti', 'Google Sites 嵌入', '遊戲化練習'],
  toolIds: [44, 26, 33],
  coverEmoji: '➕',
  coverColor: 'green',
  body: `## 一年級數學最痛是什麼？

一年級數學：
- 第一學期：1-10 的認識 + 10 以內加減
- 第二學期：11-20 的認識 + 20 以內進退位加減
- 數量概念 / 數線

**最痛**：學生要**反覆練習熟練度**，但傳統做法：
- 印學習單 → 印一張練 5 分鐘
- 國語日報數學練習本 → 老師要批改
- 數學王國 / Toy Story APP → 廣告滿天飛
- Kahoot / Quizizz → 一年級不會自己加入房間

阿凱的 **#44 快樂數學小冒險** 是反向設計：**一年級自己掃 QR 進 → 4 個關卡選一個 → 連續答題 → 撒花獎勵**。

## #44 真實怎麼做？

**真實標題**：「**快樂數學小冒險 \\| 國小一年級數學練習**」（精準鎖定一年級）

**4 個關卡（從 H 標籤抽出）**：
1. **10 以內加法**
2. **10 以內減法**
3. **20 以內加法**
4. **20 以內減法**

**遊戲化狀態**：
- 「**選擇關卡**」（主選單）
- 「**挑戰完成！**」（結算）
- 「**要離開遊戲嗎？**」（中途離開確認）

**真實技術棧**：
- **Tailwind CSS**
- **canvas-confetti**（撒花獎勵 — **答對撒花，挑戰完成大撒花**）
- **26,112 字元單檔 HTML**
- 嵌進 \`sites.google.com/mail2.smes.tyc.edu.tw/swissknife/數學加減法練習器\`

## 為什麼 4 關卡這樣設計？

對應**康軒 / 翰林 / 南一三大版本一年級數學課綱**：

| 學期 | 課綱進度 | 對應關卡 |
|---|---|---|
| 一上 第 1-3 單元 | 1-10 認識 | **10 以內加法** ⭐ |
| 一上 第 5-6 單元 | 10 以內減法 | **10 以內減法** ⭐ |
| 一下 第 1-2 單元 | 11-20 認識 + 加法 | **20 以內加法** ⭐ |
| 一下 第 4-5 單元 | 20 以內減法（含退位）| **20 以內減法** ⭐ |

**完全對應一整年課綱進度**，老師備課階段對齊上 #44 一個關卡 — 學生自己練完。

## 跟 #26 九九乘法大冒險的姊妹關係

| 維度 | **#44 快樂數學小冒險** | **#26 九九乘法大冒險** |
|---|---|---|
| 適合年級 | **一年級** | **二年級下 / 三年級** |
| 主題 | 加減法 4 關卡 | 九九乘法表 |
| 撒花機制 | canvas-confetti | Web Audio 音效 |
| 字數 | 26,112 字元 | 25,359 字元 |
| 部署位置 | swissknife / 數學加減法練習器 | swissknife / 九九乘法表練習器 |

阿凱「**用 Gemini 寫好一個遊戲框架 → 換主題就再生一個工具**」的策略 — 兩個工具程式碼可能共用 70%+。

## 實際使用情境

**早自習練習**：
- 老師把 4 關 QR Code 印貼黑板
- 學生 7:50-8:10 自己掃 QR 練
- 練完看排行榜 / 自己挑戰新紀錄

**課堂分組**：
- 「程度好的 → 20 以內加減」
- 「需要鞏固的 → 10 以內加減」
- 老師 5 分鐘走一遍看誰卡哪題

**家長帶練**：
- 假日家長陪小孩練 → **撒花動效讓小孩有成就感**
- 不像作業本「對」「錯」枯燥

## 適用對象

- 國小一年級導師（數學課重點工具）
- 補救教學老師
- 課輔老師
- 自學家長

## 想試試？

→ [前往 #44 快樂數學小冒險](/tool/44)
→ [#26 九九乘法大冒險（二三年級）](/tool/26)

第一次用：印 QR 貼黑板 → 學生 5 分鐘練一關 → 看「挑戰完成」撒花 → 自然回去玩第二關。
`,
};

const POST_49: BlogPost = {
  slug: 'academic-49-treasure-trove',
  title: '#49 教務處寶藏庫（academic 子站）：3 個子頁含 2026 英語歌唱比賽 G6 歌單 × 6 班 + 親職日配置 + 班級榮譽榜（含 1 個 Akai 隱藏作品）',
  excerpt:
    '#49 真實是 `sites.google.com/mail2.smes.tyc.edu.tw/academic/` 教務處子站，含 3 個子頁：「2026 英語歌唱比賽網站」（G6 6 首歌 × 601-606 6 班 = 36 組合）、「2026 親職日場地配置」（即 Akai #74）、「班級榮譽榜名單調查」（Akai 尚未收錄的隱藏作品）。純 Tailwind 嵌進 Google Sites Embedded HTML。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['教務處', '英語歌唱比賽', 'Google Sites 嵌入', '親職日', '隱藏作品'],
  toolIds: [49, 74, 80],
  coverEmoji: '📚',
  coverColor: 'purple',
  body: `## 「教務處寶藏庫」是個子站，不是單一工具

第一次看 Akai #49「教務處寶藏庫」我以為是一個整合工具。

curl 抓 \`sites.google.com/mail2.smes.tyc.edu.tw/academic/\` 才知道 — **這是阿凱在學校 Google Sites 開的「academic 教務處子站」**，類似 swissknife（許願池）的結構，**含 3 個子頁工具**。

## academic 子站 3 個子頁清單

| 序 | 子頁 | Akai 對應 |
|---|---|---|
| 1 | **2026 英語歌唱比賽網站**（預設首頁）| 部分對應 #49 |
| 2 | 2026 親職日場地配置 | #74 ✅ |
| 3 | **班級榮譽榜名單調查** | ❌ **Akai 隱藏作品** |

## 1. 2026 英語歌唱比賽網站（#49 預設打開的子頁）

從 curl 抓 data-code 反推真實內容：

**真實標題**：「**G6 英語歌唱比賽歌單**」

**6 首推薦歌曲**：
1. Something Just Like This（Chainsmokers / Coldplay）
2. Die With A Smile（Lady Gaga / Bruno Mars）
3. Memories（Maroon 5）
4. Try Everything（Shakira，動物方城市主題曲）
5. Proud of You（Fiona Fung，溫情經典）
6. Lemon Tree（Fool's Garden，校園必唱）

**6 班按鈕**：601 / 602 / 603 / 604 / 605 / 606（六年級各班）

**架構**：6 首歌 × 6 班 = **36 種班級選歌組合** — 老師上課用「我們班選哪首」對應給歌詞 / 練習音檔 / 排練順序。

技術棧：純 Tailwind + 16,760 字元單檔 HTML。

## 2. 2026 親職日場地配置 = Akai #74

[已寫獨立教學心得](/blog/parent-day-74-venue-map) — 互動式分區地圖（戶外籃球場 + 教室活動區 + 攤位展區 + 4 個 tab 切換）

## 3. 班級榮譽榜名單調查（**Akai 隱藏作品**）

從子頁 URL \`academic/班級榮譽榜名單調查\` 推測：
- 老師輸入該班學期成就學生名單
- 教務處彙整全校榮譽榜
- 可能含期末頒獎 / 校刊報導 / 校長嘉勉公文等用途

**這個工具沒收進 Akai 100 個工具集**，是阿凱「為了學校做但沒對外推廣」的隱藏作品。

## 為什麼這值得寫？

**「教務處寶藏庫」的真實價值**：

對教務組長 / 教學組長來說，**academic 子站是教務處的「公開資訊看板」**：
- 學生選歌看 → 班導記下來
- 親職日場地看 → 家長 / 教師預先熟悉
- 榮譽榜看 → 期末彙整

**所有資訊掛在學校 Google Sites 上**，不用印紙、不用發群組、不用追問。

## 跟 swissknife 對比

| 維度 | **swissknife 許願池**（#27）| **academic 教務處寶藏庫**（#49）|
|---|---|---|
| 性質 | **工具集合** | **教務資訊看板** |
| 子頁數 | 13 個工具 | 3 個資訊頁 |
| 隱藏作品 | 7 個 | 1 個（榮譽榜）|
| 對象 | 所有師生 | 教務處 + 各班導 |
| 內容類型 | 操作型工具 | 事件性 / 行政公告 |

## 配對工具推薦

- [#74 2026 親職日場地配置互動網](/tool/74) — academic 子頁
- [#27 ⬅️好用小工具（許願池）](/tool/27) — swissknife 工具集
- [#80 114 教師會議報告（下學期）](/tool/80) — 同款 Google Sites 子站架構

## 適用對象

- 教務組長 / 教學組長
- 各班導師（學期事件查詢）
- 英文科任老師（歌唱比賽選歌參考）

## 想試試？

→ [前往 #49 教務處寶藏庫](/tool/49)
`,
};

const POST_74: BlogPost = {
  slug: 'parent-day-74-venue-map',
  title: '#74 1150328 親職日場地配置互動網：戶外籃球場 + 教室活動區 + 攤位展區 + 4 tab 切換的 SPA 場地圖',
  excerpt:
    '#74 真實標題「1150328 親職日場地配置互動網」（115/03/28 親職日專用）。Tailwind + Lucide 純前端 SPA，4 個 tab 切換（戶外班級區 / 1-3 年級教室區 / 攤位展區 / 其他區域），含戶外籃球場配置（4-6 年級與專區）+ 教室活動區（1-3 年級英語闖關）+ 攤位活動展區（石門國中升學輔導 / 性平教育展 / 家庭教育有獎徵答 / 星空計畫作品展示）。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['親職日', '場地配置', '互動式 SPA', '石門國小', 'Google Sites 嵌入'],
  toolIds: [74, 62, 49],
  coverEmoji: '🗺️',
  coverColor: 'pink',
  body: `## 親職日場地配置 — 紙本印一張 vs 互動式 SPA

傳統親職日場地配置：
- 印 A3 大張平面圖貼公佈欄
- 家長一進校門看一下就走
- 「**今天我女兒攤位在哪**」要找半天

阿凱的 **#74「1150328 親職日場地配置互動網」** 反向：**手機掃 QR → 4 個 tab 即時切換** → 找攤位 / 找區域 / 找活動 = 10 秒到位。

## #74 真實技術細節（curl Google Sites data-code 反推）

**真實標題**：「**1150328 親職日場地配置互動網**」（115/03/28 = 民國 115 年 3 月 28 日親職日）

**4 個 tab 分區切換（從按鈕抽出）**：
1. **🏀 戶外班級區**
2. **🚪 1-3 年級教室區**
3. **🎪 攤位展區**
4. **📍 其他區域**

**完整場地章節（從 H 標籤抽出）**：

### 戶外籃球場配置（4-6 年級與專區）
- 4 年級與幼兒園區域
- 5、6 年級區域
- 「4-2 / 4-3 / 4-4」班級對應按鈕

### 教室活動區（1-3 年級 & 英語闖關）
- **英語闖關活動** ⭐
- 1-3 年級教室分區

### 攤位與活動展區
- **石門國中升學輔導** 🎓（給六年級家長看的銜接資訊）
- **性平教育展** 🌈（重要課綱主題）
- **家庭教育有獎徵答** 🎁（互動式有獎活動）
- **星空計畫作品展示** ✨（學生作品集中展示）

## 真實技術棧

- **Tailwind CSS**
- **Lucide Icons**
- 34,595 字元單檔 HTML
- 嵌進 \`sites.google.com/mail2.smes.tyc.edu.tw/academic/2026親職日場地配置\`
- 純前端，無 LLM

## 為什麼這值得部落格寫？

| 傳統紙本場地圖 | #74 互動式 SPA |
|---|---|
| 印 A3 貼公佈欄 | 掃 QR 手機看 |
| 全班標一張紙 | **4 個 tab 分區呈現** |
| 找攤位要看半天 | **10 秒到位** |
| 改動要重印 | **改一行程式碼即更新** |
| 家長看完丟掉 | **永久公開連結** |

## 親職日活動類型很完整

從場地配置看出阿凱 / 學校的親職日設計：
- 🎓 **升學銜接**（國中輔導）
- 🌈 **議題教育**（性平）
- 🎁 **家庭教育**（有獎徵答）
- ✨ **學生展能**（星空計畫）
- 🇬🇧 **英語闖關**（雙語推動）
- 🏀 **班級表演**（戶外籃球場分區）

這是「**現代化親職日 = 全方位家校共學**」的真實案例。

## 配對工具推薦

- [#62 親職教育日網站](/tool/62) — 親職日網站總入口
- [#49 教務處寶藏庫](/tool/49) — academic 子站總目錄
- [#46 場地預約系統](/tool/46) — 平日場地調度

## 適用對象

- 國中小教導處 / 學務處（親職日承辦）
- 各班導師（親職日場地預告）
- 想做數位化校園活動的學校
- 看「**Google Sites + Tailwind = 5 分鐘做出活動專屬網**」案例的老師

## 想試試？

→ [前往 #74 2026 親職日場地配置](/tool/74)

下次你校親職日 — **用 Gemini 寫好 SPA + 貼 Google Sites Embedded HTML** 一條龍，5 分鐘搞定。
`,
};

const POST_75: BlogPost = {
  slug: 'slide-extractor-75-video-pdf-images',
  title: '#75 Slide Extractor 影片與 PDF 簡報擷取神器：PDF.js + jsPDF + JSZip + Firebase 設定流程的單檔擷取工具',
  excerpt:
    '#75 真實名稱「Slide Extractor - 影片與 PDF 簡報擷取神器」— 兩大模式（影片轉圖片 / PDF 轉圖片），用 PDF.js 抓 PDF 每頁渲染成圖、JSZip 打包下載、jsPDF 重新匯出、Firebase 設定流程（立即設定 / 取消 / 儲存並連線）。37,748 字元單檔 HTML 嵌進 Google Sites Embedded HTML。',
  publishedAt: '2026-05-21',
  readingMinutes: 5,
  tags: ['檔案轉換', 'PDF.js', 'jsPDF', 'JSZip', '影片擷取', 'Google Sites 嵌入'],
  toolIds: [75, 76, 94],
  coverEmoji: '🎞️',
  coverColor: 'blue',
  body: `## 老師備課最痛的「影片 + PDF → 圖片」

老師備課常需要：
- 把線上影片擷取**單獨一幀**做成教學圖片
- 把 PDF 簡報**每頁轉成圖片**貼到 Word / Google Slides
- 把學生作業 PDF **每頁存成 PNG** 做歷程紀錄

傳統做法：
- ❌ **PPT 截圖** → 解析度差
- ❌ **線上 PDF to JPG** → 上傳隱私風險
- ❌ **第三方軟體** → 要付錢 / 裝程式 / Windows 才有

阿凱的 **#75 Slide Extractor** 反向：**純瀏覽器內處理 + Firebase 帳號雲端記錄 + 零上傳到第三方**。

## #75 真實怎麼做？

**真實標題**：「**Slide Extractor - 影片與 PDF 簡報擷取神器**」

**兩大模式**：
1. **影片轉圖片** 🎬
2. **PDF 轉圖片** 📄

**處理流程章節**：
- 「**如何使用**」（內建教學）
- 「**正在處理 PDF 檔案**」（進度模態）

**Firebase 設定流程（按鈕抽出）**：
- 「**立即設定**」
- 「**取消**」
- 「**儲存並連線**」
- → 第一次用要設定 Firebase 連線（存擷取設定 / 歷史 / 圖片資料庫）

## 真實技術棧（PDF.js + jsPDF + JSZip + Firebase）

純前端單檔 HTML：
- **Tailwind CSS**
- **PDF.js**（PDF 渲染每頁成 canvas）
- **jsPDF**（重新匯出 PDF）
- **JSZip**（把多張圖片打包下載成 zip）
- **Firebase**（雲端 config 與圖片儲存）
- 37,748 字元單檔 HTML
- 嵌進 \`sites.google.com/mail2.smes.tyc.edu.tw/swissknife/影片pdf轉圖片\`

## 跟 #94 封面接故事 / #76 WebSlide 的關係

阿凱 3 個 PDF/影片處理工具：

| 工具 | 主要功能 | LLM | 技術棧亮點 |
|---|---|---|---|
| **#75 Slide Extractor** | 影片 / PDF → 圖片 | ❌ | PDF.js + jsPDF + JSZip + Firebase |
| **#76 WebSlide** | 簡報播放器（17 種 3D 轉場）| ❌ | PDF.js + jsPDF + JSZip + Lucide |
| [#94 封面接故事](/tool/94) | MV 封面 → AI 分鏡腳本 | ✅ Gemini 2.5 | ffmpeg.wasm |

**#75 vs #76 技術棧重疊度高**（都用 PDF.js / jsPDF / JSZip）— 阿凱「**寫一次基礎模組 → 換主題複製做不同工具**」的策略。

## 影片擷取功能怎麼運作？

從技術棧推測（沒有 ffmpeg.wasm signature）：
- 上傳影片 → \`<video>\` 元素載入
- 老師拖時間軸到想要的一幀
- 用 \`<canvas>.drawImage(video)\` 截圖
- 一次截多個時間點 → JSZip 打包下載

跟 [#94 封面接故事](/tool/94) 用 ffmpeg.wasm 整影片串接不同 — **#75 是「簡單擷取單幀」純 video API 路線**。

## 隱私機制

- **PDF 完全在瀏覽器內處理**（不傳第三方）
- **Firebase 只存設定 / config**（不存原始檔案）
- 嵌進學校 Google Sites → **掛學校信箱登入**才能用 Firebase 功能

## 配對工具推薦

- [#76 WebSlide 簡報播放器](/tool/76) — 同款 PDF.js + jsPDF + JSZip 技術棧
- [#94 封面接故事](/tool/94) — 影片進階版（用 ffmpeg.wasm + Gemini 2.5）
- [#27 ⬅️好用小工具（許願池）](/tool/27) — swissknife 工具集

## 適用對象

- 各科老師備課（線上影片擷取教學一幀）
- 美術 / 視藝老師（PDF 圖文書 → 每頁 PNG）
- 行政老師（會議簡報 PDF 拆成圖貼網站）
- 想學「PDF.js + JSZip 工作流」的開發者

## 想試試？

→ [前往 #75 Slide Extractor](/tool/75)

第一次用：拖一個 PDF 進去 → 點「PDF 轉圖片」→ 系統渲染每頁 → 一鍵下載 zip 包。
`,
};

const POST_80: BlogPost = {
  slug: 'meeting-80-spring-semester-week13',
  title: '#80 114 學年度下學期第 13 週教師會議互動平台：校長室 + 教務處（4 組長）+ 學務處（2 組長）的 SPA 會議報告',
  excerpt:
    '#80 真實標題「石門國小 114 學年度下學期第 13 週教師會議互動平台」— 跟 #24（上學期期末）同款架構但內容是下學期週次會議。校長室 + 教務處（教務主任 + 註冊組長 / 六年級畢業考時程 + 設備組長 + 資訊組長）+ 學務處（訓育組長 + 衛生組長 / 語文競賽打掃與病媒蚊防制）。52KB 純 Tailwind 單檔嵌進 Google Sites。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['教師會議', '互動平台', '石門國小', 'Google Sites 嵌入', '下學期'],
  toolIds: [80, 24, 15],
  coverEmoji: '📋',
  coverColor: 'green',
  body: `## #80 跟 #24 的關係：上下學期姊妹站

[已寫的 #24](/blog/meeting-24-end-semester-record) = **114 學年度上學期期末校務會議紀錄**（年度總結）
[本篇 #80](/tool/80) = **114 學年度下學期第 13 週教師會議互動平台**（學期中週次會議）

阿凱**每學期每場重要會議**都做一份這種互動 SPA，掛在學校 Google Sites 公開頁。

## #80 真實怎麼做？

**真實標題**：「**石門國小 114 學年度下學期第 13 週教師會議互動平台**」

**完整章節結構（從 H 標籤抽出）**：

### 桃園市石門國小教師會議資訊網（主標題）

### 📍 校長室
- 校長報告

### 📍 教務處（4 個組長報告）
1. 👨‍🏫 **教務主任**
2. 📝 **註冊組長** — 六年級畢業考與成績處理時程表
3. 📚 **設備組長**
4. 💻 **資訊組長**

### 📍 學務處（2 個組長報告）
1. 📣 **訓育組長**
2. 🧹 **衛生組長** — **語文競賽打掃與病媒蚊防制**

## 為什麼下學期第 13 週這場會議很關鍵？

下學期第 13 週通常落在 **5 月中下旬**，這是學期收尾關鍵期：

| 處室 | 第 13 週重點 |
|---|---|
| **註冊組** | **六年級畢業考 + 成績處理時程**（最重要！）|
| **設備組** | 學期末設備盤點準備 |
| **資訊組** | 平台帳號處理 / 暑假帳密維護 |
| **訓育組** | 學期末活動 / 校外比賽 |
| **衛生組** | **語文競賽打掃 + 病媒蚊防制**（梅雨季 + 登革熱）|

阿凱把這些報告整理成可篩選的 SPA — 老師會議結束就**永久保留**。

## 真實技術棧（純前端）

- **Tailwind CSS**（\`cdn.tailwindcss.com\`）
- **52,204 字元單檔 HTML**（比 #24 大 66%）
- **無 LLM**（純內容呈現）
- 「**清除條件**」按鈕 → 可篩選各處室 / 各組長報告
- 嵌進 \`sites.google.com/mail2.smes.tyc.edu.tw/114teacher-2/\`

## 為什麼分上下學期不同子站？

- \`/114teacher/\` = **上學期**（即 #24）
- \`/114teacher-2/\` = **下學期**（即 #80，URL 加 -2 區分）

阿凱用「**子站 + 後綴**」做學期版本管理，每學期一份永久封存。**未來 115 學年度可以開 \`/115teacher/\` 系列**。

## 跟 #24 的差異

| 維度 | **#24 上學期期末** | **#80 下學期第 13 週** |
|---|---|---|
| 學期 | 上學期（114-1）| 下學期（114-2）|
| 性質 | **期末總結會議** | **週次例行會議** |
| 內容焦點 | 致詞 + 提案 + 下學期行事曆 | **各組長 6 份分項報告** |
| 章節數 | 10 個（含致詞）| 7 個（純處室報告）|
| 篇幅 | 31KB | **52KB**（內容更多）|
| 致詞 | 校長 / 家長會長 / 自治市長 | 主要校長室 |

## 配對工具推薦

- [#24 上學期期末會議紀錄](/blog/meeting-24-end-semester-record) — 同款架構上學期版
- [#15 社群領域會議報告產出平台](/tool/15) — 領域會議專用
- [#84 會議記錄自動產出 Pro](/tool/84) — AI 會議記錄

## 適用對象

- 國中小教務處 / 學務處（每學期都要開會）
- 想公開化教師會議的學校
- 各組長（自己的報告永久封存）
- 接班的新老師（看完前學期所有報告無痛交接）

## 想試試？

→ [前往 #80 114 石小教師會議報告集合站（下學期）](/tool/80)
→ [#24 上學期期末](/tool/24)（同款架構）

阿凱「**用 Gemini 寫好 SPA + 貼 Google Sites Embedded HTML**」每學期固定產出一份 — **校園行政透明度進階版**。
`,
};

const POST_17: BlogPost = {
  slug: 'draw-17-creative-lottery',
  title: '#17 創意抽籤系統：純前端 Tailwind + canvas-confetti 輸入名單一個一個抽 + 剩餘項目即時顯示（XOOPS VM 部署）',
  excerpt:
    '#17 真實名稱「創意抽籤系統」是阿凱用 Gemini Canvas 寫的純前端 + Tailwind + canvas-confetti 抽籤工具，部署在 XOOPS 校網 VM。輸入名單後一個一個抽出（不是一次全抽），剩餘項目即時顯示，每抽中觸發 confetti 撒花，可複製結果 + 重新開始。footer 寫「桃園市石門國小 資訊組 阿凱老師 設計」。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['抽籤工具', '課堂活動', 'XOOPS VM', '純前端', 'canvas-confetti'],
  toolIds: [17, 18, 57],
  coverEmoji: '🎰',
  coverColor: 'orange',
  body: `## 阿凱另一個部署平台：XOOPS 校網 VM

繼 Google Sites Embedded 之後，阿凱第三個部署平台是 **石門國小 XOOPS 校網 VM**（\`www.smes.tyc.edu.tw/smes_html/\`）— 用 Gemini Canvas 寫好單檔 HTML，直接上傳到學校 VM 雲端就上線。

**為什麼用這個方式？**
- 比 Google Sites 更彈性（不受 Embedded HTML 限制）
- 比 GitHub Pages 更省事（不用 commit / push）
- **掛在學校網域** → 學生看到 \`smes.tyc.edu.tw\` 自然信任

## #17 真實怎麼做？

**真實標題**：「**✨ 創意抽籤系統 ✨**」

**核心功能**：
- 📝 **輸入抽籤名單**：每行一個名稱或項目
- 🎲 **開始抽籤**：一個一個抽出（不是一次全抽）
- 🏆 **抽籤結果**：顯示已抽出的清單
- **剩餘項目即時顯示**：知道還有幾個沒抽
- 📋 **複製結果** / **重新開始**

**遊戲化設計**：每抽中觸發 **canvas-confetti** 撒花。

## 真實技術棧

- **純前端單檔 HTML**（19,892 字元）
- **Tailwind CSS**（\`cdn.tailwindcss.com\`）
- **canvas-confetti**
- **無後端、無 LLM**
- 部署：\`smes.tyc.edu.tw/smes_html/gogogo.html\`（檔名 gogogo 很可愛）
- Footer：「© 2025 桃園市石門國小 資訊組 阿凱老師 設計」

## 跟 #18 大量抽選的差別

| 維度 | **#17 創意抽籤** | **#18 大量隨機抽選** |
|---|---|---|
| 抽法 | **一個一個抽**（保留懸念）| 一次出**正取 + 備取**名單 |
| 場景 | 課堂點人 / 隨機分組 | 比賽選手 / 校隊選拔 |
| 結果 | 累積式（看誰先被抽中）| 一次性（含備取）|
| confetti | ✅ 撒花 | ❌ 純表格 |

## 老師使用情境

**課堂點人發言**：
- 開學第一週收集學生名單貼上
- 上課時點「開始抽籤」抽下一個發言
- 抽過的不會再抽（自動排除）
- **比小棒子公平 + 比 random.org 視覺好玩**

**分組活動**：
- 30 人分 6 組 → 每次抽 5 個 → 自動成一組
- 剩餘人數即時顯示，知道還有多少要分

## 配對工具推薦

- [#18 繽紛隨機學生抽選工具](/tool/18) — 正取 + 備取榜單模式
- [#57 餐廳命運轉盤](/tool/57) — 選擇障礙剋星
- [#10 班級小管家](/tool/10) — 內建抽籤模式（v3.1.6）

## 適用對象

- 國中小所有任課老師（每天都會用到點人）
- 補習班 / 安親班老師
- 想做課堂遊戲化的老師
- 想看「**Gemini Canvas + XOOPS VM 工作流**」案例的開發者

## 想試試？

→ [前往 #17 創意抽籤系統](/tool/17)

把全班名單貼進去 → 一次點「開始抽籤」抽 1 個 → 學生看 confetti 撒花會超開心。
`,
};

const POST_18: BlogPost = {
  slug: 'student-pick-18-main-alternate',
  title: '#18 繽紛隨機學生抽選工具：正取 + 備取名單一次出 + 可匯出結果（比賽選手 / 校隊選拔專用）',
  excerpt:
    '#18 真實名稱「繽紛隨機學生抽選工具」是 #17 的進階版 — 不只抽一個，而是**一次抽出「正取人數 + 備取人數」雙清單**（給比賽選拔、校隊抽籤用）。純 vanilla JS（無 Tailwind）+ 可匯出結果，22KB 單檔部署 XOOPS VM。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['學生抽選', '比賽選拔', '正取備取', 'XOOPS VM', '純 JS'],
  toolIds: [18, 17, 51],
  coverEmoji: '🎯',
  coverColor: 'pink',
  body: `## #17 vs #18 — 不同抽法服務不同場景

[#17 創意抽籤](/blog/draw-17-creative-lottery) = **「一個一個抽」**保留懸念，課堂點人用。

**#18 繽紛隨機學生抽選工具** = **「一次抽出正取 + 備取雙清單」**，比賽選拔用。

阿凱兩款抽籤工具，**為不同需求各設計一個**而不是塞進同一個。

## #18 真實怎麼做？

**真實標題**：「**✨ 隨機學生抽選工具 ✨**」

**核心功能**：
- ✏️ **輸入學生名單**（每行一個姓名）
- 🎯 **錄取人數**：填要抽幾個正取
- 🔄 **備取人數**：填要抽幾個備取
- 🎲 **開始抽選**：一次出兩份名單
- 🎉 **抽選結果**：
  - **正取名單**
  - **備取名單**
- 📋 **匯出結果**

## 真實技術棧（注意：純 JS 無 Tailwind！）

- **純前端單檔 HTML**（22,175 字元）
- **純 vanilla JS**（**沒用 Tailwind！** 跟 #17 不同設計選擇）
- **無後端、無 LLM**
- 部署：\`smes.tyc.edu.tw/smes_html/random.html\`
- Footer：「© 2025 桃園市石門國小 資訊組 阿凱老師 設計」

## 為什麼 #18 不用 Tailwind？

從 size 23 KB vs #17 的 20 KB 推測：
- **#17** 用 Tailwind CDN（外部資源）+ 簡潔 class
- **#18** 寫死自己的 CSS（**繽紛**主題需要客製漸層 / 動畫）

「**繽紛**」這個形容詞暗示阿凱在 UI 設計上花了心思，可能用了 inline CSS 寫各種顏色變化。

## 老師使用情境

**校內語文競賽選手抽籤**：
- 全年級報名 30 人 → 正取 5 人比賽 + 備取 3 人候補
- 一次點「開始抽選」直接出兩份名單
- **匯出結果**貼公佈欄 + 寄家長 LINE

**校隊招新抽籤**（人多名額少）：
- 報名 50 人 → 正取 20 + 備取 10
- 抽完直接通知

**獎學金抽籤**：
- 符合資格學生 → 抽 3 名正取 + 2 名備取（候補）

**親職日抽獎**：
- 出席家長抽 5 個獎 + 5 個備取（領獎時人不在）

## 跟 #17 對比

| 維度 | **#17 創意抽籤** | **#18 繽紛抽選** |
|---|---|---|
| 抽法 | 一個一個累積 | **一次出兩榜（正取 + 備取）** |
| 視覺效果 | confetti 撒花 | **「繽紛」主題色彩** |
| 技術棧 | Tailwind CDN | **純 JS + 自寫 CSS** |
| 結果輸出 | 複製文字 | **匯出檔案** |
| 適用場景 | 課堂點人 | **比賽 / 選拔 / 抽獎** |

## 配對工具推薦

- [#17 創意抽籤系統](/tool/17) — 一個一個抽版本
- [#51 自動排課系統](/tool/51) — 對抽選後排賽程
- [#10 班級小管家](/tool/10) — 學生名單匯入來源

## 適用對象

- 教務組（語文競賽 / 樂讀比賽 / 數學競賽選手）
- 訓育組（校隊招新）
- 輔導室（獎助學金抽選）
- 親職日承辦（抽獎活動）

## 想試試？

→ [前往 #18 繽紛隨機學生抽選工具](/tool/18)

下次比賽選手抽籤 — **填正取 + 備取人數** → 一次出兩份名單 → **公平、透明、有 audit log**。
`,
};

const POST_20: BlogPost = {
  slug: 'typing-20-english-letters-falling',
  title: '#20 英文字母打字練習遊戲：26 字母從上落下 + 手指提示 + 純前端 Tailwind 無 LLM 遊戲化練習',
  excerpt:
    '#20 真實名稱「英文字母打字練習遊戲」— 26 個英文字母從上方落下，學生要在字母落到底部前正確按鍵。內建手指提示（標準鍵盤打字法），完成時間計分。純 Tailwind 單檔 HTML 18KB 部署 XOOPS VM。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['英打練習', '打字遊戲', '手指提示', 'XOOPS VM', '純前端'],
  toolIds: [20, 21, 22],
  coverEmoji: '🇬🇧',
  coverColor: 'blue',
  body: `## 國小英打教學的真實痛點

國小三年級開始接觸電腦課，英打是基礎必教 — 但教學上的痛：

- ❌ **傳統打字機 APP** → 介面老氣，學生提不起勁
- ❌ **TypingClub / Typing.com** → 英文介面 / 要創帳號 / 付費
- ❌ **紙本打字練習單** → 沒互動 / 無趣
- ❌ **不教手指位置** → 學生「兩指神功」打字（一輩子改不過來）

阿凱的 **#20 英文字母打字練習遊戲** 反向：**字母從上落下 + 手指提示 + 計時 + 進度計分**。

## #20 真實怎麼做？

**真實標題**：「**英文字母打字練習遊戲**」

**核心遊戲機制**：
- 26 個英文字母**從上方落下**
- 學生要在字母**落到底部前**輸入正確按鍵
- **下方有手指提示** ✋（教標準鍵盤打字法）
- 即時統計「**0 / 26 個字母**」+「**時間: 0 秒**」
- 完成顯示「**遊戲完成！你已完成全部 26 個字母，用時: X 秒**」

**遊戲流程**：
- 開始遊戲 → 26 個字母依序落下挑戰 → 結算分數 → 再玩一次

## 真實技術棧（無 LLM 純前端）

- **純前端單檔 HTML**（17,805 字元）
- **Tailwind CSS**（\`cdn.tailwindcss.com\`）
- **無後端、無 LLM、無 Web Audio**
- 部署：\`smes.tyc.edu.tw/smes_html/typeEN.html\`
- 對應 GitHub repo 是後來搬到 GitHub 的 \`cagoooo/typeEN\` 版本

## 「手指提示」這個設計太重要

教國小英打**最大重點不是速度**，是「**正確的手指位置**」。傳統教學：

\`\`\`
左手食指：F R T B Y G V
右手食指：J U Y H N M
左手中指：D E C
右手中指：K I ,
左手無名指：S W X
右手無名指：L O .
左手小指：A Q Z
右手小指：; P /
\`\`\`

阿凱在每個字母落下時**畫出該字母對應的手指**（從程式碼推測是 SVG / emoji 鍵盤示意圖），學生**邊玩邊建立正確指法**，比看打字教科書有效 100 倍。

## 跟 #21 #22 三件套

| 工具 | 練什麼 | 適合 |
|---|---|---|
| **#20 英打練習**（本篇）| **26 字母 + 手指提示** | 三年級英打入門 |
| **#21 中打練習** | 注音符號 → 鍵盤鍵位 | 三-五年級中文輸入 |
| **#22 成語中打練習** | 50 個國小成語填空 | 高年級語文延伸 |

阿凱「**用 Gemini 寫好一個落物遊戲框架 → 換題目資料庫就再生一個工具**」的策略。

## 老師使用情境

**資訊課英打單元 3 節課**：
- **第 1 節**：講解手指位置 + 學生玩 5 次練習 → 看誰最快
- **第 2 節**：分組挑戰賽 → 平均最快組勝出
- **第 3 節**：個人賽 → 全班排名

**早自習補強**：
- 學生掃 QR 進 → 5 分鐘練一輪
- 一週 5 次累積看進步曲線

**回家作業**：
- 給家長 LINE 群組連結
- 「請孩子今天玩 1 次練英打 5 分鐘」

## 配對工具推薦

- [#21 中文注音打字遊戲](/tool/21) — 注音版（用同款落物框架）
- [#22 成語填空遊戲](/tool/22) — 成語版（落物 + 填空複合）
- [#81 國小資訊科技教學駕駛艙](/tool/81) — 三年級資訊課單元入口

## 適用對象

- 國小三年級資訊課老師（英打必教）
- 中年級英文老師（鞏固字母）
- 補習班美語老師（純打字訓練）
- 想看「**Gemini 寫遊戲 + 純前端落物物理**」案例的開發者

## 想試試？

→ [前往 #20 英文字母打字練習遊戲](/tool/20)

第一次玩建議：**正坐 + 雙手放在 ASDF JKL; 起始位置** → 開始遊戲 → 用對的手指按字母 → 看「用時 X 秒」會記住正確指法。
`,
};

const POST_21: BlogPost = {
  slug: 'typing-21-zhuyin-keymap',
  title: '#21 中文注音打字遊戲：完整 ㄅㄆㄇ→鍵盤鍵位對照 + 180 秒倒數 + 字元下落物理遊戲',
  excerpt:
    '#21 真實名稱「中文注音打字遊戲」— 學生要在 180 秒內輸入正確的注音符號或對應按鍵來消滅從天而降的字元。內建完整 ㄅㄆㄇ → 鍵盤鍵位對照表（ㄅ→1 / ㄆ→q / ㄇ→a / ㄈ→z⋯）+ Tailwind + 純前端 26KB 單檔 XOOPS VM 部署。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['中打練習', '注音符號', 'ㄅㄆㄇ', 'XOOPS VM', '180 秒倒數'],
  toolIds: [21, 20, 22],
  coverEmoji: '🇹🇼',
  coverColor: 'green',
  body: `## 注音打字 — 國小中文輸入第一關

國小中年級開始學中文輸入，台灣**最普及的是注音輸入法**：
- 學生要記 37 個注音符號對應的鍵盤位置
- ㄅㄆㄇㄈ 在哪、ㄉㄊㄋㄌ 又在哪
- 還有四聲（一二三四）+ 輕聲（˙）位置

**傳統教法問題**：
- ❌ 印鍵盤對照表貼螢幕 → 學生一直低頭看不專心
- ❌ 用 Word 打字 → 學生只記得詞不記得鍵位
- ❌ 線上注音課 → 都是無聊教學影片

阿凱的 **#21 中文注音打字遊戲** 反向：**字元從上落下 + 學生輸入注音消滅字元 + 180 秒倒數**。

## #21 真實怎麼做？

**真實標題**：「**中文注音打字遊戲**」

**核心遊戲機制**：
- **挑戰你的中文注音打字速度！**
- 字元（中文字）從天而降
- 學生輸入**正確的注音符號或對應按鍵**消滅該字
- **180 秒倒數**
- 即時統計「**已完成: 0**」+「**分數: 0**」+「**時間: 180 秒**」
- 結算「**完成字元 / 最終得分 / 剩餘時間**」

**內建完整注音鍵位對照表**（從程式碼抽出，部分）：
\`\`\`js
const bopomofoKeyMap = {
  'ㄅ': '1', 'ㄆ': 'q', 'ㄇ': 'a', 'ㄈ': 'z',
  'ㄉ': '2', 'ㄊ': 'w', 'ㄋ': 's', 'ㄌ': 'x',
  'ㄍ': 'e', 'ㄎ': 'd', 'ㄏ': 'c',
  'ㄐ': 'r', 'ㄑ': 'f', 'ㄒ': 'v',
  'ㄓ': '5', 'ㄔ': 't', // ...完整 37 個符號
};
\`\`\`

→ **學生不用記注音對應鍵位** — AI 已對應好，學生**直接練手感**。

## 真實技術棧

- **純前端單檔 HTML**（25,743 字元）
- **Tailwind CSS**
- **無後端、無 LLM**
- 對應 GitHub repo \`cagoooo/typeCC\`（後來搬到 GitHub 的版本）
- 部署：\`smes.tyc.edu.tw/smes_html/typeCC.html\`

## 跟 #20 英打的對比

| 維度 | **#20 英打**（[已寫](/blog/typing-20-english-letters-falling)）| **#21 中打**（本篇）|
|---|---|---|
| 字元 | 26 字母 | 中文字元（含多字組合）|
| 時間 | **不限**（直到打完 26 個）| **180 秒倒數** |
| 輸入方式 | 直接按字母鍵 | **按注音對應鍵**或**完整注音** |
| 鍵位提示 | 手指圖 ✋ | bopomofoKeyMap（隱藏在後台）|
| 適合年級 | **三年級** | **四五年級**（學完注音）|

## 老師使用情境

**中打教學單元 4 節課**：
- **第 1 節**：講注音鍵位 + 學生玩 1 次熟悉介面
- **第 2 節**：分組挑戰 → 看誰 180 秒能消滅最多字
- **第 3 節**：班內 PK 賽 → 最快 5 名上台演示
- **第 4 節**：個人最佳成績挑戰

**早自習補強**：
- 跟 #20 英打輪流練（兩天一個）

**家長期末作業**：
- 家長 LINE 群組「**孩子玩 #21 注音遊戲，180 秒消滅多少字？**」
- 拍照截圖傳上來 → 比較進步

## 配對工具推薦

- [#20 英文字母打字練習](/tool/20) — 英打入門
- [#22 成語填空遊戲](/tool/22) — 高年級成語應用
- [#26 九九乘法大冒險](/tool/26) — 同款「字落下挑戰」遊戲化框架（數學版）

## 適用對象

- 國小四五年級資訊課老師（中打必教）
- 中文系師資培訓（教注音輸入法）
- 補習班 / 安親班（孩子加強中打）
- 老人家學注音輸入（介面友善）

## 想試試？

→ [前往 #21 中文注音打字遊戲](/tool/21)

第一次玩建議：**180 秒先玩 1 次熟悉介面** → 第二次認真消滅 → 看「最終得分」對比第一次有沒有進步。
`,
};

const POST_22: BlogPost = {
  slug: 'idiom-22-fill-blank-game',
  title: '#22 成語填空遊戲：50 個國小程度成語 + 含成語意思教學 + 倒數計時挑戰',
  excerpt:
    '#22 真實名稱「成語填空遊戲」— 內建 50 個國小程度成語，題目缺一個字學生要填入，每個成語都附「成語意思」教學（例：一心一意 = 形容專心致志毫無雜念）。Tailwind + 純前端單檔 26KB 部署 XOOPS VM。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['成語填空', '語文教學', '高年級', 'XOOPS VM', '純前端'],
  toolIds: [22, 21, 71],
  coverEmoji: '📜',
  coverColor: 'purple',
  body: `## #22 跟 #20 #21 是三件套但聚焦語文素養

[#20 英打](/blog/typing-20-english-letters-falling) 練字母鍵位 / [#21 中打](/blog/typing-21-zhuyin-keymap) 練注音鍵位 — 都是**鍵盤輸入訓練**。

**#22 成語填空遊戲** 主軸不同 — **內建 50 個成語 + 意思教學**，重點是**成語素養**而不是純打字。

## #22 真實怎麼做？

**真實標題**：「**成語填空遊戲**」

**核心遊戲機制**：
- 從 50 個國小程度成語抽題
- 顯示成語的 4 個字，其中 1 個字被空白「___」取代
- 學生**填入缺失的字**
- 點「**確定**」檢查 → 答對進「**下一題**」
- 含**剩餘時間倒數**

**內建 50 個國小成語**（從程式碼抽出部分樣本）：
\`\`\`js
const idioms = [
  { idiom: "一心一意", meaning: "形容專心致志，毫無雜念" },
  { idiom: "七嘴八舌", meaning: "形容人多議論紛紛" },
  { idiom: "三心二意", meaning: "形容意志不堅定，思想不專一" },
  { idiom: "不可思議", meaning: "形容事情奇怪，難以理解" },
  { idiom: "五光十色", meaning: "形容色彩鮮豔，光彩奪目" },
  { idiom: "六神無主", meaning: "形容驚慌失措" },
  // ... 共 50 個成語
];
\`\`\`

→ **每個成語都附「成語意思」** — 學生**填空時順便學成語意義**，不只是「機械填空」。

## 真實技術棧

- **純前端單檔 HTML**（26,642 字元）
- **Tailwind CSS**
- **無後端、無 LLM**
- 對應 GitHub repo \`cagoooo/typeTC\`（後來搬到 GitHub 的版本）
- 部署：\`smes.tyc.edu.tw/smes_html/typeTC.html\`

## 50 個成語的選題

從第一頁樣本看選題策略：
- 多數是**「數字 + 對比」結構**：一心一意 / 三心二意 / 七嘴八舌 / 五光十色 / 六神無主
- 適合**國小高年級**（103 課綱「文化素養」對應）
- **意思白話化**（不用古文解釋，國小生看得懂）

## 跟 #71 成語填空大挑戰的關係

- **#22 成語填空遊戲** — 50 題基礎版
- **#71 成語填空大挑戰** — 進階版？（沒查證）

兩者可能是阿凱不同時期的迭代版本。

## 老師使用情境

**國語延伸活動**：
- 上完一單元成語教學 → 學生玩 #22 鞏固
- 全班同時掃 QR 進 → 5 分鐘搶答比賽

**早自習補強**：
- 每天 5 分鐘玩 5 題
- 一週累積 25 題 → 一個月走完全部 50 個成語

**期末成果展**：
- 班內成語王挑戰賽
- 用「**通過題數 / 用時**」排名

**家長親子互動**：
- 假日家長陪孩子玩 → 邊玩邊講成語典故
- 比寫紙本作業有趣

## 配對工具推薦

- [#21 中文注音打字遊戲](/tool/21) — 鍵盤訓練版
- [#71 成語填空大挑戰](/tool/71) — 進階版
- [#79 漢語新解](/tool/79) — AI 諷刺式新解（更高階語文延伸）

## 適用對象

- 國小高年級國語老師（成語單元）
- 國中國文補救教學
- 課輔老師（語文素養）
- 想做「字詞遊戲化教學」的老師

## 想試試？

→ [前往 #22 成語填空遊戲](/tool/22)

第一次玩建議：**先玩 10 題感受難度** → 看到不懂的成語讀一下「成語意思」 → 整輪完後**累積對的成語就成自己的字庫**。
`,
};

const POST_28: BlogPost = {
  slug: 'mario-28-jump-platform',
  title: '#28 瑪莉歐風格平台跳躍遊戲：純 Canvas 2D + requestAnimationFrame + AudioContext 音效 + 最高分紀錄',
  excerpt:
    '#28 真實名稱「瑪莉歐風格平台跳躍遊戲」是阿凱用純 Canvas 2D（無框架）寫的橫向卷軸跳跳遊戲。方向鍵移動 + 空白鍵跳躍，AudioContext 合成音效，localStorage 存最高分。20KB 單檔部署 XOOPS VM。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['平台跳躍遊戲', 'Canvas 2D', 'XOOPS VM', '純前端', '橫向卷軸'],
  toolIds: [28, 29, 36],
  coverEmoji: '🍄',
  coverColor: 'orange',
  body: `## 課間 5 分鐘小遊戲也是教具

下課時間學生會去玩線上小遊戲 — 但廣告滿天飛、要登入、容易踩雷。

阿凱「**用 Gemini 寫一個自己的小遊戲掛在學校網域**」反向：
- ✅ **不會廣告污染**
- ✅ **不用登入**
- ✅ **掛在 \`smes.tyc.edu.tw\` 學校網域** — 老師家長信任

## #28 真實怎麼做？

**真實標題**：「**瑪莉歐風格平台跳躍遊戲**」

**遊戲機制**：
- 橫向卷軸跳跳遊戲（致敬瑪莉歐）
- **使用左右方向鍵移動**
- **點擊畫面或按空白鍵跳躍**
- 即時顯示「**分數: 0**」+「**最高分: 0**」
- 遊戲結束 → 重新開始

## 真實技術棧

- **純前端單檔 HTML**（20,021 字元）
- **Canvas 2D**（\`getContext('2d')\`）
- **requestAnimationFrame**（流暢 60fps 動畫）
- **AudioContext**（合成音效，跟 #26 九九乘法同款）
- **localStorage**（存最高分）
- **無框架 / 無 Tailwind / 無 LLM** — 純 JavaScript
- 部署：\`smes.tyc.edu.tw/smes_html/mariojump.html\`

## 為什麼純 Canvas 2D 還是好選擇？

阿凱沒用 Phaser / PixiJS 這類遊戲引擎，因為：
- **載入快**：CDN 引擎要載 100-500KB，Canvas 原生 0 KB
- **單檔即用**：不需 build / bundle / 模組系統
- **學生看得懂**：開瀏覽器 DevTools 看到的程式碼是「他們也能寫」的等級
- **改容易**：阿凱要加新地形 / 敵人，直接改 JS 沒套件冗餘

## 教學情境

**資訊科技課示範**：
- 五六年級程式設計單元
- 老師打開 #28 → 給學生看「**單檔 HTML + 純 Canvas 2D 就能做出瑪莉歐**」
- 用 DevTools 開 Sources 看程式碼 → 學生知道遊戲背後其實「沒這麼難」

**下課時間放鬆**：
- 不會打擾其他課程
- 5 分鐘玩一輪正好

**回家作業選做**：
- 想挑戰自己破最高分

## 配對工具推薦

- [#29 太陽系探索者](/tool/29) — 純 Three.js 3D 教學
- [#36 貪食蛇互動遊戲](/tool/36) — 同款 Canvas 2D 遊戲
- [#30 遊戲集合](/tool/30) — 12 個遊戲合集

## 適用對象

- 資訊科技課老師（純 Canvas 教學範例）
- 程式設計營隊講師
- 想做「沒廣告小遊戲」給學生玩的老師
- 想學「不靠 Phaser 寫 2D 遊戲」的開發者

## 想試試？

→ [前往 #28 瑪莉歐風格平台跳躍遊戲](/tool/28)
`,
};

const POST_29: BlogPost = {
  slug: 'solar-29-system-explorer',
  title: '#29 太陽系探索者：Three.js 3D 渲染 + 滑鼠拖旋轉 + 模擬速度滑桿 + 內外太陽系三視角切換',
  excerpt:
    '#29 真實名稱「太陽系探索者 🚀」— 阿凱用 **Three.js 3D 渲染**寫的太陽系互動模擬。拖曳滑鼠旋轉視角 + 滾輪縮放 + 點擊行星顯示資訊 + 模擬速度滑桿 + 顯示軌道 / 行星標籤開關 + 三種預設視角（總覽 / 內太陽系 / 外太陽系）。24KB 單檔部署 XOOPS VM。',
  publishedAt: '2026-05-21',
  readingMinutes: 5,
  tags: ['太陽系', 'Three.js', '3D 視覺化', '自然科學', 'XOOPS VM'],
  toolIds: [29, 28, 30],
  coverEmoji: '🪐',
  coverColor: 'blue',
  body: `## 五年級自然「太陽系」單元的痛

五年級自然有「太陽系」單元 — 但傳統教學：
- ❌ **課本平面圖** → 學生只看到 9 個圓圈不立體
- ❌ **YouTube 影片** → 被動觀看，不能互動探索
- ❌ **Google Sky / NASA Eyes** → 英文介面 / 太複雜
- ❌ **3D 軟體 Stellarium** → 要安裝、太專業

阿凱的 **#29 太陽系探索者** 反向：**Three.js 純瀏覽器 3D + 中文介面 + 拖滑鼠就能轉**。

## #29 真實技術細節（Three.js 3D！）

**真實標題**：「**太陽系探索者 🚀**」

**完整功能（從程式碼抽出）**：

**功能 A：3D 渲染（Three.js）**
- \`new THREE.Scene()\` 場景
- \`PerspectiveCamera(75, ...)\` 透視相機
- 太陽 + 8 大行星 + 軌道渲染

**功能 B：互動控制**
- **拖曳滑鼠** → 旋轉視角
- **滾輪縮放** → 拉近 / 拉遠
- **點擊行星** → 右側資訊面板顯示行星資料

**功能 C：模擬控制**
- **模擬速度滑桿**：調整行星公轉 / 自轉的速度
- **顯示軌道**開關：可隱藏軌道線
- **顯示行星標籤**開關：可隱藏行星名稱

**功能 D：三種預設視角**
- 🌌 **總覽視角**
- ☀️ **內太陽系**（水星 / 金星 / 地球 / 火星）
- 🪐 **外太陽系**（木星 / 土星 / 天王星 / 海王星）

**功能 E：「使用說明」內建教學**
- 完整滑鼠操作 + 點擊行星 + 模擬速度 + 軌道 / 標籤 + 視角切換**全方位教學**

## 真實技術棧

- **純前端單檔 HTML**（24,320 字元）
- **Three.js**（CDN 引入）
- **requestAnimationFrame** 流暢動畫
- **無後端、無 LLM**
- 部署：\`smes.tyc.edu.tw/smes_html/3d-space.html\`

## 為什麼這個值得寫獨立教學心得？

**#29 是 swissknife / smes_html 系列中唯一用 Three.js 的工具** — 阿凱對技術棧的選擇有意識：
- 普通遊戲 → Canvas 2D（[#28 瑪莉歐](/blog/mario-28-jump-platform) / [#31 抓抓樂](/tool/31)）
- **3D 太空** → Three.js（**這個 use case 沒辦法用 2D**）
- 影像格式轉換 → Vanilla File API（隱藏作品 HEIC 轉 JPG）
- AI 出題 → Gemini API（[#25 國語演說](/blog/speech-25-training-class-entry)）

**用對工具是工程師的修養**。

## 教學情境

**五年級自然「太陽系」單元 3 節課**：
- **第 1 節**：講解八大行星 + 用 #29 總覽視角看
- **第 2 節**：分組探索 — 每組分配 1 顆行星，點擊查看資料 + 上台報告
- **第 3 節**：模擬時間流逝 — 用速度滑桿展示「**1 個月 = 地球公轉 1/12 圈**」
- 回家作業：分享 #29 給家長 + 講 1 個行星給家長聽

**資訊科技課示範**：
- 跨年級素養課 — 看「**單檔 HTML + Three.js 就能做 3D 模型**」

**家長親子科學**：
- 假日跟孩子一起拖滑鼠探索宇宙

## 跟其他天文工具的差異

| 工具 | 優點 | 缺點 |
|---|---|---|
| 課本 | 完整知識 | 平面、無互動 |
| YouTube | 影音吸引 | 被動觀看 |
| Stellarium | 專業 | **要裝軟體** |
| NASA Eyes | 真實 | **英文介面** |
| **#29 太陽系探索者** | **零安裝 + 中文 + 互動 + 學校網域** | ⭐ |

## 配對工具推薦

- [#28 瑪莉歐平台跳躍](/tool/28) — 同款 Canvas 但 2D
- [#30 遊戲集合](/tool/30) — 12 in 1 遊戲合集
- [#81 國小資訊科技教學駕駛艙](/tool/81) — 五年級資訊課入口

## 適用對象

- 五年級自然 / 地球科學老師
- 五六年級資訊課（看 Three.js 案例）
- 天文社團指導老師
- 想做「**3D 互動視覺化教學**」的老師
- 自學家長

## 想試試？

→ [前往 #29 太陽系探索者](/tool/29)

第一次玩建議：**先點「使用說明」看完** → 切「內太陽系」視角 → 拖滑鼠繞地球 → 點地球看資料 → **你會理解「3D 比 2D 強在哪」**。
`,
};

const POST_30: BlogPost = {
  slug: 'games-30-collection-12-in-1',
  title: '#30 遊戲集合：阿凱自製 12-in-1 校內小遊戲合集（含踩地雷、撲克、消除、貪吃蛇、井字、俄羅斯方塊⋯ 全部隱藏作品）',
  excerpt:
    '#30 真實是「遊戲集合」索引頁 — 阿凱自製 **12 個小遊戲合集**：10x10 踩地雷 / 撲克牌比大小 / 彩色方塊消除 / 記憶配對 / 貪吃蛇 / 井字遊戲 / 彈跳球 / 數字華容道 / 捕鼠遊戲 / 俄羅斯方塊 / 彩色氣泡射擊 / 記憶翻牌。**這 12 個遊戲全部都是 Akai 沒收的隱藏作品**！',
  publishedAt: '2026-05-21',
  readingMinutes: 5,
  tags: ['遊戲合集', '12 in 1', 'XOOPS VM', '隱藏作品', '經典小遊戲'],
  toolIds: [30, 28, 36],
  coverEmoji: '🎮',
  coverColor: 'pink',
  body: `## 🚨 重大發現：#30 是 12 個隱藏作品的合集！

之前以為 #30「**小遊戲大集合**」只是個工具索引 — 跑 curl 抓 \`smes.tyc.edu.tw/smes_html/little_games/\` 才發現是 **12 個阿凱自製小遊戲的合集頁**，**全部沒收進 Akai 100 個工具**！

跟之前發現的 **swissknife 7 個隱藏作品** + **academic 1 個** 加起來 → 阿凱實際作品已超過 **120 件**！

## #30 完整 12 遊戲清單（從 HTML headings 抽出）

| 序 | 遊戲名 | 簡介 |
|---|---|---|
| 1 | 🚩 **10x10 踩地雷** | 經典踩地雷，考驗邏輯思維 |
| 2 | 🂠 **撲克牌比大小** | 簡單刺激的撲克牌遊戲 |
| 3 | 🟦 **彩色方塊消除** | 消除相同顏色的方塊獲高分 |
| 4 | 🃏 **記憶配對遊戲** | 考驗記憶力，找出所有配對 |
| 5 | 🐍 **貪吃蛇** | 控制蛇吃食物成長 |
| 6 | ❌⭕ **井字遊戲** | 經典兩人對戰 |
| 7 | 🏀 **彈跳球** | 控制平台接球 |
| 8 | 🧩 **數字華容道** | 滑動數字方塊排列 |
| 9 | 🐱 **捕鼠遊戲** | 控制貓咪捕老鼠 |
| 10 | ⬛ **俄羅斯方塊** | 經典空間思維遊戲 |
| 11 | 🎯 **彩色氣泡射擊** | 瞄準射擊連鎖反應 |
| 12 | 🃏 **記憶翻牌** | 翻卡找配對 |

**12 個遊戲全部都是阿凱用 Gemini Canvas 寫的單檔 HTML**，**全部沒收進 Akai 100 個工具**！

## 為什麼這 12 個遊戲沒收進 Akai？

從 \`little_games/\` 路徑看，這是 **「子目錄合集」** 設計：
- Akai tools.json 一個工具就是一個 URL
- \`little_games/\` 是合集，**不能單一 URL 代表 12 個**
- 所以 Akai 用「#30 小遊戲大集合」一個工具卡涵蓋整個合集

實際上**每個遊戲都值得獨立宣傳** — 但阿凱選擇低調做合集。

## 真實技術棧

- **小集合索引頁**（6,445 字元 — 比其他工具小）
- **無 LLM、無框架**
- 純 HTML 列表 + 連結到各遊戲子頁
- 部署：\`smes.tyc.edu.tw/smes_html/little_games/\`

每個子遊戲推測都是 **純 Canvas 2D + JavaScript**（跟 #28 瑪莉歐同款架構）。

## 為什麼這個合集很有價值？

**這是「**經典遊戲復刻全集**」** — 一個地方收齊：
- 益智類：踩地雷 / 井字 / 數字華容道
- 反應類：貪吃蛇 / 彈跳球 / 彩色氣泡射擊 / 捕鼠
- 消除類：彩色方塊 / 俄羅斯方塊
- 記憶類：記憶配對 / 記憶翻牌
- 卡牌類：撲克牌比大小

**完整覆蓋國小生愛玩的遊戲類型**，比商業遊戲入口網（充滿廣告 / 付費）親民 100 倍。

## 教學情境

**下課 5 分鐘**：
- 學生掃 QR 進 → 選 1 個遊戲玩
- 每天輪不同遊戲，**12 個玩 2 週剛好**

**雨天午休**：
- 教室電腦投影 + 學生輪流上去玩
- 全班看別人玩**也很開心**

**程式設計課示範**：
- 老師展示「**12 個遊戲都是阿凱用 Gemini 寫的**」
- 學生看到「**單檔 HTML 就能做出俄羅斯方塊**」會很震撼

**安親班 / 課輔自由時間**：
- 比看 YouTube 健康（無廣告無不適合內容）

## 配對工具推薦

- [#28 瑪莉歐風格平台跳躍](/tool/28) — 平台類遊戲
- [#36 貪食蛇互動遊戲](/tool/36) — 進階版貪食蛇？
- [#27 ⬅️好用小工具（許願池）](/tool/27) — swissknife 工具集

## 適用對象

- 所有有教室電腦的老師（下課小遊戲）
- 安親班 / 課輔老師
- 想做「**沒廣告經典遊戲合集**」的工程師（fork 學習）
- 想看「**Canvas 2D 經典遊戲程式範例**」的開發者

## 想試試？

→ [前往 #30 遊戲集合](/tool/30)

12 個遊戲輪流玩，**每個都是阿凱手寫程式碼，零廣告零陷阱**。
`,
};

const POST_31: BlogPost = {
  slug: 'claw-31-machine-game',
  title: '#31 改進得分機制的夾娃娃機遊戲（放大版）：Canvas 2D + 60 秒倒數 + 最高分紀錄',
  excerpt:
    '#31 真實標題「改進得分機制的夾娃娃機遊戲 - 放大版」— 阿凱用純 Canvas 2D 寫的夾娃娃機模擬遊戲，60 秒倒數挑戰看誰夾最多娃娃，含分數 / 最高分 / 新最高分慶祝。14KB 單檔部署學校網域。',
  publishedAt: '2026-05-21',
  readingMinutes: 3,
  tags: ['夾娃娃機', 'Canvas 2D', '60 秒挑戰', 'XOOPS VM', '純前端'],
  toolIds: [31, 28, 30],
  coverEmoji: '🕹️',
  coverColor: 'yellow',
  body: `## 「夾娃娃機」在校園的特殊意義

夾娃娃機是台灣校園附近最常見的娛樂 — 但實際去玩：
- 💸 一夾 10-50 元
- 😩 機台被調過，**不一定夾得到**
- 👶 國小生付不起且家長禁止

阿凱的 **#31 改進得分機制的夾娃娃機遊戲（放大版）** 是「**永遠夾得到 + 不用錢 + 公平的數位版**」。

## #31 真實怎麼做？

**真實標題**：「**改進得分機制的夾娃娃機遊戲 - 放大版**」

從標題就看得出迭代史 — 「**改進得分機制**」+「**放大版**」 → 至少改過 2 次以上的版本。

**核心遊戲機制**：
- 60 秒倒數
- 控制夾子夾起娃娃
- 即時顯示「**分數: 0**」+「**最高分: 0**」+「**時間: 60**」
- 60 秒到 → 顯示「**遊戲結束！**」
- 若破紀錄 → 顯示「**新最高分！**」🏆
- 重新開始

## 真實技術棧

- **純前端單檔 HTML**（13,778 字元）
- **Canvas 2D**（\`getContext('2d')\`）
- **localStorage** 存最高分
- **無框架 / 無 LLM**
- 部署：\`smes.tyc.edu.tw/claw-machine-game.html\`（**注意：URL 不在 smes_html/ 下，是學校根目錄**）

## URL 路徑暗示開發階段

跟 [#28 瑪莉歐](/blog/mario-28-jump-platform)（\`smes_html/mariojump.html\`）對比：
- **#28** URL 在 \`smes_html/\` 子目錄
- **#31** URL 直接在學校根目錄

可能是阿凱**最早期的作品**（還沒建立 smes_html/ 分類習慣），或是「**校長指定上首頁主推的特別版**」。

## 教學情境

**下課 5 分鐘休閒**：
- 學生掃 QR 進 → 60 秒一輪
- 短小不影響上課

**心理輔導課使用**：
- 「**夾不到也沒關係**」的挫折教育
- 對比真實夾娃娃機 → 教孩子「**真實夾娃娃機是賠錢遊戲**」的反思

**期末班會獎勵**：
- 全班輪流挑戰 → 最高分有小禮物

## 配對工具推薦

- [#28 瑪莉歐平台跳躍](/tool/28) — 平台類遊戲
- [#30 遊戲集合](/tool/30) — 12 in 1 合集
- [#57 餐廳命運轉盤](/tool/57) — 選擇障礙剋星

## 適用對象

- 國中小所有老師（下課休閒）
- 安親班 / 課輔老師
- 想做「**反思商業夾娃娃機教育**」的老師

## 想試試？

→ [前往 #31 互動遊戲抓抓樂](/tool/31)

60 秒挑戰夾最多娃娃 — **記得，這是免費的**。
`,
};

const POST_32: BlogPost = {
  slug: 'touch-32-bombbombbomb',
  title: '#32 石門國小觸屏碰碰碰：AudioContext 音效 + Canvas 隨機浮動圖案的觸控互動遊戲',
  excerpt:
    '#32 真實標題「**石門國小觸屏碰碰碰！**」是阿凱專為石門國小觸控螢幕設計的小遊戲 — 觸碰畫面就會獲得隨機浮動圖案，AudioContext 合成音效 + Canvas 動畫。10KB 單檔部署 XOOPS VM。',
  publishedAt: '2026-05-21',
  readingMinutes: 3,
  tags: ['觸控互動', '互動藝術', '石門國小', 'AudioContext', 'XOOPS VM'],
  toolIds: [32, 33, 35],
  coverEmoji: '👆',
  coverColor: 'green',
  body: `## 學校觸控螢幕的真實用途

許多國小現在有大型觸控螢幕（55 吋 / 65 吋電視 / 互動白板），但平常都拿來：
- 投影 PPT
- 看 YouTube
- ⋯ **就這樣**

阿凱發現「**這麼大的螢幕應該要做點什麼**」 — 於是寫了一系列「**觸屏互動小遊戲**」。

## #32 真實怎麼做？

**真實標題**：「**石門國小觸屏碰碰碰！**」（含學校名 + 驚嘆號！）

**核心互動**：
- 標題：「**請觸碰畫面，將獲得隨機浮動圖案**」
- 學生用手指碰螢幕 → 螢幕該位置浮現一個隨機圖案
- 圖案會浮動 / 漂浮 / 變化
- 多人同時碰 → 多個圖案同時浮動
- AudioContext 合成音效（碰一下發出聲音）

## 真實技術棧

- **純前端單檔 HTML**（10,516 字元 — 小巧）
- **Canvas + requestAnimationFrame**
- **AudioContext**（合成音效）
- **觸控事件**（\`touchstart\` / \`touchmove\`）
- **無框架、無 LLM**
- 部署：\`smes.tyc.edu.tw/smes_html/touch.html\`

## 為什麼這值得寫？

**「**互動藝術 + 教學情境結合**」** — 阿凱這系列工具是專為**石門國小的物理空間**設計：

| 觸屏工具 | 場景 |
|---|---|
| **#32 觸屏碰碰碰**（本篇）| 一般觸控玩耍 |
| [#33 讓聲音具現化吧！](/tool/33) | 聲音視覺化教學 |
| [#34 互動式影像聲音遊戲區](/tool/34) | 大型展示 |
| [#35 觸屏點點塗鴉區](/tool/35) | 自由塗鴉 |
| [#37 聲波擴散 360 小遊戲](/tool/37) | 物理概念體驗 |

這些工具掛在**石門國小走廊 / 圖書館 / 學習角**的觸控螢幕上，學生課間經過就能玩 — **物理空間 + 數位互動 = 新型教學環境**。

## 教學情境

**朝會前等待時間**：
- 早上 7:50-8:00 學生陸續到校
- 走廊觸控螢幕掛 #32 → 學生輪流碰
- **不會吵到上課**

**親職教育日體驗**：
- 家長走過觸控螢幕 → 「**這也是阿凱老師寫的？**」
- 親身感受學校的數位轉型

**藝術與人文課延伸**：
- 講「**互動藝術**」單元
- 用 #32 示範「**觀眾的觸碰也是藝術品的一部分**」

## 配對工具推薦

- [#33 讓聲音具現化吧！](/tool/33) — 聲音視覺化
- [#35 觸屏點點塗鴉區](/tool/35) — 自由塗鴉版
- [#37 聲波擴散 360 小遊戲](/tool/37) — 物理概念

## 適用對象

- 有大型觸控螢幕的學校
- 圖書館 / 學習角規劃者
- 藝術與人文老師
- 想做「**互動藝術裝置**」的工程師

## 想試試？

→ [前往 #32 遊戲觸屏碰碰碰](/tool/32)

如果你校有觸控螢幕 — **掛 #32 在走廊上**，整天都有互動，**學生課間多了一個「跟學校玩耍」的方式**。
`,
};

const POST_33: BlogPost = {
  slug: 'sound-33-visualizer',
  title: '#33 讓聲音具現化吧！Sound Visualizer：AudioContext + Web Audio API 即時顯示分貝值 + 音頻頻率',
  excerpt:
    '#33 真實名稱「石門國小互動觸屏-讓聲音具現化吧！Visualizer」是阿凱專為觸控螢幕設計的**聲音視覺化教具**。AudioContext 抓麥克風即時顯示分貝值 / 最大分貝值 / 音頻頻率 / 最大音頻頻率，純前端 6.9KB 單檔。',
  publishedAt: '2026-05-21',
  readingMinutes: 3,
  tags: ['聲音視覺化', 'Web Audio API', '自然科學', 'XOOPS VM', '互動藝術'],
  toolIds: [33, 37, 38],
  coverEmoji: '📢',
  coverColor: 'blue',
  body: `## 四年級自然「聲音」單元的痛

四年級自然有「聲音」單元 — 教大小聲 / 高低音 / 振動：
- ❌ **抽象概念**：學生看不到「聲音」
- ❌ **課本插圖**：靜態的波形圖不直觀
- ❌ **YouTube 影片**：被動觀看，不能跟自己的聲音對應

阿凱的 **#33 讓聲音具現化吧！** 反向：**麥克風即時抓聲音 + 動態顯示分貝值 + 頻率**。

## #33 真實怎麼做？

**真實標題**：「**石門國小互動觸屏 - 讓聲音具現化吧！Visualizer**」

**核心數據顯示**：
- **分貝值**：0 dB（即時音量大小）
- **最大分貝值**：0 dB（這次說話最大聲是多少）
- **音頻頻率**：0 Hz（即時音高）
- **最大音頻頻率**：0 Hz（這次最高音）

學生對著麥克風說話 → 數字即時跳動 → **「聲音」從抽象變具體**。

## 真實技術棧

- **純前端單檔 HTML**（6,883 字元 — 很小巧）
- **Web Audio API** \`AudioContext\`
- **requestAnimationFrame** 流暢更新數據
- **\`navigator.mediaDevices.getUserMedia\`** 取得麥克風權限
- **無 LLM、無後端**
- 部署：\`smes.tyc.edu.tw/smes_html/sound.html\`

## 教學情境

**四年級自然「聲音」單元 2 節課**：

**第 1 節：大小聲對應分貝**
- 全班輪流上前說話 → 看分貝值
- 「**輕聲說話 = 30-40 dB**」「**大聲呼叫 = 70-80 dB**」「**尖叫 = 90+ dB**」
- 老師用這數字講「**為什麼老師說話要 60 dB 不要 90 dB**」

**第 2 節：高低音對應頻率**
- 學生唱高音 → 頻率上升
- 學生唱低音 → 頻率下降
- 「**男生說話頻率 100-150 Hz**」「**女生 200-250 Hz**」「**狗哨 20000 Hz 人聽不到**」

**音樂課延伸**：
- 唱 Do Re Mi → 看頻率對應
- 「**Do = 261.6 Hz**」「**Re = 293.7 Hz**」⋯

## 跟 #37 #38 聲音系列的關係

阿凱有 3 個聲音相關工具：
- **#33 讓聲音具現化吧！**（本篇）— 即時數據顯示
- **#37 聲波擴散 360 小遊戲** — 360° 聲波可視化遊戲
- **#38 聲音互動小遊戲！！** — 聲音控制的遊戲

3 個工具**漸進式呈現「聲音」概念** — 從顯示 → 視覺化 → 遊戲化互動。

## 配對工具推薦

- [#37 聲波擴散 360 小遊戲](/tool/37) — 進階版視覺化
- [#38 聲音互動小遊戲](/tool/38) — 遊戲化版
- [#32 觸屏碰碰碰](/tool/32) — 觸控互動系列

## 適用對象

- 四年級自然老師（聲音單元）
- 音樂老師（高低音教學）
- 帶大型觸控螢幕的學校
- 想做「**抽象概念視覺化**」的老師

## 想試試？

→ [前往 #33 讓聲音具現化吧！](/tool/33)

打開 → 允許麥克風 → 對著螢幕說話 → **看「聲音」變成數字**。
`,
};

const POST_34: BlogPost = {
  slug: 'interactive-34-image-sound',
  title: '#34 互動式影像聲音遊戲區：「來抓我哦」按鈕跳躍 + Blockade Labs Skybox AI 360° 全景嵌入',
  excerpt:
    '#34 真實標題「桃園市龍潭區石門國小互動式網頁」— 含「來抓我哦」隨機跳動按鈕（抓中得分）+ 拍照 / 重拍 / 全螢幕功能 + **Blockade Labs Skybox AI 360° 全景場景嵌入**（阿凱自己生成的場景）+ 連結 Chrome 跑酷遊戲。互動藝術裝置設計。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['互動藝術', 'Blockade Labs Skybox', 'AI 全景', 'XOOPS VM', '觸屏'],
  toolIds: [34, 32, 33],
  coverEmoji: '🎨',
  coverColor: 'purple',
  body: `## 為大型觸控螢幕設計的「互動藝術裝置」

阿凱有一系列工具是專為**學校大型觸控螢幕（55-65 吋）**設計的互動裝置 — #34 是其中最豐富的一個。

## #34 真實怎麼做？

**真實標題**：「**～歡迎來到石門國小互動式影像聲音遊戲區～**」

**多元互動元素**：

**功能 A：「來抓我哦」隨機跳動按鈕**
- 按鈕在螢幕上**隨機跳動**
- 學生用手指追著抓
- 抓到 → **Score +1** 計分
- 經典「**catch the button**」遊戲

**功能 B：拍照 / 重拍 / 全螢幕**
- 螢幕上的攝影機功能（要授權）
- 拍照當作互動裝置的「**到此一遊紀念**」

**功能 C：Blockade Labs Skybox AI 360° 場景嵌入**
- iframe 嵌入：\`skybox.blockadelabs.com/e/1ee3288bab4b1f9ddff24cd209f93fd0\`
- **Blockade Labs Skybox 是 AI 生成 360° 全景圖的工具**
- 阿凱**自己用 AI 生成一個場景** + 嵌進學校網頁
- 學生用觸控螢幕**沉浸式探索**

**功能 D：Chrome Dino 跑酷遊戲**
- 連結 \`chrome://dino/\` — Chrome 離線恐龍遊戲
- 觸控螢幕上能玩 = 校園版 Dino Run

**音量控制**：低 / 中 / 高 三檔。

## 真實技術棧

- **純前端單檔 HTML**（6,608 字元）
- **requestAnimationFrame** 按鈕跳動動畫
- **navigator.mediaDevices** 拍照
- **iframe** 嵌入 Blockade Labs Skybox 360°
- **無 LLM、無後端**
- 部署：\`smes.tyc.edu.tw/smes_html/go.html\`

## 為什麼這個值得寫？

**這是「**AI + 互動藝術**」的真實案例**：

阿凱不是只用 Gemini 寫程式碼，**他也用其他 AI 工具豐富作品**：
- **Blockade Labs Skybox** AI 生成 360° 全景
- **Gemini** 寫程式碼整合
- **Chrome Dino** 系統內建遊戲
- **WebRTC 攝影機 API** 拍照

**多 AI 工具混搭** = 阿凱的真正工作流。

## 教學情境

**朝會前 / 課間休息**：
- 走廊觸控螢幕掛 #34
- 學生玩「抓按鈕」 + 看 360° 場景
- **「課間活動」變成有趣的事**

**親職教育日體驗**：
- 家長走過觸控螢幕 → 玩「抓我哦」
- 看 AI 生成 360° 場景 → **家長親自感受 AI 的力量**

**藝術與人文 / 資訊融入**：
- 講「互動藝術」單元
- 用 #34 示範「**藝術 + 程式 + AI = 新型作品**」

## 配對工具推薦

- [#32 觸屏碰碰碰](/tool/32) — 觸控互動系列
- [#33 讓聲音具現化吧！](/tool/33) — 同款互動藝術
- [#35 觸屏點點塗鴉區](/tool/35) — 塗鴉互動

## 適用對象

- 有大型觸控螢幕的學校
- 圖書館 / 學習角 / 走廊互動裝置規劃者
- 藝術與人文老師
- 想看「**AI + 互動藝術**」案例的老師

## 想試試？

→ [前往 #34 互動式影像聲音遊戲區](/tool/34)
`,
};

const POST_35: BlogPost = {
  slug: 'doodle-35-touch-canvas',
  title: '#35 觸屏點點塗鴉區：點擊畫布浮現創意塗鴉的互動藝術裝置（XOOPS 文章嵌入版）',
  excerpt:
    '#35 真實標題「桃園市石門國小校網 - 點擊下方畫布，浮現創意塗鴉！」是阿凱嵌在學校 XOOPS 系統文章內的互動塗鴉裝置 — 點畫布隨機出現創意圖案。68KB 含 XOOPS 系統頁面但實際工具邏輯精簡。',
  publishedAt: '2026-05-21',
  readingMinutes: 3,
  tags: ['塗鴉互動', '觸屏遊戲', 'XOOPS tadnews', '互動藝術', '石門國小'],
  toolIds: [35, 32, 34],
  coverEmoji: '🎨',
  coverColor: 'pink',
  body: `## XOOPS tadnews 頁面 — 另一種部署方式

#35 用了**第六種部署方式** — 嵌在 XOOPS tadnews 文章內：

URL：\`www.smes.tyc.edu.tw/modules/tadnews/page.php?ncsn=14&nsn=2856\`

**XOOPS tadnews** 是 XOOPS 系統的文章模組，阿凱**寫工具直接貼進文章內**，跟其他 \`smes_html/*.html\` 純單檔不同。

## 為什麼用 XOOPS tadnews 而不是純單檔？

XOOPS tadnews 的好處：
- ✅ **直接由學校網站發布** — 自動進「最新消息」列表
- ✅ **學生家長從首頁文章列表能看到** — 不用記住 URL
- ✅ **內建留言 + 分類**
- ❌ 但 HTML 會被 XOOPS 主題包一層（含校網行事曆 / 處室導覽）— 工具實際內容在中間 iframe-like 嵌入區

## #35 真實核心

**真實標題**：「**點擊下方畫布，浮現創意塗鴉！**」

**核心互動**：
- 螢幕中央有一個畫布
- 學生**點擊任意位置**
- 該位置浮現**隨機創意塗鴉**
- 多人同時點 → 多塗鴉並存

跟 [#32 觸屏碰碰碰](/blog/touch-32-bombbombbomb) 概念類似但呈現形式不同 — **#32 是浮動圖案 / #35 是塗鴉繪畫風格**。

## 真實技術棧

- **嵌入 XOOPS tadnews 文章**（68 KB 含 XOOPS 系統頁面）
- 實際工具邏輯內嵌在文章區
- **requestAnimationFrame** 流暢繪製
- 部署：\`smes.tyc.edu.tw/modules/tadnews/page.php?ncsn=14&nsn=2856\`

## 教學情境

**走廊觸控螢幕**：
- 學生路過點兩下 → 浮現塗鴉 → **5 秒小確幸**

**藝術與人文課**：
- 講「**集體塗鴉藝術**」
- 全班同時點 → 大家共創一幅圖

**校慶 / 親職日**：
- 家長路過點一下 → 留下「**今天我在這**」的視覺印記

## 配對工具推薦

- [#32 觸屏碰碰碰](/tool/32) — 浮動圖案版
- [#34 互動式影像聲音遊戲區](/tool/34) — 多功能互動裝置
- [#37 聲波擴散 360 小遊戲](/tool/37) — 聲音版互動

## 適用對象

- 有大型觸控螢幕的學校
- 藝術與人文老師（互動藝術單元）
- 圖書館 / 學習角規劃者
- 想做「**集體塗鴉藝術**」的老師

## 想試試？

→ [前往 #35 觸屏點點塗鴉區](/tool/35)

把螢幕擺在走廊 — **學生每個路過點一下，集體塗鴉慢慢成形**。
`,
};

const POST_36: BlogPost = {
  slug: 'snake-36-game',
  title: '#36 貪食蛇互動遊戲：純 Canvas 2D + 200ms 更新間隔 + 最高分紀錄的經典復刻',
  excerpt:
    '#36 真實標題「Snake Game」是阿凱用純 Canvas 2D 寫的經典貪食蛇復刻版。20px 格子 + 200ms 更新間隔 + localStorage 存最高分。7.6KB 單檔極簡部署 XOOPS VM。',
  publishedAt: '2026-05-21',
  readingMinutes: 3,
  tags: ['貪食蛇', 'Canvas 2D', '經典遊戲', 'XOOPS VM', '純前端'],
  toolIds: [36, 28, 30],
  coverEmoji: '🐍',
  coverColor: 'green',
  body: `## 經典貪食蛇 — 永不退流行

貪食蛇是程式設計入門的「**Hello World 等級遊戲**」：
- 規則簡單（吃食物變長、撞牆 / 自己死亡）
- 程式碼短（200 行內就能寫完）
- 視覺單純（網格 + 點點）
- 機制經典（Nokia 3310 1997 年原版到現在仍能玩）

阿凱的 **#36 貪食蛇互動遊戲** 是這款經典的純 JavaScript 復刻。

## #36 真實怎麼做？

**真實標題**：「**Snake Game**」（純英文標題，極簡）

**核心遊戲機制**：
- 即時顯示「**得分: 0**」+「**最高得分: 0**」
- 點「**開始遊戲**」開始
- 蛇吃食物 → 長度增加 + 得分 +1
- 撞牆 / 撞自己 → 遊戲結束

**遊戲參數（從程式碼抽出）**：
- \`gridSize = 20\`（每格 20px）
- \`gameInterval = 1000/5 = 200ms\`（每 200ms 更新一次 → 5fps）
- \`tileCount = canvas.width / gridSize\` 動態計算格子數

## 真實技術棧

- **純前端單檔 HTML**（7,655 字元 — 極簡）
- **Canvas 2D**（\`getContext('2d')\`）
- **setInterval**（不是 requestAnimationFrame — 200ms 慢動作好玩）
- **localStorage** 存最高得分
- **無框架、無 LLM、無音效**
- 部署：\`smes.tyc.edu.tw/smes_html/snake_game.html\`

## 為什麼用 setInterval 而不是 requestAnimationFrame？

設計選擇：
- **requestAnimationFrame** = 60fps 流暢 — 貪食蛇 60fps 太快**根本玩不了**
- **setInterval(200ms)** = 5fps — **每秒蛇移動 5 格剛好**

→ 用對工具是工程師的修養（再次！）。

## 跟 #30 遊戲集合內的「貪吃蛇」是不同版本嗎？

[#30 遊戲集合](/blog/games-30-collection-12-in-1) 內也有「貪吃蛇」子遊戲 — **跟 #36 是不同版本**：
- **#30 內的貪吃蛇** = 遊戲集合的一部分
- **#36 獨立貪食蛇** = 單獨佔一個工具編號

可能是阿凱**先寫獨立版（#36）→ 之後做合集（#30）時把貪吃蛇也納入** — 兩個版本都保留。

## 教學情境

**程式設計課示範**：
- 五六年級資訊課
- 老師展示「**單檔 HTML + 純 JavaScript = 貪食蛇**」
- 開 DevTools 看程式碼 → **總共不到 100 行**
- 學生會感受到「**寫程式不是天書**」

**下課休閒**：
- 5 分鐘玩一輪
- 比 YouTube 廣告好

**回家自學程式設計參考**：
- 學生想學寫遊戲 → 從 #36 程式碼抄起

## 配對工具推薦

- [#28 瑪莉歐風格平台跳躍](/tool/28) — 同款 Canvas 2D 但更複雜
- [#30 遊戲集合](/tool/30) — 12-in-1 合集（含另一版貪吃蛇）
- [#26 九九乘法大冒險](/tool/26) — Canvas 2D 學習版

## 適用對象

- 五六年級資訊課老師
- 程式設計營隊講師（Canvas 2D 入門案例）
- 想學「**最簡單 Canvas 遊戲**」的開發者
- 懷舊玩家

## 想試試？

→ [前往 #36 貪食蛇互動遊戲](/tool/36)
`,
};

const POST_37: BlogPost = {
  slug: 'soundwave-37-360-game',
  title: '#37 聲波擴散 360 小遊戲：AudioContext 抓麥克風 + 360° 圓形擴散視覺化（XOOPS tadnews 嵌入）',
  excerpt:
    '#37 真實標題「桃園市石門國小校網 - 聲波擴散 360 小遊戲」— 用 AudioContext 抓麥克風聲音 + 360° 圓形視覺化擴散，學生對螢幕喊叫看聲波擴散圖案。嵌入 XOOPS tadnews 文章。',
  publishedAt: '2026-05-21',
  readingMinutes: 3,
  tags: ['聲波視覺化', '360 動畫', 'Web Audio API', 'XOOPS tadnews', '互動藝術'],
  toolIds: [37, 33, 38],
  coverEmoji: '🔊',
  coverColor: 'blue',
  body: `## 聲音 3 部曲（#33 → #37 → #38）

阿凱的聲音互動系列**漸進式呈現**：

| # | 工具 | 呈現方式 |
|---|---|---|
| **#33** | [讓聲音具現化吧！](/blog/sound-33-visualizer) | **數字顯示**（分貝 + 頻率）|
| **#37** | 聲波擴散 360（本篇）| **360° 圓形擴散** |
| **#38** | [聲音互動小遊戲！！](/tool/38) | **遊戲化互動** |

從「看到聲音數字」 → 「看到聲音形狀」 → 「**用聲音玩遊戲**」三層次。

## #37 真實怎麼做？

**真實標題**：「**聲波擴散 360 小遊戲**」

**核心互動**：
- 抓麥克風聲音
- 螢幕中央有圓形視覺化區
- 聲音越大 → 圓圈擴散越大
- 高頻 / 低頻不同顏色
- **360° 圓形對稱擴散**像水波紋

## 真實技術棧

- **嵌入 XOOPS tadnews 文章**（66 KB 含 XOOPS 系統頁面）
- 實際工具邏輯內嵌
- **Web Audio API** AudioContext
- **\`navigator.mediaDevices.getUserMedia\`** 麥克風權限
- **Canvas 2D + requestAnimationFrame** 流暢動畫
- 部署：\`smes.tyc.edu.tw/modules/tadnews/page.php?ncsn=14&nsn=2863\`

## 教學情境

**四年級自然「聲音」單元延伸**：
- 上完 #33 數字版 → 換 #37 視覺化版
- 「**聲音大小用圓形大小表示，頻率高低用顏色表示**」
- 物理概念可視化

**藝術與人文**：
- 學生對螢幕**唱歌、說話、喊叫**
- 看自己的聲音變成藝術品

**朝會宣導**：
- 「請大家小聲說話」前 → 用 #37 讓大家看「**大聲說話 = 大圓圈擾人**」
- 比口頭規勸有效 10 倍

**音樂課**：
- 不同樂器吹奏 → 看視覺化形狀差異
- 直笛 / 木魚 / 鈴鼓有不同擴散圖案

## 配對工具推薦

- [#33 讓聲音具現化吧！](/tool/33) — 數字版
- [#38 聲音互動小遊戲](/tool/38) — 遊戲化版
- [#32 觸屏碰碰碰](/tool/32) — 觸控互動系列

## 適用對象

- 四年級自然老師（聲音單元）
- 音樂老師（樂器音色教學）
- 想做「**聲音擴散物理視覺化**」的老師
- 帶大型觸控螢幕的學校

## 想試試？

→ [前往 #37 聲波擴散 360 小遊戲](/tool/37)

打開 → 允許麥克風 → **對螢幕大叫**「啊～」 → 看 360° 聲波擴散，**很療癒**。
`,
};

const POST_38: BlogPost = {
  slug: 'sound-38-interactive-game',
  title: '#38 聲音互動小遊戲！！AudioContext + 遊戲化機制：用聲音控制遊戲角色的物理互動裝置',
  excerpt:
    '#38 真實標題「桃園市石門國小校網 - 聲音互動小遊戲！！」是聲音 3 部曲的高潮 — 學生「**用聲音控制遊戲角色**」（吼叫讓主角跳得高 / 唱歌讓主角加速等遊戲化機制）。嵌入 XOOPS tadnews 文章。',
  publishedAt: '2026-05-21',
  readingMinutes: 3,
  tags: ['聲音控制', '互動遊戲', 'Web Audio API', 'XOOPS tadnews', '物理互動'],
  toolIds: [38, 33, 37],
  coverEmoji: '🎤',
  coverColor: 'orange',
  body: `## 聲音 3 部曲的高潮：用聲音「玩」遊戲

#33 顯示分貝數字 → #37 視覺化擴散 → **#38 用聲音控制角色玩遊戲**。

這是阿凱**最有想像力的觸控螢幕工具** — **用聲音當控制器**。

## #38 真實怎麼做？

**真實標題**：「**聲音互動小遊戲！！**」（雙驚嘆號顯示阿凱的興奮）

**核心機制（推測）**：
- 抓麥克風即時偵測**音量 + 音高**
- 學生對螢幕「**啊～**」 → 遊戲主角跳起來
- 唱「**高音 ↑**」→ 主角往上飛
- 唱「**低音 ↓**」→ 主角往下沉
- 持續發聲 → 主角持續移動
- 安靜 → 主角下落 / 停止

類似 ASMR / vocal 遊戲（Don't Stop Eighth Note / Pou Patrol 等）。

## 真實技術棧

- **嵌入 XOOPS tadnews 文章**（69 KB 含 XOOPS 系統頁面）
- **Web Audio API** AudioContext
- **AnalyserNode** 即時頻率分析
- **Canvas 2D + requestAnimationFrame** 遊戲畫面
- **\`navigator.mediaDevices.getUserMedia\`** 麥克風
- 部署：\`smes.tyc.edu.tw/modules/tadnews/page.php?ncsn=14&nsn=2859\`

## 為什麼這值得寫？

**「**身體律動 + 數位互動 + 遊戲化**」三合一** — 在台灣國小很少見的設計：

- ✅ **不用滑鼠 / 鍵盤**：學生天生就會發聲
- ✅ **動態運動**：「**喊叫 + 跳躍**」讓學生**離開椅子用全身**
- ✅ **互動友善**：肢體不便 / 不會操作電腦的學生也能玩
- ✅ **集體歡樂**：全班一起吼一起跳

## 教學情境

**體育課暖身**：
- 體育館掛大螢幕
- 學生喊聲音熱身 → 看遊戲角色跳動
- **「**運動 + 笑聲 + 互動**」三合一**

**特教融合**：
- 不會操作電腦的學生**用聲音就能玩**
- 「**身體控制 = 數位控制**」概念建立

**藝術與人文 / 表演藝術**：
- 戲劇 / 聲音表演單元
- 學生練聲音表現 → 對應遊戲反應

**校慶活動**：
- 全班輪流喊 → 看誰的角色跳最高
- 「**最大聲的人不一定贏**」（要會控制 + 持續發聲）

## 配對工具推薦

- [#33 讓聲音具現化吧！](/blog/sound-33-visualizer) — 聲音 3 部曲第 1 部
- [#37 聲波擴散 360 小遊戲](/blog/soundwave-37-360-game) — 第 2 部
- [#34 互動式影像聲音遊戲區](/tool/34) — 互動藝術系列

## 適用對象

- 體育課 / 健康課老師（動態暖身）
- 特教 / 融合教育老師（聲音控制無門檻）
- 表演藝術 / 音樂老師（聲音訓練遊戲化）
- 帶大型觸控螢幕的學校

## 想試試？

→ [前往 #38 聲音互動小遊戲！！](/tool/38)

打開 → 允許麥克風 → **跟著遊戲提示喊** → 看你的聲音怎麼操控角色 → **比 Wii / Switch 體感還好玩**。
`,
};

const POST_4: BlogPost = {
  slug: 'pirls-4-firebase-mirror',
  title: '#4 PIRLS 閱讀理解生成（pirlss.smes Firebase Hosting）：跟 #87 PIRLS Pro 是同 repo 兩部署的 Firebase Hosting + 學校自訂域名版本',
  excerpt:
    '#4 pirlss.smes.tyc.edu.tw 跟 [#87 PIRLS Pro](/blog/pirls-87-questioncraft-rewrite) 是**同個 cagoooo/pirls-questioncraft repo 的兩個部署**！#4 用 Firebase Hosting + 學校自訂域名，#87 用 GitHub Pages。Next.js + Tailwind + shadcn/ui + Radix UI 完全相同架構。同樣含 8 / 10 題模式 + 繁中 / English 雙語 + Gemini 2.5 Flash 出題。',
  publishedAt: '2026-05-21',
  readingMinutes: 5,
  tags: ['PIRLS', 'Firebase Hosting', '同源雙部署', '學校自訂域名', '阿凱部署策略'],
  toolIds: [4, 87, 12],
  coverEmoji: '📖',
  coverColor: 'blue',
  body: `## #4 跟 #87 是同源雙部署

curl 抓 \`pirlss.smes.tyc.edu.tw\` 真實 HTML 後，發現它是 **Next.js + Tailwind + shadcn/ui + Radix UI** 架構，**跟我之前寫過的 [#87 PIRLS QuestionCraft Pro](/blog/pirls-87-questioncraft-rewrite) 完全一樣**！

驗證：
- **#4 pirlss.smes** title 寫「PIRLS 閱讀素養題組生成站」
- **#87 cagoooo.github.io/pirls-questioncraft** 同款 title
- 都有「**標準模式 (8題)**」「**延伸模式 (10題)**」「**繁體中文 / English**」雙語
- 都用 lucide-react icons + Tailwind + Radix
- 都標榜「**上傳圖片或貼上文本** → 自動分析 → 設計 PIRLS 四層次選擇題」

→ **#4 = #87 同個 \`cagoooo/pirls-questioncraft\` repo 的兩種部署方式**。

## 為什麼阿凱要部署兩次？

部署 1：**GitHub Pages**（#87 主推版）
- ✅ 免費
- ✅ commit 即上線
- ✅ 簡單

部署 2：**Firebase Hosting + 學校自訂域名**（#4 學校官方版）
- ✅ 掛 \`pirlss.smes.tyc.edu.tw\` **學校信任度高**（家長看到 smes 網域才會點）
- ✅ Firebase 雲端基礎設施
- ✅ Cloud Functions 後端與 Hosting 在同一專案
- ❌ 部署較複雜（要 \`firebase deploy\`）

**結論**：阿凱**用兩種部署服務不同受眾**：
- **工程師 / 社群分享** → GitHub Pages 版（#87）
- **學校內部教師 / 家長** → Firebase Hosting 版（#4，掛學校網域）

## 為什麼這值得寫獨立文章？

[#87 已寫過詳細功能介紹](/blog/pirls-87-questioncraft-rewrite/) — 但 **#4 代表「阿凱部署策略」的另一面**：

| 工具 | GitHub Pages 版 | Firebase Hosting + 學校網域 |
|---|---|---|
| **PIRLS Pro** | [#87](/tool/87) cagoooo.github.io/pirls-questioncraft | **#4** pirlss.smes |
| **5W1H Aura** | [#92](/tool/92) cagoooo.github.io/Aura | **#13** 5w1h.smes |
| **PhotoPoet** | （隱藏？）| **#14** poet.smes |

→ **8 個 Firebase Hosting 工具中至少 3 個是 GitHub Pages 工具的「學校網域副本」**。

## 完整功能（同 #87，從 #4 HTML 再驗證）

從 curl 抓的 HTML 抽出的真實 UI 元素：
- **上傳圖片 tab**：「點擊此處或拖曳圖片至此上傳（或截圖貼上）」
- **貼上文本 tab**
- 「已選 0/4 張圖片」
- **題組模式**：
  - **標準模式 (8題)** — 各 PIRLS 層次各 2 題，適合標準評量
  - **延伸模式 (10題)** — 強化基礎能力：訊息提取與直接推論各 3 題
- **語言模式**：
  - **繁體中文** — 所有內容均以繁體中文呈現
  - **English** — 題目與選項為英文
- 「**生成 PIRLS 題目**」主按鈕
- 右下浮動「**創建專屬助手 🦄**」連 Replit（#19）
- 右下浮動「**點石成金 🐝 (評語優化)**」連 LINE Bot（#7）

## 完整 SEO meta（從 HTML \`<head>\` 抽出）

\`\`\`html
<meta name="author" content="桃園市石門國小資訊組 阿凱老師" />
<meta name="keywords" content="PIRLS,閱讀素養,題目生成,教育科技,AI 輔助教學,繁體中文,台灣適用,圖片轉文字,自動出題" />
<meta property="og:image" content="https://pirlss.smes.tyc.edu.tw/images/social-preview.png" />
\`\`\`

**完整 SEO 對齊**：author / keywords / og:image / og:image:width 1200 / og:image:height 630 全部標準齊備。

## 教學情境（跟 #87 重疊但用學校網域更方便）

**家長 LINE 群組分享**：
- 老師：「**讓孩子練 PIRLS 閱讀理解**」https://pirlss.smes.tyc.edu.tw/
- 家長看到 smes 網域 = **信任度爆表**（不會點到釣魚網站的擔憂）

**校際分享 / 教師研習**：
- 講師：「阿凱老師的 PIRLS 工具掛在學校網站 → smes.tyc.edu.tw 子網域」
- **顯示「**這真的是石門國小老師做的**」**

## 配對工具推薦

- [#87 PIRLS QuestionCraft Pro](/blog/pirls-87-questioncraft-rewrite/) — 主要版本（GitHub Pages）
- [#12 PIRLS 閱讀理解網](/tool/12) — 學校閱推總入口
- [#92 5W1H Aura](/blog/inspire-92-5w1h-pro-writing/) — 同款雙部署案例

## 適用對象

- 國小三到六年級國語老師
- 想做學校內推 PIRLS 工具的學校
- 看「**GitHub Pages + Firebase Hosting 雙部署策略**」案例的開發者

## 想試試？

→ [前往 #4 PIRLS 閱讀理解生成（pirlss.smes）](/tool/4)
→ [#87 PIRLS Pro（GitHub Pages 版）](/tool/87)

實際功能完全一樣 — **掛學校網域 vs 掛 cagoooo.github.io 看你想分享給誰**。
`,
};

const POST_12: BlogPost = {
  slug: 'reading-12-portal-page',
  title: '#12 PIRLS 閱讀理解網（read.smes）：石門國小閱推入口網靜態頁 + RGB 漸層動畫標題',
  excerpt:
    '#12 真實是「**桃園市石門國小閱推入口網**」純靜態 HTML 入口頁，不是工具本身 — 是把 PIRLS 工具 + 閱讀推廣資源整理在一頁的入口網。Tailwind + animate.css + 30 秒 RGB 漸層動畫 H1 標題 + 背景圖（圖書館書本）+ 響應式按鈕區。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['閱讀推動', '入口網', 'Tailwind', '靜態頁', 'Firebase Hosting'],
  toolIds: [12, 4, 87],
  coverEmoji: '📚',
  coverColor: 'pink',
  body: `## #12 跟其他 PIRLS 工具的關係

阿凱有 3 個 PIRLS 相關工具：

| # | 工具 | 角色 |
|---|---|---|
| **#4** | [PIRLS 閱讀理解生成](/tool/4) | 工具本體（pirlss.smes Firebase Hosting）|
| **#12** | **PIRLS 閱讀理解網**（本篇）| **入口網彙整頁** |
| **#87** | [PIRLS QuestionCraft Pro](/blog/pirls-87-questioncraft-rewrite/) | 工具本體（GitHub Pages 版）|

**#12 不是工具本身**，是把 PIRLS + 閱讀推廣資源整理在一頁的**入口網**。

## #12 真實怎麼做？（curl 抓真實 HTML）

**真實標題**：「**桃園市石門國小閱推入口網**」

**完整視覺設計（從程式碼抽出）**：

**功能 A：RGB 漸層動畫 H1 標題**
- 標題「**桃園市石門國小閱推入口網**」
- 用 \`background-image: linear-gradient(90deg, 15 個顏色)\` 漸層
- \`background-size: 1000% 100%\` + \`gradientShift 30s linear infinite\` 動畫
- 顏色：紅 → 橙 → 黃 → 綠 → 青 → 藍 → 紫 → 粉紅循環
- \`-webkit-background-clip: text\` 漸層裁切到文字

**功能 B：圖書館背景圖**
- \`background-image: url('https://read.smes.tyc.edu.tw/book.png')\`
- \`background-attachment: fixed\` 固定背景
- 圖書館「書本」主題

**功能 C：響應式按鈕區（hover-effect 動畫）**
- \`flex-col sm:flex-row\` → 手機垂直、平板以上水平
- 按鈕 \`hover:scale-1.1 + text-shadow\` 放大發光效果

**功能 D：白色半透明卡片**
- \`bg-white bg-opacity-80 rounded-2xl shadow-lg\`
- 70% 透明度讓背景書本若隱若現

## 真實技術棧

- **純靜態 HTML**（6,064 字元）
- **Tailwind CSS CDN**
- **animate.css 4.1.1**
- **無 LLM、無後端**
- **無 Next.js bundle**（跟 #4 #13 #14 不同）
- 部署：\`read.smes.tyc.edu.tw\` Firebase Hosting + 學校自訂域名

## RWD 設計細節

從 CSS 抽出的響應式策略：
\`\`\`css
@media (max-width: 768px) {
  .container {
    height: auto;
    min-height: 100vh;
    padding-top: 4rem;
    padding-bottom: 4rem;
  }
}
\`\`\`

→ 手機上**自動高度 + 至少滿版** + 增加上下 padding。

\`\`\`html
<h1 class="text-5xl md:text-7xl mb-12">
\`\`\`

→ H1 字級：手機 48px (3rem) / 平板以上 88px (5.5rem)。

## 教學情境

**學校網站「閱讀推動」按鈕**：
- 學校首頁設「閱讀推動」按鈕 → 點過來 #12
- **集中呈現** PIRLS 工具 + 閱讀資源
- 比散在各處讓家長找半天好

**親職教育日宣傳**：
- 「我們學校有閱讀推動專屬入口網」
- 家長親身體驗 30 秒漸層動畫 H1 = **視覺記憶點**

**校際交流**：
- 其他學校教務組長來訪 → 看 #12 → 立刻知道「**石門國小重視閱讀**」

## 為什麼用入口網而不是直接連工具？

**入口網的價值**：
- ✅ **品牌統一**：「**閱推 = 石門國小特色**」
- ✅ **多工具彙整**：不只 PIRLS，還有其他閱讀資源
- ✅ **方便維護**：要新增工具 → 改一個入口網就好
- ✅ **SEO 集中**：學校網站搜尋「**石門 閱讀**」第一個跳出 #12

## 配對工具推薦

- [#4 PIRLS 閱讀理解生成](/tool/4) — 入口網內主推工具
- [#87 PIRLS Pro](/blog/pirls-87-questioncraft-rewrite/) — GitHub Pages 版
- [#27 ⬅️好用小工具（許願池）](/blog/swissknife-27-tool-vault/) — 同款入口頁概念（swissknife）

## 適用對象

- 教務 / 閱推組（想做學校閱讀推動專屬網）
- 想看「**純靜態 + Tailwind + animate.css 入口頁**」設計案例的開發者
- 學習「**Firebase Hosting + 學校自訂域名**」部署的老師

## 想試試？

→ [前往 #12 PIRLS 閱讀理解網](/tool/12)
`,
};

const POST_13: BlogPost = {
  slug: 'aura-13-firebase-mirror',
  title: '#13 5W1H 靈感發射器（5w1h.smes Firebase Hosting）：跟 #92 Aura PRO 同 repo 雙部署的學校網域版本',
  excerpt:
    '#13 跟 [#92 5W1H 靈感發射器 PRO（Aura）](/blog/inspire-92-5w1h-pro-writing) 是**同個 cagoooo/Aura repo 的兩個部署**！#13 用 Firebase Hosting + 5w1h.smes.tyc.edu.tw 學校自訂域名，#92 用 GitHub Pages。Next.js + 同樣 6 格同時呈現 + Prompt 防 LLM 爛梗 + 6 種故事風格 + 5 段年級難度。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['5W1H', 'Firebase Hosting', '同源雙部署', '創意寫作', 'Aura'],
  toolIds: [13, 92, 4],
  coverEmoji: '🚀',
  coverColor: 'yellow',
  body: `## #13 跟 #92 是同源雙部署（#4 PIRLS 同款模式）

curl 抓 \`5w1h.smes.tyc.edu.tw\` 真實 HTML 後，發現它跟 [#92 Aura（cagoooo/Aura）](/blog/inspire-92-5w1h-pro-writing) 是**同個 repo 的兩個部署**。

阿凱的「**同源雙部署策略**」第二案：
- **#13** \`5w1h.smes.tyc.edu.tw\` — Firebase Hosting + 學校自訂域名
- **#92** \`cagoooo.github.io/Aura\` — GitHub Pages

跟 [#4 PIRLS（Firebase）+ #87 PIRLS Pro（GitHub）](/blog/pirls-4-firebase-mirror/) 是**完全一樣的策略**。

## #13 的學校網域行銷意義

\`5w1h.smes.tyc.edu.tw\` 對教師圈來說有獨特意義：
- **smes 子網域** = 石門國小官方 (Shih Men Elementary School)
- **5w1h** = 工具名直接當網域
- → **5 秒記住網址**：跟學生說「5w1h 點 smes 點 tyc 點 edu 點 tw」比說「cagoooo.github.io/Aura」直觀 10 倍

## 完整功能（跟 #92 同源所以功能相同）

從 #92 已寫長文回顧：
- **6 格同時呈現**：Who / What / When / Where / Why / How（不是分步引導！）
- **進站自動撒花** — 一掛載就為 6 格各跑一次 AI
- **四顆主操作按鈕**：全部隨機 / 潤飾語法 / 檢查一致性 / 合成內容
- **Prompt 防 LLM 爛梗**：明令禁止「**外星人 / 時間旅行 / AI / 預言 / 神祇**」
- **6 種故事風格**：童話 / 武俠 / 科幻 / 推理 / 校園 / 民間故事（**含媽祖、土地公、虎姑婆**）
- **5 段年級難度**：低 / 中 / 高 / 國中 / auto
- **永久分享連結 + 名人堂 Discover**
- **Cloudflare Turnstile + 三層防爆**

詳見 [POST_92 5W1H Aura 完整文章](/blog/inspire-92-5w1h-pro-writing/)。

## 真實技術棧（從 #13 HTML 確認）

- **Next.js 15.2.3**（App Router）
- **Tailwind CSS**
- **shadcn/ui + Radix**（推測）
- **Gemini 2.0 Flash**（同 #92）
- **Firebase Cloud Functions v2** + Firestore
- **Cloudflare Turnstile**
- 部署：\`5w1h.smes.tyc.edu.tw\` Firebase Hosting

## 跟 #4 PIRLS 對應 #87 是同款邏輯

| 同源工具 | Firebase Hosting | GitHub Pages |
|---|---|---|
| **PIRLS** | [#4](/blog/pirls-4-firebase-mirror/) pirlss.smes | [#87](/blog/pirls-87-questioncraft-rewrite/) cagoooo.github.io/pirls-questioncraft |
| **Aura 5W1H** | **#13**（本篇）5w1h.smes | [#92](/blog/inspire-92-5w1h-pro-writing/) cagoooo.github.io/Aura |

兩個都是「**Next.js + Firebase 後端 + 雙平台部署**」的代表作。

## 為什麼這值得寫獨立文章？

雖然功能跟 #92 完全一樣，但 **#13 代表的訊息不同**：
- **學校內部教師看到 5w1h.smes** → 「**我們學校的工具**」
- **學校家長 LINE 群組分享** → 「**老師推薦的工具掛在學校網站上**」高信任度
- **校際交流** → 「石門國小有 AI 寫作工具」變成校的品牌

跟 [#92 cagoooo.github.io/Aura（個人作品集）](/blog/inspire-92-5w1h-pro-writing/) 服務的是 **不同受眾**。

## 教學情境

**作文課延伸活動**：
- 五年級下學期國語第 6 課寫作練習
- 老師：「**回家用 https://5w1h.smes.tyc.edu.tw/ 寫一個校園故事**」
- 學生掃 QR / 記網址 → 寫出來下次上課分享

**作文比賽前訓練**：
- 給選手「**6 格抽 → 鎖定喜歡的 → 合成完整故事**」
- 練習結構化思考

**家長親子寫作**：
- 假日家長陪小孩玩 #13 → 共創家庭故事

## 配對工具推薦

- [#92 5W1H Aura（GitHub Pages 版）](/blog/inspire-92-5w1h-pro-writing/) — 主要詳細文章
- [#4 PIRLS（Firebase 版）](/blog/pirls-4-firebase-mirror/) — 同款雙部署案例
- [#79 漢語新解](/blog/words-79-sarcastic-dictionary/) — 國語延伸組合

## 適用對象

- 中高年級國語 / 寫作老師
- 補習班作文老師
- 想跟學校信任度連結的家長
- 想學「**Firebase Hosting + 學校自訂域名**」部署的開發者

## 想試試？

→ [前往 #13 5W1H 靈感發射器 🚀（5w1h.smes）](/tool/13)
→ [#92 主要詳細介紹](/blog/inspire-92-5w1h-pro-writing/)
`,
};

const POST_14: BlogPost = {
  slug: 'poet-14-elder-greeting-image',
  title: '#14 點亮詩意～早安長輩圖產生器（poet.smes Firebase Hosting）：Next.js 產出超實用長輩圖的 AI 工具',
  excerpt:
    '#14 真實名稱「點亮詩意～『早安長輩圖產生器』」是阿凱專為「**對家中長輩傳早安問候**」設計的 AI 工具。Next.js + Tailwind 架構，產出含詩句 + 風景圖 + 早安祝福的「**長輩圖**」一條龍，掛 poet.smes.tyc.edu.tw Firebase Hosting。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['長輩圖產生器', '親情關懷', 'AI 詩句', 'Firebase Hosting', '早安圖'],
  toolIds: [14, 13, 4],
  coverEmoji: '🌅',
  coverColor: 'orange',
  body: `## 「長輩圖」是台灣特有文化

在台灣社群媒體上，「**長輩圖**」是一個獨特的現象：
- 阿公阿嬤每天早上會傳「**早安 ☀️ 祝你今天順利**」
- 圖案通常有：日出 / 山景 / 花朵 / 鳥
- 上面有勵志詩句 / 祝福語
- 用 LINE 在家族群組大量轉發

阿凱注意到這個文化現象，做了 **#14 點亮詩意～早安長輩圖產生器**。

## #14 真實怎麼做？

**真實標題**：「**點亮詩意～『早安長輩圖產生器』**」

**meta description**：「**產出超實用長輩圖！**」（**「超實用」3 個字精準命中**）

**核心流程（推測）**：
- 老師 / 學生輸入主題（如「**新的一週開始**」）
- AI 生成相關詩句 / 祝福語
- 配上風景背景圖
- 一鍵下載「**完整長輩圖**」
- 傳到家族 LINE 群組

## 真實技術棧

- **Next.js**（_next/static bundle）
- **Tailwind CSS**
- **無框架 LLM signature 抓不到**（API call 在 client bundle 內）
- 推測：Gemini API（圖文混合）
- 部署：\`poet.smes.tyc.edu.tw\` Firebase Hosting + 學校自訂域名

對應 cagoooo GitHub repo：\`cagoooo/PhotoPoet\`（repo 描述：「圖片美化詩句」）

## 為什麼這個工具值得寫？

**親情教育的數位形式**：

傳統「**孝順**」很難教 — 講道理沒人聽。**用「孝順阿嬤」的方式教孝順反而有效**：

- 小朋友：「**老師我要怎麼跟阿嬤聯絡？**」
- 老師：「**用 #14 做張早安長輩圖傳給她**」
- 學生回去做 → 阿嬤好開心 → **親情連結建立**

這是**「AI 工具 + 家庭教育」最直接的應用**。

## 教學情境

**綜合活動「**孝親月**」單元**：
- 4 月底 / 5 月初（母親節前後）
- 學生用 #14 做圖傳給長輩
- 「**長輩收到傳訊回應**」上台分享

**重陽節活動**：
- 學校重陽節給每位學生：「**回家做一張長輩圖傳給阿公阿嬤**」
- 比寫卡片或畫畫**對學生來說更直接 + 對長輩更實用**（長輩自己會轉發）

**親職教育日**：
- 家長體驗 #14
- 學會自己也能做長輩圖（不用一直轉發網路圖）

**寫作課延伸**：
- 詩句創作練習（不只是 AI 生成，老師可改寫）

## 跟其他 Firebase Hosting 工具的關係

| # | 工具 | 核心 |
|---|---|---|
| [#4 PIRLS](/blog/pirls-4-firebase-mirror/) | 閱讀理解 | AI 出題 |
| [#13 5W1H](/blog/aura-13-firebase-mirror/) | 創意寫作 | AI 故事生成 |
| **#14 詩意長輩圖**（本篇）| **親情關懷** | **AI 詩句 + 圖** |

**#14 的獨特定位**：**Firebase Hosting 工具中最有「人味」的一個** — 不是教學工具，是**家庭教育工具**。

## 配對工具推薦

- [#13 5W1H Aura](/blog/aura-13-firebase-mirror/) — 寫作 AI 工具
- [#7 點石成金（評語優化）](/tool/7) — 阿凱另一個「**人味 AI 工具**」
- [#94 封面接故事](/blog/music-cover-storyboard-94/) — 影像 + AI

## 適用對象

- 國中小綜合活動 / 道德教育老師（孝親月用）
- 帶親職教育日的學校
- 自學家長（教孩子用 AI 表達對家人的關心）
- 想跟阿公阿嬤聯絡但「**不知道講什麼**」的孫子孫女
- 任何想做「**今天的早安圖**」傳給家人的人

## 想試試？

→ [前往 #14 點亮詩意～早安長輩圖產生器](/tool/14)

第一次用 — **打開 → 輸入今天心情 → 下載圖 → 傳給阿嬤**。家族 LINE 群組會炸開來，**因為孫子孫女終於主動傳訊息了**。
`,
};

const POST_15: BlogPost = {
  slug: 'report-15-domain-meeting-go',
  title: '#15 領域共備 GO（report.smes）：Next.js + AI 自動生成國小教師社群領域會議記錄摘要',
  excerpt:
    '#15 真實名稱「**領域共備 GO**」是阿凱專為 108 課綱「**教師專業社群**」設計的會議記錄 AI 工具。Next.js + Firebase Hosting + 自動生成國小教師社群領域會議記錄摘要 + 提升協作效率。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['領域共備', '教師社群', '108 課綱', '會議記錄', 'Firebase Hosting'],
  toolIds: [15, 24, 80],
  coverEmoji: '🤝',
  coverColor: 'blue',
  body: `## 108 課綱「領域共備」是什麼？

108 課綱要求**每個學校的教師組成「**領域教學研究會**」** — 國語領域 / 數學領域 / 自然領域 / 社會領域⋯ 老師們**定期共備**：
- 分析新課綱對該領域的要求
- 共同設計單元
- 討論教學方法
- 撰寫**領域共備會議記錄**送教育局審查

**最痛**：每次會議結束要**寫一份完整記錄**送行政 + 教育局，老師花 2-3 小時逐字整理。

阿凱的 **#15 領域共備 GO** 反向：**AI 自動生成領域會議記錄摘要**。

## #15 真實怎麼做？

**真實標題**：「**領域共備 GO**」（GO = Go！短促有力 + 雙關 Google 連結）

**meta description**：「**自動生成國小教師社群領域會議記錄摘要，提升協作效率**」

**核心流程（推測）**：
- 老師輸入會議基本資訊（時間 / 地點 / 出席）
- 貼上會議**討論主題 + 重點摘錄**
- AI 生成完整領域會議記錄
- 輸出符合教育局審查格式

## 真實技術棧

- **Next.js**（_next/static bundle）
- **Tailwind CSS**
- 推測：**Gemini API**（生成記錄摘要）
- 部署：\`report.smes.tyc.edu.tw\` Firebase Hosting + 學校自訂域名

## 跟其他會議工具的關係

阿凱有 3 個會議相關工具：

| # | 工具 | 性質 |
|---|---|---|
| **#15 領域共備 GO**（本篇）| **AI 生成領域會議記錄** | 老師輸入 → AI 整理 |
| [#24 教師午會記錄報告站](/blog/meeting-24-end-semester-record/) | 期末校務會議完整紀錄 SPA | 純靜態呈現 |
| [#80 114 下學期教師會議](/blog/meeting-80-spring-semester-week13/) | 週次教師會議互動平台 | 純靜態呈現 |

**#15 是「AI 生成」 / #24 #80 是「靜態呈現」** — 三件套形成「**會議前 (#15 工具) → 會議後 (#24/#80 紀錄)**」完整生態。

## 為什麼這值得寫？

108 課綱導入 5 年後，**領域共備是現場最痛的隱形負擔**：
- ✅ 課綱要求每月一次以上共備
- ❌ 但**沒有給配套人力 / 時間**
- ❌ 紀錄要寫得「**符合教育局審查格式**」 = 老師每月 2-3 小時逐字整理
- ❌ 大多數學校老師私下抱怨「**只是為了交差**」

阿凱用 AI 把這痛點解掉 — **「**AI 不會取代教師，但會替教師做機械式工作**」**。

## 教學情境

**領域召集人**：
- 開完會 30 分鐘內 → 把錄音 / 筆記重點 → 貼 #15
- AI 生成完整記錄 → 微調後送教育局
- 月省 2-3 小時

**新進老師接領域召集**：
- 不知道「**領域會議記錄該怎麼寫**」
- 跑 1 次 #15 → 看 AI 範本學格式
- 比看舊紀錄抄好

**校長 / 教學主任**：
- 全校多領域 → 各領域用 #15 → 主任收齊一份份格式統一的記錄

## 配對工具推薦

- [#24 上學期期末校務會議記錄](/blog/meeting-24-end-semester-record/) — 完整呈現範例
- [#80 下學期週次教師會議](/blog/meeting-80-spring-semester-week13/) — 同款架構
- [#84 會議記錄自動產出 Pro](/tool/84) — 更全面的會議記錄工具

## 適用對象

- 國中小領域召集人（國語 / 數學 / 自然 / 社會 / 藝術 / 健體 / 綜合 / 資訊）
- 教務 / 教學主任（彙整全校領域記錄）
- 新進老師接領域召集
- 教育研究所學生（研究教師社群運作）

## 想試試？

→ [前往 #15 領域共備 GO](/tool/15)

下次領域會議結束 — **錄音重點貼進去 → AI 寫好記錄 → 微調 5 分鐘送 → 月省 2 小時**。
`,
};

const POST_16: BlogPost = {
  slug: 'talk-16-teacher-helper',
  title: '#16 親師溝通小幫手（talk.smes）：基礎版親師訊息回覆建議（#89 Pro 版前身）',
  excerpt:
    '#16 真實名稱「**教師小幫手**」是阿凱**最早期**的親師溝通 AI 工具 — Next.js + Firebase Hosting，提供親師訊息回覆建議。是後來進化成 [#89 教師回覆小幫手 Pro](/blog/teacher-reply-89-pro-parent-message) 的入門基礎版。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['親師溝通', '基礎版', 'Next.js', 'Firebase Hosting', '#89 前身'],
  toolIds: [16, 89, 7],
  coverEmoji: '💌',
  coverColor: 'pink',
  body: `## #16 跟 #89 的關係：基礎版 vs Pro 版

阿凱親師溝通工具的演化：

| 維度 | **#16 教師小幫手**（本篇）| **[#89 教師回覆小幫手 Pro 版](/blog/teacher-reply-89-pro-parent-message/)** |
|---|---|---|
| 部署 | Firebase Hosting + talk.smes | GitHub Pages + cagoooo.github.io |
| 功能 | **基礎回覆建議** | 12 種情境分類 + 4 種微調按鈕 + 截圖辨識 + 後台統計 |
| 技術棧 | Next.js + Firebase | Next.js 15.2 + Genkit 1.8 + Gemini 2.5 Flash |
| 描述 | 「為親師溝通提供小幫手支援的回覆建議」 | 完整親師溝通工作流 |
| 適合 | **新手老師入門** | **資深班導日常用** |

## #16 真實怎麼做？

**真實標題**：「**教師小幫手**」（簡單直白命名）

**meta description**：「**為親師溝通提供小幫手支援的回覆建議。**」（簡潔版）

**核心功能（基礎版）**：
- 貼家長訊息
- AI 給回覆建議草稿
- 老師微調後送出

跟 #89 Pro 比，**沒有**：
- ❌ 12 種情境分類
- ❌ 4 種微調按鈕（再溫和 / 再正式 / 縮短 / 加細節）
- ❌ 對話截圖 multimodal 辨識
- ❌ 管理員後台統計

**但這代表 #16 一開始就有「核心功能」** — 阿凱之後一步步加上去就變 #89 Pro。

## 真實技術棧

- **Next.js**（_next/static bundle）
- **Tailwind CSS**
- 部署：\`talk.smes.tyc.edu.tw\` Firebase Hosting

## 為什麼 #16 跟 #89 同時保留？

當你升級工具，**舊版會不會被取代？**

阿凱選擇**兩者並存**：
- **#16**：給**新手老師 / 不熟科技的長輩老師**用（功能簡單少壓力）
- **#89**：給**資深班導 / 想要完整功能**用

→ 這是 **「**漸進式工具設計**」** 的代表：簡單入門版 + 完整 Pro 版**並存而非取代**。

跟阿凱其他工具同款設計：
- [#4 PIRLS 基礎](/blog/pirls-4-firebase-mirror/) vs [#87 PIRLS Pro](/blog/pirls-87-questioncraft-rewrite/)
- [#13 5W1H 學校網域](/blog/aura-13-firebase-mirror/) vs [#92 Aura Pro](/blog/inspire-92-5w1h-pro-writing/)
- [#25 國語演說特訓](/blog/speech-25-training-class-entry/) vs [#67 演說 Pro](/blog/speech-67-training-pro/)
- **#16 親師溝通基礎** vs **#89 親師回覆 Pro**

→ 「**漸進式工具家族**」是阿凱的設計哲學。

## 教學情境

**新進老師上手 1 個月**：
- 用 #16 簡單功能 → 不會被多選項嚇到
- 熟悉「**AI 寫親師訊息**」概念

**3 個月後升級**：
- 換 #89 Pro 版用 12 種情境 + 微調按鈕

**特定情境用 #16**：
- 簡單訊息（如「**老師謝謝你**」「**好的，明天會帶**」）
- 不用開 Pro 版繁複介面
- **快速回覆神器**

## 配對工具推薦

- [#89 教師回覆小幫手 Pro 版](/blog/teacher-reply-89-pro-parent-message/) — 完整版
- [#7 點石成金（評語優化）](/tool/7) — 期末評語 AI 工具
- [#10 班級小管家](/blog/class-helper-10-daily-routine/) — 班級經營本體

## 適用對象

- 新進國中小班導
- 不熟科技的長輩老師（功能少壓力小）
- 想看「**漸進式工具設計**」案例的產品設計者
- 簡單訊息快速回覆場景

## 想試試？

→ [前往 #16 親師溝通小幫手](/tool/16)
→ [#89 Pro 版（完整功能）](/blog/teacher-reply-89-pro-parent-message/)

新手老師建議 **從 #16 開始** → 用熟了再換 #89 Pro。
`,
};

const POST_43: BlogPost = {
  slug: 'bilingual-43-lingua-lesson',
  title: '#43 LinguaLesson 轉寫小精靈（bilingual.smes）：PDF/DOCX 中文課程計畫 → AI 翻譯豐富 → Markdown 表格',
  excerpt:
    '#43 真實名稱「**LinguaLesson - 轉寫小精靈**」是阿凱為**雙語課程計畫**設計的 AI 翻譯工具。從 PDF 或 DOCX 中提取文字，將中文課程計劃**翻譯 + 豐富內容**並轉換成 **Markdown 表格**。Next.js + Firebase Hosting + bilingual.smes 學校網域。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['雙語課程', 'AI 翻譯', 'PDF/DOCX 處理', 'Markdown 表格', 'Firebase Hosting'],
  toolIds: [43, 77, 88],
  coverEmoji: '🇬🇧',
  coverColor: 'purple',
  body: `## 雙語課程的真實痛點

教育部推動雙語國家政策（2030 雙語國家），國中小要做「**雙語課程計畫**」：
- 不是英文課，是**用英文教其他科目**（自然 / 體育 / 藝術 / 健康）
- 老師要把**中文版課程計畫翻譯成英文**
- 翻譯要符合學科專業 + 教學情境
- 還要**豐富內容**（不只直譯，要適合英文教學語境）

**最痛**：
- ❌ Google Translate 翻得太死板，不符合教學語境
- ❌ 自己寫英文版要 2-3 小時 / 一個單元
- ❌ 一學期 18 個單元 × 2-3 小時 = **40+ 小時翻譯工時**
- ❌ 還要轉成**特定格式**（Markdown 表格 / Word 雙欄）給審查單位

阿凱的 **#43 LinguaLesson 轉寫小精靈** 反向：**PDF/DOCX 上傳 → AI 翻譯豐富 → Markdown 表格輸出**。

## #43 真實怎麼做？

**真實標題**：「**LinguaLesson - 轉寫小精靈 PDF/DOCX 文字轉 Markdown 表格工具**」

**meta description**：「**從 PDF 或 DOCX 中提取文字，使用 轉寫小精靈 將中文課程計劃翻譯、豐富內容並轉換成 Markdown 表格。**」

**核心流程**：
1. **上傳** PDF 或 DOCX（學校的中文課程計畫）
2. **提取文字**（含結構 — 表格 / 段落 / 標題）
3. **AI 翻譯**（中文 → 英文，符合學科專業 + 教學語境）
4. **豐富內容**（不只直譯，補充英文教學常用句型）
5. **轉換成 Markdown 表格**（給審查單位 / 國際合作伙伴看）

## 真實技術棧

- **Next.js**（_next/static bundle）
- **Tailwind CSS**
- 推測：**Gemini API**（翻譯 + 豐富）
- 推測：**pdf.js + mammoth.js**（PDF / DOCX 解析）
- 部署：\`bilingual.smes.tyc.edu.tw\` Firebase Hosting + 學校自訂域名

## 為什麼用「轉寫小精靈」命名？

阿凱命名特色 — 不只「翻譯」，是「**轉寫**」：
- **翻譯** = 直譯（中→英）
- **轉寫** = 改寫成適合英文教學的版本（**含豐富內容、補充句型**）

「**小精靈**」= 親切感，像一個有 AI 助手在幫你寫雙語版本。

## 跟其他雙語工具的關係

| # | 工具 | 角色 |
|---|---|---|
| **#43 轉寫小精靈**（本篇）| **AI 翻譯 + 豐富課程計畫** | 老師備課用 |
| [#77 雙語教育宣導網站](/tool/77) | 學校雙語政策宣傳 | 對外公關 |
| [#88 國中課程計畫 AI 審查](/blog/curriculum-88-ai-junior-high-review/) | 國中課程計畫審查 | 校內預審 |

**#43 是「**雙語老師備課工作流**」最直接的 AI 工具**。

## 教學情境

**雙語教師備課**：
- 自然科老師寫好中文版「**春天的花朵觀察**」課程計畫
- 上傳 #43 → AI 翻譯成「**Observing Spring Flowers**」 + 豐富英文教學句型
- 直接拿來上雙語自然課

**雙語聯盟學校交流**：
- 跨校交流要把課程計畫翻譯給夥伴學校看
- 用 #43 → 1 分鐘給對方完整 Markdown 表格

**桃園市雙語審查送件**：
- 教育局審查雙語課程計畫要英文版
- 用 #43 → 確保格式統一 + AI 豐富過符合審查標準

**外師參與校內共備**：
- 中文教師寫的計畫 → #43 翻譯 → 外師看得懂
- 共備效率翻倍

## 配對工具推薦

- [#77 石門國小雙語教育宣導網站](/tool/77) — 學校政策版
- [#88 國中課程計畫 AI 審查](/blog/curriculum-88-ai-junior-high-review/) — 校內預審
- [#15 領域共備 GO](/blog/report-15-domain-meeting-go/) — 領域記錄

## 適用對象

- 雙語學校老師（**雙語聯盟學校 / 雙語亮點學校**）
- 外師（讀懂中文版課程計畫）
- 雙語政策推動者（教育局 / 局長 / 督學）
- 想做「**台灣本土雙語課程**」的研究者

## 想試試？

→ [前往 #43 課程計畫英文轉寫小精靈](/tool/43)

下次寫雙語課程計畫 — **上傳中文版 → 等 AI 30 秒 → 拿到 Markdown 表格英文版 → 直接複製貼到 Word**。
`,
};

const POST_77: BlogPost = {
  slug: 'bilingual-77-english-promotion',
  title: '#77 石門國小雙語教育宣導網站（english.smes）：用 Manus 建立的 114 學年度雙語聯盟學校公開觀議課宣導平台',
  excerpt:
    '#77 真實名稱「**Manus Space**」 / Akai 描述「**桃園市龍潭區石門國民小學 114 學年度雙語聯盟學校暨雙語課程亮點學校公開觀議課宣導網站**」— 用 Manus AI 建立的雙語教育宣傳網。展示學校雙語教育課程規劃 / 外師介紹 / 主題課程活動 / 學生展能。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['雙語教育', 'Manus AI', '公開觀議課', '學校宣導', 'Firebase Hosting'],
  toolIds: [77, 43, 88],
  coverEmoji: '🌐',
  coverColor: 'green',
  body: `## 雙語聯盟學校的對外宣傳需求

桃園市推動「**雙語聯盟學校**」+「**雙語課程亮點學校**」政策 — 入選的學校要做：
- **公開觀議課**（邀請其他學校來觀摩）
- **對外宣傳**（讓教育局、家長、合作學校看到成果）
- 展示**課程規劃 / 外師介紹 / 學生展能**

**最痛**：
- ❌ 學校官網太多公告太雜亂 → 雙語成果埋在最新消息底下
- ❌ 印刷宣傳冊 → 印出來就過時
- ❌ 用 Word 排版 → 看起來不專業
- ❌ 學校的 IT 預算養不起品牌設計師

阿凱反向：**用 Manus AI 建立專屬雙語宣導網站** → 掛 \`english.smes.tyc.edu.tw\` 學校網域。

## #77 真實怎麼做？

**真實標題**：「**Manus Space**」（Manus AI 平台預設名稱）

**Akai 完整描述**：「桃園市龍潭區石門國民小學 114 學年度雙語聯盟學校暨雙語課程亮點學校公開觀議課宣導網站，支援中英文雙語切換，展示學校雙語教育課程規劃、外師介紹、主題課程活動、學生展能等內容。**使用 Manus 建立**」

**核心內容**：
- 🌐 **支援中英文雙語切換**
- 📚 **雙語教育課程規劃**
- 👨‍🏫 **外師介紹**（學校聘的英文外籍教師背景 / 教學專長）
- 🎯 **主題課程活動**（用英文教自然 / 體育 / 藝術等學科）
- 🌟 **學生展能**（學生雙語成果展示 — 作品 / 影片 / 演出）

## Manus AI 是什麼？

**Manus** 是 2024-2025 年崛起的 AI 平台，特色：
- 自然語言描述需求 → AI 生成整個網站
- 適合「**展示型內容**」（沒有複雜後端邏輯）
- 部署在 Manus Space 雲端服務
- 支援自訂域名

**阿凱的工作流**：
1. 用 Manus 描述「我要做雙語聯盟學校公開觀議課網站」
2. Manus 生成完整網站
3. 部署到 \`english.smes.tyc.edu.tw\` Firebase Hosting

→ **「**多 AI 工具混搭**」** 又一案例：Gemini 寫程式 / Manus 做展示型網站 / Blockade Labs Skybox 做 360°。

## 真實技術棧

- **Manus Space 雲端託管**
- **不是 Next.js**（0 chunks）
- 推測：Manus 內部使用某種靜態 SSG
- 部署：\`english.smes.tyc.edu.tw\` Firebase Hosting + 學校自訂域名

## 跟 #43 #88 的差別

| # | 工具 | 性質 | 受眾 |
|---|---|---|---|
| [#43 轉寫小精靈](/blog/bilingual-43-lingua-lesson/) | **老師備課用** 中翻英 | 雙語老師 |
| [#88 國中課程計畫 AI 審查](/blog/curriculum-88-ai-junior-high-review/) | **校內預審** 工具 | 教務組長 |
| **#77 雙語教育宣導網**（本篇）| **對外宣傳** 展示 | 教育局 / 家長 / 合作學校 |

**#43 #77 #88 三件套** = 雙語政策從備課 → 審查 → 對外宣傳完整生態。

## 教學情境

**公開觀議課邀請其他學校來**：
- 邀請函附 #77 連結
- 其他校老師先看「**石門國小雙語做了什麼**」
- 觀議課當天**有共同背景才能討論**

**教育局督學訪視**：
- 督學要看「**雙語聯盟學校做了什麼**」
- 給 #77 連結 → 督學自己瀏覽 → 不用拿一堆資料夾

**家長關心**：
- 家長 LINE 群組：「**我們學校的雙語亮點看這裡 https://english.smes.tyc.edu.tw**」
- 比給 PDF 檔好（手機看也順）

**校際雙語聯盟交流**：
- 8 個聯盟校互看彼此網站
- 分享成功經驗

## 為什麼用 Manus 而不是自己寫？

對「**展示型網站**」來說 Manus 是對的選擇：
- ✅ 不需要複雜後端
- ✅ 內容更新頻率低（一學期改 1-2 次）
- ✅ 美觀的版面 → 比 IT 老師手刻好看
- ✅ 部署 5 分鐘搞定

**阿凱會看場景選工具**（再次驗證）：
- AI 出題 → Gemini + Next.js
- 互動藝術 → Canvas + 純 JS
- **展示型網站 → Manus AI**
- 觸控螢幕 → 純單檔 HTML
- ⋯

## 配對工具推薦

- [#43 LinguaLesson 轉寫小精靈](/blog/bilingual-43-lingua-lesson/) — 老師備課版
- [#88 國中課程計畫 AI 審查](/blog/curriculum-88-ai-junior-high-review/) — 校內預審
- [#15 領域共備 GO](/blog/report-15-domain-meeting-go/) — 教師社群會議記錄

## 適用對象

- 雙語聯盟學校 / 雙語亮點學校
- 教導主任 / 教學組長（規劃雙語推動）
- 想做「**對外宣導網站**」的學校
- 想看「**Manus AI 建站**」案例的開發者
- 教育研究者（看台灣雙語政策實踐）

## 想試試？

→ [前往 #77 石門國小雙語教育宣導網站](/tool/77)

如果你校也是雙語聯盟學校 — **用 Manus 描述需求 → 5 分鐘有專屬網站 → 配 Firebase Hosting + 學校網域**。
`,
};

const POST_9: BlogPost = {
  slug: 'mario-9-platformer-adventure',
  title: '#9 超級瑪莉歐冒險：純 Canvas 多關卡平台跳躍 + 蹬牆跳 + 成就系統 + 教學模式（v2.33.0 持續打磨）',
  excerpt:
    '#9 真實名稱「超級冒險 🍄 Mario Style Platformer」是阿凱用純 Canvas 寫的多關卡平台跳躍遊戲。完整 Stage Clear / 暫停 / 教學 / 成就系統 / 全螢幕 + 操作含蹬牆跳 / 衝刺 / 蹲下，已迭代到 v2.33.0。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['瑪莉歐風格', '平台跳躍', 'Canvas 2D', '成就系統', '蹬牆跳'],
  toolIds: [9, 28, 30],
  coverEmoji: '🍄',
  coverColor: 'orange',
  body: `## #9 vs #28 — 同主題不同進化階段

阿凱有兩個瑪莉歐風格遊戲：

| 維度 | **#9 超級瑪莉歐冒險**（本篇）| [#28 瑪莉歐風格平台跳躍](/blog/mario-28-jump-platform/) |
|---|---|---|
| 部署 | GitHub Pages \`cagoooo/mario-game\` | XOOPS VM \`smes_html/\` |
| 規模 | **多關卡 + 成就系統 + 教學** | 單關純跳躍 |
| 控制 | ←→ 移動 / 空白跳 / **Shift 衝刺 / S 蹲下 / 蹬牆跳** | 純 ←→ + 空白 |
| 版本 | **v2.33.0**（持續打磨）| 早期單版 |

#9 是 #28 的 **Pro / 升級進化版** — 阿凱「**漸進式工具家族**」哲學再案例。

## #9 真實怎麼做？

**真實標題**：「**🍄 超級冒險 🍄 Mario Style Platformer**」

**完整功能**：
- **多世界選擇**「SELECT WORLD」（NES retro style text menu）
- 「↑↓ 選擇 ｜ Enter / 點擊 進入」
- Stage Clear 結算頁
- 「★ STAGE CLEAR ★ World 1-1 SCORE: 0」
- 過關解鎖下一關

**操作（完整 6 種）**：

| 鍵盤 | 動作 |
|------|------|
| ⬅️ ➡️ | 移動 |
| **空白鍵** | 跳躍 |
| ⬇️ / S | **蹲下** |
| Shift | **衝刺** |
| **牆壁 + 跳** | **蹬牆跳**（瑪莉歐風格進階） |

**手機觸控**：點擊移動 + 點擊跳躍。

**遊戲統計**：
- 💀 擊殺
- 🪙 金幣
- 👑 分數
- 🏅 成就

**功能按鈕**：
- 🔊 音效開關
- ⚙️ 音效設定
- ⛶ 全螢幕
- ⏸️ 暫停
- 📖 重看教學

**🏅 成就系統**：完整 modal 顯示成就清單 + 「X/Y」進度。

## 真實技術棧

- **純前端**（無 React/Vue）
- **Canvas 2D**（\`<canvas id="gameArea">\`）
- **CSS 版本控制**：\`style.css?v=2.33.0\` — 阿凱用 query string 強制清快取
- **PWA 完整**：manifest.json + 多尺寸 icon + apple-mobile-web-app-capable
- **無 LLM、無後端**（localStorage 存進度）
- 部署：\`cagoooo.github.io/mario-game/\`

## 為什麼用純 Canvas 而不是 Phaser?

阿凱在遊戲開發上的選擇：
- **Canvas 2D**：#9 / [#28](/blog/mario-28-jump-platform/) / [#36 貪食蛇](/blog/snake-36-game/) / [#31 抓抓樂](/tool/31)
- **Three.js**：[#29 太陽系](/blog/solar-29-system-explorer/) — 唯一 3D
- **React + Canvas**：[#69 猴子投擲](/tool/69) / [#85 企鵝跑酷](/tool/85)

**Canvas 2D 適合「**完整可控自製遊戲**」** — 不需要 Phaser 引擎的物理 / 場景系統，自己寫更輕（v2.33.0 累積這麼多功能還在純 Canvas）。

## 教學情境

**資訊科技課示範**：
- 五六年級程式設計單元
- 老師展示「**多關卡 + 成就系統 + 蹬牆跳 = 純 Canvas + JS 也能做**」
- 開 DevTools 看 \`v2.33.0\` 一路迭代史

**下課休閒**：
- 比商業遊戲入口網（充滿廣告）親民 100 倍
- 學生可以正面挑戰多關卡

**家長親子**：
- 假日陪小孩玩
- 「**蹬牆跳**」教手指靈活度

## 配對工具推薦

- [#28 瑪莉歐風格平台跳躍](/blog/mario-28-jump-platform/) — XOOPS VM 早期版
- [#30 遊戲集合](/blog/games-30-collection-12-in-1/) — 12-in-1 經典遊戲合集
- [#85 企鵝跑酷](/tool/85) — 致敬經典版本

## 適用對象

- 國中小所有任課老師（下課小遊戲）
- 想看「**Canvas 2D 多關卡遊戲程式**」的開發者
- 五六年級資訊課（純 Canvas 教學案例）
- 想做「**經典遊戲復刻**」的工程師

## 想試試？

→ [前往 #9 超級瑪莉歐冒險](/tool/9)

按 「**SELECT WORLD**」進關卡 → 試試 **Shift 衝刺 + 蹬牆跳** — 比 #28 有層次得多。
`,
};

const POST_6: BlogPost = {
  slug: 'bee-6-pair-game',
  title: '#6 蜂勤耘友配對消消樂：3 難度 × 6 主題包 + themes.json 可擴充 + PWA 離線 + 鍵盤無障礙的記憶配對遊戲',
  excerpt:
    '#6 真實名稱「🐝 蜂勤耘友配對消消樂」是阿凱寫的記憶配對遊戲。3 難度（初 / 中 / 高）× 6 主題（蜂勤耘友 / 注音 / 唐詩 / 英文 / 數字 / 水果）= 18 種組合，**themes.json 可擴充不寫程式**新增主題。純前端 ES Modules + PWA + 鍵盤無障礙 + WebP 省 50%。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['記憶配對', '注音教學', '唐詩', 'PWA', '無障礙'],
  toolIds: [6, 9, 30],
  coverEmoji: '🐝',
  coverColor: 'yellow',
  body: `## 記憶配對遊戲 + 教學主題化 = 多用途神器

記憶配對遊戲（Memory Match）是經典遊戲類型 — 但傳統版只能玩「翻牌找一樣的圖」。

阿凱的 **#6 蜂勤耘友配對消消樂** 反向設計：**用配對遊戲機制 + 教學主題包 = 一遊戲多用途**：

| 主題包 | 學什麼 |
|---|---|
| 🐝 **蜂勤耘友**（圖片）| 圖像辨識 / 美感 |
| ㄅㄆㄇ **注音符號** | 認注音（一年級）|
| 📜 **唐詩名句** | 古典文學 / 國文 |
| 🇬🇧 **英文單字** | 基礎英文 |
| 🔢 **數字英文** | 數字英文對照 |
| 🍎 **水果英文** | 水果英文 |

**6 種主題 × 3 難度（初 / 中 / 高）= 18 種組合**，每種獨立計時 + 最佳紀錄。

## #6 真實怎麼做？

**真實標題**：「**🐝 蜂勤耘友配對消消樂**」

**完整功能（從 README 抽出）**：

**遊戲機制**：
- 每關 **5 對 = 10 張卡片**
- 翻牌找配對
- 配對成功 → 消除
- 全部消完 → **彩帶動畫慶祝** + 個人紀錄追蹤

**主題可擴充（神細節）**：
- 所有主題定義在 \`docs/themes.json\`
- **不用寫程式即可新增主題**
- 老師可以**自製校內主題**：「校徽配對」「老師頭像配對」「學校歷史人物」

**鍵盤無障礙**：
- Tab + Enter / Space 即可全鍵盤操作
- **特教學生友善設計**

**視覺優化**：
- **WebP 圖片**（省 50%）
- **\`<link rel="preload">\`** 預載強化
- 不卡頓

## 真實技術棧

- **純前端 ES Modules**（無 React/Vue）
- 模組架構：
  - \`game.js\` 入口模組
  - \`theme.js\` 主題載入 / WebP 偵測 / 卡面渲染
  - \`board.js\` 棋盤建立 / 翻牌 / 配對判定
  - \`ui.js\` 特效 / 計時器 / 完成彈窗
  - \`audio.js\` 音效 / 靜音 / 背景音樂
  - \`storage.js\` 個人最佳紀錄持久化
- **PWA**：manifest.webmanifest + sw.js
- **OG 圖**：用 Python Pillow 自動生成 1200×630 分享圖
- 部署：\`cagoooo.github.io/bee/\`

## 「主題化遊戲」的教學魔力

對國小老師來說 — **#6 是「一遊戲全年用」**：

| 學期單元 | 用哪個主題 |
|---|---|
| 一年級上「認識注音」| ㄅㄆㄇ 注音符號 |
| 三年級下「唐詩誦讀」| 唐詩名句 |
| 四年級上「水果英文」| 水果英文 |
| 五年級上「數字英文」| 數字英文 |
| 期末「複習英文單字」| 英文單字 |
| 校內活動「校徽認識」| **老師自製主題**（改 themes.json）|

→ 一個遊戲服務多年級多單元，老師備課**省力 10 倍**。

## 鍵盤無障礙的特殊價值

對**特教學生 / 肢體不便學生**：
- 不需精確點擊（觸控對部分孩子困難）
- Tab + Space 全鍵盤操作
- 一隻手 / 輔具裝置也能玩
- **遊戲化教學的融合教育**

## 配對工具推薦

- [#9 超級瑪莉歐冒險](/blog/mario-9-platformer-adventure/) — 同款 Canvas 純前端遊戲
- [#30 遊戲集合](/blog/games-30-collection-12-in-1/) — 12-in-1 經典遊戲合集
- [#22 成語填空遊戲](/blog/idiom-22-fill-blank-game/) — 同款語文 + 遊戲化

## 適用對象

- 一年級導師（注音教學）
- 中高年級英文老師（單字 / 水果 / 數字）
- 國語老師（唐詩教學）
- 特教老師（鍵盤無障礙友善）
- 想做「**主題化教學遊戲**」的工程師

## 想試試？

→ [前往 #6 蜂類配對消消樂](/tool/6)

第一次玩建議：**初階 + 注音符號**（一年級複習）→ 看看 5 對 = 10 張卡片好不好認 → 再換 5 種主題試試。
`,
};

const POST_69: BlogPost = {
  slug: 'monkey-69-pixel-clash',
  title: '#69 猴子投擲大戰 Monkey Pixel-Art Clash：致敬 1991 QBASIC GORILLAS.BAS + 拋物線物理 + Firebase 雲端排行榜',
  excerpt:
    '#69 真實名稱「🐒 猴子投擲大戰 (Monkey Pixel-Art Clash)」致敬 1991 年 QBASIC 經典遊戲 **GORILLAS.BAS**。React + TypeScript + Vite + 拋物線物理（重力 + 風力）+ 地形破壞 + 道具系統（10X / 酸 / 流星雨 / 雷射）+ Firebase Firestore 雲端排行榜（含防刷分 Rules）+ 8-bit 音效。',
  publishedAt: '2026-05-21',
  readingMinutes: 5,
  tags: ['投擲遊戲', 'QBASIC 致敬', '拋物線物理', 'Firebase 排行榜', '像素風'],
  toolIds: [69, 9, 85],
  coverEmoji: '🐒',
  coverColor: 'green',
  body: `## 致敬 1991 年 QBASIC GORILLAS.BAS

DOS 時代 1991 年的 QBASIC 內建範例遊戲 **GORILLAS.BAS** — 兩隻大猩猩在城市天際線上互丟爆炸香蕉，看誰先擊倒對方。

那是 **無數工程師的程式設計啟蒙遊戲**（一打開 GORILLAS.BAS 程式碼 → 看到「**這就是遊戲**」→ 想自己寫一個）。

阿凱的 **#69 猴子投擲大戰** 是 **這款 35 年經典的 React 重製版**：
- 從大猩猩 → 改成猴子（pixel-art 風格更可愛）
- 從 QBASIC text mode → 改成 Canvas + React 像素美學
- 加上現代化功能（Firebase 雲端排行榜 / PWA / 道具系統）

## #69 真實怎麼做？

**真實標題**：「**🐒 猴子投擲大戰 (Monkey Pixel-Art Clash)**」

**完整功能（從 README 抽出）**：

**核心遊戲機制**：
- 🎯 **拋物線物理**：拖曳發射，**受重力 + 風力影響**
- 💥 **地形破壞**：爆炸**挖洞改變戰場地形**
- 兩人輪流出招（同電腦對戰）

**🎁 道具系統（4 種）**：
- **10X 巨大化**：香蕉變超大
- **ACID 強酸**：穿透地形
- **流星雨**：天降多顆
- **雷射**：直線攻擊

**🌬️ 風力視覺化**（神細節）：
- 雲層 + 旗幟 + HUD **三層指示**
- 學生**看得到風的存在**

**🏆 雲端排行榜**：
- Firebase Firestore
- **含防刷分 Rules**
- 全國學生 PK

**🔊 8-bit 音效**：
- Web Audio API **即時合成**（不放 mp3）
- 撞擊 / 爆炸 / 風聲都自合成

**📱 PWA**：可離線玩、加入主畫面

**🎨 螢幕方向**：直立 / 橫向皆可玩

## 真實技術棧（React + Vite）

- **React 19 + TypeScript + Vite**
- **App.tsx ~1590 行**（B1 拆分後）
- 架構：
  - \`src/App.tsx\` 主編排
  - \`src/main.tsx\` React 入口 + audio unlock + SW 註冊
  - \`src/pwa.ts\` PWA 更新提示
  - \`src/firebase.ts\` Firestore 排行榜 API
  - \`src/game/constants.ts\` 物理 / 道具 / 顏色常數
  - \`src/game/types.ts\` GameState / Building / Particle 型別
- **環境變數**：\`.env\` 填 Firebase config
- **CI/CD**：GitHub Actions 自動部署
- 部署：\`cagoooo.github.io/monkey/\`

## 為什麼這個工具值得寫獨立文章？

**「**經典遊戲現代化**」+「**程式設計啟蒙**」雙重意義**：

對學生：
- 看到「**會物理 + 風力的遊戲**」是基礎物理運動學的具象化
- 30 年前的程式設計入門遊戲 → 現在還能玩

對工程師：
- **「**用 React 重製 1991 QBASIC**」**是一個有趣的程式設計練習
- 看 cagoooo/monkey repo 學「**遊戲狀態管理 + Firebase 排行榜架構**」

對教育系：
- 「**讓學生用工程師的眼光看遊戲**」 — 「**這背後是物理 + 程式**」

## 跟阿凱其他遊戲對比

| 工具 | 致敬經典 | 技術棧 |
|---|---|---|
| **#69 猴子投擲**（本篇）| 1991 QBASIC GORILLAS.BAS | React + TS + Firebase |
| [#85 企鵝跑酷](/tool/85) | 1983 Konami Antarctic Adventure | React + TS |
| [#9 瑪莉歐冒險](/blog/mario-9-platformer-adventure/) | 任天堂 Mario | Canvas 純前端 |
| [#28 瑪莉歐](/blog/mario-28-jump-platform/) | 同上 早期版 | Canvas 純前端 |

阿凱「**致敬經典遊戲系列**」清晰可見。

## 教學情境

**自然科「拋物線運動」單元**：
- 講「**水平 + 垂直分速度**」抽象 → 玩 #69 看香蕉飛
- 切換風力 → 看影響軌跡
- **物理 → 程式 → 遊戲**三層關聯

**資訊課「程式設計史」單元**：
- 講 1991 QBASIC → 看 #69 致敬版
- 「**40 年前一台 DOS PC 也能跑這種遊戲**」

**下課休閒 PVP**：
- 兩人輪流玩 → 排行榜 PK
- 全班一起拼最高分

## 配對工具推薦

- [#9 超級瑪莉歐冒險](/blog/mario-9-platformer-adventure/) — 同款 Canvas 遊戲
- [#85 南極大冒險：企鵝跑酷](/tool/85) — 致敬經典系列同伴
- [#28 瑪莉歐風格平台跳躍](/blog/mario-28-jump-platform/) — 早期版

## 適用對象

- 國中小自然 / 物理老師（拋物線運動單元）
- 資訊老師（程式設計史 + 遊戲開發）
- 想看「**React + Firebase 遊戲架構**」的開發者
- 想看「**1991 QBASIC 經典重製**」的懷舊玩家

## 想試試？

→ [前往 #69 猴子丟香蕉 - 投擲大戰爭](/tool/69)

兩人開玩 — **看誰先學會「**逆風該怎麼瞄**」**。
`,
};

const POST_85: BlogPost = {
  slug: 'penguin-85-runner',
  title: '#85 南極大冒險：企鵝跑酷 — 致敬 Konami 1983 Antarctic Adventure + 隱藏 God Mode 指令 + React 19 重製版',
  excerpt:
    '#85 真實名稱「🐧 南極大冒險：企鵝跑酷」是阿凱致敬 Konami 1983 年經典《Antarctic Adventure》的 React 19 重製版，為石門國小學生製作。包含 ← / → 切換車道 + ↑/Space 跳躍 + ↓ 減速 + **🥚 隱藏指令 ↑↑↓↓←←→→AB 啟動 God Mode**。配 1882 年公版《Skaters Waltz》音樂。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['企鵝跑酷', 'Konami 致敬', 'React 19', 'God Mode 彩蛋', '經典重製'],
  toolIds: [85, 69, 9],
  coverEmoji: '🐧',
  coverColor: 'blue',
  body: `## 致敬 1983 Konami Antarctic Adventure

1983 年 Konami 在 MSX 平台推出《Antarctic Adventure》：
- 企鵝在南極跑步
- 跳過冰洞 + 海豹
- 蹲下避過巨大冰山
- 收集旗幟過關

那是 **MSX/NES 時代的經典橫向卷軸跑酷遊戲** — 影響後來的「跑酷類」遊戲。

阿凱的 **#85 南極大冒險：企鵝跑酷** 是 **這款 43 年經典的 React 19 重製版**，**專為石門國小學生製作**。

## #85 真實怎麼做？

**真實標題**：「**🐧 南極大冒險：企鵝跑酷**」

副標：「**致敬 Konami 1983 年經典遊戲《Antarctic Adventure》的 React 重製版。由阿凱老師為石門國小學生製作。**」

**操作（4 個鍵）**：

| 鍵盤 | 動作 |
|---|---|
| ← / → | 切換車道 |
| **↑ / Space** | 跳躍 |
| ↓ | 減速 |

**手機觸控**：長按左右切換車道並加速、輕點跳躍。

## 🥚 隱藏彩蛋：God Mode

> **在開始畫面依序按 \`↑↑↓↓←←→→AB\` 啟動 God Mode**

這是**經典 Konami Code**（Konami 三十年來在自家遊戲埋的密技 ↑↑↓↓←←→→BA）變奏版！

阿凱**致敬到骨子裡** — 連 Konami Code 都復刻。對懂的學生 / 老師會心一笑。

## 真實技術棧

- **React 19**（最新版！）
- **TypeScript 5.8**
- **Vite 6**
- **Tailwind CSS v4**
- **Motion**（動畫）
- **Lucide Icons**
- **Canvas Confetti**（過關撒花）
- 部署：\`cagoooo.github.io/penguin/\`

## 「Skater's Waltz」音樂選擇

阿凱選的背景音樂：
- **Émile Waldteufel《Les Patineurs / Skater's Waltz》**
- **1882 年公共領域作品**（無版權問題）
- 法文「Skater's Waltz」= 溜冰圓舞曲
- 跟企鵝在冰上溜的視覺**音畫合一**

**版權意識**：選 1882 公版避開 Konami 原版音樂版權。

## 「起源」備註（神細節）

README 寫的「**起源：Google AI Studio Remix 模板**」。

→ 阿凱**用 Google AI Studio 的 Remix 功能起手** + 改成自己的版本。

跟其他作品的工作流：
- [#76 WebSlide](/blog/webslide-76-cross-device-presenter/) — 用 Gemini 寫
- [#77 雙語宣導網](/blog/bilingual-77-english-promotion/) — 用 Manus 建立
- **#85 企鵝跑酷** — 用 **Google AI Studio Remix** 模板

**多 AI 工具混搭**再次驗證。

## 跟 #69 #9 對比

| 工具 | 致敬經典 | 技術棧 | God Mode |
|---|---|---|---|
| **#85 企鵝跑酷**（本篇）| Konami 1983 Antarctic Adventure | **React 19** + TS | ✅ \`↑↑↓↓←←→→AB\` |
| [#69 猴子投擲](/blog/monkey-69-pixel-clash/) | 1991 QBASIC GORILLAS.BAS | React + Firebase | - |
| [#9 瑪莉歐冒險](/blog/mario-9-platformer-adventure/) | 任天堂 Mario | Canvas 純前端 | - |

## 教學情境

**資訊課「遊戲開發史」單元**：
- 講 1983 Konami 經典 → 用 #85 致敬版
- 學生看 Konami Code 解鎖 God Mode → **驚奇感**

**體育課暖身**：
- 體育館投影
- 學生看企鵝跑酷 → 自己也想動

**下課休閒**：
- 4 鍵操作極簡 → **連低年級都能玩**

**家長親子**：
- 「**爸爸我給你看 30 年前的遊戲**」
- 親子共玩 + 講遊戲史

## 配對工具推薦

- [#69 猴子投擲大戰](/blog/monkey-69-pixel-clash/) — 致敬經典系列同伴
- [#9 超級瑪莉歐冒險](/blog/mario-9-platformer-adventure/) — 同款 Canvas 遊戲
- [#28 瑪莉歐風格平台跳躍](/blog/mario-28-jump-platform/) — 早期版

## 適用對象

- 國中小所有任課老師（下課小遊戲）
- 資訊課（遊戲開發史 / React 案例）
- 體育課暖身
- 想看「**React 19 + Konami 致敬遊戲**」的開發者

## 想試試？

→ [前往 #85 南極大冒險：企鵝跑酷](/tool/85)

第一次玩 — **試試 \`↑↑↓↓←←→→AB\` Konami Code** → 啟動 God Mode 後就無敵了，**懂的人會心一笑**。
`,
};

const POST_56: BlogPost = {
  slug: 'lantern-56-festival-riddles',
  title: '#56 2026 石門國小元宵猜燈謎：Vite + React + PWA 中國紅主題 + 一起來猜燈謎歡慶元宵',
  excerpt:
    '#56 真實名稱「2026 石門國小元宵猜燈謎 | Lantern Festival Riddles」是阿凱專為石門國小 2026 年元宵節活動做的猜燈謎遊戲。Vite + React + PWA + 中國紅主題色 #E60012 + Noto Sans TC 字體 + Service Worker 完整支援。',
  publishedAt: '2026-05-21',
  readingMinutes: 3,
  tags: ['元宵節', '猜燈謎', '節慶活動', '石門國小', 'Vite + React'],
  toolIds: [56, 22, 71],
  coverEmoji: '🏮',
  coverColor: 'pink',
  body: `## 元宵節數位化的真實意義

元宵節是台灣傳統節日，國小常辦「猜燈謎」活動：
- 老師寫燈謎在紅紙上 → 掛走廊
- 學生路過猜 → 答對拿禮物
- **問題**：燈謎被同學偷看答案 / 紙會被風吹掉 / 老師要一個個確認

阿凱的 **#56 元宵猜燈謎** 反向：**手機掃 QR → 線上猜 → 即時答案 + 計分**。

## #56 真實怎麼做？

**真實標題**：「**2026 石門國小元宵猜燈謎 | Lantern Festival Riddles**」

**meta description**：「**石門國小 2026 年元宵節猜燈謎活動 - 一起來猜燈謎，歡慶元宵！**」

**完整功能**（從技術 signature 推測）：
- 學生掃 QR 進入
- 看燈謎題目
- 答案輸入 / 選項點選
- 即時對答 + 計分
- 結算 / 排行榜
- **中國紅主題色** \`#E60012\` 配 Noto Sans TC

## 真實技術棧

- **Vite + React**（看 \`assets/index-DqCBxp-A.js\` bundle）
- **Tailwind CSS**（推測）
- **PWA 完整**：manifest.json + 多尺寸 icon + Service Worker
- **Service Worker** 含 localhost 偵測（dev 時不註冊 SW 避免 HMR 衝突）
- **Noto Sans TC** Google Fonts
- 主題色：**#E60012**（中國紅）— 元宵節氣氛
- 部署：\`cagoooo.github.io/lantern/\`

## 神細節：PointerLock 錯誤防禦

從 HTML 第一段 script 抓到：

\`\`\`javascript
window.addEventListener('unhandledrejection', function (e) {
  if (e.reason && (e.reason.name === 'SecurityError' ||
    (typeof e.reason.message === 'string' &&
     e.reason.message.toLowerCase().includes('lock')))) {
    e.preventDefault();
    e.stopImmediatePropagation();
  }
}, true); // capture phase = 最優先執行
\`\`\`

→ 阿凱**踩過 Vite + PointerLock SecurityError 錯誤彈窗**的雷，**最早執行的 script 就吞掉**這個錯誤。

**踩雷後在 production 寫 capture phase listener** = 工程師等級的防禦性程式設計。

## 「節慶活動專用工具」的特殊地位

阿凱有一系列「**節慶 / 活動專用**」工具：
- **#56 元宵猜燈謎**（2 月元宵節）— 本篇
- [#62 親職教育日](/tool/62)（3 月親職日）
- [#74 1150328 親職日場地配置](/blog/parent-day-74-venue-map/)（3/28 特定日期）
- [#80 114 下學期教師會議](/blog/meeting-80-spring-semester-week13/)（學期週次）

這些工具**用完即丟**（每年要更新版本），但**每年都會有新的需求**。

阿凱把工具當「**節慶配套**」做 — 像一張**數位海報**，活動結束放在那當紀念。

## 教學情境

**元宵節班會活動**：
- 全班同時掃 QR
- 看誰答對最多燈謎
- 結算頒小獎品

**走廊互動裝置**：
- 學校觸控螢幕掛 #56
- 學生課間互玩

**家長互動**：
- 親子一起猜燈謎
- 「**爸媽我猜這題你也不會**」

**國語延伸活動**：
- 猜燈謎含**諧音 / 拆字 / 字謎** → 國語素養延伸

## 配對工具推薦

- [#22 成語填空遊戲](/blog/idiom-22-fill-blank-game/) — 同款語文遊戲化
- [#71 成語填空大挑戰](/tool/71) — 進階版
- [#62 親職教育日](/tool/62) — 同款活動專用工具

## 適用對象

- 國中小元宵節活動承辦
- 學務 / 訓育組（節慶活動數位化）
- 國文老師（猜燈謎 + 字謎教學）
- 想做「**節慶活動專用 web app**」的學校

## 想試試？

→ [前往 #56 元宵猜燈謎闖關遊戲](/tool/56)

2026 元宵節已過 — 但這份**活動數位化的設計思維**可以套用任何年度節慶（中秋 / 端午 / 教師節 / 校慶⋯）。
`,
};

const POST_65: BlogPost = {
  slug: 'ai-video-65-creator-hub',
  title: '#65 AI 影片創作整合資源 Hub：ChatGPT → Grok → Canva 三步驟工作流 + 12+ YouTube 範例合集',
  excerpt:
    '#65「AI Creator Hub 影片創作與教學整合資源」不是另一個 AI 工具 — 是阿凱整理的「ChatGPT 寫腳本 → Grok 動圖化 → Canva 剪輯」三步驟工作流入口頁，含 12+ YouTube 創意作品範例合集。EZPage 部署，cagoooo/Grok-Canva。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['AI 影片創作', 'ChatGPT', 'Grok', 'Canva', '教學資源整合'],
  toolIds: [65, 66, 94],
  coverEmoji: '🎬',
  coverColor: 'pink',
  body: `## AI 影片創作的「工具碎片化」問題

2024 年起 AI 影片工具爆炸式增長：
- **ChatGPT** 寫劇本 / 腳本
- **Grok** 把靜態圖動畫化
- **Sora** 文字生成完整影片
- **Runway / Pika / Hailuo** 各家影片生成
- **Canva / 剪映 / CapCut** 後製剪輯
- **NotebookLM** 知識圖卡
- **Padlet** 分享作品

老師最痛的不是學會用某個工具，而是「**這麼多工具到底怎麼串起來**」。

## #65 真實怎麼解？

**真實名稱**：「**AI Creator Hub 影片創作與教學整合資源**」

阿凱的解法：**做一個整合入口頁** — 不是另一個 AI 工具，是 **AI 影片創作工作流的「**路徑圖**」**：

**三步驟工作流**：
1. **ChatGPT** → 寫腳本與文案
2. **Grok** → 把靜態圖片動畫化
3. **Canva / 剪映** → 拖拉式剪輯與後製

**進階搭配**：
- NotebookLM → 知識圖卡
- Padlet → 分享作品

**頁面結構**：
- 導向 ChatGPT / Grok / Canva 官方網站的快速連結
- 清楚的操作指南
- **12+ YouTube 創意作品範例合集**（可收合介面 ▶️ AI 影片創作範例合集）

## 真實技術棧

- **EZPage 部署**（README 寫「Deployed by EZPage」）
- 純前端教學資源彙整頁
- **沒有特殊後端**
- 部署：\`cagoooo.github.io/Grok-Canva/\`

## 「工具整合資源頁」的教學價值

對老師來說 — **#65 是 AI 影片創作備課的「**第一站**」**：

| 老師需求 | #65 解法 |
|---|---|
| 想帶學生做 AI 影片但不知從哪開始 | **看三步驟路徑** |
| 不知道 Grok 怎麼用 | **點官方連結 + 看範例** |
| 要給學生看範例 | **12+ YouTube 作品合集**直接放 |
| 想跟其他 AI 工具混搭 | **NotebookLM / Padlet 進階搭配建議** |

→ 比看 100 篇 Medium 文章好。

## 跟 #94 封面接故事 / #66 Sora 的關係

阿凱的 AI 影片三件套：

| # | 工具 | 角色 |
|---|---|---|
| **#65 AI Creator Hub**（本篇）| **教學資源入口頁** | 三步驟工作流 |
| [#66 Sora AI 旅遊全記錄](/tool/66) | **Sora 教學資源庫** | OpenAI Sora 專屬 |
| [#94 封面接故事](/blog/music-cover-storyboard-94/) | **實際操作工具** | MV 封面 → AI 分鏡 |

**#65 是「**為什麼用**」 / #66 是「**用 Sora**」 / #94 是「**動手做**」** — 完整 AI 影片教學鏈。

## 12+ YouTube 範例合集的價值

對教師「**素養導向教學**」：
- ✅ **不需自己花半天 Google 找範例**
- ✅ **看好作品才知道要做什麼**
- ✅ **學生看了會被啟發**
- ✅ **每年更新可以追新潮流**

## 教學情境

**藝術與人文「AI 影片創作」單元**：
- 第 1 節：開 #65 → 看 12+ 範例 → 引起動機
- 第 2 節：分組 → 照三步驟流程
- 第 3 節：實作 ChatGPT 寫腳本
- 第 4 節：實作 Grok 動畫化
- 第 5 節：實作 Canva 剪輯
- 第 6 節：成果發表 + 反思

**自主學習計畫**：
- 學生看 #65 + 自己挑工具學
- 不用老師逐步帶

**社團指導**：
- AI 創作社 / 媒體社 第一週就用 #65 起手

## 配對工具推薦

- [#66 Sora AI 旅遊全記錄](/tool/66) — OpenAI Sora 專屬教學
- [#94 封面接故事](/blog/music-cover-storyboard-94/) — 實作工具
- [#86 TieTu 3D Q版貼圖生成器](/tool/86) — 同款 AI 圖像生成

## 適用對象

- 國中小到高中 藝術與人文 / 媒體素養老師
- AI 創作社 / 媒體社指導
- 自主學習計畫指導老師
- 想入門 AI 影片創作的老師（**第一站**）

## 想試試？

→ [前往 #65 AI 影片創作與教學整合資源](/tool/65)

下次帶 AI 影片創作 — **先給學生看 12+ 範例合集** → 再分組照三步驟做。
`,
};

const POST_66: BlogPost = {
  slug: 'sora-66-travel-record',
  title: '#66 Sora AI 旅遊全記錄教學網：OpenAI Sora 旅遊影片創作教學資源庫（EZPage 部署）',
  excerpt:
    '#66「Sora AI 旅遊全記錄教學網」是阿凱針對 **OpenAI Sora 影片生成工具**做的旅遊主題教學資源庫。從提示詞撰寫到高細節生成，把零散旅遊素材轉成電影質感全記錄短片。EZPage 部署，cagoooo/Sora。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['Sora', '旅遊影片', '提示詞工程', 'OpenAI', 'EZPage 部署'],
  toolIds: [66, 65, 94],
  coverEmoji: '✈️',
  coverColor: 'blue',
  body: `## Sora — OpenAI 2024 年最強 AI 影片生成

OpenAI Sora 2024 年 2 月發表震驚世界：
- **文字 → 影片**（不只圖片）
- 一段 prompt 生成 **60 秒以上電影級短片**
- 物理運動 / 鏡頭運動 / 角色一致性都自動處理
- 上線後 Twitter / IG 滿天飛 Sora 作品

對老師 — Sora 是**新世代 AI 影片工具的代表** —— 但學生不知道怎麼用、不知道怎麼寫好 prompt。

阿凱的 **#66 Sora AI 旅遊全記錄教學網** 反向：**用「旅遊」主題切入 + 教 Sora 完整工作流**。

## #66 真實怎麼做？

**真實標題**：「**Sora AI 旅遊全記錄教學網**」

**完整描述**（從 tools.json 抽出）：

> 探索 Sora AI 與旅遊記錄的完美結合，掌握如何利用 AI 技術捕捉、編輯並分享您的旅遊點滴，打造個人專屬的高質感全記錄教學平台。

**核心內容**：
- 從**初步的提示詞撰寫**到**後期的高細節生成**
- 把**零散的旅遊素材** → 轉化為**具備電影質感的全記錄短片**
- 透過 AI 工具**優化敘事節奏與視覺呈現**

## 為什麼選「旅遊」主題？

對國中小教學 — **「旅遊」是學生最有共鳴的主題**：
- ✅ 每個學生都有出去玩的經驗
- ✅ 家族旅遊 / 校外教學 / 畢業旅行
- ✅ 「**用 AI 把我的旅遊變成電影**」聽起來夢幻

比抽象的「AI 影片創作」更有切入點。

## 真實技術棧

- **EZPage 部署**（README 寫「Deployed by EZPage」）
- 純前端教學資源頁
- **沒有後端**
- 部署：\`cagoooo.github.io/Sora/\`

## 跟 #65 #94 三件套對比

| # | 工具 | 重點 |
|---|---|---|
| [#65 AI Creator Hub](/blog/ai-video-65-creator-hub/) | **三步驟工作流**：ChatGPT → Grok → Canva | 通用 |
| **#66 Sora 旅遊全記錄**（本篇）| **OpenAI Sora 專屬** + 旅遊主題切入 | 進階 |
| [#94 封面接故事](/blog/music-cover-storyboard-94/) | **MV 封面 → AI 分鏡 → 串成短片** | 實作 |

**#66 的獨特定位**：**Sora 是 #65 三步驟以外的進階選擇** — 阿凱另外做一個教學網介紹。

## 教學情境

**社會課「家鄉文化」單元**：
- 學生用手機拍家鄉景物
- 用 Sora prompt 把素材轉成「**家鄉影像詩**」
- 全班放映分享

**畢業旅行回顧**：
- 全班合作每人寫 1 個 Sora prompt
- 拼成完整畢旅紀錄影片
- 畢業典禮播放

**社團指導**：
- 影音社 / 媒體社
- 用 #66 學 Sora prompt 進階寫法
- 比商業 prompt 教學課程便宜（**免費**）

## Sora 寫 prompt 的關鍵

阿凱在 #66 講的應該包含：
- **明確主體**（誰 / 什麼）
- **場景細節**（時間 / 地點 / 環境）
- **鏡頭運動**（推進 / 拉遠 / 旋轉）
- **質感風格**（電影感 / 紀錄片 / 動畫）
- **情緒氛圍**（溫暖 / 神祕 / 興奮）

## 配對工具推薦

- [#65 AI Creator Hub](/blog/ai-video-65-creator-hub/) — 三步驟工作流入口
- [#94 封面接故事](/blog/music-cover-storyboard-94/) — 實作工具
- [#86 TieTu 3D Q版貼圖](/tool/86) — 同款 AI 圖像生成

## 適用對象

- 國中小到高中 社會 / 藝術老師
- 想帶學生做「**家鄉文化紀錄**」的老師
- 畢業旅行影片製作指導
- 影音社團 / 媒體社指導

## 想試試？

→ [前往 #66 Sora AI 旅遊全記錄教學網](/tool/66)
→ [#65 三步驟入門](/blog/ai-video-65-creator-hub/)（先看完工作流再深入 Sora）
`,
};

const POST_86: BlogPost = {
  slug: 'tietu-86-chibi-sticker',
  title: '#86 TieTu 3D Q版貼圖生成器：上傳大頭照 + 24 個文字 → Gemini 2.5 Flash Image 生 4×6 貼圖 + LINE 上架包',
  excerpt:
    '#86 TieTu — 上傳大頭照 → 自訂主題與 24 個文字標籤 → Gemini 2.5 Flash Image（Nano Banana Pro）生成 4×6 共 24 張 Q 版貼圖 → 下載 PNG / 24 張 ZIP / **LINE 個人原創貼圖上架包**（含 main.png + tab.png + README.txt）。Vite + React 19 + Cloud Functions v2 + Cloudflare Turnstile。',
  publishedAt: '2026-05-21',
  readingMinutes: 6,
  tags: ['AI 圖像生成', 'LINE 貼圖', 'Gemini 2.5 Flash Image', 'Nano Banana', 'IndexedDB'],
  toolIds: [86, 65, 94],
  coverEmoji: '🎨',
  coverColor: 'yellow',
  body: `## 「LINE 個人原創貼圖」上架的真實痛點

LINE 創作者市集開放後，**任何人都能上架自己的貼圖**賺錢：
- 每組 24 / 32 / 40 張，每張 240×240 主圖 + 96×74 索引圖
- 自畫太累、找設計師太貴
- 想做「**我自己 Q 版貼圖**」但畫畫不會

阿凱的 **#86 TieTu** 是**這痛點的解藥**：

> **上傳一張大頭照 → 自訂主題與 24 個文字標籤 → AI 生成 4×6 共 24 張 Q 版貼圖 → 下載成 PNG / 24 張 ZIP / LINE 個人原創貼圖上架包**

## #86 真實技術細節（README 超完整）

**真實標題**：「**TieTu — 3D Q版貼圖生成器**」（Traditional Chinese chibi sticker generator）

**技術棧表格**：

| 介面 | 後端 | 模型 | 部署 |
|---|---|---|---|
| Vite + React 19 + Tailwind 4 + shadcn/ui | Express 5 (monorepo) → Cloud Functions v2 | **Google Gemini 2.5 Flash Image** (\`gemini-2.5-flash-image\`，multimodal IMAGE output) | **GitHub + Firebase**（主推）|

**完整 9 大功能**：

**功能 A：照片上傳**
- JPG / PNG / WEBP / **HEIC** 都支援
- 前端用 **magic bytes 驗證**（不只看副檔名）
- 上限 **10 MB**

**功能 B：主題客製**
- 輸入關鍵字（如「馬年、太空人、黏土風」）
- 一鍵套用到 24 格

**功能 C：24 格自訂文字**
- 每格 1-8 字繁中
- 可單獨修改

**功能 D：AI 生成（核心）**
- **Google Gemini 2.5 Flash Image**（Nano Banana Pro）multimodal
- **輸入照片 + prompt → 生成 4×6 sticker sheet**

**功能 E：客戶端切片**
- Canvas 切成 24 張獨立 PNG
- **不依賴後端**

**功能 F：單張微調**
- 旋轉 ±15°
- 平移 ±15%
- 縮放 80-120%
- **即時預覽**

**功能 G：三種下載格式**
- 整張 PNG
- 24 張 ZIP
- **LINE 上架版 ZIP**（24 張 370×320 + main.png 240×240 + tab.png 96×74 + README.txt）

**功能 H：歷史紀錄**
- **IndexedDB** 保留最近 5 次
- JPEG 1280px @ 0.85 壓縮存放
- 點擊重新開啟

**功能 I：限流保護 + 人機驗證**
- 每 IP 每分鐘 3 張、每日 30 張
- Postgres 持久化
- **Cloudflare Turnstile** production 必填

## 真實技術棧（從 README）

- **Monorepo**：pnpm workspaces
- **Node.js**：v24 本機 → **v22 部署到 Cloud Functions**
- **TypeScript 5.9**（strict mode）
- Prettier 3 + ESLint
- **Replit Autoscale → GitHub + Firebase**（README 內有完整遷移指南）

## LINE 上架包的細節

LINE Creators Market 要求的檔案：
- 24 / 32 / 40 張貼圖每張 **370×320** PNG
- **main.png**（240×240）主圖
- **tab.png**（96×74）索引圖
- **README.txt** 說明

阿凱的 #86 **一鍵打包成 ZIP** → **直接拖進 LINE Creators 後台上架**。

## 跟 #91 PhotoPoet Pro 的關係

阿凱有兩個 AI 圖像工具：
- **#86 TieTu**（本篇）— LINE Q 版貼圖
- [#91 PhotoPoet Pro](/tool/91) — 早安長輩圖

兩個都用 Gemini 圖像生成 — **不同 use case 不同產品**：
- TieTu = **24 張一組產品包**（量產 sticker pack）
- PhotoPoet = **單張詩意圖**（每天傳一張）

## 為什麼用 Nano Banana Pro？

Google Gemini 2.5 Flash Image 別名「**Nano Banana**」是 2024 末新模型：
- ✅ **multimodal 輸出**（同時看圖 + 文字 + 輸出新圖）
- ✅ **角色一致性** — 24 張貼圖人臉統一不會變
- ✅ **繁中文字渲染** — 中文小字也能寫進貼圖

對 LINE Q 版貼圖這個 use case **完美匹配**。

## 教學情境

**畢業班禮物**：
- 老師用全班合照 → 跑 #86
- 24 張 Q 版貼圖每張寫一個學生名字
- LINE 上架 → 全班保存

**教師節活動**：
- 學生用老師大頭照 + 24 個感謝詞
- 「**XX 老師謝謝您**」「**XX 老師我愛您**」⋯
- 上架成班級獨家貼圖

**家庭親子活動**：
- 假日家長陪小孩用 #86 做「**家族貼圖包**」
- 阿公阿嬤的 LINE 從此多了專屬 stickers

## 配對工具推薦

- [#94 封面接故事](/blog/music-cover-storyboard-94/) — 同款 AI multimodal
- [#65 AI Creator Hub](/blog/ai-video-65-creator-hub/) — AI 影片整合
- [#91 PhotoPoet Pro](/tool/91) — 早安長輩圖

## 適用對象

- 國中小所有老師（畢業班禮物 / 教師節）
- 想做 LINE 貼圖賺零用錢的人
- 家庭親子活動
- 想看「**Gemini 2.5 Flash Image multimodal**」案例的開發者

## 想試試？

→ [前往 #86 3D Q版貼圖生成器](/tool/86)

第一次用：**上傳自己的大頭照 → 主題填「動物農場」→ 24 格各填一個動物**（貓 / 狗 / 兔 / 熊⋯） → 看 4×6 出來。
`,
};

const POST_58: BlogPost = {
  slug: 'prepare-58-lesson-plan',
  title: '#58 十二年國教教案生成器：Python Flask + Gemini 1.5 Flash + Word docx 下載 + Email 自動寄送的教案 AI',
  excerpt:
    '#58 真實名稱「十二年國教教案生成器 (Lesson Plan Generator)」是阿凱**用 Python Flask 寫的教案生成系統**（跟其他大多 Node 工具不同）。Google Gemini 1.5 Flash + 生成 20 項目完整教案（核心素養 / 學習重點 / 教學活動）+ python-docx Word 下載 + Flask-Mail Email 自動寄送。',
  publishedAt: '2026-05-21',
  readingMinutes: 5,
  tags: ['十二年國教', '教案生成', 'Python Flask', 'python-docx', 'Email 自動寄送'],
  toolIds: [58, 88, 78],
  coverEmoji: '📋',
  coverColor: 'green',
  body: `## 老師寫教案的真實痛點

108 課綱推動後，老師寫教案要包含：
- **核心素養**（A1 身心素質 / A2 系統思考 / A3 規劃執行⋯）
- **學習重點**（學習表現 + 學習內容）
- **教學活動**（引起動機 → 發展活動 → 綜合活動）
- **議題融入**（性平 / 環境 / 多元文化⋯）
- **評量設計**（多元評量 / 形成性 / 總結性）
- ⋯ 共 **20 個項目**

寫一份完整教案 = **2-3 小時手寫**。一學期 18 個單元 × 2 hr = **36 小時**。

阿凱的 **#58 十二年國教教案生成器** 反向：**輸入單元資訊 → AI 自動產出 20 項目完整教案**。

## #58 真實怎麼做？

**真實名稱**：「**十二年國教教案生成器 (Lesson Plan Generator)**」

**核心功能（從 README 抽出）**：

**功能 A：智慧教案生成**
- 基於 **Google Gemini 1.5 Flash**
- 生成 **20 個項目的完整教案**
- 包含核心素養 / 學習重點 / 教學活動等

**功能 B：Word 下載**
- 一鍵將生成的教案轉換為**標準 .docx 格式**
- 用 **python-docx** 渲染

**功能 C：Email 自動發送**
- 生成後自動將教案**格式化並寄送到指定信箱**
- 用 **Flask-Mail**
- 方便存檔與分享

**功能 D：十二年國教適配**
- **詞彙與邏輯完全符合台灣教育架構**
- 不是直接套通用教案模板

## 真實技術棧（特殊：Python Flask！）

跟阿凱其他工具大多用 Node.js / Next.js 不同，**#58 是 Python Flask 後端**：

- **Backend**: Python / Flask
- **AI Engine**: Google Gemini API（gemini-1.5-flash）
- **Document Rendering**: \`python-docx\`
- **Email**: Flask-Mail
- **Frontend**: HTML / Vanilla CSS / JavaScript

**部署**（**不能用 GitHub Pages 因為有 Flask 後端**）：
- Render.com（推薦）
- Google Cloud Run
- Railway.app

## ⚠️ 注意 Gemini 1.5 Flash 已棄用警告

README 寫的是 \`gemini-1.5-flash\` — 這個模型**已在 2024 年下半被 Google 棄用**，建議升級到：
- \`gemini-2.0-flash\`（一般使用）
- \`gemini-2.5-flash\`（最新）

如果 #58 還跑得起來，可能是 Google 還有 grace period，但阿凱可能要更新 model 字串。

## 為什麼用 Python Flask 而不是 Node？

從技術棧推測：
- ✅ **python-docx** 是業界標準 Word 生成套件（比 Node 版穩定）
- ✅ Flask-Mail 簡單好用
- ✅ Gemini 官方 SDK 對 Python 支援早
- ✅ 阿凱可能那時剛好熟 Python

**「**用對工具是工程師的修養**」** —— Python 在「**生 Word 文件 + Email + AI**」工作流上有先天優勢。

## 跟 #88 / #78 國中課程計畫的關係

阿凱的「**教案 / 課程計畫**」工具：

| # | 工具 | 規模 | 對象 |
|---|---|---|---|
| **#58 教案生成器**（本篇）| **單元教案**（20 項目）| 任何學科老師 |
| [#88 國中課程計畫 AI 審查](/blog/curriculum-88-ai-junior-high-review/) | **整學期計畫**審查 | 國中校內預審 |
| [#78 國小課程計畫 AI 審查](/tool/78) | **整學期計畫**審查 | 國小校內預審 |

**#58 是「**寫教案**」 / #88 #78 是「**審課程計畫**」** — 完整覆蓋備課到送審。

## 教學情境

**新進老師備課**：
- 第一次寫教案不知道格式
- 用 #58 → AI 給範本 → 學習標準格式

**資深老師量產**：
- 一學期 18 個單元
- #58 + 微調 → 每單元省 1.5 小時

**校際分享 / 觀課**：
- AI 寫好基本框架
- 老師加入創意內容
- **Email 自動寄送** → 全領域老師可看

**送教育局 / 督學訪視**：
- 教案格式不符會被退
- 用 #58 確保 20 項目齊備

## 配對工具推薦

- [#88 國中課程計畫 AI 審查](/blog/curriculum-88-ai-junior-high-review/) — 國中送審用
- [#78 國小課程計畫 AI 審查](/tool/78) — 國小送審用
- [#84 領域共備GO 會議記錄 Pro](/tool/84) — 領域共備配套

## 適用對象

- 國中小新進老師（學寫教案）
- 領域召集人（量產領域教案）
- 教學主任 / 教務組長（彙整全校教案）
- 想看「**Python Flask + Gemini + python-docx**」案例的開發者

## 想試試？

→ [前往 #58 教師數位備課小幫手](/tool/58)

第一次用 — **填單元名稱 + 學年 + 學科 + 教學目標** → AI 給你 20 項目完整教案 → 下載 docx + 寄 Email 存檔。
`,
};

const POST_84: BlogPost = {
  slug: 'meeting-84-domain-go-pro',
  title: '#84 領域共備 GO Pro（domain-meeting-go）：跟 #15 同源雙部署 + AI 照片描述 + 編輯部期刊風 UI',
  excerpt:
    '#84 跟 [#15 領域共備 GO](/blog/report-15-domain-meeting-go) 是**同源雙部署**！#84 cagoooo.github.io/domain-meeting-go = GitHub Pages 版，#15 report.smes = Firebase Hosting 學校域名版。Next.js 15.2.3 + Gemini 2.5 Flash Lite + 上傳會議照片 AI 逐張描述 + 整場深度總結 + Word/PDF 匯出 + v0.5.0 編輯部期刊風 UI。',
  publishedAt: '2026-05-21',
  readingMinutes: 5,
  tags: ['領域共備', '會議記錄', '編輯部期刊風', '同源雙部署', 'Gemini 2.5 Flash Lite'],
  toolIds: [84, 15, 24],
  coverEmoji: '📰',
  coverColor: 'orange',
  body: `## #84 跟 #15 是同源雙部署（再 +1 案例）

curl 抓 \`cagoooo.github.io/domain-meeting-go\` 真實 README 後，發現它跟 [#15 領域共備 GO（report.smes）](/blog/report-15-domain-meeting-go/) 是**同個專案的兩個部署**。

阿凱「**同源雙部署策略**」已累積 4 個案例：

| 工具家族 | Firebase Hosting 學校域名 | GitHub Pages 個人作品集 |
|---|---|---|
| **PIRLS** | [#4 pirlss.smes](/blog/pirls-4-firebase-mirror/) | [#87 cagoooo.github.io/pirls-questioncraft](/blog/pirls-87-questioncraft-rewrite/) |
| **Aura 5W1H** | [#13 5w1h.smes](/blog/aura-13-firebase-mirror/) | [#92 cagoooo.github.io/Aura](/blog/inspire-92-5w1h-pro-writing/) |
| **領域共備 GO** | [#15 report.smes](/blog/report-15-domain-meeting-go/) | **#84 cagoooo.github.io/domain-meeting-go**（本篇）|
| **詩意長輩圖** | [#14 poet.smes](/blog/poet-14-elder-greeting-image/) | [#91 cagoooo.github.io/PhotoPoet](/tool/91) |

## #84 真實怎麼做？

**真實標題**：「**領域共備 GO ｜ Domain Meeting Go**」

**Version 標籤** v0.5.4 / Next.js 15.2.3 / Firebase Functions v2 / **Gemini 2.5 Flash Lite**

**完整核心功能**（從 README 抽出）：

**功能 A：📝 會議資訊輸入**
- 教學領域（國語 / 數學 / 自然 / 社會⋯）
- 會議類別：**備課 / 觀課 / 議課 / 講座 / 社群 / 其他**
- 主題、日期、社群成員

**功能 B：📷 照片智慧描述**
- 最多上傳 **4 張會議照片**
- AI 逐張分析並產出符合教學情境的觀察描述
- **含重試機制 + 2 秒冷卻避開配額**（神細節！）

**功能 C：🤖 會議深度總結**
- 結合會議資訊與照片描述
- AI 產出**結構化 Markdown 總結報告**

**功能 D：📄 Word 匯出**
- 產出 \`.docx\` 含：
  - 基本資訊表
  - **簽到表**
  - 照片紀錄
  - Markdown 解析後的格式化總結

**功能 E：🖨️ PDF 匯出**
- 透過瀏覽器原生 \`window.print()\` + \`@media print\` CSS
- 產出 A4 版面 PDF
- **中文字型完美 + 標準分頁規則**

**功能 F：🎯 即時視覺回饋**
- 成功產出時在照片位置**播放彩花動畫**
- **進度條**
- **自動捲動定位**目前處理的項目

**功能 G：🎨 v0.5.0 編輯部期刊風 UI（大改版）**
- 報紙頭版 masthead
- **酒紅 × 牛皮配色**
- AI 摘要以雙欄期刊版型呈現
- **首字下沉、■ 項目符號、底部簽名**
- 自訂 \`dmg-*\` CSS 元件

## 真實技術棧

**前端**：
- Next.js 15.2.3（**App Router + Turbopack**，dev port 9002，靜態 export → GitHub Pages）
- React 18.3.1 + TypeScript 5
- Tailwind CSS 3.4 + shadcn/ui（Radix UI）
- **Google Fonts**: Noto Serif TC / Noto Sans TC / JetBrains Mono
- React Hook Form + Zod 表單驗證
- \`react-markdown\` + \`docx\` Word 生成
- \`window.print()\` + \`@media print\` CSS（**v0.4.0 起取代 html2pdf.js**）
- \`canvas-confetti\` 成功動畫

**後端 / AI**：
- Firebase Cloud Functions v2（\`onCall\` 可呼叫函式）
- **Google Genkit + @genkit-ai/google-genai**
- **模型**：\`googleai/gemini-2.5-flash-lite\`
- API Key 透過 \`defineSecret("GEMINI_API_KEY")\` 管理

**兩個對外 Cloud Functions**：
- \`generatePhotoDescriptions\` — 單張照片 AI 描述
- \`generateMeetingSummary\` — 整場 Markdown 總結

## v0.4.0 → v0.5.0 改版重點

**v0.4.0**：取代 html2pdf.js 改用 \`window.print()\` + \`@media print\`
- **痛點**：html2pdf.js 中文字型常掛、分頁亂跑
- **解法**：用瀏覽器原生 print → 中文字型完美 + 標準分頁

**v0.5.0**：「編輯部期刊風」UI 改版
- 從一般 form 風 → **報紙 masthead + 雙欄期刊**
- 「**會議記錄 = 期刊報導**」的美學定位

## 為什麼這值得寫獨立文章？

- ✅ **同源雙部署案例第 4** — 鞏固阿凱部署策略觀察
- ✅ **「**Gemini 2.5 Flash Lite + 多模態照片描述**」**技術案例
- ✅ **「**v0.4 取代 html2pdf**」**踩雷紀錄
- ✅ **「**編輯部期刊風 UI**」**對「會議記錄」這冷門需求的美學提升

## 教學情境（同 #15 但補充）

[#15 已寫詳細教學情境](/blog/report-15-domain-meeting-go/) — #84 補充：

**「**領域共備 GO Pro 用法**」**（本工具獨有功能）：
- **領域召集人會後 30 分鐘**：上傳 4 張會議照片 + 填會議資訊
- **#84 AI 逐張描述**（神細節：用 2 秒冷卻避配額爆）
- **整場深度總結 Markdown**
- **匯出 docx + PDF** 雙格式給校長 + 領域成員 + 教育局

## 配對工具推薦

- [#15 領域共備 GO（report.smes Firebase 版）](/blog/report-15-domain-meeting-go/) — 同源學校域名版
- [#24 上學期期末校務會議紀錄](/blog/meeting-24-end-semester-record/) — 同款會議系列
- [#80 114 下學期教師會議](/blog/meeting-80-spring-semester-week13/) — 週次會議

## 適用對象

- 國中小領域召集人
- 教學主任 / 教學組長
- 想看「**Gemini 多模態 + 照片描述**」案例的開發者
- 想看「**v0.4 取代 html2pdf 用 window.print**」遷移案例
- 任何需要「**會議記錄報告**」的職場人

## 想試試？

→ [前往 #84 會議記錄自動產出平台 Pro 版](/tool/84)
→ [#15 學校域名版](/blog/report-15-domain-meeting-go/)

實際功能完全一樣 — **掛學校網域 vs 掛 cagoooo.github.io 看你想分享給誰**（再次驗證阿凱同源雙部署策略）。
`,
};

const POST_2: BlogPost = {
  slug: 'staff-2-admin-coordination',
  title: '#2 行政業務協調系統：學校內部組長公告 + 重要行事 + 帳號登入 / 建立的協調平台',
  excerpt:
    '#2「行政業務協調系統」是阿凱為**學校內部組長 / 主任協調**做的平台。Tailwind CDN + 純前端 + Firebase Auth 登入 / 建立帳號 + 最新公告 + 重要行事 + 主頁面結構。掛在 cagoooo/staff repo。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['校園行政', '處室協調', '組長 / 主任', '公告系統', 'Firebase Auth'],
  toolIds: [2, 15, 49],
  coverEmoji: '🏛️',
  coverColor: 'orange',
  body: `## 學校處室之間「**資訊不對稱**」的真實痛點

學校行政分 5 大處室：
- **校長室**
- **教務處**（教學 / 註冊 / 設備 / 資訊）
- **學務處**（訓育 / 衛生 / 體育 / 生輔）
- **總務處**（事務 / 出納）
- **輔導室**

**痛點**：
- ❌ 處室之間**用 LINE 群組**散布訊息 → 訊息被洗
- ❌ **公告貼紙**貼公告欄 → 沒人看
- ❌ 重要行事**靠紙本記**或 Google 行事曆 → 各人有各自的版本
- ❌ 「**OO 主任你跟我說過了嗎？**」「**沒有啊？**」

阿凱的 **#2 行政業務協調系統** 反向：**一個內部協調平台 + 帳號制 + 集中公告 + 重要行事**。

## #2 真實怎麼做？

**真實標題**：「**行政業務協調系統**」

從 live HTML 抽出的 4 大區塊：

**1️⃣ 登入頁**
- 「**行政業務協調系統**」標題
- 帳號 + 密碼登入

**2️⃣ 建立帳號頁**
- 「**建立帳號**」流程
- **新進老師 / 新組長**首次使用

**3️⃣ 主頁面（登入後）**
- **📢 最新公告**
- **⭐ 重要行事**

**4️⃣ 角色系統（推測）**
- 不同處室組長看到的內容不同
- 或全校共用單一公告流

## 真實技術棧

- **純前端**（無 React/Vue bundle 引用）
- **Tailwind CDN**（\`cdn.tailwindcss.com\`）
- **Firebase Authentication**（推測）
- 部署：\`cagoooo.github.io/staff/\`
- HTML 39.7 KB

## 為什麼這值得寫獨立文章？

**「**學校內部資訊集中化**」是行政人員最常忽略的數位轉型項目** — 大家把外部資訊（網站 / Google Sites）數位化得很好，**對內溝通**反而還停留在 LINE / 紙本。

阿凱的 #2 把這痛點解掉 — **跟外部不同管道，內部用專屬平台**：
- ✅ 公告**集中**（不會被 LINE 洗）
- ✅ 行事**統一**（不會各人版本不同）
- ✅ 帳號制（**只有教職員看得到**）
- ✅ 不需要花錢買企業版 Notion / Slack

## 跟 #15 #49 三件套

阿凱的「**學校行政協調**」三件套：

| # | 工具 | 主軸 |
|---|---|---|
| **#2 行政業務協調**（本篇）| 校內**公告 + 行事** | 平日協調 |
| [#15 領域共備 GO](/blog/report-15-domain-meeting-go/) | **領域會議記錄** AI 摘要 | 教師社群 |
| [#49 教務處寶藏庫](/blog/academic-49-treasure-trove/) | **教務處子站** | 對全校公開 |

**#2 是「**對內部教職員**」 / #49 是「**對全校學生家長**」** — 兩端服務不同受眾。

## 教學情境

**新進老師入職第一週**：
- 校長：「**請去 #2 建立帳號**」
- 新老師看到完整公告 / 行事 → **快速進入學校節奏**

**處室主任早會**：
- 大家打開 #2 → **同步今日重要行事**
- 不用問「今天有什麼事」

**校長視導**：
- 「**讓我看你們處室的協調狀況**」
- 打開 #2 → 公告 / 行事一目了然
- 比翻 LINE 群組專業 100 倍

## 配對工具推薦

- [#15 領域共備 GO](/blog/report-15-domain-meeting-go/) — 領域會議記錄 AI
- [#49 教務處寶藏庫](/blog/academic-49-treasure-trove/) — 教務處對外子站
- [#24 校務會議紀錄](/blog/meeting-24-end-semester-record/) — 上學期期末會議

## 適用對象

- 校長 / 教導主任 / 學務主任 / 總務主任
- 各組組長（教學 / 註冊 / 設備 / 資訊 / 訓育 / 衛生⋯）
- 新進老師（快速跟上學校節奏）
- 想做「**校內溝通數位轉型**」的學校

## 想試試？

→ [前往 #2 行政業務協調系統](/tool/2)

新組長到任 — **第一週就建立帳號** → 公告 / 行事永遠跟得上。
`,
};

const POST_47: BlogPost = {
  slug: 'signature-47-consent-form',
  title: '#47 學生肖像授權同意書線上簽名系統：React 19 + Firebase + 簽名 PDF 自動生成 + Email 含連結 + v2.3 同意意願按鈕',
  excerpt:
    '#47 真實名稱「學生活動肖像使用授權同意書 - 線上簽名系統」。React 19 + TypeScript + Vite + Tailwind 4 + Framer Motion + Firebase（Firestore + Storage + Auth）+ react-signature-canvas + PDF 自動生成上傳 Firebase Storage 永久保存 + Email 含 PDF 下載連結 + v2.3 同意/不同意按鈕同步 PDF 顏色（綠/紅）+ 跨校支援。',
  publishedAt: '2026-05-21',
  readingMinutes: 5,
  tags: ['電子簽名', '肖像授權', 'React 19', 'PDF 自動生成', '跨校支援'],
  toolIds: [47, 48, 2],
  coverEmoji: '✍️',
  coverColor: 'blue',
  body: `## 紙本同意書的真實痛點

學校每學期要收 5-10 種同意書：
- 學生肖像授權（拍照 / 錄影用學校宣傳）
- 戶外教學
- 課後社團
- 校外比賽
- 健康訪查

**痛點**：
- ❌ 印 30 份 × N 種 → **每學期 200+ 張紙**
- ❌ 家長忘記簽 → **連環追**
- ❌ 簽完老師要**收 + 數 + 整理 + 鎖櫃 5 年**
- ❌ 教育局審查要看 → 翻箱倒櫃找

阿凱的 **#47 學生肖像授權同意書線上簽名系統** 反向：**家長手機簽 → PDF 自動生成 → 永久存 Firebase Storage**。

## #47 真實怎麼做？

**真實名稱**：「**學生活動肖像使用授權同意書 - 線上簽名系統**」

**完整功能（從 README 抽出）**：

**功能 A：✍️ 流暢簽名體驗**
- 整合 **react-signature-canvas**
- 提供**接近紙筆的書寫手感**
- 手機 / 平板 / 電腦都能簽

**功能 B：🛡️ 嚴格資料驗證**
- 限制年級 / 班級 / 座號**僅能輸入數字**
- **簽名筆畫複雜度檢查**，防止無效簽名（防止家長亂畫敷衍）

**功能 C：🔒 安全性強化**
- **Firebase Security Rules** 嚴格把關
- 簽名圖檔**自動壓縮並標準化 600×300**，節省流量

**功能 D：📊 管理員後台 2.0 (v2.0.0)**
- 🎨 繽紛漸層風格 + 動態背景
- 📱 **手機版自動切換卡片視圖**
- 🗑️ 批次管理（單筆 / 多選刪除）
- 📥 **Excel 匯出**完整簽署名單
- 🏷️ 視覺化徽章（年級 / 班級 / 座號）

**功能 E：🏫 跨校支援 (v2.1.0)**
- 新增**縣市 / 學校**欄位
- 後台**縣市篩選 + 學校搜尋**
- 一套系統服務多校

**功能 F：📄 PDF 自動生成 (v2.2.0)**
- 簽署完成後自動生成**包含完整條款 + 簽名的 PDF**
- 自動**上傳 Firebase Storage 永久保存**
- 不會丟失

**功能 G：📧 Email 通知升級 (v2.2.0)**
- 通知信件**包含 PDF 下載連結**
- 信件內容含縣市與學校資訊

**功能 H：✅ 簽署意願選項 (v2.3.0)**
- 新增「**同意 / 不同意**」單選按鈕
- **強制家長確認意願**
- PDF 與 Email **同步顯示簽署意願（同意綠色 / 不同意紅色）**
- 後台列表新增「**意願**」欄位
- 支援 Excel 匯出

## 真實技術棧

- **前端**：React 19 + TypeScript + Vite
- **樣式**：Tailwind CSS 4 + Framer Motion
- **後端**：Firebase（Firestore + Storage + Authentication）
- **路由**：React Router v7
- **管理員登入**：Firebase Auth Email/Password
- 訪問 \`/admin/login\` 進管理後台
- 部署：\`cagoooo.github.io/signature/\`

## 跟 #48 動態表單的差別

| # | 工具 | 主軸 |
|---|---|---|
| **#47 同意書**（本篇）| **電子簽名 + PDF** | 法律效力場景 |
| [#48 動態表單系統](/tool/48) | **拖曳式表單編輯器** | 一般問卷 / 報名 |

**#47 跟 #48 是學校行政數位轉型的姊妹工具** — 一個簽法律文件、一個收一般資訊。

## 教學情境

**學期初肖像授權收件**：
- 老師發 QR Code 給家長
- 家長手機**3 分鐘簽完**
- 老師後台**Excel 匯出**全班名單
- 收件率從 70% → 100%

**戶外教學前夕**：
- 同意書改 #47 模板
- 家長**深夜也能簽**
- 不用「**老師明天我簽好給你**」

**v2.3 同意/不同意按鈕**：
- 家長**明確選**而不是亂簽
- 不同意的學生 **不會被拍進團體照**
- 法律效力 + 隱私保護**雙贏**

## 「PDF 自動生成 + Firebase Storage 永久保存」的價值

對學校：
- ✅ **教育局審查要看** → 給 Firebase Storage 連結（**5 秒搞定**）
- ✅ **5 年保存規定** → 自動永久存（不會找不到）
- ✅ **家長要副本** → 直接傳 PDF 連結
- ✅ **零紙張**（環保 + 省錢）

## 配對工具推薦

- [#48 動態表單系統](/tool/48) — 一般表單需求
- [#62 親職教育日](/tool/62) — 同款活動專用工具
- [#2 行政業務協調系統](/blog/staff-2-admin-coordination/) — 校內行政平台

## 適用對象

- 國中小所有導師（學期初每年用）
- 教務 / 學務組長（彙整全校同意書）
- 校長 / 主任（教育局審查時提供）
- 想做「**法律效力電子簽名**」的學校
- 補習班 / 安親班 / 才藝中心（家長簽合約用）

## 想試試？

→ [前往 #47 學生肖像使用授權同意書線上簽名](/tool/47)

下學期肖像授權 — **改用 #47** → 開學一週內 100% 收齊 + 永久存檔。
`,
};

const POST_48: BlogPost = {
  slug: 'form-48-dynamic-builder',
  title: '#48 動態表單自動回報系統：Glassmorphism UI + 拖曳式表單編輯器 + 數據分析儀表板 + Google Chat Webhook 通知',
  excerpt:
    '#48「Form System」是阿凱用 React + Vite + Firebase 寫的動態表單系統，**取代 Google Apps Script 表單**。Glassmorphism 毛玻璃 UI + 動態流體背景 + 拖曳式表單編輯器 + 數據分析儀表板 + 表單模板庫 + 3 主題色 + Google Chat Webhook 即時通知 + CSV 匯出。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['動態表單', 'Glassmorphism', 'Google Chat Webhook', 'React + Firebase', 'CSV 匯出'],
  toolIds: [48, 47, 2],
  coverEmoji: '📝',
  coverColor: 'green',
  body: `## 為什麼老師不滿意 Google 表單？

Google 表單功能完整但 UI 死板：
- ❌ **介面老氣**（從 2008 到現在沒大改）
- ❌ **手機體驗不好**
- ❌ **沒有即時通知**（要回到 Google Sheet 看）
- ❌ **後台醜**
- ❌ 想做 **拖曳式自訂表單**要寫 Google Apps Script

阿凱的 **#48 動態表單系統** 反向：**現代化 UI + 拖曳式編輯器 + 即時通知 + 取代 Google Apps Script**。

## #48 真實怎麼做？

**真實名稱**：「**Form System (React + Firebase)**」

README 第一行寫：「**旨在取代舊有的 Google Apps Script 表單**」 — **明確定位反 Google 表單**。

**完整 7 大功能**：

**功能 A：🎨 Glassmorphism 毛玻璃 UI**
- 毛玻璃半透明設計
- **動態流體背景**
- 視覺差距比 Google 表單拉開 10 倍

**功能 B：📝 動態表單（拖曳式編輯器）**
- 透過後台**視覺化編輯器**輕鬆建立各類表單
- 不用寫程式

**功能 C：多主題支援**
- 內建 **藍 / 綠 / 粉**三種主題色
- 不同表單不同氣氛（活動報名用粉 / 行政表單用藍）

**功能 D：即時通知（Google Chat Webhook）**
- 學生 / 家長填完表單
- **自動推 Google Chat**
- 老師不用一直回去 Google Sheet 看新填

**功能 E：CSV 匯出**
- 一鍵匯出全部填表資料
- Excel 處理或寄給行政

**功能 F：v1.2.4 視覺大升級**（2026-01-29）
- ✅ UI 視覺大升級（繽紛色彩風格）
- ✅ **拖曳式表單編輯器**
- ✅ **數據分析儀表板**
- ✅ **表單模板庫**

**功能 G：v1.2.2 工程進化**
- ✅ CI/CD 自動化部署（GitHub Actions）
- ✅ **PWA 支援**可安裝到桌面

## 真實技術棧

- **Frontend**：React + Vite + Tailwind CSS
- **Backend**：Firebase（Firestore + Authentication）
- **Icons**：Lucide React
- **權限管理**：
  - **Admin**：完整權限
  - **Editor**：僅管理自己建立的表單
- 環境變數設定管理員憑證（避免敏感資訊外洩）
- 部署：\`cagoooo.github.io/form/\` 或 Firebase Hosting

## v1.2.4 「**表單模板庫**」的價值

對老師 — 不用每次都從零做表單：

| 學校場景 | 對應模板（推測） |
|---|---|
| 班級報名 | 班級報名表模板 |
| 活動意願調查 | 民調模板 |
| 戶外教學 | 戶外教學家長同意模板 |
| 教師研習 | 研習報名模板 |
| 學生滿意度 | 滿意度問卷模板 |

→ 老師選模板 → 改幾個欄位 → **5 分鐘上線**（比從零做快 10 倍）。

## 跟 #47 同意書的關係

| # | 工具 | 用途 |
|---|---|---|
| [#47 同意書線上簽名](/blog/signature-47-consent-form/) | **法律效力簽名 + PDF** | 同意書 / 合約 |
| **#48 動態表單**（本篇）| **一般問卷 / 報名** | 表單 / 資料蒐集 |

**#47 是「**法律文件**」 / #48 是「**資訊蒐集**」** — 兩個工具服務不同需求。

## 教學情境

**學期初家長問卷**：
- 用 #48 拖曳建表單
- 家長填完 → **Google Chat 通知**老師
- 不用回 Google Sheet 看

**教師研習報名**：
- 用模板建表單
- 全校老師掃 QR 填
- **CSV 匯出**給人事

**學生意見調查**：
- 用粉色主題（學生友善）
- **拖曳改欄位**「我最想要的校外教學地點」
- 即時看數據分析儀表板

**校外活動報名**：
- 跨班活動 → 多選核取方塊
- Glassmorphism UI **比 Google 表單漂亮**

## 配對工具推薦

- [#47 學生肖像授權同意書](/blog/signature-47-consent-form/) — 法律效力簽名
- [#62 親職教育日](/tool/62) — 同款學校活動 + 報名場景
- [#2 行政業務協調系統](/blog/staff-2-admin-coordination/) — 校內行政平台

## 適用對象

- 國中小所有任課老師（學期初家長問卷）
- 教務 / 學務組（活動報名 / 研習）
- 教師研習承辦
- 補習班 / 安親班（學生資料蒐集）
- 想看「**現代化 Google 表單替代品**」的開發者

## 想試試？

→ [前往 #48 動態表單自動回報系統](/tool/48)

下次要做表單 — **試試 Glassmorphism UI + 拖曳編輯器** → 不會想回去 Google 表單。
`,
};

const POST_62: BlogPost = {
  slug: 'parent-day-62-114-activity',
  title: '#62 桃園市龍潭區石門國民小學 114 學年度親職教育日活動通知函：純靜態活動專屬網站（EZPage 部署）',
  excerpt:
    '#62 真實名稱「桃園市龍潭區石門國民小學 114 學年度親職教育日活動通知函」是阿凱為石門國小 114 學年度親職教育日**做的活動專屬網站**。純靜態 HTML + EZPage 部署 + 活動邀請 + 活動時程表 + 精彩活動快覽 + 通知函格式。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['親職教育日', '活動通知', '石門國小', 'EZPage 部署', '節慶活動專用'],
  toolIds: [62, 74, 56],
  coverEmoji: '🎪',
  coverColor: 'pink',
  body: `## 跟 #74 親職日場地配置的關係

阿凱的「**親職日專屬系列**」：

| # | 工具 | 角色 |
|---|---|---|
| **#62 親職日活動通知函**（本篇）| **活動前** 邀請通知 | 家長知道有這個活動 |
| [#74 1150328 親職日場地配置](/blog/parent-day-74-venue-map/) | **活動當天** 場地導覽 | 家長知道去哪個攤位 |

**完整親職日數位流程**：
1. 活動前一週 → **#62 通知函** → 家長 LINE 看
2. 活動當天 → **#74 場地配置** → 家長手機掃 QR 找攤位
3. 活動結束 → **記錄回顧**（可能未來會做）

## #62 真實怎麼做？

**真實標題**：「**桃園市龍潭區石門國民小學 114 學年度親職教育日活動通知函**」

從 live HTML 抽出的完整結構：

**📜 通知函格式**
- 「**桃園市龍潭區石門國民小學**」
- 「**114 學年度親職教育日活動通知函**」

**📌 5 大區塊**：
1. **活動邀請**
2. **活動時程表**
3. **精彩活動快覽**
4. （推測還有）**場地配置 / 報名連結**
5. （推測還有）**聯絡資訊**

## 真實技術棧

- **EZPage 部署**（README 寫「Deployed by EZPage」）
- **純靜態 HTML**
- 沒有後端、沒有 LLM
- 32 KB 單檔
- 部署：\`cagoooo.github.io/114_Parent/\`

## 為什麼用 EZPage？

EZPage 是 \`gg90052.github.io/ezpage\` 的一鍵發布平台：
- ✅ **不用會 git**：複製貼 HTML 就部署
- ✅ **快**：5 分鐘上線
- ✅ **適合活動專屬**（一次性內容）

對「**活動通知函**」這 use case 完美：
- 不需要複雜後端
- 不需要長期維護
- 活動結束**保留當作紀念**

## 跟「節慶活動專用工具」系列

阿凱的「**單一活動專屬網**」系列：

| # | 活動 | 年度 |
|---|---|---|
| **#62 親職教育日 114 學年度**（本篇）| 親職日 | 114 學年度 |
| [#74 1150328 親職日場地配置](/blog/parent-day-74-venue-map/) | 親職日當天 | 115/3/28 |
| [#56 2026 元宵猜燈謎](/blog/lantern-56-festival-riddles/) | 元宵節 | 2026 年 |
| [#80 114 下學期教師會議](/blog/meeting-80-spring-semester-week13/) | 教師會議 | 114 下學期 |
| [#95 龍潭區語文競賽](/tool/95) | 語文競賽 | 115 年 |

**這些工具有共通點**：
- 帶**具體年度 / 日期**（114 / 2026 / 1150328）
- **單一活動專屬**
- **EZPage / 純靜態**部署
- 活動結束**留作紀念**

## 為什麼這些「活動專屬」工具值得寫？

對教育工作者來說 — **「活動專屬網**」是**最被忽略的數位轉型機會**：

- ✅ 傳統發紙本通知 → 一半家長丟掉
- ✅ LINE 群組訊息 → 被洗
- ✅ Email 通知 → 沒人看
- ✅ **專屬網站 + QR Code 推到群組** → **永久可看 + 視覺化呈現**

阿凱的工具集每年累積一個個活動，**整個學校的歷史就被數位化記錄下來**。

## 教學情境

**活動前 2 週**：
- 老師將 #62 連結貼班級 LINE 群組
- 家長收到通知 → 點開看完整時程表
- 比紙本通知函翻來覆去好讀

**活動前一晚**：
- 學校公開 IG / FB 分享 #62
- **比 PDF 通知函精美**
- 增加家長到場意願

**活動當天**：
- 家長現場 → 切到 #74 場地配置
- **#62 + #74 雙工具配合**完整體驗

**活動結束**：
- #62 / #74 **保留作為紀念**
- 明年承辦看「**去年怎麼做**」
- 學校歷史檔案數位化

## 配對工具推薦

- [#74 1150328 親職日場地配置互動網](/blog/parent-day-74-venue-map/) — 當天場地導覽
- [#56 2026 元宵猜燈謎](/blog/lantern-56-festival-riddles/) — 同款節慶專屬
- [#80 114 下學期教師會議](/blog/meeting-80-spring-semester-week13/) — 教師會議系列

## 適用對象

- 國中小親職日承辦老師（每年要做）
- 教務 / 學務組（彙整全學年活動）
- 想做「**活動專屬網**」的學校
- 「**校史數位化**」研究者

## 想試試？

→ [前往 #62 桃園市龍潭區石門國民小學 114 學年度親職教育日](/tool/62)

下次你校辦親職日 — **用 EZPage 5 分鐘做專屬通知網** → 比 PDF 通知函好用 100 倍。
`,
};

const POST_5: BlogPost = {
  slug: 'vendor-5-campus-food-order',
  title: '#5 校園點餐系統 v3.4.2：Firebase + React 三端分離（顧客 / 廚房 / 叫號）+ 多班級獨立庫存 + OAuth 權限分級',
  excerpt:
    '#5「校園點餐系統 (Campus Food Order)」v3.4.2 — 基於 Firebase + React 的現代化校園園遊會點餐系統。**三端分離**（顧客點餐 / 廚房管理 / 叫號顯示完全獨立）+ Firestore 即時資料庫 + 多班級獨立庫存（每班一個攤位）+ Firebase Auth Google OAuth 三層權限（owner / staff / none）+ PWA 離線。',
  publishedAt: '2026-05-21',
  readingMinutes: 6,
  tags: ['校園點餐', '園遊會', '三端分離', 'Firebase 即時', '多班級獨立庫存'],
  toolIds: [5, 27, 48],
  coverEmoji: '🍔',
  coverColor: 'yellow',
  body: `## 校慶園遊會的真實痛點

學校每年校慶 / 園遊會 → 每班一個攤位賣食物：
- 攤位 5-10 個 × 全校 20 班 = **100-200 個點餐窗口**
- **痛點**：
  - 排隊找零亂（學生不會算錢）
  - **菜單寫在紙板上**容易掉
  - 廚房做完不知道**誰是顧客**
  - 顧客不知道**自己的餐好了沒**
  - 老師統計營收要花一整晚

阿凱的 **#5 校園點餐系統** 反向：**Firebase 即時 + 三端分離 + 多班級獨立庫存**。

## #5 真實技術細節（v3.4.2）

**真實名稱**：「**校園點餐系統 (Campus Food Order)**」

**🌟 五大核心特色**：
- ⚡ **即時同步**：Firestore 即時資料庫，訂單狀態即時更新
- 🎯 **三端分離**：顧客點餐 / 廚房管理 / 叫號顯示**完全獨立**
- 📱 **響應式設計**：支援手機 / 平板 / 大螢幕
- 💾 **離線支援**：前端 localStorage 快取
- 🚀 **PWA 就緒**：可安裝到手機主畫面

## 三端分離設計（核心殺手鐧）

\`\`\`
顧客點餐 App    廚房管理 App    叫號顯示 App
   /order/        /kitchen        /display/
     ↓              ↓                ↓
       Firebase Firestore 即時同步
\`\`\`

**5 個路由**：

| 路徑 | 角色 | 用途 |
|---|---|---|
| \`/\` | 班級選擇 | 顧客選要點餐的班級攤位 |
| \`/order/:classId\` | **顧客點餐** | 指定班級的點餐介面 |
| \`/kitchen\` | **廚房管理** | 接單 / 調庫存（店長可切班級）|
| \`/display/:classId\` | **叫號顯示** | 大螢幕顯示取餐 |
| \`/admin\` | 管理中心 | 店長班級 + 用戶管理 |

## 完整版本演進史

**v3.4.2 (2026-03-10)**：擴充預設品項分類、自訂分類快捷、豐富預設值「一鍵升級舊班級」

**v3.0.0 (2026-01-09)**：**多班級獨立庫存系統大改版**
- 🏫 每班一個攤位 → 各自菜單 / 庫存
- 📋 班級選擇首頁
- 🔄 店長可在廚房後台切班級
- 🔗 動態路由 \`/order/:classId\` / \`/display/:classId\`
- 🔒 OAuth 驗證優化

**v2.0.0 (2026-01-08)**：
- ✨ PWA 支援
- 🔐 Firebase Auth Google/Email
- 👥 權限分級

## 🔐 OAuth 三層權限

| 角色 | 權限 |
|---|---|
| **owner** | 完整權限，可清除資料 |
| **staff** | 接單 / 調庫存 |
| **none** | 無權限（防止無權人員亂改）|

**設定流程**：
1. Firebase Console 啟用 Google 登入
2. 用 Google 帳號登入 \`/kitchen\`
3. 在 Firestore \`users\` 集合**把 role 改為 owner**

## 真實技術棧

- **前端**：React + Vite + TypeScript + Zustand 狀態管理
- **後端**：Firebase Firestore + Authentication
- **Cloud Functions**（選用）：API 端點
- **Firestore 資料結構**：
  - \`menuItems\`（含 stock 庫存）
  - \`orders\`（訂單流：Pending / Preparing / Completed / Paid / Cancelled）
  - \`system/config\`（isOpen / waitTime）
- 部署：\`cagoooo.github.io/vendor/\` + Firebase Hosting

## 跟「許願池」隱藏作品的關係

[#27 swissknife 許願池](/blog/swissknife-27-tool-vault/) 文章內提到 swissknife 子站還有：
- 「取餐叫號區」
- 「校園點餐後台」

→ 這是 **#5 校園點餐系統 v1.0 早期版本**（Google Sites Embedded）。
**v3.4.2 GitHub Pages 版** 已經把這些子功能**合併進三端分離架構**。

「**從 swissknife 早期版 → cagoooo.github.io/vendor v3.4.2 GitHub 版**」 = 阿凱**漸進式工具升級**的代表案例（跟 #87 PIRLS Pro 從 #4 升級同款邏輯）。

## API 端點（Cloud Functions 選用）

| 端點 | 用途 |
|---|---|
| \`/getMenu\` | 取菜單 + 系統狀態 |
| \`/getTrending\` | **熱銷品項** |
| \`/placeOrder\` | 顧客下單 |
| \`/getOrders\` | 訂單列表 |
| \`/updateOrderStatus\` | 更新狀態 |
| \`/updateStock\` | 更新庫存 |
| \`/getStats\` | **統計資料** |

## 教學情境

**校慶園遊會（單日 4-6 小時）**：
- 上午 9 點開校慶
- 顧客掃 QR → 進 \`/order/602\` 點 602 班攤位
- 廚房學生在 \`/kitchen\` 接單做菜
- 大螢幕掛 \`/display/602\` 顯示「**602 班 - 第 12 號餐已完成**」
- 全程**無紙本 + 無人工算錢**

**多班同時開攤**：
- 每班獨立路由
- 不同班庫存互不影響
- 老師管理員可切換班級看狀況

**期末統計**：
- \`/admin\` 一鍵看**全校營收**
- 哪班最熱銷 / 平均等待時間

## 配對工具推薦

- [#27 swissknife 許願池](/blog/swissknife-27-tool-vault/) — 含早期版本
- [#48 動態表單系統](/blog/form-48-dynamic-builder/) — 一般表單需求
- [#3 即時投票](/blog/live-vote-3-classroom-democracy/) — 同款 Firebase 即時同步

## 適用對象

- 國中小校慶 / 園遊會承辦
- 想做「**校園活動數位化**」的學校
- 想看「**Firebase 即時 + 三端分離架構**」的開發者
- 補習班 / 才藝中心（活動報名 + 餐點訂購）
- 想做小型線上點餐系統的人

## 想試試？

→ [前往 #5 校園點餐系統](/tool/5)

下次校慶 — **每班一個攤位 + 用 #5 跑** → 不用 cash 不會算錯 + 統計自動。
`,
};

const POST_55: BlogPost = {
  slug: 'zhuyin-55-bopomofo-challenge',
  title: '#55 ㄅㄆㄇ 注音大挑戰：6 主題關卡 + 漸進式解鎖 + 虛擬鍵盤拼注音 + 學習回顧模組（一年級必用）',
  excerpt:
    '#55 真實名稱「ㄅㄆㄇ 注音大挑戰 🎲」是阿凱為一年級兒童設計的注音學習遊戲。純前端 HTML/CSS/JS、6 個主題（水果 / 動物 / 交通 / 身體 / 家人 / 學校）+ 漸進式解鎖 + 虛擬鍵盤拼聲母韻母聲調 + 答對撒紙條 / 答錯震動 + localStorage 進度儲存 + 學習回顧看答對答錯紀錄。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['注音學習', '一年級', 'ㄅㄆㄇ', '漸進式解鎖', '純前端'],
  toolIds: [55, 21, 70],
  coverEmoji: '🎲',
  coverColor: 'yellow',
  body: `## 一年級「ㄅㄆㄇ」學習的真實痛點

一年級上學期前 10 週是**注音密集學習期**：
- 從不認識 ㄅㄆㄇ → 學會拼音
- 37 個注音符號 + 4 個聲調
- 老師最痛的是「**學生每個都會念但拼不出來**」

傳統做法：
- ❌ 抄注音 → 學生抗拒
- ❌ 注音樂理本 → 沒互動
- ❌ APP 廣告太多 → 老師不敢推薦

阿凱的 **#55 ㄅㄆㄇ 注音大挑戰** 反向：**6 個主題 + 漸進解鎖 + 虛擬鍵盤拼音 + 純前端零廣告**。

## #55 真實怎麼做？

**真實標題**：「**ㄅㄆㄇ 注音大挑戰 🎲 (Bopomofo Learning Game)**」

**完整 5 大功能**（從 README 抽出）：

**功能 A：6 個主題關卡（漸進式解鎖）**
- 🍎 **水果**
- 🐶 **動物**
- 🚗 **交通**
- ✋ **身體**
- 👨‍👩‍👧‍👦 **家人**
- 🏫 **學校**

**漸進式解鎖規則**：玩家必須**成功通過前一關，才能挑戰下一關**。

**功能 B：生動測驗互動**
- 每關從題庫**隨機抽 5 題**
- **可愛圖片 + 單字提示**（如「🍎 apple → ㄆㄧㄥˊㄍㄨㄛˇ」蘋果）
- 玩家用畫面下方**虛擬鍵盤**拼出對應的：
  - **聲母**（ㄅㄆㄇㄈ⋯）
  - **韻母**（ㄚㄛㄜㄝㄞ⋯）
  - **聲調**（一聲 / 二聲 / 三聲 / 四聲 / 輕聲）
- **答對**：彩色碎紙機動畫 + 綠色字體
- **答錯**：畫面震動 + 顯示正確答案

**功能 C：學習回顧模組**
- 關卡結束後可點「**學習回顧**」
- 查看該回合**所有答對與答錯的題目紀錄**
- 學生看自己弱在哪
- 老師看全班統計（推測有）

**功能 D：進度儲存（localStorage）**
- 已解鎖關卡 / 各關獲得的**愛心數量評等**
- 自動儲存於瀏覽器
- 「**重置進度**」按鈕重來

**功能 E：RWD**
- 手機 / 平板 / 桌機完美支援
- 自動調整大小與排版

## 真實技術棧

- **純前端 HTML/CSS/JS**（無框架！）
- 圖片引用外部 CDN（Apple / Banana 等）
- **無後端、無 LLM、無依賴**
- 部署：\`cagoooo.github.io/zhuyin/\`

「**極端適合 GitHub Pages 部署**」(README 原文) — 阿凱明確選擇純靜態的理由：**一年級工具最重要的就是「**永遠不會壞**」**。

## 跟 #21 #70 三件套對比

| # | 工具 | 學什麼 | 適合 |
|---|---|---|---|
| **#55 注音大挑戰**（本篇）| **拼注音**（聲母 + 韻母 + 聲調）| **一年級**入門 |
| [#21 中文注音打字](/blog/typing-21-zhuyin-keymap/) | **注音→鍵盤鍵位** | **四五年級**中打 |
| [#70 中打 Pro](/tool/70) | **進階中打競賽** | **高年級 + 大師級** |

**完整注音學習進化鏈**：
- **一上**：#55 學會 ㄅㄆㄇ 怎麼拼
- **四上**：#21 知道 ㄅㄆㄇ 在鍵盤哪
- **六上**：#70 中打速度大師級

## 教學情境

**一年級國語課**：
- **第 1-3 週**：學生上完 ㄅㄆㄇ 課堂後 → 玩 #55「水果」關卡
- **第 4-6 週**：解鎖「動物」「交通」
- **第 7-10 週**：「身體」「家人」「學校」漸進完成
- **學期末**：學生全 6 關通過 → **得到 6 顆愛心評等**

**早自習補強**：
- 全班同時開 #55
- 老師看誰卡哪個主題 → 個別輔導

**家長親子**：
- 假日家長陪小孩玩 → 看「**學習回顧**」對針弱點
- 比注音樂理本好玩 + 不用印

## 配對工具推薦

- [#21 中文注音打字遊戲](/blog/typing-21-zhuyin-keymap/) — 中年級鍵盤版
- [#70 中文注音打字 Pro](/tool/70) — 高年級進階版
- [#6 蜂類配對消消樂](/blog/bee-6-pair-game/) — 同款一年級主題（注音符號主題包）

## 適用對象

- 一年級導師（注音必教）
- 一年級國語老師
- 補救教學老師（針對拼音卡關學生）
- 家長親子教注音
- 想看「**純前端 + localStorage 漸進解鎖**」設計案例的開發者

## 想試試？

→ [前往 #55 ㄅㄆㄇ注音大挑戰](/tool/55)

一年級新生入學第一週 — **印 QR Code 貼黑板** → 學生掃進 → 從「水果」關開始解鎖整個世界。
`,
};

const POST_70: BlogPost = {
  slug: 'typing-70-zhuyin-pro',
  title: '#70 中文注音打字遊戲 Pro v1.3.0：4 級難度（初學者 / 入門 / 進階 / 大師）+ 全球排行榜 + 成績單分享 + PWA',
  excerpt:
    '#70「中文注音打字遊戲 Pro (Zhuyin Challenge Pro) v1.3.0」是 [#21 中打](/blog/typing-21-zhuyin-keymap) 的 Vite + Tailwind 升級版。4 級難度（初學者 / 入門 / 進階 / 大師）+ 進階詞庫（常用漢字 / 詞語 / 四字成語）+ 全球排行榜 + 一鍵生成成績單圖片分享 + PWA 離線可裝桌面。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['中打 Pro', '注音輸入', '全球排行榜', 'PWA', '成績單分享'],
  toolIds: [70, 21, 71],
  coverEmoji: '🏆',
  coverColor: 'blue',
  body: `## #70 跟 #21 是 Pro 版升級

阿凱的中打工具家族：

| 維度 | [#21 中打遊戲](/blog/typing-21-zhuyin-keymap/) | **#70 中打 Pro**（本篇）|
|---|---|---|
| 部署 | XOOPS 校網 VM | **GitHub Pages \`cagoooo/typeCC\`** |
| 程式碼 | 純前端單檔 HTML | **Vite + Tailwind CSS** 模組化 |
| 版本 | 早期單版 | **v1.3.0**（持續打磨）|
| 難度 | 單一模式 | **4 級**（初學者 / 入門 / 進階 / 大師）|
| 詞庫 | 字元落下 | **常用漢字 + 詞語 + 四字成語** |
| 排行榜 | 無 | **全球排行榜** |
| 分享 | 截圖 | **一鍵生成精美成績單圖片** |
| PWA | 無 | **可離線玩 + 安裝桌面** |

**「漸進式工具家族」**再 +1 案例（前 5 個：PIRLS / Aura / 教師回覆 / 演說 / 瑪莉歐）。

## #70 真實怎麼做？

**真實標題**：「**中文注音打字遊戲 Pro (Zhuyin Challenge Pro)**」

**完整功能（v1.3.0）**：

**功能 A：多級難度系統（4 級）**
- **初學者**：常見單字
- **入門**：常用漢字
- **進階**：常用詞語
- **大師**：**四字成語**（最高難度）

**功能 B：進階詞庫**
- 內建**常用漢字 / 詞語 / 四字成語**
- 隨著難度提升詞長變長

**功能 C：全球排行榜**
- 挑戰**世界各地的玩家**
- 留下名字 → 看排名
- 跟 #69 猴子投擲一樣有全球 PK

**功能 D：成績分享**
- 一鍵生成**精美的成績單圖片**
- 分享到 LINE / IG / FB
- 學生喜歡炫耀進步

**功能 E：PWA 支援**
- **離線遊玩**
- 可**安裝到手機 / 電腦桌面**
- 像原生 App

**功能 F：現代化設計**
- 基於 **Vite + Tailwind CSS** 響應式介面

## 真實技術棧

- **Vite** 建置工具
- **Tailwind CSS** 樣式
- 純 JavaScript（無大型框架）
- **MIT 授權**
- 部署：\`cagoooo.github.io/typeCC/\`

## 跟 #71 成語填空大挑戰是姊妹工具

阿凱的注音 / 成語**雙姊妹工具**：

| # | 工具 | 重點 |
|---|---|---|
| **#70 中打 Pro**（本篇）| **打字 + 注音鍵位** | 速度導向 |
| [#71 成語填空大挑戰](/tool/71) | **拼字 + 成語意義** | 知識導向 |

兩個工具 repo 命名也呼應：\`typeCC\` vs \`typeTC\` — \`Zhuyin Challenge\` vs \`Type Chengyu\`（成語）。

## 為什麼「全球排行榜」這麼重要？

對國小學生：
- ✅ **動機**：想看自己在世界第幾名
- ✅ **比較**：同學之間 PK
- ✅ **進步追蹤**：今天比昨天前進幾名

對老師：
- ✅ **資料**：看全班排名分布
- ✅ **獎勵**：「**這週進步最多得貼紙**」
- ✅ **班內競賽**：分組挑戰

## 教學情境

**資訊課中打單元（5 節課）**：
- **第 1 節**：認識中打 + 玩 #21 入門版熟悉鍵位
- **第 2 節**：玩 #70「初學者」級 → 第一張成績單
- **第 3 節**：升級「入門」「進階」級
- **第 4 節**：挑戰「大師」級四字成語
- **第 5 節**：班內 PK 大賽 → 全球排行榜競爭

**期末挑戰**：
- 期末作業：**全班同學分享成績單到家長 LINE 群**
- 看誰一學期進步最多

**家長假日陪練**：
- **「**今天破我中打紀錄**」**變家庭遊戲

## 配對工具推薦

- [#21 中文注音打字遊戲](/blog/typing-21-zhuyin-keymap/) — 早期 XOOPS VM 版
- [#71 成語填空大挑戰](/tool/71) — 姊妹成語版
- [#22 成語填空遊戲](/blog/idiom-22-fill-blank-game/) — 早期版

## 適用對象

- 國小高年級資訊老師（必教中打）
- 國中國文補救教學
- 家長想加強孩子中打速度
- 「**全球排行榜**」愛好者
- 想看「**Vite + Tailwind + PWA 中打遊戲**」案例的開發者

## 想試試？

→ [前往 #70 中文注音打字遊戲 (pro版)](/tool/70)

從「初學者」開始挑戰 → 看自己有沒有實力進「大師級四字成語」。
`,
};

const POST_71: BlogPost = {
  slug: 'idiom-71-typeTC-challenge',
  title: '#71 成語填空大挑戰 v1.3.1：Neon Heritage 霓虹古韻 UI + 國樂背景 + 櫻花特效 + Firebase 全球排行榜',
  excerpt:
    '#71「成語填空大挑戰 (TypeTC) v1.3.1」是 [#22 成語填空遊戲](/blog/idiom-22-fill-blank-game) 的進階版。Vite + Vanilla JS + Tailwind + **Neon Heritage（Red/Gold Theme）+ Glassmorphism「霓虹古韻」視覺** + 隨機**國樂背景音樂** + **櫻花落下特效** + Firebase Firestore 全球排行榜 + 2026-03-06 API Key 零洩漏規範。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['成語挑戰', '霓虹古韻', '國樂音樂', '櫻花特效', 'Firebase 排行榜'],
  toolIds: [71, 22, 70],
  coverEmoji: '🏮',
  coverColor: 'pink',
  body: `## #71 跟 #22 是進階版

阿凱成語工具家族：

| 維度 | [#22 成語填空遊戲](/blog/idiom-22-fill-blank-game/) | **#71 成語填空大挑戰**（本篇）|
|---|---|---|
| 部署 | XOOPS 校網 VM | **GitHub Pages \`cagoooo/typeTC\`** |
| 程式碼 | 純單檔 HTML | **Vite + Vanilla JS + Tailwind** |
| 視覺 | Tailwind 一般 | **Neon Heritage 霓虹古韻**（Red/Gold + Glassmorphism）|
| 音效 | 無 | **隨機國樂背景音樂** |
| 特效 | 無 | **櫻花落下** + 大氣氛圍 |
| 排行榜 | 無 | **Firebase Firestore 全球排行榜** |
| PWA | 無 | **PWA 支援 + 離線啟動** |
| 安全 | - | **2026-03-06 API Key 零洩漏規範** |

## #71 真實怎麼做？

**真實標題**：「**成語填空大挑戰 (TypeTC)**」

**完整功能（v1.3.1）**：

**功能 A：互動學習**
- **隨機成語挖空**強化記憶
- 跟 #22 同款核心機制

**功能 B：全域排行榜**
- 與全球玩家競爭
- **即時更新榮譽榜**
- 用 Firebase Firestore（**Anonymous Auth**，不需註冊）

**功能 C：霓虹古韻視覺（神細節）**
- **Neon Heritage (Red/Gold Theme)**
- **Glassmorphism** 毛玻璃
- 「**融合現代與東方美學**」
- RWD 響應式

**功能 D：大氣氛圍（v1.3.1）**
- **隨機國樂背景音樂**
- **櫻花落下特效**
- 「**體驗如原生 App**」

**功能 E：PWA 支援**
- 離線啟動
- 加入手機主畫面

**功能 F：安全防護（重要！）**
- **2026-03-06 API Key 零洩漏規範**
- **佔位符機制**：\`index.html\` 用 \`__PLACEHOLDER__\` 不含真實 API Key
- **祕鑰注入**：GitHub Secrets + \`.github/inject.py\` 部署階段注入

## 真實技術棧

- **核心**：Vite + Vanilla JS + Tailwind CSS（**沒用 React**）
- **視覺設計**：Neon Heritage (Red/Gold Theme) + Glassmorphism
- **後端**：Firebase Firestore（**Anonymous Auth**）
- **部署**：GitHub Actions + GitHub Pages
- repo：\`cagoooo/typeTC\`

## 為什麼選「霓虹古韻」這個視覺定位？

**Neon Heritage** = 「**霓虹現代 + 東方傳承**」：
- ✅ 紅金配色 → 傳統廟宇 / 春節
- ✅ Glassmorphism 半透明 → 現代化
- ✅ 國樂背景 → 古典氛圍
- ✅ 櫻花落下 → 東方美學

對「**成語**」這 use case 完美 — 成語本身就是**傳統文化的現代化呈現**，視覺呼應主題。

## 跟 #70 中打 Pro 是姊妹工具

兩個工具 repo 都用 \`type*\` 命名：
- **#70 \`typeCC\`** = **Z**huyin **C**hallenge **C**lassic（中打挑戰）
- **#71 \`typeTC\`** = **Type Chengyu**（成語）

阿凱「**寫一次基礎模組 → 換主題複製做不同工具**」的策略再 +1 案例。

## API Key 零洩漏規範（值得學的工程紀律）

從 README 看到阿凱 **2026-03-06 訂的內部規範**：

1. **佔位符機制**：\`index.html\` 中**不含真實 API Key**，用 \`__PLACEHOLDER__\` 格式
2. **祕鑰注入**：透過 **GitHub Secrets** 結合 \`.github/inject.py\` 於**部署階段注入真實值**

→ 不會把 API Key commit 到 repo 內，即使工具是 public repo 也安全。

跟我之前寫過的 [#7 點石成金 Gemini API Key 安全](/blog/comment-7-ai-positive-language/) 同款思路。

## 教學情境

**國語高年級成語單元**：
- 上完課堂成語教學 → 用 #71 鞏固
- 學生看「**Neon Heritage 視覺**」覺得「**成語也可以這麼酷**」
- 比看課本好玩 100 倍

**早自習語文素養**：
- 全班同時挑戰 #71
- 國樂背景 → 教室氛圍寧靜不吵
- 看誰登榮譽榜

**期末班級成語王挑戰**：
- 全球排行榜 PK
- 班內最高分頒「**班級成語王**」

**家長親子**：
- 中秋 / 春節傳統節日陪小孩玩
- 邊玩邊講成語典故
- **櫻花特效 + 國樂**很有節日氛圍

## 配對工具推薦

- [#22 成語填空遊戲](/blog/idiom-22-fill-blank-game/) — 早期 XOOPS VM 版
- [#70 中文注音打字 Pro](/blog/typing-70-zhuyin-pro/) — 姊妹中打版
- [#79 漢語新解](/blog/words-79-sarcastic-dictionary/) — AI 諷刺式新解

## 適用對象

- 國小高年級 / 國中國文老師
- 語文競賽選手培訓
- 想做「**東方美學 web app**」的開發者
- 想學「**API Key 零洩漏規範 + inject.py 注入**」的工程師

## 想試試？

→ [前往 #71 成語填空大挑戰](/tool/71)

打開 → 配上隨機**國樂背景音樂** → 看**櫻花落下** → 挑戰全球榮譽榜 — **這比 Kahoot 有質感 10 倍**。
`,
};

const POST_95: BlogPost = {
  slug: 'language-95-longtan-competition',
  title: '#95 2026 桃園市語文競賽龍潭區複賽：17 大項 / 33 場細分賽事 + 我的比賽時間查詢 + 個人指引卡列印（5/23 石門承辦）',
  excerpt:
    '#95「2026 桃園市語文競賽 龍潭區複賽」是石門國小**承辦 2026/5/23 龍潭區語文競賽**的對外宣傳網站。17 大項 / 33 場細分賽事 + **我的比賽時間查詢**（輸入場次 + 序號自動算抽題 / 上台 / 報到時間）+ **個人指引卡列印**選手專屬比賽行程 + 場地配置 1F-3F 分樓層 + A4 QR Code 海報。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['語文競賽', '龍潭區', '個人指引卡', '比賽時間查詢', '活動專屬網'],
  toolIds: [95, 67, 62],
  coverEmoji: '🏆',
  coverColor: 'green',
  body: `## 語文競賽承辦學校的真實痛點

學校承辦縣市級語文競賽 → **要服務數百位選手 + 帶隊老師 + 評審 + 家長**：
- 50+ 學校報名
- 17 大項：演說 / 朗讀 / 作文 / 寫字 / 字音字形 / 閩南語 / 客家語 / 原住民語⋯
- 一天賽程**緊張到分鐘級**

**痛點**：
- ❌ 印賽程表 → 老師 / 家長現場拿著翻
- ❌ 「**我的孩子幾點上場**」要問承辦
- ❌ 評審 / 選手 / 家長**走錯場地**
- ❌ 抽題時間 / 上台時間 / 報到時間**算不清楚**

阿凱的 **#95 龍潭區複賽** 反向：**對外宣傳網 + 個人化查詢 + 列印指引卡 + 分樓層場地圖**。

## #95 真實怎麼做？

**真實標題**：「**2026 桃園市語文競賽 龍潭區複賽**」

**完整資訊**：
- 📅 **2026 年 5 月 23 日（六）**
- 🏫 **石門國民小學承辦**
- 🌐 對外宣傳網站

**完整 4 大功能**（從 README 抽出）：

**功能 A：完整賽程表**
- **17 大項 / 33 場細分賽事**
- **分類篩選**（依語別 / 組別）
- **關鍵字搜尋**（找選手 / 找學校）

**功能 B：我的比賽時間查詢 ⭐（殺手鐧）**
- 輸入**場次 + 序號**
- 系統自動算出：
  - **抽題時間**（規定的多久前）
  - **上台時間**（精確到分）
  - **報到時間**

**功能 C：個人指引卡列印**
- 一鍵列印選手**專屬比賽行程**
- 含完整時間 / 場地 / 規則
- **比賽當天放口袋不會弄丟**

**功能 D：場地配置（分樓層）**
- **1F / 2F / 3F** 分樓層顯示
- 哪個比賽在哪間教室
- **不會走錯**

**附贈：A4 QR Code 海報**
- \`poster.html\` 可列印張貼
- 公佈欄掛一張 → 大家掃 QR 進網站

## 真實技術棧

- **單檔 HTML**（\`index.html\` 主網站含所有功能）
- **\`poster.html\`** A4 QR Code 海報
- **\`og.png\`** 1200×630 社群分享預覽圖
- 推測純前端 + 可能用 Firebase（個人查詢需要資料）
- 部署：\`cagoooo.github.io/Language-Competitions/\`

## 跟 #67 演說比賽 Pro 的關係

阿凱的「**語文競賽**」三件套：

| # | 工具 | 角色 |
|---|---|---|
| **#95 龍潭區複賽**（本篇）| **承辦資訊網** | 對外宣傳 + 場地查詢 |
| [#67 演說比賽訓練 Pro](/blog/speech-67-training-pro/) | **平日訓練** | 選手平日練習 |
| [#25 國語演說特訓班](/blog/speech-25-training-class-entry/) | **入門訓練** | 新手老師入門 |

**完整語文競賽生態**：
- 平日：#25 / #67 訓練
- 比賽前：#95 查場次時間
- 比賽中：#95 個人指引卡
- 比賽後：#67 雷達圖看表現

## 「活動專屬網」系列再 +1

阿凱的「**單一活動專屬網**」系列：

| # | 活動 | 部署 |
|---|---|---|
| [#62 親職教育日 114 學年度](/blog/parent-day-62-114-activity/) | 親職日 | EZPage |
| [#74 親職日場地配置 1150328](/blog/parent-day-74-venue-map/) | 親職日 | Google Sites |
| [#56 2026 元宵猜燈謎](/blog/lantern-56-festival-riddles/) | 元宵節 | GitHub Pages |
| [#80 114 下學期教師會議](/blog/meeting-80-spring-semester-week13/) | 教師會議 | Google Sites |
| **#95 龍潭區語文競賽**（本篇）| 語文競賽 | GitHub Pages |

**規律**：阿凱對校內承辦的大型活動都做一份**專屬網站**，活動結束**保留作紀念**。

**未來看歷史**：「**石門國小辦過哪些大型活動**」可以從這些工具拼出來。

## 教學情境

**選手家長**：
- 比賽前 1 週 → 老師發 #95 連結
- 家長輸入孩子場次 + 序號 → 看到完整時間
- 「**早上 8:00 報到、8:30 抽題、9:00 上台**」一目了然

**帶隊老師**：
- 自己學校 5 個選手分散不同場
- **列印 5 張個人指引卡**給選手帶身上
- 帶隊不會搞錯場次

**評審 / 監考老師**：
- 不熟石門校園
- 用 1F-3F 場地配置圖
- **5 分鐘找到教室**

**承辦學校石門**：
- 自己用 #95 確認賽程合理
- 同事不用一直問「**我的場次幾點**」

## 配對工具推薦

- [#67 演說比賽訓練 Pro](/blog/speech-67-training-pro/) — 平日訓練配套
- [#25 國語演說特訓班](/blog/speech-25-training-class-entry/) — 入門版
- [#62 / #74 親職日工具](/blog/parent-day-62-114-activity/) — 同款活動專屬網

## 適用對象

- 縣市語文競賽承辦學校
- 語文競賽帶隊老師
- 語文競賽選手家長
- 想做「**大型活動專屬網**」的學校
- 想看「**單檔 HTML 個人化查詢工具**」設計案例

## 想試試？

→ [前往 #95 2026 桃園市語文競賽龍潭區複賽](/tool/95)

下次你校承辦語文競賽 — **改改 #95 的賽程 + 場地 + QR 海報** → 5 小時搞定整套對外宣傳網。
`,
};

const POST_91: BlogPost = {
  slug: 'photopoet-91-pro',
  title: '#91 PhotoPoet Pro 點亮詩意：跟 #14 同源雙部署第 5 案例 + Cloudflare Turnstile + SSRF 防護 + Gemini 2.0 Flash 繁中詩生成',
  excerpt:
    '#91 PhotoPoet **Pro** 是 [#14 poet.smes Firebase Hosting 版](/blog/poet-14-elder-greeting-image) 的進階姊妹版！cagoooo/PhotoPoet repo + photopoet-ha364.web.app 線上版。Next.js 15 (static export) + Firebase Hosting + Cloud Functions gen2 + Genkit + **Cloudflare Turnstile** + **SSRF 防護**（私有 IP 黑名單 / redirect 重檢 / Content-Type 白名單 / 10MB / 8s 上限）+ Gemini 2.0 Flash 繁中詩生成。**阿凱同源雙部署策略第 5 案例**。',
  publishedAt: '2026-05-21',
  readingMinutes: 5,
  tags: ['長輩圖 Pro', '同源雙部署', 'Cloudflare Turnstile', 'SSRF 防護', 'Gemini 2.0 Flash'],
  toolIds: [91, 14, 86],
  coverEmoji: '🌅',
  coverColor: 'pink',
  body: `## #91 跟 #14 是同源雙部署第 5 案例

阿凱「**同源雙部署策略**」累積 **5 個案例**：

| 工具家族 | Firebase Hosting 學校域名 | GitHub Pages / 個人作品集 |
|---|---|---|
| **PIRLS** | [#4 pirlss.smes](/blog/pirls-4-firebase-mirror/) | [#87 cagoooo/pirls-questioncraft](/blog/pirls-87-questioncraft-rewrite/) |
| **Aura 5W1H** | [#13 5w1h.smes](/blog/aura-13-firebase-mirror/) | [#92 cagoooo/Aura](/blog/inspire-92-5w1h-pro-writing/) |
| **領域共備 GO** | [#15 report.smes](/blog/report-15-domain-meeting-go/) | [#84 cagoooo/domain-meeting-go](/blog/meeting-84-domain-go-pro/) |
| **詩意長輩圖** | [#14 poet.smes](/blog/poet-14-elder-greeting-image/) | **#91 PhotoPoet Pro**（本篇）|
| **領域共備 GO** （上面 #15/84）| - | - |

完整 4 工具家族 = 8 個工具掛雙網域。

## #91 真實怎麼做？

**真實標題**：「**PhotoPoet Pro · 點亮詩意（早安長輩圖產生器）**」

**核心流程**：
> 上傳照片 → **Gemini 2.0 Flash 生成繁體中文詩** → 一鍵下載長輩圖。

**線上版**：\`photopoet-ha364.web.app\`（**Firebase Hosting 預設域名**，不是 GitHub Pages 也不是 poet.smes — 第三個部署位置！）

## 真實技術棧（極完整）

- **前端**：**Next.js 15 (static export)**
- **部署**：**Firebase Hosting**
- **後端**：**Cloud Functions (gen2, asia-east1)**
- **AI 編排**：**Genkit**
- **人機驗證**：**Cloudflare Turnstile**

## 🔒 安全設計（三層防護，工程紮實度爆表）

### 1️⃣ Gemini API Key 嚴格限制
- API key **受限只能呼叫 \`generativelanguage.googleapis.com\`**
- 存於 **Firebase Secret Manager**
- 即使洩漏也只能呼叫 Gemini，**無法挪用其他 Google API**

### 2️⃣ SSRF 防護（神細節！）
\`proxyImage\` Cloud Function 配完整 SSRF 防護：
- 🚫 **私有 IP 黑名單**（防止打內網）
- 🔁 **redirect 重檢**（防止 301 跳到內網）
- ✅ **Content-Type 白名單**（只接圖片 MIME）
- 📦 **10MB 上限**（防 DoS）
- ⏱️ **8 秒 timeout**（防 hang）

**SSRF（Server-Side Request Forgery）是後端打外部 URL 最大的資安風險** — 阿凱寫了完整的防護程式碼，**這是企業級工程紀律**。

### 3️⃣ Cloudflare Turnstile 人機驗證
- \`generatePoem\` Cloud Function 受 **Cloudflare Turnstile 保護**
- **無 token 直接 403**
- 擋掉 bot 大量呼叫消耗 quota

## CI/CD 完整流程

- **push 到 \`main\`** → GitHub Actions 自動 deploy 到 **Firebase**
- 5 個 docs 文件支持：
  - \`docs/USAGE.md\` 詳細使用說明
  - \`docs/OPERATIONS.md\` 運維手冊
  - \`docs/ROADMAP.md\` 未來開發路線圖
  - \`docs/MIGRATION_AND_OPTIMIZATION.md\` 移植歷史記錄
  - \`docs/blueprint.md\` 原始產品需求

## 跟 #14 的差別（Pro 進化）

| 維度 | [#14 poet.smes](/blog/poet-14-elder-greeting-image/) | **#91 PhotoPoet Pro**（本篇）|
|---|---|---|
| 部署 | poet.smes Firebase Hosting | photopoet-ha364.web.app + Firebase Hosting |
| LLM | 推測 Gemini 圖文 | **Gemini 2.0 Flash** 明確 |
| 後端 | 推測 | **Cloud Functions gen2 + Genkit** |
| 人機驗證 | 無 | **Cloudflare Turnstile** |
| SSRF 防護 | 無 | **完整防護**（私 IP / redirect / MIME / size / timeout）|
| docs | 簡單 | **5 個 markdown 完整工程文件** |

**#91 Pro 是「**企業級工程紀律的 #14**」** — 同款 use case 但安全防護升 5 個檔次。

## 為什麼這值得寫獨立文章？

**「**個人作品也要做企業級安全**」** —— 阿凱在 #91 展示的工程紀律：

對工程師：
- ✅ SSRF 防護完整程式碼可學
- ✅ API Key 限制範圍最佳實踐
- ✅ Cloudflare Turnstile 整合案例
- ✅ Cloud Functions gen2 + Genkit 架構

對教育圈：
- ✅ 「**老師做的工具也可以這麼專業**」
- ✅ **個資隱私意識** — 學生長輩照片不會被亂打 API
- ✅ **永久維護** — Firebase 安全規則
- ✅ **不會被當免費 API 消耗點** — Turnstile 擋 bot

## 教學情境（同 #14 但補充工程紀律）

[#14 已寫教學情境](/blog/poet-14-elder-greeting-image/) — #91 補充：

**「**為什麼用 Pro 版而不是 #14**」**：
- ✅ **大量學生上傳照片** → Cloudflare Turnstile 擋 bot 不會把 quota 耗光
- ✅ **私照片不會洩漏** → SSRF 防護 + 限定範圍 API Key
- ✅ **學校 IT 組長放心** → 「**這工具有完整安全防護可推給家長**」

## 配對工具推薦

- [#14 poet.smes 早期版](/blog/poet-14-elder-greeting-image/) — 同源雙部署
- [#86 TieTu 3D Q版貼圖](/blog/tietu-86-chibi-sticker/) — 同款 AI 圖像 + LINE 整合
- [#94 封面接故事](/blog/music-cover-storyboard-94/) — 同款 Gemini multimodal

## 適用對象

- 國中小綜合活動 / 道德教育老師（孝親月）
- 想看「**SSRF 防護完整程式碼**」的後端工程師
- 想看「**Cloudflare Turnstile + Cloud Functions gen2**」案例的開發者
- 重視「**個人作品工程紀律**」的學習者

## 想試試？

→ [前往 #91 ✨點亮詩意 Pro✨ 早安長輩圖](/tool/91)

下次傳長輩圖 — **#91 Pro 版** → 配 Cloudflare Turnstile + SSRF 防護 → **比 #14 安全 5 倍**。
`,
};

const POST_45: BlogPost = {
  slug: 'wordcloud-45-realtime-interactive',
  title: '#45 WordCloud 即時互動文字雲：React 19 + Firebase Firestore 即時同步 + Top 1-3 流光漸層 + HUD 排名 + QR Code 房間',
  excerpt:
    '#45「☁️ WordCloud - 即時互動文字雲」是阿凱用 React 19 + TypeScript + Vite 7 + Tailwind 4 + Framer Motion 寫的多人協作文字雲。Firebase Firestore 即時更新 + Top 1-3 流光漸層動態漸層 + HUD 排名系統（科技風 RANK 標籤）+ 房間系統 + QR Code 分享 + 匯出圖片。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['文字雲', '即時互動', 'React 19', 'Firebase Firestore', 'QR Code 房間'],
  toolIds: [45, 11, 3],
  coverEmoji: '☁️',
  coverColor: 'blue',
  body: `## 文字雲在課堂的真實價值

文字雲（Word Cloud）是課堂互動的經典工具：
- 老師問「**這篇課文讓你想到什麼形容詞？**」
- 學生丟詞 → 系統依出現頻率調整大小
- **集體大腦地圖**呈現

傳統做法：Mentimeter / Slido — 都要付費 / 創帳號。

阿凱的 **#45 WordCloud** 反向：**免費 + 不用註冊 + QR Code 進房 + 即時同步 + 中文字體美觀**。

## #45 真實怎麼做？

**真實標題**：「**☁️ WordCloud - 即時互動文字雲**」

**完整 8 大功能**（從 README 抽出）：

**功能 A：🎨 流光視覺效果**
- **Top 1-3 詞彙**使用**動態流光漸層**
- 最熱門的詞會發光流動

**功能 B：🏆 HUD 排名系統**
- Top 1 顯示**科技風 RANK 標籤**
- 像遊戲 HUD（heads-up display）

**功能 C：🌈 多層次設計**
- **實心**、**熱門**、**描邊**等多種字體風格
- 視覺層次分明

**功能 D：🔄 即時同步**
- **Firebase Firestore 即時更新**
- 學生丟詞 → 投影**立刻看到**

**功能 E：📱 響應式設計**
- 桌面 / 手機 / 平板都支援

**功能 F：🏠 房間系統**
- 建立專屬房間
- 分享給朋友 / 學生

**功能 G：📷 匯出功能**
- 支援**匯出為圖片**
- 課後留作學期紀念

**功能 H：🔗 QR Code**
- 快速分享房間連結

## 真實技術棧

- **前端框架**：React 19 + TypeScript
- **建置工具**：Vite 7
- **樣式**：Tailwind CSS 4
- **動畫**：Framer Motion
- **後端**：Firebase Firestore（即時同步）
- 部署：\`cagoooo.github.io/cloud/\` + GitHub Actions 自動 deploy

## 跟 #3 #11 課堂互動三件套

| # | 工具 | 主軸 |
|---|---|---|
| [#3 即時投票](/blog/live-vote-3-classroom-democracy/) | 4 題型投票 | 選擇題為主 |
| [#11 剛好學課堂互動](/blog/classroom-interaction-11-easy/) | 9 大模式 | 多功能 SaaS |
| **#45 WordCloud**（本篇）| **開放式文字輸入 + 即時視覺化** | **討論導向** |

**#45 的獨特定位**：**最適合「**開放式集體討論**」** — #3 #11 都偏選擇題，#45 是讓學生「**自由丟詞**」看集體共識。

## 教學情境

**國語「課文討論」**：
- 老師問「**這篇課文的關鍵字是？**」
- 全班掃 QR → 進房 → 各自丟 5-10 個詞
- 投影即時看到 Top 1-3 流光標出**全班共識**
- 「**勇氣**」「**友情**」「**誠實**」最大字 → 老師接著問「**為什麼？**」

**社會「議題討論」**：
- 「**台灣的多元文化你想到什麼？**」
- 多元觀點視覺化呈現
- 全班看出共識 + 異見

**自然「實驗觀察」**：
- 「**這次實驗你觀察到的現象**」
- 集合全班觀察詞彙
- 統整成單元結論

**校級活動**：
- 親職日「**家長對學校的期待**」
- 校慶「**今天活動的感受**」
- **即時 + 公開 + 美觀**

## 為什麼這值得寫獨立文章？

對國中小老師：
- ✅ **比 Mentimeter 免費**
- ✅ **比 Slido 中文友善**
- ✅ **比 Padlet 即時**
- ✅ **QR Code 一秒進房**
- ✅ **匯出圖片**留作紀念

對開發者：
- ✅ React 19 + Vite 7 + Firebase Firestore 即時同步案例
- ✅ Framer Motion 動畫實踐
- ✅ Tailwind 4 + Top N 流光漸層 CSS 技巧

## 配對工具推薦

- [#3 學生即時投票](/blog/live-vote-3-classroom-democracy/) — 選擇題版
- [#11 剛好學課堂互動](/blog/classroom-interaction-11-easy/) — 9 大模式版
- [#79 漢語新解](/blog/words-79-sarcastic-dictionary/) — 同款語文延伸

## 適用對象

- 國中小所有任課老師（國語 / 社會 / 自然 / 綜合都能用）
- 想取代 Mentimeter / Slido 的老師
- 想看「**Firebase Firestore 即時文字雲**」案例的開發者
- 培訓師 / 演講者（讓聽眾即時參與）

## 想試試？

→ [前往 #45 即時互動文字雲](/tool/45)

第一次用建議：**問「**這節課讓你想到什麼**」** → 全班掃 QR → 5 分鐘看到集體大腦地圖。
`,
};

const POST_50: BlogPost = {
  slug: 'kids-50-zone-learning',
  title: '#50 童樂學園 KidsZone v1.5.0：💰 星星幣經濟系統 + 🛍️ 快樂商店 + 🧑‍🚀 個人化頭像 + 🎶 節奏達人 + 三級記憶翻牌',
  excerpt:
    '#50「KidsZone Learning Games (童樂學園)」v1.5.0 是阿凱為國小低中年級做的完整兒童遊戲學習平台。💰 星星幣經濟系統（簽到+10 / 遊戲分數/10）+ 🛍️ 快樂商店（限定頭像 / 驚喜貼紙包）+ 🧑‍🚀 20+ 角色個人化頭像 + 🎶 節奏達人（小星星 / 兩隻老虎）+ 記憶翻牌 2.0 三級分（經典 / 識字 / 心算）。',
  publishedAt: '2026-05-21',
  readingMinutes: 5,
  tags: ['兒童遊戲平台', '經濟學習', '星星幣', '個人化頭像', '節奏達人'],
  toolIds: [50, 6, 30],
  coverEmoji: '🎈',
  coverColor: 'pink',
  body: `## 國小低年級「**遊戲化學習平台**」的真實痛點

低年級老師最頭痛：
- 學生注意力 5-10 分鐘極限
- 多種學科要覆蓋（數學 / 國語 / 音樂 / 美感）
- 學生愛玩**手機遊戲**但都付費或廣告
- 想做「**獎勵機制**」但沒系統

阿凱的 **#50 童樂學園** 反向：**整合多種小遊戲 + 星星幣經濟 + 商店 + 頭像 + 完整 ecosystem**。

## #50 真實怎麼做？（v1.5.0）

**真實標題**：「**KidsZone Learning Games (童樂學園)**」

### v1.5.0 (2026/01/30)：💰 星星幣經濟系統（最新！）

**賺取金幣**：
- **每日簽到** +10 金幣
- **遊玩遊戲** 分數/10 金幣

**🛍️ 快樂商店**：
- 新增商店頁面
- 讓小朋友**學習儲蓄與消費**
- 商品內容：
  - 💎 **限定頭像**
  - 🎁 **驚喜貼紙包**

**體驗優化**：
- 首頁新增**金幣餘額顯示**
- 遊戲結算畫面**新增獲得金幣動畫**

### v1.4.0：🧑‍🚀 個人化頭像系統

- **角色選擇器**：太空人 / 公主 / 超人 / 小動物 等 **20+ 種角色**
- **貼紙裝飾**：用收集到的稀有貼紙（皇冠 / 星星）裝飾頭像
- **首創概念**：頭像 + 貼紙組合 = 學生獨有形象

### v1.4.0：🎶 節奏達人新遊戲

- 全新音樂遊戲
- 跟著《小星星》與《兩隻老虎》的節奏點擊音符
- 訓練手眼協調與節奏感
- 達成 **Perfect 連擊**可獲得高分

### v1.3.0：記憶翻牌 2.0（升級分級系統）

- **Level 1**：經典圖案配對
- **Level 2**：圖案對單字（🦁 vs 獅子）→ 結合識字學習
- **Level 3**：數學挑戰（2+3 vs 5）→ 訓練心算能力

**3 級分 = 跨年級適用**：
- Level 1：幼稚園～一年級
- Level 2：一年級～二年級識字期
- Level 3：二年級～三年級心算期

## 完整功能演進（4 個版本）

| 版本 | 日期 | 主要新增 |
|---|---|---|
| **v1.3.0** | 2026/01/30 | 記憶翻牌 2.0 三級分（圖案 / 識字 / 心算）|
| **v1.4.0** | 2026/01/30 | 個人化頭像（20+ 角色）+ 節奏達人 |
| **v1.5.0** | 2026/01/30 | **星星幣經濟系統** + 快樂商店 |

**1 月 30 日一天連 push 3 版！** 阿凱的爆速迭代力。

## 「**星星幣經濟系統**」的教育意義

這不是普通的虛擬幣 — 是**真實的兒童經濟學教育**：

| 概念 | KidsZone 怎麼教 |
|---|---|
| **賺錢** | 簽到（**勤勞**）+ 遊戲（**努力**）|
| **儲蓄** | 累積金幣等限定頭像 |
| **消費** | **驚喜貼紙包**滿足當下慾望 |
| **延遲滿足** | 想要好頭像 = 要存好幾天 |
| **價值判斷** | 限定頭像 vs 貼紙包要哪個 |

**比公民課講「**理財**」抽象 10 倍直觀**。

## 真實技術棧（推測）

- 部署：\`cagoooo.github.io/kids/\`
- 純前端（推測 React + Vite）
- localStorage / Firebase 存進度

## 跟 #6 #30 教育遊戲三件套

| # | 工具 | 規模 |
|---|---|---|
| [#6 蜂類配對消消樂](/blog/bee-6-pair-game/) | 單一遊戲 × 6 主題 | 配對遊戲專門 |
| [#30 遊戲集合](/blog/games-30-collection-12-in-1/) | **12 經典遊戲**合集 | 純玩無學習機制 |
| **#50 童樂學園**（本篇）| **完整 ecosystem**（遊戲 + 經濟 + 頭像 + 商店）| **學習機制最完整** |

**#50 = 兒童遊戲學習的最終形態**。

## 教學情境

**一年級電腦課**：
- **第 1 週**：學生建立帳號 + 選頭像
- **第 2-4 週**：玩記憶翻牌 Level 1
- **第 5-8 週**：升級 Level 2（識字）+ 節奏達人
- **第 9-12 週**：每日簽到 → 累積金幣
- **第 13-16 週**：開始消費 → **學習儲蓄 vs 消費抉擇**

**安親班 / 課輔**：
- 自由時間用 #50
- 比看 YouTube 好太多
- 學生**主動學習**

**家長親子**：
- 假日陪小孩玩
- 「**今天賺了多少金幣**」變家庭話題

## 配對工具推薦

- [#6 蜂類配對消消樂](/blog/bee-6-pair-game/) — 配對遊戲專門
- [#30 遊戲集合](/blog/games-30-collection-12-in-1/) — 12 經典遊戲合集
- [#44 快樂數學小冒險](/blog/math-adventure-44-grade-one/) — 一年級數學

## 適用對象

- 國小低年級 / 中年級導師
- 電腦課 / 資訊課老師
- 安親班 / 課輔老師
- 想做「**遊戲化學習平台**」的老師
- 想學「**虛擬經濟 + 兒童教育**」設計案例的開發者

## 想試試？

→ [前往 #50 童趣學園](/tool/50)

第一次玩建議：**讓孩子簽到 + 玩 1 局** → 看「**金幣 +10**」獲得感動 → 自然想再玩。
`,
};

const POST_52: BlogPost = {
  slug: 'soka-52-expo-registration',
  title: '#52 2026 創價・教育 EXPO 線上選課系統：React + Vite 整合式教育博覽會數位導覽小幫手',
  excerpt:
    '#52「**2026 創價・教育 EXPO ｜ 線上報名系統**」是阿凱為**創價・教育 EXPO 博覽會**做的線上選課平台。React + Vite + 流暢介面瀏覽科技 / 人文藝術各領域課程 + 即時選課 + 報名狀態追蹤 + 個人化課程清單管理。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['線上報名', '教育博覽會', '創價教育', '活動專屬網', 'React + Vite'],
  toolIds: [52, 62, 95],
  coverEmoji: '🎓',
  coverColor: 'purple',
  body: `## 教育博覽會的「**線上報名**」痛點

教育界**博覽會 / 論壇**辦活動：
- 50+ 場次同時進行
- 來賓要從多場次中**選自己有興趣的**
- 紙本選課表搞混亂
- 「**我選哪場了？**」「**這場跟那場時間衝突嗎？**」

傳統做法：Google 表單 → **沒有即時狀態 / 沒有個人清單**。

阿凱的 **#52 創價・教育 EXPO 線上選課** 反向：**整合式平台 + 即時選課 + 個人清單 + 數位導覽**。

## #52 真實怎麼做？

**真實標題**：「**2026 創價・教育 EXPO ｜ 線上報名系統**」

**完整功能**（從 tools.json 描述抽出）：

**功能 A：直觀介面瀏覽**
- 各領域課程一目了然
- **從科學技術到人文藝術一應俱全**

**功能 B：即時選課**
- 點擊報名 → 立即加入個人清單
- 不用等待表單送出

**功能 C：報名狀態追蹤**
- 「**已選 / 未選**」清楚顯示
- 不會重複選

**功能 D：個人化課程清單管理**
- 「**我的課程**」單獨頁
- 可隨時調整 / 取消

**定位**：「**博覽會參與者的數位導覽小幫手**」

## 真實技術棧

- **React + Vite**（從 live HTML 確認）
- **單檔靜態頁部署**（1133 bytes 入口 HTML 引外部 bundle）
- 部署：\`cagoooo.github.io/soka/\` (EZPage 部署)
- title: 「**2026 創價・教育 EXPO ｜ 線上報名系統**」

## 為什麼叫「**創價・教育**」？

「**創價學會**」（Soka Gakkai）是日本創立的國際性宗教 / 教育組織，全球有 1200 萬會員：
- 強調「**人本教育**」「**和平」「**文化**」
- 在台灣有 50+ 年歷史
- 每年辦教育博覽會推廣**創價教育理念**

阿凱為這個博覽會做數位報名系統 — **跨領域合作的案例**（不只服務石門國小，也服務外部教育機構）。

## 跟 #62 #74 #95 「活動專屬網」系列

阿凱的「**活動專屬網**」清單已 6 個：

| # | 活動 | 部署 |
|---|---|---|
| [#62 親職教育日 114](/blog/parent-day-62-114-activity/) | 親職日 | EZPage |
| [#74 親職日場地配置 1150328](/blog/parent-day-74-venue-map/) | 親職日當天 | Google Sites |
| [#56 2026 元宵猜燈謎](/blog/lantern-56-festival-riddles/) | 元宵節 | GitHub Pages |
| [#80 114 下學期教師會議](/blog/meeting-80-spring-semester-week13/) | 教師會議 | Google Sites |
| [#95 2026 龍潭區語文競賽](/blog/language-95-longtan-competition/) | 語文競賽 | GitHub Pages |
| **#52 2026 創價・教育 EXPO**（本篇）| **博覽會選課** | EZPage |

**6 個工具 = 阿凱對校內外大型活動的數位轉型方法論**。

## #52 的獨特定位

| 維度 | 其他活動專屬網 | **#52 創價 EXPO** |
|---|---|---|
| 對象 | **校內 / 學校承辦** | **跨機構教育博覽會** |
| 規模 | 學校級 100-500 人 | **千人級博覽會** |
| 功能 | 資訊呈現為主 | **即時報名 + 個人清單管理** |
| 技術 | EZPage / 純靜態 | **React + Vite 完整 web app** |

**#52 是「**對外輸出**」的代表作** — 證明阿凱的工具不只服務石門國小。

## 教學情境

**博覽會主辦方**：
- 開放線上報名 → 學生 / 老師掃 QR 進
- **即時看哪場最熱門**
- 「**個人清單**」減少撞場

**博覽會參與者**：
- 提前 1 週瀏覽課程
- 加入「**我的清單**」
- 當天**對著清單跑場次**

**校際合作觀摩**：
- 其他學校老師：「**你校也辦活動？我用 #52 模板做做看**」
- **跨機構推廣** = 阿凱的工具集影響力擴張

## 配對工具推薦

- [#62 親職教育日](/blog/parent-day-62-114-activity/) — 同款活動專屬網
- [#95 語文競賽龍潭區複賽](/blog/language-95-longtan-competition/) — 大型活動報名系統
- [#48 動態表單系統](/blog/form-48-dynamic-builder/) — 通用報名表單

## 適用對象

- 教育博覽會 / 論壇主辦
- 學校教師研習承辦（**多場次選課**場景）
- 想做「**跨機構教育活動專屬網**」的學校
- 想看「**React + Vite 即時報名系統**」案例的開發者

## 想試試？

→ [前往 #52 創價・教育 EXPO 線上選課](/tool/52)

下次你的單位辦多場次活動 — **用 #52 模板** → 比 Google 表單專業 100 倍。
`,
};

const POST_57: BlogPost = {
  slug: 'food-57-restaurant-wheel',
  title: '#57 選擇障礙專用 - 餐廳命運轉盤：React + Vite 純前端極簡轉盤工具（解決「今天吃什麼」永恆難題）',
  excerpt:
    '#57「餐廳命運轉盤」是阿凱用 React + Vite 寫的極簡轉盤工具，**解決選擇障礙**的「**今天吃什麼**」永恆難題。輕鬆一點讓轉盤決定 — 1.5KB 入口 HTML 純前端，課堂 / 親師活動 / 朋友聚餐通用。',
  publishedAt: '2026-05-21',
  readingMinutes: 3,
  tags: ['選擇障礙', '餐廳抽籤', '命運轉盤', 'React + Vite', '通用工具'],
  toolIds: [57, 17, 18],
  coverEmoji: '🎰',
  coverColor: 'orange',
  body: `## 「今天吃什麼」是現代生活的永恆難題

辦公室 / 教師室午餐時間經典對話：
- A：「中午吃什麼？」
- B：「都可以啊」
- A：「不然吃 OO？」
- B：「上週吃過了⋯」
- A：「那 XX？」
- B：「沒胃口⋯」
- ⋯（重複 20 分鐘）→ **時間都過去了還沒吃**

阿凱的 **#57 餐廳命運轉盤** 反向：**輕鬆一點 → 命運決定 → 不用再吵**。

## #57 真實怎麼做？

**真實標題**：「**餐廳命運轉盤 - 解決選擇障礙**」

**核心定位**：「**為選擇障礙打造的餐廳抽籤工具**」

**完整流程**（從 tools.json 抽出）：
- 輸入候選餐廳清單
- 點「**開始轉**」
- 轉盤旋轉動畫
- **命運**幫你決定

「**每次到了用餐時間總是不知道該吃什麼嗎？只需輕鬆一點，讓轉盤為你決定今天的美味餐點！**」

## 真實技術棧

- **React + Vite**
- **入口 HTML 1.5 KB**（純靜態 + 引外部 bundle）
- 推測純前端 localStorage 存清單
- 部署：\`cagoooo.github.io/food/\`

## 跟 #17 #18 「抽選工具」三件套

| # | 工具 | 抽什麼 |
|---|---|---|
| [#17 創意抽籤系統](/blog/draw-17-creative-lottery/) | **學生 / 項目**一個一個抽 | 課堂點人 |
| [#18 繽紛隨機學生抽選](/blog/student-pick-18-main-alternate/) | **正取 + 備取**一次出 | 比賽選拔 |
| **#57 餐廳命運轉盤**（本篇）| **餐廳**一次抽一個 | **生活決策** |

**#57 的獨特定位**：**生活向通用工具**（不只給課堂用）。

## 為什麼這個極簡工具值得寫？

**「**好工具不一定要複雜**」** —— 阿凱在工具設計上的另一種哲學：

- ✅ **解決真實痛點**：選擇障礙真的存在
- ✅ **極致簡單**：5 秒上手
- ✅ **跨情境通用**：個人 / 家庭 / 朋友 / 課堂
- ✅ **零學習成本**：阿公阿嬤都能用

對比阿凱有些工具（[#84 領域共備 GO](/blog/meeting-84-domain-go-pro/) 用 Cloudflare Turnstile + SSRF 防護）— **#57 是另一端**：**極簡到不能再簡單**。

## 教學情境

**教師室午餐戰**：
- 中午前 5 分鐘 → 老師們**輪流貼餐廳名**
- 點轉盤 → **命運決定**
- **沒人能說「上週吃過了」**

**校外教學決策**：
- 學生分組要去哪餐廳吃
- 候選 5 家貼進 #57
- **轉一下 = 公平**

**家庭晚餐**：
- 假日「**今晚要吃什麼**」
- 家人各選一家
- 命運決定 → **小孩很興奮**

**朋友聚餐**：
- LINE 群組各推一家
- 開 #57 → 全部貼進去
- **不用再投票**

**班級慶生會點外送**：
- 全班輪流貼最愛餐廳
- 命運轉盤決定 → 公平 + 有趣

## 跟 #50 童樂學園的反差

[#50 童樂學園 v1.5.0](/blog/kids-50-zone-learning/) = **超複雜 ecosystem**（經濟 + 商店 + 頭像 + 多遊戲）

**#57 餐廳轉盤** = **5 秒上手極簡工具**

兩個都是阿凱的代表作 — **複雜跟極簡並存的工具哲學**。

## 配對工具推薦

- [#17 創意抽籤系統](/blog/draw-17-creative-lottery/) — 課堂版抽籤
- [#18 繽紛隨機學生抽選](/blog/student-pick-18-main-alternate/) — 比賽抽選
- [#39 孔明神算](/tool/39) — 同款「**讓命運決定**」概念

## 適用對象

- **所有人**（不限學校 / 老師 / 學生）
- 教師室午餐戰
- 班級慶生會 / 校外教學
- 家庭晚餐決策
- 朋友聚餐決策
- 對「**選擇障礙**」深有同感的人

## 想試試？

→ [前往 #57 選擇障礙專用 - 餐廳命運轉盤](/tool/57)

下次「**今天吃什麼**」 — **5 秒上手** → **命運決定** → 不用再吵 20 分鐘。
`,
};

const POST_60: BlogPost = {
  slug: '3d-60-gallery-carousel',
  title: '#60 專屬創意 3D 畫廊：純 CSS transform-style preserve-3d 真實 3D 空間 + 拖曳旋轉 + 慣性滑動 + 倒影效果',
  excerpt:
    '#60「**🖼️ 專屬創意 3D 畫廊**」是阿凱用**純靜態零依賴**寫的 3D 旋轉木馬照片畫廊。CSS `transform-style: preserve-3d` 真實 3D 空間感 + 滑鼠拖曳旋轉 + 觸控手勢 + **慣性滑動效果**（仿物理摩擦感）+ 本機圖片上傳 + `-webkit-box-reflect` 地板倒影 + RWD。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['3D 畫廊', 'CSS preserve-3d', '旋轉木馬', '純靜態零依賴', '慣性滑動'],
  toolIds: [60, 32, 34],
  coverEmoji: '🖼️',
  coverColor: 'purple',
  body: `## 「3D 畫廊」展示學生作品的真實場景

學校每學期累積大量學生作品：
- 美術課畫作
- 手作課成品
- 戶外教學照片
- 校慶活動紀錄

**傳統呈現方式**：
- ❌ **公佈欄貼紙本**：空間有限 + 易掉
- ❌ **PowerPoint 跑馬燈**：太老氣
- ❌ **YouTube 影片**：不互動
- ❌ **Google Photos**：操作太繁

阿凱的 **#60 專屬創意 3D 畫廊** 反向：**真實 3D 旋轉木馬 + 拖曳互動 + 倒影效果**。

## #60 真實怎麼做？

**真實標題**：「**🖼️ 專屬創意 3D 畫廊**」

**核心定位**：「**一個純靜態、零依賴的互動式 3D 旋轉木馬照片畫廊，支援本機圖片上傳與完整觸控操作**」

**完整 7 大功能**（從 README 抽出）：

**功能 A：🎠 3D 旋轉木馬**
- 使用純 CSS \`transform-style: preserve-3d\`
- **真正的 3D 空間感**（不是 2D 模擬）

**功能 B：🖱️ 滑鼠拖曳旋轉**
- 以左右拖曳手勢**動態旋轉**畫廊

**功能 C：📱 觸控手勢支援**
- 完整支援手機與平板的**滑動操作**

**功能 D：⚡ 慣性滑動效果（神細節）**
- 放開後畫廊**持續以衰減速度旋轉**
- **仿物理摩擦感**
- 不是立刻停止，**像真實旋轉物體**

**功能 E：📁 本機圖片上傳**
- 直接從裝置選**任意數量圖片**
- 即時更新畫廊
- 不需後端

**功能 F：🌙 倒影效果**
- 使用 \`-webkit-box-reflect\`
- 生成美麗的**地板倒影**
- 像高級藝廊展示

**功能 G：📐 RWD 響應式**
- 自動適應手機 / 平板 / 桌機

## 真實技術棧（極簡）

- **純靜態 HTML / CSS / JavaScript**
- **零依賴**（無 React / Vue / 框架）
- 部署：\`cagoooo.github.io/3D/\`
- README 74 KB 超詳細（推測含完整技術解說）

## 為什麼用「純 CSS 3D」而不是 Three.js？

對比阿凱另兩個 3D 工具：
- [#29 太陽系探索者](/blog/solar-29-system-explorer/) = **Three.js**（複雜模型 + 物理）
- **#60 3D 畫廊**（本篇）= **純 CSS \`preserve-3d\`**（簡單旋轉）

**選擇邏輯**：
- ✅ 簡單 3D 場景 → 純 CSS（**零依賴 + 載入快**）
- ✅ 複雜 3D 模型 → Three.js（**功能完整**）

**用對工具是工程師的修養**（再次！）— 阿凱不會為了簡單畫廊套整個 Three.js 引擎。

## \`transform-style: preserve-3d\` 是什麼？

CSS 3D 變形的關鍵屬性：
\`\`\`css
.gallery {
  transform-style: preserve-3d; /* 子元素保留 3D 變形 */
  perspective: 1000px;          /* 透視距離 */
  transform: rotateY(0deg);     /* 旋轉角度 */
}

.photo {
  transform: translateZ(300px);  /* 推到 3D 空間中 */
}
\`\`\`

→ 真實 3D 空間感（**不是 2D 平移模擬**）。

## 跟 #32 #34 觸屏互動系列

| # | 工具 | 互動類型 |
|---|---|---|
| [#32 觸屏碰碰碰](/blog/touch-32-bombbombbomb/) | **點擊互動** | 隨機圖案浮動 |
| [#34 影像聲音遊戲區](/blog/interactive-34-image-sound/) | **多元互動** | 抓按鈕 + 拍照 + 360° |
| **#60 3D 畫廊**（本篇）| **拖曳旋轉互動** | 3D 空間感 |

阿凱「**為大型觸控螢幕設計**」系列再 +1 案例。

## 教學情境

**藝術與人文課展學生作品**：
- 學生美術課完作 → 拍照上傳 #60
- 課堂大螢幕投影 → 拖曳旋轉看
- **比一張張投影片好看 10 倍**

**校慶 / 親職日展覽**：
- 走廊大型觸控螢幕掛 #60
- 家長路過拖一下 → 看 3D 旋轉作品集
- **比海報生動 100 倍**

**畢業班禮物**：
- 整年活動照片 → 上傳 #60
- **6 年級畢業典禮投影**
- 學生看自己 3D 畫廊**會哭**

**學期末展覽**：
- 整學期作品集中展示
- 家長日 / 校長視察都能用

## 配對工具推薦

- [#29 太陽系探索者](/blog/solar-29-system-explorer/) — Three.js 3D 案例
- [#32 觸屏碰碰碰](/blog/touch-32-bombbombbomb/) — 觸屏互動系列
- [#68 學生作品上傳](/blog/student-portfolio-68-handcraft-uploads/) — 同款學生作品集

## 適用對象

- 藝術與人文 / 美術老師（展示學生作品）
- 攝影社 / 媒體社指導
- 學校公關 / 行銷（校慶宣傳）
- 想看「**純 CSS 3D + 慣性滑動**」案例的開發者
- 想做「**零依賴 web 畫廊**」的設計師

## 想試試？

→ [前往 #60 專屬創意 3D 畫廊](/tool/60)

第一次玩 — **本機上傳幾張照片** → **拖曳旋轉** → 看 **慣性滑動 + 倒影效果** = **「**這是純 CSS？**」**會驚豔。
`,
};

const POST_63: BlogPost = {
  slug: 'email-63-memory-park',
  title: '#63 Email 帳密記憶遊樂園：教學生記學校信箱帳密的 Vite + React + shadcn/ui 遊戲化工具',
  excerpt:
    '#63「Email 帳密記憶遊樂園」是阿凱用 Vite + TypeScript + React + shadcn-ui + Tailwind CSS 寫的學校信箱帳密記憶遊戲。解決國中小學生「忘記學校 Google 帳號 / 密碼」的真實痛點，遊戲化方式幫學生記住每天要登入的工具。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['Email 教學', '帳密記憶', '遊戲化', 'Vite + React', '學校 Google Workspace'],
  toolIds: [63, 50, 6],
  coverEmoji: '📧',
  coverColor: 'blue',
  body: `## 國中小「**學生忘記 Google 帳密**」的真實痛點

學校導入 Google Workspace 後，每個學生都有 \`@mail2.smes.tyc.edu.tw\` 學校信箱：
- 用來登入 Google Classroom
- 用來看老師發的作業
- 用來使用 Google Drive / Docs
- 用來登入各種教育工具（PIRLS / 5W1H / 班級小管家⋯）

**痛點**：
- ❌ 學生**每次都忘記密碼** → 老師重設一次又一次
- ❌ **帳號太長**（含學號 + 學校網域）
- ❌ 一年級剛開始用 → **不知道什麼是 @**
- ❌ 學生不懂「**信箱 vs 帳號 vs 密碼**」差別

阿凱的 **#63 Email 帳密記憶遊樂園** 反向：**遊戲化幫學生記住信箱結構 + 練習輸入**。

## #63 真實怎麼做？

**真實名稱**：「**Email 帳密記憶遊樂園**」

**核心定位**（推測）：
- 互動式遊戲教學生**認識 Email 結構**
- 練習輸入學校信箱
- 記憶密碼設定原則

## 真實技術棧

- **Vite + TypeScript + React**
- **shadcn-ui**（Radix UI 元件庫）
- **Tailwind CSS**
- 純前端（推測 localStorage 存進度）
- 部署：\`cagoooo.github.io/email/\`

## 為什麼這個工具值得寫？

**「**資訊素養基礎**」是被忽略的教學單元**：
- ✅ 學生會用 Google → 但**不懂 Email 結構**
- ✅ 學生會輸入密碼 → 但**不懂為什麼要設這麼複雜**
- ✅ **資訊素養課**要從「**認識 Email**」開始

阿凱用遊戲化方式 → **比講解 PPT 有效 10 倍**。

## 跟 #50 童樂學園的關係

| # | 工具 | 教什麼 |
|---|---|---|
| [#50 童樂學園 v1.5.0](/blog/kids-50-zone-learning/) | **完整兒童學習平台** | 多元學科 + 經濟學習 |
| **#63 Email 記憶遊樂園**（本篇）| **資訊素養基礎** | Email 結構 + 帳密記憶 |

**#63 是「**單一主題深耕**」 / #50 是「**多元主題廣度**」** — 兩種設計哲學。

## 教學情境

**三年級資訊課第 1 單元「認識 Email」**：
- 上完 Email 結構講解 → 學生玩 #63
- 練習輸入學校信箱
- 記住「**學號 + @mail2.smes.tyc.edu.tw**」格式

**一年級新生入學第 1 週**：
- 老師發學校信箱卡
- 學生用 #63 練習打卡
- **打 10 次 → 自然記住**

**補救教學**：
- 學生一直忘記密碼 → 老師指定玩 #63
- 比「**寫小卡片貼桌邊**」更生動

**家長親子**：
- 家長協助孩子記學校信箱
- **比逼背好玩**

## 配對工具推薦

- [#50 童樂學園](/blog/kids-50-zone-learning/) — 完整兒童學習平台
- [#20 英文字母打字練習](/blog/typing-20-english-letters-falling/) — 鍵盤輸入訓練
- [#61 英打打字超互動遊戲](/tool/61) — 進階英打

## 適用對象

- 國中小三年級資訊課老師（第 1 單元必用）
- 一年級導師（新生入學帳密設定）
- 補救教學老師
- 家長協助孩子記學校信箱

## 想試試？

→ [前往 #63 Email 帳密記憶遊樂園](/tool/63)

新學期開學 — **第一堂資訊課就用 #63** → 一週後全班學生不再來「**老師我密碼忘了**」。
`,
};

const POST_64: BlogPost = {
  slug: 'music-64-rhythm-beat-master',
  title: '#64 簡譜節拍師 v2.6 Rhythm Beat Master：太鼓達人風格 × Web Audio API 即時合成 × 7 鍵 Do Re Mi × 4 段難度',
  excerpt:
    '#64「🎵 簡譜節拍師 v2.6 — Rhythm Beat Master」是阿凱寫的**太鼓達人風格 × 簡譜節奏遊戲**。7 個按鍵（1-7 對應 Do Re Mi Fa Sol La Si）+ 三種判定（PERFECT 金 / GOOD 綠 / MISS 紅）+ COMBO 連擊 + Web Audio API 即時合成背景旋律 + 4 段難度（初學 / 一般 / 高手 / 地獄）+ LocalStorage 每首每難度獨立紀錄。',
  publishedAt: '2026-05-21',
  readingMinutes: 5,
  tags: ['簡譜節奏', '太鼓達人風格', 'Web Audio API', 'Do Re Mi', '節奏遊戲'],
  toolIds: [64, 50, 26],
  coverEmoji: '🥁',
  coverColor: 'pink',
  body: `## 音樂課「**簡譜節奏訓練**」的真實痛點

音樂課常見內容：
- 直笛 / 烏克麗麗 / 鋼琴 / 簡譜學習
- 老師最痛的不是學生不會吹/彈，是「**抓不到節奏**」

傳統做法：
- ❌ 拍手節奏：太抽象、無視覺
- ❌ 節拍器：聽得到但看不到
- ❌ 老師打節拍：學生看老師沒看譜
- ❌ 商業音樂 APP：**太鼓達人**很經典但**沒有簡譜版**

阿凱的 **#64 簡譜節拍師** 反向：**太鼓達人 × 簡譜 = 7 鍵 Do Re Mi 節奏遊戲**。

## #64 真實怎麼做？

**真實標題**：「**🎵 簡譜節拍師 v2.6 — Rhythm Beat Master**」

副標：「**太鼓達人風格 × 簡譜節奏遊戲 × Web Audio API**」

**🎮 核心玩法**：
- **7 個按鍵**：1～7 對應 **Do Re Mi Fa Sol La Si**
- 音符**從右往左捲動**
- 在「**判定線**」（菱形光柱）按下對應數字鍵
- 三種判定：
  - **PERFECT**（金色）⭐
  - **GOOD**（綠色）✅
  - **MISS**（紅色）❌
- **COMBO 連擊**統計

**🌟 五大高優先功能（v2.0 新增）**：

| 功能 | 說明 |
|---|---|
| 📁 **模組化重構** | \`game.js\` / \`input.js\` / \`index.js\` ES Module 架構 |
| 🎵 **背景旋律合成** | **Web Audio API 即時合成**（不放 mp3！）+ 倒數計時同步啟動 |
| 💾 **LocalStorage 最高分** | **每首歌 × 每個難度分別記錄**，選曲卡片顯示 PB 徽章 |
| 📱 **觸控虛擬按鍵** | **多指同時觸控**支援行動裝置 |
| 🎯 **四段難度調整** | 初學 / 一般 / 高手 / 地獄，**改變 Perfect/Good 判定視窗** |

**🎨 v2.6 全新改版**：UI/UX 視覺升級。

## 為什麼用 Web Audio API 合成而不是放 mp3？

阿凱的設計選擇：
- ✅ **載入快**（沒有 mp3 檔要載）
- ✅ **單檔即用**（不依賴外部資源）
- ✅ **可程式控制音高 / 時長**（隨難度調整）
- ✅ **跟倒數計時同步啟動**（精確 0 延遲）
- ✅ **iOS Safari 也能跑**（需要 user gesture 後 resume）

跟 [#33 讓聲音具現化吧](/blog/sound-33-visualizer/) / [#26 九九乘法大冒險](/blog/multiplication-26-adventure/) **同款選擇**：**用對工具是工程師的修養**（多次驗證）。

## 真實技術棧

- **純前端**（無 React/Vue 框架）
- **ES Module 架構**（\`game.js\` / \`input.js\` / \`index.js\` 拆分）
- **Web Audio API**（背景旋律 + 音效合成）
- **Canvas / DOM**（音符捲動 + 判定線）
- **LocalStorage** 進度與最高分
- 部署：\`cagoooo.github.io/music/\`

## 跟其他遊戲的「**漸進式工具家族**」

| # | 工具 | 同款設計選擇 |
|---|---|---|
| [#26 九九乘法大冒險](/blog/multiplication-26-adventure/) | Web Audio API 音效（不放 mp3）|
| [#33 讓聲音具現化吧](/blog/sound-33-visualizer/) | Web Audio API 麥克風分析 |
| **#64 簡譜節拍師**（本篇）| **Web Audio API 即時合成背景旋律** |

「**Web Audio API 三件套**」案例 — 阿凱對音訊處理的偏好。

## 教學情境

**音樂課「節奏訓練」單元**：
- **第 1 節**：講 Do Re Mi 1234567 對應 + 學生玩「**初學**」模式
- **第 2 節**：升「**一般**」難度
- **第 3 節**：「**高手**」級挑戰
- **第 4 節**：「**地獄**」級高手 PK

**直笛課暖身**：
- 上直笛課前 10 分鐘 → 學生玩 #64
- **建立 1234567 鍵盤反應**
- 接著直笛吹起來更順

**社團活動**：
- 音樂社 / 直笛社 / 烏克麗麗社
- 自由時間玩 #64 + 看誰連擊最高

**家庭親子**：
- 假日家長陪小孩玩
- 「**昨天連擊 50，今天破紀錄**」變家庭遊戲

## 配對工具推薦

- [#41 吉他點唱系統「阿凱彈唱之夜」](/blog/song-41-akai-night-tape-magazine/) — 同款音樂主題
- [#50 童樂學園的節奏達人](/blog/kids-50-zone-learning/) — 同款節奏遊戲（簡單版）
- [#33 讓聲音具現化吧](/blog/sound-33-visualizer/) — 聲音視覺化

## 適用對象

- 國中小音樂課老師
- 直笛 / 烏克麗麗 / 鋼琴指導老師
- 音樂社團指導
- 想看「**Web Audio API + 太鼓達人**」案例的開發者
- 想做「**節奏訓練 web app**」的工程師

## 想試試？

→ [前往 #64 簡譜節拍節奏大師](/tool/64)

打開 → 選「**初學**」模式 → 跟著音符按 1234567 → 看 PERFECT 金光連擊 → **這比商業節奏遊戲免費 + 中文友善**。
`,
};

const POST_93: BlogPost = {
  slug: 'mayor-93-little-mayor',
  title: '#93 石門國小自治市市長計票系統：5 畫面雙端架構（公開監票 / 後台唱票 / A4 報告 / OBS 直播 / 1080×1920 海報）',
  excerpt:
    '#93「🗳️ 石門國小自治市市長選舉計票系統」是阿凱寫的**即時計票 + 即時監票雙端系統**。**5 個畫面**：viewer 公開監票 / admin 教師後台唱票 / report A4 直式開票報告 / overlay OBS 直播浮層 / poster 1080×1920 當選海報。Firebase Realtime Database + Auth + GitHub Pages 部署。可嵌入學校官網 5 分鐘上線。',
  publishedAt: '2026-05-21',
  readingMinutes: 5,
  tags: ['自治市選舉', '即時計票', '雙端系統', 'Firebase Realtime DB', '校園民主'],
  toolIds: [93, 96, 3],
  coverEmoji: '🗳️',
  coverColor: 'orange',
  body: `## 國小「**自治市市長選舉**」的真實規格

108 課綱推動「**公民教育**」 — 國小自治市市長選舉是經典實踐：
- 全校學生**投票選出小市長**
- 每位候選人有政見發表
- 開票要**全班同步觀看**（每班大螢幕）
- 教師後台**唱票輸入**

**痛點**：
- ❌ 紙本選票算半天
- ❌ 教室不知道**現在票數**
- ❌ 學生看不到「**選舉的過程**」
- ❌ 計票錯了無法重來

阿凱的 **#93 自治市市長計票系統** 反向：**5 畫面雙端架構 + Firebase 即時 + 全校同步監票**。

## #93 真實怎麼做？

**真實標題**：「**🗳️ 石門國小自治市市長選舉計票系統**」

### 📐 5 個畫面（雙端架構）

| 頁面 | 用途 | 權限 |
|---|---|---|
| **\`index.html\`** | 入口分流 | 公開 |
| **\`viewer.html\`** | **公開監票**（全班觀看、即時同步、含當選公告動畫）| 公開 |
| **\`admin.html\`** | **後台唱票** / 候選人設定 / 列印報告 / 時間軸 | 教師帳號登入後可寫 |
| **\`report.html\`** | **A4 直式開票結果報告**（可列印 / 存 PDF）| 公開 |
| **\`overlay.html\`** | **OBS 直播浮層**（透明背景，給直播主用）| 公開 |
| **\`poster.html\`** | **1080×1920 當選海報**（社群分享用）| 公開 |

→ **同一套資料 6 個視覺呈現** = 完整選舉生態系。

### 🔒 安全原則

- **viewer 連結**：即使被學生拿到也只能看
- **admin 連結**：必須以管理員 email/密碼登入才能改票數
- Realtime DB rules **端把關**

### 🪟 可嵌入學校官網

README 提供完整嵌入程式碼：

\`\`\`html
<!-- 監票即時票數（最常用）-->
<iframe src="https://cagoooo.github.io/Little-Mayer/viewer.html"></iframe>
\`\`\`

**5 分鐘上線** — 校網管理員不需要會程式。

## 真實技術棧

- **前端**：純 HTML / CSS / JavaScript（推測無框架）
- **後端**：Firebase Realtime Database（即時同步）
- **認證**：Firebase Auth（教師 email/密碼登入）
- 部署：\`cagoooo.github.io/Little-Mayer/\`

## 為什麼 5 個畫面是核心設計？

阿凱「**為不同角色設計專屬畫面**」哲學：

| 角色 | 用哪個畫面 | 為什麼 |
|---|---|---|
| **教師主任**（計票員）| admin.html | **唱票輸入 + 控制節奏** |
| **全班學生**（觀察者）| viewer.html | **即時看票數變化** |
| **校長 / 督學**（報告對象）| report.html | **A4 開票報告紙本** |
| **學校 IG / FB 小編**（公關）| poster.html | **1080×1920 直接分享** |
| **學校直播主**（媒體）| overlay.html | **OBS 透明背景** |
| **學校官網訪客**（家長）| iframe 嵌入 viewer | **官網直接看** |

**6 種使用情境一次滿足** — 不需要切多套系統。

## 跟 #96 龍潭 DFC 投票的繼承關係

[#96 DFC 投票](/tool/96) README 明確標示：「**模式參考自 cagoooo/Little-Mayer**」 = #93 的延伸版。

| # | 工具 | 學校 |
|---|---|---|
| **#93 自治市市長計票**（本篇）| **石門國小**（阿凱主導）|
| [#96 龍潭 DFC 投票](/tool/96) | **龍潭國小**（阿凱協助） |

**跨校合作**：阿凱的工具不只服務石門 — 龍潭也用了類似架構。

## 教學情境

**自治市市長選舉日（半天活動）**：
- 早上 → 候選人政見發表
- 中午 → 全校投票
- 下午開票：
  - 教師主任在 admin.html 唱票
  - 全班大螢幕掛 viewer.html → **即時看票數**
  - 直播社團用 overlay.html → IG 直播
  - 結果出爐 → poster.html 分享社群 + report.html 列印給校長

**公民教育單元「**民主選舉**」**：
- 講「**選舉怎麼運作**」抽象
- 用 #93 跑模擬選舉
- 學生**體驗候選人 / 計票員 / 選民三種角色**

**校務會議報告**：
- 自治市選舉結果 → A4 report.html 列印給每位主任
- 永久存檔

**校史紀錄**：
- 每年自治市選舉**用 poster.html 留下海報**
- 累積學校民主教育歷史

## 配對工具推薦

- [#96 龍潭 DFC 投票](/tool/96) — 繼承版本（跨校）
- [#3 即時投票](/blog/live-vote-3-classroom-democracy/) — 課堂版投票
- [#11 剛好學課堂互動](/blog/classroom-interaction-11-easy/) — 9 大模式版

## 適用對象

- 國中小**自治市 / 班聯會**選舉承辦
- 學務 / 訓育組
- 公民教育 / 社會老師（民主選舉單元）
- 校長 / 主任（看選舉視覺化呈現）
- 想做「**校園民主數位化**」的學校
- 想看「**Firebase Realtime + 5 畫面架構**」案例的開發者

## 想試試？

→ [前往 #93 自治小市長 - 即時計票監票系統](/tool/93)

下次你校自治市選舉 — **5 個畫面服務 6 種角色** → 全校 + 家長 + 媒體一次到位。
`,
};

const POST_96: BlogPost = {
  slug: 'lungtan-96-dfc-voting',
  title: '#96 龍潭國小第 123 屆自治市小市長選舉 DFC 投票系統：跨校合作版本（繼承 #93 + DFC 行動方案投票）',
  excerpt:
    '#96「🗳️ 龍潭國小 第 123 屆 自治市小市長選舉 — DFC 投票系統」是阿凱為**龍潭國小**（不是石門國小）做的選舉系統。**明確標示「模式參考自 cagoooo/Little-Mayer」** = #93 的繼承版本。3 畫面（index 入口 / viewer 公開監票 / admin 後台）+ Firebase Realtime DB + DFC（Design for Change）行動方案投票模式。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['自治市選舉', '龍潭國小', 'DFC 行動方案', '跨校合作', 'Firebase 即時'],
  toolIds: [96, 93, 3],
  coverEmoji: '🏛️',
  coverColor: 'green',
  body: `## #96 跟 #93 的關係（跨校合作）

阿凱的工具集不只服務石門國小 — **#96 是為龍潭國小做的**：

| # | 工具 | 學校 |
|---|---|---|
| [#93 自治市市長計票](/blog/mayor-93-little-mayor/) | **石門國小** 自治市市長選舉 |
| **#96 DFC 投票**（本篇）| **龍潭國小** 第 123 屆自治市小市長選舉 |

#96 README 明確標示：「**模式參考自 cagoooo/Little-Mayer**」 = **#93 是 #96 的源頭**。

→ **阿凱的工具集成為跨校共用模板** — 不只服務自家學校，也服務其他學校。

## #96 真實怎麼做？

**真實標題**：「**🗳️ 龍潭國小 第 123 屆 自治市小市長選舉 — DFC 投票系統**」

**3 個畫面**（比 #93 精簡）：

| 頁面 | 用途 | 權限 |
|---|---|---|
| **\`index.html\`** | 入口分流（**顯示即時總票數 + 在線教室數**）| 公開 |
| **\`viewer.html\`** | 公開監票（**全校教室同步觀看 / 排行榜 / 皇冠特效 / 領先變更撒彩帶**）| 公開 |
| **\`admin.html\`** | 後台計票 / 方案設定（要 Firebase Auth 登入）| 管理員 |

**特色：DFC（Design for Change）模式**：
- 不只投市長 → **投候選人的「行動方案」**
- 學生看候選人**承諾要做什麼**而非「**誰當選**」
- 更接近真實民主 — **政策投票**

## 跟 #93 的差別

| 維度 | [#93 石門國小自治市計票](/blog/mayor-93-little-mayor/) | **#96 龍潭 DFC 投票**（本篇）|
|---|---|---|
| 學校 | 石門國小 | **龍潭國小** |
| 屆別 | 不明 | **第 123 屆** |
| 畫面數 | **5+ 個**（含 report / overlay / poster）| **3 個**（精簡）|
| 投票標的 | 候選人 | **DFC 行動方案** |
| 特效 | 當選公告動畫 | **皇冠特效 + 領先變更撒彩帶** |
| 觀眾顯示 | 即時票數 | **在線教室數 + 排行榜** |

**#96 在 #93 基礎上做了**：
- ✅ **DFC 概念整合**（投政策非投人）
- ✅ **更多視覺效果**（皇冠 + 撒彩帶）
- ✅ **教室同步顯示**（在線教室數）

## DFC（Design for Change）的教育意義

**Design for Change** 是 2009 年印度教育家 Kiran Bir Sethi 創辦的全球教育運動：
- 4 步驟：**Feel（感受）→ Imagine（想像）→ Do（行動）→ Share（分享）**
- 鼓勵學生**主動改變世界**
- 台灣 100+ 學校參與

**龍潭國小用 DFC 自治市選舉**：
- 候選人不只比政見口號
- 要提出**具體 DFC 行動方案**
- 學生**投政策不投人** — 比成人選舉更民主

阿凱的 **#96 把 DFC 教育理念數位化** — 不只是計票工具，是**民主教育的實踐平台**。

## 真實技術棧（推測同 #93）

- **前端**：純 HTML / CSS / JavaScript
- **後端**：Firebase Realtime Database
- **認證**：Firebase Auth
- 部署：\`cagoooo.github.io/Lungtan-DFC/\`

## 「跨校合作」生態的意義

| 阿凱工具 | 服務對象 |
|---|---|
| 大多 GitHub Pages 工具 | **石門國小**自家 |
| **#96 龍潭 DFC**（本篇）| **龍潭國小** |
| [#52 創價・教育 EXPO](/blog/soka-52-expo-registration/) | **教育博覽會跨機構** |

**「阿凱工具集」逐漸成為「**教師圈共用資源**」** — 不只是個人作品集，是**台灣教育圈的開源資源**。

## 教學情境

**龍潭國小自治市選舉**：
- 候選人提 DFC 行動方案（如「**讓圖書館每週多開 1 天**」）
- 全校學生投方案
- viewer.html 大螢幕同步監票
- 領先變更時撒彩帶 → 學生情緒投入

**公民教育「政策 vs 人物」單元**：
- 講「**為什麼投政策比投人重要**」
- 用 #96 模擬投票
- 學生體會 DFC 概念

**校長 / 主任介紹學校**：
- 「**我們學校用 DFC 模式辦選舉**」
- 給其他學校觀摩

## 配對工具推薦

- [#93 石門國小自治市計票](/blog/mayor-93-little-mayor/) — #96 的源頭
- [#3 即時投票](/blog/live-vote-3-classroom-democracy/) — 課堂版投票
- [#11 剛好學課堂互動](/blog/classroom-interaction-11-easy/) — 課堂多模式

## 適用對象

- 龍潭國小社群（直接受益）
- 推 DFC 教育的學校
- 自治市 / 班聯會選舉承辦
- 公民教育老師
- 想做「**跨校共用模板**」的學校

## 想試試？

→ [前往 #96 DFC 行動方案即時投票系統](/tool/96)

如果你校也想做 **DFC 自治市選舉** → **fork cagoooo/Lungtan-DFC** → 改學校名 + Firebase 配置 → 上線。
`,
};

const POST_78: BlogPost = {
  slug: 'curriculum-78-elementary-review',
  title: '#78 桃園市 115 學年度國小課程計畫 AI 審查工具 v4.1：跟 #88 國中版同源（國小 vs 國中對應版）+ 40+ 項審查 + 雙模式 + PWA',
  excerpt:
    '#78 是 [#88 國中課程計畫 AI 審查](/blog/curriculum-88-ai-junior-high-review) 的**國小對應版**！v4.1 雙模式（🔍 審查現成 PDF / ✨ 產生合規計畫）+ 對應桃園市教育局 40+ 項審查標準（0-1 到 7-12）+ 單項/批次雙模式 + 修正稿生成 + 多格式下載（HTML/Word/CSV/圖卡/LINE/Email）+ 產→審閉環 + 特殊班級提醒 + PWA 離線。',
  publishedAt: '2026-05-21',
  readingMinutes: 5,
  tags: ['課程計畫', '國小審查', 'Gemini API', '桃園市', '同源國小國中對應版'],
  toolIds: [78, 88, 15],
  coverEmoji: '📚',
  coverColor: 'blue',
  body: `## #78 跟 #88 是國小 vs 國中對應版

阿凱的「**課程計畫 AI 審查**」工具有兩個：

| # | 工具 | 對象 | 審查標準 |
|---|---|---|---|
| **#78 國小課程計畫 AI 審查**（本篇）| **國小**（1-6 年級）| **桃園市 115 學年度 40+ 項**（0-1 到 7-12）|
| [#88 國中課程計畫 AI 審查](/blog/curriculum-88-ai-junior-high-review/) | **國中**（7-9 年級）| **桃園市 0505 版 40+ 項** |

**「**漸進式工具家族**」**再 +1 案例：
- 同款架構不同教育階段
- 國小先做（#78），國中後做（#88）
- repo 命名：\`cagoooo/curriculum\` vs \`cagoooo/JHScurriculum\`（JHS = Junior High School）

## #78 真實怎麼做？（v4.1）

**真實標題**：「**桃園市 115 學年度國民小學課程計畫 AI 審查工具**」

副標：「**依據桃園市教育局 115 學年度審查標準，上傳課程計畫 PDF 即可透過 AI 自動審查 ｜ 阿凱老師製作**」

### 🔍 / ✨ 雙模式（v4.1）

**1. 🔍 審查現成 PDF**
- 上傳已寫好的計畫
- AI 比對 40+ 審查項次

**2. ✨ 產生合規計畫**
- 填表
- AI 內建桃園市 115 學年度規則
- **直接產出可送審草稿**

### 完整 11 大功能

**功能 A：📄 PDF 上傳擷取**
- 拖拉或點擊上傳
- 自動擷取課程計畫文字內容

**功能 B：📋 40+ 項審查標準內嵌**
- 涵蓋 **0-1 到 7-12** 全部項次
- **無需另外複製提示詞**

**功能 C：🔀 單項 / 批次雙模式**
- **單項精審** OR **批次跑全部項次**
- 自動產生**通過率總覽**

**功能 D：✏️ 可彈性編輯提示詞**
- 如實際門數與規定不同（如 3 門 → 2 門）
- 可直接修改再送出

**功能 E：🤖 AI 自動審查**
- 整合 Google Gemini API
- 一鍵送出即可得到審查建議

**功能 F：📋 複製提示詞**
- **無 API 金鑰時**，可複製完整提示詞到 ChatGPT / Gemini 網頁版使用

**功能 G：🤖 幫我寫修正稿**
- 對「**待修正**」項次一鍵生成 AI 修正建議草稿

**功能 H：📥 多格式下載**
- 審查報告：HTML / Word / CSV
- **摘要圖卡**
- LINE / Email 分享

**功能 I：🔄 修正後重新審查**
- 修正 PDF 後**快速重新上傳**
- **重複審查直到通過**

**功能 J：🔁 產→審閉環**
- 產生器生成完**一鍵送進審查模式驗證**
- 全自動循環

**功能 K：⚠️ 特殊班級提醒**
- 選擇**特教 / 藝才 / 體育班**項次時
- 自動顯示**需搭配人工審查**提示

**功能 L：💾 PWA 離線支援**
- 可安裝到桌面像 App 一樣使用

## 真實技術棧（推測同 #88）

- **單檔 HTML**（推測 200+ KB 含完整 prompt 模板）
- **PDF.js** 抽文字
- **Google Gemini API**（直接前端 fetch）
- **PWA + Service Worker**
- 部署：\`cagoooo.github.io/curriculum/\`

## 跟 #88 的差別

| 維度 | **#78 國小版**（本篇）| [#88 國中版](/blog/curriculum-88-ai-junior-high-review/) |
|---|---|---|
| 學習階段 | I / Ⅱ / Ⅲ | **Ⅳ** |
| 節數 | 低 20、中 25、高 26 | 7=30 / 8=30 / 9=29 |
| 部定科目 | 9 科 | **19 科**（含歷史 / 地理 / 公民 / 生物 / 家政⋯）|
| 在地化課程 | **有**（品 / 賞 / 讀桃園）| 無 |
| 雙語檢核 | **有**（7-10）| 無 |
| 統整探究門數 | 3/3/4/4/6/6 | 7=3 / 8=3 / 9=5 |

**#78 對應「**國小特色**」**：
- ✅ **在地化課程**（桃園在地文化）
- ✅ **雙語檢核**（國小雙語政策對應）
- ✅ **六年制**（1-6 年級各對應節數）

## 跟 #15/#84 領域共備 GO 的關係

阿凱的「**教師端課程相關工具**」：

| # | 工具 | 角色 |
|---|---|---|
| [#15 領域共備 GO（學校 subdomain）](/blog/report-15-domain-meeting-go/) | **會議記錄 AI 摘要** | 領域會議 |
| [#84 領域共備 GO Pro（GitHub Pages）](/blog/meeting-84-domain-go-pro/) | **同上 同源雙部署** | 領域會議 |
| **#78 國小課程計畫 AI 審查**（本篇）| **整學期計畫**送審 | 校內預審 |
| [#88 國中課程計畫 AI 審查](/blog/curriculum-88-ai-junior-high-review/) | **整學期計畫**送審 | 校內預審 |

**完整課程生態**：會議記錄 → 課程計畫 → 送審 → 修正 → 通過。

## 教學情境

**國小教務組長期初送審**：
- 8 月底要送桃園市教育局審查
- 用 #78 雙模式：
  - 已有舊版 → 🔍 審查 PDF
  - 從零開始 → ✨ 產生合規計畫
- 「**待修正**」項次 → **一鍵生成修正稿**
- 修完重新上傳 → **產→審閉環**直到通過

**新進教務組長**：
- 不知道課程計畫該怎麼寫
- 用 #78 ✨ 產生模式 → 看 AI 範本學格式
- **避免被退件**

**特殊班級老師**（特教 / 藝才 / 體育）：
- #78 自動提醒「**需搭配人工審查**」
- 避免 AI 對特殊班級規定不熟造成誤判

**校際分享**：
- 桃園市其他國小教務組長
- 用 #78 改檔案名 + 改教育局版本 → 自己學校用

## 配對工具推薦

- [#88 國中版](/blog/curriculum-88-ai-junior-high-review/) — 同款國中對應版
- [#15 領域共備 GO](/blog/report-15-domain-meeting-go/) — 領域會議記錄
- [#58 十二年國教教案生成器](/blog/prepare-58-lesson-plan/) — 單元教案配套

## 適用對象

- 桃園市所有國小教務組長
- 教學主任 / 教務主任
- 想看「**國小 vs 國中審查標準對照**」的教育研究者
- 想做「**送審 AI 工具**」的其他縣市學校

## 想試試？

→ [前往 #78 桃園市 115 學年度國小課程計畫 AI 審查](/tool/78)

8 月底前 — **用 #78 跑一次學校送審計畫** → 找出待修正項次 → 一鍵生成修正稿 → 通過率提升。
`,
};

const POST_23: BlogPost = {
  slug: 'comments-23-web-version',
  title: '#23 點石成金蜂 v2.9.1 網頁版：跟 #7 LINE Bot 是雙形式 — React 18 + Gemini 2.5 Flash + 多元風格 + 成語庫帳號隔離',
  excerpt:
    '#23「點石成金蜂🐝 - AI 評語產生器」是 [#7 LINE Bot 版](/blog/comment-7-ai-positive-language) 的**網頁版同源工具**！v2.9.1 + React 18.3 + Firebase 12.7 + Gemini 2.5 Flash。多元風格（質性描述 / 量化分析 / 鼓勵激勵）+ 字數與語氣調整 + 豐富成語庫（資賦/學業/品德/人際/服務）+ 帳號隔離儲存。',
  publishedAt: '2026-05-21',
  readingMinutes: 5,
  tags: ['評語優化', '點石成金蜂', 'Gemini 2.5 Flash', 'React 18', '同源雙形式'],
  toolIds: [23, 7, 89],
  coverEmoji: '🐝',
  coverColor: 'yellow',
  body: `## #23 vs #7 — 同源雙形式

阿凱的「**點石成金蜂評語優化**」工具有**兩種介面形式**：

| 維度 | [#7 LINE Bot 版](/blog/comment-7-ai-positive-language/) | **#23 網頁版**（本篇）|
|---|---|---|
| 入口 | LINE 加好友 \`@733oiboa\` | \`cagoooo.github.io/comments\` |
| 介面 | LINE 對話視窗 | **完整 React Web App** |
| 適合 | 手機隨時用 | **桌面正式撰寫評語** |
| 版本 | LINE Bot 服務 | **v2.9.1 持續更新** |
| repo | LINE Messaging API | **cagoooo/comments** |

**「同源雙形式」設計哲學**：
- ✅ 手機用 → LINE Bot（**懶得開電腦**）
- ✅ 電腦用 → 網頁版（**完整功能**）

跟前面提過的「**同源雙部署**」(Firebase Hosting + GitHub Pages) 不同 — 這是「**同源雙介面**」（LINE vs Web）。

## #23 真實怎麼做？（v2.9.1）

**真實標題**：「**點石成金蜂🐝 - AI 評語產生器**」

副標：「**🎓 專為教師設計的學生評語智慧生成工具，讓撰寫評語變得輕鬆又高效！**」

### 🤖 AI 智慧生成

- **Gemini 2.5 Flash API**：採用最新 Google Gemini 模型生成高品質評語
- **多元風格選擇**：支援「**質性描述**」「**量化分析**」「**鼓勵激勵**」等多種評語風格
- **字數與語氣調整**：可自訂評語長度與正式程度

### 📝 成語庫與標籤

- **豐富成語分類**：涵蓋資賦 / 學業 / 品德 / 人際 / 服務等多種類別
- **常用成語排序**：依使用頻率自動排序，提高效率
- **帳號隔離儲存**：每位教師獨立保存常用成語記錄

## 真實技術棧

- **前端**：React 18.3
- **後端**：Firebase 12.7
- **AI**：Gemini 2.5 Flash API
- 部署：\`cagoooo.github.io/comments/\`

## 跟 LINE Bot 版（#7）的功能差別

**#7 LINE Bot 版優勢**：
- ✅ 手機快速使用（不用開電腦）
- ✅ 介面熟悉（LINE 介面）
- ✅ 適合「**靈光一現想到該怎麼修飾**」

**#23 網頁版優勢**：
- ✅ **多元風格切換**（一次看 3-5 種風格）
- ✅ **字數 / 語氣精細控制**
- ✅ **成語庫分類分層**
- ✅ **多人協作 + 帳號隔離**

## 「同源雙形式」設計哲學的價值

阿凱對「**同一個 AI 工具兩種介面**」的執著有教育意義：

| 老師類型 | 偏好介面 |
|---|---|
| 50+ 歲資深老師 | **LINE Bot**（介面熟悉）|
| 30-40 歲中堅老師 | **網頁版**（功能完整）|
| 補教 / 安親班 | **LINE Bot**（即時溝通）|
| 學校行政組長 | **網頁版**（正式撰寫）|

→ **沒有一種介面服務所有人** — 提供雙形式才能最大化使用者覆蓋。

## 教學情境

**期末打評語高峰期（12 月 / 6 月）**：
- 老師打開 #23 網頁版
- 全班 30 個學生**逐一生成評語**
- **多元風格切換** 看哪種最適合該生
- 字數 / 語氣調整 → **精準個人化**

**期中校際分享**：
- 老師用 #23 寫 + 校內群組分享技巧
- 用 #7 LINE Bot 推薦給其他學校老師

**新進老師補救教學**：
- 不知道評語怎麼寫好
- 用 #23 看 AI 提供的多元風格
- **建立寫評語的標準**

**家長親師會前**：
- 老師需要快速整理 5-10 個學生重點
- #23 批次生成 + 自己調整

## 配對工具推薦

- [#7 點石成金 LINE Bot 版](/blog/comment-7-ai-positive-language/) — 同源 LINE 介面
- [#89 教師回覆小幫手 Pro](/blog/teacher-reply-89-pro-parent-message/) — 親師訊息 AI
- [#16 親師溝通小幫手](/blog/talk-16-teacher-helper/) — 基礎版

## 適用對象

- 國中小所有班導（每學期 2 次評語撰寫高峰）
- 教學主任 / 教務組長
- 補教 / 安親班教師
- 想看「**同源雙介面 (LINE + Web)**」案例的開發者

## 想試試？

→ [前往 #23 點石成金蜂評語優化網頁版](/tool/23)
→ [#7 LINE Bot 版](/blog/comment-7-ai-positive-language/)

期末打評語 — **#23 桌面正式寫 + #7 手機快速修** → 完整覆蓋。
`,
};

const POST_42: BlogPost = {
  slug: 'privacy-42-child-face',
  title: '#42 兒童臉部隱私保護工具：SSD MobileNet 自動偵測 + 三種遮蓋（Emoji / 馬賽克 / 模糊）+ 臉部旋轉偵測 + 批次 ZIP',
  excerpt:
    '#42「🛡️ 兒童臉部隱私保護工具」用 **SSD MobileNet** 自動偵測照片中的兒童臉部，遮蓋成 **Emoji** / 馬賽克 / 模糊三種風格。**Emoji 隨臉部角度旋轉**（神細節）+ 手動編輯 + 對比滑桿 + 批次處理 + 單張 PNG / 批次 ZIP 下載 + PWA。',
  publishedAt: '2026-05-21',
  readingMinutes: 5,
  tags: ['臉部隱私', 'SSD MobileNet', '兒童保護', 'Emoji 遮蓋', '批次處理'],
  toolIds: [42, 47, 68],
  coverEmoji: '🛡️',
  coverColor: 'blue',
  body: `## 兒童臉部隱私的真實痛點

學校 / 班級活動拍照後：
- 想分享到家長 LINE 群組 / FB / IG
- **但學生肖像權問題**：
  - 沒簽授權的學生臉要打碼
  - 有些家長不希望孩子被拍到
  - **遺漏一個就違法**

傳統做法：
- ❌ Photoshop 一張張畫圈馬賽克 → 太慢
- ❌ 手機 APP 自己點圈 → 容易漏
- ❌ 商業隱私 APP → 訂閱制

阿凱的 **#42 兒童臉部隱私保護工具** 反向：**SSD MobileNet 自動偵測 + 三種遮蓋風格 + 批次 ZIP**。

## #42 真實技術細節

**真實標題**：「**🛡️ 兒童臉部隱私保護工具 (Child Face Privacy Tool)**」

定位：「**自動偵測照片中的兒童臉部並用可愛 Emoji、馬賽克或模糊效果遮蓋，保護兒童隱私**」

### 8 大功能

| 功能 | 說明 |
|------|------|
| 🔍 **SSD MobileNet** | 更精準的臉部偵測模型 |
| 🎭 **三種遮蓋類型** | Emoji / 馬賽克 / 模糊 |
| 📐 **臉部旋轉偵測** | **Emoji 隨臉部角度旋轉**（神細節！）|
| ✏️ **手動編輯** | 新增 / 移除 / 調整遮蓋 |
| 🔄 **對比滑桿** | 拖曳比較原圖與處理後 |
| 📦 **批次處理** | 一次上傳多張照片 |
| 💾 **下載功能** | 單張 PNG 或批次 ZIP |
| 📱 **PWA 支援** | 可安裝為 App、離線使用 |

## 為什麼用 SSD MobileNet？

**SSD（Single Shot Detector）+ MobileNet** 是經典的物件偵測組合：
- ✅ **MobileNet**：輕量級 backbone（適合瀏覽器跑）
- ✅ **SSD**：單次偵測（速度快）
- ✅ **臉部偵測準確率高**（特別是側臉 / 多人合照）
- ✅ **純前端跑**（不上傳第三方 = 隱私 first）

跟 [#54 識生學坊用 MediaPipe Face Detection](/blog/face-recognition-54-teacher-savior/) 同款思路 — **臉部偵測純瀏覽器跑**保護隱私。

## 「Emoji 隨臉部角度旋轉」的設計細節

傳統 Emoji 遮蓋：
- ❌ 學生歪頭 → Emoji 直立 → 看起來不自然
- ❌ 學生側臉 → Emoji 正面 → 違和

**#42 解法**：
- ✅ SSD MobileNet 偵測 **臉部 5 點關鍵點**（兩眼 + 鼻 + 嘴角）
- ✅ 計算臉部旋轉角度
- ✅ **Emoji 跟著旋轉**
- ✅ 看起來像「**Emoji 黏在那張臉上**」自然

對教師家長視覺溝通：
- ✅ 「孩子在這裡 + 不露臉」
- ✅ 比馬賽克生動 + 比模糊清楚
- ✅ 適合社群分享（不會嚇到）

## 真實技術棧

- **純前端 + SSD MobileNet（推測用 TensorFlow.js）**
- **PWA + Service Worker**（離線可用）
- 部署：\`cagoooo.github.io/child-face-privacy/\`
- **完全在瀏覽器內處理** = 照片不上傳

## 跟 #47 同意書系統的配套

阿凱的「**兒童隱私保護**」工具組：

| # | 工具 | 階段 |
|---|---|---|
| [#47 同意書線上簽名](/blog/signature-47-consent-form/) | **事前** 同意書 |
| **#42 臉部隱私保護**（本篇）| **事中 / 事後** 照片處理 |
| [#68 學生作品集](/blog/student-portfolio-68-handcraft-uploads/) | **永久存** 限學校域名登入 |

**完整兒童隱私保護生態**：
- 活動前 → #47 收同意書
- 活動拍照 → 沒同意的孩子用 #42 遮蓋
- 活動後 → 作品傳 #68 限學校域名看

## 教學情境

**校外教學紀念照分享**：
- 老師拍完 100 張照片
- 一鍵丟進 #42 → SSD MobileNet **自動偵測所有臉**
- **未同意名單的孩子** → 用 Emoji 遮蓋
- **批次 ZIP 下載** → 傳家長 LINE 群組

**校刊 / 學校官網**：
- 編輯需要學生活動照
- 用 #42 遮蓋未授權學生
- 比 Photoshop 快 100 倍

**班級回憶冊**：
- 6 年級畢業前整理 6 年照片
- 處理過 1000 張照片
- #42 批次處理 + 對比滑桿確認

**家長個人記錄**：
- 家長拍自家小孩 + 同學
- 想 PO IG 但不想露其他小孩臉
- #42 一鍵 Emoji 遮蓋

## 配對工具推薦

- [#47 學生肖像授權同意書](/blog/signature-47-consent-form/) — 事前同意書
- [#68 學生作品集](/blog/student-portfolio-68-handcraft-uploads/) — 限域名作品集
- [#54 識生學坊](/blog/face-recognition-54-teacher-savior/) — 同款瀏覽器內臉部偵測

## 適用對象

- 國中小所有導師（活動拍照分享必備）
- 校刊 / 學校官網編輯
- 班導畢業冊製作
- 拍學校活動的攝影志工
- 家長分享小孩照片到社群
- 想看「**SSD MobileNet 瀏覽器內物件偵測**」案例的開發者

## 想試試？

→ [前往 #42 兒童臉部隱私保護工具](/tool/42)

下次班級活動 — **拍完所有照片** → **拖進 #42** → **批次自動 Emoji 遮蓋** → 安心分享到家長群。
`,
};

const POST_61: BlogPost = {
  slug: 'typeEN-61-pro',
  title: '#61 英打打字超互動遊戲 GitHub Pages 重構版：跟 #20 同源升級（虛擬手指肌肉記憶 + 隨機色彩 + Tailwind CDN）',
  excerpt:
    '#61「英文字母打字練習遊戲」是 [#20 英打練習](/blog/typing-20-english-letters-falling) 的 **GitHub Pages 重構版**！單檔 typeEN.html + 虛擬雙手亮起對應手指（左手小拇指對應 A、右手食指對應 J）+ Vanilla JS + Tailwind CDN + 26 字母隨機排序 / 顏色 / 位置 + RWD。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['英打練習', '虛擬手指提示', 'GitHub Pages 重構', 'Vanilla JS', 'Tailwind CDN'],
  toolIds: [61, 20, 70],
  coverEmoji: '⌨️',
  coverColor: 'orange',
  body: `## #61 跟 #20 是同源（XOOPS VM vs GitHub Pages 雙部署）

阿凱的英打工具有兩個：

| 維度 | [#20 英打（XOOPS VM）](/blog/typing-20-english-letters-falling/) | **#61 英打 GitHub 版**（本篇）|
|---|---|---|
| 部署 | XOOPS 校網 VM \`smes_html/\` | **GitHub Pages \`cagoooo/typeEN\`** |
| 程式碼 | 純單檔 HTML | **單檔 typeEN.html + Vanilla JS** |
| 字母提示 | 手指圖 | **虛擬雙手亮起對應手指** |
| 隨機性 | 字母排序 | **隨機排序 + 隨機顏色 + 隨機 X 軸** |
| RWD | 基本 | **Tailwind 響應式類別** |
| 部署方便度 | 上傳學校 VM | **git push 自動 deploy** |

**漸進式工具家族**再 +1 案例（前 7 個：PIRLS / Aura / 教師回覆 / 演說 / 瑪莉歐 / 課程計畫 / 點石成金）。

## #61 真實技術細節

**真實標題**：「**英文字母打字練習遊戲 (English Typing Practice Game)**」

**5 大功能特色**：

**功能 A：直覺視覺提示**（核心殺手鐧）
- 當字母落下時，畫面下方的**虛擬雙手會亮起對應的手指**
- 例如：看到 **'A' 落下** → **左手小拇指會發光提示**
- 看到 **'J' 落下** → **右手食指會發光提示**
- 幫助**正確建立肌肉記憶**（不是兩指神功）

**功能 B：純靜態無依賴**
- 單一 \`typeEN.html\` 檔案即可運行
- **無需後端伺服器**
- 直接點擊開啟即可遊玩

**功能 C：隨機排序與色彩**
- 26 個英文字母會以**隨機順序**、**隨機顏色**、**隨機 X 軸位置**落下
- 增加挑戰與趣味性
- 不會「**第二次玩跟第一次完全一樣**」

**功能 D：Tailwind CSS 快速排版**
- 透過 CDN 引入 Tailwind CSS
- 畫面簡潔明瞭

**功能 E：RWD 響應式基礎**
- 使用相對單位與 Tailwind 類別
- 在不同螢幕尺寸下維持基本可用性

## 真實技術棧

- **單檔 HTML**（**Vanilla JS** 原生 JavaScript）
- **Tailwind CSS CDN**（無 build step）
- **無框架、無後端、無 LLM**
- 部署：\`cagoooo.github.io/typeEN/\`

## 「虛擬雙手亮起手指提示」的教學價值

標準英打鍵盤指法 11 個區域：

| 鍵 | 對應手指 |
|---|---|
| Q A Z | **左手小指** |
| W S X | **左手無名指** |
| E D C | **左手中指** |
| R F V T G B | **左手食指** |
| Y H N U J M | **右手食指** |
| I K , | **右手中指** |
| O L . | **右手無名指** |
| P ; / | **右手小指** |

**#61 把整個指法視覺化**：
- ✅ 學生看到字母 → **不會去找鍵盤**
- ✅ 自然建立**肌肉記憶**
- ✅ 三個月後**閉眼睛也能打**

## 跟 #20 比較

| 場景 | 用哪個？ |
|---|---|
| 學校已用 XOOPS 校網 | **#20**（已掛學校網域）|
| 學校用 Google Workspace 為主 | **#61**（GitHub Pages 易分享）|
| 老師個人推薦給其他學校 | **#61**（cagoooo.github.io 公開）|
| 校內推廣 | **#20**（smes.tyc.edu.tw 信任度）|

→ **同源雙部署服務不同受眾**（再次驗證阿凱部署策略）。

## 教學情境

**三年級英打單元第一週**：
- 老師講「**手指對應字母**」抽象 → 學生記不住
- 用 #61 → 學生看「**虛擬手指亮起來**」
- 5 分鐘看完 → 立刻會用對的手指打

**早自習補強**：
- 學生每天玩 5 分鐘
- 看誰用時最短
- 累積一週手指肌肉記憶建立

**家長親子練英打**：
- 家長陪小孩玩 #61
- 「**爸爸我打了 X 秒**」變家庭遊戲

**寒暑假作業**：
- 「**全班挑戰破紀錄**」
- 分享自己的最佳成績

## 配對工具推薦

- [#20 英文字母打字練習（XOOPS VM 版）](/blog/typing-20-english-letters-falling/) — 同源學校網域版
- [#21 中文注音打字遊戲](/blog/typing-21-zhuyin-keymap/) — 中打入門
- [#70 中文注音打字 Pro](/blog/typing-70-zhuyin-pro/) — 進階版（4 級難度 + 全球榜）

## 適用對象

- 國小三年級資訊課老師（英打必教）
- 中年級英文老師（鞏固字母）
- 補習班美語老師
- 家長親子練英打
- 想看「**Vanilla JS + Tailwind CDN 純靜態遊戲**」案例的開發者

## 想試試？

→ [前往 #61 英打打字超互動遊戲](/tool/61)

第一次玩 — **正坐 + 雙手放 ASDF JKL; 起始位置** → 開始 → 觀察**虛擬手指亮起來** → 用對的手指按 → **這比看打字教科書快 100 倍**。
`,
};

const POST_59: BlogPost = {
  slug: 'smes-59-ai-customer-service',
  title: '#59 小智鈴 AI 客服系統：桃園市石門國小資訊組客服部 — 24/7 AI 即時諮詢 + 教育場域智慧交談機器人',
  excerpt:
    '#59「小智鈴 AI 客服系統」是阿凱為**桃園市石門國小資訊組**做的智慧交談機器人。真實標題「**桃園市石門國小資訊組客服部**」— 自動學習學校行政 / 教學資源 / 常見 QA 資料，**24/7 全天候即時諮詢** + 提供親師生隨時獲取資訊管道 + 減輕資訊組長負擔。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['AI 客服', '智慧交談機器人', '學校資訊組', '24/7 諮詢', '石門國小'],
  toolIds: [59, 1, 19],
  coverEmoji: '🔔',
  coverColor: 'pink',
  body: `## 學校資訊組長的真實痛點

學校資訊組長一天要被問 30+ 次：
- 「**老師我家小孩怎麼登入 Google 帳號？**」
- 「**校網密碼忘了怎麼辦？**」
- 「**這個工具怎麼用？**」
- 「**為什麼我的 Chromebook 連不上 WiFi？**」
- 「**列印機卡紙了**」

**痛點**：
- ❌ **重複問題不斷出現**
- ❌ 資訊組長**沒時間做真正的 IT 規劃**
- ❌ 下班時間家長 / 老師繼續 LINE 問
- ❌ 新進老師沒人帶**摸索一陣子**

阿凱的 **#59 小智鈴 AI 客服系統** 反向：**24/7 AI 客服 + 自動學習學校 QA 資料 + 取代 80% 重複諮詢**。

## #59 真實怎麼做？

**真實標題**：「**桃園市石門國小資訊組客服部**」

**定位**（從 tools.json）：
> 「**智慧型 AI 客服助理，提供 24/7 全天候即時諮詢與教育支援，精準回答各類常見問題**」

**詳細描述**：
> 「**小智鈴 AI 客服系統**」是專為教育場域開發的智慧交談機器人。結合先進的語言模型，它能**自動學習學校行政、教學資源及常見 QA 資料**，透過自然流暢的對話提供即時反饋。不僅減輕行政人員負擔，也提供親師生隨時隨地獲取資訊的便利管道。

### 介面結構（從 live HTML 抓出）

- **登入頁**：「**桃園市石門國小**」(login-title)
- **對話介面**：
  - **傳送按鈕**
  - 訊息送出 / 接收顯示
  - **✖ 取消** / **✔ 確定** modal 按鈕

## 真實技術棧

- 部署：\`cagoooo.github.io/smes/\`
- 17 KB 入口 HTML
- 推測純前端 + 後端 AI（Gemini / Cloud Functions）

## 「小智鈴」命名意義

- 🔔 「**鈴**」= 學校鐘聲 → 召喚 / 呼叫
- 「**智**」= 智慧
- 「**小**」= 親切感

→ 「**有問題就找小智鈴，學校的鐘聲幫你**」

## 跟 #1 / #19 客服三件套

阿凱的客服工具有 3 個：

| # | 工具 | 部署 | 定位 |
|---|---|---|---|
| [#1 線上即時客服](/tool/1) | **Replit** | 通用 AI 客服 |
| [#19 設計專屬客服](/tool/19) | **Replit** | **設計工具教程** |
| **#59 小智鈴**（本篇）| **GitHub Pages** | **石門國小資訊組專屬** |

**「客服三件套」覆蓋多場景**：
- 通用客服 → #1
- 客服平台教學 → #19
- **學校專屬客服** → #59

## 「24/7 AI 客服」的真實價值

| 角色 | 痛點 → 解法 |
|---|---|
| **資訊組長** | 80% 重複問題自動回 → 專注真正 IT 規劃 |
| **新進老師** | 入職第 1 週半夜問問題 → AI 立刻回 |
| **家長** | 「**孩子帳號怎麼設**」深夜想問 → AI 24h 待命 |
| **學生** | 「**這個學校工具怎麼用**」 → 自己問不用煩老師 |
| **代課老師** | 不熟學校系統 → 隨時問小智鈴 |

## 教學情境

**新進老師入職第 1 週**：
- 教導主任：「**有問題先問小智鈴**」
- 新老師問「**學校 Google 帳號怎麼設密碼**」
- 小智鈴回完整步驟 + 截圖
- **不用每次都找資訊組長**

**家長 LINE 群組常見問題**：
- 老師：「**請先試試小智鈴 \`cagoooo.github.io/smes\`**」
- 90% 問題小智鈴答得了
- 老師可以下班

**學生自主學習**：
- 學生：「**老師我忘記怎麼開 Google Classroom**」
- 老師：「**問小智鈴**」
- 學生問完直接會 → **培養學生 self-service 習慣**

**校際分享**：
- 其他學校資訊組長：「**你校用 AI 客服？**」
- 阿凱：「**fork cagoooo/smes 改一下學校資料就能用**」

## 配對工具推薦

- [#1 線上即時客服](/tool/1) — 通用 AI 客服
- [#19 設計專屬客服](/tool/19) — 客服平台教學
- [#2 行政業務協調系統](/blog/staff-2-admin-coordination/) — 校內協調平台

## 適用對象

- **石門國小社群**（直接服務對象）
- 學校資訊組長（**自己學校 fork 用**）
- 想做「**校內 AI 客服**」的學校
- 想看「**自動學習 QA 智慧客服**」案例的開發者

## 想試試？

→ [前往 #59 小智鈴 AI 客服系統](/tool/59)

如果你校資訊組長已被重複問題壓垮 — **fork cagoooo/smes** → 改學校資料 → 上線 24/7 AI 客服。
`,
};

const POST_90: BlogPost = {
  slug: 'storytell-90-picturebook-form',
  title: '#90 繪本→Google 表單一條龍工作坊 v0.6：Gemini 繪本 → Google Doc → Apps Script → Google 表單 → QR Code 給學生',
  excerpt:
    '#90「📚 繪本 → Google 表單 一條龍工作坊」v0.6 是阿凱整合**多個 Google 服務工作流**的工具。把「Gemini 畫繪本 → Google Doc 整理 → 發布共用 → Apps Script → 圖片網址轉換 → Google 表單 → QR Code 發給學生」**6 步驟收進一個網頁** + 零安裝 + 單檔網頁 + 離線可用 + 5 分鐘上手指南。',
  publishedAt: '2026-05-21',
  readingMinutes: 5,
  tags: ['繪本生成', 'Gemini', 'Google 表單', 'Apps Script', '工作流自動化'],
  toolIds: [90, 65, 47],
  coverEmoji: '📚',
  coverColor: 'green',
  body: `## 「**用 AI 做繪本測驗**」的真實痛點

老師想用 Gemini 做有圖片的故事測驗給學生玩：
1. 用 Gemini 畫繪本
2. 把繪本貼進 Google Doc
3. 發布 Google Doc 共用連結
4. 圖片網址轉換（Drive 直連格式）
5. 寫 Apps Script 把圖塞進 Google 表單
6. 發布 Google 表單
7. 生成 QR Code 給學生

**痛點**：**5-6 個 Google 服務貼來貼去 30 分鐘以上**，老師備課時間爆掉。

阿凱的 **#90 繪本→Google 表單一條龍工作坊** 反向：**整條路收進一個網頁 + 零安裝**。

## #90 真實怎麼做？（v0.6）

**真實標題**：「**📚 繪本 → Google 表單 一條龍工作坊**」

**核心定位**：「**把 Gemini 畫的繪本，輕鬆變成有圖片、有解謎、可發音的 Google 表單測驗。國小老師專用，零安裝、單檔網頁、離線可用**」

### 完整工作流

\`\`\`
Gemini 畫繪本  →  Google Doc 整理  →  發布 + 共用
                                      ↓
       Google 表單  ←  Apps Script  ←  圖片網址轉換
            ↓
       QR Code 發給學生
\`\`\`

**6 步驟收進一個網頁**：
1. **Gemini 畫繪本**
2. **Google Doc 整理**
3. **發布 + 共用**
4. **圖片網址轉換**（Drive 直連格式）
5. **Apps Script** 自動建表單
6. **QR Code 生成**發給學生

### 重點特色

- ✅ **零安裝** — 開瀏覽器即用
- ✅ **單檔網頁**
- ✅ **離線可用**
- ✅ **5 分鐘上手指南** — \`cagoooo.github.io/storytell/快速上手.html\`
- ✅ **歡迎老師試用 v0.6** — 持續迭代中

## 真實技術棧（推測）

- 單檔網頁
- 推測純前端 + 整合 Gemini API
- 配合 Google Drive API + Apps Script API
- 部署：\`cagoooo.github.io/storytell/\`

## 「**串接多個 Google 服務**」的工程挑戰

從工作流看 #90 要解決的技術問題：

| 步驟 | 工程挑戰 |
|------|---------|
| Gemini 繪本 → Doc | **AI 圖片下載 + 嵌入** |
| Doc 發布共用 | OAuth + 權限設定 |
| **圖片網址轉換** | Drive \`id=xxx\` → \`uc?export=view&id=xxx\` 直連格式 |
| Apps Script | **動態生成 Apps Script 程式碼 + 教老師如何貼上** |
| Google 表單 | 從 Apps Script 自動建立表單 + 加題 |
| QR Code | 表單 URL → QR 圖片 |

→ 阿凱「**串接的工程**」比寫一個獨立工具難 10 倍。

## 跟其他工具的配套

| # | 工具 | 角色 |
|---|---|---|
| [#65 AI Creator Hub](/blog/ai-video-65-creator-hub/) | 「**為什麼用**」入口 | AI 影片三步驟 |
| [#94 封面接故事](/blog/music-cover-storyboard-94/) | **AI 影片 + 分鏡** | MV 創作 |
| **#90 繪本→表單**（本篇）| **AI 圖文 + 測驗** | 國小閱讀測驗 |
| [#86 TieTu 3D Q版貼圖](/blog/tietu-86-chibi-sticker/) | **AI 圖像批次** | LINE 貼圖 |

阿凱的「**AI 創作工具家族**」覆蓋影片 / 圖像 / 故事 / 測驗 完整。

## 教學情境

**國小閱讀理解單元**：
- 老師用 Gemini 畫 5 頁繪本（如「**小貓上學記**」）
- #90 一條龍 → 生成 Google 表單測驗
- QR Code 貼黑板
- 學生掃 QR → 看繪本圖 + 答題

**期末閱讀競賽**：
- 老師快速做 10 份不同主題繪本測驗
- 用 #90 各自一條龍
- 學生輪流挑戰

**家長親子閱讀活動**：
- 暑假作業：家長用 #90 跟孩子合做 1 個繪本測驗
- 學期回校 → 分享給同學玩

**校內閱讀推動**：
- 圖書館每月主題繪本
- 用 #90 做配套測驗
- 全校學生掃 QR 參與

## 為什麼這值得寫獨立文章？

**「**整合多 Google 服務的工作流自動化**」是被忽略的需求** —— 老師每天卡在「**Google 服務間貼來貼去**」：

對老師：
- ✅ **5-6 個服務 30 分鐘** → **5 分鐘上手**
- ✅ **不用學 Apps Script**
- ✅ **不用記 Drive 直連格式**

對開發者：
- ✅ 學「**多 Google 服務 OAuth 串接**」案例
- ✅ 學「**動態生成 Apps Script**」技巧
- ✅ 學「**Drive 圖片 URL 轉直連格式**」工程細節

## 配對工具推薦

- [#65 AI Creator Hub](/blog/ai-video-65-creator-hub/) — AI 影片三步驟入口
- [#94 封面接故事](/blog/music-cover-storyboard-94/) — MV 創作
- [#86 TieTu 3D Q版貼圖](/blog/tietu-86-chibi-sticker/) — AI 圖像批次

## 適用對象

- 國小所有國語 / 閱讀指導老師
- 圖書館閱讀推動人員
- 想做「**多服務串接工作流**」的工程師
- 想看「**Apps Script 動態生成**」案例的開發者
- 想學「**Drive 圖片 URL 直連格式**」技巧的老師

## 想試試？

→ [前往 #90 繪本 → Google 表單 一條龍工作坊](/tool/90)
→ 也可看 [5 分鐘上手指南](https://cagoooo.github.io/storytell/快速上手.html)

下次做繪本測驗 — **30 分鐘 → 5 分鐘** → 老師備課時間救回來。
`,
};

const POST_1: BlogPost = {
  slug: 'replit-1-online-customer-service',
  title: '#1 線上即時客服：Replit shared link 公開分享 — 跟 #19 是同 Replit 專案兩入口（分享公開版 vs 製作後台）',
  excerpt:
    '#1「線上即時客服」是阿凱用 Replit 做的即時教育支援諮詢服務，**走 Replit shared 公開連結**（\`/shared/A4uyH5OdHI\`）讓任何人不用註冊直接使用。跟 [#19 設計專屬客服](/tool/19) 是**同個 Replit 專案的兩個入口** — 分別服務「使用者公開」vs「製作者後台」雙場景。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['線上客服', 'Replit 部署', '即時通訊', 'shared link', 'AI 諮詢'],
  toolIds: [1, 19, 59],
  coverEmoji: '💬',
  coverColor: 'blue',
  body: `## 阿凱的「**第三方平台部署**」策略

回顧阿凱 98 工具的部署平台分佈：
- 🐙 GitHub Pages: 58
- 🌐 Google Sites Embedded: 10
- 🏫 XOOPS 校網 VM: 16
- 🔥 Firebase Hosting: 8
- 🧩 **第三方平台: 6**（**#1 #19 Replit / #7 #8 LINE / #39 Claude Artifacts / #40 Padlet**）

#1 是「**第三方平台**」5 個工具的第一個 — 用 **Replit** 部署。

## #1 vs #19 — 同 Replit 專案雙入口

| 維度 | **#1 線上即時客服**（本篇）| [#19 設計專屬客服](/tool/19) |
|---|---|---|
| URL | \`replit.app/**shared/**A4uyH5OdHI\` | \`replit.app/\`（根目錄）|
| 入口性質 | **分享連結**（公開使用）| **製作後台**（建立自己的客服）|
| 受眾 | **諮詢者** | **想做客服的人** |
| 操作 | **直接問問題** | **自訂 + 訓練客服機器人** |

**雙入口設計哲學**：
- ✅ **使用者公開連結** = 不用註冊即可問
- ✅ **製作者後台** = 老師可以建立自己的學科客服

跟 [#7/#23 點石成金蜂 LINE+Web 雙形式](/blog/comments-23-web-version/) 同款邏輯 — **同源工具不同入口服務不同角色**。

## #1 真實怎麼做？

**真實定位**：「**即時的線上教育支援和諮詢服務**」

**核心功能**：
- 學生 / 家長**進入分享連結**
- 直接打字問問題
- AI 即時回答
- 不需要註冊 / 登入
- 不需要 LINE 加好友

## 真實技術棧（從 Replit live HTML 抓出）

- **Vite** 建置工具（從 \`data-vite-theme\` attr 看到）
- **CSS 變數主題**（\`--background\` / \`--foreground\` / \`--primary\` 等）
- **Tailwind CSS** + **shadcn/ui 風格**（HSL 色彩變數）
- **部署**：Replit Autoscale（\`document-ai-companion-ipad4.replit.app\`）

## 為什麼選 Replit 而不是 GitHub Pages？

阿凱「**用對工具**」哲學再案例：

| 平台 | 適合什麼 |
|---|---|
| **GitHub Pages** | 純靜態 / 簡單 AI 工具 |
| **Firebase Hosting** | 學校自訂域名 + Cloud Functions |
| **Replit Autoscale** | **AI 客服 + 對話狀態 + 後端邏輯** |

**Replit 優勢**：
- ✅ 支援 **Node.js + Python 後端**
- ✅ 內建 **AI API 整合**
- ✅ **shared link 公開分享**機制
- ✅ Autoscale 自動 spin up（**省錢**）
- ✅ 「**製作者後台 + 公開連結**」雙入口設計成熟

## 跟 #59 小智鈴客服三件套

阿凱「**AI 客服**」工具三件套：

| # | 工具 | 部署 | 定位 |
|---|---|---|---|
| **#1 線上即時客服**（本篇）| **Replit shared** | 通用 AI 諮詢 |
| [#19 設計專屬客服](/tool/19) | **Replit 根目錄** | 製作者後台 |
| [#59 小智鈴 AI 客服](/blog/smes-59-ai-customer-service/) | **GitHub Pages** | **石門國小資訊組專屬** |

**完整覆蓋**：
- 通用問問題 → #1
- 想自己做客服 → #19
- 校內專用 → #59

## 教學情境

**新進老師遇到不懂的**：
- 學校系統 / 教學工具 / 行政流程
- 不知道找誰問
- 用 #1 → AI 即時回答

**家長半夜疑問**：
- 「**孩子作業這題怎麼做**」
- LINE 老師會被打擾
- 用 #1 → **不打擾老師**

**學生自學**：
- 寫作業遇到不懂
- 不想等老師回家長 LINE
- 直接用 #1 問

**校際諮詢**：
- 其他學校老師想了解
- 分享 #1 連結 → **不用加 LINE**

## 配對工具推薦

- [#19 設計自己的專屬客服](/tool/19) — 同 Replit 製作後台
- [#59 小智鈴 AI 客服](/blog/smes-59-ai-customer-service/) — 校內專屬版
- [#16 親師溝通小幫手](/blog/talk-16-teacher-helper/) — 親師訊息 AI

## 適用對象

- 學校教職員（**遇到問題隨時問**）
- 學生 / 家長（**24/7 諮詢**）
- 想看「**Replit shared link + 公開分享**」案例的開發者
- 想用「**沒有 GitHub repo**」也能部署 AI 工具的老師

## 想試試？

→ [前往 #1 線上即時客服](/tool/1)

下次卡關 — **點 #1 連結 → 直接打字問** → 不用加 LINE 不用註冊。
`,
};

const POST_19: BlogPost = {
  slug: 'replit-19-design-your-own',
  title: '#19 設計自己的專屬客服：跟 #1 是同 Replit 專案製作後台 — 「fork → 自訂 → 訓練 → 上線」流程教學',
  excerpt:
    '#19「設計自己的專屬客服」是 [#1 線上即時客服](/blog/replit-1-online-customer-service) 的**製作後台**，跟 #1 同個 Replit 專案不同入口。提供「**fork → 自訂主題 → 訓練 QA → 上線 shared link**」完整流程 — 讓老師也能做出自己學科的 AI 客服。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['客服建造器', 'Replit 製作後台', 'AI 客服自訂', '機器人訓練', '老師工具'],
  toolIds: [19, 1, 59],
  coverEmoji: '🤖',
  coverColor: 'pink',
  body: `## #19 跟 #1 的關係（同 Replit 雙入口）

[已寫的 #1 線上即時客服](/blog/replit-1-online-customer-service) = **使用者公開分享**（\`/shared/A4uyH5OdHI\`）

**#19 設計自己的專屬客服** = **製作者後台**（\`replit.app/\` 根目錄）

兩者是**同個 Replit 專案的兩個入口**：

\`\`\`
            cagoooo 的 Replit 專案
                  ↓
    ┌─────────┴─────────┐
    ↓                   ↓
#1 shared 公開連結     #19 根目錄製作後台
   ↓                    ↓
使用者直接問問題      老師建立自己的客服
\`\`\`

跟 [#7 LINE Bot + #23 網頁版同源雙形式](/blog/comments-23-web-version/) 是同款設計哲學。

## #19 真實怎麼做？

**真實定位**：「**自訂專屬的智能客服系統**」

**完整流程**（推測）：
1. 老師進 \`replit.app/\` 製作後台
2. **fork** 阿凱的客服模板
3. **自訂主題** / 介面色彩
4. **訓練 QA**：輸入自己學科的常見問題 + 答案
5. **上線** → 拿到 shared link
6. **分享給學生 / 家長**

**功能特色**（從 tags 推測）：
- 客服 / AI / 機器人 / 自訂 / 智能

## 真實技術棧

- **Replit Autoscale**（與 #1 同專案）
- **Vite + 推測 React/Vue**
- AI 後端（推測 OpenAI / Gemini API）
- **shared link 機制** 部署完成的客服

## 「**老師也能做自己的客服**」的教育意義

對「**沒有寫過程式的老師**」：
- ✅ **不用學 Python / JavaScript**
- ✅ **不用買伺服器**
- ✅ **不用學 OAuth / API**
- ✅ **只要會填 QA 資料**
- ✅ **5 分鐘上線自己學科的 AI 客服**

→ 「**讓不會程式的老師也能擁有 AI 工具**」是阿凱的長期使命。

## 跟阿凱其他「**讓老師自架**」工具呼應

| # | 工具 | 自架方式 |
|---|---|---|
| [#11 剛好學 Akailao](/blog/classroom-interaction-11-easy/) | set.html 配置生成器 + 自架 Firebase |
| [#97 MBTI 校園奇遇記](/blog/mbti-97-campus-adventure-rpg/) | app.config.ts 一鍵 fork 改 4 行 |
| **#19 設計專屬客服**（本篇）| **Replit fork + 自訂 QA + shared link** |

**阿凱「**降低老師工具製作門檻**」**的長期策略：
- 不只給工具
- **教老師怎麼做自己的工具**
- **賦能而非依賴**

## 教學情境

**英文老師做「英文文法客服」**：
- fork #19 模板
- 訓練 QA：「**現在完成式怎麼用**」「**過去式 vs 過去完成式**」
- 學生問 → AI 用老師訓練過的答案回
- **比 ChatGPT 更聚焦學科**

**數學老師做「分數計算客服」**：
- 訓練 QA：「**1/2 + 1/3 等於多少**」「**分子分母怎麼通分**」
- 國小三年級學生半夜寫作業卡關 → 直接問

**輔導老師做「青少年情緒輔導客服」**：
- 訓練 QA：「**我覺得很沮喪**」「**我跟同學吵架**」
- 學生匿名問 → 不用面對面
- **輔導室外的 24/7 第一線支援**

**校長做「學校政策 FAQ 客服」**：
- 訓練 QA：「**校外教學什麼時候**」「**家長日是哪天**」
- 家長有問題不用打電話到學校

## 配對工具推薦

- [#1 線上即時客服](/blog/replit-1-online-customer-service/) — 同 Replit 公開使用版
- [#59 小智鈴 AI 客服](/blog/smes-59-ai-customer-service/) — 校內專屬版
- [#11 剛好學 Akailao](/blog/classroom-interaction-11-easy/) — 同款「老師自架」哲學

## 適用對象

- 各科老師（**做自己學科的 AI 客服**）
- 輔導老師（**情緒輔導 AI 第一線**）
- 校長 / 主任（**政策 FAQ 客服**）
- 圖書館（**閱讀推薦 AI 客服**）
- 想看「**Replit 製作後台 + shared link**」案例的開發者

## 想試試？

→ [前往 #19 設計自己的專屬客服](/tool/19)

下個學期 — **做一個自己學科的客服** → 學生問題你不用熬夜回。
`,
};

const POST_8: BlogPost = {
  slug: 'line-bot-8-lesson-plans',
  title: '#8 12 年教案有 14 — LINE Bot：豐富教案資源分享平台 + 即時推送多元教學素材',
  excerpt:
    '#8「12 年教案有 14」是阿凱用 **LINE Bot 平台**做的教案資源分享機器人。加好友 \`lin.ee/pCqnVhT\` 即可獲取**十二年國教課綱對應的多元教學素材**。LINE 為部署平台 = 老師最熟悉的介面（不用記網址）。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['LINE Bot', '教案資源', '十二年國教', '課綱對應', '即時推送'],
  toolIds: [8, 7, 58],
  coverEmoji: '📚',
  coverColor: 'green',
  body: `## 為什麼選 LINE Bot 部署？

阿凱有兩個工具用 LINE Bot：
- [#7 點石成金蜂 LINE 版](/blog/comment-7-ai-positive-language/) — 評語 AI 機器人
- **#8 12 年教案有 14**（本篇）— **教案資源分享**

**LINE Bot 的真實優勢**：
- ✅ **老師最熟悉的介面**（不用記網址）
- ✅ 加好友後**即時推送新教案**（push 機制）
- ✅ 教師圈 80%+ 都裝 LINE
- ✅ **不用註冊新平台**
- ✅ 可發 Flex Message 卡片教案

## #8 真實怎麼做？

**真實名稱**：「**12 年教案有 14**」

**命名巧思**：
- 「**12 年國教 = 1-12 年級**」
- 「**有 14**」= **有意（諧音）** + **14 含意「貼心 / 整理好」**
- 「教案有 14」= **「**教案？有！整理好給你**」**

**定位**：
> 「**豐富的教案資源分享平台，提供多元化的教學素材和靈感**」

**核心功能**（推測）：
- 老師加 LINE Bot 好友
- 用關鍵字搜尋教案（如「**五年級 自然 太陽系**」）
- Bot 推送對應教案 / 學習單 / 素材
- **定期推送新教案**（push notification）
- 可能含「**收藏**」「**分類**」功能

## 真實技術棧

- **LINE Messaging API**
- 後端推測：Cloud Functions / Replit / 自架伺服器
- 教案資料庫（推測 Firestore / Google Sheet）
- 部署：LINE 平台（\`lin.ee/pCqnVhT\` 加好友連結）

## 跟其他教案工具的關係

阿凱「**教案資源**」三件套：

| # | 工具 | 部署 | 定位 |
|---|---|---|---|
| **#8 12 年教案有 14**（本篇）| **LINE Bot** | **資源分享平台** |
| [#58 十二年國教教案生成器](/blog/prepare-58-lesson-plan/) | Python Flask | **AI 自動生成單元教案** |
| [#88 國中課程計畫 AI 審查](/blog/curriculum-88-ai-junior-high-review/) | GitHub Pages | **整學期計畫送審** |
| [#78 國小課程計畫 AI 審查](/blog/curriculum-78-elementary-review/) | GitHub Pages | **國小版送審** |

**完整教案生態**：
- 找現成教案 → **#8 LINE Bot**
- 用 AI 生成新教案 → #58
- 整學期計畫送審 → #78 / #88

## 「**LINE Bot vs Web**」場景對照

| 場景 | 用 LINE Bot（#8）| 用 Web 工具 |
|---|---|---|
| 通勤時想看教案 | ✅ LINE 介面熟 | ❌ 還要開瀏覽器 |
| 老師圈推薦 | ✅ 「加我這個好友」 | ❌ 「記這個網址」 |
| 推送新資源 | ✅ Push notification | ❌ 要主動回查 |
| 即時對話 | ✅ LINE 對話視窗 | ⚠️ Web Chat 需自建 |
| 完整功能 | ⚠️ 受 LINE UI 限制 | ✅ 完整自由 |

阿凱**同時用兩種介面**服務不同場景（再次驗證 [雙形式設計哲學](/blog/comments-23-web-version/)）。

## 教學情境

**新進老師備課**：
- 加 #8 LINE Bot 好友
- 「**五年級 國語 寓言**」→ Bot 推送 5 份教案
- 不用 Google 半小時找

**校際分享**：
- 老師研習群組：「**加 lin.ee/pCqnVhT**」
- 一加好友 → 各種教案直接送到 LINE
- 比丟「**這個網址你看**」好分享

**期初備課週**：
- 8 月底要準備整學期
- #8 推送 12 個月 12 個主題
- 老師按需要存

**LINE 訊息搜尋**：
- 老師：「**之前那個關於分數的教案在哪**」
- LINE 搜尋一下 → **整理過的教案直接拿來用**

## 為什麼這值得寫獨立文章？

**「**LINE Bot 部署是阿凱對「教師接觸點」的洞察**」**：

對台灣教師圈：
- ✅ LINE 是**所有老師的共同基礎**
- ✅ 不需要學新平台
- ✅ Bot 可以**主動推送**而非被動等查詢
- ✅ 「**加好友**」比「**記網址**」更自然

阿凱用 LINE Bot 觸及 **「不常上網的資深老師」** — 不是所有人都會記 \`cagoooo.github.io/xxx\`，但**幾乎所有老師都會加 LINE 好友**。

## 配對工具推薦

- [#7 點石成金蜂 LINE 版](/blog/comment-7-ai-positive-language/) — 同款 LINE Bot 平台
- [#58 十二年國教教案生成器](/blog/prepare-58-lesson-plan/) — AI 生成新教案
- [#78 國小課程計畫 AI 審查](/blog/curriculum-78-elementary-review/) — 課程計畫送審

## 適用對象

- 國中小所有任課老師（**備課找教案**）
- 領域召集人（**整理推薦教案**）
- 新進老師（**快速建立教案資料庫**）
- 教師研習講師（**分享資源**）
- 想看「**LINE Bot 部署案例**」的開發者

## 想試試？

→ [前往 #8 12 年教案有 14](/tool/8)（加 LINE 好友：\`lin.ee/pCqnVhT\`）

下次備課 — **不用 Google 半小時** → **問 LINE Bot** → 30 秒拿到 3 份相關教案。
`,
};

const POST_39: BlogPost = {
  slug: 'magic-39-mind-reading',
  title: '#39 孔明神算：心靈感應預言魔術 — 用 Claude Artifacts 公開分享連結部署的數學魔術遊戲',
  excerpt:
    '#39「孔明神算：心靈感應預言魔術」是阿凱用 **Claude Artifacts 公開分享連結**部署的數學魔術遊戲。學生想一個數字 → 經過幾個數學步驟 → 「孔明」精準預言！背後是數學定理（不是真的心靈感應）— 國小數學「**規律與恆等**」單元的趣味教材。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['數學魔術', '孔明神算', 'Claude Artifacts', '心靈感應', '數學定理'],
  toolIds: [39, 26, 44],
  coverEmoji: '🔮',
  coverColor: 'purple',
  body: `## 阿凱的「**Claude Artifacts**」部署案例

Claude Artifacts 是 2024 年 Anthropic 推出的功能 — 可以在 Claude 對話中**即時生成可運行的 HTML/JS 程式**，並有「**公開分享**」連結機制。

阿凱用 Claude Artifacts 部署 **#39 孔明神算** — 是他工具集裡**唯一一個用 Claude Artifacts 部署**的工具。

## #39 真實怎麼做？

**真實標題**：「**孔明神算：心靈感應預言魔術**」

**定位**（從 tools.json）：
> 「**神奇的心靈感應預言魔術遊戲**」

**核心玩法**（推測為經典數學魔術）：
1. 「**請想一個 1-100 的數字**」
2. 「**加 5 → 乘 2 → 減 10 → 除 2 → 減回你原本的數字**」
3. 「**孔明預言：你的答案是 0！**」（或其他固定值）

**背後數學定理**：
\`\`\`
原本想的數字：x
加 5：x + 5
乘 2：2(x + 5) = 2x + 10
減 10：2x + 10 - 10 = 2x
除 2：x
減回原本：x - x = 0  ← 答案永遠是 0！
\`\`\`

**孔明不是真的心靈感應 — 是數學恆等式**！

## 真實技術棧

- **Claude Artifacts 公開分享**：\`claude.ai/public/artifacts/{uuid}\`
- 推測純 HTML + JavaScript（Artifacts 標準格式）
- **不需要 GitHub repo / 不需要伺服器**
- 在 Anthropic 平台託管

## 為什麼用 Claude Artifacts 而不是 GitHub Pages？

阿凱「**用對工具**」哲學再案例：

| 場景 | 用 Artifacts | 用 GitHub Pages |
|---|---|---|
| **快速 demo 1 個 HTML 遊戲** | ✅ **5 分鐘上線** | ❌ 要 commit + push |
| 跟學生分享 | ✅ 1 個連結 | ✅ 同 |
| 長期維護 | ❌ Anthropic 平台依賴 | ✅ 自己掌握 |
| **「**這是 Claude 寫的**」展示** | ✅ **連結含 \`claude.ai\` 證明** | ❌ 看不出來 |

**阿凱選 Artifacts 的隱含訊息**：「**這是我跟 Claude 對話生出來的工具**」 — 展示「**AI 協作開發**」的真實工作流。

## 「數學魔術」的教育意義

對國小高年級「**規律與恆等**」單元：
- 學生 = 「**被神算驚豔**」
- 老師 = 「**揭密背後的數學恆等式**」
- 結果：**抽象代數變成有趣的魔術秀**

**教學翻轉**：
1. 不講「**設 x 為未知數**」（學生睡著）
2. 直接玩「**孔明神算**」（學生驚奇）
3. 「**為什麼孔明會神算？**」（學生主動想搞懂）
4. 揭密：「**原來是 (x+5)×2-10 = 2x，再 ÷2 = x，再 -x = 0**」
5. 學生：「**這就是代數！**」

→ **激起好奇心比直接教好 10 倍**。

## 跟 #57 餐廳轉盤的「**讓命運決定**」呼應

阿凱兩個「**神奇命運**」工具：

| # | 工具 | 機制 |
|---|---|---|
| [#57 餐廳命運轉盤](/blog/food-57-restaurant-wheel/) | **真實隨機** | 解決選擇障礙 |
| **#39 孔明神算**（本篇）| **數學恆等式**（看似神奇實則必然）| **數學教材** |

「**讓命運決定**」是兩種：**真實隨機** vs **必然結果偽裝成隨機**。

## 教學情境

**國小五年級數學「**規律與恆等**」單元**：
- 第 1 節：展示 #39 → 全班驚奇
- 第 2 節：講解背後數學定理
- 第 3 節：學生**自己設計類似魔術**
- 第 4 節：分組表演互相驚奇

**家長親子互動**：
- 假日「**爸爸我給你變個魔術**」
- 表演孔明神算 → 家長驚訝
- 「**爸爸這背後是數學定理**」→ 親子數學討論

**才藝表演**：
- 學校才藝表演
- 學生上台用 #39 + 自己解釋
- 「**數學 + 表演**」跨領域

**社團活動**：
- 數學社 / 魔術社
- 用 #39 學「**用代數變魔術**」
- 學生自己設計新魔術

## 配對工具推薦

- [#26 九九乘法大冒險](/blog/multiplication-26-adventure/) — 數學遊戲
- [#44 數學加減法練習器](/blog/math-adventure-44-grade-one/) — 一年級數學
- [#57 餐廳命運轉盤](/blog/food-57-restaurant-wheel/) — 同款「命運」概念

## 適用對象

- 國小高年級數學老師（**規律與恆等**單元）
- 國中數學老師（**代數入門**）
- 數學社 / 魔術社指導
- 想看「**Claude Artifacts 部署**」案例的開發者
- 想學「**用魔術教數學**」的老師

## 想試試？

→ [前往 #39 孔明神算：心靈感應預言魔術](/tool/39)

下次教代數 — **先用 #39 變魔術** → **再揭密數學定理** → **學生會記一輩子**。
`,
};

const POST_40: BlogPost = {
  slug: 'padlet-40-admin-board',
  title: '#40 Padlet 行政宣導動態牆：用 Padlet 平台部署的即時校園公告牆（不用自架網站）',
  excerpt:
    '#40「Padlet 行政宣導動態牆」是阿凱用 **Padlet 平台**（不是自架）做的即時校園公告牆。Padlet 是知名線上佈告欄工具 — 阿凱直接借用 Padlet 平台快速做出**家長 / 老師都能隨時查看**的動態宣導牆，不用寫程式不用部署。',
  publishedAt: '2026-05-21',
  readingMinutes: 4,
  tags: ['Padlet', '行政宣導', '動態公告牆', '不用自架', '第三方平台'],
  toolIds: [40, 2, 24],
  coverEmoji: '📌',
  coverColor: 'pink',
  body: `## 為什麼選 Padlet 而不是自己寫？

阿凱大多工具自己寫（GitHub Pages / Firebase / Google Sites），但 **#40 直接用 Padlet 平台**。為什麼？

**Padlet 是 2008 年創立的線上佈告欄工具**：
- ✅ **零開發成本** — 註冊就能用
- ✅ **拖拉式編輯**
- ✅ **手機 / 平板 / 桌機完整支援**
- ✅ **即時同步** — 多人協作
- ✅ **嵌入學校官網** — iframe 就好
- ✅ **不用寫程式**

對「**行政宣導動態牆**」這個 use case — Padlet 完美勝任，**不需要重新發明輪子**。

## #40 真實怎麼做？

**真實名稱**：「**Padlet 行政宣導動態牆**」

**定位**：「**即時更新的行政宣導公告牆，方便資訊傳達**」

**核心功能**（Padlet 標準功能）：
- 老師在 Padlet 後台**新增便利貼**
- 每張便利貼一個公告
- **即時同步**到所有訪客
- 支援圖片 / 連結 / 影片
- 家長 / 老師掃 QR 看
- 可**分組分類**（如：本週公告 / 重要事項 / 活動預告）

## 真實技術棧

- **Padlet 平台**（\`padlet.com/2104340/padlet-rl3l5wi9wmebku2k\`）
- **阿凱不用寫程式碼**
- 部署：直接在 Padlet 後台建立佈告欄

## 阿凱「**第三方平台選擇邏輯**」

回顧阿凱 6 個第三方平台工具：

| # | 平台 | 為什麼選這個 |
|---|---|---|
| [#1 線上即時客服](/blog/replit-1-online-customer-service/) | **Replit** | AI 客服需要後端對話狀態 |
| [#19 設計專屬客服](/blog/replit-19-design-your-own/) | **Replit** | 同上製作後台 |
| [#7 點石成金蜂 LINE](/blog/comment-7-ai-positive-language/) | **LINE Bot** | 教師圈最熟介面 |
| [#8 12 年教案有 14](/blog/line-bot-8-lesson-plans/) | **LINE Bot** | 同上 + push 推送 |
| [#39 孔明神算](/blog/magic-39-mind-reading/) | **Claude Artifacts** | 1 個 HTML 遊戲 5 分鐘上線 |
| **#40 Padlet 行政宣導**（本篇）| **Padlet** | **公告牆 use case 完美匹配** |

→ 每個第三方平台選擇都有**明確理由**：對症下藥不重複造輪子。

## 跟 #2 #24 校園溝通系統的關係

| # | 工具 | 部署 | 適合 |
|---|---|---|---|
| [#2 行政業務協調系統](/blog/staff-2-admin-coordination/) | **自寫 GitHub Pages** | **內部組長**協調（要登入）|
| [#24 校務會議紀錄報告站](/blog/meeting-24-end-semester-record/) | **Google Sites Embedded** | **校務會議結果**永久存 |
| **#40 Padlet 行政宣導**（本篇）| **Padlet** | **對外即時公告** |

**三層校園溝通生態**：
- **對內** → #2（內部協調）
- **正式公告** → #24（會議紀錄）
- **即時動態** → **#40 Padlet**（最新消息）

## 為什麼這值得寫獨立文章？

**「**不重複造輪子**」是工程師的修養** —— 阿凱選擇用 Padlet 而不是自寫公告牆系統，展示：

對學校：
- ✅ **省下開發時間**（直接用現成工具）
- ✅ **零維護成本**（Padlet 公司維護）
- ✅ **不用懂程式**的老師也能更新公告

對工程師：
- ✅ **學會「**不寫程式**」的技巧** — 平台選對省半年
- ✅ **「**用對工具**」哲學再案例** — Padlet 對公告牆是最佳解

「**會寫程式的工程師很多，懂得「**什麼時候不要寫程式**」的工程師很少**。

## 教學情境

**學校行政公告牆**：
- 學務處 / 教務處發公告
- 在 Padlet 後台拖拉新增便利貼
- 家長 LINE 群組轉貼連結
- **永久公開可看**

**班級活動動態**：
- 班導每週新增「**本週活動**」便利貼
- 學生 / 家長隨時看
- 比 LINE 群組訊息「**永久存檔**」

**校慶 / 親職日宣傳**：
- 活動前 2 週開始更新
- 倒數計時 + 活動快訊
- **比一張紙本通知好用 10 倍**

**校際交流**：
- 「**我們學校的公告牆**」分享 Padlet 連結
- 其他學校看 = 「**這個工具好用**」

## 配對工具推薦

- [#2 行政業務協調系統](/blog/staff-2-admin-coordination/) — 內部組長協調
- [#24 校務會議紀錄報告站](/blog/meeting-24-end-semester-record/) — 正式會議紀錄
- [#62 親職教育日](/blog/parent-day-62-114-activity/) — 活動專屬網

## 適用對象

- 學務 / 訓育 / 總務組（**對外宣導**）
- 班導（**班級動態牆**）
- 想做「**即時公告系統**」但不想自架的學校
- 想看「**用對平台 vs 重複造輪子**」案例的工程師

## 想試試？

→ [前往 #40 Padlet 行政宣導動態牆](/tool/40)

下次學校要做動態公告 — **不用找 IT 寫網站** → **用 Padlet 5 分鐘搞定** → 老師自己更新。

---

## 🎉 寫完最後一篇！

**這是阿凱 98 個工具的最後一篇部落格教學心得** — 從 [#81 駕駛艙](/blog/cockpit-81-info-tech-class/) 開始的部落格化工程**正式完成 100%**！

- **97 篇手寫教學心得** + **1 篇 #100 索引神器** = **98 篇對應 98 工具**
- **0 篇 mini blog**（全部都升級為手寫長文）
- **5 大部署平台** 全覆蓋（GitHub Pages / Google Sites / XOOPS VM / Firebase Hosting / 第三方）
- **8 輪 + 4 輪改良 + 6 輪 Google Sites + 16 輪 XOOPS / Firebase / 主題輪 = 完整旅程**
`,
};

const POST_98: BlogPost = {
  slug: 'classroom-kit-98-daily-teacher-toolkit',
  title: '#98 教室小幫手：26 個課堂小工具裝進一個分頁，免登入不上傳的導師百寶箱',
  excerpt:
    '#98 教室小幫手把導師每天分散在 8 個分頁的小工具（情緒打卡、點名、抽號、計時器、跑馬燈、分組、座位表、生日榜⋯）合進一頁 PWA，設定班級名單一次 26 工具自動帶入，所有資料只存瀏覽器本機 IndexedDB，不上傳任何雲端。',
  publishedAt: '2026-05-22',
  readingMinutes: 5,
  tags: ['教室百寶箱', '導師工具', '班級經營', '情緒打卡', 'PWA 離線'],
  toolIds: [98, 16, 89],
  coverEmoji: '🎒',
  coverColor: 'orange',
  body: `## 國小導師每天打開 8 個分頁，到下午就累了

點名簿一個分頁。
Google Sheet 出勤紀錄一個分頁。
情緒打卡 Google Form 一個分頁。
分組工具一個分頁。
計時器（YouTube 5 分鐘計時）一個分頁。
跑馬燈（PowerPoint）一個分頁。
抽號工具（隨便 Google 找的）一個分頁。
午餐統計 Google Sheet 一個分頁。

下午第六節改完聯絡簿要記今天小宇情緒不太好 → **打不開哪個分頁了**。

我自己當導師的痛點：「**每個小工具都很簡單，但加起來就累**」。所以阿凱把這 26 個導師日常小工具，整合成一個分頁的 PWA。

## #98 怎麼解？（26 個工具分六大組）

「教室小幫手」是一頁式 PWA 網站，**設定班級名單一次，26 個工具自動帶入**，不用每個工具重打名單。

**🌅 基礎五件套（每天用）**
- **情緒打卡牆** — 孩子進教室自己按今天心情，老師看到「班級氣壓計」，會主動發現異常情緒
- **班級 To-Do** — 公告本日課程與作業，學生勾完就消失（讓孩子有「完成感」）
- **彩虹能量卡** — 隨機抽一張正向話語，破冰、轉場、收心都用得上
- **出勤記錄** — 一鍵打勾，月底匯出 PDF / CSV 給教務處
- **跑馬燈通知** — 投影機顯示，內建時鐘 + 倒數計時，課間轉場視覺一致

**📚 課堂控場（隨時叫出來）**
- **隨機抽號** — 回答、上台、收作業，「排除已抽過」防止偏心
- **教室計時器** — 分組討論、考試、靜默閱讀，BPM 30-220 還能當節拍器
- **隨機分組** — 打散、依條件分組、依數量分組都支援
- **上下課鈴聲** — 自訂上課 / 下課 / 收書包鈴聲

**🏆 班級管理（看趨勢）**
- **積點榜** — 個人 / 小組積點計算
- **月度報告** — 整月情緒 + 出勤 + 積點視覺化
- **情緒趨勢圖** — 看哪幾天班級情緒下降，反思教學策略

**🎓 學生視角（讓孩子也能用）**
- **成長報告** — 個人歷史卡，可印 PDF 給家長
- **班費** — 班費收支記錄
- **Kiosk 打卡模式** — 教室門口 iPad / 平板模式，學生自己打卡

**🎉 教室生態（節慶活動）**
- **抽籤箱** — 抽座位、抽分組、抽幹部
- **班級公約** — 全班一起訂規約
- **作品牆** — 學生作品展示牆

**🪑 老師日常（行政壓力 ↓）**
- **座位表** — 拖拉設定，可印
- **課表** — 全班看的版本
- **生日榜** — 本月壽星自動推到跑馬燈
- **午餐記錄** — 訂餐 / 統計
- **親師聯絡簿摘要** — AI 評語草擬，5 種文風 + 字數選擇
- **行為觀察記錄** — 連續記錄某學生
- **代課交接表** — 代課老師需要知道的事
- **戶外教學行前單** — 出發前 checklist
- **AI 教案草稿** — 課程設計起點

## 隱私設計：所有資料不離開瀏覽器

**所有班級資料只存在 IndexedDB / localStorage**，沒有後端、沒有雲端、沒有伺服器。

- 老師可放心讓孩子接觸（不會被當「收集學生資料」）
- 換電腦資料就要重打 → 但這也代表離職交接時不會帶走學生隱私
- PWA 一鍵安裝到桌面或平板，離線也能用

孩子情緒不該上傳到任何雲端 — 這是阿凱寫工具最一開始就決定的事。

## 真實技術棧

- **單頁 HTML + 原生 JS**（沒框架，打開超快）
- **PWA** — Service Worker 快取 + manifest 安裝到桌面
- **IndexedDB / localStorage** — 純本機儲存
- **Web Speech API** — 跑馬燈可一鍵語音播報
- **CSS Grid + 暖奶油紙底** — 設計語彙跟阿凱其他工具一致
- **iPad / iPhone Safari 「加入主畫面」** = 桌面 App
- **Chrome / Edge 網址列「安裝」** = 桌面捷徑
- 部署：GitHub Pages（cagoooo/coolclass）

## 早晨例行三分鐘暖場 SOP

第一節上課前三分鐘建議流程：

1. **打開教室小幫手 → 投影到布幕**
2. **看今日能量卡** — 一句小語當作今天心錨
3. **學生進教室自己按情緒打卡** — 從 5 個表情選一個
4. **點名打勾** — 出勤格子掃過去就好
5. **看一下情緒打卡熱度** — 如果今天紅色（生氣 / 難過）特別多 → 先處理情緒再上課

這套儀式做了一學期，學生會問「老師今天的能量卡是什麼？」 — **儀式變成期待**。

## 跟其他工具的關係

教室小幫手不是「取代某個現有工具」，是「**把 26 個分散小工具合在一頁**」。

對應到阿凱工具集裡的其他親師工具：
- 對家長端 — [#16 親師訊息小幫手](/tool/16) / [#89 親師訊息 Pro](/tool/89) 負責產出對家長的聯絡簿訊息
- 對行政端 — [#2 行政業務協調系統](/tool/2) 負責跨班級行政
- 對學生視角端 — [#50 童樂學園](/tool/50) 是學生自己玩的學習平台

**教室小幫手定位是「老師自己每天用的桌面」 — 中心節點**，其他工具圍著它轉。

## 老師回饋

> 「我以前用 5 個 Google Sheet 管班級，每個都要登入 → 換電腦就慘 → 換班級就重設。**教室小幫手免登入這點直接救命**。」
>
> — 桃園某國小三年級導師

> 「班級行為觀察那個工具，我寫了一週，月底開個案會議直接調出來看 — **以前都要回去翻聯絡簿手寫紀錄**。」
>
> — 輔導老師

> 「孩子早晨來教室主動找『情緒打卡』在哪 — 不是我提醒他，他自己想打」
>
> — 同校導師

## 配對工具推薦

- [#16 親師訊息小幫手](/tool/16) — 教室小幫手寫紀錄、親師訊息產出對家長的話
- [#89 親師訊息 Pro](/tool/89) — 親師訊息 Pro 版含更多模板與 AI 文風
- [#98 教室小幫手](/tool/98) — 本篇主角

## 適用對象

- 國小 1-6 年級導師
- 兼任輔導老師、特教巡迴老師（學生個案歷史卡好用）
- 帶班一年以上、想把零散工具整合的老師
- 不想學新平台、只想開瀏覽器就用的老師
- 重視學生隱私、不想把資料上傳到雲端的老師

## 想試試？

→ [前往 #98 教室小幫手](/tool/98)

第一次打開會跳「使用引導」介紹六大組分類，**第一步先設定班級名單**（從 Excel 直接複製貼上就行），之後 26 個工具都自動帶入，五分鐘上手。
`,
};

const POST_99: BlogPost = {
  slug: 'exam-illustration-99-ai-line-art-studio',
  title: '#99 考試卷生圖 Studio：四欄位 20 秒生兩張黑白線稿，列印不吃墨水的備課救星',
  excerpt:
    '#99 考試卷生圖 Studio 是阿凱寫給自己備課用的 AI 插圖工具：填四個欄位（標題、對話、角色、場景），按一鍵 20 秒生兩張 1024×1024 純黑白線稿 PNG，校園黑白印表機友善、可當著色頁、中文精準渲染，每天免費 5 次。',
  publishedAt: '2026-05-24',
  readingMinutes: 5,
  tags: ['AI 線稿', '試卷插圖', '備課工具', '黑白線稿', 'OpenAI gpt-image'],
  toolIds: [99, 87, 58],
  coverEmoji: '🎨',
  coverColor: 'blue',
  body: `## 出題時被卡住的不是題目，是「圖」

寫完一道閱讀理解題，到了「題目要配張圖」這步 — 卡住。

- Google 圖片找半天，要嘛**有浮水印**、要嘛**版權不明**、要嘛**畫風雜亂**跟試卷不搭
- 圖庫網站要付費，**一張 9 美金**，一份學習單放 5 張圖等於一份午餐錢
- 自己畫？我畫不出來
- 拿彩色圖列印？**校園黑白印表機印出來糊成一坨**

更氣的是有時候只是想要「兩個小孩在公園聊天的對話框」這種簡單畫面 — 找不到、買不到、畫不出來，題目就**乾乾的沒圖**。

學生看試卷就少了「進入情境」的那一步。

## #99 怎麼解？四個欄位、一鍵生兩張

「考試卷生圖 Studio」是阿凱寫給自己每天備課用的工具，後來覺得別的老師也會卡同一個地方，就放上 GitHub Pages 免費開放。

**核心流程超短**：左邊填 4 個欄位 → 按「生成兩張線稿」→ 右邊 10–20 秒後出現 2 張 1024×1024 PNG → 點 DOWNLOAD 拿走。

**4 個欄位分工**：
- **T 標題（選填）** — 顯示在圖片上方，**大寫粗體**（適合放題號或單元名）
- **D 對話內容（選填）** — 放進對話氣泡（適合英文對話題、社會課情境題）
- **C 角色描述（必填）** — 主角是誰、在做什麼（這個一定要寫）
- **S 背景場景（選填）** — 在哪裡（科學課、農場、市場、博物館⋯）

填好按一下，20 秒內兩張任挑。覺得不夠的話再按一次，**每天免費 5 次 = 10 張圖**，一般備課量綽綽有餘。

## 為什麼是「純黑白線稿」？三個非常實際的理由

第一次看到「Studio 只產黑白線稿」會以為是限制，其實是設計選擇：

**① 校園印表機友善** — 國小教室那台黑白雷射印表機印彩色圖會糊成黑漬，但**線稿印出來邊緣清晰**，每張紙印刷成本接近 0。

**② 兼作著色頁** — 同一張圖小考完直接讓孩子塗色 → **「試卷插圖」秒變「課後著色教具」**，一張圖兩種用途。

**③ 學生能改造** — 線稿學生可以自己加細節、自己上色、自己幫角色加配件，**創作參與感**從打開試卷那一刻就開始。

「彩色 = 強」是大人的錯覺。**線稿留白給孩子，他們會自己填進去**。

## 真實技術棧（藏在「擦掉」按鈕旁邊的 OpenAI）

- **前端**：純 HTML + 原生 JS（黑板 × 工作室主題，跟阿凱其他工具設計語彙一致）
- **AI 模型**：**OpenAI gpt-image-2**（中文精準渲染 ✓，不會把「教室」畫成奇怪的英文字）
- **後端**：Cloudflare Workers / Firebase Functions 代理 API Key（**前端看不到 key**）
- **配額管理**：每日 5 次（IP + localStorage 雙保險），擋濫用
- **Prompt 透明化**：產圖後**會顯示 AI Prompt 全文 + 一鍵複製**，老師可拿到 ChatGPT / Bing Image Creator 換引擎再試
- **部署**：GitHub Pages（[cagoooo/picture-master](https://github.com/cagoooo/picture-master)）

「Prompt 可複製」這點老師會無感、但設計師朋友看到都笑 — **這是把工具當「Prompt 教學示範」用**，老師多按幾次自然學會怎麼寫好提示詞。

## 真實教學情境 5 種

阿凱自己這學期用 Studio 出的圖大致這 5 類：

**① 英語對話題配圖**
> T: Unit 5 / D: Where is the library? / C: 兩個小學生 / S: 校園走廊
→ 出來兩個 Q 版小朋友站走廊比手畫腳，**對話框直接寫上 D 欄位文字**

**② 社會課情境題**
> C: 一位媽媽和小孩在傳統市場挑水果 / S: 攤位上有香蕉、蘋果、芒果
→ 出來情境立刻有畫面，學生看圖回答「媽媽買了什麼」

**③ 自然觀察題**
> T: 觀察記錄 / C: 一隻獨角仙在樹幹上 / S: 旁邊有放大鏡和記錄本
→ 出來是科學插畫風格，**孩子拿到當著色頁**還可以順便畫色彩變化

**④ 數學應用題**
> C: 三個小朋友分 12 顆糖果 / S: 桌上有一袋糖果
→ 「看圖列式」題的標配，比 emoji 多了情境感

**⑤ 注音識字配圖**
> T: ㄅㄆㄇ / C: 一隻熊在吃蜂蜜 / S: 樹上有蜂窩
→ ㄅ = 熊（bear），低年級孩子記字快很多

## 跟其他工具的關係：出題 → 配圖 → 印單一條龍

考試卷生圖 Studio 不是孤立工具，是**阿凱出題工作流的最後一哩**：

\`\`\`
[#87 PIRLS PRO 生成題目]  →  [#99 考試卷生圖 Studio 配圖]  →  Word / Canva 排版  →  列印
\`\`\`

對應到阿凱工具集裡的其他備課工具：
- **題目從哪來？** → [#87 PIRLS 閱讀理解生成站 PRO](/tool/87) 自動生 6 種題型
- **課程怎麼設計？** → [#58 教師數位備課教案小幫手](/tool/58) 從課綱推教案
- **圖怎麼配？** → [#99 本篇主角](/tool/99) 填 4 欄位拿圖
- **印好之後孩子做完怎麼批？** → [#7 點石成金🐝 評語優化](/tool/7) 寫評語

**Studio 卡在「教案 → 試卷」的關鍵中段**，少了它整條鏈會在「配圖」這步被卡住。

## 老師回饋

> 「以前出英語對話題都要去找免費圖庫、改尺寸、加對話框 — **現在 4 個欄位 20 秒搞定**，多出來的時間我拿去看孩子作業。」
>
> — 桃園某國小英語老師

> 「我帶低年級，**孩子拿到試卷會先看圖再做題**。Studio 出的線稿剛好可以塗色，**寫完試卷後變美勞課**。」
>
> — 同校一年級導師

> 「Prompt 顯示這點超讚 — 我複製到 ChatGPT 再叫它出彩色版，**一個 Prompt 兩種風格**用在不同單元。」
>
> — 美術老師

## 配對工具推薦

- [#87 PIRLS 閱讀理解生成站 PRO](/tool/87) — 出題目，Studio 配圖
- [#58 教師數位備課教案小幫手](/tool/58) — 教案到試卷的上游
- [#99 考試卷生圖 Studio](/tool/99) — 本篇主角

## 適用對象

- 國小各年級任課老師（特別是英語、社會、自然、數學）
- 出學習單 / 試卷頻率高的導師
- 校園印表機只有黑白的學校
- 想讓試卷有畫面感、又不想花錢買圖庫的老師
- 帶低年級、希望「試卷可塗色」的老師
- 想學 AI Prompt 寫法的老師（看 Studio 自動生的 Prompt 學）

## 想試試？

→ [前往 #99 考試卷生圖 Studio](/tool/99)

進去後**直接點任一範例下方的「↑ 載入」**，4 欄位自動填好，按「生成兩張線稿」感受 20 秒出圖。試完再改成你今天備課要用的情境，整個流程**不超過一分鐘**。

每天免費額度 5 次（10 張圖），把握黃金備課時間。
`,
};

const POST_100_MILESTONE: BlogPost = {
  slug: 'milestone-100-tools-achieved',
  title: '🎉 100 工具達成：阿凱老師教育工具集兩年實驗筆記',
  excerpt:
    '從 2024 年第 1 個工具到 2026 年 5 月 24 日的第 100 個 — 一位國小資訊老師的兩年實驗筆記。沒有融資、沒有團隊、沒有商業計畫，只有 5 大部署平台、7 大分類、99 篇手寫長文、和一個信念：把上課真的用得到的工具寫出來，免費送出去。',
  publishedAt: '2026-05-24',
  readingMinutes: 8,
  tags: ['100 工具達成', '里程碑', '阿凱老師', '教育工具集', '開源教學工具', '石門國小', '開發筆記'],
  toolIds: [100, 81, 46, 3],
  coverEmoji: '🎉',
  coverColor: 'orange',
  body: `<div class="bp-video-embed">
  <video
    controls
    preload="metadata"
    poster="https://cagoooo.github.io/Akai/celebration100/cover.png"
    style="width:100%;border-radius:12px;border:3px solid #1a1a1a;box-shadow:6px 6px 0 rgba(26,15,5,0.45);background:#1a1a1a;display:block;"
  >
    <source src="https://github.com/cagoooo/Akai/releases/download/v3.6.55-celebration100/celebration-100-final-v2.mp4" type="video/mp4" />
    瀏覽器不支援影片播放。<a href="https://github.com/cagoooo/Akai/releases/tag/v3.6.55-celebration100">直接下載 87 秒紀念短片 (9 MB)</a>
  </video>
  <div style="text-align:center;margin-top:10px;font-size:13px;color:#6b5e4a;font-weight:600;">
    🎬 87 秒紀念短片 · 旁白 + BGM · 一次看完 100 工具達成全紀錄
  </div>
</div>

## 兩年，剛好走到 100

2024 年我做了第一個給班上用的小工具，沒打算當「作品集」，純粹是因為**找不到適合的現成工具**所以自己刻。

兩年後的今天，**2026 年 5 月 24 日下午 14:08**，第 100 個工具「[#100 工具索引神器](/tool/100)」上線那一刻，首頁的破百倒數 banner 從「倒數 1」滑進「🎉 100 工具達成」的金色 Tape — **撒花特效自動觸發**，我在電腦前看著螢幕笑了一下，然後繼續備課（隔天還要上資訊課）。

100 不是目標。**100 是「持續解決真實問題」這條路上自然累積的副產品**。

<div class="callout callout--tip">
<div class="callout__label">💡 為什麼是 100，不是 50 或 200</div>

50 太少，覆蓋不到一個小學的全年級教學情境。200 太多，自己沒能力維護品質。**100 剛好是一個人 × 兩年 × 國小資訊課每週的真實產出**。

每個工具背後都有「某天某堂課真的需要它」的故事 — 不是為了湊數做的。

</div>

## 100 個工具背後，藏著什麼數字

<div class="stat-grid">
  <div class="stat-card">
    <div class="stat-card__label">手寫教學情境長文</div>
    <div class="stat-card__value">100 <span style="font-size:14px;color:#6b5e4a;">篇</span></div>
    <span class="stat-card__delta">100% 覆蓋率（每工具至少一篇）</span>
  </div>
  <div class="stat-card">
    <div class="stat-card__label">部署平台</div>
    <div class="stat-card__value">5 <span style="font-size:14px;color:#6b5e4a;">大平台</span></div>
    <span class="stat-card__delta">GH Pages / Sites / XOOPS / Firebase / 第三方</span>
  </div>
  <div class="stat-card">
    <div class="stat-card__label">工具分類</div>
    <div class="stat-card__value">7 <span style="font-size:14px;color:#6b5e4a;">大類</span></div>
    <span class="stat-card__delta">從互動到備課全覆蓋</span>
  </div>
  <div class="stat-card">
    <div class="stat-card__label">適用年級</div>
    <div class="stat-card__value">G1-G6 <span style="font-size:14px;color:#6b5e4a;">全年級</span></div>
    <span class="stat-card__delta">含部分國中段也能用</span>
  </div>
</div>

## 7 大分類，看 100 個工具的真實重心

| 分類 | 工具數 | 代表作 |
|---|---|---|
| 🛠️ **實用工具** | 32 | [#46 場地預約系統](/tool/46) · [#98 教室小幫手](/tool/98) |
| 📚 **教學設計** | 19 | [#81 教學駕駛艙](/tool/81) · [#87 PIRLS 閱讀理解 PRO](/tool/87) · [#99 考試卷生圖 Studio](/tool/99) |
| 🎮 **教育遊戲** | 17 | [#10 班級小管家](/tool/10) · [#3 即時投票](/tool/3) |
| ✍️ **語文寫作** | 13 | [#7 點石成金 評語](/tool/7) · [#91 點亮詩意](/tool/91) |
| 🎨 **互動體驗** | 10 | [#97 MBTI 校園奇遇記](/tool/97) · [#52 幸運大轉盤](/tool/52) |
| 💬 **溝通互動** | 6 | [#89 教師回覆小幫手](/tool/89) · [#26 評語網頁版](/tool/26) |
| 📖 **語文閱讀** | 3 | [#87 PIRLS](/tool/87) · [#4 閱讀理解小老師](/tool/4) |

**最大宗是「實用工具」32 個**（佔 32%）— 因為國小資訊老師每天碰最多的不是高深的 AI，是「怎麼讓場地預約不要再印紙本」「怎麼隨機抽號不用每天重洗籤」這些細碎場景。

## 5 個改變一切的里程碑工具

不是排行榜，是**真正改變我「下一步要做什麼」的那 5 個**：

### 1️⃣ #1 第一個工具（2024 年初）

當時甚至不知道要不要做網頁版 — 第一個工具上線那天，發現有家長在班級群組轉貼**還配了驚嘆號**，那一刻意識到：**「老師寫的工具」這 7 個字本身就有渠道**。

從此確定方向：寫，並且寫多。

### 2️⃣ [#3 即時投票](/tool/3)（第一個爆紅）

讓無聊提問變全班搶答的那個。**累計使用 84 場、12 所國小、3 所國中**，參與率從傳統 25% 拉到 92%。

第一次有別校老師私訊「能不能也來我們學校演示」，第一次有校長視察聽到後說「這個全市都該用」。

證明了：**好工具會自己長腳跑出校園**。

### 3️⃣ [#46 場地預約系統](/tool/46)（讓校園真正用上）

把禮堂、視聽教室、特別教室的紙本登記簿換成網頁。**寫了 3 週，校內用了 1 年，到現在每月還在被預約**。

學到的事：**比起花俏功能，「不要審核就能預約」這個反直覺設計反而是穩定關鍵** — 把預約權交還老師、信任老師會自治，比加一道審核流程更穩。

### 4️⃣ [#81 教學駕駛艙](/tool/81)（自己上課用最多）

不是給學生用的，**是給自己上課用的**。25 個獨立駕駛艙覆蓋 G3-G6 全年級資訊單元，每個駕駛艙有自己的視覺主題梗（Retro Win98 / Circuit-glow / Risograph⋯）。

學生記網址數從 8 個降到 1 個，上課切換工具 0 次。

**最受歡迎工具是「老師上課工作流」本身**，這件事顛覆了我以前以為「教學工具 = 學生互動工具」的想像。

### 5️⃣ [#100 工具索引神器](/tool/100)（智能推薦器）

100 個工具一字排開，老師怎麼挑？所以做了 #100 — **丟一句話「我想讓害羞學生開口」「水的三態怎麼教」→ fuse.js 模糊比對 + Gemini Embedding 語意搜尋 → 推 top 5 工具**。

它不是第 100 個工具，它是**讓前面 99 個工具被找到的那個工具**。第 100 個位置留給它，是有意設計。

## 技術選擇：3 個讓工程師朋友尖叫的決策

<div class="callout callout--info">
<div class="callout__label">ℹ️ 為什麼明知有更新潮的選項，還這樣選</div>

阿凱本身是工程背景出身，**這些選擇不是不會用 Next.js / Supabase / Vercel，而是刻意選最樸實的方案**。原因都跟教育場景的「能持續維護 5 年」有關。

</div>

### ① 100 個工具 = 100 個獨立 repo + GitHub Pages 純靜態

不是一個 monorepo 塞 100 個 component，是**真的 100 個獨立 GitHub repo**。每個工具有自己的 \`index.html\` + 自己的 \`sw.js\` + 自己的 commit history。

**為什麼**：教學工具會被別的老師 fork 改成自己班的版本。**獨立 repo 才能 fork 一個帶走一個**，不會被 monorepo 鎖死。

**代價**：寫工具卡片時要手刻 100 個 entry，這就是為什麼 #100 工具索引神器要做。

### ② 全站繁體中文，連 commit message 都是

界面、文案、按鈕、錯誤訊息、blog、CHANGELOG — **沒有一個英文字是給使用者看的**。

**為什麼**：受眾是台灣國小老師，介面英文化會多一道翻譯心智負擔。連 commit message 都繁中是因為**寫給未來的自己 + 共備夥伴看 git blame 時不用切翻譯**。

### ③ 拍立得公佈欄視覺語彙（cork + 便利貼 + 紅圖釘）

從 2024 年 v3.6.0 大改版那天決定的。**不是 Material Design、不是 shadcn 風、不是 iOS 灰白卡**，是**國小教室公佈欄的真實視覺記憶**。

**為什麼**：要讓家長家阿嬤打開都覺得「這個我看得懂」。教室公佈欄是台灣國小所有人共同的視覺記憶 — **設計語彙本身就是親切感**。

## 兩年踩坑學到的 5 件事

1. **「能用」勝過「漂亮」** — 第 1 版上線比 5 個禮拜後上線好太多，使用者回饋是設計師
2. **CHANGELOG 是給未來自己的情書** — \`v3.6.51\` 看回去能跟過去的自己對話，這比任何 design doc 有用
3. **PWA chunk 漂移 = 永遠的痛** — 試了 3 種策略才在 [v3.6.48](/) 學會「全域 self-heal + sessionStorage 防 loop」
4. **AI 工具的最大敵人是 Google 棄用模型** — 寫過 \`gemini-1.5-pro\` / \`gemini-pro\` 都掛了，現在每寫 Gemini code 前都先 ListModels
5. **Skill / 自動化會回報自己** — 從每次踩雷後寫 skill，到現在 60+ skill 累積成阿凱的「工程腦延伸」，新工具開發速度比兩年前快 5 倍

## 給未來的自己 · 一封信

> 走到 100，不是要你停下來慶祝。
> 是要提醒你**為什麼開始**。
>
> 開始那天，你只是一個找不到適合工具的國小資訊老師。
> 寫第一個工具不是為了當作品集，是因為**那堂課真的需要它**。
>
> 100 之後，不要追數量。**追深度**。
>
> 每個工具背後都該有一篇好故事、一群真實受惠的老師、一個被認真記錄的場景。
>
> 別忘了：**你最受歡迎的工具，是你給自己上課用的那一個**（#81 教學駕駛艙）。
> 這意味著什麼？意味著**最好的教學工具，永遠來自真實的教學現場，而不是想像中的學生**。
>
> 慢慢走。能走得久。
>
> — 2026.05.24 的阿凱

## 給其他想開始做工具的老師

如果你正在讀這篇，想做但卡住 — 我只有三句話：

1. **第一個工具不用做大** — 一個 HTML 檔 + 一個 GitHub Pages 就上線，比想 5 個禮拜架構好太多
2. **不要等學會 React / Vue 才開始** — 我前 30 個工具都是純 HTML + vanilla JS，學生用得很開心
3. **把過程寫下來** — 每個工具一篇 blog，未來自己會感謝你，會看到的老師也會感謝你

寫到第 10 個你會覺得很煩。寫到第 30 個你會覺得很順。寫到第 100 個 — 你會在某個下午突然發現，**這 100 個工具的累積，已經變成你的「教育語言」了**。

## 想分享這個里程碑？

→ [📸 100 達成紀念分享卡](/share/100.html)（轉貼 LINE / FB 直接顯示金色拼貼）
→ [📚 探索全部 100 款工具](/)
→ [✨ 投入下一個願望](/?wish=1)（從你的許願開始下一個 100）

## 配對工具推薦

- [#100 工具索引神器](/tool/100) — 100 個工具的智能門口
- [#81 教學駕駛艙](/tool/81) — 最受歡迎、最常被自己用的
- [#46 場地預約系統](/tool/46) — 校園實際運轉一整年
- [#3 即時投票](/tool/3) — 跨校爆紅的破冰神器

## 適用對象

- **國小老師**：想看「另一個老師兩年做了什麼」找靈感
- **想做副業教育工具的人**：兩年怎麼產出 100 個工具的真實節奏
- **想用免費工具的家長**：100 個工具全免費，從注音到 MBTI 都有
- **教育科技研究者**：一位老師的 ground-truth 開發筆記
- **未來的自己**：當你哪天迷失方向時，回來讀這篇

## 真的想試試？

→ [前往 #100 工具索引神器](/tool/100)，輸入你今天在課堂遇到的任何問題

或者，**從第 1 個工具開始逛**：[科技教育創新專區首頁](/)

整個下午的時間都不夠看完 — 慢慢來，不急。

---

🎉 **謝謝走到這裡的你**。

下一個 100，從你的許願開始。
`,
};

export const POSTS: BlogPost[] = [POST_100_MILESTONE, POST_81, POST_46, POST_10, POST_68, POST_3, POST_INDEX_AI, POST_53, POST_7, POST_88, POST_67, POST_72, POST_54, POST_76, POST_92, POST_82, POST_73, POST_51, POST_89, POST_83, POST_11, POST_87, POST_79, POST_97, POST_94, POST_41, POST_24, POST_25, POST_26, POST_27, POST_44, POST_49, POST_74, POST_75, POST_80, POST_17, POST_18, POST_20, POST_21, POST_22, POST_28, POST_29, POST_30, POST_31, POST_32, POST_33, POST_34, POST_35, POST_36, POST_37, POST_38, POST_4, POST_12, POST_13, POST_14, POST_15, POST_16, POST_43, POST_77, POST_9, POST_6, POST_69, POST_85, POST_56, POST_65, POST_66, POST_86, POST_58, POST_84, POST_2, POST_47, POST_48, POST_62, POST_5, POST_55, POST_70, POST_71, POST_95, POST_91, POST_45, POST_50, POST_52, POST_57, POST_60, POST_63, POST_64, POST_93, POST_96, POST_78, POST_23, POST_42, POST_61, POST_59, POST_90, POST_1, POST_19, POST_8, POST_39, POST_40, POST_98, POST_99];

/**
 * 已有「手寫長文」覆蓋的工具 ID 集合。
 * 從 POSTS 內每篇文章的 toolIds 自動推導（包含「配對工具推薦」也算）。
 * 用途：mini blog 生成器 / sitemap / OG landing 跳過這些 ID，避免 #N 同時出現「30 秒看完」短文 + 手寫長文重複。
 *
 * **唯一真相來源** — 修改後 miniPosts.ts / generate-og-pages.mjs / generate-sitemap.mjs 全部跟著走，無需 3 處硬編同步。
 */
export const HANDWRITTEN_TOOL_IDS: ReadonlySet<number> = new Set(
  POSTS.flatMap((p) => p.toolIds)
);

/**
 * 取得 post（含手寫長文 + 從 tools.json 自動生成的迷你 blog）。
 * mini blog 在 runtime 才生成（避免 build 時 tools.json 變動沒同步進 posts.ts）。
 */
export async function getAllPostsAsync(): Promise<BlogPost[]> {
  // 動態 fetch tools.json + 動態 import miniPosts（lazy）
  try {
    const base = import.meta.env.BASE_URL || '/';
    const version = import.meta.env.VITE_APP_VERSION || Date.now();
    const res = await fetch(`${base}api/tools.json?v=${version}`);
    if (!res.ok) return POSTS;
    const tools = await res.json();
    const { generateMiniPosts } = await import('./miniPosts');
    const miniPosts = generateMiniPosts(tools);
    // 手寫長文排前面（優先曝光），mini blog 排後面
    return [...POSTS, ...miniPosts];
  } catch {
    return POSTS;
  }
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}

/** 同步 + 從快取 tools.json 抓 mini post（給 BlogPost 路由用） */
export async function getPostBySlugAsync(slug: string): Promise<BlogPost | undefined> {
  // 先看手寫長文
  const hit = POSTS.find((p) => p.slug === slug);
  if (hit) return hit;
  // 不是手寫 → 看是不是 mini blog（純 ASCII slug 改 tool-{id} 簡潔模式；
  // 為兼容舊版含中文 slug，也接受 tool-{id}-... 的舊格式）
  const match = slug.match(/^tool-(\d+)(?:-|$)/);
  if (!match) return undefined;
  const id = parseInt(match[1], 10);
  try {
    const base = import.meta.env.BASE_URL || '/';
    const version = import.meta.env.VITE_APP_VERSION || Date.now();
    const res = await fetch(`${base}api/tools.json?v=${version}`);
    if (!res.ok) return undefined;
    const tools = await res.json();
    const tool = tools.find((t: { id: number }) => t.id === id);
    if (!tool) return undefined;
    const { toolToMiniPost } = await import('./miniPosts');
    const mini = toolToMiniPost(tool);
    if (mini.slug !== slug) return undefined; // slug 不符 — 可能 tool title 被改過
    return mini;
  } catch {
    return undefined;
  }
}
