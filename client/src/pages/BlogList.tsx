/**
 * BlogList — 教學情境部落格列表 (/blog)
 *
 * 包含：
 *   - 5 篇手寫長文 + ~92 篇 mini blog（每工具一篇 SEO landing）
 *   - 即時搜尋（fuse.js 模糊比對 title / excerpt / tags）
 *   - 7 大分類 chip + 長文 / 迷你 類型 toggle
 *   - URL query 同步（?q=, ?cat=, ?type=）讓條件可分享
 *   - 沒結果時引導到許願池
 */

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import Fuse from 'fuse.js';
import { POSTS, getAllPostsAsync, type BlogPost } from '@/blog/posts';
import { tokens } from '@/design/tokens';
import { Pin } from '@/components/primitives/Pin';
import { Tape } from '@/components/primitives/Tape';
import { BulletinHeader } from '@/components/bulletin/BulletinHeader';
import { BulletinFooter } from '@/components/bulletin/BulletinFooter';
import { BulletinBackToTop } from '@/components/bulletin/BulletinBackToTop';
import { PageHead } from '@/components/PageHead';

const COLOR_MAP: Record<string, string> = {
  yellow: tokens.note.yellow,
  blue: tokens.note.blue,
  pink: tokens.note.pink,
  green: tokens.note.green,
  orange: tokens.note.orange,
  purple: tokens.note.purple,
};

const PIN_MAP: Record<string, string> = {
  yellow: '#eab308',
  blue: '#2563eb',
  pink: '#ec4899',
  green: '#16a34a',
  orange: '#dc2626',
  purple: '#c026d3',
};

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

type PostType = 'all' | 'longform' | 'mini';

// 判斷是否為手寫長文（POSTS 5 篇）；其他都算迷你
function isLongform(post: BlogPost): boolean {
  return POSTS.some((p) => p.slug === post.slug);
}

// ── URL 雙向同步 ─────────────────────────────────────
// 分類 chip 改成單選（避免使用者點越多 AND 邏輯越篩越少）
function readFiltersFromUrl(): { q: string; cat: string | null; type: PostType } {
  if (typeof window === 'undefined') return { q: '', cat: null, type: 'all' };
  const params = new URLSearchParams(window.location.search);
  const typeRaw = params.get('type') || 'all';
  // 兼容舊 ?cat=A,B 格式（只取第一個）
  const catRaw = params.get('cat') || '';
  const cat = catRaw.split(',').filter(Boolean)[0] || null;
  return {
    q: params.get('q') || '',
    cat,
    type: (['all', 'longform', 'mini'].includes(typeRaw) ? typeRaw : 'all') as PostType,
  };
}

function writeFiltersToUrl({ q, cat, type }: { q: string; cat: string | null; type: PostType }) {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (cat) params.set('cat', cat);
  if (type !== 'all') params.set('type', type);
  const search = params.toString();
  const newUrl = window.location.pathname + (search ? '?' + search : '');
  window.history.replaceState(null, '', newUrl);
}

export function BlogList() {
  const initial = useMemo(() => readFiltersFromUrl(), []);
  const [posts, setPosts] = useState<BlogPost[]>(POSTS);
  const [query, setQuery] = useState(initial.q);
  const [selectedCat, setSelectedCat] = useState<string | null>(initial.cat);
  const [postType, setPostType] = useState<PostType>(initial.type);

  // async 載入完整 posts（合併手寫長文 + 迷你 blog）
  useEffect(() => {
    getAllPostsAsync().then((all) => setPosts(all)).catch(() => { /* fallback POSTS */ });
  }, []);

  // URL query sync
  useEffect(() => {
    writeFiltersToUrl({ q: query, cat: selectedCat, type: postType });
  }, [query, selectedCat, postType]);

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

  // 套用所有篩選條件（type filter → category filter → search → sort）
  const filteredPosts = useMemo(() => {
    let result = posts;

    // (1) type filter
    if (postType === 'longform') result = result.filter(isLongform);
    else if (postType === 'mini') result = result.filter((p) => !isLongform(p));

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
  }, [posts, postType, selectedCat, query, fuse]);

  const totalCount = posts.length;
  const longformCount = posts.filter(isLongform).length;
  const miniCount = totalCount - longformCount;
  const hasFilters = !!query.trim() || !!selectedCat || postType !== 'all';

  // 單選邏輯：點同個分類 = 取消、點別的 = 切換
  const toggleCat = (cat: string) => {
    setSelectedCat((prev) => (prev === cat ? null : cat));
  };

  const clearAllFilters = () => {
    setQuery('');
    setSelectedCat(null);
    setPostType('all');
  };

  return (
    <>
      <PageHead
        mode="custom"
        title="📖 教學情境部落格 · 阿凱老師教育工具集"
        description="阿凱老師親手撰寫的工具使用情境長文 — 每篇講一個熱門工具如何解決真實教學現場的問題，含實測數字與配對推薦。"
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
            共 <strong style={{ color: tokens.ink }}>{totalCount}</strong> 篇文章 ─{' '}
            <strong style={{ color: tokens.red }}>📖 {longformCount} 篇教學心得</strong>（實戰長文）+{' '}
            <strong style={{ color: tokens.accent }}>🔖 {miniCount} 篇工具介紹</strong>（30 秒速覽）
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

          {/* 類型 toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: tokens.muted2 }}>📝 類型</span>
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
              {([
                { key: 'all', label: `全部 ${totalCount}`, hint: '所有文章（精選 + 工具介紹）' },
                { key: 'longform', label: `📖 教學心得 ${longformCount}`, hint: '阿凱老師親手寫的長文：含實測數據、學生引言、配對推薦（5-8 分鐘）' },
                { key: 'mini', label: `🔖 工具介紹 ${miniCount}`, hint: '每個工具一篇 30 秒看完：用途、適合誰用、怎麼開始（2 分鐘）' },
              ] as { key: PostType; label: string; hint: string }[]).map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  role="tab"
                  aria-selected={postType === opt.key}
                  title={opt.hint}
                  onClick={() => setPostType(opt.key)}
                  style={{
                    padding: '6px 14px',
                    fontSize: 12,
                    fontFamily: tokens.font.tc,
                    fontWeight: 800,
                    color: postType === opt.key ? '#fff' : tokens.ink,
                    background: postType === opt.key ? tokens.accent : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
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

        {/* 文章便利貼牆 */}
        {filteredPosts.length > 0 && (
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'grid',
              // 卡片最小 300px，auto-fill 讓寬螢幕自動展 4-5 欄、平板 2-3 欄、手機 1 欄
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 'clamp(20px, 2vw, 32px)',
            }}
          >
            {filteredPosts.map((post, idx) => {
              const noteColor = COLOR_MAP[post.coverColor] || tokens.note.yellow;
              const pinColor = PIN_MAP[post.coverColor] || tokens.red;
              const tilt = (idx % 3) === 0 ? -1.2 : (idx % 3) === 1 ? 0.8 : -0.4;
              const longform = isLongform(post);
              return (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                  >
                    <article
                      style={{
                        position: 'relative',
                        background: noteColor,
                        border: `2.5px solid ${tokens.ink}`,
                        borderRadius: 10,
                        padding: '22px 20px 18px',
                        transform: `rotate(${tilt}deg)`,
                        boxShadow: '5px 6px 0 rgba(0,0,0,.22), 0 8px 18px -6px rgba(0,0,0,.18)',
                        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                        cursor: 'pointer',
                        minHeight: 280,
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = `rotate(${tilt}deg) translate(-2px, -3px)`;
                        e.currentTarget.style.boxShadow = '7px 8px 0 rgba(0,0,0,.25), 0 12px 22px -6px rgba(0,0,0,.22)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = `rotate(${tilt}deg)`;
                        e.currentTarget.style.boxShadow = '5px 6px 0 rgba(0,0,0,.22), 0 8px 18px -6px rgba(0,0,0,.18)';
                      }}
                    >
                      <Pin color={pinColor} size={18} style={{ top: -9, left: '50%', marginLeft: -9 }} />

                      {/* 長文徽章 */}
                      {longform && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            background: tokens.red,
                            color: '#fff',
                            fontSize: 9,
                            fontWeight: 900,
                            padding: '2px 7px',
                            borderRadius: 999,
                            border: `1.5px solid ${tokens.ink}`,
                            letterSpacing: '0.05em',
                            transform: 'rotate(6deg)',
                            boxShadow: '1.5px 1.5px 0 rgba(0,0,0,.22)',
                          }}
                        >
                          📖 教學心得
                        </div>
                      )}

                      <div style={{ fontSize: 42, lineHeight: 1, marginBottom: 8 }}>{post.coverEmoji}</div>
                      <h2
                        style={{
                          fontSize: 18,
                          fontWeight: 900,
                          color: tokens.ink,
                          margin: '0 0 8px',
                          lineHeight: 1.35,
                        }}
                      >
                        {post.title}
                      </h2>
                      <p
                        style={{
                          fontSize: 13,
                          color: tokens.muted2,
                          margin: '0 0 12px',
                          lineHeight: 1.55,
                          flex: 1,
                          display: '-webkit-box',
                          WebkitLineClamp: 4,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {post.excerpt}
                      </p>

                      {/* meta */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: 11,
                          color: tokens.muted2,
                          fontFamily: tokens.font.en,
                          borderTop: `1.5px dashed ${tokens.ink}`,
                          paddingTop: 8,
                        }}
                      >
                        <span>
                          {new Date(post.publishedAt).toLocaleDateString('zh-TW', {
                            month: '2-digit',
                            day: '2-digit',
                          })}
                        </span>
                        <span>📖 {post.readingMinutes} 分鐘</span>
                        <span>關聯 {post.toolIds.length} 個工具</span>
                      </div>
                    </article>
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
