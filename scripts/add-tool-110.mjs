#!/usr/bin/env node
/**
 * 非互動版：新增工具 #110「智慧自動化照片成果轉影片產生器」
 * 1. Playwright 截圖目標站 → 1024×1024 webp 卡片預覽圖
 * 2. 寫入 client/public/api/tools.json + server/data/tools.json（插在 #100 彩蛋之前）
 * OG 圖另跑 generate-unified-og.mjs 110。
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TOOLS_CLIENT = resolve(ROOT, 'client', 'public', 'api', 'tools.json');
const TOOLS_SERVER = resolve(ROOT, 'server', 'data', 'tools.json');
const PREVIEWS_DIR = resolve(ROOT, 'client', 'public', 'previews');

const ID = 110;
const URL = 'https://cagoooo.github.io/PhotoLibrary/';

const tool = {
  id: ID,
  title: '智慧自動化照片成果轉影片產生器',
  description:
    '辦完活動，幾十張照片躺在資料夾裡，要剪成一支有旁白、有音樂、有字幕的成果影片，光想到就累。#110 讓你只要上傳活動照片，多模態 AI 自動看懂每張照片在做什麼、編寫前後連貫的繁體中文旁白與字幕、配上微軟 Neural 高品質人聲、挑好轉場與背景音樂，最後一鍵錄製匯出相容 iPhone/Safari 的 MP4。純前端、金鑰只存在你的瀏覽器，照片不外傳。',
  detailedDescription:
    '「智慧自動化照片成果轉影片產生器」是阿凱老師打造的**活動紀錄影片自動生成神器**——把老師、社團、班級辦完活動後最頭痛的「幾十張照片要怎麼變成一支像樣的成果影片」，變成上傳照片、喝杯咖啡、下載成片的三步驟。\n\n## 😩 它解決的痛點\n\n運動會、校外教學、創意實作課、成果發表……活動辦得精彩，照片拍了一大疊，但要剪成影片就卡關了：要想旁白、要配音、要上字幕、要選轉場、要配背景音樂、還要會用剪輯軟體。多數老師最後只能把照片丟成一個無聲的相片輪播，可惜了現場的精彩。\n\n## 🎬 它怎麼運作？只要三步\n\n- **① 上傳活動照片** — 拖放或點選多張照片，可拖曳卡片重新排序排出時間軸，圖片過大自動壓縮，建議單次 3～10 張最順\n- **② AI 看懂並編劇** — 多模態視覺辨識自動分析每張照片的場景、人物動作、表情與前因後果，像專業導演一樣編寫**前後連貫、積極溫暖、口語化的繁體中文旁白與字幕**，並自動擬好影片主標題與副標題\n- **③ 一鍵產出影片** — 自動配上微軟 Neural 高品質人聲旁白、AI 推薦的轉場效果與背景音樂風格，預覽滿意後實時錄製匯出影片\n\n## ✨ 幾個讓成片更專業的設計\n\n- **多種台灣 / 中文人聲** — 微軟 Edge Neural TTS，曉曉、曉伊、曉佳、臺灣女聲 / 男聲、普通話、粵語多款自然人聲任選，效果極具真人質感\n- **豐富轉場庫** — 淡入淡出、推入、平移、擦除、縮放、模糊過渡、圓形收縮、漸變黑屏……AI 會依照片內容與故事節奏推薦合適轉場\n- **AI 推薦背景音樂** — 木吉他、溫柔鋼琴、科技律動、復古電子、歡樂滑稽等氛圍，依活動主題自動配樂，旁白音量可微調\n- **腳本可手改** — AI 生成的主副標題、每幕旁白與字幕都能逐張編輯，再播放預覽\n- **匯出相容性 100%** — 可選標準 / 高清 / 超高清解析度，自動轉成 Apple 相容 MP4，iPhone 與 Safari 都能順播\n- **隱私純前端** — 整個網頁是純前端應用，Gemini API 金鑰只儲存在你自己的瀏覽器、照片絕不上傳第三方伺服器\n\n## 🧰 技術棧\n\n純前端 HTML/CSS/JS + GitHub Pages 零成本部署；**Gemini 多模態視覺模型**負責看照片、寫腳本（需自備免費 API 金鑰，僅存本地瀏覽器）；**微軟 Edge Neural TTS** 合成旁白人聲；Canvas + MediaRecorder 實時錄製合成影片、轉封裝為相容 MP4。零後端、零月費、隱私自主。由阿凱老師打造。',
  url: URL,
  icon: 'Video',
  category: 'utilities',
  previewUrl: `/previews/tool_${ID}.webp`,
  ogPreviewUrl: '',
  tags: [
    '照片轉影片',
    '活動紀錄影片',
    'AI 自動剪輯',
    '多模態視覺辨識',
    'AI 旁白腳本',
    'Neural 語音',
    '自動字幕',
    '成果影片',
    'Gemini',
    '純前端',
    '校園活動',
    '一鍵匯出',
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
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(3500);
    await page.evaluate(() => {
      const sels = ['.driver-popover', '.driver-overlay', '#updateBanner', '#cookieBanner',
        '#announcement', '[class*="cookie-banner"]', '[class*="onboard"]', '[class*="tutorial"]',
        '.akai-ob-bg', '.akai-ob-modal', '[class*="akai-ob-"]'];
      sels.forEach((s) => document.querySelectorAll(s).forEach((el) => {
        const cs = getComputedStyle(el);
        if (cs.position === 'fixed') el.remove();
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
