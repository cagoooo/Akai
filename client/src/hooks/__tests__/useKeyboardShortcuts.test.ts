import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts, isInteractiveTarget } from '../useKeyboardShortcuts';

function press(target: EventTarget, key: string) {
    const ev = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    target.dispatchEvent(ev);
    return ev;
}

describe('useKeyboardShortcuts：Enter／方向鍵不可攔下連結與按鈕（2026-11-24 全站檢測）', () => {
    afterEach(() => { document.body.innerHTML = ''; });

    it('焦點在頁面本身時，Enter 開啟選取中的卡片、方向鍵移動選取', () => {
        const onOpenSelected = vi.fn();
        const onNavigateDown = vi.fn();
        renderHook(() => useKeyboardShortcuts({ onOpenSelected, onNavigateDown }));
        const enter = press(document.body, 'Enter');
        const down = press(document.body, 'ArrowDown');
        expect(onOpenSelected).toHaveBeenCalledOnce();
        expect(onNavigateDown).toHaveBeenCalledOnce();
        expect(enter.defaultPrevented).toBe(true);
        expect(down.defaultPrevented).toBe(true);
    });

    it.each([
        ['連結', () => { const a = document.createElement('a'); a.href = '#x'; a.textContent = '看全部'; return a; }],
        ['按鈕', () => { const b = document.createElement('button'); b.textContent = '請喝珍奶'; return b; }],
        ['按鈕裡的文字', () => { const b = document.createElement('button'); const span = document.createElement('span'); b.appendChild(span); document.body.appendChild(b); return span; }],
        ['role=button 的元素', () => { const d = document.createElement('div'); d.setAttribute('role', 'button'); d.tabIndex = 0; return d; }],
        ['下拉選單', () => document.createElement('select')],
    ])('焦點在%s上時，Enter 與方向鍵交給瀏覽器', (_label, make) => {
        const onOpenSelected = vi.fn();
        const onNavigateUp = vi.fn();
        renderHook(() => useKeyboardShortcuts({ onOpenSelected, onNavigateUp }));
        const el = make();
        if (!el.isConnected) document.body.appendChild(el);
        const enter = press(el, 'Enter');
        const up = press(el, 'ArrowUp');
        expect(onOpenSelected).not.toHaveBeenCalled();
        expect(onNavigateUp).not.toHaveBeenCalled();
        expect(enter.defaultPrevented).toBe(false);
        expect(up.defaultPrevented).toBe(false);
    });

    it('isInteractiveTarget：一般文字段落與 body 不算可操作元件', () => {
        const p = document.createElement('p');
        document.body.appendChild(p);
        expect(isInteractiveTarget(p)).toBe(false);
        expect(isInteractiveTarget(document.body)).toBe(false);
        expect(isInteractiveTarget(null)).toBe(false);
    });
});
