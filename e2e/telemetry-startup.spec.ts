import { test, expect } from '@playwright/test';

test.use({ serviceWorkers: 'block' });
test('首屏不啟動驗證；未通過驗證時不傳送雲端統計', async ({ page, baseURL }) => {
  let attestations = 0;
  let analyticsCalls = 0;
  let captchaScripts = 0;
  await page.route(/firebaseappcheck\.googleapis\.com/, route => {
    attestations += 1;
    return route.fulfill({ status: 403, contentType: 'application/json',
      body: JSON.stringify({ error: { code: 403, message: 'App attestation failed.', status: 'PERMISSION_DENIED' } }) });
  });
  // 隔離測試產生的診斷不進正式監控專案。
  await page.route(/\.sentry\.io\/api\//, route => route.fulfill({ status: 200, body: '{}' }));
  page.on('request', request => {
    if (/recordPublicAnalytics/.test(request.url())) analyticsCalls += 1;
    if (/recaptcha\/enterprise\.js/.test(request.url())) captchaScripts += 1;
  });
  await page.addInitScript(() => {
    sessionStorage.setItem('akai_audience_wizard_dismissed_v1', '1');
    localStorage.setItem('hasCompletedSiteTour', 'true');
  });
  await page.goto('./?q=', { waitUntil: 'load' });
  await expect(page.getByRole('searchbox', { name: '搜尋教育工具名稱或描述' })).toBeVisible();
  await page.waitForTimeout(3500);
  expect(captchaScripts).toBe(0);
  expect(attestations).toBe(0);
  expect(analyticsCalls).toBe(0);
  await page.getByRole('searchbox', { name: '搜尋教育工具名稱或描述' }).click();
  const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(new URL(baseURL!).hostname);
  if (!local) await expect.poll(() => attestations, { timeout: 20000 }).toBeGreaterThan(0);
  await page.waitForTimeout(1000);
  expect(analyticsCalls).toBe(0);
  await page.getByRole('searchbox', { name: '搜尋教育工具名稱或描述' }).fill('石門・校園漫遊');
  await expect(page.locator('.bulletin-tool-card[data-tool-id="128"]')).toBeVisible();
});
