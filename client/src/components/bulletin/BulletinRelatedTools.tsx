/**
 * BulletinRelatedTools — 工具詳情頁底部「相似工具」區塊
 *
 * 用 fuse.js 模糊比對當前工具的 tags + title + category，找出最相似的 3 個工具卡片。
 *
 * SEO 效益：增加 internal linking 密度（Google 偏好），
 * 並提升使用者單次平均瀏覽工具數（黏性 ↑）。
 */

import { useMemo } from 'react';
import { Link } from 'wouter';
import Fuse from 'fuse.js';
import type { EducationalTool } from '@/lib/data';
import { tokens } from '@/design/tokens';
import { Pin } from '@/components/primitives/Pin';
import { getCategoryLabel, getCategoryKey, getToolEmoji } from './toolAdapter';

interface Props {
  current: EducationalTool;
  allTools: EducationalTool[];
  limit?: number;
}

export function BulletinRelatedTools({ current, allTools, limit = 3 }: Props) {
  const related = useMemo(() => {
    // 排除自己、isInternal 工具（#100 索引神器不推薦）、無效工具
    const candidates = allTools.filter(
      (t) => t.id !== current.id && !t.isInternal
    );
    if (candidates.length === 0) return [];

    // Phase 1：同分類優先（簡單而有效）→ tags 重疊次之 → 全文模糊比對
    const sameCategory = candidates.filter((t) => t.category === current.category);
    const otherCategory = candidates.filter((t) => t.category !== current.category);

    // 用 fuse.js 對「同分類」+「不同分類」分別評分，給同分類額外 boost
    const fuse = new Fuse(candidates, {
      keys: [
        { name: 'tags', weight: 3 },
        { name: 'title', weight: 1 },
        { name: 'description', weight: 0.5 },
      ],
      includeScore: true,
      threshold: 0.65, // 較寬鬆 — 相似工具不用完全匹配
      ignoreLocation: true,
      minMatchCharLength: 2,
    });

    // 用當前工具 tags + title 當 query
    const queryParts = [
      ...(current.tags || []).slice(0, 3),
      current.title.slice(0, 12),
    ];
    const query = queryParts.join(' ');
    const results = fuse.search(query, { limit: limit * 3 });

    // 對結果加同分類 bonus，再取 top N
    const scored = results.map((r) => ({
      tool: r.item,
      score: (r.score ?? 1) - (r.item.category === current.category ? 0.15 : 0),
    }));
    scored.sort((a, b) => a.score - b.score);
    return scored.slice(0, limit).map((s) => s.tool);
  }, [current, allTools, limit]);

  if (related.length === 0) return null;

  return (
    <section
      aria-label="相似工具推薦"
      style={{
        marginTop: 40,
        padding: '24px 24px 22px',
        background: tokens.note.green,
        border: `2.5px solid ${tokens.ink}`,
        borderRadius: 12,
        boxShadow: '5px 6px 0 rgba(0,0,0,.2), 0 10px 22px -8px rgba(0,0,0,.18)',
        transform: 'rotate(-0.5deg)',
        position: 'relative',
        fontFamily: tokens.font.tc,
      }}
    >
      <Pin color="#16a34a" size={18} style={{ top: -9, left: 28 }} />
      <Pin color="#16a34a" size={18} style={{ top: -9, right: 28 }} />

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 14 }}>
        <h3 style={{ fontSize: 18, fontWeight: 900, color: tokens.ink, margin: 0 }}>
          🔗 相似工具推薦
        </h3>
        <span style={{ fontSize: 12, color: tokens.muted2, fontStyle: 'italic' }}>
          用了 #{current.id} 的老師也常用這幾個
        </span>
      </div>

      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))`,
          gap: 12,
        }}
      >
        {related.map((tool) => {
          const catKey = getCategoryKey(tool.category);
          const C = tokens.cat[catKey];
          const emoji = getToolEmoji(tool);
          return (
            <li key={tool.id}>
              <Link
                href={`/tool/${tool.id}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  padding: '12px 14px',
                  background: '#fff',
                  border: `2px solid ${tokens.ink}`,
                  borderRadius: 10,
                  textDecoration: 'none',
                  color: tokens.ink,
                  boxShadow: '2.5px 2.5px 0 rgba(0,0,0,.18)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  height: '100%',
                  boxSizing: 'border-box',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translate(-2px, -2px)';
                  e.currentTarget.style.boxShadow = '4px 4px 0 rgba(0,0,0,.22)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translate(0, 0)';
                  e.currentTarget.style.boxShadow = '2.5px 2.5px 0 rgba(0,0,0,.18)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 22 }}>{emoji}</span>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 900,
                      padding: '2px 6px',
                      background: C.bg,
                      color: C.fg,
                      borderRadius: 999,
                      border: `1.2px solid ${tokens.ink}`,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    #{tool.id}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 900,
                    color: tokens.ink,
                    lineHeight: 1.35,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {tool.title}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: tokens.muted2,
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    flex: 1,
                  }}
                >
                  {tool.description}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: tokens.red,
                    marginTop: 4,
                  }}
                >
                  {getCategoryLabel(tool.category)} →
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
