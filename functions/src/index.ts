import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { pushFlexToAdmin } from "./lib/lineNotify";

// 初始化 Firebase Admin
admin.initializeApp();

// 排程備份功能（每日快照 + 還原）
export { dailySnapshot, restoreFromSnapshot } from "./dailySnapshot";

// 🆕 v3.6.36: Gemini Embedding 語意搜尋（給 #100 工具索引神器升級用）
// 需要 Firebase Secret: GEMINI_API_KEY
// 部署：firebase functions:secrets:set GEMINI_API_KEY && firebase deploy --only functions:embedQuery
export { embedQuery } from "./embedQuery";

// 🆕 v3.6.53: Anonymous Auth health check（防 Identity Toolkit anonymous provider 漂移被關）
// - verifyAnonAuthDaily：每天 02:00 (Asia/Taipei) 自動檢查 + 修復
// - verifyAnonAuthNow：admin onCall，手動觸發
export { verifyAnonAuthDaily, verifyAnonAuthNow } from "./verifyAnonAuth";

// 🆕 v3.6.67: 2026 AIFED 演講「現場提問」LINE Bot inbound webhook
// 觀眾掃 closing slide LINE OA QR → 加好友 → 傳訊息 → 寫 Firestore talkQuestions
// 簡報內 live-questions.html 用 onSnapshot 即時顯示
// Secret: TALK_LINE_CHANNEL_SECRET (printf "..." | firebase functions:secrets:set ...)
export { lineTalkWebhook } from "./lineTalkWebhook";

// 對外公開站點（供 LINE 卡片裡的「打開查看」按鈕用）
const SITE_BASE = "https://cagoooo.github.io/Akai";

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

    await pushFlexToAdmin(
        `收到來自「許願池」的新回饋：${typeLabel}`,
        bubble,
        `wish:${event.params.docId}`
    );
});

/**
 * 監聽 toolReviews 集合中的新增文件
 * 當教師對工具發表評論時，推播「工具評論卡片」給管理員
 */
export const onReviewCreated = onDocumentCreated("toolReviews/{docId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

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
    const bodyContents: any[] = [
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
    const bubble: any = {
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

    await pushFlexToAdmin(
        `「${toolTitle}」收到 ${userName} 的 ${ratingNum} 星評論`,
        bubble,
        `review:${event.params.docId}`
    );
});

/** 取得 Asia/Taipei 當日 YYYY-MM-DD（與 dailySnapshot 一致） */
function todayInTaipei(): string {
    const fmt = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Taipei",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
    return fmt.format(new Date());
}

/** 把任意 referrer URL 正規化成「來源類別」+「host」（給 toolClickEvents 統計用）*/
function classifyReferrer(rawReferrer: string | undefined | null): { category: string; host: string } {
    if (!rawReferrer || typeof rawReferrer !== "string") return { category: "direct", host: "" };
    let host = "";
    try {
        host = new URL(rawReferrer).hostname.toLowerCase();
    } catch {
        return { category: "direct", host: "" };
    }
    if (!host) return { category: "direct", host: "" };
    // 自己站內導流不算流量源
    if (host.includes("cagoooo.github.io")) return { category: "internal", host };
    if (host.includes("line.me") || host.includes("liff.line")) return { category: "line", host };
    if (host.includes("facebook.com") || host.includes("fb.com") || host.includes("m.facebook")) return { category: "facebook", host };
    if (host.includes("google.")) return { category: "google", host };
    if (host.includes("youtube.com") || host.includes("youtu.be")) return { category: "youtube", host };
    if (host.includes("instagram.com")) return { category: "instagram", host };
    if (host.includes("threads.net")) return { category: "threads", host };
    if (host.includes("twitter.com") || host.includes("x.com") || host.includes("t.co")) return { category: "twitter", host };
    if (host.includes("bing.com")) return { category: "bing", host };
    if (host.includes("yahoo.")) return { category: "yahoo", host };
    if (host.endsWith(".edu.tw") || host.includes("tyc.edu.tw")) return { category: "school", host };
    if (host.includes("notion.")) return { category: "notion", host };
    if (host.includes("padlet.com")) return { category: "padlet", host };
    return { category: "other", host };
}

/** rawRequest header 抓國別（Cloudflare / Fastly / GAE 三種）— 取不到回 "unknown" */
function detectCountry(rawReq: any): string {
    if (!rawReq?.headers) return "unknown";
    const h = rawReq.headers;
    const get = (k: string) => (typeof h[k] === "string" ? h[k] : Array.isArray(h[k]) ? h[k][0] : "");
    const c = get("cf-ipcountry") || get("x-appengine-country") || get("fastly-client-country") || get("x-country-code");
    return (c || "unknown").toUpperCase().slice(0, 2);
}

/**
 * 可呼叫的 Cloud Function：原子性地遞增工具點擊次數 + 寫 event log
 *
 * 寫入兩筆：
 *   1. toolUsageStats/{toolId}：totalClicks / dailyClicks / lastClickedAt（累計快取）
 *   2. toolClickEvents/{auto-id}：個別事件 含 referrer/device/country/sessionId/hour/dateKey
 *      （給後台流量解析切片用，dailySnapshot 自動裁切 90 天）
 *
 * 接受 request.data（皆 optional）：
 *   - toolId (required, 1-200)
 *   - referrer  (client 端 document.referrer)
 *   - device    ('mobile'|'tablet'|'desktop')
 *   - sessionId (client 端 localStorage 持久 UUID)
 */
/**
 * 內部 helper：把工具點擊寫進 Firestore（toolUsageStats + toolClickEvents）
 * 供 incrementToolClick (onCall) 與 beaconToolClick (onRequest HTTP) 共用
 */
async function recordToolClickInternal(opts: {
    toolId: number;
    rawReferrer: string;
    device: string;
    sessionId: string;
    rawRequest: any;
    source?: string; // 'callable' | 'beacon-cockpit' 等，附在 sessionId 區辨來源
}): Promise<{ success: boolean; toolId: number }> {
    const { toolId, rawReferrer, device: deviceRaw, sessionId: sidRaw, rawRequest, source } = opts;

    const docRef = admin.firestore().collection("toolUsageStats").doc(String(toolId));
    const today = todayInTaipei();
    const now = new Date();
    const hourTW = (now.getUTCHours() + 8) % 24;

    // 1. 累計 doc (toolUsageStats)
    const accumulatePromise = docRef.set(
        {
            totalClicks: admin.firestore.FieldValue.increment(1),
            dailyClicks: { [today]: admin.firestore.FieldValue.increment(1) },
            lastClickedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
    );

    // 2. event log (toolClickEvents)
    const { category: referrer, host: referrerHost } = classifyReferrer(rawReferrer);
    const dRaw = String(deviceRaw || "").toLowerCase();
    const device: "mobile" | "tablet" | "desktop" =
        dRaw === "mobile" || dRaw === "tablet" || dRaw === "desktop" ? (dRaw as any) : "desktop";
    const baseSid = String(sidRaw || "").slice(0, 56) || "anon";
    const sessionId = source ? `${source}:${baseSid}`.slice(0, 64) : baseSid;
    const country = detectCountry(rawRequest);

    const eventPromise = admin
        .firestore()
        .collection("toolClickEvents")
        .add({
            toolId,
            dateKey: today,
            hour: hourTW,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            referrer,
            referrerHost: referrerHost.slice(0, 100),
            device,
            country,
            sessionId,
        });

    await accumulatePromise;
    eventPromise.catch((err) => console.warn("[toolClickEvents] write failed:", err));

    return { success: true, toolId };
}

export const incrementToolClick = onCall(
    {
        region: "asia-east1", // 與 embedQuery 對齊；台灣 latency 最低
        memory: "256MiB",
        maxInstances: 10,
    },
    async (request) => {
    const toolId = request.data?.toolId;

    if (typeof toolId !== "number" || !Number.isInteger(toolId) || toolId < 1 || toolId > 200) {
        throw new HttpsError(
            "invalid-argument",
            "toolId must be an integer between 1 and 200."
        );
    }

    return await recordToolClickInternal({
        toolId,
        rawReferrer: request.data?.referrer || "",
        device: String(request.data?.device || ""),
        sessionId: String(request.data?.sessionId || ""),
        rawRequest: request.rawRequest,
    });
    }
);

/**
 * beaconToolClick — HTTP onRequest 版本，供外部站點（例如 cockpit）用
 * `new Image().src` 像素 beacon 即可呼叫，零 CORS 問題、不需 preflight
 *
 * GET /beaconToolClick?toolId=81&referrer=...&device=mobile&sessionId=...
 * → 204 No Content（成功） / 400 invalid toolId / 500 internal error
 *
 * 防 abuse：建議呼叫端用 sessionStorage 去重（同分頁不重複呼叫）；
 * 後端不再額外節流 — 同一 sessionId 仍會記到 toolClickEvents 供後台分析。
 */
export const beaconToolClick = onRequest(
    {
        region: "asia-east1",
        memory: "256MiB",
        maxInstances: 10,
        cors: true, // 開放所有來源；只能 +1 totalClicks 沒敏感資料
    },
    async (req, res) => {
        const toolIdRaw = req.query.toolId ?? (req.body as any)?.toolId;
        const toolId = Number(toolIdRaw);
        if (!Number.isInteger(toolId) || toolId < 1 || toolId > 200) {
            res.status(400).send("invalid toolId");
            return;
        }
        try {
            await recordToolClickInternal({
                toolId,
                rawReferrer:
                    String(req.query.referrer || (req.body as any)?.referrer || "") ||
                    (req.get("referer") || ""),
                device: String(req.query.device || (req.body as any)?.device || "desktop"),
                sessionId: String(req.query.sessionId || (req.body as any)?.sessionId || ""),
                rawRequest: req,
                source: "beacon",
            });
            // 204 No Content — beacon 不關心回應內容
            res.status(204).send();
        } catch (err: any) {
            console.error("beaconToolClick failed:", err);
            res.status(500).send("internal error");
        }
    }
);

/**
 * getToolFlowAnalysis — 後台流量解析（admin only）
 *
 * 輸入：{ toolId, fromDate: 'YYYY-MM-DD', toDate: 'YYYY-MM-DD' }（皆 Asia/Taipei 日曆日）
 * 回傳：{
 *   totalEvents, uniqueSessions,
 *   hourDist: { 0-23: count },         24 小時時段分布
 *   referrerDist: { line: N, ... },    流量來源
 *   deviceDist:   { mobile: N, ... },  裝置
 *   countryDist:  { TW: N, ... }       國別
 * }
 */
export const getToolFlowAnalysis = onCall(
    {
        region: "asia-east1",
        memory: "512MiB",
        maxInstances: 3,
    },
    async (request) => {
        // admin only
        if (!request.auth?.token?.admin) {
            throw new HttpsError("permission-denied", "admin only");
        }
        const toolId = Number(request.data?.toolId);
        const fromDate = String(request.data?.fromDate || "");
        const toDate = String(request.data?.toDate || "");
        if (!Number.isInteger(toolId) || toolId < 1 || toolId > 200) {
            throw new HttpsError("invalid-argument", "toolId out of range");
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fromDate) || !/^\d{4}-\d{2}-\d{2}$/.test(toDate)) {
            throw new HttpsError("invalid-argument", "date must be YYYY-MM-DD");
        }

        let snap;
        try {
            snap = await admin
                .firestore()
                .collection("toolClickEvents")
                .where("toolId", "==", toolId)
                .where("dateKey", ">=", fromDate)
                .where("dateKey", "<=", toDate)
                .get();
        } catch (err: any) {
            // Firestore needs-index error 包成 failed-precondition + 友善訊息
            const msg = String(err?.message || err);
            if (err?.code === 9 || /requires an index/i.test(msg)) {
                throw new HttpsError(
                    "failed-precondition",
                    "Firestore 索引建置中（toolClickEvents/toolId+dateKey），通常 1-5 分鐘可用，請稍後再試"
                );
            }
            throw new HttpsError("internal", `query failed: ${msg.slice(0, 200)}`);
        }

        const hourDist: Record<string, number> = {};
        const referrerDist: Record<string, number> = {};
        const deviceDist: Record<string, number> = {};
        const countryDist: Record<string, number> = {};
        const sessionSet = new Set<string>();
        for (let h = 0; h < 24; h++) hourDist[String(h)] = 0;

        snap.forEach((d) => {
            const e = d.data();
            const hour = typeof e.hour === "number" ? e.hour : 0;
            hourDist[String(hour)] = (hourDist[String(hour)] || 0) + 1;
            const ref = String(e.referrer || "direct");
            referrerDist[ref] = (referrerDist[ref] || 0) + 1;
            const dev = String(e.device || "desktop");
            deviceDist[dev] = (deviceDist[dev] || 0) + 1;
            const c = String(e.country || "unknown");
            countryDist[c] = (countryDist[c] || 0) + 1;
            if (e.sessionId && e.sessionId !== "anon") sessionSet.add(String(e.sessionId));
        });

        return {
            toolId,
            fromDate,
            toDate,
            totalEvents: snap.size,
            uniqueSessions: sessionSet.size,
            hourDist,
            referrerDist,
            deviceDist,
            countryDist,
        };
    }
);
