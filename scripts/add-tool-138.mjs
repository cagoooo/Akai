#!/usr/bin/env node
/**
 * 新增工具 #138：Ollama 石門線上客服系統（石小客服）
 * 1. 以 Playwright 擷取已上線網站的實際首頁畫面（只開首頁、不發問，不會產生問答紀錄），輸出 1024×1024 WebP 預覽圖
 * 2. 寫入 server/data/tools.json（唯一資料來源）
 * 3. 後續由 sync-tools-json.mjs 同步前端，並由 generate-unified-og.mjs 產生 OG 圖
 *
 * 內容查證（2026-11-22）：
 * - 正式網址回 200，首頁標題「石小客服」，前端呼叫 api/chat（ndjson 串流）與 api/feedback
 * - 實際送 1 題「上學時間是幾點？」：先「正在查詢學校資料（共 125 筆）」→ 列資料來源 → 逐字串流回答
 * - 私人 repo cagoooo/shimen-chatbot：server.js MODEL 預設 gemma4:e4b-it-qat、embeddings.js 用 embeddinggemma、
 *   流量限制每分鐘 10／每小時 100；README 載明公告與停課查詢不經模型、凌晨 2 點校網掃描寫草稿須後台通過
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const ID = 138;
const URL = 'https://smes.tail207590.ts.net/';
const TOOLS_SERVER = resolve(ROOT, 'server', 'data', 'tools.json');
const PREVIEW_DIR = resolve(ROOT, 'client', 'public', 'previews');
const PREVIEW_PATH = resolve(PREVIEW_DIR, `tool_${ID}.webp`);

const tool = {
  id: ID,
  audienceFit: {
    audiences: ['teacher'],
    schoolLevels: ['elementary'],
    teacherRoles: ['admin', 'homeroom'],
    painPoints: ['communication', 'administration', 'teacher-workload', 'it-support'],
    priority: 62,
    reasons: {
      teacher:
        '學校電話最常被問的請假、轉學、在學證明、上放學時間，交給 24 小時都能回答的線上客服先接住；每則回答附資料來源，答不出來的題目會集中到後台，方便補資料。',
      admin:
        '教務、學務、總務、輔導與資訊組都能用：知識庫依處室整理校網公開資料，公告與颱風停課直接列原文不經過模型；每晚掃描校網寫成草稿，行政人員在後台審核通過才生效，掌控權留在學校。想在自己學校架設的資訊人員，也能參考它「模型跑在校內主機、不送雲端 AI」的作法。',
      homeroom:
        '家長在班級群組問「幾點放學」「怎麼請假」「在學證明去哪申請」時，導師可以直接給這個連結，家長會得到附來源的回答；重要事項仍以學校公告為準。',
    },
  },
  title: 'Ollama 石門線上客服系統',
  description:
    '石門國小自架的家長線上客服「石小客服」：跑在學校一台 Mac 上，用本機 Ollama 的 Gemma 模型回答請假、轉學、證明申請、上放學時間等問題，資料只取自校網與學校提供的資料，不送雲端 AI；公告與颱風停課直接列原文。',
  detailedDescription: `「石小客服」是石門國小自己架設的家長線上客服。模型跑在學校的一台 Mac 上（本機 Ollama），家長的問題不會送到雲端 AI；回答的依據只來自校網公開資料與學校提供的資料，每則回答都附上資料來源。

## 家長看到什麼

- **常見問題一按就問**：電話與地址、學生請假、轉學證件、在學證明、上學放學時間、考試日期、午餐菜單、最新公告；也可以直接打字問。
- **附資料來源**：回答下方列出參考的校網頁面或學校文件，家長可以點開核對。
- **公告與停課不經過模型**：問「最新公告」時，直接列出校網公告的原文標題、日期與連結（每 30 分鐘更新）；問「明天要停課嗎」時，當場抓行政院人事行政總處的停班停課表，原文列出桃園市的內容。抓不到時會請家長看官方網站，不會說沒有停課。
- **今天、明天、下週三也聽得懂**：程式先把日期換算好，連同行事曆那幾天的紀錄交給模型，模型不用自己推算星期。
- **按 👍／👎 回饋**：每則回答都能評分，幫學校找出答得不好的題目。
- **清楚告知**：頁面寫明「AI 回答僅供參考」「問答紀錄保留 30 天」「請勿輸入個資」，重要事項以學校公告為準。

## 怎麼找資料、怎麼回答

每題同時用兩種方式找資料：中文關鍵字比對，加上 Ollama 的 \`embeddinggemma\` 向量比對語意（家長問「學費」、資料寫「註冊費」也找得到），合併名次後取最相關的 3 段，交給 \`gemma4:e4b-it-qat\` 寫成回答。相關度不夠就不硬答；向量模型沒回應時自動改用關鍵字，客服照常運作。2026-11-22 實測問「上學時間是幾點？」，系統先在 125 段學校資料裡找到上學放學時間，列出來源後逐字回答。

## 管理者後台

後台只在學校那台 Mac 本機或學校的 Tailscale 內部網路開啟，不經過公開網址：

- **問答紀錄**：每則問答列出找到哪些資料、關鍵字第幾名、向量相似度多少，答錯時分得出是「找錯資料」還是「找對了但模型講錯」。
- **家長回饋**：「👎 沒幫助」分頁集中列出沒幫助的回答，「統計」有近 7 天的回饋摘要。
- **答不出來**：沒找到資料、停課表抓不到這類回答集中列出，方便補知識庫。
- **校網掃描與草稿審核**：每天凌晨 2 點比對知識庫來源，抓校網新出現的連結，由本機 Gemma 寫成草稿；出現原網頁沒有的數字時會標出警告。**管理者按「通過，加入知識庫」才會生效**，客服不會自動改用新內容。也會提醒可能過時的段落（連結失效、寫到已過去的學期）。

## 隱私與穩定

- 模型與資料都在學校主機上，不使用雲端 AI 服務；問答紀錄只有管理者看得到，保留 30 天。
- 每個連線每分鐘最多 10 題、每小時 100 題，避免被大量灌題。
- 對外透過 Tailscale Funnel 提供網址；另有 GitHub Actions 每 30 分鐘從外部檢查一次，連續失敗會寄信通知。

## 使用限制

AI 回答可能出錯，重要事項請以學校公告或來電 03-4711752 為準。客服跑在一台 8 GB 記憶體的 Mac 上，回答約需十幾秒；學校主機關機或斷網時，客服也會暫停。`,
  url: URL,
  icon: 'Bot',
  category: 'communication',
  previewUrl: `/previews/tool_${ID}.webp`,
  ogPreviewUrl: `/previews/og/tool_${ID}.webp`,
  tags: [
    '家長客服',
    '親師溝通',
    '本機 AI',
    'Ollama',
    'Gemma',
    '不送雲端',
    '知識庫檢索',
    '學校公告',
    '停課查詢',
    '校網掃描',
    '行政減量',
  ],
  addedAt: '2026-11-22T09:50:00.000Z',
};

function writeTool() {
  const tools = JSON.parse(readFileSync(TOOLS_SERVER, 'utf8'));
  const existingIndex = tools.findIndex((item) => item.id === ID);
  if (existingIndex >= 0) {
    tools[existingIndex] = tool;
  } else {
    const insertIdx = tools.findIndex((item) => item.id > ID);
    if (insertIdx === -1) tools.push(tool);
    else tools.splice(insertIdx, 0, tool);
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
      colorScheme: 'light',
      serviceWorkers: 'block',
    });
    const page = await context.newPage();
    // 只開首頁、不發問：擋掉問答與回饋端點，確保不會寫進學校的問答紀錄
    await page.route(/\/api\/(chat|feedback)/, (route) => route.abort());
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3500);
    await page.evaluate(() => {
      // 「有新版本」提示列與說明對話框不入鏡
      document.querySelectorAll('[class*="update"], [id*="update"], dialog[open]').forEach((node) => {
        if (node.textContent && /新版本|重新整理/.test(node.textContent)) node.remove();
      });
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(500);
    const buffer = await page.screenshot({ type: 'png' });
    await sharp(buffer)
      .resize(1024, 1024, { fit: 'cover', position: 'top' })
      .webp({ quality: 88 })
      .toFile(PREVIEW_PATH);
  } finally {
    await browser.close();
  }
}

await capturePreview();
writeTool();
console.log(`✅ 已新增 #${ID} ${tool.title}`);
console.log(`🖼️ 預覽圖：${PREVIEW_PATH}`);
