/**
 * useRecentTools - 最近使用工具（v3.6.8 跨裝置同步強化）
 *
 * 設計：
 * - localStorage：永遠寫入（立即生效，離線可用）
 * - Firestore `userRecentTools/{uid}`：當有 Firebase user（含匿名）時雙寫
 * - onSnapshot：即時同步另一裝置的修改
 * - 保留最近 5 個（合併時去重保序，雲端優先）
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { isFirebaseAvailable } from '@/lib/firebase';

const RECENT_KEY = 'akai-recent-tools';
const MAX_RECENT = 5;

function loadFromLocalStorage(): number[] {
    try {
        const stored = localStorage.getItem(RECENT_KEY);
        if (!stored) return [];
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'number').slice(0, MAX_RECENT) : [];
    } catch (e) {
        console.error('Failed to load recent tools:', e);
        return [];
    }
}

function saveToLocalStorage(recent: number[]): void {
    try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
    } catch (e) {
        console.error('Failed to save recent tools:', e);
    }
}

async function loadFromFirestore(uid: string): Promise<number[] | null> {
    try {
        const { db } = await import('@/lib/firebase');
        if (!db) return null;
        const { doc, getDoc } = await import('firebase/firestore');
        const snap = await getDoc(doc(db, 'userRecentTools', uid));
        if (snap.exists()) {
            const data = snap.data();
            return Array.isArray(data.toolIds)
                ? data.toolIds.filter((x) => typeof x === 'number').slice(0, MAX_RECENT)
                : [];
        }
        return [];
    } catch (e) {
        console.warn('[useRecentTools] Firestore load 失敗:', e);
        return null;
    }
}

async function saveToFirestore(uid: string, recent: number[]): Promise<void> {
    try {
        const { db } = await import('@/lib/firebase');
        if (!db) return;
        const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
        await setDoc(
            doc(db, 'userRecentTools', uid),
            { toolIds: recent, updatedAt: serverTimestamp() },
            { merge: true }
        );
    } catch (e) {
        console.warn('[useRecentTools] Firestore save 失敗:', e);
    }
}

/** 合併：雲端在前、本地在後，去重，限制長度 */
function mergeRecent(cloud: number[], local: number[]): number[] {
    const seen = new Set<number>();
    const out: number[] = [];
    for (const id of [...cloud, ...local]) {
        if (!seen.has(id)) {
            seen.add(id);
            out.push(id);
            if (out.length >= MAX_RECENT) break;
        }
    }
    return out;
}

export function useRecentTools() {
    const [recentIds, setRecentIds] = useState<number[]>(() => loadFromLocalStorage());
    const { user } = useAuth();

    const skipNextSnapshotRef = useRef(false);
    const hasMergedRef = useRef<string | null>(null);
    const uidRef = useRef<string | null>(null);

    useEffect(() => {
        const newUid = user?.uid ?? null;
        if (newUid !== uidRef.current) {
            hasMergedRef.current = null;
        }
        uidRef.current = newUid;
    }, [user?.uid]);

    // 雲端訂閱：onSnapshot 即時同步
    useEffect(() => {
        if (!user || !isFirebaseAvailable()) return;
        const uid = user.uid;
        let unsub: (() => void) | undefined;
        let cancelled = false;

        (async () => {
            // 第一次合併
            if (hasMergedRef.current !== uid) {
                try {
                    const cloud = await loadFromFirestore(uid);
                    if (cancelled || uidRef.current !== uid) return;
                    const local = loadFromLocalStorage();
                    const merged = mergeRecent(cloud || [], local);
                    setRecentIds(merged);
                    saveToLocalStorage(merged);
                    skipNextSnapshotRef.current = true;
                    if ((cloud?.length || 0) !== merged.length) {
                        await saveToFirestore(uid, merged);
                    }
                    hasMergedRef.current = uid;
                } catch { /* ignore */ }
            }

            // 持續訂閱
            try {
                const { db } = await import('@/lib/firebase');
                if (!db) return;
                const { doc, onSnapshot } = await import('firebase/firestore');
                unsub = onSnapshot(
                    doc(db, 'userRecentTools', uid),
                    (snap) => {
                        if (cancelled) return;
                        if (skipNextSnapshotRef.current) {
                            skipNextSnapshotRef.current = false;
                            return;
                        }
                        if (snap.exists()) {
                            const data = snap.data();
                            const cloudList = Array.isArray(data.toolIds)
                                ? data.toolIds.filter((x) => typeof x === 'number').slice(0, MAX_RECENT)
                                : [];
                            setRecentIds((prev) => {
                                const same =
                                    prev.length === cloudList.length &&
                                    prev.every((id, i) => id === cloudList[i]);
                                if (same) return prev;
                                saveToLocalStorage(cloudList);
                                return cloudList;
                            });
                        }
                    },
                    (err) => console.warn('[useRecentTools] onSnapshot 失敗:', err)
                );
            } catch (err) {
                console.warn('[useRecentTools] 訂閱失敗:', err);
            }
        })();

        return () => {
            cancelled = true;
            if (unsub) unsub();
        };
    }, [user?.uid]);

    // 新增到最近使用
    const addToRecent = useCallback(
        (toolId: number) => {
            setRecentIds((prev) => {
                const filtered = prev.filter((id) => id !== toolId);
                const newRecent = [toolId, ...filtered].slice(0, MAX_RECENT);
                saveToLocalStorage(newRecent);
                if (user && isFirebaseAvailable()) {
                    skipNextSnapshotRef.current = true;
                    saveToFirestore(user.uid, newRecent).catch(() => { /* logged */ });
                }
                return newRecent;
            });
        },
        [user]
    );

    // 清除歷史
    const clearRecent = useCallback(() => {
        setRecentIds([]);
        try { localStorage.removeItem(RECENT_KEY); } catch { /* ignore */ }
        if (user && isFirebaseAvailable()) {
            skipNextSnapshotRef.current = true;
            saveToFirestore(user.uid, []).catch(() => { /* logged */ });
        }
    }, [user]);

    return {
        recentIds,
        addToRecent,
        clearRecent,
        hasRecent: recentIds.length > 0,
    };
}
