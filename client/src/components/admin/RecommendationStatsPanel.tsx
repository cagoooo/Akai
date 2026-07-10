/**
 * RecommendationStatsPanel — 客群推薦精靈成效解析（admin only，P1-6）
 *
 * 資料源：analytics/recoStats 單一聚合 doc（由 recordRecoImpression / recordRecoClick 寫入）
 * 呈現：
 * - KPI：總曝光 / 總點擊 / 整體 CTR / 痛點點擊佔比
 * - 分眾表：每個客群 segment 的曝光、點擊、CTR
 * - 工具表：每個工具被推薦的曝光、點擊、CTR，標記「常被推卻沒人點」
 * - slot 點擊分布：哪種推薦理由（熱門 / 痛點 / 職務…）最能帶動點擊
 *
 * 用途：形成「量測 → 調權重 → 再量測」閉環，指導 POPULARITY_WEIGHT / PAINPOINT_WEIGHT 等調參。
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Target, MousePointer, Eye, Percent } from 'lucide-react';

type Counter = { imp?: number; clk?: number };
interface RecoStats {
  totalImpressions?: number;
  totalClicks?: number;
  painClicks?: number;
  tools?: Record<string, Counter>;
  segments?: Record<string, Counter>;
  slotClicks?: Record<string, number>;
}

// segment key = [audience, schoolLevel, teacherRole, department].filter(Boolean).join('_')
const TOKEN_LABEL: Record<string, string> = {
  teacher: '老師', student: '學生',
  elementary: '國小', junior: '國中', senior: '高中',
  homeroom: '導師', subject: '科任', admin: '行政',
  academic: '教務', 'student-affairs': '學務', 'general-affairs': '總務', counseling: '輔導', other: '其他處室',
};
function describeSegment(key: string): string {
  const parts = key.split('_').map((t) => TOKEN_LABEL[t] ?? t);
  return parts.join('・');
}

const SLOT_LABEL: Record<string, string> = {
  painpoint: '🎯 命中需求', popular: '🔥 熱門排行', role: '👤 貼近職務',
  stage: '📚 同學段', discovery: '✨ 為你發掘', universal: '⭐ 廣受好評', unknown: '其他',
};

function ctr(clk: number, imp: number): number {
  return imp > 0 ? (clk / imp) * 100 : 0;
}
function fmtPct(v: number): string {
  return `${v.toFixed(1)}%`;
}

export function RecommendationStatsPanel() {
  const [stats, setStats] = useState<RecoStats | null>(null);
  const [toolTitles, setToolTitles] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { db, isFirebaseAvailable } = await import('@/lib/firebase');
      if (!isFirebaseAvailable() || !db) {
        setError('Firestore 未連線');
        setLoading(false);
        return;
      }
      const { doc, getDoc } = await import('firebase/firestore');
      const snap = await getDoc(doc(db, 'analytics', 'recoStats'));
      setStats(snap.exists() ? (snap.data() as RecoStats) : {});
    } catch (err) {
      setError(err instanceof Error ? err.message : '讀取失敗');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // 工具標題（給工具表用），靜態 tools.json 足夠
    (async () => {
      try {
        const base = import.meta.env.BASE_URL || '/';
        const res = await fetch(`${base}api/tools.json`);
        if (!res.ok) return;
        const tools = (await res.json()) as Array<{ id: number; title: string }>;
        setToolTitles(new Map(tools.map((t) => [t.id, t.title])));
      } catch {
        /* 標題缺失時退回顯示 #id */
      }
    })();
  }, [load]);

  const totalImp = stats?.totalImpressions ?? 0;
  const totalClk = stats?.totalClicks ?? 0;
  const painClk = stats?.painClicks ?? 0;

  const segmentRows = useMemo(() => {
    const entries = Object.entries(stats?.segments ?? {});
    return entries
      .map(([key, c]) => ({ key, label: describeSegment(key), imp: c.imp ?? 0, clk: c.clk ?? 0 }))
      .sort((a, b) => b.imp - a.imp || b.clk - a.clk);
  }, [stats]);

  const toolRows = useMemo(() => {
    const entries = Object.entries(stats?.tools ?? {});
    return entries
      .map(([id, c]) => {
        const imp = c.imp ?? 0;
        const clk = c.clk ?? 0;
        return { id: Number(id), title: toolTitles.get(Number(id)) ?? `#${id}`, imp, clk, rate: ctr(clk, imp) };
      })
      .sort((a, b) => b.imp - a.imp || b.clk - a.clk);
  }, [stats, toolTitles]);

  const slotRows = useMemo(() => {
    const entries = Object.entries(stats?.slotClicks ?? {});
    const total = entries.reduce((s, [, v]) => s + (v ?? 0), 0);
    return entries
      .map(([slot, clk]) => ({ slot, label: SLOT_LABEL[slot] ?? slot, clk: clk ?? 0, share: total > 0 ? (clk / total) * 100 : 0 }))
      .sort((a, b) => b.clk - a.clk);
  }, [stats]);

  // 「常被推卻沒人點」：曝光量前段（≥ 全站平均曝光）但 CTR 偏低（< 整體 CTR 的一半）
  const overallCtr = ctr(totalClk, totalImp);
  const avgImp = toolRows.length > 0 ? toolRows.reduce((s, r) => s + r.imp, 0) / toolRows.length : 0;
  const isColdStar = (r: { imp: number; rate: number }) => r.imp >= Math.max(avgImp, 3) && r.rate < overallCtr / 2;

  const kpiCard = (icon: React.ReactNode, label: string, value: string, hint?: string) => (
    <div style={{ background: 'rgba(255,255,255,.7)', border: '2px solid #1a1a1a', borderRadius: 10, boxShadow: '3px 3px 0 rgba(0,0,0,.16)', padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6b5a35', fontSize: 12, fontWeight: 800 }}>{icon}{label}</div>
      <div style={{ fontSize: 26, fontWeight: 900, color: '#2c2412', marginTop: 4 }}>{value}</div>
      {hint && <div style={{ fontSize: 11, color: '#8a7a55', marginTop: 2 }}>{hint}</div>}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 900, color: '#2c2412', display: 'flex', alignItems: 'center', gap: 7 }}>
            <Target className="h-5 w-5" /> 推薦精靈成效
          </h3>
          <p style={{ fontSize: 12, color: '#6b5a35', marginTop: 2 }}>客群 onboarding 的曝光 / 點擊 / CTR，指導推薦權重調參</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          <span className="ml-1">重新整理</span>
        </Button>
      </div>

      {error && <Card><CardContent className="py-6 text-center text-sm text-red-600">讀取失敗：{error}</CardContent></Card>}

      {!error && totalImp === 0 && !loading && (
        <Card><CardContent className="py-8 text-center text-sm text-slate-500">
          還沒有推薦精靈的曝光資料 📊<br />
          <span className="text-xs opacity-70">使用者完成一次「客群推薦精靈」後，這裡就會長出資料。</span>
        </CardContent></Card>
      )}

      {totalImp > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {kpiCard(<Eye className="h-3.5 w-3.5" />, '總曝光', totalImp.toLocaleString(), '推薦結果被看到的次數')}
            {kpiCard(<MousePointer className="h-3.5 w-3.5" />, '總點擊', totalClk.toLocaleString(), '推薦卡片被點的次數')}
            {kpiCard(<Percent className="h-3.5 w-3.5" />, '整體 CTR', fmtPct(overallCtr), '點擊 ÷ 曝光')}
            {kpiCard(<Target className="h-3.5 w-3.5" />, '痛點點擊佔比', totalClk > 0 ? fmtPct((painClk / totalClk) * 100) : '—', '命中痛點的點擊比例')}
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">分眾成效</CardTitle><CardDescription>各客群的曝光、點擊與 CTR（依曝光排序）</CardDescription></CardHeader>
            <CardContent>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: '#6b5a35', borderBottom: '2px solid #d8ccae' }}>
                      <th style={{ padding: '6px 8px' }}>客群</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right' }}>曝光</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right' }}>點擊</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right' }}>CTR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {segmentRows.map((r) => (
                      <tr key={r.key} style={{ borderBottom: '1px solid #ece3cd' }}>
                        <td style={{ padding: '6px 8px', fontWeight: 700 }}>{r.label}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right' }}>{r.imp.toLocaleString()}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right' }}>{r.clk.toLocaleString()}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 800 }}>{fmtPct(ctr(r.clk, r.imp))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">推薦理由（slot）帶動點擊分布</CardTitle>
              <CardDescription>哪種「為什麼推」的徽章最能讓使用者點下去</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {slotRows.length === 0 && <div className="text-sm text-slate-500">尚無點擊資料</div>}
                {slotRows.map((r) => (
                  <div key={r.slot} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 100, fontSize: 13, fontWeight: 700 }}>{r.label}</span>
                    <div style={{ flex: 1, height: 16, background: '#ece3cd', borderRadius: 8, overflow: 'hidden' }}>
                      <div style={{ width: `${r.share}%`, height: '100%', background: '#7a8c3a' }} />
                    </div>
                    <span style={{ width: 96, textAlign: 'right', fontSize: 12 }}>{r.clk} 次（{fmtPct(r.share)}）</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">工具被推薦成效</CardTitle>
              <CardDescription>
                依曝光排序；<span style={{ color: '#b45309', fontWeight: 800 }}>橘底</span>= 常被推卻沒人點（曝光高但 CTR 偏低，可考慮改 reason 或降權）
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ overflowX: 'auto', maxHeight: 420, overflowY: 'auto' }}>
                <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: '#6b5a35', borderBottom: '2px solid #d8ccae', position: 'sticky', top: 0, background: '#faf5e8' }}>
                      <th style={{ padding: '6px 8px' }}>工具</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right' }}>曝光</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right' }}>點擊</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right' }}>CTR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {toolRows.map((r) => {
                      const cold = isColdStar(r);
                      return (
                        <tr key={r.id} style={{ borderBottom: '1px solid #ece3cd', background: cold ? 'rgba(251,191,36,.22)' : undefined }}>
                          <td style={{ padding: '6px 8px', fontWeight: 700 }}>
                            <span style={{ color: '#9a8a6a', fontSize: 11 }}>#{r.id}</span> {r.title}
                          </td>
                          <td style={{ padding: '6px 8px', textAlign: 'right' }}>{r.imp.toLocaleString()}</td>
                          <td style={{ padding: '6px 8px', textAlign: 'right' }}>{r.clk.toLocaleString()}</td>
                          <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 800 }}>{fmtPct(r.rate)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
