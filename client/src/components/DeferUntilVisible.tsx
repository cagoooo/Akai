/**
 * DeferUntilVisible —— 捲到附近才真正掛載子元件。
 *
 * 為什麼不是只用 React.lazy：
 *   lazy() 的 chunk 在「元件被 render」的當下就開始下載。如果它一開始就在畫面樹裡，
 *   等於首頁載入時照樣把那包 JS 抓下來，只是不再阻塞主 bundle 解析。
 *   對「捲很久才看得到、但相依很肥」的區塊（例如 BulletinSiteStats 帶 532 KB recharts），
 *   要的是「使用者真的快看到了才下載」。
 *
 * 用法：
 *   <DeferUntilVisible minHeight={320}>
 *     <Suspense fallback={null}><HeavyThing /></Suspense>
 *   </DeferUntilVisible>
 *
 * minHeight 會先佔位，避免內容進來時把下方版面往下推（CLS）。
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** 佔位高度（px）；請填接近實際內容的高度，避免載入後版面跳動 */
  minHeight: number;
  /** 提前多少距離就開始載入，預設 400px（讓使用者捲到時通常已就緒） */
  rootMargin?: string;
}

export function DeferUntilVisible({ children, minHeight, rootMargin = '400px' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (show) return;
    const el = ref.current;
    if (!el) return;

    // 不支援 IntersectionObserver（或測試環境）時直接顯示，功能不因偵測失敗而消失
    if (typeof IntersectionObserver === 'undefined') {
      setShow(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [show, rootMargin]);

  return (
    <div ref={ref} style={show ? undefined : { minHeight }}>
      {show ? children : null}
    </div>
  );
}
