/**
 * 每日 Firestore 快照（救命級備份）
 *
 * 為什麼：v3.6.4 一連串資料遺失事件後，必須有「歷史快照」當保險網。
 * Firestore 本身穩定，但人為失誤（誤刪 doc、規則改錯）或極端災難仍可能歸零。
 *
 * 機制：
 * - 排程：每天 03:00 (Asia/Taipei) 觸發
 * - 來源集合：visitorStats / analytics / toolUsageStats / toolRatings
 * - 寫入：analyticsSnapshots/{YYYY-MM-DD}（單一文件含全部資料的 JSON）
 * - 保留：90 天，超過自動裁切
 *
 * 還原：
 * - onCall function `restoreFromSnapshot({ date: 'YYYY-MM-DD', dryRun?: boolean })`
 * - 只允許 admin custom claim 呼叫
 * - dryRun=true 時只 console.log 不寫
 */

import { onSchedule } from "firebase-functions/v2/scheduler";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

const SNAPSHOTS_COLLECTION = "analyticsSnapshots";
const RETENTION_DAYS = 90;

interface SnapshotPayload {
    capturedAt: admin.firestore.FieldValue;
    date: string;
    schemaVersion: 1;
    sourceCollections: string[];
    sizes: Record<string, number>;
    data: {
        visitorStats: Record<string, any>;
        analytics: Record<string, any>;
        toolUsageStats: Record<string, any>;
        toolRatings: Record<string, any>;
    };
}

function todayInTaipei(): string {
    // 排程跑在 UTC，台北時間需要 +8h；用 toLocaleDateString 拿到 YYYY/MM/DD 後組回 ISO
    const fmt = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Taipei",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
    return fmt.format(new Date()); // en-CA 已經是 YYYY-MM-DD 格式
}

async function readAllDocs(collection: string): Promise<Record<string, any>> {
    const snap = await admin.firestore().collection(collection).get();
    const out: Record<string, any> = {};
    snap.forEach((doc) => {
        out[doc.id] = doc.data();
    });
    return out;
}

/** 裁切 toolUsageStats 各 doc 中 dailyClicks 超過 90 天的舊 entry */
async function pruneOldDailyClicks(): Promise<{ docsScanned: number; keysRemoved: number }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);
    const fmt = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Taipei",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
    const cutoffStr = fmt.format(cutoffDate);

    const snap = await admin.firestore().collection("toolUsageStats").get();
    let docsScanned = 0;
    let keysRemoved = 0;
    const batch = admin.firestore().batch();

    snap.forEach((doc) => {
        docsScanned++;
        const data = doc.data();
        const dc = data.dailyClicks as Record<string, number> | undefined;
        if (!dc) return;
        const removeFields: Record<string, any> = {};
        for (const dateKey of Object.keys(dc)) {
            if (dateKey < cutoffStr) {
                removeFields[`dailyClicks.${dateKey}`] = admin.firestore.FieldValue.delete();
                keysRemoved++;
            }
        }
        if (Object.keys(removeFields).length > 0) {
            batch.update(doc.ref, removeFields);
        }
    });
    if (keysRemoved > 0) await batch.commit();
    return { docsScanned, keysRemoved };
}

/** 排程任務：每天 03:00 (Asia/Taipei) 跑一次 */
export const dailySnapshot = onSchedule(
    {
        schedule: "0 3 * * *",
        timeZone: "Asia/Taipei",
        memory: "512MiB",
        timeoutSeconds: 540,
    },
    async () => {
        const date = todayInTaipei();
        console.log(`[dailySnapshot] 開始建立 ${date} 快照…`);

        try {
            // 1. 收集四個關鍵集合
            const [visitorStats, analytics, toolUsageStats, toolRatings] = await Promise.all([
                readAllDocs("visitorStats"),
                readAllDocs("analytics"),
                readAllDocs("toolUsageStats"),
                readAllDocs("toolRatings"),
            ]);

            const sizes = {
                visitorStats: Object.keys(visitorStats).length,
                analytics: Object.keys(analytics).length,
                toolUsageStats: Object.keys(toolUsageStats).length,
                toolRatings: Object.keys(toolRatings).length,
            };

            const payload: SnapshotPayload = {
                capturedAt: admin.firestore.FieldValue.serverTimestamp(),
                date,
                schemaVersion: 1,
                sourceCollections: ["visitorStats", "analytics", "toolUsageStats", "toolRatings"],
                sizes,
                data: { visitorStats, analytics, toolUsageStats, toolRatings },
            };

            // 2. 寫入 snapshot 文件
            await admin
                .firestore()
                .collection(SNAPSHOTS_COLLECTION)
                .doc(date)
                .set(payload);

            console.log(`[dailySnapshot] ✅ 已寫入 ${SNAPSHOTS_COLLECTION}/${date}`, sizes);

            // 3. 裁切超過 RETENTION_DAYS 天的舊快照
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);
            const fmt = new Intl.DateTimeFormat("en-CA", {
                timeZone: "Asia/Taipei",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            });
            const cutoffStr = fmt.format(cutoffDate);

            const oldSnaps = await admin
                .firestore()
                .collection(SNAPSHOTS_COLLECTION)
                .where(admin.firestore.FieldPath.documentId(), "<", cutoffStr)
                .get();

            if (!oldSnaps.empty) {
                const batch = admin.firestore().batch();
                oldSnaps.forEach((d) => batch.delete(d.ref));
                await batch.commit();
                console.log(`[dailySnapshot] 🧹 已裁切 ${oldSnaps.size} 份超過 ${RETENTION_DAYS} 天的舊快照`);
            }

            // 4. 裁切 toolUsageStats.dailyClicks 中超過 90 天的舊 key
            const prune = await pruneOldDailyClicks();
            if (prune.keysRemoved > 0) {
                console.log(`[dailySnapshot] 🧹 裁切 dailyClicks：掃描 ${prune.docsScanned} 個工具，移除 ${prune.keysRemoved} 個過期日期 key`);
            }
        } catch (err) {
            console.error("[dailySnapshot] 失敗：", err);
            throw err;
        }
    }
);

/**
 * 從快照還原資料
 * 用法（前端）：
 *   const fn = httpsCallable(functions, 'restoreFromSnapshot');
 *   await fn({ date: '2026-04-25', dryRun: true });
 */
export const restoreFromSnapshot = onCall(async (request) => {
    // 必須是 admin custom claim 才能還原
    if (!request.auth?.token?.admin) {
        throw new HttpsError("permission-denied", "只有管理員可以還原快照");
    }

    const date = request.data?.date;
    const dryRun = request.data?.dryRun !== false; // 預設 dryRun，避免誤觸

    if (!date || typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new HttpsError("invalid-argument", "date 必須是 YYYY-MM-DD 格式");
    }

    const snapDoc = await admin.firestore().collection(SNAPSHOTS_COLLECTION).doc(date).get();
    if (!snapDoc.exists) {
        throw new HttpsError("not-found", `找不到 ${date} 的快照`);
    }

    const snap = snapDoc.data() as SnapshotPayload;
    const restored: Record<string, number> = {};

    for (const collection of ["visitorStats", "analytics", "toolUsageStats", "toolRatings"] as const) {
        const docs = (snap.data as any)[collection] || {};
        const docIds = Object.keys(docs);
        restored[collection] = docIds.length;

        if (dryRun) {
            console.log(`[restoreFromSnapshot] [DRY-RUN] ${collection} 將還原 ${docIds.length} 個文件`);
            continue;
        }

        // 真的寫入：用 batch（500 筆/批）
        for (let i = 0; i < docIds.length; i += 400) {
            const batch = admin.firestore().batch();
            const slice = docIds.slice(i, i + 400);
            for (const id of slice) {
                const ref = admin.firestore().collection(collection).doc(id);
                batch.set(ref, docs[id]);
            }
            await batch.commit();
        }
        console.log(`[restoreFromSnapshot] ✅ ${collection}: ${docIds.length} 文件已還原`);
    }

    return {
        ok: true,
        date,
        dryRun,
        restored,
        message: dryRun
            ? "已預演還原（未實際寫入）。請呼叫時加 dryRun: false 才會真的覆寫"
            : `已從 ${date} 快照還原 ${Object.values(restored).reduce((a, b) => a + b, 0)} 個文件`,
    };
});
