/**
 * 引導漏斗看板（P0-5）
 *
 * 把 recoStats.funnel 畫成有順序的漏斗：每一步的留存長條 + 相對前一步的流失，
 * 並把「掉最多人的那一段」標出來 —— 那就是下一次該優化的地方。
 *
 * 分支步驟（只有老師選職務、只有行政選處室）另外列，避免混進主漏斗算出假流失。
 */

import { AlertTriangle, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { buildAudienceFunnel } from '@/lib/audienceFunnel';

const pct = (value: number) => `${value.toFixed(1)}%`;

export function AudienceFunnelChart({
    funnel,
    minSample = 20,
    rangeLabel,
}: {
    funnel: Record<string, number> | undefined;
    minSample?: number;
    rangeLabel?: string;
}) {
    const { steps, branches, completionRate, hasEnoughSample } = buildAudienceFunnel(funnel, minSample);
    const opened = steps[0]?.count ?? 0;
    const biggest = steps.find((step) => step.isBiggestDrop);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <TrendingDown className="h-4 w-4" /> 引導漏斗{rangeLabel ? `（${rangeLabel}）` : ''}
                </CardTitle>
                <CardDescription>
                    從開啟精靈到看到推薦結果，每一步留下多少人。樣本少於 {minSample} 次開啟時只顯示數字，不指認「最該修的一步」。
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {opened === 0 ? (
                    <div className="py-4 text-center text-sm text-slate-500">這個區間還沒有引導資料。</div>
                ) : (
                    <>
                        <div className="space-y-2">
                            {steps.map((step, index) => (
                                <div key={step.key}>
                                    <div className="flex items-baseline justify-between text-sm">
                                        <span className="font-bold text-[#2c2412]">
                                            {index + 1}. {step.label}
                                            {step.isBiggestDrop && (
                                                <span className="ml-2 rounded-full border border-red-400 bg-red-50 px-2 py-0.5 text-[11px] font-black text-red-700">
                                                    掉最多人
                                                </span>
                                            )}
                                        </span>
                                        <span className="text-[#6b5a35]">
                                            {step.count.toLocaleString()} 人・留存 {pct(step.retention)}
                                        </span>
                                    </div>
                                    <div className="mt-1 h-3 w-full overflow-hidden rounded-full border-2 border-[#1a1a1a] bg-white/60">
                                        <div
                                            style={{ width: `${Math.max(0, Math.min(100, step.retention))}%` }}
                                            className={`h-full ${step.isBiggestDrop ? 'bg-red-400' : 'bg-[#7a8c3a]'}`}
                                        />
                                    </div>
                                    {index > 0 && step.dropped > 0 && (
                                        <div className="mt-1 text-[11px] text-[#8a7a55]">
                                            ↓ 比上一步少了 {step.dropped.toLocaleString()} 人（流失 {pct(step.dropRate)}）
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="rounded-md border-2 border-amber-200 bg-amber-50/70 p-3 text-sm">
                            <div className="flex justify-between">
                                <span>整體完成率（開啟 → 看到推薦）</span>
                                <strong>{pct(completionRate)}</strong>
                            </div>
                            {hasEnoughSample && biggest ? (
                                <div className="mt-2 flex items-start gap-2 text-[#7a4a10]">
                                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                    <span>
                                        下一個該優化的是「<strong>{biggest.label}</strong>」這一步，
                                        在這裡流失了 {biggest.dropped.toLocaleString()} 人（{pct(biggest.dropRate)}）。
                                    </span>
                                </div>
                            ) : (
                                <div className="mt-2 text-[11px] text-[#8a7a55]">
                                    樣本累積中（已有 {opened.toLocaleString()} 次開啟，滿 {minSample} 次才做判定）。
                                </div>
                            )}
                        </div>

                        <div className="space-y-1 text-sm">
                            <div className="text-[12px] font-bold text-[#6b5a35]">分支步驟（不是每個人都會走到，不計入上面的流失）</div>
                            {branches.map((branch) => (
                                <div key={branch.key} className="flex justify-between border-b border-amber-100 pb-1">
                                    <span>
                                        {branch.label}
                                        <span className="ml-2 text-[11px] text-[#8a7a55]">{branch.note}</span>
                                    </span>
                                    <span className="text-[#6b5a35]">
                                        {branch.count.toLocaleString()} 人・佔上游 {pct(branch.shareOfParent)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
