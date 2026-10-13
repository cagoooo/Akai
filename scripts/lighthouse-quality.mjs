import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { appendRunnerSummary } from './lib/path-safety.mjs';

export const THRESHOLDS = { performance: 0, accessibility: 0.80, 'best-practices': 0.90, seo: 0.75 };

// 只有首頁依門檻把關。工具頁與文章頁（2026-10-13 新增）先觀察分數，累積幾次基準再決定門檻，避免一開始就紅燈。
// 沒有 url 欄位的舊格式報告視為首頁。
export const ENFORCED_PATHNAMES = new Set(['/', '/Akai/']);

const isEnforced = (url) => {
  if (!url) return true;
  try { return ENFORCED_PATHNAMES.has(new URL(url).pathname); } catch { return true; }
};
const pageLabel = (url) => {
  if (!url) return '首頁';
  try {
    const { pathname } = new URL(url);
    const rest = pathname.replace(/^\/Akai\/?/, '').replace(/^\//, '');
    if (!rest) return '首頁';
    if (rest.startsWith('tool/')) return `工具頁（/${rest.replace(/\/$/, '')}）`;
    if (rest.startsWith('blog/')) return `文章頁（/${rest.replace(/\/$/, '')}）`;
    return `/${rest}`;
  } catch { return url; }
};

const seconds = (ms) => `${(ms / 1000).toFixed(1)} 秒`;

/** 從 Lighthouse 完整報告取出核心指標與「最大內容元素」；任何欄位缺漏都只略過，不影響門檻判斷。 */
export function summarizeMetrics(lhr) {
  const audits = lhr?.audits ?? {};
  const value = (id) => (typeof audits[id]?.numericValue === 'number' ? audits[id].numericValue : undefined);
  const lcpTables = audits['largest-contentful-paint-element']?.details?.items ?? [];
  const tableRows = lcpTables.flatMap((table) => table?.items ?? []);
  const selector = tableRows.find((row) => row?.node?.selector)?.node?.selector;
  const renderDelay = tableRows.find((row) => row?.phase === 'Render Delay')?.timing;
  return {
    fcp: value('first-contentful-paint'),
    lcp: value('largest-contentful-paint'),
    tbt: value('total-blocking-time'),
    cls: value('cumulative-layout-shift'),
    lcpElement: typeof selector === 'string' ? selector.slice(0, 120) : undefined,
    lcpRenderDelay: typeof renderDelay === 'number' ? renderDelay : undefined,
  };
}

function metricsMarkdown(metrics) {
  const rows = [];
  if (metrics.fcp !== undefined) rows.push(`| 首次內容繪製 FCP | ${seconds(metrics.fcp)} | |`);
  if (metrics.lcp !== undefined) {
    const notes = [];
    if (metrics.lcpElement) notes.push(`最大內容元素：\`${metrics.lcpElement}\``);
    if (metrics.lcpRenderDelay !== undefined) notes.push(`渲染延遲 ${seconds(metrics.lcpRenderDelay)}`);
    rows.push(`| 最大內容繪製 LCP | ${seconds(metrics.lcp)} | ${notes.join('；')} |`);
  }
  if (metrics.tbt !== undefined) rows.push(`| 總封鎖時間 TBT | ${Math.round(metrics.tbt)} ms | |`);
  if (metrics.cls !== undefined) rows.push(`| 版面位移 CLS | ${Math.round(metrics.cls * 1000) / 1000} | |`);
  return rows.length ? ['', '| 核心指標 | 數值 | 說明 |', '|---|---|---|', ...rows] : [];
}

function defaultReadReport(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function evaluateManifest(results, { readReport = defaultReadReport } = {}) {
  if (!Array.isArray(results) || results.length === 0) throw new Error('缺少 Lighthouse 檢查報告');
  // 依網址分組；每個網址取 LHCI 標記的代表報告（中位數），舊版 manifest 則保留第一筆。
  const groups = new Map();
  for (const result of results) {
    const key = result.url ?? '';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(result);
  }
  const multiple = groups.size > 1;
  const failed = [];
  const sections = [];
  for (const [url, runs] of groups) {
    const chosen = runs.find((run) => run.isRepresentativeRun) || runs[0];
    const { summary } = chosen;
    const enforced = isEnforced(url);
    if (!summary) {
      if (enforced) throw new Error('Lighthouse 報告沒有分數');
      sections.push(`\n### ${pageLabel(url)}（觀察中）\n\n沒有取得分數。`);
      continue;
    }
    const rows = Object.entries(THRESHOLDS).map(([key, min]) => {
      const score = summary[key];
      const valid = typeof score === 'number' && Number.isFinite(score) && score >= 0 && score <= 1;
      if (!valid) {
        if (enforced) throw new Error(`Lighthouse ${key} 分數缺漏或無效`);
        return `| ${key} | — | 觀察中 | — |`;
      }
      const pass = min === 0 || score >= min;
      if (enforced && !pass) failed.push(`${multiple ? `${pageLabel(url)} ` : ''}${key}: ${Math.round(score * 100)} < ${Math.round(min * 100)}`);
      const gate = !enforced || min === 0 ? '維持觀察' : Math.round(min * 100);
      const status = !enforced || min === 0 ? '—' : pass ? '✅' : '❌';
      return `| ${key} | ${Math.round(score * 100)} | ${gate} | ${status} |`;
    });
    let metrics = [];
    if (chosen.jsonPath) {
      try { metrics = metricsMarkdown(summarizeMetrics(readReport(chosen.jsonPath))); } catch { /* 指標只是附註，讀不到不影響結果 */ }
    }
    sections.push([
      ...(multiple ? ['', `### ${pageLabel(url)}${enforced ? '' : '（觀察中，不把關）'}`] : []),
      '', '| 指標 | 分數 | 門檻 | 狀態 |', '|---|---|---|---|', ...rows, ...metrics,
    ].join('\n'));
  }
  const note = multiple
    ? `每個網址跑多次後取代表報告（中位數）。只有首頁依門檻把關；其他頁面與效能分數、budget.json 預算維持觀察，並完整保留報告。`
    : '效能分數與 budget.json 預算維持原本的觀察設定，並完整保留報告。';
  return { failed, markdown: ['## Lighthouse 品質報告', ...sections, '', note].join('\n') };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = evaluateManifest(JSON.parse(readFileSync('.lighthouseci/manifest.json', 'utf8')));
    console.log(result.markdown);
    appendRunnerSummary(`\n${result.markdown}\n`);
    if (result.failed.length) throw new Error(`Lighthouse 未達標：${result.failed.join('; ')}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
