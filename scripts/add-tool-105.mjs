#!/usr/bin/env node
/**
 * 一次性 script：新增工具 #105「臺灣主權 AI 訓練語料庫 × 石門國小」
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
const PREVIEW_OUT = resolve(PREVIEWS_DIR, 'tool_105.webp');

const NEW_TOOL = {
  id: 105,
  title: '臺灣主權 AI 訓練語料庫 × 石門國小 — 把國家級本土語料變成校園教材',
  description:
    '國家耗十年、集 265 個機關蒐集的 6 億 tokens 本土語料，從「只拿來餵 AI」變成「師生家長共用的教材庫」。九大教育主題、4,554 筆語料一鍵探索，每筆都標課綱領域與授權來源；還能用自備的免費 Gemini 金鑰，即時生成台語／客語／國語學習單與繪本腳本。數位發展部 × 桃園市龍潭區石門國民小學阿凱老師打造的「鱻本土 AI 共學站」。',
  detailedDescription:
    '「臺灣主權 AI 訓練語料庫 × 石門國小」是阿凱老師打造的 **「鱻本土 AI 共學站」**，回答一個很大的問題：**國家花十年、集 265 個機關蒐集的 6 億 tokens 本土語料，除了拿去訓練 AI 模型，還能為校園做什麼？** 答案是——把它變成「師生家長都能用」的本土學習平台。\n\n## 🐟 它在做什麼\n\n這是數位發展部「臺灣主權 AI」語料庫的**教育轉化版**。原始語料庫是給 AI 訓練用的冷資料，阿凱老師把它重新編排成**九大國小教育主題**（海洋、本土語、在地文化、交通安全、媒體素養⋯），每一筆語料都標上**建議年段、課綱領域議題、授權狀態與政府來源**，讓老師備課時「點得到、用得懂、查得到出處」。\n\n## 📊 語料規模\n\n- **4,554 筆**語料集，可全站搜尋\n- **265 個**提供機關\n- **6 億+ tokens** 本土文本\n- **9 大**國小教育主題分類\n\n## 👨‍🏫👧👨‍👩‍👧 三方共學設計\n\n- **老師**：備課素材庫快速篩選、AI 生成教材（繪本、台語朗讀稿、探究提問）、課綱對應標示、跨校共享\n- **學生**：家鄉探究式自主學習、本土語闖關、與 AI 共創在地故事繪本、培養資訊素養\n- **家長**：親子共讀素材、交安與媒體素養延伸、學習可視化、政府素材來源可追溯\n\n## 🤖 兩階段功能\n\n**階段一・語料導覽站（現況可用）**：九大主題互動探索器、4,554 筆全站搜尋、開放／需申請標示、課綱領域與議題對應。\n\n**階段二・本土 AI 教學助理（進行中）**：\n- **問 AI** — 依「主題／年段／領域」提問，從 4,554 筆台灣語料檢索並標註引用來源\n- **生成學習單** — 自動產出台語／客語／國語版本，分低中高年級，可調 4–8 頁\n- **生成繪本腳本** — 輸入領域與課綱單元，自動產出繪本內容結構\n- **語料配對（免金鑰）** — 輸入課綱單元或關鍵字，立即檢索相關素材\n\n## 🔐 隱私與授權\n\n- AI 功能採**使用者自備免費 Gemini 金鑰**，資料僅存瀏覽器 localStorage，**不上傳、不共用**（免費額度約每天 1,500 次）\n- **開放資料約 1,154 筆**：加註來源即可用於教學與公開分享\n- **需申請約 3,400 筆**：用於 AI 訓練與校本應用，引用前先確認授權範圍\n- AI 生成內容僅供參考，請老師審閱後再使用\n\n## 🧰 技術特色\n\n純靜態 HTML + GitHub Pages 部署、前端直連 Gemini API（零後端、零成本）、九大主題互動探索器、全站語料搜尋。**主辦：數位發展部、桃園市龍潭區石門國民小學（鱻魚特色學園）；核心開發：阿凱老師。** 讓國家級的本土語料，真正走進台灣的教室。',
  url: 'https://cagoooo.github.io/taic-edu/',
  icon: 'Brain',
  category: 'teaching',
  previewUrl: '/previews/tool_105.webp',
  ogPreviewUrl: '/previews/og/tool_105.webp',
  tags: [
    '臺灣主權 AI',
    '本土語料庫',
    '國家級開放資料',
    '教學素材庫',
    '數位發展部',
    '石門國小',
    '台語客語',
    '課綱對應',
    'AI 生成學習單',
    '繪本共創',
    '本土文化',
    'Gemini',
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
          'taic_onboarded', 'taic_tut_done', 'taic_intro_dismissed',
          'gemini_key_prompted', 'sw_update_dismissed',
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
        '[class*="modal-backdrop"]', '[class*="key-modal"]', '[role="dialog"]',
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
  if (!ok) console.warn('⚠️ OG 圖生成失敗，請手動 node scripts/generate-unified-og.mjs 105');
  console.log(`\n✨ 工具 #${NEW_TOOL.id} ${NEW_TOOL.title} 寫入完成！`);
}

main().catch((err) => { console.error('❌', err); process.exit(1); });
