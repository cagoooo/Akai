import { appendFileSync, existsSync, lstatSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { basename, dirname, extname, isAbsolute, parse, relative, resolve, sep } from 'node:path';

/** 使用實際路徑而不是字串前綴，拒絕兄弟目錄與指向目錄外的連結。 */
export function containedRealPath(root, candidate) {
  const actualRoot = realpathSync(root);
  const actualPath = realpathSync(candidate);
  const difference = relative(actualRoot, actualPath);
  if (difference === '..' || difference.startsWith(`..${sep}`) || isAbsolute(difference)) {
    throw new Error('檔案實際位置超出指定目錄');
  }
  return actualPath;
}

export function selectedDirectoryRoot(value) {
  const root = realpathSync(resolve(value));
  if (!statSync(root).isDirectory() || root === parse(root).root) {
    throw new Error('必須指定非磁碟根目錄的專案資料夾');
  }
  return root;
}

/** 摘要檔是 GitHub Runner 建立的命令檔；合法位置在 RUNNER_TEMP，而非 repo。 */
export function appendRunnerSummary(markdown, env = process.env) {
  if (!env.GITHUB_STEP_SUMMARY) return;
  if (env.GITHUB_ACTIONS !== 'true' || !env.RUNNER_TEMP) throw new Error('摘要寫入缺少可信 Runner 設定');
  // 環境變數路徑一律先正規化成絕對路徑，再交給實際路徑比對。
  const runnerTemp = resolve(env.RUNNER_TEMP);
  const commandsRoot = resolve(runnerTemp, '_runner_file_commands');
  const target = resolve(env.GITHUB_STEP_SUMMARY);
  if (dirname(target) !== commandsRoot || !/^step_summary_[a-zA-Z0-9-]+$/.test(basename(target))
    || !existsSync(target) || !lstatSync(target).isFile()) {
    throw new Error('摘要檔不是 Runner 建立的既有命令檔');
  }
  // 同時拒絕命令目錄本身被導向 Runner 暫存目錄外。
  containedRealPath(runnerTemp, commandsRoot);
  const actualTarget = containedRealPath(commandsRoot, target);
  appendFileSync(actualTarget, markdown, 'utf8');
}

/** FONT_SRC 是維護者明確選擇的檔案；驗證格式，避免把任意秘密檔當字型讀入。 */
export function selectedFontPath(value) {
  const target = realpathSync(resolve(value));
  const stat = statSync(target);
  if (!/\.(?:ttf|otf)$/i.test(extname(target)) || !stat.isFile() || stat.size < 12 || stat.size > 64 * 1024 * 1024) {
    throw new Error('來源必須是有效大小的 TTF 或 OTF 字型檔');
  }
  const signature = readFileSync(target).subarray(0, 4).toString('hex');
  if (!['00010000', '4f54544f', '74727565'].includes(signature)) throw new Error('來源檔不是支援的字型格式');
  return target;
}
