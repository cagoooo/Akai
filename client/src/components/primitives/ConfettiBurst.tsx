/**
 * ConfettiBurst — 共用撒花動畫元件
 *
 * 原本內嵌在 BulletinMilestone100，v3.6.66 因 ExternalWorkBanner 也要用而抽出。
 *
 * 用法：
 *   const [tick, setTick] = useState(0);
 *   <ConfettiBurst trigger={tick} />
 *   setTick(n => n + 1);  // 每加 1 撒一次
 *
 * 注意：trigger=0 不撒花（初始 mount 不觸發）；要進場撒花請在 useEffect 內 setTick(1)。
 */
import { useEffect, useState } from 'react';

const CONFETTI_STYLE_ID = 'akai-confetti-keyframes';

function ensureConfettiStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(CONFETTI_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = CONFETTI_STYLE_ID;
  style.textContent = `
    @keyframes akai-confetti-fall {
      0%   { transform: translate3d(0,-10vh,0) rotate(0deg); opacity: 1; }
      80%  { opacity: 1; }
      100% { transform: translate3d(var(--akai-drift, 40px), 110vh, 0) rotate(720deg); opacity: 0; }
    }
    @media (prefers-reduced-motion: reduce) {
      .akai-confetti-piece { animation: none !important; }
    }
  `;
  document.head.appendChild(style);
}

const CONFETTI_COLORS = ['#fde047', '#fb923c', '#f87171', '#60a5fa', '#34d399', '#a78bfa', '#f472b6', '#fbbf24'];
const CONFETTI_PIECES = 28;

interface Piece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  drift: number;
  shape: 'rect' | 'circle';
}

export function ConfettiBurst({ trigger }: { trigger: number }) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (trigger === 0) return;
    ensureConfettiStyles();
    const next = Array.from({ length: CONFETTI_PIECES }, (_, i) => ({
      id: trigger * 1000 + i,
      left: Math.random() * 100,
      delay: Math.random() * 0.4,
      duration: 3.2 + Math.random() * 2.0,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: 6 + Math.random() * 6,
      drift: (Math.random() - 0.5) * 240,
      shape: (Math.random() > 0.5 ? 'rect' : 'circle') as 'rect' | 'circle',
    }));
    setPieces(next);
    const cleanup = window.setTimeout(() => setPieces([]), 5800);
    return () => window.clearTimeout(cleanup);
  }, [trigger]);

  if (pieces.length === 0) return null;
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 9999,
      }}
    >
      {pieces.map((p) => (
        <span
          key={p.id}
          className="akai-confetti-piece"
          style={{
            position: 'absolute',
            top: 0,
            left: `${p.left}%`,
            width: p.size,
            height: p.shape === 'rect' ? p.size * 1.6 : p.size,
            background: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : 2,
            ['--akai-drift' as never]: `${p.drift}px`,
            animation: `akai-confetti-fall ${p.duration}s cubic-bezier(.22,.65,.4,1) ${p.delay}s forwards`,
            boxShadow: '0 0 0 1px rgba(0,0,0,.06)',
          }}
        />
      ))}
    </div>
  );
}
