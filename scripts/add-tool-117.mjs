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
const PREVIEW_PATH = resolve(PREVIEWS_DIR, 'tool_117.webp');
const FONT_PATH = resolve(__dirname, 'fonts', 'NotoSansTC-Bold.ttf');

GlobalFonts.registerFromPath(FONT_PATH, 'NotoSansTC');

const tool = {
  id: 117,
  audienceFit: {
    // 調代課是「所有老師」的共通教務需求，且教學組是系統管理員：
    // → 不限職務（omit teacherRoles = 全體教師）、不限學段（omit schoolLevels，
    //   原創為高中模板、調代課各學段皆通用，具跨學段推廣／參考價值）。
    // 不設 departments（設了會變成「僅行政」，此工具是給全體老師用的）。
    audiences: ['teacher'],
    painPoints: ['administration', 'teacher-workload'],
    priority: 88,
    reasons: {
      teacher:
        '臨時請假或要喬課時，登入點選節次就能媒合代課或調課、一鍵同意受邀，不用再一間一間辦公室去問。',
      homeroom:
        '導師臨時有事請假，系統會依同班／同科智慧排出可代課人選，出單與通知一次搞定。',
      subject:
        '科任跨班調課時，系統自動交叉比對雙方空堂，找出可互換的節次，不用再靠人工翻全校課表。',
      admin:
        '教學組可代任何老師直接建單、以 Google Chat 即時收到通知，A5 三聯通知單列印與兼代課鐘點費結算一站完成。',
      academic:
        '全校課表與調代課單據集中在同一資料源，出單狀態機與鐘點結算自動化，教務行政大幅減負。',
    },
  },
  title: '石門國小線上調代課系統',
  description:
    '阿凱老師為石門國小打造的全校課表與線上調代課系統：老師點選節次即可智慧媒合代課或調課、一鍵同意受邀，教學組能代出單、列印 A5 三聯通知單並自動結算兼代課鐘點費，告別紙本喬課的來回奔波。',
  detailedDescription: `石門國小線上調代課系統是阿凱老師為桃園市龍潭區石門國民小學打造的全校課表與調代課管理平台，改良自新北市中和高中教學組詩穎老師公開的線上調代課模板，並依國小教學現場情境重新設計，讓「找代課、喬調課、出通知單、結鐘點費」這條又瑣碎又容易出錯的行政流水線，一次在線上完成。

## 主要功能

- **教師視角週課表**：老師登入後看到自己整週課表，點選任一節次即可發起「代課」或「調課」。
- **智慧媒合**：代課依同班／同科排序建議可代人選；調課自動交叉比對雙方空堂，找出可互換的節次。
- **邀請與狀態機**：提交後自動寄邀請信給受邀老師，一鍵同意／拒絕，單據依「待確認 → 可出單 → 已出單」流轉。
- **教學組管理**：管理員可代任何老師直接建單，並透過 Google Chat webhook 即時接收通知。
- **A5 三聯通知單**：一鍵列印教師聯、班級聯、留存聯，連續節次自動合併。
- **兼代課鐘點結算**：輸入月份自動產出代課教師應領總表、自費代課對帳表與逐筆明細。

## 技術特色

純靜態前端部署於 GitHub Pages，採 Google Identity Services 登入，老師不需授權任何敏感權限；後端以 Google Apps Script 提供 JSON API，驗證身分後依授權名單控管；所有課表、單據與名單集中在 Google 試算表這個單一資料源。支援 PWA 加到手機／電腦桌面，下次點選即可像獨立 App 一樣快速啟動。`,
  url: 'https://cagoooo.github.io/smes-substitute/',
  icon: 'CalendarCheck',
  category: 'utilities',
  previewUrl: '/previews/tool_117.webp',
  ogPreviewUrl: '/previews/og/tool_117.webp',
  tags: [
    '線上調代課',
    '代課媒合',
    '調課比對',
    '全校課表',
    '教師請假',
    '教學組',
    'A5通知單',
    '鐘點結算',
    'Google登入',
    'PWA',
    '石門國小',
    '已建置完成',
  ],
  addedAt: '2026-07-11T00:00:00.000Z',
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

/** 排序插入（依 id 升序），避免尾端 push 破壞順序 */
function writeTools(path) {
  const tools = JSON.parse(readFileSync(path, 'utf8'));
  const index = tools.findIndex((item) => item.id === tool.id);
  if (index >= 0) {
    tools[index] = tool;
  } else {
    const insertIdx = tools.findIndex((item) => item.id > tool.id);
    if (insertIdx === -1) tools.push(tool);
    else tools.splice(insertIdx, 0, tool);
  }
  writeFileSync(path, `${JSON.stringify(tools, null, 2)}\n`, 'utf8');
}

async function generatePreview() {
  if (!existsSync(PREVIEWS_DIR)) mkdirSync(PREVIEWS_DIR, { recursive: true });

  const W = 1024;
  const H = 1024;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // 背景：日曆／教務藍綠漸層
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#eef6ff');
  bg.addColorStop(0.5, '#dcefe9');
  bg.addColorStop(1, '#fdf3d6');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 點點紋理
  ctx.fillStyle = 'rgba(13, 110, 96, 0.07)';
  for (let y = 0; y < H; y += 54) {
    for (let x = 0; x < W; x += 54) {
      ctx.beginPath();
      ctx.arc(x + 12, y + 12, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 標題
  ctx.fillStyle = '#0f2f2a';
  ctx.font = '900 56px "NotoSansTC"';
  ctx.textAlign = 'center';
  ctx.fillText('石門國小線上調代課系統', 512, 92);

  // 副標膠囊
  ctx.fillStyle = '#0d6e60';
  roundedRect(ctx, 232, 122, 560, 48, 24);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 22px "NotoSansTC"';
  ctx.fillText('代課媒合・調課比對・A5 三聯單・鐘點結算', 512, 154);

  // 週課表卡片
  ctx.save();
  ctx.translate(512, 600);
  ctx.rotate((-3 * Math.PI) / 180);
  ctx.shadowColor = 'rgba(15, 47, 42, 0.20)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 20;
  ctx.fillStyle = '#ffffff';
  roundedRect(ctx, -350, -360, 700, 720, 28);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#c9dcd6';
  ctx.lineWidth = 3;
  roundedRect(ctx, -350, -360, 700, 720, 28);
  ctx.stroke();

  // 卡片抬頭
  ctx.fillStyle = '#0f2f2a';
  ctx.font = '900 40px "NotoSansTC"';
  ctx.textAlign = 'left';
  ctx.fillText('我的週課表', -300, -290);
  ctx.fillStyle = '#0d6e60';
  ctx.font = '800 22px "NotoSansTC"';
  ctx.fillText('點節次 → 代課／調課', -300, -256);

  // 表格：表頭（星期）+ 5 列節次
  const days = ['一', '二', '三', '四', '五'];
  const cols = 5;
  const colW = 116;
  const gx = -300; // grid left
  const headY = -230;
  const rowH = 82;
  const gridTop = headY + 34;

  ctx.textAlign = 'center';
  // 表頭
  days.forEach((d, i) => {
    const cx = gx + i * colW + colW / 2;
    ctx.fillStyle = '#0d6e60';
    roundedRect(ctx, gx + i * colW + 6, headY, colW - 12, 40, 10);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 24px "NotoSansTC"';
    ctx.fillText(`週${d}`, cx, headY + 28);
  });

  // 課表格子（示意），標記代課與調課
  const swapCell = { r: 1, c: 1 }; // 代課
  const swapTarget = { r: 3, c: 2 }; // 調課（避開右下角印章）
  for (let r = 0; r < 5; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const x = gx + c * colW + 6;
      const y = gridTop + r * rowH + 6;
      const w = colW - 12;
      const h = rowH - 12;
      const isSwap = r === swapCell.r && c === swapCell.c;
      const isTarget = r === swapTarget.r && c === swapTarget.c;
      ctx.fillStyle = isSwap ? '#ffe0b3' : isTarget ? '#cdeafe' : '#f2f7f5';
      roundedRect(ctx, x, y, w, h, 12);
      ctx.fill();
      ctx.strokeStyle = isSwap ? '#e8891f' : isTarget ? '#2b8fd6' : '#dbe7e3';
      ctx.lineWidth = isSwap || isTarget ? 3 : 2;
      roundedRect(ctx, x, y, w, h, 12);
      ctx.stroke();
      if (isSwap) {
        ctx.fillStyle = '#b45309';
        ctx.font = '900 22px "NotoSansTC"';
        ctx.fillText('代課', x + w / 2, y + h / 2 + 8);
      } else if (isTarget) {
        ctx.fillStyle = '#1e6fb0';
        ctx.font = '900 22px "NotoSansTC"';
        ctx.fillText('調課', x + w / 2, y + h / 2 + 8);
      } else {
        // 淡淡的節次線
        ctx.strokeStyle = '#e2ede9';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 14, y + h / 2);
        ctx.lineTo(x + w - 14, y + h / 2);
        ctx.stroke();
      }
    }
  }

  // 代課 → 調課 的媒合箭頭
  const sx = gx + swapCell.c * colW + colW / 2;
  const sy = gridTop + swapCell.r * rowH + rowH / 2;
  const tx = gx + swapTarget.c * colW + colW / 2;
  const ty = gridTop + swapTarget.r * rowH + rowH / 2;
  ctx.strokeStyle = '#0d6e60';
  ctx.lineWidth = 5;
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.quadraticCurveTo((sx + tx) / 2 + 70, (sy + ty) / 2, tx, ty);
  ctx.stroke();
  ctx.setLineDash([]);
  // 箭頭頭
  ctx.fillStyle = '#0d6e60';
  ctx.beginPath();
  ctx.arc(tx, ty, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 「已建置完成」印章（右下角，避開課表格子）
  ctx.save();
  ctx.translate(838, 812);
  ctx.rotate((9 * Math.PI) / 180);
  ctx.fillStyle = '#dc2626';
  ctx.globalAlpha = 0.96;
  ctx.beginPath();
  ctx.arc(0, 0, 118, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(0, 0, 93, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = '900 32px "NotoSansTC"';
  ctx.fillText('已建置', 0, -10);
  ctx.fillText('完成', 0, 34);
  ctx.restore();

  const buffer = canvas.toBuffer('image/png');
  await sharp(buffer).webp({ quality: 92 }).toFile(PREVIEW_PATH);
}

await generatePreview();
writeTools(SERVER_TOOLS);
writeTools(CLIENT_TOOLS);

console.log('Added tool #117 (石門國小線上調代課系統) and generated preview image.');
