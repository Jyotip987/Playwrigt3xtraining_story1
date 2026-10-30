import { expect, test } from '@playwright/test';

test('work in a new tab, then return to the original tab', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/windows');

  // Start waiting before clicking so the new tab event is not missed.
  const newTabPromise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'Click Here' }).click();
  const newTab = await newTabPromise;

  // Perform the task in the new tab.
  await expect(newTab.getByRole('heading', { name: 'New Window' })).toBeVisible();

  // The original page fixture still refers to the first tab.
  await page.bringToFront();
  await expect(page.getByRole('heading', { name: 'Opening a new window' })).toBeVisible();
});
