import { useState } from 'react';
import type { Section } from '@/hooks/useActiveSection';
import { trackEvent } from '@/lib/analytics';

interface BlogMobileTocProps {
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

export function BlogMobileToc({ sections, activeId, slug }: BlogMobileTocProps) {
  const [open, setOpen] = useState(false);
  if (!sections.length) return null;
  const current = sections.find((s) => s.id === activeId) || sections[0];
  return (
    <div className={'bp-mtoc' + (open ? ' is-open' : '')}>
      <button
        type="button"
        className="bp-mtoc__btn"
        aria-expanded={open}
        aria-label="展開或收合文章目錄"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="bp-mtoc__btn-label">本文 · {sections.length} 節</span>
        <span className="bp-mtoc__btn-current">{current.label}</span>
        <span className="bp-mtoc__arrow" aria-hidden="true">▾</span>
      </button>
      <div className="bp-mtoc__panel">
        <ul className="bp-mtoc__list">
          {sections.map((s) => (
            <li key={s.id} className="bp-mtoc__item">
              <a
                href={`#${s.id}`}
                className={'bp-mtoc__link' + (s.id === activeId ? ' is-active' : '')}
                aria-current={s.id === activeId ? 'true' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  scrollToId(s.id);
                  if (slug) {
                    trackEvent('blog_toc_click', {
                      slug,
                      section_id: s.id,
                      section_label: s.label,
                      source: 'mobile',
                    });
                  }
                }}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
