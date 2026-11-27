// 截《字戰星河》實際畫面做卡片圖 tool_143.webp（1024×1024）
// 上半：標題畫面；下半：戰鬥中畫面（兩張都是正式站實際截圖，不用 AI 生圖）
import { chromium } from 'playwright';
import sharp from 'sharp';

const URL = 'https://cagoooo.github.io/zizhan-xinghe/?v=card' + Date.now();
const OUT = 'client/public/previews/tool_143.webp';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1.6, serviceWorkers: 'block' });
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(1500);
const titleShot = await page.locator('#canvas-container').screenshot();

await page.click('button[data-diff="easy"]');
await page.click('#btn-start');
await page.waitForTimeout(5200); // 開場星門躍遷
const box = await page.locator('#game-canvas').boundingBox();
for (let i = 0; i < 10; i++) {
  await page.mouse.move(box.x + box.width * 0.16, box.y + box.height * (0.38 + 0.24 * (i % 2)), { steps: 5 });
  await page.waitForTimeout(230);
}
const playShot = await page.locator('#canvas-container').screenshot();
await browser.close();

const half = async (buf) => sharp(buf).resize(1024, 512, { fit: 'cover', position: 'centre' }).toBuffer();
await sharp({ create: { width: 1024, height: 1024, channels: 3, background: '#020617' } })
  .composite([{ input: await half(titleShot), top: 0, left: 0 }, { input: await half(playShot), top: 512, left: 0 }])
  .webp({ quality: 88 })
  .toFile(OUT);
console.log('寫出', OUT);
