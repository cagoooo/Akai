# 首次訪客身分導航與客群推薦系統設計

- 日期：2026-07-10
- 專案：阿凱老師的教育科技創新專區
- 狀態：設計已確認，等待規格審閱後進入實作計畫

## 1. 目標

讓第一次進入首頁的訪客用最少步驟說明身分，立即獲得能解決其日常痛點的工具推薦。系統同時以匿名加總方式整理客群與推薦成效，供 Admin 後台持續優化。

成功條件：

- 首次訪客能在 2～4 題內完成分類。
- 結果提供 4～6 個附有推薦理由的工具。
- 可直接開啟工具，或回首頁定位到對應拍立得卡片。
- 完成後同一瀏覽器不再自動詢問，仍可隨時重新選擇。
- 新工具卡片建立後，能依客群中繼資料自動進入適合的推薦結果。
- Admin 可查看匿名客群分布、流程漏斗與推薦點擊成效。

## 2. 互動流程

### 2.1 問答路徑

```text
歡迎頁
  ↓
身分：老師／學生或小朋友
  ├─ 學生或小朋友 → 推薦結果
  └─ 老師
       ↓
     學段：國小／國中／高中
       ↓
     職務：班級導師／科任或專任／行政人員
       ├─ 導師或科任 → 推薦結果
       └─ 行政人員
            ↓
          處室：教務／學務／總務／輔導／其他
            ↓
          推薦結果
```

學生或小朋友不再細分年齡。

### 2.2 顯示規則

- 僅在一般首頁入口首次自動顯示。
- 已完成設定者不再自動顯示。
- 「稍後再說」只抑制本次瀏覽，下次造訪仍會詢問。
- 帶搜尋、分類、收藏或許願池意圖的分享網址不自動打斷。
- 工具詳情、部落格與 Admin 路由不顯示。
- 首頁保留「我的身分：…／重新選擇」入口。

### 2.3 結果操作

- `立即使用`：追蹤推薦點擊後，以新分頁開啟工具。
- `在首頁查看`：關閉精靈、清除會遮蔽目標的篩選、捲動至目標卡片、短暫聚光並移入鍵盤焦點。
- 結果仍在載入工具資料時，顯示「正在把推薦釘上公佈欄」。
- 載入失敗時提供重試及「先看看全部工具」。

## 3. 視覺與 RWD

延續 E2 公佈欄設計，不建立另一套對話框語言：

- 全螢幕使用既有 `cork-bg` 軟木背景與柔和暗幕。
- 問題容器為便利貼，使用既有 `Pin`、`Tape`、紙張色與橄欖綠主色。
- 身分選項為小型拍立得；選取後呈現手作印章效果。
- 推薦結果使用迷你拍立得，沿用工具預覽圖、分類膠帶與圖釘色。
- 進度顯示為貼紙標籤，例如「第 2 張／共 3 張」。

手機優先驗收：

- 使用 `100dvh` 與 `env(safe-area-inset-*)`。
- 直向手機採單欄，內容區可獨立捲動。
- 操作按鈕至少 44px，正文至少 14px。
- 375×667 與 390×844 不可有水平溢出或底部遮擋。
- 小螢幕降低或取消拍立得傾斜。
- 支援焦點鎖定、螢幕閱讀器與 `prefers-reduced-motion`。
- 桌機內容最大寬度約 920px，不隨螢幕無限拉寬。

## 4. 客群資料模型

工具資料新增必要的客群中繼資料；推薦引擎不維護固定 ID 名單。

```ts
type AudienceType = 'teacher' | 'student';
type SchoolLevel = 'elementary' | 'junior' | 'senior';
type TeacherRole = 'homeroom' | 'subject' | 'admin';
type Department = 'academic' | 'student-affairs' | 'general-affairs' | 'counseling' | 'other';

interface AudienceFit {
  audiences: AudienceType[];
  schoolLevels?: SchoolLevel[]; // 省略代表不限學段
  teacherRoles?: TeacherRole[]; // 省略代表所有老師職務
  departments?: Department[];  // 僅行政限定時使用；省略代表不限處室
  painPoints: string[];
  priority: number;             // 0～100
  reasons: Partial<Record<AudienceType | TeacherRole | Department, string>>;
}
```

約束：

- 陣列空白與省略有明確語意，不使用容易矛盾的 `all + 個別值`。
- 一個工具可同時適用多個客群、學段、職務與處室。
- `reasons` 必須能產生符合當前身分的繁體中文推薦理由。
- 站內專屬、下架或無有效網址工具不得進入一般推薦。
- 既有工具需完成一次全面回填與推廣廣度審查。

## 5. 推薦策略

### 5.1 三層評分

1. 共通高價值：跨學段、跨職務的普遍需求。
2. 情境加權：依導師、科任、行政處室與痛點提高分數。
3. 學段加權：只有真正受學段限制的工具才限制或加權。

推薦 6 席的建議組成：

- 2 席共通高價值工具。
- 2 席精準職務／處室痛點工具。
- 1 席學段或特殊情境工具。
- 1 席探索型工具，讓合適的新工具或較少曝光工具有機會被看見。

同一工具不得因單一分類被鎖死。例如「會議記錄自動產出平台」適用所有學段的導師、科任及行政人員，只依身分改寫推薦理由與排序。

### 5.2 安全備援

- 先依 `AudienceFit` 篩選與評分。
- 缺少足量推薦時，以相符痛點、標籤及分類補位。
- 自動略過不存在、站內專屬或無有效網址的工具。
- 結果不得重複，至少維持 4 個有效項目；資料驗證目標為每個客群至少 6 個。

## 6. 新工具自動納入

新增 #117、#118 等工具時，建卡流水線必須同時建立 `audienceFit`：

1. 檢查目標網站、工具說明、功能與使用情境。
2. 產生多選的建議客群、學段、職務、處室、痛點與推薦理由。
3. 人工／代理程式檢查推廣廣度，避免過度限縮。
4. 將中繼資料同步寫入 client 與 server 的 `tools.json`。
5. 推薦引擎動態讀取，工具自動進入所有符合客群。
6. 驗證缺少客群資料、原因無效、範圍矛盾或沒有適用客群時直接失敗。

相關 `akai-new-tool-full-pipeline` 與 `source-command-card` Skills 必須將此列為不可省略的完成條件，並同步至三家工具的全域技能區。

## 7. 本機狀態

版本化儲存範例：

```ts
interface StoredAudienceProfile {
  version: 1;
  audience: AudienceType;
  schoolLevel?: SchoolLevel;
  teacherRole?: TeacherRole;
  department?: Department;
  completedAt: string;
}
```

- `localStorage` 保存完成資料，不包含姓名、學校或聯絡資訊。
- `sessionStorage` 保存本次「稍後再說」。
- 結構版本不相容時重新詢問。
- 儲存不可用時退回 React 記憶體狀態，主流程仍可使用。

## 8. 匿名分析與 Admin

### 8.1 事件

- `audience_wizard_impression`
- `audience_wizard_start`
- `audience_wizard_step`
- `audience_wizard_skip`
- `audience_wizard_complete`
- `audience_profile_change`
- `audience_recommendation_impression`
- `audience_recommendation_click`
- `audience_recommendation_locate`

### 8.2 寫入方式

- 由新的 callable Cloud Function 接收事件。
- 嚴格驗證事件名稱、列舉值、工具 ID 與字串長度。
- 後端以原子計數寫入全期與每日匿名加總文件。
- 一般訪客不可直接修改客群統計文件。
- 不保存姓名、學校、Email、IP、自由文字回答或逐筆問答紀錄。
- 統計失敗不得阻礙精靈、定位或工具開啟。

### 8.3 Admin 客群分頁

- 精靈曝光、開始、完成、略過、完成率及步驟流失。
- 老師／學生比例。
- 老師學段、職務與行政處室分布。
- 跨維度客群組合排名。
- 各客群推薦曝光、點擊與點擊率。
- 重新選擇身分次數。
- 7 天、30 天及自訂日期範圍。

## 9. 元件邊界

- `AudienceOnboardingWizard`：問答狀態機、焦點與全螢幕呈現。
- `AudienceRecommendationResults`：結果與操作。
- `AudienceProfileBadge`：首頁重新選擇入口。
- `audienceProfileStorage`：版本化本機狀態。
- `audienceRecommendation`：篩選、評分、組成與理由解析。
- `audienceAnalytics`：非阻塞事件上報。
- `AudienceAnalyticsPanel`：Admin 客群統計。
- `validate-audience-fit`：工具資料完整性與覆蓋範圍驗證。

## 10. 測試與驗收

- 單元測試涵蓋學生及所有老師學段、職務、處室路徑。
- 推薦測試確認每個客群至少 6 個有效工具、無重複、無站內專屬工具。
- 明確測試「會議記錄自動產出平台」涵蓋全部老師職務與行政人員。
- 驗證每個工具 ID、客群列舉、推薦理由與推廣廣度。
- Playwright 覆蓋 375×667、390×844、平板與桌機。
- 驗證安全區、捲動、無水平溢出、44px 觸控與減少動態效果。
- 驗證完成、略過、重新選擇、分享網址及許願池優先順序。
- 驗證工具載入失敗、Firebase 失敗與儲存不可用的降級行為。
- 驗證 Admin 加總、日期篩選與推薦 CTR。
- 建置前執行全 repo 檢查，不可誤寫「新明」。

## 11. 非本階段範圍

- 不蒐集姓名、學校、班級或聯絡資訊。
- 不以生成式 AI 在每次造訪即時決定推薦。
- 不把學生再細分年齡或學段。
- 不改寫既有工具的核心功能。
- 不以推薦系統取代搜尋、分類、收藏與排行榜。

## 12. 已確認的公版建卡提示詞

公版提示詞必須明確點名 `akai-new-tool-full-pipeline` 與 `source-command-card`，並包含：完整卡片資料、預覽圖、OG、客群中繼資料、跨客群檢查、自動納入推薦、手寫長文、衍生檔案、建置驗證、commit、push 與繁體中文回報。正式內容同步維護於 `source-command-card` Skill，作為單一真實來源。
