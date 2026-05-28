/**
 * BulletinQuickNav — 公佈欄主頁快速跳轉指示牌
 *
 * 主頁 sections 越來越多（hero / 排行榜 / 許願池 / 工具地圖 / 部落格 / 部署生態 / 工具牆），
 * 訪客滾到底要 30 秒。這個元件提供 4 個 anchor chip 直接跳到關鍵區塊。
 *
 * 視覺隱喻：公佈欄上的「方向指示牌」— 4 個小便利貼排成一列，
 * 不 sticky（避免遮擋公佈欄背景），純 inline jump nav。
 */
import { tokens } from '@/design/tokens';
import { useIsMobile } from '@/hooks/use-mobile';
import { trackEvent } from '@/lib/analytics';

interface NavItem {
  id: string;
  emoji: string;
  label: string;
  color: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'ranking', emoji: '🏆', label: '排行榜', color: tokens.note.yellow },
  { id: 'stats', emoji: '📊', label: '工具地圖', color: tokens.note.blue },
  { id: 'blog', emoji: '📚', label: '部落格', color: tokens.note.pink },
  { id: 'tools', emoji: '🔧', label: '工具牆', color: tokens.note.green },
];

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 20; // 留 20px 呼吸
  window.scrollTo({ top, behavior: 'smooth' });
}

export function BulletinQuickNav() {
  const isMobile = useIsMobile();

  return (
    <nav
      aria-label="主頁區塊快速跳轉"
      data-testid="quick-nav"
      style={{
        padding: isMobile ? '8px 14px 12px' : '6px 60px 16px',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: isMobile ? 6 : 10,
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: 720,
          width: '100%',
        }}
      >
        {/* 前置指示 — 小指針 emoji */}
        {!isMobile && (
          <span
            style={{
              fontSize: 12,
              color: tokens.muted2,
              fontFamily: tokens.font.tc,
              fontWeight: 700,
              letterSpacing: '0.05em',
              marginRight: 4,
            }}
            aria-hidden="true"
          >
            👉 快速跳到
          </span>
        )}

        {NAV_ITEMS.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              scrollToId(item.id);
              trackEvent('quick_nav_click', { target: item.id });
            }}
            aria-label={`跳到${item.label}區塊`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: isMobile ? '6px 10px' : '5px 12px',
              background: item.color,
              color: tokens.ink,
              border: `1.5px solid ${tokens.ink}`,
              borderRadius: 8,
              fontSize: isMobile ? 12 : 13,
              fontWeight: 800,
              fontFamily: tokens.font.tc,
              cursor: 'pointer',
              boxShadow: '2px 2px 0 rgba(0,0,0,.18)',
              transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)`,
              transition: 'transform .15s ease, box-shadow .15s ease',
              minHeight: isMobile ? 32 : 'auto',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = `rotate(0deg) translate(-1px, -1px)`;
              e.currentTarget.style.boxShadow = '3px 3px 0 rgba(0,0,0,.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = `rotate(${i % 2 === 0 ? -1 : 1}deg)`;
              e.currentTarget.style.boxShadow = '2px 2px 0 rgba(0,0,0,.18)';
            }}
          >
            <span aria-hidden="true">{item.emoji}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
