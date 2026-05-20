#!/usr/bin/env node

/**
 * 首頁 OG 圖「heatmap 變體」(v3.6.27+)
 *
 * 與 generate-home-og.mjs 同風格但主視覺不同：
 *   - 主便利貼工具數縮小到副位
 *   - 中央改為 2×2 熱門工具縮圖拼貼（拍立得風格）
 *   - 各拼貼下方標工具名 + 短描述
 *   - 用於 LINE / FB 分享時想呈現「實際工具長相」而非單純數字
 *
 * 來源：client/src/data/featuredTools.ts（手動 curate 的 ID 陣列）
 *
 * 輸出：
 *   - client/public/og-preview-heatmap-XXX.png（檔名加 md5 hash）
 *   - 寫入 client/public/api/site-stats.json 的 ogImageHeatmap 欄位
 *
 * 用法：
 *   node scripts/generate-home-og-heatmap.mjs
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
const FEATURED_FILE = resolve(ROOT, 'client', 'src', 'data', 'featuredTools.ts');

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

function truncate(text, ctx, maxWidth) {
  let str = text;
  if (ctx.measureText(str).width <= maxWidth) return str;
  while (ctx.measureText(str + '…').width > maxWidth && str.length > 0) {
    str = str.slice(0, -1);
  }
  return str + '…';
}

// 拍立得相片：白底框 + 工具預覽圖 + 下方標題
async function drawPolaroid(ctx, x, y, w, h, tool, rotate, pinColor) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate((rotate * Math.PI) / 180);
  ctx.translate(-w / 2, -h / 2);

  // 陰影
  ctx.shadowColor = 'rgba(0,0,0,.35)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 7;
  ctx.fillStyle = C.paper;
  ctx.fillRect(0, 0, w, h);
  ctx.shadowColor = 'transparent';

  // 細邊
  ctx.strokeStyle = C.paperEdge;
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, w, h);

  // 圖片區（上方留 padding，下方留標題空間）
  const padX = 10;
  const padTop = 10;
  const imgH = w - padX * 2; // 正方形
  const imgX = padX;
  const imgY = padTop;

  // 預覽圖
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
    // fallback
    ctx.fillStyle = '#e8e2d6';
    ctx.fillRect(imgX, imgY, w - padX * 2, imgH);
    ctx.fillStyle = C.muted;
    ctx.font = '900 36px "NotoSansTC"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`#${tool.id}`, w / 2, imgY + imgH / 2);
  }

  // 分類膠帶（左上）
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

  // 工具編號（右上）
  ctx.fillStyle = 'rgba(0,0,0,.55)';
  roundRect(ctx, w - padX - 50, imgY + 4, 46, 20, 3);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = '900 11px "NotoSansTC"';
  ctx.fillText(`#${String(tool.id).padStart(3, '0')}`, w - padX - 50 + 23, imgY + 4 + 10);

  // 標題（下方）
  ctx.fillStyle = C.ink;
  ctx.font = '900 14px "NotoSansTC"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const titleY = imgY + imgH + 22;
  const titleMaxW = w - padX * 2;
  ctx.fillText(truncate(tool.title, ctx, titleMaxW), w / 2, titleY);

  // 圖釘（拍立得頂部正中）
  drawPin(ctx, w / 2, -2, 9, pinColor);

  ctx.restore();
}

async function generateOG(tools, featuredIds) {
  const W = 1200, H = 630;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  drawCorkBackground(ctx, W, H);

  // 解析 4 個 featured tools（缺的會跳過，後續用其他 ID 補）
  const byId = new Map(tools.map((t) => [t.id, t]));
  const picked = [];
  for (const id of featuredIds) {
    const tool = byId.get(id);
    if (!tool) continue;
    // 載入 preview
    let previewImg = null;
    if (tool.previewUrl) {
      const fname = tool.previewUrl.split('/').pop();
      const localPath = resolve(PUBLIC_DIR, 'previews', fname);
      if (existsSync(localPath)) {
        try { previewImg = await loadImage(localPath); } catch { /* ignore */ }
      }
    }
    picked.push({ ...tool, previewImg });
    if (picked.length >= 4) break;
  }

  if (picked.length < 4) {
    // 不足 4 個就 fallback 用倒數的工具補
    const need = 4 - picked.length;
    const lastTools = tools.slice(-need).reverse();
    for (const tool of lastTools) {
      if (picked.find((p) => p.id === tool.id)) continue;
      let previewImg = null;
      if (tool.previewUrl) {
        const fname = tool.previewUrl.split('/').pop();
        const localPath = resolve(PUBLIC_DIR, 'previews', fname);
        if (existsSync(localPath)) {
          try { previewImg = await loadImage(localPath); } catch { /* ignore */ }
        }
      }
      picked.push({ ...tool, previewImg });
      if (picked.length >= 4) break;
    }
  }

  // ─── 左側標題區（不偏旋轉的固定字塊） ───
  const titleX = 60;
  const titleY = 90;

  // 小膠帶「精選」
  ctx.fillStyle = C.accent;
  roundRect(ctx, titleX, titleY, 130, 30, 4);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = '900 14px "NotoSansTC"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🔥 精選工具', titleX + 65, titleY + 15);

  // 主標題
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.font = '900 56px "NotoSansTC"';
  ctx.fillText('科技教育', titleX, titleY + 95);
  ctx.fillText('創新專區', titleX, titleY + 158);

  // 副標題
  ctx.fillStyle = 'rgba(255,255,255,.92)';
  ctx.font = '700 22px "NotoSansTC"';
  ctx.fillText(`${tools.length} 款國小教育工具`, titleX, titleY + 200);

  // 描述
  ctx.fillStyle = 'rgba(255,255,255,.78)';
  ctx.font = '600 15px "NotoSansTC"';
  ctx.fillText('阿凱老師 · 桃園市石門國小', titleX, titleY + 230);
  ctx.fillText('課堂互動 · AI 教案 · 閱讀評量', titleX, titleY + 254);

  // 「立即探索」膠囊
  ctx.fillStyle = C.accent;
  roundRect(ctx, titleX, titleY + 280, 180, 44, 22);
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  roundRect(ctx, titleX, titleY + 280, 180, 44, 22);
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = '900 16px "NotoSansTC"';
  ctx.textAlign = 'center';
  ctx.fillText('立即探索 →', titleX + 90, titleY + 308);

  // ─── 右側 2×2 拍立得拼貼 ───
  const polW = 200;
  const polH = 240;
  const gap = 16;
  const gridX = 540;
  const gridY = 60;
  const rotations = [-3, 2, 2.5, -2];
  const pinColors = ['#dc2626', '#2563eb', '#16a34a', '#eab308'];

  for (let i = 0; i < picked.length; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = gridX + col * (polW + gap);
    const y = gridY + row * (polH + gap);
    await drawPolaroid(ctx, x, y, polW, polH, picked[i], rotations[i], pinColors[i]);
  }

  // ─── 底部 attribution bar（與 home OG 一致） ───
  const barY = H - 90;
  ctx.fillStyle = 'rgba(26,15,5,.85)';
  ctx.fillRect(0, barY, W, 68);
  ctx.strokeStyle = 'rgba(255,255,255,.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, barY);
  ctx.lineTo(W, barY);
  ctx.stroke();

  // 載入阿凱老師真人頭像（不是 favicon — 那是品牌 logo）
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
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
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

  // 最近更新浮水印
  const updateLabel = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit' });
  ctx.fillStyle = 'rgba(255,255,255,.5)';
  ctx.font = '600 10px "NotoSansTC"';
  ctx.fillText(`📅 ${updateLabel} 更新`, 88, avY + 30);

  // 右側標籤
  ctx.fillStyle = '#fde047';
  roundRect(ctx, W - 220, barY + 18, 180, 32, 16);
  ctx.fill();
  ctx.fillStyle = C.ink;
  ctx.font = '900 14px "NotoSansTC"';
  ctx.textAlign = 'center';
  ctx.fillText('熱門工具拼貼預覽', W - 130, barY + 39);

  return canvas.toBuffer('image/png');
}

async function readFeaturedIds() {
  // 簡單 import 不行（TS 檔），直接 parse 數字陣列
  const src = readFileSync(FEATURED_FILE, 'utf-8');
  const match = src.match(/FEATURED_TOOL_IDS:\s*number\[\]\s*=\s*\[([\s\S]*?)\]/);
  if (!match) throw new Error('無法解析 client/src/data/featuredTools.ts 的 FEATURED_TOOL_IDS');
  // 先剝掉行內 // 註解再 split
  const body = match[1]
    .split('\n')
    .map((line) => line.replace(/\/\/.*$/, '').trim())
    .join(',');
  const ids = body
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
  return ids;
}

async function main() {
  const allTools = JSON.parse(readFileSync(TOOLS_JSON, 'utf-8'));
  // 排除 isInternal（#100 等站位）— 工具數與「真實工具」對齊
  const tools = allTools.filter((t) => !t.isInternal);
  const featuredIds = await readFeaturedIds();
  console.log(`🎨 heatmap OG：精選 ${featuredIds.slice(0, 4).join(', ')}（共 ${tools.length} 款工具）\n`);

  const pngBuffer = await generateOG(tools, featuredIds);
  const hash = createHash('md5').update(pngBuffer).digest('hex').slice(0, 8);
  const filename = `og-preview-heatmap-${hash}.png`;
  const outPath = resolve(PUBLIC_DIR, filename);

  // 清掉舊的 heatmap PNG
  for (const f of readdirSync(PUBLIC_DIR)) {
    if (/^og-preview-heatmap-[a-f0-9]{8}\.png$/.test(f) && f !== filename) {
      try { unlinkSync(resolve(PUBLIC_DIR, f)); } catch { /* ignore */ }
    }
  }

  writeFileSync(outPath, pngBuffer);
  console.log(`✅ ${filename} (${(pngBuffer.length / 1024).toFixed(0)} KB, 1200×630)`);

  // 更新 site-stats.json 加 ogImageHeatmap 欄位
  if (existsSync(STATS_JSON)) {
    const stats = JSON.parse(readFileSync(STATS_JSON, 'utf-8'));
    stats.ogImageHeatmap = `/${filename}`;
    stats.ogImageHeatmapAbsolute = `https://cagoooo.github.io/Akai/${filename}`;
    writeFileSync(STATS_JSON, JSON.stringify(stats, null, 2) + '\n', 'utf-8');
    console.log(`✅ api/site-stats.json 已加 ogImageHeatmap`);
  }

  console.log('\n✨ 完成');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
