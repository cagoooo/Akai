/**
 * 工具卡片 →「閱讀文章」按鈕的對應查詢。
 *
 * ⚠️ 這裡只能讀 postsIndex（中繼資料），不可 import posts.ts。
 * 這個模組被每一張工具卡（BulletinToolCard / ToolCard）同步 import，
 * 一旦改回 posts.ts，126 篇長文正文（679 KB）就會全部進主 bundle。
 */
import { POSTS_INDEX, type BlogPostMeta } from '@/blog/postsIndex';

export function getPrimaryBlogPostForTool(toolId: number): BlogPostMeta | undefined {
  const primaryPost = POSTS_INDEX.find((post) => post.toolIds[0] === toolId);
  return primaryPost ?? POSTS_INDEX.find((post) => post.toolIds.includes(toolId));
}

export function getBlogPostPath(post: Pick<BlogPostMeta, 'slug'>): string {
  return `/blog/${post.slug}`;
}
