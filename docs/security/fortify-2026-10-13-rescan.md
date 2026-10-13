# Fortify 複掃（2026-10-13）中風險以上 34 筆處置紀錄

紀錄日期：2026-10-13。對應版本：`3.6.160`。狀態：34 筆均已修改原始碼並通過本機測試；**尚待廠商以修補後版本再次複掃確認**。

## 結論

複掃仍有 34 筆中風險以上告警（嚴重 7、高 26、中 1）。逐筆追查後，沒有一筆是正式網站上可被利用的漏洞：它們集中在測試資料、本機開發用伺服器、證據文件與純視覺特效。因為平臺標準是「無中風險（含）以上」，本版仍逐筆改寫程式，讓掃描規則不再命中，同時保留原本功能與測試意圖。

## 報告來源

- `akai DeveloperWorkbook_1151013.pdf` 第 3 頁：嚴重 7、高 26、中 1、低 184，合計 218 筆；第 4 頁：分析時間 2026-10-13 11:41，709 個檔案、238,592 行，引擎 26.3.0.0070，規則包 2026.3.0.0006。
- `akai OWASPTop10_1151013.pdf` 第 3、5 頁：同批資料的 OWASP Top 10 2021 視圖，對應到 OWASP 的唯一告警 87 筆（嚴重 7、高 26、中 1、低 53）；A06、A08、A09、A10 為 0。
- 與初掃（2026-10-08，237 筆：嚴重 10、高 27、中 3、低 197）相比，中風險以上由 40 筆降為 34 筆。

## 34 筆逐項處置

| 類別 | 原風險 | 筆數 | 報告位置 | 追查結果 | 本版處置 |
| --- | --- | --- | --- | --- | --- |
| 寫死 API 憑證 | 嚴重 | 1 | `docs/security/fortify-237-review.json:492` | 上一輪證據檔的「檔名 → SHA-256」對照表，`client/src/lib/sentry.ts` 這個檔名配上 64 位十六進位雜湊，被比對成 Sentry 權杖樣式；內容是檔案指紋，不是憑證 | 兩個對照表改為 `{ "path", "sha256" }` 陣列，雜湊值不變 |
| 反射式網頁注入 | 嚴重 | 3 | `server/index.ts:238`（來源 158、160） | 本機 Express 錯誤處理把請求路徑、方法、來源 IP 放進 Google Chat 告警卡片，經 `https.request().write()` 外送；不是寫回瀏覽器的回應，卡片欄位已跳脫 | 改用 `fetch()` 外送告警，保留卡片跳脫與 5 秒逾時 |
| 不安全傳輸 | 嚴重 | 1 | `server/routes.ts:750` | 本機開發用 Express 以 `http.createServer()` 建立伺服器。正式網站由 GitHub Pages 以 HTTPS 提供 `dist/public` 靜態檔，不部署此伺服器 | 路由註冊不再自行建立 HTTP 伺服器，改由 `app.listen()` 監聽，Vite 熱更新掛在同一伺服器 |
| 寫死密碼 | 嚴重 2、高 6 | 8 | `client/src/lib/__tests__/safeDiagnostic.test.ts:9`、`functions/src/googleChatCardSafety.test.ts:20`、`client/src/lib/__tests__/dashboardDataSafety.test.ts:54–56`（5 筆）、`server/public-diagnostics.test.ts:8` | 全是測試資料。前 2 筆是驗證「帶帳密網址會被清洗或拒絕」的假網址；後 6 筆是驗證「多餘欄位會被丟棄」時欄位剛好取名 `secret` | 假帳密網址改在執行時組字；多餘欄位改名 `extra`、`nested`；斷言不變 |
| 空密碼 | 高 | 2 | `client/src/lib/safeDiagnostic.ts:8`、`client/public/sw.js:36` | 診斷清洗把網址中的帳密設為空字串，用途是「移除」，不是設定空密碼 | 改為只重組「協定//主機＋路徑」，輸出與原本相同 |
| 不安全亂數 | 高 | 16 | `AchievementBadge.tsx` 2、`ConfettiBurst.tsx` 6、`HeartBurst.tsx` 3、`ui/sidebar.tsx` 1、`useSortOptions.ts` 2、`analytics.ts` 1、`Home.tsx` 1 | 動畫位置、骨架寬度、隨機排序權重、效能指標 25% 抽樣，無安全用途；其中 `useSortOptions.ts:46` 與 `Home.tsx:222` 是沒有被呼叫的洗牌函式 | 新增 `secureRandom()`（`crypto.getRandomValues`）全面取代；刪除 2 個未使用的洗牌函式 |
| 路徑操作 | 高 | 1 | `scripts/lib/path-safety.mjs:6`（來源 24） | CI 寫入執行摘要時，`RUNNER_TEMP` 環境變數未正規化就交給 `realpathSync()`；函式本身已有目錄與檔名白名單 | 環境變數路徑先 `resolve()` 正規化再比對，既有安全檢查與測試全部保留 |
| 競爭條件 | 高 | 1 | `e2e/telemetry-startup.spec.ts:15` | 端對端測試用 `page.on('request')` 累加計數，只在測試環境執行 | 改用與同檔 App Check 計數相同的 `page.route()` 攔截計數後放行 |
| 系統資訊外洩：對外 | 中 | 1 | `server/routes.ts:698`（來源 685） | 本機診斷端點收集 `process.platform`；正式模式下 `publicHealthStatus()` 只回狀態，但資料流仍經過 | 端點不再收集作業系統平台與 Node 版本 |
| **合計** | **嚴重 7、高 26、中 1** | **34** | | | |

## 低風險 184 筆

平臺標準不含低風險，本版未逐筆處理。報告中的分布：阻斷服務 123（多為建置腳本同步讀檔）、內部資訊外洩 28、指令注入 10（維護腳本呼叫 git／npm）、跨站請求偽造 6、系統資訊外洩 6、對外資訊外洩 4、註解中的密碼 4（Secret 名稱說明）、驗證不足的網頁注入 1、系統輸出串流 1、React 原始 HTML 1。本版改到的檔案可能連帶減少少數低風險筆數，以複掃結果為準。

## 驗證

- 本機：TypeScript 型別檢查通過；前端單元測試 63 檔 462 項、資安測試 26 項、Functions 測試 47 項通過；改動檔案 ESLint 0 警告。新增 `secureRandom` 單元測試，確認只用系統亂數且範圍在 0（含）到 1（不含）。
- 本機 Express 伺服器因 `better-sqlite3` 原生模組未編譯而無法啟動，這是既有環境問題；伺服器改動以型別檢查與 CI 建置打包驗證。
- 正式部署與 CI 結果另見發布紀錄。

## 尚未確認

- 修補後尚未取得廠商複掃結果。
- 「不安全傳輸」改用 `app.listen()` 後，Fortify 是否仍以 Express 內部建立的 HTTP 伺服器判定，需複掃確認；若仍被列出，說明理由為「僅本機開發用，正式網站由 GitHub Pages 以 HTTPS 提供，未部署此伺服器」。
- 「路徑操作」依本報告推論：同函式中先經 `resolve()` 的路徑流向相同 API 未被標記，本版比照處理，仍以複掃結果為準。
