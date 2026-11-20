// 新增工具 #137：PaGamO題組SKILLS技能下載器（只寫 server/data/tools.json，client 由 sync-tools-json 產生）
import { readFileSync, writeFileSync } from 'node:fs';

const p = 'server/data/tools.json';
const tools = JSON.parse(readFileSync(p, 'utf-8'));
if (tools.some((t) => t.id === 137)) {
  console.log('#137 已存在，略過');
  process.exit(0);
}

const tool = {
  id: 137,
  title: 'PaGamO題組SKILLS技能下載器',
  description:
    '把 Gemini 技能產出的 PIRLS 閱讀題組資料貼上，一鍵下載 PaGamO 官方題組範本格式的 Excel，下載後自動打開 PaGamO 批量上傳頁；也提供 pagamo-reading-set 技能檔下載與圖文安裝教學。',
  detailedDescription: `這個網站分成兩個部分：一份給 Gemini 用的「技能」（Skills），和一個把 Gemini 給的題組資料轉成 PaGamO 上傳檔的下載器。老師不用裝任何軟體，也不用自己對照範本一格一格貼。

## 技能包：pagamo-reading-set

- **一個檔案就能裝**：在[安裝教學頁](https://cagoooo.github.io/pagamo-gemini/skill.html)下載 \`SKILL.md\`，按下載後會自動開新分頁到 Gemini 技能頁，照 5 個附截圖的步驟上傳即可；上傳不成功也能用「手動建立」，頁面有三個複製按鈕。
- **出題前選題數**：可選 5、8、10 題，PIRLS 四層次（直接提取、直接推論、詮釋整合、比較評估）依題數分配，例如 8 題是 3／2／2／1。
- **引導式解說**：解說不直接說出答案，而是帶學生回到文章第幾段、找哪些關鍵詞，讓學生自己找到答案；正確答案只在預覽裡給老師看。
- **照片、PDF 逐字照抄**：課文照片或 PDF 會逐字抄錄，看不清楚的字標成「□」請老師核對。
- 最後輸出一段 JSON 格式的「題組資料」，和一個有「複製」按鈕的下載器網址框。

## 題組下載器

- **貼上就檢查**：貼上題組資料後，右邊列出每一題和正確答案；格式有錯（例如答案寫 D 但只有三個選項）會用紅字列出。
- **官方範本**：每次下載時抓 PaGamO 官方「題組」批量上傳範本，把題目從第 11 列填進去，存成 \`.xlsx\`。
- **自動接到 PaGamO**：下載後自動開新分頁到 PaGamO「批量上傳」頁面，老師只要選「題組」、選檔案、按上傳。

## 技術與限制

純前端網頁，用 SheetJS 在老師的瀏覽器裡產生 Excel，題目資料不會送到任何伺服器；網站本身不呼叫 AI 模型，出題由老師自己的 Gemini 帳號完成。部署在 GitHub Pages，有新版本時會提示重新整理。2026-11-19 實測：產生的檔案在 PaGamO 批量上傳「檔案檢查通過」，題目總覽的文章、題目、選項、正確答案與解說都正確。

使用時要注意：Gemini 打開 Canvas 時不能用技能；技能只對「有 @ 它的那一則訊息」有效，回覆題數時要再選一次技能；Gemini 技能偶爾會沒有套用，重新 @ 一次即可。`,
  url: 'https://cagoooo.github.io/pagamo-gemini/',
  icon: 'Wand2',
  category: 'reading',
  previewUrl: '/previews/tool_137.webp',
  ogPreviewUrl: '/previews/og/tool_137.webp',
  tags: [
    'PaGamO',
    'PIRLS',
    '閱讀素養',
    'Gemini 技能',
    'SKILLS',
    '閱讀題組',
    '批量上傳',
    'Excel 下載',
    '引導式解說',
    '出題工具',
    '純前端',
  ],
  audienceFit: {
    audiences: ['teacher'],
    schoolLevels: ['elementary'],
    teacherRoles: ['homeroom', 'subject', 'admin'],
    painPoints: ['reading-literacy', 'assessment', 'teacher-workload', 'content-creation'],
    priority: 70,
    reasons: {
      teacher:
        '有在用 PaGamO 的國小老師，可以把技能裝進自己的 Gemini，貼上一篇文章就得到 PIRLS 四層次題組，再用下載器轉成官方範本格式的 Excel，省下對照範本一格一格貼的時間。',
      homeroom:
        '導師可以把晨讀文章、課文照片或班刊稿子交給 Gemini 出 5 題快速檢核，或 8～10 題當回家練習；解說是引導式提示，學生答錯時會被帶回文章第幾段自己找答案。',
      subject:
        '國語文與閱讀課老師可以依文章長短選 5、8 或 10 題，四層次分配固定，方便比較班上在提取、推論、詮釋、比較評估各層次的表現；其他科目也能把科普文章做成閱讀理解題。',
      admin:
        '推動閱讀或資訊研習的行政同仁（例如教學組、資訊組）可以直接分享安裝教學頁：下載技能檔後會自動開 Gemini 技能頁，5 個步驟都有截圖，老師照著做就能裝好。',
    },
  },
  addedAt: new Date().toISOString(),
};

const insertIdx = tools.findIndex((t) => t.id > tool.id);
if (insertIdx === -1) tools.push(tool);
else tools.splice(insertIdx, 0, tool);
writeFileSync(p, JSON.stringify(tools, null, 2) + '\n', 'utf-8');
console.log('已新增 #137，server 共', tools.length, '筆');
