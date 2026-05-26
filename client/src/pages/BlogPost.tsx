/**
 * BlogPost — 教學情境部落格內文 (/blog/:slug)
 *
 * 三欄式 magazine layout：左欄 sticky 作者卡 + 中欄文章 + 右欄 sticky TOC。
 * 內文沿用 react-markdown + remark-gfm；callout / stat-grid 用文章 body 內嵌 HTML 即可生效
 * （react-markdown 預設不 sanitize；class 樣式在 styles/blog-article.css）。
 */

import { Link, useParams } from 'wouter';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import type { EducationalTool } from '@/lib/data';
import { POSTS, getPostBySlug, getPostBySlugAsync, type BlogPost as BlogPostType } from '@/blog/posts';
import { tokens } from '@/design/tokens';
import { BulletinHeader } from '@/components/bulletin/BulletinHeader';
import { BulletinFooter } from '@/components/bulletin/BulletinFooter';
import { BulletinBackToTop } from '@/components/bulletin/BulletinBackToTop';
import { PageHead } from '@/components/PageHead';
import { trackEvent } from '@/lib/analytics';
import { BlogArticleLayout } from '@/components/blog/BlogArticleLayout';
import { BlogHero } from '@/components/blog/BlogHero';
import { BlogLeftRail } from '@/components/blog/BlogLeftRail';
import { BlogToc } from '@/components/blog/BlogToc';
import { BlogMobileToc } from '@/components/blog/BlogMobileToc';
import { BlogRelatedTools } from '@/components/blog/BlogRelatedTools';
import { BlogPrevNext } from '@/components/blog/BlogPrevNext';
import { BlogCta } from '@/components/blog/BlogCta';
import { BlogMobileShare } from '@/components/blog/BlogMobileShare';
import { BlogCodeBlock } from '@/components/blog/BlogCodeBlock';
import { BlogPostingSchema } from '@/components/blog/BlogPostingSchema';
import { BlogPodcast } from '@/components/blog/BlogPodcast';
import { BlogTemplateCopier } from '@/components/blog/BlogTemplateCopier';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { useActiveSection } from '@/hooks/useActiveSection';
import { useExtractedSections, slugifyHeading } from '@/hooks/useExtractedSections';

function flattenText(children: React.ReactNode): string {
  if (children == null || children === false || children === true) return '';
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(flattenText).join('');
  if (typeof children === 'object' && 'props' in (children as object)) {
    // @ts-expect-error — runtime children traversal
    return flattenText(children.props?.children);
  }
  return '';
}

/** 章節錨點連結：滑鼠移過 H2/H3 顯示 #，點擊複製對應 URL 到剪貼簿 */
function HeadingAnchor({ id }: { id: string }) {
  const handle = (e: React.MouseEvent) => {
    e.preventDefault();
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
    history.replaceState(null, '', `#${id}`);
  };
  return (
    <a
      href={`#${id}`}
      className="bp-heading-anchor"
      aria-label="複製章節連結"
      onClick={handle}
    >#</a>
  );
}

export function BlogPost() {
  const params = useParams<{ slug: string }>();
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

  // scroll to top + GA 上報
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

  const readingProgress = useReadingProgress();
  const sections = useExtractedSections(post?.body);
  // 第二個 sections 引用相同記憶體 ref；useActiveSection 內部以 id 序列為 dep
  const activeId = useActiveSection(sections);

  // 閱讀完成率上報：當文末 sentinel 進入視窗（≥50% 可見） → 上報一次 blog_read_complete
  const completedRef = useRef(false);
  const completeSentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    completedRef.current = false;
  }, [params.slug]);
  useEffect(() => {
    if (!post) return;
    const el = completeSentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e?.isIntersecting && !completedRef.current) {
          completedRef.current = true;
          trackEvent('blog_read_complete', {
            slug: post.slug,
            title: post.title,
            reading_minutes: post.readingMinutes,
            related_tools: post.toolIds.join(','),
          });
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [post]);

  // === Loading / 404 ===
  if (!post && !loadedAsync) {
    return (
      <>
        <BulletinHeader />
        <div style={{
          maxWidth: 600,
          margin: '40px auto',
          padding: 60,
          textAlign: 'center',
          color: tokens.muted2,
          fontFamily: tokens.font.tc,
          fontStyle: 'italic',
        }}>
          📌 載入文章中…
        </div>
      </>
    );
  }

  if (!post) {
    return (
      <>
        <BulletinHeader />
        <div style={{
          maxWidth: 600,
          margin: '40px auto',
          padding: 28,
          textAlign: 'center',
          fontFamily: tokens.font.tc,
        }}>
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

  // Prev / Next：只在 POSTS（手寫長文）內提供，mini blog 不顯示
  const currentIdx = POSTS.findIndex((p) => p.slug === post.slug);
  let prevItem: { slug: string; title: string; emoji?: string } | undefined;
  let nextItem: { slug: string; title: string; emoji?: string } | undefined;
  if (currentIdx !== -1) {
    const sorted = [...POSTS].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    const sIdx = sorted.findIndex((p) => p.slug === post.slug);
    const prev = sorted[sIdx + 1];
    const next = sorted[sIdx - 1];
    if (prev) prevItem = { slug: prev.slug, title: prev.title, emoji: prev.coverEmoji };
    if (next) nextItem = { slug: next.slug, title: next.title, emoji: next.coverEmoji };
  }

  // Hero kicker：用前兩個 tag 組合
  const kicker = post.tags.slice(0, 2).join(' · ').toUpperCase();

  // Left rail facts
  const facts = [
    { key: '發布', value: new Date(post.publishedAt).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }) },
    { key: '閱讀', value: `${post.readingMinutes} min` },
    { key: '分類', value: post.tags[0] || '教學情境' },
    { key: '收錄', value: `${post.toolIds.length} 工具` },
  ];

  return (
    <>
      <PageHead
        mode="custom"
        title={`${post.title} · 阿凱老師教學情境長文`}
        description={post.excerpt}
        path={`/blog/${post.slug}`}
      />

      <BlogPostingSchema
        title={post.title}
        description={post.excerpt}
        slug={post.slug}
        publishedAt={post.publishedAt}
        readingMinutes={post.readingMinutes}
        body={post.body}
        tags={post.tags}
      />

      <BulletinHeader />

      {/* 頂部閱讀進度條 */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: 3,
          width: `${readingProgress}%`,
          background: `linear-gradient(90deg, ${tokens.accent}, ${tokens.red})`,
          zIndex: 9998,
          transition: 'width 0.08s linear',
          boxShadow: '0 0 8px rgba(234, 138, 62, 0.55)',
        }}
      />

      <BlogArticleLayout
        left={
          <BlogLeftRail
            facts={facts}
            progress={readingProgress}
            shareTitle={post.title}
          />
        }
        hero={
          <BlogHero
            kicker={kicker}
            title={post.title}
            excerpt={post.excerpt}
            emoji={post.coverEmoji}
            date={post.publishedAt}
            readingMinutes={post.readingMinutes}
            tags={post.tags}
            variant="editorial"
          />
        }
        toc={sections.length > 0 ? <BlogToc sections={sections} activeId={activeId} slug={post.slug} /> : undefined}
        article={
          <>
            {sections.length > 0 && (
              <BlogMobileToc sections={sections} activeId={activeId} slug={post.slug} />
            )}

            {/* AI 生成 podcast 播放器（檔案存在時才渲染）*/}
            <BlogPodcast slug={post.slug} />

            <div className="bp-article">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  h2: ({ children }) => {
                    const id = slugifyHeading(flattenText(children));
                    return (
                      <h2 id={id}>
                        {children}
                        <HeadingAnchor id={id} />
                      </h2>
                    );
                  },
                  h3: ({ children }) => {
                    const id = slugifyHeading(flattenText(children));
                    return (
                      <h3 id={id}>
                        {children}
                        <HeadingAnchor id={id} />
                      </h3>
                    );
                  },
                  table: ({ children }) => (
                    <div className="bp-table-wrap">
                      <table>{children}</table>
                    </div>
                  ),
                  pre: ({ children }) => {
                    // 抓 fenced code block：<pre><code class="language-xxx">{code}</code></pre>
                    // react-markdown 把 ``` ``` 包成這個結構
                    const child = Array.isArray(children) ? children[0] : children;
                    if (
                      child &&
                      typeof child === 'object' &&
                      'props' in (child as object)
                    ) {
                      const props = (child as { props?: { className?: string; children?: React.ReactNode } }).props;
                      const className = props?.className;
                      const code = flattenText(props?.children);
                      const m = /language-(\w+)/.exec(className || '');
                      return <BlogCodeBlock language={m?.[1]} code={code} />;
                    }
                    return <pre>{children}</pre>;
                  },
                  a: ({ href, children, ...rest }) => {
                    if (!href) return <a {...rest}>{children}</a>;
                    if (href.startsWith('/')) {
                      return <Link href={href}>{children}</Link>;
                    }
                    if (href.startsWith('#')) {
                      // 文章內錨點：scrollTo 該 id 並補 24px header offset
                      return (
                        <a
                          href={href}
                          onClick={(e) => {
                            const id = href.slice(1);
                            const el = document.getElementById(id);
                            if (el) {
                              e.preventDefault();
                              const top = el.getBoundingClientRect().top + window.scrollY - 24;
                              window.scrollTo({ top, behavior: 'smooth' });
                              history.replaceState(null, '', href);
                            }
                          }}
                        >
                          {children}
                        </a>
                      );
                    }
                    return (
                      <a href={href} target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    );
                  },
                }}
              >
                {post.body}
              </ReactMarkdown>
            </div>

            <BlogRelatedTools tools={relatedTools} />

            <BlogMobileShare shareTitle={post.title} />

            {/* 閱讀完成 sentinel — 進入 50% 視窗就上報 blog_read_complete（每篇只觸發一次） */}
            <div
              ref={completeSentinelRef}
              aria-hidden="true"
              style={{ height: 1, width: '100%', marginTop: -1 }}
            />

            <BlogPrevNext prev={prevItem} next={nextItem} />

            <BlogCta />
          </>
        }
      />

      <BulletinFooter />
      <BulletinBackToTop />
      <BlogTemplateCopier />
    </>
  );
}
