import type { CSSProperties, ReactNode } from 'react';
import { shade } from './shade';

interface TapeProps {
  color?: string;
  width?: number;
  angle?: number;
  opacity?: number;
  children?: ReactNode;
  style?: CSSProperties;
}

/** Washi 膠帶 — 斜紋 45deg 重複條紋 + 毛邊左右 */
export function Tape({
  color = '#ffd966',
  width = 110,
  angle = -4,
  opacity = 0.85,
  children,
  style = {},
}: TapeProps) {
  return (
    <div
      style={{
        display: 'inline-block',
        padding: '8px 16px',
        color: '#4a3a20',
        background: `repeating-linear-gradient(45deg, ${color}, ${color} 8px, ${shade(color, -6)} 8px, ${shade(color, -6)} 10px)`,
        minWidth: width,
        textAlign: 'center',
        transform: `rotate(${angle}deg)`,
        opacity,
        fontSize: 13,
        fontWeight: 700,
        boxShadow: '0 2px 4px rgba(0,0,0,.12)',
        position: 'relative',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: -2,
          top: 0,
          bottom: 0,
          width: 3,
          background: `linear-gradient(${color}, ${shade(color, -10)})`,
          clipPath: 'polygon(0 10%, 100% 0, 100% 100%, 0 90%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: -2,
          top: 0,
          bottom: 0,
          width: 3,
          background: `linear-gradient(${color}, ${shade(color, -10)})`,
          clipPath: 'polygon(0 0, 100% 10%, 100% 90%, 0 100%)',
        }}
      />
      {children}
    </div>
  );
}
