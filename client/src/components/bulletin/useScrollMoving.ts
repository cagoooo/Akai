import { useEffect, useState } from 'react';

/**
 * 頁面正在捲動（含停手後 {@link idleMs} 毫秒內）回傳 true。
 * 手機上後台入口（扳手）用它在捲動時淡出、停下才出現（珍奶與回頂 2026-11-27 起捲動時也一直顯示），
 * 避免蓋住卡片右下角的「開啟」。
 */
export function useScrollMoving(idleMs = 700): boolean {
  const [moving, setMoving] = useState(false);
  useEffect(() => {
    let timer: number | undefined;
    const onScroll = () => {
      setMoving(true);
      if (timer !== undefined) window.clearTimeout(timer);
      timer = window.setTimeout(() => setMoving(false), idleMs);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [idleMs]);
  return moving;
}
