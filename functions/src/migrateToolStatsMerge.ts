/**
 * migrateToolStatsMerge — admin-only Cloud Function
 *
 * 修復 `toolUsageStats` collection 的雙寫 doc 漂移：
 *   - 舊 doc id = `tool_${toolId}`（含 toolId field、無 dailyClicks）—— 來自 client direct write fallback
 *   - 新 doc id = `${toolId}`（無 toolId field、有 dailyClicks）—— 來自 callable incrementToolClick
 *
 * 兩種 doc 的 totalClicks 是分開累計的，前端 onSnapshot 只認得舊 doc（之前的 bug），
 * 導致學生點擊新 doc 累加但 UI 永遠停在舊 doc 數字。
 *
 * 修法：把 `tool_*` 的 totalClicks 加進對應 `${toolId}` doc，dailyClicks 一併 merge，
 * 然後刪除 `tool_*` 舊 doc。
 *
 * 觸發方式（從 admin 瀏覽器 console 跑）：
 *   const { httpsCallable, getFunctions } = await import('firebase/functions');
 *   const fn = httpsCallable(getFunctions(undefined, 'asia-east1'), 'migrateToolStatsMerge');
 *   const r = await fn({ dryRun: true });  // 先看清單
 *   console.log(r.data);
 *   const r2 = await fn({ dryRun: false }); // 實際執行
 *   console.log(r2.data);
 */
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

export const migrateToolStatsMerge = onCall(
    {
        region: "asia-east1",
        memory: "512MiB",
        maxInstances: 1,
        timeoutSeconds: 300,
    },
    async (request) => {
        if (!request.auth?.token?.admin) {
            throw new HttpsError("permission-denied", "admin only");
        }

        const dryRun = request.data?.dryRun !== false; // 預設 dry-run，明確傳 false 才執行

        const col = admin.firestore().collection("toolUsageStats");
        const allDocs = await col.get();

        // 分類：舊 doc (tool_*) 跟新 doc (純數字)
        const oldDocs: Array<{ docId: string; toolId: number; data: any }> = [];
        const newDocsByToolId = new Map<number, { docId: string; data: any }>();

        allDocs.forEach((d) => {
            const data = d.data();
            const oldMatch = d.id.match(/^tool_(\d+)$/);
            if (oldMatch) {
                oldDocs.push({ docId: d.id, toolId: parseInt(oldMatch[1], 10), data });
            } else if (/^\d+$/.test(d.id)) {
                newDocsByToolId.set(parseInt(d.id, 10), { docId: d.id, data });
            }
        });

        const plan: Array<{
            toolId: number;
            oldDocId: string;
            oldTotalClicks: number;
            newDocId: string;
            newTotalClicks: number;
            mergedTotalClicks: number;
            oldHasDailyClicks: boolean;
        }> = [];

        for (const o of oldDocs) {
            const newDoc = newDocsByToolId.get(o.toolId);
            const oldTotal = Number(o.data.totalClicks) || 0;
            const newTotal = Number(newDoc?.data.totalClicks) || 0;
            plan.push({
                toolId: o.toolId,
                oldDocId: o.docId,
                oldTotalClicks: oldTotal,
                newDocId: newDoc?.docId ?? String(o.toolId),
                newTotalClicks: newTotal,
                mergedTotalClicks: oldTotal + newTotal,
                oldHasDailyClicks: !!o.data.dailyClicks,
            });
        }

        if (dryRun) {
            return {
                mode: "dry-run",
                summary: {
                    oldDocCount: oldDocs.length,
                    newDocCount: newDocsByToolId.size,
                    toolIdsToMerge: plan.length,
                    totalClicksGainedAfterMerge: plan.reduce(
                        (sum, p) => sum + p.oldTotalClicks,
                        0
                    ),
                },
                plan: plan.sort((a, b) => b.mergedTotalClicks - a.mergedTotalClicks),
            };
        }

        // 實際執行：batch update + delete
        const results: Array<{ toolId: number; status: string; error?: string }> = [];

        // Firestore batch 上限 500 ops；每個 toolId 是 1 update + 1 delete = 2 ops
        // 100+ tools 用單一 batch 足夠
        const batch = admin.firestore().batch();

        for (const o of oldDocs) {
            try {
                const newDocRef = col.doc(String(o.toolId));
                const oldDailyClicks = o.data.dailyClicks || {};
                // 用 increment + merge — totalClicks 累加、dailyClicks 各日累加
                const dailyClicksMerge: Record<string, any> = {};
                for (const [k, v] of Object.entries(oldDailyClicks)) {
                    if (/^\d{4}-\d{2}-\d{2}$/.test(k) && typeof v === "number" && v > 0) {
                        dailyClicksMerge[k] = admin.firestore.FieldValue.increment(v);
                    }
                }
                batch.set(
                    newDocRef,
                    {
                        totalClicks: admin.firestore.FieldValue.increment(
                            Number(o.data.totalClicks) || 0
                        ),
                        ...(Object.keys(dailyClicksMerge).length > 0
                            ? { dailyClicks: dailyClicksMerge }
                            : {}),
                    },
                    { merge: true }
                );
                batch.delete(col.doc(o.docId));
                results.push({ toolId: o.toolId, status: "queued" });
            } catch (err: any) {
                results.push({ toolId: o.toolId, status: "error", error: err.message });
            }
        }

        try {
            await batch.commit();
            // mark all queued as success
            results.forEach((r) => {
                if (r.status === "queued") r.status = "ok";
            });
        } catch (err: any) {
            return {
                mode: "execute",
                error: `batch commit failed: ${err.message}`,
                results,
            };
        }

        return {
            mode: "execute",
            summary: {
                merged: results.filter((r) => r.status === "ok").length,
                errors: results.filter((r) => r.status === "error").length,
            },
            results,
        };
    }
);
