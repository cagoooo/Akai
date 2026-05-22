/**
 * BlogDraftPreview — admin-only 草稿即時預覽頁 (/draft)
 *
 * 左 textarea 貼 markdown，右側即時渲染預覽（用同樣的 ReactMarkdown + bp-article CSS）。
 * localStorage 存最近 5 篇草稿，重新開頁不會消失。
 * 非 admin 自動導到首頁。
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useAuth } from '@/hooks/useAuth';
import { tokens } from '@/design/tokens';
import { BulletinHeader } from '@/components/bulletin/BulletinHeader';
import { BulletinFooter } from '@/components/bulletin/BulletinFooter';
import { BlogCodeBlock } from '@/components/blog/BlogCodeBlock';
import { slugifyHeading } from '@/hooks/useExtractedSections';

const DRAFTS_KEY = 'akai_blog_drafts_v1';
const CURRENT_KEY = 'akai_blog_draft_current_v1';
const MAX_DRAFTS = 5;

interface Draft {
  id: string;
  title: string;
  body: string;
  updatedAt: number;
}

const STARTER = `# 草稿標題（預覽不會顯示 H1，這只是給自己記）

## 第一段 H2 — 會出現在 TOC

這裡開始寫內文。**粗體**、*斜體*、\`inline code\`、[連結](https://example.com)。

<div class="callout callout--tip">
<div class="callout__label">💡 提示</div>

Callout 直接寫 HTML，paste 範本骨架就有，按右上「複製文章範本」可拿完整骨架。

</div>

\`\`\`ts
// 程式碼會自動語法高亮
const greeting = "Hello, Akai blog!";
\`\`\`

> 引言區塊 — 用 Noto Serif TC，左側橘色 border + 大引號裝飾

## 第二段 H2

- 自訂橘色圓點 unordered list
- 第二項

1. 有序列表
2. 第二項
`;

function flattenText(children: React.ReactNode): string {
  if (children == null || children === false || children === true) return '';
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(flattenText).join('');
  if (typeof children === 'object' && 'props' in (children as object)) {
    // @ts-expect-error — runtime children traversal
    return flattenText(children.props?.children);
  }
  return '';
}

function loadDrafts(): Draft[] {
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Draft[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveDrafts(drafts: Draft[]) {
  try {
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts.slice(0, MAX_DRAFTS)));
  } catch {
    /* quota or disabled, ignore */
  }
}

export function BlogDraftPreview() {
  const { isAdmin, loading } = useAuth();
  const [, navigate] = useLocation();

  const [drafts, setDrafts] = useState<Draft[]>(() => loadDrafts());
  const [currentId, setCurrentId] = useState<string>(() => {
    return localStorage.getItem(CURRENT_KEY) || 'new';
  });
  const [body, setBody] = useState<string>(() => {
    const all = loadDrafts();
    const cur = all.find((d) => d.id === localStorage.getItem(CURRENT_KEY));
    return cur ? cur.body : STARTER;
  });

  const saveTimerRef = useRef<number | null>(null);
  const title = useMemo(() => {
    // 從第一個 H1/H2 抓 title 當識別
    const m = /^#{1,2}\s+(.+?)\s*$/m.exec(body);
    return m?.[1]?.trim() || '未命名草稿';
  }, [body]);

  // 自動存：每次 body 變動 800ms 後寫進 localStorage
  useEffect(() => {
    if (saveTimerRef.current !== null) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      saveTimerRef.current = null;
      setDrafts((prev) => {
        const id = currentId === 'new' ? `d_${Date.now()}` : currentId;
        const next: Draft = { id, title, body, updatedAt: Date.now() };
        const others = prev.filter((d) => d.id !== id);
        const updated = [next, ...others].slice(0, MAX_DRAFTS);
        saveDrafts(updated);
        if (currentId === 'new') {
          setCurrentId(id);
          try { localStorage.setItem(CURRENT_KEY, id); } catch {}
        }
        return updated;
      });
    }, 800);
    return () => {
      if (saveTimerRef.current !== null) window.clearTimeout(saveTimerRef.current);
    };
  }, [body, title, currentId]);

  // 非 admin → 導首頁
  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
    }
  }, [loading, isAdmin, navigate]);

  if (loading) {
    return (
      <>
        <BulletinHeader />
        <div style={{ padding: 40, textAlign: 'center', color: tokens.muted2 }}>
          📌 載入中…
        </div>
      </>
    );
  }
  if (!isAdmin) return null;

  const handleNew = () => {
    try { localStorage.removeItem(CURRENT_KEY); } catch {}
    setCurrentId('new');
    setBody(STARTER);
  };

  const handleSwitch = (d: Draft) => {
    setCurrentId(d.id);
    setBody(d.body);
    try { localStorage.setItem(CURRENT_KEY, d.id); } catch {}
  };

  const handleDelete = (id: string) => {
    setDrafts((prev) => {
      const next = prev.filter((d) => d.id !== id);
      saveDrafts(next);
      if (currentId === id) {
        try { localStorage.removeItem(CURRENT_KEY); } catch {}
        setCurrentId('new');
        setBody(STARTER);
      }
      return next;
    });
  };

  return (
    <>
      <BulletinHeader />
      <div
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '20px clamp(16px, 3vw, 32px) 60px',
          fontFamily: tokens.font.tc,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: tokens.ink, margin: 0 }}>
            ✏️ 草稿預覽器
          </h1>
          <span style={{ fontSize: 12, color: tokens.muted2 }}>
            自動存到 localStorage，最多 {MAX_DRAFTS} 篇。Admin only · 非正式發布途徑（正式文章請手寫進 posts.ts）
          </span>
          <Link href="/blog" style={{ marginLeft: 'auto', fontSize: 12, color: tokens.red, fontWeight: 700, textDecoration: 'underline' }}>
            ← 回部落格列表
          </Link>
        </div>

        {/* 草稿切換列 */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          <button
            type="button"
            onClick={handleNew}
            style={chipStyle(currentId === 'new')}
          >
            ＋ 新草稿
          </button>
          {drafts.map((d) => (
            <span key={d.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <button
                type="button"
                onClick={() => handleSwitch(d)}
                title={`最後存於 ${new Date(d.updatedAt).toLocaleString('zh-TW')}`}
                style={chipStyle(currentId === d.id)}
              >
                {d.title.length > 14 ? d.title.slice(0, 14) + '…' : d.title}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(d.id)}
                aria-label={`刪除草稿 ${d.title}`}
                title="刪除"
                style={{
                  border: 'none', background: 'transparent', color: tokens.muted2,
                  cursor: 'pointer', fontSize: 12, padding: '0 4px',
                }}
              >×</button>
            </span>
          ))}
        </div>

        {/* 左 textarea / 右 預覽 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
            alignItems: 'start',
          }}
          className="bp-draft-split"
        >
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            spellCheck={false}
            style={{
              width: '100%',
              minHeight: '70vh',
              padding: '14px 16px',
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              fontSize: 14,
              lineHeight: 1.55,
              color: tokens.ink,
              background: '#fff',
              border: `1.5px solid var(--rule, #d9cfb8)`,
              borderRadius: 10,
              outline: 'none',
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
            placeholder="把 markdown body 貼到這裡⋯"
          />

          <div
            className="bp-article"
            style={{
              padding: '14px 18px',
              background: '#fff',
              border: `1.5px solid var(--rule, #d9cfb8)`,
              borderRadius: 10,
              minHeight: '70vh',
              maxWidth: '100%',
              overflowX: 'auto',
            }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                h2: ({ children }) => {
                  const id = slugifyHeading(flattenText(children));
                  return <h2 id={id}>{children}</h2>;
                },
                h3: ({ children }) => {
                  const id = slugifyHeading(flattenText(children));
                  return <h3 id={id}>{children}</h3>;
                },
                table: ({ children }) => (
                  <div className="bp-table-wrap"><table>{children}</table></div>
                ),
                pre: ({ children }) => {
                  const child = Array.isArray(children) ? children[0] : children;
                  if (child && typeof child === 'object' && 'props' in (child as object)) {
                    const props = (child as { props?: { className?: string; children?: React.ReactNode } }).props;
                    const className = props?.className;
                    const code = flattenText(props?.children);
                    const m = /language-(\w+)/.exec(className || '');
                    return <BlogCodeBlock language={m?.[1]} code={code} />;
                  }
                  return <pre>{children}</pre>;
                },
              }}
            >
              {body}
            </ReactMarkdown>
          </div>
        </div>
      </div>
      <BulletinFooter />
    </>
  );
}

function chipStyle(active: boolean): React.CSSProperties {
  return {
    padding: '5px 12px',
    fontSize: 12,
    fontFamily: tokens.font.tc,
    fontWeight: 800,
    color: active ? '#fff' : tokens.ink,
    background: active ? tokens.ink : '#fff',
    border: `1.8px solid ${tokens.ink}`,
    borderRadius: 999,
    cursor: 'pointer',
    boxShadow: active ? '2px 2px 0 rgba(0,0,0,.2)' : '1.5px 1.5px 0 rgba(0,0,0,.14)',
    transition: 'all 0.15s ease',
  };
}
