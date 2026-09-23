/**
 * postLoader —— /blog/:slug 用的文章載入器
 *
 * 手寫長文：中繼資料讀 postsIndex（同步），正文用 import.meta.glob 只載入該篇
 * （blog/bodies/<slug>.ts 由 scripts/gen-posts-index.ts 從 posts.ts 產生）。
 * 以前直接 import posts.ts，開任一篇都要下載全部正文（gzip 後 ~267KB）。
 *
 * 迷你 blog：不是手寫長文時，從 tools.json 即時生成（slug 形如 tool-{id}）。
 */
import type { BlogPost } from './posts';
import { POSTS_INDEX } from './postsIndex';

const bodyLoaders = import.meta.glob<string>('./bodies/*.ts', { import: 'default' });

export function getPostMeta(slug: string) {
  return POSTS_INDEX.find((p) => p.slug === slug);
}

export async function loadPost(slug: string): Promise<BlogPost | undefined> {
  const meta = getPostMeta(slug);
  if (meta) {
    const load = bodyLoaders[`./bodies/${slug}.ts`];
    if (!load) return undefined;
    return { ...meta, body: await load() };
  }
  return loadMiniPost(slug);
}

async function loadMiniPost(slug: string): Promise<BlogPost | undefined> {
  // 純 ASCII slug 為 tool-{id} 簡潔模式；為兼容舊版含中文 slug，也接受 tool-{id}-... 的舊格式
  const match = slug.match(/^tool-(\d+)(?:-|$)/);
  if (!match) return undefined;
  const id = parseInt(match[1], 10);
  try {
    const base = import.meta.env.BASE_URL || '/';
    const version = import.meta.env.VITE_APP_VERSION || Date.now();
    const res = await fetch(`${base}api/tools.json?v=${version}`);
    if (!res.ok) return undefined;
    const tools = await res.json();
    const tool = tools.find((t: { id: number }) => t.id === id);
    if (!tool) return undefined;
    const { toolToMiniPost } = await import('./miniPosts');
    const mini = toolToMiniPost(tool);
    if (mini.slug !== slug) return undefined; // slug 不符 — 可能 tool title 被改過
    return mini;
  } catch {
    return undefined;
  }
}
