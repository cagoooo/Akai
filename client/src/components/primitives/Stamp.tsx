import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface StampProps {
  trigger: number;
  children: ReactNode;
  color?: string;
}

/** 印章動畫 — trigger 變時 stamp in，1.5s 後消失 */
export function Stamp({ trigger, children, color = '#c7302a' }: StampProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger === 0) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), 1500);
    return () => clearTimeout(t);
  }, [trigger]);

  if (!show) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        animation: 'stampIn 0.6s cubic-bezier(.34,1.56,.64,1) forwards',
        border: `3.5px solid ${color}`,
        color,
        padding: '10px 22px',
        borderRadius: 8,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 900,
        letterSpacing: '0.15em',
        fontSize: 22,
        pointerEvents: 'none',
        zIndex: 30,
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.4)',
        textShadow: '1px 1px 0 rgba(255,255,255,.3)',
        opacity: 0,
      }}
    >
      {children}
    </div>
  );
}
