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

import { useState, useEffect, useCallback, useRef } from 'react';
import type { User } from 'firebase/auth';
import { useAuth } from '@/hooks/useAuth';
import { isFirebaseAvailable } from '@/lib/firebase';

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
async function loadFromFirestore(uid: string): Promise<number[] | null> {
    try {
        const { db } = await import('@/lib/firebase');
        if (!db) return null;
        const { doc, getDoc } = await import('firebase/firestore');
        const snap = await getDoc(doc(db, 'userFavorites', uid));
        if (snap.exists()) {
            const data = snap.data();
            return Array.isArray(data.toolIds) ? data.toolIds.filter((x) => typeof x === 'number') : [];
        }
        return [];
    } catch (e) {
        console.warn('[useFavorites] Firestore load 失敗:', e);
        return null;
    }
}

async function saveToFirestore(uid: string, toolIds: number[]): Promise<void> {
    try {
        const { db } = await import('@/lib/firebase');
        if (!db) return;
        const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
        await setDoc(
            doc(db, 'userFavorites', uid),
            { toolIds, updatedAt: serverTimestamp() },
            { merge: true }
        );
    } catch (e) {
        console.warn('[useFavorites] Firestore save 失敗:', e);
    }
}

function mergeFavorites(a: number[], b: number[]): number[] {
    return Array.from(new Set([...a, ...b]));
}

// ── Hook ───────────────────────────────────────────────────
export function useFavorites() {
    const [favorites, setFavorites] = useState<number[]>(() => loadFromLocalStorage());
    const [syncing, setSyncing] = useState(false);
    const { user } = useAuth();
    // 用「任何登入身份」（含匿名）來決定是否雲端同步
    const cloudUser: User | null = user;

    // 防止 setSnapshot 寫入時又觸發自己（onSnapshot 收到自己剛寫的 → setFavorites → toggleFavorite 連鎖）
    const skipNextSnapshotRef = useRef(false);
    const hasMergedRef = useRef<string | null>(null); // 記住已合併過的 uid
    const uidRef = useRef<string | null>(null);

    // 當 user 切換時重設 merge 狀態
    useEffect(() => {
        const newUid = cloudUser?.uid ?? null;
        if (newUid !== uidRef.current) {
            hasMergedRef.current = null;
        }
        uidRef.current = newUid;
    }, [cloudUser?.uid]);

    // 雲端訂閱：onSnapshot 即時同步（含跨裝置 / 跨 tab）
    useEffect(() => {
        if (!cloudUser || !isFirebaseAvailable()) return;
        const uid = cloudUser.uid;
        let unsub: (() => void) | undefined;
        let cancelled = false;

        (async () => {
            // 第一次合併：local + cloud → 雙寫
            if (hasMergedRef.current !== uid) {
                setSyncing(true);
                try {
                    const cloud = await loadFromFirestore(uid);
                    if (cancelled || uidRef.current !== uid) return;
                    const local = loadFromLocalStorage();
                    const merged = mergeFavorites(local, cloud || []);
                    setFavorites(merged);
                    saveToLocalStorage(merged);
                    skipNextSnapshotRef.current = true;
                    if ((cloud?.length || 0) !== merged.length) {
                        await saveToFirestore(uid, merged);
                    }
                    hasMergedRef.current = uid;
                } finally {
                    if (!cancelled) setSyncing(false);
                }
            }

            // 持續訂閱
            try {
                const { db } = await import('@/lib/firebase');
                if (!db) return;
                const { doc, onSnapshot } = await import('firebase/firestore');
                unsub = onSnapshot(
                    doc(db, 'userFavorites', uid),
                    (snap) => {
                        if (cancelled) return;
                        if (skipNextSnapshotRef.current) {
                            skipNextSnapshotRef.current = false;
                            return;
                        }
                        if (snap.exists()) {
                            const data = snap.data();
                            const cloudList = Array.isArray(data.toolIds)
                                ? data.toolIds.filter((x) => typeof x === 'number')
                                : [];
                            setFavorites((prev) => {
                                // 雲端新版本若不同就採用（被另一裝置改了）
                                const sameLength = prev.length === cloudList.length;
                                const sameContent = sameLength && prev.every((id, i) => id === cloudList[i]);
                                if (sameContent) return prev;
                                saveToLocalStorage(cloudList);
                                return cloudList;
                            });
                        }
                    },
                    (err) => console.warn('[useFavorites] onSnapshot 失敗:', err)
                );
            } catch (err) {
                console.warn('[useFavorites] 訂閱失敗:', err);
            }
        })();

        return () => {
            cancelled = true;
            if (unsub) unsub();
        };
    }, [cloudUser?.uid]);

    // 切換單一收藏
    const toggleFavorite = useCallback(
        (toolId: number) => {
            setFavorites((prev) => {
                const newFavorites = prev.includes(toolId)
                    ? prev.filter((id) => id !== toolId)
                    : [...prev, toolId];
                saveToLocalStorage(newFavorites);
                if (cloudUser && isFirebaseAvailable()) {
                    skipNextSnapshotRef.current = true; // 自己剛寫的 onSnapshot 不必再 setState
                    saveToFirestore(cloudUser.uid, newFavorites).catch(() => { /* logged */ });
                }
                return newFavorites;
            });
        },
        [cloudUser]
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
