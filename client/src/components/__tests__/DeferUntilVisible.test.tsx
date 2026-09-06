import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { DeferUntilVisible } from '../DeferUntilVisible';

/**
 * 這支測試守的是「內容絕對不能因為偵測失敗而消失」。
 *
 * 背景：DeferUntilVisible 是為了讓 BulletinSiteStats（帶 532 KB recharts）
 * 捲到附近才下載。但 2026-09-06 實測發現，IntersectionObserver 可能「存在卻永遠不回呼」，
 * 只做 typeof 檢查擋不住，區塊會永久消失。因此加了逾時保險絲。
 */

type IOCallback = (entries: { isIntersecting: boolean }[]) => void;

let callbacks: IOCallback[] = [];
let disconnectCount = 0;

function installIO({ fires }: { fires: boolean }) {
  callbacks = [];
  disconnectCount = 0;
  class FakeIO {
    constructor(private cb: IOCallback) {
      callbacks.push(cb);
    }
    observe() {
      if (fires) this.cb([{ isIntersecting: true }]);
    }
    disconnect() {
      disconnectCount += 1;
    }
    unobserve() {}
    takeRecords() {
      return [];
    }
  }
  vi.stubGlobal('IntersectionObserver', FakeIO as unknown as typeof IntersectionObserver);
}

describe('DeferUntilVisible', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('IO 回報進入視窗時掛載內容', () => {
    installIO({ fires: true });
    render(
      <DeferUntilVisible minHeight={360}>
        <div>統計卡</div>
      </DeferUntilVisible>,
    );
    expect(screen.getByText('統計卡')).toBeTruthy();
  });

  it('尚未進入視窗前不掛載，並保留佔位高度避免版面跳動', () => {
    installIO({ fires: false });
    const { container } = render(
      <DeferUntilVisible minHeight={360}>
        <div>統計卡</div>
      </DeferUntilVisible>,
    );
    expect(screen.queryByText('統計卡')).toBeNull();
    expect((container.firstChild as HTMLElement).style.minHeight).toBe('360px');
  });

  it('IO 存在但永遠不回呼時，逾時後仍會顯示內容（不可永久消失）', () => {
    installIO({ fires: false });
    render(
      <DeferUntilVisible minHeight={360} fallbackMs={3000}>
        <div>統計卡</div>
      </DeferUntilVisible>,
    );
    expect(screen.queryByText('統計卡')).toBeNull();
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByText('統計卡')).toBeTruthy();
  });

  it('環境完全沒有 IntersectionObserver 時直接顯示', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    render(
      <DeferUntilVisible minHeight={360}>
        <div>統計卡</div>
      </DeferUntilVisible>,
    );
    expect(screen.getByText('統計卡')).toBeTruthy();
  });
});
