#!/usr/bin/env node
/**
 * 一次性 script：新增工具 #102「外星人入侵·保衛石門」
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
const PREVIEW_OUT = resolve(PREVIEWS_DIR, 'tool_102.webp');

const NEW_TOOL = {
  id: 102,
  title: '外星人入侵·保衛石門 — 復古太空射擊 × 全校排行榜',
  description:
    '駕駛地球最後一艘戰機，擊退一波波外星艦隊！復古像素風太空射擊：三種難度、王關 Boss 母艦、火力強化與護盾道具、連擊加成。石門校徽開場 +「保衛石門」主題，可加入主畫面當 App、離線可玩，內建全校跨裝置排行榜。桌機鍵盤 + 手機觸控全支援，下課十分鐘剛好打一輪。',
  detailedDescription:
    '「外星人入侵·保衛石門」是阿凱老師為國小資訊課與下課十分鐘打造的 **復古風太空射擊遊戲**，解決「想讓孩子玩有教育意義、免費、又能跟全校一起拚名次的遊戲」的痛點。\n\n## 🎯 核心玩法\n\n- 🚀 **駕駛戰機擊退外星艦隊** — 自動開火，專心走位閃彈、瞄準\n- 👾 **三種外星人** — 偵察兵 / 戰鬥機 / 轟炸機，經典整隊橫移、越打越快\n- ⚠️ **王關 Boss 母艦** — 每 5 波出現，三種彈幕型態 + 血條\n- 💪 **道具系統** — 火力強化、急速射擊、能量護盾、增加戰機\n- 🔥 **連擊加成** — 連續擊殺不失誤，分數倍率往上疊\n- 🏆 **全校跨裝置排行榜** — 留名上傳，全校同學看同一份 TOP 5\n\n## 💡 技術亮點\n\n- **純 HTML5 Canvas + 原生 JavaScript** — 單檔零相依、零建置，任何瀏覽器點開即玩\n- **PWA 可安裝 + 離線可玩** — manifest.webmanifest + Service Worker，平板可加入主畫面當 App\n- **Firebase 匿名登入 + Firestore** — 全校跨裝置即時排行榜（離線時自動退回本機榜）\n- **三種難度** — 簡單 5 命 / 普通 3 命 / 困難 2 命，不同年級都玩得起來\n- **石門校徽 Canvas 重繪** — 開場校徽 +「保衛石門」主題，向量繪製任何尺寸都清晰不破圖\n- **合成音效 + 爆炸粒子 + 星空視差** — Web Audio 即時合成，復古街機質感\n\n## 🎒 教學情境\n\n下課十分鐘的健康放電（取代滑手機）、資訊課「遊戲與互動設計」單元的 Canvas 實作範例（孩子看到「網頁真的能做遊戲」）、班級獎勵活動（達標後開放打一輪 + 上排行榜）、資訊週成果展投影示範。桌機鍵盤 + 手機觸控全支援，學校 Chromebook / iPad 都跑得動，免登入、免安裝、免付費，點開網址直接玩。',
  url: 'https://cagoooo.github.io/alien-invasion/',
  icon: 'Rocket',
  category: 'games',
  previewUrl: '/previews/tool_102.webp',
  ogPreviewUrl: '/previews/og/tool_102.webp',
  tags: [
    '太空射擊',
    '外星人入侵',
    '復古像素',
    '全校排行榜',
    'PWA 離線',
    '手機觸控',
    '教育遊戲',
    'Boss 戰',
    '保衛石門',
    'Canvas 遊戲',
    '下課十分鐘',
    '免登入',
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
        ['tyc_tut_done','akai_onboarded_v1','akai_install_dismissed','onboarding_done','welcome_shown'].forEach((k) => localStorage.setItem(k, '1'));
      } catch (e) {}
    });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForLoadState('load', { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(3500);  // 等校徽 Canvas 重繪 + 星空
    await page.evaluate(() => {
      ['.driver-popover','.driver-overlay','#cookieBanner','[class*="cookie-banner"]','[class*="onboard"]'].forEach((s) => document.querySelectorAll(s).forEach((el) => el.remove()));
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
  if (!ok) console.warn('⚠️ OG 圖生成失敗，請手動 node scripts/generate-unified-og.mjs 102');
  console.log(`\n✨ 工具 #${NEW_TOOL.id} ${NEW_TOOL.title} 寫入完成！`);
}

main().catch((err) => { console.error('❌', err); process.exit(1); });
