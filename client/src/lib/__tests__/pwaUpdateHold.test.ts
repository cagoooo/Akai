import { describe, expect, it, vi } from 'vitest';
import { acquirePWAUpdateHold, isPWAUpdateHeld, PWA_UPDATE_HOLD_CHANGE_EVENT, runWhenUpdateAllowed } from '../pwaUpdateHold';

describe('pwaUpdateHold', () => {
    it('取票後被視為暫緩中，放票後恢復', () => {
        expect(isPWAUpdateHeld()).toBe(false);
        const release = acquirePWAUpdateHold();
        expect(isPWAUpdateHeld()).toBe(true);
        release();
        expect(isPWAUpdateHeld()).toBe(false);
    });

    it('兩個流程同時持票時，先關的那個不會誤放行', () => {
        const releaseA = acquirePWAUpdateHold();
        const releaseB = acquirePWAUpdateHold();
        releaseA();
        expect(isPWAUpdateHeld()).toBe(true); // B 還在填寫
        releaseB();
        expect(isPWAUpdateHeld()).toBe(false);
    });

    it('重複呼叫同一張票的釋放函式只生效一次', () => {
        const releaseA = acquirePWAUpdateHold();
        const releaseB = acquirePWAUpdateHold();
        releaseA();
        releaseA();
        expect(isPWAUpdateHeld()).toBe(true);
        releaseB();
        expect(isPWAUpdateHeld()).toBe(false);
    });

    it('只在「從無到有」與「全部放完」時發事件，中間不吵', () => {
        const listener = vi.fn();
        window.addEventListener(PWA_UPDATE_HOLD_CHANGE_EVENT, listener);
        const releaseA = acquirePWAUpdateHold();
        const releaseB = acquirePWAUpdateHold();
        expect(listener).toHaveBeenCalledTimes(1);
        releaseA();
        expect(listener).toHaveBeenCalledTimes(1);
        releaseB();
        expect(listener).toHaveBeenCalledTimes(2);
        window.removeEventListener(PWA_UPDATE_HOLD_CHANGE_EVENT, listener);
    });

    it('沒人持票時 runWhenUpdateAllowed 立刻執行', () => {
        const action = vi.fn();
        runWhenUpdateAllowed(action);
        expect(action).toHaveBeenCalledTimes(1);
    });

    it('有人持票時延後到最後一張票放完才執行（更新不會被丟掉，只是延後）', () => {
        const action = vi.fn();
        const releaseA = acquirePWAUpdateHold();
        const releaseB = acquirePWAUpdateHold();
        runWhenUpdateAllowed(action);
        expect(action).not.toHaveBeenCalled();
        releaseA();
        expect(action).not.toHaveBeenCalled();
        releaseB();
        expect(action).toHaveBeenCalledTimes(1);
    });
});
