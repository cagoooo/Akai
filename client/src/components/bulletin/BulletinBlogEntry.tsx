/**
 * BulletinBlogEntry — 首頁教學情境長文入口便利貼
 * 顯示最新 3 篇 blog post，點便利貼 → 進入該文 / 點底部 chip → 進 /blog
 */

import { Link } from 'wouter';
import { POSTS } from '@/blog/posts';
import { tokens } from '@/design/tokens';
import { Pin } from '@/components/primitives/Pin';
import { Tape } from '@/components/primitives/Tape';

const COLOR_MAP: Record<string, string> = {
  yellow: tokens.note.yellow,
  blue: tokens.note.blue,
  pink: tokens.note.pink,
  green: tokens.note.green,
  orange: tokens.note.orange,
  purple: tokens.note.purple,
};

export function BulletinBlogEntry() {
  const latestPosts = [...POSTS]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 3);

  return (
    <div
      style={{
        position: 'relative',
        background: tokens.note.purple,
        border: `2.5px solid ${tokens.ink}`,
        borderRadius: 10,
        padding: '20px 22px 16px',
        boxShadow: '5px 6px 0 rgba(0,0,0,.2), 0 10px 22px -8px rgba(0,0,0,.18)',
        transform: 'rotate(-0.5deg)',
        fontFamily: tokens.font.tc,
      }}
    >
      <Pin color="#c026d3" size={18} style={{ top: -9, left: 28 }} />
      <Pin color="#c026d3" size={18} style={{ top: -9, right: 28 }} />

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <div>
          <Tape color="#fde047" width={130} angle={-3} style={{ fontSize: 12 }}>
            📖 教學情境長文
          </Tape>
        </div>
        <Link
          href="/blog"
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: tokens.red,
            textDecoration: 'underline',
            fontFamily: tokens.font.tc,
          }}
        >
          看全部 →
        </Link>
      </div>

      <h2 style={{ fontSize: 17, fontWeight: 900, color: tokens.ink, margin: '6px 0 12px' }}>
        阿凱老師親手寫的工具實戰心得
      </h2>

      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {latestPosts.map((post) => {
          const noteColor = COLOR_MAP[post.coverColor] || tokens.note.yellow;
          return (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  background: '#fff',
                  border: `2px solid ${tokens.ink}`,
                  borderRadius: 8,
                  textDecoration: 'none',
                  color: tokens.ink,
                  boxShadow: '2px 2px 0 rgba(0,0,0,.16)',
                  transition: 'transform 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translate(-1px, -1px)';
                  e.currentTarget.style.boxShadow = '3px 3px 0 rgba(0,0,0,.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translate(0, 0)';
                  e.currentTarget.style.boxShadow = '2px 2px 0 rgba(0,0,0,.16)';
                }}
              >
                <span
                  style={{
                    fontSize: 22,
                    background: noteColor,
                    border: `1.5px solid ${tokens.ink}`,
                    borderRadius: 6,
                    width: 36,
                    height: 36,
                    display: 'grid',
                    placeItems: 'center',
                    flex: 'none',
                  }}
                >
                  {post.coverEmoji}
                </span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 900,
                      color: tokens.ink,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {post.title}
                  </div>
                  <div style={{ fontSize: 11, color: tokens.muted2, fontFamily: tokens.font.en, marginTop: 2 }}>
                    📖 {post.readingMinutes} 分鐘 · 關聯 {post.toolIds.length} 個工具
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 900,
                    color: tokens.muted2,
                    flex: 'none',
                  }}
                >
                  →
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
