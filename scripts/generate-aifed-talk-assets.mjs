#!/usr/bin/env node

/**
 * 2026 AIFED 演講簡報 favicon + OG image 生成器
 *
 * 輸出到 client/public/akai-talk-2026/：
 *   - favicon.ico                  (multi-size: 16, 32, 48)
 *   - favicon-16x16.png
 *   - favicon-32x32.png
 *   - favicon-48x48.png
 *   - favicon.svg                  (向量版 — 高 DPI 友善)
 *   - apple-touch-icon.png         (180×180)
 *   - og-aifed-2026.png            (1200×630 社群分享卡片)
 *
 * 設計：
 *   - 石門寶藍 #1F4C3E + 米白 #F4F0E6 + 橘金 #C99744（簡報主色）
 *   - Favicon：方形 + 圓角 + 米白「演」字 + 橘金圖釘點
 *   - OG：左上 AIFED 標籤 + 中央大標題 + 下方副標 + 100 工具標籤
 *
 * 用法：
 *   node scripts/generate-aifed-talk-assets.mjs
 */

import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { ensureFonts } from './ensure-fonts.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const FONT_PATH = resolve(__dirname, 'fonts', 'NotoSansTC-Bold.ttf');
const OUT_DIR = resolve(ROOT, 'client', 'public', 'akai-talk-2026');

await ensureFonts();
GlobalFonts.registerFromPath(FONT_PATH, 'NotoSansTC');
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

// 簡報主色（取自 index.html CSS variables）
const C = {
  navy: '#1F4C3E',       // 石門寶藍 — 主底色
  navyDeep: '#143526',   // 深陰影
  navySoft: '#2F6B5A',   // 邊框 / 高光
  cream: '#F4F0E6',      // 米白主文字
  creamSoft: '#FFFFFF',  // 純白點綴
  red: '#B9512B',        // 深紅 — 圖釘
  orange: '#C99744',     // 橘金 accent
  ink: '#1A1A2E',        // 深黑文字
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

// ──────────────────────────────────────────────────────────
//  Favicon 系列
// ──────────────────────────────────────────────────────────
function drawFaviconCanvas(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const r = Math.round(size * 0.18); // 圓角半徑

  // 寶藍底
  ctx.fillStyle = C.navy;
  roundRect(ctx, 0, 0, size, size, r);
  ctx.fill();

  // 內框（米白細線）
  ctx.strokeStyle = C.cream;
  ctx.lineWidth = Math.max(1, Math.round(size * 0.025));
  const inset = Math.round(size * 0.1);
  roundRect(ctx, inset, inset, size - inset * 2, size - inset * 2, Math.round(r * 0.7));
  ctx.stroke();

  // 中央「演」字 — 米白
  ctx.fillStyle = C.cream;
  ctx.font = `900 ${Math.round(size * 0.55)}px NotoSansTC`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('演', size / 2, size / 2 + size * 0.04);

  // 右上橘金小點（圖釘隱喻）
  ctx.fillStyle = C.orange;
  ctx.beginPath();
  const pinSize = Math.max(2, Math.round(size * 0.1));
  ctx.arc(size - inset - pinSize, inset + pinSize, pinSize, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toBuffer('image/png');
}

console.log('🎨 生成 favicon 系列...');
for (const size of [16, 32, 48, 180]) {
  const buf = drawFaviconCanvas(size);
  const filename = size === 180 ? 'apple-touch-icon.png' : `favicon-${size}x${size}.png`;
  writeFileSync(resolve(OUT_DIR, filename), buf);
  console.log(`  ✅ ${filename} (${size}×${size}, ${buf.length} bytes)`);
}

// .ico (multi-size)
const icoBuf = await pngToIco([
  resolve(OUT_DIR, 'favicon-16x16.png'),
  resolve(OUT_DIR, 'favicon-32x32.png'),
  resolve(OUT_DIR, 'favicon-48x48.png'),
]);
writeFileSync(resolve(OUT_DIR, 'favicon.ico'), icoBuf);
console.log(`  ✅ favicon.ico (multi-size, ${icoBuf.length} bytes)`);

// SVG 向量版（高 DPI 友善 + 支援深淺模式）
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect x="0" y="0" width="64" height="64" rx="12" fill="${C.navy}"/>
  <rect x="6.4" y="6.4" width="51.2" height="51.2" rx="8.4" fill="none" stroke="${C.cream}" stroke-width="1.6"/>
  <circle cx="51.2" cy="12.8" r="6.4" fill="${C.orange}"/>
  <text x="32" y="42" font-family="'Noto Sans TC','PingFang TC',sans-serif" font-weight="900" font-size="36" fill="${C.cream}" text-anchor="middle">演</text>
</svg>`;
writeFileSync(resolve(OUT_DIR, 'favicon.svg'), faviconSvg, 'utf8');
console.log(`  ✅ favicon.svg (向量版, ${faviconSvg.length} bytes)`);

// ──────────────────────────────────────────────────────────
//  OG Image 1200×630
// ──────────────────────────────────────────────────────────
console.log('\n🖼️  生成 OG 圖（1200×630）...');
const W = 1200, H = 630;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

// 寶藍漸層底
const grad = ctx.createLinearGradient(0, 0, W, H);
grad.addColorStop(0, C.navy);
grad.addColorStop(1, C.navyDeep);
ctx.fillStyle = grad;
ctx.fillRect(0, 0, W, H);

// 米白外框
ctx.strokeStyle = C.cream;
ctx.lineWidth = 3;
ctx.strokeRect(20, 20, W - 40, H - 40);

// 上方 AIFED 金色標籤
ctx.fillStyle = C.orange;
roundRect(ctx, 90, 90, 380, 56, 8);
ctx.fill();
ctx.fillStyle = C.navyDeep;
ctx.font = '900 24px NotoSansTC';
ctx.textAlign = 'left';
ctx.textBaseline = 'middle';
ctx.fillText('2026 AIFED · 學術年會', 110, 118);

// 右上小品牌 chip — 拿掉 emoji 避免 font tofu
ctx.strokeStyle = C.creamSoft;
ctx.lineWidth = 1.5;
roundRect(ctx, W - 260 - 90, 90, 260, 56, 8);
ctx.stroke();
ctx.fillStyle = C.cream;
ctx.font = '700 20px NotoSansTC';
ctx.textAlign = 'right';
ctx.fillText('黃凱揚 · 阿凱老師', W - 110, 118);

// 主標 — 大字（兩行）
ctx.fillStyle = C.cream;
ctx.textAlign = 'left';
ctx.font = '900 110px NotoSansTC';
ctx.fillText('從使用者', 90, 280);
ctx.fillText('到開發者', 90, 410);

// 橘金 accent 強調線（左側）
ctx.fillStyle = C.orange;
ctx.fillRect(90, 470, 110, 6);

// 副標
ctx.fillStyle = C.cream;
ctx.font = '500 28px NotoSansTC';
ctx.fillText('一位國小教師用 AI 協作親手做出', 90, 510);

// 「100+ 款教育工具 的完整心路歷程」— 用 measureText 計算偏移確保連續排版
const part1 = '100+ 款教育工具';
const part2 = '的完整心路歷程';
ctx.font = '900 32px NotoSansTC';
const part1Width = ctx.measureText(part1).width;
ctx.fillStyle = C.orange;
ctx.fillText(part1, 90, 552);
ctx.fillStyle = C.cream;
ctx.font = '500 28px NotoSansTC';
ctx.fillText(part2, 90 + part1Width + 14, 552);

// 底部署名（右下）
ctx.fillStyle = 'rgba(244,240,230,.65)';
ctx.font = '400 19px NotoSansTC';
ctx.textAlign = 'right';
ctx.fillText('桃園市龍潭區石門國民小學', W - 90, 560);

// 右下角金色裝飾線
ctx.fillStyle = C.orange;
ctx.fillRect(W - 200, 580, 110, 4);

const ogBuf = canvas.toBuffer('image/png');
const ogPath = resolve(OUT_DIR, 'og-aifed-2026.png');
writeFileSync(ogPath, ogBuf);
console.log(`  ✅ og-aifed-2026.png (1200×630, ${(ogBuf.length / 1024).toFixed(1)} KB)`);

// 也輸出 .webp 較小檔案備用（社群平台多吃 png 但 webp 給未來瀏覽器）
const ogWebpPath = resolve(OUT_DIR, 'og-aifed-2026.webp');
await sharp(ogBuf).webp({ quality: 92 }).toFile(ogWebpPath);
const { size: webpSize } = await import('node:fs').then(fs => fs.statSync(ogWebpPath));
console.log(`  ✅ og-aifed-2026.webp (WebP, ${(webpSize / 1024).toFixed(1)} KB)`);

console.log('\n✨ 全部完成。檔案路徑：');
console.log(`   ${OUT_DIR}`);
