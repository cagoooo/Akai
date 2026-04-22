#!/usr/bin/env node

/**
 * 產生「阿凱老師的許願池」專屬 OG 社群分享預覽圖
 *
 * 產出：client/public/wish-preview.png（1200×630）
 *
 * 改用 @napi-rs/canvas + 明確載入精簡 Noto Sans TC 字型，
 * 100% 不依賴系統字型，跨平台渲染一致（Windows / Linux CI 都能正確顯示中文）。
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUTPUT = resolve(ROOT, 'client', 'public', 'wish-preview.png');
const FAVICON_PATH = resolve(ROOT, 'client', 'public', 'favicon.png');
const FONT_PATH = resolve(__dirname, 'fonts', 'NotoSansTC-WishSubset.ttf');

// ── 註冊字型 ─────────────────────────────────────
if (!existsSync(FONT_PATH)) {
  console.error(`❌ 找不到字型檔：${FONT_PATH}`);
  console.error(`   請先執行 node scripts/subset-wish-font.mjs 產生精簡字型`);
  process.exit(1);
}
GlobalFonts.registerFromPath(FONT_PATH, 'NotoSansTC');

const W = 1200;
const H = 630;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

// ── 配色 ──────────────────────────────────────────
const C = {
  cork: '#c99a6c',
  wood: '#7c4f2a',
  woodDark: '#6b4220',
  woodLight: '#8a5a32',
  paper: '#fefdfa',
  ink: '#1a1a1a',
  inkSoft: '#4a3a20',
  muted: '#8b7356',
  accent: '#ea8a3e',
  red: '#dc2626',
  noteYellow: '#fff27a',
  noteYellowMid: '#ffd966',
  notePink: '#ffd4d9',
  noteBlue: '#c8e6ff',
  noteGreen: '#d4f4c7',
  pinRed: '#dc2626',
  pinBlue: '#2563eb',
  pinGreen: '#16a34a',
  pinYellow: '#eab308',
};

// ── 小工具：圓角矩形 ────────────────────────────────
function roundRect(x, y, w, h, r) {
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

// ── 小工具：陰影的便利貼矩形 ────────────────────────
function drawStickyNote(x, y, w, h, bg, rotate, pinColor, radius = 4) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate((rotate * Math.PI) / 180);
  ctx.translate(-w / 2, -h / 2);

  // 陰影
  ctx.shadowColor = 'rgba(0,0,0,.28)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = bg;
  roundRect(0, 0, w, h, radius);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // 圖釘（便利貼頂部中央）
  if (pinColor) {
    const cx = w / 2;
    const cy = -8;
    const pr = 9;
    const grad = ctx.createRadialGradient(cx - 2, cy - 2, 1, cx, cy, pr);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.4, pinColor);
    grad.addColorStop(1, '#000000');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, pr, 0, Math.PI * 2);
    ctx.fill();
    // 白色高光
    ctx.fillStyle = 'rgba(255,255,255,.75)';
    ctx.beginPath();
    ctx.arc(cx - 3, cy - 3, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ── 小工具：在旋轉座標系裡繪製文字 ──────────────────
function drawRotatedText(text, cx, cy, rotate, fillFn) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rotate * Math.PI) / 180);
  ctx.translate(-cx, -cy);
  fillFn();
  ctx.restore();
}

// ========== 開始繪製 ==========

// 背景：Cork 底色
ctx.fillStyle = C.cork;
ctx.fillRect(0, 0, W, H);

// Cork 小圓點紋理
ctx.save();
const dotColors = [
  { color: 'rgba(110,80,50,.35)', size: 1.5 },
  { color: 'rgba(140,95,55,.30)', size: 1.3 },
  { color: 'rgba(90,60,30,.28)', size: 1.1 },
  { color: 'rgba(130,90,50,.32)', size: 1.2 },
];
for (let y = 0; y < H; y += 40) {
  for (let x = 0; x < W; x += 40) {
    const d = dotColors[(x * 7 + y * 11) % dotColors.length];
    ctx.fillStyle = d.color;
    ctx.beginPath();
    ctx.arc(x + ((y * 3) % 40), y + ((x * 5) % 40), d.size, 0, Math.PI * 2);
    ctx.fill();
  }
}
ctx.restore();

// 上下木框
const drawWoodStrip = (y) => {
  ctx.fillStyle = C.wood;
  ctx.fillRect(0, y, W, 22);
  for (let x = 0; x < W; x += 40) {
    ctx.fillStyle = C.woodDark;
    ctx.fillRect(x, y, 2, 22);
    if (x + 38 < W) {
      ctx.fillStyle = C.woodLight;
      ctx.fillRect(x + 38, y, 2, 22);
    }
  }
};
drawWoodStrip(0);
drawWoodStrip(H - 22);

// ── 左側主便利貼（黃色，旋轉 -3°）────────────────
const mainX = 90, mainY = 140, mainW = 580, mainH = 420;
drawStickyNote(mainX, mainY, mainW, mainH, C.noteYellow, -3, C.pinRed);

// 在旋轉座標系下繪製主便利貼文字
ctx.save();
ctx.translate(mainX + mainW / 2, mainY + mainH / 2);
ctx.rotate((-3 * Math.PI) / 180);
ctx.translate(-mainW / 2, -mainH / 2);

// 標題 行1：🪄 阿凱老師的（用內嵌 emoji SVG / unicode）
ctx.fillStyle = C.ink;
ctx.font = '900 56px "NotoSansTC"';
ctx.textBaseline = 'alphabetic';
// 畫 emoji 當圖示（用 unicode，會走 fallback emoji 字型；若失敗則不影響主視覺）
ctx.font = '900 56px "NotoSansTC"';
ctx.fillText('🪄', 40, 90);
ctx.fillText('阿凱老師的', 110, 90);

// 標題 行2：許願池（大字）
ctx.font = '900 80px "NotoSansTC"';
ctx.fillText('許願池', 40, 172);

// 橘色螢光筆底色（覆在副標下方）
ctx.fillStyle = C.accent;
ctx.globalAlpha = 0.65;
ctx.fillRect(36, 190, 360, 22);
ctx.globalAlpha = 1.0;

// 副標：教育工具許願 · 使用回饋
ctx.fillStyle = C.ink;
ctx.font = '700 22px "NotoSansTC"';
ctx.fillText('教育工具許願 · 使用回饋', 40, 210);

// 虛線分隔線
ctx.strokeStyle = C.muted;
ctx.lineWidth = 2;
ctx.setLineDash([6, 4]);
ctx.beginPath();
ctx.moveTo(40, 245);
ctx.lineTo(540, 245);
ctx.stroke();
ctx.setLineDash([]);

// 介紹文字
ctx.fillStyle = C.inkSoft;
ctx.font = '600 22px "NotoSansTC"';
ctx.fillText('有想到的教學工具點子？', 40, 285);
ctx.fillText('想給我們一點鼓勵或建議？', 40, 318);

// CTA 按鈕：橘底 + 黑邊
ctx.fillStyle = C.accent;
roundRect(36, 350, 240, 52, 10);
ctx.fill();
ctx.strokeStyle = C.ink;
ctx.lineWidth = 3;
roundRect(36, 350, 240, 52, 10);
ctx.stroke();

ctx.fillStyle = '#ffffff';
ctx.font = '900 22px "NotoSansTC"';
ctx.textAlign = 'center';
ctx.fillText('📮 投入許願池', 156, 384);
ctx.textAlign = 'left';

ctx.restore();

// ── 右側便利貼 1：粉色 夢幻教具（旋轉 4°） ──────
{
  const nx = 750, ny = 100, nw = 320, nh = 130;
  drawStickyNote(nx, ny, nw, nh, C.notePink, 4, C.pinBlue);
  ctx.save();
  ctx.translate(nx + nw / 2, ny + nh / 2);
  ctx.rotate((4 * Math.PI) / 180);
  ctx.translate(-nw / 2, -nh / 2);

  ctx.fillStyle = C.ink;
  ctx.font = '800 22px "NotoSansTC"';
  ctx.fillText('✨ 夢幻教具', 20, 45);
  ctx.fillStyle = C.inkSoft;
  ctx.font = '600 16px "NotoSansTC"';
  ctx.fillText('希望有...的工具！', 20, 78);
  ctx.fillStyle = C.muted;
  ctx.font = 'italic 14px "NotoSansTC"';
  ctx.fillText('— 小陳老師', 20, 105);

  ctx.restore();
}

// ── 右側便利貼 2：藍色 感謝鼓勵（旋轉 -2°） ─────
{
  const nx = 800, ny = 250, nw = 310, nh = 130;
  drawStickyNote(nx, ny, nw, nh, C.noteBlue, -2, C.pinGreen);
  ctx.save();
  ctx.translate(nx + nw / 2, ny + nh / 2);
  ctx.rotate((-2 * Math.PI) / 180);
  ctx.translate(-nw / 2, -nh / 2);

  ctx.fillStyle = C.ink;
  ctx.font = '800 22px "NotoSansTC"';
  ctx.fillText('💖 感謝鼓勵', 20, 45);
  ctx.fillStyle = C.inkSoft;
  ctx.font = '600 16px "NotoSansTC"';
  ctx.fillText('點石成金救了我！', 20, 78);
  ctx.fillStyle = C.muted;
  ctx.font = 'italic 14px "NotoSansTC"';
  ctx.fillText('— 靜芳老師', 20, 105);

  ctx.restore();
}

// ── 右側便利貼 3：綠色 問題回報（旋轉 3°） ──────
{
  const nx = 780, ny = 405, nw = 330, nh = 110;
  drawStickyNote(nx, ny, nw, nh, C.noteGreen, 3, C.pinYellow);
  ctx.save();
  ctx.translate(nx + nw / 2, ny + nh / 2);
  ctx.rotate((3 * Math.PI) / 180);
  ctx.translate(-nw / 2, -nh / 2);

  ctx.fillStyle = C.ink;
  ctx.font = '800 22px "NotoSansTC"';
  ctx.fillText('🐛 問題回報', 20, 45);
  ctx.fillStyle = C.inkSoft;
  ctx.font = '600 15px "NotoSansTC"';
  ctx.fillText('第 X 按鈕點不動...', 20, 78);

  ctx.restore();
}

// ── 左下：阿凱頭像 + 署名 ─────────────────────────
const avatarX = 130, avatarY = 565;
// 外圈
ctx.fillStyle = C.paper;
ctx.beginPath();
ctx.arc(avatarX, avatarY, 28, 0, Math.PI * 2);
ctx.fill();
ctx.strokeStyle = C.ink;
ctx.lineWidth = 3;
ctx.beginPath();
ctx.arc(avatarX, avatarY, 28, 0, Math.PI * 2);
ctx.stroke();

// 載入並繪製 favicon 當頭像
if (existsSync(FAVICON_PATH)) {
  const favicon = await loadImage(FAVICON_PATH);
  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarX, avatarY, 24, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(favicon, avatarX - 24, avatarY - 24, 48, 48);
  ctx.restore();
}

// 右側署名
ctx.fillStyle = C.ink;
ctx.font = '700 18px "NotoSansTC"';
ctx.fillText('阿凱老師 · 教育科技創新專區', 170, 562);
ctx.fillStyle = C.inkSoft;
ctx.font = '600 13px "NotoSansTC"';
ctx.fillText('桃園市石門國小 · cagoooo.github.io/Akai', 170, 583);

// ── 右下：網址膠囊 ────────────────────────────────
ctx.fillStyle = C.ink;
roundRect(930, 555, 200, 38, 19);
ctx.fill();
ctx.fillStyle = '#ffffff';
ctx.font = '800 14px "NotoSansTC"';
ctx.textAlign = 'center';
ctx.fillText('Akai/wish →', 1030, 580);
ctx.textAlign = 'left';

// ── 輸出 PNG ─────────────────────────────────────
const buffer = canvas.toBuffer('image/png');
writeFileSync(OUTPUT, buffer);

console.log(`\n✨ 許願池 OG 預覽圖已生成（canvas 渲染）`);
console.log(`   尺寸：${W} × ${H}`);
console.log(`   檔案：${(buffer.length / 1024).toFixed(1)} KB`);
console.log(`   輸出：${OUTPUT}\n`);
