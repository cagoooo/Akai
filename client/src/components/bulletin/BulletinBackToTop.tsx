import { useEffect, useState } from 'react';
import { tokens } from '@/design/tokens';
import { Pin } from '@/components/primitives/Pin';

/**
 * cork 風格「回到頂部」按鈕
 *
 * 設計：
 * - 圓形米白色底座 + 黑色粗邊 + 斜影（呼應便利貼 shadow-hard）
 * - 上方紅色圖釘點綴（與工具卡同語彙）
 * - 捲動超過 500px 才浮現，淡入 + 上滑動畫
 * - 點擊滑順捲回頂部
 * - RWD：手機縮小並靠右下（避開浮動元件重疊）
 * - 尊重 prefers-reduced-motion
 */
export function BulletinBackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 500);
    handleScroll(); // 初始檢查
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="回到頁面頂端"
      title="回到頂端"
      className="bulletin-back-to-top"
      style={{
        position: 'fixed',
        right: 24,
        bottom: 30,
        width: 54,
        height: 54,
        borderRadius: '50%',
        background: tokens.paper,
        border: `2.5px solid ${tokens.ink}`,
        cursor: 'pointer',
        boxShadow: '3px 3px 0 rgba(0,0,0,.35), 0 10px 20px -4px rgba(0,0,0,.25)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 30,
        fontFamily: tokens.font.tc,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transform: visible ? 'translateY(0) rotate(-4deg)' : 'translateY(20px) rotate(-4deg)',
        transition: 'opacity .3s ease, transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .2s',
        padding: 0,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.transform = 'translateY(-3px) rotate(0deg) scale(1.08)';
        el.style.boxShadow = '5px 5px 0 rgba(0,0,0,.4), 0 14px 26px -4px rgba(0,0,0,.3)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.transform = 'translateY(0) rotate(-4deg)';
        el.style.boxShadow = '3px 3px 0 rgba(0,0,0,.35), 0 10px 20px -4px rgba(0,0,0,.25)';
      }}
    >
      {/* 頂部圖釘點綴 */}
      <Pin
        color={tokens.red}
        size={14}
        style={{ top: -7, left: '50%', marginLeft: -7, zIndex: 2 }}
      />

      {/* 向上箭頭 */}
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke={tokens.ink}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
}
