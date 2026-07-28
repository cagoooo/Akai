#!/usr/bin/env node
/** 新增工具 #122：兒童英語單字大冒險 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const ID = 122;
const URL = 'https://cagoooo.github.io/Word-Wiz-Kids/#/';
const TOOLS_SERVER = resolve(ROOT, 'server', 'data', 'tools.json');
const TOOLS_CLIENT = resolve(ROOT, 'client', 'public', 'api', 'tools.json');
const PREVIEW_DIR = resolve(ROOT, 'client', 'public', 'previews');
const PREVIEW_PATH = resolve(PREVIEW_DIR, `tool_${ID}.webp`);

const tool = {
  id: ID,
  audienceFit: {
    audiences: ['teacher', 'student'],
    schoolLevels: ['elementary', 'junior'],
    // 不限制 departments：一旦指定 departments，推薦引擎只會把工具給「行政人員 + 該處室」，
    // 導師與科任老師會被整個排除（見 audienceRecommendation.isEligible）。
    teacherRoles: ['homeroom', 'subject', 'admin'],
    painPoints: [
      'language-learning',
      'student-practice',
      'assessment',
      'classroom-management',
      'content-creation',
      'digital-literacy',
    ],
    priority: 92,
    reasons: {
      teacher:
        '拍一張課本單字頁，AI 就自動整理出單字、KK 音標與中文，再一鍵變成全班可玩的單字對戰，備課與課堂活動一次解決。',
      student:
        '單字卡會用純正美音朗讀（還有慢速鍵），答對累積經驗值升等、解鎖徽章與連續打卡，背單字變成一場闖關冒險。',
      homeroom:
        '晨光時間或英語課後複習可開「全班對戰」房間，學生輸入 4 位數 PIN 就能加入，全班同時搶答並看即時排行榜。',
      subject:
        '英語專任老師可用 CSV 一次匯入整冊單字庫，依單元切換題庫，並用聽力測驗與錯題本追蹤學生真正的弱點。',
      admin: '可作為英語單字競賽、闖關活動與課後扶助的現成平台，免安裝、免帳號，用瀏覽器就能舉辦全校性單字挑戰。',
      academic:
        '教務處推動雙語／英語教學時，可直接拿來辦單字王比賽或課後補救教學，排行榜與成就徽章提供現成的獎勵機制。',
    },
  },
  title: '兒童英語單字大冒險',
  description:
    '專為國小孩子打造的魔法英語單字學習平台！AI 拍照自動辨識課本單字、真人美音朗讀、Kahoot 風格全班對戰與等級成就系統，讓背單字變成一場冒險。',
  detailedDescription: `「兒童英語單字大冒險」（Word-Wiz-Kids）是一套為國小英語課量身打造的單字學習與競賽平台。老師只要拍下課本或字卡，Gemini 2.5 Flash Lite 視覺 AI 就會自動抽出英文單字、繁體中文解釋、KK 音標與詞性；學生端則透過會朗讀的單字卡、聽力測驗、錯題本與全班即時對戰，把「背單字」變成一場可以升等、解鎖徽章的冒險。

## 主要功能與亮點

- **AI 拍照識字（PhotoScan）**：上傳課本頁面或自製字卡照片，Gemini 2.5 Flash Lite 自動辨識並整理成單字 + 中文 + KK 音標 + 詞性，省下逐字打字建題庫的時間。
- **真人美音與慢速朗讀**：單字卡整合 Web Speech TTS，一鍵播放純正美語發音，另有慢速朗讀（🐢）按鈕讓孩子聽清每一個音節。
- **全班即時對戰（Arena）**：老師開房產生 4 位數 PIN 碼投影在螢幕上，學生用手機或平板輸入 PIN 即可加入，Kahoot 風格搶答並顯示即時積分。
- **聽力測驗與錯題本**：ListenQuiz 只播發音讓學生選出正確單字；答錯的單字自動進入錯題本，複習時直接針對弱點加強。
- **等級 EXP、連續打卡與 8 款成就徽章**：從「初露鋒芒」「持之以恆」到「滿分戰神」「魔法學者」，用遊戲化機制維持每日學習動機。
- **教師端 CSV 批次匯入／匯出**：提供「國小英文單字庫匯入範本.csv」，可一次匯入整冊單字，也能一鍵匯出備份，方便跨班共用題庫。
- **Firebase 雲端排行榜**：學習成果與遊戲得分即時同步雲端，跨裝置也看得到班級與個人排名。
- **免安裝 PWA**：Chromebook、iPad、手機與電腦開瀏覽器就能用，支援離線快取與新版自動更新通知。`,
  url: URL,
  icon: 'Wand2',
  category: 'language',
  previewUrl: `/previews/tool_${ID}.webp`,
  ogPreviewUrl: `/previews/og/tool_${ID}.webp`,
  tags: [
    '英語單字',
    '英語學習',
    'KK音標',
    'AI拍照辨識',
    '單字卡',
    '全班對戰',
    '聽力測驗',
    '錯題本',
    '遊戲化學習',
    '排行榜',
    '國小英語',
    '石門國小',
  ],
  addedAt: '2026-07-28T02:00:00.000Z',
};

function writeToolFile(targetPath) {
  const tools = JSON.parse(readFileSync(targetPath, 'utf8'));
  const current = tools.findIndex((item) => item.id === ID);
  if (current >= 0) tools[current] = tool;
  else {
    const insertIdx = tools.findIndex((t) => t.id > tool.id);
    if (insertIdx === -1) tools.push(tool);
    else tools.splice(insertIdx, 0, tool);
  }
  writeFileSync(targetPath, `${JSON.stringify(tools, null, 2)}\n`, 'utf8');
}

async function capturePreview() {
  if (!existsSync(PREVIEW_DIR)) mkdirSync(PREVIEW_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 1280 },
      deviceScaleFactor: 2,
    });
    await context.addInitScript(() => {
      const keys = [
        'tour_complete',
        'onboarding_done',
        'hasSeenTour',
        'tutorial_dismissed',
        'welcome_shown',
        'akai_onboarded_v1',
      ];
      keys.forEach((k) => localStorage.setItem(k, '1'));
    });
    const page = await context.newPage();
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(6000);
    await page.evaluate(() => {
      const selectors = [
        '.driver-popover',
        '.driver-overlay',
        '.shepherd-element',
        '.shepherd-modal-overlay-container',
        '#updateBanner',
        '[class*="cookie-banner"]',
        '[class*="onboard"]',
        '[class*="tutorial"]',
      ];
      selectors.forEach((s) => document.querySelectorAll(s).forEach((el) => el.remove()));
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(800);
    const image = await page.screenshot({ type: 'png', fullPage: false });
    await sharp(image)
      .resize(1024, 1024, { fit: 'cover', position: 'top' })
      .webp({ quality: 90 })
      .toFile(PREVIEW_PATH);
  } finally {
    await browser.close();
  }
}

console.log('🚀 開始截圖並生成卡片主圖...');
await capturePreview();
console.log('📸 預覽圖已保存至:', PREVIEW_PATH);

writeToolFile(TOOLS_SERVER);
writeToolFile(TOOLS_CLIENT);
console.log(`✅ 已完成新增 #${ID} ${tool.title} 到前後端 tools.json`);
