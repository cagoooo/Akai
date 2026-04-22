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
        {/* 製作者署名 */}
        <FooterNote bg={tokens.note.pink} tilt={-1.5} pinIndex={0}>
          <div style={{ fontSize: 12, color: tokens.muted2, marginBottom: 6, letterSpacing: '0.1em' }}>
            ✍️ MAKER
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, color: tokens.ink, lineHeight: 1.4 }}>
            阿凱老師
          </div>
          <div style={{ fontSize: 11, color: tokens.muted2, marginTop: 4 }}>
            教育科技創新
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

      {/* 底部版權 */}
      <div
        style={{
          textAlign: 'center',
          fontSize: 12,
          color: tokens.muted,
          fontFamily: tokens.font.en,
          letterSpacing: '0.05em',
          paddingTop: 16,
          borderTop: '1px dashed rgba(74,58,32,.3)',
          maxWidth: 900,
          margin: '0 auto',
        }}
      >
        © {year}{' '}
        <a
          href={SCHOOL_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: tokens.muted2,
            textDecoration: 'none',
            fontWeight: 700,
            borderBottom: `1px solid ${tokens.accent}`,
          }}
        >
          教育科技創新專區
        </a>
        {' '}·{' '}
        <span style={{ fontFamily: tokens.font.tc }}>阿凱老師 · 石門國小</span>
        {' '}·{' '}
        All rights reserved.
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
