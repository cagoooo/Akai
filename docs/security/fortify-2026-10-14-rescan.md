# Fortify 第二次複掃（2026-10-14）中風險以上 6 筆處置紀錄

紀錄日期：2026-10-14。對應版本：`3.6.162`。狀態：6 筆均已修改原始碼並通過本機測試；**尚待廠商以修補後版本再次複掃確認**。

> 2026-10-15 更新：第三次複掃確認本表 6 筆皆不再出現，同一行改列「不安全傳輸：弱 SSL 協定」1 筆，處置見 [Fortify 第三次複掃處置紀錄](fortify-2026-10-15-rescan.md)。

## 結論

第二次複掃的中風險以上告警由 34 筆降為 6 筆（嚴重 1、高 5，中 0）。上一輪 34 筆中有 33 筆已不再出現；剩下 1 筆「不安全傳輸」是上一輪改寫後仍被判定（本機開發伺服器改用 `app.listen()`，本質上仍是未加密的 HTTP）。另外 5 筆是 10/13 上午那次掃描（11:41）之後才新增的程式：Lighthouse 診斷腳本（13:47 提交）與一支端對端測試（12:57 提交）。

這 6 筆都不在正式網站上執行：正式網站是 GitHub Pages 以 HTTPS 提供的靜態檔。依平臺「無中風險（含）以上」標準，本版仍逐筆改寫。

## 報告來源

- `akai DeveloperWorkbook_1151014.pdf` 第 3 頁：嚴重 1、高 5、中 0、低 190，合計 196 筆；第 4 頁：分析時間 2026-10-14 10:43，715 個檔案、239,947 行，引擎 26.3.0.0070，規則包 2026.3.0.0006。
- `akai OWASPTop10_1151014.pdf` 第 3、5 頁：同批資料的 OWASP Top 10 2021 視圖，對應到 OWASP 的唯一告警 58 筆（嚴重 1、高 5、中 0、低 52）；A06～A10 皆為 0。
- 歷次比較：初掃 10/08 共 237 筆（中風險以上 40）→ 第一次複掃 10/13 共 218 筆（34）→ 第二次複掃 10/14 共 196 筆（6）。

## 上一輪 34 筆的複掃結果

| 上一輪類別 | 筆數 | 本次複掃 |
| --- | --- | --- |
| 寫死 API 憑證、反射式網頁注入、寫死密碼、空密碼、不安全亂數 | 30 | 已不再出現 |
| 路徑操作（`scripts/lib/path-safety.mjs`，先 `resolve()` 正規化） | 1 | 已不再出現 |
| 競爭條件（`e2e/telemetry-startup.spec.ts`，改用 `page.route()`） | 1 | 已不再出現 |
| 系統資訊外洩：對外（`server/routes.ts`） | 1 | 降為低風險 |
| 不安全傳輸（`server/routes.ts` → 改 `app.listen()`） | 1 | **仍列出**，位置變成 `server/index.ts:238`，本版處理 |

## 6 筆逐項處置

| 類別 | 原風險 | 筆數 | 報告位置 | 追查結果 | 本版處置 |
| --- | --- | --- | --- | --- | --- |
| 不安全傳輸 | 嚴重 | 1 | `server/index.ts:238` | 本機開發用 Express 以 `app.listen()` 監聽，Express 內部仍建立未加密的 HTTP 伺服器。正式網站不部署此伺服器 | 改為只提供 HTTPS：`server/local-tls.ts` 用 Vite 官方開發套件 `@vitejs/plugin-basic-ssl` 自動產生本機自簽憑證（快取於 `node_modules/.vite`，30 天換新），以 `https.createServer()` 監聽；Vite 熱更新掛在同一個 HTTPS 伺服器 |
| 路徑操作 | 高 | 4 | `scripts/lighthouse-trace-summary.mjs:53`、`:56`（來源 52，`process.argv`） | 手動觸發的 Lighthouse 診斷流程（CI）把 `diagnose/` 底下的檔名交給腳本讀取；命令列路徑沒有限制範圍 | 新增 `readDiagnoseJson()`：命令列路徑先 `resolve()` 正規化，再用既有 `containedRealPath()` 比對實際路徑，只允許 `diagnose/` 資料夾內的檔案；跑出資料夾一律拒絕 |
| 競爭條件 | 高 | 1 | `e2e/home.spec.ts:101` | 端對端測試以 `page.on('request')` 回呼累加文件請求數，只在測試環境執行 | 改為載入完成後在文件上做記號（`data-e2e-loaded-once`），閒置 40 秒後確認記號還在；頁面若被重整或轉走，新文件不會有記號，測試意圖不變且不再使用回呼 |
| **合計** | **嚴重 1、高 5** | **6** | | | |

## 連帶調整

- `playwright.config.ts`（本機跨瀏覽器測試）改連 `https://localhost:5000` 並接受自簽憑證；CI 用的 `playwright.ci.config.ts` 測的是 `vite preview` 建置產物，不受影響。
- `README.md`、`DEVELOPMENT_GUIDE.md` 的本機網址改為 HTTPS。
- `.replit` 內舊的 Replit Cloud Run 部署設定（`node dist/index.js`）在改為自簽 HTTPS 後不再適用；正式網站早已改由 GitHub Pages 提供，未使用該部署。

## 低風險 190 筆

平臺標準不含低風險，本版未逐筆處理（2026-10-13 決定，除非廠商要求）。報告中的分布：阻斷服務 130（多為建置腳本同步讀檔）、內部資訊外洩 27、指令注入 10（維護腳本呼叫 git／npm）、跨站請求偽造 6、系統資訊外洩 6、對外資訊外洩 4、註解中的密碼 4（Secret 名稱說明）、驗證不足的網頁注入 1、系統輸出串流 1、React 原始 HTML 1。

## 驗證

- 本機：TypeScript 型別檢查通過；診斷腳本與路徑安全測試 20 項通過（含新增的「跑出 diagnose 資料夾一律拒絕」）；改動檔案 ESLint 0 警告。
- 診斷腳本：模擬 CI 的呼叫方式（`diagnose/art1/defaultPass.trace.json`、`diagnose/run1.json`）正常輸出摘要；指定資料夾外的檔案時拒絕讀取。
- HTTPS：以 `localTlsOptions()` 產生的憑證啟動 HTTPS 伺服器並實際連線，回應 200、協定 TLS 1.3；憑證涵蓋 `localhost` 與 `127.0.0.1`。
- 端對端：「全新訪客第一次造訪…閒置也不會被自動重新整理」以 CI 設定（`vite preview`）在本機 Chromium 通過。
- 完整 `npm run dev` 仍因 `better-sqlite3` 原生模組未編譯而無法在本機啟動（既有環境問題），伺服器改動以型別檢查、HTTPS 實測與 CI 建置打包驗證。

## 尚未確認

- 修補後尚未取得廠商複掃結果。
- 依上一輪經驗推論：`resolve()` 正規化後的路徑流向檔案 API 時未被標記（`path-safety.mjs` 已驗證），本版比照處理；HTTPS 伺服器是否仍被列為不安全傳輸，以複掃結果為準。若仍被列出，說明理由為「僅本機開發用、已改為 HTTPS；正式網站由 GitHub Pages 以 HTTPS 提供，未部署此伺服器」。
