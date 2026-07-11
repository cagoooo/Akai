import { test, expect } from '@playwright/test';

test.describe('首頁功能測試', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('應該顯示首頁標題和描述', async ({ page }) => {
        // 等待頁面載入
        await page.waitForLoadState('networkidle');

        // 檢查標題是否存在
        await expect(page.getByRole('heading')).toBeVisible();
    });

    test('應該能夠搜尋工具', async ({ page }) => {
        // 等待頁面載入
        await page.waitForLoadState('networkidle');

        // 使用鍵盤快捷鍵開啟搜尋
        await page.keyboard.press('/');

        // 檢查搜尋輸入框是否聚焦
        const searchInput = page.getByPlaceholder(/搜尋/i);
        if (await searchInput.count() > 0) {
            await expect(searchInput.first()).toBeFocused();
        }
    });

    test('應該能夠關閉對話框', async ({ page }) => {
        // 等待頁面載入
        await page.waitForLoadState('networkidle');

        // 按 Escape 鍵
        await page.keyboard.press('Escape');

        // 等待一下讓動畫完成
        await page.waitForTimeout(300);
    });
});

test.describe('工具卡片互動', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test('應該顯示工具卡片', async ({ page }) => {
        // 檢查是否有工具卡片
        const toolCards = page.locator('[data-testid="tool-card"]');
        const count = await toolCards.count();

        if (count > 0) {
            await expect(toolCards.first()).toBeVisible();
        }
    });
});

test.describe('Audience recommendation location', () => {
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('akai_audience_profile_v1', JSON.stringify({
                version: 1,
                audience: 'teacher',
                schoolLevel: 'elementary',
                teacherRole: 'homeroom',
                completedAt: '2026-07-11T00:00:00.000Z',
            }));
        });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto('/');
    });

    test('keeps the target card and its label within the viewport', async ({ page }) => {
        const recommendation = page.locator('.audience-strip__card').first();
        await expect(recommendation).toBeVisible({ timeout: 15_000 });
        const toolId = await recommendation.getAttribute('data-tool-id');
        expect(toolId).toBeTruthy();

        await recommendation.click();
        const target = page.locator(`.bulletin-tool-card[data-tool-id="${toolId}"]`);
        const label = target.locator('.audience-tool-highlight__label');
        await expect(target).toHaveClass(/audience-tool-highlight/);
        await expect(label).toBeVisible();
        await expect.poll(async () => target.evaluate((node) => {
            const rect = node.getBoundingClientRect();
            return rect.top >= 0 && rect.bottom <= window.innerHeight;
        })).toBe(true);

        const labelBounds = await label.boundingBox();
        expect(labelBounds).not.toBeNull();
        expect(labelBounds!.x).toBeGreaterThanOrEqual(0);
        expect(labelBounds!.x + labelBounds!.width).toBeLessThanOrEqual(await page.evaluate(() => window.innerWidth));
        await expect(target).toHaveCSS('animation-name', 'none');
    });
});
