/**
 * gen-posts-index.ts —— 從 posts.ts 產生「只有中繼資料、沒有正文」的索引檔。
 *
 * 為什麼需要這支（2026-09-06）：
 *   client/src/blog/posts.ts 已經長到 679 KB（126 篇手寫長文的完整 markdown）。
 *   它被 blogLinks.ts 同步 import，而 blogLinks 被每一張工具卡用來判斷
 *   「要不要顯示閱讀文章按鈕」—— 結果全站首頁一載入就把所有長文正文拉進主 bundle，
 *   實測主 chunk 1393 KB 裡有 414 KB（38%）是長文中文字。
 *   但卡片真正需要的只有 slug 與 toolIds。
 *
 *   posts.ts 檔頭當初寫的理由是「檔案 < 50KB，隨主 bundle 一起載即可」——
 *   那個假設在 126 篇之後已經過期 13.5 倍。
 *
 * 作法：
 *   posts.ts 維持不動（generate-feed / generate-sitemap / generate-og-pages
 *   都用 regex 解析它的原始碼，改檔會一起壞掉），改成額外產生 postsIndex.ts。
 *   執行期的同步使用者改讀索引，正文只在真的開啟 /blog/<slug> 時動態載入。
 *
 * 2026-09-23 追加：每篇正文另外產生 client/src/blog/bodies/<slug>.ts。
 *   原本開任一篇 /blog/<slug> 都要載入含全部正文的 posts chunk（gzip 後 ~267KB），
 *   手機 4G 實測文章頁 8.8 秒才出現。改由 postLoader.ts 以 import.meta.glob
 *   只載入該篇正文（每篇各自一個小 chunk）。
 *
 * 用法：
 *   npx tsx scripts/gen-posts-index.ts           # 產生 / 更新索引與各篇正文
 *   npx tsx scripts/gen-posts-index.ts --check   # 只檢查是否同步（不寫檔），不同步則 exit 1
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, unlinkSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { POSTS } from '../client/src/blog/posts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'client', 'src', 'blog', 'postsIndex.ts');
const BODIES_DIR = resolve(ROOT, 'client', 'src', 'blog', 'bodies');
const CHECK_ONLY = process.argv.includes('--check');

const entries = POSTS.map(({ body: _body, ...meta }) => meta);

const header = `/**
 * postsIndex.ts —— 自動產生，請勿手改。
 *
 * 來源：client/src/blog/posts.ts（唯一真相來源）
 * 產生：npx tsx scripts/gen-posts-index.ts
 * 校驗：prebuild 會跑 --check，posts.ts 改了卻沒重產索引就讓 build 失敗。
 *
 * 這裡只有中繼資料、沒有 body。首頁與工具卡只需要 slug / toolIds，
 * 讓長文正文不必進主 bundle（見 gen-posts-index.ts 檔頭說明）。
 */
import type { BlogPost } from './posts';

/** 手寫長文的中繼資料（BlogPost 去掉 body） */
export type BlogPostMeta = Omit<BlogPost, 'body'>;

export const POSTS_INDEX: BlogPostMeta[] = `;

const footer = `;

/**
 * 已有「手寫長文」覆蓋的工具 ID 集合（從索引的 toolIds 自動推導）。
 * 用途：mini blog 生成器 / sitemap / OG landing 跳過這些 ID，避免同一個 #N
 * 同時出現「30 秒看完」短文與手寫長文。
 */
export const HANDWRITTEN_TOOL_IDS: ReadonlySet<number> = new Set(
  POSTS_INDEX.flatMap((p) => p.toolIds),
);
`;

const next = header + JSON.stringify(entries, null, 2) + footer;

// 每篇正文一個模組，檔名即 slug
const bodyFiles = new Map(
  POSTS.map((p) => [
    `${p.slug}.ts`,
    '// 自動產生，請勿手改。來源：client/src/blog/posts.ts（npx tsx scripts/gen-posts-index.ts）\n' +
      `export default ${JSON.stringify(p.body)};\n`,
  ]),
);
const staleBodyFiles = (existsSync(BODIES_DIR) ? readdirSync(BODIES_DIR) : []).filter(
  (f) => f.endsWith('.ts') && !bodyFiles.has(f),
);

if (CHECK_ONLY) {
  let current = '';
  try {
    current = readFileSync(OUT, 'utf8');
  } catch {
    console.error('\n✗ 找不到 client/src/blog/postsIndex.ts');
    console.error('    修法：npx tsx scripts/gen-posts-index.ts\n');
    process.exit(1);
  }
  const outOfSyncBodies = [...bodyFiles]
    .filter(([file, content]) => {
      const path = resolve(BODIES_DIR, file);
      return !existsSync(path) || readFileSync(path, 'utf8') !== content;
    })
    .map(([file]) => file);
  if (current !== next || outOfSyncBodies.length > 0 || staleBodyFiles.length > 0) {
    console.error('\n✗ postsIndex.ts / blog/bodies 與 posts.ts 不同步');
    console.error(`    posts.ts 目前有 ${POSTS.length} 篇`);
    if (outOfSyncBodies.length) console.error(`    正文不同步：${outOfSyncBodies.slice(0, 5).join(', ')}`);
    if (staleBodyFiles.length) console.error(`    多餘的正文檔：${staleBodyFiles.slice(0, 5).join(', ')}`);
    console.error('    修法：npx tsx scripts/gen-posts-index.ts\n');
    process.exit(1);
  }
  console.log(`✓ postsIndex.ts 與 blog/bodies 已與 posts.ts 同步（${POSTS.length} 篇）`);
  process.exit(0);
}

writeFileSync(OUT, next, 'utf8');
mkdirSync(BODIES_DIR, { recursive: true });
for (const [file, content] of bodyFiles) {
  const path = resolve(BODIES_DIR, file);
  if (!existsSync(path) || readFileSync(path, 'utf8') !== content) writeFileSync(path, content, 'utf8');
}
for (const file of staleBodyFiles) unlinkSync(resolve(BODIES_DIR, file));
console.log(
  `✅ blog/bodies 已產生 ${bodyFiles.size} 篇正文` +
    (staleBodyFiles.length ? `，移除 ${staleBodyFiles.length} 個過期檔` : ''),
);
const kb = (n: number) => `${(n / 1024).toFixed(0)} KB`;
console.log(
  `✅ postsIndex.ts 已產生：${POSTS.length} 篇中繼資料 ${kb(next.length)}` +
    `（posts.ts 原始 ${kb(readFileSync(resolve(ROOT, 'client', 'src', 'blog', 'posts.ts'), 'utf8').length)}）`,
);
