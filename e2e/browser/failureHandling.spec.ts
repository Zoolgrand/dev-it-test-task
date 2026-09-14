import { expect, test } from "@playwright/test";
import { catalogMessages } from "../../src/content/messages/catalog";
import { loginMessages } from "../../src/content/messages/login";
import { navMessages } from "../../src/content/messages/nav";
import { logInThroughUi } from "../support/auth";
import { createProduct, truncateProducts } from "../support/factories";
import { E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD } from "../support/constants";

test.beforeEach(truncateProducts);

test("a login request that never reaches the server leaves the form usable", async ({ page }) => {
  await page.goto("/admin/login");
  await page.route("**/api/auth/login", (route) => route.abort("failed"));

  await page.getByLabel(loginMessages.email).fill(E2E_ADMIN_EMAIL);
  await page.getByLabel(loginMessages.password).fill(E2E_ADMIN_PASSWORD);
  await page.getByRole("button", { name: loginMessages.submit }).click();

  await expect(page.getByText(loginMessages.networkError)).toBeVisible();
  await expect(page.getByRole("button", { name: loginMessages.submit })).toBeEnabled();
  await expect(page.getByLabel(loginMessages.email)).toHaveValue(E2E_ADMIN_EMAIL);
});

test("an email the schema rejects never reaches the server", async ({ page }) => {
  let requests = 0;
  await page.goto("/admin/login");
  await page.route("**/api/auth/login", (route) => {
    requests += 1;
    return route.continue();
  });

  await page.getByLabel(loginMessages.email).fill("not-an-email");
  await page.getByLabel(loginMessages.password).fill("whatever");
  await page.getByRole("button", { name: loginMessages.submit }).click();

  await expect(page.getByText(loginMessages.invalidEmail)).toBeVisible();
  expect(requests).toBe(0);
});

test("a logout request in flight cannot be submitted a second time", async ({ page }) => {
  await logInThroughUi(page);
  await page.route("**/api/auth/logout", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return route.continue();
  });

  await page.getByRole("button", { name: navMessages.logout }).click();

  await expect(page.getByRole("button", { name: navMessages.logout })).toBeDisabled();
});

test("a clipboard that refuses the copy tells the visitor instead of failing silently", async ({
  page,
}) => {
  const product = await createProduct({ status: "published", slug: "share-target" });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error("denied")) },
    });
  });
  await page.goto(`/products/${product.slug}`);

  await page.getByRole("button", { name: catalogMessages.share }).click();

  await expect(page.getByText(catalogMessages.linkCopyFailed)).toBeVisible();
});
