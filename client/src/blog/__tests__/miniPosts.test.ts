import { describe, expect, it } from 'vitest';
import type { EducationalTool } from '@/lib/data';
import { HANDWRITTEN_TOOL_IDS } from '../postsIndex';
import { generateMiniPosts, hasMiniPosts } from '../miniPosts';

const makeTool = (id: number, extra: Partial<EducationalTool> = {}) => ({
  id,
  title: `工具${id}`,
  description: '說明',
  category: 'utilities',
  tags: [],
  url: 'https://example.test/',
  icon: 'Box',
  ...extra,
}) as EducationalTool;

const handwrittenId = [...HANDWRITTEN_TOOL_IDS][0];
const unwrittenId = 987_654;

describe('迷你文章判斷', () => {
  it('所有工具都有手寫長文時沒有迷你文章（不需要完整工具目錄）', () => {
    expect(hasMiniPosts([])).toBe(false);
    expect(hasMiniPosts([makeTool(handwrittenId)])).toBe(false);
    expect(generateMiniPosts([makeTool(handwrittenId)])).toHaveLength(0);
  });

  it('有沒手寫長文的工具就需要迷你文章，內部工具不算', () => {
    expect(hasMiniPosts([makeTool(handwrittenId), makeTool(unwrittenId)])).toBe(true);
    expect(generateMiniPosts([makeTool(handwrittenId), makeTool(unwrittenId)]).map((post) => post.slug))
      .toEqual([`tool-${unwrittenId}`]);
    expect(hasMiniPosts([makeTool(unwrittenId, { isInternal: true })])).toBe(false);
  });
});
