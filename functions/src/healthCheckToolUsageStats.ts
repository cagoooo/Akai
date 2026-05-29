/**
 * healthCheckToolUsageStats — admin only callable
 *
 * 主動掃 toolUsageStats collection 偵測 schema 漂移、異常值，
 * 給 admin dashboard 「🛡️ Schema 健檢」區塊用。
 *
 * v3.6.71：跑完寫一筆進 healthCheckRuns collection（給歷史趨勢圖用）
 *
 * 觸發方式：
 *   1. admin browser console:
 *      const { httpsCallable, getFunctions } = await import('firebase/functions');
 *      const fn = httpsCallable(getFunctions(undefined, 'asia-east1'), 'healthCheckToolUsageStats');
 *      const r = await fn({}); console.log(r.data);
 *   2. 從 AnalyticsDashboard 的 HealthCheckSection 按「🔄 重新檢查」按鈕
 *   3. runHealthCheckDaily schedule function（每天 02:00 Asia/Taipei 自動跑）
 *
 * 回傳：
 *   summary: { totalDocs, numericDocCount, totalClicks, issueCount, errorCount, warnCount, checkedAt }
 *   issues:  [{ docId, issue, severity: 'error' | 'warn' }, ...] (最多 50 條)
 */
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

export interface HealthCheckResult {
    summary: {
        totalDocs: number;
        numericDocCount: number;
        totalClicks: number;
        issueCount: number;
        errorCount: number;
        warnCount: number;
        checkedAt: string;
    };
    issues: Array<{ docId: string; issue: string; severity: "error" | "warn" }>;
}

/**
 * 內部 helper：執行健檢邏輯
 * 供 callable (admin 主動) 與 runHealthCheckDaily (排程) 共用
 *
 * @param opts.triggeredBy 'manual' | 'daily-cron' | 自訂字串，寫入 healthCheckRuns 區辨來源
 * @param opts.persist 是否寫一筆到 healthCheckRuns collection（給歷史趨勢圖用）
 */
export async function performHealthCheck(opts: {
    triggeredBy?: string;
    persist?: boolean;
} = {}): Promise<HealthCheckResult> {
    const { triggeredBy = "manual", persist = true } = opts;

    const col = admin.firestore().collection("toolUsageStats");
    const allDocs = await col.get();

    const issues: Array<{ docId: string; issue: string; severity: "error" | "warn" }> = [];
    let numericDocCount = 0;
    let totalClicks = 0;

    allDocs.forEach((d) => {
        const data = d.data();

        // Check 1: docId 必須是純數字 1-999
        if (!/^[1-9][0-9]{0,2}$/.test(d.id)) {
            issues.push({
                docId: d.id,
                issue: `docId 不是純數字 1-999（疑似 schema 漂移，e.g. tool_*）`,
                severity: "error",
            });
        } else {
            numericDocCount++;
        }

        // Check 2: totalClicks 必須是 number 且 >= 0
        if (typeof data.totalClicks !== "number") {
            issues.push({
                docId: d.id,
                issue: `totalClicks 不是 number (型別: ${typeof data.totalClicks})`,
                severity: "error",
            });
        } else if (data.totalClicks < 0) {
            issues.push({
                docId: d.id,
                issue: `totalClicks 為負值 ${data.totalClicks}`,
                severity: "error",
            });
        } else {
            totalClicks += data.totalClicks;
        }

        // Check 3: dailyClicks 結構
        if (data.dailyClicks && typeof data.dailyClicks === "object") {
            for (const [k, v] of Object.entries(data.dailyClicks)) {
                if (!/^\d{4}-\d{2}-\d{2}$/.test(k)) {
                    issues.push({
                        docId: d.id,
                        issue: `dailyClicks key 不符 YYYY-MM-DD 格式: "${k}"`,
                        severity: "warn",
                    });
                }
                if (typeof v !== "number" || (v as number) < 0) {
                    issues.push({
                        docId: d.id,
                        issue: `dailyClicks["${k}"] 異常值: ${v}`,
                        severity: "warn",
                    });
                }
            }
        }
    });

    const sortedIssues = issues
        .sort((a, b) => (a.severity === "error" ? -1 : 1))
        .slice(0, 50);

    const summary = {
        totalDocs: allDocs.size,
        numericDocCount,
        totalClicks,
        issueCount: issues.length,
        errorCount: issues.filter((i) => i.severity === "error").length,
        warnCount: issues.filter((i) => i.severity === "warn").length,
        checkedAt: new Date().toISOString(),
    };

    // v3.6.71 持久化：寫一筆到 healthCheckRuns 給歷史趨勢圖用
    if (persist) {
        try {
            await admin.firestore().collection("healthCheckRuns").add({
                ...summary,
                triggeredBy,
                hasErrors: summary.errorCount > 0,
                hasWarns: summary.warnCount > 0,
                checkedAtTimestamp: admin.firestore.FieldValue.serverTimestamp(),
            });
        } catch (err) {
            console.warn("[healthCheckRuns] persist failed:", err);
        }
    }

    return { summary, issues: sortedIssues };
}

export const healthCheckToolUsageStats = onCall(
    {
        region: "asia-east1",
        memory: "256MiB",
        maxInstances: 1,
        timeoutSeconds: 60,
    },
    async (request) => {
        if (!request.auth?.token?.admin) {
            throw new HttpsError("permission-denied", "admin only");
        }
        return await performHealthCheck({
            triggeredBy: `manual:${request.auth.uid?.slice(0, 8) ?? "anon"}`,
        });
    }
);
