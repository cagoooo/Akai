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

  <!-- Robots：v3.6.89 起，本頁不只是社群 OG landing，也作為搜尋引擎與 AI 爬蟲
       可索引的站內工具摘要頁。一般使用者仍會被 JS redirect 到 SPA 體驗；
       Googlebot / Bingbot / 社群爬蟲會停留讀取 meta 與 JSON-LD。-->
  <meta name="robots" content="index, follow">

  <!-- Canonical -->
  <link rel="canonical" href="${pageUrl}">

  <!-- Schema.org SoftwareApplication — Google rich snippets / 富片段 -->
  <script type="application/ld+json">
  ${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${pageUrl}#software`,
    name: tool.title,
    description: tool.description,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web Browser',
    url: pageUrl,
    sameAs: tool.url,
    image: imageUrl,
    isAccessibleForFree: true,
    educationalUse: ['teaching', 'classroom activity', 'elementary education'],
    audience: {
      '@type': 'EducationalAudience',
      educationalRole: 'teacher',
    },
    author: {
      '@type': 'Person',
      '@id': `${SITE_URL}/#akai`,
      name: '阿凱老師',
      affiliation: {
        '@type': 'EducationalOrganization',
        name: '桃園市龍潭區石門國民小學',
        alternateName: 'Shih Men Elementary School',
        url: 'https://www.smes.tyc.edu.tw/',
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

  <!-- Robots：許願池 OG landing 純導引用，加 noindex 避免 Search Console 報「重新導向」-->
  <meta name="robots" content="noindex, follow">
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

  <!-- Robots：heatmap 是首頁的 OG 變體（canonical 也指首頁），加 noindex 避免 Search Console
       報「替代頁面（有適當的標準標記）」。社群爬蟲不理會 noindex。-->
  <meta name="robots" content="noindex, follow">
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
 * 生成 100 工具達成紀念 landing page（/share/100.html）
 * - 社群爬蟲抓 → 拿到 celebration OG 圖（金色拼貼 + 達成日期）
 * - 一般使用者 → JS redirect 到主頁（讓 BulletinMilestone100 撒花特效接手）
 *
 * 用於：紀念分享圖 LINE / FB 廣播、blog 紀念長文 CTA、後續廣播素材
 */
function generateCelebration100PageHtml() {
  const pageUrl = `${SITE_URL}/share/100.html`;

  // 新版 OG 圖：share/celebration100/og-1200x630.png（影片頁特製，含 5:32 + ▶ 暗示）
  // 由 scripts/generate-share-100-assets.mjs 產出
  const ogCacheBust = '20260526';
  const imageUrl = `${SITE_URL}/share/celebration100/og-1200x630.png?v=${ogCacheBust}`;

  let achievedDate = '';
  try {
    const statsPath = path.resolve(__dirname, '../client/public/api/site-stats.json');
    if (fs.existsSync(statsPath)) {
      const s = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));
      if (s.milestones?.tool100) {
        const d = new Date(s.milestones.tool100);
        if (!Number.isNaN(d.getTime())) {
          achievedDate = `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
        }
      }
    }
  } catch { /* fallback */ }

  const title = `🎉 100 工具達成！· 阿凱老師教育工具集${achievedDate ? `（${achievedDate}）` : ''}`;
  const description = `從 2024 第一個工具到 2026 年 5 月 24 日的第 100 個 — 阿凱老師親手打造的 100 款國小教育工具，由教學駕駛艙、場地預約、即時投票、工具索引神器領銜。下一個 100，從你的許願開始。`;

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>${title}</title>
  <meta name="title" content="${title}">
  <meta name="description" content="${description}">
  <meta name="author" content="阿凱老師">
  <meta name="keywords" content="100 工具達成,阿凱老師,石門國小,科技教育創新專區,教育工具達成,100 milestone,教學工具集,免費教育工具">

  <!-- Favicon 套組（紀念頁專屬：深 navy 圓底 + 金色「100」） -->
  <!-- 由 scripts/generate-share-100-assets.mjs 產出於 client/public/share/celebration100/ -->
  <link rel="icon" type="image/svg+xml" href="./celebration100/favicon.svg">
  <link rel="icon" type="image/png" sizes="32x32" href="./celebration100/favicon-32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="./celebration100/favicon-16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="./celebration100/apple-touch-icon.png">
  <link rel="shortcut icon" href="./celebration100/favicon.ico">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="video.other">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:secure_url" content="${imageUrl}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="100 工具達成 — 阿凱老師 5:32 宣傳影片紀念頁">
  <meta property="og:site_name" content="科技教育創新專區">
  <meta property="og:locale" content="zh_TW">

  <!-- Twitter / LINE -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${pageUrl}">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">
  <meta name="twitter:image:alt" content="100 工具達成 — 阿凱老師 5:32 宣傳影片紀念頁">

  <link rel="canonical" href="${SITE_URL}/share/100.html">

  <!-- Schema.org: VideoObject → Google 搜尋結果可能顯示影片縮圖卡片 -->
  <script type="application/ld+json">
  ${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: '阿凱老師 100 工具達成宣傳影片',
    description: '5 分 32 秒的紀錄片風格宣傳影片：一位桃園市石門國小老師，兩年內獨立完成 100 款免費教育工具的歷程。含 zh-TW-YunJheNeural 男聲旁白與 word-level 同步字幕。',
    thumbnailUrl: `${SITE_URL}/celebration100/cover.png`,
    uploadDate: '2026-05-25',
    duration: 'PT5M32S',
    contentUrl: `${SITE_URL}/share/akai-promo-v3.mp4`,
    embedUrl: `${SITE_URL}/share/100.html`,
    inLanguage: 'zh-TW',
    isFamilyFriendly: true,
    author: { '@type': 'Person', name: '阿凱老師', url: `${SITE_URL}/` },
    publisher: {
      '@type': 'EducationalOrganization',
      name: '科技教育創新專區',
      url: `${SITE_URL}/`,
    },
    keywords: '100 工具達成,阿凱老師,石門國小,教育科技,Remotion,Edge TTS,word-level subtitle',
  }, null, 2)}
  </script>

  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #111827; --card: #1f2937; --border: #374151;
      --orange: #ff8c42; --gold: #fbbf24; --text: #f9fafb; --muted: #9ca3af;
      --font: 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', system-ui, sans-serif;
    }
    body { background: var(--bg); color: var(--text); font-family: var(--font); min-height: 100dvh; display: flex; flex-direction: column; align-items: center; }
    .header { width: 100%; max-width: 1100px; padding: 32px 24px 0; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
    .back-link { display: inline-flex; align-items: center; gap: 8px; color: var(--muted); text-decoration: none; font-size: 14px; font-weight: 600; letter-spacing: .03em; transition: color .15s; }
    .back-link:hover { color: var(--orange); }
    .badge { background: linear-gradient(135deg, var(--orange), var(--gold)); color: #111; font-size: 12px; font-weight: 900; padding: 4px 12px; border-radius: 999px; letter-spacing: .05em; }
    .title-block { width: 100%; max-width: 1100px; padding: 28px 24px 16px; text-align: center; }
    .title-main { font-size: clamp(28px, 5vw, 52px); font-weight: 900; line-height: 1.2; letter-spacing: .02em; }
    .title-main .num { background: linear-gradient(90deg, var(--orange), var(--gold)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .title-sub { margin-top: 10px; font-size: 16px; color: var(--muted); letter-spacing: .04em; }
    .video-wrap { width: 100%; max-width: 1100px; padding: 0 16px; }
    .video-container { position: relative; width: 100%; aspect-ratio: 16/9; background: #000; border-radius: 16px; overflow: hidden; box-shadow: 0 0 0 1px var(--border), 0 32px 80px rgba(0,0,0,.6), 0 0 80px rgba(255,140,66,.08); }
    video { width: 100%; height: 100%; object-fit: contain; display: block; }
    .stats { width: 100%; max-width: 1100px; padding: 20px 24px; display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
    .stat-chip { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 8px 18px; font-size: 13px; font-weight: 700; color: var(--muted); display: flex; align-items: center; gap: 6px; }
    .stat-chip .val { color: var(--text); }
    .cta-row { width: 100%; max-width: 1100px; padding: 8px 24px 48px; display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; }
    .btn-primary { display: inline-flex; align-items: center; gap: 8px; background: var(--orange); color: #fff; font-weight: 900; font-size: 15px; padding: 12px 28px; border-radius: 10px; text-decoration: none; letter-spacing: .03em; transition: opacity .15s, transform .1s; }
    .btn-primary:hover { opacity: .88; transform: translateY(-1px); }
    .btn-secondary { display: inline-flex; align-items: center; gap: 8px; background: transparent; color: var(--muted); font-weight: 700; font-size: 15px; padding: 12px 28px; border-radius: 10px; border: 1.5px solid var(--border); text-decoration: none; letter-spacing: .03em; transition: color .15s, border-color .15s; }
    .btn-secondary:hover { color: var(--text); border-color: var(--muted); }
    .footer { width: 100%; padding: 20px 24px; text-align: center; font-size: 13px; color: var(--muted); border-top: 1px solid var(--border); margin-top: auto; }
    .footer a { color: var(--orange); text-decoration: none; }
    .footer a:hover { text-decoration: underline; }
    @media (max-width: 600px) { .header { flex-direction: column; align-items: flex-start; } }
  </style>
</head>
<body>

  <header class="header">
    <a class="back-link" href="../">
      <span>←</span>
      <span>回到阿凱老師科技教育創新專區</span>
    </a>
    <span class="badge">v3.6.59 · 2026-05-25</span>
  </header>

  <div class="title-block">
    <h1 class="title-main">
      <span class="num">100</span> 個工具達成 🎉
    </h1>
    <p class="title-sub">一位國小老師，一個人，兩年做出一百款免費教育工具</p>
  </div>

  <div class="video-wrap">
    <div class="video-container">
      <video
        controls
        preload="metadata"
        poster="${SITE_URL}/celebration100/cover.png"
        aria-label="阿凱老師科技教育創新專區 100 工具達成宣傳影片"
      >
        <source src="./akai-promo-v3.mp4" type="video/mp4" />
        <p>您的瀏覽器不支援 HTML5 影片。<a href="./akai-promo-v3.mp4">點此下載</a></p>
      </video>
    </div>
  </div>

  <div class="stats">
    <div class="stat-chip">🎬 <span class="val">5:32</span> 宣傳影片</div>
    <div class="stat-chip">🛠️ <span class="val">100</span> 款工具</div>
    <div class="stat-chip">📝 <span class="val">104</span> 篇手寫長文</div>
    <div class="stat-chip">🏫 <span class="val">桃園市石門國小</span></div>
    <div class="stat-chip">📜 <span class="val">MIT 開源</span> 永久免費</div>
  </div>

  <div class="cta-row">
    <a class="btn-primary" href="../">
      🛫 立刻探索全部工具
    </a>
    <a class="btn-secondary" href="https://github.com/cagoooo/Akai" target="_blank" rel="noopener noreferrer">
      ⭐ GitHub 開源碼
    </a>
    <a class="btn-secondary" href="./akai-promo-v3.mp4" download>
      ⬇ 下載影片
    </a>
  </div>

  <footer class="footer">
    Made with ❤ by <a href="../">阿凱老師</a> ·
    <a href="https://www.smes.tyc.edu.tw/modules/tadnews/page.php?ncsn=11&nsn=16#a5" target="_blank" rel="noopener noreferrer">桃園市龍潭區石門國民小學</a>
    · MIT License · 影片音樂 CC BY
  </footer>

</body>
</html>`;
}

/**
 * 生成 100 工具達成「Kiki & Gordon 雙人對談特輯」影片頁（/share/100-dialog.html）
 * 與 100.html 並列：100.html = 5:32 旁白短宣傳；100-dialog.html = 7:02 雙人對談深度版
 *
 * 製作技術棧：
 *  - NotebookLM Pro deep_dive + short → 7:02 雙人對談 podcast
 *  - OpenAI gpt-image-1 → Kiki + Gordon 拍立得插畫
 *  - whisperx + pyannote diarization → 真實 speaker labels
 *  - OpenCC s2twp → 繁中字幕
 *  - Remotion 5 場景 → cork 公佈欄風視覺
 */
function generateCelebration100DialogPageHtml() {
  const pageUrl = `${SITE_URL}/share/100-dialog.html`;
  const ogCacheBust = '20260526';
  const imageUrl = `${SITE_URL}/share/celebration100/og-1200x630.png?v=${ogCacheBust}`;

  const title = '🎙️ 100 工具達成 · Kiki & Gordon 對談特輯 7 分鐘';
  const description = 'NotebookLM AI 兩位主持人 Kiki & Gordon 用 7 分鐘對談式深度解析阿凱老師 100 工具達成的故事 — 從 5 個里程碑工具到 3 個讓工程師朋友尖叫的技術決定。';

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>${title}</title>
  <meta name="title" content="${title}">
  <meta name="description" content="${description}">
  <meta name="author" content="阿凱老師">
  <meta name="keywords" content="100 工具達成,NotebookLM,Kiki,Gordon,雙人對談,podcast,阿凱老師,石門國小,AI 教育工具,深度解析">

  <link rel="icon" type="image/svg+xml" href="./celebration100/favicon.svg">
  <link rel="icon" type="image/png" sizes="32x32" href="./celebration100/favicon-32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="./celebration100/favicon-16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="./celebration100/apple-touch-icon.png">

  <meta property="og:type" content="video.other">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:secure_url" content="${imageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Kiki & Gordon 雙人對談特輯預覽圖">
  <meta property="og:site_name" content="科技教育創新專區">
  <meta property="og:locale" content="zh_TW">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">

  <link rel="canonical" href="${pageUrl}">

  <!-- Schema.org: VideoObject — Kiki & Gordon 雙人對談 -->
  <script type="application/ld+json">
  ${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: '100 工具達成 · Kiki & Gordon 對談特輯',
    description: '7 分 2 秒 NotebookLM AI 雙人對談視覺化長片 — 深度解析阿凱老師兩年內獨立完成 100 個教育工具的故事與技術決定。Kiki（女主持人 / 引導發問）與 Gordon（男主持人 / 內容解答）對談形式。',
    thumbnailUrl: imageUrl,
    uploadDate: '2026-05-26',
    duration: 'PT7M02S',
    contentUrl: `${SITE_URL}/share/celebration-100-dialog.mp4`,
    embedUrl: 'https://www.youtube.com/embed/5ZvBbiC521E',
    inLanguage: 'zh-TW',
    isFamilyFriendly: true,
    actor: [
      { '@type': 'Person', name: 'Kiki', description: 'AI 女主持人 · 引導發問者' },
      { '@type': 'Person', name: 'Gordon', description: 'AI 男主持人 · 內容解答者' },
    ],
    author: { '@type': 'Person', name: '阿凱老師', url: `${SITE_URL}/` },
    publisher: {
      '@type': 'EducationalOrganization',
      name: '科技教育創新專區',
      url: `${SITE_URL}/`,
    },
    keywords: '100 工具達成,Kiki,Gordon,NotebookLM,雙人對談,podcast,深度解析,阿凱老師,Remotion,whisperx',
  }, null, 2)}
  </script>

  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #1a1611; --card: #2a1f15; --border: #4a3a20;
      --cork: #c99a6c; --cork-dark: #a87850;
      --kiki: #00e5ff; --gordon: #ffb300;
      --paper: #fefdfa; --ink: #1a1a1a;
      --orange: #ff8c42; --gold: #fbbf24; --text: #f9fafb; --muted: #c8a980;
      --font: 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', system-ui, sans-serif;
    }
    body { background: var(--bg); color: var(--text); font-family: var(--font); min-height: 100dvh; display: flex; flex-direction: column; align-items: center; }
    .header { width: 100%; max-width: 1100px; padding: 32px 24px 0; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
    .back-link { display: inline-flex; align-items: center; gap: 8px; color: var(--muted); text-decoration: none; font-size: 14px; font-weight: 600; letter-spacing: .03em; transition: color .15s; }
    .back-link:hover { color: var(--orange); }
    .badge { background: linear-gradient(135deg, var(--kiki), var(--gordon)); color: #111; font-size: 12px; font-weight: 900; padding: 4px 12px; border-radius: 999px; letter-spacing: .05em; }
    .title-block { width: 100%; max-width: 1100px; padding: 28px 24px 16px; text-align: center; }
    .title-main { font-size: clamp(28px, 5vw, 48px); font-weight: 900; line-height: 1.2; letter-spacing: .02em; }
    .title-main .num { background: linear-gradient(90deg, var(--kiki), var(--gordon)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .title-sub { margin-top: 10px; font-size: 16px; color: var(--muted); letter-spacing: .04em; }

    /* Hosts intro row */
    .hosts-intro { display: flex; gap: 24px; justify-content: center; align-items: center; padding: 16px 24px 8px; flex-wrap: wrap; }
    .host-chip { display: flex; align-items: center; gap: 10px; background: var(--card); border: 1.5px solid var(--border); border-radius: 24px; padding: 8px 16px; }
    .host-chip .dot { width: 12px; height: 12px; border-radius: 50%; box-shadow: 0 0 12px currentColor; }
    .host-chip .name { font-size: 14px; font-weight: 900; color: var(--text); }
    .host-chip .role { font-size: 12px; color: var(--muted); }
    .host-chip.kiki { border-color: var(--kiki); } .host-chip.kiki .dot { background: var(--kiki); color: var(--kiki); }
    .host-chip.gordon { border-color: var(--gordon); } .host-chip.gordon .dot { background: var(--gordon); color: var(--gordon); }

    .video-wrap { width: 100%; max-width: 1100px; padding: 0 16px; }
    .video-container { position: relative; width: 100%; aspect-ratio: 16/9; background: #000; border-radius: 16px; overflow: hidden; box-shadow: 0 0 0 1px var(--border), 0 32px 80px rgba(0,0,0,.7), 0 0 60px rgba(0,229,255,.1), 0 0 60px rgba(255,179,0,.1); }
    video { width: 100%; height: 100%; object-fit: contain; display: block; }
    .stats { width: 100%; max-width: 1100px; padding: 20px 24px; display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
    .stat-chip { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 8px 18px; font-size: 13px; font-weight: 700; color: var(--muted); display: flex; align-items: center; gap: 6px; }
    .stat-chip .val { color: var(--text); }
    .tech-section { width: 100%; max-width: 900px; padding: 24px; }
    .tech-title { font-size: 14px; font-weight: 800; color: var(--muted); letter-spacing: 0.1em; margin-bottom: 12px; text-align: center; }
    .tech-stack { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
    .tech-pill { background: var(--card); border: 1px solid var(--border); padding: 4px 10px; border-radius: 6px; font-size: 11px; color: var(--muted); font-family: 'Consolas', monospace; }
    .cta-row { width: 100%; max-width: 1100px; padding: 8px 24px 48px; display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; }
    .btn-primary { display: inline-flex; align-items: center; gap: 8px; background: var(--orange); color: #fff; font-weight: 900; font-size: 15px; padding: 12px 28px; border-radius: 10px; text-decoration: none; letter-spacing: .03em; transition: opacity .15s, transform .1s; }
    .btn-primary:hover { opacity: .88; transform: translateY(-1px); }
    .btn-secondary { display: inline-flex; align-items: center; gap: 8px; background: transparent; color: var(--muted); font-weight: 700; font-size: 15px; padding: 12px 28px; border-radius: 10px; border: 1.5px solid var(--border); text-decoration: none; letter-spacing: .03em; transition: color .15s, border-color .15s; }
    .btn-secondary:hover { color: var(--text); border-color: var(--muted); }
    .footer { width: 100%; padding: 20px 24px; text-align: center; font-size: 13px; color: var(--muted); border-top: 1px solid var(--border); margin-top: auto; }
    .footer a { color: var(--orange); text-decoration: none; }
    .footer a:hover { text-decoration: underline; }
    @media (max-width: 600px) { .header { flex-direction: column; align-items: flex-start; } .hosts-intro { gap: 12px; } }
  </style>
</head>
<body>

  <header class="header">
    <a class="back-link" href="./100.html">
      <span>←</span>
      <span>回 5:32 旁白短宣傳版</span>
    </a>
    <span class="badge">v3.6.63 · 雙人對談特輯</span>
  </header>

  <div class="title-block">
    <h1 class="title-main">
      🎙️ <span class="num">Kiki &amp; Gordon</span> 對談特輯
    </h1>
    <p class="title-sub">7 分鐘深度解析 · 100 工具達成的 5 個故事 · NotebookLM AI 雙人對談</p>
  </div>

  <div class="hosts-intro">
    <div class="host-chip kiki">
      <span class="dot"></span>
      <div>
        <div class="name">🌸 Kiki</div>
        <div class="role">引導發問者 · 女主持人</div>
      </div>
    </div>
    <div style="font-size: 14px; color: var(--muted);">×</div>
    <div class="host-chip gordon">
      <span class="dot"></span>
      <div>
        <div class="name">🎙️ Gordon</div>
        <div class="role">內容解答者 · 男主持人</div>
      </div>
    </div>
  </div>

  <div class="video-wrap">
    <div class="video-container">
      <!-- 本地 mp4 = v5 繁中字幕完美版（GPT 12-18 字斷句 + speaker 邊界 split） -->
      <!-- YouTube 上的是 v4 舊字幕版（5ZvBbiC521E），待明天 quota 重置後重新上傳 v5 -->
      <video
        controls
        preload="metadata"
        poster="${SITE_URL}/share/celebration100/cover.png"
        aria-label="Kiki & Gordon 雙人對談特輯 — 100 工具達成深度解析"
        style="width:100%;height:100%;"
      >
        <source src="./celebration-100-dialog.mp4" type="video/mp4" />
        <p>您的瀏覽器不支援 HTML5 影片。<a href="./celebration-100-dialog.mp4">點此下載</a></p>
      </video>
    </div>
  </div>

  <div class="stats">
    <div class="stat-chip">🎙️ <span class="val">7:02</span> 雙人對談</div>
    <div class="stat-chip">🌸 Kiki · <span class="val">女聲</span></div>
    <div class="stat-chip">🎙️ Gordon · <span class="val">男聲</span></div>
    <div class="stat-chip">🤖 <span class="val">NotebookLM</span> AI 生成</div>
    <div class="stat-chip">🇹🇼 <span class="val">繁中字幕</span></div>
  </div>

  <div class="tech-section">
    <div class="tech-title">⚙️ 製作技術棧</div>
    <div class="tech-stack">
      <span class="tech-pill">NotebookLM deep_dive</span>
      <span class="tech-pill">OpenAI gpt-image-1</span>
      <span class="tech-pill">whisperx + pyannote diarization</span>
      <span class="tech-pill">librosa pitch verification</span>
      <span class="tech-pill">OpenCC s2twp</span>
      <span class="tech-pill">Remotion 5 場景</span>
    </div>
  </div>

  <div class="cta-row">
    <a class="btn-primary" href="../">
      🛫 立刻探索全部 100 款工具
    </a>
    <a class="btn-secondary" href="./100.html">
      🎬 看 5:32 旁白短版
    </a>
    <a class="btn-secondary" href="https://www.youtube.com/watch?v=5ZvBbiC521E" target="_blank" rel="noopener noreferrer">
      ↗ 在 YouTube 開啟
    </a>
    <a class="btn-secondary" href="./celebration-100-dialog.mp4" download>
      ⬇ 下載 720p
    </a>
  </div>

  <footer class="footer">
    Made with ❤ by <a href="../">阿凱老師</a> ·
    <a href="https://www.smes.tyc.edu.tw/modules/tadnews/page.php?ncsn=11&nsn=16#a5" target="_blank" rel="noopener noreferrer">桃園市龍潭區石門國民小學</a>
    · MIT License · Kiki &amp; Gordon by NotebookLM AI
  </footer>

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

  // 閱讀時間估算（中文 ~ 350 字/分鐘）
  const bodyLength = (post.body || '').replace(/<[^>]+>/g, '').length;
  const readingMin = Math.max(1, Math.round(bodyLength / 350));

  // BlogPosting Schema.org structured data — 給 Google rich snippets + AI 爬蟲建構知識圖譜
  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: imageUrl,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    url: pageUrl,
    author: {
      '@type': 'Person',
      '@id': `${SITE_URL}/#akai`,
      name: '阿凱老師',
      url: `${SITE_URL}/`,
    },
    publisher: {
      '@type': 'EducationalOrganization',
      name: '科技教育創新專區',
      url: `${SITE_URL}/`,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon-512.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
    inLanguage: 'zh-TW',
    keywords: keywords,
    wordCount: bodyLength,
    timeRequired: `PT${readingMin}M`,
    // 連結到此篇對應的工具（給 AI 建構工具與文章的關聯）
    about: (post.toolIds || []).map(id => ({
      '@type': 'SoftwareApplication',
      name: `阿凱老師工具 #${id}`,
      url: `${SITE_URL}/tool/${id}`,
    })),
  };

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
  <meta property="og:image:alt" content="${post.title} — 阿凱老師教學情境長文封面">
  <meta property="og:image:secure_url" content="${imageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="科技教育創新專區">
  <meta property="og:locale" content="zh_TW">
  <meta property="article:author" content="阿凱老師">
  <meta property="article:published_time" content="${post.publishedAt}">
  <meta property="article:section" content="教學情境深度長文">
  ${(post.tags || []).map(t => `<meta property="article:tag" content="${t}">`).join('\n  ')}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">
  <meta name="twitter:image:alt" content="${post.title} 封面圖">
  <link rel="canonical" href="${pageUrl}">

  <!-- Schema.org: BlogPosting — Google rich snippets + AI 知識圖譜 -->
  <script type="application/ld+json">
  ${JSON.stringify(blogPostingSchema, null, 2)}
  </script>
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

    // 抓 body 欄位（HTML 內文，用於計算 wordCount / readingTime）
    let postBody = '';
    const bodyMatch = body.match(/body:\s*`([\s\S]*?)`,/) ?? body.match(/body:\s*'([\s\S]*?)',/);
    if (bodyMatch) postBody = bodyMatch[1];

    if (slug && title) {
      posts.push({ slug, title, excerpt: excerpt || '', publishedAt: publishedAt || '', toolIds, coverEmoji, tags, body: postBody });
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

  // 生成 100 工具達成紀念 landing page（/share/100.html）
  try {
    const shareDir = path.resolve(__dirname, '../dist/public/share');
    if (!fs.existsSync(shareDir)) {
      fs.mkdirSync(shareDir, { recursive: true });
    }
    fs.writeFileSync(path.join(shareDir, '100.html'), generateCelebration100PageHtml(), 'utf-8');
    console.log('  ✅ share/100.html - 100 工具達成紀念 OG landing');
  } catch (error) {
    console.error('  ❌ share/100.html 失敗:', error.message);
    errorCount++;
  }

  // 生成 100 工具達成「Kiki & Gordon 雙人對談特輯」影片頁（/share/100-dialog.html）
  try {
    const shareDir = path.resolve(__dirname, '../dist/public/share');
    if (!fs.existsSync(shareDir)) {
      fs.mkdirSync(shareDir, { recursive: true });
    }
    fs.writeFileSync(path.join(shareDir, '100-dialog.html'), generateCelebration100DialogPageHtml(), 'utf-8');
    console.log('  ✅ share/100-dialog.html - Kiki & Gordon 雙人對談特輯 7:02');
  } catch (error) {
    console.error('  ❌ share/100-dialog.html 失敗:', error.message);
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
    // 從 posts.ts 自動 derive 有手寫長文的 toolIds 集合（取代之前硬編 99 個 ID）
    const handwrittenPosts = extractBlogPosts();
    const SKIP_IDS = new Set(handwrittenPosts.flatMap((p) => p.toolIds));
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
