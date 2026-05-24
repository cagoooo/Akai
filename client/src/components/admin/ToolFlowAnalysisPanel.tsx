/**
 * ToolFlowAnalysisPanel — #14 / 任一工具流量解析（admin only）
 *
 * 串接 getToolFlowAnalysis callable，呈現：
 * - KPI 卡：totalEvents / uniqueSessions / 平均人均點擊
 * - 24h 時段分布 BarChart
 * - referrer / device / country 三個 PieChart
 *
 * 資料源：toolClickEvents collection（v3.6.49+ 才開始累積）
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, PieChart } from '@/components/ui/charts';
import {
  DateRangePicker,
  presetToRange,
  toDateStr,
  type DateRange,
} from '@/components/admin/DateRangePicker';
import { Activity, MousePointer, Users, Globe, Smartphone, Link2, Loader2 } from 'lucide-react';

type FlowResult = {
  toolId: number;
  fromDate: string;
  toDate: string;
  totalEvents: number;
  uniqueSessions: number;
  hourDist: Record<string, number>;
  referrerDist: Record<string, number>;
  deviceDist: Record<string, number>;
  countryDist: Record<string, number>;
};

const REFERRER_LABEL: Record<string, string> = {
  direct: '直接訪問',
  line: 'LINE',
  facebook: 'Facebook',
  google: 'Google',
  youtube: 'YouTube',
  instagram: 'Instagram',
  threads: 'Threads',
  twitter: 'X / Twitter',
  bing: 'Bing',
  yahoo: 'Yahoo',
  school: '學校網站',
  notion: 'Notion',
  padlet: 'Padlet',
  internal: '站內',
  other: '其他來源',
};

const DEVICE_LABEL: Record<string, string> = {
  mobile: '📱 手機',
  tablet: '🟫 平板',
  desktop: '🖥️ 桌機',
};

const COUNTRY_LABEL: Record<string, string> = {
  TW: '🇹🇼 台灣',
  HK: '🇭🇰 香港',
  CN: '🇨🇳 中國',
  US: '🇺🇸 美國',
  JP: '🇯🇵 日本',
  KR: '🇰🇷 韓國',
  SG: '🇸🇬 新加坡',
  MY: '🇲🇾 馬來西亞',
  unknown: '未知',
};

const PIE_COLORS = [
  'rgba(99, 102, 241, 0.75)',
  'rgba(34, 197, 94, 0.75)',
  'rgba(249, 115, 22, 0.75)',
  'rgba(244, 63, 94, 0.75)',
  'rgba(168, 85, 247, 0.75)',
  'rgba(14, 165, 233, 0.75)',
  'rgba(234, 179, 8, 0.75)',
  'rgba(20, 184, 166, 0.75)',
];

function entriesToPieData(dist: Record<string, number>, labelMap: Record<string, string>) {
  const entries = Object.entries(dist || {})
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);
  return {
    labels: entries.map(([k]) => labelMap[k] || k),
    datasets: [
      {
        data: entries.map(([, v]) => v),
        backgroundColor: entries.map((_, i) => PIE_COLORS[i % PIE_COLORS.length]),
        borderColor: '#fff',
        borderWidth: 1.5,
      },
    ],
  };
}

interface Props {
  toolTitles: Map<number, string>;
}

export function ToolFlowAnalysisPanel({ toolTitles }: Props) {
  const [toolId, setToolId] = useState<number>(14); // 預設 #14 早安長輩圖（使用者最關心的）
  const [dateRange, setDateRange] = useState<DateRange>(() => presetToRange('last30'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<FlowResult | null>(null);

  // 工具下拉選項（排序：ID 升序）
  const toolOptions = useMemo(
    () =>
      Array.from(toolTitles.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([id, title]) => ({ id, title })),
    [toolTitles]
  );

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const { getFunctions, httpsCallable } = await import('firebase/functions');
      const functions = getFunctions(undefined, 'asia-east1');
      const callable = httpsCallable<
        { toolId: number; fromDate: string; toDate: string },
        FlowResult
      >(functions, 'getToolFlowAnalysis');
      const res = await callable({
        toolId,
        fromDate: toDateStr(dateRange.start),
        toDate: toDateStr(dateRange.end),
      });
      setData(res.data);
    } catch (err: any) {
      console.error('[流量解析] failed:', err);
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const avgClicksPerSession =
    data && data.uniqueSessions > 0 ? (data.totalEvents / data.uniqueSessions).toFixed(2) : '—';

  return (
    <Card style={{ marginTop: 16 }}>
      <CardHeader>
        <CardTitle style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={20} />
          🔍 工具流量解析（細粒度切片）
        </CardTitle>
        <CardDescription>
          選一個工具 + 日期範圍，看 referrer / device / country / 時段切片。
          資料源：toolClickEvents（v3.6.49+ 才開始累積，舊資料看不到）
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 控制列 */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            gap: 12,
            marginBottom: 16,
            padding: 12,
            background: '#fafafa',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
          }}
        >
          <div>
            <label
              style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}
            >
              工具
            </label>
            <select
              value={toolId}
              onChange={(e) => setToolId(Number(e.target.value))}
              style={{
                padding: '6px 10px',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                fontSize: 13,
                minWidth: 260,
                background: '#fff',
              }}
            >
              {toolOptions.map(({ id, title }) => (
                <option key={id} value={id}>
                  #{id} {title}
                </option>
              ))}
            </select>
          </div>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <Button onClick={runAnalysis} disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" /> 分析中…
              </>
            ) : (
              <>🔎 分析</>
            )}
          </Button>
        </div>

        {/* 錯誤 */}
        {error && (
          <div
            style={{
              padding: 12,
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 6,
              color: '#dc2626',
              fontSize: 13,
              marginBottom: 12,
            }}
          >
            ❌ {error}
            {/admin only|permission/i.test(error) && (
              <div style={{ marginTop: 4, fontSize: 11 }}>
                提示：需要 admin custom claim 才能 call。檢查 Firebase Auth 帳號是否已 setCustomClaims。
              </div>
            )}
          </div>
        )}

        {/* 空狀態 */}
        {!loading && !error && !data && (
          <div
            style={{
              padding: 40,
              textAlign: 'center',
              color: '#9ca3af',
              fontSize: 13,
            }}
          >
            👆 選好工具和日期後按「分析」開始
          </div>
        )}

        {/* 結果 */}
        {data && (
          <>
            {/* KPI 卡 ×3 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 12,
                marginBottom: 20,
              }}
            >
              <KpiCard
                icon={<MousePointer size={18} />}
                label="總點擊事件"
                value={data.totalEvents.toLocaleString()}
                color="#6366f1"
              />
              <KpiCard
                icon={<Users size={18} />}
                label="去重後人數 (session)"
                value={data.uniqueSessions.toLocaleString()}
                color="#22c55e"
              />
              <KpiCard
                icon={<Activity size={18} />}
                label="人均點擊"
                value={avgClicksPerSession}
                color="#f97316"
              />
            </div>

            {data.totalEvents === 0 ? (
              <div
                style={{
                  padding: 32,
                  textAlign: 'center',
                  color: '#9ca3af',
                  fontSize: 13,
                  background: '#f9fafb',
                  borderRadius: 8,
                }}
              >
                此期間沒有 toolClickEvents 資料。
                <div style={{ marginTop: 6, fontSize: 11 }}>
                  （v3.6.49 之前的點擊只記到 toolUsageStats，沒寫 event log）
                </div>
              </div>
            ) : (
              <>
                {/* 時段分布 24h BarChart */}
                <div style={{ marginBottom: 24 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
                    🕐 24 小時時段分布（Asia/Taipei）
                  </h4>
                  <BarChart
                    data={{
                      labels: Array.from({ length: 24 }, (_, h) => `${h}:00`),
                      datasets: [
                        {
                          label: '點擊數',
                          data: Array.from({ length: 24 }, (_, h) => data.hourDist[String(h)] || 0),
                          backgroundColor: 'rgba(99, 102, 241, 0.7)',
                          borderColor: 'rgb(99, 102, 241)',
                          borderWidth: 1,
                        },
                      ],
                    }}
                    height={220}
                    options={{
                      responsive: true,
                      plugins: { legend: { display: false } },
                      scales: { y: { beginAtZero: true } },
                    }}
                  />
                </div>

                {/* referrer / device / country 三個 Pie */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: 16,
                  }}
                >
                  <PieSection
                    icon={<Link2 size={16} />}
                    title="🔗 流量來源（referrer）"
                    data={entriesToPieData(data.referrerDist, REFERRER_LABEL)}
                  />
                  <PieSection
                    icon={<Smartphone size={16} />}
                    title="📱 裝置分布"
                    data={entriesToPieData(data.deviceDist, DEVICE_LABEL)}
                  />
                  <PieSection
                    icon={<Globe size={16} />}
                    title="🌍 國別分布"
                    data={entriesToPieData(data.countryDist, COUNTRY_LABEL)}
                  />
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ── 子元件 ─────────────────────────────────────
function KpiCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      style={{
        padding: 14,
        background: '#fff',
        border: `2px solid ${color}33`,
        borderLeft: `4px solid ${color}`,
        borderRadius: 8,
        boxShadow: '1px 2px 0 rgba(0,0,0,.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color, fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
        {icon}
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: '#111827', fontFamily: 'system-ui, sans-serif' }}>
        {value}
      </div>
    </div>
  );
}

function PieSection({
  icon,
  title,
  data,
}: {
  icon: React.ReactNode;
  title: string;
  data: ReturnType<typeof entriesToPieData>;
}) {
  if (!data.labels.length) {
    return (
      <div style={{ padding: 16, background: '#f9fafb', borderRadius: 8, textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>
        {title} — 無資料
      </div>
    );
  }
  return (
    <div style={{ padding: 12, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}>
      <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
        {icon}
        {title}
      </h4>
      <PieChart
        data={data}
        height={200}
        options={{
          responsive: true,
          plugins: {
            legend: { position: 'right', labels: { font: { size: 11 } } },
          },
        }}
      />
    </div>
  );
}
