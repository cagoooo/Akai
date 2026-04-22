import { useMemo } from 'react';
import { Tape } from '@/components/primitives/Tape';
import { Pin } from '@/components/primitives/Pin';
import { tokens } from '@/design/tokens';
import { getToolEmoji, normalizeUrl } from './toolAdapter';
import { useToolTracking } from '@/hooks/useToolTracking';
import { useRecentTools } from '@/hooks/useRecentTools';
import type { EducationalTool } from '@/lib/data';

interface Props {
  tools: EducationalTool[];
}

/**
 * 🏆 本週 TOP 5 便利貼排行榜
 * 直接從傳入的 tools（已在 BulletinHome 合併 Firestore 即時點擊數）排序取前五名
 */
export function BulletinLeaderboard({ tools }: Props) {
  const { trackToolUsage } = useToolTracking();
  const { addToRecent } = useRecentTools();

  const top5 = useMemo(() => {
    return [...tools]
      .filter((t) => (t.totalClicks ?? 0) > 0)
      .sort((a, b) => (b.totalClicks ?? 0) - (a.totalClicks ?? 0))
      .slice(0, 5);
  }, [tools]);

  /**
   * 處理排行榜卡片點擊：
   * 1. 追蹤到 Firestore（totalClicks +1，onSnapshot 會即時推回首頁）
   * 2. 加入「最近使用」歷史
   * 3. 開新分頁
   */
  const handleRankingClick = (e: React.MouseEvent, tool: EducationalTool) => {
    e.preventDefault();
    e.stopPropagation();
    // 先開新分頁（避免部分瀏覽器因 await 失去使用者手勢而擋掉彈窗）
    const openUrl = normalizeUrl(tool.url);
    const newWin = window.open(openUrl, '_blank', 'noopener,noreferrer');
    if (newWin) newWin.opener = null;
    // 背景追蹤
    addToRecent(tool.id);
    trackToolUsage(tool.id).catch((err) => console.error('追蹤失敗:', err));
  };

  const colors = [
    tokens.note.yellow,
    tokens.note.blue,
    tokens.note.pink,
    tokens.note.green,
    tokens.note.orange,
  ];
  const tilts = [-2, 1.5, -1, 2.5, -1.5];

  return (
    <div data-tour="tool-rankings">
      <div style={{ marginBottom: 20 }}>
        <Tape color={tokens.note.orange} angle={-2} width={180}>
          <span style={{ fontSize: 14 }}>🏆 本週 TOP 5 · RANKING</span>
        </Tape>
      </div>

      {top5.length === 0 ? (
        <div
          style={{
            background: 'rgba(255,255,255,.9)',
            border: '2px dashed #8b7356',
            borderRadius: 12,
            padding: 20,
            textAlign: 'center',
            color: tokens.muted,
            fontSize: 13,
          }}
        >
          還沒有足夠的使用數據 📊
          <br />
          <span style={{ fontSize: 11, opacity: 0.7 }}>
            多點幾次工具，排行榜就會長出來囉！
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {top5.map((tool, i) => (
            <a
              key={tool.id}
              href={normalizeUrl(tool.url)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => handleRankingClick(e, tool)}
              className="sticker-card"
              aria-label={`排名第 ${i + 1} 名：${tool.title}，${tool.totalClicks ?? 0} 次點擊`}
              style={{
                background: colors[i],
                padding: '12px 16px',
                borderRadius: 8,
                boxShadow: '0 2px 3px rgba(0,0,0,.12), 3px 3px 0 rgba(0,0,0,.15)',
                transform: `rotate(${tilts[i]}deg)`,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                textDecoration: 'none',
                color: 'inherit',
                cursor: 'pointer',
              }}
            >
              <Pin
                color={tokens.pin[i % tokens.pin.length]}
                size={14}
                style={{ top: -7, left: 14 }}
              />
              <div
                style={{
                  fontFamily: tokens.font.en,
                  fontSize: 22,
                  fontWeight: 900,
                  color: tokens.ink,
                  minWidth: 32,
                  fontStyle: 'italic',
                }}
              >
                #{i + 1}
              </div>
              <div style={{ fontSize: 28 }}>{getToolEmoji(tool)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: tokens.font.tc,
                    fontSize: 14,
                    fontWeight: 700,
                    color: tokens.ink,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tool.title}
                </div>
                <div
                  style={{
                    fontFamily: tokens.font.en,
                    fontSize: 11,
                    color: tokens.muted2,
                    marginTop: 2,
                  }}
                >
                  👆 {(tool.totalClicks ?? 0).toLocaleString()} clicks
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
