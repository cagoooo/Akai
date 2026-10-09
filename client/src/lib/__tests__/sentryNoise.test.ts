import { describe, expect, it } from 'vitest';
import {
  createUnreliableNetworkTracker,
  isAbortedRequestError,
  isAppCheckRejection,
  isAutomatedBrowser,
  isRecoverableClientNoise,
} from '../sentry';

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
      // 2026-10-06 告警：電腦睡眠 38 分鐘後喚醒，App Check 換發 token 時網路尚未恢復
      { ...consoleEvent('[2026-10-06T05:24:17.552Z]  @firebase/auth: Auth (12.8.0): Error while retrieving App Check token: FirebaseError: AppCheck: Fetch failed to connect to a network. Check Internet connection. Original error: Failed to fetch (content-firebaseappcheck.googleapis.com). (appCheck/fetch-network-error).'), level: 'warning' as const },
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
      consoleEvent('@firebase/auth: Auth (12.8.0): Error while retrieving App Check token: FirebaseError: AppCheck: Requests throttled due to 403 error. Attempts allowed again after 01d:00m:00s (appCheck/throttled).'),
      consoleEvent('@firebase/auth: Auth (12.8.0): Error while retrieving App Check token: FirebaseError: AppCheck: Fetch server returned an HTTP error status. HTTP status: 403. (appCheck/fetch-status-error).'),
      { level: 'error' as const },
    ];
    for (const input of inputs) expect(isRecoverableClientNoise(input)).toBe(false);
  });
});

describe('自動化瀏覽器被 App Check 擋下不送進 Sentry', () => {
  const chromeUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36';

  it('辨識 Playwright 與無頭 Chrome；一般 Chrome 不算', () => {
    expect(isAutomatedBrowser({ webdriver: true, userAgent: chromeUA })).toBe(true);
    expect(isAutomatedBrowser({ webdriver: false, userAgent: chromeUA.replace('Chrome/', 'HeadlessChrome/') })).toBe(true);
    expect(isAutomatedBrowser({ webdriver: false, userAgent: chromeUA })).toBe(false);
  });

  it('App Check 403、節流與改用本機計數', () => {
    // 2026-10-07 告警：無頭 Chrome 截取正式站畫面，reCAPTCHA 判為機器人
    const inputs = [
      { ...consoleEvent('[2026-10-07T00:02:45.817Z]  @firebase/app-check: AppCheck: 403 error. Attempts allowed again after 01d:00m:00s (appCheck/initial-throttle).'), level: 'warning' as const },
      { ...consoleEvent('[2026-10-07T00:02:47.152Z]  @firebase/app-check: AppCheck: Requests throttled due to previous 403 error. Attempts allowed again after 23h:59m:59s (appCheck/throttled).'), level: 'warning' as const },
      { ...consoleEvent('[2026-10-07T00:02:31.436Z]  @firebase/auth: Auth (12.8.0): Error while retrieving App Check token: FirebaseError: AppCheck: 403 error. Attempts allowed again after 01d:00m:00s (appCheck/initial-throttle).'), level: 'warning' as const },
      consoleEvent('@firebase/auth: Auth (12.8.0): Error while retrieving App Check token: FirebaseError: AppCheck: Fetch server returned an HTTP error status. HTTP status: 403. (appCheck/fetch-status-error).'),
      exceptionEvent('Error', 'App Check 尚未通過，使用本機工具計數'),
    ];
    for (const input of inputs) expect(isAppCheckRejection(input)).toBe(true);
  });

  it('其他錯誤不算', () => {
    const inputs = [
      consoleEvent('@firebase/app-check: AppCheck: ReCAPTCHA error. (appCheck/recaptcha-error).'),
      exceptionEvent('FirebaseError', 'Missing or insufficient permissions.'),
      exceptionEvent('TypeError', "Cannot read properties of undefined (reading 'map')"),
      { level: 'error' as const },
    ];
    for (const input of inputs) expect(isAppCheckRejection(input)).toBe(false);
  });
});

const firebaseError = (code: string, message: string) =>Object.assign(new Error(message), { name: 'FirebaseError', code });

function trackerHarness(online = true) {
  const target = new EventTarget();
  let time = 1_000_000;
  let tick: () => void = () => {};
  const state = { online };
  const isNetworkUnreliable = createUnreliableNetworkTracker(target, {
    now: () => time,
    isOnline: () => state.online,
    every: (callback) => { tick = callback; },
  });
  return {
    target,
    state,
    isNetworkUnreliable,
    advance: (ms: number) => { time += ms; },
    tick: () => tick(),
  };
}

describe('網路不可靠時被中止的請求不送進 Sentry', () => {
  it('pagehide 之後視為卸載；從 back/forward cache 還原後恢復', () => {
    const { target, isNetworkUnreliable } = trackerHarness();
    expect(isNetworkUnreliable()).toBe(false);
    target.dispatchEvent(new Event('pagehide'));
    expect(isNetworkUnreliable()).toBe(true);
    target.dispatchEvent(new Event('pageshow'));
    expect(isNetworkUnreliable()).toBe(false);
  });

  it('離線時，以及恢復連線後 15 秒內', () => {
    const { target, state, isNetworkUnreliable, advance } = trackerHarness(false);
    expect(isNetworkUnreliable()).toBe(true);
    state.online = true;
    target.dispatchEvent(new Event('online'));
    advance(14_000);
    expect(isNetworkUnreliable()).toBe(true);
    advance(2_000);
    expect(isNetworkUnreliable()).toBe(false);
  });

  it('計時器停擺超過兩分鐘視為剛從睡眠喚醒；背景分頁約每分鐘一次的節流不算', () => {
    const { isNetworkUnreliable, advance, tick } = trackerHarness();
    advance(70_000);
    tick();
    expect(isNetworkUnreliable()).toBe(false);
    // 2026-10-06 告警：電腦睡眠 38 分鐘後喚醒
    advance(38 * 60_000);
    tick();
    expect(isNetworkUnreliable()).toBe(true);
    advance(15_000);
    expect(isNetworkUnreliable()).toBe(false);
  });

  it('辨識 callable 與 fetch 被中止的錯誤', () => {
    // 2026-10-06 告警：按下 PWA「更新」後重新整理，recordPublicAnalytics 請求被中止
    expect(isAbortedRequestError(firebaseError('functions/internal', 'internal'))).toBe(true);
    expect(isAbortedRequestError(new TypeError('Failed to fetch'))).toBe(true);
    expect(isAbortedRequestError(new TypeError('Load failed'))).toBe(true);
    expect(isAbortedRequestError(new TypeError('NetworkError when attempting to fetch resource.'))).toBe(true);
    // 2026-10-09 告警：靜態檔與備援 API 都沒成功回應（離線時 Service Worker 回合成的 503），首頁丟出此錯誤
    expect(isAbortedRequestError(new Error('無法獲取工具數據'))).toBe(true);
  });

  it('後端回應的錯誤與一般例外照常回報', () => {
    const inputs = [
      firebaseError('functions/internal', 'INTERNAL'),
      firebaseError('functions/unavailable', 'unavailable'),
      firebaseError('functions/resource-exhausted', 'analytics rate limit exceeded'),
      firebaseError('permission-denied', 'Missing or insufficient permissions.'),
      new TypeError("Cannot read properties of undefined (reading 'map')"),
      new Error('工具資料格式錯誤'),
      '無法獲取工具數據',
      'Failed to fetch',
      undefined,
    ];
    for (const input of inputs) expect(isAbortedRequestError(input)).toBe(false);
  });
});
