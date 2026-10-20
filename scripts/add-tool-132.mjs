#!/usr/bin/env node

/** 新增工具 #132：輔導紀錄小幫手。 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const ID = 132;
const TOOL_URL = 'https://cagoooo.github.io/counseling/';
const TOOLS_SERVER = resolve(ROOT, 'server', 'data', 'tools.json');
const TOOLS_CLIENT = resolve(ROOT, 'client', 'public', 'api', 'tools.json');
const PREVIEW_DIR = resolve(ROOT, 'client', 'public', 'previews');
const PREVIEW_PATH = resolve(PREVIEW_DIR, `tool_${ID}.webp`);

const tool = {
  id: ID,
  title: '輔導紀錄小幫手',
  description:
    '把老師口語、零散的描述或點選的狀況標籤，整理成「輔導內容重點＋聯繫內容」兩段正式輔導紀錄，一鍵複製到校務系統；學生姓名送出前自動換成代號，也能用座號批次補登。',
  detailedDescription: `學期末要補登輔導紀錄時，最花時間的往往不是想起發生什麼事，而是把「他下課推了同學一把，後來有道歉」這類口語，改寫成可以登錄的正式文字。輔導紀錄小幫手把老師的描述整理成兩段：**輔導內容重點**（一段話簡述事件）與**聯繫內容**（事件經過、老師如何處理引導、學生之後可以怎麼做），可直接複製貼到校務系統。

## 實際功能

- **逐步填寫**：學生、輔導對象、狀況、經過、設定、結果六個步驟，選完自動帶到下一步。輔導對象可切換「只和學生談、聯繫家長、學生＋家長、教師／輔導室」，選「只和學生談」時不會寫出聯繫家長的內容。
- **常見狀況標籤**：8 大類 40 個國小常見狀況，點一下就加入並自動勾選輔導類別；另有傾聽同理、約定改善目標、轉介輔導室等教師處置標籤。點選自傷、疑似霸凌、疑似受虐等標籤時，會提醒依學校流程完成通報。
- **一鍵改寫與登錄前檢查**：可改成更溫和、更客觀、更精簡或更完整，不滿意能復原；也會標出診斷或標籤化字眼，以及輸入裡沒有、可能是 AI 自行補上的細節（例如「家長表示」），提醒老師確認。
- **批次補登（座號制）**：點座號、勾狀況，一次最多 10 位依序產生，有進度條，只用座號不需輸入姓名。
- **紀錄本與輸出**：存在自己的瀏覽器，可搜尋、載入、匯出 CSV、A4 列印；另有班級名冊、學校欄位名稱與字數上限設定、備份還原。

## AI 與隱私做法

網站以老師自己的 Gemini API 金鑰直接呼叫 Google 模型，並依金鑰即時查詢可用模型自動挑選；沒有金鑰也能把提示詞複製到 Gemini 網頁版，再把回覆貼回來自動拆段。送出前，學生姓名會換成「甲生、乙生」代號，電話與身分證字號也會遮蔽。網站沒有自己的伺服器，紀錄、名冊與金鑰都存在使用者的瀏覽器；在共用電腦可開啟「公用電腦模式」，關閉分頁就清除。AI 產生的文字仍需老師逐句核對事實後再登錄。`,
  url: TOOL_URL,
  icon: 'Heart',
  category: 'utilities',
  previewUrl: `/previews/tool_${ID}.webp`,
  ogPreviewUrl: `/previews/og/tool_${ID}.webp`,
  tags: [
    '輔導紀錄',
    '校務系統登錄',
    '去識別化',
    '批次補登',
    '座號制',
    '親師聯繫',
    'Gemini',
    '一鍵改寫',
    '學生輔導',
    '導師工作',
    '本機儲存',
  ],
  audienceFit: {
    audiences: ['teacher'],
    schoolLevels: ['elementary'],
    teacherRoles: ['homeroom', 'subject', 'admin'],
    painPoints: ['teacher-workload', 'administration', 'classroom-management', 'communication'],
    priority: 84,
    reasons: {
      teacher:
        '把口語描述或點選的狀況標籤整理成「輔導內容重點＋聯繫內容」兩段正式文字，可直接複製到校務系統；姓名送出前自動換代號，產生後仍需逐句核對事實。',
      homeroom:
        '導師處理同儕衝突、作業缺交、情緒低落等日常輔導後，可當天整理成紀錄；期末補登時用座號批次產生，一次最多 10 位，省下逐筆改寫的時間。',
      subject:
        '科任課堂發生衝突或安全狀況需要留下紀錄時，可選「教師／輔導室」或「只和學生談」對象，寫成客觀的事件經過與處置，再轉交導師或輔導室。',
      admin:
        '輔導室與學務處同仁可推薦給導師使用，統一紀錄寫法；登錄前檢查會標出診斷或標籤化字眼，以及輸入裡沒有、可能是 AI 補上的細節。',
      counseling:
        '輔導同仁可用學校格式設定統一欄位名稱與字數上限，並把自傷、疑似霸凌、疑似受虐等標籤的通報提醒，當作向導師說明通報流程的切入點。',
      'student-affairs':
        '學務處處理生活常規與校園安全事件時，可把晤談經過整理成客觀紀錄；通報提醒只是提示，法定通報仍要依學校流程完成。',
    },
  },
  addedAt: '2026-10-20T08:31:54Z',
};

async function capturePreview() {
  mkdirSync(PREVIEW_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 1280 },
      deviceScaleFactor: 2,
    });
    // 已看過使用說明，不自動跳出引導視窗
    await context.addInitScript(() => {
      try { localStorage.setItem('crh.onboarded', '1'); } catch { /* 忽略 */ }
    });
    const page = await context.newPage();
    await page.goto(`${TOOL_URL}?codex_capture=${ID}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.locator('h1').first().waitFor({ state: 'visible', timeout: 30000 });
    await page.waitForTimeout(1800);
    await page.evaluate(() => {
      [
        '.driver-popover', '.driver-overlay', '.driver-active-element',
        '.shepherd-element', '.shepherd-modal-overlay-container',
        '.introjs-overlay', '.introjs-helperLayer', '.introjs-tooltipReferenceLayer',
        '#sw-update-toast', '#updateBanner', '#cookieBanner', '#announcement',
        '[class*="cookie-banner"]', '[class*="cookie-consent"]',
        '[class*="onboard"]', '[class*="tutorial"]', '[class*="tour-tooltip"]',
      ].forEach((selector) => document.querySelectorAll(selector).forEach((element) => element.remove()));
      document.querySelectorAll('dialog[open]').forEach((dialog) => dialog.close());
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(350);
    const image = await page.screenshot({ type: 'png', fullPage: false });
    await sharp(image)
      .resize(1024, 1024, { fit: 'cover', position: 'top' })
      .webp({ quality: 88 })
      .toFile(PREVIEW_PATH);
    console.log(`📸 目標網站：${await page.title()} / ${(await page.locator('h1').first().innerText()).trim()}`);
  } finally {
    await browser.close();
  }
}

function writeTool() {
  const tools = JSON.parse(readFileSync(TOOLS_SERVER, 'utf8'));
  if (tools.some((item) => item.id === ID)) throw new Error(`#${ID} 已存在，停止以免覆蓋。`);
  // 用前後端聯集找最小未用編號；#100 只在前端但仍是保留編號。
  const clientTools = JSON.parse(readFileSync(TOOLS_CLIENT, 'utf8'));
  const usedIds = new Set([...tools, ...clientTools].map((item) => item.id));
  let nextId = 1;
  while (usedIds.has(nextId)) nextId += 1;
  if (nextId !== ID) throw new Error(`目前下一個可用編號是 #${nextId}，拒絕寫入 #${ID}。`);
  const insertIdx = tools.findIndex((item) => item.id > ID);
  if (insertIdx === -1) tools.push(tool);
  else tools.splice(insertIdx, 0, tool);
  writeFileSync(TOOLS_SERVER, `${JSON.stringify(tools, null, 2)}\n`, 'utf8');
}

console.log(`🚀 開始新增 #${ID} ${tool.title}`);
await capturePreview();
console.log(`📸 卡片預覽已保存：${PREVIEW_PATH}`);
writeTool();
console.log(`#${ID} 已寫入 server/data/tools.json；接著執行 npm run sync-tools-json。`);
