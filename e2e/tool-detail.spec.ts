import { test, expect } from '@playwright/test';

test.use({ serviceWorkers: 'block' });

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
