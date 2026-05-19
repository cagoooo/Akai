#!/usr/bin/env node

/**
 * Favicon / App Icon 生成器（v3.6.27+）
 *
 * 設計概念：公佈欄圖釘 — 與首頁 BulletinHome 軟木塞風格一致
 *   外圈 cork 軟木塞色，內圈黃色便利貼方形，中央「A」字 + 紅色圖釘
 *
 * 一次性輸出全套：
 *   - favicon.ico            (multi-size: 16, 32, 48)
 *   - favicon-16x16.png
 *   - favicon-32x32.png
 *   - favicon-48x48.png
 *   - apple-touch-icon.png   (180×180)
 *   - icon-192.png           (PWA / Android)
 *   - icon-512.png           (PWA splash / Android)
 *   - maskable-icon-512.png  (Android maskable, 含 safe zone padding)
 *
 * 用法：
 *   node scripts/generate-favicon.mjs
 */

import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const FONT_PATH = resolve(__dirname, 'fonts', 'NotoSansTC-Bold.ttf');
const OUT_DIR = resolve(ROOT, 'client', 'public');

if (!existsSync(FONT_PATH)) {
  console.error(`❌ 找不到字型：${FONT_PATH}`);
  process.exit(1);
}
GlobalFonts.registerFromPath(FONT_PATH, 'NotoSansTC');
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const C = {
  cork: '#c99a6c',
  corkDark: '#a87a4f',
  paper: '#fff27a',
  paperDeep: '#ffe04a',
  ink: '#1a1a1a',
  pin: '#dc2626',
  pinShine: '#ff8585',
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

/**
 * 繪製圖示
 * @param {number} size - 邊長 (px)
 * @param {object} opts
 * @param {boolean} opts.maskable - 是否為 Android maskable（內縮 safe zone）
 * @param {boolean} opts.circular - 是否要圓形 mask（PWA / iOS 外觀）
 * @param {boolean} opts.tiny - <=32px 時化簡細節（避免毛邊）
 */
function drawIcon(size, opts = {}) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const { maskable = false, tiny = false } = opts;

  // Maskable Android 要求 80% safe zone（外圍 10% 內縮，但底色仍鋪滿）
  const inset = maskable ? size * 0.1 : size * 0.06;

  // 1. cork 軟木塞底色
  const cg = ctx.createLinearGradient(0, 0, size, size);
  cg.addColorStop(0, C.cork);
  cg.addColorStop(1, C.corkDark);
  ctx.fillStyle = cg;
  if (maskable) {
    // 滿版（Android 會自己 mask 成圓）
    ctx.fillRect(0, 0, size, size);
  } else {
    // 圓角方形
    const r = size * 0.22;
    roundRect(ctx, 0, 0, size, size, r);
    ctx.fill();
  }

  // 軟木塞紋理小點（>=32 才畫，避免毛邊）
  if (!tiny) {
    const density = Math.floor(size / 8);
    for (let i = 0; i < density * density; i++) {
      const x = ((i * 31) % size);
      const y = ((i * 47) % size);
      const r = ((i * 7) % 3) * 0.4 + 0.3;
      ctx.fillStyle = `rgba(80,55,25,${0.12 + (i % 10) * 0.018})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 2. 黃色便利貼（旋轉 -3 度）
  const noteSize = size - inset * 2;
  const noteX = (size - noteSize) / 2;
  const noteY = (size - noteSize) / 2 + size * 0.015;
  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.rotate((-3 * Math.PI) / 180);
  ctx.translate(-size / 2, -size / 2 - size * 0.005);

  ctx.shadowColor = 'rgba(0,0,0,.28)';
  ctx.shadowBlur = size * 0.04;
  ctx.shadowOffsetY = size * 0.02;
  // 便利貼漸層
  const pg = ctx.createLinearGradient(noteX, noteY, noteX, noteY + noteSize);
  pg.addColorStop(0, C.paper);
  pg.addColorStop(1, C.paperDeep);
  ctx.fillStyle = pg;
  roundRect(ctx, noteX, noteY, noteSize, noteSize, size * 0.04);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // 便利貼邊框（黑線，讓 16px 也能看清）
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = Math.max(1, size * 0.018);
  roundRect(ctx, noteX, noteY, noteSize, noteSize, size * 0.04);
  ctx.stroke();

  // 中央「A」字（Akai）
  ctx.fillStyle = C.ink;
  const fontSize = noteSize * (tiny ? 0.78 : 0.7);
  ctx.font = `900 ${fontSize}px "NotoSansTC"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // 微調字位 — 視覺中心比幾何中心略低
  ctx.fillText('A', size / 2, size / 2 + noteSize * 0.04);

  ctx.restore();

  // 3. 紅色圖釘（右上角）— >=32 才畫
  if (!tiny) {
    const pinR = size * 0.13;
    const pinX = size / 2 + noteSize * 0.32;
    const pinY = noteY + noteSize * 0.02;
    // 釘陰影
    ctx.shadowColor = 'rgba(0,0,0,.32)';
    ctx.shadowBlur = size * 0.03;
    ctx.shadowOffsetY = size * 0.015;
    // 釘身
    const rg = ctx.createRadialGradient(pinX - pinR * 0.3, pinY - pinR * 0.35, pinR * 0.1, pinX, pinY, pinR);
    rg.addColorStop(0, '#ffffff');
    rg.addColorStop(0.35, C.pinShine);
    rg.addColorStop(0.85, C.pin);
    rg.addColorStop(1, '#7a1a18');
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(pinX, pinY, pinR, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    // 高光
    ctx.fillStyle = 'rgba(255,255,255,.7)';
    ctx.beginPath();
    ctx.arc(pinX - pinR * 0.32, pinY - pinR * 0.38, pinR * 0.28, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas.toBuffer('image/png');
}

async function main() {
  console.log('🎨 生成 favicon / app icon 全套...\n');

  const targets = [
    { name: 'favicon-16x16.png', size: 16, opts: { tiny: true } },
    { name: 'favicon-32x32.png', size: 32, opts: { tiny: true } },
    { name: 'favicon-48x48.png', size: 48, opts: {} },
    { name: 'favicon.png', size: 192, opts: {} },
    { name: 'apple-touch-icon.png', size: 180, opts: {} },
    { name: 'icon-192.png', size: 192, opts: {} },
    { name: 'icon-512.png', size: 512, opts: {} },
    { name: 'maskable-icon-512.png', size: 512, opts: { maskable: true } },
  ];

  for (const t of targets) {
    const buf = drawIcon(t.size, t.opts);
    const outPath = resolve(OUT_DIR, t.name);
    writeFileSync(outPath, buf);
    console.log(`  ✅ ${t.name} (${t.size}×${t.size}, ${(buf.length / 1024).toFixed(1)} KB)`);
  }

  // ICO（含 16/32/48 三尺寸）
  const buf16 = drawIcon(16, { tiny: true });
  const buf32 = drawIcon(32, { tiny: true });
  const buf48 = drawIcon(48, {});
  const icoBuf = await pngToIco([buf16, buf32, buf48]);
  writeFileSync(resolve(OUT_DIR, 'favicon.ico'), icoBuf);
  console.log(`  ✅ favicon.ico (multi-size 16/32/48, ${(icoBuf.length / 1024).toFixed(1)} KB)`);

  console.log('\n✨ 完成');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
