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

const BASE = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

export function resolveInternalLink(href?: string): string {
  if (!href) return '#';
  // 外部 / mailto / tel / hash 不動
  if (/^(https?:|mailto:|tel:|#|\/\/)/.test(href)) return href;
  // 已經帶 basePath 不動（避免重複加 prefix）
  if (BASE && href.startsWith(BASE + '/')) return href;
  // 站內相對路徑（從 / 開始）→ 補 basePath
  if (href.startsWith('/')) return BASE + href;
  // 相對路徑（不從 / 開始）→ 保持原樣
  return href;
}
