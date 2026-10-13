import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AUTO_POPUP_FALLBACK_MS,
  AUTO_POPUP_QUIET_MS,
  AUTO_POPUP_RETRY_MS,
  useAutoPopupReady,
} from '../useAutoPopupReady';

const INTERACTIONS = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'touchmove'];
const fire = (target: EventTarget, type: string) => act(() => { target.dispatchEvent(new Event(type, { bubbles: true })); });
const advance = (ms: number) => act(() => { vi.advanceTimersByTime(ms); });

describe('useAutoPopupReady：自動彈窗不在進站時搶畫面，也不打斷訪客的動作', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('一進站不允許彈窗；完全沒有互動滿 10 秒才允許', () => {
    const { result } = renderHook(() => useAutoPopupReady());
    expect(result.current).toBe(false);
    advance(AUTO_POPUP_FALLBACK_MS - 1);
    expect(result.current).toBe(false);
    advance(1);
    expect(result.current).toBe(true);
  });

  it('按下、按鍵、滾輪、觸控：訪客停手 1.5 秒後才允許，不在動作的瞬間彈出', () => {
    for (const type of INTERACTIONS) {
      const { result, unmount } = renderHook(() => useAutoPopupReady());
      fire(window, type);
      expect(result.current).toBe(false); // 按下去的瞬間不彈
      advance(AUTO_POPUP_QUIET_MS - 1);
      expect(result.current).toBe(false);
      advance(1);
      expect(result.current).toBe(true);
      unmount();
    }
  });

  it('連續互動（例如一路滑動）會一直重新計時，直到停手', () => {
    const { result } = renderHook(() => useAutoPopupReady());
    for (let i = 0; i < 6; i += 1) {
      fire(window, 'touchmove');
      advance(AUTO_POPUP_QUIET_MS - 200);
    }
    expect(result.current).toBe(false);
    advance(200);
    expect(result.current).toBe(true);
  });

  it('在輸入框裡按下或打字不算互動（彈窗會搶走焦點）', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    const { result } = renderHook(() => useAutoPopupReady());
    fire(input, 'pointerdown');
    fire(input, 'keydown');
    advance(AUTO_POPUP_QUIET_MS * 2);
    expect(result.current).toBe(false);
    // 離開輸入框後的互動才算
    fire(document.body, 'pointerdown');
    advance(AUTO_POPUP_QUIET_MS);
    expect(result.current).toBe(true);
  });

  it('按 / 之類快捷鍵讓搜尋框取得焦點後，不彈窗搶走焦點；離開輸入框後才彈', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    const { result } = renderHook(() => useAutoPopupReady());
    fire(document.body, 'keydown'); // 例如按 /（事件目標是 body）
    input.focus();
    advance(AUTO_POPUP_QUIET_MS);
    expect(result.current).toBe(false);
    advance(AUTO_POPUP_RETRY_MS * 3);
    expect(result.current).toBe(false);
    input.blur();
    advance(AUTO_POPUP_RETRY_MS);
    expect(result.current).toBe(true);
  });

  it('計時到了仍在輸入：暫緩，離開輸入框後的下一次檢查才允許', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    const { result } = renderHook(() => useAutoPopupReady());
    advance(AUTO_POPUP_FALLBACK_MS);
    expect(result.current).toBe(false);
    advance(AUTO_POPUP_RETRY_MS * 3);
    expect(result.current).toBe(false);
    input.blur();
    advance(AUTO_POPUP_RETRY_MS);
    expect(result.current).toBe(true);
  });

  it('一旦允許就不會變回不允許；卸載時移除所有監聽與計時器', () => {
    const add = vi.spyOn(window, 'addEventListener');
    const remove = vi.spyOn(window, 'removeEventListener');
    const { result, unmount } = renderHook(() => useAutoPopupReady());
    const count = (spy: typeof add) => spy.mock.calls.filter(([type]) => INTERACTIONS.includes(String(type))).length;
    expect(count(add)).toBe(INTERACTIONS.length);
    fire(window, 'pointerdown');
    advance(AUTO_POPUP_QUIET_MS);
    expect(result.current).toBe(true);
    advance(AUTO_POPUP_FALLBACK_MS * 2);
    expect(result.current).toBe(true);
    unmount();
    expect(count(remove)).toBeGreaterThanOrEqual(INTERACTIONS.length);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('頁面自己捲動（不是使用者動作）不會提早允許彈窗', () => {
    const { result } = renderHook(() => useAutoPopupReady());
    fire(window, 'scroll');
    advance(AUTO_POPUP_QUIET_MS * 2);
    expect(result.current).toBe(false);
  });

  it('可自訂等待時間', () => {
    const { result } = renderHook(() => useAutoPopupReady(500));
    advance(500);
    expect(result.current).toBe(true);
  });
});
