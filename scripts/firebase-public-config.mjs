import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const FIREBASE_PUBLIC_PAGES = [
  'akai-talk-2026/admin-questions.html',
  'akai-talk-2026/live-questions.html',
  'akai-talk-2026/live-stats.html',
];

const CONFIG_NAMES = [
  'API_KEY', 'AUTH_DOMAIN', 'PROJECT_ID', 'STORAGE_BUCKET',
  'MESSAGING_SENDER_ID', 'APP_ID',
];

// 這些是瀏覽器公開設定；真正的授權仍由 Firebase 規則及金鑰限制負責。
export function injectFirebasePublicConfig(html, environment) {
  const missing = CONFIG_NAMES.filter(name => !environment[`VITE_FIREBASE_${name}`]?.trim());
  if (missing.length) {
    throw new Error(`Firebase 公開頁設定缺少：${missing.map(name => `VITE_FIREBASE_${name}`).join(', ')}`);
  }
  let result = html;
  for (const name of CONFIG_NAMES) {
    const placeholder = JSON.stringify(`__FIREBASE_${name}__`);
    if (!result.includes(placeholder)) {
      throw new Error(`Firebase 公開頁缺少佔位符：__FIREBASE_${name}__`);
    }
    // 保持 JS 字串語境，避免設定值提前關閉 script 標籤。
    const value = JSON.stringify(environment[`VITE_FIREBASE_${name}`])
      .replaceAll('<', '\\u003c').replaceAll('\u2028', '\\u2028').replaceAll('\u2029', '\\u2029');
    result = result.replaceAll(placeholder, () => value);
  }
  return result;
}

export function firebasePublicConfigPlugin() {
  let config;
  return {
    name: 'akai-firebase-public-config',
    configResolved(resolvedConfig) { config = resolvedConfig; },
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const pathname = new URL(request.url || '/', 'http://localhost').pathname;
        const page = FIREBASE_PUBLIC_PAGES.find(file => pathname === `${config.base}${file}`);
        if (!page) return next();
        try {
          const source = readFileSync(resolve(config.publicDir, page), 'utf8');
          response.setHeader('Content-Type', 'text/html; charset=utf-8');
          response.setHeader('Cache-Control', 'no-store');
          response.end(injectFirebasePublicConfig(source, config.env));
        } catch {
          response.statusCode = 503;
          response.setHeader('Content-Type', 'text/plain; charset=utf-8');
          response.end('公開頁設定尚未完成，請檢查本機環境設定。');
        }
      });
    },
    closeBundle() {
      if (config.command !== 'build') return;
      for (const page of FIREBASE_PUBLIC_PAGES) {
        const target = resolve(config.root, config.build.outDir, page);
        writeFileSync(target, injectFirebasePublicConfig(readFileSync(target, 'utf8'), config.env), 'utf8');
      }
    },
  };
}
