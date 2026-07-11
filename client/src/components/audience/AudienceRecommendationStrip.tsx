import { useEffect, useMemo } from 'react';
import type { AudienceProfile } from '@/lib/audienceProfile';
import type { EducationalTool } from '@/lib/data';
import { recommendTools } from '@/lib/audienceRecommendation';
import { recordRecoClick, recordRecoImpression, trackEvent } from '@/lib/analytics';
import { buildAudienceSegmentKey } from '@/lib/audienceProfile';
import { badgeFor } from './AudienceRecommendationResults';

/**
 * P1-7：首頁常駐「為你推薦」條。
 * 完成過推薦精靈的回訪者，首頁就有一排依其身分即時算出的推薦（含最近使用去重），
 * 把一次性的引導 modal 變成每次回訪都在的個人化入口。
 */
export function AudienceRecommendationStrip({
  profile,
  tools,
  recentToolIds,
  onLocateTool,
  onReselect,
}: {
  profile: AudienceProfile;
  tools: EducationalTool[];
  recentToolIds?: number[];
  onLocateTool: (toolId: number) => void;
  onReselect?: () => void;
}) {
  const recentSet = useMemo(() => new Set(recentToolIds ?? []), [recentToolIds]);
  const recommendations = useMemo(
    () => recommendTools(tools, profile, 4, undefined, recentSet),
    [tools, profile, recentSet],
  );

  useEffect(() => {
    if (recommendations.length === 0) return;
    const segment = buildAudienceSegmentKey(profile);
    const signature = `${segment}:${recommendations.map((rec) => rec.tool.id).join(',')}`;
    const storageKey = `akai_reco_strip_imp_v1:${signature}`;
    try {
      if (sessionStorage.getItem(storageKey) === '1') return;
      sessionStorage.setItem(storageKey, '1');
    } catch {
      // 儲存空間不可用時仍保留本次曝光統計。
    }
    void recordRecoImpression({ segment, toolIds: recommendations.map((rec) => rec.tool.id), surface: 'strip' });
  }, [profile, recommendations]);

  if (recommendations.length === 0) return null;

  const handleClick = (toolId: number, slot: string, rank: number, matchedPains: number) => {
    trackEvent('audience_reco_strip_click', {
      segment: buildAudienceSegmentKey(profile),
      tool_id: toolId,
      slot,
      rank,
      matched_pains: matchedPains,
    });
    void recordRecoClick({
      segment: buildAudienceSegmentKey(profile),
      toolId,
      slot,
      matchedPains,
      painPoints: profile.painPoints,
      surface: 'strip',
    });
    onLocateTool(toolId);
  };

  return (
    <section className="audience-strip" aria-label="為你推薦的工具">
      <div className="audience-strip__head">
        <span className="audience-strip__tape">🎯 為你推薦</span>
        <span className="audience-strip__sub">依你的身分持續精選，已避開最近用過的</span>
        {onReselect && (
          <button type="button" className="audience-strip__reselect" onClick={onReselect}>重新選擇 →</button>
        )}
      </div>
      <div className="audience-strip__cards">
        {recommendations.map((rec, index) => {
          const badge = badgeFor(rec);
          return (
            <button
              key={rec.tool.id}
              type="button"
              className="audience-strip__card"
              data-tool-id={rec.tool.id}
              onClick={() => handleClick(rec.tool.id, rec.slot, index + 1, rec.matchedPainPoints)}
            >
              <span className={`audience-wizard__badge audience-wizard__badge--${badge.kind}`}>{badge.label}</span>
              <strong>{rec.tool.title}</strong>
              <small>{rec.reason}</small>
              <span className="audience-strip__go">查看工具卡 →</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
