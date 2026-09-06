/**
 * postsIndex.ts —— 自動產生，請勿手改。
 *
 * 來源：client/src/blog/posts.ts（唯一真相來源）
 * 產生：npx tsx scripts/gen-posts-index.ts
 * 校驗：prebuild 會跑 --check，posts.ts 改了卻沒重產索引就讓 build 失敗。
 *
 * 這裡只有中繼資料、沒有 body。首頁與工具卡只需要 slug / toolIds，
 * 讓長文正文不必進主 bundle（見 gen-posts-index.ts 檔頭說明）。
 */
import type { BlogPost } from './posts';

/** 手寫長文的中繼資料（BlogPost 去掉 body） */
export type BlogPostMeta = Omit<BlogPost, 'body'>;

export const POSTS_INDEX: BlogPostMeta[] = [
  {
    "slug": "deadzone-126-3d-tower-defense-energy-weapons",
    "title": "#126 DEADZONE 能量防線：把失敗放在策略上，孩子才會想再試一次",
    "excerpt": "#126 是一款直接在瀏覽器跑的 3D 塔防射擊：三種能量武器隨時切換、三種防禦塔各有分工、十波殭屍撲向能源核心。最關鍵的設計是角色不受傷害、敵人只攻核心——失敗回饋落在「這一波該把塔蓋在哪裡」，是能被討論、被修正、被下一局驗證的判斷，孩子因此願意再想一次。",
    "publishedAt": "2026-09-06",
    "readingMinutes": 6,
    "tags": [
      "3D塔防",
      "策略思考",
      "資源取捨",
      "Three.js",
      "資訊課素材"
    ],
    "toolIds": [
      126,
      120,
      102
    ],
    "coverEmoji": "🎮",
    "coverColor": "green"
  },
  {
    "slug": "teacher-union-125-membership-service-hub",
    "title": "#125 教師工會支會宣導站：把「今年會費到底怎麼繳」一次講完，不用再翻群組",
    "excerpt": "#125 桃園市教育產業工會石門國小支會的會員服務暨活動宣導站，把會費、續會禮、新進入會優惠與親子健行活動收進一頁。分「我是舊會員／我是新進老師」兩條入口，寫明本校採教師小組代收、財務長統一匯款，會員不必個別匯款，也不必自己去填官方表單。",
    "publishedAt": "2026-09-05",
    "readingMinutes": 5,
    "tags": [
      "教師工會",
      "會員服務",
      "活動宣導",
      "行政溝通",
      "校內公告"
    ],
    "toolIds": [
      125,
      62,
      74
    ],
    "coverEmoji": "👥",
    "coverColor": "blue"
  },
  {
    "slug": "ai-workshop-124-teaching-research-agent",
    "title": "#124 從 AI 教學與研究助理到 AI Agent：把一日工作坊變成可重複的實作路線",
    "excerpt": "#124 把上午 47 頁、下午 59 頁的 AI 工作坊整理成一條可以真的走完的路線：先建立教學與研究工作室，再練習資料治理、Agent Skills、部署與人工驗收，讓 AI 從聊天視窗變成可交付的工作夥伴。",
    "publishedAt": "2026-08-25",
    "readingMinutes": 6,
    "tags": [
      "AI教學",
      "AI研究",
      "AI Agent",
      "教師研習",
      "資料治理"
    ],
    "toolIds": [
      124,
      103,
      87
    ],
    "coverEmoji": "🤖",
    "coverColor": "blue"
  },
  {
    "slug": "web-migration-123-accessibility-aa-console",
    "title": "#123 校網無障礙 AA 遷移操作平台：把一本研習講義，變成 12 個能打勾的步驟",
    "excerpt": "#123 校網無障礙 AA 遷移操作平台，把「舊校網搬到教育局共構平台、拿到無障礙 AA 標章」這件沒人說得清楚的事，拆成 12 個由上往下、做完打勾就好的步驟：要貼的內容一鍵複製、進度自動記住，還內建對比度小工具與會讓你秒退件的四大雷區清單。",
    "publishedAt": "2026-08-06",
    "readingMinutes": 6,
    "tags": [
      "校網遷移",
      "無障礙AA",
      "網站標章",
      "資訊組長",
      "行政減負"
    ],
    "toolIds": [
      123,
      107,
      82
    ],
    "coverEmoji": "🎛️",
    "coverColor": "green"
  },
  {
    "slug": "word-wiz-kids-122-english-vocabulary-adventure",
    "title": "#122 兒童英語單字大冒險：拍一張課本照片，AI 幫你把整課單字變成全班對戰",
    "excerpt": "#122 兒童英語單字大冒險，用 Gemini 視覺 AI 拍照辨識課本單字、真人美音朗讀、Kahoot 風格全班 PIN 碼對戰，加上等級 EXP、連續打卡與 8 款成就徽章，把「背單字」變成孩子願意每天回來的冒險。",
    "publishedAt": "2026-07-28",
    "readingMinutes": 6,
    "tags": [
      "英語單字",
      "AI 辨識",
      "全班對戰",
      "遊戲化學習",
      "國小英語"
    ],
    "toolIds": [
      122,
      77,
      43
    ],
    "coverEmoji": "🪄",
    "coverColor": "purple"
  },
  {
    "slug": "ink-dragon-runner-121-cactus-escape",
    "title": "#121 仙人掌大逃亡：奔跑吧小墨龍！水墨風無盡跑酷，下課 10 分鐘的專注力極速挑戰",
    "excerpt": "#121 仙人掌大逃亡：奔跑吧小墨龍！全新東方水墨畫風網頁無盡跑酷遊戲，靈敏操控小墨龍跳躍與俯衝，穿梭千重仙人掌陣與飛鳥障礙，支援手機與電腦對決，下課 10 分鐘最佳班級專注力與舒壓挑戰。",
    "publishedAt": "2026-07-27",
    "readingMinutes": 5,
    "tags": [
      "跑酷遊戲",
      "水墨藝術",
      "課間活動",
      "專注力訓練",
      "網頁小遊戲"
    ],
    "toolIds": [
      121,
      120,
      115
    ],
    "coverEmoji": "🐉",
    "coverColor": "orange"
  },
  {
    "slug": "space-meteor-evasion-120-3d-quiz-adventure",
    "title": "#120 3D 星際雷霆解題大冒險：第一人稱飛船駕駛 × 太空戰術寶箱 × 跨學科知識智囊球，把課堂複習變成星際冒險！",
    "excerpt": "#120 讓學生化身星際艦長！駕駛第一人稱 3D 太空戰機，穿梭太陽系與隕石帶；在發射雷射與散彈砲衝破隕石陣的同時，捕捉發光問號智囊球解答太陽系、自然科學、AI 常識與密碼推理題庫，修復護盾登錄班級英雄榜！",
    "publishedAt": "2026-07-27",
    "readingMinutes": 5,
    "tags": [
      "3D遊戲",
      "星際雷霆",
      "太空解題",
      "遊戲化學習",
      "石門國小"
    ],
    "toolIds": [
      120,
      118,
      119
    ],
    "coverEmoji": "🚀",
    "coverColor": "purple"
  },
  {
    "slug": "sdgs-earth-guardian-119-energy-battle",
    "title": "#119 SDGs 不只背目標：在地球守護隊九大世界，把永續選擇真的做一遍",
    "excerpt": "回收、水資源、綠能、森林、食物、海洋與公平合作，孩子常能背出關鍵字，卻不一定知道怎麼選。#119 用九大世界任務、能量工具組裝與永續行動卡，讓 SDGs 變成一場能討論也能帶回生活的冒險。",
    "publishedAt": "2026-07-13",
    "readingMinutes": 6,
    "tags": [
      "SDGs",
      "永續教育",
      "環境教育",
      "探究學習",
      "遊戲化學習"
    ],
    "toolIds": [
      119,
      29,
      11
    ],
    "coverEmoji": "🌍",
    "coverColor": "green"
  },
  {
    "slug": "it-quiz-battle-118-cockpit-knowledge-battle",
    "title": "#118 資訊課複習不用再發一張題目紙：讓孩子在答題快打裡用正確觀念守護校園網路",
    "excerpt": "網路安全、程式思維、數位公民，講完不等於記住。#118 把資訊素養題目放進駕駛艙對戰：選職能角色、答題發動技能、即時看解析；能單挑 AI、同桌雙人，也能投影成全班的觀念討論。",
    "publishedAt": "2026-07-13",
    "readingMinutes": 6,
    "tags": [
      "資訊教育",
      "網路安全",
      "程式思維",
      "數位公民",
      "遊戲化學習"
    ],
    "toolIds": [
      118,
      108,
      11
    ],
    "coverEmoji": "⚡",
    "coverColor": "blue"
  },
  {
    "slug": "substitute-117-online-class-swap",
    "title": "#117 石門國小線上調代課系統：從紙本喬課到點兩下媒合，把教學組最累的行政流水線搬上線",
    "excerpt": "老師臨時請假，過去要跑辦公室一間間問誰能代、手寫調代課單、再讓教學組結鐘點費。#117 把這條流水線整條搬上線：點課表節次就智慧媒合、一鍵同意、A5 三聯單一鍵印、鐘點費自動結算。",
    "publishedAt": "2026-07-11",
    "readingMinutes": 6,
    "tags": [
      "線上調代課",
      "校園行政",
      "教務系統",
      "Google Apps Script",
      "石門國小"
    ],
    "toolIds": [
      117,
      2,
      46
    ],
    "coverEmoji": "🗓️",
    "coverColor": "green"
  },
  {
    "slug": "exam-format-116-auto-proofreading",
    "title": "#116 考卷格式自動校正系統：出題完成後，老師最需要的其實是「列印前最後一雙眼睛」",
    "excerpt": "考卷題目寫完，不代表可以安心列印。題號跳號、選項沒對齊、答案區太擠、版面斷在奇怪的位置，常常都是印出來才發現。#116 考卷格式自動校正系統，就是把這些列印前的格式健檢自動化，讓老師不用再靠肉眼一頁一頁巡。",
    "publishedAt": "2026-07-09",
    "readingMinutes": 5,
    "tags": [
      "考卷格式",
      "自動校正",
      "試卷排版",
      "教師工具",
      "文件處理"
    ],
    "toolIds": [
      116,
      99,
      78
    ],
    "coverEmoji": "📝",
    "coverColor": "yellow"
  },
  {
    "slug": "math-beast-gym-115-arithmetic-battle",
    "title": "#115 把四則運算變成道館挑戰：萌獸數學道館的練習動機設計",
    "excerpt": "四則運算練習最難的不是出題，而是讓學生願意一題接一題做下去。#115 萌獸數學道館把加減乘除包裝成原創萌獸對戰，用 ATG 節奏、關主挑戰與即時回饋，讓練習變成一場全班都看得懂的數學冒險。",
    "publishedAt": "2026-07-02",
    "readingMinutes": 5,
    "tags": [
      "數學遊戲",
      "四則運算",
      "萌獸道館",
      "課堂闖關",
      "教育遊戲"
    ],
    "toolIds": [
      115,
      101,
      11
    ],
    "coverEmoji": "🧮",
    "coverColor": "green"
  },
  {
    "slug": "student-list-checker-114-roster-verification",
    "title": "#114 告別人工肉眼比對！學生名單校對平台的個資安全與智慧防呆防線",
    "excerpt": "每學期初核對幾百名學生名單，用肉眼看字形相似又容易出錯？#114 學生名單校對平台，雙欄智慧比對一秒揪出學號姓名錯漏，資料完全在本地處理，行政效率與個資安全雙贏！",
    "publishedAt": "2026-06-28",
    "readingMinutes": 5,
    "tags": [
      "名單校對",
      "學生名單",
      "行政效率",
      "名單核對",
      "防呆校對"
    ],
    "toolIds": [
      114,
      107,
      109
    ],
    "coverEmoji": "👥",
    "coverColor": "purple"
  },
  {
    "slug": "pagamo-license-113-school-enrollment",
    "title": "#113 告別 Excel 地獄！PaGamO 素養教材授權填報的行政數位轉型",
    "excerpt": "專為學校導師與行政開發的 PaGamO 授權填報工具，一鍵彙整班級名單，讓繁瑣的素養教材開通流程省時 90%！",
    "publishedAt": "2026-06-28",
    "readingMinutes": 5,
    "tags": [
      "PaGamO",
      "素養教材",
      "行政工具",
      "班級管理",
      "表單統計"
    ],
    "toolIds": [
      113,
      10,
      48
    ],
    "coverEmoji": "🔑",
    "coverColor": "blue"
  },
  {
    "slug": "pikachu-sky-adventure-112-flappy-bird-game",
    "title": "#112 皮卡丘天空大冒險：經典飛翔小鳥結合寶可夢，鍛鍊學生專注度與挫折容忍度",
    "excerpt": "下課十分鐘，學生圍在電腦前只能玩充滿廣告的雜亂網頁遊戲？#112 提供一個純前端、無廣告、隨開即玩的「皮卡丘天空大冒險」，結合經典的 Flappy Bird 玩法，在躲避綠色水管的飛行挑戰中，無痛訓練孩子的手眼協調力與專注度。",
    "publishedAt": "2026-06-22",
    "readingMinutes": 4,
    "tags": [
      "網頁遊戲",
      "班級活動",
      "專注力訓練",
      "點擊練習",
      "課堂破冰"
    ],
    "toolIds": [
      112,
      101,
      102
    ],
    "coverEmoji": "⚡",
    "coverColor": "yellow"
  },
  {
    "slug": "werewolf-championship-111-classroom-deduction-game",
    "title": "#111 狼人殺冠軍賽：把班級同樂變成一場有規則、有推理、有掌聲的口語表達競賽",
    "excerpt": "狼人殺最怕的不是學生太投入，而是規則講不清、節奏控不住、發言變成一團混戰。#111 把角色、流程、勝利條件與比賽提醒整理成一個可投影、可分享的冠軍賽規則頁，讓班級活動從「大家玩一下」升級成有主持、有推理、有團隊合作的互動賽事。",
    "publishedAt": "2026-06-17",
    "readingMinutes": 5,
    "tags": [
      "狼人殺",
      "班級活動",
      "口語表達",
      "邏輯推理",
      "桌遊化學習"
    ],
    "toolIds": [
      111,
      3,
      11
    ],
    "coverEmoji": "🐺",
    "coverColor": "orange"
  },
  {
    "slug": "photo-to-video-110-ai-event-recap-generator",
    "title": "#110 活動辦完，照片就躺在資料夾裡發霉？上傳照片，AI 幫你剪成一支有旁白有配樂的成果影片",
    "excerpt": "運動會、校外教學、創意實作課辦得精彩，幾十張照片拍回來卻只能丟成無聲的相片輪播——因為剪影片要想旁白、要配音、要上字幕、要選轉場，光想就累。#110 讓你只要上傳照片，多模態 AI 自動看懂每張照片在做什麼、編寫前後連貫的繁體中文旁白與字幕、配上微軟 Neural 人聲與背景音樂，一鍵錄製匯出相容 iPhone 的 MP4。純前端、金鑰只存你的瀏覽器，照片不外傳。",
    "publishedAt": "2026-06-17",
    "readingMinutes": 6,
    "tags": [
      "照片轉影片",
      "活動紀錄影片",
      "AI 自動剪輯",
      "多模態視覺辨識",
      "Neural 語音"
    ],
    "toolIds": [
      110,
      68,
      94
    ],
    "coverEmoji": "🎬",
    "coverColor": "purple"
  },
  {
    "slug": "digital-software-survey-109-firestore-needs-poll",
    "title": "#109 別再用 Excel 收軟體需求了：老師三分鐘勾選，全校前 5 名即時排好提報教育局",
    "excerpt": "每年學校要彙整老師的教學軟體採購需求，傳統做法是一張 Excel 在處室與 LINE 群組之間傳來傳去，誰填了誰漏了、同套軟體被重複填，承辦最後還要手動去重排名。#109 是石門國小教務處的線上實名填報系統：老師勾選統購與自主需求軟體，Firebase Firestore 即時統計、自動排出全校前 5 名提報教育局，已採購的軟體自動標免填，把「對 Excel」變成「看儀表板」。",
    "publishedAt": "2026-06-12",
    "readingMinutes": 6,
    "tags": [
      "軟體需求調查",
      "數位學習",
      "校務行政",
      "Firebase",
      "即時排行榜"
    ],
    "toolIds": [
      109,
      48,
      2
    ],
    "coverEmoji": "🛒",
    "coverColor": "orange"
  },
  {
    "slug": "security-squad-phishing-108-it-cockpit",
    "title": "#108 把反詐騙變成一場闖關：學生扮資安特攻隊，跟 AI 教官一封封揪出釣魚信",
    "excerpt": "資安宣導最怕變成「老師念一遍、學生左耳進右耳出」。#108 是阿凱老師做的資訊素養情境闖關：學生扮演「鱻盾資安特攻隊」資安新兵，跟 NotebookLM 的阿盾教官對話，一封封判斷訊息是安全還是釣魚、說出破綻、集滿 5 枚徽章晉升正式隊員。用「五看口訣」拆穿詐騙，一節課把防身術練進肌肉記憶。",
    "publishedAt": "2026-06-12",
    "readingMinutes": 6,
    "tags": [
      "資安教育",
      "反詐騙",
      "數位素養",
      "五看口訣",
      "NotebookLM"
    ],
    "toolIds": [
      108,
      63,
      97
    ],
    "coverEmoji": "🛡️",
    "coverColor": "blue"
  },
  {
    "slug": "edu-cloud-account-updater-107-openid-roster",
    "title": "#107 每學年初最磨人的雜事：上千個教育雲帳號，這次三步驟自動對齊",
    "excerpt": "每到新學年，承辦老師都要面對同一場惡夢：把全校教育雲帳號總表跟教育局新名冊重新對齊——誰轉走、誰轉進、誰升年級換了班級座號，一格一格手動圈、手動貼。#107 是阿凱老師為石門國小做的純前端工具：上傳舊帳密總表與教育局新名冊，自動比對轉入轉出、揪出末四碼撞號、跨學年保留帳密只更新座號，一鍵產出總表、異動清冊與新生通知單。全程在瀏覽器運算，個資一個 byte 都不上傳。",
    "publishedAt": "2026-06-12",
    "readingMinutes": 6,
    "tags": [
      "教育雲帳號",
      "校務行政",
      "末四碼撞號",
      "純前端處理",
      "個資不上傳"
    ],
    "toolIds": [
      107,
      72,
      2
    ],
    "coverEmoji": "🏫",
    "coverColor": "green"
  },
  {
    "slug": "graduation-103-shimen-wishwall-106",
    "title": "#106 石門國小第103屆畢業典禮：當家長的祝福，能在三秒內飛上禮堂大螢幕",
    "excerpt": "每年畢業季，家長最想說的話常常來不及說出口。#106 是石門國小阿凱老師為第103屆畢業典禮做的數位主場：掃 QR 留言、老師 LINE 一鍵審核，祝福三秒飛上禮堂大螢幕的星空投影，家長剛寫完抬頭就看到自己。一條 GAS + LINE 的零成本即時互動閉環。",
    "publishedAt": "2026-06-05",
    "readingMinutes": 6,
    "tags": [
      "畢業典禮",
      "即時祝福牆",
      "星空投影",
      "GAS 後端",
      "掃碼互動"
    ],
    "toolIds": [
      106,
      62,
      40
    ],
    "coverEmoji": "🎓",
    "coverColor": "blue"
  },
  {
    "slug": "taiwan-sovereign-ai-corpus-105-shimen-edu",
    "title": "#105 臺灣主權 AI 訓練語料庫 × 石門國小：把「國家拿去訓練 AI 的語料」變成孩子的教材",
    "excerpt": "數位發展部花十年、集 265 個機關蒐集了 6 億 tokens 的臺灣本土語料，本來是拿去餵 AI 模型的。#105 是石門國小阿凱老師把它「教育轉化」的共學站：九大主題、4,554 筆語料一鍵探索，每筆標課綱與來源，還能用自備的免費 Gemini 生成台語／客語學習單與繪本腳本。國家的語料，第一次真正走進國小教室。",
    "publishedAt": "2026-06-04",
    "readingMinutes": 6,
    "tags": [
      "臺灣主權 AI",
      "本土語料庫",
      "數位發展部",
      "台語客語",
      "課綱對應"
    ],
    "toolIds": [
      105,
      104,
      88
    ],
    "coverEmoji": "🗺️",
    "coverColor": "green"
  },
  {
    "slug": "twinkle-hub-104-taiwan-official-data-mcp",
    "title": "#104 台灣官方資料庫 Twinkle-Hub：讓 AI 助教「先查官方資料、再回答你」",
    "excerpt": "#104 介紹一座「資料橋」MCP 服務 Twinkle Hub：把國定假日、農曆節氣、簡繁轉換、郵遞區號、6.4 萬份國考考古題與政府開放資料接進 Claude 等 AI 助教，65 個現成工具，讓 AI 不再「憑記憶」答錯台灣在地問題。申請金鑰、一鍵安裝、重開即用，老師備課出題、學生查資料都更踏實。",
    "publishedAt": "2026-06-04",
    "readingMinutes": 6,
    "tags": [
      "台灣官方資料",
      "MCP 服務",
      "AI 助教",
      "國考考古題",
      "備課出題"
    ],
    "toolIds": [
      104,
      103,
      88
    ],
    "coverEmoji": "✨",
    "coverColor": "purple"
  },
  {
    "slug": "web-skill-dual-engine-103-playwright-webwright",
    "title": "#103 AI Agent 的 Web 技能雙引擎：一頁讀懂 Playwright 動手、Webwright 動腦",
    "excerpt": "#103 是阿凱寫給「聽過名詞、卻不知道差在哪」的人的一頁式科普頁：Playwright 是動手操作的引擎、Webwright 是動腦規劃的引擎，合起來才是完整的 Web Agent。用日記體 + 松鼠吉祥物 + 自動填表、公文歸檔的真實情境，把硬核技術講到國小老師也看得懂。",
    "publishedAt": "2026-06-04",
    "readingMinutes": 5,
    "tags": [
      "AI Agent",
      "Playwright",
      "Webwright",
      "網頁自動化",
      "科普解說"
    ],
    "toolIds": [
      103,
      81,
      78
    ],
    "coverEmoji": "🤖",
    "coverColor": "blue"
  },
  {
    "slug": "alien-invasion-102-defend-shihmen-space-shooter",
    "title": "#102 外星人入侵·保衛石門：復古太空射擊 × 全校排行榜 × 可離線的下課十分鐘",
    "excerpt": "#102 外星人入侵是阿凱寫給孩子的復古太空射擊遊戲：純 HTML5 Canvas 單檔零相依，三種難度、王關 Boss 母艦、火力道具與連擊加成，石門校徽開場、可加入主畫面當 App、離線也能玩，內建全校跨裝置排行榜，桌機鍵盤 + 手機觸控全支援。",
    "publishedAt": "2026-06-03",
    "readingMinutes": 5,
    "tags": [
      "太空射擊",
      "復古像素",
      "教育遊戲",
      "全校排行榜",
      "PWA 離線"
    ],
    "toolIds": [
      102,
      101,
      97
    ],
    "coverEmoji": "🚀",
    "coverColor": "purple"
  },
  {
    "slug": "maze-3d-101-first-person-orb-collection",
    "title": "#101 3D 迷宮冒險遊戲：第一人稱光球收集 × 紅怪閃避 × 全班排行榜，瀏覽器跑 3D 的下課十分鐘",
    "excerpt": "#101 3D 迷宮冒險遊戲是阿凱寫給孩子玩的第一人稱探索遊戲：React + Three.js 純瀏覽器跑 3D，收集藍色光球、躲避紅色巡守者、與時間賽跑，4 段難度 7×7 到 17×17 噩夢級，桌機 + iPad 觸控全支援，內建全班 / 全校排行榜。",
    "publishedAt": "2026-05-28",
    "readingMinutes": 5,
    "tags": [
      "3D 迷宮",
      "第一人稱",
      "Three.js",
      "教育遊戲",
      "排行榜"
    ],
    "toolIds": [
      101,
      50,
      97
    ],
    "coverEmoji": "🎮",
    "coverColor": "blue"
  },
  {
    "slug": "milestone-100-tools-achieved",
    "title": "🎉 100 工具達成：阿凱老師教育工具集兩年實驗筆記",
    "excerpt": "從 2024 年第 1 個工具到 2026 年 5 月 24 日的第 100 個 — 一位國小資訊老師的兩年實驗筆記。沒有融資、沒有團隊、沒有商業計畫，只有 5 大部署平台、7 大分類、99 篇手寫長文、和一個信念：把上課真的用得到的工具寫出來，免費送出去。",
    "publishedAt": "2026-05-24",
    "readingMinutes": 8,
    "tags": [
      "100 工具達成",
      "里程碑",
      "阿凱老師",
      "教育工具集",
      "開源教學工具",
      "石門國小",
      "開發筆記"
    ],
    "toolIds": [
      100,
      81,
      46,
      3
    ],
    "coverEmoji": "🎉",
    "coverColor": "orange"
  },
  {
    "slug": "cockpit-81-info-tech-class",
    "title": "#81 國小資訊科技教學駕駛艙：25 個駕駛艙 × 飛行儀表板入口，三到六年級完整資訊課程系統",
    "excerpt": "#81 不是「入口連結牆」— 是阿凱用 5 週手刻 84 個 commits、純 vanilla JS 蓋出來的「飛行員儀表板 + 25 個獨立駕駛艙」課程系統，每單元含 NotebookLM 投影片 + YouTube 自學影片 + Canvas 關卡 + 評量題 + 演講簡報模式。",
    "publishedAt": "2026-05-20",
    "readingMinutes": 6,
    "tags": [
      "資訊科技",
      "教學駕駛艙",
      "完整課程系統",
      "108 課綱",
      "PWA"
    ],
    "toolIds": [
      81,
      80,
      76
    ],
    "coverEmoji": "🛫",
    "coverColor": "blue"
  },
  {
    "slug": "venue-46-no-more-paper-form",
    "title": "#46 場地預約系統：禮堂只是招牌 — 骨子裡是 10 場地 × 學校節次 × LINE 三階段通知 × AI 衝突解析的中央調度系統",
    "excerpt": "#46 不是只預約禮堂 — 是 10 個場地（禮堂、智慧教室、電腦教室、森林小屋、4 台 IPAD 平板車、校史室）統一調度。學校節次制（非半小時格）+ 沒有審核流程（任何人直接預約 + deviceId Rate Limit）+ LINE Flex Message 三階段通知 + Gemini AI 智慧衝突解析 + Gmail 風 30 秒 Undo + AI 學期報告。v2.50.6 累積 50+ 版的真實生產級系統。",
    "publishedAt": "2026-05-20",
    "readingMinutes": 6,
    "tags": [
      "校園行政",
      "場地調度",
      "LINE Messaging",
      "Gemini AI",
      "無審核設計"
    ],
    "toolIds": [
      46,
      84,
      80
    ],
    "coverEmoji": "🏛️",
    "coverColor": "orange"
  },
  {
    "slug": "class-helper-10-daily-routine",
    "title": "#10 班級小管家：加扣分 × 抽籤 × 計時器 × 多班切換 × 考試監考的 53 模組單檔神器（沒有點名，純班級經營）",
    "excerpt": "#10 不是「點名 + 行政記錄」工具 — 是阿凱純手寫 53 個 JS 模組、242 KB 單檔 classnew.html 的班級經營系統。加扣分系統 + 抽籤分組 + 計時器 + 考試監考 + 學期封存 + 多班級切換，Firebase + localStorage + IndexedDB 三層儲存，跨裝置 Google 同步。v3.12.17 累計 12 keys 完整同步稽核、版本健康診斷面板與內建 WebView 自動逃脫防護。",
    "publishedAt": "2026-05-20",
    "readingMinutes": 7,
    "tags": [
      "班級經營",
      "加扣分",
      "導師工具",
      "多班級切換",
      "考試監考"
    ],
    "toolIds": [
      10,
      89,
      56
    ],
    "coverEmoji": "👨‍🏫",
    "coverColor": "green"
  },
  {
    "slug": "student-portfolio-68-handcraft-uploads",
    "title": "#68 學生手作作品集 v3.2：純 HTML 中繼導引頁 + 6 班 Drive 資料夾 + go.html 防手機 OS 攔截 Drive App 跳轉",
    "excerpt": "#68 不是自建上傳平台 — 是給石門國小**六年級**手作課的精緻 Google Drive 中繼導引頁。6 張班級卡（601~606）對應 6 個硬編碼 Drive folder ID，學生用 `@mail2.smes.tyc.edu.tw` 學校信箱登入 → 自動跳該班 Drive 資料夾。`go.html` 中繼頁專門解決「手機 OS 攔截 drive.google.com 跳 Drive App」的踩雷。",
    "publishedAt": "2026-05-20",
    "readingMinutes": 5,
    "tags": [
      "手作課",
      "六年級",
      "Google Drive",
      "Google Workspace",
      "中繼頁"
    ],
    "toolIds": [
      68,
      90,
      10
    ],
    "coverEmoji": "🎨",
    "coverColor": "pink"
  },
  {
    "slug": "live-vote-3-classroom-democracy",
    "title": "#3 學生即時投票：4 題型 + 4 碼房間代碼避混淆 + 匿名升級 Google + 投影專用頁 + 表情彈幕的真實架構",
    "excerpt": "#3 不只是「全班舉手投票」 — 是 4 種題型（單選 / 多選 / 是非 / 簡答 WordCloud）+ 4 碼房間代碼（字元集避開 0/O/1/I/L 給小學生）+ 匿名升級 Google 保留歷史題目 + 投影專用頁 /present/:id 含 QR 四檔大小 + confetti + 表情彈幕。Firestore onSnapshot + Cloud Functions 排程清理 + LINE Flex 通知管理員。",
    "publishedAt": "2026-05-20",
    "readingMinutes": 6,
    "tags": [
      "課堂互動",
      "即時投票",
      "Firestore onSnapshot",
      "匿名升級",
      "4 題型"
    ],
    "toolIds": [
      3,
      96,
      93
    ],
    "coverEmoji": "🗳️",
    "coverColor": "blue"
  },
  {
    "slug": "tool-100-gemini-embedding-build-log",
    "title": "#100 工具索引神器升級 AI build log：從 fuse.js 字面比對到 Gemini 語意搜尋",
    "excerpt": "工具索引神器（#100）原本用 fuse.js 字面比對 — 「水的三態」找不到「自然科實驗」。升級 Gemini Embedding 語意搜尋後，連「我想讓害羞學生敢開口」這類抽象描述都能找到對的工具。完整 build log + 架構設計分享。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 8,
    "tags": [
      "AI 整合",
      "Gemini Embedding",
      "#100 索引神器",
      "build log",
      "教師工具"
    ],
    "toolIds": [
      100
    ],
    "coverEmoji": "🧠",
    "coverColor": "purple"
  },
  {
    "slug": "repair-53-paperless-school-maintenance",
    "title": "#53 校園報修系統：點地圖 + Google Vision OCR 標教室 + LINE Flex Message 雙軌通知的全鏈路設計",
    "excerpt": "#53 不是「掃 QR Code 報修」那麼簡單。React 19 + Firebase 全家桶 + Google Vision API OCR 自動標教室 + LINE Messaging API Flex Message + 資訊組 / 事務組雙軌分流 + 離線報修 IndexedDB 暫存。版本到 v0.9.2 仍在演進。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 6,
    "tags": [
      "校園行政",
      "報修系統",
      "Google Vision",
      "LINE Messaging",
      "Firebase",
      "總務"
    ],
    "toolIds": [
      53,
      46,
      84
    ],
    "coverEmoji": "🛠️",
    "coverColor": "orange"
  },
  {
    "slug": "comment-7-ai-positive-language",
    "title": "#7 點石成金蜂：勾 450+ 成語標籤 → AI 同時生成 12 種風格段落 + 二階段微調 + 全校共享 API Key 的單向轉換神器",
    "excerpt": "#7 不是「直覺評語 → AI 優化」 — 真實流程是「老師從 450+ 成語詞庫勾學生特質標籤 → AI 把標籤串成段落」。12 種寫作風格同時並列生成（不是單一）、CommentAdjuster 二階段縮 / 擴 / 換說法 + 5 級語氣滑桿、全校共享 API Key（阿凱自掏腰包）、繁中強制條款源於 v2.6.2 簡體字事故。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 5,
    "tags": [
      "期末評語",
      "Gemini 2.5 Flash",
      "成語標籤",
      "12 種風格",
      "石門共享 Key"
    ],
    "toolIds": [
      7,
      23,
      89
    ],
    "coverEmoji": "✨",
    "coverColor": "yellow"
  },
  {
    "slug": "curriculum-88-ai-junior-high-review",
    "title": "#88 國中課程計畫 AI 審查：對應桃園市 0505 版審查文件 40+ 項次 × PDF.js 抽文字 × 6 道合規鐵則 × 🔍 / ✨ 雙模式 × LINE 通知",
    "excerpt": "#88 不是給教育局審查委員用的 — 是給校內備課老師「自我預審」避免被退件。上傳 PDF（PDF.js 抽文字）→ AI 比對教育局 0505 版審查文件 40+ 項次（0-1 到 7-11）→ 給 fix-box 修正建議。雙模式：🔍 審查 PDF / ✨ 產生合規計畫，6 道桃園市 115 國中合規鐵則寫進 system prompt。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 6,
    "tags": [
      "課程計畫",
      "PDF.js",
      "Gemini 2.5",
      "108 課綱",
      "教育局審查",
      "桃園市"
    ],
    "toolIds": [
      88,
      78,
      84
    ],
    "coverEmoji": "🔍",
    "coverColor": "blue"
  },
  {
    "slug": "speech-67-training-pro",
    "title": "#67 國語演說比賽訓練 Pro：107 題庫 + Web Speech 即時逐字稿 + Gemini 雷達圖評分 + 老師評分量表的單檔 5705 行神器",
    "excerpt": "#67 不是 EZPage 模板（description 誤導）— 是阿凱純手寫 5705 行 HTML / 322 KB 的演說訓練系統。107 道題目 × 7 大分類 + 雙階段計時器 + Web Speech API 即時逐字稿 + Gemini 2.5 雷達圖四維評分 + 老師現場評分量表，賽事流程完整數位化。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 6,
    "tags": [
      "國語演說",
      "語文競賽",
      "Gemini 評分",
      "Web Speech API",
      "比賽培訓"
    ],
    "toolIds": [
      67,
      25,
      95
    ],
    "coverEmoji": "🎤",
    "coverColor": "pink"
  },
  {
    "slug": "expense-voucher-72-auto-generator",
    "title": "#72 動支及黏存單自動產生系統：拖廠商報價 PDF → PDF.js 自動解析品項數量單價 → 填入學校官方制式 Excel 範本",
    "excerpt": "#72 不是「老師手鍵動支單」 — 是拖廠商報價 PDF → PDF.js 3.11 座標式擷取 + Tesseract.js OCR fallback → 自動填入石門國小現用 template.xlsx（含「預算內」「代收代辦」兩工作表）。教育部歲出政事別三碼代號內建，純瀏覽器零後端，PDF 不傳外部 server。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 6,
    "tags": [
      "行政效率",
      "PDF.js",
      "Tesseract OCR",
      "會計核銷",
      "石門國小客製"
    ],
    "toolIds": [
      72,
      2,
      84
    ],
    "coverEmoji": "🧾",
    "coverColor": "orange"
  },
  {
    "slug": "face-recognition-54-teacher-savior",
    "title": "#54 識生學坊：MediaPipe 離線臉部偵測 + Gemini Vision 記憶口訣 + 4 模式遊戲化特訓 + 班級攻略本兩階段比對",
    "excerpt": "#54「識生」= 認識學生，「學坊」= workshop 修練場。MediaPipe WebAssembly 端離線跑（不上傳第三方）+ Gemini Vision 自動產 3 個外觀特徵與口訣 + Combo 連擊 S+/S/A/B 評級 + 班級攻略本兩階段比對（fingerprint 粗篩 + Gemini 雙圖比對）。30 人班一次跑全套成本 NT$0.25-0.5，v3.14.0 活躍開發中。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 6,
    "tags": [
      "MediaPipe",
      "Gemini Vision",
      "記學生臉",
      "隱私離線",
      "遊戲化特訓"
    ],
    "toolIds": [
      54,
      49,
      89
    ],
    "coverEmoji": "👀",
    "coverColor": "green"
  },
  {
    "slug": "webslide-76-cross-device-presenter",
    "title": "#76 WebSlide 簡報播放器：阿凱早期用 Gemini 寫程式 + 嵌進 Google Sites 的隱藏自製神器（PDF.js + JSZip + jsPDF + 17 種電影級 3D 轉場）",
    "excerpt": "#76 完全是阿凱自製 — 用 Gemini 寫程式碼生成的單檔 HTML web app，800+ 行 JS/CSS 直接以 Embedded HTML 嵌進 Google Sites（早期還不熟 GitHub 的隱藏部署方式）。Tailwind + JSZip 3.10.1 + jsPDF 2.5.1 + PDF.js 3.11.174 + 17 種電影級 3D 轉場 + 雙 iframe 無閃爍翻頁 + 全螢幕 fallback + 左右 1/6 寬點擊翻頁。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 5,
    "tags": [
      "簡報工具",
      "Google Sites 嵌入",
      "PDF.js",
      "Gemini 寫程式",
      "公開課"
    ],
    "toolIds": [
      76,
      81,
      11
    ],
    "coverEmoji": "🖼️",
    "coverColor": "blue"
  },
  {
    "slug": "inspire-92-5w1h-pro-writing",
    "title": "#92 5W1H 靈感發射器 PRO（Aura）：6 格同時呈現 + Prompt 防 LLM 爛梗 + 6 種故事風格 + 名人堂的創意寫作神器",
    "excerpt": "#92 內部代號 Aura，不是分步引導工具 — 是 6 格（Who/What/When/Where/Why/How）同時呈現任意順序操作，Gemini 2.0 Flash 一鍵合成短篇故事 + 自動下標題。Prompt 明令禁止「外星人 / 時間旅行 / AI / 預言 / 神祇」這些 LLM 爛梗，逼 AI 挖日常微妙與職人題材。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 5,
    "tags": [
      "作文教學",
      "寫作引導",
      "5W1H",
      "語文教學",
      "國語課"
    ],
    "toolIds": [
      92,
      13,
      4
    ],
    "coverEmoji": "✍️",
    "coverColor": "yellow"
  },
  {
    "slug": "inventory-82-classroom-equipment",
    "title": "#82 設備盤點系統：iPhone 拍照 + Gemini 2.5 Vision 辨識 + 三大資產跨表自動路由 + Veyon 整合的 54.75 小時打造神器",
    "excerpt": "#82 不是「QR Code 掃描盤點」那麼簡單 — 是阿凱花 54.75 小時、跑 40+ 版本（v7.4.12）打造的真實校園資管系統。iPhone 拍照 + Gemini 2.5 Flash Vision 辨識財產編號 + Supabase 6 張表跨表路由 + 設備搬家自動偵測 + Veyon 150 台教室電腦設定 JSON 匯出。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 5,
    "tags": [
      "設備盤點",
      "資訊組",
      "財產管理",
      "QR Code",
      "校園行政"
    ],
    "toolIds": [
      82,
      47,
      48
    ],
    "coverEmoji": "📋",
    "coverColor": "purple"
  },
  {
    "slug": "grade-filter-73-find-students-need-help",
    "title": "#73 成績篩選系統：教務處挑前 X% 競賽選手 / 資優方案的全校工具（不是找退步學生！）",
    "excerpt": "#73 不是「找退步學生需要關心」 — 是教務處用來篩選「**前 X% 或前 N 名優秀學生**」挑校內競賽選手、資優方案候選人的工具。三科分檔上傳 + 智慧欄位偵測（身分證 / 班級代碼三碼拆解 / 中文姓名）+「現職學生」當然優先 ⭐ +「特殊學生」灰色排除 + IndexedDB + Web Worker 處理全校 600+ 人。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 6,
    "tags": [
      "成績篩選",
      "教務行政",
      "優等生挑選",
      "Excel 處理",
      "IndexedDB"
    ],
    "toolIds": [
      73,
      49,
      10
    ],
    "coverEmoji": "📊",
    "coverColor": "blue"
  },
  {
    "slug": "auto-schedule-51-curriculum-planner",
    "title": "#51 SMES AI 智慧排課 v2.12：遺傳演算法 GA v3.1 + 混合修復突變 + Smart Seed + BFS 鏈式衝突解的石門國小客製神器",
    "excerpt": "#51 不是 CSP 演算法 — 是「SMES AI 智慧排課系統 v2.12.0」用遺傳演算法 GA v3.1 + 混合修復突變（教師衝突修復 30% / 數學修復 17.5% / 國語修復 17.5% / 定向優化 21% / 隨機 14%）+ Smart Seed 種子 + BFS 鏈式衝突解。台灣國小規則寫死（週三下午全校停課、低年級只有週二全天）。127 單元測試 + 23 Firestore Rules 測試，CI 三 jobs。取代舊版 STC.EXE 桌機軟體。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 6,
    "tags": [
      "遺傳演算法",
      "教務排課",
      "台灣國小",
      "混合修復突變",
      "石門國小"
    ],
    "toolIds": [
      51,
      49,
      2
    ],
    "coverEmoji": "📅",
    "coverColor": "green"
  },
  {
    "slug": "teacher-reply-89-pro-parent-message",
    "title": "#89 教師回覆小幫手 Pro：親師訊息 1 分鐘草稿出爐，再也不怕家長半夜傳訊",
    "excerpt": "#89 不是「情緒溫度計 + 三種口吻」 — 真實是 12 種情境分類（老師手選，不是 AI 判斷）+ 單一回覆 + 四種微調按鈕（再溫和 / 再正式 / 縮短 / 加細節）+ 對話截圖辨識（Gemini multimodal）。Next.js 15.2 + Genkit 1.8 + Gemini 2.5 Flash + Cloudflare Turnstile，Firestore 不存使用者輸入或回覆（隱私意識強）。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 6,
    "tags": [
      "親師溝通",
      "Gemini 2.5 Flash",
      "12 種情境",
      "截圖辨識",
      "隱私零儲存"
    ],
    "toolIds": [
      89,
      16,
      10
    ],
    "coverEmoji": "💬",
    "coverColor": "pink"
  },
  {
    "slug": "native-language-83-class-grouping",
    "title": "#83 本土語分班配對系統 v2.6：升年級重編班「舊選修語別 → 新班級座號」映射 + Levenshtein 模糊比對 + 5 種語別 16 族 7 國",
    "excerpt": "#83 不是「分組演算法」 — 是處理「**升年級重新編班後，舊本土語選修資料怎麼映射到新班級**」的 Excel 解析配對工具。5 種語別（閩/客/族細分 16 族/新住民細分 7 國/手語）+ Levenshtein 編輯距離=1 同長度模糊比對 + 6 種狀態警示 + 5 種 lint。單檔 172 KB 純 vanilla JS，100% 本機運算，純 file:// 都能跑。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 6,
    "tags": [
      "本土語教學",
      "升級重編班",
      "Levenshtein",
      "16 族 7 國",
      "SheetJS"
    ],
    "toolIds": [
      83,
      51,
      49
    ],
    "coverEmoji": "🗣️",
    "coverColor": "purple"
  },
  {
    "slug": "classroom-interaction-11-easy",
    "title": "#11 剛好學 Akailao v3.8.9：九大互動模式 + 拍照 AI 出 PIRLS 題 + 老師自架 Firebase 資料自主的 Kahoot+Quizizz+Mentimeter 合體",
    "excerpt": "#11 不只是「投票 + 文字雲」 — 是九大互動模式（搶答 / 繪圖板 / 是非 / 選擇 / 問答 / 互評 / **PIRLS 閱讀招牌** / 排序 / 配對）合體 SaaS。234 KB 單檔 Akailao v3.8.9 + Gemini 2.5 Flash 拍課本自動出 PIRLS 題 + 每位老師自架 Firebase（資料自主）+ set.html 配置生成器（降門檻）。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 6,
    "tags": [
      "課堂互動",
      "Gemini 多模態",
      "PIRLS 出題",
      "Firebase 自架",
      "九大模式"
    ],
    "toolIds": [
      11,
      45,
      81
    ],
    "coverEmoji": "🎯",
    "coverColor": "orange"
  },
  {
    "slug": "pirls-87-questioncraft-rewrite",
    "title": "#87 PIRLS Pro QuestionCraft：把舊版 HTML 單檔砍掉重練成 Next.js + Cloud Functions 的閱讀素養出題神器",
    "excerpt": "#87 PIRLS QuestionCraft 是舊版 #4 PIRLS 的完全重寫版。Next.js 15 + Gemini 2.5 Flash + Firestore，月費 < 0.25 美金的 serverless 架構，PaGamO 題組批量上傳 + 學生 QR 即時作答 + 班級儀表板一條龍。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 6,
    "tags": [
      "PIRLS",
      "閱讀素養",
      "AI 出題",
      "PaGamO",
      "形成性評量"
    ],
    "toolIds": [
      87,
      4,
      12
    ],
    "coverEmoji": "📖",
    "coverColor": "blue"
  },
  {
    "slug": "words-79-sarcastic-dictionary",
    "title": "#79 漢語新解：不是字典，是 AI 用魯迅 + 王爾德口吻寫的「揭露真相版」國語延伸教材",
    "excerpt": "#79 漢語新解絕對不是查字典工具。輸入任何詞 → AI 用王爾德/魯迅/羅永浩三人格混合風格，給你一段 150 字諷刺式新解 + 水墨蓋章畫卷。國語延伸教學的批判思考神器。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 5,
    "tags": [
      "國語教學",
      "批判思考",
      "AI 創意寫作",
      "水墨設計",
      "SEL"
    ],
    "toolIds": [
      79,
      92,
      7
    ],
    "coverEmoji": "🖋️",
    "coverColor": "yellow"
  },
  {
    "slug": "mbti-97-campus-adventure-rpg",
    "title": "#97 MBTI 校園奇遇記：用 47 個 RPG 場景偷偷塞 SDG 多元議題的人格測驗",
    "excerpt": "#97 MBTI 校園奇遇記不是傳統勾選題 MBTI 測驗，是 47 個校園 RPG 場景 + 12 個多元背景 NPC（客家、新住民、同志家庭、原住民…）+ 16 個結局頁。一鍵 fork 模板讓其他學校 3 分鐘自架。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 6,
    "tags": [
      "MBTI",
      "校園 RPG",
      "多元議題",
      "SEL",
      "自我探索",
      "輔導課"
    ],
    "toolIds": [
      97,
      3,
      11
    ],
    "coverEmoji": "🎭",
    "coverColor": "purple"
  },
  {
    "slug": "music-cover-storyboard-94",
    "title": "#94 封面接故事：用 Gemini 2.5 把 MV 封面接成 8 種風格 25 秒分鏡，再用瀏覽器 ffmpeg.wasm 串成短片",
    "excerpt": "#94 封面接故事是給音樂課 / 視藝課 / 媒體素養課的 AI 創作教學駕駛艙。上傳 MV → 抓封面 → AI 接 4-6 段 5 秒分鏡 → 跳 8 大 AI 影片平台產畫面 → 瀏覽器內串成完整短片。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 6,
    "tags": [
      "AI 影片創作",
      "分鏡腳本",
      "媒體素養",
      "音樂課",
      "視覺藝術"
    ],
    "toolIds": [
      94,
      65,
      66
    ],
    "coverEmoji": "🎬",
    "coverColor": "pink"
  },
  {
    "slug": "song-41-akai-night-tape-magazine",
    "title": "#41 吉他點唱系統「阿凱彈唱之夜」：用 Firestore 即時投票 + 卡帶雜誌風大螢幕模式打造演出儀式感",
    "excerpt": "#41 不是教吉他課的工具，是阿凱老師的「彈唱之夜演出系統」。觀眾掃 QR 點歌 + Firestore 即時排行榜 + 雜誌風大螢幕模式 + 卡帶 SIDE A/B 期數收藏。一個老師把午休彈唱變成校園文化。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 5,
    "tags": [
      "吉他彈唱",
      "即時投票",
      "社團活動",
      "校園文化",
      "音樂教學"
    ],
    "toolIds": [
      41,
      3,
      11
    ],
    "coverEmoji": "🎸",
    "coverColor": "orange"
  },
  {
    "slug": "meeting-24-end-semester-record",
    "title": "#24 校務會議紀錄報告站：把石門國小 114 學年度期末會議「致詞 + 處室報告 + 自治市長 + 提案討論」做成單頁互動 SPA",
    "excerpt": "#24 真實名稱是「桃園市龍潭區石門國小 114 學年度上學期期末校務會議紀錄」— 用純 Tailwind + Noto Sans TC + Lucide 把整份會議紀錄做成 6 章節互動式 SPA，嵌進 Google Sites Embedded HTML。含張定貴校長致詞 / 家長會長致詞 / 自治市長潘宥睿致詞 / 教務處報告 / 學務處報告 / 提案討論 / 附件規約 / 下學期重要行事簡曆。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 5,
    "tags": [
      "校務會議",
      "紀錄報告",
      "Google Sites 嵌入",
      "石門國小",
      "互動式 SPA"
    ],
    "toolIds": [
      24,
      80,
      15
    ],
    "coverEmoji": "📝",
    "coverColor": "blue"
  },
  {
    "slug": "speech-25-training-class-entry",
    "title": "#25 國小國語演說特訓班（進階版）：Gemini 2.5 Flash + Lucide 的單檔入門練習工具（#67 Pro 版前身）",
    "excerpt": "#25 真實名稱「國小國語演說特訓班（進階版）」是阿凱早期版 — 用 Gemini 2.5 Flash + Lucide 做的 55KB 單檔 HTML，嵌進 Google Sites Embedded HTML。題庫 + 「儲存並關閉」+「隨機題庫」按鈕，是 #67 Pro 版（5705 行 + Web Speech + 雷達圖 + 老師評分量表）的前身入門版。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "國語演說",
      "Gemini 2.5 Flash",
      "入門版",
      "Google Sites 嵌入",
      "單檔 HTML"
    ],
    "toolIds": [
      25,
      67,
      95
    ],
    "coverEmoji": "🗣️",
    "coverColor": "pink"
  },
  {
    "slug": "multiplication-26-adventure",
    "title": "#26 九九乘法大冒險：Web Audio + Tailwind + Lucide 純前端遊戲化練習（無 LLM 也能做好工具）",
    "excerpt": "#26 真實名稱「九九乘法大冒險」是純前端遊戲化練習器 — Tailwind + Lucide + **Web Audio API**（OscillatorNode 合成音效）做的 25KB 單檔 HTML，嵌進 Google Sites。3 狀態反饋（答對了 / 哎呀答錯了 / 挑戰完成）+ 計分計時，**沒用 LLM** — 證明「好的教學工具不一定需要 AI」。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "九九乘法",
      "低年級數學",
      "Web Audio",
      "Google Sites 嵌入",
      "無 LLM 工具"
    ],
    "toolIds": [
      26,
      44,
      33
    ],
    "coverEmoji": "✖️",
    "coverColor": "yellow"
  },
  {
    "slug": "swissknife-27-tool-vault",
    "title": "#27 ⬅️好用小工具（許願池）：swissknife 13 個 Google Sites Embedded 工具總入口（含 7 個 Akai 尚未收錄的隱藏作品）",
    "excerpt": "#27 真實是 `sites.google.com/mail2.smes.tyc.edu.tw/swissknife/` — 阿凱所有「Gemini 寫 + Google Sites 嵌入」工具的總入口頁，共 13 個子頁工具。其中 6 個已在 Akai 100 個工具內（#5 #10 #25 #26 #44 #75 #76），**7 個是 Akai 尚未收錄的隱藏作品**（取餐叫號區 / 校園點餐後台 / 石小閱讀推動短影片 / Loilonote 題庫轉 Excel / HEIC 轉 JPG / TIFF 轉 PNG 等）。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 5,
    "tags": [
      "工具索引",
      "swissknife",
      "Google Sites",
      "許願池",
      "隱藏作品"
    ],
    "toolIds": [
      27,
      76,
      26
    ],
    "coverEmoji": "🧰",
    "coverColor": "orange"
  },
  {
    "slug": "math-adventure-44-grade-one",
    "title": "#44 快樂數學小冒險：國小一年級 4 關卡（10 以內加減 + 20 以內加減）+ canvas-confetti 撒花獎勵的純前端遊戲",
    "excerpt": "#44 真實名稱「快樂數學小冒險 | 國小一年級數學練習」是阿凱給**一年級**做的數學練習遊戲。4 個關卡（10 以內加法 / 10 以內減法 / 20 以內加法 / 20 以內減法）+ canvas-confetti 撒花獎勵 + 純 Tailwind + 26KB 單檔 HTML 嵌進 Google Sites。是 #26 九九乘法大冒險的低年級姊妹工具。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "一年級數學",
      "加減法",
      "canvas-confetti",
      "Google Sites 嵌入",
      "遊戲化練習"
    ],
    "toolIds": [
      44,
      26,
      33
    ],
    "coverEmoji": "➕",
    "coverColor": "green"
  },
  {
    "slug": "academic-49-treasure-trove",
    "title": "#49 教務處寶藏庫（academic 子站）：3 個子頁含 2026 英語歌唱比賽 G6 歌單 × 6 班 + 親職日配置 + 班級榮譽榜（含 1 個 Akai 隱藏作品）",
    "excerpt": "#49 真實是 `sites.google.com/mail2.smes.tyc.edu.tw/academic/` 教務處子站，含 3 個子頁：「2026 英語歌唱比賽網站」（G6 6 首歌 × 601-606 6 班 = 36 組合）、「2026 親職日場地配置」（即 Akai #74）、「班級榮譽榜名單調查」（Akai 尚未收錄的隱藏作品）。純 Tailwind 嵌進 Google Sites Embedded HTML。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "教務處",
      "英語歌唱比賽",
      "Google Sites 嵌入",
      "親職日",
      "隱藏作品"
    ],
    "toolIds": [
      49,
      74,
      80
    ],
    "coverEmoji": "📚",
    "coverColor": "purple"
  },
  {
    "slug": "parent-day-74-venue-map",
    "title": "#74 1150328 親職日場地配置互動網：戶外籃球場 + 教室活動區 + 攤位展區 + 4 tab 切換的 SPA 場地圖",
    "excerpt": "#74 真實標題「1150328 親職日場地配置互動網」（115/03/28 親職日專用）。Tailwind + Lucide 純前端 SPA，4 個 tab 切換（戶外班級區 / 1-3 年級教室區 / 攤位展區 / 其他區域），含戶外籃球場配置（4-6 年級與專區）+ 教室活動區（1-3 年級英語闖關）+ 攤位活動展區（石門國中升學輔導 / 性平教育展 / 家庭教育有獎徵答 / 星空計畫作品展示）。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "親職日",
      "場地配置",
      "互動式 SPA",
      "石門國小",
      "Google Sites 嵌入"
    ],
    "toolIds": [
      74,
      62,
      49
    ],
    "coverEmoji": "🗺️",
    "coverColor": "pink"
  },
  {
    "slug": "slide-extractor-75-video-pdf-images",
    "title": "#75 Slide Extractor 影片與 PDF 簡報擷取神器：PDF.js + jsPDF + JSZip + Firebase 設定流程的單檔擷取工具",
    "excerpt": "#75 真實名稱「Slide Extractor - 影片與 PDF 簡報擷取神器」— 兩大模式（影片轉圖片 / PDF 轉圖片），用 PDF.js 抓 PDF 每頁渲染成圖、JSZip 打包下載、jsPDF 重新匯出、Firebase 設定流程（立即設定 / 取消 / 儲存並連線）。37,748 字元單檔 HTML 嵌進 Google Sites Embedded HTML。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 5,
    "tags": [
      "檔案轉換",
      "PDF.js",
      "jsPDF",
      "JSZip",
      "影片擷取",
      "Google Sites 嵌入"
    ],
    "toolIds": [
      75,
      76,
      94
    ],
    "coverEmoji": "🎞️",
    "coverColor": "blue"
  },
  {
    "slug": "meeting-80-spring-semester-week13",
    "title": "#80 114 學年度下學期第 13 週教師會議互動平台：校長室 + 教務處（4 組長）+ 學務處（2 組長）的 SPA 會議報告",
    "excerpt": "#80 真實標題「石門國小 114 學年度下學期第 13 週教師會議互動平台」— 跟 #24（上學期期末）同款架構但內容是下學期週次會議。校長室 + 教務處（教務主任 + 註冊組長 / 六年級畢業考時程 + 設備組長 + 資訊組長）+ 學務處（訓育組長 + 衛生組長 / 語文競賽打掃與病媒蚊防制）。52KB 純 Tailwind 單檔嵌進 Google Sites。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "教師會議",
      "互動平台",
      "石門國小",
      "Google Sites 嵌入",
      "下學期"
    ],
    "toolIds": [
      80,
      24,
      15
    ],
    "coverEmoji": "📋",
    "coverColor": "green"
  },
  {
    "slug": "draw-17-creative-lottery",
    "title": "#17 創意抽籤系統：純前端 Tailwind + canvas-confetti 輸入名單一個一個抽 + 剩餘項目即時顯示（XOOPS VM 部署）",
    "excerpt": "#17 真實名稱「創意抽籤系統」是阿凱用 Gemini Canvas 寫的純前端 + Tailwind + canvas-confetti 抽籤工具，部署在 XOOPS 校網 VM。輸入名單後一個一個抽出（不是一次全抽），剩餘項目即時顯示，每抽中觸發 confetti 撒花，可複製結果 + 重新開始。footer 寫「桃園市石門國小 資訊組 阿凱老師 設計」。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "抽籤工具",
      "課堂活動",
      "XOOPS VM",
      "純前端",
      "canvas-confetti"
    ],
    "toolIds": [
      17,
      18,
      57
    ],
    "coverEmoji": "🎰",
    "coverColor": "orange"
  },
  {
    "slug": "student-pick-18-main-alternate",
    "title": "#18 繽紛隨機學生抽選工具：正取 + 備取名單一次出 + 可匯出結果（比賽選手 / 校隊選拔專用）",
    "excerpt": "#18 真實名稱「繽紛隨機學生抽選工具」是 #17 的進階版 — 不只抽一個，而是**一次抽出「正取人數 + 備取人數」雙清單**（給比賽選拔、校隊抽籤用）。純 vanilla JS（無 Tailwind）+ 可匯出結果，22KB 單檔部署 XOOPS VM。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "學生抽選",
      "比賽選拔",
      "正取備取",
      "XOOPS VM",
      "純 JS"
    ],
    "toolIds": [
      18,
      17,
      51
    ],
    "coverEmoji": "🎯",
    "coverColor": "pink"
  },
  {
    "slug": "typing-20-english-letters-falling",
    "title": "#20 英文字母打字練習遊戲：26 字母從上落下 + 手指提示 + 純前端 Tailwind 無 LLM 遊戲化練習",
    "excerpt": "#20 真實名稱「英文字母打字練習遊戲」— 26 個英文字母從上方落下，學生要在字母落到底部前正確按鍵。內建手指提示（標準鍵盤打字法），完成時間計分。純 Tailwind 單檔 HTML 18KB 部署 XOOPS VM。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "英打練習",
      "打字遊戲",
      "手指提示",
      "XOOPS VM",
      "純前端"
    ],
    "toolIds": [
      20,
      21,
      22
    ],
    "coverEmoji": "🇬🇧",
    "coverColor": "blue"
  },
  {
    "slug": "typing-21-zhuyin-keymap",
    "title": "#21 中文注音打字遊戲：完整 ㄅㄆㄇ→鍵盤鍵位對照 + 180 秒倒數 + 字元下落物理遊戲",
    "excerpt": "#21 真實名稱「中文注音打字遊戲」— 學生要在 180 秒內輸入正確的注音符號或對應按鍵來消滅從天而降的字元。內建完整 ㄅㄆㄇ → 鍵盤鍵位對照表（ㄅ→1 / ㄆ→q / ㄇ→a / ㄈ→z⋯）+ Tailwind + 純前端 26KB 單檔 XOOPS VM 部署。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "中打練習",
      "注音符號",
      "ㄅㄆㄇ",
      "XOOPS VM",
      "180 秒倒數"
    ],
    "toolIds": [
      21,
      20,
      22
    ],
    "coverEmoji": "🇹🇼",
    "coverColor": "green"
  },
  {
    "slug": "idiom-22-fill-blank-game",
    "title": "#22 成語填空遊戲：50 個國小程度成語 + 含成語意思教學 + 倒數計時挑戰",
    "excerpt": "#22 真實名稱「成語填空遊戲」— 內建 50 個國小程度成語，題目缺一個字學生要填入，每個成語都附「成語意思」教學（例：一心一意 = 形容專心致志毫無雜念）。Tailwind + 純前端單檔 26KB 部署 XOOPS VM。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "成語填空",
      "語文教學",
      "高年級",
      "XOOPS VM",
      "純前端"
    ],
    "toolIds": [
      22,
      21,
      71
    ],
    "coverEmoji": "📜",
    "coverColor": "purple"
  },
  {
    "slug": "mario-28-jump-platform",
    "title": "#28 瑪莉歐風格平台跳躍遊戲：純 Canvas 2D + requestAnimationFrame + AudioContext 音效 + 最高分紀錄",
    "excerpt": "#28 真實名稱「瑪莉歐風格平台跳躍遊戲」是阿凱用純 Canvas 2D（無框架）寫的橫向卷軸跳跳遊戲。方向鍵移動 + 空白鍵跳躍，AudioContext 合成音效，localStorage 存最高分。20KB 單檔部署 XOOPS VM。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "平台跳躍遊戲",
      "Canvas 2D",
      "XOOPS VM",
      "純前端",
      "橫向卷軸"
    ],
    "toolIds": [
      28,
      29,
      36
    ],
    "coverEmoji": "🍄",
    "coverColor": "orange"
  },
  {
    "slug": "solar-29-system-explorer",
    "title": "#29 太陽系探索者：Three.js 3D 渲染 + 滑鼠拖旋轉 + 模擬速度滑桿 + 內外太陽系三視角切換",
    "excerpt": "#29 真實名稱「太陽系探索者 🚀」— 阿凱用 **Three.js 3D 渲染**寫的太陽系互動模擬。拖曳滑鼠旋轉視角 + 滾輪縮放 + 點擊行星顯示資訊 + 模擬速度滑桿 + 顯示軌道 / 行星標籤開關 + 三種預設視角（總覽 / 內太陽系 / 外太陽系）。24KB 單檔部署 XOOPS VM。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 5,
    "tags": [
      "太陽系",
      "Three.js",
      "3D 視覺化",
      "自然科學",
      "XOOPS VM"
    ],
    "toolIds": [
      29,
      28,
      30
    ],
    "coverEmoji": "🪐",
    "coverColor": "blue"
  },
  {
    "slug": "games-30-collection-12-in-1",
    "title": "#30 遊戲集合：阿凱自製 12-in-1 校內小遊戲合集（含踩地雷、撲克、消除、貪吃蛇、井字、俄羅斯方塊⋯ 全部隱藏作品）",
    "excerpt": "#30 真實是「遊戲集合」索引頁 — 阿凱自製 **12 個小遊戲合集**：10x10 踩地雷 / 撲克牌比大小 / 彩色方塊消除 / 記憶配對 / 貪吃蛇 / 井字遊戲 / 彈跳球 / 數字華容道 / 捕鼠遊戲 / 俄羅斯方塊 / 彩色氣泡射擊 / 記憶翻牌。**這 12 個遊戲全部都是 Akai 沒收的隱藏作品**！",
    "publishedAt": "2026-05-21",
    "readingMinutes": 5,
    "tags": [
      "遊戲合集",
      "12 in 1",
      "XOOPS VM",
      "隱藏作品",
      "經典小遊戲"
    ],
    "toolIds": [
      30,
      28,
      36
    ],
    "coverEmoji": "🎮",
    "coverColor": "pink"
  },
  {
    "slug": "claw-31-machine-game",
    "title": "#31 改進得分機制的夾娃娃機遊戲（放大版）：Canvas 2D + 60 秒倒數 + 最高分紀錄",
    "excerpt": "#31 真實標題「改進得分機制的夾娃娃機遊戲 - 放大版」— 阿凱用純 Canvas 2D 寫的夾娃娃機模擬遊戲，60 秒倒數挑戰看誰夾最多娃娃，含分數 / 最高分 / 新最高分慶祝。14KB 單檔部署學校網域。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 3,
    "tags": [
      "夾娃娃機",
      "Canvas 2D",
      "60 秒挑戰",
      "XOOPS VM",
      "純前端"
    ],
    "toolIds": [
      31,
      28,
      30
    ],
    "coverEmoji": "🕹️",
    "coverColor": "yellow"
  },
  {
    "slug": "touch-32-bombbombbomb",
    "title": "#32 石門國小觸屏碰碰碰：AudioContext 音效 + Canvas 隨機浮動圖案的觸控互動遊戲",
    "excerpt": "#32 真實標題「**石門國小觸屏碰碰碰！**」是阿凱專為石門國小觸控螢幕設計的小遊戲 — 觸碰畫面就會獲得隨機浮動圖案，AudioContext 合成音效 + Canvas 動畫。10KB 單檔部署 XOOPS VM。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 3,
    "tags": [
      "觸控互動",
      "互動藝術",
      "石門國小",
      "AudioContext",
      "XOOPS VM"
    ],
    "toolIds": [
      32,
      33,
      35
    ],
    "coverEmoji": "👆",
    "coverColor": "green"
  },
  {
    "slug": "sound-33-visualizer",
    "title": "#33 讓聲音具現化吧！Sound Visualizer：AudioContext + Web Audio API 即時顯示分貝值 + 音頻頻率",
    "excerpt": "#33 真實名稱「石門國小互動觸屏-讓聲音具現化吧！Visualizer」是阿凱專為觸控螢幕設計的**聲音視覺化教具**。AudioContext 抓麥克風即時顯示分貝值 / 最大分貝值 / 音頻頻率 / 最大音頻頻率，純前端 6.9KB 單檔。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 3,
    "tags": [
      "聲音視覺化",
      "Web Audio API",
      "自然科學",
      "XOOPS VM",
      "互動藝術"
    ],
    "toolIds": [
      33,
      37,
      38
    ],
    "coverEmoji": "📢",
    "coverColor": "blue"
  },
  {
    "slug": "interactive-34-image-sound",
    "title": "#34 互動式影像聲音遊戲區：「來抓我哦」按鈕跳躍 + Blockade Labs Skybox AI 360° 全景嵌入",
    "excerpt": "#34 真實標題「桃園市龍潭區石門國小互動式網頁」— 含「來抓我哦」隨機跳動按鈕（抓中得分）+ 拍照 / 重拍 / 全螢幕功能 + **Blockade Labs Skybox AI 360° 全景場景嵌入**（阿凱自己生成的場景）+ 連結 Chrome 跑酷遊戲。互動藝術裝置設計。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "互動藝術",
      "Blockade Labs Skybox",
      "AI 全景",
      "XOOPS VM",
      "觸屏"
    ],
    "toolIds": [
      34,
      32,
      33
    ],
    "coverEmoji": "🎨",
    "coverColor": "purple"
  },
  {
    "slug": "doodle-35-touch-canvas",
    "title": "#35 觸屏點點塗鴉區：點擊畫布浮現創意塗鴉的互動藝術裝置（XOOPS 文章嵌入版）",
    "excerpt": "#35 真實標題「桃園市石門國小校網 - 點擊下方畫布，浮現創意塗鴉！」是阿凱嵌在學校 XOOPS 系統文章內的互動塗鴉裝置 — 點畫布隨機出現創意圖案。68KB 含 XOOPS 系統頁面但實際工具邏輯精簡。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 3,
    "tags": [
      "塗鴉互動",
      "觸屏遊戲",
      "XOOPS tadnews",
      "互動藝術",
      "石門國小"
    ],
    "toolIds": [
      35,
      32,
      34
    ],
    "coverEmoji": "🎨",
    "coverColor": "pink"
  },
  {
    "slug": "snake-36-game",
    "title": "#36 貪食蛇互動遊戲：純 Canvas 2D + 200ms 更新間隔 + 最高分紀錄的經典復刻",
    "excerpt": "#36 真實標題「Snake Game」是阿凱用純 Canvas 2D 寫的經典貪食蛇復刻版。20px 格子 + 200ms 更新間隔 + localStorage 存最高分。7.6KB 單檔極簡部署 XOOPS VM。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 3,
    "tags": [
      "貪食蛇",
      "Canvas 2D",
      "經典遊戲",
      "XOOPS VM",
      "純前端"
    ],
    "toolIds": [
      36,
      28,
      30
    ],
    "coverEmoji": "🐍",
    "coverColor": "green"
  },
  {
    "slug": "soundwave-37-360-game",
    "title": "#37 聲波擴散 360 小遊戲：AudioContext 抓麥克風 + 360° 圓形擴散視覺化（XOOPS tadnews 嵌入）",
    "excerpt": "#37 真實標題「桃園市石門國小校網 - 聲波擴散 360 小遊戲」— 用 AudioContext 抓麥克風聲音 + 360° 圓形視覺化擴散，學生對螢幕喊叫看聲波擴散圖案。嵌入 XOOPS tadnews 文章。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 3,
    "tags": [
      "聲波視覺化",
      "360 動畫",
      "Web Audio API",
      "XOOPS tadnews",
      "互動藝術"
    ],
    "toolIds": [
      37,
      33,
      38
    ],
    "coverEmoji": "🔊",
    "coverColor": "blue"
  },
  {
    "slug": "sound-38-interactive-game",
    "title": "#38 聲音互動小遊戲！！AudioContext + 遊戲化機制：用聲音控制遊戲角色的物理互動裝置",
    "excerpt": "#38 真實標題「桃園市石門國小校網 - 聲音互動小遊戲！！」是聲音 3 部曲的高潮 — 學生「**用聲音控制遊戲角色**」（吼叫讓主角跳得高 / 唱歌讓主角加速等遊戲化機制）。嵌入 XOOPS tadnews 文章。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 3,
    "tags": [
      "聲音控制",
      "互動遊戲",
      "Web Audio API",
      "XOOPS tadnews",
      "物理互動"
    ],
    "toolIds": [
      38,
      33,
      37
    ],
    "coverEmoji": "🎤",
    "coverColor": "orange"
  },
  {
    "slug": "pirls-4-firebase-mirror",
    "title": "#4 PIRLS 閱讀理解生成（pirlss.smes Firebase Hosting）：跟 #87 PIRLS Pro 是同 repo 兩部署的 Firebase Hosting + 學校自訂域名版本",
    "excerpt": "#4 pirlss.smes.tyc.edu.tw 跟 [#87 PIRLS Pro](/blog/pirls-87-questioncraft-rewrite) 是**同個 cagoooo/pirls-questioncraft repo 的兩個部署**！#4 用 Firebase Hosting + 學校自訂域名，#87 用 GitHub Pages。Next.js + Tailwind + shadcn/ui + Radix UI 完全相同架構。同樣含 8 / 10 題模式 + 繁中 / English 雙語 + Gemini 2.5 Flash 出題。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 5,
    "tags": [
      "PIRLS",
      "Firebase Hosting",
      "同源雙部署",
      "學校自訂域名",
      "阿凱部署策略"
    ],
    "toolIds": [
      4,
      87,
      12
    ],
    "coverEmoji": "📖",
    "coverColor": "blue"
  },
  {
    "slug": "reading-12-portal-page",
    "title": "#12 PIRLS 閱讀理解網（read.smes）：石門國小閱推入口網靜態頁 + RGB 漸層動畫標題",
    "excerpt": "#12 真實是「**桃園市石門國小閱推入口網**」純靜態 HTML 入口頁，不是工具本身 — 是把 PIRLS 工具 + 閱讀推廣資源整理在一頁的入口網。Tailwind + animate.css + 30 秒 RGB 漸層動畫 H1 標題 + 背景圖（圖書館書本）+ 響應式按鈕區。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "閱讀推動",
      "入口網",
      "Tailwind",
      "靜態頁",
      "Firebase Hosting"
    ],
    "toolIds": [
      12,
      4,
      87
    ],
    "coverEmoji": "📚",
    "coverColor": "pink"
  },
  {
    "slug": "aura-13-firebase-mirror",
    "title": "#13 5W1H 靈感發射器（5w1h.smes Firebase Hosting）：跟 #92 Aura PRO 同 repo 雙部署的學校網域版本",
    "excerpt": "#13 跟 [#92 5W1H 靈感發射器 PRO（Aura）](/blog/inspire-92-5w1h-pro-writing) 是**同個 cagoooo/Aura repo 的兩個部署**！#13 用 Firebase Hosting + 5w1h.smes.tyc.edu.tw 學校自訂域名，#92 用 GitHub Pages。Next.js + 同樣 6 格同時呈現 + Prompt 防 LLM 爛梗 + 6 種故事風格 + 5 段年級難度。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "5W1H",
      "Firebase Hosting",
      "同源雙部署",
      "創意寫作",
      "Aura"
    ],
    "toolIds": [
      13,
      92,
      4
    ],
    "coverEmoji": "🚀",
    "coverColor": "yellow"
  },
  {
    "slug": "poet-14-elder-greeting-image",
    "title": "#14 點亮詩意～早安長輩圖產生器（poet.smes Firebase Hosting）：Next.js 產出超實用長輩圖的 AI 工具",
    "excerpt": "#14 真實名稱「點亮詩意～『早安長輩圖產生器』」是阿凱專為「**對家中長輩傳早安問候**」設計的 AI 工具。Next.js + Tailwind 架構，產出含詩句 + 風景圖 + 早安祝福的「**長輩圖**」一條龍，掛 poet.smes.tyc.edu.tw Firebase Hosting。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "長輩圖產生器",
      "親情關懷",
      "AI 詩句",
      "Firebase Hosting",
      "早安圖"
    ],
    "toolIds": [
      14,
      13,
      4
    ],
    "coverEmoji": "🌅",
    "coverColor": "orange"
  },
  {
    "slug": "report-15-domain-meeting-go",
    "title": "#15 領域共備 GO（report.smes）：Next.js + AI 自動生成國小教師社群領域會議記錄摘要",
    "excerpt": "#15 真實名稱「**領域共備 GO**」是阿凱專為 108 課綱「**教師專業社群**」設計的會議記錄 AI 工具。Next.js + Firebase Hosting + 自動生成國小教師社群領域會議記錄摘要 + 提升協作效率。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "領域共備",
      "教師社群",
      "108 課綱",
      "會議記錄",
      "Firebase Hosting"
    ],
    "toolIds": [
      15,
      24,
      80
    ],
    "coverEmoji": "🤝",
    "coverColor": "blue"
  },
  {
    "slug": "talk-16-teacher-helper",
    "title": "#16 親師溝通小幫手（talk.smes）：基礎版親師訊息回覆建議（#89 Pro 版前身）",
    "excerpt": "#16 真實名稱「**教師小幫手**」是阿凱**最早期**的親師溝通 AI 工具 — Next.js + Firebase Hosting，提供親師訊息回覆建議。是後來進化成 [#89 教師回覆小幫手 Pro](/blog/teacher-reply-89-pro-parent-message) 的入門基礎版。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "親師溝通",
      "基礎版",
      "Next.js",
      "Firebase Hosting",
      "#89 前身"
    ],
    "toolIds": [
      16,
      89,
      7
    ],
    "coverEmoji": "💌",
    "coverColor": "pink"
  },
  {
    "slug": "bilingual-43-lingua-lesson",
    "title": "#43 LinguaLesson 轉寫小精靈（bilingual.smes）：PDF/DOCX 中文課程計畫 → AI 翻譯豐富 → Markdown 表格",
    "excerpt": "#43 真實名稱「**LinguaLesson - 轉寫小精靈**」是阿凱為**雙語課程計畫**設計的 AI 翻譯工具。從 PDF 或 DOCX 中提取文字，將中文課程計劃**翻譯 + 豐富內容**並轉換成 **Markdown 表格**。Next.js + Firebase Hosting + bilingual.smes 學校網域。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "雙語課程",
      "AI 翻譯",
      "PDF/DOCX 處理",
      "Markdown 表格",
      "Firebase Hosting"
    ],
    "toolIds": [
      43,
      77,
      88
    ],
    "coverEmoji": "🇬🇧",
    "coverColor": "purple"
  },
  {
    "slug": "bilingual-77-english-promotion",
    "title": "#77 石門國小雙語教育宣導網站（english.smes）：用 Manus 建立的 114 學年度雙語聯盟學校公開觀議課宣導平台",
    "excerpt": "#77 真實名稱「**Manus Space**」 / Akai 描述「**桃園市龍潭區石門國民小學 114 學年度雙語聯盟學校暨雙語課程亮點學校公開觀議課宣導網站**」— 用 Manus AI 建立的雙語教育宣傳網。展示學校雙語教育課程規劃 / 外師介紹 / 主題課程活動 / 學生展能。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "雙語教育",
      "Manus AI",
      "公開觀議課",
      "學校宣導",
      "Firebase Hosting"
    ],
    "toolIds": [
      77,
      43,
      88
    ],
    "coverEmoji": "🌐",
    "coverColor": "green"
  },
  {
    "slug": "mario-9-platformer-adventure",
    "title": "#9 超級瑪莉歐冒險：純 Canvas 多關卡平台跳躍 + 蹬牆跳 + 成就系統 + 教學模式（v2.33.0 持續打磨）",
    "excerpt": "#9 真實名稱「超級冒險 🍄 Mario Style Platformer」是阿凱用純 Canvas 寫的多關卡平台跳躍遊戲。完整 Stage Clear / 暫停 / 教學 / 成就系統 / 全螢幕 + 操作含蹬牆跳 / 衝刺 / 蹲下，已迭代到 v2.33.0。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "瑪莉歐風格",
      "平台跳躍",
      "Canvas 2D",
      "成就系統",
      "蹬牆跳"
    ],
    "toolIds": [
      9,
      28,
      30
    ],
    "coverEmoji": "🍄",
    "coverColor": "orange"
  },
  {
    "slug": "bee-6-pair-game",
    "title": "#6 蜂勤耘友配對消消樂：3 難度 × 6 主題包 + themes.json 可擴充 + PWA 離線 + 鍵盤無障礙的記憶配對遊戲",
    "excerpt": "#6 真實名稱「🐝 蜂勤耘友配對消消樂」是阿凱寫的記憶配對遊戲。3 難度（初 / 中 / 高）× 6 主題（蜂勤耘友 / 注音 / 唐詩 / 英文 / 數字 / 水果）= 18 種組合，**themes.json 可擴充不寫程式**新增主題。純前端 ES Modules + PWA + 鍵盤無障礙 + WebP 省 50%。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "記憶配對",
      "注音教學",
      "唐詩",
      "PWA",
      "無障礙"
    ],
    "toolIds": [
      6,
      9,
      30
    ],
    "coverEmoji": "🐝",
    "coverColor": "yellow"
  },
  {
    "slug": "monkey-69-pixel-clash",
    "title": "#69 猴子投擲大戰 Monkey Pixel-Art Clash：致敬 1991 QBASIC GORILLAS.BAS + 拋物線物理 + Firebase 雲端排行榜",
    "excerpt": "#69 真實名稱「🐒 猴子投擲大戰 (Monkey Pixel-Art Clash)」致敬 1991 年 QBASIC 經典遊戲 **GORILLAS.BAS**。React + TypeScript + Vite + 拋物線物理（重力 + 風力）+ 地形破壞 + 道具系統（10X / 酸 / 流星雨 / 雷射）+ Firebase Firestore 雲端排行榜（含防刷分 Rules）+ 8-bit 音效。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 5,
    "tags": [
      "投擲遊戲",
      "QBASIC 致敬",
      "拋物線物理",
      "Firebase 排行榜",
      "像素風"
    ],
    "toolIds": [
      69,
      9,
      85
    ],
    "coverEmoji": "🐒",
    "coverColor": "green"
  },
  {
    "slug": "penguin-85-runner",
    "title": "#85 南極大冒險：企鵝跑酷 — 致敬 Konami 1983 Antarctic Adventure + 隱藏 God Mode 指令 + React 19 重製版",
    "excerpt": "#85 真實名稱「🐧 南極大冒險：企鵝跑酷」是阿凱致敬 Konami 1983 年經典《Antarctic Adventure》的 React 19 重製版，為石門國小學生製作。包含 ← / → 切換車道 + ↑/Space 跳躍 + ↓ 減速 + **🥚 隱藏指令 ↑↑↓↓←←→→AB 啟動 God Mode**。配 1882 年公版《Skaters Waltz》音樂。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "企鵝跑酷",
      "Konami 致敬",
      "React 19",
      "God Mode 彩蛋",
      "經典重製"
    ],
    "toolIds": [
      85,
      69,
      9
    ],
    "coverEmoji": "🐧",
    "coverColor": "blue"
  },
  {
    "slug": "lantern-56-festival-riddles",
    "title": "#56 2026 石門國小元宵猜燈謎：Vite + React + PWA 中國紅主題 + 一起來猜燈謎歡慶元宵",
    "excerpt": "#56 真實名稱「2026 石門國小元宵猜燈謎 | Lantern Festival Riddles」是阿凱專為石門國小 2026 年元宵節活動做的猜燈謎遊戲。Vite + React + PWA + 中國紅主題色 #E60012 + Noto Sans TC 字體 + Service Worker 完整支援。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 3,
    "tags": [
      "元宵節",
      "猜燈謎",
      "節慶活動",
      "石門國小",
      "Vite + React"
    ],
    "toolIds": [
      56,
      22,
      71
    ],
    "coverEmoji": "🏮",
    "coverColor": "pink"
  },
  {
    "slug": "ai-video-65-creator-hub",
    "title": "#65 AI 影片創作整合資源 Hub：ChatGPT → Grok → Canva 三步驟工作流 + 12+ YouTube 範例合集",
    "excerpt": "#65「AI Creator Hub 影片創作與教學整合資源」不是另一個 AI 工具 — 是阿凱整理的「ChatGPT 寫腳本 → Grok 動圖化 → Canva 剪輯」三步驟工作流入口頁，含 12+ YouTube 創意作品範例合集。EZPage 部署，cagoooo/Grok-Canva。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "AI 影片創作",
      "ChatGPT",
      "Grok",
      "Canva",
      "教學資源整合"
    ],
    "toolIds": [
      65,
      66,
      94
    ],
    "coverEmoji": "🎬",
    "coverColor": "pink"
  },
  {
    "slug": "sora-66-travel-record",
    "title": "#66 Sora AI 旅遊全記錄教學網：OpenAI Sora 旅遊影片創作教學資源庫（EZPage 部署）",
    "excerpt": "#66「Sora AI 旅遊全記錄教學網」是阿凱針對 **OpenAI Sora 影片生成工具**做的旅遊主題教學資源庫。從提示詞撰寫到高細節生成，把零散旅遊素材轉成電影質感全記錄短片。EZPage 部署，cagoooo/Sora。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "Sora",
      "旅遊影片",
      "提示詞工程",
      "OpenAI",
      "EZPage 部署"
    ],
    "toolIds": [
      66,
      65,
      94
    ],
    "coverEmoji": "✈️",
    "coverColor": "blue"
  },
  {
    "slug": "tietu-86-chibi-sticker",
    "title": "#86 TieTu 3D Q版貼圖生成器：上傳大頭照 + 24 個文字 → Gemini 2.5 Flash Image 生 4×6 貼圖 + LINE 上架包",
    "excerpt": "#86 TieTu — 上傳大頭照 → 自訂主題與 24 個文字標籤 → Gemini 2.5 Flash Image（Nano Banana Pro）生成 4×6 共 24 張 Q 版貼圖 → 下載 PNG / 24 張 ZIP / **LINE 個人原創貼圖上架包**（含 main.png + tab.png + README.txt）。Vite + React 19 + Cloud Functions v2 + Cloudflare Turnstile。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 6,
    "tags": [
      "AI 圖像生成",
      "LINE 貼圖",
      "Gemini 2.5 Flash Image",
      "Nano Banana",
      "IndexedDB"
    ],
    "toolIds": [
      86,
      65,
      94
    ],
    "coverEmoji": "🎨",
    "coverColor": "yellow"
  },
  {
    "slug": "prepare-58-lesson-plan",
    "title": "#58 十二年國教教案生成器：Python Flask + Gemini 1.5 Flash + Word docx 下載 + Email 自動寄送的教案 AI",
    "excerpt": "#58 真實名稱「十二年國教教案生成器 (Lesson Plan Generator)」是阿凱**用 Python Flask 寫的教案生成系統**（跟其他大多 Node 工具不同）。Google Gemini 1.5 Flash + 生成 20 項目完整教案（核心素養 / 學習重點 / 教學活動）+ python-docx Word 下載 + Flask-Mail Email 自動寄送。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 5,
    "tags": [
      "十二年國教",
      "教案生成",
      "Python Flask",
      "python-docx",
      "Email 自動寄送"
    ],
    "toolIds": [
      58,
      88,
      78
    ],
    "coverEmoji": "📋",
    "coverColor": "green"
  },
  {
    "slug": "meeting-84-domain-go-pro",
    "title": "#84 領域共備 GO Pro（domain-meeting-go）：跟 #15 同源雙部署 + AI 照片描述 + 編輯部期刊風 UI",
    "excerpt": "#84 跟 [#15 領域共備 GO](/blog/report-15-domain-meeting-go) 是**同源雙部署**！#84 cagoooo.github.io/domain-meeting-go = GitHub Pages 版，#15 report.smes = Firebase Hosting 學校域名版。Next.js 15.2.3 + Gemini 2.5 Flash Lite + 上傳會議照片 AI 逐張描述 + 整場深度總結 + Word/PDF 匯出 + v0.5.0 編輯部期刊風 UI。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 5,
    "tags": [
      "領域共備",
      "會議記錄",
      "編輯部期刊風",
      "同源雙部署",
      "Gemini 2.5 Flash Lite"
    ],
    "toolIds": [
      84,
      15,
      24
    ],
    "coverEmoji": "📰",
    "coverColor": "orange"
  },
  {
    "slug": "staff-2-admin-coordination",
    "title": "#2 行政業務協調系統：學校內部組長公告 + 重要行事 + 帳號登入 / 建立的協調平台",
    "excerpt": "#2「行政業務協調系統」是阿凱為**學校內部組長 / 主任協調**做的平台。Tailwind CDN + 純前端 + Firebase Auth 登入 / 建立帳號 + 最新公告 + 重要行事 + 主頁面結構。掛在 cagoooo/staff repo。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "校園行政",
      "處室協調",
      "組長 / 主任",
      "公告系統",
      "Firebase Auth"
    ],
    "toolIds": [
      2,
      15,
      49
    ],
    "coverEmoji": "🏛️",
    "coverColor": "orange"
  },
  {
    "slug": "signature-47-consent-form",
    "title": "#47 學生肖像授權同意書線上簽名系統：React 19 + Firebase + 簽名 PDF 自動生成 + Email 含連結 + v2.3 同意意願按鈕",
    "excerpt": "#47 真實名稱「學生活動肖像使用授權同意書 - 線上簽名系統」。React 19 + TypeScript + Vite + Tailwind 4 + Framer Motion + Firebase（Firestore + Storage + Auth）+ react-signature-canvas + PDF 自動生成上傳 Firebase Storage 永久保存 + Email 含 PDF 下載連結 + v2.3 同意/不同意按鈕同步 PDF 顏色（綠/紅）+ 跨校支援。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 5,
    "tags": [
      "電子簽名",
      "肖像授權",
      "React 19",
      "PDF 自動生成",
      "跨校支援"
    ],
    "toolIds": [
      47,
      48,
      2
    ],
    "coverEmoji": "✍️",
    "coverColor": "blue"
  },
  {
    "slug": "form-48-dynamic-builder",
    "title": "#48 動態表單自動回報系統：Glassmorphism UI + 拖曳式表單編輯器 + 數據分析儀表板 + Google Chat Webhook 通知",
    "excerpt": "#48「Form System」是阿凱用 React + Vite + Firebase 寫的動態表單系統，**取代 Google Apps Script 表單**。Glassmorphism 毛玻璃 UI + 動態流體背景 + 拖曳式表單編輯器 + 數據分析儀表板 + 表單模板庫 + 3 主題色 + Google Chat Webhook 即時通知 + CSV 匯出。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "動態表單",
      "Glassmorphism",
      "Google Chat Webhook",
      "React + Firebase",
      "CSV 匯出"
    ],
    "toolIds": [
      48,
      47,
      2
    ],
    "coverEmoji": "📝",
    "coverColor": "green"
  },
  {
    "slug": "parent-day-62-114-activity",
    "title": "#62 桃園市龍潭區石門國民小學 114 學年度親職教育日活動通知函：純靜態活動專屬網站（EZPage 部署）",
    "excerpt": "#62 真實名稱「桃園市龍潭區石門國民小學 114 學年度親職教育日活動通知函」是阿凱為石門國小 114 學年度親職教育日**做的活動專屬網站**。純靜態 HTML + EZPage 部署 + 活動邀請 + 活動時程表 + 精彩活動快覽 + 通知函格式。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "親職教育日",
      "活動通知",
      "石門國小",
      "EZPage 部署",
      "節慶活動專用"
    ],
    "toolIds": [
      62,
      74,
      56
    ],
    "coverEmoji": "🎪",
    "coverColor": "pink"
  },
  {
    "slug": "vendor-5-campus-food-order",
    "title": "#5 校園點餐系統 v3.4.2：Firebase + React 三端分離（顧客 / 廚房 / 叫號）+ 多班級獨立庫存 + OAuth 權限分級",
    "excerpt": "#5「校園點餐系統 (Campus Food Order)」v3.4.2 — 基於 Firebase + React 的現代化校園園遊會點餐系統。**三端分離**（顧客點餐 / 廚房管理 / 叫號顯示完全獨立）+ Firestore 即時資料庫 + 多班級獨立庫存（每班一個攤位）+ Firebase Auth Google OAuth 三層權限（owner / staff / none）+ PWA 離線。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 6,
    "tags": [
      "校園點餐",
      "園遊會",
      "三端分離",
      "Firebase 即時",
      "多班級獨立庫存"
    ],
    "toolIds": [
      5,
      27,
      48
    ],
    "coverEmoji": "🍔",
    "coverColor": "yellow"
  },
  {
    "slug": "zhuyin-55-bopomofo-challenge",
    "title": "#55 ㄅㄆㄇ 注音大挑戰：6 主題關卡 + 漸進式解鎖 + 虛擬鍵盤拼注音 + 學習回顧模組（一年級必用）",
    "excerpt": "#55 真實名稱「ㄅㄆㄇ 注音大挑戰 🎲」是阿凱為一年級兒童設計的注音學習遊戲。純前端 HTML/CSS/JS、6 個主題（水果 / 動物 / 交通 / 身體 / 家人 / 學校）+ 漸進式解鎖 + 虛擬鍵盤拼聲母韻母聲調 + 答對撒紙條 / 答錯震動 + localStorage 進度儲存 + 學習回顧看答對答錯紀錄。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "注音學習",
      "一年級",
      "ㄅㄆㄇ",
      "漸進式解鎖",
      "純前端"
    ],
    "toolIds": [
      55,
      21,
      70
    ],
    "coverEmoji": "🎲",
    "coverColor": "yellow"
  },
  {
    "slug": "typing-70-zhuyin-pro",
    "title": "#70 中文注音打字遊戲 Pro v1.3.0：4 級難度（初學者 / 入門 / 進階 / 大師）+ 全球排行榜 + 成績單分享 + PWA",
    "excerpt": "#70「中文注音打字遊戲 Pro (Zhuyin Challenge Pro) v1.3.0」是 [#21 中打](/blog/typing-21-zhuyin-keymap) 的 Vite + Tailwind 升級版。4 級難度（初學者 / 入門 / 進階 / 大師）+ 進階詞庫（常用漢字 / 詞語 / 四字成語）+ 全球排行榜 + 一鍵生成成績單圖片分享 + PWA 離線可裝桌面。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "中打 Pro",
      "注音輸入",
      "全球排行榜",
      "PWA",
      "成績單分享"
    ],
    "toolIds": [
      70,
      21,
      71
    ],
    "coverEmoji": "🏆",
    "coverColor": "blue"
  },
  {
    "slug": "idiom-71-typeTC-challenge",
    "title": "#71 成語填空大挑戰 v1.3.1：Neon Heritage 霓虹古韻 UI + 國樂背景 + 櫻花特效 + Firebase 全球排行榜",
    "excerpt": "#71「成語填空大挑戰 (TypeTC) v1.3.1」是 [#22 成語填空遊戲](/blog/idiom-22-fill-blank-game) 的進階版。Vite + Vanilla JS + Tailwind + **Neon Heritage（Red/Gold Theme）+ Glassmorphism「霓虹古韻」視覺** + 隨機**國樂背景音樂** + **櫻花落下特效** + Firebase Firestore 全球排行榜 + 2026-03-06 API Key 零洩漏規範。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "成語挑戰",
      "霓虹古韻",
      "國樂音樂",
      "櫻花特效",
      "Firebase 排行榜"
    ],
    "toolIds": [
      71,
      22,
      70
    ],
    "coverEmoji": "🏮",
    "coverColor": "pink"
  },
  {
    "slug": "language-95-longtan-competition",
    "title": "#95 2026 桃園市語文競賽龍潭區複賽：17 大項 / 33 場細分賽事 + 我的比賽時間查詢 + 個人指引卡列印（5/23 石門承辦）",
    "excerpt": "#95「2026 桃園市語文競賽 龍潭區複賽」是石門國小**承辦 2026/5/23 龍潭區語文競賽**的對外宣傳網站。17 大項 / 33 場細分賽事 + **我的比賽時間查詢**（輸入場次 + 序號自動算抽題 / 上台 / 報到時間）+ **個人指引卡列印**選手專屬比賽行程 + 場地配置 1F-3F 分樓層 + A4 QR Code 海報。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "語文競賽",
      "龍潭區",
      "個人指引卡",
      "比賽時間查詢",
      "活動專屬網"
    ],
    "toolIds": [
      95,
      67,
      62
    ],
    "coverEmoji": "🏆",
    "coverColor": "green"
  },
  {
    "slug": "photopoet-91-pro",
    "title": "#91 PhotoPoet Pro 點亮詩意：跟 #14 同源雙部署第 5 案例 + Cloudflare Turnstile + SSRF 防護 + Gemini 2.0 Flash 繁中詩生成",
    "excerpt": "#91 PhotoPoet **Pro** 是 [#14 poet.smes Firebase Hosting 版](/blog/poet-14-elder-greeting-image) 的進階姊妹版！cagoooo/PhotoPoet repo + photopoet-ha364.web.app 線上版。Next.js 15 (static export) + Firebase Hosting + Cloud Functions gen2 + Genkit + **Cloudflare Turnstile** + **SSRF 防護**（私有 IP 黑名單 / redirect 重檢 / Content-Type 白名單 / 10MB / 8s 上限）+ Gemini 2.0 Flash 繁中詩生成。**阿凱同源雙部署策略第 5 案例**。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 5,
    "tags": [
      "長輩圖 Pro",
      "同源雙部署",
      "Cloudflare Turnstile",
      "SSRF 防護",
      "Gemini 2.0 Flash"
    ],
    "toolIds": [
      91,
      14,
      86
    ],
    "coverEmoji": "🌅",
    "coverColor": "pink"
  },
  {
    "slug": "wordcloud-45-realtime-interactive",
    "title": "#45 WordCloud 即時互動文字雲：React 19 + Firebase Firestore 即時同步 + Top 1-3 流光漸層 + HUD 排名 + QR Code 房間",
    "excerpt": "#45「☁️ WordCloud - 即時互動文字雲」是阿凱用 React 19 + TypeScript + Vite 7 + Tailwind 4 + Framer Motion 寫的多人協作文字雲。Firebase Firestore 即時更新 + Top 1-3 流光漸層動態漸層 + HUD 排名系統（科技風 RANK 標籤）+ 房間系統 + QR Code 分享 + 匯出圖片。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "文字雲",
      "即時互動",
      "React 19",
      "Firebase Firestore",
      "QR Code 房間"
    ],
    "toolIds": [
      45,
      11,
      3
    ],
    "coverEmoji": "☁️",
    "coverColor": "blue"
  },
  {
    "slug": "kids-50-zone-learning",
    "title": "#50 童樂學園 KidsZone v1.5.0：💰 星星幣經濟系統 + 🛍️ 快樂商店 + 🧑‍🚀 個人化頭像 + 🎶 節奏達人 + 三級記憶翻牌",
    "excerpt": "#50「KidsZone Learning Games (童樂學園)」v1.5.0 是阿凱為國小低中年級做的完整兒童遊戲學習平台。💰 星星幣經濟系統（簽到+10 / 遊戲分數/10）+ 🛍️ 快樂商店（限定頭像 / 驚喜貼紙包）+ 🧑‍🚀 20+ 角色個人化頭像 + 🎶 節奏達人（小星星 / 兩隻老虎）+ 記憶翻牌 2.0 三級分（經典 / 識字 / 心算）。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 5,
    "tags": [
      "兒童遊戲平台",
      "經濟學習",
      "星星幣",
      "個人化頭像",
      "節奏達人"
    ],
    "toolIds": [
      50,
      6,
      30
    ],
    "coverEmoji": "🎈",
    "coverColor": "pink"
  },
  {
    "slug": "soka-52-expo-registration",
    "title": "#52 2026 創價・教育 EXPO 線上選課系統：React + Vite 整合式教育博覽會數位導覽小幫手",
    "excerpt": "#52「**2026 創價・教育 EXPO ｜ 線上報名系統**」是阿凱為**創價・教育 EXPO 博覽會**做的線上選課平台。React + Vite + 流暢介面瀏覽科技 / 人文藝術各領域課程 + 即時選課 + 報名狀態追蹤 + 個人化課程清單管理。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "線上報名",
      "教育博覽會",
      "創價教育",
      "活動專屬網",
      "React + Vite"
    ],
    "toolIds": [
      52,
      62,
      95
    ],
    "coverEmoji": "🎓",
    "coverColor": "purple"
  },
  {
    "slug": "food-57-restaurant-wheel",
    "title": "#57 選擇障礙專用 - 餐廳命運轉盤：React + Vite 純前端極簡轉盤工具（解決「今天吃什麼」永恆難題）",
    "excerpt": "#57「餐廳命運轉盤」是阿凱用 React + Vite 寫的極簡轉盤工具，**解決選擇障礙**的「**今天吃什麼**」永恆難題。輕鬆一點讓轉盤決定 — 1.5KB 入口 HTML 純前端，課堂 / 親師活動 / 朋友聚餐通用。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 3,
    "tags": [
      "選擇障礙",
      "餐廳抽籤",
      "命運轉盤",
      "React + Vite",
      "通用工具"
    ],
    "toolIds": [
      57,
      17,
      18
    ],
    "coverEmoji": "🎰",
    "coverColor": "orange"
  },
  {
    "slug": "3d-60-gallery-carousel",
    "title": "#60 專屬創意 3D 畫廊：純 CSS transform-style preserve-3d 真實 3D 空間 + 拖曳旋轉 + 慣性滑動 + 倒影效果",
    "excerpt": "#60「**🖼️ 專屬創意 3D 畫廊**」是阿凱用**純靜態零依賴**寫的 3D 旋轉木馬照片畫廊。CSS `transform-style: preserve-3d` 真實 3D 空間感 + 滑鼠拖曳旋轉 + 觸控手勢 + **慣性滑動效果**（仿物理摩擦感）+ 本機圖片上傳 + `-webkit-box-reflect` 地板倒影 + RWD。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "3D 畫廊",
      "CSS preserve-3d",
      "旋轉木馬",
      "純靜態零依賴",
      "慣性滑動"
    ],
    "toolIds": [
      60,
      32,
      34
    ],
    "coverEmoji": "🖼️",
    "coverColor": "purple"
  },
  {
    "slug": "email-63-memory-park",
    "title": "#63 Email 帳密記憶遊樂園：教學生記學校信箱帳密的 Vite + React + shadcn/ui 遊戲化工具",
    "excerpt": "#63「Email 帳密記憶遊樂園」是阿凱用 Vite + TypeScript + React + shadcn-ui + Tailwind CSS 寫的學校信箱帳密記憶遊戲。解決國中小學生「忘記學校 Google 帳號 / 密碼」的真實痛點，遊戲化方式幫學生記住每天要登入的工具。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "Email 教學",
      "帳密記憶",
      "遊戲化",
      "Vite + React",
      "學校 Google Workspace"
    ],
    "toolIds": [
      63,
      50,
      6
    ],
    "coverEmoji": "📧",
    "coverColor": "blue"
  },
  {
    "slug": "music-64-rhythm-beat-master",
    "title": "#64 簡譜節拍師 v2.6 Rhythm Beat Master：太鼓達人風格 × Web Audio API 即時合成 × 7 鍵 Do Re Mi × 4 段難度",
    "excerpt": "#64「🎵 簡譜節拍師 v2.6 — Rhythm Beat Master」是阿凱寫的**太鼓達人風格 × 簡譜節奏遊戲**。7 個按鍵（1-7 對應 Do Re Mi Fa Sol La Si）+ 三種判定（PERFECT 金 / GOOD 綠 / MISS 紅）+ COMBO 連擊 + Web Audio API 即時合成背景旋律 + 4 段難度（初學 / 一般 / 高手 / 地獄）+ LocalStorage 每首每難度獨立紀錄。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 5,
    "tags": [
      "簡譜節奏",
      "太鼓達人風格",
      "Web Audio API",
      "Do Re Mi",
      "節奏遊戲"
    ],
    "toolIds": [
      64,
      50,
      26
    ],
    "coverEmoji": "🥁",
    "coverColor": "pink"
  },
  {
    "slug": "mayor-93-little-mayor",
    "title": "#93 石門國小自治市市長計票系統：5 畫面雙端架構（公開監票 / 後台唱票 / A4 報告 / OBS 直播 / 1080×1920 海報）",
    "excerpt": "#93「🗳️ 石門國小自治市市長選舉計票系統」是阿凱寫的**即時計票 + 即時監票雙端系統**。**5 個畫面**：viewer 公開監票 / admin 教師後台唱票 / report A4 直式開票報告 / overlay OBS 直播浮層 / poster 1080×1920 當選海報。Firebase Realtime Database + Auth + GitHub Pages 部署。可嵌入學校官網 5 分鐘上線。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 5,
    "tags": [
      "自治市選舉",
      "即時計票",
      "雙端系統",
      "Firebase Realtime DB",
      "校園民主"
    ],
    "toolIds": [
      93,
      96,
      3
    ],
    "coverEmoji": "🗳️",
    "coverColor": "orange"
  },
  {
    "slug": "lungtan-96-dfc-voting",
    "title": "#96 龍潭國小第 123 屆自治市小市長選舉 DFC 投票系統：跨校合作版本（繼承 #93 + DFC 行動方案投票）",
    "excerpt": "#96「🗳️ 龍潭國小 第 123 屆 自治市小市長選舉 — DFC 投票系統」是阿凱為**龍潭國小**（不是石門國小）做的選舉系統。**明確標示「模式參考自 cagoooo/Little-Mayer」** = #93 的繼承版本。3 畫面（index 入口 / viewer 公開監票 / admin 後台）+ Firebase Realtime DB + DFC（Design for Change）行動方案投票模式。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "自治市選舉",
      "龍潭國小",
      "DFC 行動方案",
      "跨校合作",
      "Firebase 即時"
    ],
    "toolIds": [
      96,
      93,
      3
    ],
    "coverEmoji": "🏛️",
    "coverColor": "green"
  },
  {
    "slug": "curriculum-78-elementary-review",
    "title": "#78 桃園市 115 學年度國小課程計畫 AI 審查工具 v4.1：跟 #88 國中版同源（國小 vs 國中對應版）+ 40+ 項審查 + 雙模式 + PWA",
    "excerpt": "#78 是 [#88 國中課程計畫 AI 審查](/blog/curriculum-88-ai-junior-high-review) 的**國小對應版**！v4.1 雙模式（🔍 審查現成 PDF / ✨ 產生合規計畫）+ 對應桃園市教育局 40+ 項審查標準（0-1 到 7-12）+ 單項/批次雙模式 + 修正稿生成 + 多格式下載（HTML/Word/CSV/圖卡/LINE/Email）+ 產→審閉環 + 特殊班級提醒 + PWA 離線。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 5,
    "tags": [
      "課程計畫",
      "國小審查",
      "Gemini API",
      "桃園市",
      "同源國小國中對應版"
    ],
    "toolIds": [
      78,
      88,
      15
    ],
    "coverEmoji": "📚",
    "coverColor": "blue"
  },
  {
    "slug": "comments-23-web-version",
    "title": "#23 點石成金蜂 v2.9.1 網頁版：跟 #7 LINE Bot 是雙形式 — React 18 + Gemini 2.5 Flash + 多元風格 + 成語庫帳號隔離",
    "excerpt": "#23「點石成金蜂🐝 - AI 評語產生器」是 [#7 LINE Bot 版](/blog/comment-7-ai-positive-language) 的**網頁版同源工具**！v2.9.1 + React 18.3 + Firebase 12.7 + Gemini 2.5 Flash。多元風格（質性描述 / 量化分析 / 鼓勵激勵）+ 字數與語氣調整 + 豐富成語庫（資賦/學業/品德/人際/服務）+ 帳號隔離儲存。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 5,
    "tags": [
      "評語優化",
      "點石成金蜂",
      "Gemini 2.5 Flash",
      "React 18",
      "同源雙形式"
    ],
    "toolIds": [
      23,
      7,
      89
    ],
    "coverEmoji": "🐝",
    "coverColor": "yellow"
  },
  {
    "slug": "privacy-42-child-face",
    "title": "#42 兒童臉部隱私保護工具：SSD MobileNet 自動偵測 + 三種遮蓋（Emoji / 馬賽克 / 模糊）+ 臉部旋轉偵測 + 批次 ZIP",
    "excerpt": "#42「🛡️ 兒童臉部隱私保護工具」用 **SSD MobileNet** 自動偵測照片中的兒童臉部，遮蓋成 **Emoji** / 馬賽克 / 模糊三種風格。**Emoji 隨臉部角度旋轉**（神細節）+ 手動編輯 + 對比滑桿 + 批次處理 + 單張 PNG / 批次 ZIP 下載 + PWA。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 5,
    "tags": [
      "臉部隱私",
      "SSD MobileNet",
      "兒童保護",
      "Emoji 遮蓋",
      "批次處理"
    ],
    "toolIds": [
      42,
      47,
      68
    ],
    "coverEmoji": "🛡️",
    "coverColor": "blue"
  },
  {
    "slug": "typeEN-61-pro",
    "title": "#61 英打打字超互動遊戲 GitHub Pages 重構版：跟 #20 同源升級（虛擬手指肌肉記憶 + 隨機色彩 + Tailwind CDN）",
    "excerpt": "#61「英文字母打字練習遊戲」是 [#20 英打練習](/blog/typing-20-english-letters-falling) 的 **GitHub Pages 重構版**！單檔 typeEN.html + 虛擬雙手亮起對應手指（左手小拇指對應 A、右手食指對應 J）+ Vanilla JS + Tailwind CDN + 26 字母隨機排序 / 顏色 / 位置 + RWD。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "英打練習",
      "虛擬手指提示",
      "GitHub Pages 重構",
      "Vanilla JS",
      "Tailwind CDN"
    ],
    "toolIds": [
      61,
      20,
      70
    ],
    "coverEmoji": "⌨️",
    "coverColor": "orange"
  },
  {
    "slug": "smes-59-ai-customer-service",
    "title": "#59 小智鈴 AI 客服系統：桃園市石門國小資訊組客服部 — 24/7 AI 即時諮詢 + 教育場域智慧交談機器人",
    "excerpt": "#59「小智鈴 AI 客服系統」是阿凱為**桃園市石門國小資訊組**做的智慧交談機器人。真實標題「**桃園市石門國小資訊組客服部**」— 自動學習學校行政 / 教學資源 / 常見 QA 資料，**24/7 全天候即時諮詢** + 提供親師生隨時獲取資訊管道 + 減輕資訊組長負擔。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "AI 客服",
      "智慧交談機器人",
      "學校資訊組",
      "24/7 諮詢",
      "石門國小"
    ],
    "toolIds": [
      59,
      1,
      19
    ],
    "coverEmoji": "🔔",
    "coverColor": "pink"
  },
  {
    "slug": "storytell-90-picturebook-form",
    "title": "#90 繪本→Google 表單一條龍工作坊 v0.6：Gemini 繪本 → Google Doc → Apps Script → Google 表單 → QR Code 給學生",
    "excerpt": "#90「📚 繪本 → Google 表單 一條龍工作坊」v0.6 是阿凱整合**多個 Google 服務工作流**的工具。把「Gemini 畫繪本 → Google Doc 整理 → 發布共用 → Apps Script → 圖片網址轉換 → Google 表單 → QR Code 發給學生」**6 步驟收進一個網頁** + 零安裝 + 單檔網頁 + 離線可用 + 5 分鐘上手指南。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 5,
    "tags": [
      "繪本生成",
      "Gemini",
      "Google 表單",
      "Apps Script",
      "工作流自動化"
    ],
    "toolIds": [
      90,
      65,
      47
    ],
    "coverEmoji": "📚",
    "coverColor": "green"
  },
  {
    "slug": "replit-1-online-customer-service",
    "title": "#1 線上即時客服：Replit shared link 公開分享 — 跟 #19 是同 Replit 專案兩入口（分享公開版 vs 製作後台）",
    "excerpt": "#1「線上即時客服」是阿凱用 Replit 做的即時教育支援諮詢服務，**走 Replit shared 公開連結**（`/shared/A4uyH5OdHI`）讓任何人不用註冊直接使用。跟 [#19 設計專屬客服](/tool/19) 是**同個 Replit 專案的兩個入口** — 分別服務「使用者公開」vs「製作者後台」雙場景。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "線上客服",
      "Replit 部署",
      "即時通訊",
      "shared link",
      "AI 諮詢"
    ],
    "toolIds": [
      1,
      19,
      59
    ],
    "coverEmoji": "💬",
    "coverColor": "blue"
  },
  {
    "slug": "replit-19-design-your-own",
    "title": "#19 設計自己的專屬客服：跟 #1 是同 Replit 專案製作後台 — 「fork → 自訂 → 訓練 → 上線」流程教學",
    "excerpt": "#19「設計自己的專屬客服」是 [#1 線上即時客服](/blog/replit-1-online-customer-service) 的**製作後台**，跟 #1 同個 Replit 專案不同入口。提供「**fork → 自訂主題 → 訓練 QA → 上線 shared link**」完整流程 — 讓老師也能做出自己學科的 AI 客服。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "客服建造器",
      "Replit 製作後台",
      "AI 客服自訂",
      "機器人訓練",
      "老師工具"
    ],
    "toolIds": [
      19,
      1,
      59
    ],
    "coverEmoji": "🤖",
    "coverColor": "pink"
  },
  {
    "slug": "line-bot-8-lesson-plans",
    "title": "#8 12 年教案有 14 — LINE Bot：豐富教案資源分享平台 + 即時推送多元教學素材",
    "excerpt": "#8「12 年教案有 14」是阿凱用 **LINE Bot 平台**做的教案資源分享機器人。加好友 `lin.ee/pCqnVhT` 即可獲取**十二年國教課綱對應的多元教學素材**。LINE 為部署平台 = 老師最熟悉的介面（不用記網址）。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "LINE Bot",
      "教案資源",
      "十二年國教",
      "課綱對應",
      "即時推送"
    ],
    "toolIds": [
      8,
      7,
      58
    ],
    "coverEmoji": "📚",
    "coverColor": "green"
  },
  {
    "slug": "magic-39-mind-reading",
    "title": "#39 孔明神算：心靈感應預言魔術 — 用 Claude Artifacts 公開分享連結部署的數學魔術遊戲",
    "excerpt": "#39「孔明神算：心靈感應預言魔術」是阿凱用 **Claude Artifacts 公開分享連結**部署的數學魔術遊戲。學生想一個數字 → 經過幾個數學步驟 → 「孔明」精準預言！背後是數學定理（不是真的心靈感應）— 國小數學「**規律與恆等**」單元的趣味教材。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "數學魔術",
      "孔明神算",
      "Claude Artifacts",
      "心靈感應",
      "數學定理"
    ],
    "toolIds": [
      39,
      26,
      44
    ],
    "coverEmoji": "🔮",
    "coverColor": "purple"
  },
  {
    "slug": "padlet-40-admin-board",
    "title": "#40 Padlet 行政宣導動態牆：用 Padlet 平台部署的即時校園公告牆（不用自架網站）",
    "excerpt": "#40「Padlet 行政宣導動態牆」是阿凱用 **Padlet 平台**（不是自架）做的即時校園公告牆。Padlet 是知名線上佈告欄工具 — 阿凱直接借用 Padlet 平台快速做出**家長 / 老師都能隨時查看**的動態宣導牆，不用寫程式不用部署。",
    "publishedAt": "2026-05-21",
    "readingMinutes": 4,
    "tags": [
      "Padlet",
      "行政宣導",
      "動態公告牆",
      "不用自架",
      "第三方平台"
    ],
    "toolIds": [
      40,
      2,
      24
    ],
    "coverEmoji": "📌",
    "coverColor": "pink"
  },
  {
    "slug": "classroom-kit-98-daily-teacher-toolkit",
    "title": "#98 教室小幫手：26 個課堂小工具裝進一個分頁，免登入不上傳的導師百寶箱",
    "excerpt": "#98 教室小幫手把導師每天分散在 8 個分頁的小工具（情緒打卡、點名、抽號、計時器、跑馬燈、分組、座位表、生日榜⋯）合進一頁 PWA，設定班級名單一次 26 工具自動帶入，所有資料只存瀏覽器本機 IndexedDB，不上傳任何雲端。",
    "publishedAt": "2026-05-22",
    "readingMinutes": 5,
    "tags": [
      "教室百寶箱",
      "導師工具",
      "班級經營",
      "情緒打卡",
      "PWA 離線"
    ],
    "toolIds": [
      98,
      16,
      89
    ],
    "coverEmoji": "🎒",
    "coverColor": "orange"
  },
  {
    "slug": "exam-illustration-99-ai-line-art-studio",
    "title": "#99 考試卷生圖 Studio：四欄位 20 秒生兩張黑白線稿，列印不吃墨水的備課救星",
    "excerpt": "#99 考試卷生圖 Studio 是阿凱寫給自己備課用的 AI 插圖工具：填四個欄位（標題、對話、角色、場景），按一鍵 20 秒生兩張 1024×1024 純黑白線稿 PNG，校園黑白印表機友善、可當著色頁、中文精準渲染，每天免費 5 次。",
    "publishedAt": "2026-05-24",
    "readingMinutes": 5,
    "tags": [
      "AI 線稿",
      "試卷插圖",
      "備課工具",
      "黑白線稿",
      "OpenAI gpt-image"
    ],
    "toolIds": [
      99,
      87,
      58
    ],
    "coverEmoji": "🎨",
    "coverColor": "blue"
  }
];

/**
 * 已有「手寫長文」覆蓋的工具 ID 集合（從索引的 toolIds 自動推導）。
 * 用途：mini blog 生成器 / sitemap / OG landing 跳過這些 ID，避免同一個 #N
 * 同時出現「30 秒看完」短文與手寫長文。
 */
export const HANDWRITTEN_TOOL_IDS: ReadonlySet<number> = new Set(
  POSTS_INDEX.flatMap((p) => p.toolIds),
);
