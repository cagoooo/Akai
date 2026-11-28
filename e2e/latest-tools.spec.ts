import { test, expect } from '@playwright/test';

// 2026-11-28：自動提示改成角落小便利貼，不再自動打開大視窗；按「看看」或頁首入口才展開三張卡
test('族群精靈關閉後只滑出角落小提示；按看看展開三張卡、回訪不再提示、仍能重看與定位', async ({ page }, testInfo) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const wizard = page.locator('.audience-wizard');
  const showcase = page.locator('.latest-tools-showcase');
  const nudge = page.locator('.latest-tools-nudge');
  // 自動提示不在進站時出現：等第一次互動（停手後）
  await expect(page.locator('.latest-tools-entry button')).toBeVisible();
  await expect(wizard).toHaveCount(0);
  await page.keyboard.press('Shift');
  await expect(wizard).toBeVisible();
  await expect(nudge).toHaveCount(0);
  await wizard.getByRole('button', { name: '稍後再說', exact: true }).click();
  await expect(nudge).toBeVisible();
  await expect(showcase).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath('latest-tools-nudge-desktop.png') });
  await nudge.getByRole('button', { name: /^新上架 \d+ 個工具/ }).click();
  await expect(showcase).toBeVisible();
  await expect(showcase.locator('.latest-tools-card')).toHaveCount(3);
  await page.screenshot({ path: testInfo.outputPath('latest-tools-desktop.png') });
  await showcase.getByRole('button', { name: '先逛逛，稍後再看' }).click();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('.latest-tools-entry button')).toBeVisible();
  await page.keyboard.press('Shift');
  await page.waitForTimeout(3200);
  await expect(nudge).toHaveCount(0);
  await expect(showcase).toHaveCount(0);
  await page.locator('.latest-tools-entry button').click();
  await expect(showcase).toBeVisible();
  await showcase.locator('.latest-tools-card').first().click();
  await expect(showcase).toHaveCount(0);
  await expect(page.locator('.audience-tool-highlight')).toBeVisible();
});

test('手機回訪：小提示貼左下角、不擋右下按鈕，可關閉；入口展開三張卡不溢出', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => sessionStorage.setItem('akai_audience_wizard_dismissed_v1', '1'));
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const showcase = page.locator('.latest-tools-showcase');
  const nudge = page.locator('.latest-tools-nudge');
  await expect(page.locator('.latest-tools-entry button')).toBeVisible();
  await page.keyboard.press('Shift');
  await expect(nudge).toBeVisible();
  await expect(showcase).toHaveCount(0);
  const box = await nudge.boundingBox();
  expect(box && box.x + box.width).toBeLessThanOrEqual(390 - 50);
  await page.screenshot({ path: testInfo.outputPath('latest-tools-nudge-mobile.png') });
  await nudge.getByRole('button', { name: '關閉新上架提示' }).click();
  await expect(nudge).toHaveCount(0);
  await page.locator('.latest-tools-entry button').click();
  await expect(showcase).toBeVisible();
  await expect(showcase.locator('.latest-tools-card')).toHaveCount(3);
  const noOverflow = await showcase.evaluate(el => el.scrollWidth <= el.clientWidth);
  expect(noOverflow).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('latest-tools-mobile.png') });
  await showcase.getByRole('button', { name: '先逛逛，稍後再看' }).click();
  await expect(showcase).toHaveCount(0);
});
