#!/usr/bin/env node
/**
 * 非互動版：新增工具 #107「學生教育雲帳號更新工具」
 * 1. Playwright 截圖目標站 → 1024×1024 webp 卡片預覽圖
 * 2. 寫入 client/public/api/tools.json + server/data/tools.json（插在 #100 彩蛋之前）
 * OG 圖另跑 generate-unified-og.mjs 107。
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TOOLS_CLIENT = resolve(ROOT, 'client', 'public', 'api', 'tools.json');
const TOOLS_SERVER = resolve(ROOT, 'server', 'data', 'tools.json');
const PREVIEWS_DIR = resolve(ROOT, 'client', 'public', 'previews');

const ID = 107;
const URL = 'https://cagoooo.github.io/edu-cloud-updater/';

const tool = {
  id: ID,
  title: '學生教育雲帳號更新工具',
  description:
    '每學年初校務行政最磨人的雜事之一：教育雲帳號總表要跟教育局新名冊對齊——誰轉走了、誰轉進來、誰升年級換了班級座號。#107 讓你上傳舊帳密總表與教育局新名冊，自動比對轉入轉出、偵測末四碼撞號、跨學年保留帳密只更新座號，一鍵產出更新後總表、異動清冊與新生通知單。全程純前端、個資絕不上傳，所有運算只在你這台電腦的瀏覽器裡完成。',
  detailedDescription:
    '「學生教育雲帳號更新工具」是阿凱老師為桃園市龍潭區石門國民小學（鱻魚特色學園）打造的**校務行政自動化神器**，專治每學年初最瑣碎、最容易出錯、又最沒人想接的差事——把全校教育雲（OpenID）帳號總表跟教育局最新名冊重新對齊。\n\n## 😩 它解決的痛點\n\n教育雲帳號是教育部的學生 OpenID 系統：**帳號＝身分證末四碼、密碼＝西元出生年月日 8 碼**。每到新學年，承辦老師都要面對同一場惡夢：對照舊總表與教育局新名冊，手動圈出誰轉走、誰轉進、誰升年級重新編班，逐格貼班級座號——一個學校上千名學生，眼睛盯到脫窗還可能貼錯。\n\n## 🎯 核心功能\n\n- **三步驟比對流程** — ① 載入 NAS 上現有「學生教育雲帳密」總表（一～六年級多工作表，吃 .xls / .xlsx）→ ② 載入教育局「學生資料概況」新名冊（自動辨識證照末四碼與出生日期格式）→ ③ 一鍵比對\n- **轉入／轉出／不變一目了然** — 即時統計三類人數，轉出移除名單、轉入新增名單分區列清楚\n- **末四碼撞號偵測** — 教育雲帳號就是末四碼，全校若有兩人共用同一末四碼會撞號，工具自動揪出來提示人工處理，避免帳號衝突\n- **疑似同一人判定** — 自動偵測更名 / 證號更正，勾「視為同一人」即保留原帳密、不誤判成一轉出加一轉入\n- **跨學年升級同步** — 升年級、重新編班時勾選「同步年級／班級／座號」，**帳號（末四碼）與密碼（生日）一律保留原值，只更新座號位置，不動帳密**\n- **主鍵可切換嚴格度** — 預設「姓名＋末四碼」，可加「＋生日」防同名同末四碼誤判\n\n## 📦 一鍵產出四種成品\n\n- **更新後完整總表** — 含六年級工作表、按班級座號排序，可直接回存 NAS\n- **異動清冊 .xlsx** — 摘要／轉入／轉出／注意事項四張表，存查、交接一份搞定\n- **異動摘要純文字** — 一鍵複製貼進 LINE 或公文\n- **新生帳密通知單** — A4 多張一頁可列印或存 PDF，自動署名「桃園市龍潭區石門國民小學」，發給新生即知帳密\n\n## 🔒 技術棧與隱私\n\n純靜態 HTML/CSS/JS + **ExcelJS** 在瀏覽器端讀寫 xlsx + GitHub Pages 零成本部署。最關鍵的是——**所有資料只在這台電腦的瀏覽器運算，全校學生個資不會上傳到任何伺服器**，符合校園資安與個資保護要求。零後端、零月費、零外洩風險。桃園市龍潭區石門國民小學 × 阿凱老師打造。',
  url: URL,
  icon: 'Users',
  category: 'utilities',
  previewUrl: `/previews/tool_${ID}.webp`,
  ogPreviewUrl: '',
  tags: [
    '教育雲帳號',
    'OpenID',
    '學生帳號管理',
    '帳密總表',
    '轉入轉出比對',
    '末四碼撞號',
    '跨學年同步',
    '新生通知單',
    '異動清冊',
    '純前端處理',
    '個資不上傳',
    '校務行政',
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
    // 預先標記常見 onboarding/cookie key，避免遮罩擋住主視覺
    await ctx.addInitScript(() => {
      ['tyc_tut_done', 'tour_complete', 'onboarding_done', 'hasSeenTour',
       'cookie_accepted', 'announcement_dismissed', 'welcome_shown',
       'akai_onboarded_v1', 'akai_install_dismissed'].forEach((k) => {
        try { localStorage.setItem(k, '1'); } catch {}
      });
    });
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(2000);
    await page.evaluate(() => {
      const sels = ['.driver-popover', '.driver-overlay', '#updateBanner', '#cookieBanner',
        '#announcement', '[class*="cookie-banner"]', '[class*="onboard"]', '[class*="tutorial"]',
        '.akai-ob-bg', '.akai-ob-modal', '[class*="akai-ob-"]'];
      sels.forEach((s) => document.querySelectorAll(s).forEach((el) => el.remove()));
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
