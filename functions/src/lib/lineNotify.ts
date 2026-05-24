/**
 * 共用 LINE Messaging API 推送 helper
 *
 * 把任意 Flex Message bubble 推給 admin 用戶。
 * 抽出來避免 verifyAnonAuth / onWishCreated / onReviewCreated 三處重複實作。
 *
 * 必要環境變數：
 *   - LINE_NOTIFY_TOKEN：LINE Messaging API channel access token
 *   - LINE_ADMIN_USER_ID：要推送的 admin user ID
 *
 * 兩者皆透過 Cloud Functions runtime env 注入（不是 Secret Manager）。
 */

import axios from "axios";

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_NOTIFY_TOKEN;
const LINE_ADMIN_USER_ID = process.env.LINE_ADMIN_USER_ID;

export async function pushFlexToAdmin(
    altText: string,
    bubble: any,
    contextLabel: string
): Promise<void> {
    if (!LINE_CHANNEL_ACCESS_TOKEN || !LINE_ADMIN_USER_ID) {
        console.error(
            `[${contextLabel}] 尚未配置 LINE_NOTIFY_TOKEN 或 LINE_ADMIN_USER_ID，無法發送通知。`
        );
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
        await axios.post("https://api.line.me/v2/bot/message/push", payload, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN.trim()}`,
            },
        });
        console.log(`[${contextLabel}] LINE Flex Notification sent successfully.`);
    } catch (error: any) {
        console.error(
            `[${contextLabel}] Failed to send LINE Flex notification:`,
            JSON.stringify(error.response?.data) || error.message
        );
    }
}
