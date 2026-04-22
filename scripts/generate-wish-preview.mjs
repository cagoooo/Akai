#!/usr/bin/env node

/**
 * 產生「阿凱老師的許願池」專屬 OG 社群分享預覽圖 v2（精緻版）
 *
 * 產出：client/public/wish-preview.png（1200×630）
 *
 * v2 改良：
 * - 更強字級階層（許願池大字 + 陰影 + 雙層 highlight）
 * - 左上角藍色緞帶 ★ WISHES 標記
 * - 右側三張便利貼字型加大、更易讀
 * - 底部整體 attribution bar 更清爽
 * - 加入散落星星裝飾增加層次
 * - 全程純中文字型渲染，不依賴 emoji
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
  corkDark: '#b88a5a',
  wood: '#7c4f2a',
  woodDark: '#6b4220',
  woodLight: '#8a5a32',
  paper: '#fefdfa',
  ink: '#1a1a1a',
  inkSoft: '#3a3a3a',
  inkMuted: '#4a3a20',
  muted: '#8b7356',
  accent: '#ea8a3e',
  accentDeep: '#c66a20',
  red: '#c7302a',
  navy: '#1e3a8a',
  noteYellow: '#fff27a',
  noteYellowBright: '#fff4a3',
  notePink: '#ffd4d9',
  noteBlue: '#c8e6ff',
  noteGreen: '#d4f4c7',
  pin: ['#dc2626', '#2563eb', '#16a34a', '#eab308', '#c026d3'],
};

// ── 工具：圓角矩形 ──────────────────────────────
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

// ── 工具：立體圖釘 ──────────────────────────────
function drawPin(cx, cy, r = 10, color = C.pin[0]) {
  const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 1, cx, cy, r);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.35, color);
  grad.addColorStop(1, '#2a1a0a');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.75)';
  ctx.beginPath();
  ctx.arc(cx - r * 0.3, cy - r * 0.35, r * 0.25, 0, Math.PI * 2);
  ctx.fill();
}

// ── 工具：畫便利貼 ──────────────────────────────
function drawStickyNote(x, y, w, h, bg, rotate, pinColor, radius = 4) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate((rotate * Math.PI) / 180);
  ctx.translate(-w / 2, -h / 2);

  ctx.shadowColor = 'rgba(0,0,0,.3)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = bg;
  roundRect(0, 0, w, h, radius);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // 便利貼的紙張內陰影（左上角微暗）
  const innerGrad = ctx.createLinearGradient(0, 0, 0, h);
  innerGrad.addColorStop(0, 'rgba(0,0,0,.04)');
  innerGrad.addColorStop(0.2, 'rgba(0,0,0,0)');
  ctx.fillStyle = innerGrad;
  roundRect(0, 0, w, h, radius);
  ctx.fill();

  if (pinColor) {
    drawPin(w / 2, -6, 10, pinColor);
  }

  ctx.restore();
}

// ── 工具：膠帶（斜紋紙膠帶） ─────────────────────
function drawTape(cx, cy, width, color, rotate, text) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rotate * Math.PI) / 180);
  const h = 36;
  const w = width;

  // 斜紋背景
  ctx.shadowColor = 'rgba(0,0,0,.2)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = color;
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.shadowColor = 'transparent';

  // 斜紋線條
  ctx.save();
  ctx.beginPath();
  ctx.rect(-w / 2, -h / 2, w, h);
  ctx.clip();
  ctx.strokeStyle = 'rgba(0,0,0,.1)';
  ctx.lineWidth = 1;
  for (let i = -w; i < w * 2; i += 8) {
    ctx.beginPath();
    ctx.moveTo(i, -h);
    ctx.lineTo(i + h * 2, h);
    ctx.stroke();
  }
  ctx.restore();

  // 毛邊（左右）
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-w / 2, -h / 2);
  ctx.lineTo(-w / 2 - 4, -h / 2 + 4);
  ctx.lineTo(-w / 2 - 2, 0);
  ctx.lineTo(-w / 2 - 5, h / 2 - 4);
  ctx.lineTo(-w / 2, h / 2);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(w / 2, -h / 2);
  ctx.lineTo(w / 2 + 4, -h / 2 + 4);
  ctx.lineTo(w / 2 + 2, 0);
  ctx.lineTo(w / 2 + 5, h / 2 - 4);
  ctx.lineTo(w / 2, h / 2);
  ctx.closePath();
  ctx.fill();

  if (text) {
    ctx.fillStyle = '#4a3a20';
    ctx.font = '800 14px "NotoSansTC"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, 0);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  ctx.restore();
}

// ── 工具：畫星星 ────────────────────────────────
function drawStar(cx, cy, size, color, outerPoints = 4) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = color;
  ctx.beginPath();
  const r1 = size;
  const r2 = size * 0.42;
  const step = Math.PI / outerPoints;
  for (let i = 0; i < outerPoints * 2; i++) {
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

// ========== 開始繪製 ==========

// 背景：Cork 漸層（左上較亮、右下較深，增加深度）
const bgGrad = ctx.createLinearGradient(0, 0, W, H);
bgGrad.addColorStop(0, C.cork);
bgGrad.addColorStop(1, C.corkDark);
ctx.fillStyle = bgGrad;
ctx.fillRect(0, 0, W, H);

// Cork 紋理點
for (let y = 0; y < H; y += 38) {
  for (let x = 0; x < W; x += 38) {
    const opacity = 0.2 + ((x * 7 + y * 11) % 20) / 100;
    const size = 0.8 + ((x * 3 + y * 5) % 10) / 10;
    ctx.fillStyle = `rgba(80,55,25,${opacity})`;
    ctx.beginPath();
    ctx.arc(
      x + ((y * 3) % 38),
      y + ((x * 5) % 38),
      size,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}

// 上下木條
const drawWoodStrip = (y) => {
  ctx.fillStyle = C.wood;
  ctx.fillRect(0, y, W, 22);
  for (let x = 0; x < W; x += 42) {
    ctx.fillStyle = C.woodDark;
    ctx.fillRect(x, y, 2, 22);
    if (x + 40 < W) {
      ctx.fillStyle = C.woodLight;
      ctx.fillRect(x + 40, y, 2, 22);
    }
  }
  // 木紋上下陰影
  const sg = ctx.createLinearGradient(0, y, 0, y + 22);
  sg.addColorStop(0, 'rgba(0,0,0,.2)');
  sg.addColorStop(0.5, 'rgba(0,0,0,0)');
  sg.addColorStop(1, 'rgba(0,0,0,.15)');
  ctx.fillStyle = sg;
  ctx.fillRect(0, y, W, 22);
};
drawWoodStrip(0);
drawWoodStrip(H - 22);

// 散落裝飾星星
const decorStars = [
  { x: 720, y: 90, s: 8, c: 'rgba(255,215,120,.6)' },
  { x: 1060, y: 140, s: 6, c: 'rgba(255,180,80,.55)' },
  { x: 680, y: 480, s: 7, c: 'rgba(255,200,100,.5)' },
  { x: 95, y: 120, s: 5, c: 'rgba(255,200,80,.5)' },
  { x: 620, y: 540, s: 6, c: 'rgba(255,180,80,.45)' },
];
decorStars.forEach((s) => drawStar(s.x, s.y, s.s, s.c, 4));

// ── 左上角藍色緞帶 ─────────────────────────────
{
  ctx.save();
  ctx.translate(90, 85);
  ctx.rotate((-6 * Math.PI) / 180);

  ctx.shadowColor = 'rgba(0,0,0,.35)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = C.navy;
  const rbnW = 210;
  const rbnH = 32;
  // 緞帶形狀（左端尖角）
  ctx.beginPath();
  ctx.moveTo(-10, 0);
  ctx.lineTo(0, -rbnH / 2);
  ctx.lineTo(rbnW, -rbnH / 2);
  ctx.lineTo(rbnW - 6, 0);
  ctx.lineTo(rbnW, rbnH / 2);
  ctx.lineTo(0, rbnH / 2);
  ctx.closePath();
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // 緞帶文字
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 14px "NotoSansTC"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('★ 阿凱老師 · WISHES', rbnW / 2 - 5, 0);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.restore();
}

// ── 主便利貼（左側大卡，黃色，旋轉 -2.5°）──────
// 注意：mainY + mainH 必須 < barY (548) 才不會被底部 bar 遮住 CTA
const mainX = 70, mainY = 130, mainW = 600, mainH = 390;
drawStickyNote(mainX, mainY, mainW, mainH, C.noteYellow, -2.5, C.red);

// 進入旋轉座標繪製主便利貼內容
ctx.save();
ctx.translate(mainX + mainW / 2, mainY + mainH / 2);
ctx.rotate((-2.5 * Math.PI) / 180);
ctx.translate(-mainW / 2, -mainH / 2);

// 小標題 label 帶線條
ctx.strokeStyle = C.inkMuted;
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(42, 48);
ctx.lineTo(90, 48);
ctx.stroke();

ctx.fillStyle = C.inkMuted;
ctx.font = '800 15px "NotoSansTC"';
ctx.fillText('教師心聲平台', 98, 53);

// 主標題第一行：阿凱老師的
ctx.fillStyle = C.ink;
ctx.font = '900 48px "NotoSansTC"';
ctx.fillText('阿凱老師的', 40, 108);

// 主標題第二行：許願池（超大字 + 陰影 + highlight）
ctx.fillStyle = C.accent;
ctx.globalAlpha = 0.75;
ctx.fillRect(36, 148, 320, 40);
ctx.globalAlpha = 1;
ctx.fillStyle = 'rgba(0,0,0,.2)';
ctx.font = '900 88px "NotoSansTC"';
ctx.fillText('許願池', 44, 190);
ctx.fillStyle = C.ink;
ctx.fillText('許願池', 40, 186);

// 副標
ctx.fillStyle = C.inkMuted;
ctx.font = '700 19px "NotoSansTC"';
ctx.fillText('教育工具許願　·　使用回饋　·　問題回報', 40, 224);

// 虛線分隔
ctx.strokeStyle = 'rgba(74,58,32,.45)';
ctx.lineWidth = 2;
ctx.setLineDash([5, 5]);
ctx.beginPath();
ctx.moveTo(40, 248);
ctx.lineTo(560, 248);
ctx.stroke();
ctx.setLineDash([]);

// 介紹文字（用 USED_TEXT 一定會有的字）
ctx.fillStyle = C.inkSoft;
ctx.font = '600 19px "NotoSansTC"';
ctx.fillText('有想到的教學工具點子？', 40, 275);
ctx.fillText('想給我們一點鼓勵或建議？', 40, 302);

// CTA 大按鈕（往下挪以避開兩行描述）
ctx.shadowColor = 'rgba(0,0,0,.35)';
ctx.shadowBlur = 6;
ctx.shadowOffsetX = 3;
ctx.shadowOffsetY = 4;
ctx.fillStyle = C.accent;
roundRect(40, 320, 310, 50, 12);
ctx.fill();
ctx.shadowColor = 'transparent';
ctx.strokeStyle = C.ink;
ctx.lineWidth = 3;
roundRect(40, 320, 310, 50, 12);
ctx.stroke();
ctx.fillStyle = '#ffffff';
ctx.font = '900 22px "NotoSansTC"';
ctx.textAlign = 'center';
ctx.fillText('投入許願池　→', 195, 353);
ctx.textAlign = 'left';

ctx.restore();

// ── 右側便利貼 1：粉色 夢幻教具 ──────────────
{
  const nx = 740, ny = 140, nw = 360, nh = 120;
  drawStickyNote(nx, ny, nw, nh, C.notePink, 5, C.pin[1]);
  ctx.save();
  ctx.translate(nx + nw / 2, ny + nh / 2);
  ctx.rotate((5 * Math.PI) / 180);
  ctx.translate(-nw / 2, -nh / 2);

  // 分類小標
  ctx.fillStyle = '#a83a4a';
  ctx.font = '900 12px "NotoSansTC"';
  ctx.fillText('★ 夢幻教具', 22, 30);

  // 引用內文
  ctx.fillStyle = C.ink;
  ctx.font = '700 18px "NotoSansTC"';
  ctx.fillText('希望有一個自動批改', 22, 60);
  ctx.fillText('學習單的 AI 工具！', 22, 86);

  // 署名
  ctx.fillStyle = C.muted;
  ctx.font = 'italic 600 13px "NotoSansTC"';
  ctx.fillText('— 小陳老師', 22, 110);

  ctx.restore();
}

// ── 右側便利貼 2：藍色 感謝鼓勵 ──────────────
{
  const nx = 770, ny = 285, nw = 350, nh = 120;
  drawStickyNote(nx, ny, nw, nh, C.noteBlue, -3, C.pin[2]);
  ctx.save();
  ctx.translate(nx + nw / 2, ny + nh / 2);
  ctx.rotate((-3 * Math.PI) / 180);
  ctx.translate(-nw / 2, -nh / 2);

  ctx.fillStyle = '#0e4a8f';
  ctx.font = '900 12px "NotoSansTC"';
  ctx.fillText('♥ 感謝鼓勵', 22, 30);

  ctx.fillStyle = C.ink;
  ctx.font = '700 18px "NotoSansTC"';
  ctx.fillText('點石成金救了我的', 22, 60);
  ctx.fillText('期末評語撰寫時間！', 22, 86);

  ctx.fillStyle = C.muted;
  ctx.font = 'italic 600 13px "NotoSansTC"';
  ctx.fillText('— 靜芳老師', 22, 110);

  ctx.restore();
}

// ── 右側便利貼 3：綠色 問題回報 ──────────────
{
  const nx = 750, ny = 425, nw = 355, nh = 105;
  drawStickyNote(nx, ny, nw, nh, C.noteGreen, 3, C.pin[3]);
  ctx.save();
  ctx.translate(nx + nw / 2, ny + nh / 2);
  ctx.rotate((3 * Math.PI) / 180);
  ctx.translate(-nw / 2, -nh / 2);

  ctx.fillStyle = '#3d7a0f';
  ctx.font = '900 12px "NotoSansTC"';
  ctx.fillText('! 問題回報', 22, 28);

  ctx.fillStyle = C.ink;
  ctx.font = '700 17px "NotoSansTC"';
  ctx.fillText('分享連結按鈕在手機', 22, 56);
  ctx.fillText('上點不太到…', 22, 80);

  ctx.restore();
}

// ── 底部整體 attribution bar ──────────────────
// 背景條（半透明深色）
const barY = H - 82;
ctx.fillStyle = 'rgba(26,15,5,.82)';
ctx.fillRect(0, barY, W, 60);

// 上方細線
ctx.strokeStyle = 'rgba(255,255,255,.15)';
ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(0, barY);
ctx.lineTo(W, barY);
ctx.stroke();

// 左：阿凱頭像 + 署名
const avatarX = 60, avatarY = barY + 30;
// 外圈
ctx.fillStyle = C.paper;
ctx.beginPath();
ctx.arc(avatarX, avatarY, 22, 0, Math.PI * 2);
ctx.fill();
ctx.strokeStyle = '#ffffff';
ctx.lineWidth = 2.5;
ctx.beginPath();
ctx.arc(avatarX, avatarY, 22, 0, Math.PI * 2);
ctx.stroke();

if (existsSync(FAVICON_PATH)) {
  const favicon = await loadImage(FAVICON_PATH);
  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarX, avatarY, 19, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(favicon, avatarX - 19, avatarY - 19, 38, 38);
  ctx.restore();
}

// 署名主文字
ctx.fillStyle = '#ffffff';
ctx.font = '800 19px "NotoSansTC"';
ctx.fillText('阿凱老師', 96, avatarY - 4);
ctx.fillStyle = 'rgba(255,255,255,.75)';
ctx.font = '600 13px "NotoSansTC"';
ctx.fillText('桃園市石門國小 · 教育科技創新專區', 96, avatarY + 16);

// 右：URL 膠囊
ctx.fillStyle = C.accent;
roundRect(985, barY + 13, 175, 36, 18);
ctx.fill();
ctx.strokeStyle = '#ffffff';
ctx.lineWidth = 2;
roundRect(985, barY + 13, 175, 36, 18);
ctx.stroke();

ctx.fillStyle = '#ffffff';
ctx.font = '900 15px "NotoSansTC"';
ctx.textAlign = 'center';
ctx.fillText('Akai / wish　→', 1072, barY + 36);
ctx.textAlign = 'left';

// ── 輸出 PNG ─────────────────────────────────────
const buffer = canvas.toBuffer('image/png');
writeFileSync(OUTPUT, buffer);

console.log(`\n✨ 許願池 OG 預覽圖已生成（v2 精緻版）`);
console.log(`   尺寸：${W} × ${H}`);
console.log(`   檔案：${(buffer.length / 1024).toFixed(1)} KB`);
console.log(`   輸出：${OUTPUT}\n`);
