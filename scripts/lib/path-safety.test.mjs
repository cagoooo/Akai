import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, parse } from 'node:path';
import { after, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { appendRunnerSummary, containedRealPath, selectedDirectoryRoot, selectedFontPath } from './path-safety.mjs';

const fixture = mkdtempSync(join(tmpdir(), 'akai-path-safety-'));
after(() => {
  assert.equal(containedRealPath(tmpdir(), fixture), fixture);
  assert.ok(basename(fixture).startsWith('akai-path-safety-'));
  rmSync(fixture, { recursive: true, force: true });
});
const root = join(fixture, 'project');
const sibling = join(fixture, 'project-other');
mkdirSync(root);
mkdirSync(sibling);
writeFileSync(join(root, 'index.html'), '原有內容');
writeFileSync(join(sibling, 'private.txt'), '不得讀寫');

test('實際路徑限制拒絕兄弟前綴、dot-dot與跳到目錄外的連結', () => {
  assert.equal(containedRealPath(root, join(root, 'index.html')), join(root, 'index.html'));
  assert.throws(() => containedRealPath(root, join(root, '..', 'project-other', 'private.txt')));
  const link = join(root, 'link');
  symlinkSync(sibling, link, process.platform === 'win32' ? 'junction' : 'dir');
  assert.throws(() => containedRealPath(root, join(link, 'private.txt')));
  assert.equal(readFileSync(join(sibling, 'private.txt'), 'utf8'), '不得讀寫');
});

test('允許指定專案資料夾但拒絕磁碟根目錄', () => {
  assert.equal(selectedDirectoryRoot(root), root);
  assert.throws(() => selectedDirectoryRoot(parse(root).root));
});

test('Runner合法摘要檔可在repo外寫入，不允許任意環境變數目的地', () => {
  const runner = join(fixture, 'runner');
  const commands = join(runner, '_runner_file_commands');
  mkdirSync(commands, { recursive: true });
  const target = join(commands, 'step_summary_abc-123');
  writeFileSync(target, 'existing');
  const env = { GITHUB_ACTIONS: 'true', RUNNER_TEMP: runner, GITHUB_STEP_SUMMARY: target };
  appendRunnerSummary('\n合法摘要', env);
  assert.equal(readFileSync(target, 'utf8'), 'existing\n合法摘要');
  assert.throws(() => appendRunnerSummary('不准寫', { ...env, GITHUB_STEP_SUMMARY: join(sibling, 'private.txt') }));
  assert.throws(() => appendRunnerSummary('不准寫', { ...env, GITHUB_ACTIONS: 'false' }));
  assert.throws(() => appendRunnerSummary('不准寫', { ...env, GITHUB_STEP_SUMMARY: join(commands, 'step_summary_missing') }));
});

test('Runner命令目錄導向暫存目錄外也不允許', () => {
  const runner = join(fixture, 'runner-linked');
  mkdirSync(runner);
  const commands = join(runner, '_runner_file_commands');
  symlinkSync(sibling, commands, process.platform === 'win32' ? 'junction' : 'dir');
  writeFileSync(join(sibling, 'step_summary_outside'), '保留');
  assert.throws(() => appendRunnerSummary('不准寫', {
    GITHUB_ACTIONS: 'true', RUNNER_TEMP: runner, GITHUB_STEP_SUMMARY: join(commands, 'step_summary_outside'),
  }));
  assert.equal(readFileSync(join(sibling, 'step_summary_outside'), 'utf8'), '保留');
});

test('字型來源限制一般檔案、大小、附檔名與二進位標頭', () => {
  const font = join(root, 'valid.ttf');
  writeFileSync(font, Buffer.from('000100000000000000000000', 'hex'));
  assert.equal(selectedFontPath(font), font);
  const fake = join(root, 'private.ttf');
  writeFileSync(fake, '這是秘密文字，不是字型');
  assert.throws(() => selectedFontPath(fake));
  assert.throws(() => selectedFontPath(join(root, 'index.html')));
  assert.throws(() => selectedFontPath(root));
});

test('實際注入腳本只改隔離根目錄內的合法stage，不插入不安全目錄名稱', () => {
  const cockpit = join(fixture, 'cockpit');
  mkdirSync(cockpit);
  const initial = '<html><head></head><body>保留原內容</body></html>';
  for (const stage of ['safe-stage_1', "evil'stage"]) {
    mkdirSync(join(cockpit, stage));
    writeFileSync(join(cockpit, stage, 'index.html'), initial);
  }
  const script = fileURLToPath(new URL('../inject-cockpit-stage-beacons.mjs', import.meta.url));
  const result = spawnSync(process.execPath, [script], {
    env: { ...process.env, COCKPIT_DIR: cockpit }, encoding: 'utf8', timeout: 10000,
  });
  assert.equal(result.status, 0, result.stderr);
  const valid = readFileSync(join(cockpit, 'safe-stage_1', 'index.html'), 'utf8');
  assert.match(valid, /var STAGE_ID = 'safe-stage_1';/);
  assert.match(valid, /保留原內容/);
  assert.equal(readFileSync(join(cockpit, "evil'stage", 'index.html'), 'utf8'), initial);
});
