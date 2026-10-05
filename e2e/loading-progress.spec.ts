import { test, expect } from '@playwright/test';

test.use({ serviceWorkers: 'block' });
test('手機載入階段會前進，完成後移除，減少動態設定生效', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  let releasePage!: () => void;
  let releaseBody!: () => void;
  const pageHeld = new Promise<void>(resolve => { releasePage = resolve; });
  const bodyHeld = new Promise<void>(resolve => { releaseBody = resolve; });
  await page.route('**/BlogPost-*.js', async route => { await pageHeld; await route.continue(); });
  await page.route('**/shimen-campus-128-3d-campus-exploration-*.js', async route => { await bodyHeld; await route.continue(); });
  const progress = page.getByRole('progressbar', { name: '內容載入進度' });
  try {
    await page.goto('blog/shimen-campus-128-3d-campus-exploration/', { waitUntil: 'domcontentloaded' });
    await expect(progress).toHaveAttribute('aria-valuenow', '1');
    expect(await page.locator('.loading-progress').evaluate(el => el.getBoundingClientRect().right)).toBeLessThanOrEqual(390);
    expect(await page.locator('.loading-progress__fill').evaluate(el => getComputedStyle(el, '::after').animationName)).toBe('none');
    releasePage();
    await expect(progress).toHaveAttribute('aria-valuenow', '2');
    releaseBody();
    await expect(page.locator('.bp-article h2').first()).toBeVisible();
    await expect(progress).toHaveCount(0);
  } finally {
    releasePage();
    releaseBody();
  }
});
