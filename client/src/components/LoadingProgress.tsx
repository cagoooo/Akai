import { useEffect, useId, useState } from 'react';

interface LoadingProgressProps {
  phase: 'page' | 'content';
  title?: string;
}

/** Stage progress follows real routing/data state, rather than guessing download percentages. */
export function LoadingProgress({ phase, title = '正在準備精彩內容' }: LoadingProgressProps) {
  const [slow, setSlow] = useState(false);
  const titleId = useId();
  const step = phase === 'page' ? 1 : 2;
  const label = phase === 'page' ? '準備頁面' : '讀取內容';
  useEffect(() => {
    setSlow(false);
    const timer = window.setTimeout(() => setSlow(true), 10000);
    return () => window.clearTimeout(timer);
  }, [phase]);
  return (
    <section className="loading-progress" aria-labelledby={titleId} aria-busy="true">
      <span className="loading-progress__eyebrow">美好的教學點子，正在路上</span>
      <h2 id={titleId}>{title}</h2>
      <p role="status" aria-live="polite">{slow ? '目前網路較慢，仍在載入中，請稍候。' : `${label}中，完成後會自動顯示。`}</p>
      <div className="loading-progress__meta"><span>{label}</span><span>載入步驟 {step} / 3</span></div>
      <div className="loading-progress__track" role="progressbar" aria-label="內容載入進度" aria-valuemin={0} aria-valuemax={3} aria-valuenow={step} aria-valuetext={`步驟 ${step}，${label}；這是載入階段，並非下載百分比`}>
        <div className="loading-progress__fill" style={{ width: `${step / 3 * 100}%` }} />
      </div>
      <ol className="loading-progress__steps" aria-label="載入步驟">
        {['準備頁面', '讀取內容', '開始使用'].map((text, index) => (
          <li key={text} className={index + 1 === step ? 'is-current' : index + 1 < step ? 'is-complete' : ''} aria-current={index + 1 === step ? 'step' : undefined}>
            <span aria-hidden="true">{index + 1 < step ? '✓' : index + 1}</span>{text}
          </li>
        ))}
      </ol>
    </section>
  );
}
