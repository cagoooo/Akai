/**
 * monitorToolStatsSchema — onDocumentWritten trigger
 *
 * 任何 toolUsageStats/{docId} 寫入時即時檢查 schema，發現異常推 Google Chat 告警給管理員。
 * 第二道警報網（rules 擋了 99%，剩下 1% admin SDK bypass 走這條）。
 *
 * 告警觸發條件：
 *   - docId 不符 ^[1-9][0-9]{0,2}$ 純數字
 *   - totalClicks 不是 number
 *   - totalClicks 為負值
 *
 * 為了不被噪音淹沒，加 deduplication：同一個 docId 24 小時內只推一次
 * （Firestore alertSilenceUntil collection 紀錄）
 */
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import { pushToGoogleChat } from "./lib/googleChatNotify";

const GOOGLE_CHAT_WEBHOOK_URL = defineSecret("GOOGLE_CHAT_WEBHOOK_URL");

const SILENCE_HOURS = 24;
const SILENCE_COLLECTION = "alertSilence";

export const monitorToolStatsSchema = onDocumentWritten(
    {
        document: "toolUsageStats/{docId}",
        region: "asia-east1",
        memory: "256MiB",
        maxInstances: 5,
        secrets: [GOOGLE_CHAT_WEBHOOK_URL],
    },
    async (event) => {
        const docId = event.params.docId;
        const after = event.data?.after;
        if (!after || !after.exists) return; // 刪除事件不告警

        const data = after.data();
        if (!data) return;

        const issues: string[] = [];
        if (!/^[1-9][0-9]{0,2}$/.test(docId)) {
            issues.push(`docId 異常：「${docId}」（應為純數字 1-999）`);
        }
        if (typeof data.totalClicks !== "number") {
            issues.push(`totalClicks 型別異常：${typeof data.totalClicks}`);
        } else if (data.totalClicks < 0) {
            issues.push(`totalClicks 負值：${data.totalClicks}`);
        }

        if (issues.length === 0) return; // 一切正常

        // 去重：24 小時內同 docId 已推過則跳過（節省告警噪音）
        const silenceRef = admin.firestore().collection(SILENCE_COLLECTION).doc(`toolstats:${docId}`);
        const silenceSnap = await silenceRef.get();
        if (silenceSnap.exists) {
            const lastAlertAt = silenceSnap.data()?.lastAlertAt?.toMillis?.() ?? 0;
            const hoursSince = (Date.now() - lastAlertAt) / 3_600_000;
            if (hoursSince < SILENCE_HOURS) {
                console.log(`[monitorToolStatsSchema] ${docId} silenced (last alert ${hoursSince.toFixed(1)}h ago)`);
                return;
            }
        }

        // 推 Google Chat cardsV2 告警
        const webhookUrl = GOOGLE_CHAT_WEBHOOK_URL.value();
        const summaryText = `⚠️ Schema 漂移告警：toolUsageStats/${docId}`;
        const gChatCard = {
            cardId: `schema-alert-${docId}-${Date.now()}`,
            card: {
                header: {
                    title: "⚠️ toolUsageStats Schema 漂移告警",
                    subtitle: `文檔 toolUsageStats/${docId}`,
                    imageUrl: "https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/database_alert/default/48px.svg",
                    imageType: "CIRCLE",
                },
                sections: [
                    {
                        widgets: [
                            {
                                decoratedText: {
                                    topLabel: "偵測到的異常",
                                    text: `<font color="#dc2626">${issues.join("<br/>")}</font>`,
                                    wrapText: true,
                                },
                            },
                            {
                                decoratedText: {
                                    topLabel: "去重規則",
                                    text: `${SILENCE_HOURS} 小時內同一文檔不再重複告警`,
                                },
                            },
                            {
                                buttonList: {
                                    buttons: [
                                        {
                                            text: "前往後台健檢",
                                            onClick: {
                                                openLink: {
                                                    url: "https://cagoooo.github.io/Akai/admin",
                                                },
                                            },
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                ],
            },
        };

        try {
            await pushToGoogleChat(webhookUrl, summaryText, [gChatCard], "MonitorToolStatsSchema");
            await silenceRef.set({
                lastAlertAt: admin.firestore.FieldValue.serverTimestamp(),
                lastIssues: issues,
            });
            console.log(`[monitorToolStatsSchema] alerted ${docId}: ${issues.join(" / ")}`);
        } catch (err) {
            console.error(`[monitorToolStatsSchema] Google Chat push failed for ${docId}:`, err);
        }
    }
);
