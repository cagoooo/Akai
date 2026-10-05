// Build-only assets: preload the current route rather than downloading home on every entry.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const out = resolve(root, 'dist/public');
const manifest = JSON.parse(readFileSync(resolve(out, '.vite/manifest.json'), 'utf8'));
const tools = JSON.parse(readFileSync(resolve(root, 'client/public/api/tools.json'), 'utf8'));
mkdirSync(resolve(out, 'api/tools'), { recursive: true });
for (const tool of tools) writeFileSync(resolve(out, `api/tools/${tool.id}.json`), JSON.stringify(tool));

function filesFor(key, visited = new Set()) {
  if (visited.has(key)) return [];
  visited.add(key);
  const entry = manifest[key] ?? Object.values(manifest).find(e => e.name === key);
  if (!entry) throw new Error(`Missing route build entry: ${key}`);
  return [entry.file, ...(entry.css ?? []), ...(entry.imports ?? []).flatMap(k => filesFor(k, visited))];
}
const routes = Object.fromEntries(Object.entries({
  home: 'BulletinHome',
  tool: 'src/pages/BulletinToolDetail.tsx',
  blog: 'BlogPost',
  blogList: 'BlogList',
}).map(([route, key]) => [route, filesFor(key)]));
const bodies = Object.fromEntries(Object.keys(manifest).filter(k => k.startsWith('src/blog/bodies/')).map(k => [k.split('/').pop().replace(/\.ts$/, ''), manifest[k].file]));
const script = `<script>
(function () {
  var base = location.pathname.startsWith('/Akai') ? '/Akai/' : '/';
  var redirect = new URLSearchParams(location.search).get('redirect');
  if (redirect && redirect.startsWith(base)) history.replaceState(null, '', redirect);
  var path = location.pathname.slice(base.length).replace(/\\/$/, '');
  var routes = ${JSON.stringify(routes)};
  var bodies = ${JSON.stringify(bodies)};
  var key = path === '' ? 'home' : /^tool\\/\\d+$/.test(path) && path !== 'tool/100' ? 'tool' : path === 'blog' ? 'blogList' : path.startsWith('blog/') ? 'blog' : null;
  var files = key ? routes[key].slice() : [];
  if (key === 'blog' && bodies[path.slice(5)]) files.push(bodies[path.slice(5)]);
  files.forEach(function (file) {
    if (document.querySelector('link[rel="modulepreload"][href="' + base + file + '"]')) return;
    var link = document.createElement('link'); link.rel = file.endsWith('.css') ? 'stylesheet' : 'modulepreload'; link.href = base + file; link.crossOrigin = 'anonymous'; document.head.appendChild(link);
  });
})();
</script>`;
const indexPath = resolve(out, 'index.html');
const html = readFileSync(indexPath, 'utf8');
// Keep the charset declaration ahead of the generated map (HTML encoding must be identified early).
writeFileSync(indexPath, html.replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n${script}`));
console.log(`Route loading prepared: ${tools.length} single-tool files, ${Object.keys(bodies).length} article bodies.`);
