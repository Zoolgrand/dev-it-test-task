import { expect, test } from "@playwright/test";
import { messages } from "../../src/lib/messages";
import { E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD } from "../support/constants";

test("an unauthenticated visitor is redirected from the admin area to the login page", async ({
  page,
}) => {
  await page.goto("/admin/products");

  await expect(page.getByRole("heading", { name: messages.login.heading })).toBeVisible();
});

test("a wrong password shows an error and keeps the typed email", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel(messages.login.email).fill(E2E_ADMIN_EMAIL);
  await page.getByLabel(messages.login.password).fill("wrong password");
  await page.getByRole("button", { name: messages.login.submit }).click();

  await expect(page.getByText(messages.login.invalidCredentials)).toBeVisible();
  await expect(page.getByLabel(messages.login.email)).toHaveValue(E2E_ADMIN_EMAIL);
});

test("logging out returns the visitor to the login page", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel(messages.login.email).fill(E2E_ADMIN_EMAIL);
  await page.getByLabel(messages.login.password).fill(E2E_ADMIN_PASSWORD);
  await page.getByRole("button", { name: messages.login.submit }).click();
  await expect(page).toHaveURL(/\/admin\/products/);

  await page.getByRole("button", { name: messages.nav.logout }).click();

  await expect(page.getByRole("heading", { name: messages.login.heading })).toBeVisible();
});
