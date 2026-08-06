#!/usr/bin/env node
/** 新增工具 #123：校網無障礙 AA 遷移操作平台 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const ID = 123;
const URL = 'https://cagoooo.github.io/smes-web-migration/';
const TOOLS_SERVER = resolve(ROOT, 'server', 'data', 'tools.json');
const TOOLS_CLIENT = resolve(ROOT, 'client', 'public', 'api', 'tools.json');
const PREVIEW_DIR = resolve(ROOT, 'client', 'public', 'previews');
const PREVIEW_PATH = resolve(PREVIEW_DIR, `tool_${ID}.webp`);

const tool = {
  id: ID,
  audienceFit: {
    // 校網無障礙是全國各級學校共同的法定義務，不限學段 → 省略 schoolLevels。
    // 實際執行者是資訊組長／網管與各處室承辦人 → teacherRoles 只留 admin。
    // 不限制 departments：教務、學務、總務、輔導都要維護自己那幾頁的內容與連結，
    //（一旦指定 departments，推薦引擎只會把工具給該處室的行政人員）
    audiences: ['teacher'],
    teacherRoles: ['admin'],
    painPoints: ['accessibility', 'administration', 'it-support', 'teacher-workload'],
    priority: 76,
    reasons: {
      teacher:
        '把「舊校網搬到教育局共構平台並拿到無障礙 AA 標章」拆成 12 個由上往下打勾的步驟，每段要貼的內容都有複製按鈕，進度自動記住，不用再對著厚厚一本研習講義猜下一步做什麼。',
      admin:
        '送審前 8 步、送審 3 步、送審後 1 步全部條列好，連「網站名稱不可含無障礙或測試」「網址結尾不可有 index.php」這種踩到就秒退的四大雷區都逐項寫明，第一次送審就不用等 7 天重送。',
      academic:
        '資訊組長的遷移總指揮台：處室配色一次改 27 處、5 個區塊修正檔一鍵複製、Freego 檢測與線上送審流程逐步帶，還內建對比度小工具隨時驗證新配色。',
      'student-affairs':
        '學務處要上傳的性平、反霸凌、校園行動載具等檔案都列在清單裡，含「檔名要有意義的中文、不可含特殊符號」與 PDF 需文字可選取的規範提醒。',
      'general-affairs':
        '總務處維護採購、場地、會計公開資訊等頁面時，可對照平台列出的「掃描件不可直接放」「外部連結要另開新視窗並標註格式」等撰寫紀律。',
      counseling:
        '輔導室的成員資料補登、群組權限設定與輔導相關表單上傳，都有專屬步驟與批次輸入格式說明，避免建完成員卻不能發文。',
      other:
        '幼兒園、圖書館等其他單位也適用：成員批次建立、公告撰寫規範與內容補齊順序，照著同一份清單走就好。',
    },
  },
  title: '校網無障礙 AA 遷移操作平台',
  description:
    '把「舊校網搬到教育局 XOOPS 共構平台、拿到無障礙 AA 標章」拆成 12 個能打勾的步驟：逐項操作指引、要貼的內容一鍵複製、進度自動記住，還內建對比度檢查小工具與送審四大雷區清單。',
  detailedDescription: `校網無障礙 AA 遷移操作平台（原名「石門國小校網遷移操作台」）是阿凱老師為桃園市龍潭區石門國民小學的校網搬遷專案打造的單頁操作台。它把研習講義、無障礙規範、教育局共構平台後台操作與送審表單這四份互不相通的資料，整併成一條由上往下、做完打勾就好的作業流水線。

## 主要功能

- **12 步驟三階段清單**：分成「送審前 8 步」「送審 3 步」「送審後 1 步」，每一步都標了預估時間（1 分鐘～60 分鐘），照順序做完就能送審。
- **進度自動記住**：勾選狀態存在瀏覽器本機，關掉重開、隔天再打開都還在，頂部進度條同步顯示完成度與距離標章死線的天數。
- **一鍵複製要貼的內容**：5 個首頁區塊的修正原始碼、色碼、檢查指令都做成複製按鈕，整份放進剪貼簿，不用手抄。
- **對比度問題逐項給解法**：處室選單底色從 #7e8f62 改成 #5d6b47（對比度 3.50 → 5.74），搭配後台的「複製顏色到所有處室」開關，一次修好 27 處；Bootstrap 的 .text-secondary 與 .text-muted 則統一改用 #495057。
- **內建對比度小工具**：頁尾附一個即時計算器，臨時要確認某組配色過不過（內文 ≥ 4.5、大字 ≥ 3）時直接輸入前景／背景色就有答案。
- **送審雷區清單**：網址要有 https、結尾不可有 index.php、網站名稱含縣市但絕不可含「無障礙」或「測試」、必須用機關代碼、標章等級要選 AA、「網站導覽」四個字一字未改——踩到任何一項就是秒退並等 7 天。
- **Freego 檢測環境建置指引**：JRE 版本區間、chromedriver 對版、掃描時哪些逾時屬正常，都寫在同一張卡片裡。
- **深淺色主題與桌機寬版排版**：預設亮色、可手動切換深色，卡片網格會依螢幕寬度自動增欄，手機到桌機都好讀。

## 技術特色

純單檔靜態網頁部署於 GitHub Pages，無需登入、無後端；進度以 localStorage 保存，對比度計算走 WCAG 相對亮度公式在前端即時運算。含 PWA manifest 與 apple-touch-icon，可加到手機或電腦桌面當成獨立 App 開啟。涉及個人信箱與分機的成員批次資料不放進公開版，只在頁面標註本機資料夾位置，兼顧可用性與個資保護。`,
  url: URL,
  icon: 'LayoutDashboard',
  category: 'utilities',
  previewUrl: `/previews/tool_${ID}.webp`,
  ogPreviewUrl: `/previews/og/tool_${ID}.webp`,
  tags: [
    '校網遷移',
    '無障礙AA',
    '網站標章',
    'XOOPS共構',
    '對比度檢查',
    'Freego檢測',
    '資訊組長',
    '行政流程',
    '操作清單',
    '進度追蹤',
    '石門國小',
    '已建置完成',
  ],
  addedAt: '2026-08-06T02:00:00.000Z',
};

function writeToolFile(targetPath) {
  const tools = JSON.parse(readFileSync(targetPath, 'utf8'));
  const current = tools.findIndex((item) => item.id === ID);
  if (current >= 0) tools[current] = tool;
  else {
    const insertIdx = tools.findIndex((t) => t.id > tool.id);
    if (insertIdx === -1) tools.push(tool);
    else tools.splice(insertIdx, 0, tool);
  }
  writeFileSync(targetPath, `${JSON.stringify(tools, null, 2)}\n`, 'utf8');
}

async function capturePreview() {
  if (!existsSync(PREVIEW_DIR)) mkdirSync(PREVIEW_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 1280 },
      deviceScaleFactor: 2,
    });
    await context.addInitScript(() => {
      const keys = [
        'tour_complete',
        'onboarding_done',
        'hasSeenTour',
        'tutorial_dismissed',
        'welcome_shown',
        'akai_onboarded_v1',
        'akai_install_dismissed',
      ];
      keys.forEach((k) => localStorage.setItem(k, '1'));
    });
    const page = await context.newPage();
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(5000);
    await page.evaluate(() => {
      const selectors = [
        '.driver-popover',
        '.driver-overlay',
        '.shepherd-element',
        '.shepherd-modal-overlay-container',
        '#updateBanner',
        '[class*="cookie-banner"]',
        '[class*="onboard"]',
        '[class*="tutorial"]',
      ];
      selectors.forEach((s) => document.querySelectorAll(s).forEach((el) => el.remove()));
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(800);
    const image = await page.screenshot({ type: 'png', fullPage: false });
    await sharp(image)
      .resize(1024, 1024, { fit: 'cover', position: 'top' })
      .webp({ quality: 90 })
      .toFile(PREVIEW_PATH);
  } finally {
    await browser.close();
  }
}

console.log('🚀 開始截圖並生成卡片主圖...');
await capturePreview();
console.log('📸 預覽圖已保存至:', PREVIEW_PATH);

writeToolFile(TOOLS_SERVER);
writeToolFile(TOOLS_CLIENT);
console.log(`✅ 已完成新增 #${ID} ${tool.title} 到前後端 tools.json`);
