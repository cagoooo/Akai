import { test, expect } from '@playwright/test';

test.use({ serviceWorkers: 'block' });

test('完整目錄仍在下載時，單張工具已可閱讀與使用', async ({ page }) => {
  let release!: () => void;
  const held = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/tools.json*', async route => {
    await held;
    await route.continue();
  });
  try {
    await page.goto('tool/81/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('button', { name: '⚡ 立即使用', exact: true })).toBeVisible();
    await expect(page.locator('.bulletin-tool-desc')).toContainText('教學駕駛艙');
  } finally {
    release();
  }
});

test('介紹從摘要換成完整排版時，不會把下方麵包屑與評論區往下推（版面位移 CLS）', async ({ page }) => {
  // 2026-10-13 量測：摘要（約 126px）換成完整介紹（約 1700px）時，原本停在畫面下緣的麵包屑與評論區被整個推走，
  // 工具頁 CLS 達 0.10～0.18。預留高度後本機約 0.03；上限抓 0.08 留餘裕給 CI 時序差異。
  await page.addInitScript(() => {
    const w = window as unknown as { __cls: number };
    w.__cls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as unknown as Array<{ value: number; hadRecentInput: boolean }>) {
        if (!entry.hadRecentInput) w.__cls += entry.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });
  await page.goto('tool/81/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.bulletin-tool-desc h2').first()).toBeVisible();
  await page.waitForTimeout(2000);
  const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
  expect(cls).toBeLessThan(0.08);
});

test('排版套件未完成下載時仍顯示摘要及使用入口', async ({ page }) => {
  let release!: () => void;
  const held = new Promise<void>((resolve) => { release = resolve; });
  await page.route('**/BulletinToolMarkdown-*.js', async (route) => {
    await held;
    await route.continue();
  });
  try {
    await page.goto('tool/81/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.bulletin-tool-desc [role="status"]')).toContainText('教學駕駛艙');
    await expect(page.getByRole('button', { name: '⚡ 立即使用', exact: true })).toBeVisible();
  } finally {
    release();
  }
  await expect(page.locator('.bulletin-tool-desc h2').first()).toBeVisible();
});

test('下載失敗可重試，且與不存在的工具分開顯示', async ({ page }) => {
  let blocked = true;
  await page.route('**/api/tools/81.json*', (route) => blocked
    ? route.fulfill({ status: 503, body: 'Unavailable' })
    : route.continue());
  await page.route('**/api/tools.json*', (route) => blocked
    ? route.fulfill({ status: 503, body: 'Unavailable' })
    : route.continue());
  await page.route('**/api/tools', (route) => route.fulfill({ status: 503, body: 'Unavailable' }));
  await page.goto('tool/81/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: '工具資料暫時無法載入', exact: true })).toBeVisible();
  blocked = false;
  await page.getByRole('button', { name: '重新載入', exact: true }).click();
  await expect(page.locator('.bulletin-tool-desc h2').first()).toBeVisible();
  await page.goto('tool/999999/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: '找不到這張拍立得', exact: true })).toBeVisible();
});
