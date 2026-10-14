import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { readDiagnoseJson, summarizeTrace, summaryMarkdown } from './lighthouse-trace-summary.mjs';

const fixture = mkdtempSync(join(tmpdir(), 'akai-trace-summary-'));
after(() => {
  assert.ok(basename(fixture).startsWith('akai-trace-summary-'));
  rmSync(fixture, { recursive: true, force: true });
});
const diagnose = join(fixture, 'diagnose');
mkdirSync(diagnose);
writeFileSync(join(diagnose, 'run1.json'), '{"ok":true}');
writeFileSync(join(fixture, 'outside.json'), '{"ok":false}');

test('只讀 diagnose 資料夾內的檔案，跑出資料夾的路徑一律拒絕', () => {
  assert.deepEqual(readDiagnoseJson(join(diagnose, 'run1.json'), diagnose), { ok: true });
  assert.throws(() => readDiagnoseJson(join(fixture, 'outside.json'), diagnose));
  assert.throws(() => readDiagnoseJson(join(diagnose, '..', 'outside.json'), diagnose));
});

const nav = (ts, url = '') => ({ name: 'navigationStart', ts, args: { data: { isLoadingMainFrame: true, documentLoaderURL: url } } });
const lcp = (ts, kind, data = {}) => ({ name: `largestContentfulPaint::${kind}`, ts, args: { data } });

test('正常載入：一次導覽、有候選、沒有失效', () => {
  const s = summarizeTrace([nav(1_000_000, 'https://x/'), lcp(1_800_000, 'Candidate', { nodeName: 'P', size: 100 }), { name: 'Screenshot', ts: 1_500_000 }]);
  assert.equal(s.navigationCount, 1);
  assert.equal(s.lcpEvents[0].atMs, 800);
  assert.equal(s.lcpInvalidatedAtEnd, false);
  assert.equal(s.noLcpEvents, false);
  assert.equal(s.screenshotCount, 1);
});

test('最後一筆是失效事件：標示出來，這是 NO_LCP 的典型徵兆', () => {
  const s = summarizeTrace([nav(0, 'https://x/'), lcp(500_000, 'Candidate', { nodeName: 'P', size: 10 }), lcp(900_000, 'Invalidate')]);
  assert.equal(s.lcpInvalidatedAtEnd, true);
  assert.match(summaryMarkdown('第 1 次', s, 'NO_LCP'), /最後一筆是「失效」/);
});

test('頁面被重整：導覽次數大於 1；一筆候選都沒有也看得出來', () => {
  const s = summarizeTrace({ traceEvents: [nav(0, 'https://x/'), nav(29_000_000, 'https://x/')] });
  assert.equal(s.navigationCount, 2);
  assert.equal(s.noLcpEvents, true);
  assert.match(summaryMarkdown('第 2 次', s), /一筆都沒有/);
});

test('沒有網址的導覽（同文件內）不算頁面重整', () => {
  const s = summarizeTrace([nav(0, 'https://x/'), nav(3_000_000, ''), nav(12_000_000, '')]);
  assert.equal(s.navigationCount, 1);
  assert.equal(s.sameDocumentNavigationCount, 2);
});

test('空的 trace 不會丟例外', () => {
  assert.doesNotThrow(() => summarizeTrace([]));
  assert.doesNotThrow(() => summarizeTrace(undefined));
});
