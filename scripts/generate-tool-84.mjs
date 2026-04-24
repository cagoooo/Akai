#!/usr/bin/env node

/**
 * 為工具 ID 84「會議記錄自動產出平台 (Pro版)」一次產生：
 *   - tool_84.webp      （1024×1024 卡片預覽圖）
 *   - tool_84_og.webp   （1200×630 社群分享圖）
 *
 * 用完整 NotoSansTC-Bold.ttf（12 MB，本機開發用）渲染。
 * 不依賴精簡字型（subset 可能缺新字）。
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const FONT_PATH = resolve(__dirname, 'fonts', 'NotoSansTC-Bold.ttf');
const OUT_DIR = resolve(ROOT, 'client', 'public', 'previews');
const SQUARE_PNG = resolve(OUT_DIR, 'tool_84.png');
const SQUARE_WEBP = resolve(OUT_DIR, 'tool_84.webp');
const OG_PNG = resolve(OUT_DIR, 'tool_84_og.png');
const OG_WEBP = resolve(OUT_DIR, 'tool_84_og.webp');

if (!existsSync(FONT_PATH)) {
  console.error(`❌ 找不到完整字型：${FONT_PATH}`);
  console.error(`   請下載 Noto Sans TC TTF 到 scripts/fonts/NotoSansTC-Bold.ttf`);
  process.exit(1);
}
GlobalFonts.registerFromPath(FONT_PATH, 'NotoSansTC');

// ── 配色（商務專業風 + cork 風味） ────────────
const COLORS = {
  navyDark: '#0f2447',
  navy: '#1e3a8a',
  navyLight: '#3b5dbb',
  orange: '#ea8a3e',
  orangeDeep: '#c66a20',
  gold: '#f5b548',
  cream: '#fef3e7',
  paper: '#fefdfa',
  ink: '#1a1a1a',
  white: '#ffffff',
  muted: '#94a3b8',
  greenCheck: '#10b981',
};

// ── 小工具：圓角矩形 ────────────────────────────
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

// ── 畫星星（裝飾用） ─────────────────────────────
function drawStar(ctx, cx, cy, size, color) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = color;
  ctx.beginPath();
  const r1 = size;
  const r2 = size * 0.42;
  const step = Math.PI / 4;
  for (let i = 0; i < 8; i++) {
    const r = i % 2 === 0 ? r1 : r2;
    const a = i * step - Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ── 背景漸層 + 光暈 ─────────────────────────────
function drawBackground(ctx, W, H) {
  // 主漸層背景
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, COLORS.navyDark);
  bg.addColorStop(0.6, COLORS.navy);
  bg.addColorStop(1, COLORS.navyLight);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 左上橘色光暈
  const glow1 = ctx.createRadialGradient(W * 0.15, H * 0.2, 10, W * 0.15, H * 0.2, W * 0.5);
  glow1.addColorStop(0, 'rgba(234,138,62,.35)');
  glow1.addColorStop(1, 'rgba(234,138,62,0)');
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, W, H);

  // 右下藍色光暈
  const glow2 = ctx.createRadialGradient(W * 0.85, H * 0.85, 10, W * 0.85, H * 0.85, W * 0.55);
  glow2.addColorStop(0, 'rgba(100,160,250,.28)');
  glow2.addColorStop(1, 'rgba(100,160,250,0)');
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, W, H);

  // 散落裝飾點/星星
  for (let i = 0; i < 25; i++) {
    const x = (i * 127 + 43) % W;
    const y = (i * 211 + 67) % H;
    const s = 1 + (i % 3);
    ctx.fillStyle = `rgba(255,255,255,${0.15 + (i % 5) * 0.05})`;
    ctx.beginPath();
    ctx.arc(x, y, s, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── 繪製會議桌 icon（裝飾） ──────────────────────
function drawMeetingIcon(ctx, cx, cy, size) {
  ctx.save();
  ctx.translate(cx, cy);

  // 筆電／螢幕
  ctx.fillStyle = COLORS.paper;
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 4;
  roundRect(ctx, -size * 0.6, -size * 0.55, size * 1.2, size * 0.75, 8);
  ctx.fill();
  ctx.stroke();

  // 螢幕內容線條
  ctx.fillStyle = COLORS.navy;
  ctx.fillRect(-size * 0.5, -size * 0.4, size, 4);
  ctx.fillStyle = COLORS.orange;
  ctx.fillRect(-size * 0.5, -size * 0.25, size * 0.65, 4);
  ctx.fillStyle = COLORS.muted;
  ctx.fillRect(-size * 0.5, -size * 0.1, size * 0.8, 3);
  ctx.fillRect(-size * 0.5, 0, size * 0.45, 3);

  // 筆電底座
  ctx.fillStyle = COLORS.paper;
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-size * 0.75, size * 0.22);
  ctx.lineTo(size * 0.75, size * 0.22);
  ctx.lineTo(size * 0.55, size * 0.32);
  ctx.lineTo(-size * 0.55, size * 0.32);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 右上角錄音 icon (mic)
  ctx.save();
  ctx.translate(size * 0.85, -size * 0.55);
  ctx.fillStyle = COLORS.orange;
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 3;
  roundRect(ctx, -size * 0.18, -size * 0.24, size * 0.36, size * 0.36, size * 0.14);
  ctx.fill();
  ctx.stroke();
  // mic 內部圓點
  ctx.fillStyle = COLORS.white;
  ctx.beginPath();
  ctx.arc(0, -size * 0.06, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
  // 支架
  ctx.fillStyle = COLORS.ink;
  ctx.fillRect(-size * 0.02, size * 0.12, size * 0.04, size * 0.16);
  ctx.restore();

  // AI 星星閃光（左上）
  drawStar(ctx, -size * 0.75, -size * 0.65, size * 0.09, COLORS.gold);
  drawStar(ctx, -size * 0.9, -size * 0.4, size * 0.05, COLORS.orange);

  ctx.restore();
}

// ── Pro 徽章 ────────────────────────────────────
function drawProBadge(ctx, x, y, size = 1) {
  ctx.save();
  ctx.translate(x, y);

  const w = 110 * size;
  const h = 44 * size;

  // 陰影
  ctx.shadowColor = 'rgba(0,0,0,.35)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;

  // 金色 Pro 膠囊
  const grad = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  grad.addColorStop(0, '#fde68a');
  grad.addColorStop(0.5, COLORS.gold);
  grad.addColorStop(1, COLORS.orangeDeep);
  ctx.fillStyle = grad;
  roundRect(ctx, -w / 2, -h / 2, w, h, h / 2);
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 3 * size;
  roundRect(ctx, -w / 2, -h / 2, w, h, h / 2);
  ctx.stroke();

  // PRO 文字
  ctx.fillStyle = COLORS.ink;
  ctx.font = `900 ${24 * size}px "NotoSansTC", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('★ PRO ★', 0, 1);

  ctx.restore();
}

// ═══════════════════════════════════════════════
// 1. 卡片預覽圖 1024×1024
// ═══════════════════════════════════════════════
function generateSquare() {
  const W = 1024, H = 1024;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  drawBackground(ctx, W, H);

  // 頂部小標籤
  ctx.fillStyle = COLORS.orange;
  ctx.font = '900 22px "NotoSansTC", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('AI MEETING TOOL', W / 2, 110);
  // 裝飾線條
  ctx.strokeStyle = COLORS.orange;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 150, 110);
  ctx.lineTo(W / 2 - 100, 110);
  ctx.moveTo(W / 2 + 100, 110);
  ctx.lineTo(W / 2 + 150, 110);
  ctx.stroke();

  // 會議 icon（置中上半）
  drawMeetingIcon(ctx, W / 2, 310, 180);

  // 主標題第一行
  ctx.fillStyle = COLORS.white;
  ctx.font = '900 88px "NotoSansTC", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('會議記錄', W / 2, 600);

  // 主標題第二行（橘色漸層）
  const titleGrad = ctx.createLinearGradient(0, 650, 0, 750);
  titleGrad.addColorStop(0, COLORS.gold);
  titleGrad.addColorStop(1, COLORS.orange);
  ctx.fillStyle = titleGrad;
  ctx.fillText('自動產出平台', W / 2, 710);

  // Pro 徽章
  drawProBadge(ctx, W / 2, 790, 1.2);

  // 底部功能特色
  ctx.fillStyle = COLORS.cream;
  ctx.font = '700 26px "NotoSansTC", sans-serif';
  ctx.fillText('AI 轉寫 · 自動摘要 · 一鍵匯出 Word / PDF', W / 2, 890);

  // 底部署名
  ctx.fillStyle = 'rgba(255,255,255,.6)';
  ctx.font = '600 18px "NotoSansTC", sans-serif';
  ctx.fillText('阿凱老師 · 教育科技創新專區', W / 2, 950);

  return canvas.toBuffer('image/png');
}

// ═══════════════════════════════════════════════
// 2. OG 社群分享圖 1200×630
// ═══════════════════════════════════════════════
function generateOG() {
  const W = 1200, H = 630;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  drawBackground(ctx, W, H);

  // 左側：標題區
  // 頂部小標籤 + 橘色線條
  ctx.strokeStyle = COLORS.orange;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(70, 95);
  ctx.lineTo(130, 95);
  ctx.stroke();

  ctx.fillStyle = COLORS.orange;
  ctx.font = '900 18px "NotoSansTC", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('AI MEETING TOOL', 145, 101);

  // 主標題第一行
  ctx.fillStyle = COLORS.white;
  ctx.font = '900 76px "NotoSansTC", sans-serif';
  ctx.fillText('會議記錄', 70, 215);

  // 主標題第二行
  const titleGrad = ctx.createLinearGradient(0, 240, 0, 310);
  titleGrad.addColorStop(0, COLORS.gold);
  titleGrad.addColorStop(1, COLORS.orange);
  ctx.fillStyle = titleGrad;
  ctx.fillText('自動產出平台', 70, 305);

  // Pro 徽章（置於標題右下）
  drawProBadge(ctx, 530, 258, 1);

  // 功能條列（白底膠囊）
  const features = [
    '✓ AI 即時轉寫語音',
    '✓ 智慧摘要與行動事項',
    '✓ Word / PDF 一鍵匯出',
  ];
  let fy = 375;
  features.forEach((f) => {
    // 底板
    ctx.fillStyle = 'rgba(255,255,255,.1)';
    roundRect(ctx, 70, fy - 22, 480, 42, 21);
    ctx.fill();
    // 勾勾圓徽章
    ctx.fillStyle = COLORS.greenCheck;
    ctx.beginPath();
    ctx.arc(94, fy - 1, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.white;
    ctx.font = '900 14px "NotoSansTC", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✓', 94, fy + 5);
    // 文字
    ctx.fillStyle = COLORS.white;
    ctx.font = '700 20px "NotoSansTC", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(f.substring(2), 115, fy + 5);
    fy += 54;
  });

  // 底部署名 + URL 膠囊
  ctx.fillStyle = 'rgba(255,255,255,.6)';
  ctx.font = '600 14px "NotoSansTC", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('阿凱老師 · 教育科技創新專區', 70, 575);
  ctx.fillStyle = 'rgba(255,255,255,.45)';
  ctx.font = '500 12px "NotoSansTC", sans-serif';
  ctx.fillText('cagoooo.github.io/Akai', 70, 598);

  // 右側：會議 icon + 裝飾
  drawMeetingIcon(ctx, 920, 280, 155);

  // 右下裝飾徽章
  ctx.save();
  ctx.translate(W - 160, H - 65);
  ctx.fillStyle = COLORS.orange;
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 3;
  roundRect(ctx, 0, 0, 130, 38, 19);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = COLORS.white;
  ctx.font = '900 14px "NotoSansTC", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('點此開始 →', 65, 19);
  ctx.restore();

  return canvas.toBuffer('image/png');
}

// ── 執行 ─────────────────────────────────────
console.log('🎨 正在生成 tool_84 圖片...\n');

const squarePng = generateSquare();
writeFileSync(SQUARE_PNG, squarePng);
await sharp(squarePng).webp({ quality: 92 }).toFile(SQUARE_WEBP);
console.log(`✅ 卡片預覽圖：${SQUARE_WEBP} (${(Buffer.byteLength(squarePng) / 1024).toFixed(1)} KB PNG)`);

const ogPng = generateOG();
writeFileSync(OG_PNG, ogPng);
await sharp(ogPng).webp({ quality: 92 }).toFile(OG_WEBP);
console.log(`✅ 社群分享圖：${OG_WEBP} (${(Buffer.byteLength(ogPng) / 1024).toFixed(1)} KB PNG)`);

console.log('\n✨ 完成！PNG 為暫存（可刪），WebP 為最終輸出。\n');
