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

// ── helpers ──────────────────────────────────────────────────

function loadTools() {
  const raw = readFileSync(TOOLS_PATH, 'utf-8');
  return JSON.parse(raw);
}

async function checkUrl(url) {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timer);

    const responseTime = Date.now() - start;
    const ok = res.status >= 200 && res.status < 400;
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

    const icon = result.status === 'ok' ? 'OK' : 'FAIL';
    console.log(`  [${icon}] #${tool.id} ${tool.title} — ${result.statusCode ?? result.status} (${result.responseTime}ms)`);
  }

  // ── summary table ────────────────────────────────────────

  const okCount = results.filter((r) => r.status === 'ok').length;
  const failCount = results.filter((r) => r.status !== 'ok').length;

  console.log('\n─── Summary ───');
  console.log(`  Total : ${results.length}`);
  console.log(`  OK    : ${okCount}`);
  console.log(`  Failed: ${failCount}`);

  if (failCount === 0) {
    console.log('\nAll links are healthy.');
    process.exit(0);
  }

  // ── markdown report (stdout) ─────────────────────────────

  const failures = results.filter((r) => r.status !== 'ok');

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
