import { test, expect } from '@playwright/test';

test('族群精靈關閉後展示最新三張卡；關閉、重看、定位', async ({ page }, testInfo) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const wizard = page.locator('.audience-wizard');
  const showcase = page.locator('.latest-tools-showcase');
  await expect(wizard).toBeVisible();
  await expect(showcase).toHaveCount(0);
  await wizard.getByRole('button', { name: '稍後再說', exact: true }).click();
  await expect(showcase).toBeVisible();
  await expect(showcase.locator('.latest-tools-card')).toHaveCount(3);
  await page.screenshot({ path: testInfo.outputPath('latest-tools-desktop.png') });
  await expect(page.locator('.audience-strip')).toHaveCount(0);
  await showcase.getByRole('button', { name: '先逛逛，稍後再看' }).click();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('.latest-tools-entry button')).toBeVisible();
  await page.waitForTimeout(1800);
  await expect(showcase).toHaveCount(0);
  await page.locator('.latest-tools-entry button').click();
  await expect(showcase).toBeVisible();
  await showcase.locator('.latest-tools-card').first().click();
  await expect(showcase).toHaveCount(0);
  await expect(page.locator('.audience-tool-highlight')).toBeVisible();
});

test('手機回訪直接看新工具；三卡與關閉按鈕均可操作', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => sessionStorage.setItem('akai_audience_wizard_dismissed_v1', '1'));
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const showcase = page.locator('.latest-tools-showcase');
  await expect(showcase).toBeVisible();
  await expect(showcase.locator('.latest-tools-card')).toHaveCount(3);
  const noOverflow = await showcase.evaluate(el => el.scrollWidth <= el.clientWidth);
  expect(noOverflow).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('latest-tools-mobile.png') });
  await showcase.getByRole('button', { name: '先逛逛，稍後再看' }).click();
  await expect(showcase).toHaveCount(0);
});
