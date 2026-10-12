# Fortify 原始 237 筆來源審查對照

237 筆都有對應來源審查記錄；Fortify 原平台尚未以本報告完成複掃／結案，本輪正式發布與資產驗收仍由主線後續確認。

這份就像巡堂後的修繕清單：記錄原始碼已怎麼處理，仍要等重新檢查（Fortify 複掃）與正式場地驗收，不能把「清單寫完」當成「每一項已蓋結案章」。

## 審查統計

| 審查狀態 | 原始筆數 |
|---|---:|
| 已加固待複掃 | 52 |
| 誤判候選待審查 | 68 |
| 非目前正式部署範圍 | 117 |
| 尚未完成來源分類 | 0 |
| **合計** | **237** |

原始風險維持：Critical 10、High 27、Medium 3、Low 197；19 類、237 唯一 ID，無遺漏或重複。

「非目前正式部署範圍」包含 CI、維護、測試及未隨 Pages 產物發布的來源；仍須核對其他部署、CLI 權限與輸入邊界，不代表可直接關閉弱點。

## 原始類別對照

| Fortify 原類別 | 已加固待複掃 | 誤判候選待審查 | 非目前正式部署範圍 | 合計 |
|---|---:|---:|---:|---:|
| Command Injection | 1 | 8 | 0 | 9 |
| Credential Management: Hardcoded API Credentials | 3 | 0 | 0 | 3 |
| Cross-Site Request Forgery | 0 | 6 | 0 | 6 |
| Cross-Site Scripting: DOM | 3 | 0 | 0 | 3 |
| Cross-Site Scripting: Poor Validation | 3 | 0 | 0 | 3 |
| Cross-Site Scripting: Reflected | 3 | 0 | 0 | 3 |
| Denial of Service | 0 | 0 | 115 | 115 |
| Hardcoded Domain in HTML | 2 | 0 | 0 | 2 |
| Insecure Randomness | 2 | 16 | 0 | 18 |
| Insecure Transport | 0 | 0 | 1 | 1 |
| Password Management: Password in Comment | 0 | 4 | 0 | 4 |
| Path Manipulation | 8 | 0 | 0 | 8 |
| Poor Logging Practice: Use of a System Output Stream | 0 | 1 | 0 | 1 |
| Race Condition | 0 | 0 | 1 | 1 |
| React Bad Practices: Dangerously Set InnerHTML | 3 | 0 | 0 | 3 |
| System Information Leak | 0 | 6 | 0 | 6 |
| System Information Leak: External | 7 | 0 | 0 | 7 |
| System Information Leak: Internal | 14 | 27 | 0 | 41 |
| Weak Cryptographic Hash | 3 | 0 | 0 | 3 |

## 尚待確認

- 所有 237 筆仍待同版本 Fortify 複掃、原平台人工審查與回填；本機 ID 不能冒充 Fortify 原始 ID。
- 本輪 CI、受影響 9 個 Firebase 函式、Pages 發布及正式資產比對尚未由本報告宣告完成。
- 真實通知、正式登入後資料操作、實體裝置與真實 Sentry 事件保留未驗證。
- 來源 SHA-256 是當下工作樹實際檔案 bytes，不是 CI bundle，也不是正式 JS 資產驗收。
- 來源審查後 bytes 有變動的記錄：LOCAL-FORTIFY-237-204、LOCAL-FORTIFY-237-205、LOCAL-FORTIFY-237-206（同屬 `client/public/sw.js`）；須確認新變動不影響各筆結論。
- `LOCAL-FORTIFY-237-163` 的 Express HTTP 入口：未隨 Pages 產物發布，但任何其他公開部署仍須取得 TLS 終止、反向代理與入口證據。
- 來源審查的測試與既有階段紀錄逐筆保留；本次整理不把它們提升為本輪發布證明。

## 部署範圍證據

Pages 工作流上傳 `dist/public`。Express 雖編譯到 `dist/index.js`，該檔位於 Pages 上傳範圍之外；Firebase Functions 由獨立 `functions/src/index.ts` 入口提供。

依現有 Vite alias 與實際副檔名順序，無副檔名 `useToolTracking` 引用選擇 `.ts`，原掃描 `.tsx` 未進目前 Pages 入口圖。AMP 仍經 `server/index.ts → server/routes.ts → server/amp.ts → client/src/pages/amp/Home.tsx` 進入 Express 來源，不能視為沒有用途。

各筆匯入鏈、CI 呼叫、public copy 或未可達證據完整嵌入 JSON／CSV；沒有單凭資料夾判斷。圖資料只由 compiler 靜態解析，不執行模組，不代表所有條件分支會跑。

本輪主線本機回報：前端 424、Functions 47、公開設定 18、安全節點 15 個案例通過；CI／149 正式發布與正式通知仍待確認。新增 Express 純文字摘要邊界已讀取原碼與測試核對，沒有改傳輸或通知時機。

## 交付格式

- [完整 JSON](fortify-237-review.json)：保留定位、原因、證據、測試、待驗證、部署鏈與當下來源雜湊。
- [Excel 可讀 CSV](fortify-237-review.csv)：UTF-8 BOM，237 列，所有欄位檢查公式前綴。
- 本文逐筆對照保留完整原因、證據、測試、待驗證與相關部署鏈。

## 逐筆對照

<details>
<summary>LOCAL-FORTIFY-237-001｜Low｜誤判候選待審查｜scripts/backfill-added-at.mjs:35</summary>

- 原 PDF 頁：7；Issue Details 起始頁：7。
- 原類別：Command Injection。
- 原 sink：FunctionPointerCall: execFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/backfill-added-at.mjs`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`7db2f56e3adf29e695d90f1b6b660d37b6e67639c342330b6675553585e531fb`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

原碼使用 execFileSync 或 spawn 的獨立 argv，沒有 shell:true。Git pickaxe 值及工具編號即使含 shell 字元也不會被 shell 執行；仍須維持 argv 呼叫與來源界限。

**證據**

- relativeFile：scripts/backfill-added-at.mjs；line：35；purpose：已核對 sink 的 argv 與呼叫者；未使用 shell 字串拼接。
- relativeFile：scripts/backfill-added-at.mjs；line：59；purpose：pickaxe 作為單一 argv，路徑以 -- 分隔。

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 尚未使用同一版本重新執行 Fortify，不能宣稱掃描告警已消失。
- 未執行歷史新增工具或 --write 回填，避免修改既有工具資料及資產；維護者應維持可信 Node/Git PATH。

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：package-cli-reference；references：file：package.json；jsonPointer：/scripts/backfill:added-at
- kind：source-entry-shape；shape：topLevelExpressionStatements：5；topLevelVariableStatements：12；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-002｜Low｜已加固待複掃｜scripts/bump-sw-version.mjs:35</summary>

- 原 PDF 頁：8；Issue Details 起始頁：7。
- 原類別：Command Injection。
- 原 sink：FunctionPointerCall: execSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/bump-sw-version.mjs`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`9b7a3d8fd0fc09195221837f9eb99ede6a64ef327e3dacb753a2029d0987efd3`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

原命令本身是固定 Git 指令，沒有動態插入請求內容；已將 shell 字串執行改成 execFileSync 固定 argv 且 shell:false，避免未來插值形成命令注入。

**證據**

- relativeFile：scripts/bump-sw-version.mjs；line：35；purpose：固定命令與參數陣列，明確停用 shell。

**測試／既有階段記錄**

- command：node --test scripts/lib/build-fortify-safety.test.mjs；result：passed；scope：執行實際原碼片段的 execFileSync mock，核對固定 argv/shell:false，不執行版本產生。

**仍待驗證**

- 尚未使用同一版本重新執行 Fortify，不能宣稱掃描告警已消失。

**部署鏈及範圍依據**

- ci：scripts/bump-sw-version.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/bump-sw-version.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-003｜Low｜誤判候選待審查｜scripts/add-tool-102.mjs:92</summary>

- 原 PDF 頁：8；Issue Details 起始頁：8。
- 原類別：Command Injection。
- 原 sink：FunctionPointerCall: spawn。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/add-tool-102.mjs`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`513f2db9102d557b9c8749f3f484c562f5d9387842c1d8356abe32b5cc6c59d1`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

原碼使用 execFileSync 或 spawn 的獨立 argv，沒有 shell:true。Git pickaxe 值及工具編號即使含 shell 字元也不會被 shell 執行；仍須維持 argv 呼叫與來源界限。

**證據**

- relativeFile：scripts/add-tool-102.mjs；line：92；purpose：已核對 sink 的 argv 與呼叫者；未使用 shell 字串拼接。

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 尚未使用同一版本重新執行 Fortify，不能宣稱掃描告警已消失。
- 未執行歷史新增工具或 --write 回填，避免修改既有工具資料及資產；維護者應維持可信 Node/Git PATH。

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：1；topLevelVariableStatements：7；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-004｜Low｜誤判候選待審查｜scripts/add-tool-103.mjs:93</summary>

- 原 PDF 頁：8；Issue Details 起始頁：8。
- 原類別：Command Injection。
- 原 sink：FunctionPointerCall: spawn。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/add-tool-103.mjs`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`9d637e341385bbb745e4c3c297277d212a0bed72c4220b77f12f901fe58a915a`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

原碼使用 execFileSync 或 spawn 的獨立 argv，沒有 shell:true。Git pickaxe 值及工具編號即使含 shell 字元也不會被 shell 執行；仍須維持 argv 呼叫與來源界限。

**證據**

- relativeFile：scripts/add-tool-103.mjs；line：93；purpose：已核對 sink 的 argv 與呼叫者；未使用 shell 字串拼接。

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 尚未使用同一版本重新執行 Fortify，不能宣稱掃描告警已消失。
- 未執行歷史新增工具或 --write 回填，避免修改既有工具資料及資產；維護者應維持可信 Node/Git PATH。

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：1；topLevelVariableStatements：7；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-005｜Low｜誤判候選待審查｜scripts/add-tool-104.mjs:111</summary>

- 原 PDF 頁：9；Issue Details 起始頁：9。
- 原類別：Command Injection。
- 原 sink：FunctionPointerCall: spawn。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/add-tool-104.mjs`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`bac6200edc21cf81223d21a23641fa72300b4d35c64f2ea0b462f34ac07733c9`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

原碼使用 execFileSync 或 spawn 的獨立 argv，沒有 shell:true。Git pickaxe 值及工具編號即使含 shell 字元也不會被 shell 執行；仍須維持 argv 呼叫與來源界限。

**證據**

- relativeFile：scripts/add-tool-104.mjs；line：111；purpose：已核對 sink 的 argv 與呼叫者；未使用 shell 字串拼接。

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 尚未使用同一版本重新執行 Fortify，不能宣稱掃描告警已消失。
- 未執行歷史新增工具或 --write 回填，避免修改既有工具資料及資產；維護者應維持可信 Node/Git PATH。

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：1；topLevelVariableStatements：7；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-006｜Low｜誤判候選待審查｜scripts/add-tool-105.mjs:113</summary>

- 原 PDF 頁：9；Issue Details 起始頁：9。
- 原類別：Command Injection。
- 原 sink：FunctionPointerCall: spawn。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/add-tool-105.mjs`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`799105aecc5b688c439272131af2946ad1cfd58f320dc544ec7fc632455e8818`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

原碼使用 execFileSync 或 spawn 的獨立 argv，沒有 shell:true。Git pickaxe 值及工具編號即使含 shell 字元也不會被 shell 執行；仍須維持 argv 呼叫與來源界限。

**證據**

- relativeFile：scripts/add-tool-105.mjs；line：113；purpose：已核對 sink 的 argv 與呼叫者；未使用 shell 字串拼接。

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 尚未使用同一版本重新執行 Fortify，不能宣稱掃描告警已消失。
- 未執行歷史新增工具或 --write 回填，避免修改既有工具資料及資產；維護者應維持可信 Node/Git PATH。

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：1；topLevelVariableStatements：7；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-007｜Low｜誤判候選待審查｜scripts/add-tool-98.mjs:130</summary>

- 原 PDF 頁：10；Issue Details 起始頁：10。
- 原類別：Command Injection。
- 原 sink：FunctionPointerCall: spawn。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/add-tool-98.mjs`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`ab73dbe5c6c42cc68d5122aad6ba3a3c1dab59a5ee158dd5bbed7c66002b2025`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

原碼使用 execFileSync 或 spawn 的獨立 argv，沒有 shell:true。Git pickaxe 值及工具編號即使含 shell 字元也不會被 shell 執行；仍須維持 argv 呼叫與來源界限。

**證據**

- relativeFile：scripts/add-tool-98.mjs；line：130；purpose：已核對 sink 的 argv 與呼叫者；未使用 shell 字串拼接。

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 尚未使用同一版本重新執行 Fortify，不能宣稱掃描告警已消失。
- 未執行歷史新增工具或 --write 回填，避免修改既有工具資料及資產；維護者應維持可信 Node/Git PATH。

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：1；topLevelVariableStatements：7；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-008｜Low｜誤判候選待審查｜scripts/add-tool-99.mjs:131</summary>

- 原 PDF 頁：10；Issue Details 起始頁：10。
- 原類別：Command Injection。
- 原 sink：FunctionPointerCall: spawn。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/add-tool-99.mjs`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`4c98adac30de4ad3eea13f5695a3c5b29977420f3402d2d1fafd3f876217f11d`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

原碼使用 execFileSync 或 spawn 的獨立 argv，沒有 shell:true。Git pickaxe 值及工具編號即使含 shell 字元也不會被 shell 執行；仍須維持 argv 呼叫與來源界限。

**證據**

- relativeFile：scripts/add-tool-99.mjs；line：131；purpose：已核對 sink 的 argv 與呼叫者；未使用 shell 字串拼接。

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 尚未使用同一版本重新執行 Fortify，不能宣稱掃描告警已消失。
- 未執行歷史新增工具或 --write 回填，避免修改既有工具資料及資產；維護者應維持可信 Node/Git PATH。

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：1；topLevelVariableStatements：7；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-009｜Low｜誤判候選待審查｜scripts/new-tool.mjs:227</summary>

- 原 PDF 頁：11；Issue Details 起始頁：10。
- 原類別：Command Injection。
- 原 sink：FunctionPointerCall: spawn。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/new-tool.mjs`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`1791dabbd55c1a3a6c65e6dc62789b857ab4f43e82ec25a77f05f463ea9032ad`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

原碼使用 execFileSync 或 spawn 的獨立 argv，沒有 shell:true。Git pickaxe 值及工具編號即使含 shell 字元也不會被 shell 執行；仍須維持 argv 呼叫與來源界限。

**證據**

- relativeFile：scripts/new-tool.mjs；line：227；purpose：已核對 sink 的 argv 與呼叫者；未使用 shell 字串拼接。
- relativeFile：scripts/new-tool.mjs；line：261；purpose：互動／CLI 工具 ID 在進入程序參數前轉為數字。

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 尚未使用同一版本重新執行 Fortify，不能宣稱掃描告警已消失。
- 未執行歷史新增工具或 --write 回填，避免修改既有工具資料及資產；維護者應維持可信 Node/Git PATH。

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：package-cli-reference；references：file：package.json；jsonPointer：/scripts/new-tool
- kind：source-entry-shape；shape：topLevelExpressionStatements：1；topLevelVariableStatements：11；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-010｜Critical｜已加固待複掃｜client/public/akai-talk-2026/admin-questions.html:234</summary>

- 原 PDF 頁：12；Issue Details 起始頁：12。
- 原類別：Credential Management: Hardcoded API Credentials。
- 原 sink：報告未提供名稱。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`client/public/akai-talk-2026/admin-questions.html`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`7ad07c7334706a89999eec5183c02b116cd2d23feb5bdc4e88dc4b85caab9381`（工作樹實際 bytes）。
- 部署範圍：Pages 公開複製資產。

**原因**

三個公開頁來源使用佔位符，Vite 建置與開發注入既有公開設定；缺值拒絕建置。Firebase Web 設定仍會出現在公開產物，並非伺服器機密；真正權限由規則與 API 限制負責。

**證據**

- client/public/akai-talk-2026/admin-questions.html: __FIREBASE_API_KEY__
- scripts/firebase-public-config.mjs
- scripts/firebase-public-config.test.mjs
- vitest.rules.config.ts

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 同版本 Fortify 複掃
- 原掃描平台逐筆人工審查與回填

**部署鏈及範圍依據**

- kind：vite-public-copy；evidenceRefs：viteRoot；viteDefaults；viteOutput；pagesUpload；publicArtifactRelativeFile：akai-talk-2026/admin-questions.html

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-011｜Critical｜已加固待複掃｜client/public/akai-talk-2026/live-questions.html:415</summary>

- 原 PDF 頁：13；Issue Details 起始頁：13。
- 原類別：Credential Management: Hardcoded API Credentials。
- 原 sink：報告未提供名稱。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`client/public/akai-talk-2026/live-questions.html`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`df10d25434c85e97b8f71841dcc40b76d3cf60faeb639be98441fdb55af40439`（工作樹實際 bytes）。
- 部署範圍：Pages 公開複製資產。

**原因**

三個公開頁來源使用佔位符，Vite 建置與開發注入既有公開設定；缺值拒絕建置。Firebase Web 設定仍會出現在公開產物，並非伺服器機密；真正權限由規則與 API 限制負責。

**證據**

- client/public/akai-talk-2026/live-questions.html: __FIREBASE_API_KEY__
- scripts/firebase-public-config.mjs
- scripts/firebase-public-config.test.mjs
- vitest.rules.config.ts

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 同版本 Fortify 複掃
- 原掃描平台逐筆人工審查與回填

**部署鏈及範圍依據**

- kind：vite-public-copy；evidenceRefs：viteRoot；viteDefaults；viteOutput；pagesUpload；publicArtifactRelativeFile：akai-talk-2026/live-questions.html

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-012｜Critical｜已加固待複掃｜client/public/akai-talk-2026/live-stats.html:197</summary>

- 原 PDF 頁：13；Issue Details 起始頁：13。
- 原類別：Credential Management: Hardcoded API Credentials。
- 原 sink：報告未提供名稱。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`client/public/akai-talk-2026/live-stats.html`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`54de1eb66ca2e732c04c723701dcb0b8857b312fbc740b2dd045b11f23f94249`（工作樹實際 bytes）。
- 部署範圍：Pages 公開複製資產。

**原因**

三個公開頁來源使用佔位符，Vite 建置與開發注入既有公開設定；缺值拒絕建置。Firebase Web 設定仍會出現在公開產物，並非伺服器機密；真正權限由規則與 API 限制負責。

**證據**

- client/public/akai-talk-2026/live-stats.html: __FIREBASE_API_KEY__
- scripts/firebase-public-config.mjs
- scripts/firebase-public-config.test.mjs
- vitest.rules.config.ts

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 同版本 Fortify 複掃
- 原掃描平台逐筆人工審查與回填

**部署鏈及範圍依據**

- kind：vite-public-copy；evidenceRefs：viteRoot；viteDefaults；viteOutput；pagesUpload；publicArtifactRelativeFile：akai-talk-2026/live-stats.html

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-013｜Low｜誤判候選待審查｜client/src/components/MoodTracker.tsx:44</summary>

- 原 PDF 頁：16；Issue Details 起始頁：16。
- 原類別：Cross-Site Request Forgery。
- 原 sink：AssignmentStatement。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`client/src/components/MoodTracker.tsx`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`06f649dac7e9b3ca4025a4eade8f38d69fb50ce2c4102e2380ec50393e410431`（工作樹實際 bytes）。
- 部署範圍：未進當前 Pages 入口匯入圖的 client 來源。

**原因**

目前 Vite 入口匯入圖未包含該檔案；實際追蹤匯入的是 useToolTracking.ts 而非報告的 .tsx。另查 Express 入口未使用 Cookie/session 認證。不能把這個結論擴張到未核對的其他部署；若啟用 Cookie 認證，需另外驗證 CSRF。

**證據**

- fortify-deployment-scope.json: 依實際 Vite alias/extensions 建立匯入圖
- client/src/hooks/useToolTracking.ts
- server/index.ts
- server/routes.ts

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 同版本 Fortify 複掃
- 原掃描平台逐筆人工審查與回填
- 若未來啟用此元件或 Cookie 認證，重新檢查狀態修改與 CSRF 邊界

**部署鏈及範圍依據**

- kind：client-import-graph-negative；entry：client/src/main.tsx；graph：fortify-client-import-metafile.json；staticImportReferences：；note：限定本次檢查入口，並非原弱點不存在或永久不能使用。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-014｜Low｜誤判候選待審查｜client/src/hooks/useToolTracking.tsx:25</summary>

- 原 PDF 頁：17；Issue Details 起始頁：17。
- 原類別：Cross-Site Request Forgery。
- 原 sink：AssignmentStatement。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`client/src/hooks/useToolTracking.tsx`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`59c48d9507578e89511edfca4e440dbde6ff3c015995070914e5f5cbd68d282b`（工作樹實際 bytes）。
- 部署範圍：未進當前 Pages 入口匯入圖的 client 來源。

**原因**

目前 Vite 入口匯入圖未包含該檔案；實際追蹤匯入的是 useToolTracking.ts 而非報告的 .tsx。另查 Express 入口未使用 Cookie/session 認證。不能把這個結論擴張到未核對的其他部署；若啟用 Cookie 認證，需另外驗證 CSRF。

**證據**

- fortify-deployment-scope.json: 依實際 Vite alias/extensions 建立匯入圖
- client/src/hooks/useToolTracking.ts
- server/index.ts
- server/routes.ts

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 同版本 Fortify 複掃
- 原掃描平台逐筆人工審查與回填
- 若未來啟用此元件或 Cookie 認證，重新檢查狀態修改與 CSRF 邊界

**部署鏈及範圍依據**

- kind：client-import-graph-negative；entry：client/src/main.tsx；graph：fortify-client-import-metafile.json；staticImportReferences：；note：限定本次檢查入口，並非原弱點不存在或永久不能使用。
- kind：same-basename-shadow；selectedSource：client/src/hooks/useToolTracking.ts；unselectedSource：client/src/hooks/useToolTracking.tsx；reason：Vite 預設 .ts 在 .tsx 前；現有無副檔名引用解析至 .ts。；evidenceRefs：viteAliases；viteDefaults；selectedSourceIncludedInClientGraph：True

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-015｜Low｜誤判候選待審查｜client/src/lib/api-client.ts:61</summary>

- 原 PDF 頁：17；Issue Details 起始頁：17。
- 原類別：Cross-Site Request Forgery。
- 原 sink：AssignmentStatement。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`client/src/lib/api-client.ts`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`fe9fd809f7cf48259cc6e074c0315699e7ea15e36109c4b35763967eb0d5919f`（工作樹實際 bytes）。
- 部署範圍：未進當前 Pages 入口匯入圖的 client 來源。

**原因**

目前 Vite 入口匯入圖未包含該檔案；實際追蹤匯入的是 useToolTracking.ts 而非報告的 .tsx。另查 Express 入口未使用 Cookie/session 認證。不能把這個結論擴張到未核對的其他部署；若啟用 Cookie 認證，需另外驗證 CSRF。

**證據**

- fortify-deployment-scope.json: 依實際 Vite alias/extensions 建立匯入圖
- client/src/hooks/useToolTracking.ts
- server/index.ts
- server/routes.ts

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 同版本 Fortify 複掃
- 原掃描平台逐筆人工審查與回填
- 若未來啟用此元件或 Cookie 認證，重新檢查狀態修改與 CSRF 邊界

**部署鏈及範圍依據**

- kind：client-import-graph-negative；entry：client/src/main.tsx；graph：fortify-client-import-metafile.json；staticImportReferences：；note：限定本次檢查入口，並非原弱點不存在或永久不能使用。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-016｜Low｜誤判候選待審查｜scripts/generate-tool-embeddings.mjs:58</summary>

- 原 PDF 頁：18；Issue Details 起始頁：18。
- 原類別：Cross-Site Request Forgery。
- 原 sink：AssignmentStatement。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-tool-embeddings.mjs`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`840fd6419bccf9f1221a8099b5bbb199949cc54ef524ecb6d0be5bd681881305`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

維護者本機腳本向固定 HTTPS Gemini API 送 JSON，以明確提供的 API 設定認證；不是瀏覽器沿用使用者 Cookie 的跨站操作。需審查環境與來源權限，不能僅因 POST 就判為 CSRF。

**證據**

- scripts/generate-tool-embeddings.mjs: fetch 固定 HTTPS API 與 JSON
- .github/workflows/deploy-pages.yml: Pages 僅發布 dist/public

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 同版本 Fortify 複掃
- 原掃描平台逐筆人工審查與回填

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：1；topLevelVariableStatements：7；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-017｜Low｜誤判候選待審查｜scripts/new-tool.mjs:105</summary>

- 原 PDF 頁：18；Issue Details 起始頁：18。
- 原類別：Cross-Site Request Forgery。
- 原 sink：AssignmentStatement。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/new-tool.mjs`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`1791dabbd55c1a3a6c65e6dc62789b857ab4f43e82ec25a77f05f463ea9032ad`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

維護者本機腳本向固定 HTTPS Gemini API 送 JSON，以明確提供的 API 設定認證；不是瀏覽器沿用使用者 Cookie 的跨站操作。需審查環境與來源權限，不能僅因 POST 就判為 CSRF。

**證據**

- scripts/new-tool.mjs: fetch 固定 HTTPS API 與 JSON
- .github/workflows/deploy-pages.yml: Pages 僅發布 dist/public

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 同版本 Fortify 複掃
- 原掃描平台逐筆人工審查與回填

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：package-cli-reference；references：file：package.json；jsonPointer：/scripts/new-tool
- kind：source-entry-shape；shape：topLevelExpressionStatements：1；topLevelVariableStatements：11；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-018｜Low｜誤判候選待審查｜server/index.ts:220</summary>

- 原 PDF 頁：19；Issue Details 起始頁：18。
- 原類別：Cross-Site Request Forgery。
- 原 sink：AssignmentStatement。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`server/index.ts`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`f75d04fb7c2d95ec1a9d20db7056f15821c5c6d957d6c5f61ccb932eec4cd844`（工作樹實際 bytes）。
- 部署範圍：Express 來源，未隨 Pages 產物部署。

**原因**

此 sink 是伺服器向管理者設定的 HTTPS 通知端點送出 JSON，不是接收帶有使用者 Cookie 的狀態修改。外連目標、逾時與文字語境另作安全保護。

**證據**

- server/index.ts: https.request 通知
- server/chat-card-escape.ts
- .github/workflows/deploy-pages.yml: 上傳 dist/public

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 同版本 Fortify 複掃
- 原掃描平台逐筆人工審查與回填
- 本輪新來源差異核對：reviewer：主線本輪差異與本機安全測試核對；scope：純文字摘要提及／連結語法保護；卡片 HTML 與 HTTPS 傳輸／通知時機保持原流程。；verification：15/15 本機安全節點案例通過；CI、正式通知與其他部署仍待確認

**部署鏈及範圍依據**

- express：server/index.ts
- kind：express-build-excluded-from-pages；evidenceRefs：expressCompile；expressDev；expressStart；pagesUpload

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-019｜Critical｜已加固待複掃｜client/src/components/AnalyticsDashboard.tsx:1028</summary>

- 原 PDF 頁：23；Issue Details 起始頁：23。
- 原類別：Cross-Site Scripting: DOM。
- 原 sink：Assignment to style。
- 原資料流來源：relativeFile：client/src/components/AnalyticsDashboard.tsx；line：985；pdfPage：23。
- 當下來源：`client/src/components/AnalyticsDashboard.tsx`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`7d64c58ee2e4523131cc92b4e6c39438e25345fbb6e0620ffb209c6d7e69bbdd`（工作樹實際 bytes）。
- 部署範圍：Pages 瀏覽器 JS 候選。

**原因**

統計數值限制有限、非負與百分比範圍，避免儲存資料進入任意 CSS。

**證據**

- client/src/components/AnalyticsDashboard.tsx
- client/src/lib/dashboardDataSafety.ts

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 同版本 Fortify 複掃
- 原掃描平台逐筆人工審查與回填

**部署鏈及範圍依據**

- client：client/src/main.tsx → client/src/App.tsx → client/src/components/AdminAuth.tsx → client/src/components/AnalyticsDashboard.tsx

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-020｜Critical｜已加固待複掃｜client/index.html:453</summary>

- 原 PDF 頁：24；Issue Details 起始頁：23。
- 原類別：Cross-Site Scripting: DOM。
- 原 sink：Assignment to externalLink.href。
- 原資料流來源：relativeFile：client/index.html；line：433；pdfPage：23。
- 當下來源：`client/index.html`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`93ce61d488ba4f506ca1419ff74e959fcc0cce9545fea393c3d78c4bd62f0710`（工作樹實際 bytes）。
- 部署範圍：Pages HTML 入口。

**原因**

備援網址解析後只接受安全網頁協定，動態導覽資料不能成為 javascript/data 連結。

**證據**

- client/index.html
- client/src/lib/__tests__/publicFallbackSafety.test.ts

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 同版本 Fortify 複掃
- 原掃描平台逐筆人工審查與回填

**部署鏈及範圍依據**

- kind：vite-html-entry；evidenceRefs：htmlEntry；viteOutput；pagesUpload

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-021｜Critical｜已加固待複掃｜client/index.html:456</summary>

- 原 PDF 頁：25；Issue Details 起始頁：24。
- 原類別：Cross-Site Scripting: DOM。
- 原 sink：Assignment to externalLink.href。
- 原資料流來源：relativeFile：client/index.html；line：433；pdfPage：24。
- 當下來源：`client/index.html`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`93ce61d488ba4f506ca1419ff74e959fcc0cce9545fea393c3d78c4bd62f0710`（工作樹實際 bytes）。
- 部署範圍：Pages HTML 入口。

**原因**

備援網址解析後只接受安全網頁協定，動態導覽資料不能成為 javascript/data 連結。

**證據**

- client/index.html
- client/src/lib/__tests__/publicFallbackSafety.test.ts

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 同版本 Fortify 複掃
- 原掃描平台逐筆人工審查與回填

**部署鏈及範圍依據**

- kind：vite-html-entry；evidenceRefs：htmlEntry；viteOutput；pagesUpload

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-022｜Low｜已加固待複掃｜client/src/components/blog/BlogLeftRail.tsx:103</summary>

- 原 PDF 頁：29；Issue Details 起始頁：28。
- 原類別：Cross-Site Scripting: Poor Validation。
- 原 sink：Assignment to href。
- 原資料流來源：relativeFile：client/src/components/blog/BlogLeftRail.tsx；line：50；pdfPage：28。
- 當下來源：`client/src/components/blog/BlogLeftRail.tsx`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`2d6f2a0627a36f89ca8e68b79a09f3be2dd8f44d829ecd5202b563acbad27d3d`（工作樹實際 bytes）。
- 部署範圍：Pages 瀏覽器 JS 候選。

**原因**

原分享目的地已是固定 HTTPS LINE 網域，原始 URL encoding 並非任意 href。另以 URL/URLSearchParams 固定目的地、驗證頁面協定與帳密、限制標題大小，文字只能作為參數；仍保留原告警供掃描者審查。

**證據**

- client/src/components/blog/BlogLeftRail.tsx
- client/src/lib/blogShare.ts
- client/src/lib/__tests__/blogShare.test.ts

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 同版本 Fortify 複掃
- 原掃描平台逐筆人工審查與回填

**部署鏈及範圍依據**

- client：client/src/main.tsx → client/src/App.tsx → client/src/pages/BlogPost.tsx → client/src/components/blog/BlogLeftRail.tsx

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-023｜Low｜已加固待複掃｜client/src/components/blog/BlogMobileShare.tsx:50</summary>

- 原 PDF 頁：30；Issue Details 起始頁：29。
- 原類別：Cross-Site Scripting: Poor Validation。
- 原 sink：Assignment to href。
- 原資料流來源：relativeFile：client/src/components/blog/BlogMobileShare.tsx；line：30；pdfPage：29。
- 當下來源：`client/src/components/blog/BlogMobileShare.tsx`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`39613f443457e10f1b6bc715ed3d0a10609397fa4a995c3be8ada5622e4d8eaa`（工作樹實際 bytes）。
- 部署範圍：Pages 瀏覽器 JS 候選。

**原因**

原分享目的地已是固定 HTTPS LINE 網域，原始 URL encoding 並非任意 href。另以 URL/URLSearchParams 固定目的地、驗證頁面協定與帳密、限制標題大小，文字只能作為參數；仍保留原告警供掃描者審查。

**證據**

- client/src/components/blog/BlogMobileShare.tsx
- client/src/lib/blogShare.ts
- client/src/lib/__tests__/blogShare.test.ts

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 同版本 Fortify 複掃
- 原掃描平台逐筆人工審查與回填

**部署鏈及範圍依據**

- client：client/src/main.tsx → client/src/App.tsx → client/src/pages/BlogPost.tsx → client/src/components/blog/BlogMobileShare.tsx

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-024｜Low｜已加固待複掃｜client/index.html:57</summary>

- 原 PDF 頁：31；Issue Details 起始頁：30。
- 原類別：Cross-Site Scripting: Poor Validation。
- 原 sink：Assignment to link.href。
- 原資料流來源：relativeFile：client/index.html；line：80；pdfPage：30。
- 當下來源：`client/index.html`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`93ce61d488ba4f506ca1419ff74e959fcc0cce9545fea393c3d78c4bd62f0710`（工作樹實際 bytes）。
- 部署範圍：Pages HTML 入口。

**原因**

資源目的地固定本站 base，動態預載只接受白名單相對資源及有限長度純數字工具代碼；測試執行實際 HTML 初始化程式驗證惡意導覽不建立預載。

**證據**

- client/index.html: createLink 白名單
- client/src/components/__tests__/security-preload.test.ts

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 同版本 Fortify 複掃
- 原掃描平台逐筆人工審查與回填

**部署鏈及範圍依據**

- kind：vite-html-entry；evidenceRefs：htmlEntry；viteOutput；pagesUpload

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-025｜Critical｜已加固待複掃｜server/index.ts:234</summary>

- 原 PDF 頁：35；Issue Details 起始頁：35。
- 原類別：Cross-Site Scripting: Reflected。
- 原 sink：~JS_Generic.write()。
- 原資料流來源：relativeFile：server/index.ts；line：155；pdfPage：35。
- 當下來源：`server/index.ts`；現行行號：220。
- 當下來源 SHA-256：`f75d04fb7c2d95ec1a9d20db7056f15821c5c6d957d6c5f61ccb932eec4cd844`（工作樹實際 bytes）。
- 部署範圍：Express 來源，未隨 Pages 產物部署。

**原因**

3 筆原始 sink 均為 server/index.ts 的通知傳輸，先前文件只說 Google Chat 太籠統。現行 Express 已用 escapeChatCardText 處理動態卡片字串，本輪再保護公開錯誤回應及真正中止通知逾時；尚未證實瀏覽器反射式 XSS，不能把 Pages 發布當成此 Express 程序已部署。 補充：主線已核對 Express 純文字摘要使用 literalChatText 處理提及全體及偽造連結語法；HTML 卡片動態欄位仍由 escapeChatCardText 保護。HTTPS 傳輸及通知觸發時機保持原流程；本機安全節點測試通過，未發送實際通知。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 server/index.ts:220
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口
- server/chat-card-escape.ts：動態值跳脫，可信 &lt;b&gt;/&lt;pre&gt; 保留
- server/index.ts：req.on(timeout) destroy、publicErrorResponse 一般訊息與 errorId
- relativeFile：server/chat-card-escape.ts；line：13；purpose：純文字摘要限制提及與偽造連結語法；與卡片 HTML 編碼的語境分開。
- relativeFile：server/index.ts；line：216；purpose：摘要送出前套用純文字邊界，不改 HTTPS request 或通知時機。
- relativeFile：server/public-diagnostics.test.ts；line：10；purpose：本機固定輸入測試提及全體與偽造連結；沒有真實通知。

**測試／既有階段記錄**

- server/public-diagnostics.test.ts：3/3 通過，已納入安全節點測試設定
- 第一階段 Express 卡片跳脫原碼核對；本輪未實際通知
- suite：vitest.security.config.ts；result：15/15 本機通過；scope：11 個 Node 安全案例與 4 個 Express 公開診斷／純文字邊界案例；不是 CI 或正式傳輸驗收。；evidenceSource：主線本輪測試回報，並已讀取本輪 helper／呼叫點／新增測試原碼核對

**仍待驗證**

- 若另部署 Express，須核對版本及動態請求驗證
- Fortify 複掃及分類複核
- 沒有實際發送任何正式測試通知
- 本輪新來源差異核對：reviewer：主線本輪差異與本機安全測試核對；scope：純文字摘要提及／連結語法保護；卡片 HTML 與 HTTPS 傳輸／通知時機保持原流程。；verification：15/15 本機安全節點案例通過；CI、正式通知與其他部署仍待確認

**部署鏈及範圍依據**

- express：server/index.ts
- kind：express-build-excluded-from-pages；evidenceRefs：expressCompile；expressDev；expressStart；pagesUpload

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-026｜Critical｜已加固待複掃｜server/index.ts:234</summary>

- 原 PDF 頁：36；Issue Details 起始頁：36。
- 原類別：Cross-Site Scripting: Reflected。
- 原 sink：~JS_Generic.write()。
- 原資料流來源：relativeFile：server/index.ts；line：155；pdfPage：36。
- 當下來源：`server/index.ts`；現行行號：220。
- 當下來源 SHA-256：`f75d04fb7c2d95ec1a9d20db7056f15821c5c6d957d6c5f61ccb932eec4cd844`（工作樹實際 bytes）。
- 部署範圍：Express 來源，未隨 Pages 產物部署。

**原因**

3 筆原始 sink 均為 server/index.ts 的通知傳輸，先前文件只說 Google Chat 太籠統。現行 Express 已用 escapeChatCardText 處理動態卡片字串，本輪再保護公開錯誤回應及真正中止通知逾時；尚未證實瀏覽器反射式 XSS，不能把 Pages 發布當成此 Express 程序已部署。 補充：主線已核對 Express 純文字摘要使用 literalChatText 處理提及全體及偽造連結語法；HTML 卡片動態欄位仍由 escapeChatCardText 保護。HTTPS 傳輸及通知觸發時機保持原流程；本機安全節點測試通過，未發送實際通知。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 server/index.ts:220
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口
- server/chat-card-escape.ts：動態值跳脫，可信 &lt;b&gt;/&lt;pre&gt; 保留
- server/index.ts：req.on(timeout) destroy、publicErrorResponse 一般訊息與 errorId
- relativeFile：server/chat-card-escape.ts；line：13；purpose：純文字摘要限制提及與偽造連結語法；與卡片 HTML 編碼的語境分開。
- relativeFile：server/index.ts；line：216；purpose：摘要送出前套用純文字邊界，不改 HTTPS request 或通知時機。
- relativeFile：server/public-diagnostics.test.ts；line：10；purpose：本機固定輸入測試提及全體與偽造連結；沒有真實通知。

**測試／既有階段記錄**

- server/public-diagnostics.test.ts：3/3 通過，已納入安全節點測試設定
- 第一階段 Express 卡片跳脫原碼核對；本輪未實際通知
- suite：vitest.security.config.ts；result：15/15 本機通過；scope：11 個 Node 安全案例與 4 個 Express 公開診斷／純文字邊界案例；不是 CI 或正式傳輸驗收。；evidenceSource：主線本輪測試回報，並已讀取本輪 helper／呼叫點／新增測試原碼核對

**仍待驗證**

- 若另部署 Express，須核對版本及動態請求驗證
- Fortify 複掃及分類複核
- 沒有實際發送任何正式測試通知
- 本輪新來源差異核對：reviewer：主線本輪差異與本機安全測試核對；scope：純文字摘要提及／連結語法保護；卡片 HTML 與 HTTPS 傳輸／通知時機保持原流程。；verification：15/15 本機安全節點案例通過；CI、正式通知與其他部署仍待確認

**部署鏈及範圍依據**

- express：server/index.ts
- kind：express-build-excluded-from-pages；evidenceRefs：expressCompile；expressDev；expressStart；pagesUpload

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-027｜Critical｜已加固待複掃｜server/index.ts:234</summary>

- 原 PDF 頁：37；Issue Details 起始頁：36。
- 原類別：Cross-Site Scripting: Reflected。
- 原 sink：~JS_Generic.write()。
- 原資料流來源：relativeFile：server/index.ts；line：157；pdfPage：37。
- 當下來源：`server/index.ts`；現行行號：220。
- 當下來源 SHA-256：`f75d04fb7c2d95ec1a9d20db7056f15821c5c6d957d6c5f61ccb932eec4cd844`（工作樹實際 bytes）。
- 部署範圍：Express 來源，未隨 Pages 產物部署。

**原因**

3 筆原始 sink 均為 server/index.ts 的通知傳輸，先前文件只說 Google Chat 太籠統。現行 Express 已用 escapeChatCardText 處理動態卡片字串，本輪再保護公開錯誤回應及真正中止通知逾時；尚未證實瀏覽器反射式 XSS，不能把 Pages 發布當成此 Express 程序已部署。 補充：主線已核對 Express 純文字摘要使用 literalChatText 處理提及全體及偽造連結語法；HTML 卡片動態欄位仍由 escapeChatCardText 保護。HTTPS 傳輸及通知觸發時機保持原流程；本機安全節點測試通過，未發送實際通知。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 server/index.ts:220
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口
- server/chat-card-escape.ts：動態值跳脫，可信 &lt;b&gt;/&lt;pre&gt; 保留
- server/index.ts：req.on(timeout) destroy、publicErrorResponse 一般訊息與 errorId
- relativeFile：server/chat-card-escape.ts；line：13；purpose：純文字摘要限制提及與偽造連結語法；與卡片 HTML 編碼的語境分開。
- relativeFile：server/index.ts；line：216；purpose：摘要送出前套用純文字邊界，不改 HTTPS request 或通知時機。
- relativeFile：server/public-diagnostics.test.ts；line：10；purpose：本機固定輸入測試提及全體與偽造連結；沒有真實通知。

**測試／既有階段記錄**

- server/public-diagnostics.test.ts：3/3 通過，已納入安全節點測試設定
- 第一階段 Express 卡片跳脫原碼核對；本輪未實際通知
- suite：vitest.security.config.ts；result：15/15 本機通過；scope：11 個 Node 安全案例與 4 個 Express 公開診斷／純文字邊界案例；不是 CI 或正式傳輸驗收。；evidenceSource：主線本輪測試回報，並已讀取本輪 helper／呼叫點／新增測試原碼核對

**仍待驗證**

- 若另部署 Express，須核對版本及動態請求驗證
- Fortify 複掃及分類複核
- 沒有實際發送任何正式測試通知
- 本輪新來源差異核對：reviewer：主線本輪差異與本機安全測試核對；scope：純文字摘要提及／連結語法保護；卡片 HTML 與 HTTPS 傳輸／通知時機保持原流程。；verification：15/15 本機安全節點案例通過；CI、正式通知與其他部署仍待確認

**部署鏈及範圍依據**

- express：server/index.ts
- kind：express-build-excluded-from-pages；evidenceRefs：expressCompile；expressDev；expressStart；pagesUpload

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-028｜Low｜非目前正式部署範圍｜vite.config.ts:43</summary>

- 原 PDF 頁：39；Issue Details 起始頁：39。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: readFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`vite.config.ts`；現行行號：44。
- 當下來源 SHA-256：`104700edd8ec5c23ec5472800907834cffb9e5c261358275ff1b640d1069d1cf`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 vite.config.ts:44
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- express：server/index.ts → server/vite.ts → vite.config.ts
- ci：vite.config.ts
- kind：express-build-excluded-from-pages；evidenceRefs：expressCompile；expressDev；expressStart；pagesUpload
- kind：vite-build-loads-config；file：.github/workflows/deploy-pages.yml；line：102；packageScript：build；evidenceRefs：viteRoot；viteOutput

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-029｜Low｜非目前正式部署範圍｜vite.config.ts:48</summary>

- 原 PDF 頁：40；Issue Details 起始頁：39。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: readdirSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`vite.config.ts`；現行行號：49。
- 當下來源 SHA-256：`104700edd8ec5c23ec5472800907834cffb9e5c261358275ff1b640d1069d1cf`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 vite.config.ts:49
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- express：server/index.ts → server/vite.ts → vite.config.ts
- ci：vite.config.ts
- kind：express-build-excluded-from-pages；evidenceRefs：expressCompile；expressDev；expressStart；pagesUpload
- kind：vite-build-loads-config；file：.github/workflows/deploy-pages.yml；line：102；packageScript：build；evidenceRefs：viteRoot；viteOutput

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-030｜Low｜非目前正式部署範圍｜db/index.ts:30</summary>

- 原 PDF 頁：40；Issue Details 起始頁：40。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: existsSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`db/index.ts`；現行行號：30。
- 當下來源 SHA-256：`d8e17a26008317f974a0eacc1881c9a0cad4bcbd5cc1f9eaee1c6225bdfe108c`（工作樹實際 bytes）。
- 部署範圍：Express 來源，未隨 Pages 產物部署。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 db/index.ts:30
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- express：server/index.ts → db/index.ts
- kind：express-build-excluded-from-pages；evidenceRefs：expressCompile；expressDev；expressStart；pagesUpload

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-031｜Low｜非目前正式部署範圍｜db/index.ts:111</summary>

- 原 PDF 頁：41；Issue Details 起始頁：40。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: existsSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`db/index.ts`；現行行號：111。
- 當下來源 SHA-256：`d8e17a26008317f974a0eacc1881c9a0cad4bcbd5cc1f9eaee1c6225bdfe108c`（工作樹實際 bytes）。
- 部署範圍：Express 來源，未隨 Pages 產物部署。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 db/index.ts:111
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- express：server/index.ts → db/index.ts
- kind：express-build-excluded-from-pages；evidenceRefs：expressCompile；expressDev；expressStart；pagesUpload

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-032｜Low｜非目前正式部署範圍｜db/index.ts:31</summary>

- 原 PDF 頁：41；Issue Details 起始頁：41。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: mkdirSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`db/index.ts`；現行行號：31。
- 當下來源 SHA-256：`d8e17a26008317f974a0eacc1881c9a0cad4bcbd5cc1f9eaee1c6225bdfe108c`（工作樹實際 bytes）。
- 部署範圍：Express 來源，未隨 Pages 產物部署。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 db/index.ts:31
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- express：server/index.ts → db/index.ts
- kind：express-build-excluded-from-pages；evidenceRefs：expressCompile；expressDev；expressStart；pagesUpload

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-033｜Low｜非目前正式部署範圍｜db/index.ts:112</summary>

- 原 PDF 頁：41；Issue Details 起始頁：41。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: mkdirSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`db/index.ts`；現行行號：112。
- 當下來源 SHA-256：`d8e17a26008317f974a0eacc1881c9a0cad4bcbd5cc1f9eaee1c6225bdfe108c`（工作樹實際 bytes）。
- 部署範圍：Express 來源，未隨 Pages 產物部署。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 db/index.ts:112
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- express：server/index.ts → db/index.ts
- kind：express-build-excluded-from-pages；evidenceRefs：expressCompile；expressDev；expressStart；pagesUpload

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-034｜Low｜非目前正式部署範圍｜scripts/generate-aifed-talk-assets.mjs:108</summary>

- 原 PDF 頁：42；Issue Details 起始頁：42。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: writeFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-aifed-talk-assets.mjs`；現行行號：108。
- 當下來源 SHA-256：`1f68e14444181ce7a25061d7b27ec138bc3ea6be7cf55be8cb033ee6b6485286`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-aifed-talk-assets.mjs:108
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：59；topLevelVariableStatements：18；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-035｜Low｜非目前正式部署範圍｜scripts/generate-unified-og.mjs:47</summary>

- 原 PDF 頁：42；Issue Details 起始頁：42。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: mkdirSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-unified-og.mjs`；現行行號：47。
- 當下來源 SHA-256：`3d0808302d97b674f195d511c3619d9f060025e9ebcd76cda13c909405e6f957`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-unified-og.mjs:47
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：literal-maintenance-subprocess-reference；references：from：scripts/add-tool-102.mjs；to：scripts/generate-unified-og.mjs；line：92；kind：literal-node-subprocess；from：scripts/add-tool-103.mjs；to：scripts/generate-unified-og.mjs；line：93；kind：literal-node-subprocess；from：scripts/add-tool-104.mjs；to：scripts/generate-unified-og.mjs；line：111；kind：literal-node-subprocess；from：scripts/add-tool-105.mjs；to：scripts/generate-unified-og.mjs；line：113；kind：literal-node-subprocess；from：scripts/add-tool-98.mjs；to：scripts/generate-unified-og.mjs；line：130；kind：literal-node-subprocess；from：scripts/add-tool-99.mjs；to：scripts/generate-unified-og.mjs；line：131；kind：literal-node-subprocess；from：scripts/new-tool.mjs；to：scripts/generate-unified-og.mjs；line：227；kind：literal-node-subprocess
- kind：source-entry-shape；shape：topLevelExpressionStatements：2；topLevelVariableStatements：11；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-036｜Low｜非目前正式部署範圍｜scripts/sync-meta-from-stats.mjs:38</summary>

- 原 PDF 頁：43；Issue Details 起始頁：43。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: readFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/sync-meta-from-stats.mjs`；現行行號：38。
- 當下來源 SHA-256：`9429582798518762a66614c774201d599a505ff7a54fc5e4ca4ab5e1750fcb4b`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/sync-meta-from-stats.mjs:38
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/sync-meta-from-stats.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/sync-meta-from-stats.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-037｜Low｜非目前正式部署範圍｜scripts/generate-aifed-talk-assets.mjs:118</summary>

- 原 PDF 頁：43；Issue Details 起始頁：43。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: writeFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-aifed-talk-assets.mjs`；現行行號：118。
- 當下來源 SHA-256：`1f68e14444181ce7a25061d7b27ec138bc3ea6be7cf55be8cb033ee6b6485286`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-aifed-talk-assets.mjs:118
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：59；topLevelVariableStatements：18；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-038｜Low｜非目前正式部署範圍｜scripts/generate-geo-index.mjs:232</summary>

- 原 PDF 頁：44；Issue Details 起始頁：43。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: writeFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-geo-index.mjs`；現行行號：232。
- 當下來源 SHA-256：`a07004fd4c4a76bb4ecc47b09144fdd7e6342c783866db3cb4d01d1e2ce5c742`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-geo-index.mjs:232
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/generate-geo-index.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/generate-geo-index.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-039｜Low｜非目前正式部署範圍｜scripts/generate-sitemap.mjs:186</summary>

- 原 PDF 頁：44；Issue Details 起始頁：44。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: existsSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-sitemap.mjs`；現行行號：186。
- 當下來源 SHA-256：`682423727c0a7452d5acfb63f711b604fe90d5cf414009ab1180c58915667fc2`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-sitemap.mjs:186
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/generate-sitemap.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/generate-sitemap.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-040｜Low｜非目前正式部署範圍｜scripts/generate-wish-preview.mjs:488</summary>

- 原 PDF 頁：44；Issue Details 起始頁：44。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: existsSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-wish-preview.mjs`；現行行號：488。
- 當下來源 SHA-256：`8526b0f594b02da8c020882af096325fb346e0e4596b1fe5b4c5ec7310848b77`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-wish-preview.mjs:488
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/generate-wish-preview.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/generate-wish-preview.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-041｜Low｜非目前正式部署範圍｜scripts/prepare-route-loading.mjs:10</summary>

- 原 PDF 頁：45；Issue Details 起始頁：45。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: writeFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/prepare-route-loading.mjs`；現行行號：10。
- 當下來源 SHA-256：`4c519c30af8c8b666de268d4714511097a3e86905e54e4b0be3697c3ef740eb3`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/prepare-route-loading.mjs:10
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/prepare-route-loading.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/prepare-route-loading.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-042｜Low｜非目前正式部署範圍｜scripts/prepare-route-loading.mjs:9</summary>

- 原 PDF 頁：45；Issue Details 起始頁：45。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: mkdirSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/prepare-route-loading.mjs`；現行行號：9。
- 當下來源 SHA-256：`4c519c30af8c8b666de268d4714511097a3e86905e54e4b0be3697c3ef740eb3`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/prepare-route-loading.mjs:9
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/prepare-route-loading.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/prepare-route-loading.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-043｜Low｜非目前正式部署範圍｜scripts/add-tool-107.mjs:102</summary>

- 原 PDF 頁：46；Issue Details 起始頁：46。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: mkdirSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/add-tool-107.mjs`；現行行號：102。
- 當下來源 SHA-256：`560ce921af9b5504dc8ca9ff5d5ca4628a56b865a21e776a0d4dd1d9f19793ae`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/add-tool-107.mjs:102
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：4；topLevelVariableStatements：10；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-044｜Low｜非目前正式部署範圍｜scripts/add-tool-107.mjs:102</summary>

- 原 PDF 頁：46；Issue Details 起始頁：46。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: existsSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/add-tool-107.mjs`；現行行號：102。
- 當下來源 SHA-256：`560ce921af9b5504dc8ca9ff5d5ca4628a56b865a21e776a0d4dd1d9f19793ae`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/add-tool-107.mjs:102
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：4；topLevelVariableStatements：10；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-045｜Low｜非目前正式部署範圍｜scripts/generate-geo-index.mjs:19</summary>

- 原 PDF 頁：47；Issue Details 起始頁：46。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: readFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-geo-index.mjs`；現行行號：19。
- 當下來源 SHA-256：`a07004fd4c4a76bb4ecc47b09144fdd7e6342c783866db3cb4d01d1e2ce5c742`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-geo-index.mjs:19
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/generate-geo-index.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/generate-geo-index.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-046｜Low｜非目前正式部署範圍｜scripts/add-tool-110.mjs:104</summary>

- 原 PDF 頁：47；Issue Details 起始頁：47。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: existsSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/add-tool-110.mjs`；現行行號：104。
- 當下來源 SHA-256：`b0282fc548f6e204f374a761497d2d6d51f98a6e418fff1ca852e15937884048`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/add-tool-110.mjs:104
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：4；topLevelVariableStatements：10；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-047｜Low｜非目前正式部署範圍｜scripts/generate-share-100-assets.mjs:36</summary>

- 原 PDF 頁：47；Issue Details 起始頁：47。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: existsSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-share-100-assets.mjs`；現行行號：36。
- 當下來源 SHA-256：`389ec97b8c46d971bc80c63e9bdaf78e022163b155a47c11ea64c7fb5ccc1795`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-share-100-assets.mjs:36
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：9；topLevelVariableStatements：6；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-048｜Low｜非目前正式部署範圍｜scripts/generate-share-100-assets.mjs:310</summary>

- 原 PDF 頁：48；Issue Details 起始頁：48。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: existsSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-share-100-assets.mjs`；現行行號：310。
- 當下來源 SHA-256：`389ec97b8c46d971bc80c63e9bdaf78e022163b155a47c11ea64c7fb5ccc1795`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-share-100-assets.mjs:310
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：9；topLevelVariableStatements：6；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-049｜Low｜非目前正式部署範圍｜scripts/generate-sitemap.mjs:11</summary>

- 原 PDF 頁：48；Issue Details 起始頁：48。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: readFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-sitemap.mjs`；現行行號：11。
- 當下來源 SHA-256：`682423727c0a7452d5acfb63f711b604fe90d5cf414009ab1180c58915667fc2`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-sitemap.mjs:11
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/generate-sitemap.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/generate-sitemap.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-050｜Low｜非目前正式部署範圍｜scripts/generate-latest-tool-previews.mjs:29</summary>

- 原 PDF 頁：49；Issue Details 起始頁：49。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: writeFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-latest-tool-previews.mjs`；現行行號：29。
- 當下來源 SHA-256：`a95e97b484a7d7820c0b5e560256dcd7d80c7298167843ece88314df0179ef53`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-latest-tool-previews.mjs:29
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/generate-latest-tool-previews.mjs
- CI：.github/workflows/deploy-pages.yml／Build／prebuild；scripts/generate-latest-tool-previews.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-051｜Low｜非目前正式部署範圍｜scripts/generate-sitemap.mjs:187</summary>

- 原 PDF 頁：49；Issue Details 起始頁：49。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: readFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-sitemap.mjs`；現行行號：187。
- 當下來源 SHA-256：`682423727c0a7452d5acfb63f711b604fe90d5cf414009ab1180c58915667fc2`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-sitemap.mjs:187
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/generate-sitemap.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/generate-sitemap.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-052｜Low｜非目前正式部署範圍｜scripts/add-tool-111.mjs:159</summary>

- 原 PDF 頁：50；Issue Details 起始頁：49。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: existsSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/add-tool-111.mjs`；現行行號：159。
- 當下來源 SHA-256：`d5f0bdc56ee968078d39eb5beae693c4c6189226e6dc0fab72dd8cd99f40edb8`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/add-tool-111.mjs:159
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：4；topLevelVariableStatements：10；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-053｜Low｜非目前正式部署範圍｜scripts/backfill-added-at.mjs:67</summary>

- 原 PDF 頁：50；Issue Details 起始頁：50。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: readFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/backfill-added-at.mjs`；現行行號：67。
- 當下來源 SHA-256：`7db2f56e3adf29e695d90f1b6b660d37b6e67639c342330b6675553585e531fb`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/backfill-added-at.mjs:67
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：package-cli-reference；references：file：package.json；jsonPointer：/scripts/backfill:added-at
- kind：source-entry-shape；shape：topLevelExpressionStatements：5；topLevelVariableStatements：12；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-054｜Low｜非目前正式部署範圍｜scripts/generate-sitemap.mjs:191</summary>

- 原 PDF 頁：50；Issue Details 起始頁：50。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: writeFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-sitemap.mjs`；現行行號：191。
- 當下來源 SHA-256：`682423727c0a7452d5acfb63f711b604fe90d5cf414009ab1180c58915667fc2`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-sitemap.mjs:191
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/generate-sitemap.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/generate-sitemap.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-055｜Low｜非目前正式部署範圍｜scripts/gen-posts-index.ts:112</summary>

- 原 PDF 頁：51；Issue Details 起始頁：51。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: mkdirSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/gen-posts-index.ts`；現行行號：112。
- 當下來源 SHA-256：`a347c15347369d1a87af8f7efe839aa171449e8516c258701daab2a1d217658e`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/gen-posts-index.ts:112
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/gen-posts-index.ts
- CI：.github/workflows/deploy-pages.yml／Build／check:posts-index --check；scripts/gen-posts-index.ts

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-056｜Low｜非目前正式部署範圍｜scripts/subset-web-font.mjs:116</summary>

- 原 PDF 頁：51；Issue Details 起始頁：51。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: writeFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/subset-web-font.mjs`；現行行號：119。
- 當下來源 SHA-256：`52dbb301a66e10c0863dcd7c4a5c60555af5d45b6891b644922fcddf2383f350`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/subset-web-font.mjs:119
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：package-cli-reference；references：file：package.json；jsonPointer：/scripts/subset-web-font
- kind：source-entry-shape；shape：topLevelExpressionStatements：4；topLevelVariableStatements：24；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-057｜Low｜非目前正式部署範圍｜scripts/wait-for-deployed-version.mjs:41</summary>

- 原 PDF 頁：52；Issue Details 起始頁：51。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: appendFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/wait-for-deployed-version.mjs`；現行行號：41。
- 當下來源 SHA-256：`5a3d617f2efd0613d4c1bd6f7411a550738bc7528a732c8b6762a5013f03092b`（工作樹實際 bytes）。
- 部署範圍：CI 品質／驗證程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/wait-for-deployed-version.mjs；sink 已變更或無法自動定位
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口
- 原 appendFileSync 已移至 path-safety.mjs，由 appendRunnerSummary 路徑白名單保護；另由維護腳本審查 agent 驗證

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/wait-for-deployed-version.mjs
- CI：.github/workflows/lighthouse.yml／Test quality gate／直接呼叫；scripts/lighthouse-quality.test.mjs → scripts/wait-for-deployed-version.mjs
- CI：.github/workflows/lighthouse.yml／Verify deployed version／直接呼叫；scripts/wait-for-deployed-version.mjs
- CI：.github/workflows/lighthouse.yml／Verify version remained unchanged during audit／直接呼叫 --once；scripts/wait-for-deployed-version.mjs
- kind：test-import-references；references：from：scripts/lighthouse-quality.test.mjs；to：scripts/wait-for-deployed-version.mjs；line：3；kind：static-import；isTest：True；note：這是測試中的引用；是否以 mock 替代要另審，不能當公開部署證據。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-058｜Low｜非目前正式部署範圍｜scripts/gen-posts-index.ts:87</summary>

- 原 PDF 頁：52；Issue Details 起始頁：52。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: readFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/gen-posts-index.ts`；現行行號：87。
- 當下來源 SHA-256：`a347c15347369d1a87af8f7efe839aa171449e8516c258701daab2a1d217658e`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/gen-posts-index.ts:87
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/gen-posts-index.ts
- CI：.github/workflows/deploy-pages.yml／Build／check:posts-index --check；scripts/gen-posts-index.ts

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-059｜Low｜非目前正式部署範圍｜scripts/gen-posts-index.ts:125</summary>

- 原 PDF 頁：52；Issue Details 起始頁：52。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: readFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/gen-posts-index.ts`；現行行號：125。
- 當下來源 SHA-256：`a347c15347369d1a87af8f7efe839aa171449e8516c258701daab2a1d217658e`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/gen-posts-index.ts:125
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/gen-posts-index.ts
- CI：.github/workflows/deploy-pages.yml／Build／check:posts-index --check；scripts/gen-posts-index.ts

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-060｜Low｜非目前正式部署範圍｜scripts/ensure-fonts.mjs:26</summary>

- 原 PDF 頁：53；Issue Details 起始頁：53。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: existsSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/ensure-fonts.mjs`；現行行號：26。
- 當下來源 SHA-256：`e7159b760c1d7ba2b58c4b117ed0b6073201e5c7de4fe377b2f92405443bc43a`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/ensure-fonts.mjs:26
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/generate-100-celebration-og.mjs → scripts/ensure-fonts.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/generate-favicon.mjs → scripts/ensure-fonts.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/generate-home-og.mjs → scripts/ensure-fonts.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/generate-home-og-heatmap.mjs → scripts/ensure-fonts.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/generate-100-celebration-og.mjs → scripts/ensure-fonts.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-061｜Low｜非目前正式部署範圍｜scripts/gen-posts-index.ts:115</summary>

- 原 PDF 頁：53；Issue Details 起始頁：53。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: existsSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/gen-posts-index.ts`；現行行號：115。
- 當下來源 SHA-256：`a347c15347369d1a87af8f7efe839aa171449e8516c258701daab2a1d217658e`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/gen-posts-index.ts:115
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/gen-posts-index.ts
- CI：.github/workflows/deploy-pages.yml／Build／check:posts-index --check；scripts/gen-posts-index.ts

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-062｜Low｜非目前正式部署範圍｜scripts/generate-sitemap.mjs:182</summary>

- 原 PDF 頁：54；Issue Details 起始頁：54。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: writeFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-sitemap.mjs`；現行行號：182。
- 當下來源 SHA-256：`682423727c0a7452d5acfb63f711b604fe90d5cf414009ab1180c58915667fc2`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-sitemap.mjs:182
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/generate-sitemap.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/generate-sitemap.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-063｜Low｜非目前正式部署範圍｜scripts/add-tool-113.mjs:158</summary>

- 原 PDF 頁：54；Issue Details 起始頁：54。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: existsSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/add-tool-113.mjs`；現行行號：158。
- 當下來源 SHA-256：`6094e5611cb27630b21e4442588fd281b1debf29de9f7005eca19e246c732d80`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/add-tool-113.mjs:158
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：4；topLevelVariableStatements：10；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-064｜Low｜非目前正式部署範圍｜scripts/generate-feed.mjs:35</summary>

- 原 PDF 頁：55；Issue Details 起始頁：54。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: readFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-feed.mjs`；現行行號：35。
- 當下來源 SHA-256：`78db3a1719b29ad2855ccec0f0dead2319cb571056f91fb06e54aec0e1607c40`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-feed.mjs:35
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/generate-feed.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/generate-feed.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-065｜Low｜非目前正式部署範圍｜scripts/bump-sw-version.mjs:70</summary>

- 原 PDF 頁：55；Issue Details 起始頁：55。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: writeFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/bump-sw-version.mjs`；現行行號：70。
- 當下來源 SHA-256：`9b7a3d8fd0fc09195221837f9eb99ede6a64ef327e3dacb753a2029d0987efd3`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/bump-sw-version.mjs:70
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/bump-sw-version.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/bump-sw-version.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-066｜Low｜非目前正式部署範圍｜scripts/generate-unified-og.mjs:47</summary>

- 原 PDF 頁：55；Issue Details 起始頁：55。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: existsSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-unified-og.mjs`；現行行號：47。
- 當下來源 SHA-256：`3d0808302d97b674f195d511c3619d9f060025e9ebcd76cda13c909405e6f957`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-unified-og.mjs:47
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：literal-maintenance-subprocess-reference；references：from：scripts/add-tool-102.mjs；to：scripts/generate-unified-og.mjs；line：92；kind：literal-node-subprocess；from：scripts/add-tool-103.mjs；to：scripts/generate-unified-og.mjs；line：93；kind：literal-node-subprocess；from：scripts/add-tool-104.mjs；to：scripts/generate-unified-og.mjs；line：111；kind：literal-node-subprocess；from：scripts/add-tool-105.mjs；to：scripts/generate-unified-og.mjs；line：113；kind：literal-node-subprocess；from：scripts/add-tool-98.mjs；to：scripts/generate-unified-og.mjs；line：130；kind：literal-node-subprocess；from：scripts/add-tool-99.mjs；to：scripts/generate-unified-og.mjs；line：131；kind：literal-node-subprocess；from：scripts/new-tool.mjs；to：scripts/generate-unified-og.mjs；line：227；kind：literal-node-subprocess
- kind：source-entry-shape；shape：topLevelExpressionStatements：2；topLevelVariableStatements：11；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-067｜Low｜非目前正式部署範圍｜scripts/add-tool-114.mjs:158</summary>

- 原 PDF 頁：56；Issue Details 起始頁：56。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: existsSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/add-tool-114.mjs`；現行行號：158。
- 當下來源 SHA-256：`c9a51930a945f7b4a1d86ec2c09c92cc6e4bb5c51e7f3d7430feca0f42b05d81`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/add-tool-114.mjs:158
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：4；topLevelVariableStatements：10；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-068｜Low｜非目前正式部署範圍｜scripts/add-tool-108.mjs:101</summary>

- 原 PDF 頁：56；Issue Details 起始頁：56。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: existsSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/add-tool-108.mjs`；現行行號：101。
- 當下來源 SHA-256：`f3665df92d32b7d29b391ec7051b22cfdd5898a4c3df5e9bcb216d89cab9a9f5`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/add-tool-108.mjs:101
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：4；topLevelVariableStatements：10；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-069｜Low｜非目前正式部署範圍｜scripts/gen-posts-index.ts:80</summary>

- 原 PDF 頁：57；Issue Details 起始頁：57。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: existsSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/gen-posts-index.ts`；現行行號：80。
- 當下來源 SHA-256：`a347c15347369d1a87af8f7efe839aa171449e8516c258701daab2a1d217658e`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/gen-posts-index.ts:80
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/gen-posts-index.ts
- CI：.github/workflows/deploy-pages.yml／Build／check:posts-index --check；scripts/gen-posts-index.ts

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-070｜Low｜非目前正式部署範圍｜scripts/inject-cockpit-stage-beacons.mjs:85</summary>

- 原 PDF 頁：57；Issue Details 起始頁：57。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: writeFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/inject-cockpit-stage-beacons.mjs`；現行行號：93。
- 當下來源 SHA-256：`d6983b0d93fdb1ce44f3b025b537ebabb071fabc90b952c11183a263e0c97300`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/inject-cockpit-stage-beacons.mjs:93
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：5；topLevelVariableStatements：6；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-071｜Low｜非目前正式部署範圍｜scripts/prepare-route-loading.mjs:7</summary>

- 原 PDF 頁：58；Issue Details 起始頁：57。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: readFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/prepare-route-loading.mjs`；現行行號：7。
- 當下來源 SHA-256：`4c519c30af8c8b666de268d4714511097a3e86905e54e4b0be3697c3ef740eb3`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/prepare-route-loading.mjs:7
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/prepare-route-loading.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/prepare-route-loading.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-072｜Low｜非目前正式部署範圍｜scripts/mark-reasons-reviewed.mjs:73</summary>

- 原 PDF 頁：58；Issue Details 起始頁：58。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: writeFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/mark-reasons-reviewed.mjs`；現行行號：73。
- 當下來源 SHA-256：`9eced96026fbae8436f298d5182277b05997b0da12c08f6da975fd199cd68015`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/mark-reasons-reviewed.mjs:73
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：package-cli-reference；references：file：package.json；jsonPointer：/scripts/reasons:reviewed
- kind：source-entry-shape；shape：topLevelExpressionStatements：2；topLevelVariableStatements：7；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-073｜Low｜非目前正式部署範圍｜scripts/generate-share-100-assets.mjs:36</summary>

- 原 PDF 頁：58；Issue Details 起始頁：58。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: mkdirSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-share-100-assets.mjs`；現行行號：36。
- 當下來源 SHA-256：`389ec97b8c46d971bc80c63e9bdaf78e022163b155a47c11ea64c7fb5ccc1795`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-share-100-assets.mjs:36
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：9；topLevelVariableStatements：6；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-074｜Low｜非目前正式部署範圍｜scripts/generate-tool-84.mjs:390</summary>

- 原 PDF 頁：59；Issue Details 起始頁：59。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: writeFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-tool-84.mjs`；現行行號：390。
- 當下來源 SHA-256：`7e75801e16012ee295472fc4e9cb76f67b5f8f91aa61b13109ab98ea59288d51`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-tool-84.mjs:390
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：9；topLevelVariableStatements：11；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-075｜Low｜非目前正式部署範圍｜scripts/set-admin-claim.ts:20</summary>

- 原 PDF 頁：59；Issue Details 起始頁：59。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: readFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/set-admin-claim.ts`；現行行號：20。
- 當下來源 SHA-256：`e3d89db874af8e0c4bd2b2d59683536f2b7fc85b73a5ec893b6f0512297d7a43`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/set-admin-claim.ts:20
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：1；topLevelVariableStatements：1；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-076｜Low｜非目前正式部署範圍｜scripts/generate-share-100-assets.mjs:311</summary>

- 原 PDF 頁：60；Issue Details 起始頁：60。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: readdirSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-share-100-assets.mjs`；現行行號：311。
- 當下來源 SHA-256：`389ec97b8c46d971bc80c63e9bdaf78e022163b155a47c11ea64c7fb5ccc1795`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-share-100-assets.mjs:311
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：9；topLevelVariableStatements：6；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-077｜Low｜非目前正式部署範圍｜scripts/lighthouse-quality.mjs:27</summary>

- 原 PDF 頁：60；Issue Details 起始頁：60。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: readFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/lighthouse-quality.mjs`；現行行號：28。
- 當下來源 SHA-256：`bf7fb0e3d5d468b44597f30666588498f20695bd1382798dc988b2c3b33b2215`（工作樹實際 bytes）。
- 部署範圍：CI 品質／驗證程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/lighthouse-quality.mjs:28
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/lighthouse-quality.mjs
- CI：.github/workflows/lighthouse.yml／Test quality gate／直接呼叫；scripts/lighthouse-quality.test.mjs → scripts/lighthouse-quality.mjs
- CI：.github/workflows/lighthouse.yml／Enforce quality thresholds／直接呼叫；scripts/lighthouse-quality.mjs
- kind：test-import-references；references：from：scripts/lighthouse-quality.test.mjs；to：scripts/lighthouse-quality.mjs；line：4；kind：static-import；isTest：True；note：這是測試中的引用；是否以 mock 替代要另審，不能當公開部署證據。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-078｜Low｜非目前正式部署範圍｜scripts/subset-web-font.mjs:78</summary>

- 原 PDF 頁：61；Issue Details 起始頁：60。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: readFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/subset-web-font.mjs`；現行行號：81。
- 當下來源 SHA-256：`52dbb301a66e10c0863dcd7c4a5c60555af5d45b6891b644922fcddf2383f350`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/subset-web-font.mjs:81
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：package-cli-reference；references：file：package.json；jsonPointer：/scripts/subset-web-font
- kind：source-entry-shape；shape：topLevelExpressionStatements：4；topLevelVariableStatements：24；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-079｜Low｜非目前正式部署範圍｜scripts/generate-sitemap.mjs:79</summary>

- 原 PDF 頁：61；Issue Details 起始頁：61。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: existsSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-sitemap.mjs`；現行行號：79。
- 當下來源 SHA-256：`682423727c0a7452d5acfb63f711b604fe90d5cf414009ab1180c58915667fc2`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-sitemap.mjs:79
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/generate-sitemap.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/generate-sitemap.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-080｜Low｜非目前正式部署範圍｜scripts/generate-sitemap.mjs:80</summary>

- 原 PDF 頁：61；Issue Details 起始頁：61。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: readFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-sitemap.mjs`；現行行號：80。
- 當下來源 SHA-256：`682423727c0a7452d5acfb63f711b604fe90d5cf414009ab1180c58915667fc2`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-sitemap.mjs:80
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/generate-sitemap.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/generate-sitemap.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-081｜Low｜非目前正式部署範圍｜scripts/lighthouse-quality.mjs:29</summary>

- 原 PDF 頁：62；Issue Details 起始頁：62。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: appendFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/lighthouse-quality.mjs`；現行行號：30。
- 當下來源 SHA-256：`bf7fb0e3d5d468b44597f30666588498f20695bd1382798dc988b2c3b33b2215`（工作樹實際 bytes）。
- 部署範圍：CI 品質／驗證程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/lighthouse-quality.mjs；sink 已變更或無法自動定位
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口
- 原 appendFileSync 已移至 path-safety.mjs，由 appendRunnerSummary 路徑白名單保護；另由維護腳本審查 agent 驗證

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/lighthouse-quality.mjs
- CI：.github/workflows/lighthouse.yml／Test quality gate／直接呼叫；scripts/lighthouse-quality.test.mjs → scripts/lighthouse-quality.mjs
- CI：.github/workflows/lighthouse.yml／Enforce quality thresholds／直接呼叫；scripts/lighthouse-quality.mjs
- kind：test-import-references；references：from：scripts/lighthouse-quality.test.mjs；to：scripts/lighthouse-quality.mjs；line：4；kind：static-import；isTest：True；note：這是測試中的引用；是否以 mock 替代要另審，不能當公開部署證據。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-082｜Low｜非目前正式部署範圍｜scripts/add-tool-111.mjs:159</summary>

- 原 PDF 頁：62；Issue Details 起始頁：62。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: mkdirSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/add-tool-111.mjs`；現行行號：159。
- 當下來源 SHA-256：`d5f0bdc56ee968078d39eb5beae693c4c6189226e6dc0fab72dd8cd99f40edb8`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/add-tool-111.mjs:159
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：4；topLevelVariableStatements：10；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-083｜Low｜非目前正式部署範圍｜scripts/generate-tool-84.mjs:27</summary>

- 原 PDF 頁：63；Issue Details 起始頁：63。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: existsSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-tool-84.mjs`；現行行號：27。
- 當下來源 SHA-256：`7e75801e16012ee295472fc4e9cb76f67b5f8f91aa61b13109ab98ea59288d51`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-tool-84.mjs:27
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：9；topLevelVariableStatements：11；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-084｜Low｜非目前正式部署範圍｜scripts/sync-meta-from-stats.mjs:33</summary>

- 原 PDF 頁：63；Issue Details 起始頁：63。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: existsSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/sync-meta-from-stats.mjs`；現行行號：33。
- 當下來源 SHA-256：`9429582798518762a66614c774201d599a505ff7a54fc5e4ca4ab5e1750fcb4b`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/sync-meta-from-stats.mjs:33
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/sync-meta-from-stats.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/sync-meta-from-stats.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-085｜Low｜非目前正式部署範圍｜scripts/add-tool-112.mjs:163</summary>

- 原 PDF 頁：64；Issue Details 起始頁：63。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: existsSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/add-tool-112.mjs`；現行行號：163。
- 當下來源 SHA-256：`fbb450674578889a06ba8059dc53110e5383f9db8aeb2d8fcd0643f6c2e807bf`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/add-tool-112.mjs:163
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：4；topLevelVariableStatements：10；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-086｜Low｜非目前正式部署範圍｜scripts/add-tool-114.mjs:158</summary>

- 原 PDF 頁：64；Issue Details 起始頁：64。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: mkdirSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/add-tool-114.mjs`；現行行號：158。
- 當下來源 SHA-256：`c9a51930a945f7b4a1d86ec2c09c92cc6e4bb5c51e7f3d7430feca0f42b05d81`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/add-tool-114.mjs:158
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：4；topLevelVariableStatements：10；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-087｜Low｜非目前正式部署範圍｜scripts/add-tool-113.mjs:158</summary>

- 原 PDF 頁：64；Issue Details 起始頁：64。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: mkdirSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/add-tool-113.mjs`；現行行號：158。
- 當下來源 SHA-256：`6094e5611cb27630b21e4442588fd281b1debf29de9f7005eca19e246c732d80`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/add-tool-113.mjs:158
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：4；topLevelVariableStatements：10；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-088｜Low｜非目前正式部署範圍｜scripts/gen-posts-index.ts:115</summary>

- 原 PDF 頁：65；Issue Details 起始頁：65。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: writeFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/gen-posts-index.ts`；現行行號：115。
- 當下來源 SHA-256：`a347c15347369d1a87af8f7efe839aa171449e8516c258701daab2a1d217658e`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/gen-posts-index.ts:115
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/gen-posts-index.ts
- CI：.github/workflows/deploy-pages.yml／Build／check:posts-index --check；scripts/gen-posts-index.ts

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-089｜Low｜非目前正式部署範圍｜scripts/add-tool-109.mjs:105</summary>

- 原 PDF 頁：65；Issue Details 起始頁：65。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: existsSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/add-tool-109.mjs`；現行行號：105。
- 當下來源 SHA-256：`90ffe5f7317c0de8309d765cd37c78eff45b2022aa9b6569dea437f0c48ffed6`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/add-tool-109.mjs:105
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：4；topLevelVariableStatements：10；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-090｜Low｜非目前正式部署範圍｜scripts/add-tool-112.mjs:163</summary>

- 原 PDF 頁：66；Issue Details 起始頁：66。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: mkdirSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/add-tool-112.mjs`；現行行號：163。
- 當下來源 SHA-256：`fbb450674578889a06ba8059dc53110e5383f9db8aeb2d8fcd0643f6c2e807bf`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/add-tool-112.mjs:163
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：4；topLevelVariableStatements：10；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-091｜Low｜非目前正式部署範圍｜scripts/gen-posts-index.ts:80</summary>

- 原 PDF 頁：66；Issue Details 起始頁：66。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: readdirSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/gen-posts-index.ts`；現行行號：80。
- 當下來源 SHA-256：`a347c15347369d1a87af8f7efe839aa171449e8516c258701daab2a1d217658e`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/gen-posts-index.ts:80
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/gen-posts-index.ts
- CI：.github/workflows/deploy-pages.yml／Build／check:posts-index --check；scripts/gen-posts-index.ts

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-092｜Low｜非目前正式部署範圍｜scripts/generate-tool-84.mjs:385</summary>

- 原 PDF 頁：67；Issue Details 起始頁：66。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: writeFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-tool-84.mjs`；現行行號：385。
- 當下來源 SHA-256：`7e75801e16012ee295472fc4e9cb76f67b5f8f91aa61b13109ab98ea59288d51`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-tool-84.mjs:385
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：9；topLevelVariableStatements：11；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-093｜Low｜非目前正式部署範圍｜scripts/add-tool-106.mjs:88</summary>

- 原 PDF 頁：67；Issue Details 起始頁：67。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: existsSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/add-tool-106.mjs`；現行行號：88。
- 當下來源 SHA-256：`d9858c8eb2ed46bba7b9a122fa5d3d187bda537c85e0faffcb613bf06325499b`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/add-tool-106.mjs:88
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：4；topLevelVariableStatements：10；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-094｜Low｜非目前正式部署範圍｜scripts/generate-aifed-talk-assets.mjs:39</summary>

- 原 PDF 頁：67；Issue Details 起始頁：67。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: mkdirSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-aifed-talk-assets.mjs`；現行行號：39。
- 當下來源 SHA-256：`1f68e14444181ce7a25061d7b27ec138bc3ea6be7cf55be8cb033ee6b6485286`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-aifed-talk-assets.mjs:39
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：59；topLevelVariableStatements：18；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-095｜Low｜非目前正式部署範圍｜scripts/bump-sw-version.mjs:60</summary>

- 原 PDF 頁：68；Issue Details 起始頁：68。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: writeFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/bump-sw-version.mjs`；現行行號：60。
- 當下來源 SHA-256：`9b7a3d8fd0fc09195221837f9eb99ede6a64ef327e3dacb753a2029d0987efd3`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/bump-sw-version.mjs:60
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/bump-sw-version.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/bump-sw-version.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-096｜Low｜非目前正式部署範圍｜scripts/add-tool-110.mjs:104</summary>

- 原 PDF 頁：68；Issue Details 起始頁：68。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: mkdirSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/add-tool-110.mjs`；現行行號：104。
- 當下來源 SHA-256：`b0282fc548f6e204f374a761497d2d6d51f98a6e418fff1ca852e15937884048`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/add-tool-110.mjs:104
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：4；topLevelVariableStatements：10；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-097｜Low｜非目前正式部署範圍｜scripts/generate-latest-tool-previews.mjs:10</summary>

- 原 PDF 頁：69；Issue Details 起始頁：69。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: readFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-latest-tool-previews.mjs`；現行行號：10。
- 當下來源 SHA-256：`a95e97b484a7d7820c0b5e560256dcd7d80c7298167843ece88314df0179ef53`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-latest-tool-previews.mjs:10
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/generate-latest-tool-previews.mjs
- CI：.github/workflows/deploy-pages.yml／Build／prebuild；scripts/generate-latest-tool-previews.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-098｜Low｜非目前正式部署範圍｜scripts/gen-posts-index.ts:117</summary>

- 原 PDF 頁：69；Issue Details 起始頁：69。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: unlinkSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/gen-posts-index.ts`；現行行號：117。
- 當下來源 SHA-256：`a347c15347369d1a87af8f7efe839aa171449e8516c258701daab2a1d217658e`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/gen-posts-index.ts:117
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/gen-posts-index.ts
- CI：.github/workflows/deploy-pages.yml／Build／check:posts-index --check；scripts/gen-posts-index.ts

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-099｜Low｜非目前正式部署範圍｜scripts/set-admin-claim.ts:13</summary>

- 原 PDF 頁：70；Issue Details 起始頁：69。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: existsSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/set-admin-claim.ts`；現行行號：13。
- 當下來源 SHA-256：`e3d89db874af8e0c4bd2b2d59683536f2b7fc85b73a5ec893b6f0512297d7a43`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/set-admin-claim.ts:13
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：1；topLevelVariableStatements：1；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-100｜Low｜非目前正式部署範圍｜scripts/generate-latest-tool-previews.mjs:14</summary>

- 原 PDF 頁：70；Issue Details 起始頁：70。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: mkdirSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-latest-tool-previews.mjs`；現行行號：14。
- 當下來源 SHA-256：`a95e97b484a7d7820c0b5e560256dcd7d80c7298167843ece88314df0179ef53`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-latest-tool-previews.mjs:14
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/generate-latest-tool-previews.mjs
- CI：.github/workflows/deploy-pages.yml／Build／prebuild；scripts/generate-latest-tool-previews.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-101｜Low｜非目前正式部署範圍｜scripts/generate-unified-og.mjs:42</summary>

- 原 PDF 頁：70；Issue Details 起始頁：70。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: existsSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-unified-og.mjs`；現行行號：42。
- 當下來源 SHA-256：`3d0808302d97b674f195d511c3619d9f060025e9ebcd76cda13c909405e6f957`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-unified-og.mjs:42
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：literal-maintenance-subprocess-reference；references：from：scripts/add-tool-102.mjs；to：scripts/generate-unified-og.mjs；line：92；kind：literal-node-subprocess；from：scripts/add-tool-103.mjs；to：scripts/generate-unified-og.mjs；line：93；kind：literal-node-subprocess；from：scripts/add-tool-104.mjs；to：scripts/generate-unified-og.mjs；line：111；kind：literal-node-subprocess；from：scripts/add-tool-105.mjs；to：scripts/generate-unified-og.mjs；line：113；kind：literal-node-subprocess；from：scripts/add-tool-98.mjs；to：scripts/generate-unified-og.mjs；line：130；kind：literal-node-subprocess；from：scripts/add-tool-99.mjs；to：scripts/generate-unified-og.mjs；line：131；kind：literal-node-subprocess；from：scripts/new-tool.mjs；to：scripts/generate-unified-og.mjs；line：227；kind：literal-node-subprocess
- kind：source-entry-shape；shape：topLevelExpressionStatements：2；topLevelVariableStatements：11；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-102｜Low｜非目前正式部署範圍｜scripts/generate-share-100-assets.mjs:343</summary>

- 原 PDF 頁：71；Issue Details 起始頁：71。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: writeFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-share-100-assets.mjs`；現行行號：343。
- 當下來源 SHA-256：`389ec97b8c46d971bc80c63e9bdaf78e022163b155a47c11ea64c7fb5ccc1795`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-share-100-assets.mjs:343
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：9；topLevelVariableStatements：6；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-103｜Low｜非目前正式部署範圍｜scripts/add-tool-106.mjs:88</summary>

- 原 PDF 頁：71；Issue Details 起始頁：71。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: mkdirSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/add-tool-106.mjs`；現行行號：88。
- 當下來源 SHA-256：`d9858c8eb2ed46bba7b9a122fa5d3d187bda537c85e0faffcb613bf06325499b`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/add-tool-106.mjs:88
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：4；topLevelVariableStatements：10；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-104｜Low｜非目前正式部署範圍｜scripts/generate-feed.mjs:127</summary>

- 原 PDF 頁：72；Issue Details 起始頁：72。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: writeFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-feed.mjs`；現行行號：127。
- 當下來源 SHA-256：`78db3a1719b29ad2855ccec0f0dead2319cb571056f91fb06e54aec0e1607c40`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-feed.mjs:127
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/generate-feed.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/generate-feed.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-105｜Low｜非目前正式部署範圍｜scripts/ensure-fonts.mjs:26</summary>

- 原 PDF 頁：72；Issue Details 起始頁：72。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: mkdirSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/ensure-fonts.mjs`；現行行號：26。
- 當下來源 SHA-256：`e7159b760c1d7ba2b58c4b117ed0b6073201e5c7de4fe377b2f92405443bc43a`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/ensure-fonts.mjs:26
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/generate-100-celebration-og.mjs → scripts/ensure-fonts.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/generate-favicon.mjs → scripts/ensure-fonts.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/generate-home-og.mjs → scripts/ensure-fonts.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/generate-home-og-heatmap.mjs → scripts/ensure-fonts.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/generate-100-celebration-og.mjs → scripts/ensure-fonts.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-106｜Low｜非目前正式部署範圍｜scripts/generate-share-100-assets.mjs:336</summary>

- 原 PDF 頁：73；Issue Details 起始頁：72。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: writeFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-share-100-assets.mjs`；現行行號：336。
- 當下來源 SHA-256：`389ec97b8c46d971bc80c63e9bdaf78e022163b155a47c11ea64c7fb5ccc1795`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-share-100-assets.mjs:336
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：9；topLevelVariableStatements：6；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-107｜Low｜非目前正式部署範圍｜scripts/generate-aifed-talk-assets.mjs:39</summary>

- 原 PDF 頁：73；Issue Details 起始頁：73。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: existsSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-aifed-talk-assets.mjs`；現行行號：39。
- 當下來源 SHA-256：`1f68e14444181ce7a25061d7b27ec138bc3ea6be7cf55be8cb033ee6b6485286`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-aifed-talk-assets.mjs:39
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：59；topLevelVariableStatements：18；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-108｜Low｜非目前正式部署範圍｜scripts/subset-wish-font.mjs:69</summary>

- 原 PDF 頁：73；Issue Details 起始頁：73。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: writeFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/subset-wish-font.mjs`；現行行號：69。
- 當下來源 SHA-256：`bc7bee24df5593d9ea817d09ec4a38daa6cecd1f596671d2dbf8d31c4c048e7c`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/subset-wish-font.mjs:69
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：package-cli-reference；references：file：package.json；jsonPointer：/scripts/subset-wish-font
- kind：source-entry-shape；shape：topLevelExpressionStatements：6；topLevelVariableStatements：10；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-109｜Low｜非目前正式部署範圍｜scripts/generate-wish-preview.mjs:28</summary>

- 原 PDF 頁：74；Issue Details 起始頁：74。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: existsSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-wish-preview.mjs`；現行行號：28。
- 當下來源 SHA-256：`8526b0f594b02da8c020882af096325fb346e0e4596b1fe5b4c5ec7310848b77`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-wish-preview.mjs:28
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/generate-wish-preview.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/generate-wish-preview.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-110｜Low｜非目前正式部署範圍｜scripts/prepare-route-loading.mjs:44</summary>

- 原 PDF 頁：74；Issue Details 起始頁：74。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: readFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/prepare-route-loading.mjs`；現行行號：44。
- 當下來源 SHA-256：`4c519c30af8c8b666de268d4714511097a3e86905e54e4b0be3697c3ef740eb3`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/prepare-route-loading.mjs:44
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/prepare-route-loading.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/prepare-route-loading.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-111｜Low｜非目前正式部署範圍｜scripts/generate-latest-tool-previews.mjs:19</summary>

- 原 PDF 頁：75；Issue Details 起始頁：75。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: existsSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-latest-tool-previews.mjs`；現行行號：19。
- 當下來源 SHA-256：`a95e97b484a7d7820c0b5e560256dcd7d80c7298167843ece88314df0179ef53`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-latest-tool-previews.mjs:19
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/generate-latest-tool-previews.mjs
- CI：.github/workflows/deploy-pages.yml／Build／prebuild；scripts/generate-latest-tool-previews.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-112｜Low｜非目前正式部署範圍｜scripts/prepare-route-loading.mjs:8</summary>

- 原 PDF 頁：75；Issue Details 起始頁：75。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: readFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/prepare-route-loading.mjs`；現行行號：8。
- 當下來源 SHA-256：`4c519c30af8c8b666de268d4714511097a3e86905e54e4b0be3697c3ef740eb3`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/prepare-route-loading.mjs:8
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/prepare-route-loading.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/prepare-route-loading.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-113｜Low｜非目前正式部署範圍｜scripts/generate-latest-tool-previews.mjs:25</summary>

- 原 PDF 頁：76；Issue Details 起始頁：75。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: writeFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-latest-tool-previews.mjs`；現行行號：25。
- 當下來源 SHA-256：`a95e97b484a7d7820c0b5e560256dcd7d80c7298167843ece88314df0179ef53`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-latest-tool-previews.mjs:25
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/generate-latest-tool-previews.mjs
- CI：.github/workflows/deploy-pages.yml／Build／prebuild；scripts/generate-latest-tool-previews.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-114｜Low｜非目前正式部署範圍｜scripts/gen-posts-index.ts:111</summary>

- 原 PDF 頁：76；Issue Details 起始頁：76。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: writeFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/gen-posts-index.ts`；現行行號：111。
- 當下來源 SHA-256：`a347c15347369d1a87af8f7efe839aa171449e8516c258701daab2a1d217658e`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/gen-posts-index.ts:111
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/gen-posts-index.ts
- CI：.github/workflows/deploy-pages.yml／Build／check:posts-index --check；scripts/gen-posts-index.ts

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-115｜Low｜非目前正式部署範圍｜scripts/generate-favicon.mjs:38</summary>

- 原 PDF 頁：76；Issue Details 起始頁：76。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: existsSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-favicon.mjs`；現行行號：38。
- 當下來源 SHA-256：`f8f548eacfd1df44c85f497cb28c7dbf2a069a37353124e0075cbf9f887c7323`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-favicon.mjs:38
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/generate-favicon.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/generate-favicon.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-116｜Low｜非目前正式部署範圍｜scripts/generate-share-100-assets.mjs:313</summary>

- 原 PDF 頁：77；Issue Details 起始頁：77。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: unlinkSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-share-100-assets.mjs`；現行行號：313。
- 當下來源 SHA-256：`389ec97b8c46d971bc80c63e9bdaf78e022163b155a47c11ea64c7fb5ccc1795`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-share-100-assets.mjs:313
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：9；topLevelVariableStatements：6；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-117｜Low｜非目前正式部署範圍｜scripts/gen-posts-index.ts:115</summary>

- 原 PDF 頁：77；Issue Details 起始頁：77。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: readFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/gen-posts-index.ts`；現行行號：115。
- 當下來源 SHA-256：`a347c15347369d1a87af8f7efe839aa171449e8516c258701daab2a1d217658e`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/gen-posts-index.ts:115
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/gen-posts-index.ts
- CI：.github/workflows/deploy-pages.yml／Build／check:posts-index --check；scripts/gen-posts-index.ts

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-118｜Low｜非目前正式部署範圍｜scripts/inject-cockpit-stage-beacons.mjs:63</summary>

- 原 PDF 頁：78；Issue Details 起始頁：78。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: readdirSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/inject-cockpit-stage-beacons.mjs`；現行行號：64。
- 當下來源 SHA-256：`d6983b0d93fdb1ce44f3b025b537ebabb071fabc90b952c11183a263e0c97300`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/inject-cockpit-stage-beacons.mjs:64
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：5；topLevelVariableStatements：6；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-119｜Low｜非目前正式部署範圍｜scripts/generate-share-100-assets.mjs:327</summary>

- 原 PDF 頁：78；Issue Details 起始頁：78。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: writeFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-share-100-assets.mjs`；現行行號：327。
- 當下來源 SHA-256：`389ec97b8c46d971bc80c63e9bdaf78e022163b155a47c11ea64c7fb5ccc1795`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-share-100-assets.mjs:327
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：9；topLevelVariableStatements：6；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-120｜Low｜非目前正式部署範圍｜scripts/generate-aifed-talk-assets.mjs:210</summary>

- 原 PDF 頁：79；Issue Details 起始頁：78。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: writeFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-aifed-talk-assets.mjs`；現行行號：210。
- 當下來源 SHA-256：`1f68e14444181ce7a25061d7b27ec138bc3ea6be7cf55be8cb033ee6b6485286`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-aifed-talk-assets.mjs:210
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：59；topLevelVariableStatements：18；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-121｜Low｜非目前正式部署範圍｜scripts/generate-geo-index.mjs:20</summary>

- 原 PDF 頁：79；Issue Details 起始頁：79。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: readFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-geo-index.mjs`；現行行號：20。
- 當下來源 SHA-256：`a07004fd4c4a76bb4ecc47b09144fdd7e6342c783866db3cb4d01d1e2ce5c742`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-geo-index.mjs:20
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/generate-geo-index.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/generate-geo-index.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-122｜Low｜非目前正式部署範圍｜scripts/subset-wish-font.mjs:64</summary>

- 原 PDF 頁：79；Issue Details 起始頁：79。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: readFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/subset-wish-font.mjs`；現行行號：64。
- 當下來源 SHA-256：`bc7bee24df5593d9ea817d09ec4a38daa6cecd1f596671d2dbf8d31c4c048e7c`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/subset-wish-font.mjs:64
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：package-cli-reference；references：file：package.json；jsonPointer：/scripts/subset-wish-font
- kind：source-entry-shape；shape：topLevelExpressionStatements：6；topLevelVariableStatements：10；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-123｜Low｜非目前正式部署範圍｜scripts/inject-cockpit-stage-beacons.mjs:71</summary>

- 原 PDF 頁：80；Issue Details 起始頁：80。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: existsSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/inject-cockpit-stage-beacons.mjs`；現行行號：77。
- 當下來源 SHA-256：`d6983b0d93fdb1ce44f3b025b537ebabb071fabc90b952c11183a263e0c97300`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/inject-cockpit-stage-beacons.mjs:77
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：5；topLevelVariableStatements：6；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-124｜Low｜非目前正式部署範圍｜scripts/generate-latest-tool-previews.mjs:27</summary>

- 原 PDF 頁：80；Issue Details 起始頁：80。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: readFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-latest-tool-previews.mjs`；現行行號：27。
- 當下來源 SHA-256：`a95e97b484a7d7820c0b5e560256dcd7d80c7298167843ece88314df0179ef53`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-latest-tool-previews.mjs:27
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/generate-latest-tool-previews.mjs
- CI：.github/workflows/deploy-pages.yml／Build／prebuild；scripts/generate-latest-tool-previews.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-125｜Low｜非目前正式部署範圍｜scripts/add-tool-108.mjs:101</summary>

- 原 PDF 頁：81；Issue Details 起始頁：81。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: mkdirSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/add-tool-108.mjs`；現行行號：101。
- 當下來源 SHA-256：`f3665df92d32b7d29b391ec7051b22cfdd5898a4c3df5e9bcb216d89cab9a9f5`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/add-tool-108.mjs:101
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：4；topLevelVariableStatements：10；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-126｜Low｜非目前正式部署範圍｜scripts/subset-web-font.mjs:39</summary>

- 原 PDF 頁：81；Issue Details 起始頁：81。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: existsSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/subset-web-font.mjs`；現行行號：40。
- 當下來源 SHA-256：`52dbb301a66e10c0863dcd7c4a5c60555af5d45b6891b644922fcddf2383f350`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/subset-web-font.mjs:40
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：package-cli-reference；references：file：package.json；jsonPointer：/scripts/subset-web-font
- kind：source-entry-shape；shape：topLevelExpressionStatements：4；topLevelVariableStatements：24；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-127｜Low｜非目前正式部署範圍｜scripts/bump-sw-version.mjs:30</summary>

- 原 PDF 頁：82；Issue Details 起始頁：81。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: readFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/bump-sw-version.mjs`；現行行號：30。
- 當下來源 SHA-256：`9b7a3d8fd0fc09195221837f9eb99ede6a64ef327e3dacb753a2029d0987efd3`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/bump-sw-version.mjs:30
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/bump-sw-version.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/bump-sw-version.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-128｜Low｜非目前正式部署範圍｜scripts/generate-wish-preview.mjs:523</summary>

- 原 PDF 頁：82；Issue Details 起始頁：82。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: writeFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-wish-preview.mjs`；現行行號：523。
- 當下來源 SHA-256：`8526b0f594b02da8c020882af096325fb346e0e4596b1fe5b4c5ec7310848b77`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-wish-preview.mjs:523
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/generate-wish-preview.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/generate-wish-preview.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-129｜Low｜非目前正式部署範圍｜scripts/add-tool-109.mjs:105</summary>

- 原 PDF 頁：82；Issue Details 起始頁：82。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: mkdirSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/add-tool-109.mjs`；現行行號：105。
- 當下來源 SHA-256：`90ffe5f7317c0de8309d765cd37c78eff45b2022aa9b6569dea437f0c48ffed6`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/add-tool-109.mjs:105
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：4；topLevelVariableStatements：10；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-130｜Low｜非目前正式部署範圍｜scripts/bump-sw-version.mjs:48</summary>

- 原 PDF 頁：83；Issue Details 起始頁：83。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: readFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/bump-sw-version.mjs`；現行行號：48。
- 當下來源 SHA-256：`9b7a3d8fd0fc09195221837f9eb99ede6a64ef327e3dacb753a2029d0987efd3`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/bump-sw-version.mjs:48
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/bump-sw-version.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/bump-sw-version.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-131｜Low｜非目前正式部署範圍｜scripts/generate-share-100-assets.mjs:332</summary>

- 原 PDF 頁：83；Issue Details 起始頁：83。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: writeFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-share-100-assets.mjs`；現行行號：332。
- 當下來源 SHA-256：`389ec97b8c46d971bc80c63e9bdaf78e022163b155a47c11ea64c7fb5ccc1795`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-share-100-assets.mjs:332
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：9；topLevelVariableStatements：6；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-132｜Low｜非目前正式部署範圍｜scripts/mark-reasons-reviewed.mjs:59</summary>

- 原 PDF 頁：84；Issue Details 起始頁：84。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: readFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/mark-reasons-reviewed.mjs`；現行行號：59。
- 當下來源 SHA-256：`9eced96026fbae8436f298d5182277b05997b0da12c08f6da975fd199cd68015`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/mark-reasons-reviewed.mjs:59
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：package-cli-reference；references：file：package.json；jsonPointer：/scripts/reasons:reviewed
- kind：source-entry-shape；shape：topLevelExpressionStatements：2；topLevelVariableStatements：7；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-133｜Low｜非目前正式部署範圍｜scripts/generate-aifed-talk-assets.mjs:128</summary>

- 原 PDF 頁：84；Issue Details 起始頁：84。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: writeFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-aifed-talk-assets.mjs`；現行行號：128。
- 當下來源 SHA-256：`1f68e14444181ce7a25061d7b27ec138bc3ea6be7cf55be8cb033ee6b6485286`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-aifed-talk-assets.mjs:128
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：59；topLevelVariableStatements：18；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-134｜Low｜非目前正式部署範圍｜scripts/subset-web-font.mjs:109</summary>

- 原 PDF 頁：85；Issue Details 起始頁：84。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: readFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/subset-web-font.mjs`；現行行號：112。
- 當下來源 SHA-256：`52dbb301a66e10c0863dcd7c4a5c60555af5d45b6891b644922fcddf2383f350`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/subset-web-font.mjs:112
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：package-cli-reference；references：file：package.json；jsonPointer：/scripts/subset-web-font
- kind：source-entry-shape；shape：topLevelExpressionStatements：4；topLevelVariableStatements：24；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-135｜Low｜非目前正式部署範圍｜scripts/generate-geo-index.mjs:229</summary>

- 原 PDF 頁：85；Issue Details 起始頁：85。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: mkdirSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-geo-index.mjs`；現行行號：229。
- 當下來源 SHA-256：`a07004fd4c4a76bb4ecc47b09144fdd7e6342c783866db3cb4d01d1e2ce5c742`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-geo-index.mjs:229
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/generate-geo-index.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/generate-geo-index.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-136｜Low｜非目前正式部署範圍｜scripts/inject-cockpit-stage-beacons.mjs:75</summary>

- 原 PDF 頁：85；Issue Details 起始頁：85。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: readFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/inject-cockpit-stage-beacons.mjs`；現行行號：83。
- 當下來源 SHA-256：`d6983b0d93fdb1ce44f3b025b537ebabb071fabc90b952c11183a263e0c97300`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/inject-cockpit-stage-beacons.mjs:83
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：5；topLevelVariableStatements：6；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-137｜Low｜非目前正式部署範圍｜scripts/generate-favicon.mjs:38</summary>

- 原 PDF 頁：86；Issue Details 起始頁：86。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: mkdirSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-favicon.mjs`；現行行號：38。
- 當下來源 SHA-256：`f8f548eacfd1df44c85f497cb28c7dbf2a069a37353124e0075cbf9f887c7323`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-favicon.mjs:38
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/generate-favicon.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/generate-favicon.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-138｜Low｜非目前正式部署範圍｜scripts/prepare-route-loading.mjs:46</summary>

- 原 PDF 頁：86；Issue Details 起始頁：86。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: writeFileSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/prepare-route-loading.mjs`；現行行號：46。
- 當下來源 SHA-256：`4c519c30af8c8b666de268d4714511097a3e86905e54e4b0be3697c3ef740eb3`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/prepare-route-loading.mjs:46
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- ci：scripts/prepare-route-loading.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/prepare-route-loading.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-139｜Low｜非目前正式部署範圍｜server/logger.ts:7</summary>

- 原 PDF 頁：87；Issue Details 起始頁：87。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: mkdirSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`server/logger.ts`；現行行號：7。
- 當下來源 SHA-256：`e3ef68ee61234e875b29270d33270065643dcd39b71a4d979a1f2dd5deb53607`（工作樹實際 bytes）。
- 部署範圍：Express 來源，未隨 Pages 產物部署。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 server/logger.ts:7
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- express：server/index.ts → db/index.ts → server/logger.ts
- kind：express-build-excluded-from-pages；evidenceRefs：expressCompile；expressDev；expressStart；pagesUpload

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-140｜Low｜非目前正式部署範圍｜server/cache.ts:11</summary>

- 原 PDF 頁：87；Issue Details 起始頁：87。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: mkdirSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`server/cache.ts`；現行行號：11。
- 當下來源 SHA-256：`c8edf8d3a5d58e8edb1380ed010313208ee145db2e56578d7e53312199f4669c`（工作樹實際 bytes）。
- 部署範圍：Express 來源，未隨 Pages 產物部署。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 server/cache.ts:11
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- express：server/index.ts → server/cache.ts
- kind：express-build-excluded-from-pages；evidenceRefs：expressCompile；expressDev；expressStart；pagesUpload

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-141｜Low｜非目前正式部署範圍｜server/cache.ts:10</summary>

- 原 PDF 頁：88；Issue Details 起始頁：87。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: existsSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`server/cache.ts`；現行行號：10。
- 當下來源 SHA-256：`c8edf8d3a5d58e8edb1380ed010313208ee145db2e56578d7e53312199f4669c`（工作樹實際 bytes）。
- 部署範圍：Express 來源，未隨 Pages 產物部署。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 server/cache.ts:10
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- express：server/index.ts → server/cache.ts
- kind：express-build-excluded-from-pages；evidenceRefs：expressCompile；expressDev；expressStart；pagesUpload

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-142｜Low｜非目前正式部署範圍｜server/logger.ts:6</summary>

- 原 PDF 頁：88；Issue Details 起始頁：88。
- 原類別：Denial of Service。
- 原 sink：FunctionPointerCall: existsSync。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`server/logger.ts`；現行行號：6。
- 當下來源 SHA-256：`e3ef68ee61234e875b29270d33270065643dcd39b71a4d979a1f2dd5deb53607`（工作樹實際 bytes）。
- 部署範圍：Express 來源，未隨 Pages 產物部署。

**原因**

告警是同步檔案操作。已讀取現行檔案並核對 sink；維護或建置由操作者執行，server/db 為啟動初始化，尚未找到本次 Pages／Functions 請求能觸發此同步操作。此判定只界定部署範圍，不宣稱任何 CLI 輸入都可信或不需限制。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 server/logger.ts:6
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另部署 Express，須重做輸入大小與請求可達性測試
- CLI／CI 的受控檔案來源與資源上限仍須由維護者確認
- Fortify 複掃與原始平台逐筆審查未完成

**部署鏈及範圍依據**

- express：server/index.ts → db/index.ts → server/logger.ts
- kind：express-build-excluded-from-pages；evidenceRefs：expressCompile；expressDev；expressStart；pagesUpload

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-143｜Low｜已加固待複掃｜client/public/akai-talk-2026/index.html:82</summary>

- 原 PDF 頁：90；Issue Details 起始頁：89。
- 原類別：Hardcoded Domain in HTML。
- 原 sink：報告未提供名稱。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`client/public/akai-talk-2026/index.html`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`2ce021e2d188617a0db086c2690bc70411800cad84a4dbd485687e97d4206bcd`（工作樹實際 bytes）。
- 部署範圍：Pages 公開複製資產。

**原因**

React 18.3.1 與 ReactDOM 18.3.1 UMD 執行檔改為同站提供，保留 MIT 授權並加 SHA-384 完整性屬性；離線測試核對引用與實際檔案指紋。沒有停用整體 JavaScript 或變更執行版本。

**證據**

- client/public/akai-talk-2026/index.html
- client/public/akai-talk-2026/vendor/
- scripts/vendor-react.test.mjs

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 同版本 Fortify 複掃
- 原掃描平台逐筆人工審查與回填

**部署鏈及範圍依據**

- kind：vite-public-copy；evidenceRefs：viteRoot；viteDefaults；viteOutput；pagesUpload；publicArtifactRelativeFile：akai-talk-2026/index.html

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-144｜Low｜已加固待複掃｜client/public/akai-talk-2026/index.html:83</summary>

- 原 PDF 頁：90；Issue Details 起始頁：90。
- 原類別：Hardcoded Domain in HTML。
- 原 sink：報告未提供名稱。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`client/public/akai-talk-2026/index.html`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`2ce021e2d188617a0db086c2690bc70411800cad84a4dbd485687e97d4206bcd`（工作樹實際 bytes）。
- 部署範圍：Pages 公開複製資產。

**原因**

React 18.3.1 與 ReactDOM 18.3.1 UMD 執行檔改為同站提供，保留 MIT 授權並加 SHA-384 完整性屬性；離線測試核對引用與實際檔案指紋。沒有停用整體 JavaScript 或變更執行版本。

**證據**

- client/public/akai-talk-2026/index.html
- client/public/akai-talk-2026/vendor/
- scripts/vendor-react.test.mjs

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 同版本 Fortify 複掃
- 原掃描平台逐筆人工審查與回填

**部署鏈及範圍依據**

- kind：vite-public-copy；evidenceRefs：viteRoot；viteDefaults；viteOutput；pagesUpload；publicArtifactRelativeFile：akai-talk-2026/index.html

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-145｜High｜誤判候選待審查｜client/src/components/AchievementBadge.tsx:133</summary>

- 原 PDF 頁：92；Issue Details 起始頁：92。
- 原類別：Insecure Randomness。
- 原 sink：FunctionPointerCall: random。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`client/src/components/AchievementBadge.tsx`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`dd4837c5e34d37ee5c315bff793b4eca3ab432e32f44d5b1795699d4952d80fd`（工作樹實際 bytes）。
- 部署範圍：未進當前 Pages 入口匯入圖的 client 來源。

**原因**

彩紙／愛心／成就動畫的座標、大小、形狀、旋轉、延遲或速度。 保留 Math.random，不為消除告警增加無必要的密碼學依賴。

**證據**

- relativeFile：client/src/components/AchievementBadge.tsx；line：133；purpose：彩紙／愛心／成就動畫的座標、大小、形狀、旋轉、延遲或速度。

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 尚未使用同一版本重新執行 Fortify，不能宣稱掃描告警已消失。
- 本次逐筆檢查用途與資料流；未重新執行動畫／排序實體瀏覽器測試。

**部署鏈及範圍依據**

- kind：client-import-graph-negative；entry：client/src/main.tsx；graph：fortify-client-import-metafile.json；staticImportReferences：from：client/src/components/AchievementsList.tsx；to：client/src/components/AchievementBadge.tsx；line：3；kind：static-import；isTest：False；note：限定本次檢查入口，並非原弱點不存在或永久不能使用。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-146｜High｜誤判候選待審查｜client/src/components/AchievementBadge.tsx:134</summary>

- 原 PDF 頁：92；Issue Details 起始頁：92。
- 原類別：Insecure Randomness。
- 原 sink：FunctionPointerCall: random。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`client/src/components/AchievementBadge.tsx`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`dd4837c5e34d37ee5c315bff793b4eca3ab432e32f44d5b1795699d4952d80fd`（工作樹實際 bytes）。
- 部署範圍：未進當前 Pages 入口匯入圖的 client 來源。

**原因**

彩紙／愛心／成就動畫的座標、大小、形狀、旋轉、延遲或速度。 保留 Math.random，不為消除告警增加無必要的密碼學依賴。

**證據**

- relativeFile：client/src/components/AchievementBadge.tsx；line：134；purpose：彩紙／愛心／成就動畫的座標、大小、形狀、旋轉、延遲或速度。

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 尚未使用同一版本重新執行 Fortify，不能宣稱掃描告警已消失。
- 本次逐筆檢查用途與資料流；未重新執行動畫／排序實體瀏覽器測試。

**部署鏈及範圍依據**

- kind：client-import-graph-negative；entry：client/src/main.tsx；graph：fortify-client-import-metafile.json；staticImportReferences：from：client/src/components/AchievementsList.tsx；to：client/src/components/AchievementBadge.tsx；line：3；kind：static-import；isTest：False；note：限定本次檢查入口，並非原弱點不存在或永久不能使用。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-147｜High｜誤判候選待審查｜client/src/components/primitives/ConfettiBurst.tsx:57</summary>

- 原 PDF 頁：93；Issue Details 起始頁：93。
- 原類別：Insecure Randomness。
- 原 sink：FunctionPointerCall: random。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`client/src/components/primitives/ConfettiBurst.tsx`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`e2514d85e74f19f303d95fe28c8cc0a7dd49010de34ef06c93ba80da629b8fe7`（工作樹實際 bytes）。
- 部署範圍：Pages 瀏覽器 JS 候選。

**原因**

彩紙／愛心／成就動畫的座標、大小、形狀、旋轉、延遲或速度。 保留 Math.random，不為消除告警增加無必要的密碼學依賴。

**證據**

- relativeFile：client/src/components/primitives/ConfettiBurst.tsx；line：57；purpose：彩紙／愛心／成就動畫的座標、大小、形狀、旋轉、延遲或速度。

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 尚未使用同一版本重新執行 Fortify，不能宣稱掃描告警已消失。
- 本次逐筆檢查用途與資料流；未重新執行動畫／排序實體瀏覽器測試。

**部署鏈及範圍依據**

- client：client/src/main.tsx → client/src/App.tsx → client/src/pages/BulletinHome.tsx → client/src/components/bulletin/BulletinMilestone100.tsx → client/src/components/primitives/ConfettiBurst.tsx

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-148｜High｜誤判候選待審查｜client/src/components/primitives/ConfettiBurst.tsx:58</summary>

- 原 PDF 頁：93；Issue Details 起始頁：93。
- 原類別：Insecure Randomness。
- 原 sink：FunctionPointerCall: random。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`client/src/components/primitives/ConfettiBurst.tsx`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`e2514d85e74f19f303d95fe28c8cc0a7dd49010de34ef06c93ba80da629b8fe7`（工作樹實際 bytes）。
- 部署範圍：Pages 瀏覽器 JS 候選。

**原因**

彩紙／愛心／成就動畫的座標、大小、形狀、旋轉、延遲或速度。 保留 Math.random，不為消除告警增加無必要的密碼學依賴。

**證據**

- relativeFile：client/src/components/primitives/ConfettiBurst.tsx；line：58；purpose：彩紙／愛心／成就動畫的座標、大小、形狀、旋轉、延遲或速度。

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 尚未使用同一版本重新執行 Fortify，不能宣稱掃描告警已消失。
- 本次逐筆檢查用途與資料流；未重新執行動畫／排序實體瀏覽器測試。

**部署鏈及範圍依據**

- client：client/src/main.tsx → client/src/App.tsx → client/src/pages/BulletinHome.tsx → client/src/components/bulletin/BulletinMilestone100.tsx → client/src/components/primitives/ConfettiBurst.tsx

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-149｜High｜誤判候選待審查｜client/src/components/primitives/ConfettiBurst.tsx:59</summary>

- 原 PDF 頁：94；Issue Details 起始頁：94。
- 原類別：Insecure Randomness。
- 原 sink：FunctionPointerCall: random。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`client/src/components/primitives/ConfettiBurst.tsx`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`e2514d85e74f19f303d95fe28c8cc0a7dd49010de34ef06c93ba80da629b8fe7`（工作樹實際 bytes）。
- 部署範圍：Pages 瀏覽器 JS 候選。

**原因**

彩紙／愛心／成就動畫的座標、大小、形狀、旋轉、延遲或速度。 保留 Math.random，不為消除告警增加無必要的密碼學依賴。

**證據**

- relativeFile：client/src/components/primitives/ConfettiBurst.tsx；line：59；purpose：彩紙／愛心／成就動畫的座標、大小、形狀、旋轉、延遲或速度。

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 尚未使用同一版本重新執行 Fortify，不能宣稱掃描告警已消失。
- 本次逐筆檢查用途與資料流；未重新執行動畫／排序實體瀏覽器測試。

**部署鏈及範圍依據**

- client：client/src/main.tsx → client/src/App.tsx → client/src/pages/BulletinHome.tsx → client/src/components/bulletin/BulletinMilestone100.tsx → client/src/components/primitives/ConfettiBurst.tsx

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-150｜High｜誤判候選待審查｜client/src/components/primitives/ConfettiBurst.tsx:61</summary>

- 原 PDF 頁：94；Issue Details 起始頁：94。
- 原類別：Insecure Randomness。
- 原 sink：FunctionPointerCall: random。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`client/src/components/primitives/ConfettiBurst.tsx`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`e2514d85e74f19f303d95fe28c8cc0a7dd49010de34ef06c93ba80da629b8fe7`（工作樹實際 bytes）。
- 部署範圍：Pages 瀏覽器 JS 候選。

**原因**

彩紙／愛心／成就動畫的座標、大小、形狀、旋轉、延遲或速度。 保留 Math.random，不為消除告警增加無必要的密碼學依賴。

**證據**

- relativeFile：client/src/components/primitives/ConfettiBurst.tsx；line：61；purpose：彩紙／愛心／成就動畫的座標、大小、形狀、旋轉、延遲或速度。

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 尚未使用同一版本重新執行 Fortify，不能宣稱掃描告警已消失。
- 本次逐筆檢查用途與資料流；未重新執行動畫／排序實體瀏覽器測試。

**部署鏈及範圍依據**

- client：client/src/main.tsx → client/src/App.tsx → client/src/pages/BulletinHome.tsx → client/src/components/bulletin/BulletinMilestone100.tsx → client/src/components/primitives/ConfettiBurst.tsx

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-151｜High｜誤判候選待審查｜client/src/components/primitives/ConfettiBurst.tsx:62</summary>

- 原 PDF 頁：95；Issue Details 起始頁：95。
- 原類別：Insecure Randomness。
- 原 sink：FunctionPointerCall: random。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`client/src/components/primitives/ConfettiBurst.tsx`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`e2514d85e74f19f303d95fe28c8cc0a7dd49010de34ef06c93ba80da629b8fe7`（工作樹實際 bytes）。
- 部署範圍：Pages 瀏覽器 JS 候選。

**原因**

彩紙／愛心／成就動畫的座標、大小、形狀、旋轉、延遲或速度。 保留 Math.random，不為消除告警增加無必要的密碼學依賴。

**證據**

- relativeFile：client/src/components/primitives/ConfettiBurst.tsx；line：62；purpose：彩紙／愛心／成就動畫的座標、大小、形狀、旋轉、延遲或速度。

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 尚未使用同一版本重新執行 Fortify，不能宣稱掃描告警已消失。
- 本次逐筆檢查用途與資料流；未重新執行動畫／排序實體瀏覽器測試。

**部署鏈及範圍依據**

- client：client/src/main.tsx → client/src/App.tsx → client/src/pages/BulletinHome.tsx → client/src/components/bulletin/BulletinMilestone100.tsx → client/src/components/primitives/ConfettiBurst.tsx

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-152｜High｜誤判候選待審查｜client/src/components/primitives/ConfettiBurst.tsx:63</summary>

- 原 PDF 頁：95；Issue Details 起始頁：95。
- 原類別：Insecure Randomness。
- 原 sink：FunctionPointerCall: random。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`client/src/components/primitives/ConfettiBurst.tsx`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`e2514d85e74f19f303d95fe28c8cc0a7dd49010de34ef06c93ba80da629b8fe7`（工作樹實際 bytes）。
- 部署範圍：Pages 瀏覽器 JS 候選。

**原因**

彩紙／愛心／成就動畫的座標、大小、形狀、旋轉、延遲或速度。 保留 Math.random，不為消除告警增加無必要的密碼學依賴。

**證據**

- relativeFile：client/src/components/primitives/ConfettiBurst.tsx；line：63；purpose：彩紙／愛心／成就動畫的座標、大小、形狀、旋轉、延遲或速度。

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 尚未使用同一版本重新執行 Fortify，不能宣稱掃描告警已消失。
- 本次逐筆檢查用途與資料流；未重新執行動畫／排序實體瀏覽器測試。

**部署鏈及範圍依據**

- client：client/src/main.tsx → client/src/App.tsx → client/src/pages/BulletinHome.tsx → client/src/components/bulletin/BulletinMilestone100.tsx → client/src/components/primitives/ConfettiBurst.tsx

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-153｜High｜誤判候選待審查｜client/src/components/primitives/HeartBurst.tsx:24</summary>

- 原 PDF 頁：96；Issue Details 起始頁：95。
- 原類別：Insecure Randomness。
- 原 sink：FunctionPointerCall: random。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`client/src/components/primitives/HeartBurst.tsx`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`da14c6a9059990fed44cf422739eb3ca96f565f79032c08668e03903bd2fc570`（工作樹實際 bytes）。
- 部署範圍：Pages 瀏覽器 JS 候選。

**原因**

彩紙／愛心／成就動畫的座標、大小、形狀、旋轉、延遲或速度。 保留 Math.random，不為消除告警增加無必要的密碼學依賴。

**證據**

- relativeFile：client/src/components/primitives/HeartBurst.tsx；line：24；purpose：彩紙／愛心／成就動畫的座標、大小、形狀、旋轉、延遲或速度。

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 尚未使用同一版本重新執行 Fortify，不能宣稱掃描告警已消失。
- 本次逐筆檢查用途與資料流；未重新執行動畫／排序實體瀏覽器測試。

**部署鏈及範圍依據**

- client：client/src/main.tsx → client/src/App.tsx → client/src/pages/BulletinToolDetail.tsx → client/src/components/primitives/HeartBurst.tsx

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-154｜High｜誤判候選待審查｜client/src/components/primitives/HeartBurst.tsx:26</summary>

- 原 PDF 頁：96；Issue Details 起始頁：96。
- 原類別：Insecure Randomness。
- 原 sink：FunctionPointerCall: random。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`client/src/components/primitives/HeartBurst.tsx`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`da14c6a9059990fed44cf422739eb3ca96f565f79032c08668e03903bd2fc570`（工作樹實際 bytes）。
- 部署範圍：Pages 瀏覽器 JS 候選。

**原因**

彩紙／愛心／成就動畫的座標、大小、形狀、旋轉、延遲或速度。 保留 Math.random，不為消除告警增加無必要的密碼學依賴。

**證據**

- relativeFile：client/src/components/primitives/HeartBurst.tsx；line：26；purpose：彩紙／愛心／成就動畫的座標、大小、形狀、旋轉、延遲或速度。

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 尚未使用同一版本重新執行 Fortify，不能宣稱掃描告警已消失。
- 本次逐筆檢查用途與資料流；未重新執行動畫／排序實體瀏覽器測試。

**部署鏈及範圍依據**

- client：client/src/main.tsx → client/src/App.tsx → client/src/pages/BulletinToolDetail.tsx → client/src/components/primitives/HeartBurst.tsx

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-155｜High｜誤判候選待審查｜client/src/components/primitives/HeartBurst.tsx:27</summary>

- 原 PDF 頁：96；Issue Details 起始頁：96。
- 原類別：Insecure Randomness。
- 原 sink：FunctionPointerCall: random。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`client/src/components/primitives/HeartBurst.tsx`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`da14c6a9059990fed44cf422739eb3ca96f565f79032c08668e03903bd2fc570`（工作樹實際 bytes）。
- 部署範圍：Pages 瀏覽器 JS 候選。

**原因**

彩紙／愛心／成就動畫的座標、大小、形狀、旋轉、延遲或速度。 保留 Math.random，不為消除告警增加無必要的密碼學依賴。

**證據**

- relativeFile：client/src/components/primitives/HeartBurst.tsx；line：27；purpose：彩紙／愛心／成就動畫的座標、大小、形狀、旋轉、延遲或速度。

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 尚未使用同一版本重新執行 Fortify，不能宣稱掃描告警已消失。
- 本次逐筆檢查用途與資料流；未重新執行動畫／排序實體瀏覽器測試。

**部署鏈及範圍依據**

- client：client/src/main.tsx → client/src/App.tsx → client/src/pages/BulletinToolDetail.tsx → client/src/components/primitives/HeartBurst.tsx

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-156｜High｜誤判候選待審查｜client/src/components/ui/sidebar.tsx:654</summary>

- 原 PDF 頁：97；Issue Details 起始頁：97。
- 原類別：Insecure Randomness。
- 原 sink：FunctionPointerCall: random。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`client/src/components/ui/sidebar.tsx`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`43bd324b2067d92de176d95b39cb5cac73b3747d47d34d91e9c03685f96065fc`（工作樹實際 bytes）。
- 部署範圍：未進當前 Pages 入口匯入圖的 client 來源。

**原因**

載入骨架的 50–90% 視覺寬度。 保留 Math.random，不為消除告警增加無必要的密碼學依賴。

**證據**

- relativeFile：client/src/components/ui/sidebar.tsx；line：654；purpose：載入骨架的 50–90% 視覺寬度。

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 尚未使用同一版本重新執行 Fortify，不能宣稱掃描告警已消失。
- 本次逐筆檢查用途與資料流；未重新執行動畫／排序實體瀏覽器測試。

**部署鏈及範圍依據**

- kind：client-import-graph-negative；entry：client/src/main.tsx；graph：fortify-client-import-metafile.json；staticImportReferences：；note：限定本次檢查入口，並非原弱點不存在或永久不能使用。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-157｜High｜誤判候選待審查｜client/src/hooks/useSortOptions.ts:46</summary>

- 原 PDF 頁：97；Issue Details 起始頁：97。
- 原類別：Insecure Randomness。
- 原 sink：FunctionPointerCall: random。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`client/src/hooks/useSortOptions.ts`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`563f0bbc0aa4e627b357158e17287b531d1dfddfc5c7923671739dd051d69e0e`（工作樹實際 bytes）。
- 部署範圍：Pages 瀏覽器 JS 候選。

**原因**

展示工具的 Fisher-Yates 洗牌或頁面排序 seed，不用於認證或存取控制。 保留 Math.random，不為消除告警增加無必要的密碼學依賴。

**證據**

- relativeFile：client/src/hooks/useSortOptions.ts；line：46；purpose：展示工具的 Fisher-Yates 洗牌或頁面排序 seed，不用於認證或存取控制。

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 尚未使用同一版本重新執行 Fortify，不能宣稱掃描告警已消失。
- 本次逐筆檢查用途與資料流；未重新執行動畫／排序實體瀏覽器測試。

**部署鏈及範圍依據**

- client：client/src/main.tsx → client/src/App.tsx → client/src/pages/BulletinHome.tsx → client/src/hooks/useSortOptions.ts
- kind：test-import-references；references：from：client/src/hooks/__tests__/useSortOptions.test.ts；to：client/src/hooks/useSortOptions.ts；line：7；kind：static-import；isTest：True；note：這是測試中的引用；是否以 mock 替代要另審，不能當公開部署證據。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-158｜High｜誤判候選待審查｜client/src/hooks/useSortOptions.ts:53</summary>

- 原 PDF 頁：98；Issue Details 起始頁：98。
- 原類別：Insecure Randomness。
- 原 sink：FunctionPointerCall: random。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`client/src/hooks/useSortOptions.ts`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`563f0bbc0aa4e627b357158e17287b531d1dfddfc5c7923671739dd051d69e0e`（工作樹實際 bytes）。
- 部署範圍：Pages 瀏覽器 JS 候選。

**原因**

展示工具的 Fisher-Yates 洗牌或頁面排序 seed，不用於認證或存取控制。 保留 Math.random，不為消除告警增加無必要的密碼學依賴。

**證據**

- relativeFile：client/src/hooks/useSortOptions.ts；line：53；purpose：展示工具的 Fisher-Yates 洗牌或頁面排序 seed，不用於認證或存取控制。

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 尚未使用同一版本重新執行 Fortify，不能宣稱掃描告警已消失。
- 本次逐筆檢查用途與資料流；未重新執行動畫／排序實體瀏覽器測試。

**部署鏈及範圍依據**

- client：client/src/main.tsx → client/src/App.tsx → client/src/pages/BulletinHome.tsx → client/src/hooks/useSortOptions.ts
- kind：test-import-references；references：from：client/src/hooks/__tests__/useSortOptions.test.ts；to：client/src/hooks/useSortOptions.ts；line：7；kind：static-import；isTest：True；note：這是測試中的引用；是否以 mock 替代要另審，不能當公開部署證據。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-159｜High｜誤判候選待審查｜client/src/lib/analytics.ts:279</summary>

- 原 PDF 頁：98；Issue Details 起始頁：98。
- 原類別：Insecure Randomness。
- 原 sink：FunctionPointerCall: random。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`client/src/lib/analytics.ts`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`f0bebff04a9a7ec175baf8b553446da3a39612c033087a503c3c46165098c5b6`（工作樹實際 bytes）。
- 部署範圍：Pages 瀏覽器 JS 候選。

**原因**

25% Web Vitals 抽樣旗標，僅決定統計取樣，不決定身份、密碼或權限。 保留 Math.random，不為消除告警增加無必要的密碼學依賴。

**證據**

- relativeFile：client/src/lib/analytics.ts；line：279；purpose：25% Web Vitals 抽樣旗標，僅決定統計取樣，不決定身份、密碼或權限。

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 尚未使用同一版本重新執行 Fortify，不能宣稱掃描告警已消失。
- 本次逐筆檢查用途與資料流；未重新執行動畫／排序實體瀏覽器測試。

**部署鏈及範圍依據**

- client：client/src/main.tsx → client/src/lib/analytics.ts

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-160｜High｜已加固待複掃｜client/src/lib/publicAnalyticsService.ts:22</summary>

- 原 PDF 頁：99；Issue Details 起始頁：98。
- 原類別：Insecure Randomness。
- 原 sink：FunctionPointerCall: random。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`client/src/lib/publicAnalyticsService.ts`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`c4794c2e1fbd8373214c24d3a995ccc6f3b8f514d64690c0676c451c04d81c05`（工作樹實際 bytes）。
- 部署範圍：Pages 瀏覽器 JS 候選。

**原因**

此亂數備援用於事件冪等 ID 或會話歸因識別碼，已有系統 randomUUID 主路徑，但舊 fallback 為 Math.random。現改 randomUUID 或 getRandomValues 產生 UUIDv4；系統亂數失效不再生成可預測隨機 ID。

**證據**

- relativeFile：client/src/lib/publicAnalyticsService.ts；line：21；purpose：事件或會話 ID 使用共用 CSPRNG helper。
- relativeFile：client/src/lib/randomId.ts；line：13；purpose：randomUUID 不支援時以系統亂數產生 UUIDv4。
- relativeFile：client/src/lib/publicAnalyticsService.ts；line：23；purpose：缺少安全亂數時明確診斷並 return false，停止送出事件。

**測試／既有階段記錄**

- command：node node_modules/vitest/vitest.mjs run client/src/lib/__tests__/randomId.test.ts client/src/lib/__tests__/publicAnalyticsService.test.ts --maxWorkers 1；result：passed；scope：2檔7案例，系統 UUID、getRandomValues 備援與失效不送事件。

**仍待驗證**

- 尚未使用同一版本重新執行 Fortify，不能宣稱掃描告警已消失。
- 正式 HTTPS 與實際本機瀏覽器 crypto 能力仍由部署驗收確認；mock 測試不代表實體裝置結果。

**部署鏈及範圍依據**

- client：client/src/main.tsx → client/src/lib/analytics.ts → client/src/lib/publicAnalyticsService.ts
- kind：test-import-references；references：from：client/src/lib/__tests__/publicAnalyticsService.test.ts；to：client/src/lib/publicAnalyticsService.ts；line：8；kind：static-import；isTest：True；note：這是測試中的引用；是否以 mock 替代要另審，不能當公開部署證據。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-161｜High｜已加固待複掃｜client/src/lib/firestoreService.ts:138</summary>

- 原 PDF 頁：99；Issue Details 起始頁：99。
- 原類別：Insecure Randomness。
- 原 sink：FunctionPointerCall: random。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`client/src/lib/firestoreService.ts`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`ec60763babd4d58dc5c0eb9ad1f06a1fa947b9398b84ce71cacbdffc7968e5f6`（工作樹實際 bytes）。
- 部署範圍：Pages 瀏覽器 JS 候選。

**原因**

此亂數備援用於事件冪等 ID 或會話歸因識別碼，已有系統 randomUUID 主路徑，但舊 fallback 為 Math.random。現改 randomUUID 或 getRandomValues 產生 UUIDv4；系統亂數失效不再生成可預測隨機 ID。

**證據**

- relativeFile：client/src/lib/firestoreService.ts；line：136；purpose：事件或會話 ID 使用共用 CSPRNG helper。
- relativeFile：client/src/lib/randomId.ts；line：13；purpose：randomUUID 不支援時以系統亂數產生 UUIDv4。
- relativeFile：client/src/lib/firestoreService.ts；line：138；purpose：缺少安全亂數時明確診斷並沿用非唯一 anon 標記，不聲稱是安全或唯一 ID。

**測試／既有階段記錄**

- command：node node_modules/vitest/vitest.mjs run client/src/lib/__tests__/randomId.test.ts client/src/lib/__tests__/publicAnalyticsService.test.ts --maxWorkers 1；result：passed；scope：2檔7案例，系統 UUID、getRandomValues 備援與失效不送事件。

**仍待驗證**

- 尚未使用同一版本重新執行 Fortify，不能宣稱掃描告警已消失。
- 正式 HTTPS 與實際本機瀏覽器 crypto 能力仍由部署驗收確認；mock 測試不代表實體裝置結果。

**部署鏈及範圍依據**

- client：client/src/main.tsx → client/src/App.tsx → client/src/pages/BulletinToolDetail.tsx → client/src/lib/firestoreService.ts

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-162｜High｜誤判候選待審查｜client/src/pages/Home.tsx:222</summary>

- 原 PDF 頁：99；Issue Details 起始頁：99。
- 原類別：Insecure Randomness。
- 原 sink：FunctionPointerCall: random。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`client/src/pages/Home.tsx`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`c862ccd560c64a3f4abd923deb3572c39d6b87b81bbc4d0ed62cbcc7834f690f`（工作樹實際 bytes）。
- 部署範圍：Pages 瀏覽器 JS 候選。

**原因**

展示工具的 Fisher-Yates 洗牌或頁面排序 seed，不用於認證或存取控制。 保留 Math.random，不為消除告警增加無必要的密碼學依賴。

**證據**

- relativeFile：client/src/pages/Home.tsx；line：222；purpose：展示工具的 Fisher-Yates 洗牌或頁面排序 seed，不用於認證或存取控制。

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 尚未使用同一版本重新執行 Fortify，不能宣稱掃描告警已消失。
- 本次逐筆檢查用途與資料流；未重新執行動畫／排序實體瀏覽器測試。

**部署鏈及範圍依據**

- client：client/src/main.tsx → client/src/App.tsx → client/src/pages/Home.tsx

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-163｜Critical｜非目前正式部署範圍｜server/routes.ts:752</summary>

- 原 PDF 頁：102；Issue Details 起始頁：101。
- 原類別：Insecure Transport。
- 原 sink：FunctionPointerCall: createServer。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`server/routes.ts`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`f509a7c01809cd9675087b565419930942796b55218641fb4298445477f7fcf3`（工作樹實際 bytes）。
- 部署範圍：Express 來源，未隨 Pages 產物部署。

**原因**

createServer(app) 是 Express HTTP 入口，確實不能直接拿來宣稱公開 HTTPS。現有 Pages 工作流僅上傳 dist/public，Express dist/index.js 不在 Pages 產物；Firebase Functions 為另一組雲端服務。若另將 Express 對外部署，仍須取得 TLS 終止、反向代理與實際入口證據。

**證據**

- server/routes.ts: createServer
- server/index.ts: server.listen
- package.json: server 編譯到 dist/index.js
- .github/workflows/deploy-pages.yml: upload ./dist/public
- fortify-deployment-scope.json

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 同版本 Fortify 複掃
- 原掃描平台逐筆人工審查與回填
- 任何其他 Express 正式部署的 HTTPS/反向代理與入口核對；未確認前不結案

**部署鏈及範圍依據**

- express：server/index.ts → server/routes.ts
- kind：express-build-excluded-from-pages；evidenceRefs：expressCompile；expressDev；expressStart；pagesUpload

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-164｜Low｜誤判候選待審查｜functions/src/index.ts:24</summary>

- 原 PDF 頁：104；Issue Details 起始頁：103。
- 原類別：Password Management: Password in Comment。
- 原 sink：Comment。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`functions/src/index.ts`；現行行號：24。
- 當下來源 SHA-256：`462f3448fef3a6e2d262c5ad54d705e6d075627f6a13e971b87574d81758b6f6`（工作樹實際 bytes）。
- 部署範圍：Firebase Functions 入口候選。

**原因**

核對這 4 處註解為 Secret 識別名稱、設定指令或佔位說明，沒有把實際密碼／金鑰值寫入這些註解；保留維運說明，不為告警關鍵字刪掉必要文件。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 functions/src/index.ts；sink 已變更或無法自動定位
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口
- functions/src/index.ts、embedQuery.ts、lineTalkWebhook.ts：註解與 defineSecret 的用途核對，未讀取 Secret 值

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- Fortify 逐筆人工確認誤判與回填結案
- 此局部判定不代替整個 repo／歷史的秘密掃描

**部署鏈及範圍依據**

- functions：functions/src/index.ts

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-165｜Low｜誤判候選待審查｜functions/src/embedQuery.ts:1</summary>

- 原 PDF 頁：104；Issue Details 起始頁：104。
- 原類別：Password Management: Password in Comment。
- 原 sink：Comment。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`functions/src/embedQuery.ts`；現行行號：10。
- 當下來源 SHA-256：`f53a8ee91686ac5e4a688ae67553e0136c5898b4636d78285735f23ba9b13783`（工作樹實際 bytes）。
- 部署範圍：Firebase Functions 入口候選。

**原因**

核對這 4 處註解為 Secret 識別名稱、設定指令或佔位說明，沒有把實際密碼／金鑰值寫入這些註解；保留維運說明，不為告警關鍵字刪掉必要文件。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 functions/src/embedQuery.ts；sink 已變更或無法自動定位
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口
- functions/src/index.ts、embedQuery.ts、lineTalkWebhook.ts：註解與 defineSecret 的用途核對，未讀取 Secret 值

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- Fortify 逐筆人工確認誤判與回填結案
- 此局部判定不代替整個 repo／歷史的秘密掃描

**部署鏈及範圍依據**

- functions：functions/src/index.ts → functions/src/embedQuery.ts

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-166｜Low｜誤判候選待審查｜functions/src/lineTalkWebhook.ts:1</summary>

- 原 PDF 頁：104；Issue Details 起始頁：104。
- 原類別：Password Management: Password in Comment。
- 原 sink：Comment。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`functions/src/lineTalkWebhook.ts`；現行行號：10。
- 當下來源 SHA-256：`599d0fb4e42a5db9dbea3507572c234ec6a1fc973d8e44598030c02d9c899010`（工作樹實際 bytes）。
- 部署範圍：Firebase Functions 入口候選。

**原因**

核對這 4 處註解為 Secret 識別名稱、設定指令或佔位說明，沒有把實際密碼／金鑰值寫入這些註解；保留維運說明，不為告警關鍵字刪掉必要文件。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 functions/src/lineTalkWebhook.ts；sink 已變更或無法自動定位
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口
- functions/src/index.ts、embedQuery.ts、lineTalkWebhook.ts：註解與 defineSecret 的用途核對，未讀取 Secret 值

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- Fortify 逐筆人工確認誤判與回填結案
- 此局部判定不代替整個 repo／歷史的秘密掃描

**部署鏈及範圍依據**

- functions：functions/src/index.ts → functions/src/lineTalkWebhook.ts

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-167｜Low｜誤判候選待審查｜functions/src/index.ts:12</summary>

- 原 PDF 頁：105；Issue Details 起始頁：105。
- 原類別：Password Management: Password in Comment。
- 原 sink：Comment。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`functions/src/index.ts`；現行行號：12。
- 當下來源 SHA-256：`462f3448fef3a6e2d262c5ad54d705e6d075627f6a13e971b87574d81758b6f6`（工作樹實際 bytes）。
- 部署範圍：Firebase Functions 入口候選。

**原因**

核對這 4 處註解為 Secret 識別名稱、設定指令或佔位說明，沒有把實際密碼／金鑰值寫入這些註解；保留維運說明，不為告警關鍵字刪掉必要文件。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 functions/src/index.ts；sink 已變更或無法自動定位
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口
- functions/src/index.ts、embedQuery.ts、lineTalkWebhook.ts：註解與 defineSecret 的用途核對，未讀取 Secret 值

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- Fortify 逐筆人工確認誤判與回填結案
- 此局部判定不代替整個 repo／歷史的秘密掃描

**部署鏈及範圍依據**

- functions：functions/src/index.ts

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-168｜High｜已加固待複掃｜scripts/lighthouse-quality.mjs:29</summary>

- 原 PDF 頁：108；Issue Details 起始頁：107。
- 原類別：Path Manipulation。
- 原 sink：fs.appendFileSync()。
- 原資料流來源：relativeFile：scripts/lighthouse-quality.mjs；line：29；pdfPage：107。
- 當下來源：`scripts/lighthouse-quality.mjs`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`bf7fb0e3d5d468b44597f30666588498f20695bd1382798dc988b2c3b33b2215`（工作樹實際 bytes）。
- 部署範圍：CI 品質／驗證程序。

**原因**

GITHUB_STEP_SUMMARY 的環境路徑確實控制 appendFile 寫入位置。現只接受 GitHub Runner 的 RUNNER_TEMP/_runner_file_commands/step_summary_* 既有一般檔案，驗證父目錄與目標 realpath 界限，合法 repo 外摘要不受阻。

**證據**

- relativeFile：scripts/lighthouse-quality.mjs；line：30；purpose：使用受限 Runner 摘要寫入 helper。
- relativeFile：scripts/lib/path-safety.mjs；line：27；purpose：限定 Runner 命令目錄與 leaf 名稱。
- relativeFile：scripts/lib/path-safety.mjs；line：34；purpose：拒絕命令父目錄 symlink/junction 越界。

**測試／既有階段記錄**

- command：node --test scripts/lib/path-safety.test.mjs scripts/lib/build-fortify-safety.test.mjs scripts/lighthouse-quality.test.mjs；result：passed；scope：11個原生Node案例，含真實 Windows junction、同前綴兄弟目錄、合法 Runner 路徑、越界拒寫、字型格式與隔離目錄實際注入。

**仍待驗證**

- 尚未使用同一版本重新執行 Fortify，不能宣稱掃描告警已消失。
- 實際 GitHub-hosted Runner 摘要寫入尚未執行，已以同樣結構的 repo 外暫存路徑測試。

**部署鏈及範圍依據**

- ci：scripts/lighthouse-quality.mjs
- CI：.github/workflows/lighthouse.yml／Test quality gate／直接呼叫；scripts/lighthouse-quality.test.mjs → scripts/lighthouse-quality.mjs
- CI：.github/workflows/lighthouse.yml／Enforce quality thresholds／直接呼叫；scripts/lighthouse-quality.mjs
- kind：test-import-references；references：from：scripts/lighthouse-quality.test.mjs；to：scripts/lighthouse-quality.mjs；line：4；kind：static-import；isTest：True；note：這是測試中的引用；是否以 mock 替代要另審，不能當公開部署證據。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-169｜High｜已加固待複掃｜scripts/inject-cockpit-stage-beacons.mjs:75</summary>

- 原 PDF 頁：108；Issue Details 起始頁：108。
- 原類別：Path Manipulation。
- 原 sink：fs.readFileSync()。
- 原資料流來源：relativeFile：scripts/inject-cockpit-stage-beacons.mjs；line：23；pdfPage：108。
- 當下來源：`scripts/inject-cockpit-stage-beacons.mjs`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`d6983b0d93fdb1ce44f3b025b537ebabb071fabc90b952c11183a263e0c97300`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

COCKPIT_DIR 環境值、子目錄及 index.html 決定批次讀寫位置。現 canonical root 不可為磁碟根目錄，index 的 realpath 必須留在指定根目錄，且 stageId 限字母數字 dash/underscore 1–32，亦避免目錄名稱跳出插入的 JavaScript 字串。

**證據**

- relativeFile：scripts/inject-cockpit-stage-beacons.mjs；line：24；purpose：明確選定專案根目錄並拒絕磁碟根目錄。
- relativeFile：scripts/inject-cockpit-stage-beacons.mjs；line：72；purpose：stageId 命名白名單。
- relativeFile：scripts/inject-cockpit-stage-beacons.mjs；line：81；purpose：寫入前取得且驗證實際 index 路徑。

**測試／既有階段記錄**

- command：node --test scripts/lib/path-safety.test.mjs scripts/lib/build-fortify-safety.test.mjs scripts/lighthouse-quality.test.mjs；result：passed；scope：11個原生Node案例，含真實 Windows junction、同前綴兄弟目錄、合法 Runner 路徑、越界拒寫、字型格式與隔離目錄實際注入。

**仍待驗證**

- 尚未使用同一版本重新執行 Fortify，不能宣稱掃描告警已消失。
- 未執行真實 外部駕駛艙專案（工作站絕對路徑已省略） 批次注入；實際現有 stage 目錄名稱只讀盤點均符合白名單。

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：5；topLevelVariableStatements：6；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-170｜High｜已加固待複掃｜scripts/inject-cockpit-stage-beacons.mjs:63</summary>

- 原 PDF 頁：109；Issue Details 起始頁：109。
- 原類別：Path Manipulation。
- 原 sink：fs.readdirSync()。
- 原資料流來源：relativeFile：scripts/inject-cockpit-stage-beacons.mjs；line：23；pdfPage：109。
- 當下來源：`scripts/inject-cockpit-stage-beacons.mjs`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`d6983b0d93fdb1ce44f3b025b537ebabb071fabc90b952c11183a263e0c97300`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

COCKPIT_DIR 環境值、子目錄及 index.html 決定批次讀寫位置。現 canonical root 不可為磁碟根目錄，index 的 realpath 必須留在指定根目錄，且 stageId 限字母數字 dash/underscore 1–32，亦避免目錄名稱跳出插入的 JavaScript 字串。

**證據**

- relativeFile：scripts/inject-cockpit-stage-beacons.mjs；line：24；purpose：明確選定專案根目錄並拒絕磁碟根目錄。
- relativeFile：scripts/inject-cockpit-stage-beacons.mjs；line：72；purpose：stageId 命名白名單。
- relativeFile：scripts/inject-cockpit-stage-beacons.mjs；line：81；purpose：寫入前取得且驗證實際 index 路徑。

**測試／既有階段記錄**

- command：node --test scripts/lib/path-safety.test.mjs scripts/lib/build-fortify-safety.test.mjs scripts/lighthouse-quality.test.mjs；result：passed；scope：11個原生Node案例，含真實 Windows junction、同前綴兄弟目錄、合法 Runner 路徑、越界拒寫、字型格式與隔離目錄實際注入。

**仍待驗證**

- 尚未使用同一版本重新執行 Fortify，不能宣稱掃描告警已消失。
- 未執行真實 外部駕駛艙專案（工作站絕對路徑已省略） 批次注入；實際現有 stage 目錄名稱只讀盤點均符合白名單。

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：5；topLevelVariableStatements：6；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-171｜High｜已加固待複掃｜scripts/inject-cockpit-stage-beacons.mjs:85</summary>

- 原 PDF 頁：110；Issue Details 起始頁：109。
- 原類別：Path Manipulation。
- 原 sink：fs.writeFileSync()。
- 原資料流來源：relativeFile：scripts/inject-cockpit-stage-beacons.mjs；line：23；pdfPage：110。
- 當下來源：`scripts/inject-cockpit-stage-beacons.mjs`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`d6983b0d93fdb1ce44f3b025b537ebabb071fabc90b952c11183a263e0c97300`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

COCKPIT_DIR 環境值、子目錄及 index.html 決定批次讀寫位置。現 canonical root 不可為磁碟根目錄，index 的 realpath 必須留在指定根目錄，且 stageId 限字母數字 dash/underscore 1–32，亦避免目錄名稱跳出插入的 JavaScript 字串。

**證據**

- relativeFile：scripts/inject-cockpit-stage-beacons.mjs；line：24；purpose：明確選定專案根目錄並拒絕磁碟根目錄。
- relativeFile：scripts/inject-cockpit-stage-beacons.mjs；line：72；purpose：stageId 命名白名單。
- relativeFile：scripts/inject-cockpit-stage-beacons.mjs；line：81；purpose：寫入前取得且驗證實際 index 路徑。

**測試／既有階段記錄**

- command：node --test scripts/lib/path-safety.test.mjs scripts/lib/build-fortify-safety.test.mjs scripts/lighthouse-quality.test.mjs；result：passed；scope：11個原生Node案例，含真實 Windows junction、同前綴兄弟目錄、合法 Runner 路徑、越界拒寫、字型格式與隔離目錄實際注入。

**仍待驗證**

- 尚未使用同一版本重新執行 Fortify，不能宣稱掃描告警已消失。
- 未執行真實 外部駕駛艙專案（工作站絕對路徑已省略） 批次注入；實際現有 stage 目錄名稱只讀盤點均符合白名單。

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：5；topLevelVariableStatements：6；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-172｜High｜已加固待複掃｜scripts/subset-web-font.mjs:39</summary>

- 原 PDF 頁：111；Issue Details 起始頁：110。
- 原類別：Path Manipulation。
- 原 sink：fs.existsSync()。
- 原資料流來源：relativeFile：scripts/subset-web-font.mjs；line：30；pdfPage：110。
- 當下來源：`scripts/subset-web-font.mjs`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`52dbb301a66e10c0863dcd7c4a5c60555af5d45b6891b644922fcddf2383f350`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

FONT_SRC 是明確允許維護者指定的字型來源，不應硬限制在 repo 內。現只讀一般 TTF/OTF、有效檔案大小與字型二進位標頭；原碼掃描不跟隨來源 symlink，所有收集檔案的 realpath 留在 repo，避免其他任意秘密檔或循環被讀入。

**證據**

- relativeFile：scripts/subset-web-font.mjs；line：31；purpose：字型讀入前解析實際路徑與檔型。
- relativeFile：scripts/subset-web-font.mjs；line：49；purpose：遞迴掃描不追蹤 symlink。
- relativeFile：scripts/subset-web-font.mjs；line：64；purpose：文字來源收集限定實際 repo 根目錄。

**測試／既有階段記錄**

- command：node --test scripts/lib/path-safety.test.mjs scripts/lib/build-fortify-safety.test.mjs scripts/lighthouse-quality.test.mjs；result：passed；scope：11個原生Node案例，含真實 Windows junction、同前綴兄弟目錄、合法 Runner 路徑、越界拒寫、字型格式與隔離目錄實際注入。

**仍待驗證**

- 尚未使用同一版本重新執行 Fortify，不能宣稱掃描告警已消失。
- 未執行字型子集重建；字型標頭與大小檢查只驗證輸入格式，實際字型解碼仍由既有 harfbuzz/subset-font 執行。

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：package-cli-reference；references：file：package.json；jsonPointer：/scripts/subset-web-font
- kind：source-entry-shape；shape：topLevelExpressionStatements：4；topLevelVariableStatements：24；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-173｜High｜已加固待複掃｜scripts/wait-for-deployed-version.mjs:41</summary>

- 原 PDF 頁：111；Issue Details 起始頁：111。
- 原類別：Path Manipulation。
- 原 sink：fs.appendFileSync()。
- 原資料流來源：relativeFile：scripts/wait-for-deployed-version.mjs；line：41；pdfPage：111。
- 當下來源：`scripts/wait-for-deployed-version.mjs`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`5a3d617f2efd0613d4c1bd6f7411a550738bc7528a732c8b6762a5013f03092b`（工作樹實際 bytes）。
- 部署範圍：CI 品質／驗證程序。

**原因**

GITHUB_STEP_SUMMARY 的環境路徑確實控制 appendFile 寫入位置。現只接受 GitHub Runner 的 RUNNER_TEMP/_runner_file_commands/step_summary_* 既有一般檔案，驗證父目錄與目標 realpath 界限，合法 repo 外摘要不受阻。

**證據**

- relativeFile：scripts/wait-for-deployed-version.mjs；line：41；purpose：使用受限 Runner 摘要寫入 helper。
- relativeFile：scripts/lib/path-safety.mjs；line：27；purpose：限定 Runner 命令目錄與 leaf 名稱。
- relativeFile：scripts/lib/path-safety.mjs；line：34；purpose：拒絕命令父目錄 symlink/junction 越界。

**測試／既有階段記錄**

- command：node --test scripts/lib/path-safety.test.mjs scripts/lib/build-fortify-safety.test.mjs scripts/lighthouse-quality.test.mjs；result：passed；scope：11個原生Node案例，含真實 Windows junction、同前綴兄弟目錄、合法 Runner 路徑、越界拒寫、字型格式與隔離目錄實際注入。

**仍待驗證**

- 尚未使用同一版本重新執行 Fortify，不能宣稱掃描告警已消失。
- 實際 GitHub-hosted Runner 摘要寫入尚未執行，已以同樣結構的 repo 外暫存路徑測試。

**部署鏈及範圍依據**

- ci：scripts/wait-for-deployed-version.mjs
- CI：.github/workflows/lighthouse.yml／Test quality gate／直接呼叫；scripts/lighthouse-quality.test.mjs → scripts/wait-for-deployed-version.mjs
- CI：.github/workflows/lighthouse.yml／Verify deployed version／直接呼叫；scripts/wait-for-deployed-version.mjs
- CI：.github/workflows/lighthouse.yml／Verify version remained unchanged during audit／直接呼叫 --once；scripts/wait-for-deployed-version.mjs
- kind：test-import-references；references：from：scripts/lighthouse-quality.test.mjs；to：scripts/wait-for-deployed-version.mjs；line：3；kind：static-import；isTest：True；note：這是測試中的引用；是否以 mock 替代要另審，不能當公開部署證據。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-174｜High｜已加固待複掃｜scripts/subset-web-font.mjs:78</summary>

- 原 PDF 頁：112；Issue Details 起始頁：112。
- 原類別：Path Manipulation。
- 原 sink：fs.readFileSync()。
- 原資料流來源：relativeFile：scripts/subset-web-font.mjs；line：30；pdfPage：112。
- 當下來源：`scripts/subset-web-font.mjs`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`52dbb301a66e10c0863dcd7c4a5c60555af5d45b6891b644922fcddf2383f350`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

FONT_SRC 是明確允許維護者指定的字型來源，不應硬限制在 repo 內。現只讀一般 TTF/OTF、有效檔案大小與字型二進位標頭；原碼掃描不跟隨來源 symlink，所有收集檔案的 realpath 留在 repo，避免其他任意秘密檔或循環被讀入。

**證據**

- relativeFile：scripts/subset-web-font.mjs；line：31；purpose：字型讀入前解析實際路徑與檔型。
- relativeFile：scripts/subset-web-font.mjs；line：49；purpose：遞迴掃描不追蹤 symlink。
- relativeFile：scripts/subset-web-font.mjs；line：64；purpose：文字來源收集限定實際 repo 根目錄。

**測試／既有階段記錄**

- command：node --test scripts/lib/path-safety.test.mjs scripts/lib/build-fortify-safety.test.mjs scripts/lighthouse-quality.test.mjs；result：passed；scope：11個原生Node案例，含真實 Windows junction、同前綴兄弟目錄、合法 Runner 路徑、越界拒寫、字型格式與隔離目錄實際注入。

**仍待驗證**

- 尚未使用同一版本重新執行 Fortify，不能宣稱掃描告警已消失。
- 未執行字型子集重建；字型標頭與大小檢查只驗證輸入格式，實際字型解碼仍由既有 harfbuzz/subset-font 執行。

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：package-cli-reference；references：file：package.json；jsonPointer：/scripts/subset-web-font
- kind：source-entry-shape；shape：topLevelExpressionStatements：4；topLevelVariableStatements：24；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-175｜High｜已加固待複掃｜scripts/inject-cockpit-stage-beacons.mjs:71</summary>

- 原 PDF 頁：113；Issue Details 起始頁：112。
- 原類別：Path Manipulation。
- 原 sink：fs.existsSync()。
- 原資料流來源：relativeFile：scripts/inject-cockpit-stage-beacons.mjs；line：23；pdfPage：113。
- 當下來源：`scripts/inject-cockpit-stage-beacons.mjs`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`d6983b0d93fdb1ce44f3b025b537ebabb071fabc90b952c11183a263e0c97300`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

COCKPIT_DIR 環境值、子目錄及 index.html 決定批次讀寫位置。現 canonical root 不可為磁碟根目錄，index 的 realpath 必須留在指定根目錄，且 stageId 限字母數字 dash/underscore 1–32，亦避免目錄名稱跳出插入的 JavaScript 字串。

**證據**

- relativeFile：scripts/inject-cockpit-stage-beacons.mjs；line：24；purpose：明確選定專案根目錄並拒絕磁碟根目錄。
- relativeFile：scripts/inject-cockpit-stage-beacons.mjs；line：72；purpose：stageId 命名白名單。
- relativeFile：scripts/inject-cockpit-stage-beacons.mjs；line：81；purpose：寫入前取得且驗證實際 index 路徑。

**測試／既有階段記錄**

- command：node --test scripts/lib/path-safety.test.mjs scripts/lib/build-fortify-safety.test.mjs scripts/lighthouse-quality.test.mjs；result：passed；scope：11個原生Node案例，含真實 Windows junction、同前綴兄弟目錄、合法 Runner 路徑、越界拒寫、字型格式與隔離目錄實際注入。

**仍待驗證**

- 尚未使用同一版本重新執行 Fortify，不能宣稱掃描告警已消失。
- 未執行真實 外部駕駛艙專案（工作站絕對路徑已省略） 批次注入；實際現有 stage 目錄名稱只讀盤點均符合白名單。

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：5；topLevelVariableStatements：6；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-176｜Low｜誤判候選待審查｜scripts/generate-tool-embeddings.mjs:111</summary>

- 原 PDF 頁：115；Issue Details 起始頁：115。
- 原類別：Poor Logging Practice: Use of a System Output Stream。
- 原 sink：FunctionPointerCall: write。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-tool-embeddings.mjs`；現行行號：111。
- 當下來源 SHA-256：`840fd6419bccf9f1221a8099b5bbb199949cc54ef524ecb6d0be5bd681881305`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

維護工具的進度／失敗訊息或後端受限日誌，尚未找到此筆資料直接回傳公開頁面的路徑。保留診斷，不把 stdout／console 本身當秘密外洩；此判定不保證任何歷史日誌都無敏感資訊。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-tool-embeddings.mjs:111
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口
- generate-tool-embeddings.mjs stdout 為工具 ID／截斷公開目錄標題與進度，不輸出金鑰或完整向量

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另有 Express／CLI 分享日誌，需確認日誌權限與內容清洗
- Fortify 複掃與原平台人工分類
- 尚未逐筆做動態攻擊重現

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：1；topLevelVariableStatements：7；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-177｜High｜非目前正式部署範圍｜e2e/telemetry-startup.spec.ts:15</summary>

- 原 PDF 頁：117；Issue Details 起始頁：117。
- 原類別：Race Condition。
- 原 sink：FunctionPointerCall: on。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`e2e/telemetry-startup.spec.ts`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`b7f6090f54ae7340bf43501d201a5274cec7fb4edda0ac480adaa911394290bb`（工作樹實際 bytes）。
- 部署範圍：CI 端對端測試。

**原因**

page.on(request) 同步 callback 只增加同一 JavaScript event loop 內的局部觀測計數；沒有共享檔案、權限檢查後檔案使用或正式資料寫入競速。這筆不符合可利用的安全 TOCTOU。

**證據**

- relativeFile：e2e/telemetry-startup.spec.ts；line：15；purpose：request listener 的函式本體同步增加 analyticsCalls/captchaScripts，不使用 await 或共享檔案。

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 尚未使用同一版本重新執行 Fortify，不能宣稱掃描告警已消失。
- 未因這筆告警重新執行實際瀏覽器/正式站測試；測試等待條件的穩定性應與安全 TOCTOU 分開評估。

**部署鏈及範圍依據**

- kind：configured-playwright-spec；evidenceRefs：e2e

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-178｜Low｜已加固待複掃｜client/src/components/OptimizedIcons.tsx:124</summary>

- 原 PDF 頁：119；Issue Details 起始頁：119。
- 原類別：React Bad Practices: Dangerously Set InnerHTML。
- 原 sink：FieldAccess: dangerouslySetInnerHTML。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`client/src/components/OptimizedIcons.tsx`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`be86723f98f793b5bb9b0b10059d6d35e3bd8d1ac54c3ae4b91f48eb8da3368d`（工作樹實際 bytes）。
- 部署範圍：Pages 瀏覽器 JS 候選。

**原因**

固定圖示已改 React 元素，沒有把來源字串當原始 HTML。

**證據**

- client/src/components/OptimizedIcons.tsx
- client/src/components/__tests__/security-html-sinks.test.tsx
- client/src/lib/jsonLdSafety.ts

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 同版本 Fortify 複掃
- 原掃描平台逐筆人工審查與回填

**部署鏈及範圍依據**

- client：client/src/main.tsx → client/src/App.tsx → client/src/pages/Home.tsx → client/src/components/OptimizedIcons.tsx
- kind：test-import-references；references：from：client/src/components/__tests__/security-html-sinks.test.tsx；to：client/src/components/OptimizedIcons.tsx；line：4；kind：static-import；isTest：True；note：這是測試中的引用；是否以 mock 替代要另審，不能當公開部署證據。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-179｜Low｜已加固待複掃｜client/src/components/ui/chart.tsx:79</summary>

- 原 PDF 頁：119；Issue Details 起始頁：119。
- 原類別：React Bad Practices: Dangerously Set InnerHTML。
- 原 sink：FieldAccess: dangerouslySetInnerHTML。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`client/src/components/ui/chart.tsx`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`a2e7a62dbfeb69588a3ca53357b6bea7cb93bfe92eaa601a7f5968cc2df8cd4c`（工作樹實際 bytes）。
- 部署範圍：未進當前 Pages 入口匯入圖的 client 來源。

**原因**

圖表 CSS 輸出限制識別字與色彩語法，拒絕 selector/style 關閉與外部 URL。

**證據**

- client/src/components/ui/chart.tsx
- client/src/components/__tests__/security-html-sinks.test.tsx
- client/src/lib/jsonLdSafety.ts

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 同版本 Fortify 複掃
- 原掃描平台逐筆人工審查與回填

**部署鏈及範圍依據**

- kind：test-import-references；references：from：client/src/components/__tests__/security-html-sinks.test.tsx；to：client/src/components/ui/chart.tsx；line：5；kind：static-import；isTest：True；note：這是測試中的引用；是否以 mock 替代要另審，不能當公開部署證據。
- kind：client-import-graph-negative；entry：client/src/main.tsx；graph：fortify-client-import-metafile.json；staticImportReferences：from：client/src/components/__tests__/security-html-sinks.test.tsx；to：client/src/components/ui/chart.tsx；line：5；kind：static-import；isTest：True；note：限定本次檢查入口，並非原弱點不存在或永久不能使用。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-180｜Low｜已加固待複掃｜client/src/pages/amp/Home.tsx:77</summary>

- 原 PDF 頁：120；Issue Details 起始頁：119。
- 原類別：React Bad Practices: Dangerously Set InnerHTML。
- 原 sink：FieldAccess: dangerouslySetInnerHTML。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`client/src/pages/amp/Home.tsx`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`5dfee71287a66d630ce6d318f9e7d09900c98b0e494ed293e5b632ea74051996`（工作樹實際 bytes）。
- 部署範圍：Express 來源，未隨 Pages 產物部署。

**原因**

JSON-LD 保留 JSON 格式並跳脫可提前關閉 script 的字元，使用純資料語境。

**證據**

- client/src/pages/amp/Home.tsx
- client/src/components/__tests__/security-html-sinks.test.tsx
- client/src/lib/jsonLdSafety.ts

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 同版本 Fortify 複掃
- 原掃描平台逐筆人工審查與回填

**部署鏈及範圍依據**

- express：server/index.ts → server/routes.ts → server/amp.ts → client/src/pages/amp/Home.tsx
- kind：express-build-excluded-from-pages；evidenceRefs：expressCompile；expressDev；expressStart；pagesUpload
- kind：test-import-references；references：from：client/src/components/__tests__/security-html-sinks.test.tsx；to：client/src/pages/amp/Home.tsx；line：6；kind：static-import；isTest：True；note：這是測試中的引用；是否以 mock 替代要另審，不能當公開部署證據。
- kind：client-import-graph-negative；entry：client/src/main.tsx；graph：fortify-client-import-metafile.json；staticImportReferences：from：client/src/components/__tests__/security-html-sinks.test.tsx；to：client/src/pages/amp/Home.tsx；line：6；kind：static-import；isTest：True；from：server/amp.ts；to：client/src/pages/amp/Home.tsx；line：5；kind：static-import；isTest：False；note：限定本次檢查入口，並非原弱點不存在或永久不能使用。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-181｜Low｜誤判候選待審查｜server/logger.ts:55</summary>

- 原 PDF 頁：122；Issue Details 起始頁：122。
- 原類別：System Information Leak。
- 原 sink：fs.appendFileSync()。
- 原資料流來源：relativeFile：server/logger.ts；line：43；pdfPage：122。
- 當下來源：`server/logger.ts`；現行行號：53。
- 當下來源 SHA-256：`e3ef68ee61234e875b29270d33270065643dcd39b71a4d979a1f2dd5deb53607`（工作樹實際 bytes）。
- 部署範圍：Express 來源，未隨 Pages 產物部署。

**原因**

來源包含 NODE_ENV、是否有 REPL_ID 的布林、SQLite／cache 路徑，sink 為 server 日誌檔或內部 console；沒有把 Secret 值列入這幾處。Pages 不發布此伺服器或 logs 目錄。內部路徑與環境資訊須按真正的日誌存取權限複核，不能把內部維運內容一律刪掉。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 server/logger.ts:53
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另有 Express／CLI 分享日誌，需確認日誌權限與內容清洗
- Fortify 複掃與原平台人工分類
- 尚未逐筆做動態攻擊重現

**部署鏈及範圍依據**

- express：server/index.ts → db/index.ts → server/logger.ts
- kind：express-build-excluded-from-pages；evidenceRefs：expressCompile；expressDev；expressStart；pagesUpload

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-182｜Low｜誤判候選待審查｜server/logger.ts:55</summary>

- 原 PDF 頁：123；Issue Details 起始頁：122。
- 原類別：System Information Leak。
- 原 sink：fs.appendFileSync()。
- 原資料流來源：relativeFile：server/logger.ts；line：44；pdfPage：123。
- 當下來源：`server/logger.ts`；現行行號：53。
- 當下來源 SHA-256：`e3ef68ee61234e875b29270d33270065643dcd39b71a4d979a1f2dd5deb53607`（工作樹實際 bytes）。
- 部署範圍：Express 來源，未隨 Pages 產物部署。

**原因**

來源包含 NODE_ENV、是否有 REPL_ID 的布林、SQLite／cache 路徑，sink 為 server 日誌檔或內部 console；沒有把 Secret 值列入這幾處。Pages 不發布此伺服器或 logs 目錄。內部路徑與環境資訊須按真正的日誌存取權限複核，不能把內部維運內容一律刪掉。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 server/logger.ts:53
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另有 Express／CLI 分享日誌，需確認日誌權限與內容清洗
- Fortify 複掃與原平台人工分類
- 尚未逐筆做動態攻擊重現

**部署鏈及範圍依據**

- express：server/index.ts → db/index.ts → server/logger.ts
- kind：express-build-excluded-from-pages；evidenceRefs：expressCompile；expressDev；expressStart；pagesUpload

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-183｜Low｜誤判候選待審查｜server/logger.ts:55</summary>

- 原 PDF 頁：124；Issue Details 起始頁：123。
- 原類別：System Information Leak。
- 原 sink：fs.appendFileSync()。
- 原資料流來源：relativeFile：server/logger.ts；line：4；pdfPage：123。
- 當下來源：`server/logger.ts`；現行行號：53。
- 當下來源 SHA-256：`e3ef68ee61234e875b29270d33270065643dcd39b71a4d979a1f2dd5deb53607`（工作樹實際 bytes）。
- 部署範圍：Express 來源，未隨 Pages 產物部署。

**原因**

來源包含 NODE_ENV、是否有 REPL_ID 的布林、SQLite／cache 路徑，sink 為 server 日誌檔或內部 console；沒有把 Secret 值列入這幾處。Pages 不發布此伺服器或 logs 目錄。內部路徑與環境資訊須按真正的日誌存取權限複核，不能把內部維運內容一律刪掉。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 server/logger.ts:53
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另有 Express／CLI 分享日誌，需確認日誌權限與內容清洗
- Fortify 複掃與原平台人工分類
- 尚未逐筆做動態攻擊重現

**部署鏈及範圍依據**

- express：server/index.ts → db/index.ts → server/logger.ts
- kind：express-build-excluded-from-pages；evidenceRefs：expressCompile；expressDev；expressStart；pagesUpload

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-184｜Low｜誤判候選待審查｜server/logger.ts:24</summary>

- 原 PDF 頁：124；Issue Details 起始頁：124。
- 原類別：System Information Leak。
- 原 sink：fs.appendFileSync()。
- 原資料流來源：relativeFile：db/index.ts；line：29；pdfPage：124。
- 當下來源：`server/logger.ts`；現行行號：24。
- 當下來源 SHA-256：`e3ef68ee61234e875b29270d33270065643dcd39b71a4d979a1f2dd5deb53607`（工作樹實際 bytes）。
- 部署範圍：Express 來源，未隨 Pages 產物部署。

**原因**

來源包含 NODE_ENV、是否有 REPL_ID 的布林、SQLite／cache 路徑，sink 為 server 日誌檔或內部 console；沒有把 Secret 值列入這幾處。Pages 不發布此伺服器或 logs 目錄。內部路徑與環境資訊須按真正的日誌存取權限複核，不能把內部維運內容一律刪掉。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 server/logger.ts:24
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另有 Express／CLI 分享日誌，需確認日誌權限與內容清洗
- Fortify 複掃與原平台人工分類
- 尚未逐筆做動態攻擊重現

**部署鏈及範圍依據**

- express：server/index.ts → db/index.ts → server/logger.ts
- kind：express-build-excluded-from-pages；evidenceRefs：expressCompile；expressDev；expressStart；pagesUpload

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-185｜Low｜誤判候選待審查｜server/logger.ts:24</summary>

- 原 PDF 頁：125；Issue Details 起始頁：125。
- 原類別：System Information Leak。
- 原 sink：fs.appendFileSync()。
- 原資料流來源：relativeFile：server/cache.ts；line：6；pdfPage：125。
- 當下來源：`server/logger.ts`；現行行號：24。
- 當下來源 SHA-256：`e3ef68ee61234e875b29270d33270065643dcd39b71a4d979a1f2dd5deb53607`（工作樹實際 bytes）。
- 部署範圍：Express 來源，未隨 Pages 產物部署。

**原因**

來源包含 NODE_ENV、是否有 REPL_ID 的布林、SQLite／cache 路徑，sink 為 server 日誌檔或內部 console；沒有把 Secret 值列入這幾處。Pages 不發布此伺服器或 logs 目錄。內部路徑與環境資訊須按真正的日誌存取權限複核，不能把內部維運內容一律刪掉。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 server/logger.ts:24
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另有 Express／CLI 分享日誌，需確認日誌權限與內容清洗
- Fortify 複掃與原平台人工分類
- 尚未逐筆做動態攻擊重現

**部署鏈及範圍依據**

- express：server/index.ts → db/index.ts → server/logger.ts
- kind：express-build-excluded-from-pages；evidenceRefs：expressCompile；expressDev；expressStart；pagesUpload

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-186｜Low｜誤判候選待審查｜server/logger.ts:24</summary>

- 原 PDF 頁：126；Issue Details 起始頁：125。
- 原類別：System Information Leak。
- 原 sink：fs.appendFileSync()。
- 原資料流來源：relativeFile：server/logger.ts；line：4；pdfPage：125。
- 當下來源：`server/logger.ts`；現行行號：24。
- 當下來源 SHA-256：`e3ef68ee61234e875b29270d33270065643dcd39b71a4d979a1f2dd5deb53607`（工作樹實際 bytes）。
- 部署範圍：Express 來源，未隨 Pages 產物部署。

**原因**

來源包含 NODE_ENV、是否有 REPL_ID 的布林、SQLite／cache 路徑，sink 為 server 日誌檔或內部 console；沒有把 Secret 值列入這幾處。Pages 不發布此伺服器或 logs 目錄。內部路徑與環境資訊須按真正的日誌存取權限複核，不能把內部維運內容一律刪掉。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 server/logger.ts:24
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另有 Express／CLI 分享日誌，需確認日誌權限與內容清洗
- Fortify 複掃與原平台人工分類
- 尚未逐筆做動態攻擊重現

**部署鏈及範圍依據**

- express：server/index.ts → db/index.ts → server/logger.ts
- kind：express-build-excluded-from-pages；evidenceRefs：expressCompile；expressDev；expressStart；pagesUpload

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-187｜Medium｜已加固待複掃｜client/src/components/AdminWebVitalsDashboard.tsx:156</summary>

- 原 PDF 頁：128；Issue Details 起始頁：128。
- 原類別：System Information Leak: External。
- 原 sink：Assignment to textContent。
- 原資料流來源：relativeFile：client/src/components/AdminWebVitalsDashboard.tsx；line：113；pdfPage：128。
- 當下來源：`client/src/components/AdminWebVitalsDashboard.tsx`；現行行號：115。
- 當下來源 SHA-256：`9f66ffea3de182dca2062c178c68260a10c347e9042fabe83139337e71304de9`（工作樹實際 bytes）。
- 部署範圍：Pages 瀏覽器 JS 候選。

**原因**

公開元件／安裝頁已顯示一般錯誤文案，不再把原始 error.message 插進畫面；這是第一階段源碼變更，仍須 Fortify 複掃對應原筆。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 client/src/components/AdminWebVitalsDashboard.tsx:115
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 第一階段已部署 3.6.147／第二階段 3.6.148 的源碼一般文案；未宣稱複掃結果

**仍待驗證**

- Fortify 複掃與逐筆結案

**部署鏈及範圍依據**

- client：client/src/main.tsx → client/src/App.tsx → client/src/components/AdminAuth.tsx → client/src/components/AdminWebVitalsDashboard.tsx

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-188｜Medium｜已加固待複掃｜client/public/install-service-worker.html:10</summary>

- 原 PDF 頁：129；Issue Details 起始頁：128。
- 原類別：System Information Leak: External。
- 原 sink：Assignment to textContent。
- 原資料流來源：relativeFile：client/public/install-service-worker.html；line：9；pdfPage：129。
- 當下來源：`client/public/install-service-worker.html`；現行行號：10。
- 當下來源 SHA-256：`6966cdad9351d463348ea4b14beb4b99f63984bb49cc07e82394f2f07272022b`（工作樹實際 bytes）。
- 部署範圍：Pages 公開複製資產。

**原因**

公開元件／安裝頁已顯示一般錯誤文案，不再把原始 error.message 插進畫面；這是第一階段源碼變更，仍須 Fortify 複掃對應原筆。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 client/public/install-service-worker.html:10
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 第一階段已部署 3.6.147／第二階段 3.6.148 的源碼一般文案；未宣稱複掃結果

**仍待驗證**

- Fortify 複掃與逐筆結案

**部署鏈及範圍依據**

- kind：vite-public-copy；evidenceRefs：viteRoot；viteDefaults；viteOutput；pagesUpload；publicArtifactRelativeFile：install-service-worker.html

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-189｜Medium｜已加固待複掃｜server/routes.ts:697</summary>

- 原 PDF 頁：130；Issue Details 起始頁：129。
- 原類別：System Information Leak: External。
- 原 sink：~JS_Generic.json()。
- 原資料流來源：relativeFile：server/routes.ts；line：684；pdfPage：129。
- 當下來源：`server/routes.ts`；現行行號：698。
- 當下來源 SHA-256：`f509a7c01809cd9675087b565419930942796b55218641fb4298445477f7fcf3`（工作樹實際 bytes）。
- 部署範圍：Express 來源，未隨 Pages 產物部署。

**原因**

原 health/system-info 錯誤與部分完整系統資訊可能對外回傳。本輪正式回應只保留受控健康狀態／一般錯誤訊息與 errorId，詳細原因保留在內部日誌；開發環境仍可診斷。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 server/routes.ts:698
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口
- server/public-diagnostics.ts：production 白名單投影，不包含 error/stack/driver/dbFile/memory/env

**測試／既有階段記錄**

- server/public-diagnostics.test.ts：3/3 通過，已納入安全節點測試設定

**仍待驗證**

- Fortify 複掃與逐筆結案
- 本輪新增 Express 保護測試通過，其他部署範圍仍需確認

**部署鏈及範圍依據**

- express：server/index.ts → server/routes.ts
- kind：express-build-excluded-from-pages；evidenceRefs：expressCompile；expressDev；expressStart；pagesUpload

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-190｜Low｜已加固待複掃｜server/index.ts:132</summary>

- 原 PDF 頁：131；Issue Details 起始頁：130。
- 原類別：System Information Leak: External。
- 原 sink：~JS_Generic.json()。
- 原資料流來源：relativeFile：server/index.ts；line：63；pdfPage：130。
- 當下來源：`server/index.ts`；現行行號：134。
- 當下來源 SHA-256：`f75d04fb7c2d95ec1a9d20db7056f15821c5c6d957d6c5f61ccb932eec4cd844`（工作樹實際 bytes）。
- 部署範圍：Express 來源，未隨 Pages 產物部署。

**原因**

原 health/system-info 錯誤與部分完整系統資訊可能對外回傳。本輪正式回應只保留受控健康狀態／一般錯誤訊息與 errorId，詳細原因保留在內部日誌；開發環境仍可診斷。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 server/index.ts:134
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口
- server/public-diagnostics.ts：production 白名單投影，不包含 error/stack/driver/dbFile/memory/env

**測試／既有階段記錄**

- server/public-diagnostics.test.ts：3/3 通過，已納入安全節點測試設定

**仍待驗證**

- Fortify 複掃與逐筆結案
- 本輪新增 Express 保護測試通過，其他部署範圍仍需確認
- 本輪新來源差異核對：reviewer：主線本輪差異與本機安全測試核對；scope：純文字摘要提及／連結語法保護；卡片 HTML 與 HTTPS 傳輸／通知時機保持原流程。；verification：15/15 本機安全節點案例通過；CI、正式通知與其他部署仍待確認

**部署鏈及範圍依據**

- express：server/index.ts
- kind：express-build-excluded-from-pages；evidenceRefs：expressCompile；expressDev；expressStart；pagesUpload

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-191｜Low｜已加固待複掃｜server/index.ts:132</summary>

- 原 PDF 頁：131；Issue Details 起始頁：131。
- 原類別：System Information Leak: External。
- 原 sink：~JS_Generic.json()。
- 原資料流來源：relativeFile：server/index.ts；line：64；pdfPage：131。
- 當下來源：`server/index.ts`；現行行號：134。
- 當下來源 SHA-256：`f75d04fb7c2d95ec1a9d20db7056f15821c5c6d957d6c5f61ccb932eec4cd844`（工作樹實際 bytes）。
- 部署範圍：Express 來源，未隨 Pages 產物部署。

**原因**

原 health/system-info 錯誤與部分完整系統資訊可能對外回傳。本輪正式回應只保留受控健康狀態／一般錯誤訊息與 errorId，詳細原因保留在內部日誌；開發環境仍可診斷。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 server/index.ts:134
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口
- server/public-diagnostics.ts：production 白名單投影，不包含 error/stack/driver/dbFile/memory/env

**測試／既有階段記錄**

- server/public-diagnostics.test.ts：3/3 通過，已納入安全節點測試設定

**仍待驗證**

- Fortify 複掃與逐筆結案
- 本輪新增 Express 保護測試通過，其他部署範圍仍需確認
- 本輪新來源差異核對：reviewer：主線本輪差異與本機安全測試核對；scope：純文字摘要提及／連結語法保護；卡片 HTML 與 HTTPS 傳輸／通知時機保持原流程。；verification：15/15 本機安全節點案例通過；CI、正式通知與其他部署仍待確認

**部署鏈及範圍依據**

- express：server/index.ts
- kind：express-build-excluded-from-pages；evidenceRefs：expressCompile；expressDev；expressStart；pagesUpload

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-192｜Low｜已加固待複掃｜server/index.ts:132</summary>

- 原 PDF 頁：132；Issue Details 起始頁：132。
- 原類別：System Information Leak: External。
- 原 sink：~JS_Generic.json()。
- 原資料流來源：relativeFile：server/index.ts；line：65；pdfPage：132。
- 當下來源：`server/index.ts`；現行行號：134。
- 當下來源 SHA-256：`f75d04fb7c2d95ec1a9d20db7056f15821c5c6d957d6c5f61ccb932eec4cd844`（工作樹實際 bytes）。
- 部署範圍：Express 來源，未隨 Pages 產物部署。

**原因**

原 health/system-info 錯誤與部分完整系統資訊可能對外回傳。本輪正式回應只保留受控健康狀態／一般錯誤訊息與 errorId，詳細原因保留在內部日誌；開發環境仍可診斷。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 server/index.ts:134
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口
- server/public-diagnostics.ts：production 白名單投影，不包含 error/stack/driver/dbFile/memory/env

**測試／既有階段記錄**

- server/public-diagnostics.test.ts：3/3 通過，已納入安全節點測試設定

**仍待驗證**

- Fortify 複掃與逐筆結案
- 本輪新增 Express 保護測試通過，其他部署範圍仍需確認
- 本輪新來源差異核對：reviewer：主線本輪差異與本機安全測試核對；scope：純文字摘要提及／連結語法保護；卡片 HTML 與 HTTPS 傳輸／通知時機保持原流程。；verification：15/15 本機安全節點案例通過；CI、正式通知與其他部署仍待確認

**部署鏈及範圍依據**

- express：server/index.ts
- kind：express-build-excluded-from-pages；evidenceRefs：expressCompile；expressDev；expressStart；pagesUpload

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-193｜Low｜已加固待複掃｜server/routes.ts:697</summary>

- 原 PDF 頁：133；Issue Details 起始頁：132。
- 原類別：System Information Leak: External。
- 原 sink：~JS_Generic.json()。
- 原資料流來源：relativeFile：server/routes.ts；line：688；pdfPage：132。
- 當下來源：`server/routes.ts`；現行行號：698。
- 當下來源 SHA-256：`f509a7c01809cd9675087b565419930942796b55218641fb4298445477f7fcf3`（工作樹實際 bytes）。
- 部署範圍：Express 來源，未隨 Pages 產物部署。

**原因**

原 health/system-info 錯誤與部分完整系統資訊可能對外回傳。本輪正式回應只保留受控健康狀態／一般錯誤訊息與 errorId，詳細原因保留在內部日誌；開發環境仍可診斷。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 server/routes.ts:698
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口
- server/public-diagnostics.ts：production 白名單投影，不包含 error/stack/driver/dbFile/memory/env

**測試／既有階段記錄**

- server/public-diagnostics.test.ts：3/3 通過，已納入安全節點測試設定

**仍待驗證**

- Fortify 複掃與逐筆結案
- 本輪新增 Express 保護測試通過，其他部署範圍仍需確認

**部署鏈及範圍依據**

- express：server/index.ts → server/routes.ts
- kind：express-build-excluded-from-pages；evidenceRefs：expressCompile；expressDev；expressStart；pagesUpload

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-194｜Low｜已加固待複掃｜client/src/components/ToolCard.tsx:210</summary>

- 原 PDF 頁：135；Issue Details 起始頁：135。
- 原類別：System Information Leak: Internal。
- 原 sink：~JS_Generic.error()。
- 原資料流來源：relativeFile：client/src/components/ToolCard.tsx；line：210；pdfPage：135。
- 當下來源：`client/src/components/ToolCard.tsx`；現行行號：211。
- 當下來源 SHA-256：`4664a8ef95972919bc1a06bcb7c9ae56ae95917a63ea0f80ef04d4fd8eb7c45e`（工作樹實際 bytes）。
- 部署範圍：Pages 瀏覽器 JS 候選。

**原因**

單純 console 位置不足以證明漏洞。保留操作上下文、name/code/message 與原始來源堆疊；只有可辨識的 URL 查詢、帳密、金鑰、權杖或電子郵件清洗，不取消事件、追蹤或既有 Sentry 管道。普通無敏感 Error 保持原物件，使 functions/internal 與網路雜訊篩選仍正常。SW 保留清洗後 message/stack 與資產檔名。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 client/src/components/ToolCard.tsx:211
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口
- client/src/lib/safeDiagnostic.ts：保留原 Error／清洗後 Error 對接原 console→Sentry
- client/src/lib/sentry.ts：原 captureConsoleIntegration 與噪音辨識未改
- client/public/sw.js：不打印 query，保留操作／資產／清洗堆疊

**測試／既有階段記錄**

- safeDiagnostic.test.ts 4/4 通過：原物件、name/code、清洗 callsite、額外認證物件不外送
- node --check client/public/sw.js 通過

**仍待驗證**

- 本輪 CI、Pages 發布及實際資產比對
- Sentry 真實事件與實體裝置未驗證；本輪未修改帳號或事件
- Fortify 複掃；不宣稱所有瀏覽器訊息已完整去識別化

**部署鏈及範圍依據**

- client：client/src/main.tsx → client/src/App.tsx → client/src/pages/Home.tsx → client/src/components/ToolCard.tsx
- kind：test-import-references；references：from：client/src/components/__tests__/ToolCard.test.tsx；to：client/src/components/ToolCard.tsx；line：8；kind：static-import；isTest：True；note：這是測試中的引用；是否以 mock 替代要另審，不能當公開部署證據。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-195｜Low｜已加固待複掃｜client/src/components/bulletin/BulletinLeaderboard.tsx:78</summary>

- 原 PDF 頁：136；Issue Details 起始頁：135。
- 原類別：System Information Leak: Internal。
- 原 sink：~JS_Generic.error()。
- 原資料流來源：relativeFile：client/src/components/bulletin/BulletinLeaderboard.tsx；line：78；pdfPage：136。
- 當下來源：`client/src/components/bulletin/BulletinLeaderboard.tsx`；現行行號：79。
- 當下來源 SHA-256：`57b7aad061d33c4baac62235363adf94d409e8c1cf0164671398702f2b9ce756`（工作樹實際 bytes）。
- 部署範圍：Pages 瀏覽器 JS 候選。

**原因**

單純 console 位置不足以證明漏洞。保留操作上下文、name/code/message 與原始來源堆疊；只有可辨識的 URL 查詢、帳密、金鑰、權杖或電子郵件清洗，不取消事件、追蹤或既有 Sentry 管道。普通無敏感 Error 保持原物件，使 functions/internal 與網路雜訊篩選仍正常。SW 保留清洗後 message/stack 與資產檔名。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 client/src/components/bulletin/BulletinLeaderboard.tsx:79
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口
- client/src/lib/safeDiagnostic.ts：保留原 Error／清洗後 Error 對接原 console→Sentry
- client/src/lib/sentry.ts：原 captureConsoleIntegration 與噪音辨識未改
- client/public/sw.js：不打印 query，保留操作／資產／清洗堆疊

**測試／既有階段記錄**

- safeDiagnostic.test.ts 4/4 通過：原物件、name/code、清洗 callsite、額外認證物件不外送
- node --check client/public/sw.js 通過

**仍待驗證**

- 本輪 CI、Pages 發布及實際資產比對
- Sentry 真實事件與實體裝置未驗證；本輪未修改帳號或事件
- Fortify 複掃；不宣稱所有瀏覽器訊息已完整去識別化

**部署鏈及範圍依據**

- client：client/src/main.tsx → client/src/App.tsx → client/src/pages/BulletinHome.tsx → client/src/components/bulletin/BulletinLeaderboard.tsx

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-196｜Low｜已加固待複掃｜client/src/hooks/usePWAUpdate.ts:83</summary>

- 原 PDF 頁：137；Issue Details 起始頁：136。
- 原類別：System Information Leak: Internal。
- 原 sink：~JS_Generic.warn()。
- 原資料流來源：relativeFile：client/src/hooks/usePWAUpdate.ts；line：82；pdfPage：136。
- 當下來源：`client/src/hooks/usePWAUpdate.ts`；現行行號：84。
- 當下來源 SHA-256：`09f40d6f5745c19480cf8a4512377777a8bf9b1a0200d497e1f23d54cc88ad53`（工作樹實際 bytes）。
- 部署範圍：Pages 瀏覽器 JS 候選。

**原因**

單純 console 位置不足以證明漏洞。保留操作上下文、name/code/message 與原始來源堆疊；只有可辨識的 URL 查詢、帳密、金鑰、權杖或電子郵件清洗，不取消事件、追蹤或既有 Sentry 管道。普通無敏感 Error 保持原物件，使 functions/internal 與網路雜訊篩選仍正常。SW 保留清洗後 message/stack 與資產檔名。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 client/src/hooks/usePWAUpdate.ts:84
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口
- client/src/lib/safeDiagnostic.ts：保留原 Error／清洗後 Error 對接原 console→Sentry
- client/src/lib/sentry.ts：原 captureConsoleIntegration 與噪音辨識未改
- client/public/sw.js：不打印 query，保留操作／資產／清洗堆疊

**測試／既有階段記錄**

- safeDiagnostic.test.ts 4/4 通過：原物件、name/code、清洗 callsite、額外認證物件不外送
- node --check client/public/sw.js 通過

**仍待驗證**

- 本輪 CI、Pages 發布及實際資產比對
- Sentry 真實事件與實體裝置未驗證；本輪未修改帳號或事件
- Fortify 複掃；不宣稱所有瀏覽器訊息已完整去識別化

**部署鏈及範圍依據**

- client：client/src/main.tsx → client/src/App.tsx → client/src/components/PWAUpdatePrompt.tsx → client/src/hooks/usePWAUpdate.ts
- kind：test-import-references；references：from：client/src/hooks/__tests__/usePWAUpdate.test.ts；to：client/src/hooks/usePWAUpdate.ts；line：3；kind：static-import；isTest：True；note：這是測試中的引用；是否以 mock 替代要另審，不能當公開部署證據。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-197｜Low｜已加固待複掃｜client/src/lib/soundManager.ts:54</summary>

- 原 PDF 頁：137；Issue Details 起始頁：137。
- 原類別：System Information Leak: Internal。
- 原 sink：~JS_Generic.warn()。
- 原資料流來源：relativeFile：client/src/lib/soundManager.ts；line：53；pdfPage：137。
- 當下來源：`client/src/lib/soundManager.ts`；現行行號：55。
- 當下來源 SHA-256：`6f6ab9da38537eedb4aa460d2d622169af9e4447337038669815cde148bfb8ff`（工作樹實際 bytes）。
- 部署範圍：Pages 瀏覽器 JS 候選。

**原因**

單純 console 位置不足以證明漏洞。保留操作上下文、name/code/message 與原始來源堆疊；只有可辨識的 URL 查詢、帳密、金鑰、權杖或電子郵件清洗，不取消事件、追蹤或既有 Sentry 管道。普通無敏感 Error 保持原物件，使 functions/internal 與網路雜訊篩選仍正常。SW 保留清洗後 message/stack 與資產檔名。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 client/src/lib/soundManager.ts:55
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口
- client/src/lib/safeDiagnostic.ts：保留原 Error／清洗後 Error 對接原 console→Sentry
- client/src/lib/sentry.ts：原 captureConsoleIntegration 與噪音辨識未改
- client/public/sw.js：不打印 query，保留操作／資產／清洗堆疊

**測試／既有階段記錄**

- safeDiagnostic.test.ts 4/4 通過：原物件、name/code、清洗 callsite、額外認證物件不外送
- node --check client/public/sw.js 通過

**仍待驗證**

- 本輪 CI、Pages 發布及實際資產比對
- Sentry 真實事件與實體裝置未驗證；本輪未修改帳號或事件
- Fortify 複掃；不宣稱所有瀏覽器訊息已完整去識別化

**部署鏈及範圍依據**

- client：client/src/main.tsx → client/src/App.tsx → client/src/components/TourProvider.tsx → client/src/components/TourGuide.tsx → client/src/lib/soundManager.ts

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-198｜Low｜已加固待複掃｜client/src/pages/ToolDetail.tsx:392</summary>

- 原 PDF 頁：138；Issue Details 起始頁：138。
- 原類別：System Information Leak: Internal。
- 原 sink：~JS_Generic.error()。
- 原資料流來源：relativeFile：client/src/pages/ToolDetail.tsx；line：391；pdfPage：138。
- 當下來源：`client/src/pages/ToolDetail.tsx`；現行行號：393。
- 當下來源 SHA-256：`033ae18dc0a07edf9d2df18ffb2e7f31256c49d58eb95b7a6ad6d89a53fcdc5c`（工作樹實際 bytes）。
- 部署範圍：Pages 瀏覽器 JS 候選。

**原因**

單純 console 位置不足以證明漏洞。保留操作上下文、name/code/message 與原始來源堆疊；只有可辨識的 URL 查詢、帳密、金鑰、權杖或電子郵件清洗，不取消事件、追蹤或既有 Sentry 管道。普通無敏感 Error 保持原物件，使 functions/internal 與網路雜訊篩選仍正常。SW 保留清洗後 message/stack 與資產檔名。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 client/src/pages/ToolDetail.tsx:393
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口
- client/src/lib/safeDiagnostic.ts：保留原 Error／清洗後 Error 對接原 console→Sentry
- client/src/lib/sentry.ts：原 captureConsoleIntegration 與噪音辨識未改
- client/public/sw.js：不打印 query，保留操作／資產／清洗堆疊

**測試／既有階段記錄**

- safeDiagnostic.test.ts 4/4 通過：原物件、name/code、清洗 callsite、額外認證物件不外送
- node --check client/public/sw.js 通過

**仍待驗證**

- 本輪 CI、Pages 發布及實際資產比對
- Sentry 真實事件與實體裝置未驗證；本輪未修改帳號或事件
- Fortify 複掃；不宣稱所有瀏覽器訊息已完整去識別化

**部署鏈及範圍依據**

- client：client/src/main.tsx → client/src/App.tsx → client/src/pages/ToolDetail.tsx

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-199｜Low｜已加固待複掃｜client/src/pages/BulletinToolDetail.tsx:359</summary>

- 原 PDF 頁：139；Issue Details 起始頁：138。
- 原類別：System Information Leak: Internal。
- 原 sink：~JS_Generic.error()。
- 原資料流來源：relativeFile：client/src/pages/BulletinToolDetail.tsx；line：358；pdfPage：139。
- 當下來源：`client/src/pages/BulletinToolDetail.tsx`；現行行號：356。
- 當下來源 SHA-256：`d3cb7270fc1c0f35901946c59135998d1adba33356a50e2ab6b61bdad900806e`（工作樹實際 bytes）。
- 部署範圍：Pages 瀏覽器 JS 候選。

**原因**

單純 console 位置不足以證明漏洞。保留操作上下文、name/code/message 與原始來源堆疊；只有可辨識的 URL 查詢、帳密、金鑰、權杖或電子郵件清洗，不取消事件、追蹤或既有 Sentry 管道。普通無敏感 Error 保持原物件，使 functions/internal 與網路雜訊篩選仍正常。SW 保留清洗後 message/stack 與資產檔名。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 client/src/pages/BulletinToolDetail.tsx:356
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口
- client/src/lib/safeDiagnostic.ts：保留原 Error／清洗後 Error 對接原 console→Sentry
- client/src/lib/sentry.ts：原 captureConsoleIntegration 與噪音辨識未改
- client/public/sw.js：不打印 query，保留操作／資產／清洗堆疊

**測試／既有階段記錄**

- safeDiagnostic.test.ts 4/4 通過：原物件、name/code、清洗 callsite、額外認證物件不外送
- node --check client/public/sw.js 通過

**仍待驗證**

- 本輪 CI、Pages 發布及實際資產比對
- Sentry 真實事件與實體裝置未驗證；本輪未修改帳號或事件
- Fortify 複掃；不宣稱所有瀏覽器訊息已完整去識別化

**部署鏈及範圍依據**

- client：client/src/main.tsx → client/src/App.tsx → client/src/pages/BulletinToolDetail.tsx

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-200｜Low｜已加固待複掃｜client/src/pages/BulletinToolDetail.tsx:307</summary>

- 原 PDF 頁：140；Issue Details 起始頁：139。
- 原類別：System Information Leak: Internal。
- 原 sink：~JS_Generic.error()。
- 原資料流來源：relativeFile：client/src/pages/BulletinToolDetail.tsx；line：307；pdfPage：139。
- 當下來源：`client/src/pages/BulletinToolDetail.tsx`；現行行號：304。
- 當下來源 SHA-256：`d3cb7270fc1c0f35901946c59135998d1adba33356a50e2ab6b61bdad900806e`（工作樹實際 bytes）。
- 部署範圍：Pages 瀏覽器 JS 候選。

**原因**

單純 console 位置不足以證明漏洞。保留操作上下文、name/code/message 與原始來源堆疊；只有可辨識的 URL 查詢、帳密、金鑰、權杖或電子郵件清洗，不取消事件、追蹤或既有 Sentry 管道。普通無敏感 Error 保持原物件，使 functions/internal 與網路雜訊篩選仍正常。SW 保留清洗後 message/stack 與資產檔名。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 client/src/pages/BulletinToolDetail.tsx:304
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口
- client/src/lib/safeDiagnostic.ts：保留原 Error／清洗後 Error 對接原 console→Sentry
- client/src/lib/sentry.ts：原 captureConsoleIntegration 與噪音辨識未改
- client/public/sw.js：不打印 query，保留操作／資產／清洗堆疊

**測試／既有階段記錄**

- safeDiagnostic.test.ts 4/4 通過：原物件、name/code、清洗 callsite、額外認證物件不外送
- node --check client/public/sw.js 通過

**仍待驗證**

- 本輪 CI、Pages 發布及實際資產比對
- Sentry 真實事件與實體裝置未驗證；本輪未修改帳號或事件
- Fortify 複掃；不宣稱所有瀏覽器訊息已完整去識別化

**部署鏈及範圍依據**

- client：client/src/main.tsx → client/src/App.tsx → client/src/pages/BulletinToolDetail.tsx

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-201｜Low｜已加固待複掃｜client/src/pages/ToolDetail.tsx:410</summary>

- 原 PDF 頁：140；Issue Details 起始頁：140。
- 原類別：System Information Leak: Internal。
- 原 sink：~JS_Generic.error()。
- 原資料流來源：relativeFile：client/src/pages/ToolDetail.tsx；line：409；pdfPage：140。
- 當下來源：`client/src/pages/ToolDetail.tsx`；現行行號：411。
- 當下來源 SHA-256：`033ae18dc0a07edf9d2df18ffb2e7f31256c49d58eb95b7a6ad6d89a53fcdc5c`（工作樹實際 bytes）。
- 部署範圍：Pages 瀏覽器 JS 候選。

**原因**

單純 console 位置不足以證明漏洞。保留操作上下文、name/code/message 與原始來源堆疊；只有可辨識的 URL 查詢、帳密、金鑰、權杖或電子郵件清洗，不取消事件、追蹤或既有 Sentry 管道。普通無敏感 Error 保持原物件，使 functions/internal 與網路雜訊篩選仍正常。SW 保留清洗後 message/stack 與資產檔名。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 client/src/pages/ToolDetail.tsx:411
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口
- client/src/lib/safeDiagnostic.ts：保留原 Error／清洗後 Error 對接原 console→Sentry
- client/src/lib/sentry.ts：原 captureConsoleIntegration 與噪音辨識未改
- client/public/sw.js：不打印 query，保留操作／資產／清洗堆疊

**測試／既有階段記錄**

- safeDiagnostic.test.ts 4/4 通過：原物件、name/code、清洗 callsite、額外認證物件不外送
- node --check client/public/sw.js 通過

**仍待驗證**

- 本輪 CI、Pages 發布及實際資產比對
- Sentry 真實事件與實體裝置未驗證；本輪未修改帳號或事件
- Fortify 複掃；不宣稱所有瀏覽器訊息已完整去識別化

**部署鏈及範圍依據**

- client：client/src/main.tsx → client/src/App.tsx → client/src/pages/ToolDetail.tsx

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-202｜Low｜已加固待複掃｜client/src/pages/BulletinToolDetail.tsx:322</summary>

- 原 PDF 頁：141；Issue Details 起始頁：141。
- 原類別：System Information Leak: Internal。
- 原 sink：~JS_Generic.error()。
- 原資料流來源：relativeFile：client/src/pages/BulletinToolDetail.tsx；line：321；pdfPage：141。
- 當下來源：`client/src/pages/BulletinToolDetail.tsx`；現行行號：319。
- 當下來源 SHA-256：`d3cb7270fc1c0f35901946c59135998d1adba33356a50e2ab6b61bdad900806e`（工作樹實際 bytes）。
- 部署範圍：Pages 瀏覽器 JS 候選。

**原因**

單純 console 位置不足以證明漏洞。保留操作上下文、name/code/message 與原始來源堆疊；只有可辨識的 URL 查詢、帳密、金鑰、權杖或電子郵件清洗，不取消事件、追蹤或既有 Sentry 管道。普通無敏感 Error 保持原物件，使 functions/internal 與網路雜訊篩選仍正常。SW 保留清洗後 message/stack 與資產檔名。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 client/src/pages/BulletinToolDetail.tsx:319
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口
- client/src/lib/safeDiagnostic.ts：保留原 Error／清洗後 Error 對接原 console→Sentry
- client/src/lib/sentry.ts：原 captureConsoleIntegration 與噪音辨識未改
- client/public/sw.js：不打印 query，保留操作／資產／清洗堆疊

**測試／既有階段記錄**

- safeDiagnostic.test.ts 4/4 通過：原物件、name/code、清洗 callsite、額外認證物件不外送
- node --check client/public/sw.js 通過

**仍待驗證**

- 本輪 CI、Pages 發布及實際資產比對
- Sentry 真實事件與實體裝置未驗證；本輪未修改帳號或事件
- Fortify 複掃；不宣稱所有瀏覽器訊息已完整去識別化

**部署鏈及範圍依據**

- client：client/src/main.tsx → client/src/App.tsx → client/src/pages/BulletinToolDetail.tsx

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-203｜Low｜已加固待複掃｜client/src/pages/ToolDetail.tsx:456</summary>

- 原 PDF 頁：142；Issue Details 起始頁：141。
- 原類別：System Information Leak: Internal。
- 原 sink：~JS_Generic.error()。
- 原資料流來源：relativeFile：client/src/pages/ToolDetail.tsx；line：455；pdfPage：142。
- 當下來源：`client/src/pages/ToolDetail.tsx`；現行行號：457。
- 當下來源 SHA-256：`033ae18dc0a07edf9d2df18ffb2e7f31256c49d58eb95b7a6ad6d89a53fcdc5c`（工作樹實際 bytes）。
- 部署範圍：Pages 瀏覽器 JS 候選。

**原因**

單純 console 位置不足以證明漏洞。保留操作上下文、name/code/message 與原始來源堆疊；只有可辨識的 URL 查詢、帳密、金鑰、權杖或電子郵件清洗，不取消事件、追蹤或既有 Sentry 管道。普通無敏感 Error 保持原物件，使 functions/internal 與網路雜訊篩選仍正常。SW 保留清洗後 message/stack 與資產檔名。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 client/src/pages/ToolDetail.tsx:457
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口
- client/src/lib/safeDiagnostic.ts：保留原 Error／清洗後 Error 對接原 console→Sentry
- client/src/lib/sentry.ts：原 captureConsoleIntegration 與噪音辨識未改
- client/public/sw.js：不打印 query，保留操作／資產／清洗堆疊

**測試／既有階段記錄**

- safeDiagnostic.test.ts 4/4 通過：原物件、name/code、清洗 callsite、額外認證物件不外送
- node --check client/public/sw.js 通過

**仍待驗證**

- 本輪 CI、Pages 發布及實際資產比對
- Sentry 真實事件與實體裝置未驗證；本輪未修改帳號或事件
- Fortify 複掃；不宣稱所有瀏覽器訊息已完整去識別化

**部署鏈及範圍依據**

- client：client/src/main.tsx → client/src/App.tsx → client/src/pages/ToolDetail.tsx

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-204｜Low｜已加固待複掃｜client/public/sw.js:127</summary>

- 原 PDF 頁：143；Issue Details 起始頁：142。
- 原類別：System Information Leak: Internal。
- 原 sink：~JS_Generic.warn()。
- 原資料流來源：relativeFile：client/public/sw.js；line：126；pdfPage：142。
- 當下來源：`client/public/sw.js`；現行行號：152。
- 當下來源 SHA-256：`50888c366f6455b7dff98f8eddede75f657bec310141134f9755f69c8b01a45c`（工作樹實際 bytes）。
- 部署範圍：Pages 公開複製資產。

**原因**

單純 console 位置不足以證明漏洞。保留操作上下文、name/code/message 與原始來源堆疊；只有可辨識的 URL 查詢、帳密、金鑰、權杖或電子郵件清洗，不取消事件、追蹤或既有 Sentry 管道。普通無敏感 Error 保持原物件，使 functions/internal 與網路雜訊篩選仍正常。SW 保留清洗後 message/stack 與資產檔名。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 client/public/sw.js:152
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口
- client/src/lib/safeDiagnostic.ts：保留原 Error／清洗後 Error 對接原 console→Sentry
- client/src/lib/sentry.ts：原 captureConsoleIntegration 與噪音辨識未改
- client/public/sw.js：不打印 query，保留操作／資產／清洗堆疊

**測試／既有階段記錄**

- safeDiagnostic.test.ts 4/4 通過：原物件、name/code、清洗 callsite、額外認證物件不外送
- node --check client/public/sw.js 通過

**仍待驗證**

- 本輪 CI、Pages 發布及實際資產比對
- Sentry 真實事件與實體裝置未驗證；本輪未修改帳號或事件
- Fortify 複掃；不宣稱所有瀏覽器訊息已完整去識別化
- 目前工作樹檔案 bytes 與審查當時雜湊不同；最終提交前需確認變動未影響本筆判定。

**部署鏈及範圍依據**

- kind：vite-public-copy；evidenceRefs：viteRoot；viteDefaults；viteOutput；pagesUpload；publicArtifactRelativeFile：sw.js
- kind：service-worker-registration-reference；file：client/src/serviceWorkerRegistration.ts；line：96；fromEntry：client/src/main.tsx；client/src/serviceWorkerRegistration.ts；note：主入口 load 後呼叫註冊函式，正式 BASE_URL 指向 sw.js。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-205｜Low｜已加固待複掃｜client/public/sw.js:348</summary>

- 原 PDF 頁：143；Issue Details 起始頁：143。
- 原類別：System Information Leak: Internal。
- 原 sink：~JS_Generic.warn()。
- 原資料流來源：relativeFile：client/public/sw.js；line：347；pdfPage：143。
- 當下來源：`client/public/sw.js`；現行行號：373。
- 當下來源 SHA-256：`50888c366f6455b7dff98f8eddede75f657bec310141134f9755f69c8b01a45c`（工作樹實際 bytes）。
- 部署範圍：Pages 公開複製資產。

**原因**

單純 console 位置不足以證明漏洞。保留操作上下文、name/code/message 與原始來源堆疊；只有可辨識的 URL 查詢、帳密、金鑰、權杖或電子郵件清洗，不取消事件、追蹤或既有 Sentry 管道。普通無敏感 Error 保持原物件，使 functions/internal 與網路雜訊篩選仍正常。SW 保留清洗後 message/stack 與資產檔名。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 client/public/sw.js:373
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口
- client/src/lib/safeDiagnostic.ts：保留原 Error／清洗後 Error 對接原 console→Sentry
- client/src/lib/sentry.ts：原 captureConsoleIntegration 與噪音辨識未改
- client/public/sw.js：不打印 query，保留操作／資產／清洗堆疊

**測試／既有階段記錄**

- safeDiagnostic.test.ts 4/4 通過：原物件、name/code、清洗 callsite、額外認證物件不外送
- node --check client/public/sw.js 通過

**仍待驗證**

- 本輪 CI、Pages 發布及實際資產比對
- Sentry 真實事件與實體裝置未驗證；本輪未修改帳號或事件
- Fortify 複掃；不宣稱所有瀏覽器訊息已完整去識別化
- 目前工作樹檔案 bytes 與審查當時雜湊不同；最終提交前需確認變動未影響本筆判定。

**部署鏈及範圍依據**

- kind：vite-public-copy；evidenceRefs：viteRoot；viteDefaults；viteOutput；pagesUpload；publicArtifactRelativeFile：sw.js
- kind：service-worker-registration-reference；file：client/src/serviceWorkerRegistration.ts；line：96；fromEntry：client/src/main.tsx；client/src/serviceWorkerRegistration.ts；note：主入口 load 後呼叫註冊函式，正式 BASE_URL 指向 sw.js。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-206｜Low｜已加固待複掃｜client/public/sw.js:115</summary>

- 原 PDF 頁：144；Issue Details 起始頁：144。
- 原類別：System Information Leak: Internal。
- 原 sink：~JS_Generic.warn()。
- 原資料流來源：relativeFile：client/public/sw.js；line：114；pdfPage：144。
- 當下來源：`client/public/sw.js`；現行行號：140。
- 當下來源 SHA-256：`50888c366f6455b7dff98f8eddede75f657bec310141134f9755f69c8b01a45c`（工作樹實際 bytes）。
- 部署範圍：Pages 公開複製資產。

**原因**

單純 console 位置不足以證明漏洞。保留操作上下文、name/code/message 與原始來源堆疊；只有可辨識的 URL 查詢、帳密、金鑰、權杖或電子郵件清洗，不取消事件、追蹤或既有 Sentry 管道。普通無敏感 Error 保持原物件，使 functions/internal 與網路雜訊篩選仍正常。SW 保留清洗後 message/stack 與資產檔名。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 client/public/sw.js:140
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口
- client/src/lib/safeDiagnostic.ts：保留原 Error／清洗後 Error 對接原 console→Sentry
- client/src/lib/sentry.ts：原 captureConsoleIntegration 與噪音辨識未改
- client/public/sw.js：不打印 query，保留操作／資產／清洗堆疊

**測試／既有階段記錄**

- safeDiagnostic.test.ts 4/4 通過：原物件、name/code、清洗 callsite、額外認證物件不外送
- node --check client/public/sw.js 通過

**仍待驗證**

- 本輪 CI、Pages 發布及實際資產比對
- Sentry 真實事件與實體裝置未驗證；本輪未修改帳號或事件
- Fortify 複掃；不宣稱所有瀏覽器訊息已完整去識別化
- 目前工作樹檔案 bytes 與審查當時雜湊不同；最終提交前需確認變動未影響本筆判定。

**部署鏈及範圍依據**

- kind：vite-public-copy；evidenceRefs：viteRoot；viteDefaults；viteOutput；pagesUpload；publicArtifactRelativeFile：sw.js
- kind：service-worker-registration-reference；file：client/src/serviceWorkerRegistration.ts；line：96；fromEntry：client/src/main.tsx；client/src/serviceWorkerRegistration.ts；note：主入口 load 後呼叫註冊函式，正式 BASE_URL 指向 sw.js。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-207｜Low｜已加固待複掃｜client/src/App.tsx:57</summary>

- 原 PDF 頁：145；Issue Details 起始頁：144。
- 原類別：System Information Leak: Internal。
- 原 sink：~JS_Generic.warn()。
- 原資料流來源：relativeFile：client/src/App.tsx；line：57；pdfPage：145。
- 當下來源：`client/src/App.tsx`；現行行號：58。
- 當下來源 SHA-256：`15c719f417dc01f607880d88be8bbb7f03c81ce3c41bb203090ac0234877b4ef`（工作樹實際 bytes）。
- 部署範圍：Pages 瀏覽器 JS 候選。

**原因**

單純 console 位置不足以證明漏洞。保留操作上下文、name/code/message 與原始來源堆疊；只有可辨識的 URL 查詢、帳密、金鑰、權杖或電子郵件清洗，不取消事件、追蹤或既有 Sentry 管道。普通無敏感 Error 保持原物件，使 functions/internal 與網路雜訊篩選仍正常。SW 保留清洗後 message/stack 與資產檔名。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 client/src/App.tsx:58
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口
- client/src/lib/safeDiagnostic.ts：保留原 Error／清洗後 Error 對接原 console→Sentry
- client/src/lib/sentry.ts：原 captureConsoleIntegration 與噪音辨識未改
- client/public/sw.js：不打印 query，保留操作／資產／清洗堆疊

**測試／既有階段記錄**

- safeDiagnostic.test.ts 4/4 通過：原物件、name/code、清洗 callsite、額外認證物件不外送
- node --check client/public/sw.js 通過

**仍待驗證**

- 本輪 CI、Pages 發布及實際資產比對
- Sentry 真實事件與實體裝置未驗證；本輪未修改帳號或事件
- Fortify 複掃；不宣稱所有瀏覽器訊息已完整去識別化

**部署鏈及範圍依據**

- client：client/src/main.tsx → client/src/App.tsx

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-208｜Low｜誤判候選待審查｜functions/src/index.ts:170</summary>

- 原 PDF 頁：146；Issue Details 起始頁：145。
- 原類別：System Information Leak: Internal。
- 原 sink：~JS_Generic.warn()。
- 原資料流來源：relativeFile：functions/src/index.ts；line：170；pdfPage：145。
- 當下來源：`functions/src/index.ts`；現行行號：173。
- 當下來源 SHA-256：`462f3448fef3a6e2d262c5ad54d705e6d075627f6a13e971b87574d81758b6f6`（工作樹實際 bytes）。
- 部署範圍：Firebase Functions 入口候選。

**原因**

維護工具的進度／失敗訊息或後端受限日誌，尚未找到此筆資料直接回傳公開頁面的路徑。保留診斷，不把 stdout／console 本身當秘密外洩；此判定不保證任何歷史日誌都無敏感資訊。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 functions/src/index.ts:173
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另有 Express／CLI 分享日誌，需確認日誌權限與內容清洗
- Fortify 複掃與原平台人工分類
- 尚未逐筆做動態攻擊重現

**部署鏈及範圍依據**

- functions：functions/src/index.ts

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-209｜Low｜誤判候選待審查｜mcp-scripts/index.mjs:122</summary>

- 原 PDF 頁：146；Issue Details 起始頁：146。
- 原類別：System Information Leak: Internal。
- 原 sink：~JS_Generic.error()。
- 原資料流來源：relativeFile：mcp-scripts/index.mjs；line：121；pdfPage：146。
- 當下來源：`mcp-scripts/index.mjs`；現行行號：122。
- 當下來源 SHA-256：`c7904f01222f112a26aeb4861e1f74f0814cae920efffe0c4b2ef859a0e86652`（工作樹實際 bytes）。
- 部署範圍：本機 MCP 來源；啟動／部署關聯未確認。

**原因**

維護工具的進度／失敗訊息或後端受限日誌，尚未找到此筆資料直接回傳公開頁面的路徑。保留診斷，不把 stdout／console 本身當秘密外洩；此判定不保證任何歷史日誌都無敏感資訊。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 mcp-scripts/index.mjs:122
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另有 Express／CLI 分享日誌，需確認日誌權限與內容清洗
- Fortify 複掃與原平台人工分類
- 尚未逐筆做動態攻擊重現

**部署鏈及範圍依據**

- kind：mcp-source-and-config-mismatch；file：mcp-scripts/package.json；packageMain：index.js；reportedSource：mcp-scripts/index.mjs；configuredStartScript：False；note：未找到 Pages、Functions、Express 或 CI 引入；實際 MCP 啟動設定未確認，不能聲稱從未執行。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-210｜Low｜誤判候選待審查｜scripts/sync-featured-from-firestore.mjs:44</summary>

- 原 PDF 頁：147；Issue Details 起始頁：147。
- 原類別：System Information Leak: Internal。
- 原 sink：~JS_Generic.log()。
- 原資料流來源：relativeFile：scripts/sync-featured-from-firestore.mjs；line：42；pdfPage：147。
- 當下來源：`scripts/sync-featured-from-firestore.mjs`；現行行號：44。
- 當下來源 SHA-256：`0849d61c204cb60cc5126b996daf0a85b32353fe122b9f0b842ff5b1a3e16861`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

維護工具的進度／失敗訊息或後端受限日誌，尚未找到此筆資料直接回傳公開頁面的路徑。保留診斷，不把 stdout／console 本身當秘密外洩；此判定不保證任何歷史日誌都無敏感資訊。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/sync-featured-from-firestore.mjs:44
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另有 Express／CLI 分享日誌，需確認日誌權限與內容清洗
- Fortify 複掃與原平台人工分類
- 尚未逐筆做動態攻擊重現

**部署鏈及範圍依據**

- ci：scripts/sync-featured-from-firestore.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/sync-featured-from-firestore.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-211｜Low｜誤判候選待審查｜scripts/ensure-fonts.mjs:65</summary>

- 原 PDF 頁：148；Issue Details 起始頁：148。
- 原類別：System Information Leak: Internal。
- 原 sink：~JS_Generic.error()。
- 原資料流來源：relativeFile：scripts/ensure-fonts.mjs；line：64；pdfPage：148。
- 當下來源：`scripts/ensure-fonts.mjs`；現行行號：65。
- 當下來源 SHA-256：`e7159b760c1d7ba2b58c4b117ed0b6073201e5c7de4fe377b2f92405443bc43a`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

維護工具的進度／失敗訊息或後端受限日誌，尚未找到此筆資料直接回傳公開頁面的路徑。保留診斷，不把 stdout／console 本身當秘密外洩；此判定不保證任何歷史日誌都無敏感資訊。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/ensure-fonts.mjs:65
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另有 Express／CLI 分享日誌，需確認日誌權限與內容清洗
- Fortify 複掃與原平台人工分類
- 尚未逐筆做動態攻擊重現

**部署鏈及範圍依據**

- ci：scripts/generate-100-celebration-og.mjs → scripts/ensure-fonts.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/generate-favicon.mjs → scripts/ensure-fonts.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/generate-home-og.mjs → scripts/ensure-fonts.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/generate-home-og-heatmap.mjs → scripts/ensure-fonts.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/generate-100-celebration-og.mjs → scripts/ensure-fonts.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-212｜Low｜誤判候選待審查｜scripts/generate-100-celebration-og.mjs:576</summary>

- 原 PDF 頁：149；Issue Details 起始頁：148。
- 原類別：System Information Leak: Internal。
- 原 sink：~JS_Generic.error()。
- 原資料流來源：relativeFile：scripts/generate-100-celebration-og.mjs；line：575；pdfPage：148。
- 當下來源：`scripts/generate-100-celebration-og.mjs`；現行行號：576。
- 當下來源 SHA-256：`e993f159f25b73c30d67000290f43df5bb54e9977252553398c6b9a6ab40c159`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

維護工具的進度／失敗訊息或後端受限日誌，尚未找到此筆資料直接回傳公開頁面的路徑。保留診斷，不把 stdout／console 本身當秘密外洩；此判定不保證任何歷史日誌都無敏感資訊。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-100-celebration-og.mjs:576
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另有 Express／CLI 分享日誌，需確認日誌權限與內容清洗
- Fortify 複掃與原平台人工分類
- 尚未逐筆做動態攻擊重現

**部署鏈及範圍依據**

- ci：scripts/generate-100-celebration-og.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/generate-100-celebration-og.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-213｜Low｜誤判候選待審查｜scripts/generate-favicon.mjs:210</summary>

- 原 PDF 頁：149；Issue Details 起始頁：149。
- 原類別：System Information Leak: Internal。
- 原 sink：~JS_Generic.error()。
- 原資料流來源：relativeFile：scripts/generate-favicon.mjs；line：209；pdfPage：149。
- 當下來源：`scripts/generate-favicon.mjs`；現行行號：210。
- 當下來源 SHA-256：`f8f548eacfd1df44c85f497cb28c7dbf2a069a37353124e0075cbf9f887c7323`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

維護工具的進度／失敗訊息或後端受限日誌，尚未找到此筆資料直接回傳公開頁面的路徑。保留診斷，不把 stdout／console 本身當秘密外洩；此判定不保證任何歷史日誌都無敏感資訊。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-favicon.mjs:210
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另有 Express／CLI 分享日誌，需確認日誌權限與內容清洗
- Fortify 複掃與原平台人工分類
- 尚未逐筆做動態攻擊重現

**部署鏈及範圍依據**

- ci：scripts/generate-favicon.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/generate-favicon.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-214｜Low｜誤判候選待審查｜scripts/generate-home-og-heatmap.mjs:472</summary>

- 原 PDF 頁：150；Issue Details 起始頁：150。
- 原類別：System Information Leak: Internal。
- 原 sink：~JS_Generic.error()。
- 原資料流來源：relativeFile：scripts/generate-home-og-heatmap.mjs；line：471；pdfPage：150。
- 當下來源：`scripts/generate-home-og-heatmap.mjs`；現行行號：472。
- 當下來源 SHA-256：`e5a15af3aaab3f2903d9752b7c7c7f1d7c63b3dbee7238ce70105ae8dfb0b4ab`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

維護工具的進度／失敗訊息或後端受限日誌，尚未找到此筆資料直接回傳公開頁面的路徑。保留診斷，不把 stdout／console 本身當秘密外洩；此判定不保證任何歷史日誌都無敏感資訊。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-home-og-heatmap.mjs:472
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另有 Express／CLI 分享日誌，需確認日誌權限與內容清洗
- Fortify 複掃與原平台人工分類
- 尚未逐筆做動態攻擊重現

**部署鏈及範圍依據**

- ci：scripts/generate-home-og-heatmap.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/generate-home-og-heatmap.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-215｜Low｜誤判候選待審查｜scripts/generate-home-og.mjs:429</summary>

- 原 PDF 頁：151；Issue Details 起始頁：150。
- 原類別：System Information Leak: Internal。
- 原 sink：~JS_Generic.error()。
- 原資料流來源：relativeFile：scripts/generate-home-og.mjs；line：428；pdfPage：151。
- 當下來源：`scripts/generate-home-og.mjs`；現行行號：429。
- 當下來源 SHA-256：`8250bcd5b6df532d8eaafea0c87cb2b8a92ce26612256b5fe98012657a5bdfb5`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

維護工具的進度／失敗訊息或後端受限日誌，尚未找到此筆資料直接回傳公開頁面的路徑。保留診斷，不把 stdout／console 本身當秘密外洩；此判定不保證任何歷史日誌都無敏感資訊。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-home-og.mjs:429
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另有 Express／CLI 分享日誌，需確認日誌權限與內容清洗
- Fortify 複掃與原平台人工分類
- 尚未逐筆做動態攻擊重現

**部署鏈及範圍依據**

- ci：scripts/generate-home-og.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/generate-home-og.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-216｜Low｜誤判候選待審查｜scripts/add-tool-102.mjs:107</summary>

- 原 PDF 頁：152；Issue Details 起始頁：151。
- 原類別：System Information Leak: Internal。
- 原 sink：~JS_Generic.error()。
- 原資料流來源：relativeFile：scripts/add-tool-102.mjs；line：107；pdfPage：151。
- 當下來源：`scripts/add-tool-102.mjs`；現行行號：107。
- 當下來源 SHA-256：`513f2db9102d557b9c8749f3f484c562f5d9387842c1d8356abe32b5cc6c59d1`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

維護工具的進度／失敗訊息或後端受限日誌，尚未找到此筆資料直接回傳公開頁面的路徑。保留診斷，不把 stdout／console 本身當秘密外洩；此判定不保證任何歷史日誌都無敏感資訊。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/add-tool-102.mjs:107
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另有 Express／CLI 分享日誌，需確認日誌權限與內容清洗
- Fortify 複掃與原平台人工分類
- 尚未逐筆做動態攻擊重現

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：1；topLevelVariableStatements：7；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-217｜Low｜誤判候選待審查｜scripts/add-tool-103.mjs:108</summary>

- 原 PDF 頁：152；Issue Details 起始頁：152。
- 原類別：System Information Leak: Internal。
- 原 sink：~JS_Generic.error()。
- 原資料流來源：relativeFile：scripts/add-tool-103.mjs；line：108；pdfPage：152。
- 當下來源：`scripts/add-tool-103.mjs`；現行行號：108。
- 當下來源 SHA-256：`9d637e341385bbb745e4c3c297277d212a0bed72c4220b77f12f901fe58a915a`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

維護工具的進度／失敗訊息或後端受限日誌，尚未找到此筆資料直接回傳公開頁面的路徑。保留診斷，不把 stdout／console 本身當秘密外洩；此判定不保證任何歷史日誌都無敏感資訊。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/add-tool-103.mjs:108
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另有 Express／CLI 分享日誌，需確認日誌權限與內容清洗
- Fortify 複掃與原平台人工分類
- 尚未逐筆做動態攻擊重現

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：1；topLevelVariableStatements：7；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-218｜Low｜誤判候選待審查｜scripts/add-tool-104.mjs:126</summary>

- 原 PDF 頁：153；Issue Details 起始頁：153。
- 原類別：System Information Leak: Internal。
- 原 sink：~JS_Generic.error()。
- 原資料流來源：relativeFile：scripts/add-tool-104.mjs；line：126；pdfPage：153。
- 當下來源：`scripts/add-tool-104.mjs`；現行行號：126。
- 當下來源 SHA-256：`bac6200edc21cf81223d21a23641fa72300b4d35c64f2ea0b462f34ac07733c9`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

維護工具的進度／失敗訊息或後端受限日誌，尚未找到此筆資料直接回傳公開頁面的路徑。保留診斷，不把 stdout／console 本身當秘密外洩；此判定不保證任何歷史日誌都無敏感資訊。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/add-tool-104.mjs:126
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另有 Express／CLI 分享日誌，需確認日誌權限與內容清洗
- Fortify 複掃與原平台人工分類
- 尚未逐筆做動態攻擊重現

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：1；topLevelVariableStatements：7；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-219｜Low｜誤判候選待審查｜scripts/add-tool-105.mjs:128</summary>

- 原 PDF 頁：154；Issue Details 起始頁：153。
- 原類別：System Information Leak: Internal。
- 原 sink：~JS_Generic.error()。
- 原資料流來源：relativeFile：scripts/add-tool-105.mjs；line：128；pdfPage：154。
- 當下來源：`scripts/add-tool-105.mjs`；現行行號：128。
- 當下來源 SHA-256：`799105aecc5b688c439272131af2946ad1cfd58f320dc544ec7fc632455e8818`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

維護工具的進度／失敗訊息或後端受限日誌，尚未找到此筆資料直接回傳公開頁面的路徑。保留診斷，不把 stdout／console 本身當秘密外洩；此判定不保證任何歷史日誌都無敏感資訊。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/add-tool-105.mjs:128
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另有 Express／CLI 分享日誌，需確認日誌權限與內容清洗
- Fortify 複掃與原平台人工分類
- 尚未逐筆做動態攻擊重現

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：1；topLevelVariableStatements：7；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-220｜Low｜誤判候選待審查｜scripts/add-tool-98.mjs:153</summary>

- 原 PDF 頁：155；Issue Details 起始頁：154。
- 原類別：System Information Leak: Internal。
- 原 sink：~JS_Generic.error()。
- 原資料流來源：relativeFile：scripts/add-tool-98.mjs；line：152；pdfPage：154。
- 當下來源：`scripts/add-tool-98.mjs`；現行行號：153。
- 當下來源 SHA-256：`ab73dbe5c6c42cc68d5122aad6ba3a3c1dab59a5ee158dd5bbed7c66002b2025`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

維護工具的進度／失敗訊息或後端受限日誌，尚未找到此筆資料直接回傳公開頁面的路徑。保留診斷，不把 stdout／console 本身當秘密外洩；此判定不保證任何歷史日誌都無敏感資訊。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/add-tool-98.mjs:153
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另有 Express／CLI 分享日誌，需確認日誌權限與內容清洗
- Fortify 複掃與原平台人工分類
- 尚未逐筆做動態攻擊重現

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：1；topLevelVariableStatements：7；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-221｜Low｜誤判候選待審查｜scripts/add-tool-99.mjs:154</summary>

- 原 PDF 頁：155；Issue Details 起始頁：155。
- 原類別：System Information Leak: Internal。
- 原 sink：~JS_Generic.error()。
- 原資料流來源：relativeFile：scripts/add-tool-99.mjs；line：153；pdfPage：155。
- 當下來源：`scripts/add-tool-99.mjs`；現行行號：154。
- 當下來源 SHA-256：`4c98adac30de4ad3eea13f5695a3c5b29977420f3402d2d1fafd3f876217f11d`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

維護工具的進度／失敗訊息或後端受限日誌，尚未找到此筆資料直接回傳公開頁面的路徑。保留診斷，不把 stdout／console 本身當秘密外洩；此判定不保證任何歷史日誌都無敏感資訊。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/add-tool-99.mjs:154
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另有 Express／CLI 分享日誌，需確認日誌權限與內容清洗
- Fortify 複掃與原平台人工分類
- 尚未逐筆做動態攻擊重現

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：1；topLevelVariableStatements：7；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-222｜Low｜誤判候選待審查｜scripts/subset-web-font.mjs:40</summary>

- 原 PDF 頁：156；Issue Details 起始頁：156。
- 原類別：System Information Leak: Internal。
- 原 sink：~JS_Generic.error()。
- 原資料流來源：relativeFile：scripts/subset-web-font.mjs；line：30；pdfPage：156。
- 當下來源：`scripts/subset-web-font.mjs`；現行行號：41。
- 當下來源 SHA-256：`52dbb301a66e10c0863dcd7c4a5c60555af5d45b6891b644922fcddf2383f350`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

維護工具的進度／失敗訊息或後端受限日誌，尚未找到此筆資料直接回傳公開頁面的路徑。保留診斷，不把 stdout／console 本身當秘密外洩；此判定不保證任何歷史日誌都無敏感資訊。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/subset-web-font.mjs:41
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另有 Express／CLI 分享日誌，需確認日誌權限與內容清洗
- Fortify 複掃與原平台人工分類
- 尚未逐筆做動態攻擊重現

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：package-cli-reference；references：file：package.json；jsonPointer：/scripts/subset-web-font
- kind：source-entry-shape；shape：topLevelExpressionStatements：4；topLevelVariableStatements：24；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-223｜Low｜誤判候選待審查｜scripts/sync-featured-from-firestore.mjs:185</summary>

- 原 PDF 頁：157；Issue Details 起始頁：156。
- 原類別：System Information Leak: Internal。
- 原 sink：~JS_Generic.error()。
- 原資料流來源：relativeFile：scripts/sync-featured-from-firestore.mjs；line：184；pdfPage：156。
- 當下來源：`scripts/sync-featured-from-firestore.mjs`；現行行號：185。
- 當下來源 SHA-256：`0849d61c204cb60cc5126b996daf0a85b32353fe122b9f0b842ff5b1a3e16861`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

維護工具的進度／失敗訊息或後端受限日誌，尚未找到此筆資料直接回傳公開頁面的路徑。保留診斷，不把 stdout／console 本身當秘密外洩；此判定不保證任何歷史日誌都無敏感資訊。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/sync-featured-from-firestore.mjs:185
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另有 Express／CLI 分享日誌，需確認日誌權限與內容清洗
- Fortify 複掃與原平台人工分類
- 尚未逐筆做動態攻擊重現

**部署鏈及範圍依據**

- ci：scripts/sync-featured-from-firestore.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/sync-featured-from-firestore.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-224｜Low｜誤判候選待審查｜scripts/new-tool.mjs:361</summary>

- 原 PDF 頁：158；Issue Details 起始頁：157。
- 原類別：System Information Leak: Internal。
- 原 sink：~JS_Generic.error()。
- 原資料流來源：relativeFile：scripts/new-tool.mjs；line：360；pdfPage：157。
- 當下來源：`scripts/new-tool.mjs`；現行行號：361。
- 當下來源 SHA-256：`1791dabbd55c1a3a6c65e6dc62789b857ab4f43e82ec25a77f05f463ea9032ad`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

維護工具的進度／失敗訊息或後端受限日誌，尚未找到此筆資料直接回傳公開頁面的路徑。保留診斷，不把 stdout／console 本身當秘密外洩；此判定不保證任何歷史日誌都無敏感資訊。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/new-tool.mjs:361
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另有 Express／CLI 分享日誌，需確認日誌權限與內容清洗
- Fortify 複掃與原平台人工分類
- 尚未逐筆做動態攻擊重現

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：package-cli-reference；references：file：package.json；jsonPointer：/scripts/new-tool
- kind：source-entry-shape；shape：topLevelExpressionStatements：1；topLevelVariableStatements：11；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-225｜Low｜誤判候選待審查｜scripts/set-admin-claim.ts:11</summary>

- 原 PDF 頁：158；Issue Details 起始頁：158。
- 原類別：System Information Leak: Internal。
- 原 sink：~JS_Generic.log()。
- 原資料流來源：relativeFile：scripts/set-admin-claim.ts；line：9；pdfPage：158。
- 當下來源：`scripts/set-admin-claim.ts`；現行行號：11。
- 當下來源 SHA-256：`e3d89db874af8e0c4bd2b2d59683536f2b7fc85b73a5ec893b6f0512297d7a43`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

維護工具的進度／失敗訊息或後端受限日誌，尚未找到此筆資料直接回傳公開頁面的路徑。保留診斷，不把 stdout／console 本身當秘密外洩；此判定不保證任何歷史日誌都無敏感資訊。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/set-admin-claim.ts:11
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另有 Express／CLI 分享日誌，需確認日誌權限與內容清洗
- Fortify 複掃與原平台人工分類
- 尚未逐筆做動態攻擊重現

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：1；topLevelVariableStatements：1；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-226｜Low｜誤判候選待審查｜scripts/wait-for-deployed-version.mjs:24</summary>

- 原 PDF 頁：159；Issue Details 起始頁：159。
- 原類別：System Information Leak: Internal。
- 原 sink：~JS_Generic.log()。
- 原資料流來源：relativeFile：scripts/wait-for-deployed-version.mjs；line：37；pdfPage：159。
- 當下來源：`scripts/wait-for-deployed-version.mjs`；現行行號：24。
- 當下來源 SHA-256：`5a3d617f2efd0613d4c1bd6f7411a550738bc7528a732c8b6762a5013f03092b`（工作樹實際 bytes）。
- 部署範圍：CI 品質／驗證程序。

**原因**

維護工具的進度／失敗訊息或後端受限日誌，尚未找到此筆資料直接回傳公開頁面的路徑。保留診斷，不把 stdout／console 本身當秘密外洩；此判定不保證任何歷史日誌都無敏感資訊。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/wait-for-deployed-version.mjs:24
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另有 Express／CLI 分享日誌，需確認日誌權限與內容清洗
- Fortify 複掃與原平台人工分類
- 尚未逐筆做動態攻擊重現

**部署鏈及範圍依據**

- ci：scripts/wait-for-deployed-version.mjs
- CI：.github/workflows/lighthouse.yml／Test quality gate／直接呼叫；scripts/lighthouse-quality.test.mjs → scripts/wait-for-deployed-version.mjs
- CI：.github/workflows/lighthouse.yml／Verify deployed version／直接呼叫；scripts/wait-for-deployed-version.mjs
- CI：.github/workflows/lighthouse.yml／Verify version remained unchanged during audit／直接呼叫 --once；scripts/wait-for-deployed-version.mjs
- kind：test-import-references；references：from：scripts/lighthouse-quality.test.mjs；to：scripts/wait-for-deployed-version.mjs；line：3；kind：static-import；isTest：True；note：這是測試中的引用；是否以 mock 替代要另審，不能當公開部署證據。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-227｜Low｜誤判候選待審查｜scripts/sync-popular-queries.mjs:156</summary>

- 原 PDF 頁：160；Issue Details 起始頁：159。
- 原類別：System Information Leak: Internal。
- 原 sink：~JS_Generic.error()。
- 原資料流來源：relativeFile：scripts/sync-popular-queries.mjs；line：155；pdfPage：159。
- 當下來源：`scripts/sync-popular-queries.mjs`；現行行號：156。
- 當下來源 SHA-256：`3721865e66dd09775210073d54e5278da6fd4094fd4de8c696fb0abd18bbc368`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

維護工具的進度／失敗訊息或後端受限日誌，尚未找到此筆資料直接回傳公開頁面的路徑。保留診斷，不把 stdout／console 本身當秘密外洩；此判定不保證任何歷史日誌都無敏感資訊。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/sync-popular-queries.mjs:156
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另有 Express／CLI 分享日誌，需確認日誌權限與內容清洗
- Fortify 複掃與原平台人工分類
- 尚未逐筆做動態攻擊重現

**部署鏈及範圍依據**

- ci：scripts/sync-popular-queries.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/sync-popular-queries.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-228｜Low｜誤判候選待審查｜scripts/sync-popular-queries.mjs:53</summary>

- 原 PDF 頁：160；Issue Details 起始頁：160。
- 原類別：System Information Leak: Internal。
- 原 sink：~JS_Generic.log()。
- 原資料流來源：relativeFile：scripts/sync-popular-queries.mjs；line：51；pdfPage：160。
- 當下來源：`scripts/sync-popular-queries.mjs`；現行行號：53。
- 當下來源 SHA-256：`3721865e66dd09775210073d54e5278da6fd4094fd4de8c696fb0abd18bbc368`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

維護工具的進度／失敗訊息或後端受限日誌，尚未找到此筆資料直接回傳公開頁面的路徑。保留診斷，不把 stdout／console 本身當秘密外洩；此判定不保證任何歷史日誌都無敏感資訊。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/sync-popular-queries.mjs:53
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另有 Express／CLI 分享日誌，需確認日誌權限與內容清洗
- Fortify 複掃與原平台人工分類
- 尚未逐筆做動態攻擊重現

**部署鏈及範圍依據**

- ci：scripts/sync-popular-queries.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/sync-popular-queries.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-229｜Low｜誤判候選待審查｜scripts/inject-cockpit-stage-beacons.mjs:96</summary>

- 原 PDF 頁：161；Issue Details 起始頁：161。
- 原類別：System Information Leak: Internal。
- 原 sink：~JS_Generic.log()。
- 原資料流來源：relativeFile：scripts/inject-cockpit-stage-beacons.mjs；line：23；pdfPage：161。
- 當下來源：`scripts/inject-cockpit-stage-beacons.mjs`；現行行號：97。
- 當下來源 SHA-256：`d6983b0d93fdb1ce44f3b025b537ebabb071fabc90b952c11183a263e0c97300`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

維護工具的進度／失敗訊息或後端受限日誌，尚未找到此筆資料直接回傳公開頁面的路徑。保留診斷，不把 stdout／console 本身當秘密外洩；此判定不保證任何歷史日誌都無敏感資訊。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/inject-cockpit-stage-beacons.mjs:97
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另有 Express／CLI 分享日誌，需確認日誌權限與內容清洗
- Fortify 複掃與原平台人工分類
- 尚未逐筆做動態攻擊重現

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：5；topLevelVariableStatements：6；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-230｜Low｜誤判候選待審查｜scripts/generate-tool-embeddings.mjs:141</summary>

- 原 PDF 頁：162；Issue Details 起始頁：162。
- 原類別：System Information Leak: Internal。
- 原 sink：~JS_Generic.error()。
- 原資料流來源：relativeFile：scripts/generate-tool-embeddings.mjs；line：140；pdfPage：162。
- 當下來源：`scripts/generate-tool-embeddings.mjs`；現行行號：141。
- 當下來源 SHA-256：`840fd6419bccf9f1221a8099b5bbb199949cc54ef524ecb6d0be5bd681881305`（工作樹實際 bytes）。
- 部署範圍：手動／未配置維護 CLI，未見本次部署關聯。

**原因**

維護工具的進度／失敗訊息或後端受限日誌，尚未找到此筆資料直接回傳公開頁面的路徑。保留診斷，不把 stdout／console 本身當秘密外洩；此判定不保證任何歷史日誌都無敏感資訊。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 scripts/generate-tool-embeddings.mjs:141
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另有 Express／CLI 分享日誌，需確認日誌權限與內容清洗
- Fortify 複掃與原平台人工分類
- 尚未逐筆做動態攻擊重現

**部署鏈及範圍依據**

- kind：deployment-graph-negative；checkedGraphs：client；functions；express；ci；notReachable：client：True；functions：True；express：True；ci：True；evidenceRefs：pagesUpload；viteOutput
- kind：source-entry-shape；shape：topLevelExpressionStatements：1；topLevelVariableStatements：7；note：只表明有可執行本機程式內容，不證明已被使用者或外部排程啟動。

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-231｜Low｜誤判候選待審查｜server/index.ts:231</summary>

- 原 PDF 頁：163；Issue Details 起始頁：162。
- 原類別：System Information Leak: Internal。
- 原 sink：~JS_Generic.error()。
- 原資料流來源：relativeFile：server/index.ts；line：230；pdfPage：162。
- 當下來源：`server/index.ts`；現行行號：233。
- 當下來源 SHA-256：`f75d04fb7c2d95ec1a9d20db7056f15821c5c6d957d6c5f61ccb932eec4cd844`（工作樹實際 bytes）。
- 部署範圍：Express 來源，未隨 Pages 產物部署。

**原因**

維護工具的進度／失敗訊息或後端受限日誌，尚未找到此筆資料直接回傳公開頁面的路徑。保留診斷，不把 stdout／console 本身當秘密外洩；此判定不保證任何歷史日誌都無敏感資訊。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 server/index.ts:233
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另有 Express／CLI 分享日誌，需確認日誌權限與內容清洗
- Fortify 複掃與原平台人工分類
- 尚未逐筆做動態攻擊重現
- 本輪新來源差異核對：reviewer：主線本輪差異與本機安全測試核對；scope：純文字摘要提及／連結語法保護；卡片 HTML 與 HTTPS 傳輸／通知時機保持原流程。；verification：15/15 本機安全節點案例通過；CI、正式通知與其他部署仍待確認

**部署鏈及範圍依據**

- express：server/index.ts
- kind：express-build-excluded-from-pages；evidenceRefs：expressCompile；expressDev；expressStart；pagesUpload

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-232｜Low｜誤判候選待審查｜server/logger.ts:20</summary>

- 原 PDF 頁：164；Issue Details 起始頁：163。
- 原類別：System Information Leak: Internal。
- 原 sink：~JS_Generic.log()。
- 原資料流來源：relativeFile：db/index.ts；line：29；pdfPage：163。
- 當下來源：`server/logger.ts`；現行行號：20。
- 當下來源 SHA-256：`e3ef68ee61234e875b29270d33270065643dcd39b71a4d979a1f2dd5deb53607`（工作樹實際 bytes）。
- 部署範圍：Express 來源，未隨 Pages 產物部署。

**原因**

維護工具的進度／失敗訊息或後端受限日誌，尚未找到此筆資料直接回傳公開頁面的路徑。保留診斷，不把 stdout／console 本身當秘密外洩；此判定不保證任何歷史日誌都無敏感資訊。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 server/logger.ts:20
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另有 Express／CLI 分享日誌，需確認日誌權限與內容清洗
- Fortify 複掃與原平台人工分類
- 尚未逐筆做動態攻擊重現

**部署鏈及範圍依據**

- express：server/index.ts → db/index.ts → server/logger.ts
- kind：express-build-excluded-from-pages；evidenceRefs：expressCompile；expressDev；expressStart；pagesUpload

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-233｜Low｜誤判候選待審查｜server/logger.ts:20</summary>

- 原 PDF 頁：164；Issue Details 起始頁：164。
- 原類別：System Information Leak: Internal。
- 原 sink：~JS_Generic.log()。
- 原資料流來源：relativeFile：server/cache.ts；line：6；pdfPage：164。
- 當下來源：`server/logger.ts`；現行行號：20。
- 當下來源 SHA-256：`e3ef68ee61234e875b29270d33270065643dcd39b71a4d979a1f2dd5deb53607`（工作樹實際 bytes）。
- 部署範圍：Express 來源，未隨 Pages 產物部署。

**原因**

維護工具的進度／失敗訊息或後端受限日誌，尚未找到此筆資料直接回傳公開頁面的路徑。保留診斷，不把 stdout／console 本身當秘密外洩；此判定不保證任何歷史日誌都無敏感資訊。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 server/logger.ts:20
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另有 Express／CLI 分享日誌，需確認日誌權限與內容清洗
- Fortify 複掃與原平台人工分類
- 尚未逐筆做動態攻擊重現

**部署鏈及範圍依據**

- express：server/index.ts → db/index.ts → server/logger.ts
- kind：express-build-excluded-from-pages；evidenceRefs：expressCompile；expressDev；expressStart；pagesUpload

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-234｜Low｜誤判候選待審查｜server/vite.ts:21</summary>

- 原 PDF 頁：165；Issue Details 起始頁：164。
- 原類別：System Information Leak: Internal。
- 原 sink：~JS_Generic.log()。
- 原資料流來源：relativeFile：server/index.ts；line：255；pdfPage：165。
- 當下來源：`server/vite.ts`；現行行號：21。
- 當下來源 SHA-256：`854bc4d1563d16c7544a2001f04c8e1e7ea7770a7e0e3b4cd870a3b207c0bd6e`（工作樹實際 bytes）。
- 部署範圍：Express 來源，未隨 Pages 產物部署。

**原因**

維護工具的進度／失敗訊息或後端受限日誌，尚未找到此筆資料直接回傳公開頁面的路徑。保留診斷，不把 stdout／console 本身當秘密外洩；此判定不保證任何歷史日誌都無敏感資訊。

**證據**

- 逐筆對應 inventory internalReviewId；不是 Fortify 原始弱點 ID
- 現行原碼 server/vite.ts:21
- .github/workflows/deploy-pages.yml：Pages 只發布 dist/public
- functions/tsconfig.json 與 Firebase functions source：不包含 server/db/scripts 的 Express 或 CLI 執行入口

**測試／既有階段記錄**

- 來源未附逐筆測試項目；不等同測試未執行。

**仍待驗證**

- 若另有 Express／CLI 分享日誌，需確認日誌權限與內容清洗
- Fortify 複掃與原平台人工分類
- 尚未逐筆做動態攻擊重現

**部署鏈及範圍依據**

- express：server/index.ts → server/vite.ts
- kind：express-build-excluded-from-pages；evidenceRefs：expressCompile；expressDev；expressStart；pagesUpload

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-235｜Low｜已加固待複掃｜scripts/generate-100-celebration-og.mjs:550</summary>

- 原 PDF 頁：167；Issue Details 起始頁：166。
- 原類別：Weak Cryptographic Hash。
- 原 sink：FunctionPointerCall: createHash。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-100-celebration-og.mjs`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`e993f159f25b73c30d67000290f43df5bb54e9977252553398c6b9a6ab40c159`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

原 MD5 只用來產生內容快取檔名，沒有安全驗證用途；低風險改為 SHA256 截短16個hex字元，清理regex同時接受舊8碼與新16碼。現有圖片與資料未重新生成或刪除。

**證據**

- relativeFile：scripts/generate-100-celebration-og.mjs；line：550；purpose：SHA256 內容識別碼截短16碼。
- relativeFile：scripts/generate-100-celebration-og.mjs；line：556；purpose：原清理規則兼容舊8碼與新16碼。

**測試／既有階段記錄**

- command：node --test scripts/lib/build-fortify-safety.test.mjs；result：passed；scope：執行三份實際 digest/regex片段：同內容同hash、不同內容不同hash、舊/新命名相容，未執行圖片生成。

**仍待驗證**

- 尚未使用同一版本重新執行 Fortify，不能宣稱掃描告警已消失。
- 下一次正式 build 的 PNG/HTML/OG 引用需正式驗收；目前 sync-meta-from-stats regex接受任意長度hex引用。

**部署鏈及範圍依據**

- ci：scripts/generate-100-celebration-og.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/generate-100-celebration-og.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-236｜Low｜已加固待複掃｜scripts/generate-home-og-heatmap.mjs:445</summary>

- 原 PDF 頁：167；Issue Details 起始頁：167。
- 原類別：Weak Cryptographic Hash。
- 原 sink：FunctionPointerCall: createHash。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-home-og-heatmap.mjs`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`e5a15af3aaab3f2903d9752b7c7c7f1d7c63b3dbee7238ce70105ae8dfb0b4ab`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

原 MD5 只用來產生內容快取檔名，沒有安全驗證用途；低風險改為 SHA256 截短16個hex字元，清理regex同時接受舊8碼與新16碼。現有圖片與資料未重新生成或刪除。

**證據**

- relativeFile：scripts/generate-home-og-heatmap.mjs；line：445；purpose：SHA256 內容識別碼截短16碼。
- relativeFile：scripts/generate-home-og-heatmap.mjs；line：451；purpose：原清理規則兼容舊8碼與新16碼。

**測試／既有階段記錄**

- command：node --test scripts/lib/build-fortify-safety.test.mjs；result：passed；scope：執行三份實際 digest/regex片段：同內容同hash、不同內容不同hash、舊/新命名相容，未執行圖片生成。

**仍待驗證**

- 尚未使用同一版本重新執行 Fortify，不能宣稱掃描告警已消失。
- 下一次正式 build 的 PNG/HTML/OG 引用需正式驗收；目前 sync-meta-from-stats regex接受任意長度hex引用。

**部署鏈及範圍依據**

- ci：scripts/generate-home-og-heatmap.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/generate-home-og-heatmap.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

<details>
<summary>LOCAL-FORTIFY-237-237｜Low｜已加固待複掃｜scripts/generate-home-og.mjs:385</summary>

- 原 PDF 頁：167；Issue Details 起始頁：167。
- 原類別：Weak Cryptographic Hash。
- 原 sink：FunctionPointerCall: createHash。
- 原資料流來源：報告未提供可定位的資料流來源。
- 當下來源：`scripts/generate-home-og.mjs`；現行行號：來源未提供新精確行號。
- 當下來源 SHA-256：`8250bcd5b6df532d8eaafea0c87cb2b8a92ce26612256b5fe98012657a5bdfb5`（工作樹實際 bytes）。
- 部署範圍：CI 建置程序。

**原因**

原 MD5 只用來產生內容快取檔名，沒有安全驗證用途；低風險改為 SHA256 截短16個hex字元，清理regex同時接受舊8碼與新16碼。現有圖片與資料未重新生成或刪除。

**證據**

- relativeFile：scripts/generate-home-og.mjs；line：385；purpose：SHA256 內容識別碼截短16碼。
- relativeFile：scripts/generate-home-og.mjs；line：391；purpose：原清理規則兼容舊8碼與新16碼。

**測試／既有階段記錄**

- command：node --test scripts/lib/build-fortify-safety.test.mjs；result：passed；scope：執行三份實際 digest/regex片段：同內容同hash、不同內容不同hash、舊/新命名相容，未執行圖片生成。

**仍待驗證**

- 尚未使用同一版本重新執行 Fortify，不能宣稱掃描告警已消失。
- 下一次正式 build 的 PNG/HTML/OG 引用需正式驗收；目前 sync-meta-from-stats regex接受任意長度hex引用。

**部署鏈及範圍依據**

- ci：scripts/generate-home-og.mjs
- CI：.github/workflows/deploy-pages.yml／Build／build；scripts/generate-home-og.mjs

Fortify 平台：未查證；本次未回填或結案。本輪發布：未以此報告確認。

</details>

## 給大人看的重點

目前完成的是 237 筆來源審查、定位與交付檔案。主線後續仍須完成 CI、受影響 Firebase 函式與 Pages 發布，核對正式資產；最後以同版本 Fortify 複掃及原平台逐筆回填確認是否結案。

另外的 Google Chat 動態卡片與連結保護放在 JSON 的 `additionalFindingsNotInOriginal237`，不灌入原始 237 筆。

主線最後覆核：通知純文字邊界、缺少健康檢查結果時回報 unknown、SW 清洗後堆疊保留均已核對；本機安全邊界測試 16 筆通過。JSON 來源 SHA-256 已刷新，CSV 與原始報告位置保留歷史定位。
