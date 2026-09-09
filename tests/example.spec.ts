import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);
});

test('worker responde OK', async ({ request }) => {
  const res = await request.get('https://codestudio-oauth.urraburunicolas.workers.dev/');
  expect(res.status()).toBe(200);
  expect(await res.text()).toBe('codestudio-oauth worker OK');
});
