#!/usr/bin/env node

/** 新增工具 #130：石門國小 115 學年度運動會資訊站。 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const ID = 130;
const TOOL_URL = 'https://cagoooo.github.io/sportsday-115/';
const TOOLS_SERVER = resolve(ROOT, 'server', 'data', 'tools.json');
const TOOLS_CLIENT = resolve(ROOT, 'client', 'public', 'api', 'tools.json');
const PREVIEW_DIR = resolve(ROOT, 'client', 'public', 'previews');
const PREVIEW_PATH = resolve(PREVIEW_DIR, `tool_${ID}.webp`);

const tool = {
  id: ID,
  title: '石門國小 115 學年度運動會資訊站',
  description:
    '把石門國小 115 學年度運動會的 30 項賽程、精彩活動、家長觀賽與停車資訊收在同一頁；可依表演、團體競賽、徑賽或典禮篩選，親師生出發前就能確認時間與注意事項。',
  detailedDescription: `「一起奔跑，一起為努力喝采」是桃園市龍潭區石門國民小學 115 學年度全校運動會的資訊網站。活動訂於 2026 年 10 月 17 日（星期六），網站將活動亮點、當日重要時段、完整賽程、交通停車、家長邀請單與觀賽提醒集中在同一個入口，方便師生與家庭在活動前查閱。\n\n## 主要功能\n\n- **完整活動時程**：從 08:20 開幕典禮、上午表演與競賽，到 13:00 午後賽事及 14:00 閉幕典禮，先掌握一天的重要節點。\n- **30 項賽程快速篩選**：可依表演、團體競賽、徑賽與典禮分類，查看各項目時間、年級及參賽單位；同時段可能有不同項目，網站也提醒以現場廣播為準。\n- **活動亮點預覽**：先認識年級表演、趣味團體競賽、短跑與班際接力，也能了解家長委員和社區夥伴一同參與的項目。\n- **交通與停車提醒**：說明指定路段臨時停車時段、機車停放位置與禁止停車處，並提供家長邀請單、節目單和交通指引原圖。\n- **家長觀賽準備**：整理日期、地點、建議用品與出發前提醒，讓家庭可以先安排觀賽時間與路線。\n\n## 適合的情境\n\n運動會前，導師可把同一個網址傳給家長，減少賽程、集合時間和停車位置散落在不同訊息裡；學生可先找到自己年級的表演或競賽；科任教師與行政同仁則能依分類核對活動時段和現場支援資訊。網站是石門國小本次活動的公開資訊入口，時程或交通若有異動，請以學校最新公告與當日現場廣播為準。`,
  url: TOOL_URL,
  icon: 'CalendarCheck',
  category: 'interactive',
  previewUrl: `/previews/tool_${ID}.webp`,
  ogPreviewUrl: `/previews/og/tool_${ID}.webp`,
  tags: [
    '石門國小',
    '115學年度',
    '運動會網站',
    '運動會賽程',
    '競賽資訊',
    '親子觀賽',
    '交通停車',
    '家長邀請單',
    '班際接力',
    '校園活動',
  ],
  audienceFit: {
    audiences: ['teacher', 'student'],
    schoolLevels: ['elementary'],
    teacherRoles: ['homeroom', 'subject', 'admin'],
    departments: ['academic', 'student-affairs', 'general-affairs', 'other'],
    painPoints: ['event-management', 'communication', 'resource-discovery', 'administration'],
    priority: 82,
    reasons: {
      teacher:
        '賽程、活動亮點、家長邀請單和停車指引集中在同一個網址，運動會前轉傳一次，師生與家庭就能各自查到所需資訊。',
      student:
        '先依表演、團體競賽、徑賽或典禮找到活動時間，也能預先認識班際接力和年級表演，和家人約好到場加油。',
      homeroom:
        '導師可將家長邀請單、節目單與交通提醒轉到班級群組，讓家長在出門前確認日期、觀賽時段和停車限制。',
      subject:
        '科任教師能依賽程分類核對表演與比賽時間，安排觀賽、帶隊或場邊支援，也方便學生事前找到自己參與的項目。',
      admin:
        '行政同仁可用單一公開頁面同步活動流程、家長資訊和交通安排，活動若調整也有清楚入口可供重新公告。',
      academic:
        '教務與課程承辦可快速查閱年級表演及競賽安排，對照當日時段並協助師生掌握活動流程。',
      'student-affairs':
        '學務與活動承辦可集中提供開閉幕、競賽流程及家長觀賽資訊，降低活動前各班反覆詢問與轉述落差。',
      'general-affairs':
        '總務與場務同仁可直接核對指定臨停路段、機車停放提醒和禁止停車位置，方便轉達交通引導安排。',
      other:
        '資訊組與跨處室支援人員可用同一頁核對活動節點、賽程分類和家長指引，方便活動前協作及現場交接。',
    },
  },
  addedAt: '2026-10-12T00:00:00+08:00',
};

async function capturePreview() {
  mkdirSync(PREVIEW_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 1280 },
      deviceScaleFactor: 2,
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
