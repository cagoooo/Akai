import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_URL = 'https://cagoooo.github.io/Akai';
const TODAY = new Date().toISOString().split('T')[0];
// v3.6.181 起爬蟲版工具頁／文章頁改放完整內容；lastmod 取「發布日」與此日期較晚者，
// 讓 Google 知道這批頁面在這天有實質更新（不要每次建置都用 TODAY，否則 lastmod 失去參考價值）
const CRAWLER_CONTENT_UPDATED = '2026-11-03';
const atLeastCrawlerUpdate = (date) => (date && date > CRAWLER_CONTENT_UPDATED ? date : CRAWLER_CONTENT_UPDATED);

// Read tools.json
const toolsPath = resolve(__dirname, '../client/public/api/tools.json');
const tools = JSON.parse(readFileSync(toolsPath, 'utf-8'));

// Build URL entries
const urls = [];

// Main page
urls.push({
    loc: `${SITE_URL}/`,
    lastmod: TODAY,
    changefreq: 'weekly',
    priority: '1.0',
});

// 自然語言情境導覽頁：給搜尋引擎與 AI 助手一個穩定的高優先級入口，
// 由 generate-geo-index.mjs 產出靜態 HTML。
urls.push({
    loc: `${SITE_URL}/geo/`,
    lastmod: TODAY,
    changefreq: 'weekly',
    priority: '0.9',
});

// ⚠️ 不列入 sitemap 的頁面（與 generate-og-pages.mjs 的 noindex 決策對齊）：
//   - /wish/              → OG 分享頁，<meta robots="noindex">（純導流，真人 JS 導回主站）
//   - /share/heatmap.html → 首頁 OG 變體，noindex + canonical 指向首頁
// sitemap 列出 noindex 網址會讓 Search Console 報「已提交網址被標記為 noindex」矛盾警告，故一律排除。
//
// v3.6.89 GEO 策略更新：
//   - /tool/{id} 已改為可索引的站內工具摘要頁（generate-og-pages.mjs 產出 index, follow）
//   - /blog/{slug} 承接教學情境與長尾查詢
// 這兩層加上頁面內「立即使用」的實際工具連結，讓 AI 搜尋建立「工具摘要頁 → 使用情境文章 → 實際工具」關係。
//
// ⚠️ v3.6.184：不再列外部工具網址（其他 GitHub repo、Replit、學校主機等，曾有 132 筆）。
//   Sitemap 規範只接受與 sitemap 同一路徑（/Akai/）底下的網址；Search Console 這份 sitemap
//   自 2026-08 起一直「無法擷取」、探索到 0 頁。實際工具改由爬蟲版工具頁／文章頁的連結讓搜尋引擎發現。

// 站內工具詳情頁（科技教育專區 canonical 工具節點）
// isInternal（例如 #100 工具索引神器）也保留，因為它有明確站內路由與內容。
let toolDetailCount = 0;
for (const tool of tools) {
    urls.push({
        loc: `${SITE_URL}/tool/${tool.id}/`,
        lastmod: atLeastCrawlerUpdate(tool.addedAt?.slice(0, 10)),
        changefreq: tool.addedAt ? 'monthly' : 'yearly',
        priority: tool.isInternal ? '0.72' : '0.78',
    });
    toolDetailCount++;
}
console.log(`🧭 站內工具詳情頁：${toolDetailCount} 頁`);


// Blog 教學情境長文 — 從 client/src/blog/posts.ts 解析
const postsPath = resolve(__dirname, '../client/src/blog/posts.ts');
const longformSlugs = [];
// 已有手寫長文覆蓋的 toolIds 集合（從 POSTS 自動 derive，取代之前硬編的 99 ID 列表）
const SKIP_IDS = new Set();
if (existsSync(postsPath)) {
    const postsSrc = readFileSync(postsPath, 'utf-8');
    const blockRegex = /const\s+POST_[A-Z0-9_]+:\s*BlogPost\s*=\s*\{([\s\S]*?)\n\};/g;
    let m;
    while ((m = blockRegex.exec(postsSrc)) !== null) {
        const slug = m[1].match(/slug:\s*'([^']+)'/)?.[1];
        const publishedAt = m[1].match(/publishedAt:\s*'([^']+)'/)?.[1];
        const toolIdsMatch = m[1].match(/toolIds:\s*\[([\d,\s]+)\]/);
        if (toolIdsMatch) {
            for (const part of toolIdsMatch[1].split(',')) {
                const n = parseInt(part.trim(), 10);
                if (Number.isFinite(n)) SKIP_IDS.add(n);
            }
        }
        if (slug) longformSlugs.push({ slug, publishedAt: publishedAt || TODAY });
    }
    // Blog 列表頁
    urls.push({
        loc: `${SITE_URL}/blog/`,
        lastmod: atLeastCrawlerUpdate(longformSlugs[0]?.publishedAt),
        changefreq: 'weekly',
        priority: '0.85',
    });
    // 手寫長文
    for (const { slug, publishedAt } of longformSlugs) {
        urls.push({
            loc: `${SITE_URL}/blog/${slug}/`,
            lastmod: atLeastCrawlerUpdate(publishedAt),
            changefreq: 'monthly',
            priority: '0.8',
        });
    }
    console.log(`📖 手寫長文：${longformSlugs.length} 篇 / 涵蓋 ${SKIP_IDS.size} 個工具`);
}

// 自動產生的迷你 blog（一工具一篇 SEO landing）
// SKIP_IDS 已從 posts.ts derive，新增手寫長文時 sitemap 自動同步
function makeMiniSlug(tool) {
    return `tool-${tool.id}`;
}
let miniCount = 0;
for (const tool of tools) {
    if (tool.isInternal || SKIP_IDS.has(tool.id)) continue;
    urls.push({
        loc: `${SITE_URL}/blog/${makeMiniSlug(tool)}/`,
        lastmod: tool.addedAt ? tool.addedAt.slice(0, 10) : TODAY,
        changefreq: 'monthly',
        priority: '0.65',
    });
    miniCount++;
}
console.log(`📝 迷你 blog（每工具一篇）：${miniCount} 篇`);

// 註：/share/heatmap.html 為首頁 OG 變體（noindex + canonical 指首頁），不列入 sitemap（見檔頭說明）

// 🆕 v3.6.67: 2026 AIFED 演講子站（簡報 + 學術稿件 + 即時頁）
urls.push({
    loc: `${SITE_URL}/akai-talk-2026/`,
    lastmod: TODAY,
    changefreq: 'monthly',
    priority: '0.8',
});
urls.push({
    loc: `${SITE_URL}/akai-talk-2026/AIFED2026_paper.pdf`,
    lastmod: TODAY,
    changefreq: 'yearly',
    priority: '0.7',
});

// 去除重複網址（例如多個工具共用同一個實際站點），避免 sitemap
// 重複提交同一 URL 讓 Search Console 與 AI crawler 多做一次工作。
const uniqueUrls = [...new Map(urls.map((entry) => [entry.loc, entry])).values()];
if (uniqueUrls.length !== urls.length) {
    console.log(`🧹 Sitemap 去除重複網址：${urls.length - uniqueUrls.length} 筆`);
}

// Generate XML
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueUrls
    .map(
        (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join('\n')}
</urlset>
`;

function escapeXml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// Write sitemap.xml — 寫 public/（被 vite 帶進 dist）
const outputPath = resolve(__dirname, '../client/public/sitemap.xml');
writeFileSync(outputPath, xml, 'utf-8');

// 順手檢查 robots.txt 是否有 Sitemap: 行
const robotsPath = resolve(__dirname, '../client/public/robots.txt');
if (existsSync(robotsPath)) {
    let robots = readFileSync(robotsPath, 'utf-8');
    const sitemapLine = `Sitemap: ${SITE_URL}/sitemap.xml`;
    if (!robots.includes('Sitemap:')) {
        robots = robots.trim() + '\n\n' + sitemapLine + '\n';
        writeFileSync(robotsPath, robots, 'utf-8');
        console.log('🤖 robots.txt 已補上 Sitemap: 指向');
    }
}

console.log(`✅ Sitemap generated: ${outputPath}`);
console.log(`📊 Total URLs: ${uniqueUrls.length}`);
