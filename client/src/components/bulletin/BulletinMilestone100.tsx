/**
 * BulletinMilestone100 — 破百倒數 / 達成慶祝 頂部頻帶
 *
 * 兩狀態自動切換（讀 /api/site-stats.json）：
 *   1. N < 100 →「破百倒數 X 個」橘色便利貼 + 進度條 + 「許願下一個工具」CTA
 *   2. 100 ≤ N →「100 工具達成 🎉」金色膠帶 + 撒花 + 紀念影片 CTA，常駐顯示
 *      （「慶祝第 N 天」小徽章只在達成後 30 天內出現，之後自動收起）
 *
 * 用法：在 BulletinHome 的 BulletinHero 上方插入 <BulletinMilestone100 />
 */

import { useEffect, useState, useRef } from 'react';
import { tokens } from '@/design/tokens';
import { Tape } from '@/components/primitives/Tape';
import { Pin } from '@/components/primitives/Pin';
import { ConfettiBurst } from '@/components/primitives/ConfettiBurst';
import { useIsMobile } from '@/hooks/use-mobile';

// CelebrationBanner 內 emoji bouncing keyframes（confetti 動畫已移到 primitives/ConfettiBurst）
const CHEER_STYLE_ID = 'akai-cheer-keyframes';
function ensureCheerStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(CHEER_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = CHEER_STYLE_ID;
  style.textContent = `
    @keyframes akai-cheer-bounce {
      0%, 100% { transform: translateY(0) rotate(-8deg); }
      50%      { transform: translateY(-6px) rotate(8deg); }
    }
    @keyframes akai-cheer-bounce-r {
      0%, 100% { transform: translateY(0) rotate(8deg); }
      50%      { transform: translateY(-6px) rotate(-8deg); }
    }
    @media (prefers-reduced-motion: reduce) {
      .akai-cheer-emoji { animation: none !important; }
    }
  `;
  document.head.appendChild(style);
}

interface SiteStats {
  toolCount: number;
  displayCount?: string;
  categoryCounts?: Record<string, number>;
  milestones?: Record<string, string>;
  ogImage?: string;
}

const CELEBRATION_DAYS = 30; // 達成後幾天內顯示金色慶祝（原 7 天，2026-06-04 延長為 30 天，讓慶祝橫幅 + 兩支紀念影片入口多留一陣子）
const PROGRESS_TARGET = 100;

function daysBetween(isoA: string, isoB: string | Date): number {
  const a = new Date(isoA).getTime();
  const b = typeof isoB === 'string' ? new Date(isoB).getTime() : isoB.getTime();
  return Math.floor((b - a) / 86400000);
}

export function BulletinMilestone100({
  onWishClick,
}: {
  /** 「許願下一個工具」按鈕點擊回呼（連到許願池） */
  onWishClick?: () => void;
}) {
  const [stats, setStats] = useState<SiteStats | null>(null);

  useEffect(() => {
    const base = import.meta.env.BASE_URL || '/';
    const version = import.meta.env.VITE_APP_VERSION || Date.now();
    fetch(`${base}api/site-stats.json?v=${version}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: SiteStats | null) => setStats(data))
      .catch(() => setStats(null));
  }, []);

  if (!stats) return null;

  const { toolCount, milestones } = stats;
  const tool100At = milestones?.tool100;
  const remaining = Math.max(0, PROGRESS_TARGET - toolCount);

  // 狀態 1：倒數中
  if (toolCount < PROGRESS_TARGET) {
    const percent = Math.round((toolCount / PROGRESS_TARGET) * 100);
    return (
      <CountdownBanner
        remaining={remaining}
        current={toolCount}
        percent={percent}
        onWishClick={onWishClick}
      />
    );
  }

  // 狀態 2：已達成 — 慶祝橫幅常駐（2026-07-02 拆掉 30 天落日條款，儀式感要一直在！
  // 「慶祝第 N 天」小徽章仍只在前 CELEBRATION_DAYS 天顯示，之後自動收起）
  if (tool100At) {
    const daysSince = daysBetween(tool100At, new Date());
    return <CelebrationBanner achievedAt={tool100At} daysSince={daysSince} />;
  }

  // 已達 100 但沒記錄達成日（資料異常 fallback）— 顯示一次慶祝
  return <CelebrationBanner achievedAt={new Date().toISOString()} daysSince={0} />;
}

// ── 子元件 1：倒數 banner ─────────────────────────────────────
function CountdownBanner({
  remaining,
  current,
  percent,
  onWishClick,
}: {
  remaining: number;
  current: number;
  percent: number;
  onWishClick?: () => void;
}) {
  return (
    <div
      data-testid="milestone-countdown"
      style={{
        position: 'relative',
        padding: '14px 60px 12px',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          position: 'relative',
          background: tokens.note.orange,
          border: `2px solid ${tokens.ink}`,
          borderRadius: 10,
          padding: '14px 26px 12px',
          boxShadow: '4px 5px 0 rgba(0,0,0,.22), 0 8px 18px -6px rgba(0,0,0,.18)',
          transform: 'rotate(-0.6deg)',
          maxWidth: 720,
          width: '100%',
          fontFamily: tokens.font.tc,
        }}
      >
        {/* 圖釘 — Pin 本身是 position:absolute，靠 style 把它定位到便利貼頂部正中 */}
        <Pin color={tokens.red} size={20} style={{ top: -10, left: '50%', marginLeft: -10 }} />


        {/* 標題列 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 8,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: tokens.ink, letterSpacing: '0.02em' }}>
              🚀 破百倒數
            </span>
            <span
              style={{
                fontSize: 32,
                fontWeight: 900,
                color: tokens.red,
                fontFamily: tokens.font.en,
                lineHeight: 1,
              }}
            >
              {remaining}
            </span>
            <span style={{ fontSize: 16, fontWeight: 700, color: tokens.muted2 }}>
              個就破百了！
            </span>
          </div>

          <button
            type="button"
            onClick={onWishClick}
            style={{
              padding: '6px 14px',
              background: tokens.accent,
              color: '#fff',
              border: `2px solid ${tokens.ink}`,
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 800,
              fontFamily: tokens.font.tc,
              cursor: 'pointer',
              boxShadow: '2px 2px 0 rgba(0,0,0,.25)',
              whiteSpace: 'nowrap',
            }}
            aria-label="許願下一個工具"
          >
            ✨ 許願下一個
          </button>
        </div>

        {/* 進度條 */}
        <div
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={PROGRESS_TARGET}
          style={{
            position: 'relative',
            height: 18,
            background: '#fff',
            border: `2px solid ${tokens.ink}`,
            borderRadius: 999,
            overflow: 'hidden',
            boxShadow: 'inset 2px 2px 0 rgba(0,0,0,.08)',
          }}
        >
          <div
            style={{
              width: `${percent}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${tokens.accent}, #f59e0b)`,
              transition: 'width 0.6s ease',
              boxShadow: 'inset 0 -2px 0 rgba(0,0,0,.12)',
            }}
          />
          {/* 進度條右側終點旗 */}
          <div
            style={{
              position: 'absolute',
              right: 4,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 12,
              fontWeight: 800,
              color: tokens.muted2,
            }}
          >
            🏁 100
          </div>
        </div>

        {/* 細節文字 */}
        <div
          style={{
            marginTop: 6,
            fontSize: 12,
            color: tokens.muted2,
            display: 'flex',
            justifyContent: 'space-between',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <span>
            目前進度：<strong style={{ color: tokens.ink }}>{current} / {PROGRESS_TARGET}</strong>（{percent}%）
          </span>
          <span style={{ fontStyle: 'italic' }}>第 100 個工具會有特別企劃，敬請期待 🎯</span>
        </div>
      </div>
    </div>
  );
}

// ── 子元件 2：慶祝 banner ─────────────────────────────────────
function CelebrationBanner({
  achievedAt,
  daysSince,
}: {
  achievedAt: string;
  daysSince: number;
}) {
  const dateStr = new Date(achievedAt).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const base = import.meta.env.BASE_URL || '/';
  const isMobile = useIsMobile();

  // 撒花觸發次數（每加 1 撒一次）
  const [confettiTick, setConfettiTick] = useState(0);
  const firedOnceRef = useRef(false);

  // 進場時撒一次（每次刷新都撒一次，慶祝期內氛圍要熱鬧）
  useEffect(() => {
    ensureCheerStyles();
    if (firedOnceRef.current) return;
    firedOnceRef.current = true;
    // 稍微延遲，等使用者看到 banner 後再撒
    const t = window.setTimeout(() => setConfettiTick((n) => n + 1), 250);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <>
      <ConfettiBurst trigger={confettiTick} />
      <div
        data-testid="milestone-celebration"
        style={{
          position: 'relative',
          padding: isMobile ? '14px 12px 10px' : '18px 60px 12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <a
          href={`${base}tool/100`}
          onMouseEnter={() => setConfettiTick((n) => n + 1)}
          onFocus={() => setConfettiTick((n) => n + 1)}
          style={{
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          <div
            style={{
              position: 'relative',
              transform: 'rotate(-1.5deg)',
              transition: 'transform 0.18s ease',
            }}
          >
            {/* 左側歡呼 emoji — 手機隱藏以防 overflow */}
            {!isMobile && (
              <span
                className="akai-cheer-emoji"
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: -34,
                  top: '50%',
                  marginTop: -16,
                  fontSize: 30,
                  animation: 'akai-cheer-bounce 1.4s ease-in-out infinite',
                  filter: 'drop-shadow(0 2px 2px rgba(0,0,0,.2))',
                  transformOrigin: '50% 100%',
                }}
              >
                🎊
              </span>
            )}

            <Tape
              color="#fde047"
              width={isMobile ? 0 : 520}
              angle={0}
              style={{
                padding: isMobile ? '10px 16px' : '14px 28px',
                fontSize: isMobile ? 15 : 20,
                ...(isMobile ? { minWidth: 0, width: 'calc(100vw - 28px)', textAlign: 'center' } : {}),
              }}
            >
              <span style={{ fontSize: isMobile ? 20 : 26, fontWeight: 900, color: tokens.ink, letterSpacing: '0.04em' }}>
                🎉 100 工具達成
              </span>
              {isMobile ? (
                <>
                  <br />
                  <span style={{ fontSize: 12, fontWeight: 700, color: tokens.muted2 }}>
                    點我看 #100 工具索引神器 →
                  </span>
                </>
              ) : (
                <>
                  <span style={{ margin: '0 10px', color: tokens.muted2 }}>·</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: tokens.muted2 }}>
                    {dateStr} 解鎖｜點我看 #100 工具索引神器 →
                  </span>
                </>
              )}
            </Tape>

            {/* 右側歡呼 emoji — 手機隱藏以防 overflow */}
            {!isMobile && (
              <span
                className="akai-cheer-emoji"
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  right: -34,
                  top: '50%',
                  marginTop: -16,
                  fontSize: 30,
                  animation: 'akai-cheer-bounce-r 1.4s ease-in-out infinite 0.2s',
                  filter: 'drop-shadow(0 2px 2px rgba(0,0,0,.2))',
                  transformOrigin: '50% 100%',
                }}
              >
                🥳
              </span>
            )}

            {/* 慶祝小提示 */}
            <div
              style={{
                position: 'absolute',
                right: -6,
                top: -10,
                fontSize: 22,
                transform: 'rotate(12deg)',
                filter: 'drop-shadow(0 2px 2px rgba(0,0,0,.18))',
              }}
              aria-hidden="true"
            >
              ✨
            </div>
            {daysSince >= 0 && daysSince <= CELEBRATION_DAYS - 1 && (
              <div
                style={{
                  position: 'absolute',
                  left: -8,
                  bottom: -16,
                  fontSize: 11,
                  fontWeight: 700,
                  color: tokens.muted2,
                  background: '#fff',
                  padding: '2px 8px',
                  borderRadius: 999,
                  border: `1.5px solid ${tokens.ink}`,
                  boxShadow: '1px 1px 0 rgba(0,0,0,.2)',
                  transform: 'rotate(-3deg)',
                  fontFamily: tokens.font.tc,
                }}
              >
                慶祝第 {daysSince + 1} 天
              </div>
            )}
          </div>
        </a>

        {/* 🎬 紀念短片 CTA — v3.6.56 新增，連到 share/100.html (新分頁，video 觀賞頁) */}
        <a
          href={`${base}share/100.html`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="開啟 5:32 100 工具達成宣傳影片（含旁白 + 同步字幕）"
          style={{
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            flexWrap: 'nowrap',
            gap: isMobile ? 6 : 10,
            padding: isMobile ? '8px 16px' : '10px 22px',
            background: 'rgba(26,15,5,.88)',
            color: '#fde047',
            border: '2.5px solid #fde047',
            borderRadius: 22,
            fontSize: isMobile ? 13 : 14,
            fontWeight: 900,
            letterSpacing: '0.04em',
            boxShadow: '3px 3px 0 rgba(26,15,5,.55)',
            transition: 'transform .15s ease, box-shadow .15s ease',
            fontFamily: tokens.font.tc,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translate(-2px, -2px)';
            e.currentTarget.style.boxShadow = '5px 5px 0 rgba(26,15,5,.55)';
            setConfettiTick((n) => n + 1);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translate(0, 0)';
            e.currentTarget.style.boxShadow = '3px 3px 0 rgba(26,15,5,.55)';
          }}
          onFocus={(e) => {
            e.currentTarget.style.transform = 'translate(-2px, -2px)';
            e.currentTarget.style.boxShadow = '5px 5px 0 rgba(26,15,5,.55)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.transform = 'translate(0, 0)';
            e.currentTarget.style.boxShadow = '3px 3px 0 rgba(26,15,5,.55)';
          }}
        >
          <span style={{ fontSize: 18 }}>🎬</span>
          <span>看 5:32 宣傳影片</span>
          <span style={{ fontSize: 11, opacity: 0.72, fontWeight: 700 }}>含旁白 + 字幕</span>
        </a>

        {/* 🎙️ v3.6.63 NEW: Kiki & Gordon 雙人對談特輯 7:02 */}
        <a
          href={`${base}share/100-dialog.html`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="開啟 Kiki & Gordon 雙人對談特輯 7 分鐘深度版"
          style={{
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            flexWrap: 'nowrap',
            gap: isMobile ? 6 : 10,
            padding: isMobile ? '8px 16px' : '10px 22px',
            background: 'linear-gradient(135deg, rgba(0,229,255,.15), rgba(255,179,0,.15))',
            color: '#1a1a1a',
            border: '2.5px solid #1a1a1a',
            borderRadius: 22,
            fontSize: isMobile ? 13 : 14,
            fontWeight: 900,
            letterSpacing: '0.04em',
            boxShadow: '3px 3px 0 rgba(0,229,255,.4), 6px 6px 0 rgba(255,179,0,.3)',
            transition: 'transform .15s ease, box-shadow .15s ease',
            fontFamily: tokens.font.tc,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translate(-2px, -2px)';
            e.currentTarget.style.boxShadow = '5px 5px 0 rgba(0,229,255,.5), 8px 8px 0 rgba(255,179,0,.4)';
            setConfettiTick((n) => n + 1);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translate(0, 0)';
            e.currentTarget.style.boxShadow = '3px 3px 0 rgba(0,229,255,.4), 6px 6px 0 rgba(255,179,0,.3)';
          }}
          onFocus={(e) => {
            e.currentTarget.style.transform = 'translate(-2px, -2px)';
            e.currentTarget.style.boxShadow = '5px 5px 0 rgba(0,229,255,.5), 8px 8px 0 rgba(255,179,0,.4)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.transform = 'translate(0, 0)';
            e.currentTarget.style.boxShadow = '3px 3px 0 rgba(0,229,255,.4), 6px 6px 0 rgba(255,179,0,.3)';
          }}
        >
          <span style={{ fontSize: 18 }}>🎙️</span>
          <span>聽 7:02 Kiki & Gordon 對談</span>
          <span style={{ fontSize: 11, opacity: 0.72, fontWeight: 700 }}>深度版 · NEW</span>
        </a>
      </div>
    </>
  );
}
