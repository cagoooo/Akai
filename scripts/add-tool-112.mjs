#!/usr/bin/env node
/**
 * 新增工具 #112：皮卡丘天空大冒險
 * 1. Playwright 擷取網站畫面，輸出 1024x1024 webp 預覽圖
 * 2. 寫入 client/public/api/tools.json 與 server/data/tools.json
 * 3. OG 圖由 scripts/generate-unified-og.mjs 112 產生
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TOOLS_CLIENT = resolve(ROOT, 'client', 'public', 'api', 'tools.json');
const TOOLS_SERVER = resolve(ROOT, 'server', 'data', 'tools.json');
const PREVIEWS_DIR = resolve(ROOT, 'client', 'public', 'previews');

const ID = 112;
const URL = 'https://cagoooo.github.io/pikachu-flappy-bird/';

const tool = {
  id: ID,
  title: '皮卡丘天空大冒險',
  description:
    '精緻好玩的皮卡丘天空冒險遊戲！結合 Flappy Bird 經典玩法，在躲避障礙的過程中鍛鍊專注力與手眼協調，非常適合用於課堂破冰、班級競賽或下課休閒。',
  detailedDescription:
    '「皮卡丘天空大冒險」是一款專為國小學生設計的網頁趣味遊戲，改編自經典的 Flappy Bird 玩法。學生將控制皮卡丘在天空中飛翔，避開重重障礙物以獲得高分。遊戲不僅畫面生動可愛，還能有效鍛鍊學生的手眼協調能力、專注力與挫折容容度。教師可以將這款遊戲應用於資訊課的「滑鼠/鍵盤點擊練習」、班級課間的「破冰與專注力訓練」，或是作為班級活動的「限時分數挑戰賽」，激發學生的榮譽感與互動樂趣。網站採純前端 HTML5 設計，免安裝且支援各類載具，適合在電子白板或學生載具上即時投影與遊玩。',
  url: URL,
  icon: 'Gamepad2',
  category: 'games',
  previewUrl: `/previews/tool_${ID}.webp`,
  ogPreviewUrl: `/previews/og/tool_${ID}.webp`,
  tags: [
    '皮卡丘',
    'Flappy Bird',
    '飛翔的小鳥',
    '天空冒險',
    '網頁遊戲',
    '班級活動',
    '趣味競賽',
    '互動遊戲',
    '專注力訓練',
    '休閒遊戲',
    '國小教育',
    '石門國小',
  ],
  addedAt: new Date().toISOString(),
};

async function screenshot(outPath) {
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    try {
      ({ chromium } = await import('@playwright/test'));
    } catch {
      console.log('找不到 Playwright，略過預覽圖擷取。');
      return false;
    }
  }

  const sharp = (await import('sharp')).default;
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
      ].forEach((key) => {
        try {
          localStorage.setItem(key, '1');
        } catch {}
      });
    });

    const page = await context.newPage();
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(3500);
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
        '#updateBanner',
        '#cookieBanner',
        '#announcement',
        '[class*="cookie-banner"]',
        '[class*="cookie-consent"]',
        '[class*="onboard"]',
        '[class*="tutorial"]',
        '[class*="tour-tooltip"]',
        '.akai-ob-bg',
        '.akai-ob-modal',
        '[class*="akai-ob-"]',
      ].forEach((selector) => {
        document.querySelectorAll(selector).forEach((element) => element.remove());
      });
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(400);

    const buffer = await page.screenshot({ type: 'png', fullPage: false });
    await sharp(buffer)
      .resize(1024, 1024, { fit: 'cover', position: 'top' })
      .webp({ quality: 88 })
      .toFile(outPath);
    console.log('已產生預覽圖：', outPath);
    return true;
  } catch (error) {
    console.warn('預覽圖擷取失敗：', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

function writeJson(path) {
  if (!existsSync(path)) {
    console.log('找不到資料檔，略過：', path);
    return;
  }

  const tools = JSON.parse(readFileSync(path, 'utf-8'));
  const existingIndex = tools.findIndex((item) => item.id === ID);
  if (existingIndex >= 0) {
    tools[existingIndex] = tool;
    console.log(`已更新 #${ID}：`, path);
  } else {
    // 依 ID 升序插入
    const insertIdx = tools.findIndex((item) => item.id > ID);
    if (insertIdx === -1) {
      tools.push(tool);
    } else {
      tools.splice(insertIdx, 0, tool);
    }
    console.log(`已新增 #${ID}：`, path);
  }

  writeFileSync(path, JSON.stringify(tools, null, 2) + '\n', 'utf-8');
}

if (!existsSync(PREVIEWS_DIR)) mkdirSync(PREVIEWS_DIR, { recursive: true });
const previewPath = resolve(PREVIEWS_DIR, `tool_${ID}.webp`);
const ok = await screenshot(previewPath);
tool.previewUrl = ok ? `/previews/tool_${ID}.webp` : '';
writeJson(TOOLS_CLIENT);
writeJson(TOOLS_SERVER);
console.log(`完成 #${ID} ${tool.title}`);
