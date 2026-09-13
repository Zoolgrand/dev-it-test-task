import { expect, test } from "@playwright/test";

test("home page renders with a non-empty title", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/.+/);
});

test("home page has no horizontal overflow at 375px", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 720 });
  await page.goto("/");

  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );

  expect(overflows).toBe(false);
});
