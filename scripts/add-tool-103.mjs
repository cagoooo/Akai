#!/usr/bin/env node
/**
 * 一次性 script：新增工具 #103「AI Agent 的 Web 技能雙引擎」
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
const PREVIEW_OUT = resolve(PREVIEWS_DIR, 'tool_103.webp');

const NEW_TOOL = {
  id: 103,
  title: 'AI Agent 的 Web 技能雙引擎 — Playwright × Webwright 一頁讀懂',
  description:
    '一頁讀懂 AI Agent 怎麼「看得懂、做得到、做完有回報」地操作網頁！Playwright 負責動手執行、Webwright 負責動腦規劃，兩大引擎合起來才是完整的 Web Agent。含自動填 Google 表單、電子公文自動歸檔等真實自動化情境，阿凱老師用日記體一路帶你從零看懂這兩個關鍵字，松鼠吉祥物 + 大量 emoji 降低技術門檻。',
  detailedDescription:
    '「AI Agent 的 Web 技能雙引擎」是阿凱老師做的一頁式科普解說頁，用最白話的方式講清楚 **Playwright** 與 **Webwright** 這兩個讓 AI Agent 能操作網頁的關鍵字，解決「常聽到這些名詞、卻不知道差在哪、到底能幹嘛」的痛點。\n\n## 🎭 Playwright — 動手操作的那台引擎\n\n- 微軟開源的瀏覽器自動化框架\n- 跨瀏覽器（Chromium / Firefox / WebKit）、自動等待、強大元素定位（Locator）\n- 多語言支援（Python / TypeScript / .NET / Java）\n- 一句話：**「你給明確步驟，我精準執行」**\n\n## 🤖 Webwright — 動腦規劃的那台引擎\n\n- 微軟研究院提出的「AI 驅動瀏覽器任務代理框架」\n- 自然語言理解 → 自動拆解任務 → 生成 Playwright 程式 → 執行後自我修正\n- 可擴充成 Agent 技能模組\n- 一句話：**「你說需求，AI 幫你完成」**\n\n## 🧩 為什麼是「雙引擎」\n\n一個負責**動手操作**、一個負責**動腦規劃**，合起來才是完整的 Web Agent —— 任務看得懂、做得到、做完還有回報。\n\n## 📋 真實自動化情境\n\n- ✍️ 自動填寫 Google 表單（只改 `profile.json` 設定檔、不動程式就能擴充欄位）\n- 📂 電子公文自動歸檔（讓 Agent 自動點按、歸檔長官決行的公文）\n- 🛒 電商比價、📊 資料擷取、🏢 企業內部流程與報表自動化\n\n日記體娓娓道來、漸進式向下捲動逐段揭露，松鼠吉祥物與大量 emoji 把硬核技術講得親切好懂。給想入門 AI 網頁自動化的老師、想知道「AI Agent 怎麼幫我做網頁雜事」的人，一頁就看懂兩個關鍵字。',
  url: 'https://cagoooo.github.io/PlayRight/',
  icon: 'Bot',
  category: 'teaching',
  previewUrl: '/previews/tool_103.webp',
  ogPreviewUrl: '/previews/og/tool_103.webp',
  tags: [
    'AI Agent',
    'Playwright',
    'Webwright',
    '網頁自動化',
    '瀏覽器自動化',
    '自動填表',
    '一頁讀懂',
    '科普解說',
    '雙引擎',
    'AI 工具',
    '公文歸檔',
    '自動化情境',
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
        ['tyc_tut_done','akai_onboarded_v1','akai_install_dismissed','onboarding_done','welcome_shown','cookie_accepted','announcement_dismissed'].forEach((k) => localStorage.setItem(k, '1'));
      } catch (e) {}
    });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForLoadState('load', { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(3000);  // 等 hero 進場動畫 + 松鼠吉祥物渲染
    await page.evaluate(() => {
      ['.driver-popover','.driver-overlay','#cookieBanner','[class*="cookie-banner"]','[class*="onboard"]','[class*="tutorial"]'].forEach((s) => document.querySelectorAll(s).forEach((el) => el.remove()));
      window.scrollTo(0, 0);  // 確保停在 hero 區
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
  if (!ok) console.warn('⚠️ OG 圖生成失敗，請手動 node scripts/generate-unified-og.mjs 103');
  console.log(`\n✨ 工具 #${NEW_TOOL.id} ${NEW_TOOL.title} 寫入完成！`);
}

main().catch((err) => { console.error('❌', err); process.exit(1); });
