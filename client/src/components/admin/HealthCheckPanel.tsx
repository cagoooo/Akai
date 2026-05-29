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
import { useState } from 'react';
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

export function HealthCheckPanel() {
  const [result, setResult] = useState<HealthCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const { httpsCallable, getFunctions } = await import('firebase/functions');
      const fn = httpsCallable(getFunctions(undefined, 'asia-east1'), 'healthCheckToolUsageStats');
      const r = await fn({});
      setResult(r.data as HealthCheckResult);
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
        <Button onClick={run} disabled={loading} variant={result ? 'outline' : 'default'}>
          {loading ? '🔍 檢查中...' : result ? '🔄 重新檢查' : '▶️ 跑健檢'}
        </Button>

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
