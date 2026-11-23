// 新增工具 #139：鱻魚特色學園 Minecraft 教育版課程網站（2026-11-23）
//   node scripts/add-tool-139.mjs   → 只寫 server/data/tools.json（單一來源），client 由 sync-tools-json 產生
import { readFileSync, writeFileSync } from 'node:fs';

const p = 'server/data/tools.json';
const tools = JSON.parse(readFileSync(p, 'utf-8'));
if (tools.some((t) => t.id === 139)) { console.log('#139 已存在，略過'); process.exit(0); }

const tool = {
  id: 139,
  title: '鱻魚特色學園｜Minecraft 教育版課程世界',
  description:
    '石門國小的 Minecraft 教育版課程：下載學生版世界檔，跟著關主阿凱老師在鱻魚學園闖關，再沿導航線走到石門水庫、三坑老街；沒裝 Minecraft 也能玩網頁闖關版、360° 導覽、生活減碳任務與魔王關，最後用通關碼印證書。',
  detailedDescription: `「鱻魚特色學園」是阿凱老師為桃園市龍潭區石門國民小學（鱻魚特色學園）做的 Minecraft 教育版課程，這個網站是整套課程的入口：學生版世界檔、匯入說明、3 節課教案、學習單，以及不用安裝 Minecraft 的網頁版關卡，都放在這裡。

## 遊戲世界：學園闖關＋石門地圖

- **4 站問答闖關**：紅、黃、綠、藍四站分別是語文（「鱻」是什麼字）、自然（魚的身體構造）、社會（家鄉石門水庫）、環境教育（愛護水中生物）。關主阿凱老師用預先做好的語音帶路，畫面下方隨時提示「目前任務」。
- **分年級**：找阿凱老師就能切換低、中、高年級；高年級換成進階題組。
- **石門地圖**：用 OpenStreetMap 開放地圖資料，以 1 格約 5 公尺縮小蓋出學校附近一帶，藍色導航線帶學生走到活魚一條街、十一份觀光文化園區、三坑老街、三坑自然生態公園、南苑生態公園和石門大壩 6 個景點打卡。
- **環境教育走讀與生活任務**：7 個走讀點用「站上答案地墊」作答；另有垃圾分類、隨手關燈、太陽能板、冷氣溫度、生態觀察、綠色交通等任務。
- **魔王關與徽章**（學生版 v1.3.0 起）：4 站闖關＋7 個走讀都完成後，石門大壩壩頂的「水庫守護者」開放挑戰：10 題、3 顆愛心，答錯會說明正確答案。全部共 8 枚徽章。
- **老師工具**：老師可以拿遙控器全班切換年級、廣播、看每位學生的進度。

## 網頁版：手機、平板、Chromebook 都能玩

- **網頁闖關版**：同樣 4 站、低中高三種難度，有阿凱老師語音。
- **360° 虛擬導覽**：在遊戲世界裡拍的環景，從學園大門一路到石門大壩，轉動畫面找答案。
- **生活減碳任務**與**魔王關**：和遊戲版同一套題目與 8 枚徽章。
- **通關證書**：遊戲和網頁都會給一組通關碼，到證書頁輸入就能印 A4 證書，列出完成的關卡和徽章；通關碼在瀏覽器裡就能解開，不需要帳號。

## 給老師與資訊組

網站附 3 節課教案與教師手冊、三份可列印學習單（闖關、環境教育走讀、生活任務）、電腦教室備課流程，以及資訊組逐台安裝檢查表。學生版世界檔要用 Minecraft 教育版開啟（需要學校的教育版帳號）：Windows 雙擊就能匯入；iPad 有匯入說明，但網站註明 iPad 版還沒有實機驗證。

## 資料與隱私

網站本身不呼叫 AI 模型。網頁版可以選擇登記「年、班、座號」，把闖關進度送到老師的 Google 試算表，不收姓名；按「先不登記」就完全不送資料。地圖資料 © OpenStreetMap 貢獻者（ODbL）；Minecraft 是 Mojang 的商標，本課程為學校教學用途，與 Mojang、Microsoft 沒有關聯。`,
  url: 'https://cagoooo.github.io/xianyu-minecraft/',
  icon: 'Map',
  category: 'teaching',
  previewUrl: '/previews/tool_139.webp',
  ogPreviewUrl: '/previews/og/tool_139.webp',
  tags: [
    'Minecraft 教育版',
    '遊戲式學習',
    '家鄉教育',
    '石門水庫',
    '環境教育',
    'NPC 闖關',
    '360° 導覽',
    '通關證書',
    '分年級題組',
    'OpenStreetMap',
    '學習單',
  ],
  audienceFit: {
    audiences: ['teacher', 'student'],
    schoolLevels: ['elementary'],
    teacherRoles: ['homeroom', 'subject', 'admin'],
    painPoints: ['lesson-planning', 'student-practice', 'creative-learning', 'digital-literacy', 'resource-discovery'],
    priority: 72,
    reasons: {
      teacher:
        '想用 Minecraft 教育版上家鄉與環境教育的國小老師，可以直接下載學生版世界檔，搭配網站上的 3 節課教案、學習單和教師手冊開課；沒有電腦教室時，網頁闖關版、360° 導覽也能在平板或 Chromebook 上完成。',
      student:
        '國小學生跟著關主阿凱老師的語音，在 Minecraft 裡闖 4 站、沿導航線走到石門水庫與三坑老街打卡，再挑戰 10 題 3 顆愛心的魔王關；完成後用通關碼印出列有 8 枚徽章的證書。',
      homeroom:
        '導師可以把它當成彈性課程或校本課程的單元：4 站題目涵蓋語文、自然、社會與環境教育，分低、中、高年級三種難度，學習單可以直接印給全班。',
      subject:
        '資訊、自然、社會與本土課程老師都用得上：資訊課教 Minecraft 操作與匯入，自然課看魚的身體構造與生態，社會課走讀石門水庫、十一份與三坑老街的地方故事。',
      admin:
        '資訊組在電腦教室開課前，可以照網站上的備課流程與逐台安裝檢查表準備（版本、匯入、還原卡排除路徑）；教學組規劃校本課程時，也能把教案與證書流程當成現成範例參考。',
    },
  },
  addedAt: new Date().toISOString(),
};

const i = tools.findIndex((t) => t.id > tool.id);
if (i === -1) tools.push(tool); else tools.splice(i, 0, tool);
writeFileSync(p, `${JSON.stringify(tools, null, 2)}\n`);
console.log(`已新增 #${tool.id}：${tool.title}（共 ${tools.length} 筆）`);
