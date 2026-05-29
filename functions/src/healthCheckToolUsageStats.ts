/**
 * healthCheckToolUsageStats — admin only callable
 *
 * 主動掃 toolUsageStats collection 偵測 schema 漂移、異常值，
 * 給 admin dashboard 「🛡️ Schema 健檢」區塊用。
 *
 * 觸發方式：
 *   1. admin browser console:
 *      const { httpsCallable, getFunctions } = await import('firebase/functions');
 *      const fn = httpsCallable(getFunctions(undefined, 'asia-east1'), 'healthCheckToolUsageStats');
 *      const r = await fn({}); console.log(r.data);
 *   2. 從 AnalyticsDashboard 的 HealthCheckSection 按「🔄 重新檢查」按鈕
 *
 * 回傳：
 *   summary: { totalDocs, numericDocCount, totalClicks, issueCount, errorCount, warnCount, checkedAt }
 *   issues:  [{ docId, issue, severity: 'error' | 'warn' }, ...] (最多 50 條)
 */
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

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

        return {
            summary: {
                totalDocs: allDocs.size,
                numericDocCount,
                totalClicks,
                issueCount: issues.length,
                errorCount: issues.filter((i) => i.severity === "error").length,
                warnCount: issues.filter((i) => i.severity === "warn").length,
                checkedAt: new Date().toISOString(),
            },
            // 限制 50 條避免 payload 過大；errors 優先
            issues: issues
                .sort((a, b) => (a.severity === "error" ? -1 : 1))
                .slice(0, 50),
        };
    }
);
