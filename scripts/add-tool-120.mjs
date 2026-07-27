#!/usr/bin/env node
/** 新增工具 #120：3D 星際雷霆解題大冒險 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const ID = 120;
const URL = 'https://cagoooo.github.io/space-meteor-evasion-3d/';
const TOOLS_SERVER = resolve(ROOT, 'server', 'data', 'tools.json');
const TOOLS_CLIENT = resolve(ROOT, 'client', 'public', 'api', 'tools.json');
const PREVIEW_DIR = resolve(ROOT, 'client', 'public', 'previews');
const PREVIEW_PATH = resolve(PREVIEW_DIR, `tool_${ID}.webp`);

const tool = {
  id: ID,
  audienceFit: {
    audiences: ['teacher', 'student'],
    schoolLevels: ['elementary', 'junior'],
    teacherRoles: ['homeroom', 'subject'],
    painPoints: ['student-practice', 'lesson-planning', 'classroom-management', 'creative-learning'],
    priority: 95,
    reasons: {
      teacher: '第一人稱 3D 飛船駕駛結合太陽系、自然、資訊 AI 與密碼推理四大題庫，能大幅提昇課堂複習與主題活動的參與度。',
      student: '操控飛船躲避隕石、射擊問號智囊球解題補血修復護盾，收集戰術寶箱體驗散彈砲與時間減速，挑戰班級英雄榜！',
      homeroom: '適合班會、晨光活動與期末歡樂複習，透過英雄榜激發良性競爭與團隊應援氛圍。',
      subject: '自然科與資訊科老師可搭配太陽系、生態環境與 AI 科技單元作為課堂評量與遊戲化複習。',
    },
  },
  title: '3D 星際雷霆：隕石防禦與太空探索解題大冒險',
  description:
    '第一人稱 3D 太空飛船駕駛與隕石防禦遊戲！駕駛戰機發射雷射與散彈砲，捕捉問號智囊球解答太陽系、自然科學、AI 常識與密碼推理題庫，維護護盾並衝高分登錄班級英雄榜。',
  detailedDescription: `「3D 星際雷霆大冒險」是一款結合第一人稱 3D 飛船駕駛、太空戰術射擊與跨學科解題的寓教於樂遊戲。學生化身星際艦長，駕駛戰機穿梭於太陽系、隕石帶與黑洞界，在體驗流暢操控與震撼視聽的同時，透過解答智囊球補血與加分，將學科知識轉化為冒險防禦的動力。

## 主要功能與亮點

- **第一人稱 3D 飛船駕駛**：支援電腦（WASD 鍵盤／滑鼠操控、J 鍵發射雷射砲、Space 衝刺）與手機／平板（全螢幕直覺滑動觸控），流暢應對各種載具與教學情境。
- **星際問號解題智囊球**：太空中會出現發光的「問號解題球」，飛船靠近或射擊即可開啟學科解題介面。答對問題即可修復飛船能量護盾並獲得高額積分。
- **四大跨學科探索題庫**：包含「☀️ 太陽系與天文科學」、「🌱 國小自然與生態環境」、「💻 資訊科技與 AI 常識」與「🧠 星際邏輯與密碼推理」，兼具知識性與思維挑戰。
- **三階段航行關卡難度**：提供初階（太陽系）、中階（隕石帶）、高階（黑洞界）三種挑戰模式，依年級與學習歷程彈性調整飛船速度與隕石密度。
- **戰術寶箱與武器道具**：收集太空中出現的「📦 戰術寶箱」，可即時獲得散彈火砲、時間減速與護盾補給，增加太空生存戰術豐富度。
- **頂級聲光與班級英雄榜**：內建 Pixabay CC0 太空 Synthwave 冒險 BGM 與立體星戰音效，搭配本機班級星際英雄排行榜 (TOP 5)，激發競賽應援熱情。`,
  url: URL,
  icon: 'Rocket',
  category: 'games',
  previewUrl: `/previews/tool_${ID}.webp`,
  ogPreviewUrl: `/previews/og/tool_${ID}.webp`,
  tags: [
    '3D遊戲',
    '星際雷霆',
    '太空解題',
    '隕石防禦',
    '天文科學',
    '自然科學',
    '資訊科技',
    '遊戲化學習',
    '課堂複習',
    '雙端操控',
    '班級排行榜',
    '石門國小',
  ],
  addedAt: '2026-07-27T00:00:00.000Z',
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
