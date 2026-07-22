import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  PWA_UPDATE_AVAILABLE_EVENT,
  watchServiceWorkerRegistration,
} from './serviceWorkerRegistration';

class FakeWorker extends EventTarget {
  state: ServiceWorkerState = 'installing';
  postMessage = vi.fn();
}

class FakeRegistration extends EventTarget {
  scope = 'https://example.test/Akai/';
  waiting: ServiceWorker | null = null;
  installing: ServiceWorker | null = null;
}

describe('Service Worker 更新通知', () => {
  const originalServiceWorker = Object.getOwnPropertyDescriptor(navigator, 'serviceWorker');

  afterEach(() => {
    if (originalServiceWorker) {
      Object.defineProperty(navigator, 'serviceWorker', originalServiceWorker);
    }
    vi.restoreAllMocks();
  });

  it('發現 waiting worker 時只通知 UI，不會提前 SKIP_WAITING', () => {
    const worker = new FakeWorker();
    worker.state = 'installed';
    const registration = new FakeRegistration();
    registration.waiting = worker as unknown as ServiceWorker;
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { controller: {} },
    });
    const onUpdate = vi.fn();
    window.addEventListener(PWA_UPDATE_AVAILABLE_EVENT, onUpdate, { once: true });

    watchServiceWorkerRegistration(registration as unknown as ServiceWorkerRegistration);

    expect(onUpdate).toHaveBeenCalledOnce();
    expect(worker.postMessage).not.toHaveBeenCalled();
  });

  it('安裝中的 worker 進入 installed 後才通知 UI', () => {
    const worker = new FakeWorker();
    const registration = new FakeRegistration();
    registration.installing = worker as unknown as ServiceWorker;
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { controller: {} },
    });
    const onUpdate = vi.fn();
    window.addEventListener(PWA_UPDATE_AVAILABLE_EVENT, onUpdate, { once: true });

    watchServiceWorkerRegistration(registration as unknown as ServiceWorkerRegistration);
    expect(onUpdate).not.toHaveBeenCalled();

    worker.state = 'installed';
    worker.dispatchEvent(new Event('statechange'));
    expect(onUpdate).toHaveBeenCalledOnce();
  });

  it('sw.js 安裝階段不會自行 skipWaiting', () => {
    const source = readFileSync(resolve(process.cwd(), 'client/public/sw.js'), 'utf8');
    const registrationSource = readFileSync(
      resolve(process.cwd(), 'client/src/serviceWorkerRegistration.ts'),
      'utf8',
    );
    const installBlock = source.slice(
      source.indexOf("self.addEventListener('install'"),
      source.indexOf("self.addEventListener('activate'"),
    );

    expect(installBlock).not.toContain('self.skipWaiting()');
    expect(source).toContain("event.data?.type === 'SKIP_WAITING'");
    expect(registrationSource).not.toContain("window.addEventListener('load'");
  });
});
