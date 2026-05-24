#!/usr/bin/env node

/**
 * 100 工具達成紀念 OG 圖（v3.6.52）
 *
 * 與 generate-home-og*.mjs 同 cork 風格，但主視覺強調慶祝：
 *   - 中央金色緞帶「🎉 100 工具達成」
 *   - 4 張代表作拍立得拼貼（固定 [100, 81, 46, 3] — 索引神器 + 排行前 3）
 *   - 中央巨大「100」金字當印章
 *   - 達成日期讀 site-stats.milestones.tool100
 *   - 撒花裝飾（純 Canvas 畫圈圈 + 矩形）
 *
 * 用於：social share 紀念分享圖、share/100.html landing。
 *
 * 輸出：
 *   - client/public/og-preview-celebration-100-XXX.png（檔名加 md5 hash）
 *   - 寫入 client/public/api/site-stats.json 的 ogImageCelebration 欄位
 *
 * 用法：
 *   node scripts/generate-100-celebration-og.mjs
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, unlinkSync } from 'node:fs';
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

// 固定主角：#100 索引神器 + #81 教學駕駛艙 + #46 場地預約 + #3 即時投票
const CELEBRATION_TOOL_IDS = [100, 81, 46, 3];

await ensureFonts();
GlobalFonts.registerFromPath(FONT_PATH, 'NotoSansTC');

const C = {
  cork: '#c99a6c',
  corkDark: '#a87a4f',
  wood: '#7c4f2a',
  woodDark: '#6b4220',
  woodLight: '#8a5a32',
  paper: '#fefdfa',
  paperEdge: '#d8d4c8',
  ink: '#1a1a1a',
  inkSoft: '#3a3a3a',
  inkMuted: '#4a3a20',
  muted: '#8b7356',
  accent: '#ea8a3e',
  red: '#dc2626',
  redDeep: '#7a1a18',
  pinShine: '#ff8585',
  // 金色系
  goldDeep: '#a87520',
  gold: '#e8b341',
  goldLight: '#fde047',
  goldShine: '#fff4b8',
};

const CATEGORY_LABEL = {
  communication: '溝通互動',
  teaching: '教學設計',
  language: '語文寫作',
  reading: '語文閱讀',
  utilities: '實用工具',
  games: '教育遊戲',
  interactive: '互動體驗',
};

// confetti 撒花的 8 種色票
const CONFETTI_COLORS = ['#dc2626', '#ea8a3e', '#fde047', '#16a34a', '#2563eb', '#c026d3', '#ec4899', '#06b6d4'];

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

function drawPin(ctx, cx, cy, r, color) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.35)';
  ctx.shadowBlur = r * 0.6;
  ctx.shadowOffsetY = r * 0.3;
  const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.1, cx, cy, r);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.35, C.pinShine);
  g.addColorStop(0.85, color);
  g.addColorStop(1, C.redDeep);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,.75)';
  ctx.beginPath();
  ctx.arc(cx - r * 0.32, cy - r * 0.4, r * 0.25, 0, Math.PI * 2);
  ctx.fill();
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

// 撒花：30 片，散在背景 + 木條之間
function drawConfetti(ctx, W, H) {
  // 用固定 seed 確保 deterministic（同樣輸入產同樣 hash）
  let seed = 1234567;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 0xffffffff;
  };

  for (let i = 0; i < 36; i++) {
    const x = 30 + rand() * (W - 60);
    const y = 35 + rand() * (H - 130); // 避開上下木條與底部 attribution bar
    // 避開中央主視覺區（防止跟拍立得 / 100 字打架）
    if (x > 320 && x < 880 && y > 130 && y < 460) continue;

    const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    const angle = rand() * Math.PI * 2;
    const isCircle = rand() < 0.35;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.globalAlpha = 0.75 + rand() * 0.25;
    ctx.fillStyle = color;

    if (isCircle) {
      const r = 3 + rand() * 4;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // 矩形彩帶
      const w = 8 + rand() * 8;
      const h = 3 + rand() * 3;
      ctx.fillRect(-w / 2, -h / 2, w, h);
    }
    ctx.restore();
  }
}

function truncate(text, ctx, maxWidth) {
  let str = text;
  if (ctx.measureText(str).width <= maxWidth) return str;
  while (ctx.measureText(str + '…').width > maxWidth && str.length > 0) {
    str = str.slice(0, -1);
  }
  return str + '…';
}

// 拍立得 — 與 heatmap 同設計
async function drawPolaroid(ctx, x, y, w, h, tool, rotate, pinColor) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate((rotate * Math.PI) / 180);
  ctx.translate(-w / 2, -h / 2);

  ctx.shadowColor = 'rgba(0,0,0,.35)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 7;
  ctx.fillStyle = C.paper;
  ctx.fillRect(0, 0, w, h);
  ctx.shadowColor = 'transparent';

  ctx.strokeStyle = C.paperEdge;
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, w, h);

  const padX = 10;
  const padTop = 10;
  const imgH = w - padX * 2;
  const imgX = padX;
  const imgY = padTop;

  if (tool.previewImg) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(imgX, imgY, w - padX * 2, imgH);
    ctx.clip();
    const ratio = Math.max(
      (w - padX * 2) / tool.previewImg.width,
      imgH / tool.previewImg.height
    );
    const drawW = tool.previewImg.width * ratio;
    const drawH = tool.previewImg.height * ratio;
    ctx.drawImage(
      tool.previewImg,
      imgX + (w - padX * 2 - drawW) / 2,
      imgY + (imgH - drawH) / 2,
      drawW,
      drawH
    );
    ctx.restore();
  } else {
    ctx.fillStyle = '#e8e2d6';
    ctx.fillRect(imgX, imgY, w - padX * 2, imgH);
    ctx.fillStyle = C.muted;
    ctx.font = '900 36px "NotoSansTC"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`#${tool.id}`, w / 2, imgY + imgH / 2);
  }

  // 分類膠帶
  const cat = tool.category;
  const catBg = {
    communication: '#2563eb',
    teaching: '#16a34a',
    language: '#c026d3',
    reading: '#eab308',
    utilities: '#64748b',
    games: '#ec4899',
    interactive: '#06b6d4',
  }[cat] || C.muted;
  ctx.fillStyle = catBg;
  roundRect(ctx, padX + 4, imgY + 4, 64, 20, 3);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = '900 11px "NotoSansTC"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(CATEGORY_LABEL[cat] || cat, padX + 4 + 32, imgY + 4 + 10);

  // 編號（右上）— 紀念版用金底
  ctx.fillStyle = C.goldDeep;
  roundRect(ctx, w - padX - 50, imgY + 4, 46, 20, 3);
  ctx.fill();
  ctx.fillStyle = C.goldShine;
  ctx.font = '900 11px "NotoSansTC"';
  ctx.fillText(`#${String(tool.id).padStart(3, '0')}`, w - padX - 50 + 23, imgY + 4 + 10);

  // 標題
  ctx.fillStyle = C.ink;
  ctx.font = '900 14px "NotoSansTC"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const titleY = imgY + imgH + 22;
  const titleMaxW = w - padX * 2;
  ctx.fillText(truncate(tool.title, ctx, titleMaxW), w / 2, titleY);

  drawPin(ctx, w / 2, -2, 9, pinColor);

  ctx.restore();
}

// 中央巨大金色「100」印章（疊在拍立得拼貼後面）
function drawGiantHundred(ctx, cx, cy) {
  ctx.save();
  // 外圈金色光暈
  const glow = ctx.createRadialGradient(cx, cy, 20, cx, cy, 180);
  glow.addColorStop(0, 'rgba(253, 224, 71, .42)');
  glow.addColorStop(0.5, 'rgba(232, 179, 65, .22)');
  glow.addColorStop(1, 'rgba(232, 179, 65, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, 180, 0, Math.PI * 2);
  ctx.fill();

  // 主字「100」金色漸層 + ink stroke
  const g = ctx.createLinearGradient(cx, cy - 80, cx, cy + 80);
  g.addColorStop(0, C.goldShine);
  g.addColorStop(0.45, C.goldLight);
  g.addColorStop(1, C.goldDeep);

  ctx.font = '900 220px "NotoSansTC"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 深 ink 外圈描邊增加可讀性
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'rgba(26,15,5,.55)';
  ctx.strokeText('100', cx, cy);

  ctx.fillStyle = g;
  ctx.fillText('100', cx, cy);

  // 金箔細高光線
  ctx.strokeStyle = 'rgba(255,255,255,.35)';
  ctx.lineWidth = 1.5;
  ctx.strokeText('100', cx, cy);

  ctx.restore();
}

// 上方金色緞帶 — 「🎉 100 工具達成！」
function drawTopRibbon(ctx, cx, cy) {
  ctx.save();
  const rW = 480;
  const rH = 56;
  const x = cx - rW / 2;
  const y = cy - rH / 2;

  // 緞帶主體（金色漸層 + 暗影）
  ctx.shadowColor = 'rgba(0,0,0,.35)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  const g = ctx.createLinearGradient(x, y, x, y + rH);
  g.addColorStop(0, C.goldShine);
  g.addColorStop(0.5, C.gold);
  g.addColorStop(1, C.goldDeep);
  ctx.fillStyle = g;
  roundRect(ctx, x, y, rW, rH, 6);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // 左右燕尾
  ctx.fillStyle = C.goldDeep;
  ctx.beginPath();
  ctx.moveTo(x, y + rH / 2);
  ctx.lineTo(x - 26, y);
  ctx.lineTo(x - 26, y + rH);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + rW, y + rH / 2);
  ctx.lineTo(x + rW + 26, y);
  ctx.lineTo(x + rW + 26, y + rH);
  ctx.closePath();
  ctx.fill();

  // 內描邊
  ctx.strokeStyle = 'rgba(255,255,255,.55)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, x + 4, y + 4, rW - 8, rH - 8, 4);
  ctx.stroke();

  // 左側星星裝飾（Canvas 自畫，不靠 emoji 字型）
  drawStar(ctx, cx - 200, cy + 1, 11, C.ink);
  drawStar(ctx, cx + 200, cy + 1, 11, C.ink);

  // 文字
  ctx.fillStyle = C.ink;
  ctx.font = '900 28px "NotoSansTC"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('100 工具達成！', cx, cy + 1);

  ctx.restore();
}

// 5 角星（Canvas 自畫，避免 emoji 字型問題）
function drawStar(ctx, cx, cy, size, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI * i) / 5 - Math.PI / 2;
    const r = i % 2 === 0 ? size : size * 0.45;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

async function loadToolPreview(tool) {
  if (!tool.previewUrl) return null;
  const fname = tool.previewUrl.split('/').pop();
  const localPath = resolve(PUBLIC_DIR, 'previews', fname);
  if (!existsSync(localPath)) return null;
  try { return await loadImage(localPath); } catch { return null; }
}

async function generateOG(allTools, achievedDate) {
  const W = 1200, H = 630;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  drawCorkBackground(ctx, W, H);
  drawConfetti(ctx, W, H);

  // 載入 4 個主角
  const byId = new Map(allTools.map((t) => [t.id, t]));
  const picked = [];
  for (const id of CELEBRATION_TOOL_IDS) {
    const tool = byId.get(id);
    if (!tool) continue;
    picked.push({ ...tool, previewImg: await loadToolPreview(tool) });
  }

  // ─── 上方緞帶（中央） ───
  drawTopRibbon(ctx, W / 2, 76);

  // ─── 中央巨大「100」金字 + 4 拍立得圍繞 ───
  const cx = W / 2;
  const cy = 320;
  drawGiantHundred(ctx, cx, cy);

  // 4 張拍立得分佈四個角度（圍繞中央 100 字）
  const polW = 160;
  const polH = 200;
  const polCfg = [
    // 左上
    { x: 130, y: 145, rotate: -7, pinColor: C.red },
    // 右上
    { x: W - 130 - polW, y: 138, rotate: 6, pinColor: '#2563eb' },
    // 左下
    { x: 178, y: 350, rotate: 5, pinColor: '#16a34a' },
    // 右下
    { x: W - 178 - polW, y: 358, rotate: -6, pinColor: C.gold },
  ];

  for (let i = 0; i < picked.length; i++) {
    const cfg = polCfg[i] || polCfg[0];
    await drawPolaroid(ctx, cfg.x, cfg.y, polW, polH, picked[i], cfg.rotate, cfg.pinColor);
  }

  // ─── 達成日期（中央 100 下方）───
  const dateStr = (() => {
    if (!achievedDate) return '';
    const d = new Date(achievedDate);
    if (Number.isNaN(d.getTime())) return '';
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  })();

  ctx.fillStyle = 'rgba(254,253,250,.95)';
  ctx.font = '900 22px "NotoSansTC"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('教育工具達成', cx, 460);

  if (dateStr) {
    ctx.fillStyle = C.goldLight;
    ctx.font = '900 16px "NotoSansTC"';
    ctx.fillText(`達成日 · ${dateStr}`, cx, 484);
  }

  // ─── 底部 attribution bar ───
  const barY = H - 90;
  ctx.fillStyle = 'rgba(26,15,5,.85)';
  ctx.fillRect(0, barY, W, 68);
  ctx.strokeStyle = 'rgba(232,179,65,.45)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, barY);
  ctx.lineTo(W, barY);
  ctx.stroke();

  // 頭像
  let faviconImg = null;
  for (const fname of ['teacher-avatar.png', 'apple-touch-icon.png', 'icon-192.png']) {
    const p = resolve(PUBLIC_DIR, fname);
    if (existsSync(p)) {
      try { faviconImg = await loadImage(p); break; } catch { /* try next */ }
    }
  }

  const avX = 50, avY = barY + 35;
  ctx.fillStyle = C.paper;
  ctx.beginPath();
  ctx.arc(avX, avY, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = C.goldLight;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(avX, avY, 24, 0, Math.PI * 2);
  ctx.stroke();
  if (faviconImg) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(avX, avY, 21, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(faviconImg, avX - 21, avY - 21, 42, 42);
    ctx.restore();
  }

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 18px "NotoSansTC"';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('阿凱老師 · 科技教育創新專區', 88, avY - 3);
  ctx.fillStyle = 'rgba(255,255,255,.7)';
  ctx.font = '600 12px "NotoSansTC"';
  ctx.fillText('桃園市石門國小 · cagoooo.github.io/Akai', 88, avY + 16);

  // 右側 CTA 標籤
  ctx.fillStyle = C.goldLight;
  ctx.font = '900 14px "NotoSansTC"';
  ctx.textAlign = 'right';
  ctx.fillText('下一個 100 從你的許願開始 →', W - 32, avY + 4);
  ctx.fillStyle = 'rgba(253,224,71,.7)';
  ctx.font = '600 11px "NotoSansTC"';
  ctx.fillText('share/100.html · #100Milestone', W - 32, avY + 22);

  return canvas.toBuffer('image/png');
}

async function main() {
  const allTools = JSON.parse(readFileSync(TOOLS_JSON, 'utf-8'));

  // 讀達成日期
  let achievedDate = null;
  if (existsSync(STATS_JSON)) {
    try {
      const s = JSON.parse(readFileSync(STATS_JSON, 'utf-8'));
      achievedDate = s.milestones?.tool100 || null;
    } catch { /* ignore */ }
  }

  console.log(`🎉 100 工具達成紀念 OG：主角 ${CELEBRATION_TOOL_IDS.join(', ')}${achievedDate ? `（達成 ${achievedDate}）` : ''}\n`);

  const pngBuffer = await generateOG(allTools, achievedDate);
  const hash = createHash('md5').update(pngBuffer).digest('hex').slice(0, 8);
  const filename = `og-preview-celebration-100-${hash}.png`;
  const outPath = resolve(PUBLIC_DIR, filename);

  // 清掉舊的 celebration PNG
  for (const f of readdirSync(PUBLIC_DIR)) {
    if (/^og-preview-celebration-100-[a-f0-9]{8}\.png$/.test(f) && f !== filename) {
      try { unlinkSync(resolve(PUBLIC_DIR, f)); } catch { /* ignore */ }
    }
  }

  writeFileSync(outPath, pngBuffer);
  console.log(`✅ ${filename} (${(pngBuffer.length / 1024).toFixed(0)} KB, 1200×630)`);

  if (existsSync(STATS_JSON)) {
    const stats = JSON.parse(readFileSync(STATS_JSON, 'utf-8'));
    stats.ogImageCelebration = `/${filename}`;
    stats.ogImageCelebrationAbsolute = `https://cagoooo.github.io/Akai/${filename}`;
    writeFileSync(STATS_JSON, JSON.stringify(stats, null, 2) + '\n', 'utf-8');
    console.log(`✅ api/site-stats.json 已加 ogImageCelebration`);
  }

  console.log('\n✨ 完成');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
