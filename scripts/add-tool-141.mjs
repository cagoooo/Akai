// 新增工具 #141 iPad 電量監控站（2026-11-26）
// 只寫 server/data/tools.json（單一來源），client 端由 sync-tools-json 產生
import { readFileSync, writeFileSync } from 'node:fs';

const p = 'server/data/tools.json';
const tools = JSON.parse(readFileSync(p, 'utf-8'));
if (tools.some((t) => t.id === 141)) {
  console.log('#141 已存在，略過');
  process.exit(0);
}

const tool = {
  id: 141,
  title: 'iPad 電量監控站｜Jamf 充電車自動巡查',
  description:
    '石門國小資訊組自製的 iPad 電量監控網頁：每 15 分鐘自動從 Jamf Pro 讀取全校平板電量，找出半夜沒充飽、連續低電量的平板，充電車格子圖一眼看出哪一格的充電線要檢查，新問題推播到 Google Chat；已開源，各校改設定檔就能套用。',
  detailedDescription: `學生借平板才發現沒電，多半是充電線沒插好或壞了。以前要每天登入 Jamf 一台一台查，這個監控站把查電量這件事自動化：打開網頁就知道今天要去檢查哪幾台。

## 自動巡查

- **每 15 分鐘自動讀取**：系統自動登入 Jamf Pro，讀取全校 iPad 的電量與回報時間，不用再手動登入。
- **每小時請平板主動回報一次**（選用）：送出「更新清查」指令，有開機又連上 Wi-Fi 的平板幾分鐘內就會回報最新電量。關機或沒連網的平板回報不了，所以每台都會標示「多久前回報」。

## 怎樣算有問題

- **電量危險／偏低**：低於 20%、20～49%。
- **半夜沒充飽**：學生車的平板在 0:00～7:30 回報時不到 80%，而且之後沒有回升。
- **連續低電量**：連續兩次回報（相隔 2 小時以上）都低於 50%，而且沒有回升。
- **很久沒回報**：超過 3 天沒回報，畫面上的電量是舊的，另外列一區提醒去找出來開機。
- 這些門檻都可以在設定檔裡改。

## 網頁上看得到什麼

- **今天要去檢查的平板**：學生機的問題清單，檢查完可以打勾，平板回報新電量後自動取消；也能一鍵複製清單貼到 LINE。
- **充電車總覽**：依充電車排成格子圖，一格就是車上的一個位置，顏色代表電量，有問題的格子會加框。
- **每台的電量變化**：點一格就看到最近 14 天的電量變化圖，和檢查充電線的建議。
- **Google Chat 推播**（選用）：學生機出現新問題時推播到聊天室，同一台同一次回報只通知一次。

## 開源，各校都能套用

程式碼以 MIT 授權公開在 GitHub，也設成範本專案：其他學校按「Use this template」複製一份，把 Jamf 網址和帳號放進 GitHub 的 Secrets，改 config.json 裡的校名和分車規則，就有自己學校的監控站。說明文件寫了完整步驟，也建議在 Jamf 建唯讀的 API 帳號，不要直接用管理員密碼。

## 技術與隱私

用 GitHub Actions 讀 Jamf 資料、GitHub Pages 放網頁，再用 Google Apps Script 當每 15 分鐘的鬧鐘，不用架主機。網頁只顯示平板編號、使用者代號、機型、電量和回報時間，不顯示序號、網路位址等資訊，也不呼叫 AI 模型。網頁是公開的，所以平板名稱要用編號，不能用學生姓名。`,
  url: 'https://cagoooo.github.io/ipad-battery-monitor/',
  icon: 'LayoutDashboard',
  category: 'utilities',
  previewUrl: '/previews/tool_141.webp',
  ogPreviewUrl: '/previews/og/tool_141.webp',
  tags: [
    'iPad 管理',
    'Jamf Pro',
    '平板充電車',
    '電量監控',
    '充電線檢查',
    '資訊組',
    '設備管理',
    'Google Chat 推播',
    'GitHub Actions',
    '開源範本',
  ],
  audienceFit: {
    audiences: ['teacher'],
    teacherRoles: ['admin'],
    departments: ['academic', 'general-affairs', 'other'],
    painPoints: ['it-support', 'administration', 'teacher-workload'],
    priority: 60,
    reasons: {
      teacher:
        '學校有平板充電車、用 Jamf 管理 iPad 的老師，可以用它每天自動找出沒充到電的平板，不用等學生上課借用才發現沒電。',
      admin:
        '負責管理全校 iPad 的資訊或設備承辦，不用每天登入 Jamf 一台台查：網頁每 15 分鐘更新，半夜沒充飽、連續低電量的平板自動列成待檢查清單，還能推播到 Google Chat。',
      academic:
        '教務處資訊組管理全校平板時，可以用充電車格子圖一眼看出哪一車、哪一格的充電線要檢查；程式已開源，改設定檔就能套用到自己學校。',
      'general-affairs':
        '總務處設備組負責充電車與充電線時，可以靠「半夜沒充飽」「連續低電量」的標記，先找出最可能是充電線壞掉的那幾格，再去現場更換。',
    },
  },
  addedAt: new Date().toISOString(),
};

const insertIdx = tools.findIndex((t) => t.id > tool.id);
if (insertIdx === -1) tools.push(tool);
else tools.splice(insertIdx, 0, tool);
writeFileSync(p, JSON.stringify(tools, null, 2) + '\n', 'utf-8');
console.log('已新增 #141');
