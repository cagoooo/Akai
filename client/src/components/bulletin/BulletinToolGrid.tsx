import { useEffect, useMemo, useRef, useState } from 'react';
import { BulletinToolCard } from './BulletinToolCard';
import type { EducationalTool } from '@/lib/data';

interface Props {
  tools: EducationalTool[];
  highlightedToolId?: number | null;
  /** 篩選 / 排序條件；變了才回到第一批（點擊數即時更新不算，避免捲到一半被打回去） */
  resetKey?: string;
}

/**
 * 分批顯示：127 張卡一次全畫佔首頁 81% 的 DOM（手機整排 6.7 萬 px），
 * 先畫 BATCH 張，捲到離底部 LOAD_AHEAD 內自動補下一批。
 * 被推薦定位（highlightedToolId）的卡片一律確保已畫出。
 */
const BATCH = 24;
const LOAD_AHEAD = '1200px';

/**
 * 拍立得工具網格：每張卡有略微隨機的傾斜與圖釘色，營造手工公佈欄感
 * 使用工具 ID 作為傾斜種子，確保每次渲染相同卡片的傾斜一致（避免閃爍）
 */
export function BulletinToolGrid({ tools, highlightedToolId = null, resetKey = '' }: Props) {
  const [limit, setLimit] = useState(BATCH);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLimit(BATCH);
  }, [resetKey]);

  const highlightIndex = highlightedToolId === null ? -1 : tools.findIndex((t) => t.id === highlightedToolId);
  // 被定位撐開的張數寫回 limit（只增不減）：否則即時點擊數重排、目標名次往前移時，
  // 下方幾十張卡會被拆掉、頁面瞬間變短，捲動位置被拉走（實測跳離目標卡 5000px）。
  useEffect(() => {
    if (highlightIndex + 1 > limit) setLimit(highlightIndex + 1);
  }, [highlightIndex, limit]);
  const renderCount = Math.min(tools.length, Math.max(limit, highlightIndex + 1));
  const hasMore = renderCount < tools.length;

  // 每次 renderCount 變動都重新 observe：observe() 會立刻回報一次目前狀態，
  // 補完一批後哨兵若仍在範圍內（快速捲動、大螢幕）就會接著補，不會卡住。
  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setLimit(tools.length);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setLimit((n) => Math.max(n, renderCount) + BATCH);
      },
      { rootMargin: `0px 0px ${LOAD_AHEAD} 0px` },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, renderCount, tools.length]);

  const visibleTools = tools.slice(0, renderCount);

  // 推薦定位的醒目期間，即時點擊數讓卡片重新排序 → 目標卡被移出畫面（舊版全量渲染時就有此問題）。
  // 排序變動時若目標已不在視窗內，就把它拉回中央。只處理「定位之後」的重排，
  // 定位當下的平滑捲動仍交給 BulletinHome 的 locateRecommendedTool。
  const orderKey = visibleTools.map((t) => t.id).join(',');
  const prevRef = useRef({ orderKey, highlightedToolId });
  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = { orderKey, highlightedToolId };
    if (highlightedToolId === null || prev.highlightedToolId !== highlightedToolId || prev.orderKey === orderKey) return;
    const raf = requestAnimationFrame(() => {
      const card = document.querySelector<HTMLElement>(`.bulletin-tool-card[data-tool-id="${highlightedToolId}"]`);
      if (!card) return;
      const b = card.getBoundingClientRect();
      if (b.top < 0 || b.bottom > window.innerHeight) card.scrollIntoView({ block: 'center', behavior: 'auto' });
    });
    return () => cancelAnimationFrame(raf);
  }, [orderKey, highlightedToolId]);

  // 依 ID 計算穩定的傾斜角度 (-3 ~ +3 度)
  const cardVariants = useMemo(() => {
    return visibleTools.map((t) => ({
      tilt: (((t.id * 37) % 61) - 30) / 10,
      pinColorIndex: t.id % 6,
    }));
  }, [visibleTools]);

  if (tools.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '80px 20px',
          color: '#8b7356',
          fontSize: 16,
          fontStyle: 'italic',
        }}
      >
        📌 公佈欄上還沒有符合條件的工具
      </div>
    );
  }

  return (
    <>
      <div
        className={`bulletin-tool-grid${highlightedToolId !== null ? ' is-spotlighting' : ''}`}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: 28,
          padding: '20px 60px 60px',
          // 捲動對齊時保留上方呼吸空間，避免被固定在頂部的木條貼邊
          scrollMarginTop: 40,
        }}
        data-tour="tools-grid"
      >
        {visibleTools.map((tool, i) => (
          <BulletinToolCard
            key={tool.id}
            tool={tool}
            highlighted={tool.id === highlightedToolId}
            tilt={cardVariants[i]?.tilt ?? 0}
            pinColorIndex={cardVariants[i]?.pinColorIndex ?? 0}
          />
        ))}
      </div>
      {hasMore && (
        <div
          ref={sentinelRef}
          data-testid="tool-grid-more"
          style={{
            textAlign: 'center',
            padding: '0 20px 48px',
            color: '#8b7356',
            fontSize: 14,
            fontStyle: 'italic',
          }}
        >
          📌 還有 {tools.length - renderCount} 個工具，繼續往下捲就會釘上來…
        </div>
      )}
    </>
  );
}
