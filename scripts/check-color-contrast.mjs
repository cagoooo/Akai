#!/usr/bin/env node
/**
 * 便利貼配色的無障礙對比檢查（P0-4）
 *
 * 六色輪盤（noteTone.ts）上線後，卡片底色從「綠／藍」變成六種，
 * 內文用的 --ink-soft、行動提示用的 --olive-deep、徽章文字用的 --ink
 * 在每一種底色上都必須維持可讀。這支腳本把所有組合算出 WCAG 對比度，
 * 不合格就 exit 1，讓配色回歸靠工具把關而不是靠肉眼。
 *
 * 標準：一般內文 AA 需 4.5:1；≥18.66px 或粗體 ≥14px 的大字 AA 需 3:1。
 * 用法：node scripts/check-color-contrast.mjs
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const TOKENS_CSS = join(here, '..', 'client', 'src', 'styles', 'tokens.css');

const AA_NORMAL = 4.5;
const AA_LARGE = 3;

/** 從 tokens.css 的 :root 撈出所有 `--name: #rrggbb;` */
function readTokens() {
    const css = readFileSync(TOKENS_CSS, 'utf8');
    const tokens = {};
    for (const match of css.matchAll(/(--[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g)) {
        if (!(match[1] in tokens)) tokens[match[1]] = match[2]; // 第一次出現的（:root）為準
    }
    return tokens;
}

function toRgb(hex) {
    let value = hex.replace('#', '');
    if (value.length === 3) value = value.split('').map((c) => c + c).join('');
    if (value.length === 8) value = value.slice(0, 6); // 忽略 alpha
    const int = parseInt(value, 16);
    return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function relativeLuminance(hex) {
    const [r, g, b] = toRgb(hex).map((channel) => {
        const c = channel / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(a, b) {
    const la = relativeLuminance(a);
    const lb = relativeLuminance(b);
    const [light, dark] = la > lb ? [la, lb] : [lb, la];
    return (light + 0.05) / (dark + 0.05);
}

const tokens = readTokens();
const get = (name) => {
    const value = tokens[name];
    if (!value) throw new Error(`tokens.css 找不到 ${name}，配色檢查無法進行`);
    return value;
};

/** 六色輪盤（需與 tokens.css 的 [data-tone="0..5"] 一致） */
const TONES = [
    ['tone 0 綠', get('--note-green')],
    ['tone 1 藍', get('--note-blue')],
    ['tone 2 黃', get('--note-yellow')],
    ['tone 3 粉', get('--note-pink')],
    ['tone 4 橘', get('--note-orange')],
    ['tone 5 紫', get('--note-purple')],
];

/** 便利貼上會出現的前景色，以及它們算大字還是內文 */
const FOREGROUNDS = [
    ['標題 --ink', get('--ink'), AA_NORMAL],
    ['說明 --ink-soft', get('--ink-soft'), AA_NORMAL],
    ['行動提示 --olive-on-note', get('--olive-on-note'), AA_NORMAL],
    ['副標 --muted2', get('--muted2'), AA_NORMAL],
];

/** 徽章底色（文字一律 --ink） */
const BADGES = [
    ['painpoint', '#ffd34a'],
    ['popular', '#ff9d6b'],
    ['role', '#a3e88a'],
    ['stage', '#8ec6ff'],
    ['discovery', '#d9aeff'],
    ['universal', '#fffdf5'],
    ['novelty fresh', '#ffd67a'],
    ['novelty unseen', '#9fd4ff'],
];

const failures = [];
const rows = [];

for (const [toneName, toneHex] of TONES) {
    for (const [fgName, fgHex, threshold] of FOREGROUNDS) {
        const ratio = contrastRatio(toneHex, fgHex);
        const pass = ratio >= threshold;
        rows.push({ 組合: `${toneName} × ${fgName}`, 對比: ratio.toFixed(2), 門檻: threshold, 結果: pass ? 'PASS' : 'FAIL' });
        if (!pass) failures.push(`${toneName}(${toneHex}) × ${fgName}(${fgHex}) = ${ratio.toFixed(2)}，需 ${threshold}`);
    }
}

const ink = get('--ink');
for (const [badgeName, badgeHex] of BADGES) {
    // 徽章字級 10-10.5px 但 font-weight 900 —— 不符合 WCAG「大字」定義，一律用內文門檻
    const ratio = contrastRatio(badgeHex, ink);
    const pass = ratio >= AA_NORMAL;
    rows.push({ 組合: `徽章 ${badgeName} × --ink`, 對比: ratio.toFixed(2), 門檻: AA_NORMAL, 結果: pass ? 'PASS' : 'FAIL' });
    if (!pass) failures.push(`徽章 ${badgeName}(${badgeHex}) × --ink = ${ratio.toFixed(2)}，需 ${AA_NORMAL}`);
}

// 徽章貼在卡片上的「看得出邊界嗎」：
// 徽章本身有 1.5px 的 --ink 外框，所以界線靠的是外框而不是兩塊色的亮度差
// （WCAG 非文字元素 3:1 是針對沒有邊框的元件）。要檢查的是那條外框
// 對徽章底色、以及對卡片底色都夠明顯。
for (const [toneName, toneHex] of TONES) {
    for (const [badgeName, badgeHex] of BADGES) {
        const vsCard = contrastRatio(ink, toneHex);
        const vsBadge = contrastRatio(ink, badgeHex);
        if (vsCard < AA_LARGE || vsBadge < AA_LARGE) {
            failures.push(`徽章 ${badgeName} 貼在 ${toneName} 上時，--ink 外框不夠明顯（對卡片 ${vsCard.toFixed(2)} / 對徽章 ${vsBadge.toFixed(2)}，需 ${AA_LARGE}）`);
        }
    }
}

console.table(rows);

if (failures.length > 0) {
    console.error(`\n❌ 配色對比未達 WCAG AA（${failures.length} 項）：`);
    failures.forEach((line) => console.error(`  · ${line}`));
    process.exit(1);
}

console.log('\n✅ 便利貼六色 × 前景色 / 徽章配色全數通過 WCAG AA');
