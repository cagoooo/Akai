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

  console.log('');
  console.log(`📊 生成結果: ${successCount} 成功, ${errorCount} 失敗`);
  console.log('✨ OG 預覽頁面生成完成！');
}

main().catch(console.error);
