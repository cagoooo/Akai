#!/usr/bin/env node
/**
 * 非互動版：新增工具 #108「資安特攻隊：釣魚郵件偵蒐」
 * 1. Playwright 截圖目標站 → 1024×1024 webp 卡片預覽圖
 * 2. 寫入 client/public/api/tools.json + server/data/tools.json（插在 #100 彩蛋之前）
 * OG 圖另跑 generate-unified-og.mjs 108。
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TOOLS_CLIENT = resolve(ROOT, 'client', 'public', 'api', 'tools.json');
const TOOLS_SERVER = resolve(ROOT, 'server', 'data', 'tools.json');
const PREVIEWS_DIR = resolve(ROOT, 'client', 'public', 'previews');

const ID = 108;
const URL = 'https://cagoooo.github.io/security-squad-cockpit/';

const tool = {
  id: ID,
  title: '資安特攻隊：釣魚郵件偵蒐',
  description:
    '一封看起來像銀行、像老師、像官方的訊息，到底是真的還是釣魚陷阱？#108 把資安教育變成一場闖關遊戲：學生扮演「鱻盾資安特攻隊」資安新兵，跟 NotebookLM 的阿盾教官對話，一封封揪出釣魚破綻，用「五看口訣」拆穿詐騙，集滿 5 枚徽章晉升正式隊員。附老師導覽五步驟、AI 即時生成教材，一節課帶孩子練成數位防身術。',
  detailedDescription:
    '「資安特攻隊：釣魚郵件偵蒐」是阿凱老師為桃園市龍潭區石門國民小學（鱻魚特色學園）打造的**資訊素養情境闖關**，掛在 IT COCKPIT 平台，把生硬的「資訊安全宣導」變成一場小學高年級會玩到欲罷不能的反詐騙遊戲。\n\n## 😱 它解決的痛點\n\n網路詐騙年年翻新，假冒銀行、假冒老師、假冒官方的釣魚訊息天天在孩子手機裡流竄。但資安教育常常淪為「老師念一遍注意事項、學生左耳進右耳出」。#108 反其道而行——**讓學生親手揪出一封封釣魚信**，在實戰判斷裡把防身術練進肌肉記憶。\n\n## 🎮 核心玩法：跟 AI 教官對話闖關\n\n學生扮演「鱻盾資安特攻隊」的**資安新兵**，進入 NotebookLM 聊天室向**阿盾教官**報到：\n\n1. **接收可疑訊息** — 教官把攔截到的訊息一封封交給你\n2. **判斷真假** — 這是 ✅ 安全還是 ⚠️ 釣魚陷阱？\n3. **說出破綻集徽章** — 講出哪裡露馬腳就得徽章，卡關可「請求提示」\n4. **晉升** — 集滿 **5 枚資安徽章** 即從新兵晉升「鱻盾正式隊員」\n\n對話由 **NotebookLM AI 即時生成**，每個學生的闖關節奏都不一樣，像真的有個教官在旁邊一對一帶。\n\n## 🔍 核心武器：辨識釣魚的「五看口訣」\n\n- **一看寄件人** — 真公司不會用免費信箱\n- **二看語氣** — 正派機構不會恐嚇你「不處理就停權」\n- **三看連結** — 滑鼠移上去驗證真實網址\n- **四看要求** — 拒絕洩露密碼 / OTP 驗證碼\n- **五看好康錯字** — 太好康 ＋ 錯字連篇 ＝ 詐騙\n\n## 🛡️ 帶走四個數位防身術\n\n辨識網路釣魚 · 密碼安全四守則（夠長、不重複、不外洩、開兩步驟驗證）· 保護個人資料 · 遇詐騙先告訴大人、改密碼、撥 **165** 反詐騙專線。\n\n## 👩‍🏫 老師端整套就緒\n\n附**老師導覽五步驟**（暖身念口訣 5 分 → 師生示範破解案件 5 分 → 兩三人小組闖關 20 分 → 對照學習總表收斂 5-10 分 → 叮嚀密碼保密與 165）、NotebookLM 自動生成的「遊戲說明書」簡報與「核心學習內容總表」資料表、上課用的 ✏️ 畫筆標註與 🎲 隨機抽號器，一節課（30-40 分）即可開課。\n\n## 🧰 技術棧\n\n純靜態 HTML/CSS/JS + GitHub Pages 零成本部署，闖關引擎接 **NotebookLM** 當即時 AI 教官，IT COCKPIT 資訊素養駕駛艙系列（與 [#81 教學駕駛艙入口網](/tool/81) 同源）。桃園市龍潭區石門國民小學 × 阿凱老師打造，邊玩邊學，把反詐騙練成本能。',
  url: URL,
  icon: 'Gamepad2',
  category: 'interactive',
  previewUrl: `/previews/tool_${ID}.webp`,
  ogPreviewUrl: '',
  tags: [
    '資安教育',
    '釣魚郵件',
    '反詐騙',
    '數位素養',
    '資訊安全',
    '五看口訣',
    '闖關遊戲',
    'NotebookLM',
    'AI教官',
    '165反詐騙',
    '資安徽章',
    '石門國小',
  ],
  addedAt: new Date().toISOString(),
};

async function screenshot(outPath) {
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    try { ({ chromium } = await import('@playwright/test')); }
    catch { console.log('⚠️ 找不到 playwright，跳過截圖'); return false; }
  }
  const sharp = (await import('sharp')).default;
  const browser = await chromium.launch({ headless: true });
  try {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 1280 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await ctx.addInitScript(() => {
      ['tyc_tut_done', 'tour_complete', 'onboarding_done', 'hasSeenTour',
       'cookie_accepted', 'announcement_dismissed', 'welcome_shown',
       'akai_onboarded_v1', 'akai_install_dismissed'].forEach((k) => {
        try { localStorage.setItem(k, '1'); } catch {}
      });
    });
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(2000);
    await page.evaluate(() => {
      const sels = ['.driver-popover', '.driver-overlay', '#updateBanner', '#cookieBanner',
        '#announcement', '[class*="cookie-banner"]', '[class*="onboard"]', '[class*="tutorial"]',
        '.akai-ob-bg', '.akai-ob-modal', '[class*="akai-ob-"]'];
      sels.forEach((s) => document.querySelectorAll(s).forEach((el) => el.remove()));
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(400);
    const buf = await page.screenshot({ type: 'png', fullPage: false });
    await sharp(buf).resize(1024, 1024, { fit: 'cover', position: 'top' }).webp({ quality: 88 }).toFile(outPath);
    console.log('✅ 截圖完成', outPath);
    return true;
  } catch (e) { console.warn('⚠️ 截圖失敗', e.message); return false; }
  finally { await browser.close(); }
}

function writeJson(p) {
  if (!existsSync(p)) { console.log('（略過不存在）', p); return; }
  const tools = JSON.parse(readFileSync(p, 'utf-8'));
  const exist = tools.findIndex((t) => t.id === ID);
  if (exist >= 0) { tools[exist] = tool; console.log('🔄 覆蓋 #' + ID, p); }
  else {
    const at100 = tools.findIndex((t) => t.id === 100); // #100 彩蛋固定放最末，新工具插它前面
    if (at100 === -1) tools.push(tool); else tools.splice(at100, 0, tool);
    console.log('➕ 新增 #' + ID, p);
  }
  writeFileSync(p, JSON.stringify(tools, null, 2) + '\n', 'utf-8');
}

if (!existsSync(PREVIEWS_DIR)) mkdirSync(PREVIEWS_DIR, { recursive: true });
const previewPath = resolve(PREVIEWS_DIR, `tool_${ID}.webp`);
const ok = await screenshot(previewPath);
tool.previewUrl = ok ? `/previews/tool_${ID}.webp` : '';
writeJson(TOOLS_CLIENT);
writeJson(TOOLS_SERVER);
console.log('完成 #' + ID, tool.title);
