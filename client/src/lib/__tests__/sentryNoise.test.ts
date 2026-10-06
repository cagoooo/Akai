import { describe, expect, it } from 'vitest';
import { createPageUnloadTracker, isAbortedRequestError, isRecoverableClientNoise } from '../sentry';

const consoleEvent = (message: string) => ({ logger: 'console', level: 'error' as const, message });
const exceptionEvent = (type: string, value: string) => ({ level: 'error' as const, exception: { values: [{ type, value }] } });

describe('可自行復原的前端雜訊不送進 Sentry', () => {
  it('部署換版後舊分頁的動態模組載入失敗', () => {
    const inputs = [
      exceptionEvent('TypeError', 'Failed to fetch dynamically imported module: https://cagoooo.github.io/Akai/assets/BulletinToolFamilyTree--0v0B49-.js'),
      exceptionEvent('TypeError', 'error loading dynamically imported module: https://cagoooo.github.io/Akai/assets/ReviewList-CLSmCqYZ.js'),
      exceptionEvent('TypeError', 'Importing a module script failed.'),
      exceptionEvent('Error', 'Unable to preload CSS for /Akai/assets/index-abc123.css'),
      exceptionEvent('ChunkLoadError', 'Loading chunk 42 failed.'),
    ];
    for (const input of inputs) expect(isRecoverableClientNoise(input)).toBe(true);
  });

  it('裝置離線或頁面重新載入造成的 Firebase 連線中斷', () => {
    const inputs = [
      exceptionEvent('FirebaseError', 'Firebase: Error (auth/network-request-failed).'),
      consoleEvent("[2026-10-05T14:21:54.478Z]  @firebase/firestore: Firestore (12.8.0): Could not reach Cloud Firestore backend. Connection failed 1 times. Most recent error: FirebaseError: [code=unavailable]: The operation could not be completed\nThis typically indicates that your device does not have a healthy Internet connection at the moment."),
      { ...consoleEvent("[2026-10-05T14:21:54.472Z]  @firebase/firestore: Firestore (12.8.0): WebChannelConnection RPC 'Listen' stream 0x3e6446ae transport errored. Name: undefined Message: undefined"), level: 'warning' as const },
      // 2026-10-06 告警：Firestore 10 秒內連不上，讀取評分統計失敗
      exceptionEvent('FirebaseError', 'Failed to get document because the client is offline.'),
    ];
    for (const input of inputs) expect(isRecoverableClientNoise(input)).toBe(true);
  });

  it('其他 Firebase 錯誤與一般例外照常回報', () => {
    const inputs = [
      exceptionEvent('FirebaseError', 'Missing or insufficient permissions.'),
      exceptionEvent('FirebaseError', 'Firebase: Error (auth/internal-error).'),
      exceptionEvent('TypeError', "Cannot read properties of undefined (reading 'map')"),
      consoleEvent('[2026-10-05T14:21:54.478Z]  @firebase/firestore: Firestore (12.8.0): The query requires an index.'),
      consoleEvent('[2026-10-05T14:21:54.478Z]  @firebase/firestore: Firestore (12.8.0): INTERNAL ASSERTION FAILED: Unexpected state'),
      consoleEvent('Could not reach Cloud Firestore backend.'),
      exceptionEvent('FirebaseError', 'Failed to get document from server. (However, this document does exist in the local cache.)'),
      { level: 'error' as const },
    ];
    for (const input of inputs) expect(isRecoverableClientNoise(input)).toBe(false);
  });
});

const firebaseError = (code: string, message: string) => Object.assign(new Error(message), { name: 'FirebaseError', code });

describe('頁面卸載時被中止的請求不送進 Sentry', () => {
  it('pagehide 之後才視為卸載；從 back/forward cache 還原後恢復', () => {
    const target = new EventTarget();
    const isPageUnloading = createPageUnloadTracker(target);
    expect(isPageUnloading()).toBe(false);
    target.dispatchEvent(new Event('pagehide'));
    expect(isPageUnloading()).toBe(true);
    target.dispatchEvent(new Event('pageshow'));
    expect(isPageUnloading()).toBe(false);
  });

  it('辨識 callable 與 fetch 被中止的錯誤', () => {
    // 2026-10-06 告警：按下 PWA「更新」後重新整理，recordPublicAnalytics 請求被中止
    expect(isAbortedRequestError(firebaseError('functions/internal', 'internal'))).toBe(true);
    expect(isAbortedRequestError(new TypeError('Failed to fetch'))).toBe(true);
    expect(isAbortedRequestError(new TypeError('Load failed'))).toBe(true);
    expect(isAbortedRequestError(new TypeError('NetworkError when attempting to fetch resource.'))).toBe(true);
  });

  it('後端回應的錯誤與一般例外照常回報', () => {
    const inputs = [
      firebaseError('functions/internal', 'INTERNAL'),
      firebaseError('functions/unavailable', 'unavailable'),
      firebaseError('functions/resource-exhausted', 'analytics rate limit exceeded'),
      firebaseError('permission-denied', 'Missing or insufficient permissions.'),
      new TypeError("Cannot read properties of undefined (reading 'map')"),
      'Failed to fetch',
      undefined,
    ];
    for (const input of inputs) expect(isAbortedRequestError(input)).toBe(false);
  });
});
