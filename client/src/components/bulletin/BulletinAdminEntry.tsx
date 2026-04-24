import { Link } from 'wouter';
import { useState } from 'react';
import { tokens } from '@/design/tokens';
import { Pin } from '@/components/primitives/Pin';

/**
 * cork 風格「隱藏後台入口」小按鈕
 *
 * 設計：
 * - 位置：左下角（對稱於右下的「回頂部」按鈕）
 * - 視覺：cork 色小便利貼 + 淺淺的 🔧 符號
 * - 預設低透明度（0.3）→ hover 時浮現 + 輕微旋轉
 * - 有明確 aria-label / title 讓使用者知道用途，但視覺低調
 * - RWD：手機版縮小
 * - 尊重 prefers-reduced-motion
 */
export function BulletinAdminEntry() {
  const [hover, setHover] = useState(false);

  return (
    <Link href="/admin">
      <a
        className="bulletin-admin-entry"
        aria-label="進入管理後台"
        title="管理後台"
        style={{
          position: 'fixed',
          left: 18,
          bottom: 28,
          width: 40,
          height: 40,
          background: hover ? tokens.paper : tokens.note.yellowBright,
          border: `2px solid ${tokens.ink}`,
          borderRadius: 8,
          boxShadow: hover
            ? '3px 3px 0 rgba(0,0,0,.35), 0 8px 18px -4px rgba(0,0,0,.3)'
            : '2px 2px 0 rgba(0,0,0,.15)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 29,
          textDecoration: 'none',
          // 預設隱晦、hover 時浮現
          opacity: hover ? 1 : 0.42,
          transform: hover
            ? 'rotate(0deg) translate(-2px, -2px) scale(1.08)'
            : 'rotate(-4deg)',
          transition: 'all .25s cubic-bezier(.34,1.56,.64,1)',
          cursor: 'pointer',
          fontFamily: tokens.font.tc,
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
      >
        {/* 頂部小圖釘（只在 hover 時出現，增加趣味） */}
        {hover && (
          <Pin color={tokens.pin[4]} size={11} style={{ top: -5, left: '50%', marginLeft: -5, zIndex: 2 }} />
        )}

        {/* 扳手 icon（SVG 避免 emoji 跨平台差異） */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke={tokens.ink}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      </a>
    </Link>
  );
}
