#!/usr/bin/env node

/** 新增工具 #133：AI 數位教學實務工作坊互動簡報。 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const ID = 133;
const TOOL_URL = 'https://cagoooo.github.io/ccu-ai-workshop/';
const TOOLS_SERVER = resolve(ROOT, 'server', 'data', 'tools.json');
const TOOLS_CLIENT = resolve(ROOT, 'client', 'public', 'api', 'tools.json');
const PREVIEW_DIR = resolve(ROOT, 'client', 'public', 'previews');
const PREVIEW_PATH = resolve(PREVIEW_DIR, `tool_${ID}.webp`);

const tool = {
  id: ID,
  title: '一張課本照片，長出一整套 AI 教學｜AI 數位教學實務工作坊',
  description:
    '國立中正大學師資培育中心 2026-11-13 工作坊的互動簡報：用 Gemini Notebook 從一張課本照片備出整套教材，再做教學駕駛艙與概念動畫；學員用手機即時參與文字雲、投票、聊天彈幕，還能跟著講師同步翻頁。',
  detailedDescription: `這是阿凱老師為國立中正大學師資培育中心「AI 數位教學實務工作坊」（2026-11-13，教育學院一館 501）準備的線上互動簡報，共 67 頁，以教學應用為主、行政協助為輔。

## 課程內容

- **上午場（10:00–12:00）**：模組一談 AI 備課心法與「老師保留的三件事」（教學目標、專業判斷、師生關係）；模組二示範把一張課本照片交給 Gemini Notebook（原 NotebookLM），先給 AI 一份「助教守則」，再長出互動報告、心智圖、學習卡、資訊圖表與測驗，最後是實作①與查核清單。
- **下午場（13:00–16:00）**：教學駕駛艙的做法與真實案例（含資優課程駕駛艙「石門智繪客」）、師培生版 7 步、用 Gemini Canvas 實作駕駛艙；動畫簡報工作流與「圓面積」現場示範；找出 AI 的錯誤與查核四步驟；全域守則、AI 的三個角色與蘇格拉底對話示範；學生使用倫理、行政協助與個資紅線。

## 互動設計（學員用手機掃 QR Code 參與）

- **即時文字雲與投票**：開場與課尾各一題文字雲、課前調查與上午小結各一題投票，結果即時出現在大螢幕。
- **右下角即時聊天室**：學員可發言或一鍵送 👍❤️👏😮🤔❓，留言會變成彈幕飛過簡報，表情帶名牌從角落飄起；講者可在大螢幕隱藏個別訊息，並以管理密碼一鍵清除（密碼由 Firebase 登入系統保管，不寫在網頁程式裡）。
- **跟上簡報（跟隨模式）**：學員從互動頁一鍵開啟簡報，跟著講台即時翻頁；自己翻頁會暫停跟隨，按一下就回到講者那一頁。
- **開場影片**：開場片頭與上、下午場宣傳片會在對應頁自動播放，口白是事先用阿凱老師的克隆聲音（Fish Audio）生成。

## 技術做法

Reveal.js 簡報搭配 GSAP 動畫，互動資料存在 Firebase Firestore（學員端只能新增，不能修改或刪除），部署在 GitHub Pages，並有淺色／深色切換與新版本提示。網站本身不呼叫 AI 模型，簡報內容是教老師如何使用 Gemini Notebook、Gemini Canvas 等工具。`,
  url: TOOL_URL,
  icon: 'Rocket',
  category: 'teaching',
  previewUrl: `/previews/tool_${ID}.webp`,
  ogPreviewUrl: `/previews/og/tool_${ID}.webp`,
  tags: [
    'AI 數位教學',
    '師培研習',
    '互動簡報',
    'Gemini Notebook',
    'Gemini Canvas',
    '教學駕駛艙',
    'AI 備課',
    '即時文字雲',
    '即時投票',
    '彈幕聊天室',
    '跟隨模式',
    'Reveal.js',
  ],
  audienceFit: {
    audiences: ['teacher'],
    teacherRoles: ['homeroom', 'subject', 'admin'],
    painPoints: ['professional-learning', 'lesson-planning', 'presentation', 'digital-literacy', 'content-creation'],
    priority: 80,
    reasons: {
      teacher:
        '一份完整的 AI 備課研習簡報：從一張課本照片用 Gemini Notebook 長出整套教材，到教學駕駛艙、概念動畫與找出 AI 的錯誤，可以照著頁面自學，也能當成自己辦研習的範本。',
      homeroom:
        '導師可參考上午場的流程，把一個單元的課本頁做成互動報告、學習卡與測驗；「老師保留的三件事」與查核清單，提醒 AI 產出仍要由老師把關。',
      subject:
        '科任與專任老師可參考下午場的教學駕駛艙與動畫簡報工作流，把同一門課整理成學生可自學的網址；學科適配頁說明哪些科目、哪些頁值得做動畫。',
      admin:
        '負責教師研習的行政同仁（例如資訊組、教學組）可把這份簡報當成辦 AI 研習的範本：即時文字雲、投票、聊天彈幕與學員跟隨翻頁都能直接示範，也附有行政協助與個資紅線的頁面。',
    },
  },
  addedAt: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
};

async function capturePreview() {
  mkdirSync(PREVIEW_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 1280 }, deviceScaleFactor: 2 });
    const page = await context.newPage();
    // 直接到封面頁（第 0、1 頁是自動播放影片）；Firestore 長連線不會 networkidle，改用 domcontentloaded＋固定等待
    await page.goto(`${TOOL_URL}?capture=${ID}#/2`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.locator('.reveal .slides section.present h1').first().waitFor({ state: 'visible', timeout: 30000 });
    await page.waitForTimeout(3500);
    await page.evaluate(() => {
      ['#sw-update-bar', '#theme-btn', '.cw-toasts', '.cw-danmaku'].forEach((s) => document.querySelectorAll(s).forEach((el) => el.remove()));
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(300);
    const image = await page.screenshot({ type: 'png', fullPage: false });
    await sharp(image).resize(1024, 1024, { fit: 'cover', position: 'centre' }).webp({ quality: 88 }).toFile(PREVIEW_PATH);
    console.log(`📸 目標網站：${await page.title()} / ${(await page.locator('.reveal .slides section.present h1').first().innerText()).trim()}`);
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
if (!process.argv.includes('--data-only')) {
  await capturePreview();
  console.log(`📸 卡片預覽已保存：${PREVIEW_PATH}`);
}
if (!process.argv.includes('--image-only')) {
  writeTool();
  console.log(`#${ID} 已寫入 server/data/tools.json；接著執行 npm run sync-tools-json。`);
}
