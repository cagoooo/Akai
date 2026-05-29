/**
 * 🛡️ HealthCheckPanel — admin only
 *
 * 主動觸發 `healthCheckToolUsageStats` Cloud Function，
 * 顯示 schema 健檢結果（總 doc 數、純數字 doc、異常清單）。
 *
 * 為什麼存在：
 *   v3.6.69 雙寫 doc 漂移事件後（學生點 90 次系統只收到 5 次），
 *   加這個 panel 讓你隨時主動驗證 schema 正確性 —— 配合 v3.6.70 的
 *   monitorToolStatsSchema onWrite trigger（被動 LINE 告警），形成主被動雙保險。
 */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface HealthCheckIssue {
  docId: string;
  issue: string;
  severity: 'error' | 'warn';
}

interface HealthCheckResult {
  summary: {
    totalDocs: number;
    numericDocCount: number;
    totalClicks: number;
    issueCount: number;
    errorCount: number;
    warnCount: number;
    checkedAt: string;
  };
  issues: HealthCheckIssue[];
}

interface HealthCheckRun {
  id: string;
  errorCount: number;
  warnCount: number;
  totalDocs: number;
  checkedAt: string;
  triggeredBy: string;
}

export function HealthCheckPanel() {
  const [result, setResult] = useState<HealthCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HealthCheckRun[]>([]);
  const [historyVersion, setHistoryVersion] = useState(0); // 跑完後 +1 觸發 re-fetch

  // v3.6.71：載入過去 30 筆健檢歷史（給趨勢圖用）
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { db, isFirebaseAvailable } = await import('@/lib/firebase');
        if (!isFirebaseAvailable() || !db) return;
        const { collection, query, orderBy, limit, getDocs } = await import('firebase/firestore');
        const q = query(
          collection(db, 'healthCheckRuns'),
          orderBy('checkedAtTimestamp', 'desc'),
          limit(30)
        );
        const snap = await getDocs(q);
        if (cancelled) return;
        const runs: HealthCheckRun[] = [];
        snap.forEach((d) => {
          const data = d.data();
          runs.push({
            id: d.id,
            errorCount: Number(data.errorCount) || 0,
            warnCount: Number(data.warnCount) || 0,
            totalDocs: Number(data.totalDocs) || 0,
            checkedAt: data.checkedAt || '',
            triggeredBy: data.triggeredBy || 'unknown',
          });
        });
        // reverse 成由舊到新（適合 line chart 左→右）
        setHistory(runs.reverse());
      } catch (e) {
        console.warn('[HealthCheckPanel] history fetch failed', e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [historyVersion]);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const { httpsCallable, getFunctions } = await import('firebase/functions');
      const fn = httpsCallable(getFunctions(undefined, 'asia-east1'), 'healthCheckToolUsageStats');
      const r = await fn({});
      setResult(r.data as HealthCheckResult);
      setHistoryVersion((v) => v + 1); // 觸發歷史 re-fetch
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const allGreen = result && result.summary.issueCount === 0;

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🛡️ Schema 健檢
          {result && (
            <span
              style={{
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 10,
                fontWeight: 700,
                color: '#fff',
                background: allGreen ? '#16a34a' : '#dc2626',
              }}
            >
              {allGreen ? '✅ 健康' : `⚠️ ${result.summary.issueCount} 個問題`}
            </span>
          )}
        </CardTitle>
        <CardDescription>
          主動掃 toolUsageStats 偵測 schema 漂移、totalClicks 異常、dailyClicks 格式錯誤。
          配合 monitorToolStatsSchema 被動 LINE 告警形成主被動雙保險。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Button onClick={run} disabled={loading} variant={result ? 'outline' : 'default'}>
            {loading ? '🔍 檢查中...' : result ? '🔄 重新檢查' : '▶️ 跑健檢'}
          </Button>
          <span style={{ fontSize: 11, color: '#6b7280' }}>
            💡 每天 02:00 (Asia/Taipei) 自動跑一次 · errorCount &gt; 0 即時推 LINE 告警
          </span>
        </div>

        {/* v3.6.71 歷史趨勢 mini chart：最近 30 次健檢的 error/warn 走勢 */}
        {history.length >= 2 && <HistoryChart runs={history} />}

        {error && (
          <div
            style={{
              color: '#dc2626',
              marginTop: 12,
              padding: 10,
              background: '#fee2e2',
              borderRadius: 6,
              fontSize: 13,
            }}
          >
            ❌ {error}
          </div>
        )}

        {result && (
          <div style={{ marginTop: 16, fontSize: 13 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: 8,
                marginBottom: 12,
              }}
            >
              <StatBox label="總 doc 數" value={result.summary.totalDocs} />
              <StatBox label="純數字 docId" value={result.summary.numericDocCount} />
              <StatBox label="總 clicks" value={result.summary.totalClicks.toLocaleString()} />
              <StatBox
                label="❌ errors"
                value={result.summary.errorCount}
                accent={result.summary.errorCount > 0 ? '#dc2626' : '#16a34a'}
              />
              <StatBox
                label="⚠️ warns"
                value={result.summary.warnCount}
                accent={result.summary.warnCount > 0 ? '#f59e0b' : '#16a34a'}
              />
            </div>

            {result.issues.length === 0 ? (
              <div
                style={{
                  padding: 12,
                  background: '#dcfce7',
                  borderRadius: 6,
                  color: '#15803d',
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              >
                ✅ 一切正常！沒有任何 schema 漂移或異常值。
              </div>
            ) : (
              <div
                style={{
                  maxHeight: 240,
                  overflowY: 'auto',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  background: '#fafafa',
                }}
              >
                {result.issues.map((i, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '8px 12px',
                      borderBottom: idx === result.issues.length - 1 ? 'none' : '1px solid #e5e7eb',
                      fontSize: 12,
                      display: 'flex',
                      gap: 8,
                    }}
                  >
                    <span style={{ color: i.severity === 'error' ? '#dc2626' : '#f59e0b' }}>
                      {i.severity === 'error' ? '❌' : '⚠️'}
                    </span>
                    <strong style={{ color: '#1f2937' }}>{i.docId}</strong>
                    <span style={{ color: '#4b5563', flex: 1 }}>{i.issue}</span>
                  </div>
                ))}
              </div>
            )}

            <div
              style={{
                fontSize: 11,
                color: '#9ca3af',
                marginTop: 8,
                textAlign: 'right',
              }}
            >
              檢查時間：{new Date(result.summary.checkedAt).toLocaleString('zh-TW')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// v3.6.71 HistoryChart：最近 30 次健檢 errorCount / warnCount 走勢（inline SVG）
function HistoryChart({ runs }: { runs: HealthCheckRun[] }) {
  const W = 360;
  const H = 90;
  const P = 18;
  const innerW = W - P * 2;
  const innerH = H - P * 2;
  const maxY = Math.max(...runs.map((r) => Math.max(r.errorCount, r.warnCount)), 3);
  const xStep = runs.length > 1 ? innerW / (runs.length - 1) : 0;

  const polyline = (key: 'errorCount' | 'warnCount') =>
    runs
      .map((r, i) => {
        const x = P + i * xStep;
        const y = H - P - (r[key] / maxY) * innerH;
        return `${x},${y}`;
      })
      .join(' ');

  return (
    <div
      style={{
        marginTop: 12,
        padding: 12,
        background: '#fafafa',
        border: '1px solid #e5e7eb',
        borderRadius: 6,
      }}
    >
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6, display: 'flex', gap: 12 }}>
        <span>📈 最近 {runs.length} 次健檢趨勢</span>
        <span style={{ color: '#dc2626' }}>━ errors</span>
        <span style={{ color: '#f59e0b' }}>━ warns</span>
      </div>
      <svg width={W} height={H} style={{ display: 'block' }}>
        {/* 0 線 */}
        <line
          x1={P}
          y1={H - P}
          x2={W - P}
          y2={H - P}
          stroke="#e5e7eb"
          strokeWidth={1}
          strokeDasharray="3,3"
        />
        {/* warns 線 */}
        <polyline
          points={polyline('warnCount')}
          stroke="#f59e0b"
          strokeWidth={1.5}
          fill="none"
          opacity={0.7}
        />
        {/* errors 線 */}
        <polyline points={polyline('errorCount')} stroke="#dc2626" strokeWidth={2} fill="none" />
        {/* 點 */}
        {runs.map((r, i) => {
          const x = P + i * xStep;
          const ey = H - P - (r.errorCount / maxY) * innerH;
          return (
            <circle
              key={r.id}
              cx={x}
              cy={ey}
              r={3}
              fill={r.errorCount > 0 ? '#dc2626' : '#16a34a'}
            >
              <title>
                {r.checkedAt.slice(0, 19).replace('T', ' ')} · errors={r.errorCount} · warns={r.warnCount} · {r.triggeredBy}
              </title>
            </circle>
          );
        })}
        {/* y 軸標籤 */}
        <text x={4} y={P + 4} fontSize={9} fill="#9ca3af">
          {maxY}
        </text>
        <text x={4} y={H - P + 3} fontSize={9} fill="#9ca3af">
          0
        </text>
      </svg>
      <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 4, textAlign: 'right' }}>
        hover 圓點看詳情
      </div>
    </div>
  );
}

function StatBox({ label, value, accent }: { label: string; value: number | string; accent?: string }) {
  return (
    <div
      style={{
        padding: '8px 12px',
        background: '#f9fafb',
        borderRadius: 6,
        border: '1px solid #e5e7eb',
      }}
    >
      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: accent || '#1f2937' }}>{value}</div>
    </div>
  );
}
