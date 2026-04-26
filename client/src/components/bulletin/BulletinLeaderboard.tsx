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
  /** 由 useToolClickStats 提供：每個 toolId 的「最近 7 日新增點擊」 */
  deltas7d?: Map<number, number>;
  /** 是否已累積 ≥1 日歷史，足以信賴 deltas7d；不足時不顯示 🔥 徽章 */
  hasDeltaHistory?: boolean;
}

/**
 * 🏆 本週 TOP 5 便利貼排行榜
 * - 從傳入 tools（已合併 Firestore 即時點擊數）取累計前 5 名
 * - 第 1/2/3 名：金 / 銀 / 銅膠帶徽章
 * - 「🔥 急上升」徽章：標記 7 日內新增點擊最多的工具（需 ≥3 點擊才顯示）
 */
export function BulletinLeaderboard({ tools, deltas7d, hasDeltaHistory }: Props) {
  const { trackToolUsage } = useToolTracking();
  const { addToRecent } = useRecentTools();

  const top5 = useMemo(() => {
    return [...tools]
      .filter((t) => (t.totalClicks ?? 0) > 0)
      .sort((a, b) => (b.totalClicks ?? 0) - (a.totalClicks ?? 0))
      .slice(0, 5);
  }, [tools]);

  // 在前 5 名中找出 7 日新增最多的；至少要 ≥3 點擊才標 🔥
  const risingId = useMemo(() => {
    if (!hasDeltaHistory || !deltas7d || top5.length === 0) return null;
    let best: { id: number; delta: number } | null = null;
    for (const t of top5) {
      const d = deltas7d.get(t.id) ?? 0;
      if (d >= 3 && (best === null || d > best.delta)) {
        best = { id: t.id, delta: d };
      }
    }
    return best?.id ?? null;
  }, [top5, deltas7d, hasDeltaHistory]);

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

  // 金 / 銀 / 銅 膠帶顏色（前 3 名）
  const medalColors = ['#f4c430', '#c8c8d0', '#cd7f32']; // gold / silver / bronze
  const medalLabels = ['🥇 冠軍', '🥈 亞軍', '🥉 季軍'];

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {top5.map((tool, i) => {
            const isRising = risingId === tool.id;
            const risingDelta = deltas7d?.get(tool.id) ?? 0;
            return (
              <a
                key={tool.id}
                href={normalizeUrl(tool.url)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => handleRankingClick(e, tool)}
                className="sticker-card"
                aria-label={
                  `排名第 ${i + 1} 名：${tool.title}，${tool.totalClicks ?? 0} 次點擊` +
                  (isRising ? `，本週新增 ${risingDelta} 次點擊（急上升）` : '')
                }
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

                {/* 金 / 銀 / 銅 膠帶（前 3 名才有，斜貼右上角） */}
                {i < 3 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -10,
                      right: -6,
                      transform: 'rotate(8deg)',
                      pointerEvents: 'none',
                      zIndex: 2,
                    }}
                  >
                    <Tape color={medalColors[i]} angle={0} width={80}>
                      <span style={{ fontSize: 11 }}>{medalLabels[i]}</span>
                    </Tape>
                  </div>
                )}

                {/* 🔥 急上升徽章（左上角貼紙） */}
                {isRising && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -12,
                      left: -6,
                      transform: 'rotate(-10deg)',
                      background: 'linear-gradient(135deg, #ff7849 0%, #e63946 100%)',
                      color: '#fff',
                      padding: '4px 10px',
                      borderRadius: 14,
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: 0.5,
                      boxShadow: '0 2px 4px rgba(0,0,0,.25), 0 0 12px rgba(255,120,73,.4)',
                      pointerEvents: 'none',
                      zIndex: 3,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    🔥 急上升 +{risingDelta}
                  </div>
                )}

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
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span>👆 {(tool.totalClicks ?? 0).toLocaleString()} clicks</span>
                    {hasDeltaHistory && risingDelta > 0 && !isRising && (
                      <span style={{ color: '#c2410c', fontWeight: 700 }}>
                        +{risingDelta}/週
                      </span>
                    )}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
