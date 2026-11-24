import { useEffect, useRef, useState } from 'react';

interface UseKeyboardShortcutsOptions {
    onSearch?: () => void;
    onClearSearch?: () => void;
    onShowHelp?: () => void;
    onToggleFavorite?: () => void;
    onNavigateUp?: () => void;
    onNavigateDown?: () => void;
    onOpenSelected?: () => void;
}

const INTERACTIVE_SELECTOR =
    'a[href], button, select, summary, [role="button"], [role="link"], [role="menuitem"], [role="tab"], [role="option"], [role="checkbox"], [role="switch"], [role="dialog"], [role="slider"], [tabindex]:not([tabindex="-1"])';

/** 焦點是否在可操作元件（或其內部）上：這時 Enter／方向鍵屬於該元件，不能當成頁面快捷鍵。 */
export function isInteractiveTarget(target: EventTarget | null): boolean {
    if (!(target instanceof Element)) return false;
    if (target === document.body || target === document.documentElement) return false;
    return target.closest(INTERACTIVE_SELECTOR) !== null;
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions) {
    const {
        onSearch,
        onClearSearch,
        onShowHelp,
        onToggleFavorite,
        onNavigateUp,
        onNavigateDown,
        onOpenSelected
    } = options;

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            const isInputFocused = target instanceof HTMLInputElement ||
                target instanceof HTMLTextAreaElement ||
                target instanceof HTMLSelectElement ||
                target.isContentEditable;
            // 焦點在連結、按鈕等可操作元件上時，Enter／方向鍵要交還給瀏覽器（2026-11-24：原本一律攔下，
            // 鍵盤使用者在任何連結或按鈕上按 Enter 都沒反應）。只有焦點在頁面本身時才當成卡片導覽快捷鍵。
            const isInteractiveFocused = isInteractiveTarget(target);

            // `/` 聚焦搜尋框
            if (e.key === '/' && !isInputFocused) {
                e.preventDefault();
                onSearch?.();
                return;
            }

            // `Esc` 清除搜尋或關閉對話框
            if (e.key === 'Escape') {
                if (isInputFocused) {
                    (target as HTMLInputElement).blur();
                }
                onClearSearch?.();
                return;
            }

            // `?` 顯示快捷鍵說明
            if (e.key === '?' && !isInputFocused) {
                e.preventDefault();
                onShowHelp?.();
                return;
            }

            // `F` 切換收藏（避免與瀏覽器快捷鍵衝突）
            if (e.key === 'f' && !e.ctrlKey && !e.metaKey && !isInputFocused) {
                e.preventDefault();
                onToggleFavorite?.();
                return;
            }

            // 方向鍵導航（不在輸入框、也不在連結或按鈕上時）
            if (!isInputFocused && !isInteractiveFocused) {
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    onNavigateUp?.();
                    return;
                }
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    onNavigateDown?.();
                    return;
                }
                if (e.key === 'Enter') {
                    e.preventDefault();
                    onOpenSelected?.();
                    return;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onSearch, onClearSearch, onShowHelp, onToggleFavorite, onNavigateUp, onNavigateDown, onOpenSelected]);
}
