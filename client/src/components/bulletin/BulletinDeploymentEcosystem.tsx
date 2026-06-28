/**
 * BulletinDeploymentEcosystem — 首頁阿凱部署生態系區塊
 * 視覺化 5 大部署平台 + 隱藏作品數量
 * 連結到對應的部落格教學心得文章
 */

import { Link } from 'wouter';
import { tokens } from '@/design/tokens';
import { Pin } from '@/components/primitives/Pin';
import { Tape } from '@/components/primitives/Tape';

interface Platform {
  emoji: string;
  name: string;
  count: number;
  desc: string;
  color: string;
  pinColor: string;
  highlight: string;
  blogSlug?: string;
}

// ⚠️ 各平台的 `count:` + 底部「看全部 N 篇手寫教學心得」由
// `scripts/sync-deployment-ecosystem.mjs` 在 `npm run build` 時自動同步，
// 來源 = tools.json (套用 getToolPlatform 規則) + posts.ts 的 POST_* const 數量。
// 不要手改這些數字 — 改 tools.json / posts.ts 後 build 即同步。
const PLATFORMS: Platform[] = [
  {
    emoji: '🐙',
    name: 'GitHub Pages',
    count: 73,
    desc: '主力作品集，cagoooo/* 80+ repo',
    color: tokens.note.blue,
    pinColor: '#3b82f6',
    highlight: 'PIRLS Pro / Aura / MBTI / 駕駛艙',
    blogSlug: 'pirls-87-questioncraft-rewrite',
  },
  {
    emoji: '🌐',
    name: 'Google Sites Embedded',
    count: 10,
    desc: 'swissknife + academic 子站',
    color: tokens.note.purple,
    pinColor: '#c026d3',
    highlight: 'WebSlide / 許願池 / 九九乘法大冒險',
    blogSlug: 'swissknife-27-tool-vault',
  },
  {
    emoji: '🏫',
    name: 'XOOPS 校網 VM',
    count: 16,
    desc: '學校 smes_html/ 雲端部署',
    color: tokens.note.orange,
    pinColor: '#f97316',
    highlight: '太陽系 Three.js 3D / 遊戲集合',
    blogSlug: 'solar-29-system-explorer',
  },
  {
    emoji: '🔥',
    name: 'Firebase Hosting',
    count: 8,
    desc: '學校自訂 subdomain',
    color: tokens.note.green,
    pinColor: '#16a34a',
    highlight: 'pirlss / 5w1h / poet / english.smes',
    blogSlug: 'pirls-4-firebase-mirror',
  },
  {
    emoji: '🧩',
    name: '第三方平台',
    count: 6,
    desc: 'Replit + LINE Bot + Claude Artifacts + Padlet',
    color: tokens.note.pink,
    pinColor: '#db2777',
    highlight: 'Manus AI 雙語網 / 孔明神算',
    blogSlug: 'bilingual-77-english-promotion',
  },
];

const TOTAL_TOOLS = PLATFORMS.reduce((s, p) => s + p.count, 0);

export function BulletinDeploymentEcosystem() {
  return (
    <div
      className="bulletin-deployment-ecosystem"
      style={{
        position: 'relative',
        background: '#fefdfa',
        border: `2.5px solid ${tokens.ink}`,
        borderRadius: 14,
        padding: 'clamp(18px, 2.5vw, 28px) clamp(18px, 3vw, 32px) clamp(20px, 3vw, 28px)',
        boxShadow: '6px 7px 0 rgba(0,0,0,.2), 0 12px 24px -6px rgba(0,0,0,.16)',
        transform: 'rotate(-0.2deg)',
        fontFamily: tokens.font.tc,
        boxSizing: 'border-box',
        maxWidth: '100%',
      }}
    >
      <Pin color={tokens.red} size={22} style={{ top: -12, left: '50%', marginLeft: -11 }} />

      {/* 標題區 */}
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <Tape color="#fde047" width={210} angle={-2} style={{ fontSize: 13, marginBottom: 10 }}>
          🗺️ 阿凱部署生態系
        </Tape>
        <h2
          style={{
            fontSize: 'clamp(20px, 2.2vw, 26px)',
            fontWeight: 900,
            color: tokens.ink,
            margin: '6px 0',
            letterSpacing: '0.005em',
          }}
        >
          阿凱用過的 5 個部署平台
        </h2>
        <p
          style={{
            fontSize: 13,
            color: tokens.muted2,
            margin: '4px 0 0',
            fontStyle: 'italic',
          }}
        >
          全部 <strong>{TOTAL_TOOLS} 件公開工具</strong>分散在 5 個部署平台 — 每個平台都對應不同教學場景與受眾
        </p>
      </div>

      {/* 5 大平台便利貼 grid */}
      <div
        className="deployment-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 14,
          marginTop: 8,
        }}
      >
        {PLATFORMS.map((p, idx) => {
          const Wrap = (p.blogSlug ? Link : 'div') as React.ElementType;
          const wrapProps: Record<string, unknown> = p.blogSlug
            ? { href: `/blog/${p.blogSlug}` }
            : {};
          return (
            <Wrap
              key={p.name}
              {...wrapProps}
              style={{
                position: 'relative',
                background: p.color,
                border: `2px solid ${tokens.ink}`,
                borderRadius: 10,
                padding: '14px 12px 12px',
                boxShadow: '3px 4px 0 rgba(0,0,0,.18)',
                transform: `rotate(${(idx % 2 === 0 ? -1 : 1) * 0.4}deg)`,
                textDecoration: 'none',
                color: tokens.ink,
                cursor: p.blogSlug ? 'pointer' : 'default',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                fontFamily: tokens.font.tc,
              }}
              onMouseEnter={p.blogSlug ? (e: React.MouseEvent<HTMLElement>) => {
                e.currentTarget.style.transform = `rotate(${(idx % 2 === 0 ? -1.4 : 1.4) * 0.4}deg) translate(-1px, -2px)`;
                e.currentTarget.style.boxShadow = '5px 6px 0 rgba(0,0,0,.22)';
              } : undefined}
              onMouseLeave={p.blogSlug ? (e: React.MouseEvent<HTMLElement>) => {
                e.currentTarget.style.transform = `rotate(${(idx % 2 === 0 ? -1 : 1) * 0.4}deg)`;
                e.currentTarget.style.boxShadow = '3px 4px 0 rgba(0,0,0,.18)';
              } : undefined}
            >
              <Pin color={p.pinColor} size={14} style={{ top: -7, left: 14 }} />

              <div style={{ fontSize: 26, lineHeight: 1, marginTop: 4 }}>{p.emoji}</div>

              <div
                style={{
                  fontSize: 14,
                  fontWeight: 900,
                  color: tokens.ink,
                  lineHeight: 1.3,
                  wordBreak: 'break-word',
                }}
              >
                {p.name}
              </div>

              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: tokens.muted2,
                  lineHeight: 1.4,
                  wordBreak: 'break-word',
                }}
              >
                {p.desc}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 6,
                  marginTop: 4,
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontSize: 26, fontWeight: 900, color: tokens.red, lineHeight: 1 }}>
                  {p.count}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: tokens.muted2 }}>件工具</span>
              </div>

              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: tokens.muted2,
                  fontStyle: 'italic',
                  lineHeight: 1.4,
                  marginTop: 2,
                  wordBreak: 'break-word',
                }}
              >
                代表：{p.highlight}
              </div>
            </Wrap>
          );
        })}
      </div>

      {/* 底部腳註 */}
      <div
        style={{
          marginTop: 16,
          paddingTop: 12,
          borderTop: `1.5px dashed ${tokens.muted2}`,
          fontSize: 11,
          color: tokens.muted2,
          lineHeight: 1.6,
          textAlign: 'center',
          fontStyle: 'italic',
        }}
      >
        💡 點任一張便利貼 → 看該平台代表作品的深度教學心得長文
        <br />
        <Link href="/blog" style={{ color: tokens.red, fontWeight: 800, textDecoration: 'underline' }}>
          看全部 114 篇手寫教學心得 →
        </Link>
      </div>
    </div>
  );
}
