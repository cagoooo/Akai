import { useState } from 'react';
import { Link } from 'wouter';
import { Pin } from '@/components/primitives/Pin';
import { Tape } from '@/components/primitives/Tape';
import { Stamp } from '@/components/primitives/Stamp';
import { HeartBurst } from '@/components/primitives/HeartBurst';
import { shade } from '@/components/primitives/shade';
import { tokens } from '@/design/tokens';
import { OptimizedIcon } from '@/components/OptimizedIcons';
import { useFavorites } from '@/hooks/useFavorites';
import { useToolTracking } from '@/hooks/useToolTracking';
import { getToolEmoji, getCategoryLabel, getCategoryKey, normalizeUrl } from './toolAdapter';
import { notifyEngagementAfterHomeEntry, trackEvent } from '@/lib/analytics';
import { getBlogPostPath, getPrimaryBlogPostForTool } from '@/lib/blogLinks';
import type { EducationalTool } from '@/lib/data';

interface Props {
  tool: EducationalTool;
  tilt?: number;
  pinColorIndex?: number;
  highlighted?: boolean;
}

/**
 * 拍立得風格工具卡（整合版）
 * 保留視覺設計，但使用真實的收藏雲端同步與點擊追蹤
 */
export function BulletinToolCard({ tool, tilt = 0, pinColorIndex = 0, highlighted = false }: Props) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { trackToolUsage } = useToolTracking();

  const [heartTrigger, setHeartTrigger] = useState(0);
  const [stampTrigger, setStampTrigger] = useState(0);

  const catKey = getCategoryKey(tool.category);
  const C = tokens.cat[catKey];
  const pinColor = tokens.pin[pinColorIndex % tokens.pin.length];
  const emoji = getToolEmoji(tool);
  const categoryLabel = getCategoryLabel(tool.category);
  const isFav = isFavorite(tool.id);
  const totalClicks = tool.totalClicks ?? 0;
  const blogPost = getPrimaryBlogPostForTool(tool.id);

  // 「🆕 新工具」判斷：addedAt 在 7 天內為新；未設 addedAt 的歷史工具不算新
  const isNew = (() => {
    if (!tool.addedAt) return false;
    const ageMs = Date.now() - new Date(tool.addedAt).getTime();
    return ageMs >= 0 && ageMs < 7 * 24 * 60 * 60 * 1000;
  })();

  // 處理 previewUrl：從 '/previews/tool_1.webp' 轉為 BASE_URL + 'previews/tool_1.webp'
  // 以便在 GitHub Pages 子路徑 (/Akai/) 下也能正確載入
  const previewSrc = tool.previewUrl
    ? `${import.meta.env.BASE_URL}previews/${tool.previewUrl.split('/').pop()}`
    : null;

  const handleToggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleFavorite(tool.id);
    if (!isFav) setHeartTrigger((t) => t + 1);
  };

  const handleOpen = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setStampTrigger((t) => t + 1);
    trackToolUsage(tool.id);
    // GA 事件上報：可在 GA Realtime / Events 看點擊路徑
    trackEvent('tool_click', {
      tool_id: tool.id,
      tool_title: tool.title,
      tool_category: tool.category,
      source: 'home_grid',
    });
    notifyEngagementAfterHomeEntry({
      type: 'tool_click',
      toolId: tool.id,
      toolTitle: tool.title,
      toolCategory: tool.category,
      targetUrl: normalizeUrl(tool.url),
      source: 'home_grid',
    });
    // 延遲 0.4 秒讓 OPENED 印章動畫有機會播放
    setTimeout(() => {
      window.open(normalizeUrl(tool.url), '_blank', 'noopener,noreferrer');
    }, 400);
  };

  const handleOpenDetail = () => {
    notifyEngagementAfterHomeEntry({
      type: 'tool_click',
      toolId: tool.id,
      toolTitle: tool.title,
      toolCategory: tool.category,
      targetUrl: `${window.location.origin}${import.meta.env.BASE_URL}tool/${tool.id}`,
      source: 'home_card_detail',
    });
  };

  return (
    <article
      className={`sticker-card bulletin-tool-card${highlighted ? ' audience-tool-highlight' : ''}`}
      data-tool-id={tool.id}
      data-testid="tool-card"
      tabIndex={-1}
      aria-label={tool.title}
      role="article"
      style={{
        position: 'relative',
        background: '#fefdfa',
        padding: '16px 16px 22px',
        boxShadow:
          '0 3px 5px rgba(0,0,0,.18), 0 16px 26px -8px rgba(0,0,0,.28), 0 30px 50px -20px rgba(0,0,0,.22)',
        // 透過 CSS 變數讓 media query 可以覆寫（手機版減半/歸零傾斜角）
        ['--tilt' as string]: `${tilt}deg`,
        transform: `rotate(${tilt}deg)`,
        border: '1px solid #d8d4c8',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        transition: 'transform .25s ease',
      } as React.CSSProperties}
    >
      <Pin color={pinColor} size={22} style={{ top: -11, left: '50%', marginLeft: -11, zIndex: 10 }} />
      {highlighted && <span className="audience-tool-highlight__label" role="status">📍 你正在找的推薦工具</span>}

      {/* 照片區（預覽圖優先，無圖時退回 emoji + icon） */}
      <Link href={`/tool/${tool.id}`}>
        <a
          onClick={handleOpenDetail}
          style={{
            aspectRatio: '5/4',
            background: C.bg,
            display: 'grid',
            placeItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          {previewSrc ? (
            <img
              src={previewSrc}
              alt={tool.title}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              width={400}
              height={320}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
              onError={(e) => {
                // 預覽圖載入失敗 → 退回顯示 emoji
                const img = e.currentTarget;
                const parent = img.parentElement;
                if (!parent) return;
                img.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.style.fontSize = '64px';
                fallback.textContent = emoji;
                parent.insertBefore(fallback, img);
              }}
            />
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <div style={{ fontSize: 64 }}>{emoji}</div>
              {tool.icon && (
                <div style={{ color: C.fg, opacity: 0.7 }}>
                  <OptimizedIcon name={tool.icon} size={20} />
                </div>
              )}
            </div>
          )}

          {/* 分類膠帶（絕對定位，不管有沒有預覽圖都在左上角） */}
          <div style={{ position: 'absolute', top: -2, left: -4, zIndex: 3 }}>
            <Tape color={shade(C.bg, -15)} angle={-18} width={80}>
              <span style={{ fontSize: 10, color: C.fg }}>{categoryLabel}</span>
            </Tape>
          </div>

          {/* 🆕 新工具徽章（7 天內新增）— 右上角紅色 chip + 微動畫 */}
          {isNew && (
            <div
              style={{
                position: 'absolute',
                top: 6,
                right: 6,
                zIndex: 4,
                background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                color: '#fff',
                fontSize: 10,
                fontWeight: 900,
                padding: '3px 8px',
                borderRadius: 999,
                border: '1.5px solid #1a1a1a',
                boxShadow: '2px 2px 0 rgba(0,0,0,.28)',
                fontFamily: tokens.font.tc,
                letterSpacing: '0.05em',
                transform: 'rotate(6deg)',
                animation: 'float1 2.4s ease-in-out infinite',
                pointerEvents: 'none',
              }}
              aria-label="新工具（7 天內加入）"
              title="7 天內新增的工具"
            >
              🆕 NEW
            </div>
          )}

          {/* ✨ PRO 升級版徽章 — 標示此工具是另一款舊版工具的進階版 */}
          {tool.upgradeFromId != null && (
            <div
              style={{
                position: 'absolute',
                top: isNew ? 34 : 6,
                right: 6,
                zIndex: 4,
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                color: '#fff',
                fontSize: 10,
                fontWeight: 900,
                padding: '3px 8px',
                borderRadius: 999,
                border: '1.5px solid #1a1a1a',
                boxShadow: '2px 2px 0 rgba(0,0,0,.28)',
                fontFamily: tokens.font.tc,
                letterSpacing: '0.05em',
                transform: 'rotate(-5deg)',
                pointerEvents: 'none',
              }}
              aria-label="Pro 升級版"
              title="這是升級版，功能比舊版更完整"
            >
              ✨ PRO 升級版
            </div>
          )}

          {/* 右下角閃星星（預覽圖上也要可見，加陰影） */}
          <div
            style={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              fontSize: 20,
              animation: 'float1 3s ease-in-out infinite',
              filter: previewSrc ? 'drop-shadow(0 2px 4px rgba(0,0,0,.5))' : 'none',
              zIndex: 3,
              ['--r' as string]: `${tilt * 2}deg`,
            } as React.CSSProperties}
          >
            ✨
          </div>

          <Stamp trigger={stampTrigger}>OPENED</Stamp>
        </a>
      </Link>

      {/* Caption */}
      <div style={{ padding: '0 4px', fontFamily: tokens.font.tc }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 800,
            fontStyle: 'italic',
            marginBottom: 4,
            lineHeight: 1.3,
            color: tokens.ink,
          }}
        >
          {tool.title}
        </div>
        <div
          style={{
            fontSize: 12,
            color: '#555',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden',
          }}
        >
          {tool.description}
        </div>
        {blogPost && (
          <Link
            href={getBlogPostPath(blogPost)}
            onClick={(e) => e.stopPropagation()}
            aria-label={`閱讀 ${tool.title} 的詳細文章介紹`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              marginTop: 8,
              padding: '5px 8px',
              borderRadius: 8,
              border: '1px solid #d8c5a0',
              background: '#fff8e7',
              color: '#7a4b12',
              fontSize: 12,
              fontWeight: 800,
              textDecoration: 'none',
              boxShadow: '1px 1px 0 rgba(26,26,26,.18)',
            }}
          >
            <OptimizedIcon name="BookOpen" size={14} />
            閱讀文章
          </Link>
        )}
        {tool.upgradeToId != null && (
          <Link
            href={`/tool/${tool.upgradeToId}`}
            onClick={(e) => e.stopPropagation()}
            aria-label={`前往 ${tool.title} 的 Pro 升級版`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              marginTop: 8,
              padding: '5px 8px',
              borderRadius: 8,
              border: '1px solid #6d28d9',
              background: '#f3ebff',
              color: '#5b21b6',
              fontSize: 12,
              fontWeight: 800,
              textDecoration: 'none',
              boxShadow: '1px 1px 0 rgba(26,26,26,.18)',
            }}
          >
            🚀 已推出 Pro 版，功能更完整 →
          </Link>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 4px',
          marginTop: 2,
        }}
      >
        <div style={{ fontSize: 11, color: '#8b7356', fontFamily: tokens.font.en }}>
          👆 {totalClicks.toLocaleString()}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={handleToggleFav}
              aria-label={isFav ? '取消收藏' : '加入收藏'}
              aria-pressed={isFav}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: '2px solid #1a1a1a',
                background: isFav ? '#ffd4d9' : '#fff',
                cursor: 'pointer',
                fontSize: 14,
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              }}
            >
              {isFav ? '💖' : '♡'}
            </button>
            <HeartBurst trigger={heartTrigger} />
          </div>
          <button
            type="button"
            onClick={handleOpen}
            aria-label={`開啟 ${tool.title}`}
            style={{
              background: '#1a1a1a',
              color: '#fff',
              border: 'none',
              padding: '5px 12px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            開啟 →
          </button>
        </div>
      </div>
    </article>
  );
}
