import { expect, test } from "@playwright/test";
import { ADMIN_PAGE_SIZE } from "../../src/domain/api/pagination";
import { adminListMessages } from "../../src/content/messages/adminList";
import { statusMessages } from "../../src/content/messages/status";
import { logInThroughUi } from "../support/auth";
import { createProduct, truncateProducts } from "../support/factories";

test.beforeEach(truncateProducts);

test("shows draft and published products with status badges and a link to the editor", async ({
  page,
}) => {
  const draft = await createProduct({ name: "Чернетковий товар", status: "draft" });
  const published = await createProduct({ name: "Опублікований товар", status: "published" });
  await logInThroughUi(page);

  await expect(page.getByRole("heading", { name: adminListMessages.heading })).toBeVisible();

  const draftRow = page.getByRole("row", { name: draft.name });
  await expect(draftRow.getByText(statusMessages.draft)).toBeVisible();

  const publishedRow = page.getByRole("row", { name: published.name });
  await expect(publishedRow.getByText(statusMessages.published)).toBeVisible();

  await draftRow.getByRole("link", { name: adminListMessages.edit }).click();

  await expect(page).toHaveURL(new RegExp(`/admin/products/${draft.id}$`));
});

test("loads one page of products at a time instead of the whole catalogue", async ({ page }) => {
  for (let index = 0; index < ADMIN_PAGE_SIZE + 1; index += 1) {
    await createProduct({ name: `Товар ${index}`, slug: `tovar-${index}`, status: "published" });
  }
  await logInThroughUi(page);

  const editLinks = page.getByRole("table").getByRole("link", { name: adminListMessages.edit });

  await expect(editLinks).toHaveCount(ADMIN_PAGE_SIZE);
});

test("the next page reaches the products the first page left out", async ({ page }) => {
  for (let index = 0; index < ADMIN_PAGE_SIZE + 1; index += 1) {
    await createProduct({ name: `Товар ${index}`, slug: `tovar-${index}`, status: "published" });
  }
  await logInThroughUi(page);

  await page.getByRole("link", { name: adminListMessages.nextPage }).click();

  const editLinks = page.getByRole("table").getByRole("link", { name: adminListMessages.edit });

  await expect(editLinks).toHaveCount(1);
  await expect(page.getByRole("link", { name: adminListMessages.nextPage })).toBeHidden();
});

test("offers no page navigation when everything fits on one page", async ({ page }) => {
  await createProduct({ name: "Єдиний товар", status: "published" });
  await logInThroughUi(page);

  await expect(page.getByRole("link", { name: adminListMessages.nextPage })).toBeHidden();
  await expect(page.getByRole("link", { name: adminListMessages.previousPage })).toBeHidden();
});

test("runs the admin list without tripping the content security policy", async ({ page }) => {
  await createProduct({ name: "Єдиний товар", status: "published" });
  const refusals: string[] = [];
  page.on("console", (message) => {
    if (message.text().includes("Content Security Policy")) {
      refusals.push(message.text());
    }
  });

  await logInThroughUi(page);

  await expect(page.getByRole("heading", { name: adminListMessages.heading })).toBeVisible();
  expect(refusals).toEqual([]);
});

test("keeps the search term while moving to the next page", async ({ page }) => {
  for (let index = 0; index < ADMIN_PAGE_SIZE + 1; index += 1) {
    await createProduct({ name: `Кухоль ${index}`, slug: `kuhol-${index}`, status: "published" });
  }
  await createProduct({ name: "Зовсім інший", slug: "inshyi", status: "published" });
  await logInThroughUi(page);

  await page.goto("/admin/products?q=Кухоль");
  await page.getByRole("link", { name: adminListMessages.nextPage }).click();

  await expect(page).toHaveURL(/q=/);
  await expect(
    page.getByRole("table").getByRole("link", { name: adminListMessages.edit }),
  ).toHaveCount(1);
});
