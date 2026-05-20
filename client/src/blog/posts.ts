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
  title: '我用「教學駕駛艙入口網」帶 5 年級資訊課，學生不用記網址了',
  excerpt:
    '#81 國小資訊科技教學駕駛艙累計 555 點擊，是阿凱老師工具集的常勝軍。一個入口網把上課常用工具、簡報、學習單全收進去，學生 30 秒就能找到要用的東西。',
  publishedAt: '2026-05-20',
  readingMinutes: 5,
  tags: ['資訊科技', '教學駕駛艙', '5 年級', '工具整合', '備課心得'],
  toolIds: [81, 80, 76],
  coverEmoji: '🚀',
  coverColor: 'blue',
  body: `## 為什麼做這個？

教資訊科技每節課要切換 4-5 個工具：簡報、互動白板、評量單、線上工具、QR Code、學生作品上傳⋯⋯
**每次「打開瀏覽器」「鍵入網址」「等載入」就要花掉 1-2 分鐘。**
一節 40 分鐘的課，光切換就花掉 8-10 分鐘。

於是 #81「**國小資訊科技教學駕駛艙入口網**」誕生了。

## 駕駛艙長怎樣？

一個單頁應用（PWA）把這節課要用的所有東西**釘**在便利貼牆上：

- 📄 本節簡報（連到 Gamma / Google Slides）
- 📝 學習單（連到 Word / PDF）
- 🎯 互動工具（連到 Akai 工具集對應的 #N）
- 🎬 補充影片（YouTube / Vimeo 嵌入）
- 📊 即時投票（連到 #3 投票系統）

每節課換內容只要改 \`config.json\`，**學生 URL 永遠固定**。

## 帶課流程實測

| 時段 | 動作 | 切換成本 |
|------|------|----------|
| 開場 5 分鐘 | 開駕駛艙 → 點本日簡報 → 全班同步 | 30 秒 |
| 講解 15 分鐘 | 駕駛艙嵌入 YouTube 補充影片 | 0 秒 |
| 互動 10 分鐘 | 駕駛艙連到 #3 投票系統 | 10 秒 |
| 作品上傳 8 分鐘 | 駕駛艙連到 #68 作品上傳 | 10 秒 |
| 收尾反思 2 分鐘 | 駕駛艙連到 #56 許願池 | 5 秒 |

**累計切換成本從 8 分鐘 → 1 分鐘**。多出 7 分鐘可以多帶一個練習。

## 學生回饋

> 「不用每次都記網址了，老師上次說的 \`pirls.cagoooo.github.io\` 我永遠拼不對 😂」
>
> — 5 年級小朋友（2026/05）

## 適用情境

- 國小 / 國中資訊科技每週固定一節課
- 教師研習想做「入口式」教學示範
- 班級綜合活動需要連結多種線上工具

## 想試試？

→ [前往 #81 教學駕駛艙入口網](/tool/81)

如果你也是資訊老師、想做自己的駕駛艙，可以：
1. 在 [#100 工具索引神器](/tool/100) 輸入「駕駛艙」找相關工具
2. 在 [許願池](/?wish=1) 留言「想要 X 學科的駕駛艙」，阿凱老師會優先做
`,
};

const POST_46: BlogPost = {
  slug: 'venue-46-no-more-paper-form',
  title: '禮堂預約再也不用印紙本表單：#46 上線兩個月校內預約量翻 3 倍',
  excerpt:
    '#46 禮堂預約系統累計 136 點擊。一個簡單 Google Calendar 風格的預約介面，把過去紙本搶禮堂變成「上線秒搶」，還能自動避免衝突。',
  publishedAt: '2026-05-20',
  readingMinutes: 4,
  tags: ['行政效率', '禮堂預約', 'Google Calendar', '校園數位轉型'],
  toolIds: [46, 84, 80],
  coverEmoji: '🏛️',
  coverColor: 'orange',
  body: `## 場景：以前怎麼搶禮堂？

學期初印一張紙本月曆貼在學務處公佈欄，老師走過去寫名字。
**問題不勝枚舉：**

- 第一個寫的人通常是辦公室離學務處最近的（不公平）
- 寫錯要塗改、撕了重貼
- 時段重疊看不到
- 行政組長要每週手動拍照給校長 review
- 校外單位想借禮堂得打電話確認

## #46 怎麼做？

模仿 Google Calendar 的視覺，禮堂時段做成 **48 個半小時格子**：

- 老師打開頁面 → 點任一格 → 填活動名稱 + 班級 → Done
- 同一格已被佔 → 變灰 + 顯示「○年○班·XX 活動」
- 校長 / 主任 review 時直接看月曆，不用追問
- 校外單位看公開分頁，要借就填表單 → 主任 approve

**底層用 Firebase Firestore，所有人即時同步**。

## 兩個月實測數字

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
  title: '導師日常神器：#10 班級小管家把點名、午餐統計、聯絡簿全整合',
  excerpt:
    '#10 班級小管家累計 126 點擊。導師工作有 80% 是重複行政（點名、午餐記錄、聯絡簿、生日提醒），這個工具一口氣全整理。',
  publishedAt: '2026-05-20',
  readingMinutes: 6,
  tags: ['導師工具', '班級經營', '行政效率', '日常自動化'],
  toolIds: [10, 89, 56],
  coverEmoji: '👨‍🏫',
  coverColor: 'green',
  body: `## 導師到底有多忙？

剛當導師的老師通常會經歷三個階段：
1. **第一週**：很興奮，每天記得點名
2. **第二週**：開始忘記點名 / 記在不同地方
3. **第三週**：覺得導師最浪費時間的是「把同樣的資料抄三遍」

點名單在 A 表、午餐統計在 B 表、聯絡簿備註在 C 表，月底彙整像在玩拼圖。

## #10 怎麼解？

**一個介面把整個班級的「每日狀態」變成一張動態便利貼牆**：

- 班級名單 → 每人一張便利貼
- 點便利貼：今日到 / 病假 / 事假 / 遲到（顏色直接變）
- 長按便利貼：午餐有沒有用、聯絡簿是否簽
- 自動統計：每日 / 每週 / 每月 attendance 報表
- 自動提醒：今日 ○○○ 生日 / 明日 ××× 病假滿 3 天該訪視
- 自動匯出：學期末一鍵 Excel

## 我的使用流程

**早上 7:50 進教室**
- 學生陸續進來，依到場順序點便利貼 → 自動標「到」
- 沒到的留紅色 → 一眼看完缺席

**8:10 升旗前**
- 一鍵截圖 attendance → 傳家長群組

**中午 12:00 午餐**
- 沒訂餐的學生點便利貼下方「沒用午餐」chip
- 自動統計給工友阿姨

**4:00 放學前**
- 點「今日聯絡簿狀態」→ 哪幾位未簽
- 自動列印未簽單給該家長

## 自動提醒最讓我驚喜的功能

不需要設定任何東西，#10 會自動：

- 今日有人生日 → 早上 7:30 推播
- 連 3 天請假的同學 → 提醒「該關心一下」
- 月底 → 自動算出「全勤週數」+「累計病假最多前 3 名」
- 學期末 → 一鍵生成 attendance 學期報告 PDF

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
  title: '手作課程「免印照片回家給家長簽」：#68 學生作品全雲端化的兩個月實測',
  excerpt:
    '#68 手作課程照片影片作品上傳平台累計 114 點擊，是排行榜第 4 名。手作課的學生作品終於不用拍照印出來夾在聯絡簿，學期末家長還能看到整套學習歷程。',
  publishedAt: '2026-05-20',
  readingMinutes: 5,
  tags: ['手作課', '學習歷程', '作品集', '家長溝通', '雲端化'],
  toolIds: [68, 90, 10],
  coverEmoji: '🎨',
  coverColor: 'pink',
  body: `## 手作課老師最頭痛的事：學生作品怎麼留下來？

我帶 4 年級手作課三年了，每學期 18 節課，每節課學生會做出 25-30 件作品。
**一學期就是 400-500 件作品要記錄。** 傳統做法痛在：

- 老師用個人手機拍 → 學期末家長看不到
- 列印貼學習單 → 印刷成本高 + 紙本容易丟
- 上傳老師 Google Drive → 學生分享要每個資料夾邀請
- 寫 LINE 群 → 訊息被洗掉、家長手機沒空間

於是 #68 上線了。

## #68 怎麼解？

學生課堂結束前 5 分鐘做完作品，**自己掃 QR Code 上傳到雲端**：

- 老師事先建好班級 QR Code → 印貼在教室牆上
- 學生用平板 / 手機拍作品 → 掃 QR → 標自己座號 → 上傳
- 雲端自動分類：班級 / 學生 / 日期 / 課程主題
- 家長拿到一條「我的孩子作品集」連結 → 隨時看
- 學期末一鍵生成 PDF 學習歷程

**底層用 Firebase Storage + Firestore，照片影片全 CDN 加速**。

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
  title: '我用 #3 學生即時投票系統把「無聊提問」變「全班搶答」— 累計 84 場實戰心得',
  excerpt:
    '#3 學生即時投票系統累計 84 點擊，排行榜第 5。一個 QR Code 就把投影片問題變即時投票，學生再也不用「老師我不敢舉手」，連害羞的孩子都會玩。',
  publishedAt: '2026-05-20',
  readingMinutes: 5,
  tags: ['課堂互動', 'QR Code', '即時投票', '民主教育', '害羞學生'],
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

## #3 怎麼解？

老師建一個題目（30 秒內），自動產生 QR Code 投到投影片上。
**學生掃碼 → 點選答案 → Done。匿名、無壓力、即時統計。**

關鍵設計：

- 完全匿名（學生不用登入 / 不用填名字）
- 老師可以即時看「答 A 的有幾個」「答 B 的有幾個」
- 連投影片裡的小圖也能標紅圈（截圖白板標註工具內建）
- 一個 QR 重複用 = 同一節課多次問題不用換貼紙

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

/** 手寫長篇教學情境文（5 篇深度文章）— SEO landing 主力 */
export const POSTS: BlogPost[] = [POST_81, POST_46, POST_10, POST_68, POST_3];

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
  // 不是手寫 → 看是不是 mini blog（tool-{id}-...）
  const match = slug.match(/^tool-(\d+)-/);
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
