import test from 'node:test';
import assert from 'node:assert/strict';
import { matchesDeployment } from './wait-for-deployed-version.mjs';
import { evaluateManifest } from './lighthouse-quality.mjs';

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
