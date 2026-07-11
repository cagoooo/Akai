import type { Ref } from 'react';
import type { AudienceRecommendation, RecommendationSlot } from '@/lib/audienceRecommendation';

// P0-1：把已算好的 slot / 痛點命中轉成「為什麼推」徽章，讓使用者秒懂推薦邏輯。
const SLOT_BADGES: Record<RecommendationSlot, { label: string; kind: string }> = {
  popular: { label: '🔥 熱門排行', kind: 'popular' },
  role: { label: '👤 貼近職務', kind: 'role' },
  stage: { label: '📚 同學段熱推', kind: 'stage' },
  discovery: { label: '✨ 為你發掘', kind: 'discovery' },
  universal: { label: '⭐ 廣受好評', kind: 'universal' },
};

export function badgeFor(rec: AudienceRecommendation): { label: string; kind: string } {
  // 痛點命中最能解釋「為什麼推」，優先顯示
  if (rec.matchedPainPoints > 0) return { label: '🎯 命中你的需求', kind: 'painpoint' };
  return SLOT_BADGES[rec.slot] ?? SLOT_BADGES.universal;
}

export function AudienceRecommendationResults({ recommendations, onLocateTool, onReshuffle, firstRecommendationRef }: { recommendations: AudienceRecommendation[]; onLocateTool: (toolId: number) => void; onReshuffle?: () => void; firstRecommendationRef?: Ref<HTMLButtonElement> }) {
  return <section className="audience-wizard__results" aria-labelledby="audience-results-title">
    <div className="audience-wizard__tape">為你精選</div>
    <h2 id="audience-results-title">這些工具，現在就很好用</h2>
    <p>依照你的身分，先從最能幫上忙的工具開始。</p>
    <div className="audience-wizard__recommendations">
      {recommendations.map((rec, index) => {
        const { tool, reason } = rec;
        const badge = badgeFor(rec);
        return <button ref={index === 0 ? firstRecommendationRef : undefined} key={tool.id} type="button" className="audience-wizard__recommendation is-revealing" style={{ animationDelay: `${index * 75}ms` }} data-tool-id={tool.id} onClick={() => onLocateTool(tool.id)}>
          <span className="audience-wizard__pin" aria-hidden="true" />
          <span className="audience-wizard__number">{String(index + 1).padStart(2, '0')}</span>
          <span className={`audience-wizard__badge audience-wizard__badge--${badge.kind}`}>{badge.label}</span>
          <strong>{tool.title}</strong><small>{reason}</small><span className="audience-wizard__go">查看工具卡 →</span>
        </button>;
      })}
    </div>
    {onReshuffle && (
      <button type="button" className="audience-wizard__reshuffle" onClick={onReshuffle}>
        🔄 換一批推薦
      </button>
    )}
  </section>;
}
