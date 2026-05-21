#!/usr/bin/env node

/**
 * 用 Gemini Embedding API 為 tools.json 內每個工具產生 embedding 向量
 * 輸出：client/public/api/tool-embeddings.json
 *
 * 認證：
 *   - 本地：讀 .env 的 GEMINI_API_KEY
 *   - CI：讀 process.env.GEMINI_API_KEY（GitHub Secret）
 *   - 都沒有 → 跳過不 fail（client 自動 fallback fuzzy 模式）
 *
 * 模型：gemini-embedding-001
 *   - 1536 維（或更小 outputDimensionality）
 *   - 多語言支援（中文 OK）
 *   - Free tier 1500 RPM 對 100 工具一次性 build 非常夠
 *
 * 用法：
 *   GEMINI_API_KEY=AIzaSy... node scripts/generate-tool-embeddings.mjs
 *   # 或 .env 設好直接跑
 *   node scripts/generate-tool-embeddings.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TOOLS_JSON = resolve(ROOT, 'client', 'public', 'api', 'tools.json');
const OUT_JSON = resolve(ROOT, 'client', 'public', 'api', 'tool-embeddings.json');
const ENV_PATH = resolve(ROOT, '.env');

const MODEL = 'gemini-embedding-001';
const OUTPUT_DIM = 768; // 1536 也行，但 768 省 50% 流量；對相似度查詢無感

// ── 讀 GEMINI_API_KEY ─────────────────────────────────
function loadApiKey() {
  // 1) 環境變數優先（CI）
  if (process.env.GEMINI_API_KEY) {
    console.log('🔑 用 env GEMINI_API_KEY');
    return process.env.GEMINI_API_KEY;
  }
  // 2) .env 檔（本地）
  if (existsSync(ENV_PATH)) {
    const env = readFileSync(ENV_PATH, 'utf-8');
    const match = env.match(/^GEMINI_API_KEY\s*=\s*"?([^"\n]+)"?\s*$/m);
    if (match) {
      console.log('🔑 用本地 .env 的 GEMINI_API_KEY');
      return match[1];
    }
  }
  return null;
}

async function embedText(apiKey, text) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:embedContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: { parts: [{ text }] },
      taskType: 'RETRIEVAL_DOCUMENT',  // 工具描述用 DOCUMENT，query 那邊用 QUERY
      outputDimensionality: OUTPUT_DIM,
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API ${res.status}: ${errText.slice(0, 200)}`);
  }
  const data = await res.json();
  if (!data.embedding?.values) {
    throw new Error(`Gemini API 回傳格式異常：${JSON.stringify(data).slice(0, 200)}`);
  }
  return data.embedding.values;
}

// ── 主流程 ─────────────────────────────────────────
async function main() {
  const apiKey = loadApiKey();
  if (!apiKey) {
    console.warn('⚠️  沒設 GEMINI_API_KEY（env 或 .env），跳過 embeddings 生成');
    console.warn('   client 會自動 fallback 到 fuzzy 模式（功能仍可用，只是不會語意比對）');
    console.warn('');
    console.warn('💡 啟用語意搜尋：');
    console.warn('   1. 拿 Gemini API key: https://aistudio.google.com/app/apikey');
    console.warn('   2. echo GEMINI_API_KEY=AIzaSy... >> .env');
    console.warn('   3. node scripts/generate-tool-embeddings.mjs');
    process.exit(0);
  }

  const tools = JSON.parse(readFileSync(TOOLS_JSON, 'utf-8'));
  console.log(`📚 將 ${tools.length} 個工具 embed（模型 ${MODEL}，${OUTPUT_DIM} 維）`);
  console.log('');

  const embeddings = {};
  let success = 0, failed = 0;
  for (const tool of tools) {
    // 把 title / description / tags / detailedDescription 串起來當 document content
    // 用空格分隔，給 embedding 模型更多 context
    const text = [
      tool.title,
      tool.description || '',
      (tool.tags || []).join(' '),
      (tool.detailedDescription || '').slice(0, 1500), // 截斷避免超 token limit
    ].filter(Boolean).join(' · ');

    try {
      const vector = await embedText(apiKey, text);
      embeddings[String(tool.id)] = vector;
      success++;
      process.stdout.write(`  ✅ #${tool.id} ${tool.title.slice(0, 30)}\r`);
      // Rate limit：1500 RPM ≈ 25 RPS，留 buffer 用 100ms 間隔
      await new Promise((r) => setTimeout(r, 100));
    } catch (err) {
      console.error(`\n  ❌ #${tool.id} ${tool.title}: ${err.message}`);
      failed++;
    }
  }
  console.log('\n');

  if (success === 0) {
    console.error('❌ 全部失敗，不寫檔');
    process.exit(1);
  }

  const output = {
    model: MODEL,
    dimensions: OUTPUT_DIM,
    generatedAt: new Date().toISOString(),
    toolCount: tools.length,
    embeddings, // { "1": [0.123, -0.456, ...], "2": [...] }
  };
  writeFileSync(OUT_JSON, JSON.stringify(output), 'utf-8');

  const sizeMB = (JSON.stringify(output).length / 1024 / 1024).toFixed(2);
  console.log(`✨ 完成：${success} 成功，${failed} 失敗`);
  console.log(`📦 寫入 ${OUT_JSON} (${sizeMB} MB)`);
}

main().catch((err) => {
  console.error('❌ 失敗：', err);
  process.exit(1);
});
