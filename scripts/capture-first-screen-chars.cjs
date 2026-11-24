#!/usr/bin/env node
/**
 * 擷取「常見頁面實際顯示的中文字」，存成 scripts/fonts/first-screen-chars.txt（每行「頁面名:字」），
 * 供 subset-web-font.mjs 依頁面分片：首頁第一個畫面的字放第一片、首頁其餘放第二片、部落格列表放第三片。
 *
 * 用法（先啟動預覽：GITHUB_ACTIONS=true npx vite preview --port 5192 --strictPort）：
 *   node scripts/capture-first-screen-chars.cjs http://localhost:5192/Akai/
 * 沒涵蓋到的字不會缺字，只是會落在後面的分片、需要多下載一片。
 */
const { chromium } = require('playwright');
const { writeFileSync, readFileSync } = require('node:fs');
const { resolve } = require('node:path');

const BASE = process.argv[2] || 'http://localhost:5192/Akai/';
// [名稱, 路徑, 是否捲到底, 工具資料延遲幾毫秒]
//   home    = 首頁第一個畫面：把工具資料延遲，只取載入畫面、標題區、統計區等「先出現」的字
//   homeAll = 首頁完整：工具資料到齊後的工具牆，並捲到底
//   blog    = 部落格列表
const PAGES = [['home', '', false, 20000], ['homeAll', '', true, 0], ['blog', 'blog/', true, 0]];
// 襯線字型（akai-serif-tc*.woff2）涵蓋的字，在標題等襯線文字裡不需要黑體字型；從 index.html 讀出它的 unicode-range
const html = readFileSync(resolve(__dirname, '../client/index.html'), 'utf-8');
const serifBlock = html.slice(html.indexOf('<!-- akai-serif-tc:start'), html.indexOf('<!-- akai-serif-tc:end'));
const serif = new Set();
for (const [, ranges] of serifBlock.matchAll(/unicode-range:([^}]*)\}/g)) {
  for (const r of ranges.split(',')) {
    const [lo, hi = lo] = r.trim().slice(2).split('-').map((x) => parseInt(x, 16));
    for (let cp = lo; cp <= hi; cp++) serif.add(cp);
  }
}
// 只擋會寫入／上報的請求；Firestore 讀取要放行，排行榜、訪客數等區塊才會出現
const BLOCK = /sentry\.io|ingest\.|google-analytics\.com|googletagmanager\.com|\/g\/collect|cloudfunctions\.net|\.run\.app|Firestore\/Write\/|firestore\.googleapis\.com\/.*\/documents:(commit|batchWrite|write)/i;
const TOOLS_DATA = /\/api\/tools(-lite)?\.json/;

// 在頁面裡執行：記錄「曾經出現過」的每個文字節點（連一閃而過的載入畫面也算）
function installObserver() {
  window.__seen = new Set();
  const take = (node) => {
    if (node.nodeType === 3) {
      const e = node.parentElement;
      if (!e || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(e.tagName)) return;
      const cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden') return;
      const isSerif = /serif tc/i.test(cs.fontFamily.split(',')[0]);
      for (const c of node.textContent) window.__seen.add((isSerif ? 'S' : 'N') + c);
    } else if (node.nodeType === 1) {
      const w = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
      for (let n = w.nextNode(); n; n = w.nextNode()) take(n);
    }
  };
  window.__take = take;
  new MutationObserver((ms) => {
    for (const m of ms) {
      m.addedNodes.forEach(take);
      if (m.type === 'characterData') take(m.target);
    }
  }).observe(document, { childList: true, subtree: true, characterData: true });
}

(async () => {
  const browser = await chromium.launch();
  const byPage = new Map(PAGES.map(([k]) => [k, new Set()]));
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const ctx = await browser.newContext({ viewport, locale: 'zh-TW', serviceWorkers: 'block' });
    await ctx.route(BLOCK, (r) => r.abort());
    await ctx.addInitScript(installObserver);
    for (const [key, p, scroll, delay] of PAGES) {
      const all = byPage.get(key);
      const page = await ctx.newPage();
      if (delay) {
        await page.route(TOOLS_DATA, async (r) => { await new Promise((ok) => setTimeout(ok, delay)); r.continue().catch(() => {}); });
      }
      await page.goto(BASE + p, { waitUntil: 'domcontentloaded' }).catch(() => {});
      // 分幾個時間點取樣（輪播、延遲出現的提示也會算進來）
      for (let round = 0; round < (delay ? 2 : 3); round++) {
        await page.waitForTimeout(delay ? 3000 : 4000);
        if (scroll) for (let i = 0; i < 14; i++) { await page.mouse.wheel(0, 1500); await page.waitForTimeout(250); }
        const txt = await page.evaluate(() => {
          window.__take(document.body);
          // 再加上 ::before/::after 與 placeholder
          document.querySelectorAll('*').forEach((e) => {
            for (const ps of ['::before', '::after']) {
              const c = getComputedStyle(e, ps).content;
              if (c && c !== 'none' && c !== 'normal') for (const ch of c) window.__seen.add('N' + ch);
            }
            if (e.placeholder) for (const ch of e.placeholder) window.__seen.add('N' + ch);
          });
          return [...window.__seen];
        });
        for (const tagged of txt) {
          const kind = tagged[0];
          const c = tagged.slice(1);
          const cp = c.codePointAt(0);
          if (cp <= 0x7e || (kind === 'S' && serif.has(cp))) continue; // 襯線字型自己有的字不算
          all.add(c);
        }
      }
      await page.close();
    }
    await ctx.close();
  }
  await browser.close();
  const lines = [...byPage].map(([k, set]) => k + ':' + [...set].sort().join(''));
  writeFileSync(resolve(__dirname, 'fonts/first-screen-chars.txt'), lines.join(String.fromCharCode(10)) + String.fromCharCode(10));
  console.log('已寫入 ' + [...byPage].map(([k, set]) => k + ' ' + set.size + ' 字').join('、'));
})();
