/**
 * runHealthCheckDaily — onSchedule trigger (every day at 02:00 Asia/Taipei)
 *
 * 自動跑 performHealthCheck 並寫進 healthCheckRuns collection（給歷史趨勢圖）
 * 如 errorCount > 0 即時推 Google Chat 告警給管理員
 *
 * v3.6.71：把「主動健檢」從「使用者主動按按鈕」升級成「每日自動 + 異常即時告警」
 */
import { onSchedule } from "firebase-functions/v2/scheduler";
import { defineSecret } from "firebase-functions/params";
import { performHealthCheck } from "./healthCheckToolUsageStats";
import { pushToGoogleChat } from "./lib/googleChatNotify";

const GOOGLE_CHAT_WEBHOOK_URL = defineSecret("GOOGLE_CHAT_WEBHOOK_URL");


export const runHealthCheckDaily = onSchedule(
    {
        schedule: "0 2 * * *", // 每天 02:00（cron syntax）
        timeZone: "Asia/Taipei",
        region: "asia-east1",
        memory: "256MiB",
        retryCount: 1, // 失敗重試一次
        secrets: [GOOGLE_CHAT_WEBHOOK_URL],
    },
    async (event) => {
        console.log(`[runHealthCheckDaily] scheduled run @ ${event.scheduleTime}`);
        const result = await performHealthCheck({ triggeredBy: "daily-cron", persist: true });
        console.log(
            `[runHealthCheckDaily] checked ${result.summary.totalDocs} docs, ${result.summary.errorCount} errors, ${result.summary.warnCount} warns`
        );

        if (result.summary.errorCount === 0) {
            console.log("[runHealthCheckDaily] all green, no alert");
            return;
        }

        // 有 error 推 Google Chat 告警
        const topIssues = result.issues.filter((i) => i.severity === "error").slice(0, 5);

        try {
            const webhookUrl = GOOGLE_CHAT_WEBHOOK_URL.value();
            const summaryText = `🚨 每日健檢異常：${result.summary.errorCount} 個 schema error`;
            
            const gChatCard = {
                cardId: `daily-health-${Date.now()}`,
                card: {
                    header: {
                        title: "🚨 每日資料庫 Schema 健檢異常",
                        subtitle: `${result.summary.errorCount} 個錯誤 · ${result.summary.warnCount} 個警告`,
                        imageUrl: "https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/database_alert/default/48px.svg",
                        imageType: "CIRCLE",
                    },
                    sections: [
                        {
                            header: "檢查摘要統計",
                            widgets: [
                                {
                                    decoratedText: {
                                        topLabel: "檢查文檔總數",
                                        text: `共 <b>${result.summary.totalDocs}</b> 個文檔 (純數字文檔: ${result.summary.numericDocCount})`,
                                    }
                                },
                                {
                                    decoratedText: {
                                        topLabel: "檢查時間",
                                        text: `${result.summary.checkedAt.slice(0, 19).replace("T", " ")} UTC (台北時間每日排程)`,
                                    }
                                }
                            ]
                        },
                        {
                            header: "前 5 筆異常項目",
                            widgets: topIssues.map((i) => ({
                                decoratedText: {
                                    topLabel: `文檔 ID: ${i.docId}`,
                                    text: `<font color="#dc2626">${i.issue}</font>`,
                                    wrapText: true
                                }
                            }))
                        },
                        {
                            widgets: [
                                {
                                    buttonList: {
                                        buttons: [
                                            {
                                                text: "前往後台查看完整健檢",
                                                onClick: {
                                                    openLink: {
                                                        url: "https://cagoooo.github.io/Akai/admin"
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    ]
                }
            };
            
            await pushToGoogleChat(webhookUrl, summaryText, [gChatCard], "DailyHealthCheck");
        } catch (gChatErr) {
            console.error("[runHealthCheckDaily] Google Chat push failed:", gChatErr);
        }
    }
);
