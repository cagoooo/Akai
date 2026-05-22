import { Link } from 'wouter';

export function BlogCta() {
  return (
    <div className="bp-cta">
      <div className="bp-cta__heading">看完這篇，接下來呢？</div>
      <div className="bp-cta__actions">
        <Link href="/blog" className="bp-btn bp-btn--primary">
          <span aria-hidden="true">📖</span>
          <span>看更多教學情境長文</span>
        </Link>
        <Link href="/?wish=1" className="bp-btn bp-btn--ghost">
          <span aria-hidden="true">✨</span>
          <span>跟阿凱老師許願</span>
        </Link>
      </div>
    </div>
  );
}
