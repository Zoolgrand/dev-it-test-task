import { expect, test } from "@playwright/test";
import { messages } from "../../src/lib/messages";
import { SEO_TITLE_MAX_LENGTH } from "../../src/domain/product/limits";
import { logIn, logInThroughUi } from "../support/auth";
import { createProduct, truncateProducts } from "../support/factories";

test.beforeEach(truncateProducts);

test("a saved description survives a page reload", async ({ page }) => {
  const product = await createProduct({ description: "Старий опис" });
  await logInThroughUi(page);
  await page.goto(`/admin/products/${product.id}`);

  await page.getByLabel(messages.editor.description).fill("Новий опис");
  await page.getByRole("button", { name: messages.editor.save }).click();
  await expect(page.getByRole("button", { name: messages.editor.saved })).toBeVisible();
  await page.reload();

  await expect(page.getByLabel(messages.editor.description)).toHaveValue("Новий опис");
});

test("a rejected save keeps what the user typed and is never shown as success", async ({
  page,
}) => {
  const product = await createProduct();
  await logInThroughUi(page);
  await page.goto(`/admin/products/${product.id}`);
  const tooLong = "я".repeat(SEO_TITLE_MAX_LENGTH + 1);

  await page.getByLabel(messages.editor.seoTitle).fill(tooLong);
  await page.getByRole("button", { name: messages.editor.save }).click();

  await expect(page.getByLabel(messages.editor.seoTitle)).toHaveValue(tooLong);
  await expect(page.getByText(messages.editor.saved)).toBeHidden();
});

test("the save button stays disabled until something changes", async ({ page }) => {
  const product = await createProduct();
  await logInThroughUi(page);
  await page.goto(`/admin/products/${product.id}`);

  await expect(page.getByRole("button", { name: messages.editor.save })).toBeDisabled();

  await page.getByLabel(messages.editor.description).fill("Змінений опис");

  await expect(page.getByRole("button", { name: messages.editor.save })).toBeEnabled();
});

test("the name and the attributes cannot be edited", async ({ page }) => {
  const product = await createProduct({ name: "Незмінна назва" });
  await logInThroughUi(page);
  await page.goto(`/admin/products/${product.id}`);

  await expect(page.getByText("Незмінна назва")).toBeVisible();
  await expect(page.getByRole("textbox", { name: messages.editor.name })).toHaveCount(0);
});

test("the editor is usable on a narrow screen without horizontal scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  const product = await createProduct();
  await logInThroughUi(page);
  await page.goto(`/admin/products/${product.id}`);

  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );

  expect(overflows).toBe(false);
  await expect(page.getByRole("button", { name: messages.editor.save })).toBeVisible();
});

test("a save based on a version another tab already replaced reports a conflict", async ({
  page,
  request,
}) => {
  const product = await createProduct();
  await logInThroughUi(page);
  await page.goto(`/admin/products/${product.id}`);
  const auth = await logIn(request);
  await request.patch(`/api/admin/products/${product.id}`, {
    data: {
      description: "Зміна з іншої вкладки",
      seoTitle: "Заголовок",
      seoDescription: "Опис",
      status: "draft",
      expectedUpdatedAt: product.updatedAt.toISOString(),
    },
    headers: { cookie: auth.cookie },
  });

  await page.getByLabel(messages.editor.description).fill("Зміна з цієї вкладки");
  await page.getByRole("button", { name: messages.editor.save }).click();

  await expect(page.getByText(messages.editor.conflict)).toBeVisible();
});
