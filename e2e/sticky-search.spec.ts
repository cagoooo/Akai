import { test, expect } from '@playwright/test';

test.use({ serviceWorkers: 'block' });
for (const width of [1280, 390]) {
  test(`搜尋列首屏及捲動後常駐，搜尋結果不被遮住（${width}px）`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => {
      sessionStorage.setItem('akai_audience_wizard_dismissed_v1', '1');
      localStorage.setItem('hasCompletedSiteTour', 'true');
    });
    await page.goto('./?q=', { waitUntil: 'domcontentloaded' });
    const bar = page.locator('.bulletin-searchbar');
    const input = page.getByRole('searchbox', { name: '搜尋教育工具名稱或描述' });
    await expect(input).toBeVisible();
    await expect.poll(() => bar.evaluate(el => el.getBoundingClientRect().top)).toBeLessThan(50);
    await page.locator('.bulletin-tool-card').first().waitFor();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect.poll(() => bar.evaluate(el => el.getBoundingClientRect().top)).toBeLessThan(50);
    const bounds = await bar.boundingBox();
    expect(bounds!.y).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
    await input.fill('石門・校園漫遊');
    await input.press('Enter');
    const result = page.locator('.bulletin-tool-card[data-tool-id="128"]');
    await expect(result).toBeVisible();
    await expect(result).toBeInViewport();
    await expect.poll(async () => {
      const resultTop = await result.evaluate(el => el.getBoundingClientRect().top);
      const barBottom = await bar.evaluate(el => el.getBoundingClientRect().bottom);
      return resultTop >= barBottom;
    }).toBe(true);
    await page.getByRole('button', { name: '清除搜尋' }).click();
    await expect(input).toHaveValue('');
    await expect(input).toBeFocused();
    await expect.poll(() => page.locator('.bulletin-tool-card').count()).toBeGreaterThan(1);
  });
}
