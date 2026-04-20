#!/usr/bin/env node

/**
 * Dead Link Checker
 *
 * Reads tools.json, sends HEAD requests to every tool URL,
 * and reports broken or timed-out links.
 *
 * Exit code 0 = all OK, 1 = at least one failure detected.
 * No npm dependencies required (Node 18+ native fetch).
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOOLS_PATH = resolve(__dirname, '..', 'client', 'public', 'api', 'tools.json');
const TIMEOUT_MS = 10_000;

// 模擬真實瀏覽器請求，避免被反爬蟲機制（如 Claude.ai、Cloudflare）擋掉
const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept':
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
};

// 已知有強反爬蟲機制（Cloudflare / Bot Protection）的網域。
// 這些網站用瀏覽器打得開，但自動化請求會一律被擋，偵測到時標示為「需人工確認」而非真正失效。
const BOT_PROTECTED_DOMAINS = [
  'padlet.com',       // Cloudflare 反爬蟲
  'claude.ai',        // Anthropic bot detection
  'notion.so',        // Notion 限制自動化訪問
  'canva.com',        // Canva 限制
  'figma.com',        // Figma bot detection
];

function isBotProtected(url) {
  try {
    const hostname = new URL(url).hostname;
    return BOT_PROTECTED_DOMAINS.some((domain) => hostname.endsWith(domain));
  } catch {
    return false;
  }
}

// ── helpers ──────────────────────────────────────────────────

function loadTools() {
  const raw = readFileSync(TOOLS_PATH, 'utf-8');
  return JSON.parse(raw);
}

async function tryFetch(url, method) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method,
      headers: BROWSER_HEADERS,
      signal: controller.signal,
      redirect: 'follow',
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function checkUrl(url) {
  const start = Date.now();
  try {
    // 先嘗試 HEAD（省流量）
    let res = await tryFetch(url, 'HEAD');

    // 某些網站（如 Claude.ai、部分 CDN）不支援 HEAD 或回傳 403/405，
    // fallback 到 GET 再確認一次避免誤判
    if (res.status === 403 || res.status === 405 || res.status === 400) {
      res = await tryFetch(url, 'GET');
    }

    const responseTime = Date.now() - start;
    const ok = res.status >= 200 && res.status < 400;

    // 反爬蟲網站若仍然 403，標示為 skipped 而非 error（避免誤報）
    if (!ok && res.status === 403 && isBotProtected(url)) {
      return { status: 'skipped', statusCode: res.status, responseTime, reason: 'bot-protected' };
    }

    return {
      status: ok ? 'ok' : 'error',
      statusCode: res.status,
      responseTime,
    };
  } catch (err) {
    const responseTime = Date.now() - start;
    if (err.name === 'AbortError') {
      return { status: 'timeout', statusCode: null, responseTime };
    }
    return { status: 'error', statusCode: null, responseTime, errorMessage: err.message };
  }
}

// ── main ─────────────────────────────────────────────────────

async function main() {
  const tools = loadTools();
  console.log(`Checking ${tools.length} tool URLs (timeout ${TIMEOUT_MS / 1000}s)...\n`);

  const results = [];

  for (const tool of tools) {
    const result = await checkUrl(tool.url);
    results.push({
      toolId: tool.id,
      title: tool.title,
      url: tool.url,
      ...result,
    });

    const icon =
      result.status === 'ok' ? 'OK' : result.status === 'skipped' ? 'SKIP' : 'FAIL';
    const extra = result.status === 'skipped' ? ' (反爬蟲網站，需人工確認)' : '';
    console.log(`  [${icon}] #${tool.id} ${tool.title} — ${result.statusCode ?? result.status} (${result.responseTime}ms)${extra}`);
  }

  // ── summary table ────────────────────────────────────────

  const okCount = results.filter((r) => r.status === 'ok').length;
  const skippedCount = results.filter((r) => r.status === 'skipped').length;
  const failCount = results.filter((r) => r.status !== 'ok' && r.status !== 'skipped').length;

  console.log('\n─── Summary ───');
  console.log(`  Total   : ${results.length}`);
  console.log(`  OK      : ${okCount}`);
  console.log(`  Skipped : ${skippedCount} (反爬蟲網站)`);
  console.log(`  Failed  : ${failCount}`);

  if (failCount === 0) {
    console.log('\nAll real links are healthy.');
    if (skippedCount > 0) {
      console.log(`(${skippedCount} 個反爬蟲網站已略過，請偶爾手動點擊確認)`);
    }
    process.exit(0);
  }

  // ── markdown report (stdout) ─────────────────────────────

  const failures = results.filter((r) => r.status !== 'ok' && r.status !== 'skipped');

  console.log('');
  console.log('## Dead / Unreachable Links');
  console.log('');
  console.log('| # | Tool | URL | Status | Response Time |');
  console.log('|---|------|-----|--------|---------------|');

  for (const f of failures) {
    const statusLabel =
      f.status === 'timeout'
        ? 'Timeout'
        : f.statusCode
          ? `HTTP ${f.statusCode}`
          : `Error: ${f.errorMessage ?? 'unknown'}`;
    console.log(`| ${f.toolId} | ${f.title} | ${f.url} | ${statusLabel} | ${f.responseTime}ms |`);
  }

  console.log('');
  console.log(`> Checked on ${new Date().toISOString()} — ${failCount} of ${results.length} links failed.`);

  process.exit(1);
}

main();
