/**
 * NotFound — 網址不存在時的公佈欄風「找不到」頁
 * 掛在 App.tsx Switch 最後一條（沒有 path 的 Route），所有比對不到的網址都會落到這裡。
 */
import { Link } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { BulletinBoard } from '@/components/bulletin/BulletinBoard';
import { BulletinFooter } from '@/components/bulletin/BulletinFooter';
import { Pin } from '@/components/primitives/Pin';
import { Tape } from '@/components/primitives/Tape';
import { tokens } from '@/design/tokens';

const baseUrl = import.meta.env.BASE_URL || '/';

const buttonBase = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 48,
  padding: '10px 22px',
  border: `2.5px solid ${tokens.ink}`,
  borderRadius: 10,
  fontSize: 15,
  fontWeight: 800,
  fontFamily: tokens.font.tc,
  boxShadow: '3px 3px 0 rgba(0,0,0,.4)',
  textDecoration: 'none',
  cursor: 'pointer',
} as const;

export function NotFound() {
  return (
    <BulletinBoard>
      <Helmet>
        <title>找不到這個頁面｜阿凱老師教育科技創新專區</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <section style={{ padding: '72px 20px 80px', textAlign: 'center', fontFamily: tokens.font.tc }}>
        <div
          className="sticker-card"
          style={{
            maxWidth: 520,
            margin: '0 auto',
            background: tokens.note.yellowBright,
            padding: '44px 26px 34px',
            transform: 'rotate(-1deg)',
            boxShadow: '4px 4px 0 rgba(0,0,0,.25), 0 14px 24px -6px rgba(0,0,0,.25)',
            border: `2.5px solid ${tokens.ink}`,
            borderRadius: 6,
            position: 'relative',
          }}
        >
          <Pin color={tokens.red} size={22} style={{ top: -11, left: '50%', marginLeft: -11 }} />
          <Tape color={tokens.note.blue} width={70} style={{ position: 'absolute', top: -8, right: 24, transform: 'rotate(8deg)' }} />
          <div style={{ fontSize: 64, marginBottom: 12 }} aria-hidden="true">🧭</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: tokens.ink, margin: '0 0 10px' }}>
            這個頁面不在公佈欄上
          </h1>
          <p style={{ fontSize: 15, color: tokens.muted2, lineHeight: 1.7, margin: '0 0 26px' }}>
            網址可能打錯了，或是這一頁已經搬家。
            <br />
            從下面挑一個地方繼續逛吧！
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            <Link href="/" style={{ ...buttonBase, background: tokens.navy, color: '#fff' }}>
              ← 回首頁
            </Link>
            <a href={`${baseUrl}#tools`} style={{ ...buttonBase, background: tokens.paper, color: tokens.ink }}>
              🧰 看全部工具
            </a>
            <Link href="/blog" style={{ ...buttonBase, background: tokens.note.green, color: tokens.ink }}>
              📖 看教學文章
            </Link>
          </div>
        </div>
      </section>
      <BulletinFooter />
    </BulletinBoard>
  );
}
