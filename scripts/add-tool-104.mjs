#!/usr/bin/env node
/**
 * 一次性 script：新增工具 #104「台灣官方資料庫 Twinkle-Hub」
 * 流程：Playwright 截圖 → 寫 tools.json (client + server) → spawn generate-unified-og.mjs
 * 注意：#100「工具索引神器」是 client-only 特殊工具，server 端「不可」有 #100；
 *       client 為衍生檔（= server + #100），實際由 prebuild 的 sync-tools-json.mjs 重建。
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
const PREVIEW_OUT = resolve(PREVIEWS_DIR, 'tool_104.webp');

const NEW_TOOL = {
  id: 104,
  title: '台灣官方資料庫 Twinkle-Hub — 把台灣官方資料接進 AI 助教',
  description:
    '讓 AI 助教「直接查台灣官方來源再回答」的資料橋 MCP 服務：國定假日補班、農曆節氣、簡繁轉換、地址郵遞區號、身分證／統編格式驗證、6.4 萬份國家考試考古題與政府開放資料，65 個現成工具一次到位。申請金鑰 → 一鍵安裝 → 重開即用，老師備課出題、學生查在地資料都更踏實。相容任何支援 MCP 的 AI 客戶端，基本查詢免費。',
  detailedDescription:
    '「台灣官方資料庫 Twinkle-Hub」是阿凱老師推薦的 **MCP（Model Context Protocol）資料服務**，解決一個 AI 助教的老問題：**它常常「憑記憶」回答台灣在地問題，結果說錯日期、講錯農曆、查錯郵遞區號**。Twinkle Hub 像一座「資料橋」，讓 Claude 等 AI 工具**直接去查官方來源再回答你**，而不是靠模型訓練時的舊記憶。\n\n## 🌉 它解決什麼\n\n台灣的「今年中秋連假幾天」「這個地址的郵遞區號」「這張身分證格式對不對」「農曆生日換成國曆是哪天」——這些對 AI 來說最容易答錯，因為涉及**會變動的官方資料**。Twinkle Hub 把這些查詢變成 AI 可以即時呼叫的工具。\n\n## 🧰 65 個現成工具，九大類別\n\n- 🗓️ **曆法與行事曆** — 國定假日、補班日、農曆⇄國曆、24 節氣、生肖\n- 📝 **國家考試考古題** — 6.4 萬份考卷、32 萬題可語意搜尋（附 PDF）\n- 🔤 **文字小幫手** — 簡體⇄正體互轉、中文數字轉換\n- 📮 **地址與郵遞區號** — 3+3 碼查詢、行政區資訊、地址正規化、中英地址互轉\n- 🗺️ **地理與防災** — 避難收容所、座標⇄行政區、最近設施查詢\n- 📄 **文件處理** — PDF 文字／頁面抽取、網頁轉 Markdown\n- ✅ **格式驗證** — 身分證、統一編號、車牌、電話（**純演算法、不存取個資**）\n- 🏦 **生活查詢** — 銀行代碼、捷運站與路線\n- 📊 **政府開放資料** — 實價登錄、政府採購、公司登記、司法判決、專利等\n\n## 💬 老師可以這樣直接問\n\n「幫我列出這學期的國定假日和補班日做行事曆」「把這篇簡體文章轉成正體中文」「幫我找 5 題國中會考的相關考古題」「石門國小的郵遞區號是幾號」——AI 會自己呼叫對應工具、查官方資料、再整理答案給你。\n\n## 🛠️ 技術特色\n\n- **MCP 標準協定** — 相容任何支援 MCP 的 AI 客戶端\n- **Claude 桌面版一鍵安裝** — 提供 `twinkle-hub.mcpb` 安裝包，雙擊即裝\n- **API 金鑰系統** — 從 hub.twinkleai.tw/dashboard 申請\n- **隱私優先** — 格式驗證為純演算法，不查、不存個人資料\n- **基本查詢免費** — 部分進階開放資料服務可能有用量限制\n\n## 🎒 教學情境\n\n備課做學期行事曆、國考／會考出題找考古題、簡體教材一鍵轉正體、學生查台灣在地資料寫報告、資訊課示範「AI 怎麼接外部資料工具」。**怎麼開始？三步驟**：① 到 hub.twinkleai.tw/dashboard 申請鑰匙 → ② 下載 twinkle-hub.mcpb 一鍵安裝 → ③ 重開 AI 客戶端就能開講。讓 AI 助教更懂台灣，從今天開始。',
  url: 'https://cagoooo.github.io/twinkle-hub-guide/',
  icon: 'Sparkles',
  category: 'utilities',
  previewUrl: '/previews/tool_104.webp',
  ogPreviewUrl: '/previews/og/tool_104.webp',
  tags: [
    '台灣官方資料',
    'MCP 服務',
    'AI 助教',
    '國考考古題',
    '國定假日',
    '農曆節氣',
    '簡繁轉換',
    '郵遞區號',
    '身分證驗證',
    '政府開放資料',
    'Claude 整合',
    '備課出題',
  ],
  addedAt: new Date().toISOString(),
};

async function screenshotUrl(url, outPath) {
  console.log(`📸 用 Playwright 截圖 ${url}…`);
  const { chromium } = await import('playwright');
  const sharp = (await import('sharp')).default;
  const browser = await chromium.launch({ headless: true });
  try {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1280 }, deviceScaleFactor: 2 });
    await ctx.addInitScript(() => {
      try {
        [
          'tyc_tut_done', 'tyc_known_version', 'tyc_nokey_collapsed', 'tyc_notify',
          'tour_complete', 'onboarding_done', 'hasSeenTour', 'tutorial_dismissed',
          'cookie_accepted', 'announcement_dismissed', 'welcome_shown',
          'akai_onboarded_v1', 'akai_install_dismissed',
          'twinkle_onboarded', 'twinkle_tut_done', 'sw_update_dismissed',
        ].forEach((k) => localStorage.setItem(k, '1'));
      } catch (e) {}
    });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForLoadState('load', { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(2500);
    await page.evaluate(() => {
      const selectors = [
        '.driver-popover', '.driver-overlay', '.driver-active-element',
        '.shepherd-element', '.shepherd-modal-overlay-container',
        '.introjs-overlay', '.introjs-helperLayer', '.introjs-tooltipReferenceLayer',
        '#updateBanner', '#cookieBanner', '#announcement',
        '[class*="cookie-banner"]', '[class*="cookie-consent"]',
        '[class*="update-banner"]', '[class*="update-toast"]', '[id*="update"]',
        '[class*="onboard"]', '[class*="tutorial"]', '[class*="tour-tooltip"]',
        '.akai-ob-bg', '.akai-ob-modal', '[class*="akai-ob-"]',
      ];
      selectors.forEach((s) => document.querySelectorAll(s).forEach((el) => el.remove()));
      window.scrollTo(0, 0);
      document.body.style.overflow = '';
    });
    await page.waitForTimeout(600);
    const buf = await page.screenshot({ type: 'png', fullPage: false });
    await sharp(buf).resize(1024, 1024, { fit: 'cover', position: 'top' }).webp({ quality: 88 }).toFile(outPath);
    console.log(`  ✅ 已產生 ${outPath}`);
    return true;
  } finally { await browser.close(); }
}

function writeToolToJson(p, tool) {
  if (!existsSync(p)) { console.log(`   (略過：${p} 不存在)`); return; }
  const tools = JSON.parse(readFileSync(p, 'utf-8'));
  const existingIdx = tools.findIndex((t) => t.id === tool.id);
  if (existingIdx >= 0) { tools[existingIdx] = tool; console.log(`   🔄 覆蓋既有 ID ${tool.id} 於 ${p}`); }
  else {
    const insertIdx = tools.findIndex((t) => t.id > tool.id);
    if (insertIdx === -1) tools.push(tool); else tools.splice(insertIdx, 0, tool);
    console.log(`   ➕ 新增 ID ${tool.id} 到 ${p}（依 ID 排序插入）`);
  }
  writeFileSync(p, JSON.stringify(tools, null, 2) + '\n', 'utf-8');
}

function runUnifiedOg(toolId) {
  return new Promise((res) => {
    console.log(`\n🖼️  呼叫 generate-unified-og.mjs ${toolId}…`);
    const child = spawn('node', [resolve(__dirname, 'generate-unified-og.mjs'), String(toolId)], { stdio: 'inherit' });
    child.on('exit', (code) => res(code === 0));
  });
}

async function main() {
  if (!existsSync(PREVIEWS_DIR)) mkdirSync(PREVIEWS_DIR, { recursive: true });
  await screenshotUrl(NEW_TOOL.url, PREVIEW_OUT);
  writeToolToJson(TOOLS_JSON_CLIENT, NEW_TOOL);
  writeToolToJson(TOOLS_JSON_SERVER, NEW_TOOL);
  const ok = await runUnifiedOg(NEW_TOOL.id);
  if (!ok) console.warn('⚠️ OG 圖生成失敗，請手動 node scripts/generate-unified-og.mjs 104');
  console.log(`\n✨ 工具 #${NEW_TOOL.id} ${NEW_TOOL.title} 寫入完成！`);
}

main().catch((err) => { console.error('❌', err); process.exit(1); });
