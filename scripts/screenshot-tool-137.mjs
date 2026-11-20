#!/usr/bin/env node
// #137 PaGamO題組SKILLS技能下載器：貼上一份示範題組資料後截圖，讓卡片圖看得到「題目預覽＋下載按鈕」
import { chromium } from 'playwright';
import sharp from 'sharp';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '..', 'client', 'public', 'previews', 'tool_137.webp');
const URL = 'https://cagoooo.github.io/pagamo-gemini/';

// 示範資料（自編的候鳥短文，非真實學生資料）
const SAMPLE = {
  fileName: 'PaGamO題組_候鳥的旅行',
  sets: [{
    subject: '閱讀素養', book: '四年級', chapter: '候鳥的旅行', difficulty: 2, title: '候鳥的旅行', shuffle: 'v',
    content: '每年秋天，北方天氣變冷，食物也變少，許多鳥兒會成群往南方飛，這些鳥叫做候鳥。\n\n台灣位在候鳥南飛的路線上，所以每年都有很多候鳥來台灣過冬，例如黑面琵鷺。\n\n濕地越來越少，為了保護候鳥，我們要愛護濕地，賞鳥時保持安靜。',
    questions: [
      { question: '每年秋天，許多鳥兒為什麼要成群往南方飛？', options: ['北方天氣變冷、食物變少', '要到南方繁殖下一代', '要尋找太陽和星星', '南方的濕地比較大'], answer: 'A', explanation: '回到第 1 段，找找看秋天時北方發生了哪兩個變化。' },
      { question: '文章舉了哪一種鳥當作來台灣過冬的例子？', options: ['台灣藍鵲', '黑面琵鷺', '五色鳥', '綠繡眼'], answer: 'B', explanation: '回到第 2 段，找找看「例如」後面寫了哪一種鳥。' },
      { question: '為什麼每年都有很多候鳥來台灣過冬？', options: ['台灣一年四季都很冷', '台灣的食物最多', '台灣位在候鳥南飛的路線上', '台灣沒有濕地'], answer: 'C', explanation: '第 2 段的「所以」前面說了什麼原因？想一想它和候鳥來台灣有什麼關係。' },
      { question: '作者寫這篇文章，最想告訴我們什麼？', options: ['候鳥飛得很快', '要認識候鳥並保護牠們休息的地方', '北方冬天很冷', '賞鳥要帶望遠鏡'], answer: 'B', explanation: '把第 1、2 段介紹的候鳥和第 3 段的做法合起來看，想想作者最希望讀者做到什麼。' },
      { question: '下面哪一種做法最符合文章的建議？', options: ['大聲叫喊吸引候鳥', '把濕地填平蓋房子', '靠近候鳥拍照', '賞鳥時保持安靜'], answer: 'D', explanation: '回到第 3 段，看看作者提醒我們賞鳥時要注意什麼，再用它檢查每個做法。' },
    ],
  }],
};

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
  await page.evaluate((data) => {
    const ta = document.getElementById('input');
    ta.value = JSON.stringify(data, null, 2);
    ta.dispatchEvent(new Event('input'));
    document.querySelectorAll('#sw-update-bar, [class*="cookie-banner"], [class*="onboard"]').forEach((el) => el.remove());
    window.scrollTo(0, 0);
  }, SAMPLE);
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
