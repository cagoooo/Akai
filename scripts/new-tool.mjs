#!/usr/bin/env node

/**
 * 一鍵新工具產生器（v3.6.8）
 *
 * 互動式 CLI：
 *   1. 提示輸入：標題、URL、分類、標籤、Lucide icon
 *   2. （選用）Gemini API 自動生成 description / detailedDescription
 *      └ 需設環境變數 GEMINI_API_KEY；沒設就改為手動輸入
 *   3. 用 Playwright headless 截 URL 螢幕 → 縮成 1024×1024 卡片預覽圖
 *   4. 寫入 client/public/api/tools.json（與 server/data/tools.json 若存在）
 *   5. 自動呼叫 generate-unified-og.mjs 產 OG 圖
 *   6. 列印下一步操作（commit、build、deploy）
 *
 * 用法：
 *   node scripts/new-tool.mjs
 *
 * 加速版（跳過部分提示）：
 *   node scripts/new-tool.mjs --title "工具名" --url "https://..." --category utilities
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout, argv, exit } from 'node:process';
import { spawn } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TOOLS_JSON_CLIENT = resolve(ROOT, 'client', 'public', 'api', 'tools.json');
const TOOLS_JSON_SERVER = resolve(ROOT, 'server', 'data', 'tools.json');
const PREVIEWS_DIR = resolve(ROOT, 'client', 'public', 'previews');

// ── CLI 參數解析（簡單版） ───────────────────────────
const args = {};
for (let i = 2; i < argv.length; i++) {
  const a = argv[i];
  if (a.startsWith('--')) {
    const k = a.slice(2);
    args[k] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
  }
}

const rl = createInterface({ input: stdin, output: stdout });
const ask = async (q, def) => {
  const ans = (await rl.question(`${q}${def ? ` [${def}]` : ''}: `)).trim();
  return ans || def || '';
};
const askChoice = async (q, choices, def) => {
  console.log(`\n${q}`);
  choices.forEach((c, i) => {
    const marker = c === def ? '★' : ' ';
    console.log(`  ${marker} ${i + 1}. ${c}`);
  });
  while (true) {
    const ans = (await rl.question(`選擇編號 (1-${choices.length})${def ? ` [預設 ${choices.indexOf(def) + 1}]` : ''}: `)).trim();
    if (!ans && def) return def;
    const n = parseInt(ans, 10);
    if (n >= 1 && n <= choices.length) return choices[n - 1];
    console.log('  ⚠️ 請輸入有效編號');
  }
};

// ── 分類常數（與 toolAdapter / generate-unified-og 對齊） ──
const CATEGORIES = [
  { key: 'communication', label: '溝通互動 communication' },
  { key: 'teaching', label: '教學設計 teaching' },
  { key: 'language', label: '語文寫作 language' },
  { key: 'reading', label: '語文閱讀 reading' },
  { key: 'utilities', label: '實用工具 utilities' },
  { key: 'games', label: '教育遊戲 games' },
  { key: 'interactive', label: '互動體驗 interactive' },
];

// 常用 Lucide icon（與 toolAdapter ICON_TO_EMOJI 表對齊）
const COMMON_ICONS = [
  'Sparkles', 'Lightbulb', 'BookOpen', 'Book', 'MessageSquare', 'MessageCircle',
  'Gamepad2', 'QrCode', 'Palette', 'Music', 'Calculator', 'Bot',
  'Gift', 'Wand2', 'Star', 'Trophy', 'Camera', 'Video', 'Mic',
  'Heart', 'Crown', 'Map', 'Clock', 'Brain', 'Feather', 'Rocket',
  'ClipboardCheck', 'Languages', 'FileText', 'MessageSquareText',
];

// ── Gemini API：選用，沒 key 就 skip ───────────────
async function generateDescriptionsWithGemini(title, url) {
  const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!key) return null;

  console.log('\n🤖 呼叫 Gemini 生成 description / detailedDescription…');
  const prompt = `你是阿凱老師教育工具集的內容文案。請為下方教育工具產生：
1. description（一段話 60-100 字，吸引老師點開的描述）
2. detailedDescription（一段詳細介紹 200-350 字，含目標使用者、主要功能、教學情境）

工具名稱：${title}
工具網址：${url}

僅以 JSON 格式回覆（不要任何前後說明）：
{"description": "...", "detailedDescription": "..."}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      }
    );
    if (!res.ok) {
      console.warn(`  ⚠️ Gemini 呼叫失敗 ${res.status}：${(await res.text()).slice(0, 200)}`);
      return null;
    }
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;
    const parsed = JSON.parse(text);
    if (parsed.description && parsed.detailedDescription) {
      console.log('  ✅ AI 描述生成完成');
      return parsed;
    }
    return null;
  } catch (err) {
    console.warn(`  ⚠️ Gemini 呼叫異常：${err.message}`);
    return null;
  }
}

// ── Playwright 截圖：選用，沒 playwright 就 skip ───
async function screenshotUrl(url, outPath) {
  console.log(`\n📸 用 Playwright 截圖 ${url}…`);
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    console.log('  ⚠️ 找不到 playwright 套件（npm i -D playwright），跳過截圖');
    return false;
  }
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.log('  ⚠️ 找不到 sharp 套件，跳過截圖');
    return false;
  }

  const browser = await chromium.launch({ headless: true });
  try {
    const ctx = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    // 等 1 秒讓 transitions 結束
    await page.waitForTimeout(1000);
    const buf = await page.screenshot({ type: 'png', fullPage: false });
    // 處理為 1024×1024（cover crop）
    await sharp(buf)
      .resize(1024, 1024, { fit: 'cover', position: 'top' })
      .webp({ quality: 88 })
      .toFile(outPath);
    console.log(`  ✅ 已產生 ${outPath}`);
    return true;
  } catch (err) {
    console.warn(`  ⚠️ 截圖失敗：${err.message}`);
    return false;
  } finally {
    await browser.close();
  }
}

// ── tools.json 寫入 ───────────────────────────────
function writeToolToJson(p, tool) {
  if (!existsSync(p)) {
    console.log(`   (略過：${p} 不存在)`);
    return;
  }
  const tools = JSON.parse(readFileSync(p, 'utf-8'));
  const existingIdx = tools.findIndex((t) => t.id === tool.id);
  if (existingIdx >= 0) {
    tools[existingIdx] = tool;
    console.log(`   🔄 覆蓋既有 ID ${tool.id} ${p}`);
  } else {
    tools.push(tool);
    console.log(`   ➕ 新增 ID ${tool.id} 到 ${p}`);
  }
  writeFileSync(p, JSON.stringify(tools, null, 2) + '\n', 'utf-8');
}

// ── 子程序執行 generate-unified-og.mjs ────────────
function runUnifiedOg(toolId) {
  return new Promise((resolveProc) => {
    console.log(`\n🖼️  呼叫 generate-unified-og.mjs ${toolId}…`);
    const child = spawn(
      'node',
      [resolve(__dirname, 'generate-unified-og.mjs'), String(toolId)],
      { stdio: 'inherit' }
    );
    child.on('exit', (code) => {
      if (code === 0) console.log(`  ✅ OG 圖完成`);
      else console.log(`  ⚠️ OG 圖生成異常（exit ${code}）`);
      resolveProc(code === 0);
    });
  });
}

// ═══════════════════════════════════════════════
// 主流程
// ═══════════════════════════════════════════════
async function main() {
  console.log('🌟 阿凱老師教育工具集 — 一鍵新工具產生器\n');

  // 1. 讀現有 tools 算下一個 ID
  if (!existsSync(TOOLS_JSON_CLIENT)) {
    console.error(`❌ 找不到 ${TOOLS_JSON_CLIENT}`);
    exit(1);
  }
  const tools = JSON.parse(readFileSync(TOOLS_JSON_CLIENT, 'utf-8'));
  const nextId = Math.max(...tools.map((t) => t.id)) + 1;
  console.log(`📋 目前 tools.json 共 ${tools.length} 個工具，下一個 ID = ${nextId}\n`);

  // 2. 互動輸入
  const id = parseInt(args.id || (await ask('工具 ID', String(nextId))), 10);
  const title = args.title || (await ask('工具標題（如「會議記錄自動產出平台」）'));
  if (!title) { console.error('❌ 標題為必填'); exit(1); }
  const url = args.url || (await ask('工具網址（https://...）'));
  if (!url) { console.error('❌ 網址為必填'); exit(1); }

  let category;
  if (args.category && CATEGORIES.find((c) => c.key === args.category)) {
    category = args.category;
  } else {
    const labels = CATEGORIES.map((c) => c.label);
    const chosen = await askChoice('分類', labels, labels[4]);
    category = CATEGORIES.find((c) => c.label === chosen).key;
  }

  const icon = args.icon || (await askChoice('Lucide icon', COMMON_ICONS, 'Sparkles'));

  const tagsRaw = args.tags || (await ask('標籤（逗號分隔，例：AI 轉寫,自動摘要,行政效率）'));
  const tags = tagsRaw.split(/[,，]/).map((s) => s.trim()).filter(Boolean);

  // 3. AI 描述 or 手動
  let description = '';
  let detailedDescription = '';
  const aiResult = await generateDescriptionsWithGemini(title, url);
  if (aiResult) {
    console.log('\n📝 AI 生成的內容（你可以接受或重寫）：');
    console.log(`description: ${aiResult.description}`);
    console.log(`detailedDescription: ${aiResult.detailedDescription.slice(0, 100)}...`);
    const accept = await ask('採用以上 AI 內容？(y/n)', 'y');
    if (accept.toLowerCase() === 'y') {
      description = aiResult.description;
      detailedDescription = aiResult.detailedDescription;
    }
  }
  if (!description) {
    description = await ask('description（一段話，60-100 字）');
  }
  if (!detailedDescription) {
    detailedDescription = await ask('detailedDescription（200-350 字，可省略後續再填）') || description;
  }

  // 4. 截圖
  if (!existsSync(PREVIEWS_DIR)) mkdirSync(PREVIEWS_DIR, { recursive: true });
  const previewPath = resolve(PREVIEWS_DIR, `tool_${id}.webp`);
  let hasPreview = existsSync(previewPath);
  if (!hasPreview && !args['skip-screenshot']) {
    hasPreview = await screenshotUrl(url, previewPath);
  }
  const previewUrl = hasPreview ? `/previews/tool_${id}.webp` : '';

  // 5. 組成 tool 物件
  const newTool = {
    id,
    title,
    description,
    detailedDescription,
    url,
    icon,
    category,
    previewUrl,
    ogPreviewUrl: '', // 由 generate-unified-og.mjs 補
    tags,
  };

  console.log('\n📦 即將寫入：');
  console.log(JSON.stringify(newTool, null, 2));
  const confirm = await ask('\n確認寫入？(y/n)', 'y');
  if (confirm.toLowerCase() !== 'y') {
    console.log('已取消。');
    rl.close();
    exit(0);
  }

  // 6. 寫 tools.json
  writeToolToJson(TOOLS_JSON_CLIENT, newTool);
  writeToolToJson(TOOLS_JSON_SERVER, newTool);

  // 7. 跑 generate-unified-og
  rl.close();
  await runUnifiedOg(id);

  // 8. 列印下一步
  console.log(`
✨ 工具 #${id}「${title}」已建立完成！

下一步建議：
  1. 確認 ${previewUrl || '(未產生卡片預覽圖，可手動放 client/public/previews/tool_' + id + '.webp)'}
  2. git status 看一下變更
  3. git add -A && git commit -m "✨ 新增工具 #${id}：${title}"
  4. npm run build && npx gh-pages -d dist/public

如果預覽圖品質不滿意，可以：
  - 自行截圖放到 client/public/previews/tool_${id}.webp
  - 重跑 OG 圖：node scripts/generate-unified-og.mjs ${id}
`);
}

main().catch((err) => {
  console.error('❌ 致命錯誤:', err);
  rl.close();
  exit(1);
});
