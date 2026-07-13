#!/usr/bin/env node
/** 新增工具 #119：SDGs永續行動遊戲－地球守護隊：能量大作戰 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const ID = 119;
const URL = 'https://cagoooo.github.io/Shoot/';
const TOOLS_SERVER = resolve(ROOT, 'server', 'data', 'tools.json');
const PREVIEW_DIR = resolve(ROOT, 'client', 'public', 'previews');
const PREVIEW_PATH = resolve(PREVIEW_DIR, `tool_${ID}.webp`);

const tool = {
  id: ID,
  audienceFit: {
    audiences: ['teacher', 'student'],
    schoolLevels: ['elementary'],
    teacherRoles: ['homeroom', 'subject'],
    painPoints: ['creative-learning', 'student-practice', 'lesson-planning', 'classroom-management'],
    priority: 93,
    reasons: {
      teacher: '把抽象的 SDGs 目標變成可操作的任務、選擇與行動回顧，適合用於永續教育單元的引導與檢核。',
      student: '可組裝自己的能量工具，在九大世界任務中解決回收、水資源、綠能、森林與海洋問題，完成後留下永續行動卡。',
      homeroom: '適合班會、晨光或跨領域主題日，讓學生以小組討論每一步的環境選擇，再把行動延伸回班級生活。',
      subject: '自然、社會與綜合活動教師可依 SDG 主題選關，搭配任務後的行動回顧與列印卡進行探究式教學。',
    },
  },
  title: 'SDGs永續行動遊戲－地球守護隊：能量大作戰',
  description:
    '把 SDGs 變成九大世界永續任務：組裝能量工具、解決回收、水資源、綠能、森林與海洋難題，讓國小孩子在每一次選擇中練習守護地球的行動力。',
  detailedDescription: `「地球守護隊：能量大作戰」是一款為國小中高年級設計的 SDGs 永續行動遊戲。學生從守護隊基地出發，先組裝小光能量槍，再踏入九個逐步解鎖的世界任務；每一關都把環境議題化為具體的觀察、比較與選擇，而不是只背誦 SDG 名稱。

## 主要功能

- **九大 SDGs 世界任務**：依序探索垃圾風暴、水滴守護、綠能社區、種子森林、食物救援、健康泡泡、安心家園、海洋藍光與地球夥伴總動員。
- **能量工具組裝**：從能量、發射器、瞄準管、握把、冷卻器與助手等部件組出自己的工具，觀察力量、省電、降溫、輕巧與愛地球等特性。
- **任務式決策**：分類回收物、選擇雨水過濾方式、規劃儲能、修復棲地、避免食物浪費、判讀防災行動與清理海廢，讓概念落在可討論的情境。
- **雙學習模式**：提供中年級輔助與高年級標準模式，讓不同理解程度的學生都能循序完成任務。
- **永續行動卡**：結算後彙整回收、修復、守護與省能成果，產出不含姓名、電子郵件、IP 或裝置識別資料的行動紀錄，可列印或儲存。
- **PWA 即開即用**：免登入、免安裝，支援課堂投影與學生載具使用，資料只在瀏覽器本機處理。`,
  url: URL,
  icon: 'Leaf',
  category: 'games',
  previewUrl: `/previews/tool_${ID}.webp`,
  ogPreviewUrl: `/previews/og/tool_${ID}.webp`,
  tags: ['SDGs', '永續教育', '地球守護隊', '環境教育', '資源回收', '水資源', '綠能', '海洋保育', '遊戲化學習', '探究任務', '永續行動卡', '石門國小'],
  addedAt: '2026-07-13T00:00:00.000Z',
};

function writeTool() {
  const tools = JSON.parse(readFileSync(TOOLS_SERVER, 'utf8'));
  const current = tools.findIndex((item) => item.id === ID);
  if (current >= 0) tools[current] = tool;
  else tools.push(tool);
  tools.sort((left, right) => left.id - right.id);
  writeFileSync(TOOLS_SERVER, `${JSON.stringify(tools, null, 2)}\n`, 'utf8');
}

async function capturePreview() {
  if (!existsSync(PREVIEW_DIR)) mkdirSync(PREVIEW_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 1280 }, deviceScaleFactor: 2 });
    const page = await context.newPage();
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1200);
    await page.evaluate(() => { window.scrollTo(0, 0); });
    const image = await page.screenshot({ type: 'png', fullPage: false });
    await sharp(image).resize(1024, 1024, { fit: 'cover', position: 'top' }).webp({ quality: 90 }).toFile(PREVIEW_PATH);
  } finally { await browser.close(); }
}

await capturePreview();
writeTool();
console.log(`✅ 已新增 #${ID} ${tool.title}`);
