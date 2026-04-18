import { readFileSync, writeFileSync } from 'fs';
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

// Tool detail pages
for (const tool of tools) {
    urls.push({
        loc: `${SITE_URL}/tool/${tool.id}`,
        lastmod: TODAY,
        changefreq: 'monthly',
        priority: '0.8',
    });
}

// External tool URLs
for (const tool of tools) {
    if (tool.url) {
        urls.push({
            loc: tool.url,
            lastmod: TODAY,
            changefreq: 'monthly',
            priority: '0.7',
        });
    }
}

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

// Write sitemap.xml
const outputPath = resolve(__dirname, '../client/public/sitemap.xml');
writeFileSync(outputPath, xml, 'utf-8');

console.log(`Sitemap generated: ${outputPath}`);
console.log(`Total URLs: ${urls.length}`);
