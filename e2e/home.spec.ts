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
  test('工具牆先畫第一批，捲到底會自動補齊全部卡片', async ({ page }) => {
    await gotoHome(page);
    const cards = page.locator('[data-testid="tool-card"]');
    // 分批顯示（BulletinToolGrid BATCH=24）：首屏只畫第一批
    expect(await cards.count()).toBeGreaterThanOrEqual(24);
    const more = page.getByTestId('tool-grid-more');
    // 一路捲到哨兵，直到全部補完（工具數會持續增加，所以用下限而不是固定值）
    for (let i = 0; i < 20 && (await more.count()) > 0; i++) {
      await more.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
    }
    await expect(more).toHaveCount(0);
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
    // 按 / 是第一個動作時，自動彈窗不可以跳出來把焦點搶走（2026-10-13 實測抓到的問題）
    await page.waitForTimeout(3000);
    await expect(searchInput.first()).toBeFocused();
    await expect(page.locator('.audience-wizard')).toHaveCount(0);
  });

  // 2026-10-13 實驗：推薦精靈在進站第一次渲染就蓋滿畫面，成為手機版 LCP 元素（本機 12.4→6.0 秒）。
  // 改成訪客互動且停手約 1.5 秒後、或完全不互動滿保底時間（60 秒）才自動彈出，且不打斷正在輸入或操作的訪客。
  test('進站時不彈出推薦精靈；第一次互動後才彈出', async ({ page }) => {
    await gotoHome(page);
    await page.waitForTimeout(1500);
    await expect(page.locator('.audience-wizard')).toHaveCount(0);
    await page.keyboard.press('Shift');
    await expect(page.locator('.audience-wizard')).toBeVisible();
  });

  test('完全不互動：Lighthouse 的 45 秒觀察期內不彈，滿 60 秒保底才彈出（不會變成永遠不彈）', async ({ page }) => {
    // 保底若短於 45 秒，Lighthouse 會在觀察期內看到彈窗並把它算成最大內容（2026-10-13 實測 LCP 7.7→10.8 秒）。
    // 用假時鐘快轉，不必真的等 60 秒。
    await page.clock.install();
    await gotoHome(page);
    await expect(page.locator('.audience-wizard')).toHaveCount(0);
    await page.clock.fastForward(46_000);
    await page.waitForTimeout(500);
    await expect(page.locator('.audience-wizard')).toHaveCount(0);
    await page.clock.fastForward(15_000);
    await expect(page.locator('.audience-wizard')).toBeVisible({ timeout: 10_000 });
  });

  test('全新訪客第一次造訪：Service Worker 剛安裝不算「有新版」，閒置也不會被自動重新整理', async ({ page }) => {
    // 2026-10-13：第一次安裝的 SW 啟用訊號曾被當成更新，閒置約 20 秒 + 倒數 8 秒後頁面無故重整。
    // 原本族群精靈一進站就開（持有「暫緩更新」票）剛好擋住它；精靈改為延後彈出後這個問題就浮現：
    // Lighthouse 載入中途被重整，收不到畫面截圖，首頁效能分數變成空值、品質閘門失敗。
    let documentRequests = 0;
    page.on('request', (request) => {
      if (request.resourceType() === 'document' && request.frame() === page.mainFrame()) documentRequests += 1;
    });
    await page.clock.install();
    await gotoHome(page);
    await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller), undefined, { timeout: 30_000 });
    await page.waitForTimeout(1500); // 讓 SW_ACTIVATED 訊號送達
    // CI 的 base 是 /Akai/，goto('/') 會先 302 轉址一次，所以不能拿「文件請求總數 = 1」當標準，改比對頁面載入完成後有沒有新增
    const requestsAfterLoad = documentRequests;
    await page.clock.runFor(40_000); // 閒置 20 秒 + 倒數 8 秒（runFor 會把倒數的每一秒都跑完，fastForward 只會觸發一次）
    await page.waitForTimeout(1500);
    expect(documentRequests).toBe(requestsAfterLoad);
  });

  test('在搜尋框裡操作與打字不會被彈窗打斷', async ({ page }) => {
    await gotoHome(page);
    const input = page.getByRole('searchbox', { name: '搜尋教育工具名稱或描述' });
    await input.click();
    await input.pressSequentially('駕駛艙', { delay: 80 });
    await page.waitForTimeout(1500);
    await expect(page.locator('.audience-wizard')).toHaveCount(0);
    await expect(input).toHaveValue('駕駛艙');
  });

  // 2026-10-13 量測：破百橫幅與最新工具入口晚到，曾讓首頁 CLS 達 0.127（>0.1 即「需要改善」）。
  // 修正後本機為 0；上限抓 0.06，留餘裕給 CI 機器的時序差異，仍能擋下回到 0.09 以上的退步。
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    test(`載入過程中英雄區不被晚到的橫幅或入口往下推（版面位移 CLS，${viewport.width}px）`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.addInitScript(() => {
        const w = window as unknown as { __cls: number };
        w.__cls = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as unknown as Array<{ value: number; hadRecentInput: boolean }>) {
            if (!entry.hadRecentInput) w.__cls += entry.value;
          }
        }).observe({ type: 'layout-shift', buffered: true });
      });
      await gotoHome(page);
      await expect(page.getByTestId('milestone-celebration')).toBeVisible();
      await page.waitForTimeout(2500); // 讓延後載入的區塊與字型都就位
      const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
      expect(cls, `${viewport.width}px 的 CLS`).toBeLessThan(0.06);
    });
  }

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
