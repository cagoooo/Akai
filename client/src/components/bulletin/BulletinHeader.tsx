import { tokens } from '@/design/tokens';
import { Tape } from '@/components/primitives/Tape';

/**
 * 公佈欄頁首：校徽 + 站名 + 副標
 * 訪客計數交給既有 VisitorCounter 元件（在 Home.tsx 層級渲染）
 */
export function BulletinHeader() {
  return (
    <header
      style={{
        padding: '60px 60px 30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 24,
        flexWrap: 'wrap',
      }}
      className="bulletin-header"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <a
          href="https://www.smes.tyc.edu.tw/modules/tadnews/page.php?ncsn=11&nsn=16#a5"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="前往石門國小官方網站（另開新視窗）"
          title="前往石門國小官方網站"
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: '#fff',
            border: '3px solid #1a1a1a',
            display: 'grid',
            placeItems: 'center',
            overflow: 'hidden',
            boxShadow: '0 3px 8px rgba(0,0,0,.25)',
            flexShrink: 0,
            cursor: 'pointer',
            transition: 'transform .2s ease, box-shadow .2s ease',
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.08) rotate(-3deg)';
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 5px 14px rgba(0,0,0,.35)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1) rotate(0deg)';
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 3px 8px rgba(0,0,0,.25)';
          }}
        >
          <img
            src={`${import.meta.env.BASE_URL}assets/school-logo.png`}
            alt="石門國小校徽"
            style={{ width: '84%', height: '84%', objectFit: 'contain' }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        </a>

        <div>
          <h1
            style={{
              fontFamily: tokens.font.tc,
              fontSize: 28,
              fontWeight: 900,
              margin: 0,
              lineHeight: 1.2,
              color: tokens.ink,
              letterSpacing: '0.02em',
            }}
          >
            阿凱老師 · 教育科技專區
          </h1>
          <div
            style={{
              fontFamily: tokens.font.en,
              fontSize: 12,
              fontWeight: 700,
              color: tokens.muted,
              letterSpacing: '0.25em',
              marginTop: 4,
              textTransform: 'uppercase',
            }}
          >
            SHIHMEN ELEMENTARY · EDUCATIONAL TECH
          </div>
        </div>
      </div>

      <Tape color={tokens.note.yellow} angle={3} width={180}>
        <span style={{ fontSize: 13 }}>📌 E2 公佈欄</span>
      </Tape>
    </header>
  );
}
