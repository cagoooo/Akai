#!/usr/bin/env node

/**
 * 首頁 OG 社群分享圖生成器（v3.6.27+）
 *
 * 設計概念：軟木塞公佈欄 + 三張黃色便利貼，跟首頁 BulletinHome 同一視覺語言
 *   - 左上「教育工具」+ 數字（從 tools.json 自動計算）
 *   - 中央主便利貼「科技教育創新專區」+ 阿凱頭像
 *   - 右下顯示分類膠帶（互動投票 / AI 教案 / 閱讀評量 / 教育遊戲）
 *
 * 同時：
 *   1. 把實際工具數寫進 `client/public/api/site-stats.json`（供前端讀）
 *   2. 把實際工具數注入 index.html / manifest.json / SEOHead 等地的 meta
 *      （透過 placeholder __TOOL_COUNT__、__OG_IMAGE__ 等）
 *   3. 檔名加版本 hash（防 LINE/FB 快取）
 *
 * 用法：
 *   node scripts/generate-home-og.mjs
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import { ensureFonts } from './ensure-fonts.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const FONT_PATH = resolve(__dirname, 'fonts', 'NotoSansTC-Bold.ttf');
const TOOLS_JSON = resolve(ROOT, 'client', 'public', 'api', 'tools.json');
const PUBLIC_DIR = resolve(ROOT, 'client', 'public');
const STATS_JSON = resolve(PUBLIC_DIR, 'api', 'site-stats.json');

await ensureFonts();
GlobalFonts.registerFromPath(FONT_PATH, 'NotoSansTC');

const C = {
  cork: '#c99a6c',
  corkDark: '#a87a4f',
  wood: '#7c4f2a',
  woodDark: '#6b4220',
  woodLight: '#8a5a32',
  paper: '#fff27a',
  paperDeep: '#ffd84a',
  paperBlue: '#c8e6ff',
  paperGreen: '#d4f4c7',
  paperPink: '#ffd4d9',
  ink: '#1a1a1a',
  inkSoft: '#3a3a3a',
  inkMuted: '#4a3a20',
  muted: '#8b7356',
  accent: '#ea8a3e',
  red: '#dc2626',
  redDeep: '#7a1a18',
  green: '#16a34a',
  blue: '#2563eb',
};

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawPin(ctx, cx, cy, r, color, deepColor) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.35)';
  ctx.shadowBlur = r * 0.6;
  ctx.shadowOffsetY = r * 0.3;
  const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.1, cx, cy, r);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.35, '#ff9090');
  g.addColorStop(0.85, color);
  g.addColorStop(1, deepColor || '#5a0a08');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // 高光
  ctx.fillStyle = 'rgba(255,255,255,.75)';
  ctx.beginPath();
  ctx.arc(cx - r * 0.32, cy - r * 0.4, r * 0.25, 0, Math.PI * 2);
  ctx.fill();
}

function drawTape(ctx, cx, cy, w, h, color, rotate, text) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rotate * Math.PI) / 180);
  ctx.shadowColor = 'rgba(0,0,0,.2)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = color;
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.shadowColor = 'transparent';
  // 斜紋
  ctx.save();
  ctx.beginPath();
  ctx.rect(-w / 2, -h / 2, w, h);
  ctx.clip();
  ctx.strokeStyle = 'rgba(0,0,0,.08)';
  ctx.lineWidth = 1;
  for (let i = -w; i < w * 2; i += 8) {
    ctx.beginPath();
    ctx.moveTo(i, -h);
    ctx.lineTo(i + h * 2, h);
    ctx.stroke();
  }
  ctx.restore();
  if (text) {
    ctx.fillStyle = '#fff';
    ctx.font = `900 ${h * 0.55}px "NotoSansTC"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, 1);
  }
  ctx.restore();
}

function drawCorkBackground(ctx, W, H) {
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, C.cork);
  bg.addColorStop(1, C.corkDark);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  for (let yy = 0; yy < H; yy += 38) {
    for (let xx = 0; xx < W; xx += 38) {
      const opacity = 0.18 + ((xx * 7 + yy * 11) % 18) / 100;
      const size = 0.8 + ((xx * 3 + yy * 5) % 10) / 10;
      ctx.fillStyle = `rgba(80,55,25,${opacity})`;
      ctx.beginPath();
      ctx.arc(xx + ((yy * 3) % 38), yy + ((xx * 5) % 38), size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 上下木條
  for (const stripY of [0, H - 22]) {
    ctx.fillStyle = C.wood;
    ctx.fillRect(0, stripY, W, 22);
    for (let xx = 0; xx < W; xx += 42) {
      ctx.fillStyle = C.woodDark;
      ctx.fillRect(xx, stripY, 2, 22);
      if (xx + 40 < W) {
        ctx.fillStyle = C.woodLight;
        ctx.fillRect(xx + 40, stripY, 2, 22);
      }
    }
  }
}

function drawStickyNote(ctx, x, y, w, h, color, rotate, pinColor) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate((rotate * Math.PI) / 180);
  ctx.translate(-w / 2, -h / 2);

  // 陰影
  ctx.shadowColor = 'rgba(0,0,0,.35)';
  ctx.shadowBlur = 22;
  ctx.shadowOffsetX = 6;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = color;
  roundRect(ctx, 0, 0, w, h, 8);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // 內陰影（紙張感）
  const inner = ctx.createLinearGradient(0, 0, 0, h);
  inner.addColorStop(0, 'rgba(0,0,0,.06)');
  inner.addColorStop(0.18, 'rgba(0,0,0,0)');
  ctx.fillStyle = inner;
  roundRect(ctx, 0, 0, w, h, 8);
  ctx.fill();

  // 圖釘
  drawPin(ctx, w / 2, -6, 14, pinColor, C.redDeep);

  ctx.restore();
}

// 萃取分類數量
function summarizeCategories(tools) {
  const counts = {};
  for (const t of tools) {
    if (!t.category) continue;
    counts[t.category] = (counts[t.category] || 0) + 1;
  }
  return counts;
}

async function generateOG(tools) {
  const W = 1200, H = 630;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  drawCorkBackground(ctx, W, H);

  const toolCount = tools.length;
  // 顯示數字策略：97 → 「97」；100 → 「100+」；105 → 「100+」
  const displayCount = toolCount >= 100 ? `${Math.floor(toolCount / 10) * 10}+` : `${toolCount}`;

  // ─── 中央主便利貼 ───
  const mainW = 720, mainH = 420;
  const mainX = (W - mainW) / 2;
  const mainY = 100;
  drawStickyNote(ctx, mainX, mainY, mainW, mainH, C.paper, -1.5, C.red);

  ctx.save();
  // 配合主便利貼的旋轉
  ctx.translate(mainX + mainW / 2, mainY + mainH / 2);
  ctx.rotate((-1.5 * Math.PI) / 180);
  ctx.translate(-mainW / 2, -mainH / 2);

  // 副標小膠帶 ─「桃園市石門國小 · 阿凱老師」
  drawTape(ctx, mainW / 2, 35, 260, 30, C.accent, -2, '阿凱老師 · 石門國小');

  // 主標題（兩行）
  ctx.fillStyle = C.ink;
  ctx.font = '900 76px "NotoSansTC"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('科技教育', mainW / 2, 130);
  ctx.fillText('創新專區', mainW / 2, 215);

  // 分隔線
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(mainW / 2 - 160, 265);
  ctx.lineTo(mainW / 2 + 160, 265);
  ctx.stroke();

  // 工具數量大字
  ctx.fillStyle = C.red;
  ctx.font = '900 96px "NotoSansTC"';
  const countText = displayCount;
  const countW = ctx.measureText(countText).width;
  ctx.fillText(countText, mainW / 2 - 50, 330);

  // 「款教育工具」
  ctx.fillStyle = C.ink;
  ctx.font = '800 32px "NotoSansTC"';
  ctx.textAlign = 'left';
  ctx.fillText('款教育工具', mainW / 2 - 50 + countW / 2 + 14, 345);

  // 底部小字
  ctx.fillStyle = C.inkMuted;
  ctx.font = '700 19px "NotoSansTC"';
  ctx.textAlign = 'center';
  ctx.fillText('課堂互動 · AI 教案 · 閱讀評量 · 趣味遊戲 一站搞定', mainW / 2, 386);

  ctx.restore();

  // ─── 左上小便利貼：教育工具集 ───
  const lnW = 200, lnH = 130;
  drawStickyNote(ctx, 50, 60, lnW, lnH, C.paperBlue, -6, C.blue);
  ctx.save();
  ctx.translate(50 + lnW / 2, 60 + lnH / 2);
  ctx.rotate((-6 * Math.PI) / 180);
  ctx.translate(-lnW / 2, -lnH / 2);
  ctx.fillStyle = C.ink;
  ctx.font = '900 32px "NotoSansTC"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('開箱即用', lnW / 2, 45);
  ctx.font = '700 18px "NotoSansTC"';
  ctx.fillText('免註冊', lnW / 2, 82);
  ctx.fillText('一鍵分享給學生', lnW / 2, 108);
  ctx.restore();

  // ─── 右上小便利貼：免費 ───
  const rnW = 200, rnH = 130;
  drawStickyNote(ctx, W - rnW - 50, 60, rnW, rnH, C.paperGreen, 5, C.green);
  ctx.save();
  ctx.translate(W - rnW - 50 + rnW / 2, 60 + rnH / 2);
  ctx.rotate((5 * Math.PI) / 180);
  ctx.translate(-rnW / 2, -rnH / 2);
  ctx.fillStyle = C.ink;
  ctx.font = '900 30px "NotoSansTC"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('100% 免費', rnW / 2, 45);
  ctx.font = '700 18px "NotoSansTC"';
  ctx.fillText('無廣告', rnW / 2, 82);
  ctx.fillText('教師親手打造', rnW / 2, 108);
  ctx.restore();

  // ─── 底部 attribution bar ───
  const barY = H - 100;
  ctx.fillStyle = 'rgba(26,15,5,.85)';
  ctx.fillRect(0, barY, W, 78);
  ctx.strokeStyle = 'rgba(255,255,255,.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, barY);
  ctx.lineTo(W, barY);
  ctx.stroke();

  // 載入 favicon 當頭像
  const faviconPath = resolve(PUBLIC_DIR, 'icon-192.png');
  let faviconImg = null;
  if (existsSync(faviconPath)) {
    try { faviconImg = await loadImage(faviconPath); } catch { /* ignore */ }
  }

  const avX = 60, avY = barY + 39;
  ctx.fillStyle = C.paper;
  ctx.beginPath();
  ctx.arc(avX, avY, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(avX, avY, 28, 0, Math.PI * 2);
  ctx.stroke();
  if (faviconImg) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(avX, avY, 24, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(faviconImg, avX - 24, avY - 24, 48, 48);
    ctx.restore();
  }

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 22px "NotoSansTC"';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('阿凱老師 · 科技教育創新專區', 105, avY - 4);
  ctx.fillStyle = 'rgba(255,255,255,.75)';
  ctx.font = '600 14px "NotoSansTC"';
  ctx.fillText('桃園市龍潭區石門國小 · cagoooo.github.io/Akai', 105, avY + 18);

  // 右：分類膠囊
  ctx.fillStyle = C.accent;
  roundRect(ctx, W - 290, barY + 18, 250, 42, 21);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  roundRect(ctx, W - 290, barY + 18, 250, 42, 21);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 17px "NotoSansTC"';
  ctx.textAlign = 'center';
  ctx.fillText('立即探索 →', W - 165, barY + 45);

  return canvas.toBuffer('image/png');
}

async function main() {
  const tools = JSON.parse(readFileSync(TOOLS_JSON, 'utf-8'));
  const toolCount = tools.length;
  const categoryCounts = summarizeCategories(tools);
  const displayCount = toolCount >= 100 ? `${Math.floor(toolCount / 10) * 10}+` : `${toolCount}`;

  console.log(`📊 工具數：${toolCount}（顯示：${displayCount}）`);
  console.log(`📚 分類：`, categoryCounts);

  // 1) 產生 OG 圖
  const pngBuffer = await generateOG(tools);
  // 用 toolCount + 內容 hash 當版本，避免每次 build 都換檔名
  const hash = createHash('md5').update(pngBuffer).digest('hex').slice(0, 8);
  const ogFilename = `og-preview-${hash}.png`;
  const ogPath = resolve(PUBLIC_DIR, ogFilename);

  // 清掉舊的 og-preview-*.png（保留最新）
  for (const f of readdirSync(PUBLIC_DIR)) {
    if (/^og-preview-[a-f0-9]{8}\.png$/.test(f) && f !== ogFilename) {
      try { unlinkSync(resolve(PUBLIC_DIR, f)); } catch { /* ignore */ }
    }
  }

  writeFileSync(ogPath, pngBuffer);
  console.log(`\n✅ ${ogFilename} (${(pngBuffer.length / 1024).toFixed(0)} KB, 1200×630)`);

  // 2) 寫 site-stats.json 給前端 / 後續腳本讀
  // milestones：保留歷史 — 第一次達到 100 / 150 / 200 時凍結 ISO 時間
  let prevStats = {};
  if (existsSync(STATS_JSON)) {
    try { prevStats = JSON.parse(readFileSync(STATS_JSON, 'utf-8')); } catch { /* ignore */ }
  }
  const prevMilestones = prevStats.milestones || {};
  const milestones = { ...prevMilestones };
  for (const m of [100, 150, 200, 250, 300]) {
    if (toolCount >= m && !milestones[`tool${m}`]) {
      milestones[`tool${m}`] = new Date().toISOString();
    }
  }

  const stats = {
    toolCount,
    displayCount,
    categoryCounts,
    milestones,
    ogImage: `/${ogFilename}`,
    ogImageAbsolute: `https://cagoooo.github.io/Akai/${ogFilename}`,
    generatedAt: new Date().toISOString(),
  };
  writeFileSync(STATS_JSON, JSON.stringify(stats, null, 2) + '\n', 'utf-8');
  console.log(`✅ api/site-stats.json 已更新`);

  console.log('\n✨ 完成');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
