#!/usr/bin/env node
/**
 * 非互動版：新增工具 #106「石門國小 第103屆畢業典禮」
 * 1. Playwright 截圖目標站 → 1024×1024 webp 卡片預覽圖
 * 2. 寫入 client/public/api/tools.json + server/data/tools.json（插在 #100 彩蛋之前）
 * OG 圖另跑 generate-unified-og.mjs 106。
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TOOLS_CLIENT = resolve(ROOT, 'client', 'public', 'api', 'tools.json');
const TOOLS_SERVER = resolve(ROOT, 'server', 'data', 'tools.json');
const PREVIEWS_DIR = resolve(ROOT, 'client', 'public', 'previews');

const ID = 106;
const URL = 'https://cagoooo.github.io/smes-graduation-103/';

const tool = {
  id: ID,
  title: '石門國小 第103屆畢業典禮｜啟程・感恩・祝福',
  description:
    '石門國小第103屆畢業典禮的數位主場：典禮資訊、YouTube 直播、校園巡禮、畢業歌〈風箏〉、家長祝福一站到齊。最大亮點是「即時祝福牆」——家長掃 QR 留言、老師 LINE 一鍵審核，祝福立刻飛上現場大螢幕的星空投影，剛寫完抬頭就看到自己。啟程・感恩・祝福，陪每個孩子勇敢啟程。',
  detailedDescription:
    '「石門國小 第103屆畢業典禮」是阿凱老師為桃園市龍潭區石門國民小學（鱻魚特色學園）打造的**畢業典禮數位主場**，把一場典禮需要的所有資訊與互動，收進一個漂亮、好用、全 RWD 的單頁網站。\n\n## 🎓 典禮資訊一站到齊\n\n- **倒數計時 + 典禮資訊卡**：日期、時間、地點一眼掌握，倒數動畫帶氣氛\n- **YouTube 站內直播**：無法到場的家長線上同步觀看，日期感知自動切換「即將開始／直播中」\n- **互動校園巡禮**：實景平面圖路線圖，帶家長認識校園\n- **畢業歌〈風箏〉MV**：嵌入畢業歌，典禮氛圍滿點\n- **班導師專區**：六班導師沙龍照與班級祝福\n\n## 💛 最大亮點：即時祝福牆互動閉環\n\n這是整個網站的靈魂——一條 **掃碼 → 留言 → 審核 → 即時上牆** 的完整互動流：\n\n1. 家長手機**掃 QR Code** 或點按鈕，開啟祝福表單\n2. 送出後寫進 Google Sheet，老師的 **LINE 立刻收到卡片通知**\n3. 老師在 LINE **一鍵審核通過**，祝福同步公開\n4. 祝福**立刻飛上現場大螢幕的星空投影**（最新優先），家長剛寫完抬頭就看到自己\n\n祝福牆有三種版本：主頁分頁牆、放大沉浸牆（含六班導師合影背景）、現場星空投影版（流星動畫 + 〈風箏〉BGM + 班級篩選 + 掃碼留祝福）。未成年學生姓名自動**去識別化**保護隱私，師長與校友完整顯示。\n\n## 🧰 技術棧\n\n純靜態 HTML/CSS/JS + GitHub Pages、Google Apps Script + Google Sheet 當免費後端、LINE Messaging API 卡片審核、PWA Service Worker、schema.org Event 結構化資料、社群分享 OG 圖。**零成本、零維運、全裝置 RWD。桃園市龍潭區石門國民小學 × 阿凱老師打造。** 啟程・感恩・祝福，陪每個孩子勇敢啟程。',
  url: URL,
  icon: 'Heart',
  category: 'interactive',
  previewUrl: `/previews/tool_${ID}.webp`,
  ogPreviewUrl: '',
  tags: [
    '畢業典禮',
    '石門國小',
    '即時祝福牆',
    '星空投影',
    '掃碼互動',
    'QR Code',
    'YouTube 直播',
    '校園巡禮',
    '家長祝福',
    'LINE 審核',
    'GAS 後端',
    '第103屆',
  ],
  addedAt: new Date().toISOString(),
};

async function screenshot(outPath) {
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    try { ({ chromium } = await import('@playwright/test')); }
    catch { console.log('⚠️ 找不到 playwright，跳過截圖'); return false; }
  }
  const sharp = (await import('sharp')).default;
  const browser = await chromium.launch({ headless: true });
  try {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1280 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    const buf = await page.screenshot({ type: 'png', fullPage: false });
    await sharp(buf).resize(1024, 1024, { fit: 'cover', position: 'top' }).webp({ quality: 88 }).toFile(outPath);
    console.log('✅ 截圖完成', outPath);
    return true;
  } catch (e) { console.warn('⚠️ 截圖失敗', e.message); return false; }
  finally { await browser.close(); }
}

function writeJson(p) {
  if (!existsSync(p)) { console.log('（略過不存在）', p); return; }
  const tools = JSON.parse(readFileSync(p, 'utf-8'));
  const exist = tools.findIndex((t) => t.id === ID);
  if (exist >= 0) { tools[exist] = tool; console.log('🔄 覆蓋 #' + ID, p); }
  else {
    const at100 = tools.findIndex((t) => t.id === 100); // #100 彩蛋固定放最末，新工具插它前面
    if (at100 === -1) tools.push(tool); else tools.splice(at100, 0, tool);
    console.log('➕ 新增 #' + ID, p);
  }
  writeFileSync(p, JSON.stringify(tools, null, 2) + '\n', 'utf-8');
}

if (!existsSync(PREVIEWS_DIR)) mkdirSync(PREVIEWS_DIR, { recursive: true });
const previewPath = resolve(PREVIEWS_DIR, `tool_${ID}.webp`);
const ok = await screenshot(previewPath);
tool.previewUrl = ok ? `/previews/tool_${ID}.webp` : '';
writeJson(TOOLS_CLIENT);
writeJson(TOOLS_SERVER);
console.log('完成 #' + ID, tool.title);
