/**
 * Sentry 錯誤監控初始化
 *
 * 為什麼：v3.6.4 「設備只有 1 筆」這種隱性 bug，console.warn 沒人看到。
 *        Sentry 自動收集所有錯誤、效能與 console.warn 流量，類似錯誤暴增時告警。
 *
 * 設定：
 *   - DSN 從 VITE_SENTRY_DSN 讀（沒設就完全 noop，不影響本地開發）
 *   - 生產環境才啟用（dev mode 不送，避免測試誤觸）
 *   - 只做錯誤回報（2026-09-23 起不錄影回放、不做效能追蹤）
 *   - 自動捕捉 unhandledrejection、未捕獲 error、console.error/warn
 *
 * 延後載入（2026-09-23）：@sentry/react 若靜態 import 會佔主 bundle 一半，
 *   改成頁面 load 後閒置時才動態 import；沒設 DSN 時完全不下載。
 *   載入前發生的錯誤先暫存在 pending，Sentry 就緒後補送，不會漏掉進站頭幾秒的錯誤。
 *
 * 用法：
 *   import { initSentry, captureException, addBreadcrumb } from '@/lib/sentry';
 *   initSentry();   // 在 main.tsx 最早呼叫
 *   captureException(err);
 */

import { CHUNK_LOAD_ERROR_PATTERNS } from './chunkRecovery';

type SentryModule = typeof import('./sentryClient');
type SentryEvent = import('@sentry/react').ErrorEvent;

/** SDK 已接手的多分頁交接訊息；不匹配權限、IndexedDB 或未處理例外。 */
export function createFirestoreLeaseClassifier(now = () => Date.now()) {
  const occurrences: number[] = [];
  const leaseMessage = /^(?:\[[^\]\r\n]+\]\s+)?@firebase\/firestore:\s+Firestore \(\d+\.\d+\.\d+\): Failed to obtain primary lease for action '(Apply remote event|Backfill Indexes|Collect garbage|Release target)'\.$/;
  return (event: SentryEvent): SentryEvent | null => {
    const leaseMatch = event.message?.match(leaseMessage);
    if (event.logger !== 'console' || event.exception?.values?.length || !leaseMatch) return event;
    const action = leaseMatch[1];
    // 非主分頁取消監聽時寫不進 IndexedDB，SDK 註明丟掉這筆紀錄可接受；離開頁面時多個監聽同時取消，
    // 一次就有好幾筆（2026-11-04 JAVASCRIPT-REACT-1H：同一秒 3 筆），不計入交接門檻
    if (action === 'Release target') return null;
    const timestamp = now();
    while (occurrences.length && timestamp - occurrences[0] >= 60_000) occurrences.shift();
    occurrences.push(timestamp);
    // SDK 已接手的正常交接不送進 Sentry；同一頁 60 秒內三次以上才回報為 error。
    if (occurrences.length < 3) return null;
    event.level = 'error';
    event.message = `Firestore multi-tab primary lease changed during '${action}'.`;
    event.fingerprint = ['firestore-primary-lease', action.toLowerCase().replaceAll(' ', '-')];
    event.tags = { ...event.tags, firestoreLease: 'handoff' };
    event.extra = { ...event.extra, leaseOccurrencesInLastMinute: occurrences.length };
    return event;
  };
}

/**
 * 多分頁快取會比對其他分頁寫下的主分頁租約時間；分頁之間時鐘差 1 毫秒，SDK 就記成「更新時間在未來」，
 * 並把那份租約當作無效、自行重新協調（2026-10-14 JAVASCRIPT-REACT-13，差 1 毫秒）。
 * 2026-11-19 JAVASCRIPT-REACT-2N：Mac Safari 差 2 秒（電腦自動對時把時鐘往回調一點）就寄 high priority 告警，
 * SDK 早已自行重新協調、訪客沒受影響，也不是站方修得到的。改成 1 分鐘以內一律略過；
 * 超過 1 分鐘才算裝置時鐘異常，每頁回報一次、降為 warning（見 createFirestoreClockSkewClassifier）。
 */
const FIRESTORE_FUTURE_UPDATE = /^(?:\[[^\]\r\n]+\]\s+)?@firebase\/firestore:\s+Firestore \(\d+\.\d+\.\d+\): Detected an update time that is in the future: (\d{1,16}) > (\d{1,16})$/;
const FIRESTORE_TAB_CLOCK_JITTER_MS = 60_000;

function firestoreFutureUpdateAheadMs(event: SentryEvent): number | null {
  if (event.logger !== 'console' || event.exception?.values?.length) return null;
  const match = event.message?.match(FIRESTORE_FUTURE_UPDATE);
  if (!match) return null;
  const aheadMs = Number(match[1]) - Number(match[2]);
  return aheadMs > 0 ? aheadMs : null;
}

export function isFirestoreTabClockJitter(event: SentryEvent): boolean {
  const aheadMs = firestoreFutureUpdateAheadMs(event);
  return aheadMs !== null && aheadMs <= FIRESTORE_TAB_CLOCK_JITTER_MS;
}

/**
 * 差距超過 1 分鐘時，SDK 每次檢查租約（約每 4 秒、每個分頁）都會再記一次，同一頁會連續記到時鐘恢復為止
 * （2026-10-22 JAVASCRIPT-REACT-13：同一台電腦 4 個分頁、差約 25 秒，29 分鐘記了 500 筆）。
 * 同一頁只回報第一筆、附上差距秒數，其餘略過，避免吃光事件額度。
 * 降為 warning：訪客自己的時鐘問題站方修不到，只留在固定 issue 觀察人數，不觸發 high priority 告警信。
 */
export function createFirestoreClockSkewClassifier() {
  let reported = false;
  return (event: SentryEvent): SentryEvent | null => {
    const aheadMs = firestoreFutureUpdateAheadMs(event);
    if (aheadMs === null) return event;
    if (aheadMs <= FIRESTORE_TAB_CLOCK_JITTER_MS || reported) return null;
    reported = true;
    event.level = 'warning';
    event.fingerprint = ['firestore-future-update-time'];
    event.tags = { ...event.tags, firestoreClockSkew: 'ahead' };
    event.extra = { ...event.extra, clockAheadSeconds: Math.round(aheadMs / 1000) };
    return event;
  };
}

/**
 * 前端會自行復原、或只是訪客網路中斷的事件：不是站方 bug，送進 Sentry 只會觸發告警。
 * - 部署換 chunk hash 後舊分頁載入動態模組 404：main.tsx / App.tsx / ErrorBoundary 會自動重新載入
 * - 裝置離線、休眠或頁面重新載入時中斷連線：Firebase SDK 會自動重連
 * 權限不足、索引錯誤等其他 Firebase 錯誤不在此列，照常回報。
 */
const RECOVERABLE_CLIENT_NOISE: readonly RegExp[] = [
  ...CHUNK_LOAD_ERROR_PATTERNS,
  /\(auth\/network-request-failed\)/,
  /@firebase\/firestore:\s+Firestore \(\d+\.\d+\.\d+\): Could not reach Cloud Firestore backend\./,
  /@firebase\/firestore:\s+Firestore \(\d+\.\d+\.\d+\): WebChannelConnection RPC '\w+' stream 0x[0-9a-f]+ transport errored\./,
  // 連不上後端、本機快取又沒有該文件時 getDoc 的錯誤（code: unavailable）
  /Failed to get document because the client is offline\./,
  // App Check 連不上網路（例如電腦剛從睡眠喚醒）；fetch-status-error、throttled、reCAPTCHA 錯誤仍回報
  /\(appCheck\/fetch-network-error\)/,
  // SDK 偵測到 iOS 12.2 時固定印出的提醒，不是錯誤；2026 年已無真人用 iOS 12.2，
  // 實際來源是偽裝 UA 的爬蟲（2026-11-11 JAVASCRIPT-REACT-23：Chrome 73 / iOS 12.2，Council Bluffs 機房）
  /Firestore persistence suffers from a bug in iOS 12\.2 Safari/,
];

function eventTexts(event: SentryEvent): string[] {
  const texts = [
    event.message,
    ...(event.exception?.values ?? []).map((value) => `${value.type ?? ''}: ${value.value ?? ''}`),
  ];
  return texts.filter((text): text is string => !!text);
}

export function isRecoverableClientNoise(event: SentryEvent): boolean {
  return eventTexts(event).some((text) => RECOVERABLE_CLIENT_NOISE.some((pattern) => pattern.test(text)));
}

/**
 * 自動化瀏覽器（Playwright 截圖、Lighthouse 量測等）會被 reCAPTCHA 判為機器人：
 * App Check 回 403 並鎖 24 小時，接著出現 throttled 與「App Check 尚未通過」改用本機計數。
 * 這是 App Check 正常擋下機器人，只在自動化瀏覽器上略過；真人瀏覽器的 403 代表設定出錯，照常回報。
 */
const APP_CHECK_REJECTION = /\(appCheck\/(?:fetch-status-error|initial-throttle|throttled)\)|App Check 尚未通過/;

export function isAutomatedBrowser(nav: Pick<Navigator, 'webdriver' | 'userAgent'>): boolean {
  return nav.webdriver === true || /\bHeadlessChrome\//.test(nav.userAgent);
}

export function isAppCheckRejection(event: SentryEvent): boolean {
  return eventTexts(event).some((text) => APP_CHECK_REJECTION.test(text));
}

/**
 * App Check 換權杖遇到 403／404 以外的錯誤（例如 401、5xx）時，SDK 只暫停幾秒就自動重試（指數退避）；
 * 403／404 才會鎖一天。2026-10-14 JAVASCRIPT-REACT-14／15：一支 iPhone 在 0.1 秒內記下 9 筆 401，之後沒有再失敗。
 * 只略過「1 分鐘內就會重試」的退避；持續失敗時退避會超過 1 分鐘，且統計回填失敗會另外記錄，照常回報。
 */
const APP_CHECK_SHORT_RETRY = /AppCheck: (?:Requests throttled due to previous )?(\d{3}) error\. Attempts allowed again after 00m:\d{2}s \(appCheck\/(?:initial-throttle|throttled)\)/;

export function isAppCheckShortRetry(event: SentryEvent): boolean {
  return eventTexts(event).some((text) => {
    const status = text.match(APP_CHECK_SHORT_RETRY)?.[1];
    return status !== undefined && status !== '403' && status !== '404';
  });
}

/**
 * App Check 換權杖被拒（403／404）後 SDK 會鎖一天，之後每次自動換權杖都再記一筆「throttled」，
 * 而且訊息開頭帶時間戳、倒數秒數也不同，Sentry 每筆都開成新的 issue、各發一次告警
 * （2026-10-23 JAVASCRIPT-REACT-18～1A：同一位訪客 7 分鐘內 1 筆 403 加 4 筆 throttled）。
 * 同一頁只回報第一筆，固定歸到同一個 issue；其餘略過。真人被擋仍會收到一次通知。
 */
const APP_CHECK_LOCKED = /AppCheck: (?:Requests throttled due to previous )?(?:403|404) error\. Attempts allowed again after [^(]*\(appCheck\/(initial-throttle|throttled)\)/;

export function createAppCheckLockClassifier() {
  let reported = false;
  return (event: SentryEvent): SentryEvent | null => {
    const match = eventTexts(event).map((text) => text.match(APP_CHECK_LOCKED)).find(Boolean);
    if (!match) return event;
    if (reported) return null;
    reported = true;
    event.fingerprint = ['app-check-locked'];
    event.tags = { ...event.tags, appCheckLock: match[1] };
    return event;
  };
}

/**
 * App Check 換權杖一直遇到 401、5xx 等錯誤：退避超過 1 分鐘代表持續失敗，該照常回報，
 * 但 SDK 每次重試都再記一筆，且訊息帶時間戳與倒數，Sentry 每筆各開一個 issue、各發一次告警
 * （2026-11-04 JAVASCRIPT-REACT-1J～1M：同一台 Mac Safari 開著 /tool/134，每 16 分鐘一筆 401，退避 1→2→4→6 分鐘）。
 * 同一頁只回報第一筆，依狀態碼歸到固定 issue；其餘略過。1 分鐘內的短暫退避已由 isAppCheckShortRetry 略過，403／404 由鎖定分類處理。
 */
const APP_CHECK_RETRY_FAILING = /AppCheck: (?:Requests throttled due to previous )?(\d{3}) error\. Attempts allowed again after [^(]*\(appCheck\/(?:initial-throttle|throttled)\)/;

export function createAppCheckRetryFailingClassifier() {
  let reported = false;
  return (event: SentryEvent): SentryEvent | null => {
    const status = eventTexts(event).map((text) => text.match(APP_CHECK_RETRY_FAILING)?.[1]).find(Boolean);
    if (!status || status === '403' || status === '404') return event;
    if (reported) return null;
    reported = true;
    event.fingerprint = ['app-check-retry-failing', status];
    event.tags = { ...event.tags, appCheckRetryStatus: status };
    return event;
  };
}

/**
 * Firestore 即時連線（WebChannel）被關閉時，SDK 內部中止請求、留下沒人接的 AbortError。
 * 連線一直被切斷的網路（防毒軟體、網路過濾）上，SDK 每次重連都再記一筆
 * （2026-10-25 JAVASCRIPT-REACT-1B／1C：同一位訪客在首頁 17 分鐘記了 1000 筆）。
 * 這是 SDK 自己會重連的內部狀況；同一頁只回報第一筆、固定歸到同一個 issue，其餘略過。
 */
export function isFirestoreStreamAbort(event: SentryEvent): boolean {
  return (event.exception?.values ?? []).some((value) =>
    value.type === 'AbortError'
    && value.value === 'signal is aborted without reason'
    && (value.stacktrace?.frames ?? []).some((frame) => /vendor-firebase/.test(frame.filename ?? '')));
}

export function createFirestoreStreamAbortClassifier() {
  let reported = false;
  return (event: SentryEvent): SentryEvent | null => {
    if (!isFirestoreStreamAbort(event)) return event;
    if (reported) return null;
    reported = true;
    event.level = 'warning';
    event.fingerprint = ['firestore-stream-abort'];
    return event;
  };
}

/**
 * 瀏覽器自己的 IndexedDB 連線斷了：Mac 睡眠喚醒、分頁在背景太久、關分頁中途，瀏覽器會把資料庫程序關掉，
 * 舊分頁接著存取就失敗，重新整理即恢復（2026-11-06／07 三則：Safari 的 Connection lost、
 * App Check 寫不進權杖、Chrome 的 database connection is closing，分別在 /tool/134、首頁、部落格文章）。
 * 不是站方程式錯誤，但若哪天是程式改壞，會是很多訪客同時發生；所以不略過，
 * 同一頁只回報第一筆、固定歸到同一個 issue（Sentry 仍會累計影響人數），其餘略過。
 */
const BROWSER_STORAGE_LOST = [
  /Connection to Indexed Database server lost/i,
  /Failed to (?:write|read) token (?:to|from) IndexedDB/i,
  /The database connection is closing/i,
  // Firestore 開啟離線快取資料庫時被瀏覽器中止（2026-11-17 JAVASCRIPT-REACT-2J：iPhone Chrome，
  // 首頁閒置 23 秒後切回來，'createOrUpgrade' 交易 AbortError，SDK 回報 code=unavailable）
  // 交易名稱可能有空白（'Locally write mutations'、'Allocate target'），用 [^']+ 而不是 [\w-]+
  /IndexedDB transaction '[^']+' failed: AbortError/i,
  // 分頁在背景很久後切回，資料庫還在但裡面的資料表不見了：Firestore 每個查詢都報這句
  // （2026-11-21 JAVASCRIPT-REACT-2S／2T／2V／2W：iPhone Chrome，iOS 17.6.1，閒置 34 分鐘後切回，
  //   先 createOrUpgrade AbortError，接著每張工具卡片各自讀收藏都失敗，同一秒 40 筆）
  /IndexedDB transaction '[^']+' failed: NotFoundError: .*object stores? (?:was|were) not found/i,
  // 同一件事的 Safari／WebKit 說法（沒有 Firestore 包裝，直接是未處理的 InvalidStateError）
  // （2026-11-21 JAVASCRIPT-REACT-30：iPhone 臉書內建瀏覽器，iOS 27.0.1，先 createOrUpgrade AbortError 再丟這句）
  /Object store cannot be found in the database/i,
  // 網頁開著時，App 內建瀏覽器或 iOS 把這個網站的資料庫整個刪掉（清除網站資料、系統回收空間）；
  // SDK 先印 app/idb-get 讀取失敗，再丟出沒人接住的 UnknownError（2026-11-21 JAVASCRIPT-REACT-2P：iPhone WKWebView，iOS 26.2）
  /Database deleted by request of the user/i,
];

export function isBrowserStorageLost(event: SentryEvent): boolean {
  return eventTexts(event).some((text) => BROWSER_STORAGE_LOST.some((pattern) => pattern.test(text)));
}

export function createBrowserStorageLostClassifier() {
  let reported = false;
  return (event: SentryEvent): SentryEvent | null => {
    if (!isBrowserStorageLost(event)) return event;
    if (reported) return null;
    reported = true;
    event.level = 'warning';
    event.fingerprint = ['browser-indexeddb-lost'];
    event.tags = { ...event.tags, browserStorage: 'indexeddb-lost' };
    return event;
  };
}

/**
 * App 內建瀏覽器（Facebook、Instagram 等）自己注入的監測腳本出錯，不經過站方程式碼，站方也修不到。
 * - Android 版：堆疊全是 iabjs:// 開頭（2026-11-07 JAVASCRIPT-REACT-21：Facebook 585，
 *   離開部落格文章時 sendBeforeUnloadMessage 回報「Java object is gone」）。
 * - iPhone 版：腳本直接插在頁面裡，堆疊檔名是頁面網址，但出錯的函式同樣是 sendDataToNative
 *   （2026-11-12 JAVASCRIPT-REACT-2B：iOS 26.6.2 WKWebView 在首頁 sendPageHideMessage 時
 *   「window.webkit.messageHandlers」不存在）。
 * - iPhone 版的注入腳本也可能是壓縮過的，函式名變成 T、M（2026-11-17 JAVASCRIPT-REACT-2K：iOS 26.5.2 WKWebView，
 *   同樣是「window.webkit.messageHandlers」不存在），函式名對不上。改看位置：每一層都在「頁面本身的第 1 行」。
 *   站方每個頁面（首頁、/tool/N/、/blog/、/wish/）第 1 行都只有 <!DOCTYPE html>，站方程式不可能在那裡執行；
 *   只有 App 從外面塞進來執行的腳本才會被記在頁面第 1 行（2026-11-18 核對正式站四類頁面）。
 * 略過條件：每一層堆疊都來自 iabjs://；或丟錯的那一層是這組注入函式、且堆疊裡沒有站方 /assets/ 檔案；
 * 或每一層都在頁面本身的第 1 行。只要有一層是站方打包的程式就照常回報。站內沒有同名函式（2026-11-13 核對）。
 */
const IN_APP_BROWSER_INJECTED_FUNCTIONS = new Set([
  'sendDataToNative',
  'sendPageHideMessage',
  'sendBeforeUnloadMessage',
]);

export function isInAppBrowserInjectedError(event: SentryEvent): boolean {
  const values = event.exception?.values ?? [];
  if (!values.length) return false;
  return values.every((value) => {
    const frames = value.stacktrace?.frames ?? [];
    if (!frames.length) return false;
    if (frames.every((frame) => /^iabjs:\/\//.test(frame.filename ?? ''))) return true;
    if (frames.every((frame) => /^user-script:\d+/.test(frame.filename ?? ''))) return true;
    if (frames.every(isPageDocumentFirstLine)) return true;
    const thrower = frames[frames.length - 1];
    return IN_APP_BROWSER_INJECTED_FUNCTIONS.has(thrower.function ?? '')
      && frames.every((frame) => !/\/assets\//.test(frame.filename ?? ''));
  });
}

/**
 * iPhone App 用 WKUserScript 塞進網頁的腳本，Safari 在堆疊裡記成 `user-script:N`（不是網址）。
 * 每一層都在這種腳本裡＝App 自己的功能出錯，不經過站方程式（2026-11-21 JAVASCRIPT-REACT-2R：
 * iOS 18.7 WKWebView，App 的「整頁存檔」功能下載 281 個資源，丟出「Stylesheet append timeout」，堆疊只有 @user-script:5:2:256382）。
 * 只要有一層是站方檔案（/assets/…）就不算，照常回報。
 */
export function isInjectedUserScriptError(error: unknown): boolean {
  const stack = (error as { stack?: unknown } | null)?.stack;
  if (typeof stack !== 'string') return false;
  const lines = stack.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  // Sentry 自己包在計時器／事件外面的那一層（sentryClient-*.js 的 r）只是轉手，不算站方程式
  // （2026-11-21 JAVASCRIPT-REACT-2X：同一個 App 功能，堆疊多了「r@…/assets/sentryClient-l-MXlPvf.js:15:7052」，v3.6.240 的規則認不出）
  return lines.some((line) => USER_SCRIPT_FRAME.test(line))
    && lines.every((line) => USER_SCRIPT_FRAME.test(line) || SENTRY_WRAPPER_FRAME.test(line));
}

/**
 * Promise 被拒絕卻沒帶任何原因（undefined／null）：沒有訊息、沒有堆疊、也沒有麵包屑，無從追查是誰丟的。
 * Sentry 內建的全域攔截本來就忽略這種（ignoreErrors 'Non-Error promise rejection captured'），
 * 但 main.tsx 自己的 unhandledrejection 又手動 captureException 一次，變成「Error: undefined」寄高優先信
 * （2026-11-21 JAVASCRIPT-REACT-2Y：iPhone Safari，首頁，1 次）。站方程式丟錯一定帶 Error 物件，不受影響。
 */
export function isEmptyRejectionReason(reason: unknown): boolean {
  return reason === undefined || reason === null;
}

const USER_SCRIPT_FRAME = /(?:^|@)user-script:\d+/;
const SENTRY_WRAPPER_FRAME = /\/assets\/sentryClient-[\w-]+\.js:\d+:\d+$/;

/**
 * 堆疊這一層記在「頁面本身」的第 1 行。頁面網址都以 / 或 .html 結尾（/Akai/、/Akai/tool/10/）；
 * 腳本檔不一定以 .js 結尾（Google 統計是 …/gtag/js?id=…），所以只認頁面樣式的網址。
 */
function isPageDocumentFirstLine(frame: { filename?: string; lineno?: number }): boolean {
  const path = (frame.filename ?? '').split(/[?#]/)[0];
  return frame.lineno === 1
    && !/\/assets\//.test(path)
    && /(?:\/|\.html)$/.test(path);
}

/**
 * 爬蟲／掃描用的沙箱瀏覽器把新建的 Error 物件鎖成不可擴充，連 `err.code =`、`err.name =` 都會丟 TypeError：
 * Firestore 建立自己的錯誤時失敗、接著內部斷言 b815 連鎖出錯，站方 safeDiagnostic 重建錯誤時也失敗
 * （2026-11-11 JAVASCRIPT-REACT-24～29：10 秒內 6 則，Edge 138 與 iOS 12.2 輪流出現，
 * 全來自 Council Bluffs 機房、時區 Etc/Unknown）。真人瀏覽器的時區都辨識得出來，
 * 只略過「時區 Etc/Unknown 且是不可擴充錯誤」的事件；真人遇到同樣錯誤照常回報。
 */
const NON_EXTENSIBLE_ERROR = /Cannot add property \w+, object is not extensible/;

export function isFrozenErrorSandbox(event: SentryEvent): boolean {
  const timezone = (event.contexts?.culture as { timezone?: unknown } | undefined)?.timezone;
  if (timezone !== 'Etc/Unknown') return false;
  return eventTexts(event).some((text) => NON_EXTENSIBLE_ERROR.test(text));
}

const NETWORK_RECOVERY_GRACE_MS = 15_000;
const SLEEP_CHECK_INTERVAL_MS = 15_000;
// 背景分頁的計時器最慢約每分鐘執行一次，超過兩分鐘沒執行才視為裝置曾睡眠
const SLEEP_GAP_MS = 120_000;

interface NetworkTrackerOptions {
  now?: () => number;
  isOnline?: () => boolean;
  /** 分頁目前是否在背景（預設看 document.visibilityState） */
  isHidden?: () => boolean;
  /** visibilitychange 事件掛在 document 上，不是 window（預設用 document） */
  visibilityTarget?: Pick<EventTarget, 'addEventListener'>;
  every?: (callback: () => void, ms: number) => unknown;
}

/**
 * 網路暫時不可靠的時段，這段期間被中止的請求是訪客端連線問題，不是後端錯誤：
 * - 頁面卸載（重新整理、套用 PWA 更新、關閉分頁）：瀏覽器先觸發 pagehide 再中止進行中的請求。
 *   不用 beforeunload：它會讓 Firefox 停用 back/forward cache。
 * - 裝置離線，或剛恢復連線、剛從睡眠喚醒的 15 秒內。睡眠時計時器會停擺，以此偵測喚醒。
 * - 分頁在背景，或剛回到前景的 15 秒內：手機按「立即使用」會先開新分頁，原分頁被切到背景，
 *   iOS 會暫停背景分頁、中斷送出中的請求；請求的失敗常在使用者回到原分頁時才被處理。
 */
export function createUnreliableNetworkTracker(
  target: Pick<EventTarget, 'addEventListener'>,
  {
    now = () => Date.now(),
    isOnline = () => navigator.onLine,
    isHidden = () => typeof document !== 'undefined' && document.visibilityState === 'hidden',
    visibilityTarget = typeof document !== 'undefined' ? document : undefined,
    every = (callback, ms) => setInterval(callback, ms),
  }: NetworkTrackerOptions = {},
) {
  let unloading = false;
  let recoveredAt = -Infinity;
  let lastTick = now();
  target.addEventListener('pagehide', () => { unloading = true; });
  // 從 back/forward cache 還原時頁面又恢復運作
  target.addEventListener('pageshow', () => { unloading = false; });
  target.addEventListener('online', () => { recoveredAt = now(); });
  // 回到前景視為剛恢復：背景期間被凍結的請求，失敗結果常在這時才浮現
  visibilityTarget?.addEventListener('visibilitychange', () => { if (!isHidden()) recoveredAt = now(); });
  every(() => {
    const tick = now();
    if (tick - lastTick > SLEEP_GAP_MS) recoveredAt = tick;
    lastTick = tick;
  }, SLEEP_CHECK_INTERVAL_MS);
  return () => unloading || isHidden() || !isOnline() || now() - recoveredAt < NETWORK_RECOVERY_GRACE_MS;
}

/** 首頁、工具頁與 toolLoader 載入工具資料失敗時丟出的訊息 */
const TOOL_DATA_FETCH_FAILURE = '無法獲取工具數據';

/**
 * 被瀏覽器中止或連不上網路的請求：Firebase callable 把失敗的 fetch 回報成 `functions/internal`、訊息為小寫 "internal"
 * （後端未處理例外回的是大寫 "INTERNAL"，不在此列）；原生 fetch 則是各瀏覽器的 TypeError。
 */
export function isAbortedRequestError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const code = (error as { code?: unknown }).code;
  // Firebase SDK 自己產生的錯誤（全是固定的小寫／英文字串；後端真的回錯會帶後端訊息，不會命中）：
  //   internal：請求送不出去或被中斷
  //   Response is not valid JSON object.：回應沒收完整（2026-11-16 JAVASCRIPT-REACT-2F，Android 三星瀏覽器，後端 4 筆全是 200）
  if (code === 'functions/internal') return error.message === 'internal' || error.message === 'Response is not valid JSON object.';
  // SDK 70 秒計時器到點：分頁切到背景、iOS 暫停連線，切回來才觸發（JAVASCRIPT-REACT-2E）
  if (code === 'functions/deadline-exceeded') return error.message === 'deadline-exceeded';
  // 網路剛恢復、Auth 換不到新權杖，統計請求被後端當成未登入（見 publicAnalyticsService 的 TOKEN_UNAVAILABLE_CODE）
  if ((error as { code?: unknown }).code === 'analytics/token-unavailable') return true;
  // 工具資料靜態檔與備援 API 都沒成功回應：連不上網路時 Service Worker 會回合成的 503「離線中」，兩條路一起失敗
  if (error.message === TOOL_DATA_FETCH_FAILURE) return true;
  // Safari 會在訊息後面加上主機名，例如 "Load failed (cagoooo.github.io)"（2026-11-17 JAVASCRIPT-REACT-2G，iPad iOS 15.8）
  return error.name === 'TypeError'
    && /^(?:Failed to fetch|Load failed|NetworkError when attempting to fetch resource\.)(?: \([^()]*\))?$/.test(error.message);
}

const UNHANDLED_REJECTION_MECHANISM = 'auto.browser.global_handlers.onunhandledrejection';

/**
 * 沒有人接住的連線中斷：例如 Vite 預先下載程式分塊（modulepreload）的 fetch 沒寫 catch，
 * 斷線時就變成未處理的 Promise 錯誤。真正載入分塊時若也失敗，由 chunkRecovery 自動重新整理接手，
 * 這筆預先下載的失敗對使用者沒有影響（JAVASCRIPT-REACT-2G）。
 */
export function isUnhandledNetworkRejection(event: SentryEvent, originalException: unknown): boolean {
  const mechanism = event.exception?.values?.[0]?.mechanism?.type;
  return mechanism === UNHANDLED_REJECTION_MECHANISM && isAbortedRequestError(originalException);
}

let sentry: SentryModule | null = null;
let scheduled = false;
const pending: Array<(s: SentryModule) => void> = [];

function whenReady(fn: (s: SentryModule) => void) {
  if (sentry) fn(sentry);
  else if (scheduled && pending.length < 50) pending.push(fn);
}

// Sentry 載入前的全域錯誤：先記下來，就緒後補送（之後由 Sentry 自己的 handler 接手）
function onEarlyError(event: ErrorEvent) {
  const err = event.error ?? event.message;
  whenReady((s) => s.captureException(err, { extra: { source: 'early-window-error' } }));
}

export function initSentry() {
  if (scheduled) return;
  if (typeof window === 'undefined') return;

  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  const isDev = import.meta.env.DEV;
  const release = (import.meta.env.VITE_APP_VERSION as string | undefined) || 'unknown';

  // 沒 DSN 或本地開發就不啟用（保險）
  if (!dsn) {
    console.info('[Sentry] DSN 未設定，跳過初始化（VITE_SENTRY_DSN 環境變數）');
    return;
  }
  if (isDev) {
    console.info('[Sentry] 本地開發模式，跳過初始化');
    return;
  }
  // CI 的 E2E（vite preview）與本機量測跑的是帶 DSN 的正式建置，
  // 其中有刻意製造失敗的測試，不能讓它們進正式 Sentry、吃掉事件額度
  if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname)) {
    console.info('[Sentry] 本機網址，跳過初始化');
    return;
  }

  scheduled = true;
  window.addEventListener('error', onEarlyError);
  const isNetworkUnreliable = createUnreliableNetworkTracker(window);

  const load = async () => {
    try {
      const Sentry = await import('./sentryClient');
      const classifyFirestoreLease = createFirestoreLeaseClassifier();
      const classifyFirestoreClockSkew = createFirestoreClockSkewClassifier();
      const classifyAppCheckLock = createAppCheckLockClassifier();
      const classifyAppCheckRetryFailing = createAppCheckRetryFailingClassifier();
      const classifyFirestoreStreamAbort = createFirestoreStreamAbortClassifier();
      const classifyBrowserStorageLost = createBrowserStorageLostClassifier();
      const automated = isAutomatedBrowser(navigator);
      Sentry.init({
        dsn,
        release: `akai@${release}`,
        environment: 'production',

        // 只做錯誤回報：2026-09-23 拿掉 session replay 與 browser tracing
        // （錄影器持續記錄 DOM 變動、效能追蹤也吃 CPU，正式站啟用後長任務約翻倍）
        integrations: [
          Sentry.captureConsoleIntegration({
            levels: ['error', 'warn'], // 把 console.warn 也送過去 — 抓隱性 bug 的關鍵
          }),
        ],

        // 攔截一些不重要的雜訊
        ignoreErrors: [
          'ResizeObserver loop limit exceeded',
          'Non-Error promise rejection captured',
          // 第三方腳本錯誤、瀏覽器擴充
          /extension\//i,
          /^chrome-extension:\/\//,
          /^moz-extension:\/\//,
        ],

        // 過濾 referrer 含敏感資訊
        beforeSend(event, hint) {
          // 移除可能含 PII 的欄位
          if (event.request?.cookies) delete event.request.cookies;
          if (isRecoverableClientNoise(event)) return null;
          if (isInAppBrowserInjectedError(event)) return null;
          if (isInjectedUserScriptError(hint.originalException)) return null;
          if (isFrozenErrorSandbox(event)) return null;
          if (isAppCheckShortRetry(event)) return null;
          if (automated && isAppCheckRejection(event)) return null;
          // 例如按下「更新」後重新整理、離線或剛喚醒時，請求被瀏覽器中止或連不上，並非後端錯誤
          if (isNetworkUnreliable() && isAbortedRequestError(hint.originalException)) return null;
          if (isUnhandledNetworkRejection(event, hint.originalException)) return null;
          const lockChecked = classifyAppCheckLock(event);
          if (!lockChecked) return null;
          if (!classifyAppCheckRetryFailing(lockChecked)) return null;
          if (!classifyFirestoreStreamAbort(lockChecked)) return null;
          if (!classifyBrowserStorageLost(lockChecked)) return null;
          const skewChecked = classifyFirestoreClockSkew(lockChecked);
          return skewChecked && classifyFirestoreLease(skewChecked);
        },
      });

      sentry = Sentry;
      window.removeEventListener('error', onEarlyError);
      pending.splice(0).forEach((fn) => fn(Sentry));
      console.info(`[Sentry] ✅ 初始化成功（release: akai@${release}）`);
    } catch (err) {
      scheduled = false;
      pending.length = 0;
      window.removeEventListener('error', onEarlyError);
      console.warn('[Sentry] 初始化失敗:', err);
    }
  };

  // 等頁面 load 完、主執行緒閒下來才載入（最多再等 5 秒）
  const idle = () => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(() => void load(), { timeout: 5000 });
    else setTimeout(() => void load(), 2000);
  };
  if (document.readyState === 'complete') idle();
  else window.addEventListener('load', idle, { once: true });
}

/** 手動回報例外（適合 try/catch 區塊） */
export function captureException(err: unknown, context?: Record<string, any>) {
  whenReady((s) => s.captureException(err, context ? { extra: context } : undefined));
}

/** 留下行為麵包屑（追蹤路徑用） */
export function addBreadcrumb(message: string, category = 'app', data?: Record<string, any>) {
  whenReady((s) => s.addBreadcrumb({ message, category, data, level: 'info' }));
}

/** 標記目前使用者（匿名身份也可以用 uid 識別） */
export function setUser(user: { id?: string; isAnonymous?: boolean } | null) {
  whenReady((s) => {
    if (!user) {
      s.setUser(null);
    } else {
      s.setUser({
        id: user.id,
        // 不要送 email/name 進 Sentry，保持匿名
        segment: user.isAnonymous ? 'anonymous' : 'authenticated',
      });
    }
  });
}
