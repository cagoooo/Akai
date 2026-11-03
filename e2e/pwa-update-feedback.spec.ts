import { test, expect } from '@playwright/test';

// 每次測試使用隔離瀏覽器與可控制的 SW，涵蓋等待、失敗及接管後重新載入。
test.use({ serviceWorkers: 'block' });
for (const width of [1280, 390]) {
  test(`更新按鈕等待回饋、失敗重試與重新載入（${width}px）`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: width === 390 ? 'reduce' : 'no-preference' });
    await page.addInitScript(() => {
      sessionStorage.setItem('akai_audience_wizard_dismissed_v1', '1');
      localStorage.setItem('hasCompletedSiteTour', 'true');
      const sw = new EventTarget();
      let calls = 0;
      let finish = () => {};
      let fail = () => {};
      const registration = Object.assign(new EventTarget(), {
        scope: location.origin + '/', waiting: null as null | { postMessage: () => void }, installing: null,
        update: () => {
          calls += 1;
          return new Promise<void>((resolve, reject) => {
            finish = () => {
              registration.waiting = { postMessage: () => {
                sessionStorage.setItem('pwa-feedback-reloaded', '1');
                sw.dispatchEvent(new Event('controllerchange'));
              } };
              resolve();
            };
            fail = () => reject(new Error('isolated network failure'));
          });
        },
      });
      Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: Object.assign(sw, {
        controller: {}, ready: Promise.resolve(registration),
        getRegistration: () => Promise.resolve(registration),
        getRegistrations: () => Promise.resolve([]), register: () => Promise.resolve(registration),
      }) });
      Object.assign(window, { pwaFeedbackTest: { calls: () => calls, finish: () => finish(), fail: () => fail() } });
    });
    // 線上 version.json 比網頁內建版本新：提示只在網頁真的不是最新版時出現（v3.6.188 起）
    await page.route('**/version.json*', (route) => route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ version: '9.9.9', cacheVersion: 'v9.9.9-e2e', gitHash: 'e2e', buildTime: '', buildTimestamp: 9_999_999_999_999 }),
    }));
    await page.goto('./?q=', { waitUntil: 'domcontentloaded' });
    await page.locator('.bulletin-tool-card').first().waitFor();
    await expect.poll(() => page.evaluate(() => !!document.querySelector('link[rel="manifest"]'))).toBe(true);
    // 提示元件為 lazy module，事件可能早於掛載；反覆通知直到 UI 收到。
    await expect.poll(async () => {
      await page.evaluate(() => window.dispatchEvent(new Event('akai:pwa-update-available')));
      return page.getByRole('button', { name: '立即更新' }).count();
    }).toBe(1);
    await expect(page.locator('.pwa-prompt-update')).toHaveCSS('opacity', '1');
    await page.getByRole('button', { name: '立即更新' }).click();
    const updating = page.getByRole('button', { name: '更新中…' });
    await expect(updating).toBeDisabled();
    await expect(page.getByRole('progressbar', { name: '正在套用更新' })).toBeVisible();
    await expect(page.getByRole('status').filter({ hasText: '完成後會自動重新載入' })).toBeVisible();
    await expect(page.getByRole('button', { name: '關閉更新提示' })).toBeDisabled();
    await expect.poll(() => page.evaluate(() => (window as unknown as { pwaFeedbackTest: { calls: () => number } }).pwaFeedbackTest.calls())).toBe(1);
    await expect(page.locator('.pwa-prompt-update')).toHaveCSS('opacity', '1');
    await page.screenshot({ path: `tmp/pwa-updating-${width}.png` });
    await page.evaluate(() => (window as unknown as { pwaFeedbackTest: { fail: () => void } }).pwaFeedbackTest.fail());
    await expect(page.getByRole('button', { name: '重試更新' })).toBeEnabled();
    await expect(page.getByRole('status').filter({ hasText: '請確認網路連線後重試' })).toBeVisible();
    await expect(page.getByRole('progressbar', { name: '正在套用更新' })).toHaveCount(0);
    await page.getByRole('button', { name: '重試更新' }).click();
    await expect(updating).toBeDisabled();
    await expect.poll(() => page.evaluate(() => (window as unknown as { pwaFeedbackTest: { calls: () => number } }).pwaFeedbackTest.calls())).toBe(2);
    await Promise.all([
      page.waitForEvent('domcontentloaded'),
      page.evaluate(() => (window as unknown as { pwaFeedbackTest: { finish: () => void } }).pwaFeedbackTest.finish()),
    ]);
    expect(await page.evaluate(() => sessionStorage.getItem('pwa-feedback-reloaded'))).toBe('1');
    await expect(page.getByRole('searchbox', { name: '搜尋教育工具名稱或描述' })).toBeVisible();
  });
}

// 連續部署時常見：網頁本身已是最新版，只有新的 Service Worker 在排隊 → 不跳提示，背景讓它接手
test('網頁已是最新版時，排隊的 Service Worker 不會跳出更新提示', async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem('akai_audience_wizard_dismissed_v1', '1');
    localStorage.setItem('hasCompletedSiteTour', 'true');
    const posted: unknown[] = [];
    const registration = Object.assign(new EventTarget(), {
      scope: location.origin + '/', installing: null, update: () => Promise.resolve(),
      waiting: { postMessage: (message: unknown) => posted.push(message) },
    });
    Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: Object.assign(new EventTarget(), {
      controller: {}, ready: Promise.resolve(registration),
      getRegistration: () => Promise.resolve(registration),
      getRegistrations: () => Promise.resolve([]), register: () => Promise.resolve(registration),
    }) });
    Object.assign(window, { pwaLatestTest: { posted } });
  });
  await page.goto('./?q=', { waitUntil: 'domcontentloaded' });
  await page.locator('.bulletin-tool-card').first().waitFor();
  await page.evaluate(() => window.dispatchEvent(new Event('akai:pwa-update-available')));
  // 背景送出 SKIP_WAITING 讓新 SW 接手，但畫面不出現「立即更新」
  await expect.poll(() => page.evaluate(() => (window as unknown as { pwaLatestTest: { posted: unknown[] } }).pwaLatestTest.posted.length), { timeout: 15000 }).toBeGreaterThan(0);
  await expect(page.getByRole('button', { name: '立即更新' })).toHaveCount(0);
});
