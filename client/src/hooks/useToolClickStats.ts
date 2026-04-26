/**
 * 工具點擊統計即時訂閱 Hook
 *
 * 設計原則：
 * - 全站只訂閱一次 Firestore `toolUsageStats` 集合
 * - 回傳 Map<toolId, totalClicks> 供多處元件使用（首頁卡片、排行榜等）
 * - 三層 fallback：Firestore → localStorage 快取 → 空 Map
 * - 首次載入快速（從快取讀取），背景再更新真實資料
 *
 * v3.6.3 新增：7 日點擊增量（deltas7d）
 *   - 每天保留一份每工具的累計點擊快照
 *   - 以「今天累計 − 7 天前的累計」算出近 7 日真實點擊增量
 *   - 用於排行榜「🔥 急上升」徽章與儀表板週成長圖
 */

import { useEffect, useMemo, useState } from 'react';

const CACHE_KEY = 'localToolsRankings';
const SNAPSHOTS_KEY = 'toolStatsSnapshots';
const KEEP_DAYS = 8; // 今天 + 7 天前，共 8 個日期足以算出 7 日 delta

interface DailySnapshot {
  /** 'YYYY-MM-DD' 本地日期 */
  date: string;
  /** toolId → totalClicks（當日結束時的累計值） */
  clicks: Record<string, number>;
}

export interface ToolClickStats {
  /** 以 toolId 為 key 的當前累計點擊數 */
  clicksById: Map<number, number>;
  /** 以 toolId 為 key 的「最近 7 日新增點擊」 */
  deltas7d: Map<number, number>;
  /**
   * 以 toolId 為 key 的每日點擊細分（v3.6.8+）
   * 內層 Record<'YYYY-MM-DD', number> 直接從 Firestore toolUsageStats/{id}.dailyClicks 取得
   * 用途：儀表板日期 picker 連動工具圖表
   */
  dailyClicksById: Map<number, Record<string, number>>;
  /** 是否還在載入（首次訂閱） */
  isLoading: boolean;
  /** 是否已累積 ≥1 日歷史可信賴算 deltas7d */
  hasDeltaHistory: boolean;
}

function todayStr(d = new Date()): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
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

function loadSnapshots(): DailySnapshot[] {
  try {
    const raw = localStorage.getItem(SNAPSHOTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (s): s is DailySnapshot =>
        s && typeof s.date === 'string' && s.clicks && typeof s.clicks === 'object'
    );
  } catch {
    return [];
  }
}

/** 把今天的累計點擊寫入快照陣列（同日覆蓋，並裁掉超過 KEEP_DAYS 的舊紀錄） */
function recordSnapshot(snapshots: DailySnapshot[], current: Map<number, number>): DailySnapshot[] {
  const today = todayStr();
  const clicksObj: Record<string, number> = {};
  current.forEach((v, k) => {
    clicksObj[String(k)] = v;
  });
  const filtered = snapshots.filter((s) => s.date !== today);
  filtered.push({ date: today, clicks: clicksObj });
  // 留下最近 KEEP_DAYS 天
  filtered.sort((a, b) => a.date.localeCompare(b.date));
  return filtered.slice(-KEEP_DAYS);
}

/** 計算每個 toolId 的「過去 7 日新增點擊」 = 今天累計 − 7 天前快照累計（沒有就 0） */
function computeDeltas7d(
  current: Map<number, number>,
  snapshots: DailySnapshot[]
): { deltas: Map<number, number>; hasHistory: boolean } {
  const deltas = new Map<number, number>();
  if (snapshots.length === 0) return { deltas, hasHistory: false };

  // 找出最接近「7 天前」的那份快照（如果不夠久就用最舊的那份）
  const target = new Date();
  target.setDate(target.getDate() - 7);
  const targetStr = todayStr(target);

  // snapshots 已排序：找第一份 date <= targetStr 的，否則用最舊的
  let baseline: DailySnapshot | undefined;
  for (let i = snapshots.length - 1; i >= 0; i--) {
    if (snapshots[i].date <= targetStr) {
      baseline = snapshots[i];
      break;
    }
  }
  if (!baseline) baseline = snapshots[0]; // 歷史不滿 7 天，用最舊那份

  current.forEach((nowClicks, toolId) => {
    const past = baseline!.clicks[String(toolId)] ?? 0;
    const delta = Math.max(0, nowClicks - past);
    deltas.set(toolId, delta);
  });

  // 至少要兩份不同日期的快照才算「真的」有歷史可比
  const distinctDates = new Set(snapshots.map((s) => s.date));
  return { deltas, hasHistory: distinctDates.size >= 2 };
}

export function useToolClickStats(): ToolClickStats {
  // 首次渲染直接用快取，避免先顯示 0 再閃一下才更新
  const [clicksById, setClicksById] = useState<Map<number, number>>(() => loadFromCache());
  const [dailyClicksById, setDailyClicksById] = useState<Map<number, Record<string, number>>>(
    () => new Map()
  );
  const [snapshots, setSnapshots] = useState<DailySnapshot[]>(() => loadSnapshots());
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
            const nextDaily = new Map<number, Record<string, number>>();
            const cacheArr: Array<{ toolId: number; totalClicks: number }> = [];
            snapshot.forEach((doc) => {
              const data = doc.data();
              if (typeof data.toolId === 'number' && typeof data.totalClicks === 'number') {
                next.set(data.toolId, data.totalClicks);
                cacheArr.push({ toolId: data.toolId, totalClicks: data.totalClicks });
                // 解析 dailyClicks（若存在）
                if (data.dailyClicks && typeof data.dailyClicks === 'object') {
                  const validDaily: Record<string, number> = {};
                  for (const [k, v] of Object.entries(data.dailyClicks)) {
                    if (/^\d{4}-\d{2}-\d{2}$/.test(k) && typeof v === 'number' && v > 0) {
                      validDaily[k] = v;
                    }
                  }
                  if (Object.keys(validDaily).length > 0) {
                    nextDaily.set(data.toolId, validDaily);
                  }
                }
              }
            });
            setClicksById(next);
            setDailyClicksById(nextDaily);
            setIsLoading(false);
            // 背景更新本地快取
            try {
              localStorage.setItem(CACHE_KEY, JSON.stringify(cacheArr));
            } catch {
              /* quota error ignored */
            }
            // 背景寫入今日快照（用於計算 7 日 delta）
            try {
              setSnapshots((prev) => {
                const updated = recordSnapshot(prev, next);
                localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(updated));
                return updated;
              });
            } catch {
              /* quota error ignored */
            }
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

  const { deltas7d, hasDeltaHistory } = useMemo(
    () => {
      const { deltas, hasHistory } = computeDeltas7d(clicksById, snapshots);
      return { deltas7d: deltas, hasDeltaHistory: hasHistory };
    },
    [clicksById, snapshots]
  );

  return { clicksById, dailyClicksById, deltas7d, isLoading, hasDeltaHistory };
}

/** 工具函式：算某個工具在指定日期區間內的點擊總和 */
export function sumClicksInRange(
  daily: Record<string, number> | undefined,
  fromStr: string,
  toStr: string
): number {
  if (!daily) return 0;
  let sum = 0;
  for (const [date, n] of Object.entries(daily)) {
    if (date >= fromStr && date <= toStr) sum += n;
  }
  return sum;
}
