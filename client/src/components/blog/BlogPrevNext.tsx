import { Link } from 'wouter';

interface BlogPrevNextItem {
  slug: string;
  title: string;
  emoji?: string;
}

interface BlogPrevNextProps {
  prev?: BlogPrevNextItem;
  next?: BlogPrevNextItem;
}

export function BlogPrevNext({ prev, next }: BlogPrevNextProps) {
  if (!prev && !next) return null;
  return (
    <nav className="bp-pnnav" aria-label="文章導航">
      {prev ? (
        <Link href={`/blog/${prev.slug}`} className="bp-pncard">
          <div className="bp-pncard__label">← 上一篇</div>
          <div className="bp-pncard__title">
            {prev.emoji ? `${prev.emoji} ` : ''}{prev.title}
          </div>
        </Link>
      ) : (
        <div aria-hidden="true" />
      )}
      {next ? (
        <Link href={`/blog/${next.slug}`} className="bp-pncard bp-pncard--next">
          <div className="bp-pncard__label">下一篇 →</div>
          <div className="bp-pncard__title">
            {next.emoji ? `${next.emoji} ` : ''}{next.title}
          </div>
        </Link>
      ) : (
        <div aria-hidden="true" />
      )}
    </nav>
  );
}
