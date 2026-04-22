import { useEffect, useMemo, useState } from 'react';
import { Tape } from '@/components/primitives/Tape';
import { Pin } from '@/components/primitives/Pin';
import { tokens } from '@/design/tokens';
import { getToolEmoji } from './toolAdapter';
import type { EducationalTool } from '@/lib/data';

interface Props {
  tools: EducationalTool[];
}

interface FirestoreRanking {
  toolId: number;
  totalClicks: number;
}

/**
 * 🏆 本週 TOP 5 便利貼排行榜
 * 串接 Firestore `toolUsageStats` 集合即時資料（與既有 ToolRankings.tsx 相同來源）
 * 本地 fallback：讀取 localStorage cache，再退至 tools.totalClicks
 */
export function BulletinLeaderboard({ tools }: Props) {
  const [firestoreRankings, setFirestoreRankings] = useState<FirestoreRanking[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Firestore 即時訂閱
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    (async () => {
      try {
        const { db, isFirebaseAvailable } = await import('@/lib/firebase');
        const { collection, onSnapshot, orderBy, query, limit } = await import(
          'firebase/firestore'
        );

        if (isFirebaseAvailable() && db) {
          unsubscribe = onSnapshot(
            query(collection(db, 'toolUsageStats'), orderBy('totalClicks', 'desc'), limit(10)),
            (snapshot) => {
              const stats: FirestoreRanking[] = [];
              snapshot.forEach((doc) => {
                const data = doc.data();
                if (typeof data.toolId === 'number' && typeof data.totalClicks === 'number') {
                  stats.push({ toolId: data.toolId, totalClicks: data.totalClicks });
                }
              });
              setFirestoreRankings(stats);
              setIsLoading(false);
              // 本地快取供離線使用
              try {
                localStorage.setItem('localToolsRankings', JSON.stringify(stats));
              } catch { /* ignore quota error */ }
            },
            (err) => {
              console.warn('[BulletinLeaderboard] Firestore 監聽失敗，改用本地快取:', err);
              loadFromCache();
            }
          );
          return;
        }

        loadFromCache();
      } catch (err) {
        console.warn('[BulletinLeaderboard] Firebase 初始化失敗:', err);
        loadFromCache();
      }
    })();

    function loadFromCache() {
      try {
        const cached = localStorage.getItem('localToolsRankings');
        if (cached) {
          setFirestoreRankings(JSON.parse(cached));
        } else {
          setFirestoreRankings([]);
        }
      } catch {
        setFirestoreRankings([]);
      }
      setIsLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // 合併 Firestore 排行 + 工具 metadata
  const top5 = useMemo(() => {
    if (!firestoreRankings || firestoreRankings.length === 0) {
      // fallback 到 tools.totalClicks（若靜態資料有 seed 值）
      return [...tools]
        .filter((t) => (t.totalClicks ?? 0) > 0)
        .sort((a, b) => (b.totalClicks ?? 0) - (a.totalClicks ?? 0))
        .slice(0, 5)
        .map((t) => ({ tool: t, clicks: t.totalClicks ?? 0 }));
    }

    const merged: Array<{ tool: EducationalTool; clicks: number }> = [];
    for (const ranking of firestoreRankings) {
      const tool = tools.find((t) => t.id === ranking.toolId);
      if (tool) merged.push({ tool, clicks: ranking.totalClicks });
    }
    return merged.slice(0, 5);
  }, [firestoreRankings, tools]);

  const colors = [
    tokens.note.yellow,
    tokens.note.blue,
    tokens.note.pink,
    tokens.note.green,
    tokens.note.orange,
  ];
  const tilts = [-2, 1.5, -1, 2.5, -1.5];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Tape color={tokens.note.orange} angle={-2} width={180}>
          <span style={{ fontSize: 14 }}>🏆 本週 TOP 5 · RANKING</span>
        </Tape>
      </div>

      {isLoading ? (
        <div
          style={{
            background: 'rgba(255,255,255,.9)',
            border: '2px dashed #8b7356',
            borderRadius: 12,
            padding: 20,
            textAlign: 'center',
            color: tokens.muted,
            fontSize: 13,
            fontStyle: 'italic',
          }}
        >
          📡 正在連線到公佈欄資料庫…
        </div>
      ) : top5.length === 0 ? (
        <div
          style={{
            background: 'rgba(255,255,255,.9)',
            border: '2px dashed #8b7356',
            borderRadius: 12,
            padding: 20,
            textAlign: 'center',
            color: tokens.muted,
            fontSize: 13,
          }}
        >
          還沒有足夠的使用數據 📊<br />
          <span style={{ fontSize: 11, opacity: 0.7 }}>
            多點幾次工具，排行榜就會長出來囉！
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {top5.map(({ tool, clicks }, i) => (
            <a
              key={tool.id}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="sticker-card"
              aria-label={`排名第 ${i + 1} 名：${tool.title}，${clicks} 次點擊`}
              style={{
                background: colors[i],
                padding: '12px 16px',
                borderRadius: 8,
                boxShadow: '0 2px 3px rgba(0,0,0,.12), 3px 3px 0 rgba(0,0,0,.15)',
                transform: `rotate(${tilts[i]}deg)`,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                textDecoration: 'none',
                color: 'inherit',
                cursor: 'pointer',
              }}
            >
              <Pin
                color={tokens.pin[i % tokens.pin.length]}
                size={14}
                style={{ top: -7, left: 14 }}
              />
              <div
                style={{
                  fontFamily: tokens.font.en,
                  fontSize: 22,
                  fontWeight: 900,
                  color: tokens.ink,
                  minWidth: 32,
                  fontStyle: 'italic',
                }}
              >
                #{i + 1}
              </div>
              <div style={{ fontSize: 28 }}>{getToolEmoji(tool)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: tokens.font.tc,
                    fontSize: 14,
                    fontWeight: 700,
                    color: tokens.ink,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tool.title}
                </div>
                <div
                  style={{
                    fontFamily: tokens.font.en,
                    fontSize: 11,
                    color: tokens.muted2,
                    marginTop: 2,
                  }}
                >
                  👆 {clicks.toLocaleString()} clicks
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
