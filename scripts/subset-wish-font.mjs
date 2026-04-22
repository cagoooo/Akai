#!/usr/bin/env node

/**
 * 精簡許願池預覽圖用字型（Noto Sans TC）
 *
 * 目的：把 12MB 的完整 TTF 精簡為只含本專案用到的字元（約 100 KB），
 *       讓 repo 變輕、CI build 也變快。
 *
 * 執行時機：手動，當許願池預覽圖文字改動時。
 *   npm run subset-wish-font
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FONT_IN = resolve(__dirname, 'fonts', 'NotoSansTC-Bold.ttf');
const FONT_OUT = resolve(__dirname, 'fonts', 'NotoSansTC-WishSubset.ttf');

// 許願池預覽圖用到的所有中文字元（含可能未來會加的常用字）
const USED_TEXT = `
阿凱老師的許願池
教育工具許願使用回饋
有想到的教學工具點子
想給我們一點鼓勵或建議
投入許願池
夢幻教具希望有的工具
小陳老師
感謝鼓勵
點石成金救了我
靜芳老師
問題回報
第按鈕點不動
阿凱老師教育科技創新專區
桃園市石門國小
訊息內容送出願望成功失敗
正在載入請稍後
貼上你最順手的教育小工具
釘在牆上的教學點子
本週排行榜使用者評論
相關推薦瀏覽全部
好用易用實用有趣溫馨創新
`;

const chars = Array.from(new Set([
  ...USED_TEXT,
  // 基本拉丁字母 + 數字 + 常用符號
  ...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,:;!?-_/·×+-()[]{}|@#$%&*"\'',
  // emoji 無法用字型渲染，保持原有 SVG 內嵌方式
])).join('');

console.log(`總共 ${chars.length} 個字元要保留`);

const buffer = readFileSync(FONT_IN);
const subset = await subsetFont(buffer, chars, {
  targetFormat: 'truetype',
});

writeFileSync(FONT_OUT, subset);

const inMB = (buffer.length / 1024 / 1024).toFixed(2);
const outKB = (subset.length / 1024).toFixed(1);
const ratio = ((subset.length / buffer.length) * 100).toFixed(1);

console.log(`\n✨ 字型精簡完成`);
console.log(`   原始：${inMB} MB`);
console.log(`   精簡後：${outKB} KB (${ratio}% 大小)`);
console.log(`   輸出：${FONT_OUT}\n`);
