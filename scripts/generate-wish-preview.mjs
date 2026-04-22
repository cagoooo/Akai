#!/usr/bin/env node

/**
 * 產生「阿凱老師的許願池」專屬 OG 社群分享預覽圖
 *
 * 產出：client/public/wish-preview.png（1200×630，適合 FB / LINE / Twitter 分享）
 *
 * 設計：cork 公佈欄風格 + 黃色許願便利貼 + 阿凱老師頭像
 * 以 SVG 繪製後用 sharp 轉 PNG，無需任何手動繪圖工具。
 */

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUTPUT = resolve(ROOT, 'client', 'public', 'wish-preview.png');
const FAVICON_PATH = resolve(ROOT, 'client', 'public', 'favicon.png');

// 把 favicon.png 轉成 base64 供 SVG 內嵌（若存在）
let faviconDataUrl = '';
if (existsSync(FAVICON_PATH)) {
  const favBuf = readFileSync(FAVICON_PATH);
  faviconDataUrl = `data:image/png;base64,${favBuf.toString('base64')}`;
}

const W = 1200;
const H = 630;

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <!-- Cork 軟木塞底紋（小圓點 pattern） -->
    <pattern id="cork-dots" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
      <circle cx="15" cy="20" r="1.5" fill="rgba(110,80,50,.35)"/>
      <circle cx="45" cy="40" r="1.3" fill="rgba(140,95,55,.30)"/>
      <circle cx="30" cy="55" r="1.1" fill="rgba(90,60,30,.28)"/>
      <circle cx="5" cy="50" r="1.2" fill="rgba(130,90,50,.32)"/>
    </pattern>

    <!-- 便利貼漸層（微微立體感） -->
    <linearGradient id="stickyYellow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff27a"/>
      <stop offset="100%" stop-color="#ffd966"/>
    </linearGradient>

    <!-- 便利貼投影 -->
    <filter id="noteShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="8"/>
      <feOffset dx="4" dy="6" result="offsetblur"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.35"/></feComponentTransfer>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>

    <!-- 木框紋路 -->
    <pattern id="wood" x="0" y="0" width="80" height="18" patternUnits="userSpaceOnUse">
      <rect width="80" height="18" fill="#7c4f2a"/>
      <rect width="2" height="18" x="40" fill="#6b4220"/>
      <rect width="2" height="18" x="78" fill="#8a5a32"/>
    </pattern>
  </defs>

  <!-- 背景：Cork 底色 -->
  <rect width="${W}" height="${H}" fill="#c99a6c"/>
  <rect width="${W}" height="${H}" fill="url(#cork-dots)"/>

  <!-- 頂部木框 -->
  <rect x="0" y="0" width="${W}" height="22" fill="url(#wood)"/>
  <!-- 底部木框 -->
  <rect x="0" y="${H - 22}" width="${W}" height="22" fill="url(#wood)"/>

  <!-- 左側主便利貼（傾斜 -3°，許願池標題） -->
  <g transform="translate(90 140) rotate(-3)" filter="url(#noteShadow)">
    <rect x="0" y="0" width="580" height="420" fill="url(#stickyYellow)" rx="4"/>
    <!-- 紅色圖釘 -->
    <g transform="translate(290 -12)">
      <circle cx="0" cy="0" r="16" fill="url(#stickyYellow)"/>
      <circle cx="0" cy="0" r="14" fill="#dc2626"/>
      <circle cx="-4" cy="-4" r="3" fill="rgba(255,255,255,.7)"/>
    </g>

    <!-- 標題：🪄 阿凱老師的許願池 -->
    <text x="40" y="90" font-family="'Noto Sans TC', 'Microsoft JhengHei', sans-serif"
          font-size="56" font-weight="900" fill="#1a1a1a">🪄 阿凱老師的</text>
    <text x="40" y="170" font-family="'Noto Sans TC', 'Microsoft JhengHei', sans-serif"
          font-size="80" font-weight="900" fill="#1a1a1a">許願池</text>

    <!-- 橘色螢光筆底色強調 -->
    <rect x="36" y="190" width="360" height="22" fill="#ea8a3e" opacity="0.65"/>
    <text x="40" y="210" font-family="'Noto Sans TC', sans-serif"
          font-size="22" font-weight="700" fill="#1a1a1a">教育工具許願 · 使用回饋</text>

    <!-- 分隔線 -->
    <line x1="40" y1="245" x2="540" y2="245" stroke="#8b7356" stroke-width="2" stroke-dasharray="6 4"/>

    <!-- 介紹文字 -->
    <text x="40" y="285" font-family="'Noto Sans TC', sans-serif"
          font-size="22" font-weight="600" fill="#4a3a20">有想到的教學工具點子？</text>
    <text x="40" y="318" font-family="'Noto Sans TC', sans-serif"
          font-size="22" font-weight="600" fill="#4a3a20">想給我們一點鼓勵或建議？</text>

    <!-- CTA -->
    <rect x="36" y="350" width="200" height="48" rx="10" fill="#ea8a3e" stroke="#1a1a1a" stroke-width="3"/>
    <text x="136" y="382" text-anchor="middle"
          font-family="'Noto Sans TC', sans-serif" font-size="22"
          font-weight="900" fill="#ffffff">📮 投入許願池</text>
  </g>

  <!-- 右側裝飾便利貼 1：粉色「夢幻教具」 -->
  <g transform="translate(750 100) rotate(4)" filter="url(#noteShadow)">
    <rect x="0" y="0" width="320" height="130" fill="#ffd4d9" rx="4"/>
    <g transform="translate(160 -10)">
      <circle cx="0" cy="0" r="12" fill="#2563eb"/>
      <circle cx="-3" cy="-3" r="2.5" fill="rgba(255,255,255,.7)"/>
    </g>
    <text x="30" y="50" font-family="'Noto Sans TC', sans-serif"
          font-size="22" font-weight="800" fill="#1a1a1a">✨ 夢幻教具</text>
    <text x="30" y="85" font-family="'Noto Sans TC', sans-serif"
          font-size="16" font-weight="600" fill="#4a3a20">希望有...的工具！</text>
    <text x="30" y="110" font-family="'Noto Sans TC', sans-serif"
          font-size="14" font-style="italic" fill="#8b7356">— 小陳老師</text>
  </g>

  <!-- 右側裝飾便利貼 2：藍色「感謝鼓勵」 -->
  <g transform="translate(800 250) rotate(-2)" filter="url(#noteShadow)">
    <rect x="0" y="0" width="310" height="130" fill="#c8e6ff" rx="4"/>
    <g transform="translate(155 -10)">
      <circle cx="0" cy="0" r="12" fill="#16a34a"/>
      <circle cx="-3" cy="-3" r="2.5" fill="rgba(255,255,255,.7)"/>
    </g>
    <text x="30" y="50" font-family="'Noto Sans TC', sans-serif"
          font-size="22" font-weight="800" fill="#1a1a1a">💖 感謝鼓勵</text>
    <text x="30" y="85" font-family="'Noto Sans TC', sans-serif"
          font-size="16" font-weight="600" fill="#4a3a20">點石成金救了我！</text>
    <text x="30" y="110" font-family="'Noto Sans TC', sans-serif"
          font-size="14" font-style="italic" fill="#8b7356">— 靜芳老師</text>
  </g>

  <!-- 右側裝飾便利貼 3：綠色「錯誤回報」 -->
  <g transform="translate(780 405) rotate(3)" filter="url(#noteShadow)">
    <rect x="0" y="0" width="330" height="110" fill="#d4f4c7" rx="4"/>
    <g transform="translate(165 -10)">
      <circle cx="0" cy="0" r="12" fill="#eab308"/>
      <circle cx="-3" cy="-3" r="2.5" fill="rgba(255,255,255,.7)"/>
    </g>
    <text x="30" y="50" font-family="'Noto Sans TC', sans-serif"
          font-size="22" font-weight="800" fill="#1a1a1a">🐛 問題回報</text>
    <text x="30" y="82" font-family="'Noto Sans TC', sans-serif"
          font-size="15" font-weight="600" fill="#4a3a20">第 X 按鈕點不動...</text>
  </g>

  <!-- 左下 favicon（阿凱老師頭像徽章） -->
  ${faviconDataUrl ? `
  <g transform="translate(130 530)">
    <circle cx="0" cy="0" r="36" fill="#fefdfa" stroke="#1a1a1a" stroke-width="3"/>
    <image href="${faviconDataUrl}" x="-28" y="-28" width="56" height="56"/>
  </g>
  <text x="180" y="523" font-family="'Noto Sans TC', sans-serif"
        font-size="18" font-weight="700" fill="#1a1a1a">阿凱老師 · 教育科技創新專區</text>
  <text x="180" y="548" font-family="'Noto Sans TC', sans-serif"
        font-size="13" font-weight="600" fill="#4a3a20">桃園市石門國小 · cagoooo.github.io/Akai</text>
  ` : `
  <text x="130" y="540" font-family="'Noto Sans TC', sans-serif"
        font-size="18" font-weight="700" fill="#1a1a1a">阿凱老師 · 教育科技創新專區</text>
  `}

  <!-- 右下網址標籤 -->
  <g transform="translate(930 560)">
    <rect x="0" y="0" width="200" height="38" rx="19" fill="#1a1a1a"/>
    <text x="100" y="25" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif"
          font-size="14" font-weight="800" fill="#ffffff">Akai/wish →</text>
  </g>
</svg>
`.trim();

// SVG → PNG 轉換（1200×630）
await sharp(Buffer.from(svg))
  .png({ compressionLevel: 9, quality: 95 })
  .toFile(OUTPUT);

console.log(`\n✨ 許願池 OG 預覽圖已生成`);
console.log(`   尺寸：${W} × ${H}`);
console.log(`   輸出：${OUTPUT}\n`);
