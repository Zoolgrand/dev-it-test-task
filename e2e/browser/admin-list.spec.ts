import { expect, test } from "@playwright/test";
import { messages } from "../../src/lib/messages";
import { logInThroughUi } from "../support/auth";
import { createProduct, truncateProducts } from "../support/factories";

test.beforeEach(truncateProducts);

test("shows draft and published products with status badges and a link to the editor", async ({
  page,
}) => {
  const draft = await createProduct({ name: "Чернетковий товар", status: "draft" });
  const published = await createProduct({ name: "Опублікований товар", status: "published" });
  await logInThroughUi(page);

  await expect(page.getByRole("heading", { name: messages.adminList.heading })).toBeVisible();

  const draftRow = page.getByRole("row", { name: draft.name });
  await expect(draftRow.getByText(messages.status.draft)).toBeVisible();

  const publishedRow = page.getByRole("row", { name: published.name });
  await expect(publishedRow.getByText(messages.status.published)).toBeVisible();

  await draftRow.getByRole("link", { name: messages.adminList.edit }).click();

  await expect(page).toHaveURL(new RegExp(`/admin/products/${draft.id}$`));
});
