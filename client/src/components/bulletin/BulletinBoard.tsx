import type { ReactNode } from 'react';
import { tokens } from '@/design/tokens';
import { BulletinBackToTop } from './BulletinBackToTop';
import { BulletinAdminEntry } from './BulletinAdminEntry';

interface Props {
  children: ReactNode;
}

/**
 * 公佈欄外框容器：軟木塞背景 + 上下木條 + 回到頂部按鈕 + 隱藏後台入口
 */
export function BulletinBoard({ children }: Props) {
  return (
    <div
      className="cork-bg"
      style={{
        color: tokens.ink,
        fontFamily: tokens.font.tc,
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: 18,
        paddingBottom: 18,
      }}
    >
      <WoodStrip position="top" />
      <WoodStrip position="bottom" />
      {children}
      <BulletinBackToTop />
      <BulletinAdminEntry />
    </div>
  );
}

function WoodStrip({ position }: { position: 'top' | 'bottom' }) {
  const isTop = position === 'top';
  return (
    <div
      style={{
        position: 'fixed',
        [position]: 0,
        left: 0,
        right: 0,
        height: 18,
        background:
          'repeating-linear-gradient(90deg, #7c4f2a, #7c4f2a 40px, #6b4220 40px, #6b4220 42px, #8a5a32 42px, #8a5a32 90px, #6b4220 90px, #6b4220 92px)',
        boxShadow: isTop
          ? 'inset 0 -2px 4px rgba(0,0,0,.3), 0 2px 6px rgba(0,0,0,.2)'
          : 'inset 0 2px 4px rgba(0,0,0,.3), 0 -2px 6px rgba(0,0,0,.2)',
        zIndex: 20,
        pointerEvents: 'none',
      }}
    />
  );
}
