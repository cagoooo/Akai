/**
 * 錯誤告警分級與收斂政策（P1-4，2026-07-28）
 *
 * 背景：v3.6.100 只擋掉了「本機開發」的噪音，正式站仍是**一顆錯誤一則 Google Chat**。
 * 同一個 bug 在 100 個訪客身上發生就是 100 則通知 → 通知疲勞 → 真事件被淹沒。
 *
 * 這裡是純函式層（不碰 Firestore、不碰網路），方便單獨測試：
 *   1. fingerprintError — 把「同一個 bug」收斂成同一個指紋
 *   2. classifySeverity — critical / warn / info 三級
 *   3. isKnownNoise      — 瀏覽器擴充套件、跨網域 script error 等第三方雜訊
 *   4. shouldNotify      — 依嚴重度決定同指紋的推播間隔
 */

export type AlertSeverity = "critical" | "warn" | "info";

export interface ErrorLogInput {
    level?: string;
    message?: string;
    stack?: string;
    componentStack?: string;
    url?: string;
    userAgent?: string;
    /** DOMException/Error.name，如 "AbortError"。結構化欄位，不受瀏覽器措辭影響 */
    name?: string;
}

/** 同指紋的推播間隔（毫秒）。info 不推播，只累積次數。 */
export const NOTIFY_WINDOW_MS: Record<AlertSeverity, number | null> = {
    critical: 15 * 60 * 1000,
    warn: 60 * 60 * 1000,
    info: null,
};

/**
 * 已知的第三方雜訊：不是我們的程式壞掉，推了也沒有人能修。
 * 仍會寫進 errorLogs 留存，只是不推播。
 */
const NOISE_MESSAGE_PATTERNS: readonly RegExp[] = [
    /ResizeObserver loop/i,
    /^Script error\.?$/i,
    /Non-Error promise rejection captured/i,
    /Failed to fetch dynamically imported module/i, // 已由 self-heal 處理
    /Importing a module script failed/i,
    /NetworkError when attempting to fetch resource/i,
    /^Load failed$/i, // Safari 網路中斷
    /The operation was aborted/i,
    /signal is aborted without reason/i, // Firestore watch stream 內部關閉時的 Chrome 新版措辭
    /AbortError/i,
    /Extension context invalidated/i,
];

/** 堆疊或網址出現這些來源＝來自瀏覽器擴充套件，不是站方程式碼 */
const NOISE_SOURCE_PATTERNS: readonly RegExp[] = [
    /chrome-extension:\/\//i,
    /moz-extension:\/\//i,
    /safari-web-extension:\/\//i,
    /^webkit-masked-url:/i,
];

export function isKnownNoise(input: ErrorLogInput): boolean {
    // 結構化判斷優先：name 是瀏覽器標準化的錯誤類型，不像 message 措辭會隨版本改變。
    // 下面的 message regex 仍保留，作為 name 欄位缺席（舊版前端快取、非 Error 物件）時的備援。
    if (input.name === "AbortError") return true;

    const message = input.message ?? "";
    if (NOISE_MESSAGE_PATTERNS.some((pattern) => pattern.test(message))) return true;

    const haystack = `${input.stack ?? ""}\n${input.url ?? ""}`;
    return NOISE_SOURCE_PATTERNS.some((pattern) => pattern.test(haystack));
}

/**
 * 嚴重度分級：
 * - critical：ErrorBoundary 攔到的 React 崩潰（有 componentStack）＝訪客看到白畫面
 * - warn    ：未處理的 promise rejection 或一般 error（功能壞掉但畫面還在）
 * - info    ：明確標為 info／warn 的記錄
 */
export function classifySeverity(input: ErrorLogInput): AlertSeverity {
    const level = (input.level ?? "error").toLowerCase();
    if (level === "info") return "info";
    if (level === "warn") return "info"; // warn 級別只留存，併進每日摘要
    if (input.componentStack && input.componentStack.trim().length > 0) return "critical";
    return "warn";
}

/**
 * 把訊息正規化，讓「同一個 bug 的不同實例」收斂成同一個指紋：
 * 去掉數字、UUID、網址、引號內容等每次都不同的部分。
 */
export function normalizeMessage(message: string): string {
    return message
        .replace(/https?:\/\/\S+/g, "<url>")
        .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, "<uuid>")
        .replace(/\b[0-9a-f]{16,}\b/gi, "<hash>")
        .replace(/\d+/g, "<n>")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 200);
}

/** 取堆疊前 N 行的「函式＋檔名」，去掉行號與 build hash（每次部署都會變） */
function normalizeStackFrames(stack: string, frames = 3): string {
    return stack
        .split("\n")
        .slice(1, frames + 1)
        .map((line) =>
            line
                .trim()
                .replace(/https?:\/\/[^\s)]+/g, (match) => {
                    const file = match.split("/").pop() ?? "";
                    // assets/index-a1b2c3d4.js → index.js（build hash 每次部署都變，不能進指紋）
                    return file.replace(/-[0-9a-z]{6,}\.(js|mjs|css)/i, ".$1").replace(/[?#].*$/, "");
                })
                .replace(/:\d+:\d+/g, ""),
        )
        .join("|");
}

/** 簡單穩定的 32-bit hash（不需要密碼學強度，只要同輸入同輸出） */
function hash(input: string): string {
    let h = 2166136261;
    for (let i = 0; i < input.length; i += 1) {
        h ^= input.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(36);
}

/**
 * 錯誤指紋：正規化訊息 ＋ 堆疊前 3 幀。
 * 同一個 bug 不論發生在哪個訪客、哪個網址、哪一版 build，都會得到同一個指紋。
 */
export function fingerprintError(input: ErrorLogInput): string {
    const message = normalizeMessage(input.message ?? "unknown");
    const frames = input.stack ? normalizeStackFrames(input.stack) : "";
    return hash(`${message}::${frames}`);
}

export interface NotifyDecisionInput {
    severity: AlertSeverity;
    /** 這個指紋上次推播的時間（毫秒）；從未推播傳 undefined */
    lastNotifiedAt?: number;
    now: number;
}

/**
 * 是否要推播這一則。
 * info 一律不推；其餘同指紋在各自的時間窗內只推一次。
 */
export function shouldNotify({ severity, lastNotifiedAt, now }: NotifyDecisionInput): boolean {
    const window = NOTIFY_WINDOW_MS[severity];
    if (window === null) return false;
    if (lastNotifiedAt === undefined) return true;
    return now - lastNotifiedAt >= window;
}

export const SEVERITY_LABEL: Record<AlertSeverity, string> = {
    critical: "🔴 嚴重（訪客可能看到白畫面）",
    warn: "🟠 警告（功能異常但畫面還在）",
    info: "⚪ 訊息（僅留存）",
};
