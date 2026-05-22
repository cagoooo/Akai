import { useState } from 'react';

interface BlogMobileShareProps {
  shareTitle?: string;
}

export function BlogMobileShare({ shareTitle }: BlogMobileShareProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(window.location.href).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      },
      () => {
        /* 安靜失敗 */
      }
    );
  };

  const handlePrint = (e: React.MouseEvent) => {
    e.preventDefault();
    window.print();
  };

  const lineShareHref = (() => {
    if (typeof window === 'undefined') return '#';
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(shareTitle || document.title);
    return `https://social-plugins.line.me/lineit/share?url=${url}&text=${text}`;
  })();

  return (
    <div className="bp-mshare">
      <div className="bp-mshare__label">分享給其他老師</div>
      <div className="bp-mshare__row">
        <button
          type="button"
          className="bp-mshare__btn"
          onClick={handleCopy}
          aria-label="複製文章連結"
        >
          <span aria-hidden="true">{copied ? '✓' : '🔗'}</span>
          <span>{copied ? '已複製' : '複製連結'}</span>
        </button>
        <a
          className="bp-mshare__btn"
          href={lineShareHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="分享到 LINE"
        >
          <span aria-hidden="true">💬</span>
          <span>傳 LINE</span>
        </a>
        <a
          className="bp-mshare__btn"
          href="#"
          onClick={handlePrint}
          aria-label="列印"
        >
          <span aria-hidden="true">🖨️</span>
          <span>列印</span>
        </a>
      </div>
    </div>
  );
}
