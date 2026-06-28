#!/usr/bin/env node
/**
 * 新增工具 #114：學生名單校對平台
 * 1. Playwright 擷取網站畫面，輸出 1024x1024 webp 預覽圖
 * 2. 寫入 client/public/api/tools.json 與 server/data/tools.json
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TOOLS_CLIENT = resolve(ROOT, 'client', 'public', 'api', 'tools.json');
const TOOLS_SERVER = resolve(ROOT, 'server', 'data', 'tools.json');
const PREVIEWS_DIR = resolve(ROOT, 'client', 'public', 'previews');

const ID = 114;
const URL = 'https://cagoooo.github.io/student-list-checker/';

const tool = {
  id: ID,
  title: '學生名單校對平台',
  description:
    '專為學校行政與導師設計的學生名單校對平台。一鍵匯入名單與核對檔，智慧比對學號、姓名及班級差異，自動揪出錯漏字與重疊名單，讓繁瑣的學籍核對作業變得輕鬆又精準！',
  detailedDescription:
    '「學生名單校對平台」是為了解決學校每學期初或各項活動中，最磨人的「名單核對」痛點而開發的智能比對工具。在行政作業中，將教務系統匯出的名單與導師手上的名單進行核對，經常需要人工逐字比對學號、姓名，極易因字形相似、多打空格或簡繁體差異而產生漏網之魚。本平台提供直壓的比對介面，使用者只需分別拖入或貼上兩份名單，系統即可秒級進行交叉比對，並以醒目的顏色標示出「僅在名單 A 出現」、「姓名不一致」或「學號重複」等異常資料。純前端輕量化設計，資料完全在瀏覽器本地處理，不上傳至任何雲端伺服器，百分之百保障學生個資隱私。免安裝、隨開即用，是提升學校學籍管理與行政效率的防呆神助手。',
  url: URL,
  icon: 'UserCheck',
  category: 'utilities',
  previewUrl: `/previews/tool_${ID}.webp`,
  ogPreviewUrl: `/previews/og/tool_${ID}.webp`,
  tags: [
    '名單校對',
    '學生名單',
    '行政效率',
    '名單核對',
    '國小教育',
    '石門國小',
    '班級管理',
    '防呆校對',
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
