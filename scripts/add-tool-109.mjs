#!/usr/bin/env node
/**
 * 非互動版：新增工具 #109「數位內容與教學軟體需求調查填報」
 * 1. Playwright 截圖目標站 → 1024×1024 webp 卡片預覽圖
 * 2. 寫入 client/public/api/tools.json + server/data/tools.json（插在 #100 彩蛋之前）
 * OG 圖另跑 generate-unified-og.mjs 109。
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TOOLS_CLIENT = resolve(ROOT, 'client', 'public', 'api', 'tools.json');
const TOOLS_SERVER = resolve(ROOT, 'server', 'data', 'tools.json');
const PREVIEWS_DIR = resolve(ROOT, 'client', 'public', 'previews');

const ID = 109;
const URL = 'https://cagoooo.github.io/smes-soft-survey/';

const tool = {
  id: ID,
  title: '數位內容與教學軟體需求調查填報',
  description:
    '每年學校要彙整老師的教學軟體採購需求，總是一張 Excel 在處室間傳來傳去、誰填了誰漏了理不清。#109 是石門國小教務處的線上實名填報系統：老師勾選統購與自主需求軟體，依數位內容／課堂教學／遠距教學三領域篩選，全校即時統計勾選人數、自動排出前 5 名提報教育局。已大量採購的軟體自動標示「免填」，班級教師學生數系統去重統計，承辦不用再對 Excel 對到天荒地老。',
  detailedDescription:
    '「數位內容與教學軟體需求調查填報」是阿凱老師為桃園市龍潭區石門國民小學（鱻魚特色學園）教務處打造的**校務需求調查神器**，配合 **115 年中小學數位學習實施計畫**，把「全校老師的教學軟體採購需求」這件每年都要做、又最難彙整的苦差事，變成一頁老師三分鐘填完、承辦一鍵看結果的線上系統。\n\n## 😩 它解決的痛點\n\n每年教育局要學校提報教學軟體需求，傳統做法是一張 Excel 在 LINE 群組裡傳來傳去——老師填在不同欄位、有人填了有人漏、同一套軟體被導師和科任重複填、最後承辦還要手動去重加總、排出前幾名。光是「對 Excel」就要對到眼花。\n\n## 🎯 三步驟填報流程\n\n- **① 實名填姓名與班級** — 方便彙整提報名單；班級用 modal 選，不怕填錯\n- **② 統購軟體** — 教育局規劃統購的 3 套，填你預計使用的需求數（不用就填 0），實際配發視本校數位學習推動成效另案審核\n- **③ 自主需求軟體** — 從教育部「校園數位內容與教學軟體」選購名單挑，勾選你要的並填需求數，全校統計後**取需求最高前 5 名提報教育局**\n\n## ✨ 幾個讓承辦省心的設計\n\n- **依領域快速瀏覽** — 數位內容 / 課堂教學軟體 / 遠距教學軟體 三大領域一鍵篩選，還能搜尋軟體名稱或廠牌（例：英語、數學、MAKAR）\n- **已採購自動標示免填** — HiTeach、PaGamO、Padlet、Kahoot! 等教育局先前已大量採購的，系統自動標「已大量採購·免填」且無法勾選，不浪費名額重複填\n- **全校即時排行榜** — 「自主需求前 5 名」依勾選人數即時更新，老師填完就看得到全校風向，前 5 名就是學校會提報的名單\n- **自動去重統計** — 班級數、教師數、學生數由系統自動算，同一班被導師＋科任重複需求只算一次，承辦完全不用手動扣重複\n- **送出預覽 + 成功動畫** — 送出前先預覽自己勾了什麼，送出後撒花確認，截止日倒數提示不漏填\n\n## 🧰 技術棧\n\n純靜態 HTML/CSS/JS + GitHub Pages 零成本部署，軟體選購名單從 `catalog.json` 載入，**Firebase Firestore 當即時後端**——全校勾選人數即時統計、前 5 名排行榜即時更新。PWA Service Worker、社群分享 OG 圖、全裝置 RWD。零後端維運、零月費。桃園市龍潭區石門國民小學 · 教務處 × 阿凱老師打造，把「對 Excel」變成「看儀表板」。',
  url: URL,
  icon: 'ClipboardList',
  category: 'utilities',
  previewUrl: `/previews/tool_${ID}.webp`,
  ogPreviewUrl: '',
  tags: [
    '軟體需求調查',
    '數位學習',
    '教學軟體',
    '數位內容',
    '線上填報',
    '即時排行榜',
    'Firebase',
    '校務行政',
    '統購軟體',
    '教育部選購名單',
    '石門國小',
    '教務處',
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
    await ctx.addInitScript(() => {
      ['tyc_tut_done', 'tour_complete', 'onboarding_done', 'hasSeenTour',
       'cookie_accepted', 'announcement_dismissed', 'welcome_shown',
       'akai_onboarded_v1', 'akai_install_dismissed'].forEach((k) => {
        try { localStorage.setItem(k, '1'); } catch {}
      });
    });
    // 此站有 Firestore onSnapshot 長連線，networkidle 永不觸發 → 改 domcontentloaded + 固定等待
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(3500);
    await page.evaluate(() => {
      const sels = ['.driver-popover', '.driver-overlay', '#updateBanner', '#cookieBanner',
        '#announcement', '[class*="cookie-banner"]', '[class*="onboard"]', '[class*="tutorial"]',
        '.akai-ob-bg', '.akai-ob-modal', '[class*="akai-ob-"]', '.modal', '[class*="success"]'];
      sels.forEach((s) => document.querySelectorAll(s).forEach((el) => {
        const cs = getComputedStyle(el);
        if (cs.position === 'fixed' || el.className.includes('modal') || el.className.includes('success')) el.remove();
      }));
      window.scrollTo(0, 0);
    });
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
