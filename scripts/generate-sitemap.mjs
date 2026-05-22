import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_URL = 'https://cagoooo.github.io/Akai';
const TODAY = new Date().toISOString().split('T')[0];

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

// 許願池分享頁（供社群爬蟲抓取 OG 預覽）
urls.push({
    loc: `${SITE_URL}/wish/`,
    lastmod: TODAY,
    changefreq: 'monthly',
    priority: '0.9',
});

// Tool detail pages — 含 #100 工具索引神器（isInternal=true）
for (const tool of tools) {
    urls.push({
        loc: `${SITE_URL}/tool/${tool.id}`,
        lastmod: tool.addedAt ? tool.addedAt.slice(0, 10) : TODAY,
        changefreq: 'monthly',
        priority: tool.isInternal ? '0.85' : '0.8', // 索引神器略高
    });
}

// External tool URLs（指向工具實際運作的 GitHub Pages / Replit 等）
// isInternal 工具不對外（沒 url 或 url 是內部路徑），跳過
for (const tool of tools) {
    if (tool.url && !tool.isInternal && /^https?:\/\//.test(tool.url)) {
        urls.push({
            loc: tool.url,
            lastmod: TODAY,
            changefreq: 'monthly',
            priority: '0.7',
        });
    }
}

// Blog 教學情境長文 — 從 client/src/blog/posts.ts 解析
const postsPath = resolve(__dirname, '../client/src/blog/posts.ts');
const longformSlugs = [];
if (existsSync(postsPath)) {
    const postsSrc = readFileSync(postsPath, 'utf-8');
    const blockRegex = /const\s+POST_[A-Z0-9_]+:\s*BlogPost\s*=\s*\{([\s\S]*?)\n\};/g;
    let m;
    while ((m = blockRegex.exec(postsSrc)) !== null) {
        const slug = m[1].match(/slug:\s*'([^']+)'/)?.[1];
        const publishedAt = m[1].match(/publishedAt:\s*'([^']+)'/)?.[1];
        if (slug) longformSlugs.push({ slug, publishedAt: publishedAt || TODAY });
    }
    // Blog 列表頁
    urls.push({
        loc: `${SITE_URL}/blog`,
        lastmod: longformSlugs[0]?.publishedAt || TODAY,
        changefreq: 'weekly',
        priority: '0.85',
    });
    // 手寫長文
    for (const { slug, publishedAt } of longformSlugs) {
        urls.push({
            loc: `${SITE_URL}/blog/${slug}`,
            lastmod: publishedAt,
            changefreq: 'monthly',
            priority: '0.8',
        });
    }
    console.log(`📖 手寫長文：${longformSlugs.length} 篇`);
}

// 自動產生的迷你 blog（一工具一篇 SEO landing）— 跟 miniPosts.ts SKIP_IDS 同邏輯
// 純 ASCII slug 避免中文 URL encode 問題
function makeMiniSlug(tool) {
    return `tool-${tool.id}`;
}
const SKIP_IDS = new Set([81, 46, 10, 68, 3, 100, 53, 7, 88, 67, 72, 54, 76, 92, 82, 73, 51, 89, 83, 11, 87, 79, 97, 94, 41, 24, 25, 26, 27, 44, 49, 74, 75, 80, 17, 18, 20, 21, 22, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 4, 12, 13, 14, 15, 16, 43, 77, 9, 6, 69, 85, 56]); // 同 miniPosts.ts（含 62 篇手寫長文 + 索引神器）
let miniCount = 0;
for (const tool of tools) {
    if (tool.isInternal || SKIP_IDS.has(tool.id)) continue;
    urls.push({
        loc: `${SITE_URL}/blog/${makeMiniSlug(tool)}`,
        lastmod: tool.addedAt ? tool.addedAt.slice(0, 10) : TODAY,
        changefreq: 'monthly',
        priority: '0.65',
    });
    miniCount++;
}
console.log(`📝 迷你 blog（每工具一篇）：${miniCount} 篇`);

// 熱門工具拼貼 OG 變體 landing
urls.push({
    loc: `${SITE_URL}/share/heatmap.html`,
    lastmod: TODAY,
    changefreq: 'weekly',
    priority: '0.6',
});

// Generate XML
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
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
console.log(`📊 Total URLs: ${urls.length}`);
