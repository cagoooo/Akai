/**
 * Firebase Anonymous Auth Health Check（v3.6.53）
 *
 * 為什麼存在：
 *   Firebase Console 的「Authentication → Sign-in method → Anonymous」provider
 *   會在不明情況下被改回關閉狀態（2026-04 / 2026-05 已發生兩次）。
 *   一旦被關，所有訪客的 `signInAnonymously()` 會拋錯，
 *   後續 Firestore 寫入因 `request.auth == null` 被 rules 全擋光。
 *
 * 機制：
 *   1. 排程：每天 02:00 (Asia/Taipei)
 *      （在 dailySnapshot 03:00 之前跑，分流）
 *   2. 用 admin SDK 取 access token 呼叫 Identity Toolkit Admin API
 *   3. GET /admin/v2/projects/{pid}/config 讀 signIn.anonymous.enabled
 *   4. 若為 false → PATCH 設回 true + 推 LINE 告警（含修復狀態）
 *   5. 若為 true → 安靜寫一筆健康日誌不打擾
 *   6. API 失敗 → 推 LINE 告警（提醒人工檢查）
 *
 * 另外提供 onCall：verifyAnonAuthNow（admin only）給後台手動觸發。
 *
 * 健康日誌寫入 analytics/anonAuthHealth/checks/{YYYY-MM-DD}，
 * 90 天後由 dailySnapshot.pruneOldClickEvents 風格的另一個裁切排程處理（暫不實作）。
 */

import { onSchedule } from "firebase-functions/v2/scheduler";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import axios from "axios";
import { pushFlexToAdmin } from "./lib/lineNotify";

const PROJECT_ID = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || "akai-e693f";
const CONFIG_URL = `https://identitytoolkit.googleapis.com/admin/v2/projects/${PROJECT_ID}/config`;
const SITE_BASE = "https://cagoooo.github.io/Akai";
const CONSOLE_AUTH_URL = `https://console.firebase.google.com/project/${PROJECT_ID}/authentication/providers`;

export interface AnonAuthCheckResult {
    /** 檢查完之後（含可能的修復後）anonymous auth 的最終狀態 */
    enabled: boolean;
    /** 這次有實際做修復動作（檢查時是 false → PATCH 設回 true 成功）*/
    wasFixed: boolean;
    /** API 呼叫失敗時的錯誤訊息（其他情況為 undefined）*/
    error?: string;
    /** 檢查 / 修復發生的 UTC ISO 時間 */
    checkedAt: string;
}

/** 從 admin SDK 取得 OAuth2 access token（給 Identity Toolkit Admin API 用）*/
async function getAccessToken(): Promise<string> {
    const cred = admin.app().options.credential;
    if (!cred) throw new Error("admin.app().options.credential is missing");
    const tok = await cred.getAccessToken();
    if (!tok?.access_token) throw new Error("credential.getAccessToken returned no access_token");
    return tok.access_token;
}

async function readAnonAuthEnabled(): Promise<boolean> {
    const token = await getAccessToken();
    const res = await axios.get(CONFIG_URL, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000,
    });
    return res.data?.signIn?.anonymous?.enabled === true;
}

async function setAnonAuthEnabled(enabled: boolean): Promise<void> {
    const token = await getAccessToken();
    await axios.patch(
        `${CONFIG_URL}?updateMask=signIn.anonymous.enabled`,
        { signIn: { anonymous: { enabled } } },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            timeout: 15000,
        }
    );
}

/** 核心：檢查當前狀態，若被關則自動 PATCH 回來 */
export async function checkAndHealAnonAuth(): Promise<AnonAuthCheckResult> {
    const checkedAt = new Date().toISOString();
    try {
        const enabled = await readAnonAuthEnabled();
        if (enabled) {
            return { enabled: true, wasFixed: false, checkedAt };
        }
        // 被關了，自動修復
        await setAnonAuthEnabled(true);
        // 驗證修復後狀態
        const after = await readAnonAuthEnabled();
        return { enabled: after, wasFixed: after, checkedAt };
    } catch (err: any) {
        const msg = err?.response?.data?.error?.message || err?.message || String(err);
        return { enabled: false, wasFixed: false, error: msg, checkedAt };
    }
}

/** 寫健康日誌（每天一筆，可被覆蓋 — merge 模式累加）*/
async function writeHealthLog(date: string, result: AnonAuthCheckResult): Promise<void> {
    try {
        await admin
            .firestore()
            .doc(`analytics/anonAuthHealth/checks/${date}`)
            .set(
                {
                    date,
                    lastCheckedAt: result.checkedAt,
                    lastEnabled: result.enabled,
                    lastWasFixed: result.wasFixed,
                    lastError: result.error || null,
                    checkCount: admin.firestore.FieldValue.increment(1),
                    fixCount: admin.firestore.FieldValue.increment(result.wasFixed ? 1 : 0),
                },
                { merge: true }
            );
    } catch (err) {
        console.warn("[verifyAnonAuth] writeHealthLog 失敗:", err);
    }
}

/** 構造 LINE Flex bubble — 自動修復成功時 */
function buildFixedBubble(checkedAt: string) {
    return {
        type: "bubble",
        size: "kilo",
        header: {
            type: "box",
            layout: "vertical",
            backgroundColor: "#16a34a",
            paddingAll: "lg",
            contents: [
                { type: "text", text: "🛟 Anonymous Auth 已自動修復", color: "#ffffff", weight: "bold", size: "md" },
                { type: "text", text: "Firestore 訪客寫入恢復正常", color: "#dcfce7", size: "xs", margin: "xs" },
            ],
        },
        body: {
            type: "box",
            layout: "vertical",
            spacing: "md",
            contents: [
                {
                    type: "text",
                    text: "Firebase Anonymous Sign-in provider 被偵測為「關閉」，已透過 Identity Toolkit Admin API 自動 PATCH 回啟用狀態。",
                    wrap: true,
                    size: "sm",
                    color: "#1a1a1a",
                },
                {
                    type: "box",
                    layout: "vertical",
                    spacing: "xs",
                    contents: [
                        { type: "text", text: `🕒 ${new Date(checkedAt).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}`, size: "xs", color: "#4a3a20" },
                        { type: "text", text: `📦 專案 ${PROJECT_ID}`, size: "xs", color: "#4a3a20" },
                    ],
                },
                {
                    type: "text",
                    text: "👉 訪客進站、totalVisits、geoStats 等寫入已恢復。建議檢查 Console 是否有人手動關閉。",
                    wrap: true,
                    size: "xs",
                    color: "#6b5e4a",
                },
            ],
        },
        footer: {
            type: "box",
            layout: "vertical",
            spacing: "sm",
            contents: [
                {
                    type: "button",
                    style: "primary",
                    color: "#ea8a3e",
                    action: { type: "uri", label: "🔧 Firebase Console", uri: CONSOLE_AUTH_URL },
                },
                {
                    type: "button",
                    style: "link",
                    action: { type: "uri", label: "📊 後台儀表板", uri: `${SITE_BASE}/admin` },
                },
            ],
        },
    };
}

/** 構造 LINE Flex bubble — API 呼叫失敗，無法檢查/修復 */
function buildErrorBubble(checkedAt: string, error: string) {
    return {
        type: "bubble",
        size: "kilo",
        header: {
            type: "box",
            layout: "vertical",
            backgroundColor: "#dc2626",
            paddingAll: "lg",
            contents: [
                { type: "text", text: "⚠️ Anonymous Auth 健康檢查失敗", color: "#ffffff", weight: "bold", size: "md" },
                { type: "text", text: "需要人工到 Console 確認", color: "#fee2e2", size: "xs", margin: "xs" },
            ],
        },
        body: {
            type: "box",
            layout: "vertical",
            spacing: "md",
            contents: [
                {
                    type: "text",
                    text: "verifyAnonAuthDaily 排程在呼叫 Identity Toolkit API 時失敗，無法確認目前 anonymous provider 狀態。",
                    wrap: true,
                    size: "sm",
                    color: "#1a1a1a",
                },
                {
                    type: "box",
                    layout: "vertical",
                    spacing: "xs",
                    backgroundColor: "#fef2f2",
                    paddingAll: "md",
                    cornerRadius: "md",
                    contents: [
                        { type: "text", text: "🐛 錯誤訊息", size: "xs", color: "#991b1b", weight: "bold" },
                        { type: "text", text: error.slice(0, 200), wrap: true, size: "xs", color: "#7a1a18" },
                    ],
                },
                { type: "text", text: `🕒 ${new Date(checkedAt).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}`, size: "xs", color: "#4a3a20" },
            ],
        },
        footer: {
            type: "box",
            layout: "vertical",
            spacing: "sm",
            contents: [
                {
                    type: "button",
                    style: "primary",
                    color: "#dc2626",
                    action: { type: "uri", label: "🔧 立即到 Console 檢查", uri: CONSOLE_AUTH_URL },
                },
            ],
        },
    };
}

/** 排程任務：每天 02:00 (Asia/Taipei) 跑一次 */
export const verifyAnonAuthDaily = onSchedule(
    {
        schedule: "0 2 * * *",
        timeZone: "Asia/Taipei",
        region: "asia-east1",
        memory: "256MiB",
        timeoutSeconds: 60,
    },
    async () => {
        const result = await checkAndHealAnonAuth();
        const date = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Taipei",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).format(new Date());

        console.log(`[verifyAnonAuthDaily] ${date}:`, JSON.stringify(result));
        await writeHealthLog(date, result);

        if (result.wasFixed) {
            await pushFlexToAdmin(
                "🛟 Anonymous Auth 已自動修復",
                buildFixedBubble(result.checkedAt),
                "verifyAnonAuthDaily.fixed"
            );
        } else if (result.error) {
            await pushFlexToAdmin(
                "⚠️ Anonymous Auth 健康檢查失敗",
                buildErrorBubble(result.checkedAt, result.error),
                "verifyAnonAuthDaily.error"
            );
        }
        // result.enabled === true && !result.wasFixed → 沒事，安靜
    }
);

/** onCall：admin 後台手動觸發（給「我懷疑現在又被關了」當下立即驗證用）*/
export const verifyAnonAuthNow = onCall(
    {
        region: "asia-east1",
        memory: "256MiB",
        timeoutSeconds: 60,
    },
    async (req): Promise<AnonAuthCheckResult> => {
        if (req.auth?.token?.admin !== true) {
            throw new HttpsError(
                "permission-denied",
                "Only users with admin custom claim can run this check."
            );
        }
        const result = await checkAndHealAnonAuth();
        const date = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Taipei",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).format(new Date());
        await writeHealthLog(date, result);

        // 手動觸發時即使「正常」也想知道，所以 enabled === true && !wasFixed
        // 走前端 UI 自己顯示，不推 LINE 避免噪音
        if (result.wasFixed) {
            await pushFlexToAdmin(
                "🛟 Anonymous Auth 已修復（手動觸發）",
                buildFixedBubble(result.checkedAt),
                "verifyAnonAuthNow.fixed"
            );
        } else if (result.error) {
            await pushFlexToAdmin(
                "⚠️ Anonymous Auth 健康檢查失敗（手動觸發）",
                buildErrorBubble(result.checkedAt, result.error),
                "verifyAnonAuthNow.error"
            );
        }
        return result;
    }
);
