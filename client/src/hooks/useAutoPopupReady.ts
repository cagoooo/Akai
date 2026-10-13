import { useEffect, useState } from 'react';

/**
 * 完全沒有互動時，最晚幾毫秒後允許自動彈窗（保底，確保閒置的訪客最終仍看得到引導）。
 * 必須大於 Lighthouse 的觀察期（它會一路等到 45 秒上限，因為首頁有永不結束的即時連線）：
 * 2026-10-13 實測保底 10 秒時，Lighthouse 在第 10 秒看到彈窗，LCP 反而從 7.7 秒變成 10.8 秒。
 */
export const AUTO_POPUP_FALLBACK_MS = 60_000;
/** 訪客互動後，要停手多久才允許彈窗（連續滑動、點擊都會重新計時）。 */
export const AUTO_POPUP_QUIET_MS = 1_500;
/** 訪客正在輸入文字時，每隔多久再檢查一次是否可以彈窗。 */
export const AUTO_POPUP_RETRY_MS = 2_000;

// 只列「使用者主動做的動作」。刻意不含 scroll：頁面自己捲動（還原位置、搜尋後自動捲到結果）也會觸發它。
const INTERACTION_EVENTS = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'touchmove'] as const;
const EDITABLE_SELECTOR = 'input, textarea, select, [contenteditable=""], [contenteditable="true"]';

function isEditableTarget(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(EDITABLE_SELECTOR) !== null;
}

function isTypingNow(): boolean {
  return isEditableTarget(document.activeElement);
}

/**
 * 自動彈出的窗（族群推薦精靈、最新上架展示）要不要現在就開。
 *
 * 為什麼不一進站就開：精靈在第一次渲染就蓋滿畫面，會成為手機版的「最大內容」，
 * 還要在慢手機上做全螢幕模糊，拖慢首次繪製（2026-10-13 本機實驗：LCP 12.4→6.0 秒、首次繪製 7.4→4.9 秒；
 * 較寬鬆網路 7.3→2.9 秒）。改成訪客有互動且停手 {@link AUTO_POPUP_QUIET_MS} 後，
 * 或完全沒互動滿 {@link AUTO_POPUP_FALLBACK_MS}（保底）才回傳 true。
 *
 * 為什麼是「停手後」而不是「按下去的瞬間」：彈窗一開就把焦點搶到關閉按鈕，
 * 訪客按 `/` 想搜尋、剛點了篩選或正在滑動時被蓋住，動作就被打斷（e2e 實測按 `/` 的搜尋框焦點被搶走）。
 * 在輸入框裡的操作不算互動；計時到了若仍在輸入，每 {@link AUTO_POPUP_RETRY_MS} 再檢查一次。
 * 一旦回傳 true 就不會再變回 false。
 */
export function useAutoPopupReady(fallbackMs: number = AUTO_POPUP_FALLBACK_MS): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return undefined;
    let quietTimer: number | undefined;
    let retryTimer: number | undefined;

    const clear = (timer: number | undefined) => {
      if (timer !== undefined) window.clearTimeout(timer);
    };
    const tryReady = () => {
      clear(retryTimer);
      if (isTypingNow()) {
        retryTimer = window.setTimeout(tryReady, AUTO_POPUP_RETRY_MS);
        return;
      }
      setReady(true);
    };
    const onInteraction = (event: Event) => {
      if (isEditableTarget(event.target)) return;
      clear(quietTimer);
      quietTimer = window.setTimeout(tryReady, AUTO_POPUP_QUIET_MS);
    };

    INTERACTION_EVENTS.forEach((name) => window.addEventListener(name, onInteraction, { passive: true }));
    const fallbackTimer = window.setTimeout(tryReady, fallbackMs);
    return () => {
      INTERACTION_EVENTS.forEach((name) => window.removeEventListener(name, onInteraction));
      window.clearTimeout(fallbackTimer);
      clear(quietTimer);
      clear(retryTimer);
    };
  }, [fallbackMs, ready]);

  return ready;
}
