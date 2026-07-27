#!/usr/bin/env node
/** 新增工具 #121：仙人掌大逃亡：奔跑吧小墨龍 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const ID = 121;
const URL = 'https://cagoooo.github.io/ink-dragon-runner/';
const TOOLS_SERVER = resolve(ROOT, 'server', 'data', 'tools.json');
const TOOLS_CLIENT = resolve(ROOT, 'client', 'public', 'api', 'tools.json');
const PREVIEW_DIR = resolve(ROOT, 'client', 'public', 'previews');
const PREVIEW_PATH = resolve(PREVIEW_DIR, `tool_${ID}.webp`);

const tool = {
  id: ID,
  audienceFit: {
    audiences: ['teacher', 'student'],
    schoolLevels: ['elementary', 'junior', 'senior'],
    teacherRoles: ['homeroom', 'subject'],
    painPoints: ['classroom-management', 'student-practice', 'creative-learning', 'digital-literacy'],
    priority: 90,
    reasons: {
      teacher: '適合課堂練習完成後的舒壓獎勵、班級反應力挑戰或資訊/美術跨領域視覺展示。',
      student: '水墨風無盡跑酷流暢好玩，能訓練專注力與反應力，即開即玩無須安裝。',
      homeroom: '下課時間或晨光時間可作為全班趣味同樂與專注力訓練的極速跑酷挑戰。',
      subject: '資訊課與美術課可作為網頁互動動畫、Canvas 繪圖與東方水墨藝術結合的數位創作範例。',
    },
  },
  title: '仙人掌大逃亡：奔跑吧小墨龍',
  description:
    '全新東方水墨畫風網頁無盡跑酷遊戲！靈敏操控小墨龍跳躍與俯衝，穿梭千重仙人掌陣，支援手機與電腦極速對決，挑戰最高分紀錄。',
  detailedDescription: `「仙人掌大逃亡：奔跑吧小墨龍」是一款結合東方傳統水墨藝術美學與極致流暢操控的網頁無盡跑酷遊戲。學生與玩家將化身為神氣活現的小墨龍，在宣紙畫卷背景中奔馳，靈巧地跳躍與俯衝以閃避千重仙人掌陣與飛鳥障礙，體驗速度與反應的極限挑戰。

## 主要功能與亮點

- **東方水墨藝術視覺**：採用傳統宣紙畫卷底色（#F5F0E8）搭配潑墨風格的小墨龍、仙人掌與雲紋細節，提供絕佳的東方美學氛圍。
- **雙鍵靈敏流暢操控**：支援鍵盤「Space／方向鍵上」（跳躍）與「方向鍵下」（俯衝）與手機／平板極致觸控，反應流暢零延遲。
- **動態漸進難度機制**：奔跑距離越遠，地形障礙出現頻率與速度越快，考驗動態視覺與反應專注力。
- **本機英雄高分紀錄**：自動紀錄個人與班級玩家的最高得分，激發追求卓越與挑戰極限的學習動機。
- **跨平台即開即玩**：無須下載或安裝任何 App，Chromebook、iPad、Android 手機與各類電腦瀏覽器開啟即玩。`,
  url: URL,
  icon: 'Gamepad2',
  category: 'games',
  previewUrl: `/previews/tool_${ID}.webp`,
  ogPreviewUrl: `/previews/og/tool_${ID}.webp`,
  tags: [
    '跑酷',
    '水墨',
    '無盡跑酷',
    '小墨龍',
    '教育遊戲',
    '課間遊戲',
    '專注力訓練',
    'HTML5遊戲',
    '反應力',
    '石門國小',
  ],
  addedAt: '2026-07-27T16:00:00.000Z',
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
    const context = await browser.newContext({ viewport: { width: 1280, height: 1280 }, deviceScaleFactor: 2 });
    const page = await context.newPage();
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1500);
    await page.evaluate(() => { window.scrollTo(0, 0); });
    const image = await page.screenshot({ type: 'png', fullPage: false });
    await sharp(image).resize(1024, 1024, { fit: 'cover', position: 'top' }).webp({ quality: 90 }).toFile(PREVIEW_PATH);
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
