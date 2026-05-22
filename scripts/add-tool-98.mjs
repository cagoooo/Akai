#!/usr/bin/env node
/**
 * 一次性 script：新增工具 #98「教室小幫手 — 老師的每日課堂工具」
 * 流程：Playwright 截圖 → 寫 tools.json (client + server) → spawn generate-unified-og.mjs
 * 跑完一次後可保留參考；下次新增工具請改用互動式 scripts/new-tool.mjs。
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
const PREVIEW_OUT = resolve(PREVIEWS_DIR, 'tool_98.webp');

const NEW_TOOL = {
  id: 98,
  title: '教室小幫手 — 老師的每日課堂工具',
  description:
    '阿凱老師為導師日常打造的「教室百寶箱」，一頁集合 26 個課堂小工具：情緒打卡、班級 To-Do、彩虹能量卡、出勤、跑馬燈、抽號、計時器、分組、座位表、生日榜、積點榜、月度報告、班費、AI 評語草擬⋯六大分組任你切換。免登入、不上傳、可離線、PWA 一鍵裝成桌面 App。',
  detailedDescription:
    '「教室小幫手」是阿凱老師為國小導師、輔導老師、科任老師打造的「課堂百寶箱」單頁網站，把每天教室裡會用到的 26 個小工具收進同一個瀏覽器分頁，免登入、不收集任何資料、可離線運作，所有班級資料只存在瀏覽器本機 IndexedDB / localStorage。\n\n六大組分類速覽：\n• 🌅 基礎五件套：情緒打卡、班級 To-Do、彩虹能量卡、出勤記錄、跑馬燈通知\n• 📚 課堂控場：隨機抽號、教室計時器、隨機分組、上下課鈴聲\n• 🏆 班級管理：積點榜、月度報告、情緒趨勢圖\n• 🎓 學生視角：成長報告、班費、Kiosk 打卡模式\n• 🎉 教室生態：抽籤箱、班級公約、作品牆\n• 🪑 老師日常：座位表、課表、生日榜、午餐、親師聯絡、行為觀察、代課交接、戶外教學、AI 教案\n\n設定好班級名單一次（可從 Excel 直接複製貼上），26 個工具自動帶入，不用每個工具重打名單。內建「再看一次使用引導」、右下角工具導航搜尋、回到頂部、視覺微調（換主色、深色模式、字級調整）。AI 評語草擬讀情緒/出勤/積點/行為自動草擬評語，5 種文風 + 字數選擇。\n\n適合國小導師早晨例行三分鐘暖場（情緒打卡 → 能量卡 → 出勤）、課堂分組討論計時、月底匯出 CSV 給教務處、學期末 PDF 報告給家長等情境。完全免費、無註冊、無雲端、無廣告，電腦／iPad／手機都能用，Chrome/Edge 安裝桌面捷徑或 Safari「加入主畫面」即可離線使用。',
  url: 'https://cagoooo.github.io/coolclass/',
  icon: 'Sparkles',
  category: 'utilities',
  previewUrl: '/previews/tool_98.webp',
  ogPreviewUrl: '/previews/og/tool_98.webp',
  tags: [
    '教室百寶箱',
    '情緒打卡',
    '隨機抽號',
    '教室計時器',
    '隨機分組',
    '座位表',
    'AI 評語草擬',
    '導師工具',
    '班級經營',
    'PWA 離線',
    '免登入',
    '26 工具',
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
          // coolclass / 阿凱站慣用 onboarding key
          'akai_onboarded_v1', 'akai_install_dismissed',
        ];
        dismissKeys.forEach((k) => localStorage.setItem(k, '1'));
      } catch (e) {}
    });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      const selectors = [
        '.driver-popover', '.driver-overlay', '.driver-active-element',
        '.shepherd-element', '.shepherd-modal-overlay-container',
        '.introjs-overlay', '.introjs-helperLayer', '.introjs-tooltipReferenceLayer',
        '#updateBanner', '#cookieBanner', '#announcement',
        '[class*="cookie-banner"]', '[class*="cookie-consent"]',
        '[class*="onboard"]', '[class*="tutorial"]', '[class*="tour-tooltip"]',
        // coolclass / 阿凱站使用引導 overlay
        '.akai-ob-bg', '.akai-ob-modal', '[class*="akai-ob-"]',
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
    // 依 ID 升序插入：找到第一個 id 大於目標的位置；找不到則 push
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
  if (!ok) console.warn('⚠️ OG 圖生成失敗，請手動 node scripts/generate-unified-og.mjs 98');

  console.log(`\n✨ 工具 #${NEW_TOOL.id} ${NEW_TOOL.title} 寫入完成！`);
}

main().catch((err) => {
  console.error('❌', err);
  process.exit(1);
});
