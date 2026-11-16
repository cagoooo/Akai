// 新增工具 #136：好文章一鍵變題組｜PaGamO 社群線上分享簡報（2026-11-16）
import { readFileSync, writeFileSync } from 'node:fs';

const p = new URL('../server/data/tools.json', import.meta.url);
const tools = JSON.parse(readFileSync(p, 'utf-8'));
if (tools.some((t) => t.id === 136)) throw new Error('#136 已存在');

const STORE = 'https://chromewebstore.google.com/detail/cfbehdinangicblpbnockoofeccmoidp';

const tool = {
  id: 136,
  title: '好文章一鍵變題組｜PIRLS 閱讀題組小幫手線上分享簡報',
  description:
    '阿凱老師在 PaGamO 教師社群線上分享（2026-12-11）的 16 頁互動簡報：用冒險關卡的方式，介紹怎麼用 Chrome 擴充功能把網頁文章、截圖或 YouTube 影片變成 PIRLS 四層次題組，一鍵送進 PaGamO；聽眾用手機參與文字雲、投票與回饋。',
  detailedDescription: `這是阿凱老師為 PaGamO 教師社群線上分享（2026-12-11，Google Meet，約 40 分鐘）準備的互動簡報，主題是「好文章一鍵變題組：用 AI 小幫手把閱讀素養題送進 PaGamO」，共 16 頁。

## 簡報內容

- **為什麼要做**：好文章到處都有，但要不能複製就得打字、四個層次很難平均分配、PaGamO 批量上傳範本要一格一格貼。
- **PIRLS 四個理解層次**：訊息提取、直接推論、詮釋整合、評估批判，以及 8 題與 10 題時的題數分配。
- **四種方法把文章交給小幫手**：截取畫面（題組會附上原始截圖）、讀取這頁全文、反白文字、YouTube 影片（講解標出線索在幾分幾秒）；出題前可選一～六年級，先把文章改寫成適合該年級的版本。
- **現場示範**：從一篇新聞文章到 PaGamO 題目總覽，附 12 分鐘示範倒數計時器。
- **AI 出題，老師把關**：逐題檢查、修改題幹、選項、正解與答後講解。
- **一鍵送到 PaGamO**：自動打開批量上傳頁、選好題組、放好檔案，倒數 5 秒自動按「上傳」，檢查通過後跳到題目總覽標出新題組；選項順序預設隨機。
- **前後對比滑桿**：拖拉比較「以前全部自己來」和「現在老師當總編輯」的出題流程。
- **不只 PaGamO**：也能下載 LoiLoNote 測驗卡匯入檔。
- **三步驟裝起來**：從 [Chrome 線上應用程式商店](${STORE}) 安裝、用個人 Gmail 申請免費 Gemini 金鑰、開始出題，附 QR Code。

## 互動設計（聽眾用手機掃 QR Code 參與）

- **即時文字雲**：開場問「出一份閱讀題組，最花時間的是哪一步？」，結尾問「今晚最有收穫的一個詞？」。
- **即時投票**：最想先拿哪一種素材出題、分享給幾顆星、回去會不會用小幫手出題。
- **成果紀錄頁**：把投票與文字雲結果整理成一頁，可以列印或存成 PDF。
- **彩排模式**：網址加 \`?test=1\`，彩排時的投票與文字雲另外存放，不會混進正式紀錄。

## 技術做法

Reveal.js 簡報搭配 GSAP 動畫，「冒險關卡風」外觀：每一段是一個關卡，左上角顯示目前關卡，右上角的經驗值條就是簡報進度。互動資料存在 Firebase Firestore，以匿名登入區分每位參與者；部署在 GitHub Pages，有新版本時會提示重新整理。簡報網站本身不呼叫 AI 模型，出題用的 AI 在擴充功能裡，由老師用自己的 Gemini 金鑰呼叫。`,
  url: 'https://cagoooo.github.io/pagamo-pirls-talk/',
  icon: 'Map',
  category: 'teaching',
  previewUrl: '/previews/tool_136.webp',
  ogPreviewUrl: '/previews/og/tool_136.webp',
  tags: [
    'PIRLS',
    '閱讀素養',
    'PaGamO',
    'Chrome 擴充功能',
    'AI 出題',
    '互動簡報',
    '教師社群分享',
    '即時文字雲',
    '即時投票',
    'YouTube 出題',
    '線上研習',
  ],
  audienceFit: {
    audiences: ['teacher'],
    schoolLevels: ['elementary', 'junior'],
    teacherRoles: ['homeroom', 'subject', 'admin'],
    painPoints: ['professional-learning', 'reading-literacy', 'assessment', 'presentation'],
    priority: 72,
    reasons: {
      teacher:
        '想用 PaGamO 出閱讀題組的老師，可以照著這份簡報認識 PIRLS 四層次，看懂怎麼用 Chrome 擴充功能把網頁文章、截圖或 YouTube 影片變成題組並一鍵送進 PaGamO，再到商店安裝實際使用。',
      homeroom:
        '導師可參考「四種方法」與「AI 出題，老師把關」兩頁，把晨讀或班級閱讀用的新聞、繪本頁面變成題組，出題前還能選年級，讓文章更適合自己班上的程度。',
      subject:
        '國語文與閱讀課老師可用簡報裡的四層次說明與前後對比，跟同事說明出題流程怎麼改變；其他科目老師也能用同樣方法把科普文章做成閱讀理解題。',
      admin:
        '負責閱讀推動或教師研習的行政同仁（例如教學組、資訊組）可以把這份簡報當作辦線上分享的範本：即時文字雲、投票、示範倒數、彩排模式與可存成 PDF 的成果紀錄頁都能直接參考。',
    },
  },
  addedAt: new Date().toISOString(),
};

const insertIdx = tools.findIndex((t) => t.id > tool.id);
if (insertIdx === -1) tools.push(tool);
else tools.splice(insertIdx, 0, tool);
writeFileSync(p, JSON.stringify(tools, null, 2) + '\n', 'utf-8');
console.log('已新增 #136');
