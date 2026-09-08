import { test, expect } from '@playwright/test';

test.use({ serviceWorkers: 'block' });

test('列表不依賴文章全文，搜尋才補載且仍可開文章', async ({ page }) => {
  let requested = false;
  let release!: () => void;
  const held = new Promise<void>((resolve) => { release = resolve; });
  await page.route('**/posts-*.js', async (route) => {
    requested = true;
    await held;
    await route.continue();
  });
  try {
    await page.goto('blog', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.bp-list-card').first()).toBeVisible({ timeout: 30_000 });
    expect(requested).toBe(false);
    await expect(page.locator('footer')).toHaveCount(1);
    await page.getByRole('tab', { name: /Firebase Hosting/ }).click();
    await expect(page).toHaveURL(/platform=firebase/);
    expect(requested).toBe(false);
    await page.getByRole('tab', { name: /^全部/ }).click();
    await page.getByTestId('blog-search-input').fill('PIRLS');
    await expect(page.getByRole('status')).toContainText('正在補齊全文搜尋');
    await expect.poll(() => requested).toBe(true);
  } finally {
    release();
  }
  await expect(page.getByRole('status')).toHaveCount(0);
  await expect(page.locator('.bp-list-card').first()).toContainText('PIRLS');
  await page.locator('.bp-list-card').first().click();
  await expect(page).toHaveURL(/blog\/.+/);
  await expect(page.locator('footer')).toHaveCount(1);
});
