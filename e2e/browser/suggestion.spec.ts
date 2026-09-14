import { expect, test } from "@playwright/test";
import { messages } from "../../src/lib/messages";
import { db } from "../support/db";
import { logInThroughUi } from "../support/auth";
import { createProduct, truncateProducts } from "../support/factories";

test.beforeEach(truncateProducts);

test("dismissing a suggestion leaves the editor untouched", async ({ page }) => {
  const product = await createProduct({ description: "Мій опис" });
  await logInThroughUi(page);
  await page.goto(`/admin/products/${product.id}`);

  await page.getByRole("button", { name: messages.suggestion.generate }).click();
  await expect(page.getByRole("heading", { name: messages.suggestion.heading })).toBeVisible();
  await expect(page.getByRole("button", { name: messages.suggestion.dismiss })).toBeVisible();
  await page.getByRole("button", { name: messages.suggestion.dismiss }).click();

  await expect(page.getByLabel(messages.editor.description)).toHaveValue("Мій опис");
});

test("applying a suggestion changes the editor but saves nothing", async ({ page }) => {
  const product = await createProduct({ description: "Мій опис" });
  await logInThroughUi(page);
  await page.goto(`/admin/products/${product.id}`);

  await page.getByRole("button", { name: messages.suggestion.generate }).click();
  await page.getByRole("button", { name: messages.suggestion.apply }).click();

  await expect(page.getByLabel(messages.editor.description)).not.toHaveValue("Мій опис");
  const stored = await db.product.findUniqueOrThrow({ where: { id: product.id } });
  expect(stored.description).toBe("Мій опис");
});

test("the demo mode is visible to the reviewer, not hidden", async ({ page }) => {
  const product = await createProduct();
  await logInThroughUi(page);
  await page.goto(`/admin/products/${product.id}`);

  await page.getByRole("button", { name: messages.suggestion.generate }).click();

  await expect(page.getByText(messages.suggestion.demoBadge)).toBeVisible();
});

test("a suggestion never publishes anything by itself", async ({ page }) => {
  const product = await createProduct({ status: "draft" });
  await logInThroughUi(page);
  await page.goto(`/admin/products/${product.id}`);

  await page.getByRole("button", { name: messages.suggestion.generate }).click();
  await page.getByRole("button", { name: messages.suggestion.apply }).click();

  const stored = await db.product.findUniqueOrThrow({ where: { id: product.id } });
  expect(stored.status).toBe("draft");
});

test("cancelling a running generation returns the button without applying anything", async ({
  page,
}) => {
  const product = await createProduct({ description: "Мій опис" });
  await logInThroughUi(page);
  await page.goto(`/admin/products/${product.id}`);

  await page.getByRole("button", { name: messages.suggestion.generate }).click();
  await page.getByRole("button", { name: messages.suggestion.cancel }).click();

  await expect(page.getByRole("button", { name: messages.suggestion.generate })).toBeVisible();
  await expect(page.getByLabel(messages.editor.description)).toHaveValue("Мій опис");
});
