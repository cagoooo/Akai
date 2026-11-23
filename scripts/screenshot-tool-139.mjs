#!/usr/bin/env node
// #139 鱻魚特色學園：截課程網站首頁（主圖是遊戲世界的實際畫面）
import { chromium } from 'playwright';
import sharp from 'sharp';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '..', 'client', 'public', 'previews', 'tool_139.webp');
const URL = 'https://cagoooo.github.io/xianyu-minecraft/';


const browser = await chromium.launch({ headless: true });
try {
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 1280 },
    serviceWorkers: 'block', // 不讓「有新版本」提示出現在截圖裡
    deviceScaleFactor: 2,
    colorScheme: 'light',
  });
  await ctx.addInitScript(() => {
    try {
      ['tour_complete', 'onboarding_done', 'cookie_accepted', 'announcement_dismissed', 'welcome_shown']
        .forEach((k) => localStorage.setItem(k, '1'));
    } catch (e) {}
  });

  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  await page.evaluate(() => {
    document.querySelectorAll('#sw-update-bar, [class*="cookie-banner"], [class*="onboard"]').forEach((el) => el.remove());
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1500);

  const buf = await page.screenshot({ type: 'png', fullPage: false });
  await sharp(buf)
    .resize(1024, 1024, { fit: 'cover', position: 'top' })
    .webp({ quality: 88 })
    .toFile(OUT);
  console.log(`✅ saved ${OUT}`);
} finally {
  await browser.close();
}
