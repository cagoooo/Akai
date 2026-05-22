import { useEffect, useRef, useState } from 'react';

/**
 * 監聽頁面捲動，回傳 0-100 的閱讀百分比。
 * 用 requestAnimationFrame throttle，最多每幀更新一次。
 */
export function useReadingProgress(): number {
  const [pct, setPct] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const handler = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const doc = document.documentElement;
        const total = doc.scrollHeight - doc.clientHeight;
        const cur = window.scrollY;
        setPct(total > 0 ? Math.min(100, Math.max(0, (cur / total) * 100)) : 0);
      });
    };
    window.addEventListener('scroll', handler, { passive: true });
    handler();
    return () => {
      window.removeEventListener('scroll', handler);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return pct;
}
