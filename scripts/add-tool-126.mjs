#!/usr/bin/env node

/**
 * 新增工具 #126：DEADZONE 能量防線（3D 塔防射擊）
 *
 * ⚠️ 截圖注意：這是 Three.js / WebGL 2 的 3D 遊戲，headless Chromium 預設沒有 GPU，
 * 必須帶 swiftshader 旗標才畫得出戰場，否則只會截到「無法啟動 3D 戰場」的錯誤畫面。
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const ID = 126;
const URL = 'https://cagoooo.github.io/zombie/';
const TOOLS_SERVER = resolve(ROOT, 'server', 'data', 'tools.json');
const PREVIEW_DIR = resolve(ROOT, 'client', 'public', 'previews');
const PREVIEW_PATH = resolve(PREVIEW_DIR, `tool_${ID}.webp`);

const tool = {
  id: ID,
  audienceFit: {
    audiences: ['teacher', 'student'],
    schoolLevels: ['elementary', 'junior', 'senior'],
    teacherRoles: ['homeroom', 'subject', 'admin'],
    painPoints: ['student-practice', 'classroom-management', 'creative-learning', 'digital-literacy'],
    priority: 82,
    reasons: {
      teacher:
        '一款打開網址就能玩的 3D 塔防射擊：三種能量武器、三種防禦塔、十波敵人。角色不會死、敵人只攻能源核心，孩子輸掉的是「這一波沒守住」而不是「我被打死了」，很適合當成需要動腦但不會挫折的課間活動或獎勵時間。',
      student:
        '切換脈衝步槍、電漿重砲與冰霜射線，在彎道上蓋塔埋伏，撐過十波殭屍守住核心。能源有限，每一次「買塔還是升級」都是真的取捨；手機用雙搖桿也能玩，還能加到主畫面離線挑戰。',
      homeroom:
        '下課、晨光或全班達標後的十分鐘剛好玩完一局。因為玩家角色不會受傷，程度落差大的班級也不會有人一直卡在開頭，願意動腦的孩子則能挑戰第 5、10 波的巨型殭屍。',
      subject:
        '資訊課的現成 3D 教材：Three.js 場景、GLTF 模型、WebGL 2 偵測與友善降級訊息、PWA 離線、localStorage 存檔、桌機鍵鼠與手機雙搖桿雙套操作，都能直接開來對照講。數學與綜合課則可以拿塔的造價、傷害與射程數值做取捨討論。',
      admin:
        '資訊組長或活動承辦要挑一款「不用註冊、沒有廣告、不上傳個資、關掉分頁就結束」的校內遊戲素材時，這款全程在瀏覽器本機執行，進度只存在使用者自己的裝置，導入前的資安與個資盤點相對單純。',
      academic:
        '教務處規劃彈性課程或資訊課程時，可把它當成「遊戲化策略思考」的現成單元：一局約十分鐘，內建五步驟新手訓練，不必先教操作就能讓學生進入決策練習。',
      'student-affairs':
        '學務處辦理課間活動、社團或雨天備案時可直接投放：單機、免帳號、可暫停、可調速，也能在電子白板上由全班一起討論下一座塔要蓋在哪個彎道。',
    },
  },
  title: 'DEADZONE 能量防線：3D 塔防射擊',
  description:
    '三種能量武器、三種防禦塔、十波殭屍。在彎道埋伏、用有限能源在「多蓋一座塔」與「升級舊塔」之間取捨，撐過十波守住能源核心。角色不會受傷、敵人只攻核心，動腦但不挫折；桌機鍵鼠、手機雙搖桿都能玩。',
  detailedDescription: `DEADZONE｜能量防線是一款直接在瀏覽器裡跑的 3D 第三人稱射擊 × 塔防遊戲。玩家扮演最後能源站的守衛，一邊親自開槍，一邊在敵人進攻路線上布置防禦塔，目標是撐過十波殭屍、守住核心完整度。

## 玩法設計

- **三種能量武器可即時切換**（按 1／2／3 或點武器卡）：脈衝步槍高射速通用（傷害 23、射程 26）、電漿重砲範圍爆破（傷害 64、爆炸半徑 3.1）、冰霜射線持續減速控場（射速最快、減速 2.3）。武器共用一條**熱量條**，滿了就得冷卻，逼玩家間歇射擊而不是壓著滑鼠不放。
- **三種防禦塔各有分工**：脈衝哨塔 100 能源（穩定連射）、冰凍稜鏡 125 能源（低溫減速）、電漿迫擊塔 175 能源（範圍群傷）。塔可升級也可出售，出售返還已投入能源的 70%，讓「押錯位置」不是死局。
- **地圖是一條有多個直角彎的路徑**，遊戲自己在戰術提示裡說白了：彎道是最好的伏擊點，冰凍稜鏡搭配電漿迫擊塔能延長火力覆蓋。這正是塔防的核心決策——把有限的錢放在敵人停留最久的地方。
- **四種敵人依波次登場**：普通殭屍打底，第 2 波起出現快速殭屍，第 3 波起出現重型殭屍，第 5 與第 10 波各有一隻血量 1000 的巨型殭屍。起始能源 300、核心完整度 100%。
- **角色不會受傷，敵人只攻核心**。這是很關鍵的一個設計取捨：孩子不會因為「被打死」而重來，失敗回饋集中在策略層面，挫折感低很多。貨櫃、水塔、油桶與塔本身會擋住玩家射擊，走位仍然有意義。

## 技術特色

以 Three.js 建構 3D 戰場，殭屍、守衛與場景物件都是 GLTF／GLB 模型，Vite 打包後部署於 GitHub Pages。音效不是音檔，而是用 Web Audio 即時合成的音調，載入量極小。內建五步驟新手訓練、暫停與倍速、全圖視角、瞄準輔助與音效開關；桌機是 WASD 移動加滑鼠瞄準，手機則切換成左右雙搖桿。

工程細節上做了三件對校園環境很實際的事：偵測不到 WebGL 2 時會明確告訴使用者要用支援硬體加速的 Chrome 或 Edge，而不是給一片黑畫面；準備階段自動把波次、能源與塔的配置存進 localStorage，戰鬥中重新整理會回到最近一次部署；改版後若遇到舊快取造成的載入失敗，會自動註銷 Service Worker、清掉快取再重載，並在畫面上說明正在同步新版。整份遊戲附 PWA manifest 與各尺寸圖示，可加到手機或平板主畫面離線遊玩。`,
  url: URL,
  icon: 'Gamepad2',
  category: 'games',
  previewUrl: `/previews/tool_${ID}.webp`,
  ogPreviewUrl: `/previews/og/tool_${ID}.webp`,
  tags: [
    '3D塔防',
    '能量武器',
    '殭屍防守',
    '策略思考',
    '資源取捨',
    'Three.js',
    'WebGL',
    'GLTF模型',
    '手機雙搖桿',
    'PWA離線',
    '資訊課素材',
    '已建置完成',
  ],
  addedAt: '2026-09-06T00:00:00+08:00',
};

function writeTool() {
  const tools = JSON.parse(readFileSync(TOOLS_SERVER, 'utf8'));
  const current = tools.findIndex((item) => item.id === ID);
  if (current >= 0) tools[current] = tool;
  else {
    const insertIdx = tools.findIndex((item) => item.id > ID);
    if (insertIdx === -1) tools.push(tool);
    else tools.splice(insertIdx, 0, tool);
  }
  writeFileSync(TOOLS_SERVER, `${JSON.stringify(tools, null, 2)}\n`, 'utf8');
}

async function capturePreview() {
  mkdirSync(PREVIEW_DIR, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    // headless Chromium 沒有 GPU，靠 SwiftShader 軟體渲染才畫得出 WebGL 2 戰場
    args: [
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader',
      '--ignore-gpu-blocklist',
    ],
  });
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 1280 },
      deviceScaleFactor: 2,
    });
    await context.addInitScript(() => {
      const dismissKeys = [
        'tyc_tut_done',
        'tyc_known_version',
        'tyc_nokey_collapsed',
        'tyc_notify',
        'tour_complete',
        'onboarding_done',
        'hasSeenTour',
        'tutorial_dismissed',
        'cookie_accepted',
        'announcement_dismissed',
        'welcome_shown',
        'akai_onboarded_v1',
        'akai_install_dismissed',
      ];
      dismissKeys.forEach((key) => localStorage.setItem(key, '1'));
      // DEADZONE 自己的新手訓練提示條，設成 done 才不會蓋住戰場
      localStorage.setItem('deadzone-tutorial', 'done');
    });
    const page = await context.newPage();
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    // 3D 模型與貼圖載入比一般網站久，多等一點
    await page.waitForTimeout(10000);
    await page.evaluate(() => {
      const selectors = [
        '.driver-popover',
        '.driver-overlay',
        '.driver-active-element',
        '.shepherd-element',
        '.shepherd-modal-overlay-container',
        '.introjs-overlay',
        '.introjs-helperLayer',
        '.introjs-tooltipReferenceLayer',
        '#updateBanner',
        '#cookieBanner',
        '#announcement',
        '#chunk-recovery',
        '[class*="cookie-banner"]',
        '[class*="cookie-consent"]',
        '[class*="onboard"]',
        '[class*="tour-tooltip"]',
        '.akai-ob-bg',
        '.akai-ob-modal',
        '[class*="akai-ob-"]',
      ];
      selectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((element) => element.remove());
      });
      const tutorial = document.getElementById('tutorial');
      if (tutorial) tutorial.hidden = true;
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1200);
    const image = await page.screenshot({ type: 'png', fullPage: false });
    await sharp(image)
      .resize(1024, 1024, { fit: 'cover', position: 'top' })
      .webp({ quality: 90 })
      .toFile(PREVIEW_PATH);
  } finally {
    await browser.close();
  }
}

console.log(`🚀 開始新增 #${ID} ${tool.title}`);
await capturePreview();
console.log(`📸 卡片主圖已保存：${PREVIEW_PATH}`);
writeTool();
console.log(`✅ server/data/tools.json 已寫入 #${ID}，請接著執行 npm run sync-tools-json`);
