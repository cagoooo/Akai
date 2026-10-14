// 診斷用：把 Lighthouse 收集到的原始 trace 濃縮成幾行重點，不必下載幾十 MB 才能看。
// 用在「首頁偶爾拿不到最大內容（NO_LCP）」這類只在 CI 重現的問題：
// 看有幾次導覽（頁面是否被重整）、最大內容候選與「失效」事件的先後、截圖有沒有收到。
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { containedRealPath } from './lib/path-safety.mjs';

/** 只讀診斷流程放在 diagnose/ 的 Lighthouse 產物：命令列路徑先正規化，再確認實際位置沒有跑出這個資料夾。 */
export function readDiagnoseJson(value, root = resolve('diagnose')) {
  const target = containedRealPath(resolve(root), resolve(value));
  return JSON.parse(readFileSync(target, 'utf8'));
}

const toMs = (event, origin) => Math.round((event.ts - origin) / 1000);

export function summarizeTrace(events) {
  const list = Array.isArray(events) ? events : events?.traceEvents ?? [];
  const allNavigations = list.filter((e) => e.name === 'navigationStart' && e.args?.data?.isLoadingMainFrame);
  // 沒有網址的 navigationStart 是同一份文件內的導覽（網址列改寫等），正常載入也會有；有網址的才是真的載入了一份文件
  const navigations = allNavigations.filter((e) => e.args?.data?.documentLoaderURL);
  const origin = allNavigations[0]?.ts ?? list.find((e) => typeof e.ts === 'number')?.ts ?? 0;
  const lcpEvents = list
    .filter((e) => e.name === 'largestContentfulPaint::Candidate' || e.name === 'largestContentfulPaint::Invalidate')
    .sort((a, b) => a.ts - b.ts)
    .map((e) => ({
      atMs: toMs(e, origin),
      kind: e.name.endsWith('Invalidate') ? 'Invalidate' : 'Candidate',
      node: String(e.args?.data?.nodeName ?? '').slice(0, 60),
      size: e.args?.data?.size,
      navigationId: String(e.args?.data?.navigationId ?? e.args?.frame ?? '').slice(0, 8),
    }));
  const last = lcpEvents.at(-1);
  const screenshots = list.filter((e) => e.name === 'Screenshot');
  return {
    navigationCount: navigations.length,
    sameDocumentNavigationCount: allNavigations.length - navigations.length,
    navigations: navigations.map((e) => ({ atMs: toMs(e, origin), url: String(e.args?.data?.documentLoaderURL ?? '').slice(0, 80) })),
    lcpEvents,
    lcpInvalidatedAtEnd: last?.kind === 'Invalidate',
    noLcpEvents: lcpEvents.length === 0,
    screenshotCount: screenshots.length,
    lastScreenshotAtMs: screenshots.length ? toMs(screenshots.at(-1), origin) : undefined,
  };
}

export function summaryMarkdown(label, summary, lcpError) {
  const lines = [
    `#### ${label}`,
    `- Lighthouse 最大內容錯誤碼：${lcpError ?? '無（有取得）'}`,
    `- 文件載入次數 ${summary.navigationCount}（超過 1 表示頁面被重整或轉址；另有 ${summary.sameDocumentNavigationCount} 次同文件內導覽，屬正常）：${summary.navigations.map((n) => `${n.atMs}ms ${n.url}`).join('；') || '—'}`,
    `- 截圖 ${summary.screenshotCount} 張${summary.lastScreenshotAtMs === undefined ? '' : `，最後一張在 ${summary.lastScreenshotAtMs}ms`}`,
    `- 最大內容事件 ${summary.lcpEvents.length} 筆${summary.lcpInvalidatedAtEnd ? '，**最後一筆是「失效」**' : ''}${summary.noLcpEvents ? '，**一筆都沒有**' : ''}`,
    ...summary.lcpEvents.map((e) => `  - ${e.atMs}ms ${e.kind} ${e.node}${e.size ? ` 面積 ${e.size}` : ''} 導覽 ${e.navigationId}`),
  ];
  return lines.join('\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [tracePath, lhrPath, label = tracePath] = process.argv.slice(2);
  const trace = readDiagnoseJson(tracePath);
  let lcpError;
  if (lhrPath) {
    try { lcpError = readDiagnoseJson(lhrPath).audits?.['largest-contentful-paint']?.errorMessage; } catch { /* 沒有報告就略過 */ }
  }
  console.log(summaryMarkdown(label, summarizeTrace(trace), lcpError));
}
