/**
 * 共用 Google Chat Webhook 推送 helper (v3.6.81)
 *
 * 負責將純文字與卡片式訊息 (cardsV2) 推送至 Google Chat 空間。
 * 遵循手機推播最佳實踐，確保 Payload 最外層包含 `text` 以利通知欄正常顯示。
 */

import axios from "axios";

export async function pushToGoogleChat(
    webhookUrl: string | undefined,
    text: string,
    cardsV2?: any[],
    contextLabel: string = "GoogleChat"
): Promise<void> {
    if (!webhookUrl || webhookUrl === "PLACEHOLDER_NOT_CONFIGURED" || webhookUrl.trim() === "") {
        console.warn(
            `[${contextLabel}] GOOGLE_CHAT_WEBHOOK_URL 未配置或無效，略過 Google Chat 通知發送。`
        );
        return;
    }

    const payload: any = {
        text: text.slice(0, 1000), // Google Chat 限制 text 長度
    };

    if (cardsV2 && Array.isArray(cardsV2) && cardsV2.length > 0) {
        payload.cardsV2 = cardsV2;
    }

    const url = webhookUrl.trim();
    try {
        const response = await axios.post(url, payload, {
            headers: {
                "Content-Type": "application/json",
            },
            timeout: 10000, // 10 秒超時，防止 Cloud Function 卡死
        });
        const messageName = response.data?.name ? ` message=${response.data.name}` : "";
        console.log(`[${contextLabel}] Google Chat Notification sent successfully. status=${response.status}${messageName}`);
    } catch (error: any) {
        console.error(
            `[${contextLabel}] Failed to send Google Chat notification:`,
            JSON.stringify(error.response?.data) || error.message
        );

        if (!cardsV2 || !Array.isArray(cardsV2) || cardsV2.length === 0) return;

        try {
            const fallbackResponse = await axios.post(url, {
                text: `${text.slice(0, 900)}\n\n(卡片格式被 Google Chat 拒收，已改送純文字備援)`,
            }, {
                headers: {
                    "Content-Type": "application/json",
                },
                timeout: 10000,
            });
            const fallbackMessageName = fallbackResponse.data?.name ? ` message=${fallbackResponse.data.name}` : "";
            console.log(`[${contextLabel}] Google Chat fallback text notification sent successfully. status=${fallbackResponse.status}${fallbackMessageName}`);
        } catch (fallbackError: any) {
            console.error(
                `[${contextLabel}] Failed to send Google Chat fallback text notification:`,
                JSON.stringify(fallbackError.response?.data) || fallbackError.message
            );
        }
    }
}
