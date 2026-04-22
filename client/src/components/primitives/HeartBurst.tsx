import { useEffect, useState } from 'react';

interface HeartBurstProps {
  trigger: number;
}

interface Burst {
  id: number;
  x: number;
  delay: number;
  rot: number;
  size: number;
}

/** 收藏時飛出的愛心群 — trigger 每變就 burst 一次 */
export function HeartBurst({ trigger }: HeartBurstProps) {
  const [bursts, setBursts] = useState<Burst[]>([]);

  useEffect(() => {
    if (trigger === 0) return;
    const id = Date.now();
    const next: Burst[] = Array.from({ length: 6 }, (_, i) => ({
      id: id + i,
      x: (Math.random() - 0.5) * 80,
      delay: i * 50,
      rot: (Math.random() - 0.5) * 60,
      size: 14 + Math.random() * 10,
    }));
    setBursts((prev) => [...prev, ...next]);
    const t = setTimeout(() => {
      setBursts((prev) => prev.filter((b) => !next.find((n) => n.id === b.id)));
    }, 1200);
    return () => clearTimeout(t);
  }, [trigger]);

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}>
      {bursts.map((b) => (
        <div
          key={b.id}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            fontSize: b.size,
            animation: `heartUp 1.1s ${b.delay}ms ease-out forwards`,
            ['--x' as string]: `${b.x}px`,
            ['--rot' as string]: `${b.rot}deg`,
          } as React.CSSProperties}
        >
          💖
        </div>
      ))}
    </div>
  );
}
