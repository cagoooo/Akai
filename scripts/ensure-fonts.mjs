#!/usr/bin/env node

/**
 * 確保 scripts/fonts/ 內有需要的字型檔，否則自動從 Google Fonts 下載。
 *
 * 為何不直接 commit 字型：
 *   - NotoSansTC-Bold.ttf 完整檔 ~12MB，會讓 git clone 變慢
 *   - 字型內容穩定，每次 build 從 CDN 抓一次成本可接受
 *
 * 來源：jsdelivr CDN（mirror Google Fonts 的 raw 檔，比 fonts.gstatic.com
 * 的多片段 woff2 好用，能拿到單檔 TTF）
 *
 * 用法（會被 generate-favicon.mjs / generate-home-og.mjs 在開頭呼叫）：
 *   await ensureFonts();
 *
 * 也可直接執行：node scripts/ensure-fonts.mjs
 */

import { existsSync, mkdirSync, writeFileSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FONT_DIR = resolve(__dirname, 'fonts');

if (!existsSync(FONT_DIR)) mkdirSync(FONT_DIR, { recursive: true });

const FONTS = [
  {
    name: 'NotoSansTC-Bold.ttf',
    // Google Fonts 官方 repo 的 Variable Font（@napi-rs/canvas 接受）
    // 與本地原本使用的 NotoSansTC-Bold.ttf 為同一檔（11.9MB）
    url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/notosanstc/NotoSansTC%5Bwght%5D.ttf',
    minSize: 5_000_000, // 預期 ~12MB，<5MB 視為損毀
  },
];

export async function ensureFonts() {
  for (const f of FONTS) {
    const dest = resolve(FONT_DIR, f.name);
    if (existsSync(dest)) {
      const size = statSync(dest).size;
      if (size >= f.minSize) continue; // already have it
      console.log(`⚠️  ${f.name} 檔案異常小（${size} bytes），重新下載...`);
    } else {
      console.log(`📥 下載字型 ${f.name}（${f.url}）...`);
    }
    const res = await fetch(f.url);
    if (!res.ok) {
      throw new Error(`下載失敗 ${res.status} ${res.statusText}: ${f.url}`);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < f.minSize) {
      throw new Error(`下載的字型過小（${buf.length} bytes），可能來源錯誤`);
    }
    writeFileSync(dest, buf);
    console.log(`✅ ${f.name} (${(buf.length / 1024 / 1024).toFixed(2)} MB)`);
  }
}

// 允許直接執行
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` ||
    process.argv[1].endsWith('ensure-fonts.mjs')) {
  ensureFonts().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
