// 新增工具 #143：字戰星河（2026-11-27）
// 只寫 server/data/tools.json（單一來源），client 端由 sync-tools-json 產生
import { readFileSync, writeFileSync } from 'node:fs';

const p = 'server/data/tools.json';
const tools = JSON.parse(readFileSync(p, 'utf-8'));

const tool = {
  id: 143,
  title: '字戰星河｜全漢字橫向捲軸射擊遊戲',
  description:
    '敵機、子彈、爆炸全都是漢字的橫向捲軸射擊遊戲：駕駛「勇」「剛」「疾」戰機穿越八大星域，用「狙」追蹤雷射、「捕」收編敵機當副機，圖鑑收錄 78 種敵機字。免安裝，電腦、平板、手機都能玩。',
  detailedDescription: `《字戰星河》是一款「整個畫面都是漢字」的橫向捲軸射擊遊戲：自己的戰機是字、射出去的子彈是「星」、敵人射來的是「刃」，連爆炸都是一個個字。打開網址就能玩，不用註冊、不用安裝。

## 玩法

- **三架戰機**：「勇」平衡型、「剛」高火力型、「疾」高速機敏；標題的「河」字藏著第四架隱藏機「曜」。
- **八大星域**：都城、樹海、冥府、深海、天空、熔岩、星海、根源，每一幕結尾有頭目，例如機甲堡壘「壘」、森林古神「榕」、幽冥判官「判」，最後是魔王「源」。可以從任一幕出發。
- **「狙」追蹤雷射**：按住右鍵（或 V）停下來展開「狙」鎖定附近敵機，放開就射出，發射時有短暫無敵時間。
- **「捕」收編副機**：發射「捕」抓住敵機，讓它變成跟著自己的副機；再按一次就讓副機自爆清場。不同的字當副機時，位置和射擊方式都不一樣（有的貼身擋子彈、有的在前方當盾牌）。
- **三種難度**：簡單（4 條命、子彈較慢）、普通、困難（2 條命、子彈較快）。
- **捕獲圖鑑**：收錄八幕 78 種敵機，每個字都寫著它的移動方式、攻擊方式，以及能不能捕獲；抓過的字會自動記下來。

## 字會照字義「演戲」

每個字都有自己的小動作：「梟」「蝠」會拍翅膀、偶爾滑翔，「葉」「花」左右翻飛，「蛇」「魚」扭動身體，「魂」「影」忽隱忽現，「喜」開心蹦跳、「哀」垂頭喪氣、「懼」一直發抖。動作只改變畫出來的樣子，不影響碰撞判定與難度。

## 裝置與操作

- 電腦：滑鼠或方向鍵／WASD 移動，快捷鍵 B 捕獲／自爆、I 圖鑑、T 換字型（粗黑、明體、楷體、圓體）、F 自動連射、P 暫停、M 全螢幕。寬螢幕會自動改成「戰況｜戰場｜控制台」三欄。
- 平板與手機：手指拖曳移動、預設自動連射，畫面上有「狙」「捕」按鈕；手機直拿時會提示轉成橫向。切到別的分頁會自動暫停。

## 技術與隱私

單一 HTML 檔的 Canvas 遊戲，固定每秒 60 步更新，部署在 GitHub Pages，可加到主畫面（PWA），有新版本時會跳出「重新整理」提示。**不呼叫任何 AI 模型、不需要帳號**；最高分與圖鑑紀錄只存在這台裝置的瀏覽器裡，不上傳。關卡與配字為原創，頁尾附有向全漢字射擊遊戲先驅致敬的說明。`,
  url: 'https://cagoooo.github.io/zizhan-xinghe/',
  icon: 'Gamepad2',
  category: 'games',
  previewUrl: '/previews/tool_143.webp',
  ogPreviewUrl: '/previews/og/tool_143.webp',
  tags: [
    '漢字',
    '射擊遊戲',
    '橫向捲軸',
    '文字遊戲',
    '認字',
    '捕獲圖鑑',
    '免安裝',
    'PWA',
    '平板手機可玩',
    'Canvas 遊戲',
    '下課獎勵',
  ],
  audienceFit: {
    audiences: ['teacher', 'student'],
    schoolLevels: ['elementary', 'junior'],
    teacherRoles: ['homeroom', 'subject'],
    painPoints: ['classroom-management', 'creative-learning', 'language-learning', 'digital-literacy'],
    priority: 80,
    reasons: {
      teacher:
        '一款敵機、子彈、爆炸全都是漢字的射擊遊戲，打開網址就能玩、不用帳號也不呼叫 AI。圖鑑收錄 78 種敵機字，每個字的動作都照字義設計（鳥會拍翅、魂會忽隱忽現），適合當課間獎勵，也能順勢聊「這個字為什麼這樣動」。',
      student:
        '駕駛「勇」「剛」「疾」三架文字戰機闖八大星域，用「狙」鎖定敵人、用「捕」把敵機抓來當副機，挑戰各幕頭目「壘」「榕」「判」到最終魔王「源」；還能找出藏在標題裡的隱藏機。',
      homeroom:
        '全班達標或下課十分鐘的獎勵時間可以投影一起玩，簡單難度有 4 條命，程度不同的孩子都進得去；切換分頁會自動暫停，老師要收心時很好停。',
      subject:
        '國語文老師可以拿圖鑑裡的字做延伸：哪些字是動物、哪些是情緒，為什麼「哀」會低頭、「懼」會發抖；資訊老師則可以把它當單檔 HTML Canvas 遊戲的範例，對照固定步長更新、PWA 與響應式版面。',
    },
  },
  addedAt: new Date().toISOString(),
};

if (tools.some((t) => t.id === tool.id)) {
  console.error(`#${tool.id} 已存在，略過`);
  process.exit(1);
}
const insertIdx = tools.findIndex((t) => t.id > tool.id);
if (insertIdx === -1) tools.push(tool);
else tools.splice(insertIdx, 0, tool);
writeFileSync(p, JSON.stringify(tools, null, 2) + '\n', 'utf-8');
console.log(`已新增 #${tool.id} ${tool.title}，共 ${tools.length} 筆`);
