/**
 * ToolIndexAI — 工具索引神器 · #100 智能推薦器
 *
 * 在 /tool/100 提供「描述你要做什麼 → 從 100 款工具中找最匹配的」體驗。
 *
 * Phase 1（本版）：純前端 fuse.js fuzzy match
 *   - 比對欄位：title (weight 3) > tags (2) > description (1) > detailedDescription (0.5)
 *   - top 5 即時推薦
 *   - 高亮匹配關鍵字
 *
 * Phase 2（未來）：可選 Gemini Embedding 語意搜尋（Cloud Function 接 query embedding，前端算 cosine similarity）
 */

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import Fuse, { type FuseResult, type FuseResultMatch } from 'fuse.js';
import { PageHead } from '@/components/PageHead';
import { trackEvent, logToolIndexQuery } from '@/lib/analytics';
import { isSemanticSearchAvailable, semanticSearch } from '@/lib/embeddingSearch';
import type { EducationalTool } from '@/lib/data';
import { tokens } from '@/design/tokens';
import { Pin } from '@/components/primitives/Pin';
import { Tape } from '@/components/primitives/Tape';
import { BulletinHeader } from '@/components/bulletin/BulletinHeader';
import { BulletinFooter } from '@/components/bulletin/BulletinFooter';
import { BulletinBackToTop } from '@/components/bulletin/BulletinBackToTop';
import { getCategoryKey, getCategoryLabel, getToolEmoji } from '@/components/bulletin/toolAdapter';
import { useSiteStats } from '@/hooks/useSiteStats';

// 範例 query chips — 由 scripts/sync-popular-queries.mjs 從 Firestore 真實熱門搜尋詞自動同步
// 沒 Firestore 認證時保留 fallback（手動 curate 的經典範例）
import { POPULAR_QUERIES as EXAMPLE_QUERIES } from '@/data/popularQueries';

// 從匹配結果產生「為什麼推薦」說明
function buildReason(match: FuseResultMatch | undefined, tool: EducationalTool, query: string): string {
  if (!match || !match.value) {
    return `與「${query}」高度相關`;
  }
  const fieldLabel: Record<string, string> = {
    title: '標題',
    description: '描述',
    detailedDescription: '詳細介紹',
    tags: '標籤',
  };
  const label = fieldLabel[match.key || ''] || '內容';
  // 取出第一段 match indices 的文字片段
  if (match.indices && match.indices.length > 0) {
    const [start, end] = match.indices[0];
    const snippet = match.value.slice(start, end + 1);
    return `${label}命中「${snippet}」`;
  }
  return `${label}相關`;
}

type SearchMode = 'fuzzy' | 'semantic';

export function ToolIndexAI() {
  const { data: stats } = useSiteStats();
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('fuzzy');
  const [semanticAvailable, setSemanticAvailable] = useState(false);
  const [semanticResults, setSemanticResults] = useState<FuseResult<EducationalTool>[] | null>(null);
  const [semanticLoading, setSemanticLoading] = useState(false);
  const [semanticError, setSemanticError] = useState<string | null>(null);

  // 偵測語意搜尋是否可用（tool-embeddings.json 是否存在）
  useEffect(() => {
    void isSemanticSearchAvailable().then(setSemanticAvailable);
  }, []);

  // 從 tools.json 抓所有工具
  const { data: tools, isLoading } = useQuery<EducationalTool[]>({
    queryKey: ['/api/tools'],
    queryFn: async () => {
      const base = import.meta.env.BASE_URL || '/';
      const version = import.meta.env.VITE_APP_VERSION || Date.now();
      const res = await fetch(`${base}api/tools.json?v=${version}`);
      if (!res.ok) throw new Error('無法載入工具資料');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  // 排除自己（#100），避免推薦自己
  const externalTools = useMemo(
    () => (tools || []).filter((t) => t.id !== 100),
    [tools]
  );

  // 初始化 Fuse instance（依賴 tools 改變才重建）
  const fuse = useMemo(() => {
    if (externalTools.length === 0) return null;
    return new Fuse<EducationalTool>(externalTools, {
      keys: [
        { name: 'title', weight: 3 },
        { name: 'tags', weight: 2 },
        { name: 'description', weight: 1 },
        { name: 'detailedDescription', weight: 0.5 },
      ],
      includeMatches: true,
      includeScore: true,
      threshold: 0.42, // 0 = 完全相同；1 = 任何匹配。0.42 是繁中模糊比對甜蜜點
      ignoreLocation: true,
      minMatchCharLength: 2,
    });
  }, [externalTools]);

  // Fuzzy 即時搜尋（client-side fuse.js）
  const fuzzyResults: FuseResult<EducationalTool>[] = useMemo(() => {
    if (!fuse || !query.trim()) return [];
    return fuse.search(query, { limit: 5 });
  }, [fuse, query]);

  // 語意搜尋：query 變動 + semantic 模式 → debounced 800ms 呼叫 Cloud Function
  useEffect(() => {
    if (searchMode !== 'semantic' || !semanticAvailable || !query.trim()) {
      setSemanticResults(null);
      setSemanticError(null);
      return;
    }
    setSemanticLoading(true);
    setSemanticError(null);
    const handle = setTimeout(async () => {
      try {
        const semantic = await semanticSearch(query, 5);
        // 把 {toolId, score} 包裝成 FuseResult 型別讓 UI 共用渲染
        const wrapped: FuseResult<EducationalTool>[] = semantic
          .map((s) => {
            const tool = externalTools.find((t) => t.id === s.toolId);
            if (!tool) return null;
            return {
              item: tool,
              refIndex: 0,
              score: 1 - s.score, // FuseResult.score 越小越好；cosine 越大越好 → 反向
              matches: [],
            } as FuseResult<EducationalTool>;
          })
          .filter((x): x is FuseResult<EducationalTool> => x !== null);
        setSemanticResults(wrapped);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn('[ToolIndexAI] semantic search failed, fallback fuzzy', msg);
        setSemanticError(msg);
        setSemanticResults(null);
      } finally {
        setSemanticLoading(false);
      }
    }, 800);
    return () => clearTimeout(handle);
  }, [searchMode, semanticAvailable, query, externalTools]);

  // 最終 results：semantic 優先 → fuzzy fallback
  const results: FuseResult<EducationalTool>[] = useMemo(() => {
    if (searchMode === 'semantic' && semanticResults) return semanticResults;
    return fuzzyResults;
  }, [searchMode, semanticResults, fuzzyResults]);

  // 搜尋上報（debounced 500ms 避免每打一個字都送一次）
  useEffect(() => {
    if (!query.trim()) return;
    const handle = setTimeout(() => {
      trackEvent('tool_index_search', {
        query: query.slice(0, 100),
        result_count: results.length,
        top_match_id: results[0]?.item.id,
        mode: searchMode,
      });
      void logToolIndexQuery(query, results.length);
    }, 500);
    return () => clearTimeout(handle);
  }, [query, results, searchMode]);

  // 沒搜尋字時顯示熱門工具（最後 5 個工具當作「最新精選」）
  const fallbackPicks = useMemo(() => {
    return externalTools.slice(-5).reverse();
  }, [externalTools]);

  const displayResults = query.trim() ? results : null;

  return (
    <>
      <PageHead
        mode="custom"
        title="🧭 工具索引神器 · 從 100 款教育工具中找到最適合你的"
        description="輸入課程主題、教學情境或學生需求，從阿凱老師親手打造的 100 款國小教育工具中模糊比對推薦最匹配的 5 個組合。fuse.js 即時搜尋，免註冊免費使用。"
        image="/previews/og/tool_100.webp"
        path="/tool/100"
      />

      <BulletinHeader />

      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: 'clamp(20px, 3vw, 36px) clamp(20px, 3vw, 40px) 60px',
          fontFamily: tokens.font.tc,
        }}
      >
        {/* 標題區（金色慶祝便利貼） */}
        <div
          style={{
            position: 'relative',
            background: '#fff27a',
            border: `3px solid ${tokens.ink}`,
            borderRadius: 10,
            padding: '24px 28px 22px',
            boxShadow: '6px 7px 0 rgba(0,0,0,.22), 0 10px 24px -8px rgba(0,0,0,.2)',
            transform: 'rotate(-0.6deg)',
            marginBottom: 32,
          }}
        >
          <Pin color="#dc2626" size={22} style={{ top: -12, left: '50%', marginLeft: -11 }} />
          <Pin color="#fbbf24" size={18} style={{ top: -10, left: 30 }} />
          <Pin color="#fbbf24" size={18} style={{ top: -10, right: 30 }} />

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
            <Tape color="#fde047" width={160} angle={-2}>
              🎉 100 工具達成
            </Tape>
            <span style={{ fontSize: 13, color: tokens.muted2, fontWeight: 700 }}>
              · #100 特別企劃
            </span>
          </div>

          <h1
            style={{
              fontSize: 38,
              fontWeight: 900,
              color: tokens.ink,
              margin: '4px 0 6px',
              letterSpacing: '0.01em',
            }}
          >
            🧭 工具索引神器
          </h1>

          <p style={{ fontSize: 16, color: tokens.muted2, margin: '0 0 4px', lineHeight: 1.6 }}>
            告訴我你想做什麼，從 <strong style={{ color: tokens.ink }}>{stats?.toolCount ?? 100}</strong> 款工具中為你挑出最匹配的 5 個組合。
          </p>
          <p style={{ fontSize: 12, color: tokens.muted2, margin: 0, fontStyle: 'italic' }}>
            阿凱老師親手打造 · 比制式分類更懂你的需求
          </p>
        </div>

        {/* 搜尋框 */}
        <div
          style={{
            background: '#fff',
            border: `3px solid ${tokens.ink}`,
            borderRadius: 14,
            padding: 18,
            boxShadow: '5px 6px 0 rgba(0,0,0,.2)',
            marginBottom: 20,
            position: 'relative',
          }}
        >
          <label
            htmlFor="tool-index-query"
            style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 800,
              color: tokens.ink,
              marginBottom: 8,
            }}
          >
            ✍️ 描述你的需求（中文 / 關鍵字 / 課程情境）
          </label>
          <input
            id="tool-index-query"
            type="search"
            inputMode="search"
            enterKeyHint="search"
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="例：我下週要上水的三態，需要互動式教材⋯⋯"
            autoFocus
            style={{
              width: '100%',
              padding: '14px 16px',
              fontSize: 17, // ≥16 防 iOS 縮放
              fontFamily: tokens.font.tc,
              fontWeight: 600,
              color: tokens.ink,
              background: tokens.note.yellow,
              border: `2.5px solid ${tokens.ink}`,
              borderRadius: 10,
              boxSizing: 'border-box',
              outline: 'none',
              boxShadow: 'inset 2px 2px 0 rgba(0,0,0,.08)',
              WebkitAppearance: 'none',
            }}
            data-testid="tool-index-query"
          />

          {/* 搜尋模式 toggle（語意搜尋 vs 字面比對） */}
          {semanticAvailable && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: tokens.muted2, fontWeight: 800 }}>
                🔍 搜尋模式
              </span>
              <div
                role="tablist"
                style={{
                  display: 'inline-flex',
                  border: `1.8px solid ${tokens.ink}`,
                  borderRadius: 999,
                  overflow: 'hidden',
                  background: '#fff',
                  boxShadow: '1.5px 1.5px 0 rgba(0,0,0,.14)',
                }}
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={searchMode === 'fuzzy'}
                  onClick={() => setSearchMode('fuzzy')}
                  style={{
                    padding: '5px 12px',
                    fontSize: 12,
                    fontFamily: tokens.font.tc,
                    fontWeight: 800,
                    color: searchMode === 'fuzzy' ? '#fff' : tokens.ink,
                    background: searchMode === 'fuzzy' ? tokens.accent : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                >
                  ⚡ 字面比對
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={searchMode === 'semantic'}
                  onClick={() => setSearchMode('semantic')}
                  style={{
                    padding: '5px 12px',
                    fontSize: 12,
                    fontFamily: tokens.font.tc,
                    fontWeight: 800,
                    color: searchMode === 'semantic' ? '#fff' : tokens.ink,
                    background: searchMode === 'semantic' ? tokens.red : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                >
                  🧠 語意搜尋
                  <span style={{ marginLeft: 4, fontSize: 9, padding: '1px 4px', background: 'rgba(255,255,255,.25)', borderRadius: 4, verticalAlign: 'middle' }}>
                    BETA
                  </span>
                </button>
              </div>
              {searchMode === 'semantic' && (
                <span style={{ fontSize: 11, color: tokens.muted2, fontStyle: 'italic' }}>
                  {semanticLoading ? '⏳ Gemini 思考中…' :
                   semanticError ? '⚠️ 語意搜尋失敗，改用字面比對' :
                   '「我想讓害羞學生開口」這類抽象描述能找到對的工具'}
                </span>
              )}
            </div>
          )}

          {/* 範例 query chips */}
          <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <span style={{ fontSize: 11, color: tokens.muted2, fontWeight: 700, alignSelf: 'center' }}>
              💡 試試：
            </span>
            {EXAMPLE_QUERIES.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQuery(q)}
                style={{
                  padding: '4px 10px',
                  fontSize: 12,
                  fontFamily: tokens.font.tc,
                  fontWeight: 700,
                  color: tokens.ink,
                  background: query === q ? tokens.accent : '#fff',
                  border: `1.5px solid ${tokens.ink}`,
                  borderRadius: 999,
                  cursor: 'pointer',
                  boxShadow: '1.5px 1.5px 0 rgba(0,0,0,.18)',
                  transition: 'all 0.15s ease',
                }}
                aria-pressed={query === q}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* 結果區 */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: 60, color: tokens.muted2, fontStyle: 'italic' }}>
            📌 載入工具資料中…
          </div>
        )}

        {!isLoading && displayResults !== null && displayResults.length === 0 && (
          <NoResults query={query} />
        )}

        {!isLoading && displayResults !== null && displayResults.length > 0 && (
          <ResultsList results={displayResults} query={query} />
        )}

        {!isLoading && displayResults === null && (
          <FallbackPicks tools={fallbackPicks} />
        )}

        {/* 底部：說明 Phase 1 限制 */}
        <div
          style={{
            marginTop: 36,
            padding: '16px 20px',
            background: tokens.note.blue,
            border: `2px solid ${tokens.ink}`,
            borderRadius: 10,
            boxShadow: '3px 3px 0 rgba(0,0,0,.18)',
            fontSize: 12,
            color: tokens.muted2,
            transform: 'rotate(-0.5deg)',
          }}
        >
          <strong style={{ color: tokens.ink, fontSize: 13 }}>🔬 推薦原理</strong>
          <p style={{ margin: '6px 0 0', lineHeight: 1.6 }}>
            Phase 1（目前）：純前端 fuse.js 模糊比對，依「標題 &gt; 標籤 &gt; 描述」加權排序。
            未來 Phase 2 會接 Gemini Embedding 語意搜尋，讓「我想讓學生開心」這類抽象描述也能找到對的工具。
          </p>
        </div>
      </div>

      <BulletinFooter />
      <BulletinBackToTop />
    </>
  );
}

// ── 子元件 ────────────────────────────────────────

function NoResults({ query }: { query: string }) {
  return (
    <div
      style={{
        background: tokens.note.pink,
        border: `2.5px solid ${tokens.ink}`,
        borderRadius: 10,
        padding: '28px 24px',
        textAlign: 'center',
        boxShadow: '4px 5px 0 rgba(0,0,0,.18)',
        transform: 'rotate(0.5deg)',
        fontFamily: tokens.font.tc,
      }}
    >
      <div style={{ fontSize: 36, marginBottom: 8 }}>🤔</div>
      <h3 style={{ fontSize: 18, fontWeight: 900, color: tokens.ink, margin: '4px 0 8px' }}>
        沒找到匹配「{query}」的工具
      </h3>
      <p style={{ fontSize: 13, color: tokens.muted2, margin: 0, lineHeight: 1.6 }}>
        試試更短的關鍵字，或<Link href="/?wish=1" style={{ color: tokens.red, fontWeight: 800, textDecoration: 'underline' }}> 在許願池許願 ✨ </Link>讓阿凱老師考慮做這個工具！
      </p>
    </div>
  );
}

function ResultsList({
  results,
  query,
}: {
  results: FuseResult<EducationalTool>[];
  query: string;
}) {
  return (
    <div>
      <h2
        style={{
          fontSize: 18,
          fontWeight: 900,
          color: tokens.ink,
          margin: '0 0 14px 4px',
          display: 'flex',
          alignItems: 'baseline',
          gap: 8,
        }}
      >
        🎯 為你推薦
        <span style={{ fontSize: 13, fontWeight: 700, color: tokens.muted2 }}>
          （{results.length} 個匹配「{query}」）
        </span>
      </h2>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {results.map((r, idx) => (
          <RecommendCard
            key={r.item.id}
            tool={r.item}
            score={r.score ?? 1}
            match={r.matches?.[0]}
            rank={idx + 1}
            query={query}
          />
        ))}
      </ul>
    </div>
  );
}

function FallbackPicks({ tools }: { tools: EducationalTool[] }) {
  return (
    <div>
      <h2
        style={{
          fontSize: 18,
          fontWeight: 900,
          color: tokens.ink,
          margin: '0 0 14px 4px',
          display: 'flex',
          alignItems: 'baseline',
          gap: 8,
        }}
      >
        🔥 最新精選
        <span style={{ fontSize: 13, fontWeight: 700, color: tokens.muted2 }}>
          （等你輸入需求，先看看最近新作）
        </span>
      </h2>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {tools.map((tool, idx) => (
          <RecommendCard key={tool.id} tool={tool} score={1} match={undefined} rank={idx + 1} query="" />
        ))}
      </ul>
    </div>
  );
}

function RecommendCard({
  tool,
  score,
  match,
  rank,
  query,
}: {
  tool: EducationalTool;
  score: number;
  match: FuseResultMatch | undefined;
  rank: number;
  query: string;
}) {
  const catKey = getCategoryKey(tool.category);
  const C = tokens.cat[catKey];
  const emoji = getToolEmoji(tool);
  const reason = query ? buildReason(match, tool, query) : `分類：${getCategoryLabel(tool.category)}`;
  const matchPct = query ? Math.round((1 - score) * 100) : null;
  const previewSrc = tool.previewUrl
    ? `${import.meta.env.BASE_URL}previews/${tool.previewUrl.split('/').pop()}`
    : null;

  return (
    <li>
      <Link
        href={`/tool/${tool.id}`}
        style={{
          textDecoration: 'none',
          color: 'inherit',
          display: 'block',
        }}
      >
        <div
          style={{
            background: '#fff',
            border: `2.5px solid ${tokens.ink}`,
            borderRadius: 12,
            padding: 14,
            display: 'grid',
            gridTemplateColumns: '88px 1fr auto',
            gap: 16,
            alignItems: 'center',
            boxShadow: '4px 5px 0 rgba(0,0,0,.18)',
            transition: 'transform 0.18s ease, box-shadow 0.18s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translate(-2px, -2px)';
            e.currentTarget.style.boxShadow = '6px 7px 0 rgba(0,0,0,.22)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translate(0, 0)';
            e.currentTarget.style.boxShadow = '4px 5px 0 rgba(0,0,0,.18)';
          }}
        >
          {/* 排名 + 預覽圖 */}
          <div style={{ position: 'relative', width: 88, height: 88 }}>
            <div
              style={{
                position: 'absolute',
                top: -6,
                left: -6,
                background: tokens.accent,
                color: '#fff',
                border: `2px solid ${tokens.ink}`,
                borderRadius: 999,
                width: 28,
                height: 28,
                display: 'grid',
                placeItems: 'center',
                fontSize: 12,
                fontWeight: 900,
                fontFamily: tokens.font.en,
                boxShadow: '1.5px 1.5px 0 rgba(0,0,0,.2)',
                zIndex: 2,
              }}
            >
              #{rank}
            </div>
            <div
              style={{
                width: 88,
                height: 88,
                background: C.bg,
                border: `2px solid ${tokens.ink}`,
                borderRadius: 8,
                display: 'grid',
                placeItems: 'center',
                fontSize: 36,
                overflow: 'hidden',
              }}
            >
              {previewSrc ? (
                <img
                  src={previewSrc}
                  alt={tool.title}
                  width="84"
                  height="84"
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span>{emoji}</span>
              )}
            </div>
          </div>

          {/* 標題 + 推薦原因 */}
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 8,
                marginBottom: 4,
                flexWrap: 'wrap',
              }}
            >
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 900,
                  color: tokens.ink,
                  margin: 0,
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {emoji} {tool.title}
              </h3>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '2px 8px',
                  background: C.bg,
                  color: C.fg,
                  border: `1.5px solid ${tokens.ink}`,
                  borderRadius: 999,
                  whiteSpace: 'nowrap',
                }}
              >
                {getCategoryLabel(tool.category)}
              </span>
            </div>
            <p
              style={{
                fontSize: 13,
                color: tokens.muted2,
                margin: '0 0 6px',
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {tool.description}
            </p>
            <div
              style={{
                fontSize: 11,
                color: tokens.red,
                fontWeight: 700,
                background: '#fff2f0',
                display: 'inline-block',
                padding: '2px 8px',
                borderRadius: 999,
                border: `1.2px solid ${tokens.red}`,
              }}
            >
              💡 {reason}
            </div>
          </div>

          {/* 匹配度 + CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            {matchPct !== null && (
              <div
                style={{
                  fontSize: 11,
                  color: tokens.muted2,
                  fontWeight: 800,
                  fontFamily: tokens.font.en,
                  textAlign: 'right',
                }}
              >
                匹配度
                <div
                  style={{
                    fontSize: 22,
                    color: matchPct >= 70 ? tokens.red : tokens.accent,
                    lineHeight: 1,
                  }}
                >
                  {matchPct}%
                </div>
              </div>
            )}
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: tokens.ink,
                background: tokens.accent,
                padding: '6px 12px',
                border: `2px solid ${tokens.ink}`,
                borderRadius: 999,
                boxShadow: '2px 2px 0 rgba(0,0,0,.2)',
                whiteSpace: 'nowrap',
              }}
            >
              開啟 →
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
}
