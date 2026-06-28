#!/usr/bin/env node
/**
 * 新增工具 #113：PaGamO 素養教材班級授權填報
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

const ID = 113;
const URL = 'https://github.com/cagoooo/PaGamO';

const tool = {
  id: ID,
  title: 'PaGamO 素養教材班級授權填報',
  description:
    '專為學校行政與導師設計 of PaGamO 素養教材授權填報系統。簡化繁瑣的班級名單與授權核對流程，一鍵填報、即時彙整，大幅提升行政作業效率，讓素養學習推廣更輕鬆！',
  detailedDescription:
    '「PaGamO 素養教材班級授權填報」是專為中小學推廣 PaGamO 素養教材所開發的行政輔助平台。在過往，學校行政人員與各班導師在核對學生名單、確認授權狀態以及進行統一填報時，常面臨資料凌亂、重複核對等耗時問題。本工具提供直覺的填報介面與即時彙整功能，導師能迅速填寫班級的授權需求，系統則自動彙整並進行格式檢查，確保填報資料百分之百正確。平台採用輕量化純前端設計，無痛整合學校現有行政流程，並支援與 Excel 格式互轉，讓行政人員在匯出與提報至 PaGamO 官方時能一鍵完成。免費、免安裝且支援跨裝置，是學校落實數位行政轉型、推動科技輔助自主學習的最佳行政利器。',
  url: URL,
  icon: 'ClipboardCheck',
  category: 'utilities',
  previewUrl: `/previews/tool_${ID}.webp`,
  ogPreviewUrl: `/previews/og/tool_${ID}.webp`,
  tags: [
    'PaGamO',
    '素養教材',
    '授權填報',
    '行政工具',
    '國小教育',
    '石門國小',
    '班級管理',
    '表單統計',
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
