/**
 * BulletinMilestone100 — 破百倒數 / 達成慶祝 頂部頻帶
 *
 * 三狀態自動切換（讀 /api/site-stats.json）：
 *   1. N < 100  →「破百倒數 X 個」橘色便利貼 + 進度條 + 「許願下一個工具」CTA
 *   2. 100 ≤ N，距離 milestones.tool100 < 7 天 →「100 工具達成 🎉」金色膠帶 + 連到 /tool/100
 *   3. 距離達成 ≥ 7 天 → 不顯示（return null）
 *
 * 用法：在 BulletinHome 的 BulletinHero 上方插入 <BulletinMilestone100 />
 */

import { useEffect, useState } from 'react';
import { tokens } from '@/design/tokens';
import { Tape } from '@/components/primitives/Tape';
import { Pin } from '@/components/primitives/Pin';

interface SiteStats {
  toolCount: number;
  displayCount?: string;
  categoryCounts?: Record<string, number>;
  milestones?: Record<string, string>;
  ogImage?: string;
}

const CELEBRATION_DAYS = 7; // 達成後幾天內顯示金色慶祝
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

  // 狀態 2 / 3：已達成 — 看是否在慶祝期內
  if (tool100At) {
    const daysSince = daysBetween(tool100At, new Date());
    if (daysSince < CELEBRATION_DAYS) {
      return <CelebrationBanner achievedAt={tool100At} daysSince={daysSince} />;
    }
    return null; // 慶祝期過了
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
  return (
    <div
      data-testid="milestone-celebration"
      style={{
        position: 'relative',
        padding: '18px 60px 12px',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <a
        href={`${base}tool/100`}
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
          <Tape color="#fde047" width={520} angle={0} style={{ padding: '14px 28px', fontSize: 20 }}>
            <span style={{ fontSize: 26, fontWeight: 900, color: tokens.ink, letterSpacing: '0.04em' }}>
              🎉 100 工具達成
            </span>
            <span style={{ margin: '0 10px', color: tokens.muted2 }}>·</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: tokens.muted2 }}>
              {dateStr} 解鎖｜點我看 #100 工具索引神器 →
            </span>
          </Tape>
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
    </div>
  );
}
