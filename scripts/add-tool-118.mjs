#!/usr/bin/env node
/**
 * 新增工具 #118：石門國小資訊科技駕駛艙：答題快打對戰遊戲
 * 1. 以 Playwright 擷取已上線工具的實際畫面，輸出 1024×1024 WebP 預覽圖
 * 2. 寫入 server/data/tools.json（唯一資料來源）
 * 3. 後續由 sync-tools-json.mjs 同步前端，並由 generate-unified-og.mjs 產生 OG 圖
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const ID = 118;
const URL = 'https://cagoooo.github.io/smes-it-quiz-battle/';
const TOOLS_SERVER = resolve(ROOT, 'server', 'data', 'tools.json');
const PREVIEW_DIR = resolve(ROOT, 'client', 'public', 'previews');
const PREVIEW_PATH = resolve(PREVIEW_DIR, `tool_${ID}.webp`);

const tool = {
  id: ID,
  audienceFit: {
    audiences: ['teacher', 'student'],
    schoolLevels: ['elementary'],
    teacherRoles: ['homeroom', 'subject'],
    painPoints: ['digital-literacy', 'student-practice', 'creative-learning', 'classroom-management'],
    priority: 92,
    reasons: {
      teacher: '把資訊素養題目轉成可投影、可分組也可個人進行的答題對戰，讓觀念檢核有明確節奏與即時解析。',
      student: '可選自己的資訊職能角色，在網路安全、程式思維與數位公民題目中用答對題目發動技能、累積連擊。',
      homeroom: '適合晨光、班級活動與數位公民討論；同桌雙人模式能把搶答變成輪流思考與友善競賽。',
      subject: '資訊科可依單元切換網安、程式思維或數位公民主題，搭配練習、標準、挑戰難度做差異化複習。',
    },
  },
  title: '石門國小資訊科技駕駛艙：答題快打對戰遊戲',
  description:
    '把資訊素養題目變成駕駛艙快打對戰：選擇職能角色，在網路安全、程式思維與數位公民任務中答題出招；可單挑 AI、同桌雙人，也能投影成全班討論。',
  detailedDescription: `「石門國小資訊科技駕駛艙：答題快打對戰遊戲」是阿凱老師為國小資訊教育設計的遊戲化複習工具。孩子不是直接面對一張選擇題練習卷，而是先選擇程式勇者、網安守護者、資料魔法師、AI 探險家等資訊職能角色，在駕駛艙中用正確觀念發動技能、守護校園網路。

## 主要功能

- **兩種對戰方式**：可單人挑戰駕駛艙 AI，也可開啟同桌雙人模式，輪流作答、互相切磋。
- **四種資訊主題**：提供綜合挑戰、網路安全、程式思維、數位公民題庫，將資訊課的重要觀念放進具體任務。
- **三段難度節奏**：練習模式附提示、標準模式適合課堂對戰、挑戰模式加快 AI 節奏，讓老師能依學生狀態調整。
- **技能化即時回饋**：基礎、進階、戰術與必殺技能各自對應題目難度；答對會造成傷害、累積能量與連擊，答錯也立即顯示正解與原因。
- **角色與敵人設計**：8 位資訊職能角色對上防火牆怪、釣魚海妖、漏洞幻影等敵人，讓抽象的資訊概念有可記憶的遊戲語言。
- **課堂投影友善**：免登入、免安裝，老師可投影帶全班討論，也能讓學生在載具上個別練習。

## 教學特色

題目涵蓋陌生連結、強密碼、兩步驟驗證、網路霸凌、假訊息查證、AI 使用責任、程式迴圈、條件判斷、除錯與問題分解等內容。每題都有立即說明，不只判斷對錯，更把「為什麼」留在學生剛做完決定的時刻。工具採純前端網站與 PWA 更新機制，開啟瀏覽器即可使用。`,
  url: URL,
  icon: 'Gamepad2',
  category: 'games',
  previewUrl: `/previews/tool_${ID}.webp`,
  ogPreviewUrl: `/previews/og/tool_${ID}.webp`,
  tags: [
    '答題快打',
    '資訊科技',
    '網路安全',
    '程式思維',
    '數位公民',
    'AI素養',
    '雙人對戰',
    '遊戲化學習',
    '資訊課',
    '即時回饋',
    '國小中高年級',
    '石門國小',
  ],
  addedAt: '2026-07-13T00:00:00.000Z',
};

function writeTool() {
  const tools = JSON.parse(readFileSync(TOOLS_SERVER, 'utf8'));
  const existingIndex = tools.findIndex((item) => item.id === ID);
  if (existingIndex >= 0) {
    tools[existingIndex] = tool;
  } else {
    const insertIndex = tools.findIndex((item) => item.id > ID);
    if (insertIndex === -1) tools.push(tool);
    else tools.splice(insertIndex, 0, tool);
  }
  writeFileSync(TOOLS_SERVER, `${JSON.stringify(tools, null, 2)}\n`, 'utf8');
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
      ['tyc_tut_done', 'tyc_known_version', 'akai_onboarded_v1', 'akai_install_dismissed']
        .forEach((key) => localStorage.setItem(key, '1'));
    });
    const page = await context.newPage();
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1200);
    await page.evaluate(() => {
      document.querySelectorAll('#updateBanner, .update-banner, [class*="update-banner"]').forEach((node) => node.remove());
      window.scrollTo(0, 0);
    });
    const image = await page.screenshot({ type: 'png', fullPage: false });
    await sharp(image)
      .resize(1024, 1024, { fit: 'cover', position: 'top' })
      .webp({ quality: 90 })
      .toFile(PREVIEW_PATH);
  } finally {
    await browser.close();
  }
}

await capturePreview();
writeTool();
console.log(`✅ 已新增 #${ID} ${tool.title}`);
console.log(`🖼️ 預覽圖：${PREVIEW_PATH}`);
