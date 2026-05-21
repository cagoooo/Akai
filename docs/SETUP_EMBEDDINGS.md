# Gemini Embedding 語意搜尋啟用步驟

> #100 工具索引神器升級到語意搜尋。沒設好以下步驟也不影響網站，會自動 fallback 到 fuzzy 模式（toggle 不會出現）。

## 一次性 Setup

### 1. 拿 Gemini API key

到 [Google AI Studio](https://aistudio.google.com/app/apikey)：
- 登入 `ipad@mail2.smes.tyc.edu.tw`
- 點「**Create API Key**」
- 選「Create API key in new project」（或選既有 `akai-e693f`）
- 複製 key（`AIzaSy...` 開頭 39 字元）

### 2. 把 key 加進本地 .env（給 build script 用）

```bash
cd H:/Akai
echo 'GEMINI_API_KEY="AIzaSy..."' >> .env
```

### 3. 跑 build script 算 97 個工具的 embeddings

```bash
node scripts/generate-tool-embeddings.mjs
```

預期：
```
🔑 用本地 .env 的 GEMINI_API_KEY
📚 將 97 個工具 embed（模型 gemini-embedding-001，768 維）
  ✅ #97 MBTI 校園奇遇記
✨ 完成：97 成功，0 失敗
📦 寫入 client/public/api/tool-embeddings.json (~0.4 MB)
```

### 4. 把 key 灌進 Firebase Secret（給 Cloud Function 用）

⚠️ 絕對不要把 key 貼進 chat / email / shell history，**用 pipe 模式**：

```powershell
# Windows PowerShell：
'AIzaSy...' | firebase functions:secrets:set GEMINI_API_KEY --account=ipad@mail2.smes.tyc.edu.tw
```

或 Bash：
```bash
printf '%s' 'AIzaSy...' | firebase functions:secrets:set GEMINI_API_KEY --account=ipad@mail2.smes.tyc.edu.tw
```

### 5. 部署 Cloud Function

```bash
firebase deploy --only functions:embedQuery --account=ipad@mail2.smes.tyc.edu.tw
```

預期看到：
```
✔ functions[embedQuery(asia-east1)] Successful create operation.
```

### 6. 驗證上線

打開 https://cagoooo.github.io/Akai/tool/100/

- 應該看到「🔍 搜尋模式」toggle：⚡ 字面比對 / 🧠 語意搜尋 BETA
- 切到語意搜尋，輸入「**我想讓害羞學生敢開口**」
- 看是否找到 #3 投票 / #97 MBTI 等抽象命中的工具

## 日常維護

### 新增工具後重算 embeddings

每次 `npm run new-tool` 加新工具後：
```bash
node scripts/generate-tool-embeddings.mjs
git add client/public/api/tool-embeddings.json
git commit -m "🧠 重算 tool embeddings (含 #N)"
git push
```

也可以接進 `npm run build`（自動同步），但要小心 CI 上沒 GEMINI_API_KEY 會 fail（script 已處理：沒 key 就跳過不 fail）。

### 翻新 key（每 90 天建議）

```powershell
# 1. 拿新 key 從 AI Studio
# 2. 同步本地 .env
# 3. 同步 Firebase Secret（用 pipe 模式）
'NEW_AIzaSy...' | firebase functions:secrets:set GEMINI_API_KEY --account=ipad@mail2.smes.tyc.edu.tw
# 4. 重新部署 function（讓它讀新 secret）
firebase deploy --only functions:embedQuery --account=ipad@mail2.smes.tyc.edu.tw
# 5. 刪舊 key 在 Google AI Studio
```

## 故障排除

### Toggle 不出現

代表 tool-embeddings.json 沒部署到 GH Pages。檢查：
```bash
curl -sI https://cagoooo.github.io/Akai/api/tool-embeddings.json
# 期望: HTTP 200
```

如果是 404 → 看 dist/public/api/tool-embeddings.json 是否存在 → 跑 `node scripts/generate-tool-embeddings.mjs`

### 「⚠️ 語意搜尋失敗，改用字面比對」

- Cloud Function 未部署：跑 step 5
- GEMINI_API_KEY secret 未設：跑 step 4
- Quota 爆了：等 1 分鐘 / 看 GCP console quota
- Function logs: `firebase functions:log --account=ipad@mail2.smes.tyc.edu.tw`

### 「請先登入」錯誤

Cloud Function 要求 `request.auth.uid` 不能為 null。client 已有 `ensureSignedIn()` 自動匿名登入，但如果使用者 block 第三方 cookie / Safari ITP 阻擋 → 看 console。

## 成本控制

- Embedding build-time（97 工具一次）：< $0.01 USD
- Embedding runtime（per query）：Free tier 1500 / min 對教師量綽綽有餘
- Cloud Function maxInstances: 5（防 cold start 失控）
- per-uid rate limit: 20 / min（防單一使用者爆量）

如果要更嚴的保護：加 Cloudflare Turnstile（見 `cloudflare-turnstile-integration` skill）

## 跟其他 skill 的關係

- **gcp-api-key-secure-create**：API key 應該用 gcloud 建立 + restrict + Secret Manager 灌入
- **gemini-api-integration**：Gemini 模型版本管理（避免用到棄用版本）
- **gemini-free-tier-first**：免費層成本估算與防護
- **cloudflare-turnstile-integration**：進階防爆量（教師量級別暫不需要）
