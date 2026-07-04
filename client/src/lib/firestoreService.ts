// Firestore 資料庫服務層
import { db, isFirebaseAvailable } from './firebase';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    getDocs,
    query,
    orderBy,
    limit,
    increment,
    serverTimestamp,
    Timestamp,
    Firestore
} from 'firebase/firestore';

// ==================== 類型定義 ====================

export interface VisitorStats {
    totalVisits: number;
    dailyVisits: Record<string, number>;
    lastVisitAt: Timestamp | null;
}

export interface ToolStats {
    toolId: number;
    totalClicks: number;
    lastUsedAt: Timestamp | null;
    categoryClicks: Record<string, number>;
}

// ==================== 訪客統計 ====================

const VISITOR_STATS_DOC = 'global';
const VISITOR_STATS_COLLECTION = 'visitorStats';

/**
 * 取得訪客統計資料
 */
export async function getVisitorStats(): Promise<VisitorStats> {
    // 如果 Firebase 不可用，返回預設值
    if (!isFirebaseAvailable() || !db) {
        console.warn('Firebase 不可用，使用本地訪客統計');
        return {
            totalVisits: parseInt(localStorage.getItem('localVisitorCount') || '0'),
            dailyVisits: {},
            lastVisitAt: null
        };
    }

    try {
        const docRef = doc(db as Firestore, VISITOR_STATS_COLLECTION, VISITOR_STATS_DOC);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as VisitorStats;
        }

        // 如果不存在，建立初始資料
        const initialStats: VisitorStats = {
            totalVisits: 0,
            dailyVisits: {},
            lastVisitAt: null
        };

        await setDoc(docRef, initialStats);
        return initialStats;
    } catch (error) {
        console.error('取得訪客統計失敗:', error);
        // 返回預設值
        return {
            totalVisits: parseInt(localStorage.getItem('localVisitorCount') || '0'),
            dailyVisits: {},
            lastVisitAt: null
        };
    }
}

/**
 * 增加訪客計數
 */
export async function incrementVisitorCount(): Promise<VisitorStats> {
    // 如果 Firebase 不可用，使用本地計數
    if (!isFirebaseAvailable() || !db) {
        const localCount = parseInt(localStorage.getItem('localVisitorCount') || '0') + 1;
        localStorage.setItem('localVisitorCount', localCount.toString());
        return {
            totalVisits: localCount,
            dailyVisits: {},
            lastVisitAt: null
        };
    }

    try {
        const today = new Date().toISOString().split('T')[0];
        const docRef = doc(db as Firestore, VISITOR_STATS_COLLECTION, VISITOR_STATS_DOC);

        // 單次原子 merge 寫入：不先讀、不整份覆蓋。
        // 2026-07-04 事故：舊寫法「getDoc → 不存在就 setDoc 重建」在 getDoc
        // 誤判不存在時會把 4592 累計整份覆蓋成 1；dailyVisits 全 map
        // read-modify-write 也會在高併發下互吃。increment + 巢狀 merge
        // 兩個問題一次解決，文件不存在時 merge 也會自動建立。
        await setDoc(docRef, {
            totalVisits: increment(1),
            dailyVisits: { [today]: increment(1) },
            lastVisitAt: serverTimestamp()
        }, { merge: true });

        // 回傳樂觀值（呼叫端顯示一律走 onSnapshot，此值僅供 fallback）
        return {
            totalVisits: parseInt(localStorage.getItem('totalVisits') || '0', 10) + 1,
            dailyVisits: {},
            lastVisitAt: Timestamp.now()
        };
    } catch (error) {
        console.error('增加訪客計數失敗:', error);
        // 使用本地備份
        const localCount = parseInt(localStorage.getItem('localVisitorCount') || '0') + 1;
        localStorage.setItem('localVisitorCount', localCount.toString());
        return {
            totalVisits: localCount,
            dailyVisits: {},
            lastVisitAt: null
        };
    }
}

// ==================== 工具使用統計 ====================

const TOOL_STATS_COLLECTION = 'toolUsageStats';

// ── client-side context helpers（提供 sessionId / device 給 Cloud Function event log）─
const SESSION_ID_KEY = 'akai_session_id_v1';
const SESSION_TS_KEY = 'akai_session_id_ts';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 天滾動 session

function getOrCreateSessionId(): string {
    try {
        const existing = localStorage.getItem(SESSION_ID_KEY);
        const tsRaw = localStorage.getItem(SESSION_TS_KEY);
        const ts = tsRaw ? Number(tsRaw) : 0;
        if (existing && ts && Date.now() - ts < SESSION_TTL_MS) {
            return existing;
        }
        // 新 session：用 crypto.randomUUID 若可用，fallback Math.random
        const id =
            typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
                ? crypto.randomUUID()
                : `s_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
        localStorage.setItem(SESSION_ID_KEY, id);
        localStorage.setItem(SESSION_TS_KEY, String(Date.now()));
        return id;
    } catch {
        return 'anon';
    }
}

function detectDevice(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof navigator === 'undefined') return 'desktop';
    const ua = navigator.userAgent || '';
    if (/iPad|Tablet|Nexus 7|Nexus 9|Kindle|PlayBook/i.test(ua)) return 'tablet';
    if (/Mobi|Android.*Mobile|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return 'mobile';
    return 'desktop';
}

/**
 * 追蹤工具使用（v3.6.49+ 改走 Cloud Function 主管道，順便寫 toolClickEvents）
 *
 * 主管道：incrementToolClick callable（後端原子寫 totalClicks + dailyClicks + event log）
 * fallback：Firebase 不可用 / callable 失敗時 → 本地 localStorage 計數
 */
export async function trackToolUsage(toolId: number): Promise<ToolStats> {
    // 收集 client-side context
    const context = {
        toolId,
        referrer: typeof document !== 'undefined' ? (document.referrer || '') : '',
        device: detectDevice(),
        sessionId: getOrCreateSessionId(),
    };

    // 主管道：call Cloud Function
    if (isFirebaseAvailable() && db) {
        try {
            const { getFunctions, httpsCallable } = await import('firebase/functions');
            const functions = getFunctions(undefined, 'asia-east1');
            const callable = httpsCallable<typeof context, { success: boolean; toolId: number }>(
                functions,
                'incrementToolClick'
            );
            await callable(context);
            // 本地 fallback 也順手 +1 給離線排行榜立刻反應（不等回查 doc）
            const localKey = `localToolStats_${toolId}`;
            const localClicks = parseInt(localStorage.getItem(localKey) || '0') + 1;
            localStorage.setItem(localKey, localClicks.toString());
            return {
                toolId,
                totalClicks: localClicks,
                lastUsedAt: Timestamp.now(),
                categoryClicks: {},
            };
        } catch (err) {
            console.warn('[trackToolUsage] callable 失敗，fallback direct write:', err);
            // fallthrough 到 direct write fallback
        }

        // Fallback：callable 失敗時 client direct write totalClicks（沒 event log）
        // ⚠️ docId 必須跟 Cloud Function 用同樣的 String(toolId) 命名 — 否則會產生
        //    "tool_81" vs "81" 雙 doc 漂移，前端 onSnapshot 讀錯邊（歷史踩雷）
        try {
            const docRef = doc(db as Firestore, TOOL_STATS_COLLECTION, String(toolId));
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                await updateDoc(docRef, {
                    totalClicks: increment(1),
                    lastUsedAt: serverTimestamp(),
                });
                const data = docSnap.data() as ToolStats;
                return { ...data, totalClicks: data.totalClicks + 1, lastUsedAt: Timestamp.now() };
            } else {
                const newStats: ToolStats = {
                    toolId,
                    totalClicks: 1,
                    lastUsedAt: Timestamp.now(),
                    categoryClicks: {},
                };
                await setDoc(docRef, { ...newStats, lastUsedAt: serverTimestamp() });
                return newStats;
            }
        } catch (error) {
            console.error('追蹤工具使用失敗 (direct write fallback):', error);
        }
    }

    // 最終 fallback：純本地計數
    const localKey = `localToolStats_${toolId}`;
    const localClicks = parseInt(localStorage.getItem(localKey) || '0') + 1;
    localStorage.setItem(localKey, localClicks.toString());
    return {
        toolId,
        totalClicks: localClicks,
        lastUsedAt: null,
        categoryClicks: {},
    };
}

/**
 * 取得單一工具統計
 */
export async function getToolStats(toolId: number): Promise<ToolStats | null> {
    if (!isFirebaseAvailable() || !db) {
        // 使用本地備份
        const localKey = `localToolStats_${toolId}`;
        const localClicks = parseInt(localStorage.getItem(localKey) || '0');
        if (localClicks > 0) {
            return {
                toolId,
                totalClicks: localClicks,
                lastUsedAt: null,
                categoryClicks: {}
            };
        }
        return null;
    }

    try {
        // 同步 trackToolUsage 改用 String(toolId)（消除 "tool_81" vs "81" 漂移）
        const docRef = doc(db as Firestore, TOOL_STATS_COLLECTION, String(toolId));
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            // ⚠️ 欄位正規化：Cloud Function (incrementToolClick) 寫的是 `lastClickedAt`，
            //    但 ToolStats / 前端 UI 讀的是 `lastUsedAt`，不對齊會導致「最後使用」永遠
            //    顯示「尚無紀錄」。這裡統一 fallback 成 lastUsedAt，讓兩條寫入路徑都對得上。
            const data = docSnap.data() as Partial<ToolStats> & { lastClickedAt?: Timestamp | null };
            return {
                toolId,
                totalClicks: data.totalClicks ?? 0,
                lastUsedAt: data.lastUsedAt ?? data.lastClickedAt ?? null,
                categoryClicks: data.categoryClicks ?? {},
            };
        }
        return null;
    } catch (error) {
        console.error('取得工具統計失敗:', error);
        return null;
    }
}

/**
 * 取得工具排行榜
 */
export async function getToolRankings(limitCount: number = 8): Promise<ToolStats[]> {
    // 如果 Firebase 不可用，返回空陣列
    if (!isFirebaseAvailable() || !db) {
        console.warn('Firebase 不可用，無法取得排行榜');
        return [];
    }

    try {
        const q = query(
            collection(db as Firestore, TOOL_STATS_COLLECTION),
            orderBy('totalClicks', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        const rankings: ToolStats[] = [];

        querySnapshot.forEach((doc) => {
            rankings.push(doc.data() as ToolStats);
        });

        return rankings;
    } catch (error) {
        console.error('取得工具排行榜失敗:', error);
        return [];
    }
}

/**
 * 取得所有工具統計
 */
export async function getAllToolStats(): Promise<ToolStats[]> {
    if (!isFirebaseAvailable() || !db) {
        return [];
    }

    try {
        const q = query(
            collection(db as Firestore, TOOL_STATS_COLLECTION),
            orderBy('totalClicks', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const stats: ToolStats[] = [];

        querySnapshot.forEach((doc) => {
            stats.push(doc.data() as ToolStats);
        });

        return stats;
    } catch (error) {
        console.error('取得所有工具統計失敗:', error);
        return [];
    }
}

// ==================== 錯誤日誌 ====================

const ERROR_LOGS_COLLECTION = 'errorLogs';

interface ErrorLogEntry {
    level: 'error' | 'warn' | 'info';
    message: string;
    stack?: string;
    metadata?: Record<string, unknown>;
    createdAt: Timestamp;
}

/**
 * 記錄錯誤
 */
export async function logError(
    level: 'error' | 'warn' | 'info',
    message: string,
    options?: {
        stack?: string;
        metadata?: Record<string, unknown>;
    }
): Promise<void> {
    if (!isFirebaseAvailable() || !db) {
        console.warn('Firebase 不可用，錯誤僅記錄在控制台:', level, message);
        return;
    }

    try {
        const colRef = collection(db as Firestore, ERROR_LOGS_COLLECTION);
        const logEntry: ErrorLogEntry = {
            level,
            message,
            stack: options?.stack,
            metadata: options?.metadata,
            createdAt: Timestamp.now()
        };

        await setDoc(doc(colRef), {
            ...logEntry,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        // 避免無限迴圈，只在控制台輸出
        console.error('記錄錯誤失敗:', error);
    }
}
