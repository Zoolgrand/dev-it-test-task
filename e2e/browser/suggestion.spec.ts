import { expect, test } from "@playwright/test";
import { editorMessages } from "../../src/content/messages/editor";
import { suggestionMessages } from "../../src/content/messages/suggestion";
import { db } from "../support/db";
import { logInThroughUi } from "../support/auth";
import { createProduct, truncateProducts } from "../support/factories";

test.beforeEach(truncateProducts);

test("dismissing a suggestion leaves the editor untouched", async ({ page }) => {
  const product = await createProduct({ description: "Мій опис" });
  await logInThroughUi(page);
  await page.goto(`/admin/products/${product.id}`);

  await page.getByRole("button", { name: suggestionMessages.generate }).click();
  await expect(page.getByRole("heading", { name: suggestionMessages.heading })).toBeVisible();
  await expect(page.getByRole("button", { name: suggestionMessages.dismiss })).toBeVisible();
  await page.getByRole("button", { name: suggestionMessages.dismiss }).click();

  await expect(page.getByLabel(editorMessages.description)).toHaveValue("Мій опис");
});

test("applying a suggestion changes the editor but saves nothing", async ({ page }) => {
  const product = await createProduct({ description: "Мій опис" });
  await logInThroughUi(page);
  await page.goto(`/admin/products/${product.id}`);

  await page.getByRole("button", { name: suggestionMessages.generate }).click();
  await page.getByRole("button", { name: suggestionMessages.apply }).click();

  await expect(page.getByLabel(editorMessages.description)).not.toHaveValue("Мій опис");
  const stored = await db.product.findUniqueOrThrow({ where: { id: product.id } });
  expect(stored.description).toBe("Мій опис");
});

test("the demo mode is visible to the reviewer, not hidden", async ({ page }) => {
  const product = await createProduct();
  await logInThroughUi(page);
  await page.goto(`/admin/products/${product.id}`);

  await page.getByRole("button", { name: suggestionMessages.generate }).click();

  await expect(page.getByText(suggestionMessages.demoBadge)).toBeVisible();
});

test("a suggestion never publishes anything by itself", async ({ page }) => {
  const product = await createProduct({ status: "draft" });
  await logInThroughUi(page);
  await page.goto(`/admin/products/${product.id}`);

  await page.getByRole("button", { name: suggestionMessages.generate }).click();
  await page.getByRole("button", { name: suggestionMessages.apply }).click();

  const stored = await db.product.findUniqueOrThrow({ where: { id: product.id } });
  expect(stored.status).toBe("draft");
});

test("leaving the editor mid-generation cancels the request instead of letting it run on", async ({
  page,
}) => {
  const product = await createProduct();
  await logInThroughUi(page);
  await page.route("**/suggestion", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 10_000));
    return route.continue();
  });
  const aborted: string[] = [];
  page.on("requestfailed", (request) => {
    if (request.url().includes("/suggestion")) {
      aborted.push(request.url());
    }
  });
  await page.goto(`/admin/products/${product.id}`);

  await page.getByRole("button", { name: suggestionMessages.generate }).click();
  await page.getByRole("link", { name: editorMessages.backToList }).click();

  await expect.poll(() => aborted.length, { timeout: 10_000 }).toBeGreaterThan(0);
});

test("cancelling a running generation returns the button without applying anything", async ({
  page,
}) => {
  const product = await createProduct({ description: "Мій опис" });
  await logInThroughUi(page);
  await page.goto(`/admin/products/${product.id}`);

  await page.getByRole("button", { name: suggestionMessages.generate }).click();
  await page.getByRole("button", { name: suggestionMessages.cancel }).click();

  await expect(page.getByRole("button", { name: suggestionMessages.generate })).toBeVisible();
  await expect(page.getByLabel(editorMessages.description)).toHaveValue("Мій опис");
});
