/**
 * AdminWebVitalsDashboard — 真實使用者效能監控儀表板
 *
 * 讀 Firestore `analytics/webVitals/{YYYY-MM-DD}/*` collection
 *   - 最近 7 天每個 metric 平均值與 p75
 *   - good / needs-improvement / poor 三色長條
 *   - 比 CI Lighthouse 28 分準確：反映真實老師家長使用體驗
 *
 * Schema：
 *   { name, value, rating, delta, path, ua, ts }
 */

import { useEffect, useMemo, useState } from 'react';
import { collection, query, getDocs, limit } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { db } from '@/lib/firebase';
import { tokens } from '@/design/tokens';
import { toDateStr } from '@/components/admin/DateRangePicker';

type Rating = 'good' | 'needs-improvement' | 'poor';

interface VitalRow {
  name: string;
  value: number;
  rating: Rating;
  path: string;
  ts?: { seconds: number } | null;
}

interface DailyAgg {
  date: string;
  count: number;
  byMetric: Record<
    string,
    { values: number[]; good: number; ni: number; poor: number }
  >;
}

const METRICS = ['LCP', 'INP', 'CLS', 'FCP', 'TTFB'] as const;
type MetricName = typeof METRICS[number];

// Web Vitals 標準閾值（Google 官方）
const THRESHOLDS: Record<MetricName, { good: number; poor: number; unit: string }> = {
  LCP: { good: 2500, poor: 4000, unit: 'ms' },
  INP: { good: 200, poor: 500, unit: 'ms' },
  CLS: { good: 0.1, poor: 0.25, unit: '' },
  FCP: { good: 1800, poor: 3000, unit: 'ms' },
  TTFB: { good: 800, poor: 1800, unit: 'ms' },
};

function lastNDates(n: number): string[] {
  const dates: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(toDateStr(d));
  }
  return dates;
}

function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function p75(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  return sorted[Math.ceil(sorted.length * 0.75) - 1];
}

export function AdminWebVitalsDashboard() {
  const [daily, setDaily] = useState<DailyAgg[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!db) {
        setLoadError('Firebase 尚未初始化，無法讀取 Web Vitals。');
        setLoading(false);
        return;
      }
      const firestore = db;
      const dates = lastNDates(7);
      const result = await Promise.all(dates.map(async (date): Promise<DailyAgg> => {
        const agg: DailyAgg = { date, count: 0, byMetric: {} };
        for (const m of METRICS) agg.byMetric[m] = { values: [], good: 0, ni: 0, poor: 0 };
        try {
          // 注意：webVitals/{date} 是 collection 不是 doc，要用 collection() 取
          const colRef = collection(firestore, 'analytics', 'webVitals', date);
          const snap = await getDocs(query(colRef, limit(500)));
          snap.forEach((doc) => {
            const v = doc.data() as VitalRow;
            if (!v.name || !METRICS.includes(v.name as MetricName)) return;
            const slot = agg.byMetric[v.name];
            slot.values.push(v.value);
            if (v.rating === 'good') slot.good++;
            else if (v.rating === 'needs-improvement') slot.ni++;
            else slot.poor++;
            agg.count++;
          });
        } catch (error) {
          console.warn(`[AdminWebVitals] ${date} 讀取失敗:`, error);
          throw error;
        }
        return agg;
      }));
      if (!cancelled) setDaily(result);
    })().catch((error) => {
      if (!cancelled) {
        setLoadError(error instanceof Error ? error.message : '讀取 Web Vitals 失敗');
      }
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const summary = useMemo(() => {
    return METRICS.map((m) => {
      const allValues = daily.flatMap((d) => d.byMetric[m]?.values || []);
      const allGood = daily.reduce((sum, d) => sum + (d.byMetric[m]?.good || 0), 0);
      const allNi = daily.reduce((sum, d) => sum + (d.byMetric[m]?.ni || 0), 0);
      const allPoor = daily.reduce((sum, d) => sum + (d.byMetric[m]?.poor || 0), 0);
      const total = allGood + allNi + allPoor;
      return {
        metric: m,
        median: median(allValues),
        p75: p75(allValues),
        good: allGood,
        ni: allNi,
        poor: allPoor,
        total,
        goodPct: total > 0 ? Math.round((allGood / total) * 100) : 0,
        threshold: THRESHOLDS[m],
      };
    });
  }, [daily]);

  // 每日 LCP p75 折線
  const dailyLcp = daily.map((d) => ({
    date: d.date.slice(5),
    LCP: Math.round(p75(d.byMetric.LCP?.values || [])),
    INP: Math.round(p75(d.byMetric.INP?.values || [])),
    FCP: Math.round(p75(d.byMetric.FCP?.values || [])),
    samples: d.count,
  }));

  const totalSamples = daily.reduce((sum, d) => sum + d.count, 0);

  return (
    <section
      data-testid="web-vitals-dashboard"
      style={{
        marginTop: 20,
        background: '#fff',
        border: `2.5px solid ${tokens.ink}`,
        borderRadius: 12,
        padding: '22px 24px 20px',
        boxShadow: '5px 6px 0 rgba(0,0,0,.18)',
        fontFamily: tokens.font.tc,
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 14,
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 900, color: tokens.ink, margin: 0 }}>
          📊 真實使用者效能（Web Vitals RUM）
        </h2>
        <div style={{ fontSize: 12, color: tokens.muted2 }}>
          最近 7 天，總樣本數：<strong style={{ color: tokens.ink }}>{totalSamples}</strong>
        </div>
      </header>

      {loading && (
        <div style={{ padding: 30, textAlign: 'center', color: tokens.muted2, fontStyle: 'italic' }}>
          載入中…
        </div>
      )}

      {!loading && loadError && (
        <div role="alert" style={{ padding: 18, color: '#b42318', background: '#fff1f0', borderRadius: 8 }}>
          Web Vitals 載入失敗：{loadError}
        </div>
      )}

      {!loading && totalSamples === 0 && (
        <div
          style={{
            padding: '20px 18px',
            background: tokens.note.yellow,
            border: `2px solid ${tokens.ink}`,
            borderRadius: 8,
            fontSize: 13,
            color: tokens.muted2,
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: tokens.ink }}>⏳ 還沒收到 Web Vitals 資料</strong>
          <p style={{ margin: '6px 0 0' }}>
            Web Vitals RUM 採樣率設 25%（控制 Firestore 寫入量）。建議在第一次 deploy 後等
            24-48 小時，等真實使用者瀏覽過幾次後再來看。
          </p>
        </div>
      )}

      {!loading && totalSamples > 0 && (
        <>
          {/* 五個指標 summary cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 12,
              marginBottom: 24,
            }}
          >
            {summary.map((s) => {
              if (s.total === 0) return null;
              const ratingColor =
                s.goodPct >= 75 ? '#16a34a' :
                s.goodPct >= 50 ? '#eab308' : '#dc2626';
              return (
                <div
                  key={s.metric}
                  style={{
                    padding: '12px 14px',
                    background: '#fafafa',
                    border: `2px solid ${tokens.ink}`,
                    borderRadius: 8,
                    boxShadow: '2px 2px 0 rgba(0,0,0,.12)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 14, fontWeight: 900, color: tokens.ink, fontFamily: tokens.font.en }}>
                      {s.metric}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: '#fff',
                        background: ratingColor,
                        padding: '1px 6px',
                        borderRadius: 999,
                        fontWeight: 800,
                      }}
                    >
                      {s.goodPct}% good
                    </span>
                  </div>
                  <div style={{ marginTop: 6, fontSize: 22, fontWeight: 900, color: tokens.ink, fontFamily: tokens.font.en }}>
                    {s.metric === 'CLS' ? s.p75.toFixed(3) : Math.round(s.p75)}
                    <span style={{ fontSize: 11, color: tokens.muted2, marginLeft: 4, fontWeight: 700 }}>
                      {s.threshold.unit}
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: tokens.muted2, marginTop: 4 }}>
                    p75 · 中位數 {s.metric === 'CLS' ? s.median.toFixed(3) : Math.round(s.median)}
                  </div>
                  <div style={{ marginTop: 6, display: 'flex', gap: 2, height: 6 }}>
                    <div title={`good ${s.good}`} style={{ flex: s.good, background: '#16a34a', borderRadius: '2px 0 0 2px' }} />
                    <div title={`needs-improvement ${s.ni}`} style={{ flex: s.ni, background: '#eab308' }} />
                    <div title={`poor ${s.poor}`} style={{ flex: s.poor, background: '#dc2626', borderRadius: '0 2px 2px 0' }} />
                  </div>
                  <div style={{ fontSize: 10, color: tokens.muted2, marginTop: 4 }}>
                    門檻 good ≤ {s.threshold.good}{s.threshold.unit} · poor &gt; {s.threshold.poor}{s.threshold.unit}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 每日 LCP / INP / FCP p75 趨勢 */}
          <h3 style={{ fontSize: 16, fontWeight: 900, color: tokens.ink, margin: '0 0 10px' }}>
            📈 最近 7 天 p75 趨勢
          </h3>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={dailyLcp} margin={{ top: 5, right: 18, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: tokens.muted2 }} />
                <YAxis tick={{ fontSize: 11, fill: tokens.muted2 }} />
                <Tooltip
                  contentStyle={{
                    background: '#fefdfa',
                    border: `2px solid ${tokens.ink}`,
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="LCP" fill="#3b82f6" />
                <Bar dataKey="INP" fill="#8b5cf6" />
                <Bar dataKey="FCP" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p style={{ fontSize: 11, color: tokens.muted2, marginTop: 12, lineHeight: 1.5 }}>
            <strong>提示：</strong>p75 = 75% 使用者體驗到的數值（越低越好）。<br/>
            LCP &lt; 2.5s、INP &lt; 200ms、CLS &lt; 0.1 是 Google「**Core Web Vitals**」通過標準，
            影響 SEO 排名。資料 25% 採樣，總樣本 × 4 ≈ 真實使用次數。
          </p>
        </>
      )}
    </section>
  );
}
