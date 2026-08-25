#!/usr/bin/env node

/** 新增工具 #124：從 AI 教學與研究助理到 AI Agent */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const ID = 124;
const URL = 'https://cagoooo.github.io/ncu-ai-agent-workshop-20260826/';
const TOOLS_SERVER = resolve(ROOT, 'server', 'data', 'tools.json');
const PREVIEW_DIR = resolve(ROOT, 'client', 'public', 'previews');
const PREVIEW_PATH = resolve(PREVIEW_DIR, `tool_${ID}.webp`);

const tool = {
  id: ID,
  audienceFit: {
    audiences: ['teacher', 'student'],
    schoolLevels: ['college'],
    teacherRoles: ['subject', 'admin'],
    painPoints: [
      'professional-learning',
      'lesson-planning',
      'content-creation',
      'digital-literacy',
      'resource-discovery',
      'presentation',
      'teacher-workload',
    ],
    priority: 90,
    reasons: {
      teacher:
        '把上午 47 頁的專屬 AI 教學與研究工作室、下午 59 頁的 AI Agent 實作路徑，連同研究資料分析、Skill 驗證、提示詞與部署工具集中在一個入口，適合把研習內容帶回自己的課程或研究流程。',
      student:
        '從案例篩選、PIRLS 去識別資料分析到 Agent Skills 可攜性驗證，學員可以在不把資料上傳的前提下練習研究設計、AI 協作與可追溯交付。',
      subject:
        '大學教師或科任／專任教師可依上午場的 Notebook、Gem、Canvas 與下午場的 Codex、Antigravity 路線，挑一條實作出自己的教學與研究工作室。',
      admin:
        '教務、研究發展、資訊或研習承辦可直接使用案例導航、部署決策、場務驗收與備援教材，降低辦理 AI 研習與推動數位專案的協調成本。',
      academic:
        '適合規劃課程與研究支持流程：PIRLS 工作台提供 CSV 品質檢查、AI 初編與人工複核，方便把研究資料治理與教學研習放在同一條可追溯流程。',
      'student-affairs':
        '學務與學生支持單位可用活動前驗收、資料治理與去識別案例，先把 AI 導入的權限、資料與人工判斷界線說清楚，再帶進學生服務流程。',
      'general-affairs':
        '總務或場地承辦可用部署選擇精靈與場務手冊，比較公開分享、版本紀錄、備援與資料風險，讓研習作品上線前有一份可交接的檢查表。',
      counseling:
        '輔導與研究支持人員可從去識別資料、人工複核與證據留存的案例開始，理解 AI 初編可以協助哪裡，以及哪些決策仍必須由人完成。',
      other:
        '圖書館、研究中心、資訊或跨單位推動者可用資源導航、Skill 驗證與部署精靈，把 AI 工具導入前的授權、資料安全與驗收界線說清楚。',
    },
  },
  title: '從 AI 教學與研究助理到 AI Agent',
  description:
    '把一日 AI 工作坊變成可直接操作的教學與研究路線：上午用 Gemini Notebook、Gem、Canvas 建工作室，下午用 Codex、Antigravity、Claude 與 Agent Skills 完成資料分析、部署與可追溯交付。',
  detailedDescription: `這是一個以「教學 × 研究 × AI Agent」為主軸的互動式工作坊入口，將國立中央大學一日研習拆成可重複操作的兩條路線。上午 47 頁帶學員從 Vibe Coding、Gemini Notebook、Gem 與 Canvas 建立專屬 AI 教學與研究工作室；下午 59 頁則進入 Antigravity、Codex、Claude、Agent Skills、資料分析與交付驗證。

## 內容與功能

- **雙場互動簡報**：固定 16:9 舞台，支援鍵盤、觸控、手機左右滑動、URL hash 導航、講者備註、閱讀模式與全螢幕。
- **研究與實作工具**：PIRLS 資料分析工作台、跨平台 Skill 驗證器、123 個案例需求導向篩選器、部署選擇精靈與提示詞快捷面板。
- **完整研習配套**：資源導航、學員任務書、場務與驗收手冊、HTML／PDF／PowerPoint 備援，以及可直接修改的 Notebook、Gem、Canvas 與 Skill 起始成果。

## 技術特色

以靜態 HTML、CSS 與 JavaScript 部署於 GitHub Pages；研究工具採瀏覽器本機處理、去識別與人工複核邊界，不把資料默默送到 AI API。整套內容讓教師、研究者與學員能把「會問 AI」進一步練成「能規劃、能驗證、能交付」的工作流。`,
  url: URL,
  icon: 'Bot',
  category: 'teaching',
  previewUrl: `/previews/tool_${ID}.webp`,
  ogPreviewUrl: `/previews/og/tool_${ID}.webp`,
  tags: [
    'AI教學',
    'AI研究',
    'AI Agent',
    'Gemini Notebook',
    'Codex',
    'Agent Skills',
    'PIRLS資料分析',
    '提示詞設計',
    '資料治理',
    '人工複核',
    '教師研習',
    '互動式簡報',
  ],
  addedAt: '2026-08-25T00:00:00+08:00',
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
    await page.waitForTimeout(1800);
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
    await page.waitForTimeout(500);
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
