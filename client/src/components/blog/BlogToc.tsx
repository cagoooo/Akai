import type { Section } from '@/hooks/useActiveSection';

interface BlogTocProps {
  sections: Section[];
  activeId?: string;
}

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 24;
  window.scrollTo({ top, behavior: 'smooth' });
}

export function BlogToc({ sections, activeId }: BlogTocProps) {
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
              onClick={(e) => {
                e.preventDefault();
                scrollToId(s.id);
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
