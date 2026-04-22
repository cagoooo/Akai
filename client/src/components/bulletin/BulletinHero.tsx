import { tokens } from '@/design/tokens';
import { Tape } from '@/components/primitives/Tape';
import { Pin } from '@/components/primitives/Pin';

/**
 * Hero 區：公告膠帶 + 標題 + 阿凱老師拍立得
 */
export function BulletinHero() {
  return (
    <section
      className="bulletin-hero"
      style={{
        display: 'grid',
        gridTemplateColumns: '1.3fr 0.7fr',
        gap: 40,
        padding: '10px 60px 30px',
        alignItems: 'center',
      }}
    >
      <div>
        <div style={{ marginBottom: 16 }}>
          <Tape color={tokens.accent} angle={-3} width={220}>
            <span style={{ fontSize: 13, color: '#fff', fontWeight: 800 }}>📣 今日公告 · NOTICE</span>
          </Tape>
        </div>
        <h2
          style={{
            fontFamily: tokens.font.tc,
            fontSize: 'clamp(26px, 3.5vw, 42px)',
            fontWeight: 900,
            lineHeight: 1.2,
            color: tokens.ink,
            margin: 0,
            letterSpacing: '0.01em',
          }}
        >
          貼上你<span style={{ color: tokens.accent }}>最順手</span>的
          <br />
          教育小工具 ✨
        </h2>
        <p
          style={{
            fontFamily: tokens.font.tc,
            fontSize: 15,
            color: tokens.inkSoft,
            marginTop: 14,
            lineHeight: 1.7,
            maxWidth: 520,
          }}
        >
          這是阿凱老師為師生打造的公佈欄，收錄歷年開發的實用工具，
          從課堂互動、評語優化到行政自動化都有。隨手撕下你需要的那一張吧！
        </p>
      </div>

      {/* 阿凱老師拍立得 */}
      <div style={{ position: 'relative', justifySelf: 'end' }}>
        <div
          className="sticker-card"
          style={{
            background: '#fefdfa',
            padding: '14px 14px 24px',
            transform: 'rotate(3.5deg)',
            boxShadow:
              '0 3px 5px rgba(0,0,0,.18), 0 16px 26px -8px rgba(0,0,0,.28), 0 30px 50px -20px rgba(0,0,0,.22)',
            border: '1px solid #d8d4c8',
            width: 200,
            position: 'relative',
          }}
        >
          <Pin color={tokens.red} size={20} style={{ top: -10, left: '50%', marginLeft: -10, zIndex: 10 }} />
          <div
            style={{
              aspectRatio: '4/5',
              background: '#e8d4ff',
              display: 'grid',
              placeItems: 'center',
              overflow: 'hidden',
              marginBottom: 10,
            }}
          >
            <img
              src={`${import.meta.env.BASE_URL}assets/Akai.png`}
              alt="阿凱老師"
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                const el = e.currentTarget as HTMLImageElement;
                el.style.display = 'none';
                (el.parentElement as HTMLElement).textContent = '👨‍🏫';
                (el.parentElement as HTMLElement).style.fontSize = '72px';
              }}
            />
          </div>
          <div
            style={{
              fontFamily: tokens.font.tc,
              fontSize: 14,
              fontWeight: 800,
              fontStyle: 'italic',
              textAlign: 'center',
              color: tokens.ink,
            }}
          >
            阿凱老師 ✍️
          </div>
          <div
            style={{
              fontFamily: tokens.font.en,
              fontSize: 10,
              textAlign: 'center',
              color: tokens.muted,
              letterSpacing: '0.15em',
              marginTop: 2,
            }}
          >
            THE MAKER
          </div>
        </div>
      </div>
    </section>
  );
}
