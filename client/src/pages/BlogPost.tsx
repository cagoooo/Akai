/**
 * BlogPost — 教學情境部落格內文 (/blog/:slug)
 *
 * 用 react-markdown + remark-gfm 渲染（支援 GFM 表格）。
 * cork 風格主視覺 + 底部「相關工具」卡片清單。
 */

import { Link, useParams } from 'wouter';
import { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { EducationalTool } from '@/lib/data';
import { POSTS, getPostBySlug, getPostBySlugAsync, type BlogPost as BlogPostType } from '@/blog/posts';
import { tokens } from '@/design/tokens';
import { Pin } from '@/components/primitives/Pin';
import { Tape } from '@/components/primitives/Tape';
import { BulletinHeader } from '@/components/bulletin/BulletinHeader';
import { BulletinFooter } from '@/components/bulletin/BulletinFooter';
import { BulletinBackToTop } from '@/components/bulletin/BulletinBackToTop';
import { PageHead } from '@/components/PageHead';
import { trackEvent } from '@/lib/analytics';
import { getCategoryLabel } from '@/components/bulletin/toolAdapter';

export function BlogPost() {
  const params = useParams<{ slug: string }>();
  // 先看手寫長文（同步）；若沒有再 async 載入 mini blog
  const syncPost = getPostBySlug(params.slug);
  const [asyncPost, setAsyncPost] = useState<BlogPostType | undefined>(undefined);
  const [loadedAsync, setLoadedAsync] = useState(false);
  useEffect(() => {
    if (syncPost) { setLoadedAsync(true); return; }
    getPostBySlugAsync(params.slug).then((p) => {
      setAsyncPost(p);
      setLoadedAsync(true);
    });
  }, [params.slug, syncPost]);
  const post = syncPost || asyncPost;

  const { data: tools } = useQuery<EducationalTool[]>({
    queryKey: ['/api/tools'],
    queryFn: async () => {
      const base = import.meta.env.BASE_URL || '/';
      const version = import.meta.env.VITE_APP_VERSION || Date.now();
      const res = await fetch(`${base}api/tools.json?v=${version}`);
      if (!res.ok) throw new Error('tools fetch failed');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!post,
  });

  // scroll to top + GA 上報 blog_read on slug change
  useEffect(() => {
    window.scrollTo(0, 0);
    if (post) {
      trackEvent('blog_read', {
        slug: post.slug,
        title: post.title,
        related_tools: post.toolIds.join(','),
        reading_minutes: post.readingMinutes,
      });
    }
  }, [params.slug, post]);

  // 閱讀進度（橘色條沿頂部隨滾動填滿）
  const [readingProgress, setReadingProgress] = useState(0);
  const progressRafRef = useRef<number | null>(null);
  useEffect(() => {
    const handler = () => {
      if (progressRafRef.current !== null) return; // throttle by rAF
      progressRafRef.current = requestAnimationFrame(() => {
        progressRafRef.current = null;
        const doc = document.documentElement;
        const total = doc.scrollHeight - doc.clientHeight;
        const current = window.scrollY;
        const pct = total > 0 ? Math.min(100, Math.max(0, (current / total) * 100)) : 0;
        setReadingProgress(pct);
      });
    };
    window.addEventListener('scroll', handler, { passive: true });
    handler();
    return () => {
      window.removeEventListener('scroll', handler);
      if (progressRafRef.current !== null) cancelAnimationFrame(progressRafRef.current);
    };
  }, []);

  // 還在 async 載入中 → 顯示 loading skeleton（避免 mini blog 還沒載完先閃顯 404）
  if (!post && !loadedAsync) {
    return (
      <>
        <BulletinHeader />
        <div style={{ maxWidth: 600, margin: '40px auto', padding: 60, textAlign: 'center', color: tokens.muted2, fontFamily: tokens.font.tc, fontStyle: 'italic' }}>
          📌 載入文章中…
        </div>
      </>
    );
  }

  if (!post) {
    return (
      <>
        <BulletinHeader />
        <div style={{ maxWidth: 600, margin: '40px auto', padding: 28, textAlign: 'center', fontFamily: tokens.font.tc }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: tokens.ink }}>找不到這篇文章 🤔</h1>
          <p style={{ color: tokens.muted2, marginTop: 12 }}>
            可能是連結錯誤或文章已下架。
          </p>
          <Link
            href="/blog"
            style={{
              display: 'inline-block',
              marginTop: 20,
              padding: '10px 22px',
              background: tokens.accent,
              color: '#fff',
              textDecoration: 'none',
              border: `2px solid ${tokens.ink}`,
              borderRadius: 10,
              fontWeight: 800,
              boxShadow: '3px 3px 0 rgba(0,0,0,.2)',
            }}
          >
            ← 回到部落格列表
          </Link>
        </div>
        <BulletinFooter />
      </>
    );
  }

  const relatedTools = (tools || []).filter((t) => post.toolIds.includes(t.id));

  return (
    <>
      <PageHead
        mode="custom"
        title={`${post.title} · 阿凱老師教學情境長文`}
        description={post.excerpt}
        path={`/blog/${post.slug}`}
      />

      <BulletinHeader />

      {/* 閱讀進度條 — 固定在頂部，隨滾動 0-100% 增長 */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: 4,
          width: `${readingProgress}%`,
          background: `linear-gradient(90deg, ${tokens.accent}, ${tokens.red})`,
          zIndex: 9998,
          transition: 'width 0.05s linear',
          boxShadow: '0 0 8px rgba(234, 138, 62, 0.55)',
        }}
      />

      <article
        style={{
          // 容器寬度 940 — 給 hero / 相關工具 / 結尾 CTA 用滿
          // 內文段落自己再限寬 820（包在 .blog-content 內 max-width），仍保閱讀舒適
          maxWidth: 940,
          margin: '0 auto',
          padding: 'clamp(20px, 3vw, 40px) clamp(20px, 4vw, 48px) 80px',
          fontFamily: tokens.font.tc,
        }}
      >
        {/* 返回連結 */}
        <Link
          href="/blog"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            color: tokens.muted2,
            fontSize: 13,
            fontWeight: 700,
            textDecoration: 'none',
            marginBottom: 18,
          }}
        >
          ← 回到部落格列表
        </Link>

        {/* 標題區（大型便利貼）— 寬螢幕放大版 */}
        <header
          style={{
            position: 'relative',
            background: tokens.note.yellow,
            border: `2.5px solid ${tokens.ink}`,
            borderRadius: 14,
            padding: 'clamp(28px, 4vw, 44px) clamp(24px, 3.5vw, 40px) clamp(22px, 3vw, 32px)',
            boxShadow: '7px 8px 0 rgba(0,0,0,.22), 0 14px 28px -8px rgba(0,0,0,.18)',
            transform: 'rotate(-0.5deg)',
            marginBottom: 36,
          }}
        >
          <Pin color={tokens.red} size={24} style={{ top: -13, left: '50%', marginLeft: -12 }} />

          <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
            {post.tags.slice(0, 4).map((tag) => (
              <Tape key={tag} color="#fde047" width={70} angle={-2} style={{ fontSize: 11 }}>
                #{tag}
              </Tape>
            ))}
          </div>

          <div style={{ fontSize: 'clamp(48px, 6vw, 64px)', lineHeight: 1, marginBottom: 12 }}>{post.coverEmoji}</div>

          <h1
            style={{
              fontSize: 'clamp(28px, 3.4vw, 40px)',
              fontWeight: 900,
              color: tokens.ink,
              margin: '4px 0 16px',
              lineHeight: 1.28,
              letterSpacing: '0.005em',
            }}
          >
            {post.title}
          </h1>

          <div
            style={{
              display: 'flex',
              gap: 18,
              fontSize: 13,
              color: tokens.muted2,
              fontWeight: 700,
              flexWrap: 'wrap',
              borderTop: `1.5px dashed ${tokens.ink}`,
              paddingTop: 14,
              marginTop: 10,
            }}
          >
            <span>
              📅 {new Date(post.publishedAt).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })}
            </span>
            <span>📖 {post.readingMinutes} 分鐘閱讀</span>
            <span>✏️ 阿凱老師</span>
          </div>
        </header>

        {/* Markdown 內容 — paragraph 級別自己限寬 820 維持閱讀舒適 */}
        <div
          className="blog-content"
          style={{
            // 內文段落區自己限寬，居中（hero / 相關工具區會用滿容器 940）
            maxWidth: 820,
            margin: '0 auto',
            fontSize: 'clamp(15px, 1.05vw, 17px)',
            lineHeight: 1.9,
            color: tokens.ink,
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ children }) => (
                <h2
                  style={{
                    fontSize: 'clamp(22px, 2vw, 28px)',
                    fontWeight: 900,
                    color: tokens.ink,
                    margin: '36px 0 14px',
                    paddingBottom: 8,
                    borderBottom: `3px solid ${tokens.accent}`,
                    letterSpacing: '0.005em',
                  }}
                >
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 style={{
                  fontSize: 'clamp(18px, 1.5vw, 21px)',
                  fontWeight: 900,
                  color: tokens.ink,
                  margin: '26px 0 10px',
                }}>
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p style={{
                  margin: '0 0 16px',
                  color: tokens.inkSoft,
                  lineHeight: 1.9,
                }}>{children}</p>
              ),
              blockquote: ({ children }) => (
                <blockquote
                  style={{
                    margin: '16px 0',
                    padding: '12px 18px',
                    background: tokens.note.orange,
                    borderLeft: `4px solid ${tokens.accent}`,
                    borderRadius: 6,
                    fontStyle: 'italic',
                    color: tokens.muted2,
                  }}
                >
                  {children}
                </blockquote>
              ),
              ul: ({ children }) => (
                <ul style={{ margin: '0 0 14px', paddingLeft: 24, color: tokens.inkSoft }}>{children}</ul>
              ),
              ol: ({ children }) => (
                <ol style={{ margin: '0 0 14px', paddingLeft: 24, color: tokens.inkSoft }}>{children}</ol>
              ),
              li: ({ children }) => <li style={{ margin: '4px 0' }}>{children}</li>,
              code: ({ children, className }) => {
                const isInline = !className;
                if (isInline) {
                  return (
                    <code
                      style={{
                        background: '#fef3e7',
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontFamily: 'ui-monospace, SF Mono, monospace',
                        fontSize: '0.9em',
                        color: tokens.accentDeep,
                      }}
                    >
                      {children}
                    </code>
                  );
                }
                return (
                  <code
                    style={{
                      display: 'block',
                      background: '#1a1a1a',
                      color: '#fefdfa',
                      padding: 14,
                      borderRadius: 6,
                      fontSize: 13,
                      fontFamily: 'ui-monospace, SF Mono, monospace',
                      overflowX: 'auto',
                    }}
                  >
                    {children}
                  </code>
                );
              },
              table: ({ children }) => (
                <div style={{ overflowX: 'auto', margin: '18px 0' }}>
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      border: `2px solid ${tokens.ink}`,
                      fontSize: 14,
                    }}
                  >
                    {children}
                  </table>
                </div>
              ),
              th: ({ children }) => (
                <th
                  style={{
                    background: tokens.note.yellow,
                    border: `1.5px solid ${tokens.ink}`,
                    padding: '8px 12px',
                    textAlign: 'left',
                    fontWeight: 900,
                  }}
                >
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td
                  style={{
                    border: `1.5px solid ${tokens.ink}`,
                    padding: '8px 12px',
                    background: '#fefdfa',
                  }}
                >
                  {children}
                </td>
              ),
              a: ({ href, children }) => {
                // 內部 /tool/N 用 wouter Link，外部開新分頁
                if (href?.startsWith('/')) {
                  return (
                    <Link
                      href={href}
                      style={{ color: tokens.red, fontWeight: 700, textDecoration: 'underline' }}
                    >
                      {children}
                    </Link>
                  );
                }
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: tokens.red, fontWeight: 700, textDecoration: 'underline' }}
                  >
                    {children}
                  </a>
                );
              },
            }}
          >
            {post.body}
          </ReactMarkdown>
        </div>

        {/* 相關工具區 */}
        {relatedTools.length > 0 && (
          <section
            style={{
              marginTop: 40,
              padding: '20px 22px 18px',
              background: tokens.note.green,
              border: `2.5px solid ${tokens.ink}`,
              borderRadius: 12,
              boxShadow: '4px 5px 0 rgba(0,0,0,.2)',
              transform: 'rotate(-0.3deg)',
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 900, color: tokens.ink, margin: '0 0 12px' }}>
              🔗 文章提到的工具
            </h3>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {relatedTools.map((tool) => (
                <li key={tool.id}>
                  <Link
                    href={`/tool/${tool.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      background: '#fff',
                      border: `2px solid ${tokens.ink}`,
                      borderRadius: 8,
                      textDecoration: 'none',
                      color: tokens.ink,
                      boxShadow: '2px 2px 0 rgba(0,0,0,.18)',
                      transition: 'transform 0.15s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateX(2px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateX(0)'; }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 900,
                        background: tokens.accent,
                        color: '#fff',
                        padding: '2px 8px',
                        borderRadius: 999,
                        fontFamily: tokens.font.en,
                      }}
                    >
                      #{tool.id}
                    </span>
                    <span style={{ flex: 1, fontWeight: 800 }}>{tool.title}</span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: tokens.muted2,
                      }}
                    >
                      {getCategoryLabel(tool.category)} →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 上一篇 / 下一篇導航 — 只看手寫長文 POSTS（mini blog 太多不適合線性瀏覽） */}
        {(() => {
          // 找當前 post 在 POSTS 內的位置
          const currentIdx = POSTS.findIndex((p) => p.slug === post.slug);
          if (currentIdx === -1) return null; // mini blog 不顯示
          const sortedPosts = [...POSTS].sort(
            (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
          );
          const sortedIdx = sortedPosts.findIndex((p) => p.slug === post.slug);
          const prev = sortedPosts[sortedIdx + 1]; // 較舊
          const next = sortedPosts[sortedIdx - 1]; // 較新
          if (!prev && !next) return null;
          return (
            <nav
              aria-label="文章導航"
              style={{
                marginTop: 40,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 16,
              }}
            >
              {prev ? (
                <Link
                  href={`/blog/${prev.slug}`}
                  style={{
                    background: '#fff',
                    border: `2.5px solid ${tokens.ink}`,
                    borderRadius: 10,
                    padding: '14px 18px',
                    textDecoration: 'none',
                    color: tokens.ink,
                    boxShadow: '3px 3px 0 rgba(0,0,0,.16)',
                    transition: 'transform 0.15s ease',
                    display: 'block',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translate(0,0)'; }}
                >
                  <div style={{ fontSize: 11, color: tokens.muted2, fontWeight: 700, marginBottom: 4 }}>
                    ← 上一篇
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: tokens.ink, lineHeight: 1.4 }}>
                    {prev.coverEmoji} {prev.title}
                  </div>
                </Link>
              ) : <div />}
              {next ? (
                <Link
                  href={`/blog/${next.slug}`}
                  style={{
                    background: '#fff',
                    border: `2.5px solid ${tokens.ink}`,
                    borderRadius: 10,
                    padding: '14px 18px',
                    textDecoration: 'none',
                    color: tokens.ink,
                    boxShadow: '3px 3px 0 rgba(0,0,0,.16)',
                    transition: 'transform 0.15s ease',
                    textAlign: 'right',
                    display: 'block',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translate(2px,-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translate(0,0)'; }}
                >
                  <div style={{ fontSize: 11, color: tokens.muted2, fontWeight: 700, marginBottom: 4 }}>
                    下一篇 →
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: tokens.ink, lineHeight: 1.4 }}>
                    {next.coverEmoji} {next.title}
                  </div>
                </Link>
              ) : <div />}
            </nav>
          );
        })()}

        {/* 結尾 CTA */}
        <div
          style={{
            marginTop: 32,
            padding: '18px 22px',
            background: tokens.note.blue,
            border: `2px solid ${tokens.ink}`,
            borderRadius: 10,
            boxShadow: '3px 3px 0 rgba(0,0,0,.18)',
            fontSize: 14,
            color: tokens.muted2,
            textAlign: 'center',
            transform: 'rotate(0.5deg)',
            lineHeight: 1.7,
          }}
        >
          覺得有用？<Link href="/blog" style={{ color: tokens.red, fontWeight: 800, textDecoration: 'underline' }}>看更多教學情境長文</Link>，或<Link href="/?wish=1" style={{ color: tokens.red, fontWeight: 800, textDecoration: 'underline' }}>到許願池</Link> 跟阿凱老師說你想看什麼工具教學。
        </div>
      </article>

      <BulletinFooter />
      <BulletinBackToTop />
    </>
  );
}
