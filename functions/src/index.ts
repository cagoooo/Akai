import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import axios from "axios";

// 初始化 Firebase Admin
admin.initializeApp();

// 從環境變數中取得 LINE 官方帳號的 Token 與推播對象 ID
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_NOTIFY_TOKEN;
const LINE_ADMIN_USER_ID = process.env.LINE_ADMIN_USER_ID;

/**
 * 監聽 wishingWell 集合中的新增文件
 * 當有新的許願/回饋寫入時，透過 LINE 官方帳號傳送「卡片格式」通知給管理員
 */
export const onWishCreated = onDocumentCreated("wishingWell/{docId}", async (event) => {
    // 若沒有取得資料則略過
    const snapshot = event.data;
    if (!snapshot) return;

    // 讀取寫入的許願內容
    const data = snapshot.data();
    const userName = data.userName || "未具名使用者";
    const typeValue = data.type;
    const typeLabel = typeValue === "suggestion" ? "💡 新建議" : "⭐ 系統評分";
    const typeColor = typeValue === "suggestion" ? "#00B900" : "#FF9900"; // 建議用綠綠的，評分用橘黃的
    const content = data.content || "(無內容)";
    const rating = data.rating;

    // 檢查必備變數
    if (!LINE_CHANNEL_ACCESS_TOKEN || !LINE_ADMIN_USER_ID) {
        console.error("尚未配置 LINE_NOTIFY_TOKEN 或 LINE_ADMIN_USER_ID，無法發送通知。");
        return;
    }

    // --- 構建 Flex Message 的 Body 區塊 ---
    const bodyContents: any[] = [
        {
            type: "box",
            layout: "horizontal",
            contents: [
                { type: "text", text: "👤 使用者", color: "#8c8c8c", size: "sm", wrap: true, flex: 3 },
                { type: "text", text: userName, color: "#111111", size: "sm", wrap: true, flex: 7, weight: "bold" }
            ],
            margin: "md"
        },
        {
            type: "box",
            layout: "horizontal",
            contents: [
                { type: "text", text: "🏷️ 類型", color: "#8c8c8c", size: "sm", wrap: true, flex: 3 },
                { type: "text", text: typeLabel, color: typeColor, size: "sm", wrap: true, flex: 7, weight: "bold" }
            ],
            margin: "md"
        }
    ];

    // 如果有評分，加入星等列
    if (rating !== undefined) {
        const starText = "⭐".repeat(rating);
        const emptyStarText = "☆".repeat(5 - rating);
        bodyContents.push({
            type: "box",
            layout: "horizontal",
            contents: [
                { type: "text", text: "🌟 評分", color: "#8c8c8c", size: "sm", wrap: true, flex: 3 },
                { type: "text", text: `${starText}${emptyStarText}  (${rating}/5)`, color: "#ffb81c", size: "sm", wrap: true, flex: 7, weight: "bold" }
            ],
            margin: "md"
        });
    }

    // 加入分隔線與內容區塊
    bodyContents.push(
        { type: "separator", margin: "lg" },
        {
            type: "box",
            layout: "vertical",
            contents: [
                { type: "text", text: "📝 內容：", color: "#8c8c8c", size: "sm", margin: "md" },
                { type: "text", text: content, wrap: true, color: "#111111", size: "md", margin: "sm" }
            ]
        }
    );

    // --- 組裝最終的 Flex Message payload ---
    const messagePayload = {
        to: LINE_ADMIN_USER_ID.trim(),
        messages: [
            {
                type: "flex",
                altText: `收到來自「許願池」的新回饋：${typeLabel}`,
                contents: {
                    type: "bubble",
                    styles: {
                        header: {
                            backgroundColor: "#27BDBE" // 統一的青色標題背景
                        }
                    },
                    header: {
                        type: "box",
                        layout: "vertical",
                        contents: [
                            {
                                type: "text",
                                text: "✨ 許願池新回饋 ✨",
                                color: "#FFFFFF",
                                weight: "bold",
                                size: "lg",
                                align: "center"
                            }
                        ]
                    },
                    body: {
                        type: "box",
                        layout: "vertical",
                        spacing: "sm",
                        contents: bodyContents
                    }
                }
            }
        ]
    };

    try {
        // 發送 POST 請求至 LINE Messaging API
        await axios.post(
            "https://api.line.me/v2/bot/message/push",
            messagePayload,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${LINE_CHANNEL_ACCESS_TOKEN.trim()}`,
                },
            }
        );
        console.log(`LINE Flex Notification sent successfully for wish ID: ${event.params.docId}`);
    } catch (error: any) {
        console.error("Failed to send LINE Flex notification:", JSON.stringify(error.response?.data) || error.message);
    }
});

/**
 * 可呼叫的 Cloud Function：原子性地遞增工具點擊次數
 * 接受 { toolId: number }，更新 toolUsageStats/{toolId} 的 totalClicks 與 lastClickedAt
 */
export const incrementToolClick = onCall(async (request) => {
    const toolId = request.data?.toolId;

    // 驗證 toolId 為 1~200 之間的數字
    if (typeof toolId !== "number" || !Number.isInteger(toolId) || toolId < 1 || toolId > 200) {
        throw new HttpsError(
            "invalid-argument",
            "toolId must be an integer between 1 and 200."
        );
    }

    const docRef = admin.firestore().collection("toolUsageStats").doc(String(toolId));

    await docRef.set(
        {
            totalClicks: admin.firestore.FieldValue.increment(1),
            lastClickedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
    );

    return { success: true, toolId };
});
