/**
 * BulletinSiteStats — 首頁分類分佈視覺化便利貼
 *
 * 顯示「目前 N 款工具 · X 大分類」+ 甜甜圈圖（手刻 SVG）
 * 資料來源：useSiteStats hook（由 build 時的 generate-home-og.mjs 產出 site-stats.json）
 *
 * 效能：圓餅改手刻 SVG（原本 recharts 讓這張卡多下載 ~400KB vendor-charts），
 * 資料未到時先畫同尺寸骨架，避免區塊空白後突然彈出。
 *
 * 設計：便利貼風格與 BulletinLeaderboard / BulletinWishPool 同
 *
 * 互動：點任一分類扇形 → 設定首頁 ?category=xxx 並 scroll 到工具網格
 */

import { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { useSiteStats } from '@/hooks/useSiteStats';
import { tokens } from '@/design/tokens';
import { Pin } from '@/components/primitives/Pin';
import { useIsMobile } from '@/hooks/use-mobile';

// 樹視圖 lazy 載入，但不等點擊才下載（實測點下去後還要等 ~1 秒）：
// 首頁閒置時先預載，hover / focus 切換鈕時也會提前觸發；tools.json 與首頁共用快取。
const loadFamilyTree = () => import('./BulletinToolFamilyTree');
const BulletinToolFamilyTree = lazy(() =>
  loadFamilyTree().then((m) => ({ default: m.BulletinToolFamilyTree }))
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
  const isMobile = useIsMobile();

  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    if (w.requestIdleCallback) {
      w.requestIdleCallback(() => void loadFamilyTree());
    } else {
      const t = setTimeout(() => void loadFamilyTree(), 2000);
      return () => clearTimeout(t);
    }
  }, []);

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

  if (isLoading || !data) return <SiteStatsSkeleton />;

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
              onMouseEnter={() => void loadFamilyTree()}
              onFocus={() => void loadFamilyTree()}
              onTouchStart={() => void loadFamilyTree()}
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
              flexShrink: 1,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: isMobile ? '130px' : undefined,
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
          gridTemplateColumns: isMobile ? '1fr' : '160px 1fr',
          gap: isMobile ? 10 : 18,
          alignItems: 'center',
        }}
      >
        <div style={{ width: 160, height: 160, margin: isMobile ? '0 auto' : undefined }}>
          <DonutChart data={chartData} onSliceClick={onCategoryClick} />
        </div>

        {/* 圖例（可點） */}
        <ul
          style={{
            margin: 0,
            padding: 0,
            listStyle: 'none',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr',
            gap: isMobile ? '3px 8px' : '4px 12px',
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

interface Slice {
  key: string;
  name: string;
  emoji: string;
  count: number;
  color: string;
}

const SIZE = 160;
const C = SIZE / 2;
const R_OUT = 70;
const R_IN = 36;

function polar(r: number, angle: number) {
  // angle 0 = 12 點鐘方向，順時針
  return [C + r * Math.sin(angle), C - r * Math.cos(angle)];
}

function arcPath(start: number, end: number) {
  // 單一分類佔滿 360° 時 SVG arc 起終點重合會畫不出來，微縮一點
  const e = Math.min(end, start + Math.PI * 2 - 1e-4);
  const large = e - start > Math.PI ? 1 : 0;
  const [x1, y1] = polar(R_OUT, start);
  const [x2, y2] = polar(R_OUT, e);
  const [x3, y3] = polar(R_IN, e);
  const [x4, y4] = polar(R_IN, start);
  return `M${x1} ${y1}A${R_OUT} ${R_OUT} 0 ${large} 1 ${x2} ${y2}L${x3} ${y3}A${R_IN} ${R_IN} 0 ${large} 0 ${x4} ${y4}Z`;
}

/** 輕量甜甜圈圖：取代 recharts，hover 時中心顯示該分類數量 */
function DonutChart({ data, onSliceClick }: { data: Slice[]; onSliceClick?: (key: string) => void }) {
  const [hover, setHover] = useState<string | null>(null);
  const total = data.reduce((sum, d) => sum + d.count, 0) || 1;
  let angle = 0;
  const slices = data.map((d) => {
    const start = angle;
    angle += (d.count / total) * Math.PI * 2;
    return { ...d, path: arcPath(start, angle) };
  });
  const active = slices.find((s) => s.key === hover);

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE} role="img" aria-label="工具分類分佈圓餅圖">
      {slices.map((s) => (
        <path
          key={s.key}
          d={s.path}
          fill={s.color}
          stroke={tokens.ink}
          strokeWidth={2}
          strokeLinejoin="round"
          style={{
            cursor: 'pointer',
            transformOrigin: `${C}px ${C}px`,
            transform: hover === s.key ? 'scale(1.06)' : undefined,
            transition: 'transform 0.15s ease',
          }}
          onMouseEnter={() => setHover(s.key)}
          onMouseLeave={() => setHover(null)}
          onClick={() => onSliceClick?.(s.key)}
        >
          <title>{`${s.emoji} ${s.name}：${s.count} 款`}</title>
        </path>
      ))}
      {active && (
        <g pointerEvents="none" style={{ fontFamily: tokens.font.tc }}>
          <text x={C} y={C - 2} textAnchor="middle" fontSize={18} fontWeight={900} fill={tokens.ink}>
            {active.count}
          </text>
          <text x={C} y={C + 14} textAnchor="middle" fontSize={10} fontWeight={700} fill={tokens.muted2}>
            {active.name}
          </text>
        </g>
      )}
    </svg>
  );
}

/** 資料未到時的同尺寸骨架，保留版面避免 CLS */
function SiteStatsSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="工具地圖載入中"
      style={{
        position: 'relative',
        background: tokens.note.green,
        border: `2px solid ${tokens.ink}`,
        borderRadius: 10,
        padding: '18px 22px 14px',
        boxShadow: '5px 6px 0 rgba(0,0,0,.2), 0 10px 22px -8px rgba(0,0,0,.18)',
        transform: 'rotate(0.8deg)',
        fontFamily: tokens.font.tc,
        minHeight: 290,
      }}
    >
      <Pin color="#16a34a" size={18} style={{ top: -9, left: 28, marginLeft: 0 }} />
      <Pin color="#16a34a" size={18} style={{ top: -9, right: 28 }} />
      <span style={{ fontSize: 18, fontWeight: 900, color: tokens.ink }}>📊 工具地圖</span>
      <div style={{ ...skeletonBar, width: 180, height: 38, margin: '12px 0 16px' }} />
      <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        <div
          style={{
            width: 140,
            height: 140,
            margin: 10,
            borderRadius: '50%',
            border: `34px solid rgba(0,0,0,.08)`,
            boxSizing: 'border-box',
          }}
        />
        <div style={{ flex: 1, minWidth: 160, display: 'grid', gap: 10 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ ...skeletonBar, height: 14, width: `${90 - i * 12}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

const skeletonBar: React.CSSProperties = {
  background: 'rgba(0,0,0,.08)',
  borderRadius: 6,
};

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
