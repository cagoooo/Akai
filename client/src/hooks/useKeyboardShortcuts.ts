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
                target.isContentEditable;

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

            // 方向鍵導航（不在輸入框中時）
            if (!isInputFocused) {
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
