/**
 * useFavorites - 收藏管理（v3.6.8 跨裝置同步強化）
 *
 * 設計：
 * - localStorage：永遠寫入（立即生效，離線可用）
 * - Firestore `userFavorites/{uid}`：當有 Firebase user（含匿名身份）時雙寫
 * - onSnapshot：即時同步另一裝置的修改（換手機切平板都會跟著）
 *
 * 為什麼用 user 而不是 isAuthenticated？
 *   v3.6.4 後 isAuthenticated 不含匿名身份。但收藏本質就是「同一台裝置的人」，
 *   匿名 uid 已穩定（存在 IndexedDB），用它當收藏 owner 完全合理。
 *   登入後 uid 換成 Google uid，收藏會自動從新位置載入（既有設計已支援）。
 */

import { useEffect, useCallback, useSyncExternalStore } from 'react';
import type { User } from 'firebase/auth';
import { useAuth } from '@/hooks/useAuth';
import { isFirebaseAvailable } from '@/lib/firebase';
import { getCurrentUser } from '@/lib/authService';
import { safeDiagnostic } from '@/lib/safeDiagnostic';

const FAVORITES_KEY = 'akai-favorites';

// ── LocalStorage helpers ───────────────────────────────────
function loadFromLocalStorage(): number[] {
    try {
        const stored = localStorage.getItem(FAVORITES_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Failed to load favorites from LocalStorage:', e);
        return [];
    }
}

function saveToLocalStorage(favorites: number[]): void {
    try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (e) {
        console.error('Failed to save favorites to LocalStorage:', e);
    }
}

// ── Firestore helpers ──────────────────────────────────────
// 多分頁時 Firestore 連線由另一個分頁代送；剛換成新的匿名身分時，那個分頁要等跨分頁同步（約 1 秒）
// 才拿到新身分，這段期間讀自己的收藏會被規則擋下（2026-11-03 JAVASCRIPT-REACT-1E：帳號建立 1.2 秒後被拒）。
// 被拒時等身分同步後重讀一次，仍被拒才回報。
const PERMISSION_RETRY_DELAY_MS = 1500;

function isPermissionDenied(e: unknown): boolean {
    return (e as { code?: unknown } | null)?.code === 'permission-denied';
}

async function loadFromFirestore(uid: string, isCurrent: () => boolean, retried = false): Promise<number[] | null> {
    try {
        const { db } = await import('@/lib/firebase');
        if (!db) return null;
        const { doc, getDoc } = await import('firebase/firestore');
        if (!isCurrent()) return null;
        const snap = await getDoc(doc(db, 'userFavorites', uid));
        if (!isCurrent()) return null;
        if (snap.exists()) {
            const data = snap.data();
            return Array.isArray(data.toolIds) ? data.toolIds.filter((x) => typeof x === 'number') : [];
        }
        return [];
    } catch (e) {
        if (!retried && isPermissionDenied(e) && isCurrent()) {
            await new Promise((resolve) => setTimeout(resolve, PERMISSION_RETRY_DELAY_MS));
            if (!isCurrent()) return null;
            return loadFromFirestore(uid, isCurrent, true);
        }
        if (isCurrent()) safeDiagnostic('[useFavorites] Firestore load 失敗:', e);
        return null;
    }
}

async function saveToFirestore(uid: string, toolIds: number[], isCurrent: () => boolean): Promise<void> {
    try {
        const { db } = await import('@/lib/firebase');
        if (!db) return;
        const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
        if (!isCurrent()) return;
        await setDoc(
            doc(db, 'userFavorites', uid),
            { toolIds, updatedAt: serverTimestamp() },
            { merge: true }
        );
    } catch (e) {
        if (isCurrent()) safeDiagnostic('[useFavorites] Firestore save 失敗:', e);
    }
}

function mergeFavorites(a: number[], b: number[]): number[] {
    return Array.from(new Set([...a, ...b]));
}

// ── 全頁共用的收藏狀態 ──────────────────────────────────────
// 首頁每張工具卡片（BulletinToolCard）都呼叫 useFavorites()。原本每個呼叫各自 getDoc＋onSnapshot，
// 首頁有幾張卡片就讀幾次同一份收藏；離線快取壞掉時每張卡片各報一次錯，同一秒幾十筆告警
// （2026-11-21 JAVASCRIPT-REACT-2S：同一位訪客 11:00:28 一秒 40 筆）。
// 改成整頁共用一份狀態與一個雲端訂閱：第一個掛上的元件開始同步，最後一個卸載才停止。
interface FavoritesState {
    favorites: number[];
    syncing: boolean;
}

let sharedState: FavoritesState | null = null;
const stateListeners = new Set<() => void>();

function getSharedState(): FavoritesState {
    if (!sharedState) sharedState = { favorites: loadFromLocalStorage(), syncing: false };
    return sharedState;
}

function setSharedState(patch: Partial<FavoritesState>): void {
    sharedState = { ...getSharedState(), ...patch };
    stateListeners.forEach((listener) => listener());
}

function subscribeSharedState(listener: () => void): () => void {
    stateListeners.add(listener);
    return () => {
        stateListeners.delete(listener);
    };
}

// 雲端同步：同一個 uid 只開一份，用參照計數決定何時停止
let activeSync: { uid: string; refs: number; stop: () => void } | null = null;
// 這次開頁已經和雲端合併過的 uid；換頁讓卡片重新掛上時不必再讀一次
let mergedUid: string | null = null;
// 自己剛寫進雲端的那一次 onSnapshot 不必再更新畫面
let skipNextSnapshot = false;

function startCloudSync(uid: string): () => void {
    let unsub: (() => void) | undefined;
    let cancelled = false;
    const isCurrent = () => !cancelled && getCurrentUser()?.uid === uid;

    (async () => {
        // 第一次合併：local + cloud → 雙寫
        if (mergedUid !== uid) {
            setSharedState({ syncing: true });
            try {
                const cloud = await loadFromFirestore(uid, isCurrent);
                if (!isCurrent()) return;
                // 讀取失敗時保留本機收藏，不把失敗當成空的雲端清單再覆寫。
                if (cloud === null) return;
                const merged = mergeFavorites(loadFromLocalStorage(), cloud);
                setSharedState({ favorites: merged });
                saveToLocalStorage(merged);
                skipNextSnapshot = true;
                if (cloud.length !== merged.length) {
                    await saveToFirestore(uid, merged, isCurrent);
                }
                if (!isCurrent()) return;
                mergedUid = uid;
            } finally {
                if (!cancelled) setSharedState({ syncing: false });
            }
        }

        // 持續訂閱：onSnapshot 即時同步（含跨裝置 / 跨 tab）
        try {
            const { db } = await import('@/lib/firebase');
            if (!db) return;
            const { doc, onSnapshot } = await import('firebase/firestore');
            if (!isCurrent()) return;
            unsub = onSnapshot(
                doc(db, 'userFavorites', uid),
                (snap) => {
                    if (!isCurrent()) return;
                    if (skipNextSnapshot) {
                        skipNextSnapshot = false;
                        return;
                    }
                    if (!snap.exists()) return;
                    const data = snap.data();
                    const cloudList = Array.isArray(data.toolIds)
                        ? data.toolIds.filter((x) => typeof x === 'number')
                        : [];
                    const prev = getSharedState().favorites;
                    // 雲端新版本若不同就採用（被另一裝置改了）
                    const sameContent = prev.length === cloudList.length && prev.every((id, i) => id === cloudList[i]);
                    if (sameContent) return;
                    saveToLocalStorage(cloudList);
                    setSharedState({ favorites: cloudList });
                },
                (err) => {
                    if (isCurrent()) safeDiagnostic('[useFavorites] onSnapshot 失敗:', err);
                }
            );
            // 訂閱建立的同時剛好被停止（例如卸載）就立刻取消
            if (cancelled) unsub();
        } catch (err) {
            if (isCurrent()) safeDiagnostic('[useFavorites] 訂閱失敗:', err);
        }
    })();

    return () => {
        cancelled = true;
        if (unsub) unsub();
    };
}

function acquireCloudSync(uid: string): void {
    if (activeSync?.uid === uid) {
        activeSync.refs += 1;
        return;
    }
    // 換了身分：停掉舊身分的同步，重新開始
    activeSync?.stop();
    skipNextSnapshot = false;
    const holder = { uid, refs: 1, stop: () => {} };
    activeSync = holder;
    holder.stop = startCloudSync(uid);
}

function releaseCloudSync(uid: string): void {
    if (!activeSync || activeSync.uid !== uid) return;
    activeSync.refs -= 1;
    if (activeSync.refs > 0) return;
    activeSync.stop();
    activeSync = null;
}

/** 測試用：清掉全頁共用的狀態（每個測試從頭開始） */
export function resetFavoritesStoreForTests(): void {
    activeSync?.stop();
    activeSync = null;
    mergedUid = null;
    skipNextSnapshot = false;
    sharedState = null;
    stateListeners.clear();
}

// ── Hook ───────────────────────────────────────────────────
export function useFavorites() {
    const { favorites, syncing } = useSyncExternalStore(subscribeSharedState, getSharedState, getSharedState);
    const { user } = useAuth();
    // 用「任何登入身份」（含匿名）來決定是否雲端同步
    const cloudUser: User | null = user;
    const uid = cloudUser?.uid ?? null;

    useEffect(() => {
        if (!uid || !isFirebaseAvailable()) return;
        acquireCloudSync(uid);
        return () => releaseCloudSync(uid);
    }, [uid]);

    // 切換單一收藏
    const toggleFavorite = useCallback(
        (toolId: number) => {
            const prev = getSharedState().favorites;
            const newFavorites = prev.includes(toolId)
                ? prev.filter((id) => id !== toolId)
                : [...prev, toolId];
            setSharedState({ favorites: newFavorites });
            saveToLocalStorage(newFavorites);
            if (uid && isFirebaseAvailable()) {
                skipNextSnapshot = true; // 自己剛寫的 onSnapshot 不必再 setState
                saveToFirestore(uid, newFavorites, () => getCurrentUser()?.uid === uid).catch(() => { /* logged */ });
            }
        },
        [uid]
    );

    const isFavorite = useCallback(
        (toolId: number) => favorites.includes(toolId),
        [favorites]
    );

    return {
        favorites,
        toggleFavorite,
        isFavorite,
        favoritesCount: favorites.length,
        syncing,
    };
}
