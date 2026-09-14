import { expect, test } from "@playwright/test";
import { catalogMessages } from "../../src/content/messages/catalog";
import { db } from "../support/db";
import { logIn } from "../support/auth";
import { createProduct, truncateProducts } from "../support/factories";

test.beforeEach(truncateProducts);

test("publishing a product makes it appear in the catalogue", async ({ page, request }) => {
  const product = await createProduct({ status: "draft", name: "Новий товар" });
  const auth = await logIn(request);
  await request.patch(`/api/admin/products/${product.id}`, {
    data: {
      description: "Опис",
      seoTitle: "Заголовок",
      seoDescription: "Опис для пошуку",
      status: "published",
      expectedUpdatedAt: product.updatedAt.toISOString(),
    },
    headers: { cookie: auth.cookie },
  });

  await page.goto("/");

  await expect(page.getByRole("link", { name: "Новий товар" })).toBeVisible();
});

test("unpublishing a product removes it from the catalogue and from its own url", async ({
  page,
  request,
}) => {
  const product = await createProduct({ status: "published", slug: "znyatyi-tovar" });
  const auth = await logIn(request);
  const fresh = await db.product.findUniqueOrThrow({ where: { id: product.id } });
  await request.patch(`/api/admin/products/${product.id}`, {
    data: {
      description: "Опис",
      seoTitle: "Заголовок",
      seoDescription: "Опис для пошуку",
      status: "draft",
      expectedUpdatedAt: fresh.updatedAt.toISOString(),
    },
    headers: { cookie: auth.cookie },
  });

  const response = await page.goto("/products/znyatyi-tovar");

  expect(response?.status()).toBe(404);
});

test("stored content is shown as text and never executed as code", async ({ page }) => {
  const dialogs: string[] = [];
  page.on("dialog", (dialog) => {
    dialogs.push(dialog.message());
    void dialog.dismiss();
  });
  const product = await createProduct({
    status: "published",
    slug: "nebezpechnyi-opys",
    description: "<script>alert(1)</script>",
  });

  await page.goto(`/products/${product.slug}`);

  await expect(page.getByText("<script>alert(1)</script>")).toBeVisible();
  expect(dialogs).toEqual([]);
});

test("the page title and description come from the seo fields", async ({ page }) => {
  const product = await createProduct({
    status: "published",
    slug: "seo-tovar",
    seoTitle: "Унікальний SEO-заголовок",
    seoDescription: "Унікальний SEO-опис",
  });

  await page.goto(`/products/${product.slug}`);

  await expect(page).toHaveTitle("Унікальний SEO-заголовок");
  const description = page.locator('meta[name="description"]');
  await expect(description).toHaveAttribute("content", "Унікальний SEO-опис");
});

test("the catalogue has no horizontal scrolling on a narrow screen", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await createProduct({ status: "published" });

  await page.goto("/");

  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflows).toBe(false);
});

test("an empty catalogue explains itself instead of showing a blank page", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText(catalogMessages.empty)).toBeVisible();
});
