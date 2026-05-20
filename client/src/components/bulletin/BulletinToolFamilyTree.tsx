/**
 * BulletinToolFamilyTree — 工具家族樹（徑向 SVG，不引 D3）
 *
 * 視覺：中心為「全部 N 個工具」，7 大分類往外輻射，每個分類下展開該分類的工具點。
 * 互動：
 *   - 點分類節點 → 切換展開 / 收合該分類
 *   - 點工具節點 → 跳到 /tool/:id
 *   - 滑鼠 hover 工具節點 → 顯示 tooltip（標題）
 *
 * 無外部依賴（不用 D3）：節點座標靠角度 / 半徑自算，<150 行核心邏輯。
 *
 * 自動隨時間擴張：tools.json 新增工具 → 對應分類分支多一個葉子。
 */

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import type { EducationalTool } from '@/lib/data';
import { tokens } from '@/design/tokens';

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

const W = 720;
const H = 540;
const CENTER = { x: W / 2, y: H / 2 };
const CAT_RADIUS = 140; // 分類圈半徑
const TOOL_RADIUS_BASE = 70; // 工具離分類節點的距離
const TOOL_RADIUS_STEP = 22; // 同分類多層工具的層距

interface CategoryNode {
  key: string;
  label: string;
  emoji: string;
  color: string;
  tools: EducationalTool[];
  angle: number;
  x: number;
  y: number;
}

export function BulletinToolFamilyTree() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [hoverTool, setHoverTool] = useState<EducationalTool | null>(null);

  const { data: tools } = useQuery<EducationalTool[]>({
    queryKey: ['/api/tools'],
    queryFn: async () => {
      const base = import.meta.env.BASE_URL || '/';
      const version = import.meta.env.VITE_APP_VERSION || Date.now();
      const res = await fetch(`${base}api/tools.json?v=${version}`);
      if (!res.ok) throw new Error('tools fetch failed');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  // 構建分類 → 工具 mapping，並算徑向座標
  const categories = useMemo<CategoryNode[]>(() => {
    if (!tools) return [];
    const groups = new Map<string, EducationalTool[]>();
    for (const t of tools) {
      const k = t.category || 'utilities';
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k)!.push(t);
    }
    const entries = Array.from(groups.entries()).sort((a, b) => b[1].length - a[1].length);
    const n = entries.length;
    return entries.map(([key, ts], i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2; // 從 12 點鐘方向起算
      return {
        key,
        label: CATEGORY_LABEL[key] || key,
        emoji: CATEGORY_EMOJI[key] || '🔖',
        color: tokens.cat[key as keyof typeof tokens.cat]?.dot || tokens.muted,
        tools: ts.sort((a, b) => a.id - b.id),
        angle,
        x: CENTER.x + Math.cos(angle) * CAT_RADIUS,
        y: CENTER.y + Math.sin(angle) * CAT_RADIUS,
      };
    });
  }, [tools]);

  // 預設展開最大分類（讓初始畫面有東西看）
  useEffect(() => {
    if (categories.length > 0 && expanded.size === 0) {
      setExpanded(new Set([categories[0].key]));
    }
  }, [categories]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalTools = tools?.length || 0;

  // 工具節點座標：圍繞分類節點同方向再延伸
  function toolPosition(cat: CategoryNode, toolIdx: number, total: number) {
    // 在分類節點外側展開扇形（左右各 ±35°）
    const spread = Math.min(Math.PI * 0.5, total * 0.08);
    const offset = total === 1 ? 0 : (toolIdx / (total - 1) - 0.5) * spread;
    const a = cat.angle + offset;
    const layer = Math.floor(toolIdx / 12);
    const r = TOOL_RADIUS_BASE + layer * TOOL_RADIUS_STEP;
    return { x: cat.x + Math.cos(a) * r, y: cat.y + Math.sin(a) * r };
  }

  function handleCatClick(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div
      style={{
        position: 'relative',
        background: '#fefdfa',
        border: `2.5px dashed ${tokens.muted}`,
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      {/* 工具列 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          borderBottom: `1.5px solid ${tokens.paperEdge}`,
          fontFamily: tokens.font.tc,
          fontSize: 12,
        }}
      >
        <div>
          🌳 點分類圓圈展開 / 收合該分類的工具樹枝
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            onClick={() => setExpanded(new Set(categories.map((c) => c.key)))}
            style={chipBtn(false)}
          >
            全部展開
          </button>
          <button type="button" onClick={() => setExpanded(new Set())} style={chipBtn(false)}>
            全部收合
          </button>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="auto"
        style={{ display: 'block' }}
        aria-label="工具家族樹"
      >
        <defs>
          <filter id="treeShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0.5" dy="1" stdDeviation="0.8" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* 主幹連線（根 → 分類） */}
        {categories.map((cat) => (
          <line
            key={`stem-${cat.key}`}
            x1={CENTER.x}
            y1={CENTER.y}
            x2={cat.x}
            y2={cat.y}
            stroke={tokens.muted}
            strokeWidth={2}
            strokeOpacity={0.5}
            strokeDasharray="4 4"
          />
        ))}

        {/* 工具葉子連線（分類 → 工具） */}
        {categories.map((cat) =>
          expanded.has(cat.key)
            ? cat.tools.map((tool, idx) => {
                const p = toolPosition(cat, idx, cat.tools.length);
                return (
                  <line
                    key={`leaf-${cat.key}-${tool.id}`}
                    x1={cat.x}
                    y1={cat.y}
                    x2={p.x}
                    y2={p.y}
                    stroke={cat.color}
                    strokeOpacity={0.4}
                    strokeWidth={1.5}
                  />
                );
              })
            : null
        )}

        {/* 工具葉子 */}
        {categories.map((cat) =>
          expanded.has(cat.key)
            ? cat.tools.map((tool, idx) => {
                const p = toolPosition(cat, idx, cat.tools.length);
                const isHover = hoverTool?.id === tool.id;
                return (
                  <Link key={`tool-${tool.id}`} href={`/tool/${tool.id}`}>
                    <g
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoverTool(tool)}
                      onMouseLeave={() => setHoverTool(null)}
                    >
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isHover ? 7 : 5}
                        fill={cat.color}
                        stroke={tokens.ink}
                        strokeWidth={1.2}
                        filter="url(#treeShadow)"
                      />
                      {isHover && (
                        <text
                          x={p.x}
                          y={p.y - 11}
                          textAnchor="middle"
                          fontSize="10"
                          fontWeight="800"
                          fill={tokens.ink}
                          style={{
                            fontFamily: tokens.font.tc,
                            paintOrder: 'stroke',
                            stroke: '#fff',
                            strokeWidth: 3,
                          }}
                        >
                          #{tool.id}
                        </text>
                      )}
                    </g>
                  </Link>
                );
              })
            : null
        )}

        {/* 分類節點（彩色圓圈 + emoji + 數字） */}
        {categories.map((cat) => {
          const isExpanded = expanded.has(cat.key);
          return (
            <g
              key={`cat-${cat.key}`}
              transform={`translate(${cat.x}, ${cat.y})`}
              style={{ cursor: 'pointer' }}
              onClick={() => handleCatClick(cat.key)}
            >
              <circle
                r={26}
                fill={isExpanded ? cat.color : '#fff'}
                stroke={tokens.ink}
                strokeWidth={2}
                filter="url(#treeShadow)"
              />
              <text textAnchor="middle" y={-2} fontSize="16">
                {cat.emoji}
              </text>
              <text
                textAnchor="middle"
                y={12}
                fontSize="11"
                fontWeight="900"
                fill={isExpanded ? '#fff' : tokens.ink}
                style={{ fontFamily: tokens.font.en }}
              >
                {cat.tools.length}
              </text>
              {/* 分類標籤（外側） */}
              <text
                textAnchor="middle"
                y={cat.y > CENTER.y ? 45 : -32}
                fontSize="11"
                fontWeight="800"
                fill={tokens.ink}
                style={{
                  fontFamily: tokens.font.tc,
                  paintOrder: 'stroke',
                  stroke: '#fefdfa',
                  strokeWidth: 3,
                }}
              >
                {cat.label}
              </text>
            </g>
          );
        })}

        {/* 根節點（中央） */}
        <g transform={`translate(${CENTER.x}, ${CENTER.y})`}>
          <circle r={42} fill={tokens.accent} stroke={tokens.ink} strokeWidth={2.5} filter="url(#treeShadow)" />
          <circle r={38} fill="none" stroke="#fff" strokeWidth={1.5} strokeDasharray="3 2" opacity={0.7} />
          <text textAnchor="middle" y={-6} fontSize="20" fontWeight="900" fill="#fff" style={{ fontFamily: tokens.font.en }}>
            {totalTools}
          </text>
          <text
            textAnchor="middle"
            y={12}
            fontSize="10"
            fontWeight="800"
            fill="#fff"
            style={{ fontFamily: tokens.font.tc }}
          >
            款工具
          </text>
        </g>

        {/* hover tooltip — 大字浮在中下方 */}
        {hoverTool && (
          <g transform={`translate(${CENTER.x}, ${H - 30})`}>
            <rect
              x={-180}
              y={-22}
              width={360}
              height={32}
              fill={tokens.ink}
              opacity={0.92}
              rx={6}
            />
            <text
              textAnchor="middle"
              fontSize="13"
              fontWeight="800"
              fill="#fff"
              style={{ fontFamily: tokens.font.tc }}
            >
              #{hoverTool.id} {hoverTool.title.length > 24 ? hoverTool.title.slice(0, 23) + '…' : hoverTool.title}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

function chipBtn(active: boolean): React.CSSProperties {
  return {
    padding: '3px 10px',
    fontSize: 11,
    fontFamily: tokens.font.tc,
    fontWeight: 800,
    color: active ? '#fff' : tokens.ink,
    background: active ? tokens.accent : '#fff',
    border: `1.5px solid ${tokens.ink}`,
    borderRadius: 999,
    cursor: 'pointer',
    boxShadow: '1.5px 1.5px 0 rgba(0,0,0,.18)',
  };
}
