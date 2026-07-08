#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CLIENT_TOOLS = resolve(ROOT, 'client', 'public', 'api', 'tools.json');
const SERVER_TOOLS = resolve(ROOT, 'server', 'data', 'tools.json');
const PREVIEWS_DIR = resolve(ROOT, 'client', 'public', 'previews');
const PREVIEW_PATH = resolve(PREVIEWS_DIR, 'tool_116.webp');
const FONT_PATH = resolve(__dirname, 'fonts', 'NotoSansTC-Bold.ttf');

GlobalFonts.registerFromPath(FONT_PATH, 'NotoSansTC');

const tool = {
  id: 116,
  title: '考卷格式自動校正系統',
  description:
    '把考卷排版檢查交給自動化流程，快速標出題號、選項、答案區與版面格式問題，讓老師在列印前先完成一次穩穩的格式健檢。',
  detailedDescription: `考卷格式自動校正系統是一個替老師省下反覆校稿時間的實用工具，專注處理考卷在正式輸出前最容易漏看的格式細節：題號是否連續、選項排列是否一致、答案欄位是否清楚、版面間距是否適合列印，以及整份卷面是否維持可讀又整齊的結構。

## 主要亮點

- **格式健檢更快**：協助檢查題號、選項、段落與答案區，減少人工逐行巡看的負擔。
- **列印前更安心**：在輸出前先抓出可能造成學生作答混亂的版面問題。
- **適合教學現場**：用簡單明確的校正流程，讓老師把時間留給題目品質與學生學習。
- **已建置完成**：可直接開啟使用，適合考前複查、段考卷整理與平時測驗卷微調。

這張工具卡片歸在實用工具類，因為它處理的是教學文件製作流程中的最後一哩路：把已經完成的考卷，再整理成更穩定、更容易閱讀、更適合發給學生的版本。`,
  url: 'https://cagoooo.github.io/exam-format-app/',
  icon: 'ClipboardCheck',
  category: 'utilities',
  previewUrl: '/previews/tool_116.webp',
  ogPreviewUrl: '/previews/og/tool_116.webp',
  tags: [
    '考卷格式',
    '自動校正',
    '試卷排版',
    '教師工具',
    '列印前檢查',
    'AI 輔助',
    '文件處理',
    '已建置完成',
  ],
  addedAt: '2026-07-09T00:00:00.000Z',
};

function roundedRect(ctx, x, y, w, h, r) {
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

function drawCheck(ctx, x, y, size, color = '#0f766e') {
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(5, size / 6);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.5);
  ctx.lineTo(x + size * 0.35, y + size * 0.85);
  ctx.lineTo(x + size, y);
  ctx.stroke();
}

function writeTools(path) {
  const tools = JSON.parse(readFileSync(path, 'utf8'));
  const index = tools.findIndex((item) => item.id === tool.id);
  if (index >= 0) {
    tools[index] = tool;
  } else {
    tools.push(tool);
  }
  writeFileSync(path, `${JSON.stringify(tools, null, 2)}\n`, 'utf8');
}

async function generatePreview() {
  if (!existsSync(PREVIEWS_DIR)) mkdirSync(PREVIEWS_DIR, { recursive: true });

  const W = 1024;
  const H = 1024;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#f8fafc');
  bg.addColorStop(0.48, '#e0f2fe');
  bg.addColorStop(1, '#fef3c7');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = 'rgba(15, 118, 110, 0.08)';
  for (let y = 0; y < H; y += 56) {
    for (let x = 0; x < W; x += 56) {
      ctx.beginPath();
      ctx.arc(x + 12, y + 12, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.save();
  ctx.translate(512, 580);
  ctx.rotate((-4 * Math.PI) / 180);
  ctx.shadowColor = 'rgba(15, 23, 42, 0.18)';
  ctx.shadowBlur = 34;
  ctx.shadowOffsetY = 22;
  ctx.fillStyle = '#ffffff';
  roundedRect(ctx, -310, -390, 620, 730, 28);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 3;
  roundedRect(ctx, -310, -390, 620, 730, 28);
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = '900 48px "NotoSansTC"';
  ctx.textAlign = 'center';
  ctx.fillText('考卷格式校正單', 0, -300);

  ctx.fillStyle = '#64748b';
  ctx.font = '800 24px "NotoSansTC"';
  ctx.fillText('列印前自動檢查', 0, -252);

  const rows = [
    ['題號連續', '01 02 03 04'],
    ['選項對齊', 'A B C D'],
    ['答案區清楚', '作答欄位'],
    ['版面間距', '閱讀舒適'],
  ];

  ctx.textAlign = 'left';
  rows.forEach(([label, value], i) => {
    const y = -175 + i * 105;
    ctx.fillStyle = '#f8fafc';
    roundedRect(ctx, -250, y - 42, 500, 72, 16);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    roundedRect(ctx, -250, y - 42, 500, 72, 16);
    ctx.stroke();
    drawCheck(ctx, -220, y - 17, 38);
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 26px "NotoSansTC"';
    ctx.fillText(label, -160, y + 8);
    ctx.fillStyle = '#64748b';
    ctx.font = '800 20px "NotoSansTC"';
    ctx.fillText(value, 45, y + 8);
  });

  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i += 1) {
    const y = 260 + i * 24;
    ctx.beginPath();
    ctx.moveTo(-235, y);
    ctx.lineTo(235, y);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.translate(720, 690);
  ctx.rotate((9 * Math.PI) / 180);
  ctx.fillStyle = '#dc2626';
  ctx.globalAlpha = 0.96;
  ctx.beginPath();
  ctx.arc(0, 0, 122, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(0, 0, 96, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = '900 32px "NotoSansTC"';
  ctx.fillText('已建置', 0, -10);
  ctx.fillText('完成', 0, 34);
  ctx.restore();

  ctx.fillStyle = '#0f172a';
  ctx.font = '900 54px "NotoSansTC"';
  ctx.textAlign = 'center';
  ctx.fillText('考卷格式自動校正系統', 512, 86);

  ctx.fillStyle = '#0f766e';
  roundedRect(ctx, 312, 118, 400, 46, 23);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 21px "NotoSansTC"';
  ctx.fillText('題號・選項・答案區・列印版面', 512, 149);

  const buffer = canvas.toBuffer('image/png');
  await sharp(buffer).webp({ quality: 92 }).toFile(PREVIEW_PATH);
}

await generatePreview();
writeTools(SERVER_TOOLS);
writeTools(CLIENT_TOOLS);

console.log('Added tool #116 and generated preview image.');
