import { POSTS, type BlogPost } from '@/blog/posts';

export function getPrimaryBlogPostForTool(toolId: number): BlogPost | undefined {
  const primaryPost = POSTS.find((post) => post.toolIds[0] === toolId);
  return primaryPost ?? POSTS.find((post) => post.toolIds.includes(toolId));
}

export function getBlogPostPath(post: Pick<BlogPost, 'slug'>): string {
  return `/blog/${post.slug}`;
}
