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
  /** 保險絲：這麼久還沒收到「任何」IO 回呼就視為 IO 失效並直接顯示（見下方說明） */
  fallbackMs?: number;
}

export function DeferUntilVisible({
  children,
  minHeight,
  rootMargin = '400px',
  fallbackMs = 1500,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (show) return;
    const el = ref.current;
    if (!el) return;

    // 不支援 IntersectionObserver 時直接顯示，功能不因偵測失敗而消失
    if (typeof IntersectionObserver === 'undefined') {
      setShow(true);
      return;
    }

    /**
     * 保險絲：IO「存在但永遠不回呼」是真的會發生的情況
     * （2026-09-06 實測：某些內嵌瀏覽器窗格中，連固定置中的元素都收不到初次回呼）。
     * 只靠 typeof 檢查擋不住，內容會永久消失。
     *
     * ⚠️ 但保險絲不能寫成「N 秒後就顯示」——那會把最佳化整個抵銷掉：
     * 使用者只要在首頁停留超過 N 秒沒捲動，重相依照樣被下載。
     *
     * 正確判斷方式：IO 只要正常運作，observe() 之後一定會送出「初次回呼」
     * （不論當下是否 isIntersecting）。所以保險絲只負責偵測「連一次回呼都沒有」，
     * 一收到任何回呼就拆掉，之後完全交給 IO。
     */
    let reported = false;
    const fuse = setTimeout(() => {
      if (!reported) setShow(true);
    }, fallbackMs);

    const io = new IntersectionObserver(
      (entries) => {
        reported = true;
        clearTimeout(fuse);
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => {
      clearTimeout(fuse);
      io.disconnect();
    };
  }, [show, rootMargin, fallbackMs]);

  return (
    <div ref={ref} style={show ? undefined : { minHeight }}>
      {show ? children : null}
    </div>
  );
}
