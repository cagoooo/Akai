import { forwardRef, useEffect, useRef, useState } from 'react';
import { tokens } from '@/design/tokens';

interface Props {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  resultCount: number;
  totalCount: number;
  onSearchSubmit?: () => void;
}

// 輪播在輸入框內的關鍵字範例：都是工具標題／描述真的找得到的詞（2026-11-03 核對各有 1～27 個結果）
const EXAMPLE_KEYWORDS = ['投票', '注音', '文字雲', '閱讀', '抽籤', '評語', 'QR', '英文', '遊戲', '預約'];
const DEFAULT_PLACEHOLDER = '搜尋教育工具名稱或描述…';
const SEEN_KEY = 'akai-search-noticed';
const STRONG_MS = 12000; // 進站前 12 秒強提示（流光外框＋光圈＋便利貼），之後轉為柔和外框

function hasNoticedSearch() {
  try { return sessionStorage.getItem(SEEN_KEY) === '1'; } catch { return false; }
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/**
 * 公佈欄風格搜尋列 — 便條紙夾在膠帶下
 *
 * 進站時用流光外框、脈動光圈、便利貼提示與輪播關鍵字，讓訪客一眼知道可以從這裡找工具；
 * 點進搜尋框或開始輸入就停止（同一個分頁工作階段內不再出現）。
 */
export const BulletinSearchBar = forwardRef<HTMLInputElement, Props>(function BulletinSearchBar(
  { searchQuery, onSearchChange, resultCount, totalCount, onSearchSubmit },
  ref
) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isComposing, setIsComposing] = useState(false);
  const pendingInputScroll = useRef(false);
  const inputScrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 'strong' → 'calm' → 'off'；已經用過搜尋的分頁直接 'off'
  const [attention, setAttention] = useState<'strong' | 'calm' | 'off'>(() => (hasNoticedSearch() ? 'off' : 'strong'));
  const [isFocused, setIsFocused] = useState(false);
  const [placeholder, setPlaceholder] = useState(DEFAULT_PLACEHOLDER);
  const markNoticed = () => {
    setAttention('off');
    try { sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* 私密模式等情況下不記錄 */ }
  };
  const cancelInputScroll = () => {
    if (inputScrollTimer.current !== null) {
      clearTimeout(inputScrollTimer.current);
      inputScrollTimer.current = null;
    }
  };

  // 等使用者停下打字、中文選字完成後，再帶到已更新的工具卡區。
  // 僅回應實際輸入，開啟帶有 q 的分享連結時不搶走原本的閱讀位置。
  useEffect(() => {
    if (!pendingInputScroll.current || isComposing || !searchQuery.trim()) return;
    inputScrollTimer.current = setTimeout(() => {
      inputScrollTimer.current = null;
      pendingInputScroll.current = false;
      onSearchSubmit?.();
    }, 350);
    return () => {
      if (inputScrollTimer.current !== null) {
        clearTimeout(inputScrollTimer.current);
        inputScrollTimer.current = null;
      }
    };
  }, [searchQuery, isComposing, onSearchSubmit]);

  useEffect(() => {
    if (attention !== 'strong') return;
    const timer = setTimeout(() => setAttention('calm'), STRONG_MS);
    return () => clearTimeout(timer);
  }, [attention]);

  // 輸入框內逐字打出「試試輸入：投票」等範例；聚焦、已有文字或偏好減少動態時改用固定文字
  useEffect(() => {
    if (isFocused || searchQuery) {
      setPlaceholder(DEFAULT_PLACEHOLDER);
      return;
    }
    if (prefersReducedMotion()) {
      setPlaceholder(`輸入關鍵字找工具，例如：${EXAMPLE_KEYWORDS.slice(0, 3).join('、')}…`);
      return;
    }
    let word = 0;
    let chars = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const keyword = EXAMPLE_KEYWORDS[word % EXAMPLE_KEYWORDS.length];
      chars += 1;
      setPlaceholder(`試試輸入：${keyword.slice(0, chars)}`);
      if (chars < keyword.length) {
        timer = setTimeout(tick, 160);
      } else {
        word += 1;
        chars = 0;
        timer = setTimeout(tick, 1800);
      }
    };
    timer = setTimeout(tick, 600);
    return () => clearTimeout(timer);
  }, [isFocused, searchQuery]);

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
      className={`bulletin-searchbar${attention === 'off' ? '' : ` is-attention is-attention--${attention}`}`}
      data-tour="search-bar"
    >
      <div className="bulletin-searchbar__row">
      <span className="bulletin-searchbar__label">🔎 搜尋工具</span>
      <form
        className="bulletin-searchbar__form"
        role="search"
        aria-label="搜尋教育工具"
        onSubmit={(event) => {
          event.preventDefault();
          if (isComposing) return;
          cancelInputScroll();
          pendingInputScroll.current = false;
          onSearchSubmit?.();
        }}
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
        <span className="bulletin-searchbar__shine" aria-hidden="true" />
        <span className="bulletin-searchbar__icon" aria-hidden="true">🔍</span>
        <input
          ref={ref}
          type="search"
          enterKeyHint="search"
          value={searchQuery}
          onFocus={() => {
            setIsFocused(true);
            markNoticed();
          }}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => {
            pendingInputScroll.current = !!e.target.value.trim();
            onSearchChange(e.target.value);
          }}
          onCompositionStart={() => {
            cancelInputScroll();
            setIsComposing(true);
          }}
          onCompositionEnd={(e) => {
            pendingInputScroll.current = !!e.currentTarget.value.trim();
            onSearchChange(e.currentTarget.value);
            setIsComposing(false);
          }}
          placeholder={placeholder}
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
              cancelInputScroll();
              pendingInputScroll.current = false;
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
        {attention === 'strong' && (
          <button
            type="button"
            className="bulletin-searchbar__hint"
            onClick={() => sectionRef.current?.querySelector('input')?.focus()}
          >
            👆 輸入關鍵字，馬上找到適合你的工具！
          </button>
        )}
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
