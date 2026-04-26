"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incrementToolClick = exports.onReviewCreated = exports.onWishCreated = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const https_1 = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const axios_1 = require("axios");
// 初始化 Firebase Admin
admin.initializeApp();
// 從環境變數中取得 LINE 官方帳號的 Token 與推播對象 ID
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_NOTIFY_TOKEN;
const LINE_ADMIN_USER_ID = process.env.LINE_ADMIN_USER_ID;
// 對外公開站點（供 LINE 卡片裡的「打開查看」按鈕用）
const SITE_BASE = "https://cagoooo.github.io/Akai";
// ────────────────────────────────────────────────────────────
// 共用：把任意 Flex Message bubble 推給管理員
// ────────────────────────────────────────────────────────────
async function pushFlexToAdmin(altText, bubble, contextLabel) {
    if (!LINE_CHANNEL_ACCESS_TOKEN || !LINE_ADMIN_USER_ID) {
        console.error(`[${contextLabel}] 尚未配置 LINE_NOTIFY_TOKEN 或 LINE_ADMIN_USER_ID，無法發送通知。`);
        return;
    }
    const payload = {
        to: LINE_ADMIN_USER_ID.trim(),
        messages: [
            {
                type: "flex",
                altText,
                contents: bubble,
            },
        ],
    };
    try {
        await axios_1.default.post("https://api.line.me/v2/bot/message/push", payload, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${LINE_CHANNEL_ACCESS_TOKEN.trim()}`,
            },
        });
        console.log(`[${contextLabel}] LINE Flex Notification sent successfully.`);
    }
    catch (error) {
        console.error(`[${contextLabel}] Failed to send LINE Flex notification:`, JSON.stringify(error.response?.data) || error.message);
    }
}
/**
 * 監聽 wishingWell 集合中的新增文件
 * 當有新的許願/回饋寫入時，透過 LINE 官方帳號傳送「卡片格式」通知給管理員
 */
exports.onWishCreated = (0, firestore_1.onDocumentCreated)("wishingWell/{docId}", async (event) => {
    // 若沒有取得資料則略過
    const snapshot = event.data;
    if (!snapshot)
        return;
    // 讀取寫入的許願內容
    const data = snapshot.data();
    const userName = data.userName || "未具名使用者";
    const typeValue = data.type;
    const typeLabel = typeValue === "suggestion" ? "💡 新建議" : "⭐ 系統評分";
    const typeColor = typeValue === "suggestion" ? "#00B900" : "#FF9900"; // 建議用綠綠的，評分用橘黃的
    const content = data.content || "(無內容)";
    const rating = data.rating;
    // --- 構建 Flex Message 的 Body 區塊 ---
    const bodyContents = [
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
    bodyContents.push({ type: "separator", margin: "lg" }, {
        type: "box",
        layout: "vertical",
        contents: [
            { type: "text", text: "📝 內容：", color: "#8c8c8c", size: "sm", margin: "md" },
            { type: "text", text: content, wrap: true, color: "#111111", size: "md", margin: "sm" }
        ]
    });
    const bubble = {
        type: "bubble",
        styles: { header: { backgroundColor: "#27BDBE" } },
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
                    align: "center",
                },
            ],
        },
        body: {
            type: "box",
            layout: "vertical",
            spacing: "sm",
            contents: bodyContents,
        },
    };
    await pushFlexToAdmin(`收到來自「許願池」的新回饋：${typeLabel}`, bubble, `wish:${event.params.docId}`);
});
/**
 * 監聽 toolReviews 集合中的新增文件
 * 當教師對工具發表評論時，推播「工具評論卡片」給管理員
 */
exports.onReviewCreated = (0, firestore_1.onDocumentCreated)("toolReviews/{docId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot)
        return;
    const data = snapshot.data();
    const toolId = data.toolId;
    const toolTitle = data.toolTitle || `工具 #${toolId}`;
    const userName = data.userName || "匿名使用者";
    const userPhoto = data.userPhoto || null;
    const ratingNum = typeof data.rating === "number" ? Math.max(1, Math.min(5, data.rating)) : 0;
    const comment = data.comment || "(無內容)";
    const starText = "⭐".repeat(ratingNum) + "☆".repeat(5 - ratingNum);
    const toolUrl = `${SITE_BASE}/?tool=${toolId}`;
    // ── Body：工具名稱 / 評論者 / 星等 / 評論內容 ──────────
    const bodyContents = [
        {
            type: "box",
            layout: "horizontal",
            contents: [
                { type: "text", text: "🛠️ 工具", color: "#8c8c8c", size: "sm", flex: 3 },
                { type: "text", text: toolTitle, color: "#111111", size: "sm", wrap: true, flex: 7, weight: "bold" },
            ],
            margin: "md",
        },
        {
            type: "box",
            layout: "horizontal",
            contents: [
                { type: "text", text: "👤 教師", color: "#8c8c8c", size: "sm", flex: 3 },
                { type: "text", text: userName, color: "#111111", size: "sm", wrap: true, flex: 7, weight: "bold" },
            ],
            margin: "md",
        },
        {
            type: "box",
            layout: "horizontal",
            contents: [
                { type: "text", text: "🌟 評分", color: "#8c8c8c", size: "sm", flex: 3 },
                {
                    type: "text",
                    text: `${starText}  (${ratingNum}/5)`,
                    color: "#ffb81c",
                    size: "sm",
                    wrap: true,
                    flex: 7,
                    weight: "bold",
                },
            ],
            margin: "md",
        },
        { type: "separator", margin: "lg" },
        {
            type: "box",
            layout: "vertical",
            contents: [
                { type: "text", text: "💬 評論內容：", color: "#8c8c8c", size: "sm", margin: "md" },
                { type: "text", text: comment, wrap: true, color: "#111111", size: "md", margin: "sm" },
            ],
        },
    ];
    // ── Bubble：青色頭部 + 大頭照（可選） + 「打開查看」按鈕 ──────────
    const bubble = {
        type: "bubble",
        styles: { header: { backgroundColor: "#7a8c3a" } }, // cork 橄欖綠，與站台一致
        header: {
            type: "box",
            layout: "vertical",
            contents: [
                {
                    type: "text",
                    text: "📝 工具收到新評論",
                    color: "#FFFFFF",
                    weight: "bold",
                    size: "lg",
                    align: "center",
                },
            ],
        },
        body: {
            type: "box",
            layout: "vertical",
            spacing: "sm",
            contents: bodyContents,
        },
        footer: {
            type: "box",
            layout: "vertical",
            spacing: "sm",
            contents: [
                {
                    type: "button",
                    style: "primary",
                    color: "#ea8a3e", // cork 橘
                    height: "sm",
                    action: {
                        type: "uri",
                        label: "打開工具頁面",
                        uri: toolUrl,
                    },
                },
            ],
        },
    };
    // 如果使用者有頭像，加入 hero 區塊
    if (userPhoto && /^https:\/\//.test(userPhoto)) {
        bubble.hero = {
            type: "image",
            url: userPhoto,
            size: "sm",
            aspectMode: "cover",
            aspectRatio: "1:1",
        };
    }
    await pushFlexToAdmin(`「${toolTitle}」收到 ${userName} 的 ${ratingNum} 星評論`, bubble, `review:${event.params.docId}`);
});
/**
 * 可呼叫的 Cloud Function：原子性地遞增工具點擊次數
 * 接受 { toolId: number }，更新 toolUsageStats/{toolId} 的 totalClicks 與 lastClickedAt
 */
exports.incrementToolClick = (0, https_1.onCall)(async (request) => {
    const toolId = request.data?.toolId;
    // 驗證 toolId 為 1~200 之間的數字
    if (typeof toolId !== "number" || !Number.isInteger(toolId) || toolId < 1 || toolId > 200) {
        throw new https_1.HttpsError("invalid-argument", "toolId must be an integer between 1 and 200.");
    }
    const docRef = admin.firestore().collection("toolUsageStats").doc(String(toolId));
    await docRef.set({
        totalClicks: admin.firestore.FieldValue.increment(1),
        lastClickedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    return { success: true, toolId };
});
//# sourceMappingURL=index.js.map