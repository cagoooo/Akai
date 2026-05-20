/**
 * BulletinSiteStats — 首頁分類分佈視覺化便利貼
 *
 * 顯示「目前 N 款工具 · X 大分類」+ 圓餅圖（recharts）
 * 資料來源：useSiteStats hook（由 build 時的 generate-home-og.mjs 產出 site-stats.json）
 *
 * 設計：便利貼風格與 BulletinLeaderboard / BulletinWishPool 同
 *
 * 互動：點任一分類扇形 → 設定首頁 ?category=xxx 並 scroll 到工具網格
 */

import { useMemo, useState, lazy, Suspense } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useSiteStats } from '@/hooks/useSiteStats';
import { tokens } from '@/design/tokens';
import { Pin } from '@/components/primitives/Pin';

// 樹視圖較重（含 tools.json fetch + SVG），lazy load 只在切到該 tab 才下載
const BulletinToolFamilyTree = lazy(() =>
  import('./BulletinToolFamilyTree').then((m) => ({ default: m.BulletinToolFamilyTree }))
);

type Mode = 'pie' | 'tree';

const CATEGORY_LABEL: Record<string, string> = {
  communication: '溝通互動',
  teaching: '教學設計',
  language: '語文寫作',
  reading: '語文閱讀',
  utilities: '實用工具',
  games: '教育遊戲',
  interactive: '互動體驗',
};

const CATEGORY_EMOJI: Record<string, string> = {
  communication: '💬',
  teaching: '📚',
  language: '✍️',
  reading: '📖',
  utilities: '🛠️',
  games: '🎮',
  interactive: '🎯',
};

interface Props {
  /** 點分類扇形時的 callback（讓使用者跳到該分類） */
  onCategoryClick?: (category: string) => void;
}

export function BulletinSiteStats({ onCategoryClick }: Props) {
  const { data, isLoading } = useSiteStats();
  const [mode, setMode] = useState<Mode>('pie');

  const chartData = useMemo(() => {
    if (!data?.categoryCounts) return [];
    return Object.entries(data.categoryCounts)
      .map(([key, count]) => ({
        key,
        name: CATEGORY_LABEL[key] || key,
        emoji: CATEGORY_EMOJI[key] || '🔖',
        count,
        color: tokens.cat[key as keyof typeof tokens.cat]?.dot || tokens.muted,
      }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  if (isLoading || !data) return null;

  const totalCategories = chartData.length;
  const topCat = chartData[0];

  return (
    <div
      data-testid="site-stats"
      style={{
        position: 'relative',
        background: tokens.note.green,
        border: `2px solid ${tokens.ink}`,
        borderRadius: 10,
        padding: '18px 22px 14px',
        boxShadow: '5px 6px 0 rgba(0,0,0,.2), 0 10px 22px -8px rgba(0,0,0,.18)',
        transform: 'rotate(0.8deg)',
        fontFamily: tokens.font.tc,
      }}
    >
      {/* 圖釘 */}
      <Pin color="#16a34a" size={18} style={{ top: -9, left: 28, marginLeft: 0 }} />
      <Pin color="#16a34a" size={18} style={{ top: -9, right: 28 }} />

      {/* 標題列 + 視圖切換 toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          marginBottom: 6,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <span style={{ fontSize: 18, fontWeight: 900, color: tokens.ink }}>📊 工具地圖</span>
          <span
            style={{
              marginLeft: 8,
              fontSize: 11,
              fontWeight: 700,
              color: tokens.muted2,
              fontStyle: 'italic',
            }}
          >
            {mode === 'pie' ? '點扇形跳到分類' : '點分類展開工具樹枝'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* pie / tree 切換 segmented control */}
          <div
            role="tablist"
            aria-label="切換視圖"
            style={{
              display: 'inline-flex',
              border: `1.8px solid ${tokens.ink}`,
              borderRadius: 999,
              overflow: 'hidden',
              background: '#fff',
              boxShadow: '1.5px 1.5px 0 rgba(0,0,0,.18)',
            }}
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'pie'}
              onClick={() => setMode('pie')}
              style={toggleBtn(mode === 'pie')}
            >
              🥧 圓餅
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'tree'}
              onClick={() => setMode('tree')}
              style={toggleBtn(mode === 'tree')}
            >
              🌳 家族樹
            </button>
          </div>
          <div style={{ fontSize: 11, color: tokens.muted2, fontFamily: tokens.font.en }}>
            updated {data.generatedAt ? new Date(data.generatedAt).toLocaleDateString('zh-TW') : '—'}
          </div>
        </div>
      </div>

      {/* 數字大字 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 14,
          marginBottom: 10,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <span
            style={{
              fontSize: 42,
              fontWeight: 900,
              color: tokens.ink,
              fontFamily: tokens.font.en,
              lineHeight: 1,
            }}
          >
            {data.toolCount}
          </span>
          <span style={{ marginLeft: 4, fontSize: 13, fontWeight: 700, color: tokens.muted2 }}>
            款工具
          </span>
        </div>
        <div style={{ color: tokens.muted2, fontSize: 13 }}>·</div>
        <div>
          <span
            style={{
              fontSize: 30,
              fontWeight: 900,
              color: tokens.ink,
              fontFamily: tokens.font.en,
              lineHeight: 1,
            }}
          >
            {totalCategories}
          </span>
          <span style={{ marginLeft: 4, fontSize: 13, fontWeight: 700, color: tokens.muted2 }}>
            大分類
          </span>
        </div>
        {topCat && (
          <div
            style={{
              marginLeft: 'auto',
              fontSize: 12,
              fontWeight: 700,
              color: tokens.muted2,
              background: '#fff',
              padding: '4px 10px',
              borderRadius: 999,
              border: `1.5px solid ${tokens.ink}`,
              boxShadow: '1.5px 1.5px 0 rgba(0,0,0,.18)',
            }}
          >
            最大宗：{topCat.emoji} {topCat.name} ({topCat.count})
          </div>
        )}
      </div>

      {/* 視圖區：圓餅 / 家族樹 切換 */}
      {mode === 'tree' ? (
        <Suspense
          fallback={
            <div style={{ textAlign: 'center', padding: 60, color: tokens.muted2, fontFamily: tokens.font.tc, fontStyle: 'italic' }}>
              🌳 家族樹載入中...
            </div>
          }
        >
          <BulletinToolFamilyTree />
        </Suspense>
      ) : (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '160px 1fr',
          gap: 18,
          alignItems: 'center',
        }}
      >
        <div style={{ width: 160, height: 160 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="name"
                innerRadius={36}
                outerRadius={70}
                strokeWidth={2}
                stroke={tokens.ink}
                onClick={(d) => onCategoryClick?.((d as { key: string }).key)}
                cursor="pointer"
              >
                {chartData.map((d) => (
                  <Cell key={d.key} fill={d.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, _name: string, props: { payload?: { emoji?: string; name?: string } }) => [
                  `${value} 款`,
                  `${props.payload?.emoji || ''} ${props.payload?.name || ''}`,
                ]}
                contentStyle={{
                  background: '#fefdfa',
                  border: `2px solid ${tokens.ink}`,
                  borderRadius: 6,
                  fontFamily: tokens.font.tc,
                  fontSize: 12,
                  boxShadow: '2px 2px 0 rgba(0,0,0,.2)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 圖例（可點） */}
        <ul
          style={{
            margin: 0,
            padding: 0,
            listStyle: 'none',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4px 12px',
            fontSize: 12,
            color: tokens.ink,
          }}
        >
          {chartData.map((d) => (
            <li key={d.key}>
              <button
                type="button"
                onClick={() => onCategoryClick?.(d.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  padding: '3px 0',
                  fontFamily: tokens.font.tc,
                  fontSize: 12,
                  fontWeight: 600,
                  color: tokens.ink,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                aria-label={`跳到分類：${d.name}`}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 3,
                    background: d.color,
                    border: `1.5px solid ${tokens.ink}`,
                    flex: 'none',
                  }}
                />
                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {d.emoji} {d.name}
                </span>
                <span style={{ fontWeight: 800, fontFamily: tokens.font.en }}>{d.count}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      )}
    </div>
  );
}

function toggleBtn(active: boolean): React.CSSProperties {
  return {
    padding: '5px 12px',
    fontSize: 12,
    fontFamily: 'inherit',
    fontWeight: 800,
    color: active ? '#fff' : '#1a1a1a',
    background: active ? '#ea8a3e' : 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.15s ease',
  };
}
