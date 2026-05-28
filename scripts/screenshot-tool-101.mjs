#!/usr/bin/env node
import { chromium } from 'playwright';
import sharp from 'sharp';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '..', 'client', 'public', 'previews', 'tool_101.webp');
const URL = 'https://cagoooo.github.io/maze-3d-game/';

const browser = await chromium.launch({ headless: true });
try {
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 1280 },
    deviceScaleFactor: 2,
  });
  await ctx.addInitScript(() => {
    try {
      const dismissKeys = [
        'tyc_tut_done','tyc_known_version','tyc_nokey_collapsed','tyc_notify',
        'tour_complete','onboarding_done','hasSeenTour','tutorial_dismissed',
        'cookie_accepted','announcement_dismissed','welcome_shown',
        'akai_onboarded_v1','akai_install_dismissed',
        'maze_seen_intro','maze_tutorial_done','maze_intro_dismissed',
      ];
      dismissKeys.forEach((k) => localStorage.setItem(k, '1'));
    } catch (e) {}
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);

  await page.evaluate(() => {
    const selectors = [
      '.driver-popover','.driver-overlay','.driver-active-element',
      '.shepherd-element','.shepherd-modal-overlay-container',
      '.introjs-overlay','.introjs-helperLayer','.introjs-tooltipReferenceLayer',
      '#updateBanner','#cookieBanner','#announcement',
      '[class*="cookie-banner"]','[class*="cookie-consent"]',
      '[class*="onboard"]','[class*="tutorial"]','[class*="tour-tooltip"]',
      '.akai-ob-bg','.akai-ob-modal','[class*="akai-ob-"]',
    ];
    selectors.forEach((s) => document.querySelectorAll(s).forEach((el) => el.remove()));
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);

  const buf = await page.screenshot({ type: 'png', fullPage: false });
  await sharp(buf)
    .resize(1024, 1024, { fit: 'cover', position: 'top' })
    .webp({ quality: 88 })
    .toFile(OUT);
  console.log(`✅ saved ${OUT}`);
} finally {
  await browser.close();
}
