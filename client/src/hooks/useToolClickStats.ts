/**
 * 工具點擊統計即時訂閱 Hook
 *
 * 設計原則：
 * - 全站只訂閱一次 Firestore `toolUsageStats` 集合
 * - 回傳 Map<toolId, totalClicks> 供多處元件使用（首頁卡片、排行榜等）
 * - 三層 fallback：Firestore → localStorage 快取 → 空 Map
 * - 首次載入快速（從快取讀取），背景再更新真實資料
 */

import { useEffect, useState } from 'react';

const CACHE_KEY = 'localToolsRankings';

export interface ToolClickStats {
  /** 以 toolId 為 key 的點擊數表 */
  clicksById: Map<number, number>;
  /** 是否還在載入（首次訂閱） */
  isLoading: boolean;
}

function loadFromCache(): Map<number, number> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return new Map();
    const parsed = JSON.parse(raw) as Array<{ toolId: number; totalClicks: number }>;
    return new Map(parsed.map((item) => [item.toolId, item.totalClicks]));
  } catch {
    return new Map();
  }
}

export function useToolClickStats(): ToolClickStats {
  // 首次渲染直接用快取，避免先顯示 0 再閃一下才更新
  const [clicksById, setClicksById] = useState<Map<number, number>>(() => loadFromCache());
  const [isLoading, setIsLoading] = useState(clicksById.size === 0);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      try {
        const { db, isFirebaseAvailable } = await import('@/lib/firebase');
        if (!isFirebaseAvailable() || !db) {
          setIsLoading(false);
          return;
        }

        const { collection, onSnapshot } = await import('firebase/firestore');

        unsubscribe = onSnapshot(
          collection(db, 'toolUsageStats'),
          (snapshot) => {
            if (cancelled) return;
            const next = new Map<number, number>();
            const cacheArr: Array<{ toolId: number; totalClicks: number }> = [];
            snapshot.forEach((doc) => {
              const data = doc.data();
              if (typeof data.toolId === 'number' && typeof data.totalClicks === 'number') {
                next.set(data.toolId, data.totalClicks);
                cacheArr.push({ toolId: data.toolId, totalClicks: data.totalClicks });
              }
            });
            setClicksById(next);
            setIsLoading(false);
            // 背景更新本地快取
            try {
              localStorage.setItem(CACHE_KEY, JSON.stringify(cacheArr));
            } catch { /* quota error ignored */ }
          },
          (err) => {
            console.warn('[useToolClickStats] Firestore 監聽失敗:', err);
            setIsLoading(false);
          }
        );
      } catch (err) {
        console.warn('[useToolClickStats] Firebase 初始化失敗:', err);
        setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return { clicksById, isLoading };
}
