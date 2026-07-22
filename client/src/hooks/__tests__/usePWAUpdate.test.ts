import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { usePWAUpdate } from '../usePWAUpdate';

describe('usePWAUpdate', () => {
  const originalServiceWorker = Object.getOwnPropertyDescriptor(navigator, 'serviceWorker');

  afterEach(() => {
    if (originalServiceWorker) {
      Object.defineProperty(navigator, 'serviceWorker', originalServiceWorker);
    }
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
  });
});
