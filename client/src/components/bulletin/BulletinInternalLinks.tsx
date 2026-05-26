import { tokens } from '@/design/tokens';
import { POSTS } from '@/blog/posts';

/**
 * BulletinInternalLinks — 全站頁尾的「內部連結 SEO 區塊」
 *
 * 目的：
 *  - SEO：給每個頁面注入指向「重要 9 大經典工具 + 4 個 hub + 最新 3 篇部落格」的連結
 *    幫 Google PageRank 集中到核心內容
 *  - GEO：AI 爬蟲讀到結構化的「最重要內容」列表
 *  - UX：使用者在任何頁面都能快速跳到主要功能
 *
 * 設計：cork 風格便利貼，3 列扁平佈局（9 chips + hub + latest），不打斷現有頁尾流
 */

// 9 大經典工具 — 來自 README「九大經典工具」清單（已驗證為長期主推）
const CLASSIC_TOOL_IDS = [1, 8, 3, 4, 7, 6, 17, 26, 74];

// 4 個 hub 頁面
const HUB_LINKS = [
  { url: '/', label: '🏠 首頁工具集', desc: '100 款全覽' },
  { url: 'blog', label: '📖 部落格', desc: `${POSTS.length} 篇深度長文` },
  { url: 'share/100.html', label: '🎬 100 達成宣傳片', desc: '5:32 影片' },
  { url: 'wish/', label: '🪄 許願池', desc: '提需求' },
];

// 取最新 3 篇部落格
const LATEST_POSTS = POSTS.slice(0, 3);

export function BulletinInternalLinks() {
  const base = import.meta.env.BASE_URL || '/';

  return (
    <nav
      aria-label="網站內部導航：經典工具、主要頁面、最新文章"
      style={{
        maxWidth: 900,
        margin: '8px auto 28px',
        padding: '20px 24px',
        background: tokens.note.yellowSoft,
        border: `1.5px solid ${tokens.ink}33`,
        borderRadius: 10,
        boxShadow: '3px 3px 0 rgba(0,0,0,.12)',
        fontFamily: tokens.font.tc,
      }}
    >
      {/* 9 大經典工具 chips */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: tokens.muted2, marginBottom: 8, letterSpacing: '0.08em' }}>
          ⭐ 9 大經典工具
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {CLASSIC_TOOL_IDS.map((id) => (
            <a
              key={id}
              href={`${base}tool/${id}`}
              style={{
                display: 'inline-block',
                padding: '5px 11px',
                background: '#fff',
                color: tokens.ink,
                border: `1.5px solid ${tokens.ink}33`,
                borderRadius: 999,
                textDecoration: 'none',
                fontSize: 12,
                fontWeight: 700,
                transition: 'background .15s, transform .15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = tokens.accent;
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.color = tokens.ink;
              }}
            >
              #{id}
            </a>
          ))}
        </div>
      </div>

      {/* Hub 頁面 */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: tokens.muted2, marginBottom: 8, letterSpacing: '0.08em' }}>
          🧭 主要頁面
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {HUB_LINKS.map((h) => (
            <a
              key={h.url}
              href={h.url === '/' ? base : `${base}${h.url}`}
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: tokens.ink,
                textDecoration: 'none',
                borderBottom: `1.5px solid ${tokens.accent}66`,
                paddingBottom: 1,
              }}
            >
              {h.label}
              <span style={{ fontSize: 10, fontWeight: 600, color: tokens.muted2, marginLeft: 4 }}>
                ({h.desc})
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* 最新部落格 */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 800, color: tokens.muted2, marginBottom: 8, letterSpacing: '0.08em' }}>
          📰 最新教學長文
        </div>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {LATEST_POSTS.map((p) => (
            <li key={p.slug}>
              <a
                href={`${base}blog/${p.slug}`}
                style={{
                  fontSize: 12.5,
                  color: tokens.ink,
                  textDecoration: 'none',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'baseline',
                  gap: 6,
                }}
              >
                <span style={{ fontSize: 11, color: tokens.muted2 }}>{p.coverEmoji}</span>
                <span style={{ borderBottom: '1px dashed transparent', transition: 'border-color .15s' }}>{p.title}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
