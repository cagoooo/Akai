import { tokens } from '@/design/tokens';
import { Tape } from '@/components/primitives/Tape';
import { Pin } from '@/components/primitives/Pin';

const SCHOOL_URL = 'https://www.smes.tyc.edu.tw/modules/tadnews/page.php?ncsn=11&nsn=16#a5';

/**
 * 公佈欄頁尾（整合版）：
 * - 中央：Made with love 膠帶
 * - 三欄便利貼：製作者署名 / 版權連結 / 版本資訊
 * - 底部細字：All rights reserved
 * - 完全採 cork 風格，不再需要另一個白色條 footer
 */
export function BulletinFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="bulletin-footer"
      style={{
        padding: '40px 60px 60px',
        fontFamily: tokens.font.tc,
      }}
      role="contentinfo"
      aria-label="網站頁尾資訊"
    >
      {/* 中央標題膠帶 */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Tape color={tokens.note.yellow} angle={-1.5} width={220}>
          <span style={{ fontSize: 13 }}>🙌 Made with love · 教學現場</span>
        </Tape>
      </div>

      {/* 三欄便利貼 */}
      <div
        className="bulletin-footer-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 20,
          maxWidth: 900,
          margin: '0 auto 28px',
          alignItems: 'stretch',
        }}
      >
        {/* 製作者署名（含阿凱 favicon 頭像） */}
        <FooterNote bg={tokens.note.pink} tilt={-1.5} pinIndex={0}>
          <div style={{ fontSize: 12, color: tokens.muted2, marginBottom: 8, letterSpacing: '0.1em' }}>
            ✍️ MAKER
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* 阿凱 favicon 頭像 */}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: tokens.paper,
                border: `2px solid ${tokens.ink}`,
                boxShadow: '2px 2px 0 rgba(0,0,0,.2)',
                display: 'grid',
                placeItems: 'center',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              <img
                src={`${import.meta.env.BASE_URL}favicon.png`}
                alt="阿凱老師頭像"
                style={{ width: '80%', height: '80%', objectFit: 'contain' }}
                onError={(e) => {
                  const img = e.currentTarget;
                  if (!img.dataset.fallback) {
                    img.dataset.fallback = '1';
                    img.src = `${import.meta.env.BASE_URL}favicon-32x32.png`;
                  }
                }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: tokens.ink, lineHeight: 1.3 }}>
                阿凱老師
              </div>
              <div style={{ fontSize: 11, color: tokens.muted2, marginTop: 2 }}>
                教育科技創新
              </div>
            </div>
          </div>
        </FooterNote>

        {/* 學校連結 */}
        <FooterNote bg={tokens.note.blue} tilt={1} pinIndex={1} href={SCHOOL_URL}>
          <div style={{ fontSize: 12, color: tokens.muted2, marginBottom: 6, letterSpacing: '0.1em' }}>
            🏫 SCHOOL
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, color: tokens.ink, lineHeight: 1.4 }}>
            石門國小
          </div>
          <div style={{ fontSize: 11, color: tokens.navy, marginTop: 4, textDecoration: 'underline' }}>
            前往官方網站 →
          </div>
        </FooterNote>

        {/* 版本資訊 */}
        <FooterNote bg={tokens.note.green} tilt={-0.8} pinIndex={2}>
          <div style={{ fontSize: 12, color: tokens.muted2, marginBottom: 6, letterSpacing: '0.1em' }}>
            ✨ VERSION
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, color: tokens.ink, lineHeight: 1.4, fontFamily: tokens.font.en }}>
            v3.6.0
          </div>
          <div style={{ fontSize: 11, color: tokens.muted2, marginTop: 4 }}>
            E2 公佈欄版
          </div>
        </FooterNote>
      </div>

      {/* 底部版權（含阿凱 favicon + 高對比配色） */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          maxWidth: 900,
          margin: '0 auto',
          paddingTop: 20,
          borderTop: '1px dashed rgba(74,58,32,.35)',
          flexWrap: 'wrap',
        }}
        className="bulletin-footer-copyright"
      >
        {/* 阿凱老師專屬 favicon */}
        <a
          href="/"
          aria-label="回到首頁"
          title="回到首頁"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: tokens.paper,
            border: `2px solid ${tokens.ink}`,
            boxShadow: '2px 2px 0 rgba(0,0,0,.25)',
            overflow: 'hidden',
            flexShrink: 0,
            transition: 'transform .2s ease',
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.transform = 'rotate(-8deg) scale(1.1)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.transform = 'rotate(0deg) scale(1)';
          }}
        >
          <img
            src={`${import.meta.env.BASE_URL}favicon.png`}
            alt="阿凱老師教育科技創新專區"
            style={{ width: '78%', height: '78%', objectFit: 'contain' }}
            onError={(e) => {
              // favicon.png 不存在時退回 favicon-32x32.png
              const img = e.currentTarget;
              if (!img.dataset.fallback) {
                img.dataset.fallback = '1';
                img.src = `${import.meta.env.BASE_URL}favicon-32x32.png`;
              }
            }}
          />
        </a>

        {/* 版權文字 */}
        <div
          style={{
            fontSize: 12.5,
            color: tokens.muted2,
            fontFamily: tokens.font.en,
            letterSpacing: '0.03em',
            lineHeight: 1.6,
            textAlign: 'center',
            fontWeight: 600,
            textShadow: '0 1px 0 rgba(255,255,255,.3)',
          }}
        >
          © {year}{' '}
          <a
            href={SCHOOL_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: tokens.ink,
              textDecoration: 'none',
              fontWeight: 800,
              background: `linear-gradient(transparent 65%, ${tokens.accent}66 65%, ${tokens.accent}66 90%, transparent 90%)`,
              padding: '0 4px',
            }}
          >
            教育科技創新專區
          </a>
          <span style={{ margin: '0 8px', opacity: 0.6 }}>·</span>
          <span style={{ fontFamily: tokens.font.tc, color: tokens.ink, fontWeight: 700 }}>
            阿凱老師
          </span>
          <span style={{ margin: '0 8px', opacity: 0.6 }}>·</span>
          <span style={{ fontFamily: tokens.font.tc, color: tokens.ink, fontWeight: 700 }}>
            石門國小
          </span>
          <span style={{ margin: '0 8px', opacity: 0.6 }}>·</span>
          <span style={{ color: tokens.muted2 }}>All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}

// ── 內部小元件：單張便利貼（可選是否為連結） ───────────
interface FooterNoteProps {
  bg: string;
  tilt: number;
  pinIndex: number;
  children: React.ReactNode;
  href?: string;
}

function FooterNote({ bg, tilt, pinIndex, children, href }: FooterNoteProps) {
  const innerStyle: React.CSSProperties = {
    background: bg,
    padding: '16px 16px 18px',
    borderRadius: 4,
    boxShadow: '0 2px 3px rgba(0,0,0,.12), 3px 3px 0 rgba(0,0,0,.18)',
    transform: `rotate(${tilt}deg)`,
    position: 'relative',
    minHeight: 92,
    cursor: href ? 'pointer' : 'default',
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
    transition: 'transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .25s',
  };

  const content = (
    <>
      <Pin
        color={tokens.pin[pinIndex % tokens.pin.length]}
        size={14}
        style={{ top: -7, left: '50%', marginLeft: -7 }}
      />
      {children}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="sticker-card"
        style={innerStyle}
        aria-label="前往石門國小官方網站（另開新視窗）"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="sticker-card" style={innerStyle}>
      {content}
    </div>
  );
}
