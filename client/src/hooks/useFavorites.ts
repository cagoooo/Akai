import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { isFirebaseAvailable } from '@/lib/firebase';

const FAVORITES_KEY = 'akai-favorites';

// --- LocalStorage helpers ---

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

// --- Firestore helpers (dynamic import to avoid bundle bloat) ---

async function loadFromFirestore(uid: string): Promise<number[] | null> {
    try {
        const { db } = await import('@/lib/firebase');
        if (!db) return null;
        const { doc, getDoc } = await import('firebase/firestore');
        const snap = await getDoc(doc(db, 'userFavorites', uid));
        if (snap.exists()) {
            const data = snap.data();
            return Array.isArray(data.toolIds) ? data.toolIds : [];
        }
        return [];
    } catch (e) {
        console.error('Failed to load favorites from Firestore:', e);
        return null;
    }
}

async function saveToFirestore(uid: string, toolIds: number[]): Promise<void> {
    try {
        const { db } = await import('@/lib/firebase');
        if (!db) return;
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'userFavorites', uid), { toolIds });
    } catch (e) {
        console.error('Failed to save favorites to Firestore:', e);
    }
}

// --- Union merge (deduplicated) ---

function mergeFavorites(a: number[], b: number[]): number[] {
    return Array.from(new Set([...a, ...b]));
}

// --- Hook ---

export function useFavorites() {
    const [favorites, setFavorites] = useState<number[]>([]);
    const [syncing, setSyncing] = useState(false);
    const { user, isAuthenticated } = useAuth();

    // Track whether the initial cloud merge has completed so we don't
    // re-run it on every render or on toggling a favorite.
    const hasMergedRef = useRef(false);
    // Keep a ref to the latest uid so async callbacks can check staleness.
    const uidRef = useRef<string | null>(null);

    // Keep uidRef in sync and reset merge flag when user changes.
    useEffect(() => {
        const newUid = user?.uid ?? null;
        if (newUid !== uidRef.current) {
            hasMergedRef.current = false;
        }
        uidRef.current = newUid;
    }, [user]);

    // --- Initialise / merge on mount (or when auth state changes) ---
    useEffect(() => {
        const localFavorites = loadFromLocalStorage();

        // Case 1: not authenticated -- just use LocalStorage.
        if (!isAuthenticated || !user) {
            setFavorites(localFavorites);
            return;
        }

        // Case 2: authenticated -- merge LocalStorage + Firestore.
        if (hasMergedRef.current) {
            // Already merged for this user; nothing to do.
            return;
        }

        if (!isFirebaseAvailable()) {
            // Firebase unavailable -- graceful degradation.
            setFavorites(localFavorites);
            return;
        }

        const uid = user.uid;
        let cancelled = false;

        (async () => {
            setSyncing(true);
            try {
                const cloudFavorites = await loadFromFirestore(uid);

                // Check if the user changed while we were fetching.
                if (cancelled || uidRef.current !== uid) return;

                if (cloudFavorites === null) {
                    // Firestore failed -- fall back to local only.
                    setFavorites(localFavorites);
                    return;
                }

                const merged = mergeFavorites(localFavorites, cloudFavorites);

                setFavorites(merged);
                saveToLocalStorage(merged);
                await saveToFirestore(uid, merged);

                if (!cancelled && uidRef.current === uid) {
                    hasMergedRef.current = true;
                }
            } finally {
                if (!cancelled) {
                    setSyncing(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [isAuthenticated, user]);

    // --- Toggle a single favorite ---
    const toggleFavorite = useCallback(
        (toolId: number) => {
            setFavorites((prev) => {
                const newFavorites = prev.includes(toolId)
                    ? prev.filter((id) => id !== toolId)
                    : [...prev, toolId];

                // Always persist to LocalStorage.
                saveToLocalStorage(newFavorites);

                // If authenticated, also persist to Firestore (fire-and-forget).
                if (isAuthenticated && user && isFirebaseAvailable()) {
                    saveToFirestore(user.uid, newFavorites).catch(() => {
                        // Already logged inside saveToFirestore.
                    });
                }

                return newFavorites;
            });
        },
        [isAuthenticated, user],
    );

    // --- Derived helpers ---
    const isFavorite = useCallback(
        (toolId: number) => favorites.includes(toolId),
        [favorites],
    );

    return {
        favorites,
        toggleFavorite,
        isFavorite,
        favoritesCount: favorites.length,
        syncing,
    };
}
