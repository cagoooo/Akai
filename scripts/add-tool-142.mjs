// 新增工具 #142：PaGamO 出題效率翻倍｜教師研習簡報（2026-11-27）
import { readFileSync, writeFileSync } from 'node:fs';

const p = new URL('../server/data/tools.json', import.meta.url);
const tools = JSON.parse(readFileSync(p, 'utf-8'));
if (tools.some((t) => t.id === 142)) throw new Error('#142 已存在');

const STORE = 'https://chromewebstore.google.com/detail/cfbehdinangicblpbnockoofeccmoidp';

const tool = {
  id: 142,
  title: 'PaGamO 出題效率翻倍｜教師研習簡報',
  description:
    '阿凱老師為新北市教師線上研習（2026-12-02，2 小時）準備的 35 頁互動簡報：介紹 PIRLS 閱讀題組小幫手、PaGamO 教師後台上傳與派發題組、Gemini 技能＋題組下載器，附現場實作的低中高年級練習短文、時程列與班級小管家倒數。',
  detailedDescription: `這是阿凱老師為新北市教師線上研習「教學效率升級：PaGamO 實用攻略，出題效率翻倍」準備的互動簡報（2026-12-02 下午 14:00–16:00，Google Meet，含 10 分鐘休息），共 35 頁。

## 2 小時怎麼排

- **開場與痛點**：破冰文字雲「出一份閱讀題組，最花時間的是哪一步？」，再用 PIRLS 四個理解層次與兩條出題路線帶出全貌。
- **單元一：PIRLS 閱讀題組小幫手**（Chrome 擴充套件）：截取畫面、讀取這頁全文、反白文字、YouTube 影片、雲端硬碟 PDF 五種素材入口；出題前可選適讀年級、5／8／10 題；閱讀引導與只給老師看的「答案依據」；一鍵送到 PaGamO、倒數 5 秒自動上傳。
- **現場實作 15 分鐘**：老師跟著安裝、用個人 Gmail 申請金鑰，再從**低、中、高年級三篇自編練習短文**（〈小番茄長大了〉約 300 字、〈雨水撲滿〉約 450 字、〈城市裡的蜜蜂旅館〉約 750 字）挑自己教的年級出 5 題；附卡關排除表。
- **單元二：PaGamO 教師後台**：新北老師從「新北市親師生平台」登入；「我的題目 → 個人題庫 → 新增題目 → 批量上傳」題型改選「題組」；題組 Excel 的結構；到「題目總覽」檢查；在「新增作業」用章節搜尋找到自己的題組再派給學生（實際畫面截圖）。
- **單元三：Gemini 技能＋題組下載器**：不能裝擴充套件時的第二條路；安裝技能五步驟、@ 技能出題、把題組資料貼進 [PaGamO 題組下載器](https://cagoooo.github.io/pagamo-gemini/) 下載 Excel；另有三頁把 **SKILL.md 放大拆解**——技能名稱與觸發條件寫在哪、預設年級與科目怎麼改、哪些欄位不能動。
- **兩條路怎麼選**：擴充套件與 Gemini 技能的帳號、素材、題數配比、四層次名稱、上傳方式對照表。

## 線上研習的小設計

- **時程列**：每頁上方顯示目前段落、預定時間與現在時間，超過預定時間會變色提醒講師。
- **倒數改開班級小管家**：示範、實作、休息三處按鈕直接開新分頁到班級小管家計時器，網址已帶好分鐘數，可搭配 YouTube 背景音樂。
- **互動參與頁**：老師用手機或另開分頁參與文字雲、實作進度回報、會後回饋，結果即時出現在簡報上；「全部連結」整理了安裝、練習短文、教學影片。
- **一鍵複製全部連結**：講師按一下就能把所有連結貼到 Meet 聊天室；QR Code 也都能直接點開。

## 技術做法

Reveal.js 簡報搭配 GSAP 動畫，「效率儀表板」深色外觀；互動資料存在 Firebase Firestore，以匿名登入區分參與者，網址加 \`?test=1\` 進入彩排模式。部署在 GitHub Pages。簡報網站本身不呼叫 AI 模型；出題用的 AI 在擴充套件（老師自己的 Gemini 金鑰）與 Gemini 技能裡。擴充套件可從 [Chrome 線上應用程式商店](${STORE}) 安裝。`,
  url: 'https://cagoooo.github.io/pagamo-ntpc-1202/',
  icon: 'Rocket',
  category: 'teaching',
  previewUrl: '/previews/tool_142.webp',
  ogPreviewUrl: '/previews/og/tool_142.webp',
  tags: [
    'PaGamO',
    'PIRLS',
    '閱讀素養',
    '教師研習',
    '線上研習',
    '互動簡報',
    'Chrome 擴充功能',
    'Gemini 技能',
    '題組上傳',
    '派發作業',
    '練習短文',
  ],
  audienceFit: {
    audiences: ['teacher'],
    schoolLevels: ['elementary', 'junior'],
    teacherRoles: ['homeroom', 'subject', 'admin'],
    painPoints: ['professional-learning', 'reading-literacy', 'assessment', 'presentation', 'teacher-workload'],
    priority: 72,
    reasons: {
      teacher:
        '想把好文章變成 PaGamO 閱讀題組的老師，可以照著這份 2 小時研習簡報走一遍：安裝擴充套件出題、到教師後台上傳題組並派給學生，不能裝擴充套件時改用 Gemini 技能＋題組下載器。',
      homeroom:
        '導師可以直接用簡報附的低、中、高年級練習短文先練一次，再照「新增作業」那兩頁把自己出的題組派給班上，晨讀或閱讀課就能用。',
      subject:
        '國語文與閱讀課老師可參考 PIRLS 四層次與兩條路比較表；想改成自己科目的老師，可以看 SKILL.md 拆解那三頁，學會改技能的預設年級與科目。',
      admin:
        '負責教師研習或閱讀推動的行政同仁（例如教學組、資訊組）可以把這份簡報當作辦 2 小時線上研習的範本：時程列、現場實作、卡關排除、互動回報與會後成果紀錄頁都能直接參考。',
    },
  },
  addedAt: new Date().toISOString(),
};

const insertIdx = tools.findIndex((t) => t.id > tool.id);
if (insertIdx === -1) tools.push(tool);
else tools.splice(insertIdx, 0, tool);
writeFileSync(p, JSON.stringify(tools, null, 2) + '\n', 'utf-8');
console.log('已新增 #142，共', tools.length, '筆');
