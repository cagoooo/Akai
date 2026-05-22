import type { Section } from '@/hooks/useActiveSection';
import { trackEvent } from '@/lib/analytics';

interface BlogTocProps {
  sections: Section[];
  activeId?: string;
  /** 文章 slug，用於上報 blog_toc_click 事件 */
  slug?: string;
}

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 24;
  window.scrollTo({ top, behavior: 'smooth' });
}

export function BlogToc({ sections, activeId, slug }: BlogTocProps) {
  if (!sections.length) return null;
  return (
    <nav className="bp-toc" aria-label="本文目錄">
      <div className="bp-toc__head">
        <span className="bp-toc__head-tape">本文章節 · INDEX</span>
      </div>
      <ul className="bp-toc__list">
        {sections.map((s) => (
          <li key={s.id} className="bp-toc__item">
            <a
              href={`#${s.id}`}
              className={'bp-toc__link' + (s.id === activeId ? ' is-active' : '')}
              aria-current={s.id === activeId ? 'true' : undefined}
              onClick={(e) => {
                e.preventDefault();
                scrollToId(s.id);
                if (slug) {
                  trackEvent('blog_toc_click', {
                    slug,
                    section_id: s.id,
                    section_label: s.label,
                    source: 'desktop',
                  });
                }
              }}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
      <a
        className="bp-toc__totop"
        href="#top"
        onClick={(e) => {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        ↑ 回到頂端
      </a>
    </nav>
  );
}
