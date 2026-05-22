import { useState } from 'react';

interface BlogLeftRailFact {
  key: string;
  value: string;
}

interface BlogLeftRailProps {
  /** 拍立得照片中央的字（預設「凱」） */
  initial?: string;
  authorName?: string;
  authorRole?: string;
  facts: BlogLeftRailFact[];
  /** 0-100 閱讀百分比，由父層的 useReadingProgress 傳入 */
  progress: number;
  /** 已知連結（複製到剪貼簿、列印等）；title 用於分享 caption */
  shareTitle?: string;
}

export function BlogLeftRail({
  initial = '凱',
  authorName = '阿凱老師',
  authorRole = '教育科技創新',
  facts,
  progress,
  shareTitle,
}: BlogLeftRailProps) {
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
    <div className="bp-lrail">
      <div className="bp-lrail-polaroid">
        <div className="bp-lrail-polaroid__photo" aria-hidden="true">{initial}</div>
        <div className="bp-lrail-polaroid__caption">{authorName}</div>
        <div className="bp-lrail-polaroid__sub">{authorRole}</div>
      </div>

      {facts.length > 0 && (
        <div className="bp-lrail-card">
          <div className="bp-lrail-card__label">本篇 · INFO</div>
          {facts.map((f) => (
            <div key={f.key} className="bp-lrail-fact">
              <span className="bp-lrail-fact__key">{f.key}</span>
              <span className="bp-lrail-fact__dots" aria-hidden="true" />
              <span className="bp-lrail-fact__val">{f.value}</span>
            </div>
          ))}
        </div>
      )}

      <div className="bp-lrail-progress">
        <div className="bp-lrail-progress__head">
          <span className="bp-lrail-progress__label">閱讀進度</span>
          <span className="bp-lrail-progress__pct">{Math.round(progress)}%</span>
        </div>
        <div className="bp-lrail-progress__track">
          <div className="bp-lrail-progress__bar" style={{ width: `${progress}%` }} />
        </div>
        <div className="bp-lrail-progress__ticks" aria-hidden="true">
          <span>0</span><span>·</span><span>·</span><span>·</span><span>100</span>
        </div>
      </div>

      <div>
        <div className="bp-lrail-share-label">分享</div>
        <div className="bp-lrail-share">
          <button
            type="button"
            className="bp-lrail-share__btn"
            onClick={handleCopy}
            aria-label="複製文章連結"
          >
            <span aria-hidden="true">{copied ? '✓' : '🔗'}</span>
            <span>{copied ? '已複製連結' : '複製連結'}</span>
          </button>
          <a
            className="bp-lrail-share__btn"
            href={lineShareHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="分享到 LINE"
          >
            <span aria-hidden="true">💬</span>
            <span>傳給同事</span>
          </a>
          <a
            className="bp-lrail-share__btn"
            href="#"
            onClick={handlePrint}
            aria-label="列印或匯出 PDF"
          >
            <span aria-hidden="true">🖨️</span>
            <span>列印 / PDF</span>
          </a>
        </div>
      </div>
    </div>
  );
}
