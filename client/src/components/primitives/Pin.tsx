import type { CSSProperties } from 'react';
import { shade } from './shade';

interface PinProps {
  color?: string;
  size?: number;
  style?: CSSProperties;
}

/** 圖釘（thumbtack）— 絕對定位，父層記得 position:relative */
export function Pin({ color = '#dc2626', size = 18, style = {} }: PinProps) {
  return (
    <div
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle at 30% 30%, ${shade(color, 60)}, ${color} 55%, ${shade(color, -30)})`,
        boxShadow: '0 2px 4px rgba(0,0,0,.35), inset -1px -2px 3px rgba(0,0,0,.25)',
        zIndex: 10,
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '35%',
          left: '35%',
          width: '20%',
          height: '20%',
          borderRadius: '50%',
          background: 'rgba(255,255,255,.8)',
        }}
      />
    </div>
  );
}
