#!/usr/bin/env node

/**
 * 統一工具 OG 社群分享圖生成器（v3.6.3 標準化）
 *
 * 為 tools.json 中所有工具產生統一風格的 OG 預覽圖（1200×630）：
 *   - cork 軟木塞背景 + 上下木條
 *   - 中央便利貼（依分類自動換色 + 立體圖釘）
 *   - 工具 emoji + 標題 + 分類膠帶
 *   - 左下阿凱頭像 + 署名
 *   - 右下 URL 膠囊
 *
 * 用法：
 *   node scripts/generate-unified-og.mjs           # 全部重生
 *   node scripts/generate-unified-og.mjs 84        # 只生成 ID 84
 *   node scripts/generate-unified-og.mjs 80,81,82  # 指定多個 ID
 *
 * 輸出至：client/public/previews/og/tool_X.webp
 * 同時更新 tools.json 的 ogPreviewUrl 欄位（指向新路徑）
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const FONT_PATH = resolve(__dirname, 'fonts', 'NotoSansTC-Bold.ttf');
const TOOLS_JSON = resolve(ROOT, 'client', 'public', 'api', 'tools.json');
const OG_DIR = resolve(ROOT, 'client', 'public', 'previews', 'og');
const FAVICON_PATH = resolve(ROOT, 'client', 'public', 'favicon.png');

if (!existsSync(FONT_PATH)) {
  console.error(`❌ 找不到字型：${FONT_PATH}`);
  process.exit(1);
}
GlobalFonts.registerFromPath(FONT_PATH, 'NotoSansTC');
if (!existsSync(OG_DIR)) mkdirSync(OG_DIR, { recursive: true });

// ── 配色 ────────────────────────────────────────
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
  navy: '#1e3a8a',
  red: '#c7302a',
  olive: '#7a8c3a',
};

// 分類 → 便利貼底色 + 圖釘色 + 顯示名稱
const CATEGORY_STYLE = {
  communication: { bg: '#c8e6ff', pin: '#dc2626', label: '溝通互動' },
  teaching:      { bg: '#d4f4c7', pin: '#16a34a', label: '教學設計' },
  language:      { bg: '#e8d4ff', pin: '#c026d3', label: '語文寫作' },
  reading:       { bg: '#ffe4b8', pin: '#eab308', label: '語文閱讀' },
  utilities:     { bg: '#fff27a', pin: '#dc2626', label: '實用工具' },
  games:         { bg: '#ffd4d9', pin: '#2563eb', label: '教育遊戲' },
  interactive:   { bg: '#c8f5f0', pin: '#0891b2', label: '互動體驗' },
};

// 工具 emoji 對應（與 toolAdapter.ts 一致）
const ICON_TO_EMOJI = {
  MessageSquare: '💬', MessageCircle: '💬', Sparkles: '✨', Lightbulb: '💡',
  BookOpen: '📖', Book: '📚', Gamepad2: '🎮', QrCode: '📱',
  Palette: '🎨', Music: '🎵', Calculator: '🧮', Bot: '🤖',
  Gift: '🎁', Utensils: '🍽️', Wand2: '🪄', Star: '⭐',
  Trophy: '🏆', Camera: '📷', Video: '🎬', Mic: '🎤',
  Heart: '💝', Crown: '👑', Map: '🗺️', Clock: '⏰',
  Brain: '🧠', Feather: '🪶', Rocket: '🚀', ClipboardCheck: '📋',
  Languages: '🈸', FileText: '📄', MessageSquareText: '💬',
  Library: '📚', Tool: '🛠️', School: '🏫', Users: '👥',
};

const CATEGORY_EMOJI = {
  communication: '💬', teaching: '📚', language: '✍️',
  reading: '📖', utilities: '🛠️', games: '🎮', interactive: '🎯',
};

// ── 小工具 ────────────────────────────────────
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
  const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 1, cx, cy, r);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.4, color);
  g.addColorStop(1, '#000000');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.75)';
  ctx.beginPath();
  ctx.arc(cx - r * 0.3, cy - r * 0.35, r * 0.25, 0, Math.PI * 2);
  ctx.fill();
}

function drawTape(ctx, cx, cy, w, color, rotate, text) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rotate * Math.PI) / 180);
  ctx.shadowColor = 'rgba(0,0,0,.18)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 2;
  const h = 32;
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
  for (let i = -w; i < w * 2; i += 7) {
    ctx.beginPath();
    ctx.moveTo(i, -h);
    ctx.lineTo(i + h * 2, h);
    ctx.stroke();
  }
  ctx.restore();
  if (text) {
    ctx.fillStyle = '#4a3a20';
    ctx.font = '800 13px "NotoSansTC"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, 0);
  }
  ctx.restore();
}

// ── 字串截斷 ────────────────────────────────
function truncate(text, ctx, maxWidth) {
  let str = text;
  if (ctx.measureText(str).width <= maxWidth) return str;
  while (ctx.measureText(str + '…').width > maxWidth && str.length > 0) {
    str = str.slice(0, -1);
  }
  return str + '…';
}

// 將文字切成「不可分割」的 token：
//   - ASCII 英數字連續塊（例如 "Pro" / "AI" / "PDF"）算一個 token
//   - 括號群組「(...)」整段算一個 token（若不超過 1 行寬度）
//   - 其他每個字元（CJK、標點、空白）各算一個 token
function tokenizeForWrap(text) {
  const tokens = [];
  const chars = Array.from(text);
  let i = 0;
  while (i < chars.length) {
    const ch = chars[i];
    // 括號群組：開括號（半形或全形）→ 找到對應結束括號
    if (ch === '(' || ch === '（') {
      const closer = ch === '(' ? ')' : '）';
      let j = i + 1;
      let depth = 1;
      while (j < chars.length && depth > 0) {
        if (chars[j] === ch) depth++;
        else if (chars[j] === closer) depth--;
        if (depth === 0) break;
        j++;
      }
      if (j < chars.length && depth === 0) {
        tokens.push(chars.slice(i, j + 1).join(''));
        i = j + 1;
        continue;
      }
    }
    // ASCII 英數字／空白／半形標點連續塊
    if (/[A-Za-z0-9_]/.test(ch)) {
      let j = i + 1;
      while (j < chars.length && /[A-Za-z0-9_]/.test(chars[j])) j++;
      tokens.push(chars.slice(i, j).join(''));
      i = j;
      continue;
    }
    // 其他單字元
    tokens.push(ch);
    i++;
  }
  return tokens;
}

// 多行文字繪製（token 感知；空白接續時不在行首留空白）
function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 2) {
  const tokens = tokenizeForWrap(text);
  let line = '';
  let lineCount = 0;
  let yy = y;
  for (let k = 0; k < tokens.length && lineCount < maxLines; k++) {
    const tok = tokens[k];
    const test = line + tok;
    if (ctx.measureText(test).width > maxWidth && line) {
      // 換行
      if (lineCount === maxLines - 1) {
        const remain = line + tokens.slice(k).join('');
        ctx.fillText(truncate(remain, ctx, maxWidth), x, yy);
        lineCount++;
        return;
      }
      ctx.fillText(line, x, yy);
      yy += lineHeight;
      lineCount++;
      // 行首不放空白
      line = /^\s+$/.test(tok) ? '' : tok;
    } else {
      line = test;
    }
  }
  if (line && lineCount < maxLines) ctx.fillText(line, x, yy);
}

// ═══════════════════════════════════════════════
// 主函式：產生單張 OG 圖
// ═══════════════════════════════════════════════
async function generateOG(tool, faviconImg) {
  const W = 1200, H = 630;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  const cat = CATEGORY_STYLE[tool.category] || CATEGORY_STYLE.utilities;
  // 嘗試載入工具的卡片預覽圖當左側視覺
  let toolPreview = null;
  if (tool.previewUrl) {
    const fname = tool.previewUrl.split('/').pop();
    const localPath = resolve(ROOT, 'client', 'public', 'previews', fname);
    if (existsSync(localPath)) {
      try { toolPreview = await loadImage(localPath); } catch { /* ignore */ }
    }
  }

  // ─── 背景：cork 漸層 + 紋理點 ───
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

  // ─── 上下木條 ───
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

  // ─── 中央大便利貼 ───
  const noteX = 90, noteY = 90, noteW = 1020, noteH = 410;
  ctx.save();
  ctx.translate(noteX + noteW / 2, noteY + noteH / 2);
  ctx.rotate((-1 * Math.PI) / 180);
  ctx.translate(-noteW / 2, -noteH / 2);

  ctx.shadowColor = 'rgba(0,0,0,.3)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = cat.bg;
  roundRect(ctx, 0, 0, noteW, noteH, 6);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // 紙張內陰影
  const inner = ctx.createLinearGradient(0, 0, 0, noteH);
  inner.addColorStop(0, 'rgba(0,0,0,.05)');
  inner.addColorStop(0.15, 'rgba(0,0,0,0)');
  ctx.fillStyle = inner;
  roundRect(ctx, 0, 0, noteW, noteH, 6);
  ctx.fill();

  // 圖釘
  drawPin(ctx, noteW / 2, -8, 13, cat.pin);

  // ─── 便利貼內容 ───
  // 左側：工具預覽圖（嵌入小拍立得框）
  const photoX = 50, photoY = 50, photoSize = noteH - 100;
  // 拍立得白底
  ctx.fillStyle = '#fefdfa';
  ctx.fillRect(photoX - 8, photoY - 8, photoSize + 16, photoSize + 24);
  ctx.strokeStyle = '#d8d4c8';
  ctx.lineWidth = 1;
  ctx.strokeRect(photoX - 8, photoY - 8, photoSize + 16, photoSize + 24);
  // 圖片區
  ctx.fillStyle = cat.bg;
  ctx.fillRect(photoX, photoY, photoSize, photoSize);
  if (toolPreview) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(photoX, photoY, photoSize, photoSize);
    ctx.clip();
    // 等比例填滿
    const ratio = Math.max(photoSize / toolPreview.width, photoSize / toolPreview.height);
    const drawW = toolPreview.width * ratio;
    const drawH = toolPreview.height * ratio;
    ctx.drawImage(
      toolPreview,
      photoX + (photoSize - drawW) / 2,
      photoY + (photoSize - drawH) / 2,
      drawW,
      drawH
    );
    ctx.restore();
  } else {
    // 沒圖時：色塊中央顯示工具標題首字
    ctx.fillStyle = C.ink;
    ctx.font = '900 120px "NotoSansTC"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(Array.from(tool.title)[0] || '?', photoX + photoSize / 2, photoY + photoSize / 2);
  }

  // 右側標題區
  const textX = photoX + photoSize + 40;
  const textMaxW = noteW - textX - 50;

  // 分類膠帶（純文字無 emoji）
  ctx.fillStyle = cat.pin;
  roundRect(ctx, textX, 55, 95, 28, 4);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = '900 13px "NotoSansTC"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(cat.label, textX + 47, 70);
  ctx.textBaseline = 'alphabetic';

  // 主標題
  ctx.fillStyle = C.ink;
  ctx.font = '900 48px "NotoSansTC"';
  ctx.textAlign = 'left';
  drawWrappedText(ctx, tool.title, textX, 145, textMaxW, 60, 2);

  // 描述（最多 3 行）
  ctx.fillStyle = C.inkMuted;
  ctx.font = '600 19px "NotoSansTC"';
  drawWrappedText(ctx, tool.description, textX, 270, textMaxW, 30, 3);

  // 底部彩線
  ctx.strokeStyle = cat.pin;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(textX, noteH - 60);
  ctx.lineTo(textX + 80, noteH - 60);
  ctx.stroke();

  // 「立即開啟 →」
  ctx.fillStyle = C.ink;
  ctx.font = '900 18px "NotoSansTC"';
  ctx.fillText('立即開啟 →', textX, noteH - 30);

  // 工具編號
  ctx.fillStyle = C.muted;
  ctx.font = '700 14px "NotoSansTC"';
  ctx.textAlign = 'right';
  ctx.fillText(`#${String(tool.id).padStart(3, '0')}`, noteW - 30, noteH - 30);

  ctx.restore();

  // ─── 底部 attribution bar（深色橫條） ───
  const barY = H - 100;
  ctx.fillStyle = 'rgba(26,15,5,.85)';
  ctx.fillRect(0, barY, W, 78);
  ctx.strokeStyle = 'rgba(255,255,255,.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, barY);
  ctx.lineTo(W, barY);
  ctx.stroke();

  // 左：阿凱頭像 + 署名
  const avX = 60, avY = barY + 39;
  ctx.fillStyle = C.paper;
  ctx.beginPath();
  ctx.arc(avX, avY, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(avX, avY, 26, 0, Math.PI * 2);
  ctx.stroke();
  if (faviconImg) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(avX, avY, 22, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(faviconImg, avX - 22, avY - 22, 44, 44);
    ctx.restore();
  }

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 20px "NotoSansTC"';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('阿凱老師 · 教育科技創新專區', 102, avY - 4);
  ctx.fillStyle = 'rgba(255,255,255,.7)';
  ctx.font = '600 13px "NotoSansTC"';
  ctx.fillText('桃園市石門國小 · cagoooo.github.io/Akai', 102, avY + 17);

  // 右：URL 膠囊
  ctx.fillStyle = C.accent;
  roundRect(ctx, W - 235, barY + 18, 195, 42, 21);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  roundRect(ctx, W - 235, barY + 18, 195, 42, 21);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 16px "NotoSansTC"';
  ctx.textAlign = 'center';
  ctx.fillText(`Akai/tool/${tool.id}　→`, W - 137, barY + 45);

  return canvas.toBuffer('image/png');
}

// ═══════════════════════════════════════════════
// 主流程
// ═══════════════════════════════════════════════
async function main() {
  const tools = JSON.parse(readFileSync(TOOLS_JSON, 'utf-8'));
  const arg = process.argv[2];
  let targetIds = null;
  if (arg) {
    targetIds = arg.split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
    console.log(`🎯 指定 ID：${targetIds.join(', ')}\n`);
  } else {
    console.log(`🎨 全量重生 ${tools.length} 個工具的 OG 圖\n`);
  }

  const faviconImg = existsSync(FAVICON_PATH) ? await loadImage(FAVICON_PATH) : null;

  let success = 0, failed = 0;
  for (const tool of tools) {
    if (targetIds && !targetIds.includes(tool.id)) continue;
    try {
      const pngBuffer = await generateOG(tool, faviconImg);
      const outPath = resolve(OG_DIR, `tool_${tool.id}.webp`);
      await sharp(pngBuffer).webp({ quality: 88 }).toFile(outPath);
      console.log(`  ✅ #${tool.id} ${tool.title} (${(pngBuffer.length / 1024).toFixed(0)} KB)`);
      success++;
    } catch (err) {
      console.error(`  ❌ #${tool.id} ${tool.title}: ${err.message}`);
      failed++;
    }
  }

  // 同步更新 tools.json 的 ogPreviewUrl 欄位
  let updated = 0;
  for (const tool of tools) {
    if (targetIds && !targetIds.includes(tool.id)) continue;
    const newPath = `/previews/og/tool_${tool.id}.webp`;
    if (tool.ogPreviewUrl !== newPath) {
      tool.ogPreviewUrl = newPath;
      updated++;
    }
  }
  if (updated > 0) {
    writeFileSync(TOOLS_JSON, JSON.stringify(tools, null, 2) + '\n', 'utf-8');
    console.log(`\n📝 更新了 ${updated} 個 ogPreviewUrl 欄位`);
  }

  console.log(`\n✨ 完成：${success} 成功，${failed} 失敗`);
}

main().catch(console.error);
