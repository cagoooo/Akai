/**
 * BlogList — 教學情境部落格首頁列表 (/blog)
 *
 * 列出所有 POSTS（按 publishedAt 倒序），每篇用便利貼風卡片，點進去看內文。
 * 文章來源：client/src/blog/posts.ts（內聯 markdown）
 */

import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { POSTS, getAllPostsAsync, type BlogPost } from '@/blog/posts';
import { tokens } from '@/design/tokens';
import { Pin } from '@/components/primitives/Pin';
import { Tape } from '@/components/primitives/Tape';
import { BulletinHeader } from '@/components/bulletin/BulletinHeader';
import { BulletinFooter } from '@/components/bulletin/BulletinFooter';
import { PageHead } from '@/components/PageHead';

const COLOR_MAP: Record<string, string> = {
  yellow: tokens.note.yellow,
  blue: tokens.note.blue,
  pink: tokens.note.pink,
  green: tokens.note.green,
  orange: tokens.note.orange,
  purple: tokens.note.purple,
};

const PIN_MAP: Record<string, string> = {
  yellow: '#eab308',
  blue: '#2563eb',
  pink: '#ec4899',
  green: '#16a34a',
  orange: '#dc2626',
  purple: '#c026d3',
};

export function BlogList() {
  // 同步顯示手寫 5 篇，async 載入完再合併迷你 blog（92+ 個）
  const [posts, setPosts] = useState<BlogPost[]>(POSTS);

  useEffect(() => {
    getAllPostsAsync().then((all) => setPosts(all)).catch(() => { /* 用 fallback POSTS 即可 */ });
  }, []);

  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return (
    <>
      <PageHead
        mode="custom"
        title="📖 教學情境部落格 · 阿凱老師教育工具集"
        description="阿凱老師親手撰寫的工具使用情境長文 — 每篇講一個熱門工具如何解決真實教學現場的問題，含實測數字與配對推薦。"
        path="/blog"
      />
      <BulletinHeader />

      <div
        style={{
          maxWidth: 960,
          margin: '0 auto',
          padding: '20px 28px 60px',
          fontFamily: tokens.font.tc,
        }}
      >
        {/* 標題區 */}
        <div style={{ position: 'relative', textAlign: 'center', marginBottom: 36 }}>
          <Tape color="#ea8a3e" width={200} angle={-2} style={{ marginBottom: 14 }}>
            📖 教學情境長文
          </Tape>
          <h1
            style={{
              fontSize: 36,
              fontWeight: 900,
              color: tokens.ink,
              margin: '8px 0 6px',
              letterSpacing: '0.01em',
            }}
          >
            這些工具，我是這樣帶課的
          </h1>
          <p style={{ fontSize: 15, color: tokens.muted2, margin: 0, lineHeight: 1.6 }}>
            阿凱老師親手撰寫的工具使用情境，含實測數字、學生回饋與配對推薦。
          </p>
        </div>

        {/* 文章便利貼牆 */}
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 28,
          }}
        >
          {sortedPosts.map((post, idx) => {
            const noteColor = COLOR_MAP[post.coverColor] || tokens.note.yellow;
            const pinColor = PIN_MAP[post.coverColor] || tokens.red;
            const tilt = (idx % 3) === 0 ? -1.2 : (idx % 3) === 1 ? 0.8 : -0.4;
            return (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                >
                  <article
                    style={{
                      position: 'relative',
                      background: noteColor,
                      border: `2.5px solid ${tokens.ink}`,
                      borderRadius: 10,
                      padding: '22px 20px 18px',
                      transform: `rotate(${tilt}deg)`,
                      boxShadow: '5px 6px 0 rgba(0,0,0,.22), 0 8px 18px -6px rgba(0,0,0,.18)',
                      transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                      cursor: 'pointer',
                      minHeight: 280,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = `rotate(${tilt}deg) translate(-2px, -3px)`;
                      e.currentTarget.style.boxShadow = '7px 8px 0 rgba(0,0,0,.25), 0 12px 22px -6px rgba(0,0,0,.22)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = `rotate(${tilt}deg)`;
                      e.currentTarget.style.boxShadow = '5px 6px 0 rgba(0,0,0,.22), 0 8px 18px -6px rgba(0,0,0,.18)';
                    }}
                  >
                    <Pin color={pinColor} size={18} style={{ top: -9, left: '50%', marginLeft: -9 }} />

                    <div style={{ fontSize: 42, lineHeight: 1, marginBottom: 8 }}>{post.coverEmoji}</div>
                    <h2
                      style={{
                        fontSize: 18,
                        fontWeight: 900,
                        color: tokens.ink,
                        margin: '0 0 8px',
                        lineHeight: 1.35,
                      }}
                    >
                      {post.title}
                    </h2>
                    <p
                      style={{
                        fontSize: 13,
                        color: tokens.muted2,
                        margin: '0 0 12px',
                        lineHeight: 1.55,
                        flex: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {post.excerpt}
                    </p>

                    {/* meta */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: 11,
                        color: tokens.muted2,
                        fontFamily: tokens.font.en,
                        borderTop: `1.5px dashed ${tokens.ink}`,
                        paddingTop: 8,
                      }}
                    >
                      <span>
                        {new Date(post.publishedAt).toLocaleDateString('zh-TW', {
                          month: '2-digit',
                          day: '2-digit',
                        })}
                      </span>
                      <span>📖 {post.readingMinutes} 分鐘</span>
                      <span>關聯 {post.toolIds.length} 個工具</span>
                    </div>
                  </article>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* 底部說明 */}
        <div
          style={{
            marginTop: 40,
            padding: '14px 18px',
            background: tokens.note.blue,
            border: `2px solid ${tokens.ink}`,
            borderRadius: 10,
            boxShadow: '3px 3px 0 rgba(0,0,0,.18)',
            fontSize: 12,
            color: tokens.muted2,
            textAlign: 'center',
            transform: 'rotate(-0.5deg)',
          }}
        >
          想看某個工具的使用情境？<Link href="/?wish=1" style={{ color: tokens.red, fontWeight: 800, textDecoration: 'underline' }}>到許願池許願 ✨</Link>，阿凱老師會優先寫。
        </div>
      </div>

      <BulletinFooter />
    </>
  );
}
