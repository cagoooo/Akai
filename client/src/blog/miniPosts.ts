/**
 * Mini Blog Posts — 工具自動生成的迷你 blog（每個工具一篇 ~300 字 SEO landing）
 *
 * 來源：tools.json 內的所有工具（排除 isInternal + 已有手寫長文的 5 個熱門工具）
 * 路由：/blog/tool-{id}-{slug}
 *
 * SEO 目的：
 *   - 每個工具都有獨立 indexable URL（不只 /tool/N 主頁）
 *   - long-tail keyword 覆蓋率最大化（標籤 / 描述全部進文章）
 *   - 跟手寫長文一起進 sitemap，Google 看到「活躍寫內容的站」trust score 提升
 *
 * 內容結構（自動生成，不需手動編輯）：
 *   - title：「【30 秒看完】#N {工具名}：適合誰用？怎麼開始？」
 *   - excerpt：tool.description 前 80 字
 *   - body：標準三段式 — 工具是什麼 / 適合誰用 / 怎麼開始 + 標籤雲 + 配對推薦
 */

import type { EducationalTool } from '@/lib/data';
import type { BlogPost } from './posts';

// 不要 mini blog 的工具 ID（已有手寫長文，避免重複）
const SKIP_IDS = new Set([81, 46, 10, 68, 3, 100, 53, 7, 88, 67, 72, 54, 76, 92, 82, 73, 51, 89, 83, 11, 87, 79, 97, 94, 41, 24, 25, 26, 27, 44, 49, 74, 75, 80]); // 已手寫 33 篇 + 索引神器

const CATEGORY_LABEL: Record<string, string> = {
  communication: '溝通互動',
  teaching: '教學設計',
  language: '語文寫作',
  reading: '語文閱讀',
  utilities: '實用工具',
  games: '教育遊戲',
  interactive: '互動體驗',
};

const CATEGORY_EMOJI: Record<string, string> = {
  communication: '💬',
  teaching: '📚',
  language: '✍️',
  reading: '📖',
  utilities: '🛠️',
  games: '🎮',
  interactive: '🎯',
};

// 分類對應的便利貼配色（在 BulletinBlogEntry 用得到）
const CATEGORY_COLOR_MAP: Record<string, BlogPost['coverColor']> = {
  communication: 'blue',
  teaching: 'green',
  language: 'purple',
  reading: 'orange',
  utilities: 'yellow',
  games: 'pink',
  interactive: 'blue',
};

/**
 * 為單一工具產生迷你 blog post
 *
 * slug 採用純 ASCII `tool-{id}` 簡潔模式：
 *   - 之前用 `tool-{id}-{title-slug}` 含中文，GH Pages 雖支援但需 URL encode
 *     → sitemap 寫 raw 中文 Google 抓不到、分享連結醜長
 *   - 改純 ASCII 後：URL 短乾淨、SEO 友善、所有平台都認得
 */
export function toolToMiniPost(tool: EducationalTool): BlogPost {
  const catLabel = CATEGORY_LABEL[tool.category] || tool.category;
  const catEmoji = CATEGORY_EMOJI[tool.category] || '🔖';
  const slug = `tool-${tool.id}`;
  const tags = tool.tags || [];
  const desc = tool.description || '';
  const detailed = tool.detailedDescription || '';

  const body = `## 這是什麼工具？

${catEmoji} **${tool.title}** 是阿凱老師打造的 **${catLabel}** 類工具${tags.length > 0 ? `，主要解決 ${tags.slice(0, 3).join('、')} 等情境的需求` : ''}。

${desc}

${detailed && detailed !== desc ? `\n${detailed.split('\n').slice(0, 6).join('\n')}\n` : ''}

## 適合誰用？

- 想做 **${catLabel}** 相關教學的國小 / 國中老師
- 對「${tags[0] || tool.title}」「${tags[1] || catLabel}」有需求的教育工作者
- 想要免註冊、免費、無廣告教育工具的所有人

## 怎麼開始？

1. 點下方按鈕進到 [#${tool.id} 工具頁](/tool/${tool.id})
2. 看「立即開啟工具」按鈕（會跳到工具實際運作的網站）
3. 收藏到「我的工具」方便下次找

${tags.length > 0 ? `\n## 🏷 工具標籤\n\n${tags.map((t) => `\`${t}\``).join(' · ')}\n` : ''}

## 想看更詳細的使用情境？

阿凱老師為部分熱門工具寫了 [長篇教學情境文章](/blog) — 含真實數據、學生回饋、配對工具推薦。
歡迎 [到許願池](/?wish=1) 留言「想看 #${tool.id} ${tool.title} 詳細用法」，阿凱老師會考慮優先寫。
`;

  return {
    slug,
    title: `【30 秒看完】#${tool.id} ${tool.title}：適合誰用？怎麼開始？`,
    excerpt: desc.length > 100 ? desc.slice(0, 98) + '…' : desc,
    publishedAt: tool.addedAt || '2024-06-01',
    readingMinutes: 2,
    tags: [catLabel, ...tags.slice(0, 4)],
    toolIds: [tool.id],
    coverEmoji: catEmoji,
    coverColor: CATEGORY_COLOR_MAP[tool.category] || 'yellow',
    body,
  };
}

/**
 * 從工具列表批次產生 mini posts（排除 SKIP_IDS）
 */
export function generateMiniPosts(tools: EducationalTool[]): BlogPost[] {
  return tools
    .filter((t) => !t.isInternal && !SKIP_IDS.has(t.id))
    .map(toolToMiniPost);
}
