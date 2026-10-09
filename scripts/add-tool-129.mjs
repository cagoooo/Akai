#!/usr/bin/env node

/** 新增工具 #129：115石小教師會議報告集合站 (上學期) */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const ID = 129;
const TOOL_URL = 'https://sites.google.com/mail2.smes.tyc.edu.tw/115-teacher-1/';
const TOOLS_SERVER = resolve(ROOT, 'server', 'data', 'tools.json');
const PREVIEW_DIR = resolve(ROOT, 'client', 'public', 'previews');
const PREVIEW_PATH = resolve(PREVIEW_DIR, `tool_${ID}.webp`);

const tool = {
  id: ID,
  audienceFit: {
    audiences: ['teacher'],
    teacherRoles: ['homeroom', 'subject', 'admin'],
    painPoints: [
      'meeting-productivity',
      'communication',
      'administration',
      'teacher-workload',
      'resource-discovery',
    ],
    priority: 88,
    reasons: {
      teacher:
        '把每週教師會議的處室報告、重要截止日與宣導事項集中在一個網址，漏聽晨會或換了裝置都能回頭查；其他學校的老師也能把它當成會議記錄公開化的參考做法。',
      homeroom:
        '導師最怕漏掉要回收的表單與要提醒家長的事；各週頁面的導師待辦檢核表、重要時程卡片與問卷連結，把每週要交、要發、要轉知的班級事務列在同一頁。',
      subject:
        '科任教師不一定在每個班級群組裡，容易漏掉校務宣達；用週次頁籤就能查到當週的社群會議地點、研習公告與評量繳交期限，不必再轉問導師或翻舊訊息。',
      admin:
        '行政人員可把各處室每週報告整理成固定格式的互動頁：一週一頁、依處室分區、附時程與連結，會後追蹤進度與新任承辦交接都有可核對的紀錄。',
      academic:
        '教務處的公開授課、期中評量命題與試卷繳交、語文競賽報名、社群會議與必讀書目等業務，在各週頁面依序整理並標出截止日，方便對照進度與事後回頭追蹤。',
      'student-affairs':
        '學務處的運動會籌備、防災演練、流感疫苗與家長用餐調查、潔牙與書包減重抽查等宣導，集中在各週的學務區，方便確認各班是否都已完成。',
      'general-affairs':
        '總務處的場地租借、設備修繕與班親會家長委員選舉權益說明等公告，也在各週的總務區留下紀錄，同仁查詢時不必再逐一打電話確認。',
      counseling:
        '輔導室的學習扶助開班、輔導 A 卡資料核對、性平與特教、兒少保護宣導，會同時出現在處室報告與導師待辦清單，讓提醒不再只靠口頭轉達。',
      other:
        '人事室的退休意願告知與新進人員介紹，以及資訊組的資安宣導影片，也集中在同一個入口查閱，承辦人可直接對照會議當天的宣達內容。',
    },
  },
  title: '115石小教師會議報告集合站 (上學期)',
  description:
    '石門國小 115 學年度上學期的教師會議紀錄入口：預備週到第 6 週與期初校務會議各一頁，處室報告、重要時程、導師待辦與關鍵字搜尋一站查，不必再翻群組訊息和舊附件。',
  detailedDescription: `這是桃園市龍潭區石門國民小學 115 學年度上學期的教師會議紀錄集合站：每次開完教師晨會或校務會議，就把各處室報告整理成一頁互動網頁，放進同一個 Google Sites。它是 [#80 114 下學期教師會議報告集合站](/tool/80) 的新學年續作，目前收錄預備週、第 1 週、期初校務會議，以及第 3 週到第 6 週共七個頁面，之後每週繼續往上疊。

## 主要功能

- **一週一頁、頁籤切換**：頂端導覽列直接跳到預備週、第 1～6 週與期初校務會議，找哪一天的會議都不必翻附件。
- **依處室分區的報告**：教務處、學務處、總務處、輔導室、人事室與資訊組的報告各自成區，並附快速跳轉按鈕。
- **重要時程與截止日卡片**：把當週要繳交、要施作、要提醒的事排成卡片，開會當天沒聽清楚也能回頭確認。
- **導師待辦檢核表**：點方格就能打勾並顯示完成進度，狀態只存在自己的瀏覽器，重新整理不會消失。
- **搜尋、列印與字級調整**：關鍵字全文比對並標示結果、友善列印版面、字級放大縮小，適合會後查找與紙本留存。
- **一鍵複製**：填報路徑、問卷表單連結都做成複製按鈕，減少手動輸入打錯字。

## 適合的使用情境

導師可以在晨會後對照待辦清單，確認班上要回收的表單；科任與新進、代理教師查當週的社群會議地點和研習公告；行政承辦把各組報告集中貼成同一頁，會後追蹤與年度交接都有依據。

## 技術特色

每個頁面是一份單檔互動 HTML，以 Google Sites 嵌入方式發布，使用原生 JavaScript 做平滑捲動與篩選，不需要另外架設伺服器。內容是石門國小自己的會議資料，其他學校取用的是這種「一週一頁」的整理做法，可仿做成自己學校的版本。`,
  url: TOOL_URL,
  icon: 'ClipboardCheck',
  category: 'utilities',
  previewUrl: `/previews/tool_${ID}.webp`,
  ogPreviewUrl: `/previews/og/tool_${ID}.webp`,
  tags: [
    '會議記錄',
    '教師晨會',
    '校務會議',
    '行政報告',
    '導師待辦',
    '處室報告',
    '重要時程',
    '石門國小',
    '115學年度',
    'Google協作平台',
    '行政宣導',
    '關鍵字搜尋',
  ],
  addedAt: '2026-10-09T08:20:00+08:00',
};

function writeTool() {
  const tools = JSON.parse(readFileSync(TOOLS_SERVER, 'utf8'));
  if (tools.some((item) => item.id === ID)) {
    throw new Error(`#${ID} 已存在，為避免覆蓋既有工具而停止。`);
  }
  const insertIdx = tools.findIndex((item) => item.id > ID);
  if (insertIdx === -1) tools.push(tool);
  else tools.splice(insertIdx, 0, tool);
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
    const page = await context.newPage();
    await page.goto(TOOL_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    // Google Sites 的內容是嵌入式 iframe，要等內層框架載入完成
    await page.waitForTimeout(9000);
    // 預覽圖不外露校內伺服器路徑：把含內網位址的文字換成通用說明
    for (const frame of page.frames()) {
      try {
        await frame.evaluate(() => {
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          const targets = [];
          while (walker.nextNode()) {
            if (/10\.36\.\d+\.\d+/.test(walker.currentNode.nodeValue)) targets.push(walker.currentNode);
          }
          targets.forEach((node) => {
            node.nodeValue = '校內共用資料夾路徑（內部連線）';
          });
        });
      } catch {
        // 跨來源框架無法存取時略過
      }
    }
    await page.waitForTimeout(500);
    const image = await page.screenshot({ type: 'png', fullPage: false });
    await sharp(image)
      .resize(1024, 1024, { fit: 'cover', position: 'top' })
      .webp({ quality: 88 })
      .toFile(PREVIEW_PATH);
    console.log(`📸 目標網站：${await page.title()}`);
  } finally {
    await browser.close();
  }
}

console.log(`🚀 開始新增 #${ID} ${tool.title}`);
await capturePreview();
console.log(`📸 卡片主圖已保存：${PREVIEW_PATH}`);
writeTool();
console.log(`✅ server/data/tools.json 已寫入 #${ID}，請接著執行 npm run sync-tools-json`);
