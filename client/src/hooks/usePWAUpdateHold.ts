import { useEffect } from 'react';
import { acquirePWAUpdateHold } from '@/lib/pwaUpdateHold';

/**
 * 「這個流程進行中，先別自動更新」的 React 包裝（P0-2）。
 *
 * 用在任何「被自動重整就會丟掉使用者輸入」的地方：引導精靈、許願池、
 * 評論／回覆表單。active 轉 false 或元件卸載時自動放行。
 *
 * 只在真的有東西可丟時取票（例如 textarea 已經有字），
 * 才不會有人開著空白對話框整晚、更新就永遠套用不上。
 */
export function usePWAUpdateHold(active: boolean): void {
    useEffect(() => {
        if (!active) return;
        return acquirePWAUpdateHold();
    }, [active]);
}
