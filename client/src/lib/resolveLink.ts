/**
 * resolveLink — 處理 markdown 內部連結缺 basePath 的 bug
 *
 * 痛點（v3.6.67 修）:
 *   tools.json detailedDescription / blog posts 內寫 `[#45 文字雲](/tool/45)` markdown,
 *   react-markdown render 出 `<a href="/tool/45">`。
 *   瀏覽器看到 `/tool/45`（absolute path from origin）會 resolve 到 `cagoooo.github.io/tool/45`,
 *   而不是 `cagoooo.github.io/Akai/tool/45`。**全站 91 處連結都炸**。
 *
 * 修法:在 ReactMarkdown components.a 攔截 href,自動帶上 import.meta.env.BASE_URL,
 *      dev (`/`) 跟 prod (`/Akai/`) 都正確。
 *
 * 用法:
 *   <ReactMarkdown components={{ a: ({ href, children, ...rest }) =>
 *     <a href={resolveInternalLink(href)} {...rest}>{children}</a>
 *   }} />
 */

import { TOOL_URL_MAP } from './toolUrlMap';

const BASE = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

function normalizeUrl(url: string): string {
  return url
    .replace(/^https?:\/\//i, '')
    .replace(/\/$/, '')
    .trim()
    .toLowerCase();
}

// 預先建立標準化比對字典
const NORMALIZED_MAP: Record<string, number> = {};
for (const [rawUrl, id] of Object.entries(TOOL_URL_MAP)) {
  NORMALIZED_MAP[normalizeUrl(rawUrl)] = id;
}

/**
 * 將外部工具連結改寫為內部相對路徑，例如：https://cagoooo.github.io/bee/ -> /tool/6
 */
export function convertExternalToolLink(href?: string): string {
  if (!href) return '';
  const normalized = normalizeUrl(href);

  for (const [key, id] of Object.entries(NORMALIZED_MAP)) {
    // 精確匹配或是包含子路徑 (例如: key/game.html)
    if (normalized === key || normalized.startsWith(key + '/')) {
      return `/tool/${id}`;
    }
  }
  return href;
}

export function resolveInternalLink(href?: string): string {
  if (!href) return '#';

  // 1. 先把自家工具外部連結轉成內部連結，例如：https://cagoooo.github.io/bee/ -> /tool/6
  let resolvedHref = href;
  if (/^(https?:|\/\/)/.test(resolvedHref)) {
    resolvedHref = convertExternalToolLink(resolvedHref);
  }

  // 2. 接著跑原本的 internal link 解析
  // 外部 / mailto / tel / hash 不動
  if (/^(https?:|mailto:|tel:|#|\/\/)/.test(resolvedHref)) return resolvedHref;
  // 已經帶 basePath 不動（避免重複加 prefix）
  if (BASE && resolvedHref.startsWith(BASE + '/')) return resolvedHref;
  // 站內相對路徑（從 / 開始）→ 補 basePath
  if (resolvedHref.startsWith('/')) return BASE + resolvedHref;
  // 相對路徑（不從 / 開始）→ 保持原樣
  return resolvedHref;
}
