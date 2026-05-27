/**
 * BulletinSpeechBanner — 2026 AIFED 演講入口
 *
 * 永久常駐的演講作品橫幅，視覺對齊 BulletinMilestone100 的 CTA 風格
 * （深底亮邊 + 圓角 + 3D offset 陰影 + hover 位移）。
 *
 * 主 CTA：開啟 /Akai/akai-talk-2026/ 純靜態簡報（含 25 張投影片、Tweaks 面板、QR Code）
 * 次 CTA：下載 AIFED 學術投稿稿件 PDF
 *
 * 放在 BulletinHome 內 BulletinMilestone100 與 BulletinHero 之間。
 */
import { tokens } from '@/design/tokens';
import { Pin } from '@/components/primitives/Pin';
import { useIsMobile } from '@/hooks/use-mobile';

const NAVY = '#1F4C3E';        // 石門寶藍（簡報主色）
const NAVY_DEEP = '#143526';   // 深色 hover 變化
const CREAM = '#F4F0E6';       // 簡報米白
const GOLD = '#C99744';        // 橘金點綴

export function BulletinSpeechBanner() {
  const isMobile = useIsMobile();
  const base = import.meta.env.BASE_URL || '/';

  return (
    <div
      data-testid="speech-banner-aifed"
      style={{
        position: 'relative',
        padding: isMobile ? '12px 14px 16px' : '18px 60px 18px',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          position: 'relative',
          background: NAVY,
          border: `2.5px solid ${tokens.ink}`,
          borderRadius: 14,
          padding: isMobile ? '18px 18px 16px' : '20px 28px 18px',
          boxShadow: '5px 6px 0 rgba(0,0,0,.28), 0 12px 24px -6px rgba(0,0,0,.20)',
          transform: 'rotate(-0.4deg)',
          maxWidth: 760,
          width: '100%',
          fontFamily: tokens.font.tc,
          color: CREAM,
        }}
      >
        <Pin color={GOLD} size={20} style={{ top: -10, left: '50%', marginLeft: -10 }} />

        {/* 上排：標籤 + 主標 */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.14em',
              padding: '3px 9px',
              background: GOLD,
              color: NAVY_DEEP,
              borderRadius: 4,
              fontFamily: tokens.font.en,
            }}
          >
            2026 AIFED · 學術年會
          </span>
          <span style={{ fontSize: isMobile ? 11 : 12, color: 'rgba(244,240,230,.7)', fontWeight: 600 }}>
            科技教育創新專區 · 黃凱揚
          </span>
        </div>

        {/* 主標 */}
        <div
          style={{
            fontSize: isMobile ? 20 : 26,
            fontWeight: 900,
            color: CREAM,
            letterSpacing: '0.02em',
            lineHeight: 1.3,
            marginBottom: 4,
          }}
        >
          🎤 從使用者到開發者
        </div>
        <div
          style={{
            fontSize: isMobile ? 12 : 13,
            color: 'rgba(244,240,230,.78)',
            fontWeight: 500,
            marginBottom: 14,
            lineHeight: 1.55,
          }}
        >
          一位國小教師如何用 AI 協作親手做出 100+ 款教育工具的完整心路歷程
        </div>

        {/* CTA 群 */}
        <div
          style={{
            display: 'flex',
            gap: isMobile ? 8 : 10,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {/* 主 CTA：開啟簡報 */}
          <a
            href={`${base}akai-talk-2026/index.html`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="開啟 2026 AIFED 演講簡報（25 張投影片，含 Tweaks 配色面板與現場 QR Code）"
            style={{
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: isMobile ? '10px 18px' : '11px 22px',
              background: GOLD,
              color: NAVY_DEEP,
              border: `2.5px solid ${tokens.ink}`,
              borderRadius: 22,
              fontSize: isMobile ? 14 : 15,
              fontWeight: 900,
              letterSpacing: '0.03em',
              boxShadow: '3px 3px 0 rgba(0,0,0,.5)',
              transition: 'transform .15s ease, box-shadow .15s ease',
              fontFamily: tokens.font.tc,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              minHeight: 44,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translate(-2px, -2px)';
              e.currentTarget.style.boxShadow = '5px 5px 0 rgba(0,0,0,.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translate(0, 0)';
              e.currentTarget.style.boxShadow = '3px 3px 0 rgba(0,0,0,.5)';
            }}
            onFocus={(e) => {
              e.currentTarget.style.transform = 'translate(-2px, -2px)';
              e.currentTarget.style.boxShadow = '5px 5px 0 rgba(0,0,0,.5)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.transform = 'translate(0, 0)';
              e.currentTarget.style.boxShadow = '3px 3px 0 rgba(0,0,0,.5)';
            }}
          >
            <span style={{ fontSize: 18 }}>📊</span>
            <span>看 25 張簡報</span>
            {!isMobile && (
              <span style={{ fontSize: 11, opacity: 0.7, fontWeight: 700 }}>
                即時瀏覽 · 含速講者筆記
              </span>
            )}
          </a>

          {/* 次 CTA：下載 PDF 投稿稿件 */}
          <a
            href={`${base}akai-talk-2026/AIFED2026_paper.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="下載 AIFED 2026 投稿學術稿件 PDF（黃凱揚 · 132KB）"
            style={{
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: isMobile ? '9px 14px' : '10px 18px',
              background: 'transparent',
              color: CREAM,
              border: `2px solid ${CREAM}`,
              borderRadius: 22,
              fontSize: isMobile ? 12 : 13,
              fontWeight: 700,
              letterSpacing: '0.02em',
              transition: 'background .15s ease, color .15s ease',
              fontFamily: tokens.font.tc,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              minHeight: 40,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = CREAM;
              e.currentTarget.style.color = NAVY_DEEP;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = CREAM;
            }}
            onFocus={(e) => {
              e.currentTarget.style.background = CREAM;
              e.currentTarget.style.color = NAVY_DEEP;
            }}
            onBlur={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = CREAM;
            }}
          >
            <span style={{ fontSize: 14 }}>📄</span>
            <span>投稿稿件 PDF</span>
          </a>
        </div>

        {/* 底部小提示 — 手機只顯示精簡版 */}
        {!isMobile && (
          <div
            style={{
              marginTop: 12,
              fontSize: 11,
              color: 'rgba(244,240,230,.55)',
              fontWeight: 500,
              letterSpacing: '0.02em',
              fontFamily: tokens.font.mono,
            }}
          >
            ← / → 鍵切換投影片 · F 全螢幕 · T 開啟 Tweaks 配色面板
          </div>
        )}
      </div>
    </div>
  );
}
