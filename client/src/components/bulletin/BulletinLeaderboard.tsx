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

// 🔥 火等級設定（v3.6.70）：依過去 7 天新增點擊量分三段，讓 top 5 全部熱度梯度可視化
//   delta >= 80 → 🔥🔥🔥 爆紅（深紅）
//   delta >= 30 → 🔥🔥 急上升（橘紅）
//   delta >= 10 → 🔥 上升中（黃橘）
//   <  10      → 無徽章（避免噪音）
const fireLevels = [
  { threshold: 80, emoji: '🔥🔥🔥', label: '爆紅', bg: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' },
  { threshold: 30, emoji: '🔥🔥', label: '急上升', bg: 'linear-gradient(135deg, #fb923c 0%, #c2410c 100%)' },
  { threshold: 10, emoji: '🔥', label: '上升中', bg: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)' },
];

function getFireLevel(delta: number) {
  if (!Number.isFinite(delta) || delta < 10) return null;
  for (const lv of fireLevels) {
    if (delta >= lv.threshold) return lv;
  }
  return null;
}

/**
 * 🏆 本週 TOP 5 便利貼排行榜
 * - 從傳入 tools（已合併 Firestore 即時點擊數）取累計前 5 名
 * - 全 5 名都有名次膠帶（金/銀/銅/鋁/銅紅），#4 #5 視覺份量略輕
 * - 「🔥 火等級」徽章三段：爆紅 / 急上升 / 上升中（依 7 日新增點擊量梯度）
 * - desktop hover 顯示「使用 →」hint 強化可發現性
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

  // 名次膠帶（v3.6.70：擴到 5 名，#4 #5 用淡鋁 / 淡銅紅）
  const medalColors = ['#f4c430', '#c8c8d0', '#cd7f32', '#a8b5c2', '#b87333'];
  const medalLabels = ['🥇 冠軍', '🥈 亞軍', '🥉 季軍', '🏅 第 4', '🏅 第 5'];
  const medalOpacity = [0.95, 0.95, 0.95, 0.78, 0.78];

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
            const risingDelta = deltas7d?.get(tool.id) ?? 0;
            const fireLevel = hasDeltaHistory ? getFireLevel(risingDelta) : null;
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
                  (fireLevel ? `，本週新增 ${risingDelta} 次點擊（${fireLevel.label}）` : '')
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

                {/* 名次膠帶（v3.6.70 擴到 top 5；top: -16 讓膠帶飄在卡片頂端外，避免壓到標題尾巴） */}
                {i < 5 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -16,
                      right: -4,
                      transform: 'rotate(8deg)',
                      pointerEvents: 'none',
                      zIndex: 2,
                      opacity: medalOpacity[i],
                    }}
                  >
                    <Tape color={medalColors[i]} angle={0} width={60}>
                      <span style={{ fontSize: 10 }}>{medalLabels[i]}</span>
                    </Tape>
                  </div>
                )}

                {/* 🔥 火等級徽章三段（v3.6.70：依 7 日新增點擊量分爆紅/急上升/上升中） */}
                {fireLevel && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -12,
                      left: -6,
                      transform: 'rotate(-10deg)',
                      background: fireLevel.bg,
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
                    {fireLevel.emoji} {fireLevel.label}
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
                {/* top 5 都有名次膠帶 → 全部保留 paddingRight 讓位 */}
                <div style={{ flex: 1, minWidth: 0, paddingRight: i < 5 ? 38 : 0 }}>
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
                    {hasDeltaHistory && (
                      risingDelta > 0 ? (
                        <span style={{ color: '#c2410c', fontWeight: 700 }}>
                          +{risingDelta}/週
                        </span>
                      ) : (
                        <span
                          style={{ color: tokens.muted2, opacity: 0.55 }}
                          title="過去 7 天沒上升"
                        >
                          ±0/週
                        </span>
                      )
                    )}
                  </div>
                </div>

                {/* desktop hover hint「使用 →」(v3.6.70：強化可發現性，觸控裝置由 CSS hidden) */}
                <span
                  className="use-hint"
                  aria-hidden="true"
                  style={{
                    fontFamily: tokens.font.en,
                    fontSize: 11,
                    fontWeight: 700,
                    color: tokens.ink,
                    background: 'rgba(255,255,255,.7)',
                    padding: '4px 10px',
                    borderRadius: 14,
                    whiteSpace: 'nowrap',
                    marginLeft: 4,
                  }}
                >
                  使用 →
                </span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
