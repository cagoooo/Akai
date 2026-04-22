import { forwardRef } from 'react';
import { Tape } from '@/components/primitives/Tape';
import { tokens } from '@/design/tokens';

interface Props {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  resultCount: number;
  totalCount: number;
}

/**
 * 公佈欄風格搜尋列 — 便條紙夾在膠帶下
 */
export const BulletinSearchBar = forwardRef<HTMLInputElement, Props>(function BulletinSearchBar(
  { searchQuery, onSearchChange, resultCount, totalCount },
  ref
) {
  return (
    <section
      className="bulletin-searchbar"
      style={{ padding: '0 60px 20px' }}
    >
      <div style={{ marginBottom: 12 }}>
        <Tape color={tokens.note.blue} angle={-1} width={160}>
          <span style={{ fontSize: 13 }}>🔎 搜尋 · SEARCH</span>
        </Tape>
      </div>

      <div
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
          maxWidth: 640,
        }}
      >
        <span style={{ fontSize: 18 }}>🔍</span>
        <input
          ref={ref}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="搜尋教育工具名稱或描述…"
          aria-label="搜尋教育工具名稱或描述"
          style={{
            flex: 1,
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
            onClick={() => onSearchChange('')}
            aria-label="清除搜尋"
            style={{
              background: tokens.ink,
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: 26,
              height: 26,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 700,
              fontFamily: 'inherit',
            }}
          >
            ×
          </button>
        )}
      </div>

      {searchQuery && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          style={{
            marginTop: 10,
            fontSize: 13,
            fontFamily: tokens.font.tc,
            color: tokens.muted,
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
