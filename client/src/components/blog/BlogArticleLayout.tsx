import type { ReactNode } from 'react';

interface BlogArticleLayoutProps {
  left?: ReactNode;
  hero: ReactNode;
  article: ReactNode;
  toc?: ReactNode;
}

/**
 * 三欄式 magazine grid 殼：
 *   ┌──────┬───────────┬───────┐
 *   │ left │   hero    │       │
 *   │      ├───────────┼ toc   │
 *   │      │  article  │       │
 *   └──────┴───────────┴───────┘
 * 排版細節全部寫在 styles/blog-article.css 的 .bp-page* class 內。
 * ≤1080px 時左欄與右側 TOC 自動收起，文章單欄置中。
 */
export function BlogArticleLayout({ left, hero, article, toc }: BlogArticleLayoutProps) {
  return (
    <main className="bp-page">
      {left && <aside className="bp-page__left">{left}</aside>}
      <header className="bp-page__hero">{hero}</header>
      <article className="bp-page__article">{article}</article>
      {toc && <aside className="bp-page__toc">{toc}</aside>}
    </main>
  );
}
