#!/usr/bin/env node
/**
 * 一次性 script：新增工具 #99「考試卷生圖 Studio」
 * 流程：Playwright 截圖 → 寫 tools.json (client + server) → spawn generate-unified-og.mjs
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TOOLS_JSON_CLIENT = resolve(ROOT, 'client', 'public', 'api', 'tools.json');
const TOOLS_JSON_SERVER = resolve(ROOT, 'server', 'data', 'tools.json');
const PREVIEWS_DIR = resolve(ROOT, 'client', 'public', 'previews');
const PREVIEW_OUT = resolve(PREVIEWS_DIR, 'tool_99.webp');

const NEW_TOOL = {
  id: 99,
  title: '考試卷生圖 Studio — AI 黑白線稿插圖生成',
  description:
    '備課時想加一張剛剛好的學習單插畫？輸入四個欄位（標題、對話、角色、場景），10–20 秒生成兩張 1024×1024 黑白線稿 PNG，列印不吃墨水、可當著色頁、支援中文精準渲染。內建 4 組教學情境範例 + AI Prompt 可複製轉用 ChatGPT / Bing。',
  detailedDescription:
    '「考試卷生圖 Studio」是阿凱老師為國小教師打造的 AI 插圖快速生成工具，專門解決「試卷需要插圖但找不到合適免費圖、又不想付錢買圖庫」的備課痛點。\n\n核心特色：\n• 🎨 **純黑白線稿風格** — 1024×1024 PNG，列印超省墨水（校園黑白印表機友善）\n• 📝 **四欄位精準描述** — T 標題（大寫粗體）/ D 對話內容（氣泡）/ C 角色描述（必填）/ S 背景場景\n• 🤖 **OpenAI gpt-image-2 模型** — 中文精準渲染 ✓，每次一鍵生成 2 張任挑\n• 📚 **4 組教學範例** — 點「↑ 載入」直接套用情境題、英文對話、科學觀察、農場場景等預設\n• 🔁 **Prompt 可複製轉用** — 不滿意可把 AI Prompt 複製到 ChatGPT / Bing Image Creator 換引擎再試\n• 🎯 **學生著色頁友善** — 線稿正好給孩子塗色，「考試插圖」秒變「課後著色教具」\n• 💰 **每日免費 5 次（10 張）** — 適合每天備一張試卷的節奏\n\n設計理念：黑板 × 工作室主題，仿教室佈告欄風格，跟阿凱其他教學工具視覺一致。生成的圖可直接拖進 Word / Google 文件 / Canva 試卷編排版面，無浮水印、可商用於校內教學。\n\n適合情境：英語對話題（兩個小孩在公園聊天）、社會課情境題（市場買賣、博物館參觀）、自然觀察題（昆蟲、植物、實驗器材）、數學應用題的「看圖列式」、生活課的角色扮演對話框、注音識字練習配圖、繪本式作業單等。完全免費、無註冊、無浮水印，純線稿格式上 PowerPoint / Keynote / Canva 都能直接著色換色變主題色。',
  url: 'https://cagoooo.github.io/picture-master/',
  icon: 'Palette',
  category: 'teaching',
  previewUrl: '/previews/tool_99.webp',
  ogPreviewUrl: '/previews/og/tool_99.webp',
  tags: [
    '試卷插圖',
    '學習單插畫',
    'AI 線稿生成',
    '黑白線稿',
    '著色頁',
    '備課工具',
    'OpenAI gpt-image',
    '中文精準渲染',
    '列印省墨',
    '免登入',
    'PNG 下載',
    '教學情境題',
  ],
  addedAt: new Date().toISOString(),
};

async function screenshotUrl(url, outPath) {
  console.log(`📸 用 Playwright 截圖 ${url}…`);
  const { chromium } = await import('playwright');
  const sharp = (await import('sharp')).default;

  const browser = await chromium.launch({ headless: true });
  try {
    const ctx = await browser.newContext({
      viewport: { width: 1280, height: 1280 },
      deviceScaleFactor: 2,
    });
    await ctx.addInitScript(() => {
      try {
        const dismissKeys = [
          'tyc_tut_done', 'tyc_known_version', 'tyc_nokey_collapsed', 'tyc_notify',
          'tour_complete', 'onboarding_done', 'hasSeenTour', 'tutorial_dismissed',
          'cookie_accepted', 'announcement_dismissed', 'welcome_shown',
          'akai_onboarded_v1', 'akai_install_dismissed',
          // picture-master 慣用 key
          'pm_intro_done', 'pm_onboarded',
        ];
        dismissKeys.forEach((k) => localStorage.setItem(k, '1'));
      } catch (e) {}
    });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForLoadState('load', { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(3500);
    await page.evaluate(() => {
      const selectors = [
        '.driver-popover', '.driver-overlay', '.driver-active-element',
        '.shepherd-element', '.shepherd-modal-overlay-container',
        '.introjs-overlay', '.introjs-helperLayer', '.introjs-tooltipReferenceLayer',
        '#updateBanner', '#cookieBanner', '#announcement',
        '[class*="cookie-banner"]', '[class*="cookie-consent"]',
        '[class*="onboard"]', '[class*="tutorial"]', '[class*="tour-tooltip"]',
        '.akai-ob-bg', '.akai-ob-modal', '[class*="akai-ob-"]',
        // picture-master modal / 引導
        '.pm-intro', '.pm-onboarding', '[class*="pm-intro"]', '[class*="pm-onboard"]',
      ];
      selectors.forEach((s) => document.querySelectorAll(s).forEach((el) => el.remove()));
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    const buf = await page.screenshot({ type: 'png', fullPage: false });
    await sharp(buf)
      .resize(1024, 1024, { fit: 'cover', position: 'top' })
      .webp({ quality: 88 })
      .toFile(outPath);
    console.log(`  ✅ 已產生 ${outPath}`);
    return true;
  } finally {
    await browser.close();
  }
}

function writeToolToJson(p, tool) {
  if (!existsSync(p)) {
    console.log(`   (略過：${p} 不存在)`);
    return;
  }
  const tools = JSON.parse(readFileSync(p, 'utf-8'));
  const existingIdx = tools.findIndex((t) => t.id === tool.id);
  if (existingIdx >= 0) {
    tools[existingIdx] = tool;
    console.log(`   🔄 覆蓋既有 ID ${tool.id} 於 ${p}`);
  } else {
    const insertIdx = tools.findIndex((t) => t.id > tool.id);
    if (insertIdx === -1) {
      tools.push(tool);
    } else {
      tools.splice(insertIdx, 0, tool);
    }
    console.log(`   ➕ 新增 ID ${tool.id} 到 ${p}（依 ID 排序插入）`);
  }
  writeFileSync(p, JSON.stringify(tools, null, 2) + '\n', 'utf-8');
}

function runUnifiedOg(toolId) {
  return new Promise((res) => {
    console.log(`\n🖼️  呼叫 generate-unified-og.mjs ${toolId}…`);
    const child = spawn(
      'node',
      [resolve(__dirname, 'generate-unified-og.mjs'), String(toolId)],
      { stdio: 'inherit' }
    );
    child.on('exit', (code) => res(code === 0));
  });
}

async function main() {
  if (!existsSync(PREVIEWS_DIR)) mkdirSync(PREVIEWS_DIR, { recursive: true });
  await screenshotUrl(NEW_TOOL.url, PREVIEW_OUT);

  writeToolToJson(TOOLS_JSON_CLIENT, NEW_TOOL);
  writeToolToJson(TOOLS_JSON_SERVER, NEW_TOOL);

  const ok = await runUnifiedOg(NEW_TOOL.id);
  if (!ok) console.warn('⚠️ OG 圖生成失敗，請手動 node scripts/generate-unified-og.mjs 99');

  console.log(`\n✨ 工具 #${NEW_TOOL.id} ${NEW_TOOL.title} 寫入完成！`);
}

main().catch((err) => {
  console.error('❌', err);
  process.exit(1);
});
