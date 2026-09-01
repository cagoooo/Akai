/**
 * Google Chat Webhook Triggers (v3.6.81)
 *
 * 1. onUserCreated: 監聽 Firebase Auth 使用者註冊事件。
 * 2. onErrorLogCreated: 監聽 Firestore errorLogs 新增事件（前端 JS 崩潰日誌）。
 */

import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v1";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { defineSecret } from "firebase-functions/params";
import { pushToGoogleChat } from "./lib/googleChatNotify";
import { createGithubErrorIssue } from "./lib/githubIssueNotify";
import {
    SEVERITY_LABEL,
    classifySeverity,
    fingerprintError,
    isKnownNoise,
    shouldNotify,
} from "./lib/errorAlertPolicy";

const GOOGLE_CHAT_WEBHOOK_URL = defineSecret("GOOGLE_CHAT_WEBHOOK_URL");
const GITHUB_ISSUE_TOKEN = defineSecret("GITHUB_ISSUE_TOKEN");

// 對外公開站點（供卡片裡的「打開查看」按鈕用）
const SITE_BASE = "https://cagoooo.github.io/Akai";

// 使用者註冊成功通知 (v1 Auth Trigger，因為 v2 identity trigger 在非 blocking 情境尚未完整)
export const onUserCreated = functions
    .region("asia-east1")
    .runWith({
        secrets: [GOOGLE_CHAT_WEBHOOK_URL],
    })
    .auth.user()
    .onCreate(async (user) => {
        // 🔕 跳過匿名登入：站台對每個訪客都會 signInAnonymously，
        // 一整個班級 30 台裝置進站＝30 個匿名帳號，會在同時段灌爆通知。
        // 匿名使用者沒有 email 且 providerData 為空陣列；只有真正用帳號
        // （Google 登入等）註冊的人才推通知。
        const isAnonymous = !user.email && (!user.providerData || user.providerData.length === 0);
        if (isAnonymous) {
            console.log(`[AuthOnCreate] 略過匿名訪客註冊通知 uid=${user.uid}`);
            return;
        }

        const webhookUrl = GOOGLE_CHAT_WEBHOOK_URL.value();
        const email = user.email || "（無電子郵件）";
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

/**
 * 錯誤告警收斂狀態（P1-4）：每個錯誤指紋一份，記錄累積次數與上次推播時間。
 * client 不可讀寫（firestore.rules 預設拒絕，這裡走 Admin SDK）。
 */
const ERROR_ALERT_STATE = "errorAlertState";

interface AlertAggregate {
    total: number;
    sinceLastNotify: number;
    firstSeenAt: number;
    shouldPush: boolean;
}

/**
 * 交易式累加同指紋的次數，並決定這一則要不要推播。
 * 用 transaction 是因為同一個 bug 可能同時打進來好幾則，
 * 沒有交易的話會各自讀到「還沒推播過」而全部推出去。
 */
async function recordAndDecide(
    fingerprint: string,
    severity: ReturnType<typeof classifySeverity>,
    now: number,
): Promise<AlertAggregate> {
    const ref = admin.firestore().collection(ERROR_ALERT_STATE).doc(fingerprint);
    return admin.firestore().runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        const prev = snap.exists ? snap.data() ?? {} : {};
        const total = (typeof prev.total === "number" ? prev.total : 0) + 1;
        const sinceLastNotify = (typeof prev.sinceLastNotify === "number" ? prev.sinceLastNotify : 0) + 1;
        const firstSeenAt = typeof prev.firstSeenAt === "number" ? prev.firstSeenAt : now;
        const lastNotifiedAt = typeof prev.lastNotifiedAt === "number" ? prev.lastNotifiedAt : undefined;
        const push = shouldNotify({ severity, lastNotifiedAt, now });

        tx.set(ref, {
            total,
            // 推播後把「距離上次推播累積了幾次」歸零，下一張卡片才報得出正確的區間次數
            sinceLastNotify: push ? 0 : sinceLastNotify,
            firstSeenAt,
            lastSeenAt: now,
            severity,
            ...(push ? { lastNotifiedAt: now } : {}),
        }, { merge: true });

        return { total, sinceLastNotify, firstSeenAt, shouldPush: push };
    });
}

// 前端錯誤日誌建立通知 (v2 Firestore Trigger)
export const onErrorLogCreated = onDocumentCreated(
    {
        document: "errorLogs/{docId}",
        secrets: [GOOGLE_CHAT_WEBHOOK_URL, GITHUB_ISSUE_TOKEN],
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
        const name = data.name || undefined;
        const appVersion = (data.metadata && data.metadata.appVersion) || "未知版本";

        // ── P1-4 告警分級與收斂 ──────────────────────────────────────
        // 過去是一顆錯誤一則通知，同一個 bug 打到 100 個訪客就是 100 則 → 通知疲勞。
        const logInput = { level, message, stack, componentStack, url, userAgent, name };
        if (isKnownNoise(logInput)) {
            console.log(`[ErrorAlert] 已知第三方雜訊，只留存不推播：${message}`);
            return;
        }
        const severity = classifySeverity(logInput);
        const fingerprint = fingerprintError(logInput);
        const now = Date.now();
        const aggregate = await recordAndDecide(fingerprint, severity, now);
        if (!aggregate.shouldPush) {
            console.log(
                `[ErrorAlert] 收斂：指紋 ${fingerprint}（${severity}）累計 ${aggregate.total} 次，此則不推播`,
            );
            return;
        }

        const firstSeenText = new Date(aggregate.firstSeenAt).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });
        const webhookUrl = GOOGLE_CHAT_WEBHOOK_URL.value();
        const summaryText = `${severity === "critical" ? "🔴" : "🟠"} 前端錯誤告警（累計 ${aggregate.total} 次）: ${message}`;

        // 整理錯誤堆疊，只保留前 10 行，避免卡片太長
        const truncatedStack = stack
            .split("\n")
            .slice(0, 10)
            .join("\n");

        const card = {
            cardId: `error-${fingerprint}-${now}`,
            card: {
                header: {
                    title: `${SEVERITY_LABEL[severity]}`,
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
                            {
                                decoratedText: {
                                    topLabel: "發生頻率",
                                    text: `距上次通知累計 <b>${aggregate.sinceLastNotify}</b> 次 · 這個錯誤總共 <b>${aggregate.total}</b> 次`,
                                    wrapText: true,
                                },
                            },
                            {
                                decoratedText: {
                                    topLabel: "首次發生 / 版本 / 指紋",
                                    text: `${firstSeenText} · ${appVersion} · <code>${fingerprint}</code>`,
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

        // P1-5：同一道節流閘門之下，額外開一張 Issue 觸發雲端 agent 自動診斷根因
        await createGithubErrorIssue(
            GITHUB_ISSUE_TOKEN.value(),
            {
                message,
                severity,
                fingerprint,
                stack,
                url,
                userAgent,
                appVersion,
                firstSeenText,
                totalCount: aggregate.total,
            },
            "FirestoreOnErrorLog"
        );
    }
);

// 許願池新回饋通知 (v2 Firestore Trigger，v3.6.82 從 LINE 遷移至 Google Chat)
export const onWishCreated = onDocumentCreated(
    {
        document: "wishingWell/{docId}",
        secrets: [GOOGLE_CHAT_WEBHOOK_URL],
        region: "asia-east1",
    },
    async (event) => {
        const snapshot = event.data;
        if (!snapshot) return;

        const data = snapshot.data();
        const userName = data.userName || "未具名使用者";
        const typeValue = data.type;
        const typeLabel = typeValue === "suggestion" ? "💡 新工具許願" : "⭐ 使用回饋";
        const content = data.content || "(無內容)";
        const rating = data.rating;

        const webhookUrl = GOOGLE_CHAT_WEBHOOK_URL.value();
        const summaryText = `🪄 許願池收到新回饋（${typeLabel}）— ${userName}`;

        const widgets: any[] = [
            {
                decoratedText: {
                    topLabel: "使用者",
                    text: `<b>${userName}</b>`,
                },
            },
            {
                decoratedText: {
                    topLabel: "類型",
                    text: typeLabel,
                },
            },
        ];

        if (rating !== undefined && rating !== null) {
            const starText = "⭐".repeat(rating) + "☆".repeat(Math.max(0, 5 - rating));
            widgets.push({
                decoratedText: {
                    topLabel: "整體評分",
                    text: `${starText}　(${rating}/5)`,
                },
            });
        }

        widgets.push(
            {
                decoratedText: {
                    topLabel: "內容",
                    text: content,
                    wrapText: true,
                },
            },
            {
                buttonList: {
                    buttons: [
                        {
                            text: "前往後台查看",
                            onClick: {
                                openLink: {
                                    url: `${SITE_BASE}/admin`,
                                },
                            },
                        },
                    ],
                },
            }
        );

        const card = {
            cardId: `wish-${event.params.docId}`,
            card: {
                header: {
                    title: "🪄 許願池新回饋",
                    subtitle: typeLabel,
                    imageUrl: "https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/auto_awesome/default/48px.svg",
                    imageType: "CIRCLE",
                },
                sections: [
                    {
                        collapsible: false,
                        widgets,
                    },
                ],
            },
        };

        await pushToGoogleChat(webhookUrl, summaryText, [card], "FirestoreOnWish");
    }
);

// 工具評論通知 (v2 Firestore Trigger，v3.6.82 從 LINE 遷移至 Google Chat)
export const onReviewCreated = onDocumentCreated(
    {
        document: "toolReviews/{docId}",
        secrets: [GOOGLE_CHAT_WEBHOOK_URL],
        region: "asia-east1",
    },
    async (event) => {
        const snapshot = event.data;
        if (!snapshot) return;

        const data = snapshot.data();
        const toolId = data.toolId;
        const toolTitle = data.toolTitle || `工具 #${toolId}`;
        const userName = data.userName || "匿名使用者";
        const ratingNum = typeof data.rating === "number" ? Math.max(1, Math.min(5, data.rating)) : 0;
        const comment = data.comment || "(無內容)";

        const starText = "⭐".repeat(ratingNum) + "☆".repeat(5 - ratingNum);
        const toolUrl = `${SITE_BASE}/?tool=${toolId}`;

        const webhookUrl = GOOGLE_CHAT_WEBHOOK_URL.value();
        const summaryText = `📝 「${toolTitle}」收到 ${userName} 的 ${ratingNum} 星評論`;

        const card = {
            cardId: `review-${event.params.docId}`,
            card: {
                header: {
                    title: "📝 工具收到新評論",
                    subtitle: toolTitle,
                    imageUrl: "https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/rate_review/default/48px.svg",
                    imageType: "CIRCLE",
                },
                sections: [
                    {
                        collapsible: false,
                        widgets: [
                            {
                                decoratedText: {
                                    topLabel: "工具",
                                    text: `<b>${toolTitle}</b>`,
                                },
                            },
                            {
                                decoratedText: {
                                    topLabel: "教師",
                                    text: userName,
                                },
                            },
                            {
                                decoratedText: {
                                    topLabel: "評分",
                                    text: `${starText}　(${ratingNum}/5)`,
                                },
                            },
                            {
                                decoratedText: {
                                    topLabel: "評論內容",
                                    text: comment,
                                    wrapText: true,
                                },
                            },
                            {
                                buttonList: {
                                    buttons: [
                                        {
                                            text: "打開工具頁面",
                                            onClick: {
                                                openLink: {
                                                    url: toolUrl,
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

        await pushToGoogleChat(webhookUrl, summaryText, [card], "FirestoreOnReview");
    }
);

function safeText(value: unknown, fallback = ""): string {
    return String(value ?? fallback)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .slice(0, 600);
}

function safeUrl(value: unknown, fallback = SITE_BASE): string {
    const raw = String(value || fallback);
    try {
        const url = new URL(raw);
        return url.toString();
    } catch {
        return fallback;
    }
}

// Homepage engagement notifications: tool cards and blog articles.
export const onEngagementEventCreated = onDocumentCreated(
    {
        document: "engagementEvents/{eventId}",
        secrets: [GOOGLE_CHAT_WEBHOOK_URL],
        region: "asia-east1",
    },
    async (event) => {
        const snapshot = event.data;
        if (!snapshot) return;

        const data = snapshot.data();
        const eventType = String(data.type || "");
        const pageUrl = safeUrl(data.pageUrl, SITE_BASE);
        const source = safeText(data.source || "home");
        const webhookUrl = GOOGLE_CHAT_WEBHOOK_URL.value();

        if (eventType === "tool_click") {
            const toolId = Number(data.toolId || 0);
            const toolTitle = safeText(data.toolTitle || `工具 #${toolId}`);
            const toolCategory = safeText(data.toolCategory || "未分類");
            const targetUrl = safeUrl(data.targetUrl, `${SITE_BASE}/tool/${toolId}`);
            
            let summaryText = `使用者從主頁點擊工具：${toolTitle}`;
            let titleText = "主頁工具卡片被點擊";
            
            if (source === "leaderboard" || source === "ranking") {
                summaryText = `🏆 使用者點擊排行榜工具：${toolTitle}`;
                titleText = "🏆 排行榜工具被點擊";
            } else if (source === "tool_detail_use") {
                summaryText = `⚡ 使用者從詳情頁點擊使用工具：${toolTitle}`;
                titleText = "⚡ 詳情頁工具被使用";
            }

            const card = {
                cardId: `engagement-tool-${event.params.eventId}`,
                card: {
                    header: {
                        title: titleText,
                        subtitle: `#${toolId} ${toolTitle}`,
                        imageUrl: "https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/touch_app/default/48px.svg",
                        imageType: "CIRCLE",
                    },
                    sections: [
                        {
                            widgets: [
                                { decoratedText: { topLabel: "工具", text: `<b>${toolTitle}</b>`, wrapText: true } },
                                { decoratedText: { topLabel: "分類", text: toolCategory } },
                                { decoratedText: { topLabel: "來源", text: source } },
                                {
                                    buttonList: {
                                        buttons: [
                                            { text: "開啟工具", onClick: { openLink: { url: targetUrl } } },
                                            { text: "查看事件頁", onClick: { openLink: { url: pageUrl } } },
                                        ],
                                    },
                                },
                            ],
                        },
                    ],
                },
            };

            await pushToGoogleChat(webhookUrl, summaryText, [card], "FirestoreOnEngagementTool");
            return;
        }

        if (eventType === "blog_read") {
            const slug = safeText(data.slug || "");
            const title = safeText(data.title || "未命名文章");
            const readingMinutes = Number(data.readingMinutes || 0);
            const relatedTools = safeText(data.relatedTools || "無");
            const blogUrl = safeUrl(pageUrl, `${SITE_BASE}/blog/${slug}`);
            let summaryText = `使用者從主頁觀看部落格：${title}`;
            let titleText = "主頁部落格文章被觀看";

            if (source === "tool_detail_intro") {
                summaryText = `📖 使用者從工具詳情頁點擊讀介紹：${title}`;
                titleText = "📖 工具詳情頁讀介紹被點擊";
            } else if (source === "blog_post") {
                summaryText = `📖 使用者閱讀部落格：${title}`;
                titleText = "📖 部落格文章被閱讀";
            }

            const card = {
                cardId: `engagement-blog-${event.params.eventId}`,
                card: {
                    header: {
                        title: titleText,
                        subtitle: title,
                        imageUrl: "https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/article/default/48px.svg",
                        imageType: "CIRCLE",
                    },
                    sections: [
                        {
                            widgets: [
                                { decoratedText: { topLabel: "文章", text: `<b>${title}</b>`, wrapText: true } },
                                { decoratedText: { topLabel: "Slug", text: slug } },
                                { decoratedText: { topLabel: "預估閱讀時間", text: readingMinutes ? `${readingMinutes} 分鐘` : "未提供" } },
                                { decoratedText: { topLabel: "相關工具 ID", text: relatedTools, wrapText: true } },
                                {
                                    buttonList: {
                                        buttons: [
                                            { text: "開啟文章", onClick: { openLink: { url: blogUrl } } },
                                        ],
                                    },
                                },
                            ],
                        },
                    ],
                },
            };

            await pushToGoogleChat(webhookUrl, summaryText, [card], "FirestoreOnEngagementBlog");
            return;
        }

        console.log(`[FirestoreOnEngagement] ignored unknown event type: ${eventType}`);
    }
);
