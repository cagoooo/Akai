/**
 * BlogList — 教學情境部落格列表 (/blog)
 *
 * 包含：
 *   - 98 篇手寫長文（100% 工具覆蓋率：5 大部署平台全收錄）
 *   - 即時搜尋（fuse.js 模糊比對 title / excerpt / tags）
 *   - 7 大分類 chip + 5 大部署平台 chip（按平台篩選）
 *   - URL query 同步（?q=, ?cat=, ?platform=）讓條件可分享
 *   - 沒結果時引導到許願池
 */

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import Fuse from 'fuse.js';
import { useQuery } from '@tanstack/react-query';
import { POSTS, getAllPostsAsync, type BlogPost } from '@/blog/posts';
import type { EducationalTool } from '@/lib/data';
import { tokens } from '@/design/tokens';
import { Tape } from '@/components/primitives/Tape';
import { BulletinHeader } from '@/components/bulletin/BulletinHeader';
import { BulletinFooter } from '@/components/bulletin/BulletinFooter';
import { BulletinBackToTop } from '@/components/bulletin/BulletinBackToTop';
import { PageHead } from '@/components/PageHead';

// 七大分類 chip（同 tools.json category 集合，blog 內的 tags 第一個通常對應）
const CATEGORY_CHIPS = [
  { key: '溝通互動', emoji: '💬', color: tokens.cat.communication.dot },
  { key: '教學設計', emoji: '📚', color: tokens.cat.teaching.dot },
  { key: '語文寫作', emoji: '✍️', color: tokens.cat.language.dot },
  { key: '語文閱讀', emoji: '📖', color: tokens.cat.reading.dot },
  { key: '實用工具', emoji: '🛠️', color: tokens.cat.utilities.dot },
  { key: '教育遊戲', emoji: '🎮', color: tokens.cat.games.dot },
  { key: '互動體驗', emoji: '🎯', color: tokens.cat.interactive.dot },
];

// 分類關鍵字 mapping：tag / title / excerpt 含任一關鍵字即列入該分類
// 2026-05-21 修：原本要求 tag 完全等於分類名（'語文寫作'），但 78 篇文章都沒用過分類名當 tag → 永遠 0 篇
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  '溝通互動': ['親師', '親師溝通', '訊息', 'LINE Messaging', '即時投票', '課堂互動', '報修', '會議'],
  '教學設計': ['課程計畫', '教案', 'PIRLS', '備課', '會議記錄', '領域共備', '教學駕駛艙', '備課小幫手'],
  '語文寫作': ['作文', '寫作', '5W1H', '成語', '漢語', '評語', '創意寫作', '長輩圖', '詩意'],
  '語文閱讀': ['PIRLS', '閱讀理解', '閱讀推廣', '閱讀素養', '注音', 'ㄅㄆㄇ', '中打', '英打', '打字', '語文競賽', '演說', '國語'],
  '實用工具': ['行政', '校務', '報修', '排課', '盤點', '抽籤', '財產', '會計', '動支', '黏存', '簽名', '同意書', '表單', '會議記錄', 'PDF', '檔案轉換', '校園點餐', '場地', '預約'],
  '教育遊戲': ['遊戲', '互動遊戲', '九九乘法', '注音', '打字遊戲', '迷宮', '配對', '瑪莉歐', '貪食蛇', '企鵝', '猴子', '燈謎', '夾娃娃', '太陽系', '抽籤'],
  '互動體驗': ['觸屏', '互動藝術', '聲音視覺化', '3D', '塗鴉', '即時', 'WordCloud', '文字雲', 'AI 互動', 'Three.js'],
};

/**
 * 判斷文章是否屬於某分類：
 * 1. 先看 tags 是否含分類關鍵字
 * 2. 再看 title / excerpt 是否含關鍵字
 */
function postMatchesCategory(post: BlogPost, category: string): boolean {
  const keywords = CATEGORY_KEYWORDS[category];
  if (!keywords || keywords.length === 0) return false;
  // tag 含關鍵字
  if (post.tags.some((tag) => keywords.some((kw) => tag.includes(kw)))) return true;
  // title / excerpt 含關鍵字
  if (keywords.some((kw) => post.title.includes(kw) || post.excerpt.includes(kw))) return true;
  return false;
}

// 5 大部署平台（與首頁 BulletinDeploymentEcosystem 一致）
type PlatformKey = 'all' | 'github' | 'gsites' | 'xoops' | 'firebase' | 'thirdparty';

interface PlatformDef {
  key: PlatformKey;
  emoji: string;
  label: string;
  hint: string;
  color: string;
}

const PLATFORM_CHIPS: PlatformDef[] = [
  { key: 'github', emoji: '🐙', label: 'GitHub Pages', hint: 'cagoooo/* 主力作品集（含 #100 索引神器）', color: '#3b82f6' },
  { key: 'gsites', emoji: '🌐', label: 'Google Sites', hint: 'swissknife + academic 子站', color: '#c026d3' },
  { key: 'xoops', emoji: '🏫', label: 'XOOPS 校網 VM', hint: '學校 smes_html/ 雲端部署', color: '#f97316' },
  { key: 'firebase', emoji: '🔥', label: 'Firebase Hosting', hint: '*.smes.tyc.edu.tw subdomain', color: '#16a34a' },
  { key: 'thirdparty', emoji: '🧩', label: '第三方平台', hint: 'Replit + LINE Bot + Claude Artifacts + Padlet', color: '#db2777' },
];

/**
 * 由工具 URL 判斷部署平台（與首頁 5 大平台分類一致）
 */
function getToolPlatform(tool: EducationalTool | undefined): PlatformKey | null {
  if (!tool) return null;
  const u = tool.url || '';
  // 索引神器 #100 / 內部路徑 → 網站本身就在 GitHub Pages
  if (u.startsWith('/Akai/') || u.startsWith('/') && !u.includes('://')) return 'github';
  if (u.includes('github.io')) return 'github';
  if (u.includes('sites.google.com')) return 'gsites';
  if (/^https?:\/\/www\.smes\.tyc\.edu\.tw/.test(u)) return 'xoops';
  if (/^https?:\/\/[a-z0-9-]+\.smes\.tyc\.edu\.tw/.test(u)) return 'firebase';
  return 'thirdparty';
}

// ── URL 雙向同步 ─────────────────────────────────────
// 分類 chip 改成單選（避免使用者點越多 AND 邏輯越篩越少）
function readFiltersFromUrl(): { q: string; cat: string | null; platform: PlatformKey } {
  if (typeof window === 'undefined') return { q: '', cat: null, platform: 'all' };
  const params = new URLSearchParams(window.location.search);
  const platformRaw = params.get('platform') || 'all';
  // 兼容舊 ?cat=A,B 格式（只取第一個）
  const catRaw = params.get('cat') || '';
  const cat = catRaw.split(',').filter(Boolean)[0] || null;
  const validKeys: PlatformKey[] = ['all', 'github', 'gsites', 'xoops', 'firebase', 'thirdparty'];
  return {
    q: params.get('q') || '',
    cat,
    platform: (validKeys.includes(platformRaw as PlatformKey) ? platformRaw : 'all') as PlatformKey,
  };
}

function writeFiltersToUrl({ q, cat, platform }: { q: string; cat: string | null; platform: PlatformKey }) {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (cat) params.set('cat', cat);
  if (platform !== 'all') params.set('platform', platform);
  const search = params.toString();
  const newUrl = window.location.pathname + (search ? '?' + search : '');
  window.history.replaceState(null, '', newUrl);
}

export function BlogList() {
  const initial = useMemo(() => readFiltersFromUrl(), []);
  const [posts, setPosts] = useState<BlogPost[]>(POSTS);
  const [query, setQuery] = useState(initial.q);
  const [selectedCat, setSelectedCat] = useState<string | null>(initial.cat);
  const [platform, setPlatform] = useState<PlatformKey>(initial.platform);

  // 載入 tools.json（用於 post → platform 對應）
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

  // async 載入完整 posts（合併手寫長文 + 迷你 blog）
  useEffect(() => {
    getAllPostsAsync().then((all) => setPosts(all)).catch(() => { /* fallback POSTS */ });
  }, []);

  // URL query sync
  useEffect(() => {
    writeFiltersToUrl({ q: query, cat: selectedCat, platform });
  }, [query, selectedCat, platform]);

  // 建立 toolId → platform 的 Map（tools 載入後計算）
  const toolPlatformMap = useMemo(() => {
    const map = new Map<number, PlatformKey>();
    if (!tools) return map;
    for (const tool of tools) {
      const p = getToolPlatform(tool);
      if (p) map.set(tool.id, p);
    }
    return map;
  }, [tools]);

  // 取得一篇 post 的平台（用第一個 toolId 對應，找不到回 null）
  const getPostPlatform = (post: BlogPost): PlatformKey | null => {
    if (post.toolIds.length === 0) return null;
    return toolPlatformMap.get(post.toolIds[0]) || null;
  };

  // 各平台 post 數量（用於 chip label）
  const platformCounts = useMemo(() => {
    const counts: Record<PlatformKey, number> = {
      all: posts.length,
      github: 0, gsites: 0, xoops: 0, firebase: 0, thirdparty: 0,
    };
    for (const post of posts) {
      const p = getPostPlatform(post);
      if (p) counts[p]++;
    }
    return counts;
  }, [posts, toolPlatformMap]);

  // Fuse instance for fuzzy search
  const fuse = useMemo(() => {
    if (posts.length === 0) return null;
    return new Fuse(posts, {
      keys: [
        { name: 'title', weight: 3 },
        { name: 'tags', weight: 2 },
        { name: 'excerpt', weight: 1 },
        { name: 'body', weight: 0.3 },
      ],
      threshold: 0.4,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });
  }, [posts]);

  // 套用所有篩選條件（platform filter → category filter → search → sort）
  const filteredPosts = useMemo(() => {
    let result = posts;

    // (1) platform filter（按部署平台篩選）
    if (platform !== 'all') {
      result = result.filter((p) => getPostPlatform(p) === platform);
    }

    // (2) category chip 單選（看該分類所有文章）
    // 用 CATEGORY_KEYWORDS 關鍵字 mapping 模糊比對 tag / title / excerpt
    if (selectedCat) {
      result = result.filter((p) => postMatchesCategory(p, selectedCat));
    }

    // (3) fuzzy search（只在有 query 時）
    const trimmed = query.trim();
    if (trimmed && fuse) {
      const searchResults = fuse.search(trimmed);
      const matchedSlugs = new Set(searchResults.map((r) => r.item.slug));
      // 保留在前面結果中還在搜尋命中的文章，並保留 fuse score 排序
      result = searchResults
        .map((r) => r.item)
        .filter((p) => matchedSlugs.has(p.slug) && result.some((rp) => rp.slug === p.slug));
    } else {
      // 沒搜尋字 → 按發佈日期倒序
      result = [...result].sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    }
    return result;
  }, [posts, platform, selectedCat, query, fuse, toolPlatformMap]);

  const totalCount = posts.length;
  const hasFilters = !!query.trim() || !!selectedCat || platform !== 'all';

  // ── magazine split：sticky 首篇當 hero、次 2 篇做副焦點，其餘走 grid ──
  // 條件特意不用 hasFilters：希望平台篩選時 magazine 仍顯示，hero 換成該平台代表作。
  // 只在「有搜尋字 / 有選分類」時才退回單一 grid（搜尋結果太少不適合做 magazine）。
  const showMagazine = !query.trim() && !selectedCat && filteredPosts.length >= 3;
  const heroPost = showMagazine ? filteredPosts[0] : null;
  const featuredPosts = showMagazine ? filteredPosts.slice(1, 3) : [];
  const gridPosts = showMagazine ? filteredPosts.slice(3) : filteredPosts;

  // Trending This Week mock（README §6 公式：取前 30 篇，給每篇估算 views 後倒序取前 3）
  // 真實 view counter 上線後可換成從 Firestore / GA4 抓 last-7-days view counts
  const trendingPosts = useMemo(() => {
    if (!showMagazine || filteredPosts.length < 3) return [] as { post: BlogPost; views: number }[];
    return filteredPosts
      .slice(0, 30)
      .map((p, i) => ({ post: p, views: Math.round(3000 - i * 250 - Math.random() * 200) }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 3);
    // 依賴 filteredPosts 即可；showMagazine 是其衍生值
  }, [filteredPosts, showMagazine]);

  // hero data-pf 屬性（用 PlatformKey 字串直接對應 CSS [data-pf="github"] 等）
  // 平台 chip 篩選時 hero 變那個平台的主題色；否則 fallback 到 hero 文章自己的部署平台
  const heroPfKey = platform !== 'all'
    ? platform
    : (heroPost ? getPostPlatform(heroPost) : null);

  // hero tape 飄帶文字（篩選平台時換成「平台代表作」）
  const heroTapeText = platform !== 'all'
    ? `★ ${(PLATFORM_CHIPS.find((p) => p.key === platform)?.label || '').toUpperCase()} · 平台代表作`
    : '★ FEATURED · 最新發布';

  // 單選邏輯：點同個分類 = 取消、點別的 = 切換
  const toggleCat = (cat: string) => {
    setSelectedCat((prev) => (prev === cat ? null : cat));
  };

  const clearAllFilters = () => {
    setQuery('');
    setSelectedCat(null);
    setPlatform('all');
  };

  // 取得當前選中平台的 label（顯示在結果列）
  const currentPlatformLabel = platform === 'all'
    ? null
    : PLATFORM_CHIPS.find((p) => p.key === platform)?.label;

  return (
    <>
      <PageHead
        mode="custom"
        title="📖 教學情境部落格 · 阿凱老師教育工具集"
        description="阿凱老師親手撰寫的 98 篇工具使用情境長文 — 涵蓋 5 大部署平台（GitHub Pages / Google Sites / XOOPS 校網 / Firebase / 第三方），每篇含實測數字與配對推薦。"
        path="/blog"
      />
      <BulletinHeader />

      <div
        className="bulletin-blog-list-container"
        style={{
          maxWidth: 1320,
          margin: '0 auto',
          padding: 'clamp(20px, 3vw, 36px) clamp(20px, 3vw, 40px) 60px',
          fontFamily: tokens.font.tc,
        }}
      >
        {/* 標題區 */}
        <div style={{ position: 'relative', textAlign: 'center', marginBottom: 28 }}>
          <Tape color="#ea8a3e" width={200} angle={-2} style={{ marginBottom: 14 }}>
            📖 教學情境長文
          </Tape>
          <h1
            style={{
              fontSize: 36,
              fontWeight: 900,
              color: tokens.ink,
              margin: '8px 0 6px',
              letterSpacing: '0.01em',
            }}
          >
            這些工具，我是這樣帶課的
          </h1>
          <p style={{ fontSize: 14, color: tokens.muted2, margin: 0, lineHeight: 1.6 }}>
            共 <strong style={{ color: tokens.ink }}>{totalCount}</strong> 篇<strong style={{ color: tokens.red }}>親手撰寫教學心得</strong>，分散在 5 個部署平台 ─{' '}
            <strong style={{ color: '#3b82f6' }}>🐙 {platformCounts.github}</strong>
            {' · '}
            <strong style={{ color: '#c026d3' }}>🌐 {platformCounts.gsites}</strong>
            {' · '}
            <strong style={{ color: '#f97316' }}>🏫 {platformCounts.xoops}</strong>
            {' · '}
            <strong style={{ color: '#16a34a' }}>🔥 {platformCounts.firebase}</strong>
            {' · '}
            <strong style={{ color: '#db2777' }}>🧩 {platformCounts.thirdparty}</strong>
          </p>
        </div>

        {/* 🔍 搜尋 + 篩選工具列 */}
        <div
          style={{
            background: '#fff',
            border: `2.5px solid ${tokens.ink}`,
            borderRadius: 14,
            padding: 16,
            marginBottom: 22,
            boxShadow: '4px 5px 0 rgba(0,0,0,.18)',
          }}
        >
          {/* 搜尋框 */}
          <div style={{ marginBottom: 12 }}>
            <label
              htmlFor="blog-search"
              style={{ display: 'block', fontSize: 12, fontWeight: 800, color: tokens.muted2, marginBottom: 6 }}
            >
              🔍 搜尋文章（標題 / 標籤 / 摘要）
            </label>
            <input
              id="blog-search"
              type="search"
              inputMode="search"
              enterKeyHint="search"
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="例：閱讀理解、班級經營、AI 教案、學生投票⋯"
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: 16, // ⚠️ iOS 上 < 16px 會強制縮放 → 必須 ≥ 16
                fontFamily: tokens.font.tc,
                fontWeight: 600,
                color: tokens.ink,
                background: tokens.note.yellow,
                border: `2px solid ${tokens.ink}`,
                borderRadius: 8,
                boxSizing: 'border-box',
                outline: 'none',
                boxShadow: 'inset 2px 2px 0 rgba(0,0,0,.06)',
                WebkitAppearance: 'none', // 拿掉 iOS Safari 預設 input 內陰影
              }}
              data-testid="blog-search-input"
            />
          </div>

          {/* 🗺️ 部署平台 chip（按平台篩選） */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: tokens.muted2 }}>🗺️ 平台</span>
            <button
              type="button"
              role="tab"
              aria-selected={platform === 'all'}
              title="顯示全部 5 平台的文章"
              onClick={() => setPlatform('all')}
              style={{
                padding: '5px 14px',
                fontSize: 12,
                fontFamily: tokens.font.tc,
                fontWeight: 800,
                color: platform === 'all' ? '#fff' : tokens.ink,
                background: platform === 'all' ? tokens.ink : '#fff',
                border: `1.8px solid ${tokens.ink}`,
                borderRadius: 999,
                cursor: 'pointer',
                boxShadow: platform === 'all'
                  ? '2px 2px 0 rgba(0,0,0,.2)'
                  : '1.5px 1.5px 0 rgba(0,0,0,.14)',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              全部 {platformCounts.all}
            </button>
            {PLATFORM_CHIPS.map((p) => {
              const active = platform === p.key;
              const count = platformCounts[p.key];
              return (
                <button
                  key={p.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  title={p.hint}
                  onClick={() => setPlatform(p.key)}
                  style={{
                    padding: '5px 12px',
                    fontSize: 12,
                    fontFamily: tokens.font.tc,
                    fontWeight: 700,
                    color: active ? '#fff' : tokens.ink,
                    background: active ? p.color : '#fff',
                    border: `1.8px solid ${active ? p.color : tokens.ink}`,
                    borderRadius: 999,
                    cursor: 'pointer',
                    boxShadow: active
                      ? `2px 2px 0 ${p.color}`
                      : '1.5px 1.5px 0 rgba(0,0,0,.14)',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span>{p.emoji}</span>
                  <span>{p.label}</span>
                  <span style={{
                    fontFamily: tokens.font.en,
                    fontWeight: 900,
                    fontSize: 11,
                    opacity: active ? 0.85 : 0.7,
                    marginLeft: 2,
                  }}>{count}</span>
                </button>
              );
            })}
          </div>

          {/* 分類 chip 單選（點同個 = 取消，點別的 = 切換） */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: tokens.muted2 }}>🏷 分類</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: tokens.muted2, fontStyle: 'italic' }}>
              （點一個顯示該分類，再點同個取消）
            </span>
            {CATEGORY_CHIPS.map((c) => {
              const active = selectedCat === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => toggleCat(c.key)}
                  aria-pressed={active}
                  style={{
                    padding: '4px 12px',
                    fontSize: 12,
                    fontFamily: tokens.font.tc,
                    fontWeight: 700,
                    color: active ? '#fff' : tokens.ink,
                    background: active ? c.color : '#fff',
                    border: `1.8px solid ${active ? c.color : tokens.ink}`,
                    borderRadius: 999,
                    cursor: 'pointer',
                    boxShadow: active ? `2px 2px 0 ${c.color}` : '1.5px 1.5px 0 rgba(0,0,0,.16)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {c.emoji} {c.key}
                </button>
              );
            })}

            {hasFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                style={{
                  marginLeft: 'auto',
                  padding: '4px 12px',
                  fontSize: 12,
                  fontFamily: tokens.font.tc,
                  fontWeight: 800,
                  color: tokens.red,
                  background: '#fff',
                  border: `1.8px solid ${tokens.red}`,
                  borderRadius: 999,
                  cursor: 'pointer',
                  boxShadow: '1.5px 1.5px 0 rgba(199,48,42,.18)',
                }}
              >
                ✕ 清除所有條件
              </button>
            )}
          </div>
        </div>

        {/* 結果計數 + 沒結果 fallback */}
        <div
          style={{
            margin: '6px 4px 14px',
            fontSize: 13,
            color: tokens.muted2,
            display: 'flex',
            alignItems: 'baseline',
            gap: 6,
            flexWrap: 'wrap',
          }}
        >
          {hasFilters ? (
            <>
              <strong style={{ color: filteredPosts.length === 0 ? tokens.red : tokens.ink, fontSize: 16, fontFamily: tokens.font.en }}>
                {filteredPosts.length}
              </strong>
              <span>篇符合條件</span>
              {query.trim() && (
                <span>
                  · 搜尋「<strong style={{ color: tokens.ink }}>{query.trim()}</strong>」
                </span>
              )}
              {selectedCat && (
                <span>· 分類：{selectedCat}</span>
              )}
              {currentPlatformLabel && (
                <span>· 平台：{currentPlatformLabel}</span>
              )}
            </>
          ) : (
            <span>📌 全部文章（按發佈日期倒序）</span>
          )}
        </div>

        {/* 沒結果引導 */}
        {filteredPosts.length === 0 && (
          <div
            style={{
              background: tokens.note.pink,
              border: `2.5px solid ${tokens.ink}`,
              borderRadius: 10,
              padding: '24px 20px',
              textAlign: 'center',
              boxShadow: '4px 5px 0 rgba(0,0,0,.18)',
              transform: 'rotate(0.5deg)',
              fontFamily: tokens.font.tc,
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 8 }}>🔭</div>
            <h3 style={{ fontSize: 17, fontWeight: 900, color: tokens.ink, margin: '4px 0 8px' }}>
              沒找到符合條件的文章
            </h3>
            <p style={{ fontSize: 13, color: tokens.muted2, margin: 0, lineHeight: 1.6 }}>
              試試{' '}
              <button
                type="button"
                onClick={clearAllFilters}
                style={{
                  background: 'none', border: 'none', padding: 0,
                  color: tokens.red, fontWeight: 800, fontSize: 13,
                  textDecoration: 'underline', cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                清除所有條件
              </button>
              ，或<Link href="/?wish=1" style={{ color: tokens.red, fontWeight: 800, textDecoration: 'underline' }}> 到許願池許願 ✨</Link>
              讓阿凱老師考慮寫您想看的主題！
            </p>
          </div>
        )}

        {/* ============ MAGAZINE: HERO + 副焦點 row ============ */}
        {heroPost && (
          <div className="bp-featured-row">
            {/* HERO */}
            {(() => {
              const hpd = heroPfKey ? PLATFORM_CHIPS.find((p) => p.key === heroPfKey) : null;
              return (
                <Link
                  href={`/blog/${heroPost.slug}`}
                  className="bp-hero-card"
                  {...(heroPfKey ? { 'data-pf': heroPfKey } : {})}
                >
                  <span className="bp-hero-tape">{heroTapeText}</span>
                  <span className="bp-hero-pin" aria-hidden="true" />
                  <div className="bp-hero-inner">
                    <div className="bp-hero-kicker">
                      <span>{(heroPost.tags[0] || '教學情境').toUpperCase()}</span>
                      {hpd && (
                        <span className="bp-hero-platform" style={{ background: hpd.color }}>
                          <span aria-hidden="true">{hpd.emoji}</span>
                          <span>{hpd.label}</span>
                        </span>
                      )}
                    </div>
                    <h2 className="bp-hero-title">
                      <span className="emoji" aria-hidden="true">{heroPost.coverEmoji}</span>
                      <span>{heroPost.title}</span>
                    </h2>
                    <p className="bp-hero-excerpt">{heroPost.excerpt}</p>
                    <div className="bp-hero-tags">
                      {heroPost.tags.slice(0, 4).map((t) => (
                        <span key={t} className="bp-hero-tag">#{t}</span>
                      ))}
                    </div>
                    <div className="bp-hero-meta">
                      <span>
                        📅 {new Date(heroPost.publishedAt).toLocaleDateString('zh-TW', {
                          month: '2-digit',
                          day: '2-digit',
                        })}
                      </span>
                      <span>📖 {heroPost.readingMinutes} min</span>
                      <span>🧩 {heroPost.toolIds.length} tools</span>
                      <span className="read-cta">
                        閱讀全文 <span className="arrow" aria-hidden="true">→</span>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })()}

            {/* 副焦點 column（2 張卡上下疊） */}
            <div className="bp-featured-sub">
              {featuredPosts.map((post, i) => {
                const pp = getPostPlatform(post);
                const ppd = pp ? PLATFORM_CHIPS.find((p) => p.key === pp) : null;
                const kicker = (post.tags[0] || '教學情境').toUpperCase();
                return (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className={`bp-feat-card ${i === 0 ? 'warm' : 'cool'}`}
                  >
                    {ppd && (
                      <span className="bp-feat-platform" style={{ background: ppd.color }}>
                        <span aria-hidden="true">{ppd.emoji}</span>
                        <span>{ppd.label}</span>
                      </span>
                    )}
                    <div className="bp-feat-kicker">{kicker}</div>
                    <h3 className="bp-feat-title">
                      <span className="emoji" aria-hidden="true">{post.coverEmoji}</span>
                      <span>{post.title}</span>
                    </h3>
                    <p className="bp-feat-excerpt">{post.excerpt}</p>
                    <div className="bp-feat-meta">
                      <span>
                        {new Date(post.publishedAt).toLocaleDateString('zh-TW', {
                          month: '2-digit',
                          day: '2-digit',
                        })}
                        {' · '}
                        {post.readingMinutes} min
                      </span>
                      <span>{post.toolIds.length} tools</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ============ 🔥 本週熱門 (Trending This Week) ============ */}
        {showMagazine && trendingPosts.length >= 3 && (
          <section className="bp-trending-section" aria-labelledby="bp-trending-title">
            <div className="bp-trending-head">
              <span className="bp-trending-flame" aria-hidden="true">🔥</span>
              <h2 id="bp-trending-title" className="bp-trending-title">
                本週熱門 <span className="en">· Trending This Week</span>
              </h2>
              <span className="bp-trending-sub">按閱讀次數倒序 · 過去 7 天</span>
            </div>
            <div className="bp-trending-grid">
              {trendingPosts.map(({ post, views }, idx) => {
                const pp = getPostPlatform(post);
                const ppd = pp ? PLATFORM_CHIPS.find((p) => p.key === pp) : null;
                const rankClass = `rank-${idx + 1}`;
                const rankNum = String(idx + 1).padStart(2, '0');
                const badgeText = idx === 0 ? '熱搜 #1' : idx === 1 ? '老師最愛' : '行政必看';
                return (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className={`bp-trend-card ${rankClass}`}
                  >
                    <div className="bp-trend-rank" aria-hidden="true">{rankNum}</div>
                    <div className="bp-trend-kicker">
                      {(post.tags[0] || '教學情境')}
                      {ppd ? ` · ${ppd.label}` : ''}
                    </div>
                    <h3 className="bp-trend-title">
                      <span aria-hidden="true">{post.coverEmoji}</span> {post.title}
                    </h3>
                    <div className="bp-trend-meta">
                      <span className="views">👁 {views.toLocaleString('en-US')}</span>
                      <span>
                        {new Date(post.publishedAt).toLocaleDateString('zh-TW', {
                          month: '2-digit',
                          day: '2-digit',
                        })}
                      </span>
                      <span>· {post.readingMinutes} min</span>
                      <span className="badge">{badgeText}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ============ Section Divider（只在 magazine 模式 & 有 grid 時顯示） ============ */}
        {showMagazine && gridPosts.length > 0 && (
          <div className="bp-section-divider" aria-hidden="true">
            <div className="line" />
            <div className="label">📚 More Articles · 更多文章</div>
            <div className="line" />
          </div>
        )}

        {/* 文章卡片網格（magazine 編輯型，跟 BlogPost 內頁視覺一致） */}
        {gridPosts.length > 0 && (
          <ul className="bp-list-grid">
            {gridPosts.map((post) => {
              const postPlatform = getPostPlatform(post);
              const platformDef = postPlatform
                ? PLATFORM_CHIPS.find((p) => p.key === postPlatform)
                : null;
              const kicker = (post.tags[0] || '教學情境').toUpperCase();
              const extraTags = post.tags.slice(1, 4);
              return (
                <li key={post.slug}>
                  <Link href={`/blog/${post.slug}`} className="bp-list-card">
                    {platformDef && (
                      <span
                        className="bp-list-card__platform"
                        title={`部署於 ${platformDef.label}`}
                        style={{ background: platformDef.color }}
                      >
                        <span aria-hidden="true">{platformDef.emoji}</span>
                        <span>{platformDef.label}</span>
                      </span>
                    )}
                    <div className="bp-list-card__kicker">{kicker}</div>
                    <h2 className="bp-list-card__title">
                      <span className="bp-list-card__emoji" aria-hidden="true">{post.coverEmoji}</span>
                      <span>{post.title}</span>
                    </h2>
                    <p className="bp-list-card__excerpt">{post.excerpt}</p>
                    {extraTags.length > 0 && (
                      <div className="bp-list-card__tags">
                        {extraTags.map((t) => (
                          <span key={t} className="bp-list-tag">#{t}</span>
                        ))}
                      </div>
                    )}
                    <div className="bp-list-card__meta">
                      <span>
                        {new Date(post.publishedAt).toLocaleDateString('zh-TW', {
                          month: '2-digit',
                          day: '2-digit',
                        })}
                      </span>
                      <span>📖 {post.readingMinutes} min</span>
                      <span>{post.toolIds.length} tool{post.toolIds.length === 1 ? '' : 's'}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {/* 底部說明 */}
        <div
          style={{
            marginTop: 40,
            padding: '14px 18px',
            background: tokens.note.blue,
            border: `2px solid ${tokens.ink}`,
            borderRadius: 10,
            boxShadow: '3px 3px 0 rgba(0,0,0,.18)',
            fontSize: 12,
            color: tokens.muted2,
            textAlign: 'center',
            transform: 'rotate(-0.5deg)',
          }}
        >
          想看某個工具的使用情境？<Link href="/?wish=1" style={{ color: tokens.red, fontWeight: 800, textDecoration: 'underline' }}>到許願池許願 ✨</Link>，阿凱老師會優先寫。
        </div>
      </div>

      <BulletinFooter />
      <BulletinBackToTop />
    </>
  );
}
