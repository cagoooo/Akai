import { test, expect, type Page } from '@playwright/test';

/**
 * 首頁冒煙測試。
 *
 * ⚠️ 不可使用 waitForLoadState('networkidle')：
 *   首頁的訪客計數器用 Firestore onSnapshot 開長連線，networkidle 永遠不會發生，
 *   測試會卡到逾時（2026-09-06 實測 5 個測試有 4 個因此失敗，
 *   也是這套 E2E 長期沒被接進 CI 的原因之一）。
 *   改成等 DOM 就緒 + 等真正在意的元素出現。
 */
async function gotoHome(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  // 工具牆是首頁的主體，它出現就代表 React 已掛載完成
  await expect(page.locator('[data-testid="tool-card"]').first()).toBeVisible({ timeout: 30_000 });
}

/** 統計卡是刻意延後掛載的（DeferUntilVisible），要先捲到頁面下方才會出現 */
async function revealSiteStats(page: Page) {
  // 不能用 scrollHeight 的百分比：工具牆有 126 張卡、整頁 1.7 萬 px，
  // 統計卡其實在偏上方（y≈1500），按比例捲會直接衝過頭。用 #blog 錨點定位最穩。
  await page.evaluate(() => {
    const blog = document.getElementById('blog');
    if (blog) blog.scrollIntoView({ block: 'center' });
    else window.scrollTo(0, 1500);
  });
  const stats = page.locator('[data-testid="site-stats"]');
  await expect(stats).toBeVisible({ timeout: 30_000 });
  return stats;
}

test.describe('首頁冒煙測試', () => {
  test('工具牆有渲染出卡片', async ({ page }) => {
    await gotoHome(page);
    const cards = page.locator('[data-testid="tool-card"]');
    // 工具數會持續增加，所以用下限而不是固定值
    expect(await cards.count()).toBeGreaterThan(100);
  });

  test('主要區塊都有出現（防止元件被改成延後載入後靜默消失）', async ({ page }) => {
    await gotoHome(page);
    await expect(page.locator('[data-testid="quick-nav"]')).toBeVisible({ timeout: 30_000 });
    await revealSiteStats(page);
  });

  test('統計卡的圓餅圖能正常載入', async ({ page }) => {
    // 這條專門守 DeferUntilVisible：圖表庫是動態載入的，
    // 一旦延後載入邏輯壞掉，這裡會直接紅燈，不必等人工在瀏覽器上發現。
    await gotoHome(page);
    const stats = await revealSiteStats(page);
    await expect(stats.locator('svg').first()).toBeVisible({ timeout: 30_000 });
  });

  test('按 / 可以聚焦搜尋框', async ({ page }) => {
    await gotoHome(page);
    await page.keyboard.press('/');
    const searchInput = page.getByPlaceholder(/搜尋/);
    await expect(searchInput.first()).toBeFocused({ timeout: 10_000 });
  });

  test('工具卡片有「閱讀文章」連結指向手寫長文', async ({ page }) => {
    // 守 blogLinks → postsIndex 這條路徑：索引若沒同步，按鈕會整批消失
    await gotoHome(page);
    const blogLinks = page.locator('a[href*="/blog/"]');
    expect(await blogLinks.count()).toBeGreaterThan(0);
  });
});

test.describe('客群推薦定位', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'akai_audience_profile_v1',
        JSON.stringify({
          version: 1,
          audience: 'teacher',
          schoolLevel: 'elementary',
          teacherRole: 'homeroom',
          completedAt: '2026-07-11T00:00:00.000Z',
        }),
      );
    });
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('點推薦卡後，目標卡片與標籤都留在視窗內', async ({ page }) => {
    await gotoHome(page);
    const recommendation = page.locator('.audience-strip__card').first();
    await expect(recommendation).toBeVisible({ timeout: 30_000 });
    const toolId = await recommendation.getAttribute('data-tool-id');
    expect(toolId).toBeTruthy();

    /**
     * 推薦清單會隨 Firestore 即時點擊數重新排序，`.first()` 指到的節點會被不斷抽換：
     *   - 一般 click → Playwright 的 "stable" 檢查永遠不通過，重試到逾時
     *   - force click → 座標點在卡片移動前的位置，實測會點空、handler 根本沒執行
     * 這是產品特性（即時推薦）不是 bug，所以直接在節點上觸發 DOM click，不受位移影響。
     */
    const card = page.locator(`.audience-strip__card[data-tool-id="${toolId}"]`).first();
    await card.evaluate((el: HTMLElement) => el.click());
    const target = page.locator(`.bulletin-tool-card[data-tool-id="${toolId}"]`);
    const label = target.locator('.audience-tool-highlight__label');
    await expect(target).toHaveClass(/audience-tool-highlight/);
    await expect(label).toBeVisible();

    await expect
      .poll(() =>
        target.evaluate((node) => {
          const rect = node.getBoundingClientRect();
          return rect.top >= 0 && rect.bottom <= window.innerHeight;
        }),
      )
      .toBe(true);

    const labelBounds = await label.boundingBox();
    expect(labelBounds).not.toBeNull();
    expect(labelBounds!.x).toBeGreaterThanOrEqual(0);
    expect(labelBounds!.x + labelBounds!.width).toBeLessThanOrEqual(
      await page.evaluate(() => window.innerWidth),
    );
    await expect(target).toHaveCSS('animation-name', 'none');
  });
});
