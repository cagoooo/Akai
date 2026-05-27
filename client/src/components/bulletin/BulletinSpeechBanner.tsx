/**
 * BulletinSpeechBanner — 2026 AIFED 演講入口（低調版）
 *
 * 主頁常駐輕量入口，視覺對齊 BulletinMilestone100 倒數 banner 尺度
 * （淺色便利貼 + 微旋轉 + 圖釘），避免搶過 milestone 與 hero 區的注意力。
 *
 * 主 CTA：開啟 /akai-talk-2026/ 純靜態簡報
 * 次 CTA：下載 AIFED 學術投稿稿件 PDF
 */
import { tokens } from '@/design/tokens';
import { Pin } from '@/components/primitives/Pin';
import { useIsMobile } from '@/hooks/use-mobile';

const NAVY_DEEP = '#143526'; // 石門寶藍 hover 色

export function BulletinSpeechBanner() {
  const isMobile = useIsMobile();
  const base = import.meta.env.BASE_URL || '/';

  return (
    <div
      data-testid="speech-banner-aifed"
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
          background: tokens.note.green,
          border: `2px solid ${tokens.ink}`,
          borderRadius: 10,
          padding: isMobile ? '10px 14px 9px' : '10px 22px 9px',
          boxShadow: '3px 4px 0 rgba(0,0,0,.18), 0 6px 14px -6px rgba(0,0,0,.15)',
          transform: 'rotate(-0.5deg)',
          maxWidth: 640,
          width: '100%',
          fontFamily: tokens.font.tc,
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 10 : 14,
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
      >
        <Pin color={NAVY_DEEP} size={14} style={{ top: -7, left: '50%', marginLeft: -7 }} />

        {/* 左：標題 — 單行排版 */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap', flex: '1 1 auto', minWidth: 0 }}>
          <span style={{ fontSize: isMobile ? 14 : 15, fontWeight: 900, color: tokens.ink, letterSpacing: '0.01em' }}>
            🎤 從使用者到開發者
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.1em',
              padding: '2px 7px',
              background: NAVY_DEEP,
              color: '#fff',
              borderRadius: 4,
              fontFamily: tokens.font.en,
              whiteSpace: 'nowrap',
            }}
          >
            2026 AIFED
          </span>
        </div>

        {/* 右：CTA chips */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
          <a
            href={`${base}akai-talk-2026/index.html`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="開啟 2026 AIFED 演講簡報（25 張投影片）"
            style={{
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              background: NAVY_DEEP,
              color: '#fff',
              border: `1.5px solid ${tokens.ink}`,
              borderRadius: 14,
              fontSize: 12,
              fontWeight: 800,
              fontFamily: tokens.font.tc,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'transform .15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translate(-1px, -1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translate(0, 0)'; }}
          >
            📊 看簡報
          </a>
          <a
            href={`${base}akai-talk-2026/AIFED2026_paper.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="下載 AIFED 2026 投稿學術稿件 PDF"
            style={{
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              padding: '4px 9px',
              background: 'transparent',
              color: NAVY_DEEP,
              border: `1.5px solid ${NAVY_DEEP}`,
              borderRadius: 14,
              fontSize: 11,
              fontWeight: 700,
              fontFamily: tokens.font.tc,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'background .15s ease, color .15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = NAVY_DEEP;
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = NAVY_DEEP;
            }}
          >
            📄 PDF
          </a>
        </div>
      </div>
    </div>
  );
}
