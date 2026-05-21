/**
 * embedQuery Cloud Function — 用 Gemini Embedding API 把使用者輸入的 query 轉成向量
 *
 * 流程：
 *   1. client ToolIndexAI 輸入「我想讓害羞學生敢開口」
 *   2. 呼叫此 onCall function
 *   3. 拿 query 走 Gemini Embedding (taskType=RETRIEVAL_QUERY)
 *   4. 回傳向量 → client 跟 tool-embeddings.json 算 cosine similarity → top 5
 *
 * Secret: GEMINI_API_KEY（用 firebase functions:secrets:set GEMINI_API_KEY 設）
 *
 * Rate limit: 用 Firebase Auth UID 做 per-user 限流，避免單一使用者爆 API
 * Free tier: 1500 RPM 對教師量很夠用
 */

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import axios from "axios";
import * as admin from "firebase-admin";

const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

const MODEL = "gemini-embedding-001";
const OUTPUT_DIM = 768; // 與 generate-tool-embeddings.mjs 同維度

// 簡易 per-uid rate limit（記憶體版，function instance 內共享）
const requestLog = new Map<string, number[]>();
const MAX_REQUESTS_PER_MIN = 20; // 每使用者每分鐘最多 20 次（搜尋 debounced 500ms，正常人用不到）
const WINDOW_MS = 60 * 1000;

function checkRateLimit(uid: string): boolean {
    const now = Date.now();
    const log = requestLog.get(uid) || [];
    // 清掉超過 1 分鐘的紀錄
    const recent = log.filter((ts) => now - ts < WINDOW_MS);
    if (recent.length >= MAX_REQUESTS_PER_MIN) return false;
    recent.push(now);
    requestLog.set(uid, recent);
    return true;
}

export const embedQuery = onCall(
    {
        secrets: [GEMINI_API_KEY],
        cors: ["https://cagoooo.github.io"],
        region: "asia-east1", // 台灣 latency 最低
        memory: "256MiB",
        maxInstances: 5, // 防爆 quota，正常 5 個 instance 撐得住 20 req/s
    },
    async (request) => {
        // ── 1. 認證檢查 ──
        const uid = request.auth?.uid;
        if (!uid) {
            throw new HttpsError(
                "unauthenticated",
                "請先登入（含匿名 auth）才能使用語意搜尋",
            );
        }

        // ── 2. 速率限制 ──
        if (!checkRateLimit(uid)) {
            throw new HttpsError(
                "resource-exhausted",
                "請稍等 1 分鐘後再試（每分鐘上限 20 次）",
            );
        }

        // ── 3. 參數驗證 ──
        const query: string = String(request.data?.query || "").trim();
        if (!query) throw new HttpsError("invalid-argument", "query 不可為空");
        if (query.length > 200) {
            throw new HttpsError("invalid-argument", "query 太長（上限 200 字）");
        }

        // ── 4. 呼叫 Gemini Embedding API ──
        const apiKey = GEMINI_API_KEY.value();
        if (!apiKey || apiKey === "PLACEHOLDER_NOT_CONFIGURED") {
            // fail-open：沒設 secret 不要擋線上，回 503 client 自動 fallback fuzzy
            console.warn("[embedQuery] GEMINI_API_KEY 未設，語意搜尋不可用");
            throw new HttpsError(
                "failed-precondition",
                "語意搜尋功能尚未啟用（管理員未設 Gemini API key）",
            );
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:embedContent?key=${apiKey}`;
        try {
            const resp = await axios.post(
                url,
                {
                    content: { parts: [{ text: query }] },
                    taskType: "RETRIEVAL_QUERY",
                    outputDimensionality: OUTPUT_DIM,
                },
                { timeout: 8000 },
            );

            const vector = resp.data?.embedding?.values;
            if (!Array.isArray(vector)) {
                throw new HttpsError("internal", "Gemini API 回傳格式異常");
            }

            // ── 5. 記錄查詢到 Firestore（同 logToolIndexQuery）— 但這次走 server-side ──
            try {
                const hash = simpleHash(query);
                const ref = admin.firestore()
                    .collection("analytics")
                    .doc("toolIndexQueries")
                    .collection("queries")
                    .doc(hash);
                const snap = await ref.get();
                if (snap.exists) {
                    await ref.update({
                        count: admin.firestore.FieldValue.increment(1),
                        lastUsedAt: new Date().toISOString(),
                        mode: "semantic",
                    });
                } else {
                    await ref.set({
                        query,
                        count: 1,
                        firstSeenAt: new Date().toISOString(),
                        lastUsedAt: new Date().toISOString(),
                        mode: "semantic",
                    });
                }
            } catch (e) {
                // 紀錄失敗不影響主流程
                console.warn("[embedQuery] log to Firestore failed", e);
            }

            return {
                vector,
                model: MODEL,
                dimensions: OUTPUT_DIM,
            };
        } catch (err: unknown) {
            if (err instanceof HttpsError) throw err;
            const msg = err instanceof Error ? err.message : String(err);
            console.error("[embedQuery] Gemini API failed", msg);
            throw new HttpsError("internal", `Embedding 失敗：${msg.slice(0, 100)}`);
        }
    },
);

function simpleHash(s: string): string {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    return Math.abs(h).toString(36);
}
