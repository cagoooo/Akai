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
