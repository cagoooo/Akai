import { test, expect, type Page } from '@playwright/test';

test.use({ serviceWorkers: 'block' });

async function openSearchPage(page: Page, width: number) {
  await page.setViewportSize({ width, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    sessionStorage.setItem('akai_audience_wizard_dismissed_v1', '1');
    localStorage.setItem('hasCompletedSiteTour', 'true');
  });
  await page.goto('./?q=', { waitUntil: 'domcontentloaded' });
  await page.locator('.bulletin-tool-card').first().waitFor();
  await page.evaluate(() => window.scrollTo(0, 0));
}

for (const width of [1280, 390]) {
  test(`輸入關鍵字自動捲動，搜尋列常駐且結果不被遮住（${width}px）`, async ({ page }) => {
    await openSearchPage(page, width);
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

  test(`中文組字完成後才自動捲動（${width}px）`, async ({ page }) => {
    await openSearchPage(page, width);
    const input = page.getByRole('searchbox', { name: '搜尋教育工具名稱或描述' });
    await input.focus();
    await input.evaluate((element: HTMLInputElement) => {
      element.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(element, '石');
      element.dispatchEvent(new InputEvent('input', { bubbles: true, data: '石', isComposing: true }));
    });
    await expect(input).toHaveValue('石');
    // 超過輸入防抖與現有捲動延遲，確認組字過程不會讓畫面先移走。
    await page.waitForTimeout(700);
    expect(await page.evaluate(() => window.scrollY)).toBeLessThan(50);

    await input.evaluate((element: HTMLInputElement) => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(element, '石門・校園漫遊');
      element.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '石門・校園漫遊' }));
      element.dispatchEvent(new InputEvent('input', { bubbles: true, data: '石門・校園漫遊', isComposing: false }));
    });
    const result = page.locator('.bulletin-tool-card[data-tool-id="128"]');
    await expect(result).toBeInViewport();
    await expect(input).toBeFocused();
    await expect.poll(async () => {
      const resultTop = await result.evaluate(el => el.getBoundingClientRect().top);
      const barBottom = await page.locator('.bulletin-searchbar').evaluate(el => el.getBoundingClientRect().bottom);
      return resultTop >= barBottom;
    }).toBe(true);
  });

  test(`清空關鍵字會取消尚未執行的自動捲動（${width}px）`, async ({ page }) => {
    await openSearchPage(page, width);
    const input = page.getByRole('searchbox', { name: '搜尋教育工具名稱或描述' });
    await input.fill('石門・校園漫遊');
    await page.getByRole('button', { name: '清除搜尋' }).click();
    await expect(input).toHaveValue('');
    await expect(input).toBeFocused();
    await page.waitForTimeout(700);
    expect(await page.evaluate(() => window.scrollY)).toBeLessThan(50);
    await expect.poll(() => page.locator('.bulletin-tool-card').count()).toBeGreaterThan(1);
  });

  test(`找不到工具時仍自動捲到提示且不被搜尋列遮住（${width}px）`, async ({ page }) => {
    await openSearchPage(page, width);
    const input = page.getByRole('searchbox', { name: '搜尋教育工具名稱或描述' });
    await input.fill('完全不存在的工具關鍵字7c91f0');
    const emptyResult = page.locator('[data-tour="tools-grid"]');
    await expect(page.locator('.bulletin-tool-card')).toHaveCount(0);
    await expect(emptyResult).toHaveText('📌 公佈欄上還沒有符合條件的工具');
    await expect(emptyResult).toBeInViewport();
    await expect(input).toBeFocused();
    await expect.poll(async () => {
      const resultTop = await emptyResult.evaluate(el => el.getBoundingClientRect().top);
      const barBottom = await page.locator('.bulletin-searchbar').evaluate(el => el.getBoundingClientRect().bottom);
      return resultTop >= barBottom;
    }).toBe(true);
  });
}
