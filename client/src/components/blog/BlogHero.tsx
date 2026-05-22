import { Link } from 'wouter';

interface BlogHeroProps {
  kicker: string;
  title: string;
  excerpt: string;
  emoji?: string;
  date: string;        // ISO
  readingMinutes: number;
  author?: string;
  tags?: string[];
  variant?: 'editorial' | 'sticky';
  /** 麵包屑前一層的 label / href（預設「部落格」/ "/blog"） */
  crumbHref?: string;
  crumbLabel?: string;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function BlogHero({
  kicker,
  title,
  excerpt,
  emoji,
  date,
  readingMinutes,
  author = '阿凱',
  tags = [],
  variant = 'editorial',
  crumbHref = '/blog',
  crumbLabel = '部落格',
}: BlogHeroProps) {
  const cls = variant === 'sticky' ? 'bp-hero bp-hero--sticky' : 'bp-hero';

  return (
    <>
      <Link href={crumbHref} className="bp-crumb" aria-label={`回到${crumbLabel}列表`}>
        <span className="bp-crumb__arrow" aria-hidden="true">←</span>
        <span>{crumbLabel}</span>
        {kicker && (
          <>
            <span className="bp-crumb__sep">/</span>
            <span style={{ color: 'var(--ink-soft)' }}>{kicker.split('·')[0].trim()}</span>
          </>
        )}
      </Link>

      <div className={cls}>
        {variant === 'editorial' && emoji && (
          <div className="bp-hero__emoji-sticker" aria-hidden="true">{emoji}</div>
        )}

        <div className="bp-hero__kicker">{kicker}</div>

        <h1 className="bp-hero__title">{title}</h1>

        {excerpt && <p className="bp-hero__excerpt">{excerpt}</p>}

        <div className="bp-hero__meta">
          <span className="bp-hero__meta-item">
            <span className="bp-hero__author-pic" aria-hidden="true">凱</span>
            <span>{author}老師</span>
          </span>
          <span className="bp-hero__meta-dot" aria-hidden="true" />
          <span className="bp-hero__meta-item">📅 {formatDate(date)}</span>
          <span className="bp-hero__meta-dot" aria-hidden="true" />
          <span className="bp-hero__meta-item">📖 {readingMinutes} 分鐘閱讀</span>
        </div>

        {tags.length > 0 && (
          <div className="bp-hero__tags">
            {tags.map((tag) => (
              <span key={tag} className="bp-tag">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
