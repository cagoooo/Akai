import { tokens } from '@/design/tokens';
import { Tape } from '@/components/primitives/Tape';
import { Pin } from '@/components/primitives/Pin';

/**
 * Hero 區：公告膠帶 + 大標（含螢光筆底色）+ 白色半透明介紹區 + 阿凱老師拍立得
 * 配色完全依照設計師原檔：主文字黑色、關鍵詞用橘色螢光筆 highlight、介紹區白底提升對比
 */
export function BulletinHero() {
  return (
    <section
      className="bulletin-hero"
      style={{
        position: 'relative',
        padding: '30px 60px 50px',
        display: 'grid',
        gridTemplateColumns: '1.1fr 1fr',
        gap: 40,
        alignItems: 'center',
      }}
    >
      {/* 左：公告標題區 */}
      <div>
        {/* 雙膠帶標題 */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
          <Tape color={tokens.note.yellowBright} angle={-2} width={220}>
            <span style={{ fontSize: 13 }}>📢 BULLETIN · Spring 2026</span>
          </Tape>
          <Tape color={tokens.note.pink} angle={3} width={130}>
            <span style={{ fontSize: 12 }}>✨ NEW v3.6.0</span>
          </Tape>
        </div>

        {/* 大標：黑字 + 橘色螢光筆 highlight */}
        <h1
          style={{
            fontSize: 'clamp(42px, 5vw, 72px)',
            lineHeight: 1.05,
            fontWeight: 900,
            margin: 0,
            color: tokens.ink,
            letterSpacing: '-0.03em',
            textShadow: '2px 2px 0 rgba(0,0,0,.08)',
            fontFamily: tokens.font.tc,
          }}
        >
          釘在牆上的
          <br />
          <span style={{ position: 'relative', display: 'inline-block' }}>
            <span
              style={{
                background: `linear-gradient(transparent 55%, ${tokens.accent} 55%, ${tokens.accent} 88%, transparent 88%)`,
                padding: '0 6px',
              }}
            >
              教學點子
            </span>
            <span
              style={{
                position: 'absolute',
                top: -8,
                right: -28,
                fontSize: 32,
                transform: 'rotate(18deg)',
              }}
            >
              📌
            </span>
          </span>
        </h1>

        {/* 白底介紹段落（關鍵：解決 cork 背景對比度問題） */}
        <p
          style={{
            fontSize: 17,
            color: '#2a2a2a',
            lineHeight: 1.65,
            margin: '24px 0 0',
            maxWidth: 520,
            background: 'rgba(255,255,255,.88)',
            padding: '14px 18px',
            borderLeft: `4px solid ${tokens.accent}`,
            fontFamily: tokens.font.tc,
          }}
        >
          81 個老師做的免費工具，一張一張釘在公佈欄上。
          從課堂互動、評語優化到行政自動化都有，想看哪個就點哪個，想許願就直接寫便利貼 🪄
        </p>

        {/* 行動按鈕 */}
        <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() =>
              document.querySelector('[data-tour="tools-grid"]')?.scrollIntoView({ behavior: 'smooth' })
            }
            style={{
              background: tokens.navy,
              color: '#fff',
              border: '2.5px solid #1a1a1a',
              padding: '12px 22px',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: tokens.font.tc,
              boxShadow: '3px 3px 0 rgba(0,0,0,.4)',
            }}
          >
            🔎 瀏覽全部
          </button>
          <button
            type="button"
            onClick={() =>
              document
                .querySelector('.bulletin-sections-grid')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
            style={{
              background: '#fff',
              color: tokens.ink,
              border: '2.5px solid #1a1a1a',
              padding: '12px 22px',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: tokens.font.tc,
              boxShadow: '3px 3px 0 rgba(0,0,0,.4)',
            }}
          >
            🏆 看排行榜
          </button>
        </div>
      </div>

      {/* 右：阿凱老師拍立得（含對話泡泡、雙膠帶、校徽徽章） */}
      <AkaiPolaroid />
    </section>
  );
}

function AkaiPolaroid() {
  return (
    <div className="bulletin-akai-polaroid" style={{ position: 'relative', justifySelf: 'center', maxWidth: 300 }}>
      {/* 對話泡泡 */}
      <div
        style={{
          position: 'absolute',
          top: -22,
          left: -70,
          background: '#fff',
          border: '2.5px solid #1a1a1a',
          borderRadius: 18,
          padding: '10px 14px',
          fontSize: 13,
          fontWeight: 600,
          maxWidth: 170,
          boxShadow: '3px 3px 0 #1a1a1a',
          zIndex: 8,
          transform: 'rotate(-4deg)',
          lineHeight: 1.5,
          fontFamily: tokens.font.tc,
        }}
      >
        嗨～我是阿凱！
        <br />
        這裡是我做的工具集 👋
        <div
          style={{
            position: 'absolute',
            bottom: -14,
            right: 28,
            width: 0,
            height: 0,
            borderLeft: '12px solid transparent',
            borderRight: '12px solid transparent',
            borderTop: '14px solid #1a1a1a',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -10,
            right: 30,
            width: 0,
            height: 0,
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderTop: '11px solid #fff',
          }}
        />
      </div>

      {/* 兩條膠帶 */}
      <div style={{ position: 'absolute', top: -8, left: 24, zIndex: 6 }}>
        <Tape color={tokens.note.pink} angle={-14} width={80} />
      </div>
      <div style={{ position: 'absolute', top: -8, right: 24, zIndex: 6 }}>
        <Tape color={tokens.note.blue} angle={12} width={80} />
      </div>

      {/* 拍立得本體 */}
      <div
        style={{
          background: '#fefdfa',
          padding: '14px 14px 34px',
          boxShadow: '0 3px 6px rgba(0,0,0,.18), 0 14px 24px rgba(0,0,0,.25)',
          transform: 'rotate(1.5deg)',
          border: '1px solid #d8d4c8',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: 240,
            aspectRatio: '4/5',
            background: tokens.accentSoft,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <img
            src={`${import.meta.env.BASE_URL}assets/Akai.png`}
            alt="阿凱老師"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              const el = e.currentTarget as HTMLImageElement;
              el.style.display = 'none';
              (el.parentElement as HTMLElement).textContent = '👨‍🏫';
              (el.parentElement as HTMLElement).style.display = 'grid';
              (el.parentElement as HTMLElement).style.placeItems = 'center';
              (el.parentElement as HTMLElement).style.fontSize = '96px';
            }}
          />
          {/* 裝飾貼紙 */}
          <div
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              fontSize: 24,
              transform: 'rotate(15deg)',
            }}
          >
            ✨
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 24,
              left: 16,
              fontSize: 18,
              transform: 'rotate(-8deg)',
            }}
          >
            ⭐
          </div>
          {/* APPROVED 印章 */}
          <div
            style={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              border: `2.5px solid ${tokens.red}`,
              color: tokens.red,
              padding: '3px 8px',
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: '0.1em',
              borderRadius: 3,
              fontFamily: tokens.font.en,
              transform: 'rotate(-10deg)',
              opacity: 0.85,
              background: 'rgba(255,255,255,.7)',
            }}
          >
            APPROVED
          </div>
        </div>
        <div style={{ marginTop: 12, textAlign: 'center', fontFamily: tokens.font.tc }}>
          <div
            style={{
              fontSize: 17,
              fontWeight: 800,
              fontStyle: 'italic',
              color: tokens.ink,
            }}
          >
            阿凱老師
          </div>
          <div style={{ fontSize: 11, color: tokens.muted, marginTop: 2 }}>
            石門國小 · 教育科技創新
          </div>
        </div>
      </div>

      {/* 校徽徽章 */}
      <div
        style={{
          position: 'absolute',
          bottom: -24,
          left: -32,
          width: 76,
          height: 76,
          borderRadius: '50%',
          background: '#fff',
          border: '3px solid #1a1a1a',
          boxShadow: '3px 3px 0 rgba(0,0,0,.35), 0 8px 14px rgba(0,0,0,.2)',
          padding: 4,
          transform: 'rotate(-8deg)',
          zIndex: 5,
        }}
      >
        <Pin
          color={tokens.pin[3]}
          size={14}
          style={{ top: -7, left: '50%', marginLeft: -7, zIndex: 10 }}
        />
        <img
          src={`${import.meta.env.BASE_URL}assets/school-logo.png`}
          alt="石門國小校徽"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
    </div>
  );
}
