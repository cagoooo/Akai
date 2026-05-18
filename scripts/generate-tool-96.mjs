#!/usr/bin/env node
// 生成 tool_96 主預覽圖（1024×1024）：DFC 行動方案即時投票系統
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const FONT_PATH = resolve(__dirname, 'fonts', 'NotoSansTC-Bold.ttf');
GlobalFonts.registerFromPath(FONT_PATH, 'NotoSansTC');

const W = 1024;
const H = 1024;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

// 漸層背景：DFC 暖色 (rose → orange → amber)
const bg = ctx.createLinearGradient(0, 0, W, H);
bg.addColorStop(0, '#FB7185');   // rose-400
bg.addColorStop(0.5, '#F97316'); // orange-500
bg.addColorStop(1, '#FBBF24');   // amber-400
ctx.fillStyle = bg;
ctx.fillRect(0, 0, W, H);

// 裝飾：右上、左下大圓點 (透明度)
ctx.globalAlpha = 0.15;
ctx.fillStyle = '#fff';
ctx.beginPath(); ctx.arc(880, 140, 130, 0, Math.PI * 2); ctx.fill();
ctx.beginPath(); ctx.arc(120, 920, 160, 0, Math.PI * 2); ctx.fill();
ctx.globalAlpha = 0.08;
ctx.beginPath(); ctx.arc(960, 850, 90, 0, Math.PI * 2); ctx.fill();
ctx.globalAlpha = 1;

// 中央白卡（圓角）
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

const cardX = 72, cardY = 96, cardW = 880, cardH = 832, cardR = 40;
// 卡片陰影
ctx.shadowColor = 'rgba(80, 30, 20, 0.25)';
ctx.shadowBlur = 40;
ctx.shadowOffsetY = 18;
roundRect(cardX, cardY, cardW, cardH, cardR);
ctx.fillStyle = '#ffffff';
ctx.fill();
ctx.shadowBlur = 0;
ctx.shadowOffsetY = 0;

// 學校 / 屆數 小標籤
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
roundRect(W / 2 - 200, cardY + 60, 400, 56, 28);
ctx.fillStyle = '#FEF3C7'; // amber-100
ctx.fill();
ctx.fillStyle = '#B45309'; // amber-700
ctx.font = '700 26px "NotoSansTC"';
ctx.fillText('龍潭國小  第 123 屆自治市', W / 2, cardY + 90);

// 主標題（兩行）
ctx.fillStyle = '#0F172A'; // slate-900
ctx.font = '900 96px "NotoSansTC"';
ctx.fillText('DFC 行動方案', W / 2, cardY + 210);
ctx.font = '900 78px "NotoSansTC"';
ctx.fillText('即時投票系統', W / 2, cardY + 308);

// 主視覺：投票箱 + 三張選票
const boxCx = W / 2;
const boxCy = cardY + 510;
const boxW = 340, boxH = 170;
// 投票箱身
roundRect(boxCx - boxW / 2, boxCy, boxW, boxH, 18);
const boxGrad = ctx.createLinearGradient(boxCx - boxW / 2, boxCy, boxCx + boxW / 2, boxCy + boxH);
boxGrad.addColorStop(0, '#E11D48'); // rose-600
boxGrad.addColorStop(1, '#B91C1C'); // red-700
ctx.fillStyle = boxGrad;
ctx.fill();
// 投票箱上沿（透視）
ctx.fillStyle = '#9F1239';
roundRect(boxCx - boxW / 2 + 8, boxCy + 10, boxW - 16, 14, 7);
ctx.fill();
// 投票口
ctx.fillStyle = '#0F172A';
roundRect(boxCx - 70, boxCy + 26, 140, 14, 7);
ctx.fill();

// 三張選票（飄落）
function ballot(cx, cy, rot, color) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot * Math.PI / 180);
  // 紙
  roundRect(-50, -30, 100, 60, 8);
  ctx.fillStyle = '#fff';
  ctx.shadowColor = 'rgba(0,0,0,0.18)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 6;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  // 勾選圓
  ctx.beginPath(); ctx.arc(-26, 0, 12, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
  // 勾
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-31, 0); ctx.lineTo(-28, 5); ctx.lineTo(-21, -4);
  ctx.stroke();
  // 行
  ctx.fillStyle = '#E5E7EB';
  roundRect(-8, -8, 50, 5, 2.5); ctx.fill();
  roundRect(-8, 3, 36, 5, 2.5); ctx.fill();
  ctx.restore();
}
// 一張正在投入投票口，兩張在箱兩側
ballot(boxCx - 150, boxCy + 60, -10, '#F97316');
ballot(boxCx + 150, boxCy + 80, 14, '#22C55E');
ballot(boxCx, boxCy - 18, -3, '#3B82F6');

// 三個能力標籤
const tags = [
  { text: '即時計票', bg: '#FEE2E2', fg: '#B91C1C' },
  { text: '公開監票', bg: '#DCFCE7', fg: '#15803D' },
  { text: '民主教育', bg: '#DBEAFE', fg: '#1D4ED8' },
];
const tagY = cardY + 740;
const tagH = 56;
const gap = 24;
ctx.font = '700 26px "NotoSansTC"';
let totalW = 0;
const tagWs = tags.map(t => {
  const w = ctx.measureText(t.text).width + 56;
  totalW += w;
  return w;
});
totalW += gap * (tags.length - 1);
let tx = W / 2 - totalW / 2;
tags.forEach((t, i) => {
  const tw = tagWs[i];
  roundRect(tx, tagY, tw, tagH, tagH / 2);
  ctx.fillStyle = t.bg;
  ctx.fill();
  ctx.fillStyle = t.fg;
  ctx.fillText(t.text, tx + tw / 2, tagY + tagH / 2);
  tx += tw + gap;
});

// 底部 caption
ctx.fillStyle = '#fff';
ctx.font = '700 24px "NotoSansTC"';
ctx.fillText('by 阿凱老師  ·  公開計票  ·  即時同步  ·  cagoooo.github.io/Akai', W / 2, H - 40);

// 輸出 PNG → WebP
const png = canvas.toBuffer('image/png');
const out = resolve(ROOT, 'client', 'public', 'previews', 'tool_96.webp');
await sharp(png).webp({ quality: 92 }).toFile(out);
console.log('OK', out);
