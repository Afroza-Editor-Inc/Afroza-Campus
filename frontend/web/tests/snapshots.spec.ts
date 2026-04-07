import { test, expect } from '@playwright/test';

test('homepage visual snapshot', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.setViewportSize({ width: 390, height: 844 }); // mobile-like
  const screenshot = await page.screenshot({ fullPage: true });
  await expect(screenshot).toMatchSnapshot('home.full.png');
});
