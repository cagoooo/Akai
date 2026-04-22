/**
 * OG 頁面預渲染腳本
 * 為每個工具頁面生成獨立的 HTML 檔案，包含正確的 Open Graph 標籤
 * 讓社群平台爬蟲可以正確讀取分享預覽資訊
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 網站基礎 URL
const SITE_URL = 'https://cagoooo.github.io/Akai';

// 從 tools.json 提取工具資料
function extractToolsFromJson() {
  const dataPath = path.resolve(__dirname, '../client/public/api/tools.json');
  try {
    const content = fs.readFileSync(dataPath, 'utf-8');
    const tools = JSON.parse(content);
    return tools;
  } catch (error) {
    console.error('讀取 tools.json 發生錯誤:', error);
    return [];
  }
}

/**
 * 生成工具頁面 HTML
 */
function generateToolPageHtml(tool) {
  const pageUrl = `${SITE_URL}/tool/${tool.id}`;
  const imageUrl = tool.previewUrl
    ? `${SITE_URL}${tool.previewUrl.startsWith('/') ? '' : '/'}${tool.previewUrl}`
    : `${SITE_URL}/apple-touch-icon.png`;

  const fullTitle = `${tool.title} - 阿凱老師教育工具`;

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Primary Meta Tags -->
  <title>${fullTitle}</title>
  <meta name="title" content="${fullTitle}">
  <meta name="description" content="${tool.description}">
  <meta name="author" content="阿凱老師">
  <meta name="keywords" content="教育工具,${tool.title},阿凱老師,教育科技">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:title" content="${fullTitle}">
  <meta property="og:description" content="${tool.description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:width" content="1024">
  <meta property="og:image:height" content="1024">
  <meta property="og:site_name" content="教育科技創新專區">
  <meta property="og:locale" content="zh_TW">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${pageUrl}">
  <meta name="twitter:title" content="${fullTitle}">
  <meta name="twitter:description" content="${tool.description}">
  <meta name="twitter:image" content="${imageUrl}">
  <meta name="twitter:image:alt" content="${tool.title} 預覽圖">
  
  <!-- LINE -->
  <meta property="og:image:secure_url" content="${imageUrl}">
  
  <!-- Robots -->
  <meta name="robots" content="index, follow">
  
  <!-- Canonical -->
  <link rel="canonical" href="${pageUrl}">
  
  <!-- Redirect to SPA -->
  <script>
    // 重定向到 SPA 主頁面，保留路徑
    (function() {
      var ua = navigator.userAgent || '';
      var path = window.location.pathname;
      
      // 檢測是否為社群平台爬蟲（用於抓取 OG 資訊）
      // 注意：LINE 內建瀏覽器用戶 (Line/xxx) 不是爬蟲，應該正常載入應用
      // LineBot 或 Line-Networking 才是爬蟲
      var isSocialBot = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Slackbot|Discordbot|Pinterest|Googlebot|bingbot|YandexBot|LineBot|Line-Networking/i.test(ua);
      
      // 如果不是爬蟲，重定向到主應用
      if (!isSocialBot) {
        // 使用 history API 保持路徑
        window.location.replace('/Akai/' + '?redirect=' + encodeURIComponent(path));
      }
    })();
  </script>
  
  <!-- Fallback styles -->
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .loading {
      text-align: center;
      padding: 2rem;
    }
    .loading h1 {
      margin-bottom: 1rem;
      font-size: 1.5rem;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    a {
      color: white;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="loading">
    <h1>${tool.title}</h1>
    <p>${tool.description}</p>
    <div class="spinner"></div>
    <p style="margin-top: 1rem; font-size: 0.875rem;">
      正在載入中... 
      <a href="${SITE_URL}/tool/${tool.id}">點此直接前往</a>
    </p>
  </div>
</body>
</html>`;
}

/**
 * 生成許願池專屬 OG 頁面（/wish/index.html）
 * 社群爬蟲抓到這頁會看到許願池專屬的 meta 標籤和預覽圖
 * 一般使用者訪問會被 JS 自動重導至 /Akai/?wish=1 觸發對話框
 */
function generateWishPageHtml() {
  const pageUrl = `${SITE_URL}/wish/`;
  const imageUrl = `${SITE_URL}/wish-preview.png`;
  const title = '阿凱老師的許願池｜教育工具許願、使用回饋';
  const description = '想到什麼教學工具點子？給阿凱老師一點鼓勵或建議？歡迎在許願池投下你的便利貼 ✨';

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Primary Meta Tags -->
  <title>${title}</title>
  <meta name="title" content="${title}">
  <meta name="description" content="${description}">
  <meta name="author" content="阿凱老師">
  <meta name="keywords" content="許願池,教育工具許願,使用回饋,阿凱老師,教育科技創新,石門國小">
  <meta name="theme-color" content="#ea8a3e">

  <!-- 動態注入 favicon（支援 /wish/ 子路徑） -->
  <link rel="icon" href="${SITE_URL}/favicon.ico" type="image/x-icon">
  <link rel="icon" href="${SITE_URL}/favicon-32x32.png" type="image/png" sizes="32x32">
  <link rel="icon" href="${SITE_URL}/favicon-16x16.png" type="image/png" sizes="16x16">
  <link rel="apple-touch-icon" href="${SITE_URL}/apple-touch-icon.png" sizes="180x180">

  <!-- Open Graph / Facebook / LINE -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="教育科技創新專區">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:secure_url" content="${imageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:alt" content="阿凱老師的許願池 · cork 公佈欄風格預覽圖">
  <meta property="og:locale" content="zh_TW">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${pageUrl}">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">
  <meta name="twitter:image:alt" content="阿凱老師的許願池預覽圖">

  <!-- Robots & Canonical -->
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${pageUrl}">

  <!-- 自動重導至主 SPA（爬蟲不會執行 JS，只會讀 meta 標籤） -->
  <script>
    (function() {
      var ua = navigator.userAgent || '';
      var isSocialBot = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Slackbot|Discordbot|Pinterest|Googlebot|bingbot|YandexBot|LineBot|Line-Networking/i.test(ua);
      if (!isSocialBot) {
        window.location.replace('/Akai/?wish=1');
      }
    })();
  </script>

  <style>
    body {
      font-family: 'Noto Sans TC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; margin: 0;
      background: #c99a6c;
      background-image:
        radial-gradient(circle at 20% 30%, rgba(110,80,50,.35) 1px, transparent 2px),
        radial-gradient(circle at 70% 60%, rgba(140,95,55,.30) 1.5px, transparent 2.5px);
      background-size: 60px 60px, 80px 80px;
      color: #1a1a1a;
    }
    .wish-card {
      background: #fff27a;
      padding: 36px 40px;
      border-radius: 4px;
      box-shadow: 0 4px 8px rgba(0,0,0,.15), 6px 6px 0 rgba(0,0,0,.22);
      transform: rotate(-1.5deg);
      max-width: 460px;
      text-align: center;
    }
    h1 { margin: 0 0 12px; font-size: 32px; font-weight: 900; }
    p { font-size: 15px; color: #4a3a20; line-height: 1.65; }
    a {
      display: inline-block; margin-top: 20px; padding: 12px 26px;
      background: #ea8a3e; color: #fff; text-decoration: none;
      border: 2.5px solid #1a1a1a; border-radius: 10px;
      font-weight: 900; box-shadow: 4px 4px 0 rgba(0,0,0,.4);
    }
  </style>
</head>
<body>
  <div class="wish-card">
    <h1>🪄 阿凱老師的許願池</h1>
    <p>${description}</p>
    <a href="/Akai/?wish=1">📮 前往投入許願池</a>
  </div>
</body>
</html>`;
}

/**
 * 主函式
 */
async function main() {
  console.log('🚀 開始生成 OG 預覽頁面...');

  // 取得工具資料
  const tools = extractToolsFromJson();
  console.log(`📦 找到 ${tools.length} 個工具`);

  // 輸出目錄
  const outputDir = path.resolve(__dirname, '../dist/public/tool');

  // 生成每個工具的頁面
  let successCount = 0;
  let errorCount = 0;

  for (const tool of tools) {
    try {
      const toolDir = path.join(outputDir, String(tool.id));

      // 建立目錄
      if (!fs.existsSync(toolDir)) {
        fs.mkdirSync(toolDir, { recursive: true });
      }

      // 生成 HTML
      const html = generateToolPageHtml(tool);
      const htmlPath = path.join(toolDir, 'index.html');

      fs.writeFileSync(htmlPath, html, 'utf-8');
      console.log(`  ✅ tool / ${tool.id}/index.html - ${tool.title}`);
      successCount++;
    } catch (error) {
      console.error(`  ❌ tool/${tool.id} 失敗:`, error.message);
      errorCount++;
    }
  }

  // 生成許願池專屬 OG 頁面
  try {
    const wishDir = path.resolve(__dirname, '../dist/public/wish');
    if (!fs.existsSync(wishDir)) {
      fs.mkdirSync(wishDir, { recursive: true });
    }
    fs.writeFileSync(path.join(wishDir, 'index.html'), generateWishPageHtml(), 'utf-8');
    console.log('  ✅ wish/index.html - 許願池專屬 OG 頁面');
  } catch (error) {
    console.error('  ❌ wish/index.html 失敗:', error.message);
    errorCount++;
  }

  console.log('');
  console.log(`📊 生成結果: ${successCount} 成功, ${errorCount} 失敗`);
  console.log('✨ OG 預覽頁面生成完成！');
}

main().catch(console.error);
