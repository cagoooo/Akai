# SETUP_H2 — 2026 AIFED 演講「LINE 現場提問」完整部署指引

> **目的**：演講當天觀眾掃 QR 加 LINE Bot → 傳訊息提問 → 簡報內 `live-questions.html` 大字輪播顯示。
>
> **狀態**：程式碼已 commit（[`functions/src/lineTalkWebhook.ts`](functions/src/lineTalkWebhook.ts) / [`firestore.rules`](firestore.rules) / [`client/public/akai-talk-2026/live-questions.html`](client/public/akai-talk-2026/live-questions.html) / deck-stage.js Q 熱鍵），尚未部署。本文件指引你完成最後 5 個步驟。
>
> **預估時間**：認真做 60-90 分鐘（含 LINE Channel 申請等候時間）。
>
> **重要鐵則**（依 `line-messaging-firebase` skill 雷 #1 + memory 安全約定）：
> - ❌ **絕對不要**把 Channel Secret 透過 chat / email / commit 傳給任何人（包括 Claude）
> - ❌ **絕對不要**用 `echo` / `<<<` 設 secret（會多 `\n` 導致 401 永遠驗章失敗）
> - ✅ 用 `printf '%s' "..." | firebase functions:secrets:set` pipe 進去

---

## ⚠️ 為什麼必須新建 Channel（不能共用阿凱現有 Bot）

阿凱現有 LINE Bot Channel `2008810864` 的 webhook URL 設在 `smes-e1dc3` Firebase project（用於行政綁定流程）。如果改成指向 `akai-e693f` 的 lineTalkWebhook，**會搶走原本的 webhook 事件**，把 smes-e1dc3 的綁定流程整個弄壞。

LINE 規定：**一個 Channel 只能有一個 webhook URL**。所以必須建新 Channel。

演講結束後，這個新 Channel 可以：
- 留著當「阿凱老師問題信箱」常態運作
- 或直接停用（不會影響原有 Bot）

---

## 步驟 1：建立新 LINE Channel（10 分鐘）

1. 進 https://developers.line.biz/console/
2. 用阿凱 LINE 帳號登入（與既有 `2008810864` 同帳號）
3. 選一個既有的 Provider（或新建 Provider「阿凱老師演講」）
4. 點 **「Create a new channel」** → 選 **「Messaging API」**
5. 填基本資料：
   - **Channel name**：`2026 AIFED 演講提問`
   - **Channel description**：`2026 AIFED 學術年會主題演講即時提問頻道 — 黃凱揚（阿凱老師）`
   - **Category**：教育
   - **Subcategory**：學前教育 / 國小教育
   - **Email**：`cagooo@gmail.com`
   - 同意條款 → Create
6. 建立後進新 channel 頁，記下：
   - **Channel ID**（10 字數字）
   - **Bot basic ID**（如 `@xxx450qq`，演講用 QR 會用到）
7. 切到 **「Basic settings」** tab，記下：
   - **Channel secret**（32 字 hex）⚠️ 等等 step 3 用 pipe 進 Firebase
8. 切到 **「Messaging API」** tab：
   - 點底部「**Channel access token (long-lived)**」旁的 **Issue** 產 token（200+ 字）
   - 也記下這個（非必要 — 我們只做 inbound 不需 reply，但留著未來可加 reply 功能）

---

## 步驟 2：設定 LINE OA 回應行為（5 分鐘）

⚠️ **這步沒做的話新 Bot 加好友會回 LINE 內建預設訊息，搶掉我們 webhook 的事件！**

1. 同一個 channel 頁面右上「**LINE Official Account Manager**」連結點進去（或直接 https://manager.line.biz/）
2. 找到新 channel（名稱 `2026 AIFED 演講提問`）
3. 左側選單 → **回應設定**
4. 設定：
   - 「回應模式」選 **Bot**（不是「聊天」）
   - **Greeting messages**（歡迎訊息）→ **關 OFF**
   - **Auto-reply messages**（自動回應）→ **關 OFF**
   - **Webhooks** → **開 ON** ✅（這個是關鍵）

---

## 步驟 3：把 Channel Secret 灌進 Firebase Secrets（5 分鐘）

⚠️ **跟著做，不要先複製 Channel Secret 到任何地方**（不要 chat、不要記事本）。

打開 **PowerShell**（不是 Git Bash — Windows 上 printf 透過 git bash pipe 會被加 CRLF，依 skill 雷 #1）：

```powershell
cd H:\Akai

# 用 Node 寫入暫存檔（保證沒換行符），再透過 --data-file 讀
# 把 "你的_32字_channel_secret_hex" 整段（不含引號）貼進去
node -e "require('fs').writeFileSync('.tmp_secret', '你的_32字_channel_secret_hex')"

# 設 secret
firebase functions:secrets:set TALK_LINE_CHANNEL_SECRET --data-file .tmp_secret --project akai-e693f --account ipad@mail2.smes.tyc.edu.tw

# 立刻刪暫存檔
Remove-Item .tmp_secret
```

**驗證 secret 存進 Firebase**：

```powershell
firebase functions:secrets:access TALK_LINE_CHANNEL_SECRET --project akai-e693f --account ipad@mail2.smes.tyc.edu.tw
# 印出來的內容應該是 32 字 hex（無換行、無前後空白）
```

---

## 步驟 4：部署 Cloud Function + Firestore Rules（10 分鐘）

```powershell
cd H:\Akai

# 先 build functions
cd functions
npm run build
cd ..

# 部署
firebase deploy --only "functions:lineTalkWebhook,firestore:rules" --project akai-e693f --account ipad@mail2.smes.tyc.edu.tw
```

部署過程約 3-5 分鐘。**第一次部署可能 HTTP 500（依 skill 雷 #5）**：

```powershell
# 失敗就重跑一次強制：
firebase deploy --only "functions:lineTalkWebhook" --project akai-e693f --account ipad@mail2.smes.tyc.edu.tw --force
```

部署成功後，Firebase 會印出 webhook URL：

```
✔  functions[us-central1-lineTalkWebhook(us-central1)]: Successful create operation.
Function URL (lineTalkWebhook(us-central1)): https://us-central1-akai-e693f.cloudfunctions.net/lineTalkWebhook
```

**記下這個 URL** ← 下一步要貼進 LINE Console。

---

## 步驟 5：LINE Console 設定 webhook URL（5 分鐘）

1. 回到 LINE Developers Console 新 channel 頁
2. **「Messaging API」** tab → **Webhook settings** 區塊
3. **Webhook URL** 貼上：
   ```
   https://us-central1-akai-e693f.cloudfunctions.net/lineTalkWebhook
   ```
4. 點 **Update** 儲存
5. 點旁邊 **Verify** 按鈕測試：
   - ✅ 顯示 **Success** → webhook 正確聯通
   - ❌ 顯示 401 → secret 結尾有 `\n`（回 step 3 用 Node 重寫暫存檔）
   - ❌ 顯示 500 → 看 functions log: `firebase functions:log --only lineTalkWebhook --lines 20 --project akai-e693f`
6. **Use webhook** 開關 → **ON**

---

## 步驟 6：下載 Bot QR 放到簡報資產夾（5 分鐘）

1. LINE Console 新 channel → **「Messaging API」** tab → 找 **「QR code」** 區塊
2. 下載 PNG 檔
3. 改名 `qr-line-talk.png` 放到 `client/public/akai-talk-2026/assets/qr-line-talk.png`
4. **重要**：QR Code URL **必須**用 `qr-official.line.me/sid/M/<basicID去掉@>.png`（依 skill 雷 #6）
   - 例如 Bot basic ID 是 `@abc123def`，QR URL 是 `https://qr-official.line.me/sid/M/abc123def.png`
   - **不要**用 `/L/<channelId>.png`，那是 Login channel，掃了會「無法加入好友」
5. （選）更新 `client/public/akai-talk-2026/live-questions.html` 加入 Bot QR 顯示（目前是 placeholder，你下載完 QR 後加進去）

最簡的整合方式：

```diff
   <header>
     <div class="brand">🎤 現場提問實況 <span class="accent">· 2026 AIFED</span></div>
+    <img src="assets/qr-line-talk.png" alt="LINE Bot 加好友 QR" style="width:80px;height:80px;border:2px solid #F4F0E6;border-radius:8px;background:#fff;padding:4px;" />
     <div class="stats">
```

---

## 步驟 7：端到端測試（5 分鐘）

1. 用你自己的 LINE App 掃 step 6 下載的 QR → 加新 Bot 為好友
2. 直接傳一則訊息（例：「測試訊息 1」）
3. 觀察：
   - **Firestore Console**：https://console.firebase.google.com/project/akai-e693f/firestore/data/~2FtalkQuestions → 應出現一筆 doc
   - **`https://cagoooo.github.io/Akai/akai-talk-2026/live-questions.html`** 開來看 → 訊息應即時出現
4. 簡報開著時按 **Q** 鍵 → 應在新分頁開 live-questions.html

---

## 演講當天 SOP

1. 簡報跑到 **第一幕「困境」之前**（slide 5 左右）的暖場：
   - 切到投票 demo（既有 #3 投票 QR）
2. 簡報跑到 **closing slide**：
   - 按 **Q** 鍵 → 投影第二屏顯示 live-questions.html
   - 口頭引導：「現在請大家拿手機掃這個 LINE QR 加好友，有問題隨時傳訊息給我，會即時出現在大螢幕上」
3. 演講結束：
   - 不需要關閉 webhook，Channel 可留著繼續用
   - 想停用就回 LINE Console → Messaging API → Webhook **OFF** 即可

---

## Troubleshooting

| 問題 | 怎麼修 |
|---|---|
| LINE Verify 401 | Secret 結尾有 `\n` → step 3 用 Node 重寫 |
| LINE Verify 500 | `firebase functions:log` 看錯誤；通常是 secret 沒設或 build 沒完整 |
| 收不到訊息 | LINE OA Manager 沒關 auto-reply / 沒開 webhook（回 step 2）|
| 訊息收到但 live-questions.html 沒顯示 | Firestore rules 沒部署 → 重跑 step 4 |
| QR 掃描「無法加好友」 | 用錯 QR endpoint（`/L/` 換 `/M/`，看 step 6）|
| 訊息 > 500 字被丟棄 | 預期行為，避免灌水。要改的話編 lineTalkWebhook.ts 內 `MAX_MESSAGE_LENGTH` |

---

## 已交付清單

- ✅ `functions/src/lineTalkWebhook.ts` — Cloud Function code（HMAC-SHA256 簽章驗證 + Firestore 寫入）
- ✅ `functions/src/index.ts` — export 已加入
- ✅ `firestore.rules` — `talkQuestions` 公開可讀
- ✅ `client/public/akai-talk-2026/live-questions.html` — 即時輪播頁面
- ✅ `client/public/akai-talk-2026/deck-stage.js` — Q 熱鍵 + ? overlay 提示
- ⏳ **你要做的**：步驟 1-7（LINE Channel 申請 + secret pipe + 部署 + QR 下載 + 測試）
