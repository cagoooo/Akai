import { useEffect, useMemo, useState } from "react";

// ────────────────────────────────────────────────────────────
export function BackfillLocalAnalyticsBar() {
  const [done, setDone] = useState<boolean>(() => localStorage.getItem('analyticsBackfilled') === 'v1');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // 統計本地有多少筆可上傳
  const localPreview = useMemo(() => {
    const sumMap = (key: string) => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}') as Record<string, number>;
        return Object.values(data).reduce((s, v) => s + (typeof v === 'number' ? v : 0), 0);
      } catch { return 0; }
    };
    return {
      device: sumMap('visitorDeviceStats'),
      referrer: sumMap('visitorReferrerStats'),
      geo: sumMap('visitorGeoStats'),
    };
  }, []);

  const totalLocal = localPreview.device + localPreview.referrer + localPreview.geo;

  const handleBackfill = async (force = false) => {
    if (running) return;
    setRunning(true);
    setResult(null);
    try {
      const { backfillLocalAnalytics } = await import('@/lib/visitorTracker');
      const r = await backfillLocalAnalytics({ force });
      if (!r.ok) {
        setResult(`⚠️ ${r.reason}`);
      } else {
        setResult(
          `✅ 已上傳 ${r.totalAdded} 筆（geo ${r.geoEntries} / device ${r.deviceEntries} / referrer ${r.referrerEntries}）— 重整後台即可看到`
        );
        setDone(true);
      }
    } catch (err) {
      setResult(`❌ 失敗：${(err as Error).message || String(err)}`);
    } finally {
      setRunning(false);
    }
  };

  // 沒有任何本地資料時不顯示
  if (totalLocal === 0 && !result) return null;

  return (
    <div
      style={{
        background: done ? 'rgba(212,244,199,0.7)' : 'rgba(255,242,122,0.55)',
        border: '2px dashed #1a1a1a',
        borderRadius: 10,
        padding: '10px 14px',
        boxShadow: '2px 2px 0 rgba(0,0,0,.15)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 12,
        fontFamily: "'Noto Sans TC', sans-serif",
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 800, color: '#1a1a1a' }}>
        {done ? '✅ 本地歷史已回填' : '🗃️ 偵測到本地歷史尚未上傳'}
      </span>
      {!done && (
        <span style={{ fontSize: 11, color: '#4a3a20' }}>
          這台瀏覽器 localStorage 還有 <b>{totalLocal}</b> 筆 context（geo {localPreview.geo} / device {localPreview.device} / referrer {localPreview.referrer}）。
          按下方按鈕一次性合併到 Firestore，後台就能反映回來。
          <br />
          <span style={{ color: '#7a8c3a', fontSize: 10 }}>
            ⚠️ 註：v3.6.4 之前其他訪客的 context 沒寫過 server，這次只能救「你這台瀏覽器」累積的部分。
          </span>
        </span>
      )}
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
        {!done && (
          <button
            onClick={() => handleBackfill(false)}
            disabled={running}
            style={{
              background: '#ea8a3e',
              color: '#fff',
              border: '2px solid #1a1a1a',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 800,
              cursor: running ? 'wait' : 'pointer',
              boxShadow: '2px 2px 0 rgba(0,0,0,.25)',
            }}
          >
            {running ? '上傳中…' : '📥 上傳本地歷史到 Firestore'}
          </button>
        )}
        {done && (
          <button
            onClick={() => {
              if (confirm('確定要強制再跑一次回填嗎？這會把本地數字「再加一次」到 Firestore，可能造成重複計算。')) {
                handleBackfill(true);
              }
            }}
            disabled={running}
            style={{
              background: '#fff',
              color: '#1a1a1a',
              border: '1.5px dashed #1a1a1a',
              borderRadius: 8,
              padding: '4px 10px',
              fontSize: 11,
              fontWeight: 700,
              cursor: running ? 'wait' : 'pointer',
            }}
          >
            🔁 強制重跑
          </button>
        )}
      </div>
      {result && (
        <div style={{ width: '100%', fontSize: 11, color: '#4a3a20', marginTop: 4 }}>
          {result}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 📦 核心頂層資料快照／合併還原面板（admin 才看得到）
// 由 dailySnapshot Cloud Function 每天 03:00 自動建立
// ────────────────────────────────────────────────────────────
export function SnapshotManagementPanel() {
  const [snapshots, setSnapshots] = useState<Array<{
    id: string;
    sizes: Record<string, number>;
    capturedAt: string | null;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // 訂閱 analyticsSnapshots 集合（admin 才有讀取權限）
  useEffect(() => {
    let unsub: (() => void) | undefined;
    let cancelled = false;
    (async () => {
      try {
        const { db, isFirebaseAvailable } = await import('@/lib/firebase');
        if (!isFirebaseAvailable() || !db) {
          setLoading(false);
          return;
        }
        const { collection, onSnapshot, query, orderBy, limit } = await import('firebase/firestore');
        unsub = onSnapshot(
          query(collection(db, 'analyticsSnapshots'), orderBy('__name__', 'desc'), limit(30)),
          (snap) => {
            if (cancelled) return;
            const arr: typeof snapshots = [];
            snap.forEach((doc) => {
              const d = doc.data() as any;
              arr.push({
                id: doc.id,
                sizes: d.sizes || {},
                capturedAt: d.capturedAt?.toDate?.()?.toLocaleString('zh-TW') || null,
              });
            });
            setSnapshots(arr);
            setLoading(false);
          },
          (err) => {
            console.warn('[SnapshotPanel] 讀取失敗（可能你不是 admin）:', err);
            setLoading(false);
          }
        );
      } catch (err) {
        console.warn('[SnapshotPanel] 初始化失敗:', err);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      if (unsub) unsub();
    };
  }, []);

  const handleRestore = async (date: string, dryRun: boolean) => {
    if (restoring) return;
    if (!dryRun && !confirm(
      `⚠️ 確定要從 ${date} 快照做「合併還原」嗎？\n\n` +
      `這會覆寫／建立快照內的 visitorStats / analytics / toolUsageStats / toolRatings 頂層文件。\n` +
      `快照以外的文件不會刪除，Web Vitals 等子集合也不在還原範圍。\n\n` +
      `若只是要預演，請按取消，改按「🧪 預演」。`
    )) {
      return;
    }
    setRestoring(true);
    setMessage(null);
    try {
      const { httpsCallable, getFunctions } = await import('firebase/functions');
      const firebaseApp = (await import('@/lib/firebase')).default;
      if (!firebaseApp) throw new Error('Firebase app 未初始化');
      const functions = getFunctions(firebaseApp);
      const fn = httpsCallable(functions, 'restoreFromSnapshot');
      const res: any = await fn({ date, dryRun });
      setMessage(`${dryRun ? '🧪 預演' : '✅ 還原'}成功：${res.data?.message || ''}`);
    } catch (err: any) {
      setMessage(`❌ 失敗：${err.message || String(err)}`);
    } finally {
      setRestoring(false);
    }
  };

  // 不是 admin 時不顯示（snapshots 永遠空陣列、且 loading 完）
  if (!loading && snapshots.length === 0 && !message) return null;

  return (
    <div
      style={{
        background: 'rgba(255,255,255,.85)',
        border: '2px solid #1a1a1a',
        borderRadius: 10,
        padding: '14px 16px',
        boxShadow: '3px 3px 0 rgba(0,0,0,.18)',
        fontFamily: "'Noto Sans TC', sans-serif",
      }}
    >
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
        <span style={{ fontSize: 14, fontWeight: 800 }}>📦 核心資料每日快照</span>
          <span style={{
            fontSize: 11,
            color: '#7a8c3a',
            background: '#f5f0d4',
            padding: '2px 8px',
            borderRadius: 10,
            border: '1.5px solid #7a8c3a',
            fontWeight: 700,
          }}>
            {snapshots.length} 份（最多保留 90 天）
          </span>
        </div>
        <span style={{ fontSize: 11, color: '#666' }}>
          每天 03:00 自動備份頂層文件｜提供合併還原，非完整時間點回滾
        </span>
      </div>

      {loading ? (
        <div style={{ fontSize: 12, color: '#666' }}>載入中…</div>
      ) : snapshots.length === 0 ? (
        <div style={{ fontSize: 12, color: '#666' }}>
          暫無快照（部署後第一份會在隔天 03:00 建立；不含子集合）
        </div>
      ) : (
        <div style={{ maxHeight: 200, overflowY: 'auto' }}>
          <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px dashed #1a1a1a' }}>
                <th style={{ textAlign: 'left', padding: '4px 6px' }}>日期</th>
                <th style={{ textAlign: 'right', padding: '4px 6px' }}>visitor</th>
                <th style={{ textAlign: 'right', padding: '4px 6px' }}>analytics</th>
                <th style={{ textAlign: 'right', padding: '4px 6px' }}>tools</th>
                <th style={{ textAlign: 'right', padding: '4px 6px' }}>ratings</th>
                <th style={{ textAlign: 'center', padding: '4px 6px' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {snapshots.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px dotted #ccc' }}>
                  <td style={{ padding: '4px 6px', fontWeight: 700 }}>{s.id}</td>
                  <td style={{ padding: '4px 6px', textAlign: 'right' }}>{s.sizes.visitorStats ?? '-'}</td>
                  <td style={{ padding: '4px 6px', textAlign: 'right' }}>{s.sizes.analytics ?? '-'}</td>
                  <td style={{ padding: '4px 6px', textAlign: 'right' }}>{s.sizes.toolUsageStats ?? '-'}</td>
                  <td style={{ padding: '4px 6px', textAlign: 'right' }}>{s.sizes.toolRatings ?? '-'}</td>
                  <td style={{ padding: '4px 6px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleRestore(s.id, true)}
                      disabled={restoring}
                      style={{
                        padding: '2px 6px',
                        fontSize: 10,
                        marginRight: 4,
                        border: '1px solid #1a1a1a',
                        borderRadius: 4,
                        background: '#fff',
                        cursor: restoring ? 'wait' : 'pointer',
                      }}
                    >
                      🧪 預演
                    </button>
                    <button
                      onClick={() => handleRestore(s.id, false)}
                      disabled={restoring}
                      style={{
                        padding: '2px 6px',
                        fontSize: 10,
                        border: '1px solid #c7302a',
                        borderRadius: 4,
                        background: '#fff',
                        color: '#c7302a',
                        fontWeight: 700,
                        cursor: restoring ? 'wait' : 'pointer',
                      }}
                    >
                      ↩ 合併還原
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {message && (
        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            padding: '6px 10px',
            background: message.startsWith('❌') ? '#ffe4e4' : '#d4f4c7',
            border: '1px solid #1a1a1a',
            borderRadius: 6,
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}
