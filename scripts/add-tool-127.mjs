#!/usr/bin/env node

/** 新增工具 #127：桃園市AI素養爭霸賽 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const ID = 127;
const TOOL_URL = 'https://cagoooo.github.io/ai115-shimen-prep/';
const TOOLS_SERVER = resolve(ROOT, 'server', 'data', 'tools.json');
const PREVIEW_DIR = resolve(ROOT, 'client', 'public', 'previews');
const PREVIEW_PATH = resolve(PREVIEW_DIR, `tool_${ID}.webp`);

const tool = {
  id: ID,
  audienceFit: {
    audiences: ['teacher', 'student'],
    schoolLevels: ['elementary'],
    teacherRoles: ['homeroom', 'subject', 'admin'],
    departments: ['academic', 'student-affairs', 'other'],
    painPoints: [
      'student-practice',
      'digital-literacy',
      'event-management',
      'resource-discovery',
      'teacher-workload',
      'creative-learning',
    ],
    priority: 90,
    reasons: {
      teacher:
        '把 AI 素養競賽最容易散落的報名、版本、規則、練習與比賽日資訊收在同一站，老師可以先抓住合法參賽與練習節奏，再依學生狀態安排資料蒐集、模型訓練與模擬上傳。',
      student:
        '不用先讀完厚厚的競賽文件，依「看懂遊戲→蒐集資料→訓練模型→測試推論→迭代修正→匯出上傳」六站練習，搭配小測驗與出發前清單，逐步把 AI 魷魚練到能自己做決定。',
      homeroom:
        '導師可用隊伍分工、報名期限、身分證明、比賽日行程與兩人交換角色建議，協助學生把「誰觀察、誰操作、何時交換」說清楚，降低活動前反覆問答與臨場慌亂。',
      subject:
        '資訊或自然科教師可直接拿六站 AI 循環、監督式學習、資料代表性與模型測試當課堂討論骨架，讓學生從遊戲操作延伸到資料、模型、程式與結果的完整推理。',
      admin:
        '教務、學務或資訊承辦可快速確認報名入口、指定軟體版本、組隊規則、檔案限制與比賽日流程，並把官方公告、教材、影片與下載入口集中轉給指導教師。',
      academic:
        '教務處辦理競賽報名、校內培訓或課程融入時，可把備戰站當成共同進度表：先完成報名與環境確認，再安排資料蒐集、訓練、測試和兩小時模擬。',
      'student-affairs':
        '學務處協助學生參賽與活動安全安排時，可查到報到、身分證明、設備、到場時間、雙敗淘汰與禁止事項，將學生管理與競賽提醒放在同一個入口。',
      other:
        '資訊組、資優或彈性課程承辦可用這站做跨單位交接：版本、地圖、檔案命名、容量限制和官方資源都有可直接核對的文字，不必各自整理一份不同版本。',
    },
  },
  title: '桃園市AI素養爭霸賽',
  description:
    '把桃園市 115 年度 AI 素養爭霸賽的報名、版本、規則與練習拆成一條備戰路線：從 PAIA 3.3.5、魷來魷去 1.7.5 與地圖 12，到資料蒐集、監督式學習、模型測試、上傳檢查與比賽日分工，學生和指導教師打開就能開始。',
  detailedDescription: `這是一個為桃園市 115 年度總統盃 AI 素養爭霸賽整理的互動式備戰站，將報名、指定版本、競賽規則、練習路線、比賽日流程與官方資源放在同一個入口。網站目前以桃園市龍潭區石門國民小學六年級選手的準備情境為主，但把學生、指導教師、學校承辦與教學現場真正會遇到的問題拆開寫清楚；日期與規則仍應以桃園市及全國競賽官方最新公告為準。

## 主要功能

- **先做什麼的行動清單**：把組隊、報名、安裝指定版本與第一次從零練習列成四個今天就能完成的步驟，並提醒兩位學生要輪流擔任資料觀察員與程式測試員。
- **比賽規格集中整理**：清楚標出 PAIA Desktop 3.3.5、魷來魷去對戰版 1.7.5、正式賽地圖 12、監督式學習與兩小時現場訓練，避免練錯版本或把表演賽玩法當成正式賽答案。
- **六站 AI 練習循環**：依序走過看懂遊戲、蒐集資料、訓練模型、測試推論、迭代修正、匯出上傳，讓學生知道問題可能出在資料、模型、程式、檔案或檢測，而不是只看最後分數。
- **從今天到比賽日的航線**：以每天 30～60 分鐘的練習節奏，安排觀察地圖、累積有代表性的樣本、比較候選模型與兩小時模擬，教師可依隊伍進度調整。
- **規則紅線與出發前清單**：提醒不可載入賽前資料、模型或程式、不可用硬編碼規則直接下指令，並核對 ml_play.py、模型檔、20 MB 限制、身分證明與報到時間。
- **互動複習與官方資源**：頁面內建四題快速測驗、完成勾選的 READY CHECK，以及桃園市官方入口、教育部遊戲說明、教材、PAIA 登入、下載與影片課程連結。

## 適合的教學情境

教師可以先用投影帶全班看一局「魷來魷去」，再停在資料、訓練、測試三個節點問學生：「這個樣本以前出現過嗎？」「這次只改了哪一件事？」「模型真的載入了嗎？」學生則能把兩人分工、交換角色與每次測試結果寫成自己的練習紀錄。對學校承辦而言，網站也是一份可轉交的賽前核對表：報名入口、版本、檔名、容量與比賽日流程都不用再從群組訊息拼回來。

## 技術特色

網站以響應式靜態頁面部署於 GitHub Pages，導覽列可跳到「先做什麼、比什麼、怎麼練、規則紅線、比賽日、官方資源」六大區段；倒數、快速測驗與 READY CHECK 讓閱讀變成可操作的準備流程，勾選進度也保存在瀏覽器本機。它不替選手代做競賽作品，而是把資料、模型、程式、檔案與規則之間的關係說清楚，提醒使用者在正式活動前回到官方公告核對最新資訊。`,
  url: TOOL_URL,
  icon: 'Trophy',
  category: 'teaching',
  previewUrl: `/previews/tool_${ID}.webp`,
  ogPreviewUrl: `/previews/og/tool_${ID}.webp`,
  tags: [
    'AI素養',
    'AI競賽',
    'PAIA',
    '魷來魷去',
    '監督式學習',
    '資料蒐集',
    '模型訓練',
    '國小資訊',
    '賽事準備',
    '報名指引',
    '練習路線',
    '桃園市',
  ],
  addedAt: '2026-09-14T00:00:00+08:00',
};

function writeTool() {
  const tools = JSON.parse(readFileSync(TOOLS_SERVER, 'utf8'));
  if (tools.some((item) => item.id === ID)) {
    throw new Error(`#${ID} 已存在，為避免覆蓋既有工具而停止。`);
  }
  const insertIdx = tools.findIndex((item) => item.id > ID);
  if (insertIdx === -1) tools.push(tool);
  else tools.splice(insertIdx, 0, tool);
  writeFileSync(TOOLS_SERVER, `${JSON.stringify(tools, null, 2)}\n`, 'utf8');
}

async function capturePreview() {
  mkdirSync(PREVIEW_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 1280 },
      deviceScaleFactor: 2,
    });
    await context.addInitScript(() => {
      [
        'tyc_tut_done',
        'tyc_known_version',
        'tyc_nokey_collapsed',
        'tyc_notify',
        'tour_complete',
        'onboarding_done',
        'hasSeenTour',
        'tutorial_dismissed',
        'cookie_accepted',
        'announcement_dismissed',
        'welcome_shown',
        'akai_onboarded_v1',
        'akai_install_dismissed',
      ].forEach((key) => localStorage.setItem(key, '1'));
    });
    const page = await context.newPage();
    await page.goto(`${TOOL_URL}?codex_capture=127`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2500);
    await page.evaluate(() => {
      [
        '.driver-popover',
        '.driver-overlay',
        '.driver-active-element',
        '.shepherd-element',
        '.shepherd-modal-overlay-container',
        '.introjs-overlay',
        '.introjs-helperLayer',
        '.introjs-tooltipReferenceLayer',
        '#sw-update-toast',
        '#updateBanner',
        '#cookieBanner',
        '#announcement',
        '[class*="cookie-banner"]',
        '[class*="cookie-consent"]',
        '[class*="onboard"]',
        '[class*="tutorial"]',
        '[class*="tour-tooltip"]',
      ].forEach((selector) => {
        document.querySelectorAll(selector).forEach((element) => element.remove());
      });
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(500);
    const image = await page.screenshot({ type: 'png', fullPage: false });
    await sharp(image)
      .resize(1024, 1024, { fit: 'cover', position: 'top' })
      .webp({ quality: 88 })
      .toFile(PREVIEW_PATH);
    console.log(`📸 目標網站：${await page.title()} / ${await page.locator('h1').first().innerText()}`);
  } finally {
    await browser.close();
  }
}

console.log(`🚀 開始新增 #${ID} ${tool.title}`);
await capturePreview();
console.log(`📸 卡片主圖已保存：${PREVIEW_PATH}`);
writeTool();
console.log(`✅ server/data/tools.json 已寫入 #${ID}，請接著執行 npm run sync-tools-json`);
