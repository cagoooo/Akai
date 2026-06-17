/**
 * Google Chat Webhook Triggers (v3.6.81)
 *
 * 1. onUserCreated: 監聽 Firebase Auth 使用者註冊事件。
 * 2. onErrorLogCreated: 監聽 Firestore errorLogs 新增事件（前端 JS 崩潰日誌）。
 */

import * as functions from "firebase-functions";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { defineSecret } from "firebase-functions/params";
import { pushToGoogleChat } from "./lib/googleChatNotify";

const GOOGLE_CHAT_WEBHOOK_URL = defineSecret("GOOGLE_CHAT_WEBHOOK_URL");

// 使用者註冊成功通知 (v1 Auth Trigger，因為 v2 identity trigger 在非 blocking 情境尚未完整)
export const onUserCreated = functions
    .region("asia-east1")
    .runWith({
        secrets: [GOOGLE_CHAT_WEBHOOK_URL],
    })
    .auth.user()
    .onCreate(async (user) => {
        const webhookUrl = GOOGLE_CHAT_WEBHOOK_URL.value();
        const email = user.email || "（無電子郵件，可能是匿名登入）";
        const uid = user.uid;
        const displayName = user.displayName || "未設定名稱";
        const createdAt = user.metadata.creationTime
            ? new Date(user.metadata.creationTime).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })
            : new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });

        const summaryText = `👤 新使用者註冊成功 (電子郵件: ${email})`;

        const card = {
            cardId: `register-${uid}`,
            card: {
                header: {
                    title: "👤 新使用者註冊成功",
                    subtitle: `電子郵件: ${email}`,
                    imageUrl: "https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/person/default/48px.svg",
                    imageType: "CIRCLE",
                },
                sections: [
                    {
                        collapsible: false,
                        widgets: [
                            {
                                decoratedText: {
                                    topLabel: "使用者帳號 UID",
                                    text: `<b>${uid}</b>`,
                                },
                            },
                            {
                                decoratedText: {
                                    topLabel: "顯示名稱",
                                    text: displayName,
                                },
                            },
                            {
                                decoratedText: {
                                    topLabel: "註冊建立時間",
                                    text: createdAt,
                                },
                            },
                            {
                                buttonList: {
                                    buttons: [
                                        {
                                            text: "前往 Firebase Console",
                                            onClick: {
                                                openLink: {
                                                    url: "https://console.firebase.google.com/project/akai-e693f/authentication/users",
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

        await pushToGoogleChat(webhookUrl, summaryText, [card], "AuthOnCreate");
    });

// 前端錯誤日誌建立通知 (v2 Firestore Trigger)
export const onErrorLogCreated = onDocumentCreated(
    {
        document: "errorLogs/{docId}",
        secrets: [GOOGLE_CHAT_WEBHOOK_URL],
        region: "asia-east1",
    },
    async (event) => {
        const snapshot = event.data;
        if (!snapshot) return;

        const data = snapshot.data();
        const message = data.message || "未知錯誤";
        const stack = data.stack || "無堆疊資訊";
        const componentStack = data.componentStack || "";
        const url = data.url || "未知網址";
        const userAgent = data.userAgent || "未知 UserAgent";
        const timestamp = data.timestamp
            ? new Date(data.timestamp).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })
            : new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });
        const level = data.level || "error";

        const webhookUrl = GOOGLE_CHAT_WEBHOOK_URL.value();
        const summaryText = `🚨 系統服務錯誤告警: ${message}`;

        // 整理錯誤堆疊，只保留前 10 行，避免卡片太長
        const truncatedStack = stack
            .split("\n")
            .slice(0, 10)
            .join("\n");

        const card = {
            cardId: `error-${event.params.docId}`,
            card: {
                header: {
                    title: `🚨 前端系統錯誤 (${level})`,
                    subtitle: message,
                    imageUrl: "https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/error/default/48px.svg",
                    imageType: "CIRCLE",
                },
                sections: [
                    {
                        header: "錯誤環境與路徑",
                        collapsible: false,
                        widgets: [
                            {
                                decoratedText: {
                                    topLabel: "觸發網址",
                                    text: `<a href="${url}">${url}</a>`,
                                    wrapText: true,
                                },
                            },
                            {
                                decoratedText: {
                                    topLabel: "觸發時間",
                                    text: timestamp,
                                    wrapText: true,
                                },
                            },
                            {
                                decoratedText: {
                                    topLabel: "瀏覽器代理",
                                    text: userAgent,
                                    wrapText: true,
                                },
                            },
                        ],
                    },
                    {
                        header: "錯誤堆疊分析 (Stack Trace)",
                        collapsible: true,
                        widgets: [
                            {
                                textParagraph: {
                                    text: `<font color="#c2410c"><pre>${truncatedStack}</pre></font>`,
                                },
                            },
                            ...(componentStack
                                ? [
                                      {
                                          textParagraph: {
                                              text: `<b>React 元件堆疊：</b><br/><font color="#7c2d12"><pre>${componentStack.slice(
                                                  0,
                                                  500
                                              )}</pre></font>`,
                                          },
                                      },
                                  ]
                                : []),
                        ],
                    },
                    {
                        widgets: [
                            {
                                buttonList: {
                                    buttons: [
                                        {
                                            text: "前往 Firestore 查看日誌",
                                            onClick: {
                                                openLink: {
                                                    url: `https://console.firebase.google.com/project/akai-e693f/firestore/databases/(default)/data/errorLogs/${event.params.docId}`,
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

        await pushToGoogleChat(webhookUrl, summaryText, [card], "FirestoreOnErrorLog");
    }
);
