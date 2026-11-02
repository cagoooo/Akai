#!/usr/bin/env node

/** 新增工具 #134：桃園市石門國小品牌群島。 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const ID = 134;
const TOOL_URL = 'https://cagoooo.github.io/smes-island/';
const TOOLS_SERVER = resolve(ROOT, 'server', 'data', 'tools.json');
const PREVIEW_DIR = resolve(ROOT, 'client', 'public', 'previews');
const PREVIEW_PATH = resolve(PREVIEW_DIR, `tool_${ID}.webp`);

const tool = {
  id: ID,
  title: '桃園市石門國小品牌群島',
  description:
    '把石門國小「鱻鯉鰭源，石門活閱」閱讀品牌方案做成 12 座 3D 浮空島：逛島看課程與成果，查即時天氣、水庫水位和校園公告，還能尋找小河馬、領尋寶證書。',
  detailedDescription: `這是把桃園市龍潭區石門國民小學的閱讀品牌方案，做成一座可以逛的 3D 天空之城。12 座浮空島各對應方案的一個面向，從品牌型塑、課程、學程、遊程，到行政運作、學習成效與未來規劃。

## 可以逛什麼

- **12 座浮空島**：點一座島就能看該主題的文字、照片與成果；也可以用「島嶼導覽」自動逛，或用「跟著逛島」跟著島上的老師學生走。
- **會隨時間變化的校園**：天氣取自 Open-Meteo、石門水庫水位取自水利署開放資料，島上的雨天、夜晚、人物反應與配樂都會跟著變。下雨時人物撐傘，晚上改拿手電筒。
- **校園公告**：同步學校網站的公告。

## 學生的尋寶任務

每座島躲著一隻小河馬。找到 6 隻或 12 隻可領不同證書，石門國小的同學帶證書到校長室領取獎勵；還有閱讀護照蓋章與閱讀小測驗。共用平板可按「換下一位」清除紀錄，領證書時班級姓名會傳到學校的試算表，用於發放獎勵。

## 技術做法

Vite 與 Three.js 打造，部署在 GitHub Pages，領獎名單用 Google Apps Script 寫入試算表，手機與電腦都能使用。網站本身沒有呼叫 AI 模型。`,
  url: TOOL_URL,
  icon: 'Map',
  category: 'interactive',
  previewUrl: `/previews/tool_${ID}.webp`,
  ogPreviewUrl: `/previews/og/tool_${ID}.webp`,
  tags: [
    '品牌學校',
    '閱讀教育',
    '石門國小',
    '3D 互動網站',
    '浮空島',
    '校園資訊',
    '尋寶任務',
    '閱讀護照',
    '數位證書',
    'Three.js',
    '學校行銷',
  ],
  audienceFit: {
    audiences: ['teacher', 'student'],
    schoolLevels: ['elementary'],
    teacherRoles: ['homeroom', 'subject', 'admin'],
    painPoints: ['reading-literacy', 'resource-discovery', 'creative-learning', 'digital-literacy'],
    priority: 72,
    reasons: {
      teacher:
        '想了解品牌學校方案怎麼落地時，可以逛 12 座浮空島，把課程、學程、遊程到學習成效看成一張地圖；也能參考把計畫書做成互動網站的呈現方式。',
      student:
        '在 3D 天空之城逛校園、找 12 隻小河馬、蓋閱讀護照章，還能挑戰閱讀小測驗；石門國小的同學找到 6 隻或 12 隻，可以領證書到校長室領獎勵。',
      homeroom:
        '導師可以在晨光或資訊課帶學生逛島認識學校的閱讀特色，用尋寶任務引導孩子主動看內容，共用平板也能按「換下一位」清除紀錄。',
      subject:
        '閱讀、資訊與社會領域老師可以參考各島整理的課程與走讀內容，當成認識校本課程的情境素材，或當成討論網站設計的案例。',
      admin:
        '要向家長、來賓或評審介紹學校特色時，可以用群島代替厚厚的計畫書；領獎名單會進試算表，方便行政單位統計與核對。',
      academic:
        '教學組可以參考方案如何整理課程、學程與教師社群，把校本課程的成果做成對外展示的入口。',
    },
  },
  addedAt: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
};

async function capture() {
  mkdirSync(PREVIEW_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 1280 }, deviceScaleFactor: 2 });
    await context.addInitScript(() => {
      const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei' }).format(new Date());
      localStorage.setItem('smes-mission-seen', 'true');
      localStorage.setItem('smes-island-visit', day); // 截圖不算登島人次
    });
    const page = await context.newPage();
    await page.goto(`${TOOL_URL}?capture=${ID}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForFunction(() => window.__world?.hooks?.onHippo, null, { timeout: 150000 });
    await page.waitForTimeout(9000);
    await page.evaluate(() => { document.querySelectorAll('.toast, #swUpdate, .update-card, [class*="update-"]').forEach((el) => el.remove()); });
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
