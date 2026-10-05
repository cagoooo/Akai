import { appendFileSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export const THRESHOLDS = { performance: 0, accessibility: 0.80, 'best-practices': 0.90, seo: 0.75 };

export function evaluateManifest(results) {
  if (!Array.isArray(results) || results.length === 0) throw new Error('缺少 Lighthouse 檢查報告');
  // LHCI 標記的代表報告（中位數）優先；舊版 manifest 則保留第一筆。
  const summary = (results.find(result => result.isRepresentativeRun) || results[0]).summary;
  if (!summary) throw new Error('Lighthouse 報告沒有分數');
  const failed = [];
  const rows = Object.entries(THRESHOLDS).map(([key, min]) => {
    const score = summary[key];
    if (typeof score !== 'number' || !Number.isFinite(score) || score < 0 || score > 1) {
      throw new Error(`Lighthouse ${key} 分數缺漏或無效`);
    }
    const pass = min === 0 || score >= min;
    if (!pass) failed.push(`${key}: ${Math.round(score * 100)} < ${Math.round(min * 100)}`);
    return `| ${key} | ${Math.round(score * 100)} | ${min === 0 ? '維持觀察' : Math.round(min * 100)} | ${min === 0 ? '—' : pass ? '✅' : '❌'} |`;
  });
  return { failed, markdown: ['## Lighthouse 品質報告', '', '| 指標 | 分數 | 門檻 | 狀態 |', '|---|---|---|---|', ...rows,
    '', '效能分數與 budget.json 預算維持原本的觀察設定，並完整保留報告。'].join('\n') };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = evaluateManifest(JSON.parse(readFileSync('.lighthouseci/manifest.json', 'utf8')));
    console.log(result.markdown);
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `\n${result.markdown}\n`);
    if (result.failed.length) throw new Error(`Lighthouse 未達標：${result.failed.join('; ')}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
