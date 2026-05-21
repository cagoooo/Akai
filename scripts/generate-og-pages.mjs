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

  // 優先用 ogPreviewUrl（1200×630 設計過的社群分享圖）
  // 沒有才 fallback 到 previewUrl（1024×1024 卡片預覽截圖）
  // 都沒有才用 apple-touch-icon.png
  const ogPath = tool.ogPreviewUrl || tool.previewUrl;
  const imageUrl = ogPath
    ? `${SITE_URL}${ogPath.startsWith('/') ? '' : '/'}${ogPath}`
    : `${SITE_URL}/apple-touch-icon.png`;
  const isUnifiedOg = !!tool.ogPreviewUrl;
  const imgWidth = isUnifiedOg ? 1200 : 1024;
  const imgHeight = isUnifiedOg ? 630 : 1024;

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
  <meta property="og:image:width" content="${imgWidth}">
  <meta property="og:image:height" content="${imgHeight}">
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

  <!-- Schema.org SoftwareApplication — Google rich snippets / 富片段 -->
  <script type="application/ld+json">
  ${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.title,
    description: tool.description,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web Browser',
    url: pageUrl,
    image: imageUrl,
    author: {
      '@type': 'Person',
      name: '阿凱老師',
      affiliation: {
        '@type': 'EducationalOrganization',
        name: '桃園市龍潭區石門國民小學',
      },
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'TWD',
      availability: 'https://schema.org/InStock',
    },
    keywords: ['教育工具', tool.title, '阿凱老師', '石門國小', ...(tool.tags || [])].join(','),
    inLanguage: 'zh-TW',
  })}
  </script>
  
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

  // 從 version.json 讀 cacheVersion，讓 og:image URL 每次部署都變
  // → 避免 FB/LINE/Twitter 因自己的 CDN 快取仍顯示舊圖
  let imgVer = Date.now().toString(36);
  try {
    const versionPath = path.resolve(__dirname, '../client/public/version.json');
    if (fs.existsSync(versionPath)) {
      const v = JSON.parse(fs.readFileSync(versionPath, 'utf-8'));
      imgVer = v.cacheVersion || v.version || imgVer;
    }
  } catch { /* fallback to timestamp */ }

  const imageUrl = `${SITE_URL}/wish-preview.png?v=${encodeURIComponent(imgVer)}`;
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
        // 使用 sessionStorage 傳遞「請開啟許願池對話框」的信號，
        // 避免用 ?wish=1 query string 需要載入後再清除（會造成三次 URL 變動）
        try { sessionStorage.setItem('openWishOnLoad', '1'); } catch (e) {}
        window.location.replace('/Akai/');
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
 * 生成 heatmap OG 變體 landing page（/share/heatmap.html）
 * - 社群爬蟲抓 → 拿到 heatmap 拼貼 OG 圖（含前 4 熱門工具拍立得）
 * - 一般使用者 → JS redirect 到主頁
 *
 * 用途：當使用者想呈現「實際工具長相」而非單純數字時，分享這個 URL
 */
function generateHeatmapPageHtml() {
  const pageUrl = `${SITE_URL}/share/heatmap.html`;

  // 從 site-stats.json 讀 ogImageHeatmap（由 generate-home-og-heatmap.mjs 寫入）
  let heatmapImageUrl = `${SITE_URL}/og-preview.png`;
  let toolCount = 90;
  try {
    const statsPath = path.resolve(__dirname, '../client/public/api/site-stats.json');
    if (fs.existsSync(statsPath)) {
      const s = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));
      if (s.ogImageHeatmapAbsolute) heatmapImageUrl = s.ogImageHeatmapAbsolute;
      if (s.toolCount) toolCount = s.toolCount;
    }
  } catch { /* fallback */ }

  const displayCount = toolCount >= 100 ? `${Math.floor(toolCount / 10) * 10}+` : `${toolCount}`;
  const title = `科技教育創新專區 · 阿凱老師｜${displayCount} 款國小教育工具熱門精選`;
  const description = `來看阿凱老師親手打造的熱門 4 大教育工具拼貼預覽：MBTI 校園奇遇記、點亮詩意、PIRLS 閱讀理解生成站、教師回覆小幫手⋯⋯共 ${toolCount} 款免費教育工具，免註冊一鍵分享給學生。`;

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>${title}</title>
  <meta name="title" content="${title}">
  <meta name="description" content="${description}">
  <meta name="author" content="阿凱老師">
  <meta name="keywords" content="教育科技,熱門教育工具,精選教育工具,國小教育,阿凱老師,石門國小,${toolCount} 款教育工具">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${heatmapImageUrl}">
  <meta property="og:image:secure_url" content="${heatmapImageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="阿凱老師熱門教育工具拼貼預覽">
  <meta property="og:site_name" content="科技教育創新專區">
  <meta property="og:locale" content="zh_TW">

  <!-- Twitter / LINE -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${pageUrl}">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${heatmapImageUrl}">

  <link rel="canonical" href="${SITE_URL}/">

  <script>
    (function() {
      var ua = navigator.userAgent || '';
      var isSocialBot = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Slackbot|Discordbot|Pinterest|Googlebot|bingbot|YandexBot|LineBot|Line-Networking/i.test(ua);
      if (!isSocialBot) {
        // 一般使用者 → 主頁
        window.location.replace('/Akai/');
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
    .heatmap-card {
      background: #fff27a;
      padding: 36px 40px;
      border-radius: 6px;
      box-shadow: 0 4px 8px rgba(0,0,0,.15), 6px 6px 0 rgba(0,0,0,.22);
      transform: rotate(-1.2deg);
      max-width: 520px;
      text-align: center;
    }
    h1 { margin: 0 0 12px; font-size: 28px; font-weight: 900; }
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
  <div class="heatmap-card">
    <h1>🔥 ${displayCount} 款熱門教育工具</h1>
    <p>${description}</p>
    <a href="/Akai/">📚 前往主頁探索全部工具</a>
  </div>
</body>
</html>`;
}

/**
 * 為每篇 blog post 產 static OG landing page（/blog/{slug}/index.html）
 * 與 /blog 列表頁（/blog/index.html）
 *
 * - 社群爬蟲抓 → 拿到 blog 專屬 OG meta（含文章標題、摘要、相關工具）
 * - 一般使用者 → JS redirect 回 SPA `/Akai/blog` 或 `/Akai/blog/{slug}`
 *
 * 為何要這樣做：GH Pages 是純靜態，SPA route /blog/* 一律走 404.html
 * → 爬蟲讀不到對的 OG。產對應 index.html 在 dist/public/blog/{slug}/ 內，
 * 爬蟲訪問時直接命中、拿到正確 meta。
 */
function generateBlogIndexHtml(posts) {
  const pageUrl = `${SITE_URL}/blog`;
  const title = '📖 教學情境部落格 · 阿凱老師教育工具集';
  const description = `阿凱老師親手撰寫的工具使用情境長文 — ${posts.length} 篇文章，每篇講一個熱門工具如何解決真實教學現場的問題，含實測數字、學生回饋、配對推薦。`;

  // 用最新一篇的 cover emoji 當 OG 圖（fallback 用主 OG）
  let imageUrl = `${SITE_URL}/og-preview.png`;
  try {
    const statsPath = path.resolve(__dirname, '../client/public/api/site-stats.json');
    if (fs.existsSync(statsPath)) {
      const s = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));
      if (s.ogImageAbsolute) imageUrl = s.ogImageAbsolute;
    }
  } catch { /* fallback */ }

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:site_name" content="科技教育創新專區">
  <meta property="og:locale" content="zh_TW">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">
  <link rel="canonical" href="${pageUrl}">
  <script>
    (function() {
      var ua = navigator.userAgent || '';
      var isBot = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Slackbot|Discordbot|Pinterest|Googlebot|bingbot|YandexBot|LineBot|Line-Networking/i.test(ua);
      // 不能直接 replace('/Akai/blog') — GH Pages 看到沒 trailing slash 的目錄會 301 加 /，
      // 又載入同個 landing 造成無限循環。改走 /Akai/?redirect=... 讓主頁的 SPA 接管。
      if (!isBot) {
        window.location.replace('/Akai/?redirect=' + encodeURIComponent('/Akai/blog'));
      }
    })();
  </script>
  <style>body{font-family:'Noto Sans TC',-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#c99a6c;color:#1a1a1a;text-align:center}.card{background:#fff27a;padding:32px 36px;border-radius:6px;box-shadow:6px 6px 0 rgba(0,0,0,.22);transform:rotate(-1deg);max-width:500px}h1{margin:0 0 12px;font-size:28px;font-weight:900}a{display:inline-block;margin-top:18px;padding:11px 24px;background:#ea8a3e;color:#fff;text-decoration:none;border:2.5px solid #1a1a1a;border-radius:10px;font-weight:900;box-shadow:4px 4px 0 rgba(0,0,0,.4)}</style>
</head>
<body>
  <div class="card">
    <h1>📖 教學情境部落格</h1>
    <p>${description}</p>
    <a href="/Akai/blog">📚 前往看所有文章</a>
  </div>
</body>
</html>`;
}

function generateBlogPostHtml(post) {
  const pageUrl = `${SITE_URL}/blog/${post.slug}`;
  const title = `${post.title} · 阿凱老師教學情境長文`;
  const description = post.excerpt;
  // OG 圖 — 用第一個相關工具的 ogPreviewUrl
  let imageUrl = `${SITE_URL}/og-preview.png`;
  if (post.toolIds && post.toolIds.length > 0) {
    imageUrl = `${SITE_URL}/previews/og/tool_${post.toolIds[0]}.webp`;
  }
  const keywords = ['教學情境', '阿凱老師', '教育工具', ...(post.tags || [])].join(',');

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="keywords" content="${keywords}">
  <meta name="author" content="阿凱老師">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:secure_url" content="${imageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="科技教育創新專區">
  <meta property="og:locale" content="zh_TW">
  <meta property="article:author" content="阿凱老師">
  <meta property="article:published_time" content="${post.publishedAt}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">
  <link rel="canonical" href="${pageUrl}">
  <script>
    (function() {
      var ua = navigator.userAgent || '';
      var isBot = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Slackbot|Discordbot|Pinterest|Googlebot|bingbot|YandexBot|LineBot|Line-Networking/i.test(ua);
      // 同 blog 列表的修法：不能直接 replace 沒 trailing slash 的目錄路徑（無限循環）
      if (!isBot) {
        window.location.replace('/Akai/?redirect=' + encodeURIComponent('/Akai/blog/${post.slug}'));
      }
    })();
  </script>
  <style>body{font-family:'Noto Sans TC',-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#c99a6c;color:#1a1a1a;text-align:center}.card{background:#fff27a;padding:32px 36px;border-radius:6px;box-shadow:6px 6px 0 rgba(0,0,0,.22);transform:rotate(-1deg);max-width:520px}h1{margin:0 0 12px;font-size:24px;font-weight:900;line-height:1.4}p{color:#4a3a20;line-height:1.65}a{display:inline-block;margin-top:18px;padding:11px 24px;background:#ea8a3e;color:#fff;text-decoration:none;border:2.5px solid #1a1a1a;border-radius:10px;font-weight:900;box-shadow:4px 4px 0 rgba(0,0,0,.4)}</style>
</head>
<body>
  <div class="card">
    <h1>${post.coverEmoji} ${post.title}</h1>
    <p>${description}</p>
    <a href="/Akai/blog/${post.slug}">📖 閱讀全文</a>
  </div>
</body>
</html>`;
}

/**
 * 從 client/src/blog/posts.ts 解析 POSTS 陣列
 * 用簡單 regex（避免 import TS 在 Node ESM 不易）
 */
function extractBlogPosts() {
  const postsPath = path.resolve(__dirname, '../client/src/blog/posts.ts');
  if (!fs.existsSync(postsPath)) return [];
  const src = fs.readFileSync(postsPath, 'utf-8');
  // 抓所有 BlogPost 物件 — 用 slug / title / excerpt / publishedAt / toolIds / coverEmoji / tags
  const posts = [];
  const blockRegex = /const\s+POST_[A-Z0-9_]+:\s*BlogPost\s*=\s*\{([\s\S]*?)\n\};/g;
  let m;
  while ((m = blockRegex.exec(src)) !== null) {
    const body = m[1];
    const slug = body.match(/slug:\s*'([^']+)'/)?.[1];
    const title = body.match(/title:\s*'([^']+)'/)?.[1]
      ?? body.match(/title:\s*\n?\s*'([^']+)'/)?.[1];
    const excerpt = body.match(/excerpt:\s*\n?\s*'([^']+)'/)?.[1]
      ?? body.match(/excerpt:\s*'([^']+)'/)?.[1];
    const publishedAt = body.match(/publishedAt:\s*'([^']+)'/)?.[1];
    const toolIdsMatch = body.match(/toolIds:\s*\[([\d,\s]+)\]/);
    const toolIds = toolIdsMatch ? toolIdsMatch[1].split(',').map((s) => parseInt(s.trim(), 10)).filter(Number.isFinite) : [];
    const coverEmoji = body.match(/coverEmoji:\s*'([^']+)'/)?.[1] || '📖';
    const tagsMatch = body.match(/tags:\s*\[([^\]]+)\]/);
    const tags = tagsMatch ? tagsMatch[1].split(',').map((s) => s.trim().replace(/^'|'$/g, '')).filter(Boolean) : [];

    if (slug && title) {
      posts.push({ slug, title, excerpt: excerpt || '', publishedAt: publishedAt || '', toolIds, coverEmoji, tags });
    }
  }
  return posts;
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

  // 生成熱門工具拼貼 OG 變體頁面（/share/heatmap.html）
  try {
    const shareDir = path.resolve(__dirname, '../dist/public/share');
    if (!fs.existsSync(shareDir)) {
      fs.mkdirSync(shareDir, { recursive: true });
    }
    fs.writeFileSync(path.join(shareDir, 'heatmap.html'), generateHeatmapPageHtml(), 'utf-8');
    console.log('  ✅ share/heatmap.html - 熱門工具拼貼 OG 變體頁面');
  } catch (error) {
    console.error('  ❌ share/heatmap.html 失敗:', error.message);
    errorCount++;
  }

  // 生成 blog static OG landing pages（手寫長文 5 篇）
  try {
    const posts = extractBlogPosts();
    const blogDir = path.resolve(__dirname, '../dist/public/blog');
    if (!fs.existsSync(blogDir)) fs.mkdirSync(blogDir, { recursive: true });
    fs.writeFileSync(path.join(blogDir, 'index.html'), generateBlogIndexHtml(posts), 'utf-8');
    console.log(`  ✅ blog/index.html - 部落格列表 OG landing`);
    for (const post of posts) {
      const postDir = path.join(blogDir, post.slug);
      if (!fs.existsSync(postDir)) fs.mkdirSync(postDir, { recursive: true });
      fs.writeFileSync(path.join(postDir, 'index.html'), generateBlogPostHtml(post), 'utf-8');
      console.log(`  ✅ blog/${post.slug}/index.html - ${post.title.slice(0, 30)}...`);
    }
  } catch (error) {
    console.error(`  ❌ blog/* 失敗:`, error.message);
    errorCount++;
  }

  // 生成迷你 blog OG landing pages（每工具一篇 SEO landing）
  try {
    const SKIP_IDS = new Set([81, 46, 10, 68, 3, 100, 53, 7, 88, 67, 72, 54, 76, 92, 82, 73, 51, 89, 83, 11, 87, 79, 97, 94, 41, 24, 25, 26, 27, 44, 49, 74, 75, 80]); // 同 miniPosts.ts（含 33 篇手寫長文 + 索引神器）
    const blogDir = path.resolve(__dirname, '../dist/public/blog');
    let miniGenerated = 0;
    for (const tool of tools) {
      if (tool.isInternal || SKIP_IDS.has(tool.id)) continue;
      // 純 ASCII slug — 與 miniPosts.ts 一致（避免中文 URL encode 問題）
      const slug = `tool-${tool.id}`;
      const miniPost = {
        slug,
        title: `【30 秒看完】#${tool.id} ${tool.title}：適合誰用？怎麼開始？`,
        excerpt: (tool.description || '').slice(0, 100),
        publishedAt: tool.addedAt || '2024-06-01',
        toolIds: [tool.id],
        coverEmoji: '🔖',
        tags: tool.tags || [],
      };
      const postDir = path.join(blogDir, slug);
      if (!fs.existsSync(postDir)) fs.mkdirSync(postDir, { recursive: true });
      fs.writeFileSync(path.join(postDir, 'index.html'), generateBlogPostHtml(miniPost), 'utf-8');
      miniGenerated++;
    }
    console.log(`  ✅ 迷你 blog OG landing: ${miniGenerated} 篇`);
  } catch (error) {
    console.error(`  ❌ 迷你 blog landing 失敗:`, error.message);
    errorCount++;
  }

  console.log('');
  console.log(`📊 生成結果: ${successCount} 成功, ${errorCount} 失敗`);
  console.log('✨ OG 預覽頁面生成完成！');
}

main().catch(console.error);
