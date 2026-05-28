/**
 * ExternalWorkBanner — 通用對外作品 banner
 *
 * 渲染單一 ExternalWork（演講 / 研習 / 媒體露出 / 投稿等），視覺對齊
 * milestone 倒數 banner（淺色便利貼 + 圖釘 + 微旋轉 + CTA chip）。
 *
 * 桌面：橫向單行（主標 + 標籤 / 雙 CTA 兩端對齊）
 * 手機：column flex stretch（主標一行 / CTA 等寬兩格各 41px）
 *
 * GA 事件：每次 CTA 點擊發 `external_work_click { work_id, cta }`。
 * BulletinSpeechBanner 為了相容舊 GA 仍另發 `aifed_speech_click`。
 */
import { useEffect, useState } from 'react';
import { tokens } from '@/design/tokens';
import { Pin } from '@/components/primitives/Pin';
import { ConfettiBurst } from '@/components/primitives/ConfettiBurst';
import { useIsMobile } from '@/hooks/use-mobile';
import { trackEvent } from '@/lib/analytics';
import type { ExternalWork, ExternalWorkCta } from '@/data/externalWorks';

interface ExternalWorkBannerProps {
  work: ExternalWork;
  /** 額外的 GA 事件名（除了預設 external_work_click 外多發一次）*/
  legacyEventName?: string;
}

const DEFAULT_ACCENT = '#143526';
const SEEN_STORAGE_PREFIX = 'akai-external-work-seen-';

export function ExternalWorkBanner({ work, legacyEventName }: ExternalWorkBannerProps) {
  const isMobile = useIsMobile();
  const base = import.meta.env.BASE_URL || '/';
  const [confettiTick, setConfettiTick] = useState(0);

  // 首次顯示撒花：localStorage 沒記過就撒一次 + 寫入
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storageKey = `${SEEN_STORAGE_PREFIX}${work.id}`;
    try {
      if (localStorage.getItem(storageKey)) return; // 看過了不撒
      // 延遲 600ms 讓 banner 先 mount 完，視覺感受才好
      const t = window.setTimeout(() => {
        setConfettiTick(1);
        localStorage.setItem(storageKey, new Date().toISOString());
        trackEvent('external_work_first_view', { work_id: work.id });
      }, 600);
      return () => window.clearTimeout(t);
    } catch {
      /* localStorage 不可用（隱私模式）就跳過撒花，banner 正常顯示 */
    }
  }, [work.id]);

  const bg = work.colors?.bg ?? tokens.note.green;
  const accent = work.colors?.accent ?? DEFAULT_ACCENT;
  const labelBg = work.colors?.label ?? accent;

  const handleClick = (cta: ExternalWorkCta) => {
    trackEvent('external_work_click', {
      work_id: work.id,
      cta: cta.trackingId,
      viewport: isMobile ? 'mobile' : 'desktop',
    });
    if (legacyEventName) {
      trackEvent(legacyEventName, {
        cta: cta.trackingId,
        viewport: isMobile ? 'mobile' : 'desktop',
      });
    }
  };

  return (
    <>
      <ConfettiBurst trigger={confettiTick} />
      <div
        data-testid="external-work-banner"
        data-work-id={work.id}
        style={{
          position: 'relative',
          padding: '8px 60px 6px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
      <div
        style={{
          position: 'relative',
          background: bg,
          border: `2px solid ${tokens.ink}`,
          borderRadius: 10,
          padding: isMobile ? '12px 14px 12px' : '10px 22px 9px',
          boxShadow: '3px 4px 0 rgba(0,0,0,.18), 0 6px 14px -6px rgba(0,0,0,.15)',
          transform: 'rotate(-0.5deg)',
          maxWidth: 640,
          width: '100%',
          fontFamily: tokens.font.tc,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: isMobile ? 10 : 14,
          flexWrap: isMobile ? 'nowrap' : 'wrap',
          justifyContent: 'space-between',
        }}
      >
        <Pin color={accent} size={14} style={{ top: -7, left: '50%', marginLeft: -7 }} />

        {/* 上：標題 + label */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 8,
            flexWrap: 'wrap',
            flex: '1 1 auto',
            minWidth: 0,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 900, color: tokens.ink, letterSpacing: '0.01em' }}>
            {work.emoji} {work.title}
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.1em',
              padding: '2px 7px',
              background: labelBg,
              color: '#fff',
              borderRadius: 4,
              fontFamily: tokens.font.en,
              whiteSpace: 'nowrap',
            }}
          >
            {work.label}
          </span>
        </div>

        {/* 下：CTA chips */}
        <div
          style={{
            display: 'flex',
            gap: isMobile ? 8 : 6,
            alignItems: 'center',
            flexShrink: 0,
            width: isMobile ? '100%' : 'auto',
          }}
        >
          <CtaChip cta={work.primaryCta} primary accent={accent} base={base} isMobile={isMobile} onClick={handleClick} />
          {work.secondaryCta && (
            <CtaChip cta={work.secondaryCta} accent={accent} base={base} isMobile={isMobile} onClick={handleClick} />
          )}
        </div>
        </div>
      </div>
    </>
  );
}

interface CtaChipProps {
  cta: ExternalWorkCta;
  primary?: boolean;
  accent: string;
  base: string;
  isMobile: boolean;
  onClick: (cta: ExternalWorkCta) => void;
}

function CtaChip({ cta, primary = false, accent, base, isMobile, onClick }: CtaChipProps) {
  const external = cta.external !== false;
  const href = cta.href.startsWith('http') ? cta.href : `${base}${cta.href}`;

  if (primary) {
    return (
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        aria-label={`${cta.text}（${external ? '另開新分頁' : '同分頁'}）`}
        onClick={() => onClick(cta)}
        style={{
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5,
          padding: isMobile ? '9px 14px' : '4px 10px',
          background: accent,
          color: '#fff',
          border: `1.5px solid ${tokens.ink}`,
          borderRadius: isMobile ? 10 : 14,
          fontSize: isMobile ? 13 : 12,
          fontWeight: 800,
          fontFamily: tokens.font.tc,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'transform .15s ease',
          flex: isMobile ? '2 1 0' : '0 0 auto',
          minHeight: isMobile ? 40 : 'auto',
          boxShadow: isMobile ? '2px 2px 0 rgba(0,0,0,.22)' : 'none',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translate(-1px, -1px)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translate(0, 0)'; }}
      >
        {cta.emoji} {cta.text}
      </a>
    );
  }

  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      aria-label={`${cta.text}（${external ? '另開新分頁' : '同分頁'}）`}
      onClick={() => onClick(cta)}
      style={{
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        padding: isMobile ? '9px 14px' : '4px 9px',
        background: 'transparent',
        color: accent,
        border: `1.5px solid ${accent}`,
        borderRadius: isMobile ? 10 : 14,
        fontSize: isMobile ? 12 : 11,
        fontWeight: 700,
        fontFamily: tokens.font.tc,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'background .15s ease, color .15s ease',
        flex: isMobile ? '1 1 0' : '0 0 auto',
        minHeight: isMobile ? 40 : 'auto',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = accent;
        e.currentTarget.style.color = '#fff';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = accent;
      }}
    >
      {cta.emoji} {cta.text}
    </a>
  );
}
