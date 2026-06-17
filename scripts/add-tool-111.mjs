#!/usr/bin/env node
/**
 * 新增工具 #111：狼人殺冠軍賽
 * 1. Playwright 擷取網站畫面，輸出 1024x1024 webp 預覽圖
 * 2. 寫入 client/public/api/tools.json 與 server/data/tools.json
 * 3. OG 圖由 scripts/generate-unified-og.mjs 111 產生
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TOOLS_CLIENT = resolve(ROOT, 'client', 'public', 'api', 'tools.json');
const TOOLS_SERVER = resolve(ROOT, 'server', 'data', 'tools.json');
const PREVIEWS_DIR = resolve(ROOT, 'client', 'public', 'previews');

const ID = 111;
const URL = 'https://cagoooo.github.io/smes-werewolf-rules/';

const tool = {
  id: ID,
  title: '狼人殺冠軍賽',
  description:
    '把狼人殺變成一場有規則、有賽程、有主持節奏的班級冠軍賽，讓學生在推理、辯論、聆聽與團隊合作中玩出高品質互動。',
  detailedDescription:
    '「狼人殺冠軍賽」是一個為班級活動、社團課與高年級口語表達練習設計的互動規則頁。它把原本容易吵成一團的狼人殺，整理成清楚的角色設定、遊戲流程、勝利條件與比賽提醒，讓主持人可以照著節奏帶場，玩家也能快速理解自己要做什麼。適合用在班級同樂、畢業前活動、社團競賽或營隊破冰，重點不只是玩遊戲，而是讓學生練習觀察線索、組織理由、說服同伴、辨識發言漏洞，並在安全的遊戲框架裡練習合作與表達。網站採純前端部署，打開就能投影使用，也能直接分享給學生賽前閱讀規則。',
  url: URL,
  icon: 'Gamepad2',
  category: 'interactive',
  previewUrl: `/previews/tool_${ID}.webp`,
  ogPreviewUrl: `/previews/og/tool_${ID}.webp`,
  tags: [
    '狼人殺',
    '冠軍賽',
    '推理遊戲',
    '班級活動',
    '口語表達',
    '邏輯推理',
    '團隊合作',
    '角色扮演',
    '桌遊化學習',
    '高年級活動',
    '互動遊戲',
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
    const tool100Index = tools.findIndex((item) => item.id === 100);
    if (tool100Index === -1) tools.push(tool);
    else tools.splice(tool100Index, 0, tool);
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
