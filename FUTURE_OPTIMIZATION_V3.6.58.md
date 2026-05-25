# 🚀 未來優化建議書（v3.6.58 之後）

> **更新日期**：2026-05-25
> **當前版本**：v3.6.58
> **基礎工作**：v3.6.57 全 99 工具升級 markdown 排版 + v3.6.58 35 個非 GitHub 工具用部落格淬煉
> **目標**：把「工具卡片描述準確化」這條線繼續延伸，覆蓋發現性、SEO、跨工具導流、後台維運、學生家長體驗

---

## 📍 我們現在站在哪裡

### v3.6.57/58 完成的事
- ✅ 99 個工具 `detailedDescription` 全部用 `## 🎯 核心特色 / ## 💡 設計理念 / ## 🎒 適合情境` 三段式 markdown
- ✅ 35 個非 GitHub 工具改用阿凱手寫部落格淬煉（平均 948 字、含 repo 名、版本號、`[/tool/X]` 互連）
- ✅ ReactMarkdown 渲染樣式（h2/h3/li ▸/em/code/blockquote/hr）+ 手機 RWD（768px/480px）
- ✅ Build 通過、push 上線、GitHub Actions 已部署

### 剩下還可以再進一步的維度
1. **內容準確度** — 64 個原本就有 detailedDescription 的工具還沒對齊部落格
2. **發現性** — Detail page 的描述只給「點進來的人」看，沒幫助 SEO / 社群分享
3. **跨工具導流** — `[/tool/X]` 互連是純 markdown，沒有 hover preview / 點擊預載
4. **後台維運** — 改一段描述要 commit + push，沒有 admin UI
5. **資料一致** — server/data + client/public/api 兩份 tools.json 容易漂移

---

## 🎯 P0 — 立刻可以做（< 半天）

### 1. 為剩下 64 個 GitHub 工具也跑一次部落格淬煉
```
難度：⭐⭐
時間：2-3 小時
影響：64 個工具描述準確度從「合格」拉到「精準」
```

**現況**：v3.6.58 只處理 35 個原本沒 detailedDescription 的工具。剩下 64 個 GitHub 工具的描述是 v3.6.57 subagent 從「原本就有的描述」改寫的 markdown 版 — 雖然語意保留，但**沒參考部落格、沒寫到 repo 名 / 版本號 / 月費 / 工具家族互連**。

**做法**：複用 v3.6.58 的工作流，把 `extract-posts.mjs` 的 `TARGET_IDS` 換成另外 64 個 id：
```bash
# 1. 找出剩 64 個 id
node -e "const t=require('H:/Akai/server/data/tools.json'); \
  const had=[1,4,7,8,12,13,14,15,16,17,18,19,20,21,22,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,43,44,49]; \
  console.log(t.filter(x=>!had.includes(x.id)).map(x=>x.id).join(','))"

# 2. 改 extract-posts.mjs 的 TARGET_IDS → 重跑
# 3. 切 4 批（每批 16 個）→ 派 4 個 subagent
# 4. 重複 merge-blog.mjs
```

**預期成果**：99 個工具描述全部「部落格淬煉版」，平均字數從 948 字再爬升到 1000+，互連數量翻倍。

---

### 2. 修 server/data + client/public/api 雙份漂移問題
```
難度：⭐
時間：30 分鐘
影響：未來改 tools.json 只要改一處
```

**現況**：[server/data/tools.json](server/data/tools.json) 有 99 個工具、[client/public/api/tools.json](client/public/api/tools.json) 有 100 個（多了 #100 工具索引神器）。`add-tool-99.mjs` 之類的 script 要寫兩遍。每次 v3.6.X 都有風險不一致。

**做法**：
- **方案 A（推薦）**：把 server/data/tools.json 設為單一來源，加 npm `predev` / `prebuild` script 自動 sync 到 client/public/api/，並加 `#100` 工具索引神器 entry
- **方案 B**：刪掉 server/data，全用 client/public/api（server 端走 vite import）

```json
// package.json
"scripts": {
  "sync-tools-json": "node scripts/sync-tools-json.mjs",
  "prebuild": "npm run sync-tools-json && ...",
  "predev": "npm run sync-tools-json"
}
```

**驗證**：build 完跑 `diff server/data/tools.json client/public/api/tools.json` 應該只差 #100 entry。

---

### 3. 修 #100 工具索引神器 detailedDescription 的渲染
```
難度：⭐
時間：15 分鐘
影響：使用者進 /tool/100 看的是 ToolIndexAI 頁，根本不會渲染 detailedDescription
```

**現況**：`/tool/100` 是 `ToolIndexAI` 元件，不顯示 detailedDescription。但相關推薦卡 / OG 分享預覽會用到 description。

**做法**：在 ToolIndexAI 元件頂部加一個收合 `<details>`，把 markdown detailedDescription 渲染進去當 about 區塊。

---

## 🎨 P1 — 一週內可完成（半天到 2 天）

### 4. 用 detailedDescription 開新搜尋 / 過濾管道
```
難度：⭐⭐
時間：4-6 小時
影響：使用者打「Firebase」「Replit」「Gemini」「Web Audio」可以從描述內文搜
```

**現況**：首頁 [BulletinHero](client/src/components/bulletin/BulletinHero.tsx) 的搜尋只比對 `title` + `tags` + `category`。現在描述裡有大量技術關鍵字（Firebase Functions v2 / Gemini 2.5 Flash / Cloudflare Turnstile / Web Audio API / XOOPS / Padlet），但不能搜。

**做法**：
- 在 [src/lib/searchIndex.ts](client/src/lib/searchIndex.ts)（新增）建立 fuse.js index
- 把 `detailedDescription` 加入 keys（weight: 0.5，比 title 0.5 / tags 0.3 / category 0.2 低，避免長文壓過短欄位）
- 搜尋結果加 hit highlighting（顯示 detailedDescription 內哪一段命中）

```typescript
import Fuse from 'fuse.js';
const fuse = new Fuse(tools, {
  keys: [
    { name: 'title', weight: 1.0 },
    { name: 'tags', weight: 0.6 },
    { name: 'category', weight: 0.4 },
    { name: 'detailedDescription', weight: 0.5 }, // 新增
  ],
  includeMatches: true, // 給 highlighting 用
  threshold: 0.3,
});
```

---

### 5. Tool detail page 加「工具家族」自動偵測
```
難度：⭐⭐
時間：3-4 小時
影響：v3.6.58 加的 [/tool/X] 互連可以變成視覺化 family tree
```

**現況**：descrip­tion 裡寫 `[#87 PIRLS QuestionCraft Pro](/tool/87)` 是純文字連結，使用者點了就跳走，但不知道「這是同源雙部署」「這是 Pro 版升級」。

**做法**：
- 在 [BulletinToolDetail.tsx](client/src/pages/BulletinToolDetail.tsx) 加 `<ToolFamilyBadge>` 元件，掃 description 內所有 `/tool/N`，列出「→ 你正在看的工具」「→ 相關工具」流程圖
- 用 `BulletinToolFamilyTree.tsx`（已有）的視覺語彙

```tsx
<ToolFamilyBadge currentTool={tool}>
  PIRLS 三部曲：
  #4 (學校網域版) ━━━━━━ #12 (入口網) ━━━━━━ #87 (Pro 版) ←現在
</ToolFamilyBadge>
```

---

### 6. detailedDescription 字數異常告警
```
難度：⭐
時間：1 小時
影響：未來新增工具時自動偵測「字數太少」「漏寫小標題」
```

**現況**：v3.6.58 字數 741-1190 算很穩定。但未來新增工具或人工編輯後可能漂移。

**做法**：在 `scripts/` 加 `lint-tool-descriptions.mjs`：
```js
const REQUIRED_HEADERS = ['## 🎯 核心特色', '## 💡 設計理念', '## 🎒 適合情境'];
const MIN_LENGTH = 400;
const MAX_LENGTH = 1500;

for (const tool of tools) {
  const desc = tool.detailedDescription || '';
  const missing = REQUIRED_HEADERS.filter(h => !desc.includes(h));
  if (missing.length) console.warn(`#${tool.id} 缺小標題:`, missing);
  if (desc.length < MIN_LENGTH) console.warn(`#${tool.id} 字數過少:`, desc.length);
  if (desc.length > MAX_LENGTH) console.warn(`#${tool.id} 字數過多:`, desc.length);
}
```

加進 `npm run build` pipeline（warning 不阻斷 build，但有提示）。

---

### 7. 加「複製描述」「分享到 LINE」按鈕
```
難度：⭐
時間：1-2 小時
影響：老師看到好用的工具描述可以直接 copy 給家長 / 同事
```

**現況**：detail page 已有「複製連結」「分享」按鈕，但只分享 URL。老師常見需求是「我要把這段功能描述貼到 LINE 群組」。

**做法**：在 [BulletinToolDetail.tsx](client/src/pages/BulletinToolDetail.tsx) 的 actions 列加：
- 「📋 複製介紹」按鈕 → copy 純文字版（移除 markdown 語法）+ URL
- 「💬 分享到 LINE」按鈕 → 用 LINE Share URL Scheme

```typescript
const shareToLine = () => {
  const text = `【${tool.title}】\n${tool.description}\n\n📌 完整介紹：${shareUrl}`;
  window.open(`https://line.me/R/msg/text/?${encodeURIComponent(text)}`);
};
```

---

## 📊 P2 — 中等投入（2-5 天）

### 8. detailedDescription 全文 SEO 化（Schema.org + 內頁 SEO）
```
難度：⭐⭐⭐
時間：1-2 天
影響：Google 搜「Firebase Hosting 國小教學工具」能搜到單一工具頁
```

**現況**：detailedDescription 是 client 端動態渲染的，**Google bot 看不到**。Akai 首頁 OG meta 有做 SEO，但每個工具頁的描述只有短版 description。

**做法**：
- 在 `scripts/generate-og-pages.mjs`（已有）的 100 個 OG landing page 加入完整 detailedDescription（轉成 HTML、加 JSON-LD Schema.org SoftwareApplication）
- 每個工具頁 OG meta 的 description 從 detailedDescription 萃取第一段（去 markdown）
- 加 sitemap.xml priority 0.8（高於 blog 0.6）

```html
<!-- OG landing page -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "考試卷生圖 Studio",
  "description": "...純文字第一段...",
  "applicationCategory": "EducationalApplication",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "TWD" },
  "creator": { "@type": "Person", "name": "阿凱老師（石門國小資訊組）" }
}
</script>
```

**預期成果**：1-2 個月內 Google 開始 index 100 個工具頁，自然流量 +30-50%。

---

### 9. 建「平台分類」第二維度過濾
```
難度：⭐⭐⭐
時間：1 天
影響：使用者可以從「我要找 Firebase Hosting 的工具」「我要找純前端 GitHub Pages 工具」過濾
```

**現況**：[首頁](client/src/components/bulletin/BulletinHero.tsx) 只能按「分類」（communication / utilities / interactive 等）過濾。但 v3.6.58 揭示了**部署平台**也是重要的二維屬性。

**做法**：
- 在 tools.json 加 `platform` 欄位（手動填或從 url 自動推導）
- 值：`github-pages` / `firebase-hosting` / `xoops-vm` / `google-sites` / `replit` / `line-bot` / `claude-artifacts` / `padlet`
- 首頁加 platform 過濾 chip 列

```typescript
// 從 url 自動推導
function detectPlatform(url: string): string {
  if (url.includes('cagoooo.github.io')) return 'github-pages';
  if (url.includes('.smes.tyc.edu.tw') && !url.includes('/smes_html')) return 'firebase-hosting';
  if (url.includes('smes_html')) return 'xoops-vm';
  if (url.includes('sites.google.com')) return 'google-sites';
  if (url.includes('replit')) return 'replit';
  if (url.includes('lin.ee') || url.includes('line.me')) return 'line-bot';
  if (url.includes('claude.ai')) return 'claude-artifacts';
  if (url.includes('padlet.com')) return 'padlet';
  return 'other';
}
```

---

### 10. 部落格 ↔ 工具卡片雙向導流
```
難度：⭐⭐
時間：4-6 小時
影響：使用者看完工具描述可以一鍵跳「完整部落格深度文」
```

**現況**：工具描述（淬煉版）跟部落格長文（原版）是「同源不同形式」。但工具頁沒指引使用者去看部落格、部落格也沒突出顯示工具卡片。

**做法**：
- **工具頁加「📖 看完整深度文」CTA**：在 description 下方加「想看完整開發歷程？閱讀阿凱老師寫的 X 篇相關長文 →」連到 `/blog/{slug}`
- **部落格頁加「⚡ 立即使用工具」浮動 CTA**：右下角浮動按鈕，連回工具的 `useTool` action

```tsx
// BulletinToolDetail.tsx
{relatedPosts.length > 0 && (
  <Tape color={tokens.note.blue} angle={-1}>
    📖 阿凱寫了 {relatedPosts.length} 篇深度文 →
    <Link href={`/blog/${relatedPosts[0].slug}`}>看開發歷程</Link>
  </Tape>
)}
```

---

### 11. 描述內「技術名詞」自動加 tooltip
```
難度：⭐⭐⭐
時間：1-2 天
影響：家長看到「Firebase Hosting」「Gemini API」「Web Audio API」可以 hover 看解釋
```

**現況**：描述充滿技術名詞，老師懂、家長可能一頭霧水。

**做法**：
- 在 [src/lib/tech-glossary.ts](client/src/lib/tech-glossary.ts)（新增）建立技術名詞辭典：
```typescript
export const TECH_GLOSSARY = {
  'Firebase Hosting': 'Google 提供的免費網站託管服務，速度快、自帶 CDN',
  'Gemini API': 'Google 開發的 AI 大型語言模型',
  'Web Audio API': '瀏覽器內建的音訊處理 API，可即時分析麥克風',
  'PWA': 'Progressive Web App，可離線使用、加到桌面的網頁應用',
  'XOOPS': '開源網站內容管理系統，石門國小校網使用的平台',
  // ...
};
```
- ReactMarkdown 的 `strong` component 改成：如果該詞在 glossary 內，加 `title` 屬性顯示 tooltip
- 進階：用 [@radix-ui/react-tooltip](https://www.radix-ui.com/primitives/docs/components/tooltip)（已在依賴）做正式 tooltip

---

## 🏗️ P3 — 大型功能（1 週以上）

### 12. Admin Console 後台直接編輯 description
```
難度：⭐⭐⭐⭐
時間：3-5 天
影響：阿凱不必每次改一段描述都 commit + push（直接後台改、即時上線）
```

**現況**：所有 detailedDescription 都寫死在 `server/data/tools.json` + `client/public/api/tools.json`。改一段要 commit、push、等 GitHub Actions、3-5 分鐘才上線。

**做法**：
- 在 Firestore 加 `toolOverrides/{toolId}` collection，欄位 `{ detailedDescription, updatedAt, updatedBy }`
- [BulletinToolDetail.tsx](client/src/pages/BulletinToolDetail.tsx) 改成：先讀 Firestore override，沒有才用 tools.json 內建版
- 在 [AdminAuth](client/src/components/AdminAuth.tsx) 加「工具描述編輯器」分頁，含：
  - 工具列表（含「已 override / 未 override」標記）
  - Markdown 編輯器（react-md-editor 或 lexical）
  - 即時預覽（用 BulletinToolDetail 的渲染元件）
  - 「reset to default」按鈕（清掉 override）

```tsx
// 修改後的 useQuery
const { data: tool } = useQuery({
  queryKey: ['tool', toolId],
  queryFn: async () => {
    const base = allTools.find(t => t.id === toolId);
    const override = await getDoc(doc(db, 'toolOverrides', toolId));
    return override.exists()
      ? { ...base, detailedDescription: override.data().detailedDescription }
      : base;
  },
});
```

---

### 13. 描述「自動翻譯英文版」（雙語教育對外用）
```
難度：⭐⭐⭐⭐
時間：3-5 天
影響：對應 #43 LinguaLesson 的雙語政策，國際交流可以直接給英文版
```

**現況**：石門國小是雙語學校。工具描述全中文，國際交流 / 雙語家長 / 外師看不懂。

**做法**：
- 後台跑一次 Gemini 2.5 Flash 把 99 個 detailedDescription 翻成英文，存 `detailedDescriptionEn`
- 加語系切換 chip（zh-TW / en）在 [BulletinToolDetail.tsx](client/src/pages/BulletinToolDetail.tsx) header
- URL 加 `?lang=en` query param，PageHead 跟 OG meta 也跟著切

```typescript
const { i18n } = useTranslation();
const desc = i18n.language === 'en' && tool.detailedDescriptionEn
  ? tool.detailedDescriptionEn
  : tool.detailedDescription;
```

---

### 14. AI 對話式「工具找尋助理」（深度結合描述）
```
難度：⭐⭐⭐⭐⭐
時間：1 週
影響：取代純 fuzzy search 的「工具索引神器」，做語意搜尋
```

**現況**：[#100 工具索引神器](client/src/pages/ToolIndexAI.tsx) 用 fuse.js 模糊比對。但「我想讓孩子練習表達自己情緒」這種抽象需求 fuse.js 抓不到。

**做法**：
- 把 99 個 detailedDescription 過一次 Gemini Embedding API，存 vector 進 Firestore
- 使用者輸入需求 → embed → cosine similarity 找 top 5
- 加「AI 為什麼推薦這款？」用 Gemini Flash 生成短解釋

```typescript
// Cloud Function: searchToolsBySemantic
import { GoogleGenerativeAI } from '@google/generative-ai';

export const searchTools = onCall(async (req) => {
  const query = req.data.query;
  const queryEmbed = await embed(query);
  const tools = await getAllToolEmbeddings();
  const sorted = tools
    .map(t => ({ ...t, similarity: cosine(queryEmbed, t.embedding) }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5);
  return sorted;
});
```

**預期成果**：「我想找適合特教融合的工具」直接推 [#38 聲音互動遊戲](/tool/38)（描述有寫「特教融合超友善」）+ [#32 觸屏碰碰碰](/tool/32) 等。

---

### 15. 描述自動回填到 README / Markdown 文件
```
難度：⭐⭐⭐
時間：1-2 天
影響：所有 cagoooo/* repo 的 README 自動同步最新介紹
```

**現況**：每個工具的 GitHub repo（如 cagoooo/it-cockpit）有自己的 README，跟 detailedDescription 內容可能漂移。

**做法**：
- 寫 GitHub Action：每次 tools.json 更新 → 自動 PR 對應 repo 的 README 加上「📌 Akai 工具集介紹」段落
- 用 `gh pr create` API 走 cagooo@gmail.com 帳號

```yaml
# .github/workflows/sync-readme.yml
on:
  push:
    paths: ['server/data/tools.json']
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - run: node scripts/sync-readme-to-tool-repos.mjs
```

---

## 🔍 P4 — 內容品質深化（持續性）

### 16. 抽 10 個樣本人工 review 部落格淬煉版的準確度
```
難度：⭐
時間：2-3 小時
影響：找出 subagent 淬煉時可能誤判的地方
```

**現況**：v3.6.58 的 35 個工具是 subagent 自動跑的，沒有人工 review。可能有 1-2 個工具描述有小瑕疵。

**做法**：
- 隨機抽 10 個工具（特別挑技術細節多的 #4 / #7 / #13 / #15 / #97）
- 人工比對 detailedDescription vs 部落格原文
- 列出「應該保留但 subagent 漏掉的細節」
- 修正後重跑該工具的 detailedDescription

---

### 17. 為剩 64 個 GitHub 工具加「對應 repo URL」欄位
```
難度：⭐⭐
時間：3-4 小時
影響：開發者 / 想學的老師可以一鍵看原始碼
```

**現況**：tools.json 的 `url` 是工具的對外連結（如 cagoooo.github.io/it-cockpit/），沒有對應 github repo URL（github.com/cagoooo/it-cockpit）。

**做法**：
- 加 `repoUrl` 欄位
- 寫 script 從 `url` 推導：`https://cagoooo.github.io/xxx/` → `https://github.com/cagoooo/xxx`
- 不適用的（Replit / Google Sites / Padlet / Claude Artifacts）留 null
- [BulletinToolDetail.tsx](client/src/pages/BulletinToolDetail.tsx) 加 GitHub icon 按鈕

---

### 18. 描述內加「最後更新 / 版本號」自動同步
```
難度：⭐⭐⭐
時間：1-2 天
影響：使用者看到 "v2.15.0" 知道是最新還是舊版
```

**現況**：v3.6.58 的描述寫了大量版本號（v2.15.0 / v3.6.42 / v0.6.7 等），但這些是寫死的，工具升版後不會自動更新。

**做法**：
- 加 `lastVerifiedAt` 欄位
- 每個 repo 加 `version.json` 端點（or GitHub API 撈 latest commit）
- detailedDescription 內的版本號改用 `{{VERSION}}` placeholder，render 時動態填入
- 後台跑 weekly cron 撈各 repo 最新版

---

## 🌟 P5 — 創新功能（不一定要做）

### 19. 工具卡片「相似度雲圖」視覺化
讓使用者看到 99 個工具的 2D 投影（t-SNE / UMAP），點選相近區塊找相關工具。

### 20. 描述「AI 朗讀」（給視障 / 不識字學生）
detailedDescription 加「🔊 聽介紹」按鈕，用 Edge TTS YunJhe / HsiaoYu 朗讀。

### 21. 卡片背面「使用統計面板」
翻牌效果，正面是描述、背面顯示「累計使用 X 次 / 最後使用日期 / 哪些班級用過」。

### 22. RAG-based 教師助理
用 99 個 detailedDescription + 99 篇部落格做 RAG，老師問「水的三態怎麼上」AI 推薦 [#29 太陽系探索者](/tool/29) + 給教學流程建議。

### 23. 每月「工具家族影片」自動生成
每月跑一次，挑 3 個近期高使用率工具，用 HyperFrames + Edge TTS + Pixabay BGM 生 90 秒「本月推薦」影片。

### 24. 描述 A/B 測試
同個工具寫 2 版 detailedDescription，隨機顯示，看哪版有更高 `handleUseTool` 轉換率。

---

## 📅 建議優先順序（執行順序）

### 第一週（立即 ROI 高）
1. ✅ P0-1：64 個 GitHub 工具也跑部落格淬煉（2-3 hr）
2. ✅ P0-3：修 #100 的 about 區塊（15 min）
3. ✅ P1-6：lint script 防止未來描述漂移（1 hr）

### 第二週（使用者體驗）
4. P1-4：detailedDescription 加入搜尋 index（4-6 hr）
5. P1-7：複製介紹 / LINE 分享按鈕（1-2 hr）
6. P1-5：工具家族 badge 視覺化（3-4 hr）

### 第三週（SEO + 發現性）
7. P2-8：SoftwareApplication Schema + OG landing page 全文 SEO（1-2 天）
8. P2-9：平台分類二維過濾（1 天）

### 第四週（內容深度）
9. P2-10：部落格雙向導流（4-6 hr）
10. P2-11：技術名詞 tooltip（1-2 天）

### 長期（季度級）
11. P3-12：Admin 後台直編 description
12. P3-14：AI 對話式找工具（Embedding + Gemini）
13. P3-13：英文版自動翻譯

---

## 💡 觀察 / 反思

### 從本次重寫看到的「資訊架構問題」
1. **工具家族隱性結構**：v3.6.58 揭示了 #4↔#87 / #13↔#92 / #16↔#89 / #1↔#19 / #25↔#67 / #84↔#15 / #91↔#14 / #28↔#9 / #71↔#22 等多組「同源雙部署」「Pro 版升級」關係。這應該被視覺化（看 P1-5）。
2. **聲音三部曲、PIRLS 三件套、抽籤三件套** 等「主題群組」很自然，應該變成首頁的「主題瀏覽」入口。
3. **35 個非 GitHub 工具被低估**：v3.6.58 前他們的描述像「副本」，現在揭示出 XOOPS VM / Google Sites Embedded / Replit 等「第三方平台選擇邏輯」本身就是有教學價值的故事 — 適合做「工具開發方法論」部落格系列。

### 從 99 篇部落格淬煉到 99 段描述的副產物
- **發現「隱藏作品」**：阿凱實際作品 > 100 件（#27 swissknife 有 7 個沒收進 Akai 的隱藏作品，#30 有 12 個迷你遊戲）→ 可以做 v4.0 主題：「揭露 120+ 件作品」
- **共用範本策略**：阿凱的 [#26 九九乘法] vs [#44 數學加減法] 程式碼共用 70%+ → 可以做開源「教學遊戲框架 starter kit」
- **「用對工具」哲學**：阿凱會看場景選平台（Replit 後端 / GitHub Pages 純前端 / Google Sites 內網 / Padlet 不重複造輪子）→ 可以寫成「教師工程師的 SaaS 選擇指南」部落格

---

## 🎬 結語

v3.6.57/58 把工具卡片描述從「短促」升級到「準確 + 有故事」，但這只是讓「點進來的人」看到更好的內容。下一步應該往：

1. **讓更多人點進來**（SEO + 平台分類過濾 + 工具家族視覺化）
2. **讓進來的人做更多事**（複製 / 分享 / 看部落格深度文 / AI 推薦相關工具）
3. **讓阿凱維護更輕鬆**（後台直編 + lint 防漂移 + 自動翻譯）

按上面 P0 → P5 的順序，2 個月內可以把工具集從「100 個自製作品」進化成「自成生態的教育工具知識庫」。
