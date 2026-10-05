import { forwardRef, useEffect, useRef } from 'react';
import { tokens } from '@/design/tokens';

interface Props {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  resultCount: number;
  totalCount: number;
  onSearchSubmit?: () => void;
}

/**
 * 公佈欄風格搜尋列 — 便條紙夾在膠帶下
 */
export const BulletinSearchBar = forwardRef<HTMLInputElement, Props>(function BulletinSearchBar(
  { searchQuery, onSearchChange, resultCount, totalCount, onSearchSubmit },
  ref
) {
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const bar = sectionRef.current;
    const board = bar?.closest<HTMLElement>('.bulletin-sticky-search');
    if (!bar || !board) return;
    const update = () => {
      const top = parseFloat(getComputedStyle(bar).top);
      board.style.setProperty('--search-scroll-offset', `${bar.getBoundingClientRect().height + (Number.isFinite(top) ? top : 18) + 12}px`);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(bar);
    return () => { observer.disconnect(); board.style.removeProperty('--search-scroll-offset'); };
  }, []);
  return (
    <section
      ref={sectionRef}
      className="bulletin-searchbar"
      data-tour="search-bar"
    >
      <div className="bulletin-searchbar__row">
      <span className="bulletin-searchbar__label">🔎 搜尋工具</span>
      <form
        role="search"
        aria-label="搜尋教育工具"
        onSubmit={(event) => { event.preventDefault(); onSearchSubmit?.(); }}
        style={{
          position: 'relative',
          background: 'rgba(255,255,255,.95)',
          border: '2.5px solid #1a1a1a',
          borderRadius: 12,
          boxShadow: '4px 4px 0 rgba(0,0,0,.25)',
          padding: '4px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flex: 1,
          minWidth: 0,
        }}
      >
        <span style={{ fontSize: 18 }}>🔍</span>
        <input
          ref={ref}
          type="search"
          enterKeyHint="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="搜尋教育工具名稱或描述…"
          aria-label="搜尋教育工具名稱或描述"
          style={{
            flex: 1,
            minWidth: 0,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            padding: '12px 0',
            fontSize: 15,
            fontFamily: tokens.font.tc,
            color: tokens.ink,
          }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              onSearchChange('');
              sectionRef.current?.querySelector('input')?.focus({ preventScroll: true });
            }}
            aria-label="清除搜尋"
            style={{
              background: tokens.ink,
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: 40,
              height: 40,
              flexShrink: 0,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 700,
              fontFamily: 'inherit',
            }}
          >
            ×
          </button>
        )}
        <button className="bulletin-searchbar__submit" type="submit" aria-label="查看搜尋結果">搜尋</button>
      </form>
      </div>

      {searchQuery && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          style={{
            margin: '10px auto 0',
            maxWidth: 1100,
            fontSize: 13,
            fontFamily: tokens.font.tc,
            color: '#685742',
          }}
        >
          ✨ 找到{' '}
          <span style={{ fontWeight: 900, color: tokens.accent }}>{resultCount}</span> 個工具
          {resultCount < totalCount && (
            <span style={{ marginLeft: 4, opacity: 0.7 }}>（共 {totalCount} 個）</span>
          )}
        </div>
      )}
    </section>
  );
});
