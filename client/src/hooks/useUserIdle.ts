import { useEffect, useRef, useState } from 'react';

/** 算「還在忙」的互動訊號；passive 監聽，不影響捲動效能 */
const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'scroll', 'touchstart', 'input'];

/**
 * 使用者是否已經閒置超過 idleMs（P0-3）。
 *
 * 用途：自動更新只在「使用者沒有正在操作」時才套用 ——
 * 讀長文讀到一半、正在點選單、正在打字的當下把頁面重整掉，
 * 比晚幾秒更新糟糕得多。
 *
 * 分頁切到背景視為閒置（人不在畫面前，正是最無感的更新時機）。
 */
export function useUserIdle(idleMs: number): boolean {
    const [isIdle, setIsIdle] = useState(false);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        const clearTimer = () => {
            if (timerRef.current !== null) {
                window.clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };

        const startTimer = () => {
            clearTimer();
            timerRef.current = window.setTimeout(() => setIsIdle(true), idleMs);
        };

        const markActive = () => {
            setIsIdle(false);
            startTimer();
        };

        const handleVisibility = () => {
            if (document.hidden) {
                clearTimer();
                setIsIdle(true);
            } else {
                markActive();
            }
        };

        // 進場先當作剛剛有動作，倒數從現在開始算
        if (document.hidden) setIsIdle(true); else startTimer();

        ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, markActive, { passive: true }));
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            clearTimer();
            ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, markActive));
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [idleMs]);

    return isIdle;
}
