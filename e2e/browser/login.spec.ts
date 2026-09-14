import { expect, test } from "@playwright/test";
import { loginMessages } from "../../src/content/messages/login";
import { navMessages } from "../../src/content/messages/nav";
import { E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD } from "../support/constants";

test("an unauthenticated visitor is redirected from the admin area to the login page", async ({
  page,
}) => {
  await page.goto("/admin/products");

  await expect(page.getByRole("heading", { name: loginMessages.heading })).toBeVisible();
});

test("a wrong password shows an error and keeps the typed email", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel(loginMessages.email).fill(E2E_ADMIN_EMAIL);
  await page.getByLabel(loginMessages.password).fill("wrong password");
  await page.getByRole("button", { name: loginMessages.submit }).click();

  await expect(page.getByText(loginMessages.invalidCredentials)).toBeVisible();
  await expect(page.getByLabel(loginMessages.email)).toHaveValue(E2E_ADMIN_EMAIL);
});

test("logging out returns the visitor to the login page", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel(loginMessages.email).fill(E2E_ADMIN_EMAIL);
  await page.getByLabel(loginMessages.password).fill(E2E_ADMIN_PASSWORD);
  await page.getByRole("button", { name: loginMessages.submit }).click();
  await expect(page).toHaveURL(/\/admin\/products/);

  await page.getByRole("button", { name: navMessages.logout }).click();

  await expect(page.getByRole("heading", { name: loginMessages.heading })).toBeVisible();
});
