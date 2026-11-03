#!/usr/bin/env node
/** 新增工具 #135：公共程式平臺上架報告（數位發展部報告互動簡報）。 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const ID = 135;
const TOOL_URL = 'https://cagoooo.github.io/moda-akai-briefing/';
const TOOLS_SERVER = resolve(ROOT, 'server', 'data', 'tools.json');
const PREVIEW_DIR = resolve(ROOT, 'client', 'public', 'previews');
const PREVIEW_PATH = resolve(PREVIEW_DIR, `tool_${ID}.webp`);

const tool = {
  id: ID,
  title: '公共程式平臺上架報告',
  description:
    '石門國小資訊組長向數位發展部報告「科技教育創新專區」上架公共程式平臺的互動簡報：從一人資訊組的需求、AI 協作開發、Fortify 與 Mend 資安檢測，到錯誤通報、SEO／GEO 與開源再利用。',
  detailedDescription: `這是阿凱老師（桃園市龍潭區石門國民小學資訊組長）為 2026-11-06 向數位發展部報告準備的線上互動簡報，主題是把「科技教育創新專區」送上公共程式平臺的經過，報告時間 20 分鐘、共 17 頁加開場片頭。

## 簡報內容

- **為什麼要做**：小校資訊組只有一個人，老師的需求很多、很細；市售工具常卡在註冊、廣告與學生資料去向。
- **怎麼做到**：老師提需求、AI Agent 協作寫程式、資訊組長審核與決策，每次修改自動測試、自動上線；工具依教學情境分成七大類。
- **現場示範**：入口網首頁、工具索引神器、班級小管家、場地與平板車預約，網路不穩時可改播示範錄影。
- **校園使用情形**：入口網累計造訪與點開次數、每月造訪趨勢與點開最多的三款工具，資料來源與擷取日期都標在頁面上。
- **上架與資安檢測**：三週的上架時間軸、Fortify 初掃與五次複掃、Mend 第三方元件掃描的每次結果，以及從掃描學到的修正（只走 HTTPS、路徑先檢查、改用安全亂數、升級或移除有弱點的元件）。
- **維運與被找到**：瀏覽器錯誤由 Sentry 追蹤、雲端函式分級限流後送 Google Chat 通知；工具介紹頁、教學長文與 llms.txt 讓搜尋引擎和 AI 都讀得到。
- **開源與建議**：程式以 MIT 授權公開，工具介紹頁有「開源原始碼」按鈕，文章頁可一鍵複製 AI 開發提示詞；最後是給平臺的四點建議。

## 簡報本身的設計

- 開場 21 秒片頭，口白是事先用阿凱老師的克隆聲音製作，播完自動進入封面。
- 工程藍圖風格的深色主題，右上角可切換白底；手機上改成上下滑動閱讀，並有滑動提示。
- 每頁附講稿與時間配置（按 S 開啟講者模式），可輸出 PDF 當離線備份。
- 加入 Service Worker 與新版本提示，修改後重新開啟就會看到最新版。

## 技術做法

Reveal.js 簡報搭配 GSAP 動畫，部署在 GitHub Pages。網站本身不呼叫 AI 模型，也不收集訪客資料；頁面上的數字都是報告當時擷取的紀錄。`,
  url: TOOL_URL,
  icon: 'Rocket',
  category: 'teaching',
  previewUrl: `/previews/tool_${ID}.webp`,
  ogPreviewUrl: `/previews/og/tool_${ID}.webp`,
  tags: [
    '公共程式',
    '數位發展部',
    '資安檢測',
    'Fortify',
    '開源授權',
    '成果報告',
    'AI 協作開發',
    '錯誤通報',
    'SEO／GEO',
    '互動簡報',
    'Reveal.js',
  ],
  audienceFit: {
    audiences: ['teacher'],
    teacherRoles: ['admin', 'subject', 'homeroom'],
    painPoints: ['it-support', 'professional-learning', 'presentation', 'digital-literacy', 'resource-discovery'],
    priority: 60,
    reasons: {
      teacher:
        '想知道一位老師自己做的教學工具，怎麼通過資安檢測、公開給其他學校使用，可以照著這份簡報看完整的上架過程、每次掃描的結果與修正方式。',
      admin:
        '負責資訊業務的行政同仁，可以參考上架時間軸、Fortify 與 Mend 掃描的修正清單，以及錯誤通報與 Google Chat 通知的做法；要向上級或外部單位做成果報告時，也能當成簡報範本。',
      subject:
        '資訊、科技領域或想自己做教學工具的科任老師，可以看 AI 協作開發的流程、開源授權與「一鍵複製 AI 開發提示詞」，了解怎麼把別人的工具改成自己的版本。',
      homeroom:
        '導師可以從簡報認識學校入口網有哪些工具、老師最常點開哪三款，以及工具上架前做了哪些資安檢查，用得更安心。',
      academic:
        '資訊組多半隸屬教務處，教務處同仁可以參考這份簡報整理校內數位成果、規劃對外報告與資安自主檢查的流程。',
    },
  },
  addedAt: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
};

async function capture() {
  mkdirSync(PREVIEW_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 1280 }, deviceScaleFactor: 2 });
    const page = await context.newPage();
    // #/1 是封面（#/0 是開場片頭影片）
    await page.goto(`${TOOL_URL}#/1`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForFunction(() => window.Reveal?.isReady?.(), null, { timeout: 60000 });
    await page.waitForTimeout(4000);
    await page.evaluate(() => {
      document.querySelectorAll('#sw-update-bar, #theme-btn, .swipe-hint').forEach((el) => el.remove());
    });
    await page.waitForTimeout(500);
    const image = await page.screenshot({ type: 'png', fullPage: false });
    await sharp(image).resize(1024, 1024, { fit: 'cover', position: 'centre' }).webp({ quality: 88 }).toFile(PREVIEW_PATH);
  } finally {
    await browser.close();
  }
}

function addTool() {
  const tools = JSON.parse(readFileSync(TOOLS_SERVER, 'utf8'));
  if (tools.some((t) => t.id === ID)) throw new Error(`#${ID} 已存在`);
  const insertIdx = tools.findIndex((t) => t.id > ID);
  if (insertIdx === -1) tools.push(tool);
  else tools.splice(insertIdx, 0, tool);
  writeFileSync(TOOLS_SERVER, `${JSON.stringify(tools, null, 2)}\n`, 'utf8');
}

await capture();
addTool();
console.log(`#${ID} 已新增`);
