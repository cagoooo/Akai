import test from 'node:test';
import assert from 'node:assert/strict';
import { matchesDeployment } from './wait-for-deployed-version.mjs';
import { evaluateManifest, summarizeMetrics } from './lighthouse-quality.mjs';

test('只接受符合完整部署 SHA 的有效短 SHA，不接受舊版或未知版本', () => {
  const sha = 'ea521ee8fab59dd0a6734ed9c779cd2ec4948f8b';
  assert.equal(matchesDeployment({ gitHash: 'ea521ee8' }, sha), true);
  for (const gitHash of ['5f52660a', 'nogit', '', 'e', undefined]) assert.equal(matchesDeployment({ gitHash }, sha), false);
});
test('品質門檻不降低，缺漏分數不能視為通過', () => {
  const summary = { performance: 0.3, accessibility: 0.89, 'best-practices': 0.75, seo: 0.92 };
  assert.deepEqual(evaluateManifest([{ summary }]).failed, ['best-practices: 75 < 90']);
  assert.throws(() => evaluateManifest([]));
  assert.throws(() => evaluateManifest([{ summary: { ...summary, seo: undefined } }]));
});
test('使用代表報告，正常分數通過；無效數字不通過', () => {
  const summary = { performance: 0.3, accessibility: 0.89, 'best-practices': 1, seo: 0.92 };
  assert.equal(evaluateManifest([{ summary: {} }, { summary, isRepresentativeRun: true }]).failed.length, 0);
  for (const seo of [NaN, Infinity, -1, 2, '0.92']) assert.throws(() => evaluateManifest([{ summary: { ...summary, seo } }]));
});

const HOME = 'https://cagoooo.github.io/Akai/';
const TOOL = 'https://cagoooo.github.io/Akai/tool/81/';
const ARTICLE = 'https://cagoooo.github.io/Akai/blog/cockpit-81-info-tech-class';
const good = { performance: 0.6, accessibility: 0.89, 'best-practices': 1, seo: 0.92 };
const poor = { performance: 0.2, accessibility: 0.5, 'best-practices': 0.6, seo: 0.4 };

test('多個網址：只有首頁依門檻把關，工具頁與文章頁分數再低也只觀察', () => {
  const observedOnly = evaluateManifest([
    { url: HOME, summary: good, isRepresentativeRun: true },
    { url: TOOL, summary: poor, isRepresentativeRun: true },
    { url: ARTICLE, summary: poor, isRepresentativeRun: true },
  ]);
  assert.deepEqual(observedOnly.failed, []);
  assert.match(observedOnly.markdown, /工具頁（\/tool\/81）（觀察中，不把關）/);
  assert.match(observedOnly.markdown, /文章頁（\/blog\/cockpit-81-info-tech-class）/);

  const homeFails = evaluateManifest([
    { url: HOME, summary: { ...good, accessibility: 0.7 }, isRepresentativeRun: true },
    { url: TOOL, summary: good, isRepresentativeRun: true },
  ]);
  assert.deepEqual(homeFails.failed, ['首頁 accessibility: 70 < 80']);
});

test('每個網址各自取代表報告（中位數），不會拿別頁的分數當首頁', () => {
  const result = evaluateManifest([
    { url: HOME, summary: poor },
    { url: HOME, summary: good, isRepresentativeRun: true },
    { url: HOME, summary: poor },
    { url: TOOL, summary: poor, isRepresentativeRun: true },
  ]);
  assert.deepEqual(result.failed, []);
});

test('觀察中的頁面分數無效不會中斷；首頁分數無效仍然視為失敗', () => {
  assert.doesNotThrow(() => evaluateManifest([
    { url: HOME, summary: good, isRepresentativeRun: true },
    { url: TOOL, summary: { ...good, seo: undefined }, isRepresentativeRun: true },
    { url: ARTICLE, isRepresentativeRun: true },
  ]));
  assert.throws(() => evaluateManifest([
    { url: HOME, summary: { ...good, seo: undefined }, isRepresentativeRun: true },
    { url: TOOL, summary: good, isRepresentativeRun: true },
  ]));
});

test('核心指標與最大內容元素寫進報告；讀不到完整報告時只略過指標', () => {
  const lhr = { audits: {
    'first-contentful-paint': { numericValue: 2100 },
    'largest-contentful-paint': { numericValue: 7744 },
    'total-blocking-time': { numericValue: 440 },
    'cumulative-layout-shift': { numericValue: 0 },
    'largest-contentful-paint-element': { details: { items: [
      { type: 'table', items: [{ node: { selector: 'div.audience-wizard > p' } }] },
      { type: 'table', items: [{ phase: 'TTFB', timing: 694 }, { phase: 'Render Delay', timing: 7100 }] },
    ] } },
  } };
  assert.deepEqual(summarizeMetrics(lhr), {
    fcp: 2100, lcp: 7744, tbt: 440, cls: 0, lcpElement: 'div.audience-wizard > p', lcpRenderDelay: 7100,
  });
  assert.deepEqual(summarizeMetrics({}), {
    fcp: undefined, lcp: undefined, tbt: undefined, cls: undefined, lcpElement: undefined, lcpRenderDelay: undefined,
  });

  const withReport = evaluateManifest([{ summary: good, jsonPath: 'lhr.json' }], { readReport: () => lhr });
  assert.match(withReport.markdown, /最大內容元素：`div\.audience-wizard > p`；渲染延遲 7\.1 秒/);
  assert.match(withReport.markdown, /最大內容繪製 LCP \| 7\.7 秒/);

  const unreadable = evaluateManifest([{ summary: good, jsonPath: 'missing.json' }], {
    readReport: () => { throw new Error('ENOENT'); },
  });
  assert.deepEqual(unreadable.failed, []);
  assert.doesNotMatch(unreadable.markdown, /LCP/);
});
