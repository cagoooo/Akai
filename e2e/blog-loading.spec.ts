import { test, expect } from '@playwright/test';

test.use({ serviceWorkers: 'block' });

test('未附音檔的文章不探測 Podcast，有音檔則按播放後才下載', async ({ page }) => {
  const audioRequests: string[] = [];
  page.on('request', request => {
    if (request.url().includes('/blog-podcasts/')) audioRequests.push(request.method());
  });
  await page.goto('blog/cockpit-81-info-tech-class', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.bp-article')).toBeVisible();
  await expect(page.getByTestId('blog-podcast')).toHaveCount(0);
  await page.goto('blog/milestone-100-tools-achieved', { waitUntil: 'domcontentloaded' });
  const player = page.getByTestId('blog-podcast');
  await expect(player).toBeVisible();
  const audio = player.locator('audio');
  await expect(audio).toHaveAttribute('preload', 'none');
  await page.waitForTimeout(500);
  expect(audioRequests).toEqual([]);
  await audio.scrollIntoViewIfNeeded();
  await audio.evaluate(element => (element as HTMLAudioElement).play());
  await expect.poll(() => audio.evaluate(element => (element as HTMLAudioElement).currentTime)).toBeGreaterThan(0);
  await audio.evaluate(element => (element as HTMLAudioElement).pause());
  expect(audioRequests.length).toBeGreaterThan(0);
  expect(audioRequests).not.toContain('HEAD');
});

test('畫面外文章保留連結，捲動、鍵盤與列印皆能顯示', async ({ page }) => {
  await page.goto('blog', { waitUntil: 'domcontentloaded' });
  const cards = page.locator('.bp-list-card');
  await expect(cards.first()).toBeVisible({ timeout: 30_000 });
  const count = await cards.count();
  expect(count).toBeGreaterThan(100);
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await cards.last().scrollIntoViewIfNeeded();
    await expect(cards.last()).toBeInViewport();
    await expect(cards.last().locator('h2, h3').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await cards.first().focus();
    await expect(cards.first()).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(cards.nth(1)).toBeFocused();
    await expect(cards.nth(1)).toBeInViewport();
  }
  await page.emulateMedia({ media: 'print' });
  expect(await cards.last().evaluate(el => getComputedStyle(el.parentElement!).contentVisibility)).toBe('visible');
  await expect(cards).toHaveCount(count);
  await page.emulateMedia({ media: 'screen' });
  await cards.last().click();
  await expect(page).toHaveURL(/blog\/.+/);
  await expect(page.locator('.bp-article')).toBeVisible();
});

test('引言的襯線字型改為自架，不再向 Google 下載十幾包 Noto Serif TC（約 900KB）', async ({ page }) => {
  const googleSerif: string[] = [];
  const selfHosted: string[] = [];
  page.on('request', request => {
    const url = request.url();
    if (/fonts\.gstatic\.com\/s\/notoseriftc/.test(url)) googleSerif.push(url);
    if (/\/fonts\/akai-serif-tc/.test(url)) selfHosted.push(url);
  });
  await page.goto('blog/cockpit-81-info-tech-class', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.bp-article blockquote').first()).toBeVisible();
  await expect.poll(() => selfHosted.length).toBeGreaterThan(0);
  await expect.poll(() => page.evaluate(
    () => [...document.fonts].some(font => font.family === 'Noto Serif TC' && font.status === 'loaded'),
  )).toBe(true);
  expect(googleSerif).toEqual([]);
});

test('列表與文章只載入輕量工具目錄（完整目錄約 469KB）', async ({ page }) => {
  const catalogue: string[] = [];
  page.on('request', request => {
    const file = request.url().match(/\/api\/(tools-lite\.json|tools\.json)/)?.[1];
    if (file) catalogue.push(file);
  });
  await page.goto('blog', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.bp-list-card').first()).toBeVisible({ timeout: 30_000 });
  await expect.poll(() => catalogue.length).toBeGreaterThan(0);
  expect(catalogue).not.toContain('tools.json');
  // 搜尋照常運作（只有存在「無手寫長文的迷你文章」時才會補載完整目錄，所以不在此斷言）
  await page.getByTestId('blog-search-input').fill('駕駛艙');
  await expect(page.locator('.bp-list-card').first()).toBeVisible();

  catalogue.length = 0;
  await page.goto('blog/cockpit-81-info-tech-class', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.bp-article')).toBeVisible();
  await expect.poll(() => catalogue.length).toBeGreaterThan(0); // 相關工具仍會載入，但只讀輕量目錄
  expect(catalogue).not.toContain('tools.json');
});

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
    await expect(page.getByText('按發布日期排序', { exact: true })).toBeVisible();
    await expect(page.locator('.bp-trend-meta .views')).toHaveCount(0);
    await expect(page.getByText('熱搜 #1', { exact: true })).toHaveCount(0);
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
