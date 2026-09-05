#!/usr/bin/env node

/** 新增工具 #125：桃園市教育產業工會｜石門國小支會會員服務暨活動宣導 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const ID = 125;
const URL = 'https://cagoooo.github.io/TeacherGroup2026/';
const TOOLS_SERVER = resolve(ROOT, 'server', 'data', 'tools.json');
const PREVIEW_DIR = resolve(ROOT, 'client', 'public', 'previews');
const PREVIEW_PATH = resolve(PREVIEW_DIR, `tool_${ID}.webp`);

const tool = {
  id: ID,
  audienceFit: {
    audiences: ['teacher'],
    painPoints: [
      'administration',
      'teacher-workload',
      'event-management',
      'professional-learning',
      'resource-discovery',
    ],
    priority: 68,
    reasons: {
      teacher:
        '把「今年會費怎麼繳、續會禮怎麼領、新進老師要找誰」一次講清楚：本校採教師小組代收、財務長統一匯款，會員不必個別匯款，也不用自己去填官方表單；活動報名資格、研習時數與當日流程都在同一頁，不必再翻群組訊息。',
      homeroom:
        '導師平常最沒空追公告。這頁把續會兩階段禮券、親子健行的報名時間與攜眷人數規則整理成卡片，帶家人參加或決定要不要續會，滑一頁就能決定，不用私訊問人。',
      subject:
        '科任與代課、代理教師常常搞不清楚自己算普通會員還是贊助會員、能不能有選舉權。頁面把會員身分、權益差異與資料建檔方式分開寫，新進老師只要照「先洽支會長」這條路走就好。',
      admin:
        '行政同仁同時是會員也是被問的人。這頁等於一份可以直接轉貼的標準答案：三步驟辦理流程、財務長統一匯款帳戶的使用時機、以及「請勿個別匯款或重複填官方表單」的明確提醒，能把重複詢問一次收斂掉。',
      academic:
        '教務處承辦研習業務時可直接引用活動頁的研習時數說明：全程參與可核發 3 小時，並需於活動當日上午依教育發展資源入口網「活動查詢」流程登錄，省去逐一回覆老師的時間。',
      'student-affairs':
        '學務處辦理親子型活動時可以拿這頁當範本：報到、集章、兌換、賦歸四段時程、攜眷人數上限、請假與缺席規範、風雨無阻與延期公告方式，都是活動宣導頁該寫齊的欄位。',
      'general-affairs':
        '總務與出納視角最實用的一段是款項動線：小組代收 → 支會長彙整 → 財務長一次匯款 → 與工會對帳並回報帳號後五碼。把「誰該匯、誰不該匯」寫在頁面上，比在群組澄清有效。',
      counseling:
        '輔導室關心同仁支持系統時，可用會員權益段落說明工會提供的免費法律諮詢與互助資源，以及加贈會籍期間哪些救助項目尚不適用，讓同仁在需要時知道能找誰。',
      other:
        '幼兒園、圖書館或其他單位的同仁同樣適用：不分職務都能從「我是舊會員／我是新進老師」兩個入口，找到屬於自己的辦理方式與期限。',
    },
  },
  title: '桃園市教育產業工會｜石門國小支會會員服務暨活動宣導',
  description:
    '把工會會費、續會禮、新進入會優惠與親子健行活動，整理成一頁看得完的宣導站。分「我是舊會員／我是新進老師」兩條入口，寫明本校採教師小組代收、財務長統一匯款，會員不必個別匯款，也不必自己填官方表單。',
  detailedDescription: `這是桃園市龍潭區石門國民小學的教師工會支會宣導網站，把每年都要重講一次的會務資訊，收斂成一頁可以直接轉貼給同仁的說明頁。它要解決的不是「資訊不存在」，而是資訊散在群組訊息、官方公文與線上表單之間，導致老師重複發問、重複匯款，甚至填錯表單。

## 內容與功能

- **雙入口分流**：首屏就用「我是舊會員」與「我是新進老師」兩個按鈕分流，各自對應不同的辦理路徑與期限，不用整頁讀完才知道哪段跟自己有關。
- **本校辦理方式三步驟**：先向本校登記 → 支會長統合資料 → 財務長一次匯款並完成工會對帳。頁面明確標示「會員不需個別匯款」，統一匯款帳戶僅供財務長使用。
- **續會與入會優惠一次列清**：常年會費 1,200 元，舊會員依完成時間分兩階段回饋禮券；新進與中斷會員於期限內預繳可免收入會費，並加贈當年度會籍與會員卡。
- **活動宣導專區**：親子健行活動的報名時間、報名資格、攜眷人數上限、集章路線、伴手禮兌換時段與當日四段流程都寫成表格化卡片，並附研習時數登錄方式與請假規範。
- **會員身分說明**：區分普通會員與贊助會員的選舉權差異，並提醒資料建檔要提供正確電子信箱。
- **常見問題**：直接回答「要不要自己匯款」「跨年度後加入費用怎麼算」「會員卡寄到哪裡」三個最常被問的問題。

## 技術特色

純靜態 HTML、CSS 與 JavaScript 部署於 GitHub Pages，會務內容抽到 \`site-data.js\` 集中維護，改年度資料不必動版面程式碼；搭配 Bootstrap Icons、Service Worker 註冊與版本查詢字串，手機可加到主畫面離線閱讀，改版後也能提示重新載入。頁面備妥完整 Open Graph 與 Twitter Card 標記，貼進 LINE 群組或社群時會顯示正確的標題、說明與 1200×630 預覽圖，適合當成一次貼、大家自己查的宣導入口。`,
  url: URL,
  icon: 'Users',
  category: 'communication',
  previewUrl: `/previews/tool_${ID}.webp`,
  ogPreviewUrl: `/previews/og/tool_${ID}.webp`,
  tags: [
    '教師工會',
    '會員服務',
    '會費續會',
    '入會優惠',
    '活動宣導',
    '親子健行',
    '研習時數',
    '行政溝通',
    '常見問題',
    '石門國小',
    '靜態網站',
    '已建置完成',
  ],
  addedAt: '2026-09-05T00:00:00+08:00',
};

function writeTool() {
  const tools = JSON.parse(readFileSync(TOOLS_SERVER, 'utf8'));
  const current = tools.findIndex((item) => item.id === ID);
  if (current >= 0) tools[current] = tool;
  else {
    const insertIdx = tools.findIndex((item) => item.id > ID);
    if (insertIdx === -1) tools.push(tool);
    else tools.splice(insertIdx, 0, tool);
  }
  writeFileSync(TOOLS_SERVER, `${JSON.stringify(tools, null, 2)}\n`, 'utf8');
}

async function capturePreview() {
  mkdirSync(PREVIEW_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 1280 },
      deviceScaleFactor: 2,
    });
    await context.addInitScript(() => {
      const dismissKeys = [
        'tyc_tut_done',
        'tyc_known_version',
        'tyc_nokey_collapsed',
        'tyc_notify',
        'tour_complete',
        'onboarding_done',
        'hasSeenTour',
        'tutorial_dismissed',
        'cookie_accepted',
        'announcement_dismissed',
        'welcome_shown',
        'akai_onboarded_v1',
        'akai_install_dismissed',
      ];
      dismissKeys.forEach((key) => localStorage.setItem(key, '1'));
    });
    const page = await context.newPage();
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2200);
    await page.evaluate(() => {
      const selectors = [
        '.driver-popover',
        '.driver-overlay',
        '.driver-active-element',
        '.shepherd-element',
        '.shepherd-modal-overlay-container',
        '.introjs-overlay',
        '.introjs-helperLayer',
        '.introjs-tooltipReferenceLayer',
        '#updateBanner',
        '#cookieBanner',
        '#announcement',
        '[class*="cookie-banner"]',
        '[class*="cookie-consent"]',
        '[class*="onboard"]',
        '[class*="tutorial"]',
        '[class*="tour-tooltip"]',
        '.akai-ob-bg',
        '.akai-ob-modal',
        '[class*="akai-ob-"]',
      ];
      selectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((element) => element.remove());
      });
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(600);
    const image = await page.screenshot({ type: 'png', fullPage: false });
    await sharp(image)
      .resize(1024, 1024, { fit: 'cover', position: 'top' })
      .webp({ quality: 90 })
      .toFile(PREVIEW_PATH);
  } finally {
    await browser.close();
  }
}

console.log(`🚀 開始新增 #${ID} ${tool.title}`);
await capturePreview();
console.log(`📸 卡片主圖已保存：${PREVIEW_PATH}`);
writeTool();
console.log(`✅ server/data/tools.json 已寫入 #${ID}，請接著執行 npm run sync-tools-json`);
