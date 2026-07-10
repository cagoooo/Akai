import type { AudienceRecommendation } from '@/lib/audienceRecommendation';

export function AudienceRecommendationResults({ recommendations, onLocateTool }: { recommendations: AudienceRecommendation[]; onLocateTool: (toolId: number) => void }) {
  return <section className="audience-wizard__results" aria-labelledby="audience-results-title">
    <div className="audience-wizard__tape">為你精選</div>
    <h2 id="audience-results-title">這些工具，現在就很好用</h2>
    <p>依照你的身分，先從最能幫上忙的工具開始。</p>
    <div className="audience-wizard__recommendations">
      {recommendations.map(({ tool, reason }, index) => <button key={tool.id} type="button" className="audience-wizard__recommendation" data-tool-id={tool.id} onClick={() => onLocateTool(tool.id)}>
        <span className="audience-wizard__pin" aria-hidden="true" />
        <span className="audience-wizard__number">{String(index + 1).padStart(2, '0')}</span>
        <strong>{tool.title}</strong><small>{reason}</small><span className="audience-wizard__go">查看工具卡 →</span>
      </button>)}
    </div>
  </section>;
}
