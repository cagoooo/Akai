import { describe, expect, it } from 'vitest';
import { isRecoverableClientNoise } from '../sentry';

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
      { level: 'error' as const },
    ];
    for (const input of inputs) expect(isRecoverableClientNoise(input)).toBe(false);
  });
});
