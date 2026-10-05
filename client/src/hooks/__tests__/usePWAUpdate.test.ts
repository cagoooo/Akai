import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { usePWAUpdate } from '../usePWAUpdate';

describe('usePWAUpdate', () => {
  const originalServiceWorker = Object.getOwnPropertyDescriptor(navigator, 'serviceWorker');

  afterEach(() => {
    cleanup();
    if (originalServiceWorker) {
      Object.defineProperty(navigator, 'serviceWorker', originalServiceWorker);
    } else {
      Reflect.deleteProperty(navigator, 'serviceWorker');
    }
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('先顯示 waiting 更新，直到 updateApp 才送出 SKIP_WAITING', async () => {
    const waitingWorker = { postMessage: vi.fn() } as unknown as ServiceWorker;
    const registration = {
      waiting: waitingWorker,
      installing: null,
      update: vi.fn().mockResolvedValue(undefined),
    } as unknown as ServiceWorkerRegistration;
    const listeners = new Map<string, EventListener>();
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        controller: {},
        ready: Promise.resolve(registration),
        getRegistration: vi.fn().mockResolvedValue(registration),
        addEventListener: vi.fn((type: string, listener: EventListener) => listeners.set(type, listener)),
        removeEventListener: vi.fn((type: string) => listeners.delete(type)),
      },
    });

    const { result } = renderHook(() => usePWAUpdate());

    await waitFor(() => expect(result.current.isUpdateAvailable).toBe(true));
    expect(waitingWorker.postMessage).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.updateApp();
    });
    expect(waitingWorker.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
    expect(result.current.isUpdating).toBe(true);
  });

  function mockRegistration(registration: object) {
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        ready: Promise.resolve(registration),
        getRegistration: vi.fn().mockResolvedValue(registration),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });
  }

  it('立即顯示更新中並阻止重複提交；逾時恢復重試', async () => {
    vi.useFakeTimers();
    const postMessage = vi.fn();
    mockRegistration({ waiting: { postMessage }, installing: null });
    const { result } = renderHook(() => usePWAUpdate());
    await act(async () => {});
    let update!: Promise<void>;
    act(() => { update = result.current.updateApp(); });
    expect(result.current.isUpdating).toBe(true);
    expect(postMessage).not.toHaveBeenCalled();
    await act(async () => {
      await result.current.updateApp();
      await vi.advanceTimersByTimeAsync(40);
      await update;
    });
    expect(postMessage).toHaveBeenCalledTimes(1);
    await act(async () => { await vi.advanceTimersByTimeAsync(45000); });
    expect(result.current.isUpdating).toBe(false);
    expect(result.current.updateError).toContain('重試');
    act(() => { update = result.current.updateApp(); });
    expect(result.current.updateError).toBeNull();
    await act(async () => { await vi.advanceTimersByTimeAsync(40); await update; });
    expect(postMessage).toHaveBeenCalledTimes(2);
  });

  it('檢查更新失敗會顯示重試，且不會繼續自動更新', async () => {
    const update = vi.fn().mockRejectedValue(new Error('offline'));
    mockRegistration({ waiting: null, installing: null, update });
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() => usePWAUpdate());
    await act(async () => { await result.current.updateApp(); });
    expect(result.current.isUpdating).toBe(false);
    expect(result.current.updateError).toContain('網路連線');
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('逾時後忽略遲到的更新結果，卸載時清除計時器', async () => {
    vi.useFakeTimers();
    let resolve!: () => void;
    const postMessage = vi.fn();
    const registration = { waiting: null as null | { postMessage: typeof postMessage }, installing: null,
      update: () => new Promise<void>((done) => { resolve = done; }) };
    mockRegistration(registration);
    const { result, unmount } = renderHook(() => usePWAUpdate());
    await act(async () => {});
    let update!: Promise<void>;
    act(() => { update = result.current.updateApp(); });
    await act(async () => { await vi.advanceTimersByTimeAsync(45001); });
    registration.waiting = { postMessage };
    await act(async () => { resolve(); await update; });
    expect(postMessage).not.toHaveBeenCalled();
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
