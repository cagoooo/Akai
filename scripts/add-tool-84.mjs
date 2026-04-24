#!/usr/bin/env node

/**
 * 把 ID 84「會議記錄自動產出平台 (Pro版)」加入 tools.json
 *
 * 同時同步更新：
 *   - client/public/api/tools.json  （前端讀取）
 *   - server/data/tools.json         （後端 API，如存在）
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const newTool = {
  id: 84,
  title: '會議記錄自動產出平台 (Pro版)',
  description:
    '專為校務會議、教學研討設計的 AI 會議記錄小幫手。錄音上傳後自動轉寫逐字稿、智慧摘要重點與行動事項，並一鍵匯出 Word / PDF，讓繁瑣的會議紀錄從此省下大半時間。',
  detailedDescription:
    '「會議記錄自動產出平台 Pro 版」是阿凱老師專為第一線教師與行政同仁打造的 AI 會議記錄神器。使用者只需上傳音訊或錄音檔，系統即可呼叫高精度語音辨識模型完成即時逐字稿轉寫，並自動標註發言者。AI 會依照會議流程產出「會議摘要」「決議事項」「待辦行動」「出席名單」等結構化欄位，使用者可直接修潤並一鍵匯出 Word / PDF / 純文字格式，完美符合學校公文與校務會議紀錄需求。Pro 版額外提供多種樣板（領域會議、導師會議、校務會議等）、自訂欄位、與 LINE 推播提醒等進階功能，大幅減輕教師行政負擔，讓寶貴時間回歸教學本身。',
  url: 'https://cagoooo.github.io/domain-meeting-go/',
  icon: 'ClipboardCheck',
  category: 'utilities',
  previewUrl: '/previews/tool_84.webp',
  ogPreviewUrl: '/previews/tool_84_og.webp',
  tags: [
    '會議記錄',
    'AI 轉寫',
    '自動摘要',
    '領域會議',
    '導師會議',
    '校務會議',
    '行政效率',
    '語音辨識',
    'Word 匯出',
    'PDF 匯出',
  ],
};

function updateToolsJson(p) {
  if (!existsSync(p)) {
    console.log(`   (略過：${p} 不存在)`);
    return;
  }
  const tools = JSON.parse(readFileSync(p, 'utf-8'));
  const existingIdx = tools.findIndex((t) => t.id === 84);
  if (existingIdx >= 0) {
    tools[existingIdx] = newTool;
    console.log(`   🔄 覆蓋既有 ID 84`);
  } else {
    tools.push(newTool);
    console.log(`   ➕ 新增 ID 84`);
  }
  writeFileSync(p, JSON.stringify(tools, null, 2) + '\n', 'utf-8');
  console.log(`   ✅ 寫入 ${p}（總數：${tools.length}）`);
}

console.log('📝 更新 tools.json...\n');
console.log('client/public/api/tools.json:');
updateToolsJson(resolve(ROOT, 'client', 'public', 'api', 'tools.json'));
console.log('\nserver/data/tools.json:');
updateToolsJson(resolve(ROOT, 'server', 'data', 'tools.json'));
console.log('\n✨ 完成！');
