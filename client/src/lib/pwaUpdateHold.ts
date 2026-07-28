/**
 * PWA 更新暫緩（hold）機制
 *
 * 情境：訪客正在主畫面的「族群對象引導精靈」作答時，若 Service Worker
 * 偵測到新版本並自動倒數重新整理，答到一半的選擇會全部消失 —— 使用者
 * 眼中就是「我什麼都沒選到」，UX 體驗大受影響。
 *
 * 作法：任何「不能被打斷」的流程開啟時取得一個 hold，關閉時釋放。
 * 只要還有人持有 hold，自動更新就不會倒數、不會靜默 reload，
 * 更新提示也不會冒出來干擾；等 hold 全部釋放後才恢復正常更新流程。
 */

export const PWA_UPDATE_HOLD_CHANGE_EVENT = 'akai:pwa-update-hold-change';

let holdCount = 0;

function notifyHoldChange(): void {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent(PWA_UPDATE_HOLD_CHANGE_EVENT, {
        detail: { held: holdCount > 0 },
    }));
}

/** 目前是否有流程正在阻擋自動更新 */
export function isPWAUpdateHeld(): boolean {
    return holdCount > 0;
}

/**
 * 取得一個更新暫緩票；回傳的函式呼叫後釋放（可重複呼叫，只生效一次）。
 * 用計數而非布林，避免兩個流程同時開啟時先關的那個誤放行。
 */
export function acquirePWAUpdateHold(): () => void {
    holdCount += 1;
    if (holdCount === 1) notifyHoldChange();

    let released = false;
    return () => {
        if (released) return;
        released = true;
        holdCount = Math.max(0, holdCount - 1);
        if (holdCount === 0) notifyHoldChange();
    };
}

/**
 * 立即執行（沒有 hold 時），或等到最後一個 hold 釋放後才執行。
 * 給「靜默套用新版 SW」這類會直接 reload 的動作使用。
 */
export function runWhenUpdateAllowed(action: () => void): void {
    if (!isPWAUpdateHeld()) {
        action();
        return;
    }
    if (typeof window === 'undefined') return;

    const onHoldChange = () => {
        if (isPWAUpdateHeld()) return;
        window.removeEventListener(PWA_UPDATE_HOLD_CHANGE_EVENT, onHoldChange);
        action();
    };
    window.addEventListener(PWA_UPDATE_HOLD_CHANGE_EVENT, onHoldChange);
}
