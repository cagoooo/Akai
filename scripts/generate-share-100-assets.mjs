#!/usr/bin/env node

/**
 * share/100.html 紀念頁專屬資產產生器
 *
 * 輸出（皆放於 client/public/share/celebration100/）：
 *   - favicon-16.png / 32.png / 48.png（瀏覽器 tab）
 *   - apple-touch-icon.png（180×180，iOS 主畫面）
 *   - favicon.svg（向量版，現代瀏覽器優先）
 *   - og-1200x630.png（FB / LINE / Twitter 分享預覽，1.91:1）
 *
 * 設計語言：跟 share/100.html 一致 — 深 navy 底 + orange→gold 漸層「100」
 *
 * 重要：所有資產走相對於 share/celebration100/ 的路徑，share/100.html 引用時
 *      必須加 ./celebration100/ 前綴；OG meta 則必須給絕對 URL 才能被 FB / LINE
 *      crawler 抓到（相對路徑會解析失敗）。
 *
 * 用法：node scripts/generate-share-100-assets.mjs
 */

import { writeFileSync, mkdirSync, existsSync, readdirSync, unlinkSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import sharp from 'sharp';
import { ensureFonts } from './ensure-fonts.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const FONT_PATH = resolve(__dirname, 'fonts', 'NotoSansTC-Bold.ttf');
const OUT_DIR = resolve(ROOT, 'client', 'public', 'share', 'celebration100');

await ensureFonts();
GlobalFonts.registerFromPath(FONT_PATH, 'NotoSansTC');

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

// 配色：跟 share/100.html 同一套
const C = {
  bg: '#111827',          // 深 navy 主底
  bgDeeper: '#0a0f1a',    // 邊緣漸層
  card: '#1f2937',
  border: '#374151',
  orange: '#ff8c42',
  gold: '#fbbf24',
  goldLight: '#fde68a',
  text: '#f9fafb',
  muted: '#9ca3af',
  ribbonGold: '#e8b341',
  ribbonGoldDeep: '#a87520',
};

// ── Helper：圓角矩形 ──────────────────────────────────
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

// ── 1. Favicon 系列（多尺寸）────────────────────────
/**
 * 在 size × size 畫布上畫「100」紀念 icon。
 * 小尺寸（16/32）只顯示「100」三個字，沒空間放裝飾；
 * 大尺寸（48/180）加上金色光暈圓圈背景。
 */
function drawFavicon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // 圓形深 navy 底（避免方形角太銳利）
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2;

  // 圓底
  ctx.fillStyle = C.bg;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  // 邊緣金色細圈（≥32px 才畫，太小看不清）
  if (size >= 32) {
    ctx.strokeStyle = C.gold;
    ctx.lineWidth = Math.max(1, size * 0.025);
    ctx.beginPath();
    ctx.arc(cx, cy, radius - ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 大尺寸加金色光暈
  if (size >= 64) {
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.85);
    glow.addColorStop(0, 'rgba(251, 191, 36, 0.22)');
    glow.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.85, 0, Math.PI * 2);
    ctx.fill();
  }

  // 中央「100」數字（orange→gold 漸層）
  // 字體大小 = 直徑 × 比例（小 icon 比例放大，因為留白能小一點）
  const ratio = size <= 32 ? 0.66 : size <= 48 ? 0.60 : 0.56;
  const fontSize = Math.round(size * ratio);
  ctx.font = `900 ${fontSize}px NotoSansTC`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const grad = ctx.createLinearGradient(0, cy - fontSize / 2, 0, cy + fontSize / 2);
  grad.addColorStop(0, C.orange);
  grad.addColorStop(1, C.gold);
  ctx.fillStyle = grad;

  // 微微下移補償視覺重心（數字底部留白多）
  ctx.fillText('100', cx, cy + size * 0.04);

  return canvas.toBuffer('image/png');
}

// ── 2. SVG Favicon（向量版，現代瀏覽器優先）────────
function svgFavicon() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="num" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${C.orange}"/>
      <stop offset="100%" stop-color="${C.gold}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${C.gold}" stop-opacity=".22"/>
      <stop offset="100%" stop-color="${C.gold}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="32" cy="32" r="32" fill="${C.bg}"/>
  <circle cx="32" cy="32" r="30.5" fill="none" stroke="${C.gold}" stroke-width="1.5"/>
  <circle cx="32" cy="32" r="27" fill="url(#glow)"/>
  <text x="32" y="42.5" text-anchor="middle"
        font-family="'Noto Sans TC','PingFang TC','Microsoft JhengHei',sans-serif"
        font-weight="900" font-size="36" fill="url(#num)">100</text>
</svg>
`;
}

// ── 3. OG 預覽圖 1200×630 ─────────────────────────
function drawOgImage() {
  console.log('    [og] create canvas');
  const W = 1200;
  const H = 630;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  console.log('    [og] bg gradient');
  // 背景：深 navy 漸層（中央亮、邊緣暗）
  const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 700);
  bgGrad.addColorStop(0, '#1a2434');
  bgGrad.addColorStop(1, C.bgDeeper);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // 撒花點點裝飾（confetti），角落散布
  const confettiColors = ['#dc2626', '#ea8a3e', '#fde047', '#16a34a', '#2563eb', '#c026d3', '#ec4899', '#06b6d4'];
  const seed = (i) => Math.abs((Math.sin(i * 12.9898) * 43758.5453) % 1);
  // 邊框區域：上 / 下 / 左 / 右 各 50 顆，總共四圈包圍中央視覺
  const confettiZones = [
    { xMin: 0,   xMax: W,   yMin: 0,   yMax: 130 },  // 上方
    { xMin: 0,   xMax: W,   yMin: 500, yMax: H   },  // 下方
    { xMin: 0,   xMax: 280, yMin: 130, yMax: 500 },  // 左側
    { xMin: 920, xMax: W,   yMin: 130, yMax: 500 },  // 右側
  ];
  for (let i = 0; i < 60; i++) {
    const zone = confettiZones[i % confettiZones.length];
    const r1 = seed(i * 4 + 1);
    const r2 = seed(i * 4 + 2);
    const r3 = seed(i * 4 + 3);
    const r4 = seed(i * 4 + 4);
    const x = zone.xMin + r1 * (zone.xMax - zone.xMin);
    const y = zone.yMin + r2 * (zone.yMax - zone.yMin);
    const w = 6 + r3 * 14;
    const h = 3 + r4 * 5;
    const angle = r3 * Math.PI * 2;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = confettiColors[i % confettiColors.length];
    ctx.globalAlpha = 0.55;
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  console.log('    [og] confetti done');

  // 頂部金色緞帶 badge：「🎉 100 工具達成」
  const ribbonY = 70;
  const ribbonH = 60;
  // 注意：NotoSansTC-Bold 不含 emoji glyph，用幾何符號代替（★◆▶）
  const ribbonText = '★  100 工具達成  ★';
  ctx.font = '900 28px NotoSansTC';
  const ribbonTextW = ctx.measureText(ribbonText).width;
  const ribbonW = ribbonTextW + 96;
  const ribbonX = (W - ribbonW) / 2;
  // 緞帶身
  const ribbonGrad = ctx.createLinearGradient(0, ribbonY, 0, ribbonY + ribbonH);
  ribbonGrad.addColorStop(0, C.ribbonGold);
  ribbonGrad.addColorStop(1, C.ribbonGoldDeep);
  ctx.fillStyle = ribbonGrad;
  roundRect(ctx, ribbonX, ribbonY, ribbonW, ribbonH, 14);
  ctx.fill();
  // 緞帶光澤上緣
  ctx.fillStyle = 'rgba(255,255,255,.25)';
  roundRect(ctx, ribbonX, ribbonY, ribbonW, ribbonH * 0.45, 14);
  ctx.fill();
  // 緞帶兩側魚尾切角
  ctx.fillStyle = C.ribbonGoldDeep;
  ctx.beginPath();
  ctx.moveTo(ribbonX, ribbonY + ribbonH * 0.5);
  ctx.lineTo(ribbonX - 18, ribbonY + ribbonH * 0.25);
  ctx.lineTo(ribbonX - 18, ribbonY + ribbonH * 0.75);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(ribbonX + ribbonW, ribbonY + ribbonH * 0.5);
  ctx.lineTo(ribbonX + ribbonW + 18, ribbonY + ribbonH * 0.25);
  ctx.lineTo(ribbonX + ribbonW + 18, ribbonY + ribbonH * 0.75);
  ctx.closePath();
  ctx.fill();
  // 緞帶文字
  ctx.fillStyle = '#111';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(ribbonText, W / 2, ribbonY + ribbonH / 2 + 2);
  console.log('    [og] ribbon done');

  // 中央巨大「100」字（orange → gold → goldLight 漸層）
  const numFontSize = 240;
  ctx.font = `900 ${numFontSize}px NotoSansTC`;
  const numText = '100';
  const numY = 320;
  const numGrad = ctx.createLinearGradient(0, numY - 110, 0, numY + 110);
  numGrad.addColorStop(0, C.orange);
  numGrad.addColorStop(0.5, C.gold);
  numGrad.addColorStop(1, C.goldLight);
  ctx.fillStyle = numGrad;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // 描金邊強化對比
  ctx.shadowColor = 'rgba(251, 191, 36, 0.5)';
  ctx.shadowBlur = 30;
  ctx.fillText(numText, W / 2, numY);
  ctx.shadowBlur = 0;
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(168, 117, 32, .6)';
  ctx.strokeText(numText, W / 2, numY);
  console.log('    [og] big 100 done');

  // 副標：「款免費教育工具達成 ✨」
  ctx.font = '700 32px NotoSansTC';
  ctx.fillStyle = C.text;
  ctx.fillText('款免費教育工具達成', W / 2, 470);

  // 影片資訊 chip：🎬 5:32 宣傳影片
  const chipY = 525;
  const chipText = '▶  5:32 宣傳影片  ·  含中文旁白 + 字幕';
  ctx.font = '700 22px NotoSansTC';
  const chipTextW = ctx.measureText(chipText).width;
  const chipW = chipTextW + 60;
  const chipH = 50;
  const chipX = (W - chipW) / 2;
  // chip 底
  ctx.fillStyle = C.card;
  roundRect(ctx, chipX, chipY, chipW, chipH, chipH / 2);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = C.orange;
  roundRect(ctx, chipX, chipY, chipW, chipH, chipH / 2);
  ctx.stroke();
  // chip 文字
  ctx.fillStyle = C.text;
  ctx.fillText(chipText, W / 2, chipY + chipH / 2 + 1);

  // 右下角小簽名
  ctx.font = '600 16px NotoSansTC';
  ctx.fillStyle = C.muted;
  ctx.textAlign = 'right';
  ctx.fillText('阿凱老師 · 桃園市石門國小', W - 30, H - 28);

  // 左下角播放符號暗示（影片頁）
  ctx.textAlign = 'left';
  ctx.fillStyle = C.muted;
  ctx.font = '600 16px NotoSansTC';
  ctx.fillText('▶  cagoooo.github.io/Akai/share/100.html', 30, H - 28);
  console.log('    [og] all draw done, encoding PNG...');

  const buf = canvas.toBuffer('image/png');
  console.log('    [og] encoded:', buf.length, 'bytes');
  return buf;
}

// ── 主流程 ───────────────────────────────────────
console.log('🎨 產生 share/100.html 紀念頁資產...');

// 清空舊資產（避免 hash 不同造成檔案累積）
if (existsSync(OUT_DIR)) {
  for (const f of readdirSync(OUT_DIR)) {
    if (/^(favicon|apple-touch|og-).*\.(png|svg)$/.test(f)) {
      unlinkSync(resolve(OUT_DIR, f));
    }
  }
}

// Favicon set
const FAVICON_SIZES = [
  { size: 16, name: 'favicon-16.png' },
  { size: 32, name: 'favicon-32.png' },
  { size: 48, name: 'favicon-48.png' },
  { size: 180, name: 'apple-touch-icon.png' },
];
for (const { size, name } of FAVICON_SIZES) {
  const buf = drawFavicon(size);
  writeFileSync(resolve(OUT_DIR, name), buf);
  console.log(`  ✅ ${name} (${size}×${size}, ${buf.length} bytes)`);
}

// SVG favicon
writeFileSync(resolve(OUT_DIR, 'favicon.svg'), svgFavicon());
console.log(`  ✅ favicon.svg`);

// favicon.ico（多尺寸合一 — sharp 不支援 ico，用 16x16 PNG 當 ico 即可，瀏覽器都吃）
writeFileSync(resolve(OUT_DIR, 'favicon.ico'), drawFavicon(48));
console.log(`  ✅ favicon.ico (48×48 PNG, browsers accept)`);

// OG 預覽圖
try {
  console.log('  🖼️  rendering OG 1200×630...');
  const ogBuf = drawOgImage();
  writeFileSync(resolve(OUT_DIR, 'og-1200x630.png'), ogBuf);
  console.log(`  ✅ og-1200x630.png (1200×630, ${(ogBuf.length / 1024).toFixed(1)} KB)`);
} catch (err) {
  console.error('  ❌ OG render failed:', err);
  throw err;
}

console.log('\n✨ 全部資產輸出至 client/public/share/celebration100/');
console.log('   接下來請更新 client/public/share/100.html 引用這些絕對 URL。');
