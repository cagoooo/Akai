/**
 * lineTalkWebhook — 2026 AIFED 演講「現場提問」LINE Bot inbound webhook
 *
 * 流程：
 *   1. 觀眾掃 closing slide 的 LINE OA QR 加好友
 *   2. 觀眾傳訊息到 LINE Bot（會被 LINE 推到此 webhook）
 *   3. 此函式驗證 X-Line-Signature → 解析 message event → 寫 Firestore talkQuestions
 *   4. 簡報內 live-questions.html 用 onSnapshot 即時顯示
 *
 * Secret: TALK_LINE_CHANNEL_SECRET（演講專用 LINE Channel 的 Channel Secret，HMAC-SHA256 簽章驗證用）
 *
 * **設計決策（重要）**：
 *   - 必須**新建專屬 LINE Channel**（不能共用阿凱現有 Channel 2008810864 — 既有 webhook 在 smes-e1dc3）
 *   - 純 inbound，不需要 Channel Access Token 也不 reply（簡化部署）
 *   - userId 用 SHA-256 hash 截 8 字（隱私保護 — Firestore 公開可讀，原 LINE userId 不該外洩）
 *   - 訊息 > 500 字直接丟棄（防灌水）
 *
 * 部署：
 *   printf "演講 Channel Secret" | firebase functions:secrets:set TALK_LINE_CHANNEL_SECRET --data-file -
 *   firebase deploy --only functions:lineTalkWebhook
 *
 * LINE Developer Console 設定 webhook URL：
 *   https://us-central1-akai-e693f.cloudfunctions.net/lineTalkWebhook
 *   啟用「Use webhook」+ 關閉「Auto-reply messages」+ 關閉「Greeting messages」
 */

import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import * as crypto from "crypto";
import * as logger from "firebase-functions/logger";

const TALK_LINE_CHANNEL_SECRET = defineSecret("TALK_LINE_CHANNEL_SECRET");

const MAX_MESSAGE_LENGTH = 500;
const MAX_EVENTS_PER_REQUEST = 50;

/**
 * 把 LINE userId（U + 32 hex）hash 成 8 字 SHA-256 prefix。
 * 保留同使用者多訊息可關聯（同 hash），但無法反推真實 userId。
 */
function hashUserId(uid: string): string {
  return crypto.createHash("sha256").update(uid).digest("hex").slice(0, 8);
}

export const lineTalkWebhook = onRequest(
  {
    secrets: [TALK_LINE_CHANNEL_SECRET],
    region: "us-central1",
    cors: false, // LINE webhook 不需 CORS
    invoker: "public", // LINE 從 IP 直連，不走 Firebase Auth
  },
  async (req, res) => {
    // ── 1. Method check ────────────────────────────────────
    if (req.method !== "POST") {
      res.status(405).send("method not allowed");
      return;
    }

    // ── 2. Validate X-Line-Signature ────────────────────────
    // 必須用 req.rawBody（不能 JSON.stringify(req.body)，順序/空白會差）
    const signature = (req.headers["x-line-signature"] as string) || "";
    const channelSecret = TALK_LINE_CHANNEL_SECRET.value();
    if (!channelSecret) {
      logger.error("[lineTalkWebhook] TALK_LINE_CHANNEL_SECRET 未設定");
      res.status(500).send("server config missing");
      return;
    }
    const rawBody = req.rawBody;
    if (!rawBody) {
      res.status(400).send("missing body");
      return;
    }
    const expected = crypto
      .createHmac("sha256", channelSecret)
      .update(rawBody)
      .digest("base64");
    if (signature !== expected) {
      logger.warn("[lineTalkWebhook] 簽章不符", {
        gotLen: signature.length,
        expectedLen: expected.length,
      });
      res.status(401).send("invalid signature");
      return;
    }

    // ── 3. Parse events ─────────────────────────────────────
    const events: Array<Record<string, unknown>> = Array.isArray(req.body?.events)
      ? req.body.events
      : [];
    if (events.length === 0) {
      // LINE Verify 按鈕會送空 events — 回 200 OK 才算 verify 成功
      res.status(200).send("OK");
      return;
    }
    if (events.length > MAX_EVENTS_PER_REQUEST) {
      logger.warn("[lineTalkWebhook] events 過多，截斷", { count: events.length });
      events.length = MAX_EVENTS_PER_REQUEST;
    }

    // ── 4. Write to Firestore talkQuestions ─────────────────
    const db = admin.firestore();
    const results = await Promise.allSettled(
      events.map(async (ev) => {
        const evType = (ev as any).type;
        const message = (ev as any).message;
        const source = (ev as any).source;

        // 只處理文字訊息事件
        if (evType !== "message" || message?.type !== "text") {
          return { skipped: true, reason: `${evType}/${message?.type}` };
        }
        const rawText = String(message.text || "").trim();
        if (!rawText) return { skipped: true, reason: "empty" };
        if (rawText.length > MAX_MESSAGE_LENGTH) {
          return { skipped: true, reason: "too_long" };
        }

        const userId = source?.userId ? hashUserId(source.userId) : "anon";
        const msgId =
          message.id ||
          `${(ev as any).timestamp}_${userId}`;
        const docRef = db.collection("talkQuestions").doc(String(msgId));

        await docRef.set({
          text: rawText,
          userIdHash: userId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          timestamp: (ev as any).timestamp || Date.now(),
          source: source?.type || "user",
        });
        return { written: true, msgId };
      }),
    );

    const written = results.filter(
      (r) => r.status === "fulfilled" && (r.value as any)?.written,
    ).length;
    const skipped = results.filter(
      (r) => r.status === "fulfilled" && (r.value as any)?.skipped,
    ).length;
    const failed = results.filter((r) => r.status === "rejected").length;
    logger.info("[lineTalkWebhook] 處理完成", {
      total: events.length,
      written,
      skipped,
      failed,
    });

    res.status(200).send("OK");
  },
);
