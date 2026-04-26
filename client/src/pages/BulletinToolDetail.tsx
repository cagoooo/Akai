/**
 * BulletinToolDetail — E2 公佈欄版工具詳情頁
 *
 * 整合策略：
 * - 保留所有既有功能（收藏、分享、複製、追蹤、評論、統計、相關推薦）
 * - 視覺改為 cork / 拍立得 / 便利貼風格
 * - 與 BulletinHome 共用 primitives（Pin / Tape / Stamp / HeartBurst）
 */

import { useParams, Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { useMemo, useState } from 'react';

import { type EducationalTool } from '@/lib/data';
import { getToolStats, trackToolUsage } from '@/lib/firestoreService';
import { useFavorites } from '@/hooks/useFavorites';
import { useRecentTools } from '@/hooks/useRecentTools';
import { useAchievements } from '@/hooks/useAchievements';
import { isInAppBrowser } from '@/lib/browserDetection';
import { useToast } from '@/hooks/use-toast';

import { BulletinBoard } from '@/components/bulletin/BulletinBoard';
import { BulletinFooter } from '@/components/bulletin/BulletinFooter';
import { Pin } from '@/components/primitives/Pin';
import { Tape } from '@/components/primitives/Tape';
import { Stamp } from '@/components/primitives/Stamp';
import { HeartBurst } from '@/components/primitives/HeartBurst';
import { shade } from '@/components/primitives/shade';
import { tokens } from '@/design/tokens';
import { getToolEmoji, getCategoryLabel, getCategoryKey, normalizeUrl } from '@/components/bulletin/toolAdapter';
import { OptimizedIcon } from '@/components/OptimizedIcons';
import { ReviewList } from '@/components/ReviewList';

// ── NotFound：cork 風格 ───────────────────────────────
function NotFound() {
  const [, navigate] = useLocation();
  return (
    <BulletinBoard>
      <section style={{ padding: '80px 60px', textAlign: 'center', fontFamily: tokens.font.tc }}>
        <div
          className="sticker-card"
          style={{
            maxWidth: 460,
            margin: '0 auto',
            background: tokens.paper,
            padding: '40px 30px',
            transform: 'rotate(-1deg)',
            boxShadow: '0 3px 5px rgba(0,0,0,.18), 0 16px 26px -8px rgba(0,0,0,.28)',
            border: '1px solid #d8d4c8',
            position: 'relative',
          }}
        >
          <Pin color={tokens.red} size={22} style={{ top: -11, left: '50%', marginLeft: -11 }} />
          <div style={{ fontSize: 72, marginBottom: 16 }}>🔍</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: tokens.ink, margin: '0 0 10px' }}>
            找不到這張拍立得
          </h1>
          <p style={{ fontSize: 14, color: tokens.muted2, lineHeight: 1.6, margin: '0 0 24px' }}>
            這張卡片可能被撕下來了，或是工具搬家囉。
            <br />
            回到公佈欄看看其他精彩工具吧！
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              background: tokens.navy,
              color: '#fff',
              border: '2.5px solid #1a1a1a',
              padding: '12px 24px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: tokens.font.tc,
              boxShadow: '3px 3px 0 rgba(0,0,0,.4)',
            }}
          >
            ← 返回公佈欄
          </button>
        </div>
      </section>
      <BulletinFooter />
    </BulletinBoard>
  );
}

// ── 骨架：cork 風格 ───────────────────────────────────
function ToolDetailSkeleton() {
  return (
    <BulletinBoard>
      <div style={{ padding: '60px', textAlign: 'center', color: tokens.muted, fontStyle: 'italic' }}>
        📌 正在把這張卡片從公佈欄取下來…
      </div>
    </BulletinBoard>
  );
}

// ── 相關推薦（Mini 拍立得） ───────────────────────────
function RelatedTools({ currentTool, tools }: { currentTool: EducationalTool; tools: EducationalTool[] }) {
  const related = tools
    .filter((t) => t.category === currentTool.category && t.id !== currentTool.id)
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <section style={{ padding: '20px 60px 30px' }} className="bulletin-related">
      <div style={{ marginBottom: 20 }}>
        <Tape color={tokens.note.pink} angle={-2} width={200}>
          <span style={{ fontSize: 14 }}>✨ 相關推薦 · SIMILAR</span>
        </Tape>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 20,
        }}
        className="bulletin-related-grid"
      >
        {related.map((tool, i) => {
          const catKey = getCategoryKey(tool.category);
          const C = tokens.cat[catKey];
          const tilt = (((tool.id * 23) % 41) - 20) / 10;
          const pinColor = tokens.pin[i % tokens.pin.length];
          const previewSrc = tool.previewUrl
            ? `${import.meta.env.BASE_URL}previews/${tool.previewUrl.split('/').pop()}`
            : null;

          return (
            <Link key={tool.id} href={`/tool/${tool.id}`}>
              <a
                className="sticker-card"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                style={{
                  display: 'block',
                  background: tokens.paper,
                  padding: '10px 10px 14px',
                  boxShadow: '0 3px 5px rgba(0,0,0,.18), 0 12px 20px -8px rgba(0,0,0,.22)',
                  transform: `rotate(${tilt}deg)`,
                  border: '1px solid #d8d4c8',
                  textDecoration: 'none',
                  position: 'relative',
                }}
              >
                <Pin color={pinColor} size={16} style={{ top: -8, left: '50%', marginLeft: -8 }} />
                <div
                  style={{
                    aspectRatio: '5/4',
                    background: C.bg,
                    display: 'grid',
                    placeItems: 'center',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  {previewSrc ? (
                    <img
                      src={previewSrc}
                      alt={tool.title}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        const img = e.currentTarget;
                        img.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div style={{ fontSize: 48 }}>{getToolEmoji(tool)}</div>
                  )}
                </div>
                <div style={{ marginTop: 8, padding: '0 2px' }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      fontStyle: 'italic',
                      color: tokens.ink,
                      fontFamily: tokens.font.tc,
                      lineHeight: 1.3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {tool.title}
                  </div>
                </div>
              </a>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// ── 主要頁面 ────────────────────────────────────────────
export function BulletinToolDetail() {
  const params = useParams<{ id: string }>();
  const toolId = parseInt(params.id || '0');
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const inAppBrowser = useMemo(() => isInAppBrowser(), []);

  const [heartTrigger, setHeartTrigger] = useState(0);
  const [stampTrigger, setStampTrigger] = useState(0);

  // 取得工具資料
  const { data: allTools, isLoading: toolsLoading } = useQuery({
    queryKey: ['/api/tools'],
    queryFn: async () => {
      const staticUrl = `${import.meta.env.BASE_URL}api/tools.json`;
      const staticResponse = await fetch(staticUrl);
      if (staticResponse.ok) return (await staticResponse.json()) as EducationalTool[];
      const response = await fetch('/api/tools');
      if (response.ok) return (await response.json()) as EducationalTool[];
      throw new Error('無法獲取工具數據');
    },
    staleTime: 300000,
  });

  const tool = useMemo(() => allTools?.find((t) => t.id === toolId) || null, [allTools, toolId]);

  // 整合現有 hooks
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToRecent } = useRecentTools();
  const { trackToolUsage: trackAchievement } = useAchievements();

  // 統計（Firestore）
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['toolStats', toolId],
    queryFn: () => getToolStats(toolId),
    enabled: !!tool,
  });

  if (toolsLoading) return <ToolDetailSkeleton />;
  if (!tool) return <NotFound />;

  const catKey = getCategoryKey(tool.category);
  const C = tokens.cat[catKey];
  const categoryLabel = getCategoryLabel(tool.category);
  const emoji = getToolEmoji(tool);
  const isFav = isFavorite(toolId);
  const previewSrc = tool.previewUrl
    ? `${import.meta.env.BASE_URL}previews/${tool.previewUrl.split('/').pop()}`
    : null;

  // ── 行為函式 ─────────────────────────────────────
  const handleUseTool = () => {
    trackToolUsage(tool.id).catch(console.error);
    addToRecent(tool.id);
    trackAchievement(tool.id, tool.category);
    setStampTrigger((t) => t + 1);

    const openUrl = normalizeUrl(tool.url);
    setTimeout(() => {
      if (inAppBrowser) {
        window.location.href = openUrl;
      } else {
        const link = document.createElement('a');
        link.href = openUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: '已開啟工具', description: tool.title });
      }
    }, 400);
  };

  const handleToggleFav = () => {
    toggleFavorite(toolId);
    if (!isFav) setHeartTrigger((t) => t + 1);
  };

  const handleCopyLink = async () => {
    try {
      const shareUrl = `${window.location.origin}${window.location.pathname}`;
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: '已複製連結 🔗', description: '工具詳情頁連結已複製到剪貼簿' });
    } catch (err) {
      console.error('複製失敗:', err);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}`;
    const shareData = { title: tool.title, text: tool.description, url: shareUrl };
    const isMobile = 'ontouchstart' in window && window.innerWidth < 768;
    if (isMobile && navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err: any) {
        if (err.name !== 'AbortError') handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <>
      <Helmet>
        <title>{tool.title} - 阿凱老師教育工具</title>
        <meta name="description" content={tool.description} />
        <meta property="og:title" content={`${tool.title} - 阿凱老師教育工具`} />
        <meta property="og:description" content={tool.description} />
        {previewSrc && <meta property="og:image" content={previewSrc} />}
      </Helmet>

      <BulletinBoard>
        {/* 頂部導覽列（cork 上的膠帶） */}
        <header
          className="bulletin-detail-nav"
          style={{
            padding: '40px 60px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={() => navigate('/')}
            aria-label="返回公佈欄首頁"
            style={{
              background: tokens.paper,
              color: tokens.ink,
              border: '2.5px solid #1a1a1a',
              padding: '10px 18px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: tokens.font.tc,
              boxShadow: '3px 3px 0 rgba(0,0,0,.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              transition: 'transform .15s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translate(-2px, -2px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '5px 5px 0 rgba(0,0,0,.3)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = '';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '3px 3px 0 rgba(0,0,0,.3)';
            }}
          >
            ← 返回公佈欄
          </button>

          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={handleToggleFav}
              aria-label={isFav ? '取消收藏' : '加入收藏'}
              aria-pressed={isFav}
              style={{
                background: isFav ? '#ffd4d9' : tokens.paper,
                color: tokens.ink,
                border: '2.5px solid #1a1a1a',
                padding: '10px 18px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: tokens.font.tc,
                boxShadow: '3px 3px 0 rgba(0,0,0,.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ fontSize: 18 }}>{isFav ? '💖' : '♡'}</span>
              {isFav ? '已收藏' : '收藏工具'}
            </button>
            <HeartBurst trigger={heartTrigger} />
          </div>
        </header>

        {/* Hero 大拍立得 + 右側資訊卡 */}
        <section
          className="bulletin-detail-hero"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 40,
            padding: '20px 60px 40px',
            alignItems: 'start',
          }}
        >
          {/* 大拍立得 */}
          <div style={{ position: 'relative', justifySelf: 'center', maxWidth: 500 }}>
            <div
              style={{
                background: tokens.paper,
                padding: '20px 20px 36px',
                boxShadow:
                  '0 5px 10px rgba(0,0,0,.2), 0 20px 40px -10px rgba(0,0,0,.28), 0 40px 60px -30px rgba(0,0,0,.22)',
                transform: 'rotate(-1.5deg)',
                border: '1px solid #d8d4c8',
                position: 'relative',
              }}
            >
              <Pin color={tokens.red} size={24} style={{ top: -12, left: '50%', marginLeft: -12, zIndex: 10 }} />

              {/* 圖片區 */}
              <div
                style={{
                  aspectRatio: '5/4',
                  background: C.bg,
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                {previewSrc ? (
                  <img
                    src={previewSrc}
                    alt={tool.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      const img = e.currentTarget;
                      img.style.display = 'none';
                    }}
                  />
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 112 }}>{emoji}</div>
                    {tool.icon && (
                      <div style={{ color: C.fg, marginTop: 8 }}>
                        <OptimizedIcon name={tool.icon} size={32} />
                      </div>
                    )}
                  </div>
                )}

                {/* 分類膠帶 */}
                <div style={{ position: 'absolute', top: -2, left: -6 }}>
                  <Tape color={shade(C.bg, -15)} angle={-12} width={100}>
                    <span style={{ fontSize: 11, color: C.fg, fontWeight: 800 }}>
                      {categoryLabel}
                    </span>
                  </Tape>
                </div>

                {/* APPROVED 印章（固定顯示在右下） */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 14,
                    right: 14,
                    border: `3px solid ${tokens.red}`,
                    color: tokens.red,
                    padding: '4px 12px',
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: '0.15em',
                    borderRadius: 4,
                    fontFamily: tokens.font.en,
                    transform: 'rotate(-8deg)',
                    opacity: 0.85,
                    background: 'rgba(255,255,255,.7)',
                  }}
                >
                  APPROVED
                </div>

                <Stamp trigger={stampTrigger}>OPENED</Stamp>
              </div>

              {/* 拍立得底部 caption */}
              <div style={{ marginTop: 14, textAlign: 'center', fontFamily: tokens.font.tc }}>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    fontStyle: 'italic',
                    color: tokens.ink,
                    lineHeight: 1.3,
                  }}
                >
                  {tool.title}
                </div>
                <div style={{ fontSize: 11, color: tokens.muted, marginTop: 4, letterSpacing: '0.1em' }}>
                  #{tool.id.toString().padStart(3, '0')} · {categoryLabel}
                </div>
              </div>
            </div>
          </div>

          {/* 右側：標題 + 描述 + 按鈕 */}
          <div>
            {/* 標題膠帶 */}
            <div style={{ marginBottom: 16 }}>
              <Tape color={tokens.note.yellowBright} angle={-2} width={200}>
                <span style={{ fontSize: 13 }}>📌 工具詳情 · TOOL</span>
              </Tape>
            </div>

            <h1
              style={{
                fontSize: 'clamp(28px, 3.5vw, 44px)',
                fontWeight: 900,
                color: tokens.ink,
                lineHeight: 1.15,
                margin: 0,
                fontFamily: tokens.font.tc,
                letterSpacing: '-0.02em',
              }}
            >
              {tool.title}
            </h1>

            {/* 點擊統計徽章 */}
            {stats && stats.totalClicks > 0 && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: 16,
                  padding: '8px 16px',
                  background: tokens.accent,
                  color: '#fff',
                  border: '2px solid #1a1a1a',
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 800,
                  fontFamily: tokens.font.tc,
                  boxShadow: '2px 2px 0 rgba(0,0,0,.3)',
                  transform: 'rotate(-1deg)',
                }}
              >
                🔥 已被使用 {stats.totalClicks.toLocaleString()} 次
              </div>
            )}

            {/* 描述（白底便條） */}
            <div
              style={{
                marginTop: 24,
                background: 'rgba(255,255,255,.92)',
                padding: '18px 22px',
                borderLeft: `5px solid ${tokens.accent}`,
                fontFamily: tokens.font.tc,
                fontSize: 16,
                color: '#2a2a2a',
                lineHeight: 1.75,
                boxShadow: '2px 2px 0 rgba(0,0,0,.12)',
              }}
            >
              {tool.detailedDescription || tool.description}
            </div>

            {/* 標籤 */}
            {tool.tags && tool.tags.length > 0 && (
              <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {tool.tags.map((tag, i) => (
                  <span
                    key={tag}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '5px 11px',
                      background: tokens.note[
                        ['yellow', 'blue', 'pink', 'green', 'orange'][i % 5] as 'yellow'
                      ],
                      color: tokens.muted2,
                      fontSize: 11.5,
                      fontWeight: 700,
                      fontFamily: tokens.font.tc,
                      borderRadius: 6,
                      border: '1px solid rgba(0,0,0,.15)',
                      boxShadow: '1px 1px 0 rgba(0,0,0,.15)',
                      transform: `rotate(${(i % 3 - 1) * 1.2}deg)`,
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* 行動按鈕 */}
            <div
              className="bulletin-detail-actions"
              style={{ marginTop: 28, display: 'flex', gap: 10, flexWrap: 'wrap' }}
            >
              <button
                type="button"
                onClick={handleUseTool}
                style={{
                  background: tokens.accent,
                  color: '#fff',
                  border: '2.5px solid #1a1a1a',
                  padding: '14px 26px',
                  borderRadius: 10,
                  fontSize: 16,
                  fontWeight: 900,
                  cursor: 'pointer',
                  fontFamily: tokens.font.tc,
                  boxShadow: '4px 4px 0 rgba(0,0,0,.4)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                ⚡ 立即使用
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                style={{
                  background: tokens.paper,
                  color: tokens.ink,
                  border: '2.5px solid #1a1a1a',
                  padding: '14px 20px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: tokens.font.tc,
                  boxShadow: '3px 3px 0 rgba(0,0,0,.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                📋 複製連結
              </button>
              <button
                type="button"
                onClick={handleShare}
                style={{
                  background: tokens.paper,
                  color: tokens.ink,
                  border: '2.5px solid #1a1a1a',
                  padding: '14px 20px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: tokens.font.tc,
                  boxShadow: '3px 3px 0 rgba(0,0,0,.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                🔗 分享
              </button>
            </div>
          </div>
        </section>

        {/* 統計便利貼 */}
        {(stats || statsLoading) && (
          <section
            className="bulletin-detail-stats"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 20,
              padding: '10px 60px 30px',
              maxWidth: 720,
              margin: '0 auto',
            }}
          >
            <StatCard
              tilt={-1.5}
              pinColor={tokens.pin[0]}
              bg={tokens.note.blue}
              emoji="✨"
              label="累計使用"
              value={stats ? stats.totalClicks.toLocaleString() : '—'}
              subtitle="次被點開"
            />
            <StatCard
              tilt={1.2}
              pinColor={tokens.pin[2]}
              bg={tokens.note.green}
              emoji="🕐"
              label="最後使用"
              value={
                stats?.lastUsedAt
                  ? new Date(stats.lastUsedAt.toDate?.() ?? stats.lastUsedAt).toLocaleDateString('zh-TW')
                  : '尚無紀錄'
              }
              subtitle="最近一次點擊"
            />
          </section>
        )}

        {/* 麵包屑（膠帶風格） */}
        <section
          className="bulletin-detail-breadcrumb"
          style={{
            padding: '0 60px 20px',
            fontFamily: tokens.font.tc,
            fontSize: 13,
            color: tokens.muted2,
          }}
        >
          <Link href="/">
            <a style={{ color: tokens.navy, textDecoration: 'underline', fontWeight: 700 }}>
              🏠 公佈欄首頁
            </a>
          </Link>
          <span style={{ margin: '0 10px', opacity: 0.5 }}>→</span>
          <span>{categoryLabel}</span>
          <span style={{ margin: '0 10px', opacity: 0.5 }}>→</span>
          <span style={{ color: tokens.ink, fontWeight: 800 }}>{tool.title}</span>
        </section>

        {/* 評論區（包在白底卡片裡） */}
        <section
          className="bulletin-detail-reviews"
          style={{
            background: 'rgba(255,255,255,.92)',
            border: '2.5px solid #1a1a1a',
            borderRadius: 16,
            padding: '24px 28px',
            margin: '10px 60px 40px',
            boxShadow: '4px 4px 0 rgba(0,0,0,.25)',
            position: 'relative',
          }}
        >
          <Pin color={tokens.pin[4]} size={18} style={{ top: -9, left: 30 }} />
          <Pin color={tokens.pin[1]} size={18} style={{ top: -9, right: 30 }} />
          <div style={{ marginBottom: 16 }}>
            <Tape color={tokens.note.pink} angle={-1.5} width={180}>
              <span style={{ fontSize: 13 }}>💬 使用者評論 · REVIEWS</span>
            </Tape>
          </div>
          <ReviewList toolId={tool.id} toolTitle={tool.title} />
        </section>

        {/* 相關推薦 */}
        <RelatedTools currentTool={tool} tools={allTools || []} />

        <BulletinFooter />
      </BulletinBoard>
    </>
  );
}

// ── 統計便利貼子元件 ─────────────────────────────────
interface StatCardProps {
  tilt: number;
  pinColor: string;
  bg: string;
  emoji: string;
  label: string;
  value: string;
  subtitle: string;
}

function StatCard({ tilt, pinColor, bg, emoji, label, value, subtitle }: StatCardProps) {
  return (
    <div
      className="sticker-card"
      style={{
        background: bg,
        padding: '18px 20px',
        borderRadius: 8,
        transform: `rotate(${tilt}deg)`,
        boxShadow: '0 2px 3px rgba(0,0,0,.14), 4px 4px 0 rgba(0,0,0,.18)',
        position: 'relative',
        textAlign: 'center',
        fontFamily: tokens.font.tc,
      }}
    >
      <Pin color={pinColor} size={16} style={{ top: -8, left: '50%', marginLeft: -8 }} />
      <div style={{ fontSize: 36, marginBottom: 4 }}>{emoji}</div>
      <div
        style={{
          fontSize: 11,
          color: tokens.muted2,
          letterSpacing: '0.15em',
          fontWeight: 700,
          fontFamily: tokens.font.en,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 900,
          color: tokens.ink,
          marginTop: 4,
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11, color: tokens.muted2, marginTop: 2 }}>{subtitle}</div>
    </div>
  );
}

export default BulletinToolDetail;
